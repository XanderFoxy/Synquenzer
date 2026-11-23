export NODE_PATH=/opt/node-tools/node_modules
cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4900/pruef
(cd kks && timeout 600 node kks-test.cjs 9110 basis neu > kks-test.out 2> kks-test.err; echo "kks rc=$?" >> ../lauf-a.log) &
(cd arpg && timeout 600 node arpg-test.cjs 9110 basis/index.html neu/index.html > arpg-test.out 2> arpg-test.err; echo "arpg rc=$?" >> ../lauf-a.log) &
(cd ksm && timeout 600 node kern-ksm.cjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4900/index.html /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4880/index.html > kern-ksm.out 2> kern-ksm.err; echo "ksm rc=$?" >> ../lauf-a.log) &
wait; echo DONE >> lauf-a.log
