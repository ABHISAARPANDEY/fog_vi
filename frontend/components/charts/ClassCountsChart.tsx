"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Analytics } from "@/lib/api";
import { ChartShell, chartColors, tooltipStyle } from "./ChartShell";

export function ClassCountsChart({ analytics }: { analytics: Analytics }) {
  const data = [
    { name: "Cars", value: analytics.cars, fill: chartColors.cars },
    { name: "Trucks", value: analytics.trucks, fill: chartColors.trucks },
    { name: "Buses", value: analytics.buses, fill: chartColors.buses },
    {
      name: "Motorcycles",
      value: analytics.motorcycles,
      fill: chartColors.motorcycles,
    },
  ];

  return (
    <ChartShell title="Vehicle class counts" subtitle="Detections per class">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
          <XAxis
            dataKey="name"
            stroke={chartColors.axis}
            tick={{ fontSize: 12 }}
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
          <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
