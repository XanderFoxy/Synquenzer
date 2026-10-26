// QA MK5: save/load with arp fields, MIDI export arp on vs off identical, file save/open via UI with arp
import { open, APP } from './v3-qa-mk5reg-pw.mjs';
import fs from 'fs';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-mk5reg/';
const {b, p, errs} = await open({width: 390, height: 844}, APP);
const r = await p.evaluate(async () => { const Q = window.SYNQUENZER; const sl = ms => new Promise(r => setTimeout(r, ms));
  Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setEngine(1, 'mk'); await sl(600);
  Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 57, 4), N(0, 60, 4), N(0, 64, 4)]});
  const got = [];
  window.claude = {use: async k => (k === 'downloads' ? {save: async ({filename, data}) => { got.push(Array.from(new Uint8Array(await data.arrayBuffer())).join(",")); }} : null)};
  await Q.exportMidi({mode: 'scene', scene: 0}); await sl(500);
  Q.mkSet(1, 'arp.on', 1); Q.mkSet(1, 'arp.type', 3); Q.mkSet(1, 'arp.range', 2); Q.mkSet(1, 'arp.steps', 0b10110111); Q.mkSet(1, 'arp.last', 6); Q.mkSet(1, 'arp.latch', 1); Q.mkSet(1, 'arp.swing', -40); Q.mkSet(1, 'arp.gate', 33); Q.mkSet(1, 'arp.res', 4); Q.mkSet(1, 'arp.ks', 1); Q.mkSet(1, 'arp.tgt', 2);
  Q.launchScene(0); await sl(1500); Q.stop(); await sl(300);
  await Q.exportMidi({mode: 'scene', scene: 0}); await sl(500);
  const a1 = Q.mkGet(1).arp;
  await Q.save(); const ld = await Q.load(); await sl(300); const a3 = Q.mkGet(1) && Q.mkGet(1).arp;
  const A_ = got[0].split(","), B_ = got[1].split(","); let fd = -1; for (let i = 0; i < Math.max(A_.length, B_.length); i++) if (A_[i] !== B_[i]) { fd = i; break; } const txt = s => s.map(x => +x >= 32 && +x < 127 ? String.fromCharCode(+x) : ".").join("");
  return {fd, ta: txt(A_), tb: txt(B_), la: A_.length, lb: B_.length, midiSame: got.length === 2 && got[0] === got[1], n: got.length, a1, a3, rt: JSON.stringify(a1) === JSON.stringify(a3), ld}; });
console.log(JSON.stringify(r));
// UI: Als Datei sichern -> reopen -> arp fields kept
await p.click('#bMenu'); await p.waitForTimeout(400);
const dlP = p.waitForEvent('download', {timeout: 8000}).catch(() => null);
await p.locator('button', {hasText: 'Als Datei sichern'}).filter({visible: true}).first().click();
const dl = await dlP; let rt = null;
if (dl) { const path = D + 'save-arp.json'; await dl.saveAs(path); const o = JSON.parse(fs.readFileSync(path, 'utf8'));
  await p.evaluate(() => window.SYNQUENZER.newProject({init: true})); await p.setInputFiles('#fileIn', path); await p.waitForTimeout(4000); console.log('after open', await p.evaluate(() => JSON.stringify({eng: window.SYNQUENZER.project().tracks.map(t => t.sound && t.sound.engine), name: window.SYNQUENZER.project().name, toast: (document.getElementById('toast')||{}).textContent})));
  rt = await p.evaluate(() => JSON.stringify(window.SYNQUENZER.mkGet(1) && window.SYNQUENZER.mkGet(1).arp)); console.log('file appVersion', o.appVersion, 'format', o.format); }
console.log('file roundtrip arp', rt, 'errs', JSON.stringify(errs));
await b.close();
