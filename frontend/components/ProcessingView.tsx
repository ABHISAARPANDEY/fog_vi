"use client";

import { motion } from "framer-motion";
import { Loader2, AlertTriangle, RotateCcw, Radar } from "lucide-react";
import { apiBase, type StatusResponse } from "@/lib/api";
import { formatDuration, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface Props {
  status: StatusResponse | null;
  jobId: string | null;
  error: string | null;
  onRetry: () => void;
}

export function ProcessingView({ status, jobId, error, onRetry }: Props) {
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-danger/30">
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/15 text-danger">
              <AlertTriangle className="h-7 w-7" />
            </span>
            <h3 className="text-xl font-semibold">Processing failed</h3>
            <p className="max-w-md text-sm text-slate-400">{error}</p>
            <Button onClick={onRetry} variant="secondary">
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  const progress = status ? Math.min(1, Math.max(0, status.progress)) : 0;
  const pct = Math.round(progress * 100);
  const current = status?.current_frame ?? 0;
  const total = status?.total_frames ?? 0;
  const eta = status?.eta_seconds ?? 0;
  const stage = status?.status ?? "queued";

  // Real-time MJPEG stream of annotated frames (multipart/x-mixed-replace).
  // A single <img> connection plays detections live as the job runs.
  const streamSrc = jobId ? apiBase(`/stream/${jobId}`) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* live detection preview */}
          <div className="order-2 lg:order-1">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Radar className="h-4 w-4 text-accent" /> Live detection
              </span>
              <Badge tone="accent">real-time</Badge>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
              {streamSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={streamSrc}
                  alt="Real-time detection stream"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader2 className="h-7 w-7 animate-spin text-accent" />
                  <span className="text-xs">Warming up the detector…</span>
                </div>
              )}
              {/* scanline sweep overlay */}
              <motion.div
                className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-accent/20 to-transparent"
                animate={{ y: ["-40%", "260%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Bounding boxes update as YOLOv8 detects vehicles frame-by-frame.
            </p>
          </div>

          {/* status / progress */}
          <div className="order-1 flex flex-col items-center justify-center text-center lg:order-2">
            <h3 className="text-xl font-semibold">
              {stage === "queued" ? "Queued…" : "Detecting vehicles…"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-400">
              Enhancing fog and running YOLOv8 inference across every frame.
            </p>

            {/* progress bar */}
            <div className="mt-8 w-full max-w-md">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-300">Progress</span>
                <span className="font-mono text-accent">{pct}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            <div className="mt-8 grid w-full max-w-md grid-cols-3 gap-3">
              <Stat label="Frame" value={`${formatNumber(current)} / ${formatNumber(total)}`} />
              <Stat label="Frames done" value={formatNumber(current)} />
              <Stat label="ETA" value={formatDuration(eta)} />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-4 text-center">
      <div className="text-sm font-semibold text-slate-100">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
    </div>
  );
}
