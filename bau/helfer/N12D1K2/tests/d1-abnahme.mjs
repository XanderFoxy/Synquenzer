// D1 Abnahme: the scheduled drum hits while the clip really plays (AudioContext, 240 BPM), counted in steps from the clip start.
// D1-01 hi-hat 12 steps against kick 16: measured hits; after 48 steps congruent again. D1-02 rückwärts / Pendel / Zufall as defined,
// two runs = the same hits. D1-03 [×2] (touch) doubles the content, one undo; save -> load deep-equal; an old clip (no lanes) plays
// exactly as on 4.23.0. Usage: node d1-abnahme.mjs
import {app, report} from './touch-lib.mjs';
const BASE = new URL('../../../werkzeug/vs-base-B.html', import.meta.url).pathname;
const res = [], add = (id, pass, info) => res.push({id, pass, info});
const st = (n, gm, steps) => steps.map(s => ({t: s * .25, d: .1, n: gm, v: .8}));
async function hits(p, clip, steps) {
  return p.evaluate(async ([clip, steps]) => {
    const S = window.SYNQUENZER; S.stop(); S.setBpm(240); S.setClip(4, 0, clip);
    const rec = []; const h0 = drumHit; drumHit = (gm, v, t, src, ex, o) => { if (src === 'clip') rec.push([gm, t2b(t)]); return h0(gm, v, t, src, ex, o); };
    S.launchClip(4, 0); S.play();
    const dur = steps * .25 * 60 / 240 * 1000 + 600; await new Promise(r => setTimeout(r, dur));
    const cs = R.cstart[4]; S.stop(); drumHit = h0;
    return rec.map(([gm, b]) => [gm, Math.round((b - cs) / .25)]).filter(x => x[1] >= 0 && x[1] < steps).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  }, [clip, steps]);
}
const A = await app({width: 390, height: 844}), {p, tap} = A;
await p.mouse.click(200, 300); await p.waitForTimeout(200);
await p.evaluate(() => { const S = window.SYNQUENZER; for (let i = 0; i < 4; i++) S.clearClip && S.clearClip(i, 0); });
const K = {root: 0, scale: 'ionian'};
// D1-01
const c1 = {len: 1, key: K, notes: [...st(0, 36, [0, 4, 8, 12]), ...st(0, 42, [0, 5, 13])], lanes: {42: {len: 12}}};
const h1 = await hits(p, c1, 100);
const hh = h1.filter(x => x[0] === 42).map(x => x[1]), kk = h1.filter(x => x[0] === 36).map(x => x[1]);
const expHH = []; for (let g = 0; g < 100; g++) if (g % 12 === 0 || g % 12 === 5) expHH.push(g);
const expK = []; for (let g = 0; g < 100; g++) if (g % 16 % 4 === 0) expK.push(g);
const cong = [0, 48].map(o => h1.filter(x => x[1] >= o && x[1] < o + 48).map(x => x[0] + ':' + (x[1] - o)).join(','));
add('D1-01', JSON.stringify(hh) === JSON.stringify(expHH) && JSON.stringify(kk) === JSON.stringify(expK) && cong[0] === cong[1],
  `Hi-Hat 12 Schritte: Treffer ${hh.slice(0, 8).join(',')}… (Soll g mod 12 ∈ {0,5}; Schritt 13 liegt hinter der Klammer und schweigt), Kick 16: ${kk.slice(0, 6).join(',')}…; Schritt 0–47 = 48–95: ${cong[0] === cong[1]}`);
// D1-02
const dirs = [['rev', {len: 5}, [0, 1], g => [0, 1].includes(4 - g % 5)], ['pend', {len: 4}, [0, 3], g => { const m = g % 6, q = m < 4 ? m : 6 - m; return q === 0 || q === 3; }]];
for (const [dir, l, steps, f] of dirs) {
  const c = {len: 1, key: K, notes: st(0, 42, steps), lanes: {42: Object.assign({dir}, l)}};
  const h = (await hits(p, c, 64)).map(x => x[1]), exp = []; for (let g = 0; g < 64; g++) if (f(g)) exp.push(g);
  const h2 = (await hits(p, c, 64)).map(x => x[1]);
  add(`D1-02 ${dir}`, JSON.stringify(h) === JSON.stringify(exp) && JSON.stringify(h) === JSON.stringify(h2), `${dir === 'rev' ? 'rückwärts' : 'Pendel'}: ${h.slice(0, 10).join(',')}… (Soll ${exp.slice(0, 10).join(',')}…), zweiter Lauf gleich: ${JSON.stringify(h) === JSON.stringify(h2)}`);
}
{ const c = {len: 1, key: K, notes: st(0, 42, [0, 2, 3]), lanes: {42: {len: 8, dir: 'rnd', seed: 5}}};
  const h = (await hits(p, c, 64)).map(x => x[1]), h2 = (await hits(p, c, 64)).map(x => x[1]);
  const exp = await p.evaluate(() => { const l = {Ls: 8, dir: 'rnd', seed: 5}, o = []; for (let g = 0; g < 64; g++) if ([0, 2, 3].includes(d1Pos(l, g, 42))) o.push(g); return o; });
  const fwd = []; for (let g = 0; g < 64; g++) if ([0, 2, 3].includes(g % 8)) fwd.push(g);
  const c6 = JSON.parse(JSON.stringify(c)); c6.lanes[42].seed = 6; const h6 = (await hits(p, c6, 64)).map(x => x[1]);
  add('D1-02 rnd', JSON.stringify(h) === JSON.stringify(h2) && JSON.stringify(h) === JSON.stringify(exp) && JSON.stringify(h) !== JSON.stringify(fwd) && JSON.stringify(h6) !== JSON.stringify(h),
    `Zufall Startwert 5: ${h.slice(0, 10).join(',')}… zwei Läufe gleich: ${JSON.stringify(h) === JSON.stringify(h2)}, anders als vorwärts, Startwert 6 anders: ${JSON.stringify(h6) !== JSON.stringify(h)}`); }
