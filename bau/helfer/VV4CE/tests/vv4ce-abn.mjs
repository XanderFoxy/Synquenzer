// VV4CE Abnahme (Konzept 2.3 VV4-01/02/03/08/09 + Ton): Song mit Melodie-Clip (Synth 3, LFO 1 → Cutoff), FM-Clip ohne Modulation
// (Synth 2) und Drum-Clips; Render, dann Einzelbilder über die Zeichner (vv4Probe) und das fertige Video (ffmpeg-Bilder gegen vvShot).
// Aufruf: node vv4ce-abn.mjs   (APP=… für eine andere Datei, OUT=… für die Ausgaben)
import { open, ok, summary, OUT } from './lib.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
fs.mkdirSync(OUT, {recursive: true});
const {b, p, errs} = await open();
const SONG = {bars: 8, lanes: [[], [{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [], [{bar: 0, slot: 0}, {bar: 4, slot: 1}], []], carrier: [], mel: {},
  marks: [{id: 'm1', a: 0, len: 4, name: 'Strophe'}, {id: 'm2', a: 4, len: 4, name: 'Refrain'}]};
await p.evaluate(s => { S.bpm = 120; SYNQUENZER.setSong(s); }, SONG);
const r = await p.evaluate(() => SYNQUENZER.vvRender({}));
ok('render', r && r.dur > 15, {dur: r && r.dur, peak: r && +r.peak.toFixed(3)});
ok('Ton im Render (Spitze > −60 dBFS)', r.peak > 0.001, r.peak);
const spb = 0.5;
// ---- VV4-08 Piano-Roll: Noten = clip.notes (Anzahl, Lage ±1 px) an 10 Zeitpunkten, klingende Noten umrandet (= Notenlog) ----
const clip = await p.evaluate(() => JSON.parse(JSON.stringify(S.tracks[2].clips[0])));
const log2 = await p.evaluate(() => SYNQUENZER.vv3Notes(2));
let rollOk = 0, rollN = 0, frameOk = 0; const rollBad = [];
for (let k = 0; k < 10; k++) {
  const t = 0.37 + k * 1.43;
  const pr = await p.evaluate(([t]) => SYNQUENZER.vv4Probe('roll', 2, t, '16:9'), [t]);
  const R_ = pr.roll, L = clip.len * 4, pb = ((t / spb) % L + L) % L;
  const exp = clip.notes.filter(n => n.t < L && n.t + n.d > R_.x0 && n.t < R_.x0 + R_.pw);
  let good = Math.abs(R_.pb - pb) < 1e-6 && R_.rows.length === exp.length;
  for (const n of exp) { const q = R_.rows.find(o => o.n === n.n && Math.abs(o.t - n.t) < 1e-9); const ex = R_.gx + (n.t - R_.x0) * R_.ppb, ey = R_.gy + (R_.hi - n.n) * R_.rh;
    if (!q || Math.abs(q.x - ex) > 1 || Math.abs(q.y - ey) > 1) good = false; }
  // sounding = in the note log at t (a ≤ t < note off): the framed notes are exactly those pitches
  const snd = new Set(log2.filter(o => !o.removed && o.a <= t + 1e-6 && t < o.a + (o.d || 0) - 1e-6).map(o => o.n)), fr = new Set(R_.rows.filter(o => o.on).map(o => o.n));
  const same = [...snd].every(x => fr.has(x)) && [...fr].every(x => snd.has(x));
  rollN++; if (good) rollOk++; if (same) frameOk++; if (!good || !same) rollBad.push({t, good, snd: [...snd], fr: [...fr]});
  if (k === 3) fs.writeFileSync(OUT + '/roll-16x9.png', Buffer.from(await p.evaluate(([t]) => SYNQUENZER.vv4Png('roll', 2, t, '16:9'), [t]), 'base64'));
}
ok('VV4-08 Noten = clip.notes (Anzahl, Lage ±1 px), 10 Zeitpunkte', rollOk === rollN, rollOk + '/' + rollN);
ok('VV4-08 umrandet = klingend laut Notenlog', frameOk === rollN, rollBad.length ? rollBad.slice(0, 3) : frameOk + '/' + rollN);
// ---- VV4-09 Drum-Sequenzer: 4 Takte bei 120 BPM Bild für Bild ----
const D = await p.evaluate(() => { const L = SYNQUENZER.vv3Notes(4), F = []; for (let f = 0; f < 8 * 30; f++) { const pr = SYNQUENZER.vv4Probe('drum', 4, f / 30, '16:9'); F.push({t: f / 30, v: pr.drum.voice, ms: pr.drum.main.step, hs: pr.drum.hh.step, hf: pr.drum.hh.flash, mid: pr.drum.main.id, hid: pr.drum.hh.id}); } return {L, F}; });
// the step of a hit: its 16th in the clip (clip start = bar 0 / 4; both clips 1 bar)
const stepOf = a => Math.round(a / spb / .25) % 16;
let stOk = 0, stN = 0; const stBad = [];
for (const h of D.L) { if (h.removed || h.a < 0 || h.a > 8) continue; const f = D.F[Math.ceil(h.a * 30 - 1e-6)]; if (!f) continue; stN++; const s = stepOf(h.a), g = f.ms === s && f.hs === s; if (g) stOk++; else stBad.push({a: h.a, n: h.n, s, ms: f.ms, hs: f.hs}); }
ok('VV4-09 leuchtender Schritt = Schritt im Notenlog (alle Treffer, 4 Takte)', stN > 20 && stOk === stN, stBad.length ? stBad.slice(0, 4) : stOk + '/' + stN);
let chg = 0, chgBad = []; const perBeat = {};
for (let k = 1; k < D.F.length; k++) { const a = D.F[k - 1], c = D.F[k]; if (a.v === c.v) continue; chg++;
  const hit = D.L.some(h => !h.removed && h.a > a.t + 1e-6 && h.a <= c.t + 1e-6 && h.n === (c.v === 'kick' ? 36 : 38));
  const beat = Math.floor(c.t / spb - 1e-6); perBeat[beat] = (perBeat[beat] || 0) + 1; if (!hit) chgBad.push({t: c.t, v: c.v}); }
ok('VV4-09 Kick/Snare wechseln nur bei einem Treffer', chg > 0 && !chgBad.length, {wechsel: chg, ohneTreffer: chgBad.slice(0, 3)});
ok('VV4-09 höchstens 1 Wechsel je Schlag', Object.values(perBeat).every(n => n <= 1), perBeat);
const hhIds = new Set(D.F.map(f => f.hid)), hhGm = [...hhIds][0] === 'hatO' ? 46 : 42;
let hfOk = 0, hfN = 0; for (const h of D.L) { if (h.removed || h.n !== hhGm || h.a < 0 || h.a > 8) continue; hfN++; const f = D.F[Math.ceil(h.a * 30 - 1e-6)]; if (f && f.hf > 0) hfOk++; }
ok('VV4-09 Hi-Hat-Zeile leuchtet bei jedem Treffer (±1 Bild)', hfN > 4 && hfOk === hfN, hfOk + '/' + hfN + ' ' + [...hhIds]);
fs.writeFileSync(OUT + '/drum-16x9.png', Buffer.from(await p.evaluate(() => SYNQUENZER.vv4Png('drum', 4, 2.26, '16:9')), 'base64'));
fs.writeFileSync(OUT + '/drum-9x16.png', Buffer.from(await p.evaluate(() => SYNQUENZER.vv4Png('drum', 4, 2.26, '9:16')), 'base64'));
// ---- VV4-E: Modulation nur bei Spur mit echter Modulation ----
const hm = await p.evaluate(() => [0, 1, 2, 4].map(i => [i, SYNQUENZER.vv4HasMod(i), SYNQUENZER.vv4SpurKind(i)]));
ok('Modulation: Synth 2 (FM, keine Modulation) = nein, Synth 3 (LFO 1 → Cutoff) = ja, Drums = nein', !hm[1][1] && hm[2][1] && !hm[3][1] && hm[1][2] === 'roll' && hm[2][2] === 'roll+mod' && hm[3][2] === 'drum', hm);
const noMod = await p.evaluate(() => { const o = []; for (let k = 0; k < 8; k++) { const pr = SYNQUENZER.vv4Probe('spur', 1, .3 + k * 1.9, '16:9'); o.push(!!pr.mod || pr.els.some(e => /Regler|Mod-Ring|Live-Punkt/.test(e.el))); } return o; });
ok('VV4-01 Spur ohne Modulation: kein Regler im Bild (8 Zeitpunkte)', noMod.every(x => !x), noMod);
const setMod = await p.evaluate(() => [SYNQUENZER.vvDirSet(0, 2, 'mod', 1), SYNQUENZER.vvDirSet(2, 4, 'mod', 2), SYNQUENZER.vvDirGet()]);
ok('Wahl [Modulation] nur bei echter Modulation (Synth 2 abgelehnt, Synth 3 gesetzt, 1 Eintrag)', setMod[0] === false && setMod[1] === true && JSON.stringify(setMod[2]) === JSON.stringify([{a: 2, b: 4, v: 'mod', t: 2}]), setMod);
// VV4-02: LFO 1 → Cutoff: the live dot follows the LFO phase ±2° (the phase from VV3's maths, vv3Probe)
const lf = await p.evaluate(() => { const s = sndOf(2), m = s.mods.find(x => x.src === 'lfo1' && x.dst === 'cutoff'), o = [];
  for (let k = 0; k < 24; k++) { const t = .11 + k * .37, pr = SYNQUENZER.vv4Probe('mod', 2, t, '16:9'), kn = pr.mod.knobs.find(x => x.dst === 'cutoff'), v3 = SYNQUENZER.vv3Probe(2, t, '16:9');
    const sh = s.p.l1shape | 0, ph = v3.ph1, lv = sh === 0 ? Math.sin(2 * Math.PI * ph) : sh === 1 ? (ph < .5 ? 4 * ph - 1 : 3 - 4 * ph) : sh === 2 ? 2 * ph - 1 : (ph < .5 ? 1 : -1);
    const fd = +s.p.l1fade || 0, exp = Math.max(0, Math.min(1, kn.n + m.amt / ringK('cutoff') * lv * (fd > 0 ? 1 : 1)));
    o.push({t, dot: kn.dot, exp, deg: Math.abs(kn.dot - exp) * 270, fade: fd}); } return o; });
const maxDeg = Math.max(...lf.map(x => x.deg)), moved = new Set(lf.map(x => x.dot.toFixed(3))).size;
ok('VV4-02 Mod-Ring-Punkt folgt der LFO-Phase ±2°', maxDeg <= 2 && moved > 10, {maxDeg: +maxDeg.toFixed(3), verschieden: moved, fade: lf[0].fade});
const mp = await p.evaluate(() => SYNQUENZER.vv4Probe('mod', 2, 3.3, '16:9'));
const k1 = await p.evaluate(() => k1Mods(2).map(e => e.src + ' → ' + e.dst));
ok('K1-Übersicht im Bild = k1Mods der Spur (Reihenfolge)', mp.mod.rows.length > 0 && mp.mod.rows.every((r_, k) => r_.src + ' → ' + r_.dst === k1[k]), mp.mod.rows.map(r_ => r_.src + ' → ' + r_.dst));
fs.writeFileSync(OUT + '/mod-16x9.png', Buffer.from(await p.evaluate(() => SYNQUENZER.vv4Png('mod', 2, 3.3, '16:9')), 'base64'));
fs.writeFileSync(OUT + '/spur-mod-9x16.png', Buffer.from(await p.evaluate(() => SYNQUENZER.vv4Png('spur', 2, 3.3, '9:16')), 'base64'));
fs.writeFileSync(OUT + '/spur-fm-16x9.png', Buffer.from(await p.evaluate(() => SYNQUENZER.vv4Png('spur', 1, 3.3, '16:9')), 'base64'));
// ---- VV4-03 Sonde: jedes gezeichnete Element hat ein App-Gegenstück, kein Oszilloskop / Filterkurve / PEGEL-Folger ----
const els = await p.evaluate(() => { const o = []; for (const [k, i] of [['roll', 2], ['drum', 4], ['mod', 2], ['spur', 2], ['spur', 1], ['spur', 4]]) for (const t of [.5, 3.1, 6.7]) o.push(...SYNQUENZER.vv4Probe(k, i, t, '9:16').els); return o; });
ok('VV4-03 Sonde: 0 Elemente ohne App-Gegenstück', els.length > 10 && els.every(e => e.app && e.app.length > 2) && !els.some(e => /Oszillo|Filterkurve|PEGEL/i.test(e.el)), [...new Set(els.map(e => e.el))]);
// ---- das fertige Video: Ton, und Bilder = Zeichner (Spur-Bild Takt 3–4 = Modulation Synth 3, Auto sonst) ----
await p.evaluate(() => { SYNQUENZER.vvPrefs({fmt: '16:9', view: 'auto', cam: 'kamera'}); });
// first the way of this browser without AAC (MediaRecorder, real time, as the iPhone without AudioEncoder): sound in the file
const path_ = await p.evaluate(() => SYNQUENZER.vvPath('16:9'));
const m = await p.evaluate(() => SYNQUENZER.vvMake({}));
ok('Video erstellt (' + (path_ && path_.how) + ')', m && m.ext && !m.err, {ext: m && m.ext, how: path_ && path_.how, aChk: m && m.aChk});
const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = OUT + '/vv4ce.' + bl.ext; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
const vd = execSync(`ffmpeg -v info -i ${f} -af volumedetect -vn -f null - 2>&1 | grep -E "max_volume|Audio:" || true`).toString();
const mx = /max_volume: (-?[\d.]+) dB/.exec(vd);
ok('Ton in der Datei (max_volume > −60 dB)', mx && +mx[1] > -60, mx ? mx[1] + ' dB' : vd.slice(0, 200));
// then the WebCodecs way (Opus, test only) for an exact picture comparison (VP8 of the recorder is too coarse for it)
await p.evaluate(() => SYNQUENZER.vvTest({opus: true}));
const m2 = await p.evaluate(() => SYNQUENZER.vvMake({}));
ok('Video erstellt (WebCodecs, Opus)', m2 && m2.ext === 'mp4', {ext: m2 && m2.ext, aChk: m2 && m2.aChk});
const bl2 = await p.evaluate(() => SYNQUENZER.vvBlob()); const f2 = OUT + '/vv4ce-wc.mp4'; fs.writeFileSync(f2, Buffer.from(bl2.b64, 'base64'));
const raw = (src, out, t) => { execSync(`ffmpeg -v error -y -i ${src} ${t != null ? '-vf "select=eq(n\\,' + Math.round(t * 30) + ')"' : ''} -frames:v 1 -f rawvideo -pix_fmt rgb24 ${out}`); return fs.readFileSync(out); };
const diff = (x, y) => { let s = 0, n = 0; for (let k = 0; k < Math.min(x.length, y.length); k += 12) { s += Math.abs(x[k] - y[k]); n++; } return +(s / n).toFixed(2); };
const frames = [];
for (const [t, want, alt] of [[5.0, 'mod:2', 'spur:2'], [6.4, 'mod:2', 'song']]) {
  const fr = raw(f2, OUT + '/f.raw', t), d = {};
  for (const v of [want, alt]) { fs.writeFileSync(OUT + '/ref.png', Buffer.from(await p.evaluate(([t, v]) => SYNQUENZER.vvShot(t, v, '16:9', 'kamera'), [t, v]), 'base64')); d[v] = diff(fr, raw(OUT + '/ref.png', OUT + '/ref.raw')); }
  frames.push({t, d, ok: d[want] < d[alt] && d[want] < 8});
  execSync(`ffmpeg -v error -y -ss ${t.toFixed(3)} -i ${f2} -frames:v 1 -vf scale=960:540 ${OUT}/video-t${t}.png`);
}
ok('Video-Bild Takt 3–4 = Modulation-Bild (Bildvergleich)', frames.every(x => x.ok), frames);
ok('keine Konsolenfehler', !errs.length, errs.slice(0, 5));
console.log(JSON.stringify(summary()));
await b.close();
process.exit(summary().fails ? 1 : 0);
