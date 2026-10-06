# Kerix

**Capture a thought anywhere. Dispatch it to a machine that does the work.**

Kerix is a herald. Open it on your phone or laptop, write a thought in two seconds, and it is on every device you own, even if you were offline when you wrote it. Later, a thought can be dispatched to a connected machine that starts working on it: a GitHub Actions runner, a server, or the laptop at home.

Built in public by [Leo Xeno](https://github.com/leoxeno). Zero running cost by design.

## Status

Version 0.1, the foundation. Nothing works yet except the frame. Follow the build order in [docs/PRODUCT.md](docs/PRODUCT.md).

| Milestone | What | State |
|---|---|---|
| 1 | Quick capture inbox, local-first | next |
| 2 | Done / archive | planned |
| 3 | Tags | planned |
| 4 | Search | planned |
| 5 | Sync across devices | planned |
| 6 | Dispatch to a machine | vision |
| 7 | On-device AI over your own thoughts | vision |

## How it is built

- **One codebase, installable everywhere.** A progressive web app. Add to home screen on iPhone and Android, install on desktop. No app stores.
- **Local-first.** Every write lands in the device's own database first (IndexedDB via Dexie). The UI never waits on a network for your own thought. Sync is a background concern.
- **TypeScript, React 19, Vite 8, Tailwind 4.** The most documented stack there is, so anyone can read it.
- **Tested with Vitest**, linted with oxlint, every push verified by GitHub Actions.

## The look

Two modes from one set of tokens. Light is *Isu Marble*: warm stone, hairline gold seams, a cyan glint. Dark is *Nexus*: obsidian, gold filigree, cyan glow. The design decisions, every alternative considered, and the mockup sources are in [docs/design](docs/design).

## Run it

```bash
npm install
npm run dev        # on your LAN too, so you can open it on your phone
npm test
npm run build
```

## Name

*Kerix*, from the Greek κῆρυξ, the herald: the one who carries the command out of the citadel. The naming rounds are in [docs/design/NAMES.md](docs/design/NAMES.md).

## License

All rights reserved. The code is published so the build can be followed in public, not as a grant of rights. See [LICENSE](LICENSE). If you want to use any of it, open an issue and ask.
