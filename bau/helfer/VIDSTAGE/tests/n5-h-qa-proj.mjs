// QA VC2a: historyCheck across project flows — new, switch back, duplicate, older version restore, Aus/An, import mit Verlauf
// into the same browser (same id), reload; keyframe kinds per project
import { open, T, sleep } from './n5-h-qa-lib.mjs';
const {b, ctx, p, errs, cdp} = await open('P1', {wait: 2500});
const t = T(p, cdp), E = t.E;
const res = []; const ok = (id, c, info) => { res.push({id, ok: !!c}); console.log((c ? 'PASS ' : 'FAIL ') + id + ' ' + JSON.stringify(info)); };
const gest = (k) => E(k => { const Q = SYNQUENZER; for (let i = 0; i < 5; i++) { Q.setClip(1 + (i % 3), (k + i) % 4, {len: 1, notes: [{n: 60 + i + k, t: 0, d: 1, v: .8}]}); const s = Q.getSound(2); s.p.cutoff = 500 + 100 * i + k; Q.setSound(2, s); } selectTrack(k % 4); return S.id; }, k);
const chk = async (id) => { const c = await E(() => historyCheck({detail: true})); const kfs = await E(async () => { const o = []; await histWalk(K => { o.push(K.format + '/' + K.appVersion); }); return o; }); const kw = await E(async () => { const o = []; for (const it of await histItems(HIST.pid)) o.push(...it.r.kf.map(k => k.w)); if (HIST.cur && HIST.cur.n == null) o.push(...HIST.cur.kf.map(k => k.w + '*')); return o; }); ok(id, c.ok, {c, kw, h: await E(() => SYNQUENZER.history())}); return c; };
const A = await gest(1); await chk('A nach Gesten');
await E(() => SYNQUENZER.newProject()); await sleep(500);
const B = await gest(2); await chk('B (Neu) nach Gesten');
await E(id => SYNQUENZER.openProject(id), A); await sleep(800);
await chk('A wieder geöffnet'); await gest(3); await chk('A weitere Gesten');
// Ältere Versionen: restore an older version
const ph = await E(() => { try { return SYNQUENZER.projHistory(); } catch (e) { return String(e); } });
console.log('projHistory', JSON.stringify(ph).slice(0, 300));
// Aus -> Gesten -> An
await E(() => histSetOn(false)); await gest(4); await E(() => histSetOn(true)); await sleep(200); await gest(5); await chk('Aus/Gesten/An/Gesten');
// export mit Verlauf, more gestures, import the file into the same browser (same id)
await E(() => { UI.histFile = true; });
const file = await E(async () => { const o = await histFileAdd(projectFileObj(S, false, true)); return JSON.stringify(o); });
const fj = JSON.parse(file); console.log('file has history', !!fj.history, 'chunks', fj.history && fj.history.chunks.length, 'events in file', fj.history && fj.history.chunks.reduce((a, c) => a + c.ne, 0));
await gest(6); await chk('A nach Export + Gesten');
const before = await E(() => ({id: S.id, h: SYNQUENZER.history()}));
await E(f => SYNQUENZER.importJSON(f), file); await sleep(1500);
const after = await E(() => ({id: S.id, h: SYNQUENZER.history()}));
console.log('import same browser', JSON.stringify({before, after}));
await chk('A nach Import der Datei mit Verlauf (gleicher Browser)');
await gest(7); await chk('nach Import + Gesten');
// duplicate
const dup = await E(id => { try { return SYNQUENZER.duplicateProject(id); } catch (e) { return 'err ' + e; } }, await E(() => S.id));
console.log('duplicate ->', JSON.stringify(dup));
await sleep(800);
const cur = await E(() => S.id); console.log('current after duplicate', cur);
// reload
await E(() => saveNow()); await sleep(300);
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime); await sleep(2600);
await chk('nach Neuladen');
await gest(8); await chk('nach Neuladen + Gesten');
console.log('errors', JSON.stringify(errs.slice(0, 5)));
console.log(res.every(r => r.ok) ? 'ALLE OK' : 'FEHLER ' + res.filter(r => !r.ok).map(r => r.id).join(' | '));
await b.close();
