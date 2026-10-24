// Independent check: a part saved in V2c-fix (real [＋] tap while Am is held over a 4-bar bass clip) → serialize →
// importJSON in V2d (4.5.0) → launchPart. Compare the bass line (track 0) with V2c-fix. Plus controls in V2d.
import { chromium } from 'playwright';
const SNAP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2c-fix.html';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/index.html';
const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const b = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
async function page(file) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000});
  await p.waitForTimeout(800); return {p, errs, ctx};
}
const beatGt = (p, x) => p.waitForFunction(v => window.SYNQUENZER.runtime().beat > v, x, {timeout: 60000, polling: 20});
const bass = p => p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(n => n.track === 0 && n.beat != null).map(n => Math.round(n.beat) + ':' + n.clipNote + '/' + n.n));
async function playPart(p, bars = 9) {
  const b0 = await p.evaluate(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.launchPart(0); return Q.runtime().beat; });
  const st = Math.ceil((b0 + 1e-6) / 4) * 4; await beatGt(p, st + bars * 4 + .5);
  return {st, bass: await bass(p)};
}
// ---------- 1. V2c-fix: build, hold Am, tap the real [＋], save ----------
const A = await page(SNAP);
await A.p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}, N = (t, n) => ({t, d: .4, n, v: .8});
  Q.setClip(0, 0, {len: 4, key: K, notes: [N(0, 45), N(4, 48), N(8, 50), N(12, 52)]});
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}]});
  Q.setClip(0, 1, {len: 1, key: K, notes: [N(0, 57)]});
  Q.setKbMode('transpose'); Q.launchScene(0); });
await beatGt(A.p, 1);
await A.p.evaluate(async () => { const Q = window.SYNQUENZER; Q.keyOn(57, .8, 'h57'); await new Promise(r => setTimeout(r, 10)); Q.keyOn(60, .8, 'h60'); await new Promise(r => setTimeout(r, 10)); Q.keyOn(64, .8, 'h64'); });
await beatGt(A.p, 6);
const box = await A.p.evaluate(() => { const e = document.querySelector('#partBar .pk.empty'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, txt: e.textContent.trim()}; });
await A.p.touchscreen.tap(box.x, box.y); await A.p.waitForTimeout(400);
await A.p.evaluate(() => { const Q = window.SYNQUENZER; Q.keyOff('h57'); Q.keyOff('h60'); Q.keyOff('h64'); });
const partA = await A.p.evaluate(() => window.SYNQUENZER.parts()[0]);
const json = await A.p.evaluate(() => window.SYNQUENZER.serialize());
await A.p.evaluate(() => { const Q = window.SYNQUENZER; Q.setKbMode('play'); Q.launchScene(1); });
await beatGt(A.p, 13);
const refA = await playPart(A.p);
console.log('V2c-fix [＋] tapped:', JSON.stringify(box), 'part', JSON.stringify({len: partA && partA.len, chords: partA && partA.chords && partA.chords.len, slots: partA && partA.slots}));
console.log('V2c-fix part start', refA.st, 'bass beat:clipNote/n →', refA.bass.join(' '), 'errs', JSON.stringify(A.errs));
await A.ctx.close();
// ---------- 2. V2d: load the saved V2c-fix project, launch the part ----------
const B = await page(APP);
const ok = await B.p.evaluate(j => window.SYNQUENZER.importJSON(j), json);
await B.p.waitForTimeout(400);
const partB = await B.p.evaluate(() => window.SYNQUENZER.parts()[0]);
await B.p.evaluate(() => { const Q = window.SYNQUENZER; Q.launchScene(1); });
await beatGt(B.p, 5);
const refB = await playPart(B.p);
console.log('\nV2d importJSON ok', ok, 'bpm', await B.p.evaluate(() => window.SYNQUENZER.project().bpm), 'part', JSON.stringify({len: partB && partB.len, chords: partB && partB.chords && partB.chords.len, lanes: partB && partB.lanes}));
console.log('V2d part start', refB.st, 'bass beat:clipNote/n →', refB.bass.join(' '), 'errs', JSON.stringify(B.errs));
// ---------- 3. controls in V2d ----------
for (const [label, chords] of [['no chord row (len = longest clip)', null], ['8-bar chord row', {len: 8, ch: [{b: 0, tg: 'Am'}, {b: 16, tg: 'F'}]}], ['1-bar chord row (setPart)', {len: 1, ch: [{b: 0, tg: 'Am'}]}]]) {
  await B.p.evaluate(c => { const Q = window.SYNQUENZER; Q.stop && Q.stop(); const ch = c ? {len: c.len, ch: c.ch.map(x => ({b: x.b, tg: Q.parseChord(x.tg)}))} : null;
    Q.setPart(0, {name: 'Strophe', slots: [{s: 0}, null, null, null, {s: 0}, null], chords: ch}); }, chords);
  await B.p.waitForTimeout(300);
  const r = await playPart(B.p);
  console.log(`V2d control ${label}: partLen ${await B.p.evaluate(() => window.SYNQUENZER.parts()[0].len)} start ${r.st} →`, r.bass.join(' '));
}
console.log('errs', JSON.stringify(B.errs));
await b.close();
