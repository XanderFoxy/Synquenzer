// Mischpult 0.1 – mix.js: Spur-Prozessor (KONZEPT C.7), Raum-Bus (eigenes FDN), Summen Voll und Instrumental.
// Glieder je Spur, in dieser Reihenfolge (alles in der DAW nachbaubar, zwei Ausnahmen „näherungsweise“):
//   Low Cut 12 dB/Okt → 4 EQ-Bänder → dynamischer EQ (Gesang löst aus) → Ducking < 150 Hz (Kick löst aus) → Kompressor → Pegel → Send.
// Kompressor: Logik wie `class Track` (Synquenzer 4.76.1, index.html 66420–66470: stereo-gekoppelt, weiches Knie, keine Latenz), eigene Umsetzung.
// Alle Glieder tragen ihren Zustand von Stück zu Stück und hängen nur von der absoluten Probe ab → Stücke = Ganzes (T5).
import { Bq2, Bq1, bqKoeff, lin, pdb } from './messen.js';
import { GESANG } from './analyse.js';

const LN10_20 = Math.LN10 / 20;

export class Spur {
  /** new Spur(sr, planSpur, plan) – plan liefert kick.zeiten, vocalTor, torSchritt */
  constructor(sr, ps, plan = {}) {
    this.sr = sr; this.ps = ps; this.aus = !!ps.solassen; this.gesang = GESANG.has(ps.rolle);
    if (this.aus) return;
    this.f = [];
    if (ps.lowCutHz && ps.lowCutHz > 20.5) this.f.push(new Bq2(bqKoeff('hp', ps.lowCutHz, sr, Math.SQRT1_2)));
    for (const e of ps.eq || []) this.f.push(new Bq2(bqKoeff(e.typ, e.hz, sr, e.q, e.db)));
    if (ps.dynEq && plan.vocalTor) {
      const d = ps.dynEq; this.dyn = { bp: new Bq2(bqKoeff('bp', d.hz, sr, d.q)), ziel: lin(d.db) - 1, c: 0, aA: Math.exp(-1 / (d.attackMs * 1e-3 * sr)), aR: Math.exp(-1 / (d.releaseMs * 1e-3 * sr)), tor: plan.vocalTor, schritt: plan.torSchritt };
    }
    if (ps.ducking && plan.kick && plan.kick.zeiten.length) {
      const d = ps.ducking, k1 = bqKoeff('lp', d.unterHz, sr), k2 = bqKoeff('hp', d.unterHz, sr);
      this.duck = { lp: [new Bq2(k1), new Bq2(k1)], hp: [new Bq2(k2), new Bq2(k2)], z: plan.kick.zeiten, j: 0, tiefe: d.tiefeDb, vor: Math.round(d.vorlaufMs * 1e-3 * sr), att: Math.max(1, Math.round(d.attackMs * 1e-3 * sr)), hold: Math.round(d.holdMs * 1e-3 * sr), tau: d.releaseMs * 1e-3 * sr };   // Release = Zeitkonstante der Rückkehr (wie beim Kompressor)
    }
    if (ps.komp) { const k = ps.komp; this.komp = { T: k.threshDb, Rr: k.ratio, W: k.knieDb, aA: Math.exp(-1 / (k.attackMs * 1e-3 * sr)), aR: Math.exp(-1 / (k.releaseMs * 1e-3 * sr)), y1: 0, y: 0 }; }
    this.gainDb = (ps.pegelDb || 0) + (ps.komp ? ps.komp.makeupDb : 0);
    this.gain = lin(this.gainDb);
    this.send = ps.sendDb != null ? lin(ps.sendDb) : 0;
    this.t1 = null;
  }
  _tmp(n) { if (!this.t1 || this.t1.length < n) { this.t1 = new Float32Array(n); this.t2 = new Float32Array(n); this.t3 = new Float32Array(n); this.t4 = new Float32Array(n); } }
  /** process(L, R, pos[, n]) – an Ort und Stelle; pos = absolute Probe des Stückanfangs. */
  process(L, R, pos, n = L.length) {
    if (this.aus) return;
    for (const f of this.f) f.run(L, R, n);
    if (this.dyn) {
      const d = this.dyn; this._tmp(n); const bl = this.t1, br = this.t2; bl.set(L.subarray(0, n)); br.set(R.subarray(0, n)); d.bp.run(bl, br, n);
      let c = d.c; const tor = d.tor, sch = d.schritt, z = d.ziel;
      for (let i = 0; i < n; i++) {
        const j = ((pos + i) / sch) | 0, g = j < tor.length && tor[j] ? z : 0;
        c = g < c ? d.aA * c + (1 - d.aA) * g : d.aR * c + (1 - d.aR) * g;
        L[i] += c * bl[i]; R[i] += c * br[i];
      }
      d.c = c;
    }
    if (this.duck) {
      const d = this.duck; this._tmp(n); const lL = this.t1, lR = this.t2, hL = this.t3, hR = this.t4;
      lL.set(L.subarray(0, n)); lR.set(R.subarray(0, n)); hL.set(L.subarray(0, n)); hR.set(R.subarray(0, n));
      d.lp[0].run(lL, lR, n); d.lp[1].run(lL, lR, n); d.hp[0].run(hL, hR, n); d.hp[1].run(hL, hR, n);
      const z = d.z;
      for (let i = 0; i < n; i++) {
        const t = pos + i;
        while (d.j + 1 < z.length && z[d.j + 1] - d.vor <= t) d.j++;
        let r = 0;
        for (let q = Math.max(0, d.j - 1); q <= d.j; q++) {
          const s = z[q] - d.vor, u = t - s; if (u < 0) continue;
          const v = u < d.att ? d.tiefe * u / d.att : u < d.att + d.hold ? d.tiefe : d.tiefe * Math.exp(-(u - d.att - d.hold) / d.tau);
          if (v > r) r = v;
        }
        const g = r > 1e-4 ? Math.exp(-r * LN10_20) : 1;
        L[i] = lL[i] * g + hL[i]; R[i] = lR[i] * g + hR[i];
      }
    }
    if (this.komp) {
      // Pegel-Detektor: Spitze mit Release (entkoppelt, linear) → Attack-Glättung → Kennlinie mit weichem Knie (methodik mix.kompression.aufbau)
      const k = this.komp, T = k.T, W = k.W, sl = 1 / k.Rr - 1, aA = k.aA, aR = k.aR; let y1 = k.y1, y = k.y;
      for (let i = 0; i < n; i++) {
        const a = Math.max(Math.abs(L[i]), Math.abs(R[i]));
        y1 = a > aR * y1 ? a : aR * y1; y = aA * y + (1 - aA) * y1;
        const o = 20 * Math.log10(y + 1e-12) - T;
        const gc = 2 * o < -W ? 0 : 2 * Math.abs(o) <= W ? sl * (o + W / 2) * (o + W / 2) / (2 * W) : sl * o;
        const g = Math.exp((gc + this.gainDb) * LN10_20); L[i] *= g; R[i] *= g;
      }
      k.y1 = y1; k.y = y;
    } else if (this.gain !== 1) { const g = this.gain; for (let i = 0; i < n; i++) { L[i] *= g; R[i] *= g; } }
  }
}

