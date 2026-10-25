#!/bin/bash
D=/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad
cd $D/dirigent-test
for f in flow1 flow2 timing; do
  SYNQ_APP=$D/synq-snapshots/VS2b-fix.html timeout 900 node v3-qa-grp-$f.mjs > v3-qa-v2c2reg-$f-base.out 2>&1
  timeout 900 node v3-qa-grp-$f.mjs > v3-qa-v2c2reg-$f-new.out 2>&1
done
echo done
