import fs from 'fs';
const file = process.argv[2];
const html = fs.readFileSync(file, 'utf8'), a0 = html.indexOf('function vr1Make() {'), a1 = html.indexOf('\nconst VXR1 = {', a0);
const K = new Function(html.slice(a0, a1) + '\nreturn vr1Make;')()();
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/';
const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); } const x = new Float32Array(d.length >> 1); for (let i = 0; i < x.length; i++) x[i] = d.readInt16LE(2 * i) / 32768; return {x, sr}; };
const actRms = x => { const H = 480, e = []; for (let p = 0; p + H <= x.length; p += H) { let s = 0; for (let i = 0; i < H; i++) s += x[p + i] * x[p + i]; e.push(s / H); } e.sort((a, b) => a - b); const t = e.slice(Math.floor(e.length * 0.5)); return Math.sqrt(t.reduce((s, v) => s + v, 0) / t.length); };
const TAU = 2 * Math.PI; let seed = 777; const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const T = {A44: 'imp2rs/vocadito_1@44100.wav', A48: 'imp2rs/vocadito_1@48000.wav', B44: 'dl/vocadito_10.wav', B48: 'imp2rs/vocadito_10@48000.wav', C44: 'dl/vocadito_14.wav', C48: 'imp2rs/vocadito_14@48000.wav'};
let fail = 0, tot = 0; const t0 = Date.now();
for (const k in T) { const {x: v, sr} = wav(RV + T[k]), n = v.length, vr = actRms(v);
  const Fe = K.done(K.feats(v, sr)), h = K.done(K.humFind(v, sr, Fe)); tot++; if (h.on) fail++;
  console.log(k, 'sauber', h.on ? 'FEHLALARM' : 'ok', h.base, h.f0, JSON.stringify(h.rk.slice(0, 8)));
  for (const base of [50, 60, 49.6, 60.3]) for (const eq of [0, 1]) for (const lev of [0.1, 0.0316]) {
    const amp = eq ? [1, 1, 1, 1, 1, 1, 1] : [1, 0.8, 0.6, 0.5, 0.35, 0.25, 0.2], s2 = Math.sqrt(amp.reduce((s, a) => s + a * a / 2, 0)), ph = amp.map(() => rnd() * TAU);
    const x = new Float32Array(n); for (let i = 0; i < n; i++) { let s = 0; for (let q = 1; q <= 7; q++) s += amp[q - 1] * Math.sin(TAU * base * q * i / sr + ph[q - 1]); x[i] = v[i] + s * vr * lev / s2; }
    const Fx = K.done(K.feats(x, sr)), g = K.done(K.humFind(x, sr, Fx)), good = g.on && Math.abs(g.f0 - base) < 0.1; tot++; if (!good) fail++;
    if (!good || process.env.V) console.log(k, base, eq ? 'gleich' : 'fallend', lev === 0.1 ? '-20' : '-30', good ? 'ok' : 'FEHLER', g.f0, JSON.stringify(g.rk.slice(0, 8)));
  } }
console.log('fehler', fail, 'von', tot, (Date.now() - t0) + ' ms');
