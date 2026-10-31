// VS-L Layout: Mikro-Blatt mit „Melodieerkennung“ (VS-L-10) und Länge 16 im Aufnahme-Blatt / Einstellungen (VS-L-04)
// node n4-vs-l-lay.mjs [file] [tag]
import {chromium} from 'playwright';
import {INIT as INIT2} from './v3-vs2-h.mjs';
const file = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-br-VSL/index.html', tag = process.argv[3] || 'neu';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const VP = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], XL: [926, 428]};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const geo = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(), bs = [...e.querySelectorAll('button')].filter(b => b.offsetParent);
  return {in: r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + .5 && r.bottom <= innerHeight + .5, r: [r.left, r.top, r.width, r.height].map(Math.round), scroll: e.scrollHeight > e.clientHeight + 1 ? [e.scrollHeight, e.clientHeight] : 0,
    small: bs.filter(b => { const q = b.getBoundingClientRect(); return q.height < 43.5 || q.width < 43.5; }).map(b => b.textContent.trim() + ' ' + Math.round(b.getBoundingClientRect().width) + '×' + Math.round(b.getBoundingClientRect().height)),
    cut: [...e.querySelectorAll('button,span,p,div.st-lbl,small,b')].filter(x => x.offsetParent && x.children.length === 0 && x.scrollWidth > x.clientWidth + 1).map(x => x.textContent.trim())}; };
