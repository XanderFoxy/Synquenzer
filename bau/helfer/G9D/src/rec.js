/* ---------- Erkennung (§6.6, §7.8) – Ablauf ohne Sprachmodell (G9b-V) ----------
   Vorstufe, Stimm-Strecken, Fenster, Rückrechnung und Schutz-Regeln (g9ErkMake) laufen in einem eigenen Worker (G9.w). Das Sprachmodell
   selbst (G9b-0/1/2) ist NICHT gebaut (Freigabe F0 fehlt, §9 Stopp-Punkt 1): G9.asr bleibt leer, [Erkennen] ist ausgeblendet, nichts lädt.
   Andock-Stelle für G9b-2: G9.asr = async (fenster16k: Float32Array, {k, lang, a, b}) → {words: [{text, start, end, p?}], lang?}
   (Zeiten in Sekunden ab Fenster-Beginn). Tests setzen dafür einen Ersatz (g9AsrSim). */
const G9E = g9ErkMake();
function g9AsrSimSet(fn, o) { G9.asr = typeof fn === 'function' ? fn : null; G9.asrO = o || {}; g9RecDock(); return !!G9.asr; }
function g9RecDock() {
  G9.rec = G9.asr ? {cached: () => true, size: () => ({how: G9.sm.how || 'wasm', mb: 0}), recognize: (id, o) => g9RecJob(id, o || {}), remove: async () => {}, stop: () => g9RecStop()} : null;
  if (G9.asr) G9.sm = Object.assign({}, G9.sm, {state: 'ready', how: G9.sm.how || 'wasm'});
  const E = WP.ed; if (E && E.g9 && E.g9.rb) E.g9.rb.hidden = !G9.rec;
}
// eigener Worker für die Vorstufe (Blob, wie VS5a); fehlt er, rechnet der Haupt-Faden
function g9ErkWorker() {
  if (G9.w) return G9.w;
  try {
    const src = g9ErkMake.toString() + '\nconst E = g9ErkMake();onmessage = e => { const m = e.data; try { const p = E.plan(m.x, m.sr, m.o); const r = {win: p.win, map: p.map, segs: p.segs, L: p.L, chunks: p.chunks, lo: p.lo, hi: p.hi, st: p.st}; postMessage({id: m.id, r}, [p.st.buffer]); } catch (err) { postMessage({id: m.id, err: String(err && err.message || err)}); } };';
    const u = URL.createObjectURL(new Blob([src], {type: 'application/javascript'}));
    G9.w = new Worker(u); setTimeout(() => { try { URL.revokeObjectURL(u); } catch (e) {} }, 30000);
    G9.wq = new Map(); G9.wid = G9.wid | 0;
    G9.w.onmessage = e => { const q = G9.wq.get(e.data.id); if (!q) return; G9.wq.delete(e.data.id); if (e.data.err) q.no(new Error(e.data.err)); else q.ok(e.data.r); };
    G9.w.onerror = e => { for (const q of G9.wq.values()) q.no(new Error('worker')); G9.wq.clear(); try { e.preventDefault(); } catch (x) {} };
  } catch (e) { G9.w = null; }
  return G9.w;
}
function g9ErkKill(why) {
  if (G9.w) { try { G9.w.terminate(); } catch (e) {} for (const q of (G9.wq || new Map()).values()) q.no(new Error(why || 'gestoppt')); if (G9.wq) G9.wq.clear(); G9.w = null; G9.killAt = performance.now(); }
}
function g9Plan(x, sr) {
  const w = g9ErkWorker();
  if (!w) return Promise.resolve().then(() => G9E.plan(x, sr));
  return new Promise((ok, no) => { const id = ++G9.wid, c = new Float32Array(x); G9.wq.set(id, {ok, no}); try { w.postMessage({id, x: c, sr}, [c.buffer]); } catch (e) { G9.wq.delete(id); no(e); } });
}
const g9RecBusy = () => [...G9.job.values()].some(j => !j.done);
function g9RecMsg(t) { G9.recMsg = t; const E = WP.ed; if (E && E.g9) wpInfoTxt(g9InfoLine(E, wpMarks(E.id) || [])); }
// ein Erkennungs-Auftrag je Take: Fenster einzeln; fertige Fenster bleiben bei [Stopp] und bei „Aufnahme hat Vorrang“ (§5.5, §6.6.9/10)
function g9RecJob(id, o) {
  let j = G9.job.get(id);
  if (j && !j.done) { j.o = Object.assign(j.o, o); return j.p; }
  j = {id, o, phase: 'warten', next: 0, words: [], p: null, done: false, gen: 0, t0: performance.now(), pl: null, lang: null};
  j.p = new Promise(res => { j.res = res; });
  G9.job.set(id, j);
  g9RecGo(j);
  return j.p;
}
async function g9RecGo(j) {
  if (j.done || j.running) return;
  if (G9.hold || g9MicBusy()) { j.phase = 'wartet'; g9RecMsg('Erkennen wartet (Aufnahme)'); if (!G9.hold) g9MicOn(); return; }
  if (!G9.asr) { g9RecEnd(j, 'kein Sprachmodell'); return; }
  const gen = ++j.gen; j.running = true;
  try {
    try { G9.saves++; if (typeof saveNow === 'function') saveNow(); } catch (e) {}   // §6.6.10: vor jeder Erkennung speichern
    if (!j.pl) {
      j.phase = 'vorstufe';
      tkLoad(j.id); const wt = TK.wait.get(j.id); if (wt) await wt;
      const b = g9FeatSrc(j.id); if (!b) throw new Error('kein Take');
      j.pl = await g9Plan(b.getChannelData(0), b.sampleRate);
      if (gen !== j.gen) return;
    }
    const pl = j.pl, n = pl.win.length;
    j.lang = j.lang || (j.o.lang === 'de' || j.o.lang === 'en' ? j.o.lang : null);
    for (let k = j.next; k < n; k++) {
      if (gen !== j.gen || j.stop) return;
      j.phase = 'fenster'; g9RecMsg('Erkennen … ' + (k + 1) + '/' + n + ' · ' + Math.round(k / n * 100) + ' %');
      const w = pl.win[k], x = pl.st.subarray(Math.round(w.a * G9E.FS), Math.round(w.b * G9E.FS));
      const r = await G9.asr(x, {k, lang: j.lang || 'auto', a: w.a, b: w.b, toTake: s => G9E.streamToTake(pl.map, s), toStream: t => G9E.takeToStream(pl.map, t)});
      if (gen !== j.gen || j.stop) return;                          // beendet, während das Fenster rechnete: Ergebnis verworfen (wie terminate)
      if (!j.lang) j.lang = r && (r.lang === 'en' || r.lang === 'de') ? r.lang : 'de';
      j.words[k] = (r && r.words) || []; j.next = k + 1;
    }
    g9RecEnd(j);
  } catch (e) { if (gen === j.gen && !j.stop) { logErr(e); g9RecEnd(j, String(e && e.message || e)); } }
  finally { if (gen === j.gen) j.running = false; }
}
// Ergebnis ausrichten (§6.6.8): Wort-Zeiten als Anker, feste Silben bleiben; [Erkennen] = ein Undo „Erkennen“, automatisch ohne Schritt (§7.8)
function g9RecEnd(j, err) {
  if (j.done) return; j.done = true; j.running = false;
  const res = {words: [], ms: Math.round(performance.now() - j.t0), how: G9.sm.how || 'wasm', chunks: j.pl ? j.pl.win.length : 0, lang: j.lang || 'de', err: err || null, stopped: !!j.stop, lo: j.pl ? j.pl.lo : 0, hi: j.pl ? j.pl.hi : 0};
  try {
    if (j.pl && j.words.length) {
      const z = G9E.zurueck(j.words, j.pl); res.words = z.words; res.drop = z.drop;
      const m = S.takes && S.takes[j.id], mk = wpMarks(j.id);
      if (m && mk && mk.length && z.words.length) {
        const C = g9Ctx(j.id, true), K = g9K();
        if (j.o.auto && (m.ly || m.lyrics)) { res.discard = true; g9RecMsg('Erkennung verworfen – Text schon da'); }
        else {
          const s = G9E.silben(K, z.words, res.lang, C.mk, C.F, C.ly, j.o.mode === 'fill' ? 'luecken' : 'alles');
          if (j.o.auto) { g9PutLy(m, s, res.lang, 'erkannt'); G9.view.delete(j.id); G9.auto.set(j.id, {ly: m.ly ? JSON.parse(JSON.stringify(m.ly)) : null, lyrics: m.lyrics || null}); markDirty(); UI.dirty.all = true; }
          else g9CommitS(C, s, 'Erkennen', {src: 'erkannt', lang: res.lang});
          const ns = z.words.filter(w => isNum(w.p) && w.p < .6).length;
          g9RecMsg((j.stop ? 'gestoppt · ' : '') + z.words.length + ' Wörter erkannt' + (ns ? ' · ' + ns + ' unsicher' : ''));
          if (WP.ed && WP.ed.id === j.id) { if (WP.ed.g9) g9Fill(WP.ed); wpPaint(); }
        }
      }
    } else g9RecMsg(err ? 'Erkennen fehlgeschlagen' : j.stop ? 'gestoppt' : 'keine Wörter erkannt');
  } catch (e) { logErr(e); res.err = String(e && e.message || e); }
  G9.job.delete(j.id);
  j.res(res);
  setTimeout(g9AutoPump, 0);
}
// [Stopp] (§6.6.9): Worker beenden – sofort; fertige Fenster bleiben und werden ausgerichtet
function g9RecStop() {
  const t0 = performance.now(); g9ErkKill('gestoppt');
  let n = 0; for (const j of G9.job.values()) if (!j.done) { j.stop = true; j.gen++; n++; g9RecEnd(j); }
  G9.stopMs = performance.now() - t0;
  return n > 0;
}
// Aufnahme hat Vorrang (§6.6.10): Worker beenden, angefangenes Fenster verwerfen, job.next merkt das nächste
function g9RecHold() {
  let any = false; for (const j of G9.job.values()) if (!j.done) { any = true; j.gen++; j.running = false; j.phase = 'wartet'; }
  g9ErkKill('Aufnahme'); G9.holdKill = performance.now();
  if (any) g9RecMsg('Erkennen wartet (Aufnahme)');
}
function g9RecResume() { for (const j of G9.job.values()) if (!j.done) g9RecGo(j); g9AutoPump(); }
// [Erkennen]-Blatt (ui.js) ruft das: g9RecRun(id, {lang, mode})
function g9RecRun(id, o) { if (!G9.rec) return Promise.resolve(null); return G9.rec.recognize(id, {lang: o.lang, mode: o.mode}); }

