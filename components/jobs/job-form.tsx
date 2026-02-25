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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

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
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Job URL</Label>
        <Input
          id="url"
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://..."
        />
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
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="salaryMin">Salary Min</Label>
          <Input
            id="salaryMin"
            type="number"
            value={formData.salaryMin ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                salaryMin: e.target.value ? Number(e.target.value) : null,
              })
            }
            placeholder="e.g., 80000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salaryMax">Salary Max</Label>
          <Input
            id="salaryMax"
            type="number"
            value={formData.salaryMax ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                salaryMax: e.target.value ? Number(e.target.value) : null,
              })
            }
            placeholder="e.g., 120000"
          />
        </div>
      </div>

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
