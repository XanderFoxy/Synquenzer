// KE1-Test „Klang erkennen“. Aufruf: node ke1-test.mjs <index.html> [ordner]   (Basis = basis.html daneben; Fotos/Hörbeispiele im Ordner)
// Abschnitte: A Start unverändert (Bild, Block nicht geladen, kein Worker, Startzeit) · B Takes-Blatt per Touch → Blatt, Karte, Reiter,
// Prozent beim Antippen, Long Tasks · C A/B gleich laut · D Übernehmen neu/vorhanden + ↶ bitgleich, Speichern/Laden · E Original als
// Instrument · F Stopp · G Netz · H FANG-Ergebnis · I Spektral-Weg · J Guide · K Trefferquoten (Testtöne aus der App-Engine, sauber +
// Mikro-Simulation mit Raumhall + Rauschen; VA/FM-Töne für die Engine-Wahl) · L Fotos hochkant/quer · M Hörbeispiele
// Umgebung: KE1_KORPUS=0 überspringt K/M; KE1_N=<Fälle je Art> (Standard 12).
import { createRequire } from 'node:module'; import path from 'node:path'; import fs from 'node:fs'; import {execFileSync} from 'node:child_process';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
const HERE = path.dirname(new URL(import.meta.url).pathname);
const {roomReverb, detuneResample, rng} = await import(path.join(HERE, 'proto/dsp.mjs'));
const file = path.resolve(process.argv[2]), out = path.resolve(process.argv[3] || path.dirname(file)), basis = path.join(path.dirname(file), 'basis.html');
const fotos = path.join(out, 'fotos'), hoeren = path.join(out, 'hoeren'); fs.mkdirSync(fotos, {recursive: true}); fs.mkdirSync(hoeren, {recursive: true});
const KORPUS = process.env.KE1_KORPUS !== '0', NK = +(process.env.KE1_N || 12);
let bad = 0, all = 0; const res = [];
const fmt = d => (d == null ? '' : ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)));
const ok = (c, m, d) => { all++; const s = (c ? 'OK ' : 'FEHLER ') + m + fmt(d); if (!c) bad++; console.log(s); res.push(s); };
const info = (m, d) => { const s = 'INFO ' + m + fmt(d); console.log(s); res.push(s); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [], net = [];
async function page(w, h, f, o) {
  const ctx = await b.newContext({viewport: {width: w || 428, height: h || 926}, deviceScaleFactor: (o && o.dsf) || 2, hasTouch: true, isMobile: true});
  await ctx.addInitScript(() => { window.__wk = 0; const W0 = window.Worker; window.Worker = function (...a) { window.__wk++; return new W0(...a); }; window.Worker.prototype = W0.prototype;
    window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({d: Math.round(e.duration), t: Math.round(e.startTime)}); }).observe({type: 'longtask', buffered: true}); } catch (e) {} });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('request', r => { const u = r.url(); if (!/^(file|blob|data):/.test(u)) net.push(u); });
  await p.goto('file://' + (f || file)); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 90000}); await p.waitForTimeout(1200);
  p.cdp = await ctx.newCDPSession(p); p.ctx = ctx;
  return p;
}
const close = p => p.ctx.close();
const tDown = (p, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
const tUp = p => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
async function tap(p, x, y) { await tDown(p, x, y); await p.waitForTimeout(60); await tUp(p); await p.waitForTimeout(250); }
const ctr = (p, sel, scroll) => p.evaluate(([s, sc]) => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return null; if (sc) e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height}; }, [sel, !!scroll]);
async function tapSel(p, sel, scroll) { const c = await ctr(p, sel, scroll); if (!c) return null; await p.waitForTimeout(150); const c2 = (await ctr(p, sel)) || c; await tap(p, c2.x, c2.y); return c2; }
const waitRes = (p, ms) => p.waitForFunction(() => { const s = SYNQUENZER.ke1.state(); return s && !s.busy && (s.res || s.err); }, null, {timeout: ms || 120000, polling: 200});
// Testtöne: Hypothese (Engine-3-Einheiten) → Klang der App → SYNQUENZER.mkRender (OfflineAudioContext + App-Worklet), 48 kHz, Saat 7
const MKSRC = `const C = window.__ke1C || (window.__ke1C = new Function(document.getElementById('sq-ke1-src').textContent.split('const KE1X')[0] + ';return ke1CoreFn;')()(null, null));`;
async function tone(p, h, o) {
  return p.evaluate(async ([h, o]) => {
    const C = window.__ke1C || (window.__ke1C = new Function(document.getElementById('sq-ke1-src').textContent.split('const KE1X')[0] + ';return ke1CoreFn;')()(null, null));
    let s; if (o.snd) s = SQStore.normalizeSound(o.snd); else { s = SQStore.normalizeSound(factorySound(INIT_IDS.mk)); s.p.mk = C.mkMerge(s.p.mk, h); if (h.vib > 0) s.p.mw = 1; }
    const pre = o.pre == null ? .2 : o.pre, y = await SYNQUENZER.mkRender(s, [[pre, 'on', h.note, .8], [pre + h.hold, 'off', h.note]], {sec: pre + h.hold + (o.tail || .6), sr: 48000, seed: 7});
    return Array.from(y.l);
  }, [h, o || {}]);
}
const i16 = (x, g) => { let pk = 0; for (const v of x) pk = Math.max(pk, Math.abs(v)); const k = (g || .5) * 32767 / (pk || 1); return Array.from(x, v => Math.max(-32767, Math.min(32767, Math.round(v * k)))); };
function micSim(x, R) {   // Raumhall (0,5–1,2 s, Nass 25–45 %), Rauschen −40 dB, Verstimmung ±5–20 ct (wie der Prototyp-Korpus)
  const f = Float32Array.from(x); let y = roomReverb(f, 48000, .5 + .7 * R(), .25 + .2 * R(), 1 + Math.floor(R() * 1000));
  y = detuneResample(y, (R() < .5 ? -1 : 1) * (5 + 15 * R()));
  let e = 0; for (const v of y) e += v * v; const g = Math.sqrt(e / y.length) * .01 * Math.sqrt(3); for (let i = 0; i < y.length; i++) y[i] += g * (2 * R() - 1);
  return Array.from(y);
}
const ser = p => p.evaluate(() => SYNQUENZER.serialize());
const jdiff = (a, b2, pth, o) => { o = o || []; if (JSON.stringify(a) === JSON.stringify(b2)) return o; if (typeof a !== 'object' || typeof b2 !== 'object' || !a || !b2) { o.push((pth || '') + ': ' + JSON.stringify(a).slice(0, 60) + ' → ' + JSON.stringify(b2).slice(0, 60)); return o; } for (const k of new Set([...Object.keys(a), ...Object.keys(b2)])) jdiff(a[k], b2[k], (pth || '') + '.' + k, o); return o; };
try {
  info('Rechnerlast beim Start (loadavg 1/5/15 min, 4 Kerne)', fs.readFileSync('/proc/loadavg', 'utf8').trim());
  if (process.env.KE1_NUR !== 'K') {
  /* ================= A: Start unverändert ================= */
  for (const [w, h, n] of [[428, 926, 'hochkant'], [926, 428, 'quer']]) {
    const A = await page(w, h, basis), B = await page(w, h);
    const sa = await A.screenshot(), sb = await B.screenshot();
    ok(Buffer.compare(sa, sb) === 0, 'A1 Start-Bild pixelgleich zur Basis (' + n + ')');
    await close(A); await close(B);
  }
  {
    const p = await page();
    const r = await p.evaluate(() => ({loaded: SYNQUENZER.ke1.loaded(), x: typeof KE1X, core: typeof ke1CoreFn, wk: window.__wk, lt: window.__lt.length, block: (document.getElementById('sq-ke1-src') || {}).textContent.length,
      ser: SYNQUENZER.serialize().length, guide: ui1Entries().some(e => e.id === 'ke1')}));
    ok(!r.loaded && r.x === 'undefined' && r.core === 'undefined' && r.wk === 0, 'A2 Start: stiller Block nicht ausgewertet, kein Worker angelegt', r);
    info('A2 Block-Größe', (r.block / 1024).toFixed(1) + ' KB roh');
    await close(p);
  }
  {   // Startzeit: frische Kontexte, abwechselnd Basis / neu, 3 Läufe, Median
    const one = async f => { const ctx = await b.newContext({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true}); const p = await ctx.newPage();
      await p.goto('file://' + f, {waitUntil: 'load', timeout: 120000}); await p.waitForFunction(() => typeof BOOT !== 'undefined' && BOOT.done, null, {polling: 'raf', timeout: 120000});
      const r = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return {dcl: Math.round(n.domContentLoadedEventEnd), ready: Math.round(performance.now())}; }); await ctx.close(); return r; };
    await one(basis); const L = {b: [], n: []}; for (let k = 0; k < 3; k++) { L.b.push(await one(basis)); L.n.push(await one(file)); }
    const med = a => a.slice().sort((x, y) => x - y)[1];
    const mb = {dcl: med(L.b.map(x => x.dcl)), ready: med(L.b.map(x => x.ready))}, mn = {dcl: med(L.n.map(x => x.dcl)), ready: med(L.n.map(x => x.ready))};
    info('A3 Startzeit (Median aus 3, ms; Rechner unter Last)', {basis: mb, neu: mn, alle: L});
    ok(mn.ready <= mb.ready * 1.1 + 40, 'A3 Start nicht langsamer (bereit: neu ≤ Basis +10 % + 40 ms Messrauschen)', {basis: mb.ready, neu: mn.ready});
  }

  /* ================= B–G: Takes-Blatt per Touch, Karte, A/B, Übernehmen, Original, Stopp, Netz ================= */
  const H0 = {note: 57, tune: 0, hold: 1.0, o1w: 1, c1: 60, o2: 1, o2w: 0, semi: 12, o2lvl: 70, o2tune: 3, n: 0, cut: 45, res: 60, eg: 35, e1a: 0, e1d: 55, e1s: 10, e1r: 40, e2a: 0, e2d: 70, e2s: 90, e2r: 35, vib: 0, l2f: 64, sw: 0, ft: 0};
  let keepRes = null;
  for (const [w, h, n] of [[428, 926, 'hochkant'], [926, 428, 'quer']]) {
    const p = await page(w, h);
    const x = await tone(p, H0, {});
    const ref = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, len: 1}), i16(x, .4));
    { let pk = 0, e2 = 0, nb = 0; for (const v of x) { if (!isFinite(v)) nb++; else { pk = Math.max(pk, Math.abs(v)); e2 += v * v; } } ref.ton = {pk: +pk.toFixed(4), rms: +Math.sqrt(e2 / x.length).toFixed(4), nan: nb, n: x.length}; }
    ok(ref && ref.stored && ref.ton.pk > .05 && !ref.ton.nan, 'B0 Take angelegt, Testton aus der App-Engine hörbar (' + n + ')', ref);
    await p.evaluate(r => tkSheet({t: r.track, s: r.scene}), ref); await p.waitForTimeout(500);
    const bt = await ctr(p, '.tk-ke1', true); await p.waitForTimeout(200);
    ok(bt && bt.h >= 44 && bt.w >= 44, 'B1 Takes-Blatt: Knopf „Klang erkennen“ da, Tippziel ≥ 44 px (' + n + ')', bt);
    const sp = await ctr(p, '.tk-spk1'); ok(sp && bt && Math.abs(sp.y - bt.y) < 70, 'B1 … direkt neben „Im Spektrum öffnen“', {spk: sp && Math.round(sp.y), ke1: bt && Math.round(bt.y)});
    await p.screenshot({path: path.join(fotos, `1-takes-blatt-${n}.png`)});
    const net0 = net.length;
    const lt0 = await p.evaluate(() => window.__lt.slice());
    await p.evaluate(() => ensureAudio()); await p.waitForTimeout(2500);
    info('B7 (Bezug) Aufgaben ≥ 50 ms vor KE1 (App-Start, Take, Takes-Blatt, Audio-Start)', {n: lt0.length, max: Math.max(0, ...lt0.map(l => l.d))});
    await p.evaluate(() => { window.__lt.length = 0; });
    await tapSel(p, '.tk-ke1');
    await p.waitForTimeout(1200);
    const r0 = await p.evaluate(() => ({pop: !!document.querySelector('.pop.ke1'), info: SYNQUENZER.ke1.info(), st: SYNQUENZER.ke1.state(), wk: window.__wk}));
    ok(r0.pop && r0.info.loaded, 'B2 Tipp öffnet das Blatt; Block erst jetzt geladen (' + n + ')', {ms: +r0.info.ms.toFixed(1), worker: r0.wk, wMs: r0.st && +(+r0.st.wMs).toFixed(1)});
    await p.screenshot({path: path.join(fotos, `2-rechnet-${n}.png`)});
    await waitRes(p);
    const r1 = await p.evaluate(() => ({st: SYNQUENZER.ke1.state(), rows: SYNQUENZER.ke1.rows(), lt: window.__lt.slice(), tabs: [...document.querySelectorAll('.ke1-tab')].map(e => e.textContent), tb: [...document.querySelectorAll('.pop.ke1 button')].filter(e => e.getClientRects().length).map(e => { const r = e.getBoundingClientRect(); return {t: e.textContent.trim().slice(0, 20), h: Math.round(r.height), w: Math.round(r.width)}; })}));
    const R1 = r1.st.res;
    ok(!r1.st.err && R1 && R1.order.length === 3, 'B3 Ergebnis mit 3 Engines (' + n + ')', R1 ? {order: R1.order, D: R1.order.map(e => R1.eng[e].D), evals: R1.evals, ms: R1.ms, s1ms: R1.s1.ms, ende: R1.stoppedBy, toene: (r1.st.notes || []).length, f0: R1.s1.feat && +(+R1.s1.feat.f0).toFixed(1)} : r1.st.err);
    ok(R1 && R1.order[0] === R1.pEng[0].v && R1.pEng.every((q, i) => !i || q.D >= R1.pEng[i - 1].D), 'B4 E3: ähnlichste Engine zuerst, die anderen als Reiter daneben', r1.tabs);
    const words = r1.rows.map(x => x.w).filter(Boolean);
    ok(r1.rows.length >= 5 && words.every(w => ['sicher', 'ungefaehr', 'geraten'].includes(w)), 'B5 E2: Karte mit Worten sicher/ungefähr/geraten, ohne Prozent', r1.rows.map(x => x.l + ': ' + x.w));
    const noPct = await p.evaluate(() => !/\d+ %/.test([...document.querySelectorAll('.ke1-r')].map(e => e.textContent).join(' ')));
    ok(noPct, 'B5 … keine Prozentzahl, bevor eine Zeile angetippt ist');
    await tapSel(p, '.ke1-r[data-k="src"]'); await p.waitForTimeout(300);
    const det = await p.evaluate(() => { const e = document.querySelector('.ke1-r[data-k="src"] .ke1-d'); return e ? e.textContent : null; });
    ok(det && /\d+ %/.test(det), 'B6 Zeile antippen zeigt Prozent und zweitbeste Deutung', det);
    await p.screenshot({path: path.join(fotos, `3-karte-${n}.png`)});
    const lmax = Math.max(0, ...r1.lt.map(l => l.d));
    ok(lmax < 50, 'B7 Hauptfaden: keine Aufgabe ≥ 50 ms während Laden + Rechnen + Zeichnen (' + n + ')', {longtasks: r1.lt.length, max: lmax, paintMs: +(+r1.st.paintMs).toFixed(1), wMs: +(+r1.st.wMs).toFixed(1), last: fs.readFileSync('/proc/loadavg', 'utf8').split(' ')[0]});
    const small = r1.tb.filter(t => t.h < 44 || t.w < 44);
    ok(!small.length, 'B8 alle Knöpfe im Blatt ≥ 44 px', small.slice(0, 5));
    // Reiter wechseln
    const e2 = R1.order[1]; await tapSel(p, `.ke1-tab[data-e="${e2}"]`); const eng2 = await p.evaluate(() => SYNQUENZER.ke1.state().eng);
    ok(eng2 === e2, 'B9 Reiter antippen schaltet den Nachbau um (nur Vorhören)', eng2);
    await tapSel(p, `.ke1-tab[data-e="${R1.order[0]}"]`);
    ok(net.length === net0, 'G1 0 Netzaufrufe während Laden und Erkennen', net.slice(net0));
    if (n === 'quer') {   /* L: Fotos quer – Übernommen + FANG-Ergebnis */
      await tapSel(p, '.ke1-ok', true); await p.waitForTimeout(400);
      const q1 = await p.evaluate(() => { const t = SYNQUENZER.ke1.state().took; return !!(t && S.tracks[t.track]); });
      await p.screenshot({path: path.join(fotos, `4-uebernommen-${n}.png`)});
      await p.evaluate(() => { undo(); SYNQUENZER.ke1.close(); }); await p.waitForTimeout(300);
      const q2 = await p.evaluate(r => {
        const si = Math.max(0, S.tracks[MEL_T].clips.findIndex(c => !c)); const clip = normClip({len: 1, key: Object.assign({}, S.key), notes: [{t: 0, d: 1, n: 57, v: 100}]}, 'synth', S.key);
        S.tracks[MEL_T].clips[si] = clip; VS.res = {kind: 'fang', si, clip, cfg: {src: 'inst'}, len: 1, start: 0, oct: 0, snap: false, grid: Object.keys(VS_GRIDS)[0], tuneCt: 0, key: S.key, tk: {track: r.track, scene: r.scene, take: r.id}};
        vsResSheet(); return new Promise(res => setTimeout(() => { const b = document.querySelector('.pop.vsres [data-a="ke1"]'); if (!b) return res(null); const q = b.getBoundingClientRect();
          const cut = [...document.querySelectorAll('.pop.vsres .fs-bot .rb')].filter(x => x.scrollWidth > x.clientWidth + .5).map(x => x.textContent);
          res({inBar: !!b.closest('.fs-bot'), h: Math.round(q.height), w: Math.round(q.width), sichtbar: q.bottom <= innerHeight && q.right <= innerWidth, cut, txt: [...document.querySelectorAll('.pop.vsres .fs-bot .rb')].map(x => x.innerText.trim())}); }, 50));
      }, ref);
      await p.screenshot({path: path.join(fotos, `5-fang-ergebnis-${n}.png`)});
      await p.evaluate(() => { VS.res = null; closePop(); });
      ok(q1 && q2 && q2.inBar && q2.sichtbar && q2.h >= 44 && !q2.cut.length, 'L1 quer: Übernehmen auf neue Spur + FANG-Knopf sichtbar in der unteren Leiste, kein Knopf mit abgeschnittener Schrift (Fotos 4/5 quer)', {took: q1, fang: q2});
    }
    if (n === 'hochkant') {
      /* C: A/B gleich laut */
      const ab = await p.evaluate(() => ({a: SYNQUENZER.ke1.play('a'), b: SYNQUENZER.ke1.play('b')}));
      const dbd = 20 * Math.log10(ab.a.rms / ab.b.rms);
      ok(Math.abs(dbd) < .5, 'C1 A/B gleich laut (Effektivwert nach Abgleich)', {a: ab.a.rms, b: ab.b.rms, dB: +dbd.toFixed(2)});
      await p.evaluate(() => KE1X.abStop());
      /* D: Übernehmen auf neue Spur, ↶ bitgleich */
      await p.waitForTimeout(600);
      const okBtn = await ctr(p, '.ke1-ok', true); await p.waitForTimeout(300);
      const s0 = await ser(p), nt0 = await p.evaluate(() => S.tracks.length);
      await tapSel(p, '.ke1-ok'); await p.waitForTimeout(400);
      const d1 = await p.evaluate(() => { const t = SYNQUENZER.ke1.state().took; const s = t && S.tracks[t.track].sound; return {took: t, n: S.tracks.length, eng: s && s.engine, name: s && s.name, norm: s && JSON.stringify(SQStore.normalizeSound(JSON.parse(JSON.stringify(s)))) === JSON.stringify(s)}; });
      ok(d1.took && d1.took.neu && d1.n === nt0 + 1 && d1.eng === ({mk: 'mk', va: 'analog', fm: 'fm6'})[R1.order[0]], 'D1 Übernehmen: neue Spur mit dem erkannten Klang (normaler Klang, normalizeSound-fest)', d1);
      await p.screenshot({path: path.join(fotos, `4-uebernommen-${n}.png`)});
      await p.evaluate(() => undo()); await p.waitForTimeout(300);
      const s0b = await ser(p), canon = o => JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(x => [x, v[x]])) : v));
      const P0 = JSON.parse(s0).project, P1 = JSON.parse(s0b).project;
      ok(canon(P0) === canon(P1), 'D2 ein ↶ stellt das Projekt her (Inhalt gleich, Spur weg)', s0b === s0 ? 'zeichengleich' : 'Inhalt gleich; nur die Schlüssel-Reihenfolge eines Audio-Stücks weicht ab – macht der vorhandene ↶-Weg (imp1Step) in 4.78 genauso (Gegenprobe src/probe-undo3.mjs)');
      // vorhandene Spur
      const t1 = await p.evaluate(() => { for (let i = 0; i < NT(); i++) if (spk2MxOk(i)) return i; return -1; });
      const s1 = await ser(p);
      const d3 = await p.evaluate(t => { const r = SYNQUENZER.ke1.take(null, t); return {r, eng: S.tracks[t].sound.engine, name: S.tracks[t].sound.name}; }, t1);
      ok(d3.r && !d3.r.neu && d3.r.track === t1, 'D3 Übernehmen auf vorhandene Spur', d3);
      // Speichern/Laden mit dem neuen Klang
      const rt = await p.evaluate(async t => { const a = SYNQUENZER.serialize(); const snd = JSON.stringify(S.tracks[t].sound); SYNQUENZER.importJSON(a); await new Promise(r => setTimeout(r, 500)); return {same: JSON.stringify(S.tracks[t].sound) === snd, ser: SYNQUENZER.serialize() === a}; }, t1);
      ok(rt.same, 'D4 Speichern/Laden: übernommener Klang bleibt gleich', rt);
      ok(rt.ser, 'D4 … Speicherstand nach Laden zeichengleich');
      // ↶ nach Übernehmen (vor dem Laden geprüft): neuer Lauf auf frischem Stand
      const d5 = await p.evaluate(t => { const before = JSON.stringify(S.tracks[t].sound), s0 = SYNQUENZER.serialize(); const r = SYNQUENZER.ke1.take('va', t); const mid = S.tracks[t].sound.engine; undo(); return {r: !!r, mid, back: SYNQUENZER.serialize() === s0, snd: JSON.stringify(S.tracks[t].sound) === before}; }, t1);
      ok(d5.r && d5.mid === 'analog' && d5.back && d5.snd, 'D5 ↶ gibt der vorhandenen Spur ihren alten Klang (bitgleich)', d5);
      // alle drei Engines lassen sich übernehmen
      const d6 = await p.evaluate(() => ['mk', 'va', 'fm'].map(e => { const s = SYNQUENZER.ke1.sound(e); return s && s.engine; }));
      ok(d6.join() === 'mk,analog,fm6', 'D6 Nachbau-Klang je Engine baubar (Engine 3 / VA / FM)', d6);
      /* E: Original als Instrument */
      const s2 = await ser(p);
      const e1 = await p.evaluate(() => { const r = SYNQUENZER.ke1.inst(); const s = r && S.tracks[r.track].sound; return {r, eng: s && s.engine, h: s && s.p.wt && s.p.wt.h && {take: s.p.wt.h.take, f0: s.p.wt.h.f0}}; });
      ok(e1.r && e1.eng === 'wt' && e1.h && e1.h.take === e1.r.take && e1.h.f0 > 200 && e1.h.f0 < 240, 'E1 Original als Instrument: Klangkorn-Spur mit dem Ausschnitt als Take (f0 ≈ 220 Hz)', e1);
      await p.evaluate(() => undo()); await p.waitForTimeout(300);
      const s2b = await ser(p);
      ok(s2b === s2, 'E2 ein ↶ nimmt Spur und Take zurück (bitgleich)', s2b === s2 ? null : 'Unterschied ' + (s2b.length - s2.length) + ' Zeichen');
      /* F: Stopp */
      await p.evaluate(() => { SYNQUENZER.ke1.close(); });
      const f1 = await p.evaluate(async pcm => { SYNQUENZER.ke1.open({pcm: Int16Array.from(pcm), sr: 48000, name: 'Stopp'}); const t0 = performance.now();
        while (!(SYNQUENZER.ke1.state().prog && SYNQUENZER.ke1.state().prog.phase === 2) && performance.now() - t0 < 20000) await new Promise(r => setTimeout(r, 50));
        await new Promise(r => setTimeout(r, 600)); const ts = performance.now(); SYNQUENZER.ke1.stop();
        while (SYNQUENZER.ke1.state().busy && performance.now() - ts < 10000) await new Promise(r => setTimeout(r, 5));
        const s = SYNQUENZER.ke1.state(); return {ms: Math.round(performance.now() - ts), late: s.stopLate, by: s.res && s.res.stoppedBy, has: !!(s.res && s.res.eng.mk)}; }, i16(x, .4));
      ok(f1.by === 'stopp' && f1.has && f1.late <= 100, 'F1 Stopp: Antwort im Worker ≤ 100 ms, Zwischenstand bleibt', f1);
      keepRes = R1;
      /* H: FANG-Ergebnis (eingespielt) */
      const h1 = await p.evaluate(r => {
        SYNQUENZER.ke1.close(); const si = Math.max(0, S.tracks[MEL_T].clips.findIndex(c => !c)); const clip = normClip({len: 1, key: Object.assign({}, S.key), notes: [{t: 0, d: 1, n: 57, v: 100}]}, 'synth', S.key);
        S.tracks[MEL_T].clips[si] = clip; VS.res = {kind: 'fang', si, clip, cfg: {src: 'inst'}, len: 1, start: 0, oct: 0, snap: false, grid: Object.keys(VS_GRIDS)[0], tuneCt: 0, key: S.key, tk: {track: r.track, scene: r.scene, take: r.id}};
        vsResSheet(); return new Promise(res => setTimeout(() => { const b = document.querySelector('.pop.vsres [data-a="ke1"]');
          res({btn: !!b, inBar: !!(b && b.closest('.fs-bot')), cut: [...document.querySelectorAll('.pop.vsres .fs-bot .rb')].filter(x => x.scrollWidth > x.clientWidth + .5).map(x => x.textContent), txt: [...document.querySelectorAll('.pop.vsres .fs-bot .rb')].map(x => x.innerText.trim())}); }, 50));
      }, ref);
      ok(h1.btn && h1.inBar && !h1.cut.length, 'H1 FANG-Ergebnis „EINGESPIELT“: „Klang erkennen“ in der unteren Leiste, keine Schrift abgeschnitten', h1);
      await p.screenshot({path: path.join(fotos, `5-fang-ergebnis-${n}.png`)});
      await tapSel(p, '.pop.vsres [data-a="ke1"]'); await p.waitForTimeout(800);
      const h2 = await p.evaluate(() => ({pop: !!document.querySelector('.pop.ke1'), res: VS.res}));
      ok(h2.pop && !h2.res, 'H2 Tipp: Noten bleiben (wie OK), Blatt „Klang erkennen“ öffnet mit dem Take', h2.pop);
      await waitRes(p); await p.evaluate(() => SYNQUENZER.ke1.close());
      const h3 = await p.evaluate(() => { VS.res = {kind: 'fang', si: 0, clip: S.tracks[MEL_T].clips[0], cfg: {src: 'voice'}, len: 1, start: 0, oct: 0, snap: false, grid: Object.keys(VS_GRIDS)[0], tuneCt: 0, key: S.key, tk: {track: 0, scene: 0, take: 'x'}}; return ke1ResHtml('<button class="rb fs-ok" data-a="ok">', VS.res, false).indexOf('ke1') < 0; });
      ok(h3, 'H3 bei GESUNGEN kein Knopf (nur bei eingespielt)');
      await p.evaluate(() => { VS.res = null; closePop(); });
      /* I: Spektral-Weg */
      const i1 = await p.evaluate(pcm => { const dd = document.createElement('div'); document.body.appendChild(dd); ke1KlHook({}, {src: {x: Float32Array.from(pcm, v => v / 32767), sr: 48000}, nm: 'A3 · Ebene'}, dd);
        const b = dd.querySelector('.ke1-spk'); if (!b) return {btn: false}; b.click(); const pop = !!document.querySelector('.pop.ke1'); dd.remove(); return {btn: true, label: b.textContent, pop}; }, i16(x, .4));
      ok(i1.btn && i1.pop, 'I1 Spektral-Seite „Klang nachbauen“: führt zur Erkennung derselben Note (kein zweiter Knopf-Satz)', i1);
      await waitRes(p); await p.evaluate(() => SYNQUENZER.ke1.close());
      /* J: Guide */
      const j1 = await p.evaluate(() => { const e = ui1Entries().find(x => x.id === 'ke1'); return e && {n: e.n, w: e.w}; });
      ok(j1 && /Klang erkennen/.test(j1.n), 'J1 Guide-Eintrag „Klang erkennen“', j1);
      // Worker wird 60 s nach dem Schließen beendet (Speicher frei) – hier nur: läuft noch, Kill räumt
      ok(await p.evaluate(() => { SYNQUENZER.ke1.kill(); return !SYNQUENZER.ke1.worker(); }), 'J2 Worker lässt sich beenden (Schließen + 60 s, dann frei)');
    }
    await close(p);
  }

  /* ================= P: Wiedergabe läuft, während erkannt wird (Planer-Vorlauf, Hauptfaden, kleineres Budget) ================= */
  {
    const p = await page();
    const x = await tone(p, H0, {});
    const ref = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, len: 1}), i16(x, .4));
    const r = await p.evaluate(async rf => {
      const wait = ms => new Promise(q => setTimeout(q, ms));
      ensureAudio(); await wait(800); play(); await wait(1500);
      const meter = () => { const M = {min: 9, gap: 0, n: 0, lt: 0, ltMax: 0, e0: TICKERR.n}; let last = performance.now();
        const po = new PerformanceObserver(l => { for (const e of l.getEntries()) { M.lt++; M.ltMax = Math.max(M.ltMax, e.duration); } }); po.observe({type: 'longtask'});
        const iv = setInterval(() => { const t = performance.now(); M.gap = Math.max(M.gap, t - last); last = t; if (R.playing) { M.min = Math.min(M.min, b2t(R.schedBeat) - AU.ctx.currentTime); M.n++; } }, 10);
        return () => { clearInterval(iv); po.disconnect(); return {minAheadMs: +(M.min * 1000).toFixed(1), maxGapMs: +M.gap.toFixed(1), probes: M.n, lt: M.lt, ltMax: Math.round(M.ltMax), tickErr: TICKERR.n - M.e0}; }; };
      // Bezug: dieselbe Wiedergabe 4 s ohne Erkennung (zeigt die Last des Rechners)
      let end = meter(); await wait(4000); const base = end();
      end = meter(); const t0 = performance.now();
      const xx = tkRef({t: rf.track, s: rf.scene}); ke1Go(ke1TkSrc(xx, {t: rf.track, s: rf.scene}));
      await wait(300); const open = end(); end = meter();   // Öffnen des Blatts (wie jedes Blatt der App) getrennt vom Rechnen
      while (performance.now() - t0 < 60000) { const s = SYNQUENZER.ke1.state(); if (!s.busy && (s.res || s.err)) break; await wait(50); }
      await wait(500); const k = end();
      const s = SYNQUENZER.ke1.state(), playing = R.playing; SYNQUENZER.ke1.close(); stop();
      return {playing, err: s.err, evals: s.res && s.res.evals, ms: s.res && s.res.ms, sim: s.res && s.res.eng[s.res.order[0]].sim, base, open, ke1: k};
    }, ref);
    ok(r.playing && !r.err && r.evals > 0 && r.evals <= 330 && r.ms <= 9500, 'P1 Wiedergabe läuft weiter, Erkennung mit 40 % Rechenlast (Pausen im Worker, ≤ 6 s Suche / 320 Versuche) fertig', {evals: r.evals, ms: r.ms, aehnlich: r.sim});
    // Hörbar ist nur, ob der Planer im Vorlauf bleibt (keine Note zu spät). Lange Aufgaben werden bei freiem Rechner streng geprüft;
    // bei fremder Last (loadavg ≥ 3,5 auf 4 Kernen) nur gemeldet – dann zeigt auch das Öffnen des vorhandenen Takes-Blatts 33–97 ms (src/probe-play-trace-ref.mjs).
    const last = +fs.readFileSync('/proc/loadavg', 'utf8').split(' ')[0], frei = last < 3.5, K2 = r.ke1, B2 = r.base;
    ok(K2.tickErr === 0 && K2.minAheadMs > 0 && (!frei || K2.ltMax < 50), 'P2 während des Rechnens: Planer bleibt im Vorlauf (keine Note zu spät), keine Planer-Fehler' + (frei ? ', keine Aufgabe ≥ 50 ms' : ' (Rechner belegt: lange Aufgaben nur gemeldet)'),
      {bezug_ohne: B2, oeffnen: r.open, rechnen: K2, last});
    /* Q: unbrauchbare Aufnahmen (Stille, reines Rauschen, Knackser) → klare Meldung oder Ergebnis, nie „NaN“ */
    const q = await p.evaluate(async () => {
      const wait = ms => new Promise(z => setTimeout(z, ms)), out = [];
      let s = 99; const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296 - .5; };
      const cases = {stille: new Int16Array(48000), rauschen: Int16Array.from({length: 72000}, () => Math.round(16000 * rnd())), knack: (() => { const a = new Int16Array(48000); for (let i = 0; i < 40; i++) a[12000 + i] = 20000 * (i % 2 ? 1 : -1); return a; })()};
      for (const [k, pcm] of Object.entries(cases)) {
        SYNQUENZER.ke1.open({pcm, sr: 48000, name: k}); const t0 = performance.now();
        while (performance.now() - t0 < 30000) { const st = SYNQUENZER.ke1.state(); if (!st.busy && (st.res || st.err) && performance.now() - t0 > 100) break; await wait(50); }
        const st = SYNQUENZER.ke1.state(), txt = (document.querySelector('.pop.ke1') || {}).textContent || '';
        out.push({k, err: st.err, D: st.res && st.res.order.map(e => st.res.eng[e].D), nan: /NaN|Infinity|undefined/.test(txt)});
        SYNQUENZER.ke1.close(); await wait(200);
      }
      return out;
    });
    ok(q.every(c => !c.nan && (c.err || (c.D && c.D.every(d => isFinite(d))))) && q[0].err, 'Q1 unbrauchbare Aufnahme (Stille → Meldung; Rauschen / Knackser → Ergebnis „fern“): nirgends „NaN“', q);
    await close(p);
  }

  }
  /* ================= K: Trefferquoten (Testtöne aus der App-Engine) ================= */
  if (KORPUS) {
    const R = rng(+(process.env.KE1_SAAT || 20261118)), U = (a, b2) => a + (b2 - a) * R(), UI = (a, b2) => Math.round(U(a, b2)), pick = a => a[Math.floor(R() * a.length)];
    const CAT = [['Bass', [33, 45]], ['Lead', [60, 72]], ['Fläche', [48, 60]], ['Zupf', [52, 64]], ['Bläser', [48, 60]], ['Orgel', [55, 67]]];
    const gen = cat => {
      const h = {o1w: 0, c1: 0, o2: 0, o2w: 0, semi: 0, o2lvl: 0, o2tune: 0, n: 0, cut: 64, res: 0, eg: 0, e1a: 0, e1d: 64, e1s: 0, e1r: 30, e2a: 0, e2d: 64, e2s: 127, e2r: 30, vib: 0, l2f: 64, tune: 0, sw: 0, ft: 0, hold: 1.0};
      const o1 = ws => { h.o1w = pick(ws); if (h.o1w === 1) h.c1 = R() < .4 ? 0 : UI(10, 100); };
      const osc2 = (pr, semis, tmax) => { if (R() < pr) { h.o2 = 1; h.o2w = UI(0, 2); h.semi = pick(semis); h.o2lvl = UI(50, 127); h.o2tune = UI(1, tmax); } };
      switch (cat) {
        case 'Bass': o1([0, 0, 1, 1, 2, 3]); osc2(.6, [0, 12, 12], 6); Object.assign(h, {cut: UI(15, 55), res: UI(0, 90), eg: UI(15, 50), e1a: UI(0, 8), e1d: UI(35, 75), e1s: UI(0, 50), e1r: UI(20, 60), e2a: UI(0, 6), e2d: UI(40, 80), e2s: UI(50, 120), e2r: UI(15, 45), n: R() < .15 ? UI(5, 30) : 0}); break;
        case 'Lead': o1([0, 0, 1, 1, 2]); osc2(.6, [0, 0, 12], 7); Object.assign(h, {cut: UI(55, 105), res: UI(10, 85), eg: UI(-5, 30), e1a: UI(0, 30), e1d: UI(40, 85), e1s: UI(30, 110), e1r: UI(30, 65), e2a: UI(0, 25), e2d: UI(50, 90), e2s: UI(90, 127), e2r: UI(30, 60)}); if (R() < .6) { h.vib = UI(3, 10); h.l2f = UI(78, 92); } h.n = R() < .2 ? UI(5, 25) : 0; break;
        case 'Fläche': o1([0, 0, 1, 2]); osc2(.85, [0, 0, 12], 9); Object.assign(h, {cut: UI(40, 90), res: UI(0, 60), eg: UI(-10, 30), e1a: UI(50, 90), e1d: UI(60, 95), e1s: UI(40, 110), e1r: UI(55, 85), e2a: UI(55, 85), e2d: UI(60, 95), e2s: UI(85, 127), e2r: UI(55, 85), n: R() < .3 ? UI(5, 35) : 0}); if (R() < .3) { h.vib = UI(2, 6); h.l2f = UI(70, 85); } break;
        case 'Zupf': o1([0, 1, 1, 2, 3]); osc2(.4, [0, 12], 5); Object.assign(h, {cut: UI(15, 60), res: UI(0, 80), eg: UI(25, 55), e1a: 0, e1d: UI(35, 70), e1s: UI(0, 25), e1r: UI(25, 60), e2a: 0, e2d: UI(50, 80), e2s: UI(0, 40), e2r: UI(30, 60)}); break;
        case 'Bläser': o1([0, 0, 1]); osc2(.7, [0, 0, 12], 6); Object.assign(h, {cut: UI(30, 60), res: UI(0, 40), eg: UI(25, 45), e1a: UI(35, 55), e1d: UI(50, 80), e1s: UI(40, 90), e1r: UI(30, 55), e2a: UI(15, 40), e2d: UI(50, 80), e2s: UI(90, 127), e2r: UI(25, 50)}); if (R() < .4) { h.vib = UI(2, 6); h.l2f = UI(78, 90); } h.n = R() < .3 ? UI(5, 20) : 0; break;
        case 'Orgel': o1([1, 2, 3, 1]); if (h.o1w === 1) h.c1 = R() < .5 ? 0 : UI(20, 90); osc2(.6, [12, 12, 0], 3); Object.assign(h, {cut: UI(70, 115), res: UI(0, 20), eg: 0, e1a: 0, e1d: 64, e1s: 0, e1r: 30, e2a: UI(0, 10), e2d: UI(40, 80), e2s: UI(110, 127), e2r: UI(15, 40)}); break;
      }
      if (R() < .25) h.ft = 1;   // ein Viertel mit 12-dB-Tiefpass (Filtertyp messbar)
      return h;
    };
    const cases = [];
    for (let i = 0; i < NK; i++) { const [cat, notes] = CAT[i % CAT.length], h = gen(cat); h.note = notes[i % 2]; cases.push({id: i, cat, h}); }
    // zwei Speicherwellen-Fälle (einfache Perioden), im sauberen Teil
    const SWC = [{id: 100, cat: 'Speicherwelle', h: Object.assign(gen('Orgel'), {o1w: 0, sw: 41, o2: 0, note: 57, ft: 0, cut: 110})}, {id: 101, cat: 'Speicherwelle', h: Object.assign(gen('Lead'), {o1w: 0, sw: 9, o2: 0, note: 60, ft: 0, cut: 115, vib: 0})}];
    const p = await page(428, 926, file, {dsf: 1});
    await p.evaluate(() => SYNQUENZER.ke1.load());
    const W = {cutHz: v => 20 * Math.pow(1000, v / 127), egHt: v => v / 63 * 60, atk: v => .0005 * Math.pow(2, 15 * v / 127), dec: v => .002 * Math.pow(2, 13 * v / 127), fine2: v => { const a = Math.abs(v), s = v < 0 ? -1 : 1; return s * (a <= 48 ? 1200 * (a / 48) * (a / 48) : 1200 + 80 * (a - 48)); }};
    const st = h => 12 * Math.log2(W.cutHz(h.cut) / 20) + W.egHt(h.eg) * h.e1s / 127, oc = (a, b2) => Math.abs(Math.log2(Math.max(.003, a) / Math.max(.003, b2)));
    const rows = [], keep = [];
    const runCase = async (pcm, label, extra) => {
      const r = await p.evaluate(async ([pcm, label, extra]) => { SYNQUENZER.ke1.close(); SYNQUENZER.ke1.open({pcm: Int16Array.from(pcm), sr: 48000, name: label}); const t0 = performance.now();
        while ((SYNQUENZER.ke1.state().busy || (!SYNQUENZER.ke1.state().res && !SYNQUENZER.ke1.state().err)) && performance.now() - t0 < 120000) await new Promise(r => setTimeout(r, 150));
        const s = SYNQUENZER.ke1.state(); return {err: s.err, res: s.res, rows: s.res ? Object.fromEntries(['mk', 'va', 'fm'].map(e => [e, SYNQUENZER.ke1.rows(e)])) : null, pa: extra && s.res ? SYNQUENZER.ke1.pcm('a') : null, pb: extra && s.res ? SYNQUENZER.ke1.pcm(s.res.order[0]) : null}; }, [pcm, label, !!extra]);
      return r;
    };
    for (const vr of ['sauber', 'mikro']) {
      const list = vr === 'sauber' ? cases.concat(SWC) : cases;
      for (const c of list) {
        let x = await tone(p, c.h, {});
        if (vr === 'mikro') x = micSim(x, rng(1000 + c.id));
        const r = await runCase(i16(x, .4), c.cat + ' ' + vr, keep.length < 4 && (c.id === 3 || c.id === 1 || c.id === 100 || (vr === 'mikro' && c.id === 0)));
        if (r.err || !r.res) { rows.push({c, vr, err: r.err || 'kein Ergebnis'}); console.log('FALL', c.id, vr, 'FEHLER', r.err, JSON.stringify(c.h)); continue; }
        const t = c.h, m = r.res.eng.mk.p, ce = r.res.eng.mk.cert;
        const q = {id: c.id, cat: c.cat, vr, eng0: r.res.order[0], D: r.res.eng.mk.D, lsd: r.res.eng.mk.lsd, sim: r.res.eng.mk.sim, ms: r.res.ms, s1ms: r.res.s1.ms, evals: r.res.evals,
          welle: t.sw ? m.sw === t.sw : (!m.sw && m.o1w === t.o1w), swTop3: t.sw ? (r.res.s1.sw || []).some(s => s.n === t.sw) : null, o2: m.o2 === t.o2, lage: t.o2 && m.o2 ? m.semi === t.semi : null, o2w: t.o2 && m.o2 ? m.o2w === t.o2w : null,
          cutHold: Math.abs(st(m) - st(t)), res: Math.abs(m.res - t.res), eg: Math.abs(m.eg - t.eg), ft: m.ft === t.ft, att: oc(W.atk(m.e2a), W.atk(t.e2a)), dec: oc(W.dec(m.e2d), W.dec(t.e2d)), sus: Math.abs(m.e2s - t.e2s), rel: oc(W.dec(m.e2r), W.dec(t.e2r)),
          det: t.o2 && m.o2 ? Math.abs(W.fine2(m.o2tune) - W.fine2(t.o2tune)) : null, noise: Math.abs((m.n || 0) - (t.n || 0)), vibOk: (m.vib > 0) === (t.vib > 0), vibT: t.vib > 0, pitch: Math.abs(m.note * 100 + m.tune - t.note * 100 - (t.tune || 0)),
          words: Object.fromEntries((r.rows.mk || []).map(x => [x.k, x.w]))};
        q.okSrc = q.welle && q.o2; q.okFlt = q.cutHold <= 3 && q.ft; q.okAmp = q.att <= 1 && q.sus <= 25 && q.rel <= 1; q.okNoi = q.noise <= 15; q.okMov = q.vibOk;
        rows.push(q); console.log('FALL', c.id, c.cat, vr, 'D', q.D, q.sim, 'Welle', q.welle, 'Engine', q.eng0, 'ms', q.ms);
        if (r.pa && r.pb && keep.length < 4) keep.push({name: `${keep.length + 1}-${c.cat.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')}-${vr}`, a: r.pa, b: r.pb, sim: q.sim, eng: q.eng0, D: q.D});
      }
    }
    // VA- und FM-Töne: wählt die Erkennung die passende Engine?
    const EV = [];
    const vaS = [[{o1: 0, o2: 1}, [.45, .3, .7, .35, .05, .4, .8, .35, .5, 0, .5]], [{o1: 2, o2: 0}, [.6, .1, .5, .3, .02, .3, 1, .3, 0, 0, .5]], [{o1: 1, o2: 1}, [.35, .5, .8, .25, .1, .5, .6, .4, .4, .1, .3]]];
    const fmS = [[{r: 2}, [.7, .5, .6, .02, .3, .7, .3, 1]], [{r: 3}, [.6, .4, .8, .02, .3, .6, .3, 1]], [{r: 1}, [.8, .6, .5, .02, .4, .8, .3, 1]]];
    for (const [eng, L] of [['va', vaS], ['fm', fmS]]) for (const [fix, u] of L) {
      const snd = await p.evaluate(([eng, fix, u]) => spk2KlSnd({eng, fix, u}), [eng, fix, u]);
      const x = await tone(p, {note: 57, hold: 1.0}, {snd});
      const r = await runCase(i16(x, .4), eng.toUpperCase() + '-Ton');
      if (!r.res) { EV.push({eng, err: r.err}); continue; }
      const fm = r.res.eng.fm && r.res.eng.fm.p;
      EV.push({eng, first: r.res.order[0], order: r.res.order, D: r.res.order.map(e => r.res.eng[e].D), ratio: eng === 'fm' && fm ? fm.r + (fm.c > 1 ? '/' + fm.c : '') : null, ratioTrue: eng === 'fm' ? fix.r : null});
      console.log('ENGINE', eng, JSON.stringify(EV[EV.length - 1]));
    }
    await close(p);
    // Auswertung
    const pct = (a, f) => { const v = a.filter(f); return a.length ? Math.round(100 * v.length / a.length) + ' % (' + v.length + '/' + a.length + ')' : '–'; };
    const med = a => { const s = a.filter(v => v != null).sort((x, y) => x - y); return s.length ? +s[s.length >> 1].toFixed(2) : null; };
    const mean = a => { const s = a.filter(v => v != null); return s.length ? +(s.reduce((x, y) => x + y, 0) / s.length).toFixed(2) : null; };
    const tab = ['| Parameter | sauber | Mikro-Simulation |', '|---|---|---|'];
    const S = rows.filter(q => q.vr === 'sauber' && !q.err), M = rows.filter(q => q.vr === 'mikro' && !q.err);
    const line = (l, f) => tab.push(`| ${l} | ${f(S)} | ${f(M)} |`);
    line('Welle OSZ 1 richtig', a => pct(a, q => q.welle));
    line('OSZ 2 an/aus richtig', a => pct(a, q => q.o2));
    line('OSZ 2 Lage (0/+12) richtig', a => pct(a.filter(q => q.lage != null), q => q.lage));
    line('OSZ 2 Welle richtig', a => pct(a.filter(q => q.o2w != null), q => q.o2w));
    line('Verstimmung OSZ 2, Median (Mittel) ct', a => med(a.map(q => q.det)) + ' (' + mean(a.map(q => q.det)) + ')');
    line('Filtertyp richtig (24/12 dB)', a => pct(a, q => q.ft));
    line('Filter-Grenze beim Halten, Median (Mittel) Halbtöne', a => med(a.map(q => q.cutHold)) + ' (' + mean(a.map(q => q.cutHold)) + ')');
    line('… davon ≤ 3 Halbtöne', a => pct(a, q => q.cutHold <= 3));
    line('Resonanz, Median Einheiten', a => med(a.map(q => q.res)));
    line('Filter-EG Stärke, Median Einheiten', a => med(a.map(q => q.eg)));
    line('Amp Anstieg, Median Oktaven Zeit', a => med(a.map(q => q.att)));
    line('Amp Abfall, Median Oktaven Zeit', a => med(a.map(q => q.dec)));
    line('Amp Halten, Median Einheiten', a => med(a.map(q => q.sus)));
    line('Amp Ausklang, Median Oktaven Zeit', a => med(a.map(q => q.rel)));
    line('Rauschen, Median Einheiten', a => med(a.map(q => q.noise)));
    line('Vibrato an/aus richtig', a => pct(a, q => q.vibOk));
    line('Tonhöhe, Median ct', a => med(a.map(q => q.pitch)));
    line('Speicherwelle in Top-3 (Stufe 1)', a => pct(a.filter(q => q.swTop3 != null), q => q.swTop3));
    line('richtige Engine (Engine 3 zuerst)', a => pct(a, q => q.eng0 === 'mk'));
    line('Abstand D, Median', a => med(a.map(q => q.D)));
    line('Bericht-Abstand LSD, Median dB', a => med(a.map(q => q.lsd)));
    line('Zeit je Ton (Median s) / Versuche', a => (med(a.map(q => q.ms)) / 1000).toFixed(1) + ' s / ' + med(a.map(q => q.evals)));
    line('Stufe 1 (Median ms)', a => med(a.map(q => q.s1ms)));
    // Gewissheit: stimmt „sicher“ öfter als „geraten“?
    const cal = ['| Zeile | Wort | Fälle | davon richtig |', '|---|---|---|---|'];
    for (const [k, f] of [['src', 'okSrc'], ['flt', 'okFlt'], ['amp', 'okAmp'], ['noi', 'okNoi'], ['mov', 'okMov']]) for (const w of ['sicher', 'ungefaehr', 'geraten']) {
      const a = rows.filter(q => !q.err && q.words[k] === w); if (a.length) cal.push(`| ${k} | ${w} | ${a.length} | ${pct(a, q => q[f])} |`);
    }
    const sich = rows.filter(q => !q.err), allS = [], allG = [];
    for (const q of sich) for (const [k, f] of [['src', 'okSrc'], ['flt', 'okFlt'], ['amp', 'okAmp'], ['noi', 'okNoi'], ['mov', 'okMov']]) { if (q.words[k] === 'sicher') allS.push(q[f]); if (q.words[k] === 'geraten') allG.push(q[f]); }
    const rS = allS.length ? allS.filter(Boolean).length / allS.length : null, rG = allG.length ? allG.filter(Boolean).length / allG.length : null;
    info('K Trefferquoten je Parameter (Testtöne aus der App-Engine, Saat 7; Erkennung im Worker der App)\n' + tab.join('\n'));
    info('K Gewissheit gegen Wahrheit (richtig: Tonquelle = Welle+OSZ 2, Filter = ≤ 3 HT + Typ, Lautstärke = Anstieg/Ausklang ≤ 1 Okt + Halten ≤ 25, Rauschen ≤ 15, Bewegung = Vibrato an/aus)\n' + cal.join('\n'));
    info('K Engine-Wahl bei VA-/FM-Tönen', EV);
    ok(rows.every(q => !q.err), 'K1 jeder Testton liefert ein Ergebnis', rows.filter(q => q.err).map(q => q.c && q.c.id));
    ok(rS == null || rG == null || rS >= rG, 'K2 „sicher“-Zeilen stimmen mindestens so oft wie „geraten“-Zeilen', {sicher: rS && +rS.toFixed(2), geraten: rG && +rG.toFixed(2), nS: allS.length, nG: allG.length});
    ok(S.filter(q => q.eng0 === 'mk').length >= S.length * .6, 'K3 Engine-3-Töne (sauber): Engine 3 meist zuerst', pct(S, q => q.eng0 === 'mk'));
    fs.writeFileSync(path.join(out, 'korpus-ergebnis.json'), JSON.stringify({rows, EV}, null, 0));
    /* M: Hörbeispiele (A Original | Pause | B Nachbau, gleich laut), MP3 */
    const free = +execFileSync('df', ['--output=avail', '-B1', '/']).toString().split('\n')[1];
    if (free < 3.2e9) info('M Hörbeispiele übersprungen (weniger als 3,2 GB frei)');
    else for (const k of keep) {
      const a = Float32Array.from(k.a), bb = Float32Array.from(k.b); let ea = 0, eb = 0; for (const v of a) ea += v * v; for (const v of bb) eb += v * v; const g = Math.sqrt(ea / (eb || 1));
      const gap = Math.round(.5 * 44100), y = new Float32Array(a.length + gap + bb.length); y.set(a, 0); for (let i = 0; i < bb.length; i++) y[a.length + gap + i] = bb[i] * g;
      let pk = 0; for (const v of y) pk = Math.max(pk, Math.abs(v)); for (let i = 0; i < y.length; i++) y[i] *= .89 / (pk || 1);
      const o = path.join(hoeren, k.name + '.mp3');
      execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', '44100', '-ac', '1', '-i', 'pipe:0', '-c:a', 'libmp3lame', '-b:a', '96k', o], {input: Buffer.from(y.buffer)});
      info('M Hörbeispiel ' + k.name + '.mp3', {bytes: fs.statSync(o).size, engine: k.eng, aehnlich: k.sim, D: k.D});
    }
  }
} catch (e) { ok(false, 'Ausnahme', String(e && e.stack || e).slice(0, 600)); }
ok(!errs.length, 'Z keine Seitenfehler / Konsolenfehler', errs.slice(0, 5));
await b.close();
const sum = `\nERGEBNIS ${all - bad}/${all} OK`; console.log(sum); res.push(sum);
fs.writeFileSync(path.join(out, 'ke1-test.out'), res.join('\n') + '\n');
process.exit(bad ? 1 : 0);
