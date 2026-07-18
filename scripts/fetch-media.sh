#!/usr/bin/env bash
# Holt die Übungs-Bilder (JPG) und Animationen (GIF) aus dem Upstream-Dataset.
# Nicht im Repo, weil ~140 MB Binärdaten und 1:1 aus hasaneyldrm/exercises-dataset.
set -euo pipefail
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
git clone --depth 1 https://github.com/hasaneyldrm/exercises-dataset "$tmp"
mkdir -p app/img app/gif
cp "$tmp"/images/*.jpg app/img/
cp "$tmp"/videos/*.gif app/gif/
echo "OK: $(ls app/img | wc -l) Bilder, $(ls app/gif | wc -l) GIFs"
