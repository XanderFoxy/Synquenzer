import * as Q from './v3-qa7-lib.mjs';
const {ok} = Q; const sleep = ms => new Promise(r => setTimeout(r, ms));
const br = await Q.launch(['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']);
const ctx = await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, permissions: ['microphone']});
await ctx.addInitScript(() => { window.__gum = 0; window.__net = 0; const md = navigator.mediaDevices; const g = md.getUserMedia.bind(md); md.getUserMedia = function (c) { window.__gum++; window.__gumC = JSON.stringify(c); return g(c); };
  const f = window.fetch; window.fetch = function () { window.__net++; return f.apply(this, arguments); }; });
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + Q.FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await page.evaluate(() => ensureAudio()); await page.waitForFunction(() => SynthHost.state === 'ready');
await page.evaluate(async () => { const Q_ = SYNQUENZER; Q_.setEngine(0, 'mk'); const s = Q_.getSound(0); s.p.mk.mode = 3; s.p.mk.voc.dir = 127; Q_.setSound(0, s); Q_.selectTrack(0); Q_.openEditor(); await new Promise(r => setTimeout(r, 300)); MKUI.setWahl(1, 3); MKUI.P.shift = 1; MKUI.render(); });
const g0 = await page.evaluate(() => window.__gum);
const kb = await page.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="k0"]'), r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2 + 6]; });
await page.mouse.click(kb[0], kb[1]); await sleep(300);
const g1 = await page.evaluate(() => window.__gum);
const mb = await page.evaluate(() => { const b = document.querySelector('.pop .plist.mksrc button[data-v="mic"]'); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
if (mb) await page.mouse.click(mb[0], mb[1]); await sleep(1500);
const st = await page.evaluate(() => { const t = MICTAP.stream && MICTAP.stream.getAudioTracks()[0]; window.__t = t; return {gum: window.__gum, c: window.__gumC, settings: t ? t.getSettings() : null, info: SYNQUENZER.mkInInfo(), mkIn: S.tracks[0].mkIn}; });
ok('MK7-10 kein getUserMedia vor dem Tipp (auch nicht beim Öffnen der Liste)', g0 === 0 && g1 === 0, `vor Liste ${g0}, Liste offen ${g1}`);
ok('MK7-10 getUserMedia nach Tipp, echoCancellation false', st.gum === 1 && st.settings && st.settings.echoCancellation === false && st.settings.autoGainControl === false && st.settings.noiseSuppression === false, JSON.stringify({gum: st.gum, c: st.c, s: st.settings && {ec: st.settings.echoCancellation, agc: st.settings.autoGainControl, ns: st.settings.noiseSuppression}}));
// direct path: the fake mic beep reaches the vocoder output
await page.evaluate(() => { const c = AU.ctx, an = c.createAnalyser(); an.fftSize = 4096; AU.tracks[0].cut.connect(an); window.__lv = () => { const d = new Float32Array(4096); an.getFloatTimeDomainData(d); let m = 0; for (const x of d) m = Math.max(m, Math.abs(x)); return 20 * Math.log10(m + 1e-30); }; });
let mx = -999; for (let i = 0; i < 20; i++) { mx = Math.max(mx, await page.evaluate(() => __lv())); await sleep(100); }
ok('Mikrofon → E2 → DIREKT hörbar', mx > -60, mx.toFixed(1) + ' dBFS');
// 🎤 Stimme dazu, dann Vocoder aus: Stimme läuft weiter, dann Stimme aus -> ended
const s1 = await page.evaluate(async () => { try { await SYNQUENZER.stimmeStart({route: 'wired', cal: false}); } catch (e) { return 'err ' + e; } await new Promise(r => setTimeout(r, 1500)); return {phase: SYNQUENZER.stimme().phase, users: [...MICTAP.users], gum: window.__gum}; });
await page.evaluate(() => SYNQUENZER.mkVocMic(false)); await sleep(400);
const s2 = await page.evaluate(() => ({phase: SYNQUENZER.stimme().phase, users: [...MICTAP.users], ready: window.__t.readyState}));
await page.evaluate(() => SYNQUENZER.stimmeStop('aus')); await sleep(500);
const s3 = await page.evaluate(() => ({users: [...MICTAP.users], ready: window.__t.readyState, stream: !!MICTAP.stream}));
ok('MK7-10 Stimme + Vocoder: ein Strom, Stoppen des einen lässt den anderen', s1.gum === 1 && s2.ready === 'live' && s2.phase === 'live' && s3.ready === 'ended' && !s3.stream, JSON.stringify({s1, s2, s3}));
const net = await page.evaluate(() => window.__net);
ok('MK7-10 0 Netzaufrufe', net === 0, String(net));
ok('keine Konsolenfehler', !errs.length, errs.slice(0, 3).join(' | '));
Q.summary(); await br.close();
