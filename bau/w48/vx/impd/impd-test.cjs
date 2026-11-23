// IMPD Kern-Test: Projekt hat Audio (120 BPM, als Spur importiert), dann Datei mit 112 BPM importieren (fest / Tempo-Lauf)
// -> Einsaetze im gedehnten Audio gegen das 120er-Raster (ms), Tonhoehe (Hz). Dazu Bitgleich-Faelle (Basis 4.87.0 gegen neu):
// leeres Projekt + Tempo-Lauf-Datei, und Projekt mit Audio + vom Nutzer gewaehltes Tempo. node impd-test.cjs <port>
const {chromium} = require('playwright'), fs = require('fs'), path = require('path');
const port = process.argv[2], here = __dirname, SR = 48000;
let fail = 0; const ok = (n, c, x) => { console.log((c ? 'OK     ' : 'FEHLER ') + n + (x !== undefined ? '  ' + JSON.stringify(x) : '')); if (!c) fail++; };
function mk(beats, opt) {
  let seed = 777; const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
  const dur = beats[beats.length - 1] + 1.2, n = Math.round(dur * SR), x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = rnd() * 0.0005;
  const add = (t0, len, f) => { const a = Math.round(t0 * SR), b = Math.min(n, a + Math.round(len * SR)); for (let i = a; i < b; i++) x[i] += f((i - a) / SR); };
  beats.forEach((t, k) => {
    const acc = k % 4 === 0;
    if (opt.kick) add(t, .22, u => Math.sin(2 * Math.PI * (50 * u + 90 * (1 - Math.exp(-u * 30)) / 30)) * Math.exp(-u * 14) * (acc ? .8 : .55));
    if (opt.tone) add(t, .3, u => Math.sin(2 * Math.PI * 440 * u) * Math.min(1, u / .001) * Math.exp(-u * 12) * (acc ? .7 : .5));
    const nx = beats[k + 1] != null ? beats[k + 1] : t + (t - beats[k - 1]);
    add((t + nx) / 2, .03, u => rnd() * Math.exp(-u * 120) * .08);
    if (acc) add(t, .05, u => rnd() * Math.exp(-u * 60) * .12);
  });
  return x;
}
function wav(x) {
  const n = x.length, buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12); buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767))), 44 + i * 2);
  return buf;
}
const grid = (bpm, nb, t0) => Array.from({length: nb}, (_, k) => t0 + k * 60 / bpm);
function lauf112(nb, t0) { // Tempo-Lauf: 112 BPM +-2,5 % (Periode 12 s) + +-2 ms Zittern
  let seed = 99; const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
  const out = []; let t = t0;
  for (let k = 0; k < nb; k++) { out.push(t + rnd() * .002); t += 60 / (112 * (1 + .025 * Math.sin(2 * Math.PI * t / 12))); }
  return out;
}
fs.mkdirSync(path.join(here, 'tests'), {recursive: true});
const FD = path.join(here, 'tests', 'impd-d-111_5.wav'), FA = path.join(here, 'tests', 'impd-a-120.wav'), FB = path.join(here, 'tests', 'impd-b-112.wav'), FC = path.join(here, 'tests', 'impd-c-112-lauf.wav');
fs.writeFileSync(FA, wav(mk(grid(120, 32, .5), {kick: true})));
fs.writeFileSync(FB, wav(mk(grid(112, 48, .5), {tone: true, kick: true})));
fs.writeFileSync(FC, wav(mk(lauf112(48, .5), {tone: true, kick: true})));
fs.writeFileSync(FD, wav(mk(grid(111.5, 48, .5), {tone: true, kick: true})));

