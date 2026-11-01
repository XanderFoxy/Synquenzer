// G10-62: ▲ von E in C-Dur mit Quantisieren an → F (und F → G: Stufe, kein Halbton). Halten + Ziehen → F♯ möglich. Ohne Quantisieren wie
// heute (Halbton). Dazu: Ziehen ohne Halten rastet auf Leitertöne, Halten ohne Ziehen = „nicht rastern“, jede Geste genau 1 Undo, Vorhören.
// Gesten per CDP-Touch (wie der Finger auf dem iPhone).
import {launch, open, takeIn, edOpen, sleep, ok, done} from './lib.mjs';
const br = await launch(), p = await open(br, 428, 926);
const cdp = await p.ctx.newCDPSession(p);
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
const geom = () => p.evaluate(() => SYNQUENZER.g2Geom());
const info = r => p.evaluate(r => SYNQUENZER.g10gInfo(r), r);
const undoN = () => p.evaluate(() => UNDO.length);
const NN = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'], nm = x => NN[((Math.round(x) % 12) + 12) % 12];
async function drag(k, rows, hold) {
  const G = await geom(), b = G.blocks.find(z => z.k === k), x = (b.x0 + b.x1) / 2, y = b.y;
  await touch('touchStart', x, y); await sleep(hold ? 650 : 60);
  const dy = -rows * G.rowH; for (let i = 1; i <= 8; i++) { await touch('touchMove', x, y + dy * i / 8); await sleep(25); }
  await touch('touchEnd'); await sleep(350);
}
async function hold(k) { const G = await geom(), b = G.blocks.find(z => z.k === k), x = (b.x0 + b.x1) / 2; await touch('touchStart', x, b.y); await sleep(650); await touch('touchEnd'); await sleep(350); }
async function tapNote(k) { const G = await geom(), b = G.blocks.find(z => z.k === k); await touch('touchStart', (b.x0 + b.x1) / 2, b.y); await sleep(50); await touch('touchEnd'); await sleep(200); }
const chip = async v => { await p.tap(`#wpSheet .g2chips [data-v="${v}"]`); await sleep(350); };

