/* ---------- MIX-A: Worklet-Modul (eigenes Modul, nur geladen, wenn etwas übernommen ist oder gemessen wird) ---------- */
const MIXA_PROC_SRC = `
class SynqMixa extends AudioWorkletProcessor {
  static get parameterDescriptors() { return [{name: 'sec', defaultValue: 0, minValue: -24, maxValue: 24, automationRate: 'k-rate'}]; }
  constructor(o) {
    super(); const p = (o && o.processorOptions) || {}; this.m = p.mode === 'master';
    this.d = this.m ? new MIXA_D.Master(sampleRate, p.lat) : new MIXA_D.Track(sampleRate);
    this.d.set(p.P || {}, true); if (!this.m) { this.d.wT = p.wet == null ? 1 : p.wet; this.d.w = p.fade ? 0 : this.d.wT; }
    this.z = new Float32Array(128); this.alive = true;
    this.port.onmessage = e => { const m = e.data; if (!m) return; if (m.P) this.d.set(m.P, !!m.now); if (m.wet != null && !this.m) this.d.wT = m.wet; if (m.dispose) this.alive = false; };
  }
  process(inputs, outputs, params) {
    const i = inputs[0], o = outputs[0]; if (!o || !o.length) return this.alive;
    const n = o[0].length, z = this.z.length === n ? this.z : (this.z = new Float32Array(n)), L = i && i.length ? i[0] : z, R = i && i.length > 1 ? i[1] : L, oR = o.length > 1 ? o[1] : o[0];
    if (this.m) this.d.process(L, R, o[0], oR, n); else this.d.process(L, R, o[0], oR, n, params.sec[0]);
    return this.alive;
  }
}
registerProcessor('synq-mixa', SynqMixa);
/* Analyse (nur im Offline-Durchlauf): je Eingang (Spur vor dem Mix-Einschub) und je 4 Blöcken: Energie, Spitze, K-Energie, 5 Bänder,
   7 Tiefbänder des Mono-Mittels; gesammelt in Paketen zu 64 Fenstern */
class SynqMixaAn extends AudioWorkletProcessor {
  constructor(o) {
    super(); const p = (o && o.processorOptions) || {}, D = MIXA_D, sr = sampleRate; this.n = (o && o.numberOfInputs) | 0;
    const K = D.kw(sr); this.C = [K[0], K[1], D.bq('lp', 150, sr), D.bq('bp', 270, sr, 0.9), D.bq('bp', 1000, sr, 0.7), D.bq('bp', 3500, sr, 0.75), D.bq('hp', 6000, sr)].concat([40, 50, 63, 80, 100, 125, 160].map(f => D.bq('bp', f, sr, 4.3)));
    this.z = new Float64Array(this.n * 28); this.a = new Float64Array(this.n * 15); this.k = 0; this.W = 4; this.S = 1 + this.n * 15; this.batch = 64;
    this.buf = new Float32Array(this.batch * this.S); this.bi = 0; this.total = +p.total || 0;
  }
  process(inputs) {
    const n = this.n, C = this.C, z = this.z, a = this.a, run = MIXA_D.run;
    for (let k = 0; k < n; k++) {
      const ch = inputs[k]; if (!ch || !ch.length) continue;
      const L = ch[0], R = ch.length > 1 ? ch[1] : ch[0], zo = k * 28, ao = k * 15; let ss = a[ao], pk = a[ao + 1], kk = a[ao + 2];
      for (let i = 0; i < L.length; i++) {
        const x = (L[i] + R[i]) * 0.5, ax = x < 0 ? -x : x; ss += x * x; if (ax > pk) pk = ax;
        const y = run(C[1], z, zo + 2, run(C[0], z, zo, x)); kk += y * y;
        for (let b = 0; b < 12; b++) { const v = run(C[2 + b], z, zo + 4 + 2 * b, x); a[ao + 3 + b] += v * v; }
      }
      a[ao] = ss; a[ao + 1] = pk; a[ao + 2] = kk;
    }
    if (++this.k >= this.W) {
      const N = this.W * 128, o = this.bi * this.S, B = this.buf; B[o] = currentTime + 128 / sampleRate;
      for (let k = 0; k < n; k++) { const ao = k * 15, q = o + 1 + k * 15; for (let j = 0; j < 15; j++) B[q + j] = j === 1 ? a[ao + 1] : a[ao + j] / N; }
      a.fill(0); this.k = 0;
      if (++this.bi >= this.batch || (this.total && currentFrame + 128 * this.W >= this.total)) { this.port.postMessage({w: this.buf.slice(0, this.bi * this.S), n: this.bi}); this.bi = 0; }
    }
    return true;
  }
}
registerProcessor('synq-mixa-an', SynqMixaAn);
`;
const MIXA = {mods: new WeakMap(), w: null, wid: 0, wq: new Map(), busy: false, prog: 0, res: null, am: null, amBusy: false, amProg: 0, ab: false, done: new Map(), err: 0, run: -1, how: null, ziel: -14, last: null, cap: null};
const mixaModSrc = () => 'const MIXA_D = (' + mixaDspMake.toString() + ')();\n' + MIXA_PROC_SRC;
function mixaAddModule(c) {
  let m = MIXA.mods.get(c); if (m === true) return Promise.resolve(true); if (m === false) return Promise.resolve(false); if (m) return m;
  if (!c || !c.audioWorklet || typeof AudioWorkletNode !== 'function') { MIXA.mods.set(c, false); return Promise.resolve(false); }
  const src = mixaModSrc();
  m = (async () => {
    try { const u = URL.createObjectURL(new Blob([src], {type: 'application/javascript'})); try { await c.audioWorklet.addModule(u); } finally { try { URL.revokeObjectURL(u); } catch (x) {} } }
    catch (e) { try { await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(unescape(encodeURIComponent(src)))); } catch (e2) { logErr(e2); MIXA.mods.set(c, false); return false; } }
    MIXA.mods.set(c, true); return true;
  })();
  MIXA.mods.set(c, m); return m;
}
// braucht das Projekt Mix-A-Knoten? (sonst wird nichts geladen und nichts gebaut: bitgleich)
function mixaNeed() { try { return !!(S.fxBus && S.fxBus.am && S.fxBus.am.on) || S.tracks.some(t => t && t.mix); } catch (e) { return false; } }
// Live: nach dem Entsperren und nach dem Laden eines Projekts (die Knoten kommen, sobald das Modul da ist)
function mixaBoot() {
  const c = AU.ctx; if (!c || UI.vvOff || !mixaNeed()) return;
  mixaAddModule(c).then(ok => { if (ok && AU.ctx === c) mixaSyncAll(true); });
}
function mixaSyncAll(now) { if (!AU.ctx) return; for (let i = 0; i < NT(); i++) mixaTrackSync(i, now); mixaMasterSync(now); }

