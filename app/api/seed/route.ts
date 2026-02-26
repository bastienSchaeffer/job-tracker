import { NextResponse } from "next/server";
import { createJobs, getJobs } from "@/lib/db";
import { SEED_JOBS } from "@/lib/seed-data";

export async function POST() {
  try {
    const existingJobs = await getJobs();

    if (existingJobs.length > 0) {
      return NextResponse.json(
        { error: "Database already has jobs. Clear existing data first." },
        { status: 400 }
      );
    }

    // Use bulk create to avoid race conditions from concurrent writes
    const createdJobs = await createJobs(SEED_JOBS);

    return NextResponse.json({
      message: `Successfully created ${createdJobs.length} sample jobs`,
      count: createdJobs.length,
    });
  } catch (error) {
    console.error("Failed to seed database:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
