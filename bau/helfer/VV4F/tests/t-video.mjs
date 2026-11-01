// VV4-F Video: Ausgabe bit-gleich mit/ohne Meter (Offline-Render), Meter-Fenster vollständig, Balken = Offline-RMS je Bild ±1 dB
// (VV4-12), zeitgenau (Spur setzt ein / stumm), Video-Bilder (Song + Matrix) zeigen die Balken, fertiges MP4 zeigt sie auch.
import { open, OUT, SONG8, check, summary } from './lib.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const {b, p, errs} = await open({w: 428, h: 926});
await p.evaluate(s => SYNQUENZER.setSong(s), SONG8);
// the sound has random parts (S&H, analog drift seeds: Math.random in the worklet and the main thread): for the bit comparison
// every render starts from the same seed (test only: the worklet text gets a seeded Math.random in front, the page too)
await p.evaluate(() => { const el = document.getElementById('sq-worklet-src'); window._wsrc = el.textContent;
  el.textContent = '(function(){var s=12345;Math.random=function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};})();\n' + window._wsrc;
  window._seed = () => { let s = 777; Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }; });
// (1) Bit-Gleichheit am echten Offline-Graphen der App (vvSwapIn: Master mit Kompressoren/Begrenzer/Decke, Spurketten mit Drive/
// Chorus/Sends, Hall-Worklet, Echo, Synth-Knoten) mit festen Quellen statt Noten, einmal ohne, einmal mit Meter.
// Chromium summiert ab 3 klingenden Eingängen eines Knotens in wechselnder Reihenfolge (Rundung ≈ −110 dB, auch in der Basis
// R-4261, probe-sum.mjs): (a) zwei klingende Spuren ohne Sends = reproduzierbar → muss bit-gleich sein; (b) alle Spuren mit Hall/
// Echo: mit/ohne Meter darf nicht weiter auseinander liegen als ohne/ohne.
const graph = (noMtr, mode) => p.evaluate(async ([nm, mode]) => {
  window._seed(); const lc = AU.ctx, sr = lc.sampleRate, oc = new OfflineAudioContext(2, Math.round(sr * 4), sr);
  await vvAddModule(oc); const off = {oc, sv: null}; VV.noMtr = nm; VV.off = off; UI.vvOff = true;
  try {
    await vvSwapIn(oc, true, off);
    for (let i = 0; i < NT(); i++) {
      if (mode === 'zwei' && i !== 0 && i !== DRUM_T) continue;
      if (mode === 'zwei') { AU.tracks[i].revSend.gain.value = 0; AU.tracks[i].dlySend.gain.value = 0; }
      const o = oc.createOscillator(), g = oc.createGain(); o.type = ['sawtooth', 'square', 'triangle', 'sine'][i % 4]; o.frequency.value = 55 * (i + 2) + i * 3.7;
      g.gain.setValueAtTime(0, 0); g.gain.linearRampToValueAtTime(2.5, .4 + i * .1); g.gain.setValueAtTime(2.5, 2.2); g.gain.linearRampToValueAtTime(0, 2.6);
      o.connect(g); g.connect(AU.tracks[i].trackIn); o.start(0);
    }
    const M = AU.meter; const out = await oc.startRendering();
    let h = 2166136261 >>> 0, pk = 0; for (let c = 0; c < 2; c++) { const d = out.getChannelData(c), u = new Uint32Array(d.buffer); for (let k = 0; k < u.length; k++) { h = Math.imul(h ^ u[k], 16777619) >>> 0; const v = Math.abs(d[k]); if (v > pk) pk = v; } }
    (window._G || (window._G = [])).push(out);
    return {h, pk, meter: !!M, n: M ? M.Q.cnt : 0, hall: AU.hallKind, gr: AU.M.lim.reduction, i: window._G.length - 1};
  } finally { if (off.sv) vvSwapOut(off.sv); UI.vvOff = false; VV.off = null; VV.noMtr = false; }
}, [noMtr, mode]);
const maxDiff = (i, j) => p.evaluate(([i, j]) => { const A = window._G[i], B = window._G[j]; let m = 0, nd = 0; for (let c = 0; c < 2; c++) { const x = A.getChannelData(c), y = B.getChannelData(c); for (let k = 0; k < x.length; k++) { const d = Math.abs(x[k] - y[k]); if (d > m) m = d; if (x[k] !== y[k]) nd++; } } return {db: m ? +(20 * Math.log10(m)).toFixed(1) : null, nd}; }, [i, j]);
const z0 = await graph(true, 'zwei'), z1 = await graph(true, 'zwei'), zm = await graph(false, 'zwei'), z2 = await graph(true, 'zwei');
check('(a) App-Graph, 2 Spuren, ohne Meter reproduzierbar (Grundlage)', z0.h === z1.h && z1.h === z2.h, [z0.h, z1.h, z2.h]);
const zd = await maxDiff(z1.i, zm.i);
check('(a) Ausgabe bit-gleich mit/ohne Meter (2 Spuren laut, Begrenzer arbeitet)', zm.h === z1.h && zm.meter && !z1.meter && zm.n > 1000 && zm.pk > .5 && zd.nd === 0, {ohne: z1.h, mit: zm.h, unterschiedlich: zd.nd, pk: +zm.pk.toFixed(3), fenster: zm.n, hall: zm.hall});
const f0 = await graph(true, 'alle'), f1 = await graph(true, 'alle'), fm = await graph(false, 'alle');
const dBase = await maxDiff(f0.i, f1.i), dMtr = await maxDiff(f1.i, fm.i), dMtr0 = await maxDiff(f0.i, fm.i);
const worst = x => (x.db == null ? -999 : x.db);
check('(b) alle Spuren + Hall/Echo: mit/ohne Meter nicht weiter weg als ohne/ohne (Chromium-Rundung)', Math.min(worst(dMtr), worst(dMtr0)) <= Math.max(worst(dBase), -100) && worst(dMtr) < -100, {ohneOhne: dBase, mitOhne: dMtr, mitOhne2: dMtr0, pk: +fm.pk.toFixed(3)});
await p.evaluate(() => { window._G = null; });
// (2) the song render: the meter windows are complete and in step with the sound
const render = () => p.evaluate(async () => { const r0 = await SYNQUENZER.vvRender({}); const r = VV.last;
  return {n: r.n, mtr: r.mtr ? {cnt: r.mtr.Q.cnt, want: r.mtr.want, seq: r.mtr.Q.seq, lost: r.mtr.Q.lost, blocks: Math.ceil(r.buf.length / 128)} : null, off: r.off, dur: r.dur}; });
