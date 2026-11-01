// N1: hit area of [Spiegeln] / [Umdrehen] = the full height of the action bar (elementFromPoint at its top / bottom edge), in all formats
import {app, report} from './touch-lib.mjs';
const res = [];
for (const [w, h] of [[390, 844], [375, 667], [320, 568], [844, 390], [667, 375], [926, 428]]) {
  const A = await app({width: w, height: h});
  await A.p.evaluate(() => { const S = window.SYNQUENZER; S.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: 1, n: 60, v: .8}]}); S.openRoll(0, 0); }); await A.p.waitForTimeout(400);
  const r = await A.p.evaluate(() => { const out = []; for (const l of ['Spiegeln', 'Umdrehen']) { const b = [...ED.roll.el.acts.querySelectorAll('button')].find(x => x.textContent.trim() === l); b.scrollIntoView({inline: 'center'}); const q = b.getBoundingClientRect(), bar = ED.roll.el.acts.getBoundingClientRect();
    const hitAt = y => { const e = document.elementFromPoint(q.left + q.width / 2, y); return !!e && (e === b || b.contains(e)); };
    let top = bar.bottom, bot = bar.top; for (let y = bar.top; y <= bar.bottom; y += .5) if (hitAt(y)) { top = Math.min(top, y); bot = Math.max(bot, y); }
    out.push({l, w: Math.round(q.width), hit: Math.round(bot - top + .5), bar: Math.round(bar.height)}); } return out; });
  for (const x of r) res.push({id: `N1-T ${w}×${h} ${x.l}`, pass: x.hit >= Math.min(44, x.bar - 1) && x.w >= 44, info: `Trefferfläche ${x.w}×${x.hit} px (Leiste ${x.bar} px hoch)`});
  await A.b.close();
}
report('N1-Treffer', res);
