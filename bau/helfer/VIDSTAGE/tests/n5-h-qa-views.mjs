// QA VC2a / VL-R1: view-only taps (real touch) must not create data events; lists every data event per step
import { open, T, sleep } from './n5-h-qa-lib.mjs';
const VP = process.argv[2] || 'P1';
const {b, p, errs, cdp} = await open(VP, {wait: 2500});
const t = T(p, cdp), E = t.E;
await E(() => historyCheck()); await sleep(2600); await E(() => historyCheck());
const tapSel = async (sel, i = 0) => { const r = await E(([s, i]) => { const e = [...document.querySelectorAll(s)].filter(x => x.offsetWidth)[i]; if (!e) return null; e.scrollIntoView({block: 'nearest'}); const R = e.getBoundingClientRect(); return {x: R.left + R.width / 2, y: R.top + R.height / 2}; }, [sel, i]); if (!r) return 'missing ' + sel; await t.tap(r.x, r.y, 350); return 'ok'; };
const tapTxt = async (re, scope = 'body') => { const r = await E(([s, sc]) => { const e = [...document.querySelectorAll(sc + ' button, ' + sc + ' [role=button], ' + sc + ' .rb')].filter(x => x.offsetWidth && new RegExp(s).test(x.textContent.trim()))[0]; if (!e) return null; const R = e.getBoundingClientRect(); return {x: R.left + R.width / 2, y: R.top + R.height / 2}; }, [re, scope]); if (!r) return 'missing ' + re; await t.tap(r.x, r.y, 350); return 'ok'; };
const steps = [
  ['Spur 1 wählen', () => tapSel('.th', 0)],
  ['Spur 3 wählen', () => tapSel('.th', 2)],
  ['Slot 2/2 wählen (gefüllt, Tipp startet Clip)', () => tapSel('.slot.filled', 1)],
  ['Szenen 5–8 zeigen', () => tapSel('.szb')],
  ['Szenen 1–4 zeigen', () => tapSel('.szb')],
  ['Teile 5–8 zeigen', () => tapSel('.pb-pg')],
  ['Teile 1–4 zeigen', () => tapSel('.pb-pg')],
  ['SONG ⇄ an', () => tapSel('.corner')],
  ['SONG ⇄ aus', () => tapSel('.corner')],
  ['KLANG öffnen', () => tapSel('#bKlang')],
  ['Editor schließen', async () => { await E(() => closeEditor()); return 'api'; }],
  ['✎ Clip bearbeiten', () => tapSel('#bEdit')],
  ['Editor schließen 2', async () => { await E(() => closeEditor()); return 'api'; }],
  ['TRANSPONIEREN-Modus', () => tapSel('#segTr')],
  ['SPIELEN-Modus', () => tapSel('#segPlay')],
  ['Oktave höher', () => tapSel('#octUp')],
  ['Oktave tiefer', () => tapSel('#octDn')],
  ['Menü auf', () => tapSel('#bMenu')],
  ['Menü zu', async () => { await E(() => closeMenu()); return 'api'; }],
  ['▶', () => tapSel('#bPlay')],
  ['Szene 2 starten', () => tapSel('.scn', 1)],
  ['■', () => tapSel('#bPlay')],
  ['Harmonie-Modus Pop', () => tapSel('#bHMode')],
  ['Pop schließen', async () => { await E(() => { if (typeof closePop === 'function') closePop(); }); return 'api'; }],
  ['Spur 5 wählen', () => tapSel('.th', 4)],
  ['Spur 6 wählen', () => tapSel('.th', 5)],
];
const res = [];
for (const [name, fn] of steps) {
  const n0 = await t.evN();
  const st = await fn();
  await sleep(2600);
  await t.drain(); await E(() => { if (HIST.dirty) histSweep(); });
  const evs = await t.evSince(n0);
  const data = evs.filter(e => e.u !== 'ctx');
  res.push({name, st, ctx: evs.filter(e => e.u === 'ctx').map(e => e.z.c).join(','), data: data.map(e => e.u + ':' + (e.d || []).map(o => o.op[0] + ' ' + o.path).slice(0, 5).join(' '))});
  console.log(name.padEnd(36), st, '| ctx', res[res.length - 1].ctx, '| data', JSON.stringify(res[res.length - 1].data));
}
console.log('historyCheck', JSON.stringify(await E(() => historyCheck({detail: true}))));
console.log('errors', JSON.stringify(errs.slice(0, 5)));
await b.close();
