export NODE_PATH=/opt/node-tools/node_modules
cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4890/pruef
(cd fok4 && timeout 480 node fok4-test.cjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4890/index.html /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4880/index.html 1 > fok4-test.out 2> fok4-test.err; echo "fok4 rc=$?" >> ../lauf-b3.log) &
(cd alt487/bm1 && timeout 180 node bm1-test.mjs 8993 > bm1-test.out 2> bm1-test.err; echo "bm1 rc=$?" >> ../../lauf-b3.log) &
(cd alt487/ke2 && timeout 180 node smoke.cjs 8993 > smoke.out 2> smoke.err; echo "ke2 rc=$?" >> ../../lauf-b3.log) &
wait; echo DONE >> lauf-b3.log
