export NODE_PATH=/opt/node-tools/node_modules
cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4910/pruef
(cd szn && timeout 600 node szn-test.cjs 9211 basis neu > szn-test.out 2> szn-test.err; echo "szn rc=$?" >> ../lauf-c.log) &
(cd ksm2 && timeout 600 node kern-ksm2.cjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4910/index.html /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4900/index.html > kern-ksm2.out 2> kern-ksm2.err; echo "ksm2 rc=$?" >> ../lauf-c.log) &
(cd perf5 && timeout 600 node kern-test.cjs 9212 > kern.out 2> kern.err; echo "perf5 rc=$?" >> ../lauf-c.log) &
wait; echo DONE >> lauf-c.log
