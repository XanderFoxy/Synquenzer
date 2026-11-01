// G10-01: Einmessen mit Attrappe gainDb = −31 → ear wahr, Weg-Anzeige „Hörmuschel?“; bei −12 ear falsch. Dazu: ear übersteht den Neustart,
// ein Profil ohne ear bleibt Zeichen für Zeichen gleich.
import {launch, open, micOn, sleep, report, HERE} from './lib.mjs';
const R = report('G10-01');
const br = await launch();
const ctx = await br.newContext({viewport: {width: 428, height: 926}});
let {p, errs} = await open(br, {ctx});
await micOn(p, 'speaker');
const a = await p.evaluate(() => SYNQUENZER.g10aCalSim({gainDb: -31}));
R.check('−31 dB → prof.speaker.ear = true', a.ear === true && a.prof.ear === true, a.prof);
await p.evaluate(() => SYNQUENZER.stimmeSheet(true)); await sleep(400);
const lbl = await p.evaluate(() => { const pop = document.querySelector('.stpop'); const b = pop && [...pop.querySelectorAll('[data-v="speaker"], button')].find(x => /Hörmuschel|Lautsprecher/.test(x.textContent)); const h = pop && pop.querySelector('.g10a-ear'); return {lbl: b ? b.textContent.trim() : null, hint: h ? h.textContent : null, hH: b ? b.getBoundingClientRect().height : 0}; });
R.check('Weg-Anzeige „Hörmuschel?“ + Hinweis', /Hörmuschel\?/.test(lbl.lbl || '') && /Kabel-Kopfhörer/.test(lbl.hint || ''), lbl);
R.check('Weg-Knopf ≥ 44 px hoch', lbl.hH >= 44, lbl.hH);
await p.screenshot({path: HERE + '/bilder/g10-01-hoermuschel-428x926.png'});
for (const [w, h] of [[926, 428], [428, 650]]) {
  await p.evaluate(() => SYNQUENZER.stimmeSheet(false)); await p.setViewportSize({width: w, height: h}); await sleep(300);
  await p.evaluate(() => SYNQUENZER.stimmeSheet(true)); await sleep(400);
  const v = await p.evaluate(() => { const pop = document.querySelector('.stpop'), e = pop && pop.querySelector('.g10a-ear'); if (!e) return null; const a = e.getBoundingClientRect(), b = pop.getBoundingClientRect(); return {inside: a.left >= b.left - .5 && a.right <= b.right + .5, w: Math.round(a.width), h: Math.round(a.height), clip: e.scrollWidth > e.clientWidth + 1}; });
  R.check(`${w}×${h}: Hinweis im Blatt, nicht abgeschnitten`, v && v.inside && !v.clip, v);
  await p.screenshot({path: `${HERE}/bilder/g10-01-hoermuschel-${w}x${h}.png`});
}
await p.evaluate(() => SYNQUENZER.stimmeSheet(false)); await p.setViewportSize({width: 428, height: 926});
// Neustart: ear bleibt (stProf liest es mit)
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await sleep(500);
const rl = await p.evaluate(() => ({ear: SYNQUENZER.g10aInfo().ear, prof: SYNQUENZER.stimme().profiles.speaker}));
R.check('nach Neustart: ear noch wahr', rl.ear === true && rl.prof && rl.prof.ear === true, rl.prof);
await micOn(p, 'speaker');
const b = await p.evaluate(() => SYNQUENZER.g10aCalSim({gainDb: -12}));
R.check('−12 dB → ear falsch (Feld fehlt)', b.ear === false && !('ear' in b.prof), b.prof);
await p.evaluate(() => SYNQUENZER.stimmeSheet(true)); await sleep(400);
const lb2 = await p.evaluate(() => { const pop = document.querySelector('.stpop'); return {txt: pop ? pop.textContent : '', hint: !!(pop && pop.querySelector('.g10a-ear'))}; });
R.check('−12 dB → wieder „Lautsprecher“, kein Hinweis', /Lautsprecher/.test(lb2.txt) && !/Hörmuschel\?/.test(lb2.txt) && !lb2.hint);
// anderer Weg (Kabel): kein ear, auch bei −31
await p.evaluate(() => SYNQUENZER.stimmeRoute('wired'));
const c = await p.evaluate(() => SYNQUENZER.g10aCalSim({gainDb: -31}));
R.check('Weg Kabel −31 dB → kein ear', !('ear' in c.prof) && c.ear === false, c.prof);
// altes Profil (ohne ear) → Einlesen + Speichern Zeichen für Zeichen gleich
const same = await p.evaluate(() => { const k = Object.keys(localStorage).find(x => { try { const o = JSON.parse(localStorage.getItem(x)); return o && o.prof && o.v === 1; } catch (e) { return false; } }); return k; });
const old = {v: 1, prof: {speaker: {ms: 21.5, spread: .3, at: '2026-10-19T10:00:00.000Z', how: 'gemessen', floorDb: -62, gainDb: -31.5, outMs: 12}}, route: 'speaker'};
await p.evaluate(([k, o]) => { SYNQUENZER.stimmeStop(); localStorage.setItem(k, JSON.stringify(o)); }, [same, old]);
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await sleep(400);
const rt = await p.evaluate(k => { SYNQUENZER.stimme(); SYNQUENZER.stimmeNudge(0); return localStorage.getItem(k); }, same);
R.check('Profil ohne ear: unverändert gelesen (kein ear erfunden)', await p.evaluate(() => SYNQUENZER.g10aInfo().ear) === false);
R.check('Profil-Schlüssel gefunden', !!same, same);
R.check('keine Seitenfehler', errs.length === 0, errs.slice(0, 3));
await br.close(); R.done();
