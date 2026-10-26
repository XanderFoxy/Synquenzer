import {render, mkDefaults} from './v3-mk1-node.mjs';
for (const f of ['../synq-snapshots/MK2.html', '../mk-br-MK3/index.html']) {
  const p = mkDefaults(); p.t[0].e2.r = 60;
  const r = render(p, [], {file: new URL(f, import.meta.url).pathname, sec: 3, raw: [[0, 1, 1, 60, .8, -1], [.2, 2, 1], [.4, 1, 2, 60, .8, -1], [.6, 2, 2]]});
  console.log(f, 'ended', r.msgs.filter(m => m.end).map(m => m.end).flat().join(','));
}
