// HIF (4.25.4): USB-Interface am iPhone – Eingang wählen, Weg halten, neu öffnen.  node hif-iface.mjs <app.html>
// Attrappen per addInitScript: zwei Eingänge ('iPhone Mikrofon', 'USB Audio Interface'; Namen erst nach der Erlaubnis wie in
// Safari), getUserMedia zeichnet die Wünsche auf (window.__gum) und liefert den Fake-Strom mit passendem Namen/deviceId,
// navigator.audioSession zählt jeden Wechsel (window.__sess).
import {chromium} from 'playwright';
const APP = process.argv[2];
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']});
const INIT = () => {
  const DEV = [{id: 'dev-iphone', label: 'iPhone Mikrofon'}, {id: 'dev-usb', label: 'USB Audio Interface'}];
  window.__dev = DEV; window.__gum = []; window.__granted = false; window.__failExact = false; window.__forceLabel = null;
  let ty = 'auto'; window.__sess = {n: 0, log: []};
  Object.defineProperty(navigator, 'audioSession', {configurable: true, value: {get type() { return ty; }, set type(v) { if (v !== ty) { window.__sess.n++; window.__sess.log.push(v + '@' + (window.ST && ST.on ? 'on' : 'off')); } ty = v; }}});
  const md = navigator.mediaDevices, gum0 = md.getUserMedia.bind(md);
  md.enumerateDevices = async () => window.__dev.map(d => ({kind: 'audioinput', deviceId: d.id, groupId: 'g' + d.id, label: window.__granted ? d.label : ''}))
    .concat([{kind: 'audiooutput', deviceId: 'out', groupId: 'go', label: window.__granted ? 'Lautsprecher' : ''}]);
  md.getUserMedia = async c => {
    const a = (c && c.audio) || {}, ex = a.deviceId && a.deviceId.exact;
    window.__gum.push(ex || null);
    if (ex && window.__failExact) { const e = new Error('exact'); e.name = 'OverconstrainedError'; throw e; }
    const d = (ex && window.__dev.find(x => x.id === ex)) || window.__dev[0];
    if (ex && !d) { const e = new Error('nf'); e.name = 'OverconstrainedError'; throw e; }
    const st = await gum0({audio: true}); window.__granted = true;
    const t = st.getAudioTracks()[0], gs = t.getSettings.bind(t);
    Object.defineProperty(t, 'label', {get: () => window.__forceLabel || d.label});
    t.getSettings = () => Object.assign(gs(), {deviceId: window.__forceLabel ? 'dev-iphone' : d.id});
    return st;
  };
};
async function page(o = {}) {
  const p = await b.newPage({viewport: {width: 390, height: 844}});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT);
  await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 30000});
  await p.mouse.click(5, 300); await p.waitForTimeout(600);
  if (o.before) await p.evaluate(o.before);
  return {p, errs};
}
const live = p => p.waitForFunction(() => ST.on && ST.phase === 'live' && ST.ring && ST.ring.end - ST.ring.start > 0.6 * ST.ring.sr, null, {timeout: 10000});
const R = {}, ok = {};

