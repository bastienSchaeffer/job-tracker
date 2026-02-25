import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { formatSalary, formatDate } from "@/lib/utils";
import type { Job } from "@/lib/types";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate">{job.role}</CardTitle>
              <CardDescription className="truncate">
                {job.company}
              </CardDescription>
            </div>
            <StatusBadge status={job.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>Applied {formatDate(job.dateApplied)}</span>
            {salary && <span>{salary}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
