// G6+h Abnahme (Nachtrag 10 §G6+h): G6P-70 (Akkorde der Begleitung am Takt), G6P-71 (Vorausrechnen im Song, verkürzt),
// G6P-72 (Video: Chor im Render, bitgleich, Solo wirkt nicht), G6P-73 (1 Song-Undo inkl. Spuren, Speichern/Laden deep-equal).
// node g6ph-accept.mjs <index.html> [<4.26.0+G6PH+Video.html>] [nur=70,71,72,73]
// (Playwright: NODE_PATH bzw. node_modules/playwright neben dem Aufruf; die Video-Datei baut apply_g6ph.py --video aus G-VID-zwischen.html)
import { createRequire } from 'module';
const require = createRequire(process.cwd() + '/x.js');
const { chromium } = require('playwright');
const [, , FILE, VFILE, ONLY] = process.argv;
const only = ONLY ? ONLY.replace('nur=', '').split(',') : null, want = k => !only || only.includes(k);
let fails = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// synthetischer Gesang (48 kHz): je Schlag eine Note (Obertöne 1…8, Vibrato ±25 ct, 20-ms-Hülle, kleine Lücke)
function sing(midis, bpm, sr = 48000) {
  const spb = 60 / bpm, n = Math.round(midis.length * spb * sr), y = new Int16Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr, k = Math.floor(t / spb), m = midis[Math.min(k, midis.length - 1)], tn = t - k * spb;
    const f = 440 * Math.pow(2, (m - 69 + 0.25 * Math.sin(2 * Math.PI * 5.5 * t) / 100 * 4 / 4) / 12);
    ph += 2 * Math.PI * f / sr;
    const env = Math.min(1, tn / 0.02, Math.max(0, (spb - 0.04 - tn) / 0.02));
    let s = 0; for (let h = 1; h <= 8; h++) s += Math.sin(h * ph) / h;
    y[i] = Math.round(env * 0.22 * s * 32767 / 1.6);
  }
  return Array.from(y);
}
// G-Dur: Begleitung G – Em – C – D (Synth 1, Szene 1 = Slot 0), Lead nur Akkordtöne
const CH = [[55, 59, 62], [52, 55, 59], [48, 52, 55], [50, 54, 57]], PCS = CH.map(c => c.map(x => x % 12).sort((a, b) => a - b));
const LEAD = [67, 71, 74, 71, 64, 67, 71, 67, 72, 76, 67, 76, 74, 78, 69, 78];
async function setup(p, o) {
  o = o || {};
  return p.evaluate(async ([lead, CH, o]) => {
    SYNQUENZER.setBpm(o.bpm || 120);
    const notes = []; CH.forEach((c, bar) => c.forEach(n => notes.push({t: bar * 4, d: 4, n, v: 0.8})));
    SYNQUENZER.setClip(0, 0, {len: 4, key: {root: 7, scale: 'ionian', src: 'user'}, notes});
    const r = await SYNQUENZER.tkInject({pcm: lead, sr: 48000, scene: 1, len: 4});
    const st = SYNQUENZER.tkInfo().stimme, dur = lead.length / 48000, bars = o.bars || 16;
    const lanes = []; for (let i = 0; i < 6; i++) lanes.push([]);
    lanes[0] = [{bar: 0, slot: 0}];
    const vox = (o.at || [8]).map((bar, k) => ({id: 'V' + (k + 1), bar, len: 4, take: r.id, in: 0, out: dur, at: 0}));
    SYNQUENZER.setSong({bars, lanes, vox, marks: o.marks || [], carrier: [], xp: [], mel: o.mel || {}, loop: {on: false, a: 0, b: bars}});
    return {id: r.id, st, song: SYNQUENZER.project().song};
  }, [sing(LEAD, o.bpm || 120), CH, o]);
}
async function page(file) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']}); const p = await b.newPage({viewport: {width: 390, height: 844}});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  return {b, p, errs};
}

