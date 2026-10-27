import {open, sleep} from './v3-vs3-h.mjs';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-br-VS4/index.html';
const H = await open({file: APP}), p = H.p;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
await p.evaluate(() => SYNQUENZER.stimmeStart({route: 'speaker', cal: false}));
await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 20000}); await sleep(500);
await p.evaluate(s => window.__loop(s), 0.02137);
await p.evaluate(() => SYNQUENZER.stimmeCal('voll')); await sleep(300);
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); SYNQUENZER.play(); });
const wb = b => p.waitForFunction(b => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= b; }, b, {timeout: 60000, polling: 20});
await p.evaluate(() => { SYNQUENZER.setKbMode('transpose'); SYNQUENZER.setHarmony({change: 'bar', latch: true}); });
for (const [k, n] of [57, 53, 48, 55, 57].entries()) { await wb(k * 4 - 0.6); await p.evaluate(n => SYNQUENZER.keyOn(n, 0.8, 'ch'), n); await sleep(80); await p.evaluate(() => SYNQUENZER.keyOff(0, 'ch')); }
await wb(17);
const r = await p.evaluate(async () => {
  const c = SYNQUENZER.vsClock(), sr = c.sr, b = Math.round((c.start + 16 * c.spb) * sr), a = b - 20 * sr, s = SYNQUENZER.stimmeRead(a, b + Math.round(0.1 * sr));
  const enc = y0 => { const y = Float32Array.from(y0), u = new Uint8Array(y.buffer); let q = ''; for (let i = 0; i < u.length; i += 32768) q += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(q); };
  const o = await SYNQUENZER.clCore(enc(s.mic), enc(s.ref), sr, {way: 'notes'});
  const dec = b => { const q = atob(b), u = new Uint8Array(q.length); for (let i = 0; i < q.length; i++) u[i] = q.charCodeAt(i); return new Float32Array(u.buffer); };
  const y = dec(o.y), seg = Math.round(0.5 * sr), rows = [];
  for (let i = 0; i + seg <= y.length; i += seg) { let e = 0, m = 0, rr = 0; for (let j = i; j < i + seg; j++) { e += y[j] * y[j]; m += s.mic[j] * s.mic[j]; rr += s.ref[j] * s.ref[j]; } rows.push([+((i / sr) - 20 + (c.start + 16 * c.spb) - c.start).toFixed(1), +(10 * Math.log10(m / seg + 1e-12)).toFixed(1), +(10 * Math.log10(e / (m + 1e-12))).toFixed(1), +(10 * Math.log10(rr / seg + 1e-12)).toFixed(1)]); }
  return {info: o.info, rows, t0: c.start};
});
console.log(JSON.stringify(r.info)); for (const row of r.rows) console.log(row.join('\t'));
await H.br.close();
