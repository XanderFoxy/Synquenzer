#!/bin/sh
# G10e: alle Abnahme-Tests (Playwright + Chromium, Touch über CDP). Aufruf: sh alle.sh   (G10E_APP=… für eine andere Datei)
# Braucht playwright (hier: /opt/node-tools/node_modules/playwright, wird automatisch gefunden).
cd "$(dirname "$0")" || exit 1
rc=0
for t in a-gesten b-pruefen c-quant d-folgen e-layout; do echo "== $t"; node g10e-$t.mjs || rc=1; done
exit $rc
