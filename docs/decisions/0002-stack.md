# ADR-0002 · Stack

**Status:** Accepted · 2026-10-06

## Decision

A single-codebase progressive web app: TypeScript, React 19, Vite 8, Tailwind 4. Local-first data in IndexedDB via Dexie 4. Supabase (Postgres, Auth, Realtime) as the sync relay from milestone 5. Cloudflare Pages for hosting. GitHub Actions for CI. Vitest for tests, oxlint for lint.

## Why

- **PWA over native apps.** One codebase installs on iPhone, Android and desktop. No app stores, no developer fees, no duplicate UI. The owner uses both phone platforms.
- **Local-first over cloud-first.** Capture must take two seconds anywhere, including offline. The device database as source of truth is the architecture behind Linear and Figma, and it removes every spinner from the owner's own writes.
- **The most documented stack.** React, Vite and Tailwind are what every tutorial, agent and contributor already speaks. The owner is learning; legibility beats novelty.
- **Supabase over a custom server.** Free tier, real Postgres, row-level security that teaches transferable skills, realtime included. Zero running cost (non-negotiable 4).
- **Cloudflare Pages over Vercel.** Equivalent free tier, no bandwidth surprises, and the same account can later host a Worker if a tiny relay function is needed.

## Alternatives considered

- Expo / React Native: real native apps, but App Store friction and two build pipelines for a solo builder.
- Convex, PowerSync, ElectricSQL, Replicache: stronger sync engines, but either paid beyond hobby use or heavier to learn than Dexie plus a hand-written reconciliation for a single-user model.
- SvelteKit or Solid: lighter, but less documented for an owner who is learning.

## Consequences

- Sync is hand-written in milestone 5 against the data model in [../architecture/DATA-MODEL.md](../architecture/DATA-MODEL.md). If it proves hard, revisit a sync engine in a new ADR.
- Fonts are a dependency on Google Fonts until issue #3 bundles them.
