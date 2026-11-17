// XLA – DAW-Projekt (.cbp) öffnen, Fassung A, Schritt 2: HALBTON je Spur (⇅½) + P5-Durchlauf (Playwright, Touch per CDP).
// Nur synthetische .cbp (Kopien aus vx/cbpimp/tests). iPhone 12 Pro Max hochkant 428×926 und quer 926×428, dazu 320 px.
// Geprüft: Blatt-Abschnitt „Transponieren“ (Halbton vorgewählt, Noten fest), Passt → xs:1 + follow:false, Projekt-Harmonie unverändert,
// Anzeige ⇅½ (Spurkopf, Spur-Taste), Tastatur −12 … +12 genau (nächster Weg / absolut, AKKORD/TONART, Eine Skala, Akkord), Wiedergabe
// in der Matrix per Touch (noteLog), eigene ⇅-Spur (Wechselwirkung), Song: Rückung je Teil + Träger, MIDI-Export (mit/ohne Träger),
// ↶/↷, Speichern/Laden, ältere Fassung 4.78 (fest und exakt), Spur-Taste ⇅½ → fest → ⇅ → ⇅½, normales Projekt unverändert, „Noten fest“,
// Aufnahme unter dem Träger (gehört = gespeichert), Layout, P5-Durchlauf als Xander (Öffnen … → Beides → Szene → transponieren → Song →
// speichern/laden → ↶/↷) und 3 Minuten Wiedergabe (Ausgang: kein NaN/Übersteuern/Aussetzer/Knackser an den Wechseln, keine hängenden
// Noten, Konsole ohne Fehler). Aufruf: node xla2-test.mjs <index.html> <basis.html>   (LANG=0 → ohne die 3 Minuten)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
const file = path.resolve(process.argv[2]), basis = path.resolve(process.argv[3] || ''), here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(here, 'fotos');
fs.mkdirSync(fotos, {recursive: true});
const LANG = process.env.LANG3 !== '0';
const TF = f => path.join(here, 'tests', f), U8 = f => [...fs.readFileSync(TF(f))];
let bad = 0, good = 0; const out = [];
const ok = (c, m, d) => { const s = (c ? 'OK ' : 'FEHLER ') + m + (d != null && d !== '' ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : ''); if (!c) bad++; else good++; out.push(s); console.log(s); };
const info = m => { out.push('INFO ' + m); console.log('INFO ' + m); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [];
async function page(w, h, f) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push((f ? 'basis: ' : '') + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push((f ? 'basis: ' : '') + m.text()); });
  await p.goto('file://' + (f || file)); await p.waitForTimeout(1500);
  p.cdp = await p.context().newCDPSession(p);
  return p;
}
const tch = (p, type, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
async function tap(p, x, y, hold) { await tch(p, 'touchStart', x, y); await p.waitForTimeout(hold || 50); await tch(p, 'touchEnd'); await p.waitForTimeout(220); }
const ctr = (p, sel, k) => p.evaluate(([s, k]) => { const L = [...document.querySelectorAll(s)].filter(e => e.offsetParent); const e = L[k || 0]; if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, [sel, k]);
async function tapSel(p, sel, k, hold) { const c = await ctr(p, sel, k); if (!c) return false; await tap(p, c.x, c.y, hold); return true; }
const tapText = async (p, sel, txt) => { const k = await p.evaluate(([s, t]) => [...document.querySelectorAll(s)].filter(e => e.offsetParent).findIndex(e => e.textContent.trim().startsWith(t)), [sel, txt]); return k >= 0 ? tapSel(p, sel, k) : false; };
const cur = p => p.evaluate(() => { const c = window.__xla.cur(); if (!c) return null; return {st: c.st, err: c.err, mode: c.mode, tp: c.tp, building: !!c.building, res: !!c.res, xs: c.res ? c.res.xs : null}; });
async function ready(p, ms) { for (let k = 0; k < (ms || 8000) / 100; k++) { await p.waitForTimeout(100); const c = await cur(p); if (c && (c.st === 'fehler' || (c.st === 'fertig' && c.res && !c.building))) return c; } return cur(p); }
const toastText = p => p.evaluate(() => EL.toast && !EL.toast.hidden ? EL.toast.textContent.trim() : '');
const measure = p => p.evaluate(() => {
  const P = UI.pop.el, r = P.getBoundingClientRect(), vis = e => e.offsetParent && e.getClientRects().length;
  const bt = [...P.querySelectorAll('button, summary')].filter(vis), small = bt.filter(b => { const q = b.getBoundingClientRect(); return q.height < 43.5 || q.width < 43.5; }).map(b => b.textContent.trim().slice(0, 16));
  const x = [...P.querySelectorAll('button')].find(b => /✕/.test(b.textContent) || b.getAttribute('aria-label') === 'Schließen'), xr = x && x.getBoundingClientRect();
  const hd = P.querySelector('.psh-h'), hb = hd ? hd.getBoundingClientRect().bottom : -1, inHd = e => !!(hd && hd.contains(e));
  const items = [...P.querySelectorAll('button, input, summary, .imp1st, .xlainfo, .xlabar, .lbl, h5')].filter(vis).filter(e => inHd(e) || e.getBoundingClientRect().top >= hb - .5);
  const outside = items.filter(e => { const q = e.getBoundingClientRect(); return q.right > innerWidth + .5 || q.left < -.5; }).length;
  const ov = []; for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) { const a = items[i], c = items[j]; if (a.contains(c) || c.contains(a)) continue;
    const A = a.getBoundingClientRect(), B = c.getBoundingClientRect(), w = Math.min(A.right, B.right) - Math.max(A.left, B.left), h = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
    if (w > 1 && h > 1) ov.push((a.textContent || a.tagName).trim().slice(0, 12) + '×' + (c.textContent || c.tagName).trim().slice(0, 12)); }
  const tp = [...P.querySelectorAll('button[data-x="tph"], button[data-x="tpf"]')].filter(vis).map(b => { const q = b.getBoundingClientRect(); return [Math.round(q.width), Math.round(q.height)]; });
  return {pop: [r.left, r.top, r.width, r.height].map(Math.round), xVis: !!xr && xr.top >= 0 && xr.bottom <= innerHeight && xr.right <= innerWidth + .5 && xr.left >= -.5, small: small.slice(0, 5), out: outside, ov: ov.slice(0, 5), hscroll: document.documentElement.scrollWidth > innerWidth + 1, n: items.length, tp};
});
const layoutOk = (m, w) => m.xVis && !m.small.length && !m.out && !m.ov.length && m.pop[0] >= 0 && m.pop[0] + m.pop[2] <= w + .5 && !m.hscroll && m.tp.length === 2;
async function openImport(p) { await p.evaluate(() => { closePop(); va1Sheet(); }); await p.waitForTimeout(300); await tapSel(p, 'button[data-va="midiin"]'); await p.waitForTimeout(300); }
async function pick(p, f, sel) {
  const fc = p.waitForEvent('filechooser', {timeout: 5000});
  const s = sel || await p.evaluate(() => UI.pop && UI.pop.name === 'xla' ? '.xla button[data-x="pick"]' : '.imp1 button[data-i="pick"]');
  if (typeof s === 'function') await s(); else await tapSel(p, s);
  const ch = await fc.catch(() => null); if (!ch) return null;
  await ch.setFiles({name: f, mimeType: 'application/octet-stream', buffer: fs.readFileSync(TF(f))});
  return ready(p);
}
// Seiten-Helfer: Taste in TRANSPONIEREN drücken (über inputDown, wie eine echte Taste), danach den gültigen Träger-Eintrag lesen
const PAGE_HELP = () => {
  window.__w = ms => new Promise(r => setTimeout(r, ms));
  window.__press = async (notes, ms) => { if (R.kbMode !== 'transpose') setKbMode('transpose'); for (const n of notes) SYNQUENZER.keyOn(n, .8, 'x' + n); await __w(ms || 60); for (const n of notes) SYNQUENZER.keyOff(n, 'x' + n); await __w(80); const e = T.current(); return {time: e.time, shift: e.shift, root: e.target ? e.target.root : null, now: AU.ctx ? AU.ctx.currentTime : 0}; };
  // Soll je Note: vor dem Wechsel der alte Stand, danach der neue; eine Note zwischen Taktstrich und dem Übernehmen (Gnade) darf noch den alten haben
  window.__want = (chg, t) => { let v = 0, prev = 0, g = false; for (const x of chg) if (x.time <= t + 1e-6) { prev = v; v = x.shift; g = x.now != null && t < x.now + .012; } return g ? [v, prev] : [v]; };
  // alle Clip-Noten der ⇅½-Spuren: out − n unter dem gültigen Träger (Soll k), DRUMS unverändert
  window.__exact = k => { const now = nowT(); let n = 0, badN = 0, dr = 0, drBad = 0; const ex = [];
    S.tracks.forEach((t, i) => { for (const c of t.clips) if (c) for (const x of c.notes) { const o = outPitch(i, c.key, x.n, now);
      if (t.kind === 'drum') { dr++; if (o !== x.n) drBad++; } else if (t.xs === 1) { n++; let w = x.n + k; while (w > 127) w -= 12; while (w < 0) w += 12; if (o !== w) { badN++; if (ex.length < 3) ex.push([i, x.n, o, w]); } } } });
    return {n, bad: badN, dr, drBad, ex}; };
  window.__slim = L => L.map(e => ({seq: e.seq, t: e.track, src: e.src, c: e.clipNote, o: e.out, time: e.time, beat: e.beat}));
};
const T0 = Date.now();
/* ===== 13. 3 Minuten Wiedergabe ===== */
async function lang3() {
  const q = await page(926, 428);
  await q.evaluate(PAGE_HELP);
  const e0 = errs.length;
  await q.evaluate(async u => { ensureAudio(); await __w(1500); await window.__xla.file(Uint8Array.from(u).buffer, 'Lang'); for (let k = 0; k < 60; k++) { await __w(100); const c = window.__xla.cur(); if (c && c.res && !c.building) break; } await window.__xla.apply(); await __w(1200); }, U8('synth-song.cbp'));
  const RUN = await q.evaluate(async () => {
    const c = AU.ctx; if (c.state !== 'running') { try { await c.resume(); } catch (e) {} }
    // Ausgang abgreifen (nach dem Begrenzer): je 128er-Block Spitze, größter Sprung von Abtastwert zu Abtastwert, NaN; 1 Nachricht je 256 Blöcke
    const src = 'class X2R extends AudioWorkletProcessor{constructor(){super();this.on=true;this.b=[];this.last=0;this.port.onmessage=()=>{this.on=false;this.flush()}}flush(){if(this.b.length){this.port.postMessage(this.b);this.b=[]}}process(i){const x=i[0]&&i[0][0];if(!this.on)return true;let pk=0,md=0,nan=0,l=this.last;if(x){for(let k=0;k<x.length;k++){const v=x[k];if(!isFinite(v)){nan++;continue}const a=v<0?-v:v;if(a>pk)pk=a;const d=v-l;const ad=d<0?-d:d;if(ad>md)md=ad;l=v}this.last=l}this.b.push(currentFrame,pk,md,nan,x?1:0);if(this.b.length>=1280)this.flush();return true}}registerProcessor("x2rec",X2R);';
    await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
    const rec = new AudioWorkletNode(c, 'x2rec', {numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1], channelCount: 1, channelCountMode: 'explicit'});
    const z = c.createGain(); z.gain.value = 0; rec.connect(z); z.connect(c.destination); AU.M.ceil.connect(rec);
    const blocks = []; rec.port.onmessage = e => { for (const v of e.data) blocks.push(v); };
    window.__lt2 = []; const pc0 = performance.now(), ac0 = c.currentTime; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt2.push([Math.round(e.duration), +((e.startTime - pc0) / 1000 + ac0).toFixed(2)]); }).observe({type: 'longtask', buffered: false}); } catch (e) {}
    const ms = S.song.marks.slice().sort((a, b) => a.a - b.a); jam2RkSet(ms[4].id, 1);   // Rückung +1 ab dem 5. Teil
    songLoopRange({on: true, a: 0, b: S.song.bars});
    const tick0 = TICKERR.n, log = new Map(), chg = [{time: -Infinity, shift: 0, phase: 'song'}], keep = () => { for (const e of __slim(noteLog(4096))) log.set(e.seq, e); };
    const r = S.key.root, seq = [2, -3, 5, 0, -5, 4, -1, 3, -2, 1, 0, 6 - 12, 2, -4];
    clearLog(); const t0 = c.currentTime; SYNQUENZER.songPlay(0);
    let k = 0;
    while (c.currentTime - t0 < 110) { await __w(6000); keep(); const e = await __press([60 + r + seq[k++ % seq.length]]); setKbMode('play'); chg.push({time: e.time, shift: e.shift, now: e.now, phase: 'song'}); }
    keep(); SYNQUENZER.songPlay(false); SYNQUENZER.stop(); await __w(400); keep();
    const tStopSong = c.currentTime; setSongView(false); await __w(300);
    let s = 0; launchScene(0); play(); chg.push({time: c.currentTime, shift: T.current().shift, phase: 'matrix'});
    while (c.currentTime - t0 < 180) { await __w(4000); keep(); s = (s + 1) % 4; launchScene(s); await __w(4000); keep(); const e = await __press([60 + r + seq[k++ % seq.length]]); setKbMode('play'); chg.push({time: e.time, shift: e.shift, now: e.now, phase: 'matrix'}); }
    keep(); const tStop = c.currentTime; SYNQUENZER.stop(); await __w(4200); keep();
    rec.port.postMessage(0); await __w(200); try { AU.M.ceil.disconnect(rec); } catch (e) {}
    const alive = VOICES.filter(v => !v.dead).length;
    // Auswertung Noten: ⇅½-Spuren out − Clip = Träger zur Zeit der Note (+ Rückung 0/1 im Song), DRUMS unverändert
    const kAt = t => { let v = 0; for (const x of chg) if (x.time <= t + 1e-6) v = x.shift; return v; };
    const st = {song: {n: 0, d0: 0, d1: 0, bad: 0}, matrix: {n: 0, d0: 0, d1: 0, bad: 0}, dr: 0, drBad: 0, ex: []};
    for (const e of log.values()) { const tr = S.tracks[e.t]; if (!tr || e.src === 'live') continue;
      if (tr.kind === 'drum') { st.dr++; if (e.o !== e.c) st.drBad++; continue; }
      if (tr.xs !== 1) continue; const ph = e.time < tStopSong ? st.song : st.matrix, w = __want(chg, e.time), x = e.o - e.c; ph.n++;
      if (w.includes(x)) ph.d0++; else if (ph === st.song && w.includes(x - 1)) ph.d1++; else { ph.bad++; if (st.ex.length < 4) st.ex.push([e.t, e.c, e.o, w, +e.time.toFixed(2)]); } }
    // Auswertung Ausgang
    const sr = c.sampleRate, nb = blocks.length / 5, F = i => blocks[i * 5], PK = i => blocks[i * 5 + 1], MD = i => blocks[i * 5 + 2];
    let nan = 0, peak = 0, lost = 0; const lostAt = []; for (let i = 0; i < nb; i++) { nan += blocks[i * 5 + 3]; if (PK(i) > peak) peak = PK(i); if (i && F(i) - F(i - 1) !== 128) { lost += Math.max(1, Math.round((F(i) - F(i - 1)) / 128) - 1); if (lostAt.length < 12) lostAt.push(+(F(i - 1) / sr).toFixed(2)); } }
    const frameOf = t => Math.round(t * sr), idxAt = t => { const f = frameOf(t); let lo = 0, hi = nb - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (F(mid) < f) lo = mid + 1; else hi = mid; } return lo; };
    const playA = idxAt(t0 + .3), playB = idxAt(tStop - .1), gapA = idxAt(tStopSong - .2), gapB = idxAt(tStopSong + 1.5);
    let run = 0, runMax = 0; for (let i = playA; i < playB; i++) { if (i >= gapA && i <= gapB) { run = 0; continue; } if (PK(i) < 1e-5) { run++; if (run > runMax) runMax = run; } else run = 0; }
    const mds = []; for (let i = playA; i < playB; i++) if (!(i >= gapA && i <= gapB)) mds.push(MD(i)); mds.sort((a, b) => a - b);
    const p999 = mds[Math.floor(mds.length * .999)] || 0, pMax = mds[mds.length - 1] || 0;
    const atChg = chg.filter(x => isFinite(x.time) && x.time > t0 + .3 && x.time < tStop - .1).map(x => { const i0 = idxAt(x.time - .006), i1 = idxAt(x.time + .03); let mm = 0; for (let i = i0; i <= i1; i++) mm = Math.max(mm, MD(i)); return +mm.toFixed(4); });
    const tail = []; for (let s0 = 0; s0 < 4; s0 += .5) { const a = idxAt(tStop + s0), b2 = idxAt(tStop + s0 + .5); let mm = 0; for (let i = a; i < b2; i++) mm = Math.max(mm, PK(i)); tail.push(+(20 * Math.log10(mm + 1e-12)).toFixed(1)); }
    return {sec: +(tStop - t0).toFixed(1), notes: log.size, st, chg: chg.length - 1, nan, peak: +peak.toFixed(4), lost, maxSilentMs: +(runMax * 128 / sr * 1000).toFixed(1), p999: +p999.toFixed(4), pMax: +pMax.toFixed(4), atChgMax: Math.max(0, ...atChg), atChg: atChg.length, tail, alive, tick: TICKERR.n - tick0, lt: window.__lt2.filter(d => d[0] > 100), lostAt, t0: +t0.toFixed(2), tStopSong: +tStopSong.toFixed(2), events: chg.filter(x => isFinite(x.time)).slice(0, 4).map(x => +x.time.toFixed(2))};
  });
  info('3 Minuten: ' + JSON.stringify(RUN));
  if (process.env.BASIS3 === '1') { info('Vergleichslauf (ohne ⇅½): nur Ausgang'); } else ok(RUN.sec >= 178 && RUN.st.song.n > 300 && RUN.st.song.bad === 0 && RUN.st.song.d1 > 20 && RUN.st.song.d0 > 20 && RUN.st.matrix.n > 100 && RUN.st.matrix.bad === 0 && RUN.st.drBad === 0,
    '3 Minuten (Song mit Schleife + Matrix mit Szenenwechseln, ' + RUN.chg + ' Träger-Wechsel): jede Note der ⇅½-Spuren genau um den Träger (im Song + Rückung ab Teil 5), DRUMS unverändert', {song: RUN.st.song, matrix: RUN.st.matrix, ex: RUN.st.ex});
  ok(RUN.nan === 0 && RUN.peak <= 1.0001 && RUN.maxSilentMs < 100, '3 Minuten Ausgang: kein NaN, kein Übersteuern (Spitze ≤ 1), keine Aussetzer (keine Stille im Lauf)', {spitze: RUN.peak, still: RUN.maxSilentMs + ' ms'});
  info('Takt-Lücken des Audio-Fadens (geteilte CPU, Vergleichslauf ohne ⇅½ siehe xla2-lang-basis.out): ' + RUN.lost);
  ok(RUN.atChg > 15 && RUN.atChgMax <= Math.max(RUN.p999 * 1.5, .05), 'keine Knackser an den Träger-Wechseln: größter Sprung dort ≤ 1,5 × 99,9-%-Wert der ganzen Wiedergabe', {wechsel: RUN.atChg, dort: RUN.atChgMax, p999: RUN.p999, max: RUN.pMax});
  const tl = RUN.tail;
  ok(RUN.alive === 0 && tl[tl.length - 1] < -60 && Math.max(...tl.slice(-3)) < -55 && tl[0] > tl[tl.length - 1] + 30 && RUN.tick === 0, 'nach dem Stopp: alle Stimmen frei, der Ausklang (Hall/Echo) fällt unter −60 dBFS – keine hängenden Noten; Planer ohne Fehler', {ausklang: tl.join(' ') + ' dBFS'});
  if (RUN.lt.length) info('Long Tasks > 100 ms während der 3 Minuten [ms, Audiozeit]: ' + JSON.stringify(RUN.lt) + ' · Start ' + RUN.t0 + ' · Song-Stopp ' + RUN.tStopSong);
  if (RUN.lost) info('Lücken im Audio-Takt bei ' + JSON.stringify(RUN.lostAt));
  ok(errs.length === e0, '3 Minuten: Konsole ohne Fehler', errs.slice(e0, e0 + 3));
  await q.close();
  return RUN;
}

