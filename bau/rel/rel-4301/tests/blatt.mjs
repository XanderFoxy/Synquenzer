// 4.30.1 – hohe Blätter (Chor, Takes, Mikro; dazu Wellen-/Noten-Editor, Video): schließbar, ablegbar, Transport, Aufteilen.
// Aufruf: node blatt.mjs <app.html> [W H]   (ohne W H: 428×926, 926×428, 428×650 nacheinander)
//  1 ✕ sichtbar (im Bild, oben auf, ≥ 44 px) und ein Fingertipp darauf schließt – Chor, Takes, Mikro, Wellen, Noten, Video
//  2 Tipp außerhalb schließt; Wischen nach unten am Kopf schließt (unter 64 px: federt zurück, bleibt offen)
//  3 Inhalt scrollt mit dem Finger (Touch-Wischen im Blatt), der Kopf bleibt oben
//  4 [Ablegen]: Leiste unten (≤ 60 px hoch, im Bild), App bedienbar (Tempo-Fenster geht auf und zu, Leiste bleibt),
//    Tipp auf die Leiste holt das Blatt zurück: Klang ▸ offen, ⋯ der Spur offen, Scroll-Stand wie vorher
//  5 Transport im Kopf: ▶ spielt die Song-Stimme (Takt 5–8) mit Chor (Chor-Kopien laufen, Pegel der STIMME-Spur), ■ hält an,
//    ⏮ startet die Stelle neu, Schleife an: nach dem Ende wieder Takt 5; Schleife aus: Stopp am Ende; die Song-Schleife bleibt unverändert
//  6 Szenen-Clip: ▶ startet die Szene von vorn (STIMME-Clip läuft), Schleife aus: Stopp nach einem Durchgang
//  7 Aufteilen im Chor-Blatt: [Als Chor-Stimme duplizieren] → [Diese Stelle] → neue Zeile, Blatt bleibt offen; ↶ nimmt es zurück;
//    Chor 4.25: [Auf Chor-Gruppe umstellen] im Blatt
//  8 leeres Chor-Blatt: [OK] schließt (vorher ohne Wirkung)
//  9 Touch-Ziele im Kopf ≥ 44 px, keine Konsolenfehler
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
import {setup} from './g6ph-lib.mjs';
import fs from 'fs';
const APP = process.argv[2], SIZES = process.argv[3] ? [[+process.argv[3], +process.argv[4]]] : [[428, 926], [926, 428], [428, 650]];
const OUT = new URL('./out/', import.meta.url).pathname; fs.mkdirSync(OUT, {recursive: true});
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']});
const C = []; const ok = (n, v, info) => { C.push([n, !!v]); console.log((v ? '✓ ' : '✗ ') + n + (info !== undefined ? ' ' + JSON.stringify(info) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
let errsAll = [];
async function open(W, H) {
  const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 1, permissions: ['microphone']});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(800);
  await p.evaluate(async () => { closePop(); ensureAudio(); for (let k = 0; k < 50 && !(AU.ctx && AU.ctx.state === 'running'); k++) await new Promise(r => setTimeout(r, 100)); });
  await setup(p, {bars: 8, at: [4]});
  await p.evaluate(async () => { const Q = SYNQUENZER; await Q.g6pStyle({vox: 'V1'}, '80'); await Q.g6pWaitAll(null, null, {timeout: 60000}); });
  return {ctx, p, errs};
}
// the close button of the open sheet: visible, on top, size
const closeBtn = (p, sel) => p.evaluate(sel => {
  const x = document.querySelector(sel); if (!x) return null;
  const r = x.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, hit = document.elementFromPoint(cx, cy);
  let hh = 0; for (let y = Math.floor(r.top - 12); y <= r.bottom + 12; y++) { const e = document.elementFromPoint(cx, y); if (e && x.contains(e)) hh++; }   // Trefferfläche senkrecht (auch ::after)
  return {x: cx, y: cy, w: Math.round(r.width), h: Math.round(r.height), hitH: hh, inView: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, top: !!(hit && x.contains(hit))};
}, sel);
const isOpen = {
  chor: p => p.evaluate(() => !!(UI.pop && UI.pop.name === 'chor')), takes: p => p.evaluate(() => !!(UI.pop && UI.pop.name === 'takes')),
  mikro: p => p.evaluate(() => !!(UI.pop && UI.pop.name === 'stimme')), wellen: p => p.evaluate(() => !!WP.ed), noten: p => p.evaluate(() => !!G2.ed), video: p => p.evaluate(() => !!VV.open)
};
const opener = {
  chor: () => SYNQUENZER.g6Sheet({vox: 'V1'}), takes: () => SYNQUENZER.tkSheet({vox: 'V1'}), mikro: () => SYNQUENZER.stimmeSheet(),
  wellen: () => SYNQUENZER.wpOpen({vox: 'V1'}), noten: () => SYNQUENZER.g2Open({vox: 'V1'}), video: () => SYNQUENZER.vvOpen()
};
const xSel = {chor: '#popLayer .pop .psh-x', takes: '#popLayer .pop .psh-x', mikro: '#popLayer .pop .psh-x', wellen: '#wpSheet .sh-x', noten: '#wpSheet .sh-x', video: '#vvSheet .sh-x'};
// a finger swipe (CDP touch events) from (x, y0) to (x, y1)
async function swipe(p, x, y0, y1, steps = 8) {
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y: y0}]});
  for (let k = 1; k <= steps; k++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y: y0 + (y1 - y0) * k / steps}]}); await sleep(16); }
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await cdp.detach();
}

