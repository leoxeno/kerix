import type { SupabaseClient } from '@supabase/supabase-js'
import type { Thought } from '../data/db'
import type { Relay, RemoteThought } from './relay'

const PAGE = 500

interface Row {
  id: string
  text: string
  tags: string[]
  created_at: string
  updated_at: string
  done_at: string | null
  deleted_at: string | null
  device: string
  server_updated_at: string
}

/** Postgres returns "+00:00" offsets and may carry microseconds; the device stores "Z" with milliseconds. Same instant, one spelling. */
const iso = (s: string): string => new Date(s).toISOString()

function toRow(t: Thought): Omit<Row, 'server_updated_at'> {
  return {
    id: t.id,
    text: t.text,
    tags: t.tags,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
    done_at: t.doneAt,
    deleted_at: t.deletedAt,
    device: t.device,
  }
}

function fromRow(r: Row): RemoteThought {
  return {
    id: r.id,
    text: r.text,
    tags: r.tags ?? [],
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
    doneAt: r.done_at ? iso(r.done_at) : null,
    deletedAt: r.deleted_at ? iso(r.deleted_at) : null,
    device: r.device,
    serverUpdatedAt: r.server_updated_at, // kept verbatim: it is the server's cursor, microseconds included
  }
}

export function supabaseRelay(client: SupabaseClient): Relay {
  return {
    async push(rows) {
      const { error } = await client.from('thoughts').upsert(rows.map(toRow), { onConflict: 'id' })
      if (error) throw error
    },

    async pull(since) {
      let query = client.from('thoughts').select('*').order('server_updated_at', { ascending: true }).limit(PAGE)
      if (since) query = query.gt('server_updated_at', since)
      const { data, error } = await query
      if (error) throw error
      const rows = ((data ?? []) as Row[]).map(fromRow)
      return { rows, cursor: rows.length ? rows[rows.length - 1].serverUpdatedAt : null }
    },
  }
}
