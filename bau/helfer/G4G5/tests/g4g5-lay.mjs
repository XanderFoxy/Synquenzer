// Layout: Blatt „Effekte“ (G4) und Takes-Blatt mit [In Melodie umwandeln] (G5) in P1–P3, L1, L2, 926×428:
// Tasten/Regler ≥ 44 × 44, nichts abgeschnitten, Blatt im Bild (oder mit dem Finger rollbar), kein Layout-Sprung
import {open, sleep, APP, OUT} from './h.mjs';
const FILE = process.argv[2] || APP;
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const VP = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], XL: [926, 428]};
const pcm = Array.from({length: 44100 * 4}, (_, i) => Math.round(8000 * Math.sin(2 * Math.PI * 220 * i / 44100) * (i % 22050 < 15000 ? 1 : 0)));
for (const [name, [w, h]] of Object.entries(VP)) {
  const H = await open({file: FILE, viewport: {width: w, height: h}, touch: true, mobile: true}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); });
  await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 44100, scene: 0, len: 2}), pcm); await sleep(600);
  const h0 = await p.evaluate(() => [document.documentElement.scrollHeight, document.body.scrollHeight, window.scrollY]);
  const check = async (sel, tag) => p.evaluate(([sel, tag]) => {
    const pop = UI.pop && UI.pop.el; if (!pop) return {err: 'kein Blatt'};
    const pr = pop.getBoundingClientRect(), bad = [], clip = [], vw = innerWidth, vh = innerHeight;
    for (const b of pop.querySelectorAll(sel)) { if (b.offsetParent === null) continue; const r = b.getBoundingClientRect(); if (r.width < 44 - 0.5 || r.height < 44 - 0.5) bad.push((b.textContent || b.getAttribute('aria-label') || b.tagName).trim().slice(0, 24) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
    for (const e of pop.querySelectorAll('button, .cllab, h4, .small')) { if (e.offsetParent === null) continue; if (e.scrollWidth > e.clientWidth + 1) clip.push((e.textContent || '').trim().slice(0, 30)); }
    const scroll = pop.scrollHeight > pop.clientHeight + 1, cs = getComputedStyle(pop), canScroll = /(auto|scroll)/.test(cs.overflowY);
    return {pop: [Math.round(pr.left), Math.round(pr.top), Math.round(pr.right), Math.round(pr.bottom)], inView: pr.left >= -0.5 && pr.top >= -0.5 && pr.right <= vw + 0.5 && pr.bottom <= vh + 0.5, scroll, canScroll, bad, clip, n: pop.querySelectorAll(sel).length};
  }, [sel, tag]);
  // Spur-Blatt der STIMME-Spur → [Effekte]
  await p.evaluate(() => openTrackSheet(stimmeT(), EL.top)); await sleep(200);
  const tb = await p.evaluate(() => { const b = UI.pop && UI.pop.el.querySelector('button[data-a="g4"]'); if (!b) return null; const r = b.getBoundingClientRect(); return {w: r.width, h: r.height, t: b.textContent}; });
  ok(tb && tb.w >= 44 && tb.h >= 44, `${name} Spur-Blatt STIMME: [${tb && tb.t}] ${tb && Math.round(tb.w)}×${tb && Math.round(tb.h)}`);
  await p.evaluate(() => UI.pop.el.querySelector('button[data-a="g4"]').dispatchEvent(new PointerEvent('pointerup', {bubbles: true}))); await sleep(50);
  if (!(await p.evaluate(() => UI.pop && UI.pop.name === 'g4'))) { await p.evaluate(() => { closePop(); g4Sheet(EL.top); }); }
  await sleep(300);
  const g = await check('button, input', 'g4');
  ok(!g.err && !g.bad.length && !g.clip.length && (g.inView || false) && (!g.scroll || g.canScroll), `${name} Blatt „Effekte“: ${g.n} Tasten/Regler ≥ 44 × 44 ${g.bad.length ? '✗ ' + g.bad.join(', ') : ''}; abgeschnitten: ${g.clip.length ? g.clip.join(' | ') : 'nichts'}; im Bild ${g.inView} ${JSON.stringify(g.pop)}${g.scroll ? ' (rollt mit dem Finger: ' + g.canScroll + ')' : ''}`);
  await p.screenshot({path: `${OUT}/g4-${name}-effekte.png`});
  // Rollen bis ans Ende: der letzte Regler ist erreichbar
  if (g.scroll) { const last = await p.evaluate(() => { const pop = UI.pop.el; pop.scrollTop = pop.scrollHeight; const r = [...pop.querySelectorAll('input')].pop().getBoundingClientRect(), q = pop.getBoundingClientRect(); return r.bottom <= q.bottom + 1 && r.top >= q.top - 1; }); ok(last, `${name} gerollt: letzter Regler (Delay) ganz sichtbar`); }
  await p.evaluate(() => closePop()); await sleep(150);
  // Takes-Blatt mit [In Melodie umwandeln]
  await p.evaluate(() => SYNQUENZER.tkSheet({t: stimmeT(), s: 0})); await sleep(300);
  const t = await check('button, input', 'takes');
  const g5 = await p.evaluate(() => { const b = UI.pop && UI.pop.el.querySelector('button[data-a="g5"]'); if (!b) return null; const r = b.getBoundingClientRect(), q = UI.pop.el.getBoundingClientRect(); return {w: r.width, h: r.height, inPop: r.bottom <= q.bottom + 1 || UI.pop.el.scrollHeight > UI.pop.el.clientHeight}; });
  ok(g5 && g5.w >= 44 && g5.h >= 44 && !t.bad.length && !t.clip.length && t.inView, `${name} Takes-Blatt: [In Melodie umwandeln] ${g5 && Math.round(g5.w)}×${g5 && Math.round(g5.h)}; alle ${t.n} ≥ 44 ${t.bad.join(', ')}; abgeschnitten: ${t.clip.length ? t.clip.join(' | ') : 'nichts'}; im Bild ${t.inView}${t.scroll ? ' (rollt: ' + t.canScroll + ')' : ''}`);
  await p.screenshot({path: `${OUT}/g5-${name}-takes.png`});
  await p.evaluate(() => closePop()); await sleep(200);
  const h1 = await p.evaluate(() => [document.documentElement.scrollHeight, document.body.scrollHeight, window.scrollY]);
  ok(JSON.stringify(h0) === JSON.stringify(h1), `${name} kein Layout-Sprung (Seitenhöhe ${h0} → ${h1})`);
  if (H.errs.length) ok(false, name + ' Konsolenfehler ' + H.errs.slice(0, 2));
  await H.br.close();
}
console.log(fail ? `FEHLER: ${fail}` : 'ALLE OK'); process.exit(fail ? 1 : 0);
