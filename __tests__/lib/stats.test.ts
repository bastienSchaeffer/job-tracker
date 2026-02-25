import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateApplicationsByWeek,
  calculateTimeByCompany,
  calculateExtendedStats,
} from "@/lib/stats";
import type { Job } from "@/lib/types";

const createJob = (overrides: Partial<Job> = {}): Job => ({
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

describe("calculateApplicationsByWeek", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-02-15"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns empty weeks when no jobs", () => {
    const result = calculateApplicationsByWeek([], 4);
    expect(result).toHaveLength(4);
    expect(result.every((w) => w.count === 0)).toBe(true);
  });

  it("groups jobs by week", () => {
    const jobs = [
      createJob({ dateApplied: "2024-02-12" }),
      createJob({ dateApplied: "2024-02-13" }),
      createJob({ dateApplied: "2024-02-05" }),
    ];

    const result = calculateApplicationsByWeek(jobs, 4);
    const totalCount = result.reduce((sum, w) => sum + w.count, 0);
    expect(totalCount).toBe(3);

    const weekWithTwo = result.find((w) => w.count === 2);
    const weekWithOne = result.find((w) => w.count === 1);
    expect(weekWithTwo).toBeDefined();
    expect(weekWithOne).toBeDefined();
  });

  it("excludes jobs outside the week range", () => {
    const jobs = [
      createJob({ dateApplied: "2024-02-12" }),
      createJob({ dateApplied: "2023-01-01" }),
    ];

    const result = calculateApplicationsByWeek(jobs, 4);
    const totalCount = result.reduce((sum, w) => sum + w.count, 0);
    expect(totalCount).toBe(1);
  });

  it("formats week labels correctly", () => {
    const result = calculateApplicationsByWeek([], 2);
    expect(result[0].weekLabel).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });
});

describe("calculateTimeByCompany", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-02-15"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns empty array for no jobs", () => {
    const result = calculateTimeByCompany([]);
    expect(result).toHaveLength(0);
  });

  it("calculates days since application", () => {
    const jobs = [createJob({ company: "Acme", dateApplied: "2024-02-10" })];

    const result = calculateTimeByCompany(jobs);
    expect(result[0].company).toBe("Acme");
    expect(result[0].days).toBe(5);
  });

  it("sorts by days descending", () => {
    const jobs = [
      createJob({ company: "Recent", dateApplied: "2024-02-14" }),
      createJob({ company: "Old", dateApplied: "2024-01-01" }),
      createJob({ company: "Middle", dateApplied: "2024-02-01" }),
    ];

    const result = calculateTimeByCompany(jobs);
    expect(result[0].company).toBe("Old");
    expect(result[1].company).toBe("Middle");
    expect(result[2].company).toBe("Recent");
  });

  it("limits to specified number of results", () => {
    const jobs = Array.from({ length: 15 }, (_, i) =>
      createJob({ company: `Company ${i}`, dateApplied: "2024-02-01" })
    );

    const result = calculateTimeByCompany(jobs, 5);
    expect(result).toHaveLength(5);
  });

  it("includes job status", () => {
    const jobs = [createJob({ company: "Test", status: "offer" })];

    const result = calculateTimeByCompany(jobs);
    expect(result[0].status).toBe("offer");
  });
});

describe("calculateExtendedStats", () => {
  it("returns zeros for empty jobs array", () => {
    const result = calculateExtendedStats([]);

    expect(result.totalCount).toBe(0);
    expect(result.activeCount).toBe(0);
    expect(result.offerCount).toBe(0);
    expect(result.rejectionRate).toBe(0);
  });

  it("calculates total count correctly", () => {
    const jobs = [createJob(), createJob(), createJob()];
    const result = calculateExtendedStats(jobs);
    expect(result.totalCount).toBe(3);
  });

  it("calculates active count for non-terminal statuses", () => {
    const jobs = [
      createJob({ status: "applied" }),
      createJob({ status: "phone_screen" }),
      createJob({ status: "technical" }),
      createJob({ status: "onsite" }),
      createJob({ status: "offer" }),
      createJob({ status: "rejected" }),
    ];

    const result = calculateExtendedStats(jobs);
    expect(result.activeCount).toBe(4);
  });

  it("calculates offer count correctly", () => {
    const jobs = [
      createJob({ status: "offer" }),
      createJob({ status: "offer" }),
      createJob({ status: "applied" }),
    ];

    const result = calculateExtendedStats(jobs);
    expect(result.offerCount).toBe(2);
  });

  it("calculates rejection rate from terminal statuses only", () => {
    const jobs = [
      createJob({ status: "rejected" }),
      createJob({ status: "rejected" }),
      createJob({ status: "offer" }),
      createJob({ status: "applied" }),
    ];

    const result = calculateExtendedStats(jobs);
    expect(result.rejectionRate).toBeCloseTo(66.67, 1);
  });

  it("returns 0 rejection rate when no terminal statuses", () => {
    const jobs = [
      createJob({ status: "applied" }),
      createJob({ status: "technical" }),
    ];

    const result = calculateExtendedStats(jobs);
    expect(result.rejectionRate).toBe(0);
  });

  it("includes count by status", () => {
    const jobs = [
      createJob({ status: "applied" }),
      createJob({ status: "applied" }),
      createJob({ status: "offer" }),
    ];

    const result = calculateExtendedStats(jobs);
    const appliedStatus = result.countByStatus.find(
      (s) => s.status === "applied"
    );
    const offerStatus = result.countByStatus.find((s) => s.status === "offer");

    expect(appliedStatus?.count).toBe(2);
    expect(offerStatus?.count).toBe(1);
  });

  it("includes all status types even with zero count", () => {
    const result = calculateExtendedStats([]);
    expect(result.countByStatus).toHaveLength(6);
  });
});
