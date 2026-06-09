"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  EnhancementSettings as Enhancement,
  ModelName,
} from "@/lib/api";

export interface DetectionConfig {
  enhancement: Enhancement;
  model_name: ModelName;
  conf: number;
}

export const DEFAULT_CONFIG: DetectionConfig = {
  // Matches backend defaults; "n" weights are pre-downloaded by setup.sh so the
  // first run works offline. Switch to s/m (downloads on first use) for accuracy.
  enhancement: { clahe: true, gamma: 1.2, hist_eq: true, sharpen: true },
  model_name: "n",
  conf: 0.4,
};

const models: { value: ModelName; label: string; hint: string }[] = [
  { value: "n", label: "YOLOv8n", hint: "Nano · fastest" },
  { value: "s", label: "YOLOv8s", hint: "Small · balanced" },
  { value: "m", label: "YOLOv8m", hint: "Medium · accurate" },
];

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:border-white/20"
    >
      <span className="text-sm text-slate-200">{label}</span>
      <span
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          checked ? "bg-gradient-accent" : "bg-white/10"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </span>
    </button>
  );
}

interface Props {
  config: DetectionConfig;
  onChange: (config: DetectionConfig) => void;
}

export function EnhancementSettings({ config, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const e = config.enhancement;

  const setEnh = (patch: Partial<Enhancement>) =>
    onChange({ ...config, enhancement: { ...e, ...patch } });

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <span className="flex items-center gap-3">
          <SlidersHorizontal className="h-5 w-5 text-accent" />
          <span className="font-medium">Enhancement &amp; model settings</span>
          <span className="text-xs text-slate-500">(optional)</span>
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-slate-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-6 border-t border-white/10 px-6 py-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle
                  label="CLAHE (contrast)"
                  checked={e.clahe}
                  onChange={(v) => setEnh({ clahe: v })}
                />
                <Toggle
                  label="Histogram equalization"
                  checked={e.hist_eq}
                  onChange={(v) => setEnh({ hist_eq: v })}
                />
                <Toggle
                  label="Sharpen"
                  checked={e.sharpen}
                  onChange={(v) => setEnh({ sharpen: v })}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">Gamma</span>
                  <span className="font-mono text-accent">
                    {e.gamma.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.5}
                  step={0.05}
                  value={e.gamma}
                  onChange={(ev) =>
                    setEnh({ gamma: parseFloat(ev.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <span className="mb-2 block text-sm text-slate-300">
                  Detection model
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {models.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => onChange({ ...config, model_name: m.value })}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-center transition-colors",
                        config.model_name === m.value
                          ? "border-primary bg-primary/10"
                          : "border-white/10 bg-white/[0.03] hover:border-white/25"
                      )}
                    >
                      <span className="block text-sm font-medium">
                        {m.label}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-500">
                        {m.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">Confidence threshold</span>
                  <span className="font-mono text-accent">
                    {config.conf.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.9}
                  step={0.05}
                  value={config.conf}
                  onChange={(ev) =>
                    onChange({ ...config, conf: parseFloat(ev.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
