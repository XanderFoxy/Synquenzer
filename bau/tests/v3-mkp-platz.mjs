// MK-P-07 (M-PLATZ, scale, hits, >= 44 outside the plate), MK-P-13 (M-RAHMEN), screenshots of every format
import {launch, open, tap, panel, FMT} from './v3-mkp-lib.mjs';
const FILE = process.argv[2], ONLY = process.argv[3] ? process.argv[3].split(',') : null; const R = {}, fail = []; const ok = (id, c, info) => { R[id] = (R[id] || 0) + 1; if (!c) fail.push(id + ': ' + info); };
const b = await launch();
const measure = page => page.evaluate(() => {
  const sh = EL.synthSheet, fr = MKUI.P.el && MKUI.P.el.fr && MKUI.P.el.fr.isConnected ? MKUI.P.el.fr : document.querySelector('#synthSheet .sh-body'), r = e => { const q = e.getBoundingClientRect(); return [q.left, q.top, q.width, q.height].map(v => Math.round(v * 10) / 10); };
  const cut = []; for (const e of sh.querySelectorAll('*')) { if (!e.offsetWidth || !e.firstChild || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') continue; if (e.scrollWidth > e.clientWidth + 1 && e.closest('.mkplate') === null && !e.closest('.lcd.mq') && !(e.closest('.hb, .pn') && !e.closest('.mkqh') && (cs.textOverflow === 'ellipsis' || cs.overflow === 'visible'))) cut.push((e.className || e.tagName) + ':' + e.textContent.trim().slice(0, 16) + ' ' + e.scrollWidth + '>' + e.clientWidth); }
  for (const e of (MKUI.PL.el ? MKUI.PL.el.querySelectorAll('.mkpt,.ln') : [])) if (e.scrollWidth > e.clientWidth + 1) cut.push('platte:' + e.textContent);
  const small = []; const q = '.mkqh button,.mkqh .tab,.sh-tabs .tab,.mknav button,.mkspb,.mksk,.mkhp,.mkwheel,.mkx.mback,.mkx.msqk';
  for (const e of document.querySelectorAll(q)) { if (!e.offsetWidth || e.closest('[hidden]')) continue; const x = e.getBoundingClientRect(); if (x.width < 43.5 || x.height < 43.5) small.push((e.className || e.tagName).slice(0, 18) + ' ' + Math.round(x.width) + 'x' + Math.round(x.height)); }
  const kb = document.getElementById('kbArea');
  const ls = (window.__LS || []).filter(e => !e.src.every(x => x === 'SPURBANK' || (/^lauf-an$/.test(e.st) && /^(pv rb|pa rb)$/.test(x)))).filter(e => !(/^(spiel|spiel-h2|fx)$/.test(e.st) && innerWidth > innerHeight && e.src.every(x => /^(kbArea|mrid|::after|kb)$/.test(x))));   // H-17: in landscape SPIEL the keys move into the frame (a tab tap = input)
  return {frame: r(fr), sheet: r(sh), sh: document.scrollingElement.scrollHeight, sw: document.scrollingElement.scrollWidth, vw: innerWidth, kb: r(kb), cut, small, ls: ls.length, lsd: JSON.stringify(ls).slice(0, 400)};
});
for (const [f, [w, h]] of Object.entries(FMT)) {
  if (ONLY && !ONLY.includes(f)) continue;
  const SAFE = process.env.SAFE ? process.env.SAFE.split(',').map(Number) : null;   // safe-area pass: left/right, bottom (px), the env() values replaced in the app's own rules
  const page = await open(b, FILE, f, {init: () => { window.__LS = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__LS.push({v: e.value, st: window.__ST || '', src: e.sources.map(x => x.node ? (x.node.closest && x.node.closest('.slot') || (x.node.parentElement && x.node.parentElement.closest('.slot')) ? 'SPURBANK' : x.node.id || String(x.node.className || x.node.nodeName)) : '-')}); }).observe({type: 'layout-shift', buffered: false}); } catch (e) {} }});
  if (SAFE) { const [lr, bt] = SAFE; await page.addStyleTag({content: `#app{padding:0 ${lr}px ${bt}px ${lr}px!important}#app.mkq #synthSheet{left:${lr}px!important;right:${lr}px!important;bottom:${bt}px!important}`}); await page.waitForTimeout(700); }
  const land = w > h, res = {states: {}}; await page.waitForTimeout(400); await page.evaluate(() => { window.__LS = []; });   // shifts of the app start are not the panel's
  const m0 = await measure(page); const p0 = await panel(page);
  // the scale rules (independent: from the measured frame)
  const fw = p0.rahmen.w, fh = p0.rahmen.h, whole = land || (fw >= 700 && fh >= 418), zov = whole ? Math.min(fw, fh * 1.95) : Math.min(fw / .556, fh * 1.95);
  res.rahmen = [fw, fh]; res.zOv = [p0.z, +zov.toFixed(2)]; ok('MK-P-07', Math.abs(p0.z - zov) <= 1, f + ' z Gesamtansicht ' + p0.z + ' / ' + zov);
  for (const H of p0.halte) { const fit = Math.min(fw / (H.w / 100), fh * 1.95 / (H.h / 100)), z = Math.max(zov, Math.min(1320, fit)); ok('MK-P-07', Math.abs(H.z - z) <= 1, f + ' z Halt ' + H.nr + ' ' + H.z + ' / ' + z); }
  res.halteZ = p0.halte.map(H => Math.round(H.z)).join(',');
  const states = [['ganz', {ansicht: 'ganz', haelfte: 'links'}], ['ganz-rechts', {ansicht: 'ganz', haelfte: 'rechts'}]];
  for (let n = 1; n <= 13; n++) states.push(['halt' + n, {ansicht: 'zoom', halt: n}]);
  states.push(['edit', {ansicht: 'ganz', modus: 'edit', seite: '08'}], ['global', {ansicht: 'ganz', modus: 'global', seite: '1A'}], ['vocoder', 'voc'], ['schritte', 'steps'], ['eigene', 'own'], ['baender', 'bands'], ['spiel', {ansicht: 'spiel'}], ['spiel-h2', 'sp2'], ['fx', {ansicht: 'fx'}], ['geraet', 'back'], ['compare', 'cmp'], ['compare-aus', 'cmp0'], ['programm', 'prog'], ['lauf-an', 'lauf'], ['lauf-aus', 'lauf0'], ['spur2', 'sp2b'], ['spur1', 'sp1b']);
  for (const [nm, v] of states) {
    await page.evaluate(nm => { window.__ST = nm; }, nm); if (process.env.DBG) console.log(f, nm, await page.evaluate(() => [S.tracks[0].sound.engine, R.selT]));
    if (typeof v === 'string') await page.evaluate(v => { if (v === 'voc') { SYNQUENZER.mkSet(0, 'mode', 3); MKUI.P.mode = 'spiel'; MKUI.view({ansicht: 'ganz'}); } else if (v === 'steps') { SYNQUENZER.mkSet(0, 'mode', 0); MKUI.viewOpen('schritte'); } else if (v === 'own') { MKUI.viewClose(); SYNQUENZER.mkSet(0, 'scale', 9); MKUI.viewOpen('eigene'); } else if (v === 'bands') { MKUI.viewClose(); SYNQUENZER.mkSet(0, 'scale', 0); SYNQUENZER.mkSet(0, 'mode', 3); MKUI.viewOpen('baender'); } else if (v === 'sp2') { MKUI.P.spielHaelfte = 1; safeRebuild(buildSynthEd); } else if (v === 'back') { MKUI.view({ansicht: 'ganz'}); ED.tab = 'geraet'; safeRebuild(buildSynthEd); }
      else if (v === 'cmp') { window.__E0 = S.tracks[0].sound.engine; MKUI.compare(); window.__E1 = S.tracks[0].sound.engine; loadPreset(0, INIT_IDS.mk); SYNQUENZER.mkSet(0, 't.0.f.cut', 30); MKUI.P.mode = 'spiel'; MKUI.press('edit'); MKUI.P.editHeld = 1; MKUI.press('exit'); MKUI.P.editHeld = 0; }
      else if (v === 'cmp0') { MKUI.press('exit'); MKUI.press('exit'); }
      else if (v === 'prog') { MKUI.mkPanelProg('step', 1); }
      else if (v === 'lauf') { ensureAudio(); SYNQUENZER.mkSet(0, 't.0.seq.on', 1); SYNQUENZER.mkSet(0, 't.0.seq.q.0.k', 11); SYNQUENZER.keyOn(60, .8, 'qL'); }
      else if (v === 'lauf0') { SYNQUENZER.keyOff(60, 'qL'); SYNQUENZER.mkSet(0, 't.0.seq.on', 0); }
      else if (v === 'sp2b') { SYNQUENZER.setEngine(1, 'mk'); SYNQUENZER.selectTrack(1); SYNQUENZER.openEditor(); }
      else if (v === 'sp1b') { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); } }, v);
    else await page.evaluate(v => { if (MKUI.P.view) MKUI.viewClose(); SYNQUENZER.mkSet(0, 'mode', 0); MKUI.P.mode = v.modus || 'spiel'; if (v.ansicht !== 'spiel' && v.ansicht !== 'fx' && ED.tab !== 'geraet') { ED.tab = 'geraet'; safeRebuild(buildSynthEd); } MKUI.view(v); }, v);
    await page.waitForTimeout(nm.startsWith('halt') ? 300 : /^(lauf-an|spur)/.test(nm) ? 900 : 450);
    const m = await measure(page);
    const same = (nm === 'fx' || JSON.stringify(m.frame) === JSON.stringify(m0.frame)) && JSON.stringify(m.sheet) === JSON.stringify(m0.sheet) && m.sh === m0.sh && m.sw === m0.sw;
    ok('MK-P-13', same, f + ' ' + nm + ' Rahmen ' + JSON.stringify([m.frame, m0.frame, m.sheet, m0.sheet, m.sh, m0.sh]));
    if (!land) ok('MK-P-13', JSON.stringify(m.kb) === JSON.stringify(m0.kb), f + ' ' + nm + ' Tastatur ' + m.kb + ' / ' + m0.kb);
    ok('MK-P-07', m.sw <= m.vw, f + ' ' + nm + ' waagrecht ' + m.sw);
    ok('MK-P-07', !m.cut.length, f + ' ' + nm + ' abgeschnitten ' + m.cut.join('; '));
    ok('MK-P-07', !m.small.length, f + ' ' + nm + ' < 44 ' + m.small.join('; '));
    res.states[nm] = m.cut.length + m.small.length ? 'FEHLER' : 'ok';
    if (['ganz', 'ganz-rechts', 'halt4', 'halt6', 'halt12', 'halt13', 'edit', 'global', 'vocoder', 'schritte', 'eigene', 'baender', 'spiel', 'spiel-h2', 'fx'].includes(nm)) await page.screenshot({path: 'v3-mkp-shots/platz/' + f + '-' + nm + '.png'});
  }
  const eE = await page.evaluate(() => [window.__E0, window.__E1]); ok('MK-P-05', eE[1] === 'mk', f + ' COMPARE mit fremdem Ursprung wechselt die Engine ' + eE);
  const mE = await measure(page); ok('MK-P-13', mE.ls === 0, f + ' layout-shift ' + mE.ls + ' ' + mE.lsd); res.layoutShift = mE.ls;
  // hits: every 4 px of the visible plate → the nearest active element (independent of the app's buckets) or free; zones never overlap
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 0); if (MKUI.P.view) MKUI.viewClose(); }); await page.waitForTimeout(100);
  for (const v of land ? [{ansicht: 'ganz'}, {ansicht: 'zoom', halt: 6}, {ansicht: 'zoom', halt: 13}] : [{ansicht: 'ganz', haelfte: 'links'}, {ansicht: 'ganz', haelfte: 'rechts'}, {ansicht: 'zoom', halt: 9}]) {
    await page.evaluate(v => MKUI.view(v), v); await page.waitForTimeout(80);
    const t = await page.evaluate(() => {
      const p = SYNQUENZER.mkPanel(), fr = MKUI.P.el.fr.getBoundingClientRect(), T = MKUI.P.el.T, s = T.z / 1000, act = p.elements.filter(e => ['k', 'b', 'bl', 's', 'lcd'].includes(e.art) && e.px);
      const lim = 18 * s; let n = 0, bad = 0, free = 0; const ex = [];
      const vis = e => e.px.x + e.px.w >= fr.left - .01 && e.px.x <= fr.right + .01 && e.px.y + e.px.h >= fr.top - .01 && e.px.y <= fr.bottom + .01;
      for (let y = fr.top + 2; y < fr.bottom; y += 4) for (let x = fr.left + 2; x < fr.right; x += 4) {
        const px = (x - fr.left - T.tx) / s, py = (y - fr.top - T.ty) / s; if (px < 0 || py < 0 || px > 1000 || py > 512.8) continue;
        let best = null, bd = 1e9, bc = 1e9; for (const e of act) { if (!vis(e)) continue; const dx = x < e.px.x ? e.px.x - x : x > e.px.x + e.px.w ? x - e.px.x - e.px.w : 0, dy = y < e.px.y ? e.px.y - y : y > e.px.y + e.px.h ? y - e.px.y - e.px.h : 0, d = Math.hypot(dx, dy), dc = Math.hypot(e.px.x + e.px.w / 2 - x, e.px.y + e.px.h / 2 - y);
          if (d > lim + 1e-6) continue; if (d < bd - 1e-6 || (Math.abs(d - bd) <= 1e-6 && dc < bc)) { best = e; bd = d; bc = dc; } }
        const h = MKUI.hitAt(px, py, MKUI.visRect()), hv = h ? h.id : null; n++; if (!best) free++;
        if ((best ? best.id : null) !== hv) { bad++; if (ex.length < 5) ex.push([Math.round(x), Math.round(y), best && best.id, hv]); } }
      // zone widths in the overview (landscape): knob rows >= 36 px, key pairs >= 28 px
      const zw = id => { const e = p.elements.find(x => x.id === id); return e && e.zone ? Math.round(e.zone.w) : 0; };
      const minZone = Math.min(...act.filter(e => e.zone).map(e => Math.min(e.zone.w, e.zone.h)));
      return {n, bad, free, ex, k: Math.min(...[1, 2, 3, 8, 9, 15].map(k => zw('k' + k))), pair: Math.min(zw('oct.d'), zw('oct.u'), zw('bank.d'), zw('bank.u'), zw('arp.on'), zw('arp.latch'), zw('cur.l'), zw('cur.r')), minZone: Math.round(minZone)};
    });
    res['treffer ' + JSON.stringify(v)] = t; ok('MK-P-07', t.bad <= t.n * .002, f + ' Treffer ' + JSON.stringify(v) + ' ' + JSON.stringify(t));
    if (f === 'X' && v.ansicht === 'ganz') { ok('MK-P-07', t.k >= 36 && t.pair >= 28, 'Zonen 926x428 ' + JSON.stringify(t)); }
  }
  R[f] = res; ok('konsole', !page.errs.length, f + ' ' + page.errs.join(' | '));
  await page.ctx.close();
}
console.log(JSON.stringify(R, null, 1)); console.log('FEHLER', fail.length, JSON.stringify(fail, null, 1));
await b.close();
