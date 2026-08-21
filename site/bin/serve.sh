#!/usr/bin/env bash
# Starts the local dev server in the background (build + watch + livereload).
set -euo pipefail
cd "$(dirname "$0")/.."

export PATH="/opt/homebrew/opt/ruby/bin:$PATH"

PIDFILE=".jekyll-serve.pid"
LOGFILE="/tmp/jekyll-serve.log"
HOST="127.0.0.1"
PORT="4000"

if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  echo "Already running (PID $(cat "$PIDFILE")) at http://$HOST:$PORT"
  exit 0
fi

bundle exec jekyll serve --host "$HOST" --port "$PORT" --livereload >"$LOGFILE" 2>&1 &
echo $! >"$PIDFILE"

sleep 2
tail -n 15 "$LOGFILE"
echo ""
echo "Site:  http://$HOST:$PORT"
echo "Logs:  $LOGFILE"
echo "Stop:  bin/stop.sh"
