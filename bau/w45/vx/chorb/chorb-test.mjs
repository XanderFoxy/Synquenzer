// CHORB-Test: Chor als Einzelstücke. Projekt mit 2 Refrains (Szene „Refrain“ zweimal im Song) + Chor mit 3 Stimmen (Stil „Pop modern“).
// Prüft: richtige Stückzahl und Namen, Start jedes Stücks auf dem Taktstrich (±1 Probe gegen eigene Rechnung), Takt im Namen = Takt der
// ersten Probe über −60 dBFS, Ende auf einem Taktstrich mit stillem Ausklang, Summe der Stücke an ihren Takten = Durchlauf „nur diese
// Stimme“ bis auf die Blenden, ZIP gültig (CRC, Python zipfile), WAV 24 Bit, Begleittext, „alle zusammen“, Bedienweg (Export-Blatt,
// Chor-Blatt, Hilfe), Live-Zustand danach unverändert, keine Fehler. Fotos nach <out>.
// Aufruf: node chorb-test.mjs <index.html> <ausgabe-ordner>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
const FILE = path.resolve(process.argv[2]), OUT = path.resolve(process.argv[3] || '.'); fs.mkdirSync(OUT, {recursive: true});
const R = []; const ok = (name, cond, info) => { R.push({name, ok: !!cond, info}); console.log((cond ? 'OK     ' : 'FEHLER ') + name + (info !== undefined ? ' · ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
const T0 = Date.now();
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return u => { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = t[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }; })();
function unzip(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength), out = []; let o = 0;
  while (o + 30 <= buf.length && dv.getUint32(o, true) === 0x04034b50) {
    const crc = dv.getUint32(o + 14, true), sz = dv.getUint32(o + 18, true), nl = dv.getUint16(o + 26, true), xl = dv.getUint16(o + 28, true);
    const name = Buffer.from(buf.subarray(o + 30, o + 30 + nl)).toString('utf8'), d0 = o + 30 + nl + xl; out.push({name, crc, data: buf.subarray(d0, d0 + sz)}); o = d0 + sz;
  }
  return out;
}
function wav24(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength), s4 = o => String.fromCharCode(u8[o], u8[o + 1], u8[o + 2], u8[o + 3]);
  if (s4(0) !== 'RIFF' || s4(8) !== 'WAVE' || s4(12) !== 'fmt ' || s4(36) !== 'data') return null;
  const ch = dv.getUint16(22, true), sr = dv.getUint32(24, true), bits = dv.getUint16(34, true), bytes = dv.getUint32(40, true), n = bytes / (ch * 3);
  const L = new Float32Array(n), Rr = new Float32Array(n), rd = o => { let v = u8[o] | (u8[o + 1] << 8) | (u8[o + 2] << 16); if (v & 0x800000) v -= 0x1000000; return v / 8388607; };
  for (let i = 0; i < n; i++) { L[i] = rd(44 + i * 6); Rr[i] = rd(44 + i * 6 + 3); }
  return {ch, sr, bits, n, L, R: Rr, riff: dv.getUint32(4, true) === u8.length - 8, align: dv.getUint16(32, true) === 6};
}
const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + FILE); await p.waitForTimeout(1500);
await p.mouse.click(200, 300).catch(() => {});
/* ---------- Aufbau: Song Strophe | Refrain | Strophe | Refrain (je 4 Takte), Gesang nur im Refrain (1,5 Takte ab der Eins), Chor „Pop modern“ ---------- */
const setup = await p.evaluate(async () => {
  const D = window.SYNQUENZER, sr = 48000, bpm = S.bpm, bar = 4 * 60 / bpm;
  const n = Math.round(sr * 4 * bar), pcm = new Array(n).fill(0), notes = [220, 247, 262, 247], on = Math.round(1.5 * bar * sr), seg = Math.floor(on / notes.length);
  for (let i = 0; i < on; i++) { const f = notes[Math.min(notes.length - 1, Math.floor(i / seg))], t = i / sr, env = Math.min(1, i / 240, (on - i) / 2400);
    pcm[i] = Math.round(9000 * env * (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(4 * Math.PI * f * t) + 0.2 * Math.sin(6 * Math.PI * f * t)) / 1.6); }
  const t1 = await D.tkInject({pcm, sr, scene: 1, len: 4});
  S.scenes[0].name = 'Strophe'; S.scenes[1].name = 'Refrain';
  const bars = D.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}, {scene: 0, bars: 4}, {scene: 1, bars: 4}]);
  const st = t1.track; let sty = null, err = null;
  for (let k = 0; k < 3 && !sty; k++) { try { sty = await D.g6pStyle({t: st, s: 1}, 'pop'); } catch (e) { err = String(e); } if (!sty) await new Promise(r => setTimeout(r, 1500)); }
  const info = D.g6pInfo({t: st, s: 1});
  return {bpm, bars, st, sty, err, voices: info.chor ? info.chor.voices.map(v => ({lane: v.lane, rule: v.rule, n: (v.n || []).length})) : null, lanes: info.lanes ? info.lanes.lanes.map(l => ({id: l.id, name: l.name})) : null, chor: D.va1Info().chor};
});
ok('Aufbau: 16 Takte, Gesang im Refrain, Chor „Pop modern“ mit 3 Stimmen (eigene Spuren)', setup.bars === 16 && setup.sty && setup.voices && setup.voices.length === 3 && setup.lanes && setup.lanes.length === 3 && setup.chor, setup);
// Durchläufe mitschneiden (Kopie der Kanäle), damit „Summe der Stücke = Original“ gegen genau den Durchlauf des Exports prüft
await p.evaluate(() => {
  window.__chbR = []; const f = window.va1Pass;
  window.va1Pass = async function (only, dry, onP) { const r = await f(only, dry, onP); window.__chbR.push({lane: only && only.lane || null, vox: only && only.vox, n: r.n, sr: r.sr, lead: r.lead || 0, bpm: r.bpm, a: r.a, L: Float32Array.from(r.ch[0]), R: Float32Array.from(r.ch[1]), solo: G6.solo}); return r; };
});
/* ---------- 1. je Stimme ---------- */
const ex = await p.evaluate(async () => { const D = window.SYNQUENZER; const t = performance.now(); const r = await D.chbExport('stimme'); return {r, ms: Math.round(performance.now() - t), b64: r ? await D.va1ResB64() : null, solo: G6.solo, only: !!VA1.only, job: !!VA1.job}; });
ok('Export „je Stimme“ fertig', ex.r && ex.b64, ex.r ? {label: ex.r.label, names: ex.r.names, ms: ex.ms, size: ex.r.size} : ex);
const bpm = setup.bpm, barSec = 4 * 60 / bpm;
let zipBuf = null;
if (ex.b64) {
  zipBuf = Buffer.from(ex.b64, 'base64'); fs.writeFileSync(path.join(OUT, 'chor-stuecke-je-stimme.zip'), zipBuf);
  const z = unzip(new Uint8Array(zipBuf)), wavs = z.filter(f => /\.wav$/.test(f.name)), txt = z.find(f => f.name === 'Chor-Stuecke.txt');
  ok('ZIP: CRC aller Einträge stimmt (eigene Rechnung)', z.length && z.every(f => CRC(f.data) === f.crc), z.map(f => f.name));
  let py = ''; try { py = execFileSync('python3', ['-I', '-c', 'import sys,zipfile; z=zipfile.ZipFile(sys.argv[1]); print(z.testzip() or "ok", len(z.namelist()))', path.join(OUT, 'chor-stuecke-je-stimme.zip')]).toString().trim(); } catch (e) { py = String(e); }
  ok('ZIP: Python zipfile.testzip ohne Fehler', /^ok 7$/.test(py), py);
  const L = ex.r.last.list, digits = ex.r.last.digits;
  ok('Stückzahl: 3 Stimmen × 2 Refrains = 6 WAV + Chor-Stuecke.txt', wavs.length === 6 && txt && L.length === 6, wavs.map(f => f.name));
  const lanes = setup.lanes, want = [];
  for (const l of lanes) for (const t of [5, 13]) want.push('Chor-' + l.name.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^0-9A-Za-z_-]+/g, '-').replace(/^-+|-+$/g, '') + '-Takt' + String(t).padStart(2, '0') + '.wav');
  ok('Namen: Chor-<Stimme>-Takt05 / -Takt13 (Stellenzahl 2 bei 16 Takten)', digits === 2 && want.every(w => wavs.some(f => f.name === w)), {want, got: wavs.map(f => f.name)});
  // Lage je Stück
  const lagen = [], fehler = [];
  for (const x of L) {
    const f = wavs.find(q => q.name === x.datei), w = f && wav24(f.data); if (!w) { fehler.push(x.datei + ' kein WAV'); continue; }
    const pass = (await p.evaluate(lane => window.__chbR.filter(q => q.lane === lane).map(q => ({lead: q.lead, sr: q.sr, a: q.a})), x.lane))[0];
    const sOf = bb => Math.round((pass.lead + bb * barSec) * pass.sr), spb = sOf(1) - sOf(0);
    let first = -1, last = -1; for (let i = 0; i < w.n; i++) { if (Math.abs(w.L[i]) >= 0.001 || Math.abs(w.R[i]) >= 0.001) { if (first < 0) first = i; last = i; } }
    const lenBars = (w.n) / spb, tailQuiet = last < w.n - Math.round(0.05 * w.sr);
    lagen.push({datei: x.datei, a: x.a, b: x.b, s0: x.s0, soll: sOf(x.a), first, firstBar: first >= 0 ? x.a + Math.floor(first / spb) : null, lenBars: +lenBars.toFixed(4), tailQuiet, peakDb: x.peakDb});
    if (!(w.bits === 24 && w.ch === 2 && w.riff && w.align && w.sr === pass.sr)) fehler.push(x.datei + ' Format');
  }
  ok('WAV: 24 Bit, Stereo, Blockgröße 6, RIFF-Länge stimmt, Abtastrate = Durchlauf', !fehler.length, fehler.length ? fehler : {sr: L[0] && L[0].sr});
  ok('Start jedes Stücks auf dem Taktstrich (±1 Probe gegen eigene Rechnung)', lagen.length === 6 && lagen.every(x => Math.abs(x.s0 - x.soll) <= 1), lagen.map(x => [x.datei, x.s0 - x.soll]));
  ok('Takt im Namen = Takt der ersten Probe über −60 dBFS (Einsatz auf der Eins → Takt05/Takt13)', lagen.every(x => x.firstBar === x.a && (x.a === 4 || x.a === 12)), lagen.map(x => [x.datei, x.first, x.firstBar]));
  ok('Ende auf einem Taktstrich (ganze Takte) und die letzten 50 ms still', lagen.every(x => Math.abs(x.lenBars - Math.round(x.lenBars)) < 1e-3 && x.tailQuiet), lagen.map(x => [x.datei, x.lenBars, x.tailQuiet]));
  // Summe der Stücke an ihren Takten gegen den Durchlauf derselben Stimme
  const sum = await p.evaluate(async ({b64, list}) => {
    const u8 = Uint8Array.from(atob(b64), c => c.charCodeAt(0)), dv = new DataView(u8.buffer), files = {}; let o = 0;
    while (o + 30 <= u8.length && dv.getUint32(o, true) === 0x04034b50) { const sz = dv.getUint32(o + 18, true), nl = dv.getUint16(o + 26, true), xl = dv.getUint16(o + 28, true), nm = new TextDecoder().decode(u8.subarray(o + 30, o + 30 + nl)), d0 = o + 30 + nl + xl; files[nm] = u8.subarray(d0, d0 + sz); o = d0 + sz; }
    const rd = (f, k) => { const q = 44 + k * 3; let v = f[q] | (f[q + 1] << 8) | (f[q + 2] << 16); if (v & 0x800000) v -= 0x1000000; return v / 8388607; };
    const out = [];
    for (const lane of [...new Set(list.map(x => x.lane))]) {
      const P = window.__chbR.find(q => q.lane === lane), n = P.n, S0 = new Float32Array(n), S1 = new Float32Array(n), fade = new Uint8Array(n), fi = Math.round(0.002 * P.sr), fo = Math.round(0.010 * P.sr);
      for (const x of list.filter(q => q.lane === lane)) {
        const f = files[x.datei], m = (f.length - 44) / 6;
        for (let i = 0; i < m; i++) { const s = x.s0 + i; if (s < 0 || s >= n) continue; S0[s] += rd(f, 2 * i); S1[s] += rd(f, 2 * i + 1); if (i < fi || i >= m - fo) fade[s] = 1; }
      }
      let mxIn = 0, mxOut = 0, mxAll = 0, nOut = 0;
      for (let s = 0; s < n; s++) { const d = Math.max(Math.abs(S0[s] - P.L[s]), Math.abs(S1[s] - P.R[s])); if (d > mxAll) mxAll = d; if (fade[s]) { if (d > mxIn) mxIn = d; } else { if (d > mxOut) mxOut = d; if (d > 0.001) nOut++; } }
      const db = v => (v > 0 ? +(20 * Math.log10(v)).toFixed(1) : -200);
      out.push({lane, restDb: db(mxOut), blendeDb: db(mxIn), nOut, solo: P.solo});
    }
    return out;
  }, {b64: ex.b64, list: L.map(x => ({datei: x.datei, lane: x.lane, s0: x.s0}))});
  ok('Summe der Stücke an ihren Takten = Durchlauf „nur diese Stimme“ (Rest außerhalb der Blenden < −60 dB)', sum.length === 3 && sum.every(x => x.restDb < -60), sum);
  ok('Je Stimme lief ein eigener Durchlauf mit Solo genau dieser Chor-Spur', sum.every(x => x.solo === x.lane), sum.map(x => [x.lane, x.solo]));
  const T = Buffer.from(txt.data).toString('utf8');
  fs.writeFileSync(path.join(OUT, 'Chor-Stuecke.txt'), T);
  ok('Begleittext: Tempo, Taktart, Abtastrate, je Stück eine Zeile (Takt von–bis, Sekunden, Teil Refrain, Stimme), Anleitung für die DAW', /Tempo .* BPM · Taktart 4\/4 · \d+ Hz/.test(T) && L.every(x => T.includes(x.datei + ' · Takt ' + (x.a + 1) + '–' + x.b)) && (T.match(/ · Refrain · /g) || []).length === 6 && /In Cubasis: Datei in eine Audiospur ziehen\. Raster \(Snap\) an\./.test(T), T.split('\r\n').slice(0, 7));
  ok('Sekunden ab Takt 1 im Text: Takt 5 = 4 Takte, Takt 13 = 12 Takte', L.every(x => Math.abs(x.t - x.a * barSec) < 1e-3), L.map(x => [x.datei, +x.t.toFixed(4)]));
}
ok('Nach dem Export: Solo, Nur-Wahl und Auftrag zurückgesetzt', ex.solo == null && !ex.only && !ex.job, {solo: ex.solo, only: ex.only, job: ex.job});
/* ---------- 2. alle zusammen ---------- */
const ex2 = await p.evaluate(async () => { const D = window.SYNQUENZER; window.__chbR = []; const r = await D.chbExport('alle'); return {r, passes: window.__chbR.map(q => ({lane: q.lane, vox: q.vox, solo: q.solo}))}; });
ok('„alle zusammen“: ein Durchlauf (Nur Chor), Chor-Alle-Takt05 + Chor-Alle-Takt13', ex2.r && ex2.passes.length === 1 && ex2.passes[0].vox === 'chor' && ex2.passes[0].solo === -1 && ex2.r.names.filter(n => /\.wav$/.test(n)).join(',') === 'Chor-Alle-Takt05.wav,Chor-Alle-Takt13.wav', ex2.r ? {names: ex2.r.names, passes: ex2.passes} : ex2);
/* ---------- 3. Kern ohne DOM: Anfang auf der Eins, Atmer davor, Anlauf, Trennen, Verwerfen ---------- */
const core = await p.evaluate(() => {
  const D = window.SYNQUENZER, sr = 48000, spb = 24000, grid = Array.from({length: 13}, (_, b) => 1000 + b * spb), n = grid[12] + 100;
  const sig = (parts) => { const x = new Array(n).fill(0); for (const [a, e, amp] of parts) for (let i = a; i < e && i < n; i++) x[i] = amp * Math.sin(i * 0.05); return x; };
  const one = D.chbFind(sig([[grid[4], grid[5] + 5000, 0.5]]), null, sr, grid);                          // Einsatz genau auf der Eins von Takt 5
  const breath = D.chbFind(sig([[grid[4] - 3000, grid[4] - 1000, 0.01], [grid[4], grid[5], 0.5]]), null, sr, grid);   // leiser Atmer davor (−40 dB)
  const preRoll = D.chbFind(sig([[200, grid[1], 0.5]]), null, sr, grid);                                   // Anlauf vor Takt 1
  const gap0 = D.chbFind(sig([[grid[2], grid[3] - 2000, 0.5], [grid[3] + 10, grid[4], 0.5]]), null, sr, grid);   // kein ganzer stiller Takt
  const gap1 = D.chbFind(sig([[grid[2], grid[3] - 2000, 0.5], [grid[5], grid[6], 0.5]]), null, sr, grid);      // ganzer stiller Takt dazwischen
  const quiet = D.chbFind(sig([[grid[2], grid[3], 0.5], [grid[8], grid[9], 0.004]]), null, sr, grid);        // Hallrest −48 dBFS
  const early = D.chbFind(sig([[grid[4] - 2, grid[5], 0.5]]), null, sr, grid);                             // 2 Proben vor dem Strich (Rundung)
  return {one, breath, preRoll, gap0, gap1, quiet, early};
});
ok('Kern: Einsatz auf der Eins von Takt 5 → Takt05 (a=4), Ende auf den nächsten Strich', core.one.length === 1 && core.one[0].a === 4 && core.one[0].b === 6, core.one);
ok('Kern: Atmer vor dem Einsatz → Stück beginnt einen Takt früher (Takt04)', core.breath.length === 1 && core.breath[0].a === 3, core.breath);
ok('Kern: Anlauf vor Takt 1 → Anfang Takt 1, als gekürzt markiert', core.preRoll.length === 1 && core.preRoll[0].a === 0 && core.preRoll[0].pre === true, core.preRoll);
ok('Kern: ohne ganzen stillen Takt ein Stück, mit stillem Takt zwei', core.gap0.length === 1 && core.gap1.length === 2, {gap0: core.gap0.map(x => [x.a, x.b]), gap1: core.gap1.map(x => [x.a, x.b])});
ok('Kern: Stück unter −45 dBFS (Hallrest) fällt weg', core.quiet.length === 1 && core.quiet[0].a === 2, core.quiet.map(x => [x.a, x.b, x.rmsDb]));
ok('Kern: 2 Proben vor dem Strich gilt als auf dem Strich', core.early.length === 1 && core.early[0].a === 4, core.early.map(x => [x.a, x.s0]));
/* ---------- 4. Abbrechen ---------- */
const ab = await p.evaluate(async () => { const D = window.SYNQUENZER; VA1.res = null; const pr = D.chbExport('stimme'); await new Promise(r => setTimeout(r, 300)); VV.cancel = true; const r = await pr; return {r, res: !!VA1.res, job: !!VA1.job, solo: G6.solo, only: !!VA1.only, busy: va1Busy()}; });
ok('Abbrechen: keine Datei, kein hängender Zustand', !ab.r && !ab.res && !ab.job && ab.solo == null && !ab.only && !ab.busy, ab);
/* ---------- 5. Regression „Nur Chor“ (ein WAV, 16 Bit) ---------- */
const nc = await p.evaluate(async () => { const r = await window.SYNQUENZER.va1Export('chor'); return r ? {label: r.label, kind: r.kind, size: r.size} : null; });
ok('Regression: „Nur Chor“ unverändert ein WAV', nc && nc.kind === 'wav' && /Nur Chor/.test(nc.label), nc);
/* ---------- 6. Bedienweg: Export-Blatt, Umschalter, Tipp auf die Zeile, Chor-Blatt, Hilfe, Guide ---------- */
await p.evaluate(() => { VA1.res = null; window.SYNQUENZER.va1Sheet(); });
await p.waitForTimeout(500);
const row = await p.evaluate(() => { const r = document.querySelector('.pop.va1 .chb-row button[data-va="chorblk"]'), je = [...document.querySelectorAll('.pop.va1 .chb-je button')]; if (r) r.scrollIntoView({block: 'center'}); const bx = r && r.getBoundingClientRect();
  return r ? {dis: r.disabled, txt: r.textContent, h: Math.round(bx.height), w: Math.round(bx.width), je: je.map(x => [x.textContent, x.getAttribute('aria-pressed'), Math.round(x.getBoundingClientRect().height)])} : null; });
