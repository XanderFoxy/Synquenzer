// T3: Lautsprecher-Weg (eingemessen, Übersprechen −db), Demo läuft, NIEMAND singt: leuchten Tasten, wird FANG zu „FANG 🎤“, was fängt ein Tipp?
import {open, sleep, waitBeat, result} from './v3-qa-vs2acc-h.mjs';
const db = +(process.argv[2] || -30), metro = process.argv[3] !== 'nometro';
const H = await open({vp: 'P1'}), p = H.p;
await p.evaluate(m => SYNQUENZER.setMetronome(m), metro);
await p.tap('#segMic');
await p.waitForFunction(() => window.__q.bus, null, {timeout: 5000});
await p.evaluate(d => window.__q.loop(d, 40), db);
await p.waitForFunction(() => { const s = SYNQUENZER.stimme(); return s.phase === 'live' && s.lastCal; }, null, {timeout: 20000});
const st = await p.evaluate(() => SYNQUENZER.stimme());
console.log('route', st.route, 'lat', st.latMs, 'cal ok', st.lastCal.ok, 'gainDb', st.lastCal.gainDb);
await p.evaluate(() => SYNQUENZER.stimmeSheet(false)); await sleep(200);
await p.tap('#bPlay');
const seen = new Set(); let stim = 0, lit = 0;
for (let b = 1; b <= 32; b += 0.5) { await waitBeat(p, b); const v = await p.evaluate(() => ({m: SYNQUENZER.vsInfo().fangMode, lit: SYNQUENZER.vsInfo().lit, tx: document.getElementById('bFang').textContent, n: SYNQUENZER.vsInfo().litN, keys: document.querySelectorAll('#kb .key.vs').length})); if (v.m === 'stimme') stim++; if (v.lit >= 0) { lit++; seen.add(v.lit); } if (b % 8 === 0) console.log('beat', b, JSON.stringify(v)); }
// Pegel im Mikro (nur Übersprechen)
const lv = await p.evaluate(() => { const c = SYNQUENZER.vsClock(), sr = c.sr, e = c.ring.end, r = SYNQUENZER.stimmeRead(e - sr * 4, e); let s = 0, pk = 0; for (const v of r.mic) { s += v * v; pk = Math.max(pk, Math.abs(v)); } return {rms: 10 * Math.log10(s / r.mic.length), pk: 20 * Math.log10(pk)}; });
console.log('Mikro-Pegel (nur Übersprechen): RMS', lv.rms.toFixed(1), 'dBFS, Spitze', lv.pk.toFixed(1));
console.log(`ohne Gesang: FANG-Modus „stimme“ in ${stim}/63 Abfragen, Taste leuchtete in ${lit}/63, Töne ${[...seen].join(',')}`);
const fm = await p.evaluate(() => SYNQUENZER.vsInfo().fangMode);
if (fm === 'stimme') {
  await p.tap('#bFang'); const r = await result(p);
  console.log('Tipp FANG ohne Gesang → ', JSON.stringify(r && {scene: r.scene, len: r.len, notes: r.notes.map(n => [n.t, n.n])}));
  await p.screenshot({path: 'v3-qa-vs2acc-t3.png'});
}
console.log('errs', H.errs);
await H.br.close();
