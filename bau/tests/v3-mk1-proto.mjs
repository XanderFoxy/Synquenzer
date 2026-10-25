// MK1-18 Protokoll (Nachtrag 3): a gesture during a sounding note arrives in the next control block (Node harness); the VA and FM
// messages to the worklet stay byte-equal to the predecessor (Chromium, both apps, the same actions).
// Usage: node v3-mk1-proto.mjs <new.html> <predecessor.html>
import path from 'path';
import { chromium } from 'playwright';
import { render, mkPatch } from './v3-mk1-node.mjs';
const NEW = path.resolve(process.argv[2]), OLD = path.resolve(process.argv[3]);
process.env.MK_FILE = NEW;
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
// ---- next block: {mkSet} between two blocks changes the very next block, nothing before ----
{
  const P = mkPatch({f: {cut: 100, res: 40}, a: {gate: 1}}), ev = [[0, 'on', 48, .8]], tg = 64 * 128 / 48000;   // between block 63 and 64
  const a = render(P, ev, {sec: .3, file: NEW}).l, b = render(P, ev, {sec: .3, file: NEW, at: [[tg, {mkSet: {'t.0.f.cut': 20.5}}]]}).l;
  const blk = k => { let m = 0; for (let i = k * 128; i < k * 128 + 128; i++) m = Math.max(m, Math.abs(a[i] - b[i])); return m; };
  let before = 0; for (let k = 0; k < 64; k++) before = Math.max(before, blk(k));
  ok('MK1-18 Protokoll: eine Geste ({mkSet}, Bruchwert) bei klingender Note wirkt im nächsten Steuerblock, davor nichts', before === 0 && blk(64) > 1e-4, 'davor max |Δ| ' + before + ', Block danach ' + blk(64).toExponential(2));
}
// ---- byte-equal VA / FM messages ----
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
async function record(file) {
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
  await ctx.addInitScript(() => {
    window.__wm = []; const pm = MessagePort.prototype.postMessage;
    MessagePort.prototype.postMessage = function (m) { if (this.__wk) { try { window.__wm.push(JSON.stringify(m)); } catch (e) {} } return pm.apply(this, arguments); };
    const AW = window.AudioWorkletNode; if (AW) window.AudioWorkletNode = class extends AW { constructor(c, n, o) { super(c, n, o); try { this.port.__wk = true; window.__wm.push('NEW ' + n + ' ' + JSON.stringify(o && o.processorOptions)); } catch (e) {} } };
  });
  const p = await ctx.newPage(); await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.evaluate(async () => { ensureAudio(); await AU.ctx.resume(); }); await p.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000});
  const steps = [
    () => { SYNQUENZER.selectTrack(0); },
    () => { const v = auditionStart(0, 60, .8); setTimeout(() => v && v.release && v.release(AU.ctx.currentTime), 150); },
    () => { SYNQUENZER.setParam ? SYNQUENZER.setParam(0, 'cutoff', 1200) : null; },
    () => { SYNQUENZER.setEngine(0, 'fm6'); },
    () => { const v = auditionStart(0, 64, .8); setTimeout(() => v && v.release && v.release(AU.ctx.currentTime), 150); },
    () => { SYNQUENZER.setEngine(0, 'va'); },
    () => { const v = auditionStart(0, 67, .7); setTimeout(() => v && v.release && v.release(AU.ctx.currentTime), 150); }];
  const out = [await p.evaluate(() => window.__wm.slice())];   // the engine creation (processorOptions) and the first messages
  for (let k = 0; k < steps.length; k++) {
    await p.evaluate(() => { window.__wm.length = 0; });
    await p.evaluate(`(${steps[k].toString()})()`);
    await p.waitForTimeout(500);
    out.push(await p.evaluate(() => window.__wm.slice()));
  }
  await ctx.close();
  // times in note events ([t, type, id, ...]) and engine-load reports differ between runs: replaced by placeholders
  return out.map(L => L.map(s => s.replace(/\[(-?\d+(\.\d+)?(e-?\d+)?),(\d)/g, '[T,$4').replace(/"(at|t|time|when|start|t0|songStart)":-?\d+(\.\d+)?(e-?\d+)?/g, '"$1":T')));
}
const A = await record(OLD), B = await record(NEW);
const diff = []; A.forEach((L, k) => { if (JSON.stringify(L) !== JSON.stringify(B[k])) diff.push(k + ': ' + JSON.stringify(L).slice(0, 160) + ' ≠ ' + JSON.stringify(B[k]).slice(0, 160)); });
ok('MK1-18 Protokoll: VA- und FM-Nachrichten byte-gleich zum Vorgänger (Anlegen mit processorOptions + 7 Schritte: Spur, Note, Cutoff, FM, Note, VA, Note)', !diff.length && A.some(L => L.length), diff.slice(0, 2).join(' | ') + ' · Nachrichten ' + A.map(L => L.length).join('/'));
await browser.close();
console.log('\n' + (fails ? fails + ' FEHLER' : 'alles bestanden'));
process.exit(fails ? 1 : 0);