/* ---------- Daten ---------- */
// beide Normalisierer sind in sich geschlossen (laufen schon beim Start in demoProject / normalizeProject, vor diesem Abschnitt)
function mixaMixR() { return {hp: [0, 500], pf: [20, 20000], pg: [-12, 12], pq: [0.3, 8], hs: [-12, 12], thr: [-60, 0], ra: [1, 20], at: [0.05, 200], rl: [5, 2000], mk: [-12, 12]}; }
function mixaNormMix(m) {
  if (!m || typeof m !== 'object' || Array.isArray(m)) return null;
  const o = {}, R = mixaMixR(), num = v => typeof v === 'number' && isFinite(v), cl = (v, a, b) => (v < a ? a : v > b ? b : v);
  for (const k of Object.keys(R)) if (num(m[k])) { let v = +cl(m[k], R[k][0], R[k][1]).toFixed(2); if (k === 'hp' && v > 0 && v < 20) v = 20; o[k] = v; }
  if (m.sec && typeof m.sec === 'object' && !Array.isArray(m.sec)) { const s = {}; let n = 0; for (const k of Object.keys(m.sec)) { if (n >= 64 || !/^(M\d{1,6}|b\d{1,3}-\d{1,4})$/.test(k) || !num(m.sec[k])) continue; const v = +cl(m.sec[k], -12, 12).toFixed(2); if (v) { s[k] = v; n++; } } if (n) o.sec = s; }
  return Object.keys(o).length ? o : null;
}
const MIXA_ZIELE = [[-14, 'Streaming −14 LUFS'], [-9, 'Laut −9 LUFS']];
function mixaNormAm(a) {
  if (!a || typeof a !== 'object' || Array.isArray(a)) return null;
  const N = (k, lo, hi, d) => (typeof a[k] === 'number' && isFinite(a[k]) ? +(a[k] < lo ? lo : a[k] > hi ? hi : a[k]).toFixed(2) : d);
  return {on: a.on !== false, ziel: a.ziel === -9 ? -9 : -14, lo: N('lo', -6, 6, 0), hi: N('hi', -6, 6, 0), thr: N('thr', -60, 0, 0), ra: N('ra', 1, 10, 1),
    at: N('at', 0.1, 200, 30), rl: N('rl', 10, 2000, 200), gain: N('gain', -24, 30, 0), ceil: N('ceil', -6, 0, -1)};
}
const mixaFxOf = tr => { const f = (tr && tr.sound && tr.sound.fx) || {}; return {vol: f.vol === undefined ? null : f.vol, pan: f.pan === undefined ? null : f.pan, pump: f.pump === undefined ? null : f.pump, pumpRel: f.pumpRel === undefined ? null : f.pumpRel}; };
function mixaSnap() { return JSON.stringify({t: S.tracks.map(tr => [tr.mix || null, mixaFxOf(tr)]), am: (S.fxBus && S.fxBus.am) || null, ps: S.fxBus ? S.fxBus.pumpSrc : null}); }
function mixaRestore(val) {
  const o = JSON.parse(val); if (!o) return;
  (o.t || []).forEach(([m, fx], i) => {
    const tr = S.tracks[i]; if (!tr) return;
    const mm = mixaNormMix(m); if (mm) tr.mix = mm; else delete tr.mix;
    if (fx && tr.sound) { if (!tr.sound.fx) tr.sound.fx = {}; for (const k of Object.keys(fx)) { if (fx[k] === null) delete tr.sound.fx[k]; else tr.sound.fx[k] = fx[k]; } }
  });
  const am = mixaNormAm(o.am); if (am) S.fxBus.am = am; else delete S.fxBus.am;
  if (o.ps) S.fxBus.pumpSrc = o.ps;
  mixaAfter(S.tracks.map((_, i) => i), true);
}
// eine Vorlage (patch) setzen bzw. ihren jetzigen Stand lesen; null = Feld fehlt
function mixaPatchGet(i, P) {
  const tr = S.tracks[i], o = {}; if (!tr) return o;
  if (P.mix) { o.mix = {}; for (const k of Object.keys(P.mix)) { if (k === 'sec') { o.mix.sec = {}; for (const s of Object.keys(P.mix.sec)) o.mix.sec[s] = tr.mix && tr.mix.sec && tr.mix.sec[s] != null ? tr.mix.sec[s] : null; } else o.mix[k] = tr.mix && tr.mix[k] != null ? tr.mix[k] : null; } }
  if (P.fx) { o.fx = {}; const f = (tr.sound && tr.sound.fx) || {}; for (const k of Object.keys(P.fx)) o.fx[k] = f[k] === undefined ? null : f[k]; }
  if (P.bus) { o.bus = {}; for (const k of Object.keys(P.bus)) o.bus[k] = S.fxBus[k]; }
  return o;
}
function mixaPatchSet(i, P) {
  const tr = S.tracks[i]; if (!tr) return;
  if (P.mix) {
    const m = Object.assign({}, tr.mix || {});
    for (const k of Object.keys(P.mix)) {
      if (k === 'sec') { const s = Object.assign({}, m.sec || {}); for (const q of Object.keys(P.mix.sec)) { if (P.mix.sec[q] == null) delete s[q]; else s[q] = P.mix.sec[q]; } m.sec = s; }
      else if (P.mix[k] == null) delete m[k]; else m[k] = P.mix[k];
    }
    const n = mixaNormMix(m); if (n) tr.mix = n; else delete tr.mix;
  }
  if (P.fx && tr.sound) { if (!tr.sound.fx) tr.sound.fx = {}; for (const k of Object.keys(P.fx)) { if (P.fx[k] == null) delete tr.sound.fx[k]; else tr.sound.fx[k] = P.fx[k]; } }
  if (P.bus) for (const k of Object.keys(P.bus)) if (k === 'pumpSrc' && ['kick', '1/4', '1/8'].includes(P.bus[k])) S.fxBus.pumpSrc = P.bus[k];
}
const mixaSame = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function mixaIsApplied(i, s) { return !!s.patch && mixaSame(mixaPatchGet(i, s.patch), s.patch); }
function mixaAfter(idx, all) {
  for (const i of idx) { try { applyTrackParams(i, false); } catch (e) { logErr(e); } }
  if (all) mixaMasterSync(false);
  MIXA.run = -1;                                                  // Songteil-Pegel beim nächsten Takt neu setzen
  UI.dirty.all = true; markDirty();
  if (R.editor === 'synth' || R.editor === 'drum') { try { for (const f of ED.refreshers || []) f(); } catch (e) {} }
  mixaPaint(); amPaint();
}