// 1) Auswahl: USB wird bevorzugt, exact-deviceId, kein Kurz-Einmessen, Weg Kopfhörer
{
  const {p, errs} = await page({before: () => { localStorage.setItem('synq-stimme-v1', JSON.stringify({v: 1, route: 'speaker', prof: {speaker: {ms: 30, spread: 1, at: '', how: 'gemessen'}}})); ST.prof = null; }});
  await p.evaluate(() => SYNQUENZER.stimmeStart()); await live(p); await p.waitForTimeout(800);
  R.pick = await p.evaluate(() => ({mi: SYNQUENZER.micIn(), gum: window.__gum.slice(), route: ST.route, cal: ST.cal, calN: ST.calN || 0, lastCal: ST.lastCal || null, marks: ST.marks.map(m => m.how), hint: (rec.vox = true, rec.state = 'armed', recCiHint())}));
  await p.evaluate(() => { rec.state = 'off'; rec.vox = false; });
  ok.pick = R.pick.mi.id === 'dev-usb' && R.pick.mi.ext && R.pick.gum[R.pick.gum.length - 1] === 'dev-usb' && R.pick.route === 'wired' && !R.pick.cal && !R.pick.calN && !R.pick.marks.includes('kurz') && R.pick.hint === '🎧 Interface: USB Audio Interface';
  // Blatt: Zeile „Eingang:“ mit ≥ 44 px
  await p.evaluate(() => stSheet()); await p.waitForTimeout(400);
  R.sheet = await p.evaluate(() => { const s = document.querySelector('.stpop #stIn'); if (!s) return null; const q = s.getBoundingClientRect(); return {h: q.height, opts: [...s.options].map(o => o.textContent), val: s.value, row: s.parentElement.textContent.slice(0, 8)}; });
  ok.sheet = !!R.sheet && R.sheet.h >= 44 && R.sheet.opts.length === 3 && R.sheet.row.startsWith('Eingang');
  // Wahl iPhone im Blatt → neu öffnen mit dessen id, gemerkt per Name; zurück auf automatisch
  await p.selectOption('.stpop #stIn', 'iPhone Mikrofon'); await p.waitForTimeout(600);
  R.choose = await p.evaluate(() => ({mi: SYNQUENZER.micIn(), pref: uiPrefs().micIn, last: window.__gum[window.__gum.length - 1], on: ST.on}));
  await p.evaluate(() => SYNQUENZER.micInSet('auto')); await p.waitForTimeout(600);
  R.chooseBack = await p.evaluate(() => ({id: MICIN.id, last: window.__gum[window.__gum.length - 1], route: ST.route}));
  ok.choose = R.choose.mi.id === 'dev-iphone' && R.choose.pref === 'iPhone Mikrofon' && R.choose.last === 'dev-iphone' && R.choose.on && R.chooseBack.id === 'dev-usb' && R.chooseBack.route === 'wired';
  // 4) devicechange: iOS legt die Spur aufs iPhone → neu öffnen mit derselben deviceId; Spur-Ende ebenso
  const n0 = await p.evaluate(() => MICIN.reopen);
  await p.evaluate(() => { window.__forceLabel = 'iPhone Mikrofon'; navigator.mediaDevices.dispatchEvent(new Event('devicechange')); setTimeout(() => { window.__forceLabel = null; }, 0); });
  await p.waitForTimeout(800);
  R.dev = await p.evaluate(() => ({reopen: MICIN.reopen, id: MICIN.id, last: window.__gum[window.__gum.length - 1], on: ST.on, route: ST.route, toast: (EL.toast && EL.toast.textContent) || ''}));
  await p.evaluate(() => ST.run.track.dispatchEvent(new Event('ended'))); await p.waitForTimeout(800);
  R.ended = await p.evaluate(() => ({reopen: MICIN.reopen, id: MICIN.id, last: window.__gum[window.__gum.length - 1], on: ST.on, err: ST.err, ringGrows: ST.ring.end}));
  await p.waitForTimeout(400); const e2 = await p.evaluate(() => ST.ring.end);
  ok.dev = R.dev.reopen === n0 + 1 && R.dev.toast.includes('Eingang neu geöffnet') && R.dev.id === 'dev-usb' && R.dev.last === 'dev-usb' && R.dev.on && R.dev.route === 'wired';
  ok.ended = R.ended.reopen === n0 + 2 && R.ended.id === 'dev-usb' && R.ended.last === 'dev-usb' && R.ended.on && !R.ended.err && e2 > R.ended.ringGrows;
  R.errs1 = errs.slice(); await p.close();
}
// 2) Rückfall: exact scheitert (OverconstrainedError) → Standard-Eingang, 🎤 läuft
{
  const {p, errs} = await page({before: () => { window.__granted = true; window.__failExact = true; }});
  await p.evaluate(() => SYNQUENZER.stimmeStart()); await live(p).catch(() => {});
  R.fb = await p.evaluate(() => ({on: ST.on, phase: ST.phase, err: ST.err, mi: SYNQUENZER.micIn(), gum: window.__gum.slice()}));
  ok.fb = R.fb.on && R.fb.phase === 'live' && !R.fb.err && R.fb.mi.fb && R.fb.gum[0] === 'dev-usb' && R.fb.gum[1] === null;
  R.errs2 = errs.slice(); await p.close();
}
// 3) Keine Sitzungs-Wechsel, solange 🎤 an ist: zwei Gesangs-Takes auf STIMME, dazwischen bleibt das Mikro offen
{
  const {p, errs} = await page();
  await p.evaluate(() => SYNQUENZER.stimmeStart()); await live(p); await p.waitForTimeout(300);
  const s0 = await p.evaluate(() => ({n: window.__sess.n, log: window.__sess.log.slice(), gum: window.__gum.length}));
  const take = async () => {
    await p.evaluate(() => { const st = stimmeT() >= 0 ? stimmeT() : (tkAddTrack(), stimmeT()); R.selT = st; R.selS = 1; recPress(); });
    let hint = ''; for (let i = 0; i < 30 && !hint; i++) { await p.waitForTimeout(100); hint = await p.evaluate(() => (EL.ciHint && EL.ciHint.textContent) || ''); }
    await p.waitForTimeout(2500);
    const st = await p.evaluate(() => rec.state); await p.evaluate(() => { if (rec.state !== 'off') recPress(); }); await p.waitForTimeout(600);
    await p.evaluate(() => { if (R.playing) stop(); }); await p.waitForTimeout(300);
    return {hint, st};
  };
  R.take1 = await take(); R.take2 = await take();
  R.sess = await p.evaluate(() => ({n: window.__sess.n, log: window.__sess.log.slice(), gum: window.__gum.length, on: ST.on, phase: ST.phase, mi: SYNQUENZER.micIn()}));
  R.sess0 = s0;
  await p.evaluate(() => SYNQUENZER.stimmeStop('aus')); await p.waitForTimeout(500);
  R.sessOff = await p.evaluate(() => ({type: navigator.audioSession.type, log: window.__sess.log.slice()}));
  ok.sess = R.sess.n === s0.n && R.sess.gum === s0.gum && R.sess.on && !R.sess.log.some(x => x === 'playback@on') && R.sessOff.type === 'playback' && R.take1.hint.startsWith('🎧 Interface') && R.take1.st !== 'off';
  R.errs3 = errs.slice(); await p.close();
}
// 5) Smoke: Laden ohne Konsolenfehler, Version
{
  const p = await b.newPage({viewport: {width: 390, height: 844}}); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForTimeout(2500);
  R.smoke = {v: await p.evaluate(() => [VERSION, APP_CODE, CLOUD.live]), errs};
  ok.smoke = R.smoke.v[0] === '4.25.4' && R.smoke.v[1] === 4025004 && R.smoke.v[2] === true && !errs.length;
  await p.close();
}
ok.noErr = ![R.errs1, R.errs2, R.errs3].some(e => e.length);
await b.close();
console.log(JSON.stringify(R, null, 1));
console.log('OK', JSON.stringify(ok), Object.values(ok).every(Boolean) ? 'ALLE GRÜN' : 'ROT');
