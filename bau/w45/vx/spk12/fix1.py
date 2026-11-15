import sys
P = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/spk12/spk12-block.js'
s = open(P, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    c = s.count(a)
    if c != n: sys.exit('Anzahl %d statt %d: %r' % (c, n, a[:90]))
    s = s.replace(a, b)
# 1) Worker: Ebenen-Signal – Schlüssel je Dokument-Objekt, nur das Signal im Speicher, blockweise nur der gebrauchte Bereich, Fortschritt
i0 = s.index('  const SRC = new Map(); let srcN = 0;')
i1 = s.index('  if (X.similar) ops.spk12aehnB')
i1 = s.index('\n', i1) + 1
neu = r'''  /* Prüfung: Schlüssel = Dokument-Objekt (d.s12uid; nach Schließen/Öffnen/Import neu) + Ebene + Versionen; der Eintrag hält nur das Signal
     (kein altes Dokument), Blöcke werden nur im gebrauchten Bereich gerechnet (done je Block), Fortschritt über emit */
  const SRC = new Map(); let srcN = 0, srcU = 0;
  const srcLid = (d, m) => { const lid = m && m.s12src; if (!lid || lid === 'orig' || !X.block || !X.mixOf) return null; return lid === 'rest' || d.meta.layers.some(l => l.id === lid) ? lid : null; };
  async function src(d, m, a, b, emit) {
    const lid = srcLid(d, m); if (!lid) return d;
    if (!d.s12uid) d.s12uid = ++srcU;
    for (const [k, e] of SRC) if (e.id === d.meta.id && e.uid !== d.s12uid) SRC.delete(k);   // Stand eines geschlossenen/neu geladenen Dokuments
    const key = d.meta.id + '#' + d.s12uid + '|' + lid + '|' + d.meta.layers.map(l => l.id + ':' + l.ver).join(','), n = d.meta.n, BL = X.BLK, nb = Math.ceil(n / BL);
    let e = SRC.get(key); if (e) SRC.delete(key); else e = {id: d.meta.id, uid: d.s12uid, mid: new Float32Array(n), done: new Uint8Array(nb), s12k: ':s12L' + (++srcN), ms: 0};
    SRC.set(key, e); while (SRC.size > 2) SRC.delete(SRC.keys().next().value);
    const k0 = a == null ? 0 : Math.max(0, Math.floor(a / BL)), k1 = b == null ? nb - 1 : Math.min(nb - 1, Math.floor(Math.max(0, b - 1) / BL)), T0 = performance.now();
    let todo = 0; for (let k = k0; k <= k1; k++) if (!e.done[k]) todo++;
    if (todo) {
      const mx = X.mixOf(d, lid), mid = e.mid; let tY = T0, tP = T0, nd = 0;
      for (let k = k0; k <= k1; k++) {
        if (e.done[k]) continue;
        const bl = X.block(d, k, mx), o = k * BL, en = Math.min(n, o + BL), kk = 1 / bl.length;
        for (const y of bl) for (let i = o; i < en; i++) mid[i] += y[i - o] * kk;
        e.done[k] = 1; nd++;
        const t = performance.now();
        if (t - tY > 25) { if (emit && todo > 24 && t - tP > 120) { emit({qid: m.qid, prog: nd / todo, stufe: 'Ebene abtasten'}); tP = t; } await X.tick(); tY = performance.now(); }
      }
    }
    const ms = +(performance.now() - T0).toFixed(1); e.ms += ms;
    const d2 = Object.create(d); d2.mid = e.mid; d2.co = null; d2.s12k = e.s12k; d2.s12ms = ms; d2.s12lid = lid; d2.s12blk = todo; return d2;
  }
  const SR_ = (d, t) => Math.round(t * d.meta.sr);
  const rng = {   // Bereich je Op (Samples), den das Ebenen-Signal braucht; null = ganzes Stück
    spk12trans: (d, m) => [SR_(d, Math.min(+m.t0, +m.t1) - 0.4), SR_(d, Math.max(+m.t0, +m.t1) + 0.4)],
    spk12follow: (d, m) => [SR_(d, +m.t0 - 0.6), SR_(d, +m.t1 + 0.6)],
    spk12hauto: (d, m) => { const T = (m.spur || []).map(p => +p[0]).filter(isFinite); return T.length ? [SR_(d, Math.min(...T) - 0.6), SR_(d, Math.max(...T) + 0.6)] : [0, 1]; },
    spk12harm: (d, m) => { const t = +m.t || 0, w = Math.min(12, m.max || 6) + 0.8; return [SR_(d, t - w), SR_(d, t + w)]; }
  };
  const gainOk = (d, lid) => { if (!X.gainFn) return false; if (lid === 'rest') return true; const l = d.meta.layers.find(x => x.id === lid); return !!l && !l.a6 && !(l.fx && Object.keys(l.fx).some(k => +l.fx[k])); };
  /* Zauberstab „Alle Ebenen abtasten“ aus: Anzeige-Raster des Originals (Stücke aus IDB) × Anteil der Ebene je Base-Rahmen und Zeile
     (Masken der Ebenen, wie beim Abspielen) – kein Rendern der Ebene; Ebenen mit eigenem Audio/Effekten → Ebenen-Signal im Fenster */
  function gainA(d, lid, A, ca, nc, R, I) {
    const gf = X.gainFn(d, X.mixOf(d, lid)), Nb = d.meta.base.N, hb = d.meta.base.hop, sr = d.meta.sr, NB = Nb / 2 + 1, g = new Float32Array(NB), lo = new Int32Array(R), hi = new Int32Array(R), k255 = 255 / I.dbf, gr = new Float32Array(R);
    const fr = r => 440 * Math.pow(2, (I.m0 + r / I.rps - 69) / 12);
    for (let r = 0; r < R; r++) { const a = Math.max(0, Math.min(NB - 1, Math.floor(fr(r - 0.5) * Nb / sr))), b = Math.max(a, Math.min(NB - 1, Math.ceil(fr(r + 0.5) * Nb / sr))); lo[r] = a; hi[r] = b; }
    let mP = -1;
    for (let c = 0; c < nc; c++) {
      const mm = Math.round((ca + c) * I.hop / hb + 1);
      if (mm !== mP) { mP = mm; gf(mm, g); for (let r = 0; r < R; r++) { let v = 0; for (let k = lo[r]; k <= hi[r]; k++) if (g[k] > v) v = g[k]; gr[r] = v > 1e-5 ? 20 * Math.log10(v) * k255 : -1e9; } }
      const off = c * R; for (let r = 0; r < R; r++) { const q = gr[r]; if (q === 0) continue; const v = A[off + r] + q; A[off + r] = v <= 0 ? 0 : v >= 255 ? 255 : Math.round(v); }
    }
  }
  { const z0 = ops.spk12zauber; ops.spk12zauber = async (d, m, emit, ...r) => {
    const lid = srcLid(d, m); if (!lid) return z0(d, m, emit, ...r);
    const T0 = performance.now();
    if (gainOk(d, lid)) { const o = await z0(d, Object.assign({}, m, {s12g: lid}), emit, ...r); if (o && typeof o === 'object') o.s12src = {lid, ms: 0, weg: 'maske', ges: +(performance.now() - T0).toFixed(1)}; return o; }
    const N = [1024, 2048, 4096, 8192, 16384].includes(m.N) ? m.N : 4096, I = X.specInfo(d, N), hD = I.hop, ct = Math.round((+m.t || 0) * d.meta.sr / hD), cw = Math.round(Math.max(0.5, Math.min(60, +m.lim || 5)) * d.meta.sr / hD);
    const c0 = Math.max(0, ct - cw) >> 10, c1 = Math.min(I.cols - 1, ct + cw) >> 10;   // ganze Anzeige-Stücke (1024 Spalten) dieses Fensters
    const d2 = await src(d, m, c0 * 1024 * hD - N, (c1 + 1) * 1024 * hD + N, emit), o = await z0(d2, m, emit, ...r);
    if (o && typeof o === 'object') o.s12src = {lid, ms: d2.s12ms, blk: d2.s12blk, weg: 'signal', ges: +(performance.now() - T0).toFixed(1)}; return o;
  }; }
  for (const k of ['spk12trans', 'spk12hauto', 'spk12follow']) { const f0 = ops[k]; ops[k] = async (d, m, emit, ...r) => { const R = srcLid(d, m) ? rng[k](d, m) : [0, 0], d2 = await src(d, m, R[0], R[1], emit), o = await f0(d2, m, emit, ...r); if (o && typeof o === 'object' && d2 !== d) o.s12src = {lid: d2.s12lid, ms: d2.s12ms, blk: d2.s12blk}; return o; }; }
  if (X.harmTrack) ops.spk12harm = async (d, m, emit) => { const R = rng.spk12harm(d, m); return X.harmTrack(await src(d, m, R[0], R[1], emit), +m.t || 0, +m.f || 220, m.max || 6); };
  if (X.similar) ops.spk12aehnB = async (d, m, emit) => X.similar(await src(d, m, null, null, emit), m.ex || {});
'''
s = s[:i0] + neu + s[i1:]
# aehn (mit Merkmalen) mit Fortschritt
rep("  ops.spk12aehn = async (d, m) => {\n    const T0 = performance.now(), d2 = await src(d, m), ex", "  ops.spk12aehn = async (d, m, emit) => {\n    const T0 = performance.now(), d2 = await src(d, m, null, null, emit), ex")
# Zauberstab: Anteil der Ebene auf das Raster (Original-Stücke)
rep("    const T1 = performance.now(), mid = 69 + 12 * Math.log2(Math.max(1, +m.f || 440) / 440)", "    if (m.s12g) gainA(d, m.s12g, A, ca, nc, R, I);   // Prüfung: „Alle Ebenen abtasten“ aus → Anteil der Ebene\n    const T1 = performance.now(), mid = 69 + 12 * Math.log2(Math.max(1, +m.f || 440) / 440)")
open(P, 'w', encoding='utf-8').write(s)
print('ok')
