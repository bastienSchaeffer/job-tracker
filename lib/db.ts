import { promises as fs } from "fs";
import path from "path";
import type { Job, JobCreateInput, JobUpdateInput } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "jobs.json");

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
}

async function readJobs(): Promise<Job[]> {
  await ensureDataFile();
  const data = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(data) as Job[];
}

async function writeJobs(jobs: Job[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(jobs, null, 2), "utf-8");
}

export async function getJobs(): Promise<Job[]> {
  return readJobs();
}

export async function getJob(id: string): Promise<Job | null> {
  const jobs = await readJobs();
  return jobs.find((job) => job.id === id) ?? null;
}

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

export async function deleteJob(id: string): Promise<boolean> {
  const jobs = await readJobs();
  const index = jobs.findIndex((job) => job.id === id);
  if (index === -1) return false;

  jobs.splice(index, 1);
  await writeJobs(jobs);
  return true;
}
