// QA VS-L: Overdub auf eine Szene mit MELODIE- + STIMME-Clip (Xanders Ablauf: erst ● 4 Takte, dann in derselben Szene noch mal ●)
// ● wird wie üblich kurz VOR dem Taktstrich gedrückt, gesungen ab dem Taktstrich, ● kurz nach dem Ende.
// node n4-vs-l-qa-od.mjs <bars> <pressBefore> <pressAfter> [file]
import {start, sing, melN, prep, fire, waitBeat, idle, stInfo, sungBarHeard, NEW, sleep} from './n4-vs-l-qa-h.mjs';
const bars = +(process.argv[2] || 16), pb = +(process.argv[3] || 0.5), pa = +(process.argv[4] || 0.5), file = process.argv[5] || NEW;
const H = await start(file, 120), p = H.p, spb = 0.5;
const k1 = await prep(H, sing(melN(4), 120)), k2 = await prep(H, sing(melN(bars, 2), 120, 5));
// 1. erste Aufnahme: MELODIE-Platz (leer) gewählt, ● vor Takt 2, 4 Takte, ● → MELODIE + STIMME je 4 Takte
await p.evaluate(() => SYNQUENZER.play());
await waitBeat(p, 0.5); await p.evaluate(() => { SYNQUENZER.selectSlot(5, 0); SYNQUENZER.rec(); });
await fire(H, k1, 4);
await waitBeat(p, 20.1); await p.evaluate(() => SYNQUENZER.rec());
await waitBeat(p, 23); await idle(p);
const r1 = await stInfo(p, 0);
console.log('1. Aufnahme:', JSON.stringify({len: r1.len, mel: r1.mel, audio: r1.audio && {in: r1.audio.in, out: r1.audio.out, at: r1.audio.at}, cstart: r1.cstart, slot: r1.slot, melSlot: await p.evaluate(() => SYNQUENZER.runtime().slots[5])}));
// 2. zweite Aufnahme in derselben Szene: ● bei B − pb (MELODIE-Platz gewählt, läuft), singen ab B, ● bei B + 4·bars + pa
const B = 40;
await waitBeat(p, B - pb - 0.02);
const g = await fire(H, k2, B);
await waitBeat(p, B - pb); await p.evaluate(() => SYNQUENZER.rec());
await sleep(100);
const rs = await p.evaluate(() => { const r = SYNQUENZER.runtime().rec; return {state: r.state, mode: r.mode, startBeat: r.startBeat}; });
console.log('2. ● gedrückt bei', B - pb, '→', JSON.stringify(rs), g.t < g.now ? '! Gesang zu spät geplant' : '');
await waitBeat(p, B + 4 * bars + pa); await p.evaluate(() => SYNQUENZER.rec());
await waitBeat(p, B + 4 * bars + pa + 3); await idle(p);
const r2 = await stInfo(p, 0);
console.log('2. Ergebnis STIMME:', JSON.stringify({len: r2.len, audio: r2.audio && {in: r2.audio.in, out: r2.audio.out, at: r2.audio.at, alt: (r2.audio.alt || []).length}, takeSec: r2.takeSec, cstart: r2.cstart, mel: r2.mel}));
// gesungene Takte: werden sie gespielt? (Clip-Anfang = cstart der STIMME-Spur)
const cs = r2.cstart, rows = [];
for (let j = 0; j < bars; j++) { const h = await sungBarHeard(p, r2, cs, B + 4 * j, B + 4 * j + 4, spb); rows.push([j + 1, h.played, h.db]); }
console.log('gesungene Takte [Takt, Anteil gespielt, dBFS]:', JSON.stringify(rows));
const lost = rows.filter(r => r[1] < 0.9 || r[2] < -40).map(r => r[0]);
console.log(lost.length ? `✗ verlorene gesungene Takte: ${JSON.stringify(lost)}` : '✓ alle gesungenen Takte im Clip');
console.log(`Clip-Länge ${r2.len} Takte bei ${bars} gesungenen Takten; Gesang beginnt im Clip bei Schlag ${(B - cs) % (r2.len * 4)}`);
// Ausgang: Szene neu starten (Stopp, Szene 1 starten) – liegt der Gesang wieder auf dem Takt?
await p.evaluate(() => { SYNQUENZER.stop(); window.__tap(); for (let t = 0; t < 8; t++) if (t !== SYNQUENZER.tkInfo().stimme) try { SYNQUENZER.setMute(t, true); } catch (e) {} SYNQUENZER.launchScene(0); SYNQUENZER.play(); });
const lv = [];
for (const b of [1, 2, 3, 4.6, 5.0, 6, 7, (r2.len - 1) * 4 + 1, (r2.len - 1) * 4 + 3]) { await waitBeat(p, b); lv.push([b, +(await p.evaluate(() => window.__lvl())).toFixed(1)]); }
await p.evaluate(() => SYNQUENZER.stop());
console.log('Ausgang nach Neustart (Schlag, dB):', JSON.stringify(lv));
console.log('Fehler:', JSON.stringify(H.errs.slice(0, 3)));
await H.close();
