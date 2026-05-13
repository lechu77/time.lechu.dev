#!/bin/zsh
set -e
REPO="/Users/z0051syf/Library/CloudStorage/OneDrive-SiemensAG/Lechu/workspace/time.lechu.dev"

cd "$REPO"

# Init if not already a git repo
if [ ! -d ".git" ]; then
  git init
  git branch -M main
fi

# Set remote (replace if exists)
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/lechu77/time.lechu.dev.git

# Stage tracked files only (respects .gitignore)
git add -A

# Commit
git commit -m "feat: initial working UI — yATZ Tool

- Retro neon dark/light theme with scanline texture
- Live timezone grid with per-column neon accent colors
- Add/remove timezones via search autocomplete
- Offset timezone support: UTC-3, GMT+5, +2, -11 via Etc/GMT±N
- Crosshair hover: highlights same UTC moment across all columns
- LocalStorage + URL hash persistence
- ANSI Shadow ASCII banner
- Cloudflare Pages ready: _headers CSP, _redirects" 2>/dev/null || git commit --allow-empty -m "chore: update docs and gitignore"

# Push
git push -u origin main

echo "DONE"
