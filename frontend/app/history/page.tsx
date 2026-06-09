"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getHistory } from "@/lib/api";
import {
  mergeHistory,
  readHistory,
  type LocalHistoryItem,
} from "@/lib/history";
import { HistoryList } from "@/components/HistoryList";

export default function HistoryPage() {
  const [items, setItems] = useState<LocalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const local = readHistory();
    setItems(local);
    (async () => {
      const remote = await getHistory(); // best-effort, never throws
      if (cancelled) return;
      setItems(mergeHistory(readHistory(), remote));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-12 lg:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[260px] w-[640px] -translate-x-1/2 rounded-full bg-accent/10 blur-[130px]"
      />
      <div className="relative mb-10 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Detection <span className="gradient-text">history</span>
          </h1>
          <p className="mt-2 text-slate-400">
            Your completed jobs. Click any to reopen the results.
          </p>
        </div>
        {loading && (
          <span className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Syncing
          </span>
        )}
      </div>

      <HistoryList items={items} />
    </section>
  );
}