for (const [W, H] of SIZES) {
  const T = W + '×' + H; console.log('--- ' + T);
  const {ctx, p, errs} = await open(W, H);
  // 1 ✕ visible + a tap closes (all tall sheets)
  for (const n of ['chor', 'takes', 'mikro', 'wellen', 'noten', 'video']) {
    await p.evaluate(opener[n]); await sleep(500);
    const o0 = await isOpen[n](p), cb = await closeBtn(p, xSel[n]);
    await p.screenshot({path: OUT + 'blatt-' + n + '-' + W + 'x' + H + '.png'});
    if (!cb) { ok(T + ' ' + n + ': ✕ vorhanden', false, {o0}); continue; }
    ok(T + ' ' + n + ': ✕ sichtbar, oben auf, Trefferfläche ≥ 44 px', o0 && cb.inView && cb.top && cb.w >= 44 && Math.max(cb.h, cb.hitH) >= 44, cb);
    await p.touchscreen.tap(cb.x, cb.y); await sleep(400);
    ok(T + ' ' + n + ': Tipp auf ✕ schließt', !(await isOpen[n](p)));
  }
  // 2 outside tap, swipe down on the head
  for (const n of ['chor', 'takes', 'mikro']) {
    await p.evaluate(opener[n]); await sleep(400);
    // der Punkt außerhalb mit dem größten Abstand zum Blatt (Chromium rückt einen Tipp dicht neben einem Knopf auf diesen)
    const pt = await p.evaluate(() => { const r = UI.pop.el.getBoundingClientRect(); const c = [[4, 4], [innerWidth - 4, innerHeight - 4], [4, innerHeight - 4], [innerWidth - 4, 4], [4, innerHeight / 2], [innerWidth - 4, innerHeight / 2]];
      const d = ([x, y]) => Math.max(r.left - x, x - r.right, r.top - y, y - r.bottom); return c.filter(q => d(q) > 0).sort((a, b) => d(b) - d(a))[0]; });
    await p.touchscreen.tap(pt[0], pt[1]); await sleep(400);
    ok(T + ' ' + n + ': Tipp außerhalb schließt', !(await isOpen[n](p)), pt);
    await p.evaluate(opener[n]); await sleep(400);
    const hb = await p.evaluate(() => { const r = UI.pop.el.querySelector('.psh-t').getBoundingClientRect(); return {x: r.left + 10, y: r.top + r.height / 2}; });
    await swipe(p, hb.x, hb.y, hb.y + 30); await sleep(300);
    const still = await isOpen[n](p);
    await swipe(p, hb.x, hb.y, hb.y + 140); await sleep(400);
    ok(T + ' ' + n + ': Wischen am Kopf: 30 px federt zurück, 140 px schließt', still && !(await isOpen[n](p)));
  }
  // 3 the content scrolls with the finger, the head stays on top
  {
    await p.evaluate(opener.chor); await sleep(500);
    const g0 = await p.evaluate(() => { const q = UI.pop.el, t = q.querySelectorAll('.g6pe-tile'), a = t[t.length - 1].getBoundingClientRect(); return {st: q.scrollTop, max: q.scrollHeight - q.clientHeight, x: a.left + a.width / 2, y0: a.top + a.height / 2, y1: Math.max(4, a.top - 160)}; });
    if (g0.max > 4) {
      await swipe(p, g0.x, g0.y0, g0.y1, 10); await sleep(500);
      const g1 = await p.evaluate(() => { const q = UI.pop.el, h = q.querySelector('.psh-h').getBoundingClientRect(), r = q.getBoundingClientRect(); return {st: q.scrollTop, headTop: Math.round(h.top - r.top)}; });
      ok(T + ' Chor: Inhalt scrollt mit dem Finger (Wischen auf einer Stil-Kachel), Kopf bleibt oben', g1.st > g0.st + Math.min(20, g0.max - 2) && Math.abs(g1.headTop) <= 2, {g0, g1});
    } else ok(T + ' Chor: passt ohne Scrollen ins Bild (Kopf oben)', true, g0);
    await p.evaluate(() => closePop());
  }
  // 4 Ablegen / Zurückholen keeps the state; the app stays usable
  {
    await p.evaluate(opener.chor); await sleep(400);
    await p.evaluate(() => { G6PE.kl = true; const l = S.tracks[stimmeT()].chor.lanes[0]; G6PE.dot = l.id; g6SheetPaint(); });
    await sleep(200);
    const s0 = await p.evaluate(() => { const q = UI.pop.el; q.scrollTop = Math.min(120, q.scrollHeight - q.clientHeight); return {st: q.scrollTop, kl: !!q.querySelector('.g6pe-kl'), dot: !!q.querySelector('.g6pe-dot')}; });
    const dk = await closeBtn(p, '#popLayer .pop .psh-dk');
    await p.touchscreen.tap(dk.x, dk.y); await sleep(400);
    const bar = await p.evaluate(() => { const q = document.querySelector('#pshDock .pop'); if (!q) return null; const r = q.getBoundingClientRect(); return {h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom), w: Math.round(r.width), vh: innerHeight, pop: !!UI.pop, layer: EL.popLayer.classList.contains('open'), t: q.querySelector('.psh-t').textContent}; });
    await p.screenshot({path: OUT + 'blatt-abgelegt-' + W + 'x' + H + '.png'});
    ok(T + ' Ablegen: Leiste unten (≤ 60 px, im Bild), keine Ebene mehr über der App', bar && bar.h <= 60 && bar.bottom <= bar.vh && bar.bottom >= bar.vh - 20 && !bar.pop && !bar.layer, bar);
    // the app under it: the tempo button opens its window, the bar stays
    const bpm = await closeBtn(p, '#bBpm');
    await p.touchscreen.tap(bpm.x, bpm.y); await sleep(350);
    const tempo = await p.evaluate(() => ({pop: UI.pop && UI.pop.name, bar: !!document.querySelector('#pshDock .pop')}));
    await p.evaluate(() => closePop()); await sleep(200);
    ok(T + ' Ablegen: App bedienbar (Tempo-Fenster öffnet), Leiste bleibt', tempo.pop === 'bpm' && tempo.bar && bpm.top, {tempo, bpmTop: bpm.top});
    const bt = await p.evaluate(() => { const r = document.querySelector('#pshDock .psh-t').getBoundingClientRect(); return {x: r.left + 12, y: r.top + r.height / 2}; });
    await p.touchscreen.tap(bt.x, bt.y); await sleep(450);
    const s1 = await p.evaluate(() => { const q = UI.pop && UI.pop.el; return q ? {name: UI.pop.name, st: q.scrollTop, kl: !!q.querySelector('.g6pe-kl'), dot: !!q.querySelector('.g6pe-dot'), dock: !!document.querySelector('#pshDock .pop'), layer: EL.popLayer.classList.contains('open')} : null; });
    ok(T + ' Zurückholen: Blatt wieder da, Klang ▸ und ⋯ offen, Scroll-Stand gleich', s1 && s1.name === 'chor' && s1.kl && s1.dot && Math.abs(s1.st - s0.st) <= 2 && !s1.dock && s1.layer, {s0, s1});
    // another tall sheet replaces a docked one (and ✕ on the bar closes)
    await p.evaluate(() => { pshDock(); }); await sleep(100);
    await p.evaluate(opener.takes); await sleep(300);
    const rep = await p.evaluate(() => ({pop: UI.pop && UI.pop.name, dock: !!document.querySelector('#pshDock .pop'), g6: G6.sheet}));
    ok(T + ' ein neues hohes Blatt ersetzt das abgelegte (Chor-Zustand aufgeräumt)', rep.pop === 'takes' && !rep.dock && rep.g6 === null, rep);
    await p.evaluate(() => pshDock()); await sleep(200);
    const xb = await closeBtn(p, '#pshDock .psh-x'); await p.touchscreen.tap(xb.x, xb.y); await sleep(300);
    ok(T + ' ✕ auf der Leiste schließt', await p.evaluate(() => !document.querySelector('#pshDock .pop') && !UI.pop && TK.sheet === null || (TK.sheet !== null && !document.querySelector('#pshDock .pop') && !UI.pop)));
    await p.evaluate(() => { G6PE.kl = false; G6PE.dot = null; });
  }
  // 9 head targets ≥ 44 px
  {
    await p.evaluate(opener.chor); await sleep(300);
    const sz = await p.evaluate(() => [...UI.pop.el.querySelectorAll('.psh-h button')].map(x => { const r = x.getBoundingClientRect(); return [x.getAttribute('aria-label'), Math.round(r.width), Math.round(r.height), r.right <= innerWidth && r.left >= 0]; }));
    ok(T + ' Kopf: 5 Knöpfe, je ≥ 44 × 44, im Bild', sz.length === 5 && sz.every(z => z[1] >= 44 && z[2] >= 44 && z[3]), sz);
    await p.evaluate(() => closePop());
  }
  if (W === 428 && H === 926) {
    // 5 transport: song voice V1 (Takt 5–8) with chor
    await p.evaluate(() => { SYNQUENZER.g6Sheet({vox: 'V1'}); }); await sleep(300);
    const loop0 = await p.evaluate(() => JSON.stringify(S.song.loop));
    await p.evaluate(() => { setUiPref('pshLoop', true); SYNQUENZER.g10OutRms(); S.tracks.forEach((t, i) => { if (t && i !== stimmeT()) t.mute = true; }); UI.g10Out.L.length = 0; });   // Pegel am Master, nur die STIMME-Spur hörbar
    const pl = await closeBtn(p, '#popLayer .pop .psh-pl');
    await p.touchscreen.tap(pl.x, pl.y); await sleep(1800);
    const m1 = await p.evaluate(() => { const st = stimmeT(), mi = SYNQUENZER.mtrInfo(); return {playing: R.playing, song: !!R.songPlay, lx: R.loopX, sb: songBeatOf(audBeat()), copies: SYNQUENZER.g6pInfoC().copies, rmsSt: SYNQUENZER.g10OutRms(.5, 3.4), sheet: UI.pop && UI.pop.name, icon: getComputedStyle(UI.pop.el.querySelector('.psh-pl .is')).display}; });
    ok('Transport ▶: Song-Stimme Takt 5–8 läuft (Schleife 4–8), Chor-Kopien klingen, Pegel (nur STIMME + Chor hörbar) > −40 dB, Blatt bleibt offen, Knopf zeigt ■', m1.playing && m1.song && m1.lx && m1.lx.a === 4 && m1.lx.b === 8 && m1.sb >= 16 && m1.sb < 32 && m1.copies > 0 && typeof m1.rmsSt === 'number' && m1.rmsSt > -40 && m1.sheet === 'chor' && m1.icon === 'block', m1);
    // derselbe Lauf mit stummem Chor: der Pegel fällt (der Chor ist im Klang)
    const mu = await p.evaluate(async () => { const tr = S.tracks[stimmeT()]; tr.chor.mute = true; g6peHear(); await new Promise(r => setTimeout(r, 50)); stop(); await new Promise(r => setTimeout(r, 300)); UI.g10Out.L.length = 0; pshStart({vox: 'V1'}); await new Promise(r => setTimeout(r, 1800)); const db = SYNQUENZER.g10OutRms(.5, 3.4), cp = SYNQUENZER.g6pInfoC().copies; delete tr.chor.mute; g6peHear(); stop(); await new Promise(r => setTimeout(r, 300)); pshStart({vox: 'V1'}); await new Promise(r => setTimeout(r, 1800)); return {db, cp}; });
    ok('Gegenprobe Chor stumm: Pegel um ≥ 0,3 dB kleiner (Chor 8 LU unter dem Lead → erwartet ≈ 0,6 dB)', typeof mu.db === 'number' && mu.db < m1.rmsSt - .3, {mitChor: m1.rmsSt, chorStumm: mu.db});
    const fi = await closeBtn(p, '#popLayer .pop .psh-b[data-psh=first]');
    await sleep(1500);
    const sbA = await p.evaluate(() => songBeatOf(audBeat()));
    await p.touchscreen.tap(fi.x, fi.y); await sleep(250);
    const sbB = await p.evaluate(() => ({sb: songBeatOf(audBeat()), playing: R.playing}));
    ok('Transport ⏮: startet die Stelle neu (Takt 5)', sbA > 20 && sbB.playing && sbB.sb >= 15.5 && sbB.sb < 17.5, {sbA, sbB});
    await sleep(8600);   // 4 Takte bei 120 BPM = 8 s
    const lp = await p.evaluate(() => ({playing: R.playing, sb: songBeatOf(audBeat()), loop: JSON.stringify(S.song.loop)}));
    ok('Schleife an: nach dem Ende wieder Takt 5 (Song-Schleife unverändert)', lp.playing && lp.sb >= 16 && lp.sb < 20 && lp.loop === loop0, lp);
    const lb = await closeBtn(p, '#popLayer .pop .psh-lp'); await p.touchscreen.tap(lb.x, lb.y); await sleep(200);
    const offT = await p.evaluate(() => ({lx: R.loopX && R.loopX.on, pref: uiPrefs().pshLoop, pressed: UI.pop.el.querySelector('.psh-lp').getAttribute('aria-pressed')}));
    await sleep(8400);
    const end = await p.evaluate(() => ({playing: R.playing, lx: R.loopX, loop: JSON.stringify(S.song.loop)}));
    ok('Schleife aus (mitten im Lauf): am Ende der Stelle Stopp, R.loopX leer, Song-Schleife unverändert', offT.lx === false && offT.pressed === 'false' && !end.playing && end.lx === null && end.loop === loop0, {offT, end});
    await p.touchscreen.tap(pl.x, pl.y); await sleep(1200);
    const st1 = await p.evaluate(() => R.playing); await p.touchscreen.tap(pl.x, pl.y); await sleep(300);
    ok('▶ dann ■ im Kopf: spielt und hält an', st1 && !(await p.evaluate(() => R.playing)));
    // main ▶ afterwards: no loop override
    await p.evaluate(() => { closePop(); songPlayStart(0); }); await sleep(400);
    ok('normales ▶ danach: keine Blatt-Schleife', await p.evaluate(() => R.playing && R.loopX === null));
    await p.evaluate(() => stop()); await sleep(300);
    // 6 scene clip
    const sc = await p.evaluate(() => { const st = stimmeT(); return S.tracks[st].clips.findIndex(c => c && c.audio); });
    await p.evaluate(sc => { setUiPref('pshLoop', false); SYNQUENZER.tkSheet({t: stimmeT(), s: sc}); }, sc); await sleep(300);
    const pl2 = await closeBtn(p, '#popLayer .pop .psh-pl');
    await p.touchscreen.tap(pl2.x, pl2.y); await sleep(1500);
    const c1 = await p.evaluate(sc => ({playing: R.playing, slot: R.slot[stimmeT()], sc, b: audBeat(), len: S.tracks[stimmeT()].clips[sc].len, src: TK.src.filter(r => !r.dead).length, sheet: UI.pop && UI.pop.name}), sc);
    ok('Szenen-Clip ▶ (Takes-Blatt): Szene von vorn, STIMME-Clip läuft, Blatt bleibt', c1.playing && c1.slot === sc && c1.b > 1 && c1.b < 4 && c1.src > 0 && c1.sheet === 'takes', c1);
    await sleep(c1.len * 2000 - 1000);
    const c2 = await p.evaluate(() => R.playing);
    ok('Szenen-Clip, Schleife aus: Stopp nach einem Durchgang', !c2, {len: c1.len});
    await p.evaluate(() => { setUiPref('pshLoop', true); closePop(); });
    // 7 Aufteilen im Chor-Blatt
    await p.evaluate(() => SYNQUENZER.g6Sheet({vox: 'V1'})); await sleep(300);
    const n0 = await p.evaluate(() => ({v: tkRef({vox: 'V1'}).a.chor.voices.length, takes: Object.keys(S.takes).length}));
    const du = await closeBtn(p, '#popLayer .pop .g6pe-dup [data-pe=dup]');
    await p.evaluate(() => { const q = UI.pop.el.querySelector('.g6pe-dup'); q.scrollIntoView({block: 'center'}); }); await sleep(200);
    const du2 = await closeBtn(p, '#popLayer .pop .g6pe-dup [data-pe=dup]');
    await p.touchscreen.tap(du2.x, du2.y); await sleep(250);
    const d1 = await closeBtn(p, '#popLayer .pop .g6pe-dup [data-pe=dup1]');
    await p.touchscreen.tap(d1.x, d1.y); await sleep(600);
    const n1 = await p.evaluate(() => ({v: tkRef({vox: 'V1'}).a.chor.voices.length, takes: Object.keys(S.takes).length, sheet: UI.pop && UI.pop.name, rows: UI.pop.el.querySelectorAll('.g6pe-lane:not(.grey)').length, free: tkRef({vox: 'V1'}).a.chor.voices.some(v => v.rule === 'free' && v.take), g2: !!G2.ed}));
    await p.screenshot({path: OUT + 'blatt-aufteilen-' + W + 'x' + H + '.png'});
    ok('Aufteilen im Chor-Blatt: [Als Chor-Stimme duplizieren] → [Diese Stelle]: neue freie Stimme mit eigenem Take, Blatt bleibt offen', du && n1.v === n0.v + 1 && n1.takes === n0.takes + 1 && n1.free && n1.sheet === 'chor' && n1.rows === n1.v && !n1.g2, {n0, n1});
    await p.evaluate(() => undo()); await sleep(300);
    const n2 = await p.evaluate(() => ({v: tkRef({vox: 'V1'}).a.chor.voices.length, takes: Object.keys(S.takes).length}));
    ok('↶ nimmt das Duplizieren zurück', n2.v === n0.v && n2.takes === n0.takes, n2);
    await p.evaluate(() => closePop());
    // 8 empty chor sheet: OK closes; chor 4.25: [Auf Chor-Gruppe umstellen] in the sheet
    await p.evaluate(() => { const a = tkRef({vox: 'V1'}).a; window._ch = a.chor; delete a.chor; SYNQUENZER.g6Sheet({vox: 'V1'}); }); await sleep(300);
    await p.evaluate(() => { UI.pop.el.querySelector('[data-pe=x]').scrollIntoView({block: 'center'}); }); await sleep(150);
    const okb = await closeBtn(p, '#popLayer .pop [data-pe=x]');
    const hasDup = await p.evaluate(() => !!UI.pop.el.querySelector('.g6pe-dup [data-pe=dup]'));
    await p.touchscreen.tap(okb.x, okb.y); await sleep(300);
    ok('leeres Chor-Blatt: [OK] schließt, [Als Chor-Stimme duplizieren] da', !(await isOpen.chor(p)) && hasDup, okb);
    await p.evaluate(() => { const a = tkRef({vox: 'V1'}).a; a.chor = window._ch; });
    const v1 = await p.evaluate(async () => { const r = {vox: 'V1'}; const a = tkRef(r).a, keep = a.chor; a.chor = {rec: 'terz', dir: 'up', mix: '80', voices: [{name: 'Terz', n: keep.voices[0].n.map(n => ({t0: n.t0, t1: n.t1, m: n.m, iv: 4})), db: 0, pan: 0, rev: .3}]};
      SYNQUENZER.g6Sheet(r); await new Promise(res => setTimeout(res, 300)); const b = UI.pop.el.querySelector('[data-pe=conv]'); const vis = !!b && b.getBoundingClientRect().height >= 44; a.chor = keep; closePop(); return vis; });
    ok('Chor 4.25: [Auf Chor-Gruppe umstellen] als Knopf im Blatt', v1);
  }
  ok(T + ' keine Konsolenfehler', errs.length === 0, errs.slice(0, 5));
  errsAll = errsAll.concat(errs);
  await ctx.close();
}
const f = C.filter(c => !c[1]).length;
console.log('Blätter: ' + (C.length - f) + '/' + C.length + (f ? ' – FEHLT: ' + C.filter(c => !c[1]).map(c => c[0]).join(' | ') : ''));
await b.close(); process.exit(f ? 1 : 0);
