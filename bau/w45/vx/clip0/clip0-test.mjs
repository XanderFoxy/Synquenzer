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
  const hold = async (q, ms = 700) => { taps++; await touch('touchStart', [q]); await sleep(ms); await touch('touchEnd', []); await sleep(300); };
  // Element über eine Funktion im Seiten-Kontext suchen, ins Bild holen, Mitte zurückgeben
  const at = (fn, arg) => p.evaluate(([src, a]) => { const e = (0, eval)(src)(a); if (!e || !e.getClientRects().length) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, Math.round(r.width), Math.round(r.height)]; }, [fn.toString(), arg]);
  const btnTxt = (root, txt) => [...root.querySelectorAll('button')].find(x => x.getClientRects().length && !x.hidden && (x.textContent || '').trim().startsWith(txt));
  const shot = n => p.screenshot({path: path.join(fotos, n + '-' + tag + '.png')});
  await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk, null, {timeout: 60000}); await sleep(800);

  // ================= A · Noten-Editor eines Matrix-Clips =================
  await p.evaluate(() => { setSongView(false); selectTrack(0); openRoll(0, 0); }); await sleep(700);
  const A0 = await p.evaluate(() => ({clip: !!S.tracks[0].clips[0], n: S.tracks[0].clips[0].notes.length, len: S.tracks[0].clips[0].len, NS: NS(), NT: NT(), free0: S.tracks[0].clips.map((c, s) => c ? null : s).filter(x => x != null),
    acts: [...ED.roll.el.acts.children].filter(x => x.tagName === 'BUTTON' && !x.hidden).map(x => x.textContent.trim())}));
  log(tag + ' A.noten-editor.aktionsleiste', A0);
  await p.evaluate(() => ED.roll.selectIdx([0, 1, 2])); await sleep(200);
  await shot('a1-noten-editor-auswahl');
  await tap(await at(() => ED.roll.el.acts.querySelector('.mtx3rb')));
  const A1 = await p.evaluate(() => ({pop: UI.pop && UI.pop.name, ziele: UI.pop ? [...UI.pop.el.querySelectorAll('button')].map(x => x.textContent.trim().replace(/\s+/g, ' ')) : []}));
  log(tag + ' A.auslagern-blatt', A1);
  await shot('a2-auslagern-blatt');
  await p.evaluate(() => closePop()); await sleep(200);

  if (W === 428) {
    // A2 · Umweg 1: Noten kopieren → leeren Platz derselben Spur halten → ✎ Neuer Clip → Noten einfügen → ✓ Einfügen
    taps = 0;
    await tap(await at(() => [...ED.roll.el.acts.children].find(x => /Noten kopieren/.test(x.textContent))));
    await p.evaluate(() => closeRoll()); await sleep(400); taps++;   // ✕ des Editors (hier per Funktion, zählt als 1 Tipp)
    const s = A0.free0[0];
    const cell = await at(s => document.querySelector(`.slot[data-t="0"][data-s="${s}"]`), s);
    // a) Halten auf den leeren Platz (nur Noten in der Ablage, kein ganzer Clip)
    await hold(cell);
    const cs = await p.evaluate(() => EL.clipSheet.classList.contains('open') ? [...EL.clipSheet.querySelectorAll('button')].filter(x => x.getClientRects().length).map(x => x.textContent.trim()) : null);
    log(tag + ' A2.halten-leerer-platz-nur-noten-in-ablage', {szene: s + 1, blatt: cs});
    await shot('a3-leerer-platz-gehalten');
    // b) Tipp auf den leeren Platz, dann ✎ (EL.bEdit) oben
    await tap(cell);
    const selAfter = await p.evaluate(() => ({selT: R.selT, selS: R.selS, playing: R.playing, rec: rec.state}));
    const eb = await at(() => EL.bEdit);
    log(tag + ' A2.tipp-leerer-platz', {selAfter, stift: eb});
    if (eb) await tap(eb); else { await p.evaluate(s => openRoll(0, s), s); taps++; }
    await sleep(500);
    const r1 = await p.evaluate(s => ({roll: !!ED.roll, at: ED.rollAt, clip: S.tracks[0].clips[s] ? {len: S.tracks[0].clips[s].len, n: S.tracks[0].clips[s].notes.length} : null}), s);
    await tap(await at(() => [...ED.roll.el.acts.children].find(x => /Noten einfügen/.test(x.textContent))));
    await shot('a4-einfuegen-geist');
    await tap(await at(() => [...ED.roll.el.acts.children].find(x => /✓ Einfügen/.test(x.textContent))));
    const r2 = await p.evaluate(s => { const c = S.tracks[0].clips[s], q = S.tracks[0].clips[0]; return c ? {len: c.len, n: c.notes.length, gleich: c.notes.map(x => x.n).join(',') === q.notes.slice(0, 3).map(x => x.n).join(','), quelleN: q.notes.length, key: c.key && c.key.src, ts: c.ts || null, quelleLen: q.len} : null; }, s);
    log(tag + ' A2.umweg-kopieren-einfuegen', {szene: s + 1, nachNeuerClip: r1, ergebnis: r2, tipps: taps, undo: await p.evaluate(() => UNDO.slice(-3).map(u => u.label || u.kind))});
    await p.evaluate(() => closeRoll()); await sleep(300);
    // A3 · Umweg 2: Clip-Blatt › Duplizieren → frei (ganzer Clip), danach im Editor den Rest löschen
    taps = 0;
    await p.evaluate(() => openClipSheet(0, 0)); taps++; await sleep(300);
    const cs2 = await p.evaluate(() => [...EL.clipSheet.querySelectorAll('button')].filter(x => x.getClientRects().length).map(x => x.textContent.trim()));
    await shot('a5-clip-blatt');
    const nBefore = await p.evaluate(() => S.tracks[0].clips.filter(Boolean).length);
    await tap(await at(() => [...EL.clipSheet.querySelectorAll('button')].find(x => x.getClientRects().length && /Duplizieren → frei/.test(x.textContent))));
    const d = await p.evaluate(() => { const L = S.tracks[0].clips.map((c, s) => c ? s : -1).filter(s => s >= 0); return {plaetze: L.map(s => s + 1), n: L.map(s => S.tracks[0].clips[s].notes.length)}; });
    log(tag + ' A3.duplizieren-frei', {knoepfe: cs2, vorher: nBefore, nachher: d, tipps: taps});
    await p.evaluate(() => { try { closeClipSheet(); } catch (e) {} });
    // A4 · Bereich im Lineal des Noten-Editors → [Zuschneiden] schneidet den Clip selbst (kein neuer Clip)
    const zs = await p.evaluate(() => { const L = (typeof lt === 'undefined') ? null : 1; openRoll(0, 0); const b = [...ED.roll.el.acts.children].find(x => /Zuschneiden/.test(x.textContent)); return b ? {title: b.title, hidden: b.hidden} : null; });
    log(tag + ' A4.zuschneiden', zs);
    await p.evaluate(() => closeRoll());
  }

  // ================= B · Drum-Schritt-Editor =================
  await p.evaluate(() => { const v = DRUM_VOICES.findIndex(x => x.id === 'hatC'); ED.dVoice = v; openRoll(DRUM_T, 0); }); await sleep(800);
  const B0 = await p.evaluate(() => { const sh = EL.drumSheet; if (!sh) return null; const bs = [...sh.querySelectorAll('button')].filter(x => x.getClientRects().length).map(x => x.textContent.trim()).filter(Boolean);
    return {knoepfe: bs.slice(0, 80), kopieren: bs.some(t => /kopier|einfüg|Dupl/i.test(t)), auslagern: !!sh.querySelector('.mtx3bdb')}; });
  log(tag + ' B.drum-editor', B0);
  await shot('b1-drum-editor');
  const bq = await at(() => EL.drumSheet.querySelector('.mtx3bdb'));
  if (bq) {
    await tap(bq); await sleep(250);
    const B1 = await p.evaluate(() => ({pop: UI.pop && UI.pop.name, knoepfe: UI.pop ? [...UI.pop.el.querySelectorAll('button')].map(x => x.textContent.trim().replace(/\s+/g, ' ')) : []}));
    log(tag + ' B.drum-auslagern-blatt', B1);
    await shot('b2-drum-auslagern');
    // „Nur diese Schritte“ antippen, um das Schritt-Raster zu sehen
    const st = await at(() => UI.pop && [...UI.pop.el.querySelectorAll('button')].find(x => /Nur diese Schritte/.test(x.textContent)));
    if (st) { await tap(st); await shot('b3-drum-auslagern-schritte'); const B2 = await p.evaluate(() => ({schritte: UI.pop ? UI.pop.el.querySelectorAll('[data-m3b="st"], .mtx3b-st button').length : 0, txt: UI.pop ? UI.pop.el.innerText.slice(0, 400) : ''})); log(tag + ' B.nur-schritte', B2); }
    await p.evaluate(() => closePop());
  }
  // ROLLE der Drums (Klavierrolle mit Pad-Namen): UX2 Kopieren/Einfügen da? Auslagern ▾ da?
  const B3 = await p.evaluate(() => { try { closeRoll(); } catch (e) {} ED.drumView = 'roll'; return null; });
  await p.evaluate(() => { try { closeRoll(); } catch (e) {} });

  // ================= C · Spektral =================
  if (W === 428 || W === 926 && H === 428) {
    await p.evaluate(async () => {
      await __spk.page.open({}); const sr = 44100, sec = 16, n = sec * sr, x = new Float32Array(n);
      for (let i = 0; i < n; i++) { const t = i / sr, bt = Math.floor(t * 2); x[i] = 0.25 * Math.sin(2 * Math.PI * (bt % 2 ? 220 : 247) * t) * (1 - (t * 2 % 1) * .6) + 0.15 * Math.sin(2 * Math.PI * 659 * t) * ((t % 4) < 2 ? 1 : 0); }
      const r = await __spk.load({name: 'Zwei Stimmen', sr, ch: [x]}); await __spk.page.open({id: r.meta.id});
    });
    await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat); }, null, {timeout: 120000}); await sleep(600);
    const C0 = await p.evaluate(() => { const U = __spk.page.ui(); U.sel = [{art: 'rect', t0: 2, t1: 6, f0: 180, f1: 300, kt: 0, kf: 0}]; spk1SelDone(U); const sh = document.querySelector('#spk1Sheet');
      return {knoepfe: [...sh.querySelectorAll('button')].filter(x => x.getClientRects().length && !x.disabled).map(x => (x.getAttribute('aria-label') || x.textContent || '').trim().slice(0, 40)).filter(Boolean), stat: __spk.page.info().stat}; });
    log(tag + ' C.spektral-mit-auswahl', C0);
    await shot('c1-spektral-auswahl');
    // Ansicht ▾ → Szenen anlegen … / Loop
    const av = await at(() => [...document.querySelectorAll('#spk1Sheet button')].find(x => /^Ansicht/.test((x.textContent || '').trim())));
    if (av) { await tap(av); await sleep(250); const C1 = await p.evaluate(() => { const d = document.querySelector('#spk1Sheet .spk1-dd'); return d ? [...d.querySelectorAll('button, h5')].map(x => x.textContent.trim()).slice(0, 60) : null; }); log(tag + ' C.ansicht-dd', C1); await shot('c2-spektral-ansicht'); await p.evaluate(() => spk1Dd(__spk.page.ui(), null)); }
    // Formen aus SPK12 (Ellipse, Lasso, Zauberstab, −) beim MIDI-Teil von „Szenen anlegen“ (spk11InSel)
    const C2 = await p.evaluate(() => { const U = __spk.page.ui(), keep = U.sel, f = 247, t = 4, r = {};
      const T = (nm, sel) => { U.sel = sel; r[nm] = spk11InSel(U, t, f); };
      T('rechteck', [{art: 'rect', t0: 2, t1: 6, f0: 180, f1: 300}]);
      T('ellipse', [{art: 'ell', t0: 2, t1: 6, f0: 180, f1: 300}]);
      T('lasso', [{art: 'lasso', t0: 2, t1: 6, f0: 180, f1: 300, pts: [[2, 180], [6, 180], [6, 300], [2, 300]]}]);
      T('zauberstab', [{art: 'wand', t0: 2, t1: 6, f0: 180, f1: 300}]);
      T('rechteck-minus-gleiches-rechteck', [{art: 'rect', t0: 2, t1: 6, f0: 180, f1: 300}, {art: 'rect', t0: 2, t1: 6, f0: 180, f1: 300, op: 'sub'}]);
      T('umkehren-des-rechtecks', [{art: 'rect', t0: 2, t1: 6, f0: 180, f1: 300}, {art: 'inv'}]);
      U.sel = keep; spk1SelDone(U); return r; });
    log(tag + ' C.spk11InSel(Note 4 s / 247 Hz)', C2);
    // Loop setzen (Takt 1–4) → Ebenen-Liste zeigt „In die Matrix ▾“
    const C3 = await p.evaluate(() => { const U = __spk.page.ui(); SYNQUENZER.spk && 0; spk2LpSet(U, 0, 4); spk1Layers(U); const b = document.querySelector('#spk1Sheet .spk2-mx'); return {loop: spk2Lp(U), knopf: b ? b.getAttribute('aria-label') : null}; });
    log(tag + ' C.loop', C3);
    const mx = await at(() => document.querySelector('#spk1Sheet .spk2-mx'));
    if (mx) { await tap(mx); await sleep(250); const C4 = await p.evaluate(() => { const d = document.querySelector('#spk1Sheet .spk1-dd'); return d ? [...d.querySelectorAll('button, h5, p')].map(x => x.textContent.trim()).slice(0, 40) : null; }); log(tag + ' C.in-die-matrix-dd', C4); await shot('c3-loop-in-die-matrix'); }
  }
  log(tag + ' konsole', errs.slice(0, 5));
  await ctx.close();
}
await b.close(); srv.close();
fs.writeFileSync(path.join(here, 'clip0-ergebnis.json'), JSON.stringify(out, null, 1));
