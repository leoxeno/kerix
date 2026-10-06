# Data model

One entity for horizon 1. Designed so sync (milestone 5) and dispatch (horizon 2) extend it without a rewrite.

## Thought

| Field | Type | Notes |
|---|---|---|
| `id` | string | UUID v4 from `crypto.randomUUID()`. Generated on the device, never by a server, so offline creation works. |
| `text` | string | The thought as typed. Trimmed. Hashtags stay in the text. |
| `tags` | string[] | Derived from `#hashtags` in `text` on every write: lowercase, deduplicated, without the `#`. Stored for indexing, never edited directly. |
| `createdAt` | string | ISO 8601 UTC, from the device clock at capture. |
| `updatedAt` | string | ISO 8601 UTC, set on every write. The field sync will compare. |
| `doneAt` | string \| null | ISO 8601 UTC when ticked, `null` when open. Un-doing sets it back to `null`. |
| `deletedAt` | string \| null | Soft delete. Rows are never hard-deleted on the device, so a deletion can sync. Purge is a later housekeeping concern. |
| `device` | string | A short random id generated once per install and kept in local storage. Shown as "phone" or "laptop" in the UI via a user-chosen label later. |

Reserved for later, not present in v1: `dispatch` (daimon, state, result), `source` (share-target, voice), `embedding`.

## Database

Dexie database `kerix`, version 1:

```
thoughts: id, createdAt, updatedAt, doneAt, deletedAt, *tags
```

`id` is the primary key. `*tags` is a multi-entry index so filtering by a tag is an index lookup. Queries exclude `deletedAt != null` rows by default.

## Invariants

- A write never leaves `updatedAt` older than `createdAt`.
- `tags` is always exactly what the hashtag parser returns for `text`. The parser is the only writer.
- The repository module (`src/data/thoughts.ts`) is the only code that touches Dexie. Features call the repository; they never import Dexie.

## Migrations

Schema changes bump the Dexie version and add an `upgrade` step. A migration is an ADR-worthy event once sync exists, because two devices may run different versions.
