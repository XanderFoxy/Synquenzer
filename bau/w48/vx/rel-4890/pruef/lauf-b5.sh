export NODE_PATH=/opt/node-tools/node_modules
cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4890/pruef/alt488
(cd impd && timeout 300 node impd-test.cjs 8994 > impd-test.out 2> impd-test.err; echo "impd rc=$?" >> ../../lauf-b5.log) &
(cd perf4 && timeout 300 node kern-test.cjs 8995 > kern.out 2> kern.err; echo "perf4 rc=$?" >> ../../lauf-b5.log) &
(cd ges3 && timeout 300 node kern-test.cjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4870/index.html /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4890/index.html > kern-test.out 2> kern-test.err; echo "ges3 rc=$?" >> ../../lauf-b5.log) &
(cd spkv && RASTER=1 timeout 300 node kern-spkv.mjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4890/index.html > kern-spkv.out 2> kern-spkv.err; echo "spkv rc=$?" >> ../../lauf-b5.log) &
wait; echo DONE >> ../lauf-b5.log
