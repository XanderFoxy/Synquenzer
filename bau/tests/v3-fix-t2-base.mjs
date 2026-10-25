// QA V2e t2: Marken-Blatt via touch (P1) with audible checks over noteLog (by bar and track), undo/redo
import { openVp, mk, SETUP, mkCheck } from './v3-qa-v2e-libB.mjs';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp('P1');
const T = mk(p, cdp), {E} = T;
await E(SETUP(true)); await E(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(400);
// per bar, per track: sorted note numbers that sounded (song from bar 0, 300 bpm)
async function hear(bars) {
  await E(() => { const Q = window.SYNQUENZER; Q.setBpm(300); Q.clearLog(); Q.songPlay(0); });
  const t0 = await E(() => window.SYNQUENZER.runtime().beat);
  await p.waitForFunction(v => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= v; }, bars * 4 - .4, {timeout: 60000, polling: 10});
  const r = await E(() => ({log: window.SYNQUENZER.noteLog(4000), st: R.songPlay && R.songPlay.startBeat}));
  await E(() => window.SYNQUENZER.songPlay(false)); await p.waitForTimeout(250);
  await E(() => { SV.x = 0; FOL.page.song = null; UI.dirty.song = true; }); await p.waitForTimeout(150);
  const st = r.st != null ? r.st : 0;
  const out = Array.from({length: bars}, () => ({}));
  for (const n of r.log) { if (n.beat == null) continue; const sb = n.beat - st, bar = Math.floor(sb / 4 + 1e-6); if (bar < 0 || bar >= bars) continue; (out[bar][n.track] = out[bar][n.track] || []).push(n.out); }
  return out.map(o => { const s = {}; for (const k of Object.keys(o).sort()) s[k] = o[k].sort((x, y) => x - y).join(','); return JSON.stringify(s); });
}
const base = await hear(11);
console.log('base', base.join(' | '));
const p0 = await T.proj(), c0 = await T.clips(), u0 = await T.undoN();
// ×4 via touch
await T.tapCv(3 * 36 + 10, 9); await T.tapPop('×4');
let s = await E(() => window.SYNQUENZER.song());
check('×4: bars 11 → 23, STROPHE an T3, T7, T11, T15, REFRAIN ab T20', s.bars === 23 && JSON.stringify(s.marks.filter(m => m.part === 'P1').map(m => m.a)) === '[2,6,10,14]' && s.marks.find(m => m.id === 'M2').a === 19, [s.bars, s.marks]);
check('×4: ein Undo, Blatt bleibt offen', (await T.undoN()) === u0 + 1 && /msheet/.test((await T.pop()) || ''), [await T.undoN(), u0, await T.pop()]);
await T.tapPop('✕');
const h4 = await hear(23);
check('×4 hörbar: T7–18 klingen wie T3–6 (je Takt, je Spur), T19 wie alter T7, T20–23 wie alter T8–11', [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].every(k => h4[k] === base[2 + (k - 2) % 4]) && h4[18] === base[6] && [19, 20, 21, 22].every(k => h4[k] === base[k - 12]), h4.join(' | '));
await E(() => window.SYNQUENZER.undo()); await p.waitForTimeout(200);
check('Undo ×4 → deep-equal', (await T.proj()) === p0);
const hasRedo = await E(() => typeof window.SYNQUENZER.redo === 'function');
if (hasRedo) { await E(() => window.SYNQUENZER.redo()); await p.waitForTimeout(200); s = await E(() => window.SYNQUENZER.song()); check('Redo ×4 → wieder 23 Takte', s.bars === 23, s.bars); await E(() => window.SYNQUENZER.undo()); await p.waitForTimeout(200); }
// swap ▶ (STROPHE ↔ REFRAIN, the break T7 between)
await T.tapCv(3 * 36 + 10, 9);
const sw = await E(() => { const p = document.querySelector('#popLayer .pop'); const b = p.querySelector('[data-a="swapR"]'); const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, dis: b.disabled}; });
await T.tap(sw.x, sw.y);
s = await E(() => window.SYNQUENZER.song());
check('▶ tauscht STROPHE mit REFRAIN (REFRAIN T3–6, Break T7, STROPHE T8–11)', JSON.stringify(s.marks.map(m => [m.id, m.a, m.len])) === JSON.stringify([['M1', 0, 2], ['M2', 2, 4], ['M3', 7, 4]]) || JSON.stringify(s.marks.slice().sort((x, y) => x.a - y.a).map(m => [m.id, m.a, m.len])) === JSON.stringify([['M1', 0, 2], ['M2', 2, 4], ['M3', 7, 4]]), s.marks);
await E(() => { if (UI.pop) closePop(); });
const hs = await hear(11);
check('▶ Tausch hörbar: T3–6 = alter T8–11, T7 = alter T7, T8–11 = alter T3–6', [2, 3, 4, 5].every(k => hs[k] === base[k + 5]) && hs[6] === base[6] && [7, 8, 9, 10].every(k => hs[k] === base[k - 5]), hs.join(' | '));
await E(() => window.SYNQUENZER.undo()); await p.waitForTimeout(200);
check('Undo Tausch → deep-equal', (await T.proj()) === p0);
// Ersetzen durch ▾: the list holds parts AND scenes
await T.tapCv(3 * 36 + 10, 9);
const rp = await E(() => { const b = document.querySelector('#popLayer .pop [data-a="repl"]'); const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
await T.tap(rp.x, rp.y);
const list = await E(() => [...document.querySelectorAll('#popLayer .pop button[data-r]')].map(b => b.dataset.r + ':' + b.textContent));
check('Ersetzen durch ▾ listet Teile und Szenen', list.some(x => x.startsWith('P')) && list.some(x => x.startsWith('S')), list);
const s1 = list.find(x => x.startsWith('S1'));
if (s1) {
  await T.tapPop('Szene 1');
  s = await E(() => window.SYNQUENZER.song());
  console.log('after replace by Szene 1', s.bars, JSON.stringify(s.marks));
  check('Ersetzen durch Szene 1: Marke an T3 heißt Szene 1, Länge 1 (Szene 1 = 1-Takt-Clips), der Rest rückt (bars 8)', s.bars === 8 && s.marks.some(m => m.a === 2 && m.len === 1 && m.part === 'S1'), [s.bars, s.marks]);
  const hr = await hear(8);
  check('Ersetzen hörbar: T3 klingt Szene 1 (Bass 45, Drums 36), T4–8 wie alter T7–11', /"0":"45,45"/.test(hr[2]) && /"4":"36,36"/.test(hr[2]) && [3, 4, 5, 6, 7].every(k => hr[k] === base[k + 3]), hr.join(' | '));
  await E(() => window.SYNQUENZER.undo()); await p.waitForTimeout(200);
  check('Undo Ersetzen → deep-equal', (await T.proj()) === p0);
}
// Löschen: melody behind moves with (TA5)
const melB = await E(() => JSON.stringify(window.SYNQUENZER.song().mel));
await T.tapCv(3 * 36 + 10, 9); await T.tapPop('Löschen');
s = await E(() => window.SYNQUENZER.song());
const melA = s.mel;
console.log('mel before', melB, 'after', JSON.stringify(melA));
const mb = JSON.parse(melB)[5].notes, ma = melA[5].notes;
const expect = mb.filter(n => n.t < 8 - .25 || n.t >= 24 - .25).map(n => +(n.t >= 24 - .25 ? n.t - 16 : n.t).toFixed(3));
check('Löschen: Melodie rückt mit (Noten ≥ T7 um −16 Schläge, Noten in der Marke weg)', JSON.stringify(ma.map(n => +n.t.toFixed(3))) === JSON.stringify(expect), [ma.map(n => n.t), expect]);
await E(() => window.SYNQUENZER.undo()); await p.waitForTimeout(200);
check('Clips nie geändert', (await T.clips()) === c0);
check('0 Konsolenfehler', !errs.length, errs);
await b.close();
process.exit(done() ? 1 : 0);
