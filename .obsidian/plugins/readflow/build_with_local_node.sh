#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
NODE_BIN="$("$ROOT/bootstrap_local_node.sh")"
NODE_HOME="$(cd "$(dirname "$NODE_BIN")/.." && pwd)"
NPM_CLI="$NODE_HOME/lib/node_modules/npm/bin/npm-cli.js"

export PATH="$NODE_HOME/bin:$PATH"

cd "$ROOT"
"$NODE_BIN" "$NPM_CLI" install
"$NODE_BIN" "$NPM_CLI" run build
python3 check_release.py
