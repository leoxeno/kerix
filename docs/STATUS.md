# Status

Updated 2026-10-06. The one page to read when picking Kerix up cold. Keep it short; history lives in git and the specs.

## Where we are

| Spec | Status | Note |
|---|---|---|
| 001 Capture inbox | Done | Verified on Android. |
| 002 Sync across devices | Implementing | Criteria 1, 6, 10, 11 met (10 and 11 implemented and verified 2026-10-06 evening; 10 also seen live in a two-tab replay). Criterion 2: offline drain shown with one thought, the ordered pair still to repeat. Criterion 9 not run. **Last two hand checks pending, then Done.** |
| 003 Deploy to Cloudflare Pages | Draft | Awaiting owner approval. Needed before daily use of sync. |
| ADR-0005 Performance budget | Proposed | Owner stated the principle on 2026-10-06; numbers measured; awaiting approval. |

Build order: capture → sync → done → tags → search (changed by the owner on 2026-10-06, see PRODUCT.md).

## Next action

Owner runs spec 002 criteria 2 (airplane mode on, two thoughts, airplane mode off, order on the laptop) and 9 (sign out keeps thoughts, header reads LOCAL); the agent marks 002 Done. Then the project pauses by the owner's decision (2026-10-06).

On return: owner approves or amends spec 003 (three draft choices in its revision history) and ADR-0005 (budgets); the agent implements 003 (Phase B), installs on both devices, re-records the README demo on the deployed build, then takes issue #4 and the lazy-chunk and fonts work from ADR-0005.

## Environment notes for the agent

- Secrets are in the git-ignored `.env.local` (see `.env.example` for the names). Verify by shape, never print.
- Phone testing goes through a Cloudflare quick tunnel (the dev build loads in about 30 s cold through it, the production build in 2 s; see ADR-0005); the campus Wi-Fi isolates clients. `vite.config.ts` already allows `*.trycloudflare.com`.
- Server config (migrations, auth settings, SMTP) is applied through the Supabase management API with the owner's scoped token. Migrations live in `supabase/migrations/`.
- The sign-in email template lives at `supabase/auth/magic-link.html` and is applied with `node scripts/apply-auth-template.mjs`.
- Mail is sent through Resend with a send-only key. Without a verified domain, Resend delivers only to the Resend account owner's address, so the owner signs in with that address.

## Open risks

- Sign-in glitch (link tapped while the code step was open) fixed under criteria 10 and 11. Residual: Supabase returns the same 403 for a mistyped and a spent code, so the copy covers both. Brand-new users would get Supabase's "Confirm signup" email, not the Kerix template; only one user exists today.
- Inbox slab caption always says "this device", including for pulled rows (issue #4).
- The README sync demo (`docs/media/sync-demo.gif`) was recorded against the dev build on 2026-10-06; re-record on the deployed build after spec 003.
- Load speed: the dev server through the tunnel takes 30 s cold; the production build takes 2 s cold and 1 s warm on the same path (ADR-0005, proposed). Not a bug, but daily use must be on the deployed build.

- Bundle is 539 kB after adding the Supabase client; split the sign-in and sync code into a lazy chunk.
- Fonts load from Google Fonts (issue #3).
- Revoke the Supabase access token when no migrations are planned; recreate when needed.