const m1 = await render();
check('Meter-Fenster im Song-Render vollständig (je 128er-Block eins, keine verloren)', m1.mtr && m1.mtr.cnt === m1.mtr.blocks && m1.mtr.seq === m1.mtr.want && m1.mtr.lost === 0, m1.mtr);
// VV4-12: master bar = offline RMS of the picture (1/30 s up to the picture time) ±1 dB, at 10+ pictures with sound
const v12 = await p.evaluate(() => {
  const r = VV.last, sr = r.sr, rows = [], cv = document.createElement('canvas'); cv.width = 640; cv.height = 360; const g = cv.getContext('2d');
  for (let f = 15; f < r.dur * 30 - 30; f += 23) {
    const t = f / 30, st = vvStateAt(r, t); vvDrawSong(g, 640, 360, st); const pr = VV.mtrProbe, m = pr.find(x => x.k === MAX_T);
    const a = Math.max(0, Math.round((t - 1 / 30) * sr)), e = Math.round(t * sr); let s = 0; for (let k = a; k < e; k++) s += (r.ch[0][k] * r.ch[0][k] + r.ch[1][k] * r.ch[1][k]) / 2;
    const off = 10 * Math.log10(s / Math.max(1, e - a) + 1e-20);
    rows.push({t: +t.toFixed(3), bar: +m.rms.toFixed(2), off: +off.toFixed(2), d: +(m.rms - off).toFixed(2)});
  }
  return rows;
});
const loud = v12.filter(x => x.off > -50);
check(`VV4-12 Master-Balken = Offline-RMS je Bild ±1 dB (${loud.length} Bilder)`, loud.length >= 10 && loud.every(x => Math.abs(x.d) <= 1), {max: Math.max(...loud.map(x => Math.abs(x.d))), bsp: loud.slice(0, 4)});
// zeitgenau: Spur 3 (Index 2) spielt ab Takt 3 bis Takt 6 (SONG8 lanes[2]); Spur 4 (Index 3) ist leer
const tz = await p.evaluate(() => {
  const r = VV.last, spb = 60 / r.bpm, cv = document.createElement('canvas'); cv.width = 640; cv.height = 360; const g = cv.getContext('2d'), L = [];
  for (let f = 0; f < r.dur * 30; f++) { vvDrawSong(g, 640, 360, vvStateAt(r, f / 30)); const pr = VV.mtrProbe; L.push([f / 30, pr.find(x => x.k === 2).rms, pr.find(x => x.k === 3).rms, pr.find(x => x.k === 0).rms]); }
  const on = L.find(x => x[1] > -70), offT = L.slice().reverse().find(x => x[1] > -70 && x[0] < 6 * 4 * spb + 2);
  return {t2: 2 * 4 * spb, t6: 6 * 4 * spb, on: on && on[0], empty3: L.every(x => x[2] <= -100), s1: L.filter(x => x[3] > -70).length, n: L.length, log: r.log && r.log.filter ? r.log.filter(e => e.i === 2 || e.t === 2).slice(0, 3) : null};
});
check('Spur 3 setzt im Video zur Zeit ihres Einsatzes ein (Takt 3, ±2 Bilder)', tz.on != null && tz.on >= tz.t2 - 1e-6 && tz.on - tz.t2 <= 2 / 30 + .02, {soll: +tz.t2.toFixed(3), ist: tz.on && +tz.on.toFixed(3)});
check('Leere Spur 4 bleibt im ganzen Video leer', tz.empty3);
check('Spur 1 spielt im Video (Pegel in ≥ 20 % der Bilder)', tz.s1 > tz.n * .2, tz.s1 + '/' + tz.n);
// Bilder: Song und Matrix (16:9 und 9:16) zeigen grüne Balken an den Stellen der Sonde
const pix = await p.evaluate(async () => {
  const out = [];
  for (const [view, fmt] of [['song', '16:9'], ['matrix', '16:9'], ['song', '9:16'], ['matrix', '9:16']]) {
    const t = 4.0, b64 = SYNQUENZER.vvShot(t, view, fmt, 'ganz'), probe = VV.mtrProbe.slice();
    const img = new Image(); await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const D = g.getImageData(0, 0, c.width, c.height).data;
    const green = (x, y) => { const i = (Math.round(y) * c.width + Math.round(x)) * 4; return D[i + 1] > 150 && D[i] < 120 && D[i + 2] < 160; };
    let found = 0, lit = probe.filter(q => q.rms > -40);
    // the probe is in app points: search the picture for green columns of that bar's shape (scale unknown in the camera: search all)
    let gp = 0; for (let k = 0; k < D.length; k += 4) if (D[k + 1] > 190 && D[k] > 40 && D[k] < 70 && D[k + 2] > 110 && D[k + 2] < 140) gp++;
    out.push({view, fmt, lit: lit.length, bars: probe.length, greenPx: gp});
    const a = document.createElement('a'); window['_shot_' + view + fmt.replace(':', 'x')] = b64;
  }
  return out;
});
for (const x of pix) check(`Video-Bild ${x.view} ${x.fmt}: Balken gezeichnet (Sonde ${x.bars}, mit Pegel ${x.lit}, grüne Pixel ${x.greenPx})`, x.bars >= 6 && x.lit >= 2 && x.greenPx > 20, x);
for (const k of ['song16x9', 'matrix16x9', 'song9x16', 'matrix9x16']) fs.writeFileSync(`${OUT}/video-${k}.png`, Buffer.from(await p.evaluate(k => window['_shot_' + k], k), 'base64'));
// das fertige MP4 (16:9, Takte 1–4 Song, 5–8 Matrix): die Balken sind im kodierten Bild
await p.evaluate(() => { SYNQUENZER.vvDirSet(0, 4, 'song'); SYNQUENZER.vvDirSet(4, 8, 'matrix'); SYNQUENZER.vvTest({opus: true}); SYNQUENZER.vvPrefs({fmt: '16:9', view: 'auto', cam: 'ganz'}); });
await p.evaluate(() => { document.getElementById('sq-worklet-src').textContent = window._wsrc; });
const mk = await p.evaluate(() => SYNQUENZER.vvMake({}));
const bl = await p.evaluate(() => SYNQUENZER.vvBlob());
if (bl) {
  fs.writeFileSync(`${OUT}/vv4f.mp4`, Buffer.from(bl.b64, 'base64'));
  const spb = 60 / (await p.evaluate(() => S.bpm));
  for (const [nm, t] of [['song', 2 * 4 * spb + 1], ['matrix', 5 * 4 * spb + 1]]) execSync(`ffmpeg -v error -y -i ${OUT}/vv4f.mp4 -vf "select=eq(n\\,${Math.round(t * 30)})" -frames:v 1 ${OUT}/mp4-${nm}.png`);
  const ex = await p.evaluate(async files => { const o = {}; for (const [nm, b64] of files) { const img = new Image(); await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,' + b64; }); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    // the label column (left 1/8 of the picture): green bar pixels
    const D = g.getImageData(0, 0, Math.round(c.width / 8), c.height).data; let gp = 0; for (let k = 0; k < D.length; k += 4) if (D[k + 1] > 170 && D[k] < 110 && D[k + 2] > 90 && D[k + 2] < 170) gp++; o[nm] = gp; } return o; },
    ['song', 'matrix'].map(nm => [nm, fs.readFileSync(`${OUT}/mp4-${nm}.png`).toString('base64')]));
  check('MP4: Song-Bild zeigt Balken in der Namen-Spalte', ex.song > 30, ex);
  check('MP4: Matrix-Bild zeigt Balken in der Namen-Spalte', ex.matrix > 30, ex);
} else check('MP4 erzeugt', false, mk);
check('Keine Konsolenfehler', errs.length === 0, errs);
fs.writeFileSync(`${OUT}/t-video.json`, JSON.stringify(Object.assign(summary(), {v12}), null, 1));
await b.close();