/* ---------- Spur-Knoten: zwischen Tremolo und Pump-Ducking (nur mit track.mix) ---------- */
function mixaTrackP(tr) { const m = tr && tr.mix; if (!m) return null; const o = {}; for (const k of Object.keys(mixaMixR())) if (m[k] != null) o[k] = m[k]; return o; }
function mixaTrackSync(i, now) {
  const A = AU.tracks[i], c = AU.ctx, tr = S.tracks[i]; if (!A || !c || !tr || !A.trem) return;
  const P = mixaTrackP(tr), N = A.mixa;
  if (P) {
    const sg = JSON.stringify(P), hasSec = !!(tr.mix && tr.mix.sec);
    if (!N) {
      if (MIXA.mods.get(c) !== true) { mixaAddModule(c).then(ok => { if (ok && AU.ctx === c && !UI.vvOff) for (let k = 0; k < NT(); k++) mixaTrackSync(k, false); }); return; }
      let node;
      try { node = new AudioWorkletNode(c, 'synq-mixa', {numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2], channelCount: 2, channelCountMode: 'explicit', channelInterpretation: 'speakers', processorOptions: {mode: 'track', P, wet: 1, fade: !now && !UI.vvOff}}); }
      catch (e) { logErr(e); MIXA.err++; return; }
      try { A.trem.disconnect(A.duck); } catch (e) {}
      A.trem.connect(node); node.connect(A.duck);
      A.mixa = {node, sig: sg, sec: hasSec, secV: 0};
    } else {
      N.sec = hasSec;
      if (N.sig !== sg || N.off) { N.sig = sg; N.off = false; try { N.node.port.postMessage({P, wet: 1, now: !!now}); } catch (e) {} }
    }
  } else if (N && !N.off) {                                      // zurück: der Knoten bleibt als Durchgang (bitgleich), kein Umstecken im Lauf
    N.off = true; N.sig = ''; N.sec = false;
    try { N.node.port.postMessage({wet: 0}); const p = N.node.parameters.get('sec'); p.cancelScheduledValues(0); p.setValueAtTime(0, c.currentTime); N.secV = 0; } catch (e) {}
  }
}
// Songteil-Pegel (dB) der Spur i im Song-Takt bar (−1 = kein Song)
function mixaSecDb(i, bar) {
  const tr = S.tracks[i], s = tr && tr.mix && tr.mix.sec; if (!s || bar < 0 || !S.song) return 0;
  for (const k of Object.keys(s)) {
    let a, b;
    if (k[0] === 'M') { const m = (S.song.marks || []).find(x => x.id === k); if (!m) continue; a = m.a; b = m.a + m.len; }
    else { const q = /^b(\d+)-(\d+)$/.exec(k); if (!q) continue; a = +q[1]; b = +q[2]; }
    if (bar >= a && bar < b) return s[k];
  }
  return 0;
}
// Scheduler (tick): an jeder Song-Taktgrenze den Songteil-Pegel setzen (20 ms Gleiten); Video/GarageBand laufen über denselben tick
function mixaTick(b0, b1) {
  let any = false; for (let i = 0; i < NT(); i++) { const A = AU.tracks[i]; if (A && A.mixa && (A.mixa.sec || A.mixa.secV)) { any = true; break; } } if (!any) return;
  const sp = R.songPlay, c = AU.ctx;
  const set = (B, bar) => {
    for (let i = 0; i < NT(); i++) {
      const A = AU.tracks[i]; if (!A || !A.mixa) continue;
      const v = mixaSecDb(i, bar); if (v === A.mixa.secV) continue; A.mixa.secV = v;
      try { A.mixa.node.parameters.get('sec').setTargetAtTime(v, Math.max(c.currentTime, b2t(B) - 0.01), 0.007); } catch (e) {}
    }
  };
  if (MIXA.run !== R.runId) { MIXA.run = R.runId; const B = Math.max(0, b0), sb = sp ? songBeatOf(B) : null; set(B, sb == null ? -1 : Math.floor(sb / 4 + 1e-9)); }
  if (!sp) return;
  for (let B = Math.ceil(b0 - 1e-9); B < b1 - 1e-9; B++) { const sb = songBeatOf(B); if (sb == null) continue; const q = sb / 4; if (Math.abs(q - Math.round(q)) > 1e-6) continue; set(B, Math.round(q)); }
}
function mixaIdle() {
  if (MIXA.run === -2) return; MIXA.run = -2;
  const c = AU.ctx; if (!c) return;
  for (let i = 0; i < NT(); i++) { const A = AU.tracks[i]; if (A && A.mixa && A.mixa.secV) { A.mixa.secV = 0; try { const p = A.mixa.node.parameters.get('sec'); p.cancelScheduledValues(c.currentTime); p.setTargetAtTime(0, c.currentTime, 0.02); } catch (e) {} } }
}

/* ---------- Master-Knoten: parallel zu Limiter/Soft-Ceiling (gleicher Zeitversatz), A = bisher, B = Auto-Master ----------
   vol → [Limiter → Soft-Ceiling] → A ┐
   vol → synq-mixa (Master)        → B ┴→ out → destination, Analyser, Meter, Song-Aufnahme, Stimme-Referenz */
