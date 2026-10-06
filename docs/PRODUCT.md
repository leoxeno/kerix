# Product decisions

## Version 1 scope (decided 2026-10-06)

Owner chose all four, not the two I recommended. Build order is still capture → done → tags → search, each shippable on its own.

1. **Quick capture inbox.** One text box, Enter saves. Local write first, sync in background. Never a spinner for your own thought.
2. **Done / archive state.** Tap the diamond. Done thoughts fade into a done list you can revisit and un-done.
3. **Tags.** `#writing #money #life` typed inline in the thought are parsed into tags. Tap a tag to filter. No separate tag manager in v1.
4. **Search.** Full-text across all thoughts, done included. Runs locally on the device's own database so it works offline.

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
