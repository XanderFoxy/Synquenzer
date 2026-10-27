import {open} from './v3-vs3-h.mjs';
import * as T from '../vs-dsp/test-signals.mjs';
import {clean, srcText} from '../vs-dsp/clean.mjs';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-br-VS4/index.html';
const sr = 48000, b64 = x => Buffer.from(new Float32Array(x).buffer).toString('base64'), unb64 = s => { const b = Buffer.from(s, 'base64'); return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4); };
const S = T.song(sr, 6, {seed: 9}), ref = T.playback(sr, 6, {seed: 10}), mic = new Float32Array(S.x.length); const e = T.convolve(T.hp1(ref, sr, 250), T.roomIR(sr, 0.08, 0.3, {seed: 11}));
for (let i = 0; i < mic.length; i++) mic[i] = S.x[i] + 0.5 * e[i];
const H = await open({file: APP}), p = H.p;
const w = unb64((await p.evaluate(([m, r]) => SYNQUENZER.clCore(m, r, 48000, {way: 'notes'}), [b64(mic), b64(ref)])).y);
const mod = await p.evaluate(([src, m, r]) => { const dec = b => { const s = atob(b), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return new Float32Array(u.buffer); }; const api = (0, eval)(src); const y = api.clean(dec(m), dec(r), 48000, {way: 'notes'}); const u = new Uint8Array(y.buffer); let s = ''; for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); }, [srcText(), b64(mic), b64(ref)]);
const pm = unb64(mod), nd = clean(mic, ref, sr, {way: 'notes'});
let d1 = 0, d2 = 0; for (let i = 0; i < nd.length; i++) { d1 = Math.max(d1, Math.abs(w[i] - pm[i])); d2 = Math.max(d2, Math.abs(pm[i] - nd[i])); }
console.log('worker vs page-module', d1, 'page-module vs node', d2);
await H.br.close();
