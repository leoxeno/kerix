# Status

Updated 2026-10-06. The one page to read when picking Kerix up cold. Keep it short; history lives in git and the specs.

## Where we are

| Spec | Status | Note |
|---|---|---|
| 001 Capture inbox | Done | Verified on Android. |
| 002 Sync across devices | Implementing | Code and server done, mail configured. **Two-device hand test pending** (criteria 1, 2, 9). Criterion 6 needs a second-account SQL test. |
| 003 Deploy to Cloudflare Pages | not written | Next spec. Needed before daily use of sync. |

Build order: capture → sync → done → tags → search (changed by the owner on 2026-10-06, see PRODUCT.md).

## Next action

Owner runs the two-device test (laptop and phone over a dev tunnel, sign in with the email code on each, capture on one, watch the other). Report what the header says. Then the agent marks 002 Done or fixes, and writes spec 003 (Phase A, stop for approval).

## Environment notes for the agent

- Secrets are in the git-ignored `.env.local` (see `.env.example` for the names). Verify by shape, never print.
- Phone testing goes through a Cloudflare quick tunnel; the campus Wi-Fi isolates clients. `vite.config.ts` already allows `*.trycloudflare.com`.
- Server config (migrations, auth settings, SMTP) is applied through the Supabase management API with the owner's scoped token. Migrations live in `supabase/migrations/`.
- Mail is sent through Resend with a send-only key. Without a verified domain, Resend delivers only to the Resend account owner's address, so the owner signs in with that address.

## Open risks

- Bundle is 539 kB after adding the Supabase client; split the sign-in and sync code into a lazy chunk.
- Fonts load from Google Fonts (issue #3).
- Revoke the Supabase access token when no migrations are planned; recreate when needed.
