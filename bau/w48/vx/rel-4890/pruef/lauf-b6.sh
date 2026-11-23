export NODE_PATH=/opt/node-tools/node_modules
cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4890/pruef/alt487
(cd ton2 && bash lauf.sh 8993 NEU489 180 0 1500 > lauf.out 2> lauf.err; echo "ton2 rc=$?" >> ../../lauf-b6.log) &
(cd zrl3 && SEK=20 RUNDEN=1 timeout 200 node test-zrl3.mjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4890/index.html /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4860/index.html > test-zrl3.out 2> test-zrl3.err; echo "zrl3 rc=$?" >> ../../lauf-b6.log) &
(cd drum1 && timeout 200 node kern.mjs /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4890/index.html > kern.out 2> kern.err; echo "drum1 rc=$?" >> ../../lauf-b6.log) &
wait; echo DONE >> ../../lauf-b6.log
