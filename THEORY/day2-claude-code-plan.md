# Day 2 — Subagents Deep Dive + Kanban Board

> **Goal:** Master subagent patterns (delegation, specialization, parallel work) by building a Kanban board feature.
> **Duration:** ~4-5 hours
> **Prerequisites:** Day 1 complete, Job Tracker app working

---

## Morning — Subagent Mastery (2h)

### Step 1: Understand the subagent architecture (10 min)

Before creating more agents, understand how Claude Code delegates:

```
┌──────────────────────────────────┐
│         MAIN AGENT (you)         │
│  Coordinates, delegates, reviews │
├──────────┬───────────┬───────────┤
│ Subagent │ Subagent  │ Subagent  │
│ (read)   │ (write)   │ (read)    │
│ Own ctx  │ Own ctx   │ Own ctx   │
└──────────┴───────────┴───────────┘

Key rules:
- Each subagent has its OWN context window (isolated)
- Subagents CANNOT spawn other subagents (no nesting)
- Up to 7 subagents can run in parallel
- They return only results → keeps your main context clean
- Auto-delegation is based on the description field
```

Quick exploration in Claude Code:

```
/agents
```

This shows all available subagents (built-in + your custom ones from Day 1). Take a look at what's there.

---

### Step 2: Create a test-writer subagent (15 min)

Your Day 1 review showed 7 components without tests. Let's build a specialist for that.

In Claude Code:

```
Create a subagent at .claude/agents/test-writer.md with:
- Name: test-writer
- Description: "Use PROACTIVELY when writing, updating, or fixing tests. 
  MUST BE USED for all test-related tasks."
- Tools: Read, Write, Edit, Glob, Grep, Bash
- Model: sonnet

System prompt should instruct it to:
1. Read the source file to understand what to test
2. Check existing test patterns in the project (look at __tests__/)
3. Use Vitest 4 + React Testing Library
4. Write tests that exercise real functionality — avoid excessive mocking
5. Test happy paths, edge cases, and error states
6. Use descriptive test names: "should [behavior] when [condition]"
7. Run the tests to verify they pass before returning
8. Follow our CLAUDE.md conventions
```

**Test it immediately:**

```
Use the test-writer subagent to write tests for lib/db.ts
```

Watch how it works in its own context, then returns results to your main thread.

---

### Step 3: Create a docs-generator subagent (15 min)

```
Create a subagent at .claude/agents/docs-generator.md with:
- Name: docs-generator
- Description: "Use PROACTIVELY when generating or updating documentation, 
  README files, JSDoc comments, or API docs."
- Tools: Read, Write, Edit, Glob, Grep
- Model: sonnet

System prompt:
1. Analyze the codebase structure and key files
2. Generate clear, concise documentation
3. Use JSDoc for function documentation
4. Write README sections with setup instructions, architecture overview, 
   and usage examples
5. Keep docs practical — no filler content
6. Follow Markdown best practices
```

**Test it:**

```
Use the docs-generator subagent to add JSDoc comments to all exported 
functions in lib/db.ts
```

---

### Step 4: Create a domain-routing pattern in CLAUDE.md (15 min)

This is the key to making subagents work well together. Add routing rules to your CLAUDE.md:

```
Add the following section to CLAUDE.md under a new "## Agent Delegation Rules" heading:

## Agent Delegation Rules
- Use component-creator for all new React component creation
- Use test-writer for ALL test-related tasks (writing, fixing, updating tests)
- Use docs-generator for documentation, README updates, and JSDoc comments
- Use code-reviewer (from Day 1) for code quality reviews
- When implementing a new feature:
  1. Plan the approach first (plan mode)
  2. Build components via component-creator
  3. Write tests via test-writer
  4. Update docs via docs-generator
```

This teaches the main agent WHEN to delegate to WHOM.

---

### Step 5: Practice parallel delegation (20 min)

Now let's see subagents work in parallel. Ask Claude:

```
I need you to do three things in parallel:
1. Use test-writer to write tests for components/jobs/job-card.tsx
2. Use test-writer to write tests for components/jobs/job-form.tsx
3. Use docs-generator to add JSDoc to all files in lib/

Delegate these as parallel tasks.
```

**What to observe:**
- Claude spawns multiple subagents simultaneously
- Each works in its own context
- Results come back without polluting your main context
- Check `/context` before and after to see the difference

---

### Step 6: Advanced subagent patterns (15 min)

#### Pattern A: Read-only agents (restrict tools)

Create a security/accessibility auditor that can only READ:

```
Create a subagent at .claude/agents/a11y-auditor.md with:
- Name: a11y-auditor
- Description: "Use for accessibility audits and WCAG 2.1 AA compliance checks"
- Tools: Read, Glob, Grep  (READ ONLY — no Write, Edit, or Bash)
- Model: sonnet

System prompt:
1. Scan all React components for a11y issues
2. Check for: missing alt text, aria labels, keyboard navigation, 
   focus management, semantic HTML, color contrast concerns
3. Reference WCAG 2.1 AA criteria
4. Report findings with severity (Error/Warning/Info)
5. Suggest fixes but DO NOT modify files
```

**Test it:**

```
Use the a11y-auditor subagent to audit the entire components/ directory
```

#### Pattern B: Cost optimization with model routing

