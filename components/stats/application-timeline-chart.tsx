"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeeklyApplications } from "@/lib/types";

interface ApplicationTimelineChartProps {
  data: WeeklyApplications[];
}

export function ApplicationTimelineChart({ data }: ApplicationTimelineChartProps) {
  const hasData = data.some((item) => item.count > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Timeline</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
            aria-label="Weekly application timeline chart"
          >
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: 12,
              }}
              labelFormatter={(label) => `Week of ${label}`}
              formatter={(value) => [value, "Applications"]}
            />
            <Bar
              dataKey="count"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
