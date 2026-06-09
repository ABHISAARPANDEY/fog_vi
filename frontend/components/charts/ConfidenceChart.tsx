"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ConfidenceBucket } from "@/lib/api";
import { ChartShell, chartColors, tooltipStyle } from "./ChartShell";

export function ConfidenceChart({ data }: { data: ConfidenceBucket[] }) {
  return (
    <ChartShell
      title="Confidence distribution"
      subtitle="Detections grouped by confidence score"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
          <XAxis
            dataKey="bucket"
            stroke={chartColors.axis}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={chartColors.axis}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar
            dataKey="count"
            name="Detections"
            radius={[6, 6, 0, 0]}
            fill="url(#confGrad)"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
