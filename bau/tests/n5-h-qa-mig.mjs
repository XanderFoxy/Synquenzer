// QA VC2a-02: import of a REAL older-format project (written by snapshot V2c-fix, format 4; and a format-3 envelope of it) -> 'mig' keyframe, historyCheck true
import { chromium } from 'playwright';
const SP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const pg = async f => { const ctx = await b.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); await p.goto('file://' + f); await p.waitForTimeout(2500); return {p, errs}; };
const O = await pg(SP + 'synq-snapshots/V2c-fix.html');
await O.p.evaluate(() => { const Q = SYNQUENZER; Q.setClip(1, 2, {len: 2, notes: [{n: 62, t: 0, d: 1, v: .8}]}); Q.setBpm(101); });
const f4 = await O.p.evaluate(() => SYNQUENZER.serialize());
console.log('old file format', JSON.parse(f4).format, JSON.parse(f4).appVersion);
const N = await pg(SP + 'n5-br-H/index.html');
await N.p.evaluate(() => { SYNQUENZER.setClip(3, 1, {len: 1, notes: [{n: 64, t: 0, d: 1, v: .8}]}); });
await N.p.waitForTimeout(500);
const r = await N.p.evaluate(async f => { SYNQUENZER.importJSON(f); await new Promise(r => setTimeout(r, 1200)); const c = await historyCheck({detail: true}); const kw = HIST.cur.kf.map(k => k.w); const meta = []; await histWalk(K => { meta.push(K.format + '/' + K.appVersion); }); return {c, kw, meta, id: S.id, bpm: S.bpm}; }, f4);
console.log('import format 4:', JSON.stringify(r));
await N.p.evaluate(() => { SYNQUENZER.setClip(2, 2, {len: 1, notes: [{n: 67, t: 0, d: 1, v: .8}]}); selectTrack(5); });
console.log('gesture after import:', JSON.stringify(await N.p.evaluate(() => historyCheck({detail: true}))));
console.log('errors', JSON.stringify([O.errs.slice(0, 2), N.errs.slice(0, 2)]));
await b.close();
