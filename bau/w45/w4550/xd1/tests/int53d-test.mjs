// XD1-Kopie (Punkt 5): Schließen des Klang-Editors beendet den Vergleich jetzt auf NACHHER – „Vorher bei geschlossenem Editor“ gibt es nicht mehr.
// Darum bleibt der Editor hier offen (der Vergleich ist sichtbar, das ist der Vorher-Zustand, der beim Export noch vorkommen kann); sonst unverändert.
// INT53D-Test: die vier Randfälle der Schlussprüfung zu INT53C (Export = Nachher-Stand, hörbar/sichtbar bleibt VORHER).
//  D1 Aufnahme-Weg: Fehler beim Zeichnen eines Bildes → sauberes Ende mit Meldung, Vorher exakt zurück, nächster Export geht
//  D2 „Chor sauber“ / „Refrain groß“ auf Vorher: alle vier Projektdatei-Wege enthalten den Nachher-Stand, zu hören und im Projekt bleibt Vorher
//  D3 Abbruch, bevor der Offline-Durchlauf begonnen hat: „abgebrochen“ erst, wenn alles zurück ist; sofortiger Neustart geht; NACHHER-Tipp bleibt
//  D4 Verlauf: eine Änderung kurz vor dem Export kommt mit dem echten Stand in den Verlauf (kein geliehener Wert, kein zweiter Eintrag)
// Aufruf: node int53d-test.mjs <index.html> <ausgabe-ordner>   (Zeilen OK/FEHLER, Abschluss „INT53D: n/m bestanden“; hochkant 428×926)
// Gegenlauf: dieselbe Prüfung auf dem Stand davor (…/m3/int53d/index-vor-d.html) → D1–D4 schlagen an.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';
const [file, out] = process.argv.slice(2);
if (!file || !out) { console.log('FEHLER Aufruf: node int53d-test.mjs <index.html> <ausgabe-ordner>'); process.exit(2); }
fs.mkdirSync(out, {recursive: true});
const res = []; const ok = (name, pass, info) => { res.push({name, pass: !!pass, info}); console.log((pass ? 'OK ' : 'FEHLER ') + name + (info !== undefined ? '  ' + JSON.stringify(info).slice(0, 1500) : '')); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const VP = {p: [428, 926], q: [926, 428]};
async function open(vk) {
  const [w, h] = VP[vk];
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e && e.stack || e).slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto('file://' + path.resolve(file)); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 90000}); await p.waitForTimeout(1300);
  await p.mouse.click(Math.round(w / 2), Math.round(h / 3)).catch(() => {});
  await p.evaluate(() => {
    window.__w = ms => new Promise(r => setTimeout(r, ms));
    // Hörzustand der Live-Kette: alle AudioParam-Werte unter AU.tracks / AU.M / AU.fx
    window.__params = () => {
      const out = {}, seen = new Set(), PN = ['gain', 'frequency', 'Q', 'detune', 'pan', 'threshold', 'ratio', 'knee', 'attack', 'release', 'delayTime', 'offset', 'playbackRate'];
      const walk = (o, k, d) => {
        if (!o || typeof o !== 'object' || seen.has(o) || d > 4) return; seen.add(o);
        if (typeof AudioNode !== 'undefined' && o instanceof AudioNode) { for (const n of PN) { const pp = o[n]; if (pp && typeof pp.value === 'number') out[k + '.' + n] = +pp.value.toFixed(5); } if (o.parameters && o.parameters.forEach) o.parameters.forEach((pp, n) => { out[k + '.@' + n] = +pp.value.toFixed(5); }); return; }
        if (Array.isArray(o)) { o.forEach((x, i) => walk(x, k + '[' + i + ']', d + 1)); return; }
        if (o instanceof Map || o instanceof Set || ArrayBuffer.isView(o) || o instanceof AudioBuffer) return;
        for (const kk of Object.keys(o)) { let v; try { v = o[kk]; } catch (e) { continue; } if (v && typeof v === 'object') walk(v, k + '.' + kk, d + 1); }
      };
      walk(AU.tracks, 'T', 0); walk(AU.M, 'M', 0); if (AU.fx) walk(AU.fx, 'F', 0); return out;
    };
    window.__pdiff = (a, c) => { const d = []; for (const k of new Set([...Object.keys(a), ...Object.keys(c)])) if (a[k] !== c[k]) d.push([k, a[k], c[k]]); return d; };
    window.__stk = () => { const j = x => { try { return JSON.stringify(x); } catch (e) { return 'ERR'; } }; return {uj: j(UNDO), rj: j(REDO)}; };
    window.__bar = () => { const e = PSH.dock && PSH.dock.el.querySelector('.mxgst'); return e ? e.textContent.replace(/\s+/g, ' ') : null; };
    // Klang-Editor: Cutoff einer Synth-Spur geändert (Nachher), A/B auf Original (Vorher), Editor offen (XD1: zu = Nachher)
    window.__sndSetup = async () => {
      const D = SYNQUENZER; D.loadDemo(); D.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); ensureAudio(); await __w(400);
      const i = S.tracks.findIndex(t => t.kind === 'synth' && !percIs(t) && originRec(t.sound) && t.sound.engine !== 'mk' && t.sound.engine !== 'bm');
      R.selT = i; openEditor(); await __w(300);
      const s_ = deep(S.tracks[i].sound), cut0 = s_.p.cutoff; s_.p.cutoff = Math.max(0.02, (+s_.p.cutoff || 0.5) * 0.12); applySound(i, s_); const cutE = S.tracks[i].sound.p.cutoff; await __w(150);
      toggleAB(i); await __w(200); /* XD1: Editor bleibt offen */ await __w(400);
      return {i, cut0, cutE, orig: S.tracks[i].sound, side: UI.ab && UI.ab.side};
    };
    // Chor: Lead-Take + eigene Chorstimme (Szene 3), „Chor sauber“ bzw. „Refrain groß“, Chor-Blatt auf Vorher und abgelegt
    window.__chorSetup = async (op, ownVoice, leadFx) => {
      const D = SYNQUENZER, sr = 48000, N = Math.round(4 * sr);
      const ON = [0.30, 0.80, 1.30, 1.80, 2.45, 2.95, 3.45], MI = [64, 67, 69, 67, 64, 62, 60], JIT = [0.028, -0.032, 0.018, -0.036, 0.025, -0.022, 0.034];
      const syl = (jit, ct) => { const x = new Float32Array(N); ON.forEach((t0, k) => { const f0 = 440 * Math.pow(2, (MI[k] - 69 + ct / 100) / 12), a = Math.round((t0 + jit[k]) * sr), n = Math.round(0.34 * sr);
        for (let i = 0; i < n && a + i < N; i++) { const t = i / sr, env = Math.min(1, t / 0.006) * (t > 0.3 ? Math.max(0, 1 - (t - 0.3) / 0.04) : 1); let s = 0; for (let h = 1; h * f0 < 4000; h++) { const f = h * f0, ww = Math.exp(-Math.pow((f - 750) / 260, 2)) + 0.6 * Math.exp(-Math.pow((f - 1200) / 300, 2)); s += ww * Math.sin(2 * Math.PI * f * t) / Math.sqrt(h); } x[a + i] += env * s; } });
        let m = 0; for (const v of x) m = Math.max(m, Math.abs(v)); return Int16Array.from(x, v => Math.round(v / m * 0.5 * 32767)); };
      D.loadDemo(); ensureAudio(); await __w(300);
      const L = await D.tkInject({pcm: Array.from(syl(ON.map(() => 0), 0)), sr, scene: 2, len: 2}); const rr = {t: L.track, s: L.scene};
      const st = stimmeT();
      if (ownVoice) {
        const vid = await D.mix3.testTake(Array.from(syl(JIT, 18)), sr);
        S.tracks[st].chor = {lanes: [{id: 'c1', role: 'free', name: 'Chor eigene Stimme'}]};
        D.g6pPut(rr, {v: 2, grp: {below: 8, hp: 120, mid: -2, midF: 400, air: 2, sib: 0, rev: 0.3, pre: 'aus', dly: 0.1}, voices: [{lane: 'c1', rule: 'free', n: ON.map((t, k) => ({t0: t, t1: t + 0.34, m: MI[k], d: 0, iv: 0})), db: -3, pan: 0.5, w: 0.2, dbl: [{ms: 0, ct: 0, p: 0}], take: {take: vid, in: 0, out: +(N / sr).toFixed(6), at: 0}, dblOff: true}]});
      }
      if (leadFx) { const f = S.tracks[st].sound && S.tracks[st].sound.fx; if (f) { f.rev = 0.3; f.dly = 0.2; } }
      D.songFromChain([{scene: 2, bars: 2}]); await __w(300);
      const done = op === 'big' ? await D.mix3.big(null, rr) : await D.mix3.clean(rr); D.g6Sheet(rr); await __w(800);
      const projN = serialize();
      ch1AB('A'); await __w(500); const side = ch1AbSide(); pshDock(); await __w(300);
      return {rr, done, side, docked: !!(PSH.dock && PSH.dock.name === 'chor'), projN};
    };
    // die vier Projektdatei-Wege: .json, ZIP (projekt.json), Alles sichern, Übergabe-Link → Projekt-Teil als Text
    window.__files = async () => {
      const files = [], d0 = window.deliver, z0 = window.buildZip;
      window.deliver = async (base, bytes, kind) => { if (kind === 'json') files.push({kind: 'json', text: new TextDecoder().decode(bytes)}); return 'test'; };
      window.buildZip = fl => { const f = fl.find(x => x.name === 'projekt.json'); files.push({kind: 'zip', text: f ? new TextDecoder().decode(f.data) : null}); return z0(fl); };
      try { await saveFile(); VA1.direct = true; try { await tkExportZip(); } finally { VA1.direct = false; } await backupAll(); } finally { window.deliver = d0; window.buildZip = z0; }
      const u = await cloudHandoffUrl(), h = decodeURIComponent(u.split('#import=')[1] || ''), bb = unb64u(h.slice(1));
      const hand = h[0] === 'z' ? new TextDecoder().decode(new Uint8Array(await new Response(new Blob([bb]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())) : new TextDecoder().decode(bb);
      const strip = t => { if (!t) return null; let j = JSON.parse(t); if (j.kind === 'backup') j = j.projects[0]; delete j.saved; delete j.history; return JSON.stringify(j.project || j); };
      const json = files.filter(f => f.kind === 'json'), zip = files.find(f => f.kind === 'zip');
      return {json: strip(json[0] && json[0].text), zip: strip(zip && zip.text), alles: strip(json[1] && json[1].text), uebergabe: strip(hand)};
    };
    window.__strip = s => { const j = JSON.parse(s); delete j.saved; delete j.history; return JSON.stringify(j.project || j); };
  });
  return {ctx, p, errs};
}

