import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { JobsTable } from "@/components/jobs/jobs-table";
import type { Job } from "@/lib/types";

const mockJobs: Job[] = [
  {
    id: "1",
    company: "Stripe",
    role: "Senior Engineer",
    url: "https://stripe.com",
    status: "applied",
    salaryMin: 150000,
    salaryMax: 200000,
    notes: "",
    dateApplied: "2026-02-10",
    lastUpdated: "2026-02-10T00:00:00.000Z",
  },
  {
    id: "2",
    company: "Vercel",
    role: "Staff Engineer",
    url: "https://vercel.com",
    status: "technical",
    salaryMin: null,
    salaryMax: null,
    notes: "",
    dateApplied: "2026-02-15",
    lastUpdated: "2026-02-15T00:00:00.000Z",
  },
];

describe("JobsTable", () => {
  it("renders table headers", () => {
    render(<JobsTable jobs={mockJobs} />);
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Date Applied")).toBeInTheDocument();
  });

  it("renders job data in rows", () => {
    render(<JobsTable jobs={mockJobs} />);
    expect(screen.getByText("Stripe")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("Vercel")).toBeInTheDocument();
    expect(screen.getByText("Staff Engineer")).toBeInTheDocument();
  });

  it("shows empty state when no jobs", () => {
    render(<JobsTable jobs={[]} />);
    expect(screen.getByText("No jobs found.")).toBeInTheDocument();
  });

  it("renders status badges", () => {
    render(<JobsTable jobs={mockJobs} />);
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("Technical")).toBeInTheDocument();
  });

  it("renders company names as links", () => {
    render(<JobsTable jobs={mockJobs} />);
    const stripeLink = screen.getByRole("link", { name: "Stripe" });
    expect(stripeLink).toHaveAttribute("href", "/jobs/1");
  });
});
