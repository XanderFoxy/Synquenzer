// VS4 Abnahme in der App (Mikro-Attrappe im selben AudioContext + Loopback App-Ausgang → Mikro = Lautsprecher):
// node v3-vs4-accept.mjs [B C D E F]
import {open, sleep, b64, resample} from './v3-vs3-h.mjs';
import {renderVoice} from './v3-vs2-corpus.mjs';
import {chromium} from 'playwright';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-br-VS4/index.html';
const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const only = process.argv.slice(2), want = k => !only.length || only.includes(k);
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const BPM = 120, SB = 60 / BPM, LEAD = 0.04, LOOPS = 0.02137;
// Melodie mit Pausen (je Takt 2 Schläge singen, 2 Schläge Ruhe) – in den Pausen hört das Mikro nur die Musik
const MELG = [[0, 1, 57], [1, 1, 60], [4, 1, 64], [5, 1, 62], [8, 1, 60], [9, 1, 64], [12, 1, 59], [13, 1, 57]];
const sing = notes => renderVoice(notes.map(([b, d, m], k) => ({on: LEAD + b * SB, dur: d * SB, midi: m, legato: false, rest: k ? 0.1 : 0})), {voice: 'male', seed: 3, sigma: 12, vib: [20, 40], bpm: BPM}).x;
async function playAt(p, x, beat, sr, start) { const y = resample(x, 16000, sr); return p.evaluate(([b, beat, st, lead]) => { if (st) SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); const t = c.start + beat * c.spb - lead; window.__fake.play(b, t); return t; }, [b64(y), beat, !!start, LEAD]); }
async function waitBeat(p, b) { await p.waitForFunction(b => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= b; }, b, {timeout: 60000, polling: 20}); }
async function idle(p) { await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0, null, {timeout: 30000}); await sleep(150); }
async function chordsAt(p, list) {
  await p.evaluate(() => { SYNQUENZER.setKbMode('transpose'); SYNQUENZER.setHarmony({change: 'bar', latch: true}); });
  for (let k = 0; k < list.length; k++) { await waitBeat(p, k * 4 - 0.6); await p.evaluate(n => SYNQUENZER.keyOn(n, 0.8, 'ch'), list[k]); await sleep(80); await p.evaluate(() => SYNQUENZER.keyOff(0, 'ch')); }
}
const deq = (a, b) => JSON.stringify(sortK(a)) === JSON.stringify(sortK(b));
function sortK(o) { if (Array.isArray(o)) return o.map(sortK); if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o).sort()) r[k] = sortK(o[k]); return r; } return o; }
const db = v => 10 * Math.log10(v + 1e-30);
// Stimme y (Kontext-Rate) im Take x finden (Hüllkurven-Korrelation), Pausen-Maske und Messwerte Roh/Sauber
function measure(raw, cl, y, sr) {
  const D = 32, env = (a, n) => { const o = new Float32Array(Math.ceil(n / D)); for (let i = 0; i < n; i++) o[(i / D) | 0] += Math.abs(a[i]); return o; };
  const er = env(raw, raw.length), ey = env(y, y.length);
  let best = -1e30, bl = 0; const mr = er.reduce((s, v) => s + v, 0) / er.length;
  for (let l = -ey.length; l < er.length; l++) { let s = 0; for (let j = 0; j < ey.length; j += 2) { const k = j + l; if (k >= 0 && k < er.length) s += ey[j] * (er[k] - mr); } if (s > best) { best = s; bl = l; } }
  // Feinlage per Kreuzkorrelation ±D Samples
  let fb = -1e30, off = bl * D;
  for (let d = -2 * D; d <= 2 * D; d++) { const o = bl * D + d; let s = 0; for (let j = 0; j < y.length; j += 3) { const k = j + o; if (k >= 0 && k < cl.length) s += y[j] * cl[k]; } if (s > fb) { fb = s; off = o; } }
  const n = raw.length, yy = new Float32Array(n); for (let j = 0; j < y.length; j++) { const k = j + off; if (k >= 0 && k < n) yy[k] = y[j]; }
  // Maske: Stimme still (±40 ms unter −60 dB ihres Spitzenwerts) bzw. laut
  let pk = 0; for (const v of y) pk = Math.max(pk, Math.abs(v));
  const W = Math.round(0.04 * sr), pause = new Uint8Array(n), voiced = new Uint8Array(n); let run = 0;
  for (let i = 0; i < n; i++) { if (Math.abs(yy[i]) > pk * 1e-3) run = W; else if (run > 0) run--; pause[i] = run === 0 ? 1 : 0; voiced[i] = Math.abs(yy[i]) > pk * 0.05 ? 1 : 0; }
  for (let i = n - 1, r2 = 0; i >= 0; i--) { if (Math.abs(yy[i]) > pk * 1e-3) r2 = W; else if (r2 > 0) r2--; if (r2) pause[i] = 0; }
  const pw = (z, m) => { let s = 0, c = 0; for (let i = 0; i < n; i++) if (m[i]) { s += z[i] * z[i]; c++; } return s / Math.max(1, c); };
  let vv = 0, vr = 0, vc = 0; for (let i = 0; i < n; i++) if (voiced[i]) { vv += yy[i] * yy[i]; vr += yy[i] * raw[i]; vc += yy[i] * cl[i]; }
  return {offMs: +(off / sr * 1000).toFixed(1), pauseMs: Math.round(pause.reduce((s, v) => s + v, 0) / sr * 1000), echoToVoiceDb: +db(pw(raw, pause) / pw(yy, voiced)).toFixed(1),
    erleDb: +db(pw(raw, pause) / pw(cl, pause)).toFixed(1), voiceRawDb: +(20 * Math.log10(vr / vv)).toFixed(2), voiceCleanDb: +(20 * Math.log10(vc / vv)).toFixed(2)};
}
async function speakerSetup(o) {
  const H = await open(Object.assign({file: APP}, o || {})), p = H.p;
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  await p.evaluate(() => SYNQUENZER.stimmeStart({route: 'speaker', cal: false}));
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 20000}); await sleep(500);
  await p.evaluate(s => window.__loop(s), LOOPS);
  await p.evaluate(() => SYNQUENZER.stimmeCal('voll')); await sleep(300);
  H.sr = await p.evaluate(() => SYNQUENZER.vsClock().sr);
  H.lat = await p.evaluate(() => SYNQUENZER.stimme().latMs);
  await p.evaluate(bpm => { SYNQUENZER.setBpm(bpm); SYNQUENZER.setMetronome(false); }, BPM);
  return H;
}
const ROOT = {Am: 57, F: 53, C: 48, G: 55};
async function takePair(p, id) { return p.evaluate(async id => { const r = await SYNQUENZER.tkPcmRange(id); return {raw: r.map(v => v / 32767), cl: SYNQUENZER.clPlayRange(id)}; }, id); }

