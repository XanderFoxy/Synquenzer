// K2 in the app: INIT FM -> setFmx with n outputs (FELD), render through the app worklet (OfflineAudioContext), per-op envelope (Goertzel) vs op alone
import { chromium } from 'playwright';
const FILE = process.argv[2] || new URL('../index.html', import.meta.url).pathname;
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 390, height: 844}});
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + FILE); await p.waitForTimeout(2500);
const res = await p.evaluate(async () => {
  const S = window.SYNQUENZER; S.initSound(1);
  const base = S.fmxFromFm6(S.getSound(1).p.fm6);
  const mk = (n, only, kind) => { const x = JSON.parse(JSON.stringify(base));
    x.edges = kind === 'chain' ? [[2, 1], [3, 2], [4, 3], [5, 4], [6, 5]].filter(e => e[0] <= n).map(([a, b]) => ({from: a, to: b})) : [];
    x.ops.forEach((o, k) => { o.coarse = k + 1; o.ol = k < n && (only == null || only === k) ? 90 : 0; o.c = k; o.r = 0;
      o.amp = {f: 'pt', y: [0, 99, 80 - 5 * k, 60, 0], t: [5 + 20 * k, 200 + 50 * k, 300, 400], sus: 3}; o.fbSrc = 0; o.fbAmt = 0; });
    if (kind === 'chain') x.ops.forEach((o, k) => { o.c = 0; o.r = k; });
    S.setFmx(1, x); return S.getSound(1); };
  const mag = (a, f, sr, i0, n) => { const w = 2 * Math.PI * f / sr; let re = 0, im = 0, ws = 0; for (let i = 0; i < n; i++) { const h = .5 - .5 * Math.cos(2 * Math.PI * i / (n - 1)), x = a[i0 + i] * h; re += x * Math.cos(w * i); im -= x * Math.sin(w * i); ws += h; } return 2 * Math.hypot(re, im) / ws; };
  const ev = [[.01, 'on', 57, .8], [1.2, 'off', 57]], out = [];
  for (let n = 1; n <= 6; n++) {
    const A = await S.mkRender(mk(n), ev, {sec: 1.6}); let worst = 0, lvl = [];
    for (let k = 0; k < n; k++) { const B = await S.mkRender(mk(n, k), ev, {sec: 1.6});
      for (let i = 0; i + 2048 < 1.5 * 48000; i += 2400) { const a = mag(A.l, 220 * (k + 1), 48000, i, 2048), s = mag(B.l, 220 * (k + 1), 48000, i, 2048); if (20 * Math.log10(s) < -70) continue; worst = Math.max(worst, Math.abs(20 * Math.log10(a / s))); }
      lvl.push((20 * Math.log10(mag(B.l, 220 * (k + 1), 48000, 4800, 2048))).toFixed(1)); }
    out.push({n, worstDb: +worst.toFixed(2), soloLevels: lvl.join(',')});
  }
  return out;
});
console.log(JSON.stringify(res, null, 0), errs);
await b.close();