// ---------- Raum: FDN mit 8 Leitungen (methodik leistung.hall), Rückweg Hochpass 200 Hz / Tiefpass 5 kHz ----------
const FDN_MS = [29.7, 37.1, 41.1, 43.7, 53.3, 59.9, 67.7, 73.1];
export class Raum {
  /** new Raum(sr, {rt60S, predelayMs, tpHz}) */
  constructor(sr, { rt60S = 1.2, predelayMs = 30, tpHz = 5000 } = {}) {
    this.sr = sr; this.len = FDN_MS.map(ms => Math.round(ms * 1e-3 * sr));
    this.buf = this.len.map(l => new Float64Array(l)); this.idx = new Int32Array(8);
    this.g = this.len.map(l => Math.pow(10, -3 * l / (rt60S * sr)));
    this.damp = new Float64Array(8); this.dk = 0.25;
    this.pd = Math.max(1, Math.round(predelayMs * 1e-3 * sr)); this.pbuf = new Float64Array(this.pd); this.pi = 0;
    this.hp = new Bq1(bqKoeff('hp', 200, sr)); this.lp = new Bq1(bqKoeff('lp', tpHz, sr));
    this.y = new Float64Array(8);
  }
  /** Eingang (Stereo, Summe der Sends) → Ausgang addiert auf oL/oR. */
  process(iL, iR, oL, oR, n) {
    const y = this.y, buf = this.buf, len = this.len, idx = this.idx, g = this.g, damp = this.damp, dk = this.dk;
    for (let i = 0; i < n; i++) {
      let x = 0.5 * (iL[i] + iR[i]);
      const p = this.pbuf[this.pi]; this.pbuf[this.pi] = x; this.pi = (this.pi + 1) % this.pd; x = this.lp.x(this.hp.x(p));
      let s = 0;
      for (let k = 0; k < 8; k++) { const v = buf[k][idx[k]]; damp[k] += dk * (v - damp[k]); y[k] = damp[k]; s += y[k]; }
      s *= 0.25; // Householder: y − 2/N Σy
      let l = 0, r = 0;
      for (let k = 0; k < 8; k++) { const w = (y[k] - s) * g[k] + x; buf[k][idx[k]] = w; idx[k] = idx[k] + 1 === len[k] ? 0 : idx[k] + 1; if (k & 1) r += y[k]; else l += y[k]; }
      oL[i] += 0.5 * l; oR[i] += 0.5 * r;
    }
  }
  /** Energie-Verstärkung (dB) für stationäres Rauschen im Band 200 Hz–5 kHz, einmal gemessen. */
  static kalibrierung(sr, opt) {
    const r = new Raum(sr, opt), n = Math.round(sr * 3), a = new Float32Array(n), b = new Float32Array(n), oL = new Float32Array(n), oR = new Float32Array(n);
    let s = 12345; for (let i = 0; i < n; i++) { s = (s * 1103515245 + 12345) >>> 0; a[i] = b[i] = (s / 4294967296 - 0.5); }
    const hp = new Bq1(bqKoeff('hp', 200, sr)), lp = new Bq1(bqKoeff('lp', opt?.tpHz || 5000, sr)); const fa = Float32Array.from(a, v => lp.x(hp.x(v)));
    r.process(a, b, oL, oR, n); let ei = 0, eo = 0; for (let i = n >> 1; i < n; i++) { ei += fa[i] * fa[i]; eo += 0.5 * (oL[i] * oL[i] + oR[i] * oR[i]); }
    return pdb(eo / ei);
  }
}