/* ---------- automatisch erkennen (F1, §7.8): nach jeder neuen Aufnahme mit Mikrofon, nur ohne laufendes Mikrofon und bei stehendem ▶,
   höchstens ein Take gleichzeitig, in Aufnahme-Reihenfolge, nur für Takes ohne Text ---------- */
function g9AutoOn() { try { const P = typeof stProf === 'function' ? stProf() : null; return !(P && P.g9 && P.g9.auto === false); } catch (e) { return true; } }
function g9AutoQueue(id) { if (!G9.rec || !g9AutoOn()) return false; (G9.autoQ || (G9.autoQ = [])).push(id); setTimeout(g9AutoPump, 0); return true; }
function g9AutoPump() {
  const q = G9.autoQ; if (!q || !q.length || !G9.rec || g9RecBusy()) return;
  if (G9.hold || g9MicBusy() || R.playing) { clearTimeout(G9.autoT); G9.autoT = setTimeout(g9AutoPump, 500); return; }
  while (q.length) {
    const id = q.shift(), m = S.takes && S.takes[id];
    if (!m || m.ly || m.lyrics || !g9AutoOn()) continue;
    const pf = (typeof stProf === 'function' && stProf()) || {}, lang = (pf.g9 && pf.g9.lang) || 'auto';
    g9RecJob(id, {auto: true, lang, mode: 'all'});
    return;
  }
}
