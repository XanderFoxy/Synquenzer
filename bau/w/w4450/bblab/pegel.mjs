// BB1: Pegel der neuen Werkzeugkasten-Klänge – trocken auf der Vorhör-Phrase (112 BPM, mkRender wie SP1), Ziel −18 LUFS, Spitze ≤ −1 dBFS
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2], song = process.argv[3] === 'song';
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 428, height: 926}});
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SQMK, null, {timeout: 60000});
await p.waitForTimeout(500);
const lv = await p.evaluate(async (song) => {
  mkLoad();
  const db = x => x > 0 ? 20 * Math.log10(x) : -999;
  function biq(x, b0, b1, b2, a1, a2) { const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; } return y; }
  const kw = x => biq(biq(x, 1.53512485958697, -2.69169618940638, 1.19839281085285, -1.69065929318241, .73248077421585), 1, -2, 1, -1.99004745483398, .99007225036621);
  function lufs(l, r, sr) { const L = kw(l), R = kw(r), N = Math.round(.4 * sr), H = Math.round(.1 * sr), z = []; for (let s = 0; s + N <= L.length; s += H) { let a = 0; for (let i = s; i < s + N; i++) a += L[i] * L[i] + R[i] * R[i]; z.push(a / N); }
    const lk = q => -.691 + 10 * Math.log10(q); let g = z.filter(q => lk(q) > -70); if (!g.length) return -999; const m1 = g.reduce((a, q) => a + q, 0) / g.length; g = g.filter(q => lk(q) > lk(m1) - 10); return lk(g.reduce((a, q) => a + q, 0) / g.length); }
  const meas = (l, r, sr) => { let pk = 0, nan = 0; for (let i = 0; i < l.length; i++) { if (!isFinite(l[i]) || !isFinite(r[i])) nan++; pk = Math.max(pk, Math.abs(l[i]), Math.abs(r[i])); } return {peak: +db(pk).toFixed(1), lufs: +lufs(l, r, sr).toFixed(2), nan}; };
  const out = [];
  for (const f of BB1_SND.list) {
    const o = {id: f.id, name: f.name, level: f.p.level};
    const snd = factorySound(f.id), ph = SQF.PREVIEW[f.demo], spb = 60 / 112, sec = SQF.PREVIEW_SEC[f.demo] + 2.5;
    const ev = []; ph.forEach(([bt, d, n, v], k) => { ev.push([bt * spb, 'on', n, v, 1000 + k]); ev.push([(bt + d) * spb, 'off', n, v, 1000 + k]); }); ev.sort((a, c) => a[0] - c[0]);
    const r = await mkRender(snd, ev, {sec, bpm: 112}); o.dry = meas(r.l, r.r, 48000);
    if (song) { await SYNQUENZER.newProject(); SYNQUENZER.setSound(0, factorySound(f.id));
      SYNQUENZER.setClip(0, 0, {len: 2, notes: ph.map(([t, d, n, v]) => ({t, d, n, v}))}); songFromChain([{scene: 0, bars: 2}]);
      await SYNQUENZER.vvRender({range: {a: 0, b: 2}}); o.song = meas(VV.last.ch[0], VV.last.ch[1], VV.last.sr); }
    o.suggest = +(f.p.level * Math.pow(10, (-18 - o.dry.lufs) / 20)).toFixed(3);
    out.push(o);
  }
  return out;
}, song);
for (const o of lv) console.log(o.name.padEnd(20), 'level', o.level, 'trocken', o.dry.lufs, 'LUFS Spitze', o.dry.peak, 'nan', o.dry.nan, '→', o.suggest, o.song ? ' Song ' + o.song.lufs + ' LUFS Spitze ' + o.song.peak : '');
console.log('errs', errs);
await b.close();
