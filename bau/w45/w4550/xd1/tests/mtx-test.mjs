// MTX – Clip-Matrix: Ziehen über alle Zeilen (Rand = blättern), Wahl beim Ablegen, Szene / Spur duplizieren.
// Aufruf: node mtx-test.mjs <index.html> <ausgabeordner> [basis.html]   (absolute Pfade; Basis zum Vergleich, sonst w4500/basis.html)
// Echte Touch-Ereignisse über CDP (iPhone 12 Pro Max: 428×926 hochkant, 926×428 und 926×370 quer). Fotos: mtx-*.png
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2], dir = process.argv[3];
const basis = process.argv[4] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4500/basis.html';
if (!file || !dir) { console.log('Aufruf: node mtx-test.mjs <index.html> <ausgabeordner> [basis.html]'); process.exit(2); }
const b = await chromium.launch();
const res = []; const ok = (name, cond, info) => { res.push({name, ok: !!cond}); console.log((cond ? 'OK     ' : 'FEHLER ') + name + (info !== undefined ? ' · ' + JSON.stringify(info) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function open(w, h, f) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (f || file)); await p.waitForTimeout(1600);
  const cdp = await ctx.newCDPSession(p);
  const T = {
    async down(x, y, id = 1) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id}]}); },
    async to(x0, y0, x, y, steps = 8, id = 1) { for (let k = 1; k <= steps; k++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x0 + (x - x0) * k / steps, y: y0 + (y - y0) * k / steps, id}]}); await sleep(16); } },
    async up() { await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); },
    async raw(type, pts) { await cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts}); },
    async tap(x, y) { await this.down(x, y); await sleep(60); await this.up(); await sleep(150); },
    async hold(x, y, ms = 650) { await this.down(x, y); await sleep(ms); await this.up(); await sleep(150); },
  };
  return {ctx, p, errs, T};
}
const R_ = (p, fn, arg) => p.evaluate(([src, a]) => { const e = (0, eval)(src)(a); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2}; }, [fn.toString(), arg]);
const cellR = (p, t, s) => R_(p, a => UI.cells[a[0]][a[1]].el, [t, s]);
const scnR = (p, s) => R_(p, a => UI.scenes[a], s);
const headR = (p, i) => R_(p, a => UI.heads[a].el, i);
const stopR = (p, i) => R_(p, a => UI.stops[a], i);
const popBtn = (p, sel) => R_(p, a => (UI.pop && UI.pop.el ? UI.pop.el.querySelector(a) : null), sel);
const sig = (p, t, s) => p.evaluate(([t, s]) => { const c = S.tracks[t] && S.tracks[t].clips[s]; return c ? c.len + ':' + c.notes.map(n => n.t + '/' + n.n).join(',') : null; }, [t, s]);
const info = p => p.evaluate(() => SYNQUENZER.mtx.info());
const popName = p => p.evaluate(() => (UI.pop ? UI.pop.name : null));
// Clip halten, abheben, über Wegpunkte ziehen (je Wegpunkt optional verweilen), dann loslassen
async function drag(T, from, pts, opt = {}) {
  await T.down(from.cx, from.cy); await sleep(620);
  let x = from.cx, y = from.cy;
  for (const q of pts) { await T.to(x, y, q.x, q.y, q.steps || 10); x = q.x; y = q.y; if (q.wait) await sleep(q.wait); }
  if (opt.before) await opt.before();
  if (!opt.keep) { await T.up(); await sleep(200); }
}
// Lage-Prüfung eines offenen Blatts: im Bild mit 8 px Rand (MTX-P, Befund 3), ✕ sichtbar, Tasten ≥ 44 px
async function popCheck(p, label) {
  const r = await p.evaluate(() => {
    const P = UI.pop && UI.pop.el; if (!P) return null;
    const q = P.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    const x = [...P.querySelectorAll('button')].find(b => (b.textContent || '').trim() === '✕' && b.getClientRects().length);
    const xr = x ? x.getBoundingClientRect() : null;
    const small = [...P.querySelectorAll('button')].filter(b => b.getClientRects().length && !b.disabled && !b.classList.contains('ux1-px')).map(b => b.getBoundingClientRect()).filter(r => r.height < 43.5 || r.width < 43.5).length;
    return {in: q.left >= 7.5 && q.top >= 7.5 && q.right <= vw - 7.5 && q.bottom <= vh - 7.5, box: [Math.round(q.left), Math.round(q.top), Math.round(q.right), Math.round(q.bottom)], x: !!xr && xr.top >= 0 && xr.right <= vw && xr.width >= 40 && xr.height >= (x.classList.contains('ux1-px') ? 36 : 40), small};
  });
  ok(label + ': Blatt ganz im Bild (8 px Rand), ✕ sichtbar, Tasten ≥ 44 px', r && r.in && r.x && r.small === 0, r);
}

