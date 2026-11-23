// ENT1A Sonde: node test.js <port> [datei]
const {chromium} = require('/opt/node-tools/node_modules/playwright');
const port = process.argv[2] || '8771', file = process.argv[3] || 'index.html';
const URL = `http://127.0.0.1:${port}/${file}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function tapEl(page, sel) {
  const b = await page.evaluate(s => { const e = typeof s === 'string' ? document.querySelector(s) : null; const el = e || EL.bPlay; const r = el.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width}; }, sel);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: b.x, y: b.y}]});
  await sleep(40);
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  return b;
}
const alive = page => page.evaluate(() => { const c = AU.ctx, now = c.currentTime, t = window.__t;
  const v = VOICES.filter(v => !v.dead && v.track === t);
  let rms = null; try { const a = AU.analyser, b = new Float32Array(a.fftSize); a.getFloatTimeDomainData(b); let q = 0; for (const x of b) q += x * x; rms = +Math.sqrt(q / b.length).toFixed(5); } catch (e) {}
  return {rms, n: v.length, arp: v.filter(v => v.src === 'arp').length, sounding: v.filter(v => v.start <= now && (v.end == null || v.end > now)).length,
    info: ARPC.info(t), la: S.tracks[t].arp && S.tracks[t].arp.la, playing: R.playing};
});
async function run(view) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({viewport: view, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console.error: ' + m.text()); });
  await page.goto(URL, {waitUntil: 'load'});
  await page.waitForFunction(() => typeof S !== 'undefined' && S.tracks && typeof togglePlay === 'function', null, {timeout: 30000});
  await sleep(1500);
  await tapEl(page, null); await sleep(300); await page.evaluate(() => { if (R.playing) stop(); }); await sleep(1300); // Audio entsperren
  const want = async on => { if (await page.evaluate(() => R.playing) !== on) await tapEl(page, null); };
  const out = {view: view.width + 'x' + view.height};
  out.setup = await page.evaluate(() => {
    ensureAudio(); arpSrcLoad();
    let t = S.tracks.findIndex(tr => arp1EngOk(tr));
    if (t < 0) return {err: 'kein synth'};
    R.selT = t; window.__t = t;
    arp1Put(t, {on: 1, la: 1, m: 'auf', r: 16, o: 1});
    return {t, eng: S.tracks[t].sound.engine, arp: S.tracks[t].arp};
  });
  const rounds = [];
  for (const mode of ['spielt', 'steht']) {
    const r = {mode};
    if (mode === 'spielt') { await want(true); await sleep(400); }
    await page.evaluate(() => { inputDown(60, 'kA', .8); inputDown(64, 'kB', .8); inputDown(67, 'kC', .8); });
    await sleep(350);
    await page.evaluate(() => { inputUp('kA'); inputUp('kB'); });  // kC bleibt gedrueckt (Finger liegt)
    await sleep(500);
    r.vorher = await alive(page);
    if (mode === 'steht') { await want(true); await sleep(300); r.nachPlay = await alive(page); }
    r.vorStopp = await page.evaluate(() => R.playing);
    r.btn = await tapEl(page, null); // ■
    await sleep(200);
    r.nach200 = await alive(page);
    await sleep(300); r.nach500 = await alive(page);
    await sleep(800);
    r.nach1000 = await alive(page);
    await page.evaluate(() => { inputUp('kC'); });
    await sleep(300);
    r.nachLos = await alive(page);
    rounds.push(r);
    await sleep(1200);
  }
  // ▶ danach: Arp sauber auf dem Takt
  out.vorPlay = await alive(page);
  await want(true); await sleep(500);
  out.sync = await page.evaluate(async () => {
    const t = window.__t, c = AU.ctx; inputDown(62, 'kD', .8);
    await new Promise(r => setTimeout(r, 700));
    const sb = 4 / 16, v = VOICES.filter(v => v.track === t && v.src === 'arp');
    const st = v.map(v => t2b(v.start)).sort((a, b) => a - b).slice(0, 4);
    inputUp('kD');
    return {beats: st.map(b => +b.toFixed(3)), onGrid: st.every(b => Math.abs(b / sb - Math.round(b / sb)) < .02), info: ARPC.info(t), la: S.tracks[t].arp.la};
  });
  await want(false); await sleep(300);
  out.end = await alive(page);
  out.rounds = rounds; out.errs = errs;
  await browser.close();
  return out;
}
(async () => {
  const res = [];
  for (const v of [{width: 428, height: 926}, {width: 926, height: 428}]) res.push(await run(v));
  console.log(JSON.stringify(res));
})();
