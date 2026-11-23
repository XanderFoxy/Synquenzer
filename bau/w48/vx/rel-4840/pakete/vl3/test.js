// Kern-Test VL3: node test.js <port>
const {chromium} = require('/opt/node-tools/node_modules/playwright');
const port = process.argv[2] || '8763';
const URL = `http://127.0.0.1:${port}/index.html`;
const res = {};
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function setup(page) {
  return page.evaluate(async () => {
    const sp = spb(), bar = g10aBpb() * sp, sr = 48000, ia = Math.round(bar * sr), n = ia + Math.round(bar * sr) + sr;
    const pcm = new Int16Array(n);
    // Atmer 3/4 vor der 1 (leises Rauschen), Sinus-Silbe 1/4 vor der 1 bis in den Takt hinein
    const b0 = ia - Math.round(3 * sp * sr), b1 = b0 + Math.round(.2 * sr);
    let seed = 1; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - .5);
    for (let i = b0; i < b1; i++) pcm[i] = Math.round(rnd() * 2 * .04 * 32767 * Math.sin(Math.PI * (i - b0) / (b1 - b0)));
    const s0 = ia - Math.round(sp * sr), s1 = ia + Math.round(bar * .9 * sr), fi = Math.round(.005 * sr);
    for (let i = s0; i < s1; i++) { let g = .5; if (i - s0 < fi) g *= (i - s0) / fi; if (s1 - i < fi) g *= (s1 - i) / fi; pcm[i] = Math.round(g * 32767 * Math.sin(2 * Math.PI * 220 * (i - s0) / sr)); }
    const r = tkAddPcmTake(pcm, sr, 'import'), id = r.id;
    const st = tkEnsureTrack([]);
    const a = tkNormAudio({take: id, in: tkR6(ia / sr), out: tkR6(ia / sr + bar), at: 0});
    S.tracks[st].clips[0] = {len: 1, key: S.key, notes: [], audio: a};
    clipChanged(st, 0);
    vl2Want(id, 1);
    g3TakePre(id, S.takes[id], pcm, ia, sr);
    await new Promise(r => setTimeout(r, 400));
    const c = S.tracks[st].clips[0];
    return {st, id, sp, bar, mode: c.vorlaufModus, vl3s: c.vl3s, want: sp, undo: UNDO.length ? UNDO[UNDO.length - 1].label : null, tk: tkAudioOk()};
  });
}

async function flagBox(page) {
  return page.evaluate(() => {
    const h = document.querySelector('.vl3h'), z = document.querySelector('.vl3z'), cM = ED.roll && ED.roll.el.main;
    if (!h || !cM) return null;
    const hb = h.getBoundingClientRect(), zb = z.getBoundingClientRect(), cb = cM.getBoundingClientRect(), f = ED.roll.fol();
    return {hx: hb.left + 14 + 14, hy: hb.top + 14, poleX: hb.left + 14, zoneR: zb.right, cL: cb.left, cR: cb.right, x0: f.x0, ppb: f.ppb, vis: !document.querySelector('.vl3o').hidden};
  });
}

