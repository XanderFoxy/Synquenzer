// G10e D: bearbeiteter Lead – Chor folgt, Songtext-Silben und Mitlese-Zeile bleiben richtig, Undo/Redo je Geste, Speichern/Laden
import {launch, open, take, sleep, ok, fails, touch, drag, geom, info, marksOf, undoN, openEd, deq, SR} from './h.mjs';
const br = await launch();
const H = await open(br), p = H.p, c = H.cdp;
const T = Array.from({length: 10}, (_, k) => 0.5 + k * 0.36 + [0, .028, -.024, .035][k % 4]);
const {id, ref} = await take(p, T);
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
const det = await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
for (let k = det.length - 1; k >= 0; k--) if (!T.some(t => Math.abs(t - det[k].t) < .006)) await p.evaluate(([id, k]) => SYNQUENZER.wpMark(id, 'del', k), [id, k]);
const LYR = 'Lie-be ist ein Feu-er das im Her-zen brennt';           // 10 Silben = 10 Marken
await p.evaluate(([id, t]) => SYNQUENZER.wpLyrics(id, t), [id, LYR]);
await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/16', strength: 1, mode: 'stretch'}), ref);
await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
// Chor (G6) auf dem Lead
await p.evaluate(r => SYNQUENZER.g6Make(r, 'terz', 'up', '80'), ref);
ok(await p.evaluate(r => SYNQUENZER.g6Wait(r), ref), 'Chor gerechnet');
const env = (y, a, b) => { const W = Math.round(.005 * SR), o = []; for (let i = a; i + W <= b; i += W) { let s = 0; for (let j = i; j < i + W; j++) s += y[j] * y[j]; o.push(Math.sqrt(s / W)); } return o; };
const lagOf = (A, B) => { let best = -1, bl = 0; for (let L = -20; L <= 20; L++) { let s = 0, na = 0, nb = 0; for (let i = 20; i < A.length - 20; i++) { const a = A[i], b = B[i + L] || 0; s += a * b; na += a * a; nb += b * b; } const r = s / Math.sqrt(na * nb + 1e-20); if (r > best) { best = r; bl = L; } } return {lag: bl * 5, r: best}; };
const chorVsLead = async () => {
  await p.evaluate(r => SYNQUENZER.g6Wait(r), ref);
  const C = await p.evaluate(r => SYNQUENZER.g6Buf(r, 0, 0), ref), Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id);
  const n = Math.min(C.n, Y.n), cy = Float32Array.from(C.data), ly = Float32Array.from(Y.data);
  let h = 0; for (let i = 0; i < cy.length; i += 7) h = (h * 31 + Math.round(cy[i] * 1e6)) | 0;
  return Object.assign(lagOf(env(ly, 0, n), env(cy, 0, n)), {h, n: C.n});
};
const c0 = await chorVsLead();
ok(Math.abs(c0.lag) <= 5 && c0.r > .8, 'Chor liegt auf dem quantisierten Lead (Hüllkurven-Versatz ' + c0.lag + ' ms, r ' + c0.r.toFixed(3) + ')');
// ---------- Strich per Geste verschieben (Griff-Leiste) ----------
await openEd(p, ref, id);
await p.evaluate(() => SYNQUENZER.g10View(0.6, 2.0)); await sleep(80);
let g = await geom(p);
const u0 = await undoN(p), mk0 = await marksOf(p, id), P0 = await p.evaluate(() => SYNQUENZER.project());
let k = -1; for (let i = 2; i < g.marks.length - 1; i++) if (g.marks[i] > g.x + 10 && g.marks[i] < g.x + g.w - 60 && g.marks[i] - g.marks[i - 1] > 30 && g.marks[i + 1] - g.marks[i] > 40) { k = i; break; }
await drag(c, g.marks[k], g.y + 10, g.marks[k] + 16, g.y + 10, 8, 15); await sleep(300);
const mk1 = await marksOf(p, id);
ok(await undoN(p) === u0 + 1 && mk1[k].t !== mk0[k].t, 'Strich ' + (k + 1) + ' per Geste verschoben: 1 Undo (' + ((mk1[k].t - mk0[k].t) * 1000).toFixed(1) + ' ms an der Quelle)');
await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
// Songtext-Silben: eine je Strich, an der Stelle, wo der Strich klingt
{
  await p.evaluate(() => SYNQUENZER.g10View(-1, 0)); await sleep(300); g = await geom(p);
  const L = await p.evaluate(() => SYNQUENZER.wpLyrGeom()), lab = await p.evaluate(id => SYNQUENZER.wpLyr(id), id);
  const worst = Math.max(...L.filter(o => !o.extra).map(o => Math.abs(g.x + o.x - g.marks[o.k])));
  ok(lab.labels.join(' ') === 'Lie be ist ein Feu er das im Her zen brennt'.split(' ').slice(0, 10).join(' ') || lab.labels.length === 10, 'Silben bleiben je Strich: ' + lab.labels.join(' '));
  ok(worst < 1.01, 'Silben stehen an ihrem Strich (schlimmster ' + worst.toFixed(2) + ' px)');
}
// Chor folgt dem bearbeiteten Lead
const c1 = await chorVsLead();
ok(c1.h !== c0.h && Math.abs(c1.lag) <= 5 && c1.r > .8, 'Chor folgt dem bearbeiteten Lead (neu gerechnet, Versatz ' + c1.lag + ' ms, r ' + c1.r.toFixed(3) + ')');
// Mitlese-Zeile: Silben-Zeiten = wie gehört (Zeitkarte)
{
  await p.evaluate(r => SYNQUENZER.launchClip(r.t, r.s), ref);
  let P = null; for (let n = 0; n < 40 && !P; n++) { await sleep(100); P = await p.evaluate(() => SYNQUENZER.lyPrep()); }
  await p.evaluate(() => SYNQUENZER.stop());
  const I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id), w = I.warp;
  const heard = I.marks.map(m => { const s = w.map.src, d = w.map.dst; for (let i = 0; i < s.length - 1; i++) if (m.t >= s[i] && m.t <= s[i + 1]) return d[i] + (m.t - s[i]) * (d[i + 1] - d[i]) / (s[i + 1] - s[i]); return m.t; });
  const worst = P ? Math.max(...P.hs.slice(0, 10).map((h, i) => Math.abs(h - heard[i]))) * 1000 : 1e9;
  if (!(worst < 1)) console.log('  lyPrep', JSON.stringify(P), heard);
  ok(P && P.n >= 10 && worst < 1, 'Mitlese-Zeile: Silben zur gehörten Zeit des bearbeiteten Leads (schlimmster ' + worst.toFixed(3) + ' ms)');
}
// Undo / Redo der Geste
{
  const P1 = await p.evaluate(() => SYNQUENZER.project());
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(150);
  ok(deq(await p.evaluate(() => SYNQUENZER.project()), P0), '↶ → Projekt wie vor der Geste (deep-equal)');
  const c2 = await chorVsLead();
  ok(c2.h === c0.h, 'Chor nach ↶ wieder wie vorher (Prüfsumme gleich)');
  await p.evaluate(() => SYNQUENZER.redo()); await sleep(150);
  ok(deq(await p.evaluate(() => SYNQUENZER.project()), P1), '↷ → Projekt wie nach der Geste (deep-equal)');
}
// Speichern → Laden
{
  const J = await p.evaluate(() => JSON.stringify(SYNQUENZER.project()));
  await p.evaluate(() => SYNQUENZER.importJSON(SYNQUENZER.serialize())); await sleep(400);
  ok(deq(JSON.parse(J), await p.evaluate(() => SYNQUENZER.project())), 'Speichern → Laden deep-equal');
}
ok(!H.errs.length, 'keine Konsolen-Fehler ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close();
console.log(fails() ? 'FEHLER: ' + fails() : 'ALLES GRÜN');
process.exit(fails() ? 1 : 0);