/* ============ D1: Aufnahme-Weg (Bild in Echtzeit) – Fehler beim Zeichnen eines Bildes ============ */
async function testD1(vk) {
  const {ctx, p, errs} = await open(vk);
  for (const sc of ['snd', 'mx2']) {
    const r = await p.evaluate(async (sc) => {
      const D = SYNQUENZER, o = {sc};
      let key;
      if (sc === 'snd') { const x = await __sndSetup(); key = () => { const c = S.tracks[x.i].sound.p.cutoff; return c === x.cutE ? 'N' : c === x.cut0 && S.tracks[x.i].sound === x.orig ? 'V' : '?' + c; }; o.side = x.side; }
      else {
        D.loadDemo(); D.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); ensureAudio(); await __w(400);
        D.mx2Sheet(); await __w(300); await D.mx2Way('mix'); await __w(2500);
        const sN = mx2Snap(); D.mx2AB('A'); await __w(300); const sV = mx2Snap(); pshDock(); await __w(300);
        key = () => { const s = mx2Snap(); return s === sN ? 'N' : s === sV ? 'V' : '?'; }; o.side = mx2Side();
      }
      const st = () => ({key: key(), n: INT53C.n, hold: !!INT53C.hold, mute: VD3.mute | 0, job: !!VV.job, busy: !!VV.busy, off: !!VV.off, proj: serialize(), stk: __stk(), bar: __bar(), side: sc === 'mx2' ? mx2Side() : UI.ab && UI.ab.side});
      const cmp = (a, c) => ['key', 'n', 'hold', 'mute', 'job', 'busy', 'off', 'proj', 'bar', 'side'].filter(k => a[k] !== c[k]).concat(a.stk.uj !== c.stk.uj ? ['UNDO'] : [], a.stk.rj !== c.stk.rj ? ['REDO'] : []);
      D.vvOpen(); await __w(500); const s0 = st(), par0 = __params();
      const toasts = []; const t0 = window.toast; window.toast = function (m, ...a) { toasts.push(String(m).slice(0, 100)); return t0.call(this, m, ...a); };
      // über den Knopf „Video erstellen“ (vvGo): das 15. Song-Bild wirft (im Halten, der Ton ist fertig)
      let fail = 15; const g0 = window.vvDraw; window.vvDraw = function (...a) { if (fail > 0 && VV.job && !VV.off && INT53C.hold && --fail === 0) throw new Error('Testfehler beim Zeichnen'); return g0.apply(this, a); };
      D.vvTest({noVE: true}); const T0 = performance.now(); D.vvGo();
      while (performance.now() - T0 < 45000 && (VV.busy || VV.job)) await __w(100);
      o.ms = Math.round(performance.now() - T0); o.haengt = !!(VV.busy || VV.job); o.fail = fail;
      window.vvDraw = g0; await __w(600);
      const s1 = st(); o.diff = cmp(s0, s1); o.st1 = {key: s1.key, n: s1.n, hold: s1.hold, mute: s1.mute, job: s1.job, busy: s1.busy, side: s1.side, bar: s1.bar && s1.bar.slice(0, 60)};
      o.toasts = toasts.slice(); o.meldung = toasts.find(t => /Video fehlgeschlagen/.test(t)) || null; o.par = __pdiff(par0, __params()).length;
      // der nächste Export geht (Aufnahme-Weg, normal) – Bild = Nachher, danach exakt Vorher
      toasts.length = 0; let frames = {}; const g1 = window.vvDraw; window.vvDraw = function (...a) { if (VV.job) { const k = key() + (INT53C.n ? 'n' : ''); frames[k] = (frames[k] || 0) + 1; } return g1.apply(this, a); };
      let res2 = null; try { res2 = await D.vvMake({fmt: '9:16', vd3: {mo: false}}); } catch (e) { o.err2 = String(e && e.message || e); }
      window.vvDraw = g1; D.vvTest({}); window.toast = t0; await __w(600);
      const s2 = st(); o.next = {how: res2 && res2.how, frames, diff: cmp(s0, s2), cur: D.vid5.info().cur};
      D.vvClose(); await __w(300);
      return o;
    }, sc);
    ok(`[${vk}] D1 ${sc === 'snd' ? 'Klang-Editor auf Original' : 'Mix & Master abgelegt auf Vorher'}, Aufnahme-Weg, Fehler beim Zeichnen: der Auftrag endet (hängt nicht) mit „Video fehlgeschlagen: …“`,
      !r.haengt && r.fail === 0 && r.meldung && /Testfehler beim Zeichnen/.test(r.meldung), {ms: r.ms, meldung: r.meldung, toasts: r.toasts, haengt: r.haengt});
    ok(`[${vk}] D1 ${sc}: danach exakt Vorher (Projekt, ↶/↷, Leiste/Seite, nichts geliehen, kein Making-of-Stumm, Live-Kette gleich)`, !r.haengt && !r.diff.length && r.st1.key === 'V' && r.st1.n === 0 && !r.st1.hold && r.st1.mute === 0 && r.par === 0, {diff: r.diff, st: r.st1, par: r.par});
    ok(`[${vk}] D1 ${sc}: der nächste Export geht (Aufnahme-Weg, jedes Bild Nachher), danach exakt Vorher`, r.next.how === 'recorder' && Object.keys(r.next.frames).join() === 'Nn' && !r.next.diff.length, {next: r.next, err: r.err2});
  }
  ok(`[${vk}] D1 keine Fehler auf der Seite (außer dem Testfehler)`, !errs.filter(e => !/Testfehler beim Zeichnen/.test(e)).length, errs.slice(0, 4));
  await ctx.close();
}

