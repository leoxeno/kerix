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

Dexie database `kerix`, version 2:

```
thoughts: id, createdAt, updatedAt, doneAt, deletedAt, *tags
outbox:   id
meta:     key
```

`id` is the primary key. `*tags` is a multi-entry index so filtering by a tag is an index lookup. Queries exclude `deletedAt != null` rows by default.

**outbox** holds the ids of thoughts with changes not yet pushed to the relay. Every user-driven write puts the id there in the same transaction. The sync engine removes an id only if the thought's `updatedAt` still equals the value it pushed, so a change made during a push is never lost. Rows written by a pull never enter the outbox.

**meta** is a key/value table for sync state. Today it holds one key, `sync.cursor`: the server's `server_updated_at` of the last row pulled.

## Server copy (spec 002)

The relay holds the same fields in snake_case plus `user_id` and `server_updated_at`. Migration: `supabase/migrations/20261006000001_thoughts.sql`. Row-level security limits every operation to `user_id = auth.uid()`. Two triggers: one skips an update whose `updated_at` is older than the stored row (last-writer-wins, identical to the device rule), one stamps `user_id` and `server_updated_at` on every write. Timestamps come back with a `+00:00` offset and are normalised to the device's `Z` spelling on read, except `server_updated_at`, which is kept verbatim because it is the cursor.

## Invariants

- A write never leaves `updatedAt` older than `createdAt`.
- `tags` is always exactly what the hashtag parser returns for `text`. The parser is the only writer.
- Only `src/data/` and `src/sync/store.ts` touch Dexie. Features call the repository; they never import Dexie. The sync store is the only writer that bypasses the outbox, and only for rows that came from the relay.

## Migrations

Schema changes bump the Dexie version and add an `upgrade` step. A migration is an ADR-worthy event once sync exists, because two devices may run different versions.
