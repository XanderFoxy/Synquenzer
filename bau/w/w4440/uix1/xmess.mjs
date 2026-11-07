// UIX1 ✕-Messung hochkant: node xmess.mjs <index.html> [vp-filter z.B. 428x926] [scenario-filter]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path';
const FILE = path.resolve(process.argv[2]), VPF = process.argv[3] || '', SF = process.argv[4] || '';
const LIB = fs.readFileSync(new URL('./xmess-lib.js', import.meta.url), 'utf8');
const VPS = [[428, 926], [390, 844], [375, 667]].filter(([w, h]) => !VPF || VPF.split(',').includes(w + 'x' + h));
const SHOTS = process.env.SHOTS || '';
// each: [name, setup-code (string, runs in page; may await)]
export const SC = [
  ['menu', 'openMenu()'],
  ['ed-analog', "selectTrack(0); setEngine(0,'analog'); openEditor()"],
  ['ed-fm6', "selectTrack(0); setEngine(0,'fm6'); openEditor()"],
  ['ed-wt', "selectTrack(0); setEngine(0,'wt'); openEditor()"],
  ['ed-mk', "selectTrack(0); setEngine(0,'mk'); openEditor(); await new Promise(r=>setTimeout(r,500))"],
  ['ed-north', "selectTrack(0); setEngine(0,'north'); openEditor()"],
  ['ed-bm', "selectTrack(0); setEngine(0,'bm'); openEditor(); await new Promise(r=>setTimeout(r,400))"],
  ['ed-drum', 'selectTrack(DRUM_T); openEditor()'],
  ['ndp', 'selectTrack(DRUM_T); openEditor(); ndpOpen({}); await new Promise(r=>setTimeout(r,500))'],
  ['roll', 'openRoll(0, 0)'],
  ['lauf', 'SYNQUENZER.openLauf(0, 0)'],
  ['quant', 'SYNQUENZER.openQuant(0, 0)'],
  ['clip', 'SYNQUENZER.clipMenuItems(0, 0)'],
  ['browser', 'SYNQUENZER.openBrowser(0)'],
  ['master', 'SYNQUENZER.mtrOpenMaster()'],
  ['k1', 'SYNQUENZER.k1Open(0)'],
  ['sx14', 'sx14Open(EL.bUndo)'],
  ['partname', 'partNewAt(1)'],
  ['partsheet', "SYNQUENZER.partFromNow(0,'Strophe'); closePop(); SYNQUENZER.openPartSheet(0)"],
  ['chordrow', "SYNQUENZER.openChordRowSheet('S1')"],
  ['fang', "SYNQUENZER.play(); launchScene(0); await new Promise(r=>setTimeout(r,2600)); SYNQUENZER.fangTeil({})"],
  ['fang-edit', "SYNQUENZER.play(); launchScene(0); await new Promise(r=>setTimeout(r,2600)); SYNQUENZER.fangTeil({}); FANG.edit = true; UI.fangRepaint && UI.fangRepaint()"],
  ['s1', "SYNQUENZER.partFromNow(0,'Strophe'); closePop(); S1.v = normPart(deep(S.parts[0]), 0, NT()); S1.v.len = partLen(S1.v); S1.i = 0; S1.n = 2; S1.pass = 1; s1OpenSheet()"],
  ['song-mark', "SYNQUENZER.songFromChain([{scene:0,bars:2},{scene:1,bars:2}]); setSongView(true); SYNQUENZER.partFromNow(0,'Strophe'); closePop(); placePart(0, 0, 'insert'); const m = S.song.marks[0]; if (m) openMarkSheet(m.id)"],
  ['konux', "SYNQUENZER.songFromChain([{scene:0,bars:2},{scene:1,bars:2}]); setSongView(true); SYNQUENZER.konuxOpen('range', 0, 1)"],
  ['sum', "SYNQUENZER.songFromChain([{scene:0,bars:2},{scene:1,bars:2}]); setSongView(true); SYNQUENZER.openSum(0, 1)"],
  ['chordpick', "SYNQUENZER.songFromChain([{scene:0,bars:2},{scene:1,bars:2}]); setSongView(true); SYNQUENZER.openChordPick({bar: 0})"],
  ['recstart', "SYNQUENZER.songFromChain([{scene:0,bars:2},{scene:1,bars:2}]); setSongView(true); SYNQUENZER.openRecStart()"],
  ['loop', "SYNQUENZER.songFromChain([{scene:0,bars:2},{scene:1,bars:2}]); setSongView(true); openLoopPop(SV.btn && SV.btn.bLoop || document.querySelector('.sv-loop'))"],
  ['ue', "SYNQUENZER.songFromChain([{scene:0,bars:2},{scene:1,bars:2}]); setSongView(true); ueBar(true)"],
  ['video', 'vvOpen()'],
  ['mic', 'SYNQUENZER.micCheckOpen(true)'],
  ['cloud', 'SYNQUENZER.cloudSheet(true)'],
  ['tk', 'SYNQUENZER.tkAddTrack(); SYNQUENZER.tkSheet()'],
  ['tk2', 'SYNQUENZER.tkAddTrack(); const pcm = Array.from({length: 48000}, (_, i) => Math.round(8000 * Math.sin(i * 2 * Math.PI * 220 / 48000))); await SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0}); const rr = {t: stimmeT(), s: 0}; tkSheet(rr)'],
  ['g6', 'SYNQUENZER.tkAddTrack(); const pcm = Array.from({length: 48000}, (_, i) => Math.round(8000 * Math.sin(i * 2 * Math.PI * 220 / 48000))); await SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0}); const rr = {t: stimmeT(), s: 0}; g6Sheet(rr)'],
  ['g4', 'SYNQUENZER.tkAddTrack(); SYNQUENZER.g4Sheet()'],
  ['wp', 'SYNQUENZER.tkAddTrack(); const pcm = Array.from({length: 48000}, (_, i) => Math.round(8000 * Math.sin(i * 2 * Math.PI * 220 / 48000))); await SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0}); const rr = {t: stimmeT(), s: 0}; wpOpen(rr)'],
  ['g2', 'SYNQUENZER.tkAddTrack(); const pcm = Array.from({length: 48000}, (_, i) => Math.round(8000 * Math.sin(i * 2 * Math.PI * 220 / 48000))); await SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0}); const rr = {t: stimmeT(), s: 0}; g2Open(rr)'],
];
const CLOSE = `for (const f of [() => closePop(), () => closeEditor(), () => closeMenu(), () => ndpClose(), () => closeRoll(), () => closeClipSheet(), () => closeBrowser(false),
  () => closeQuantSheet(false, true), () => vvClose(), () => wpClose(), () => g2Close(), () => micClose(), () => cloudCloseSheet(), () => ueBar(false), () => pshDockClose(), () => closeSheets(), () => SYNQUENZER.stop(), () => setSongView(false)]) { try { f(); } catch (e) {} }`;
