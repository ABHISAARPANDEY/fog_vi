"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/", label: "Home" },
  { href: "/app", label: "Detect" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-bg/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-accent shadow-glow">
            <Radar className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            FogVision <span className="gradient-text">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/5 text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <Button href="/app" size="sm">
          Launch App
        </Button>
      </nav>
    </header>
  );
}
