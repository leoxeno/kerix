// Applies supabase/auth/magic-link.html as the project's magic-link email template
// through the Supabase management API, using credentials from the git-ignored .env.local.
// Run by the agent (spec 002): node scripts/apply-auth-template.mjs. Prints only the HTTP status and stored length.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const env = {}
for (const line of readFileSync(root + '.env.local', 'utf8').split(/\r?\n/)) {
  const text = line.trim()
  if (!text || text.startsWith('#')) continue
  const at = text.indexOf('=')
  if (at < 1) continue
  env[text.slice(0, at).trim()] = text.slice(at + 1).trim().replace(/^(['"])(.*)\1$/, '$2')
}

const { VITE_SUPABASE_URL: url, SUPABASE_ACCESS_TOKEN: token } = env
if (!url || !token) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_ACCESS_TOKEN in .env.local')
  process.exit(1)
}
let ref
try {
  ref = new URL(url).hostname.split('.')[0]
} catch {
  console.error('VITE_SUPABASE_URL is not a valid URL')
  process.exit(1)
}
const template = readFileSync(root + 'supabase/auth/magic-link.html', 'utf8')

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
  method: 'PATCH',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ mailer_templates_magic_link_content: template }),
})
console.log(`HTTP ${res.status}`)
if (res.ok) {
  const body = await res.json()
  console.log(`stored template length: ${body.mailer_templates_magic_link_content?.length ?? 'unknown'}`)
} else {
  process.exitCode = 1
}
