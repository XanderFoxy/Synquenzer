export NODE_PATH=/opt/node-tools/node_modules
cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4900/pruef
(cd szn && timeout 600 node szn-test.cjs 9110 basis neu > szn-test.out 2> szn-test.err; echo "szn rc=$?" >> ../lauf-c.log) &
(cd chr6 && timeout 400 node kern-test.mjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4900/index.html kern.json > kern.out 2> kern.err; echo "chr6 rc=$?" >> ../lauf-c.log) &
(cd ges4 && timeout 400 node kern-test.cjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4880/index.html /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4900/index.html > kern-test.out 2> kern-test.err; echo "ges4 rc=$?" >> ../lauf-c.log) &
wait; echo DONE >> lauf-c.log
