import * as Q from './v3-qa7-lib.mjs';
const {ok} = Q; const sleep = ms => new Promise(r => setTimeout(r, ms));
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 600)); } };
const br = await Q.launch();
async function open(vp, frame) {
  const ctx = await br.newContext({viewport: vp || {width: 390, height: 844}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await ctx.addInitScript(() => { window.__gum = 0; try { const md = navigator.mediaDevices; if (md && md.getUserMedia) { const g = md.getUserMedia.bind(md); md.getUserMedia = function () { window.__gum++; return g.apply(md, arguments); }; } } catch (e) {} });
  let p = page;
  if (frame) {
    const fp = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/qa-mk7/frame.html';
    (await import('fs')).writeFileSync(fp, `<!doctype html><meta charset="utf-8"><body style="margin:0"><iframe src="file://${Q.FILE}" sandbox="allow-scripts allow-same-origin" style="width:390px;height:844px;border:0"></iframe></body>`);
    await page.goto('file://' + fp); await sleep(800); p = page.frames().find(x => x !== page.mainFrame());
  } else await page.goto('file://' + Q.FILE);
  await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await p.evaluate(() => ensureAudio()); await p.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000});
  return {ctx, page, p, errs};
}
const LV = () => { window.__mk = n => { const c = AU.ctx, an = c.createAnalyser(); an.fftSize = 4096; n.connect(an); return () => { const d = new Float32Array(4096); an.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return +(10 * Math.log10(s / 4096 + 1e-30)).toFixed(1); }; }; };
await T('HALTEN live', async () => {
  const {ctx, page, p, errs} = await open();
  await p.evaluate(LV);
  await p.evaluate(() => { const Q_ = SYNQUENZER; Q_.setEngine(1, 'analog'); Q_.setEngine(0, 'mk'); const s = Q_.getSound(0); s.p.mk.mode = 3; Q_.setSound(0, s); Q_.mkIn(0, 'e2', 1, 0); Q_.selectTrack(0); Q_.openEditor(); window.__v = __mk(AU.tracks[0].cut); });
  await sleep(300);
  // source plays a bright held note, vocoder plays a chord
  await p.evaluate(() => { const c = AU.ctx, E = AU.synth[1]; E.on(9e6, 57, .9, c.currentTime + .02); E.flush(); const A = AU.synth[0]; for (const [k, n] of [[1, 48]]) A.on(8e6 + k, n, .8, c.currentTime + .02); A.flush(); });
  await sleep(700); const a = await p.evaluate(() => __v());
  // tap TIMBRE (HALTEN)
  const b = await p.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="timbre"]'), r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2 + 6]; });
  await p.evaluate(([x, y]) => 0, b); await page.mouse.click(b[0], b[1]); await sleep(600);
  const st = await p.evaluate(() => ({hold: SYNQUENZER.mkGet(0).voc.hold, led: document.querySelector('#synthSheet .mkx[data-k="timbre"] .mled') && document.querySelector('#synthSheet .mkx[data-k="timbre"] .mled').className, lcd: ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''}));
  // stop the source
  await p.evaluate(() => { const E = AU.synth[1]; E.off(9e6, AU.ctx.currentTime); E.flush(); });
  await sleep(1500); const c = await p.evaluate(() => __v());
  await sleep(3000); const d = await p.evaluate(() => __v());
  ok('MK7-03 TIMBRE/HALTEN live: Vokal bleibt nach Quelle aus', Array.isArray(st.hold) && st.hold.some(x => x > 0) && Math.abs(c - a) < 3 && Math.abs(d - c) <= .5, `vorher ${a} dB, nach Quelle aus ${c} / +3 s ${d} dB · hold ${JSON.stringify(st.hold)} · LED ${st.led} · ${st.lcd.slice(0, 80)}`);
  await p.evaluate(() => { const A = AU.synth[0]; for (const k of [1, 2, 3]) A.off(8e6 + k, AU.ctx.currentTime); A.flush(); });
  ok('keine Konsolenfehler (HALTEN)', !errs.length, errs.slice(0, 3).join(' | '));
  await ctx.close();
});
await T('Claude-App', async () => {
  const {ctx, page, p, errs} = await open(null, true);
  await p.evaluate(LV);
  const r = await p.evaluate(async () => { const Q_ = SYNQUENZER; Q_.setEngine(0, 'mk'); const s = Q_.getSound(0); s.p.mk.mode = 3; s.p.mk.voc.hold = [0, 0, 60, 110, 120, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0]; Q_.setSound(0, s);
    window.__v = __mk(AU.tracks[0].cut); const A = AU.synth[0], c = AU.ctx; A.on(8e6, 48, .8, c.currentTime + .02); A.on(8e6 + 1, 55, .8, c.currentTime + .02); A.flush();
    await new Promise(r => setTimeout(r, 800)); const lv = __v(); A.off(8e6, c.currentTime); A.off(8e6 + 1, c.currentTime); A.flush();
    Q_.selectTrack(0); Q_.openEditor(); await new Promise(r => setTimeout(r, 300)); MKUI.setWahl(1, 3); MKUI.P.shift = 1; MKUI.render();
    let t = null; try { Q_.mkIn(0, 'e2', 'mic'); t = 'erlaubt'; } catch (e) { t = 'abgelehnt'; }
    return {lv, t, avail: micAvail(), gum: window.__gum, tap: SYNQUENZER.mkInInfo().mic.gum}; });
  // open the QUELLE 2 list by a tap on knob 1
  const kb = await p.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="k0"]'), r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2 + 6]; });
  await page.mouse.click(kb[0], kb[1]); await sleep(300);
  const rows = await p.evaluate(() => [...document.querySelectorAll('.pop .plist.mksrc button')].map(b => b.textContent));
  ok('MK7-03 hold klingt in der Claude-App ohne Quelle', r.lv > -50, r.lv + ' dB');
  ok('MK7-10 Claude-App: kein Mikrofon-Eintrag, getUserMedia 0', !r.avail && r.t === 'abgelehnt' && rows.length > 0 && !rows.some(x => /Mikrofon/.test(x)) && r.gum === 0 && r.tap === 0, `Liste: ${rows.join(' | ')} · gum ${r.gum}`);
  ok('keine Konsolenfehler (Claude-App)', !errs.length, errs.slice(0, 3).join(' | '));
  await ctx.close();
});
await T('ECO', async () => {
  const {ctx, page, p, errs} = await open();
  await p.evaluate(LV);
  const r = await p.evaluate(async () => { const Q_ = SYNQUENZER; Q_.setEngine(0, 'mk'); const s = Q_.getSound(0); s.p.mk.mode = 3; s.p.mk.voc.hold = [0, 0, 60, 110, 120, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0]; Q_.setSound(0, s);
    window.__v = __mk(AU.tracks[0].cut); Q_.selectTrack(0); Q_.openEditor(); await new Promise(r => setTimeout(r, 200));
    await Q_.forceNative(true); await new Promise(r => setTimeout(r, 500));
    const lcd0 = ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : '';
    let mx = -999; const pr = Q_.audition(0, 48, 1000); for (let i = 0; i < 8; i++) { await new Promise(r => setTimeout(r, 100)); mx = Math.max(mx, __v()); } await pr;
    const lcd = ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : '', head = document.querySelector('#synthSheet') ? document.querySelector('#synthSheet').innerText.replace(/\s+/g, ' ') : '';
    const vc = SYNQUENZER.voices ? SYNQUENZER.voices() : null;
    await Q_.forceNative(false); await new Promise(r => setTimeout(r, 500));
    let mx2 = -999; const pr2 = Q_.audition(0, 48, 1000); for (let i = 0; i < 8; i++) { await new Promise(r => setTimeout(r, 100)); mx2 = Math.max(mx2, __v()); } await pr2;
    return {mx, mx2, lcd0, lcd, hint: /Vocoder braucht/.test(head + lcd + lcd0 + document.body.innerText)}; });
  ok('MK7-15 ECO: hold-Sound stumm mit Hinweis', r.mx < -90 && r.hint && r.mx2 > -50, JSON.stringify(r).slice(0, 400));
  ok('MK7-15 keine Konsolenfehler', !errs.length, errs.slice(0, 3).join(' | '));
  await ctx.close();
});
await T('LED', async () => {
  const {ctx, page, p, errs} = await open();
  await p.evaluate(() => { const Q_ = SYNQUENZER; Q_.setEngine(1, 'analog'); const s1 = Q_.getSound(1); s1.p.o1w = 3; s1.p.level = 1; Q_.setSound(1, s1); Q_.setEngine(0, 'mk'); const s = Q_.getSound(0); s.p.mk.mode = 3; Q_.setSound(0, s); Q_.mkIn(0, 'e1', 1); Q_.selectTrack(0); Q_.openEditor(); });
  await sleep(400);
  const leds = () => p.evaluate(() => [...document.querySelectorAll('#synthSheet .mled')].filter(e => e.closest('.mkx') && /ein|mein/.test(e.closest('.mkx').className + e.closest('.mkx').dataset.k)).map(e => e.className));
  const ledInfo = await p.evaluate(() => [...document.querySelectorAll('#synthSheet .mkx')].map(e => e.dataset.k + ':' + e.className).filter(x => /ein/.test(x)));
  // drive the source at given peak levels by its track gain before the duck? use an oscillator into the duck node instead
  await p.evaluate(() => { const c = AU.ctx, o = c.createOscillator(); o.frequency.value = 440; const g = c.createGain(); g.gain.value = 0; o.connect(g); g.connect(AU.tracks[1].duck); o.start(); window.__g = g; });
  const res = [];
  for (const dbv of [-55, -48, -10, -2, -0.5, 1]) { await p.evaluate(v => { window.__g.gain.value = Math.pow(10, v / 20); }, dbv); await sleep(400); res.push([dbv, (await leds()).join(' / ')]); }
  console.log('LED-Zone', ledInfo.join(' '), '\n', res.map(r => r.join(': ')).join('\n '));
  const on = s => /lon/.test(s.split(' / ')[0]), red = s => /lred/.test(s.split(' / ')[0]);
  ok('MK7-13 LED E1 an ab −50, rot ab −1 dBFS', !on(res[0][1]) && on(res[1][1]) && !red(res[2][1]) && !red(res[3][1]) && red(res[4][1]) && red(res[5][1]), res.map(r => r[0] + ':' + r[1]).join(' | '));
  ok('keine Konsolenfehler (LED)', !errs.length, errs.slice(0, 3).join(' | '));
  await ctx.close();
});
Q.summary(); await br.close();
