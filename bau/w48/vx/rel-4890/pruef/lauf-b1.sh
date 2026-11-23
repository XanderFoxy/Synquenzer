export NODE_PATH=/opt/node-tools/node_modules
cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4890/pruef
(cd cmd3 && timeout 400 node cmd3-test.cjs 8991 basis neu > cmd3-test.out 2> cmd3-test.err; echo "cmd3 rc=$?" >> ../lauf-b1.log) &
(cd alt487/imp4 && timeout 180 node imp4-test.cjs 8993 > imp4-test.out 2> imp4-test.err; echo "imp4 rc=$?" >> ../../lauf-b1.log) &
(cd alt487/trp2 && timeout 180 node trp2-test.js 8993 neu > trp2-test.out 2> trp2-test.err; echo "trp2 rc=$?" >> ../../lauf-b1.log) &
wait; echo DONE >> lauf-b1.log
