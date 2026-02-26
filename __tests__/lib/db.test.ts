import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import type { Job, JobCreateInput, JobUpdateInput } from "@/lib/types";
import { getJobs, getJob, createJob, updateJob, deleteJob } from "@/lib/db";

// Use real data directory but backup/restore
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "jobs.json");
const BACKUP_FILE = path.join(DATA_DIR, "jobs.json.test-backup");

const createMockJob = (overrides: Partial<Job> = {}): Job => ({
  id: crypto.randomUUID(),
  company: "Test Company",
  role: "Software Engineer",
  url: "https://example.com",
  status: "applied",
  salaryMin: null,
  salaryMax: null,
  notes: "",
  dateApplied: new Date().toISOString().split("T")[0],
  lastUpdated: new Date().toISOString(),
  ...overrides,
});

describe("db", () => {
  beforeEach(async () => {
    // Backup existing data file if it exists
    try {
      const existingData = await fs.readFile(DATA_FILE, "utf-8");
      await fs.writeFile(BACKUP_FILE, existingData, "utf-8");
    } catch {
      // No existing file, that's okay
    }

    // Start with empty jobs array
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  });

  afterEach(async () => {
    // Restore backup if it exists
    try {
      const backupData = await fs.readFile(BACKUP_FILE, "utf-8");
      await fs.writeFile(DATA_FILE, backupData, "utf-8");
      await fs.unlink(BACKUP_FILE);
    } catch {
      // No backup, remove test file
      try {
        await fs.unlink(DATA_FILE);
      } catch {
        // File might not exist
      }
    }
  });

  describe("getJobs", () => {
    it("should return all jobs from the data file", async () => {
      const mockJobs: Job[] = [
        createMockJob({ company: "Company A" }),
        createMockJob({ company: "Company B" }),
      ];
      await fs.writeFile(DATA_FILE, JSON.stringify(mockJobs), "utf-8");

      const result = await getJobs();

      expect(result).toHaveLength(2);
      expect(result[0].company).toBe("Company A");
      expect(result[1].company).toBe("Company B");
    });

    it("should return empty array when no jobs exist", async () => {
      const result = await getJobs();

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should create data file if it does not exist", async () => {
      // Remove the file
      await fs.unlink(DATA_FILE);

      const result = await getJobs();

      expect(result).toHaveLength(0);
      // Check file was created
      const fileExists = await fs
        .access(DATA_FILE)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);
    });
  });

  describe("getJob", () => {
    it("should return a job when found by id", async () => {
      const mockJob = createMockJob({ company: "Target Company" });
      const mockJobs: Job[] = [
        createMockJob({ company: "Other Company" }),
        mockJob,
      ];
      await fs.writeFile(DATA_FILE, JSON.stringify(mockJobs), "utf-8");

      const result = await getJob(mockJob.id);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockJob.id);
      expect(result?.company).toBe("Target Company");
    });

    it("should return null when job is not found", async () => {
      const mockJobs: Job[] = [createMockJob()];
      await fs.writeFile(DATA_FILE, JSON.stringify(mockJobs), "utf-8");

      const result = await getJob("non-existent-id");

      expect(result).toBeNull();
    });

    it("should return null when jobs array is empty", async () => {
      const result = await getJob("any-id");

      expect(result).toBeNull();
    });
  });

  describe("createJob", () => {
    it("should create a new job with generated id and lastUpdated", async () => {
      const input: JobCreateInput = {
        company: "New Company",
        role: "Developer",
        url: "https://newcompany.com",
        status: "applied",
        salaryMin: 100000,
        salaryMax: 150000,
        notes: "Exciting opportunity",
        dateApplied: "2024-02-15",
      };

      const result = await createJob(input);

      expect(result.id).toBeDefined();
      expect(result.company).toBe("New Company");
      expect(result.role).toBe("Developer");
      expect(result.lastUpdated).toBeDefined();

      // Verify it was written to file
      const jobs = await getJobs();
      expect(jobs).toHaveLength(1);
      expect(jobs[0].id).toBe(result.id);
    });

    it("should add job to existing jobs array", async () => {
      const existingJob = createMockJob();
      await fs.writeFile(DATA_FILE, JSON.stringify([existingJob]), "utf-8");

      const input: JobCreateInput = {
        company: "Another Company",
        role: "Engineer",
        url: "https://example.com",
        status: "phone_screen",
        salaryMin: null,
        salaryMax: null,
        notes: "",
        dateApplied: "2024-02-16",
      };

      await createJob(input);

      const jobs = await getJobs();
      expect(jobs).toHaveLength(2);
      expect(jobs[1].company).toBe("Another Company");
    });

    it("should generate unique UUID for each job", async () => {
      const input: JobCreateInput = {
        company: "Test",
        role: "Test Role",
        url: "https://test.com",
        status: "applied",
        salaryMin: null,
        salaryMax: null,
        notes: "",
        dateApplied: "2024-02-15",
      };

      const job1 = await createJob(input);
      const job2 = await createJob(input);

      expect(job1.id).not.toBe(job2.id);
      expect(job1.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });

    it("should handle null salary values", async () => {
      const input: JobCreateInput = {
        company: "No Salary",
        role: "Role",
        url: "https://example.com",
        status: "applied",
        salaryMin: null,
        salaryMax: null,
        notes: "",
        dateApplied: "2024-02-15",
      };

      const result = await createJob(input);

      expect(result.salaryMin).toBeNull();
      expect(result.salaryMax).toBeNull();
    });
  });

  describe("updateJob", () => {
    it("should update an existing job and set new lastUpdated", async () => {
      const existingJob = createMockJob({
        company: "Old Company",
        role: "Old Role",
      });
      await fs.writeFile(DATA_FILE, JSON.stringify([existingJob]), "utf-8");

      // Wait a tiny bit to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 2));

      const updates: JobUpdateInput = {
        company: "New Company",
        role: "New Role",
        status: "offer",
      };

      const result = await updateJob(existingJob.id, updates);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(existingJob.id);
      expect(result?.company).toBe("New Company");
      expect(result?.role).toBe("New Role");
      expect(result?.status).toBe("offer");
      expect(result?.lastUpdated).not.toBe(existingJob.lastUpdated);
    });

    it("should return null when job is not found", async () => {
      const result = await updateJob("non-existent-id", { status: "rejected" });

      expect(result).toBeNull();

      // Verify file wasn't modified
      const jobs = await getJobs();
      expect(jobs).toHaveLength(0);
    });

    it("should allow partial updates", async () => {
      const existingJob = createMockJob({
        company: "Company",
        notes: "Old notes",
        status: "applied",
      });
      await fs.writeFile(DATA_FILE, JSON.stringify([existingJob]), "utf-8");

      const updates: JobUpdateInput = {
        notes: "Updated notes",
      };

      const result = await updateJob(existingJob.id, updates);

      expect(result?.company).toBe("Company");
      expect(result?.notes).toBe("Updated notes");
      expect(result?.status).toBe("applied");
    });

    it("should preserve unchanged fields", async () => {
      const existingJob = createMockJob({
        company: "Company",
        role: "Role",
        url: "https://example.com",
        salaryMin: 100000,
        salaryMax: 150000,
        dateApplied: "2024-02-01",
      });
      await fs.writeFile(DATA_FILE, JSON.stringify([existingJob]), "utf-8");

      const updates: JobUpdateInput = {
        status: "technical",
      };

      const result = await updateJob(existingJob.id, updates);

      expect(result?.company).toBe("Company");
      expect(result?.role).toBe("Role");
      expect(result?.url).toBe("https://example.com");
      expect(result?.salaryMin).toBe(100000);
      expect(result?.salaryMax).toBe(150000);
      expect(result?.dateApplied).toBe("2024-02-01");
    });

    it("should update correct job when multiple jobs exist", async () => {
      const job1 = createMockJob({ company: "Company 1" });
      const job2 = createMockJob({ company: "Company 2" });
      const job3 = createMockJob({ company: "Company 3" });
      await fs.writeFile(
        DATA_FILE,
        JSON.stringify([job1, job2, job3]),
        "utf-8"
      );

      await updateJob(job2.id, { company: "Updated Company 2" });

      const jobs = await getJobs();
      expect(jobs[0].company).toBe("Company 1");
      expect(jobs[1].company).toBe("Updated Company 2");
      expect(jobs[2].company).toBe("Company 3");
    });
  });

  describe("deleteJob", () => {
    it("should delete an existing job and return true", async () => {
      const job = createMockJob();
      await fs.writeFile(DATA_FILE, JSON.stringify([job]), "utf-8");

      const result = await deleteJob(job.id);

      expect(result).toBe(true);

      // Verify job was removed
      const jobs = await getJobs();
      expect(jobs).toHaveLength(0);
    });

    it("should return false when job is not found", async () => {
      const result = await deleteJob("non-existent-id");

      expect(result).toBe(false);

      // Verify file wasn't modified
      const jobs = await getJobs();
      expect(jobs).toHaveLength(0);
    });

    it("should delete correct job when multiple jobs exist", async () => {
      const job1 = createMockJob({ company: "Company 1" });
      const job2 = createMockJob({ company: "Company 2" });
      const job3 = createMockJob({ company: "Company 3" });
      await fs.writeFile(
        DATA_FILE,
        JSON.stringify([job1, job2, job3]),
        "utf-8"
      );

      const result = await deleteJob(job2.id);

      expect(result).toBe(true);

      const jobs = await getJobs();
      expect(jobs).toHaveLength(2);
      expect(jobs[0].id).toBe(job1.id);
      expect(jobs[1].id).toBe(job3.id);
    });

    it("should not modify array when deletion fails", async () => {
      const job = createMockJob();
      await fs.writeFile(DATA_FILE, JSON.stringify([job]), "utf-8");

      await deleteJob("wrong-id");

      const jobs = await getJobs();
      expect(jobs).toHaveLength(1);
      expect(jobs[0].id).toBe(job.id);
    });
  });

  describe("data file initialization", () => {
    it("should create data directory recursively if it does not exist", async () => {
      // Remove the entire data directory
      await fs.rm(DATA_DIR, { recursive: true, force: true });

      await getJobs();

      // Check directory was created
      const dirExists = await fs
        .access(DATA_DIR)
        .then(() => true)
        .catch(() => false);
      expect(dirExists).toBe(true);
    });

    it("should write empty array to new data file", async () => {
      await fs.unlink(DATA_FILE);

      await getJobs();

      const data = await fs.readFile(DATA_FILE, "utf-8");
      expect(JSON.parse(data)).toEqual([]);
    });
  });

  describe("data persistence", () => {
    it("should write jobs with proper JSON formatting", async () => {
      const input: JobCreateInput = {
        company: "Test",
        role: "Role",
        url: "https://test.com",
        status: "applied",
        salaryMin: null,
        salaryMax: null,
        notes: "",
        dateApplied: "2024-02-15",
      };

      await createJob(input);

      const data = await fs.readFile(DATA_FILE, "utf-8");
      expect(() => JSON.parse(data)).not.toThrow();
      // Check for pretty-printing (newlines indicate indentation)
      expect(data).toContain("\n");
    });
  });
});
