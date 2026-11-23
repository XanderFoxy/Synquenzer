cd /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/neu/rel-4870/pruef
node rauch.js 8960 > rauch.out 2>&1; echo "rauch rc=$?" >> laneA.log
bash ton2/lauf.sh 8960 NEU 180 > ton2/lauf-neu.out 2>&1; bash ton2/lauf.sh 8966 PAKET 180 > ton2/lauf-paket.out 2>&1; echo ton2a >> laneA.log
bash ton2/lauf.sh 8960 NEU-leise 180 0 1500 >> ton2/lauf-neu.out 2>&1; bash ton2/lauf.sh 8966 PAKET-leise 180 0 1500 >> ton2/lauf-paket.out 2>&1; echo ton2b >> laneA.log
(cd alt/ton1 && timeout 200 node sonde.js 8960 korn > sonde-4870.json 2> sonde-4870.err); echo ton1sonde >> laneA.log
(cd alt/kmp1 && timeout 300 node kern.js 8960 > rc.txt 2> err.txt; echo rc=$? >> rc.txt); echo kmp1 >> laneA.log
(cd alt/mlg3 && timeout 300 node kern.js 8960 > rc.txt 2> err.txt; echo rc=$? >> rc.txt; timeout 200 node quer.js > quer.out 2> quer.err; echo rc=$? > quer.rc); echo mlg3 >> laneA.log
(cd alt/vl3 && timeout 300 node test.js 8960 > rc.txt 2> err.txt; echo rc=$? >> rc.txt); echo vl3 >> laneA.log
(cd alt/ent1b && timeout 300 node probe.js http://127.0.0.1:8960/index.html > out.txt 2>&1); echo ent1b >> laneA.log
(cd alt/ent1c && timeout 300 node sonde.js http://127.0.0.1:8960/index.html > out.txt 2>&1); echo ent1c >> laneA.log
(cd alt/ent1d && timeout 300 node sonde.js http://127.0.0.1:8960/index.html > out1.txt 2>&1; timeout 300 node sonde2.js http://127.0.0.1:8960/index.html > out2.txt 2>&1); echo ent1d >> laneA.log
echo DONE >> laneA.log
