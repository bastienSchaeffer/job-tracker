import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { JobsView } from "@/components/jobs/jobs-view";
import { JobDialog } from "@/components/jobs/job-dialog";
import { StatusFilter } from "@/components/jobs/status-filter";
import { SortToggle, type SortOrder } from "@/components/jobs/sort-toggle";
import { ViewToggle } from "@/components/jobs/view-toggle";
import { getJobs } from "@/lib/db";
import { JOB_STATUSES } from "@/lib/constants";
import type { JobStatus, JobsViewMode } from "@/lib/types";

export const dynamic = "force-dynamic";

interface JobsPageProps {
  searchParams: Promise<{ status?: string; sort?: string; view?: string }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const statusFilter = params.status as JobStatus | undefined;
  const sortOrder = (params.sort as SortOrder) ?? "desc";
  const viewMode = (params.view as JobsViewMode) ?? "board";

  let jobs = await getJobs();

  if (statusFilter && JOB_STATUSES.includes(statusFilter)) {
    jobs = jobs.filter((job) => job.status === statusFilter);
  }

  jobs.sort((a, b) => {
    const dateA = new Date(a.dateApplied).getTime();
    const dateB = new Date(b.dateApplied).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <JobDialog mode="create" trigger={<Button>Add Job</Button>} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Suspense fallback={null}>
          <StatusFilter />
        </Suspense>
        <Suspense fallback={null}>
          <SortToggle />
        </Suspense>
        <Suspense fallback={null}>
          <ViewToggle />
        </Suspense>
      </div>

      <JobsView jobs={jobs} viewMode={viewMode} />
    </div>
  );
}
