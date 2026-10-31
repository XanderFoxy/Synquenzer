// VS-P-fix: Kopie von n4-vs-p-p04.mjs, Soll am Ausgang bei Pegel-Standard −19,88 LUFS (−16 LUFS vor dem Pegel, Bezug der Synth-Kalibrierung)
// VS-P-04: Take aus 4.23.0 → in VS-P geladen spielt mit Ausgleich (gemessen beim Laden); WAV bitgleich; Projekt ohne/mit Takes Zeichen für Zeichen gleich
import {open, sleep, APP, BASE} from './n4-vs-p-h.mjs';
import {sung} from './n4-vs-p-lib.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const norm = s => { const o = JSON.parse(s); delete o.appVersion; delete o.sum; if (o.project) delete o.project.id; return JSON.stringify(o).replace(/"uid":"[0-9a-v]{10}"/g, '"uid":0'); };
// (1) Projekt ohne Takes: Demo und INIT, 4.23.0 gegen VS-P
for (const how of ['demo', 'init']) {
  const out = [];
  for (const f of [BASE, APP]) { const H = await open({file: f}); out.push(await H.p.evaluate(h => { if (h === 'demo') SYNQUENZER.loadDemo(); else SYNQUENZER.newProject({init: true}); return SYNQUENZER.serialize(); }, how)); await H.br.close(); }
  const a = norm(out[0]), b = norm(out[1]);
  ok(a === b, `Projekt ohne Takes (${how}) Zeichen für Zeichen gleich zu 4.23.0 (${a.length} Zeichen; nur appVersion/Prüfsumme/ID ausgenommen)`);
}
// (2) Take in 4.23.0 aufnehmen (Mikro-Pegel −30 dBFS RMS), speichern; dieselbe Browser-Sitzung öffnet VS-P
let H = await open({file: BASE}); const br = H.br, ctx = H.ctx; let p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
const sr = await p.evaluate(() => window.__ctx.sampleRate), y = sung(8, sr, -30, {seed: 41}).y, pcm = Array.from(y, v => Math.round(v * 32767));
const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 4}), [pcm, sr]);
const h0 = await p.evaluate(id => SYNQUENZER.tkPcmHash(id), r.id), w0 = await p.evaluate(id => SYNQUENZER.tkWavInfo(id), r.id), j0 = await p.evaluate(() => SYNQUENZER.serialize());
await p.evaluate(() => SYNQUENZER.saveNow ? SYNQUENZER.saveNow() : SYNQUENZER.save()); await sleep(1500); await p.close();
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e)));
const {INIT} = await import('./v3-vs2-h.mjs'); await pg.addInitScript(INIT);
const LIB = (await import('fs')).readFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n4-vs-p-lib.mjs', 'utf8').replace(/^export /gm, '');
await pg.addInitScript(`window.__L = (() => { ${LIB}; return {lufs, truePeakDb}; })();`);
await pg.goto('file://' + APP); await pg.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version === '4.24.0'); p = pg;
await p.waitForFunction(id => !!SYNQUENZER.takes()[id], r.id, {timeout: 10000});
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); }); await sleep(300);
await p.evaluate(() => tkLoadAll());
await p.waitForFunction(id => !!tkBuffer(id), r.id, {timeout: 10000});
await p.evaluate(() => SYNQUENZER.vpWait());
const vi = await p.evaluate(id => SYNQUENZER.vpInfo().takes[id], r.id);
ok(vi && vi.raw && vi.raw.lufs != null, `Take aus 4.23.0 nach dem Laden gemessen, bevor er spielt: ${JSON.stringify(vi && vi.raw)}`);
const j1 = await p.evaluate(() => SYNQUENZER.serialize());
ok(norm(j0) === norm(j1), `Projekt mit Take: gespeichert in 4.23.0 = geladen in VS-P, Zeichen für Zeichen (${norm(j0).length} Zeichen; kein Auto-Pegel im Projekt)`);
// Wiedergabe: STIMME-Ausgang
const o = await p.evaluate(async () => { const st = SYNQUENZER.tkInfo().stimme, ctx = window.__ctx, sp = ctx.createScriptProcessor(4096, 2, 2), z = ctx.createGain(); z.gain.value = 0; const L = [], R2 = [];
  sp.onaudioprocess = e => { L.push(new Float32Array(e.inputBuffer.getChannelData(0))); R2.push(new Float32Array(e.inputBuffer.getChannelData(1))); };
  AU.tracks[st].cut.connect(sp); sp.connect(z); z.connect(ctx.destination); SYNQUENZER.launchScene(0);
  await new Promise(r => setTimeout(r, 8800)); SYNQUENZER.stop(); sp.disconnect();
  const cat = A => { const n = A.reduce((a, x) => a + x.length, 0), y = new Float32Array(n); let o = 0; for (const x of A) { y.set(x, o); o += x.length; } return y; };
  const a = cat(L).subarray(Math.round(.3 * ctx.sampleRate)), b = cat(R2).subarray(Math.round(.3 * ctx.sampleRate));
  return {lufs: window.__L.lufs([a, b], ctx.sampleRate).lufs, tp: window.__L.truePeakDb([a, b]), src: SYNQUENZER.vpInfo().src.length}; });
ok(Math.abs(o.lufs + 19.88) <= 1.5, `(VS-P-fix: Soll bei Pegel-Standard −19,88 = −16 vor dem Pegel) spielt mit Ausgleich ${vi.heard.gDb} dB: Ausgang STIMME ${o.lufs} LUFS (4.23.0 hätte ${(vi.raw.lufs + 3.01 - 3.88).toFixed(2)} LUFS), wahre Spitze ${o.tp} dBTP`);
const h1 = await p.evaluate(id => SYNQUENZER.tkPcmHash(id), r.id), w1 = await p.evaluate(id => SYNQUENZER.tkWavInfo(id), r.id);
ok(h1 === h0 && w1.same && w1.hashData === w0.hashData && w1.hashData === w1.hashRaw, `WAV-Export bitgleich zum Roh-Take und zu 4.23.0 (Roh ${h1}, WAV-Daten ${w1.hashData})`);
const z = await p.evaluate(() => SYNQUENZER.tkZipInfo());
ok(z.files.some(f => /takes\/.*\.wav/.test(f.name)), 'ZIP enthält den Roh-Take als WAV: ' + z.files.map(f => f.name + ':' + f.n).join(', '));
ok(!errs.length, 'keine Konsolenfehler ' + JSON.stringify(errs.slice(0, 2)));
await br.close();
console.log(fail ? `\n${fail} FEHLER` : '\nALLE OK'); process.exit(fail ? 1 : 0);
