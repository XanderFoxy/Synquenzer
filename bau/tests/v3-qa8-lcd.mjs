// QA MK8: LCD lines of the program memory (old panel) – readable, not clipped, in P1 P2 P3 L1 L2 W
import {launch, open} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await launch();
for (const f of ['P1', 'P2', 'P3', 'L1', 'L2', 'W']) {
  const {ctx, page: p, errs} = await open(b, f);
  await p.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
  const acts = [['select H15', 'mkProg.select(8, 15)'], ['select E14', 'mkProg.select(5, 14)'], ['step at end', 'mkProg.select(8, 16), mkProg.step(1)'], ['bank +1', 'mkProg.bank(1)'],
    ['write', "(SYNQUENZER.mkSet(0, 't.0.f.cut', 40), mkProg.write(4, 7, 'Zwölf Zeichen'))"], ['write over own', "(SYNQUENZER.mkSet(0, 't.0.f.cut', 41), mkProg.write(4, 7, 'Noch ein Name'))"], ['restore', 'mkProg.restore(4, 7)']];
  const out = [];
  for (const [n, js] of acts) {
    await p.evaluate(js); await sleep(350);
    const r = await p.evaluate(() => { const l = [...document.querySelectorAll('#synthSheet .lcd')].find(e => e.offsetWidth); if (!l) return null;
      const lines = [...l.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim()); const cut = lines.filter(e => e.scrollWidth > e.clientWidth + 1 || e.getBoundingClientRect().right > l.getBoundingClientRect().right + 1).map(e => e.textContent.trim());
      const cs = lines.map(e => getComputedStyle(e)); return {txt: l.innerText.replace(/\s+/g, ' ').slice(0, 120), cut, wrap: cs.map(c => c.whiteSpace + '/' + c.textOverflow).slice(0, 2), w: Math.round(l.getBoundingClientRect().width), h: Math.round(l.getBoundingClientRect().height), fs: cs.map(c => c.fontSize).slice(0, 2)}; });
    out.push([n, r]);
  }
  console.log('== ' + f); for (const [n, r] of out) console.log('  ' + n.padEnd(15), r ? (r.cut.length ? 'CUT ' + JSON.stringify(r.cut) : 'ok') + ' | ' + r.txt + ' | ' + r.w + '×' + r.h + ' ' + r.fs.join('/') + ' ' + r.wrap.join(' ') : 'no LCD');
  if (errs.length) console.log('errs', errs);
  await ctx.close();
}
await b.close();
