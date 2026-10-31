// VS-P-06: kein langer Task (> 50 ms) beim Messen eines 16-Takt-Takes (Fertigwerden während des Spielens, Laden); CPU 3 min Wiedergabe
// node n4-vs-p-perf.mjs [lt|cpu|all] [cpuSec]
import {open, sleep, micOn, waitBeat, idle, b64, APP, BASE} from './n4-vs-p-h.mjs';
import {sung} from './n4-vs-p-lib.mjs';
const which = process.argv[2] || 'all', CPU_SEC = +(process.argv[3] || 180);
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const LT = () => { window.__lt = []; const po = new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: Math.round(e.startTime), d: Math.round(e.duration)}); }); po.observe({entryTypes: ['longtask']}); window.__po = po; };
if (which === 'lt' || which === 'all') {
  for (const bpm of [120, 40]) {
    for (const f of [BASE, APP]) {
      const H = await open({file: f}), p = H.p;
      await p.evaluate(b => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(b); }, bpm);
      const sr = await p.evaluate(() => window.__ctx.sampleRate), sec = 16 * 4 * 60 / bpm, y = sung(sec + .25, sr, -30, {seed: 51}).y, pcm = Array.from(y, v => Math.round(v * 32767));
      await p.evaluate(LT); await sleep(300);
      // Fertigwerden während des Spielens: Take kommt in Szene 0 (Overdub-Weg tkInject → tkTrackResync), die STIMME-Spur spielt
      // STIMME-Spur mit 16-Takt-Clip in Szene 0 anlegen (kurzer Take) und spielen; dann kommt der lange Take als Overdub dazu
      await p.evaluate(sr => SYNQUENZER.tkInject({pcm: Array.from({length: sr}, (_, i) => Math.round(3000 * Math.sin(i / 7))), sr, scene: 0, len: 16}), sr);
      await p.evaluate(() => { if (SYNQUENZER.vpWait) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } });
      await p.evaluate(() => { const o0 = window.tkToBuffer; window.__conv = []; window.tkToBuffer = function (a, b) { const t = performance.now(); const r = o0(a, b); window.__conv.push(Math.round(performance.now() - t)); return r; }; });
      await p.evaluate(() => SYNQUENZER.launchScene(0)); await sleep(800);
      const t1 = await p.evaluate(async ([pc, sr]) => { const t = performance.now(); const r = SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 16}); const t2 = performance.now(); return {a: t, b: t2, id: (await r).id}; }, [pcm, sr]);
      const done = await p.evaluate(async () => { const t = performance.now(); if (SYNQUENZER.vpWait) await SYNQUENZER.vpWait(); await new Promise(r => setTimeout(r, 300)); return {t: performance.now() - t, vp: SYNQUENZER.vpInfo ? SYNQUENZER.vpInfo() : null, src: SYNQUENZER.tkInfo().src.length}; });
      const lt1 = await p.evaluate(b => window.__lt.filter(e => e.t >= b), t1.b);
      // Laden: Puffer weg, tkLoad wie nach dem Öffnen des Projekts (IndexedDB → Puffer → Messung)
      await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
      const t2 = await p.evaluate(id => { TK.buf.delete(id); const t = performance.now(); tkLoad(id); return t; }, t1.id);
      await p.waitForFunction(id => !!tkBuffer(id), t1.id, {timeout: 20000});
      await p.evaluate(async () => { if (SYNQUENZER.vpWait) { SYNQUENZER.vpInfo(); await SYNQUENZER.vpWait(); } await new Promise(r => setTimeout(r, 300)); });
      const lt2 = await p.evaluate(b => window.__lt.filter(e => e.t >= b), t2);
      const v = await p.evaluate(() => SYNQUENZER.version), vp = done.vp, conv = await p.evaluate(() => window.__conv), vp2 = await p.evaluate(() => SYNQUENZER.vpInfo ? SYNQUENZER.vpInfo().maxMs : null);
      console.log(`    Umwandeln PCM → Puffer (tkToBuffer, wie 4.23.0): ${JSON.stringify(conv)} ms; längstes Mess-Häppchen insgesamt ${vp2} ms; lange Tasks beim Laden ${JSON.stringify(lt2)} ab ${Math.round(t2)}`);
      console.log(`  ${v} ${bpm} BPM, 16 Takte = ${sec.toFixed(1)} s: tkInject selbst ${(t1.b - t1.a).toFixed(0)} ms; danach lange Tasks ${JSON.stringify(lt1.map(e => e.d))}; Laden: ${JSON.stringify(lt2.map(e => e.d))}` + (vp ? `; Messung: längstes Häppchen ${vp.maxMs} ms, sofort gerechnet ${vp.sync}, gewartet ${vp.gated}, Take ${JSON.stringify(vp.takes[t1.id].heard)}` : ''));
      if (f === APP) { ok(vp.maxMs <= 50 && vp.sync === 0 && !lt1.some(e => e.d > 50), `${bpm} BPM: Fertigwerden während des Spielens – Messung in Häppchen (längstes ${vp.maxMs} ms), kein langer Task danach`);
        const base = global.__ltBase || []; ok(lt2.filter(e => e.d > 50).length <= base.filter(e => e.d > 50).length, `${bpm} BPM: Laden – lange Tasks ${JSON.stringify(lt2.map(e => e.d))} (4.23.0 ohne Messung: ${JSON.stringify(base.map(e => e.d))}; der Rest ist das Umwandeln in den Puffer, wie bisher)`); }
      else global.__ltBase = lt2;
      if (H.errs.length) ok(false, 'Konsolenfehler ' + H.errs.slice(0, 2));
      await H.br.close();
    }
  }
}
if (which === 'cpu' || which === 'all') {
  const res = {};
  for (const f of [BASE, APP, BASE, APP]) {
    const H = await open({file: f}), p = H.p;
    await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.setMetronome(false); SYNQUENZER.play(); SYNQUENZER.stop(); }); await sleep(300);
    const sr = await p.evaluate(() => window.__ctx.sampleRate), bpm = await p.evaluate(() => S.bpm);
    // Gesang mit Plosiven (der Spitzen-Schutz arbeitet in jedem Durchgang)
    const g = sung(4 * 4 * 60 / bpm, sr, -30, {seed: 61}), y = Float32Array.from(g.y); for (let k = 1; k < 8; k++) { const i0 = Math.round(k * y.length / 8), n = Math.round(.01 * sr); for (let j = 0; j < n; j++) y[i0 + j] += 0.7 * Math.sin(Math.PI * j / n) * Math.sin(2 * Math.PI * 250 * j / sr); }
    await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 4}), [Array.from(y, v => Math.round(Math.max(-1, Math.min(1, v)) * 32767)), sr]);
    await p.evaluate(() => { if (SYNQUENZER.vpInfo) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } });
    const cdp = await H.br.newBrowserCDPSession();
    const cpu = async () => { const r = await cdp.send('SystemInfo.getProcessInfo'); return r.processInfo.filter(x => x.type === 'renderer').reduce((a, x) => a + x.cpuTime, 0); };
    await p.evaluate(() => SYNQUENZER.launchScene(0)); await sleep(2000);
    const c0 = await cpu(), w0 = Date.now(); await sleep(CPU_SEC * 1000); const c1 = await cpu(), w1 = Date.now();
    const info = await p.evaluate(() => ({v: SYNQUENZER.version, lim: SYNQUENZER.vpInfo ? SYNQUENZER.vpInfo().src.filter(s => s.lim).length : null, starts: SYNQUENZER.tkInfo().starts}));
    const pct = 100 * (c1 - c0) / ((w1 - w0) / 1000);
    (res[info.v] = res[info.v] || []).push(pct);
    console.log(`  ${info.v}: Renderer-CPU ${pct.toFixed(2)} % über ${((w1 - w0) / 1000).toFixed(0)} s (Take-Stücke ${info.starts}, davon mit Spitzen-Schutz gerade ${info.lim})`);
    await p.evaluate(() => SYNQUENZER.stop()); await H.br.close();
  }
  const m = a => a.reduce((x, y) => x + y, 0) / a.length, d = m(res['4.24.0']) - m(res['4.23.0']);
  ok(d <= 2, `CPU 3 min Wiedergabe (Demo + Gesangs-Take mit Spitzen-Schutz): 4.23.0 ${m(res['4.23.0']).toFixed(2)} %, VS-P ${m(res['4.24.0']).toFixed(2)} % → ${d >= 0 ? '+' : ''}${d.toFixed(2)} Prozentpunkte (≤ +2)`);
}
console.log(fail ? `\n${fail} FEHLER` : '\nALLE OK'); process.exit(fail ? 1 : 0);
