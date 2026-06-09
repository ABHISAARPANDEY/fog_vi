"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimelinePoint } from "@/lib/api";
import { ChartShell, chartColors, tooltipStyle } from "./ChartShell";

const DANGER_COLOR = "#ef4444";

export function TimelineChart({ data }: { data: TimelinePoint[] }) {
  const hasDanger = data.some((d) => (d.danger ?? 0) > 0);
  return (
    <ChartShell
      title="Detection timeline"
      subtitle={
        hasDanger
          ? "Vehicles per frame (stacked) · red = too-close alerts"
          : "Vehicles detected per frame, stacked by class"
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            {(["cars", "trucks", "buses", "motorcycles"] as const).map((k) => (
              <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors[k]} stopOpacity={0.5} />
                <stop offset="100%" stopColor={chartColors[k]} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
          <XAxis
            dataKey="frame"
            stroke={chartColors.axis}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            minTickGap={32}
          />
          <YAxis
            stroke={chartColors.axis}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="cars"
            stackId="1"
            name="Cars"
            stroke={chartColors.cars}
            fill="url(#grad-cars)"
          />
          <Area
            type="monotone"
            dataKey="trucks"
            stackId="1"
            name="Trucks"
            stroke={chartColors.trucks}
            fill="url(#grad-trucks)"
          />
          <Area
            type="monotone"
            dataKey="buses"
            stackId="1"
            name="Buses"
            stroke={chartColors.buses}
            fill="url(#grad-buses)"
          />
          <Area
            type="monotone"
            dataKey="motorcycles"
            stackId="1"
            name="Motorcycles"
            stroke={chartColors.motorcycles}
            fill="url(#grad-motorcycles)"
          />
          {hasDanger && (
            <Line
              type="monotone"
              dataKey="danger"
              name="Danger (too close)"
              stroke={DANGER_COLOR}
              strokeWidth={2}
              dot={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