You can route different subagents to different models. Update your agents:

- **Complex tasks** (code-reviewer, component-creator) → `model: sonnet` 
- **Simple/fast tasks** (docs-generator) → `model: haiku`

Or set globally:

```bash
export CLAUDE_CODE_SUBAGENT_MODEL="claude-sonnet-4-5-20250929"
```

This keeps your main session on Opus while subagents run cheaper on Sonnet.

---

## Afternoon — Build the Kanban Board (2.5-3h)

Now apply everything you've learned by building a complex feature.

### Step 7: Plan the Kanban board (20 min)

Switch to **Plan Mode** (`Shift+Tab`):

```
Plan a Kanban board view for the Job Tracker with these requirements:

Feature overview:
- Board with columns for each job status: Applied, Phone Screen, 
  Technical, Onsite, Offer, Rejected
- Each column shows job cards that can be dragged between columns
- Dropping a card in a new column updates the job's status via API
- Column headers show the count of jobs in each column
- Cards show: company name, role, days since applied
- Add a toggle to switch between List view (existing) and Board view

Technical requirements:
- Use @hello-pangea/dnd for drag and drop (maintained fork of react-beautiful-dnd)
- Client component with "use client" directive
- Optimistic UI updates (move card immediately, sync with API)
- Proper TypeScript types for all DnD events
- Mobile: stack columns vertically with horizontal scroll
- Accessible: keyboard navigation for drag and drop
- Error handling: revert card position if API update fails

Plan the component architecture and file structure before coding.
```

Review the plan, adjust if needed, then proceed.

---

### Step 8: Build the Kanban board with subagent delegation (60 min)

This is where it all comes together. Approve the plan (option 2 — manually approve edits), then:

```
Implement the Kanban board following the plan. 

For each new component, delegate to the component-creator subagent.
After each component is created, delegate tests to the test-writer subagent.
```

**Components you'll likely need:**
- `KanbanBoard` — main board container, manages DnD context
- `KanbanColumn` — individual status column
- `KanbanCard` — draggable job card (different from the list JobCard)
- `ViewToggle` — switch between List and Board views

**What to watch for during the build:**
- Does Claude auto-delegate to component-creator? If not, ask explicitly
- Does the test-writer get invoked for new components?
- Use `/context` periodically to monitor context usage
- Use `/compact` if context gets heavy

---

### Step 9: Add the view toggle to the dashboard (20 min)

```
Add a ViewToggle component to the main dashboard page that switches 
between the existing List view and the new Board view.

- Default view should be Board (Kanban)
- Persist the user's preference in localStorage
- Use shadcn/ui Tabs or ToggleGroup component
- Both views should share the same data and filters
```

---

### Step 10: Test the Kanban board thoroughly (30 min)

Use your subagents:

```
Do the following in parallel:
1. Use test-writer to write comprehensive tests for the Kanban board components
   (KanbanBoard, KanbanColumn, KanbanCard, ViewToggle)
2. Use a11y-auditor to audit all new Kanban components for accessibility issues
```

Then run your quality commands:

```
/test
/review
```

Fix any issues that come up.

---

### Step 11: Polish and commit (20 min)

```
Review the Kanban board implementation:
1. Ensure drag and drop works smoothly
2. Verify optimistic updates with error rollback
3. Check mobile responsiveness
4. Run full test suite
5. Fix any remaining issues

Then create well-structured commits grouping related changes.
```

Use your `/commit` command for each logical group of changes.

---

## End of Day — Review Your Agent Setup

Your `.claude/agents/` should now have:

```
.claude/agents/
├── component-creator.md    # Day 1
├── code-reviewer.md        # Day 1 (if created) 
├── test-writer.md          # Day 2
├── docs-generator.md       # Day 2
└── a11y-auditor.md         # Day 2
```

And your CLAUDE.md should include Agent Delegation Rules.

---

## What You Learned Today

| Concept | What You Practiced |
|---------|-------------------|
| **Custom subagents** | Created 3 new specialized agents |
| **Auto-delegation** | Used description-based routing |
| **Parallel execution** | Ran multiple subagents simultaneously |
| **Read-only agents** | Built a11y-auditor with restricted tools |
| **Model routing** | Cost optimization with different models per agent |
| **Domain routing** | CLAUDE.md rules for when to delegate to whom |
| **Complex feature** | Built Kanban with DnD using the full subagent workflow |
| **Agent pipeline** | plan → component-creator → test-writer → docs-generator |

---

## Day 3 Preview

**Deep dive: MCP + Hooks + Advanced Workflows**
- Playwright E2E tests for the Kanban drag & drop
- Pre-commit quality pipeline with chained hooks
- Chrome DevTools MCP for visual debugging
- SubagentStop hooks for automatic chaining
- Git worktrees for parallel development

---

## Pro Tips for Day 2

1. **Don't over-agent** — 3-5 agents is plenty. More creates coordination overhead.
2. **Subagents for read-heavy work** — exploration, review, audit. Be careful with multiple agents writing to the same files.
3. **Explicit > auto-delegation** while learning — say "Use the test-writer subagent" until you trust the auto-routing.
4. **Check subagent output** — they're isolated, so review what they produce before moving on.
5. **Update CLAUDE.md** — if agents do something wrong, add a note so they learn for next time.
