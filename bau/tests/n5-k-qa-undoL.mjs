// QA K1: landscape editor head ↶ ↷ ↶ after a ✕ in the Mod-Übersicht: where are the toast and the head buttons, what does the tap hit
import {open, sleep} from './n5-k-qa-lib.mjs';
const vp = process.argv[2] === 'P' ? [390, 844] : [844, 390];
const T = await open({vp, dpr: 2, file: process.env.F});
const {E} = T;
const st = () => E(() => ({n: SYNQUENZER.k1Mods ? SYNQUENZER.k1Mods(2).length : SYNQUENZER.getSound(2).mods.length, u: SYNQUENZER.undoInfo().n, r: SYNQUENZER.undoInfo().redo}));
const th = (await T.find('.th', /^SYNTH 3/i))[0]; await T.tap(th.cx, th.cy, 300); await T.tapSel('button', /^KLANG$/, 900);
// a deletion via the API path the ✕ uses (or the matrix route delete in the base)
await E(() => { if (SYNQUENZER.k1Del) SYNQUENZER.k1Del(2, 'r:lfo2:pitch'); else { soundEdit(2, 'x', () => { const s = sndOf(2); s.mods = s.mods.filter(m => !(m.src === 'lfo2' && m.dst === 'pitch')); modsChanged(2); }); } });
await sleep(400);
console.log('after del', JSON.stringify(await st()));
const where = async () => E(() => { const un = [...document.querySelectorAll('#synthSheet button')].filter(b => b.offsetWidth && /^[↶↷]$/.test(b.textContent.trim())).map(b => { const r = b.getBoundingClientRect(); const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return {t: b.textContent.trim(), r: [r.x, r.y, r.width, r.height].map(Math.round), dis: b.disabled, cls: b.className, hit: hit ? (hit === b ? 'self' : hit.className + ':' + (hit.textContent || '').trim().slice(0, 30)) : null}; });
  const ts = [...document.querySelectorAll('body *')].filter(e => /toast/i.test(e.className) && e.offsetWidth).map(e => { const r = e.getBoundingClientRect(); return [e.className, [r.x, r.y, r.width, r.height].map(Math.round), e.textContent.trim().slice(0, 50)]; }); return {un, ts}; });
for (const step of ['↶', '↷', '↶', '↷', '↶']) {
  const w = await where(); const b = w.un.find(x => x.t === step);
  console.log('before', step, JSON.stringify(w));
  await T.tap(b.r[0] + b.r[2] / 2, b.r[1] + b.r[3] / 2, 600);
  console.log('after ', step, JSON.stringify(await st()));
}
await T.shot('undoL');
console.log('errors', JSON.stringify(T.errs.slice(0, 5)));
await T.b.close();