// ======================= hochkant 428 × 926 =======================
{
  const {ctx, p, errs, T} = await open(428, 926);
  await p.evaluate(() => { addTrack(); addTrack(); selectTrack(0); setSceneBank(0); if (typeof hideToast === 'function') hideToast(); });
  await sleep(300);
  // Ausgang: Synth 1 · Szene 6 hat einen Clip (Kopie von Szene 1), Szenen-Bank 5–8 sichtbar
  await p.evaluate(() => { SYNQUENZER.ux2Copy(0, 0, 0, 5); setSceneBank(1); });
  await sleep(250);
  const s06 = await sig(p, 0, 5), s00 = await sig(p, 0, 0);
  ok('Hochkant: Szenen-Bank 5–8 sichtbar, Clip in Synth 1 · Szene 6', (await info(p)).banks.s === 1 && !!s06, (await info(p)).banks);

  // 1 · Rand links = Szenen 1–4: Clip aus Szene 6 über die Spurköpfe ziehen, verweilen, dann auf Synth 2 · Szene 3 (leer)
  await p.evaluate(() => { S.tracks[1].clips[2] = null; clipRestored(1, 2); });
  const c6 = await cellR(p, 0, 5), h1 = await headR(p, 1), c5 = await cellR(p, 1, 4);
  await drag(T, c6, [{x: c5.cx, y: c5.cy}, {x: h1.x + h1.w * .5, y: h1.cy, steps: 2, wait: 60}], {keep: true});
  const mid = await info(p), shown = await p.evaluate(() => !!document.querySelector('.mtx-ez') && /Szenen 1–4/.test((document.querySelector('.mtx-el') || {}).textContent || ''));
  await sleep(450);
  const aft = await info(p);
  ok('Rand links: Balken + Schild „Szenen 1–4“ erscheinen beim Verweilen', mid.edge === 'left:0' && shown, mid.edge);
  ok('Rand links: nach 0,38 s blättert die Matrix auf Szenen 1–4', aft.banks.s === 0 && aft.flips === 1 && aft.lastFlip.dir === 'left', aft.lastFlip);
  let d3 = await cellR(p, 1, 2);
  await T.to(h1.x + h1.w * .5, h1.cy, d3.cx, d3.cy, 10); await sleep(80);
  const ux = await p.evaluate(() => SYNQUENZER.ux2Info().drag);
  const badge = await p.evaluate(() => { const b = document.querySelector('.ux2gh .ux2bd'); return b ? b.textContent : ''; });
  ok('Ziel nach dem Blättern: Synth 2 · Szene 3, Abzeichen „loslassen = Wahl“', ux && ux.tg && ux.tg.b.t === 1 && ux.tg.b.s === 2 && badge === 'loslassen = Wahl', {tg: ux && ux.tg, badge});
  await T.up(); await sleep(250);
  ok('Loslassen = Blatt „Clip ablegen“ (nichts geändert, Anzeige weg)', await popName(p) === 'mtxdrop' && await sig(p, 0, 5) === s06 && !(await sig(p, 1, 2)) && await p.evaluate(() => !document.querySelector('.mtx-ez')));
  const labs = await p.evaluate(() => [...UI.pop.el.querySelectorAll('[data-mtx]')].map(b => b.dataset.mtx).join(','));
  ok('Freier Platz: Wahl Verschieben │ Kopieren (+ ✕)', labs === 'no,m,c', labs);
  await p.screenshot({path: dir + '/mtx-wahl-hochkant.png'});
  await popCheck(p, 'Wahl hochkant');
  let bt = await popBtn(p, '[data-mtx="c"]'); await T.tap(bt.cx, bt.cy);
  ok('Kopieren: Original bleibt, Kopie in Synth 2 · Szene 3', await sig(p, 0, 5) === s06 && await sig(p, 1, 2) === s06 && await popName(p) === null);
  await p.evaluate(() => undo()); await sleep(150);
  ok('↶ nimmt die Kopie zurück', !(await sig(p, 1, 2)) && await sig(p, 0, 5) === s06);

  // 2 · Belegter Platz: Tauschen │ Kopieren │ Verschieben (ersetzt)
  const s10 = await sig(p, 1, 0);
  let c = await cellR(p, 0, 0); d3 = await cellR(p, 1, 0);
  await drag(T, c, [{x: d3.cx, y: d3.cy}]);
  const labs2 = await p.evaluate(() => (UI.pop ? [...UI.pop.el.querySelectorAll('[data-mtx]')].map(b => b.dataset.mtx).join(',') : ''));
  ok('Belegter Platz: Wahl Tauschen │ Kopieren │ Verschieben (+ ✕)', labs2 === 'no,x,c,m', labs2);
  bt = await popBtn(p, '[data-mtx="x"]'); await T.tap(bt.cx, bt.cy);
  ok('Tauschen: beide Clips getauscht', await sig(p, 0, 0) === s10 && await sig(p, 1, 0) === s00);
  await p.evaluate(() => undo()); await sleep(150);
  ok('↶ Tausch zurück', await sig(p, 0, 0) === s00 && await sig(p, 1, 0) === s10);
  await drag(T, c, [{x: d3.cx, y: d3.cy}]);
  bt = await popBtn(p, '[data-mtx="m"]'); await T.tap(bt.cx, bt.cy);
  ok('Verschieben auf belegt: Clip dort ersetzt, Quelle leer', await sig(p, 1, 0) === s00 && !(await sig(p, 0, 0)));
  const u1 = await p.evaluate(() => UNDO.length); await p.evaluate(() => undo()); await sleep(150);
  ok('↶ EIN Schritt holt beide zurück', await sig(p, 0, 0) === s00 && await sig(p, 1, 0) === s10, {u1});
  await p.evaluate(() => redo()); await sleep(100);
  const rr = [await sig(p, 1, 0) === s00, !(await sig(p, 0, 0))]; await p.evaluate(() => undo()); await sleep(100);
  ok('↷ wiederholt das Ersetzen, ↶ wieder zurück', rr[0] && rr[1] && await sig(p, 0, 0) === s00 && await sig(p, 1, 0) === s10);
  await drag(T, c, [{x: d3.cx, y: d3.cy}]);
  bt = await popBtn(p, '[data-mtx="no"]'); await T.tap(bt.cx, bt.cy);
  ok('✕ = nichts passiert', await sig(p, 0, 0) === s00 && await sig(p, 1, 0) === s10 && await popName(p) === null && await p.evaluate(() => !document.querySelector('.slot.mtx-tgt,.slot.mtx-src')));

  // 3 · Kurzgriff: zweiter Finger = sofort Kopie, ohne Frage
  c = await cellR(p, 2, 0); d3 = await cellR(p, 3, 3); const s20 = await sig(p, 2, 0);
  await T.raw('touchStart', [{x: c.cx, y: c.cy, id: 1}]); await sleep(620);
  for (let k = 1; k <= 8; k++) { await T.raw('touchMove', [{x: c.cx + (d3.cx - c.cx) * k / 8, y: c.cy + (d3.cy - c.cy) * k / 8, id: 1}]); await sleep(16); }
  await T.raw('touchStart', [{x: d3.cx, y: d3.cy, id: 1}, {x: 214, y: 880, id: 2}]); await sleep(40);
  await T.raw('touchEnd', [{x: d3.cx, y: d3.cy, id: 1}]); await sleep(40); await T.raw('touchEnd', []); await sleep(200);
  ok('Zweiter Finger = sofort Kopie (kein Blatt)', await sig(p, 3, 3) === s20 && await sig(p, 2, 0) === s20 && await popName(p) === null);
  await p.evaluate(() => undo()); await sleep(100);

  // 4 · Einstellung „Nie fragen“: wie bisher (leer = verschieben)
  await p.evaluate(() => SYNQUENZER.mtx.askSet(false));
  c = await cellR(p, 2, 1); d3 = await cellR(p, 2, 3); const s21 = await sig(p, 2, 1);
  await drag(T, c, [{x: d3.cx, y: d3.cy}]);
  ok('Nie fragen: leere Zelle = sofort verschoben (wie UX2)', await popName(p) === null && await sig(p, 2, 3) === s21 && !(await sig(p, 2, 1)));
  await p.evaluate(() => undo()); await sleep(100);
  await p.evaluate(() => { openMenu(); }); await sleep(300);
  const mrow = await p.evaluate(() => { const r = document.querySelector('.mtx-mr'); return r ? {txt: r.textContent, on: r.querySelector('.seg .on') ? r.querySelector('.seg .on').textContent : ''} : null; });
  ok('Menü › Bedienung › Clip ablegen zeigt „Nie fragen“', mrow && /Clip ablegen/.test(mrow.txt) && mrow.on === 'Nie fragen', mrow);
  const mb = await R_(p, () => [...document.querySelectorAll('.mtx-mr .seg button')][0]);
  await p.evaluate(() => { const b = [...document.querySelectorAll('.mtx-mr .seg button')][0]; b.scrollIntoView({block: 'center'}); });
  const mb2 = await R_(p, () => [...document.querySelectorAll('.mtx-mr .seg button')][0]);
  await T.tap(mb2.cx, mb2.cy);
  ok('Menü: „Immer fragen“ antippen schaltet zurück (Taste ≥ 44 px)', await p.evaluate(() => SYNQUENZER.mtx.info().askOn) && mb && mb.h >= 44, mb && mb.h);
  await p.evaluate(() => closeMenu()); await sleep(250);

  // 5 · Bisherige Gesten bleiben: Clip halten ohne Bewegung = Clip-Blatt
  c = await cellR(p, 0, 0);
  await T.hold(c.cx, c.cy, 650); await sleep(150);
  ok('Clip halten + loslassen öffnet weiter das Clip-Blatt', await p.evaluate(() => R.editor === 'clip' && EL.clipSheet.classList.contains('open')));
  await p.evaluate(() => closeClipSheet()); await sleep(600);

  // 6 · Szene duplizieren: Kopf halten → Blatt. Gestoppt startet der Druck wie immer beim Aufsetzen (UX2, Prüfung Befund 2);
  //     beim Abspielen wartet der Start bis zum Loslassen (gleicher Taktstrich), Halten startet nichts (Befund 1)
  await p.evaluate(() => { if (R.playing) stop(); setSceneBank(0); S.scenes[1].name = 'Break'; }); await sleep(150);
  const before2 = await p.evaluate(() => S.tracks.map(tr => tr.clips[1] ? JSON.stringify(cleanClip(tr.clips[1])) : null));
  const free = await p.evaluate(() => SYNQUENZER.mtx.sceneFree(1));
  let sc = await scnR(p, 1);
  await T.down(sc.cx, sc.cy + 4); await sleep(40);
  const st0 = await p.evaluate(() => ({playing: R.playing, selS: R.selS}));
  await sleep(610);
  const st = await p.evaluate(() => ({pop: UI.pop ? UI.pop.name : null, playing: R.playing}));
  await T.up(); await sleep(200);
  const st1 = await p.evaluate(() => ({playing: R.playing}));
  // XD1-Anpassung (Xander/XD1 Punkt 3): gestoppt startet der Kopf erst beim Loslassen (Tipp); Halten öffnet nur das Blatt, nichts startet
  ok('Gestoppt (XD1): der Druck auf den Kopf startet nichts, Halten öffnet nur das Blatt – auch nach dem Loslassen läuft nichts', !st0.playing && !st.playing && !st1.playing, {st0, st, st1});
  ok('Szenen-Kopf halten = Blatt „Szene 2“', st.pop === 'mtxscn', st);
  await p.evaluate(() => stop()); await sleep(300);
  await p.screenshot({path: dir + '/mtx-szene-hochkant.png'});
  await popCheck(p, 'Szenen-Blatt hochkant');
  bt = await popBtn(p, '[data-mtx="dup"]');
  const btxt = await p.evaluate(() => UI.pop.el.querySelector('[data-mtx="dup"]').textContent);
  ok('Knopf zeigt das Ziel („Szene duplizieren → ' + (free + 1) + '“)', btxt === 'Szene duplizieren → ' + (free + 1), btxt);
  await T.tap(bt.cx, bt.cy);
  const after2 = await p.evaluate(k => S.tracks.map(tr => tr.clips[k] ? JSON.stringify(cleanClip(tr.clips[k])) : null), free);
  ok('Szene duplizieren: alle Clips gleich, Name „Break 2“', JSON.stringify(after2) === JSON.stringify(before2) && await p.evaluate(k => S.scenes[k].name, free) === 'Break 2' && before2.filter(Boolean).length >= 2, {free, n: before2.filter(Boolean).length});
  await p.evaluate(k => { const c = S.tracks.find(tr => tr.clips[k] && tr.kind === 'synth').clips[k]; c.notes[0].n += 1; }, free);
  ok('Kopie unabhängig (Note in der Kopie geändert, Original gleich)', JSON.stringify(await p.evaluate(() => S.tracks.map(tr => tr.clips[1] ? JSON.stringify(cleanClip(tr.clips[1])) : null))) === JSON.stringify(before2));
  await p.evaluate(k => { const c = S.tracks.find(tr => tr.clips[k] && tr.kind === 'synth').clips[k]; c.notes[0].n -= 1; }, free);
  const uids = await p.evaluate(k => [S.scenes[1].uid, S.scenes[k].uid], free);
  ok('Szenen-Kennungen bleiben getrennt', uids[0] !== uids[1], uids);
  await p.evaluate(() => undo()); await sleep(150);
  ok('↶ EIN Schritt: Ziel-Szene wieder leer mit altem Namen', await p.evaluate(k => S.tracks.every(tr => !tr.clips[k]) && S.scenes[k].name === 'Szene ' + (k + 1), free));
  await p.evaluate(() => redo()); await sleep(100);
  ok('↷ bringt die Kopie zurück', JSON.stringify(await p.evaluate(k => S.tracks.map(tr => tr.clips[k] ? JSON.stringify(cleanClip(tr.clips[k])) : null), free)) === JSON.stringify(before2));
  await p.evaluate(() => undo()); await sleep(100);
  sc = await scnR(p, 0);
  await T.down(sc.cx, sc.cy + 4); await sleep(40);
  const tp = await p.evaluate(() => R.playing);
  await T.up(); await sleep(250);
  // XD1-Anpassung: Start beim Loslassen statt beim Aufsetzen (Tipp)
  ok('Tipp auf den Kopf (gestoppt, XD1): beim Aufsetzen nichts, beim Loslassen startet die Szene', !tp && await p.evaluate(() => R.playing && R.selS === 0));
  // beim Abspielen: wartet bis der nächste Taktstrich im Fenster [lo, hi] s liegt
  const waitBar = (lo, hi) => p.evaluate(([lo, hi]) => new Promise(res => { const t0 = performance.now(); (function f() { const d = b2t(nextBarFromAudible()) - AU.ctx.currentTime; if ((d >= lo && d <= hi) || performance.now() - t0 > 8000) res(+d.toFixed(3)); else setTimeout(f, 4); })(); }), [lo, hi]);
  await sleep(400);
  const slot0 = await p.evaluate(() => R.slot.slice());
  sc = await scnR(p, 1);
  let dBar = await waitBar(1.0, 99);
  await T.down(sc.cx, sc.cy + 4); await sleep(650);
  const pl = await p.evaluate(() => ({pop: UI.pop ? UI.pop.name : null, playing: R.playing, pend: R.pend.map(x => (x ? x.slot : null)), hold: SYNQUENZER.mtx.info().hold}));
  await T.up(); await sleep(150);
  ok('Läuft die Wiedergabe: Szene 2 halten öffnet das Blatt, kein Start wartet (Prüfung Befund 1)', pl.pop === 'mtxscn' && pl.playing && pl.pend.every(x => x == null), Object.assign({dBar}, pl));
  const bx = await popBtn(p, '[data-mtx="no"]'); await T.tap(bx.cx, bx.cy); await sleep(2500);
  const pl2 = await p.evaluate(() => ({pop: UI.pop ? UI.pop.name : null, playing: R.playing, selS: R.selS, slot: R.slot.slice(), pend: R.pend.some(Boolean)}));
  ok('Nach ✕ und 2,5 s spielt weiter Szene 1 (Szene 2 startete nicht)', !pl2.pop && pl2.playing && pl2.selS === 0 && JSON.stringify(pl2.slot) === JSON.stringify(slot0) && !pl2.pend, pl2);
  // Tipp beim Abspielen: Start beim Loslassen, aber am selben Taktstrich wie beim Druck
  dBar = await waitBar(1.0, 99);
  const bar0 = await p.evaluate(() => nextBarFromAudible());
  await T.down(sc.cx, sc.cy + 4); await sleep(60);
  const tpMid = await p.evaluate(() => R.pend.some(Boolean));
  await T.up(); await sleep(60);
  const tpAft = await p.evaluate(() => R.pend.filter(Boolean).map(x => [x.slot, x.beat]));
  ok('Tipp beim Abspielen: Start beim Loslassen, am selben Taktstrich wie beim Druck (klingt gleich)', !tpMid && tpAft.some(x => x[0] === 1) && tpAft.every(x => Math.abs(x[1] - bar0) < 1e-6), {dBar, bar0, tpAft});
  await sleep(2600);
  ok('… Szene 2 spielt danach', await p.evaluate(() => R.playing && R.selS === 1 && !R.pend.some(Boolean) && S.tracks.every((tr, i) => R.slot[i] === (tr.clips[1] ? 1 : -1))));
  // knapp vor dem Taktstrich (< 0,35 s) startet der Druck wie immer beim Aufsetzen
  sc = await scnR(p, 0);
  dBar = await waitBar(.06, .28);
  await T.down(sc.cx, sc.cy + 4); await sleep(10);
  const nb = await p.evaluate(() => R.selS === 0 && (R.pend.some(x => x && x.slot === 0) || S.tracks.some((tr, i) => tr.clips[0] && R.slot[i] === 0)));
  await T.up(); await sleep(150);
  ok('Knapp vor dem Taktstrich (< 0,35 s): der Druck startet wie immer beim Aufsetzen', nb, {dBar});
  await p.evaluate(() => { closePop(); stop(); }); await sleep(300);

  // 7 · Spur duplizieren: ■ der Spurzeile halten → Spur-Blatt → [Spur duplizieren]
  await p.evaluate(() => { removeTrack(); }); await sleep(250);         // 7 Spuren: Platz für eine
  const nt0 = await p.evaluate(() => NT());
  const src1 = await p.evaluate(() => ({snd: JSON.stringify(S.tracks[1].sound), clips: JSON.stringify(S.tracks[1].clips.map(cleanClip)), song: JSON.stringify(S.song), parts: JSON.stringify(S.parts)}));
  let sr = await stopR(p, 1);
  await T.hold(sr.cx, sr.cy, 650); await sleep(150);
  ok('■ halten = Spur-Blatt mit [Spur duplizieren]', await popName(p) === 'track' && !!(await popBtn(p, '[data-mtx="dup"]')));
  await popCheck(p, 'Spur-Blatt hochkant');
  { const tw = await p.evaluate(() => { const P = UI.pop.el, a = P.getBoundingClientRect(); popFit(P); popFit(P); const c = P.getBoundingClientRect(), r2 = P.querySelector('.mtxtr');
      return {a: [Math.round(a.left), Math.round(a.right)], b: [Math.round(c.left), Math.round(c.right)], own: !!r2 && r2.children.length === 1 && !!r2.querySelector('[data-mtx="dup"]')}; });
    ok('Spur-Blatt hochkant: [Spur duplizieren] in eigener Zeile, Breite bleibt beim erneuten Einpassen (Prüfung Befund 3)', tw.own && tw.a[0] === tw.b[0] && tw.a[1] === tw.b[1], tw); }
  bt = await popBtn(p, '[data-mtx="dup"]'); await T.tap(bt.cx, bt.cy); await sleep(250);
  const dup = await p.evaluate(n => ({nt: NT(), snd: JSON.stringify(S.tracks[n].sound), clips: JSON.stringify(S.tracks[n].clips.map(cleanClip)), name: S.tracks[n].name, ord: trackOrder().slice(), uid: [S.tracks[1].uid, S.tracks[n].uid], song: JSON.stringify(S.song), parts: JSON.stringify(S.parts), rowNames: [...document.querySelectorAll('#clipGrid .th:not(.mxoff) .nm')].map(x => x.textContent)}), nt0);
  ok('Spur duplizieren: neue Spur mit gleichem Klang und allen Clips', dup.nt === nt0 + 1 && dup.snd === src1.snd && dup.clips === src1.clips && JSON.parse(src1.clips).filter(Boolean).length >= 1, {nt: dup.nt, name: dup.name});
  ok('Neue Spur steht direkt unter dem Original, eigene Kennung', dup.ord[dup.ord.indexOf(1) + 1] === nt0 && dup.uid[0] !== dup.uid[1], dup.ord);
  ok('Song und Teile unverändert (klingt gleich)', dup.song === src1.song && dup.parts === src1.parts.replace(/x/g, 'x'));
  await p.evaluate(n => { S.tracks[n].clips.find(Boolean).notes[0].n += 2; S.tracks[n].sound.fx.vol = .3; }, nt0);
  ok('Kopie unabhängig (Note und Lautstärke der Kopie geändert, Original gleich)', await p.evaluate(() => JSON.stringify(S.tracks[1].clips.map(cleanClip))) === src1.clips && await p.evaluate(() => JSON.stringify(S.tracks[1].sound)) === src1.snd);
  await p.evaluate(() => undo()); await sleep(250);
  ok('↶ EIN Schritt: Spur weg, Reihenfolge wie vorher', await p.evaluate(() => NT()) === nt0 && await p.evaluate(() => trackOrder().indexOf(DRUM_T) === NT() - 1));
  await p.evaluate(() => redo()); await sleep(250);
  ok('↷ bringt die Spur mit Klang und Clips zurück (unter dem Original)', await p.evaluate(n => NT() === n + 1 && trackOrder()[trackOrder().indexOf(1) + 1] === n, nt0));
  await p.evaluate(() => undo()); await sleep(250);
  // DRUMS / STIMME: kein Knopf
  sr = await stopR(p, 4); await T.hold(sr.cx, sr.cy, 650); await sleep(150);
  ok('DRUMS: kein [Spur duplizieren] (gibt es nur einmal)', await popName(p) === 'track' && !(await popBtn(p, '[data-mtx="dup"]')));
  await p.evaluate(() => closePop()); await sleep(150);

  // 8 · Guide „Wo finde ich …?“
  const g = await p.evaluate(() => { const L = ui1Entries(); const f = id => L.find(x => x.id === id); return {scn: !!f('mtxscn'), trk: !!f('mtxtrk'), ask: !!f('mtxask'), drag: (f('clipdrag') || {}).d, tr: (f('trsheet') || {}).d}; });
  ok('Guide: Szene duplizieren, Spur duplizieren, Clip ablegen; Clip ziehen / Spur-Blatt nachgezogen', g.scn && g.trk && g.ask && /Wahl/.test(g.drag) && /Spur duplizieren/.test(g.tr), g);
  const gj = await p.evaluate(() => { const L = ui1Entries(); const e = L.find(x => x.id === 'mtxtrk'); const okGo = e.go(); const q = typeof e.q === 'function' ? e.q() : null; const r = !!(okGo && q); closePop(); return r; });
  ok('Guide-Sprung „Spur duplizieren“ öffnet das Spur-Blatt am Knopf', gj);
  const gs = await p.evaluate(() => { const L = ui1Entries(); const e = L.find(x => x.id === 'mtxscn'); const okGo = e.go(); const q = typeof e.q === 'function' ? e.q() : null; const r = !!(okGo && q); closePop(); return r; });
  ok('Guide-Sprung „Szene duplizieren“ öffnet das Szenen-Blatt', gs);
  ok('Hochkant: keine Fehler im Browser', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}

// ======================= Spur-Seiten: quer 926 × 428 / 926 × 370 und hochkant 428 × 746 (Safari mit Leisten) =======================
for (const [W, H] of [[926, 428], [926, 370], [428, 746]]) {
  const L = (W > H ? 'Quer ' : 'Hochkant ') + W + '×' + H;
  const {ctx, p, errs, T} = await open(W, H);
  await p.evaluate(() => { addTrack(); addTrack(); });
  await sleep(300);
  // Zeile 7 = Synth 6 (Index 7) bekommt einen Clip; Seite 2 sichtbar
  await p.evaluate(() => { SYNQUENZER.ux2Copy(1, 1, 7, 2); S.tracks[0].clips[3] = null; clipRestored(0, 3); setTrackBank(1); if (typeof hideToast === 'function') hideToast(); });
  await sleep(250);
  const I0 = await info(p), row7 = await p.evaluate(() => trackOrder().indexOf(7) + 1);
  ok(`${L}: zwei Spur-Seiten, Seite 2 sichtbar, Synth 6 ist Zeile 7`, I0.banks.bankT && I0.banks.t === 1 && row7 === 7, {pages: I0.banks.pages});
  const s72 = await sig(p, 7, 2);
  const c7 = await cellR(p, 7, 2), sh = await scnR(p, 3);
  // nach oben über die Szenen-Köpfe, verweilen → Seite 1, dann auf Synth 1 · Szene 4 (leer)
  await drag(T, c7, [{x: sh.cx, y: sh.cy, wait: 170}], {keep: true});
  const mid = Object.assign(await info(p), {lab: await p.evaluate(() => { const e = document.querySelector('.mtx-el span'); return e ? e.textContent : ''; })});
  if (W === 926 && H === 428) await p.screenshot({path: dir + '/mtx-rand-quer.png'});
  await sleep(450);
  const aft = await info(p);
  ok(`${L}: Rand oben zeigt „Synth 1 – Synth 4“ und blättert auf Seite 1`, mid.edge === 'up:0' && mid.lab === 'Synth 1 – Synth 4' && aft.banks.t === 0 && aft.lastFlip && aft.lastFlip.dir === 'up', {mid: mid.edge, t: aft.banks.t});
  const tgt = await cellR(p, 0, 3);
  await T.to(sh.cx, sh.cy, tgt.cx, tgt.cy, 10); await sleep(80);
  const ux = await p.evaluate(() => SYNQUENZER.ux2Info().drag);
  await T.up(); await sleep(250);
  ok(`${L}: Ziel Synth 1 · Szene 4 erreicht, Wahl-Blatt offen`, ux && ux.tg && ux.tg.b.t === 0 && ux.tg.b.s === 3 && await popName(p) === 'mtxdrop', ux && ux.tg);
  await popCheck(p, `Wahl quer ${W}×${H}`);
  const bt = await popBtn(p, '[data-mtx="m"]'); await T.tap(bt.cx, bt.cy);
  ok(`${L}: Clip von Zeile 7 nach Zeile 1 verschoben`, await sig(p, 0, 3) === s72 && !(await sig(p, 7, 2)));
  await p.evaluate(() => undo()); await sleep(150);
  ok(`${L}: ↶ zurück in Zeile 7`, await sig(p, 7, 2) === s72 && !(await sig(p, 0, 3)));
  // unten: von Seite 1 unter DRUMS ziehen → Seite 2
  await p.evaluate(() => setTrackBank(0)); await sleep(150);
  const c1 = await cellR(p, 1, 0), dh = await headR(p, 4);
  const yb = Math.min(H - 6, dh.y + dh.h + 14);
  await drag(T, c1, [{x: c1.cx, y: yb, wait: 600}], {keep: true});
  const dn = await info(p);
  ok(`${L}: unter DRUMS verweilen blättert auf Seite 2`, dn.banks.t === 1 && dn.lastFlip && dn.lastFlip.dir === 'down', {t: dn.banks.t, lf: dn.lastFlip, yb});
  const t6 = await cellR(p, 6, 1);
  await T.to(c1.cx, yb, t6.cx, t6.cy, 10); await sleep(60); await T.up(); await sleep(250);
  ok(`${L}: Ziel auf Seite 2 (Synth 5 · Szene 2) → Wahl-Blatt`, await popName(p) === 'mtxdrop' && await p.evaluate(() => SYNQUENZER.mtx.info().ask && SYNQUENZER.mtx.info().ask.b.t === 6 && SYNQUENZER.mtx.info().ask.b.s === 1));
  await p.evaluate(() => closePop()); await sleep(150);
  // Spur ziehen (UX2-Rand) blättert ebenfalls: Synth 6 von Seite 2 nach oben
  await p.evaluate(() => setTrackBank(1)); await sleep(150);
  const ord0 = await p.evaluate(() => trackOrder().slice());
  const h7 = await headR(p, 7);
  await T.down(h7.x + 4, h7.cy); await T.to(h7.x + 4, h7.cy, h7.x + 34, h7.cy + 1, 4);
  await T.to(h7.x + 34, h7.cy + 1, h7.x + 34, (await scnR(p, 2)).cy, 8); await sleep(600);
  const tf = await info(p);
  const h0 = await headR(p, 0);
  await T.to(h7.x + 34, (await scnR(p, 2)).cy, h7.x + 34, h0.y + h0.h * .3, 8); await sleep(80); await T.up(); await sleep(250);
  const ord1 = await p.evaluate(() => trackOrder().slice());
  ok(`${L}: Spur ziehen blättert oben auf Seite 1, Synth 6 jetzt oben`, tf.banks.t === 0 && ord1[0] === 7 && ord1.length === ord0.length, {ord1});
  await p.evaluate(() => undo()); await sleep(150);
  if (W === 926 && H === 428) {
    // Spur-Blatt quer (Foto) und Szene duplizieren quer
    await p.evaluate(() => { removeTrack(); setTrackBank(0); if (typeof hideToast === 'function') hideToast(); }); await sleep(250);
    const sr = await stopR(p, 1);
    await T.hold(sr.cx, sr.cy, 650); await sleep(200);
    ok('Quer: Spur-Blatt mit aktivem [Spur duplizieren] (7 von 8 Spuren)', await p.evaluate(() => { const b = UI.pop && UI.pop.el.querySelector('[data-mtx="dup"]'); return !!b && !b.disabled; }));
    await p.screenshot({path: dir + '/mtx-spur-quer.png'});
    await popCheck(p, 'Spur-Blatt quer');
    { const tw = await p.evaluate(() => { const P = UI.pop.el, a = P.getBoundingClientRect(); popFit(P); popFit(P); const c = P.getBoundingClientRect(), r2 = P.querySelector('.mtxtr');
        return {a: [Math.round(a.left), Math.round(a.right)], b: [Math.round(c.left), Math.round(c.right)], own: !!r2 && r2.children.length === 1 && !!r2.querySelector('[data-mtx="dup"]')}; });
      ok('Spur-Blatt quer: [Spur duplizieren] in eigener Zeile, Breite bleibt beim erneuten Einpassen (Prüfung Befund 3)', tw.own && tw.a[0] === tw.b[0] && tw.a[1] === tw.b[1], tw); }
    await p.evaluate(() => closePop()); await sleep(150);
    const sc = await scnR(p, 0);
    await T.down(sc.cx, sc.cy + 4); await sleep(650); await T.up(); await sleep(200);
    ok('Quer: Szenen-Kopf halten = Szenen-Blatt', await popName(p) === 'mtxscn');
    await popCheck(p, 'Szenen-Blatt quer');
    await p.evaluate(() => closePop());
  }
  ok(`${L}: keine Fehler im Browser`, errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}

// ======================= Vergleich Basis + alte Projekte =======================
{
  // Basis: dieselbe Geste (Zeile 7 → oben verweilen) blättert NICHT – Xanders Befund „ich komme nicht hoch“
  const B = await open(926, 428, basis);
  await B.p.evaluate(() => { addTrack(); addTrack(); SYNQUENZER.ux2Copy(1, 1, 7, 2); setTrackBank(1); });
  await sleep(250);
  const c7 = await cellR(B.p, 7, 2), sh = await scnR(B.p, 3);
  await drag(B.T, c7, [{x: sh.cx, y: sh.cy, wait: 700}], {keep: true});
  const tb = await B.p.evaluate(() => trackBankOf());
  await B.T.up(); await sleep(200);
  ok('Basis 4.49.1 zum Vergleich: dort bleibt Seite 2 stehen (Befund bestätigt)', tb === 1, {trackBank: tb});
  // alte Projekte laden gleich: das Projekt der Basis in der neuen Fassung normalisiert = gleich
  const proj = await B.p.evaluate(() => JSON.stringify(projectFileObj(S, true, false).project));
  const nb = await B.p.evaluate(s => JSON.stringify(normalizeProject(JSON.parse(s))), proj);
  await B.ctx.close();
  const N = await open(428, 926);
  const nn = await N.p.evaluate(s => JSON.stringify(normalizeProject(JSON.parse(s))), proj);
  ok('Alte Projekte laden gleich (Basis-Projekt normalisiert bit-gleich)', nb === nn, {len: nb.length});
  // Szene duplizieren und Spur duplizieren: Speichern → Laden behält alles (kein neues Feld)
  const rt = await N.p.evaluate(() => {
    const k = SYNQUENZER.mtx.sceneDup(0), j = SYNQUENZER.mtx.trackDup(0);
    const fo = projectFileObj(S, true, false), q = normalizeProject(JSON.parse(JSON.stringify(fo.project)));
    // beide Seiten gleich durch Speichern/Laden: Kopie = Original (Spur j ↔ 0, Szene k ↔ 0)
    return {k, j, clips: JSON.stringify(q.tracks[j].clips.map(cleanClip)) === JSON.stringify(q.tracks[0].clips.map(cleanClip)) && JSON.stringify(q.tracks[j].sound) === JSON.stringify(q.tracks[0].sound),
      sc: JSON.stringify(q.tracks.map(t => cleanClip(t.clips[k]))) === JSON.stringify(q.tracks.map(t => cleanClip(t.clips[0]))), order: JSON.stringify(q.ui.order) === JSON.stringify(trackOrder())};
  });
  ok('Speichern/Laden nach Szene + Spur duplizieren behält Clips und Reihenfolge', rt.k >= 0 && rt.j >= 0 && rt.clips && rt.sc && rt.order, rt);
  // ↶ alles / ↷ alles: Projekt gleich (ohne Ansicht ui und Prüfsumme – ↶ von ＋ Spur setzt auch in der Basis die gewählte Spur zurück)
  const un = await N.p.evaluate(() => {
    const strip = () => { const o = JSON.parse(serialize()); delete o.sum; if (o.project) delete o.project.ui; return JSON.stringify(o); };
    const a = strip(), n = UNDO.length; for (let k = 0; k < n; k++) undo(); const mid = UNDO.length === 0 && NT() === 6;
    for (let k = 0; k < n; k++) redo(); return {n, mid, same: strip() === a};
  });
  ok('Alle Schritte ↶ ↷ ergeben wieder denselben Stand (Szene + Spur duplizieren)', un.n === 2 && un.mid && un.same, un);
  ok('Keine Fehler im Browser (Vergleichslauf)', N.errs.length === 0, N.errs.slice(0, 3));
  await N.ctx.close();
}
// ======================= Spur-Blatt: Breite und Lage wie in der Basis (Prüfung Befund 3) =======================
for (const [W, H] of [[428, 926], [926, 428]]) {
  const m = [];
  for (const f of [undefined, basis]) {
    const o = await open(W, H, f);
    m.push(await o.p.evaluate(() => { if (MX.bankT) setTrackBank(0); openTrackSheet(1, UI.stops[1]); const q = UI.pop.el.getBoundingClientRect(); const r = [Math.round(q.left), Math.round(q.right), Math.round(q.width)]; closePop(); return r; }));
    await o.ctx.close();
  }
  ok(`Spur-Blatt ${W}×${H}: Breite und Lage wie in der Basis, 8 px Rand`, m[0][0] === m[1][0] && m[0][2] === m[1][2] && m[0][0] >= 8 && m[0][1] <= W - 8, {mtx: m[0], basis: m[1]});
}
await b.close();
const bad = res.filter(r => !r.ok);
console.log((bad.length ? 'FEHLER ' + bad.length + ' von ' : 'OK alles grün: ') + res.length + ' Prüfungen');
process.exit(bad.length ? 1 : 0);
