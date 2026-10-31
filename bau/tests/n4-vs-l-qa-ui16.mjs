// QA VS-L-01/-04/-09 über die echte Bedienung (Touch): Länge-Chip → 16, ● antippen, 18 Takte singen → Ende nach genau 16 Takten;
// STIMME 16 Takte (Takt 1 und 16 hörbar), MELODIE 16 Takte; Speichern/Laden; Schalter im Mikro-Blatt (Gerät, nicht Projekt, nach Neuladen).
import {start, sing, melN, prep, fire, waitBeat, idle, stInfo, takeDb, NEW, sleep} from './n4-vs-l-qa-h.mjs';
const H = await start(NEW, 120, {touch: true}), p = H.p;
const tapEl = async sel => { const q = await p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetParent) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel); if (!q) return false; await p.touchscreen.tap(q.x, q.y); return true; };
// Länge über den Chip
{ const q = await p.evaluate(() => { const r = document.getElementById('bRec').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }); const cdp = await H.ctx.newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: q.x, y: q.y}]}); await sleep(700); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(500);
  console.log('● lang gedrückt → Aufnahme-Blatt', await p.evaluate(() => !!document.querySelector('#roLen'))); }
console.log('16', await tapEl('#roLen button[data-v="16"]')); await sleep(300);
const L = await p.evaluate(() => ({len: SYNQUENZER.project().settings.recLength, chip: (document.getElementById('chipLen') || {}).textContent}));
console.log('Länge gewählt:', JSON.stringify(L));
await p.keyboard.press('Escape'); await sleep(300); console.log('Blatt zu', await p.evaluate(() => !document.querySelector('#roLen')));
const k = await prep(H, sing(melN(18), 120));
await p.evaluate(() => { SYNQUENZER.selectSlot(5, 2); SYNQUENZER.play(); });
await waitBeat(p, 1.5); console.log('● Tipp', await tapEl('#bRec')); await fire(H, k, 4);
await sleep(150); const r0 = await p.evaluate(() => SYNQUENZER.runtime().rec);
await waitBeat(p, 67.6); const a = await p.evaluate(() => SYNQUENZER.runtime().rec.state);
await waitBeat(p, 68.3); const b = await p.evaluate(() => SYNQUENZER.runtime().rec.state);
await waitBeat(p, 4 + 72 + 1); await idle(p); await sleep(800);
const r = await stInfo(p, 2);
const d1 = await takeDb(p, r.audio.take, r.audio.in + 0.1, r.audio.in + 2), d16 = await takeDb(p, r.audio.take, r.audio.in + 30, r.audio.in + 32);
console.log('Aufnahme:', JSON.stringify({start: r0.startBeat, len: r0.length, end: r0.endBeat}), 'bei 67,6:', a, 'bei 68,3:', b);
console.log('STIMME', JSON.stringify({len: r.len, sec: (r.audio.out - r.audio.in).toFixed(4), late: r.last.late, d1, d16}), 'MELODIE', JSON.stringify(r.mel));
const mn = await p.evaluate(() => { const c = SYNQUENZER.getClip(5, 2); return c ? [c.notes[0].t, c.notes[c.notes.length - 1].t] : null; });
console.log('MELODIE erste/letzte Note (Schlag im Clip):', JSON.stringify(mn));
// Speichern / Laden
const rl = await p.evaluate(() => { const t = SYNQUENZER.serialize(); SYNQUENZER.newProject(); const fresh = SYNQUENZER.project().settings.recLength; SYNQUENZER.importJSON(t); return {file: JSON.parse(t).project.settings.recLength, fresh, loaded: SYNQUENZER.project().settings.recLength}; });
console.log('Speichern/Laden recLength:', JSON.stringify(rl));
// Schalter im Mikro-Blatt: Tipp Aus → Projekt-JSON unverändert, Neuladen → Aus
await p.evaluate(() => SYNQUENZER.stop()); await sleep(2500);
const j0 = await p.evaluate(() => SYNQUENZER.serialize());
await p.evaluate(() => SYNQUENZER.stimmeSheet()); await sleep(400);
console.log('Aus Tipp', await tapEl('.pop.stpop #vsMel button[data-v="0"]')); await sleep(400);
const j1 = await p.evaluate(() => SYNQUENZER.serialize()), m1 = await p.evaluate(() => SYNQUENZER.vsInfo().cfg.mel);
console.log('Projekt-JSON gleich:', j0 === j1, j0.length, '| mel', m1, '| dirty?', await p.evaluate(() => { const d = document.querySelector('.dirty,.chg,[data-dirty="1"]'); return !!d; }));
await sleep(2500);
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(800);
const m2 = await p.evaluate(() => SYNQUENZER.vsInfo().cfg.mel), j2 = await p.evaluate(() => SYNQUENZER.serialize());
console.log('nach Neuladen mel', m2, '| Projekt gleich wie vorher:', j2 === j0, j2.length, '| recLength', await p.evaluate(() => SYNQUENZER.project().settings.recLength));
console.log('Fehler:', JSON.stringify(H.errs.slice(0, 3)));
await H.close();
