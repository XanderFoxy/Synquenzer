#!/bin/sh
# VV4-F: alle eigenen Tests (Playwright + Chromium). Aufruf aus beliebigem Ordner: sh bau/helfer/VV4F/tests/alle.sh
cd "$(dirname "$0")" && mkdir -p out
node t-app.mjs && W=926 H=428 node t-app.mjs && node t-layout.mjs && node t-video.mjs && node t-speed.mjs