const mel = [64.2, 65.1, 64.3, 65.2, 69.1, 64.2].map(m => ({m, d: 0.32}));     // E F E F A E
const T = await takeIn(p, mel); await edOpen(p, T.ref);
await p.evaluate(r => SYNQUENZER.g2Quantize(r, {q: true, mode: 'hard', str: 1}), T.ref); await sleep(300);
let I = await info(T.ref);
ok(I.targets.map(nm).join(' ') === 'E F E F A E' && I.now.root === 0 && I.now.scale === 'ionian', 'Ausgang: C-Dur, Hart 100 %: ' + I.targets.map(nm).join(' '));
// 1) ▲ auf E → F, noch einmal ▲ → G (Stufe)
let u = await undoN(), h0 = I.heard.length;
await tapNote(0); await chip('up'); I = await info(T.ref);
ok(nm(I.targets[0]) === 'F' && (await undoN()) === u + 1, `▲ von E (Quantisieren an) → ${nm(I.targets[0])}, 1 Undo`);
u = await undoN(); await chip('up'); I = await info(T.ref);
ok(nm(I.targets[0]) === 'G' && I.targets[0] - 65 === 2 && (await undoN()) === u + 1, `▲ von F → ${nm(I.targets[0])} (2 Halbtöne = eine Stufe in C-Dur), 1 Undo`);
ok(I.heard.length >= h0 + 2 && Math.abs(I.heard[I.heard.length - 1].rate - Math.pow(2, 2 / 12)) < 1e-4, `Vorhören bei ▲: ${I.heard.slice(-2).map(h => 'd=' + h.d + ' Rate ' + h.rate).join(', ')}`);
// 2) senkrecht ziehen (ohne Halten) eine Zeile: E → F; von F eine Zeile → G (F♯ liegt nicht in der Leiter)
u = await undoN(); await drag(2, 1, false); I = await info(T.ref);
ok(nm(I.targets[2]) === 'F' && (await undoN()) === u + 1, `Ziehen +1 Zeile von E → ${nm(I.targets[2])}, 1 Undo`);
u = await undoN(); await drag(2, 1, false); I = await info(T.ref);
ok(nm(I.targets[2]) === 'G' && (await undoN()) === u + 1, `Ziehen +1 Zeile von F → ${nm(I.targets[2])} (stufenweise), 1 Undo`);
// 3) Halten + Ziehen: frei in Halbtönen → F♯
u = await undoN(); await drag(3, 1, true); I = await info(T.ref);
ok(nm(I.targets[3]) === 'F♯' && (await undoN()) === u + 1, `Halten + Ziehen +1 Zeile von F → ${nm(I.targets[3])} (frei), 1 Undo`);
ok(I.heard.some(h => h.k === 3 && h.d === 1), 'Vorhören beim Ziehen (Note 4, +1 Halbton)');
// 4) Halten ohne Ziehen auf A → „nicht rastern“; Plan: s = 0 für diese Note; ↶ nimmt es zurück
u = await undoN(); await hold(4); I = await info(T.ref);
ok(I.nq[4] === true && I.plan.notes[4].s === 0 && I.plan.notes[4].to === I.plan.notes[4].m && (await undoN()) === u + 1, `Halten auf A → nicht rastern (nq), Kern bekommt s = 0, 1 Undo`);
await p.screenshot({path: new URL('./bilder/nq-428x926.png', import.meta.url).pathname});
await p.evaluate(() => undo()); await sleep(300); I = await info(T.ref);
ok(I.nq[4] === false, '↶ nimmt „nicht rastern“ zurück');
// 5) ohne Quantisieren wie heute: ▲ = ein Halbton (F → F♯)
await chip('off'); await sleep(200);
I = await info(T.ref); const before = I.targets ? I.targets[1] : null;
u = await undoN(); await tapNote(1); await chip('up'); I = await info(T.ref);
const t1 = I.targets ? I.targets[1] : null;
ok(t1 != null && Math.abs(t1 - 65.1 - 1) < 0.05 && (await undoN()) === u + 1, `ohne Quantisieren: ▲ = +1 Halbton (gesungen 65,1 → ${t1}), 1 Undo`);
// 6) Regler Einrast-Zeit: eine Geste (input … change) = 1 Undo; setzt v = 2, rt
await chip('hard'); await sleep(200); u = await undoN();
await p.evaluate(() => { const i = document.querySelector('#wpSheet .g10g-rt input'); for (const v of [20, 30, 45, 60]) { i.value = v; i.dispatchEvent(new Event('input')); } i.dispatchEvent(new Event('change')); }); await sleep(300);
I = await info(T.ref);
ok(I.rt === 60 && I.v === 2 && I.plan.rt === 60 && (await undoN()) === u + 1, `Einrast-Zeit 60 ms: rt ${I.rt}, Plan rt ${I.plan.rt}, 1 Undo für die ganze Geste`);
// 7) Tonart-Chip: jede Wahl 1 Undo
u = await undoN(); await p.tap('#wpSheet .g10g-kc'); await sleep(200); await p.tap('#wpSheet .g10g-kp [data-root="2"]'); await sleep(300); await p.tap('#wpSheet .g10g-kp [data-scale="dorian"]'); await sleep(300);
I = await info(T.ref);
ok(I.key.root === 2 && I.key.scale === 'dorian' && (await undoN()) === u + 2, `Leiste: D, dann Dorisch → ${JSON.stringify(I.key)}, 2 Tipps = 2 Undo`);
ok(!p.errs.length, 'Konsole sauber ' + JSON.stringify(p.errs.slice(0, 2)));
await br.close(); done();
