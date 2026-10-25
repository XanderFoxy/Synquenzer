// QA V2c′ – part F: a format-3 project (app 3.1.0, V0a-fix ~ WP7 harmony) opened in 4.5.3 → Eine Skala aus, same pitches; v1 migrate → aus
import { open } from './v3-v2d-pw.mjs';
const OLD = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/qa-v2c2-old/v0a.html';
const o = await open({width: 390, height: 844}, OLD);
const mk = () => { const Q = window.SYNQUENZER; Q.newProject();
  Q.setClip(0, 0, {len: 1, key: {root: 4, scale: 'aeolian', src: 'user'}, notes: [64, 66, 67, 69, 71, 72, 74].map((n, i) => ({t: i * .5, d: .4, n, v: .8}))});
  return {json: Q.serialize(), ver: Q.version}; };
const old = await o.p.evaluate(mk);
const outs = () => { const Q = window.SYNQUENZER; const res = {}; ensureAudio();
  for (const c of [[60, 64, 67], [65, 69, 72], [67, 71, 74], [62, 66, 69], [64, 68, 71]]) { recallCarrier(Q.harmony.detectChord(c)); const k = S.tracks[0].clips[0].key;
    res[c.join('-')] = [64, 66, 67, 69, 71, 72, 74].map(n => Q.outPitch(0, n, nowT(), k)).join(' '); }
  Q.resetCarrier(); return res; };
const oldOuts = await o.p.evaluate(outs);
await o.b.close();
const {b, p, errs} = await open();
const r = await p.evaluate(([j]) => { const Q = window.SYNQUENZER; Q.importJSON(typeof j === 'string' ? j : JSON.stringify(j));
  const os = Q.project().settings.harmony.oneScale; const v1 = Q.migrate({bpm: 100, tracks: []}); return {os, v1os: v1.settings.harmony.oneScale, fmt: Q.project().format}; }, [old.json]);
const newOuts = await p.evaluate(outs);
console.log('old ver', old.ver, JSON.stringify(r));
let same = true; for (const k in oldOuts) { if (oldOuts[k] !== newOuts[k]) same = false; console.log(k, oldOuts[k], '|', newOuts[k]); }
console.log('identical', same, 'errs', errs);
await b.close();
