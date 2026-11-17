// XLA Prüfung: Fotos für Xander (iPhone 12 Pro Max, deviceScaleFactor 2) – nur synthetische Datei (synth-song.cbp).
// 1 hochkant: Blatt „DAW-Projekt öffnen“, Abschnitt Transponieren mit dem neuen Hinweis · 2 hochkant: Matrix, Taste D gedrückt („+2 · → D-Dur“),
// alle Synth-Spuren ⇅½ · 3 quer: Matrix, Taste F♯ („+6 · → F♯-Dur“). Aufruf: node fotos3.mjs <index.html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
const file = path.resolve(process.argv[2]), here = path.dirname(new URL(import.meta.url).pathname), F = path.join(here, 'fotos');
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [];
async function page(w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  p.cdp = await p.context().newCDPSession(p);
  return p;
}
const tch = (p, type, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
async function tap(p, x, y, hold) { await tch(p, 'touchStart', x, y); await p.waitForTimeout(hold || 50); await tch(p, 'touchEnd'); await p.waitForTimeout(220); }
const ctr = (p, sel) => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent); if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel);
async function tapSel(p, sel, hold) { const c = await ctr(p, sel); if (!c) return false; await tap(p, c.x, c.y, hold); return true; }
async function open(p) {
  await p.evaluate(async () => { ensureAudio(); await new Promise(r => setTimeout(r, 900)); closePop(); va1Sheet(); }); await p.waitForTimeout(300);
  await tapSel(p, 'button[data-va="midiin"]'); await p.waitForTimeout(300);
  const fc = p.waitForEvent('filechooser', {timeout: 5000}); await tapSel(p, '.imp1 button[data-i="pick"]');
  const ch = await fc; await ch.setFiles({name: 'synth-song.cbp', mimeType: 'application/octet-stream', buffer: fs.readFileSync(path.join(here, 'tests', 'synth-song.cbp'))});
  for (let k = 0; k < 80; k++) { await p.waitForTimeout(100); const ok = await p.evaluate(() => { const c = window.__xla.cur(); return !!(c && c.res && !c.building); }); if (ok) break; }
}
async function keyTap(p, semi) {
  await tapSel(p, '#segTr'); await p.waitForTimeout(400);
  if (await p.evaluate(() => !EL.coach.hidden)) { await tapSel(p, '#coachOk'); await p.waitForTimeout(400); }   // Hilfe-Karte (erstes TRANSPONIEREN) wie Xander mit „Verstanden“ schließen
  const n = await p.evaluate(k => { const r = S.key.root; const L = [...KB.byNote.entries()].filter(([n, x]) => x.el.offsetParent && x.el.getBoundingClientRect().width > 6).map(([n]) => n); return L.find(n => ((n - r) % 12 + 12) % 12 === k); }, semi);
  const c = await p.evaluate(n => { const k = KB.byNote.get(n); const q = k.el.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height * .8}; }, n);
  await tap(p, c.x, c.y, 120); await p.waitForTimeout(700);
}
// 1 + 2 hochkant
let p = await page(428, 926);
await open(p);
await p.evaluate(() => { const h = [...UI.pop.el.querySelectorAll('h5')].find(x => /Transponieren/.test(x.textContent)); if (h) h.scrollIntoView({block: 'center'}); });
await p.waitForTimeout(300);
await p.screenshot({path: path.join(F, 'xla3-p-blatt.png')});
await tapSel(p, '.xla button[data-x="ok"]'); await p.waitForTimeout(1600);
await p.evaluate(async () => { setSongView(false); await new Promise(r => setTimeout(r, 300)); });
await tapSel(p, '#clipGrid .scn[data-s="1"]'); await p.waitForTimeout(500);
if (!(await p.evaluate(() => R.playing))) await tapSel(p, '#bPlay');
await p.waitForTimeout(1200);
await keyTap(p, 2); await p.waitForTimeout(1500);
const t2 = await p.evaluate(() => carrierShown().text);
await p.screenshot({path: path.join(F, 'xla3-p-matrix.png')});
await p.evaluate(() => SYNQUENZER.stop()); await p.close();
// 3 quer
p = await page(926, 428);
await open(p);
await tapSel(p, '.xla button[data-x="ok"]'); await p.waitForTimeout(1600);
await p.evaluate(async () => { setSongView(false); await new Promise(r => setTimeout(r, 300)); });
await tapSel(p, '#clipGrid .scn[data-s="2"]'); await p.waitForTimeout(500);
if (!(await p.evaluate(() => R.playing))) await tapSel(p, '#bPlay');
await p.waitForTimeout(1200);
await keyTap(p, 6); await p.waitForTimeout(1500);
const t3 = await p.evaluate(() => carrierShown().text);
await p.screenshot({path: path.join(F, 'xla3-l-matrix.png')});
await p.evaluate(() => SYNQUENZER.stop()); await p.close();
await b.close();
console.log(JSON.stringify({t2, t3, errs}));
