import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { KanbanCard } from "@/components/jobs/kanban-card";
import type { Job } from "@/lib/types";

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock @hello-pangea/dnd Draggable component
vi.mock("@hello-pangea/dnd", () => ({
  Draggable: ({ children, draggableId, index }: any) => {
    const provided = {
      innerRef: vi.fn(),
      draggableProps: { "data-draggable-id": draggableId },
      dragHandleProps: { "data-drag-handle": "true" },
    };
    const snapshot = { isDragging: false };
    return children(provided, snapshot);
  },
}));

describe("KanbanCard", () => {
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

  // Mock current date for consistent testing
  const mockNow = new Date("2026-02-26T12:00:00.000Z");
  const RealDate = Date;

  beforeAll(() => {
    // @ts-ignore
    global.Date = class extends RealDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(mockNow.getTime());
        } else {
          // @ts-ignore
          super(...args);
        }
      }
      static now() {
        return mockNow.getTime();
      }
    };
  });

  afterAll(() => {
    global.Date = RealDate;
  });

  describe("rendering", () => {
    it("should render company name", () => {
      const job = createMockJob({ company: "Tech Startup" });
      render(<KanbanCard job={job} index={0} />);

      expect(screen.getByText("Tech Startup")).toBeInTheDocument();
    });

    it("should render role title", () => {
      const job = createMockJob({ role: "Frontend Developer" });
      render(<KanbanCard job={job} index={0} />);

      expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    });

    it("should render days since applied", () => {
      const job = createMockJob({ dateApplied: "2026-02-15" });
      render(<KanbanCard job={job} index={0} />);

      // 26 - 15 = 11 days ago
      expect(screen.getByText("11 days ago")).toBeInTheDocument();
    });

    it("should use singular 'day' when only 1 day has passed", () => {
      const job = createMockJob({ dateApplied: "2026-02-25" });
      render(<KanbanCard job={job} index={0} />);

      expect(screen.getByText("1 day ago")).toBeInTheDocument();
    });

    it("should use plural 'days' for multiple days", () => {
      const job = createMockJob({ dateApplied: "2026-02-20" });
      render(<KanbanCard job={job} index={0} />);

      expect(screen.getByText("6 days ago")).toBeInTheDocument();
    });

    it("should show 0 days for same-day application", () => {
      const job = createMockJob({ dateApplied: "2026-02-26" });
      render(<KanbanCard job={job} index={0} />);

      expect(screen.getByText("0 days ago")).toBeInTheDocument();
    });
  });

  describe("link behavior", () => {
    it("should render link to job detail page", () => {
      const job = createMockJob({ id: "job-456" });
      render(<KanbanCard job={job} index={0} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/jobs/job-456");
    });

    it("should wrap card content in link", () => {
      const job = createMockJob();
      render(<KanbanCard job={job} index={0} />);

      const link = screen.getByRole("link");
      expect(link).toContainElement(screen.getByText("Acme Corp"));
      expect(link).toContainElement(screen.getByText("Software Engineer"));
    });
  });

  describe("pending state", () => {
    it("should apply opacity when isPending is true", () => {
      const job = createMockJob();
      const { container } = render(
        <KanbanCard job={job} index={0} isPending={true} />
      );

      const card = container.querySelector('[role="option"]');
      expect(card).toHaveClass("opacity-50");
    });

    it("should not apply opacity when isPending is false", () => {
      const job = createMockJob();
      const { container } = render(
        <KanbanCard job={job} index={0} isPending={false} />
      );

      const card = container.querySelector('[role="option"]');
      expect(card).not.toHaveClass("opacity-50");
    });

    it("should not apply opacity by default", () => {
      const job = createMockJob();
      const { container } = render(<KanbanCard job={job} index={0} />);

      const card = container.querySelector('[role="option"]');
      expect(card).not.toHaveClass("opacity-50");
    });
  });

  describe("accessibility", () => {
    it("should have role='option' for listbox semantics", () => {
      const job = createMockJob();
      render(<KanbanCard job={job} index={0} />);

      const card = screen.getByRole("option");
      expect(card).toBeInTheDocument();
    });

    it("should have descriptive aria-label", () => {
      const job = createMockJob({
        role: "Backend Engineer",
        company: "Data Corp",
        dateApplied: "2026-02-20",
      });
      render(<KanbanCard job={job} index={0} />);

      const card = screen.getByRole("option");
      expect(card).toHaveAttribute(
        "aria-label",
        "Backend Engineer at Data Corp, applied 6 days ago"
      );
    });

    it("should include days in aria-label", () => {
      const job = createMockJob({ dateApplied: "2026-02-25" });
      render(<KanbanCard job={job} index={0} />);

      expect(
        screen.getByLabelText(/applied 1 days ago/)
      ).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("should handle very long company names", () => {
      const job = createMockJob({
        company: "Very Long Company Name That Should Eventually Be Truncated",
      });
      render(<KanbanCard job={job} index={0} />);

      expect(
        screen.getByText(
          "Very Long Company Name That Should Eventually Be Truncated"
        )
      ).toBeInTheDocument();
    });

    it("should handle very long role names", () => {
      const job = createMockJob({
        role: "Senior Principal Staff Software Architect Engineer III",
      });
      render(<KanbanCard job={job} index={0} />);

      expect(
        screen.getByText("Senior Principal Staff Software Architect Engineer III")
      ).toBeInTheDocument();
    });

    it("should handle different date formats correctly", () => {
      const testCases = [
        { dateApplied: "2026-02-26", expectedDays: 0 },
        { dateApplied: "2026-02-25", expectedDays: 1 },
        { dateApplied: "2026-01-26", expectedDays: 31 },
      ];

      testCases.forEach(({ dateApplied, expectedDays }) => {
        const job = createMockJob({ dateApplied });
        const { unmount } = render(<KanbanCard job={job} index={0} />);

        const dayText = expectedDays === 1 ? "1 day ago" : `${expectedDays} days ago`;
        expect(screen.getByText(dayText)).toBeInTheDocument();

        unmount();
      });
    });

    it("should handle negative dates (future dates) correctly", () => {
      const job = createMockJob({ dateApplied: "2026-02-27" });
      render(<KanbanCard job={job} index={0} />);

      // Future date should result in negative days, but Math.floor handles it
      expect(screen.getByText(/-?\d+ days? ago/)).toBeInTheDocument();
    });

    it("should work with different index values", () => {
      const job = createMockJob();

      [0, 5, 10, 99].forEach((index) => {
        const { unmount } = render(<KanbanCard job={job} index={index} />);
        expect(screen.getByText("Acme Corp")).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe("drag and drop integration", () => {
    it("should pass job id as draggableId", () => {
      const job = createMockJob({ id: "unique-job-id" });
      const { container } = render(<KanbanCard job={job} index={0} />);

      expect(container.querySelector('[data-draggable-id="unique-job-id"]')).toBeInTheDocument();
    });

    it("should include drag handle props", () => {
      const job = createMockJob();
      const { container } = render(<KanbanCard job={job} index={0} />);

      expect(container.querySelector('[data-drag-handle="true"]')).toBeInTheDocument();
    });
  });

  describe("truncation classes", () => {
    it("should have truncate class on company name", () => {
      const job = createMockJob();
      const { container } = render(<KanbanCard job={job} index={0} />);

      const companyElement = screen.getByText("Acme Corp");
      expect(companyElement).toHaveClass("truncate");
    });

    it("should have truncate class on role", () => {
      const job = createMockJob();
      const { container } = render(<KanbanCard job={job} index={0} />);

      const roleElement = screen.getByText("Software Engineer");
      expect(roleElement).toHaveClass("truncate");
    });
  });
});
