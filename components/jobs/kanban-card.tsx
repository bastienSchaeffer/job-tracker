"use client";

import Link from "next/link";
import { Draggable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Job } from "@/lib/types";

interface KanbanCardProps {
  job: Job;
  index: number;
  isPending?: boolean;
}

function getDaysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function KanbanCard({ job, index, isPending = false }: KanbanCardProps) {
  const daysSince = getDaysSince(job.dateApplied);
  const daysText = `${daysSince} ${daysSince === 1 ? "day" : "days"} ago`;

  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "mb-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
            snapshot.isDragging && "z-50"
          )}
        >
          <Card
            className={cn(
              "transition-shadow hover:shadow-md",
              snapshot.isDragging && "shadow-lg",
              isPending && "opacity-50"
            )}
            aria-busy={isPending}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                {/* Separate drag handle for accessibility */}
                <div
                  {...provided.dragHandleProps}
                  className="mt-0.5 cursor-grab rounded p-0.5 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  aria-label={`Drag handle for ${job.company} - ${job.role}`}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <Link
                  href={`/jobs/${job.id}`}
                  className="flex-1 min-w-0 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded"
                  aria-label={`View details for ${job.role} at ${job.company}, applied ${daysText}`}
                >
                  <p className="font-medium text-sm truncate">{job.company}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {job.role}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {daysText}
                  </p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
