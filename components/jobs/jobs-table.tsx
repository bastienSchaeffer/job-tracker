import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./status-badge";
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
            <TableHead className="text-right">Date Applied</TableHead>
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
              <TableCell className="text-right text-muted-foreground">
                {formatDate(job.dateApplied)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
