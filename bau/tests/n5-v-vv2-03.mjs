// VV2-03 Auto: Schnitte nur auf Taktstrichen, Abstand ≥ 2 Takte, ≤ 8 Takte ohne Schnitt in Teilen > 8 Takte; zwei Läufe → dasselbe
// Video (Hash der Schnittliste); Übergänge weich (Blende ≤ 400 ms, kein Flackern). VV2-04 9:16 Kamera: weich, nie außerhalb.
import { open } from './n5-v-lib.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
// 30 bars: Intro 4, Strophe 12, Refrain 10, Outro 4 (parts > 8 bars: Strophe, Refrain)
export const SONG30 = {bars: 30, lanes: [
  [{bar: 0, slot: 0}, {bar: 16, slot: 1}, {bar: 26, slot: -1}],
  [{bar: 4, slot: 0}, {bar: 26, slot: -1}],
  [{bar: 8, slot: 0}, {bar: 20, slot: -1}],
  [],
  [{bar: 0, slot: 0}, {bar: 16, slot: 1}, {bar: 22, slot: 0}],
  []],
  carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 4, name: 'Intro'}, {id: 'm2', a: 4, len: 12, name: 'Strophe'}, {id: 'm3', a: 16, len: 10, name: 'Refrain'}, {id: 'm4', a: 26, len: 4, name: 'Outro'}]};
const FMT = process.env.FMT || '9:16';
const {b, p, errs} = await open();
await p.evaluate(s => SYNQUENZER.setSong(s), SONG30);
const res = {};
const c1 = await p.evaluate(() => SYNQUENZER.vvCuts()), c2 = await p.evaluate(() => SYNQUENZER.vvCuts());
const marks = await p.evaluate(() => S.song.marks.map(m => ({a: m.a, len: m.len, name: m.name})));
const sh = c1.shots, gaps = sh.map(s => s.b - s.a), starts = new Set(marks.map(m => m.a));
// ≤ 8 bars without a cut inside parts > 8 bars
const long = marks.filter(m => m.len > 8).map(m => { let worst = 0; for (let x = m.a; x < m.a + m.len; x++) { const s = sh.find(q => x >= q.a && x < q.b); const a = Math.max(s.a, m.a), e = Math.min(s.b, m.a + m.len); worst = Math.max(worst, e - a); } return {teil: m.name, len: m.len, laengsteStrecke: worst}; });
res.liste = {schnitte: sh.map(s => [(s.a + 1) + '–' + s.b, s.v + (s.v === 'spur' ? ':' + s.t : ''), s.why]), aufTaktstrich: sh.every(s => Number.isInteger(s.a) && Number.isInteger(s.b)), minAbstand: Math.min(...gaps), lange: long,
  teilgrenzen: marks.map(m => ({teil: m.name, a: m.a + 1, schnitt: sh.some(s => s.a === m.a)})), hash1: c1.hash, hash2: c2.hash};
