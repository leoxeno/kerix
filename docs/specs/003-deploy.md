# Spec 003 · Deploy to Cloudflare Pages

**Status:** Draft · **Milestone:** 2 · **Owner approval:** pending

## Summary
Every push to `main` that passes the gate is published to `https://kerix.pages.dev` over HTTPS, so the owner installs Kerix once per device from one stable address and the sync of spec 002 runs between real devices every day. The deployed files are the exact `dist` the gate built; nothing is built twice.

## Problem
Kerix runs only from a dev server behind a quick tunnel whose address changes every session. An installed app would point at a dead URL within a day, the service worker never gets a stable origin, and sync cannot be used daily. Spec 002 is implemented and has nowhere to live.

## Goals
- One stable HTTPS origin on the free tier (ADR-0002 chose Cloudflare Pages).
- Deploy is a consequence of the gate: `main` passes `scripts/check.sh`, therefore it is deployed. Nothing else deploys.
- The installed app updates itself after a deploy without the owner clearing anything.
- The sign-in email's link lands on the deployed origin.
- No secret enters the repo. Deploy configuration lives in GitHub secrets and variables, applied by the agent from `.env.local` as spec 002 did for Supabase.

## Non-goals
- A custom domain. `pages.dev` is enough for one user. A domain would also let Resend deliver sign-in mail to any address; that is its own spec when a second address is needed.
- Preview deployments per pull request.
- Cloudflare's Git integration (Cloudflare building the site itself). The build runs once, in CI, after the gate.
- Self-hosted fonts (issue #3). The first offline launch still depends on fonts cached during an online visit.
- `_headers`, `_redirects`, security headers, analytics. The app has one URL and no routes.

## Inputs / outputs
- `.github/workflows/ci.yml`: the `verify` job's build receives `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from repository variables, so its `dist` artifact is the relay-enabled build (today CI builds a local-only bundle). A new `deploy` job, only on push to `main`, needs `verify`, downloads that artifact and uploads it with Wrangler (`cloudflare/wrangler-action`, `pages deploy dist --project-name kerix --branch main`).
- GitHub: secret `CLOUDFLARE_API_TOKEN`; variables `CLOUDFLARE_ACCOUNT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. The agent sets them with `gh` from `.env.local`. `.env.example` gains the two Cloudflare names.
- Cloudflare: one Pages project `kerix`, production branch `main`, created once by Wrangler before the first deploy. The API token is scoped to the account's Pages, edit, nothing else.
- Supabase auth config, applied through the management API as in spec 002: `site_url` becomes `https://kerix.pages.dev`; the redirect allow-list keeps `http://localhost:5173/**` and `https://*.trycloudflare.com/**` and adds `https://kerix.pages.dev/**`.
- `scripts/check.sh`: one step after the build, see Testing.
- `docs/STATUS.md` environment notes: the production origin.

## Assumptions
- Vite bundles only `VITE_`-prefixed variables. Everything else in `.env.local` stays on the laptop or in GitHub secrets. The anon key is public by design (spec 002).
- Cloudflare Pages free tier: unlimited requests and bandwidth for static assets; direct uploads allow 20,000 files and 25 MiB per file; the 500 builds per month limit applies only to Cloudflare-side builds, which this spec does not use. Zero running cost holds.
- `kerix.pages.dev` was free on 2026-10-06 (the name did not resolve). If it is taken when the project is created, the owner picks another name and this spec is revised.
- The service worker is registered with `autoUpdate` (`vite-plugin-pwa`). A deploy that changes any precached file ships a new service worker, which installs in the background and takes over on the next launch. Browsers check for a new service worker on every launch and bypass the HTTP cache for a script older than 24 hours, so no cache headers are needed.
- The six-digit code path needs no redirect configuration; only the link in the same email does.
- One Actions run per push to `main`; the deploy adds well under a minute to it, far inside the free minutes.

## Behaviour
```
push to main ──► verify (check.sh with VITE_ vars; uploads dist) ──► deploy (wrangler pages deploy dist) ──► https://kerix.pages.dev
pull request ──► verify only
```
- `verify` fails, therefore `deploy` does not run and the previous deployment stays live. Rollback is picking an earlier deployment in the Cloudflare dashboard; nothing in the repo changes.
- The `deploy` job runs in a concurrency group of its own, so two quick pushes serialize and the later one ends up live.
- Each deployment carries the commit hash as its message, so the dashboard reads like `git log`.
- On the phone: open the origin, add to home screen. The manifest from `vite-plugin-pwa` gives name, icon, standalone, portrait. Sign in once through the quiet slab (spec 002). Same on the laptop.
- After a deploy: the installed app fetches the new service worker on its next launch, precaches the new files, and activates them; the owner sees the new version by the second launch at the latest, with no prompt.
- Identity: the Cloudflare account carries the Leo Xeno identity only. The project name and token name contain nothing else. The workflow file holds no account id or address; the account id is a repository variable.

## Acceptance criteria
1. Given a push to `main` whose check passes, when the workflow completes, then `https://kerix.pages.dev` serves that commit's build over HTTPS and the deploy log names the commit.
2. Given a push to `main` whose check fails, when the workflow completes, then the `deploy` job did not run and the previously deployed build is still served.
3. Given a pull request, when CI runs, then `verify` runs and no `deploy` job runs.
4. Given a build on a machine with `.env.local`, when `dist/` is scanned, then it contains the relay URL and anon key and none of the other values in `.env.local` (access token, database password, Resend key).
5. Given Android Chrome at the origin, when the owner adds it to the home screen, then it launches standalone with the Kerix icon and name. Same on the laptop with Chrome's install.
6. Given the installed app and airplane mode, when launched cold, then the inbox opens and shows the local thoughts.
7. Given a freshly installed device, when the owner signs in with the six-digit code, then the header reads SYNCED and the thoughts captured on the other device appear (spec 002 criterion 1, in production).
8. Given the sign-in email on the laptop, when its link is clicked, then the browser lands on `https://kerix.pages.dev` signed in.
9. Given a new deploy and an installed device still running the previous version, when the device is launched, then by the second launch it runs the new version with nothing cleared by hand.

## Testing
- Criteria 1, 2, 3: observed on the Actions runs of the implementing change (a pull request run, then the push to `main`); criterion 2 by a deliberate failing push on a branch merged only if it is cheap, otherwise by review of the job conditions. Run links go in the completion report. The workflow conditions are reviewed by the verifier.
- Criterion 4: `scripts/check.sh` gains a step after the build: every value of a non-`VITE_` variable in `.env.local` must be absent from `dist/`. Skipped when `.env.local` does not exist, as in CI. Runs on every check from then on.
- Criteria 5 to 9: hand tests by the owner on the Android phone and the laptop, recorded in the completion report with the date.
- No unit tests: this spec touches no code under `src/`.

## Open questions
None.

## Revision history
### 2026-10-06
Created as Draft after spec 002 reached its hand-test stage. Three choices made in the draft, for the owner to confirm or overturn at approval: (1) CI deploys the gated `dist` with Wrangler rather than Cloudflare building from Git, so the build runs once and only after the gate passes; (2) no preview deployments yet; (3) project name `kerix`, origin `https://kerix.pages.dev`.
