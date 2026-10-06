# Kerix · agent rules

Kerix is a herald: capture a thought anywhere, dispatch it to a machine that does the work. Local-first PWA. Built in public by Leo Xeno. All rights reserved.

This file is the stable root of the spec tree. It changes rarely. Everything that changes often lives in a linked file. `AGENTS.md` is a symlink to this file; `scripts/check.sh` fails if they drift.

## The one rule

**The repository is the source of truth, not the chat.** A requirement that exists only in a conversation does not exist. Write it into a spec, an ADR, or an issue before acting on it.

## Read on demand

| When you are about to… | Read first |
|---|---|
| Do anything | this file, then [docs/STATUS.md](docs/STATUS.md) for where we are and what is next |
| Touch product scope or milestones | [docs/PRODUCT.md](docs/PRODUCT.md) |
| Argue about why Kerix exists | [docs/VISION.md](docs/VISION.md) |
| Change structure, data flow, sync, dispatch | [docs/architecture/OVERVIEW.md](docs/architecture/OVERVIEW.md) |
| Touch the Thought model or the database | [docs/architecture/DATA-MODEL.md](docs/architecture/DATA-MODEL.md) |
| Write code | [docs/architecture/CONVENTIONS.md](docs/architecture/CONVENTIONS.md) |
| Touch anything visual | [docs/design/DESIGN-DECISIONS.md](docs/design/DESIGN-DECISIONS.md) |
| Build a feature | its spec in [docs/specs/](docs/specs/) and [docs/specs/README.md](docs/specs/README.md) |
| Make a durable architectural choice | [docs/decisions/](docs/decisions/) (ADRs) |
| Understand the method | [docs/reference/README.md](docs/reference/README.md) |

## How work happens: spec-driven, two phases

Priority order: **specification → acceptance criteria → tests → implementation.**

**Phase A, specify.** For any non-trivial change: read this file and the relevant architecture docs, inspect existing code and tests, then create or update the spec in `docs/specs/`. Include goals, non-goals, assumptions, behaviour, acceptance criteria, testing, open questions. Surface conflicts and ambiguities. Do not invent requirements. **Stop before implementation** and wait for approval.

**Phase B, implement.** Re-read the approved spec and this file. Make the smallest change that satisfies it. No unrelated refactoring. Add or update tests that map to the acceptance criteria. Run targeted tests, then `./scripts/check.sh`. Compare the final diff against every acceptance criterion. Report: files changed, tests, results, deviations, remaining risks.

Trivial changes (typo, a token value, a one-line fix with an obvious test) skip Phase A but still run the check.

## Failure policy

A failing test is evidence, not automatically the truth. The approved spec is the primary behavioural reference.

- Read the full failure. State a root-cause hypothesis before changing code. Make one targeted change. Run the smallest relevant test.
- **After 3 failed targeted attempts: stop and diagnose.** Classify as implementation defect, test defect, specification defect, environment or tooling issue, dependency or version issue, or unclear requirement.
- Never delete, skip, disable or weaken a test to get green. Never raise a timeout without a root cause. Never suppress an exception to satisfy a test. Stop on oscillation.
- If a test contradicts the spec, investigate the mismatch. The fix may belong in the test or the spec.

## Non-negotiables

1. **Local-first.** Every write lands in the device database first and the UI updates from it. Nothing the user does waits on a network. Sync is a background concern.
2. **Tokens only.** No raw colour, font or shadow values in components. Use the tokens in `src/index.css`. Both modes must work for every change.
3. **Accessible as built.** Real buttons, inputs and labels. Touch targets 44 px minimum. Text contrast 4.5:1 (3:1 at 24 px+). Keyboard reachable.
4. **Zero running cost.** Free tiers only. No paid service without an ADR.
5. **Identity.** The author is Leo Xeno. Commits use the GitHub noreply address. No other personal identifiers, employers, or locations enter the repo, the commits, or the issues.
6. **All rights reserved.** Do not add licence headers that grant rights. Do not vendor code whose licence conflicts with closed distribution without an ADR.
7. **Specs are feature-sized.** One capability per spec. Never one giant spec. Never `v2` or `final` filenames; Git versions files.

## Commands

```bash
./scripts/setup-dev.sh   # once per clone: installs git hooks
npm run dev              # dev server on your LAN, open it on the phone too
npm test                 # vitest, once
./scripts/check.sh       # the canonical gate: lint, typecheck, test, build, sync and privacy checks
```

CI runs `./scripts/check.sh`. CI and the protected `main` branch are the enforcement layer; local hooks are only fast feedback.

## Completion report

Every implementation ends with this, in the reply and nowhere else:

```
Spec: docs/specs/NNN-name.md (status after this work)
Changed: list of files
Tests: what was added or changed, and the run result
Criteria: each acceptance criterion with met / not met
Deviations: anything that differs from the spec, and why
Risks: what is still uncertain
```
