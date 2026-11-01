// G10j Abnahme (G10-87 … G10-91): Fake-Mikro (Sinus 440 Hz 0–6 s, 460 Hz 6–12 s), Touch, 428×926. Aufruf: node tests/g10j-abnahme.mjs [index.html] [Bild-Ordner]
import {createRequire} from 'module'; import fs from 'fs'; import path from 'path'; import {fileURLToPath} from 'url';
const require = createRequire(import.meta.url); let pw; try { pw = require('playwright'); } catch (e) { pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }
const HERE = path.dirname(fileURLToPath(import.meta.url)), APP = process.argv[2] || path.join(HERE, '..', 'index.html'), OUT = process.argv[3] || HERE;
const WAV = path.join(OUT, 'g10j-sinus.wav');
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const sleep = ms => new Promise(r => setTimeout(r, ms)), db = g => 20 * Math.log10(g);
{ const sr = 48000, n = sr * 12, pcm = Buffer.alloc(44 + n * 2); let ph = 0;
  pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + n * 2, 4); pcm.write('WAVEfmt ', 8); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(sr, 24); pcm.writeUInt32LE(sr * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) { ph += 2 * Math.PI * (i < n / 2 ? 440 : 460) / sr; pcm.writeInt16LE(Math.round(Math.sin(ph) * 0.3 * 32767), 44 + 2 * i); }
  fs.writeFileSync(WAV, pcm); }
const br = await pw.chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--use-file-for-fake-audio-capture=' + WAV]});
const ctx = await br.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage(), errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(400);
const T0 = Date.now();
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
const g0 = await p.evaluate(() => SYNQUENZER.g10j.info().gains);
ok(g0.length > 0 && g0.every(v => v === 1), 'Ausgangswert: jeder Vorlage-Knoten = 1 ' + JSON.stringify(g0));
await p.evaluate(() => SYNQUENZER.stimmeStart({route: 'wired', cal: false}));
await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 20000});

// G10-91: Zeile im Szenen-Blatt (● halten) und im Song-Start-Blatt, Touch-Ziele ≥ 44 px, Leiste ohne Layout-Sprung
const lay0 = await p.evaluate(() => ['top', 'kbArea'].map(k => { const q = EL[k].getBoundingClientRect(); return [q.top, q.height]; }));
await p.evaluate(() => popRecOpts(EL.bRec)); await sleep(250);
await p.tap('[data-g10j="pick"]'); await sleep(150);
const pick = await p.evaluate(() => [...document.querySelectorAll('#g10jRow [data-g10j^="t:"]')].map(b => b.dataset.g10j));
ok(pick.length >= 3, 'Spur ▾ zeigt Spuren: ' + pick.join(' '));
await p.tap('[data-g10j="t:0"]'); await sleep(150);
await p.tap('[data-g10j="up"]'); await sleep(100); await p.tap('[data-g10j="rest"]'); await sleep(150);
const sz1 = await p.evaluate(() => [...document.querySelectorAll('#g10jRow button')].map(b => { const r = b.getBoundingClientRect(); return [b.dataset.g10j, Math.round(r.width), Math.round(r.height)]; }));
ok(sz1.every(([, w, h]) => w >= 44 && h >= 44), 'Szene: Touch-Ziele ≥ 44 px ' + JSON.stringify(sz1));
const hp = await p.evaluate(() => { const e = document.querySelector('.g10j-hp'); return e ? e.textContent : ''; });
ok(/Kopfhörer/.test(hp), 'Kopfhörer-Hinweis sichtbar: „' + hp + '“');
await p.screenshot({path: path.join(OUT, 'g10j-szene-blatt.png')});
const inf1 = await p.evaluate(() => SYNQUENZER.g10j.info());
ok(inf1.src === 't:0' && inf1.up === 6 && inf1.rest === true && inf1.gains.every(v => v === 1), 'Vorlage gewählt (Synth 1, +6, −10), ohne Take bleibt alles 1');
await p.evaluate(() => closePop());

