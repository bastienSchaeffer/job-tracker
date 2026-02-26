# Day 1 — Claude Code Mastery: Job Tracker Project

> **Goal:** Get a global understanding of Claude Code by scaffolding a real project and touching all 7 capabilities.
> **Duration:** ~4-5 hours (morning theory + afternoon practice)
> **Prerequisites:** Claude Code installed (`npm install -g @anthropic-ai/claude-code`), Node.js 18+

---

## Morning — Foundations (1.5h)

### Step 0: Verify your setup (5 min)

Open your terminal:

```bash
claude --version        # confirm installed
claude                  # start interactive session
/help                   # see all commands
/model                  # check current model (should be Sonnet 4.5)
```

Key shortcuts to try right now:
- `Shift+Tab` → toggle Plan/Act mode
- `Ctrl+R` → search prompt history
- `Esc` → interrupt
- `Esc Esc` → rewind to checkpoint
- `/context` → see context usage

Type `/exit` to quit when done exploring.

---

### Step 1: Create the project with Plan Mode (20 min)

**Goal:** Learn Plan Mode by using it to scaffold the project.

```bash
mkdir job-tracker && cd job-tracker
claude
```

Now toggle to **Plan mode** (`Shift+Tab` — you should see the mode indicator change) and type:

```
I want to scaffold a Job Tracker app with the following:
- Next.js 16 (App Router, React 19.2, "use cache" directive)
- TypeScript strict mode
- Tailwind CSS 4
- shadcn/ui (latest CLI 3.0+, unified radix-ui package)
- Vitest 4 for testing
- ESLint + Prettier

The app will track job applications with statuses: 
Applied, Phone Screen, Technical, Onsite, Offer, Rejected.

Each job has: company, role, url, status, salary range, notes, date applied, last updated.

For data persistence, use Next.js API routes + a local JSON file (we'll upgrade later).

Please plan the full folder structure and architecture before writing any code.
```

**What to observe:**
- Claude spawns an Explore subagent to research best practices
- It returns a structured plan with file tree, architecture decisions
- You review and can adjust before any code is written

**Once the plan looks good:** Switch to **Act mode** (`Shift+Tab`) and tell Claude:

```
Go ahead and implement the plan. Start with the project setup and basic folder structure.
```

Let Claude scaffold. Approve file changes as they come (or press `a` for accept all if you trust it).

---

### Step 2: Create your CLAUDE.md (15 min)

**Goal:** Learn how project memory works.

After the scaffold is done, tell Claude:

```
Create a CLAUDE.md file at the project root. Include:
- Project overview and purpose
- Tech stack details
- Folder structure explanation
- Commands to run (dev, test, lint, build)
- Coding conventions: named exports, PascalCase components, camelCase hooks
- Testing strategy: co-located test files, no mocks for core logic
- Always use TypeScript strict mode, no `any` types
```

**Then manually review and edit** the generated CLAUDE.md. This is YOUR project constitution — you should own it. Keep it under ~2000 tokens.

**Test it works:** Exit Claude (`/exit`), restart (`claude`), and ask:

```
What are the conventions for this project?
```

Claude should answer using your CLAUDE.md content.

---

### Step 3: Create your first Slash Commands (15 min)

**Goal:** Learn repeatable workflows.

```bash
mkdir -p .claude/commands
```

Tell Claude:

```
Create the following slash commands for me:

1. `.claude/commands/test.md` — Run tests for files I changed recently. 
   If any fail, analyze why and suggest fixes but don't apply without approval.

2. `.claude/commands/review.md` — Review my staged git changes. 
   Check for: TypeScript errors, missing tests, accessibility issues, 
   naming convention violations per our CLAUDE.md.

3. `.claude/commands/commit.md` — Stage all changes, generate a 
   conventional commit message (feat/fix/refactor/docs), and commit.
   Ask me to confirm the message before committing.
```

**Test them:**
- Make a small change to any file
- Type `/review` → see it analyze your change
- Type `/commit` → see it generate a commit message

---

### Step 4: Create your first Subagent (15 min)

**Goal:** Learn isolated specialized workers.

Tell Claude:

```
Create a subagent at `.claude/agents/component-creator.md` with this config:

- Name: component-creator
- Description: Creates new React components following project conventions
- Tools: Read, Write, Glob, Grep, Bash
- Model: sonnet

System prompt should instruct it to:
1. Create the component in src/components/
2. Use TypeScript with proper interfaces
3. Include accessibility attributes (aria labels, roles)
4. Create a co-located test file
5. Export from the barrel index.ts
6. Follow shadcn/ui patterns for consistency
```

**Test it:**

```
Use the component-creator subagent to create a StatusBadge component 
that displays job application statuses with color coding.
```

**Observe:** The subagent works in its own context and returns only the result.

---

## Afternoon — Build Features (2.5-3h)

### Step 5: Build the core UI with Claude Code (45 min)

**Goal:** Practice the natural prompting workflow — describe what you want, let Claude build it.

Use **Plan mode first**, then Act:

```
Plan and implement the main dashboard page with:
1. A header with the app title and an "Add Job" button
2. A table/list view of all job applications showing: 
   company, role, status (as StatusBadge), date applied
3. Filtering by status
4. Sorting by date
5. Use shadcn/ui Table, Button, Select components
6. Mobile responsive layout

Use the local JSON data store we set up. 
Create some seed data with 8-10 realistic job applications.
```

**Practice tips during this phase:**
- Use `/context` to check how much context you've used
- If context gets heavy, use `/compact` to compress the conversation
- Use `Esc Esc` to rewind if Claude goes in a wrong direction (checkpoint system)
- After each feature, run `/test` and `/review` using your slash commands