if (process.env.NUR3 === '1') { await lang3(); await b.close(); const sum = `\n${good} OK, ${bad} FEHLER · ${((Date.now() - T0) / 1000).toFixed(0)} s`; console.log(sum); out.push(sum); fs.writeFileSync(path.join(here, 'xla2-lang' + (process.env.BASIS3 === '1' ? '-basis' : '') + '.out'), out.join('\n') + '\n'); process.exit(bad ? 1 : 0); }

/* ===== 1. Blatt: Abschnitt „Transponieren“ (hochkant) ===== */
let p = await page(428, 926);
await p.evaluate(PAGE_HELP);
await p.evaluate(() => { applyProject(normalizeProject(demoProjectRaw()), {}); S.name = 'Vorher-Projekt'; setBpm(97); markDirty(); });
await p.evaluate(async () => { ensureAudio(); await __w(2000); if (autosave) await autosave.flush(); });
await openImport(p);
let c = await pick(p, 'synth-song.cbp');
const tp1 = await p.evaluate(() => { const B = [...document.querySelectorAll('.xla button[data-x="tph"], .xla button[data-x="tpf"]')]; const h5 = [...document.querySelectorAll('.xla h5')].map(e => e.textContent);
  const inf = [...document.querySelectorAll('.xla .xlainfo')].map(e => e.textContent).find(t => /TRANSPONIEREN|Tastatur/.test(t)) || '';
  return {h5, btn: B.map(b => ({x: b.dataset.x, t: b.querySelector('b') ? b.querySelector('b').textContent : b.textContent, s: b.querySelector('small') ? b.querySelector('small').textContent : '', on: b.classList.contains('on')})), inf, key: window.__xla.cur().sum.key}; });
