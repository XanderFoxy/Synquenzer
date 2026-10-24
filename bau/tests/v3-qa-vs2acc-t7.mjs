// T7: Mikro-Blatt per Tipp: Quelle Stimme │ Instrument, In Tonart einrasten, Oktave sperren (nur Instrument); Wirkung auf Live-Taste und
// FANG mit Säge + Sub −1 Okt.; Trefferflächen.
import {open, sleep, saw, playAtBeat, waitBeat, result, calib} from './v3-qa-vs2acc-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const vp = process.argv[2] || 'P1';
const H = await open({vp}), p = H.p;
await p.evaluate(() => { window.__q.label = 'Headset Microphone'; SYNQUENZER.stop(); SYNQUENZER.newProject({init: true}); SYNQUENZER.setBpm(120); });
const micSel = await p.evaluate(() => getComputedStyle(document.getElementById('segMic')).display !== 'none' ? '#segMic' : '#bMicT');
await p.tap(micSel);
await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live' && SYNQUENZER.vsClock().ring && SYNQUENZER.vsClock().ring.end > 0, null, {timeout: 8000});
await sleep(700); await calib(p);
// Mikro-Blatt öffnen über die Mikro-Zeile
const rowSel = await p.evaluate(() => { const r = [...document.querySelectorAll('[class*="mrow"], #micRow, .mic-row, .strow')].find(e => e.offsetParent); return r ? (r.id ? '#' + r.id : null) : null; });
console.log('  Zeile', rowSel);
if (!(await p.evaluate(() => SYNQUENZER.stimme().sheet))) { if (rowSel) await p.tap(rowSel); else await p.evaluate(() => SYNQUENZER.stimmeSheet()); }
await sleep(300);
const info = () => p.evaluate(() => { const s = document.querySelector('.pop.stpop'); if (!s) return null; const bs = [...s.querySelectorAll('#vsSrc button, .st-vs button')].map(b => { const r = b.getBoundingClientRect(); return {t: b.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), on: b.classList.contains('on') || b.getAttribute('aria-pressed') === 'true', inV: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth}; }); return {bs, sh: s.scrollHeight, ch: s.clientHeight}; });
let I = await info(); console.log('  Blatt', JSON.stringify(I));
ok(I && I.bs.some(b => /Stimme/.test(b.t)) && I.bs.some(b => /Instrument/.test(b.t)) && !I.bs.some(b => /Oktave sperren/.test(b.t)), 'Quelle Stimme │ Instrument, ohne „Oktave sperren“ bei Stimme');
const minW = vp[0] === 'L' ? 40 : 44, minH = vp[0] === 'L' ? 36 : 44;
await p.tap('.pop.stpop #vsSrc button[data-v="inst"]'); await sleep(200);
I = await info();
const lockB = I.bs.find(b => /Oktave sperren/.test(b.t));
ok(!!lockB, 'Instrument → „Oktave sperren“ erscheint: ' + JSON.stringify(lockB));
ok(I.bs.every(b => b.w >= minW && b.h >= minH), `Trefferflächen ≥ ${minW}×${minH}: ` + JSON.stringify(I.bs.map(b => b.w + '×' + b.h)));
ok(I.bs.every(b => b.inV), 'alle Knöpfe im Bild (ggf. nach Rollen): ' + JSON.stringify(I.bs.map(b => b.inV)));
// Live: Säge + Sub (gespielt A3 = 57): ohne Sperre leuchtet ?, mit Sperre 57
async function liveAndFang(lock) {
  const cfg = await p.evaluate(() => SYNQUENZER.vsInfo().cfg);
  if (cfg.lock !== lock) { await p.tap('.pop.stpop .st-vs button[data-vs="lock"]'); await sleep(150); }
  const c2 = await p.evaluate(() => SYNQUENZER.vsInfo().cfg);
  await p.evaluate(() => SYNQUENZER.stimmeSheet(false)); await sleep(100);
  await p.evaluate(() => { SYNQUENZER.stop(); }); await sleep(200);
  await p.evaluate(() => SYNQUENZER.play()); await waitBeat(p, 0.3);
  const SB = await p.evaluate(() => SYNQUENZER.vsClock().spb);
  const MEL = [[4, 1, 57], [5, 1, 60], [6, 1, 64], [7, 1, 62], [8, 2, 57], [10, 1, 55], [11, 1, 57]];
  await playAtBeat(p, saw(MEL.map(([b, d, m]) => ({on: 0.05 + (b - 4) * SB, dur: d * SB, m})), {sub: true, fs: 16000}), 4, 0.05, 16000);
  const lits = new Set();
  for (let b = 4.6; b < 12; b += 0.5) { await waitBeat(p, b); const l = await p.evaluate(() => SYNQUENZER.vsInfo().lit); if (l >= 0) lits.add(l); }
  await waitBeat(p, 16.3); await p.tap('#bFang');
  const r = await result(p);
  const hit = r ? MEL.filter(([b, , m]) => r.notes.some(n => n.n === m && Math.abs(r.start * 4 + n.t - b) <= 0.13)).length : 0;
  const low = r ? MEL.filter(([b, , m]) => r.notes.some(n => n.n === m - 12 && Math.abs(r.start * 4 + n.t - b) <= 0.13)).length : 0;
  console.log(`  Sperre ${c2.lock} (src ${c2.src}): live ${[...lits].join(',')}; FANG ${hit}/7 gespielte Oktave, ${low}/7 tiefer; ${JSON.stringify(r && r.notes.map(n => n.n))}`);
  if (r) await p.tap('.pop.vsres [data-a="drop"]'); await sleep(200);
  await p.evaluate(() => SYNQUENZER.stimmeSheet()); await sleep(200);
  return {lits: [...lits], hit, low, r};
}
const off = await liveAndFang(false), on = await liveAndFang(true);
ok(off.low >= 6, 'ohne Sperre: Sub-Oszillator zieht eine Oktave tiefer (' + off.low + '/7)');
ok(on.hit >= 7 && on.low === 0, 'mit Sperre (per Tipp): gespielte Oktave ' + on.hit + '/7');
ok(on.lits.length && on.lits.every(n => [57, 60, 64, 62, 55].includes(n)), 'Live-Taste mit Sperre in der gespielten Oktave: ' + on.lits.join(','));
ok(off.lits.length && off.lits.some(n => n < 55), 'Live-Taste ohne Sperre tiefer: ' + off.lits.join(','));
// Einrasten-Schalter im Mikro-Blatt = Standard des Ergebnis-Blatts
await p.tap('.pop.stpop .st-vs button[data-vs="snap"]'); await sleep(150);
ok(!(await p.evaluate(() => SYNQUENZER.vsInfo().cfg.snap)), 'Tipp „In Tonart einrasten“ → aus');
await p.screenshot({path: 'v3-qa-vs2acc-t7-' + vp + '.png'});
ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
await H.br.close();
console.log(fail ? 'FAIL ' + fail : 'ALLE OK');
