// T1-08: alte Songs bitgleich. Lädt Basis (R-4300) und T1, baut dieselben 4/4-Songs (Demo + Kette + Marken + Träger), spielt sie
// offline (vvRender) und vergleicht (a) Projekt-JSON (ohne Zufalls-IDs/Zeit-Namen), (b) jedes geplante Ereignis (Stimme, Drum,
// Klick: Zeit relativ zum Start in Samples, Note, Spur), (c) Offline-Länge. Aufruf: node t1-bitgleich.mjs <basis.html> <t1.html>
import { chromium } from 'playwright';
import crypto from 'crypto';
const [A, B] = [process.argv[2], process.argv[3]];
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
async function run(file, variant) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  const r = await p.evaluate(async (variant) => {
    const Q = window.SYNQUENZER, out = {}, ev = [];
    const wrap = (name, f) => { const o = window[name]; window[name] = function () { try { f(arguments); } catch (e) {} return o.apply(this, arguments); }; };
    let t0 = null; const T = t => { if (t0 == null) t0 = t; return Math.round((t - t0) * 48000); };
    wrap('spawnVoice', a => ev.push(['v', a[0], a[1], +(+a[2]).toFixed(4), T(a[3])]));
    wrap('drumHit', a => ev.push(['d', a[0], +(+a[1]).toFixed(4), T(a[2])]));
    wrap('click', a => ev.push(['c', T(a[0]), !!a[1]]));
    Q.loadDemo(); await new Promise(r => setTimeout(r, 300));
    Q.songFromChain(variant === 1 ? [{scene: 0, bars: 2}, {scene: 1, bars: 3}, {scene: 0, bars: 1}] : [{scene: 1, bars: 1}, {scene: 0, bars: 2}]);
    const sg = JSON.parse(JSON.stringify(Q.project().song));
    if (variant === 1) {
      sg.marks = [{id: 'M1', a: 0, len: 2, part: null}, {id: 'M2', a: 2, len: 3, part: null}];
      sg.carrier = [{beat: 0, target: null}, {beat: 9, target: {root: 7, kind: 'single'}}];
      sg.xp = [{beat: 8, semi: 2}];
    }
    Q.setSong(sg);
    const pj = Q.project(); delete pj.id; delete pj.name; for (const t of pj.tracks) delete t.uid; for (const s of pj.scenes) delete s.uid;
    out.json = JSON.stringify(pj);
    const v = await Q.vvRender({});
    out.dur = v.dur; out.songSec = v.songSec; out.ev = ev;
    return out;
  }, variant);
  await p.close(); if (process.env.DUMP) require_dump(r.ev); return { r, errs };
}
import fs from 'fs'; let dn = 0; function require_dump(e) { fs.writeFileSync('/tmp/claude-0/ev' + (dn++) + '.json', JSON.stringify(e).replace(/],/g, '],\n')); }
let fail = 0; const ok = (id, c, i) => { if (!c) fail++; console.log((c ? 'PASS ' : 'FAIL ') + id + (i ? ' — ' + i : '')); };
const h = x => crypto.createHash('sha256').update(x).digest('hex').slice(0, 12);
for (const variant of [1, 2]) {
  const ra = await run(A, variant), rb = await run(B, variant);
  const srt = e => JSON.stringify(e.map(x => JSON.stringify(x)).sort()), ea = srt(ra.r.ev), eb = srt(rb.r.ev);   // gleiche Zeit: Reihenfolge der Planung egal
  ok('T1-08a/' + variant + ' Projekt-JSON zeichengleich', ra.r.json === rb.r.json, h(ra.r.json) + ' / ' + h(rb.r.json));
  ok('T1-08b/' + variant + ' kein Feld ts', !rb.r.json.includes('"ts"'));
  ok('T1-08c/' + variant + ' alle Ereignisse sample-gleich', ea === eb && ra.r.ev.length > 20, ra.r.ev.length + ' Ereignisse, ' + h(ea) + ' / ' + h(eb));
  ok('T1-08d/' + variant + ' Offline-Länge gleich', ra.r.songSec === rb.r.songSec && ra.r.dur === rb.r.dur, ra.r.songSec + ' s');
  ok('T1-08e/' + variant + ' keine Fehler', !ra.errs.length && !rb.errs.length, JSON.stringify(rb.errs).slice(0, 300));
}
await b.close(); process.exit(fail ? 1 : 0);
