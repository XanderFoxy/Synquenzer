export NODE_PATH=/opt/node-tools/node_modules
cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4890/pruef
(cd perf5 && timeout 400 node kern-test.cjs 8992 > kern.out 2> kern.err; echo "perf5 rc=$?" >> ../lauf-b2.log) &
(cd ges4 && timeout 180 node load-test.cjs 8990 > load-test.out 2> load-test.err; echo "ges4load rc=$?" >> ../lauf-b2.log) &
(cd chr6 && timeout 180 node rauch.js 8990 > rauch.out 2> rauch.err; echo "chr6rauch rc=$?" >> ../lauf-b2.log) &
wait; echo DONE >> lauf-b2.log
