// WEGE-Test: Doppel aufräumen (Inventar D1, D2, D6, D7, D8, D9, D11–D14, Abschnitt 4/5) – per Finger (Touch), hochkant + quer
// Aufruf: node wege-test.mjs <index.html> <ausgabeordner>   (absolute Pfade; Basis zum Vergleich: <index.html>/../../basis.html)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
const file = path.resolve(process.argv[2]), out = path.resolve(process.argv[3] || '.');
const basis = path.join(path.dirname(file), '..', 'basis.html');
let bad = 0, good = 0;
const ok = (c, m, d) => { if (c) { good++; console.log('OK ' + m + (d ? ' – ' + d : '')); } else { bad++; console.log('FEHLER ' + m + (d ? ' – ' + d : '')); } };
const b = await chromium.launch();
const errs = [];
async function page(w, h, f) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (f || file)); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 60000}); await p.waitForTimeout(1200);
  p._cdp = await p.context().newCDPSession(p);
  return p;
}
const SETUP = () => {
  const D = window.SYNQUENZER;
  D.setBpm(112);
  D.setClip(0, 0, {len: 2, notes: [[0, .75, 36, .9], [1.5, .5, 43, .8], [3, 1, 39, .8], [4, 1.5, 36, .9], [6, .5, 46, .7]].map(([t, d, n, v]) => ({t, d, n, v}))});
  D.setClip(4, 0, {len: 1, notes: [[0, 36, .95], [1, 38, .9], [2.5, 36, .85], [3, 38, .9], [0, 49, .9], [2, 46, .7]].map(([t, n, v]) => ({t, d: .1, n, v})).concat([0, .25, .5, .75, 1, 1.5, 2, 2.5, 3, 3.5].map(t => ({t, d: .1, n: 42, v: .6})))});
  D.setClip(2, 0, {len: 2, notes: [[0, 60], [0, 64], [0, 67], [4, 57], [4, 60], [4, 64]].map(([t, n]) => ({t, d: 3.5, n, v: .7}))});
  D.setClip(1, 0, {len: 2, notes: [[0, 72], [1, 74], [2, 76]].map(([t, n]) => ({t, d: .5, n, v: .7}))});
  D.setClip(3, 0, {len: 1, notes: [[0, 79], [2, 77]].map(([t, n]) => ({t, d: 1, n, v: .7}))});
  D.setClip(0, 1, {len: 1, notes: [[0, 1, 38, .9]].map(([t, d, n, v]) => ({t, d, n, v}))});
  D.setClip(4, 1, {len: 1, notes: [[0, 36, .95], [2, 38, .9]].map(([t, n, v]) => ({t, d: .1, n, v}))});
  D.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}, {scene: 0, bars: 4}]);
  D.songView(true);
  return S.song.marks.map(m => m.id);
};
// je Spur und Takt: wie viele Noten in [a, e) klingen (eigene Clips, Versionen, Szenen-Clips in ihrer Phase)
const NC = (a, e) => {
  const sg = S.song, o2 = [];
  for (let t = 0; t < NT(); t++) {
    const lane = sg.lanes[t]; if (!lane) continue;
    for (let x = a; x < e; x++) {
      const o = laneOriginAt(lane, x); if (!laneClipOk(sg, t, o)) { o2.push(0); continue; }
      const c = o.own ? sg.own[o.own] : S.tracks[t].clips[o.slot]; if (!c) { o2.push(0); continue; }
      const L = clipB(c), p0 = ((barBeat(x) - o.cs) % L + L) % L; let n = 0;
      for (const nt of c.notes) { if (nt.t >= L - 1e-9) continue; let d = nt.t - p0; if (d < -1e-9) d += L; if (d < 4 - 1e-9) n++; }
      o2.push(n);
    }
  }
  return o2;
};
const run = (p, fn, arg) => p.evaluate('(() => { const SETUP = ' + SETUP.toString() + ', NC = ' + NC.toString() + '; return (' + fn.toString() + ')(' + JSON.stringify(arg === undefined ? null : arg) + '); })()');
const sum = a => a.reduce((x, y) => x + y, 0);
// Finger: ein Element (per Funktion im Browser gefunden) antippen; liefert sein Rechteck (oder null)
async function tapAt(p, finder, arg) {
  const r = await p.evaluate('(() => { const e = (' + finder.toString() + ')(' + JSON.stringify(arg === undefined ? null : arg) + '); if (!e) return null; e.scrollIntoView({block: "nearest"}); const b = e.getBoundingClientRect(); return {x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width, h: b.height, vis: b.width > 0 && b.height > 0 && b.bottom > 0 && b.top < innerHeight}; })()');
  if (!r || !r.vis) return r;
  await p.touchscreen.tap(r.x, r.y); await p.waitForTimeout(260);
  return r;
}
const byText = (sel, txt) => [...document.querySelectorAll(sel)].find(x => x.offsetParent && x.textContent.replace(/\s+/g, ' ').trim().startsWith(txt));
async function touch(p, type, x, y) { await p._cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, radiusX: 4, radiusY: 4, force: 1, id: 1}]}); }
async function drag(p, x0, y0, x1, y1, n) { await touch(p, 'touchStart', x0, y0); for (let k = 1; k <= n; k++) { await touch(p, 'touchMove', x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n); await p.waitForTimeout(30); } await touch(p, 'touchEnd'); await p.waitForTimeout(250); }
async function hold(p, x, y, ms) { await touch(p, 'touchStart', x, y); await p.waitForTimeout(ms); await touch(p, 'touchEnd'); await p.waitForTimeout(250); }
const zone = () => { try { if (typeof hideToast === 'function') hideToast(); } catch (e) {} const r = SV.wrap.getBoundingClientRect(); let y = r.top + Math.round(SV.rulerH * .5); for (let d = 3; d < SV.rulerH - 1; d++) { const e = document.elementFromPoint(r.left + 14, r.top + d); if (e === SV.cv) { y = r.top + d; break; } } return {x: r.left + 14, y, cw: SV.cellW, pos: SV.pos}; };
const shot = (p, n) => p.screenshot({path: path.join(out, n)});
const xSees = () => [...document.querySelectorAll('.pop .ms-x, .pop .sh-x, .pop [aria-label="Schließen"]')].some(x => { const r = x.getBoundingClientRect(); return x.offsetParent && r.width >= 40 && r.height >= 30 && r.top >= 0 && r.bottom <= innerHeight && r.right <= innerWidth; });

