#!/usr/bin/env bash
# Stops the dev server started by bin/serve.sh.
set -euo pipefail
cd "$(dirname "$0")/.."

PIDFILE=".jekyll-serve.pid"

if [ -f "$PIDFILE" ]; then
  PID="$(cat "$PIDFILE")"
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID"
    echo "Stopped Jekyll server (PID $PID)."
  else
    echo "PID $PID from $PIDFILE is not running."
  fi
  rm -f "$PIDFILE"
else
  echo "No $PIDFILE found. Trying to find a stray jekyll serve process..."
  if pgrep -f "jekyll serve" >/dev/null 2>&1; then
    pkill -f "jekyll serve"
    echo "Killed stray 'jekyll serve' process(es)."
  else
    echo "Nothing to stop."
  fi
fi
