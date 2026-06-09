"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Particles } from "@/components/Particles";
import { VehicleViz } from "@/components/VehicleViz";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const },
  }),
};

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* backdrop glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[120px]"
      />
      <div aria-hidden className="absolute inset-0 grid-bg opacity-40" />
      <Particles count={36} />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:py-32">
        <div>
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Computer Vision · YOLOv8
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl"
          >
            FogVision <span className="gradient-text">AI</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-4 text-xl font-medium text-slate-300"
          >
            AI-Powered Vehicle Detection in Dense Fog
          </motion.p>

          <motion.p
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-4 max-w-xl text-base leading-relaxed text-slate-400"
          >
            Upload foggy traffic footage and instantly identify vehicles using
            advanced computer vision powered by YOLOv8.
          </motion.p>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Button href="/app" size="lg">
              Upload Video
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="#how-it-works" variant="secondary" size="lg">
              <Play className="h-4 w-4" />
              View Demo
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <VehicleViz />
        </motion.div>
      </div>
    </section>
  );
}
