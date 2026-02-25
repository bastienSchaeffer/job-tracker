import { getJobs } from "@/lib/db";
import { calculateExtendedStats } from "@/lib/stats";
import {
  StatCard,
  StatusDistributionChart,
  ApplicationTimelineChart,
  PipelineTimeChart,
} from "@/components/stats";

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
