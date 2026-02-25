import type { JobStatus } from "./types";

export const JOB_STATUSES: JobStatus[] = [
  "applied",
  "phone_screen",
  "technical",
  "onsite",
  "offer",
  "rejected",
];

export const STATUS_LABELS: Record<JobStatus, string> = {
  applied: "Applied",
  phone_screen: "Phone Screen",
  technical: "Technical",
  onsite: "Onsite",
  offer: "Offer",
  rejected: "Rejected",
};

export const STATUS_COLORS: Record<JobStatus, string> = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  phone_screen:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  technical:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  onsite:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  offer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};
