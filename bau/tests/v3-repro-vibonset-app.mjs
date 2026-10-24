// Independent in-app repro: real app (4.5.1 snapshot vs 4.5.2 worktree), fake mic (wired route), own 48 kHz voice with
// continuous ±E ct vibrato through a legato phrase. Samples vsInfo().lit / litKey and the DOM key with class .vs every 4 ms,
// scores per note time-weighted (window onset+100 ms .. end-30 ms) after shifting by the measured mic latency.
import {chromium} from 'playwright';
import {INIT, b64, micOn} from './v3-vs2-h.mjs';
const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const SCR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const FILES = {base: SCR + 'synq-snapshots/G-P1b-gruppe-fix.html', new: SCR + 'dirigent-wt/index.html'};
const SR = 48000, E = +(process.argv[2] || 80), RATE = +(process.argv[3] || 5.5);
const FM = [[800, 80, 1], [1150, 90, 0.6], [2800, 140, 0.2], [3500, 200, 0.1]];
const fgain = f => { let g = 0.02; for (const [c, bw, a] of FM) g += a / Math.sqrt(1 + ((f - c) / (bw / 2)) ** 2); return g; };
function phrase(notes, phi, g = 0.06) {
  const t0 = 0.05; const on = []; let t = t0; for (const [m, d] of notes) { on.push([t, t + d, m]); t += d; } const tEnd = t;
  const base = tt => { for (let k = 0; k < on.length; k++) { const [a, b, m] = on[k]; if (tt < b || k === on.length - 1) {
      if (k > 0 && tt < a + g / 2) { const pm = on[k - 1][2]; return pm + (m - pm) * Math.max(0, Math.min(1, (tt - (a - g / 2)) / g)); }
      if (k < on.length - 1 && tt > b - g / 2) { const nm = on[k + 1][2]; return m + (nm - m) * Math.max(0, Math.min(1, (tt - (b - g / 2)) / g)); } return m; } } };
  const n = Math.round((tEnd + 0.4) * SR), x = new Float32Array(n); let ph = 0, s = 9;
  for (let i = 0; i < n; i++) { const tt = i / SR; const a = tt < t0 ? 0 : tt < t0 + 0.015 ? (tt - t0) / 0.015 : tt < tEnd - 0.03 ? 1 : tt < tEnd ? (tEnd - tt) / 0.03 : 0;
    const m = base(tt) + E / 100 * Math.sin(2 * Math.PI * RATE * (tt - t0) + phi), f0 = 440 * 2 ** ((m - 69) / 12); ph += 2 * Math.PI * f0 / SR;
    let v = 0; if (a > 0) for (let h = 1; h * f0 < 6500; h++) v += fgain(h * f0) / h ** 1.2 * Math.sin(h * ph);
    s = (s * 48271) % 2147483647; x[i] = 0.12 * a * v + (s / 2147483647 - 0.5) * 0.0006; }
  return {x, on, g};
}
const PH = [[60, 0.6], [62, 0.6], [64, 0.6], [65, 0.6], [67, 0.6], [65, 0.6], [64, 0.6], [62, 0.6]];
const phis = [0.3, 1.9, 3.5, 5.1];
const sums = {};
for (const name of ['base', 'new']) {
  const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT); await p.goto('file://' + FILES[name]); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await p.waitForTimeout(400);
  const ver = await p.evaluate(() => SYNQUENZER.version);
  const {D} = await micOn(p, 'wired');
  const M = new Map(); const tot = {right: 0, nb: 0, off: 0, W: 0, never: 0, n: 0, chg: 0, domBad: 0, domN: 0}; const perNote = [];
  for (const phi of phis) {
    const P = phrase(PH, phi);
    const T = await p.evaluate(b => { const c = window.__ctx, t = c.currentTime + 0.3; window.__tr = []; let last = null;
      window.__iv = setInterval(() => { const ks = [...document.querySelectorAll('#kb .key')]; const vs = ks.map((e, i) => e.classList.contains('vs') ? i : -1).filter(i => i >= 0);
        const I = SYNQUENZER.vsInfo(), s = I.lit + '|' + I.litKey + '|' + vs.join('+'); if (s !== last) { last = s; window.__tr.push([c.currentTime, I.lit, I.litKey, vs]); } }, 4);
      window.__fake.play(b, t, 48000); return t; }, b64(P.x));
    await p.waitForTimeout(Math.round((P.on[P.on.length - 1][1] + 1.2) * 1000));
    const tr = await p.evaluate(() => { clearInterval(window.__iv); return window.__tr; });
    // DOM consistency: index of the .vs key vs litKey (offset must be constant)
    // settled samples only (skip samples where litKey changed but the next paint has not happened yet)
    for (let i = 0; i < tr.length; i++) { const [t, , lk, vs] = tr[i], nx = tr[i + 1]; if (nx && nx[0] - t < 0.04 && nx[2] === lk) continue;
      if (lk >= 0) { tot.domN++; if (vs.length !== 1) tot.domBad++; else { if (!M.has(lk)) M.set(lk, new Set()); M.get(lk).add(vs[0]); } } else if (vs.length) tot.domBad++; }
    const sh = T + D / 1000; const ev = tr.map(([t, l]) => [t - sh, l]);
    const row = [];
    for (const [a0, b0, m] of P.on) { const A = a0 + 0.1, B = b0 - P.g / 2; let cur = -1, tl = -1e9, r = 0, nb = 0, off = 0, prev = null, chg = 0, shown = new Set();
      const acc = (lo, hi, k) => { lo = Math.max(lo, A); hi = Math.min(hi, B); if (hi <= lo) return; const d = hi - lo; if (k >= 0) shown.add(k); if (k === m) r += d; else if (k < 0) off += d; else nb += d; if (prev !== null && prev !== k) chg++; prev = k; };
      for (const [t, k] of ev) { acc(tl, t, cur); cur = k; tl = t; } acc(tl, B, cur);
      const W = B - A; tot.right += r; tot.nb += nb; tot.off += off; tot.W += W; tot.n++; tot.chg += chg; if (r === 0) tot.never++;
      row.push(`${m}->${[...shown].join('/')}${r === 0 ? '!' : ''}`); }
    perNote.push(`phi ${phi}: ` + row.join(' '));
  }
  sums[name] = tot;
  console.log(`${name} (${ver}), D=${D && D.toFixed(1)} ms, ±${E} ct ${RATE} Hz:\n  ` + perNote.join('\n  '));
  console.log(`  right ${(100 * tot.right / tot.W).toFixed(0)} %, neighbour/other ${(100 * tot.nb / tot.W).toFixed(0)} %, off ${(100 * tot.off / tot.W).toFixed(0)} %, sung key never lit ${tot.never}/${tot.n}, changes/note ${(tot.chg / tot.n).toFixed(1)}, DOM .vs mismatches ${tot.domBad}/${tot.domN}, litKey->DOM key 1:1 ${[...M.values()].every(x => x.size === 1) && new Set([...M.values()].map(x => [...x][0])).size === M.size}, errs ${JSON.stringify(errs)}`);
  await br.close();
}
