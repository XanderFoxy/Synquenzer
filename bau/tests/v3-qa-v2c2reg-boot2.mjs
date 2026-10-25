// QA regression V2c′: browser storage across reload and versions: 4.5.2 autosave → 4.5.3 opens it (Eine Skala off, notes kept),
// 4.5.3 settings survive a reload, 4.5.3 storage → 4.5.2 still opens without errors
import { chromium } from 'playwright';
import fs from 'fs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/VS2b-fix.html';
const NEW = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/index.html';
const UD = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2c2reg/ud';
fs.rmSync(UD, {recursive: true, force: true});
const go = async (file, fn, arg) => {
  const ctx = await chromium.launchPersistentContext(UD, {executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'], viewport: {width: 390, height: 844}});
  const p = ctx.pages()[0] || await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage && window.SYNQUENZER.storage().booted, null, {timeout: 20000}); await p.waitForTimeout(600);
  const r = await p.evaluate(fn, arg); r.errs = errs.slice(); await ctx.close(); return r;
};
const info = () => { const Q = window.SYNQUENZER, P = Q.project(), h = Q.runtime().harmony; return {v: Q.version, name: P.name, bpm: P.bpm, notes: P.tracks.map(t => t.clips.reduce((a, c) => a + (c ? c.notes.length : 0), 0)), os: h.oneScale, osAmt: h.osAmt, osRef: h.osRef, drums: h.drums, tos: P.tracks.map(t => t.os)}; };
const out = {};
out.a_base_create = await go(BASE, async () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(133);
  Q.setClip(0, 0, {len: 1, key: {root: 4, scale: 'aeolian'}, notes: [64, 66, 67, 71].map((n, t) => ({t, d: .5, n, v: .8}))}); await Q.save(); await new Promise(r => setTimeout(r, 800));
  const P = Q.project(); return {v: Q.version, bpm: P.bpm}; });
out.b_new_opens_old = await go(NEW, info);
out.c_new_create = await go(NEW, async () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(141); Q.setClip(1, 0, {len: 1, notes: [{t: 0, d: 1, n: 60, v: .8}]});
  Q.setHarmony({osAmt: .5, osRef: 'auto', drums: true}); Q.setTrackScale(2, false); await Q.save(); await new Promise(r => setTimeout(r, 800));
  const h = Q.runtime().harmony; return {os: h.oneScale, osAmt: h.osAmt}; });
out.d_new_reload = await go(NEW, info);
out.e_base_opens_new = await go(BASE, () => { const Q = window.SYNQUENZER, P = Q.project(); return {v: Q.version, bpm: P.bpm, notes: P.tracks.map(t => t.clips.reduce((a, c) => a + (c ? c.notes.length : 0), 0))}; });
for (const k of Object.keys(out)) console.log(k, JSON.stringify(out[k]));
