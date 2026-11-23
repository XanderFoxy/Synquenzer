// Gemeinsame Hilfen für den VTRIM-Kern-Test
const {chromium} = require('/opt/node-tools/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(b, port, wer, w, h) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console.error ' + m.text()); });
  p.on('response', r => { if (r.status() >= 400) errs.push('http ' + r.status() + ' ' + r.url()); });
  await p.goto('http://127.0.0.1:' + port + '/' + wer + '/index.html');
  await p.waitForFunction(() => window.SYNQUENZER && typeof S !== 'undefined' && S.tracks && typeof vl3Mount === 'function', null, {timeout: 90000});
  await sleep(1500);
  const cdp = await ctx.newCDPSession(p);
  const pt = (x, y) => [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}];
  const T = {
    down: (x, y) => cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: pt(x, y)}),
    move: (x, y) => cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: pt(x, y)}),
    up: () => cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}),
    async tap(q) { await this.down(q.x, q.y); await sleep(60); await this.up(); await sleep(300); },
    async drag(x0, y0, x1, steps) { await this.down(x0, y0); for (let k = 1; k <= steps; k++) { await this.move(x0 + (x1 - x0) * k / steps, y0); await sleep(16); } await this.up(); await sleep(300); },
  };
  return {ctx, p, errs, T};
}
// Take: 1 Takt Stille davor, Loop 2 Takte = Phrase (Sinus 220 Hz) + 2 s Nachlauf (leiser Ton 330 Hz + Rauschen), dahinter 0,3 s Stille
async function setup(p) {
  return p.evaluate(() => {
    setBpm(120);
    const sp = spb(), bar = g10aBpb() * sp, sr = 48000, ia = Math.round(bar * sr), Ls = 2 * bar, nl = 2, n = ia + Math.round(Ls * sr) + Math.round(.3 * sr);
    const pcm = new Int16Array(n), fi = Math.round(.005 * sr), pe = ia + Math.round((Ls - nl) * sr), oe = ia + Math.round(Ls * sr);
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - .5);
    for (let i = ia; i < pe; i++) { let g = .5; if (i - ia < fi) g *= (i - ia) / fi; if (pe - i < fi) g *= (pe - i) / fi; pcm[i] = Math.round(g * 32767 * Math.sin(2 * Math.PI * 220 * (i - ia) / sr)); }
    for (let i = pe; i < oe; i++) { let g = .18; if (i - pe < fi) g *= (i - pe) / fi; pcm[i] = Math.round(32767 * (g * Math.sin(2 * Math.PI * 330 * (i - pe) / sr) + .02 * rnd())); }
    for (let i = 0; i < NT(); i++) S.tracks[i].clips = S.tracks[i].clips.map(() => null);
    const r = tkAddPcmTake(pcm, sr, 'import'), id = r.id, st = tkEnsureTrack([]);
    for (let i = 0; i < NT(); i++) if (i !== st) S.tracks[i].clips = S.tracks[i].clips.map(() => null);
    const a = tkNormAudio({take: id, in: tkR6(ia / sr), out: tkR6(ia / sr + Ls), at: 0});
    S.tracks[st].clips[0] = {len: 2, key: S.key, notes: [], audio: a};
    clipChanged(st, 0); UI.dirty.all = UI.dirty.grid = true;
    return {st, id, sp, bar, sr, in: a.in, out: a.out, nl, bpm: S.bpm};
  });
}
// Mixdown wie Export (vvRenderAudio über den Song aus Szene 1, 2 Takte)
async function render(p) {
  return p.evaluate(async () => {
    if (!S.song || !S.song.bars) SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); ensureAudio();
    for (let k = 0; k < 200 && !TK.buf.size; k++) await new Promise(r => setTimeout(r, 25));
    const MR = Math.random; Math.random = () => .3125;
    try { VV.cancel = false; const r = await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}}); window.__R = [Float32Array.from(r.ch[0]), Float32Array.from(r.ch[1])]; return {n: r.n, sr: r.sr, lead: r.lead || 0}; }
    finally { Math.random = MR; }
  });
}
module.exports = {chromium, sleep, open, setup, render};
