// QA VC2a-07: file without history == 4.23.0 (format, sum); file mit Verlauf: sum/format unchanged, opens in a fresh 4.25.0
// (historyCheck true, events taken over) and in 4.23.0 (old app ignores the field, project equal)
import { chromium } from 'playwright';
const SP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const NEW = SP + 'n5-br-H/index.html', OLD = SP + 'vs-base-B.html';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
async function page(file) { const ctx = await b.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); await p.goto('file://' + file); await p.waitForTimeout(2500); return {ctx, p, errs}; }
const SETUP = () => { const Q = SYNQUENZER; Q.setClip(1, 2, {len: 2, notes: [{n: 62, t: 0, d: 1, v: .8}, {n: 65, t: 2, d: 1, v: .7}]}); const s = Q.getSound(2); s.p.cutoff = 1234; Q.setSound(2, s); Q.setBpm(97); return 1; };
const A = await page(NEW), B = await page(OLD);
// same project in both: export from new (without history), import in old, re-export both
await A.p.evaluate(SETUP); await A.p.waitForTimeout(500);
const fNew = await A.p.evaluate(() => SYNQUENZER.serialize());
await B.p.evaluate(f => SYNQUENZER.importJSON(f), fNew); await B.p.waitForTimeout(800);
const fOld = await B.p.evaluate(() => SYNQUENZER.serialize());
const jn = JSON.parse(fNew), jo = JSON.parse(fOld);
console.log('ohne Verlauf: format', jn.format, jo.format, 'sum', jn.sum, jo.sum, 'history field', 'history' in jn, 'appVersion', jn.appVersion, jo.appVersion);
const strip = j => { const o = Object.assign({}, j); delete o.appVersion; delete o.saved; return JSON.stringify(o); };
console.log('ohne Verlauf gleich (ohne appVersion):', strip(jn) === strip(jo));
// mit Verlauf
await A.p.evaluate(() => { UI.histFile = true; });
await A.p.evaluate(() => { const Q = SYNQUENZER; for (let i = 0; i < 6; i++) Q.setClip(3, i % 4, {len: 1, notes: [{n: 60 + i, t: 0, d: 1, v: .8}]}); });
await A.p.waitForTimeout(2600);
const fH = await A.p.evaluate(async () => JSON.stringify(await histFileAdd(projectFileObj(S, false, true))));
const jh = JSON.parse(fH);
const hA = await A.p.evaluate(() => SYNQUENZER.history());
console.log('mit Verlauf: format', jh.format, 'sum', jh.sum, '== ohne-sum-of-same-state', jh.sum === JSON.parse(await A.p.evaluate(() => SYNQUENZER.serialize())).sum, 'history chunks', jh.history && jh.history.chunks.length, 'bytes', fH.length, 'recorder', JSON.stringify(hA));
// fresh new browser
const C = await page(NEW);
await C.p.evaluate(f => SYNQUENZER.importJSON(f), fH); await C.p.waitForTimeout(1500);
const cC = await C.p.evaluate(() => historyCheck({detail: true})), hC = await C.p.evaluate(() => SYNQUENZER.history());
const projEq = (await C.p.evaluate(() => JSON.parse(SYNQUENZER.serialize()).project)) && JSON.stringify(JSON.parse(await C.p.evaluate(() => SYNQUENZER.serialize())).project) === JSON.stringify(JSON.parse(await A.p.evaluate(() => SYNQUENZER.serialize())).project);
console.log('Import frisch 4.25.0: check', JSON.stringify(cC), 'history', JSON.stringify(hC), 'project equal', projEq);
// old app opens the file with history
const D = await page(OLD);
const rD = await D.p.evaluate(f => { try { const r = SYNQUENZER.importJSON(f); return String(r); } catch (e) { return 'ERR ' + e; } }, fH); await D.p.waitForTimeout(1200);
const eqOld = JSON.stringify(JSON.parse(await D.p.evaluate(() => SYNQUENZER.serialize())).project) === JSON.stringify(JSON.parse(await A.p.evaluate(() => SYNQUENZER.serialize())).project);
console.log('4.23.0 öffnet Datei mit Verlauf:', rD, 'project equal', eqOld, 'errors', JSON.stringify(D.errs.slice(0, 3)));
console.log('errors', JSON.stringify([A.errs, B.errs, C.errs].map(e => e.slice(0, 3))));
await b.close();
