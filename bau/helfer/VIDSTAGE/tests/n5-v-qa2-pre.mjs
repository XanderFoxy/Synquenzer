// VV2-02: a richer project without song.video saved by the build before VV2 → loaded + saved here: character for character
import { chromium } from 'playwright';
const PRE = '/home/user/Synquenzer/bau/snapshots/VV1.html', APP = '/home/user/Synquenzer/bau/helfer/VIDSTAGE/index.html';
const SONG = {bars: 20, lanes: [[{bar: 0, slot: 0}, {bar: 6, slot: 1, ph: 2}, {bar: 12, slot: 1, re: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 14, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 8, slot: 1}], []],
  carrier: [{beat: 0, target: {root: 0, quality: 'maj', bass: 0}}, {beat: 16, target: {root: 9, quality: 'min', bass: 9}}], xp: [{beat: 32, semi: 2}, {beat: 48, semi: 0}],
  mel: {5: {notes: [{t: 0, n: 72, d: 1, v: 100}, {t: 4.5, n: 74, d: .5, v: 90}, {t: 33, n: 76, d: 2, v: 80}]}}, marks: [{id: 'm1', a: 0, len: 8, name: 'Strophe'}, {id: 'm2', a: 8, len: 8, name: 'Refrain'}, {id: 'm3', a: 16, len: 4, name: 'Outro'}], loop: {on: true, a: 4, b: 12}};
const go = async app => { const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']}); const p = await b.newPage(); await p.goto('file://' + app); await p.waitForTimeout(1800); return {b, p}; };
const strip = x => x.replace(/"sum":"[0-9a-f]+"/g, '').replace(/"id":"p-[a-z0-9-]+"/g, '');
const A = await go(PRE);
const s0 = await A.p.evaluate(s => { SYNQUENZER.setSong(s); markAction(S.song.marks[0].id, 'rep', 2); return serialize(); }, SONG); await A.b.close();
const B = await go(APP);
const r = await B.p.evaluate(s0 => { applyProject(normalizeProject(projFromFile(JSON.parse(s0))), {}); const s1 = serialize(); applyProject(normalizeProject(projFromFile(JSON.parse(s1))), {}); return {s1, s2: serialize(), has: 'video' in S.song}; }, s0); await B.b.close();
let k = 0; const a = strip(s0), c = strip(r.s1); while (k < a.length && a[k] === c[k]) k++;
console.log(JSON.stringify({len: s0.length, same: a === c, same2: strip(r.s1) === strip(r.s2), videoKey: r.has, firstDiff: a === c ? null : [a.slice(k - 80, k + 80), c.slice(k - 80, k + 80)]}));