// D1-03 ×2 with a real tap (popover), undo, save/load
await p.evaluate(K => { const S = window.SYNQUENZER; S.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .8}, {t: 1.5, d: .1, n: 42, v: .55, a: 1}], lanes: {42: {len: 12, dir: 'pend'}}}); S.openRoll(4, 0); }, K);
await p.waitForTimeout(400); await p.evaluate(() => { ED.dVoice = DRUM_VOICES.findIndex(v => v.gm === 42); safeRebuild(buildDrumEd); }); await p.waitForTimeout(250);
const before = await p.evaluate(() => window.SYNQUENZER.getClip(4, 0)), u0 = await p.evaluate(() => window.SYNQUENZER.undoInfo().n);
let b = await p.evaluate(() => { const r = document.querySelector('.d1b').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }); await tap(b.x, b.y); await p.waitForTimeout(300);
b = await p.evaluate(() => { const r = document.querySelector('.pop.d1p .d1x').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }); await tap(b.x, b.y); await p.waitForTimeout(400);
const after = await p.evaluate(() => window.SYNQUENZER.getClip(4, 0)), u1 = await p.evaluate(() => window.SYNQUENZER.undoInfo().n);
const dbl = after.len === 2 && after.notes.length === 4 && JSON.stringify(after.notes.slice(2).map(n => [n.t - 4, n.n, n.v, n.a])) === JSON.stringify(before.notes.map(n => [n.t, n.n, n.v, n.a])) && JSON.stringify(after.lanes) === JSON.stringify(before.lanes);
add('D1-03 ×2', dbl && u1 === u0 + 1, `×2 per Tipp: ${before.len} → ${after.len} Takte, Noten ${before.notes.length} → ${after.notes.length} (Kopie gleich), Spuren bleiben, Undo +${u1 - u0}`);
await p.evaluate(() => window.SYNQUENZER.undo()); await p.waitForTimeout(150);
add('D1-03 Undo', JSON.stringify(await p.evaluate(() => window.SYNQUENZER.getClip(4, 0))) === JSON.stringify(before), 'Undo = Ausgangslage (deep-equal, auch lanes)');
// direction / length via the popover (touch): one undo when it closes
b = await p.evaluate(() => { const r = document.querySelector('.d1b').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }); await tap(b.x, b.y); await p.waitForTimeout(300);
b = await p.evaluate(() => { const x = [...document.querySelectorAll('.pop.d1p .d1dirs button')].find(e => e.dataset.d === 'rev'); const r = x.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }); await tap(b.x, b.y); await p.waitForTimeout(150);
await tap(5, 5); await p.waitForTimeout(300);
const c3 = await p.evaluate(() => window.SYNQUENZER.getClip(4, 0)), u3 = await p.evaluate(() => window.SYNQUENZER.undoInfo().n), lbl = await p.evaluate(() => document.querySelector('.d1b').textContent);
add('D1-03 Richtung', c3.lanes[42].dir === 'rev' && c3.lanes[42].len === 12 && u3 === u0 + 1 && lbl.includes('12') && lbl.includes('←'), `Richtung per Tipp: ${JSON.stringify(c3.lanes)}, Undo +${u3 - u0}, Knopf „${lbl}“`);
const rt = await p.evaluate(async () => { const S = window.SYNQUENZER, j = S.serialize(), c0 = S.getClip(4, 0); S.importJSON(j); await new Promise(r => setTimeout(r, 300)); const c1 = S.getClip(4, 0); return {same: JSON.stringify(c0) === JSON.stringify(c1), lanes: c1.lanes}; });
add('D1-03 Laden', rt.same, `Speichern → Laden deep-equal: ${rt.same}, lanes ${JSON.stringify(rt.lanes)}`);
const bad = await p.evaluate(() => { const S = window.SYNQUENZER; S.setClip(4, 1, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [], lanes: {42: {len: 99, dir: 'quer'}, 7: {len: 3}, 36: {len: 0.4}}}); return S.getClip(4, 1).lanes; });
add('D1-03 Norm', JSON.stringify(bad) === JSON.stringify({36: {len: 1}, 42: {len: 64}}), `ungültige Felder normiert: ${JSON.stringify(bad)}`);
add('D1-E', A.errs.length === 0, 'keine Fehler: ' + JSON.stringify(A.errs.slice(0, 3)));
await A.b.close();
// old clip (no lanes) plays exactly as on 4.23.0 (with chance / ratchet / timing steps)
const OLD = {len: 2, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 1, d: .1, n: 38, v: .7, r: 3}, {t: 1.75, d: .1, n: 42, v: .5, p: .5}, {t: 2.5, d: .1, n: 42, v: .6, m: .2}, {t: 6, d: .1, n: 36, v: .8, a: 1}], seed: 77};
const out = [];
for (const f of [BASE, undefined]) { const X = await app({width: 390, height: 844}, f); await X.p.mouse.click(200, 300); await X.p.waitForTimeout(200); out.push(await hits(X.p, OLD, 96)); await X.b.close(); }
add('D1-03 alt', JSON.stringify(out[0]) === JSON.stringify(out[1]) && out[0].length > 10, `alter Clip ohne lanes: ${out[1].length} Treffer, gleich wie 4.23.0: ${JSON.stringify(out[0]) === JSON.stringify(out[1])}`);
report('D1', res);