// G10-87: während des Takes +6 / −10, nach dem Take und nach ■ exakt 1
await p.evaluate(() => { SYNQUENZER.setRecOptions({countIn: 0, length: 1}); SYNQUENZER.selectSlot(0, 3); SYNQUENZER.play(); });
await sleep(300); await p.evaluate(() => SYNQUENZER.rec()); await sleep(500);
const gt = await p.evaluate(() => SYNQUENZER.g10j.info());
const dT = db(gt.gains[0]), dR = gt.gains.slice(1).map(db);
ok(gt.on && Math.abs(dT - 6) <= .5 && dR.every(d => Math.abs(d + 10) <= .5), `G10-87 im Take: Vorlage ${dT.toFixed(2)} dB, Rest ${dR.map(d => d.toFixed(2)).join('/')} dB`);
await p.waitForFunction(() => !SYNQUENZER.g10j.info().take, null, {timeout: 8000}); await sleep(150);
const ge = await p.evaluate(() => SYNQUENZER.g10j.info().gains);
ok(ge.every(v => v === 1), 'G10-87 nach dem Take (natürliches Ende): alle = 1 ' + JSON.stringify(ge));
await p.evaluate(() => { SYNQUENZER.setRecOptions({length: 'auto'}); SYNQUENZER.selectSlot(0, 4); SYNQUENZER.rec(); }); await sleep(600);
const gt2 = await p.evaluate(() => SYNQUENZER.g10j.info().gains);
await p.evaluate(() => SYNQUENZER.stop()); await sleep(120);
const gs = await p.evaluate(() => SYNQUENZER.g10j.info().gains);
ok(Math.abs(db(gt2[0]) - 6) <= .5 && gs.every(v => v === 1), 'G10-87 nach ■: alle = 1 ' + JSON.stringify(gs));

// G10-88: WAV/Video-Render mit eingestellter Vorlage = ohne. Der Render ist schon in R-4310 von Lauf zu Lauf nicht bitgleich
// (gleiche Länge, Rauschen/Phasen frei) – darum: jeder Vorlage-Knoten der Offline-Ketten und der Chor-Faktor sind beim Render exakt 1, Pegel gleich
await p.evaluate(() => { SYNQUENZER.songFromChain([{scene: 0, bars: 1}, {scene: 1, bars: 1}]);
  const bt = window.buildTrack; window.__g10jOff = []; window.buildTrack = i => { const r = bt(i); const A = AU.tracks[i]; if (A && A.guide && typeof OfflineAudioContext === 'function' && AU.ctx instanceof OfflineAudioContext) window.__g10jOff.push([i, A.guide.gain.value, G6PC.gGuide]); return r; }; });
const h = () => p.evaluate(async () => { window.__g10jOff = []; const r = await SYNQUENZER.vvRender({range: {a: 0, b: 2}}); return {rms: r.rms, n: window.__g10jOff.slice()}; });
await p.evaluate(() => SYNQUENZER.g10j.set({src: 'off'})); const hOff = await h();
await p.evaluate(() => SYNQUENZER.g10j.set({src: 't:0', up: 6, rest: true})); const hOn = await h();
ok(hOn.n.length > 0 && hOn.n.every(([, g, c]) => g === 1 && c === 1), 'G10-88 Render mit Vorlage: Offline-Ketten ' + hOn.n.length + ', jeder Vorlage-Knoten = 1, Chor-Faktor = 1');
ok(Math.abs(db(hOn.rms) - db(hOff.rms)) < .1, `G10-88 Pegel ohne/mit Vorlage ${db(hOff.rms).toFixed(2)} / ${db(hOn.rms).toFixed(2)} dBFS`);

// G10-91: Song-Start-Blatt mit 🎤 GESANG: Vorlage-Zeile, alte Stimme = H7, Modusname
await p.evaluate(() => { const tg = recTargets(); tg.vox = true; tg.clips = false; tg.chords = false; tg.mel = false; setRecTargets(tg); SV.sel = {a: 0, b: 1}; setSongView(true); });
await sleep(200); await p.evaluate(() => openRecStart(SV.btn && SV.btn.bRec)); await sleep(300);
const rowS = await p.evaluate(() => !!document.querySelector('.rstart #g10jRow'));
ok(rowS, 'Song-Start-Blatt zeigt die Vorlage-Zeile');
const sz2 = await p.evaluate(() => [...document.querySelectorAll('.rstart #g10jRow button')].map(b => { const r = b.getBoundingClientRect(); return [b.dataset.g10j, Math.round(r.width), Math.round(r.height)]; }));
ok(sz2.every(([, w, h]) => w >= 44 && h >= 44), 'Song: Touch-Ziele ≥ 44 px ' + JSON.stringify(sz2));
await p.screenshot({path: path.join(OUT, 'g10j-song-blatt.png')});
await p.evaluate(() => closePop()); await p.evaluate(() => setSongView(false)); await sleep(200);

