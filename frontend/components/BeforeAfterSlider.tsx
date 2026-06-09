"use client";

import { useCallback, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";

interface Props {
  before: string; // data URL or media URL (original / foggy)
  after: string; // enhanced
  beforeLabel?: string;
  afterLabel?: string;
}

export function BeforeAfterSlider({
  before,
  after,
  beforeLabel = "Original",
  afterLabel = "Enhanced",
}: Props) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, x)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full select-none overflow-hidden rounded-2xl border border-white/10 bg-black"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* after (full, underneath) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={after}
        alt={afterLabel}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <span className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs text-accent backdrop-blur">
        {afterLabel}
      </span>

      {/* before (clipped on top) */}
      <div
        className="absolute inset-0 h-full overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={before}
          alt={beforeLabel}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ width: containerRef.current?.clientWidth ?? "100%" }}
          draggable={false}
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs text-slate-200 backdrop-blur">
          {beforeLabel}
        </span>
      </div>

      {/* handle */}
      <div
        className="absolute top-0 z-10 flex h-full w-0.5 items-center justify-center bg-white/80"
        style={{ left: `${pos}%` }}
      >
        <span className="flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-white/40 bg-bg/80 text-white shadow-glow backdrop-blur">
          <MoveHorizontal className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
