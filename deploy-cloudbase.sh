#!/usr/bin/env bash
set -euo pipefail

ENV_ID="${CLOUDBASE_ENV_ID:-check-in-d3ggzownm79a576fa}"
OUT_DIR=".cloudbase-deploy"

if ! command -v tcb >/dev/null 2>&1; then
  echo "CloudBase CLI 未安装。请先安装并登录："
  echo "  npm install -g @cloudbase/cli"
  echo "  tcb login"
  exit 1
fi

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

cp index.html sw.js site.webmanifest "$OUT_DIR/"
cp -R assets "$OUT_DIR/assets"

echo "Deploying static files to CloudBase environment: $ENV_ID"
tcb hosting deploy "$OUT_DIR" -e "$ENV_ID"

echo "CloudBase deploy finished."
