// header (name ●, A/B) after an edit in the MS 2000 panel vs. the VA editor
import {open, sleep, OUT, check, done} from './v3-qa-gmk2a-tl.mjs';
const FILE = process.argv[2]; const L = process.argv[3] === 'L';
const T = await open(Object.assign({viewport: L ? {width: 926, height: 428} : {width: 428, height: 926}}, FILE ? {file: FILE} : {})); const {p, E, errs} = T;
console.log('version', await E(() => SYNQUENZER.version));
const hdr = () => E(() => { const ab = [...document.querySelectorAll('button')].find(b => b.offsetWidth && /^A\/B$/.test(b.textContent.trim())); const nm = [...document.querySelectorAll('#sheet button, .sheet button, button')].filter(b => b.offsetWidth && b.getBoundingClientRect().y < 260).map(b => b.textContent.trim()); const nb = [...document.querySelectorAll('button')].filter(b => b.offsetWidth && b.getBoundingClientRect().y < 260); const i = nb.findIndex(b => b.textContent.trim() === '‹'); const n = nb[i + 1]; return {ab: !!ab, name: n ? n.textContent.trim() : null, nameHtml: n ? n.innerHTML.slice(0, 160) : null}; });
// VA: save the sound first so it is "clean", then edit one knob in the VA editor
await E(() => SYNQUENZER.setMetronome(false));
await E(() => SYNQUENZER.saveSound(0, 'VA sauber', 'new')); await sleep(300);
await T.openEd(0); await sleep(300);
const va0 = await hdr();
const kn = await E(() => { const k = [...document.querySelectorAll('.knob, .kn, [data-k]')].find(e => e.offsetWidth && e.getBoundingClientRect().y > 250); if (!k) return null; const r = k.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, c: k.className}; });
if (kn) { await T.down(kn.cx, kn.cy); await T.glide(kn.cx, kn.cy, kn.cx, kn.cy - 50, 20, 20); await T.up(); await sleep(400); }
const va1 = await hdr(); const vaEd = await E(() => SYNQUENZER.soundEdited(0));
console.log('VA', JSON.stringify(va0), '→ after knob', JSON.stringify(va1), 'edited', vaEd, 'knob', JSON.stringify(kn));
// MS 2000
const mkb = await T.rectText('button', /^MS ?2000$/); await T.tap(mkb.cx, mkb.cy, 800);
await E(() => SYNQUENZER.saveSound(0, 'MK sauber', 'new')); await sleep(300);
await E(() => { SYNQUENZER.selectTrack(1); }); await sleep(300); await E(() => { SYNQUENZER.selectTrack(0); }); await sleep(500);
const mk0 = await hdr(); const ed0 = await E(() => SYNQUENZER.soundEdited(0));
await T.sweep('k0', 50, 20, 20);   // SPIEL CUTOFF
const mk1 = await hdr(); const ed1 = await E(() => SYNQUENZER.soundEdited(0));
await T.w('w1', /^3 OSZ 1/); await T.knobList('k0', /^Speicherwelle/);
const mk2 = await hdr();
await E(() => SYNQUENZER.selectTrack(1)); await sleep(300); await E(() => SYNQUENZER.selectTrack(0)); await sleep(500);
const mk3 = await hdr();
console.log('MK clean', JSON.stringify(mk0), ed0, '→ after CUTOFF drag', JSON.stringify(mk1), ed1, '→ after WELLE list', JSON.stringify(mk2), '→ after track switch', JSON.stringify(mk3));
await p.screenshot({path: OUT + 'hdr-' + (L ? 'L' : 'P') + '.png'});
check('VA editor: knob edit shows A/B (and ● name) at once', va1.ab, va1);
check('MS 2000 panel: knob edit shows A/B (and ● name) at once', mk1.ab && mk2.ab, {mk1, mk2, mk3});
await T.br.close(); done();
