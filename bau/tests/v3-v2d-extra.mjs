// V2d extra: Rundweg Speichern/Laden, [an Szene hängen], [Zurück] nach Verwerfen, hörbare Wirkung der Blatt-Knöpfe (Länge)
import { open } from './v3-v2d-pw.mjs';
import { SETUP55, mkCheck } from './v3-v2d-lib.mjs';
const {check, done} = mkCheck();
const {b, p, errs} = await open();
const E = (f, a) => p.evaluate(f, a);
await E(SETUP55);
await E(() => window.SYNQUENZER.placePart(0, 2, 'insert'));
const P = () => E(() => { const pr = window.SYNQUENZER.project(); const X = pr.project || pr; return JSON.stringify({song: X.song, parts: X.parts}); });
const p1 = await P();
await E(() => { const Q = window.SYNQUENZER; const j = Q.serialize(); Q.newProject({init: true}); return Q.importJSON(j); });
await p.waitForTimeout(300);
check('Rundweg Speichern/Laden: Song (marks, re, ph) und Part.lanes deep-equal', (await P()) === p1);
// [an Szene hängen]
await E(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'};
  Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .5, n: 45, v: .8}, {t: 1, d: .5, n: 48, v: .8}, {t: 2, d: .5, n: 52, v: .8}]});
  Q.setSong({bars: 24, lanes: [[{bar: 0, slot: 0}], [], [], [], [], []], carrier: ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am'].map((n, k) => ({beat: k * 4, target: Q.parseChord(n)}))}); Q.songPlay(0); });
await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 16.4, null, {timeout: 20000, polling: 30});
await E(() => window.SYNQUENZER.fangTeil({beat: 16.3}));
const sa = await E(() => window.SYNQUENZER.fangPart().suggest.sceneAlt);
check('Vorschlag „an Szene 1 hängen“ sichtbar', sa === 1 && await E(() => !!document.querySelector('.pop.fsheet button[data-sc="1"]')), sa);
// hörbar: Länge 1 statt 4 → der Kreis ruft nur noch Am (Träger-Log) — the length chip changes the sound
await E(() => window.SYNQUENZER.fangLen(1));
await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 29, null, {timeout: 20000, polling: 30});
const cap1 = await E(() => window.SYNQUENZER.memory().capc.filter(c => c.beat >= 20.5 && c.beat < 29).map(c => c.target ? c.target.name : 'O'));
await E(() => window.SYNQUENZER.clearLog());
await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 33, null, {timeout: 20000, polling: 30});
const outs = await E(() => [...new Set(window.SYNQUENZER.noteLog(300).filter(n => n.track === 0 && n.beat >= 29).map(n => n.out))]);
check('Blatt-Knopf Länge 1 hörbar: nur noch der letzte Takt (G), Bass unter G', !cap1.some(n => n !== 'G') && outs.length > 0 && outs.every(o => [43, 47, 50].includes(o)), {cap1, outs});
await E(() => window.SYNQUENZER.fangLen(4));
await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 49.5, null, {timeout: 20000, polling: 30});
const cap4 = await E(() => window.SYNQUENZER.memory().capc.filter(c => c.beat >= 34 && c.beat < 49.5).map(c => c.target ? c.target.name : 'O'));
check('Länge 4 hörbar: Am F C G im Kreis', ['F', 'C', 'G'].every(n => cap4.includes(n)), cap4);
// Verwerfen → [Zurück]
await p.click('.pop.fsheet button[data-a="disc"]');
await p.waitForTimeout(150);
const ttxt = await E(() => document.getElementById('toast').textContent);
check('Verwerfen → Toast mit [Zurück]', /Teil verworfen/.test(ttxt) && /Zurück/.test(ttxt), ttxt);
await E(() => { const b = [...document.querySelectorAll('#toast button')].find(x => /Zurück/.test(x.textContent)); b && b.click(); });
await p.waitForTimeout(200);
check('[Zurück] öffnet das Blatt wieder, der Kreis läuft', await E(() => !!document.querySelector('.pop.fsheet') && window.SYNQUENZER.fangPart().live));
// an Szene hängen
const u0 = await E(() => window.SYNQUENZER.undoInfo().n);
await p.click('.pop.fsheet button[data-sc="1"]');
await p.waitForTimeout(150);
const row = await E(() => window.SYNQUENZER.chordRow('S1'));
check('[an Szene 1 hängen]: Akkord-Zeile Szene 1, kein Teil, ein Undo', row && row.ch.map(c => c.tg ? c.tg.name : 'O').join(' ') === 'Am F C G' && (await E(() => window.SYNQUENZER.parts().every(x => !x))) && (await E(() => window.SYNQUENZER.undoInfo().n)) === u0 + 1, row);
check('0 Konsolenfehler', !errs.length, errs);
await b.close();
process.exit(done() ? 1 : 0);
