#!/bin/bash
# REG – Release-Regression (Vorlage r4760/run.sh). Aufruf: SOLL_VERSION=x.y.z run.sh <index.html> [<vorher.html>=rel-4750] [<ausgabe-ordner>]
#   SOLL_VERSION ist Pflicht (sonst prüft sich die Datei selbst) · SPUREN=n (Standard: Zahl der CPUs) · NUR="name1 name2" wählt Tests
#   SOLO=1 (Standard): Tests mit LAST/UNGÜLTIG oder ROT nur in Prüf-Zeilen bei Fremdlast > CPU werden am Ende ALLEIN wiederholt (Urteil aus dem Allein-Lauf); SOLO=0 aus
#   Jeder Test läuft über tests/lauf.mjs: Urteil GRÜN / GRÜN (Wdh.) / GRÜN (allein) / BEKANNT / LAST / UNGÜLTIG (Last) / INFO / ROT, Last + Fremdlast werden mitgeschrieben.
#   Längste Tests zuerst (Dauer aus r4760), so viele gleichzeitig wie Spuren. Ergebnis: <ordner>/ERGEBNIS.md (alt/neu je Test, fehlende Tests = ROT).
S=/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad; VX=$S/vx; T=$VX/reg/tests
[ -n "${SOLL_VERSION:-}" ] || { echo "SOLL_VERSION fehlt – z. B.: SOLL_VERSION=4.76.1 $0 <index.html> (Prüfer-Befund REG 3: Soll nicht aus derselben Datei)" >&2; exit 2; }
export SOLL_VERSION; SOLO=${SOLO:-1}; [ "$SOLO" = 1 ] && export WDH=0 || export WDH=1
SRC=$(readlink -f "$1"); VOR=$(readlink -f "${2:-$S/rel-4750/index.html}"); O=${3:-$VX/reg/lauf-$(date +%H%M)}
mkdir -p $O/jobs $O/b1/neu; cp "$SRC" $O/index.html; F=$O/index.html; cp "$SRC" $O/b1/neu/index.html; cp "$VOR" $O/b1/basis.html
# Umfeld wie r4760: spk2/spk4-ui/spk4-rest lesen mess/*.f32 neben der Datei, spk2 vergleicht mit ../basis2.html (Probelauf 1: fehlte → spk4 neu gestartet)
[ -d $O/mess ] || cp -r $VX/r4660/mess $O/mess; [ -e $O/../basis2.html ] || ln -s $VX/basis2.html $O/../basis2.html
# spk10p-Fälle vorab im richtigen Ordner berechnen (Prüfer-Befund REG 1: verschachteltes $(…) lief im Job-Skript im falschen Ordner → nur 'demo' geprüft)
FALL10=$(cd $VX/spk10/messb && node -e 'const S=require("./faelle8-soll.json");console.log(Object.keys(S).filter(k=>k.includes("@")||/^(dunkel|gdemo|chrom)/.test(k)).join(";"))')
SPUREN=${SPUREN:-$(nproc)}; T0=$(date +%s)
echo "Start $(date -u +%H:%M:%S) UTC · Datei $SRC (md5 $(md5sum < $SRC | cut -c1-8), Soll $SOLL_VERSION) · vorher $VOR · Spuren $SPUREN · CPUs $(nproc) · SOLO $SOLO · Last vor dem Start $(cut -d' ' -f1-3 /proc/loadavg)" > $O/zeit.txt
[ -n "$FALL10" ] || echo "WARNUNG: spk10p-Fallliste leer (faelle8-soll.json?) – spk10p wird über soll.json ROT" >> $O/zeit.txt
L() { node $T/lauf.mjs "$@"; }
# name | Dauer r4760 (s) | Befehl   (Pfade wie r4760/run.sh; spk4/zrl1/beg1/clip1 aus tests/ = an den aktuellen Stand angepasste Kopien)
cat > $O/jobs.txt <<J
spk4|450|env SOLL_VERSION=$SOLL_VERSION node $T/spk4-test.mjs $F $VX/basis5.html
lt1|545|node $VX/lt1/lt1-test.mjs $F $VOR
beg1|335|node $T/beg1-test.mjs $O/b1/neu/index.html $O/o-beg1
imp1|209|node $VX/imp/imp1-test.mjs $F
spk11b|183|node $VX/spk11b/spk11b-test.mjs $F
vxr2|182|node $VX/vxr2/vxr2-test.mjs $F $VOR $S/realvox/dl $O/o-vxr2
rv1|160|node $VX/real/rv1-test.mjs $F $S/realvox/dl $O/rv1.json
mtx3|142|node $VX/mtx3/mtx3-test.mjs $F $O/o-mtx3
spk11|141|node $VX/spk11/spk11-test.mjs $F
teil1|140|node $VX/teil1/teil1-test.mjs $F
spk6p|137|node $VX/spk6/spk6-pruef-test.mjs $F
fok2|131|node $VX/fok2/fok2-test.mjs $F $VOR
rv1k|128|node $VX/imp2b/fix/rv1-test-imp2b.mjs $F $S/realvox/dl $O/rv1k.json
mtx4|127|node $VX/mtx4/mtx4-test.mjs $F $O/o-mtx4
chrk|124|node $VX/chr3/chr2-test-imp2b.mjs $F $VX/basis2.html
mtx3b|110|node $VX/mtx3b/mtx3b-test.mjs $F $O/o-mtx3b
fokus1|102|node $VX/fokus1/fokus1-test.mjs $F
voxr1|96|node $VX/voxr1d/voxr1-test.mjs $F $VOR
zrl1|89|node $T/zrl1-test.mjs $F $VOR
trp1|88|node $VX/trp1/trp1-test.mjs $F $O/o-trp1
spk12|88|node $VX/spk12/spk12-test.mjs $F
mtx3c|66|node $VX/mtx3c/mtx3c-test.mjs $F $O/o-mtx3c
spk12b|63|node $VX/spk12/spk12-test2.mjs $F
mtx3p|60|node $VX/mtx3/mtx3p-test.ab469.mjs $F
spk8f|60|env -C $VX/spk10/messb HTML=$F SOLL=1 FALL=demo,okt,lang,walk,sech,leise,bassdrums,hoch,laut,basspads,ohneraster,sr48,ohnebass node faelle8.mjs
spk10p|12|env -C $VX/spk10/messb HTML=$F SOLL=1 FALL='$FALL10' node faelle8p.mjs
spk5|57|node $VX/spk5/spk5-test.mjs $F
spk12c|57|node $VX/spk12/spk12-test3.mjs $F
spk6u|54|node $VX/spk6/spk6-pruef-ui.mjs $F
spk12d|54|node $VX/spk12/spk12-test4.mjs $F $S/rel-4680/index.html
vx1|49|node $VX/rolle/vx1-test.mjs $F $O/o-vx1
spk5f|38|node $VX/spk5/spk5-fade-test.mjs $F
spk6|36|node $VX/spk6/spk6-test.mjs $F
ki1|34|node $VX/spk5/ki1-test-spk5.mjs $F $VX/ki/modell $S/ki-ort/web
spk7|34|node $VX/spk7/spk7-test.mjs $F $O/spk7.json
spk7p|32|node $VX/spk7/spk7-pruef-test.mjs $F $O/spk7p.json
spk8s|26|node $VX/spk8/spk8-seite.mjs $F
spk9p|26|node $VX/spk9/fix/ui-pruef.mjs $F
spkfix|25|node $VX/spkfix/spkfix-test.mjs $F
spk10s|24|node $VX/spk10/spk10-seite.mjs $F
spk1|22|node $VX/spk/spk1-test.mjs $F
spk5p|17|node $VX/spk5/spk5-profi-test.mjs $F $VX/ki/modell $S/ki-ort/web
clip1|17|env CLIP1_OUT=$O/o-clip1 node $T/clip1-test.mjs $F
fokus1k|16|node $VX/fokus1/fokus1-kern-test.mjs $F
imp2n|11|node $VX/imp2/imp2-node.mjs $F $S/realvox/imp2rs
spk6k|10|node $VX/spk6/spk6-kern-test.mjs $F
spk7k|9|node $VX/spk7/spk7-kern-test.mjs $F $O/spk7-kern.json
vx2|9|node $VX/vx2/vx2-test.mjs $F
vx3|9|node $VX/vx3/vx3-test.mjs $F
pflicht|8|$T/pflicht.sh $F $O/smoke.png $SOLL_VERSION $VOR
mtx3cfix|7|node $VX/mtx3c/mtx3c-fix.mjs $F
spk9u|6|node $VX/spk9/spk9-ui.mjs $F
vxr2lyr|4|node $VX/vxr2/vxr2-lyr-test.mjs $F
spk9poly|2|node $VX/spk9/fix/poly9.mjs $F
spk9f|1|node $VX/spk9/fix/finden9.mjs $F
J
i=0; while IFS='|' read -r n d c; do [ -n "${NUR:-}" ] && ! [[ " $NUR " == *" $n "* ]] && continue; i=$((i+1))
  # stderr des Job-Skripts (alles vor/um lauf.mjs) → <name>.err; lauf.mjs wertet eine nicht leere .err als ROT (Prüfer-Befund REG 1)
  printf '#!/bin/bash\nexec 2>%s/%s.err\nnode %s/lauf.mjs %s %s 1500 -- %s\n' "$O" "$n" "$T" "$n" "$O" "$c" > $O/jobs/$(printf %03d $i)-$n.sh; done < <(sort -t'|' -k2,2nr $O/jobs.txt)
