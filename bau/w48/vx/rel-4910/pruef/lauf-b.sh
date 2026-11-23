export NODE_PATH=/opt/node-tools/node_modules
cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4910/pruef
(cd dse && timeout 600 node kern-dse.cjs 9211 neu basis > kern-dse.out 2> kern-dse.err; echo "dse rc=$?" >> ../lauf-b.log) &
(cd farb && timeout 600 node farb-test.cjs 9211 neu basis > farb-test.out 2> farb-test.err; echo "farb rc=$?" >> ../lauf-b.log) &
(cd vxrr && timeout 600 node vxrr-test.cjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4910/index.html /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4880/index.html > vxrr-test.out 2> vxrr-test.err; echo "vxrr rc=$?" >> ../lauf-b.log) &
wait; echo DONE >> lauf-b.log
