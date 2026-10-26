// QA regression MK6: a 4.12.0 project with MS 2000 tracks (format 5) opened in 4.14.0: sounds equal, seq neutral,
// no "changed" dot at SEQ, plays (noteLog), roundtrip save -> load in 4.14.0 keeps everything, renders bit-identical
import { open } from './v3-qa-mk6reg-pw.mjs';
import fs from 'fs';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const BASE = S + 'mk6-base-4.12.0.html', APP = S + 'mk-br-MK6/index.html';
const {b: b0, p: p0} = await open({width: 390, height: 844}, BASE);
const file = await p0.evaluate(async () => { const Q = window.SYNQUENZER; const sl = ms => new Promise(r => setTimeout(r, ms));
  let seed = 999; Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  await Q.loadDemo(); Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); await sl(1200); window.MKUI.randomize(0); Q.mkSet(0, 'dly.dep', 60); Q.mkSet(0, 'mode', 1); Q.mkSet(0, 't.1.o1.w', 1);
  Q.setEngine(2, 'mk'); window.MKUI.randomize && Q.mkSet(2, 't.0.p.0.i', 30); Q.mkSet(2, 'scale', 3); Q.closeEditor && Q.closeEditor();
  return {json: Q.serialize(), s0: Q.getSound(0), s2: Q.getSound(2)}; });
await b0.close();
fs.writeFileSync(S + 'dirigent-test/v3-qa-mk6reg/old-4120-mk.json', file.json);
const {b, p, errs} = await open({width: 390, height: 844}, APP);
const r = await p.evaluate(async ([json, s0, s2]) => { const Q = window.SYNQUENZER; const sl = ms => new Promise(r => setTimeout(r, ms));
  const ok = Q.importJSON(json); await sl(500);
  const n0 = Q.getSound(0), n2 = Q.getSound(2);
  const strip = s => { const x = JSON.parse(JSON.stringify(s)); for (const t of x.p.mk.t) delete t.seq; return JSON.stringify(x.p.mk) + JSON.stringify(Object.assign({}, x.p, {mk: null})); };
  const eq0 = strip(n0) === strip(s0), eq2 = strip(n2) === strip(s2);
  const seq0 = JSON.stringify(n0.p.mk.t[0].seq), seqOld = JSON.stringify(s0.p.mk.t[0].seq);
  // EDIT-WAHL 2 list dots
  Q.selectTrack(0); Q.openEditor(); await sl(1200);
  const M = window.MKUI; M.setWahl(2, 10); await sl(100);
  const lcd = M.lcdOf ? (() => { try { return JSON.stringify(M.lcdOf()); } catch (e) { return String(e); } })() : null;
  const matrix = M.panelInfo().matrix;
  Q.closeEditor && Q.closeEditor(); await sl(200);
  Q.setBpm(240); Q.clearLog(); Q.launchScene(0); await sl(3000); const log = Q.noteLog(4000).filter(n => n.beat != null && n.beat >= 0).length; Q.stop(); await sl(300);
  // roundtrip in new
  const s1 = Q.serialize(); await Q.newProject({init: true}); Q.importJSON(s1); await sl(300); const rt = JSON.stringify(Q.getSound(0)) === JSON.stringify(n0) && JSON.stringify(Q.getSound(2)) === JSON.stringify(n2);
  return {ok, eq0, eq2, seq0, seqOld, matrix, lcd: lcd && lcd.slice(0, 300), log, rt, te: Q.tickErrors()}; }, [file.json, file.s0, file.s2]);
console.log(JSON.stringify(r, null, 1));
console.log('errs', JSON.stringify(errs));
await b.close();