function mixaAmP() { const a = S.fxBus && S.fxBus.am; return a && a.on ? {lo: a.lo, hi: a.hi, thr: a.thr, ra: a.ra, at: a.at, rl: a.rl, gain: a.gain, ceil: a.ceil} : null; }
function mixaMoveTaps(from, to) {
  try { if (AU.meter && AU.meter.node && AU.meter.ctx === AU.ctx) { try { from.disconnect(AU.meter.node); } catch (e) {} to.connect(AU.meter.node, 0, MAX_T); } } catch (e) { logErr(e); }
  try { if (typeof SREC !== 'undefined' && SREC.dst) { try { from.disconnect(SREC.dst); } catch (e) {} to.connect(SREC.dst); } } catch (e) { logErr(e); }
  try { if (typeof ST !== 'undefined' && ST.run && ST.run.node && ST.run.node.context === AU.ctx) { try { from.disconnect(ST.run.node); } catch (e) {} to.connect(ST.run.node, 0, 1); } } catch (e) { logErr(e); }
  try { if (UI.g10Out && UI.g10Out.an && UI.g10Out.an.context === AU.ctx) { try { from.disconnect(UI.g10Out.an); } catch (e) {} to.connect(UI.g10Out.an); } } catch (e) {}
}
function mixaAbSet(A, now) {
  const c = AU.ctx, t = c.currentTime, on = !!A.on && !MIXA.ab;
  if (now) { A.ga.gain.value = on ? 0 : 1; A.gb.gain.value = on ? 1 : 0; return; }
  for (const [g, v] of [[A.ga, on ? 0 : 1], [A.gb, on ? 1 : 0]]) { g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(v, t, 0.008); }
}
function mixaMasterSync(now) {
  const M = AU.M, c = AU.ctx; if (!M || !c) return;
  if (VV.off && VV.off.mixa && VV.off.oc === c) return;           // Messdurchlauf: ohne Auto-Master (mixaTapBuild)
  const P = mixaAmP(), A = M.am;
  if (P) {
    const sg = JSON.stringify(P);
    if (!A || !A.node) {
      if (MIXA.mods.get(c) !== true) { mixaAddModule(c).then(ok => { if (ok && AU.ctx === c && !UI.vvOff) mixaMasterSync(false); }); return; }
      const lat = Math.round((AU.compLat || FX.COMP_LATENCY) * c.sampleRate);
      let node;
      try { node = new AudioWorkletNode(c, 'synq-mixa', {numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2], channelCount: 2, channelCountMode: 'explicit', channelInterpretation: 'speakers', processorOptions: {mode: 'master', P, lat}}); }
      catch (e) { logErr(e); MIXA.err++; return; }
      let B = A;
      if (!B) {
        const ga = c.createGain(), gb = c.createGain(), out = c.createGain(), ceil = M.ceil;
        ga.gain.value = 1; gb.gain.value = 0;
        ceil.connect(ga); ga.connect(out); gb.connect(out); out.connect(c.destination); out.connect(M.analyser);
        try { ceil.disconnect(c.destination); } catch (e) {} try { ceil.disconnect(M.analyser); } catch (e) {}
        mixaMoveTaps(ceil, out);
        B = M.am = {ga, gb, out, ceil, node: null}; M.ceil = out;
      }
      M.vol.connect(node); node.connect(B.gb);
      Object.assign(B, {node, sig: sg, lat, on: true});
      mixaAbSet(B, now || UI.vvOff);
    } else {
      if (A.sig !== sg) { A.sig = sg; try { A.node.port.postMessage({P, now: !!now}); } catch (e) {} }
      if (!A.on) { A.on = true; if (A.kill) { clearTimeout(A.kill); A.kill = 0; } }
      mixaAbSet(A, now);
    }
  } else if (A && A.on) {                                          // aus: zurück auf Limiter/Soft-Ceiling (Gewinn 1 = bitgleich), Knoten weg
    A.on = false; mixaAbSet(A, now);
    const node = A.node, kill = () => { if (A.node !== node || A.on) return; try { M.vol.disconnect(node); } catch (e) {} try { node.disconnect(); node.port.postMessage({dispose: true}); } catch (e) {} A.node = null; A.sig = ''; A.kill = 0; };
    if (now || UI.vvOff) kill(); else A.kill = setTimeout(kill, 120);
  }
}
// Vorher/Nachher (nur Hören; nicht gespeichert)
function mixaAB(v) { const nv = v == null ? !MIXA.ab : !!v; MIXA.ab = nv; const A = AU.M && AU.M.am; if (A && A.node) mixaAbSet(A, false); amPaint(); return MIXA.ab; }

/* ---------- Messdurchlauf: Analyse-Worklet an jeder Spur, Master vor dem Auto-Master als Ergebnis ---------- */
function mixaTapBuild(off) {
  const c = AU.ctx, n = NT(), X = off.mixa;
  if (MIXA.mods.get(c) !== true) throw new Error('Analyse-Modul fehlt');
  const an = new AudioWorkletNode(c, 'synq-mixa-an', {numberOfInputs: n, numberOfOutputs: 1, outputChannelCount: [1], channelCount: 2, channelCountMode: 'explicit', channelInterpretation: 'speakers', processorOptions: {total: c.length}});
  an.connect(c.destination);
  for (let i = 0; i < n; i++) { const A = AU.tracks[i]; if (A && A.trem) A.trem.connect(an, 0, i); }
  const M = AU.M, d = c.createDelay(0.1); d.delayTime.value = AU.compLat; M.vol.connect(d); d.connect(c.destination);
  try { M.ceil.disconnect(c.destination); } catch (e) {}
  X.chunks = []; X.nw = 0; X.n = n;
  an.port.onmessage = e => { const m = e.data; if (m && m.w) { X.chunks.push(m.w); X.nw += m.n; } };
}
async function mixaRender(onProg) {
  const song = S.song; if (!song || !song.bars) throw new Error('Noch kein Song – erst ● SONG');
  const keep = VV.last, X = {t0: null}; let r;
  VV.cancel = false;
  try { r = await vvRenderAudio({range: {a: 0, b: song.bars, sel: false}, mixa: X, onProgress: onProg}); } finally { VV.last = keep; }
  const want = Math.floor(r.buf.length / 512) - 1, W0 = performance.now();
  while (X.nw < want && performance.now() - W0 < 2000) await sleep(15);
  const S1 = 1 + X.n * 15, win = new Float32Array(X.nw * S1); let o = 0; for (const ch of X.chunks) { win.set(ch, o); o += ch.length; }
  X.chunks = null;
  return {r, X, win, S1};
}
// Kopie in Stücken (kein langer Block im Hauptfaden), damit der Worker sie übernehmen kann
async function mixaCopy(src) { const out = new Float32Array(src.length); for (let i = 0; i < src.length; i += 1 << 20) { out.set(src.subarray(i, Math.min(src.length, i + (1 << 20))), i); await vvYield(); } return out; }

