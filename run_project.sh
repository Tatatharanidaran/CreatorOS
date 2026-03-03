#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

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

ensure_env() {
  if [[ ! -f .env && -f .env.example ]]; then
    echo "==> Creating .env from .env.example"
    cp .env.example .env
  fi

  if ! grep -q '^GROQ_API_KEY=' .env; then
    echo "GROQ_API_KEY=your_groq_api_key_here" >> .env
  fi

  CURRENT_KEY="$(grep '^GROQ_API_KEY=' .env | tail -n 1 | cut -d'=' -f2-)"
  if [[ -z "$CURRENT_KEY" || "$CURRENT_KEY" == "your_groq_api_key_here" ]]; then
    echo
    echo "==> Groq API key is required."
    echo "Create one at: https://console.groq.com/keys"
    read -r -s -p "Paste GROQ_API_KEY: " NEW_KEY
    echo

    if [[ -z "$NEW_KEY" ]]; then
      echo "GROQ_API_KEY cannot be empty."
      exit 1
    fi

    if grep -q '^GROQ_API_KEY=' .env; then
      sed -i "s|^GROQ_API_KEY=.*|GROQ_API_KEY=$NEW_KEY|" .env
    else
      echo "GROQ_API_KEY=$NEW_KEY" >> .env
    fi
  fi
}

echo "==> Bootstrapping project..."
ensure_node
ensure_env

echo "==> Installing/updating npm dependencies..."
npm install --no-fund

echo "==> Cleaning stale Next.js build cache..."
rm -rf .next

echo "==> Starting Next.js app (http://localhost:3000)"
npm run dev
