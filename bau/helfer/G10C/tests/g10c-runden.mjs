// G10-24: Länge 4 fest, Overdub über 4 Loop-Runden mit ● REC → 4 Segmente (je eine Runde am Clip-Raster), ein Take-Audio; „Aus“ → wie 4.30.0
import {start, sing, melN, prep, fire, waitBeat, idle, stInfo, sleep, tapSel, undoN} from '../../../tests/n4-vs-l-mus-h.mjs';
import {ok, FILE} from './lib.mjs';
const BPM = 160, spb = 60 / BPM;
const H = await start(FILE, BPM, {touch: true, len: 4, viewport: {width: 428, height: 926}}), p = H.p;
const k1 = await prep(H, sing(melN(4), BPM)), k2 = await prep(H, sing(melN(16, 2), BPM, 5)), k3 = await prep(H, sing(melN(8, 4), BPM, 7));
await p.evaluate(() => { SYNQUENZER.selectSlot(5, 0); SYNQUENZER.play(); });
await waitBeat(p, 1.0); await tapSel(H, '#bRec');
await fire(H, k1, 4);
await waitBeat(p, 22); await idle(p); await sleep(300);
const r1 = await stInfo(p, 0);
await tapSel(H, '.vsres button[data-a="ok"]'); await sleep(200);
ok(r1.len === 4 && r1.audio && !r1.audio.alt, 'Take 1: Clip 4 Takte (fest)');
await p.evaluate(st => SYNQUENZER.selectSlot(st, 0), r1.st);
const cs = r1.cstart, L = 16, now = await p.evaluate(() => { const c = SYNQUENZER.vsClock(); return (c.now - c.outLat - c.start) / c.spb; });
const B = cs + Math.ceil((now + 3 - cs) / L) * L;
await fire(H, k2, B);
await waitBeat(p, B - 0.3); await tapSel(H, '#bRec');
await waitBeat(p, B + 4 * L + 0.15); await tapSel(H, '#bRec');
await waitBeat(p, B + 4 * L + 3); await idle(p); await sleep(400);
const r2 = await stInfo(p, 0);
const a = r2.audio, segs = [a].concat(a.alt || []);
const runs = segs.filter(s => s.r);
ok(r2.len === 4, 'Clip bleibt 4 Takte (fest) – ' + r2.len);
ok(runs.length === 4 && runs.map(s => s.r).join() === '4,3,2,1', '4 Runden als Segmente, die letzte oben: r = ' + runs.map(s => s.r).join());
ok(new Set(runs.map(s => s.take)).size === 1 && runs[0].take !== r1.audio.take, 'eine Take-id für alle Runden (kein neues Audio je Runde)');
const sr = r2.sr, dur = runs.map(s => Math.round((s.out - s.in) * sr)), want = Math.round(L * spb * sr);
ok(dur.every(d => Math.abs(d - want) <= 1), 'jede Runde = genau ein Clip-Durchgang (' + dur.join(',') + ' Samples, Soll ' + want + ' ±1)');
const asc = runs.slice().reverse();
ok(asc.every((s, j) => !j || Math.abs(Math.round(s.in * sr) - Math.round(asc[j - 1].out * sr)) <= 1) && asc.every(s => s.at === 0), 'Runden lückenlos am Clip-Raster (at = 0)');
ok(segs.length === 5 && segs[4].take === r1.audio.take, 'Take 1 darunter (stumm)');
const tks = await p.evaluate(() => Object.values(SYNQUENZER.takes()).map(m => m.len / m.sr));
ok(tks.length === 2 && tks[1] < 4 * L * spb + 2 * 4 * spb + 4 * spb + 1, 'Speicher wie eine Aufnahme: ' + tks.map(x => x.toFixed(2) + ' s').join(', '));
// Blatt: Nummern und Runde
await p.evaluate(st => SYNQUENZER.tkSheet({t: st, s: 0}), r2.st); await sleep(200);
const rows = await p.$$eval('.tksheet .g10c-row', rs => rs.map(r => r.querySelector('b').textContent + ' | ' + r.querySelector('.g10c-meta').textContent));
ok(/^Take 5 \| REC · Runde 4/.test(rows[0]) && /^Take 2 \| REC · Runde 1/.test(rows[3]) && /^Take 1 \| REC/.test(rows[4]), 'Blatt: ' + JSON.stringify(rows));
// G10-24a: Runde 2 benannt „gut“ + ★, Runde 3 rot → Wählen, Löschen, Speichern/Laden, ZIP
await p.evaluate(st => { const R0 = {t: st, s: 0}; SYNQUENZER.g10cSet(R0, 2, 'name', 'gut'); SYNQUENZER.g10cSet(R0, 2, 'fav', true); SYNQUENZER.g10cSet(R0, 1, 'tag', 3); }, r2.st);
await p.evaluate(st => SYNQUENZER.tkPick({t: st, s: 0}, 2), r2.st);   // Runde 2 nach oben
await p.evaluate(st => SYNQUENZER.g10cDel({t: st, s: 0}, 1), r2.st);  // Runde 4 löschen (jetzt an Platz 1)
let I = await p.evaluate(() => SYNQUENZER.g10cInfo());
const byR = r => I.segs.find(s => s.r === r);
ok(byR(2) && byR(2).name === 'gut' && byR(2).fav && byR(3).tag === 3 && !byR(3).name && !byR(1).tag && !byR(4), 'jede Runde behält ihre eigenen Felder nach Wählen/Löschen');
const C = `const C = v => Array.isArray(v) ? v.map(C) : v && typeof v === 'object' ? Object.keys(v).sort().reduce((o, k) => (o[k] = C(v[k]), o), {}) : v;`;
const before = await p.evaluate(C + `; JSON.stringify(C(SYNQUENZER.project().tracks[${r2.st}].clips[0].audio))`);
const z = await p.evaluate(() => SYNQUENZER.tkZipRoundtrip()); await sleep(300);
const after = await p.evaluate(C + `; JSON.stringify(C(SYNQUENZER.project().tracks[${r2.st}].clips[0].audio))`);
ok(z.ok && before === after, 'ZIP → Laden: deep-equal (Runden-Felder)');
// Aus → wie 4.30.0 (VS-L: der Clip wächst)
await p.evaluate(() => { closePop(); setUiPref('g10cPasses', false); });
const now2 = await p.evaluate(() => { const c = SYNQUENZER.vsClock(); return (c.now - c.outLat - c.start) / c.spb; });
const cs2 = (await stInfo(p, 0)).cstart, B2 = cs2 + Math.ceil((now2 + 3 - cs2) / L) * L, nAlt = I.segs.length;
await fire(H, k3, B2);
await waitBeat(p, B2 - 0.3); await tapSel(H, '#bRec');
await waitBeat(p, B2 + 2 * L + 0.15); await tapSel(H, '#bRec');
await waitBeat(p, B2 + 2 * L + 3); await idle(p); await sleep(400);
const r3 = await stInfo(p, 0);
ok(r3.len === 8 && !r3.audio.r && [r3.audio].concat(r3.audio.alt).length === nAlt + 1, '„Aus“: ein Take, Clip wächst wie 4.30.0 (Länge ' + r3.len + ', Stücke ' + [r3.audio].concat(r3.audio.alt).length + '/' + (nAlt + 1) + ')');
await p.evaluate(() => { setUiPref('g10cPasses', true); SYNQUENZER.stop(); });
// Mikro-Blatt: Schalter sichtbar
await p.evaluate(() => SYNQUENZER.stimmeSheet ? SYNQUENZER.stimmeSheet() : stSheet()); await sleep(150);
ok(await p.$eval('#g10cPass', e => !!e).catch(() => false), 'Mikro-Blatt: „Durchgänge als Takes [An] [Aus]“');
ok(H.errs.length === 0, 'keine Fehler ' + JSON.stringify(H.errs.slice(0, 3)));
await H.close();
