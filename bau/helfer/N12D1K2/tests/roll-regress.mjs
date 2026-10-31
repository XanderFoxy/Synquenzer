// Regression roll: the same touch actions (buttons, straight drags, length, velocity, draw, erase) on 4.23.0 (vs-base-B) and on
// this build give the same clip; the roll's layout (canvas sizes, bars) is the same; no errors
import {app, report} from './touch-lib.mjs';
const BASE = new URL('../../../werkzeug/vs-base-B.html', import.meta.url).pathname, NEW = new URL('../index.html', import.meta.url).pathname;
const res = [];
async function run(file, w, h) {
  const A = await app({width: w, height: h}, file), {p, tap, drag} = A, out = {};
  await p.evaluate(() => { const S = window.SYNQUENZER; S.setClip(0, 0, {len: 2, key: {root: 9, scale: 'aeolian', src: 'manual'}, notes: [{t: 0, d: .5, n: 57, v: .8}, {t: 1, d: .5, n: 60, v: .6}, {t: 2, d: 1, n: 64, v: .7}, {t: 5, d: .5, n: 60, v: .5}]}); S.openRoll(0, 0); });
  await p.waitForTimeout(500); await p.evaluate(() => { ED.roll.fitView('clip'); ED.roll.centerOn(60); }); await p.waitForTimeout(150);
  out.layout = await p.evaluate(() => ['main', 'keys', 'ruler', 'vel', 'bar', 'acts'].map(k => { const r = ED.roll.el[k].getBoundingClientRect(); return [k, Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; }));
  const B = async l => { const r = await p.evaluate(l => { const b = [...ED.roll.el.acts.querySelectorAll('button'), ...ED.roll.el.bar.querySelectorAll('button')].find(x => x.textContent.trim() === l); b.scrollIntoView({inline: 'center'}); const q = b.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; }, l); await p.waitForTimeout(120); await tap(r.x, r.y); };
  const X = (b, n) => p.evaluate(([b, n]) => ED.roll._xy(b, n), [b, n]);
  const snap = async k => { out[k] = await p.evaluate(() => window.SYNQUENZER.getClip(0, 0).notes.map(n => [n.t, n.d, n.n, n.v])); };
  await B('▲ Stufe'); await snap('stufe'); await B('+12'); await snap('okt'); await B('Legato'); await snap('legato');
  await p.evaluate(() => window.SYNQUENZER.undo()); await p.evaluate(() => window.SYNQUENZER.undo()); await p.evaluate(() => window.SYNQUENZER.undo());
  await p.evaluate(() => ED.roll.centerOn(60)); await p.waitForTimeout(100);
  let a = await X(1.1, 60), pts = [[a.x, a.y]]; for (let i = 1; i <= 12; i++) pts.push([a.x + i * 8, a.y]); await drag(pts); await snap('dragH');
  a = await X(0.1, 57); pts = [[a.x, a.y]]; for (let i = 1; i <= 10; i++) pts.push([a.x, a.y - i * 9]); await drag(pts); await snap('dragV');
  const e = await p.evaluate(() => { const c = window.SYNQUENZER.getClip(0, 0), n = c.notes.find(n => n.n === 64); return ED.roll._xy(n.t + n.d - .05, 64); });
  pts = [[e.x - 3, e.y]]; for (let i = 1; i <= 6; i++) pts.push([e.x - 3 + i * 10, e.y]); await drag(pts); await snap('resize');
  a = await X(6.1, 62); await tap(a.x, a.y); await snap('draw');
  out.undo = await p.evaluate(() => window.SYNQUENZER.undoInfo().n); out.errs = A.errs.length;
  await A.b.close(); return out;
}
for (const [w, h] of [[390, 844], [320, 568], [844, 390]]) {
  const a = await run(BASE, w, h), b = await run(NEW, w, h);
  for (const k of Object.keys(a)) { const same = JSON.stringify(a[k]) === JSON.stringify(b[k]); res.push({id: `REG ${w}×${h} ${k}`, pass: same, info: same ? 'gleich wie 4.23.0' : `4.23.0 ${JSON.stringify(a[k])} ≠ neu ${JSON.stringify(b[k])}`}); }
}
report('Rolle-Regression', res);
