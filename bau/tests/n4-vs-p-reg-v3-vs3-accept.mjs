// VS3 Abnahme (STIMME-Spur & Takes): node v3-vs3-accept.mjs [A B C D E F G H I J K]
import {open, micOn, sleep, b64, resample, APP} from './n4-vs-p-reg-v3-vs3-h.mjs';
import {renderVoice} from './v3-vs2-corpus.mjs';
import {chromium} from 'playwright';
const only = process.argv.slice(2), want = k => !only.length || only.includes(k);
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const BPM = 120, SB = 60 / BPM, LEAD = 0.04;
const sing = notes => renderVoice(notes.map(([b, d, m], k) => ({on: LEAD + b * SB, dur: d * SB, midi: m, legato: false, rest: k ? 0.1 : 0})), {voice: 'male', seed: 3, sigma: 12, vib: [20, 40], bpm: BPM}).x;
async function playAt(p, x, beat, sr, start) { const y = resample(x, 16000, sr); return p.evaluate(([b, beat, st, lead]) => { if (st) SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); const t = c.start + beat * c.spb - lead; window.__fake.play(b, t); return t; }, [b64(y), beat, !!start, LEAD]); }
async function waitBeat(p, b) { await p.waitForFunction(b => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= b; }, b, {timeout: 60000, polling: 20}); }
async function idle(p) { await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0, null, {timeout: 20000}); await sleep(150); }
async function fresh(o) { const H = await open(o); H.sr = await micOn(H.p, o && o.route); await H.p.evaluate(bpm => { SYNQUENZER.setBpm(bpm); SYNQUENZER.setMetronome(false); }, BPM); return H; }
const sine = (sr, sec, f, a) => { const n = Math.round(sr * sec), x = new Array(n); for (let i = 0; i < n; i++) x[i] = Math.round(Math.sin(2 * Math.PI * f * i / sr) * (a || 12000)); return x; };
const deq = (a, b) => JSON.stringify(sortK(a)) === JSON.stringify(sortK(b));
function sortK(o) { if (Array.isArray(o)) return o.map(sortK); if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o).sort()) r[k] = sortK(o[k]); return r; } return o; }

// A — N2-VS3-02: Stimme-FANG legt MELODIE-Clip und STIMME-Take mit gleicher take-ID an; ein Undo entfernt beides, Redo stellt beides her
if (want('A')) {
  const H = await fresh(), p = H.p;
  const MEL4 = [[0, 1, 57], [1, 1, 60], [2, 2, 64], [4, 1, 65], [5, 1, 64], [6, 2, 62], [8, 1, 60], [9, 1, 64], [10, 2, 67], [12, 1, 59], [13, 1, 62], [14, 1.5, 67]];
  await playAt(p, sing(MEL4), 0, H.sr, true);
  await waitBeat(p, 16.5);
  const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n), t0 = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
  ok(t0 === -1, 'vorher keine STIMME-Spur');
  ok(await p.evaluate(() => SYNQUENZER.vsFang({beat: 16.5})), 'Stimme-FANG angenommen');
  ok(await p.evaluate(() => SYNQUENZER.tkInfo().quiet.includes('fang') && SYNQUENZER.tkInfo().stQuiet > 0), 'N7V-35: während des Takes Netz-Ruhe (stQuiet)');
  await idle(p);
  const r = await p.evaluate(() => SYNQUENZER.vsResult()), I = await p.evaluate(() => SYNQUENZER.tkInfo());
  const mel = await p.evaluate(s => SYNQUENZER.getClip(5, s), r.scene), stc = await p.evaluate(([t, s]) => SYNQUENZER.getClip(t, s), [I.stimme, r.scene]);
  ok(I.stimme >= 6, 'STIMME-Spur angelegt (Index ' + I.stimme + ')');
  ok(mel && stc && stc.audio && mel.take === stc.audio.take, `gleiche take-ID: MELODIE ${mel && mel.take} = STIMME ${stc && stc.audio && stc.audio.take}`);
  ok(stc && stc.len === r.len, `STIMME-Clip ${stc && stc.len} Takte wie MELODIE ${r.len}`);
  const tk = await p.evaluate(() => SYNQUENZER.takes()), id = stc && stc.audio.take;
  ok(tk[id] && tk[id].src === 'fang' && tk[id].chunks.length === Math.ceil(tk[id].len / 524288), 'Take im Projekt nur mit Maßen und Schlüsseln: ' + JSON.stringify(tk[id]));
  const seg = await p.evaluate(([id, a, b]) => SYNQUENZER.tkPcmRange(id, a, b), [id, Math.round(stc.audio.in * H.sr), Math.round((stc.audio.in + 8 * SB) * H.sr)]);
  const rms = seg ? Math.sqrt(seg.reduce((s, v) => s + v * v, 0) / seg.length) / 32767 : 0;
  ok(rms > 0.01, 'der Take enthält den Gesang (RMS ' + (20 * Math.log10(rms + 1e-9)).toFixed(1) + ' dBFS in den ersten 2 Takten)');
  const ui = await p.evaluate(() => SYNQUENZER.undoInfo());
  ok(ui.n === u0 + 1 && ui.top.label === 'Stimme' && ui.top.kind === 'group', `ein Undo-Schritt „${ui.top.label}“ (${ui.top.kind}: ${ui.top.items})`);
  await p.evaluate(() => SYNQUENZER.vsResultOk());
  await p.evaluate(() => SYNQUENZER.undo());
  const a1 = await p.evaluate(([s, id]) => ({mel: SYNQUENZER.getClip(5, s), st: SYNQUENZER.tkInfo().stimme, tk: !!SYNQUENZER.takes()[id]}), [r.scene, id]);
  ok(a1.mel === null && a1.st === -1 && !a1.tk, 'ein Undo entfernt MELODIE-Clip, STIMME-Clip (+Spur) und den Take: ' + JSON.stringify(a1));
  await p.evaluate(() => SYNQUENZER.redo());
  const a2 = await p.evaluate(([s, id]) => { const st = SYNQUENZER.tkInfo().stimme; return {mel: SYNQUENZER.getClip(5, s), stc: st >= 0 ? SYNQUENZER.getClip(st, s) : null, tk: !!SYNQUENZER.takes()[id]}; }, [r.scene, id]);
  ok(a2.mel && a2.stc && a2.tk && a2.mel.take === id && a2.stc.audio.take === id, 'Redo stellt beides her (gleiche ID)');
  await sleep(2200);
  const q = await p.evaluate(() => SYNQUENZER.tkInfo());
  ok(!q.quiet.length && q.stQuiet === 0 && q.netLast && q.netLast.total === 0, 'Netz-Ruhe endet nach dem Speichern, Zähler 0: ' + JSON.stringify(q.netLast));
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.br.close();
}

