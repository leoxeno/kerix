# ADR-0004 · Spec-driven development with an agent

**Status:** Accepted · 2026-10-06

## Decision

Kerix is built spec-first by an AI agent with the owner approving. The method follows the guide in [../reference/](../reference/README.md): the repository is the source of truth; specification precedes acceptance criteria, tests and implementation; work runs in two phases (specify and stop, then implement exactly); failures get three targeted attempts, then a stop and a classification; one canonical check script is run by hooks and by CI, and CI is the enforcement layer.

The agent-facing rules live in `CLAUDE.md`, with `AGENTS.md` a symlink so any agent tool reads the same file. The tree of linked documents under `docs/` holds everything that changes more often than the rules.

## Why

The owner's working style is to approve, not to type. That only works if what is being approved is written down, small, and testable. A chat transcript is not reviewable; a spec with acceptance criteria and a diff against it is. Specs also survive context resets and model changes, which conversations do not.

## Consequences

- Every feature has a numbered spec in `docs/specs/` with a status line. Refinements update the same spec; new capabilities get a new spec.
- Durable choices become ADRs here. Feature details do not.
- `scripts/check.sh` is the only definition of "green". If it is slow, split a fast pre-commit subset, but the full script stays the gate.
- The agent reports completion in a fixed format so the owner can approve from the report and the diff alone.
