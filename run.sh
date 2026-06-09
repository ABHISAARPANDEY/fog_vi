#!/usr/bin/env bash
# FogVision AI — run backend + frontend together.
#
#   ./run.sh
#
# Starts the FastAPI backend (http://localhost:8000) and the Next.js frontend
# (http://localhost:3000). First run auto-installs dependencies. Press Ctrl+C
# once to stop both.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="${ROOT}/backend"
FRONTEND="${ROOT}/frontend"

BACK_PID=""
FRONT_PID=""

c_blue="\033[0;34m"; c_cyan="\033[0;36m"; c_green="\033[0;32m"
c_yellow="\033[0;33m"; c_red="\033[0;31m"; c_reset="\033[0m"

info()  { printf "${c_cyan}==>${c_reset} %s\n" "$1"; }
ok()    { printf "${c_green}✓${c_reset} %s\n" "$1"; }
warn()  { printf "${c_yellow}!${c_reset} %s\n" "$1"; }
err()   { printf "${c_red}✗${c_reset} %s\n" "$1" >&2; }

cleanup() {
  echo ""
  info "Shutting down…"
  # Kill the launched processes and any children they spawned.
  for pid in "${FRONT_PID}" "${BACK_PID}"; do
    if [ -n "${pid}" ] && kill -0 "${pid}" 2>/dev/null; then
      pkill -P "${pid}" 2>/dev/null || true
      kill "${pid}" 2>/dev/null || true
    fi
  done
  ok "Stopped."
}
trap cleanup INT TERM EXIT

# ---------------------------------------------------------------------------
# Backend setup
# ---------------------------------------------------------------------------
if [ ! -d "${BACKEND}/.venv" ]; then
  info "Backend virtualenv not found — running setup.sh (one-time)…"
  if [ ! -x "${BACKEND}/setup.sh" ]; then
    chmod +x "${BACKEND}/setup.sh" 2>/dev/null || true
  fi
  if ! ( cd "${BACKEND}" && ./setup.sh ); then
    err "Backend setup failed. Ensure Python 3.11 or 3.12 is installed"
    err "(e.g. 'brew install python@3.12'), then re-run ./run.sh"
    exit 1
  fi
else
  ok "Backend virtualenv present."
fi

if [ ! -f "${BACKEND}/.env" ]; then
  cp "${BACKEND}/.env.example" "${BACKEND}/.env"
  ok "Created backend/.env"
fi

# ---------------------------------------------------------------------------
# Frontend setup
# ---------------------------------------------------------------------------
if [ ! -d "${FRONTEND}/node_modules" ]; then
  info "Installing frontend dependencies (one-time)…"
  if ! ( cd "${FRONTEND}" && npm install ); then
    err "Frontend 'npm install' failed. Is Node.js installed?"
    exit 1
  fi
else
  ok "Frontend dependencies present."
fi

if [ ! -f "${FRONTEND}/.env.local" ]; then
  cp "${FRONTEND}/.env.example" "${FRONTEND}/.env.local"
  ok "Created frontend/.env.local"
fi

# ---------------------------------------------------------------------------
# Port preflight — refuse to start if another app already owns 8000/3000.
# (A different backend on :8000 would silently receive FogVision's uploads.)
# ---------------------------------------------------------------------------
port_in_use() { lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; }

check_port() {
  local port="$1" name="$2"
  if port_in_use "${port}"; then
    err "Port ${port} (${name}) is already in use by another process:"
    lsof -nP -iTCP:"${port}" -sTCP:LISTEN 2>/dev/null | sed 's/^/    /'
    echo ""
    warn "Free it first, then re-run ./run.sh. To kill whatever is on ${port}:"
    printf "    lsof -ti tcp:%s | xargs kill -9\n" "${port}"
    return 1
  fi
}

if ! check_port 8000 "backend" || ! check_port 3000 "frontend"; then
  exit 1
fi

# ---------------------------------------------------------------------------
# Launch
# ---------------------------------------------------------------------------
info "Starting backend  → http://localhost:8000  (docs at /docs)"
(
  cd "${BACKEND}"
  # shellcheck disable=SC1091
  source .venv/bin/activate
  exec uvicorn app.main:app --host 0.0.0.0 --port 8000
) &
BACK_PID=$!

info "Starting frontend → http://localhost:3000"
(
  cd "${FRONTEND}"
  exec npm run dev
) &
FRONT_PID=$!

echo ""
ok "FogVision AI is starting up."
printf "  ${c_blue}Frontend:${c_reset} http://localhost:3000\n"
printf "  ${c_blue}Backend :${c_reset} http://localhost:8000  (Swagger: /docs)\n"
printf "  ${c_yellow}Press Ctrl+C to stop both.${c_reset}\n\n"

# Wait for either process; if one dies, tear everything down.
while kill -0 "${BACK_PID}" 2>/dev/null && kill -0 "${FRONT_PID}" 2>/dev/null; do
  sleep 1
done

warn "One of the services exited — stopping the other."
