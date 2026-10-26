// QA regression MK2 (lens regression): bit-equality of offline renders (VA, FM, WT, MK1 sounds, demo sounds) base 4.9.0 vs new 4.10.0
// plus: a 4.9.0-serialized project with an MK1 track imports unchanged into 4.10.0
import { open, APP } from './v3-mk0reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-base-A.html';
const EV = [[0, 'on', 57, .8], [0.3, 'on', 64, .6], [0.6, 'on', 69, 1], [1.2, 'off', 57], [1.3, 'off', 64], [1.5, 'off', 69]];
const collect = async p => p.evaluate(async EV => {
  const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)), out = {};
  const enc = a => { const u = new Uint8Array(a.buffer.slice(0)); let s = ''; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return btoa(s); };
  const R = async (k, snd) => { try { const r = await Q.mkRender(snd, EV, {sec: 2}); out[k] = {l: enc(r.l), r: enc(r.r), snd: JSON.stringify(snd).length}; } catch (e) { out[k] = {err: String(e)}; } };
  await Q.newProject({init: true}); await sl(200);
  await R('va-init', Q.getSound(0));
  await R('va-init-2', Q.getSound(0));
  Q.setEngine(0, 'fm'); await sl(200); await R('fm-init', Q.getSound(0));
  Q.setEngine(0, 'wt'); await sl(200); await R('wt-init', Q.getSound(0));
  Q.setEngine(0, 'mk'); await sl(400); await R('mk-init', Q.getSound(0));
  Q.mkSet(0, 't.0.o1.w', 1); Q.mkSet(0, 't.0.o1.c1', 40); Q.mkSet(0, 't.0.f.cut', 80); Q.mkSet(0, 't.0.f.res', 60); Q.mkSet(0, 't.0.o2.w', 1); Q.mkSet(0, 't.0.o2.semi', 7); Q.mkSet(0, 't.0.mix.o2', 90);
  await R('mk1-pulse', Q.getSound(0));
  Q.mkSet(0, 't.0.o1.w', 2); Q.mkSet(0, 't.0.o2.mod', 1); await R('mk1-tri-ring', Q.getSound(0));
  Q.mkSet(0, 't.0.o1.w', 0); Q.mkSet(0, 't.0.o2.mod', 2); await R('mk1-saw-sync', Q.getSound(0));
  out.mk1json = Q.serialize();
  await Q.loadDemo(); await sl(500);
  for (let i = 0; i < Q.project().tracks.length; i++) { const t = Q.project().tracks[i]; if (t.kind === 'synth') await R('demo-' + i + '-' + t.sound.engine, Q.getSound(i)); }
  return out; }, EV);
const res = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) { const {b, p, errs} = await open({width: 390, height: 844}, file); res[name] = await collect(p); res[name].errs = errs.slice(); await b.close(); }
const dec = s => { const bin = Buffer.from(s, 'base64'); return new Float32Array(bin.buffer, bin.byteOffset, bin.byteLength / 4); };
for (const k of Object.keys(res.new)) {
  if (k === 'errs' || k === 'mk1json') continue;
  const A = res.base[k], B = res.new[k];
  if (!A || !B || A.err || B.err) { console.log(k, 'ERR', A && A.err, B && B.err); continue; }
  let mx = 0, pk = 0; for (const ch of ['l', 'r']) { const a = dec(A[ch]), b = dec(B[ch]); for (let i = 0; i < a.length; i++) { mx = Math.max(mx, Math.abs(a[i] - b[i])); pk = Math.max(pk, Math.abs(b[i])); } }
  console.log(k.padEnd(16), 'max|Δ|', mx.toExponential(2), 'peak', pk.toFixed(3), mx <= 1e-6 ? 'OK' : 'DIFF');
}
// a 4.9.0 project with an MK1 track, imported into 4.10.0
{ const {b, p, errs} = await open({width: 390, height: 844}, APP);
  const r = await p.evaluate(async t => { const Q = window.SYNQUENZER; const ok = Q.importJSON(t); await new Promise(r => setTimeout(r, 400)); const s = Q.getSound(0); const o = JSON.parse(t); const t0 = (o.project || o).tracks ? (o.project || o).tracks[0] : null;
    return {ok, eng: s.engine, same: t0 ? JSON.stringify(t0.sound.p.mk) === JSON.stringify(s.p.mk) : 'n/a', mk: JSON.stringify(s.p.mk.t[0].o1) + JSON.stringify(s.p.mk.t[0].p)}; }, res.base.mk1json);
  console.log('import 4.9.0 MK1 project:', JSON.stringify(r), 'errs', JSON.stringify(errs)); await b.close(); }
console.log('errs base', JSON.stringify(res.base.errs), 'new', JSON.stringify(res.new.errs));
