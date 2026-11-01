// H4251 Test-Bibliothek: Fake-Mikro im selben AudioContext (wie bau/tests/v3-vs2-h.mjs), audioSession-Attrappe, Toast-Mitschrift,
// Overlay-Abtastung (M-OVL), Testprojekt g10-demo / g10-vox. Aufruf der Tests: node <test>.mjs <index.html>
import {chromium} from './pw.mjs';
import path from 'path';
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const INIT = () => {
  const O = window.AudioContext;
  window.AudioContext = class extends O { constructor(o) { super(o); window.__ctx = this; } };
  window.webkitAudioContext = window.AudioContext;
  const F = window.__fake = {gum: 0, srcs: [], deny: false};
  // audioSession-Attrappe: jede Zuweisung von type wird mitgeschrieben
  const AS = window.__as = {log: [], type: 'auto'};
  try { Object.defineProperty(navigator, 'audioSession', {configurable: true, value: {get type() { return AS.type; }, set type(v) { AS.type = v; AS.log.push(v); }}}); } catch (e) {}
  if (!navigator.mediaDevices) return;
  navigator.mediaDevices.getUserMedia = async () => {
    F.gum++;
    if (F.deny) { const e = new Error('denied'); e.name = 'NotAllowedError'; throw e; }
    const ctx = window.__ctx, dest = ctx.createMediaStreamDestination(); dest.channelCount = 1;
    const g = ctx.createGain(); g.connect(dest); F.dest = dest; F.bus = g;
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = nb.getChannelData(0); let s = 12345;
    for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647 - 0.5) * 0.0008; }
    const ns = ctx.createBufferSource(); ns.buffer = nb; ns.loop = true; ns.connect(g); ns.start();
    // „Gesang“: Vokal aus Obertönen (220 Hz), damit der Take etwas enthält
    const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = 220; og.gain.value = 0.05; o.connect(og); og.connect(g); o.start();
    return dest.stream;
  };
  window.__toasts = [];
  const watch = () => { const t = document.getElementById('toast'); if (!t) return setTimeout(watch, 50); new MutationObserver(() => { const x = t.textContent.trim(); if (x && window.__toasts[window.__toasts.length - 1] !== x) window.__toasts.push(x); }).observe(t, {subtree: true, childList: true, characterData: true}); };
  document.addEventListener('DOMContentLoaded', watch);
};
let BR = null;
export async function browser() { if (!BR) BR = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']}); return BR; }
export async function closeAll() { if (BR) await BR.close(); BR = null; }
export async function open(file, o = {}) {
  const br = await browser();
  const ctx = await br.newContext({viewport: o.viewport || {width: 390, height: 844}, hasTouch: !!o.touch, isMobile: !!o.mobile});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/favicon|ERR_FILE_NOT_FOUND/.test(m.text())) errs.push(m.text()); });
  await p.addInitScript(INIT);
  if (o.init) await p.addInitScript(o.init);
  await p.goto('file://' + path.resolve(file) + (o.query || '')); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await sleep(300);
  return {ctx, p, errs, close: () => ctx.close()};
}
// Mikro an (Kabel-Weg ohne Pieptöne), Einmess-Profil für den Weg setzen
export async function micOn(p, route = 'wired') {
  await p.evaluate(r => { SYNQUENZER.play(); SYNQUENZER.stop(); return SYNQUENZER.stimmeStart({route: r, cal: false}); }, route);
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live' && SYNQUENZER.vsClock().ring && SYNQUENZER.vsClock().ring.end > 0, null, {timeout: 8000});
  await sleep(500);
}
// g10-demo: Demo; Szene 1 = Synth 1, Synth 2, Synth 3, Drums + Melodie-Clip; STIMME-Spur leer; Szene 2 = andere Clips;
// Song 8 Takte aus Szene 1, Melodie-Noten auf Melodie (song.mel[5]) und eigene Noten auf Synth 2 (song.mel[1])
export async function g10demo(p, o = {}) {
  return p.evaluate(o => {
    if (typeof switchProject === 'function') switchProject(demoProject(), {first: true});
    const mel = []; for (let b = 0; b < 4; b++) mel.push({t: b * 4, d: 1.5, n: 72 + (b % 3), v: .8}, {t: b * 4 + 2, d: 1, n: 76, v: .7});
    SYNQUENZER.setClip(5, 0, {len: 4, notes: mel});
    const c2 = SYNQUENZER.getClip(0, 0); if (c2) SYNQUENZER.setClip(0, 1, Object.assign({}, c2, {notes: c2.notes.map(n => Object.assign({}, n, {n: n.n + 5}))}));
    SYNQUENZER.tkAddTrack();
    SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: o.countIn == null ? 1 : o.countIn, length: o.length || 'auto'});
    if (o.song) {
      SYNQUENZER.songFromChain([{scene: 0, bars: 8}]);
      const s = SYNQUENZER.song(); delete s.melody; s.melodyTrack = 5;
      const mn = [], bn = []; for (let b = 0; b < 8; b++) { mn.push({t: b * 4, d: 1, n: 72 + (b % 4), v: .8}, {t: b * 4 + 2, d: 1, n: 79, v: .7}); bn.push({t: b * 4, d: 2, n: 40 + (b % 2) * 5, v: .9}); }
      s.mel = {5: {len: 8, key: {root: 0, scale: 'ionian', src: 'user'}, notes: mn}, 1: {len: 8, key: {root: 0, scale: 'ionian', src: 'user'}, notes: bn}};
      SYNQUENZER.setSong(s);
    }
    return {st: SYNQUENZER.tkInfo().stimme, tracks: S.tracks.map(t => t.name)};
  }, o);
}
// M-OVL: alle 40 ms #countin.show, #ciNum, #ciTgt, #ciHint mit dem hörbaren Schlag
export async function ovlStart(p) {
  await p.evaluate(() => { window.__ovl = []; clearInterval(window.__ovlIv); window.__ovlIv = setInterval(() => { const c = document.getElementById('countin'), q = id => (document.getElementById(id) || {}).textContent || ''; const k = SYNQUENZER.vsClock(); window.__ovl.push({b: k.playing ? +((k.now - k.outLat - k.start) / k.spb).toFixed(3) : null, show: c.classList.contains('show'), num: q('ciNum'), go: document.getElementById('ciNum').classList.contains('go'), tgt: q('ciTgt'), hint: q('ciHint')}); }, 40); });
}
export async function ovlStop(p) { return p.evaluate(() => { clearInterval(window.__ovlIv); return window.__ovl; }); }
export async function audBeat(p) { return p.evaluate(() => { const c = SYNQUENZER.vsClock(); return c.playing ? (c.now - c.outLat - c.start) / c.spb : null; }); }
export async function waitBeat(p, b, t = 120000) { await p.waitForFunction(b => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= b; }, b, {timeout: t, polling: 20}); }
export async function idle(p) { await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0, null, {timeout: 60000}); await sleep(200); }
export async function log(p) { return p.evaluate(() => SYNQUENZER.noteLog(4096)); }
export const T = () => { let n = 0, f = 0; const ok = (id, c, info) => { n++; if (!c) f++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); return c; }; ok.sum = () => { console.log('ERGEBNIS', n - f, '/', n, 'PASS'); return f; }; return ok; };
