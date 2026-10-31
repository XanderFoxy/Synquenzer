// MK5 arpeggiator in Chromium (arpLog, noteLog, voices, worklet scope): MK5-01 … MK5-15, MK5-19 … MK5-22.
// Usage: node v3-mk5-arp.mjs <index.html>   (ONLY=<regex>)
import {createRequire} from 'module';
const {chromium} = createRequire(import.meta.url)('playwright');
import path from 'path';
const FILE = path.resolve(process.argv[2] || new URL('../mk-br-MK5/index.html', import.meta.url).pathname), ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
async function open() {
  const ctx = await browser.newContext({viewport: {width: 844, height: 390}});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(async () => {
    const Q = SYNQUENZER; ensureAudio(); await new Promise(r => setTimeout(r, 1200));
    for (let t = 0; t < 4; t++) if (S.tracks[t] && S.tracks[t].kind === 'synth') { Q.setEngine(t, 'mk'); }
    for (let t = 0; t < 4; t++) for (let s = 0; s < 8; s++) if (S.tracks[t].clips[s]) S.tracks[t].clips[s] = null;
    Q.selectTrack(0);
    const sl = ms => new Promise(r => setTimeout(r, ms));
    window.H = {
      sl, Q,
      arp(o, t) { for (const k in o) mkSetP(t || 0, 'arp.' + k, o[k], false); },
      mk(path, v, t) { mkSetP(t || 0, path, v, false); },
      reset() { Q.stop(); Q.panic(); ARPC.clearLog(); clearLog(); const m = sndOf(0).p.mk; sndOf(0).p.mk = SQStore.normalizeSound(factorySound(INIT_IDS.mk)).p.mk; syncEngine(0, true); void m; S.settings.swing = 0; },
      // the audio clock of headless Chromium moves in ~10 ms jumps: press a chord right after a jump (on the iPhone it moves per 2.7 ms quantum)
      keys(ns, vel) { const t = AU.ctx.currentTime, p0 = performance.now(); while (AU.ctx.currentTime === t && performance.now() - p0 < 40) {} const tp = AU.ctx.currentTime; for (const n of ns) Q.keyOn(n, vel || .8, 'k' + n); return tp; },
      up(ns) { const t = AU.ctx.currentTime, p0 = performance.now(); while (AU.ctx.currentTime === t && performance.now() - p0 < 40) {} for (const n of ns) Q.keyOff(n, 'k' + n); },
      log(t) { return Q.arpLog(t || 0); },
      now: () => AU.ctx.currentTime,
    };
    // warm up once (the first key press of a fresh page compiles the whole path; a test measures the steady state)
    H.arp({on: 1}); await sl(30); H.keys([60, 64, 67]); await sl(150); H.up([60, 64, 67]); await sl(150); H.reset(); ARPC.clearLog(); clearLog();
    await sl(300);
  });
  return {ctx, page, errs};
}
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; const o = await open(); try { await f(o.page, o); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 600)); } if (o.errs.length) ok(id + ' Konsole', false, o.errs.slice(0, 3).join(' | ')); await o.ctx.close(); };
const J = x => JSON.stringify(x);

// expected patterns (HB-MS S. 45) for C-E-G
function expect(type, R) { const N = [60, 64, 67], U = []; for (let o = 0; o < R; o++) for (const n of N) U.push(n + 12 * o);
  if (type === 0) return U; if (type === 1) return U.slice().reverse(); if (type === 2) return U.length > 2 ? U.concat(U.slice(1, -1).reverse()) : U; if (type === 3) return U.concat(U.slice().reverse()); return null; }

await T('MK5-01', async page => {
  const res = await page.evaluate(async () => {
    const out = {}; H.Q.setBpm(240);
    for (const type of [0, 1, 2, 3, 5]) for (const R of [1, 2, 3, 4]) {
      H.reset(); H.Q.setBpm(240); H.arp({on: 1, res: 0, type, range: R, gate: 50}); await H.sl(30);
      const n = type === 5 ? 6 : (type === 2 ? 2 * 3 * R - 2 : type === 3 ? 6 * R : 3 * R) * 2;
      H.keys([60, 64, 67]); const sec = n * (60 / 240 / 6) + .12; await H.sl(sec * 1000); H.up([60, 64, 67]); await H.sl(80);
      const L = H.log();
      out[type + ':' + R] = type === 5 ? L.reduce((m, x) => { const k = x.t.toFixed(4); (m[k] = m[k] || []).push(x.note); return m; }, {}) : L.map(x => x.note);
    }
    return out;
  });
  for (const type of [0, 1, 2, 3]) for (const R of [1, 2, 3, 4]) {
    const P = expect(type, R), got0 = res[type + ':' + R], got = got0.slice(0, Math.max(P.length * 2, got0.length - 2)), want = [].concat(...Array(12).fill(P)).slice(0, got.length);
    ok(`MK5-01 ${['Up', 'Down', 'Alt 1', 'Alt 2'][type]} Range ${R}`, got.length >= P.length * 2 - 1 && J(got) === J(want), J(got.slice(0, 26)));
  }
  for (const R of [1, 2, 3, 4]) { const g = Object.values(res['5:' + R]).slice(0, -1).map(a => a.sort((x, y) => x - y)); ok(`MK5-01 Trigger Range ${R} (ignoriert)`, g.length >= 4 && g.every(a => J(a) === '[60,64,67]'), J(g.slice(0, 3)) + ' ×' + g.length); }
  ok('MK5-01 Beispiel Range 1: Alt 1 = C E G E, Alt 2 = C E G G E C', J(expect(2, 1)) === '[60,64,67,64]' && J(expect(3, 1)) === '[60,64,67,67,64,60]');
});

