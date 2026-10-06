#!/usr/bin/env bash
# The canonical gate. Humans, agents, hooks and CI all run this.
# Usage: ./scripts/check.sh [--fast]   (--fast skips the production build)
set -euo pipefail
cd "$(dirname "$0")/.."

FAST=0
[[ "${1:-}" == "--fast" ]] && FAST=1

step() { printf '\n\033[1m== %s ==\033[0m\n' "$1"; }

step "AGENTS.md mirrors CLAUDE.md"
if ! cmp -s CLAUDE.md AGENTS.md; then
  echo "AGENTS.md and CLAUDE.md differ. AGENTS.md must be a symlink to CLAUDE.md (ln -sfn CLAUDE.md AGENTS.md)." >&2
  exit 1
fi

step "privacy scan"
# Generic patterns live here. Owner-specific patterns live in an untracked .privacy-patterns file (one regex per line).
PATTERNS='gmail\.com|hotmail\.com|outlook\.com'
if [[ -f .privacy-patterns ]]; then
  PATTERNS="$PATTERNS|$(grep -v '^\s*#' .privacy-patterns | grep -v '^\s*$' | paste -sd '|' -)"
fi
if grep -rniE "$PATTERNS" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude=.privacy-patterns . ; then
  echo "Privacy scan matched. Remove the identifier before committing." >&2
  exit 1
fi
echo "clean"

step "lint"
npm run --silent lint

step "typecheck"
npm run --silent typecheck

step "test"
npm test --silent

if [[ $FAST -eq 0 ]]; then
  step "build"
  npm run --silent build
fi

printf '\n\033[32mcheck.sh: all green\033[0m\n'