// B — N7V-16: App-Klicks über Kabel-Loopback (echter Weg in der App: Einmessen mit Pieptönen, ● REC mit 🎤, Take) gegen das Raster;
//     N7V-18: Overdub (zweites ● REC auf demselben Clip) → neuer Take oben, alter stumm; Undo stellt den Zustand vorher her
if (want('B')) {
  const H = await open(), p = H.p, LOOPS = 0.02137;
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  await p.evaluate(() => SYNQUENZER.stimmeStart({route: 'speaker', cal: false}));
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 20000}); await sleep(500);
  ok(await p.evaluate(s => window.__loop(s), LOOPS), 'Loopback App-Ausgang → Mikro (' + LOOPS * 1000 + ' ms)');
  const cr = await p.evaluate(() => SYNQUENZER.stimmeCal('voll')); await sleep(300);
  console.log('  Einmessen:', JSON.stringify(cr).slice(0, 200));
  const cal = await p.evaluate(() => { const s = SYNQUENZER.stimme(); return {lat: s.latMs, how: s.latHow, sr: SYNQUENZER.vsClock().sr}; });
  ok(cal.lat > 15 && cal.lat < 200, 'Einmessen über den Loopback: ' + JSON.stringify(cal));
  await p.evaluate(bpm => { SYNQUENZER.setBpm(bpm); SYNQUENZER.setMetronome(true); SYNQUENZER.setRecOptions({countIn: 0, length: 2}); SYNQUENZER.selectSlot(0, 2); SYNQUENZER.play(); }, BPM);
  await waitBeat(p, 3.4); await p.evaluate(() => SYNQUENZER.rec());
  await waitBeat(p, 12.8); await idle(p);
  const I = await p.evaluate(() => SYNQUENZER.tkInfo()), st = I.stimme, c1 = await p.evaluate(t => SYNQUENZER.getClip(t, 2), st);
  ok(st >= 0 && c1 && c1.audio, '● REC mit 🎤 (ohne Gesang) legt trotzdem den STIMME-Take an: ' + JSON.stringify(c1 && c1.audio));
  // Klicks im Take gegen die Referenz (was die App spielte) zur selben Zeit: Kreuzkorrelation je Schlag
  const res = await p.evaluate(async ([st, sp]) => {
    const c = SYNQUENZER.getClip(st, 2), a = c.audio, m = SYNQUENZER.takes()[a.take], sr = m.sr, pcm = await SYNQUENZER.tkPcmRange(a.take);
    const clk = SYNQUENZER.vsClock(), errs = [];
    for (let k = 1; k < 8; k++) {
      // Schlag k des Clips (Aufnahme ab Schlag 4): Take-Sample = in + (k - at) · sp · sr; Referenz-Frame = Kontext-Zeit des Schlags
      const beat = 4 + k, tRef = clk.start + beat * sp, F = Math.round(tRef * sr), r = SYNQUENZER.stimmeRead(F - 2400, F + 2400);
      const j0 = Math.round((a.in + (k - a.at) * sp) * sr) - 2400, x = pcm.slice(j0, j0 + 4800).map(v => v / 32767), y = r.ref;
      let best = -1e9, bi = 0; const cc = [];
      for (let d = -480; d <= 480; d++) { let s = 0; for (let i = 600; i < 4200; i++) s += x[i + d] * y[i]; cc.push(s); if (s > best) { best = s; bi = cc.length - 1; } }
      let fr = 0; if (bi > 0 && bi < cc.length - 1) { const A = cc[bi - 1], B = cc[bi], C = cc[bi + 1]; fr = .5 * (A - C) / (A - 2 * B + C || 1); }
      errs.push(((bi - 480 + fr) / sr) * 1000);
    }
    return errs;
  }, [st, SB]);
  const mx = Math.max(...res.map(Math.abs));
  ok(mx <= 1, `N7V-16 Klicks im Take gegen das Raster nach Latenzausgleich: max ${mx.toFixed(3)} ms (je Schlag ${res.map(e => e.toFixed(2)).join(' ')})`);
  // Wiedergabe: der STIMME-Clip läuft; die geplante Quelle beginnt am Schlag (Startzeit = Kontext-Zeit des Takts)
  const sim = await p.evaluate(() => SYNQUENZER.tkSimLoop({latMs: 37.43, snr: 20}));
  ok(sim.ok && sim.maxAbsMs <= 1, `N7V-16 (Offline-Simulation, Chirp-Schätzer, Bruchteil-Latenz 37,43 ms): geschätzt ${sim.latEst && sim.latEst.toFixed(3)} ms, Klick-Abweichung max ${sim.maxAbsMs} ms`);
  // N7V-18 Overdub: zweites ● REC auf Synth 1 Szene 3 → STIMME-Clip bekommt den neuen Take oben
  const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n), before = c1;
  await p.evaluate(() => { SYNQUENZER.setMetronome(false); });
  const b0 = await p.evaluate(() => { const c = SYNQUENZER.vsClock(); return (c.now - c.outLat - c.start) / c.spb; });
  const nb = Math.ceil((b0 + 1) / 4) * 4;
  await waitBeat(p, nb - 0.6); await p.evaluate(() => SYNQUENZER.rec());
  await waitBeat(p, nb + 8.8); await idle(p);
  const c2 = await p.evaluate(t => SYNQUENZER.getClip(t, 2), st);
  ok(c2.audio.take !== before.audio.take && c2.audio.alt && c2.audio.alt[0].take === before.audio.take, 'N7V-18 Overdub: neuer Take oben, alter in alt (stumm): ' + JSON.stringify({top: c2.audio.take, alt: (c2.audio.alt || []).map(x => x.take)}));
  const src = await p.evaluate(() => SYNQUENZER.tkInfo().src.filter(r => !r.vox));
  ok(src.every(r => r.take === c2.audio.take), 'nur der obere Take klingt: ' + JSON.stringify([...new Set(src.map(r => r.take))]));
  await p.evaluate(() => SYNQUENZER.stop());
  const lbl = await p.evaluate(() => SYNQUENZER.undoInfo().top.label);
  await p.evaluate(() => SYNQUENZER.undo());
  const c3 = await p.evaluate(t => SYNQUENZER.getClip(t, 2), st);
  ok(deq(c3, before), `Undo („${lbl}“) stellt den Clip vorher her (deep-equal)`);
  void u0;
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.br.close();
}

