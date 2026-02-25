# Run Tests for Recent Changes

Run tests for files that have been recently changed in this repository.

## Steps

1. Identify changed files using `git status` and `git diff --name-only HEAD~5` to find recently modified source files
2. Find corresponding test files in `__tests__/` that match the changed source files
3. Run the relevant tests using `pnpm test:run <test-files>`
4. If all tests pass, report success
5. If any tests fail:
   - Analyze the failure output carefully
   - Identify the root cause (test bug vs implementation bug)
   - Suggest specific fixes with code snippets
   - **Do NOT apply fixes automatically** — wait for user approval before making any changes
