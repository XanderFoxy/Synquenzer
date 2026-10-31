// QA (abnahme) VS-L: Layout Mikro-Blatt (VS-L-10) und Länge (VS-L-04) per elementFromPoint, 6 Formate; node n4-vs-l-qa-lay.mjs <file> <tag>
import {chromium} from 'playwright';
import {INIT as INIT2} from './v3-vs2-h.mjs';
const file = process.argv[2], tag = process.argv[3] || 'neu';
const VP = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], XL: [926, 428]};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
// Treffer-Prüfung: Box 44×44 um die Mitte jedes Knopfs; 9 Punkte; alle müssen den Knopf (oder ein Kind) treffen
const HIT = (sel) => {
  const root = document.querySelector(sel); if (!root) return null;
  const out = [];
  for (const b of root.querySelectorAll('button')) {
    if (!b.offsetParent) continue;
    const q = b.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2;
    const pts = []; for (const dx of [-21, 0, 21]) for (const dy of [-21, 0, 21]) pts.push([cx + dx, cy + dy]);
    const miss = pts.filter(([x, y]) => { const e = document.elementFromPoint(x, y); return !e || !(e === b || b.contains(e)); }).map(([x, y]) => { const e = document.elementFromPoint(x, y); return [Math.round(x), Math.round(y), e ? (e.id || e.className || e.tagName).toString().slice(0, 30) + ':' + (e.textContent || '').trim().slice(0, 12) : 'null']; });
    out.push({t: b.textContent.trim().slice(0, 22), w: Math.round(q.width), h: Math.round(q.height), top: Math.round(q.top), bottom: Math.round(q.bottom), miss: miss.length, ex: miss.slice(0, 2)});
  }
  return out;
};
const res = {};
for (const [k, [w, h]] of Object.entries(VP)) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT2);
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(600);
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  const H0 = await p.evaluate(() => ({H: document.documentElement.scrollHeight, bh: document.body.scrollHeight}));
  await p.evaluate(() => SYNQUENZER.stimmeStart({route: 'wired', cal: false}));
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 8000}).catch(() => {});
  await sleep(500);
  // Mikro-Blatt über die echte Mikro-Zeile / Taste öffnen (Tipp)
  const anchor = await p.evaluate(() => { const c = ['.st-row', '#bMicT', '#segMic', '[data-mode="mic"]']; for (const s of c) { const e = document.querySelector(s); if (e && e.offsetParent) { const q = e.getBoundingClientRect(); return {s, x: q.left + q.width / 2, y: q.top + q.height / 2}; } } return null; });
  await p.evaluate(() => SYNQUENZER.stimmeSheet()); await sleep(500);
  const g = await p.evaluate(() => { const e = document.querySelector('.pop.stpop'); if (!e) return null; const r = e.getBoundingClientRect(); const go = e.querySelector('.st-go').getBoundingClientRect(), mel = e.querySelector('.st-mel'); const mr = mel ? mel.getBoundingClientRect() : null;
    const cut = [...e.querySelectorAll('button,span,p,div.st-lbl,small,b,h4')].filter(x => x.offsetParent && x.children.length === 0 && x.scrollWidth > x.clientWidth + 1).map(x => x.textContent.trim());
    return {pop: [r.left, r.top, r.width, r.height].map(Math.round), vh: innerHeight, sh: e.scrollHeight, ch: e.clientHeight, fits: e.scrollHeight <= e.clientHeight + 1 && r.bottom <= innerHeight + .5 && r.top >= -.5, goVisible: go.bottom <= Math.min(r.bottom, innerHeight) + .5, goBottom: Math.round(go.bottom), mel: mr && [Math.round(mr.top), Math.round(mr.bottom)], cut, ta: getComputedStyle(e).touchAction}; });
  const hits = await p.evaluate(HIT, '.pop.stpop');
  res[k] = {g, mikroHits: hits && hits.filter(x => x.miss), errs: errs.slice(0, 3)};
  // Aus antippen (echter Tipp) → Position der Knöpfe vor/nach, Seitenhöhe
  if (tag === 'neu') {
    const before = await p.evaluate(() => { const b = document.querySelector('.pop.stpop #vsMel button[data-v="0"]'); const q = b.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2, top: document.querySelector('.pop.stpop').getBoundingClientRect().top}; });
    await p.touchscreen.tap(before.x, before.y); await sleep(400);
    const after = await p.evaluate(() => { const b = document.querySelector('.pop.stpop #vsMel button[data-v="0"]'); const q = b.getBoundingClientRect(); const e = document.querySelector('.pop.stpop'), r = e.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2, top: r.top, mel: SYNQUENZER.vsInfo().cfg.mel, H: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth, sh: e.scrollHeight, ch: e.clientHeight, x2: (e.querySelector('.st-melx') || {}).textContent || null, xcut: (() => { const m = e.querySelector('.st-melx'); if (!m) return null; const mr = m.getBoundingClientRect(); return m.scrollWidth > m.clientWidth + 1 || mr.right > r.right + .5; })()}; });
    const hits2 = await p.evaluate(HIT, '.pop.stpop');
    res[k].toggle = {before, after, H0, hitsAus: hits2 && hits2.filter(x => x.miss)};
    // zurück auf An
    await p.touchscreen.tap(after.x - 60, after.y); await sleep(300);
    res[k].back = await p.evaluate(() => SYNQUENZER.vsInfo().cfg.mel);
  }
  await p.evaluate(() => SYNQUENZER.stimmeSheet(false)); await sleep(200);
  // Aufnahme-Blatt (● lang drücken, echter Touch)
  const bRec = await p.evaluate(() => { const b = document.getElementById('bRec'); if (!b || !b.offsetParent) return null; const q = b.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; });
  if (bRec) { const cdp = await ctx.newCDPSession(p); await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: bRec.x, y: bRec.y}]}); await sleep(700); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(500); }
  const ro = await p.evaluate(() => { const s = document.querySelector('#roLen'); if (!s) return null; const pop = s.closest('.pop'), r = pop.getBoundingClientRect(); return {r: [r.left, r.top, r.width, r.height].map(Math.round), fits: r.bottom <= innerHeight + .5 && r.top >= -.5 && r.right <= innerWidth + .5 && r.left >= -.5, sh: pop.scrollHeight, ch: pop.clientHeight, labels: [...s.querySelectorAll('button')].map(b => b.textContent), cut: [...pop.querySelectorAll('button,span,b')].filter(x => x.offsetParent && x.children.length === 0 && x.scrollWidth > x.clientWidth + 1).map(x => x.textContent.trim())}; });
  const roHits = await p.evaluate(HIT, '#roLen');
  res[k].rec = {bRec: !!bRec, ro, roHits};
  if (ro && tag === 'neu') {
    const b16 = await p.evaluate(() => { const b = document.querySelector('#roLen button[data-v="16"]'); const q = b.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; });
    await p.touchscreen.tap(b16.x, b16.y); await sleep(300);
    res[k].rec.after16 = await p.evaluate(() => ({len: SYNQUENZER.project().settings.recLength, on: (document.querySelector('#roLen button.on') || {}).textContent, chip: (document.getElementById('chipLen') || {}).textContent, chipCut: (() => { const c = document.getElementById('chipLen'); return c ? c.scrollWidth > c.clientWidth + 1 : null; })()}));
  }
  await p.keyboard.press('Escape'); await sleep(200);
  await p.evaluate(() => { try { SYNQUENZER.closePop && SYNQUENZER.closePop(); } catch (e) {} });
  res[k].errs = errs.slice(0, 3);
  await ctx.close();
}
await br.close();
console.log(JSON.stringify(res, null, 0).replace(/\},"(P|L|XL)/g, '},\n"$1'));
