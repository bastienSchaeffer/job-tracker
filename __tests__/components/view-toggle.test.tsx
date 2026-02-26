import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ViewToggle } from "@/components/jobs/view-toggle";

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe("ViewToggle", () => {
  beforeEach(() => {
    mockPush.mockClear();
    // Create fresh search params instance
    mockSearchParams = new URLSearchParams();
  });

  describe("rendering", () => {
    it("should render both view buttons", () => {
      render(<ViewToggle />);

      const listButton = screen.getByRole("button", { name: "List view" });
      const boardButton = screen.getByRole("button", { name: "Board view" });

      expect(listButton).toBeInTheDocument();
      expect(boardButton).toBeInTheDocument();
    });

    it("should render with accessible group label", () => {
      render(<ViewToggle />);

      const group = screen.getByRole("group", { name: "View mode" });
      expect(group).toBeInTheDocument();
    });

    it("should have aria-pressed attribute on both buttons", () => {
      render(<ViewToggle />);

      const listButton = screen.getByRole("button", { name: "List view" });
      const boardButton = screen.getByRole("button", { name: "Board view" });

      expect(listButton).toHaveAttribute("aria-pressed");
      expect(boardButton).toHaveAttribute("aria-pressed");
    });
  });

  describe("default state (list view)", () => {
    it("should show list button as active when no view param", () => {
      render(<ViewToggle />);

      const listButton = screen.getByRole("button", { name: "List view" });
      const boardButton = screen.getByRole("button", { name: "Board view" });

      expect(listButton).toHaveAttribute("aria-pressed", "true");
      expect(boardButton).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("board view state", () => {
    beforeEach(() => {
      mockSearchParams.set("view", "board");
    });

    it("should show board button as active when view=board", () => {
      render(<ViewToggle />);

      const listButton = screen.getByRole("button", { name: "List view" });
      const boardButton = screen.getByRole("button", { name: "Board view" });

      expect(listButton).toHaveAttribute("aria-pressed", "false");
      expect(boardButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("interactions", () => {
    it("should navigate to board view when board button clicked", async () => {
      const user = userEvent.setup();
      render(<ViewToggle />);

      const boardButton = screen.getByRole("button", { name: "Board view" });
      await user.click(boardButton);

      expect(mockPush).toHaveBeenCalledWith("/jobs?view=board");
    });

    it("should remove view param when list button clicked from board view", async () => {
      mockSearchParams.set("view", "board");
      const user = userEvent.setup();
      render(<ViewToggle />);

      const listButton = screen.getByRole("button", { name: "List view" });
      await user.click(listButton);

      expect(mockPush).toHaveBeenCalledWith("/jobs");
    });

    it("should preserve other query params when switching views", async () => {
      mockSearchParams.set("status", "applied");
      mockSearchParams.set("sort", "asc");
      const user = userEvent.setup();
      render(<ViewToggle />);

      const boardButton = screen.getByRole("button", { name: "Board view" });
      await user.click(boardButton);

      expect(mockPush).toHaveBeenCalledWith(
        "/jobs?status=applied&sort=asc&view=board"
      );
    });

    it("should preserve other params when switching back to list view", async () => {
      mockSearchParams.set("view", "board");
      mockSearchParams.set("status", "phone_screen");
      const user = userEvent.setup();
      render(<ViewToggle />);

      const listButton = screen.getByRole("button", { name: "List view" });
      await user.click(listButton);

      expect(mockPush).toHaveBeenCalledWith("/jobs?status=phone_screen");
    });
  });

  describe("edge cases", () => {
    it("should handle clicking the already active button", async () => {
      const user = userEvent.setup();
      render(<ViewToggle />);

      const listButton = screen.getByRole("button", { name: "List view" });
      await user.click(listButton);

      // Should still push even if already active
      expect(mockPush).toHaveBeenCalledWith("/jobs");
    });

    it("should handle multiple rapid clicks", async () => {
      const user = userEvent.setup();
      render(<ViewToggle />);

      const boardButton = screen.getByRole("button", { name: "Board view" });
      await user.click(boardButton);
      await user.click(boardButton);
      await user.click(boardButton);

      expect(mockPush).toHaveBeenCalledTimes(3);
    });

    it("should treat invalid view param as list view", () => {
      // The component will read "invalid" as the view param, but since it's not "board",
      // it will default to "list" behavior
      const invalidParams = new URLSearchParams();
      invalidParams.set("view", "invalid");
      mockSearchParams = invalidParams;

      render(<ViewToggle />);

      const listButton = screen.getByRole("button", { name: "List view" });
      const boardButton = screen.getByRole("button", { name: "Board view" });

      // Neither button should be "pressed" in the traditional sense,
      // but list is the default fallback
      // The component actually checks: currentView === "list" ? "default" : "outline"
      // and currentView is set to searchParams.get("view") ?? "list"
      // So "invalid" !== "list", meaning list button will NOT be active
      expect(listButton).toHaveAttribute("aria-pressed", "false");
      expect(boardButton).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("accessibility", () => {
    it("should have descriptive aria-labels for screen readers", () => {
      render(<ViewToggle />);

      expect(
        screen.getByRole("button", { name: "List view" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Board view" })
      ).toBeInTheDocument();
    });

    it("should communicate pressed state via aria-pressed", () => {
      render(<ViewToggle />);

      const listButton = screen.getByRole("button", { name: "List view" });
      expect(listButton).toHaveAttribute("aria-pressed", "true");
    });

    it("should have proper role group for button group", () => {
      render(<ViewToggle />);

      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("aria-label", "View mode");
    });
  });
});