ok(c && c.st === 'fertig' && tp1.h5.includes('Transponieren') && tp1.btn.length === 2 && tp1.btn[0].x === 'tph' && tp1.btn[0].on && !tp1.btn[1].on && /Halbton \(empfohlen\)/.test(tp1.btn[0].t) && /Noten fest/.test(tp1.btn[1].t) && c.tp === 'halbton',
  'Blatt: Abschnitt „Transponieren“ – „Halbton (empfohlen)“ vorgewählt, daneben „Noten fest“', tp1.btn.map(x => x.t + ' / ' + x.s + (x.on ? ' [an]' : '')));
ok(/die Taste [A-H][♯♭]? spielt das Original/.test(tp1.inf) && /einen Halbton höher/.test(tp1.inf), 'Hinweis in einfachem Deutsch: welche Taste das Original spielt, eine Taste höher = einen Halbton', tp1.inf);
await p.evaluate(() => { const e = [...document.querySelectorAll('.xla h5')].find(h => h.textContent === 'Transponieren'); if (e) e.scrollIntoView({block: 'center'}); });
let m = await measure(p);
ok(layoutOk(m, 428), 'Blatt hochkant 428×926 mit „Transponieren“: ✕ sichtbar, Tasten ≥ 44, nichts außerhalb, keine Überlappung', m);
await p.screenshot({path: path.join(fotos, 'xla2-p-blatt.png')});
await tapSel(p, '.xla button[data-x="tpf"]'); c = await ready(p);
const tpF = await p.evaluate(() => ({on: [...document.querySelectorAll('.xla button[data-x="tpf"].on')].length, inf: [...document.querySelectorAll('.xla .xlainfo')].map(e => e.textContent).join(' | ')}));
ok(c.tp === 'fest' && c.xs === false && tpF.on === 1 && /lässt die Spuren aus/.test(tpF.inf), 'Tippen „Noten fest“: gewählt, der Kern rechnet ohne xs, Hinweis „Die Tastatur lässt die Spuren aus“', {tp: c.tp, xs: c.xs});
await tapSel(p, '.xla button[data-x="tph"]'); c = await ready(p);
ok(c.tp === 'halbton' && c.xs === true, 'zurück auf „Halbton“: der Kern rechnet mit xs');

/* ===== 2. Passt → Projekt mit ⇅½ ===== */
const harm0 = await p.evaluate(() => ({mode: S.settings.harmony.mode, def: newProjectRaw().settings.harmony.mode}));
await tapSel(p, '.xla button[data-x="ok"]'); await p.waitForTimeout(1500);
const A = await p.evaluate(() => ({tr: S.tracks.map(t => ({n: t.name, k: t.kind, f: t.follow, xs: t.xs, os: t.os, cl: t.clips.filter(Boolean).length, lane: S.song ? (S.song.lanes[S.tracks.indexOf(t)] || []).length : 0})),
  ht: S.xlaHt, mode: S.settings.harmony.mode, sel: R.selT, sv: !!UI.songView, toast: EL.toast.textContent, key: S.key,
  strip: {cls: EL.bFolgt.className, ck: EL.bFolgt.querySelector('.ck').textContent, ckVis: EL.bFolgt.querySelector('.ck').offsetWidth > 0, aria: EL.bFolgt.getAttribute('aria-label')}}));
