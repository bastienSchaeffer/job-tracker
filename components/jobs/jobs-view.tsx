import { JobsTable } from "./jobs-table";
import { JobList } from "./job-list";
import type { Job } from "@/lib/types";

interface JobsViewProps {
  jobs: Job[];
}

export function JobsView({ jobs }: JobsViewProps) {
  return (
    <>
      {/* Mobile: Card view */}
      <div className="block md:hidden">
        <JobList jobs={jobs} />
      </div>

      {/* Desktop: Table view */}
      <div className="hidden md:block">
        <JobsTable jobs={jobs} />
      </div>
    </>
  );
}