/* ---------- Worker ---------- */
function mixaJob(D, m) {
  if (m.op === 'am') return D.amFit(m.L, m.R, m.sr, m.o);
  const S1 = 1 + m.nIn * D.NF, nw = Math.floor(m.win.length / S1), T = [];
  for (const t of m.tracks) {
    const f = D.feats(m.win, m.nIn, t.i, m.wsec, null), c = D.classify(t, t.ns, f);
    T.push(Object.assign({}, t, {f, cls: c.cls, sc: c.sc, chr: D.character(c.cls, t.ns, f)}));
  }
  // Songteile: Lautheit je Spur je Teil (Fensterzeit → Song-Takt)
  const secs = [];
  for (const s of m.secs) {
    const ta = m.t0 + (s.a - m.a0) * 4 * m.spb, tb = m.t0 + (s.b - m.a0) * 4 * m.spb, E = new Float64Array(m.nIn); let cnt = 0;
    for (let w = 0; w < nw; w++) { const t = m.win[w * S1]; if (t < ta || t >= tb) continue; cnt++; for (let k = 0; k < m.nIn; k++) E[k] += m.win[w * S1 + 1 + k * D.NF + 2]; }
    const Ld = Array.from(E, e => (cnt ? -0.691 + 10 * Math.log10(Math.max(1e-30, e / cnt)) + 3.01 : -200)), mx = Math.max(...Ld);
    secs.push({id: s.id, name: s.name, a: s.a, b: s.b, L: Ld.map(v => +v.toFixed(1)), act: m.tracks.map(t => Ld[t.i] > mx - 30 && Ld[t.i] > -60)});
  }
  const sug = D.suggest(T, {bpm: m.bpm, pumpSrc: m.pumpSrc, otherPump: m.otherPump, secs});
  return {T, secs, sug};
}
function mixaWorker() {
  if (MIXA.w !== null) return MIXA.w;
  try {
    const src = 'const D = (' + mixaDspMake.toString() + ')();\n' + mixaJob.toString() + '\nonmessage = e => { const m = e.data; try { postMessage({id: m.id, r: mixaJob(D, m)}); } catch (err) { postMessage({id: m.id, err: String(err && err.message || err)}); } };';
    const u = URL.createObjectURL(new Blob([src], {type: 'application/javascript'}));
    const w = new Worker(u); setTimeout(() => { try { URL.revokeObjectURL(u); } catch (e) {} }, 30000);
    w.onmessage = e => { const m = e.data, q = MIXA.wq.get(m.id); if (!q) return; MIXA.wq.delete(m.id); if (m.err) q.no(new Error(m.err)); else q.ok(m.r); };
    w.onerror = e => { for (const q of MIXA.wq.values()) q.no(new Error('worker')); MIXA.wq.clear(); MIXA.w = false; try { e.preventDefault(); } catch (er) {} };
    MIXA.w = w;
  } catch (e) { MIXA.w = false; }
  return MIXA.w;
}
const MIXA_D0 = {v: null};
function mixaCall(m, tr) {
  const w = mixaWorker();
  if (!w) { MIXA.how = 'hauptfaden'; return Promise.resolve().then(() => mixaJob(MIXA_D0.v || (MIXA_D0.v = mixaDspMake()), m)); }
  return new Promise((ok, no) => { const id = ++MIXA.wid; MIXA.wq.set(id, {ok: r => { MIXA.how = 'worker'; ok(r); }, no}); w.postMessage(Object.assign({}, m, {id}), tr || []); });
}

/* ---------- Noten: Lage, Dichte, Länge, Legato, Stimmen (aus den Clips des Songs, gewichtet nach gespielten Takten) ---------- */
function mixaNoteStats(i) {
  const tr = S.tracks[i], song = S.song; if (!tr || tr.kind === 'drum' || tr.stimme) return null;
  const items = [];
  if (song && song.bars) {
    const cnt = new Map(), lane = song.lanes[i] || [];
    for (let b = 0; b < song.bars; b++) { const o = laneOriginAt(lane, b); if (!o || o.slot < 0 || !laneClipOk(song, i, o)) continue; const k = o.own ? 'o' + o.own : 'c' + o.slot; cnt.set(k, (cnt.get(k) || 0) + 1); }
    for (const [k, bars] of cnt) { const c = k[0] === 'o' ? song.own && song.own[k.slice(1)] : tr.clips[+k.slice(1)]; if (c && c.notes && c.notes.length) items.push({notes: c.notes, L: c.len * 4, w: bars / c.len}); }
    const m = song.mel && song.mel[i]; if (m && m.notes && m.notes.length) items.push({notes: m.notes, L: Math.max(4, m.len * 4), w: 1});
  }
  if (!items.length) for (const c of tr.clips) if (c && c.notes && c.notes.length) items.push({notes: c.notes, L: c.len * 4, w: 1});
  if (!items.length) return null;
  const P = [], Dd = [], V = []; let on = 0, beats = 0, leg = 0, legN = 0, grpN = 0, grpS = 0, n = 0;
  for (const it of items) {
    const ns = it.notes.filter(x => x.t < it.L - 1e-9).slice().sort((a, b) => a.t - b.t); if (!ns.length) continue;
    const g = []; for (const x of ns) { const last = g[g.length - 1]; if (last && Math.abs(last.t - x.t) < 0.02) { last.n.push(x); last.e = Math.max(last.e, x.t + x.d); } else g.push({t: x.t, n: [x], e: x.t + x.d}); }
    for (const x of ns) { P.push([x.n, it.w]); Dd.push([Math.min(x.d, it.L), it.w]); V.push(x.v); n++; }
    for (let k = 0; k < g.length; k++) { grpN += it.w; grpS += g[k].n.length * it.w; if (k + 1 < g.length) { legN += it.w; if (g[k].e >= g[k + 1].t - 0.05) leg += it.w; } }
    on += g.length * it.w; beats += it.L * it.w;
  }
  if (!n) return null;
  const wq = (a, p) => { const s = a.slice().sort((x, y) => x[0] - y[0]), tot = s.reduce((q, x) => q + x[1], 0); let acc = 0; for (const x of s) { acc += x[1]; if (acc >= p * tot) return x[0]; } return s[s.length - 1][0]; };
  const vs = V.slice().sort((a, b) => a - b), vq = p => vs[Math.round(p * (vs.length - 1))];
  return {n, medP: wq(P, 0.5), p10: wq(P, 0.1), p90: wq(P, 0.9), dens: +(on / Math.max(1, beats)).toFixed(2), durB: +wq(Dd, 0.5).toFixed(3), leg: +(legN ? leg / legN : 0).toFixed(2), poly: +(grpS / Math.max(1e-9, grpN)).toFixed(2), vel: +(vq(0.9) - vq(0.1)).toFixed(2)};
}
// Songteile: die Teil-Marken, sonst Abschnitte gleicher Besetzung (≥ 2 Takte)
function mixaSections() {
  const song = S.song; if (!song || !song.bars) return [];
  const nm = m => m.name || (m.part && m.part[0] === 'P' && S.parts && S.parts[+m.part.slice(1) - 1] ? S.parts[+m.part.slice(1) - 1].name : m.part && m.part[0] === 'S' && S.scenes[+m.part.slice(1) - 1] ? S.scenes[+m.part.slice(1) - 1].name : 'Teil');
  if (song.marks && song.marks.length) return song.marks.map(m => ({id: m.id, a: m.a, b: Math.min(song.bars, m.a + m.len), name: nm(m) + ' (T' + (m.a + 1) + ')'}));
  const sig = b => S.tracks.map((_, i) => { const o = laneOriginAt(song.lanes[i] || [], b); return o && o.slot >= 0 && laneClipOk(song, i, o) ? (o.own || o.slot) : '-'; }).join(',');
  const seg = []; let a = 0, s = sig(0);
  for (let b = 1; b <= song.bars; b++) { const x = b < song.bars ? sig(b) : null; if (x !== s) { if (seg.length && b - a < 2) seg[seg.length - 1].b = b; else seg.push({a, b}); a = b; s = x; } }
  return seg.map(x => ({id: 'b' + x.a + '-' + x.b, a: x.a, b: x.b, name: 'Takt ' + (x.a + 1) + '–' + x.b}));
}
// Zustand, an dem eine Messung hängt (Spuren, Klänge, Master, Song) – geändert → „neu messen“
function mixaStateSig() { try { return SQStore.fnv(JSON.stringify([S.tracks.map(t => [t.sound, t.mix || null, t.mute]), S.fxBus.master, S.fxBus.hall, S.fxBus.echo, S.song, S.bpm])); } catch (e) { return String(Math.random()); } }

