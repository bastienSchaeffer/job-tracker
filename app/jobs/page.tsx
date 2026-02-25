import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { JobList } from "@/components/jobs/job-list";
import { JobDialog } from "@/components/jobs/job-dialog";
import { StatusFilter } from "@/components/jobs/status-filter";
import { getJobs } from "@/lib/db";
import { JOB_STATUSES } from "@/lib/constants";
import type { JobStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

interface JobsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const statusFilter = params.status as JobStatus | undefined;

  let jobs = await getJobs();

  if (statusFilter && JOB_STATUSES.includes(statusFilter)) {
    jobs = jobs.filter((job) => job.status === statusFilter);
  }

  jobs.sort(
    (a, b) =>
      new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <JobDialog
          mode="create"
          trigger={<Button>Add Job</Button>}
        />
      </div>

      <div className="flex items-center gap-4">
        <Suspense fallback={null}>
          <StatusFilter />
        </Suspense>
      </div>

      <JobList jobs={jobs} />
    </div>
  );
}
