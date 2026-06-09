"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: "primary" | "accent" | "success" | "danger";
  index?: number;
}

const accents: Record<NonNullable<Props["accent"]>, string> = {
  primary: "text-primary bg-primary/10",
  accent: "text-accent bg-accent/10",
  success: "text-success bg-success/10",
  danger: "text-danger bg-danger/10",
};

export function MetricCard({
  icon: Icon,
  label,
  value,
  accent = "primary",
  index = 0,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="glass rounded-2xl p-5 shadow-card"
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          accents[accent]
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-4 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
    </motion.div>
  );
}
