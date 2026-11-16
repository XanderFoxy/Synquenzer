import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
a = s.index('/* FOKUS1-BEGIN'); z = s.index('/* FOKUS1-END */')
blk = s[a:z]
def rep(old, new, cnt=1):
    global blk
    c = blk.count(old)
    assert c == cnt, (c, old[:80])
    blk = blk.replace(old, new)

# 1) Kosten-Schätzung + Kalibrierung (vor piece)
rep("""  // ein Stück: Quelle (Original-Bytes) → Fokus-Bytes; Energie (Leistung je Byte) vorher/nachher
  function piece(""", """  /* FOK3: Kosten-Schätzung des genauen Satzes (ohne zu rechnen) für Stücke from…to, die nicht im Zwischenspeicher liegen: Rest-Audio-Blöcke, die
     für Spalten mit Ebenen-Wirkung fehlen (Masken-Streifen à 128 Basis-Rahmen mit Inhalt; Ebenen mit neuem id:ver → ihre Streifen alt ∪ neu gelten
     als neu), und FFT-Spalten ohne gültiges Rest-Bild (RS.tr). Kosten je Block / je Spalte werden beim Rechnen laufend gemessen (FK3.cB, FK3.cC,
     Startwerte aus der FOK2-Messung). Rückgabe {ms, sec (Rest-Audio-Dauer, die neu zu rechnen ist), blk, col}. */
  const FK3 = {cB: 7, cC: 0.068, lx: new Map()};
  const fk3Strips = (d, l) => {
    const k = l.id + ':' + l.ver + ':' + inst(d); let s = FK3.lx.get(k); if (s) return s; s = []; const M = d.masks && d.masks.get(l.id);
    if (M) for (const [i, st] of M) if (st && st.h && st.h.some(h => h)) s.push(+i);
    FK3.lx.set(k, s); while (FK3.lx.size > 64) FK3.lx.delete(FK3.lx.keys().next().value); return s;
  };
  function fk3Est(d, I, from, to, inC) {
    const z = {ms: 0, sec: 0, blk: 0, col: 0}; if (!FK2 || !d.meta.layers.length || !d.mid || d.mid.length < 2) return z;
    const n = d.meta.n, hb = d.meta.base.hop, Nb = d.meta.base.N, BL = X.BLK || 16384, N = I.N, hop = I.hop, mg = N / 2 + 2 * hb + Nb;
    const base = d.meta.id + '#' + inst(d) + '#' + n, ok0 = !!(RS.mid && RS.done && RS.base === base && RS.mid.length === n), cur = new Map(), all = new Set();
    for (const l of d.meta.layers) { const s = fk3Strips(d, l); cur.set(l.id + ':' + l.ver, s); for (const v of s) all.add(v); }
    let dirty = null;   // null = alles neu (kein Rest-Audio dieses Dokuments im Speicher)
    if (ok0) { dirty = new Set(); if (RS.key !== rsKey(d)) { const old = RS.lx || new Map(); for (const [k, s] of cur) if (!old.has(k)) for (const v of s) dirty.add(v); for (const [k, s] of old) if (!cur.has(k)) for (const v of s) dirty.add(v); } }
    const sp = [...all].sort((p, q) => p - q), bs = new Set(), dz = s => dirty === null || dirty.has(s) || dirty.has(s - 1) || dirty.has(s + 1);
    for (let ci = from; ci < to; ci++) {
      if (inC(ci)) continue;
      const W = Math.min(1024, I.cols - ci * 1024), pa = ci * 1024 * hop - N / 2 - hb, pb = (ci * 1024 + W) * hop + N / 2 + hb;
      let pc = 0, pd = false;
      for (const s of sp) {
        const sa = Math.max(0, (s * 128 - 1) * hb), sb = Math.min(n, (s * 128 + 128) * hb + Nb), a = Math.max(pa, sa - mg), b = Math.min(pb, sb + mg); if (b <= a) continue;
        pc += (b - a) / hop; const ds = dz(s); if (ds) pd = true;
        for (let k = Math.max(0, Math.floor(a / BL)); k <= Math.floor(Math.max(0, b - 1) / BL); k++) if (ds || !RS.done[k]) bs.add(k);
      }
      if (!pc) continue;
      if (pd || !ok0 || !RS.tr.has(RS.base + ':' + N + ':' + hop + ':' + ci + ':' + W)) z.col += Math.min(W, pc);
    }
    z.blk = bs.size; z.sec = bs.size * BL / d.meta.sr; z.ms = z.blk * FK3.cB + z.col * FK3.cC * Math.pow(N / 4096, 1.4);
    return z;
  }
  // ein Stück: Quelle (Original-Bytes) → Fokus-Bytes; Energie (Leistung je Byte) vorher/nachher
  function piece(""")

# 2) Kalibrierung FFT-Spalten in trueRest
rep("""      tY = performance.now();
      for (let cc = c; cc <= c1; cc += 2) {
        const sA = (x0 + cc) * hop - N / 2, two = cc + 1 <= c1;""", """      tY = performance.now(); let tF = 0, nF = 0;   /* FOK3: Zeit je Spalte messen (Schätzung) */
      for (let cc = c; cc <= c1; cc += 2) {
        const sA = (x0 + cc) * hop - N / 2, two = cc + 1 <= c1, t1 = performance.now();""")
