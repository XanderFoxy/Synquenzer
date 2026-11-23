// VTRIM Kern-Test (Fassung 2): node kern2.cjs <port>   (Server-Wurzel mit neu/ und basis/)
// Take mit 2 s Nachlauf → Ende-Fähnchen per Touch um 1,5 s kürzen → Mixdown/Wiedergabe/Clip-WAV/Editor-▶ gemessen, ↶, Speichern/Laden;
// ohne Beschnitt gleich wie 4.91 (Quellen-Plan + trockener Render bitgleich, Clip-WAV bitgleich, Mix innerhalb der Eigen-Streuung von 4.91).
// Loop-Klammer: Nachlauf hinter dem Loop-Ende (take.post) sichtbar, Tipp „Ende auf Loop-Ende“, Einrasten auf Takt/Loop-Ende.
// Fotos: foto-vorher.png (4.91), foto-nachher.png (hochkant), foto-nachher-quer.png (quer), foto-loopklammer-quer.png.
const {chromium, sleep, open, setup, render} = require('./lib2.cjs');
const port = process.argv[2];
const OUT = __dirname + '/..';
let fail = 0, n = 0; const res = {};
const ok = (name, c, x) => { n++; console.log((c ? 'OK     ' : 'FEHLER ') + name + (x !== undefined ? '  ' + JSON.stringify(x) : '')); if (!c) fail++; res[name] = {ok: !!c, x}; };

