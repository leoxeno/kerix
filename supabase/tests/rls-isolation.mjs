// Spec 002, criterion 6: a second user, querying through the anon key, sees none of the owner's rows.
// Run by the agent against the live project:  node supabase/tests/rls-isolation.mjs
// Reads .env.local. Creates a throwaway user straight in auth.users (the scoped access token cannot read the
// service-role key), signs it in through the anon key exactly as the client would, probes, then deletes it.
// Prints counts and HTTP statuses only. Never prints keys or tokens.
import { readFileSync } from 'node:fs'
import { randomBytes, randomUUID } from 'node:crypto'

const env = Object.fromEntries(
  readFileSync(new URL('../../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)
const url = env.VITE_SUPABASE_URL
const anon = env.VITE_SUPABASE_ANON_KEY
const pat = env.SUPABASE_ACCESS_TOKEN
const ref = new URL(url).hostname.split('.')[0]
const mgmt = `https://api.supabase.com/v1/projects/${ref}`
const out = {}

/** Runs SQL as postgres through the management API. Used only for ground truth and for user setup/teardown. */
async function sql(query) {
  const r = await fetch(`${mgmt}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${pat}`, 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  return r.json()
}

// Ground truth: the test is vacuous if the owner has no rows.
const total = await sql('select count(*)::int as n, count(distinct user_id)::int as users from public.thoughts')
out.totalRows = total[0]?.n
out.distinctUsers = total[0]?.users
const [xRow] = await sql('select id, user_id from public.thoughts order by server_updated_at desc limit 1')

// User Y.
const email = `rls-test-${randomBytes(4).toString('hex')}@example.com`
const password = randomBytes(24).toString('base64url')
const yId = randomUUID()
const made = await sql(`
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', '${yId}', 'authenticated', 'authenticated', '${email}',
    crypt('${password}', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(),
    '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), '${yId}', '${yId}',
    jsonb_build_object('sub', '${yId}', 'email', '${email}', 'email_verified', true), 'email', now(), now(), now());
  select 1`)
out.createY = Array.isArray(made) ? 'ok' : made

try {
  // Sign Y in through the anon key, as the client does.
  const tok = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anon, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const session = await tok.json()
  out.signInY = tok.status
  const yH = { apikey: anon, Authorization: `Bearer ${session.access_token}` }
  const json = { ...yH, 'content-type': 'application/json', Prefer: 'return=representation' }

  // Y selects everything: must be zero rows.
  const sel = await fetch(`${url}/rest/v1/thoughts?select=id`, { headers: yH })
  const rows = await sel.json()
  out.ySelect = { status: sel.status, rows: Array.isArray(rows) ? rows.length : rows }

  if (xRow) {
    // Y tries to update X's newest row by id: must affect zero rows.
    const upd = await fetch(`${url}/rest/v1/thoughts?id=eq.${xRow.id}`, {
      method: 'PATCH',
      headers: json,
      body: JSON.stringify({ text: 'tampered', updated_at: new Date(Date.now() + 1e6).toISOString() }),
    })
    const updRows = await upd.json()
    out.yUpdateX = { status: upd.status, rowsAffected: Array.isArray(updRows) ? updRows.length : updRows }
    const after = await sql(`select text = 'tampered' as tampered from public.thoughts where id = '${xRow.id}'`)
    out.xRowTampered = after[0]?.tampered

    // Y inserts a row claiming X's user_id: the stamp trigger must own it to Y.
    const now = new Date().toISOString()
    const ins = await fetch(`${url}/rest/v1/thoughts`, {
      method: 'POST',
      headers: json,
      body: JSON.stringify({ id: randomUUID(), user_id: xRow.user_id, text: 'rls probe', created_at: now, updated_at: now }),
    })
    const insRows = await ins.json()
    const owner = Array.isArray(insRows) && insRows[0] ? insRows[0].user_id : null
    out.yInsertAsX = { status: ins.status, ownedBy: owner === yId ? 'Y' : owner === xRow.user_id ? 'X' : insRows }
  }

  // No user at all, anon key only: must be refused.
  const anonSel = await fetch(`${url}/rest/v1/thoughts?select=id`, { headers: { apikey: anon } })
  const anonRows = await anonSel.json()
  out.anonSelect = { status: anonSel.status, rows: Array.isArray(anonRows) ? anonRows.length : (anonRows.message ?? anonRows) }
} finally {
  // Delete Y; identities and thoughts cascade.
  const del = await sql(`delete from auth.users where id = '${yId}'`)
  out.deleteY = Array.isArray(del) ? 'ok' : del
  const left = await sql(`select count(*)::int as n from public.thoughts where user_id = '${yId}'`)
  out.yRowsLeft = left[0]?.n
}

console.log(JSON.stringify(out, null, 2))
const pass = out.ySelect?.rows === 0 && out.yUpdateX?.rowsAffected === 0 && out.xRowTampered === false
  && out.yInsertAsX?.ownedBy === 'Y' && out.anonSelect?.status === 401 && out.yRowsLeft === 0
console.log(pass ? 'criterion 6: met' : 'criterion 6: NOT met')
process.exit(pass ? 0 : 1)
