// QA musiker run 2: a gesture after a pause (think, then tap) – does its own event carry the data, or does a 'proj' sweep take it?
import {open, sleep, OUT, summ} from './n5-h-mu2-lib.mjs';
const PAUSE = +(process.argv[2] || 3000);
const T = await open({vp: [390, 844]}); const {p, E} = T;
const find = (sel, re) => E(([sel, src]) => { const rx = src ? new RegExp(src) : null; return [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (!rx || rx.test((e.textContent || '').trim())); }).map(e => { const r = e.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, t: (e.textContent || '').trim().slice(0, 40), id: e.id, c: e.className}; }); }, [sel, re ? re.source : null]);
await sleep(3000); await T.drain(); let n0 = await T.evN();
const res = [];
const step = async (name, fn) => { await sleep(PAUSE); const u0 = await E(() => SYNQUENZER.undoInfo().n); let r; try { r = await fn(); } catch (e) { r = 'ERR ' + e.message; } await sleep(2800); await T.drain(); const evs = await T.evSince(n0); n0 += evs.length; const u1 = await E(() => SYNQUENZER.undoInfo().n);
  const data = evs.filter(e => e.u !== 'ctx'); const own = data.filter(e => e.u !== 'proj'); const good = own.length === 1 && own[0].d && own[0].d.length > 0 && !data.some(e => e.u === 'proj');
  res.push([name, good]); console.log(`${good ? 'OK ' : 'BAD'} ${name} → ${String(JSON.stringify(r)).slice(0, 80)} (undo ${u0}→${u1})\n     ${summ(evs).join('\n     ') || '(keine)'}`); };
// 1 a clip by API (one undo entry)
await step('setClip (API) Synth 4 Szene 2', () => E(() => { SYNQUENZER.setClip(3, 1, {len: 1, notes: [{t: 0, d: .5, n: 60, v: .8}, {t: 1, d: .5, n: 64, v: .8}]}); return 1; }));
// 2 ↶ by finger (head row)
await step('↶ per Finger', async () => { const b = (await find('button', /^↶$/))[0]; if (!b) return 'no ↶'; await T.tap(b.cx, b.cy, 300); return b; });
// 3 the toast's ↷ Wiederholen by finger (if it is there) else API redo
await step('↷ (Toast oder API)', async () => { const b = (await find('button', /Wiederholen/))[0]; if (b) { await T.tap(b.cx, b.cy, 300); return 'toast'; } await E(() => SYNQUENZER.redo()); return 'api'; });
// 4 a setting (kind set) by API
await step('Einstellung Tastatur-Anschlag (set)', () => E(() => setSetting('kbVel', S.settings.kbVel === 'pos' ? 'fixed' : 'pos', 'Tastatur-Anschlag')));
// 5 clip delete by API
await step('Clip löschen (API)', () => E(() => { SYNQUENZER.clearClip(3, 1); return 1; }));
// 6 bus fx
await step('Hall-Länge (fx)', () => E(() => { setBusFx('hall.decay', 3.5); return 1; }));
// 7 a knob drag by finger (Synth 1 KLANG, first knob)
await step('Reglerzug Synth 1 KLANG (Finger, 1.5 s)', async () => {
  const th = (await find('.th', /SYNTH 1/i))[0]; if (!th) return 'no head ' + JSON.stringify((await find('.th')).map(x => x.t)); await T.tap(th.cx, th.cy, 300); const k = (await find('button', /^KLANG$/))[0]; await T.tap(k.cx, k.cy, 900);
  const kn = (await find('.knob'))[0]; if (!kn) return 'no knob'; await T.down(kn.cx, kn.cy); await sleep(30); for (let i = 1; i <= 90; i++) { await T.move(kn.cx, kn.cy - i * .7); await sleep(16); } await T.up(); return kn.t; });
console.log('SUMMARY', JSON.stringify(res), 'check', await T.hc(), 'errs', T.errs.slice(0, 3));
await T.b.close();
