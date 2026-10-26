// QA MK5 regression: AM engine offline render with arp OFF, base vs new must be bit-identical (several patches)
import { open, APP } from './v3-qa-mk5reg-pw.mjs';
import crypto from 'crypto';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk5-base-4.12.0.html';
const out = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  out[name] = await p.evaluate(async () => { const Q = window.SYNQUENZER; const sl = ms => new Promise(r => setTimeout(r, ms));
    Q.newProject({init: true}); Q.setEngine(0, 'mk'); await sl(600);
    const base = Q.getSound(0); const res = {};
    const ev = [[0.05, 'on', 60, .8], [0.30, 'on', 64, .7], [0.55, 'on', 67, .9], [0.9, 'off', 60], [1.0, 'off', 64], [1.05, 'off', 67], [1.3, 'on', 62, .8], [1.32, 'on', 65, .8], [1.8, 'off', 62], [1.85, 'off', 65], [2.1, 'on', 72, .6], [2.4, 'off', 72]];
    const variants = {
      init: m => m,
      lfoTimbre: m => { m.t[0].l1.ks = 1; m.t[0].l1.w = 0; m.t[0].l1.f = 90; m.t[0].p[0] = {s: 4, d: 0, i: 40}; return m; },
      dual: m => { m.mode = 1; return m; },
      split: m => { m.mode = 2; m.split = 63; return m; },
      fx: m => { m.dly.dep = 60; m.mfx.dep = 50; return m; },
    };
    for (const [k, f] of Object.entries(variants)) {
      const s = JSON.parse(JSON.stringify(base)); try { f(s.p.mk); } catch (e) { res[k] = 'mutfail ' + e; continue; }
      try { const r = await Q.mkRender(s, ev, {sec: 3}); let e2 = 0; for (let i = 0; i < r.l.length; i++) e2 += r.l[i] * r.l[i];
        res[k] = {rms: Math.sqrt(e2 / r.l.length).toFixed(6), bytes: Array.from(new Uint8Array(r.l.buffer)).join(',').length, hashSrc: Array.from(new Uint8Array(r.l.buffer.slice(0))).reduce((h, x) => (h * 31 + x) >>> 0, 7) + '/' + Array.from(new Uint8Array(r.r.buffer.slice(0))).reduce((h, x) => (h * 31 + x) >>> 0, 7)}; }
      catch (e) { res[k] = 'renderfail ' + String(e).slice(0, 200); }
    }
    return res; });
  out[name].errs = errs; await b.close();
}
for (const k of Object.keys(out.new)) console.log(k, JSON.stringify(out.base[k]) === JSON.stringify(out.new[k]) ? 'same' : 'DIFF', JSON.stringify(out.new[k]), '| base', JSON.stringify(out.base[k]));
