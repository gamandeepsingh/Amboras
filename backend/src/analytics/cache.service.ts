import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private store = new Map<string, CacheEntry<unknown>>();
  private redis: Redis | null = null;

  constructor(private config: ConfigService) {
    const rawRedisUrl = this.config.get<string>('REDIS_URL')?.trim();
    if (!rawRedisUrl) return;

    let redisUrl = rawRedisUrl;
    if (redisUrl.startsWith('http://')) {
      redisUrl = redisUrl.replace('http://', 'redis://');
      this.logger.warn(
        'REDIS_URL should use redis://, auto-corrected from http://',
      );
    } else if (redisUrl.startsWith('https://')) {
      redisUrl = redisUrl.replace('https://', 'rediss://');
      this.logger.warn(
        'REDIS_URL should use rediss://, auto-corrected from https://',
      );
    }

    this.redis = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });

    this.redis.on('error', (err) => {
      this.logger.warn(
        `Redis unavailable, using in-memory cache fallback: ${err.message}`,
      );
    });

    void this.redis
      .connect()
      .then(() => {
        this.logger.log('Redis cache connected');
      })
      .catch((err: Error) => {
        this.logger.warn(
          `Redis connection failed, using in-memory cache fallback: ${err.message}`,
        );
      });
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.redis) {
      try {
        const cached = await this.redis.get(key);
        if (cached) return JSON.parse(cached) as T;
      } catch {
        // Best-effort fallback to in-memory cache
      }
    }

    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  async set<T>(key: string, data: T, ttlMs: number): Promise<void> {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });

    if (this.redis) {
      try {
        await this.redis.set(key, JSON.stringify(data), 'PX', ttlMs);
      } catch {
        // Best-effort fallback to in-memory cache
      }
    }
  }

  async invalidatePrefix(prefix: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }

    if (!this.redis) return;

    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          `${prefix}*`,
          'COUNT',
          '100',
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } while (cursor !== '0');
    } catch {
      // Best-effort fallback to in-memory cache
    }
  }

  async onModuleDestroy() {
    if (!this.redis) return;
    await this.redis.quit().catch(() => undefined);
  }
}
