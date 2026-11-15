// Prüfer-Sonde MTX3C: (A) ohne Aufteilen alles wie Basis (Remix Song + Matrix, Projekt-JSON), (B) ECO-Anzeige + Synth-Modus,
// (C) Matrix-Remix aus Szene ohne HH-Clip + ↶, (D) Song-Remix Stil % (nicht Muster) + ↶. Aufruf: node p-mtx3c.mjs <html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import crypto from 'node:crypto';
const file = process.argv[2], b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']}), out = {};
async function open() { const ctx = await b.newContext({viewport: {width: 926, height: 370}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}); const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1600);
  await p.evaluate(() => { let s = 7; Math.random = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    window.__prep = () => { for (let i = 0; i < NT(); i++) if (i !== DRUM_T) S.tracks[i].clips = S.tracks[i].clips.map(() => null); const c = S.tracks[DRUM_T].clips[1]; if (c) c.notes = c.notes.filter(n => n.n !== 42); SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); };
    window.__cp = s => S.tracks.map((t, i) => { const c = t && t.clips[s]; if (!c || !(i === DRUM_T || t.dvx)) return null; const m = {}; for (const n of c.notes) { const id = (DRUM_BY_GM[n.n] || {}).id || n.n; m[id] = (m[id] || 0) + 1; } return i + ':' + Object.keys(m).sort().map(k => k + m[k]).join('/'); }).filter(Boolean).join(' ');
    window.__own = () => { const r = {}; for (const c of Object.values(S.song.own || {})) { if (!c || !c.from) continue; const t = c.from.t; for (const n of c.notes || []) { const id = (DRUM_BY_GM[n.n] || {}).id || n.n; const k = t + ':' + id; r[k] = (r[k] || 0) + 1; } } return Object.keys(r).sort().map(k => k + '=' + r[k]).join(' '); };
  });
  return {ctx, p, errs}; }
const md5 = s => crypto.createHash('md5').update(s).digest('hex').slice(0, 8);
{ const {ctx, p, errs} = await open();   // A: ohne Aufteilen
  const r = await p.evaluate(() => { __prep(); SYNQUENZER.gr2.remix('italo', {k: 100, art: 'm'}); const own = __own(); const mx = SYNQUENZER.gen3.mxRemix('italo', {src: 1, k: 100, art: 'm'});
    const js = JSON.parse(serializeProject()); delete js.saved; delete js.t; delete js.time; return {own, mx: mx && mx.dst != null ? __cp(mx.dst) : null, js: JSON.stringify(js.tracks) + JSON.stringify(js.song)}; });
  out.A = {own: r.own, mx: r.mx, projektMd5: md5(r.js), errs}; await ctx.close(); }
{ const {ctx, p, errs} = await open();   // B + C
  const r = await p.evaluate(async () => { __prep(); const sp = SYNQUENZER.mtx3.split(); const hh = sp.find(j => S.tracks[j].dvx.v === 'hatC'), o = {split: sp.map(j => j + ':' + S.tracks[j].dvx.v).join(',')};
    o.ecoHH = trackEco(hh); o.ecoDrums = trackEco(DRUM_T); o.isHH = mtx3Is(hh);
    selectTrack(hh); await new Promise(z => setTimeout(z, 200)); try { openEditor && openEditor(); } catch (e) {} await new Promise(z => setTimeout(z, 300));
    o.ecoSchild = ED.eco ? !ED.eco.hidden : 'kein ED.eco'; try { closeEditor && closeEditor(); } catch (e) {}
    // C: Matrix-Remix aus Szene 2 (dort kein HH-ZU-Clip)
    const u0 = UNDO.length, mx = SYNQUENZER.gen3.mxRemix('italo', {src: 1, k: 100, art: 'm'}); o.mxDst = mx && mx.dst; o.mx = mx && mx.dst != null ? __cp(mx.dst) : null; o.mxUndoN = UNDO.length - u0;
    o.seed = mx && mx.dst != null && S.tracks[hh].clips[mx.dst] ? (S.tracks[hh].clips[mx.dst].seed === S.tracks[DRUM_T].clips[mx.dst].seed) : null;
    undo(); o.mxNachUndo = mx && mx.dst != null ? __cp(mx.dst) || 'leer' : null;
    // B2: anderer Klang auf HH ZU (Synth-Modus) → normale ECO-Logik
    const snd = JSON.parse(JSON.stringify(S.tracks.find((t, i) => t && t.kind === 'synth' && !t.dvx && t.sound && t.sound.engine !== 'bm').sound)); applySound(hh, snd);
    o.nachKlang = {isHH: mtx3Is(hh), eco: trackEco(hh), engine: S.tracks[hh].sound.engine};
    return o; });
  out.BC = Object.assign(r, {errs}); await ctx.close(); }
{ const {ctx, p, errs} = await open();   // D: Song-Remix Stil 60 % (Variation, nicht Muster) nach dem Aufteilen
  const r = await p.evaluate(() => { __prep(); SYNQUENZER.mtx3.split(); const u0 = UNDO.length; SYNQUENZER.gr2.remix('italo', {k: 60, art: 'v'}); const o = {own: __own(), undoN: UNDO.length - u0}; undo(); o.nachUndo = __own() || 'leer'; return o; });
  out.D = Object.assign(r, {errs}); await ctx.close(); }
console.log(JSON.stringify(out)); await b.close();
