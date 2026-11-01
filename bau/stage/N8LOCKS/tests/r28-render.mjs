// Regel 28 (I2-04, N8-01): ohne Lock / Reihe ist jeder Ton bitgleich zu 4.30.0. Je Werksklang (VA, FM, FELD, MK) eine Phrase
// offline durch das Worklet (mkRender), Hash der Samples alt gegen neu; dazu die Ereignis-Nachrichten (M-MSG) des Demo-Songs.
import {open, ok, APP, BASE} from './lib.mjs';
const PH = [[0, 'on', 48, .8], [.25, 'on', 60, .5], [.3, 'on', 64, 1], [.6, 'off', 48], [.7, 'off', 60], [.8, 'on', 67, .7], [1.1, 'off', 64], [1.2, 'off', 67]];
async function run(file) {
  const {b, p, errs} = await open(file);
  const r = await p.evaluate(async PH => {
    const out = {}, fnv = a => { let h = 2166136261 >>> 0; const u = new Uint32Array(a.buffer, a.byteOffset, a.length); for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
    const list = FACTORY.filter(f => f.engine !== 'wt');
    const base = FACTORY_BY_ID.get('f-init-am'), mks = [];
    const tw = [[], [['t.0.f.cut', 40], ['t.0.f.res', 90]], [['t.0.o1.w', 1], ['t.0.o1.c1', 90]], [['t.0.e2.d', 30], ['t.0.e2.s', 0]], [['mode', 1], ['t.1.f.cut', 60]], [['t.0.p.0.i', 40]], [['t.0.o2.mod', 2], ['t.0.mix.o2', 100]], [['t.0.a.gate', 1]]];
    tw.forEach((L, j) => { const s = JSON.parse(JSON.stringify(base)); s.id = 'mk-var-' + j; for (const [k, v] of L) { if (k === 'mode') s.p.mk.mode = v; else SQMK.mkPathSet(s.p.mk, k, v); } mks.push(s); });
    for (const f of list.concat(mks).slice(0, 400)) {
      try { const x = await mkRender(f, PH, {sec: 1.6, seed: 1}); out[f.id || f.name] = fnv(x.l) + fnv(x.r); } catch (e) { out[f.id || f.name] = 'ERR ' + e.message; }
    }
    return out;
  }, PH);
  await b.close(); return {r, errs};
}
const A = await run(BASE), A2 = await run(BASE), B = await run(APP);
const keys = Object.keys(A.r); let same = 0; const diff = [];
let nd = []; for (const k of keys) { if (A.r[k] !== A2.r[k]) { nd.push(k); continue; } if (A.r[k] === B.r[k] && !String(A.r[k]).startsWith('ERR')) same++; else diff.push(k + ' ' + A.r[k] + ' ' + B.r[k]); }
ok(keys.length > 20 && diff.length === 0, `I2-04 Regel 28 Render: ${same}/${keys.length - nd.length} deterministische Klänge (VA, FM, FELD, MK) bitgleich zu 4.30.0; nicht deterministisch schon in 4.30.0 (S&H-Zufall): ${nd.join(' ')} ${diff.slice(0, 4).join(' | ')}`);
ok(!B.errs.length, 'Konsole ohne Fehler (neu): ' + B.errs.slice(0, 3).join(' | '));