/* ---------- Analysieren (Mix-Assistent) und Messen (Auto-Master): ein Offline-Durchlauf, Auswertung im Worker ---------- */
async function mixaMeasure(what) {
  if (MIXA.busy) return null;
  if (!S.song || !S.song.bars) { toast('Noch kein Song – erst ● SONG'); return null; }
  MIXA.busy = what; MIXA.prog = 0; mixaPaint(); amPaint();
  const T0 = performance.now();
  try {
    const sig = mixaStateSig(), {r, X, win, S1} = await mixaRender(p => { MIXA.prog = p * 0.7; mixaProg(); });
    const sr = r.sr, nIn = X.n, out = {sig, ms: 0};
    if (what === 'mix' || what === 'beide') {
      const tracks = S.tracks.map((tr, i) => ({i, name: tr.name, kind: tr.kind, stimme: !!tr.stimme, chor: !!(tr.chor && tr.chor.length), mute: !!tr.mute, ns: mixaNoteStats(i), fx: Object.assign({drive: 0}, fxOfSound(tr.sound)), mix: tr.mix || null})).filter(t => !t.mute);
      const res = await mixaCall({op: 'mix', win, nIn, wsec: 512 / sr, tracks, secs: mixaSections(), t0: X.t0, a0: 0, spb: 60 / r.bpm, bpm: r.bpm, pumpSrc: S.fxBus.pumpSrc, otherPump: S.tracks.some(t => t.sound && t.sound.fx && t.sound.fx.pump > 0)}, [win.buffer]);
      MIXA.res = Object.assign(res, {sig, at: Date.now()}); MIXA.done.clear();
    }
    MIXA.prog = 0.75; mixaProg();
    if (what === 'am' || what === 'beide') {
      const L = await mixaCopy(r.ch[0]), Rr = await mixaCopy(r.ch[1]);
      const lat = Math.round((AU.compLat || FX.COMP_LATENCY) * sr), ziel = MIXA.ziel;
      const P = await mixaCall({op: 'am', L, R: Rr, sr, o: {ziel, ceil: -1, bpm: r.bpm, lat}}, [L.buffer, Rr.buffer]);
      if (!P) { toast('Song zu leise zum Messen'); MIXA.am = null; }
      else MIXA.am = {P, ziel, sig, at: Date.now()};
    }
    out.ms = Math.round(performance.now() - T0); MIXA.last = out;
    return out;
  } catch (e) {
    const m = String(e && e.message || e); if (m !== 'abgebrochen') { if (!/Song|Läuft|Aufnahme|Wiedergabe/.test(m)) logErr(e); toast('Mix-Analyse: ' + m); }
    return null;
  } finally { MIXA.busy = false; MIXA.prog = 0; mixaPaint(true); amPaint(true); }
}
// Vorschläge übernehmen: list = [{i, s}] – ein Undo-Schritt
function mixaApply(list, label) {
  const before = mixaSnap(), did = [];
  for (const {i, s} of list) { if (!s || !s.patch || !S.tracks[i] || mixaIsApplied(i, s)) continue; MIXA.done.set(i + ':' + s.id, mixaPatchGet(i, s.patch)); mixaPatchSet(i, s.patch); did.push(i); }
  if (!did.length) return false;
  undoPush({kind: 'mixa', before, label}); mixaAfter([...new Set(did)], list.some(x => x.s && x.s.patch && x.s.patch.bus));
  return true;
}
function mixaRevert(i, s) {
  const k = i + ':' + s.id, prev = MIXA.done.get(k); if (!prev) return false;
  const before = mixaSnap(); mixaPatchSet(i, prev); MIXA.done.delete(k);
  undoPush({kind: 'mixa', before, label: 'Mix: ' + s.titel + ' zurück'}); mixaAfter([i], !!prev.bus);
  return true;
}
function mixaSug(i, id) { const r = MIXA.res; if (!r) return null; const k = r.T.findIndex(t => t.i === i); return k < 0 ? null : (r.sug[k] || []).find(s => s.id === id) || null; }
function mixaAll() {
  const r = MIXA.res; if (!r) return false; const L = [];
  r.T.forEach((t, k) => (r.sug[k] || []).forEach(s => { if (s.patch && s.art !== 'option' && !mixaIsApplied(t.i, s)) L.push({i: t.i, s}); }));
  return mixaApply(L, 'Mix: alle Vorschläge');
}
// Auto-Master übernehmen / aus (je ein Undo-Schritt)
function amApply() {
  const a = MIXA.am; if (!a) return false;
  const before = mixaSnap(), P = a.P; S.fxBus.am = mixaNormAm({on: true, ziel: a.ziel, lo: P.lo, hi: P.hi, thr: P.thr, ra: P.ra, at: P.at, rl: P.rl, gain: P.gain, ceil: P.ceil});
  if (before === mixaSnap()) return false;
  undoPush({kind: 'mixa', before, label: 'Auto-Master ' + a.ziel + ' LUFS'}); mixaAfter([], true); return true;
}
function amOff() { if (!S.fxBus.am) return false; const before = mixaSnap(); delete S.fxBus.am; MIXA.ab = false; undoPush({kind: 'mixa', before, label: 'Auto-Master aus'}); mixaAfter([], true); return true; }

