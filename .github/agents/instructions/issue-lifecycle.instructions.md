---
applyTo: "**"
---

# Issue Lifecycle Protocol

**Every agent working on a GitHub issue MUST follow this protocol in order.**

---

## 1. Start: Mark issue as in-progress

- Assign yourself to the issue if not already assigned
- Add label `in-progress` to the issue
- Use `github-pull-request_issue_fetch` to read full issue details before starting

## 2. Create a dedicated branch

Branch naming convention (from user memory — never commit to `main`):

| Issue type | Branch name pattern |
|---|---|
| New feature | `feat/<issue-number>-<short-desc>` |
| Bug fix | `fix/<issue-number>-<short-desc>` |
| Hotfix | `hotfix/<issue-number>-<short-desc>` |

Example for issue #15: `feat/15-redesign-panel-interface`

**Never** commit directly to `main` or any protected branch.

## 3. Commit with Conventional Commits

Use the correct prefix — it determines the version bump:

| Prefix | Bump | Use when |
|---|---|---|
| `feat:` | minor | User-visible new feature |
| `fix:` | patch | Bug fix |
| `perf:` | patch | Performance improvement |
| `feat!:` / `BREAKING CHANGE:` | major | Breaking change |
| `test:` | none | Tests only |
| `refactor:` | none | No behavior change |
| `chore(deps):` | patch | Dependency update |

## 4. Open a Pull Request

- Title must match: `feat(#15): <short description>`
- PR description must include:
  1. What changes and why
  2. Version bump type (major / minor / patch / none)
  3. Checklist: tests added, coverage ≥ 80%, lint clean, WCAG AA respected if CSS changed

## 5. Verify CI

- Wait for all CI checks to pass (SonarCloud, CodeQL, tests)
- Fix any failures before requesting review
- Do NOT merge with failing CI

## 6. Update documentation and changelog

- Update `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/) format
- Update `README.md` if user-facing behavior changes
- Update `copilot-instructions.md` if project conventions change

## 7. Session memory

At the start and end of each session, read/update session memory:
- Current issue number and branch name
- Which agents have completed their task
- Blockers or decisions made

---

> This file is referenced by all agents. Do not duplicate its content in individual agent files.
