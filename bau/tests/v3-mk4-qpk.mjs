process.env.MK_FILE = new URL('../mk-br-MK4/index.html', import.meta.url).pathname;
const {renderW, mkPatch} = await import('./v3-mk2-node.mjs');
const base = {mix: {o1: 127, o2: 64}, o2: {w: 1, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}};
const k = process.argv[2], fx = k === 'kern' ? {} : {mfx: {type: +k, spd: 64, dep: 100}, dly: {type: 1, sync: 1, time: 64, note: 5, dep: 64}, eq: {lf: 200, lg: 6, hf: 8000, hg: -4}};
const ev = []; for (let t = 0; t < 40; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
const q = renderW(Object.assign(mkPatch(base), fx), ev, {sec: 40, quantumMs: true}, []).qms.slice(375 * 5);
const s = q.slice().sort((a, b) => a - b), at = p => s[Math.floor(s.length * p)].toFixed(4);
console.log(k, 'p50', at(.5), 'p99', at(.99), 'p99.9', at(.999), 'max', s[s.length - 1].toFixed(3), 'n>1ms', q.filter(x => x > 1).length);
