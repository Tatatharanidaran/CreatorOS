#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

MODEL="${OLLAMA_MODEL:-llama3.2:3b}"
OLLAMA_URL="${OLLAMA_URL:-http://localhost:11434}"
STARTED_OLLAMA=0
OLLAMA_PID=""
NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

cleanup() {
  if [[ "$STARTED_OLLAMA" -eq 1 && -n "$OLLAMA_PID" ]]; then
    kill "$OLLAMA_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

load_nvm() {
  if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    source "$NVM_DIR/nvm.sh"
    return 0
  fi
  return 1
}

install_nvm_if_missing() {
  if load_nvm; then
    return 0
  fi

  echo "==> nvm not found. Installing nvm..."
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  elif command -v wget >/dev/null 2>&1; then
    wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  else
    echo "Need curl or wget to install nvm automatically."
    exit 1
  fi

  if ! load_nvm; then
    echo "nvm install completed but could not be loaded in this shell."
    echo "Run: source \"$NVM_DIR/nvm.sh\" and re-run ./run_project.sh"
    exit 1
  fi
}

ensure_node() {
  install_nvm_if_missing
  echo "==> Installing/using Node 20 LTS..."
  nvm install 20 >/dev/null
  nvm use 20 >/dev/null
  echo "==> Node version: $(node -v)"
  echo "==> npm version: $(npm -v)"
}

install_ollama_if_missing() {
  if command -v ollama >/dev/null 2>&1; then
    return 0
  fi

  echo "==> ollama not found. Trying automatic install..."
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL https://ollama.com/install.sh | sh || true
  fi

  if ! command -v ollama >/dev/null 2>&1; then
    echo "Automatic Ollama install failed."
    echo "Install Ollama manually from https://ollama.com/download and re-run ./run_project.sh"
    exit 1
  fi
}

echo "==> Bootstrapping project..."
ensure_node
install_ollama_if_missing

if [[ ! -f .env && -f .env.example ]]; then
  echo "==> Creating .env from .env.example"
  cp .env.example .env
fi

echo "==> Installing/updating npm dependencies..."
npm install --no-fund

echo "==> Ensuring Ollama server is running..."
if ! curl -sf "${OLLAMA_URL}/api/tags" >/dev/null 2>&1; then
  ollama serve >/tmp/insta_creator_ollama.log 2>&1 &
  OLLAMA_PID=$!
  STARTED_OLLAMA=1
  sleep 2
fi

echo "==> Ensuring model exists: ${MODEL}"
ollama pull "$MODEL"

echo "==> Cleaning stale Next.js build cache..."
rm -rf .next

echo "==> Starting Next.js app (http://localhost:3000)"
npm run dev
