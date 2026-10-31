// VS-P-fix: Kopie von n4-vs-p-accept.mjs; 01 misst am Ausgang mit Pegel ganz auf (Bezug der Synth-Kalibrierung, vor dem Pegel) und Pegel-Standard
// VS-P Abnahme 01 (Mikro-Weg, gesungener Vokal), 02 (Demo-Projekt je Spur), 03 (Spitzen, Pegelminderung, Verschiebung)
// node n4-vs-p-accept.mjs [01|02|03|all] [app]
import {open, micOn, sleep, waitBeat, idle, b64, APP, BASE, voice} from './n4-vs-p-h.mjs';
import {sung, lufs as Lu, truePeakDb, rmsDbF} from './n4-vs-p-lib.mjs';
const which = process.argv[2] || 'all', FILE = process.argv[3] || APP;
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const i16 = (x) => Array.from(x, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
async function newInit(p, bpm = 120) { await p.evaluate(b => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(b); }, bpm); await sleep(300); return p.evaluate(() => window.__ctx.sampleRate); }
async function inject(p, x, sr, scene, len) { const r = await p.evaluate(([pc, sr, s, l]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: s, len: l}), [i16(x), sr, scene, len]); await p.evaluate(() => { if (SYNQUENZER.vpWait) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } }); return r; }
// STIMME-Spur allein spielen und ihren Ausgang mitschneiden
async function playStimme(p, scene, sec, vol) {
  await p.evaluate(([s, vol]) => { const st = SYNQUENZER.tkInfo().stimme; if (vol != null) SYNQUENZER.setTrackFx(st, 'vol', vol); window.__cap('v', AU.tracks[st].cut); SYNQUENZER.launchScene(s); for (let i = 0; i < NT(); i++) if (i !== st) R.slot[i] = -1; }, [scene, vol]);
  await sleep(sec * 1000);
  const o = await p.evaluate(() => window.__capStat('v', 0.3)); await p.evaluate(() => SYNQUENZER.stop()); await sleep(300); return o;
}

if (which === '01' || which === 'all') {
  console.log('— VS-P-01: drei Takes über das Mikro (Attrappe, Kabel-Weg), gesungener Vokal −36 / −28 / −20 dBFS RMS');
  for (const lv of [-36, -28, -20]) {
    const H = await open({file: FILE}), p = H.p, sr = await micOn(p, 'wired');
    await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: 0, length: 4}); SYNQUENZER.selectSlot(0, 2); });
    const y = sung(10, sr, lv, {seed: 11 + lv}).y;
    await p.evaluate(([b]) => { SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + 4 * c.spb - 0.04); }, [b64(y)]);
    await waitBeat(p, 3.6); await p.evaluate(() => SYNQUENZER.rec());
    await waitBeat(p, 21); await idle(p); await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
    const tk = await p.evaluate(() => { const st = SYNQUENZER.tkInfo().stimme, c = SYNQUENZER.getClip(st, 2), id = c.audio.take, raw = tkBuffer(id).getChannelData(0);
      return {st, id, rawLufs: window.__L.lufs([raw], tkBuffer(id).sampleRate).lufs, rawRms: window.__L.rmsDbF(raw)}; });
    await p.evaluate(() => SYNQUENZER.vpWait());
    const o = await playStimme(p, 2, 16.5, 1), o8 = await playStimme(p, 2, 16.5, .8);
    const vi = await p.evaluate(id => SYNQUENZER.vpInfo().takes[id], tk.id);
    ok(Math.abs(o.lufs + 16) <= 1.5, `Mikro ${lv} dBFS RMS → Take ${tk.rawLufs} LUFS (Ausgleich ${vi.heard.gDb} dB) → Ausgang STIMME Pegel ganz auf ${o.lufs} LUFS (Soll −16 ± 1,5), wahre Spitze ${o.tp} dBTP; Pegel-Standard 0,8: ${o8.lufs} LUFS, ${o8.tp} dBTP`);
    if (H.errs.length) ok(false, 'Konsolenfehler ' + H.errs.slice(0, 2));
    await H.br.close();
  }
}

