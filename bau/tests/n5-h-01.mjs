// VC2a-01 (100 Gesten über alle Undo-Arten, 10× Undo, 5× Redo, ≥ 20 Auswahlwechsel → genau 115 Daten-Ereignisse mit u und z),
// VC2a-02 (M-REKON: historyCheck true, auch direkt nach Auswahlwechsel, nach Neuladen, nach Format-3-Import; Gegenprobe voll),
// VC2a-09 (VL-R1: Undo-Arten der App = angemeldete Arten)
import fs from 'fs';
import { launch, installGestures, APP } from './n5-h-lib.mjs';
const res = []; const ok = (id, pass, info) => { res.push({id, pass: !!pass, info}); console.log((pass ? 'PASS ' : 'FAIL ') + id + ' ' + JSON.stringify(info)); };
const {b, ctx, p, errs} = await launch();
await installGestures(p);
await p.evaluate(() => window.__setup());
await p.evaluate(() => historyCheck());            // setup recorded (incl. Abgleich) before the count starts
const base = await p.evaluate(() => ({n: HIST.cur.strs.length, kf: HIST.cur.kf.length}));
// 100 gestures: tracks first (+, +, tflag), then the take, then a mixed rotation
const order = ['track', 'track', 'tflag', 'takesGroup', 'takes', 'group', 'track'];
const rot = ['clip', 'sound', 'fx', 'set', 'part', 'kit', 'songChord', 'own', 'mkin', 'mkslot', 'takes', 'clipDel1', 'takesGroup'];
while (order.length < 100) order.push(rot[order.length % rot.length]);
const r = await p.evaluate(async order => {
  const G = window.__G; let sel = 0; const bad = []; const kinds = {};
  G.clipDel1 = () => { const t = 1 + (sel % 3); window.SYNQUENZER.setClip(t, 6, (sel % 2) ? null : {len: 1, notes: [{p: 62, s: 0, l: 1, v: .7}]}); };
  for (let i = 0; i < order.length; i++) {
    const top0 = UNDO[UNDO.length - 1];
    await G[order[i]]();
    await new Promise(r => setTimeout(r, 0));
    const top = UNDO[UNDO.length - 1];
    if (top === top0) bad.push(i + ':' + order[i]); else kinds[top.kind] = (kinds[top.kind] || 0) + 1;
    if (i % 3 === 0) { G.sel(); sel++; } if (i % 7 === 0) { G.sel(); sel++; }
  }
  for (let i = 0; i < 10; i++) { undo(); if (i % 4 === 0) { G.sel(); sel++; } }
  for (let i = 0; i < 5; i++) redo();
  await new Promise(r => setTimeout(r, 2600));                 // the Abgleich runs (a selection change must not record anything)
  return {bad, kinds, sel};
}, order);
const evs = await p.evaluate(b => HIST.cur.strs.slice(b).map(s => JSON.parse(s)), base.n);
const data = evs.filter(e => e.u !== 'ctx');
const byU = {}; for (const e of data) byU[e.u] = (byU[e.u] || 0) + 1;
ok('VC2a-01 jede Geste genau 1 Undo-Eintrag', !r.bad.length, {bad: r.bad, kindsPushed: r.kinds, selChanges: r.sel});
ok('VC2a-01 genau 115 Daten-Ereignisse', data.length === 115, {n: data.length, byU, undoLbl: data.filter(e => /^Rückgängig/.test(e.l)).length, redoLbl: data.filter(e => /^Wiederholt/.test(e.l)).length});
ok('VC2a-01 jedes mit u und z', data.every(e => e.u && e.z && typeof e.z === 'object'), data.filter(e => !e.u || !e.z).slice(0, 3));
ok('VC2a-01 ≥ 20 Auswahlwechsel ohne Daten-Ereignis', r.sel >= 20 && !data.some(e => e.u === 'proj'), {sel: r.sel, proj: data.filter(e => e.u === 'proj').map(e => e.z)});
const allKinds = ['clip', 'sound', 'fx', 'track', 'set', 'part', 'kit', 'song', 'own', 'mkin', 'mkslot', 'takes', 'tflag', 'group'];
const pushed = new Set(Object.keys(r.kinds)); const viaGroup = await p.evaluate(() => { const s = new Set(); for (const u of UNDO.concat(REDO)) for (const it of (u.items || [])) s.add(it.kind); return [...s]; });
ok('VC2a-01 alle Undo-Arten benutzt (direkt oder in group)', allKinds.every(k => pushed.has(k) || viaGroup.includes(k)), {pushed: [...pushed], viaGroup});
// VC2a-02
let c = await p.evaluate(() => historyCheck({detail: true}));
ok('VC2a-02 historyCheck nach dem Skript', c.ok, c);
await p.evaluate(async () => { const st = await historyState(1e9); const k = st.ui ? st.ui.selT : 3; selectTrack((k + 2) % NT()); selectSlot(R.selT, (R.selS + 3) % NS()); });
c = await p.evaluate(() => historyCheck({detail: true}));
ok('VC2a-02 direkt nach Auswahlwechsel', c.ok, c);
const full = await p.evaluate(() => historyCheck({full: true, detail: true}));
const selDiff = await p.evaluate(async () => { const st = await historyState(1e9); return {rec: st.ui && st.ui.selT, now: JSON.parse(serializeProject()).ui.selT}; });
ok('VC2a-02 Gegenprobe: voller serializeProject-Vergleich schlägt nach Spurwechsel fehl', !full.ok && selDiff.rec !== selDiff.now, {full: full.ok, selDiff});
// reload
await p.evaluate(() => saveNow());
await p.reload(); await p.waitForTimeout(2500);
c = await p.evaluate(() => historyCheck({detail: true}));
const h1 = await p.evaluate(() => SYNQUENZER.history());
ok('VC2a-02 nach Neuladen', c.ok, {c, h1});
// format-3 import (migration → new keyframe)
const f3w = await p.evaluate(async () => {
  const f3 = JSON.parse(SYNQUENZER.serialize()); f3.format = 3; delete f3.history; f3.project.name = 'Alt F3';
  const before = HIST.cur.kf.length;
  SYNQUENZER.importJSON(JSON.stringify(f3)); await new Promise(r => setTimeout(r, 300));
  return {kf: HIST.cur.kf.map(k => k.w), pidChanged: HIST.pid, before};
});
c = await p.evaluate(() => historyCheck({detail: true}));
const kfMeta = await p.evaluate(async () => { const out = []; await histWalk(K => { out.push({format: K.format, appVersion: K.appVersion}); }); return out; });
ok('VC2a-02 nach Format-3-Import (Migration → Keyframe)', c.ok && f3w.kf[0] === 'mig' && kfMeta.every(k => k.format === 5 && k.appVersion === '4.25.0'), {c, f3w, kfMeta});
// a gesture after the import still checks
await p.evaluate(() => { const A = SYNQUENZER; A.setClip(1, 2, {len: 1, notes: [{p: 64, s: 0, l: 1, v: .8}]}); selectTrack(2); });
c = await p.evaluate(() => historyCheck({detail: true}));
ok('VC2a-02 Geste nach Import', c.ok, c);
// VC2a-09: undo kinds of the app (source: undoState/undoApply/undoPush/pushUndo) == registered kinds
const src = fs.readFileSync(APP, 'utf8');
const app = new Set();
const us = src.slice(src.indexOf('function undoState(e) {'), src.indexOf('// a restored clip that is playing'));
for (const m of us.matchAll(/e\.kind === '([a-z]+)'/g)) app.add(m[1]);
app.add('fx');                                                      // undoState's default branch (fxSnapshot)
for (const m of src.matchAll(/undoPush\(\{kind: '([a-z]+)'/g)) app.add(m[1]);
app.add('clip');                                                    // pushUndo
const reg = await p.evaluate(() => [...HIST.kinds.keys()].filter(k => k !== 'proj'));
const missing = [...app].filter(k => !reg.includes(k)), extra = reg.filter(k => !app.has(k));
ok('VC2a-09 VL-R1 Undo-Arten = angemeldete Arten', !missing.length && !extra.length, {app: [...app].sort(), registered: reg.sort(), missing, extra, unknownSeen: await p.evaluate(() => [...HIST.unknown])});
ok('keine Konsolenfehler', !errs.length, errs.slice(0, 5));
fs.writeFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-h-01.json', JSON.stringify(res, null, 1));
await b.close();
console.log(res.every(x => x.pass) ? 'ALLE BESTANDEN' : 'FEHLER: ' + res.filter(x => !x.pass).map(x => x.id).join(', '));
