// G6+f Test-Harness: Mikro-Attrappe (wie v3-vs2-h), synthetischer Gesang (n4-vs-p-lib), Chromium vorinstalliert
import {createRequire} from 'module';
const {chromium} = createRequire(import.meta.url)('playwright');
const INIT = () => {
  const O = window.AudioContext;
  window.AudioContext = class extends O { constructor(o) { super(o); window.__ctx = this; } };
  window.webkitAudioContext = window.AudioContext;
  const F = window.__fake = {gum: 0, srcs: []};
  if (!navigator.mediaDevices) return;
  navigator.mediaDevices.getUserMedia = async () => {
    F.gum++;
    const ctx = window.__ctx, dest = ctx.createMediaStreamDestination(); dest.channelCount = 1;
    const g = ctx.createGain(); g.connect(dest); F.dest = dest; F.bus = g;
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = nb.getChannelData(0); let s = 12345;
    for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647 - 0.5) * 0.0008; }
    const ns = ctx.createBufferSource(); ns.buffer = nb; ns.loop = true; ns.connect(g); ns.start();
    return dest.stream;
  };
  F.play = (b64, when, sr) => {
    const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const x = new Float32Array(u.buffer), ctx = window.__ctx, b = ctx.createBuffer(1, x.length, sr || ctx.sampleRate); b.getChannelData(0).set(x);
    const src = ctx.createBufferSource(); src.buffer = b; src.connect(F.bus); src.start(when); F.srcs.push(src); return when;
  };
};
import {sung} from '../../../tests/n4-vs-p-lib.mjs';
import path from 'path'; import url from 'url';
const HERE = path.dirname(url.fileURLToPath(import.meta.url));
export const APP = path.resolve(HERE, '../index.html');
export const sleep = ms => new Promise(r => setTimeout(r, ms));
let fail = 0; export const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
export const done = () => { console.log(fail ? `\n${fail} FEHLER` : '\nALLE OK'); process.exit(fail ? 1 : 0); };
export async function open(o = {}) {
  const br = o.br || await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: o.viewport || {width: 390, height: 844}});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT);
  await p.goto('file://' + (o.file || APP)); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await p.waitForTimeout(300);
  return {br, ctx, p, errs};
}
// Projekt mit einem STIMME-Take in Szene s (8 s Gesang), Take-Kennung zurück
export async function withTake(p, scenes = [0], o = {}) {
  await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
  const sr = await p.evaluate(() => window.__ctx.sampleRate), ids = [];
  for (const s of scenes) {
    const y = sung(o.sec || 8, sr, -20, {seed: 41 + s}).y, pcm = Array.from(y, v => Math.round(v * 32767));
    const r = await p.evaluate(([pc, sr, s]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: s, len: 4}), [pcm, sr, s]);
    ids.push(r.id);
  }
  await p.evaluate(() => tkLoadAll()); await p.waitForFunction(ids => ids.every(id => !!tkBuffer(id)), ids, {timeout: 15000});
  return {ids, sr};
}
// gehörte Fassung stabil (G4, Säubern, G2, Zeitkarte fertig): derselbe Puffer 1,5 s lang
export async function stable(p, id) {
  return p.evaluate(async id => { const r = {t: stimmeT(), s: 0}; let last = null, n = 0;
    for (let k = 0; k < 1200 && n < 60; k++) { await SYNQUENZER.g6pfWaitHeard(id, r); const b = tkBuffer(id) ? tkHeard(id, tkRef(r).a) : null; if (b && b === last) n++; else { n = 0; last = b; } await new Promise(q => setTimeout(q, 25)); }
    return n >= 60; }, id);
}