// C — N7V-19 Speicher: IndexedDB v2 Store `audio`, Stücke ≤ 1 MB, Projekt-JSON nur IDs, persist() aufgerufen, Neuladen verliert keinen Take;
//     N7V-20 WAV 16 Bit, Abtastrate des Takes, bitgleich zum gespeicherten Roh-Take
if (want('C')) {
  const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: {width: 390, height: 844}});
  let H = await open({br, ctx}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  const sr = 48000, x = sine(sr, 14, 330, 9000);                       // 14 s = 672 000 Samples = 1,34 MB → 2 Stücke
  for (let i = 0; i < x.length; i += 997) x[i] = (i * 7919) % 30000 - 15000;  // nicht nur Sinus (bitgleich prüfbar)
  const r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 1, len: 8}), x);
  ok(r && r.stored, 'Take gespeichert: ' + JSON.stringify(r));
  const db = await p.evaluate(() => new Promise(res => { const q = indexedDB.open('synquenzer'); q.onsuccess = () => { const d = q.result, v = d.version, st = [...d.objectStoreNames]; const t = d.transaction('audio', 'readonly'), s = t.objectStore('audio'), out = []; const c = s.openCursor(); c.onsuccess = () => { const cu = c.result; if (cu) { out.push({k: cu.key, bytes: cu.value.byteLength}); cu.continue(); } else { d.close(); res({v, st, out}); } }; }; }));
  ok(db.v === 2 && db.st.includes('audio') && db.st.includes('kv'), 'IndexedDB `synquenzer` Version 2 mit Stores ' + db.st.join(', '));
  ok(db.out.length === 2 && db.out.every(o => o.bytes <= 1048576), 'Stücke ≤ 1 MB: ' + JSON.stringify(db.out));
  const pj = await p.evaluate(() => SYNQUENZER.serialize());
  ok(pj.length < 20000 && !/"pcm"|"data"/.test(pj) && pj.includes(r.id), 'Projekt-JSON enthält nur IDs (' + pj.length + ' Zeichen)');
  ok(await p.evaluate(() => SYNQUENZER.tkInfo().persist) != null, 'persist() aufgerufen: ' + await p.evaluate(() => SYNQUENZER.tkInfo().persist));
  const h0 = await p.evaluate(id => SYNQUENZER.tkPcmHash(id), r.id);
  const w = await p.evaluate(id => SYNQUENZER.tkWavInfo(id), r.id);
  ok(w && w.sr === 48000 && w.bits === 16 && w.ch === 1 && w.same && w.hashData === w.hashRaw, 'N7V-20 WAV 48 kHz / 16 Bit / mono, Daten bitgleich zum Roh-Take: ' + JSON.stringify(w));
  ok(h0 === w.hashRaw && h0.split(':')[1] === String(x.length * 2), 'Roh-Take = das aufgenommene PCM (' + h0 + ')');
  const exact = await p.evaluate(([id, n]) => SYNQUENZER.tkPcmRange(id, 0, n), [r.id, 5000]);
  ok(exact.every((v, i) => v === x[i]), 'Roh-Take Stichprobe 5000 Samples bitgleich');
  await p.evaluate(() => SYNQUENZER.saveNow ? SYNQUENZER.saveNow() : SYNQUENZER.save && SYNQUENZER.save()); await sleep(1500);
  await p.close();
  H = await open({br, ctx}); p = H.p;
  await sleep(1500);
  const after = await p.evaluate(id => ({tk: !!SYNQUENZER.takes()[id], st: SYNQUENZER.tkInfo().stimme}), r.id);
  const h1 = await p.evaluate(id => SYNQUENZER.tkPcmHash(id), r.id), bufs = await p.evaluate(() => SYNQUENZER.tkLoadAll());
  ok(after.tk && after.st >= 0 && h1 === h0 && bufs.includes(r.id), 'Neuladen: Take und STIMME-Spur da, bitgleich, geladen: ' + JSON.stringify(after));
  // Wiedergabe nach dem Neuladen klingt (Pegel am Ausgang)
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); window.__tap(); SYNQUENZER.setMetronome(false); SYNQUENZER.launchScene(1); }); await sleep(1200);
  const lv = await p.evaluate(() => window.__lvl());
  ok(lv && lv.rmsDb > -40 && Math.abs(lv.peakHz - 330) < 10, 'Take klingt nach dem Neuladen: ' + JSON.stringify(lv));
  await p.evaluate(() => SYNQUENZER.stop());
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await br.close();
}

