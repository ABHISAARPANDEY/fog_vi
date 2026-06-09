"use client";

import { motion } from "framer-motion";
import {
  CloudFog,
  ScanSearch,
  Route,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const features: Feature[] = [
  {
    icon: CloudFog,
    title: "Fog Enhancement",
    desc: "CLAHE, gamma correction, histogram equalization and sharpening lift detail out of dense haze before detection.",
  },
  {
    icon: ScanSearch,
    title: "YOLOv8 Detection",
    desc: "State-of-the-art object detection localizes cars, trucks, buses and motorcycles with confidence scoring.",
  },
  {
    icon: Route,
    title: "Multi-Object Tracking",
    desc: "Consistent identities across frames so vehicles are counted once as they move through the scene.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Per-class counts, confidence distributions and a frame-by-frame timeline rendered into a live dashboard.",
  },
];

export function FeatureCards() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Built for <span className="gradient-text">low-visibility</span> roads
        </h2>
        <p className="mt-4 text-slate-400">
          A complete pipeline from raw foggy footage to actionable detection
          analytics.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Card className="h-full hover:border-white/20">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-accent shadow-glow">
                  <Icon className="h-6 w-6 text-white" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {f.desc}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