if (which === '02' || which === 'all') {
  console.log('— VS-P-02: Demo-Projekt + Gesangs-Take (Mikro-Pegel −28 dBFS RMS), alle Regler Standard, Lautheit je Spur-Ausgang');
  for (const f of [BASE, FILE]) {
    const H = await open({file: f}), p = H.p;
    await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.setMetronome(false); SYNQUENZER.play(); SYNQUENZER.stop(); });
    await sleep(300);
    const sr = await p.evaluate(() => window.__ctx.sampleRate), bpm = await p.evaluate(() => S.bpm);
    const y = sung(4 * 4 * 60 / bpm, sr, -28, {seed: 3}).y;
    await inject(p, y, sr, 0, 4);
    await p.evaluate(() => { for (let i = 0; i < NT(); i++) if (AU.tracks[i]) window.__cap('t' + i, AU.tracks[i].cut); SYNQUENZER.launchScene(0); });
    await sleep(17500);
    const st = await p.evaluate(() => { const o = {}; for (let i = 0; i < NT(); i++) if (window.__caps['t' + i]) o[i + ':' + S.tracks[i].name + (S.tracks[i].stimme ? '' : '/' + (S.tracks[i].sound.name || ''))] = window.__capStat('t' + i, 0.5); return o; });
    await p.evaluate(() => SYNQUENZER.stop());
    const ver = await p.evaluate(() => SYNQUENZER.version);
    console.log('  App', ver); let synMax = -Infinity, all = -Infinity, vox = null;
    for (const k in st) { const v = st[k]; console.log('   ', k.padEnd(28), v.lufs == null ? 'still' : v.lufs + ' LUFS', v.lufs == null ? '' : v.tp + ' dBTP'); if (v.lufs == null) continue;
      if (/Stimme/.test(k)) vox = v.lufs; else { all = Math.max(all, v.lufs); if (/Synth|Melodie/.test(k)) synMax = Math.max(synMax, v.lufs); } }
    console.log(`    Stimme gegen lauteste Synth-Spur ${(vox - synMax).toFixed(2)} LU, gegen lauteste Spur überhaupt ${(vox - all).toFixed(2)} LU`);
    if (f === FILE) { ok(vox - synMax <= 3 && vox - synMax >= -3, `VS-P-02 Stimme ${vox} LUFS, lauteste Synth-Spur ${synMax} LUFS → ${(vox - synMax).toFixed(2)} LU (Soll −3 … +3)`);
      console.log(`    (lauteste Spur: Drums ${all} LUFS → Stimme ${(vox - all).toFixed(2)} LU)`); }
    if (H.errs.length) ok(false, 'Konsolenfehler ' + H.errs.slice(0, 2));
    await H.br.close();
  }
}