await T('MK5-02', async page => {
  const r = await page.evaluate(async () => {
    const N = [60, 64, 67, 71].map(p => ({p})), seed = ARPC.seedOf(0), cnt = {}, seq = [];
    for (let c = 0; c < 2000; c++) { const n = ARPC.arpPattern(4, 1, N, c, seed)[0].p; cnt[n] = (cnt[n] || 0) + 1; seq.push(n); }
    const seq2 = []; for (let c = 0; c < 2000; c++) seq2.push(ARPC.arpPattern(4, 1, N, c, ARPC.seedOf(0))[0].p);
    // live, twice with KEY SYNC on: the same chord gives the same random order
    const runs = [];
    for (let k = 0; k < 2; k++) { H.reset(); H.Q.setBpm(240); H.arp({on: 1, res: 0, type: 4, ks: 1}); await H.sl(30); H.keys([60, 64, 67, 71]); await H.sl(1100); H.up([60, 64, 67, 71]); await H.sl(80); runs.push(H.log().map(x => x.note)); }
    const other = []; for (let c = 0; c < 64; c++) other.push(ARPC.arpPattern(4, 1, N, c, seed ^ 0x55aa)[0].p);
    return {cnt, same: JSON.stringify(seq) === JSON.stringify(seq2), runs, diff: JSON.stringify(other) !== JSON.stringify(seq.slice(0, 64)), first: seq.slice(0, runs[0].length)};
  });
  const pc = Object.values(r.cnt).map(x => x / 2000 * 100);
  ok('MK5-02 2000 Schritte: jeder Ton 25 % ± 4 %', pc.length === 4 && pc.every(x => Math.abs(x - 25) <= 4), pc.map(x => x.toFixed(1)).join(' / '));
  ok('MK5-02 gleicher Seed → gleiche Folge (deep-equal), anderer Seed → andere', r.same && r.diff);
  ok('MK5-02 live zweimal (KEY SYNC an): dieselbe Folge, = Muster ab Zähler 0', r.runs[0].length > 20 && J(r.runs[0]) === J(r.runs[1]) && J(r.runs[0]) === J(r.first.slice(0, r.runs[0].length)), r.runs[0].slice(0, 16).join(' ') + ' | ' + r.runs[1].slice(0, 16).join(' ') + ' | ' + r.first.slice(0, 16).join(' '));
});

await T('MK5-03', async page => {
  const r = await page.evaluate(async () => {
    const out = {};
    for (const res of [1, 0, 2, 3, 4, 5]) {
      H.reset(); H.Q.setBpm(120); H.arp({on: 1, res, gate: 50}); H.Q.play(); await H.sl(150);
      H.keys([60, 64, 67]); await H.sl(res >= 4 ? 2600 : 1400); H.up([60, 64, 67]); await H.sl(60);
      // MK5-fix: a chord heard on a grid point starts with a late first step at once (flag late); the grid steps after it are measured
      const nl = H.Q.noteLog(400).filter(e => e.src === 'arp' && !e.late), L = H.log().filter(x => !x.late);
      out[res] = {beats: nl.map(e => e.beat), dt: L.slice(1).map((x, k) => x.t - L[k].t)};
      H.Q.stop();
    }
    return out;
  });
  const SB = [1 / 6, 1 / 4, 1 / 3, 1 / 2, 2 / 3, 1], NM = ['1/24', '1/16', '1/12', '1/8', '1/6', '1/4'];
  for (const res of [1, 0, 2, 3, 4, 5]) {
    const x = r[res], sb = SB[res], err = Math.max(...x.beats.map(b => Math.abs(b / sb - Math.round(b / sb)) * sb)), dErr = Math.max(...x.dt.map(d => Math.abs(d - sb * .5)));
    ok(`MK5-03 ${NM[res]} bei 120 BPM: Abstand ${(sb * 500).toFixed(1)} ms, Einsätze auf dem Song-Raster ± 0,002 Schlag`, x.beats.length >= 4 && err <= .002 && dErr <= .0005, `n=${x.beats.length} Raster-Fehler ${err.toFixed(5)} Schlag, Abstand-Fehler ${(dErr * 1000).toFixed(3)} ms`);
  }
});

await T('MK5-04', async page => {
  const r = await page.evaluate(async () => {
    const out = {};
    for (const g of [50, 100, 0]) { H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 1, gate: g}); await H.sl(30); H.keys([60, 64, 67]); await H.sl(800); H.up([60, 64, 67]); await H.sl(60); const L = H.log(); out[g] = L.map((x, k) => [x.dur, L[k + 1] ? L[k + 1].t - x.t : null]); }
    return out;
  });
  ok('MK5-04 GATE 50 % = ½ Schritt (62,5 ms) ± 1 ms', r[50].length > 4 && r[50].every(([d]) => Math.abs(d - .0625) <= .001), (r[50][0][0] * 1000).toFixed(3) + ' ms');
  ok('MK5-04 GATE 100 % = bis zum nächsten Schritt (keine Lücke)', r[100].length > 4 && r[100].every(([d, n]) => n == null || Math.abs(d - n) < 1e-6), (r[100][0][0] * 1000).toFixed(3) + ' ms / ' + (r[100][0][1] * 1000).toFixed(3));
  ok('MK5-04 GATE 0 % = 3 ms', r[0].length > 4 && r[0].every(([d]) => Math.abs(d - .003) < 1e-6), (r[0][0][0] * 1000).toFixed(3) + ' ms');
});

await T('MK5-05', async page => {
  const r = await page.evaluate(async () => {
    const out = {};
    for (const sw of [50, -50, 0]) { H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 3, gate: 30, swing: sw}); H.Q.play(); await H.sl(150); H.keys([60, 64, 67]); await H.sl(1600); H.up([60, 64, 67]); await H.sl(50);
      out[sw] = H.Q.noteLog(400).filter(e => e.src === 'arp' && !e.late).map(e => e.beat); H.Q.stop(); }
    return out;
  });
  const off = bs => bs.map(b => { const k = Math.round((b - (Math.abs(b * 2 - Math.round(b * 2)) < .1 ? 0 : 0)) * 2); return b; });
  void off;
  const dev = (bs, s) => bs.map(b => { const k = Math.round(b * 2 - (s > 0 && Math.abs(b * 2 - Math.floor(b * 2) - .25) < .2 ? .25 : 0)); return {k, ms: (b - k / 2) * 500}; });
  const ev = sw => { const d = r[sw].map(b => { const k = Math.floor(b * 2 + .3), ms = (b - k / 2) * 500; return {k, ms}; }); return d; };
  void dev;
  for (const sw of [50, -50, 0]) {
    const d = r[sw].map(b => { const k = Math.round(b * 2 - (sw > 0 ? .125 : sw < 0 ? -.125 : 0)); return {odd: ((k % 2) + 2) % 2 === 1, ms: (b - k / 2) * 500}; });
    const want = sw * .5 / 100 * 250, even = d.filter(x => x.odd), odd = d.filter(x => !x.odd);
    ok(`MK5-05 SWING ${sw > 0 ? '+' : ''}${sw} (1/8): gerade Noten ${want > 0 ? '+' : ''}${want.toFixed(1)} ms ± 1, ungerade gerade`, even.length >= 2 && odd.length >= 2 && even.every(x => Math.abs(x.ms - want) <= 1) && odd.every(x => Math.abs(x.ms) <= 1),
      even.slice(0, 3).map(x => x.ms.toFixed(2)).join(' ') + ' | ' + odd.slice(0, 3).map(x => x.ms.toFixed(2)).join(' '));
  }
  void ev;
});

