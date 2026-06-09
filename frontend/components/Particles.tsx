"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface Dot {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

export function Particles({ count = 40 }: { count?: number }) {
  const dots = useMemo<Dot[]>(() => {
    // Deterministic pseudo-random so SSR and client match.
    const out: Dot[] = [];
    let seed = 1337;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < count; i++) {
      out.push({
        id: i,
        left: rand() * 100,
        top: rand() * 100,
        size: 1 + rand() * 3,
        delay: rand() * 5,
        duration: 6 + rand() * 8,
        opacity: 0.2 + rand() * 0.5,
      });
    }
    return out;
  }, [count]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-accent"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [d.opacity * 0.3, d.opacity, d.opacity * 0.3],
          }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
