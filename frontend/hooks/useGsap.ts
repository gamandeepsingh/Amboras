'use client';
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export function useGsapCounter(targetValue: number, duration = 1.4): number {
  const [displayValue, setDisplayValue] = useState(0);
  const tweenRef = useRef<ReturnType<typeof import('gsap').gsap.to> | null>(null);
  const counterRef = useRef({ value: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;

    import('gsap').then(({ gsap }) => {
      if (cancelled) return;
      tweenRef.current?.kill();
      counterRef.current.value = 0;
      tweenRef.current = gsap.to(counterRef.current, {
        value: targetValue,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          if (!cancelled) setDisplayValue(counterRef.current.value);
        },
      });
    });

    return () => {
      cancelled = true;
      tweenRef.current?.kill();
    };
  }, [targetValue, duration]);

  return displayValue;
}

export function useGsapStagger(
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
  fromVars: Record<string, unknown>,
  trigger: unknown,
  stagger = 0.08,
) {
  useEffect(() => {
    if (!containerRef.current || !trigger) return;

    import('gsap').then(({ gsap }) => {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          selector,
          fromVars,
          { opacity: 1, y: 0, x: 0, duration: 0.5, ease: 'power2.out', stagger },
        );
      }, containerRef);
      return () => ctx.revert();
    });
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps
}