await T('MK5-06', async page => {
  const r = await page.evaluate(async () => {
    H.reset(); H.Q.setBpm(240); H.arp({on: 1, res: 0, last: 4, steps: 255 & ~2, ks: 1}); await H.sl(30); H.keys([60, 64, 67]); await H.sl(900); H.up([60, 64, 67]); await H.sl(60);
    const L = H.log().map(x => [x.step, x.note, x.c]);
    H.reset(); H.Q.setBpm(240); H.arp({on: 1, res: 0, steps: 0}); await H.sl(30); H.keys([60, 64, 67]); await H.sl(400); H.up([60, 64, 67]); await H.sl(60);
    return {L, none: H.log().length, v: H.Q.voices().filter(v => v.track === 0).length};
  });
  const P = [60, 64, 67], okSeq = r.L.length >= 9 && r.L.slice(0, -1).every(([s, n, c]) => s === (c % 4) + 1 && s !== 2 && n === P[c % 3]) && r.L.slice(0, 6).map(x => x[0]).join('') === '134134';
  ok('MK5-06 LÄNGE 4, Schritt 2 aus: Note, Pause, Note, Note, alle 4 Schritte; der Zeiger rückt bei der Pause weiter', okSeq, r.L.slice(0, 9).map(x => x[0] + ':' + x[1]).join(' '));
  ok('MK5-06 alle Schritte aus: Stille ohne Fehler', r.none === 0 && r.v === 0, r.none + ' Noten');
});

await T('MK5-07', async page => {
  const r = await page.evaluate(async () => {
    H.reset(); H.Q.setBpm(240); H.arp({on: 1, res: 0, ks: 1}); await H.sl(30);
    H.keys([60, 64, 67]); await H.sl(230); H.up([60, 64, 67]); await H.sl(120); const n1 = H.log().length; H.keys([62, 65, 69]); await H.sl(300); H.up([62, 65, 69]); await H.sl(60);
    const L = H.log(), a = L[n1];
    // KEY SYNC off, transport running: two runs with different key times give the same pattern from the bar on
    const runs = [];
    for (const dl of [130, 460]) { H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 1, ks: 0, gate: 40}); H.Q.play(); await H.sl(dl); H.keys([60, 64, 67]); await H.sl(4300 - dl); H.up([60, 64, 67]); await H.sl(40);
      runs.push(H.Q.noteLog(400).filter(e => e.src === 'arp' && e.beat >= 4 - 1e-3 && e.beat < 8 - 1e-3).map(e => [Math.round(e.beat * 4), e.out])); H.Q.stop(); }
    return {a: a && [a.note, a.step, a.c], runs};
  });
  ok('MK5-07 KEY SYNC an: neuer Akkord nach „alle los“ beginnt bei Schritt 1 mit N₁', r.a && r.a[0] === 62 && r.a[1] === 1 && r.a[2] === 0, J(r.a));
  ok('MK5-07 KEY SYNC aus: zwei Läufe mit verschiedenem Anschlag = dasselbe Muster ab dem Takt', r.runs[0].length >= 14 && J(r.runs[0]) === J(r.runs[1]), J(r.runs[0].slice(0, 6)) + ' | ' + J(r.runs[1].slice(0, 6)));
});

await T('MK5-08', async page => {
  const r = await page.evaluate(async () => {
    H.reset(); H.Q.setBpm(240); H.arp({on: 1, res: 0, latch: 1, ks: 1}); await H.sl(30);
    H.keys([60, 64, 67]); await H.sl(200); H.up([60, 64, 67]); const tUp = H.now(); await H.sl(400);
    const held = H.log().filter(x => x.t > tUp + .06).map(x => x.note);
    const n1 = H.log().length; H.keys([62, 65]); await H.sl(150); H.up([62, 65]); await H.sl(300);
    const rep = H.log().slice(n1).map(x => x.note);
    const n2 = H.log().length; H.keys([62, 65]); await H.sl(200); H.keys([69]); await H.sl(400);
    const add = H.log().slice(n2).map(x => x.note);
    H.up([62, 65, 69]); await H.sl(150); H.arp({latch: 0}); const tOff = H.now(); await H.sl(300);
    const after = H.log().filter(x => x.t > tOff + 1 / 6 * .25 + .101).length;
    return {held, rep, add, after, v: H.Q.voices().filter(v => v.track === 0 && v.state !== 'released').length};
  });
  ok('MK5-08 Latch: Loslassen hält den Satz', r.held.length >= 4 && r.held.every(n => [60, 64, 67].includes(n)), r.held.join(' '));
  ok('MK5-08 neue Tasten nach „alle los“ ersetzen ihn', r.rep.length >= 4 && r.rep.every(n => [62, 65].includes(n)), r.rep.join(' '));
  ok('MK5-08 eine weitere Taste beim Halten ergänzt', r.add.includes(69) && r.add.every(n => [62, 65, 69].includes(n)), r.add.join(' '));
  ok('MK5-08 Latch aus → Stopp ≤ 1 Schritt, keine Stimme', r.after === 0 && r.v === 0, r.after + ' Noten danach, ' + r.v + ' Stimmen');
});

