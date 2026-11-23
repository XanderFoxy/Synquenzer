cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4890/pruef
(cd chr6 && timeout 300 node kern-test.mjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4890/index.html kern.json > kern.out 2> kern.err; echo "chr6 rc=$?" >> ../lauf-node.log) &
(cd ges4 && timeout 300 node kern-test.cjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4880/index.html /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4890/index.html > kern-test.out 2> kern-test.err; echo "ges4 rc=$?" >> ../lauf-node.log) &
(cd spkv2 && RASTER=1 timeout 300 node kern-spkv2.mjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4890/index.html > kern-spkv2.out 2> kern-spkv2.err; echo "spkv2 rc=$?" >> ../lauf-node.log) &
wait; echo DONE >> lauf-node.log
