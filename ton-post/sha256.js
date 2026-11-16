// Ton-Post – sha256.js: SHA-256 stückweise (FIPS 180-4). Eigene Umsetzung, kein DOM; läuft im Worker und in Node.
const K = new Int32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);

export class Sha256 {
  constructor() {
    this.h = new Int32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
    this.w = new Int32Array(64); this.rest = new Uint8Array(64); this.restN = 0; this.laenge = 0;
  }
  // 64-Byte-Blöcke ab o (Anzahl n) verarbeiten
  bloecke(u, o, n) {
    const w = this.w, h = this.h;
    let h0 = h[0], h1 = h[1], h2 = h[2], h3 = h[3], h4 = h[4], h5 = h[5], h6 = h[6], h7 = h[7];
    for (let b = 0; b < n; b++, o += 64) {
      for (let i = 0; i < 16; i++) { const p = o + i * 4; w[i] = (u[p] << 24) | (u[p + 1] << 16) | (u[p + 2] << 8) | u[p + 3]; }
      for (let i = 16; i < 64; i++) {
        const x = w[i - 15], y = w[i - 2];
        const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
        const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      let a = h0, bb = h1, c = h2, d = h3, e = h4, f = h5, g = h6, hh = h7;
      for (let i = 0; i < 64; i++) {
        const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        const t1 = (hh + S1 + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
        const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        const t2 = (S0 + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
        hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + bb) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
      h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + hh) | 0;
    }
    h[0] = h0; h[1] = h1; h[2] = h2; h[3] = h3; h[4] = h4; h[5] = h5; h[6] = h6; h[7] = h7;
  }
  update(u) {
    let o = 0, n = u.length; this.laenge += n;
    if (this.restN) {
      const k = Math.min(64 - this.restN, n); this.rest.set(u.subarray(0, k), this.restN); this.restN += k; o = k; n -= k;
      if (this.restN < 64) return this;
      this.bloecke(this.rest, 0, 1); this.restN = 0;
    }
    const voll = n >> 6;
    if (voll) this.bloecke(u, o, voll);
    o += voll * 64; n -= voll * 64;
    if (n) { this.rest.set(u.subarray(o, o + n), 0); this.restN = n; }
    return this;
  }
  hex() {
    const bits = this.laenge * 8, p = new Uint8Array(((this.restN + 9 + 63) >> 6) * 64);
    p.set(this.rest.subarray(0, this.restN)); p[this.restN] = 0x80;
    const hi = Math.floor(bits / 4294967296), lo = bits >>> 0, e = p.length;
    p[e - 8] = hi >>> 24; p[e - 7] = hi >>> 16; p[e - 6] = hi >>> 8; p[e - 5] = hi;
    p[e - 4] = lo >>> 24; p[e - 3] = lo >>> 16; p[e - 2] = lo >>> 8; p[e - 1] = lo;
    this.bloecke(p, 0, p.length >> 6);
    let s = ''; for (const x of this.h) s += (x >>> 0).toString(16).padStart(8, '0');
    return s;
  }
}
