import type { Metadata } from "next";
import { DashboardView } from "@/components/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard · FogVision AI",
  description: "Aggregate vehicle-detection analytics across all processed videos.",
};

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <DashboardView />
    </main>
  );
}
