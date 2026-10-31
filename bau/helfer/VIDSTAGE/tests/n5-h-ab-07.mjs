// VC2a-07 Abnahme mit echten Tipps: [ohne Verlauf] Datei == 4.23.0-Hülle (format, sum); [mit Verlauf] -> Datei öffnen in frischem Browser -> historyCheck
import fs from 'fs';
import { chromium } from 'playwright';
import { APP, OUT } from './n5-h-ab-lib.mjs';
const BASE = '/home/user/Synquenzer/bau/werkzeug/vs-base-B.html';
const DL = OUT + '/n5-h-ab-dl';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
async function page(file) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, acceptDownloads: true});
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(2500); return p;
}
const tapT = async (p, txt) => { const l = p.locator('#menu button', {hasText: txt}).first(); await l.scrollIntoViewIfNeeded(); const bb = await l.boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(300); };
const openM = async p => { const xy = await p.evaluate(() => { const r = document.getElementById('bMenu').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); await p.touchscreen.tap(xy[0], xy[1]); await p.waitForTimeout(500); };
async function save(p, name) { await openM(p); const dlP = p.waitForEvent('download', {timeout: 10000}); await tapT(p, 'Als Datei sichern'); const d = await dlP; const f = DL + '/' + name; await d.saveAs(f); await p.evaluate(() => closeMenu()); return f; }
async function openFile(p, f) { await openM(p); const fcP = p.waitForEvent('filechooser', {timeout: 10000}); await tapT(p, 'Datei öffnen'); const fc = await fcP; await fc.setFiles(f); await p.waitForTimeout(2500); }
// 1) neue Fassung: ein paar Gesten, dann ohne Verlauf sichern
const p1 = await page(APP);
await p1.evaluate(async () => { const A = SYNQUENZER; for (let i = 0; i < 8; i++) { const c = A.getClip(1, 0); c.notes[i % c.notes.length].v = 0.3 + i / 20; A.setClip(1, 0, c); await new Promise(r => setTimeout(r, 50)); } const s = A.getSound(2); s.p.cutoff = 777; A.setSound(2, s); undo(); redo(); });
await p1.waitForTimeout(2600);
const fOhne = await save(p1, 'ohne.json');
// mit Verlauf: Menü-Tipp
await openM(p1); await tapT(p1, 'mit Verlauf'); await p1.evaluate(() => closeMenu());
const fMit = await save(p1, 'mit.json');
const src = await p1.evaluate(async () => ({h: SYNQUENZER.history(), proj: serializeProject(), id: S.id}));
const jO = JSON.parse(fs.readFileSync(fOhne, 'utf8')), jM = JSON.parse(fs.readFileSync(fMit, 'utf8'));
console.log('ohne: keys', Object.keys(jO).join(','), 'format', jO.format, 'sum', jO.sum, 'history?', 'history' in jO, 'bytes', fs.statSync(fOhne).size);
console.log('mit : keys', Object.keys(jM).join(','), 'format', jM.format, 'sum', jM.sum, 'history?', 'history' in jM, 'bytes', fs.statSync(fMit).size, 'chunks', jM.history && jM.history.chunks.length);
console.log('Quelle', JSON.stringify(src.h));
// 2) Basis 4.23.0: dieselbe Datei öffnen und wieder sichern -> Hülle vergleichen
const pb = await page(BASE);
await openFile(pb, fOhne);
const fBase = await save(pb, 'base.json');
const jB = JSON.parse(fs.readFileSync(fBase, 'utf8'));
const diffKeys = [...new Set(Object.keys(jB).concat(Object.keys(jO)))].filter(k => JSON.stringify(jB[k]) !== JSON.stringify(jO[k]));
console.log('Basis vs neu (ohne Verlauf): abweichende Hüllenfelder', diffKeys, 'base format/sum', jB.format, jB.sum);
// 4.23.0 öffnet auch die Datei MIT Verlauf?
await openFile(pb, fMit);
console.log('4.23.0 öffnet mit-Verlauf-Datei:', JSON.stringify(await pb.evaluate(() => ({name: S.name, same: serializeProject().length}))), 'errs', pb.errs.slice(0, 3));
// 3) frischer Browser: Datei mit Verlauf öffnen
const p2 = await page(APP);
await openFile(p2, fMit);
const r2 = await p2.evaluate(async () => ({h: SYNQUENZER.history(), check: await historyCheck({detail: true}), id: S.id, eq: null}));
const eqProj = await p2.evaluate(src => { const a = JSON.parse(serializeProject()), b2 = JSON.parse(src); delete a.ui; delete b2.ui; return JSON.stringify(a) === JSON.stringify(b2); }, src.proj);
console.log('frisch importiert:', JSON.stringify(r2), 'Projekt gleich (ohne ui):', eqProj, 'errs', p2.errs.slice(0, 3));
const ev = await p2.evaluate(async () => { const o = []; await histWalk((K, k) => { o.push('KF:' + k.w); }, e => { o.push(e.u + (e.l ? ':' + e.l.slice(0, 18) : '')); }); return o; });
console.log('Verlauf nach Import:', ev.join(' | '));
await b.close();
