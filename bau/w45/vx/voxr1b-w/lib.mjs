import fs from 'fs';
export const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/';
export const SRC = fs.readdirSync(RV).filter(f => /\.wav$/.test(f)).sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')));
export function core(file) { const html = fs.readFileSync(file, 'utf8'), a0 = html.indexOf('function vr1Make() {'), a1 = html.indexOf('\nconst VXR1 = {', a0); return new Function(html.slice(a0, a1) + '\nreturn vr1Make;')()(); }
export const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); }
  const x = new Float32Array(d.length >> 1); for (let i = 0; i < x.length; i++) x[i] = d.readInt16LE(2 * i) / 32767; return {x, sr}; };
export const f0tab = (() => { const f = RV + SRC[0].replace('.wav', '_f0.csv'); return fs.readFileSync(f, 'utf8').trim().split('\n').map(l => l.split(',').map(Number)); })();
export const f0at = t => { let lo = 0, hi = f0tab.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (f0tab[m][0] < t) lo = m + 1; else hi = m; } return f0tab[lo][1]; };