async function run(view, full) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({viewport: view, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const page = await ctx.newPage();
  const errs = [];
  await page.route('**/version.json*', r => r.fulfill({status: 200, contentType: 'application/json', body: '{}'}));
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console.error: ' + m.text()); });
  page.on('response', r => { if (r.status() >= 400) errs.push('http ' + r.status() + ' ' + r.url()); });
  await page.goto(URL, {waitUntil: 'load'});
  await page.waitForFunction(() => typeof S !== 'undefined' && S.tracks && typeof vl3Mount === 'function', null, {timeout: 30000});
  await sleep(1500);
  const out = {view: view.width + 'x' + view.height};
  const s = await setup(page);
  out.auto = s;
  await page.evaluate(st => { vx1rOpen({t: st, s: 0}); }, s.st);
  await sleep(1500);
  const b = await flagBox(page);
  out.flag = b;
  out.flagOk = !!(b && b.vis && b.poleX - b.cL >= 40 && b.cR - b.zoneR >= 24);
  if (full && b) {
    const cdp = await ctx.newCDPSession(page);
    const pt = (x, y) => [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}];
    const x0b = b.x0, step = b.ppb * .25; // eine 1/16 in px
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: pt(b.hx, b.hy)});
    for (let k = 1; k <= 10; k++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: pt(b.hx + step * 2 * k / 10, b.hy)}); await sleep(16); }
    // auch nahe an den linken Rand ziehen darf nicht rollen
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    await sleep(300);
    const d = await page.evaluate(st => { const c = S.tracks[st].clips[0], q = spb() * .25; return {vl3s: c.vl3s, mode: c.vorlaufModus, grid: Math.abs(c.vl3s / q - Math.round(c.vl3s / q)) < 1e-3, undo: UNDO[UNDO.length - 1].label, x0: ED.roll.fol().x0}; }, s.st);
    out.drag = d;
    out.dragOk = d.undo === 'Auftakt verschoben' && d.grid && Math.abs(d.vl3s - (s.vl3s - 2 * s.sp * .25)) < s.sp * .25 + 1e-3 && Math.abs(d.x0 - x0b) < 1e-6;
    // Rückgängig
    const u = await page.evaluate(st => { undo(); const c = S.tracks[st].clips[0]; return {vl3s: c.vl3s, mode: c.vorlaufModus}; }, s.st);
    await sleep(200);
    out.undo = u;
    out.undoOk = Math.abs(u.vl3s - s.vl3s) < 1e-6 && u.mode === 'gefaltet';
    // Tipp öffnet Auswahl, "aus" wählen, dann ↶
    const b2 = await flagBox(page);
    await page.touchscreen.tap(b2.hx, b2.hy);
    await sleep(300);
    const menu = await page.evaluate(() => [...document.querySelectorAll('.vl3m button')].map(x => x.textContent));
    out.menu = menu;
    const ab = await page.evaluate(() => { const x = [...document.querySelectorAll('.vl3m button')].find(z => z.dataset.v === 'aus'); if (!x) return null; const r = x.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
    if (ab) await page.touchscreen.tap(ab.x, ab.y);
    await sleep(300);
    out.menuMode = await page.evaluate(st => { const m1 = S.tracks[st].clips[0].vorlaufModus; undo(); return [m1, S.tracks[st].clips[0].vorlaufModus, !!document.querySelector('.vl3m')]; }, s.st);
    out.menuOk = menu.join('|') === '▸ einmal|↻ gefaltet|aus' && out.menuMode[0] === 'aus' && out.menuMode[1] === 'gefaltet' && !out.menuMode[2];
    // Render über 2 Loop-Runden (gleicher Weg wie Matrix/Song) + Clip-WAV "Loop rund"
    out.render = await page.evaluate(async st => {
      const c = S.tracks[st].clips[0], a = c.audio, buf = tkPlayBuf(a.take, a), sp = spb(), sr = buf.sampleRate, L = clipB(c), n = Math.round(L * sp * sr);
      const P = vl2FoldPlan(c, a, buf);
      const F = vl2FoldMake([buf.getChannelData(0)], {i1: Math.round(a.in * sr), n, segN: Math.round((a.out - a.in) * sr), pickN: Math.round(vl3Sec(c, a) * sr), tailS: 0, tailN: 0, sr, fix: true});
      const N = 2 * n, y = new Float32Array(N); for (let j = 0; j < N; j++) y[j] = F.get(0, j % n);
      let md = 0, at = 0; for (let j = 1; j < N; j++) { const d = Math.abs(y[j] - y[j - 1]); if (d > md) { md = d; at = j; } }
      const src = buf.getChannelData(0), i1 = Math.round(a.in * sr); let sine = 0; for (let j = i1 - Math.round(sp * sr) + 1; j < i1 + Math.round((a.out - a.in) * sr); j++) { const d = Math.abs(src[j] - src[j - 1]); if (d > sine) sine = d; }
      const rms = (j0, j1) => { let s = 0; for (let j = j0; j < j1; j++) s += y[j] * y[j]; return Math.sqrt(s / Math.max(1, j1 - j0)); };
      const pk = Math.round((sp - .01) * sr), pre = [rms(n - pk, n), rms(2 * n - pk, 2 * n)], breath = rms(n - Math.round(3 * sp * sr), n - Math.round(2.6 * sp * sr));
      let wav = null; if (vl2X()) { const W = vl2ClipPlanX({a, clip: c}, 'B'); wav = {fs: W.fs, want: W.n - Math.round(vl3Sec(c, a) * sr)}; }
      return {planSec: P && +P.sec.toFixed(4), vl3s: c.vl3s, fs: F.fs, n, pre: pre.map(v => +v.toFixed(3)), breath: +breath.toFixed(4), maxDiff: +md.toFixed(4), at, sineDiff: +sine.toFixed(4), wav};
    }, s.st);
    const r = out.render;
    out.renderOk = Math.abs(r.planSec - r.vl3s) < 2e-3 && r.pre[0] > .2 && r.pre[1] > .2 && r.maxDiff <= 1.05 * r.sineDiff && r.wav && Math.abs(r.wav.fs - r.wav.want) <= 1;
    // Speichern/Laden
    out.save = await page.evaluate(st => { const j = JSON.parse(serializeProject()), c = j.tracks[st].clips[0], o = normClip(JSON.parse(JSON.stringify(c)), S.tracks[st].kind); return {saved: c.vl3s, loaded: o.vl3s, mode: o.vorlaufModus}; }, s.st);
    out.saveOk = out.save.saved > 0 && out.save.loaded === out.save.saved && out.save.mode === 'gefaltet';
    await page.screenshot({path: __dirname + '/shot-hoch.png'});
  } else {
    await page.screenshot({path: __dirname + '/shot-quer.png'});
  }
  out.autoOk = s.mode === 'gefaltet' && Math.abs(s.vl3s - (s.sp + .02)) < .03 && s.undo === 'Auftakt gefaltet';
  out.errs = errs;
  await browser.close();
  return out;
}

(async () => {
  const a = await run({width: 428, height: 926}, true);
  const b = await run({width: 926, height: 428}, false);
  console.log(JSON.stringify({hoch: a, quer: b}, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
