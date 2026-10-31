// QA VS-P-04: Take mit 4.23.0 über das Mikro aufgenommen (optional Säubern %), gespeichert; dieselbe Browser-Sitzung öffnet die App
// (natürlicher Ablauf: Seite laden, 3 s warten, Szene starten) → spielt mit Ausgleich? pünktlich? WAV-Export bitgleich?
import {open, micOn, sleep, APP, BASE, mysing, recMic} from './n4-vs-p-qa-h.mjs';
import fs from 'fs';
const CL = +(process.argv[2] || 0), TARGET = process.argv[3] || APP;
const H = await open({file: BASE}), ctx = H.ctx; let p = H.p;
const sr = await micOn(p, 'wired');
const tk = await recMic(p, mysing(9.5, sr, -32, 55, {t0: 0.02}).y, {len: 4});
if (CL) { await p.evaluate(([id, c]) => SYNQUENZER.clSet(id, c), [tk.id, CL]); await p.waitForFunction(() => !CL.job.size && !CL.calc.size, null, {timeout: 60000}).catch(e => console.log('warte Säubern', e.message)); await sleep(4000); }
const h0 = await p.evaluate(id => SYNQUENZER.tkPcmHash(id), tk.id);
await p.evaluate(() => SYNQUENZER.save()); await sleep(1500); await p.close();
const {INIT} = await import('./v3-vs2-h.mjs');
const LIB = fs.readFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n4-vs-p-lib.mjs', 'utf8').replace(/^export /gm, '');
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await pg.addInitScript(INIT); await pg.addInitScript(`window.__L = (() => { ${LIB}; return {lufs, truePeakDb}; })();`);
await pg.goto('file://' + TARGET); await pg.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); p = pg;
await p.waitForFunction(id => !!SYNQUENZER.takes()[id], tk.id, {timeout: 10000});
await sleep(3000);
await p.evaluate(() => ensureAudio()); await sleep(400);
const r = await p.evaluate(async () => {
  const st = SYNQUENZER.tkInfo().stimme, c = window.__ctx, sp = c.createScriptProcessor(4096, 2, 2), z = c.createGain(); z.gain.value = 0; const L = [], R2 = [];
  let t0 = null; sp.onaudioprocess = e => { if (t0 == null) t0 = e.playbackTime; L.push(new Float32Array(e.inputBuffer.getChannelData(0))); R2.push(new Float32Array(e.inputBuffer.getChannelData(1))); };
  AU.tracks[st].cut.connect(sp); sp.connect(z); z.connect(c.destination);
  const id = S.tracks[st].clips[2].audio.take, pb = tkPlayBuf(id, null), meas = typeof VP !== 'undefined' ? VP.m.has(pb) : null;
  SYNQUENZER.launchScene(2); for (let i = 0; i < NT(); i++) if (i !== st) R.slot[i] = -1;
  let first = null; const T = performance.now();
  while (performance.now() - T < 3000) { const s = TK.src.find(x => x.i === st && !x.dead); if (s) { first = {start: s.start, off: s.off}; break; } await new Promise(r => setTimeout(r, 2)); }
  await new Promise(r => setTimeout(r, 16500)); SYNQUENZER.stop(); sp.disconnect();
  const a = S.tracks[st].clips[2].audio, clipT = b2t(R.cstart[st] + a.at);
  const cat = A => { const n = A.reduce((s, x) => s + x.length, 0), y = new Float32Array(n); let o = 0; for (const x of A) { y.set(x, o); o += x.length; } return y; };
  const k = Math.round(.3 * c.sampleRate), x = cat(L).subarray(k), y = cat(R2).subarray(k);
  return {ver: SYNQUENZER.version, measuredBeforePlay: meas, lateMs: first ? (first.start - clipT) * 1000 : null, skipMs: first ? (first.off - a.in) * 1000 : null, lufs: window.__L.lufs([x, y], c.sampleRate).lufs, tp: window.__L.truePeakDb([x, y]), cl: (S.takes[id].cl | 0)};
});
const h1 = await p.evaluate(id => SYNQUENZER.tkPcmHash(id), tk.id), w1 = await p.evaluate(id => SYNQUENZER.tkWavInfo(id), tk.id);
console.log(`${r.ver} (Säubern ${r.cl} %): vor ▶ gemessen=${r.measuredBeforePlay} · erstes Stück ${r.lateMs == null ? '-' : r.lateMs.toFixed(1)} ms nach Clip-Anfang (Anfang fehlt ${r.skipMs == null ? '-' : r.skipMs.toFixed(1)} ms) · Ausgang STIMME ${r.lufs} LUFS, TP ${r.tp} dBTP · WAV bitgleich ${w1.same && w1.hashData === w1.hashRaw && h1 === h0} (${h0})`);
if (errs.length) console.log('Konsole', errs.slice(0, 3));
await H.br.close();
