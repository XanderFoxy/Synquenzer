// Musiker-Ablauf (Xander): Demo, Szene „Groove“ läuft, MELODIE-Platz gewählt, 🎤 an.
// Take 1: ● (Touch) im Takt davor, 4 Takte singen, ● kurz nach dem Ende. Take 2 (Overdub): ● (Touch) pb Schläge VOR dem Taktstrich,
// bars Takte singen ab dem Taktstrich, ● pa Schläge nach dem Ende. Danach: Clip-Länge, welche gesungenen Takte im Clip sind, Ausgang.
// node n4-vs-l-mus-od.mjs <bars> <pb> <pa> <sel: mel|stimme> [file]
import {start, sing, melN, prep, fire, waitBeat, idle, stInfo, sungBarHeard, NEW, sleep, tapSel, toasts, undoN} from './n4-vs-l-mus-h.mjs';
const bars = +(process.argv[2] || 16), pb = +(process.argv[3] || 0.3), pa = +(process.argv[4] || 0.15), sel = process.argv[5] || 'mel', file = process.argv[6] || NEW;
const BPM = 112, spb = 60 / BPM;
const H = await start(file, BPM, {demo: true, touch: true}), p = H.p;
const k1 = await prep(H, sing(melN(4), BPM)), k2 = await prep(H, sing(melN(bars, 2), BPM, 5));
await p.evaluate(() => { SYNQUENZER.launchScene(0); SYNQUENZER.selectSlot(5, 0); SYNQUENZER.play(); });
await waitBeat(p, 1.0);
console.log('Take 1 ● Tipp', await tapSel(H, '#bRec'));
await fire(H, k1, 4);
await waitBeat(p, 19.95); await tapSel(H, '#bRec');
await waitBeat(p, 24); await idle(p); await sleep(300);
const r1 = await stInfo(p, 0);
console.log('Take 1:', JSON.stringify({len: r1.len, mel: r1.mel, audio: r1.audio && {in: r1.audio.in, out: r1.audio.out, at: r1.audio.at}, cstart: r1.cstart, slot: r1.slot}));
const okT = await tapSel(H, '.vsres button[data-a="ok"]'); await sleep(300); console.log('Ergebnis-Blatt OK getippt:', okT, '| Blatt offen:', await p.evaluate(() => !!document.querySelector('.vsres')));
const u1 = await undoN(p);
if (sel === 'stimme') await p.evaluate(st => SYNQUENZER.selectSlot(st, 0), r1.st);
const B = 40;
await waitBeat(p, B - pb - 0.6);
const g = await fire(H, k2, B);
await waitBeat(p, B - pb); await tapSel(H, '#bRec');
await sleep(80);
const rs = await p.evaluate(() => { const r = SYNQUENZER.runtime().rec; return {state: r.state, startBeat: +(+r.startBeat).toFixed(3)}; });
console.log(`Take 2 (${sel}) ● Tipp bei Schlag ${B - pb} →`, JSON.stringify(rs), g.t < g.now ? '! Gesang zu spät geplant' : '');
await waitBeat(p, B + 4 * bars + pa); await tapSel(H, '#bRec');
await waitBeat(p, B + 4 * bars + pa + 3); await idle(p); await sleep(400);
const r2 = await stInfo(p, 0), u2 = await undoN(p);
console.log('Take 2 STIMME:', JSON.stringify({len: r2.len, audio: r2.audio && {in: r2.audio.in, out: r2.audio.out, at: r2.audio.at, alt: (r2.audio.alt || []).length}, takeSec: r2.takeSec, cstart: r2.cstart, mel: r2.mel}), 'Undo', u1, '→', u2);
const cs = r2.cstart, rows = [];
for (let j = 0; j < bars; j++) { const h = await sungBarHeard(p, r2, cs, B + 4 * j, B + 4 * j + 4, spb); rows.push([j + 1, h.played, h.db]); }
console.log('gesungene Takte [Takt, Anteil im Clip, dBFS]:', JSON.stringify(rows));
const lost = rows.filter(r => r[1] < 0.9 || r[2] < -40).map(r => r[0]);
console.log(lost.length ? `✗ fehlende gesungene Takte: ${JSON.stringify(lost)}` : '✓ alle gesungenen Takte im Clip');
console.log(`Clip ${r2.len} Takte für ${bars} gesungene Takte; Clip-Anfang Schlag ${cs}; Gesang beginnt im Clip bei Schlag ${((B - cs) % (r2.len * 4) + r2.len * 4) % (r2.len * 4)}`);
console.log('Meldungen:', JSON.stringify(await toasts(p)));
// Hören: Szene neu starten, nur STIMME, Pegel am Anfang jedes Clip-Takts + Mitte
await p.evaluate(() => { SYNQUENZER.stop(); window.__tap(); for (let t = 0; t < 8; t++) if (t !== SYNQUENZER.tkInfo().stimme) try { SYNQUENZER.setMute(t, true); } catch (e) {} SYNQUENZER.launchScene(0); SYNQUENZER.play(); });
const lv = [];
for (let k = 0; k < r2.len; k++) { await waitBeat(p, k * 4 + 1.0); lv.push(+(await p.evaluate(() => window.__lvl())).toFixed(0)); }
await p.evaluate(() => SYNQUENZER.stop());
console.log('Ausgang je Clip-Takt (Schlag 1 jedes Takts, dB):', JSON.stringify(lv));
console.log('Fehler:', JSON.stringify(H.errs.slice(0, 3)));
await H.close();
