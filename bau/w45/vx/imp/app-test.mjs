// IMP1-Test im Browser: die App rendert eigene Demo-Songs (Offline-Render vvRenderAudio) bei bekanntem Tempo/Taktart/Teilen →
// window.__imp1.analyse (Worker) muss Tempo ±1 BPM, Taktart, erste 1 und Teil-Grenzen ±1 Takt treffen; Melodie allein (Silben-Ersatz) → Tempo oder ½×/2×.
// Aufruf: node app-test.mjs <index.html> [fall …]   Fälle: "92 4/4", "120 3/4", "120 6/8", "m96" (nur Melodie)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
const file = path.resolve(process.argv[2]), cases = process.argv.length > 3 ? process.argv.slice(3) : ['92 4/4', '120 3/4', '120 6/8', 'm96'];
const b = await chromium.launch();
let bad = 0;
for (const c of cases) {
  const p = await b.newPage({viewport: {width: 428, height: 926}}), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  if (process.env.DUMP) await p.evaluate(() => { window.__dump = 1; });
  const r = await p.evaluate(async c => {
    const mel = c[0] === 'm', bpm = mel ? +c.slice(1) : +c.split(' ')[0], ts = mel ? '4/4' : c.split(' ')[1];
    setBpm(bpm); S.ts = tsNorm(ts); tkBump();
    const q = tsBeats(S.ts), six = ts === '6/8';
    for (const tr of S.tracks) for (let s = 0; s < tr.clips.length; s++) tr.clips[s] = null;
    const CH = {Am: [57, 60, 64], F: [53, 57, 60], C: [48, 52, 55], G: [55, 59, 62], Dm: [50, 53, 57], Em: [52, 55, 59]};
    const mk = (t, kind, len, notes) => { const cl = normClip({len, key: Object.assign({}, S.key, {src: 'auto'}), notes, ts: S.ts || undefined}, kind, S.key); if (S.ts) cl.ts = S.ts; return cl; };
    const pad = prog => prog.flatMap((ch, j) => CH[ch].map(n => ({t: j * q, d: q - .1, n: n + 12, v: .6})));
    const bass = prog => prog.flatMap((ch, j) => { const o = []; const st = six ? 1.5 : 1; for (let h = 0; h < q - 1e-9; h += st) o.push({t: j * q + h, d: st * .8, n: CH[ch][0] - 12, v: .9}); return o; });
    const drums = (lv, hatOnly) => { const o = []; const K = ts === '4/4' ? [0, 2] : [0], Sn = ts === '4/4' ? [1, 3] : ts === '3/4' ? [1, 2] : [1.5];
      if (!hatOnly) { for (const k of K) o.push({t: k, d: .1, n: 36, v: .95}); for (const k of Sn) o.push({t: k, d: .1, n: 38, v: .85 * lv}); }
      for (let h = 0; h < q - 1e-9; h += .5) o.push({t: h, d: .1, n: 42, v: .5 * lv}); return o; };
    const arp = prog => prog.flatMap((ch, j) => { const o = []; for (let h = 0; h < q - 1e-9; h += .5) o.push({t: j * q + h, d: .4, n: CH[ch][(h * 2) % 3] + 24, v: .7}); return o; });
    const V = ['Am', 'F', 'C', 'G'], C2 = ['F', 'G', 'C', 'Am'], BR = ['Dm', 'Em', 'F', 'G'];
    let sec;
    if (mel) {
      // nur Melodie (Silben-Ersatz): kurze Töne auf Vierteln/Achteln, Atempausen, keine Drums/kein Bass
      const pat = [[0, 1, 1.5, 2, 3], [0, .5, 1, 2, 2.5, 3.5], [0, 1, 2, 3], []], notes = [];
      for (let bar = 0; bar < 4; bar++) for (const h of pat[bar]) notes.push({t: bar * 4 + h, d: .35, n: 64 + ((bar * 3 + h * 2) % 7), v: .8});
      S.tracks[5].clips[0] = mk(5, 'synth', 4, notes); clipChanged(5, 0);
      sec = [[0, 16]];
    } else {
      const put = (t, s, kind, len, notes) => { S.tracks[t].clips[s] = mk(t, kind, len, notes); clipChanged(t, s); };
      put(2, 0, 'synth', 1, pad(['Am'])); put(4, 0, 'drum', 1, drums(.5, true));
      put(0, 1, 'synth', 4, bass(V)); put(2, 1, 'synth', 4, pad(V)); put(4, 1, 'drum', 1, drums(.7));
      put(0, 2, 'synth', 4, bass(C2)); put(2, 2, 'synth', 4, pad(C2)); put(4, 2, 'drum', 1, drums(1)); put(1, 2, 'synth', 4, arp(C2));
      put(0, 3, 'synth', 4, bass(BR)); put(2, 3, 'synth', 4, pad(BR)); put(4, 3, 'drum', 1, drums(.8));
      put(2, 4, 'synth', 2, pad(['Am', 'G']));
      sec = [[0, 4], [1, 8], [2, 8], [1, 8], [2, 8], [3, 8], [2, 8], [4, 4]];
    }
    let bar = 0; const lanes = S.tracks.map(() => []), truth = [];
    for (const [s, n] of sec) { truth.push(bar); S.tracks.forEach((tr, t) => lanes[t].push({bar, slot: tr.clips[s] ? s : -1})); bar += n; }
    S.song = normSong({bars: bar, lanes}, S.key); songChanged();
    const T0 = performance.now(), rr = await vvRenderAudio({range: {a: 0, b: bar}}), msR = performance.now() - T0;
    const n = rr.ch[0].length, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = (rr.ch[0][i] + rr.ch[1][i]) / 2;
    const T1 = performance.now(), a = await window.__imp1.analyse(x, rr.sr, {}), msA = performance.now() - T1;
    let dump = null; if (window.__dump) { const D = window.__imp1.core().down(x, rr.sr); const u = new Uint8Array(D.y.buffer); let bs = ''; for (let i = 0; i < u.length; i += 32768) bs += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); dump = {fs: D.fs, b64: btoa(bs)}; }
    return {dump, start: a.start, bpm, ts, truth, lead: rr.lead || 0, sr: rr.sr, dur: +rr.dur.toFixed(2), msR: Math.round(msR), msA: Math.round(msA), a: {bpm: a.bpm, bpmRoh: a.bpmRoh, ts: a.ts, t1: a.t1, takt: a.takt, alt: a.alt, quelle: a.quelle, frage: a.frage, stabil: a.stabil, worker: a.worker, teile: a.teile.map(t => t.name + '@' + t.a)}};
  }, c);
  const barSec = r.a.takt, t1Bars = (r.a.t1 - r.lead) / (tsBarSec(r.bpm, r.ts));
  function tsBarSec(bpm, ts) { return ({'4/4': 4, '3/4': 3, '6/8': 3, '2/4': 2, '12/8': 6})[ts] * 60 / bpm; }
  let ok;
  if (c[0] === 'm') ok = (Math.abs(r.a.bpm - r.bpm) <= 1 || r.a.alt.some(v => Math.abs(v - r.bpm) <= 1)) && r.a.frage;
  else {
    const off = Math.round(t1Bars), det = r.a.teile.map(s => +s.split('@')[1] + off), miss = r.truth.filter(a => !det.some(d => Math.abs(d - a) <= 1)), extra = det.filter(d => !r.truth.some(a => Math.abs(d - a) <= 1));
    ok = Math.abs(r.a.bpm - r.bpm) <= 1 && r.a.ts === r.ts && Math.abs(t1Bars) < .1 && !miss.length && !extra.length;
    r.miss = miss; r.extra = extra;
  }
  if (r.dump) { fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'dump-' + c.replace(/[^0-9a-z]/gi, '_') + '.json'), JSON.stringify({fs: r.dump.fs, b64: r.dump.b64, truth: r.truth, bpm: r.bpm, ts: r.ts, lead: r.lead})); delete r.dump; }
  r.t1Takte = +t1Bars.toFixed(3); r.errs = errs.slice(0, 3);
  if (!ok || errs.length) bad++;
  console.log((ok && !errs.length ? 'OK ' : 'FEHLER ') + c + ' ' + JSON.stringify(r));
  await p.close();
}
await b.close();
console.log(bad ? 'FEHLER ' + bad : 'ALLE OK');