await T('MK5-09', async page => {
  // the press time = the audio clock read in inputDown (ARPC.live gets it + LIVE_LEAD)
  const r = await page.evaluate(async () => { const out = [], f = ARPC.live; let tp = null; ARPC.live = (i, id, n, v, t) => { if (tp == null) tp = t - LIVE_LEAD; return f(i, id, n, v, t); };
    for (let k = 0; k < 5; k++) { H.reset(); H.arp({on: 1, res: 1}); await H.sl(40 + k * 17); tp = null; H.keys([60, 64]); await H.sl(60); out.push(H.log()[0].t - tp); H.up([60, 64]); await H.sl(50); } ARPC.live = f; return out; });
  ok('MK5-09 Transport steht: erste Arp-Note ≤ 10 ms nach dem Tastendruck (geplanter Zeitstempel)', r.every(d => d >= 0 && d <= .010 + 1e-6), r.map(d => (d * 1000).toFixed(2)).join(' / ') + ' ms');
});

await T('MK5-10', async page => {
  const r = await page.evaluate(async () => {
    H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 1, gate: 50}); H.Q.play(); await H.sl(150); H.keys([60, 64, 67]); await H.sl(900);
    const tc = H.now(); H.Q.setBpm(90); await H.sl(1200); H.up([60, 64, 67]); await H.sl(40);
    const nl = H.Q.noteLog(400).filter(e => e.src === 'arp'), L = H.log();
    return {beats: nl.map(e => e.beat), tc, ts: L.map(x => x.t), v: L.map(x => x.note)};
  });
  const d = r.beats.slice(1).map((b, k) => +(b - r.beats[k]).toFixed(4)), aft = r.ts.filter(t => t > r.tc + .11), dts = aft.slice(1).map((t, k) => t - aft[k]);
  ok('MK5-10 Tempo-Wechsel im Lauf: kein doppelter und kein fehlender Schlag (Abstand immer ¼ Schlag)', d.length > 10 && d.every(x => Math.abs(x - .25) < .003), d.join(' '));
  ok('MK5-10 die nächsten Schritte im neuen Tempo (166,7 ms bei 90 BPM)', dts.length > 4 && dts.every(x => Math.abs(x - 60 / 90 / 4) < .0005), dts.slice(0, 4).map(x => (x * 1000).toFixed(2)).join(' '));
});

await T('MK5-11', async page => {
  const r = await page.evaluate(async () => {
    const scope = async () => { mkScopeOf(0); await H.sl(120); const s = mkScopeOf(0); return s ? s.voices.map(v => [v.tb === 2 ? 2 : 1, v.note]) : null; };
    const out = {};
    // Dual + Ziel T1: T1 arpeggiates, T2 holds the chord
    H.reset(); H.Q.setBpm(120); H.mk('mode', 1); H.mk('tv', 0); H.arp({on: 1, res: 3, gate: 100, tgt: 1}); await H.sl(50); H.keys([60, 64, 67]); await H.sl(600);
    out.dualT1 = await scope(); out.dualT1v = H.Q.voices().filter(v => v.track === 0).map(v => v.src); H.up([60, 64, 67]); await H.sl(200);
    out.dualT1masks = [...new Set(VOICES.filter(v => v.track === 0).map(v => v.src + ':' + (v.mask || 0)))];
    H.reset(); H.mk('mode', 1); H.arp({on: 1, res: 3, gate: 100, tgt: 0}); await H.sl(50); H.keys([60, 64, 67]); await H.sl(600); out.dualB = await scope(); H.up([60, 64, 67]); await H.sl(200);
    // Split + Ziel T1 + OKTAVEN 3: no arp note on T2, also above split; T2 holds its keys
    H.reset(); H.mk('mode', 2); H.mk('split', 60); H.arp({on: 1, res: 0, gate: 100, tgt: 1, range: 3}); await H.sl(50); H.keys([48, 52, 55, 72, 76]);
    const sc = []; for (let k = 0; k < 8; k++) { mkScopeOf(0); await H.sl(70); const s = mkScopeOf(0); if (s) sc.push(s.voices.filter(v => v.gate !== false).map(v => [v.tb === 2 ? 2 : 1, v.note])); }
    out.split = sc; out.splitLog = H.log().map(x => x.note); H.up([48, 52, 55, 72, 76]); await H.sl(200);
    // Split + Ziel Beide: the key decides the timbre of its arp notes
    H.reset(); H.mk('mode', 2); H.mk('split', 60); H.arp({on: 1, res: 0, gate: 100, tgt: 0, range: 2}); await H.sl(50); H.keys([55, 72]);
    const sb = []; for (let k = 0; k < 8; k++) { mkScopeOf(0); await H.sl(60); const s = mkScopeOf(0); if (s) sb.push(s.voices.map(v => [v.tb === 2 ? 2 : 1, v.note])); }
    out.splitB = sb; H.up([55, 72]); await H.sl(100);
    return out;
  });
  const t1 = (r.dualT1 || []).filter(v => v[0] === 1), t2 = (r.dualT1 || []).filter(v => v[0] === 2).map(v => v[1]).sort();
  ok('MK5-11 Dual + Ziel T1: T1 arpeggiert (1 Note), T2 hält den Akkord', t1.length >= 1 && t1.length <= 2 && J(t2) === '[60,64,67]', J(r.dualT1) + ' masks ' + J(r.dualT1masks));
  const bt1 = (r.dualB || []).filter(v => v[0] === 1).length, bt2 = (r.dualB || []).filter(v => v[0] === 2).length;
  ok('MK5-11 Dual + Ziel Beide: beide Timbres spielen die Arp-Note', bt1 >= 1 && bt2 >= 1 && bt1 <= 2 && bt2 <= 2, J(r.dualB));
  const anyT2Arp = r.split.some(a => a.some(([tb, n]) => tb === 2 && ![72, 76].includes(n))), t2held = r.split.every(a => J(a.filter(v => v[0] === 2).map(v => v[1]).sort()) === '[72,76]');
  ok('MK5-11 Split + Ziel T1 + OKTAVEN 3: keine Arp-Note auf T2 (auch über split), T2 hält 72/76', r.split.length >= 5 && !anyT2Arp && t2held && Math.max(...r.splitLog) > 60, J(r.split.slice(0, 3)) + ' log max ' + Math.max(...r.splitLog));
  const bad = r.splitB.some(a => a.some(([tb, n]) => (n % 12 === 7 && tb !== 1) || (n % 12 === 0 && tb !== 2)));
  ok('MK5-11 Split + Ziel Beide: die gehaltene Taste bestimmt das Timbre (G → T1 auch oktaviert über split)', r.splitB.length >= 5 && !bad && r.splitB.some(a => a.some(([tb, n]) => tb === 1 && n === 67)), J(r.splitB.slice(0, 4)));
});

