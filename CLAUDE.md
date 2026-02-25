# Job Tracker

A job application tracking app built with Next.js 16 and React 19.

## Tech Stack

| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | 16.x | App Router, "use cache" directive |
| React | 19.2 | Server Components, View Transitions |
| TypeScript | 5.x | Strict mode enabled |
| Tailwind CSS | 4.x | CSS-first configuration |
| shadcn/ui | 3.x | New York style, unified radix-ui |
| Vitest | 4.x | Unit and component testing |
| pnpm | 10.x | Package manager |

## Project Structure

```
app/                    # Next.js App Router pages and API routes
├── api/jobs/           # REST API endpoints
├── jobs/               # Job list and detail pages
├── layout.tsx          # Root layout with header
├── page.tsx            # Dashboard
└── globals.css         # Tailwind CSS theme

components/
├── jobs/               # Job-specific components (cards, forms, dialogs)
├── layout/             # App shell (header, nav)
└── ui/                 # shadcn/ui primitives

lib/
├── types.ts            # TypeScript interfaces
├── constants.ts        # Status definitions, colors
├── db.ts               # JSON file persistence layer
└── utils.ts            # Utility functions (cn)

data/
└── jobs.json           # Local JSON database

__tests__/              # Test files mirroring source structure
```

## Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm start        # Run production server
pnpm test         # Run tests in watch mode
pnpm test:run     # Run tests once
pnpm lint         # ESLint
pnpm format       # Prettier
```

## Coding Conventions

### Exports
- Use **named exports** for all components and functions
- No default exports except for Next.js pages

### Naming
- **PascalCase** for components: `JobCard`, `StatusBadge`
- **camelCase** for hooks: `useJobForm`, `useFilters`
- **camelCase** for utilities: `formatSalary`, `cn`
- **SCREAMING_SNAKE_CASE** for constants: `JOB_STATUSES`, `STATUS_LABELS`

### TypeScript
- Strict mode is mandatory (`"strict": true`)
- Never use `any` type - use `unknown` and narrow, or define proper types
- Prefer interfaces for object shapes, types for unions/primitives
- All function parameters and returns must be typed

### Components
- Server Components by default, add `"use client"` only when needed
- Props interfaces named `{ComponentName}Props`
- Destructure props in function signature

```typescript
interface JobCardProps {
  job: Job;
  className?: string;
}

export function JobCard({ job, className }: JobCardProps) {
  // ...
}
```

## Testing Strategy

### File Location
- Tests live in `__tests__/` directory mirroring source structure
- Test files use `.test.ts` or `.test.tsx` extension

### What to Test
- **Unit tests**: Pure functions in `lib/` (constants, utils, db operations)
- **Component tests**: Rendering, props, user interactions
- **No mocks for core logic**: Test actual implementations when possible

### What Not to Test
- shadcn/ui primitives (already tested upstream)
- Next.js framework behavior
- Trivial getters/setters

### Running Tests
```bash
pnpm test         # Watch mode during development
pnpm test:run     # CI/pre-commit
```

## Data Model

```typescript
type JobStatus =
  | "applied"
  | "phone_screen"
  | "technical"
  | "onsite"
  | "offer"
  | "rejected";

interface Job {
  id: string;
  company: string;
  role: string;
  url: string;
  status: JobStatus;
  salaryMin: number | null;
  salaryMax: number | null;
  notes: string;
  dateApplied: string;    // ISO date
  lastUpdated: string;    // ISO datetime
}
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List all jobs (optional `?status=` filter) |
| POST | `/api/jobs` | Create new job |
| GET | `/api/jobs/[id]` | Get single job |
| PUT | `/api/jobs/[id]` | Update job |
| DELETE | `/api/jobs/[id]` | Delete job |