/* ============ D2: Projektdatei bei „Chor sauber“ / „Refrain groß“ auf Vorher ============ */
async function testD2(vk) {
  const {ctx, p, errs} = await open(vk);
  const cases = [['clean', true, false, 'Chor sauber (eigene Chorstimme)'], ['big', false, false, 'Refrain groß'], ['big', false, true, 'Refrain groß mit Lead-Hall (Strophe trocken)']];
  for (const [op, own, fx, label] of cases) {
    const r = await p.evaluate(async ([op, own, fx]) => {
      const o = {}, x = await __chorSetup(op, own, fx); o.done = x.done; o.side = x.side; o.docked = x.docked;
      const projV = serialize(), stk0 = __stk(), par0 = __params(), t = x.rr.t, s = x.rr.s, clip0 = S.tracks[t].clips[s], song0 = S.song, takes0 = S.takes, chor0 = S.tracks[t].chor;
      const red = REDO[REDO.length - 1]; o.kinds = red && red.items ? red.items.map(it => it.kind) : null; o.differ = projV !== x.projN;
      const f = await __files(); const N = __strip(x.projN), V = __strip(projV);
      const cls = q => (q === N ? 'NACHHER' : q === V ? 'VORHER' : q == null ? 'fehlt' : 'weder noch');
      o.dateien = Object.fromEntries(Object.entries(f).map(([k, q]) => [k, cls(q)]));
      o.danach = {proj: serialize() === projV, undo: __stk().uj === stk0.uj, redo: __stk().rj === stk0.rj, side: ch1AbSide(), docked: !!(PSH.dock && PSH.dock.name === 'chor'),
        objekte: S.tracks[t].clips[s] === clip0 && S.song === song0 && S.takes === takes0 && S.tracks[t].chor === chor0, par: __pdiff(par0, __params()).length,
        info: SYNQUENZER.int53d ? SYNQUENZER.int53d.info() : null, n: INT53C.n};
      // Gegenprobe: Blatt in Vorher geschlossen = verworfen (wie bisher) → die Datei ist Vorher
      pshDockClose(); await __w(300); const Z = __strip(serialize()), g = await __files(); o.zuIstVorher = Z === V; o.zu = Object.values(g).map(q => (q === Z ? 'VORHER' : q === N ? 'NACHHER' : 'weder noch'));
      return o;
    }, [op, own, fx]);
    ok(`[${vk}] D2 ${label} auf Vorher, Chor-Blatt abgelegt: .json, ZIP, Alles sichern, Übergabe = Nachher-Stand`, r.done && r.side === 'A' && r.docked && r.differ && Object.values(r.dateien).every(v => v === 'NACHHER') && Object.keys(r.dateien).length === 4, {dateien: r.dateien, schritte: r.kinds});
    ok(`[${vk}] D2 ${label}: zu hören und im Projekt bleibt Vorher (Projekt, ↶/↷, dieselben Objekte, Live-Kette, Leiste)`, r.danach.proj && r.danach.undo && r.danach.redo && r.danach.side === 'A' && r.danach.docked && r.danach.objekte && r.danach.par === 0 && r.danach.n === 0, r.danach);
    ok(`[${vk}] D2 ${label}: Blatt in Vorher zu (verworfen, wie bisher) → Datei = Vorher`, r.zu.length === 4 && r.zu.every(v => v === 'VORHER'), r.zu);
  }
  // jede Schritt-Art einzeln: Daten-Einsetzen (int53dPut) = echtes undoApply (Projekt gleich), Rückweg = genau die alten Objekte; unbekannte Art → wie bisher
  const r2 = await p.evaluate(async () => {
    const o = {}; if (typeof int53dPut !== 'function') return {fehlt: true};
    const x = await __chorSetup('clean', true, false), st = stimmeT(), t = x.rr.t, s = x.rr.s;
    const one = (it, val) => { const v0 = serialize(), u = int53dPut(it, val), vD = serialize(); if (u) u(); const vB = serialize();
      const h = undoState(it); undoApply(it, val); const vE = serialize(); undoApply(it, h); return {gleich: vD === vE, zurueck: vB === v0, geaendert: vD !== v0}; };
    // Song (Gesang im Song: Stück-Daten) – ein anderer Stand des Songs
    const sg = JSON.parse(songSnapshot()); sg.bars = (sg.bars | 0) + 1; o.song = one({kind: 'song'}, JSON.stringify(sg));
    const cl = cleanClip(S.tracks[t].clips[s]); cl.audio.chor.grp.hp = 175; o.clip = one({kind: 'clip', track: t, scene: s}, cl);
    const tk = JSON.parse(JSON.stringify(S.takes)); const id = Object.keys(tk)[0]; tk[id].cl = 2; o.takes = one({kind: 'takes'}, JSON.stringify(tk));
    const ln = JSON.parse(g6pLanesSnap(st)); ln.lanes[0].name = 'Probe'; o.chorlanes = one({kind: 'chorlanes', track: st}, JSON.stringify(ln));
    const mx = JSON.parse(mixaSnap()); mx.t[st][0] = Object.assign({}, mx.t[st][0] || {}, {hp: 150}); o.mixa = one({kind: 'mixa'}, JSON.stringify(mx));
    // unbekannte Art im ↷-Eintrag: keine Teil-Änderung, Datei wie bisher
    const red = REDO[REDO.length - 1], n0 = red.items.length, v0 = serialize(); red.items.push({kind: 'xyz', before: 'x'});
    const back = int53dCh1Data(); o.unbekannt = {back: !!back, gleich: serialize() === v0}; if (back) back(); red.items.length = n0;
    pshDockClose(); await __w(200); return o;
  });
  const kinds = ['song', 'clip', 'takes', 'chorlanes', 'mixa'];
  ok(`[${vk}] D2 jede Schritt-Art (Song, Clip, Takes, Chor-Spuren, Mischung): nur Daten = echtes ↷ (undoApply), Rückweg exakt`, !r2.fehlt && kinds.every(k => r2[k] && r2[k].gleich && r2[k].zurueck && r2[k].geaendert), r2);
  ok(`[${vk}] D2 unbekannte Schritt-Art: nichts eingesetzt, Datei wie bisher`, !r2.fehlt && r2.unbekannt && !r2.unbekannt.back && r2.unbekannt.gleich, r2.unbekannt);
  ok(`[${vk}] D2 keine Fehler auf der Seite`, !errs.length, errs.slice(0, 4));
  await ctx.close();
}

