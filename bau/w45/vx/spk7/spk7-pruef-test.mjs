// SPK7 Prüfer-Runde: die Befunde aus PRUEFUNG.md im echten Browser nachgestellt (Playwright, Touch, hochkant 428×926).
// Aufruf: node spk7-pruef-test.mjs <abs index.html> [out.json]
import {start, page, openSpk, mixWav, btn, box} from './lib.mjs';
import fs from 'node:fs';
const file = process.argv[2], outF = process.argv[3], E = await start(file), errs = [], res = [];
const ok = (name, d, pass) => { res.push({name, pass: !!pass, d}); console.log((pass ? 'OK  ' : 'FEHL') + ' ' + name + ' ' + JSON.stringify(d)); };
try {
  const P = await page(E, 428, 926, errs), {p, tap, drag, touch} = P, W = ms => p.waitForTimeout(ms);
  await openSpk(P, mixWav(E.dir, 8));
  await p.evaluate(() => {
    const c = ensureAudio(), z = c.createGain(); z.gain.value = 0; z.connect(c.destination);
    const sp = c.createScriptProcessor(4096, 1, 1); window.__S = {on: false, n: 0, nan: 0}; sp.onaudioprocess = e => { const S = window.__S; if (!S.on) return; for (const v of e.inputBuffer.getChannelData(0)) { S.n++; if (!(v === v)) S.nan++; } }; AU.M.ceil.connect(sp); sp.connect(z);
    const sr = c.createScriptProcessor(4096, 2, 2); window.__R = {on: false, L: []}; sr.onaudioprocess = e => { if (window.__R.on) window.__R.L.push(new Float32Array(e.inputBuffer.getChannelData(0))); }; AU.masterSum.connect(sr); sr.connect(z);
    window.__recOn = () => { window.__R.L = []; window.__R.on = true; };
    window.__recOff = f => { window.__R.on = false; const n = window.__R.L.reduce((a, b) => a + b.length, 0), x = new Float32Array(n); let o = 0; for (const b of window.__R.L) { x.set(b, o); o += b.length; }
      let nan = 0, pk = 0, mj = 0; for (let i = 0; i < n; i++) { const v = x[i]; if (!(v === v)) { nan++; continue; } pk = Math.max(pk, Math.abs(v)); if (i) mj = Math.max(mj, Math.abs(v - x[i - 1])); }
      const bound = pk * 2 * Math.PI * (f || 220) / c.sampleRate; return {n, nan, pk: +pk.toFixed(4), ratio: bound > 0 ? +(mj / bound).toFixed(2) : null}; };
    window.__sine = (f, sec, sr) => { const x = new Float32Array(Math.round(sec * sr)); for (let i = 0; i < x.length; i++) x[i] = 0.8 * Math.sin(2 * Math.PI * f * i / sr); return x; };
    window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); } catch (e) {}
  });
  // B1 (schwer) + B5: Nutzerweg zum NaN – lange Auswahl → Klangkorn ▾ (Hauptfaden-Blockade messen), Ausklang 6 s, Filter 70 %, Position 90 %, Taste links antippen, Verwerfen, kurze Auswahl → Klangkorn ▾
  await tap(await btn(p, 'Pinsel'));
  let mn = await box(p, '#spk1Sheet .spk1-mn'); await drag([mn.x + mn.w * 0.15, mn.y + mn.h * 0.42], [mn.x + mn.w * 0.75, mn.y + mn.h * 0.42], 14);
  await p.evaluate(() => { window.__lt = []; }); const t0 = Date.now();
  await tap(await btn(p, 'Klangkorn ▾')); await p.waitForFunction(() => SYNQUENZER.spk7.src() && SYNQUENZER.spk7.dd() && !SPK7.busy, null, {timeout: 30000}); const ms = Date.now() - t0; await W(500);
  const lt = await p.evaluate(() => ({lt: window.__lt.slice().sort((a, b) => b - a).slice(0, 5), wk: SYNQUENZER.spk7.wk(), n: SYNQUENZER.spk7.src().n, mode: SYNQUENZER.spk7.mode()}));
  // Rechenzeit der Quelle im Hauptfaden, 10 s (nur Kürzen; Grundton/Spektren/Bild im Worker)
  const q10 = await p.evaluate(async () => { const sr = AU.ctx.sampleRate, x = new Float32Array(sr * 10); for (let i = 0; i < x.length; i++) x[i] = 0.5 * Math.sin(2 * Math.PI * 196 * i / sr) + 0.2 * (Math.random() - 0.5);
    window.__lt = []; const t = performance.now(); const S7 = await SYNQUENZER.spk7.makeA(x, sr); const tot = performance.now() - t; await new Promise(r => setTimeout(r, 200)); return {f0: Math.round(S7.f0), gesamtMs: Math.round(tot), longtasks: window.__lt.slice()}; });
  ok('b5-als-klangkorn-ohne-stillstand', {ms, longtasks: lt.lt, worker: lt.wk, quelle10s: q10}, lt.wk === 'worker' && (lt.lt[0] || 0) < 120 && Math.abs(q10.f0 - 196) < 3 && !q10.longtasks.some(v => v >= 80));
  await p.evaluate(() => { const dd = SYNQUENZER.spk7.dd(); for (const [k, v] of [['r', 6], ['fc', 0.7], ['pos', 0.9]]) { const r = dd.querySelector('input[data-k="' + k + '"]'); r.value = v; r.dispatchEvent(new Event('input')); } });
  await p.evaluate(() => spk1Dd(SPK1.ui, null)); await W(300);
  const n1 = await p.evaluate(() => SYNQUENZER.spk7.src().n);
  await p.evaluate(() => { window.__S.on = true; });
  const ky = await box(p, '#spk1Sheet .spk1-ky'); await tap([ky.x + ky.w / 2, ky.y + ky.h * 0.6]); await W(150);
  await tap(await btn(p, 'Verwerfen')); await W(150);
  mn = await box(p, '#spk1Sheet .spk1-mn'); await drag([mn.x + mn.w * 0.40, mn.y + mn.h * 0.42], [mn.x + mn.w * 0.46, mn.y + mn.h * 0.42], 4);
  await tap(await btn(p, 'Klangkorn ▾')); await p.waitForFunction(() => !SPK7.busy, null, {timeout: 30000}); await W(2500);
  const b1 = await p.evaluate(() => ({S: Object.assign({}, window.__S), n2: SYNQUENZER.spk7.src() && SYNQUENZER.spk7.src().n}));
  ok('b1-quellwechsel-kein-nan', {quelleVorher: n1, quelleNachher: b1.n2, proben: b1.S.n, nan: b1.S.nan}, b1.n2 && b1.n2 < n1 && b1.S.n > 48000 && b1.S.nan === 0);
  await p.evaluate(() => { window.__S.on = false; SYNQUENZER.spk7.p({r: 0.3, fc: 1, pos: 0.3}); spk7AllOff(); }); await W(400);
  // B2: Umschalten bei klingender Note (Sinus 220 Hz, Taste A3) – Sprung / (Spitze·ω) ≤ 1,5
  await p.evaluate(() => { SYNQUENZER.spk7.make(window.__sine(220, 2, AU.ctx.sampleRate), AU.ctx.sampleRate, 220); SYNQUENZER.spk7.p({art: 'korn', pos: 0.3, bew: 0, gs: 0.08, dc: 4, spo: 0.1, spt: 0, fc: 1, q: 0.1, a: 0.02, r: 0.3, br: 0.5, vol: 0.7}); });
  const scen = async fn => { await p.evaluate(() => window.__recOn()); await p.evaluate(fn); const r = await p.evaluate(() => window.__recOff(220)); await W(300); return r; };
  const sl = ms => `await new Promise(r => setTimeout(r, ${ms}))`;
  const b2 = {
    modus: await scen(`(async () => { const id = SYNQUENZER.spk7.on(57, 0.85); ${sl(500)}; SYNQUENZER.spk7.p({art: 'frz'}); ${sl(500)}; SYNQUENZER.spk7.p({art: 'korn'}); ${sl(500)}; SYNQUENZER.spk7.off(id); ${sl(600)}; })()`),
    filterZu: await scen(`(async () => { const id = SYNQUENZER.spk7.on(57, 0.85); ${sl(500)}; SYNQUENZER.spk7.p({fc: 0.45}); ${sl(500)}; SYNQUENZER.spk7.off(id); ${sl(600)}; })()`),
    filterAuf: await scen(`(async () => { SYNQUENZER.spk7.p({fc: 0.45}); const id = SYNQUENZER.spk7.on(57, 0.85); ${sl(500)}; SYNQUENZER.spk7.p({fc: 1}); ${sl(500)}; SYNQUENZER.spk7.off(id); ${sl(600)}; })()`)};
  ok('b2-umschalten-ohne-knacks', b2, Object.values(b2).every(r => r.ratio != null && r.ratio <= 1.5 && !r.nan && r.pk > 0.005));
  // B3: Position wirkt bei „▶ Vorhören“ (Körnchen): Marker im Quellbild ziehen
  const cent = () => p.evaluate(() => { const a = window.__an2 || (window.__an2 = (() => { const a = AU.ctx.createAnalyser(); a.fftSize = 8192; AU.masterSum.connect(a); return a; })()), d = new Float32Array(a.frequencyBinCount); a.getFloatFrequencyData(d); let s = 0, w = 0; for (let k = 2; k < d.length; k++) { const m = Math.pow(10, d[k] / 20); s += m * k; w += m; } return Math.round(s / w * AU.ctx.sampleRate / a.fftSize); });
  await p.evaluate(() => { const sr = AU.ctx.sampleRate, x = new Float32Array(sr * 2); for (let i = 0; i < x.length; i++) x[i] = 0.8 * Math.sin(2 * Math.PI * (i < sr ? 300 : 1200) * i / sr); SYNQUENZER.spk7.make(x, sr, 300); SYNQUENZER.spk7.p({art: 'korn', pos: 0.1, bew: 0, spo: 0, spt: 0, fc: 1, a: 0.02, r: 0.3}); });
  await tap(await btn(p, 'Klangkorn ▾')); await p.waitForFunction(() => SYNQUENZER.spk7.dd() && !SPK7.busy, null, {timeout: 10000}); await W(300);
  await p.evaluate(() => { const sr = AU.ctx.sampleRate, x = new Float32Array(sr * 2); for (let i = 0; i < x.length; i++) x[i] = 0.8 * Math.sin(2 * Math.PI * (i < sr ? 300 : 1200) * i / sr); SYNQUENZER.spk7.make(x, sr, 300); SYNQUENZER.spk7.p({art: 'korn', pos: 0.1, bew: 0, spo: 0, spt: 0, fc: 1, a: 0.02, r: 0.3}); spk7DdSync(SPK1.ui); SYNQUENZER.spk7.dd().querySelector('.spk7-cv').scrollIntoView({block: 'nearest'}); });
  await cent(); await tap(await btn(p, '▶ Vorhören')); await W(900); const c1 = await cent();
  const cvb = await box(p, '#spk1Sheet .spk7-cv'); await drag([cvb.x + cvb.w * 0.1, cvb.y + cvb.h / 2], [cvb.x + cvb.w * 0.9, cvb.y + cvb.h / 2], 10); await W(800);
  const c2 = await cent(), pos = await p.evaluate(() => SYNQUENZER.spk7.p().pos); await tap(await btn(p, '■ Stopp')); await W(300);
  ok('b3-position-live-vorhoeren', {schwerpunktVorher: c1, nachZiehen: c2, pos}, pos > 0.8 && c2 > c1 * 2);
  // B13: Schleife blendet die Körnchen-Regler aus; schwarze Tasten breiter
  const b13 = await p.evaluate(() => { const dd = SYNQUENZER.spk7.dd(), vis = () => ['gs', 'dc', 'spt', 'form'].map(k => !!dd.querySelector('input[data-k="' + k + '"]').offsetParent); const a = vis(); const seg = [...dd.querySelectorAll('button')].find(b => b.textContent.trim() === 'Schleife'); seg.click(); const b = vis(); [...dd.querySelectorAll('button')].find(x => x.textContent.trim() === 'Körnchen').click(); const c = vis(); const bk = dd.querySelector('.spk7-kb>i.b').getBoundingClientRect().width; return {koernchen: a, schleife: b, zurueck: c, schwarz: Math.round(bk)}; });
  ok('b13-regler-und-tasten', b13, b13.koernchen.every(Boolean) && b13.schleife.every(v => !v) && b13.zurueck.every(Boolean) && b13.schwarz >= 16);
  await p.evaluate(() => spk1Dd(SPK1.ui, null)); await W(200);
  // B6: Rollen der Tastatur links im KORN-Modus bleibt still; Tipp spielt
  await p.evaluate(() => { SYNQUENZER.spk7.make(window.__sine(220, 2, AU.ctx.sampleRate), AU.ctx.sampleRate, 220); SYNQUENZER.spk7.p({pos: 0.3, spo: 0.1}); SYNQUENZER.spk7.mode('korn'); });
  const k2 = await box(p, '#spk1Sheet .spk1-ky'), m0 = await p.evaluate(() => SPK1.ui.v.mTop);
  await p.evaluate(() => window.__recOn()); await drag([k2.x + k2.w / 2, k2.y + k2.h * 0.5], [k2.x + k2.w / 2, k2.y + k2.h * 0.7], 10); await W(500);
  const roll = await p.evaluate(() => window.__recOff(220)), m1 = await p.evaluate(() => SPK1.ui.v.mTop);
  await p.evaluate(() => window.__recOn()); await tap([k2.x + k2.w / 2, k2.y + k2.h * 0.5]); await W(700); const tip = await p.evaluate(() => window.__recOff(220));
  ok('b6-rollen-still-tipp-klingt', {gerollt: +(m1 - m0).toFixed(1), rollenSpitze: roll.pk, tippSpitze: tip.pk}, Math.abs(m1 - m0) > 3 && roll.pk < 0.005 && tip.pk > 0.02);
  // B8: Ecke TON|KORN – Druck 8 px unter der Tasten-Oberkante geht an die Tasten (kein Umschalten, Ton), oben schaltet sie um
  await p.evaluate(() => { SPK1.ui.v.mTop = 84; spk1Clamp(SPK1.ui); spk1Dirty(SPK1.ui, 'all'); }); await W(200);
  const co = await p.evaluate(() => { const r = SPK1.ui.co7.getBoundingClientRect(), k = SPK1.ui.ky.getBoundingClientRect(); return {c: [r.left + r.width / 2, r.top + 8], k: [k.left + 10, k.top + 8], h: Math.round(r.height)}; });
  const s0 = await p.evaluate(() => SPK7.seq); await tap(co.k); await W(300);
  const e1 = await p.evaluate(() => ({m: SYNQUENZER.spk7.mode(), seq: SPK7.seq}));
  await tap(co.c); const e2 = await p.evaluate(() => SYNQUENZER.spk7.mode()); await tap(co.c); const e3 = await p.evaluate(() => SYNQUENZER.spk7.mode());
  ok('b8-ecke-gibt-an-tasten-weiter', {hoehe: co.h, nachTippAufTaste: e1.m, tonGespielt: e1.seq > s0, obenTipp: e2, wieder: e3}, co.h >= 44 && e1.m === 'korn' && e1.seq > s0 && e2 === 'ton' && e3 === 'korn');
  // B4: Klangkorn-Spur – Klang-Editor-Werte wirken (Filter), Engine-Wechsel = normaler Klang, zurück auf WT = Klangkorn
  const b4 = await p.evaluate(async () => {
    const c = AU.ctx; SYNQUENZER.spk7.make(window.__sine(220, 2, c.sampleRate), c.sampleRate, 220); const a = SYNQUENZER.spk7.take('neu'), i = a.track;
    const v0 = spawnVoice(i, 60, 0.9, c.currentTime + 0.05, {src: 'audition'}); await new Promise(r => setTimeout(r, 200)); v0.release(c.currentTime);
    const fc0 = SYNQUENZER.spk7.trEng(i).p.fc;
    const s = deep(S.tracks[i].sound); s.p.cutoff = 300; s.p.res = 0.6; s.p.wt.pos = 0.7; applySound(i, s);
    const v1 = spawnVoice(i, 60, 0.9, c.currentTime + 0.05, {src: 'audition'}); await new Promise(r => setTimeout(r, 200)); v1.release(c.currentTime);
    const e1 = SYNQUENZER.spk7.trEng(i).p, out = {fc0, nachEditor: {fc: +e1.fc.toFixed(3), q: e1.q, pos: e1.pos}};
    for (const eng of ['analog', 'fm6', 'wt']) { setEngine(i, eng); const v = spawnVoice(i, 60, 0.9, c.currentTime + 0.05, {src: 'audition'}); out[eng] = !!(v && v.korn); await new Promise(r => setTimeout(r, 150)); if (v) v.release(c.currentTime); }
    return out;
  });
  ok('b4-klang-editor-und-engine', b4, b4.fc0 === 1 && b4.nachEditor.fc < 0.45 && Math.abs(b4.nachEditor.q - 0.6) < 0.01 && b4.nachEditor.pos === 0.7 && !b4.analog && !b4.fm6 && b4.wt);
  // B14: Spur-Engine wird nach Klangwechsel abgebaut; ein Listener je Seite
  const b14 = await p.evaluate(async () => {
    const i = S.tracks.findIndex(t => t.sound && t.sound.p && t.sound.p.wt && t.sound.p.wt.h), vor = SYNQUENZER.spk7.trAll();
    applySound(i, deep(S.tracks[0].sound));   // ein normaler Klang (Synth 1) SYNQUENZER.spk7.jan(); await new Promise(r => setTimeout(r, 4600)); return {vor, nach: SYNQUENZER.spk7.trAll(), vis: SPK7.vis, klang: S.tracks[i].sound.engine + ' ' + S.tracks[i].sound.name};
  });
  ok('b14-aufraeumen', b14, b14.vor >= 1 && b14.nach === 0 && b14.vis === 1);
  // B11 + B12: alle Spuren belegt – Knopf sagt es, kein verwaister Take; Statuszeile ohne „↶“-Versprechen
  const b11 = await p.evaluate(async () => {
    const st = (() => { SYNQUENZER.spk7.take('neu'); return (document.querySelector('#spk1Sheet .spk1-st') || {}).textContent || ''; })();
    let g = 0; while (canAddTrack() && g++ < 10) { const i = NT(), nt = newSynthTrack(i, DEFAULT_SOUNDS[2]); restoreTrack(i, JSON.stringify(nt)); }
    SPK7.tgt = 'neu'; spk7Dd(SPK1.ui, SPK1.ui.b7); await new Promise(r => setTimeout(r, 300));
    const dd = SYNQUENZER.spk7.dd(), b = dd.querySelector('[data-k="take"]'), tk0 = Object.keys(S.takes || {}).length, n0 = S.tracks.length;
    SYNQUENZER.spk7.forget && 0; const src = SPK7.src; if (src) src.take = null;
    const r = SYNQUENZER.spk7.take('neu'); spk1Dd(SPK1.ui, null);
    return {status: st, knopf: b.textContent, gesperrt: b.disabled, ergebnis: r, takesVor: tk0, takesNach: Object.keys(S.takes || {}).length, spuren: [n0, S.tracks.length]};
  });
  ok('b11-b12-spuren-voll-und-status', b11, !/↶/.test(b11.status) && /Rückgängig/.test(b11.status) && /Keine Spur frei/.test(b11.knopf) && b11.gesperrt && b11.ergebnis === null && b11.takesNach === b11.takesVor && b11.spuren[0] === b11.spuren[1]);
  // B15: Hilfe-Eintrag
  const b15 = await p.evaluate(() => { const L = ui1Entries(), e = L.find(x => x.id === 'spk7'); return e ? {n: e.n, w: e.w, treffer: ui1Search ? (ui1Search('klangkorn') || []).slice(0, 3).map(x => x.id || x.n) : null} : null; });
  ok('b15-hilfe', b15, !!b15 && /Klangkorn/.test(b15.n));
} catch (e) { ok('ablauf', {e: String(e && e.stack || e).slice(0, 700)}, false); }
ok('keine-fehler', {errs: errs.slice(0, 5)}, !errs.length);
await E.b.close(); E.srv.close();
const pass = res.every(r => r.pass); console.log(pass ? 'ALLES OK (' + res.length + ')' : 'FEHLER');
if (outF) fs.writeFileSync(outF, JSON.stringify(res, null, 1));
process.exit(pass ? 0 : 1);
