// musiker A: real touch gestures on the demo, each step → which history events
import {open, sleep, OUT, summ} from './n5-h-mu-lib.mjs';
const VP = (process.argv[2] || '390x844').split('x').map(Number);
const T = await open({vp: VP});
const {p, E} = T;
let n0 = await T.evN();
const step = async (name, fn, wait = 2600) => { let r; try { r = await fn(); } catch (e) { r = 'ERR ' + e.message; } await sleep(wait); await T.drain(); const evs = await T.evSince(n0); n0 += evs.length; console.log(`## ${name} → ${JSON.stringify(r)}\n   ${summ(evs).join('\n   ') || '(keine)'}`); return evs; };
await step('▶1 Szene tippen', () => T.tapSel('button.scn', /^▶\s*1/));
await step('Clip Synth 2 / Szene 2 tippen', async () => { const r = await E(() => { const c = document.querySelector('.cell[data-t="1"][data-s="1"], [data-t="1"][data-s="1"]'); if (!c) return null; const q = c.getBoundingClientRect(); return {cx: q.x + q.width / 2, cy: q.y + q.height / 2}; }); if (!r) return 'no cell'; await T.tap(r.cx, r.cy); return r; });
await step('KLANG öffnen', () => T.tapSel('#bKlang'), 1200);
const knobs = await E(() => [...document.querySelectorAll('.knob, .ctl, [data-ctl]')].filter(e => e.offsetWidth).slice(0, 12).map(e => { const r = e.getBoundingClientRect(); return {c: e.className, t: e.textContent.trim().slice(0, 20), x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), w: Math.round(r.width), h: Math.round(r.height)}; }));
console.log('knobs', JSON.stringify(knobs));
await p.screenshot({path: OUT + '/a-editor.png'});
if (knobs.length) {
  const k = knobs[0];
  await step('Regler 2 s ziehen (' + k.t + ')', async () => { await T.down(k.x, k.y); await sleep(30); for (let i = 1; i <= 120; i++) { await T.move(k.x, k.y - i * 0.6); await sleep(16); } await T.up(); return 'ok'; });
  await step('Regler kurz ziehen (' + (knobs[1] || k).t + ')', async () => { const q = knobs[1] || k; await T.down(q.x, q.y); await sleep(30); await T.glide(q.x, q.y, q.x, q.y - 30, 10, 16); await T.up(); return 'ok'; });
}
await step('↶ Undo', async () => { const r = await T.rectOf('button', /^↶$/); if (!r) return 'no undo'; await T.tap(r.cx, r.cy); return r; });
await step('↷ Redo', async () => { const r = await T.rectOf('button', /^↷$/); if (!r) return 'no redo btn'; await T.tap(r.cx, r.cy); return r; });
await p.screenshot({path: OUT + '/a-editor2.png'});
console.log('check', await T.hc(), JSON.stringify(await E(() => SYNQUENZER.history())), 'errs', T.errs);
await T.b.close();
