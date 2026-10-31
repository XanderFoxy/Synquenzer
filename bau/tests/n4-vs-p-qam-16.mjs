// QA musiker: 16-Takt-Gesang (Szene-Clip 16 Takte) mit natürlichen Plosiven, leise gesungen → Spitzen-Schutz aktiv.
// Misst je Abspiel-Stück die Zeit in tkStartSrc/vpLim, ob start() schon zu spät kommt, lange Tasks, und die wahre Spitze der Plosive am STIMME-Eingang.
// node n4-vs-p-qam-16.mjs <app> <bpm>
import {open, sleep, APP, mysing} from './n4-vs-p-qa-h.mjs';
import {truePeakDb} from './n4-vs-p-lib.mjs';
const FILE = process.argv[2] || APP, BPM = +(process.argv[3] || 120);
const H = await open({file: FILE}), p = H.p;
await p.evaluate(b => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(b); }, BPM);
await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate), sec = 16 * 240 / BPM;
const g0 = mysing(sec, sr, -34, 11), y = g0.y, PL = [];
// Plosiv („P“, „T“) vor jedem 2. Ton: 6 ms, 120 … 400 Hz, +20 dB über dem Gesangs-RMS (natürlich bei nahem Mikro)
const rms = Math.pow(10, -34 / 20);
g0.notes.forEach((nt, k) => { if (k % 2) return; const i0 = Math.round(nt.t * sr), n = Math.round(0.006 * sr), f = 120 + (k * 37) % 280; PL.push(i0); for (let j = 0; j < n && i0 + j < y.length; j++) y[i0 + j] += rms * 10 * Math.sin(Math.PI * j / n) * Math.sin(2 * Math.PI * f * j / sr); });
const pcm = Array.from(y, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 16}), [pcm, sr]);
await p.evaluate(() => { if (SYNQUENZER.vpInfo) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } });
const inf = await p.evaluate(id => SYNQUENZER.vpInfo ? SYNQUENZER.vpInfo().takes[id].heard : null, r.id);
const segs = await p.evaluate(id => { try { const b = tkPlayBuf(id, null), V = VP.m.get(b); return V ? {n: V.segs.length, pts: V.segs.reduce((s, [a, b]) => s + b - a + 1, 0)} : null; } catch (e) { return null; } }, r.id);
console.log(FILE.split('/').slice(-2).join('/'), await p.evaluate(() => SYNQUENZER.version), 'BPM', BPM, 'Take', sec.toFixed(1), 's', JSON.stringify(inf), 'Hüllkurve', JSON.stringify(segs), 'Plosive', PL.length);
await p.evaluate(() => {
  const c = window.__ctx; window.__log = []; window.__lt = [];
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(+e.duration.toFixed(1)); }).observe({type: 'longtask', buffered: false}); } catch (e) {}
  const o0 = window.tkStartSrc; window.tkStartSrc = function (o) { const t0 = performance.now(), ct0 = c.currentTime, w = o.when; const rr = o0(o); const dt = performance.now() - t0; window.__log.push({ms: +dt.toFixed(1), lead: +((w - ct0) * 1000).toFixed(1), late: +((performance.now() - t0) - Math.max(6, (w - ct0) * 1000)).toFixed(1), lim: !!(rr && rr.lim)}); return rr; };
});
const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
await p.evaluate(st => { SYNQUENZER.setTrackFx(st, 'vol', 1); window.__cap('in', AU.tracks[st].trackIn); SYNQUENZER.launchScene(0); }, st);
await sleep(sec * 1000 * 1.5 + 1500);
const I = Float32Array.from(await p.evaluate(() => Array.from(window.__capGet('in').L)));
const log = await p.evaluate(() => ({log: window.__log, lt: window.__lt}));
await p.evaluate(() => SYNQUENZER.stop());
console.log('  Stücke (ms in tkStartSrc, Vorlauf ms, zu spät ms):', JSON.stringify(log.log));
console.log('  lange Tasks (ms):', JSON.stringify(log.lt));
// Spitzen am STIMME-Eingang (Pegel 1): alle Stellen > −6 dBFS, wahre Spitze
const pk = []; for (let i = 0; i < I.length; i++) if (Math.abs(I[i]) > 0.5) { pk.push(truePeakDb([I.subarray(Math.max(0, i - 400), i + 800)])); i += Math.round(0.1 * sr); }
console.log('  Plosive am STIMME-Eingang: Anzahl > −6 dBFS', pk.length, 'max', pk.length ? Math.max(...pk) : null, 'dBTP; über −1 dBTP:', pk.filter(v => v > -1).length, JSON.stringify(pk.slice(0, 20)));
console.log('  Konsole', JSON.stringify(H.errs.slice(0, 2)));
await H.br.close();
