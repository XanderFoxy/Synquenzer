import {render, mkDefaults} from './v3-mk1-node.mjs';
const F = {MK2: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK2.html', MK3: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html'};
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const C = x => JSON.parse(JSON.stringify(x));
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, C(top || {})); merge(p.t[0], C(t1 || {})); merge(p.t[1], C(t2 || {})); return p; };
const show = (lab, f, p, ev) => { const r = render(p, ev, {file: F[f], sec: 2}); const seq = []; r.msgs.forEach(m => { if (m.end) seq.push(m.end.join('+')); }); console.log(f, lab.padEnd(40), 'end messages in order:', seq.join(' | ')); };
const ev3 = [[0, 'on', 64], [.05, 'on', 67], [.1, 'on', 72], [.3, 'off', 72], [.35, 'off', 67], [.4, 'off', 64]];
const ev3b = [[0, 'on', 64], [.05, 'on', 67], [.1, 'on', 72], [.3, 'off', 64], [.35, 'off', 67], [.4, 'off', 72]];
for (const f of ['MK2', 'MK3']) { show('Single Mono, release newest first', f, prog({mode: 0}, {asg: 0}), ev3); show('Single Mono, release oldest first', f, prog({mode: 0}, {asg: 0}), ev3b); }
show('Split T2 Mono, newest first', 'MK3', prog({mode: 2, split: 60}, {}, {asg: 0}), ev3);
show('Dual 1+3 (T1 1 voice), newest first', 'MK3', prog({mode: 1, tv: 0}), ev3);
show('Dual 2+2 T1 Mono, newest first', 'MK3', prog({mode: 1, tv: 1}, {asg: 0}), ev3);
