// XLB MIDI A/B: alte Projekte (dieselben 9 wie xlb-test T1) in 4.78 und XLB laden, MIDI je Szene 1–8, alle Szenen, Song – Bytes gleich?
// Aufruf: node midi-ab.mjs <index.html> <basis.html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import crypto from 'crypto';
const [file, base] = process.argv.slice(2);
const S0 = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/';
const FIX = ['v3-qa-old/v0a-project.json', 'v3-qa-v2ereg/save-base-L1.json', 'mu2/menu-844x390.json', 'v3-qa-mk6reg/save-base-L1.json', 'v3-qa-grp/export-synquenzer-demo-2026-10-31-1618.json'].map(f => S0 + f);
const b = await chromium.launch();
async function open(f) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + f); await p.waitForFunction(() => typeof BOOT !== 'undefined' && BOOT.done, null, {timeout: 120000});
  return {ctx, p, errs};
}
const G = await open(base);
const gen = await G.p.evaluate(() => {
  const out = {};
  out.demo = JSON.stringify(projectFileObj(demoProject(), true, false));
  out.init = JSON.stringify(projectFileObj(newProject({init: true}), true, false));
  const d = demoProject(); d.ts = '3/4'; out.ts = JSON.stringify(projectFileObj(normalizeProject(JSON.parse(JSON.stringify(d))), true, false));
  switchProject(demoProject(), {first: true}); addTrack(); addTrack(); for (let i = 6; i < 8; i++) { S.tracks[i].clips[7] = {len: 1, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: .5, n: 64 + i, v: .8}]}; }
  out.t8 = JSON.stringify(projectFileObj(S, true, false));
  return out;
});
await G.ctx.close();
const MID = (p, txt) => p.evaluate(t => {
  const r = parseProjectFile(JSON.parse(t)); if (!r) return null;
  switchProject(r.project, {ui: true});
  const hex = x => (x && x.bytes ? Array.from(x.bytes, v => v.toString(16).padStart(2, '0')).join('') : String(x));
  const o = {};
  for (let s = 0; s < 8; s++) o['s' + (s + 1)] = hex(buildMidi({mode: 'scene', scene: s}));
  o.all = hex(buildMidi({mode: 'all'})); o.song = hex(buildMidi({mode: 'song'}));
  return o;
}, txt);
const A = await open(base), B = await open(file);
const cases = FIX.map(f => [f.split('/').slice(-2).join('/'), fs.readFileSync(f, 'utf8')]).concat(Object.entries(gen));
let same = 0, n = 0; const out = [];
for (const [nm, txt] of cases) {
  const a = await MID(A.p, txt), c = await MID(B.p, txt);
  const keys = Object.keys(a || {}); let eq = 0;
  for (const k of keys) { n++; if (c && a[k] === c[k]) { eq++; same++; } }
  const h = s => crypto.createHash('md5').update(s).digest('hex').slice(0, 8);
  out.push({nm, eq: eq + '/' + keys.length, all: h(a.all), song: h(a.song), bytesAll: a.all.length / 2});
  console.log((eq === keys.length ? 'OK     ' : 'FEHLER ') + 'MIDI bitgleich wie 4.78 (Szene 1–8, alle, Song): ' + nm + ' · ' + JSON.stringify(out[out.length - 1]));
}
console.log((same === n ? 'OK     ' : 'FEHLER ') + `MIDI A/B gesamt ${same}/${n} Dateien bitgleich · Seitenfehler ${JSON.stringify(A.errs.concat(B.errs))}`);
await b.close();
