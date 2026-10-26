// QA MK5: Als Datei sichern with an MS 2000 track (arp on/off) -> Datei öffnen; base vs new
import { open, APP } from './v3-qa-mk5reg-pw.mjs';
import fs from 'fs';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-mk5reg/';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk5-base-4.12.0.html';
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const arp of [0, 1]) {
  if (name === 'base' && arp) continue;
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  await p.evaluate(() => { window.__ts = []; const t = document.getElementById('toast'); window.__ti = setInterval(() => { const s = (t && t.textContent || '').trim(); if (s && window.__ts[window.__ts.length - 1] !== s) window.__ts.push(s); }, 50); });
  await p.evaluate(async arp => { const Q = window.SYNQUENZER; const sl = ms => new Promise(r => setTimeout(r, ms));
    Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
    Q.setEngine(1, 'mk'); await sl(600); Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 57, 4), N(0, 60, 4), N(0, 64, 4)]});
    Q.mkSet(1, 't.0.f.cut', 77); if (arp) { Q.mkSet(1, 'arp.on', 1); Q.mkSet(1, 'arp.type', 3); } await sl(300); }, arp);
  const sum = () => p.evaluate(() => { const P = window.SYNQUENZER.project(); return {name: P.name, eng: P.tracks.map(t => t.sound && t.sound.engine).join(','), mk: JSON.stringify(window.SYNQUENZER.mkGet(1) && {cut: window.SYNQUENZER.mkGet(1).t[0].f.cut, arp: window.SYNQUENZER.mkGet(1).arp && window.SYNQUENZER.mkGet(1).arp.on}), clip1: (P.tracks[1].clips[0] || {notes: []}).notes.length}; });
  const before = await sum();
  await p.click('#bMenu'); await p.waitForTimeout(400);
  const dlP = p.waitForEvent('download', {timeout: 8000}).catch(() => null);
  await p.locator('button', {hasText: 'Als Datei sichern'}).filter({visible: true}).first().click();
  const dl = await dlP; const path = D + 'fo-' + name + arp + '.json'; await dl.saveAs(path);
  const o = JSON.parse(fs.readFileSync(path, 'utf8'));
  await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(300);
  await p.evaluate(() => { window.SYNQUENZER.newProject({init: true}); window.__ts.length = 0; }); await p.waitForTimeout(500);
  const mid = await sum();
  await p.setInputFiles('#fileIn', path); await p.waitForTimeout(3000);
  const after = await sum();
  console.log(name, 'arp' + arp, 'file', o.appVersion, o.format, '\n  before', JSON.stringify(before), '\n  mid   ', JSON.stringify(mid), '\n  after ', JSON.stringify(after), '\n  toasts', JSON.stringify(await p.evaluate(() => window.__ts)), 'errs', JSON.stringify(errs));
  await b.close();
}
