// NORTH (ND4-08 „Offline = live“ mit dem Video-Render VV1 von 4.26.1): ein Song mit North-Kit über vvRender.
// Prüft: North klingt im Video (nicht die Ersatz-Drum-Stimme, nicht stumm), zwei Renders bitgleich, live bleibt unberührt
// (derselbe Knoten, kein Schlag an den Live-Knoten während des Renders), danach spielt live weiter (late 0), keine Fehler.
// Aufruf: NODE_PATH=/opt/node-tools/node_modules node north-video.mjs [index.html] [kit=Schräg]
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
const FILE = process.argv[2] || new URL('../index.html', import.meta.url).pathname, KIT = process.argv[3] || 'Schräg';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 390, height: 844}}); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(600);
const r = await p.evaluate(async kit => {
  const Q = SYNQUENZER, out = {}; ensureAudio(); Q.setMetronome && Q.setMetronome(false); Q.loadKit(kit);
  for (let k = 0; k < 80 && !(AU.ctx && AU.ctx.state === 'running' && MDS.st === 'ready'); k++) { mdBoot(); await new Promise(r => setTimeout(r, 100)); }
  if (MDS.st !== 'ready') return {err: 'engine ' + MDS.st};
  for (let k = 0; k < 60 && MDX.info().warm === 'on'; k++) await new Promise(r => setTimeout(r, 100));
  const liveE = MDS.E, liveCtx = AU.ctx; let livePosts = 0;
  const port = liveE.node.port, orig = port.postMessage.bind(port); port.postMessage = m => { if (m && m.t === 'hit') livePosts++; return orig(m); };
  const G = DRUM_VOICES.map(v => v.gm), PAT = [[0, 4, 8, 12], [4, 12], [7, 15], [12], [0, 2, 4, 6, 8, 10, 12, 14], [14], [9], [10], [11, 13], [0], [3, 7, 11, 15], [1, 5, 9, 13]];
  const notes = []; PAT.forEach((P, i) => P.forEach(s => notes.push({t: s * 0.25, d: .1, n: G[i], v: s % 4 ? .7 : .95})));
  out.nNotes = notes.length;
  Q.setBpm(120); Q.setClip(DRUM_T, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes});
  const lanes = Array.from({length: NT()}, () => []); lanes[DRUM_T] = [{bar: 0, slot: 0}];
  Q.setSong({bars: 8, lanes, carrier: [], marks: []});   // Spec ND4-08: 8-Takt-Muster
  await new Promise(r => setTimeout(r, 400));
  out.md = DRUM_VOICES.filter(v => mdIsSrc(v.id)).length;
  const grab = () => [VV.last.ch[0].slice(), VV.last.ch[1].slice()];
  const nul = (A, B) => { let d = 0, s = 0; const n = Math.min(A[0].length, B[0].length); for (let c = 0; c < 2; c++) for (let k = 0; k < n; k++) { const x = A[c][k] - B[c][k]; d += x * x; s += A[c][k] * A[c][k]; } return {db: s ? 10 * Math.log10(d / s + 1e-30) : 0, len: [A[0].length, B[0].length]}; };
  const posts0 = livePosts;
  const r1 = await Q.vvRender({}); const A1 = grab();
  out.r1 = {dur: r1.dur, peak: r1.peak, rms: r1.rms, drumHits: (r1.log || []).filter(e => e.track === DRUM_T).length};
  out.afterRender = {sameNode: MDS.E === liveE, ctxLive: MDS.ctx === liveCtx && AU.ctx === liveCtx, st: MDS.st, dead: liveE.dead, livePostsDuring: livePosts - posts0,
    offlineNodes: MDX.info().nodes != null ? MDX.info().nodes : null};
  const r2 = await Q.vvRender({}); const A2 = grab();
  out.repeat = nul(A1, A2);
  // Echtzeit-Mitschnitt des Masters (wie liveCap der VV-Tests): Song einmal + 1,5 s, Korrelation nach bestem Versatz (±50 ms)
  {
    const c = AU.ctx, sp = c.createScriptProcessor(4096, 2, 2), LL = []; let on = false;
    sp.onaudioprocess = e => { if (on) LL.push(new Float32Array(e.inputBuffer.getChannelData(0))); };
    AU.M.ceil.connect(sp); sp.connect(c.destination); on = true;
    songPlayStart(0);
    await new Promise(res => { const iv = setInterval(() => { if (!R.playing) { clearInterval(iv); res(); } }, 10); });
    await new Promise(r => setTimeout(r, 1500)); on = false; AU.M.ceil.disconnect(sp); sp.disconnect();
    const n = LL.reduce((a, x) => a + x.length, 0), L = new Float32Array(n); let k = 0; for (const x of LL) { L.set(x, k); k += x.length; }
    const V = A1[0], sr = c.sampleRate, B = Math.round(0.005 * sr);
    // grob: Hüllkurven (5-ms-Blöcke) über ±1 s gegeneinander, dann je 1-s-Fenster fein (±3 ms, Sample-genau)
    const env = a => { const e = new Float32Array(Math.floor(a.length / B)); for (let q = 0; q < e.length; q++) { let m = 0; for (let i = q * B; i < q * B + B; i++) m += a[i] * a[i]; e[q] = Math.sqrt(m / B); } return e; };
    const eV = env(V), eL = env(L); let co = {c: -1, o: 0};
    for (let o = -200; o <= 200 + (eL.length - eV.length); o++) { let sxy = 0, sxx = 0, syy = 0; for (let q = 0; q < eV.length; q++) { const y = eL[q + o]; if (y === undefined) continue; sxy += eV[q] * y; sxx += eV[q] * eV[q]; syy += y * y; } const cc = sxy / Math.sqrt(sxx * syy + 1e-30); if (cc > co.c) co = {c: cc, o}; }
    // je Fenster: Versatz neu suchen (der Mitschnitt verliert in der Container-Umgebung einzelne Puffer, dann springt er)
    let base = co.o * B; const win = sr, cs = [], offs = [];
    const corrAt = (w, o) => { let sxy = 0, sxx = 0, syy = 0, n = 0; for (let i = w; i < w + win; i++) { const y = L[i + o]; if (y === undefined) continue; sxy += V[i] * y; sxx += V[i] * V[i]; syy += y * y; n++; } return n < win / 2 || sxx < 1e-9 ? null : sxy / Math.sqrt(sxx * syy + 1e-30); };
    for (let w = 0; w + win <= V.length; w += win) {
      let bo = base, be = -1; const q0 = Math.floor(w / B), nq = Math.floor(win / B);
      for (let d = -20; d <= 20; d++) { let sxy = 0, sxx = 0, syy = 0; for (let q = q0; q < q0 + nq; q++) { const y = eL[q + Math.round(base / B) + d]; if (y === undefined) continue; sxy += eV[q] * y; sxx += eV[q] * eV[q]; syy += y * y; } const cc = sxy / Math.sqrt(sxx * syy + 1e-30); if (cc > be) { be = cc; bo = base + d * B; } }
      let bw = -1, bf = bo; for (let d = -B; d <= B; d++) { const cc = corrAt(w, bo + d); if (cc != null && cc > bw) { bw = cc; bf = bo + d; } }
      if (bw > -1) { cs.push(+bw.toFixed(4)); offs.push(bf); base = bf; }
    }
    const so = cs.slice().sort((a, b) => a - b), W = V.length;
    out.live = {corr: so.length ? so[so.length >> 1] : 0, min: so[0], wins: cs, envCorr: +co.c.toFixed(4), offs: [...new Set(offs)], capSec: +(n / sr).toFixed(2), late: MDS.E.late, ps: c.playbackStats ? c.playbackStats.underrunEvents : null};
  }
  // dieselben Pads mit ihrer Drum-Stimme: das Video muss anders klingen (North war drin, nicht die Ersatz-Stimme)
  for (const v of DRUM_VOICES) Q.setPadSource(v.id, 'drum');
  await new Promise(r => setTimeout(r, 200));
  await Q.vvRender({}); const A3 = grab(); out.vsDrum = nul(A1, A3);
  for (let k = 0; k < 12; k++) Q.undo && Q.undo();
  await new Promise(r => setTimeout(r, 300));
  out.mdBack = DRUM_VOICES.filter(v => mdIsSrc(v.id)).length;
  // live geht weiter: 2 s Clip, Schläge gehen an den Live-Knoten, nichts verspätet
  const p0 = livePosts; Q.launchClip(DRUM_T, 0); Q.play(); await new Promise(r => setTimeout(r, 2000)); Q.stop(); await new Promise(r => setTimeout(r, 300));
  out.liveAfter = {posts: livePosts - p0, late: MDS.E.late, sameNode: MDS.E === liveE};
  return out;
}, KIT).catch(e => ({err: String(e && e.stack || e)}));
const ok = !r.err && !errs.length && r.md === 12 && r.r1.rms > 1e-3 && r.r1.drumHits >= 8 * r.nNotes &&
  r.afterRender.sameNode && r.afterRender.ctxLive && r.afterRender.st === 'ready' && !r.afterRender.dead && r.afterRender.livePostsDuring === 0 &&
  r.repeat.db < -120 && r.live.corr >= 0.99 && r.vsDrum.db > -20 && r.mdBack === 12 && r.liveAfter.posts > 0 && r.liveAfter.late === 0 && r.liveAfter.sameNode;
console.log(JSON.stringify({test: 'north-video', id: 'ND4-08', pass: ok, r, errs: errs.slice(0, 4)}));
await b.close(); process.exit(ok ? 0 : 1);
