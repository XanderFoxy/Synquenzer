// MK1-25 Leistungs-Probe (Nachtrag 3): JSON fields, the probe engines behind a 0-gain sink (output ≤ −120 dBFS), 0 network calls,
// [Abbrechen] ends without a hanging voice. Usage: node v3-mk1-probe.mjs <index.html>
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const ctx = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
const page = await ctx.newPage(); const errs = [], net = [];
page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
await page.evaluate(async () => { ensureAudio(); await AU.ctx.resume(); });
await page.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000});
// instrument: the engines the probe creates, and an analyser behind every 0-gain sink
await page.evaluate(() => {
  window.__pE = []; window.__pA = []; const tr = SynthHost.track;
  SynthHost.track = function (c, dst) { const E = tr.apply(this, arguments); window.__pE.push(E); if (dst && dst.gain) { const an = c.createAnalyser(); an.fftSize = 2048; dst.connect(an); window.__pA.push(an); } return E; };
  window.__peak = () => { let m = 0; const b = new Float32Array(2048); for (const an of window.__pA) { an.getFloatTimeDomainData(b); for (const x of b) m = Math.max(m, Math.abs(x)); } return m; };
});
page.on('request', r => { const u = r.url(); if (!u.startsWith('data:') && !u.startsWith('blob:') && !u.startsWith('file:')) net.push(u); });
const t0 = Date.now();
const pk = []; const iv = setInterval(async () => { try { pk.push(await page.evaluate(() => window.__peak())); } catch (e) {} }, 500);
const r = await page.evaluate(() => SYNQUENZER.perfProbe(['kern']));
clearInterval(iv);
const need = ['app', 'ua', 'sr', 'baseLatency', 'load_med', 'load_per_engine', 'load_max', 'frames_ok', 'quantum_max_ms', 'fps_med', 'voices', 'fall'];
const miss = need.filter(k => !(k in r)), iosKeys = 'longtasks' in r || ('raf_gaps' in r && 'raf_capped' in r);
ok('MK1-25 JSON enthält app, ua, sr, baseLatency, load_med, load_per_engine, load_max, frames_ok, quantum_max_ms, fps_med, longtasks|raf_gaps+raf_capped, voices, fall', !miss.length && iosKeys && r.load_per_engine.length === 4,
  (miss.length ? 'fehlt ' + miss.join() + ' · ' : '') + JSON.stringify({app: r.app, sr: r.sr, load_med: r.load_med, load_per_engine: r.load_per_engine, load_max: r.load_max, frames_ok: r.frames_ok, quantum_max_ms: r.quantum_max_ms, fps_med: r.fps_med, longtasks: r.longtasks, voices: r.voices, fall: r.fall, sec: (Date.now() - t0) / 1000}));
ok('MK1-25 die Probe rechnet (4 Engines, Last > 0, Berichte da)', r.load_med > 0 && r.load_per_engine.every(x => x > 0) && r.frames_ok, 'load_med ' + r.load_med);
const pmax = Math.max(0, ...pk), pdb = pmax > 0 ? 20 * Math.log10(pmax) : -Infinity;
ok('MK1-25 unhörbar: Pegel hinter dem 0-Gain-Anschluss ≤ −120 dBFS', pdb <= -120, (isFinite(pdb) ? pdb.toFixed(1) : '−∞') + ' dBFS aus ' + pk.length + ' Messungen');
ok('MK1-25 0 Netzaufrufe', net.length === 0 && r.net === 0, net.slice(0, 3).join(' ') + ' net=' + r.net);
const dead = await page.evaluate(() => window.__pE.every(E => E.dead));
ok('MK1-25 nach der Probe sind alle Probe-Engines entsorgt', dead);
// [Abbrechen] via the sheet
await page.evaluate(() => { window.__pE = []; mkLoad().probeSheet(); }); await page.waitForTimeout(200);
await page.evaluate(() => document.querySelector('.pop button[data-a="go"]').click());
await page.waitForTimeout(2500);
await page.evaluate(() => document.querySelector('.pop button[data-a="stop"]').click());
const tStop = Date.now();
await page.waitForFunction(() => window.__pE.length === 4 && window.__pE.every(E => E.dead), null, {timeout: 3000}).catch(() => {});
const ab = await page.evaluate(() => ({n: window.__pE.length, dead: window.__pE.every(E => E.dead), pop: !!document.querySelector('.pop'), peak: window.__peak()}));
ok('MK1-25 [Abbrechen] beendet ohne hängende Stimme (alle Engines entsorgt, ≤ 1 s)', ab.n === 4 && ab.dead && Date.now() - tStop <= 1500, JSON.stringify(ab) + ' nach ' + (Date.now() - tStop) + ' ms');
ok('MK1-25 keine Konsolenfehler', !errs.length, errs.slice(0, 3).join(' | '));
console.log('JSON ' + JSON.stringify(r));
await browser.close();
console.log('\n' + (fails ? fails + ' FEHLER' : 'alles bestanden'));
process.exit(fails ? 1 : 0);