await T('MK5-12', async page => {
  const r = await page.evaluate(async () => { H.reset(); H.arp({on: 1, res: 1, type: 5}); await H.sl(30); H.keys([72, 48, 64, 55, 60, 67]); await H.sl(500); H.up([72, 48, 64, 55, 60, 67]); await H.sl(50);
    const g = {}; for (const x of H.log()) (g[x.t.toFixed(4)] = g[x.t.toFixed(4)] || []).push(x.note); return Object.values(g).map(a => a.sort((p, q) => p - q)); });
  ok('MK5-12 TYP Akkord mit 6 Tasten bei 4 Stimmen: die 4 tiefsten spielen (ab dem 2. Schritt; der erste kann bei Tasten > 8 ms auseinander unvollständig sein)', r.length >= 3 && r.slice(1).every(a => J(a) === '[48,55,60,64]'), J(r.slice(0, 2)));
});

await T('MK5-13', async page => {
  const r = await page.evaluate(async () => {
    const twoPass = async (o) => { H.reset(); H.Q.setBpm(150); H.arp(o);
      const ch = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]], notes = []; ch.forEach((c, b) => c.forEach(n => notes.push({t: b * 4, d: 4, n, v: .8})));
      H.Q.setClip(0, 0, {len: 4, notes}); H.Q.launchClip(0, 0); await H.sl(100); if (!R.playing) H.Q.play(); await H.sl((32 * 60 / 150 + .3) * 1000);
      const nl = H.Q.noteLog(800).filter(e => e.src === 'arp' && e.beat != null), pass = k => nl.filter(e => e.beat >= 16 * k - 1e-3 && e.beat < 16 * (k + 1) - 1e-3).map(e => [+(e.beat - 16 * k).toFixed(3), e.out]);
      const r = [pass(0), pass(1)]; H.Q.stop(); await H.sl(200); return r; };
    const ksOff = await twoPass({on: 1, res: 1, type: 2, range: 1, gate: 60, ks: 0});
    H.reset(); H.Q.setBpm(150); H.arp({on: 1, res: 1, type: 3, range: 2, gate: 60, ks: 1});
    const ch = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]], notes = []; ch.forEach((c, b) => c.forEach(n => notes.push({t: b * 4, d: 4, n, v: .8})));
    H.Q.setClip(0, 0, {len: 4, notes}); H.Q.setClip(0, 1, {len: 1, notes: [{t: 0, d: 4, n: 62, v: .8}]});
    H.Q.launchClip(0, 0); await H.sl(100); if (!R.playing) H.Q.play();
    const spb_ = 60 / 150; await H.sl((32 * spb_ + .3) * 1000);
    const nl = H.Q.noteLog(800).filter(e => e.src === 'arp' && e.beat != null);
    const pass = k => nl.filter(e => e.beat >= 16 * k - 1e-3 && e.beat < 16 * (k + 1) - 1e-3).map(e => [+(e.beat - 16 * k).toFixed(3), e.out]);
    const p1 = pass(0), p2 = pass(1);
    // a scene switch at the bar line (to an empty scene): no note hangs
    H.Q.stopTrack(0); const bar = Math.ceil(t2b(H.now()) / 4 + 1e-9) * 4; await H.sl(((bar - t2b(H.now())) * spb_ + .25 + .05) * 1000);
    const left = H.Q.voices().filter(v => v.track === 0).length, sc = mkScopeOf(0); await H.sl(150);
    const wv = (mkScopeOf(0) || {voices: []}).voices.length;
    // switch to scene 2 at a bar line: the old chord's arp ends there, the new one starts there
    H.Q.launchClip(0, 0); await H.sl(2 * 4 * spb_ * 1000); const n0 = H.Q.noteLog(800).length; H.Q.launchClip(0, 1); const b2 = Math.ceil(t2b(H.now()) / 4 + 1e-9) * 4; await H.sl(((b2 - t2b(H.now())) * spb_ + 1.2) * 1000);
    const sw = H.Q.noteLog(800).filter(e => e.src === 'arp' && e.beat >= b2 - 1e-3).map(e => e.out); const bef = H.Q.noteLog(800).filter(e => e.src === 'arp' && e.beat < b2 - 1e-3 && e.beat + e.dur / spb_ > b2 + 1e-3);
    H.Q.stop(); await H.sl(400); const end = H.Q.voices().filter(v => v.track === 0).length;
    void sc; void n0; return {p1, p2, left, wv, sw, bef: bef.length, end, ksOff};
  });
  ok('MK5-13 4-Takt-Akkord-Clip durch den Arp (KEY SYNC an, Wechsel 2, 2 Okt.): zwei Durchläufe = dieselbe Folge', r.p1.length >= 50 && J(r.p1) === J(r.p2), r.p1.length + ' / ' + r.p2.length + ' ' + J(r.p1.slice(0, 4)));
  ok('MK5-13 dasselbe mit KEY SYNC aus (Wechsel 1, Musterlänge 4 teilt den Takt-Loop)', r.ksOff[0].length >= 50 && J(r.ksOff[0]) === J(r.ksOff[1]), r.ksOff[0].length + ' / ' + r.ksOff[1].length);
  ok('MK5-13 Spur stoppen am Taktstrich: keine hängende Note (Proxies und Worklet)', r.left === 0 && r.wv === 0, r.left + ' / ' + r.wv);
  ok('MK5-13 Szenenwechsel am Taktstrich: ab dort nur der neue Akkord, nichts hängt über den Strich', r.sw.length >= 4 && r.sw.every(n => n % 12 === 2) && r.bef === 0 && r.end === 0, J(r.sw.slice(0, 6)) + ' über den Strich: ' + r.bef);
});

