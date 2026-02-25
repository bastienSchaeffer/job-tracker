import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/jobs/status-badge";

describe("StatusBadge", () => {
  it("renders the correct label for applied status", () => {
    render(<StatusBadge status="applied" />);
    expect(screen.getByText("Applied")).toBeInTheDocument();
  });

  it("renders the correct label for phone_screen status", () => {
    render(<StatusBadge status="phone_screen" />);
    expect(screen.getByText("Phone Screen")).toBeInTheDocument();
  });

  it("renders the correct label for offer status", () => {
    render(<StatusBadge status="offer" />);
    expect(screen.getByText("Offer")).toBeInTheDocument();
  });

  it("renders the correct label for rejected status", () => {
    render(<StatusBadge status="rejected" />);
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<StatusBadge status="applied" className="custom-class" />);
    const badge = screen.getByText("Applied");
    expect(badge).toHaveClass("custom-class");
  });
});
