// typische Fehler A6: the landscape SPIEL view (keys and wheels over the frame) ends on every way out: ✕, another track (VA), back to GERÄT, turn
import {launch, open} from './v3-mkp-lib.mjs';
const b = await launch(); const fail = [];
for (const way of ['close', 'va', 'geraet', 'fx']) {
  const page = await open(b, process.argv[2], 'L1');
  const r = await page.evaluate(async way => { const sl = ms => new Promise(r => setTimeout(r, ms)); MKUI.view({ansicht: 'spiel'}); await sl(400); const a = EL.app.className;
    if (way === 'close') closeEditor(); else if (way === 'va') { SYNQUENZER.selectTrack(1); SYNQUENZER.openEditor(); } else if (way === 'geraet') MKUI.view({ansicht: 'ganz'}); else MKUI.view({ansicht: 'fx'});
    await sl(500); const kb = document.getElementById('kbArea').getBoundingClientRect(); return {before: /mkqkb/.test(a), after: EL.app.className, mkq: EL.app.classList.contains('mkq'), kb: [kb.x, kb.y, kb.width, kb.height].map(Math.round), inputs: Object.keys(R.inputs).length}; }, way);
  const bad = !r.before || /mkqkb/.test(r.after) || ((way === 'close' || way === 'va') && r.mkq);
  console.log(way, JSON.stringify(r)); if (bad) fail.push(way); if (page.errs.length) fail.push(way + ' ' + page.errs.join('|'));
  await page.ctx.close();
}
console.log('FEHLER', fail.length, JSON.stringify(fail)); await b.close();
