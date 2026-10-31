import {launch, sleep, toI16, sung} from '../h.mjs';
import crypto from 'crypto';
const br = await launch();
async function run(file) {
  const ctx = await br.newContext({viewport: {width: 428, height: 926}, hasTouch: true}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await sleep(400);
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
  const T = [0.5, 0.8, 1.1, 1.6, 1.9, 2.4, 2.7, 3.3, 3.6];
  const r = await p.evaluate(([pcm]) => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), [toI16(sung(T, 4))]);
  const id = r.id, ref = {t: r.track, s: 0};
  const out = {};
  out.det = await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
  await p.evaluate(id => SYNQUENZER.wpLyrics(id, 'Lie-be ist ein Feu-er das brennt'), id);
  await p.evaluate(r => SYNQUENZER.wpOpen(r), ref); await sleep(300);
  await p.evaluate(id => SYNQUENZER.wpMark(id, 'del', 2), id);
  await p.evaluate(id => SYNQUENZER.wpMark(id, 'add', 2.1), id);
  await p.evaluate(id => SYNQUENZER.wpMark(id, 'move', 4, 1.95), id);
  await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/8'}), ref);
  const pl = await p.evaluate(r => SYNQUENZER.wpPlayed(r), ref);
  out.played = crypto.createHash('sha1').update(JSON.stringify(pl && pl.data)).digest('hex') + ' n' + (pl && pl.n);
  out.take = await p.evaluate(id => { const t = SYNQUENZER.project().takes[id]; delete t.created; delete t.chunks; return t; }, id);
  out.undo = await p.evaluate(() => SYNQUENZER.undoInfo());
  out.how = await p.evaluate(id => SYNQUENZER.wpInfo(id).how, id);
  await p.evaluate(() => { SYNQUENZER.undo(); SYNQUENZER.undo(); SYNQUENZER.undo(); });
  out.takeU = await p.evaluate(id => { const t = SYNQUENZER.project().takes[id]; delete t.created; delete t.chunks; return t; }, id);
  out.errs = errs; await ctx.close(); return out;
}
const A = await run(new URL('../../../../snapshots/', import.meta.url).pathname + 'stage-ges2.html'), B = await run(new URL('../../../../snapshots/', import.meta.url).pathname + 'G9STAGE.html');
for (const k of Object.keys(A)) { const same = JSON.stringify(A[k]) === JSON.stringify(B[k]); console.log(k, same ? 'gleich' : 'ANDERS'); if (!same) console.log('  base', JSON.stringify(A[k]).slice(0, 400), '\n  g9  ', JSON.stringify(B[k]).slice(0, 400)); }
await br.close();
