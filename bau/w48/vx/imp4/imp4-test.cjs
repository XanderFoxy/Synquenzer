// IMP4 Browser-Test (Kern-Test-Datei): Basis gegen neue Fassung, iPhone hochkant 428×926, Touch.
// Aufruf: node imp4-test.cjs <port>   (Server-Wurzel mit basis/index.html und neu/index.html, je version.json)
const {chromium} = require('playwright'), fs = require('fs'), path = require('path');
const port = process.argv[2], here = __dirname, cbp = fs.readFileSync(path.join(here, 'tests', 'imp4-song.cbp')).toString('base64');
let fail = 0; const ok = (n, c, x) => { console.log((c ? 'OK     ' : 'FEHLER ') + n + (x !== undefined ? '  ' + JSON.stringify(x) : '')); if (!c) fail++; };
async function lauf(b, wer) {
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
    return {an, aus, mlg2: c.mlg2 ? {n: c.mlg2.n, on: c.mlg2.on} : null};
  }, cbp);
  await p.waitForTimeout(300);
  if (wer === 'neu') { fs.mkdirSync(path.join(here, 'fotos'), {recursive: true}); await p.locator('details.xlarep').screenshot({path: path.join(here, 'fotos', 'imp4-bericht-hoch.png')}).catch(() => {}); }
  const q = await p.evaluate(async () => {
    const W = ms => new Promise(r => setTimeout(r, ms));
    const okA = await xlaApply(); await W(600);
    const dr = S.tracks[DRUM_T], claps = dr.clips.filter(Boolean).flatMap(c => c.notes).filter(n => n.n === 39);
    const echo = Object.assign({}, S.fxBus.echo), dly = S.tracks.filter(t => t.kind === 'synth' && t.sound && t.sound.fx && t.sound.fx.dly > 0).map(t => [t.name, t.sound.fx.dly]);
    // Gehörter Clap-Pegel mit der echten Engine (Offline-Render, Taktgeber wie beim Abspielen): nur die Clap-Noten des Imports
    const MR = Math.random;
    const rend = async notes => { for (const t of S.tracks) t.clips = t.clips.map(() => null);
      S.tracks[DRUM_T].clips[0] = normClip({len: 1, key: Object.assign({}, S.key), notes}, 'drum', S.key); R.selS = 0; S.song = null;
      SYNQUENZER.songFromChain([{scene: 0, bars: 1}]); ensureAudio(); drumBufs(); Math.random = () => .3125;
      try { VV.cancel = false; const r = await vvRenderAudio({range: {a: 0, b: 1, sel: false}}); return Float32Array.from(r.ch[0]); } finally { Math.random = MR; } };
    const rms = a => { let s = 0; for (const x of a) s += x * x; return Math.sqrt(s / a.length); };
    const im = await rend(claps.filter(n => n.t === 1).map(n => Object.assign({}, n)));   // die Schläge auf Zählzeit 2 (ein Zeitpunkt)
    const v1 = await rend([{t: 1, d: .125, n: 39, v: Math.round(90 / 127 * 1000) / 1000}]), v2 = await rend([{t: 1, d: .125, n: 39, v: Math.round(70 / 127 * 1000) / 1000}]);
    const daw = v1.map((x, k) => x + (v2[k] || 0));   // DAW: zwei gleiche Klänge übereinander
    const db = x => Math.round(2000 * Math.log10(x)) / 100;
    return {okA, claps: claps.map(n => [n.t, n.v]), echo: {mode: echo.mode, divL: echo.divL, divR: echo.divR, fb: echo.fb}, dly,
      imDb: db(rms(im)), dawDb: db(rms(daw)), einzelDb: db(rms(v1)), abstand: db(rms(im) / rms(daw)),
      kurve: await (async () => { const o = []; for (const v of [.4, .551, .6, .709, .8, .898, 1]) o.push([v, db(rms(await rend([{t: 1, d: .125, n: 39, v}])))]); return o; })(),
      kit: S.tracks[DRUM_T].sound && S.tracks[DRUM_T].sound.name};
  });
  await ctx.close(); return Object.assign(r, q, {errs});
}
(async () => {
  const b = await chromium.launch(); const A = await lauf(b, 'basis'), B = await lauf(b, 'neu'); await b.close();
  console.log('Basis', JSON.stringify(A)); console.log('Neu  ', JSON.stringify(B));
  ok('T1 beide laden + importieren ohne Fehler', !A.err && !B.err && A.errs.length === 0 && B.errs.length === 0, A.errs.concat(B.errs).slice(0, 4));
  ok('T2 Basis: Clap im Drum-Clip doppelt (zwei Schläge je Zeitpunkt), gehört wird nur einer: Abstand zur DAW', A.claps.length === 4, A.abstand + ' dB');
  ok('T3 Neu: ein Clap je Zeitpunkt, v = √(v1²+v2²)', B.claps.length === 2 && B.claps.every(x => x[1] === 0.898), B.claps);
  ok('T4 Neu: Clap-Pegel mit der echten Engine wie in der DAW (±1 dB)', Math.abs(B.abstand) <= 1, B.abstand + ' dB (Basis ' + A.abstand + ' dB)');
  const sp = (L, n) => (L || []).find(s => s.startsWith(n + ' '));
  ok('T5 Basis: Bericht beschreibt den XLA-Klang (Ausgangslage)', /^Bass · angenähert/.test(sp(A.an, 'Bass') || ''), sp(A.an, 'Bass'));
  ok('T6 Neu (Klänge aus der DAW an): Bericht beschreibt den übernommenen Klang + Echo', /^Bass · Klang aus der DAW · Echo 1\/4\. wie in der DAW · \d+ übernommen/.test(sp(B.an, 'Bass') || '') &&
    /^Lead · Klang aus der DAW · eigenes Delay 1\/8 → Projekt-Echo 1\/4\. \(eins für alle Spuren\)/.test(sp(B.an, 'Lead') || '') && !(B.an || []).some(s => /Ein Echo für alle Spuren: /.test(s)), [sp(B.an, 'Bass'), sp(B.an, 'Lead')]);
  ok('T7 Neu (Werksklänge): Bericht wie bisher (bis auf die neue Drum-Zeile)', JSON.stringify((B.aus || []).map(s => s.replace(/^Zusammengelegt: (.*?) · DRUMS: .*$/, 'Zusammengelegt: $1'))) === JSON.stringify(A.aus), {neu: B.aus, basis: A.aus});
  ok('T8 Bericht nennt die zusammengelegten Clap-Schläge', (B.an || []).some(s => /DRUMS: 8 Schläge gleichzeitig auf demselben Pad → je ein lauterer Schlag/.test(s)));
  ok('T9 Echo/Anteile nach dem Import unverändert gegenüber der Basis', JSON.stringify(A.echo) === JSON.stringify(B.echo) && JSON.stringify(A.dly) === JSON.stringify(B.dly), {echo: B.echo, dly: B.dly});
  console.log(fail ? 'FEHLER: ' + fail : 'ALLE OK'); process.exit(fail ? 1 : 0);
})();
