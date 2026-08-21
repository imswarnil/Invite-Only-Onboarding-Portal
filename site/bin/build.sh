#!/usr/bin/env bash
# Production build: renders the site into _site/ (no server, no watch).
set -euo pipefail
cd "$(dirname "$0")/.."

export PATH="/opt/homebrew/opt/ruby/bin:$PATH"

bundle exec jekyll build
echo "Built to $(pwd)/_site"
