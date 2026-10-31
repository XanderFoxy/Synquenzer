// QA K1: after ✕ in the Mod-Übersicht, does the editor page underneath show the change (MOD rows, FILTER knob)? MS 2000 panel/LCD too
import {open, sleep} from './n5-k-qa-lib.mjs';
const L = process.argv[2] === 'L', vp = L ? [844, 390] : [390, 844], tag = L ? 'L' : 'P';
const T = await open({vp, dpr: 2}); const {E} = T;
const openMods = async () => { const m = (await T.find('#synthSheet .edm, #synthSheet .mkqmore'))[0]; await T.tap(m.cx, m.cy, 350); const mi = (await T.find('.pop button', /^Modulationen/))[0]; await T.tap(mi.cx, mi.cy, 450); };
const tapX = async key => { const x = await E(k => { const r = document.querySelector('.pop.k1pop .k1x[data-x="' + k + '"]'); if (!r) return null; r.scrollIntoView({block: 'nearest'}); const b = r.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; }, key); if (x) await T.tap(x[0], x[1], 400); return !!x; };
const outside = async () => { const r = await E(() => { const p = document.querySelector('.pop'); if (!p) return null; const q = p.getBoundingClientRect(); return [8, q.bottom + 30 < innerHeight ? q.bottom + 20 : 8]; }); if (r) await T.tap(r[0], r[1], 400); };
const th = (await T.find('.th', /^SYNTH 3/i))[0]; await T.tap(th.cx, th.cy, 300); await T.tapSel('button', /^KLANG$/, 900);
// MOD tab
await T.tapSel('#synthSheet button, #synthSheet .tab', /^MOD$/, 500);
const rowsBefore = await E(() => [...document.querySelectorAll('#synthSheet .sh-body *')].filter(e => /^(Tonhöhe|Cutoff)$/.test((e.textContent || '').trim()) && e.children.length === 0).map(e => e.textContent.trim()));
await openMods(); const x1 = await tapX('r:lfo2:pitch'); await outside();
const rowsAfter = await E(() => [...document.querySelectorAll('#synthSheet .sh-body *')].filter(e => /^(Tonhöhe|Cutoff)$/.test((e.textContent || '').trim()) && e.children.length === 0).map(e => e.textContent.trim()));
const cnt = await E(() => [...document.querySelectorAll('#synthSheet .sh-body *')].filter(e => /^\d+ \/ 8$/.test((e.textContent || '').trim())).map(e => e.textContent.trim()));
await T.shot('stale-' + tag + '-mod');
console.log('MOD tab rows before', JSON.stringify(rowsBefore), '✕', x1, 'after', JSON.stringify(rowsAfter), 'count label', JSON.stringify(cnt), 'engine routes', await E(() => SYNQUENZER.getSound(2).mods.length));
// FILTER tab: Hüllk.-Menge knob
await T.tapSel('#synthSheet button, #synthSheet .tab', /^FILTER$/, 500);
const kv = () => E(() => { const k = document.querySelector('#synthSheet .sh-body [data-key="fenv"]'); return k ? (k.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40) : null; });
const k0 = await kv();
await openMods(); const x2 = await tapX('p:fenv'); await outside();
const k1 = await kv();
await T.shot('stale-' + tag + '-filter');
console.log('FILTER fenv knob before', JSON.stringify(k0), '✕', x2, 'after', JSON.stringify(k1), 'value', await E(() => SYNQUENZER.getSound(2).p.fenv));
console.log('errors', JSON.stringify(T.errs.slice(0, 3)));
await T.b.close();
