import { describe, it, expect } from "vitest";
import { JOB_STATUSES, STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";

describe("constants", () => {
  describe("JOB_STATUSES", () => {
    it("contains all expected statuses", () => {
      expect(JOB_STATUSES).toContain("applied");
      expect(JOB_STATUSES).toContain("phone_screen");
      expect(JOB_STATUSES).toContain("technical");
      expect(JOB_STATUSES).toContain("onsite");
      expect(JOB_STATUSES).toContain("offer");
      expect(JOB_STATUSES).toContain("rejected");
    });

    it("has exactly 6 statuses", () => {
      expect(JOB_STATUSES).toHaveLength(6);
    });
  });

  describe("STATUS_LABELS", () => {
    it("has a label for each status", () => {
      JOB_STATUSES.forEach((status) => {
        expect(STATUS_LABELS[status]).toBeDefined();
        expect(typeof STATUS_LABELS[status]).toBe("string");
      });
    });
  });

  describe("STATUS_COLORS", () => {
    it("has colors for each status", () => {
      JOB_STATUSES.forEach((status) => {
        expect(STATUS_COLORS[status]).toBeDefined();
        expect(typeof STATUS_COLORS[status]).toBe("string");
      });
    });
  });
});