const imp = A.tr.map((t, i) => ({...t, i})).filter(t => t.k === 'synth' && (t.cl || t.lane));
ok(imp.length >= 3 && imp.every(t => t.f === false && t.xs === 1 && t.os === false) && A.tr.filter(t => t.k === 'drum').every(t => t.xs == null), 'Passt: alle importierten Synth-Spuren ⇅ fest + xs:1, Eine Skala aus; DRUMS ohne xs', imp.map(t => t.n));
ok(A.tr[3].n === 'Synth 4' && A.tr[3].f === true && A.tr[3].xs == null, 'die leere Spur „Synth 4“ bleibt eine normale ⇅-Spur (folgt, ohne xs)');
ok(A.ht === 1 && A.mode === harm0.def && /Tastatur: Halbton/.test(A.toast), 'Projekt: Kennzeichen xlaHt, Projekt-Harmonie unverändert (' + A.mode + '), Meldung „… · Tastatur: Halbton“', A.toast.slice(0, 80));
ok(A.sel === imp[0].i && /xlaxs/.test(A.strip.cls) && / on|^on| on$/.test(' ' + A.strip.cls + ' ') && A.strip.ck === '½' && A.strip.ckVis && /Halbtönen/.test(A.strip.aria), 'gewählt ist die erste importierte Spur; ihre Spur-Taste zeigt ⇅½ (auch hochkant sichtbar)', A.strip);
await p.evaluate(() => setSongView(false)); await p.waitForTimeout(500);
const H = await p.evaluate(() => { const o = []; for (const i of MX.rows) { const h = UI.heads[i]; if (!h) continue; const f = h.fb.getBoundingClientRect(), n = h.nm.getBoundingClientRect(), ov = Math.min(f.right, n.right) - Math.max(f.left, n.left) > 1 && Math.min(f.bottom, n.bottom) - Math.max(f.top, n.top) > 1;
  o.push({i, fb: h.fb.textContent, vis: f.width > 0, ov}); } return o; });
const hx = H.filter(x => imp.some(t => t.i === x.i));
ok(hx.length === imp.length && hx.every(x => x.fb === '⇅½' && x.vis && !x.ov) && H.find(x => x.i === 3).fb === '⇅', 'Matrix-Spurköpfe: importierte Spuren „⇅½“, „Synth 4“ „⇅“, nichts überdeckt den Namen', H.map(x => x.i + ':' + x.fb + (x.ov ? '!' : '')));
await p.screenshot({path: path.join(fotos, 'xla2-p-matrix.png')});

/* ===== 3. Tastatur genau in Halbtönen (über die echte Eingabe) ===== */
const K = await p.evaluate(async () => {
  const h = S.settings.harmony, r = S.key.root, res = {near: [], abs: [], scale: [], os: [], chord: null};
  h.octaveMode = 'nearest'; T.setOptions(transposerOpts()); T.rekey();
  for (const k of [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]) { const e = await __press([60 + r + k]); res.near.push({k, sh: e.shift, ...__exact(k)}); }
  { const e = await __press([60 + r + 7]); res.near.push({k: -5, via: '+7', sh: e.shift, ...__exact(-5)}); }
  h.octaveMode = 'absolute'; T.setOptions(transposerOpts()); T.rekey();
  const ref = Harmony.refNote(S.key);
  for (let k = -12; k <= 12; k++) { const e = await __press([ref + k]); res.abs.push({k, sh: e.shift, ...__exact(k)}); }
  h.octaveMode = 'nearest'; h.mode = 'scale'; T.setOptions(transposerOpts()); T.rekey();
  for (const k of [1, 3, -2]) { const e = await __press([60 + r + k]); res.scale.push({k, sh: e.shift, ...__exact(k)}); }   // TONART: ein Grundton außerhalb der Tonart (z. B. C♯) – die ⇅½-Spuren gehen trotzdem genau dorthin
  h.mode = 'chord'; h.oneScale = true; T.setOptions(transposerOpts()); T.rekey();
  for (const k of [2, -3]) { const e = await __press([60 + r + k]); res.os.push({k, ...__exact(k)}); }
  h.oneScale = false; T.setOptions(transposerOpts());
  const maj = S.key.scale === 'ionian', cr = maj ? r + 9 : r + 3, chord = maj ? [57 + r, 60 + r, 64 + r] : [51 + r, 55 + r, 58 + r];   // Moll-Akkord auf VI (Dur) bzw. Dur-Akkord auf III (Moll)
  const e = await __press(chord), k = Harmony.nearestShift(cr % 12, r, 0);
  res.chord = {k, sh: e.shift, root: e.root, ...__exact(e.shift)};
  return res;
});
const sumBad = L => L.reduce((a, x) => a + x.bad + x.drBad, 0), sumN = L => L.reduce((a, x) => a + x.n, 0);
ok(K.near.length === 12 && sumBad(K.near) === 0 && K.near.every(x => x.sh === x.k) && sumN(K.near) > 500, 'Oktave „nächster Weg“: jede Taste −5 … +6 verschiebt jede Note aller Szenen genau um k Halbtöne (C+7 = −5), DRUMS unverändert', {noten: sumN(K.near), falsch: sumBad(K.near)});
ok(K.abs.length === 25 && sumBad(K.abs) === 0 && K.abs.every(x => x.sh === x.k), 'Oktave „absolut“: Taste −12 … +12 → genau −12 … +12 Halbtöne, keine Note eingerastet, DRUMS unverändert', {noten: sumN(K.abs), falsch: sumBad(K.abs)});
ok(sumBad(K.scale) === 0 && sumN(K.scale) > 0, 'Harmonie TONART (auch ein Grundton außerhalb der Tonart): ⇅½-Spuren gehen genau um den Grundton – kein Einrasten', K.scale.map(x => x.k + ':' + x.bad));
ok(sumBad(K.os) === 0, '„Eine Skala“ an: ⇅½-Spuren bleiben genau (keine Skala auf den importierten Noten)', K.os.map(x => x.k + ':' + x.bad));
ok(K.chord && K.chord.bad === 0 && K.chord.drBad === 0 && K.chord.sh === K.chord.k, 'Akkord gedrückt: ⇅½-Spuren nur um den Grundton (genau), DRUMS unverändert', K.chord);

/* ===== 4. Wiedergabe in der Matrix per Touch + eigene ⇅-Spur (Wechselwirkung) ===== */
await p.evaluate(async () => { const h = S.settings.harmony; h.octaveMode = 'nearest'; T.setOptions(transposerOpts()); await __press([60 + S.key.root]); setKbMode('play');   // zurück aufs Original
  const r = S.key.root, maj = S.key.scale === 'ionian', third = maj ? 4 : 3;
  SYNQUENZER.setClip(3, 1, {len: 1, key: {root: r, scale: S.key.scale}, notes: [0, 1, 2, 3].map(q => ({t: q, d: .9, n: 60 + r + [0, third, 7, third][q], v: .7}))});   // eigene Spur: Grundton, Terz, Quinte
  clearLog(); });
