import { promises as fs } from "fs";
import path from "path";
import type { Job, JobCreateInput, JobUpdateInput } from "./types";

/**
 * Path to the JSON file used as the database.
 * Located at data/jobs.json relative to project root.
 */
const DATA_FILE = path.join(process.cwd(), "data", "jobs.json");

/**
 * Ensures the data file exists, creating it with an empty array if needed.
 * Also creates the parent directory if it doesn't exist.
 */
async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
}

/**
 * Reads all jobs from the JSON database file.
 * @returns Promise resolving to an array of all jobs
 */
async function readJobs(): Promise<Job[]> {
  await ensureDataFile();
  const data = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(data) as Job[];
}

/**
 * Writes the entire jobs array to the JSON database file.
 * @param jobs - Complete array of jobs to persist
 */
async function writeJobs(jobs: Job[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(jobs, null, 2), "utf-8");
}

/**
 * Retrieves all jobs from the database.
 * @returns Promise resolving to an array of all job records
 * @example
 * const jobs = await getJobs();
 * console.log(`Found ${jobs.length} jobs`);
 */
export async function getJobs(): Promise<Job[]> {
  return readJobs();
}

/**
 * Retrieves a single job by its ID.
 * @param id - The unique identifier of the job to retrieve
 * @returns Promise resolving to the job record if found, null otherwise
 * @example
 * const job = await getJob("123e4567-e89b-12d3-a456-426614174000");
 * if (job) {
 *   console.log(`Found job at ${job.company}`);
 * }
 */
export async function getJob(id: string): Promise<Job | null> {
  const jobs = await readJobs();
  return jobs.find((job) => job.id === id) ?? null;
}

/**
 * Creates a new job record in the database.
 * Automatically generates a unique ID and sets the lastUpdated timestamp.
 * @param input - Job data excluding id and lastUpdated (auto-generated)
 * @returns Promise resolving to the newly created job with generated id and lastUpdated
 * @example
 * const newJob = await createJob({
 *   company: "Acme Corp",
 *   role: "Senior Developer",
 *   url: "https://example.com/jobs/123",
 *   status: "applied",
 *   salaryMin: 80000,
 *   salaryMax: 120000,
 *   notes: "Referred by John",
 *   dateApplied: "2026-02-26"
 * });
 */
export async function createJob(input: JobCreateInput): Promise<Job> {
  const jobs = await readJobs();
  const now = new Date().toISOString();
  const newJob: Job = {
    ...input,
    id: crypto.randomUUID(),
    lastUpdated: now,
  };
  jobs.push(newJob);
  await writeJobs(jobs);
  return newJob;
}

/**
 * Updates an existing job record with partial data.
 * Automatically updates the lastUpdated timestamp.
 * @param id - The unique identifier of the job to update
 * @param input - Partial job data to update (all fields optional except id)
 * @returns Promise resolving to the updated job if found, null if job doesn't exist
 * @example
 * const updated = await updateJob("123e4567-e89b-12d3-a456-426614174000", {
 *   status: "phone_screen",
 *   notes: "Scheduled for next Tuesday"
 * });
 */
export async function updateJob(
  id: string,
  input: JobUpdateInput
): Promise<Job | null> {
  const jobs = await readJobs();
  const index = jobs.findIndex((job) => job.id === id);
  if (index === -1) return null;

  const updatedJob: Job = {
    ...jobs[index],
    ...input,
    lastUpdated: new Date().toISOString(),
  };
  jobs[index] = updatedJob;
  await writeJobs(jobs);
  return updatedJob;
}

/**
 * Deletes a job record from the database.
 * @param id - The unique identifier of the job to delete
 * @returns Promise resolving to true if job was deleted, false if job was not found
 * @example
 * const deleted = await deleteJob("123e4567-e89b-12d3-a456-426614174000");
 * if (deleted) {
 *   console.log("Job successfully deleted");
 * } else {
 *   console.log("Job not found");
 * }
 */
export async function deleteJob(id: string): Promise<boolean> {
  const jobs = await readJobs();
  const index = jobs.findIndex((job) => job.id === id);
  if (index === -1) return false;

  jobs.splice(index, 1);
  await writeJobs(jobs);
  return true;
}

/**
 * Creates multiple job records in a single atomic write operation.
 * Avoids race conditions that occur with concurrent individual writes.
 * @param inputs - Array of job data to create
 * @returns Promise resolving to array of created jobs
 */
export async function createJobs(inputs: JobCreateInput[]): Promise<Job[]> {
  const jobs = await readJobs();
  const now = new Date().toISOString();

  const newJobs: Job[] = inputs.map((input) => ({
    ...input,
    id: crypto.randomUUID(),
    lastUpdated: now,
  }));

  jobs.push(...newJobs);
  await writeJobs(jobs);
  return newJobs;
}
