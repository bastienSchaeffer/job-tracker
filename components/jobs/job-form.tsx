"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JOB_STATUSES, STATUS_LABELS } from "@/lib/constants";
import type { Job, JobStatus } from "@/lib/types";

interface JobFormProps {
  job?: Job;
  onSubmit: (data: JobFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface JobFormData {
  company: string;
  role: string;
  url: string;
  status: JobStatus;
  salaryMin: number | null;
  salaryMax: number | null;
  notes: string;
  dateApplied: string;
}

interface FormErrors {
  company?: string;
  role?: string;
  url?: string;
  status?: string;
  dateApplied?: string;
  salary?: string;
}

function isValidUrl(url: string): boolean {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function validateForm(data: JobFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.company.trim()) {
    errors.company = "Company is required";
  }

  if (!data.role.trim()) {
    errors.role = "Role is required";
  }

  if (data.url && !isValidUrl(data.url)) {
    errors.url = "Please enter a valid URL (e.g., https://example.com)";
  }

  if (!data.dateApplied) {
    errors.dateApplied = "Date applied is required";
  }

  if (
    data.salaryMin !== null &&
    data.salaryMax !== null &&
    data.salaryMin > data.salaryMax
  ) {
    errors.salary = "Minimum salary cannot be greater than maximum salary";
  }

  return errors;
}

export function JobForm({
  job,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: JobFormProps) {
  const [formData, setFormData] = useState<JobFormData>({
    company: job?.company ?? "",
    role: job?.role ?? "",
    url: job?.url ?? "",
    status: job?.status ?? "applied",
    salaryMin: job?.salaryMin ?? null,
    salaryMax: job?.salaryMax ?? null,
    notes: job?.notes ?? "",
    dateApplied: job?.dateApplied ?? new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const handleBlur = (field: string) => {
    setTouched((prev) => new Set(prev).add(field));
    const newErrors = validateForm(formData);
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    setTouched(new Set(Object.keys(formData)));

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await onSubmit(formData);
  };

  const showError = (field: string) => touched.has(field) && errors[field as keyof FormErrors];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            onBlur={() => handleBlur("company")}
            aria-invalid={showError("company") ? "true" : undefined}
            aria-describedby={showError("company") ? "company-error" : undefined}
          />
          {showError("company") && (
            <p id="company-error" className="text-sm text-destructive">{errors.company}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            onBlur={() => handleBlur("role")}
            aria-invalid={showError("role") ? "true" : undefined}
            aria-describedby={showError("role") ? "role-error" : undefined}
          />
          {showError("role") && (
            <p id="role-error" className="text-sm text-destructive">{errors.role}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Job URL</Label>
        <Input
          id="url"
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          onBlur={() => handleBlur("url")}
          placeholder="https://..."
          aria-invalid={showError("url") ? "true" : undefined}
          aria-describedby={showError("url") ? "url-error" : undefined}
        />
        {showError("url") && (
          <p id="url-error" className="text-sm text-destructive">{errors.url}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value: JobStatus) =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JOB_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateApplied">Date Applied *</Label>
          <Input
            id="dateApplied"
            type="date"
            value={formData.dateApplied}
            onChange={(e) =>
              setFormData({ ...formData, dateApplied: e.target.value })
            }
            onBlur={() => handleBlur("dateApplied")}
            aria-invalid={showError("dateApplied") ? "true" : undefined}
            aria-describedby={showError("dateApplied") ? "dateApplied-error" : undefined}
          />
          {showError("dateApplied") && (
            <p id="dateApplied-error" className="text-sm text-destructive">{errors.dateApplied}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="salaryMin">Salary Min</Label>
          <Input
            id="salaryMin"
            type="number"
            min="0"
            value={formData.salaryMin ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                salaryMin: e.target.value ? Number(e.target.value) : null,
              })
            }
            onBlur={() => handleBlur("salaryMin")}
            placeholder="e.g., 80000"
            aria-describedby={errors.salary ? "salary-error" : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salaryMax">Salary Max</Label>
          <Input
            id="salaryMax"
            type="number"
            min="0"
            value={formData.salaryMax ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                salaryMax: e.target.value ? Number(e.target.value) : null,
              })
            }
            onBlur={() => handleBlur("salaryMax")}
            placeholder="e.g., 120000"
            aria-describedby={errors.salary ? "salary-error" : undefined}
          />
        </div>
      </div>
      {errors.salary && (
        <p id="salary-error" className="text-sm text-destructive">{errors.salary}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          placeholder="Any additional notes about this application..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : job ? "Update Job" : "Add Job"}
        </Button>
      </div>
    </form>
  );
}
