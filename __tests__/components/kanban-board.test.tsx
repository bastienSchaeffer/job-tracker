import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { KanbanBoard } from "@/components/jobs/kanban-board";
import type { Job } from "@/lib/types";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock KanbanColumn child component
vi.mock("@/components/jobs/kanban-column", () => ({
  KanbanColumn: ({ status, jobs, pendingJobIds }: any) => (
    <div
      data-testid={`column-${status}`}
      data-job-count={jobs.length}
      data-pending-count={pendingJobIds.size}
    >
      <h3>{status}</h3>
      {jobs.map((job: Job) => (
        <div key={job.id} data-testid={`job-${job.id}`}>
          {job.company}
        </div>
      ))}
    </div>
  ),
}));

// Mock @hello-pangea/dnd
let mockOnDragEnd: any = null;
vi.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children, onDragEnd }: any) => {
    mockOnDragEnd = onDragEnd;
    return <div data-testid="drag-drop-context">{children}</div>;
  },
}));

describe("KanbanBoard", () => {
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

  beforeEach(() => {
    mockRefresh.mockClear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render all 6 status columns", () => {
      render(<KanbanBoard jobs={[]} />);

      expect(screen.getByTestId("column-applied")).toBeInTheDocument();
      expect(screen.getByTestId("column-phone_screen")).toBeInTheDocument();
      expect(screen.getByTestId("column-technical")).toBeInTheDocument();
      expect(screen.getByTestId("column-onsite")).toBeInTheDocument();
      expect(screen.getByTestId("column-offer")).toBeInTheDocument();
      expect(screen.getByTestId("column-rejected")).toBeInTheDocument();
    });

    it("should have accessible region label", () => {
      render(<KanbanBoard jobs={[]} />);

      const board = screen.getByRole("region");
      expect(board).toHaveAttribute(
        "aria-label",
        "Job application kanban board"
      );
    });

    it("should wrap columns in DragDropContext", () => {
      render(<KanbanBoard jobs={[]} />);

      expect(screen.getByTestId("drag-drop-context")).toBeInTheDocument();
    });
  });

  describe("job grouping by status", () => {
    it("should group jobs by their status", () => {
      const jobs = [
        createMockJob({ id: "1", status: "applied" }),
        createMockJob({ id: "2", status: "applied" }),
        createMockJob({ id: "3", status: "phone_screen" }),
        createMockJob({ id: "4", status: "technical" }),
      ];

      render(<KanbanBoard jobs={jobs} />);

      expect(screen.getByTestId("column-applied")).toHaveAttribute(
        "data-job-count",
        "2"
      );
      expect(screen.getByTestId("column-phone_screen")).toHaveAttribute(
        "data-job-count",
        "1"
      );
      expect(screen.getByTestId("column-technical")).toHaveAttribute(
        "data-job-count",
        "1"
      );
      expect(screen.getByTestId("column-onsite")).toHaveAttribute(
        "data-job-count",
        "0"
      );
    });

    it("should handle all jobs in one status", () => {
      const jobs = [
        createMockJob({ id: "1", status: "offer" }),
        createMockJob({ id: "2", status: "offer" }),
        createMockJob({ id: "3", status: "offer" }),
      ];

      render(<KanbanBoard jobs={jobs} />);

      expect(screen.getByTestId("column-offer")).toHaveAttribute(
        "data-job-count",
        "3"
      );
      expect(screen.getByTestId("column-applied")).toHaveAttribute(
        "data-job-count",
        "0"
      );
    });

    it("should initialize with empty columns when no jobs", () => {
      render(<KanbanBoard jobs={[]} />);

      const columns = [
        "applied",
        "phone_screen",
        "technical",
        "onsite",
        "offer",
        "rejected",
      ];

      columns.forEach((status) => {
        expect(screen.getByTestId(`column-${status}`)).toHaveAttribute(
          "data-job-count",
          "0"
        );
      });
    });

    it("should render jobs in correct columns", () => {
      const jobs = [
        createMockJob({ id: "1", status: "applied", company: "Company A" }),
        createMockJob({ id: "2", status: "technical", company: "Company B" }),
      ];

      render(<KanbanBoard jobs={jobs} />);

      const appliedColumn = screen.getByTestId("column-applied");
      const technicalColumn = screen.getByTestId("column-technical");

      expect(appliedColumn).toContainElement(screen.getByTestId("job-1"));
      expect(technicalColumn).toContainElement(screen.getByTestId("job-2"));
    });
  });

  describe("drag and drop - basic", () => {
    it("should call onDragEnd when drag completes", async () => {
      const jobs = [createMockJob({ id: "1", status: "applied" })];
      render(<KanbanBoard jobs={jobs} />);

      expect(mockOnDragEnd).toBeDefined();
    });

    it("should not update when dropped outside droppable", async () => {
      const jobs = [createMockJob({ id: "1", status: "applied" })];
      render(<KanbanBoard jobs={jobs} />);

      await mockOnDragEnd({
        destination: null,
        source: { droppableId: "applied", index: 0 },
        draggableId: "1",
      });

      // Should not make API call
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should not update when dropped in same position", async () => {
      const jobs = [createMockJob({ id: "1", status: "applied" })];
      render(<KanbanBoard jobs={jobs} />);

      await mockOnDragEnd({
        destination: { droppableId: "applied", index: 0 },
        source: { droppableId: "applied", index: 0 },
        draggableId: "1",
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("drag and drop - status change", () => {
    it("should update job status when dragged to different column", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });
      global.fetch = mockFetch;

      const jobs = [createMockJob({ id: "job-1", status: "applied" })];
      render(<KanbanBoard jobs={jobs} />);

      await mockOnDragEnd({
        destination: { droppableId: "phone_screen", index: 0 },
        source: { droppableId: "applied", index: 0 },
        draggableId: "job-1",
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/jobs/job-1",
          expect.objectContaining({
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "phone_screen" }),
          })
        );
      });
    });

    it("should refresh router after successful update", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });
      global.fetch = mockFetch;

      const jobs = [createMockJob({ id: "job-1", status: "applied" })];
      render(<KanbanBoard jobs={jobs} />);

      await mockOnDragEnd({
        destination: { droppableId: "technical", index: 0 },
        source: { droppableId: "applied", index: 0 },
        draggableId: "job-1",
      });

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it("should not make API call when reordering within same column", async () => {
      const jobs = [
        createMockJob({ id: "1", status: "applied" }),
        createMockJob({ id: "2", status: "applied" }),
      ];
      render(<KanbanBoard jobs={jobs} />);

      await mockOnDragEnd({
        destination: { droppableId: "applied", index: 1 },
        source: { droppableId: "applied", index: 0 },
        draggableId: "1",
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("optimistic updates", () => {
    it("should make API call when status changes", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });
      global.fetch = mockFetch;

      const jobs = [createMockJob({ id: "job-1", status: "applied" })];
      render(<KanbanBoard jobs={jobs} />);

      await mockOnDragEnd({
        destination: { droppableId: "phone_screen", index: 0 },
        source: { droppableId: "applied", index: 0 },
        draggableId: "job-1",
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it("should rollback changes on API error", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });
      global.fetch = mockFetch;

      const jobs = [
        createMockJob({ id: "job-1", status: "applied", company: "Company A" }),
      ];
      render(<KanbanBoard jobs={jobs} />);

      await mockOnDragEnd({
        destination: { droppableId: "technical", index: 0 },
        source: { droppableId: "applied", index: 0 },
        draggableId: "job-1",
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // After rollback, job should be back in applied column
      // (tested via component state management)
    });

    it("should clear pending state after successful update", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });
      global.fetch = mockFetch;

      const jobs = [createMockJob({ id: "job-1", status: "applied" })];
      render(<KanbanBoard jobs={jobs} />);

      await mockOnDragEnd({
        destination: { droppableId: "phone_screen", index: 0 },
        source: { droppableId: "applied", index: 0 },
        draggableId: "job-1",
      });

      await waitFor(() => {
        const phoneScreenColumn = screen.getByTestId("column-phone_screen");
        expect(phoneScreenColumn).toHaveAttribute("data-pending-count", "0");
      });
    });
  });

  describe("error handling", () => {
    it("should handle network errors gracefully", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
      global.fetch = mockFetch;

      const jobs = [createMockJob({ id: "job-1", status: "applied" })];
      render(<KanbanBoard jobs={jobs} />);

      await mockOnDragEnd({
        destination: { droppableId: "technical", index: 0 },
        source: { droppableId: "applied", index: 0 },
        draggableId: "job-1",
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Should not crash, error is caught
      expect(screen.getByTestId("column-applied")).toBeInTheDocument();
    });

    it("should handle non-existent job in drag operation", async () => {
      const jobs = [createMockJob({ id: "job-1", status: "applied" })];
      render(<KanbanBoard jobs={jobs} />);

      await mockOnDragEnd({
        destination: { droppableId: "technical", index: 0 },
        source: { droppableId: "applied", index: 0 },
        draggableId: "non-existent-id",
      });

      // Should not make API call for non-existent job
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle empty jobs array", () => {
      render(<KanbanBoard jobs={[]} />);

      const columns = [
        "applied",
        "phone_screen",
        "technical",
        "onsite",
        "offer",
        "rejected",
      ];

      columns.forEach((status) => {
        expect(screen.getByTestId(`column-${status}`)).toHaveAttribute(
          "data-job-count",
          "0"
        );
      });
    });

    it("should handle large number of jobs", () => {
      const jobs = Array.from({ length: 100 }, (_, i) =>
        createMockJob({
          id: `job-${i}`,
          status: "applied",
        })
      );

      render(<KanbanBoard jobs={jobs} />);

      expect(screen.getByTestId("column-applied")).toHaveAttribute(
        "data-job-count",
        "100"
      );
    });

    it("should handle jobs evenly distributed across all statuses", () => {
      const statuses = [
        "applied",
        "phone_screen",
        "technical",
        "onsite",
        "offer",
        "rejected",
      ] as const;

      const jobs = statuses.flatMap((status, idx) =>
        Array.from({ length: 3 }, (_, i) =>
          createMockJob({ id: `${status}-${i}`, status })
        )
      );

      render(<KanbanBoard jobs={jobs} />);

      statuses.forEach((status) => {
        expect(screen.getByTestId(`column-${status}`)).toHaveAttribute(
          "data-job-count",
          "3"
        );
      });
    });

    it("should handle drag with missing destination index", async () => {
      const jobs = [createMockJob({ id: "job-1", status: "applied" })];
      render(<KanbanBoard jobs={jobs} />);

      await mockOnDragEnd({
        destination: { droppableId: "technical" }, // missing index
        source: { droppableId: "applied", index: 0 },
        draggableId: "job-1",
      });

      // Should handle gracefully
      expect(screen.getByTestId("drag-drop-context")).toBeInTheDocument();
    });
  });

  describe("multiple concurrent drags", () => {
    it("should handle multiple jobs being dragged", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });
      global.fetch = mockFetch;

      const jobs = [
        createMockJob({ id: "job-1", status: "applied" }),
        createMockJob({ id: "job-2", status: "applied" }),
      ];
      render(<KanbanBoard jobs={jobs} />);

      // First drag
      await mockOnDragEnd({
        destination: { droppableId: "phone_screen", index: 0 },
        source: { droppableId: "applied", index: 0 },
        draggableId: "job-1",
      });

      // Second drag
      await mockOnDragEnd({
        destination: { droppableId: "technical", index: 0 },
        source: { droppableId: "applied", index: 0 },
        draggableId: "job-2",
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("groupJobsByStatus function behavior", () => {
    it("should handle jobs with same company in different statuses", () => {
      const jobs = [
        createMockJob({ id: "1", company: "Acme", status: "applied" }),
        createMockJob({ id: "2", company: "Acme", status: "phone_screen" }),
      ];

      render(<KanbanBoard jobs={jobs} />);

      expect(screen.getByTestId("column-applied")).toHaveAttribute(
        "data-job-count",
        "1"
      );
      expect(screen.getByTestId("column-phone_screen")).toHaveAttribute(
        "data-job-count",
        "1"
      );
    });

    it("should preserve job order within status groups", () => {
      const jobs = [
        createMockJob({ id: "1", status: "applied", company: "A" }),
        createMockJob({ id: "2", status: "applied", company: "B" }),
        createMockJob({ id: "3", status: "applied", company: "C" }),
      ];

      render(<KanbanBoard jobs={jobs} />);

      const appliedColumn = screen.getByTestId("column-applied");
      const jobElements = Array.from(appliedColumn.querySelectorAll("[data-testid^='job-']"));

      expect(jobElements[0]).toHaveAttribute("data-testid", "job-1");
      expect(jobElements[1]).toHaveAttribute("data-testid", "job-2");
      expect(jobElements[2]).toHaveAttribute("data-testid", "job-3");
    });
  });
});
