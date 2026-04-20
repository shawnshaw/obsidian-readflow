#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
VAULT_ROOT="$(cd "$ROOT/../../.." && pwd)"
TOOLS_DIR="$VAULT_ROOT/.tools"
NODE_VER="${NODE_VER:-v24.14.0}"
ARCHIVE="node-${NODE_VER}-darwin-arm64.tar.gz"
URL="https://nodejs.org/dist/${NODE_VER}/${ARCHIVE}"
NODE_HOME="$TOOLS_DIR/node-${NODE_VER}-darwin-arm64"

mkdir -p "$TOOLS_DIR"

if [ ! -x "$NODE_HOME/bin/node" ]; then
  cd "$TOOLS_DIR"
  curl -L "$URL" -o "$ARCHIVE"
  tar -xzf "$ARCHIVE"
fi

echo "$NODE_HOME/bin/node"