async function seite(b, wer) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push('pageerror ' + e));
  p.on('console', m => { if (m.type() === 'error' && !/abspann-logo/.test(m.location().url || '') && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  p.on('response', r => { if (r.status() >= 400 && !/abspann-logo/.test(r.url())) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
  await p.goto('http://127.0.0.1:' + port + '/' + wer + '/index.html'); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 90000}); await p.waitForTimeout(1200);
  return {ctx, p, errs};
}
async function imp(p, file, kind, wahl) {
  await p.evaluate(() => { window.__impdAlt = IMP1.cur || null; });
  const [fc] = await Promise.all([p.waitForEvent('filechooser', {timeout: 20000}), p.evaluate(() => imp1Pick())]);
  await fc.setFiles(file);
  await p.waitForFunction(() => IMP1.cur && IMP1.cur !== window.__impdAlt && (IMP1.cur.st === 'fertig' || IMP1.cur.st === 'fehler'), null, {timeout: 120000});
  return p.evaluate(async ({kind, wahl}) => {
    const W = ms => new Promise(r => setTimeout(r, ms)), c = IMP1.cur;
    if (c.st !== 'fertig') return {err: c.err};
    if (wahl) imp1Regrid(c, c.bpm + wahl);
    let res = imp1Place(kind);
    for (let i = 0; !res && i < 1200; i++) { await W(100); if (c.sx && c.sx.run) continue; if (c.made && !/angepasst/.test(c.made)) break; res = imp1Place(kind); }
    res = res || IMP1.lastPlace;
    const tid = c.take || (c.sx && c.sx.take); let buf = null; for (let k = 0; k < 100 && !(buf = tkBuffer(tid)); k++) await W(50);
    let h = 2166136261; if (buf) { const y = buf.getChannelData(0); for (let i = 0; i < y.length; i++) { h ^= (Math.round(y[i] * 32767) & 0xffff); h = Math.imul(h, 16777619) >>> 0; } }
    const sx = c.sx && c.sx.pcm, k = sx ? sx.length / c.x.length : 1;
    const on = (y, sc, sr) => { const o = []; let last = -1e9; for (let i = 0; i < y.length; i++) if (Math.abs(y[i]) * sc > .2) { if (i - last > .15 * sr) o.push(i); last = i; } return o; };
    const pitch = (y, sc, sr, ons) => { const f = ons.map(i => { let z = 0; const a = i + Math.round(.02 * sr), b = i + Math.round(.12 * sr); for (let j = a + 2; j < b && j < y.length; j++) if ((y[j] - y[j - 1] >= 0) !== (y[j - 1] - y[j - 2] >= 0)) z++; return z / 2 / .1; }).sort((p, q) => p - q); return f.length ? f[f.length >> 1] : null; };
    const dev = (ons, sr, t1, st) => ons.map(i => { let d = ((i / sr - t1) % st + st) % st; if (d > st / 2) d -= st; return d * 1000; });
    const st = s => { const a = s.map(Math.abs); return a.length ? {n: a.length, max: +Math.max(...a).toFixed(2), mittel: +(a.reduce((p, q) => p + q, 0) / a.length).toFixed(2)} : null; };
    const R = {bpm: c.bpm, rbpm: c.r.bpm, t1: c.t1, projekt: S.bpm, frage: c.r.frage, stabil: c.r.stabil, gedehnt: !!sx, q: sx ? +(c.bpm / S.bpm).toFixed(5) : 1, hash: h, takeLen: buf && buf.length, placed: !!res, impd: window.__impd ? __impd.last() : null, nx1: window.__nx1 ? __nx1.st().imp : null};
    const oi = on(c.x, 1, c.sr); R.ein = st(dev(oi, c.sr, c.t1, 60 / c.bpm)); R.hzEin = pitch(c.x, 1, c.sr, oi);
    if (sx) { const oo = on(sx, 1 / 32768, c.sr); R.aus = st(dev(oo, c.sr, c.t1 * k, 60 / S.bpm)); R.hzAus = pitch(sx, 1 / 32768, c.sr, oo); R.ausListe = dev(oo, c.sr, c.t1 * k, 60 / S.bpm).map(v => +v.toFixed(1)); }
    return R;
  }, {kind, wahl});
}
(async () => {
  const b = await chromium.launch(), R = {};
  for (const wer of ['basis', 'neu']) {
    R[wer] = {};
    for (const [fall, pre, file, wahl] of [['B-fest', true, FB, 0], ['C-lauf', true, FC, 0], ['C-leer', false, FC, 0], ['D-leer', false, FD, 0], ['B-wahl', true, FB, 1]]) {
      const {ctx, p, errs} = await seite(b, wer); const t0 = Date.now();
      let a = null; if (pre) a = await imp(p, FA, 'track');
      const r = await imp(p, file, 'track', wahl);
      await p.waitForTimeout(500); await ctx.close();
      R[wer][fall] = Object.assign(r, {vorA: a && {bpm: a.bpm, projekt: a.projekt}, errs, sek: Math.round((Date.now() - t0) / 1000)});
      const z = Object.assign({}, R[wer][fall]); delete z.ausListe;
      console.log(wer.padEnd(5), fall.padEnd(7), JSON.stringify(z));
    }
  }
  await b.close();
  const B = R.basis, N = R.neu, all = Object.values(B).concat(Object.values(N));
  ok('T1 alle Faelle ohne Seitenfehler/console.error, platziert', all.every(r => !r.err && !r.errs.length && r.placed), all.map(r => r.err || r.errs.slice(0, 2)));
  ok('T2 Projekt hat Audio: 120 BPM, Datei gedehnt (beide Fassungen)', ['B-fest', 'C-lauf'].every(f => B[f].projekt === 120 && N[f].projekt === 120 && B[f].gedehnt && N[f].gedehnt && B[f].vorA.projekt === 120));
  for (const f of ['B-fest', 'C-lauf']) {
    ok('T3 ' + f + ': Einsaetze auf dem 120er-Raster (neu max <= 3 ms, nicht schlechter als Basis)', N[f].aus && N[f].aus.max <= 3 && N[f].aus.max <= B[f].aus.max + .5 && N[f].aus.n === N[f].ein.n, {basis: B[f].aus, neu: N[f].aus, eingang: N[f].ein});
    ok('T4 ' + f + ': Tonhoehe gleich (440 Hz, +-3 Hz)', Math.abs(N[f].hzAus - 440) <= 3 && Math.abs(N[f].hzEin - 440) <= 3, {ein: N[f].hzEin, basis: B[f].hzAus, neu: N[f].hzAus});
  }
  ok('T5 neu: Tempo-Anker benutzt (IMPD aktiv)', N['C-lauf'].impd && N['C-lauf'].impd.anker > 20, N['C-lauf'].impd);
  ok('T6 leeres Projekt: neu = Basis bitgleich (Take)', N['C-leer'].hash === B['C-leer'].hash && N['C-leer'].takeLen === B['C-leer'].takeLen && N['C-leer'].takeLen > 0, {basis: B['C-leer'].hash, neu: N['C-leer'].hash, gedehnt: N['C-leer'].gedehnt, impd: N['C-leer'].impd});
  ok('T6b leeres Projekt, Datei 111,5 BPM (wird auf 112 gedehnt): neu = Basis bitgleich (Take)', N['D-leer'].hash === B['D-leer'].hash && N['D-leer'].takeLen > 0 && N['D-leer'].gedehnt && N['D-leer'].impd && N['D-leer'].impd.aus === true, {basis: B['D-leer'].hash, neu: N['D-leer'].hash, bpm: N['D-leer'].bpm, gedehnt: N['D-leer'].gedehnt});
  ok('T7 Nutzer waehlt Tempo selbst: neu = Basis bitgleich (Take)', N['B-wahl'].hash === B['B-wahl'].hash && N['B-wahl'].takeLen > 0 && N['B-wahl'].gedehnt, {basis: B['B-wahl'].hash, neu: N['B-wahl'].hash, bpm: N['B-wahl'].bpm});
  fs.writeFileSync(path.join(here, 'impd-test.json'), JSON.stringify(R, null, 1));
  console.log(fail ? 'FEHLER ' + fail : 'ALLE OK');
})().catch(e => { console.error(e); process.exit(1); });
