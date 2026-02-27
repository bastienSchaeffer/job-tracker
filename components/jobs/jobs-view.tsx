"use client";

import dynamic from "next/dynamic";
import { JobsTable } from "./jobs-table";
import { JobList } from "./job-list";
import type { Job, JobsViewMode } from "@/lib/types";

const KanbanBoard = dynamic(
  () => import("./kanban-board").then((m) => ({ default: m.KanbanBoard })),
  {
    loading: () => (
      <div className="flex justify-center py-12 text-muted-foreground">
        Loading board...
      </div>
    ),
    ssr: false,
  }
);

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