/* ============ D3: Abbruch, bevor der Offline-Durchlauf begonnen hat ============ */
async function testD3(vk) {
  const {ctx, p, errs} = await open(vk);
  const r = await p.evaluate(async () => {
    const D = SYNQUENZER, o = {}, x = await __sndSetup();
    const st = () => ({n: INT53C.n, hold: !!INT53C.hold, off: !!VV.off, job: !!VV.job, busy: !!VV.busy, cut: S.tracks[x.i].sound.p.cutoff, same: S.tracks[x.i].sound === x.orig});
    D.vvOpen(); await __w(400); const p0 = serialize();
    const early = async () => { const pr = D.vvMake({fmt: '9:16', vd3: {mo: false}}).then(() => 'fertig', e => String(e && e.message || e));
      let k = 0; while (k++ < 4000 && !(INT53C.n > 0 && !VV.off)) await new Promise(r => setTimeout(r, 0)); const at = st(); D.vvCancel(); const end = await pr; return {at, end, after: st()}; };
    // B1: früh abbrechen – direkt nach „abgebrochen“ ist alles zurück
    const w0 = SYNQUENZER.int53d ? SYNQUENZER.int53d.info().waits : 0;
    o.b1 = await early(); o.b1.proj = serialize() === p0; o.b1.waits = (SYNQUENZER.int53d ? SYNQUENZER.int53d.info().waits : 0) - w0;
    let off = 0; for (let k = 0; k < 40; k++) { if (VV.off || INT53C.n) off++; await __w(25); } o.b1.spaeterGeliehen = off;
    // B2: früh abbrechen und sofort neu starten → läuft, am Ende exakt Vorher
    const b2 = await early(); o.b2 = {at: b2.at, end1: b2.end, after1: b2.after};
    let r2 = null; try { r2 = await D.vvMake({fmt: '9:16', vd3: {mo: false}}); o.b2.end2 = 'fertig'; } catch (e) { o.b2.end2 = String(e && e.message || e); }
    await __w(600); o.b2.after2 = st(); o.b2.how = r2 && r2.how; o.b2.proj = serialize() === p0; o.b2.side = UI.ab && UI.ab.side; o.b2.cur = D.vid5.info().cur;
    D.vvClose(); await __w(300);
    return o;
  });
  ok(`[${vk}] D3 Klang-Editor auf Original, Abbruch vor dem Offline-Durchlauf: „abgebrochen“ erst, wenn alles zurück ist (nichts geliehen, Original, kein Durchlauf danach)`,
    r.b1.at.n === 1 && !r.b1.at.off && r.b1.end === 'abgebrochen' && r.b1.after.n === 0 && !r.b1.after.off && !r.b1.after.job && r.b1.after.same && r.b1.proj && r.b1.spaeterGeliehen === 0, r.b1);
  ok(`[${vk}] D3 früh abbrechen und sofort neu starten: der neue Auftrag läuft durch, danach exakt Vorher`, r.b2.end1 === 'abgebrochen' && r.b2.after1.n === 0 && r.b2.end2 === 'fertig' && r.b2.how && r.b2.after2.n === 0 && r.b2.after2.same && r.b2.proj && r.b2.side === 'B' && r.b2.cur === true, r.b2);
  // Mix & Master abgelegt auf Vorher: früh abbrechen, ✕, NACHHER tippen → Leiste und Mix stimmen überein (Mischen bleibt)
  const r3 = await p.evaluate(async () => {
    const D = SYNQUENZER, o = {};
    D.loadDemo(); D.songFromChain([{scene: 0, bars: 8}, {scene: 1, bars: 8}]); ensureAudio(); await __w(400);
    D.mx2Sheet(); await __w(300); await D.mx2Way('mix'); await __w(2500);
    const sN = mx2Snap(); D.mx2AB('A'); await __w(300); const sV = mx2Snap(); pshDock(); await __w(2500);
    const key = () => { const s = mx2Snap(); return s === sN ? 'Nachher' : s === sV ? 'Vorher' : '?'; };
    const st = () => ({hoere: key(), seite: mx2Side(), leiste: (__bar() || '').slice(0, 50), n: INT53C.n, off: !!VV.off});
    D.vvOpen(); await __w(400);
    const pr = D.vvMake({fmt: '9:16', vd3: {mo: false}}).then(() => 'fertig', e => String(e && e.message || e));
    for (let k = 0; k < 4000 && !(INT53C.n > 0); k++) await new Promise(r => setTimeout(r, 0));
    o.vorAbbruch = st(); D.vvCancel(); o.ende = await pr; o.nachAbbruch = st();
    D.vvClose(); await __w(200); o.tipp = D.mx2AB('B'); await __w(300); o.nachTipp = st();
    for (let k = 0; k < 100 && (INT53C.n > 0 || VV.off); k++) await __w(50);
    await __w(1500); mxgSync(); await __w(300); o.ende2 = st();
    pshDockClose(); await __w(200); return o;
  });
  ok(`[${vk}] D3 Mix & Master abgelegt auf Vorher: früh abbrechen → sofort Vorher; ✕ und NACHHER → Leiste NACHHER und Nachher-Mix (Mischen bleibt)`,
    r3.ende === 'abgebrochen' && r3.nachAbbruch.hoere === 'Vorher' && r3.nachAbbruch.n === 0 && !r3.nachAbbruch.off && r3.tipp && r3.nachTipp.hoere === 'Nachher' && r3.ende2.hoere === 'Nachher' && r3.ende2.seite === 'B' && /NACHHER/.test(r3.ende2.leiste), r3);
  ok(`[${vk}] D3 keine Fehler auf der Seite`, !errs.length, errs.slice(0, 4));
  await ctx.close();
}

