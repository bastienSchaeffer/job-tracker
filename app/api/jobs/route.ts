import { NextResponse } from "next/server";
import { getJobs, createJob } from "@/lib/db";
import type { JobCreateInput, JobStatus } from "@/lib/types";
import { JOB_STATUSES } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as JobStatus | null;

  let jobs = await getJobs();

  if (status && JOB_STATUSES.includes(status)) {
    jobs = jobs.filter((job) => job.status === status);
  }

  return NextResponse.json(jobs, {
    headers: {
      "Cache-Control": "private, max-age=10, stale-while-revalidate=60",
    },
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as JobCreateInput;

  if (!body.company || !body.role || !body.status) {
    return NextResponse.json(
      { error: "Company, role, and status are required" },
      { status: 400 }
    );
  }

  if (!JOB_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const job = await createJob(body);
  return NextResponse.json(job, { status: 201 });
}
