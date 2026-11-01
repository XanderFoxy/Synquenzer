// STAGE BITMASK (4.31.0): Startzeit ohne Bit Mask gegen 4.30.0, kein Modul ohne Bit-Mask-Spur, Video-Render und GarageBand-Instrumental
// enthalten Bit Mask (zweimal bitgleich), Speichern → Laden deep-equal (inkl. Kurven cv und Startklang), Konsole ohne Fehler.
// Aufruf: node bm-stage.mjs <stage index.html> <R-4300.html> [Startzeit-Läufe = 9]
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
const [NEW, OLD, nArg] = process.argv.slice(2); const N = +(nArg || 9);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const R = []; const ok = (id, c, info) => { R.push({id, ok: !!c}); console.log((c ? 'OK   ' : 'FAIL ') + id + ' · ' + JSON.stringify(info)); };
const errs = [];
async function open(f, keep) {
  const p = await b.newPage({viewport: {width: 390, height: 844}});
  if (keep) { p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); }
  const t0 = Date.now(); await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage && SYNQUENZER.storage().booted, null, {timeout: 60000});
  const ms = Date.now() - t0; return {p, ms};
}
// 1) Startzeit: abwechselnd alt / neu, Median
const tOld = [], tNew = [];
for (let k = 0; k < N; k++) for (const [f, a] of [[OLD, tOld], [NEW, tNew]]) { const {p, ms} = await open(f); a.push(ms); await p.close(); }
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
ok('Startzeit ohne Bit Mask wie 4.30.0 (Median ± 5 % oder ± 25 ms)', Math.abs(med(tNew) - med(tOld)) <= Math.max(.05 * med(tOld), 25), {alt: med(tOld), neu: med(tNew), altAlle: tOld, neuAlle: tNew});
const {p} = await open(NEW, true);
const lazy = await p.evaluate(async () => { ensureAudio(); await new Promise(r => setTimeout(r, 600)); return {block: typeof bmTrack === 'function', panel: typeof BMUI !== 'undefined', arp: typeof ARPC !== 'undefined', info: SYNQUENZER.bmInfo(), version: VERSION}; });
ok('ohne Bit-Mask-Spur: Block nicht ausgewertet, kein addModule, kein Arp-Block', !lazy.block && !lazy.panel && !lazy.arp && lazy.info.adds === 0 && lazy.version === '4.30.0', lazy);
// 2) Video und GarageBand: Song mit einer Bit-Mask-Spur (P11 + Kurve), alle anderen Spuren leer
const vid = await p.evaluate(async () => {
  const Q = SYNQUENZER, t = synthTracks()[0]; Q.setBpm(120);
  Q.setEngine(t, 'bm'); loadPreset(t, 'f-bm-p11');
  const notes = [[55, 59, 62], [52, 55, 59]].flatMap((c, bar) => c.map(n => ({t: bar * 4, d: 3.5, n, v: .8})));
  Q.setClip(t, 0, {len: 2, key: {root: 7, scale: 'ionian', src: 'user'}, notes});
  Q.setClipCurves(t, 0, {bd: [[0, 0], [4, .5], [6, 0]]});
  const lanes = S.tracks.map((_, i) => i === t ? [{bar: 0, slot: 0}] : []);
  Q.setSong({bars: 2, lanes, carrier: [], xp: [], mel: {}, marks: [], loop: {on: false, a: 0, b: 2}});
  for (let k = 0; k < 40 && BMX.st !== 'ready'; k++) await new Promise(r => setTimeout(r, 100));
  const rms = (ch, a, z) => { let s = 0, n = 0; for (const d of ch) for (let i = a; i < Math.min(z, d.length); i++) { s += d[i] * d[i]; n++; } return 10 * Math.log10(s / Math.max(1, n) + 1e-30); };
  const r1 = await vvRenderAudio({range: {a: 0, b: 2}}), db1 = rms(r1.ch, 0, r1.n), c1 = r1.ch.map(d => d.slice());
  const r2 = await vvRenderAudio({range: {a: 0, b: 2}}); let diff = 0; for (let ch = 0; ch < 2; ch++) for (let i = 0; i < Math.min(c1[ch].length, r2.ch[ch].length); i++) diff = Math.max(diff, Math.abs(c1[ch][i] - r2.ch[ch][i]));
  const g = await ggbRender({range: {a: 0, b: 2}}), dv = new DataView(g.bytes.buffer || g.bytes); let gs = 0, gn = 0;
  for (let o = 44; o + 2 <= dv.byteLength; o += 2) { const v = dv.getInt16(o, true) / 32768; gs += v * v; gn++; }
  const liveOk = BMX.ctx === AU.ctx && BMX.st === 'ready' && AU.synth[t] && AU.synth[t].bm && !AU.synth[t].dead;
  return {wk: r1.wk, videoDb: +db1.toFixed(1), bitgleich: diff, ggbDb: +(10 * Math.log10(gs / Math.max(1, gn) + 1e-30)).toFixed(1), ggbN: gn, liveOk};
});
ok('Video-Render enthält Bit Mask (hörbar) und ist zweimal bitgleich', vid.wk && vid.videoDb > -45 && vid.bitgleich === 0, vid);
ok('GarageBand-Instrumental enthält Bit Mask', vid.ggbDb > -45 && vid.ggbN > 48000, vid);
ok('nach dem Render spielt live wieder der Live-Knoten', vid.liveOk, vid);
// 3) Speichern → Laden: Projektdatei rund, Klang und Kurve gleich
const st = await p.evaluate(async () => {
  const t = synthTracks()[0], f = JSON.stringify(projectFileObj(S, true, false)), bm0 = JSON.stringify(sndOf(t).p.bm), cv0 = JSON.stringify(S.tracks[t].clips[0].cv);
  const r = SQStore.parseFile(f); applyProject(normalizeProject(r.project), {});
  await new Promise(r => setTimeout(r, 300));
  return {bm: JSON.stringify(sndOf(t).p.bm) === bm0, cv: JSON.stringify(S.tracks[t].clips[0].cv) === cv0, again: JSON.stringify(projectFileObj(S, true, false)).length === f.length, name: sndOf(t).name, hc: SYNQUENZER.undoRedoCheck()};
});
ok('Speichern → Laden: Bit-Mask-Klang und Kurven deep-equal', st.bm && st.cv && st.again, st);
ok('Konsole ohne Fehler', !errs.length, errs.slice(0, 4));
await b.close(); const f = R.filter(x => !x.ok).length; console.log(`\n${R.length - f}/${R.length} OK`); process.exit(f ? 1 : 0);