const out = {};
const b = await chromium.launch();
for (const [w, h] of VPS) {
  const key = w + 'x' + h; out[key] = {};
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  await ctx.addInitScript(LIB);
  for (const [name, code] of SC) {
    if (SF && !SF.split(',').includes(name)) continue;
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
    await p.goto('file://' + FILE); await p.waitForTimeout(1100);
    await p.evaluate(() => window.__uxMarkBase());
    let err = null;
    try { await p.evaluate(`(async () => { ${code} })()`); } catch (e) { err = String(e).slice(0, 160); }
    await p.waitForTimeout(450);
    const r1 = await p.evaluate(() => window.__uxScan());
    const r2 = await p.evaluate(() => window.__uxScan({scrollEnd: true}));
    if (SHOTS && (!r1.ok || !r2.ok)) await p.screenshot({path: path.join(SHOTS, `x-${key}-${name}.png`)});
    out[key][name] = {ok: r1.ok && r2.ok, r1, r2, err, errs};
    const bad = x => x.xs.filter(y => !y.ok).map(y => `${y.el} ${y.w}x${y.h} (Treffer ${y.hw}x${y.hh})@${y.x},${y.y}${y.inVp ? '' : ' AUS-BILD'}${y.top ? '' : ' verdeckt:' + y.hit}`);
    console.log(key, name.padEnd(10), r1.ok && r2.ok ? 'OK ' : 'NEIN', r1.xs.length ? '' : '(kein ✕ gefunden)', err || '', errs.length ? 'ERR ' + errs[0] : '',
      (!r1.ok ? bad(r1).join(' | ') : '') + (!r2.ok && r1.ok ? ' [nach Scroll] ' + bad(r2).join(' | ') : ''), r1.nUnder ? ' UNTER-TASTATUR ' + r1.nUnder + ': ' + r1.under.join(' ; ') : '');
    await p.close();
  }
  await ctx.close();
}
await b.close();
if (process.env.OUT) fs.writeFileSync(process.env.OUT, JSON.stringify(out, null, 1));
