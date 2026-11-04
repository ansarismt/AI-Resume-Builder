#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

for command in python3 node npm; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "ERROR: $command is required. Install it and retry." >&2
    exit 1
  fi
done

if [[ ! -f .env ]]; then
  if [[ ! -f .env.example ]]; then
    echo "ERROR: .env.example is missing; cannot create the local environment file." >&2
    exit 1
  fi
  cp .env.example .env
  echo "Created .env from .env.example. Review it before continuing."
fi

if [[ ! -x .venv/bin/python ]]; then
  python3 -m venv .venv
fi

hash_file() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | cut -d ' ' -f 1
  else
    shasum -a 256 "$1" | cut -d ' ' -f 1
  fi
}

requirements_hash="$(hash_file requirements.txt)"
if [[ ! -f .venv/.req.hash ]] || [[ "$(cat .venv/.req.hash)" != "$requirements_hash" ]]; then
  .venv/bin/python -m pip install -r requirements.txt
  printf '%s\n' "$requirements_hash" > .venv/.req.hash
fi

lock_hash="$(hash_file package-lock.json)"
if [[ ! -d node_modules ]] || [[ ! -f node_modules/.lock.hash ]] || [[ "$(cat node_modules/.lock.hash)" != "$lock_hash" ]]; then
  npm ci
  printf '%s\n' "$lock_hash" > node_modules/.lock.hash
fi

.venv/bin/python manage.py migrate

.venv/bin/python manage.py runserver 127.0.0.1:8000 &
backend_pid=$!
npm run dev -- --host 127.0.0.1 &
frontend_pid=$!
cleanup() {
  kill "$backend_pid" "$frontend_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "API: http://127.0.0.1:8000/api/"
echo "App: http://127.0.0.1:8080"
wait
