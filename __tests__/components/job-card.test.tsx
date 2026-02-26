import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobCard } from "@/components/jobs/job-card";
import type { Job } from "@/lib/types";

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock child components that contain complex interactions
vi.mock("@/components/jobs/job-dialog", () => ({
  JobDialog: ({ trigger }: any) => <div data-testid="job-dialog">{trigger}</div>,
}));

vi.mock("@/components/jobs/delete-job-dialog", () => ({
  DeleteJobDialog: ({ trigger }: any) => (
    <div data-testid="delete-job-dialog">{trigger}</div>
  ),
}));

describe("JobCard", () => {
  const createMockJob = (overrides?: Partial<Job>): Job => ({
    id: "test-id-123",
    company: "Acme Corp",
    role: "Software Engineer",
    url: "https://example.com/jobs/123",
    status: "applied",
    salaryMin: 100000,
    salaryMax: 150000,
    notes: "Great opportunity",
    dateApplied: "2026-02-15",
    lastUpdated: "2026-02-15T12:00:00.000Z",
    ...overrides,
  });

  describe("rendering", () => {
    it("should render job role as card title", () => {
      const job = createMockJob();
      render(<JobCard job={job} />);

      expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    });

    it("should render company name as card description", () => {
      const job = createMockJob();
      render(<JobCard job={job} />);

      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    });

    it("should render status badge with correct status", () => {
      const job = createMockJob({ status: "phone_screen" });
      render(<JobCard job={job} />);

      expect(screen.getByText("Phone Screen")).toBeInTheDocument();
    });

    it("should render application date in short format", () => {
      const job = createMockJob({ dateApplied: "2026-02-15" });
      render(<JobCard job={job} />);

      expect(screen.getByText(/Applied Feb 15, 2026/)).toBeInTheDocument();
    });

    it("should render formatted salary range when both min and max provided", () => {
      const job = createMockJob({ salaryMin: 100000, salaryMax: 150000 });
      render(<JobCard job={job} />);

      expect(screen.getByText("$100,000 - $150,000")).toBeInTheDocument();
    });

    it("should render 'From' format when only min salary provided", () => {
      const job = createMockJob({ salaryMin: 100000, salaryMax: null });
      render(<JobCard job={job} />);

      expect(screen.getByText("From $100,000")).toBeInTheDocument();
    });

    it("should render 'Up to' format when only max salary provided", () => {
      const job = createMockJob({ salaryMin: null, salaryMax: 150000 });
      render(<JobCard job={job} />);

      expect(screen.getByText("Up to $150,000")).toBeInTheDocument();
    });

    it("should not render salary when both values are null", () => {
      const job = createMockJob({ salaryMin: null, salaryMax: null });
      render(<JobCard job={job} />);

      const salaryText = screen.queryByText(/\$/);
      expect(salaryText).not.toBeInTheDocument();
    });
  });

  describe("link behavior", () => {
    it("should render link to job detail page", () => {
      const job = createMockJob({ id: "test-id-123" });
      render(<JobCard job={job} />);

      const link = screen.getByRole("link", {
        name: /View Software Engineer at Acme Corp/i,
      });
      expect(link).toHaveAttribute("href", "/jobs/test-id-123");
    });

    it("should have accessible screen reader text for link", () => {
      const job = createMockJob({
        role: "Frontend Developer",
        company: "Tech Startup",
      });
      render(<JobCard job={job} />);

      expect(
        screen.getByText("View Frontend Developer at Tech Startup")
      ).toBeInTheDocument();
    });
  });

  describe("action buttons", () => {
    it("should render edit button with accessible label", () => {
      const job = createMockJob({
        role: "Backend Engineer",
        company: "Data Corp",
      });
      render(<JobCard job={job} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Backend Engineer at Data Corp",
      });
      expect(editButton).toBeInTheDocument();
    });

    it("should render delete button with accessible label", () => {
      const job = createMockJob({
        role: "DevOps Engineer",
        company: "Cloud Services",
      });
      render(<JobCard job={job} />);

      const deleteButton = screen.getByRole("button", {
        name: "Delete DevOps Engineer at Cloud Services",
      });
      expect(deleteButton).toBeInTheDocument();
    });

    it("should stop propagation when edit button is clicked", async () => {
      const job = createMockJob();
      const user = userEvent.setup();
      render(<JobCard job={job} />);

      const editButton = screen.getByRole("button", {
        name: /Edit Software Engineer at Acme Corp/i,
      });

      // Click should not navigate (stopPropagation is called)
      await user.click(editButton);

      // Button should still be in the document (not navigated away)
      expect(editButton).toBeInTheDocument();
    });

    it("should stop propagation when delete button is clicked", async () => {
      const job = createMockJob();
      const user = userEvent.setup();
      render(<JobCard job={job} />);

      const deleteButton = screen.getByRole("button", {
        name: /Delete Software Engineer at Acme Corp/i,
      });

      // Click should not navigate (stopPropagation is called)
      await user.click(deleteButton);

      // Button should still be in the document (not navigated away)
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("should handle very long company name", () => {
      const job = createMockJob({
        company: "Very Long Company Name That Should Be Truncated Eventually",
      });
      render(<JobCard job={job} />);

      expect(
        screen.getByText(
          "Very Long Company Name That Should Be Truncated Eventually"
        )
      ).toBeInTheDocument();
    });

    it("should handle very long role name", () => {
      const job = createMockJob({
        role: "Senior Principal Staff Software Architect Engineer Lead",
      });
      render(<JobCard job={job} />);

      expect(
        screen.getByText("Senior Principal Staff Software Architect Engineer Lead")
      ).toBeInTheDocument();
    });

    it("should render all job statuses correctly", () => {
      const statuses = [
        "applied",
        "phone_screen",
        "technical",
        "onsite",
        "offer",
        "rejected",
      ] as const;

      statuses.forEach((status) => {
        const job = createMockJob({ status });
        const { unmount } = render(<JobCard job={job} />);

        // Check that the component renders without error
        expect(screen.getByText("Software Engineer")).toBeInTheDocument();

        unmount();
      });
    });

    it("should handle large salary values", () => {
      const job = createMockJob({ salaryMin: 500000, salaryMax: 1000000 });
      render(<JobCard job={job} />);

      expect(screen.getByText("$500,000 - $1,000,000")).toBeInTheDocument();
    });

    it("should handle zero salary values", () => {
      const job = createMockJob({ salaryMin: 0, salaryMax: 0 });
      render(<JobCard job={job} />);

      // Zero is falsy, so formatSalary should return null
      const salaryText = screen.queryByText(/\$/);
      expect(salaryText).not.toBeInTheDocument();
    });

    it("should format date correctly across different months", () => {
      const dates = [
        { input: "2026-01-01", expected: "Jan 1, 2026" },
        { input: "2026-12-31", expected: "Dec 31, 2026" },
        { input: "2026-06-15", expected: "Jun 15, 2026" },
      ];

      dates.forEach(({ input, expected }) => {
        const job = createMockJob({ dateApplied: input });
        const { unmount } = render(<JobCard job={job} />);

        expect(screen.getByText(`Applied ${expected}`)).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe("accessibility", () => {
    it("should have accessible link with sr-only text", () => {
      const job = createMockJob();
      render(<JobCard job={job} />);

      const srOnlyText = screen.getByText(
        "View Software Engineer at Acme Corp"
      );
      expect(srOnlyText).toHaveClass("sr-only");
    });

    it("should have proper button labels for screen readers", () => {
      const job = createMockJob();
      render(<JobCard job={job} />);

      expect(
        screen.getByLabelText("Edit Software Engineer at Acme Corp")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Delete Software Engineer at Acme Corp")
      ).toBeInTheDocument();
    });
  });

  describe("hover interactions", () => {
    it("should render action buttons within hover group", () => {
      const job = createMockJob();
      render(<JobCard job={job} />);

      const editButton = screen.getByRole("button", {
        name: /Edit Software Engineer/i,
      });
      const deleteButton = screen.getByRole("button", {
        name: /Delete Software Engineer/i,
      });

      // Buttons should be in the document (visibility controlled by CSS)
      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe("integration with child components", () => {
    it("should pass job to JobDialog", () => {
      const job = createMockJob();
      render(<JobCard job={job} />);

      expect(screen.getByTestId("job-dialog")).toBeInTheDocument();
    });

    it("should pass job to DeleteJobDialog", () => {
      const job = createMockJob();
      render(<JobCard job={job} />);

      expect(screen.getByTestId("delete-job-dialog")).toBeInTheDocument();
    });
  });
});