if (want('70') || want('73')) {
  const {b, p, errs} = await page(FILE);
  const S0 = await setup(p, {mel: {1: {len: 16, key: null, notes: [{t: 8 * 4 + 12, d: 4, n: 38, v: 0.8}]}}});
  ok(S0.song && S0.song.vox && S0.song.vox.length === 1, 'Song mit Song-Stimme (Takt 9–12) und Begleitung G–Em–C–D');
  if (want('70')) {
    // Tabelle: Begleitung am Takt (Song-Bahn Synth 1 in Phase; Takt 12 zusätzlich song.mel auf Synth 2: D → bleibt D-Dur)
    let hit = 0, tot = 0;
    for (let bar = 0; bar < 16; bar++) for (const beat of [0, 1.5, 3.75]) {
      const got = await p.evaluate(([b, bt]) => SYNQUENZER.g6pSongPcs(b, bt), [bar, beat]); tot++;
      if (JSON.stringify(got) === JSON.stringify(PCS[bar % 4])) hit++; else console.log('  Takt', bar + 1, beat, got, '≠', PCS[bar % 4]);
    }
    ok(hit === tot, `G6P-70 g6pSongPcs: ${hit}/${tot} Stellen = Akkord der Begleitung`);
    const none = await p.evaluate(() => SYNQUENZER.g6pSongPcs(40, 0));
    ok(none === null, 'hinter dem Song: keine Begleitung (null)');
    for (const rec of ['drei', 'barber', 'terz']) {
      const made = await p.evaluate(rec => SYNQUENZER.g6Make({vox: 'V1'}, rec, 'up', '80'), rec);
      const pcs = await p.evaluate(() => SYNQUENZER.g6pPcsOf({vox: 'V1'})), info = await p.evaluate(() => SYNQUENZER.g6Info({vox: 'V1'}));
      if (!made || !pcs) { ok(false, 'G6P-70 ' + rec + ': kein Chor (' + made + ')'); continue; }
      let good = 0, all = 0, bad = [];
      info.chor.voices.forEach((v, vi) => v.n.forEach((n, j) => { const beat = Math.floor(n.t0 / 0.5 + 0.25), bar = Math.floor(beat / 4) % 4, pc = pcs[vi][j]; all++; if (rec === 'terz' ? true : PCS[bar].includes(pc)) good++; else bad.push([v.name, beat, pc]); }));
      if (rec === 'terz') ok(all > 10, `G6P-70 Terz (leitereigen) auf der Song-Stimme gerechnet: ${all} Noten`);
      else ok(good === all && all >= 16, `G6P-70 ${rec}: ${good}/${all} Chornoten sind Akkordtöne der Begleitung am Takt` + (bad.length ? ' ' + JSON.stringify(bad.slice(0, 6)) : ''));
    }
    // Gegenprobe: ohne Begleitung am Takt (Bahn leer) fällt die Song-Stimme auf die leitereigenen Dreiklänge zurück (wie 4.25.2)
    const fb = await p.evaluate(() => { const s = SYNQUENZER.project().song; s.lanes[0] = []; SYNQUENZER.setSong(s); return SYNQUENZER.g6pSongPcs(9, 0); });
    ok(fb === null, 'ohne Begleitung: null → g6Chord wie bisher');
    await p.evaluate(() => SYNQUENZER.undo());
  }
  if (want('73')) {
    const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n), s0 = await p.evaluate(() => JSON.stringify(SYNQUENZER.project().song));
    await p.evaluate(() => SYNQUENZER.g6Make({vox: 'V1'}, 'barber', 'up', '80'));
    const u1 = await p.evaluate(() => SYNQUENZER.undoInfo());
    ok(u1.n === u0 + 1, `G6P-73 Stil auf der Song-Stimme = 1 Undo-Schritt (${u0} → ${u1.n}, ${u1.top && u1.top.kind}/${u1.top && u1.top.items.join('+')})`);
    // mit Chor-Spuren (G6+a-Daten an der STIMME-Spur): Song + Spuren = ein Gruppen-Schritt; ↶ stellt beides her, ↷ wieder
    const g = await p.evaluate(() => {
      const st = stimmeT(), lanes0 = JSON.stringify(S.tracks[st].chor || null), n0 = UNDO.length;
      const ok1 = g6pSongEdit({vox: 'V1'}, 'Chor · Stil', v => { v.chor.voices[0].db = -3; S.tracks[st].chor = {lanes: [{id: 'c1', role: 'ch+1', name: 'Chor Tenor'}]}; });
      const top = UNDO[UNDO.length - 1], one = UNDO.length === n0 + 1 && top.kind === 'group' && top.items.map(x => x.kind).join('+') === 'song+chorlanes';
      const after = JSON.stringify(S.tracks[st].chor), db = S.song.vox[0].chor.voices[0].db;
      undo(); const backL = JSON.stringify(S.tracks[st].chor || null), backDb = S.song.vox[0].chor.voices[0].db;
      redo(); const reL = JSON.stringify(S.tracks[st].chor || null), reDb = S.song.vox[0].chor.voices[0].db;
      undo();
      return {ok1, one, lanes0, after, db, backL, backDb, reL, reDb};
    });
    ok(g.ok1 && g.one, 'G6P-73 Song-Stimme + Chor-Spuren = 1 Gruppen-Undo (song+chorlanes)');
    ok(g.backL === g.lanes0 && g.backDb === 0 && g.reL === g.after && g.reDb === -3, `↶/↷ stellen Song und Spuren her (${g.backDb}/${g.reDb})`);
    const fxEq = await p.evaluate(() => { const a = JSON.stringify(S.fxBus); undo(); undo(); redo(); redo(); return a === JSON.stringify(S.fxBus); });
    ok(fxEq, 'S.fxBus nach ↶↶↷↷ deep-equal');
    // Speichern → Laden deep-equal (Text → parse → switchProject → Text)
    const rt = await p.evaluate(() => { const t1 = serializeProject(), r = parseProjectFile(JSON.parse(t1)); if (!r) return {ok: false}; switchProject(r.project, {}); const t2 = serializeProject(); const a = JSON.parse(t1), b = JSON.parse(t2); return {ok: JSON.stringify(a.song) === JSON.stringify(b.song) && JSON.stringify(a.tracks) === JSON.stringify(b.tracks), chor: !!(b.song.vox[0] && b.song.vox[0].chor)}; });
    ok(rt.ok && rt.chor, 'G6P-73 Speichern → Laden: Song (inkl. Chor) und Spuren deep-equal');
    ok(s0 !== null, 'Song vorher gelesen');
  }
  ok(!errs.length, 'keine Fehler: ' + JSON.stringify(errs.slice(0, 3)));
  await b.close();
}

