# ADR-0005 · Performance budget

**Status:** Proposed · 2026-10-06 · owner approval pending

## Decision

Kerix is fast by budget, not by language. Every budget below is measured on a mid-range Android phone over a 4G-class connection and enforced by the gate (`scripts/check.sh`) where a number can be checked at build time, and by a hand test where it cannot.

| Moment | Budget |
|---|---|
| Cold first visit, open URL to usable capture field | under 2 s |
| Launch of the installed app, cold | under 1 s, zero network requests on the critical path |
| Capture, Enter to visible slab | under 100 ms, never waits on a network (non-negotiable 1) |
| JavaScript on the critical path | under 100 kB gzipped; sign-in and sync load as a lazy chunk |
| Total JavaScript shipped | under 250 kB gzipped; the gate fails above it |
| Third-party requests on the critical path | zero (fonts bundled, issue #3) |

A change that breaks a budget is not done. A change that moves a number in the wrong direction by more than 10 % needs a reason in its completion report.

## Why

Measured on 2026-10-06, Pixel-class emulation, both builds served through the same Cloudflare quick tunnel:

| Build | Cold load to first render | Requests | Transferred |
|---|---|---|---|
| Dev server (`npm run dev`) | 33.7 s | 44 | 6.8 MB |
| Dev server, second visit | 2.3 s | 44 | 6.7 MB |
| Production build (`npm run build`) | 2.2 s | 10 | 646 kB |
| Production build, second visit | 1.0 s | 10 | 612 kB |

The owner's experience of a slow app came from the dev server, which ships every module unbundled and uncached across a tunnel. The production build is the product, and it is already within a few hundred milliseconds of the budget before any optimisation. What remains is bytes and round trips: one 158 kB gzipped script that includes the sync client even for a signed-out first visit, and fonts fetched from a third party.

Load time of a user-interface app is bytes, round trips and work on the main thread before first paint. The implementation language of the UI is not the lever:

- **Rust compiled to WebAssembly (Leptos, Yew, Dioxus)** ships a larger initial payload than the equivalent JavaScript for a text-heavy interface, starts slower because the module must be fetched, compiled and instantiated before anything renders, and loses the PWA, accessibility and testing toolchain the stack was chosen for in ADR-0002. Rust belongs where compute lives: the daimons of horizon 2 and on-device inference in horizon 3, not the capture surface.
- **Native apps** were rejected in ADR-0002 for store friction and duplicate pipelines.
- **A lighter view library (Preact, Solid)** could cut 30 to 40 kB. It is the fallback if the budget is missed after the cheaper moves, and it is a swap, not a rewrite.

## Consequences

- Spec 003 ships the production build; daily use happens on the measured path, never on the dev server. Phone testing of the dev server through a tunnel is accepted as slow.
- A new spec splits sign-in and sync into a lazy chunk and adds the bundle-size assertion to the gate.
- Issue #3 (bundle the fonts) moves ahead of tags and search in the build order, pending the owner's confirmation in PRODUCT.md.
- Every spec whose change touches the critical path records the before and after numbers in its completion report.
