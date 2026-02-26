import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobForm } from "@/components/jobs/job-form";

describe("JobForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date applied/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/salary min/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/salary max/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it("shows validation error when company is empty", async () => {
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const companyInput = screen.getByLabelText(/company/i);
    fireEvent.blur(companyInput);

    const submitButton = screen.getByRole("button", { name: /add job/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(/company is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("shows validation error when role is empty", async () => {
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const roleInput = screen.getByLabelText(/role/i);
    fireEvent.blur(roleInput);

    const submitButton = screen.getByRole("button", { name: /add job/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(/role is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("shows validation error for invalid URL", async () => {
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const urlInput = screen.getByLabelText(/job url/i);
    await userEvent.type(urlInput, "invalid-url");
    fireEvent.blur(urlInput);

    expect(
      await screen.findByText(/please enter a valid url/i)
    ).toBeInTheDocument();
  });

  it("accepts valid URL", async () => {
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const urlInput = screen.getByLabelText(/job url/i);
    await userEvent.type(urlInput, "https://example.com/jobs/123");
    fireEvent.blur(urlInput);

    await waitFor(() => {
      expect(
        screen.queryByText(/please enter a valid url/i)
      ).not.toBeInTheDocument();
    });
  });

  it("shows validation error when min salary > max salary", async () => {
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const minInput = screen.getByLabelText(/salary min/i);
    const maxInput = screen.getByLabelText(/salary max/i);

    await userEvent.type(minInput, "150000");
    await userEvent.type(maxInput, "100000");

    const submitButton = screen.getByRole("button", { name: /add job/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/minimum salary cannot be greater/i)
    ).toBeInTheDocument();
  });

  it("calls onSubmit with form data when valid", async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await userEvent.type(screen.getByLabelText(/company/i), "Acme Corp");
    await userEvent.type(
      screen.getByLabelText(/role/i),
      "Software Engineer"
    );

    const submitButton = screen.getByRole("button", { name: /add job/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          company: "Acme Corp",
          role: "Software Engineer",
          status: "applied",
        })
      );
    });
  });

  it("calls onCancel when cancel button is clicked", async () => {
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("populates fields when editing existing job", () => {
    const existingJob = {
      id: "1",
      company: "Existing Company",
      role: "Senior Developer",
      url: "https://example.com",
      status: "technical" as const,
      salaryMin: 100000,
      salaryMax: 150000,
      notes: "Some notes",
      dateApplied: "2026-02-01",
      lastUpdated: "2026-02-01T00:00:00.000Z",
    };

    render(
      <JobForm
        job={existingJob}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/company/i)).toHaveValue("Existing Company");
    expect(screen.getByLabelText(/role/i)).toHaveValue("Senior Developer");
    expect(screen.getByLabelText(/job url/i)).toHaveValue("https://example.com");
    expect(screen.getByLabelText(/salary min/i)).toHaveValue(100000);
    expect(screen.getByLabelText(/salary max/i)).toHaveValue(150000);
    expect(screen.getByLabelText(/notes/i)).toHaveValue("Some notes");
  });

  it("shows 'Update Job' button when editing", () => {
    const existingJob = {
      id: "1",
      company: "Test",
      role: "Test",
      url: "",
      status: "applied" as const,
      salaryMin: null,
      salaryMax: null,
      notes: "",
      dateApplied: "2026-02-01",
      lastUpdated: "2026-02-01T00:00:00.000Z",
    };

    render(
      <JobForm
        job={existingJob}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(
      screen.getByRole("button", { name: /update job/i })
    ).toBeInTheDocument();
  });

  it("disables submit button when submitting", () => {
    render(
      <JobForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );

    const submitButton = screen.getByRole("button", { name: /saving/i });
    expect(submitButton).toBeDisabled();
  });

  it("should not show validation error for empty URL", async () => {
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const urlInput = screen.getByLabelText(/job url/i);
    fireEvent.blur(urlInput);

    await waitFor(() => {
      expect(
        screen.queryByText(/please enter a valid url/i)
      ).not.toBeInTheDocument();
    });
  });

  it("should show validation error when date applied is empty", async () => {
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const dateInput = screen.getByLabelText(/date applied/i);
    await userEvent.clear(dateInput);
    fireEvent.blur(dateInput);

    const submitButton = screen.getByRole("button", { name: /add job/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/date applied is required/i)
    ).toBeInTheDocument();
  });

  it("should validate whitespace-only company name", async () => {
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const companyInput = screen.getByLabelText(/company/i);
    await userEvent.type(companyInput, "   ");
    fireEvent.blur(companyInput);

    const submitButton = screen.getByRole("button", { name: /add job/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(/company is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should validate whitespace-only role name", async () => {
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const roleInput = screen.getByLabelText(/role/i);
    await userEvent.type(roleInput, "   ");
    fireEvent.blur(roleInput);

    const submitButton = screen.getByRole("button", { name: /add job/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(/role is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should accept http protocol URLs", async () => {
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const urlInput = screen.getByLabelText(/job url/i);
    await userEvent.type(urlInput, "http://example.com");
    fireEvent.blur(urlInput);

    await waitFor(() => {
      expect(
        screen.queryByText(/please enter a valid url/i)
      ).not.toBeInTheDocument();
    });
  });

  it("should handle salary fields being cleared", async () => {
    const existingJob = {
      id: "1",
      company: "Test Company",
      role: "Test Role",
      url: "",
      status: "applied" as const,
      salaryMin: 100000,
      salaryMax: 150000,
      notes: "",
      dateApplied: "2026-02-01",
      lastUpdated: "2026-02-01T00:00:00.000Z",
    };

    mockOnSubmit.mockResolvedValue(undefined);
    render(
      <JobForm
        job={existingJob}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const minInput = screen.getByLabelText(/salary min/i);
    const maxInput = screen.getByLabelText(/salary max/i);

    await userEvent.clear(minInput);
    await userEvent.clear(maxInput);

    const submitButton = screen.getByRole("button", { name: /update job/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          salaryMin: null,
          salaryMax: null,
        })
      );
    });
  });

  it("should not show error before field is touched", () => {
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const companyInput = screen.getByLabelText(/company/i);
    expect(companyInput).toHaveValue("");
    expect(screen.queryByText(/company is required/i)).not.toBeInTheDocument();
  });

  it("should show error after field is touched and blurred", async () => {
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const companyInput = screen.getByLabelText(/company/i);
    await userEvent.click(companyInput);
    fireEvent.blur(companyInput);

    expect(await screen.findByText(/company is required/i)).toBeInTheDocument();
  });

  it("should show URL and salary validation errors together", async () => {
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const urlInput = screen.getByLabelText(/job url/i);
    await userEvent.type(urlInput, "not-a-url");

    const minInput = screen.getByLabelText(/salary min/i);
    const maxInput = screen.getByLabelText(/salary max/i);
    await userEvent.type(minInput, "200000");
    await userEvent.type(maxInput, "100000");

    const submitButton = screen.getByRole("button", { name: /add job/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/please enter a valid url/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/minimum salary cannot be greater/i)
    ).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should submit form with all optional fields filled", async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await userEvent.type(screen.getByLabelText(/company/i), "Tech Corp");
    await userEvent.type(screen.getByLabelText(/role/i), "Frontend Developer");
    await userEvent.type(
      screen.getByLabelText(/job url/i),
      "https://techcorp.com/jobs"
    );
    await userEvent.type(screen.getByLabelText(/salary min/i), "90000");
    await userEvent.type(screen.getByLabelText(/salary max/i), "120000");
    await userEvent.type(
      screen.getByLabelText(/notes/i),
      "Looks like a great opportunity"
    );

    const submitButton = screen.getByRole("button", { name: /add job/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          company: "Tech Corp",
          role: "Frontend Developer",
          url: "https://techcorp.com/jobs",
          salaryMin: 90000,
          salaryMax: 120000,
          notes: "Looks like a great opportunity",
        })
      );
    });
  });

  it("should default to today's date for new jobs", () => {
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const dateInput = screen.getByLabelText(/date applied/i);
    const today = new Date().toISOString().split("T")[0];
    expect(dateInput).toHaveValue(today);
  });

  it("should default status to applied for new jobs", async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    render(<JobForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await userEvent.type(screen.getByLabelText(/company/i), "Test Company");
    await userEvent.type(screen.getByLabelText(/role/i), "Test Role");

    const submitButton = screen.getByRole("button", { name: /add job/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "applied",
        })
      );
    });
  });
});
