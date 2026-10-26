// MK-P-14: running light on SELECT 1-16: order, one LED, LAST STEP, reverse; back to program/page LED; play view mirrors; SEQ EDIT knobs = steps
import {launch, open, openMk, touch, tap, line, panel, ctr, tapSel} from './v3-qmkp-lib.mjs';
const f = process.argv[2] || 'X';
const b = await launch(); const fails = []; const log = [];
const page = await open(b, f); await openMk(page); await page.waitForTimeout(300);
await page.evaluate(() => { SYNQUENZER.setBpm(120); ensureAudio(); const S_ = (p, v) => SYNQUENZER.mkSet(0, p, v); S_('t.0.seq.on', 1); S_('t.0.seq.q.0.k', 11); S_('t.0.seq.res', 3); S_('t.0.seq.last', 16); S_('t.0.seq.type', 0); });
await page.waitForTimeout(300);
const sample = (ms, spiel) => page.evaluate(async ([ms, spiel]) => { const out = []; const t0 = performance.now(); await new Promise(r => { const f = () => { const L = []; if (!spiel) { for (let k = 1; k <= 16; k++) { const n = MKUI.PL.ui.led['s' + k]; if (n && /\brun\b/.test(n.className)) L.push(k); } } else { for (const b of MKUI.P.sp.steps) { const l = b.querySelector('.led'); if (/\brun\b/.test(l.className)) L.push(+b.dataset.n); } }
  out.push(L.join('+') || '0'); if (performance.now() - t0 < ms) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); }); return out; }, [ms, !!spiel]);
const seqOf = a => { const s = []; for (const x of a) if (s[s.length - 1] !== x) s.push(x); return s; };
await page.evaluate(() => SYNQUENZER.keyOn(60, .8, 'h')); await page.waitForTimeout(400);
let a = await sample(4200); let s = seqOf(a); log.push('fwd: ' + s.join(' '));
if (a.some(x => x.includes('+'))) fails.push('two LEDs at once (fwd)');
const n16 = s.filter(x => x !== '0').map(Number); for (let k = 1; k < n16.length; k++) { const p = n16[k - 1], c = n16[k]; if (!(c === p + 1 || (p === 16 && c === 1))) { fails.push('fwd order broken ' + p + '→' + c); break; } }
await page.evaluate(() => SYNQUENZER.mkSet(0, 't.0.seq.last', 8)); await page.waitForTimeout(300); a = await sample(2500); s = seqOf(a); log.push('last8: ' + s.join(' '));
if (s.some(x => +x > 8)) fails.push('LAST STEP 8 lit a step > 8');
await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.seq.last', 16); SYNQUENZER.mkSet(0, 't.0.seq.type', 1); }); await page.waitForTimeout(300); a = await sample(2500); s = seqOf(a); log.push('rev: ' + s.join(' '));
const nr = s.filter(x => x !== '0').map(Number); for (let k = 1; k < nr.length; k++) { const p = nr[k - 1], c = nr[k]; if (!(c === p - 1 || (p === 1 && c === 16))) { fails.push('reverse order broken ' + p + '→' + c); break; } }
// play view mirrors the light
await page.evaluate(() => SYNQUENZER.mkSet(0, 't.0.seq.type', 0));
await tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="spiel"]'); await page.waitForTimeout(500); await page.evaluate(() => SYNQUENZER.keyOn(60, .8, 'h')); await page.waitForTimeout(300);
a = await sample(2500, true); s = seqOf(a); log.push('spiel: ' + s.join(' ')); if (s.length < 8) fails.push('play view light not running: ' + s.join(' '));
await tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="geraet"]'); await page.waitForTimeout(400);
await page.evaluate(() => SYNQUENZER.keyOff(60, 'h')); await page.waitForTimeout(1500);
a = await sample(500); log.push('after release: ' + seqOf(a).join(' ')); if (seqOf(a).some(x => x !== '0')) fails.push('light still on after release (no voice)');
// in EDIT the page LED returns
await page.evaluate(() => { MKUI.press('edit'); MKUI.press('s6'); }); await page.waitForTimeout(200);
const ed = await page.evaluate(() => { const L = []; for (let k = 1; k <= 16; k++) { const n = MKUI.PL.ui.led['s' + k]; if (n && /\bon\b/.test(n.className)) L.push(k); } return L; });
log.push('EDIT 08 page LEDs ' + ed); if (ed.join() !== '6') fails.push('EDIT page LED ' + ed);
// SEQ EDIT: knob n = step n, one undo per gesture, LCD SEQ1 Snn
await page.evaluate(() => { MKUI.press('exit'); MKUI.view({ansicht: 'ganz'}); }); await page.waitForTimeout(200);
const P = await panel(page); const sq = P.elements.find(e => e.id === 'sq.sel'); await tap(page, ...ctr(sq)); await page.waitForTimeout(150);
for (const n of [1, 5, 9, 16]) { await page.evaluate(n => MKUI.view({ansicht: 'ganz', haelfte: n <= 8 ? 'links' : 'rechts'}), n); await page.waitForTimeout(350); const E = (await panel(page)).elements.find(e => e.id === 'k' + n); const [x, y] = ctr(E);
  const b0 = await page.evaluate(() => ({v: SYNQUENZER.mkGet(0).t[0].seq.q[0].v.slice(), u: SYNQUENZER.undoInfo().n, h: 0}));
  await touch(page, line(x, y, x, y - 50, 12), 16); await page.waitForTimeout(150);
  const b1 = await page.evaluate(() => ({v: SYNQUENZER.mkGet(0).t[0].seq.q[0].v.slice(), u: SYNQUENZER.undoInfo().n, lcd: SYNQUENZER.mkPanel().lcd, e1a: SYNQUENZER.mkGet(0).t[0].e1.a}));
  const ch = b1.v.map((v, k) => v !== b0.v[k] ? k + 1 : 0).filter(Boolean);
  log.push('SEQ EDIT k' + n + ' changed steps ' + ch + ' undo +' + (b1.u - b0.u) + ' lcd ' + JSON.stringify(b1.lcd[1]));
  if (ch.join() !== String(n) || b1.u - b0.u !== 1) fails.push('SEQ EDIT k' + n + ' -> steps ' + ch + ' undo +' + (b1.u - b0.u)); }
console.log(log.join('\n')); console.log('FAILS', fails.length); for (const x of fails) console.log('  ' + x); console.log('errs', JSON.stringify(page.errs).slice(0, 300));
await b.close();