// in der Seite: Fänger für tkStartSrc (Quellen-Plan, trockene Nachbildung), Hash, Clip-WAV-Proben, Mix als Base64
async function tools(p) {
  await p.evaluate(() => {
    window.__cap = null;
    window.__hash = y => { const u = new Uint32Array(y.buffer, y.byteOffset, y.length); let h = 2166136261; for (let k = 0; k < u.length; k++) { h ^= u[k]; h = Math.imul(h, 16777619) >>> 0; } return h.toString(16) + ':' + y.length; };
    const o0 = tkStartSrc;
    tkStartSrc = function (o) { if (window.__cap && !o.ctx) __cap.push({buf: o.buf, bh: __hash(o.buf.getChannelData(0)), when: o.when, off: o.off, end: o.end, fi: o.fi, fo: o.fo, gain: o.gain, xc: o.xc, xw: o.xw, key: o.key, take: o.take}); return o0.apply(this, arguments); };
    window.__plan = cap => JSON.stringify(cap.map(c => [c.bh, c.when, c.off, c.end, c.fi, c.fo, c.gain, c.xw, c.xc ? Array.from(c.xc).length : 0]));
    window.__dry = async (cap, N, sr) => { const oc = new OfflineAudioContext(1, N, sr); for (const c of cap) tkStartSrc(Object.assign({}, c, {ctx: oc, dest: oc.destination, i: 0, xc: null, xw: 0})); const b = await oc.startRendering(); return Float32Array.from(b.getChannelData(0)); };
    window.__wav = async (st) => { const c = S.tracks[st].clips[0], a = c.audio; if (typeof vl2X === 'function') { for (let k = 0; k < 200 && !vl2X(); k++) await new Promise(r => setTimeout(r, 25)); } const out = {}; for (const f of ['A', 'B']) { const P = vl2ClipPlanX({a, clip: c}, f), y = new Float32Array(P.n); for (let j = 0; j < P.n; j++) y[j] = P.get(0, j); out[f] = {y, P: {n: P.n, cue1: P.cue1, sr: P.sr}}; } return out; };
    window.__b64 = y => { const u = new Uint8Array(y.buffer, y.byteOffset, y.byteLength); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  });
}
async function renderCap(p, name) {
  await p.evaluate(() => { window.__cap = []; });
  const r = await render(p, false);
  return p.evaluate(async ({r, name}) => {
    const cap = __cap; window.__cap = null; const D = await __dry(cap, __R[0].length, r.sr); window.__RS = window.__RS || {};
    window.__RS[name] = {r, D, W: __R[0], cap};
    return {r, hashW: r.hash, hashD: __hash(D), plan: __plan(cap), mixL: __b64(__R[0]), cap: cap.map(c => ({when: +c.when.toFixed(5), off: +c.off.toFixed(5), end: +c.end.toFixed(5), fi: c.fi, fo: c.fo}))};
  }, {r, name});
}
const f32 = b64 => { const b = Buffer.from(b64, 'base64'); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
const maxDiff = (a, b) => { let m = 0; const n = Math.min(a.length, b.length); for (let i = 0; i < n; i++) { const d = Math.abs(a[i] - b[i]); if (d > m) m = d; } return a.length === b.length ? m : Infinity; };
const clipJson = (p, st) => p.evaluate(st => { const c = S.tracks[st].clips[0], id = c.audio.take; return JSON.stringify(c).split(id).join('TAKE'); }, st);
async function openEd(p, st) {
  await p.evaluate(st => vx1rOpen({t: st, s: 0}), st);
  for (let k = 0; k < 60; k++) { await sleep(250); if (await p.evaluate(() => VX1E.clip && VX1E.clip.notes.length > 0)) break; }
  await p.evaluate(() => ED.roll.fitView('clip')); await sleep(600);
}
const flagGeo = p => p.evaluate(() => {
  const o = document.querySelector('.vtro'), h = o && o.querySelector('.vtrh.e'), f = ED.roll.fol(), cM = ED.roll.el.main.getBoundingClientRect(); if (!h || o.hidden) return null;
  const r = h.getBoundingClientRect(), pl = o.querySelector('.vtrp.e').getBoundingClientRect(), c = o.querySelector('.vtrc'), cr = c.getBoundingClientRect(), t = o.querySelector('.vtrt.e').getBoundingClientRect();
  return {pole: pl.left + pl.width / 2, hx: r.left + 20, hy: r.top + 14, w: r.width, h: r.height, x0: f.x0, ppb: f.ppb, cL: cM.left, cR: cM.right, cT: cM.top, txt: o.querySelector('.vtrt.e').textContent, tL: t.left, tR: t.right, full: o.classList.contains('full'),
    chip: c.hidden ? null : {x: cr.left + cr.width / 2, y: cr.top + cr.height / 2, w: cr.width, h: cr.height, l: cr.left, r: cr.right, t: c.textContent}, nz: o.querySelector('.vtrn').hidden ? 0 : o.querySelector('.vtrn').getBoundingClientRect().width};
});

(async () => {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  // ---------- Basis 4.91: Render ohne Beschnitt (2× für die Eigen-Streuung) + Foto vorher ----------
  let base;
  {
    const {ctx, p, errs} = await open(b, port, 'basis', 428, 926);
    await tools(p);
    const s = await setup(p);
    await render(p, false);
    const B1 = await renderCap(p, 'B1'), B2 = await renderCap(p, 'B2');
    const W = await p.evaluate(async st => { const W = await __wav(st); return {A: __hash(W.A.y), B: __hash(W.B.y)}; }, s.st);
    base = {B1, B2, W, clip: await clipJson(p, s.st)};
    await openEd(p, s.st);
    await p.screenshot({path: OUT + '/foto-vorher.png'});
    ok('Basis 4.91 lädt ohne Seitenfehler', errs.length === 0, errs.slice(0, 3));
    await ctx.close();
  }
  // ---------- neu, hochkant ----------
  {
    const {ctx, p, errs, T} = await open(b, port, 'neu', 428, 926);
    await tools(p);
    const s = await setup(p);
    ok('gespeicherter Clip ohne Beschnitt unverändert (JSON gleich 4.91, kein vt/v3e)', (await clipJson(p, s.st)) === base.clip, {neu: (await clipJson(p, s.st)).slice(0, 160)});
    await render(p, false);
    const R0 = await renderCap(p, 'R0');
    const W0 = await p.evaluate(async st => { const W = await __wav(st); window.__W0 = W; return {A: __hash(W.A.y), B: __hash(W.B.y)}; }, s.st);
    const mB = maxDiff(f32(base.B1.mixL), f32(base.B2.mixL)), mN = Math.min(maxDiff(f32(R0.mixL), f32(base.B1.mixL)), maxDiff(f32(R0.mixL), f32(base.B2.mixL)));
    ok('ohne Beschnitt: Quellen-Plan + trockener Render bitgleich zu 4.91', R0.plan === base.B2.plan && R0.hashD === base.B2.hashD && base.B1.hashD === base.B2.hashD, {neu: R0.hashD, basis: [base.B1.hashD, base.B2.hashD], quellen: R0.cap.length});
    ok('ohne Beschnitt: Mix innerhalb der Eigen-Streuung von 4.91 (4.91 selbst ist von Render zu Render nicht bitgleich)', mN <= mB, {neuGegenBasis: mN, basisGegenBasis: mB, hashNeu: R0.hashW, hashBasis: [base.B1.hashW, base.B2.hashW]});
    ok('ohne Beschnitt: Clip-WAV (mit Vorlauf / Loop rund) bitgleich zu 4.91', W0.A === base.W.A && W0.B === base.W.B, {neu: W0, basis: base.W});

    // Gesang-Editor öffnen (ganzer Clip im Bild)
    await openEd(p, s.st);
    const g0 = await flagGeo(p);
    ok('Ende-Fähnchen am Clip-Ende (Nachlauf ganz, hohl, Text „Ende“), Griff 48 px, kein Loop-Knopf ohne Überhang', g0 && Math.abs(g0.pole - (g0.cL + (8 - g0.x0) * g0.ppb)) < 1.5 && g0.full && g0.txt === 'Ende' && g0.w >= 32 && g0.h >= 32 && !g0.chip && g0.tL >= g0.cL - .5, g0);
    // Ziehen mit dem Finger: 3 Schläge = 1,5 s nach links (Raster 1/16)
    await T.drag(g0.hx, g0.hy, g0.hx - 3 * g0.ppb, 14);
    await sleep(300);
    const d1 = await p.evaluate(st => { const a = S.tracks[st].clips[0].audio, o = document.querySelector('.vtro'); return {vt: a.vt, out: a.out, take: a.take, undo: UNDO[UNDO.length - 1].label, txt: o.querySelector('.vtrt.e').textContent, zone: o.querySelector('.vtrz.e').getBoundingClientRect().width, x0: ED.roll.fol().x0, ppb: ED.roll.fol().ppb, len: S.takes[a.take].len / S.takes[a.take].sr}; }, s.st);
    ok('Touch-Ziehen: Ende 1,5 s früher (Take bleibt ganz), ↶-Eintrag, Text „Ende −1,50 s“, Zone ausgegraut', d1.vt && d1.vt.k === d1.take && Math.abs(d1.vt.e - (d1.out - 1.5)) < 1e-6 && d1.undo === 'Gesang-Ende verschoben' && d1.txt === 'Ende −1,50 s' && Math.abs(d1.zone - 3 * g0.ppb) < 2 && Math.abs(d1.x0 - g0.x0) < 1e-9 && d1.len > d1.out, d1);
    await p.screenshot({path: OUT + '/foto-nachher.png'});

    // Mixdown mit Beschnitt
    const R1 = await renderCap(p, 'R1');
    const M = await p.evaluate(async ({inS}) => {
      const R0 = __RS.R0, R1 = __RS.R1, sr = R1.r.sr, body = R0.cap.find(c => Math.abs(c.off - inS) < 1e-6), t0 = body.when, cut = t0 + 2.5, ic = Math.round(cut * sr), iEnd = Math.round((t0 + 4) * sr);
      const D0 = R0.D, D1 = R1.D, W0 = R0.W, W1 = R1.W;
      let lastD1 = -1, lastD0 = -1; for (let j = 0; j < D1.length; j++) { if (Math.abs(D1[j]) > 1e-7) lastD1 = j; if (Math.abs(D0[j]) > 1e-7) lastD0 = j; }
      let after = 0; for (let j = ic + 1; j < D1.length; j++) after = Math.max(after, Math.abs(D1[j]));
      const fF = Math.round(.0105 * sr); let sameD = true; for (let j = 0; j < ic - fF; j++) if (D0[j] !== D1[j]) { sameD = false; break; }
      const jump = (y, a, b) => { let m = 0; for (let j = Math.max(1, a); j < Math.min(y.length, b); j++) m = Math.max(m, Math.abs(y[j] - y[j - 1])); return m; };
      const w15 = Math.round(.015 * sr), nat0 = Math.round((t0 + 2.05) * sr);
      const jD1 = jump(D1, ic - w15, ic + w15), jD0n = jump(D0, nat0, iEnd - w15), jW1 = jump(W1, ic - w15, ic + w15), jW0n = jump(W0, nat0, iEnd - w15);
      const db = (y, a, b) => { let s = 0; for (let j = a; j < b; j++) s += y[j] * y[j]; return +(10 * Math.log10(s / Math.max(1, b - a) + 1e-20)).toFixed(1); };
      const win = [ic + Math.round(.1 * sr), iEnd - Math.round(.05 * sr)];
      let hard = 0; for (let j = ic - 3; j <= ic; j++) hard = Math.max(hard, Math.abs(D0[j]));
      return {sr, t0: +t0.toFixed(4), cut: +cut.toFixed(4), lenD0: +((lastD0 + 1) / sr - t0).toFixed(4), lenD1: +((lastD1 + 1) / sr - t0).toFixed(4), stilleDanach: after, gleichBisBlende: sameD,
        sprung: {trockenSchnitt: +jD1.toFixed(5), trockenSignal: +jD0n.toFixed(5), mixSchnitt: +jW1.toFixed(5), mixSignal: +jW0n.toFixed(5), ohneBlende: +hard.toFixed(4)},
        dbFenster: {vorher: db(W0, win[0], win[1]), nachher: db(W1, win[0], win[1]), trockenNachher: db(D1, win[0], win[1])}, stuecke: R1.cap.length, fo: R1.cap.map(c => c.fo)};
    }, {inS: s.in}).catch(e => ({err: String(e)}));
    ok('Mixdown: Gesang endet 2,50 s nach der 1 (vorher 4,00 s), danach exakt still (trocken)', M.lenD1 !== undefined && Math.abs(M.lenD1 - 2.5) < 1.5 / M.sr && Math.abs(M.lenD0 - 4) < 2 / M.sr && M.stilleDanach === 0, M);
    ok('Mixdown: bis zur Blende bitgleich mit unbeschnitten (trocken)', M.gleichBisBlende === true, M.gleichBisBlende);
    ok('kein Knackser: größter Sprung an der Schnittkante ≤ Sprung im Signal selbst (trocken und Mix), Blende 10 ms', M.sprung && M.sprung.trockenSchnitt <= M.sprung.trockenSignal && M.sprung.mixSchnitt <= M.sprung.mixSignal && M.fo.every(f => Math.abs(f - .01) < 1e-9), M.sprung);
    ok('Mix nach dem Schnitt: nur noch Hall-Ausklang (mind. 10 dB leiser als der Nachlauf)', M.dbFenster && M.dbFenster.nachher <= M.dbFenster.vorher - 10 && M.dbFenster.trockenNachher < -150, M.dbFenster);

    // Wiedergabe in der Matrix (Loop): jede Runde endet am Fähnchen
    const live = await p.evaluate(async ({inS}) => {
      window.__cap = []; ensureAudio(); await new Promise(r => setTimeout(r, 300)); launchScene(0);
      const t0 = performance.now(); while (performance.now() - t0 < 6500) await new Promise(r => setTimeout(r, 100));
      const cap = __cap; window.__cap = null; try { stop(); } catch (e) {}
      return cap.filter(c => Math.abs(c.off - inS) < 1e-6).map(c => ({len: +(c.end - c.when).toFixed(4), fo: c.fo}));
    }, {inS: s.in});
    ok('Matrix-Loop: jede Runde 2,50 s Gesang, Blende 10 ms an der Kante', live.length >= 2 && live.every(x => Math.abs(x.len - 2.5) < 1e-3 && Math.abs(x.fo - .01) < 1e-9), live);

    // Clip-WAV mit Beschnitt
    const WV = await p.evaluate(async ({st}) => {
      const W = await __wav(st), W0 = __W0, out = {};
      for (const f of ['A', 'B']) {
        const y = W[f].y, y0 = W0[f].y, sr = W[f].P.sr, c1 = W[f].P.cue1, ic = c1 + Math.round(2.5 * sr), ie = c1 + Math.round(4 * sr);
        let after = 0; for (let j = ic + 1; j < Math.min(y.length, ie); j++) after = Math.max(after, Math.abs(y[j]));
        let pre = 0; for (let j = 0; j < ic - Math.round(.011 * sr); j++) pre = Math.max(pre, Math.abs(y[j] - y0[j]));
        let jmp = 0; for (let j = ic - 600; j < ic + 600; j++) jmp = Math.max(jmp, Math.abs(y[j] - y[j - 1]));
        let jn = 0; for (let j = c1 + Math.round(2.1 * sr); j < c1 + Math.round(3.9 * sr); j++) jn = Math.max(jn, Math.abs(y0[j] - y0[j - 1]));
        out[f] = {stilleDanach: after, diffVorher: pre, sprung: +jmp.toFixed(5), sprungSignal: +jn.toFixed(5)};
      }
      return out;
    }, {st: s.st});
    ok('Clip-WAV (mit Vorlauf / Loop rund): nach dem Fähnchen still, davor unverändert, kein Knackser', ['A', 'B'].every(f => WV[f].stilleDanach === 0 && WV[f].diffVorher === 0 && WV[f].sprung <= WV[f].sprungSignal), WV);

    // ▶ im Gesang-Editor: spielt nur bis zum Ende-Fähnchen
    const pv = await p.evaluate(async () => {
      const L = []; const st0 = AudioBufferSourceNode.prototype.start, sp0 = AudioBufferSourceNode.prototype.stop;
      AudioBufferSourceNode.prototype.start = function (w, o) { this.__w = w; this.__o = o; return st0.apply(this, arguments); };
      AudioBufferSourceNode.prototype.stop = function (w) { if (VX1E.pv == null || VX1E.pv.s === this || this.__o != null) L.push({o: this.__o, d: w - this.__w}); return sp0.apply(this, arguments); };
      try { vx1rPlay(null, false); await new Promise(r => setTimeout(r, 50)); const s = VX1E.pv && VX1E.pv.s; const r = s ? {o: +s.__o.toFixed(4), d: +(L.find(x => x.o === s.__o) || {d: NaN}).d.toFixed(4)} : null; vx1rPvStop(); return r; }
      finally { AudioBufferSourceNode.prototype.start = st0; AudioBufferSourceNode.prototype.stop = sp0; }
    });
    ok('▶ im Gesang-Editor: spielt ab der 1 nur 2,50 s (bis zum Fähnchen)', pv && Math.abs(pv.o - s.in) < 1e-3 && Math.abs(pv.d - (2.5 + .01)) < 2e-3, pv);

    // Rückgängig per Touch (↶ in der Editor-Leiste)
    const ub = await p.evaluate(() => { const b = [...ED.roll.el.bar.querySelectorAll('button')].find(x => x.title === 'Rückgängig'); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
    await T.tap(ub); await sleep(300);
    const u = await p.evaluate(st => { const a = S.tracks[st].clips[0].audio, o = document.querySelector('.vtro'); return {vt: a.vt || null, txt: o && o.querySelector('.vtrt.e').textContent}; }, s.st);
    const R2 = await renderCap(p, 'R2');
    ok('↶ (Touch) stellt den ganzen Nachlauf wieder her – Quellen-Plan und trockener Render wieder bitgleich zu 4.91', !u.vt && u.txt === 'Ende' && R2.plan === base.B2.plan && R2.hashD === base.B2.hashD, {u, hashD: R2.hashD});
    // ↷ und Speichern/Laden (echter Rundlauf über applyProject)
    const sv = await p.evaluate(async st => {
      redo(); const c = S.tracks[st].clips[0], live = JSON.parse(JSON.stringify(c.audio.vt)), j = serializeProject(), sc = JSON.parse(j).tracks[st].clips[0];
      applyProject(normalizeProject(JSON.parse(j)), {}); await new Promise(r => setTimeout(r, 400));
      const c2 = S.tracks[st].clips[0]; return {live, saved: sc.audio && sc.audio.vt, loaded: c2 && c2.audio && c2.audio.vt, take: c2 && c2.audio.take};
    }, s.st);
    const R3 = await renderCap(p, 'R3');
    ok('Speichern/Laden behält den Beschnitt (vt im Projekt, nach dem Laden gleich, Render wie vor dem Speichern)', sv.live && JSON.stringify(sv.saved) === JSON.stringify(sv.live) && JSON.stringify(sv.loaded) === JSON.stringify(sv.live) && sv.loaded.k === sv.take && R3.plan === R1.plan && R3.hashD === R1.hashD, {sv, R3: R3.hashD, R1: R1.hashD});
    // Tipp aufs Fähnchen: „ganze Länge“ und wieder ↶
    await openEd(p, s.st);
    const g2 = await flagGeo(p);
    await T.tap({x: g2.hx, y: g2.hy});
    const mn = await p.evaluate(() => [...document.querySelectorAll('.vtrm button')].map(b => { const r = b.getBoundingClientRect(); return {t: b.textContent, on: b.classList.contains('on'), x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height, w: r.width}; }));
    if (mn[0]) await T.tap(mn[0]);
    const mf = await p.evaluate(st => { const a = S.tracks[st].clips[0].audio; const r = {vt: a.vt || null, label: UNDO[UNDO.length - 1].label, menu: !!document.querySelector('.vtrm')}; undo(); r.back = S.tracks[st].clips[0].audio.vt || null; return r; }, s.st);
    ok('Tippen aufs Fähnchen: Menü „ganze Länge“ (≥ 44 px) setzt zurück, ↶ holt den Schnitt wieder', mn.length === 1 && mn[0].t === 'ganze Länge' && mn[0].h >= 44 && !mf.vt && mf.label === 'Gesang-Ende: ganze Länge' && !mf.menu && mf.back && Math.abs(mf.back.e - (s.out - 1.5)) < 1e-6, {mn, mf});
    // Einrasten auf der Takt-Grenze: Ziel 4,2 Schläge (Raster gäbe 4,25) → rastet auf Takt 2 (4,0)
    await sleep(300);
    const g3 = await flagGeo(p);
    const want = 4.2, xW = g3.cL + (want - g3.x0) * g3.ppb;
    await T.drag(g3.hx, g3.hy, g3.hx + (xW - g3.pole), 12); await sleep(300);
    const sn = await p.evaluate(st => { const a = S.tracks[st].clips[0].audio; return {e: a.vt && a.vt.e, beat: a.vt ? (a.vt.e - a.in) / spb() : null}; }, s.st);
    ok('Ende rastet beim Ziehen auf der Takt-Grenze ein (Ziel 4,2 Schläge → Takt 2 = 4,0)', sn.beat != null && Math.abs(sn.beat - 4) < 1e-6, sn);
    await p.evaluate(() => undo());

    // Nachlauf hinter dem Loop-Ende (take.post) endet am Fähnchen (Rechnung)
    const po = await p.evaluate(st => { const c = S.tracks[st].clips[0], a = c.audio, m = S.takes[a.take], keep = a.vt; m.post = {out: a.out, sec: .25};
      const r = {ohne: (delete a.vt, g3PostOf(a))}; a.vt = {k: a.take, e: a.out + .1}; r.mitIn = g3PostOf(a); a.vt = {k: a.take, e: a.out - 1}; r.mitDavor = g3PostOf(a);
      a.vt = {k: a.take, e: a.out + .1}; const G = vtrGeo({c, a}); r.geo = {nE: G.nE, eB: +G.eB.toFixed(4)}; delete m.post; if (keep) a.vt = keep; else delete a.vt; return r; }, s.st);
    ok('Nachlauf hinter dem Loop-Ende: Fähnchen kürzt ihn (0,25 → 0,10 s, davor 0), Griff reicht bis ganz hinten', Math.abs(po.ohne - .25) < 1e-9 && Math.abs(po.mitIn - .1) < 1e-6 && po.mitDavor === 0 && Math.abs(po.geo.nE - 8.5) < 1e-6 && Math.abs(po.geo.eB - 8.2) < 1e-6, po);

    // Gesang→Noten: verknüpfte Noten im weggeschnittenen Teil schweigen (nichts gelöscht)
    const gn = await p.evaluate(async ({st}) => {
      const a0 = S.tracks[st].clips[0].audio, id = a0.take, mt = MEL_T; a0.vt = {k: id, e: a0.out - 1.5};
      S.tracks[mt].clips[0] = {len: 2, key: S.key, notes: [{t: 1, d: .5, n: 60, v: .8}, {t: 6, d: .5, n: 64, v: .8}], take: id};
      clipChanged(mt, 0);
      const log = []; const sv0 = spawnClipVoice; spawnClipVoice = function (i, out, v, t) { if (i === mt) log.push(+(t).toFixed(3)); return sv0.apply(this, arguments); };
      try {
        VV.cancel = false; await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}});
        const mit = log.slice(); log.length = 0;
        const keep = a0.vt; delete a0.vt;
        await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}}); a0.vt = keep;
        return {mit, ohne: log.slice(), notes: S.tracks[mt].clips[0].notes.length};
      } finally { spawnClipVoice = sv0; S.tracks[mt].clips[0] = null; clipChanged(mt, 0); delete a0.vt; }
    }, {st: s.st}).catch(e => ({err: String(e)}));
    ok('Gesang→Noten: Note im weggeschnittenen Teil schweigt, Note davor spielt, nichts gelöscht', gn.mit && gn.mit.length === 1 && gn.ohne.length === 2 && gn.notes === 2, gn);

    // Vorlauf-Fähnchen in „▸ einmal“: nach dem Ziehen wirksam; alte Clips (ohne Marker) wie 4.91
    const v3 = await p.evaluate(st => { const c = S.tracks[st].clips[0], a = c.audio, m = S.takes[a.take], kp = m.pre, kv = m.vorlauf;
      m.pre = {in: a.in, sec: 1}; m.vorlauf = {in: a.in, takte: 1, ersterEinsatz: 1}; c.vl3s = .5; delete c.vorlaufModus;
      const alt = vl2PreOf(c, a), posAlt = vl3Pos({c, a}, vl3Max(c, a)); vl3Set(st, 0, .75); const c1 = S.tracks[st].clips[0], neu = vl2PreOf(c1, c1.audio), lab = UNDO[UNDO.length - 1].label, mk = c1.audio.v3e; undo();
      const c2 = S.tracks[st].clips[0], back = vl2PreOf(c2, c2.audio);
      if (kp) m.pre = kp; else delete m.pre; if (kv) m.vorlauf = kv; else delete m.vorlauf; delete c2.vl3s; clipChanged(st, 0);
      return {alt, posAlt, neu, lab, mk, back};
    }, s.st);
    ok('Vorlauf-Fähnchen in „▸ einmal“: alter Clip spielt wie 4.91 (1,0 s), nach Ziehen 0,75 s hörbar, ↶ zurück', v3.alt === 1 && v3.posAlt === 1 && Math.abs(v3.neu - .75) < 1e-9 && v3.mk === 1 && v3.back === 1 && v3.lab === 'Auftakt verschoben', v3);

    ok('keine Seitenfehler (neu, hochkant)', errs.length === 0, errs.slice(0, 5));
    res.mess = M; res.live = live; res.wav = WV;
    await ctx.close();
  }
  // ---------- neu, quer: Kern-Schnitt ----------
  {
    const {ctx, p, errs, T} = await open(b, port, 'neu', 926, 428);
    await tools(p);
    const s = await setup(p);
    await openEd(p, s.st);
    const g0 = await flagGeo(p);
    await T.drag(g0.hx, g0.hy, g0.hx - 3 * g0.ppb, 14); await sleep(300);
    const q = await p.evaluate(st => { const a = S.tracks[st].clips[0].audio, o = document.querySelector('.vtro'), R = e => { const r = e.getBoundingClientRect(); return {l: r.left, r: r.right, t: r.top, b: r.bottom}; };
      const h = R(o.querySelector('.vtrh.e')), t = R(o.querySelector('.vtrt.e')), ha = o.querySelector('.vtra').hidden ? null : R(o.querySelector('.vtrh.a')), ta = o.querySelector('.vtra').hidden ? null : R(o.querySelector('.vtrt.a'));
      return {vt: a.vt, out: a.out, h, t, ha, ta, vw: innerWidth, vh: innerHeight}; }, s.st);
    const sep = (a, c) => !a || !c || a.r <= c.l + .5 || c.r <= a.l + .5 || a.b <= c.t + .5 || c.b <= a.t + .5;
    ok('quer: Touch-Ziehen kürzt 1,5 s, Griff ≥ 32 px im Bild, Texte und Griffe überlappen nicht', q.vt && Math.abs(q.vt.e - (q.out - 1.5)) < 1e-6 && g0.w >= 32 && g0.h >= 32 && q.h.t >= g0.cT - 1 && q.h.b <= q.vh && q.t.l >= 0 && sep(q.h, q.ha) && sep(q.t, q.ha) && sep(q.t, q.ta), {g0, q});
    await p.screenshot({path: OUT + '/foto-nachher-quer.png'});
    ok('keine Seitenfehler (quer)', errs.length === 0, errs.slice(0, 5));
    await ctx.close();
  }
  // ---------- neu, quer: Loop-Klammer (Nachlauf 0,8 s hinter dem Loop-Ende) ----------
  {
    const {ctx, p, errs, T} = await open(b, port, 'neu', 926, 428);
    await tools(p);
    const s = await setup(p, {post: .8});
    await render(p, false);
    const P0 = await renderCap(p, 'P0');
    await openEd(p, s.st);
    const g0 = await flagGeo(p);
    ok('Loop-Klammer: Nachlauf über das Loop-Ende ist sichtbar (getönt) und der Knopf „Ende auf Loop-Ende“ ist da (≥ 32 px)', g0 && g0.chip && g0.chip.t === 'Ende auf Loop-Ende' && g0.chip.h >= 32 && g0.chip.w >= 32 && g0.nz > 0 && g0.chip.r <= g0.cL + (8 - g0.x0) * g0.ppb, g0);
    await p.screenshot({path: OUT + '/foto-loopklammer-quer.png'});
    const postBefore = P0.cap.filter(c => c.off > s.out - .01 && c.off < s.out).map(c => +(c.end - c.when).toFixed(4));
    await T.tap({x: g0.chip.x, y: g0.chip.y}); await sleep(300);
    const c1 = await p.evaluate(st => { const a = S.tracks[st].clips[0].audio, o = document.querySelector('.vtro'); return {vt: a.vt || null, out: a.out, label: UNDO[UNDO.length - 1].label, chip: !o.querySelector('.vtrc').hidden, nz: !o.querySelector('.vtrn').hidden, post: g3PostOf(a)}; }, s.st);
    const P1 = await renderCap(p, 'P1');
    const postAfter = P1.cap.filter(c => c.off > s.out - .01 && c.off < s.out).map(c => +(c.end - c.when).toFixed(4));
    ok('ein Tipp „Ende auf Loop-Ende“: Gesang bleibt in der Loop-Klammer (Nachlauf 0,8 s → 0), ↶-Eintrag, Knopf weg', c1.vt && Math.abs(c1.vt.e - c1.out) < 1e-6 && c1.post === 0 && c1.label === 'Gesang-Ende auf Loop-Ende' && !c1.chip && !c1.nz && postBefore.length === 1 && Math.abs(postBefore[0] - .805) < 2e-3 && postAfter.length === 0, {c1, postBefore, postAfter});
    // ↶, dann Ende von ganz hinten ziehen: rastet am Loop-Ende ein
    await p.evaluate(() => undo()); await sleep(200);
    await p.evaluate(() => { const f = ED.roll.fol(); ED.roll.showPage(9.6 - (f.W - 120) / f.ppb); }); await sleep(500);
    const g1 = await flagGeo(p);
    const xL = g1.cL + (8.17 - g1.x0) * g1.ppb;
    await T.drag(g1.hx, g1.hy, g1.hx + (xL - g1.pole), 14); await sleep(300);
    const c2 = await p.evaluate(st => { const a = S.tracks[st].clips[0].audio; return {e: a.vt && a.vt.e, out: a.out, label: UNDO[UNDO.length - 1].label}; }, s.st);
    ok('Ende-Griff rastet beim Ziehen auf dem Loop-Ende ein (Ziel 8,17 Schläge, Raster gäbe 8,25 → 8,0)', c2.e != null && Math.abs(c2.e - c2.out) < 1e-6 && c2.label === 'Gesang-Ende verschoben', {c2, g1: {x0: g1.x0, ppb: g1.ppb, pole: g1.pole}});
    ok('keine Seitenfehler (quer, Loop-Klammer)', errs.length === 0, errs.slice(0, 5));
    await ctx.close();
  }
  await b.close();
  console.log(JSON.stringify({gesamt: n, fehler: fail}));
  require('fs').writeFileSync(__dirname + '/kern2.json', JSON.stringify(res, null, 1));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
