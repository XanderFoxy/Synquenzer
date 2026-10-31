#!/bin/bash
# MK5 regression (BM4-09): the MK5 arp suites on the base (vs-base-B, App 4.23.0) and on bau/helfer/BMK/index.html; outputs side by side
D=$(cd "$(dirname "$0")" && pwd); B=$D/../../../../werkzeug/vs-base-B.html; N=$D/../../index.html
for f in v3-mk5-arp v3-mk5-arp-audio; do
  timeout 900 node $D/$f.mjs $B > $D/$f.base.txt 2>&1
  timeout 900 node $D/$f.mjs $N > $D/$f.neu.txt 2>&1
done
