# context-economy.md · sessions, subagents, model tiers

> Auto-loaded into every session in this repo (no `paths` frontmatter, so it is not conditional). Mirrors the shared rule used across the owner's other repos; keep the tier policy identical there and here, and keep Kerix-specific routing in this file's last section.

A session re-reads its whole cached context every turn, so a long session pays for its transcript once per turn. Cache reads dominate token cost. Context is a budget, and it is spent by the turn whether or not it is used.

## Session hygiene

- **Checkpoint at task boundaries.** When a task closes and the next is unrelated, write state to its existing home in this repo (`docs/STATUS.md`, the spec's status line, an ADR, or an issue), commit, then propose a fresh session. Never create a NOTES.md or other scratch file for it. This is the same rule as "the repository is the source of truth, not the chat".
- Offer the same unprompted once a session has run long or wandered across unrelated tasks. Say the cost out loud; do not wait to be asked.
- Every fresh-session suggestion ships a copy-paste resume prompt in its own fenced block, self-contained: working focus, immediate next action, hard constraints, and which files to read. Point at `docs/STATUS.md`, never restate its contents.
- Read narrowly: line ranges, greps, single files. Never whole large files, never `node_modules`, `dist`, or `package-lock.json`.
- Bulk text (dependency source, library documentation, build output, long logs) never enters the orchestrating session; it goes to a subagent that returns findings only.
- Verification and review rounds start in a fresh session or a separately spawned agent. Cheaper, and it is the only way the check is not self-grading.

## Delegation tiers

The session model keeps orchestration, judgment, and anything voice- or design-sensitive. Delegate the rest to the tier that fits the work. When the session runs Fable (the tier above Opus), Fable is the session model ONLY, never a subagent tier: every delegated task routes to the three tiers below, and Fable spends itself on orchestration and the judgment calls only the session can make.

- **Opus, medium effort: judgment.** Verification of a diff against acceptance criteria, red-team of a spec, root-cause diagnosis after the three-attempt stop, review of an ADR, anything where being wrong is expensive. Opus scopes to exactly what was asked, so an underspecified brief returns shallow work. Write the brief complete or expect nothing.
- **Sonnet, high effort: volume.** Implementing a unit whose spec and acceptance criteria are already approved, writing tests that map to listed criteria, file sweeps, reading and summarizing library docs, fan-out searches across `src/`.
- **Haiku: clerical, zero judgment.** File inventories, token-value sweeps, format conversion, scripted file operations, running `./scripts/check.sh` and reporting the raw result.

Binding constraints on the above:

- Escalate a tier when the output shows the task was above it. Never iterate downward, never re-run the same tier hoping for a better draw. Subagent escalation tops out at Opus: work Opus cannot carry comes back into the session; it never spawns a Fable subagent.
- Prefer few large subagents over many short-lived ones; each re-establishes its own context, so wide fan-out of tiny agents costs more than it saves. **Exception:** a verifier is never merged into the agent that produced the work, and parallel workers never share context.
- Any met / not met call on an acceptance criterion, any PASS / FAIL on a check, and the completion report itself stay at the judgment tier even when the work beneath them was delegated down. A cheap tier may gather evidence; it may never rule on it.

## Kerix routing

- **Phase A (specify) is session work.** Specs, ADRs, and design decisions carry the product's voice and the owner approves them; they are not delegated. A subagent may gather the evidence a spec needs (existing code paths, constraints in the data model) and return findings.
- **Phase B (implement) delegates by criterion.** Hand Sonnet one approved spec, its acceptance criteria, `docs/architecture/CONVENTIONS.md`, and the non-negotiables. It returns the diff and the test run. An Opus verifier, spawned separately, compares the diff against every criterion. The session writes the completion report.
- **The failure policy's three-attempt stop is a tier boundary.** The implementing agent stops; diagnosis goes to Opus with the full failure text; the session classifies the result.
- **Every delegated brief restates the relevant non-negotiables** (local-first, tokens only, accessible as built, zero running cost, identity, all rights reserved). A subagent does not read CLAUDE.md on its own.
- **No heavy compute lives here.** Kerix is a PWA on free tiers; the only compute is the check script and the dev server. Nothing in this repo needs a remote machine.
