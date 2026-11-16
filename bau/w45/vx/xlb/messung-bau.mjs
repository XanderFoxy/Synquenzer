// XLB: baut messung.html – die Messseite für Xanders iPhone (nicht veröffentlichen, nur vorbereiten).
// Sie nimmt den ECHTEN Synth-Worklet-Code der App (Block sq-worklet-src aus index.html) und die flachen Klang-Daten von 4 Werksklängen
// (aus der App gerechnet), baut je Spur dieselbe Knotenkette wie die App (17 Knoten) und lässt 8 → 16 → 24 Spuren je 20 s spielen.
// Gemessen: Worklet-Last (dieselbe Meldung, die der CPU-Begrenzer der App nutzt), Aussetzer (Ausgabe-Uhr gegen Wand-Uhr), Bildrate.
// Aufruf: node messung-bau.mjs <index.html> <messung.html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const [file, out] = process.argv.slice(2);
const html = fs.readFileSync(file, 'utf8');
const m = /<script type="text\/plain" id="sq-worklet-src">([\s\S]*?)<\/script>/.exec(html);
if (!m) { console.error('sq-worklet-src fehlt'); process.exit(1); }
const wk = m[1];
if (/[^\x00-\x7f]/.test(wk)) console.log('Hinweis: Worklet-Quelltext hat Nicht-ASCII-Zeichen');
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto('file://' + file); await p.waitForTimeout(1500);
const SND = await p.evaluate(() => ['f-moog-bass', 'f-fm-pluck', 'f-rom-flaeche', 'f-mini-lead'].map(id => {
  const snd = factorySound(id); return {id, name: snd.name, engine: snd.engine, patch: wkFlat(snd), mods: wkMods(snd), fm6: snd.engine === 'fm6' && snd.p.fm6 ? wkFmOf(snd.p) : null, poly: snd.p.poly || (snd.common && snd.common.poly) || 0};
}));
const ver = await p.evaluate(() => VERSION);
await b.close();
const page = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Synquenzer Messung 8/16/24 Spuren</title>
<style>
:root{color-scheme:dark;--bg:#0d0e11;--ch:#15171b;--ch2:#1c1f25;--line:#2d323c;--text:#ece8df;--dim:#9aa0aa;--play:#35d07f;--amber:#ffb22e;--rec:#ff4538}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.4 -apple-system,system-ui,sans-serif;padding:16px 16px calc(16px + env(safe-area-inset-bottom))}
h1{font-size:19px;margin:4px 0 6px}p{margin:6px 0;color:var(--dim)}
button{font:700 17px/1 inherit;color:var(--text);background:linear-gradient(var(--ch2),var(--ch));border:1px solid var(--line);border-radius:10px;min-height:52px;width:100%;margin:10px 0}
button:disabled{opacity:.45}
table{width:100%;border-collapse:collapse;margin:10px 0;font-variant-numeric:tabular-nums}th,td{border-bottom:1px solid var(--line);padding:7px 4px;text-align:right}th:first-child,td:first-child{text-align:left}
.st{font:700 15px/1.3 inherit;color:var(--amber);min-height:22px}.ok{color:var(--play)}.bad{color:var(--rec)}
.bar{height:8px;background:var(--ch2);border-radius:4px;overflow:hidden;margin:8px 0}.bar i{display:block;height:100%;width:0;background:var(--play)}
small{color:var(--dim)}
</style></head><body>
<h1>Messung: wie viele Spuren schafft dein iPhone?</h1>
<p>Tippe auf Start und lass die Seite 60 Sekunden offen (Bildschirm an, App nicht wechseln). Du hörst leise Akkorde. Es spielen nacheinander 8, 16 und 24 Spuren mit dem Klang-Programm des Synquenzers. Danach ein Foto von der Tabelle schicken.</p>
<button id="go">Start (60 s)</button>
<div class="st" id="st"></div><div class="bar"><i id="bar"></i></div>
<table id="tab"><tr><th>Spuren</th><th>Last ⌀</th><th>Last max</th><th>Stimmen</th><th>Aussetzer</th><th>Bild ms</th></tr></table>
<div class="st" id="fazit"></div>
<p><small>Last = Anteil der Echtzeit, den die Klang-Erzeugung braucht (wie der CPU-Begrenzer der App sie sieht; ab 0,45 regelt er nach). Aussetzer = Stellen, an denen die Ausgabe hinter der Uhr zurückbleibt (hörbares Knacken). Bild ms = 95 % der Bilder kommen schneller. Speichert nichts, lädt nichts nach. Synquenzer ${ver} · XLB-Messung.</small></p>
<p><small id="info"></small></p>
<script type="text/plain" id="wk">${wk}</script>
<script>
const SND = ${JSON.stringify(SND)};
const STAGES = [8, 16, 24], STAGE_S = 20, SETTLE_S = 3, VPT = 2;   // Stimmen je Spur (Akkord aus 2 Tönen auf jeder Achtel)
const $ = id => document.getElementById(id);
let ctx, master, wakeLock = null;
function chain(c) {   // dieselben Knoten wie buildChain der App: Eingang, 2 Waveshaper mit Gains, Drive, dry/wet, Tremolo, Duck, Volume, Pan, Solo, Vorlage, Schnitt, 2 Sends
  const N = {in: c.createGain(), drive: c.createGain(), shp: [c.createWaveShaper(), c.createWaveShaper()], shg: [c.createGain(), c.createGain()], dry: c.createGain(), wet: c.createGain(),
    trem: c.createGain(), duck: c.createGain(), vol: c.createGain(), pan: c.createStereoPanner(), sx4: c.createGain(), guide: c.createGain(), cut: c.createGain(), rev: c.createGain(), dly: c.createGain()};
  for (let k = 0; k < 2; k++) { N.shg[k].gain.value = k ? 0 : 1; N.in.connect(N.shp[k]); N.shp[k].connect(N.shg[k]); N.shg[k].connect(N.drive); }
  N.wet.gain.value = 0; N.dry.channelCount = 2; N.dry.channelCountMode = 'explicit';
  N.drive.connect(N.dry); N.dry.connect(N.trem); N.wet.connect(N.trem); N.trem.connect(N.duck); N.duck.connect(N.vol); N.vol.connect(N.pan); N.pan.connect(N.sx4); N.sx4.connect(N.guide); N.guide.connect(N.cut);
  N.cut.connect(master.sum); N.cut.connect(N.rev); N.cut.connect(N.dly); N.rev.connect(master.fx); N.dly.connect(master.fx); N.rev.gain.value = .1; N.dly.gain.value = .05; N.vol.gain.value = .25;
  return N;
}
function engine(c, dest, s) {
  const po = s.fm6 ? {patch: s.patch, mods: s.mods || [], fm6: s.fm6} : {patch: s.patch, mods: s.mods || []};
  const node = new AudioWorkletNode(c, 'dirigent-analog', {numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2], channelCount: 2, channelCountMode: 'explicit', channelInterpretation: 'discrete', processorOptions: po});
  node.connect(dest);
  const E = {node, load: 0, nv: 0, q: []};
  node.port.onmessage = e => { const m = e.data; if (m && m.load != null) { E.load = m.load; E.nv = m.voices; } };
  node.port.postMessage({tempo: {bpm: 120, start: null}});
  return E;
}
let T = [], id = 1, schedT = 0, nextBeat = 0;
function schedule() {   // je Spur alle Achtel ein Akkord aus VPT Tönen (0,2 s lang), 150 ms voraus geplant
  const now = ctx.currentTime, ahead = now + .15, step = .25;
  if (nextBeat < now) nextBeat = now + .05;
  while (nextBeat < ahead) {
    T.forEach((tr, i) => {
      const ev = [];
      for (let v = 0; v < VPT; v++) { const n = 48 + (i % 7) * 2 + v * 7 + (Math.floor(nextBeat / 2) % 2) * 5, k = id++; ev.push([nextBeat, 1, k, n, .55, -1], [nextBeat + .2, 2, k]); }
      tr.E.node.port.postMessage({ev});
    });
    nextBeat += step;
  }
}
async function start() {
  $('go').disabled = true;
  try { if (navigator.wakeLock) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) {}
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
  ctx = new (window.AudioContext || window.webkitAudioContext)({latencyHint: 'interactive'});
  await ctx.resume();
  const src = $('wk').textContent; let url = URL.createObjectURL(new Blob([src], {type: 'application/javascript'}));
  let ok = false, why = '';
  try { await ctx.audioWorklet.addModule(url); ok = true; } catch (e) { why = e.message; }   // wie die App: Blob-URL, sonst data:-URL (Quelltext ist ASCII)
  if (!ok) { try { await ctx.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src)); ok = true; } catch (e) { why += ' / ' + e.message; } }
  if (!ok) { $('st').textContent = 'Klang-Programm lädt nicht: ' + why; return; }
  const comp = ctx.createDynamicsCompressor(), out = ctx.createGain(); out.gain.value = .5; comp.connect(out); out.connect(ctx.destination);
  master = {sum: ctx.createGain(), fx: ctx.createGain()}; master.sum.connect(comp); master.fx.gain.value = .3; master.fx.connect(comp);
  let meter25 = 'nein';
  try { const mtr = new AudioWorkletNode(ctx, 'synq-meter', {numberOfInputs: 25, numberOfOutputs: 1, outputChannelCount: [1]}); mtr.connect(ctx.destination); meter25 = 'ja'; } catch (e) { meter25 = 'nein (' + e.message + ')'; }
  $('info').textContent = 'Abtastrate ' + ctx.sampleRate + ' Hz · Latenz ' + Math.round((ctx.baseLatency || 0) * 1000) + ' + ' + Math.round((ctx.outputLatency || 0) * 1000) + ' ms · Pegel-Messer mit 25 Eingängen: ' + meter25;
  const timer = setInterval(schedule, 25);
  const t0 = performance.now(), total = STAGES.length * STAGE_S;
  for (const n of STAGES) {
    const tb = performance.now();
    while (T.length < n) { const i = T.length, N = chain(ctx), E = engine(ctx, N.in, SND[i % SND.length]); T.push({N, E}); }
    const tBuild = performance.now() - tb;
    $('st').textContent = n + ' Spuren spielen …';
    const L = [], V = []; let drop = 0, dropMs = 0, lastO = null; const fr = []; let lastF = performance.now(), run = true;
    const raf = () => { const x = performance.now(); fr.push(x - lastF); lastF = x; if (run) requestAnimationFrame(raf); }; requestAnimationFrame(raf);
    const tEnd = performance.now() + STAGE_S * 1000, tMeas = performance.now() + SETTLE_S * 1000;
    let k = 0;
    while (performance.now() < tEnd) {
      await new Promise(r => setTimeout(r, 250)); k++;
      $('bar').style.width = Math.min(100, (performance.now() - t0) / (total * 10)) + '%';
      const o = ctx.getOutputTimestamp ? ctx.getOutputTimestamp() : null;
      if (performance.now() > tMeas) {
        if (o && lastO && o.performanceTime > lastO.performanceTime) { const lag = (o.performanceTime - lastO.performanceTime) - (o.contextTime - lastO.contextTime) * 1000; if (lag > 12) { drop++; dropMs += lag; } }
        if (k % 4 === 0) { L.push(T.reduce((a, t) => a + (t.E.load || 0), 0)); V.push(T.reduce((a, t) => a + (t.E.nv || 0), 0)); }
      }
      lastO = o;
    }
    run = false; fr.sort((a, b) => a - b);
    const avg = L.reduce((a, b) => a + b, 0) / Math.max(1, L.length), mx = Math.max(0, ...L), nv = Math.round(V.reduce((a, b) => a + b, 0) / Math.max(1, V.length)), f95 = fr.length ? fr[Math.floor(fr.length * .95)] : 0;
    const r = {n, avg, mx, nv, drop, dropMs, f95, tBuild};
    const tr = document.createElement('tr'); tr.innerHTML = '<td>' + n + '</td><td class="' + (avg < .45 ? 'ok' : 'bad') + '">' + avg.toFixed(2) + '</td><td>' + mx.toFixed(2) + '</td><td>' + nv + '</td><td class="' + (drop ? 'bad' : 'ok') + '">' + drop + (drop ? ' (' + Math.round(dropMs) + ' ms)' : '') + '</td><td>' + Math.round(f95) + '</td>';
    $('tab').appendChild(tr); (window.RES = window.RES || []).push(r);
  }
  clearInterval(timer);
  for (const t of T) { try { t.E.node.port.postMessage({ev: [[0, 6, 0]]}); } catch (e) {} }
  setTimeout(() => { try { ctx.close(); } catch (e) {} }, 400);
  const R = window.RES, okN = R.filter(r => r.avg < .45 && !r.drop).map(r => r.n);
  $('fazit').textContent = okN.length ? 'Ohne Aussetzer und unter der Begrenzer-Schwelle: bis ' + Math.max(...okN) + ' Spuren.' : 'Schon bei 8 Spuren knapp – bitte Foto schicken.';
  $('fazit').className = 'st ' + (okN.includes(24) ? 'ok' : '');
  $('st').textContent = 'Fertig – bitte ein Foto von der Tabelle schicken.'; $('bar').style.width = '100%';
  try { if (wakeLock) wakeLock.release(); } catch (e) {}
}
$('go').addEventListener('click', start);
</script></body></html>
`;
fs.writeFileSync(out, page);
console.log('messung.html', Math.round(page.length / 1024) + ' KB', SND.map(s => s.id + ':' + s.engine + ':poly' + s.poly).join(' '));
