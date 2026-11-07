import {open, KOPIE, BASIS} from '../takt/pruef/h.mjs';
for (const F of [BASIS, KOPIE]) {
const {b, p, errs} = await open(F, 428, 926);
const r = await p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms)), o = {};
  stop(); SYNQUENZER.loadDemo(); ensureAudio(); await wait(200);
  SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}]);
  const m = S.song.marks[0]; openMarkSheet(m.id); await wait(250);
  const tb = [...UI.pop.el.querySelectorAll('button')].find(x => /Taktart/.test(x.textContent)); if (tb) tb.click(); await wait(150);
  const b34 = UI.pop && UI.pop.el.querySelector('.t1ts button[data-ts="3/4"]'); if (b34) b34.click(); await wait(250);
  o.btns = [...EL.toast.querySelectorAll('button')].map(x => { const r = x.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return x.textContent + ' ' + Math.round(r.left) + '-' + Math.round(r.right) + ' top' + Math.round(r.top) + ' hit:' + (e === x || x.contains(e)); });
  o.cls = EL.toast.className; o.z = getComputedStyle(EL.toast).zIndex; o.popz = getComputedStyle(UI.pop.el).zIndex; o.op = getComputedStyle(EL.toast).opacity;
  return o;
});
await p.screenshot({path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4490/takt-tools/dbg1-' + (F.includes('basis') ? 'b' : 'k') + '.png'});
console.log(F.includes('basis') ? 'BASIS' : 'KOPIE', JSON.stringify(r)); await b.close();
}
