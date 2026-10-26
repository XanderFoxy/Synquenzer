// T3c: ✕ in Takes sheet then tap ↶ (strip) with real touch: does the sheet stay stale?
import {launch, open, sleep} from './v3-qa-vs3-h.mjs';
const sine = (sr, sec, f) => { const n = Math.round(sr * sec), x = new Array(n); for (let i = 0; i < n; i++) x[i] = Math.round(Math.sin(2 * Math.PI * f * i / sr) * 9000); return x; };
const br = await launch(null);
for (const [w, h] of [[390, 844], [844, 390]]) {
  const H = await open(br, {viewport: {width: w, height: h}, touch: true, mobile: true}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  let r; for (let k = 0; k < 3; k++) r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 1}), sine(48000, 1, 300 + 50 * k));
  await p.evaluate(t => SYNQUENZER.selectSlot(t, 0), r.track); await sleep(200);
  const be = await p.evaluate(() => { const b = document.getElementById('bEdit').getBoundingClientRect(); return {x: b.x + b.width / 2, y: b.y + b.height / 2}; });
  await p.touchscreen.tap(be.x, be.y); await sleep(400);
  const del = await p.evaluate(() => { const b = document.querySelectorAll('.pop.tksheet .tk-del')[1].getBoundingClientRect(); return {x: b.x + b.width / 2, y: b.y + b.height / 2}; });
  await p.touchscreen.tap(del.x, del.y); await sleep(300);
  const rows1 = await p.evaluate(() => document.querySelectorAll('.pop.tksheet .tkrow').length);
  const ub = await p.evaluate(() => { const b = document.getElementById('bUndo').getBoundingClientRect(); const e = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return {x: b.x + b.width / 2, y: b.y + b.height / 2, hit: e && (e.id || e.className)}; });
  await p.touchscreen.tap(ub.x, ub.y); await sleep(400);
  const st = await p.evaluate(t => { const e = document.querySelector('.pop.tksheet'); const c = SYNQUENZER.getClip(t, 0); return {open: !!e, rows: e ? e.querySelectorAll('.tkrow').length : -1, data: 1 + ((c.audio.alt || []).length)}; }, r.track);
  console.log(w + 'x' + h, 'after ✕ rows', rows1, '; ↶ tap hits', ub.hit, '→', JSON.stringify(st));
  if (st.open && st.rows !== st.data) {
    // tap the last visible row's ✕ in the stale sheet: which take gets deleted?
    const takesBefore = await p.evaluate(t => { const c = SYNQUENZER.getClip(t, 0); return [c.audio.take].concat((c.audio.alt || []).map(a => a.take)); }, r.track);
    const lab = await p.evaluate(() => [...document.querySelectorAll('.pop.tksheet .tk-pick b')].map(b => b.textContent));
    console.log('  stale sheet shows', JSON.stringify(lab), 'data', JSON.stringify(takesBefore));
  }
  await p.close();
}
await br.close();
