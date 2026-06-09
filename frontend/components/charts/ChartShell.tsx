import { Card } from "@/components/ui/Card";

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function ChartShell({ title, subtitle, children }: Props) {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
      <div className="h-64 w-full">{children}</div>
    </Card>
  );
}

export const chartColors = {
  cars: "#3B82F6",
  trucks: "#06B6D4",
  buses: "#10B981",
  motorcycles: "#a855f7",
  count: "#3B82F6",
  axis: "rgba(148,163,184,0.6)",
  grid: "rgba(148,163,184,0.12)",
};

export const tooltipStyle = {
  backgroundColor: "rgba(15,23,42,0.95)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "12px",
  color: "#e2e8f0",
  fontSize: "12px",
};