/* ---------- Blätter ---------- */
const MIXA_CLS = {bass: 'Bass', arp: 'Sequenz/Arp', pad: 'Fläche/Pad', lead: 'Lead', drums: 'Drums', voc: 'Gesang/Chor'};
const mixaF = (v, d) => (v == null || !isFinite(v) ? '–' : (v < 0 ? MINUS : '') + fmtDec(Math.abs(v), d == null ? 1 : d));
const mixaNote = n => (n == null ? '–' : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][((Math.round(n) % 12) + 12) % 12] + (Math.floor(Math.round(n) / 12) - 1));
function mixaProg() { const p = UI.pop && (UI.pop.name === 'mixa' || UI.pop.name === 'am') ? UI.pop.el.querySelector('.mxprog') : null; if (p) p.textContent = 'rechnet … ' + Math.round(MIXA.prog * 100) + ' %'; }
function mixaBtns() {
  const d = el('div', 'mxab');
  d.innerHTML = '<button class="mbtn rb" data-a="am">AUTO-MASTER</button><button class="mbtn rb" data-a="mix">MIX-ASSISTENT</button>';
  guardTouch(d);
  onTap(d, b => { haptic('tick'); if (b.dataset.a === 'am') amSheet(b); else mixaSheet(b); }, 'button[data-a]');
  return d;
}
function mixaSheet(anchor) {
  openPop(null, p => { p.classList.add('tksheet', 'mxsheet', 'pan-y'); guardTouch(p); mixaPaint(true, p);
    onTap(p, b => {
      const a = b.dataset.a, i = +b.dataset.i, s = a === 'ok' || a === 'back' ? mixaSug(i, b.dataset.s) : null;
      if (a === 'go') { mixaMeasure('mix'); haptic('pop'); }
      else if (a === 'all') { if (mixaAll()) haptic('pop'); }
      else if (a === 'ok' && s) { if (mixaApply([{i, s}], 'Mix: ' + S.tracks[i].name + ' ' + s.titel)) haptic('pop'); }
      else if (a === 'back' && s) { if (mixaRevert(i, s)) haptic('tick'); }
      else if (a === 'x') closePop();
    }, 'button[data-a]');
  }, {name: 'mixa'});
  return true;
}
function mixaPaint(full, el0) {
  const p = el0 || (UI.pop && UI.pop.name === 'mixa' ? UI.pop.el : null); if (!p) return;
  const r = MIXA.res, old = r && r.sig !== mixaStateSig(), busy = !!MIXA.busy, sc = p.scrollTop;
  let h = `<h4>Mix-Assistent</h4><div class="small">Erkennt Rolle und Charakter jeder Spur (Noten, Hüllkurve, Frequenzbild, Dynamik) und schlägt Werkzeuge vor. Nichts ändert sich ohne Tipp.</div>` +
    `<div class="mxtop"><button class="mbtn rb" data-a="go"${busy ? ' disabled' : ''}>${r ? 'Neu analysieren' : 'Analysieren'}</button><button class="mbtn rb" data-a="all"${r && !busy ? '' : ' disabled'}>Alle übernehmen</button><button class="mbtn rb" data-a="x">Fertig</button></div>` +
    `<div class="small mxst">${busy ? '<span class="mxprog">rechnet … ' + Math.round(MIXA.prog * 100) + ' %</span>' : r ? (old ? 'Mix geändert seit der Analyse – neu analysieren' : 'Analyse ' + r.T.length + ' Spuren') : 'Noch nicht analysiert'}</div>`;
  if (r) {
    r.T.forEach((t, k) => {
      const f = t.f || {}, ns = t.ns, L = r.sug[k] || [];
      h += `<div class="mxcard"><div class="mxhd"><b>${esc(t.name)}</b> <span class="mxcl">${f.silent ? 'still' : esc(MIXA_CLS[t.cls] || t.cls) + ' · ' + esc(t.chr)}</span></div>`;
      if (!f.silent) h += `<div class="small mxkv">${ns ? 'Lage ' + mixaNote(ns.medP) + ' · ' + fmtDec(ns.dens, 1) + ' Einsätze/Schlag · Länge ' + fmtDec(ns.durB, 2) + ' Schl. · ' : ''}Attack ${f.att == null ? '–' : Math.round(f.att) + ' ms'} · Schwerpunkt ${f.cen} Hz · Tiefen ${mixaF(f.lowDb)} dB · Höhen ${mixaF(f.hiDb)} dB · Crest ${mixaF(f.crest)} dB · ${mixaF(f.I)} LUFS</div>`;
      for (const s of L) {
        const ap = s.patch && mixaIsApplied(t.i, s), can = MIXA.done.has(t.i + ':' + s.id);
        const btn = !s.patch ? '' : ap ? (can ? `<button class="mbtn rb" data-a="back" data-i="${t.i}" data-s="${esc(s.id)}">Zurück</button>` : `<button class="mbtn rb" disabled aria-pressed="true">Übernommen</button>`) : `<button class="mbtn rb" data-a="ok" data-i="${t.i}" data-s="${esc(s.id)}"${busy ? ' disabled' : ''}>Übernehmen</button>`;
        h += `<div class="mxsg${ap ? ' on' : ''}"><div class="mxtx"><b>${esc(s.titel)}</b> ${esc(s.text)}${s.why ? '<div class="small">' + esc(s.why) + '</div>' : ''}</div>${btn}</div>`;
      }
      h += '</div>';
    });
  }
  p.innerHTML = h; p.scrollTop = sc;
  if (p.isConnected) popFit(p);
}
function amSheet(anchor) {
  openPop(null, p => { p.classList.add('tksheet', 'mxsheet', 'pan-y'); guardTouch(p); amPaint(true, p);
    onTap(p, b => {
      const a = b.dataset.a;
      if (a === 'z') { MIXA.ziel = +b.dataset.v; if (MIXA.am && MIXA.am.ziel !== MIXA.ziel) MIXA.am = null; amPaint(true); haptic('tick'); }
      else if (a === 'go') { mixaMeasure('am'); haptic('pop'); }
      else if (a === 'ok') { if (amApply()) haptic('pop'); }
      else if (a === 'ab') { mixaAB(); haptic('tick'); }
      else if (a === 'off') { if (amOff()) haptic('tick'); }
      else if (a === 'x') closePop();
    }, 'button[data-a]');
  }, {name: 'am', onClose: () => { if (MIXA.ab) mixaAB(false); }});
  return true;
}
function amPaint(full, el0) {
  const p = el0 || (UI.pop && UI.pop.name === 'am' ? UI.pop.el : null); if (!p) return;
  const a = MIXA.am, on = S.fxBus.am && S.fxBus.am.on ? S.fxBus.am : null, busy = !!MIXA.busy, P = a && a.P, I = P && P.info, old = a && a.sig !== mixaStateSig();
  const same = on && P && ['lo', 'hi', 'thr', 'ra', 'at', 'rl', 'gain', 'ceil'].every(k => Math.abs(on[k] - P[k]) < 0.006) && on.ziel === a.ziel;
  let h = `<h4>Auto-Master</h4><div class="small">Bus-Kompressor · EQ-Neigung · Pegel · True-Peak-Limiter −1 dBTP – im Video und im GarageBand-Instrumental gleich.</div>` +
    `<div class="mxz" role="group" aria-label="Ziel-Lautheit">${MIXA_ZIELE.map(([v, l]) => `<button class="mbtn rb" data-a="z" data-v="${v}"${MIXA.ziel === v ? ' aria-pressed="true"' : ''}${busy ? ' disabled' : ''}>${esc(l)}</button>`).join('')}</div>` +
    `<div class="mxtop"><button class="mbtn rb" data-a="go"${busy ? ' disabled' : ''}>Messen</button><button class="mbtn rb" data-a="ok"${P && !busy && !same ? '' : ' disabled'}>Übernehmen</button>` +
    `<button class="mbtn rb" data-a="ab"${on ? '' : ' disabled'}${MIXA.ab ? ' aria-pressed="true"' : ''}>${MIXA.ab ? 'Vorher' : 'Nachher'}</button><button class="mbtn rb" data-a="off"${on ? '' : ' disabled'}>Aus</button></div>` +
    `<div class="small mxst">${busy ? '<span class="mxprog">rechnet … ' + Math.round(MIXA.prog * 100) + ' %</span>' : on ? 'An: ' + on.ziel + ' LUFS' + (MIXA.ab ? ' · du hörst VORHER' : '') + (old ? ' · Mix geändert – neu messen' : '') : P ? 'Vorschlag bereit – Übernehmen' : 'Ziel wählen und messen (Song einmal offline)'}</div>`;
  if (P && I) {
    const row = (k, v) => `<div class="mxrow"><span>${k}</span><b>${v}</b></div>`;
    h += '<div class="mxgrid">' + row('Lautheit', mixaF(I.lin) + ' → ' + mixaF(I.lout) + ' LUFS') + row('True-Peak', mixaF(I.tp) + ' dBTP') + row('Dynamik (LRA)', fmtDec(I.lraIn, 1) + ' → ' + fmtDec(I.lraOut, 1) + ' LU') +
      row('EQ-Neigung', 'Tief ' + (P.lo > 0 ? '+' : '') + mixaF(P.lo) + ' · Hoch ' + (P.hi > 0 ? '+' : '') + mixaF(P.hi) + ' dB') + row('Bus-Kompressor', fmtDec(P.ra, 1) + ' : 1 · ' + mixaF(P.thr) + ' dB · ' + P.at + '/' + P.rl + ' ms · max ' + mixaF(I.compMax) + ' dB') +
      row('Pegel', (P.gain > 0 ? '+' : '') + mixaF(P.gain, 2) + ' dB') + row('Limiter', 'max ' + mixaF(I.limMax) + ' dB · Mittel ' + mixaF(I.limAvg) + ' dB') + '</div>';
    if (I.limAvg > 2) h += '<div class="small mxwarn">Der Limiter arbeitet viel – „Streaming −14“ klingt offener.</div>';
  }
  p.innerHTML = h;
  if (p.isConnected) popFit(p);
}

