# Status

Updated 2026-10-06. The one page to read when picking Kerix up cold. Keep it short; history lives in git and the specs.

## Where we are

| Spec | Status | Note |
|---|---|---|
| 001 Capture inbox | Done | Verified on Android. |
| 002 Sync across devices | Implementing | Code and server done, mail configured. Criteria 1 and 6 met. Criterion 2: offline drain shown, ordered pair still to repeat. Criterion 9 not run. **Refinement (criteria 10, 11) approved; implementation next.** |
| 003 Deploy to Cloudflare Pages | Draft | Awaiting owner approval. Needed before daily use of sync. |
| ADR-0005 Performance budget | Proposed | Owner stated the principle on 2026-10-06; numbers measured; awaiting approval. |

Build order: capture → sync → done → tags → search (changed by the owner on 2026-10-06, see PRODUCT.md).

## Next action

Spec 002 criteria 10 and 11 approved on 2026-10-06. Owner still to approve spec 003 (three draft choices in its revision history), ADR-0005 (budgets). Then: implement the 002 refinement (Phase B), repeat criterion 2 with two thoughts captured offline, run criterion 9, mark 002 Done, implement 003.

## Environment notes for the agent

- Secrets are in the git-ignored `.env.local` (see `.env.example` for the names). Verify by shape, never print.
- Phone testing goes through a Cloudflare quick tunnel; the campus Wi-Fi isolates clients. `vite.config.ts` already allows `*.trycloudflare.com`.
- Server config (migrations, auth settings, SMTP) is applied through the Supabase management API with the owner's scoped token. Migrations live in `supabase/migrations/`.
- Mail is sent through Resend with a send-only key. Without a verified domain, Resend delivers only to the Resend account owner's address, so the owner signs in with that address.

## Open risks

- Sign-in glitch found: tapping the email link while the code step is open signs the browser in but leaves the sheet open, and the spent code then errors. Reproduced in a scripted two-tab Chromium. Fix proposed as spec 002 criteria 10 and 11 plus an email-copy change and the template moving into the repo; awaiting owner approval.
- Load speed: the dev server through the tunnel takes 30 s cold; the production build takes 2 s cold and 1 s warm on the same path (ADR-0005, proposed). Not a bug, but daily use must be on the deployed build.

- Bundle is 539 kB after adding the Supabase client; split the sign-in and sync code into a lazy chunk.
- Fonts load from Google Fonts (issue #3).
- Revoke the Supabase access token when no migrations are planned; recreate when needed.
