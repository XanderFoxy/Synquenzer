// QA MK5 probes E: MK5-17 surface — step key LEDs vs arpLog, running step vs arpLog, ARP key next to VOLUME, sizes per format
import { browser, ok, J, FILE } from './v3-qa-mk5-lib.mjs';
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390]};
for (const fmt of Object.keys(FMT)) {
  const [w, h] = FMT[fmt];
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  const r = await page.evaluate(async () => {
    const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); ensureAudio(); await sl(1000);
    Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); await sl(500);
    const pi0 = Q.mkPanel();
    const halves = /halb/.test(pi0.fmt) ? ['A', 'B'] : [null];
    const out = {fmt: pi0.fmt, halves: []};
    for (const hf of halves) {
      if (hf) { ED.tab = hf === 'A' ? 'links' : 'rechts'; safeRebuild(buildSynthEd); await sl(250); }
      const rect = k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), +r.width.toFixed(1), +r.height.toFixed(1)]; };
      const o = {hf, arp: rect('arp'), vol: rect('vol'), nums0: [0, 1, 2, 3, 4, 5, 6, 7].map(k => rect('n' + k))};
      Q.mkSet(0, 'arp.on', 1); MKUI.setWahl(2, 8); Q.mkSet(0, 'arp.last', 6); Q.mkSet(0, 'arp.steps', 255 & ~2 & ~16); Q.mkSet(0, 'arp.res', 1); Q.mkSet(0, 'arp.ks', 1); MKUI.render(); await sl(80);
      o.nums1 = [0, 1, 2, 3, 4, 5, 6, 7].map(k => rect('n' + k));
      o.keys = Q.mkPanel().arp.keys;
      // play: running step vs arpLog
      Q.arpClear(0); const fr = []; let go = true;
      const lp = () => { if (!go) return; const c = [...document.querySelectorAll('#synthSheet .mkx.mcur')].map(e => e.dataset.k); fr.push([AU.ctx.currentTime - (AU.outLat || 0), c.join(',')]); requestAnimationFrame(lp); };
      requestAnimationFrame(lp); Q.keyOn(60, .8, 'q0'); Q.keyOn(64, .8, 'q1'); Q.keyOn(67, .8, 'q2'); await sl(1600); go = false;
      Q.keyOff(60, 'q0'); Q.keyOff(64, 'q1'); Q.keyOff(67, 'q2'); await sl(200);
      o.log = Q.arpLog(0).map(x => [+x.t.toFixed(4), x.step]);
      o.fr = fr; o.keysPlay = Q.mkPanel().arp.keys;
      { const e = document.querySelector('#synthSheet .mkx[data-k="n1"] .mled'); o.blink = e ? getComputedStyle(e).animationName + ' ' + getComputedStyle(e).animationDuration : null; }
      Q.mkSet(0, 'arp.on', 0); Q.mkSet(0, 'arp.last', 8); Q.mkSet(0, 'arp.steps', 255); MKUI.toSpiel(); await sl(80);
      out.halves.push(o);
    }
    return out;
  });
  for (const o of r.halves) {
    const tag = fmt + (o.hf ? ' ' + o.hf : '') + ' (' + r.fmt + ')';
    if (!o.nums0.some(Boolean)) { ok(`MK5-17 ${tag}: (keine Nummerntasten in dieser Hälfte)`, true, 'ARP ' + J(o.arp)); if (o.arp) ok(`MK5-17 ${tag}: ARP-Taste ≥ 44`, o.arp[2] >= 43.5 && o.arp[3] >= 43.5, J(o.arp)); continue; }
    const steps = [...new Set(o.log.map(x => x[1]))].sort();
    ok(`MK5-17 ${tag}: LEDs an │ Pause │ dunkel laut arpLog (LÄNGE 6, Schritt 2+5 aus)`, J(o.keys) === J(['an', 'pause', 'an', 'an', 'pause', 'an', 'dunkel', 'dunkel']) && J(steps) === '[1,3,4,6]' && /mkbl1 1s/.test(o.blink), J(o.keys) + ' arpLog-Schritte ' + J(steps) + ' ' + o.blink);
    // running step: the highlighted key equals the step whose time has come (allow one frame)
    let bad = 0, n = 0;
    for (let k = 2; k < o.fr.length; k++) { const [t, c] = o.fr[k]; let cur = null; for (const [lt, s] of o.log) if (lt <= t) cur = s; else break; if (cur == null) continue;
      // the step index of ARPC.cur includes rests (steps 2, 5); arpLog has only sounding steps -> only check frames while the last logged step is current
      const idx = o.log.findIndex(x => x[0] > t), nextT = idx >= 0 ? o.log[idx][0] : Infinity, prevT = o.log.filter(x => x[0] <= t).pop()[0];
      if (t - prevT < .034 || nextT - t < .002) continue; if (t - prevT > .125 - .002) continue; n++; if (c !== 'n' + (cur - 1)) bad++; }
    ok(`MK5-17 ${tag}: laufender Schritt hell = Schritt aus arpLog (≤ 1 Bild Verzug)`, n > 10 && bad === 0, `${bad}/${n} Bilder falsch`);
    const sz = [o.arp, ...o.nums0].filter(Boolean), small = sz.filter(x => x[2] < 43.5 || x[3] < 43.5);
    const moved = o.nums0.map((a, k) => a && o.nums1[k] ? Math.max(...a.map((v, j) => Math.abs(v - o.nums1[k][j]))) : 0);
    ok(`MK5-17 ${tag}: ARP-Taste + Nummern-/Schritt-Tasten ≥ 44 × 44, kein Sprung bei ARP B`, !small.length && Math.max(...moved) <= 1, 'ARP ' + J(o.arp) + ' VOL ' + J(o.vol) + ' n0 ' + J(o.nums0[0]) + ' klein ' + J(small) + ' Sprung ' + Math.max(...moved));
    if (o.arp && o.vol) ok(`MK5-17 ${tag}: ARP-Taste neben VOLUME`, Math.abs(o.arp[1] - o.vol[1]) < 60 && Math.abs(o.arp[0] - o.vol[0]) < 140, J(o.arp) + ' / ' + J(o.vol));
  }
  ok('MK5-17 ' + fmt + ' Konsole', !errs.length, errs.slice(0, 3).join(' | '));
  await ctx.close();
}
await browser.close();
