cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4870/pruef
(cd drum1 && timeout 900 node kern.mjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4870/index.html > kern-4870.out 2> kern-4870.err); echo drum1 >> laneC.log
(cd imp4 && timeout 600 node imp4-test.cjs 8961 > imp4-test.out 2> imp4-test.err); echo imp4 >> laneC.log
(cd imps && timeout 900 node imps-test.cjs 8962 > imps-test-48000.out 2> imps-test.err); echo imps >> laneC.log
(cd trp2 && timeout 600 node trp2-test.js 8963 srv-b > trp2.out 2> trp2.err); echo trp2 >> laneC.log
(cd bm1 && timeout 600 node bm1-test.mjs 8964 > bm1-test.log 2> bm1.err); echo bm1 >> laneC.log
(cd alt/arp2 && timeout 600 node test.mjs neu abcdef > neu.out 2> neu.err); echo arp2 >> laneC.log
echo DONE >> laneC.log
