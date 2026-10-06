# Architecture overview

## Shape

```
 phone / laptop (PWA)                       relay                       daimons
┌──────────────────────────┐        ┌──────────────────┐        ┌────────────────────┐
│ React UI                 │        │ Supabase         │        │ GitHub Actions     │
│   ↕ live queries         │  sync  │  Postgres + RLS  │  pull  │ a server           │
│ Dexie (IndexedDB)  ◄─────┼───────►│  Auth            │◄───────┤ the laptop at home │
│   source of truth        │        │  Realtime        │        │                    │
└──────────────────────────┘        └──────────────────┘        └────────────────────┘
          horizon 1                      milestone 2                   horizon 2
```

- **The device database is the source of truth.** The UI reads from Dexie through live queries and writes to Dexie. Nothing in the UI awaits the network.
- **Sync is a background process** that reconciles the device database with the relay (milestone 2, spec 002). `src/sync/engine.ts` has no React and no browser globals: push the outbox, pull since a server cursor, last-writer-wins by `updatedAt`. `triggers.ts` wires browser events (online, visible, a write landing in the outbox, a heartbeat); `runtime.ts` is the app's single engine plus the realtime hint. Signed out, the engine is idle and the app is fully functional on one device.
- **Daimons pull.** A daimon polls or subscribes to the relay for dispatched tasks it is able to run. Nothing pushes into a daimon, so a laptop behind a home router works without any port forwarding. Horizon 2.

## Layers inside the PWA

```
src/
  app/          screens and composed components (App shell, Inbox, Capture)
  features/     one folder per capability, each with its own components, hooks, tests
  data/         Dexie database, the Thought repository, migrations
  sync/         engine, store, relay interface, Supabase adapter, triggers, runtime
  ui/           primitives that only know tokens: Seam, Slab, Diamond, Glint
  index.css     tokens, both modes
```

Dependency direction is downward only: `app → features → data`, `features → ui`. `data` and `ui` import nothing from above. `sync` depends on `data` and never on React.

## Hosting

Static build on Cloudflare Pages (free), served over HTTPS so the service worker and install prompt work. Supabase free tier for the relay. No servers of our own for horizon 1.

## Offline

The service worker precaches the app shell and assets so a cold start works offline once installed. Fonts are currently fetched from Google Fonts and cached on first visit; issue #3 moves them into the bundle.

## What is deliberately not here yet

- Field-level merge, purge of soft-deleted rows, end-to-end encryption: see spec 002 non-goals.
- Daimon registration and the dispatch message format: specified with horizon 2.
- On-device inference: horizon 3.
