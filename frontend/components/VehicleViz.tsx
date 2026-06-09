"use client";

import { motion } from "framer-motion";

interface DetBox {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  delay: number;
}

const boxes: DetBox[] = [
  { x: 60, y: 150, w: 110, h: 70, label: "car 0.94", delay: 0.2 },
  { x: 220, y: 130, w: 150, h: 95, label: "truck 0.88", delay: 0.6 },
  { x: 420, y: 165, w: 90, h: 60, label: "car 0.91", delay: 1.0 },
  { x: 540, y: 145, w: 70, h: 50, label: "moto 0.79", delay: 1.4 },
];

/**
 * Stylized foggy traffic scene with a sweeping detection scan line and
 * animated bounding boxes. Pure SVG/CSS — no external assets.
 */
export function VehicleViz() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl glass shadow-card">
      <div className="relative aspect-[16/10] w-full">
        <svg
          viewBox="0 0 700 437"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b1226" />
              <stop offset="100%" stopColor="#101a33" />
            </linearGradient>
            <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d1528" />
              <stop offset="100%" stopColor="#060b17" />
            </linearGradient>
            <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(148,163,184,0)" />
              <stop offset="100%" stopColor="rgba(148,163,184,0.25)" />
            </linearGradient>
            <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(6,182,212,0)" />
              <stop offset="100%" stopColor="rgba(6,182,212,0.7)" />
            </linearGradient>
          </defs>

          {/* sky + ground */}
          <rect width="700" height="280" fill="url(#sky)" />
          <rect y="280" width="700" height="157" fill="url(#road)" />

          {/* horizon road perspective */}
          <polygon points="300,280 400,280 560,437 140,437" fill="#0a1120" />
          <line
            x1="350"
            y1="280"
            x2="350"
            y2="437"
            stroke="#1e293b"
            strokeWidth="3"
            strokeDasharray="14 18"
          />

          {/* vehicle silhouettes */}
          {boxes.map((b, i) => (
            <rect
              key={`v-${i}`}
              x={b.x + 6}
              y={b.y + 14}
              width={b.w - 12}
              height={b.h - 16}
              rx="8"
              fill="#1f2937"
              opacity="0.85"
            />
          ))}

          {/* fog overlay */}
          <rect width="700" height="437" fill="url(#fog)" opacity="0.7" />

          {/* sweeping scan band */}
          <motion.rect
            x="0"
            width="700"
            height="60"
            fill="url(#scanGrad)"
            initial={{ y: 0 }}
            animate={{ y: [0, 377, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.line
            x1="0"
            x2="700"
            stroke="#06B6D4"
            strokeWidth="2"
            initial={{ y: 60 }}
            animate={{ y: [60, 437, 60] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* detection boxes */}
          {boxes.map((b, i) => (
            <motion.g
              key={`b-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: b.delay,
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 2.5,
              }}
            >
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                rx="4"
                fill="rgba(59,130,246,0.08)"
                stroke="#3B82F6"
                strokeWidth="2"
              />
              <rect
                x={b.x}
                y={b.y - 18}
                width={b.label.length * 7 + 12}
                height="18"
                rx="3"
                fill="#3B82F6"
              />
              <text
                x={b.x + 6}
                y={b.y - 5}
                fill="white"
                fontSize="11"
                fontFamily="monospace"
              >
                {b.label}
              </text>
            </motion.g>
          ))}
        </svg>

        {/* corner HUD */}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-accent backdrop-blur">
          <span className="h-2 w-2 animate-pulseGlow rounded-full bg-accent" />
          LIVE · YOLOv8 inference
        </div>
      </div>
    </div>
  );
}
