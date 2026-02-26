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
import type { CompanyPipelineTime } from "@/lib/types";

interface PipelineTimeChartProps {
  data: CompanyPipelineTime[];
}

export function PipelineTimeChart({ data }: PipelineTimeChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Days in Pipeline by Company</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    );
  }

  const chartHeight = Math.max(300, data.length * 40);
  const chartDescription = `Days in pipeline by company: ${data.map((d) => `${d.company}: ${d.days} days`).join(", ")}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Days in Pipeline by Company</CardTitle>
      </CardHeader>
      <CardContent>
        <p id="pipeline-chart-desc" className="sr-only">{chartDescription}</p>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 50, left: 0, bottom: 5 }}
            aria-label="Days in pipeline by company chart"
            aria-describedby="pipeline-chart-desc"
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="company"
              width={120}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Bar dataKey="days" radius={[0, 4, 4, 0]} maxBarSize={25}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={STATUS_CHART_COLORS[entry.status]}
                />
              ))}
              <LabelList
                dataKey="days"
                position="right"
                formatter={(value) => `${value}d`}
                style={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
