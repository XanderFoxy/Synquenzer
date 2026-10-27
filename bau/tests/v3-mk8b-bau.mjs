// MK8b build: recipes (v3-mk8b-rezepte.mjs) + calibration (v3-mk8b-cal.json: levels) -> the 128 programs of the collection
// „Kompakt“ (8 genres x 16), the same generator and encoder as MK8 (v3-mk8-bau.mjs: changed fields against INIT as varints,
// one Base64 part per genre with a salt byte against brand words, B.6 Nr. 9), inserted between /*MKK{*/ and /*}MKK*/.
// Usage: node v3-mk8b-bau.mjs <index.html> [--write]
import fs from 'fs';
import path from 'path';
import {loadSQMK} from './v3-mk8-sqmk.mjs';
import {KOMPAKT} from './v3-mk8b-rezepte.mjs';
const DIR = path.dirname(new URL(import.meta.url).pathname);
export const CAL_FILE = DIR + '/v3-mk8b-cal.json';
const isObj = x => x && typeof x === 'object' && !Array.isArray(x);
function merge(dst, src) {
  for (const k in src) {
    const v = src[k];
    if (k === 'p' && Array.isArray(v)) { v.forEach((x, i) => { dst.p[i] = {s: x[0], d: x[1], i: x[2]}; }); continue; }
    if (isObj(v) && isObj(dst[k])) merge(dst[k], v); else dst[k] = JSON.parse(JSON.stringify(v));
  }
  return dst;
}
export const kid = (g, s) => 'f-mk-k' + g + String(s).padStart(2, '0');
export function programs(file, cal) {
  const SQ = loadSQMK(file); cal = cal || (fs.existsSync(CAL_FILE) ? JSON.parse(fs.readFileSync(CAL_FILE, 'utf8')) : {});
  const out = [];
  KOMPAKT.forEach((genre, gi) => genre.forEach((r, si) => {
    const g = gi + 1, s = si + 1, id = kid(g, s), pm = SQ.init();
    for (const k of ['mode', 'tv', 'split', 'scale', 'skey']) if (r[k] != null) pm[k] = r[k];
    for (const k of ['mfx', 'dly', 'eq', 'arp', 'voc']) if (r[k]) merge(pm[k], r[k]);
    (r.t || []).forEach((t, k) => merge(pm.t[k], t));
    if (!r.t || r.t.length < 2) pm.t[1] = JSON.parse(JSON.stringify(SQ.init().t[1]));
    const c = cal[id] || {};
    // calibration as MK8: below 0 dB the AMP levels (voc.lvl), above 0 dB a flat EQ lift (both shelves at 1000 Hz), at most +12 dB
    if (c.g != null) {
      if (pm.mode === 3) pm.voc.lvl = Math.max(1, Math.min(127, Math.round(127 * Math.pow(10, Math.min(0, c.g) / 40))));
      else { const mx = Math.max(pm.t[0].a.lvl, pm.mode === 1 || pm.mode === 2 ? pm.t[1].a.lvl : 0) || 1; for (const T of (pm.mode === 1 || pm.mode === 2 ? pm.t : [pm.t[0]])) T.a.lvl = Math.max(1, Math.min(127, Math.round(T.a.lvl / mx * 127 * Math.pow(10, Math.min(0, c.g) / 40)))); }
      const up = Math.min(12, Math.round(Math.max(0, c.g) * 2) / 2);
      if (up > 0) { if (pm.eq.lg === 0 && pm.eq.hg === 0) { pm.eq.lf = 1000; pm.eq.hf = 1000; } pm.eq.lg = Math.min(12, pm.eq.lg + up); pm.eq.hg = Math.min(12, pm.eq.hg + up); }
    }
    out.push({g, s, id, name: r.n, tip: r.i, role: r.r, pm: SQ.normMk(pm), mw: Math.max(0, Math.min(127, r.mw || 0)) / 127, recipe: r});
  }));
  return out;
}
function leaves(SQ) {   // = MKF.leaves() in the app (the decoder of MKK uses it)
  const L = [], init = SQ.init();
  const walk = (o, pre) => { for (const k of Object.keys(o)) { if (!pre && (k === 'v' || k === 'usc' || k === 'vmax')) continue; const v = o[k], p = pre ? pre + '.' + k : k; if (p === 'voc.hold') continue;
    if (Array.isArray(v)) v.forEach((x, i) => (x && typeof x === 'object' ? walk(x, p + '.' + i) : L.push([p + '.' + i, x])));
    else if (v && typeof v === 'object') walk(v, p); else L.push([p, p === 'eq.lg' || p === 'eq.hg' ? v * 2 : v]); } };
  walk(init, '');
  for (let i = 0; i < 16; i++) L.push(['voc.hold.' + i, 0]);
  L.push(['holdOn', 0], ['mw', 0]);
  return L;
}
const get = (o, p) => p.split('.').reduce((x, k) => (x == null ? x : x[k]), o);
function valsOf(LV, pm, mw) {
  return LV.map(([p]) => {
    if (p.startsWith('voc.hold.')) return pm.voc.hold ? pm.voc.hold[+p.slice(9)] : 0;
    if (p === 'holdOn') return pm.voc.hold ? 1 : 0;
    if (p === 'mw') return Math.round(mw * 127);
    const v = get(pm, p); return p === 'eq.lg' || p === 'eq.hg' ? Math.round(v * 2) : v;
  });
}
const varint = (a, v) => { do { let x = v & 127; v = Math.floor(v / 128); if (v) x |= 128; a.push(x); } while (v); };
export const BRAND = /korg|micro ?korg|ms[ -]?2000|radias|dwgs|dw[ -]?[68]000|\bvox\b/i;
export function encode(file, progs) {
  const SQ = loadSQMK(file), LV = leaves(SQ), B = [], N = [], T = [], R = [], sizes = [];
  for (let g = 1; g <= 8; g++) {
    const raw = [], P = progs.filter(x => x.g === g).sort((a, b) => a.s - b.s);
    for (const p of P) {
      const v = valsOf(LV, p.pm, p.mw), d = [];
      v.forEach((x, i) => { if (x !== LV[i][1]) d.push([i, x - LV[i][1]]); });
      varint(raw, d.length); let prev = -1;
      for (const [i, dv] of d) { varint(raw, i - prev - 1); prev = i; varint(raw, dv < 0 ? -2 * dv - 1 : 2 * dv); }
    }
    let salt = 0x3c, b64;
    for (let k = 0; k < 256; k++, salt = (salt + 37) & 255) { b64 = Buffer.from([salt].concat(raw.map(x => x ^ salt))).toString('base64'); if (!BRAND.test(b64)) break; }
    B.push(b64); sizes.push(raw.length);
    N.push(P.map(x => x.name).join('|')); R.push(P.map(x => x.role).join('|')); T.push(P.map(x => x.tip));
  }
  return {B, N, T, R, sizes};
}
export function blockText(enc) {
  return 'const SQ_MK_KOMPAKT = {v: 1,\n  B: [' + enc.B.map(x => "'" + x + "'").join(',\n    ') + '],\n  N: [' + enc.N.map(x => JSON.stringify(x)).join(',\n    ') +
    '],\n  R: [' + enc.R.map(x => JSON.stringify(x)).join(',\n    ') +
    '],\n  T: [' + enc.T.map(a => '[' + a.map(x => JSON.stringify(x)).join(',\n      ') + ']').join(',\n    ') + ']};\n';
}
export function inject(file, text) {
  const s = fs.readFileSync(file, 'utf8'), a = s.indexOf('/*MKK{*/'), b = s.indexOf('/*}MKK*/');
  if (a < 0 || b < a) throw new Error('MKK markers missing');
  fs.writeFileSync(file, s.slice(0, a + 8) + '\n' + text + s.slice(b));
}
if (process.argv[1] && process.argv[1].endsWith('v3-mk8b-bau.mjs')) {
  const file = path.resolve(process.argv[2]);
  const progs = programs(file), enc = encode(file, progs), txt = blockText(enc);
  console.log('programs', progs.length, 'raw bytes per genre', enc.sizes.join(' '), 'total raw', enc.sizes.reduce((a, b) => a + b, 0), 'block', Buffer.byteLength(txt), 'B64', enc.B.reduce((a, b) => a + b.length, 0));
  if (process.argv.includes('--write')) { inject(file, txt); console.log('written'); }
}
