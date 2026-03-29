import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PRODUCTS = [
  'prod_001', 'prod_002', 'prod_003', 'prod_004', 'prod_005',
  'prod_006', 'prod_007', 'prod_008', 'prod_009', 'prod_010',
  'prod_011', 'prod_012', 'prod_013', 'prod_014', 'prod_015',
];

const PRODUCT_NAMES: Record<string, string> = {
  prod_001: 'Wireless Noise-Cancelling Headphones',
  prod_002: 'Ergonomic Standing Desk Mat',
  prod_003: 'Mechanical Keyboard Pro',
  prod_004: 'USB-C Hub 7-in-1',
  prod_005: 'Portable SSD 1TB',
  prod_006: 'Smart Water Bottle',
  prod_007: 'Laptop Stand Adjustable',
  prod_008: 'Webcam 4K Ultra HD',
  prod_009: 'Cable Management Kit',
  prod_010: 'LED Desk Lamp',
  prod_011: 'Wireless Charging Pad',
  prod_012: 'Blue Light Blocking Glasses',
  prod_013: 'Noise Machine Sleep Aid',
  prod_014: 'Monitor Light Bar',
  prod_015: 'Desk Organizer Premium',
};

const CUSTOMER_NAMES = [
  'Alex Johnson', 'Sam Rivera', 'Taylor Kim', 'Jordan Lee', 'Casey Morgan',
  'Riley Chen', 'Quinn Davis', 'Avery Smith', 'Cameron Wilson', 'Morgan Brown',
  'Drew Martinez', 'Blake Anderson', 'Jamie Taylor', 'Skylar Thomas', 'Reese Jackson',
  'Peyton White', 'Dakota Harris', 'Hayden Clark', 'Rowan Lewis', 'Finley Walker',
];

const COUNTRIES = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'SG', 'IN', 'BR'];
const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', DE: '🇩🇪',
  FR: '🇫🇷', JP: '🇯🇵', SG: '🇸🇬', IN: '🇮🇳', BR: '🇧🇷',
};

const EVENT_TYPES = ['page_view', 'add_to_cart', 'remove_from_cart', 'checkout_started', 'purchase'];
const EVENT_WEIGHTS = [0.50, 0.25, 0.05, 0.10, 0.10];

function weightedRandom(items: string[], weights: number[]): string {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i];
    if (r < cumulative) return items[i];
  }
  return items[items.length - 1];
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomDate(daysBack: number): Date {
  // Weight toward recent days for realistic data
  const weight = Math.pow(Math.random(), 0.7);
  const msBack = weight * daysBack * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - msBack);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  console.log('🌱 Seeding database...');

  // Create stores
  const store1 = await prisma.store.upsert({
    where: { id: 'aaaaaaaa-0000-0000-0000-000000000001' },
    create: { id: 'aaaaaaaa-0000-0000-0000-000000000001', name: 'Acme Goods' },
    update: { name: 'Acme Goods' },
  });

  const store2 = await prisma.store.upsert({
    where: { id: 'aaaaaaaa-0000-0000-0000-000000000002' },
    create: { id: 'aaaaaaaa-0000-0000-0000-000000000002', name: 'Beta Shop' },
    update: { name: 'Beta Shop' },
  });

  console.log('✅ Stores created');

  // Create users
  const password = await bcrypt.hash('demo1234', 10);

  await prisma.user.upsert({
    where: { email: 'store1@demo.com' },
    create: { email: 'store1@demo.com', password, storeId: store1.id },
    update: { password, storeId: store1.id },
  });

  await prisma.user.upsert({
    where: { email: 'store2@demo.com' },
    create: { email: 'store2@demo.com', password, storeId: store2.id },
    update: { password, storeId: store2.id },
  });

  console.log('✅ Users created (store1@demo.com, store2@demo.com / demo1234)');

  // Seed events for both stores
  for (const store of [store1, store2]) {
    console.log(`📦 Seeding events for ${store.name}...`);

    // Delete existing events for idempotency
    await prisma.event.deleteMany({ where: { storeId: store.id } });

    const events: Prisma.EventCreateManyInput[] = [];
    for (let i = 0; i < 1200; i++) {
      const eventType = weightedRandom(EVENT_TYPES, EVENT_WEIGHTS);
      const product = pick(PRODUCTS);
      const country = pick(COUNTRIES);
      const customer = pick(CUSTOMER_NAMES);

      const data: Record<string, string | number> = {
        customer_name: customer,
        country,
        country_flag: COUNTRY_FLAGS[country],
        product_id: product,
        product_name: PRODUCT_NAMES[product],
      };

      if (eventType === 'purchase') {
        data.amount = parseFloat(randomBetween(9.99, 299.99).toFixed(2));
        data.currency = 'USD';
      } else if (eventType === 'add_to_cart' || eventType === 'checkout_started') {
        data.amount = parseFloat(randomBetween(9.99, 299.99).toFixed(2));
      }

      events.push({
        eventId: `evt_${store.id.slice(0, 8)}_${i}_${Date.now()}`,
        storeId: store.id,
        eventType,
        timestamp: randomDate(30),
        data: data as Prisma.InputJsonValue,
      });
    }

    await prisma.event.createMany({ data: events });
    console.log(`  ✅ 1200 events seeded for ${store.name}`);
  }

  console.log('\n🎉 Seed complete!');
  console.log('   store1@demo.com / demo1234 → Acme Goods');
  console.log('   store2@demo.com / demo1234 → Beta Shop');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