/* ============ D4: Verlauf – eine Änderung kurz vor dem Export ============ */
async function testD4(vk) {
  const {ctx, p, errs} = await open(vk);
  const r = await p.evaluate(async () => {
    const D = SYNQUENZER, o = {runs: []}, x = await __sndSetup(); await __w(3000);
    const ent = H0 => HIST.cur.strs.slice(H0).map(s => { const j = JSON.parse(s); return (j.d || []).map(d => d.path.split('/').slice(-1)[0] + '=' + JSON.stringify(d.value)).join(','); });
    for (const [nm, fn] of [['Video', () => D.vvMake({fmt: '9:16', vd3: {mo: false}})], ['Aufnahme-Weg', async () => { D.vvTest({noVE: true}); try { return await D.vvMake({fmt: '9:16', vd3: {mo: false}}); } finally { D.vvTest({}); } }], ['WAV Song', () => D.va1Export('song')]]) {
      await __w(2500); histFlush(); await __w(100); const H0 = HIST.cur.strs.length;
      S.name = 'Probe ' + nm; markDirty(); await __w(300);                       // wie Umbenennen: Verlaufs-Timer läuft noch (≤ 2 s)
      const sw = []; const f0 = window.histSweep; window.histSweep = function (...a) { sw.push(INT53C.n); return f0.apply(this, a); };
      try { await fn(); } catch (e) { o.err = String(e); }
      await __w(3500); window.histSweep = f0;
      const e = ent(H0); o.runs.push({nm, eintraege: e, cutoff: e.filter(s => /cutoff/.test(s)).length, name: e.filter(s => s.includes('Probe ' + nm)).length, sweepsGeliehen: sw.filter(n => n > 0).length, hoere: S.tracks[x.i].sound.p.cutoff === x.cut0 && S.tracks[x.i].sound === x.orig});
    }
    // ein Verlaufs-Timer, der WÄHREND des Leihens fällig wird (Änderung im Offline-Durchlauf), und „Seite weg“ (histLeave) im Halten
    await __w(2500); histFlush(); await __w(100); const H1 = HIST.cur.strs.length; let armed = false, left = false;
    const iv = setInterval(() => { if (!armed && UI.vvOff) { armed = true; HIST.lastFlush = performance.now(); S.name = 'Probe Durchlauf'; markDirty(); } if (!left && INT53C.hold) { left = true; histLeave(); } }, 5);
    const sw = []; const f0 = window.histSweep; window.histSweep = function (...a) { sw.push(INT53C.n); return f0.apply(this, a); };
    D.vvTest({noVE: true}); try { await D.vvMake({fmt: '9:16', vd3: {mo: false}}); } catch (e) { o.err2 = String(e); } D.vvTest({}); clearInterval(iv);
    await __w(3500); window.histSweep = f0; const e = ent(H1);
    o.waehrend = {armed, left, eintraege: e, cutoff: e.filter(s => /cutoff/.test(s)).length, name: e.filter(s => s.includes('Probe Durchlauf')).length, sweepsGeliehen: sw.filter(n => n > 0).length};
    o.verify = await histVerify(); o.verify = {ok: o.verify.ok, bad: o.verify.bad ? o.verify.bad.length : null};
    return o;
  });
  for (const x of r.runs) ok(`[${vk}] D4 ${x.nm}: Umbenennen 300 ms vorher → genau ein Verlaufs-Eintrag (der Name), kein geliehener Cutoff, kein Durchgang beim Leihen`, x.name === 1 && x.cutoff === 0 && x.eintraege.length === 1 && x.sweepsGeliehen === 0 && x.hoere, x);
  ok(`[${vk}] D4 Timer im Offline-Durchlauf fällig + „Seite weg“ im Halten: der Eintrag kommt danach mit dem echten Stand (nur der Name)`, r.waehrend.armed && r.waehrend.left && r.waehrend.name === 1 && r.waehrend.cutoff === 0 && r.waehrend.eintraege.length === 1, r.waehrend);
  ok(`[${vk}] D4 Verlauf stimmt mit dem Projekt überein (histVerify)`, r.verify && r.verify.ok !== false, r.verify);
  ok(`[${vk}] D4 keine Fehler auf der Seite`, !errs.length, errs.slice(0, 4));
  await ctx.close();
}

