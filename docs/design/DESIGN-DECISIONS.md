# Design decisions

Product: **Kerix** (named 2026-10-06; working title was Atlantis Inbox). A cross-device thought-capture app.
Aesthetic brief from the owner: *Assassin's Creed Odyssey, The Fate of Atlantis* — ancient Greek forms fused with Isu high technology.

## ADR-001 · Visual direction (2026-10-06)

**Decision:** One design system with two modes sharing the same tokens and geometry.

- **Light = Isu Marble.** Warm white stone ground, thin gold seams, cyan only as a pulse (sync state, tags).
- **Dark = Nexus.** Obsidian ground, gold filigree, cyan energy glow. Glow replaces shadow as the layering device.

**Composition:** **B · Seam** as the base. Each thought is a stone slab with a hairline gold seam along its top and a short cyan glint at a varying position. Diamond checkboxes. Square-cornered capture slab with a glowing seam.

**Borrowed from D · Stele:** the thought text scale (large Cormorant Garamond for the thought itself, mono for meta).

**Borrowed from C · Oracle:** the "What is on your mind?" question is used **only on the empty state**, when the inbox has nothing in it.

**UX invariants (apply to every composition):**
- Capture bar at the bottom on phone (thumb reach). Two-second entry is the whole product.
- Sync state is a quiet glowing dot, never text that demands attention.
- Touch targets 44px minimum. Real buttons, inputs and labels.
- Text contrast 4.5:1 for body, 3:1 for 24px+.

### Tokens

| Role | Isu Marble (light) | Nexus (dark) |
|---|---|---|
| Ground | `#F4F1EA` (Seam variant uses `#EDE9E0` with `#F8F6F0` slabs) | `#0B0E14` (Seam variant uses `#07090D` with `#11151E` slabs) |
| Ink / text | `#161614` | `#E6E1D6` |
| Gold, decorative | `#C9A24A` | `#D8B45A` |
| Gold, text-safe | `#74571A` | `#D8B45A` |
| Cyan, glow | `#1FA7B8` | `#4FD1E0` |
| Cyan, text-safe | `#0B6B78` | `#4FD1E0` |
| Caption grey | `#6B6760` | `#9A958A` |

Typefaces: **Cinzel** (headings, letterspaced), **Manrope** light / **Space Grotesk** dark (body, input), **Cormorant Garamond** (thought text at Stele scale, Oracle question), **JetBrains Mono** (tags, dates, status).

Motifs: concentric rings (Plato's ring-city), diamond markers, hairline seams with a cyan glint, Roman-numeral dates for Stele.

## Alternatives kept on file

All mockup sources live in `boards/`. Each `.dc.html` is a self-contained artboard; `canvas.json` is the layout index.

### Board 01 · Directions (four worlds of the DLC)
Artifact: https://claude.ai/artifact/4ePRAdPHGvGMseY8x2Eajh

1. **Isu Marble (light)** — chosen as light mode.
2. **Nexus (dark)** — chosen as dark mode. Owner liked it as drawn.
3. **Elysium Dawn** — Persephone's fields. Blush `#D9879A`, gold `#B8923E`, teal `#5FB3BE` on cream `#FBF3EE`. Cormorant italic headings. Journal-like, loses the high-tech half of the brief. *Keep as an optional theme.*
4. **Hades Ember** — Underworld. Ash `#15120F`, bone `#E9DFCC`, ember `#E2553A`, old gold `#D3A94E`. Cinzel 700, IBM Plex. Loud and mythic, tiring for daily notes. *Keep as an optional theme.*

### Board 02 · Iterations (four compositions × two modes)
Artifact: https://claude.ai/artifact/UNuYWyBJK4BWD31oVnmY2W

- **A · Ring** — Large concentric ring glyph crowns the screen; thoughts hang off a vertical gold thread with ring markers for Today / Earlier. Save button is a cyan core in a gold ring. Strongest sense of place; header costs vertical space.
- **B · Seam** — *Chosen base.* Slabs with gold seams and cyan glints. Most structured; slabs are natural swipe targets.
- **C · Oracle** — Capture is the hero: question in italic Cormorant, centred textarea, one KEEP button, list compressed below. Most immersive; review becomes secondary. *Chosen for the empty state only.*
- **D · Stele** — No chrome. 22px Cormorant thoughts, Roman-numeral tap targets, single ruled capture line labelled INSCRIBE, date as VI · X · MMXXVI. Most beautiful at rest, cheapest to build well. *Typography scale borrowed.*

## Research notes

- Ubisoft's Hugo Giard: Atlantis = Plato's physical description fused with established Isu architecture; each world of the DLC got its own palette and ambience. (Den of Geek interview.)
- Isu glyphs were designed as geometric symbols inspired by the Voynich manuscript. (Ubisoft news.)
- No existing app or design system does "ancient + high-tech"; nearest trends are retro-futurism and neo-futurism.
- Hades (Supergiant) is the reference for "clarity under pressure, personality everywhere else".
