import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { KanbanColumn } from "@/components/jobs/kanban-column";
import type { Job, JobStatus } from "@/lib/types";

// Mock KanbanCard child component
vi.mock("@/components/jobs/kanban-card", () => ({
  KanbanCard: ({ job, index, isPending }: any) => (
    <div
      data-testid={`kanban-card-${job.id}`}
      data-index={index}
      data-pending={isPending}
    >
      {job.company} - {job.role}
    </div>
  ),
}));

// Mock @hello-pangea/dnd Droppable component
vi.mock("@hello-pangea/dnd", () => ({
  Droppable: ({ children, droppableId }: any) => {
    const provided = {
      innerRef: vi.fn(),
      droppableProps: { "data-droppable-id": droppableId },
      placeholder: <div data-testid="droppable-placeholder" />,
    };
    const snapshot = { isDraggingOver: false };
    return children(provided, snapshot);
  },
}));

describe("KanbanColumn", () => {
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
    it("should render status label", () => {
      render(
        <KanbanColumn
          status="applied"
          jobs={[]}
          pendingJobIds={new Set()}
        />
      );

      expect(screen.getByText("Applied")).toBeInTheDocument();
    });

    it("should render correct label for phone_screen status", () => {
      render(
        <KanbanColumn
          status="phone_screen"
          jobs={[]}
          pendingJobIds={new Set()}
        />
      );

      expect(screen.getByText("Phone Screen")).toBeInTheDocument();
    });

    it("should render job count badge", () => {
      const jobs = [
        createMockJob({ id: "1" }),
        createMockJob({ id: "2" }),
        createMockJob({ id: "3" }),
      ];

      render(
        <KanbanColumn
          status="applied"
          jobs={jobs}
          pendingJobIds={new Set()}
        />
      );

      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("should render zero count when no jobs", () => {
      render(
        <KanbanColumn
          status="applied"
          jobs={[]}
          pendingJobIds={new Set()}
        />
      );

      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("region semantics", () => {
    it("should have role='region'", () => {
      render(
        <KanbanColumn
          status="applied"
          jobs={[]}
          pendingJobIds={new Set()}
        />
      );

      const region = screen.getByRole("region");
      expect(region).toBeInTheDocument();
    });

    it("should have descriptive aria-label with status and count", () => {
      const jobs = [createMockJob({ id: "1" }), createMockJob({ id: "2" })];

      render(
        <KanbanColumn
          status="technical"
          jobs={jobs}
          pendingJobIds={new Set()}
        />
      );

      const region = screen.getByRole("region");
      expect(region).toHaveAttribute(
        "aria-label",
        "Technical column with 2 jobs"
      );
    });

    it("should use singular 'job' for single job count", () => {
      const jobs = [createMockJob()];

      render(
        <KanbanColumn
          status="offer"
          jobs={jobs}
          pendingJobIds={new Set()}
        />
      );

      const region = screen.getByRole("region");
      expect(region).toHaveAttribute("aria-label", "Offer column with 1 job");
    });
  });

  describe("empty state", () => {
    it("should show 'No jobs' message when empty", () => {
      render(
        <KanbanColumn
          status="applied"
          jobs={[]}
          pendingJobIds={new Set()}
        />
      );

      expect(screen.getByText("No jobs")).toBeInTheDocument();
    });

    it("should not show empty message when jobs exist", () => {
      const jobs = [createMockJob()];

      render(
        <KanbanColumn
          status="applied"
          jobs={jobs}
          pendingJobIds={new Set()}
        />
      );

      expect(screen.queryByText("No jobs")).not.toBeInTheDocument();
    });
  });

  describe("job rendering", () => {
    it("should render all jobs in the column", () => {
      const jobs = [
        createMockJob({ id: "1", company: "Company A" }),
        createMockJob({ id: "2", company: "Company B" }),
        createMockJob({ id: "3", company: "Company C" }),
      ];

      render(
        <KanbanColumn
          status="applied"
          jobs={jobs}
          pendingJobIds={new Set()}
        />
      );

      expect(screen.getByTestId("kanban-card-1")).toBeInTheDocument();
      expect(screen.getByTestId("kanban-card-2")).toBeInTheDocument();
      expect(screen.getByTestId("kanban-card-3")).toBeInTheDocument();
    });

    it("should pass correct index to each KanbanCard", () => {
      const jobs = [
        createMockJob({ id: "1" }),
        createMockJob({ id: "2" }),
        createMockJob({ id: "3" }),
      ];

      render(
        <KanbanColumn
          status="applied"
          jobs={jobs}
          pendingJobIds={new Set()}
        />
      );

      expect(screen.getByTestId("kanban-card-1")).toHaveAttribute(
        "data-index",
        "0"
      );
      expect(screen.getByTestId("kanban-card-2")).toHaveAttribute(
        "data-index",
        "1"
      );
      expect(screen.getByTestId("kanban-card-3")).toHaveAttribute(
        "data-index",
        "2"
      );
    });

    it("should pass isPending=true for jobs in pendingJobIds", () => {
      const jobs = [
        createMockJob({ id: "1" }),
        createMockJob({ id: "2" }),
        createMockJob({ id: "3" }),
      ];
      const pendingJobIds = new Set(["2"]);

      render(
        <KanbanColumn
          status="applied"
          jobs={jobs}
          pendingJobIds={pendingJobIds}
        />
      );

      expect(screen.getByTestId("kanban-card-1")).toHaveAttribute(
        "data-pending",
        "false"
      );
      expect(screen.getByTestId("kanban-card-2")).toHaveAttribute(
        "data-pending",
        "true"
      );
      expect(screen.getByTestId("kanban-card-3")).toHaveAttribute(
        "data-pending",
        "false"
      );
    });

    it("should handle multiple pending jobs", () => {
      const jobs = [
        createMockJob({ id: "1" }),
        createMockJob({ id: "2" }),
        createMockJob({ id: "3" }),
      ];
      const pendingJobIds = new Set(["1", "3"]);

      render(
        <KanbanColumn
          status="applied"
          jobs={jobs}
          pendingJobIds={pendingJobIds}
        />
      );

      expect(screen.getByTestId("kanban-card-1")).toHaveAttribute(
        "data-pending",
        "true"
      );
      expect(screen.getByTestId("kanban-card-2")).toHaveAttribute(
        "data-pending",
        "false"
      );
      expect(screen.getByTestId("kanban-card-3")).toHaveAttribute(
        "data-pending",
        "true"
      );
    });
  });

  describe("droppable integration", () => {
    it("should have droppable area with status as id", () => {
      const { container } = render(
        <KanbanColumn
          status="technical"
          jobs={[]}
          pendingJobIds={new Set()}
        />
      );

      expect(
        container.querySelector('[data-droppable-id="technical"]')
      ).toBeInTheDocument();
    });

    it("should render placeholder for drag and drop", () => {
      render(
        <KanbanColumn
          status="applied"
          jobs={[]}
          pendingJobIds={new Set()}
        />
      );

      expect(screen.getByTestId("droppable-placeholder")).toBeInTheDocument();
    });
  });

  describe("all job statuses", () => {
    const statuses: Array<{ status: JobStatus; label: string }> = [
      { status: "applied", label: "Applied" },
      { status: "phone_screen", label: "Phone Screen" },
      { status: "technical", label: "Technical" },
      { status: "onsite", label: "Onsite" },
      { status: "offer", label: "Offer" },
      { status: "rejected", label: "Rejected" },
    ];

    statuses.forEach(({ status, label }) => {
      it(`should render correctly for ${status} status`, () => {
        render(
          <KanbanColumn
            status={status}
            jobs={[]}
            pendingJobIds={new Set()}
          />
        );

        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.getByRole("region")).toHaveAttribute(
          "aria-label",
          `${label} column with 0 jobs`
        );
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty pendingJobIds set", () => {
      const jobs = [createMockJob()];

      render(
        <KanbanColumn
          status="applied"
          jobs={jobs}
          pendingJobIds={new Set()}
        />
      );

      expect(screen.getByTestId("kanban-card-test-id-123")).toHaveAttribute(
        "data-pending",
        "false"
      );
    });

    it("should handle large number of jobs", () => {
      const jobs = Array.from({ length: 50 }, (_, i) =>
        createMockJob({ id: `job-${i}` })
      );

      render(
        <KanbanColumn
          status="applied"
          jobs={jobs}
          pendingJobIds={new Set()}
        />
      );

      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByTestId("kanban-card-job-0")).toBeInTheDocument();
      expect(screen.getByTestId("kanban-card-job-49")).toBeInTheDocument();
    });

    it("should handle pending job that does not exist in jobs array", () => {
      const jobs = [createMockJob({ id: "1" })];
      const pendingJobIds = new Set(["1", "non-existent-id"]);

      render(
        <KanbanColumn
          status="applied"
          jobs={jobs}
          pendingJobIds={pendingJobIds}
        />
      );

      // Should not throw error, just render the existing job
      expect(screen.getByTestId("kanban-card-1")).toBeInTheDocument();
    });

    it("should maintain correct order of jobs", () => {
      const jobs = [
        createMockJob({ id: "first", company: "A Corp" }),
        createMockJob({ id: "second", company: "B Corp" }),
        createMockJob({ id: "third", company: "C Corp" }),
      ];

      render(
        <KanbanColumn
          status="applied"
          jobs={jobs}
          pendingJobIds={new Set()}
        />
      );

      const cards = screen.getAllByTestId(/kanban-card-/);
      expect(cards[0]).toHaveAttribute("data-testid", "kanban-card-first");
      expect(cards[1]).toHaveAttribute("data-testid", "kanban-card-second");
      expect(cards[2]).toHaveAttribute("data-testid", "kanban-card-third");
    });
  });

  describe("styling classes", () => {
    it("should have minimum height for empty column", () => {
      const { container } = render(
        <KanbanColumn
          status="applied"
          jobs={[]}
          pendingJobIds={new Set()}
        />
      );

      const droppableArea = container.querySelector('[data-droppable-id]');
      expect(droppableArea).toHaveClass("min-h-[200px]");
    });

    it("should have border styling", () => {
      const { container } = render(
        <KanbanColumn
          status="applied"
          jobs={[]}
          pendingJobIds={new Set()}
        />
      );

      const droppableArea = container.querySelector('[data-droppable-id]');
      expect(droppableArea).toHaveClass("border-2");
      expect(droppableArea).toHaveClass("border-dashed");
    });
  });
});