await tapSel(p, '#clipGrid .scn[data-s="1"]'); await p.waitForTimeout(400); if (!(await p.evaluate(() => R.playing))) await tapSel(p, '#bPlay'); await p.waitForTimeout(1800);
await tapSel(p, '#segTr'); await p.waitForTimeout(200);
const kbT = await p.evaluate(() => { const r = S.key.root; const L = [...KB.byNote.entries()].filter(([n, k]) => k.el.offsetParent && k.el.getBoundingClientRect().width > 10).map(([n]) => n); const want = L.find(n => ((n - r) % 12 + 12) % 12 === 2) ?? L[2]; return {n: want, mode: R.kbMode}; });
const kc = await ctr(p, '#kb [data-n="' + kbT.n + '"]') || await p.evaluate(n => { const k = KB.byNote.get(n); const q = k.el.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height * .8}; }, kbT.n);
await tap(p, kc.x, kc.y, 120); await p.waitForTimeout(300);
const ch1 = await p.evaluate(() => { const e = T.current(); return {time: e.time, shift: e.shift, root: e.target && e.target.root, now: AU.ctx.currentTime}; });
await p.waitForTimeout(4300);
const chordKeys = await p.evaluate(() => { const r = S.key.root, maj = S.key.scale === 'ionian'; return maj ? [57 + r, 60 + r, 64 + r] : [60 + r + 3 - 12, 64 + r + 3 - 12, 67 + r + 3 - 12]; });
const ch2 = await p.evaluate(async ks => __press(ks), chordKeys);
await p.waitForTimeout(4500);
const W = await p.evaluate(async ([c1, c2]) => {
  const L = __slim(noteLog(4096)); const own = []; let xsN = 0, xsBad = 0, drN = 0, drBad = 0; const ex = [];
  const chg = [{time: -Infinity, shift: 0}, c1, c2];
  for (const e of L) { const tr = S.tracks[e.t]; if (!tr || e.src === 'live') continue;
    if (tr.kind === 'drum') { drN++; if (e.o !== e.c) drBad++; continue; }
    if (tr.xs === 1) { xsN++; const w = __want(chg, e.time); if (!w.includes(e.o - e.c)) { xsBad++; if (ex.length < 4) ex.push([e.t, e.c, e.o, w, +e.time.toFixed(3)]); } }
    if (e.t === 3) own.push(e); }
  // eigene ⇅-Spur: dieselbe Abbildung wie ohne die ⇅½-Spuren (keine Wechselwirkung) und unter dem Akkord nicht bloß verschoben
  const ent2 = T.targetAt(c2.time + 1e-3), key = S.tracks[3].clips[1].key, saved = S.tracks.map(t => t.xs);
  const withXs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(q => outPitch(3, key, 60 + q, c2.time + 1e-3, ent2));
  S.tracks.forEach(t => { delete t.xs; }); const noXs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(q => outPitch(3, key, 60 + q, c2.time + 1e-3, ent2)); S.tracks.forEach((t, i) => { if (saved[i]) t.xs = saved[i]; });
  const ownAfter = own.filter(e => e.time >= Math.max(c2.time, c2.now + .012)), ownShifted = ownAfter.filter(e => e.o - e.c !== c2.shift).length;
  const ownOk = ownAfter.every(e => e.o === outPitch(3, key, e.c, e.time, T.targetAt(e.time + 1e-6)));
  return {n: L.length, xsN, xsBad, drN, drBad, ex, c1, c2, ownOk0: ownOk, same0: JSON.stringify(withXs) === JSON.stringify(noXs), own: own.length, ownAfter: ownAfter.length, ownShifted, ownOk, same: JSON.stringify(withXs) === JSON.stringify(noXs), withXs, playing: R.playing, mode: R.kbMode};
}, [ch1, ch2]);
ok(kbT.mode === 'transpose' && W.playing && ch1.shift === 2, 'Touch: Szene 2 gestartet (▶), Modus ⇅ TRANSPONIEREN, eine Taste (Ganzton über dem Grundton) gedrückt → +2', {taste: kbT.n, c1: ch1});
ok(W.xsN > 40 && W.xsBad === 0 && W.drN > 10 && W.drBad === 0, 'Wiedergabe (noteLog): jede gespielte Note der ⇅½-Spuren genau um den Träger versetzt (0 → +2 → Akkord-Grundton), DRUMS unverändert', {xs: W.xsN, falsch: W.xsBad, drums: W.drN, ex: W.ex, c2: W.c2.shift});
ok(W.own > 0 && W.ownAfter > 0 && W.ownOk && W.same && W.ownShifted > 0, 'eigene ⇅-Spur im selben Projekt: folgt weiter dem Akkord (nicht bloß verschoben) und klingt genau wie ohne ⇅½-Spuren – keine Wechselwirkung', {own: W.own, nachAkkord: W.ownAfter, nichtBloßVerschoben: W.ownShifted, gleich: W.ownOk, ohneXsGleich: W.same});
await tapSel(p, '#bPlay'); await p.waitForTimeout(3000);
const st1 = await p.evaluate(() => ({alive: VOICES.filter(v => !v.dead).length, playing: R.playing, tick: TICKERR.n}));
ok(!st1.playing && st1.alive === 0, 'Stopp per Touch: keine hängenden Noten (alle Stimmen frei)', st1);

/* ===== 5. Song: Rückung je Teil + Träger, MIDI-Export, ↶/↷ ===== */
const R5 = await p.evaluate(async () => {
  SYNQUENZER.setClip(3, 1, null);
  await __press([60 + S.key.root]); setKbMode('play');
  const parse = u8 => va1MidiParse(u8.bytes || u8).tracks.map(t => ({name: t.name, notes: t.notes.map(n => [+n.t.toFixed(3), n.n])}));
  const E0 = parse(buildMidiSong(false)), ms = S.song.marks.slice().sort((a, b) => a.a - b.a), m = ms[2];
  const u0 = UNDO.length, okSet = jam2RkSet(m.id, 1), top = UNDO[UNDO.length - 1];
  const E1 = parse(buildMidiSong(false)), mb = barBeat(m.a), synthNames = S.tracks.filter(t => t.xs === 1).map(t => t.name);
  let n = 0, badN = 0, drSame = true;
  for (let k = 0; k < E0.length; k++) { const a = E0[k], b2 = E1[k]; if (!b2) { badN++; continue; } const syn = synthNames.some(s => a.name.startsWith(s + ' ('));
    if (/^Drums/.test(a.name) || !syn) { if (JSON.stringify(a.notes) !== JSON.stringify(b2.notes)) drSame = false; continue; }
    a.notes.forEach((x, j) => { n++; const y = b2.notes[j]; if (!y || y[0] !== x[0] || y[1] !== x[1] + (x[0] >= mb - 1e-6 ? 1 : 0)) badN++; }); }
  // mit Träger im Song: ein Grundton zwei Halbtöne höher ab Takt 1 → ⇅½-Spuren +2 dazu
  const nm = noteNames()[(S.key.root + 2) % 12], okC = songSetChord(0, nm);
  const E2 = parse(buildMidiSong(true)); let n2 = 0, bad2 = 0;
  for (let k = 0; k < E1.length; k++) { const a = E1[k], b2 = E2[k]; const syn = synthNames.some(s => a.name.startsWith(s + ' (')); if (!syn || !b2) continue; a.notes.forEach((x, j) => { n2++; const y = b2.notes[j]; if (!y || y[1] !== x[1] + 2) bad2++; }); }
  undo(); await __w(200);                                                  // Träger im Song wieder weg
  return {okSet, label: top && top.label, undoN: UNDO.length - u0, n, bad: badN, drSame, okC, n2, bad2, mb, ma: m.a, mid: m.id, carrier: S.song.carrier.length};
});
ok(R5.okSet && /Rückung/.test(R5.label || ''), 'Song: Rückung +1 ab dem 3. Teil (Marken-Blatt-Weg jam2RkSet), ein ↶-Eintrag', R5.label);
ok(R5.n > 100 && R5.bad === 0 && R5.drSame, 'MIDI-Export: ⇅½-Spuren ab dem Teil genau +1, davor unverändert; DRUMS gleich', {noten: R5.n, falsch: R5.bad});
ok(R5.okC && R5.n2 > 100 && R5.bad2 === 0 && R5.carrier === 0, 'MIDI-Export mit Träger im Song (Grundton +2): ⇅½-Spuren genau +2 dazu; ↶ nimmt den Träger wieder weg', {noten: R5.n2, falsch: R5.bad2});
// Abspielen: 2 Takte vor dem Teil bis 2 Takte danach, Träger +2 → davor +2, danach +3
await p.evaluate(() => setSongView(true)); await p.waitForTimeout(400);
const off = await p.evaluate(async a => { clearLog(); SYNQUENZER.songPlay(Math.max(0, a - 2)); await __w(150); const e = await __press([60 + S.key.root + 2]); setKbMode('play'); window.__c5 = e; return R.songPlay ? R.songPlay.off : null; }, R5.ma);
await p.waitForTimeout(9000);
const P5 = await p.evaluate(mb => { const L = __slim(noteLog(4096)), c = window.__c5, off = R.songPlay ? R.songPlay.off : null; SYNQUENZER.stop(); let pre = 0, post = 0, badN = 0; const ex = [];
  for (const e of L) { const tr = S.tracks[e.t]; if (!tr || tr.xs !== 1 || e.src === 'live' || e.beat == null || e.time < Math.max(c.time, c.now + .012) - 1e-6) continue; const sb = e.beat - off, want = c.shift + (sb >= mb - 1e-6 ? 1 : 0);
    if (sb >= mb - 1e-6) post++; else pre++; if (e.o - e.c !== want) { badN++; if (ex.length < 3) ex.push([e.t, e.c, e.o, want, +sb.toFixed(2)]); } }
  return {pre, post, bad: badN, ex, sh: c.shift}; }, R5.mb);
