// SPK7 Abnahme (Teil 1 Kern + Teil 2 Bedienung), Playwright mit Touch, hochkant 428×926 und quer 926×428:
// Pinsel-Auswahl → „Als Klangkorn“ → Blatt (Quellbild, Marker ziehen) → spielen (Mini-Tastatur gleiten, Tastatur links halten, Tasten leuchten)
// → Ecke TON|KORN → Regler + Schleife → Vorhören → Als Instrument (neue Spur / vorhandene Spur, ↶/↷) → in der Matrix/im Song abspielen
// → Messwerte Teil 1 (Worklet/Rückfall Tonhöhe, CPU) → Speichern/Laden → quer bedienbar → keine Konsolenfehler.
// Aufruf: node spk7-test.mjs <abs index.html> [out.json]
import {start, page, openSpk, mixWav, btn, box} from './lib.mjs';
import fs from 'node:fs';
import path from 'node:path';
const file = process.argv[2], outF = process.argv[3], E = await start(file), errs = [], res = [], foto = path.join(path.dirname(file), 'fotos');
fs.mkdirSync(foto, {recursive: true});
const ok = (name, d, pass) => { res.push({name, pass: !!pass, d}); console.log((pass ? 'OK  ' : 'FEHL') + ' ' + name + ' ' + JSON.stringify(d)); };
const R = v => +(+v).toFixed(5);
try {
  const P = await page(E, 428, 926, errs), {p, tap, drag, touch} = P;
  await openSpk(P, mixWav(E.dir, 8));
  await p.evaluate(() => { const c = ensureAudio(), a = c.createAnalyser(); a.fftSize = 2048; (AU.masterSum || c.destination).connect(a); window.__an = a; });
  const rms = () => p.evaluate(() => { const a = window.__an, d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let e = 0; for (const v of d) e += v * v; return Math.sqrt(e / d.length); });
  const shut = () => p.evaluate(() => spk1Dd(SPK1.ui, null));
  // 1) Pinsel malen → „Klangkorn ▾“ in der Werkzeugleiste (Aktionsfeld + Ebenenliste wie in der Basis: 3. Zeile erst nach Freigabe)
  const dis0 = await p.evaluate(() => !SPK1.ui.b7a && !SPK1.ui.sh.classList.contains('spk7g'));
  await tap(await btn(p, 'Pinsel'));
  const mn = await box(p, '#spk1Sheet .spk1-mn'), y = mn.y + mn.h * 0.42;
  await drag([mn.x + mn.w * 0.15, y], [mn.x + mn.w * 0.75, y], 14);
  const ab = await p.evaluate(() => { const b = SPK1.ui.b7, r = b.getBoundingClientRect(), ly = SPK1.ui.ly.getBoundingClientRect(), m = SPK1.ui.mn.getBoundingClientRect(), ac = SPK1.ui.ac.getBoundingClientRect(); return {dis: b.disabled, w: Math.round(r.width), h: Math.round(r.height), imFeld: true, lyH: Math.round(ly.height), acH: Math.round(ac.height), mnH: Math.round(m.height), sel: SPK1.ui.sel.map(s => s.art)}; });
  await tap(await btn(p, 'Klangkorn ▾'));
  await p.waitForFunction(() => SYNQUENZER.spk7.src() && SYNQUENZER.spk7.dd() && !SPK7.busy, null, {timeout: 30000}); await p.waitForTimeout(400);
  const s1 = await p.evaluate(() => { const dd = SYNQUENZER.spk7.dd(), r = dd.getBoundingClientRect(), cv = dd.querySelector('.spk7-cv'), x = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let lo = 1e9, hi = -1; for (let i = 0; i < x.length; i += 16) { const v = x[i] + x[i + 1] + x[i + 2]; lo = Math.min(lo, v); hi = Math.max(hi, v); }
    return {src: SYNQUENZER.spk7.src(), mode: SYNQUENZER.spk7.mode(), co: SPK1.ui.co7.textContent, dd: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], W: innerWidth, H: innerHeight, bild: {w: cv.width, h: cv.height, kontrast: hi - lo}, tasten: dd.querySelectorAll('.spk7-kb>i').length, h5: [...dd.querySelectorAll('h5')].map(h => h.textContent)}; });
  await p.screenshot({path: path.join(foto, 'spk7-10-als-klangkorn-hochkant.png')});
  ok('als-klangkorn-knopf-blatt', {dis0, ab, src: {n: s1.src.n, f0: Math.round(s1.src.f0), wo: s1.src.wo, txt: s1.src.txt}, mode: s1.mode, co: s1.co, dd: s1.dd, bild: s1.bild, tasten: s1.tasten, h5: s1.h5},
    dis0 && !ab.dis && ab.h >= 36 && ab.lyH === 180 && ab.acH === 96 && ab.sel.includes('pinsel') && s1.src.n > 1000 && s1.mode === 'korn' && s1.co === 'KORN' && s1.dd[0] >= 0 && s1.dd[2] <= s1.W && s1.dd[3] <= s1.H && s1.bild.kontrast > 120 && s1.tasten === 24);
  // 2) Marker im Quellbild ziehen → Position folgt (Regler + Engine-Wert)
  const cvb = await box(p, '#spk1Sheet .spk7-cv');
  await drag([cvb.x + cvb.w * 0.3, cvb.y + cvb.h / 2], [cvb.x + cvb.w * 0.72, cvb.y + cvb.h / 2], 8);
  const mk = await p.evaluate(() => ({pos: SYNQUENZER.spk7.p().pos, regler: +SYNQUENZER.spk7.dd().querySelector('input[data-k="pos"]').value, anz: SYNQUENZER.spk7.dd().querySelector('input[data-k="pos"]').nextSibling.textContent}));
  ok('marker-ziehen-position', mk, Math.abs(mk.pos - 0.72) < 0.03 && Math.abs(mk.regler - mk.pos) < 1e-6 && /7\d %/.test(mk.anz));
  // 3) Mini-Tastatur: Taste halten → Ton + Taste leuchtet (auch links), gleiten → anderer Ton, loslassen → aus
  const kb = await p.evaluate(() => { const dd = SYNQUENZER.spk7.dd(), k = dd.querySelector('.spk7-kb'); k.scrollIntoView({block: 'nearest'}); const r = k.getBoundingClientRect(), w = [...k.querySelectorAll('i.w')].map(e => +e.dataset.m); return {x: r.left, y: r.top, w: r.width, h: r.height, w0: w[0], w7: w[7]}; });
  await p.waitForTimeout(150);
  const kp = (i) => [kb.x + kb.w * (i + 0.5) / 14, kb.y + kb.h * 0.85];
  const r0 = await rms(), q0 = await p.evaluate(() => SPK7.seq);
  await touch('touchStart', [kp(0)]); await p.waitForTimeout(600);
  const kA = await p.evaluate(() => ({r: 0, lit: SYNQUENZER.spk7.lit(), on: [...SYNQUENZER.spk7.dd().querySelectorAll('.spk7-kb>i.on')].map(e => +e.dataset.m), links: [...document.querySelectorAll('#spk1Sheet .spk7-lt>i')].map(e => +e.dataset.m)})); kA.r = R(await rms());
  for (let s = 1; s <= 6; s++) { await touch('touchMove', [[kp(0)[0] + (kp(7)[0] - kp(0)[0]) * s / 6, kp(0)[1]]]); await p.waitForTimeout(30); }
  await p.waitForTimeout(500);
  const kB = await p.evaluate(() => ({lit: SYNQUENZER.spk7.lit(), on: [...SYNQUENZER.spk7.dd().querySelectorAll('.spk7-kb>i.on')].map(e => +e.dataset.m)})); kB.r = R(await rms());
  await touch('touchEnd', []); await p.waitForTimeout(1300);
  const kC = {r: R(await rms()), lit: await p.evaluate(() => SYNQUENZER.spk7.lit()), seq: (await p.evaluate(() => SPK7.seq)) - q0};
  await p.screenshot({path: path.join(foto, 'spk7-11-mini-tastatur.png')});
  ok('mini-tastatur-spielen-gleiten', {kb: {w0: kb.w0, w7: kb.w7, breite: Math.round(kb.w / 14), hoehe: Math.round(kb.h)}, r0: R(r0), kA, kB, kC},
    kA.r > 0.002 && kA.r > r0 * 4 && kA.lit[0] === kb.w0 && kA.on[0] === kb.w0 && kA.links[0] === kb.w0 && kB.r > 0.002 && kB.lit.length === 1 && kB.lit[0] === kb.w7 && kC.lit.length === 0 && kC.r < kA.r * 0.2 && kC.seq >= 2);
  // 4) Tastatur links (Blatt zu): halten → Ton, Taste leuchtet an der richtigen Stelle; loslassen → aus
  await shut(); await p.waitForTimeout(200);
  const ky = await box(p, '#spk1Sheet .spk1-ky'), yp = [ky.x + ky.w / 2, ky.y + ky.h * 0.5];
  await touch('touchStart', [yp]); await p.waitForTimeout(600);
  const L1 = await p.evaluate(yy => { const U = SPK1.ui, e = document.querySelector('#spk1Sheet .spk7-lt>i'), r = e && e.getBoundingClientRect(), m = Math.round(U.v.mTop - (yy - U.ky.getBoundingClientRect().top) / U.v.rowH); return {lit: SYNQUENZER.spk7.lit(), m, top: r ? Math.round(r.top) : null, bot: r ? Math.round(r.bottom) : null, y: Math.round(yy), eng: SYNQUENZER.spk7.eng()}; }, yp[1]); L1.r = R(await rms());
  await p.screenshot({path: path.join(foto, 'spk7-12-tasten-links-leuchten.png')});
  await touch('touchEnd', []); await p.waitForTimeout(1300); const L2 = {r: R(await rms()), lit: await p.evaluate(() => SYNQUENZER.spk7.lit())};
  ok('tastatur-links-halten-leuchtet', {L1, L2}, L1.r > 0.002 && L1.lit.length === 1 && L1.lit[0] === L1.m && L1.top <= L1.y + 2 && L1.bot >= L1.y - 2 && L1.eng.kind === 'worklet' && L2.r < L1.r * 0.2 && !L2.lit.length);
  // 5) Ecke TON|KORN: Tipp → Probeton (kein Klangkorn), Tipp → wieder Klangkorn; Trefferfläche ≥ 36 px
  const cob = await p.evaluate(() => { const r = SPK1.ui.co7.getBoundingClientRect(); return [r.left + r.width / 2, r.top + 10, Math.round(r.width), Math.round(r.height)]; });
  await tap(cob); const c1 = await p.evaluate(() => ({m: SYNQUENZER.spk7.mode(), t: SPK1.ui.co7.textContent})); const sq = await p.evaluate(() => SPK7.seq); await tap(yp); const sq2 = await p.evaluate(() => SPK7.seq);
  await tap(cob); const c2 = await p.evaluate(() => ({m: SYNQUENZER.spk7.mode(), t: SPK1.ui.co7.textContent}));
  ok('ecke-umschalter', {groesse: cob.slice(2), c1, probetonSpieltKeinKorn: sq === sq2, c2}, cob[3] >= 36 && cob[2] >= 36 && c1.m === 'ton' && c1.t === 'TON' && sq === sq2 && c2.m === 'korn' && c2.t === 'KORN');
  // 6) Regler (Korngröße, Filter, Breite, Hüllkurve) + Modus Schleife: Werte in der Engine, Schleife hörbar
  await tap(await btn(p, 'Klangkorn ▾')); await p.waitForTimeout(250);
  await p.evaluate(() => { const dd = SYNQUENZER.spk7.dd(); for (const [k, v] of [['gs', 0.25], ['dc', 6], ['fc', 0.7], ['br', 0.9], ['a', 0.05], ['r', 0.8]]) { const r = dd.querySelector('input[data-k="' + k + '"]'); r.value = v; r.dispatchEvent(new Event('input')); } });
  await tap(await btn(p, 'Schleife', '#spk1Sheet .spk7-art'));
  const pp = await p.evaluate(() => SYNQUENZER.spk7.p());
  // Vorhören (hält den Grundton bis Stopp)
  const vb = await btn(p, '▶ Vorhören'); await tap(vb); await p.waitForTimeout(700); const v1 = R(await rms()), vt = await p.evaluate(() => SYNQUENZER.spk7.dd().querySelector('[data-k="vor"]').textContent);
  await tap(await btn(p, '■ Stopp')); await p.waitForTimeout(1500); const v2 = R(await rms());
  ok('regler-schleife-vorhoeren', {gs: pp.gs, dc: pp.dc, fc: pp.fc, br: pp.br, a: pp.a, r: pp.r, art: pp.art, rmsVor: v1, knopf: vt, rmsStopp: v2}, Math.abs(pp.gs - 0.25) < 1e-6 && pp.dc === 6 && pp.art === 'frz' && v1 > 0.002 && vt === '■ Stopp' && v2 < v1 * 0.2);
  await p.evaluate(() => SYNQUENZER.spk7.p({art: 'korn', a: 0.02, r: 0.4}));
  // 7) Als Instrument: neue Spur (✓ + Neue Spur), dann dieselbe Quelle in eine vorhandene Synth-Spur; je ein ↶/↷
  const n0 = await p.evaluate(() => S.tracks.length);
  await p.evaluate(() => { const b = [...SYNQUENZER.spk7.dd().querySelectorAll('button')].find(x => /Als Instrument/.test(x.textContent)); b.scrollIntoView({block: 'nearest'}); });
  const tg0 = await p.evaluate(() => [...SYNQUENZER.spk7.dd().querySelectorAll('[data-t]')].map(b => b.textContent));
  await tap(await btn(p, 'Als Instrument')); await p.waitForTimeout(400);
  const t1 = await p.evaluate(() => { const L = SYNQUENZER.spk7.last(), t = S.tracks[L.track], h = t.sound.p.wt.h; return {n: S.tracks.length, i: L.track, neu: L.neu, name: t.name, eng: t.sound.engine, h: {take: h.take, f0: h.f0, gs: h.gs, fc: h.fc}, take: !!(S.takes && S.takes[h.take]), used: tkUsedIds().includes(h.take), chips: [...SYNQUENZER.spk7.dd().querySelectorAll('[data-t]')].map(b => b.textContent)}; });
  const u = await p.evaluate(() => { undo(); const a = S.tracks.length; redo(); const b = S.tracks.length; return {nachUndo: a, nachRedo: b}; });
  ok('als-instrument-neue-spur', {n0, tg0, t1, u}, t1.n === n0 + 1 && t1.neu && t1.eng === 'wt' && t1.take && t1.used && Math.abs(t1.h.gs - 0.25) < 1e-6 && u.nachUndo === n0 && u.nachRedo === n0 + 1 && t1.chips.some(c => /^✓ /.test(c)));
  const j = await p.evaluate(() => { for (let i = 0; i < S.tracks.length; i++) if (spk2MxOk(i) && !(S.tracks[i].sound.p.wt && S.tracks[i].sound.p.wt.h)) return i; return -1; });
  await p.evaluate(jj => { const b = SYNQUENZER.spk7.dd().querySelector('[data-t="' + jj + '"]'); b.scrollIntoView({block: 'nearest'}); }, j);
  const jb = await p.evaluate(jj => { const r = SYNQUENZER.spk7.dd().querySelector('[data-t="' + jj + '"]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, j); await tap(jb);
  const e0 = await p.evaluate(jj => ({n: S.tracks.length, eng: S.tracks[jj].sound.engine, name: S.tracks[jj].sound.name, tgt: SYNQUENZER.spk7.tgt(), knopf: [...SYNQUENZER.spk7.dd().querySelectorAll('button')].find(x => /Als Instrument/.test(x.textContent)).textContent}), j);
  await tap(await btn(p, 'Als Instrument')); await p.waitForTimeout(400);
  const e1 = await p.evaluate(jj => { const t = S.tracks[jj], h = t.sound.p.wt && t.sound.p.wt.h; return {n: S.tracks.length, eng: t.sound.engine, h: !!h, take: h && h.take, last: SYNQUENZER.spk7.last()}; }, j);
  const e2 = await p.evaluate(jj => { undo(); const a = {eng: S.tracks[jj].sound.engine, name: S.tracks[jj].sound.name, h: !!(S.tracks[jj].sound.p.wt && S.tracks[jj].sound.p.wt.h)}; redo(); a.nachRedo = !!(S.tracks[jj].sound.p.wt && S.tracks[jj].sound.p.wt.h); return a; }, j);
  ok('als-instrument-vorhandene-spur', {j, e0, e1, e2, gleicherTake: e1.take === t1.h.take}, j >= 0 && e0.tgt === j && /Als Instrument in /.test(e0.knopf) && e1.n === e0.n && e1.eng === 'wt' && e1.h && e1.take === t1.h.take && e2.eng === e0.eng && e2.name === e0.name && !e2.h && e2.nachRedo);
  await p.screenshot({path: path.join(foto, 'spk7-13-spurwahl.png')});
  // 8) Im Song/der Matrix abspielen: Clip mit 4 Noten auf der Klangkorn-Spur, Wiedergabe → Stimmen über die Spur-Engine, hörbar; Stopp → still
  await p.evaluate(() => SPK1_API.page.close()); await p.waitForTimeout(300);
  const sp = await p.evaluate(async i => {
    S.tracks[i].clips[0] = normClip({len: 1, notes: [{t: 0, d: 0.9, n: 57, v: 0.9}, {t: 1, d: 0.9, n: 60, v: 0.9}, {t: 2, d: 0.9, n: 64, v: 0.9}, {t: 3, d: 0.9, n: 69, v: 0.9}]}, 'synth');
    for (let k = 0; k < NT(); k++) if (k !== i) stopTrack(k);
    SYNQUENZER.launchClip(i, 0); SYNQUENZER.play(); const a = window.__an, d = new Float32Array(a.fftSize); let mx = 0, vmax = 0;
    for (let q = 0; q < 20; q++) { await new Promise(r => setTimeout(r, 100)); a.getFloatTimeDomainData(d); let e = 0; for (const x of d) e += x * x; mx = Math.max(mx, Math.sqrt(e / d.length)); vmax = Math.max(vmax, SYNQUENZER.spk7.voices()); }
    const eng = SYNQUENZER.spk7.trEng(i), src = VOICES.filter(v => v.korn).map(v => v.src); SYNQUENZER.stop(); await new Promise(r => setTimeout(r, 1500)); a.getFloatTimeDomainData(d); let e = 0; for (const x of d) e += x * x;
    return {rmsMax: +mx.toFixed(5), stimmenMax: vmax, eng, src: [...new Set(src)], rmsNachStopp: +Math.sqrt(e / d.length).toFixed(5), stimmenNachStopp: SYNQUENZER.spk7.voices()};
  }, t1.i);
  ok('im-song-abspielen', sp, sp.rmsMax > 0.002 && sp.stimmenMax >= 1 && sp.eng && sp.eng.kind === 'worklet' && sp.rmsNachStopp < sp.rmsMax * 0.2 && sp.stimmenNachStopp === 0);
  // 9) Messwerte Teil 1 erneut: Worklet/Rückfall offline Tonhöhe (Sinus 220 Hz, A3 + A4), CPU 8 Stimmen × 5 s
  const wk = await p.evaluate(async () => {
    const keep = SPK7.src, sr = 48000, x = new Float32Array(sr * 2); for (let i = 0; i < x.length; i++) x[i] = 0.9 * Math.sin(2 * Math.PI * 220 * i / sr); SYNQUENZER.spk7.make(x, sr);
    const pk = (L) => { const N = 32768, a = 24000, re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < N; i++) re[i] = L[a + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)); spk7Fft(re, im, false); let b = 2, M = k => Math.hypot(re[k], im[k]); for (let k = 2; k < N / 2 - 1; k++) if (M(k) > M(b)) b = k; const l = Math.log(M(b - 1)), c = Math.log(M(b)), r = Math.log(M(b + 1)); return (b + 0.5 * (l - r) / (l - 2 * c + r)) * sr / N; };
    const out = {};
    for (const [nm, o] of [['worklet', {}], ['rueckfall', {script: true}]]) for (const m of [57, 69]) { const r = await SYNQUENZER.spk7.render(Object.assign({dur: 1.6, notes: [{m, t0: 0.02, t1: 1.4}], p: {art: 'korn', gs: 0.08, dc: 4, spo: 0.1, spt: 0, a: 0.02, fc: 1}}, o)); out[nm + m] = {kind: r.kind, hz: +pk(r.L).toFixed(2)}; }
    for (const m of [57, 69]) { const r = await SYNQUENZER.spk7.render({dur: 1.6, notes: [{m, t0: 0.02, t1: 1.4}], p: {art: 'frz', a: 0.02, fc: 1}}); out['schleife' + m] = {kind: r.kind, hz: +pk(r.L).toFixed(2)}; }
    const t = performance.now(); const r8 = await SYNQUENZER.spk7.render({dur: 5, notes: [48, 52, 55, 59, 62, 64, 67, 71].map(m => ({m, t0: 0}))}); out.cpu8x5s = {kind: r8.kind, ms: Math.round(performance.now() - t)};
    SPK7.src = keep; if (SPK7.eng) spk7Feed(SPK7.eng, keep); return out;
  });
  const ks = ['worklet57', 'worklet69', 'rueckfall57', 'rueckfall69', 'schleife57', 'schleife69'], cts = ks.map(k => 1200 * Math.log2(wk[k].hz / (k.endsWith('57') ? 220 : 440)));
  ok('messwerte-teil1-tonhoehe-cpu', {wk, ct: Object.fromEntries(ks.map((k, i) => [k, +cts[i].toFixed(2)]))}, wk.worklet57.kind === 'worklet' && wk.rueckfall57.kind === 'script' && cts.every(c => Math.abs(c) < 10) && wk.cpu8x5s.ms < 1250);
  // 10) Speichern/Laden: JSON behält p.wt.h, Container mit takes/<id>.wav, Audio aus dem Gerätespeicher, Spur klingt danach
  const rt = await p.evaluate(async i => {
    const h0 = JSON.stringify(S.tracks[i].sound.p.wt.h), take = S.tracks[i].sound.p.wt.h.take, js = SYNQUENZER.serialize(); await SYNQUENZER.importJSON(js); await new Promise(r => setTimeout(r, 500));
    const k = S.tracks.findIndex(t => t.sound && t.sound.p.wt && t.sound.p.wt.h && t.sound.p.wt.h.take === take && JSON.stringify(t.sound.p.wt.h) === h0), h1 = k >= 0 ? JSON.stringify(S.tracks[k].sound.p.wt.h) : null;
    const z = await tkZipBytes(), fs1 = await tkUnzip(z), wav = fs1.some(f => f.name === 'takes/' + take + '.wav');
    SYNQUENZER.spk7.forget(take); const ld = await SYNQUENZER.spk7.load(take, S.tracks[k].sound.p.wt.h.f0);
    const c = AU.ctx, v = spawnVoice(k, 64, 0.9, c.currentTime + 0.05, {src: 'audition'}); await new Promise(r => setTimeout(r, 900));
    const a = window.__an, d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let e = 0; for (const x of d) e += x * x; v.release(c.currentTime + 0.01);
    return {gleich: h0 === h1, k, wav, zipDateien: fs1.length, cache: ld, rms: +Math.sqrt(e / d.length).toFixed(5), korn: !!(v && v.korn)};
  }, t1.i);
  ok('speichern-laden', rt, rt.gleich && rt.wav && rt.cache && rt.cache.n > 1000 && rt.rms > 0.001 && rt.korn);
  // 11) quer 926×428: Knopf + Blatt bedienbar (alle Knöpfe ≥ 36 px, Blatt im Bild), Mini-Tastatur spielt, Ecke ≥ 36 px
  await p.setViewportSize({width: 926, height: 428}); await p.evaluate(() => SPK1_API.page.open({id: SPK1.doc})); await p.waitForTimeout(1200);
  const ql = await p.evaluate(() => { const U = SPK1.ui, b = U.b7.getBoundingClientRect(), ac = U.ac.getBoundingClientRect(), ly = U.ly.getBoundingClientRect(), m = U.mn.getBoundingClientRect(), co = U.co7.getBoundingClientRect(); return {ab: [Math.round(b.width), Math.round(b.height)], imFeld: b.height >= 36, lyH: Math.round(ly.height), mnH: Math.round(m.height), co: [Math.round(co.width), Math.round(co.height)], sel: U.sel.length}; });
  if (!ql.sel) { await tap(await btn(p, 'Pinsel')); const m2 = await box(p, '#spk1Sheet .spk1-mn'); await drag([m2.x + m2.w * 0.2, m2.y + m2.h * 0.45], [m2.x + m2.w * 0.7, m2.y + m2.h * 0.45], 10); }
  await tap(await btn(p, 'Klangkorn ▾')); await p.waitForFunction(() => SYNQUENZER.spk7.dd() && !SPK7.busy, null, {timeout: 30000}); await p.waitForTimeout(400);
  await p.screenshot({path: path.join(foto, 'spk7-14-quer-blatt.png')});
  const lay = await p.evaluate(() => { const dd = SYNQUENZER.spk7.dd(), r = dd.getBoundingClientRect(), bs = [...dd.querySelectorAll('button')].map(b => b.getBoundingClientRect()); return {dd: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], klein: bs.filter(b => b.height < 36 || b.width < 36).length, n: bs.length, W: innerWidth, H: innerHeight, scroll: dd.scrollHeight > dd.clientHeight}; });
  const kq = await p.evaluate(() => { const k = SYNQUENZER.spk7.dd().querySelector('.spk7-kb'); k.scrollIntoView({block: 'nearest'}); const r = k.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; }); await p.waitForTimeout(200);
  const qr0 = R(await rms()); await touch('touchStart', [[kq.x + kq.w * 4.5 / 14, kq.y + kq.h * 0.85]]); await p.waitForTimeout(600); const qr1 = R(await rms()), qlit = await p.evaluate(() => SYNQUENZER.spk7.lit());
  await p.screenshot({path: path.join(foto, 'spk7-15-quer-spielen.png')});
  await touch('touchEnd', []); await p.waitForTimeout(1200); const qr2 = R(await rms());
  ok('quer-bedienbar', {ql, lay, spielen: {qr0, qr1, qlit, qr2}}, ql.ab[1] >= 36 && ql.imFeld && ql.lyH === 284 && ql.co[1] >= 36 && !lay.klein && lay.dd[0] >= 0 && lay.dd[2] <= lay.W && lay.dd[3] <= lay.H && qr1 > 0.002 && qlit.length === 1 && qr2 < qr1 * 0.2);
  await shut(); await p.screenshot({path: path.join(foto, 'spk7-16-quer-gesamt.png')});
  await p.setViewportSize({width: 428, height: 926}); await p.waitForTimeout(600); await p.screenshot({path: path.join(foto, 'spk7-17-hochkant-gesamt.png')});
} catch (e) { ok('ablauf', {e: String(e && e.stack || e).slice(0, 700)}, false); }
ok('keine-fehler', {errs: errs.slice(0, 5)}, !errs.length);
await E.b.close(); E.srv.close();
const pass = res.every(r => r.pass); console.log(pass ? 'ALLES OK (' + res.length + ')' : 'FEHLER');
if (outF) fs.writeFileSync(outF, JSON.stringify(res, null, 1));
process.exit(pass ? 0 : 1);