// B — Stimme-FANG über Lautsprecher (Loopback, Musik der App im Mikro): Noten-Weg „1E“ (N7V-25) in der App-Kette, Noten-Treffer,
//     der Take wird automatisch mit SÄUBERN 60 % gesäubert; Netz-Ruhe während des Säuberns (N7V-35, N2-VS1-02)
if (want('B')) {
  const H = await speakerSetup(), p = H.p;
  console.log('  Einmessen über Loopback: Latenz', H.lat, 'ms, sr', H.sr);
  const x = sing(MELG);
  await playAt(p, x, 0, H.sr, true);
  await chordsAt(p, ['Am', 'F', 'C', 'G', 'Am'].map(c => ROOT[c]));
  await p.evaluate(() => SYNQUENZER.setKbMode('play'));
  await waitBeat(p, 16.5);
  ok(await p.evaluate(() => SYNQUENZER.vsFang({beat: 16.5})), 'Stimme-FANG angenommen');
  await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy, null, {timeout: 30000});
  const r = await p.evaluate(() => SYNQUENZER.vsResult()), cn = await p.evaluate(() => SYNQUENZER.clNotesInfo());
  ok(cn && cn.way === '1E', 'N7V-25: Noten-Weg beim Lautsprecher = nur Echo-Abzug: ' + JSON.stringify(cn));
  let hit = 0; for (const [b, , m] of MELG) if (r && r.notes.some(n => n.n === m && Math.abs((n.o != null ? n.o : n.t) - b) <= 0.1)) hit++;
  const P = r ? hit / Math.max(1, r.notes.length) : 0, R = hit / MELG.length, F = P + R ? 2 * P * R / (P + R) : 0;
  ok(F >= 0.85, `Noten über Lautsprecher (Musik im Mikro): ${hit}/${MELG.length} richtig, erkannt ${r && r.notes.length}, Noten-F ${F.toFixed(3)} (≥ 0,85)`);
  await p.evaluate(() => SYNQUENZER.vsResultOk());
  // der Take: Lautsprecher → Referenz mitgeschrieben, SÄUBERN 60 %, Säubern startet nach dem Speichern
  let sawQuiet = false;
  for (let k = 0; k < 200; k++) { const q = await p.evaluate(() => ({q: SYNQUENZER.tkInfo().quiet, s: SYNQUENZER.tkInfo().stQuiet})); if (q.q.includes('clean') && q.s > 0) { sawQuiet = true; break; } await sleep(25); }
  await idle(p);
  const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme), clip = await p.evaluate(([t, s]) => SYNQUENZER.getClip(t, s), [st, r.scene]), id = clip.audio.take;
  const meta = await p.evaluate(id => SYNQUENZER.takes()[id], id);
  ok(meta.route === 'speaker' && meta.cl === 60 && meta.rf === Math.round(0.02 * meta.sr), 'Take: Weg Lautsprecher, SÄUBERN 60 %, Referenz-Vorlauf ' + meta.rf + ' Samples: ' + JSON.stringify(meta));
  await p.evaluate(id => SYNQUENZER.clWait(id), id);
  ok(sawQuiet, 'N2-VS1-02: beim Säubern Netz-Ruhe (tkInfo.quiet enthält „clean“, stQuiet > 0)');
  const ci = await p.evaluate(id => SYNQUENZER.clInfo(id), id);
  ok(ci.buf && ci.info && ci.info.ref && ci.worker === 'worker', 'gesäuberte Fassung im Worker gerechnet: ' + JSON.stringify(ci.info) + ' · ' + JSON.stringify(ci.last));
  await sleep(2300);
  const q = await p.evaluate(() => SYNQUENZER.tkInfo());
  ok(!q.quiet.length && q.stQuiet === 0 && q.netLast && q.netLast.total === 0, 'N7V-35: nach dem Säubern Netz-Ruhe beendet, Zähler fetch/XHR/Beacon/WS = 0: ' + JSON.stringify(q.netLast));
  const tp = await takePair(p, id), y = resample(x, 16000, H.sr);
  const m60 = measure(tp.raw, tp.cl, y, H.sr);
  console.log('  60 %:', JSON.stringify(m60));
  ok(m60.erleDb >= 12, `Take SÄUBERN 60 %: Musik in den Pausen −${m60.erleDb} dB (Musik im Mikro ${m60.echoToVoiceDb} dB rel. Stimme)`);
  ok(Math.abs(m60.voiceCleanDb - m60.voiceRawDb) < 1, `Stimme bleibt im Pegel: roh ${m60.voiceRawDb} dB, sauber ${m60.voiceCleanDb} dB`);
  await p.evaluate(id => SYNQUENZER.clSet(id, 100), id); await p.evaluate(id => SYNQUENZER.clWait(id), id);
  const tp2 = await takePair(p, id), m100 = measure(tp2.raw, tp2.cl, y, H.sr);
  console.log('  100 %:', JSON.stringify(m100));
  ok(m100.erleDb >= 15 && m100.erleDb > m60.erleDb, `N7V-21 in der App (Take, SÄUBERN 100 %): Musik in den Pausen −${m100.erleDb} dB (≥ 15; 60 %: −${m60.erleDb})`);
  ok(Math.abs(m100.voiceCleanDb - m100.voiceRawDb) < 1, `Stimme bleibt im Pegel (100 %): roh ${m100.voiceRawDb} dB, sauber ${m100.voiceCleanDb} dB`);
  // ---- Takes-Blatt (echte Tipps): SÄUBERN-Regler, A/B Roh │ Sauber, ein Undo je Änderung; hörbar am Ausgang ----
  const hClean = await p.evaluate(id => SYNQUENZER.clPlayHash(id), id);
  await p.evaluate(() => SYNQUENZER.stop());
  await p.evaluate(() => window.__unloop());
  await p.evaluate(([st, s]) => { for (let t = 0; t < 8; t++) if (t !== st) { try { SYNQUENZER.setMute(t, true); } catch (e) {} } SYNQUENZER.selectSlot(st, s); }, [st, r.scene]);
  ok(await p.evaluate(([st, s]) => SYNQUENZER.tkSheet({t: st, s}), [st, r.scene]), 'Takes-Blatt geöffnet');
  const box = await p.evaluate(() => { const b = document.querySelector('.pop.tksheet .clbox'); if (!b) return null; const r = b.querySelector('.clr'); return {v: r.value, dis: r.disabled, lab: b.querySelector('.clv').textContent, st: b.querySelector('.clst').textContent, warn: (b.querySelector('.clwarn') || {}).textContent || ''}; });
  ok(box && box.v === '100' && !box.dis && box.lab === '100 %', 'Blatt zeigt SÄUBERN: ' + JSON.stringify(box));
  // hörbar: STIMME allein spielen, Pegel in den Gesangspausen (unteres Quantil) Sauber gegen Roh
  await p.evaluate(s => { window.__tap(); SYNQUENZER.launchScene(s); }, r.scene); await sleep(600);
  const lv = async () => { const a = []; for (let k = 0; k < 130; k++) { a.push(await p.evaluate(() => window.__lvl().rmsDb)); await sleep(60); } a.sort((x, y) => x - y); return {q10: +a[Math.floor(a.length * 0.1)].toFixed(1), q90: +a[Math.floor(a.length * 0.9)].toFixed(1)}; };
  const lClean = await lv();
  await p.click('.pop.tksheet .clbox button[data-cl="roh"]'); await sleep(300);
  const ab = await p.evaluate(id => ({ab: SYNQUENZER.clInfo(id).ab, src: SYNQUENZER.tkInfo().src.map(x => x.take), pressed: document.querySelector('.pop.tksheet button[data-cl="roh"]').getAttribute('aria-pressed')}), id);
  const lRaw = await lv();
  ok(ab.ab === 'roh' && ab.pressed === 'true', 'A/B „Roh“ per Tipp: ' + JSON.stringify(ab));
  ok(lRaw.q10 - lClean.q10 >= 15 && lClean.q90 > lRaw.q90 - 6, `hörbar: Ausgang in den Gesangspausen Roh ${lRaw.q10} dB / Sauber ${lClean.q10} dB (Δ ${(lRaw.q10 - lClean.q10).toFixed(1)} dB ≥ 15), laute Stellen ${lRaw.q90} / ${lClean.q90} dB`);
  await p.click('.pop.tksheet .clbox button[data-cl="sauber"]'); await sleep(200);
  // Regler auf 0 % (Finger: fill = input + change) → ein Undo „Säubern 0 %“, der Take spielt den Roh-Take bitgleich (N7V-24)
  const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
  await p.locator('.pop.tksheet .clr').fill('0'); await sleep(300);
  const z = await p.evaluate(id => ({cl: SYNQUENZER.takes()[id].cl, u: SYNQUENZER.undoInfo(), play: SYNQUENZER.clPlayHash(id), lab: document.querySelector('.pop.tksheet .clv').textContent, st: document.querySelector('.pop.tksheet .clst').textContent}), id);
  const rawHash = await p.evaluate(id => { const a = SYNQUENZER.tkBufRange(id); const f = Float32Array.from(a), u = new Uint8Array(f.buffer); let h = 0x811c9dc5; for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16) + ':' + f.length; }, id);
  ok(z.cl === undefined && z.u.n === u0 + 1 && z.u.top.label === 'Säubern 0 %', 'Regler 0 %: Feld weg, ein Undo „' + z.u.top.label + '“ · ' + z.st);
  ok(z.play === rawHash, 'N7V-24 im Take-Weg: bei 0 % spielt der Roh-Puffer bitgleich (' + z.play + ')');
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(300);
  const z2 = await p.evaluate(id => ({cl: SYNQUENZER.takes()[id].cl, play: SYNQUENZER.clPlayHash(id), v: document.querySelector('.pop.tksheet .clr') && document.querySelector('.pop.tksheet .clr').value}), id);
  ok(z2.cl === 100 && z2.play === hClean && z2.v === '100', 'Undo → 100 %, wieder die gesäuberte Fassung (bitgleich wie vorher), Blatt folgt: ' + JSON.stringify(z2));
  await p.evaluate(() => SYNQUENZER.redo()); await sleep(200);
  ok(await p.evaluate(id => SYNQUENZER.takes()[id].cl === undefined, id), 'Redo → wieder 0 %'); await p.evaluate(() => SYNQUENZER.undo()); await sleep(200);
  // Blatt zu (✕) → A/B wieder „Sauber“
  await p.click('.pop.tksheet .clbox button[data-cl="roh"]'); await sleep(100);
  await p.evaluate(() => SYNQUENZER.closePop ? SYNQUENZER.closePop() : document.querySelector('.pop.tksheet button[data-a="x"]') && document.querySelector('.pop.tksheet button[data-a="x"]').click());
  await p.mouse.click(5, 300); await sleep(200);
  ok(await p.evaluate(id => SYNQUENZER.clInfo(id).ab === 'sauber' && !document.querySelector('.pop.tksheet'), id), 'Blatt geschlossen → A/B wieder „Sauber“');
  await p.evaluate(() => SYNQUENZER.stop());
  // ---- D: Neuladen – SÄUBERN und Referenz bleiben, die gesäuberte Fassung kommt aus dem Speicher (kein neues Rechnen) ----
  const P0 = await p.evaluate(() => SYNQUENZER.takes());
  await p.evaluate(() => SYNQUENZER.saveNow ? SYNQUENZER.saveNow() : SYNQUENZER.save && SYNQUENZER.save()); await sleep(1500);
  await p.close();
  const H2 = await open({file: APP, br: H.br, ctx: H.ctx}), p2 = H2.p; await sleep(1200);
  await p2.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  const P1 = await p2.evaluate(() => SYNQUENZER.takes());
  ok(deq(P1, P0) && P1[id].cl === 100 && P1[id].rf === 882, 'Neuladen: Takes deep-equal (cl, rf erhalten)');
  await p2.evaluate(() => SYNQUENZER.tkLoadAll()); await p2.evaluate(id => SYNQUENZER.clEnsure(id), id); await p2.evaluate(id => SYNQUENZER.clWait(id), id);
  const c2 = await p2.evaluate(id => ({h: SYNQUENZER.clPlayHash(id), i: SYNQUENZER.clInfo(id)}), id);
  ok(c2.h === hClean && c2.i.runs === 0, 'gesäuberte Fassung aus dem Audio-Store, bitgleich, ohne neues Rechnen (runs ' + c2.i.runs + '), Info: ' + JSON.stringify(c2.i.info));
  const keys = await p2.evaluate(() => SYNQUENZER.tkKeys());
  ok(keys.includes(id + ':r0') && keys.includes(id + ':c100:0') && !keys.some(k => k.startsWith(id + ':c60:')), 'Audio-Store: Roh, Referenz, gesäubert 100 % (60 % aufgeräumt): ' + keys.filter(k => k.startsWith(id)).join(' '));
  // ---- E: ZIP enthält die Referenz; Import auf frischer eigener Seite → gleich gesäubert (Kern deterministisch) ----
  const zi = await p2.evaluate(() => SYNQUENZER.tkZipInfo());
  ok(zi.files.some(f => f.name === 'takes/' + id + '.wav') && zi.files.some(f => f.name === 'takes/' + id + '.ref.wav'), 'ZIP: ' + zi.files.map(f => f.name).join(', '));
  const zip = await p2.evaluate(() => SYNQUENZER.tkZipBytes());
  const ctx3 = await H.br.newContext({viewport: {width: 390, height: 844}}), H3 = await open({file: APP, br: H.br, ctx: ctx3}), p3 = H3.p;
  await p3.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  await p3.evaluate(a => SYNQUENZER.tkImportZip(a), zip); await sleep(1500);
  await p3.evaluate(() => SYNQUENZER.tkLoadAll()); await p3.evaluate(id => SYNQUENZER.clEnsure(id), id); await p3.evaluate(id => SYNQUENZER.clWait(id), id);
  const c3 = await p3.evaluate(id => ({h: SYNQUENZER.clPlayHash(id), i: SYNQUENZER.clInfo(id)}), id);
  ok(c3.h === hClean && c3.i.runs === 1, 'nach ZIP-Import neu gesäubert und bitgleich zur Quelle (' + c3.h + ')');
  ok(!H.errs.length && !H2.errs.length && !H3.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.concat(H2.errs, H3.errs).slice(0, 3)));
  await H.br.close();
}
console.log(fail ? `FEHLER: ${fail}` : 'ALLE OK');
process.exit(fail ? 1 : 0);