ok(off != null && P5.pre > 5 && P5.post > 5 && P5.bad === 0 && P5.sh === 2, 'Song spielt: vor dem Teil genau +2 (Träger), ab dem Teil genau +3 (Träger + Rückung) – Rückung je Teil bleibt nutzbar', P5);
// ↶ / ↷ der Rückung per Touch (Strip-Taste ↶ – der Song-Editor ist offen; ↷ über den Verlauf)
const midiNow = () => p.evaluate(() => JSON.stringify(va1MidiParse(buildMidiSong(false).bytes).tracks.map(t => t.notes.map(n => n.n))));
const mAfter = await midiNow();
await p.evaluate(() => { if (R.playing) SYNQUENZER.stop(); }); await p.waitForTimeout(300);
const ubtn = await p.evaluate(() => { const b = [...document.querySelectorAll('#bUndo, .sv-undo, button[aria-label^="Rückgängig"]')].find(x => x.offsetParent); return b ? (b.id ? '#' + b.id : null) : null; });
if (ubtn) await tapSel(p, ubtn); else await p.evaluate(() => undo());
await p.waitForTimeout(400);
const U5 = await p.evaluate(id => ({rk: (S.song.marks.find(x => x.id === id) || {}).rk || 0, redo: REDO.length && REDO[REDO.length - 1].label}), R5.mid);
const mUndo = await midiNow();
await p.evaluate(() => redo()); await p.waitForTimeout(300);
const mRedo = await midiNow();
ok(U5.rk === 0 && mUndo !== mAfter && mRedo === mAfter && /Rückung/.test(U5.redo || ''), '↶ (Touch) nimmt die Rückung zurück (Export wie vorher), ↷ stellt sie wieder her (Export gleich)', {undoKnopf: ubtn, redo: U5.redo});

/* ===== 6. Speichern/Laden, ältere Fassung ===== */
const SV = await p.evaluate(async () => { const s1 = serialize(); applyProject(projFromFile(JSON.parse(s1)), {ui: true}); await __w(300); const s2 = serialize();
  const e = await __press([60 + S.key.root + 3]); setKbMode('play'); const x = __exact(3); await __press([60 + S.key.root]); setKbMode('play');
  return {same: s1 === s2, xs: S.tracks.filter(t => t.xs === 1).length, ht: S.xlaHt, x, sh: e.shift, file: s1, notes: JSON.stringify(S.tracks.map(t => t.clips.map(c => c && c.notes.map(n => [n.t, n.d, n.n, n.v])))), lanes: JSON.stringify(S.song.lanes)}; });
ok(SV.same && SV.xs >= 3 && SV.ht === 1 && SV.x.bad === 0 && SV.x.n > 0 && SV.sh === 3, 'Speichern → Laden bitgleich; ⇅½ und Kennzeichen bleiben, danach weiter genau (+3)', {xs: SV.xs});
if (fs.existsSync(basis)) {
  const q = await page(428, 926, basis);
  const O = await q.evaluate(async ([f, nn, ln]) => { const fo = JSON.parse(f), want = fo.project.tracks.map(t => t && t.xs === 1);
    ensureAudio(); await new Promise(r => setTimeout(r, 1500));
    applyProject(projFromFile(fo), {ui: true}); await new Promise(r => setTimeout(r, 400));
    const tr = S.tracks.map((t, i) => ({i, f: t.follow, xs: t.xs, want: want[i]}));
    const mine = JSON.stringify(S.tracks.map(t => t.clips.map(c => c && c.notes.map(n => [n.t, n.d, n.n, n.v])))), notesSame = mine === nn, diff = notesSame ? null : {a: mine.slice(0, 120), b: nn.slice(0, 120)};
    setKbMode('transpose'); SYNQUENZER.keyOn(60 + S.key.root + 3, .8, 'o'); await new Promise(r => setTimeout(r, 60)); SYNQUENZER.keyOff(60 + S.key.root + 3, 'o'); await new Promise(r => setTimeout(r, 80));
    const now = nowT(); let n = 0, moved = 0; S.tracks.forEach((t, i) => { if (!want[i]) return; for (const c of t.clips) if (c) for (const x of c.notes) { n++; if (outPitch(i, c.key, x.n, now) !== x.n) moved++; } });
    return {version: VERSION, tr, notesSame, diff, n, moved, sh: T.current().shift, song: JSON.stringify(S.song.lanes) === ln, ht: S.xlaHt}; }, [SV.file, SV.notes, SV.lanes]);
  ok(O.version === '4.78.0' && O.tr.filter(t => t.want).every(t => t.f === false && t.xs == null) && O.ht == null && O.notesSame && O.song, 'ältere Fassung 4.78.0 öffnet die Datei: die ⇅½-Spuren sind dort ⇅ fest (xs unbekannt), Noten und Song gleich', {v: O.version, notes: O.notesSame, diff: O.diff, song: O.song, ht: O.ht});
  ok(O.sh === 3 && O.n > 0 && O.moved === 0, 'ältere Fassung: die Tastatur (+3) lässt die Spuren aus – sie spielen fest und exakt (nichts verbiegt sich)', {noten: O.n, verschoben: O.moved});
  await q.close();
} else info('ältere Fassung nicht geprüft (basis.html fehlt)');

/* ===== 7. Spur-Taste ⇅ per Touch: ⇅½ → fest → ⇅ → ⇅½ ===== */
await p.evaluate(async () => { setSongView(false); selectTrack(0); await __press([60 + S.key.root + 3]); setKbMode('play'); }); await p.waitForTimeout(400);
const st = async () => p.evaluate(() => { const t = S.tracks[0], now = nowT(); const c = t.clips.find(Boolean); return {f: t.follow, xs: t.xs, fb: UI.heads[0].fb.textContent, ck: EL.bFolgt.querySelector('.ck').textContent, x: EL.bFolgt.classList.contains('xlaxs'), out: c ? c.notes.slice(0, 4).map(n => outPitch(0, c.key, n.n, now) - n.n) : [], toast: EL.toast.textContent}; });
const s0 = await st();
await tapSel(p, '#bFolgt'); await p.waitForTimeout(300); const s1 = await st();
await tapSel(p, '#bFolgt'); await p.waitForTimeout(300); const s2 = await st();
await tapSel(p, '#bFolgt'); await p.waitForTimeout(300); const s3 = await st();
ok(s0.xs === 1 && s0.out.every(d => d === 3) && s1.xs == null && s1.f === false && s1.fb === 'fest' && s1.out.every(d => d === 0) && /^fest/.test(s1.toast),
  'Tippen ⇅: ⇅½ → fest (Kopf „fest“, Tastatur lässt die Spur aus, Hinweis)', {vorher: s0.out, nachher: s1.out, toast: s1.toast.slice(0, 50)});
ok(s2.f === true && s2.xs == null && s2.fb === '⇅' && /⇅ folgt/.test(s2.toast), 'Tippen ⇅: fest → ⇅ folgt (nach Akkord)', {fb: s2.fb});
ok(s3.f === false && s3.xs === 1 && s3.fb === '⇅½' && s3.x && s3.ck === '½' && s3.out.every(d => d === 3) && /⇅½ Halbton/.test(s3.toast), 'Tippen ⇅: ⇅ → ⇅½ Halbton (wieder genau +3)', {out: s3.out});
await p.evaluate(async () => { await __press([60 + S.key.root]); setKbMode('play'); });
// normales Projekt: die Taste ⇅ wechselt wie bisher nur folgt ↔ fest
const pn = await page(428, 926);
await pn.evaluate(PAGE_HELP);
await pn.evaluate(async () => { applyProject(normalizeProject(demoProjectRaw()), {}); ensureAudio(); await __w(800); const i = S.tracks.findIndex(t => t.kind === 'synth'); selectTrack(i); });
const n0 = await pn.evaluate(() => ({f: S.tracks[R.selT].follow, xs: S.tracks[R.selT].xs}));
await tapSel(pn, '#bFolgt'); const n1 = await pn.evaluate(() => ({f: S.tracks[R.selT].follow, xs: S.tracks[R.selT].xs, ht: S.xlaHt, cls: EL.bFolgt.className}));
await tapSel(pn, '#bFolgt'); const n2 = await pn.evaluate(() => ({f: S.tracks[R.selT].follow, xs: S.tracks[R.selT].xs}));
ok(n0.f === true && n1.f === false && n1.xs == null && n1.ht == null && !/xlaxs/.test(n1.cls) && n2.f === true && n2.xs == null, 'normales Projekt: Taste ⇅ wie bisher folgt → fest → folgt, kein ⇅½', {n0, n1: {f: n1.f}, n2});
await pn.close();

