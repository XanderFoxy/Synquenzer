// QA regression (V2d): 60 s mixed session on the demo (P1 and L1, touch): scenes, transpose chords, FANG TEIL accept, part taps,
// song from chain + part tap during song, MIDI export, save/load, undo; console errors and tickErrors
import { open, APP } from './v3-v2d-pw.mjs';
const waitBeat = (p, b, to = 40000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 20});
for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) {
  const {b, p, errs} = await open({width: w, height: h}, APP, true);
  const log = [];
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(200); Q.launchScene(0); Q.setKbMode('transpose'); });
  for (const [k, ch] of [[2, [57, 60, 64]], [6, [53, 57, 60]], [10, [48, 52, 55]], [14, [55, 59, 62]], [18, [57, 60, 64]], [22, [53, 57, 60]], [26, [48, 52, 55]], [30, [55, 59, 62]]]) { await waitBeat(p, k); await p.evaluate(c => window.SYNQUENZER.chord(c, 150), ch); }
  await waitBeat(p, 33);
  log.push(['fangTeil', await p.evaluate(() => window.SYNQUENZER.fangTeil({}))]);
  await p.waitForTimeout(300);
  const fp = await p.evaluate(() => window.SYNQUENZER.fangPart());
  log.push(['fangPart', fp && fp.len, fp && fp.suggest && fp.suggest.name]);
  await p.screenshot({path: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2ereg/r-mix-${vp}-sheet.png`});
  // the sheet must not cover the transport / the matrix beyond the documented places
  log.push(['sheet', await p.evaluate(() => { const s = document.querySelector('.pop.fsheet'); if (!s) return null; const r = s.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; })]);
  await p.evaluate(() => window.SYNQUENZER.fangAccept('part')); await p.waitForTimeout(300);
  log.push(['parts', await p.evaluate(() => window.SYNQUENZER.parts().filter(Boolean).map(x => x.name + ':' + x.len))]);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setKbMode('play'); Q.launchScene(1); });
  const b1 = await p.evaluate(() => window.SYNQUENZER.runtime().beat);
  await waitBeat(p, b1 + 8); await p.evaluate(() => window.SYNQUENZER.launchPart(0));
  await waitBeat(p, b1 + 24);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.stop(); Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); Q.placePart(0, 4); Q.songPlay(0); });
  await waitBeat(p, 6); await p.evaluate(() => window.SYNQUENZER.partTap ? window.SYNQUENZER.partTap(0) : window.SYNQUENZER.launchPart(0));
  await waitBeat(p, 12);
  log.push(['song', await p.evaluate(() => ({marks: window.SYNQUENZER.songMarks().map(m => m.a + '+' + m.len + ':' + m.name), beat: window.SYNQUENZER.runtime().song.beat}))]);
  const ex = await p.evaluate(async () => { const got = []; window.claude = {use: async k => (k === 'downloads' ? {save: async ({filename}) => got.push(filename)} : null)};
    const Q = window.SYNQUENZER; await Q.exportMidi({mode: 'song'}); await new Promise(r => setTimeout(r, 800)); await Q.exportProject(); await new Promise(r => setTimeout(r, 300)); delete window.claude; return got; });
  log.push(['export', ex]);
  const sv = await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.stop(); const s = Q.serialize(); await Q.newProject({init: true}); const ok = Q.importJSON(s); const pr = Q.project(); Q.undo(); Q.redo(); return {ok, parts: pr.parts.filter(Boolean).length, marks: pr.song && pr.song.marks.length}; });
  log.push(['saveload', sv]);
  log.push(['te', await p.evaluate(() => window.SYNQUENZER.tickErrors())]);
  console.log(vp, JSON.stringify(log), '\n  errs', JSON.stringify(errs));
  await b.close();
}
