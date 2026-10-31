// BM4-06 (26 patterns, play order E4 C4 G4), BM4-07 (SPD: free / song clock), the processor parts of BM4-08 (TRIG OFF = one voice whose
// pitch jumps: 'rt'; arp only on A: on.d = 1) and the sq-arp-src structure of BM4-09. BMARP from the block sq-arp-src of index.html.
import fs from 'fs';
import {render, on, off} from './bm-node.mjs';
const HERE = new URL('.', import.meta.url).pathname, SR = 48000;
let fails = 0; const res = [];
const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + ' — ' + info); res.push({id, ok: !!c, info}); };
const html = fs.readFileSync(HERE + '../index.html', 'utf8'), a = html.indexOf('<script type="text/plain" id="sq-arp-src">'), blk = html.slice(html.indexOf('>', a) + 1, html.indexOf('</script>', a));
const {BMARP, ARPC} = new Function(blk + '\n;return {BMARP, ARPC};')();
// the reference table (own writing of section 1.14) for E4 C4 G4 pressed in this order
const K = [64, 60, 67], REF = {
  '1oct': [64, 60, 67], dbl: [64, 64, 60, 60, 67, 67], '2oct': [64, 60, 67, 76, 72, 79], alt: [64, 76, 60, 72, 67, 79], '3oct': [64, 60, 67, 76, 72, 79, 88, 84, 91],
  pong: [64, 60, 67, 60], pon2: [64, 60, 67, 76, 72, 79, 72, 76, 67, 60], pon3: [64, 60, 67, 76, 72, 79, 88, 84, 91, 84, 88, 79, 72, 76, 67, 60],
  min: [67, 70, 74], maj: [67, 71, 74], sus2: [67, 69, 74], sus4: [67, 72, 74], '7th': [67, 71, 74, 77], min2: [67, 70, 74, 79, 82, 86], maj2: [67, 71, 74, 79, 83, 86],
  su22: [67, 69, 74, 79, 81, 86], su42: [67, 72, 74, 79, 84, 86], '7th2': [67, 71, 74, 77, 79, 83, 86, 89], '1o': [67], '2o': [67, 79], '3o': [67, 79, 91], '5th': [67, 74], '5th2': [67, 74, 79, 86]};
let bad = []; const rows = [];
for (const t of BMARP.T) {
  if (t === 'off') { if (BMARP.step(t, K, 0, 1) !== null) bad.push(t); continue; }
  const got = []; for (let c = 0; c < 24; c++) got.push(BMARP.step(t, K, c, 12345));
  if (t.startsWith('rnd')) { const set = new Set(t === 'rnd' ? K : t === 'rnd2' ? [...K, ...K.map(x => x + 12)] : [...K, ...K.map(x => x + 12), ...K.map(x => x + 24)]);
    const again = []; for (let c = 0; c < 24; c++) again.push(BMARP.step(t, K, c, 12345));
    const okR = got.every(x => set.has(x)) && new Set(got).size >= Math.min(set.size, 3) && JSON.stringify(got) === JSON.stringify(again); if (!okR) bad.push(t); rows.push(t + ' ' + got.slice(0, 6).join(' ') + '…'); continue; }
  const want = []; for (let c = 0; c < 24; c++) want.push(REF[t][c % REF[t].length]);
  if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(t + ' ' + got.slice(0, 10).join(' '));
}
ok('BM4-06 26 Muster in Spielreihenfolge (E4, C4, G4 gedrückt; Referenztabelle im Test; RND: Saat-gleich, nur Töne der Oktaven)', bad.length === 0 && BMARP.T.length === 27, (BMARP.T.length - 1) + ' Muster; ' + (bad.length ? 'falsch: ' + bad.join(', ') : 'alle gleich der Tabelle') + '; ' + rows.join(', '));
// BM4-07 SPD
const f = BMARP.div(120, 120, false), r = [120, 60, 90, 240, 400].map(s => BMARP.div(s, 120, true).name);
ok('BM4-07 SPD: Transport aus, SPD 120 → 125 ms; Transport an bei 120 BPM: 120 → 1/16, 60 → 1/8, 90 → 1/8T, 240 → 1/32, 400 → 1/32', Math.abs(f.sec * SR - .125 * SR) <= 1 && r.join() === '1/16,1/8,1/8T,1/32,1/32',
  'frei ' + (f.sec * 1000).toFixed(3) + ' ms; ' + r.join(', '));
// BM4-08 processor parts: TRIG OFF = one voice, only the pitch jumps ('rt'); the arp plays only on A (on.d = 1) also in LAYER
{ const msgs = [[0, {t: 'prog', ab: 'a', p: {o1: {m: 31, e: {l: 99}}}}], [0, on(.01, 64, .8, 1)], [0, {t: 'rt', list: [{n: 64, to: 60, at: .135, id: 1}]}], [0, {t: 'rt', list: [{n: 60, to: 67, at: .26, id: 1}]}]];
  let maxV = 0, pitches = new Set(); render(msgs, {sec: .4, each: P => { const v = P.V.filter(x => x.on && !x.ghost); maxV = Math.max(maxV, v.length); if (v[0]) pitches.add(v[0].n); }});
  const L = [[0, {t: 'prog', ab: 'a', p: {o1: {m: 31, e: {l: 99}}}}], [0, {t: 'prog', ab: 'b', p: {o1: {m: 7, e: {l: 99}}}}], [0, {t: 'ly', p: {md: 'lay'}}], [0, {t: 'on', list: [{n: 60, v: .8, at: .01, d: 1, id: 5}]}]];
  let pgs = null; render(L, {sec: .1, each: (P, f) => { if (f === 3840) pgs = P.V.filter(x => x.on && !x.ghost).map(x => x.pg); }});
  ok('BM4-08 (Prozessor-Teil) TRIG OFF: eine Stimme, nur die Tonhöhe springt; Arp nur auf A (on.d = 1) auch im Layer. HOLD / Arp-Taste 1 s / Klangwechsel: Host + Bedienfeld (BM5/BM6)', maxV === 1 && pitches.size === 3 && JSON.stringify(pgs) === '[0]',
    'Stimmen max ' + maxV + ', Tonhöhen ' + [...pitches].join(' → ') + '; Layer mit d = 1: Programme ' + JSON.stringify(pgs)); }
// BM4-09 structure: ARPC lives in sq-arp-src (word for word), the MK block has only the marker, mkLoad loads the block first
{ const base = fs.readFileSync(HERE + '../../../werkzeug/vs-base-B.html', 'utf8'), bm = base.indexOf('/* ---- MK5 (Nachtrag 3 MK5, EN3-11)'), be = base.indexOf('\n})();\n', base.indexOf('const ARPC = (function () {')) + 6;
  const same = blk.includes(base.slice(bm, be)), mk = html.slice(html.indexOf('<script type="text/plain" id="sq-mk-src">')); const gone = !/const ARPC = /.test(mk.slice(0, mk.indexOf('</script>')));
  ok('BM4-09 sq-arp-src: ARPC wortgleich verschoben, MS-Block ohne ARPC, mkLoad lädt den Block zuerst (MK5-Suiten: tests/mk5/run.sh)', same && gone && typeof ARPC.arpPattern === 'function' && /arpSrcLoad\(\);/.test(html),
    'ARPC-Text gleich ' + same + ', im MS-Block entfernt ' + gone + ', arpPattern ' + typeof ARPC.arpPattern); }
fs.writeFileSync(HERE + 'bm4-arp.out.json', JSON.stringify(res, null, 1));
process.exit(fails ? 1 : 0);
