"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { JobDialog } from "./job-dialog";
import { DeleteJobDialog } from "./delete-job-dialog";
import { formatDate } from "@/lib/utils";
import type { Job } from "@/lib/types";

interface JobsTableProps {
  jobs: Job[];
}

export function JobsTable({ jobs }: JobsTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No jobs found.</p>
        <p className="text-sm mt-1">
          Add your first job application to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date Applied</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id} className="hover:bg-muted/50">
              <TableCell>
                <Link
                  href={`/jobs/${job.id}`}
                  className="font-medium hover:underline"
                >
                  {job.company}
                </Link>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {job.role}
              </TableCell>
              <TableCell>
                <StatusBadge status={job.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(job.dateApplied)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <JobDialog
                    mode="edit"
                    job={job}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Edit ${job.role} at ${job.company}`}
                      >
                        <Pencil className="size-3" />
                      </Button>
                    }
                  />
                  <DeleteJobDialog
                    job={job}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Delete ${job.role} at ${job.company}`}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    }
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
