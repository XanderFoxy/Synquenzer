// VS2 gezielte Regression + Leistung: FANG (Tasten), FANG TEIL, ● REC ohne Mikro, Claude-App-Attrappe (N7V-05), Projekt
// gleich zu V2d-fix, PE1 mit 🎤 und Singen, keine longtask > 50 ms bei der Auswertung (Worker), Startzeit gegen V2d-fix.
import {chromium} from 'playwright';
import {open, micOn, b64, resample, EXE, INIT} from './v3-vs2-h.mjs';
import {renderVoice, melody} from './v3-vs2-corpus.mjs';
const SCR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const NEW = 'file://' + SCR + 'dirigent-wt/index.html', OLD = 'file://' + SCR + 'synq-snapshots/V2d-fix.html';
const only = process.argv.slice(2);
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const wb = (p, b) => p.waitForFunction(b => { const r = SYNQUENZER.runtime(); return r.playing && r.audibleBeat >= b; }, b, {timeout: 30000, polling: 20}).catch(() => p.waitForTimeout(0));
async function beat(p) { return p.evaluate(() => { const c = SYNQUENZER.vsClock(); return (c.now - c.outLat - c.start) / c.spb; }); }
async function waitB(p, b) { await p.waitForFunction(b => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= b; }, b, {timeout: 40000, polling: 20}); }
void wb; void beat;

