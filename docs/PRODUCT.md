# Product decisions

## Version 1 scope (decided 2026-10-06)

Owner chose all four, not the two I recommended. Build order was capture → done → tags → search. **Changed 2026-10-06:** after testing capture on two devices the owner pulled sync forward. Order is now **capture → sync → done → tags → search**, each shippable on its own. Reason: the gap between two devices is the product; feeling it early beats polishing the inbox.

1. **Quick capture inbox.** One text box, Enter saves. Local write first, sync in background. Never a spinner for your own thought.
2. **Done / archive state.** Tap the diamond. Done thoughts fade into a done list you can revisit and un-done.
3. **Tags.** `#writing #money #life` typed inline in the thought are parsed into tags. Tap a tag to filter. No separate tag manager in v1.
4. **Search.** Full-text across all thoughts, done included. Runs locally on the device's own database so it works offline.
5. **Sync.** Now milestone 2. Every device's database reconciled through a relay in the background; the UI never waits on it. Spec 002.

## Stages (decided by the owner 2026-10-06)

The vision stays, the priorities are re-routed. Kerix grows like an insect: **worm, cocoon, butterfly.**

- **Worm (now).** A todo app that simply works, in the sense of Todoist: capture, sync, done, tags, search, and whatever else a person needs to trust it with their day. Nothing else is scheduled until the worm is dependable on the phone and the laptop every day. Spec 003 (deploy) is the first step of daily use.
- **Cocoon.** The bridge between a todo app and a dispatcher. Not defined yet; the owner defines it when the worm is dependable.
- **Butterfly.** The task-machine dispatcher of docs/VISION.md horizon 2, then counsel in horizon 3. Issues #2 and #1. Not before the cocoon.

Candidate worm-stage capabilities beyond the four of version 1, for the owner to pick from and order, each as its own spec: edit a thought, delete a thought, swipe actions, due dates and reminders, ordering or priority, lists or projects beyond tags, a done list that can be revisited. None is chosen yet.

## Milestone 2 and beyond (not v1)

- Swipe actions on slabs (done, delete).
- Elysium Dawn and Hades Ember as optional themes (tokens exist, see design/DESIGN-DECISIONS.md).
- Share-target: send text from any app into the inbox.

## Future feature · on-device AI (raise as a GitHub issue the moment the repo is public)

**Owner's intent:** the app should be able to run a local AI model (e.g. Gemma) on the phone or the computer, recommend which model fits each device's capabilities, and make the whole inbox queriable in natural language ("what did I note about the newsletter last week?").

**Design constraints to carry into that issue:**
- Local-first stays true: the model runs on the device, thoughts never leave it for inference.
- Device capability detection picks the model tier (RAM, GPU/WebGPU support, storage). Laptop gets a larger model than a phone.
- Candidate runtimes to evaluate when the time comes: WebLLM / MLC (WebGPU in the browser, Gemma and Llama families), Transformers.js (ONNX, smaller models), and on-device embeddings for semantic search as a first step before full chat.
- Semantic search over thoughts is the cheapest first win and reuses the search feature from v1.

Label: `enhancement`, `future`, `ai`. Not scheduled.

## Repo

- Public, under the **leoxeno** personal account. All rights reserved (owner chose the most restrictive option on 2026-10-06; can be opened up later, never the reverse). English.
- Name: **Kerix** (decided 2026-10-06, see design/NAMES.md).
