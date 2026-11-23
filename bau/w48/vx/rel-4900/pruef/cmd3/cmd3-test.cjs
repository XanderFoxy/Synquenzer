// CMD3 Kern-Test (Browser): Basis gegen neue Fassung, iPhone hochkant 428×926, Touch.
// Aufruf: node cmd3-test.cjs <port> [basis-ordner] [neu-ordner]   (Server-Wurzel = srv/, darin je Ordner index.html + version.json)
// Testdatei tests/imp4-song.cbp: 2 Drum-Spuren klatschen gleichzeitig (8 Clap-Paare), Synth „Bass“ mit Delay 1/4., „Lead“ mit Delay 1/8.
const {chromium} = require('playwright'), fs = require('fs'), path = require('path');
const port = process.argv[2], BAS = process.argv[3] || 'basis', NEU = process.argv[4] || 'neu', here = __dirname;
const cbp = fs.readFileSync(path.join(here, 'tests', 'imp4-song.cbp')).toString('base64');
let fail = 0; const ok = (n, c, x) => { console.log((c ? 'OK     ' : 'FEHLER ') + n + (x !== undefined ? '  ' + JSON.stringify(x) : '')); if (!c) fail++; };
async function lauf(b, wer, foto) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push('pageerror ' + e));
  p.on('console', m => { if (m.type() === 'error' && !/abspann-logo/.test(m.location().url || '') && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  p.on('response', r => { if (r.status() >= 400 && !/abspann-logo/.test(r.url())) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
  await p.goto('http://127.0.0.1:' + port + '/' + wer + '/index.html'); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 90000}); await p.waitForTimeout(1500);
  const r = await p.evaluate(async b64 => {
    const W = ms => new Promise(r => setTimeout(r, ms));
    const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    const sum = await xlaFile(u.buffer, 'IMP4 Test.cbp'), c = XLA.cur; if (!sum || !c) return {err: 'nicht geöffnet ' + (c && c.err)};
    for (let k = 0; k < 40 && !c.mlg2; k++) await W(50);
    await xlaBuild(c); await W(200); xlaPaint();
    const rep = () => { const d = document.querySelector('details.xlarep'); return d ? [...d.querySelectorAll(':scope > div')].map(e => e.textContent) : null; };
    const an = rep(); mlg2Tap(c, false); const aus = rep(); mlg2Tap(c, true);
    const d = document.querySelector('details.xlarep'); if (d) { d.open = true; d.scrollIntoView({block: 'start'}); }
    return {an, aus};
  }, cbp);
  await p.waitForTimeout(300);
  if (foto) { fs.mkdirSync(path.join(here, 'fotos'), {recursive: true}); await p.locator('details.xlarep').screenshot({path: path.join(here, 'fotos', 'cmd3-bericht-hoch.png')}).catch(() => {}); }
  const q = await p.evaluate(async () => {
    const W = ms => new Promise(r => setTimeout(r, ms));
    ensureAudio(); await W(300);
    const okA = await xlaApply(); await W(800);
    const strip = o => JSON.parse(JSON.stringify(o, (k, v) => ['ech', 'uid', 'id', 'ct', 'mt', 'saved'].includes(k) ? undefined : v));
    const proj = JSON.stringify(strip(normalizeProject(JSON.parse(JSON.stringify(S)))));
    const names = S.tracks.map(t => t.name), iL = names.indexOf('Lead'), iB = names.indexOf('Bass');
    const ech = S.tracks.map((t, i) => t.ech ? [t.name, t.ech.divL, t.ech.divR, t.ech.fb] : null).filter(Boolean);
    const echo = Object.assign({}, S.fxBus.echo);
    const eng = () => typeof cmd3Reg === 'function' && AU.ctx ? {units: cmd3Reg(AU.ctx).size, leadEigen: !!(AU.tracks[iL] && AU.tracks[iL].cmd3U), bassEigen: !!(AU.tracks[iB] && AU.tracks[iB].cmd3U)} : null;
    const live = eng();
    // Speichern/Laden: Feld bleibt
    const rt = normalizeProject(JSON.parse(JSON.stringify(S)));
    const saveKeep = JSON.stringify(rt.tracks.map(t => t.ech || null)) === JSON.stringify(S.tracks.map(t => t.ech || null));
    // Undo/Redo: ein Schritt; ↶ voriges Projekt ohne eigenes Echo, ↷ Import wieder mit eigenem Echo (aus der gespeicherten Datei)
    const topKind = UNDO.length ? UNDO[UNDO.length - 1].kind : null;
    undo(); for (let k = 0; k < 30 && S.tracks.some(t => t.name === 'Lead'); k++) await W(100); await W(300);
    const afterU = {lead: S.tracks.some(t => t.name === 'Lead'), ech: S.tracks.filter(t => t.ech).length, eigen: [...AU.tracks].filter(A => A && A.cmd3U).length, units: eng() && eng().units};
    redo(); for (let k = 0; k < 30 && !S.tracks.some(t => t.name === 'Lead'); k++) await W(100); await W(300);
    const afterR = {ech: S.tracks.map(t => t.ech ? t.name + ' ' + t.ech.divL : null).filter(Boolean), eng: eng()};
    // Echo hören: nur die Spur rendern, eine kurze Note; nass − trocken = Echo
    const MR = Math.random, keep = JSON.parse(JSON.stringify(S.tracks.map(t => t.clips)));
    const rend = async (ti, dly) => {
      const old = S.tracks[ti].sound.fx.dly; S.tracks[ti].sound.fx.dly = dly;
      for (const t of S.tracks) t.clips = t.clips.map(() => null);
      S.tracks[ti].clips[0] = normClip({len: 2, key: Object.assign({}, S.key), notes: [{t: 0, d: .125, n: 60, v: 1}]}, 'synth', S.key); R.selS = 0; S.song = null;
      SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); Math.random = () => .3125;
      try { VV.cancel = false; const r = await vvRenderAudio({range: {a: 0, b: 2, sel: false}}); return [Float32Array.from(r.ch[0]), Float32Array.from(r.ch[1]), r.sr || 48000]; }
      finally { Math.random = MR; S.tracks[ti].sound.fx.dly = old; }
    };
    const onset = (wet, dry, sr) => { // erster Einsatz des Echos (10-ms-Fenster, 25 % der Spitze) relativ zum trockenen Einsatz
      const win = Math.round(sr / 100), env = a => { const o = []; for (let k = 0; k + win <= a.length; k += win) { let s = 0; for (let j = 0; j < win; j++) s += a[k + j] * a[k + j]; o.push(Math.sqrt(s / win)); } return o; };
      const d = env(dry), e = env(wet.map((x, k) => x - (dry[k] || 0))), md = Math.max(...d), me = Math.max(...e);
      const t0 = d.findIndex(x => x > .25 * md), t1 = e.findIndex(x => x > .25 * me);
      return {ms: (t1 - t0) * 10, peak: Math.round(2000 * Math.log10(me / md)) / 100};
    };
    const out = {};
    for (const [nm, ti] of [['Lead', iL], ['Bass', iB]]) {
      const d = S.tracks[ti].sound.fx.dly, W1 = await rend(ti, d), D1 = await rend(ti, 0);
      out[nm] = {dly: d, links: onset(W1[0], D1[0], W1[2]), rechts: onset(W1[1], D1[1], W1[2])};
    }
    S.tracks.forEach((t, i) => t.clips = keep[i]);
    // (a) Doppelschläge: gehörter Clap-Pegel (echte Engine) gegen die DAW-Summe zweier Schläge (90 + 70)
    const claps = keep[DRUM_T].filter(Boolean).flatMap(c => c.notes).filter(n => n.n === 39);
    const rendD = async notes => { for (const t of S.tracks) t.clips = t.clips.map(() => null);
      S.tracks[DRUM_T].clips[0] = normClip({len: 1, key: Object.assign({}, S.key), notes}, 'drum', S.key); R.selS = 0; S.song = null;
      SYNQUENZER.songFromChain([{scene: 0, bars: 1}]); drumBufs(); Math.random = () => .3125;
      try { VV.cancel = false; const r = await vvRenderAudio({range: {a: 0, b: 1, sel: false}}); return Float32Array.from(r.ch[0]); } finally { Math.random = MR; } };
    const rms = a => { let x = 0; for (const y of a) x += y * y; return Math.sqrt(x / a.length); };
    const im = await rendD(claps.filter(n => n.t === 1).map(n => Object.assign({}, n)));
    const v1 = await rendD([{t: 1, d: .125, n: 39, v: Math.round(90 / 127 * 1000) / 1000}]), v2 = await rendD([{t: 1, d: .125, n: 39, v: Math.round(70 / 127 * 1000) / 1000}]);
    const daw = v1.map((x, k) => x + (v2[k] || 0));
    out.clap = {n: claps.length, abstandDb: Math.round(2000 * Math.log10(rms(im) / rms(daw))) / 100, einzelDb: Math.round(2000 * Math.log10(rms(v1) / rms(daw))) / 100};
    S.tracks.forEach((t, i) => t.clips = keep[i]);
    return {okA, names, ech, echo: {mode: echo.mode, divL: echo.divL, divR: echo.divR, fb: echo.fb}, live, saveKeep, hear: out, topKind, afterU, afterR, proj};
  });
  await ctx.close(); return Object.assign(r, q, {errs});
}
(async () => {
  const b = await chromium.launch(); const A = await lauf(b, BAS, false), B = await lauf(b, NEU, true); await b.close();
  const show = o => JSON.stringify(Object.assign({}, o, {proj: o.proj ? o.proj.length : 0, an: undefined, aus: undefined}));
  function firstDiff(a, b) { let k = 0; while (k < a.length && a[k] === b[k]) k++; return [a.slice(Math.max(0, k - 120), k + 80), b.slice(Math.max(0, k - 120), k + 80)]; }
  console.log('Basis', show(A)); console.log('Neu  ', show(B));
  ok('T1 beide laden + importieren ohne Fehler', !A.err && !B.err && A.okA && B.okA && A.errs.length === 0 && B.errs.length === 0, A.errs.concat(B.errs).slice(0, 4));
  ok('T2 Projekt-Echo wie bisher (1/4. | 1/8. von der ersten Spur mit Delay)', JSON.stringify(A.echo) === JSON.stringify(B.echo), B.echo);
  ok('T3 Neu: Lead bekommt ein eigenes Echo 1/8 | 1/16, Bass (gleich dem Projekt-Echo) keins', JSON.stringify(B.ech) === JSON.stringify([['Lead', '1/8', '1/16', B.ech[0] && B.ech[0][3]]]) && A.ech.length === 0, {basis: A.ech, neu: B.ech});
  ok('T4 Projekt sonst bitgleich zur Basis (ohne Feld ech und ohne Kennungen/Zeiten)', A.proj === B.proj, A.proj === B.proj ? undefined : firstDiff(A.proj, B.proj));
  ok('T5 Engine: Lead-Send geht ins eigene Echo, Bass ins Projekt-Echo, 1 zusätzliches Echo', B.live && B.live.units === 1 && B.live.leadEigen && !B.live.bassEigen, B.live);
  const near = (x, y, tol) => Math.abs(x - y) <= tol;
  ok('T6 Basis: Lead-Echo kommt nach 750 ms (Projekt-Echo 1/4.) statt 250 ms (DAW 1/8)', near(A.hear.Lead.links.ms, 750, 30), A.hear.Lead);
  ok('T7 Neu: Lead-Echo links nach 250 ms (1/8), rechts nach 125 ms (1/16) wie in der DAW', near(B.hear.Lead.links.ms, 250, 30) && near(B.hear.Lead.rechts.ms, 125, 30), B.hear.Lead);
  ok('T8 Bass-Echo unverändert (750 | 375 ms) und gleich laut', near(B.hear.Bass.links.ms, 750, 30) && B.hear.Bass.links.ms === A.hear.Bass.links.ms && B.hear.Bass.rechts.ms === A.hear.Bass.rechts.ms && Math.abs(B.hear.Bass.links.peak - A.hear.Bass.links.peak) < .05, {basis: A.hear.Bass, neu: B.hear.Bass});
  ok('T9 Lead-Echo gleich laut wie vorher (±1 dB, gleicher Send)', Math.abs(B.hear.Lead.links.peak - A.hear.Lead.links.peak) <= 1, {basis: A.hear.Lead.links.peak, neu: B.hear.Lead.links.peak});
  ok('T10 Speichern/Laden behält das eigene Echo', B.saveKeep === true);
  ok('T11 ein ↶-Schritt (xla): voriges Projekt ohne eigenes Echo, Send zurück aufs Projekt-Echo', B.topKind === 'xla' && !B.afterU.lead && B.afterU.ech === 0 && B.afterU.eigen === 0 && B.afterU.units === 0, {top: B.topKind, u: B.afterU});
  ok('T11b ↷ bringt den Import mit eigenem Echo zurück (über die gespeicherte Datei)', JSON.stringify(B.afterR.ech) === JSON.stringify(['Lead 1/8']) && B.afterR.eng && B.afterR.eng.leadEigen && B.afterR.eng.units === 1, B.afterR);
  const sp = (L, n) => (L || []).find(s => s.startsWith(n + ' '));
  ok('T12 Bericht vorher: Lead „eigenes Delay 1/8 → Projekt-Echo 1/4. (eins für alle Spuren)“', /eigenes Delay 1\/8 → Projekt-Echo 1\/4\. \(eins für alle Spuren\)/.test(sp(A.an, 'Lead') || ''), sp(A.an, 'Lead'));
  ok('T13 Bericht nachher: Lead „eigenes Echo 1/8 | 1/16 wie in der DAW“, sonst gleich; Bass unverändert',
    /^Lead · Klang aus der DAW · eigenes Echo 1\/8 \| 1\/16 wie in der DAW · /.test(sp(B.an, 'Lead') || '') && sp(B.an, 'Lead').replace('eigenes Echo 1/8 | 1/16 wie in der DAW', 'X') === sp(A.an, 'Lead').replace('eigenes Delay 1/8 → Projekt-Echo 1/4. (eins für alle Spuren)', 'X') && sp(B.an, 'Bass') === sp(A.an, 'Bass'),
    [sp(B.an, 'Lead'), sp(B.an, 'Bass')]);
  ok('T14 Bericht bei „Werksklänge“ unverändert', JSON.stringify(A.aus) === JSON.stringify(B.aus));
  ok('T16 (a) Doppelschläge: schon in 4.88: ein lauterer Clap je Zeitpunkt, Pegel wie die DAW-Summe (±1 dB, Basis = neu ±0,5 dB Render-Rauschen; ein einzelner Schlag läge ~4 dB darunter)', B.hear.clap.n === 2 && Math.abs(B.hear.clap.abstandDb) <= 1 && Math.abs(A.hear.clap.abstandDb) <= 1 && Math.abs(A.hear.clap.abstandDb - B.hear.clap.abstandDb) <= .5, {basis: A.hear.clap, neu: B.hear.clap});
  ok('T15 Bericht: zusammengelegte Clap-Schläge (a, schon in 4.88) weiter genannt', (B.an || []).some(s => /DRUMS: 8 Schläge gleichzeitig auf demselben Pad → je ein lauterer Schlag/.test(s)));
  console.log(fail ? 'FEHLER: ' + fail : 'ALLE OK'); process.exit(fail ? 1 : 0);
})();
