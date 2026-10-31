import {launch, open, clickTake, sleep, U, LY, SET, deq} from '../h.mjs';
const br = await launch(); const {p, errs} = await open(br);
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const T = Array.from({length: 16}, (_, k) => 0.3 + k * 0.22), tk = await clickTake(p, T, 4), id = tk.id;
let seed = +(process.argv[2] || 7); const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const ri = n => Math.floor(rnd() * n);
const WORDS = ['Sonnenblume', 'ich', 'liebe', 'dich', 'Ab-end-rot', 'la', 'Feuer', 'x', 'wunderbar', 'so'];
await SET(p, id, {op: 'text', text: 'Liebe ist ein Feuer das brennt so hell', lang: 'de'});
let bad = 0;
await p.evaluate(() => { const o = undoPush; window.__pc = 0; undoPush = function (...a) { window.__pc++; return o.apply(this, a); }; });
const PC = () => p.evaluate(() => window.__pc);
const MK = id => p.evaluate(id => wpMarks(id).map(k => ({t: k.t})), id);
const xs = ly => ly ? ly.s.map(s => s.x + '@' + s.t.toFixed(3) + (s.o ? 'o' : '') + (s.j ? 'j' : '') + (s.u ? 'u' : '')).join(' ') : 'null';
for (let it = 0; it < +(process.argv[3] || 200); it++) {
  const ly0 = await LY(p, id), mk0 = await MK(id), u0 = await PC(), nmk = (await MK(id)).length;
  const c = ri(10); let op, r, kind;
  const k = ri(nmk);
  if (c === 0) op = {op: 'word', k, text: WORDS[ri(WORDS.length)]};
  else if (c === 1) op = {op: 'shift', k, d: rnd() < .5 ? -1 : 1};
  else if (c === 2) op = {op: 'merge', k};
  else if (c === 3) op = {op: 'split', k};
  else if (c === 4) op = {op: 'nach', k, n: 1 + ri(2)};
  else if (c === 5) op = {op: 'ins', k, text: WORDS[ri(WORDS.length)]};
  else if (c === 6) op = {op: 'del', k};
  if (op) { r = await SET(p, id, op); kind = op.op; }
  else {
    const mk = (await MK(id));
    if (c === 7) { kind = 'mkMove'; r = {ok: await p.evaluate(([id, k, t]) => SYNQUENZER.wpMark(id, 'move', k, t), [id, k, mk[k].t + (rnd() - .5) * .3])}; }
    else if (c === 8 && mk.length > 4) { kind = 'mkDel'; r = {ok: await p.evaluate(([id, k]) => SYNQUENZER.wpMark(id, 'del', k), [id, k])}; }
    else { kind = 'mkAdd'; r = {ok: await p.evaluate(([id, t]) => SYNQUENZER.wpMark(id, 'add', t), [id, .2 + rnd() * 3.6])}; }
  }
  const ly1 = await LY(p, id), u1 = await PC();
  const prob = [];
  if (r && r.ok && u1 !== u0 + 1) prob.push('undo n ' + u0 + '→' + u1);
  if (r && !r.ok && u1 !== u0) prob.push('nicht ok aber Undo');
  const keepText = !['word', 'ins', 'del'].includes(kind);
  const tx = l => l ? l.s.map(s => s.x).join('') : '';
  if (keepText && tx(ly0) !== tx(ly1)) prob.push('Text geändert ' + tx(ly0) + ' → ' + tx(ly1));
  if (ly1) { for (let i = 1; i < ly1.s.length; i++) if (ly1.s[i].t < ly1.s[i - 1].t) prob.push('Zeit fällt @' + i); }
  const nn = await p.evaluate(ly => ly && SYNQUENZER.g9NormLy(ly, 4), ly1);
  if (ly1 && !deq(nn, ly1)) prob.push('normLy nicht idempotent');
  // Undo/Redo
  if (r && r.ok && u1 === u0 + 1) {
    await p.evaluate(() => SYNQUENZER.undo()); const lyU = await LY(p, id);
    if (!deq(lyU, ly0)) prob.push('Undo ≠ vorher: ' + xs(lyU) + ' vs ' + xs(ly0));
    await p.evaluate(() => SYNQUENZER.redo()); const lyR = await LY(p, id);
    if (!deq(lyR, ly1)) prob.push('Redo ≠ nachher: ' + xs(lyR) + ' vs ' + xs(ly1));
  }
  if (!ly1 || ly1.s.length < 3) await SET(p, id, {op: 'text', text: 'Liebe ist ein Feuer das brennt so hell', lang: 'de'});
  if (prob.length) { bad++; console.log('#' + it, kind, JSON.stringify(op || {}), JSON.stringify(r && {ok: r.ok, err: r.err}), '\n  ' + prob.join('\n  '), '\n  mk  ', mk0.map(k=>k.t.toFixed(3)).join(' '), '\n  vor ', xs(ly0), '\n  nach', xs(ly1)); if (bad > 8) break; }
}
console.log('bad', bad, 'errs', errs.join('|'));
await br.close();