// G10-89: Live-Punkt (Ziel A4 = 69): 440 Hz grün, 460 Hz gelb mit ↓, Verzögerung ≤ 60 ms; Leiste ohne Layout-Sprung
await p.evaluate(() => SYNQUENZER.g10j.test({tgt: 69, tt: 0}));
const seen = {ok: null, mid: null}; const lats = []; const tEnd = Date.now() + 13000;
while (Date.now() < tEnd && !(seen.ok && seen.mid)) { const d = await p.evaluate(() => SYNQUENZER.g10j.draw()); if (d) { if (d.lat != null) lats.push(d.lat); if (d.cls === 'ok' && !seen.ok) seen.ok = d; if (d.cls === 'mid' && d.arrow === '↓' && d.ct > 50 && !seen.mid) { seen.mid = d; await p.screenshot({path: path.join(OUT, 'g10j-leiste.png')}); } } await sleep(60); }
ok(!!seen.ok, 'G10-89 440 Hz → grün ' + JSON.stringify(seen.ok));
ok(!!seen.mid, 'G10-89 460 Hz → gelb mit ↓ ' + JSON.stringify(seen.mid));
const lat = lats.length ? lats.sort((a, b) => a - b)[Math.floor(lats.length / 2)] : null;
ok(lat != null && lat <= 60, 'G10-89 Verzögerung (Median) ' + lat + ' ms ≤ 60');
const bar = await p.evaluate(() => { const e = document.getElementById('g10jBar'), q = e.getBoundingClientRect(), s = getComputedStyle(e); return {pos: s.position, h: q.height, kids: [...e.querySelectorAll('button,input')].map(b => { const r = b.getBoundingClientRect(); return [b.tagName, Math.round(r.width), Math.round(r.height)]; })}; });
const lay1 = await p.evaluate(() => ['top', 'kbArea'].map(k => { const q = EL[k].getBoundingClientRect(); return [q.top, q.height]; }));
ok(bar.pos === 'fixed' && JSON.stringify(lay0) === JSON.stringify(lay1), 'G10-91 Leiste fest, kein Layout-Sprung ' + JSON.stringify(lay1));
ok(bar.kids.every(([t, w, hh]) => w >= 44 && hh >= 44), 'G10-91 Leiste: Ziele ' + JSON.stringify(bar.kids));
await p.evaluate(() => SYNQUENZER.g10j.test(null));
// Leiste im echten Take (Selbst singen in der Szene, scharf ohne Chor-Daten → nur Kopf/Punkt): nach ■ sofort weg
await p.evaluate(() => { SYNQUENZER.g10j.set({src: 'off'}); SYNQUENZER.g10j.arm(null); });
ok(await p.evaluate(() => !SYNQUENZER.g10j.info().bar), 'ohne Take keine Leiste');

// G10-90: Selbst singen mit Song-Stimme – der neue Take wird die Chorstimme, der Lead bleibt
const r90 = await p.evaluate(() => {
  const lead = {id: 'V1', bar: 2, len: 2, take: 'L', in: 0.5, out: 6, at: 0, chor: {v: 2, voices: [{lane: 'c1', n: [], db: 0}, {lane: 'c2', n: [], db: 0}]}};
  const vx = [lead]; SYNQUENZER.g10j.arm({vox: 'V1', k: 1});
  const r = SYNQUENZER.g10j.songTook(vx, {take: 'N', in: 1, out: 9, at: 0.25}, 1, 4);
  return {ok: r.ok, v: r.vx[0], orig: lead, arm: SYNQUENZER.g10j.info().arm, bpb: SYNQUENZER.g10j.bpb()};
});
const v1 = r90.v.chor.voices[1];
ok(r90.ok && v1.take && v1.take.take === 'N' && v1.dblOff === true && r90.v.take === 'L' && r90.v.in === .5 && !r90.orig.chor.voices[1].take && r90.arm === null,
  'G10-90 Song-Stimme: Chorstimme 2 = neuer Take ' + JSON.stringify(v1.take) + ', Lead bleibt, scharf aus');
ok(r90.bpb === 4, 'Schläge je Takt über Hilfsfunktion (heute ' + r90.bpb + ')');
ok(await p.evaluate(() => { const a = SYNQUENZER.g10j.arm({vox: 'V9', k: 0}); const r = SYNQUENZER.g10j.armIs({vox: 'V9'}) && !SYNQUENZER.g10j.armIs({t: 0, s: 0}); SYNQUENZER.g10j.arm(null); return r; }), 'g6Arm-Ziel kann eine Song-Stimme sein');

ok(!errs.length, 'keine Konsolenfehler ' + JSON.stringify(errs.slice(0, 3)));
console.log('Dauer', ((Date.now() - T0) / 1000).toFixed(1), 's');
await br.close();
console.log(fail ? `FEHLER: ${fail}` : 'ALLE OK'); process.exit(fail ? 1 : 0);