---

### Step 6: Add the Job Form + CRUD (30 min)

```
Implement a dialog/modal to add new job applications with:
- Form fields for all job properties
- Form validation (required fields, URL format, salary range)
- Submit creates the job via our API route
- Success closes the modal and refreshes the list
- Also add edit and delete functionality to existing jobs

Use shadcn/ui Dialog, Input, Select, and Form components.
```

---

### Step 7: Set up a Hook — Quality Gate (15 min)

**Goal:** Learn automatic enforcement.

Tell Claude:

```
Add a Stop hook in .claude/settings.json that automatically runs 
TypeScript type checking after every response you give.

The command should be: npx tsc --noEmit --pretty

If there are type errors, the output should be fed back to you 
so you can fix them before moving on.
```

**Then also add a PreToolUse hook:**

```
Add a PreToolUse hook that prevents any bash command containing 
"rm -rf" from being executed. The hook script should exit with 
code 2 and a warning message.
```

**Test both:** Make a change that introduces a type error → the Stop hook catches it. Try asking Claude to clean up with `rm -rf` → the PreToolUse hook blocks it.

---

### Step 8: Connect an MCP Server (20 min)

**Goal:** Learn external tool connections.

```bash
# Add the GitHub MCP server
claude mcp add github -- npx @anthropic/mcp-server-github

# Add Playwright for browser testing (optional but cool)
claude mcp add playwright -- npx @playwright/mcp@latest
```

**Test GitHub MCP:**

```
Initialize a git repo, create a .gitignore for Next.js, 
make an initial commit, and push to a new GitHub repo called "job-tracker".
```

**Test Playwright MCP (if added):**

```
Start the dev server, then use Playwright to navigate to localhost:3000 
and take a screenshot of the dashboard. Verify the layout looks correct.
```

---

### Step 9: Create your first Skill (15 min)

**Goal:** Learn auto-activated behaviors.

```bash
mkdir -p .claude/skills/api-route-creator
```

Tell Claude:

```
Create a skill at `.claude/skills/api-route-creator/SKILL.md` that auto-activates 
when I ask to create API routes. 

The skill should instruct you to:
1. Create the route in src/app/api/
2. Use proper HTTP method handlers (GET, POST, PUT, DELETE)
3. Add input validation with zod
4. Return proper status codes and error messages
5. Add TypeScript types for request/response
6. Create a co-located test file

The description field should trigger on keywords like "API route", "endpoint", "backend route".
```

**Test it** (the skill should activate automatically):

```
Create an API route for job application statistics — 
total count, count per status, average time in each stage.
```

---

### Step 10: Build the Stats View (30 min)

**Goal:** Combine everything you've learned.

```
Plan and implement a /stats page that shows:
1. Summary cards: total applications, active, offers, rejection rate
2. A status distribution chart (bar or pie chart using recharts)
3. Application timeline (jobs applied per week)
4. Average time-to-response per company

Use the stats API route we just created.
Make it responsive and visually polished.
```

During this phase, you should naturally use:
- Plan mode for architecture
- Your CLAUDE.md conventions
- The component-creator subagent for new components
- The API route skill for the data endpoint
- Your /test and /review commands
- The type-checking hook running automatically

---

## End of Day — Review & Commit (15 min)

```
Review all changes we made today. Run the full test suite.
Fix any failing tests or type errors. Then create a well-structured 
commit history — group related changes into separate commits with 
conventional commit messages.
```

Finally, check your `.claude/` folder:

```
.claude/
├── commands/
│   ├── test.md
│   ├── review.md
│   └── commit.md
├── agents/
│   └── component-creator.md
├── skills/
│   └── api-route-creator/
│       └── SKILL.md
└── settings.json          # hooks config
CLAUDE.md                  # project memory
```

**This is your Claude Code configuration portfolio** — as valuable as the app itself.

---

## What You Learned Today

| # | Capability | What You Did |
|---|-----------|-------------|
| 1 | **CLAUDE.md** | Created project memory with conventions |
| 2 | **Plan Mode** | Scaffolded project architecture before coding |
| 3 | **Slash Commands** | Built /test, /review, /commit workflows |
| 4 | **Subagents** | Created a component-creator specialist |
| 5 | **Hooks** | Added type-checking and safety hooks |
| 6 | **MCP Servers** | Connected GitHub (and optionally Playwright) |
| 7 | **Skills** | Built an auto-activating API route creator |

---

## Days 2-5 Preview

| Day | Focus | What you'll build |
|-----|-------|-------------------|
| **2** | Deep dive: Subagents + Advanced prompting | Kanban board view, drag & drop, more subagents (test-writer, docs-generator) |
| **3** | Deep dive: MCP + Hooks | Playwright E2E tests, pre-commit quality pipeline, Chrome DevTools debugging |
| **4** | Deep dive: Skills + Plugins | Auto-documentation skill, component library skill, package as plugin |
| **5** | Polish + Deploy | Seed data/demo mode, deploy to Vercel, write README with "Built with Claude Code" section, interview prep |

---

## Pro Tips for Day 1

1. **Don't fight Claude** — if it goes in a wrong direction, `Esc Esc` to rewind and rephrase
2. **Check context often** — `/context` tells you how bloated your conversation is
3. **Compact early** — use `/compact` before you hit the wall, not after
4. **Read the diffs** — even when you trust Claude, reviewing diffs builds your understanding
5. **Git commit often** — checkpoints are great, but git is your real safety net
6. **Take notes** — write down what worked and what didn't, update your CLAUDE.md accordingly
