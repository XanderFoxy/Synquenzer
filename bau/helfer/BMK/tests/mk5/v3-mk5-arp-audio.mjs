// MK5 audio (OfflineAudioContext with the app worklet): the arp's planned notes (arpLog of a live run) rendered offline —
// MK5-03 audio onsets ± 1 ms for all resolutions, MK5-04 gate lengths ± 1 ms, gate 100 % without a gap (M-EINBRUCH, sustain 127),
// gate 0 = 3 ms, M-KLICK at the steps. Usage: node v3-mk5-arp-audio.mjs <index.html>
import {createRequire} from 'module';
const {chromium} = createRequire(import.meta.url)('playwright');
import path from 'path';
const FILE = path.resolve(process.argv[2] || new URL('../mk-br-MK5/index.html', import.meta.url).pathname);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const page = await (await browser.newContext({viewport: {width: 844, height: 390}})).newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await page.evaluate(async () => {
  const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); ensureAudio(); await sl(1200);
  Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.setBpm(120);
  const press = ns => { const t = AU.ctx.currentTime, p0 = performance.now(); while (AU.ctx.currentTime === t && performance.now() - p0 < 40) {} for (const n of ns) Q.keyOn(n, .8, 'k' + n); };
  const rel = ns => { for (const n of ns) Q.keyOff(n, 'k' + n); };
  const run = async (o, ns, ms) => { Q.panic(); ARPC.clearLog(); for (const k in o) mkSetP(0, 'arp.' + k, o[k], false); mkSetP(0, 'arp.on', 1, false); await sl(40); press(ns); await sl(ms); rel(ns); await sl(80); return Q.arpLog(0); };
  const snd = deep(sndOf(0)); snd.p.mk.arp.on = 1;
  const SR = 48000;
  // render the logged notes offline (order as the app sends them: on, its off, the next on ...)
  const render = async (L, o) => { const t0 = L[0].t - .05, ev = []; L.forEach((x, k) => { ev.push([x.t - t0, 'on', x.note, x.vel, 'a' + k]); ev.push([x.t - t0 + x.dur, 'off', x.note, x.vel, 'a' + k]); });
    const sec = L[L.length - 1].t - t0 + L[L.length - 1].dur + .2; return {t0, R: await Q.mkRender(o && o.snd || snd, ev, {sec, tap: o && o.tap})}; };
  const out = {};
  // MK5-03: onsets of every resolution (amp tap = the amp envelope per sample)
  const RES = [0, 1, 2, 3, 4, 5];
  out.on = {};
  for (const res of RES) {
    const L = await run({res, gate: 50, type: 0, range: 1}, [60, 64, 67], res >= 4 ? 2300 : 1300), {t0, R} = await render(L, {tap: 'amp'});
    const e = R.l, ons = []; for (let i = 1; i < e.length; i++) if (e[i] > 1e-4 && e[i - 1] <= 1e-4) ons.push(i / SR);
    const want = L.map(x => x.t - t0), err = want.map((w, k) => (ons[k] == null ? 9 : Math.abs(ons[k] - w)));
    const nom = L.slice(1).map((x, k) => x.t - L[k].t), stepS = ARPC.RES[res] * 4 * .5;
    out.on[res] = {n: L.length, ons: ons.length, max: Math.max(...err), step: Math.max(...nom.map(d => Math.abs(d - stepS)))};
  }
  // MK5-04 gate 50 %: note length from the amp envelope (rise to the start of its fall) = 62.5 ms ± 1 ms
  { const L = await run({res: 1, gate: 50}, [60, 64, 67], 900), {t0, R} = await render(L, {tap: 'amp'}), e = R.l, len = [];
    for (const x of L.slice(0, -1)) { const a = Math.round((x.t - t0) * SR); let b = a + Math.round(.001 * SR); const pk = e[b]; while (b < e.length && e[b] >= pk * .99) b++; len.push((b - a) / SR); }   // the release starts
    out.g50 = len; }
  // gate 0 % = 3 ms
  { const L = await run({res: 1, gate: 0}, [60, 64, 67], 700), {t0, R} = await render(L, {tap: 'amp'}), e = R.l, len = [];
    for (const x of L.slice(0, -1)) { const a = Math.round((x.t - t0) * SR); let b = a + Math.round(.001 * SR); const pk = e[b]; while (b < e.length && e[b] >= pk * .99) b++; len.push((b - a) / SR); }
    out.g0 = len; }
  // gate 100 %: no hole between the steps (M-EINBRUCH, sustain 127): a chord (other notes) and one key (the same note again)
  const hole = async ns => { const L = await run({res: 1, gate: 100}, ns, 900), {t0, R} = await render(L), x = R.l, W = Math.round(.005 * SR), st = Math.round(.001 * SR), res_ = [];
    const db = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return 10 * Math.log10(s / (b - a) + 1e-20); };
    for (const y of L.slice(2, -1)) { const c = Math.round((y.t - t0) * SR); const ref = []; for (let a = c - Math.round(.05 * SR); a + W <= c - Math.round(.01 * SR); a += st) ref.push(db(a, a + W));
      const m = ref.reduce((p, q) => p + q, 0) / ref.length; let worst = 0; for (let a = c - Math.round(.01 * SR); a + W <= c + Math.round(.05 * SR); a += st) worst = Math.min(worst, db(a, a + W) - m); res_.push(worst); }
    // M-KLICK: 5 kHz high pass energy in 2 ms windows, ≤ +6 dB over the median of ±20 ms (except 3 ms after a planned onset)
    const hp = new Float32Array(x.length); let y1 = 0, x1 = 0; const a = Math.exp(-2 * Math.PI * 5000 / SR); for (let i = 0; i < x.length; i++) { y1 = a * (y1 + x[i] - x1); x1 = x[i]; hp[i] = y1; }
    const w2 = Math.round(.002 * SR), en = []; for (let i = 0; i + w2 <= hp.length; i += w2) { let s = 0; for (let k = i; k < i + w2; k++) s += hp[k] * hp[k]; en.push(10 * Math.log10(s + 1e-20)); }
    const onsW = new Set(L.map(y => Math.floor((y.t - t0) * SR / w2))); let kmax = -99;
    const i0 = Math.floor((L[0].t - t0) * SR / w2) + 11, i1 = Math.floor((L[L.length - 1].t - t0) * SR / w2);
    for (let i = Math.max(10, i0); i < Math.min(en.length - 10, i1); i++) { if (onsW.has(i) || onsW.has(i - 1)) continue; const nb = en.slice(i - 10, i + 11).sort((p, q) => p - q), med = nb[10]; kmax = Math.max(kmax, en[i] - med); }
    return {worst: Math.min(...res_), n: res_.length, kmax}; };
  out.h3 = await hole([60, 64, 67]); out.h1 = await hole([60]);
  return out;
});
const NM = ['1/24', '1/16', '1/12', '1/8', '1/6', '1/4'];
for (const k in r.on) { const x = r.on[k]; ok(`MK5-03 Audio-Einsatz offline ${NM[k]}: jeder Einsatz ± 1 ms, Abstand = Schritt`, x.ons >= x.n && x.max <= .001 && x.step <= 1e-6, `${x.n} Noten, Fehler max ${(x.max * 1000).toFixed(3)} ms`); }
ok('MK5-04 GATE 50 %: Notenlänge im Audio = ½ Schritt ± 1 ms', r.g50.length > 4 && r.g50.every(d => Math.abs(d - .0625) <= .001), r.g50.slice(0, 4).map(d => (d * 1000).toFixed(2)).join(' ') + ' ms');
ok('MK5-04 GATE 0 %: 3 ms (die Hüllkurve fällt nach 3 ms)', r.g0.length > 4 && r.g0.every(d => Math.abs(d - .003) <= .001), r.g0.slice(0, 4).map(d => (d * 1000).toFixed(2)).join(' ') + ' ms');
ok('MK5-04 GATE 100 %, Sustain 127, Akkord: keine Lücke (M-EINBRUCH ≤ 3 dB), M-KLICK ≤ +6 dB', r.h3.worst >= -3 && r.h3.kmax <= 6, `tiefstes Fenster ${r.h3.worst.toFixed(2)} dB, Klick ${r.h3.kmax.toFixed(2)} dB (${r.h3.n} Wechsel)`);
ok('MK5-04 GATE 100 %, eine Taste (dieselbe Note neu): keine Lücke (M-EINBRUCH ≤ 3 dB), M-KLICK ≤ +6 dB', r.h1.worst >= -3 && r.h1.kmax <= 6, `tiefstes Fenster ${r.h1.worst.toFixed(2)} dB, Klick ${r.h1.kmax.toFixed(2)} dB (${r.h1.n} Wechsel)`);
ok('Konsole ohne Fehler', !errs.length, errs.slice(0, 3).join(' | '));
console.log(fails ? fails + ' FEHLER' : 'ALLE BESTANDEN');
await browser.close();
