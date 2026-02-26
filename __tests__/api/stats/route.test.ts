import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/stats/route";
import type { Job, JobStats } from "@/lib/types";

vi.mock("@/lib/db", () => ({
  getJobs: vi.fn(),
}));

import { getJobs } from "@/lib/db";

const mockGetJobs = vi.mocked(getJobs);

function createMockJob(overrides: Partial<Job> = {}): Job {
  return {
    id: crypto.randomUUID(),
    company: "Test Company",
    role: "Software Engineer",
    url: "https://example.com/job",
    status: "applied",
    salaryMin: 100000,
    salaryMax: 150000,
    notes: "",
    dateApplied: "2025-01-01",
    lastUpdated: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("/api/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("returns stats with zero counts when no jobs exist", async () => {
      mockGetJobs.mockResolvedValue([]);

      const response = await GET();
      const data = (await response.json()) as JobStats;

      expect(response.status).toBe(200);
      expect(data.totalCount).toBe(0);
      expect(data.countByStatus).toHaveLength(6);
      expect(data.countByStatus.every((s) => s.count === 0)).toBe(true);
      expect(data.averageTimeByStage).toHaveLength(6);
    });

    it("returns correct total count", async () => {
      mockGetJobs.mockResolvedValue([
        createMockJob({ status: "applied" }),
        createMockJob({ status: "phone_screen" }),
        createMockJob({ status: "technical" }),
      ]);

      const response = await GET();
      const data = (await response.json()) as JobStats;

      expect(response.status).toBe(200);
      expect(data.totalCount).toBe(3);
    });

    it("returns correct count by status", async () => {
      mockGetJobs.mockResolvedValue([
        createMockJob({ status: "applied" }),
        createMockJob({ status: "applied" }),
        createMockJob({ status: "phone_screen" }),
        createMockJob({ status: "offer" }),
      ]);

      const response = await GET();
      const data = (await response.json()) as JobStats;

      expect(response.status).toBe(200);

      const appliedCount = data.countByStatus.find(
        (s) => s.status === "applied"
      );
      expect(appliedCount?.count).toBe(2);
      expect(appliedCount?.label).toBe("Applied");

      const phoneScreenCount = data.countByStatus.find(
        (s) => s.status === "phone_screen"
      );
      expect(phoneScreenCount?.count).toBe(1);

      const offerCount = data.countByStatus.find((s) => s.status === "offer");
      expect(offerCount?.count).toBe(1);

      const rejectedCount = data.countByStatus.find(
        (s) => s.status === "rejected"
      );
      expect(rejectedCount?.count).toBe(0);
    });

    it("returns correct average time by stage", async () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const twentyDaysAgo = new Date();
      twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

      mockGetJobs.mockResolvedValue([
        createMockJob({
          status: "applied",
          dateApplied: tenDaysAgo.toISOString().split("T")[0],
        }),
        createMockJob({
          status: "applied",
          dateApplied: twentyDaysAgo.toISOString().split("T")[0],
        }),
      ]);

      const response = await GET();
      const data = (await response.json()) as JobStats;

      expect(response.status).toBe(200);

      const appliedStage = data.averageTimeByStage.find(
        (s) => s.status === "applied"
      );
      expect(appliedStage?.count).toBe(2);
      expect(appliedStage?.averageDays).toBe(15);
    });

    it("includes all statuses in response", async () => {
      mockGetJobs.mockResolvedValue([createMockJob({ status: "applied" })]);

      const response = await GET();
      const data = (await response.json()) as JobStats;

      const expectedStatuses = [
        "applied",
        "phone_screen",
        "technical",
        "onsite",
        "offer",
        "rejected",
      ];

      expect(data.countByStatus.map((s) => s.status)).toEqual(expectedStatuses);
      expect(data.averageTimeByStage.map((s) => s.status)).toEqual(
        expectedStatuses
      );
    });

    it("returns 500 when database fails", async () => {
      mockGetJobs.mockRejectedValue(new Error("Database error"));

      const response = await GET();
      const data = (await response.json()) as { error: string };

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });
});
