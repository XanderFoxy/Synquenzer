// G4 Abnahme: G4-01 Dynamik/Pumpen, G4-02 Zischlaute, G4-05 A/B·Undo·Speichern/Laden·altes Projekt, G4-06 Silben-Dynamik (App-Weg: tkInject → Kette → klingender Puffer)
// node g4-accept.mjs [01|02|05|06|all] [app]
import {open, sleep, APP} from './h.mjs';
import {kq, lufs} from './lib.mjs';
import {dynTake, steady, sibTake, sylTake, band59, db, rms, maxWin, pct} from './sig.mjs';
const which = process.argv[2] || 'all', FILE = process.argv[3] || APP;
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const i16 = x => Array.from(x, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
const L_ = z => -0.691 + 10 * Math.log10(z + 1e-30);
function lra(x, sr) { const q = kq(x, sr), st = []; for (let k = 0; k + 30 <= q.length; k++) { let s = 0; for (let j = 0; j < 30; j++) s += q[k + j]; st.push(s / 30); }
  let g = st.filter(z => L_(z) > -70); const rel = L_(g.reduce((a, b) => a + b, 0) / g.length) - 20; g = g.filter(z => L_(z) > rel).map(L_); return pct(g, 0.95) - pct(g, 0.1); }
async function setup(p, bpm = 120) { await p.evaluate(b => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(b); }, bpm); await sleep(300); return p.evaluate(() => window.__ctx.sampleRate); }
async function inject(p, x, sr, scene = 0, len = 8) { const r = await p.evaluate(([pc, sr, s, l]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: s, len: l}), [i16(x), sr, scene, len]); await settle(p, r.id); return r; }
async function settle(p, id) { for (let k = 0; k < 4; k++) { await p.evaluate(id => SYNQUENZER.g4Played(id), id); await sleep(150); await p.evaluate(() => SYNQUENZER.g4Wait(30000)); } }
async function buf(p, id, raw) { const s = await p.evaluate(([id, raw]) => { const b = raw ? tkBuffer(id) : (tkPlayBuf(id) || tkBuffer(id)), d = b.getChannelData(0), u = new Uint8Array(d.buffer, d.byteOffset, d.byteLength); let o = ''; for (let i = 0; i < u.length; i += 0x8000) o += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(o); }, [id, !!raw]);
  const B = Buffer.from(s, 'base64'); return new Float32Array(B.buffer, B.byteOffset, B.byteLength >> 2).slice(); }

const H = await open({file: FILE}), p = H.p;
const sr = await setup(p);
console.log('App', await p.evaluate(() => SYNQUENZER.version), 'sr', sr);

