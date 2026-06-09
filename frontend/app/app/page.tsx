import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Workflow } from "@/components/Workflow";

export default function AppPage() {
  return (
    <section className="relative mx-auto max-w-5xl px-6 py-12 lg:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]"
      />
      <div className="relative mb-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Vehicle <span className="gradient-text">detection</span>
        </h1>
        <p className="mt-2 text-slate-400">
          Upload foggy footage, tune enhancement and run YOLOv8 detection.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-32 text-slate-400">
            <Loader2 className="mr-3 h-6 w-6 animate-spin text-accent" />
            Loading…
          </div>
        }
      >
        <Workflow />
      </Suspense>
    </section>
  );
}
