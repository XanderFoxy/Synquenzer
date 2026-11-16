# NST1W – Worklet-Teil (von apply.py ausgeführt; L, after, before kommen von dort)
# Mono/Legato: ein neuer Wellen-Wert (o1w/o2w/o3w) an einer klingenden Stimme wechselt bei Pegel 0 (96 Samples aus, 96 ein).
W_BLOCK = r'''  /* NST1W-BEGIN (Paket NST1, Worklet-Teil): Mono/Legato - ein neuer Wellen-Wert (Je Note weiterschalten, Noten-Lock der Welle) an einer
     klingenden Stimme sprang hart (Messung: Spitze 17,7 x der Sinus-Steigung). Jetzt: die Stimme blendet 6 Steuer-Bloecke (96 Samples) aus,
     die Welle wechselt bei Pegel 0, 6 Bloecke wieder ein - wie der XF-Dip des Kerns. Nur Zahlen an der Stimme, keine Zuweisung im Audio-Faden;
     ohne Wellen-Wechsel laeuft keine Zeile hiervon (Haken monoOn: n1Hold, Haken control: if (v.n1d) n1Blk). */
  n1Hold(v, e) {
    if (!(e.length > 9) || !v.pv || !v.VP || v.fade) return;
    const n = Math.min(16, e[8] | 0), cur = v.D ? v.VP : this.lbP ? this.PR : this.P;
    let any = false;
    for (let j = 0; j < n; j++) {
      const p = e[9 + 2 * j]; if (p !== 0 && p !== 1 && p !== 2) continue;
      const x = e[10 + 2 * j], c = cur[PVA[p]];
      if (!(x === x) || x === c) continue;
      if (p === 0) v.n1w0 = x; else if (p === 1) v.n1w1 = x; else v.n1w2 = x;
      v.n1m = (v.n1m | 0) | (1 << p); e[10 + 2 * j] = c; any = true;   // jetzt die alte Welle, die neue kommt bei Pegel 0
    }
    if (any) { if (!(v.n1d > 0 && v.n1d <= 6)) v.n1d = 1; v.n1id = v.id; }
  }
  n1Blk(v) {
    if (v.id !== v.n1id || !v.on) { v.n1d = 0; v.n1m = 0; return; }
    const d = v.n1d;
    if (d <= 6) { v.vgain *= 1 - d / 6; v.n1d = d + 1; return; }      // aus: Ende des 6. Blocks = 0
    if (d === 7 && v.n1m && v.VP && v.Dv) {                            // unten: die gehaltene Welle
      const m = v.n1m; v.n1m = 0;
      for (let p = 0; p < 3; p++) if (m & (1 << p)) { const x = p === 0 ? v.n1w0 : p === 1 ? v.n1w1 : v.n1w2; if (v.pv[p] !== v.pv[p]) v.lkN++; v.pv[p] = x; v.VP[PVA[p]] = x; }
      this.deriveInto(v.Dv, v.VP); v.D = v.Dv; this.lkOn = true;
    }
    const u = d - 6; v.vgain *= u / 6; v.n1d = u >= 6 ? 0 : d + 1;   // ein
  }
  /* NST1W-END */'''
before("  // I2c: a lane value at place p (NaN = back to the base), ramp r samples (class b / r; class n takes effect at the next note)", '@@W@@')
i = L.index('  @@W@@') if '  @@W@@' in L else L.index('@@W@@')
L[i:i + 1] = W_BLOCK.split('\n')
before("    if (this.lkOn || this.lkEv) this.lkLegato(v, this.lkEv);   // I2b: neue Lock-Werte gleiten in 5 ms",
       "if (this.lkEv && v.aOut > 1e-3) this.n1Hold(v, this.lkEv);   /* NST1W: neue Welle erst bei Pegel 0 */")
after("      v.vgain = VP.level * vg * Math.max(0, 1 + dst[D_AMP]);",
      "      if (v.n1d) this.n1Blk(v);   /* NST1W */")
