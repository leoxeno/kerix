#!/usr/bin/env bash
# Run once per clone. Installs the shared git hooks and the repo-local author identity.
set -euo pipefail
cd "$(dirname "$0")/.."

git config core.hooksPath .githooks
chmod +x .githooks/* scripts/*.sh

if [[ -z "$(git config user.email)" || "$(git config user.email)" != *"@users.noreply.github.com" ]]; then
  echo "Set a GitHub noreply author for this repo, e.g.:"
  echo "  git config user.name 'Leo Xeno'"
  echo "  git config user.email '<id>+<login>@users.noreply.github.com'"
fi

[[ -d node_modules ]] || npm install

echo "Git hooks configured. Run ./scripts/check.sh to verify the tree."
