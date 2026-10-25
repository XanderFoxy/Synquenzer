// QA V2c′ (acceptance lens) – part C: defaults (first boot, UI Neu/Init/Demo), old-file import, reload persistence, per-track, Stärke, auto
import { chromium } from 'playwright';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/index.html';
const OLD = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/VS2b-fix.html';
const exe = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const b = await chromium.launch({executablePath: exe, args: ['--autoplay-policy=no-user-gesture-required']});
const res = {};
const errs = [];
async function page(ctx, file) { const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime && window.SYNQUENZER.storage().booted, null, {timeout: 30000}); await p.waitForTimeout(800); return p; }
// C1 first boot
let ctx = await b.newContext({viewport: {width: 390, height: 844}});
let p = await page(ctx, APP);
res.C1 = await p.evaluate(() => ({name: window.SYNQUENZER.project().name, os: window.SYNQUENZER.project().settings.harmony.oneScale, ver: window.SYNQUENZER.version}));
// C2 UI: Menü → Neu ▾ → Mit Startsounds / Leer (Init) / Demo laden
async function menuClick(p, label) {
  await p.evaluate(() => { const m = document.querySelector('#menuBtn, .menuBtn, [data-act="menu"], #bMenu'); if (m) m.click(); });
  await p.waitForTimeout(300);
}
const ui = {};
for (const lbl of ['Mit Startsounds', 'Leer (Init)', 'Demo laden']) {
  if (!(await p.getByRole('button', {name: 'Neu ▾'}).isVisible().catch(() => false))) { await p.click('#bMenu'); await p.waitForTimeout(500); }
  if (lbl !== 'Demo laden') { await p.getByRole('button', {name: 'Neu ▾'}).click(); await p.waitForTimeout(150); }
  await p.getByRole('button', {name: lbl, exact: true}).click(); await p.waitForTimeout(900);
  // memory-mode two-step?
  const again = await p.getByRole('button', {name: 'Wirklich neu?'}).count(); if (again) { await p.getByRole('button', {name: 'Wirklich neu?'}).click(); await p.waitForTimeout(800); }
  ui[lbl] = await p.evaluate(() => ({name: window.SYNQUENZER.project().name, os: window.SYNQUENZER.project().settings.harmony.oneScale}));
}
res.C2 = ui;
// C3 a project saved with 4.5.2 (new project there, e-minor clip) imported into 4.5.3: off, sounds as before (A -> F#)
const p2 = await page(ctx, OLD);
const oldJson = await p2.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true});
  Q.setClip(0, 0, {len: 1, key: {root: 4, scale: 'aeolian', src: 'user'}, notes: [64, 66, 67, 69, 71, 72, 74].map((n, i) => ({t: i * .5, d: .4, n, v: .8}))});
  return Q.serialize(); });
const oldOut = await p2.evaluate(() => { const Q = window.SYNQUENZER; ensureAudio(); recallCarrier(Q.harmony.detectChord([60, 64, 67])); const c = S.tracks[0].clips[0];
  const o = [64, 66, 67, 69, 71, 72, 74].map(n => Q.outPitch(0, n, nowT(), c.key)); Q.resetCarrier(); return o; });
await p2.close();
res.C3 = await p.evaluate(([j]) => { const Q = window.SYNQUENZER; const r = Q.importJSON(typeof j === 'string' ? j : JSON.stringify(j)); ensureAudio();
  recallCarrier(Q.harmony.detectChord([60, 64, 67])); const c = S.tracks[0].clips[0];
  const o = [64, 66, 67, 69, 71, 72, 74].map(n => Q.outPitch(0, n, nowT(), c.key)); Q.resetCarrier();
  return {os: Q.project().settings.harmony.oneScale, out: o}; }, [oldJson]);
res.C3old = oldOut; res.C3same = JSON.stringify(oldOut) === JSON.stringify(res.C3.out);
// C4 persistence across reload (autosave)
await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.newProject({init: true});
  Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [{t: 0, d: 1, n: 66, v: .8}]});
  Q.setHarmony({osAmt: .4, osPass: true, osRef: 'auto', drums: true}); Q.setTrackScale(1, false); await Q.save(); });
await p.waitForTimeout(1500);
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage && window.SYNQUENZER.storage().booted, null, {timeout: 30000}); await p.waitForTimeout(1000);
res.C4 = await p.evaluate(() => { const pj = window.SYNQUENZER.project(); const h = pj.settings.harmony; return {os: h.oneScale, osAmt: h.osAmt, osPass: h.osPass, osRef: h.osRef, drums: h.drums, tos: pj.tracks.map(t => t.os)}; });
// C5 per-track switch independent + Stärke grid (noteLog under C, F#4 of various lengths)
res.C5 = await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); ensureAudio();
  const out = {};
  for (const d of [.25, .5, 1, 2]) {
    Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [{t: 0, d, n: 66, v: .8}]});
    recallCarrier(Q.harmony.detectChord([60, 64, 67]));
    const row = [];
    for (const a of [0, .25, .5, .75, .9, 1]) { Q.setHarmony({osAmt: a}); const c = S.tracks[0].clips[0]; row.push(Q.outPitch(0, 66, nowT(), c.key)); }
    out['d' + d] = row.join(' ');
  }
  Q.setHarmony({osAmt: 1});
  Q.setClip(1, 0, {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [{t: 0, d: 1, n: 66, v: .8}]});
  Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [{t: 0, d: 1, n: 66, v: .8}]});
  Q.setTrackScale(0, false); const c0 = S.tracks[0].clips[0], c1 = S.tracks[1].clips[0];
  out.track = {t0off: Q.outPitch(0, 66, nowT(), c0.key), t1on: Q.outPitch(1, 66, nowT(), c1.key)};
  Q.resetCarrier(); return out; });
await ctx.close();
for (const [k, v] of Object.entries(res)) console.log(k, JSON.stringify(v));
console.log('errs', errs.slice(0, 5));
await b.close();