/* ---------- Test-Schnittstelle ---------- */
const MIXA_API = {
  mixaInfo: () => ({busy: MIXA.busy, how: MIXA.how, err: MIXA.err, res: MIXA.res ? {T: MIXA.res.T.map(t => ({i: t.i, name: t.name, cls: t.cls, chr: t.chr, sc: t.sc, f: t.f, ns: t.ns})), sug: MIXA.res.sug, secs: MIXA.res.secs} : null,
    am: MIXA.am, amOn: S.fxBus.am || null, ab: MIXA.ab, last: MIXA.last, ziel: MIXA.ziel,
    nodes: {tracks: AU.tracks.map(A => (A && A.mixa ? {sig: A.mixa.sig, off: !!A.mixa.off, secV: A.mixa.secV} : null)), master: AU.M && AU.M.am ? {on: !!AU.M.am.on, node: !!AU.M.am.node, lat: AU.M.am.lat} : null}}),
  mixaAnalyze: () => mixaMeasure('mix'),
  mixaMeasureAm: ziel => { if (ziel != null) MIXA.ziel = ziel; return mixaMeasure('am'); },
  mixaApply: (i, id) => { const s = mixaSug(i, id); return s ? mixaApply([{i, s}], 'Mix: ' + s.titel) : false; },
  mixaRevert: (i, id) => { const s = mixaSug(i, id); return s ? mixaRevert(i, s) : false; },
  mixaAll: () => mixaAll(),
  amApply: () => amApply(), amOff: () => amOff(), amAB: v => mixaAB(v),
  mixaSheet: () => mixaSheet(), amSheet: () => amSheet(), mixaClose: () => { if (UI.pop && (UI.pop.name === 'mixa' || UI.pop.name === 'am')) closePop(); return true; },
  mixaCore: () => mixaDspMake(),
  mixaNoteStats: i => mixaNoteStats(i), mixaSections: () => mixaSections()
};
