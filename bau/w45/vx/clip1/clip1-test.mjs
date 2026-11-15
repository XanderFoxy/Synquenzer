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
    const sp = SYNQUENZER.clip1.span(0, s, [1, 2, 3]); const r1 = SYNQUENZER.clip1.newClip(0, s, [1, 2, 3], x, true); const nc = S.tracks[0].clips[x];
    const a = {sp, len: nc.len, t: nc.notes.map(n => n.t)}; undo();
    S.tracks[0].clips[s] = normClip({len: 4, ts: '3/4', key: {root: 0, scale: 'ionian'}, notes: [{t: 1, d: 1, n: 60, v: .8}, {t: 4.5, d: 1, n: 62, v: .8}, {t: 6.5, d: 1, n: 64, v: .8}]}, 'synth', S.key); clipChanged(0, s);
    const bb = clipBarB(S.tracks[0].clips[s]), sp2 = SYNQUENZER.clip1.span(0, s, [1, 2]); SYNQUENZER.clip1.newClip(0, s, [1, 2], x, true); const nc2 = S.tracks[0].clips[x];
    const b2 = {bb, sp2, len: nc2.len, ts: nc2.ts, t: nc2.notes.map(n => n.t)}; undo(); S.tracks[0].clips[s] = null; clipChanged(0, s); return {a, b2}; });
  ok(T('C3 Auswahl 2,5–4,5 Takte im 6-Takt-Clip → len 3 ab Takt 2 (b0 8)'), C3.a.sp.b0 === 8 && C3.a.len === 3 && C3.a.t.join() === '2,5,9.5', C3.a);
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
  // C8 DRUMS › SCHRITTE › Auslagern ▾ › HH ZU › Nur diese Schritte 2 3 6 7 › „Szene n“
  await p.evaluate(() => { const D = S.tracks[DRUM_T], c = D.clips[0], gm = DRUM_BY_ID.hatC.gm; c.notes = c.notes.filter(n => mtx3bPad(n) !== 'hatC'); for (let k = 0; k < 8; k++) c.notes.push({t: k * .25, d: .1, n: gm, v: .8}); c.notes.sort((a, b) => a.t - b.t); clipChanged(DRUM_T, 0);
    ED.dVoice = DRUM_VOICES.findIndex(x => x.id === 'hatC'); openRoll(DRUM_T, 0); });
  await sleep(700);
  const d0 = await p.evaluate(() => ({src: JSON.stringify(cleanClip(S.tracks[DRUM_T].clips[0])), free: SYNQUENZER.clip1.free(DRUM_T), u: UNDO.length}));
  await tap(await at(() => EL.drumSheet.querySelector('.mtx3bdb')));
  await tap(await at(() => [...UI.pop.el.querySelectorAll('button')].find(x => /Nur diese Schritte/.test(x.textContent))));
  for (const lab of ['1', '4', '5', '8']) await tap(await at(l => [...UI.pop.el.querySelectorAll('.mtx3b-st .mbtn')].find(x => x.textContent.trim() === l), lab));
  const D8a = await p.evaluate(() => { const P = UI.pop.el, bs = [...P.querySelectorAll('[data-m3b="clip"]')]; return {sub: [...P.querySelectorAll('.clip1-sec .mtx3-sub')].map(x => x.textContent), n: bs.length, minW: Math.min(...bs.map(x => x.getBoundingClientRect().width)), minH: Math.min(...bs.map(x => x.getBoundingClientRect().height)), on: [...P.querySelectorAll('.mtx3b-st .mbtn.on')].map(x => x.textContent.trim())}; });
  ok(T('C8 Drum-Blatt: Abschnitt „Als neuer Clip · DRUMS“, Knöpfe = freie Szenen, ≥ 44 px'), D8a.sub.some(x => x.toUpperCase() === 'ALS NEUER CLIP · DRUMS') && D8a.n === d0.free.length && D8a.minW >= 44 && D8a.minH >= 44 && D8a.on.join() === '2,3,6,7', D8a);
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
  ok(T('C9 Konsole 0 Fehler'), errs.length === 0, errs.slice(0, 5));
  await ctx.close();
}
await b.close(); srv.close();
const nOk = res.filter(r => r.ok).length; console.log('\nERGEBNIS ' + nOk + '/' + res.length + ' grün');
fs.writeFileSync(path.join(here, 'clip1-ergebnis.json'), JSON.stringify({res, out}, null, 1));
