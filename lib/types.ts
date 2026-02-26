/**
 * Job application status representing the current stage in the hiring pipeline.
 * Stages progress from "applied" through various interview stages to final outcomes.
 */
export type JobStatus =
  | "applied"
  | "phone_screen"
  | "technical"
  | "onsite"
  | "offer"
  | "rejected";

/**
 * Complete job application record with all tracked information.
 * @property id - Unique identifier (UUID)
 * @property company - Company name
 * @property role - Job title/position
 * @property url - Link to job posting or application
 * @property status - Current stage in hiring pipeline
 * @property salaryMin - Minimum salary in USD (null if not specified)
 * @property salaryMax - Maximum salary in USD (null if not specified)
 * @property notes - Additional notes or comments
 * @property dateApplied - ISO date when application was submitted (YYYY-MM-DD)
 * @property lastUpdated - ISO datetime of last modification (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
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

/**
 * Input type for creating a new job.
 * Excludes auto-generated fields (id, lastUpdated).
 */
export type JobCreateInput = Omit<Job, "id" | "lastUpdated">;

/**
 * Input type for updating an existing job.
 * All fields are optional except id (which cannot be changed).
 */
export type JobUpdateInput = Partial<Omit<Job, "id">>;

/**
 * Count of jobs at a specific status in the hiring pipeline.
 * @property status - The job status being counted
 * @property label - Human-readable label for the status
 * @property count - Number of jobs at this status
 */
export interface StatusCount {
  status: JobStatus;
  label: string;
  count: number;
}

/**
 * Average time spent at a specific stage in the hiring pipeline.
 * @property status - The job status stage
 * @property label - Human-readable label for the status
 * @property averageDays - Average number of days spent at this stage
 * @property count - Number of jobs that reached this stage
 */
export interface StageTime {
  status: JobStatus;
  label: string;
  averageDays: number;
  count: number;
}

/**
 * Basic statistics about job applications.
 * @property totalCount - Total number of job applications
 * @property countByStatus - Breakdown of jobs by current status
 * @property averageTimeByStage - Average time spent at each stage
 */
export interface JobStats {
  totalCount: number;
  countByStatus: StatusCount[];
  averageTimeByStage: StageTime[];
}

/**
 * Number of applications submitted during a specific week.
 * @property week - ISO date of the week's start (YYYY-MM-DD)
 * @property weekLabel - Human-readable week label (e.g., "Week of Feb 20")
 * @property count - Number of applications submitted that week
 */
export interface WeeklyApplications {
  week: string;
  weekLabel: string;
  count: number;
}

/**
 * Time a specific company has spent in the hiring pipeline.
 * @property company - Company name
 * @property days - Number of days since application was submitted
 * @property status - Current status of the application
 */
export interface CompanyPipelineTime {
  company: string;
  days: number;
  status: JobStatus;
}

/**
 * Extended job statistics including trends and company-specific metrics.
 * Extends JobStats with additional analytics data.
 * @property activeCount - Number of active applications (not rejected or offered)
 * @property offerCount - Number of offers received
 * @property rejectionRate - Percentage of applications rejected (0-100)
 * @property applicationsByWeek - Weekly application submission trend
 * @property timeByCompany - Pipeline duration for each company
 */
export interface ExtendedJobStats extends JobStats {
  activeCount: number;
  offerCount: number;
  rejectionRate: number;
  applicationsByWeek: WeeklyApplications[];
  timeByCompany: CompanyPipelineTime[];
}

/**
 * View mode for displaying jobs.
 * @value "list" - Traditional list/table view
 * @value "board" - Kanban board view
 */
export type JobsViewMode = "list" | "board";

/**
 * Jobs organized by status for the Kanban board view.
 * Maps each status to an array of jobs at that status.
 */
export type JobsByStatus = Record<JobStatus, Job[]>
