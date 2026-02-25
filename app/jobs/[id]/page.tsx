import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/jobs/status-badge";
import { JobDialog } from "@/components/jobs/job-dialog";
import { DeleteJobButton } from "./delete-button";
import { getJob } from "@/lib/db";
import { formatSalary, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/jobs"
            className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block"
          >
            &larr; Back to jobs
          </Link>
          <h1 className="text-3xl font-bold">{job.role}</h1>
          <p className="text-xl text-muted-foreground">{job.company}</p>
        </div>
        <div className="flex items-center gap-2">
          <JobDialog
            mode="edit"
            job={job}
            trigger={<Button variant="outline">Edit</Button>}
          />
          <DeleteJobButton jobId={job.id} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <StatusBadge status={job.status} />
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            View job posting &rarr;
          </a>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Salary Range</dt>
                <dd className="font-medium">
                  {formatSalary(job.salaryMin, job.salaryMax, "Not specified")}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Date Applied</dt>
                <dd className="font-medium">{formatDate(job.dateApplied, "long")}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Last Updated</dt>
                <dd className="font-medium">{formatDate(job.lastUpdated, "long")}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {job.notes ? (
              <p className="whitespace-pre-wrap">{job.notes}</p>
            ) : (
              <p className="text-muted-foreground">No notes added.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
