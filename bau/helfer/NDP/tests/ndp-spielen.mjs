// Kanal-Taste spielt hörbar (Pegel am Ausgang, Noten-Log, Engine), Anschlag nach Tipp-Höhe, Halten = Programm-Liste,
// SHIFT + Kanal-Taste = Quelle Drum ↔ North (ein Undo), TRIG, SPIEL-Pads, Programm-Wahl über Display + Rad (ein Undo je Geste), BANK
import {launch, open, openPlate, info, tap, ctr, touch, hold, md, report} from './ndp-lib.mjs';
const b = await launch(), rows = [], p = await open(b, 'K');
await openPlate(p);
await p.waitForFunction(() => SYNQUENZER.mdInfo().st === 'ready', null, {timeout: 10000}).catch(() => {});
rows.push({n: 'Engine bereit nach dem Öffnen', ok: (await p.evaluate(() => SYNQUENZER.mdInfo().st)) === 'ready'});
const peak = async ms => p.evaluate(ms => new Promise(r => { let m = -Infinity; const t0 = performance.now(); const f = () => { const x = SYNQUENZER.meter().rmsDb; if (x > m) m = x; if (performance.now() - t0 < ms) requestAnimationFrame(f); else r(m); }; f(); }), ms);
const silent = await peak(300);
let I = await info(p);
const ch = (I_, i) => I_.hits.find(h => h.a === 'ch:' + i);
for (const i of [0, 1, 4]) {
  const n0 = await p.evaluate(() => SYNQUENZER.noteLog(4096).length);
  const k = ch(I, i); const pr = peak(400); await tap(p, ...ctr(k)); const pk = await pr;
  const log = await p.evaluate(n0 => SYNQUENZER.noteLog(4096).slice(n0), n0);
  const gm = await p.evaluate(i => DRUM_VOICES[i].gm, i);
  rows.push({n: 'Kanal-Taste ' + (i + 1) + ': spielt hörbar (Ausgang ' + (isFinite(pk) ? pk.toFixed(1) : pk) + ' dBFS, vorher ' + (isFinite(silent) ? silent.toFixed(1) : silent) + ')', ok: pk > -50 && pk > silent + 20 && log.some(e => e.out === gm && e.track === 4)});
  rows.push({n: 'Kanal-Taste ' + (i + 1) + ': wählt den Kanal', ok: (await info(p)).voice === i});
  await p.waitForTimeout(500);
}
// Anschlag nach Tipp-Höhe: oben laut, unten leise
const k1 = ch(I, 1); let n0 = await p.evaluate(() => SYNQUENZER.noteLog(4096).length);
await tap(p, k1.x + k1.w / 2, k1.y + 3); await p.waitForTimeout(150); await tap(p, k1.x + k1.w / 2, k1.y + k1.h - 3); await p.waitForTimeout(150);
const vv = (await p.evaluate(n0 => SYNQUENZER.noteLog(4096).slice(n0), n0)).map(e => e.vel);
rows.push({n: 'Anschlag nach Tipp-Höhe (oben > unten)', ok: vv.length === 2 && vv[0] > vv[1] + .3, d: vv.map(v => v.toFixed(2)).join(' / ')});
// TRIG
n0 = await p.evaluate(() => SYNQUENZER.noteLog(4096).length); I = await info(p); await tap(p, ...ctr(I.hits.find(h => h.a === 'trig'))); await p.waitForTimeout(100);
rows.push({n: 'TRIG ▶ schlägt den gewählten Kanal an', ok: (await p.evaluate(n0 => SYNQUENZER.noteLog(4096).slice(n0).length, n0)) === 1});
// Halten = Programm-Liste des Kanals
I = await info(p); const k3 = ch(I, 3); await hold(p, ...ctr(k3), 800); await p.waitForTimeout(150);
const pop = await p.evaluate(() => { const q = document.querySelector('#popLayer .pop'); return q ? q.querySelector('h4').textContent : null; });
rows.push({n: 'Kanal-Taste halten = Programm-Liste', ok: !!pop && /Programm/.test(pop), d: pop});
await p.evaluate(() => closePop()); await p.waitForTimeout(100);
// SHIFT + Kanal-Taste: Quelle umschalten, ein Undo
I = await info(p); const sh = I.hits.find(h => h.a === 'shift'); await tap(p, ...ctr(sh)); await p.waitForTimeout(80);
rows.push({n: 'SHIFT tippen rastet ein', ok: (await info(p)).shift});
const u0 = await p.evaluate(() => SYNQUENZER.gestures().undo), s0 = await md(p, 'snare');
I = await info(p); await tap(p, ...ctr(ch(I, 1))); await p.waitForTimeout(120);
const s1 = await md(p, 'snare'), u1 = await p.evaluate(() => SYNQUENZER.gestures().undo);
rows.push({n: 'SHIFT + Kanal-Taste: Quelle North → Drum, ein Undo', ok: s0.src === 'md' && s1.src == null && u1 === u0 + 1, d: s0.src + '→' + s1.src});
await p.evaluate(() => undo()); await p.waitForTimeout(80);
rows.push({n: 'Undo stellt die Quelle her', ok: (await md(p, 'snare')).src === 'md'});
I = await info(p); await tap(p, ...ctr(I.hits.find(h => h.a === 'shift'))); await p.waitForTimeout(60);
// Programm-Wahl über das Display: Tipp auf das Display = Modus PROG, Rad = nächstes Programm (ein Undo je Geste)
I = await info(p); await tap(p, ...ctr(I.hits.find(h => h.a === 'ch:0'))); await p.waitForTimeout(400);
I = await info(p); await tap(p, ...ctr(I.hits.find(h => h.a === 'disp'))); await p.waitForTimeout(80); I = await info(p);
rows.push({n: 'Tipp aufs Display → Modus PROG (Anzeige „P..“)', ok: I.enc === 'prog' && /^P/.test(I.seg), d: I.seg + ' ' + I.strip.join(' | ')});
const before = await md(p, 'kick'), ub = await p.evaluate(() => SYNQUENZER.gestures().undo);
const enc = I.hits.find(h => h.a === 'enc'), [ex, ey] = ctr(enc), R_ = enc.w * .38; const arc = []; for (let k = 0; k <= 10; k++) { const t = -Math.PI / 2 + k * (Math.PI / 4) / 10; arc.push([ex + R_ * Math.cos(t), ey + R_ * Math.sin(t)]); }
await touch(p, arc, 40); await p.waitForTimeout(100);
const after = await md(p, 'kick'), ua = await p.evaluate(() => SYNQUENZER.gestures().undo);
const exp = await p.evaluate(n => { const L = mdFactory(); const k = L.findIndex(x => x.name === n); return L.slice(k + 1, k + 4).map(x => x.name); }, before.mName);
rows.push({n: 'Rad im Modus PROG lädt das nächste Programm (wie im Editor)', ok: after.mName !== before.mName && exp.includes(after.mName), d: before.mName + ' → ' + after.mName});
const deepOk = await p.evaluate(n => { const x = mdFactory().find(y => y.name === n); const s = SYNQUENZER.project().tracks[4].sound.p.slots.kick.md; const f = MDN.fromSpec(x); return Object.keys(f).filter(k => !['mMono', 'mCrv', 'mName'].includes(k)).every(k => s[k] === f[k]); }, after.mName);
rows.push({n: 'Programm deep-equal zum Werks-Programm', ok: deepOk});
rows.push({n: 'Programm-Geste = ein Undo', ok: ua === ub + 1});
await p.evaluate(() => undo()); await p.waitForTimeout(80);
rows.push({n: 'Undo → altes Programm', ok: JSON.stringify(await md(p, 'kick')) === JSON.stringify(before)});
// KIT-Modus: Rad = North-Kit
await p.evaluate(() => SYNQUENZER.ndpView({enc: 'kit'})); const kn0 = await p.evaluate(() => drumSnd().name);
await touch(p, arc, 40); await p.waitForTimeout(150); const kn1 = await p.evaluate(() => drumSnd().name);
rows.push({n: 'Rad im Modus KIT wählt ein North-Kit', ok: kn1 !== kn0 && (await p.evaluate(n => MD_KIT_NAMES.includes(n), kn1)), d: kn0 + ' → ' + kn1});
await p.evaluate(() => undo()); await p.waitForTimeout(80);
rows.push({n: 'Undo → altes Kit', ok: (await p.evaluate(() => drumSnd().name)) === kn0});
await p.evaluate(() => SYNQUENZER.ndpView({enc: 'val'}));
// Sektions-Taste halten = SOLO PART dieses Teils (Engine hört nur NOISE des Kanals); nochmal halten = aus
I = await info(p); await tap(p, ...ctr(I.hits.find(h => h.a === 'ch:0'))); await p.waitForTimeout(300);
I = await info(p); await hold(p, ...ctr(I.hits.find(h => h.a === 'sec:noise')), 800); await p.waitForTimeout(100);
let so = await p.evaluate(() => ({m: MDE.solo, e: SYNQUENZER.mdInfo().solo}));
rows.push({n: 'NOISE-Taste halten = SOLO PART (nur NOISE von KICK)', ok: so.m && so.e && so.e.ch === 0 && so.e.part === 'noise', d: JSON.stringify(so)});
I = await info(p); await hold(p, ...ctr(I.hits.find(h => h.a === 'sec:noise')), 800); await p.waitForTimeout(100);
so = await p.evaluate(() => ({m: MDE.solo, e: SYNQUENZER.mdInfo().solo}));
rows.push({n: 'nochmal halten = SOLO PART aus', ok: !so.m && !so.e});
// BANK (Hochformat 428×650): 7–12
I = await info(p); await tap(p, ...ctr(I.hits.find(h => h.a === 'bank'))); await p.waitForTimeout(80); I = await info(p);
rows.push({n: 'BANK zeigt Kanäle 7–12', ok: I.hits.some(h => h.a === 'ch:6') && !I.hits.some(h => h.a === 'ch:0')});
// SPIEL-Ansicht: 12 Pads, Tipp spielt
await p.evaluate(() => SYNQUENZER.ndpView({view: 'spiel'})); I = await info(p);
n0 = await p.evaluate(() => SYNQUENZER.noteLog(4096).length); await tap(p, ...ctr(I.hits.find(h => h.a === 'pad:9'))); await p.waitForTimeout(120);
const lg = await p.evaluate(n0 => SYNQUENZER.noteLog(4096).slice(n0), n0);
rows.push({n: 'SPIEL: 12 Pads, Tipp spielt den Kanal', ok: I.hits.filter(h => /^pad:/.test(h.a)).length === 12 && lg.length === 1 && lg[0].out === (await p.evaluate(() => DRUM_VOICES[9].gm))});
rows.push({n: 'keine Konsolenfehler', ok: !p.errs.length, d: p.errs.join(' | ').slice(0, 300)});
await b.close();
process.exit(report(rows) ? 0 : 1);
