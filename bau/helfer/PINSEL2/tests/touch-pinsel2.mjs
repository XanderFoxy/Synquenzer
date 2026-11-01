// PINSEL2 Touch-Test: schnelles Durchwischen ändert nichts; Verweilen auf 3 Zielen setzt genau diese; alles = 1 Undo; kurzer Tipp = nichts
import { chromium } from 'playwright';
const file = process.argv[2];
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 926, height: 428}, hasTouch: true});
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + file); await p.waitForTimeout(1200);
await p.evaluate(() => {
  const host = document.createElement('div'); host.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#111;display:grid'; document.body.appendChild(host);
  const notes = []; for (let i = 0; i < 16; i++) notes.push({t: i * .25, d: .24, n: 60, v: .8});
  let c = {len: 1, key: {root: 0, scale: 'ionian'}, notes}, snap = null; const U = [];
  const model = {getClip: () => c, begin() { snap = JSON.stringify(c); }, end(ch) { if (ch) U.push(snap); snap = null; }, revert() { if (snap) c = JSON.parse(snap); snap = null; },
    undo() { if (U.length) c = JSON.parse(U.pop()); }, redo() {}, canUndo: () => U.length > 0, canRedo: () => false, audition() {}};
  window.__T = {model, U, get c() { return c; }, ticks: 0};
  window.__R = PianoRoll.create(host, model, {grid: '1/16', rowH: 22, center: 62, onTick: () => window.__T.ticks++});
  window.__R.mp.setKey({root: 0, scale: 'ionian'});
  [...host.querySelectorAll('button')].find(x => x.textContent === 'Pinsel').click();
  // Finger im Seiten-Takt: [beat, note, Wartezeit ms danach]
  const cv = host.querySelector('.pr-main canvas');
  window.__drive = async path => { const ev = (ty, q) => cv.dispatchEvent(new PointerEvent(ty, {pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: q.x, clientY: q.y}));
    const pt = ([bt, n]) => window.__R._xy(bt, n), w = ms => new Promise(r => setTimeout(r, ms));
    ev('pointerdown', pt(path[0])); await w(path[0][2] || 0);
    for (let i = 1; i < path.length; i++) { ev('pointermove', pt(path[i])); if (path[i][2]) await w(path[i][2]); }
    ev('pointerup', pt(path[path.length - 1])); await w(60); };
});
const st = await p.evaluate(() => window.__R.mp.state); console.log('Zustand', JSON.stringify({w: st.w, hold: st.hold, fine: st.fine}));
const pitches = () => p.evaluate(() => window.__T.c.notes.map(n => n.n).join(','));
const undos = () => p.evaluate(() => window.__T.U.length);
const before = await pitches();
// 1) schnelles Durchwischen in 260 ms: quer über alle 16 Spalten, Bogen hoch und runter
const wipe = []; for (let i = 0; i <= 32; i++) { const f = i / 32; wipe.push([0.05 + 3.9 * f, 60 + Math.round(9 * Math.sin(f * Math.PI)), 8]); }
wipe[0][2] = 10;
await p.evaluate(path => window.__drive(path), wipe);
console.log('1 schnelles Wischen ändert nichts:', (await pitches()) === before, '· Undo-Schritte', await undos());
// 2) drei Ziele mit Verweilen (140 ms), Wege dazwischen schnell; Abstand > 8 Schritte zwischen 1 und 2 (kein Auffüllen), 2→3 = Lauf
const T = [[1, 64], [10, 69], [14, 62]], path = [];
for (let k = 0; k < T.length; k++) {
  if (k) { const [c0, n0] = T[k - 1], [c1, n1] = T[k]; for (let i = 1; i < 8; i++) { const f = i / 8; path.push([(c0 + (c1 - c0) * f) * .25 + .12, Math.round(n0 + (n1 - n0) * f), 6]); } }
  path.push([T[k][0] * .25 + .12, T[k][1], 140]);
}
await p.evaluate(pp => window.__drive(pp), path);
const res = await p.evaluate(() => window.__T.c.notes.map(n => n.n));
console.log('2 nach 3 Zielen:', res.join(','));
const ok3 = T.every(([c, n]) => res[c] === n), cut = res.map((n, i) => [i, n]).filter(([i, n]) => n !== 60 && !T.some(t => t[0] === i));
console.log('  Ziele gesetzt:', ok3, '· Ticks', await p.evaluate(() => window.__T.ticks), '· sonst geändert (nur Lauf 11–13 erlaubt):', JSON.stringify(cut), '· Undo-Schritte', await undos());
const runOk = cut.every(([i]) => i > 10 && i < 14);
await p.evaluate(() => window.__T.model.undo());
console.log('3 ein Undo = alles zurück:', (await pitches()) === before);
await p.evaluate(() => window.__drive([[2.12, 72, 30]]));
console.log('4 kurzer Tipp ändert nichts:', (await pitches()) === before);
console.log('Fehler', JSON.stringify(errs));
console.log(ok3 && runOk && !errs.length ? 'GRÜN' : 'ROT');
await b.close();
