import {render, mkPatch} from './v3-mk1-node.mjs';
import {db, rms, mKlick, mEinbruch} from './v3-mk1-ana.mjs';
const SR = 48000, M = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;
const cases = JSON.parse(process.argv[2]);
for (const [name, p, path, v, notes] of cases) {
  for (const n of notes) {
    const ev = (Array.isArray(n) ? n : [n]).map(k => [0, 'on', k, .8]);
    const r = render(mkPatch(p), ev, {sec: 1.2, mw0: 1, at: [[.6, {mkSet: {[path]: v}}]]});
    const r0 = render(mkPatch(p), ev, {sec: 1.2, mw0: 1});
    const k = mKlick(r.l, SR, [0]), k0 = mKlick(r0.l, SR, [0]);
    const pre = rms(r.l, Math.round(.5 * SR), Math.round(.6 * SR)), post = rms(r.l, Math.round(.62 * SR), Math.round(.72 * SR));
    console.log(name, path, '->', v, 'notes', JSON.stringify(n), '| M-KLICK', M(k.worst), '@', M(k.at, 3), '(without switch', M(k0.worst), ') | M-EINBRUCH', M(mEinbruch(r.l, SR, .6).worst, 2), '| level step', M(db(post / pre)), 'dB');
  }
}