ok('Export-Blatt: Zeile „Chor als Einzelstücke“ (aktiv, ≥ 44 px) mit Umschalter je Stimme | alle zusammen und Hilfe', row && !row.dis && row.h >= 44 && row.je.length === 3 && row.je.every(x => x[2] >= 44) && row.je[0][1] === 'true', row);
await p.screenshot({path: path.join(OUT, 'export-blatt.png')});
const tapSel = async sel => { const bx = await p.locator(sel).first().boundingBox(); await p.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height / 2); };
await tapSel('.pop.va1 .chb-je button[data-v="alle"]'); await p.waitForTimeout(300);
const pref = await p.evaluate(() => ({je: window.SYNQUENZER.chbInfo().je, pressed: document.querySelector('.pop.va1 .chb-je button[data-v="alle"]').getAttribute('aria-pressed')}));
ok('Umschalter „alle zusammen“ gemerkt (uiPrefs) und markiert', pref.je === 'alle' && pref.pressed === 'true', pref);
await tapSel('.pop.va1 .chb-je button[data-v="stimme"]'); await p.waitForTimeout(200);
await tapSel('.pop.va1 .chb-row button[data-va="chorblk"]'); await p.waitForTimeout(400);
await p.screenshot({path: path.join(OUT, 'export-laeuft.png')});
await p.waitForFunction(() => !VA1.job, null, {timeout: 180000}).catch(() => {});
await p.waitForTimeout(300);
const ui = await p.evaluate(() => ({res: VA1.res ? {label: VA1.res.label, n: VA1.res.names.length} : null, txt: (document.querySelector('.pop.va1 .va1jt') || {}).textContent || ''}));
ok('Tipp auf die Zeile: rechnet und meldet „Fertig: Chor als Einzelstücke (6 WAV)“ mit Teilen', ui.res && ui.res.n === 7 && /Fertig: Chor als Einzelstücke \(6 WAV\)/.test(ui.txt), ui);
const tb = await p.$('.pop.va1 .chb-row'); if (tb) await tb.scrollIntoViewIfNeeded().catch(() => {});
await p.screenshot({path: path.join(OUT, 'export-fertig.png')});
await tapSel('.pop.va1 .chb-je button[data-va="chbhelp"]'); await p.waitForTimeout(500);
const hl = await p.evaluate(() => { const q = document.querySelector('.pop.chbh'); return q ? {n: q.querySelectorAll('ol li').length, title: (document.querySelector('.pop.chbh') || {}).textContent.slice(0, 80), over: q.scrollWidth > q.clientWidth + 1} : null; });
ok('Hilfe „Gesang aus Cubasis holen“: 6 Schritte, nichts quer abgeschnitten', hl && hl.n === 6 && !hl.over, hl);
await p.screenshot({path: path.join(OUT, 'hilfe.png')});
await p.evaluate(() => closePop());
// Chor-Blatt: Knopf „Als Einzelstücke speichern“ öffnet das Export-Blatt mit der Zeile
const cb = await p.evaluate(async st => { try { g6Sheet({t: st, s: 1}); } catch (e) { return {err: String(e)}; } await new Promise(r => setTimeout(r, 600)); const k = [...document.querySelectorAll('button[data-chb="open"]')]; if (k[0]) k[0].scrollIntoView({block: 'center'}); return {n: k.length, h: k[0] ? Math.round(k[0].getBoundingClientRect().height) : 0}; }, setup.st);
await p.screenshot({path: path.join(OUT, 'chor-blatt.png')});
if (cb.n) { await tapSel('button[data-chb="open"]'); await p.waitForTimeout(600); }
const cb2 = await p.evaluate(() => ({va1: !!document.querySelector('.pop.va1 .chb-row'), g6: !!document.querySelector('button[data-chb="open"]')}));
ok('Chor-Blatt: Knopf „Als Einzelstücke speichern“ (≥ 44 px) öffnet das Export-Blatt an der Zeile', cb.n === 1 && cb.h >= 44 && cb2.va1, {cb, cb2});
await p.evaluate(() => closePop());
// Import-Blatt: Link zur Hilfe
await p.evaluate(() => imp1Sheet()); await p.waitForTimeout(400);
const ih = await p.evaluate(() => !!document.querySelector('.pop.imp1 button[data-i="chbhelp"]'));
if (ih) { await tapSel('.pop.imp1 button[data-i="chbhelp"]'); await p.waitForTimeout(400); }
const ih2 = await p.evaluate(() => !!document.querySelector('.pop.chbh'));
ok('Import-Blatt: Knopf „Gesang aus Cubasis holen“ öffnet die Hilfe', ih && ih2, {ih, ih2});
await p.evaluate(() => closePop());
const gd = await p.evaluate(() => ui1Entries().filter(e => /^chb/.test(e.id)).map(e => [e.id, e.n]));
ok('Guide: Einträge „Chor als Einzelstücke“ und „Gesang aus Cubasis holen“', gd.length === 2, gd);
// quer
await p.setViewportSize({width: 926, height: 428}); await p.evaluate(() => { VA1.res = null; window.SYNQUENZER.chbOpen(); }); await p.waitForTimeout(600);
const q = await p.evaluate(() => { const r = document.querySelector('.pop.va1 .chb-row button'), pop = document.querySelector('.pop.va1'); const bx = r.getBoundingClientRect(); return {h: Math.round(bx.height), inView: bx.top >= 0 && bx.bottom <= innerHeight, over: pop.scrollWidth > pop.clientWidth + 1}; });
ok('Quer: Zeile sichtbar (an die Zeile gerollt), nichts quer abgeschnitten', q.h >= 44 && q.inView && !q.over, q);
await p.screenshot({path: path.join(OUT, 'export-quer.png')});
const live = await p.evaluate(() => ({solo: G6.solo, only: !!VA1.only, dry: GGB.dry, cancel: VV.cancel}));
ok('Live-Zustand danach unverändert (Solo aus, Gesang an)', live.solo == null && !live.only && !live.dry && !live.cancel, live);
ok('Keine Seiten-/Konsolen-Fehler', !errs.length, errs.slice(0, 5));
await b.close();
const nOk = R.filter(x => x.ok).length;
console.log(`\nCHORB: ${nOk}/${R.length} OK · ${((Date.now() - T0) / 1000).toFixed(1)} s`);
fs.writeFileSync(path.join(OUT, 'chorb-test.json'), JSON.stringify({ok: nOk, n: R.length, sek: +((Date.now() - T0) / 1000).toFixed(1), R}, null, 1));
process.exit(nOk === R.length ? 0 : 1);
