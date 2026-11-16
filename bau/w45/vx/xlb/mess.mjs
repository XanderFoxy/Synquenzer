// XLB Messung in Chromium (hier, 4 geteilte CPUs): Knotenaufbau, buildGrid, Long Tasks, Worklet-Last beim Spielen bei 8/16/24 Spuren.
// Aufruf: node mess.mjs <index.html> <ausgabe.json>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const [file, out] = process.argv.slice(2);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const R = {when: new Date().toISOString(), load0: fs.readFileSync('/proc/loadavg', 'utf8').trim(), runs: []};
for (const nt of [8, 16, 24]) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + file); await p.waitForTimeout(1800);
  // Projekt in einer eigenen Seite bauen und als Datei laden (wie ein Import), dann Audio an
  const r = await p.evaluate(async nt => {
    const LT = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) LT.push(Math.round(e.duration)); }).observe({type: 'longtask', buffered: false}); } catch (e) {}
    switchProject(newProject(), {first: true});
    while (NS() < 12) SYNQUENZER.xl.addScene(true);
    while (NT() < nt) addTrack();
    // jede Spur: Szene 1 mit einem Clip (Akkord aus 3 Tönen auf jeder Achtel, wie eine Begleitung), DRUMS Viertel
    for (let t = 0; t < NT(); t++) {
      const notes = isDrum(t) ? [0, 1, 2, 3].map(k => ({t: k, d: .25, n: k % 2 ? 38 : 36, v: .8}))
        : Array.from({length: 8}, (_, k) => [0, 4, 7].map(iv => ({t: k * .5, d: .45, n: 48 + (t % 5) * 2 + iv, v: .7}))).flat();
      S.tracks[t].clips[0] = normClip({len: 1, key: {root: 0, scale: 'ionian'}, notes}, isDrum(t) ? 'drum' : 'synth', S.key); clipChanged(t, 0);
    }
    const file = JSON.stringify(projectFileObj(S, true, false));
    const pr = parseProjectFile(JSON.parse(file));
    const t0 = performance.now(); switchProject(pr.project, {first: true}); const tSwitch = performance.now() - t0;
    const g0 = performance.now(); buildGrid(); const tGrid = performance.now() - g0;
    const a0 = performance.now(); ensureAudio(); const tEnsure = performance.now() - a0;
    const lazy0 = SYNQUENZER.xl.lazy();
    // warten, bis das Worklet bereit ist und alle Ketten/Engines stehen
    let w = 0; while ((SynthHost.state !== 'ready' || S.tracks.some((_, i) => !AU.tracks[i])) && w < 80) { await new Promise(r => setTimeout(r, 100)); w++; }
    await new Promise(r => setTimeout(r, 800));
    const lazy1 = SYNQUENZER.xl.lazy();
    const engines = S.tracks.filter((_, i) => AU.synth[i]).length;
    // Leerlauf (nichts spielt) 4 s
    const samp = async ms => { const L = []; const tEnd = performance.now() + ms; while (performance.now() < tEnd) { await new Promise(r => setTimeout(r, 1000)); L.push(cpuLoad()); } return L; };
    const idle = await samp(4000);
    // alle Spuren spielen 10 s
    launchScene(0); play(); await new Promise(r => setTimeout(r, 2000));
    const fr = []; let last = performance.now(), run = true; const raf = () => { const n = performance.now(); fr.push(n - last); last = n; if (run) requestAnimationFrame(raf); }; requestAnimationFrame(raf);
    const ltBefore = LT.length;
    const live = await samp(10000); run = false;
    const lim = LIM.level, voices = (AU.synth || []).reduce((a, E) => a + (E ? E.nv || 0 : 0), 0);
    stop();
    fr.sort((a, b) => a - b);
    const nodes = (() => { let n = 0; for (const A of AU.tracks) if (A) n += 17; return n; })();
    return {nt: NT(), ns: NS(), tSwitch: +tSwitch.toFixed(1), tGrid: +tGrid.toFixed(1), tEnsure: +tEnsure.toFixed(1), q0: lazy0.q.length, built: lazy1.built, buildMs: lazy1.ms,
      engines, chainNodes: nodes, idle: idle.map(x => +x.toFixed(3)), live: live.map(x => +x.toFixed(3)), lim, voices, frameP50: +fr[fr.length >> 1].toFixed(1), frameP95: +fr[Math.floor(fr.length * .95)].toFixed(1),
      longTasksAll: LT.slice(), longTasksLive: LT.slice(ltBefore), heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null};
  }, nt);
  r.errs = errs; r.load = fs.readFileSync('/proc/loadavg', 'utf8').trim();
  const avg = a => +(a.reduce((x, y) => x + y, 0) / Math.max(1, a.length)).toFixed(3);
  r.idleAvg = avg(r.idle); r.liveAvg = avg(r.live.slice(1));
  console.log(JSON.stringify(r));
  R.runs.push(r);
  await ctx.close();
}
// buildGrid 24 × 32 (Zellenaufbau) hochkant und quer
for (const [w, h] of [[428, 926], [926, 428]]) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); await p.goto('file://' + file); await p.waitForTimeout(1800);
  const g = await p.evaluate(() => { switchProject(newProject(), {first: true}); SYNQUENZER.xl.setScenes(32); while (NT() < 24) addTrack(); const T = []; for (let k = 0; k < 5; k++) { const t0 = performance.now(); buildGrid(); T.push(performance.now() - t0); }
    const A = []; for (let k = 0; k < 8; k++) { const t0 = performance.now(); SYNQUENZER.xl.next(); A.push(performance.now() - t0); }
    const rg = []; for (let k = 0; k < 20; k++) { UI.dirty.grid = true; const t0 = performance.now(); renderGrid(-1); rg.push(performance.now() - t0); }
    T.sort((a, b) => a - b); A.sort((a, b) => a - b); rg.sort((a, b) => a - b);
    return {w: innerWidth, h: innerHeight, cells: UI.cells.reduce((a, r) => a + (r ? r.length : 0), 0), els: EL.grid.querySelectorAll('*').length, buildGridMed: +T[2].toFixed(1), bankMed: +A[4].toFixed(2), renderGridMed: +rg[10].toFixed(2)}; });
  console.log(JSON.stringify(g)); R['grid' + w] = g; await ctx.close();
}
R.load1 = fs.readFileSync('/proc/loadavg', 'utf8').trim();
fs.writeFileSync(out, JSON.stringify(R, null, 1));
await b.close();