if (!only.length || only.includes('fang')) {
  const H = await open(), p = H.p;
  await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.selectSlot(0, 3); SYNQUENZER.play(); });
  for (const [b, n] of [[0.5, 60], [1.5, 64], [2.5, 67], [3.5, 64]]) { await waitB(p, b); await p.evaluate(n => SYNQUENZER.tap(n, 200), n); }
  await waitB(p, 4.6);
  const fm = await p.evaluate(() => SYNQUENZER.runtime().fangMode);
  await p.evaluate(() => document.getElementById('bFang').click());
  await sleep(200);
  const c = await p.evaluate(() => SYNQUENZER.getClip(0, 3));
  ok(fm === 'fang' && c && c.notes.length === 4, `FANG (Tasten, ohne 🎤): Modus ${fm}, Clip Synth 1 Szene 4 mit ${c && c.notes.length} Noten`);
  // ● REC ohne Mikro: nichts gespielt → „Nichts aufgenommen“, kein Clip
  await p.evaluate(() => { SYNQUENZER.setRecOptions({countIn: 0, length: 1}); SYNQUENZER.selectSlot(1, 5); SYNQUENZER.rec(); });
  const b0 = await beat(p); await waitB(p, Math.ceil(b0 / 4) * 4 + 6);
  const t = await p.evaluate(() => (document.querySelector('#toast') || {}).textContent || '');
  ok(await p.evaluate(() => SYNQUENZER.getClip(1, 5)) === null, `● REC ohne Mikro und ohne Noten: kein Clip (Toast „${t.slice(0, 30)}“)`);
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.br.close();
}
if (!only.length || only.includes('teil')) {
  const H = await open(), p = H.p;
  await p.evaluate(() => { SYNQUENZER.setBpm(150); SYNQUENZER.play(); SYNQUENZER.setKbMode('transpose'); SYNQUENZER.setHarmony({change: 'bar', latch: true}); });
  for (let k = 0; k < 5; k++) { await waitB(p, k * 4 - 0.6); await p.evaluate(n => SYNQUENZER.keyOn(n, 0.8, 'c'), [57, 53, 48, 55, 57][k]); await sleep(60); await p.evaluate(() => SYNQUENZER.keyOff(0, 'c')); }
  await waitB(p, 17.2);
  const fm = await p.evaluate(() => SYNQUENZER.runtime().fangMode);
  ok(fm === 'teil', 'TRANSPONIEREN: FANG TEIL (' + fm + ')');
  await p.evaluate(() => document.getElementById('bFang').click()); await sleep(200);
  const fp = await p.evaluate(() => SYNQUENZER.fangPart());
  ok(fp && fp.len === 4 && fp.end.bar === 4, `FANG TEIL unverändert: ${fp && fp.len} Takte, Ende Taktstrich ${fp && fp.end.bar + 1}`);
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.br.close();
}
if (!only.length || only.includes('claude')) {
  // Claude-App-Attrappe: Seite im iframe (allow=microphone) → kein 🎤, kein Stimme-FANG, 0 Aufrufe
  const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
  const pg = await br.newPage({viewport: {width: 390, height: 844}}); const errs = [];
  pg.on('pageerror', e => errs.push(String(e)));
  await pg.addInitScript(INIT);
  await pg.goto('file://' + SCR + 'dirigent-test/v3-vs2-frame.html');
  const fr = await (await pg.waitForSelector('#f')).contentFrame();
  await fr.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  const r = await fr.evaluate(() => ({micok: document.getElementById('app').classList.contains('micok'), start: SYNQUENZER.stimmeStart(), fang: SYNQUENZER.vsFang(), info: SYNQUENZER.vsInfo(), gum: (window.__fake || {}).gum || 0}));
  ok(!r.micok && r.start === false && r.fang === false && r.info.fangMode !== 'stimme' && r.gum === 0, `N7V-05 Claude-App: kein 🎤 (${r.micok}), stimmeStart ${r.start}, vsFang ${r.fang}, FANG-Modus ${r.info.fangMode}, getUserMedia ${r.gum}`);
  ok(!errs.length, 'keine Fehler im iframe ' + JSON.stringify(errs.slice(0, 2)));
  await br.close();
}
if (!only.length || only.includes('proj')) {
  // dasselbe Projekt wie V2d-fix (VS2 schreibt nichts ins Projekt; Einstellungen nur im Gerät)
  const out = [];
  for (const u of [OLD, NEW]) {
    const br = await chromium.launch({executablePath: EXE}); const pg = await br.newPage();
    await pg.goto(u); await pg.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
    out.push(await pg.evaluate(() => { const j = SYNQUENZER.project(); delete j.appVersion; delete j.saved; return JSON.stringify(j, (k, v) => (k === 'id' || k === 'uid' ? undefined : v)); }));
    await br.close();
  }
  ok(out[0] === out[1], `Projekt (Demo) gleich zu V2d-fix (${out[0].length} Zeichen)`);
}
if (!only.length || only.includes('perf')) {
  // PE1 mit 🎤 an und Gesang: 10 s Demo, Rolle offen; rAF, longtask, tick p95; dann Stimme-FANG über 8 Takte (Worker)
  const H = await open(); const p = H.p; const m = await micOn(p);
  await p.evaluate(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(e.duration); }).observe({entryTypes: ['longtask']}); });
  const mel = melody(9, 57, 69, {n: 30, bpm: 120}), sig = renderVoice(mel, {voice: 'male', seed: 9, bpm: 120});
  await p.evaluate(b => { SYNQUENZER.setBpm(120); SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + 0.05); }, b64(resample(sig.x, 16000, m.sr)));
  await sleep(500); await p.evaluate(() => SYNQUENZER.openRoll(0, 0)); await sleep(400); await p.evaluate(() => { window.__lt = []; });
  const fps = await p.evaluate(async () => { const ts = []; const t0 = performance.now(); await new Promise(r => { const f = t => { ts.push(t); if (t - t0 < 10000) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); }); const per = []; let k = 0; for (let s = ts[0]; s < ts[ts.length - 1] - 1000; s += 1000) { per.push(ts.filter(t => t >= s && t < s + 1000).length); k++; } per.sort((a, b) => a - b); return {med: per[per.length >> 1], min: per[0]}; });
  const lt1 = await p.evaluate(() => window.__lt.slice()), ti = 'nicht in der App gemessen';
  ok(fps.med >= 55 && !lt1.some(d => d > 50), `PE1 mit 🎤 + Gesang + Rolle offen: ${fps.med} fps Median (min ${fps.min}), longtasks > 50 ms: ${lt1.filter(d => d > 50).length}; tick p95 ${ti}`);
  await p.evaluate(() => { SYNQUENZER.closeRoll ? SYNQUENZER.closeRoll() : 0; window.__lt = []; });
  const b = await p.evaluate(() => { const c = SYNQUENZER.vsClock(); return (c.now - c.outLat - c.start) / c.spb; });
  const t0 = Date.now(); await p.evaluate(b => SYNQUENZER.vsFang({beat: b}), b);
  await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy, null, {timeout: 20000});
  const vi = await p.evaluate(() => SYNQUENZER.vsInfo()), lt2 = await p.evaluate(() => window.__lt.slice());
  ok(vi.last && vi.last.how === 'worker' && !lt2.some(d => d > 50), `Auswertung im Worker: ${vi.last && vi.last.sec} s Gesang in ${vi.last && vi.last.ms} ms (Hauptfaden frei: longtasks > 50 ms ${lt2.filter(d => d > 50).length}); Tipp → Blatt ${Date.now() - t0} ms; ${vi.lastFang && vi.lastFang.notes} Noten`);
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.br.close();
}
if (!only.length || only.includes('start')) {
  const med = async (u, thr) => { const v = []; for (let k = 0; k < 5; k++) { const br = await chromium.launch({executablePath: EXE}); const pg = await br.newPage({viewport: {width: 390, height: 844}}); const cdp = await pg.context().newCDPSession(pg); if (thr) await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4}); const t0 = Date.now(); await pg.goto(u); await pg.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => r()))); v.push(Date.now() - t0); await br.close(); } v.sort((a, b) => a - b); return v[2]; };
  const o1 = await med(OLD), n1 = await med(NEW), o4 = await med(OLD, true), n4 = await med(NEW, true);
  ok(n1 <= 1500 && n4 <= 4000 && n1 - o1 <= 150, `Startzeit Median: ${n1} ms (V2d-fix ${o1}), CPU ×4 ${n4} ms (V2d-fix ${o4})`);
}
console.log(fail ? 'FAIL ' + fail : 'ALLE OK'); process.exit(fail ? 1 : 0);
