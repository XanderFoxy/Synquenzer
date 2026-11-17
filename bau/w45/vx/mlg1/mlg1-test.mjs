// MLG1 – Klang aus DAW-Datei + Retro-Werksklänge im Klang-Browser (Playwright, Chromium, Touch, echter Datei-Wähler).
// Nur die synthetische Testdatei tests/test-3synth.cbp (eigene Werte). iPhone 12 Pro Max hochkant 428×926 und quer 926×428, Fotos DPR 2.
// Geprüft: Knopf „Aus DAW-Datei“ nur auf Synth-Spuren, Datei wählen per Touch → Liste der 3 Synth-Spuren (Sample-Spur nicht),
// Antippen lädt den übersetzten Klang (Werte = Kern), ein ↶ zurück / ↷ wieder, „Hall/Echo wie im Preset“ stellt das Projekt-Echo
// auf st (links X, rechts X/2) mit eigenem ↶, Speichern/Laden behält den Klang, falsche Datei → Meldung ohne Änderung,
// 10 Retro-Werksklänge im Browser, laden + offline hörbar (nicht still, kein Übersteuern), keine Fehler in der Konsole.
// Aufruf: node mlg1-test.mjs <index.html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
const file = path.resolve(process.argv[2]), here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(here, 'fotos');
fs.mkdirSync(fotos, {recursive: true});
const CBP = path.join(here, 'tests', 'test-3synth.cbp'), BAD = path.join(here, 'tests', 'kein-projekt.cbp');
fs.writeFileSync(BAD, Buffer.from('Das ist keine Projektdatei, nur Text.'.repeat(4)));
let bad = 0, good = 0; const out = [];
const ok = (c, m, d) => { const s = (c ? 'OK ' : 'FEHLER ') + m + (d != null && d !== '' ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : ''); if (!c) bad++; else good++; out.push(s); console.log(s); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [];
async function page(w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1800);
  p.cdp = await p.context().newCDPSession(p);
  return p;
}
const tch = (p, type, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
async function tap(p, x, y) { await tch(p, 'touchStart', x, y); await p.waitForTimeout(50); await tch(p, 'touchEnd'); await p.waitForTimeout(250); }
const ctr = (p, sel, k) => p.evaluate(([s, k]) => { const L = [...document.querySelectorAll(s)].filter(e => e.offsetParent); const e = L[k || 0]; if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height}; }, [sel, k]);
async function tapSel(p, sel, k) { const c = await ctr(p, sel, k); if (!c) return false; await tap(p, c.x, c.y); return true; }
const synthT = p => p.evaluate(() => S.tracks.findIndex(t => t.kind === 'synth'));
const drumT = p => p.evaluate(() => S.tracks.findIndex(t => t.kind === 'drum'));
async function pickFile(p, f) {
  const fc = p.waitForEvent('filechooser', {timeout: 4000});
  const tapped = await tapSel(p, '#sndSheet .mlgb');
  const ch = await fc.catch(() => null); if (!tapped || !ch) return false;
  await ch.setFiles(f); await p.waitForTimeout(600); return true;
}
for (const [W, H, tag] of [[428, 926, 'p'], [926, 428, 'l']]) {
  const p = await page(W, H);
  const t = await synthT(p), d = await drumT(p);
  // 1. Knopf im Browser (Synth-Spur), nicht auf der Drum-Spur
  if (d >= 0) { await p.evaluate(i => openBrowser(i), d); await p.waitForTimeout(300); ok(!(await ctr(p, '#sndSheet .mlgb')), tag + ': Drum-Spur – kein „Aus DAW-Datei“'); await p.evaluate(() => closeBrowser(false)); }
  await p.evaluate(i => { R.selT = i; openBrowser(i); }, t); await p.waitForTimeout(400);
  const bt = await ctr(p, '#sndSheet .mlgb');
  ok(bt && bt.h >= 32 && bt.w >= 60, tag + ': Knopf „Aus DAW-Datei“ im Fuß des Klang-Browsers, Tippfläche', bt && [Math.round(bt.w), Math.round(bt.h)]);
  await p.screenshot({path: path.join(fotos, 'mlg1-' + tag + '-browser.png')});
  const before = await p.evaluate(i => JSON.stringify(S.tracks[i].sound), t), undo0 = await p.evaluate(() => (typeof UNDO !== 'undefined' && UNDO.stack ? UNDO.stack.length : null));
  // 2. falsche Datei → Meldung, nichts geändert
  ok(await pickFile(p, BAD), tag + ': Datei-Wähler per Touch (falsche Datei)');
  const tt = await p.evaluate(() => EL.toast && !EL.toast.hidden ? EL.toast.textContent : '');
  ok(/Kein DAW-Projekt/.test(tt) && (await p.evaluate(i => JSON.stringify(S.tracks[i].sound), t)) === before, tag + ': falsche Datei → Meldung, Klang unverändert', tt.slice(0, 60));
  // 3. Testdatei → Liste mit 3 Synth-Spuren
  ok(await pickFile(p, CBP), tag + ': Datei-Wähler per Touch (.cbp)');
  const rows = await p.evaluate(() => [...document.querySelectorAll('.mlgl button[data-k]')].filter(e => e.offsetParent).map(e => e.textContent.trim()));
  ok(rows.length === 3 && /Bass Test/.test(rows[0]) && /Pfeifen Test/.test(rows[2]) && !rows.some(r => /Sample/.test(r)), tag + ': Liste der Synth-Spuren (ohne Sample-Spur)', rows.map(r => r.slice(0, 40)));
  const pop = await p.evaluate(() => { const P = UI.pop && UI.pop.el; if (!P) return null; const r = P.getBoundingClientRect(); return {l: r.left, r: r.right, t: r.top, b: r.bottom, vw: innerWidth, vh: innerHeight,
    small: [...P.querySelectorAll('button[data-k]')].filter(e => e.getBoundingClientRect().height < 40).length}; });
  ok(pop && pop.l >= -1 && pop.r <= pop.vw + 1 && pop.t >= -1 && pop.b <= pop.vh + 1 && pop.small === 0, tag + ': Liste im Bild, Zeilen ≥ 40 px', pop);
  await p.screenshot({path: path.join(fotos, 'mlg1-' + tag + '-liste.png')});
  // 4. Antippen lädt den Klang (Werte wie der Kern)
  await tapSel(p, '.mlgl button[data-k]', 0); await p.waitForTimeout(500);
  const got = await p.evaluate(i => { const s = S.tracks[i].sound; return {name: s.name, origin: s.origin, eng: s.engine, cut: s.p.cutoff, o2semi: s.p.o2semi, kt: s.p.kt, mods: s.mods, hint: UI.busHint && UI.busHint.bus && UI.busHint.bus.echo}; }, t);
  const ref = await p.evaluate(() => { const L = MLG1.state.list; return MLG1.toVa(L[0].patch, L[0].name).sound; });
  ok(got.origin === 'daw:va' && got.eng === 'analog' && got.cut === ref.p.cutoff && got.o2semi === -12 && got.mods.some(m => m.src === 'key' && m.dst === 'cutoff'), tag + ': Klang geladen = Übersetzer (Cutoff, Coarse, Key-Follow-Weg)', [got.name, got.cut, got.o2semi]);
  ok(got.hint && got.hint.mode === 'st' && got.hint.divL === '1/4.' && got.hint.divR === '1/8.', tag + ': „Hall/Echo wie im Preset“ bietet Echo st 1/4. | 1/8. an', got.hint);
  await p.screenshot({path: path.join(fotos, 'mlg1-' + tag + '-geladen.png')});
  // 5. Echo übernehmen (eigener Schritt), dann ↶ ↶ zurück, ↷ wieder
  const e0 = await p.evaluate(() => JSON.stringify(S.fxBus.echo));
  const bh = await tapSel(p, '#sndSheet .bush');
  const e1 = await p.evaluate(() => ({mode: S.fxBus.echo.mode, divL: S.fxBus.echo.divL, divR: S.fxBus.echo.divR, fb: S.fxBus.echo.fb}));
  ok(bh && e1.mode === 'st' && e1.divL === '1/4.' && e1.divR === '1/8.' && Math.abs(e1.fb - .12) < .02, tag + ': Projekt-Echo = st, links 1/4., rechts 1/8., Rückkopplung 12 %', e1);
  await p.evaluate(() => undo()); await p.waitForTimeout(150);
  ok((await p.evaluate(() => JSON.stringify(S.fxBus.echo))) === e0, tag + ': ↶ nimmt das Echo zurück (Klang bleibt)');
  await p.evaluate(() => undo()); await p.waitForTimeout(200);
  ok((await p.evaluate(i => JSON.stringify(S.tracks[i].sound), t)) === before, tag + ': ↶ stellt den vorigen Klang her');
  await p.evaluate(() => redo()); await p.waitForTimeout(200);
  ok((await p.evaluate(i => S.tracks[i].sound.origin, t)) === 'daw:va', tag + ': ↷ lädt ihn wieder');
  // 6. Speichern/Laden behält den Klang
  const rt = await p.evaluate(i => { const j = SQStore.serializeProject ? null : null; const s0 = JSON.stringify(S.tracks[i].sound.p); const o = JSON.parse(JSON.stringify(S.tracks[i].sound)); const n = SQStore.normalizeSound(o); return {same: JSON.stringify(n.p) === s0, mods: JSON.stringify(n.mods) === JSON.stringify(S.tracks[i].sound.mods)}; }, t);
  ok(rt.same && rt.mods, tag + ': Klang übersteht Speichern (normalizeSound-Rundreise gleich)', rt);
  // 7. Werksklänge: im Browser, laden, offline hörbar
  if (tag === 'p') {
    const W = await p.evaluate(() => FACTORY.filter(f => /^f-retro-/.test(f.id)).map(f => ({id: f.id, name: f.name, cat: f.cat})));
    ok(W.length === 10, '10 Retro-Werksklänge in FACTORY', W.map(w => w.name));
    await p.evaluate(() => { BR.all = false; BR.eng = null; BR.role = 'alle'; brRefresh(); }); await p.waitForTimeout(200);
    const shown = await p.evaluate(() => [...document.querySelectorAll('#sndSheet .brow')].map(e => e.dataset.id).filter(id => /^f-retro-/.test(id)).length);
    ok(shown === 10, 'alle 10 in der Liste „Alle“ des Browsers', shown);
    await p.evaluate(() => { const e = document.querySelector('#sndSheet .brow[data-id="f-retro-flaeche-warm"]'); if (e) e.scrollIntoView({block: 'center'}); });
    await p.screenshot({path: path.join(fotos, 'mlg1-p-werk.png')});
    const lv = await p.evaluate(async ids => {
      const res = [];
      for (const id of ids) {
        const snd = factorySound(id), rec = FACTORY_BY_ID.get(id), sr = 48000, oc = new OfflineAudioContext(1, sr * 3, sr);
        await oc.audioWorklet.addModule(spk2KlSrc()); const g = oc.createGain(); g.gain.value = snd.fx.vol; g.connect(oc.destination);
        const E = SynthHost.track(oc, g, wkFlat(snd), wkMods(snd), null, null); E.node.port.postMessage({mkSeed: 1}); E.tempo(120, null);
        const notes = rec.demo === 'bass' || rec.demo === 'seq16' ? [36, 43, 48] : [60, 64, 67]; notes.forEach((n, k) => { E.on(k + 1, n, .8, .05 + k * .5, null, 0); E.off(k + 1, .05 + k * .5 + .9); });
        E.flush(); await new Promise(r => setTimeout(r, 60)); const x = (await oc.startRendering()).getChannelData(0);
        let q = 0, pk = 0; for (let i = 0; i < x.length; i++) { q += x[i] * x[i]; pk = Math.max(pk, Math.abs(x[i])); }
        res.push({id, rms: +(10 * Math.log10(q / x.length + 1e-20)).toFixed(1), pk: +(20 * Math.log10(pk + 1e-20)).toFixed(1)});
      }
      return res;
    }, W.map(w => w.id));
    ok(lv.every(x => x.rms > -40 && x.pk < 0), 'Werksklänge offline hörbar, ohne Übersteuern (RMS > −40 dB, Spitze < 0 dBFS)', lv.map(x => x.id.slice(8) + ' ' + x.rms + '/' + x.pk));
    await p.evaluate(i => soundEdit(i, 'Sound', () => loadPreset(i, 'f-retro-bass-rund')), t); await p.waitForTimeout(200);
    ok((await p.evaluate(i => S.tracks[i].sound.origin, t)) === 'f-retro-bass-rund', 'Werksklang lädt auf die Spur');
  }
  await p.close();
}
ok(!errs.length, 'keine Fehler in der Konsole', errs.slice(0, 3));
fs.unlinkSync(BAD);
fs.writeFileSync(path.join(here, 'mlg1-test.out'), out.join('\n') + `\n${good} OK, ${bad} FEHLER\n`);
console.log(`\n${good} OK, ${bad} FEHLER`);
await b.close();
process.exit(bad ? 1 : 0);