/**
 * Mischer für ein Stück: new Mischer(sr, plan) ; .stueck(pos, stuecke[{L,R}], n) → {vL, vR, iL, iR}
 * Voll = alle Spuren + Raum; Instrumental = ohne vocal/chor und ohne deren Raum-Anteil (eigener, gleich gebauter Raum: linear → exakt der Anteil).
 * pre = gemeinsame Pre-Master-Skalierung (methodik 3.9), auf beide Summen.
 */
export class Mischer {
  constructor(sr, plan, { pre = 1, raum = null } = {}) {
    this.sr = sr; this.plan = plan; this.pre = pre;
    this.spuren = plan.spuren.map(ps => new Spur(sr, ps, plan));
    this.mitRaum = plan.spuren.some(ps => ps.sendDb != null);
    if (this.mitRaum) { const o = raum || plan.raum || {}; this.raumV = new Raum(sr, o); this.raumI = new Raum(sr, o); }
    this.puf = null;
  }
  _puf(n) { if (!this.puf || this.puf.vL.length !== n) this.puf = { vL: new Float32Array(n), vR: new Float32Array(n), iL: new Float32Array(n), iR: new Float32Array(n), sVL: new Float32Array(n), sVR: new Float32Array(n), sIL: new Float32Array(n), sIR: new Float32Array(n) }; else for (const k in this.puf) this.puf[k].fill(0); return this.puf; }
  /** stuecke: je Spur {L, R} (werden an Ort und Stelle bearbeitet). */
  stueck(pos, stuecke, n) {
    const p = this._puf(n);
    this.spuren.forEach((sp, k) => {
      if (this.plan.spuren[k].aus) return;
      const { L, R } = stuecke[k]; sp.process(L, R, pos, n);
      for (let i = 0; i < n; i++) { p.vL[i] += L[i]; p.vR[i] += R[i]; }
      if (!sp.gesang) for (let i = 0; i < n; i++) { p.iL[i] += L[i]; p.iR[i] += R[i]; }
      if (sp.send) { const s = sp.send; for (let i = 0; i < n; i++) { p.sVL[i] += s * L[i]; p.sVR[i] += s * R[i]; } if (!sp.gesang) for (let i = 0; i < n; i++) { p.sIL[i] += s * L[i]; p.sIR[i] += s * R[i]; } }
    });
    if (this.mitRaum) { this.raumV.process(p.sVL, p.sVR, p.vL, p.vR, n); this.raumI.process(p.sIL, p.sIR, p.iL, p.iR, n); }
    if (this.pre !== 1) { const g = this.pre; for (let i = 0; i < n; i++) { p.vL[i] *= g; p.vR[i] *= g; p.iL[i] *= g; p.iR[i] *= g; } }
    return { vL: p.vL, vR: p.vR, iL: p.iL, iR: p.iR };
  }
}

/** Send-Pegel so wählen, dass der Rückweg etwa zielLu unter der Spur liegt (methodik 3.7). bandAnteilDb: Anteil der Spur im Band 200 Hz–5 kHz. */
export function sendDbFuer(zielLu, raumGewinnDb, bandAnteilDb) { return zielLu - raumGewinnDb - bandAnteilDb; }