rep("""        col(m1, cc); if (two) col(m2, cc + 1);
        if (performance.now() - tY > 20) { await X.tick(); if (!ok()) return false; tY = performance.now(); }
      }
      c = c1 + 1;""", """        col(m1, cc); if (two) col(m2, cc + 1); tF += performance.now() - t1; nF += two ? 2 : 1;
        if (performance.now() - tY > 20) { await X.tick(); if (!ok()) return false; tY = performance.now(); }
      }
      if (nF >= 64) FK3.cC = Math.max(0.01, Math.min(2, 0.7 * FK3.cC + 0.3 * tF / nF / Math.pow(N / 4096, 1.4)));   /* FOK3 */
      c = c1 + 1;""")

# 3) ops.fokus: vorab (Näherung zuerst, wenn der genaue Satz teuer ist)
rep("""    let eO = 0, eR = 0, n = 0, neu = 0, stop = '';
    for (let ci = from; ci < to; ci++) {""", """    let eO = 0, eR = 0, n = 0, neu = 0, stop = '', vb = false, est = null;
    /* FOK3: m.vorab (nur „Nur Rest“): ist der genaue Satz für from…to teuer (geschätzt > 300 ms oder > 60 s Rest-Audio neu), kommt je Stück sofort die
       Näherung (Masken-Weg wie 4.72–4.75, ap: 1, NICHT im Zwischenspeicher – Zauberstab und „Noten finden“ bleiben genau); das genaue Stück holt die
       Anzeige danach einzeln ab (gleicher Rechenweg wie FOK2 → byte-gleich). Sonst direkt genau wie FOK2. */
    if (m.vorab && o.mode === 'rest') { est = fk3Est(d, I, from, to, ci => C.has('spk:' + d.meta.id + ':fk:' + H + ':v' + N + ':' + ci)); vb = est.ms > 300 || est.sec > 60; }
    for (let ci = from; ci < to; ci++) {""")
rep("""        const src = have && have.byteLength === I.rows * W ? new Uint8Array(have) : X.specChunk(d, N, ci).data;
        const TR = o.mode === 'rest' ? await trueRest(d, I, ci, W, src, same) : null;   /* FOK2: genauer Rest, wo Ebenen wirken */
        if (TR === false || !same()) { stop = d.fkTok !== tok ? 'abgeloest' : 'geaendert'; break; }
        e = piece(d, I, ci, src, o, gf, NT, TR); neu++; C.set(ck, e); while (C.size > 6) C.delete(C.keys().next().value);
      }""", """        const src = have && have.byteLength === I.rows * W ? new Uint8Array(have) : X.specChunk(d, N, ci).data;
        if (vb) { e = piece(d, I, ci, src, o, gf, NT, null); e.ap = 1; }   /* FOK3: Näherung sofort, nicht gespeichert */
        else {
        const TR = o.mode === 'rest' ? await trueRest(d, I, ci, W, src, same) : null;   /* FOK2: genauer Rest, wo Ebenen wirken */
        if (TR === false || !same()) { stop = d.fkTok !== tok ? 'abgeloest' : 'geaendert'; break; }
        e = piece(d, I, ci, src, o, gf, NT, TR); neu++; C.set(ck, e); while (C.size > 6) C.delete(C.keys().next().value);
        }
      }""")
rep("""data, eO: e.eO, eR: e.eR, key: H, mode: o.mode, cached: hit}}, [data.buffer]); }""", """data, eO: e.eO, eR: e.eR, key: H, mode: o.mode, cached: hit, ap: e.ap ? 1 : 0}}, [data.buffer]); }   /* FOK3: ap */""")
rep("""anteil: eO > 0 ? +(eR / eO).toFixed(4) : 1, stop, ms: +(performance.now() - T0).toFixed(1)};
  };""", """anteil: eO > 0 ? +(eR / eO).toFixed(4) : 1, stop, ms: +(performance.now() - T0).toFixed(1), vorab: vb ? 1 : 0, est: est ? {ms: Math.round(est.ms), sec: +est.sec.toFixed(1), blk: est.blk, col: Math.round(est.col)} : null};   /* FOK3 */
  };""")

# 4) rsSync: Streifen je Ebenen-Stand merken (für die Schätzung), restMid: Zeit je Block messen
rep("""        RS.key = key; RS.base = base; RS.fp = fp;
      })();""", """        RS.key = key; RS.base = base; RS.fp = fp; RS.lx = new Map(d.meta.layers.map(l => [l.id + ':' + l.ver, fk3Strips(d, l)]));   /* FOK3 */
      })();""")
rep("""      const o = k * BL, ch = X.render(mono || d, mx, o, Math.min(n, o + BL)), g = mono ? 32768 : 1 / ch.length;   /* FOK2: Stereo → nur die Mitte rendern */""",
    """      const tB = performance.now(), o = k * BL, ch = X.render(mono || d, mx, o, Math.min(n, o + BL)), g = mono ? 32768 : 1 / ch.length;   /* FOK2: Stereo → nur die Mitte rendern */""")
rep("""      done[k] = 1; nd++;
      const t = performance.now();""", """      done[k] = 1; nd++;
      const t = performance.now(); FK3.cB = Math.max(0.5, Math.min(80, 0.85 * FK3.cB + 0.15 * (t - tB)));   /* FOK3: Zeit je Block (Schätzung) */""")
open(sys.argv[2], 'w', encoding='utf-8').write(s[:a] + blk + s[z:])
print('ok core')
