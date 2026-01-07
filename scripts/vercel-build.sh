#!/bin/bash
# Vercel build script that handles git errors gracefully
set -e

# Configure git to prevent errors (non-blocking)
export GIT_TERMINAL_PROMPT=0
export GIT_ASKPASS=echo
export GIT_CONFIG_NOSYSTEM=1

# Try to configure git if possible (non-blocking)
git config --global user.name "Vercel Build" 2>/dev/null || true
git config --global user.email "build@vercel.com" 2>/dev/null || true
git config --global init.defaultBranch main 2>/dev/null || true
git config --global --add safe.directory '*' 2>/dev/null || true

# Run the actual build
npm run build

