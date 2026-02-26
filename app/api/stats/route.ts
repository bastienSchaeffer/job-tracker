import { NextResponse } from "next/server";
import { getJobs } from "@/lib/db";
import { JOB_STATUSES, STATUS_LABELS } from "@/lib/constants";
import type { JobStats, StatusCount, StageTime, Job } from "@/lib/types";

function calculateDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

function calculateCountByStatus(jobs: Job[]): StatusCount[] {
  const counts = new Map<string, number>();

  for (const status of JOB_STATUSES) {
    counts.set(status, 0);
  }

  for (const job of jobs) {
    counts.set(job.status, (counts.get(job.status) ?? 0) + 1);
  }

  return JOB_STATUSES.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: counts.get(status) ?? 0,
  }));
}

function calculateAverageTimeByStage(jobs: Job[]): StageTime[] {
  const stageTimes = new Map<string, number[]>();

  for (const status of JOB_STATUSES) {
    stageTimes.set(status, []);
  }

  const now = new Date().toISOString();

  for (const job of jobs) {
    const days = calculateDaysBetween(job.dateApplied, now);
    stageTimes.get(job.status)?.push(days);
  }

  return JOB_STATUSES.map((status) => {
    const times = stageTimes.get(status) ?? [];
    const count = times.length;
    const averageDays =
      count > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / count) : 0;

    return {
      status,
      label: STATUS_LABELS[status],
      averageDays,
      count,
    };
  });
}

export async function GET(): Promise<NextResponse<JobStats | { error: string }>> {
  try {
    const jobs = await getJobs();

    const stats: JobStats = {
      totalCount: jobs.length,
      countByStatus: calculateCountByStatus(jobs),
      averageTimeByStage: calculateAverageTimeByStage(jobs),
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch job statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