// D — N2-VS3-03 Rundweg: eigene Seite (Take) → Export JSON → Claude-App (iframe, ohne Audio) → Speichern → Export → eigene Seite:
//     project() deep-equal, Take bitgleich; ZIP mit WAV in der Claude-App: Toast, Projekt lädt, kein Konsolenfehler
if (want('D')) {
  const fs = await import('fs');
  const FR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-vs3-frame.html';
  fs.writeFileSync(FR, `<!doctype html><iframe id="f" src="file://${APP}" sandbox="allow-scripts allow-same-origin" style="width:390px;height:844px;border:0"></iframe>`);
  const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
  const ctxA = await br.newContext({viewport: {width: 390, height: 844}});
  const H = await open({br, ctx: ctxA}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  const x = sine(48000, 3, 523, 10000);
  const r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 2}), x);
  const P0 = await p.evaluate(() => SYNQUENZER.project()), J1 = await p.evaluate(() => SYNQUENZER.serialize()), h0 = await p.evaluate(id => SYNQUENZER.tkPcmHash(id), r.id);
  const zipArr = await p.evaluate(() => SYNQUENZER.tkZipBytes());
  const zi = await p.evaluate(() => SYNQUENZER.tkZipInfo());
  ok(zi.files.some(f => f.name === 'projekt.json') && zi.files.some(f => f.name === 'takes/' + r.id + '.wav'), 'ZIP: ' + zi.files.map(f => f.name + ' ' + f.n).join(', '));
  // Claude-App: anderer Browser-Kontext (getrennter Speicher), Seite im iframe (kein oberstes Fenster → kein Audio)
  const ctxB = await br.newContext({viewport: {width: 390, height: 844}}), q = await ctxB.newPage(), errsB = [];
  q.on('pageerror', e => errsB.push(String(e))); q.on('console', m => { if (m.type() === 'error') errsB.push(m.text()); });
  await q.goto('file://' + FR); await sleep(2500);
  const f = q.frames().find(fr => fr.url().includes('index.html'));
  await f.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  ok(await f.evaluate(() => !SYNQUENZER.tkInfo().audioOk), 'in der Claude-App (iframe) kein Audio');
  ok(await f.evaluate(j => SYNQUENZER.importJSON(j), J1), 'Import des JSON in der Claude-App');
  await sleep(600);
  const PB = await f.evaluate(() => SYNQUENZER.project());
  await f.evaluate(() => { SYNQUENZER.selectTrack(SYNQUENZER.tkInfo().stimme); }); await sleep(400);
  const grey = await f.evaluate(() => { const st = SYNQUENZER.tkInfo().stimme, h = document.querySelector('.th[data-t="' + st + '"]'); return {st, cls: h && h.className, sb: h && h.querySelector('.sb').textContent}; });
  ok(grey.st >= 0 && /voxoff/.test(grey.cls) && grey.sb === 'Audio nur auf der eigenen Seite', 'STIMME-Spur grau: ' + JSON.stringify(grey));
  const strip = o => { const c = JSON.parse(JSON.stringify(o)); delete c.ui; return c; };
  ok(deq(strip(PB.takes), strip(P0.takes)) && deq(PB.tracks[grey.st], P0.tracks[grey.st]) && deq(PB.song, P0.song), 'in der Claude-App bleiben Take-Daten und STIMME-Spur deep-equal');
  await f.evaluate(() => SYNQUENZER.setBpm(SYNQUENZER.project().bpm));   // „Speichern“ = Autosave
  const J2 = await f.evaluate(() => SYNQUENZER.serialize());
  // zurück auf die eigene Seite (Kontext A, Audio im Store)
  ok(await p.evaluate(j => SYNQUENZER.importJSON(j), J2), 'Import zurück auf der eigenen Seite'); await sleep(800);
  const P2 = await p.evaluate(() => SYNQUENZER.project()), h2 = await p.evaluate(id => SYNQUENZER.tkPcmHash(id), r.id);
  const norm = P => { const c = JSON.parse(JSON.stringify(P)); delete c.ui; delete c.id; delete c.name; return c; };
  ok(deq(norm(P2), norm(P0)), 'project() deep-equal nach dem Rundweg (ohne id/Name/Ansicht, die der Import neu vergibt)');
  ok(h2 === h0, 'der Take ist bitgleich (' + h2 + ')');
  await p.evaluate(() => { window.__tap(); SYNQUENZER.launchScene(0); }); await sleep(1000);
  const lv = await p.evaluate(() => window.__lvl()); await p.evaluate(() => SYNQUENZER.stop());
  ok(lv.rmsDb > -40 && Math.abs(lv.peakHz - 523) < 10, 'und er spielt: ' + JSON.stringify(lv));
  // ZIP in der Claude-App
  const toasts = [];
  await f.evaluate(() => { const t = document.getElementById('toast'); window.__toasts = []; new MutationObserver(() => window.__toasts.push(t.textContent)).observe(t, {childList: true, subtree: true, characterData: true}); });
  const zr = await f.evaluate(a => SYNQUENZER.tkImportZip(a), zipArr); await sleep(800);
  const tz = await f.evaluate(() => window.__toasts.join(' | '));
  ok(zr.ok && zr.hasJson && /Audio übergangen – nur auf der eigenen Seite/.test(tz), 'ZIP in der Claude-App: ' + tz.slice(0, 120));
  ok(await f.evaluate(() => SYNQUENZER.tkInfo().stimme >= 0 && Object.keys(SYNQUENZER.takes()).length === 1), 'Projekt aus der ZIP geladen');
  // derselbe Weg über [Datei öffnen] (Datei-Feld) in der Claude-App
  const ZP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-vs3-test.zip';
  fs.writeFileSync(ZP, Buffer.from(Uint8Array.from(zipArr)));
  await f.evaluate(() => { window.__toasts = []; SYNQUENZER.newProject && SYNQUENZER.newProject({init: true}); });
  await f.setInputFiles('#fileIn', ZP); await sleep(1500);
  const tz2 = await f.evaluate(() => window.__toasts.join(' | ')), st2 = await f.evaluate(() => SYNQUENZER.tkInfo().stimme);
  ok(/Audio übergangen/.test(tz2) && st2 >= 0, '[Datei öffnen] mit ZIP in der Claude-App: Toast + Projekt geladen (' + tz2.slice(0, 90) + ')');
  ok(!errsB.length, 'Claude-App: kein Konsolenfehler ' + JSON.stringify(errsB.slice(0, 3)));
  void toasts;
  // ZIP auf einer frischen eigenen Seite (anderer Speicher): Takes kommen in den Store
  const ctxC = await br.newContext({viewport: {width: 390, height: 844}}), HC = await open({br, ctx: ctxC});
  const zc = await HC.p.evaluate(a => SYNQUENZER.tkImportZip(a), zipArr); await sleep(1200);
  const hc = await HC.p.evaluate(id => SYNQUENZER.tkPcmHash(id), r.id);
  ok(zc.ok && hc === h0, 'ZIP auf der eigenen Seite (frischer Speicher): Take bitgleich übernommen');
  ok(!H.errs.length && !HC.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.concat(HC.errs).slice(0, 3)));
  await br.close();
}