try {
  /* ================= Basis: Leicht / Voll (zum Vergleich) und ein altes Projekt mit Leicht-Marke ================= */
  const pb = await page(428, 926, basis);
  await run(pb, () => SETUP());
  const zipB = await pb.evaluate(async () => (await window.SYNQUENZER.va1BoxB64()).length);
  const wavB = await pb.evaluate(async () => { const r = await window.SYNQUENZER.va1Export('song'); const d = new Uint8Array(await new Response(VA1.res.data).arrayBuffer()); const h = await crypto.subtle.digest('SHA-256', d); return {size: r && r.size, h: btoa(String.fromCharCode(...new Uint8Array(h))).slice(0, 16)}; });
  const BA = await run(pb, () => {
    const D = window.SYNQUENZER, m = S.song.marks[2], r = {orig: NC(m.a, m.a + m.len)};
    D.markFassungSet(m.id, 'leicht'); r.l = NC(m.a, m.a + m.len); r.file = serializeProject();
    D.markFassungSet(m.id, 'voll'); r.v = NC(m.a, m.a + m.len);
    r.midi = btoa(String.fromCharCode(...buildMidi({mode: 'scene', scene: 0, withCarrier: true}).bytes));
    r.va1 = btoa(String.fromCharCode(...va1MidiBuild(null).bytes)); r.id = m.id;
    return r;
  });
  await pb.close();

  /* ================= hochkant 428 × 926 ================= */
  let p = await page(428, 926);
  const ids = await run(p, () => SETUP());
  const W0 = await run(p, () => { const m = S.song.marks[2]; return {orig: NC(m.a, m.a + m.len)}; });
  ok(JSON.stringify(W0.orig) === JSON.stringify(BA.orig), 'gleicher Ausgangs-Song wie die Basis', sum(W0.orig) + ' Noten in Teil 3');

  // ---- Abschnitt 4: Marken-Blatt in Reitern (Finger) ----
  await run(p, id => window.SYNQUENZER.openMarkSheet(id), ids[0]); await p.waitForTimeout(400);
  const tabs = [];
  for (const [t, l] of [['t', 'Teil'], ['k', 'Klang & Groove'], ['v', 'Video'], ['a', 'Ablauf']]) {
    const r = await tapAt(p, l => [...document.querySelectorAll('.pop.msheet .wg-tabs .rb')].find(x => x.textContent.trim() === l), l);
    const i = await p.evaluate(() => window.SYNQUENZER.wege.msInfo());
    tabs.push({t, ok: !!r && r.h >= 44 && i.tab === t, h: i.h, n: i.vis.length, x: await p.evaluate(xSees)});
  }
  ok(tabs.every(x => x.ok), 'Marken-Blatt: Reiter Ablauf │ Teil │ Klang & Groove │ Video per Finger, ≥ 44 px', tabs.map(x => x.t + ':' + x.n + ' Knöpfe').join(' '));
  const hs = tabs.map(x => x.h);
  ok(Math.max(...hs) - Math.min(...hs) <= 2 && Math.max(...hs) < 300, 'Marken-Blatt: gleiche Höhe in allen Reitern (nichts springt), viel niedriger als vorher', hs.join('/') + ' px (vorher 545 px)');
  ok(tabs.every(x => x.x), '✕ hochkant sichtbar (alle Reiter)');

  // ---- D2: Small │ Full (Finger) = Leicht / Voll (Notenzahl gleich) ----
  await run(p, id => { closePop(); window.SYNQUENZER.openMarkSheet(id); }, ids[2]); await p.waitForTimeout(300);
  await tapAt(p, () => [...document.querySelectorAll('.pop.msheet .wg-tabs .rb')].find(x => x.textContent.trim() === 'Klang & Groove'));
  const rowTxt = await p.evaluate(() => { const r = document.querySelector('.pop.msheet .wg-sf'); return r ? [...r.querySelectorAll('button')].map(x => x.textContent.trim().replace(/\s+/g, ' ')) : []; });
  ok(rowTxt.length === 5 && rowTxt[0].startsWith('Small') && rowTxt[1].startsWith('Full') && rowTxt[2].includes('Fassung kopieren') && rowTxt[4] === 'Remix …', 'D2: eine Zeile „Small │ Full“ (+ Fassung kopieren/einfügen, Remix)', rowTxt.join(' | '));
  const noOld = await p.evaluate(() => !document.querySelector('.pop.msheet .gr1r') && ![...document.querySelectorAll('.pop.msheet button')].some(x => /^Leicht|^Voll|^Vorschlag$/.test(x.textContent.trim())));
  ok(noOld, 'D2: keine eigenen Zeilen „Fassung Leicht/Voll“ und „Rhythmus“ mehr');
  await tapAt(p, () => document.querySelector('.pop.msheet .wg-sf [data-f="s"]'));
  const S1 = await run(p, () => { const m = S.song.marks[2]; return {n: NC(m.a, m.a + m.len), vr: m.vr ? m.vr.c : null, info: window.SYNQUENZER.wege.sfInfo(m.id), undo: window.SYNQUENZER.undoInfo().top}; });
  ok(JSON.stringify(S1.n) === JSON.stringify(BA.l), 'D2: Small (Finger) klingt wie vorher Leicht – Notenzahl gleich', sum(S1.n) + ' = ' + sum(BA.l) + ' Noten (Voll ' + sum(BA.orig) + ')');
  ok(S1.vr === 'l' && S1.info.small && S1.undo && /Small/.test(S1.undo.label), 'D2: ein ↶-Schritt, Marke merkt Small (mark.vr wie bisher)', S1.undo && S1.undo.label);
  await tapAt(p, () => document.querySelector('.pop.msheet .wg-sf [data-f="f"]'));
  const F1 = await run(p, () => { const m = S.song.marks[2]; return {n: NC(m.a, m.a + m.len), small: window.SYNQUENZER.wege.sfInfo(m.id).small}; });
  ok(JSON.stringify(F1.n) === JSON.stringify(BA.v) && JSON.stringify(F1.n) === JSON.stringify(BA.orig) && !F1.small, 'D2: Full (Finger) klingt wie vorher Voll', sum(F1.n) + ' Noten');
  // mit markierten Drum-Versionen: Small spielt die Small-Version statt auszudünnen, Full die Full-Version
  const V1 = await run(p, () => {
    const D = window.SYNQUENZER, m = S.song.marks[0]; D.grVorschlag(m.id);
    const L = sx9List(S.song, 4, 0), sm = L.find(q => S.song.own[q.id].sf === 's');
    const r1 = window.SYNQUENZER.wege.sfSet(m.id, 's'), at1 = sx9At(S.song, 4, 1);
    const thin = (S.song.marks[0].vr && S.song.marks[0].vr.dn || []).length;
    const r2 = window.SYNQUENZER.wege.sfSet(m.id, 'f'), at2 = sx9At(S.song, 4, 1);
    return {sm: sm ? sm.id : null, r1, at1, thin, r2, at2, full: S.tracks[4].clips[0].sf};
  });
  ok(V1.sm && V1.at1 && V1.at1.id === V1.sm && V1.thin === 0, 'D2: Small nimmt den als Small markierten Drum-Clip (kein Ausdünnen)', 'v' + (V1.at1 && V1.at1.v));
  ok(V1.at2 && V1.at2.id === null && V1.full === 'f', 'D2: Full nimmt den als Full markierten Drum-Clip', 'v' + (V1.at2 && V1.at2.v));

  // ---- D1: ein „Zusammenfassen …“ (Finger), intern konDo mit Zurückholen ----
  await run(p, id => { closePop(); window.SYNQUENZER.openMarkSheet(id); }, ids[1]); await p.waitForTimeout(300);
  await tapAt(p, () => [...document.querySelectorAll('.pop.msheet .wg-tabs .rb')].find(x => x.textContent.trim() === 'Teil'));
  const zf = await tapAt(p, () => document.querySelector('.pop.msheet .s2-sb'));
  const zh = await p.evaluate(() => (UI.pop && UI.pop.name === 's2sum' ? UI.pop.el.querySelector('h4').textContent : null));
  ok(zf && zf.h >= 44 && zh && /^Zusammenfassen · Takt 5–8/.test(zh), 'D1: Marken-Blatt › Teil › „Zusammenfassen …“ öffnet sofort die Namens-Chips', zh);
  await tapAt(p, () => [...document.querySelectorAll('.pop.s2sum .cp-c')].find(x => x.textContent.trim() === 'Refrain'));
  const K1 = await run(p, () => { const m = S.song.marks.find(x => x.a === 4); const u = window.SYNQUENZER.undoInfo(); return {part: m && S.parts[+m.part.slice(1) - 1] ? S.parts[+m.part.slice(1) - 1].name : null, kon: !!(m && konOf(m.id)), undo: u.top && u.top.label, id: m && m.id}; });
  ok(K1.part && /^Refrain/.test(K1.part) && K1.kon && /^Konsolidiert/.test(K1.undo || ''), 'D1: neuer Teil „' + K1.part + '“, Ursprung bleibt ([Zurückholen] geht), ein ↶', K1.undo);
  await run(p, id => window.SYNQUENZER.openMarkSheet(id), K1.id); await p.waitForTimeout(250);
  await tapAt(p, () => [...document.querySelectorAll('.pop.msheet .wg-tabs .rb')].find(x => x.textContent.trim() === 'Teil'));
  const kr = await p.evaluate(() => [...document.querySelectorAll('.pop.msheet .kon-r button')].filter(x => x.offsetParent).map(x => x.textContent.trim()));
  ok(kr.includes('Block …') && kr.includes('Zurückholen …') && !kr.some(x => /Zu Teil/.test(x)), 'D1: Reiter Teil: [Block …] [Zurückholen …] (kein zweites „Zu Teil …“)', kr.join(' · '));
  await tapAt(p, () => [...document.querySelectorAll('.pop.msheet .kon-r button')].find(x => x.textContent.trim() === 'Block …'));
  const kx = await p.evaluate(() => window.SYNQUENZER.konuxInfo());
  ok(kx.open && kx.cards.map(c => c.k).join(',') === 'blk,back', 'D1: „Block …“-Blatt nur noch für Block und Zurückholen', kx.cards.map(c => c.t).join(' │ '));
  await run(p, () => { closePop(); undo(); });
  // Bereich-Leiste: ❖ = dasselbe Zusammenfassen
  await run(p, () => { closePop(); window.SYNQUENZER.songSelect(8, 9); });
  await p.waitForTimeout(400);
  const rb = await tapAt(p, () => document.querySelector('#rangeBar [data-a="part"]'));
  const rh = await p.evaluate(() => (UI.pop && UI.pop.name === 's2sum' ? UI.pop.el.querySelector('h4').textContent : null));
  const rbl = await p.evaluate(() => { const b = document.querySelector('#rangeBar [data-a="part"]'); return b.getAttribute('aria-label') + ' / ' + b.textContent.trim(); });
  ok(rb && rb.h >= 44 && /^Zusammenfassen · Takt 9–10/.test(rh || ''), 'D1: Bereich-Leiste ❖ öffnet dasselbe „Zusammenfassen“', rbl);
  await tapAt(p, () => [...document.querySelectorAll('.pop.s2sum .cp-c')].find(x => x.textContent.trim() === 'Bridge'));
  const K2 = await run(p, () => { const m = S.song.marks.find(x => x.a === 8); return {kon: !!(m && konOf(m.id)), name: m ? markLabel(m) : null}; });
  ok(K2.kon, 'D1: Bereich → Teil „' + K2.name + '“ mit Ursprung (konDo)');
  const asP = await run(p, () => { const r = window.SYNQUENZER.songRange('asPart', 10, 11, {name: 'Intro'}); const m = r && S.song.marks.find(x => x.a === 10); return {r: !!r, kon: !!(m && konOf(m.id))}; });
  ok(asP.r && asP.kon, 'Abschnitt 5: „Als Teil“ (songRange asPart) nimmt alles mit wie Zusammenfassen (konDo)');
  await run(p, () => { undo(); undo(); window.SYNQUENZER.songSelect(8, 9); });
  await p.waitForTimeout(300);
  await tapAt(p, () => document.querySelector('#rangeBar [data-a="more"]'));
  const more = await p.evaluate(() => [...document.querySelectorAll('.pop .plist button, .pop .wg-rv')].filter(x => x.offsetParent).map(x => x.textContent.trim().replace(/\s+/g, ' ')));
  ok(!more.some(x => /^Zusammenfassen$|Zu Teil|konsolidieren/.test(x)) && more.includes('Block …') && more.some(x => x.startsWith('Im Video ▸')), 'D1/D6: Bereich ⋯ ohne Doppel, mit [Block …] und [Im Video ▸]', more.join(' · '));
  // ---- D6: Im Video ▸ öffnet die Video-Spur genau dort ----
  await tapAt(p, () => document.querySelector('.pop .wg-rv'));
  await p.waitForTimeout(400);
  const V6 = await p.evaluate(() => ({cut: window.SYNQUENZER.vd3.cut(), pop: UI.pop && UI.pop.name, h: UI.pop && UI.pop.el.querySelector('.vd3h b') ? UI.pop.el.querySelector('.vd3h b').textContent : null, opts: [...document.querySelectorAll('.vd3pop .vd3g [data-v]')].map(x => x.textContent.trim())}));
  ok(V6.cut && V6.pop === 'vd3cut' && V6.h === 'Video · Takt 9–10', 'D6: Bereich ⋯ › Im Video ▸ = Video-Spur an, Menü für genau diesen Bereich', V6.h);
  ok(V6.opts.join(',') === 'Auto,App,Song,Matrix,Klavier,Mäusekino,Gerät …,Noten …,Tastatur,Text', 'D6: eine Wortliste (Auto · App · Song · Matrix · Klavier · Mäusekino · Gerät · Noten · Tastatur · Text)', V6.opts.join(' · '));
  const wl = await p.evaluate(() => window.SYNQUENZER.wege.words().clip.join(','));
  ok(wl === 'auto,klav,kino,geraet,noten,aus', 'D6: Clip-Blatt „Im Video“ in derselben Reihenfolge (… · aus)', wl);
  await run(p, () => { closePop(); window.SYNQUENZER.vd3.cut(false); window.SYNQUENZER.openMarkSheet(S.song.marks[0].id); });
  await p.waitForTimeout(300);
  await tapAt(p, () => [...document.querySelectorAll('.pop.msheet .wg-tabs .rb')].find(x => x.textContent.trim() === 'Video'));
  const iv = await tapAt(p, () => document.querySelector('.pop.msheet .wg-vb'));
  await p.waitForTimeout(400);
  const V7 = await p.evaluate(() => ({cut: window.SYNQUENZER.vd3.cut(), pop: UI.pop && UI.pop.name, h: UI.pop && UI.pop.el.querySelector('.vd3h b') ? UI.pop.el.querySelector('.vd3h b').textContent : null}));
  ok(iv && iv.h >= 44 && V7.cut && V7.pop === 'vd3cut' && V7.h === 'Video · Takt 1–4', 'D6: Marken-Blatt › Video › Im Video ▸ öffnet die Video-Spur am Teil', V7.h);
  await tapAt(p, () => [...document.querySelectorAll('.vd3pop [data-v]')].find(x => x.textContent.trim() === 'Klavier'));
  const vid = await run(p, () => (S.song.video || []).map(q => q.a + '-' + q.b + ':' + q.v).join(','));
  ok(/0-4:klav/.test(vid), 'D6: Klavier für Takt 1–4 gesetzt (ein ↶)', vid);
  // Regie-Streifen antippen (Video-Spur aus) → Video-Spur an
  await run(p, () => { closePop(); window.SYNQUENZER.vd3.cut(false); svLayout(); svDraw(true); });
  await p.waitForTimeout(250);
  const st = await p.evaluate(() => { const r = SV.wrap.getBoundingClientRect(); return {x: r.left + SV.cellW * 6 - SV.x, y: r.top + SV.rulerH - SV.vvS / 2, vvS: SV.vvS}; });
  await p.touchscreen.tap(st.x, st.y); await p.waitForTimeout(300);
  ok(st.vvS > 0 && await p.evaluate(() => window.SYNQUENZER.vd3.cut()), 'Abschnitt 4: Tipp auf den Regie-Streifen schaltet die Video-Spur ein', 'Streifen ' + st.vvS + ' px');
  await run(p, () => { window.SYNQUENZER.vd3.cut(false); svLayout(); });
  // SCHLEIFE ▾ ohne Mithören- und Video-Zeile
  await tapAt(p, () => SV.btn.bLoop);
  const lp = await p.evaluate(() => (UI.pop && UI.pop.name === 'loop' ? UI.pop.el.textContent : ''));
  ok(lp && !/Mithören|Video-Schnitt/.test(lp), 'D11/Abschnitt 4: SCHLEIFE ▾ nur noch Schleife (kein Mithören-, kein Video-Schalter)');
  await run(p, () => closePop());

  // ---- D11: ▼-Marke ziehen = mithören (Finger) ----
  await run(p, () => { SV.x = 0; window.SYNQUENZER.songPos(0); window.SYNQUENZER.songSelect(null); SV.sel = null; svDraw(true); });
  await p.waitForTimeout(200);
  await p.waitForTimeout(400); const g = await p.evaluate(zone);
  await drag(p, g.x, g.y, g.x + g.cw * 3.2, g.y + 2, 12);
  const SC = await p.evaluate(() => ({pos: SV.pos, last: window.SYNQUENZER.wege.lastScrub(), sx7: SX7.n}));
  ok(SC.pos === Math.round((14 + g.cw * 3.2) / g.cw) && SC.last && SC.last.n >= 3, 'D11: ▼-Marke ziehen (Finger): Marke auf Takt ' + (SC.pos + 1) + ', ' + (SC.last ? SC.last.n : 0) + ' Schläge angeklungen – ohne Schalter', 'Lautsprecher-Knopf weg');

  // ---- D9: ⇥ FILLS, Clip-Versionen im Clip-Blatt ----
  const ue = await p.evaluate(() => ({t: SV.btn.bUe.textContent, fab: document.querySelector('.sv-uefab').textContent, dia: [...document.querySelectorAll('.sv-top button')].filter(x => x.offsetParent).some(x => x.textContent.includes('◆'))}));
  ok(/⇥/.test(ue.t) && /FILLS/.test(ue.t) && ue.fab === '⇥' && !ue.dia, 'D9: ◆ nur noch für Klang – Song-Leiste „⇥ FILLS“', ue.t);
  await run(p, () => { songEdit('Neue Version', sg => { sx9New(sg, 0, 0); }); window.SYNQUENZER.songView(false); openClipSheet(0, 0); });
  await p.waitForTimeout(300);
  const cv = await p.evaluate(() => [...document.querySelectorAll('#clipSheet .wg-cv button')].map(x => x.textContent.trim() + (x.classList.contains('on') ? '*' : '')));
  ok(cv.join(',') === 'v1,v2', 'D9: Clip-Blatt (Matrix) zeigt die Versionen im Song', cv.join(' · '));
  const cvT = await tapAt(p, () => [...document.querySelectorAll('#clipSheet .wg-cv button')].find(x => x.textContent.trim() === 'v2'));
  const v2 = await run(p, () => { let all = true; for (let x = 0; x < S.song.bars; x++) { const h = sx9At(S.song, 0, x); if (h && h.s === 0 && h.v !== 2) all = false; } return all; });
  ok(cvT && cvT.h >= 44 && v2, 'D9: Tipp auf v2 (Finger) = überall im Song v2 (ein ↶)');
  const csl = await p.evaluate(() => [...document.querySelectorAll('#clipSheet button')].map(x => x.textContent.trim()));
  ok(csl.includes('Clip kopieren') && csl.includes('Clip einfügen'), 'D13: Clip-Blatt „Clip kopieren“ / „Clip einfügen“');
  await shot(p, 'wege-clipblatt-hochkant.png');
  await run(p, () => closeClipSheet());

  // ---- D11/D12/D13: ROLLE, Magic, Harmonie ----
  await run(p, () => window.SYNQUENZER.openRoll(1, 0)); await p.waitForTimeout(500);
  const ro = await p.evaluate(() => [...EL.rollSheet.querySelectorAll('button')].map(x => x.textContent.trim()));
  ok(ro.includes('Mitspielen …') && ro.includes('Nur Leitertöne') && ro.includes('Noten kopieren') && ro.includes('Noten einfügen') && !ro.includes('Mithören') && !ro.includes('Tonart'), 'D11–D13: ROLLE „Mitspielen …“, „Nur Leitertöne“, „Noten kopieren“');
  ok(ro.includes('Stimmführung') && !ro.includes('Glatt'), 'D12: Magic „Stimmführung“ statt „Glatt“');
  await run(p, () => { window.SYNQUENZER.closeRoll(); hm1Open(1, 0, 'lauf'); }); await p.waitForTimeout(400);
  const hm = await p.evaluate(() => ({tabs: [...document.querySelectorAll('.hm1-tabs button')].map(x => x.textContent.trim()), takte: [...document.querySelectorAll('.pop button')].some(x => /^Takte [−+]$/.test(x.textContent.trim()))}));
  ok(hm.tabs.join(',') === 'Auf eine Stufe,Lauf,Gegenstimme,Akkord-Ideen' && !hm.takte, 'D12/D13: Harmonie „Auf eine Stufe · Lauf · Gegenstimme · Akkord-Ideen“, Lauf ohne [Takte −/+]', hm.tabs.join(' · '));
  await run(p, () => closePop());
  const src = await p.evaluate(() => ({g5: G5_LABEL, tk: typeof tkSheetPaint === 'function' && tkSheetPaint.toString(), md: typeof mdeMore === 'function' ? mdeMore.toString() : document.documentElement.innerHTML.includes("['copy', 'Klang kopieren']")}));
  ok(src.g5 === 'Noten-Clip aus Gesang', 'D14: „Noten-Clip aus Gesang“ (Takes-Blatt, Undo-Name)');

  // ---- Abschnitt 4: Tempo-Blatt = Song-Blatt ----
  await run(p, () => window.SYNQUENZER.songView(true));
  await tapAt(p, () => EL.bBpm);
  const bp = await p.evaluate(() => (UI.pop && UI.pop.name === 'bpm' ? [...UI.pop.el.querySelectorAll('button')].map(x => x.textContent.trim()) : []));
  ok(bp.includes('Song transponieren …') && bp.includes('4'), 'Abschnitt 4: Tempo-Blatt mit „Song transponieren …“ und „Ausblenden am Ende“');
  await tapAt(p, () => [...document.querySelectorAll('.pop .wg-bpm .sx1-r button')].find(x => x.textContent.trim() === '4'));
  ok(await run(p, () => !!(S.song.fade && S.song.fade.out === 16)), 'Abschnitt 4: Ausblenden 4 Takte im Tempo-Blatt (Finger)');
  await tapAt(p, () => UI.pop && UI.pop.el.querySelector('[data-wgb="xp"]'));
  ok(await p.evaluate(() => !!(UI.pop && UI.pop.name === 'gr1xp')), 'Abschnitt 4: „Song transponieren …“ öffnet das Transponieren-Blatt');
  await run(p, () => closePop());

  // ---- D7: Menü ohne Doppel, ein Blatt Export ----
  await tapAt(p, () => document.querySelector('#bMenu') || [...document.querySelectorAll('#top button')].find(x => x.textContent.trim() === '≡'));
  const mn = await p.evaluate(() => ({h3: [...EL.menu.querySelectorAll('.msec h3')].map(x => x.textContent.trim()), b: [...EL.menu.querySelectorAll('button')].map(x => x.textContent.trim()), l: [...EL.menu.querySelectorAll('.lbl')].map(x => x.textContent.trim())}));
  ok(!mn.h3.includes('MIDI-Export') && !mn.h3.includes('Sounds') && !mn.b.includes('Song als Audio') && !mn.b.includes('Datei öffnen') && mn.b.includes('Öffnen …'), 'D7: Menü ohne MIDI-Export, Sounds, Song als Audio; „Öffnen …“');
  ok(mn.b.includes('Automatische Sicherungen ▾') && mn.l.includes('Aufzeichnung (für Making-of)') && !mn.l.includes('Verlauf') && !mn.b.includes('Remix …'), 'D8/Abschnitt 4: „Automatische Sicherungen ▾“, „Aufzeichnung (für Making-of)“, Remix nur noch in der Song-Leiste');
  await tapAt(p, () => [...EL.menu.querySelectorAll('button')].find(x => x.textContent.trim() === 'Export'));
  await p.waitForTimeout(300);
  const ex = await p.evaluate(() => ({b: [...document.querySelectorAll('.pop.va1 button')].map(x => x.textContent.trim().replace(/\s+/g, ' ')), h: [...document.querySelectorAll('.pop.va1 h5')].map(x => x.textContent.trim())}));
  const need = ['Ganzer SongWAV', 'Echtzeit-Mitschnitt', 'Szene 1', 'Alle Szenen', 'Mitschnitt', 'mit Träger', 'Original', 'Video 9:16', 'Sichern mit allen Audios', 'Öffnen …', 'Eigene Sounds exportieren', 'Sounds importieren', 'DX7-Bank importieren', 'DX7-Bank exportieren'];
  const miss = need.filter(n => !ex.b.some(x => x.replace(/ /g, '').startsWith(n.replace(/ /g, ''))));
  ok(!miss.length && ex.h.join(',') === 'Audio · WAV,MIDI,Video,Projekt,Sounds', 'D7: ein Blatt Export – Audio · MIDI · Video · Projekt · Sounds', miss.length ? 'fehlt: ' + miss.join(', ') : ex.h.join(' · '));
  await shot(p, 'wege-export-hochkant.png');
  await p.evaluate(() => { window.__mx = []; const f = window.exportMidi; window.exportMidi = o => { window.__mx.push(o); return null; }; window.__mxf = f; window.__fi = 0; EL.fileIn.click = () => { window.__fi++; }; });
  await tapAt(p, () => [...document.querySelectorAll('.pop.va1 button')].find(x => x.textContent.trim() === 'Original'));
  await tapAt(p, () => [...document.querySelectorAll('.pop.va1 button')].find(x => x.textContent.trim().startsWith('Szene 1')));
  await tapAt(p, () => [...document.querySelectorAll('.pop.va1 button')].find(x => x.textContent.trim().startsWith('Mitschnitt')));
  const mx = await p.evaluate(() => window.__mx.map(o => o.mode + ':' + o.withCarrier).join(','));
  ok(mx === 'scene:false,log:false', 'D7: MIDI Szene / Mitschnitt aus dem Export-Blatt (Finger), Schalter „Original“ wirkt', mx);
  await tapAt(p, () => [...document.querySelectorAll('.pop.va1 button')].find(x => x.textContent.trim().startsWith('Öffnen')));
  const fi = await p.evaluate(() => ({n: window.__fi, acc: EL.fileIn.accept}));
  ok(fi.n === 1 && /\.json/.test(fi.acc) && /\.zip/.test(fi.acc), 'D7: „Öffnen …“ = eine Dateiwahl für .json und .zip', fi.acc);
  await p.evaluate(() => { window.exportMidi = window.__mxf; });
  const mw = await run(p, () => ({midi: btoa(String.fromCharCode(...buildMidi({mode: 'scene', scene: 0, withCarrier: true}).bytes)), va1: btoa(String.fromCharCode(...va1MidiBuild(null).bytes))}));
  const W2 = await run(p, () => { const m = S.song.marks[2]; return NC(m.a, m.a + m.len); });
  await run(p, () => closePop());

  // ---- D8: VERLAUF-Blatt mit Automatischen Sicherungen (↶ halten, Finger) ----
  const ub = await p.evaluate(() => { const r = EL.bUndo.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  await hold(p, ub.x, ub.y, 700);
  const vl = await p.evaluate(() => ({pop: UI.pop && UI.pop.name, ah: !!document.querySelector('.pop.sx14 .wg-ah'), t: (document.querySelector('.pop.sx14 .wg-ah .sx14-s') || {}).textContent}));
  ok(vl.pop === 'sx14' && vl.ah, 'D8: ↶ halten (Finger) → VERLAUF mit „Automatische Sicherungen“', vl.t);
  await run(p, () => closePop());
  await p.close();

  /* ================= Exporte gleich wie vorher (WAV, MIDI, ZIP) ================= */
  let q = await page(428, 926);
  await run(q, () => { SETUP(); });
  const zipW = await q.evaluate(async () => (await window.SYNQUENZER.va1BoxB64()).length);
  const wavW = await q.evaluate(async () => { const r = await window.SYNQUENZER.va1Export('song'); const d = new Uint8Array(await new Response(VA1.res.data).arrayBuffer()); const h = await crypto.subtle.digest('SHA-256', d); return {size: r && r.size, h: btoa(String.fromCharCode(...new Uint8Array(h))).slice(0, 16)}; });
  ok(wavW.size === wavB.size && wavW.size > 1000, 'D7: WAV Ganzer Song wie vorher', wavW.size + ' / ' + wavB.size + ' Bytes' + (wavW.h === wavB.h ? ', bitgleich' : ''));
  ok(mw.midi === BA.midi && mw.va1 === BA.va1, 'D7: MIDI (Szene, Ganzer Song) bytegleich wie vorher');
  ok(Math.abs(zipW - zipB) <= 64 && zipW > 1000, 'D7: Container (ZIP) wie vorher', zipW + ' / ' + zipB + ' Zeichen');
  // altes Projekt (Leicht-Marke aus der Basis) lädt und klingt gleich; das Marken-Blatt zeigt Small
  const OLD = await run(q, f => { importJSON(f); const m = S.song.marks[2]; return {n: NC(m.a, m.a + m.len), small: window.SYNQUENZER.wege.sfInfo(m.id).small, vr: m.vr && m.vr.c}; }, BA.file);
  ok(JSON.stringify(OLD.n) === JSON.stringify(BA.l) && OLD.small && OLD.vr === 'l', 'Alte Projekte: Leicht-Marke (mark.vr/mark.off) lädt, klingt gleich und steht als Small', sum(OLD.n) + ' Noten');
  // D8 (a): Making-of aus der Aufzeichnung (HIST), kein zweites Protokoll
  const MO = await q.evaluate(async () => {
    const D = window.SYNQUENZER, keys = Object.keys(PD).filter(k => !PD[k].vals && isNum(PD[k].min) && isNum(PD[k].max) && typeof sndGet(S.tracks[0].sound, k) === 'number');
    const k = keys.includes('cut') ? 'cut' : keys[0], b0 = soundSnapshot(0), v0 = sndGet(S.tracks[0].sound, k);
    histCurveStart(); for (const f of [.2, .4, .6]) { setP(0, k, PD[k].min + (PD[k].max - PD[k].min) * f); histCurve(sndGet(S.tracks[0].sound, k)); }
    commitSound(0, b0, 'Regler ' + k);
    D.setClip(1, 3, {len: 1, notes: [{t: 0, d: 1, n: 60, v: .8}, {t: 1, d: 1, n: 62, v: .8}]});
    await new Promise(r => setTimeout(r, 400));
    const L = await D.wege.moBuild(), pl = D.vd3.plan();
    return {on: HIST.on, avail: HIST.avail, k, n: L ? L.length : -1, kinds: L ? [...new Set(L.map(e => e.k))] : [], own: D.vd3.info().n, steps: pl ? pl.steps : 0, ms: D.wege.moMs()};
  });
  ok(MO.n > 0 && MO.kinds.includes('regler') && MO.kinds.includes('clip') && MO.steps > 0, 'D8: Making-of liest die Aufzeichnung (HIST): ' + MO.n + ' Schritte (' + MO.kinds.join(', ') + '), Vorlauf ' + MO.steps + ' Szenen', Math.round(MO.ms) + ' ms');
  ok(MO.own === 0, 'D8: kein zweites Protokoll (VD3 schreibt nichts mehr mit)');
  await q.close();

  /* ================= quer 926 × 428 ================= */
  p = await page(926, 428);
  const idsL = await run(p, () => SETUP());
  await run(p, id => window.SYNQUENZER.openMarkSheet(id), idsL[2]); await p.waitForTimeout(400);
  const tl = [];
  for (const l of ['Teil', 'Klang & Groove', 'Video', 'Ablauf']) {
    const r = await tapAt(p, l => [...document.querySelectorAll('.pop.msheet .wg-tabs .rb')].find(x => x.textContent.trim() === l), l);
    const i = await p.evaluate(() => window.SYNQUENZER.wege.msInfo());
    tl.push({l, ok: !!r && r.h >= 44, h: i.h, top: i.top, x: await p.evaluate(xSees)});
  }
  ok(tl.every(x => x.ok && x.x), 'quer: Marken-Blatt-Reiter per Finger, ≥ 44 px, ✕ sichtbar', tl.map(x => x.h).join('/') + ' px hoch (vorher 357 px)');
  ok(Math.max(...tl.map(x => x.h)) - Math.min(...tl.map(x => x.h)) <= 2 && tl[0].top > 200, 'quer: gleiche Höhe, der Song bleibt darüber sichtbar', 'Blatt ab y ' + tl[0].top);
  await tapAt(p, () => [...document.querySelectorAll('.pop.msheet .wg-tabs .rb')].find(x => x.textContent.trim() === 'Klang & Groove'));
  await tapAt(p, () => document.querySelector('.pop.msheet .wg-sf [data-f="s"]'));
  const SL = await run(p, () => { const m = S.song.marks[2]; return NC(m.a, m.a + m.len); });
  ok(JSON.stringify(SL) === JSON.stringify(BA.l), 'quer: Small (Finger) = Leicht', sum(SL) + ' Noten');
  await tapAt(p, () => [...document.querySelectorAll('.pop.msheet .wg-tabs .rb')].find(x => x.textContent.trim() === 'Teil'));
  await shot(p, 'wege-marke-teil-quer.png');
  await tapAt(p, () => [...document.querySelectorAll('.pop.msheet .wg-tabs .rb')].find(x => x.textContent.trim() === 'Video'));
  await tapAt(p, () => document.querySelector('.pop.msheet .wg-vb'));
  await p.waitForTimeout(400);
  const VL = await p.evaluate(() => ({cut: window.SYNQUENZER.vd3.cut(), pop: UI.pop && UI.pop.name}));
  ok(VL.cut && VL.pop === 'vd3cut', 'quer: Marken-Blatt › Video › Im Video ▸ (Finger)');
  await run(p, () => { closePop(); window.SYNQUENZER.vd3.cut(false); svLayout(); });
  const scr = await p.evaluate(() => [...document.querySelectorAll('.sv-scr')].filter(x => x.offsetParent).length);
  ok(scr === 0, 'quer: kein Lautsprecher-Schalter mehr in der Song-Leiste (Mithören = ▼ ziehen)');
  await run(p, () => { SV.x = 0; window.SYNQUENZER.songPos(0); SV.sel = null; svDraw(true); });
  await p.waitForTimeout(400); const gL = await p.evaluate(zone);
  await drag(p, gL.x, gL.y, gL.x + gL.cw * 5.2, gL.y + 2, 14);
  const SCL = await p.evaluate(() => ({pos: SV.pos, last: window.SYNQUENZER.wege.lastScrub()}));
  ok(SCL.pos === Math.round((14 + gL.cw * 5.2) / gL.cw) && SCL.last && SCL.last.n >= 4, 'quer: ▼-Marke ziehen (Finger) = mithören', 'Takt ' + (SCL.pos + 1) + ', ' + (SCL.last ? SCL.last.n : 0) + ' Schläge');
  // Bereich-Leiste quer: ❖ Zusammenfassen …
  await run(p, () => window.SYNQUENZER.songSelect(4, 5)); await p.waitForTimeout(400);
  const rq = await p.evaluate(() => { const b = document.querySelector('#rangeBar [data-a="part"]'); const r = b.getBoundingClientRect(); return {t: b.textContent.trim(), a: b.getAttribute('aria-label'), h: r.height}; });
  ok(/Zusammenfassen …/.test(rq.a) && rq.h >= 44, 'quer: Bereich-Leiste ❖ = „Zusammenfassen …“ (schmal: „Teil …“)', rq.t);
  await tapAt(p, () => document.querySelector('#rangeBar [data-a="part"]'));
  ok(await p.evaluate(() => !!(UI.pop && UI.pop.name === 's2sum')) && await p.evaluate(xSees), 'quer: Zusammenfassen-Blatt mit ✕');
  await run(p, () => closePop());
  // Export quer
  await run(p, () => va1Sheet()); await p.waitForTimeout(300);
  ok(await p.evaluate(xSees), 'quer: Export-Blatt mit ✕');
  await run(p, () => closePop());
  const uq = await p.evaluate(() => { const u = [...document.querySelectorAll('button[aria-label="Rückgängig"], #bUndo')].find(x => x.offsetParent && x.getBoundingClientRect().width > 0 && document.elementFromPoint(x.getBoundingClientRect().left + 8, x.getBoundingClientRect().top + 8) === x); const r = (u || EL.bUndo).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, u ? u.id || u.className : 'bUndo'] });
  await p.waitForTimeout(500); await hold(p, uq[0], uq[1], 750);
  await p.waitForTimeout(300);
  const vq = await p.evaluate(() => ({ah: !!document.querySelector('.pop.sx14 .wg-ah'), pop: UI.pop && UI.pop.name}));
  ok(vq.ah, 'quer: ↶ halten → VERLAUF mit „Automatische Sicherungen“', 'Blatt ' + vq.pop + ' · Taste ' + uq[2]);
  await shot(p, 'wege-verlauf-quer.png');
  await run(p, () => closePop());
  await p.close();

  /* ================= Guide: jeder Eintrag springt hin (mit Song, hochkant) ================= */
  p = await page(428, 926);
  await run(p, () => SETUP());
  const entries = await p.evaluate(() => window.SYNQUENZER.ui1.entries().map(e => e.id));
  const gb = [];
  for (const id of entries) {
    await p.evaluate(id => window.SYNQUENZER.ui1.jump(id), id);
    await p.waitForTimeout(820);
    const r = await p.evaluate(() => ({j: window.SYNQUENZER.ui1.lastJump(), ring: !!window.SYNQUENZER.ui1.ring()}));
    if (!r.j.ok || !r.j.target || !r.ring) gb.push(id);
  }
  ok(!gb.length, 'Guide: ' + (entries.length - gb.length) + '/' + entries.length + ' Einträge springen hin (mit Song)', gb.length ? 'nicht: ' + gb.join(', ') : 'neu: scrub, block, vteil, open, boxsave, midiex, rt, sounds, autosave, verlauf, aufz, vers, trsheet, gfx, fade');
  // Marken-Blatt für das Foto (Klang & Groove)
  await run(p, () => { ui1Home(); window.SYNQUENZER.openMarkSheet(S.song.marks[2].id); });
  await p.waitForTimeout(300);
  await tapAt(p, () => [...document.querySelectorAll('.pop.msheet .wg-tabs .rb')].find(x => x.textContent.trim() === 'Klang & Groove'));
  await shot(p, 'wege-marke-klang-hochkant.png');
  await p.close();
} catch (e) { bad++; console.log('FEHLER Ablauf: ' + (e && e.stack || e)); }
ok(!errs.length, 'Konsole ohne Fehler', errs.slice(0, 3).join(' | '));
console.log((bad ? 'FEHLER ' : 'OK ') + good + '/' + (good + bad));
fs.writeFileSync(path.join(out, 'wege-test-ergebnis.json'), JSON.stringify({ok: good, fehler: bad, errs: errs.slice(0, 10)}, null, 1));
await b.close();
