import nextDynamic from "next/dynamic";
import { getJobs } from "@/lib/db";
import { calculateExtendedStats } from "@/lib/stats";
import { StatCard } from "@/components/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ChartSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-[250px]">
        <div className="h-full w-full animate-pulse bg-muted rounded" />
      </CardContent>
    </Card>
  );
}

const StatusDistributionChart = nextDynamic(
  () =>
    import("@/components/stats/status-distribution-chart").then((m) => ({
      default: m.StatusDistributionChart,
    })),
  { loading: () => <ChartSkeleton title="Status Distribution" /> }
);

const ApplicationTimelineChart = nextDynamic(
  () =>
    import("@/components/stats/application-timeline-chart").then((m) => ({
      default: m.ApplicationTimelineChart,
    })),
  { loading: () => <ChartSkeleton title="Applications Over Time" /> }
);

const PipelineTimeChart = nextDynamic(
  () =>
    import("@/components/stats/pipeline-time-chart").then((m) => ({
      default: m.PipelineTimeChart,
    })),
  { loading: () => <ChartSkeleton title="Time in Pipeline" /> }
);

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const jobs = await getJobs();
  const stats = calculateExtendedStats(jobs);

  const rejectionRateDisplay =
    stats.totalCount > 0 ? `${Math.round(stats.rejectionRate)}%` : "N/A";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Statistics</h1>
        <p className="text-muted-foreground">
          Overview of your job search progress
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={stats.totalCount}
          description="All time"
        />
        <StatCard
          title="Active"
          value={stats.activeCount}
          description="In progress"
        />
        <StatCard
          title="Offers"
          value={stats.offerCount}
          description="Received"
        />
        <StatCard
          title="Rejection Rate"
          value={rejectionRateDisplay}
          description="Of completed"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatusDistributionChart data={stats.countByStatus} />
        <ApplicationTimelineChart data={stats.applicationsByWeek} />
      </div>

      <PipelineTimeChart data={stats.timeByCompany} />
    </div>
  );
}
