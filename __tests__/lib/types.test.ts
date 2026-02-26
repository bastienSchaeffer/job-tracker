import { describe, it, expect } from "vitest";
import type {
  JobsViewMode,
  JobsByStatus,
  Job,
  JobStatus,
} from "@/lib/types";

describe("types", () => {
  describe("JobsViewMode", () => {
    it("should accept 'list' as valid value", () => {
      const viewMode: JobsViewMode = "list";
      expect(viewMode).toBe("list");
    });

    it("should accept 'board' as valid value", () => {
      const viewMode: JobsViewMode = "board";
      expect(viewMode).toBe("board");
    });

    // TypeScript compile-time check - these would fail at compile time
    // const invalid: JobsViewMode = "invalid"; // ✗ Type error
    // const invalid2: JobsViewMode = "table"; // ✗ Type error
  });

  describe("JobsByStatus", () => {
    it("should allow mapping all job statuses to job arrays", () => {
      const mockJob: Job = {
        id: "1",
        company: "Test Co",
        role: "Engineer",
        url: "https://example.com",
        status: "applied",
        salaryMin: 100000,
        salaryMax: 150000,
        notes: "Test",
        dateApplied: "2026-02-26",
        lastUpdated: "2026-02-26T12:00:00.000Z",
      };

      const jobsByStatus: JobsByStatus = {
        applied: [mockJob],
        phone_screen: [],
        technical: [],
        onsite: [],
        offer: [],
        rejected: [],
      };

      expect(jobsByStatus.applied).toHaveLength(1);
      expect(jobsByStatus.phone_screen).toHaveLength(0);
      expect(jobsByStatus.applied[0]).toBe(mockJob);
    });

    it("should allow accessing jobs by status key", () => {
      const jobsByStatus: JobsByStatus = {
        applied: [],
        phone_screen: [],
        technical: [],
        onsite: [],
        offer: [],
        rejected: [],
      };

      const status: JobStatus = "technical";
      const jobs = jobsByStatus[status];

      expect(jobs).toEqual([]);
      expect(Array.isArray(jobs)).toBe(true);
    });

    it("should allow mutation of job arrays", () => {
      const jobsByStatus: JobsByStatus = {
        applied: [],
        phone_screen: [],
        technical: [],
        onsite: [],
        offer: [],
        rejected: [],
      };

      const mockJob: Job = {
        id: "1",
        company: "Test Co",
        role: "Engineer",
        url: "https://example.com",
        status: "applied",
        salaryMin: null,
        salaryMax: null,
        notes: "",
        dateApplied: "2026-02-26",
        lastUpdated: "2026-02-26T12:00:00.000Z",
      };

      jobsByStatus.applied.push(mockJob);

      expect(jobsByStatus.applied).toHaveLength(1);
      expect(jobsByStatus.applied[0]).toBe(mockJob);
    });
  });
});