await T('MK5-14', async page => {
  const r = await page.evaluate(async () => {
    H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 1, type: 4, ks: 1, gate: 50});
    H.Q.selectSlot && H.Q.selectSlot(0, 0);
    const u0 = H.Q.undoInfo().n;
    R.selS = 0; H.Q.rec(); await H.sl(200);
    while (!(rec.state === 'recording')) await H.sl(20);
    const b0 = Math.ceil(t2b(H.now()) + 1e-9); await H.sl((b2t(b0) - H.now()) * 1000 + 2);
    H.keys([60, 64, 67]); await H.sl(1000); H.up([60, 64, 67]); await H.sl(200); H.keys([62, 65, 69]); await H.sl(1000); H.up([62, 65, 69]);
    const live = H.Q.noteLog(400).filter(e => e.src === 'arp').map(e => [e.out]);
    const perf = PERF.list.filter(e => !e.dead && e.track === 0).length, arpN = H.log().length;
    const mid = buildMidiLog(); const midN = mid ? (() => { let n = 0; const b = mid.bytes || mid; for (let k = 0; k + 2 < b.length; k++) if ((b[k] & 0xf0) === 0x90 && (b[k] & 0x0f) === 0 && b[k + 2] > 0) n++; return n; })() : -1;
    await H.sl(600); H.Q.rec(); await H.sl(400); H.Q.stop(); await H.sl(200);
    const clip = H.Q.getClip(0, 0), u1 = H.Q.undoInfo().n;
    // playback: the same arp order per chord (KEY SYNC on, Random with the same seed)
    const liveSeq = H.Q.noteLog(400).filter(e => e.src === 'arp').map(e => e.out); void liveSeq;
    const liveLog = ARPC.arpLog(0); ARPC.clearLog(0); H.Q.launchClip(0, 0); if (!R.playing) H.Q.play(); await H.sl(4 * 4 * .5 * 1000 + 300); H.Q.stop(); await H.sl(100);
    const playLog = ARPC.arpLog(0), byChord = L => { const g = []; let cur = null; for (const x of L) { if (x.c === 0) { cur = []; g.push(cur); } if (cur) cur.push(x.note); } return g; };
    const lg = byChord(liveLog), pg = byChord(playLog);
    const cnt = b => { let n = 0; const B = b.bytes || b; for (let k = 0; k + 2 < B.length; k++) if (B[k] === 0x90 && B[k + 2] > 0) n++; return n; };
    const scn = buildMidi({mode: 'scene', scene: 0}), scN = scn ? cnt(scn) : -1;
    return {lg: lg.map(a => a.slice(0, 6)), pg: pg.map(a => a.slice(0, 6)), scN, clipN: clip ? clip.notes.length : 0,
      clipNotes: clip ? clip.notes.map(n => n.n).sort((a, b) => a - b) : null, undo: u1 - u0, live: live.length, perf, arpN, midN, rs: rec.state};
  });
  ok('MK5-14 ● mit Arp nimmt die Tasten auf (Clip-Noten = gespielte Akkorde), ein Undo', J(r.clipNotes) === '[60,62,64,65,67,69]' && r.undo === 1, J(r.clipNotes) + ' undo +' + r.undo);
  ok('MK5-14 Abspielen der Aufnahme: dieselbe Arp-Folge je Akkord wie beim Spielen (Zufall, gleicher Seed)', r.lg.length === 2 && r.pg.length >= 2 && J(r.lg[0]) === J(r.pg[0]) && J(r.lg[1]) === J(r.pg[1]), J(r.lg) + ' | ' + J(r.pg));
  ok('MK5-14 Szenen-/Song-MIDI-Export: nur die Clip-Noten (ohne Arp-Noten)', r.scN === r.clipN, r.scN + ' Note-On im Export, ' + r.clipN + ' Clip-Noten');
  ok('MK5-14 Mitschnitt (PERF / buildMidiLog) = genau die Arp-Noten aus arpLog', r.perf === r.arpN && r.arpN > 10, r.perf + ' / ' + r.arpN + ' (MIDI ' + r.midN + ')');
});

await T('MK5-15', async page => {
  const r = await page.evaluate(async () => {
    const out = {}, sp = () => 60 / S.bpm / 4, check = async (name, act, keysToo) => {
      H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 1, gate: 100, latch: 1}); H.Q.launchClip(0, 0); if (!R.playing) H.Q.play(); await H.sl(200);
      H.keys([60, 64, 67]); await H.sl(450); if (!keysToo) H.up([60, 64, 67]); await H.sl(100);
      const t = (await act()) || H.now(); await H.sl((sp() + .12) * 1000 + 60);
      const pv = H.Q.voices().filter(v => v.track === 0 && v.state !== 'released' && v.src !== 'clip').length; await H.sl(250);
      const s = mkScopeOf(0); await H.sl(120); const s2 = mkScopeOf(0); void s;
      const late = H.log().filter(x => x.t > t + sp() + .101).length;
      out[name] = {pv, wv: s2 ? s2.voices.filter(v => v.note !== 48).length : (AU.synth[0] ? -1 : 0), late, arpLive: H.Q.voices().filter(v => v.track === 0 && v.src === 'arp' && v.state !== 'released').length, orphan: H.Q.voices().filter(v => v.track === 0 && v.state === 'released').length};
      H.up([60, 64, 67]);
    };
    const clip = {len: 1, notes: [{t: 0, d: 4, n: 48, v: .8}]};
    H.Q.setClip(0, 0, clip); H.Q.setClip(0, 1, null);
    await check('Stopp', async () => H.Q.stop());
    await check('Panik', async () => H.Q.panic());
    await check('Szenenwechsel', async () => { S.tracks[0].clips[1] = null; H.Q.launchScene(1); const b = Math.ceil(t2b(H.now()) / 4 + 1e-9) * 4; await H.sl((b2t(b) - H.now()) * 1000 + 20); return b2t(b); });
    await check('Engine-Wechsel', async () => H.Q.setEngine(0, 'analog'));
    H.Q.setEngine(0, 'mk');
    await check('Arp aus', async () => H.arp({on: 0}));
    await check('Spur stumm', async () => { S.tracks[0].mute = true; UI.dirty.strip = true; });
    S.tracks[0].mute = false;
    await check('Teilwechsel (Spur stoppt am Taktstrich)', async () => { H.Q.stopTrack(0); const b = Math.ceil(t2b(H.now()) / 4 + 1e-9) * 4; await H.sl((b2t(b) - H.now()) * 1000 + 20); return b2t(b); });
    return out;
  });
  for (const k in r) { const x = r[k]; ok(`MK5-15 ${k}: nach ≤ 1 Schritt + Release 0 klingende Stimmen (Worklet), kein Arp-Schritt danach`, x.wv <= 0 && x.late === 0 && x.arpLive === 0 && (x.pv === 0 || k === 'Arp aus'), J(x)); }
});

