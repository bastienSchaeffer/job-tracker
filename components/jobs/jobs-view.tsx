import { JobsTable } from "./jobs-table";
import { JobList } from "./job-list";
import { KanbanBoard } from "./kanban-board";
import type { Job, JobsViewMode } from "@/lib/types";

interface JobsViewProps {
  jobs: Job[];
  viewMode?: JobsViewMode;
}

export function JobsView({ jobs, viewMode = "list" }: JobsViewProps) {
  if (viewMode === "board") {
    return <KanbanBoard jobs={jobs} />;
  }

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
