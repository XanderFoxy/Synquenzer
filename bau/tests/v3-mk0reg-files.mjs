// QA regression VS2b: files via the real UI — Menü → Datei öffnen (DIRIGENT v2 file, VS1 format-3 file), Als Datei sichern
// (standalone: real download), reopen the saved file; base (4.5.1) vs new (4.5.2), P1 and L1
import { open, APP } from './v3-mk0reg-pw.mjs';
import fs from 'fs';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-base.html';
const V2 = D + 'v3-qa-v2ereg/dirigent-v2.json', V3 = D + 'v3-qa-old/vs1-project.json';
const res = {};
const toasts = p => p.evaluate(() => { window.__ts = []; const t = document.getElementById('toast'); const f = () => { const s = (t && t.textContent || '').trim(); if (s && window.__ts[window.__ts.length - 1] !== s) window.__ts.push(s); }; window.__ti = setInterval(f, 50); });
const summary = p => p.evaluate(() => { const P = window.SYNQUENZER.project(); return {format: P.format, bpm: P.bpm, name: P.name, tracks: P.tracks.map(t => [t.kind, t.name, t.sound && t.sound.engine, (t.clips || []).map(c => c ? c.notes.map(n => n.n + '@' + n.t).join(',') : '').join('|')].join(' ')), song: P.song ? P.song.bars : null}; });
const openMenu = async p => { await p.click('#bMenu'); await p.waitForTimeout(400); };
const btnByText = (p, t) => p.locator('button', {hasText: t}).filter({visible: true}).first();
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) {
  const {b, p, errs} = await open({width: w, height: h}, file);
  const r = {};
  await toasts(p);
  // 1) DIRIGENT v2 file through [Datei öffnen]
  await openMenu(p);
  r.openBtn = await btnByText(p, 'Datei öffnen').isVisible();
  await p.setInputFiles('#fileIn', V2); await p.waitForTimeout(4500);
  r.v2 = await summary(p); r.v2toasts = await p.evaluate(() => window.__ts.slice());
  r.menuOpenAfter = await p.evaluate(() => { const m = document.getElementById('menu'); return m ? m.className : null; });
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.closeMenu && Q.closeMenu(); Q.setBpm(240); Q.clearLog(); Q.launchScene(0); });
  await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 8, null, {timeout: 20000});
  r.v2play = await p.evaluate(() => { const L = window.SYNQUENZER.noteLog(4000).filter(n => n.beat != null && n.beat >= 0 && n.beat < 8); const by = {}; for (const n of L) by[n.track] = (by[n.track] || 0) + 1; return by; });
  await p.evaluate(() => window.SYNQUENZER.stop());
  // 2) format-3 (VS1) file
  await p.evaluate(() => { window.__ts.length = 0; });
  await p.setInputFiles('#fileIn', V3); await p.waitForTimeout(2500);
  r.v3 = await summary(p); r.v3toasts = await p.evaluate(() => window.__ts.slice());
  // 3) Als Datei sichern (standalone: <a download> or share) → reopen
  await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(200);
  const before = await summary(p);
  const isOpen = await p.evaluate(() => { const m = document.getElementById('menu'); return !!(m && m.offsetParent); });
  if (!isOpen) await openMenu(p);
  const dlP = p.waitForEvent('download', {timeout: 8000}).catch(e => null);
  await btnByText(p, 'Als Datei sichern').click();
  const dl = await dlP;
  r.dlName = dl ? dl.suggestedFilename() : null;
  if (dl) { const path = D + 'v3-qa-v2ereg/save-' + name + '-' + vp + '.json'; await dl.saveAs(path); const o = JSON.parse(fs.readFileSync(path, 'utf8')); r.file = {app: o.app, kind: o.kind, format: o.format, appVersion: o.appVersion, sounds: (o.sounds || []).length};
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); });
    await p.setInputFiles('#fileIn', path); await p.waitForTimeout(2000);
    const after = await summary(p); r.roundtrip = JSON.stringify(after.tracks) === JSON.stringify(before.tracks) && after.bpm === before.bpm && after.song === before.song; }
  r.errs = errs.filter(e => !/net::|Failed to load resource/.test(e));
  await p.evaluate(() => clearInterval(window.__ti));
  res[name + '-' + vp] = r; await b.close();
}
for (const vp of ['P1', 'L1']) { const A = res['base-' + vp], B = res['new-' + vp];
  for (const k of Object.keys(B)) { const s = JSON.stringify(B[k]), same = s === JSON.stringify(A[k]); if (k === 'dlName') { console.log(vp, k, s, 'base', JSON.stringify(A[k])); continue; } console.log(vp, k, same ? 'same' : 'DIFF', s.slice(0, 900), same ? '' : '\n   base ' + JSON.stringify(A[k]).slice(0, 900)); } }
