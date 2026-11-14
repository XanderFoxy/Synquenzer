// SPK7 Seiten-Test (Playwright, Touch): Pinsel-Auswahl → Klangkorn ▾ → Quelle + Grundton, Tastatur Probeton|Klangkorn (Halten = Ton),
// Regler, Spektral-Schleife, Als Instrument (neue Spur, ↶/↷), Spur-Stimme über die Engine, Worklet offline (Tonhöhe), Rückfall,
// Speichern/Laden (JSON + Container), quer 926×428. Aufruf: node spk7-test.mjs <abs index.html> [out.json]
import {start, page, openSpk, mixWav, btn, box} from './lib.mjs';
import fs from 'node:fs';
import path from 'node:path';
const file = process.argv[2], outF = process.argv[3], E = await start(file), errs = [], res = [], foto = path.join(path.dirname(file), 'fotos');
fs.mkdirSync(foto, {recursive: true});
const ok = (name, d, pass) => { res.push({name, pass: !!pass, d}); console.log((pass ? 'OK  ' : 'FEHL') + ' ' + name + ' ' + JSON.stringify(d)); };
try {
  const P = await page(E, 428, 926, errs), {p, tap, drag, touch} = P;
  await openSpk(P, mixWav(E.dir, 8));
  // 1) Pinsel über den Lead-Bereich malen
  await tap(await btn(p, 'Pinsel'));
  const mn = await box(p, '#spk1Sheet .spk1-mn'), y = mn.y + mn.h * 0.42;
  await drag([mn.x + mn.w * 0.15, y], [mn.x + mn.w * 0.75, y], 14);
  const sel = await p.evaluate(() => SPK1.ui.sel.map(s => s.art));
  // 2) Klangkorn ▾ → holt die Auswahl, zeigt Quelle + Grundton
  const kb = await btn(p, 'Klangkorn'); const kbb = await p.evaluate(() => { const r = SPK1.ui.b7.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
  await tap(kb);
  await p.waitForFunction(() => SYNQUENZER.spk7.src() && !/geholt/.test(SYNQUENZER.spk7.dd() ? SYNQUENZER.spk7.dd().textContent : ''), null, {timeout: 30000}); await p.waitForTimeout(300);
  const s1 = await p.evaluate(() => ({src: SYNQUENZER.spk7.src(), tx: SYNQUENZER.spk7.dd().querySelector('.spk7-tx').textContent}));
  await p.screenshot({path: path.join(foto, 'spk7-01-klappfenster.png')});
  ok('quelle-aus-pinsel', {kb: kbb, sel, n: s1.src.n, sr: s1.src.sr, f0: Math.round(s1.src.f0), tx: s1.tx}, sel.includes('pinsel') && s1.src.n > 1000 && s1.src.wo === 'Auswahl' && /Grundton/.test(s1.tx) && kbb[1] >= 36);
  // 3) Tastatur-Modus Klangkorn (Schalter im Klappfenster), Ecke zeigt KORN; Halten auf einer Taste = Ton hält, Loslassen = aus
  await tap(await btn(p, 'Klangkorn', '#spk1Sheet .spk7-md'));
  const md = await p.evaluate(() => ({m: SYNQUENZER.spk7.mode(), co: document.querySelector('#spk1Sheet .spk1-co').textContent}));
  await p.evaluate(() => { const c = AU.ctx, a = c.createAnalyser(); a.fftSize = 2048; (AU.masterSum || c.destination).connect(a); window.__an = a; });
  const rms = () => p.evaluate(() => { const a = window.__an, d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let e = 0; for (const v of d) e += v * v; return Math.sqrt(e / d.length); });
  await tap([mn.x + mn.w * 0.5, mn.y + 20]);   // Klappfenster zu (Tipp daneben)
  const ky = await box(p, '#spk1Sheet .spk1-ky'), kp = [ky.x + ky.w / 2, ky.y + ky.h * 0.5];
  const r0 = await rms(); await touch('touchStart', [kp]); await p.waitForTimeout(700); const r1 = await rms(), held = await p.evaluate(() => SYNQUENZER.spk7.eng());
  await touch('touchEnd', []); await p.waitForTimeout(1300); const r2 = await rms();
  ok('tastatur-klangkorn-halten', {md, eng: held, rmsVor: +r0.toFixed(5), rmsHalten: +r1.toFixed(5), rmsNachLos: +r2.toFixed(5)}, md.m === 'korn' && md.co === 'KORN' && held && held.kind === 'worklet' && r1 > 0.002 && r1 > r0 * 4 && r2 < r1 * 0.2);
  // 4) Regler + Art: Korngröße, Spektral-Schleife (Werte kommen in der Engine an; Halten klingt auch als Schleife)
  await tap(kb); await p.waitForTimeout(250);
  await p.evaluate(() => { const r = SYNQUENZER.spk7.dd().querySelector('input[data-k="gs"]'); r.value = 0.25; r.dispatchEvent(new Event('input')); });
  await tap(await btn(p, 'Spektral-Schleife', '#spk1Sheet .spk7-art'));
  const pp = await p.evaluate(() => SYNQUENZER.spk7.p()); await tap([mn.x + mn.w * 0.5, mn.y + 20]);
  await touch('touchStart', [kp]); await p.waitForTimeout(600); const r3 = await rms(); await touch('touchEnd', []); await p.waitForTimeout(900);
  ok('regler-und-spektral-schleife', {gs: pp.gs, art: pp.art, rmsSchleife: +r3.toFixed(5)}, Math.abs(pp.gs - 0.25) < 1e-6 && pp.art === 'frz' && r3 > 0.002);
  await p.evaluate(() => SYNQUENZER.spk7.p({art: 'korn', gs: 0.08}));
  // 5) Probeton-Modus: Tipp spielt wieder den Probeton (kein Klangkorn)
  await p.evaluate(() => SYNQUENZER.spk7.mode('ton')); const q0 = await p.evaluate(() => SPK7.seq); await tap(kp); const q1 = await p.evaluate(() => SPK7.seq);
  ok('probeton-modus', {seqVor: q0, seqNach: q1, co: await p.evaluate(() => document.querySelector('#spk1Sheet .spk1-co').textContent)}, q0 === q1);
  await p.evaluate(() => SYNQUENZER.spk7.mode('korn'));
  // 6) Als Instrument: neue Spur (Klang wt + p.wt.h, Audio als Take), ein ↶ / ↷
  const n0 = await p.evaluate(() => S.tracks.length);
  await tap(kb); await p.waitForTimeout(200); await tap(await btn(p, 'Als Instrument')); await p.waitForTimeout(400);
  const t1 = await p.evaluate(() => { const L = SYNQUENZER.spk7.last(), t = S.tracks[L.track], h = t.sound.p.wt.h; return {n: S.tracks.length, i: L.track, name: t.name, eng: t.sound.engine, h, take: !!(S.takes && S.takes[h.take]), used: tkUsedIds().includes(h.take)}; });
  const u = await p.evaluate(() => { undo(); const a = S.tracks.length; redo(); const b = S.tracks.length; return {nachUndo: a, nachRedo: b}; });
  ok('als-instrument-undo', {n0, t1: Object.assign({}, t1, {h: {take: t1.h.take, f0: t1.h.f0, art: t1.h.art, gs: t1.h.gs}}), u}, t1.n === n0 + 1 && t1.eng === 'wt' && t1.take && t1.used && t1.h.f0 > 20 && u.nachUndo === n0 && u.nachRedo === n0 + 1);
  // 7) Spur spielt über die Klangkorn-Engine (Proxy-Stimme, Worklet an der Spur), Ton hörbar an der Summe
  await p.evaluate(() => SPK1_API.page.close()); await p.waitForTimeout(300);
  const sv = await p.evaluate(async i => { const c = AU.ctx, v = spawnVoice(i, 60, 0.9, c.currentTime + 0.05, {src: 'audition'}); await new Promise(r => setTimeout(r, 700)); const a = window.__an, d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let e = 0; for (const x of d) e += x * x; const on = {korn: !!(v && v.korn), voices: SYNQUENZER.spk7.voices(), eng: SYNQUENZER.spk7.trEng(i), rms: Math.sqrt(e / d.length)}; v.release(c.currentTime + 0.01); await new Promise(r => setTimeout(r, 1200)); on.nachher = SYNQUENZER.spk7.voices(); return on; }, t1.i);
  ok('spur-stimme', sv, sv.korn && sv.eng && sv.eng.kind === 'worklet' && sv.rms > 0.001 && sv.nachher === 0);
  // 8) Worklet offline (dieselbe Engine): Sinus 220 Hz als Quelle, Taste A3 = 220 Hz, +12 = 440 Hz (±10 ct); Rückfall ScriptProcessor gleich
  const wk = await p.evaluate(async () => {
    const sr = 48000, x = new Float32Array(sr * 2); for (let i = 0; i < x.length; i++) x[i] = 0.9 * Math.sin(2 * Math.PI * 220 * i / sr); SYNQUENZER.spk7.make(x, sr);
    const pk = (L) => { const N = 32768, a = 24000, re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < N; i++) re[i] = L[a + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)); spk7Fft(re, im, false); let b = 2, M = k => Math.hypot(re[k], im[k]); for (let k = 2; k < N / 2 - 1; k++) if (M(k) > M(b)) b = k; const l = Math.log(M(b - 1)), c = Math.log(M(b)), r = Math.log(M(b + 1)); return (b + 0.5 * (l - r) / (l - 2 * c + r)) * sr / N; };
    const out = {};
    for (const [nm, o] of [['worklet', {}], ['rueckfall', {script: true}]]) for (const m of [57, 69]) { const r = await SYNQUENZER.spk7.render(Object.assign({dur: 1.6, notes: [{m, t0: 0.02, t1: 1.4}]}, o)); out[nm + m] = {kind: r.kind, hz: +pk(r.L).toFixed(2), ms: Math.round(r.ms)}; }
    const t = performance.now(); const r8 = await SYNQUENZER.spk7.render({dur: 5, notes: [48, 52, 55, 59, 62, 64, 67, 71].map(m => ({m, t0: 0}))}); out.cpu8x5s = {kind: r8.kind, ms: Math.round(performance.now() - t)};
    return out;
  });
  const cts = ['worklet57', 'worklet69', 'rueckfall57', 'rueckfall69'].map(k => 1200 * Math.log2(wk[k].hz / (k.endsWith('57') ? 220 : 440)));
  ok('worklet-tonhoehe-cpu', {wk, ct: cts.map(c => +c.toFixed(2))}, wk.worklet57.kind === 'worklet' && wk.rueckfall57.kind === 'script' && cts.every(c => Math.abs(c) < 10) && wk.cpu8x5s.ms < 1250);
  // 9) Speichern/Laden: JSON (serialize → importJSON) behält p.wt.h, Container enthält takes/<id>.wav; Laden ohne Zwischenspeicher → Engine holt das Audio
  const rt = await p.evaluate(async i => {
    const h0 = JSON.stringify(S.tracks[i].sound.p.wt.h), take = S.tracks[i].sound.p.wt.h.take, js = SYNQUENZER.serialize(); await SYNQUENZER.importJSON(js); await new Promise(r => setTimeout(r, 500));
    const k = S.tracks.findIndex(t => t.sound && t.sound.p.wt && t.sound.p.wt.h && t.sound.p.wt.h.take === take), h1 = k >= 0 ? JSON.stringify(S.tracks[k].sound.p.wt.h) : null;
    const z = await tkZipBytes(), fs1 = await tkUnzip(z), wav = fs1.some(f => f.name === 'takes/' + take + '.wav');
    SYNQUENZER.spk7.forget(take); const ld = await SYNQUENZER.spk7.load(take, S.tracks[k].sound.p.wt.h.f0);   // Audio aus dem Gerätespeicher (wie nach dem Neustart)
    const c = AU.ctx, v = spawnVoice(k, 64, 0.9, c.currentTime + 0.05, {src: 'audition'}); await new Promise(r => setTimeout(r, 900));
    const ca = ld, a = window.__an, d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let e = 0; for (const x of d) e += x * x; v.release(c.currentTime + 0.01);
    return {gleich: h0 === h1, k, wav, zipFiles: fs1.length, cache: ca, rms: Math.sqrt(e / d.length)};
  }, t1.i);
  ok('speichern-laden', rt, rt.gleich && rt.wav && rt.cache && rt.cache.n > 1000 && rt.rms > 0.001);
  // 10) quer 926×428: Klappfenster bedienbar (alle Knöpfe ≥ 36 px, im Bild), Werkzeug-Taste erreichbar
  await p.setViewportSize({width: 926, height: 428}); await p.evaluate(() => SPK1_API.page.open({id: SPK1.doc})); await p.waitForTimeout(1200);
  await tap(await btn(p, 'Klangkorn')); await p.waitForTimeout(300);
  const lay = await p.evaluate(() => { const dd = SYNQUENZER.spk7.dd(), r = dd.getBoundingClientRect(), bs = [...dd.querySelectorAll('button')].map(b => b.getBoundingClientRect()), b7 = SPK1.ui.b7.getBoundingClientRect(); return {dd: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], klein: bs.filter(b => b.height < 36 || b.width < 36).length, n: bs.length, b7: [Math.round(b7.width), Math.round(b7.height)], scroll: dd.scrollHeight > dd.clientHeight, W: innerWidth, H: innerHeight}; });
  await p.screenshot({path: path.join(foto, 'spk7-02-quer.png')});
  ok('quer-bedienbar', lay, !lay.klein && lay.dd[0] >= 0 && lay.dd[2] <= lay.W && lay.dd[3] <= lay.H && lay.b7[1] >= 36);
  await p.setViewportSize({width: 428, height: 926}); await p.waitForTimeout(500); await p.screenshot({path: path.join(foto, 'spk7-03-hochkant.png')});
} catch (e) { ok('ablauf', {e: String(e && e.stack || e).slice(0, 600)}, false); }
ok('keine-fehler', {errs: errs.slice(0, 5)}, !errs.length);
await E.b.close(); E.srv.close();
const pass = res.every(r => r.pass); console.log(pass ? 'ALLES OK (' + res.length + ')' : 'FEHLER');
if (outF) fs.writeFileSync(outF, JSON.stringify(res, null, 1));
process.exit(pass ? 0 : 1);
