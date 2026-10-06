# Spec 002 · Sync across devices

**Status:** Implementing · **Milestone:** 2 · **Owner approval:** approved 2026-10-06

## Summary
A thought captured on one device appears on every other signed-in device within seconds, and a thought captured offline is pushed without any user action once the device is back online. The device database stays the source of truth; the relay only carries changes between devices.

## Problem
After spec 001 each device is an island. The owner captured on the phone and saw nothing on the laptop. The gap between devices is the product.

## Goals
- Sign in once per device. After that, sync is invisible.
- Changes flow both ways: push local writes, pull remote writes, continuously while online.
- Offline capture queues and drains automatically when connectivity returns.
- The inbox keeps working exactly as in spec 001 when signed out, offline, or if the relay is down.
- A quiet status: the header dot and label say LOCAL (signed out), SYNCED, SYNCING, or OFFLINE.
- A single user's data is readable and writable only by that user. Enforced on the server, not in the client.

## Non-goals
- Sharing thoughts between users, teams, or public links.
- End-to-end encryption. Data at rest on the relay is protected by access rules, not by client-side encryption. Revisit in an ADR before any second user exists.
- Field-level merge. Whole-row last-writer-wins is enough for one person on a few devices (see Conflicts).
- Purging soft-deleted rows. They accumulate; housekeeping is a later spec.
- Deployment to a public URL. Needed to use sync in daily life, but it is its own small spec (003) so this one stays feature-sized.
- Any change to capture, done, tags or search behaviour.

## Inputs / outputs
- Relay: a Supabase project on the free tier (ADR-0002). One table, `thoughts`, with row-level security. Schema lives in the repo at `supabase/migrations/` so it is reviewable and reproducible.
- Client configuration: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in an untracked `.env.local`; `.env.example` documents them. The anon key is safe to ship in a client because row-level security does the protecting.
- Local database: Dexie version 2 adds two tables, `outbox` (ids of thoughts with unpushed changes) and `meta` (key/value, holding the pull cursor). The `Thought` entity is unchanged.
- UI: a sign-in screen; the header status; nothing else.

## Assumptions
- Supabase Auth by email. One email carries both a **six-digit code** and a link: the laptop clicks, the phone types. Sessions do not expire, so each device asks exactly once. The code field carries the `one-time-code` autofill hint.
- One user. The schema carries `user_id` anyway so a second user is a policy, not a migration.
- Server time is the cursor for pulls (`server_updated_at`, set by a database trigger), so device clock skew cannot cause missed rows.
- Device time is the conflict judge (`updatedAt`), because that is what the user experienced as "later".
- Realtime notifications are a hint to pull sooner, never the only path. A missed notification is corrected by the next scheduled or event-driven pull.
- The owner creates the Supabase project and puts the project URL, the anon key and a personal access token into the untracked `.env.local`. The agent writes migrations into `supabase/migrations/` and applies them through the Supabase management API with that token, and configures the auth email template the same way. Secrets never enter the chat, the repo, or the session notes.

## Behaviour

### Data flow
```
                 write                      push (outbox drain)
   UI ──────────► Dexie ◄──────────────────────────────────────► Supabase
        live query   │  pull (rows with server_updated_at > cursor)      │
        re-renders   └──────────────────────────────────────────────────┘
                                   realtime hint ◄──────────────────────┘
```

### Repository changes
Every local write (`addThought`, and later done/undo/delete) also inserts the thought id into `outbox` in the same transaction. Pulled rows are written by the sync module directly and never touch `outbox`.

### The sync engine (`src/sync/`)
Pure TypeScript, no React. It depends on `src/data/` and on a `Relay` interface with two operations: `push(rows)` and `pull(since)`. The Supabase adapter implements `Relay`; tests use an in-memory fake.

- **Push:** read all ids in `outbox`, load the rows, upsert them to the relay, delete the ids from `outbox` on success. On failure, leave them; retry later.
- **Pull:** request rows with `server_updated_at > cursor`. For each row: if no local row, or the incoming `updatedAt` is newer than the local `updatedAt`, write it locally; otherwise keep the local row (it is in the outbox and will win on push). Advance the cursor to the newest `server_updated_at` received, only after all rows are written.
- **Triggers:** on sign-in, on app start, when the browser fires `online`, when the tab regains focus, after every local write (debounced 500 ms), on a realtime notification, and every 60 s while visible. Push always runs before pull in a cycle. Cycles never overlap; a trigger during a cycle schedules one more cycle.
- **Status:** `local` when signed out; `offline` when the browser reports offline or the last cycle failed on network; `syncing` during a cycle; `synced` after a successful cycle with an empty outbox.

### Server
```sql
thoughts(id uuid pk, user_id uuid not null, text, tags text[], created_at, updated_at,
         done_at, deleted_at, device text, server_updated_at timestamptz default now())
```
- Row-level security: `user_id = auth.uid()` for select, insert, update. No delete policy; deletion is `deleted_at`.
- A `BEFORE UPDATE` trigger keeps the existing row when the incoming `updated_at` is older (server-side last-writer-wins, so two devices can never disagree about who won).
- A `BEFORE INSERT OR UPDATE` trigger sets `server_updated_at = now()` and `user_id = auth.uid()`.
- Realtime enabled on the table.

