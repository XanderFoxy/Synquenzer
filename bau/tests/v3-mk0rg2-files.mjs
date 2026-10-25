// QA regression MK0: files and storage via the real menu: Datei öffnen (DIRIGENT v2, format-3 v0a/vs1), Als Datei sichern →
// reopen, autosave → page reload, Neues Projekt → Projekte → reopen the parked one, MIDI export zip (standalone download and
// viewer downloads mock); base vs new. usage: node v3-mk0rg2-files.mjs base|new P1|L1
import { open, NEW, BASE, OUT, SP } from './v3-mk0rg2-lib.mjs';
import fs from 'fs';
const [which, vp] = process.argv.slice(2);
const D = SP + 'dirigent-test/';
const V2 = D + 'v3-qa-vs2reg/dirigent-v2.json', V0A = D + 'v3-qa-old/v0a-project.json', VS1 = D + 'v3-qa-old/vs1-project.json';
const {p, ctx, errs, close} = await open(which === 'base' ? BASE : NEW, vp, false);
const r = {};
const summary = () => p.evaluate(() => { const P = window.SYNQUENZER.project(); return {format: P.format, bpm: P.bpm, name: P.name, tracks: P.tracks.map(t => [t.kind, t.name, t.sound && t.sound.engine, t.sound && t.sound.name, (t.clips || []).map(c => c ? c.notes.map(n => n.n + '@' + n.t).join(',') : '').join('|')].join(' ')), song: P.song ? P.song.bars : null, parts: (P.parts || []).filter(Boolean).length}; });
const deepSum = () => p.evaluate(() => { const P = JSON.parse(JSON.stringify(window.SYNQUENZER.project())); delete P.id; delete P.ui; return JSON.stringify(P); });
const ts = () => p.evaluate(() => { window.__ts = []; const t = document.getElementById('toast'); clearInterval(window.__ti); window.__ti = setInterval(() => { const s = (t && t.textContent || '').trim(); if (s && window.__ts[window.__ts.length - 1] !== s) window.__ts.push(s); }, 30); });
const menu = async () => { const o = await p.evaluate(() => { const m = document.getElementById('menu'); return !!(m && m.offsetParent && /open/.test(m.className)); }); if (!o) { await p.click('#bMenu'); await p.waitForTimeout(400); } };
const btn = t => p.locator('button', {hasText: t}).filter({visible: true}).first();
try {
  await ts();
  // 1) DIRIGENT v2 through Datei öffnen
  await menu(); r.openBtn = await btn('Datei öffnen').isVisible();
  await p.setInputFiles('#fileIn', V2); await p.waitForTimeout(3000);
  r.v2 = await summary(); r.v2toasts = await p.evaluate(() => window.__ts.slice());
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.closeMenu && Q.closeMenu(); Q.setBpm(240); Q.clearLog(); Q.launchScene(0); });
  await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 8, null, {timeout: 20000});
  r.v2play = await p.evaluate(() => { const L = window.SYNQUENZER.noteLog(4000).filter(n => n.beat != null && n.beat >= 0 && n.beat < 8); const by = {}; for (const n of L) by[n.track] = (by[n.track] || 0) + 1; return by; });
  await p.evaluate(() => window.SYNQUENZER.stop());
  // 2) format-3 files
  for (const [k, f] of [['v0a', V0A], ['vs1', VS1]]) { await p.evaluate(() => { window.__ts.length = 0; }); await menu(); await p.setInputFiles('#fileIn', f); await p.waitForTimeout(2500); r[k] = await summary(); r[k + 'toasts'] = await p.evaluate(() => window.__ts.slice()); }
  // 3) Als Datei sichern → reopen (standalone download)
  await p.evaluate(() => window.SYNQUENZER.closeMenu && window.SYNQUENZER.closeMenu()); await p.waitForTimeout(300);
  const before = await deepSum();
  await menu();
  const dlP = p.waitForEvent('download', {timeout: 8000}).catch(() => null);
  await btn('Als Datei sichern').click(); const dl = await dlP;
  r.dl = !!dl;
  if (dl) { const path = OUT + `save-${which}-${vp}.json`; await dl.saveAs(path); const o = JSON.parse(fs.readFileSync(path, 'utf8')); r.file = {app: o.app, kind: o.kind, format: o.format, sounds: (o.sounds || []).length, keys: Object.keys(o).sort().join(',')};
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.closeMenu && Q.closeMenu(); Q.newProject({init: true}); }); await p.waitForTimeout(400);
    await menu(); await p.setInputFiles('#fileIn', path); await p.waitForTimeout(2000);
    r.fileRoundtrip = (await deepSum()) === before; }
  await p.evaluate(() => window.SYNQUENZER.closeMenu && window.SYNQUENZER.closeMenu()); await p.waitForTimeout(300);
  // 4) Q.save → Q.load
  const b4 = await deepSum(); r.save = await p.evaluate(async () => { const Q = window.SYNQUENZER; const a = await Q.save(); Q.setBpm(77); const b = await Q.load(); return [!!a, !!b]; });
  r.saveLoad = (await deepSum()) === b4;
  // 5) edit + autosave + reload
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setBpm(133); Q.setClip(3, 3, {len: 1, notes: [{t: 0, d: 1, n: 64, v: .8}, {t: 2, d: 1, n: 67, v: .8}]}); });
  await p.waitForTimeout(2500);
  const b5 = await deepSum(); const st5 = await p.evaluate(() => { const s = window.SYNQUENZER.storage(); return {mode: s.mode, lastOk: !!s.lastOk, dirty: s.dirty}; });
  r.storage = st5;
  await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage && window.SYNQUENZER.storage().booted, null, {timeout: 30000}); await p.waitForTimeout(800);
  r.reloadSame = (await deepSum()) === b5; r.reloadBpm = await p.evaluate(() => window.SYNQUENZER.project().bpm);
  await ts();
  // 6) Neues Projekt → previous one under Projekte → reopen
  const idOld = await p.evaluate(() => window.SYNQUENZER.project().id), nameOld = await p.evaluate(() => window.SYNQUENZER.project().name);
  await p.evaluate(async () => { await window.SYNQUENZER.newProject({init: true}); }); await p.waitForTimeout(1200);
  r.newProj = await p.evaluate(() => window.SYNQUENZER.project().tracks.map(t => t.clips.filter(Boolean).length).join(','));
  const list = await p.evaluate(async () => (await window.SYNQUENZER.projects()).map(x => ({id: x.id, name: x.name})));
  r.listHasOld = list.some(x => x.id === idOld);
  r.reopen = await p.evaluate(async id => { const ok = await window.SYNQUENZER.openProject(id); return !!ok; }, idOld); await p.waitForTimeout(1200);
  r.reopenSame = (await deepSum()) === b5;
  r.toasts6 = await p.evaluate(() => window.__ts.slice());
  // 7) MIDI export via the menu: standalone download, then viewer mock
  await p.evaluate(() => window.SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]));
  const unzip = z => { const out = []; let i = 0; const dv = new DataView(z.buffer, z.byteOffset, z.byteLength); while (i + 30 <= z.length && dv.getUint32(i, true) === 0x04034b50) { const m = dv.getUint16(i + 8, true), cs = dv.getUint32(i + 18, true), nl = dv.getUint16(i + 26, true), xl = dv.getUint16(i + 28, true); const name = Buffer.from(z.slice(i + 30, i + 30 + nl)).toString(); const d = z.slice(i + 30 + nl + xl, i + 30 + nl + xl + cs); out.push({name, m, mthd: Buffer.from(d.slice(0, 4)).toString(), n: d.length, sum: d.reduce((a, b) => (a * 31 + b) >>> 0, 7)}); i += 30 + nl + xl + cs; } return out; };
  for (const mode of ['standalone', 'viewer']) {
    if (mode === 'viewer') await p.evaluate(() => { window.__got = []; window.claude = {use: async k => (k === 'downloads' ? {save: async ({filename, data}) => { window.__got.push({filename, type: data.type, bytes: Array.from(new Uint8Array(await data.arrayBuffer()))}); }} : null)}; });
    for (const seg of ['Szene 1', 'Alle Szenen', 'Song']) {
      await menu();
      const sb = p.locator('#menu button', {hasText: new RegExp('^' + seg + '$')}).filter({visible: true}).first();
      if (!(await sb.count())) { r['midi-' + mode + seg] = 'no seg'; continue; }
      await sb.scrollIntoViewIfNeeded(); await sb.click(); await p.waitForTimeout(150);
      const ex = p.locator('#menu button', {hasText: /^Exportieren$/}).filter({visible: true}).first(); await ex.scrollIntoViewIfNeeded();
      const dlP = mode === 'standalone' ? p.waitForEvent('download', {timeout: 6000}).catch(() => null) : null;
      await ex.click(); await p.waitForTimeout(900);
      let bytes = null, fname = null;
      if (mode === 'viewer') { const g = await p.evaluate(() => window.__got.pop()); if (g) { bytes = Uint8Array.from(g.bytes); fname = g.filename; } }
      else { const d = await dlP; if (d) { fname = d.suggestedFilename(); const pth = OUT + `mid-${which}-${vp}-${seg.replace(/ /g, '')}.zip`; await d.saveAs(pth); bytes = new Uint8Array(fs.readFileSync(pth)); } }
      r['midi-' + mode + '-' + seg] = {fname: fname && fname.replace(/\d{4}-\d\d-\d\d-\d{4}/, 'DATE'), zip: bytes ? unzip(bytes) : null};
      await p.evaluate(() => window.SYNQUENZER.closeMenu && window.SYNQUENZER.closeMenu()); await p.waitForTimeout(200);
    }
  }
} catch (e) { r.FAIL = String(e).slice(0, 400); await p.screenshot({path: OUT + `files-fail-${which}-${vp}.png`}); }
r.errs = errs.filter(e => !/Failed to load resource|net::ERR/.test(e));
fs.writeFileSync(OUT + `files-${which}-${vp}.json`, JSON.stringify(r, null, 1));
console.log(which, vp, 'done');
await close();