await T('MK5-19', async page => {
  const r = await page.evaluate(async () => {
    const out = {};
    for (const mode of ['plain', 'single', 'xp']) {
      H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 1, gate: 60, type: 0, range: 1});
      S.settings.harmony.single = mode === 'single'; syncTransposer();
      const notes = [60, 64, 67].map(n => ({t: 0, d: 16, n, v: .8}));
      H.Q.setClip(0, 0, {len: 4, key: {root: 0, scale: 'ionian', src: 'manual'}, notes}); H.Q.launchClip(0, 0); if (!R.playing) H.Q.play();
      await H.sl(150);
      // a carrier change in bar 3 (beat 8), set while the planner already looks ahead into bar 3
      const tc = b2t(8); await H.sl(Math.max(0, (tc - H.now() - .06) * 1000));
      const tgt = parseChord('Am');
      if (mode === 'xp') xpSet(8, 2); else T.recall(tgt, tc, null);   // ⇅ +2 in bar 3 (FOLGT on: the track follows)
      await H.sl((b2t(14) - H.now()) * 1000);
      const nl = H.Q.noteLog(800).filter(e => e.src === 'arp');
      const after = nl.filter(e => e.time >= tc - 1e-6), before = nl.filter(e => e.time < tc - 1e-6);
      const want = new Set([0, 1, 2].map(k => outPitch(0, S.tracks[0].clips[0].key, [60, 64, 67][k], tc + .01)));
      out[mode] = {after: after.map(e => e.out), want: [...want], before: before.map(e => e.out), bad: after.filter(e => !want.has(e.out)).length, hang: VOICES.filter(v => !v.dead && v.track === 0 && v.src === 'arp' && v.start < tc && v.end > tc + .2).length};
      H.Q.stop(); await H.sl(150); T.reset(H.now(), null); xpReset();
    }
    S.settings.harmony.single = false; syncTransposer();
    return out;
  });
  for (const m in r) { const x = r[m]; ok(`MK5-19 Träger-Wechsel in Takt 3 (${m}): ab Takt 3 jede Arp-Note aus dem neuen Akkord (± 0 HT), keine hängende Note`, x.after.length >= 10 && x.bad === 0 && x.hang === 0 && J(x.want.sort()) !== J([...new Set(x.before)].sort()),
    'neu ' + J(x.want) + ' gespielt ' + J([...new Set(x.after)]) + ' vorher ' + J([...new Set(x.before)])); }
});

await T('MK5-20', async page => {
  const r = await page.evaluate(async () => {
    const out = {};
    // global swing 30 %, arp 1/16, W-35 = 0: the even arp steps lie like the clip 16ths
    H.reset(); H.Q.setBpm(120); S.settings.swing = .3; H.arp({on: 1, res: 1, gate: 30});
    H.Q.setClip(1, 0, {len: 1, notes: [0, .25, .5, .75, 1, 1.25].map(t => ({t, d: .1, n: 72, v: .8}))}); H.Q.setClip(0, 0, {len: 1, notes: [{t: 0, d: 4, n: 60, v: .8}, {t: 0, d: 4, n: 64, v: .8}]});
    H.Q.launchClip(0, 0); H.Q.launchClip(1, 0); if (!R.playing) H.Q.play(); await H.sl(1300);
    const nl = H.Q.noteLog(400), a = nl.filter(e => e.src === 'arp' && e.beat < 4), c = nl.filter(e => e.track === 1 && e.src === 'clip' && e.beat < 4);
    out.g = {a: a.map(e => +(e.time - R.startTime).toFixed(5)).slice(0, 6), c: c.map(e => +(e.time - R.startTime).toFixed(5)).slice(0, 6)};
    H.Q.stop(); await H.sl(100);
    H.reset(); H.Q.setBpm(120); S.settings.swing = .3; H.arp({on: 1, res: 1, gate: 30, swing: 50}); H.Q.setClip(1, 0, null);
    H.Q.launchClip(0, 0); if (!R.playing) H.Q.play(); await H.sl(800);
    out.w = H.Q.noteLog(400).filter(e => e.src === 'arp' && e.beat < 2).map(e => +((e.beat * 4 - Math.round(e.beat * 4 - .2)) / 4 * 500).toFixed(3));
    H.Q.stop(); S.settings.swing = 0;
    // transport stopped: a held chord runs ≥ 4 s without a gap
    H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 1, gate: 100}); await H.sl(30); H.keys([60, 64, 67]); await H.sl(4300); H.up([60, 64, 67]); await H.sl(40);
    const L = H.log(); out.s = {n: L.length, gap: Math.max(...L.slice(1).map((x, k) => x.t - (L[k].t + L[k].dur))), span: L[L.length - 1].t - L[0].t};
    // clip notes with future time stamps start no arp step too early
    H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 1, gate: 50}); H.Q.setClip(0, 0, {len: 2, notes: [{t: 4.5, d: 2, n: 60, v: .8}]});
    H.Q.launchClip(0, 0); if (!R.playing) H.Q.play(); await H.sl(3200);
    const f = H.Q.noteLog(400).filter(e => e.src === 'arp'); out.f = f.length ? f[0].beat : null; H.Q.stop();
    return out;
  });
  const dd = r.g.a.map((t, k) => Math.abs(t - r.g.c[k]));
  ok('MK5-20 Song-Swing 30 %, Arp 1/16, SWING 0: gerade Arp-Schritte wie die Clip-16tel (± 1 ms)', r.g.a.length >= 6 && dd.every(x => x <= .001) && Math.abs((r.g.a[1] - r.g.a[0]) - .125) > .005, J(r.g.a) + ' | ' + J(r.g.c));
  ok('MK5-20 SWING +50: nur W-35 wirkt (gerade +31,25 ms)', r.w.length >= 6 && r.w.every((ms, k) => Math.abs(ms - (k % 2 ? 31.25 : 0)) <= 1), J(r.w.slice(0, 6)));
  ok('MK5-20 Transport steht: ein gehaltener Akkord läuft ≥ 4 s ohne Lücke', r.s.span >= 4 && r.s.gap <= 1e-6, J(r.s));
  ok('MK5-20 Clip-Noten mit künftigen Zeitstempeln: kein Arp-Schritt zu früh (erste Note bei Schlag 4,5)', r.f != null && Math.abs(r.f - 4.5) < .002, String(r.f));
});

