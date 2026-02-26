"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./kanban-column";
import { JOB_STATUSES, STATUS_LABELS } from "@/lib/constants";
import type { Job, JobStatus, JobsByStatus } from "@/lib/types";

interface KanbanBoardProps {
  jobs: Job[];
}

function groupJobsByStatus(jobs: Job[]): JobsByStatus {
  const grouped = {} as JobsByStatus;
  for (const status of JOB_STATUSES) {
    grouped[status] = [];
  }
  for (const job of jobs) {
    grouped[job.status].push(job);
  }
  return grouped;
}

function getJobsFingerprint(jobs: Job[]): string {
  return jobs
    .map((j) => `${j.id}:${j.status}`)
    .sort()
    .join(",");
}

export function KanbanBoard({ jobs }: KanbanBoardProps) {
  const router = useRouter();
  const [jobsByStatus, setJobsByStatus] = useState<JobsByStatus>(() =>
    groupJobsByStatus(jobs)
  );
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());
  const [announcement, setAnnouncement] = useState<string>("");
  const lastFingerprintRef = useRef<string>(getJobsFingerprint(jobs));

  // Sync state with props when jobs change (e.g., filtering, external updates)
  useEffect(() => {
    const newFingerprint = getJobsFingerprint(jobs);
    if (newFingerprint !== lastFingerprintRef.current) {
      lastFingerprintRef.current = newFingerprint;
      setJobsByStatus(groupJobsByStatus(jobs));
    }
  }, [jobs]);

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId } = result;

      // Dropped outside a droppable area
      if (!destination) return;

      // Dropped in the same position
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const sourceStatus = source.droppableId as JobStatus;
      const destStatus = destination.droppableId as JobStatus;
      const jobId = draggableId;

      // Find the job being moved
      const job = jobsByStatus[sourceStatus].find((j) => j.id === jobId);
      if (!job) return;

      // Optimistic update
      const previousJobsByStatus = { ...jobsByStatus };

      setJobsByStatus((prev) => {
        const newState = { ...prev };

        // Remove from source
        newState[sourceStatus] = prev[sourceStatus].filter((j) => j.id !== jobId);

        // Add to destination
        const updatedJob = { ...job, status: destStatus };
        const destJobs = [...prev[destStatus]];
        destJobs.splice(destination.index, 0, updatedJob);
        newState[destStatus] = destJobs;

        return newState;
      });

      // Only make API call if status changed
      if (sourceStatus !== destStatus) {
        setPendingUpdates((prev) => new Set(prev).add(jobId));
        setAnnouncement(
          `Moving ${job.company} - ${job.role} from ${STATUS_LABELS[sourceStatus]} to ${STATUS_LABELS[destStatus]}`
        );

        try {
          const response = await fetch(`/api/jobs/${jobId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: destStatus }),
          });

          if (!response.ok) {
            throw new Error("Failed to update job status");
          }

          setAnnouncement(
            `Moved ${job.company} - ${job.role} to ${STATUS_LABELS[destStatus]}`
          );
          router.refresh();
        } catch {
          // Rollback on error
          setJobsByStatus(previousJobsByStatus);
          setAnnouncement(
            `Failed to move ${job.company} - ${job.role}. Reverted to ${STATUS_LABELS[sourceStatus]}`
          );
        } finally {
          setPendingUpdates((prev) => {
            const next = new Set(prev);
            next.delete(jobId);
            return next;
          });
        }
      }
    },
    [jobsByStatus, router]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-6 md:overflow-x-visible"
        role="region"
        aria-label="Job application kanban board"
      >
        {JOB_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            jobs={jobsByStatus[status]}
            pendingJobIds={pendingUpdates}
          />
        ))}
      </div>
      {/* Live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </DragDropContext>
  );
}
