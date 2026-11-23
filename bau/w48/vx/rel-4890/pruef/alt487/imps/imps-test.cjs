// IMPS Kern-Test: dieselbe Datei mit 0 / 137 ms / 1,3 s digitaler Stille vorn über den echten Datei-Wähler importieren
// (Basis 4.86.0 gegen neu). Gemessen: Analyse (Tempo, „1“), Auftakt k, Teile (Takte), Take „Als Gesang“ (Proben ab der
// ersten hörbaren Probe), Takt-Lage des ersten Einsatzes im Song, Gesang-Stücke (Gesang-Editor) in Song-Zeit.
// Aufruf: node imps-test.cjs <port>   (Server-Wurzel srv/ mit basis/ und neu/, je version.json). iPhone hochkant 428×926, Touch.
const {chromium} = require('playwright'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const port = process.argv[2], here = __dirname, SR = +(process.env.IMPS_SR || 48000);
let fail = 0; const ok = (n, c, x) => { console.log((c ? 'OK     ' : 'FEHLER ') + n + (x !== undefined ? '  ' + JSON.stringify(x) : '')); if (!c) fail++; };

// ---- Testdatei (synthetisch): 100 BPM 4/4, Auftakt 2 Schläge (Hats + Gesang), erste „1“ bei 1,2 s, 16 Takte, leises Grundrauschen ab Probe 0
function song() {
  let seed = 12345; const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
  const sp = 0.6, T1 = 1.2, bars = 16, dur = T1 + bars * 4 * sp + 1.5, n = Math.round(dur * SR), x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = rnd() * 0.0006;
  const add = (t0, len, f) => { const a = Math.round(t0 * SR), b = Math.min(n, a + Math.round(len * SR)); for (let i = a; i < b; i++) x[i] += f((i - a) / SR); };
  const kick = t => add(t, .25, u => Math.sin(2 * Math.PI * (50 * u + 90 * (1 - Math.exp(-u * 30)) / 30)) * Math.exp(-u * 14) * .7);
  const snare = t => add(t, .18, u => (rnd() * .5 + Math.sin(2 * Math.PI * 190 * u) * .3) * Math.exp(-u * 22) * .6);
  const hat = t => add(t, .05, u => rnd() * Math.exp(-u * 90) * .18);
  const bass = (t, f, len) => add(t, len, u => (Math.sin(2 * Math.PI * f * u) + .3 * Math.sin(4 * Math.PI * f * u)) * Math.min(1, u * 80) * Math.exp(-u * 1.2) * .35);
  const chord = (t, fs, len) => add(t, len, u => fs.reduce((s, f) => s + Math.sin(2 * Math.PI * f * u) + .25 * Math.sin(6 * Math.PI * f * u), 0) * Math.min(1, u * 40) * Math.exp(-u * .8) * .06);
  const voc = (t, f0, len) => { add(t - .015, .015, u => rnd() * .12);   // Konsonant
    add(t, len, u => { const f = f0 * Math.pow(2, .02 * Math.sin(2 * Math.PI * 5.5 * u)), ph = 2 * Math.PI * f * u; let s = 0;
      for (let k = 1; k <= 10; k++) s += Math.sin(k * ph) / k * (k === 3 || k === 4 ? 1.8 : 1);
      return s * Math.min(1, u / .02) * Math.min(1, (len - u) / .06) * .16; }); };
  const st = m => 220 * Math.pow(2, m / 12);
  for (const t of [0, .3, .6, .9]) hat(t);
  voc(.3, st(3), .25); voc(.9, st(5), .25);
  const prog = [[55, [220, 277.2, 329.6]], [43.65, [174.6, 220, 261.6]], [65.4, [261.6, 329.6, 392]], [49, [196, 246.9, 293.7]]];
  const prog2 = [[73.4, [293.7, 349.2, 440]], [61.7, [246.9, 311.1, 370]], [82.4, [329.6, 415.3, 493.9]], [55, [220, 277.2, 329.6]]];
  const mel = [[0, 7], [1, 5], [2, 3], [3, 5]], mel2 = [[0, 10], [.5, 12], [1.5, 10], [2, 8], [3, 7]];
  for (let b = 0; b < bars; b++) {
    const t = T1 + b * 4 * sp, P = (b >> 2) % 2 ? prog2 : prog, [bf, ch] = P[b % 4];
    kick(t); kick(t + 2 * sp); snare(t + sp); snare(t + 3 * sp); for (let e = 0; e < 8; e++) hat(t + e * sp / 2);
    bass(t, bf, 4 * sp); chord(t, ch, 4 * sp);
    for (const [bt, m] of ((b >> 2) % 2 ? mel2 : mel)) voc(t + bt * sp, st(m + (b % 4 === 3 ? -2 : 0)), .38);
  }
  return x;
}
function wav(x, pad) {
  const n = x.length + pad, buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12); buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < x.length; i++) buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767))), 44 + (pad + i) * 2);
  return buf;
}
const PADS = [0, 137, 1300], X = song(); fs.mkdirSync(path.join(here, 'tests'), {recursive: true});
const files = PADS.map(ms => { const f = path.join(here, 'tests', 'imps-stille-' + ms + 'ms-' + SR + '.wav'); fs.writeFileSync(f, wav(X, Math.round(ms * SR / 1000))); return f; });