### Conflicts
Whole-row last-writer-wins by device `updatedAt`, applied identically on the server and on every device. With one user the only realistic conflict is "done on the phone, un-done on the laptop while the phone was offline"; the later tap wins everywhere. Acceptable, and stated.

### Sign-in, progressively disclosed
First launch is capture, never a form. After the first thought is saved on a device that is not signed in, one quiet slab appears under the capture bar: *"Keep this everywhere you are."* with a single action, *Sign in*. Swiping or dismissing it hides it for the session; it returns only after a capture on a later day. The header word LOCAL is tappable at any time and opens the same flow.

The flow itself is in the Oracle style: "Who speaks?", an email field (`autocomplete="email"`), then a six-digit code field (`inputmode="numeric"`, `autocomplete="one-time-code"`). After sign-in that device never asks again. Sign-out lives in a settings sheet behind the header mark; signing out keeps local data on the device (a device that signs out does not forget; it stops syncing).

## Acceptance criteria
1. Given devices A and B signed in as the same user and online, when A captures "Buy olives", then B shows "Buy olives" at the top of its inbox within 5 seconds without any user action.
2. Given device A offline, when it captures two thoughts and then comes online, then both appear on B, in the original order, without any user action.
3. Given the same thought on A and B, when A sets `updatedAt` T1 and B sets `updatedAt` T2 > T1 and both push, then both devices and the server hold B's version.
4. Given a device signed out, when it captures, then behaviour is identical to spec 001 and the header reads LOCAL.
5. Given a device signed in with the relay unreachable, when it captures, then the thought is shown immediately, the header reads OFFLINE, and the outbox holds its id until the next successful cycle.
6. Given user X's rows on the server, when user Y queries the table through the anon key, then zero rows are returned.
7. Given a pull that fails midway, when the next pull runs, then no row is skipped (the cursor only advances after all rows of a page are written).
8. Given a pulled row older than the local row, when applied, then the local row is kept and is still in the outbox.
9. Given a signed-in device, when the user signs out, then local thoughts remain visible and the header reads LOCAL.
10. *(added 2026-10-06, approved by the owner the same day)* Given the sign-in sheet open on the code step, when a session appears from any source (the one-tap link opened in another tab, or another tab of the same browser signing in), then the sheet closes by itself within 2 seconds and the header reads SYNCED.
11. *(added 2026-10-06, approved by the owner the same day)* Given a code that was already used or has expired, when it is entered, then the sheet says in plain words that the code is spent and offers to send a new one; the raw server message never appears.

## Testing
- `src/sync/engine.test.ts` with an in-memory fake relay and two Dexie databases standing in for two devices: criteria 1 (as push then pull), 2, 3, 7, 8.
- `src/data/thoughts.test.ts` extended: every write adds to the outbox.
- `src/features/auth/*.test.tsx`: criteria 4 and 9 (signed-out behaviour, sign-out keeps data).
- Criterion 5: engine test with a relay that throws; status transitions asserted.
- Criterion 6: `supabase/tests/rls-isolation.mjs`, run by the agent against the live project (`node supabase/tests/rls-isolation.mjs`). It creates a throwaway second user, queries through the anon key as the client would, tries to update and to insert as the owner, probes anonymously, then deletes the user. Result recorded in the revision history.
- Criteria 1 and 2 also verified by hand on phone plus laptop over the dev tunnel; recorded in the completion report.
- Criteria 10 and 11: `src/features/auth/*.test.tsx` with the auth client faked; criterion 10 also by the two-tab replay script kept outside the repo (scratchpad), recorded in the completion report.

## Open questions
None.

## Revision history
### 2026-10-06
Created as Draft, pulled forward from milestone 5 to milestone 2 by the owner. Approved the same day with three decisions: auth by six-digit email code (the email also carries a link); the agent applies migrations with an owner-issued access token kept in `.env.local`; sign-in is progressively disclosed after the first capture, never on first launch. OAuth providers rejected because installed PWAs on iOS lose the session on the redirect.

### 2026-10-06, later
Criterion 6 verified against the live project with `supabase/tests/rls-isolation.mjs`: the second user sees 0 of the owner's rows, an update of the owner's row by id affects 0 rows, an insert claiming the owner's `user_id` is stamped to the second user by the trigger, and a request with no user is refused with 401. The throwaway user is deleted at the end; no rows remain. Impact on completed work: none.

### 2026-10-06, evening · refinement, approved by the owner the same day
Hand test on phone plus laptop over the dev tunnel: criterion 1 met (server record: phone capture 18:28:35 UTC, pushed at 18:30:19 once the session existed). Criterion 2 partly shown: one thought captured offline was pushed 14 s after reconnecting with no action; the two-thoughts-in-order case still needs a clean repeat. Criterion 9 not yet run.

Found and reproduced: when the person taps the email's one-tap link *and* has the code step open, the link signs the browser in but the sheet stays open and the spent code answers "Token has expired or is invalid". Seen twice by the owner, reproduced deterministically in a scripted two-tab Chromium. Proposed changes:
- Criteria 10 and 11 above.
- The sheet closes whenever a session exists, whatever created it.
- Error copy in the product's voice; the Supabase message is never shown raw.
- The email says the link is for the laptop and the code is for the phone; "same browser" is a laptop assumption that misleads on a phone.
- The email template moves into the repo at `supabase/auth/magic-link.html` and is applied from there, as the migrations are. Today it exists only on the server, which breaks "the repository is the source of truth".
Impact on completed work: none; additive.
