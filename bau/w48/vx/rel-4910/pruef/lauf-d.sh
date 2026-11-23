export NODE_PATH=/opt/node-tools/node_modules
cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4910/pruef
(cd lt3 && timeout 900 node lt3-test.cjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4910/index.html /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4900/index.html 2 > lt3-test.out 2> lt3-test.err; echo "lt3 rc=$?" >> ../lauf-d.log)
echo DONE >> lauf-d.log
