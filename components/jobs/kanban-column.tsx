"use client";

import { Droppable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { KanbanCard } from "./kanban-card";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Job, JobStatus } from "@/lib/types";

interface KanbanColumnProps {
  status: JobStatus;
  jobs: Job[];
  pendingJobIds: Set<string>;
}

export function KanbanColumn({ status, jobs, pendingJobIds }: KanbanColumnProps) {
  const label = STATUS_LABELS[status];

  return (
    <div
      className="flex flex-col w-72 shrink-0 md:w-auto"
      role="region"
      aria-label={`${label} column with ${jobs.length} ${jobs.length === 1 ? "job" : "jobs"}`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-medium text-sm">{label}</h3>
        <Badge variant="secondary" className="text-xs">
          {jobs.length}
        </Badge>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 min-h-[200px] p-2 rounded-lg border-2 border-dashed transition-colors",
              snapshot.isDraggingOver
                ? "border-primary bg-primary/5"
                : "border-muted bg-muted/30"
            )}
          >
            {jobs.length === 0 && !snapshot.isDraggingOver && (
              <p className="text-xs text-muted-foreground text-center py-8">
                No jobs
              </p>
            )}
            {jobs.map((job, index) => (
              <KanbanCard
                key={job.id}
                job={job}
                index={index}
                isPending={pendingJobIds.has(job.id)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
