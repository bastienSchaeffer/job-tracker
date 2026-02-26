import type { JobCreateInput } from "./types";

/**
 * Sample job data for seeding the database.
 * Covers various statuses and application scenarios.
 */
export const SEED_JOBS: JobCreateInput[] = [
  {
    company: "Stripe",
    role: "Senior Frontend Engineer",
    url: "https://stripe.com/jobs/frontend",
    status: "technical",
    salaryMin: 180000,
    salaryMax: 220000,
    notes: "Technical interview scheduled. Focus on React and TypeScript.",
    dateApplied: getDateDaysAgo(12),
  },
  {
    company: "Vercel",
    role: "Staff Software Engineer",
    url: "https://vercel.com/careers",
    status: "phone_screen",
    salaryMin: 200000,
    salaryMax: 250000,
    notes: "Recruiter call went well. They're interested in my Next.js experience.",
    dateApplied: getDateDaysAgo(8),
  },
  {
    company: "Linear",
    role: "Product Engineer",
    url: "https://linear.app/careers",
    status: "applied",
    salaryMin: 160000,
    salaryMax: 200000,
    notes: "Applied through referral from Alex.",
    dateApplied: getDateDaysAgo(3),
  },
  {
    company: "Figma",
    role: "Frontend Developer",
    url: "https://figma.com/careers",
    status: "onsite",
    salaryMin: 170000,
    salaryMax: 210000,
    notes: "Onsite scheduled for next week. 4 rounds: coding, system design, behavioral, team fit.",
    dateApplied: getDateDaysAgo(21),
  },
  {
    company: "Notion",
    role: "Full Stack Engineer",
    url: "https://notion.so/careers",
    status: "offer",
    salaryMin: 175000,
    salaryMax: 215000,
    notes: "Received offer! $195k base + equity. Need to respond by Friday.",
    dateApplied: getDateDaysAgo(30),
  },
  {
    company: "Airbnb",
    role: "Senior Software Engineer",
    url: "https://airbnb.com/careers",
    status: "rejected",
    salaryMin: 190000,
    salaryMax: 240000,
    notes: "Rejected after technical round. Feedback: needed more system design depth.",
    dateApplied: getDateDaysAgo(45),
  },
  {
    company: "Shopify",
    role: "React Developer",
    url: "https://shopify.com/careers",
    status: "applied",
    salaryMin: 150000,
    salaryMax: 190000,
    notes: "Submitted application. Waiting to hear back.",
    dateApplied: getDateDaysAgo(1),
  },
  {
    company: "GitHub",
    role: "Software Engineer II",
    url: "https://github.com/careers",
    status: "technical",
    salaryMin: 165000,
    salaryMax: 205000,
    notes: "Take-home assignment completed. Waiting for feedback.",
    dateApplied: getDateDaysAgo(14),
  },
];

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}