ls $O/jobs/*.sh | xargs -P $SPUREN -n1 bash > $O/run.out 2>&1
T1=$(date +%s); echo "Pool Ende $(date -u +%H:%M:%S) UTC · Pool $((T1-T0)) s · Last $(cut -d' ' -f1-3 /proc/loadavg)" >> $O/zeit.txt
if [ "$SOLO" = 1 ]; then
  W=$(node -e 'const fs=require("fs"),O=process.argv[1];for(const f of fs.readdirSync(O).filter(f=>f.endsWith(".json"))){let j;try{j=JSON.parse(fs.readFileSync(O+"/"+f))}catch(e){continue}
    if(!j||!j.urteil||j.allein)continue;const fr=j.last&&j.last.fremd!=null?j.last.fremd:99;
    if(/^(LAST|UNGÜLTIG)/.test(j.urteil)||(j.urteil==="ROT"&&!(j.struktur||[]).length&&fr>j.cpu))console.log(j.name)}' $O)
  for n in $W; do ALLEIN=1 bash $O/jobs/*-$n.sh >> $O/run.out 2>&1; done
  T2=$(date +%s); echo "Allein wiederholt: ${W:-–} · $((T2-T1)) s · Last $(cut -d' ' -f1-3 /proc/loadavg)" | tr '\n' ' ' >> $O/zeit.txt; echo >> $O/zeit.txt
fi
T3=$(date +%s); echo "Ende $(date -u +%H:%M:%S) UTC · Gesamt $((T3-T0)) s · Last am Ende $(cut -d' ' -f1-3 /proc/loadavg)" >> $O/zeit.txt
node $T/tabelle.mjs $O > /dev/null; echo FERTIG > $O/fertig.txt
