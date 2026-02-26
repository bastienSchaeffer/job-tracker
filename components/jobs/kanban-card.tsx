"use client";

import Link from "next/link";
import { Draggable } from "@hello-pangea/dnd";
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

  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "mb-2",
            snapshot.isDragging && "z-50"
          )}
        >
          <Link href={`/jobs/${job.id}`}>
            <Card
              className={cn(
                "cursor-grab transition-shadow hover:shadow-md",
                snapshot.isDragging && "shadow-lg cursor-grabbing",
                isPending && "opacity-50"
              )}
              role="option"
              aria-label={`${job.role} at ${job.company}, applied ${daysSince} days ago`}
            >
              <CardContent className="p-3">
                <p className="font-medium text-sm truncate">{job.company}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {job.role}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {daysSince} {daysSince === 1 ? "day" : "days"} ago
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </Draggable>
  );
}
