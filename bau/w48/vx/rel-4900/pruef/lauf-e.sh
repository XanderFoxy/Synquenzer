export NODE_PATH=/opt/node-tools/node_modules
cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4900/pruef
(cd fok4 && timeout 500 node fok4-test.cjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4900/index.html /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4880/index.html 1 > fok4-test.out 2> fok4-test.err; echo "fok4 rc=$?" >> ../lauf-e.log) &
(cd ges4 && timeout 200 node load-test.cjs 9111 > load-test.out 2> load-test.err; echo "ges4load rc=$?" >> ../lauf-e.log) &
wait; echo DONE >> lauf-e.log
