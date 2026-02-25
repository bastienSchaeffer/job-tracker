# Review Staged Changes

Review the currently staged git changes for code quality issues.

## Steps

1. Get staged changes using `git diff --cached`
2. Analyze the diff and check for the following issues:

### TypeScript Errors
- Missing or incorrect types
- Use of `any` type (should use `unknown` or proper types)
- Missing function parameter/return types

### Missing Tests
- New functions in `lib/` should have corresponding tests in `__tests__/`
- New components should have basic render tests
- Check if `__tests__/` directory has coverage for changed files

### Accessibility Issues
- Images missing `alt` attributes
- Interactive elements missing labels
- Missing ARIA attributes where needed
- Color contrast concerns
- Keyboard navigation issues

### Naming Convention Violations (per CLAUDE.md)
- Components must use **PascalCase**: `JobCard`, `StatusBadge`
- Hooks must use **camelCase**: `useJobForm`, `useFilters`
- Utilities must use **camelCase**: `formatSalary`, `cn`
- Constants must use **SCREAMING_SNAKE_CASE**: `JOB_STATUSES`, `STATUS_LABELS`
- Props interfaces must be named `{ComponentName}Props`
- Named exports required (no default exports except Next.js pages)

## Output

Provide a summary report with:
- List of issues found, grouped by category
- Severity level for each issue (error/warning)
- Specific line references and suggested fixes
- Overall assessment: ready to commit or needs changes
