// G9U T9: Regression zu den Funden der unabhängigen Prüfung (feste Silbe ohne Marke, Überzahl am Ende, Diktat, Schließen, [+] mitten im Wort,
// unveränderter Ganzer Text, fremdes ↶ beim Tippen, [+] ohne Tippen, Silbe › löst Verschmelzung, Tippen auf Ton-Marke, lange VS5b-Silbe)
import {launch, open, clickTake, sleep, report, deq, U, V, LY, SET} from './h.mjs';
const ok = report(), br = await launch(); const {p, errs} = await open(br);
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const T = Array.from({length: 16}, (_, k) => 0.3 + k * 0.22), tk = await clickTake(p, T, 4), id = tk.id, mk = tk.marks.map(m => m.t);
const setLy = s => p.evaluate(([id, s]) => { S.takes[id].ly = SYNQUENZER.g9NormLy({v: 1, lang: 'de', src: 'getippt', s}, 4); delete S.takes[id].lyrics; G9.ctx = null; }, [id, s]);
const xs = ly => ly.s.map(s => s.x + '@' + s.t.toFixed(2) + (s.o ? 'o' : '') + (s.j ? 'j' : '') + (s.u ? 'u' : '')).join(' ');
await p.evaluate(() => SYNQUENZER.g9Syl('a', 'de'));
// 1) feste Silbe ohne Marke als Schranke (24 Fälle)
let bad = 0, n = 0;
for (const op of [{op: 'word', text: 'Sonnenblume'}, {op: 'shift', d: 1}, {op: 'ins', text: 'Ab-end-rot'}, {op: 'nach', n: 2}]) for (const k of [0, 1, 2]) {
  await setLy([{x: 'a', t: mk[0], w: 1}, {x: 'b', t: mk[1] + .11, w: 1, u: 1}, {x: 'c', t: mk[2], w: 1}, {x: 'd', t: mk[3], w: 1}, {x: 'e', t: mk[4], w: 1}]);
  if (op.op === 'nach') await SET(p, id, {op: 'word', k: 0, text: 'a-x-y'});
  n++; await SET(p, id, Object.assign({k}, op)); const ly = await LY(p, id);
  const b = ly.s.find(s => s.x === 'b'), seq = ly.s.map(s => s.x).join('');
  const mono = ly.s.every((s, i) => !i || s.t >= ly.s[i - 1].t), anyO = ly.s.some(s => s.o && /^[a-e]$/.test(s.x));   // Überzahl nur im neuen Wort erlaubt (höchstens 3 je Marke)
  if (!b || Math.abs(b.t - (mk[1] + .11)) > 1e-6 || !mono || anyO || !/b/.test(seq)) { bad++; console.log('   nm', op.op, k, xs(ly)); }
}
ok(bad === 0, 'feste Silbe ohne Marke bleibt an ihrer Zeit, nichts überholt sie, keine Silbe wird rot (' + (n - bad) + '/' + n + ')');
// 2) Überzahl an einer früheren Marke bleibt dort
await setLy([{x: 'a', t: mk[0], w: 1}, {x: 'b', t: mk[0], j: 1}, {x: 'c', t: mk[0], j: 1}, {x: 'd', t: mk[0], o: 1}]);
await SET(p, id, {op: 'word', k: 5, text: 'x'}); let ly = await LY(p, id);
ok(ly.s.find(s => s.x === 'd').t === mk[0] && ly.s.find(s => s.x === 'd').o === 1, 'Überzählige an Marke 1 bleibt nach einer Aktion anderswo dort: ' + xs(ly));
// 3) Diktat mehrerer Wörter
await p.evaluate(id => { delete S.takes[id].ly; delete S.takes[id].lyrics; G9.ctx = null; }, id);
await p.evaluate(r => { SYNQUENZER.wpOpen(r); SYNQUENZER.g9Text(r, true); SYNQUENZER.g9Sel(0); WP.ed.g9.field.focus(); }, tk.ref); await sleep(100);
await p.keyboard.insertText('ich liebe dich so'); await sleep(50); await p.keyboard.press('Enter'); await sleep(50);
ly = await LY(p, id); ok(ly && ly.s.map(s => s.x).join(' ') === 'ich lie be dich so', 'Diktat „ich liebe dich so“ → alle Wörter übernommen: ' + (ly && ly.s.map(s => s.x).join(' ')));
// 4) Getipptes Wort beim Schließen über [Text] / ✕
await p.evaluate(() => SYNQUENZER.g9Sel(10)); await p.keyboard.type('Herz');
await p.evaluate(() => { document.activeElement.blur(); document.querySelector('#wpSheet .wptx').click(); }); await sleep(100);
ly = await LY(p, id); ok(ly.s.some(s => s.x === 'Herz'), 'Wort ohne Leertaste, dann [Text] → übernommen');
await p.evaluate(r => { SYNQUENZER.g9Text(r, true); SYNQUENZER.g9Sel(12); WP.ed.g9.field.focus(); }, tk.ref); await p.keyboard.type('Sonne');
await p.evaluate(() => { document.activeElement.blur(); document.querySelector('#wpSheet .sh-x').click(); }); await sleep(100);
ly = await LY(p, id); ok(ly.s.some(s => s.x === 'Son' || s.x === 'Sonne'), 'Wort ohne Leertaste, dann ✕ → übernommen');
// 5) [+] auf der 2. Silbe eines Worts
await setLy([{x: 'a', t: mk[0], w: 1}, {x: 'Lie', t: mk[1], w: 1}, {x: 'be', t: mk[2]}, {x: 'c', t: mk[3], w: 1}]);
await SET(p, id, {op: 'ins', k: 2, text: 'x'}); ly = await LY(p, id);
ok(xs(ly) === `a@${mk[0].toFixed(2)} x@${mk[1].toFixed(2)}u Lie@${mk[2].toFixed(2)} be@${mk[3].toFixed(2)} c@${mk[4].toFixed(2)}`, '[+] auf „be“: Wort vor „Lie-be“, ohne Verschmelzen: ' + xs(ly));
// 6) unveränderter Ganzer Text + ✓ → nichts
await p.evaluate(r => { SYNQUENZER.wpOpen(r); SYNQUENZER.g9Text(r, true); }, tk.ref); await sleep(100);
await SET(p, id, {op: 'word', k: 0, text: 'Du'}); const ly6 = await LY(p, id), u6 = (await U(p)).n;
await p.evaluate(() => document.querySelector('#wpSheet .g9tx').click()); await sleep(150);
await p.evaluate(() => document.querySelector('.pop.g9txt .g9ok').dispatchEvent(new MouseEvent('click', {bubbles: true}))); await sleep(150);
await p.evaluate(() => { const b = document.querySelector('.pop.g9txt .g9ok'); if (b) { const r = b.getBoundingClientRect(); window.__b = [r.left + 5, r.top + 5]; } });
const bb = await p.evaluate(() => window.__b); if (bb) { await p.touchscreen.tap(bb[0], bb[1]); await sleep(150); }
ok(deq(await LY(p, id), ly6) && (await U(p)).n === u6, 'unveränderter [Ganzer Text] + ✓ → nichts geändert, kein Undo');
// 7) fremdes ↶ während des Tippens: Getipptes wird nicht über den Schritt gelegt
await p.evaluate(() => { SYNQUENZER.g9Sel(8); WP.ed.g9.field.focus(); }); await p.keyboard.type('Mond');
const u7 = await U(p); await p.evaluate(() => SYNQUENZER.undo()); const r7 = (await U(p)).redo;
await p.evaluate(() => document.activeElement.blur()); await sleep(150);
ok((await U(p)).redo === r7 && r7 > 0, '↶ während des Tippens, dann „Fertig“: ↷ bleibt möglich (Getipptes verworfen)');
await p.evaluate(() => SYNQUENZER.redo());
// 8) [+] ohne Tippen verdoppelt nicht
await p.evaluate(() => SYNQUENZER.g9Sel(0)); const ly8 = await LY(p, id);
await p.evaluate(() => document.querySelector('#wpSheet .g9ins').click()); await sleep(50);
ok(deq(await LY(p, id), ly8), '[+] ohne Tippen fügt nichts ein (grau)');
// 9) Silbe › auf verschmolzener Gruppe löst sie zuerst
await setLy([{x: 'a', t: mk[0], w: 1}, {x: 'b', t: mk[0], w: 1, j: 1}, {x: 'c', t: mk[1], w: 1}]);
await SET(p, id, {op: 'shift', k: 0, d: 1}); ly = await LY(p, id);
ok(xs(ly) === `a@${mk[0].toFixed(2)} b@${mk[1].toFixed(2)} c@${mk[2].toFixed(2)}`, 'Silbe › auf „a·b“: Verschmelzung löst sich, Rest rückt: ' + xs(ly));
// 10) Tippen auf eine Marke ohne Silben-Platz (Ton-Marke)
await p.evaluate(([id, F]) => SYNQUENZER.g9FeatSim(id, F), [id, tk.marks.map((k, j) => ({rise: j === 6 ? 0 : 6, gap: 0, pj: j === 6 ? 120 : 0, vo: 1, von: k.t + .04, uv: 0, dur: .22, conf: 1}))]);
const r10 = await SET(p, id, {op: 'word', k: 6, text: 'Ton'}); ly = await LY(p, id);
ok(r10.ok && ly.s.some(s => s.x === 'Ton' && s.t === mk[6]), 'Tippen auf einer Ton-Marke: Wort landet dort (nicht verworfen)');
await p.evaluate(id => SYNQUENZER.g9FeatSim(id, null), id);
// 11) VS5b-Silbe über 24 Zeichen: kein Buchstabe verloren
await p.evaluate(id => { delete S.takes[id].ly; G9.ctx = null; }, id);
const long = 'Donaudampfschifffahrtsgesellschaft';
await p.evaluate(([id, t]) => SYNQUENZER.wpLyrics(id, t), [id, 'a ' + long + ' b']);
await SET(p, id, {op: 'shift', k: 3, d: 1}); ly = await LY(p, id);
ok(ly.s.map(s => s.x).join('').includes(long), 'lange VS5b-Silbe (34 Zeichen) wird geteilt, nichts gekürzt');
// 12) Ganzer Text > 4000 Silben: Hinweis
const r12 = await SET(p, id, {op: 'text', text: Array.from({length: 4100}, () => 'la').join(' ')});
ok(/gekürzt auf 4000/.test(r12.toast) && (await LY(p, id)).s.length === 4000, 'Ganzer Text über 4000 Silben → „' + r12.toast + '“');
ok(errs.length === 0, 'keine Fehler ' + errs.join('|'));
process.exitCode = ok.done(); await br.close();
