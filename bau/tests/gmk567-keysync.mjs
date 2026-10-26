// G-MK567: MK5 KEYS 9 (arp: a new chord) restarts the MK6 seq position at KEY SYNC Timbre (keyReset hook), like a first key without arp.
import {render, mkPatch} from './v3-mk1-node.mjs';
const FILE = process.env.MK_FILE;
let fails = 0; const ok = (id, c, i) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (i ? ' — ' + i : '')); };
const V = Array.from({length: 16}, (_, i) => i);
function run(arp, k9, ks) {
  const p = mkPatch({}); p.arp = {on: arp ? 1 : 0, res: 1, gate: 75, type: 0, range: 1, latch: 0, swing: 0, ks: 1, last: 8, tgt: 0, steps: 255};
  p.t[0].seq = {on: 1, last: 16, type: 0, run: 1, ks, res: 0, q: [{k: 11, m: 1, v: V}, {k: 0, m: 0, v: new Array(16).fill(0)}, {k: 0, m: 0, v: new Array(16).fill(0)}]};
  const raw = k9 ? [[.31, 9, 0]] : [];
  const r = render(p, [[0, 'on', 60, .8, 'a'], [.3, 'off', 60, 0, 'a'], [.31, 'on', 64, .8, 'b']], {sec: .36, file: FILE, raw});
  return r.P.mk.tm[0].sq.j;
}
const a = run(true, true, 1), b = run(true, false, 1), c = run(false, false, 1), d = run(true, true, 0);
ok('Arp an + KEYS 9, KEY SYNC Timbre: Seq-Position neu ab Schritt 1', a <= 2, 'j = ' + a);
ok('Arp an ohne KEYS 9: Position läuft weiter (Neuanschlag allein setzt nicht zurück)', b >= 6, 'j = ' + b);
ok('ohne Arp, erste Taste nach „alle los“: Position neu (wie MK6)', c <= 2, 'j = ' + c);
ok('KEY SYNC aus: KEYS 9 setzt nicht zurück', d >= 6, 'j = ' + d);
console.log(fails ? fails + ' FEHLER' : 'alles bestanden');
