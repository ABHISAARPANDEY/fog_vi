"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";

interface Props {
  src: string; // processed video absolute URL
  fps: number;
}

export function FrameViewer({ src, fps }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const safeFps = fps && fps > 0 ? fps : 30;
  const frameDur = 1 / safeFps;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setTime(v.currentTime);
    const onMeta = () => setDuration(v.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    const next = Math.min(
      Math.max(0, v.currentTime + dir * frameDur),
      duration || v.duration || 0
    );
    v.currentTime = next;
    setTime(next);
  };

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };

  const seek = (value: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = value;
    setTime(value);
  };

  const frameNo = Math.round(time * safeFps);
  const totalFrames = Math.round((duration || 0) * safeFps);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
      <video
        ref={videoRef}
        src={src}
        className="aspect-video w-full bg-black"
        playsInline
        preload="metadata"
      />
      <div className="space-y-3 border-t border-white/10 bg-card/60 p-4 backdrop-blur">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={frameDur}
          value={time}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/25"
              aria-label="Previous frame"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={toggle}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl text-white",
                "bg-gradient-accent shadow-glow"
              )}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/25"
              aria-label="Next frame"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs text-slate-400">
            <span>
              Frame{" "}
              <span className="text-accent">{frameNo}</span>
              {totalFrames > 0 && <span> / {totalFrames}</span>}
            </span>
            <span>
              {formatTime(time)}
              {duration > 0 && <span> / {formatTime(duration)}</span>}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
