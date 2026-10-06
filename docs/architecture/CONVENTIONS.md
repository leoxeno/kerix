# Code conventions

## Language and tooling

- TypeScript strict. No `any`. Prefer `unknown` plus narrowing.
- React 19 function components. Hooks for state. No class components, no Redux.
- Vite 8. Tailwind 4 with the tokens in `src/index.css`. Dexie 4 with `dexie-react-hooks` for live queries.
- Lint: oxlint. Typecheck: `tsc -b`. Tests: Vitest with Testing Library and `fake-indexeddb`.

## Folders

See [OVERVIEW.md](OVERVIEW.md) for the layer map. Rules:

- One feature per folder under `src/features/`, containing its components, hooks and tests. A feature does not import another feature; shared pieces go to `src/ui/` or `src/data/`.
- `src/data/` owns Dexie. Nothing else imports `dexie`.
- `src/ui/` primitives take tokens and props only. They know nothing about thoughts.

## Naming

- Files: `PascalCase.tsx` for components, `camelCase.ts` for everything else, `*.test.ts(x)` beside the code they test.
- Components named after the thing on screen in the design language: `Slab`, `Seam`, `Diamond`, `Glint`, `CaptureSlab`, `Inbox`.
- Repository functions are verbs: `addThought`, `markDone`, `listOpen`.

## Styling

- Tailwind utility classes referencing tokens (`bg-slab`, `text-gold-ink`, `shadow-glow`). Never a raw hex, font name or shadow in a component.
- Both modes come for free from the tokens. If a change needs a mode-specific rule, add a token, not a `dark:` variant.
- Touch targets 44 px (`size-11`). Hit areas may be larger than the visual mark using negative margins, as `Seam` and the checkboxes do.

## Testing

- Every acceptance criterion in a spec maps to at least one test. Name tests after the criterion.
- Repository tests run against Dexie on `fake-indexeddb`, not mocks.
- Component tests use Testing Library queries by role and label, never by class or test id, so accessibility is tested for free.
- No snapshot tests.

## Commits

- One logical change per commit. Subject in imperative mood, under 72 characters. Body says why, not what.
- The spec a commit implements is named in the body: `Spec: docs/specs/001-capture-inbox.md`.
- Author: Leo Xeno with the GitHub noreply address. See CLAUDE.md non-negotiable 5.

## Dependencies

- Add a dependency only when it removes more code than it adds. Say so in the commit body.
- Pin nothing by hand; `package-lock.json` pins. Upgrades are their own commits.
