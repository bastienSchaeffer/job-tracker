import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobCard } from "@/components/jobs/job-card";
import { JobDialog } from "@/components/jobs/job-dialog";
import { SeedDataButton } from "@/components/seed-data-button";
import { getJobs } from "@/lib/db";
import { JOB_STATUSES, STATUS_LABELS } from "@/lib/constants";
import type { JobStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const jobs = await getJobs();

  const statusCounts = JOB_STATUSES.reduce(
    (acc, status) => {
      acc[status] = jobs.filter((job) => job.status === status).length;
      return acc;
    },
    {} as Record<JobStatus, number>
  );

  const recentJobs = [...jobs]
    .sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    )
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your job application progress
          </p>
        </div>
        <JobDialog
          mode="create"
          trigger={<Button>Add Job</Button>}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {JOB_STATUSES.map((status) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {STATUS_LABELS[status]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts[status]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Link
            href="/jobs"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            View all jobs
          </Link>
        </div>
        {recentJobs.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No jobs yet. Add your first job application or load sample data to get started.
              </p>
              <SeedDataButton />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