async function lauf(b, wer, file) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push('pageerror ' + e));
  p.on('console', m => { if (m.type() === 'error' && !/abspann-logo/.test(m.location().url || '') && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  p.on('response', r => { if (r.status() >= 400 && !/abspann-logo/.test(r.url())) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
  await p.goto('http://127.0.0.1:' + port + '/' + wer + '/index.html'); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 90000}); await p.waitForTimeout(1200);
  const [fc] = await Promise.all([p.waitForEvent('filechooser', {timeout: 20000}), p.evaluate(() => imp1Pick())]);
  await fc.setFiles(file);
  await p.waitForFunction(() => IMP1.cur && (IMP1.cur.st === 'fertig' || IMP1.cur.st === 'fehler'), null, {timeout: 120000});
  const r = await p.evaluate(async () => {
    const W = ms => new Promise(r => setTimeout(r, ms)), c = IMP1.cur;
    if (c.st !== 'fertig') return {err: c.err};
    const G = imp1Geo(c), parts = imp1Parts(c).map(q => [q.name, q.A, q.B]);
    const res = imp1Place('vox'); if (!res) return {err: 'vox nicht platziert'};
    const id = res.take, m = S.takes[id], v = (S.song.vox || []).find(o => o.take === id);
    let buf = null; for (let k = 0; k < 100 && !(buf = tkBuffer(id)); k++) await W(50);
    const y = buf.getChannelData(0), sr = buf.sampleRate, barSec = 4 * spb();
    let i0 = 0; while (i0 < y.length && y[i0] === 0) i0++;
    let i1 = 0; while (i1 < y.length && Math.abs(y[i1]) < .05) i1++;
    const songT = s => v.bar * barSec + s - v.in;
    // Gesang-Editor: Stück-Wahl
    let an = null; try { an = await __vx1.analyse(id); } catch (e) { an = {err: String(e)}; }
    const L = __vx1.list(id) || [], mk = __vx1.marks(id);
    const h = Array.from(y.subarray(i0, Math.min(y.length, i0 + sr * 30)), q => Math.round(q * 32767));
    return {bpm: c.bpm, ts: c.ts, t1: c.t1, k: G.k, org: G.org, nb: G.nb, parts, bar: v.bar, in: v.in, takeLen: y.length, nullVorn: i0,
      einsatzTakt: songT(i1 / sr) / barSec, inhaltTakt: songT(i0 / sr) / barSec, take: h, imps: window.__imps ? __imps.last() : null,
      stuecke: L.map(q => +(songT(q.t != null ? q.t : q.a != null ? q.a : q.t0)).toFixed(6)), stueckeN: L.length, vx: an && an.n, mk: mk ? mk.length : null, vxr2: window.__vxr2 && __vxr2.last()};
  });
  await ctx.close();
  if (r.take) { r.takeMd5 = crypto.createHash('md5').update(JSON.stringify(r.take)).digest('hex'); delete r.take; }
  return Object.assign(r, {errs});
}
(async () => {
  const b = await chromium.launch(), R = {};
  for (const wer of ['basis', 'neu']) { R[wer] = []; for (const f of files) R[wer].push(await lauf(b, wer, f)); }
  await b.close();
  for (const wer of ['basis', 'neu']) R[wer].forEach((r, i) => console.log(wer.padEnd(5), String(PADS[i]).padStart(4) + ' ms', JSON.stringify(Object.assign({}, r, {stuecke: (r.stuecke || []).slice(0, 6)}))));
  const sum = A => ({einsatzTakt: A.map(r => r.einsatzTakt != null ? +r.einsatzTakt.toFixed(5) : null), k: A.map(r => r.k), t1: A.map(r => r.t1), bpm: A.map(r => r.bpm),
    teile: A.map(r => JSON.stringify(r.parts)), takeGleich: A.map(r => r.takeMd5 === A[0].takeMd5), stuecke: A.map(r => r.stueckeN),
    stueckeGleich: A.map(r => JSON.stringify(r.stuecke) === JSON.stringify(A[0].stuecke)),
    stueckeMaxMs: A.map(r => r.stuecke && A[0].stuecke && r.stuecke.length === A[0].stuecke.length ? +(Math.max(0, ...r.stuecke.map((t, k) => Math.abs(t - A[0].stuecke[k]))) * 1000).toFixed(2) : null)});
  const SA = sum(R.basis), SN = sum(R.neu);
  console.log('Basis', JSON.stringify(SA)); console.log('Neu  ', JSON.stringify(SN));
  const all = R.basis.concat(R.neu);
  ok('T1 alle 6 Importe ohne Seitenfehler/console.error, Analyse fertig', all.every(r => !r.err && r.errs.length === 0), all.map(r => r.err || r.errs.slice(0, 2)).filter(x => x && x.length));
  const same = a => a.every(v => JSON.stringify(v) === JSON.stringify(a[0]));
  ok('T2 neu: Tempo und „1“ (relativ zur ersten hörbaren Probe) gleich', same(SN.bpm) && same(R.neu.map((r, i) => Math.round((r.t1 - (r.imps && r.imps.zs || 0)) * 48000))), {bpm: SN.bpm, t1: SN.t1});
  ok('T3 neu: Auftakt-Takte k und Teile (Takte) gleich', same(SN.k) && same(SN.teile), {k: SN.k, teile: SN.teile[0]});
  ok('T4 neu: Takt-Lage des ersten Einsatzes gleich (probengenau)', same(R.neu.map(r => Math.round(r.einsatzTakt * 4 * 60 / R.neu[0].bpm * SR))), SN.einsatzTakt);
  ok('T5 neu: Gesang-Take probengleich (ab erster hörbarer Probe), gleiche Stille davor', SN.takeGleich.every(Boolean) && same(R.neu.map(r => r.nullVorn)), {nullVorn: R.neu.map(r => r.nullVorn)});
  ok('T6 neu: gleiche Gesang-Stücke (Zahl und Lage in Song-Zeit)', SN.stueckeGleich.every(Boolean) && SN.stuecke[0] > 0, {n: SN.stuecke, maxMs: SN.stueckeMaxMs});
  ok('T7 ohne Stille vorn: neu = Basis (Analyse, Teile, Take, Stücke)', JSON.stringify([R.neu[0].t1, R.neu[0].k, R.neu[0].parts, R.neu[0].takeMd5, R.neu[0].stuecke]) === JSON.stringify([R.basis[0].t1, R.basis[0].k, R.basis[0].parts, R.basis[0].takeMd5, R.basis[0].stuecke]));
  console.log('INFO Basis vorher: Takt-Lage ' + JSON.stringify(SA.einsatzTakt) + ' k ' + JSON.stringify(SA.k) + ' Take gleich ' + JSON.stringify(SA.takeGleich) + ' Stücke ' + JSON.stringify(SA.stuecke) + ' gleich ' + JSON.stringify(SA.stueckeGleich) + ' max ms ' + JSON.stringify(SA.stueckeMaxMs));
  fs.writeFileSync(path.join(here, 'imps-test-' + SR + '.json'), JSON.stringify({PADS, basis: R.basis, neu: R.neu, SA, SN}, null, 1));
  console.log(fail ? 'FEHLER ' + fail : 'ALLE OK');
})().catch(e => { console.error(e); process.exit(1); });
