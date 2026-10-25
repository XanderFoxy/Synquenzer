// V2c′-fix: compare oneScaleMap old (before fix) vs new on random clip pitch sets under real one-scales
import { open } from './v3-v2d-pw.mjs';
const OLD = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-osfix-before.html';
const gen = () => {
  const Q = window.SYNQUENZER, H = Q.harmony; Q.newProject({init: true});
  let seed = 11; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const Zs = []; for (let r0 = 0; r0 < 12; r0++) for (const q of [[0,4,7],[0,3,7],[0,4,7,10],[0,3,7,10],[0,3,6],[0,5,7],[0,2,7],[0,4,8]]) Zs.push(Q.oneScaleOf(H.detectChord(q.map(x => 60 + r0 + x))));
  const res = []; const t0 = performance.now();
  for (let m = 0; m < 20000; m++) {
    const Z = Zs[(rnd() * Zs.length) | 0], n = 2 + ((rnd() * 12) | 0), set = new Set();
    while (set.size < n) set.add(54 + ((rnd() * 20) | 0));
    const P = [...set].sort((a, b) => a - b);
    const items = P.map(p => ({p, q: p, dir: [-1, 0, 1][(rnd() * 3) | 0], dur: [.25, .5, 1, 2][(rnd() * 4) | 0], pass: rnd() < .2}));
    const o = {amt: [1, 1, .5, 0][(rnd() * 4) | 0], pass: rnd() < .3};
    res.push(H.oneScaleMap(items, Z, o).join(",")); (window.__in = window.__in || []).push(JSON.stringify({items, Z, o}));
  }
  return {res, ms: performance.now() - t0, inp: window.__in};
};
const A = await open(undefined, OLD); const ro = await A.p.evaluate(gen); await A.b.close();
const B = await open(); const rn = await B.p.evaluate(gen);
// big clip timing
const big = await B.p.evaluate(() => { const H = window.SYNQUENZER.harmony, Z = [0,2,4,5,7,9,11]; const items = []; for (let p = 36; p < 84; p++) items.push({p, q: p, dir: 1, dur: 1, pass: false});
  const t0 = performance.now(); let o; for (let k = 0; k < 100; k++) o = H.oneScaleMap(items, Z, {}); return {ms: (performance.now() - t0) / 100, distinct: new Set(o).size, n: items.length}; });
await B.b.close();
const st = {n: ro.res.length, same: 0, oldClean: 0, oldCleanChanged: 0, collOld: 0, collNew: 0, worse: 0, flipNew: 0};
const ex = [];
for (let k = 0; k < ro.res.length; k++) {
  const a = ro.res[k].split(',').map(Number), b = rn.res[k].split(',').map(Number);
  if (ro.res[k] === rn.res[k]) st.same++;
  const ca = a.filter((x, i) => i && x === a[i - 1]).length, cb = b.filter((x, i) => i && x === b[i - 1]).length;
  if (b.some((x, i) => i && x < b[i - 1])) st.flipNew++;
  st.collOld += ca; st.collNew += cb; if (cb > ca) { st.worse++; if (ex.length < 5) ex.push({a, b}); }
  if (!ca) { st.oldClean++; if (ro.res[k] !== rn.res[k]) { st.oldCleanChanged++; if (ex.length < 4) ex.push({clean: true, a, b, inp: rn.inp[k]}); } }
}
console.log(JSON.stringify(st), 'ms old', ro.ms.toFixed(1), 'new', rn.ms.toFixed(1), 'big', JSON.stringify(big));
console.log(JSON.stringify(ex));
