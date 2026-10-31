// Teilen / Sichern: browser download (standalone) and the Claude-app downloads path (simulated window.claude.use('downloads')); memory kept after the job
import { open, SONG8, OUT } from './n5-v-abn-lib.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const res = {};
{
  const {b, p, errs} = await open({w: 390, h: 844, touch: true});
  await p.evaluate(s => { SYNQUENZER.setSong(s); SYNQUENZER.vvTest({opus: true}); SYNQUENZER.songSelect(0, 1); SYNQUENZER.vvOpen(); }, SONG8);
  await p.waitForTimeout(5500);
  await p.tap('.vvacts .go');
  await p.waitForFunction(() => !SYNQUENZER.vvInfo().busy && SYNQUENZER.vvInfo().res, null, {timeout: 120000});
  for (const which of ['Sichern', 'Teilen']) {
    const dlP = p.waitForEvent('download', {timeout: 8000}).catch(() => null);
    await p.tap(which === 'Sichern' ? '.vvdone .vvbtn:not(.go)' : '.vvdone .go');
    const dl = await dlP;
    let info = null; if (dl) { const f = OUT + 'dl-' + which + '-' + dl.suggestedFilename(); await dl.saveAs(f); const pr = JSON.parse(execSync(`ffprobe -v error -show_entries stream=codec_type,width,height -of json "${f}"`).toString()); info = {name: dl.suggestedFilename(), bytes: fs.statSync(f).size, streams: pr.streams.map(s => s.codec_type + (s.width ? ' ' + s.width + 'x' + s.height : ''))}; }
    await p.waitForTimeout(300);
    res[which] = {download: info, toast: await p.evaluate(() => EL.toast && EL.toast.textContent)};
  }
  res.kept = await p.evaluate(() => { SYNQUENZER.vvClose(); return {lastBufLen: VV.last && VV.last.buf ? VV.last.buf.length : 0, lastBufMB: VV.last && VV.last.buf ? +(VV.last.buf.length * 2 * 4 / 1048576).toFixed(1) : 0, resBlobMB: VV.res && VV.res.blob ? +(VV.res.blob.size / 1048576).toFixed(2) : 0, dur: VV.last && VV.last.dur}; });
  res.errs1 = errs; await b.close();
}
{
  const {b, p, errs} = await open({w: 390, h: 844, touch: true, init: () => { window.__saved = []; window.claude = {use: async k => (k === 'downloads' ? {save: async o => { window.__saved.push({filename: o.filename, type: o.data && o.data.constructor && o.data.constructor.name, mime: o.data && o.data.type, size: o.data && o.data.size}); }} : null)}; }});
  await p.evaluate(s => { SYNQUENZER.setSong(s); SYNQUENZER.vvTest({opus: true}); SYNQUENZER.songSelect(0, 1); SYNQUENZER.vvOpen(); }, SONG8);
  await p.waitForTimeout(5500);
  await p.tap('.vvacts .go');
  await p.waitForFunction(() => !SYNQUENZER.vvInfo().busy && SYNQUENZER.vvInfo().res, null, {timeout: 120000});
  await p.tap('.vvdone .vvbtn:not(.go)'); await p.waitForTimeout(500);
  res.claude = {saved: await p.evaluate(() => window.__saved), toast: await p.evaluate(() => EL.toast && EL.toast.textContent)};
  res.errs2 = errs; await b.close();
}
console.log(JSON.stringify(res, null, 1));