// E — N2-VS3-01 Herkunfts-Hinweis: githack (Test-API) → Hinweis + [WAV/ZIP exportieren] vor dem ersten Take; Pages → keiner
if (want('E')) {
  const H = await fresh(), p = H.p;
  const g = await p.evaluate(() => { SYNQUENZER.tkOrigin('https://raw.githack.com'); const shown = SYNQUENZER.tkOriginHint(); const el = document.querySelector('.pop.tkorigin'); return {shown, txt: el && el.textContent, btn: el && [...el.querySelectorAll('button')].map(b => b.textContent)}; });
  ok(g.shown && /Aufnahmen liegen auf einer geteilten Adresse – bitte die Seite https:\/\/xanderfoxy\.github\.io\/Synquenzer\/ benutzen oder exportieren/.test(g.txt) && g.btn.includes('WAV/ZIP exportieren'), 'githack: Hinweis + [WAV/ZIP exportieren]');
  await p.evaluate(() => document.querySelector('.pop.tkorigin button[data-a="ok"]').click());
  // vor dem ersten Take: ● REC mit 🎤 zeigt ihn (auf githack, frisch)
  const g2 = await p.evaluate(async () => { SYNQUENZER.tkOrigin('https://raw.githack.com'); SYNQUENZER.setRecOptions({countIn: 0, length: 1}); SYNQUENZER.selectSlot(0, 3); SYNQUENZER.play(); await new Promise(r => setTimeout(r, 300)); SYNQUENZER.rec(); await new Promise(r => setTimeout(r, 2600)); return {pop: !!document.querySelector('.pop.tkorigin'), take: Object.keys(SYNQUENZER.takes()).length}; });
  ok(g2.pop, 'githack: der Hinweis erscheint beim Start der Aufnahme (vor dem ersten Take): ' + JSON.stringify(g2));
  await p.evaluate(() => SYNQUENZER.stop());
  const pg = await p.evaluate(() => { const b = document.querySelector('.pop.tkorigin button[data-a="ok"]'); if (b) b.click(); SYNQUENZER.tkOrigin('https://xanderfoxy.github.io'); return {where: SYNQUENZER.tkInfo().where, shown: SYNQUENZER.tkOriginHint(), pop: !!document.querySelector('.pop.tkorigin')}; });
  ok(pg.where === 'pages' && !pg.shown && !pg.pop, 'Pages: kein Hinweis ' + JSON.stringify(pg));
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.br.close();
}

