"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_CHART_COLORS } from "@/lib/constants";
import type { StatusCount } from "@/lib/types";

interface StatusDistributionChartProps {
  data: StatusCount[];
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const filteredData = data.filter((item) => item.count > 0);

  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    );
  }

  const chartDescription = `Status distribution: ${filteredData.map((d) => `${d.label}: ${d.count}`).join(", ")}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <p id="status-chart-desc" className="sr-only">{chartDescription}</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={filteredData}
            layout="vertical"
            margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
            aria-label="Status distribution bar chart"
            aria-describedby="status-chart-desc"
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={100}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={30}>
              {filteredData.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={STATUS_CHART_COLORS[entry.status]}
                />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                style={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
