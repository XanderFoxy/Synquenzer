// CLIP1 – Auswahl im Clip → neuer Clip in freier Szene (Noten-Editor + Drum-Schritt-Editor). Touch über CDP.
// Aufruf: node clip1-test.mjs <abs. index.html> [428x926,926x428,926x370]   (baut auf vx/clip0/clip0-test.mjs auf)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), dir = path.dirname(file), here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(here, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file);
const out = {}, res = []; const log = (k, v) => { out[k] = v; console.log(k + ' = ' + JSON.stringify(v)); };
const ok = (name, cond, info) => { res.push({name, ok: !!cond}); console.log((cond ? 'OK   ' : 'FEHL ') + name + (info !== undefined ? '  ' + JSON.stringify(info).slice(0, 300) : '')); };
const b = await chromium.launch({args: ['--disable-renderer-backgrounding']});
const VIEWS = (process.argv[3] || '428x926,926x428,926x370').split(',').map(s => s.split('x').map(Number));
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (const [W, H] of VIEWS) {
  const tag = W + 'x' + H, errs = [], T = s => tag + ' ' + s;
  const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage(), cdp = await ctx.newCDPSession(p);
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, i) => ({x: q[0], y: q[1], id: i, radiusX: 2, radiusY: 2, force: 1}))});
  let taps = 0;
  const tap = async q => { if (!q) throw new Error('Knopf fehlt'); taps++; await touch('touchStart', [q]); await sleep(60); await touch('touchEnd', []); await sleep(280); };
  const at = (fn, arg) => p.evaluate(([src, a]) => { const e = (0, eval)(src)(a); if (!e || !e.getClientRects().length) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, Math.round(r.width), Math.round(r.height)]; }, [fn.toString(), arg]);
  const shot = n => p.screenshot({path: path.join(fotos, n + '-' + tag + '.png')});
  const boot = async () => { await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.clip1 && window.__spk, null, {timeout: 60000}); await sleep(800); };
  await p.goto(url); await boot();
  // Synth 1 mit 4-Takt-Clip, 16 Noten (wie clip0-d), Takt 3–4 gewählt (8 Noten)
  const setup = () => p.evaluate(() => { setSongView(false); SYNQUENZER.mtx3.copySet(false); const c = S.tracks[0].clips[0]; c.len = 4; c.notes = []; for (let k = 0; k < 16; k++) c.notes.push({t: k, d: .5, n: 60 + (k % 5), v: .8}); clipChanged(0, 0); selectTrack(0); openRoll(0, 0); const ix = c.notes.map((n, k) => k).filter(k => c.notes[k].t >= 8); ED.roll.selectIdx(ix); return {n: c.notes.length, ix, free: SYNQUENZER.clip1.free(0)}; });
  const A0 = await setup(); await sleep(300);
  const src0 = await p.evaluate(() => JSON.stringify(cleanClip(S.tracks[0].clips[0])));
  taps = 0;
  await tap(await at(() => ED.roll.el.acts.querySelector('.mtx3rb')));
  const S1 = await p.evaluate(() => { const P = UI.pop && UI.pop.el; if (!P) return null; const bs = [...P.querySelectorAll('[data-m3="clip"]')], pr = P.getBoundingClientRect();
    const sub = [...P.querySelectorAll('.mtx3-sub')].map(x => x.textContent.trim()), tops = new Set(bs.map(x => Math.round(x.getBoundingClientRect().top)));
    return {pop: UI.pop.name, sub, n: bs.length, lab: bs.map(x => x.textContent.trim()), minW: Math.min(...bs.map(x => x.getBoundingClientRect().width)), minH: Math.min(...bs.map(x => x.getBoundingClientRect().height)),
      jeZeile: bs.length ? bs.filter(x => Math.round(x.getBoundingClientRect().top) === Math.round(bs[0].getBoundingClientRect().top)).length : 0, zeilen: tops.size,
      popImBild: pr.top >= -1 && pr.bottom <= innerHeight + 1 && pr.left >= -1 && pr.right <= innerWidth + 1, rollt: P.scrollHeight > P.clientHeight + 1, upper: getComputedStyle(P.querySelector('.clip1-sec .mtx3-sub')).textTransform}; });
  log(T('C1.blatt'), S1);
  ok(T('C1 Abschnitt „Als neuer Clip · Synth 1“ mit so vielen Knöpfen wie freie Szenen'), S1 && S1.sub.includes('Als neuer Clip · Synth 1') && S1.n === A0.free.length && S1.lab[0] === 'Szene ' + (A0.free[0] + 1) + '2 Takte', {n: S1 && S1.n, frei: A0.free.length, lab: S1 && S1.lab.slice(0, 2)});
  ok(T('C9 Knöpfe ≥ 44×44 px, Blatt im Bild'), S1.minW >= 44 && S1.minH >= 44 && S1.popImBild, {w: S1.minW, h: S1.minH, jeZeile: S1.jeZeile, zeilen: S1.zeilen, rollt: S1.rollt});
  ok(T('C9 hochkant 4 je Zeile, quer mehr (≤ 8)'), W < H ? S1.jeZeile === Math.min(4, S1.n) : S1.jeZeile > 4 && S1.jeZeile <= 8, S1.jeZeile);
  // die Knöpfe sichtbar holen (Blatt rollt ggf.) und fotografieren
  await at(() => UI.pop.el.querySelector('[data-m3="clip"]'));
  const cut = await p.evaluate(() => { const P = UI.pop.el, pr = P.getBoundingClientRect(); return [...P.querySelectorAll('.clip1-sec button')].filter(x => { const r = x.getBoundingClientRect(); return r.top >= pr.top && r.bottom <= pr.bottom; }).every(x => { const r = x.getBoundingClientRect(); return r.left >= pr.left && r.right <= pr.right && x.scrollWidth <= x.clientWidth + 1; }); });
  ok(T('C9 nichts abgeschnitten (Text passt, Knöpfe im Blatt)'), cut);
  await shot('c1-blatt-als-neuer-clip');
  const u0 = await p.evaluate(() => UNDO.length);
  await tap(await at(() => UI.pop.el.querySelector('[data-m3="clip"][data-x="2"]')));
  const C1 = await p.evaluate(() => { const c = S.tracks[0].clips[2], q = S.tracks[0].clips[0], t = document.getElementById('toast');
    return {neu: c ? {len: c.len, n: c.notes.length, t0: c.notes[0].t, ts: c.notes.map(x => x.t), key: JSON.stringify(c.key) === JSON.stringify(q.key), ts_: c.ts || null} : null, quelleN: q.notes.length, last: SYNQUENZER.clip1.info().last, mtx3last: SYNQUENZER.mtx3.info().last,
      toast: t && t.classList.contains('show') ? t.querySelector('.tmsg').textContent.replace(/\s+/g, ' ').trim() : null, oeffnen: t ? [...t.querySelectorAll('button')].map(x => x.textContent.trim()) : [], sel: ED.roll ? ED.roll.selection.length : -1, undo: UNDO.length, label: UNDO[UNDO.length - 1].label}; });
  log(T('C1.ergebnis'), C1);
  ok(T('C1 Szene 3: len 2, 8 Noten, erste bei t_alt − 8 Schläge (0), Tonart wie Quelle'), C1.neu && C1.neu.len === 2 && C1.neu.n === 8 && C1.neu.t0 === 0 && C1.neu.key && C1.neu.ts.join() === '0,1,2,3,4,5,6,7', C1.neu);
  ok(T('C1 Verschieben: Quelle hat 8 Noten weniger; 0 von 8 weggefallen'), C1.quelleN === 8 && C1.last.n === 8 && C1.neu.n === 8 && C1.mtx3last.op === 'clip');
  ok(T('C1 Toast „8 Noten → neuer Clip · SYNTH 1 · Szene 3 · 2 Takte“ mit [Öffnen], Auswahl geleert'), /8 Noten → neuer Clip · SYNTH 1 · Szene 3 · 2 Takte/.test(C1.toast || '') && C1.oeffnen.includes('Öffnen') && C1.sel === 0, {toast: C1.toast, k: C1.oeffnen});
  ok(T('C2 ein einziger Undo-Eintrag'), C1.undo === u0 + 1 && /Noten → neuer Clip · Szene 3/.test(C1.label), C1.label);
  const tp = await p.evaluate(() => { const t = document.getElementById('toast'), r = t.getBoundingClientRect(), h = ED.rollHT.getBoundingClientRect(); const tools = [...EL.rollSheet.querySelectorAll('button')].filter(x => x.getClientRects().length && !t.contains(x)).filter(x => { const q = x.getBoundingClientRect(); return q.left < r.right && q.right > r.left && q.top < r.bottom && q.bottom > r.top; }).map(x => x.textContent.trim()); const m = t.querySelector('.tmsg'); return {ueberWerkzeug: tools, aufTitel: r.top >= h.top - 1 && r.bottom <= h.bottom + 1, ganz: m.scrollWidth <= m.clientWidth + 1 && m.scrollHeight <= m.clientHeight + 1, w: Math.round(r.width), cls: t.className}; });
  ok(T('C6 Toast im Editor über keinem Werkzeug, Text ganz lesbar'), tp.ueberWerkzeug.length === 0 && tp.ganz, tp);
  await shot('c2-toast-oeffnen-im-editor');
  // C6 [Öffnen]
  await tap(await at(() => [...document.querySelectorAll('#toast button')].find(x => /Öffnen/.test(x.textContent))));
  await sleep(400);
  const C6 = await p.evaluate(() => ({ed: R.editor, at: ED.rollAt ? [ED.rollAt.t, ED.rollAt.s] : null, n: ED.roll ? S.tracks[ED.rollAt.t].clips[ED.rollAt.s].notes.length : -1}));
  ok(T('C6 [Öffnen] öffnet den Editor auf Szene 3 mit 8 Noten'), C6.ed === 'roll' && C6.at && C6.at[0] === 0 && C6.at[1] === 2 && C6.n === 8, C6);
  await shot('c3-geoeffnet-szene3');
  await p.evaluate(() => closeRoll()); await sleep(300);
  await shot('c4-matrix-danach');
  // C2 ↶ / ↷
  const C2 = await p.evaluate(src0 => { const j = () => JSON.stringify([cleanClip(S.tracks[0].clips[0]), S.tracks[0].clips[2] ? cleanClip(S.tracks[0].clips[2]) : null]); const after = j();
    undo(); const u = j(), back = JSON.stringify(cleanClip(S.tracks[0].clips[0])) === src0 && !S.tracks[0].clips[2]; redo(); const r = j(); return {back, redo: r === after, u1: u !== after}; }, src0);
  ok(T('C2 ein ↶ stellt Quelle und Ziel her (JSON gleich), ↷ wiederholt'), C2.back && C2.redo, C2);
  // C7 Speichern, Neuladen, Vergleich
  const before7 = await p.evaluate(() => JSON.stringify(cleanClip(S.tracks[0].clips[2])));
  const sv = await p.evaluate(() => saveNow());
  await p.reload(); await boot();
  const after7 = await p.evaluate(() => S.tracks[0].clips[2] ? JSON.stringify(cleanClip(S.tracks[0].clips[2])) : null);
  ok(T('C7 Speichern, Neuladen: neuer Clip gleich (Noten, len, Tonart)'), sv && after7 === before7, {gespeichert: sv, gleich: after7 === before7});
  // Kopieren: die Quelle bleibt
  const K = await p.evaluate(() => { const c = S.tracks[0].clips[0], s0 = JSON.stringify(cleanClip(c)); c.len = 4; const ix = c.notes.map((n, k) => k).slice(0, 4); const fr = SYNQUENZER.clip1.free(0)[0];
    const x = SYNQUENZER.clip1.newClip(0, 0, ix, fr, true); const nc = S.tracks[0].clips[x]; const r = {x, n: nc && nc.notes.length, quelleGleich: JSON.stringify(cleanClip(c)) === s0}; undo(); r.weg = !S.tracks[0].clips[fr]; return r; });
  ok(T('C1 Kopieren: Quelle bleibt gleich'), K.x >= 0 && K.n === 4 && K.quelleGleich && K.weg, K);
  // C3 Taktgrenzen und 3/4
  const C3 = await p.evaluate(() => { const fr = SYNQUENZER.clip1.free(0); const s = fr[0], x = fr[1];
    S.tracks[0].clips[s] = normClip({len: 6, key: {root: 0, scale: 'ionian'}, notes: [{t: 2, d: 1, n: 60, v: .8}, {t: 10, d: 1, n: 62, v: .8}, {t: 13, d: 1, n: 64, v: .8}, {t: 17.5, d: .5, n: 65, v: .8}]}, 'synth', S.key); clipChanged(0, s);
    S.tracks[0].clips[s].cv = {mw: [[0, 0], [8, .5], [16, 1]]};
    const sp = SYNQUENZER.clip1.span(0, s, [1, 2, 3]); const r1 = SYNQUENZER.clip1.newClip(0, s, [1, 2, 3], x, true); const nc = S.tracks[0].clips[x];
    const a = {sp, len: nc.len, t: nc.notes.map(n => n.t), cv: nc.cv ? JSON.stringify(nc.cv.mw) : null}; undo();
    S.tracks[0].clips[s] = normClip({len: 4, ts: '3/4', key: {root: 0, scale: 'ionian'}, notes: [{t: 1, d: 1, n: 60, v: .8}, {t: 4.5, d: 1, n: 62, v: .8}, {t: 6.5, d: 1, n: 64, v: .8}]}, 'synth', S.key); clipChanged(0, s);
    const bb = clipBarB(S.tracks[0].clips[s]), sp2 = SYNQUENZER.clip1.span(0, s, [1, 2]); SYNQUENZER.clip1.newClip(0, s, [1, 2], x, true); const nc2 = S.tracks[0].clips[x];
    const b2 = {bb, sp2, len: nc2.len, ts: nc2.ts, t: nc2.notes.map(n => n.t)}; undo(); S.tracks[0].clips[s] = null; clipChanged(0, s); return {a, b2}; });
  ok(T('C3 Auswahl 2,5–4,5 Takte im 6-Takt-Clip → len 3 ab Takt 2 (b0 8)'), C3.a.sp.b0 === 8 && C3.a.len === 3 && C3.a.t.join() === '2,5,9.5', C3.a);
  ok(T('C3 Kurven (Modulation) nur der Ausschnitt ab b0: Start 0,5 bei 0, 1 bei 8'), !!C3.a.cv && /^\[\[0,0\.5\],\[8,1\]/.test(C3.a.cv), C3.a.cv);
  ok(T('C3 3/4: clipBarB 3, Länge in 3/4-Takten, Taktart bleibt'), C3.b2.bb === 3 && C3.b2.sp2.b0 === 3 && C3.b2.len === 2 && C3.b2.ts === '3/4' && C3.b2.t.join() === '1.5,3.5', C3.b2);
  // C4 alle Szenen belegt
  await p.evaluate(() => { setSongView(false); const c = S.tracks[0].clips[0]; c.len = 4; c.notes = []; for (let k = 0; k < 16; k++) c.notes.push({t: k, d: .5, n: 60 + (k % 5), v: .8}); for (let x = 0; x < NS(); x++) if (!S.tracks[0].clips[x]) { S.tracks[0].clips[x] = normClip({len: 1, key: cleanKey(c.key), notes: []}, 'synth', S.key); clipChanged(0, x); } openRoll(0, 0); ED.roll.selectIdx([8, 9, 10]); });
  await sleep(300);
  await tap(await at(() => ED.roll.el.acts.querySelector('.mtx3rb')));
  const C4 = await p.evaluate(() => { const P = UI.pop.el, h = P.querySelector('.clip1-none'); return {n: P.querySelectorAll('[data-m3="clip"]').length, hint: h && h.getClientRects().length ? h.textContent : null, andere: P.querySelectorAll('[data-m3="to"],[data-m3="new"]').length}; });
  ok(T('C4 alles belegt: keine Knöpfe, Hinweis sichtbar, andere Ziele da'), C4.n === 0 && /Keine freie Szene auf Synth 1 – Szene leeren oder „In neue Spur darunter“/.test(C4.hint || '') && C4.andere >= 1, C4);
  if (W === 428) { await at(() => UI.pop.el.querySelector('.clip1-none')); await shot('c5-alles-belegt'); }
  await p.evaluate(() => { closePop(); });
  const C4b = await p.evaluate(() => { const before = S.tracks.length; const j = SYNQUENZER.mtx3.out(0, 0, [8, 9], 'new', true); return {j, ok: j >= 0}; });
  ok(T('C4 andere Ziele gehen weiter (In neue Spur darunter)'), C4b.ok, C4b);
  await p.evaluate(() => { closeRoll(); }); await sleep(200);
  // C5 STIMME / Original / Einzelspur: kein Knopf (Quelle ausgeschlossen)
  if (W === 428) {
    const C5 = await p.evaluate(() => { const r = {}; const t = 1, tr = S.tracks[t];
      for (const k of ['stimme', 'orig']) { tr[k] = k === 'stimme' ? {} : {}; r[k] = mtx3OutSrcOk(t) === false && SYNQUENZER.clip1.newClip(t, 0, [0], 7, true) === -1; delete tr[k]; }
      const L = SYNQUENZER.mtx3.split(['hatC']); const j = SYNQUENZER.mtx3.info().parts[0]; r.einzelspur = j != null && mtx3OutSrcOk(j) === false; if (j != null) { openRoll(j, 0); r.knopf = !!(ED.roll && ED.roll.el && ED.roll.el.acts && ED.roll.el.acts.querySelector('.mtx3rb')); closeRoll(); } undo(); return r; });
    ok(T('C5 STIMME-, Original-, Einzelspur-Clip: kein Auslagern / kein neuer Clip'), C5.stimme && C5.orig && C5.einzelspur && !C5.knopf, C5);
  }
  await p.evaluate(() => { try { hideToast(); } catch (e) {} });
  // C8 DRUMS › SCHRITTE › Auslagern ▾ › HH ZU › Nur diese Schritte 2 3 6 7 › „Szene n“
  await p.evaluate(() => { const D = S.tracks[DRUM_T], c = D.clips[0], gm = DRUM_BY_ID.hatC.gm; c.notes = c.notes.filter(n => mtx3bPad(n) !== 'hatC'); for (let k = 0; k < 8; k++) c.notes.push({t: k * .25, d: .1, n: gm, v: .8}); c.notes.sort((a, b) => a.t - b.t); clipChanged(DRUM_T, 0);
    ED.dVoice = DRUM_VOICES.findIndex(x => x.id === 'hatC'); openRoll(DRUM_T, 0); });
  await sleep(700);
  const d0 = await p.evaluate(() => ({src: JSON.stringify(cleanClip(S.tracks[DRUM_T].clips[0])), free: SYNQUENZER.clip1.free(DRUM_T), u: UNDO.length}));
  await tap(await at(() => EL.drumSheet.querySelector('.mtx3bdb')));
  await tap(await at(() => [...UI.pop.el.querySelectorAll('button')].find(x => /Nur diese Schritte/.test(x.textContent))));
  for (const lab of ['1', '4', '5', '8']) await tap(await at(l => [...UI.pop.el.querySelectorAll('.mtx3b-st .mbtn')].find(x => x.textContent.trim() === l), lab));
  const D8a = await p.evaluate(() => { const P = UI.pop.el, bs = [...P.querySelectorAll('[data-m3b="clip"]')]; return {sub: [...P.querySelectorAll('.clip1-sec .mtx3-sub')].map(x => x.textContent), n: bs.length, minW: Math.min(...bs.map(x => x.getBoundingClientRect().width)), minH: Math.min(...bs.map(x => x.getBoundingClientRect().height)), jeZeile: bs.length ? bs.filter(x => Math.round(x.getBoundingClientRect().top) === Math.round(bs[0].getBoundingClientRect().top)).length : 0, on: [...P.querySelectorAll('.mtx3b-st .mbtn.on')].map(x => x.textContent.trim())}; });
  ok(T('C8 Drum-Blatt: Abschnitt „Als neuer Clip · DRUMS“, Knöpfe = freie Szenen, ≥ 44 px'), D8a.sub.some(x => x.toUpperCase() === 'ALS NEUER CLIP · DRUMS · AUS SZENE 1') && D8a.n === d0.free.length && D8a.minW >= 44 && D8a.minH >= 44 && D8a.jeZeile <= (W < H ? 4 : 8) && D8a.on.join() === '2,3,6,7', D8a);
  await at(() => UI.pop.el.querySelector('[data-m3b="clip"]'));
  await shot('c6-drum-blatt-als-neuer-clip');
  const x8 = d0.free[0];
  await tap(await at(x => UI.pop.el.querySelector(`[data-m3b="clip"][data-x="${x}"]`), x8));
  const D8 = await p.evaluate(x => { const c = S.tracks[DRUM_T].clips[x], t = document.getElementById('toast'); return {neu: c ? {len: c.len, n: c.notes.length, pads: [...new Set(c.notes.map(mtx3bPad))], t: c.notes.map(n => n.t)} : null, src: JSON.stringify(cleanClip(S.tracks[DRUM_T].clips[0])), u: UNDO.length,
    toast: t && t.classList.contains('show') ? t.querySelector('.tmsg').textContent.replace(/\s+/g, ' ').trim() : null, k: t ? [...t.querySelectorAll('button')].map(b => b.textContent.trim()) : []}; }, x8);
  ok(T('C8 DRUMS Szene n: nur HH ZU auf 2 3 6 7 (4 Schläge), Quelle gleich, ein ↶'), D8.neu && D8.neu.n === 4 && D8.neu.pads.join() === 'hatC' && D8.neu.t.join() === '0.25,0.5,1.25,1.5' && D8.src === d0.src && D8.u === d0.u + 1, {neu: D8.neu, u: [d0.u, D8.u]});
  ok(T('C8 Toast mit [Öffnen]'), /4 Schläge → neuer Clip · DRUMS · Szene \d+ · 1 Takt/.test(D8.toast || '') && D8.k.includes('Öffnen'), D8);
  await shot('c7-drum-toast');
  await tap(await at(() => [...document.querySelectorAll('#toast button')].find(x => /Öffnen/.test(x.textContent))));
  await sleep(500);
  const D8o = await p.evaluate(() => ({ed: R.editor, s: R.selS, t: R.selT}));
  ok(T('C8 [Öffnen] zeigt DRUMS Szene n im Schritt-Editor'), D8o.ed === 'drum' && D8o.s === x8, D8o);
  const D8u = await p.evaluate(x => { undo(); return !S.tracks[DRUM_T].clips[x]; }, x8);
  ok(T('C8 ↶ nimmt den neuen DRUMS-Clip weg'), D8u);
  await p.evaluate(() => { try { closeEditor(); } catch (e) {} }); await sleep(300);
  // ---------- Nachbesserung nach der Prüfung ----------
  // P1 FILL-Schritt im Projekt: die TAKT-Anzeige heißt „FILL“ und ist eine Taste – der Toast liegt nie darauf (quer: Meldung ohne Knopf)
  await p.evaluate(() => { try { hideToast(); } catch (e) {} setSongView(false); SYNQUENZER.mtx3.copySet(false); const D = S.tracks[DRUM_T].clips[0]; D.notes[0].cd = 'fill'; clipChanged(DRUM_T, 0);
    for (let x = 1; x < NS(); x++) if (S.tracks[0].clips[x]) { S.tracks[0].clips[x] = null; clipChanged(0, x); }
    const c = S.tracks[0].clips[0]; c.len = 4; c.notes = []; for (let k = 0; k < 16; k++) c.notes.push({t: k, d: .5, n: 60 + (k % 5), v: .8}); clipChanged(0, 0); selectTrack(0); });
  await p.waitForFunction(() => jam1Armed(), null, {timeout: 5000}).catch(() => {});
  await p.evaluate(() => { openRoll(0, 0); const c = S.tracks[0].clips[0]; ED.roll.selectIdx(c.notes.map((n, k) => k).filter(k => c.notes[k].t >= 8)); });
  await sleep(400);
  await tap(await at(() => ED.roll.el.acts.querySelector('.mtx3rb')));
  await tap(await at(() => UI.pop.el.querySelector('[data-m3="clip"][data-x="2"]')));
  await sleep(200);
  const P1 = await p.evaluate(() => { const t = document.getElementById('toast'), r = t.getBoundingClientRect(), k = EL.takt.getBoundingClientRect();
    const ov = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const e = document.elementFromPoint(k.left + k.width / 2, k.top + k.height / 2), tools = [...EL.rollSheet.querySelectorAll('button')].filter(x => x.getClientRects().length && !t.contains(x)).filter(x => ov(x.getBoundingClientRect(), r) > 0);
    return {armed: jam1Armed(), lbl: EL.taktLbl.textContent, dock: SYNQUENZER.clip1.dock(), show: t.classList.contains('show'), msg: t.querySelector('.tmsg') ? t.querySelector('.tmsg').textContent.replace(/\s+/g, ' ').trim() : null,
      k: [...t.querySelectorAll('button')].map(x => x.textContent.trim()), aufFill: Math.round(ov(r, k)), mitteFill: e ? (t.contains(e) ? 'TOAST' : e.closest('#takt') ? 'takt' : e.id || e.className) : null,
      durchtippbar: getComputedStyle(t).pointerEvents === 'none', ueberWerkzeugMitKnopf: t.querySelector('button') ? tools.length : 0, neu: S.tracks[0].clips[2] ? S.tracks[0].clips[2].notes.length : 0}; });
  log(T('P1.fill'), P1);
  ok(T('P1 FILL-Schritt: TAKT-Anzeige ist die FILL-Taste'), P1.armed && P1.lbl === 'FILL', P1.lbl);
  ok(T('P1 neuer Clip trotzdem da (8 Noten), Meldung sichtbar'), P1.neu === 8 && P1.show && /8 Noten → neuer Clip · SYNTH 1 · Szene 3 · 2 Takte/.test(P1.msg || ''), P1.msg);
  ok(T('P1 Toast deckt die FILL-Taste nicht (0 px², Mitte trifft FILL)'), P1.aufFill === 0 && P1.mitteFill === 'takt', {px: P1.aufFill, mitte: P1.mitteFill});
  ok(T(W < H ? 'P1 hochkant: [Öffnen] auf dem Titel' : 'P1 quer: kein Platz frei → Meldung ohne Knopf, durchtippbar'), W < H ? P1.dock === 'titel' && P1.k.includes('Öffnen') && P1.ueberWerkzeugMitKnopf === 0 : P1.dock === null && P1.k.length === 0 && P1.durchtippbar, {dock: P1.dock, k: P1.k, durch: P1.durchtippbar});
  await shot('c8-fill-toast');
  await p.evaluate(() => { undo(); try { hideToast(); closeRoll(); } catch (e) {} const D = S.tracks[DRUM_T].clips[0]; delete D.notes[0].cd; clipChanged(DRUM_T, 0); });
  await p.waitForFunction(() => !jam1Armed(), null, {timeout: 5000}).catch(() => {});
  const P1b = await p.evaluate(() => ({armed: jam1Armed(), dock: (openRoll(0, 0), SYNQUENZER.clip1.dock()), zu: (closeRoll(), true)}));
  ok(T('P1 ohne FILL: quer wieder TAKT-Anzeige, hochkant Titel'), !P1b.armed && P1b.dock === (W < H ? 'titel' : 'takt'), P1b);
  // P2 Quelle mit erweitertem Inhalt (KL1 clip.lw): der neue Clip ist nur die Auswahl (Synth und Drums)
  const P2 = await p.evaluate(() => { const notes = []; for (let k = 0; k < 16; k++) notes.push({t: k, d: .5, n: 60 + (k % 5), v: .8}); const lwN = []; for (let k = 16; k < 32; k++) lwN.push({t: k, d: .5, n: 72, v: .8});
    const keep = S.tracks[0].clips[0]; S.tracks[0].clips[0] = normClip({len: 4, key: {root: 0, scale: 'ionian'}, notes, lw: {a: 0, len: 8, notes: lwN}}, 'synth', S.key); clipChanged(0, 0);
    const c = S.tracks[0].clips[0], r = {quelleLw: !!c.lw, quelleGanz: c.lw ? kl1Full(c).length : 0}, fr = SYNQUENZER.clip1.free(0)[0];
    const x = SYNQUENZER.clip1.newClip(0, 0, [8, 9, 10, 11, 12, 13, 14, 15], fr, true), nc = S.tracks[0].clips[x];
    r.neu = {len: nc.len, n: nc.notes.length, lw: !!nc.lw, hoch72: nc.notes.filter(n => n.n === 72).length, beats: kl1Beats(0, x), ts: nc.notes.map(n => n.t).join()};
    undo(); S.tracks[0].clips[0] = keep; clipChanged(0, 0);
    const D = S.tracks[DRUM_T], gm = DRUM_BY_ID.hatC.gm, ds = SYNQUENZER.clip1.free(DRUM_T), s = ds[0], xd = ds[1];
    D.clips[s] = normClip({len: 1, notes: [0, 1, 2, 3].map(k => ({t: k, d: .1, n: gm, v: .8})), lw: {a: 0, len: 2, notes: [4, 5, 6, 7].map(k => ({t: k, d: .1, n: gm, v: .8}))}}, 'drum', S.key); clipChanged(DRUM_T, s);
    r.drumQuelleLw = !!D.clips[s].lw; const y = SYNQUENZER.clip1.drumNew(s, [0, 1], xd); r.drum = y >= 0 ? {n: D.clips[y].notes.length, lw: !!D.clips[y].lw} : null;
    if (y >= 0) undo(); D.clips[s] = null; clipChanged(DRUM_T, s); return r; });
  log(T('P2.lw'), P2);
  ok(T('P2 Synth-Quelle mit lw (32 Noten ganz): neuer Clip ohne lw, nur die 8 gewählten Noten, 8 Schläge'), P2.quelleLw && P2.quelleGanz === 32 && !P2.neu.lw && P2.neu.n === 8 && P2.neu.hoch72 === 0 && P2.neu.len === 2 && P2.neu.beats === 8, P2.neu);
  ok(T('P2 Drum-Quelle mit lw: neuer Clip ohne lw, nur die 2 gewählten Schläge'), P2.drum && !P2.drum.lw && P2.drum.n === 2, {quelleLw: P2.drumQuelleLw, neu: P2.drum});
  // P5 Lock-Reihen (clip.ln) rücken um b0 mit (rotiert), die Quelle bleibt
  const P5 = await p.evaluate(() => { const path = Object.keys(LKT).find(k => !k.startsWith('drum.') && lkWhy(k, false) === ''), fr = SYNQUENZER.clip1.free(0), s = fr[0], x = fr[1];
    S.tracks[0].clips[s] = normClip({len: 4, key: {root: 0, scale: 'ionian'}, notes: [0, 8, 9, 10, 11].map(t => ({t, d: .5, n: 60, v: .8})), ln: [{p: path, len: 16, g: '1/4', st: [{i: 0, v: .1}, {i: 8, v: .5}, {i: 9, v: .6}]}]}, 'synth', S.key); clipChanged(0, s);
    const c = S.tracks[0].clips[s], q0 = c.ln ? JSON.stringify(c.ln) : null, ix = c.notes.map((n, k) => k).filter(k => c.notes[k].t >= 8);
    SYNQUENZER.clip1.newClip(0, s, ix, x, true); const nc = S.tracks[0].clips[x];
    const r = {path, b0: SYNQUENZER.clip1.info().last.b0, neu: nc.ln ? nc.ln[0].st.map(q => q.i + ':' + q.v).join(' ') : null, len: nc.ln ? nc.ln[0].len : null, g: nc.ln ? nc.ln[0].g : null, quelleGleich: JSON.stringify(c.ln) === q0};
    undo(); S.tracks[0].clips[s] = null; clipChanged(0, s); return r; });
  log(T('P5.ln'), P5);
  ok(T('P5 Lock-Reihe 1/4 ab Takt 3 (b0 8): Schritte 8→0, 9→1, 0→8, Länge/Raster gleich, Quelle gleich'), !!P5.path && P5.b0 === 8 && P5.neu === '0:0.5 1:0.6 8:0.1' && P5.len === 16 && P5.g === '1/4' && P5.quelleGleich, P5);
  // P3 Drums „Ganze Töne“: CLAP spielt nur in Szene 2 → im Blatt von Szene 1 die richtige Meldung, Abschnitt nennt die Szene
  await p.evaluate(() => { const D = S.tracks[DRUM_T], gm = DRUM_BY_ID.clap.gm; D.clips[0].notes = D.clips[0].notes.filter(n => mtx3bPad(n) !== 'clap'); clipChanged(DRUM_T, 0);
    if (!D.clips[1]) D.clips[1] = normClip({len: 1, notes: [{t: 1, d: .1, n: gm, v: .8}]}, 'drum', S.key); else D.clips[1].notes.push({t: 1, d: .1, n: gm, v: .8}); clipChanged(DRUM_T, 1);
    ED.dVoice = DRUM_VOICES.findIndex(x => x.id === 'clap'); R.selS = 0; openRoll(DRUM_T, 0); });
  await sleep(700);
  const p3n = await p.evaluate(() => ({n: S.tracks[DRUM_T].clips.filter(Boolean).length, u: UNDO.length}));
  await tap(await at(() => EL.drumSheet.querySelector('.mtx3bdb')));
  await tap(await at(() => UI.pop.el.querySelector('[data-m3b="all"]')));
  const P3a = await p.evaluate(() => { const P = UI.pop.el; return {on: [...P.querySelectorAll('.mtx3-v .mbtn.on')].map(x => x.dataset.v), modus: (P.querySelector('.mtx3b-md .mbtn.on') || {}).dataset ? P.querySelector('.mtx3b-md .mbtn.on').dataset.m3b : null, sub: [...P.querySelectorAll('.clip1-sec .mtx3-sub')].map(x => x.textContent)}; });
  await tap(await at(() => UI.pop.el.querySelector('[data-m3b="clip"]')));
  const P3 = await p.evaluate(() => { const t = document.getElementById('toast'); return {toast: t && t.classList.contains('show') ? t.textContent.replace(/\s+/g, ' ').trim() : null, n: S.tracks[DRUM_T].clips.filter(Boolean).length, u: UNDO.length}; });
  log(T('P3.drum'), {P3a, P3});
  ok(T('P3 Abschnitt heißt „Als neuer Clip · DRUMS · aus Szene 1“'), P3a.sub.some(x => x.toUpperCase() === 'ALS NEUER CLIP · DRUMS · AUS SZENE 1'), P3a.sub);
  ok(T('P3 CLAP gewählt, Ganze Töne → Meldung „CLAP spielt in Szene 1 nicht“, kein Clip, kein ↶'), P3a.on.includes('clap') && P3a.modus === 'all' && /CLAP spielt in Szene 1 nicht/i.test(P3.toast || '') && P3.n === p3n.n && P3.u === p3n.u, {on: P3a.on, toast: P3.toast});
  if (W === 428) await shot('c9-drum-meldung');
  await p.evaluate(() => { try { closePop(); hideToast(); closeEditor(); } catch (e) {} }); await sleep(300);
  // P4 „Wo finde ich …?“: „neuer Clip“ / „Clip aus Auswahl“ führen zum Eintrag, „Zeig es mir“ zeigt [Auslagern ▾]
  const P4 = await p.evaluate(() => { const c = S.tracks[0].clips[0]; c.len = 4; c.notes = []; for (let k = 0; k < 8; k++) c.notes.push({t: k, d: .5, n: 60, v: .8}); clipChanged(0, 0);
    return {a: SYNQUENZER.ui1.search('neuer Clip').map(e => e.id).slice(0, 3), b: SYNQUENZER.ui1.search('Clip aus Auswahl').map(e => e.id).slice(0, 3), c: SYNQUENZER.ui1.search('auslagern').map(e => e.id).slice(0, 4), e: SYNQUENZER.ui1.entries().find(e => e.id === 'clip1new'), j: SYNQUENZER.ui1.jump('clip1new')}; });
  await sleep(1200);
  const P4j = await p.evaluate(() => { const b = ED.roll && ED.roll.el.acts.querySelector('.mtx3rb'), r = b ? b.getBoundingClientRect() : null; return {j: SYNQUENZER.ui1.lastJump(), ed: R.editor, knopf: b ? {x: Math.round(r.left), y: Math.round(r.top), txt: b.textContent.trim()} : null}; });
  log(T('P4.guide'), {P4, P4j});
  ok(T('P4 Suche „neuer Clip“ und „Clip aus Auswahl“: erster Treffer „Auswahl als neuer Clip“'), P4.a[0] === 'clip1new' && P4.b[0] === 'clip1new' && P4.c.includes('clip1new') && P4.c.includes('mtx3out'), {a: P4.a, b: P4.b, c: P4.c});
  ok(T('P4 „Zeig es mir“ öffnet den Noten-Editor und zeigt [Auslagern ▾]'), P4j.j && P4j.j.ok && P4j.j.target && P4j.ed === 'roll' && P4j.knopf && /Auslagern/.test(P4j.knopf.txt) && P4j.j.at && P4j.j.at.x === P4j.knopf.x && P4j.j.at.y === P4j.knopf.y, P4j);
  await p.evaluate(() => { try { closeRoll(); } catch (e) {} }); await sleep(200);
  ok(T('C9 Konsole 0 Fehler'), errs.length === 0, errs.slice(0, 5));
  await ctx.close();
}
await b.close(); srv.close();
const nOk = res.filter(r => r.ok).length; console.log('\nERGEBNIS ' + nOk + '/' + res.length + ' grün');
fs.writeFileSync(path.join(here, 'clip1-ergebnis.json'), JSON.stringify({res, out}, null, 1));
