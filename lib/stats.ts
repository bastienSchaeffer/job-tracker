import { JOB_STATUSES, STATUS_LABELS } from "./constants";
import type {
  Job,
  JobStatus,
  ExtendedJobStats,
  WeeklyApplications,
  CompanyPipelineTime,
  StatusCount,
} from "./types";

const ACTIVE_STATUSES: JobStatus[] = [
  "applied",
  "phone_screen",
  "technical",
  "onsite",
];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function calculateApplicationsByWeek(
  jobs: Job[],
  weeksCount = 8
): WeeklyApplications[] {
  const now = new Date();
  const currentWeekStart = getWeekStart(now);
  const weeks: Map<string, WeeklyApplications> = new Map();

  for (let i = weeksCount - 1; i >= 0; i--) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekKey = weekStart.toISOString().split("T")[0];
    weeks.set(weekKey, {
      week: weekKey,
      weekLabel: formatWeekLabel(weekStart),
      count: 0,
    });
  }

  for (const job of jobs) {
    const jobDate = new Date(job.dateApplied);
    const jobWeekStart = getWeekStart(jobDate);
    const weekKey = jobWeekStart.toISOString().split("T")[0];

    if (weeks.has(weekKey)) {
      const week = weeks.get(weekKey)!;
      week.count += 1;
    }
  }

  return Array.from(weeks.values());
}

export function calculateTimeByCompany(
  jobs: Job[],
  limit = 10
): CompanyPipelineTime[] {
  const now = new Date();

  const jobsWithTime: CompanyPipelineTime[] = jobs.map((job) => {
    const appliedDate = new Date(job.dateApplied);
    const days = Math.floor(
      (now.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      company: job.company,
      days,
      status: job.status,
    };
  });

  return jobsWithTime.sort((a, b) => b.days - a.days).slice(0, limit);
}

export function calculateExtendedStats(jobs: Job[]): ExtendedJobStats {
  const countByStatus: StatusCount[] = JOB_STATUSES.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: jobs.filter((job) => job.status === status).length,
  }));

  const activeCount = jobs.filter((job) =>
    ACTIVE_STATUSES.includes(job.status)
  ).length;

  const offerCount = jobs.filter((job) => job.status === "offer").length;
  const rejectedCount = jobs.filter((job) => job.status === "rejected").length;
  const terminalCount = offerCount + rejectedCount;
  const rejectionRate =
    terminalCount > 0 ? (rejectedCount / terminalCount) * 100 : 0;

  return {
    totalCount: jobs.length,
    countByStatus,
    averageTimeByStage: [],
    activeCount,
    offerCount,
    rejectionRate,
    applicationsByWeek: calculateApplicationsByWeek(jobs),
    timeByCompany: calculateTimeByCompany(jobs),
  };
}
