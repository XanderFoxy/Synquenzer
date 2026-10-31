// QA K1: FM sound with a pitch envelope (HÜLLK. -> TONH.): the Mod-Übersicht by finger
import {open, sleep} from './n5-k-qa-lib.mjs';
const L = process.argv[2] === 'L', vp = L ? [844, 390] : [390, 844], tag = L ? 'L' : 'P';
const T = await open({vp, dpr: 2});
const {E} = T;
// Synth 2 (FM-Pluck in the demo): the pitch EG as on the TONH. page (L1 62 -> 50): a short rise of ~4 HT at each note start
await E(() => SYNQUENZER.setFmPeg(1, {r: [60, 40, 99, 99], l: [62, 50, 50, 50]}));
const th = (await T.find('.th', /^SYNTH 2/i))[0]; await T.tap(th.cx, th.cy, 300); await T.tapSel('button', /^KLANG$/, 1000);
// show the TONH. page by finger: HÜLLK. tab, then TONH. sub tab
await T.tapSel('#synthSheet button, #synthSheet .tab, #synthSheet [role=tab]', /^HÜLLK\.?$/, 500);
await T.tapSel('#synthSheet button, #synthSheet .stab', /^TONH(ÖHE|\.)$/, 500);
await T.shot('fmpeg-' + tag + '-tonh');
const more = (await T.find('#synthSheet .edm'))[0]; await T.tap(more.cx, more.cy, 350);
const mi = (await T.find('.pop button', /^Modulationen/))[0]; const label = mi && mi.t; if (mi) await T.tap(mi.cx, mi.cy, 450);
const pop = await E(() => { const p = document.querySelector('.pop.k1pop'); return p ? {rows: [...p.querySelectorAll('.k1mr')].map(x => x.textContent.replace('✕', '').trim()), empty: (p.querySelector('.k1empty') || {}).textContent || null} : null; });
await T.shot('fmpeg-' + tag + '-mods');
console.log('peg', JSON.stringify(await E(() => SYNQUENZER.getSound(1).p.fm6.peg)), 'menu', JSON.stringify(label), 'pop', JSON.stringify(pop), 'sub', JSON.stringify(await E(() => [ED.tab, ED.sub])));
console.log('errors', JSON.stringify(T.errs.slice(0, 5)));
await T.b.close();