for (const [k, [w, h]] of Object.entries(VP)) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT2);
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(500);
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.stimmeForget(); });
  const h0 = await p.evaluate(() => document.documentElement.scrollHeight);
  // Mikro an (Attrappe), Blatt öffnen
  await p.evaluate(() => SYNQUENZER.stimmeStart({route: 'wired', cal: false}));
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 8000}).catch(() => {});
  await p.evaluate(() => SYNQUENZER.stimmeSheet()); await sleep(400);
  const a = await p.evaluate(geo, '.pop.stpop');
  const row = await p.evaluate(() => { const e = document.querySelector('.pop.stpop .st-mel'); if (!e) return null; const bs = [...e.querySelectorAll('button')].map(b => { const q = b.getBoundingClientRect(); return {t: b.textContent, w: Math.round(q.width), h: Math.round(q.height), on: b.classList.contains('on'), vis: q.top >= 0 && q.bottom <= innerHeight}; }); const s = e.querySelector('span'); return {label: s.textContent, cut: s.scrollWidth > s.clientWidth + 1, bs, x: !!document.querySelector('.pop.stpop .st-melx')}; });
  if (tag === 'neu') {
    ok(row && row.label === 'Melodieerkennung' && row.bs.length === 2 && row.bs[0].t === 'An' && row.bs[1].t === 'Aus' && row.bs[0].on && !row.bs[1].on && !row.x, `${k} Zeile „Melodieerkennung“ [An] [Aus], Standard An, kein Satz ${JSON.stringify(row)}`);
    ok(row && row.bs.every(b => b.w >= 44 && b.h >= 44 && b.vis) && !row.cut, `${k} Knöpfe ≥ 44 × 44 und im Bild ${row && JSON.stringify(row.bs.map(b => b.w + '×' + b.h))}`);
  }
  ok(a && a.in && !a.scroll, `${k} Mikro-Blatt ganz im Bild ${a && JSON.stringify({r: a.r, scroll: a.scroll})}`);
  ok(a && !a.small.length, `${k} Mikro-Blatt: Knöpfe ≥ 44 × 44 ${a && JSON.stringify(a.small)}`);
  ok(a && !a.cut.length, `${k} Mikro-Blatt: nichts abgeschnitten ${a && JSON.stringify(a.cut)}`);
  await p.screenshot({path: `n4-vs-l-${tag}-${k}-mikro.png`});
  if (tag === 'neu') {
    await p.locator('.pop.stpop #vsMel button[data-v="0"]').tap(); await sleep(300);
    const b = await p.evaluate(geo, '.pop.stpop'), r2 = await p.evaluate(() => ({mel: SYNQUENZER.vsInfo().cfg.mel, x: (document.querySelector('.pop.stpop .st-melx') || {}).textContent || null, on: (document.querySelector('.pop.stpop #vsMel button.on') || {}).textContent, H: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth}));
    ok(r2.mel === false && r2.on === 'Aus' && r2.x === 'Aufnahme nur als Gesang auf der STIMME-Spur – keine Noten.', `${k} Tipp „Aus“: gespeichert, Satz darunter ${JSON.stringify(r2)}`);
    ok(b && b.in && !b.scroll && !b.small.length && !b.cut.length, `${k} bei Aus: Blatt ganz im Bild, ≥ 44, nichts abgeschnitten ${b && JSON.stringify({r: b.r, scroll: b.scroll, small: b.small, cut: b.cut})}`);
    ok(r2.H === h0 && r2.sw <= w, `${k} kein Layout-Sprung (Seitenhöhe ${h0} → ${r2.H}), kein waagrechtes Rollen (${r2.sw})`);
    await p.screenshot({path: `n4-vs-l-${tag}-${k}-mikro-aus.png`});
    await p.locator('.pop.stpop #vsMel button[data-v="1"]').tap(); await sleep(300);
    const r3 = await p.evaluate(() => ({mel: SYNQUENZER.vsInfo().cfg.mel, x: !!document.querySelector('.pop.stpop .st-melx')}));
    ok(r3.mel === true && !r3.x, `${k} Tipp „An“: zurück ${JSON.stringify(r3)}`);
  }
  await p.keyboard.press('Escape'); await p.evaluate(() => SYNQUENZER.stimmeSheet(false)); await sleep(200);
  // Aufnahme-Blatt (● lang drücken) → Länge
  const rb = await p.evaluate(() => { const r = document.querySelector('#bRec, .rec-btn, [aria-label*="Aufnahme"]'); return null; });
  const bRec = await p.evaluate(() => { const els = [...document.querySelectorAll('button')].filter(b => b.offsetParent && /REC|●/.test(b.textContent)); const b = els[0]; if (!b) return null; const q = b.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2, t: b.textContent.trim().slice(0, 20)}; });
  if (bRec) { await p.mouse.move(bRec.x, bRec.y); await p.mouse.down(); await sleep(650); await p.mouse.up(); await sleep(400); }
  const ro = await p.evaluate(() => { const s = document.querySelector('#roLen'); if (!s) return null; const pop = s.closest('.pop'), r = pop.getBoundingClientRect(); const bs = [...s.querySelectorAll('button')].map(b => { const q = b.getBoundingClientRect(); return {t: b.textContent, w: Math.round(q.width), h: Math.round(q.height), cut: b.scrollWidth > b.clientWidth + 1, vis: q.left >= 0 && q.right <= innerWidth + .5 && q.top >= 0 && q.bottom <= innerHeight + .5}; });
    return {bs, pin: r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + .5 && r.bottom <= innerHeight + .5, r: [r.left, r.top, r.width, r.height].map(Math.round)}; });
  ok(ro && ro.bs.map(b => b.t).join(' ') === (tag === 'neu' ? 'AUTO 1 2 4 8 16' : 'AUTO 1 2 4 8'), `${k} Aufnahme-Blatt: Länge ${ro && ro.bs.map(b => b.t).join(' ')} (${bRec && bRec.t})`);
  ok(ro && ro.pin && ro.bs.every(b => b.w >= 44 && b.h >= 44 && !b.cut && b.vis), `${k} Aufnahme-Blatt im Bild, Länge-Knöpfe ≥ 44 × 44 ${ro && JSON.stringify({r: ro.r, b: ro.bs.map(b => b.w + '×' + b.h + (b.cut ? ' cut' : '') + (b.vis ? '' : ' aus'))})}`);
  if (tag === 'neu' && ro) {
    await p.locator('#roLen button[data-v="16"]').tap(); await sleep(200);
    const v = await p.evaluate(() => ({s: SYNQUENZER.project().settings.recLength, on: (document.querySelector('#roLen button.on') || {}).textContent, sub: [...document.querySelectorAll('button')].filter(b => b.offsetParent && /16T/.test(b.textContent)).map(b => ({t: b.textContent.trim(), cut: b.scrollWidth > b.clientWidth + 1}))}));
    ok(v.s === 16 && v.on === '16', `${k} Tipp „16“ → Länge 16 ${JSON.stringify(v)}`);
    await p.screenshot({path: `n4-vs-l-${tag}-${k}-laenge.png`});
  }
  await p.keyboard.press('Escape'); await sleep(200);
  // Einstellungen → Aufnahme → Länge
  await p.evaluate(() => { document.querySelector('.pop') && SYNQUENZER.stimmeSheet(false); });
  const mb = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => b.offsetParent && (b.getAttribute('aria-label') || '').includes('Menü') || (b.offsetParent && b.textContent.trim() === '≡')); if (!b) return null; const q = b.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; });
  if (mb) { await p.mouse.click(mb.x, mb.y); await sleep(500); }
  const mr = await p.evaluate(() => { const rows = [...document.querySelectorAll('#menu .mrow')].filter(r => { const l = r.querySelector('.lbl'); return l && l.textContent === 'Länge'; }); const r = rows[0]; if (!r) return null; r.scrollIntoView({block: 'center'});
    const bs = [...r.querySelectorAll('button')].map(b => { const q = b.getBoundingClientRect(); return {t: b.textContent, w: Math.round(q.width), h: Math.round(q.height), cut: b.scrollWidth > b.clientWidth + 1, vis: q.left >= 0 && q.right <= innerWidth + .5}; }); return {bs, on: (r.querySelector('button.on') || {}).textContent}; });
  ok(mr && mr.bs.map(b => b.t).join(' ') === (tag === 'neu' ? 'AUTO 1 2 4 8 16' : 'AUTO 1 2 4 8') && (tag !== 'neu' || mr.on === '16'), `${k} Einstellungen: Länge ${mr && mr.bs.map(b => b.t).join(' ')} (gewählt ${mr && mr.on})`);
  ok(mr && mr.bs.every(b => b.w >= 44 && b.h >= 44 && !b.cut && b.vis), `${k} Einstellungen: Länge-Knöpfe ≥ 44 × 44, im Bild ${mr && JSON.stringify(mr.bs.map(b => b.w + '×' + b.h + (b.cut ? ' cut' : '') + (b.vis ? '' : ' aus')))}`);
  await sleep(200); await p.screenshot({path: `n4-vs-l-${tag}-${k}-menu.png`});
  const H2 = await p.evaluate(() => document.documentElement.scrollHeight);
  ok(!errs.length, `${k} keine Konsolenfehler ${JSON.stringify(errs.slice(0, 2))}`);
  await ctx.close();
}
await br.close();
console.log(fail ? `FEHLER: ${fail}` : 'ALLE OK');
