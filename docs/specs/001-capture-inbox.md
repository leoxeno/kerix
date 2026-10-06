# Spec 001 · Capture inbox

**Status:** Draft · **Milestone:** 1 · **Owner approval:** pending

## Summary
A single text field. Type a thought, press Enter, it is saved on the device and appears at the top of the inbox. The inbox shows every open thought, newest first, and survives reloads and offline use.

## Problem
Kerix does nothing yet. Capture is the non-negotiable core; every later feature (done, tags, search, sync, dispatch) hangs off a thought that was captured first. It must be fast enough that the owner reaches for it instead of a notes app.

## Goals
- Enter saves. The thought appears in the list without any visible delay.
- Thoughts persist across reload, browser restart and offline use.
- The inbox lists open thoughts newest first, as slabs in the Seam composition.
- The empty inbox shows the Oracle question.
- The capture field is focused when the app opens, so the keyboard is already up on a phone.
- Fully usable by keyboard and screen reader.

## Non-goals
- Done state (spec 002), tags as a feature (003), search (004), sync (005).
- Editing or deleting a thought after capture.
- Multi-line thoughts. Enter saves; there is no Shift+Enter newline in v1.
- Any network call.

## Inputs / outputs
- Input: text from the capture field.
- Output: rows in the Dexie `thoughts` table per [DATA-MODEL.md](../architecture/DATA-MODEL.md); the Inbox screen.
- Hashtags in the text are parsed into `tags` on write, because the data model requires it, but no tag UI appears in this spec.

## Assumptions
- One user, one device for now. No auth.
- `crypto.randomUUID()` and IndexedDB are available (all target browsers).
- The device clock is trusted for `createdAt`.
- The `device` id is created on first launch and kept in `localStorage`.

## Behaviour
```
open app → field focused → type → Enter
  → trim; if empty, do nothing
  → addThought({ text }) writes to Dexie (id, timestamps, tags, device)
  → live query re-renders Inbox with the new slab at the top
  → field clears, stays focused
```
The list is a live query ordered by `createdAt` descending, excluding `deletedAt != null` and `doneAt != null` (done is a later spec, but the filter is cheap and prevents a migration later).

Each slab shows the text, the relative time ("2 min ago", "yesterday"), and the device label. The seam's glint position cycles by index so a list never looks stamped. The diamond checkbox is rendered but inert until spec 002; it is still a real, labelled, disabled button.

## Acceptance criteria
1. Given the field has "Buy olives", when Enter is pressed, then a slab "Buy olives" is at the top of the inbox and the field is empty and focused.
2. Given the field has only whitespace, when Enter is pressed, then nothing is added and the field is unchanged.
3. Given two thoughts captured in order A then B, when the inbox renders, then B is above A.
4. Given a thought was captured, when the page reloads, then the thought is still in the inbox.
5. Given the device is offline, when a thought is captured, then it is saved and shown exactly as when online.
6. Given the inbox has no open thoughts, when it renders, then the Oracle question "What is on your mind?" is shown and no slabs are.
7. Given the text "Call #money about #Money", when captured, then the stored `tags` are exactly `["money"]`.
8. Given the app opens, when it finishes rendering, then the capture field has focus.
9. Given any state, when inspected with Testing Library, then the field is found by label "Capture a thought" and the save control by role button and name "Save thought".

## Testing
- `src/data/thoughts.test.ts`: repository against Dexie on fake-indexeddb. Criteria 2, 3, 7, plus the data-model invariants.
- `src/features/capture/Capture.test.tsx`: criteria 1, 2, 8, 9 with user-event.
- `src/features/inbox/Inbox.test.tsx`: criteria 3, 6.
- Criterion 4 and 5 are covered by the repository test (persistence is the database) and verified by hand on a phone in airplane mode; recorded in the completion report.

## Open questions
- Relative time: update live every minute, or only on re-render? Proposal: only on re-render; a thought list is not a clock.
- Device label: hard-code "this device" until a settings screen exists? Proposal: yes.

## Revision history
### 2026-10-06
Created as Draft.