/* ===== 8. Aufnahme unter dem Träger: gehört = gespeichert ===== */
const RC = await p.evaluate(async () => { const e = await __press([60 + S.key.root + 2]); setKbMode('play'); const t = S.tracks.findIndex(x => x.xs === 1), c = S.tracks[t].clips.find(Boolean), now = nowT();
  const L = [40, 50, 62, 71].map(pl => { const st = clipNoteFor(t, c.key, pl, now); return [pl, st, outPitch(t, c.key, st, now)]; });
  await __press([60 + S.key.root]); setKbMode('play'); return {sh: e.shift, L}; });
ok(RC.sh === 2 && RC.L.every(([pl, st, o]) => st === pl - 2 && o === pl), 'Aufnahme/FANG/Schritt-Eingabe unter Träger +2 in eine ⇅½-Spur: gespeichert wird die Note, die als die gespielte klingt (−2)', RC.L);

/* ===== 9. „Noten fest“ beim Import ===== */
await openImport(p); c = await pick(p, 'synth-loop4.cbp');
await tapSel(p, '.xla button[data-x="tpf"]'); c = await ready(p);
await tapSel(p, '.xla button[data-x="ok"]'); await p.waitForTimeout(1500);
const NF = await p.evaluate(async () => { const xs = S.tracks.filter(t => t.xs === 1).length, ht = S.xlaHt; const e = await __press([60 + S.key.root + 2]); setKbMode('play'); const now = nowT(); let n = 0, moved = 0;
  S.tracks.forEach((t, i) => { if (t.kind !== 'synth' || t.follow !== false) return; for (const c of t.clips) if (c) for (const x of c.notes) { n++; if (outPitch(i, c.key, x.n, now) !== x.n) moved++; } });
  await __press([60 + S.key.root]); setKbMode('play'); return {xs, ht, n, moved, sh: e.shift, toast: EL.toast.textContent}; });
ok(c && c.tp === 'fest' && NF.xs === 0 && NF.ht == null && NF.n > 0 && NF.moved === 0 && NF.sh === 2 && !/Tastatur: Halbton/.test(NF.toast), '„Noten fest“ gewählt: kein ⇅½, die Tastatur (+2) lässt die importierten Spuren aus (wie Schritt 1)', NF);
await p.evaluate(() => { setSongView(false); const i = S.tracks.findIndex(t => t.kind === 'synth' && t.clips.some(Boolean)); selectTrack(i); }); await p.waitForTimeout(300);
const f0 = await p.evaluate(() => S.tracks[R.selT].follow); await tapSel(p, '#bFolgt'); const f1 = await p.evaluate(() => ({f: S.tracks[R.selT].follow, xs: S.tracks[R.selT].xs}));
await tapSel(p, '#bFolgt'); const f2 = await p.evaluate(() => ({f: S.tracks[R.selT].follow, xs: S.tracks[R.selT].xs}));
ok(f0 === false && f1.f === true && f1.xs == null && f2.f === false && f2.xs == null, 'im „Noten fest“-Projekt wechselt ⇅ wie bisher nur fest ↔ folgt', {f0, f1, f2});

/* ===== 10. Layout quer 926×428 und 320 px ===== */
await p.setViewportSize({width: 926, height: 428}); await p.waitForTimeout(400);
await openImport(p); c = await pick(p, 'synth-song.cbp');
await p.evaluate(() => { const e = [...document.querySelectorAll('.xla h5')].find(h => h.textContent === 'Transponieren'); if (e) e.scrollIntoView({block: 'start'}); });
m = await measure(p);
ok(layoutOk(m, 926), 'Blatt quer 926×428 mit „Transponieren“: ✕ sichtbar, Tasten ≥ 44, nichts außerhalb, keine Überlappung', m);
await p.screenshot({path: path.join(fotos, 'xla2-l-blatt.png')});
await tapSel(p, '.xla button[data-x="ok"]'); await p.waitForTimeout(1500);
await p.evaluate(() => setSongView(false)); await p.waitForTimeout(500);
const HL = await p.evaluate(() => { const o = []; for (const i of MX.rows) { const h = UI.heads[i]; if (!h || !S.tracks[i] || S.tracks[i].xs !== 1) continue; const f = h.fb.getBoundingClientRect(), n = h.nm.getBoundingClientRect(); o.push({fb: h.fb.textContent, ov: Math.min(f.right, n.right) - Math.max(f.left, n.left) > 1 && Math.min(f.bottom, n.bottom) - Math.max(f.top, n.top) > 1, vis: getComputedStyle(h.fb).display !== 'none'}); }
  const sb = EL.bFolgt.getBoundingClientRect(); return {o, strip: {w: Math.round(sb.width), h: Math.round(sb.height), ck: EL.bFolgt.querySelector('.ck').textContent, ckVis: EL.bFolgt.querySelector('.ck').offsetWidth > 0}, hs: document.documentElement.scrollWidth > innerWidth + 1}; });
ok(HL.o.length >= 2 && HL.o.every(x => x.fb === '⇅½' && !x.ov) && HL.strip.ck === '½' && HL.strip.ckVis && HL.strip.w >= 38 && HL.strip.h >= 38 && !HL.hs, 'Matrix quer: Spurköpfe „⇅½“ ohne Überdeckung, Spur-Taste ⇅½ sichtbar (≥ 38 px), kein waagrechtes Rollen', {strip: HL.strip, o: HL.o, hs: HL.hs});
await p.screenshot({path: path.join(fotos, 'xla2-l-matrix.png')});
await p.setViewportSize({width: 320, height: 640}); await p.waitForTimeout(400);
await openImport(p); c = await pick(p, 'synth-song.cbp');
await p.evaluate(() => { const e = [...document.querySelectorAll('.xla h5')].find(h => h.textContent === 'Transponieren'); if (e) e.scrollIntoView({block: 'center'}); });
m = await measure(p);
ok(layoutOk(m, 320), 'Blatt 320×640 mit „Transponieren“: alles erreichbar, keine Überlappung', m);
await p.evaluate(() => closePop());
await p.setViewportSize({width: 428, height: 926}); await p.waitForTimeout(300);

/* ===== 11. Guide ===== */
const GD = await p.evaluate(() => { const e = ui1Entries().find(x => x.id === 'xlaht'); if (!e) return null; closePop(); const r = e.go(); const tg = document.querySelector(e.q); return {n: e.n, d: e.d, r, tg: !!(tg && tg.offsetParent), find: !!ui1Find('halbton')}; });
ok(GD && GD.r && GD.tg && /⇅½/.test(GD.n) && /Halbtöne/.test(GD.d) && /⇅½ Halbton → fest → ⇅ folgt/.test(GD.d), 'Guide-Eintrag „Transponieren im DAW-Projekt (⇅½ Halbton)“ zeigt auf ⇅ TRANSPONIEREN, erklärt die Taste an der Spur', GD && GD.n);

