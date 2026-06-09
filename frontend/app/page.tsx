import { Upload, Wand2, LineChart } from "lucide-react";
import { Hero } from "@/components/Hero";
import { FeatureCards } from "@/components/FeatureCards";
import { Button } from "@/components/ui/Button";

const steps = [
  {
    icon: Upload,
    title: "Upload footage",
    desc: "Drop an .mp4, .mov or .avi clip of foggy traffic. We extract metadata and a preview instantly.",
  },
  {
    icon: Wand2,
    title: "Enhance & detect",
    desc: "Tune fog enhancement, pick a YOLOv8 model and run detection across every frame.",
  },
  {
    icon: LineChart,
    title: "Explore results",
    desc: "Compare before/after, scrub frame-by-frame and dive into the analytics dashboard.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureCards />

      <section
        id="how-it-works"
        className="relative mx-auto max-w-7xl scroll-mt-20 px-6 py-24"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-slate-400">
            Three steps from foggy clip to vehicle intelligence.
          </p>
        </div>

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="glass relative rounded-2xl p-7 shadow-card"
              >
                <span className="absolute right-6 top-6 text-5xl font-bold text-white/5">
                  {i + 1}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-accent ring-1 ring-white/10">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 flex flex-col items-center gap-5 text-center">
          <h3 className="text-2xl font-semibold tracking-tight">
            Ready to cut through the fog?
          </h3>
          <Button href="/app" size="lg">
            Start detecting
          </Button>
        </div>
      </section>
    </>
  );
}
