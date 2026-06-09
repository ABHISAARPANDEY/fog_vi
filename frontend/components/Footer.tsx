import Link from "next/link";
import { Radar } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-bg/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-accent">
            <Radar className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm font-medium text-slate-300">
            FogVision <span className="gradient-text">AI</span>
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Vehicle detection in dense fog · Powered by YOLOv8 &amp; computer
          vision
        </p>
        <div className="flex items-center gap-5 text-xs text-slate-400">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <Link href="/app" className="hover:text-white">
            Detect
          </Link>
          <Link href="/history" className="hover:text-white">
            History
          </Link>
        </div>
      </div>
    </footer>
  );
}
