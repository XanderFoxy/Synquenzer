// QA musiker VV1 (iPhone): screen-awake during „Video erstellen“ (like „Song als Audio“), and the page hidden for > 30 s during
// the real-time fallback (screen lock / app switch) → does the job survive?
import { open, buildSong, OUTQ } from './n5-v-qm-lib.mjs';
import { execSync } from 'child_process';
import fs from 'fs';
const init = () => { window.__wake = 0; const fake = {request: async () => { window.__wake++; const s = {released: false, addEventListener() {}, release: async () => { s.released = true; }}; return s; }};
  try { Object.defineProperty(navigator, 'wakeLock', {configurable: true, get: () => fake}); } catch (e) {}
  window.__hid = false; Object.defineProperty(document, 'hidden', {configurable: true, get: () => window.__hid}); Object.defineProperty(document, 'visibilityState', {configurable: true, get: () => (window.__hid ? 'hidden' : 'visible')}); };
const {b, p, errs} = await open({touch: true, init});
await buildSong(p, {take: false, bars: +(process.env.BARS || 12)});
const info = () => p.evaluate(() => ({wake: window.__wake, sentinel: !!(WAKE.sentinel && !WAKE.sentinel.released), busy: SYNQUENZER.vvInfo().busy, ctx: AU.ctx.state, prog: (document.querySelector('#vvSheet .vvprog span') || {}).textContent}));
// A: „Song als Audio“ reference
const sa = await p.evaluate(async () => { const w0 = window.__wake; songAudioStart(); await new Promise(r => setTimeout(r, 800)); const w1 = window.__wake; songAudioStop(true); await new Promise(r => setTimeout(r, 500)); return {wakeRequests: w1 - w0}; });
console.log('Song als Audio:', JSON.stringify(sa));
await p.evaluate(() => { wakeRelease(); });
// B: Video erstellen (default way here: real-time recorder) from the sheet
await p.evaluate(() => SYNQUENZER.vvOpen()); await p.waitForTimeout(400);
const w0 = await p.evaluate(() => window.__wake);
const go = await p.$('#vvSheet .vvacts .go'); const q = await go.boundingBox(); await p.touchscreen.tap(q.x + q.width / 2, q.y + q.height / 2);
await p.waitForFunction(() => /Bild in Echtzeit|Video wird erstellt/.test((document.querySelector('#vvSheet .vvprog span') || {}).textContent || ''), null, {timeout: 60000, polling: 50});
await p.waitForTimeout(1000);
const i1 = await info(); console.log('creating:', JSON.stringify(Object.assign(i1, {wakeRequestsSinceTap: i1.wake - w0})));
// the page goes hidden (screen lock / app switch) for 35 s
await p.evaluate(() => { window.__hid = true; document.dispatchEvent(new Event('visibilitychange')); });
await p.waitForTimeout(35000);
const i2 = await info(); console.log('hidden 35 s:', JSON.stringify(i2));
await p.evaluate(() => { window.__hid = false; document.dispatchEvent(new Event('visibilitychange')); });
const tB = Date.now();
await p.waitForFunction(() => !SYNQUENZER.vvInfo().busy, null, {timeout: 150000, polling: 200}).catch(() => {});
const i3 = await info(); console.log('visible again, after', ((Date.now() - tB) / 1000).toFixed(1), 's:', JSON.stringify(Object.assign(i3, {res: await p.evaluate(() => { const r = SYNQUENZER.vvInfo().res; return r && {how: r.how, dur: r.dur, size: r.size}; })})));
const bl = await p.evaluate(() => SYNQUENZER.vvBlob());
if (bl) { const f = OUTQ + 'wake-hidden.' + bl.ext; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64')); console.log('file', execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 ${f}`).toString().trim(), execSync(`node n5-v-qm-aud.mjs ${f}`).toString().trim().slice(0, 400)); }
else console.log('no file; busy still', (await info()).busy);
console.log('errors', errs);
await b.close();
