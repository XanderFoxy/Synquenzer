// CLIP0 – Bestandsaufnahme (nur lesen/ausprobieren): „innerhalb von Clips neue Auswahlen treffen und daraus neue Clips erzeugen“
// Noten-Editor eines Matrix-Clips, Drum-Schritt-Editor, Spektral. Touch über CDP. Aufruf: node clip0-test.mjs <abs. index.html> [428x926,...]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), dir = path.dirname(file), here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(here, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file);
const out = {}; const log = (k, v) => { out[k] = v; console.log(k + ' = ' + JSON.stringify(v)); };
const b = await chromium.launch({args: ['--disable-renderer-backgrounding']});
const VIEWS = (process.argv[3] || '428x926,926x428,926x370').split(',').map(s => s.split('x').map(Number));
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (const [W, H] of VIEWS) {
  const tag = W + 'x' + H, errs = [];
  const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage(), cdp = await ctx.newCDPSession(p);
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, i) => ({x: q[0], y: q[1], id: i, radiusX: 2, radiusY: 2, force: 1}))});
  let taps = 0;
  const tap = async q => { if (!q) throw new Error('Knopf fehlt'); taps++; await touch('touchStart', [q]); await sleep(60); await touch('touchEnd', []); await sleep(260); };
  const at = (fn, arg) => p.evaluate(([src, a]) => { const e = (0, eval)(src)(a); if (!e || !e.getClientRects().length) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, Math.round(r.width), Math.round(r.height)]; }, [fn.toString(), arg]);
  const shot = n => p.screenshot({path: path.join(fotos, n + '-' + tag + '.png')});
  await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk, null, {timeout: 60000}); await sleep(800);
  // D1 · 4-Takt-Clip, Auswahl = Takt 3–4 (2 Takte, 8 Noten) → Kopieren → leerer Platz → ✎ → Einfügen
  const D0 = await p.evaluate(() => { setSongView(false); const c = S.tracks[0].clips[0]; c.len = 4; c.notes = []; for (let k = 0; k < 16; k++) c.notes.push({t: k, d: .5, n: 60 + (k % 5), v: .8}); clipChanged(0, 0); selectTrack(0); openRoll(0, 0); const ix = c.notes.map((n, k) => k).filter(k => c.notes[k].t >= 8); ED.roll.selectIdx(ix); return {n: c.notes.length, gewaehlt: ix.length, takte: c.len}; });
  await sleep(300);
  if (W === 428) await shot('d1-auswahl-takt3-4');
  taps = 0;
  await tap(await at(() => [...ED.roll.el.acts.children].find(x => /Noten kopieren/.test(x.textContent))));
  await p.evaluate(() => closeRoll()); taps++; await sleep(300);
  await tap(await at(() => document.querySelector('.slot[data-t="0"][data-s="2"]')));
  await tap(await at(() => EL.bEdit)); await sleep(400);
  await tap(await at(() => [...ED.roll.el.acts.children].find(x => /Noten einfügen/.test(x.textContent))));
  if (W === 428) await shot('d2-einfuegen-neuer-clip-1-takt');
  await tap(await at(() => [...ED.roll.el.acts.children].find(x => /✓ Einfügen/.test(x.textContent))));
  const D1 = await p.evaluate(() => { const c = S.tracks[0].clips[2]; return c ? {len: c.len, n: c.notes.length, t: c.notes.map(x => x.t)} : null; });
  const say = await p.evaluate(() => { const t = document.querySelector('.toast, #toast'); return t ? t.textContent.trim().slice(0, 120) : null; });
  log(tag + ' D1.zwei-takte-in-neuen-clip', {quelle: D0, ergebnis: D1, meldung: say, tipps: taps});
  await p.evaluate(() => closeRoll());
  // D2 · Drum-ROLLE: Kopieren/Einfügen + Auslagern?
  await p.evaluate(() => openRoll(DRUM_T, 0)); await sleep(600);
  const rb = await at(() => [...EL.drumSheet.querySelectorAll('button')].find(x => /^ROLLE$/.test(x.textContent.trim())));
  if (rb) await tap(rb); await sleep(500);
  const D2 = await p.evaluate(() => ({roll: !!ED.roll, acts: ED.roll && ED.roll.el && ED.roll.el.acts ? [...ED.roll.el.acts.children].filter(x => x.tagName === 'BUTTON' && !x.hidden).map(x => x.textContent.trim()) : null}));
  log(tag + ' D2.drum-rolle', D2);
  if (W === 428) await shot('d3-drum-rolle');
  log(tag + ' konsole', errs.slice(0, 5));
  await ctx.close();
}
await b.close(); srv.close();
fs.writeFileSync(path.join(here, 'clip0-d.json'), JSON.stringify(out, null, 1));
