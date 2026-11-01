// NDSTAGE: alle Tasten der North-Oberfläche >= 44 x 44 px in 7 Formaten (inkl. 428x926), kein waagrechtes Scrollen, keine Konsolenfehler.
// Geprüft: SOUND (TONE NOISE CLICK MIX FX), TIEF/KANAL, KIT, KIT North · HALL & ECHO, die Popover Quelle, Programm, WAVE, ⋯ und der Kit-Browser
// mit den North-Kits. Die Unter-Reiter-Zeile (sheetFrame, App-Höhe 28-32 px, ND42 Abw. 4 / Frage 3) wird getrennt gemeldet.
// Aufruf: node ndstage-tap44.mjs <index.html> [outdir]
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const [file, out] = process.argv.slice(2); if (out) fs.mkdirSync(out, {recursive: true});
const FORMATS = [[390, 844], [375, 667], [320, 568], [428, 926], [844, 390], [667, 375], [926, 428]];
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const res = []; let fails = 0;
const measure = sel => `(() => { const small = [], out = []; const R = [...document.querySelectorAll(${JSON.stringify(sel)})];
  for (const e of R) for (const x of [e, ...e.querySelectorAll('button,[role=switch],.knob,.stab')]) {
    if (!x.matches('button,[role=switch],.knob')) continue; if (!x.offsetParent) continue; const q = x.getBoundingClientRect(); if (!q.width) continue;
    if (q.width < 43.5 || q.height < 43.5) small.push((x.className || x.tagName) + ' „' + (x.textContent || '').trim().slice(0, 14) + '“ ' + Math.round(q.width) + 'x' + Math.round(q.height));
    if (q.right > innerWidth + .5 || q.left < -.5) out.push((x.className || x.tagName) + ' ' + Math.round(q.left) + '/' + Math.round(q.right)); }
  return {n: R.length, small: [...new Set(small)].slice(0, 10), out: [...new Set(out)].slice(0, 6), hscroll: document.documentElement.scrollWidth > innerWidth + 1}; })()`;
for (const [w, h] of FORMATS) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(500);
  await p.evaluate(async () => { ensureAudio(); SYNQUENZER.loadKit('Fell & Holz'); R.selT = DRUM_T; openEditor(); ED.dVoice = 0; ED.dTab = 'sound'; MDE.sub = 'tone'; buildDrumEd(); await new Promise(r => setTimeout(r, 300)); });
  const views = [['tone', 'sound'], ['noise', 'sound'], ['click', 'sound'], ['mix', 'sound'], ['fx', 'sound'], [null, 'tief'], ['kit', 'kit'], ['md', 'kit']];
  for (const [sub, tab] of views) {
    await p.evaluate(async ([sub, tab]) => { closePop && closePop(); ED.dTab = tab; if (sub && tab === 'sound') MDE.sub = sub; if (tab === 'kit') MDE.kitSub = sub; buildDrumEd(); await new Promise(r => setTimeout(r, 200)); }, [sub, tab]);
    const m = await p.evaluate(measure('.pg-md, .pg-mdk, .mdkit, .dsrc, .mdprog'));
    const subs = await p.evaluate(() => [...document.querySelectorAll('#drumSheet .sh-subs .stab')].filter(x => x.offsetParent).map(x => Math.round(x.getBoundingClientRect().height)));
    const okv = !m.small.length && !m.out.length && !m.hscroll; if (!okv) fails++;
    res.push({fmt: w + 'x' + h, view: tab + ':' + sub, ok: okv, ...m, subTabH: [...new Set(subs)]});
    if (out) await p.screenshot({path: `${out}/tap44-${w}x${h}-${tab}-${sub}.png`});
  }
  // Popover: Quelle, Programm, WAVE-Liste, ⋯ (auf SOUND/TONE)
  await p.evaluate(async () => { closePop(); ED.dTab = 'sound'; MDE.sub = 'tone'; buildDrumEd(); await new Promise(r => setTimeout(r, 200)); });
  for (const [nm, sel] of [['Quelle', '.dsrc'], ['Programm', '.mdprog'], ['WAVE', '.knob.mdc[data-key="md.mWav"]'], ['⋯', '.mdmore']]) {
    const has = await p.$(sel); if (!has) { res.push({fmt: w + 'x' + h, view: 'pop:' + nm, ok: false, err: 'kein ' + sel}); fails++; continue; }
    try { await p.tap(sel, {timeout: 4000}); } catch (e) { res.push({fmt: w + 'x' + h, view: 'pop:' + nm, ok: false, err: 'Tipp: ' + String(e).slice(0, 80)}); fails++; continue; } await p.waitForTimeout(600);
    const m = await p.evaluate(measure('.pop'));
    const okv = m.n > 0 && !m.small.length && !m.out.length && !m.hscroll; if (!okv) fails++;
    res.push({fmt: w + 'x' + h, view: 'pop:' + nm, ok: okv, ...m});
    if (out) await p.screenshot({path: `${out}/tap44-${w}x${h}-pop-${nm.replace(/[^a-zA-Z]/g, 'x')}.png`});
    await p.evaluate(() => closePop()); await p.waitForTimeout(150);
    if (await p.evaluate(() => document.getElementById('popLayer') && document.getElementById('popLayer').classList.contains('open'))) { try { await p.mouse.click(2, 2); } catch (e) {} await p.waitForTimeout(150); }
  }
  if (errs.length) { fails++; res.push({fmt: w + 'x' + h, errs: errs.slice(0, 4)}); }
  await ctx.close();
}
for (const r of res) console.log(JSON.stringify(r));
console.log(JSON.stringify({test: 'ndstage-tap44', pass: fails === 0, fails, views: res.length}));
await b.close(); process.exit(fails ? 1 : 0);
