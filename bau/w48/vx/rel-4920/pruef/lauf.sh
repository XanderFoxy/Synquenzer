export NODE_PATH=/opt/node-tools/node_modules
cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4920/pruef
(cd vtrim/test && timeout 900 node kern2.cjs 9243 > ../kern2.out 2> ../kern2.err; echo "vtrim rc=$?" >> ../../lauf.log)
(cd kks && timeout 600 node kks-test.cjs 9242 basis neu > kks-test.out 2> kks-test.err; echo "kks rc=$?" >> ../lauf.log) &
(cd arpg && timeout 600 node arpg-test.cjs 9242 basis/index.html neu/index.html > arpg-test.out 2> arpg-test.err; echo "arpg rc=$?" >> ../lauf.log) &
wait
(cd dse && timeout 600 node kern-dse.cjs 9242 neu basis > kern-dse.out 2> kern-dse.err; echo "dse rc=$?" >> ../lauf.log) &
(cd vxrr && timeout 600 node vxrr-test.cjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4920/index.html /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4880/index.html > vxrr-test.out 2> vxrr-test.err; echo "vxrr rc=$?" >> ../lauf.log) &
wait; echo DONE >> lauf.log
