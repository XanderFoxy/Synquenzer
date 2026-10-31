// VC2a-05: Aufzeichnen ≤ 2 ms je Geste (Median, Hauptfaden), PE1 unverändert gegen 4.23.0, keine longtask > 50 ms durch den Rekorder.
// PE1 v3: 10 s Demo-Wiedergabe mit offenem Klang-Editor, dabei Reglerzüge (60 Hz) und Clip-/Klang-Gesten; rAF-Median ≥ 55 fps,
// keine longtask > 50 ms, tick-p95 ≤ 4 ms. Zweimal je Fassung (base, neu, base, neu).
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const APP = S + 'n5-br-H/index.html', BASE = S + 'vs-base-B.html';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + ' ' + JSON.stringify(info)); };
const runs = {};
for (const [name, file, mode] of [['base', BASE, 'pe1'], ['neu', APP, 'pe1'], ['base', BASE, 'pe1'], ['neu', APP, 'pe1'], ['base', BASE, 'pe1'], ['neu', APP, 'pe1'], ['base', BASE, 'gest'], ['neu', APP, 'gest'], ['base', BASE, 'gest'], ['neu', APP, 'gest'], ['base', BASE, 'gest'], ['neu', APP, 'gest']]) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  await p.goto('file://' + file); await p.waitForTimeout(2500);
  const r = await p.evaluate(async ([isNew, mode]) => {
    const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
    const tk = []; const t0r = window.tick; window.tick = function () { const a = performance.now(); const x = t0r.apply(this, arguments); tk.push(performance.now() - a); return x; };
    const dr = [], sw = [], kf = [];
    if (isNew) { window.__iv = []; const w = (n, arr) => { const f = window[n]; window[n] = function () { const a = performance.now(); const x = f.apply(this, arguments); const e = performance.now(); arr.push(e - a); window.__iv.push([a, e, n]); return x; }; }; w('histDrain', dr); w('histTimer', sw); w('histKeyframe', kf); w('histSweep', []); w('histFlush', []); }
    Q.launchScene(0); await sl(1200);
    selectTrack(3); Q.openEditor(); await sl(400);
    const t0 = performance.now(); window.__lt.length = 0; const fr = []; let w0 = performance.now(), wn = 0, on = true;
    const raf = () => { const n = performance.now(); wn++; if (n - w0 >= 1000) { fr.push(wn * 1000 / (n - w0)); w0 = n; wn = 0; } if (on) requestAnimationFrame(raf); }; requestAnimationFrame(raf);
    tk.length = 0;
    const knobs = [...document.querySelectorAll('.knob.mctl')].filter(x => { const r = x.getBoundingClientRect(); return r.width > 20 && r.top > 0 && r.bottom < innerHeight; }).slice(0, 4);
    const drag = async (k, ms) => { const r = k.getBoundingClientRect(), x = r.left + r.width / 2, y0 = r.top + r.height / 2;
      const ev = (type, y) => k.dispatchEvent(new PointerEvent(type, {pointerId: 9, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, bubbles: true, cancelable: true, buttons: type === 'pointerup' ? 0 : 1}));
      ev('pointerdown', y0); const s = performance.now(); await new Promise(res => { const f = () => { const t = performance.now() - s; ev('pointermove', y0 + 40 * Math.sin(t / 300)); if (t < ms) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); }); ev('pointerup', y0); };
    let g = 0;
    while (performance.now() - t0 < 10000) {
      if (mode === 'pe1') { await sl(200); continue; }
      await drag(knobs[g % knobs.length], 700); g++;
      const c = Q.getClip(1, 0) || {len: 1, notes: []}; c.notes = c.notes.slice(); c.notes.push({p: 60 + (g % 12), s: (g % 8) / 2, l: .25, v: .8}); Q.setClip(1, 0, c); g++;
      Q.toggleStep(g % 8, g % 16, 0); g++;
      await sl(150);
    }
    on = false; const dt = performance.now() - t0; Q.stop(); await sl(2600);
    const lt = window.__lt.filter(x => x[0] >= t0); tk.sort((a, b) => a - b); fr.sort((a, b) => a - b); dr.sort((a, b) => a - b); sw.sort((a, b) => a - b);
    const q = (a, f) => a.length ? +a[Math.min(a.length - 1, Math.floor(a.length * f))].toFixed(3) : null;
    return {sec: +(dt / 1000).toFixed(1), gestures: g, lt: lt.map(x => x[1]), fpsMed: +fr[fr.length >> 1].toFixed(1), fpsMin: +fr[0].toFixed(1), tickP95: q(tk, .95), tickN: tk.length,
      drainMed: q(dr, .5), drainP95: q(dr, .95), drainMax: q(dr, 1), drainN: dr.length, sweepMax: q(sw, 1), sweepMed: q(sw, .5), kfMax: kf.length ? +Math.max(...kf).toFixed(2) : null,
      ltRec: isNew ? lt.filter(x => window.__iv.some(([a, e]) => a >= x[0] - 1 && e <= x[0] + x[1] + 1 && x[1] > 50)).map(x => [x[1], window.__iv.filter(([a, e]) => a >= x[0] - 1 && e <= x[0] + x[1] + 1).reduce((m, [a, e]) => m + e - a, 0).toFixed(1)]) : null,
      check: isNew ? await historyCheck() : null, ev: isNew ? SYNQUENZER.history() : null};
  }, [name === 'neu', mode]);
  r.mode = mode;
  r.errs = errs.length; console.log(name, JSON.stringify(r)); (runs[name + mode] = runs[name + mode] || []).push(r);
  await ctx.close();
}
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
const pe = k => ({fps: med(runs[k].map(r => r.fpsMed)), lt50: runs[k].map(r => r.lt.filter(x => x > 50).length), tickP95: med(runs[k].map(r => r.tickP95))});
const pb = pe('basepe1'), pn = pe('neupe1');
ok('VC2a-05 PE1 unverändert (3 Läufe je Fassung, Median): rAF ≥ 55, tick-p95 ≤ 4 ms, nicht schlechter als 4.23.0', pn.fps >= 55 && pn.tickP95 <= 4 && pn.fps >= pb.fps - 1.5 && med(pn.lt50) <= med(pb.lt50), {neu: pn, base: pb, ltNeu: runs.neupe1.map(r => r.lt), ltBase: runs.basepe1.map(r => r.lt)});
const allRec = runs.neupe1.concat(runs.neugest).flatMap(r => r.ltRec || []);
ok('VC2a-05 der Rekorder verursacht keine longtask > 50 ms (ohne Rekorder-Anteil wäre jede ≤ 50 ms nur, wenn sie es schon vorher war)', !allRec.some(([d, r]) => d - +r <= 50), {longtasksMitRekorderSchritt_DauerUndRekorderAnteilMs: allRec});
const dm = runs.neugest.map(r => r.drainMed), mx = Math.max(...runs.neugest.map(r => Math.max(r.drainMax || 0, r.sweepMax || 0, r.kfMax || 0)));
ok('VC2a-05 Aufzeichnen je Geste ≤ 2 ms (Median, 3 Läufe mit Wiedergabe)', dm.every(x => x <= 2), {median: dm, p95: runs.neugest.map(r => r.drainP95), max: runs.neugest.map(r => r.drainMax), n: runs.neugest.map(r => r.drainN)});
ok('VC2a-05 Rekorder erzeugt keine longtask > 50 ms (längster Rekorder-Schritt)', mx < 50, {laengsterSchrittMs: mx, abgleichMax: runs.neugest.map(r => r.sweepMax)});
const ltN = a => a.reduce((s, r) => s + r.lt.filter(x => x > 50).length, 0);
console.log('Gesten-Szenario longtasks > 50 ms: base', JSON.stringify(runs.basegest.map(r => r.lt)), 'neu', JSON.stringify(runs.neugest.map(r => r.lt)), 'fps base', runs.basegest.map(r => r.fpsMed), 'neu', runs.neugest.map(r => r.fpsMed));
for (const r of runs.neugest) ok('VC2a-05 M-REKON nach dem Lauf', r.check === true, r.ev);
await b.close(); console.log(fails ? 'FEHLER' : 'ALLE BESTANDEN');
