export NODE_PATH=/opt/node-tools/node_modules
cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4900/pruef
(cd cmd3 && timeout 500 node cmd3-test.cjs 9110 basis neu > cmd3-test.out 2> cmd3-test.err; echo "cmd3 rc=$?" >> ../lauf-d.log) &
(cd perf5 && timeout 500 node kern-test.cjs 9112 > kern.out 2> kern.err; echo "perf5 rc=$?" >> ../lauf-d.log) &
(cd spkv2 && RASTER=1 timeout 400 node kern-spkv2.mjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4900/index.html > kern-spkv2.out 2> kern-spkv2.err; echo "spkv2 rc=$?" >> ../lauf-d.log) &
wait; echo DONE >> lauf-d.log
