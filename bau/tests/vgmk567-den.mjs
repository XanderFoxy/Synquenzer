// vgmk567: denormal load series, filter type 0 (copy of v3-mk1-fpdsp denormal part). Usage: MK_FILE=<f> node vgmk567-den.mjs [ft]
const { render, mkPatch } = await import('./v3-mk1-node.mjs');
const SR = 48000, ft = +(process.argv[2] || 0);
const p = mkPatch({mix: {o1: 127, o2: 127, n: 127}, o2: {w: 0, semi: 7}, f: {type: ft, cut: 90, res: 100}, a: {dist: 1, gate: 1}});
const r = render(p, [[0, 'on', 48, 1]], {sec: 61, quantumMs: true, at: [[1, {mkSet: {'t.0.mix.o1': 0, 't.0.mix.o2': 0, 't.0.mix.n': 0}}]]});
const per = Math.round(SR / 128), win = []; for (let s = 2; s < 61; s++) { const q = r.qms.slice(s * per, (s + 1) * per).sort((a, b) => a - b); win.push(q[q.length >> 1] * per); }
const first = win[0], med = win.slice().sort((a, b) => a - b)[win.length >> 1];
const over = win.slice(1).filter(w => w > 1.1 * Math.max(first, med)).length;
console.log(process.env.MK_FILE.split('/').slice(-2).join('/'), 'first', first.toFixed(1), 'med', med.toFixed(1), 'over', over, 'series', win.map(w => w.toFixed(0)).join(' '));
