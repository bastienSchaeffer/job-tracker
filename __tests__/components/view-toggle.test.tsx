import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ViewToggle } from "@/components/jobs/view-toggle";

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock ToggleGroup with proper onValueChange wiring
let capturedOnValueChange: ((value: string) => void) | null = null;

vi.mock("@/components/ui/toggle-group", () => ({
  ToggleGroup: ({ children, value, onValueChange, "aria-label": ariaLabel }: any) => {
    capturedOnValueChange = onValueChange;
    return (
      <div role="group" aria-label={ariaLabel} data-value={value}>
        {children}
      </div>
    );
  },
  ToggleGroupItem: ({ children, value, "aria-label": ariaLabel }: any) => (
    <button
      role="radio"
      aria-label={ariaLabel}
      data-value={value}
      onClick={() => capturedOnValueChange?.(value)}
    >
      {children}
    </button>
  ),
}));

describe("ViewToggle", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    mockSearchParams = new URLSearchParams();
    capturedOnValueChange = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render toggle group after hydration", async () => {
      render(<ViewToggle />);

      await waitFor(() => {
        expect(screen.getByRole("group", { name: "View mode" })).toBeInTheDocument();
      });
    });

    it("should render both view options", async () => {
      render(<ViewToggle />);

      await waitFor(() => {
        expect(screen.getByRole("radio", { name: "List view" })).toBeInTheDocument();
        expect(screen.getByRole("radio", { name: "Board view" })).toBeInTheDocument();
      });
    });
  });

  describe("default state (board view)", () => {
    it("should default to board view when no URL param or localStorage", async () => {
      render(<ViewToggle />);

      await waitFor(() => {
        const group = screen.getByRole("group", { name: "View mode" });
        expect(group).toHaveAttribute("data-value", "board");
      });
    });

    it("should redirect to board view on initial load when no URL param", async () => {
      render(<ViewToggle />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/jobs?view=board");
      });
    });
  });

  describe("localStorage persistence", () => {
    it("should read view preference from localStorage", async () => {
      localStorageMock.getItem.mockReturnValue("list");
      render(<ViewToggle />);

      await waitFor(() => {
        expect(localStorageMock.getItem).toHaveBeenCalledWith("jobs-view-mode");
      });
    });

    it("should not redirect when localStorage has list preference", async () => {
      localStorageMock.getItem.mockReturnValue("list");
      render(<ViewToggle />);

      await waitFor(() => {
        expect(mockReplace).not.toHaveBeenCalled();
      });
    });

    it("should save view preference to localStorage when changed", async () => {
      mockSearchParams.set("view", "board");
      const user = userEvent.setup();
      render(<ViewToggle />);

      await waitFor(() => {
        expect(screen.getByRole("radio", { name: "List view" })).toBeInTheDocument();
      });

      const listButton = screen.getByRole("radio", { name: "List view" });
      await user.click(listButton);

      expect(localStorageMock.setItem).toHaveBeenCalledWith("jobs-view-mode", "list");
    });
  });

  describe("URL param handling", () => {
    it("should respect URL param over localStorage", async () => {
      localStorageMock.getItem.mockReturnValue("list");
      mockSearchParams.set("view", "board");

      render(<ViewToggle />);

      await waitFor(() => {
        const group = screen.getByRole("group", { name: "View mode" });
        expect(group).toHaveAttribute("data-value", "board");
      });
    });

    it("should update URL when view is changed to list", async () => {
      mockSearchParams.set("view", "board");
      const user = userEvent.setup();
      render(<ViewToggle />);

      await waitFor(() => {
        expect(screen.getByRole("radio", { name: "List view" })).toBeInTheDocument();
      });

      const listButton = screen.getByRole("radio", { name: "List view" });
      await user.click(listButton);

      expect(mockPush).toHaveBeenCalledWith("/jobs");
    });

    it("should update URL when view is changed to board", async () => {
      const user = userEvent.setup();
      render(<ViewToggle />);

      await waitFor(() => {
        expect(screen.getByRole("radio", { name: "Board view" })).toBeInTheDocument();
      });

      const boardButton = screen.getByRole("radio", { name: "Board view" });
      await user.click(boardButton);

      expect(mockPush).toHaveBeenCalledWith("/jobs?view=board");
    });

    it("should preserve other query params when switching views", async () => {
      mockSearchParams.set("status", "applied");
      mockSearchParams.set("sort", "asc");
      const user = userEvent.setup();
      render(<ViewToggle />);

      await waitFor(() => {
        expect(screen.getByRole("radio", { name: "Board view" })).toBeInTheDocument();
      });

      const boardButton = screen.getByRole("radio", { name: "Board view" });
      await user.click(boardButton);

      expect(mockPush).toHaveBeenCalledWith("/jobs?status=applied&sort=asc&view=board");
    });
  });

  describe("accessibility", () => {
    it("should have accessible group label", async () => {
      render(<ViewToggle />);

      await waitFor(() => {
        expect(screen.getByRole("group", { name: "View mode" })).toBeInTheDocument();
      });
    });

    it("should have descriptive aria-labels for view options", async () => {
      render(<ViewToggle />);

      await waitFor(() => {
        expect(screen.getByRole("radio", { name: "List view" })).toBeInTheDocument();
        expect(screen.getByRole("radio", { name: "Board view" })).toBeInTheDocument();
      });
    });
  });
});
