import { chromium } from 'playwright';
import { INIT, EXE } from './v3-vs2-h.mjs';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/index.html';
const BLEED = () => {
  const oc = AudioNode.prototype.connect; window.__toDest = [];
  AudioNode.prototype.connect = function (d, ...a) { if (d && d instanceof AudioDestinationNode) window.__toDest.push(this); return oc.call(this, d, ...a); };
  window.__bleed = (gain) => { const F = window.__fake, ctx = window.__ctx; const g = ctx.createGain(); g.gain.value = gain; const dl = ctx.createDelay(0.1); dl.delayTime.value = 0.012; g.connect(dl); oc.call(dl, F.bus); for (const n of window.__toDest) { try { oc.call(n, g); } catch (e) {} } return window.__toDest.length; };
};
const gain = +(process.argv[2] || 0.1);
const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
const p = await (await br.newContext({viewport: {width: 390, height: 844}})).newPage(); const errs = [];
p.on('pageerror', e => console.log('PAGEERR', String(e))); p.on('console', m => console.log('CON', m.type(), m.text().slice(0,300)));
await p.addInitScript(INIT); await p.addInitScript(BLEED);
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await p.waitForTimeout(500);
await p.evaluate(() => { const Q = SYNQUENZER; Q.play(); Q.stop(); return Q.stimmeStart({route: 'speaker', cal: false}); });
await p.waitForTimeout(3000); console.log(JSON.stringify(await p.evaluate(() => { const s = SYNQUENZER.stimme(); return {phase: s.phase, err: s.err, on: s.on}; })));
await p.evaluate(g => window.__bleed(g), gain);
const wb = (b, to = 40000) => p.waitForFunction(x => SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 10});
await p.evaluate(() => { const Q = SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'};
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 1, d: .1, n: 42, v: .7}, {t: 2, d: .1, n: 38, v: .9}, {t: 3, d: .1, n: 42, v: .7}]});
  Q.launchScene(0); });
await wb(6);
await p.evaluate(() => { const Q = SYNQUENZER; Q.setRecOptions({countIn: 0, length: 1, quantize: '1/16'}); Q.selectSlot(3, 0); Q.rec(); });
await p.waitForFunction(() => /rec/.test(SYNQUENZER.runtime().rec.state), null, {timeout: 10000}).catch(() => {});
const rs = await p.evaluate(() => SYNQUENZER.runtime().rec);
const b0 = rs.startBeat != null ? rs.startBeat : Math.ceil(await p.evaluate(() => SYNQUENZER.runtime().beat));
for (let k = 0; k < 4; k++) { await wb(b0 + k - .02); await p.evaluate(n => SYNQUENZER.tap(n, 200), 60 + 2 * k); }
await wb(b0 + 8); await p.waitForTimeout(2500);
const r = await p.evaluate(() => {
  const A = VS.res && VS.res.A; if (!A) return {none: true, info: SYNQUENZER.vsInfo().bleedDb, lat: ST.latMs};
  const sg = VSD.segment(A.tr, {snap: false, tuning: 'auto', attack: A.inst});
  const lat = F => stLatAt(F) * A.sr / 1000;
  return {bleedDb: vsBleedDb(), lat: ST.latMs, bleedN: A.bleedN, notes: sg.notes.map(n => {
    // ratio
    const bl = 1; const G = ST.ring; return [n.t0.toFixed(2), n.t1.toFixed(2), n.m, vsBleedNote(A.x, A.d0, A.fs, A.sr, lat, n, vsBleedPow()), A.beatOf(n.t0).toFixed(2)]; }), res: VS.res.clip && VS.res.clip.notes.map(n => [n.t, n.n])};
});
console.log(JSON.stringify(r)); console.log(errs);
await br.close();
