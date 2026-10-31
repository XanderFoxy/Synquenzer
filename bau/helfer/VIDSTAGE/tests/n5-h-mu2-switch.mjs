// project switching as Xander: Demo with edits → Neu → edits → back to Demo (Projekte) → back to the new one; each history its own
import {open, sleep} from './n5-h-mu2-lib.mjs';
const T = await open({vp: [390, 844]}); const {p, E} = T;
const H = () => E(() => Object.assign({id: S.id, name: S.name}, SYNQUENZER.history()));
const ed = (t, s, n) => E(([t, s, n]) => SYNQUENZER.setClip(t, s, {len: 1, notes: [{t: 0, d: .5, n, v: .8}]}), [t, s, n]);
await sleep(2000);
for (let i = 0; i < 5; i++) await ed(3, i % 4, 60 + i);
await sleep(2600); const demo1 = await H(); console.log('demo after 5 edits', JSON.stringify(demo1), await E(() => historyCheck()));
const demoId = demo1.id;
await E(() => SYNQUENZER.newProject()); await sleep(2600);
const new0 = await H(); console.log('new project', JSON.stringify(new0), await E(() => historyCheck()));
for (let i = 0; i < 3; i++) await ed(0, i, 48 + i);
await E(() => SYNQUENZER.setBpm(97)); await sleep(2600);
const new1 = await H(); console.log('new after 3 edits + bpm', JSON.stringify(new1), await E(() => historyCheck()));
const newId = new1.id;
console.log('projects', JSON.stringify(await E(() => SYNQUENZER.projects())));
console.log('open demo', await E(id => SYNQUENZER.openProject(id), demoId)); await sleep(2600);
const demo2 = await H(); console.log('demo again', JSON.stringify(demo2), await E(() => historyCheck({detail: true})));
await ed(3, 4, 70); await sleep(2600);
console.log('demo +1 edit', JSON.stringify(await H()), await E(() => historyCheck()));
console.log('open new', await E(id => SYNQUENZER.openProject(id), newId)); await sleep(2600);
const new2 = await H(); console.log('new again', JSON.stringify(new2), await E(() => historyCheck({detail: true})));
// duplicate the open one, open the copy
await E(id => SYNQUENZER.duplicateProject(id), newId); await sleep(500);
const L = await E(() => SYNQUENZER.projects()); const cp = L.find(x => / Kopie$/.test(x.name)); console.log('copy', JSON.stringify(cp));
if (cp) { await E(id => SYNQUENZER.openProject(id), cp.id); await sleep(2600); console.log('copy opened', JSON.stringify(await H()), await E(() => historyCheck())); }
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.runtime, null, {timeout: 30000}); await sleep(3000);
console.log('after reload', JSON.stringify(await H()), await E(() => historyCheck()));
console.log('errs', T.errs.slice(0, 3));
await T.b.close();
