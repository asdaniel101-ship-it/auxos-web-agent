#!/bin/bash
# Setup script for auxos-web-agent workspace
# Symlinks .env.local from persistent config into the worktree

set -e

ENV_SOURCE="$HOME/.config/auxos-web-agent/.env.local"

if [ ! -f "$ENV_SOURCE" ]; then
  echo "ERROR: $ENV_SOURCE not found. Create it with your ANTHROPIC_API_KEY first."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -e "$SCRIPT_DIR/crm/.env.local" ]; then
  ln -s "$ENV_SOURCE" "$SCRIPT_DIR/crm/.env.local"
  echo "Symlinked crm/.env.local -> $ENV_SOURCE"
else
  echo "crm/.env.local already exists, skipping"
fi
