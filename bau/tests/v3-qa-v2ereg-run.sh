#!/bin/bash
cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test
for t in "$@"; do
  timeout 900 node v3-qa-v2ereg-$t.mjs > v3-qa-v2ereg/$t.out 2>&1
  echo "$t exit=$?" >> v3-qa-v2ereg/summary.txt
done
echo DONE >> v3-qa-v2ereg/summary.txt
