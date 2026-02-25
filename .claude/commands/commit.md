# Stage and Commit Changes

Stage all changes and create a conventional commit.

## Steps

1. Run `git status` to see all changes
2. Run `git diff` to understand what changed
3. Stage all changes with `git add -A`
4. Analyze the staged changes to generate an appropriate commit message

## Commit Message Format

Use conventional commit format:

```
<type>(<scope>): <subject>

<body>
```

### Types
- **feat**: New feature or functionality
- **fix**: Bug fix
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **docs**: Documentation only changes
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates

### Rules
- Subject line: max 50 characters, imperative mood, no period
- Scope: optional, indicates area of codebase (e.g., `jobs`, `api`, `ui`)
- Body: wrap at 72 characters, explain what and why (not how)

## Confirmation Required

After generating the commit message:
1. Present the proposed message to the user
2. **Wait for explicit approval** before running `git commit`
3. If user requests changes, revise the message and ask again
