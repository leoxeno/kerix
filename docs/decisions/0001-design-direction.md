# ADR-0001 · Design direction

**Status:** Accepted · 2026-10-06

## Decision

One design system with two modes from one token set: **Isu Marble** (light) and **Nexus** (dark), both derived from *The Fate of Atlantis*. Composition **Seam** as the base, **Stele** typography scale for the thought text, **Oracle** question on the empty state.

## Why

The owner's aesthetic brief was ancient Greek fused with Isu high technology. Four directions and eight compositions were mocked up and compared on real capture screens. Seam gives daily structure and natural swipe targets; Stele gives beauty at rest; Oracle gives ritual without slowing capture. Two modes from one token set means every later theme (Elysium Dawn, Hades Ember) is a thirty-line addition.

## Consequences

- Components use tokens only (CLAUDE.md non-negotiable 2).
- Light separates layers with shadow, dark with glow; the tokens `--lift` and `--glow` carry that difference.
- Full tokens, alternatives and mockup sources: [../design/DESIGN-DECISIONS.md](../design/DESIGN-DECISIONS.md).
