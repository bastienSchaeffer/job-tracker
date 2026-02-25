export type JobStatus =
  | "applied"
  | "phone_screen"
  | "technical"
  | "onsite"
  | "offer"
  | "rejected";

export interface Job {
  id: string;
  company: string;
  role: string;
  url: string;
  status: JobStatus;
  salaryMin: number | null;
  salaryMax: number | null;
  notes: string;
  dateApplied: string;
  lastUpdated: string;
}

export type JobCreateInput = Omit<Job, "id" | "lastUpdated">;
export type JobUpdateInput = Partial<Omit<Job, "id">>;