res.liste.ok = res.liste.aufTaktstrich && res.liste.minAbstand >= 2 && long.every(x => x.laengsteStrecke <= 8) && c1.hash === c2.hash;
// two video jobs → the same cut list in the encoder (hash of its run) and the same camera log (9:16)
await p.evaluate(f => { SYNQUENZER.vvTest({opus: true}); SYNQUENZER.vvPrefs({fmt: f, view: 'auto', cam: 'kamera'}); }, FMT);
const runs = [];
for (let k = 0; k < 2; k++) {
  const m = await p.evaluate(() => SYNQUENZER.vvMake({}));
  const L = await p.evaluate(() => SYNQUENZER.vvRunLog());
  const pr = await p.evaluate(() => { const P = SYNQUENZER.vvInfo().prof || {}; const o = {}; for (const k of Object.keys(P)) if (P[k] && P[k].n) o[k] = {n: P[k].n, max: Math.round(P[k].max), mittel: +(P[k].sum / P[k].n).toFixed(1)}; o.gross = (P.big || []).length; return o; });
  (res.prof || (res.prof = [])).push(Object.assign(pr, {ms: m.ms, dur: +m.dur.toFixed(2)}));
  const lh = L.log ? L.log.map(e => [e.ts, e.k, e.cx.toFixed(3), e.cy.toFixed(3), e.z.toFixed(4)].join(',')).join(';') : '';
  runs.push({cuts: m.cuts, dur: m.dur, logN: L.log ? L.log.length : 0, logHash: execSync('sha1sum', {input: lh}).toString().slice(0, 12), L});
  if (k === 0) { const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); fs.writeFileSync(`n5-v-out/vv2-03-${FMT.replace(':', 'x')}.mp4`, Buffer.from(bl.b64, 'base64')); }
}
res.zweiLaeufe = {cuts: runs.map(r => r.cuts), log: runs.map(r => r.logHash + ' (' + r.logN + ')'), ok: runs[0].cuts === runs[1].cuts && runs[0].cuts === c1.hash && runs[0].logHash === runs[1].logHash};
const spb = await p.evaluate(() => 60 / S.bpm);
// the cut in the video: the first picture of shot k lies on the bar line (≤ 1 picture after it)
if (FMT === '9:16') {
  const L = runs[0].L.log, firsts = []; let pk = -1;
  for (const e of L) if (e.k !== pk) { pk = e.k; firsts.push({k: e.k, ts: e.ts, bar: sh[e.k].a, soll: sh[e.k].a * 4 * spb}); }
  res.schnittImVideo = {schnitte: firsts.map(f => ({takt: f.bar + 1, bild: +(f.ts * 30).toFixed(2), soll: +(f.soll * 30).toFixed(2), abw: +((f.ts - f.soll) * 30).toFixed(2)})), ok: firsts.every(f => f.ts - f.soll >= -1e-6 && f.ts - f.soll < 1 / 30 + 1e-6)};
  // VV2-04: window inside the view; per picture ≤ 5 % of the picture width except at cuts; acceleration bounded
  let out = 0, worstJ = 0, worstA = 0, prev = null, pprev = null, jumps = [];
  for (const e of L) {
    const x0 = e.cx - e.ww / 2, x1 = e.cx + e.ww / 2, y0 = e.cy - e.wh / 2, y1 = e.cy + e.wh / 2;
    if (x0 < -1e-6 || y0 < -1e-6 || x1 > 640 + 1e-6 || y1 > 360 + 1e-6) out++;
    if (prev && prev.k === e.k) {
      const k = 1080 / e.ww, px0 = prev.cx - prev.ww / 2, px1 = prev.cx + prev.ww / 2, j = Math.max(Math.abs(x0 - px0), Math.abs(x1 - px1), Math.abs((y0 - (prev.cy - prev.wh / 2))) , Math.abs(y1 - (prev.cy + prev.wh / 2))) * k / 1080 * 100;
      worstJ = Math.max(worstJ, j);
      if (pprev && pprev.k === e.k) { const a = Math.abs((e.cx - prev.cx) - (prev.cx - pprev.cx)) * k / 1080 * 100; worstA = Math.max(worstA, a); }
    } else if (prev) jumps.push(+(e.ts).toFixed(2));
    pprev = prev; prev = e;
  }
  const zs = L.map(e => e.z);
  res.kamera = {bilder: L.length, ausserhalb: out, groessterSchrittProzent: +worstJ.toFixed(2), groessteAenderungProzentJeBild: +worstA.toFixed(3), zoom: [Math.min(...zs).toFixed(2), Math.max(...zs).toFixed(2)], spruengeNurAnSchnitten: jumps.length, schnitte: sh.length - 1, ok: out === 0 && worstJ <= 5 && jumps.length <= sh.length - 1};
}
// the blend: 0,3 s, monotonic (no flicker) – the picture difference to the incoming shot falls frame by frame
const f = `n5-v-out/vv2-03-${FMT.replace(':', 'x')}.mp4`, [W, H] = FMT === '16:9' ? [1920, 1080] : [1080, 1920];
// a picture by its number (t = its time): exact, no seek ambiguity with the edit list
const raw = (src, out, t) => { execSync(`ffmpeg -v error -y -i ${src} ${t != null ? '-vf "select=eq(n\\,' + Math.round(t * 30) + ')"' : ''} -frames:v 1 -f rawvideo -pix_fmt rgb24 ${out}`); return fs.readFileSync(out); };
const diff = (x, y) => { let s = 0, n = 0; for (let k = 0; k < x.length; k += 12) { s += Math.abs(x[k] - y[k]); n++; } return s / n; };
const bl = [];
for (const s of sh.slice(1, 4)) {
  const f0 = Math.ceil(s.a * 4 * spb * 30 - 1e-6), seq = [];
  for (let j = -1; j <= 11; j++) {
    const t = (f0 + j) / 30, fr = raw(f, 'n5-v-out/b1.raw', t);
    const png = await p.evaluate(([t, v, fm]) => SYNQUENZER.vvShot(t, v, fm), [t, s.v === 'spur' ? 'spur:' + s.t : s.v, FMT]); fs.writeFileSync('n5-v-out/bref.png', Buffer.from(png, 'base64'));
    seq.push(+diff(fr, raw('n5-v-out/bref.png', 'n5-v-out/bref.raw')).toFixed(2));
  }
  let mono = true; for (let j = 2; j < seq.length; j++) if (seq[j] > seq[j - 1] + 1.0) mono = false;
  const doneAt = seq.findIndex((d, j) => j >= 1 && d < 4);
  bl.push({takt: s.a + 1, zu: s.v + (s.v === 'spur' ? ':' + s.t : ''), diffJeBild: seq, fertigNachBildern: doneAt - 1, monoton: mono});
}
res.blende = {schnitte: bl, ok: bl.every(x => x.monoton && x.fertigNachBildern >= 0 && x.fertigNachBildern <= 12)};
res.ok = Object.entries(res).every(([k, x]) => k === 'prof' || x.ok);
console.log(JSON.stringify(res, null, 1)); console.log('errors', errs);
fs.writeFileSync(`n5-v-out/vv2-03-${FMT.replace(':', 'x')}.json`, JSON.stringify(res, null, 1));
await b.close();