/* ============ Pflicht: Datei ============ */
const html = fs.readFileSync(file, 'utf8');
const brand = ['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Kompakt', 'Clavia'].map(w => [w, html.split(w).length - 1]).filter(x => x[1]);
ok('Pflicht: Markenwörter 0, „MS 2000“ genau 1×, „  live: true,“ genau 1×', !brand.length && html.split('MS 2000').length - 1 === 1 && html.split('  live: true,').length - 1 === 1, {brand, ms: html.split('MS 2000').length - 1, live: html.split('  live: true,').length - 1});
const blk = (html.match(/\/\* INT53D-BEGIN[\s\S]*?INT53D-END \*\//) || [''])[0];
ok('INT53D-Block vorhanden; Einhänge-Stellen (vvEncodeMR, histBusy, histSweep, int53cRender) je 1× mit Kommentar INT53D',
  blk.length > 1500 && [/step1 = \(\) => \{\s+\/\/ INT53D/g, /function histBusy\(\) \{\n[^\n]*INT53C\.n > 0\) return true;\s+\/\/ INT53D/g, /function histSweep\(\) \{\n[^\n]*\n[^\n]*INT53C\.n > 0\) return;\s+\/\/ INT53D/g, /histBusy\(\)\) \{ try \{ histSweep\(\); \} catch \(e\) \{ logErr\(e\); \} \}\s+\/\/ INT53D/g].every(re => (html.match(re) || []).length === 1), {blk: blk.length});
const only = (process.env.ONLY || 'D1,D2,D3,D4').split(',');
const T0 = Date.now();
if (only.includes('D1')) await testD1('p');
if (only.includes('D2')) await testD2('p');
if (only.includes('D3')) await testD3('p');
if (only.includes('D4')) await testD4('p');
console.log(`(${Math.round((Date.now() - T0) / 1000)} s)`);
await b.close();
const n = res.filter(r => r.pass).length;
fs.writeFileSync(path.join(out, 'int53d-test.json'), JSON.stringify(res, null, 1));
console.log(`INT53D: ${n}/${res.length} bestanden`);
process.exit(n === res.length ? 0 : 1);
