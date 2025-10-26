#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$repo_root"

cat <<'EOF' > .gitignore
# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Dependency directories
node_modules/
backend/**/node_modules/

# Frontend builds
build/
dist/
dist-ssr/
.next/
out/
.cache/

# Django / backend builds
backend/**/staticfiles/
backend/**/media/

# Environment variables and secrets
.env
.env.*
*.local
backend/**/.env
backend/**/.env.*

# IDE and editor settings
.vscode/*
!.vscode/extensions.json
.idea/
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Python artifacts
__pycache__/
*.py[cod]
*.pyo
*.pyd
*.so
.pytest_cache/
.mypy_cache/
*.mo
*.pot

# Databases
*.sqlite3
backend/**/db.sqlite3

# Virtual environments
.venv/
venv/
env/
backend/**/.venv/
backend/**/venv/
backend/**/env/

# TypeScript / testing caches
coverage/
coverage-*/
coverage.*
nyc_output/
.nyc_output/

# Package archives
*.tgz
*.zip
*.tar
*.tar.gz

# Tooling caches
.pnpm-store/
*.tsbuildinfo

# AWS deployment helpers
terraform.tfstate*
.serverless/

# Local settings overrides
backend/**/local_settings.py

# Temporary files
*.tmp
*.temp
~$*

# Backend specific caches
backend/netra_backend/api/__pycache__/
EOF

echo "Wrote .gitignore with frontend and backend ignores."
