#!/bin/sh
# G9E: alle Tests nacheinander (Chromium). Aufruf aus bau/helfer/G9E/tests: sh alle.sh
cd "$(dirname "$0")"
node t-ly.mjs ../index.html > ergebnis-t-ly.txt 2>&1
node smoke.mjs ../index.html > ergebnis-smoke.txt 2>&1
node take-play.mjs ../index.html > ergebnis-take-play-G9E.txt 2>&1
node take-play.mjs ../../../snapshots/R-4253.html > ergebnis-take-play-R4253.txt 2>&1
grep -h ERGEBNIS ergebnis-*.txt