/* ===== 12. P5-Durchlauf als Xander (Touch): Öffnen … → Beides → Szene spielen → transponieren → Song → speichern/laden → ↶/↷ ===== */
const pp = await page(428, 926);
await pp.evaluate(PAGE_HELP);
await pp.evaluate(async () => { applyProject(normalizeProject(demoProjectRaw()), {}); S.name = 'Xander vorher'; setBpm(101); markDirty(); ensureAudio(); await __w(1500); if (autosave) await autosave.flush(); });
const prevP = await pp.evaluate(() => ({id: S.id, ser: serialize()}));
await pp.evaluate(() => openMenu()); await pp.waitForTimeout(400);
const openBtn = await pp.evaluate(() => { const L = [...document.querySelectorAll('button')].filter(b => b.offsetParent && b.textContent.trim() === 'Öffnen …'); return L.length; });
c = await pick(pp, 'synth-song.cbp', async () => { await tapText(pp, 'button', 'Öffnen …'); });
const pv = await pp.evaluate(() => ({pop: UI.pop && UI.pop.name, mode: window.__xla.cur() && window.__xla.cur().mode, tp: window.__xla.cur() && window.__xla.cur().tp}));
ok(openBtn >= 1 && c && c.st === 'fertig' && pv.pop === 'xla' && pv.mode === 'beides' && pv.tp === 'halbton', 'P5: Menü › Öffnen … (Touch) mit der .cbp → Blatt, „Beides“ und „Halbton“ vorgewählt', pv);
await tapSel(pp, '.xla button[data-x="ok"]'); await pp.waitForTimeout(1500);
const p1 = await pp.evaluate(() => ({sv: !!UI.songView, xs: S.tracks.filter(t => t.xs === 1).length, undo: UNDO.map(u => u.kind)}));
ok(p1.sv && p1.xs >= 3 && p1.undo.join() === 'xla', 'P5: Passt (Touch) → Song-Editor offen, ⇅½-Spuren, ein ↶-Eintrag');
const impSer = await pp.evaluate(() => serialize());
await pp.evaluate(() => undo()); await pp.waitForTimeout(1200);
const pu = await pp.evaluate(() => ({id: S.id, ser: serialize(), redo: REDO.map(r => r.kind)}));
await pp.evaluate(() => redo()); await pp.waitForTimeout(1200);
const pr2 = await pp.evaluate(() => ({ser: serialize(), xs: S.tracks.filter(t => t.xs === 1).length, ht: S.xlaHt}));
ok(pu.id === prevP.id && pu.ser === prevP.ser && pr2.ser === impSer && pr2.xs >= 3 && pr2.ht === 1, 'P5: ↶ holt das vorige Projekt bitgleich zurück, ↷ den Import bitgleich (⇅½ und Kennzeichen inklusive)', {id: pu.id === prevP.id, prev: pu.ser === prevP.ser, redo: pu.redo, imp: pr2.ser === impSer, xs: pr2.xs, ht: pr2.ht});
await pp.evaluate(() => setSongView(false)); await pp.waitForTimeout(400);
await pp.evaluate(() => clearLog());
await tapSel(pp, '#clipGrid .scn[data-s="2"]'); await pp.waitForTimeout(400); if (!(await pp.evaluate(() => R.playing))) await tapSel(pp, '#bPlay'); await pp.waitForTimeout(1500);
await tapSel(pp, '#segTr'); await pp.waitForTimeout(150);
const kn = await pp.evaluate(() => { const r = S.key.root; const L = [...KB.byNote.entries()].filter(([n, k]) => k.el.offsetParent && k.el.getBoundingClientRect().width > 10).map(([n]) => n); return L.find(n => ((n - r) % 12 + 12) % 12 === 5) ?? L[5]; });
const kp = await pp.evaluate(n => { const k = KB.byNote.get(n); k.el.scrollIntoView && 0; const q = k.el.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height * .8}; }, kn);
await tap(pp, kp.x, kp.y, 120); await pp.waitForTimeout(250);
const pc = await pp.evaluate(() => { const e = T.current(); return {time: e.time, shift: e.shift, now: AU.ctx.currentTime}; });
await pp.waitForTimeout(4500);
const pm = await pp.evaluate(c1 => { const L = __slim(noteLog(4096)); let n = 0, badN = 0; for (const e of L) { const tr = S.tracks[e.t]; if (!tr || tr.xs !== 1 || e.src === 'live') continue; n++; if (!__want([{time: -Infinity, shift: 0}, c1], e.time).includes(e.o - e.c)) badN++; } return {n, bad: badN, playing: R.playing}; }, pc);
ok(pm.playing && pc.shift === 5 && pm.n > 20 && pm.bad === 0, 'P5: Szene 3 per Touch gestartet, Taste (Quarte) in TRANSPONIEREN → alle Szenen-Noten genau +5', {k: pc.shift, noten: pm.n});
await tapSel(pp, '#bPlay'); await pp.waitForTimeout(800);
await pp.evaluate(() => setSongView(true)); await pp.waitForTimeout(400);
await pp.evaluate(() => clearLog());
await tapSel(pp, '#bPlay'); await pp.waitForTimeout(5000);
const ps = await pp.evaluate(c1 => { const L = __slim(noteLog(4096)); let n = 0, badN = 0; for (const e of L) { const tr = S.tracks[e.t]; if (!tr || tr.xs !== 1 || e.src === 'live') continue; n++; if (e.o - e.c !== c1.shift) badN++; } const sp = !!R.songPlay; return {n, bad: badN, sp, playing: R.playing}; }, pc);
await tapSel(pp, '#bPlay'); await pp.waitForTimeout(600);
ok(ps.sp && ps.n > 5 && ps.bad === 0, 'P5: Song abspielen (▶ im Song-Editor, Touch): der Song klingt genau +5 (Träger bleibt)', ps);
const pr = await pp.evaluate(async () => { const s1 = serialize(); applyProject(projFromFile(JSON.parse(s1)), {ui: true}); await __w(300); return {same: s1 === serialize(), xs: S.tracks.filter(t => t.xs === 1).length}; });
ok(pr.same && pr.xs >= 3, 'P5: speichern → laden bitgleich, ⇅½ bleibt');
// Rückung je Teil im Marken-Blatt per Touch (+1 ab dem 3. Teil), dann ↶ per Touch (Spur-Leiste) und ↷
const mk = await pp.evaluate(() => { const ms = S.song.marks.slice().sort((a, b) => a.a - b.a); setSongView(true); SYNQUENZER.openMarkSheet(ms[2].id); return {id: ms[2].id, pop: UI.pop && UI.pop.name}; });
await pp.waitForTimeout(500);
const rkBtn = await tapSel(pp, 'button[data-jrk="1"]'); await pp.waitForTimeout(400);
const rk1 = await pp.evaluate(id => ({rk: (S.song.marks.find(x => x.id === id) || {}).rk || 0, top: UNDO.length ? UNDO[UNDO.length - 1].label : '', midi: JSON.stringify(va1MidiParse(buildMidiSong(false).bytes).tracks.map(t => t.notes.map(n => n.n)))}), mk.id);
await pp.evaluate(() => { closePop(); setSongView(false); }); await pp.waitForTimeout(400);
const uTap = await tapSel(pp, '#bUndo'); await pp.waitForTimeout(500);
const rk2 = await pp.evaluate(id => ({rk: (S.song.marks.find(x => x.id === id) || {}).rk || 0, redo: REDO.length ? REDO[REDO.length - 1].label : '', midi: JSON.stringify(va1MidiParse(buildMidiSong(false).bytes).tracks.map(t => t.notes.map(n => n.n)))}), mk.id);
await pp.evaluate(() => redo()); await pp.waitForTimeout(400);
const rk3 = await pp.evaluate(id => ({rk: (S.song.marks.find(x => x.id === id) || {}).rk || 0, midi: JSON.stringify(va1MidiParse(buildMidiSong(false).bytes).tracks.map(t => t.notes.map(n => n.n)))}), mk.id);
ok(rkBtn && rk1.rk === 1 && /Rückung/.test(rk1.top) && uTap && rk2.rk === 0 && rk2.midi !== rk1.midi && /Rückung/.test(rk2.redo) && rk3.rk === 1 && rk3.midi === rk1.midi,
  'P5: nach dem Laden Rückung +1 im Marken-Blatt (Touch) → ↶ (Touch) nimmt sie zurück → ↷ stellt sie wieder her (Export gleich)', {rk: [rk1.rk, rk2.rk, rk3.rk], top: rk1.top});
await pp.close();

if (LANG) await lang3(); else info('3-Minuten-Wiedergabe ausgelassen (LANG3=0)');
ok(errs.length === 0, 'Konsole ohne Fehler (alle Seiten, auch 4.78.0)', errs.slice(0, 4));
await b.close();
const sum = `\n${good} OK, ${bad} FEHLER · ${((Date.now() - T0) / 1000).toFixed(0)} s`;
console.log(sum); out.push(sum);
fs.writeFileSync(path.join(here, 'xla2-test.out'), out.join('\n') + '\n');
process.exit(bad ? 1 : 0);
