// Reproduktion (unabhängig): Lautsprecher-Übersprechen mit Handy-Hochpass (2× Biquad HP, fc Hz) statt Vollband.
// argv: gainDb hpHz [nometro]
import {open, sleep, waitBeat, result} from './v3-qa-vs2acc-h.mjs';
const db = +(process.argv[2] || -30), hp = +(process.argv[3] || 300), metro = process.argv[4] !== 'nometro';
const H = await open({vp: 'P1'}), p = H.p;
await p.evaluate(m => SYNQUENZER.setMetronome(m), metro);
await p.tap('#segMic');
await p.waitForFunction(() => window.__q.bus, null, {timeout: 5000});
await p.evaluate(([d, hp]) => {
  const Q = window.__q, ctx = window.__ctx, dl = ctx.createDelay(1); dl.delayTime.value = 0.04;
  Q.spk.gain.value = Math.pow(10, d / 20);
  let last = dl; Q.spk.connect(dl);
  if (hp > 0) for (let i = 0; i < 2; i++) { const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; f.Q.value = 0.707; last.connect(f); last = f; }
  last.connect(Q.bus); return true;
}, [db, hp]);
await p.waitForFunction(() => { const s = SYNQUENZER.stimme(); return s.phase === 'live' && s.lastCal; }, null, {timeout: 20000});
const st = await p.evaluate(() => SYNQUENZER.stimme());
console.log('route', st.route, 'lat', st.latMs, 'cal ok', st.lastCal.ok, 'gainDb (App-Messung)', st.lastCal.gainDb, '| HP', hp, 'Hz, Schleife', db, 'dB');
await p.evaluate(() => SYNQUENZER.stimmeSheet(false)); await sleep(200);
const fm0 = await p.evaluate(() => ({m: SYNQUENZER.vsInfo().fangMode, tx: document.getElementById('bFang').textContent}));
console.log('vor ▶:', JSON.stringify(fm0));
await p.tap('#bPlay');
const seen = new Set(); let stim = 0, lit = 0, n = 0;
for (let b = 1; b <= 32; b += 0.5) { await waitBeat(p, b); n++; const v = await p.evaluate(() => ({m: SYNQUENZER.vsInfo().fangMode, lit: SYNQUENZER.vsInfo().lit, tx: document.getElementById('bFang').textContent, n: SYNQUENZER.vsInfo().litN})); if (v.m === 'stimme') stim++; if (v.lit >= 0) { lit++; seen.add(v.lit); } if (b % 8 === 0) console.log('beat', b, JSON.stringify(v)); }
const lv = await p.evaluate(() => { const c = SYNQUENZER.vsClock(), sr = c.sr, e = c.ring.end, r = SYNQUENZER.stimmeRead(e - sr * 4, e); let s = 0, pk = 0; for (const v of r.mic) { s += v * v; pk = Math.max(pk, Math.abs(v)); } return {rms: 10 * Math.log10(s / r.mic.length), pk: 20 * Math.log10(pk)}; });
console.log('Mikro-Pegel (nur Übersprechen): RMS', lv.rms.toFixed(1), 'dBFS, Spitze', lv.pk.toFixed(1));
console.log(`ohne Gesang: FANG-Modus „stimme“ in ${stim}/${n}, Taste leuchtete in ${lit}/${n}, Töne ${[...seen].join(',')}`);
const fm = await p.evaluate(() => ({m: SYNQUENZER.vsInfo().fangMode, tx: document.getElementById('bFang').textContent}));
console.log('jetzt:', JSON.stringify(fm));
if (fm.m === 'stimme') {
  await p.tap('#bFang'); const r = await result(p);
  console.log('Tipp FANG ohne Gesang →', JSON.stringify(r && {track: r.track, scene: r.scene, start: r.start, len: r.len, n: r.notes.length, pitches: [...new Set(r.notes.map(x => x.n))]}));
  console.log('Ergebnis-Blatt offen:', await p.evaluate(() => !!document.querySelector('.pop.vsres')));
  await p.screenshot({path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-rep-vs2bleed.png'});
}
console.log('errs', H.errs);
await H.br.close();
