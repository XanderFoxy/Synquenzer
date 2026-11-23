// Gemeinsame Hilfen für den VTRIM-Kern-Test (Fassung 2: gesangsähnlicher Take, stabile Renders)
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
// Take: 1 Takt Stille davor, Loop 2 Takte = 4 gesungene Silben (Obertöne, Vibrato) + 2 s Nachlauf (Atem/Hall-Rest),
// optional post s Nachlauf HINTER dem Loop-Ende (take.post), dahinter 0,3 s Stille
async function setup(p, o) {
  return p.evaluate(o => {
    setBpm(120);
    const sp = spb(), bar = g10aBpb() * sp, sr = 48000, ia = Math.round(bar * sr), Ls = 2 * bar, nl = 2, post = o && o.post || 0;
    const n = ia + Math.round((Ls + post) * sr) + Math.round(.3 * sr);
    const y = new Float32Array(n), pe = ia + Math.round((Ls - nl) * sr), oe = ia + Math.round((Ls + post) * sr);
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - .5);
    const F = [261.63, 293.66, 329.63, 392.0];
    for (let k = 0; k < 4; k++) {
      const s0 = ia + Math.round(k * .5 * sr), N = Math.round(.42 * sr); let ph = 0;
      for (let j = 0; j < N; j++) {
        const t = j / sr, vib = t > .15 ? Math.sin(2 * Math.PI * 5.5 * t) * .012 : 0, f = F[k] * (1 + vib); ph += 2 * Math.PI * f / sr;
        let v = 0; for (let h = 1; h <= 8; h++) v += Math.sin(h * ph) / h * (h === 3 || h === 4 ? 1.6 : 1);
        const env = Math.min(1, t / .015) * Math.min(1, (N - j) / sr / .04);
        y[s0 + j] += .22 * env * v;
      }
    }
    // Nachlauf: leiser Atem (Rauschen, geglättet) + ausklingendes Summen, bis zum Loop-Ende (und ggf. darüber hinaus)
    let lp = 0; const N2 = oe - pe;
    for (let i = pe; i < oe; i++) { const t = (i - pe) / sr; lp += .08 * (rnd() - lp); const g = Math.min(1, t / .02); y[i] += g * (.5 * lp + .06 * Math.exp(-t / .8) * Math.sin(2 * Math.PI * 196 * t)); }
    for (let i = oe - Math.round(.004 * sr); i < oe; i++) y[i] *= (oe - i) / (.004 * sr);
    const pcm = new Int16Array(n); for (let i = 0; i < n; i++) pcm[i] = Math.max(-32767, Math.min(32767, Math.round(y[i] * 32767)));
    for (let i = 0; i < NT(); i++) S.tracks[i].clips = S.tracks[i].clips.map(() => null);
    const r = tkAddPcmTake(pcm, sr, 'import'), id = r.id, st = tkEnsureTrack([]);
    for (let i = 0; i < NT(); i++) if (i !== st) S.tracks[i].clips = S.tracks[i].clips.map(() => null);
    const a = tkNormAudio({take: id, in: tkR6(ia / sr), out: tkR6(ia / sr + Ls), at: 0});
    if (post) S.takes[id].post = {out: a.out, sec: post};
    S.tracks[st].clips[0] = {len: 2, key: S.key, notes: [], audio: a};
    clipChanged(st, 0); UI.dirty.all = UI.dirty.grid = true;
    return {st, id, sp, bar, sr, in: a.in, out: a.out, nl, post, bpm: S.bpm};
  }, o || {});
}
// Mixdown wie Export (vvRenderAudio über den Song aus Szene 1, 2 Takte); stabil = so oft, bis zwei Renders hintereinander bitgleich sind
async function render(p, stable) {
  return p.evaluate(async stable => {
    if (!S.song || !S.song.bars) SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); ensureAudio();
    for (let k = 0; k < 200 && !TK.buf.size; k++) await new Promise(r => setTimeout(r, 25));
    const H = y => { const u = new Uint32Array(y.buffer, y.byteOffset, y.length); let h = 2166136261; for (let k = 0; k < u.length; k++) { h ^= u[k]; h = Math.imul(h, 16777619) >>> 0; } return h.toString(16) + ':' + y.length; };
    let last = null, runs = 0, r;
    for (let k = 0; k < (stable ? 6 : 1); k++) {
      const MR = Math.random; Math.random = () => .3125;
      try { VV.cancel = false; r = await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}}); } finally { Math.random = MR; }
      runs++; const h = H(r.ch[0]) + '|' + H(r.ch[1]);
      if (stable && h === last) break; last = h;
    }
    window.__R = [Float32Array.from(r.ch[0]), Float32Array.from(r.ch[1])];
    return {n: r.n, sr: r.sr, lead: r.lead || 0, hash: last, runs};
  }, !!stable);
}
module.exports = {chromium, sleep, open, setup, render};