if (want('71')) {
  // verkürzt: 40 Takte bei 160 BPM (60 s) mit 3 Chor-Stellen ab Kaltstart (keine Chor-Puffer im Cache)
  const {b, p, errs} = await page(FILE);
  await setup(p, {bpm: 160, bars: 40, at: [8, 20, 32], marks: [{id: 'M1', a: 0, len: 8, part: 'P1'}, {id: 'M2', a: 8, len: 4, part: 'P2'}, {id: 'M3', a: 12, len: 8, part: 'P1'}, {id: 'M4', a: 20, len: 4, part: 'P2'}, {id: 'M5', a: 24, len: 8, part: 'P1'}, {id: 'M6', a: 32, len: 4, part: 'P2'}]});
  // Chor auf allen drei Stellen (Barbershop: 3 Stimmen × 2 Kopien), danach Cache leeren = Kaltstart
  for (const id of ['V1', 'V2', 'V3']) await p.evaluate(id => SYNQUENZER.g6Make({vox: id}, id === 'V2' ? 'drei' : 'barber', 'up', '80'), id);
  await p.evaluate(() => { G6.cache.clear(); G6.job.clear(); G6.renders = 0; window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  const res = await p.evaluate(async () => {
    const out = {}, song = S.song; SYNQUENZER.songPlay(0);
    const spb = 60 / S.bpm;
    return await new Promise(res => {
      const iv = setInterval(() => {
        const sp = R.songPlay; if (!sp) return;
        const now = AU.ctx.currentTime, b = t2b(now) - sp.off;
        for (const v of song.vox) { if (out[v.id]) continue; if (b >= v.bar * 4 - 0.25) out[v.id] = {ready: g6Ready(v) && g6Auto(v) != null, bar: v.bar, at: +b.toFixed(2)}; }
        if (Object.keys(out).length === 3) { clearInterval(iv); setTimeout(() => { SYNQUENZER.stop(); res({out, info: SYNQUENZER.g6phInfo()}); }, 2000); }
      }, 20);
    });
  });
  for (const k of ['V1', 'V2', 'V3']) ok(res.out[k] && res.out[k].ready, `G6P-71 Stelle ${k} (Takt ${res.out[k] && res.out[k].bar + 1}) fertig, bevor sie erklingt`);
  const lt = await p.evaluate(() => window.__lt);
  ok(!lt.some(x => x > 50), 'G6P-71 keine langen Tasks > 50 ms: ' + JSON.stringify(lt.slice(0, 8)));
  ok(res.info.n > 0 && res.info.last && res.info.last.ms < 20, `Vorausrechnen lief (${res.info.n} Durchgänge, letzter ${res.info.last && res.info.last.ms} ms)`);
  ok(!errs.length, 'keine Fehler: ' + JSON.stringify(errs.slice(0, 3)));
  await b.close();
}

if (want('72') && VFILE) {
  const {b, p, errs} = await page(VFILE);
  await setup(p, {bars: 16, at: [8]});
  await p.evaluate(() => SYNQUENZER.g6Make({vox: 'V1'}, 'barber', 'up', '80'));
  await p.evaluate(() => { G6.cache.clear(); G6.job.clear(); });          // Render ab „nichts gerechnet“: g6pWaitAll muss alles fertig machen
  const pcm = async () => p.evaluate(() => SYNQUENZER.vvPcm(0).b64);
  const rms = (b64, t0, t1, sr) => { const u = Buffer.from(b64, 'base64'), d = new Int16Array(u.buffer, u.byteOffset, u.length / 2); let s = 0, n = 0; for (let k = Math.round(t0 * sr) * 2; k < Math.min(d.length, Math.round(t1 * sr) * 2); k++) { s += d[k] * d[k]; n++; } return Math.sqrt(s / Math.max(1, n)) / 32768; };
  const r1 = await p.evaluate(() => SYNQUENZER.vvRender({range: {a: 6, b: 14}})), w1 = await p.evaluate(() => SYNQUENZER.g6phInfo().wait), A = await pcm();
  ok(w1 && w1.chor === 1 && w1.miss === 0, 'G6P-72 g6pWaitAll vor dem Render: ' + JSON.stringify(w1));
  const r2 = await p.evaluate(() => SYNQUENZER.vvRender({range: {a: 6, b: 14}})), B = await pcm();
  ok(A === B, 'G6P-72 zwei Renders bitgleich');
  // Solo vor dem Render (Stimme 1; der Lead schweigt live) → Render unverändert; danach Solo wieder an
  await p.evaluate(() => SYNQUENZER.g6Solo(0));
  await p.evaluate(() => SYNQUENZER.vvRender({range: {a: 6, b: 14}})); const C = await pcm(), so = await p.evaluate(() => SYNQUENZER.g6phInfo().solo);
  ok(A === C, 'G6P-72 ein vor dem Render aktives Solo ändert den Render nicht');
  ok(so === 0, 'Solo nach dem Render wieder wie vorher (' + so + ')');
  await p.evaluate(() => SYNQUENZER.g6Solo(0));
  // ohne Chor: Unterschied nur in der Chor-Stelle (Takt 9–12 = Render-Zeit 2 … 4 Takte ab Takt 7)
  await p.evaluate(() => SYNQUENZER.g6Del({vox: 'V1'}));
  await p.evaluate(() => SYNQUENZER.vvRender({range: {a: 6, b: 14}})); const D = await pcm();
  const sr = r1.sr, spB = 4 * 60 / 112, t9 = 2 * spB;   // Takt 9 beginnt 2 Takte nach Takt 7 (Tempo 120 → setBpm)
  const bpm = await p.evaluate(() => S.bpm), bar = 4 * 60 / bpm, dif = (x, y, a0, b0) => { const u = Buffer.from(x, 'base64'), v = Buffer.from(y, 'base64'), d1 = new Int16Array(u.buffer, u.byteOffset, u.length / 2), d2 = new Int16Array(v.buffer, v.byteOffset, v.length / 2); let s = 0, n = 0; for (let k = Math.round(a0 * sr) * 2; k < Math.min(d1.length, d2.length, Math.round(b0 * sr) * 2); k++) { const e = d1[k] - d2[k]; s += e * e; n++; } return Math.sqrt(s / Math.max(1, n)) / 32768; };
  const inChor = dif(A, D, 2 * bar + 0.1, 6 * bar - 0.1), before = dif(A, D, 0, 2 * bar - 0.05);
  ok(inChor > 0.003 && before < 1e-6, `G6P-72 Ton enthält die Chor-Stelle (Δ in der Stelle ${inChor.toFixed(4)}, davor ${before.toExponential(1)})`);
  ok(!errs.length, 'keine Fehler: ' + JSON.stringify(errs.slice(0, 3)));
  void rms; void t9; void r2;
  await b.close();
}
console.log(fails ? `FEHLER: ${fails}` : 'alles grün');
process.exit(fails ? 1 : 0);