if (which === '01' || which === 'all') {
  console.log('— G4-01 Dynamik nach „Gesang Synthpop“ (Kurzzeit-Lautheit 3 s, Spanne 10–95 % = LRA) und Pumpen');
  const x = dynTake(sr), r = await inject(p, x, sr, 0, 16);
  const info = await p.evaluate(id => ({g: SYNQUENZER.g4Info(), pl: SYNQUENZER.g4Played(id)}), r.id);
  ok(info.g.gfx && info.g.gfx.on && info.pl.g4, `neue STIMME-Spur hat „Gesang Synthpop“ an, es klingt die G4-Fassung (${info.g.how}, ${info.g.last && info.g.last.ms} ms für ${(x.length / sr).toFixed(1)} s)`);
  const y = await buf(p, r.id), raw = await buf(p, r.id, true);
  const a = lra(raw, sr), b = lra(y, sr), la = lufs([raw], sr).lufs, lb = lufs([y], sr).lufs;
  ok(a - b >= 4, `LRA roh ${a.toFixed(2)} LU → G4 ${b.toFixed(2)} LU: ${(a - b).toFixed(2)} LU kleiner (Soll ≥ 4) · Lautheit ${la} → ${lb} LUFS`);
  // Pumpen: gehaltener Vokal mit festem Pegel (−22 / −32 dBFS): Schwankung der 50-ms-Pegel nach dem Einschwingen
  for (const lv of [-22, -32]) {
    const z = steady(sr, lv), rz = await inject(p, z, sr, 1, 4), yz = await buf(p, rz.id), W = Math.round(0.05 * sr), v = [];
    for (let k = Math.round(0.6 * sr); k + W < yz.length - 0.3 * sr; k += W) v.push(db(rms(yz, k, k + W)));
    const sp = Math.max(...v) - Math.min(...v);
    ok(sp <= 0.5, `kein Pumpen: gehaltener Vokal ${lv} dBFS → 50-ms-Pegel schwanken ${sp.toFixed(3)} dB (Soll ≤ 0,5)`);
  }
}
if (which === '02' || which === 'all') {
  console.log('— G4-02 Zischlaute: Spitzen im Band 5–9 kHz (10-ms-RMS), Kette „Gesang Synthpop“ gegen dieselbe Kette mit Entzischer 0');
  const {y: x, at} = sibTake(sr), r = await inject(p, x, sr, 2, 8);
  const y1 = await buf(p, r.id);
  await p.evaluate(() => SYNQUENZER.g4Set({ds: 0})); await settle(p, r.id);
  const y0 = await buf(p, r.id);
  await p.evaluate(() => SYNQUENZER.undo()); await settle(p, r.id);
  const b1 = band59(y1, sr), b0 = band59(y0, sr), bx = band59(x, sr), W = Math.round(0.01 * sr), d = [], dr = [];
  for (const [i0, i1] of at) { d.push(db(maxWin(b1, i0, i1, W)) - db(maxWin(b0, i0, i1, W))); dr.push(db(maxWin(b1, i0, i1, W)) - db(maxWin(bx, i0, i1, W))); }
  const md = d.reduce((s, v) => s + v, 0) / d.length;
  ok(Math.abs(md + 4) <= 1, `Zischlaut-Spitzen 5–9 kHz: ${md.toFixed(2)} dB (je Laut ${d.map(v => v.toFixed(1)).join(' ')}) (Soll −4 ± 1); gegen roh ${(dr.reduce((s, v) => s + v, 0) / dr.length).toFixed(2)} dB (mit Präsenz/Ausgleich)`);
  // Vokale bleiben: 5–9 kHz der gesungenen Teile ohne Zischlaut
  const vo = []; const isS = i => at.some(([a, b]) => i > a - 0.05 * sr && i < b + 0.1 * sr);
  for (let k = Math.round(0.5 * sr); k + 2 * W < x.length; k += 2 * W) if (!isS(k) && rms(x, k, k + 2 * W) > 1e-4) vo.push(db(rms(b1, k, k + 2 * W)) - db(rms(b0, k, k + 2 * W)));
  ok(Math.abs(pct(vo, 0.5)) <= 0.5, `Vokale (keine Zischlaute): 5–9 kHz Median ${pct(vo, 0.5).toFixed(2)} dB, 10 % ${pct(vo, 0.1).toFixed(2)} dB (Soll Median ±0,5)`);
}
if (which === '06' || which === 'all') {
  console.log('— G4-06 Silben-Dynamik (VS5a-Marken): Spanne der Silben-Lautheit, Anschläge');
  const {y: x, seg} = sylTake(sr), r = await inject(p, x, sr, 3, 4);
  const meas = y => seg.map(([a, b]) => db(rms(y, a, b))), crest = y => seg.map(([a, b]) => { let pk = 0; for (let i = a; i < a + 0.01 * sr; i++) pk = Math.max(pk, Math.abs(y[i])); return 20 * Math.log10(pk + 1e-12) - db(rms(y, a + 0.03 * sr, b - 0.03 * sr)); });
  const L0 = meas(x), C0 = crest(x), sp0 = pct(L0, 0.9) - pct(L0, 0.1);
  for (const [name, P] of [['nur Silben-Dynamik (Kompressor/EQ/Entzischer aus)', {ds: 0, ra: 1, lo: 0, mid: 0, pre: 0}], ['„Gesang Synthpop“ (ganze Kette)', null]]) {
    if (P) { await p.evaluate(P => SYNQUENZER.g4Set(P), P); await settle(p, r.id); }
    const y = await buf(p, r.id), L1 = meas(y), C1 = crest(y), sp1 = pct(L1, 0.9) - pct(L1, 0.1), dc = C1.map((v, k) => v - C0[k]);
    const g = await p.evaluate(() => SYNQUENZER.g4Info().last);
    ok((sp0 - sp1) / sp0 >= 0.5, `${name}: Silben-Spanne (10–90 %) ${sp0.toFixed(2)} → ${sp1.toFixed(2)} dB = ${Math.round((sp0 - sp1) / sp0 * 100)} % kleiner (Soll ≥ 50 %; ${g.sy ? g.sy.n + ' Silben aus Marken' : 'keine Marken'})`);
    if (P) ok(Math.abs(pct(dc, 0.5)) <= 1 && pct(dc.map(Math.abs), 0.9) <= 2, `${name}: Anschläge erhalten – Spitze der ersten 10 ms gegen den Silben-Pegel ändert sich Median ${pct(dc, 0.5).toFixed(2)} dB, 90 % |Δ| ≤ ${pct(dc.map(Math.abs), 0.9).toFixed(2)} dB (Soll ±1 / ≤ 2)`);
    else ok(pct(dc, 0.5) >= -1 && pct(dc, 0.1) >= -2, `${name}: Anschläge nicht gedämpft – Spitze der ersten 10 ms gegen den Silben-Pegel Median ${pct(dc, 0.5) >= 0 ? '+' : ''}${pct(dc, 0.5).toFixed(2)} dB, 10 % ${pct(dc, 0.1).toFixed(2)} dB (Kompressor-Anstieg 15 ms + Präsenz: „knackig“; Soll Median ≥ −1, 10 % ≥ −2)`);
    if (P) { await p.evaluate(() => SYNQUENZER.undo()); await settle(p, r.id); }
  }
}
if (which === '05' || which === 'all') {
  console.log('— G4-05 A/B, Undo, Speichern/Laden, altes Projekt');
  const x = dynTake(sr).subarray(0, sr * 8), r = await inject(p, x, sr, 4, 4);
  let q = await p.evaluate(id => SYNQUENZER.g4Played(id), r.id); ok(q.g4, 'mit Effekten: G4-Fassung klingt');
  await p.evaluate(() => SYNQUENZER.g4AB(true)); q = await p.evaluate(id => ({pl: SYNQUENZER.g4Played(id), rev: AU.tracks[stimmeT()].revSend.gain.value}), r.id);
  ok(q.pl.raw, 'A/B „ohne“: sofort der Take ohne Effekte (bitgleich der Roh-Puffer)');
  await p.evaluate(() => SYNQUENZER.g4AB(false)); q = await p.evaluate(id => SYNQUENZER.g4Played(id), r.id); ok(q.g4, 'A/B zurück: G4-Fassung sofort (kein Neurechnen)');
  const g0 = await p.evaluate(() => JSON.stringify(SYNQUENZER.g4Info().gfx));
  await p.evaluate(() => SYNQUENZER.g4Set({pre: 6, rev: 0.4}, 'Effekte: Präsenz'));
  const g1 = await p.evaluate(() => JSON.stringify(SYNQUENZER.g4Info().gfx)), rv = await p.evaluate(async () => { await sleep(100); return AU.tracks[stimmeT()].revSend.gain.value; });
  ok(g1 !== g0 && Math.abs(rv - 0.4) < 0.02, `Regler ändert gfx, Hall-Send folgt (${rv.toFixed(3)})`);
  await p.evaluate(() => SYNQUENZER.undo()); ok(await p.evaluate(() => JSON.stringify(SYNQUENZER.g4Info().gfx)) === g0, 'ein Undo stellt die Effekte wieder her (deep-equal)');
  await p.evaluate(() => SYNQUENZER.redo()); ok(await p.evaluate(() => JSON.stringify(SYNQUENZER.g4Info().gfx)) === g1, 'Redo deep-equal');
  const rt = await p.evaluate(async () => { const a = SYNQUENZER.project(); const j = JSON.stringify(a); importJSON(j); await sleep(300); const b = SYNQUENZER.project(); const st = stimmeT(); return {eq: JSON.stringify(a.tracks) === JSON.stringify(b.tracks), gfx: b.tracks[st].gfx}; });
  ok(rt.eq && rt.gfx && rt.gfx.pre === 6, `Speichern → Laden: Spuren deep-equal, gfx erhalten (${JSON.stringify(rt.gfx)})`);
  // altes Projekt (STIMME-Spur ohne gfx) bleibt ohne Effekte und klingt bitgleich wie vorher
  const old = await p.evaluate(async () => { const a = SYNQUENZER.project(), st = stimmeT(); delete a.tracks[st].gfx; const j = JSON.stringify(a); importJSON(j); await sleep(400); const b = SYNQUENZER.project(); return {same: JSON.stringify(b) === JSON.stringify(SYNQUENZER.project()), gfx: b.tracks[stimmeT()].gfx || null, st: stimmeT()}; });
  const ids = await p.evaluate(() => [...tkActiveIds()]); await p.evaluate(() => SYNQUENZER.tkLoadAll());
  const raw = await p.evaluate(ids => ids.map(id => SYNQUENZER.g4Played(id)), ids);
  ok(old.gfx === null && raw.every(v => v.raw), `altes Projekt ohne gfx: keine Effekte, alle Takes klingen roh (bitgleich) – ${raw.length} Takes`);
  const ex = await p.evaluate(() => { const a = SYNQUENZER.project(); return JSON.stringify(a).includes('"gfx"'); });
  ok(!ex, 'Projekt ohne Effekte enthält kein Feld gfx (Format 5, nur additiv)');
}
if (H.errs.length) ok(false, 'Konsolenfehler ' + H.errs.slice(0, 3));
await H.br.close();
console.log(fail ? `FEHLER: ${fail}` : 'ALLE OK');
process.exit(fail ? 1 : 0);