// F — N7V-17 Punch im Song: „dazwischen aufnehmen“ ab Takt 3 (2 Takte) → alle späteren Clips aller Spuren +2 Takte;
//     „überschreiben“ ersetzt nur Takt 3–4 der STIMME-Spur; Rückfrage-Modi; ein Undo; die alte Stimme schweigt während der Aufnahme
if (want('F')) {
  const H = await fresh(), p = H.p;
  // Song: 8 Takte, Synth 1 Szene 1 → 2 → 1 …, Drums durchgehend; dazu eine STIMME (Song-Audio) über alle 8 Takte (erster Punch)
  await p.evaluate(() => SYNQUENZER.setMetronome(false));
  ok(await p.evaluate(() => SYNQUENZER.setSong({bars: 8, lanes: [[{bar: 0, slot: 0}, {bar: 4, slot: 1}], [{bar: 0, slot: 0}], [], [], [{bar: 0, slot: 0}], []], carrier: [], mel: {}})), 'Song mit 8 Takten gesetzt');
  const L0 = await p.evaluate(() => SYNQUENZER.project().song.lanes);
  // erster Punch: Überschreiben ab Takt 1 über 8 Takte, mit Gesang (Sinus über die Attrappe)
  const tone = f => { const n = Math.round(H.sr * 16 * SB), y = new Float32Array(n); for (let i = 0; i < n; i++) y[i] = 0.3 * Math.sin(2 * Math.PI * f * i / H.sr); return y; };
  await p.evaluate(() => SYNQUENZER.songRecFrom({from: 0, mode: 'over', targets: {clips: false, chords: false, mel: true}, preroll: false}));
  await p.waitForFunction(() => SYNQUENZER.runtime().song.play && SYNQUENZER.vsClock().playing, null, {timeout: 5000});
  const t0 = await p.evaluate(b => { const c = SYNQUENZER.vsClock(), off = SYNQUENZER.runtime().song.off || 0; const t = c.start + (0 + off) * c.spb; window.__fake.play(b, t); return t; }, b64(tone(220)));
  void t0;
  await waitBeat(p, 32.2);
  await p.evaluate(() => SYNQUENZER.songRecEnd({beat: 32}));
  await idle(p);
  const v1 = await p.evaluate(() => SYNQUENZER.tkInfo().vox);
  ok(v1 && v1.length === 1 && v1[0].bar === 0 && v1[0].len === 8, 'erster Punch: Song-Stimme Takt 1–8 ' + JSON.stringify(v1 && v1.map(v => [v.bar, v.len, v.take])));
  await p.evaluate(() => SYNQUENZER.stop());
  // Überschreiben ab Takt 3, Bereich Takt 3–4 (Ersetzen) – Rückfrage-Modi für den Bereich
  const md = await p.evaluate(() => SYNQUENZER.recModes(2, 4, false));
  ok(Array.isArray(md) && md.includes('replace') && md.includes('overdub'), 'Rückfrage im Bereich: ' + JSON.stringify(md));
  await p.evaluate(() => SYNQUENZER.songRecFrom({from: 2, to: 4, mode: 'replace', targets: {clips: false, chords: false, mel: true}, preroll: true}));
  await p.waitForFunction(() => SYNQUENZER.vsClock().playing, null, {timeout: 5000});
  const mu = await p.evaluate(() => SYNQUENZER.tkSongMute());
  ok(mu && mu[0] === 8 && mu[1] === 16, 'während der Aufnahme schweigt die alte Stimme in Takt 3–4: ' + JSON.stringify(mu));
  await p.evaluate(b => { const c = SYNQUENZER.vsClock(), off = SYNQUENZER.runtime().song.off || 0; window.__fake.play(b, c.start + (8 + off) * c.spb); }, b64(tone(440)));
  await p.waitForFunction(() => !SYNQUENZER.runtime().song.rec, null, {timeout: 20000}).catch(() => {});
  await sleep(500); await idle(p);
  const v2 = await p.evaluate(() => SYNQUENZER.tkInfo().vox), L2 = await p.evaluate(() => SYNQUENZER.project().song.lanes);
  ok(v2 && v2.length === 3 && v2[0].bar === 0 && v2[0].len === 2 && v2[1].bar === 2 && v2[1].len === 2 && v2[1].take !== v1[0].take && v2[2].bar === 4 && v2[2].len === 4 && v2[2].take === v1[0].take,
    'Ersetzen Takt 3–4: nur dort neu, davor/danach die alte Stimme an gleicher Stelle: ' + JSON.stringify(v2 && v2.map(v => [v.bar, v.len, v.take.slice(0, 4), +v.in.toFixed(3)])));
  ok(v2 && Math.abs(v2[2].in - (v1[0].in + 4 * 4 * SB)) < 1e-4, 'Rest ab Takt 5 spielt den alten Take ab derselben Stelle (in +8 s)');
  ok(deq(L2.slice(0, L0.length), L0) && L2.slice(L0.length).every(l => !l.length), 'Lanes der anderen Spuren unverändert (die neue STIMME-Spur hat keine Szenen-Einträge)');
  await p.evaluate(() => SYNQUENZER.stop());
  // Einfügen ab Takt 3 (2 Takte)
  const before = await p.evaluate(() => SYNQUENZER.project().song);
  await p.evaluate(() => SYNQUENZER.songRecFrom({from: 2, mode: 'insert', targets: {clips: false, chords: false, mel: true}, preroll: true}));
  await p.waitForFunction(() => SYNQUENZER.vsClock().playing, null, {timeout: 5000});
  await waitBeat(p, 4 + 8 + 0.3);
  const endB = await p.evaluate(() => { const c = SYNQUENZER.vsClock(); return (c.now - c.outLat - c.start) / c.spb; });
  await p.evaluate(b => SYNQUENZER.songRecEnd({beat: b}), endB);
  await idle(p);
  const S3 = await p.evaluate(() => SYNQUENZER.project().song);
  const shifted = S3.lanes.every((l, t) => l.filter(e => e.bar >= 4).length === before.lanes[t].filter(e => e.bar >= 2).length && before.lanes[t].filter(e => e.bar >= 2).every(e => l.some(x => x.bar === e.bar + 2 && x.slot === e.slot)));
  ok(S3.bars === before.bars + 2 && shifted, `Einfügen ab Takt 3 (2 Takte): Song ${before.bars} → ${S3.bars} Takte, alle späteren Lane-Einträge +2`);
  const v3 = S3.vox || [];
  ok(v3.some(v => v.bar === 2 && v.len === 2) && v3.filter(v => v.bar >= 4).length === before.vox.filter(v => v.bar >= 2).length && before.vox.filter(v => v.bar >= 2).every(v => v3.some(x => x.bar === v.bar + 2 && x.take === v.take)),
    'Song-Stimme: neuer Take in Takt 3–4, die alte ab Takt 3 um 2 Takte nach hinten: ' + JSON.stringify(v3.map(v => [v.bar, v.len, v.take.slice(0, 4)])));
  const ui = await p.evaluate(() => SYNQUENZER.undoInfo().top);
  ok(ui.kind === 'group' && ui.items.includes('song') && ui.items.includes('takes'), 'ein Undo-Schritt (Song + Take): ' + JSON.stringify(ui));
  await p.evaluate(() => SYNQUENZER.stop()); await p.evaluate(() => SYNQUENZER.undo());
  ok(deq(await p.evaluate(() => SYNQUENZER.project().song), before), 'Undo: Song wie vorher (deep-equal)');
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.br.close();
}

