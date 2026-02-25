import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SortToggle } from "@/components/jobs/sort-toggle";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(""),
}));

describe("SortToggle", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders with default descending state", () => {
    render(<SortToggle />);
    expect(screen.getByText("Newest first")).toBeInTheDocument();
  });

  it("toggles to ascending when clicked", () => {
    render(<SortToggle />);

    fireEvent.click(screen.getByRole("button"));

    expect(mockPush).toHaveBeenCalledWith("/jobs?sort=asc");
  });
});
