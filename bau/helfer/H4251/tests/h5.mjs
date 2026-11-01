// H5 Abnahme H-40 … H-43: ● auf STIMME ohne 🎤 schaltet das Mikro ein statt still leer aufzunehmen. node h5.mjs <index.html>
import {open, g10demo, closeAll, sleep, waitBeat, T} from './h-lib.mjs';
const FILE = process.argv[2], ok = T();
const PROF = route => `localStorage.setItem('synq-stimme-v1', JSON.stringify({v: 1, route: '${route}', prof: {speaker: {ms: 40, spread: 1, at: 'test', how: 'gemessen', gainDb: -20}, wired: {ms: 12, spread: 1, at: 'test', how: 'gemessen'}}}));`;
const watch = p => p.evaluate(() => { window.__w = []; window.__wIv = setInterval(() => window.__w.push({t: performance.now(), playing: R.playing, cal: !!ST.cal, phase: ST.phase, rec: rec.state, show: document.getElementById('countin').classList.contains('show'), tgt: document.getElementById('ciTgt').textContent}), 20); });
const press = p => p.evaluate(() => { for (let i = 0; i < NT(); i++) { R.slot[i] = -1; R.pend[i] = null; } SYNQUENZER.selectSlot(SYNQUENZER.tkInfo().stimme, 0); window.__toasts.length = 0; SYNQUENZER.rec(); });
// H-40 eingemessen (Weg Lautsprecher: Kurz-Einmessung beim Start), 🎤 aus → Mikro an, Transport erst nach „live“ + Ende der Kurz-Einmessung
{
  const H = await open(FILE, {init: PROF('speaker')}), p = H.p; await g10demo(p); await sleep(500);
  const on0 = await p.evaluate(() => SYNQUENZER.stimme().on);
  await watch(p); await press(p);
  await p.waitForFunction(() => R.playing, null, {timeout: 8000}).catch(() => {});
  await p.waitForFunction(() => SYNQUENZER.runtime().rec.state === 'recording', null, {timeout: 12000}).catch(() => {});
  const b0 = await p.evaluate(() => SYNQUENZER.runtime().rec.startBeat || 0);
  await waitBeat(p, b0 + 4.3).catch(() => {}); await p.evaluate(() => SYNQUENZER.rec());
  await p.waitForFunction(() => SYNQUENZER.runtime().rec.state === 'off' && !SYNQUENZER.tkInfo().pend.length && !SYNQUENZER.vsInfo().busy, null, {timeout: 30000}).catch(() => {}); await sleep(600);
  const w = await p.evaluate(() => { clearInterval(window.__wIv); return window.__w; });
  const r = await p.evaluate(() => ({on: SYNQUENZER.stimme().on, toasts: window.__toasts.slice(), clip: SYNQUENZER.getClip(SYNQUENZER.tkInfo().stimme, 0), calN: SYNQUENZER.stimme().calN}));
  const firstPlay = w.find(x => x.playing), lastCal = [...w].reverse().find(x => x.cal), live = w.find(x => x.phase === 'live');
  ok('H-40 🎤 wird eingeschaltet, Toast „🎤 an – gleich geht\'s los“', !on0 && r.on && r.toasts.some(t => /🎤 an – gleich geht/.test(t)), JSON.stringify(r.toasts));
  ok('H-40 Transport startet erst nach „live“ und nach dem Ende der Kurz-Einmessung', !!firstPlay && !!live && live.t < firstPlay.t && !!lastCal && lastCal.t < firstPlay.t && !w.some(x => x.playing && x.cal),
    JSON.stringify({live: live && Math.round(live.t - w[0].t), calEnde: lastCal && Math.round(lastCal.t - w[0].t), start: firstPlay && Math.round(firstPlay.t - w[0].t)}));
  ok('H-40 Overlay „🎤 wird bereit …“ während des Wartens', w.some(x => x.show && !x.playing && /wird bereit/.test(x.tgt)));
  ok('H-40 Take aufgenommen (Länge ≥ 1 Takt)', !!(r.clip && r.clip.audio && r.clip.len >= 1), JSON.stringify(r.clip && {len: r.clip.len}));
  ok('H-40 Konsole', !H.errs.length, H.errs.join('|').slice(0, 200));
  await H.close();
}
// H-40 Kabel-Weg (Xanders B-1: Kabel-Kopfhörer, App frisch): keine Kurz-Einmessung, Start nach „live“ ohne 4-s-Abbruch
{
  const H = await open(FILE, {init: PROF('wired')}), p = H.p; await g10demo(p); await sleep(500);
  await watch(p); await press(p);
  const st = await p.waitForFunction(() => SYNQUENZER.runtime().rec.state === 'recording', null, {timeout: 6000}).then(() => true, () => false);
  const w = await p.evaluate(() => { clearInterval(window.__wIv); return window.__w; });
  const r = await p.evaluate(() => ({route: SYNQUENZER.stimme().route, t: window.__toasts.slice()}));
  const fp = w.find(x => x.playing);
  ok('H-40 Kabel-Weg: Aufnahme startet (< 4 s, kein „Mikro noch nicht bereit“)', st && r.route === 'wired' && !!fp && fp.t - w[0].t < 4000 && !r.t.some(x => /noch nicht bereit/.test(x)), JSON.stringify({st, route: r.route, start: fp && Math.round(fp.t - w[0].t), t: r.t}));
  await p.evaluate(() => { SYNQUENZER.rec(); SYNQUENZER.stop(); }); await H.close();
}
// H-44 ■ während „🎤 wird bereit“ → abgebrochen; H-45 anderes Projekt während des Wartens → abgebrochen
for (const how of ['stop', 'projekt', 'zelle']) {
  const H = await open(FILE, {init: PROF('speaker')}), p = H.p; await g10demo(p); await sleep(300);
  await press(p); await sleep(300);
  await p.evaluate(how => { if (how === 'stop') SYNQUENZER.stop(); else if (how === 'projekt') switchProject(demoProject(), {first: true}); else SYNQUENZER.selectSlot(0, 1); }, how);
  await sleep(4500);
  const r = await p.evaluate(() => ({playing: R.playing, rec: SYNQUENZER.runtime().rec.state, wait: !!MICW.iv, t: window.__toasts.slice()}));
  ok('H-44 ' + how + ' während „🎤 wird bereit“: keine Aufnahme, kein Transport', !r.playing && r.rec === 'off' && !r.wait && r.t.includes('Aufnahme abgebrochen'), JSON.stringify(r));
  await H.close();
}
// H-41 ohne getUserMedia
{
  const H = await open(FILE, {init: 'navigator.mediaDevices && (navigator.mediaDevices.getUserMedia = undefined);' + PROF('wired')}), p = H.p; await g10demo(p);
  await press(p); await sleep(800);
  const r = await p.evaluate(() => ({playing: R.playing, rec: SYNQUENZER.runtime().rec.state, t: window.__toasts.slice()}));
  ok('H-41 ohne getUserMedia: kein Transport, rec off, Toast', !r.playing && r.rec === 'off' && r.t.some(x => /Kein Mikrofon – Gesang braucht 🎤/.test(x)), JSON.stringify(r));
  await H.close();
}
// H-42 Profil ohne Einmessung
{
  const H = await open(FILE), p = H.p; await g10demo(p);
  await p.evaluate(() => SYNQUENZER.stimmeForget());
  await press(p); await sleep(2500);
  const r = await p.evaluate(() => ({playing: R.playing, rec: SYNQUENZER.runtime().rec.state, sheet: SYNQUENZER.stimme().sheet, cal: SYNQUENZER.stimme().cal, t: window.__toasts.slice(), takes: Object.keys(SYNQUENZER.takes()).length}));
  ok('H-42 ohne Einmessung: Einmessen offen, kein Transport, keine Aufnahme', !r.playing && r.rec === 'off' && (r.sheet || !!r.cal) && r.takes === 0 && r.t.some(x => /Erst einmessen, dann ●/.test(x)), JSON.stringify(r));
  await H.close();
}
// H-43 Erlaubnis verweigert
{
  const H = await open(FILE, {init: 'window.__fake.deny = true;' + PROF('wired')}), p = H.p; await g10demo(p);
  await press(p); await sleep(1000);
  const r = await p.evaluate(() => ({playing: R.playing, rec: SYNQUENZER.runtime().rec.state, t: window.__toasts.slice(), wait: !!MICW.iv}));
  await sleep(1500); const t2 = await p.evaluate(() => window.__toasts.slice());
  ok('H-43 verweigert: nach ≤ 1 s rec off, Transport steht, kein „Nichts aufgenommen“', !r.playing && r.rec === 'off' && !r.wait && !t2.some(x => /Nichts aufgenommen/.test(x)), JSON.stringify(Object.assign(r, {t2})));
  await H.close();
}
await closeAll(); process.exit(ok.sum() ? 1 : 0);
