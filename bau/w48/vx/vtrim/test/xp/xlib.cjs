// Unabhängige Xander-Prüfung VTRIM: Hilfen (Take mit Auftakt + Nachlauf über das Loop-Ende, Touch, Geometrie)
const {chromium, sleep, open} = require('../lib2.cjs');
// Take: Auftakt-Silbe im Takt davor (Vorlauf), 4 Silben im Loop (2 Takte), Nachlauf bis Loop-Ende und post s darüber hinaus
async function setupX(p, o) {
  return p.evaluate(o => {
    setBpm(120);
    const sp = spb(), bar = g10aBpb() * sp, sr = 48000, ia = Math.round(bar * sr), Ls = 2 * bar, post = o.post || 0, pre = o.pre || 0;
    const n = ia + Math.round((Ls + post) * sr) + Math.round(.4 * sr), y = new Float32Array(n);
    const syl = (s0, f0, N) => { let ph = 0; for (let j = 0; j < N; j++) { const t = j / sr; ph += 2 * Math.PI * f0 * (1 + (t > .12 ? .012 * Math.sin(2 * Math.PI * 5.5 * t) : 0)) / sr; let v = 0; for (let h = 1; h <= 6; h++) v += Math.sin(h * ph) / h; y[s0 + j] += .2 * v * Math.min(1, t / .015) * Math.min(1, (N - j) / sr / .04); } };
    if (pre) syl(ia - Math.round(pre * sr) + Math.round(.02 * sr), 246.94, Math.round((pre - .06) * sr));
    [261.63, 293.66, 329.63, 392].forEach((f, k) => syl(ia + Math.round(k * .5 * sr), f, Math.round(.42 * sr)));
    const pe = ia + Math.round((Ls - 2) * sr), oe = ia + Math.round((Ls + post) * sr); let lp = 0, seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - .5);
    for (let i = pe; i < oe; i++) { const t = (i - pe) / sr; lp += .08 * (rnd() - lp); y[i] += Math.min(1, t / .02) * (.5 * lp + .07 * Math.exp(-t / 1.2) * Math.sin(2 * Math.PI * 196 * t)); }
    const pcm = new Int16Array(n); for (let i = 0; i < n; i++) pcm[i] = Math.max(-32767, Math.min(32767, Math.round(y[i] * 32767)));
    for (let i = 0; i < NT(); i++) S.tracks[i].clips = S.tracks[i].clips.map(() => null);
    const r = tkAddPcmTake(pcm, sr, 'import'), id = r.id, st = tkEnsureTrack([]);
    for (let i = 0; i < NT(); i++) if (i !== st) S.tracks[i].clips = S.tracks[i].clips.map(() => null);
    const a = tkNormAudio({take: id, in: tkR6(ia / sr), out: tkR6(ia / sr + Ls), at: 0});
    if (post) S.takes[id].post = {out: a.out, sec: post};
    if (pre) S.takes[id].pre = {in: a.in, sec: pre};
    S.tracks[st].clips[0] = {len: 2, key: S.key, notes: [], audio: a};
    clipChanged(st, 0); UI.dirty.all = UI.dirty.grid = true;
    return {st, id, sp, bar, sr, in: a.in, out: a.out, post, pre};
  }, o || {});
}
// über die echte Oberfläche: Clip-Blatt öffnen, „✎ Bearbeiten“ antippen
async function openEdUI(p, T, st) {
  await p.evaluate(st => { selectSlot(st, 0); openClipSheet(st, 0); }, st); await sleep(500);
  const q = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].filter(b => /Bearbeiten/.test(b.textContent) && b.offsetParent); const r = b.length ? b[b.length - 1].getBoundingClientRect() : null; return r ? {x: r.left + r.width / 2, y: r.top + r.height / 2, t: b[b.length - 1].textContent.trim()} : null; });
  if (!q) throw new Error('kein Bearbeiten-Knopf');
  await T.tap(q);
  for (let k = 0; k < 60; k++) { await sleep(250); if (await p.evaluate(() => typeof vx1rOpenNow === 'function' && vx1rOpenNow() && VX1E.clip && VX1E.clip.notes.length > 0)) break; }
  await sleep(1200);
  return q;
}
// alle Fähnchen/Knöpfe/Texte im Bild + Treffer-Prüfung (elementFromPoint in der Griff-Mitte)
const geo = p => p.evaluate(() => {
  const R = e => { if (!e || e.hidden || !e.isConnected) return null; let x = e; while (x) { if (x.hidden) return null; x = x.parentElement; } const r = e.getBoundingClientRect(); if (!r.width && !r.height) return null; return {l: +r.left.toFixed(1), r: +r.right.toFixed(1), t: +r.top.toFixed(1), b: +r.bottom.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1)}; };
  const svgR = h => h ? R(h.querySelector('svg')) : null;
  const hit = (e, sv) => { if (!sv) return null; const el = document.elementFromPoint((sv.l + sv.r) / 2, (sv.t + sv.b) / 2); return el && (el === e || e.contains(el)); };
  const o = document.querySelector('.vtro'), v = document.querySelector('.vl3o'), cM = ED.roll && ED.roll.el.main;
  const q = (r, s) => r ? r.querySelector(s) : null;
  const eh = q(o, '.vtrh.e'), ah = q(o, '.vtrh.a'), vh = q(v, '.vl3h'), c = q(o, '.vtrc');
  return {
    vw: innerWidth, vh: innerHeight, cM: R(cM), f: ED.roll ? (({x0, ppb, W}) => ({x0, ppb, W}))(ED.roll.fol()) : null,
    eH: R(eh), eF: svgR(eh), eHit: hit(eh, svgR(eh)), eT: R(q(o, '.vtrt.e')), eTx: q(o, '.vtrt.e') ? q(o, '.vtrt.e').textContent : null,
    aH: R(ah), aF: svgR(ah), aHit: hit(ah, svgR(ah)), aT: R(q(o, '.vtrt.a')), aTx: q(o, '.vtrt.a') ? q(o, '.vtrt.a').textContent : null,
    vH: R(vh), vF: svgR(vh), vHit: hit(vh, svgR(vh)), vT: R(q(v, '.vl3t')), vTx: q(v, '.vl3t') ? q(v, '.vl3t').textContent : null,
    chip: R(c), chipHit: c && !c.hidden ? hit(c, R(c)) : null, nz: R(q(o, '.vtrn')), zone: R(q(o, '.vtrz.e')),
    full: o ? o.classList.contains('full') : null,
  };
});
const ov = (a, b) => !!(a && b && a.l < b.r - .5 && b.l < a.r - .5 && a.t < b.b - .5 && b.t < a.b - .5);
const clipA = (p, st) => p.evaluate(st => { const a = S.tracks[st].clips[0].audio; return {vt: a.vt || null, in: a.in, out: a.out, at: a.at, v3e: a.v3e || 0}; }, st);
module.exports = {chromium, sleep, open, setupX, openEdUI, geo, ov, clipA};
