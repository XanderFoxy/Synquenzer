// Independent repro: Projekte -> Umbenennen on a parked newer-version project (MK0 lock).
// Usage: node v3-repro-nvrename-indep.mjs <index.html>
import { chromium } from 'playwright';
import fs from 'fs';
const FILE = process.argv[2];
const HTML = fs.readFileSync(FILE);
const BASE = 'https://xanderfoxy.github.io/Synquenzer/';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true});
let foreign = 0, sbCalls = [];
await ctx.route('**/*', async r => {
  const u = r.request().url();
  if (u === BASE || u.startsWith(BASE + '?') || u.startsWith(BASE + '#') || u === BASE + 'index.html') return r.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: HTML});
  if (u === BASE + 'sw.js') return r.fulfill({status: 200, contentType: 'application/javascript', body: '// test'});
  if (u.startsWith('data:') || u.startsWith('blob:')) return r.continue();
  if (/supabase/.test(u)) sbCalls.push(u);
  foreign++; return r.fulfill({status: 404, body: ''});
});
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', e => errs.push('pageerror: ' + e));
page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
const boot = async () => { await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000}); await page.waitForTimeout(400); };
const idb = (op, key, val) => page.evaluate(([op, key, val]) => new Promise((res, rej) => {
  const rq = indexedDB.open('synquenzer', 1); rq.onupgradeneeded = () => rq.result.createObjectStore('kv');
  rq.onsuccess = () => { const db = rq.result, t = db.transaction('kv', op === 'get' ? 'readonly' : 'readwrite'), st = t.objectStore('kv');
    const r = op === 'get' ? st.get(key) : st.put(val, key); t.oncomplete = () => { db.close(); res(op === 'get' ? r.result : true); }; t.onerror = () => rej(t.error); };
  rq.onerror = () => rej(rq.error); }), [op, key, val]);
const sum = (label, fo) => {
  if (!fo) { console.log(label, 'MISSING'); return; }
  const pj = fo.project || {};
  console.log(label, JSON.stringify({fileFormat: fo.format, appVersion: fo.appVersion, app: fo.app, pFormat: pj.format, name: pj.name, mkNeu: pj.mkNeu, mkIn: pj.tracks && pj.tracks[0] && pj.tracks[0].mkIn, s1engine: pj.tracks && pj.tracks[1] && pj.tracks[1].sound && pj.tracks[1].sound.engine}));
};

await page.goto(BASE); await boot();
// 1. a format-5 autosave of a newer version
const fo0 = JSON.parse(await page.evaluate(() => SYNQUENZER.serialize()));
const pj = fo0.project;
pj.id = 'p-zukunft-1'; pj.name = 'Zukunft'; pj.format = 5; pj.mkNeu = {a: 1};
pj.tracks[0].mkIn = {e1: 'mic'};
pj.tracks[1].sound = {$: 'snd', v: 1, id: null, name: 'Zukunfts-Klang', cat: 'lead', engine: 'xyz', ev: 3, p: {weird: 'abc', cutoff: 777}, mods: [], fx: {drive: .1, vol: .7}};
pj.bpm = 133;
await idb('put', 'project', {mt: Date.now() + 5000, app: 4009000, project: pj});
await page.evaluate(() => { try { localStorage.removeItem('synquenzer.rescue'); } catch (e) {} });
// 2. reload
await page.reload(); await boot();
const st1 = await page.evaluate(() => ({id: S.id, bpm: S.bpm, lock: SYNQUENZER.nvState().lock, ban: !!document.getElementById('nvBan'), ver: VERSION}));
console.log('after reload:', JSON.stringify(st1));
sum('KV project after reload:', await idb('get', 'project'));
// 3. newProject
await page.evaluate(() => SYNQUENZER.newProject()); await page.waitForTimeout(1500);
const st2 = await page.evaluate(() => ({id: S.id, lock: SYNQUENZER.nvState().lock}));
console.log('after newProject:', JSON.stringify(st2));
const park1 = await idb('get', 'proj:p-zukunft-1');
sum('parked after newProject:', park1);
// 4. rename (same function as the Umbenennen button)
const rr = await page.evaluate(() => SYNQUENZER.renameProject('p-zukunft-1', 'Zukunft neu'));
console.log('renameProject returned', rr);
const park2 = await idb('get', 'proj:p-zukunft-1');
sum('parked after rename:', park2);
console.log('bpm parked after rename:', park2 && park2.project.bpm);
// 5. open it again
const ro = await page.evaluate(() => SYNQUENZER.openProject('p-zukunft-1'));
await page.waitForTimeout(1500);
const st3 = await page.evaluate(() => ({ret: null, id: S.id, name: S.name, bpm: S.bpm, lock: SYNQUENZER.nvState().lock, ban: !!document.getElementById('nvBan'), s1: SYNQUENZER.getSound(1).engine}));
st3.ret = ro;
console.log('after openProject:', JSON.stringify(st3));
sum('KV project after open:', await idb('get', 'project'));
const kvp = await idb('get', 'project');
console.log('KV project app code after open:', kvp && kvp.app);
sum('parked after open:', await idb('get', 'proj:p-zukunft-1'));
// control: rename via the UI button path (Menü -> Projekte -> Umbenennen) is wired to renameProject
console.log('UI wiring:', await page.evaluate(() => /renameProject\(e\.id, inp\.value\)/.test(document.documentElement.innerHTML)));
console.log('errors:', errs.length ? errs.join(' | ').slice(0, 400) : 'none', '| foreign requests', foreign, '| supabase', sbCalls.length);
await browser.close();
