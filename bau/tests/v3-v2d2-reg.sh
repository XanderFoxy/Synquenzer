#!/bin/bash
cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test
for t in "$@"; do
  timeout 600 node $t > v3-v2d2-reg/${t%.mjs}.out 2>&1
  echo "$t exit=$? $(grep -E 'passed' v3-v2d2-reg/${t%.mjs}.out | tail -1)" >> v3-v2d2-reg/summary.txt
done
echo DONE >> v3-v2d2-reg/summary.txt
