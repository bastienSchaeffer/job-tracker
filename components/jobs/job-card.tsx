"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { JobDialog } from "./job-dialog";
import { DeleteJobDialog } from "./delete-job-dialog";
import { formatSalary, formatDate } from "@/lib/utils";
import type { Job } from "@/lib/types";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <Card className="hover:bg-muted/50 transition-colors relative group">
      <Link href={`/jobs/${job.id}`} className="absolute inset-0 z-0">
        <span className="sr-only">View {job.role} at {job.company}</span>
      </Link>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg truncate">{job.role}</CardTitle>
            <CardDescription className="truncate">
              {job.company}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={job.status} />
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
              <JobDialog
                mode="edit"
                job={job}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Edit ${job.role} at ${job.company}`}
                    onClick={(e) => e.stopPropagation()}
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
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>Applied {formatDate(job.dateApplied)}</span>
          {salary && <span>{salary}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