await T('MK5-21', async page => {
  const r = await page.evaluate(async () => {
    // the main thread: one KEYS 9 per held chord (arp at 1/16, gate 50 %), never per step
    H.reset(); H.arp({on: 1, res: 1, gate: 50}); await H.sl(30);
    const E = AU.synth[0], k0 = E.keys, ks = []; E.keys = (ty, t) => { ks.push(ty); k0(ty, t); };
    H.keys([60, 64, 67]); await H.sl(700); H.up([60, 64, 67]); await H.sl(250); H.keys([62, 65]); await H.sl(500); H.up([62, 65]); await H.sl(250); E.keys = k0;
    const steps = H.log().length;
    // the worklet: LFO 1 KEY SYNC Timbre (saw 2 Hz) with arp on and KEYS only per chord: the phase runs over the steps
    const base = SQStore.normalizeSound(factorySound(INIT_IDS.mk)), snd = deep(base);
    snd.p.mk.t[0].l1 = {w: 0, ks: 1, sync: 0, f: 64, note: 6}; snd.p.mk.arp.on = 1;
    const ev = [], st = .125; let t = .05; ev.push([t, 'keys', 9]);
    for (let k = 0; k < 8; k++, t += st) { ev.push([t, 'on', 60 + (k % 3) * 4, .8, 'n' + k]); ev.push([t + st * .5, 'off', 60 + (k % 3) * 4, .8, 'n' + k]); }
    ev.push([t, 'keys', 10]); t += .2; ev.push([t, 'keys', 9]); const t2 = t;
    for (let k = 0; k < 3; k++, t += st) { ev.push([t, 'on', 62, .8, 'm' + k]); ev.push([t + st * .5, 'off', 62, .8, 'm' + k]); }
    const R1 = await H.Q.mkRender(snd, ev, {sec: 2, tap: 'lfo'});
    const at = x => R1.l[Math.round((x + .004) * 48000)];
    const on1 = [0, 1, 2, 3, 4, 5, 6, 7].map(k => at(.05 + k * st)), on2 = [0, 1, 2].map(k => at(t2 + k * st));
    // arp off (old rule): every note after all keys up resets the phase
    const snd0 = deep(snd); snd0.p.mk.arp.on = 0; const R0 = await H.Q.mkRender(snd0, ev.filter(e => e[1] !== 'keys'), {sec: 2, tap: 'lfo'});
    const off1 = [0, 1, 2, 3].map(k => R0.l[Math.round((.05 + k * st + .004) * 48000)]);
    // KEY SYNC Stimme: every arp note resets
    const sndV = deep(snd); sndV.p.mk.t[0].l1.ks = 2; const RV = await H.Q.mkRender(sndV, ev, {sec: 2, tap: 'lfo'});
    const v1 = [0, 1, 2, 3].map(k => RV.l[Math.round((.05 + k * st + .004) * 48000)]);
    return {ks, steps, on1, on2, off1, v1};
  });
  const sp = a => Math.max(...a) - Math.min(...a);
  ok('MK5-21 Hauptfaden: KEYS 9 einmal je gehaltenem Akkord (nicht je Schritt), KEYS 10 bei „alle los“', J(r.ks) === '[9,10,9,10]' && r.steps >= 8, J(r.ks) + ' bei ' + r.steps + ' Schritten');
  ok('MK5-21 Worklet, Key Sync Timbre + Arp: Phase läuft über die Arp-Schritte weiter, Reset beim neuen Akkord', sp(r.on1) > .5 && Math.abs(r.on2[0] - r.on1[0]) < .02, 'Einsätze ' + r.on1.map(x => x.toFixed(2)).join(' ') + ' | Akkord 2: ' + r.on2[0].toFixed(3));
  ok('MK5-21 ohne Arp (bisher): jede Note nach „alle los“ setzt zurück; Key Sync Stimme: je Arp-Note zurück', sp(r.off1) < .02 && sp(r.v1) < .02, r.off1.map(x => x.toFixed(3)).join(' ') + ' | ' + r.v1.map(x => x.toFixed(3)).join(' '));
});

await T('MK5-22', async page => {
  const r = await page.evaluate(async () => {
    H.reset(); H.arp({on: 1, res: 1, type: 0, range: 2}); await H.sl(30); H.keys([60, 64, 67]); await H.sl(900); H.up([60, 64, 67]); await H.sl(80);
    const wk = H.log().map(x => x.note);
    H.Q.forceNative(true); await H.sl(400); ARPC.clearLog();
    H.keys([60, 64, 67]); await H.sl(900); H.up([60, 64, 67]); await H.sl(80);
    const eco = H.log().map(x => x.note), nat = VOICES.filter(v => v.track === 0 && !v.wk).length + H.Q.noteLog(200).filter(e => e.src === 'arp').length;
    H.mk('mode', 1); H.arp({tgt: 2}); ARPC.clearLog(); H.keys([60, 64, 67]); await H.sl(400); const tv = VOICES.filter(v => v.track === 0 && !v.dead).map(v => v.src); H.up([60, 64, 67]);
    H.Q.forceNative(false);
    return {wk, eco, nat, tv, eng: !!AU.synth[0]};
  });
  ok('MK5-22 forceNative: der AM-Sound arpeggiert weiter, arpLog wie im Worklet-Klang', r.eco.length >= 6 && J(r.eco.slice(0, 6)) === J(r.wk.slice(0, 6)), J(r.eco.slice(0, 8)) + ' | ' + J(r.wk.slice(0, 8)));
  ok('MK5-22 ECO: nur T1-Noten (Schicht + Ziel T2: der gehaltene T1-Akkord klingt, keine T2-Arp-Note)', r.tv.every(s => s === 'live'), J(r.tv));
});

console.log(fails ? fails + ' FEHLER' : 'ALLE BESTANDEN');
await browser.close();
