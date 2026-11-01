// VV4-A: 9:16 [Ganze App] rendern (4 Takte), Maße, Ton, Einzelbilder, Tastatur-Transposition zur richtigen Zeit, Zeit je Videosekunde
import { open, songWithChords, saveBlob, probe, frameRaw, framePng, audioDb, report, OUT } from './lib.mjs';
const way = process.argv[2] || 'webcodecs';
const {b, p, errs} = await open();
await songWithChords(p);
const res = {way, checks: {}};
await p.evaluate(w => SYNQUENZER.vvTest(w === 'recorder' ? {noVE: true} : {opus: true}), way);
res.path = await p.evaluate(() => SYNQUENZER.vvPath('9:16'));
const m = await p.evaluate(() => SYNQUENZER.vvMake({fmt: '9:16', view: 'matrix', cam: 'app', range: {a: 0, b: 4}})   /* Stage 4.28.0: 'auto' zeigt jetzt (VV4-D) Piano-Roll/Tastatur – die Tasten-Probe braucht die ganze App */);
res.make = {how: m.how, W: m.W, H: m.H, dur: m.dur, cam: m.cam, ms: m.ms, msAudio: m.msAudio, msVideo: m.msVideo};
res.msPerVideoSec = Math.round(m.ms / m.dur); res.speed = +(m.dur * 1000 / m.ms).toFixed(2);
const f = await saveBlob(p, 'vv4a-' + way);
const pr = probe(f), vs = pr.streams.find(s => s.codec_type === 'video'), as = pr.streams.find(s => s.codec_type === 'audio');
res.probe = {v: vs && [vs.codec_name, vs.width, vs.height], a: as && [as.codec_name, as.sample_rate]};
res.audio = audioDb(f);
res.checks.groesse = !!vs && vs.width === 1080 && vs.height === 1920;
res.checks.cam = m.cam === 'app';
res.checks.ton = !!as && res.audio.peak > -40 && res.audio.sec > m.dur - .6;
// pictures: bar 2 beat 2 (Träger F), bar 3 beat 2 (G), bar 4 beat 2 (G + Teil-Transposition +2 = D)
const sp = 60 / await p.evaluate(() => S.bpm), W = 1080, H = 1920, k = W / 428;
const L = await p.evaluate(() => SYNQUENZER.vvAppLayout());
const rgb = (buf, x, y) => { const i = (Math.round(y * k) * W + Math.round(x * k)) * 3; return [buf[i], buf[i + 1], buf[i + 2]]; };
const near = (c, d, tol = 28) => Math.abs(c[0] - d[0]) <= tol && Math.abs(c[1] - d[1]) <= tol && Math.abs(c[2] - d[2]) <= tol;
// region probe: the area has drawn content (not only one colour)
const busy = (buf, R) => { const seen = new Set(); for (let y = R.y + 2; y < R.y + R.h - 2; y += 3) for (let x = R.x + 2; x < R.x + R.w - 2; x += 3) { const c = rgb(buf, x, y); seen.add(c.map(v => v >> 4).join(',')); } return seen.size; };
res.frames = [];
for (const [bar, beat] of [[0, 1], [1, 1], [2, 1], [3, 1], [3, 3]]) {
  const t = (bar * 4 + beat + .5) * sp, fi = Math.round(t * 30), tt = fi / 30;
  const buf = frameRaw(f, fi, W, H), kb = await p.evaluate(t => SYNQUENZER.vvAppKb(t), tt);
  framePng(f, fi, `vv4a-${way}-takt${bar + 1}-${beat + 1}.png`);
  // every white key: pressed (#fac46a) exactly when vvAppKb says so (app colours: lt #fac46a, in key #f5dcab…, out #bfae8c)
  const ww = L.kb.w / kb.n; let ok = 0, n = 0; const bad = [];
  for (let wi = 0, note = kb.low; wi < kb.n; note++) { const pc = ((note % 12) + 12) % 12; if ([1, 3, 6, 8, 10].includes(pc)) continue;
    const c = rgb(buf, L.kb.x + wi * ww + ww / 2, L.kb.y + L.kb.h * .8), lt = near(c, [250, 196, 106], 20), exp = kb.pressed.includes(note); n++; if (lt === exp) ok++; else bad.push([note, c, exp]); wi++; }
  const regions = {kopf: busy(buf, L.top), mitte: busy(buf, kb.sb != null ? L.grid : L.grid), teile: busy(buf, L.part), spur: busy(buf, L.strip), traeger: busy(buf, L.carrier), modus: busy(buf, L.mode), tastatur: busy(buf, L.kb)};
  res.frames.push({bar: bar + 1, beat: beat + 1, fi, sb: +kb.sb.toFixed(3), pressed: kb.pressed, target: kb.target, xp: kb.xp, keysOk: ok + '/' + n, bad, regions, readout: kb.readout});
}
const exp = [[], [65], [], [50], [50]];   // F → 65; G (67/71/74) liegt über der Tastatur C3–F4 (die App zeigt dort auch nichts); +2 → D (50)
res.frames.forEach((x, j) => { res.checks['tasten-takt' + x.bar + '.' + x.beat] = x.keysOk.split('/')[0] === x.keysOk.split('/')[1] && JSON.stringify(x.pressed) === JSON.stringify(exp[j]); });
res.checks.bereiche = res.frames.every(x => Object.values(x.regions).every(v => v >= 3));
res.checks.konsole = errs.length === 0; res.errs = errs;
const bad = report('vv4a-render-' + way, res);
console.log(JSON.stringify({make: res.make, msPerVideoSec: res.msPerVideoSec, speed: res.speed, probe: res.probe, audio: res.audio, frames: res.frames.map(x => [x.bar + '.' + x.beat, x.pressed, x.keysOk, x.readout.val + ' ' + x.readout.shift, JSON.stringify(x.regions)])}));
await b.close(); process.exit(bad ? 1 : 0);
