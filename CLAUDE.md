# CLAUDE.md — AI Assistant Guide for `problemspace_v1`

This file is the authoritative guide for AI assistants (Claude Code and others) working in this repository. Update it as the project evolves.

---

## Repository Overview

| Property | Value |
|---|---|
| **Repo name** | `problemspace_v1` |
| **Owner** | `talhaminhas1997` |
| **Remote** | `http://local_proxy@127.0.0.1:19274/git/talhaminhas1997/problemspace_v1` |
| **State at creation** | Empty — no source files committed yet |
| **CLAUDE.md created** | 2026-03-01 |

This repository was initialized empty. As code is added, update the sections below to reflect the actual stack, structure, and conventions in use.

---

## Git Workflow

### Branch Naming

All AI-generated branches **must** follow this pattern:

```
claude/<session-description>-<session-id>
```

Example: `claude/claude-md-mm87jc089nit7zns-fzhfV`

> **Critical:** Branches that do not match this pattern will be rejected with HTTP 403 on push.

### Standard Workflow

```bash
# 1. Ensure you're on the correct feature branch
git checkout claude/<your-branch>

# 2. Make changes, then stage and commit
git add <specific-files>     # prefer explicit file names over `git add .`
git commit -m "descriptive message"

# 3. Push to origin
git push -u origin claude/<your-branch>
```

### Push Retry Policy

If a push fails due to a **network error** (not a 403), retry with exponential backoff:

| Attempt | Wait before retry |
|---|---|
| 1st retry | 2 s |
| 2nd retry | 4 s |
| 3rd retry | 8 s |
| 4th retry | 16 s |

Do **not** retry a 403 — it means the branch name is wrong.

### Commit Message Conventions

- Use imperative mood: "Add feature" not "Added feature"
- Keep the subject line ≤ 72 characters
- Separate subject from body with a blank line when detail is needed
- Reference issue/PR numbers where relevant: `Fix login bug (#42)`
- Never amend published commits; create a new commit instead
- Never skip hooks (`--no-verify`)

---

## Development Principles

### Code Quality

- **Minimal changes**: only modify what is necessary for the task at hand
- **No over-engineering**: avoid abstractions, helpers, or utilities for one-off operations
- **No speculative features**: do not add functionality for hypothetical future requirements
- **No cleanup tax**: do not refactor surrounding code while fixing a bug unless asked
- **No comments on unchanged code**: only add comments where logic is genuinely non-obvious

### Security

- Never commit secrets, credentials, API keys, or `.env` files
- Validate all user input and data from external APIs at system boundaries
- Avoid command injection, XSS, SQL injection, and other OWASP Top 10 vulnerabilities
- Use parameterized queries; never concatenate user input into SQL or shell commands

### File Management

- Prefer editing existing files over creating new ones
- Do not create `*.md` or `README` files unless explicitly requested
- Avoid backwards-compatibility shims for code that has been cleanly removed

---

## Codebase Structure

> **Note:** This repository is currently empty. Update this section once files are added.

```
problemspace_v1/
└── CLAUDE.md          # this file
```

When source code is added, document:

- **Directory layout** (e.g., `src/`, `tests/`, `docs/`)
- **Entry points** (e.g., `main.py`, `index.ts`, `cmd/server/main.go`)
- **Key modules / packages** and what each is responsible for
- **Configuration files** and what settings they control

---

## Tech Stack

> **Note:** No stack has been established yet. Update this section once dependencies are added.

When a stack is chosen, document:

- **Language & runtime version** (e.g., Python 3.12, Node 20, Go 1.22)
- **Framework** (e.g., FastAPI, Next.js, Gin)
- **Database** (e.g., PostgreSQL 16, SQLite, MongoDB)
- **Infrastructure** (e.g., Docker, Kubernetes, AWS Lambda)
- **Package manager** (e.g., `pip`/`uv`, `npm`/`pnpm`, `cargo`)

---

## Development Environment Setup

> **Note:** Populate this section once the project stack is defined.

Typical setup steps to document:

```bash
# Install dependencies
<package-manager> install

# Configure environment
cp .env.example .env
# Edit .env with your local values

# Run the development server
<start-command>

# Run tests
<test-command>

# Run linter / formatter
<lint-command>
```

---

## Testing

> **Note:** Update once a test framework is chosen.

When tests exist, document:

- **Framework** (e.g., pytest, Jest, Go test)
- **How to run all tests**: `<command>`
- **How to run a single test**: `<command>`
- **Where test files live** relative to source files
- **Coverage requirements** if any
- **What must pass before merging**: unit tests, integration tests, linting, type checks

---

## Linting and Formatting

> **Note:** Update once tooling is configured.

Document:

- **Linter**: tool name + command
- **Formatter**: tool name + command
- **Pre-commit hooks**: what they check
- **CI enforcement**: whether lint/format failures block merges

---

## AI Assistant Dos and Don'ts

### Do

- Read files before editing them
- Run tests after making changes (once a test suite exists)
- Prefer reversible, local actions; ask before destructive operations
- Keep one task `in_progress` at a time using the TodoWrite tool for multi-step work
- Use `git fetch origin <branch>` to check remote state before pushing

### Don't

- Push to `main` or `master` directly — always use a `claude/` branch
- Force-push (`--force`) without explicit user permission
- Delete files, branches, or database tables without confirmation
- Guess URLs or fabricate API endpoints
- Add emoji unless the user explicitly requests it
- Batch multiple completions — mark each todo done immediately upon finishing it

---

## Maintaining This File

Update `CLAUDE.md` whenever:

- A new technology, framework, or tool is added to the project
- Directory structure changes significantly
- New conventions or workflows are established
- Onboarding steps change

Keep it accurate and concise — it is the first thing an AI assistant reads when entering this codebase.