if (which === '03' || which === 'all') {
  console.log('— VS-P-03: Spitzen-Schutz (wahre Spitze am STIMME-Ausgang), natürlicher Gesang (Pegelminderung), keine Verschiebung');
  const H = await open({file: FILE}), p = H.p, sr = await newInit(p);
  const pop = (y, at, amp, ms = 4) => { const n = Math.round(ms / 1000 * sr), i0 = Math.round(at * sr); for (let k = 0; k < n; k++) y[i0 + k] += amp * Math.sin(Math.PI * k / n) * Math.sin(2 * Math.PI * 180 * k / sr) / 1; };
  // (a) leiser Gesang −30 dBFS RMS mit Plosiven bei 0 dBFS (roh); (b) Gesang −28 mit Spitzen, die nach dem Ausgleich bei 0 dBFS liegen
  const A = sung(8, sr, -30, {seed: 21}).y; for (const t of [0.5, 1.7, 3.1, 4.4, 6.2]) pop(A, t, 1);
  for (let i = 0; i < A.length; i++) A[i] = Math.max(-1, Math.min(1, A[i]));
  const B0 = sung(8, sr, -28, {seed: 22}); const gB = Math.pow(10, (-15.134 - Lu([B0.y], sr).lufs) / 20), B = B0.y; for (const t of [0.9, 2.2, 3.6, 5.3, 6.8]) pop(B, t, 1 / gB);
  const tests = [['a', A, 0], ['b', B, 1]];
  for (const [nm, x, sc] of tests) {
    const r = await inject(p, x, sr, sc, 4);
    const inf = await p.evaluate(id => SYNQUENZER.vpInfo().takes[id].heard, r.id);
    const o1 = await playStimme(p, sc, 8.6), o2 = await playStimme(p, sc, 8.6, 1);
    await p.evaluate(() => SYNQUENZER.setTrackFx(SYNQUENZER.tkInfo().stimme, 'vol', .8));
    const peakAfter = (inf.pkDb + inf.gDb).toFixed(2);
    ok(o1.tp <= -1 && o2.tp <= -1, `(${nm}) Take-Spitze ${inf.pkDb} dBFS, Ausgleich ${inf.gDb} dB → ohne Schutz ${peakAfter} dBFS vor dem Pegel; Ausgang wahre Spitze Pegel-Standard ${o1.tp} dBTP, Pegel ganz auf ${o2.tp} dBTP (≤ −1); Hüllkurve max. −${inf.grDb} dB in ${inf.lim} Abschnitten`);
  }
  // Konsonanten: vor jedem 2. Einsatz ein Plosiv (8 ms, 300 Hz, +14 … +20 dB über dem RMS), vor jedem 3. ein Zischlaut (60 ms Rauschen > 4 kHz, +0 dB)
  function cons(g, rmsDb) { const y = Float32Array.from(g.y), a = Math.pow(10, rmsDb / 20); let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    let k = 0; for (let i = 1; i < y.length; i++) { if (!(g.voiced[i] && !g.voiced[i - 1])) continue; k++;
      if (k % 2 === 0) { const n = Math.round(0.008 * sr), amp = a * Math.pow(10, (14 + (k % 4) * 2) / 20) * 1.41; for (let j = 0; j < n && i - n + j >= 0; j++) y[i - n + j] += amp * Math.sin(Math.PI * j / n) * Math.sin(2 * Math.PI * 300 * j / sr); }
      if (k % 3 === 0) { const n = Math.round(0.06 * sr); let z1 = 0; for (let j = 0; j < n && i - n + j >= 0; j++) { const w = rnd(), h = w - z1; z1 = w; y[i - n + j] += a * 1.2 * h * Math.sin(Math.PI * j / n); } } }
    return {y, voiced: g.voiced}; }
  // natürlicher Gesang: Anteil stimmhafter 20-ms-Frames mit Pegelminderung ≤ 3 dB
  const nat = [['Vokal −28', sung(16, sr, -28, {seed: 31})], ['Vokal −20', sung(16, sr, -20, {seed: 32})], ['Vokal −36 (+24 dB)', sung(16, sr, -36, {seed: 33})],
    ['Vokal −28 mit Konsonanten (Plosive bis +20 dB über RMS, Zischlaute)', cons(sung(16, sr, -28, {seed: 34}), -28)],
    ['Korpus-Stimme −28', {y: voice(8, 120, sr, -28), voiced: null}], ['Korpus-Stimme tief −20', {y: voice(8, 120, sr, -20, {low: true, voice: 'male'}), voiced: null}]];
  let sc = 2;
  for (const [nm, g] of nat) {
    const r = await inject(p, g.y, sr, sc++ % 8, 8);
    const e = await p.evaluate(id => SYNQUENZER.vpEnv(id), r.id);
    const F = Math.round(0.02 * sr), nf = Math.floor(g.y.length / F); let nv = 0, good = 0, worst = 0;
    // stimmhaft: Generator-Maske (Vokal) bzw. Frame-Pegel höchstens 30 dB unter dem lautesten Frame (Korpus)
    const fr = []; for (let f = 0; f < nf; f++) fr.push(rmsDbF(g.y, f * F, (f + 1) * F)); const mx = Math.max(...fr);
    for (let f = 0; f < nf; f++) {
      let v; if (g.voiced) { let c = 0; for (let i = f * F; i < (f + 1) * F; i++) c += g.voiced[i]; v = c > F / 2; } else v = fr[f] > mx - 30;
      if (!v) continue; nv++;
      let mn = 1; if (e.env) for (let b = Math.floor(f * F / e.K); b <= Math.ceil((f + 1) * F / e.K) && b < e.env.length; b++) mn = Math.min(mn, e.env[b]);
      const gr = -20 * Math.log10(mn); worst = Math.max(worst, gr); if (gr <= 3) good++;
    }
    ok(good / nv >= 0.95, `${nm}: ${(100 * good / nv).toFixed(1)} % von ${nv} stimmhaften Frames ≤ 3 dB Pegelminderung (größte ${worst.toFixed(2)} dB; Ausgleich ${(20 * Math.log10(e.g)).toFixed(2)} dB, Hüllkurve ${e.env ? 'ja' : 'nicht nötig'})`);
  }
  if (H.errs.length) ok(false, 'Konsolenfehler ' + H.errs.slice(0, 2));
  await H.br.close();
  // Verschiebung: Plosiv (0 dBFS roh, wird begrenzt) gegen einen Synth-Ton (Spur 1, Note auf Schlag 2) im selben Mitschnitt – 4.23.0 gegen VS-P
  const pos = [];
  for (const f of [BASE, FILE]) {
    const H2 = await open({file: f}), q = H2.p, sr2 = await newInit(q);
    const y = new Float32Array(sr2 * 2), P0 = Math.round(1.0 * sr2), PN = Math.round(0.004 * sr2), tpl = new Float32Array(PN);
    for (let k = 0; k < PN; k++) y[P0 + k] = tpl[k] = Math.sin(Math.PI * k / PN) * Math.sin(2 * Math.PI * 700 * k / sr2);
    for (let i = 0; i < y.length; i++) y[i] += 0.02 * Math.sin(2 * Math.PI * 220 * i / sr2) * (i > sr2 * 0.2 && i < sr2 * 0.9 ? 1 : 0);
    await inject(q, y, sr2, 0, 1);
    await q.evaluate(() => SYNQUENZER.setClip(0, 0, {len: 1, notes: [{t: 2, d: 0.5, n: 60, v: 0.9}]}));
    const r = await q.evaluate(async T => { const st = SYNQUENZER.tkInfo().stimme, ctx = window.__ctx, sp = ctx.createScriptProcessor(1024, 2, 2), z = ctx.createGain(), mg = ctx.createChannelMerger(2); z.gain.value = 0;
      const mono = n => { const g = ctx.createGain(); g.channelCount = 1; g.channelCountMode = 'explicit'; g.channelInterpretation = 'speakers'; n.connect(g); return g; };
      mono(AU.tracks[st].cut).connect(mg, 0, 0); mono(AU.tracks[0].cut).connect(mg, 0, 1); mg.connect(sp);
      const A = [], B = []; sp.onaudioprocess = e => { A.push(new Float32Array(e.inputBuffer.getChannelData(0))); B.push(new Float32Array(e.inputBuffer.getChannelData(1))); };
      sp.connect(z); z.connect(ctx.destination);
      SYNQUENZER.launchScene(0); for (let i = 1; i < NT(); i++) if (i !== st) R.slot[i] = -1;
      await new Promise(r => setTimeout(r, 2600)); SYNQUENZER.stop(); sp.disconnect();
      const cat = L => { const n = L.reduce((a, x) => a + x.length, 0), y = new Float32Array(n); let o = 0; for (const x of L) { y.set(x, o); o += x.length; } return y; };
      const a = cat(A), b = cat(B); let on = -1; for (let i = 0; i < b.length; i++) if (Math.abs(b[i]) > 1e-3) { on = i; break; }
      let best = -1, at = 0; for (let i = 0; i + T.length < a.length; i++) { let s = 0, e = 0; for (let k = 0; k < T.length; k += 2) { s += a[i + k] * T[k]; e += a[i + k] * a[i + k]; } const c = s / Math.sqrt(e + 1e-12); if (c > best) { best = c; at = i; } }
      let pk = 0; for (let i = at; i < at + T.length; i++) pk = Math.max(pk, Math.abs(a[i]));
      return {d: (at - on) / ctx.sampleRate, pk, corr: best, v: SYNQUENZER.version}; }, Array.from(tpl));
    pos.push(r); await H2.br.close();
  }
  const d = (pos[1].d - pos[0].d) * 1000;
  ok(Math.abs(d) < 0.05, `keine Verschiebung: Plosiv nach Synth-Ton ${(pos[0].d * 1000).toFixed(3)} ms (4.23.0) / ${(pos[1].d * 1000).toFixed(3)} ms (VS-P) → ${d.toFixed(3)} ms; Plosiv-Spitze ${pos[0].pk.toFixed(3)} → ${pos[1].pk.toFixed(3)} (begrenzt)`);
}
console.log(fail ? `\n${fail} FEHLER` : '\nALLE OK'); process.exit(fail ? 1 : 0);
