// Independent repro (Chromium, real app worklet + SynthHost plumbing in an OfflineAudioContext):
// an effect edit / program change made while the AM track is silent, then the next note vs a dry-from-start render.
// Usage: node v3-rep-mk4-idle-chrom.mjs <index.html>
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2]);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await browser.newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await page.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.setEngine(0, 'mk'); });
await page.waitForTimeout(300);
const res = await page.evaluate(async () => {
  const base = SYNQUENZER.getSound(0);
  const mkS = (fx) => { const s = JSON.parse(JSON.stringify(base)); const m = s.p.mk, t = m.t[0];
    Object.assign(t.o1, {w: 0}); Object.assign(t.f, {type: 0, cut: 90, res: 20, eg: 30}); Object.assign(t.e1, {a: 0, d: 50, s: 0, r: 30}); Object.assign(t.e2, {a: 0, d: 60, s: 0, r: 30});
    m.mfx = {type: 0, spd: 64, dep: 0}; m.dly = {type: 0, sync: 0, time: 64, note: 8, dep: 0}; m.eq = {lf: 320, lg: 0, hf: 6000, hg: 0};
    for (const k in fx || {}) Object.assign(m[k], fx[k]); return SQStore.normalizeSound(s); };
  const sr = 48000, sec = 2.6;
  async function rend(snd, edit, note1Off) {
    const src = document.getElementById('sq-worklet-src').textContent;
    const oc = new OfflineAudioContext(2, Math.round(sec * sr), sr);
    await oc.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
    const E = SynthHost.track(oc, oc.destination, wkFlat(snd), wkMods(snd), null, snd.p.mk);
    E.node.port.postMessage({mkSeed: 1}); E.mkWheel({mw0: +snd.p.mw || 0, reset: true}); E.tempo(120, null);
    E.on(1, 60, .9, 0); E.off(1, note1Off); E.on(2, 64, .9, 2.0); E.off(2, 2.5); E.flush();
    await new Promise(r => setTimeout(r, 20));
    let st = null;
    if (edit) oc.suspend(1.0).then(async () => { edit(E); await new Promise(r => setTimeout(r, 60)); oc.resume(); });
    const b = await oc.startRendering();
    return {l: b.getChannelData(0), r: b.getChannelData(1)};
  }
  const dry = mkS({});
  const db = x => 20 * Math.log10(Math.abs(x) + 1e-30), rms = (a, i0, i1) => { let e = 0; for (let i = i0; i < i1; i++) e += a[i] * a[i]; return Math.sqrt(e / (i1 - i0)); };
  const cmp = (a, b, t0) => { const i0 = Math.round(t0 * sr); let w = 0, pk = 0; for (let i = i0; i < a.l.length; i++) { w = Math.max(w, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i])); pk = Math.max(pk, Math.abs(b.l[i])); }
    const win = [[2.0, 2.005], [2.005, 2.01], [2.01, 2.02], [2.02, 2.04], [2.04, 2.08], [2.1, 2.3]].map(([x, y]) => (db(rms(a.l, Math.round(x * sr), Math.round(y * sr))) - db(rms(b.l, Math.round(x * sr), Math.round(y * sr)))).toFixed(2));
    return {maxd: +w.toExponential(3), peak: +pk.toFixed(4), win: win.join(' / ')}; };
  const out = {};
  const cases = {
    ens_dep0: [mkS({mfx: {type: 1, dep: 127}}), E => E.mkSet({'mfx.dep': 0}), dry],
    prog_phaser_eq_to_dry: [mkS({mfx: {type: 2, dep: 127}, eq: {lf: 200, lg: 12}}), E => E.set({}, false, null, null, dry.p.mk), dry],
    eq_lg_to_0: [mkS({eq: {lf: 200, lg: 12}}), E => E.mkSet({'eq.lg': 0}), dry],
    dly_dep_to_0: [mkS({dly: {dep: 80, time: 40}}), E => E.mkSet({'dly.dep': 0}), dry],
  };
  for (const k in cases) {
    const [p0, ed, ref] = cases[k];
    const refR = await rend(ref, null, .3);
    const a = await rend(p0, ed, .3);            // note 1 ends at 0.3 s: silent at the edit (1.0 s)
    const c = await rend(p0, ed, 1.2);           // control: note 1 still sounds at the edit
    const refC = await rend(ref, null, 1.2);
    // how loud is the track right before the edit (is it really silent)?
    const pre = db(rms(a.l, Math.round(.95 * sr), Math.round(1.0 * sr)));
    out[k] = {silentEdit: cmp(a, refR, 2.0), preEditLevel_dBFS: +pre.toFixed(1), controlEditWhileSounding: cmp(c, refC, 2.0)};
  }
  // type change Phaser -> Cho/Flg while silent vs an engine that always had Cho/Flg
  { const a = await rend(mkS({mfx: {type: 2, dep: 127}}), E => E.mkSet({'mfx.type': 0}), .3), b = await rend(mkS({mfx: {type: 0, dep: 127}}), null, .3);
    out.type_pha_to_cho = {silentEdit: cmp(a, b, 2.0)}; }
  // does waiting longer help? edit at 1.0, next note at 2.0 -> the gap is already 1 s; also check a dry-from-start note 1 baseline
  return out;
});
console.log(JSON.stringify(res, null, 1));
console.log('console errors:', errs.length ? errs.slice(0, 5) : 'none');
await browser.close();
