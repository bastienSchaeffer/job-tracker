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

export interface StatusCount {
  status: JobStatus;
  label: string;
  count: number;
}

export interface StageTime {
  status: JobStatus;
  label: string;
  averageDays: number;
  count: number;
}

export interface JobStats {
  totalCount: number;
  countByStatus: StatusCount[];
  averageTimeByStage: StageTime[];
}

export interface WeeklyApplications {
  week: string;
  weekLabel: string;
  count: number;
}

export interface CompanyPipelineTime {
  company: string;
  days: number;
  status: JobStatus;
}

export interface ExtendedJobStats extends JobStats {
  activeCount: number;
  offerCount: number;
  rejectionRate: number;
  applicationsByWeek: WeeklyApplications[];
  timeByCompany: CompanyPipelineTime[];
}