// G — Takes-Blatt: wählen, A/B, löschen (je ein Undo), klingt hörbar anders (Spektrum), Spur-Blatt [＋ STIMME-Spur]
if (want('G')) {
  const H = await open(), p = H.p;
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); });
  const r1 = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 1}), sine(48000, 2, 440));
  const r2 = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 1}), sine(48000, 2, 880));
  await p.evaluate(() => { window.__tap(); SYNQUENZER.launchScene(0); }); await sleep(900);
  const l1 = await p.evaluate(() => window.__lvl());
  ok(Math.abs(l1.peakHz - 880) < 10, 'der obere (neueste) Take klingt: ' + l1.peakHz.toFixed(0) + ' Hz');
  await p.evaluate(() => SYNQUENZER.tkSheet());
  const sh = await p.evaluate(() => { const e = document.querySelector('.pop.tksheet'); return e ? {rows: e.querySelectorAll('.tkrow').length, h: e.querySelector('h4').textContent} : null; });
  ok(sh && sh.rows === 2, 'Takes-Blatt: ' + JSON.stringify(sh));
  await p.evaluate(() => document.querySelector('.pop.tksheet button[data-a="ab"]').click()); await sleep(700);
  const l2 = await p.evaluate(() => window.__lvl());
  ok(Math.abs(l2.peakHz - 440) < 10, 'A/B: jetzt klingt der ältere Take (' + l2.peakHz.toFixed(0) + ' Hz) – sofort, ohne Neustart');
  const c = await p.evaluate(t => SYNQUENZER.getClip(t, 0), r1.track);
  ok(c.audio.take === r1.id && c.audio.alt[0].take === r2.id, 'Daten: oben ' + c.audio.take.slice(0, 4) + ', stumm ' + c.audio.alt[0].take.slice(0, 4));
  ok(await p.evaluate(() => SYNQUENZER.undoInfo().top.label) === 'Take gewählt', 'ein Undo „Take gewählt“');
  await p.evaluate(() => document.querySelector('.pop.tksheet .tk-del[data-k="1"]').click());
  const c2 = await p.evaluate(t => SYNQUENZER.getClip(t, 0), r1.track);
  ok(c2.audio.take === r1.id && !c2.audio.alt, 'Löschen des stummen Takes');
  await p.evaluate(() => SYNQUENZER.undo());
  ok(deq(await p.evaluate(t => SYNQUENZER.getClip(t, 0), r1.track), c), 'Undo holt ihn zurück');
  await p.evaluate(() => SYNQUENZER.stop());
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.br.close();
}
console.log(fail ? `\n${fail} FEHLER` : '\nalles grün');
process.exit(fail ? 1 : 0);
