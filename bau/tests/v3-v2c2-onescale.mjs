// V2c′ „Eine Skala“ – Abnahme (Spec V2c′-01 … -06, dazu Nachtrag 2 / Xander 24.10.: V2c′-07 … -16)
import { open } from './v3-v2d-pw.mjs';
import { mkCheck } from './v3-v2d-lib.mjs';
const OLD = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/VS2b-fix.html';
const {check, done} = mkCheck();
const {b, p, errs} = await open();
const E = (f, a) => p.evaluate(f, a);
const PCs = a => [...new Set(a.map(n => ((n % 12) + 12) % 12))].sort((x, y) => x - y);

// ---------- in-page helpers ----------
await E(() => {
  const Q = window.SYNQUENZER;
  window.__sleep = ms => new Promise(r => setTimeout(r, ms));
  // play clip on track 0 slot 0 under a Träger (chord in TRANSPONIEREN), return the clip notes heard (out) for 2 loops
  window.__heard = async (notes, key, chord, o = {}) => {
    Q.stop(); await __sleep(80);
    Q.setClip(0, 0, {len: 1, key, notes}); if (o.drums) Q.setClip(4, 0, o.drums);
    Q.setBpm(240); Q.play(); Q.launchScene(0); Q.setKbMode('transpose');
    if (chord) { await Q.chord(chord, 60); }
    await __sleep(300); Q.clearLog();
    await __sleep(o.ms || 2200);
    const log = Q.noteLog(4096).filter(e => e.track === 0 && e.src === 'clip');
    Q.stop(); Q.resetCarrier(); Q.setKbMode('play');
    return log.map(e => ({n: e.clipNote, out: e.out, beat: e.beat}));
  };
  // all outPitch results of a clip's notes under the current Träger, using the real clip key object (clip context)
  window.__outs = (t, s, notes) => { const c = S.tracks[t].clips[s]; return notes.map(n => Q.outPitch(t, n, nowT(), c.key)); };
});

// ---------- V2c′-04 (part 1): defaults ----------
let r = await E(() => { const Q = window.SYNQUENZER; const o = {};
  Q.newProject(); o.neu = Q.project().settings.harmony.oneScale;
  Q.newProject({init: true}); o.init = Q.project().settings.harmony.oneScale;
  Q.loadDemo(); o.demo = Q.project().settings.harmony.oneScale;
  const pj = Q.project(); delete pj.settings.harmony.oneScale; delete pj.settings.harmony.osAmt; pj.tracks.forEach(t => delete t.os);
  Q.importJSON(JSON.stringify(pj)); o.old = Q.project().settings.harmony.oneScale;
  return o; });
check('V2c′-04 Neu → an, Leer (Init) → an, Demo → aus, gespeichertes Projekt ohne Feld → aus', r.neu === true && r.init === true && r.demo === false && r.old === false, r);

// ---------- V2c′-01: e-Moll-Clip unter C ----------
await E(() => window.SYNQUENZER.newProject({init: true}));
const EM7 = [64, 66, 67, 69, 71, 72, 74].map((n, i) => ({t: i * .5, d: .4, n, v: .8}));    // E F# G A H C D
const EM5 = [64, 67, 71, 74, 66].map((n, i) => ({t: i * .5, d: .4, n, v: .8}));             // E G H D F# (Spec-Wortlaut)
const KEM = {root: 4, scale: 'aeolian'};
const on7 = await E(([n, k]) => __heard(n, k, [60, 64, 67]), [EM7, KEM]);
await E(() => window.SYNQUENZER.oneScale(false));
const off7 = await E(([n, k]) => __heard(n, k, [60, 64, 67]), [EM7, KEM]);
await E(() => window.SYNQUENZER.oneScale(true));
const on5 = await E(([n, k]) => __heard(n, k, [60, 64, 67]), [EM5, KEM]);
const Cmaj = [0, 2, 4, 5, 7, 9, 11];
check('V2c′-01 an: e-Moll-Clip (7 Töne) unter C – kein F♯, alle Töne in C-Dur', on7.length >= 10 && !on7.some(e => e.out % 12 === 6) && on7.every(e => Cmaj.includes(e.out % 12)), PCs(on7.map(e => e.out)));
check('V2c′-01 aus: wie bisher C-Lydisch (A → F♯)', off7.some(e => e.out % 12 === 6 && e.n === 69), PCs(off7.map(e => e.out)));
check('V2c′-01 Spec-Clip E G H D F♯ unter C an: kein F♯, alle in C-Dur', on5.length >= 8 && on5.every(e => Cmaj.includes(e.out % 12)), PCs(on5.map(e => e.out)));

// ---------- V2c′-02: Gleichstand nach unten (ohne Richtung), in Spielrichtung (Nachtrag 2) ----------
r = await E(() => { const Q = window.SYNQUENZER, H = Q.harmony, C = [0, 2, 4, 5, 7, 9, 11];
  return {d0: H.snapToScale(61, C, 0), dn: H.snapToScale(66, C, -1), up: H.snapToScale(66, C, 1), near: H.snapToScale(70, [0, 2, 4, 5, 7, 8, 11], 1)}; });
check('V2c′-02 Ton genau zwischen zwei Skalentönen: ohne Richtung nach unten (C♯ → C), abwärts F♯ → F, aufwärts F♯ → G', r.d0 === 60 && r.dn === 65 && r.up === 67, r);
check('V2c′-02 kein Gleichstand: nächster Skalenton (B♭ → H in C-Moll harm.)', r.near === 71, r);
const KC = {root: 0, scale: 'ionian'};
const one = await E(k => __heard([{t: 0, d: 1, n: 61, v: .8}], k, [60, 64, 67]), KC);
const asc = await E(k => __heard([{t: 0, d: .9, n: 64, v: .8}, {t: 1, d: .9, n: 66, v: .8}, {t: 2, d: .9, n: 69, v: .8}], k, [60, 64, 67]), KC);
const des = await E(k => __heard([{t: 0, d: .9, n: 69, v: .8}, {t: 1, d: .9, n: 66, v: .8}, {t: 2, d: .9, n: 64, v: .8}], k, [60, 64, 67]), KC);
const outOf = (L, n) => [...new Set(L.filter(e => e.n === n).map(e => e.out))];
check('V2c′-02 App: einzelnes C♯ unter C → C (nach unten)', outOf(one, 61).join() === '60', outOf(one, 61));
check('V2c′-02 App: E F♯ A aufwärts → F♯ wird G; A F♯ E abwärts → F♯ wird F', outOf(asc, 66).join() === '67' && outOf(des, 66).join() === '65', {asc: outOf(asc, 66), des: outOf(des, 66)});

// ---------- grid helpers: recall a Träger and read outPitch with an explicit clip key (no clip context) ----------
await E(() => {
  const Q = window.SYNQUENZER, H = Q.harmony;
  window.__targets = () => { const out = [], Q2 = {maj: [0, 4, 7], min: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], dim: [0, 3, 6], sus4: [0, 5, 7], aug: [0, 4, 8], '5': [0, 7], one: [0]};
    for (let r = 0; r < 12; r++) for (const q in Q2) out.push(H.detectChord(Q2[q].map(x => 60 + r + x))); return out; };
  window.__grid = (modes, keys, notes) => { const res = []; ensureAudio();
    for (const m of modes) { Q.setHarmony(m);
      for (const tg of __targets()) { recallCarrier(tg);
        for (const k of keys) for (const n of notes) res.push(Q.outPitch(0, n, nowT(), k)); } }
    Q.resetCarrier(); return res; };
});
const MODES = [{mode: 'chord', single: 'key'}, {mode: 'chord', single: 'parallel'}, {mode: 'scale'}, {mode: 'chromatic'}, {mode: 'chord', single: 'key', minor: 'dorian', keyAware: false}];
const SCL = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'];
const KEYS = []; for (let r0 = 0; r0 < 12; r0 += 1) for (const s of SCL) KEYS.push({root: r0, scale: s});
const NOTES = []; for (let n = 48; n <= 72; n++) NOTES.push(n);

// ---------- V2c′-04 (part 2): Schalter aus = bitgleich zu 4.5.2 ----------
await E(() => { window.SYNQUENZER.newProject({init: true}); window.SYNQUENZER.oneScale(false); });
const gNewOff = await E(([m, k, n]) => __grid(m, k, n), [MODES, KEYS, NOTES]);
const o = await open({width: 390, height: 844}, OLD);
await o.p.evaluate(() => window.SYNQUENZER.newProject({init: true}));
await o.p.evaluate(() => { const Q = window.SYNQUENZER, H = Q.harmony;
  window.__targets = () => { const out = [], Q2 = {maj: [0, 4, 7], min: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], dim: [0, 3, 6], sus4: [0, 5, 7], aug: [0, 4, 8], '5': [0, 7], one: [0]};
    for (let r = 0; r < 12; r++) for (const q in Q2) out.push(H.detectChord(Q2[q].map(x => 60 + r + x))); return out; };
  window.__grid = (modes, keys, notes) => { const res = []; ensureAudio();
    for (const m of modes) { Q.setHarmony(m); for (const tg of __targets()) { recallCarrier(tg); for (const k of keys) for (const n of notes) res.push(Q.outPitch(0, n, nowT(), k)); } }
    Q.resetCarrier(); return res; }; });
const gOld = await o.p.evaluate(([m, k, n]) => __grid(m, k, n), [MODES, KEYS, NOTES]);
await o.b.close();
let diff = 0; for (let k = 0; k < gOld.length; k++) if (gOld[k] !== gNewOff[k]) diff++;
check(`V2c′-04 aus: ${gOld.length} Abbildungen (5 Harmonie-Einstellungen × 108 Träger × 84 Clip-Tonarten × 25 Töne) bitgleich zu 4.5.2`, gOld.length > 100000 && diff === 0, {n: gOld.length, diff});

// ---------- V2c′-03: leitereigene Clips ändern sich nicht ----------
await E(() => { window.SYNQUENZER.oneScale(true); window.SYNQUENZER.setHarmony({mode: 'chord', single: 'key', minor: 'aeolian', keyAware: true}); });
const DIA = [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72];
r = await E(dia => { const Q = window.SYNQUENZER, H = Q.harmony; ensureAudio(); const keys = [{root: 0, scale: 'ionian'}, {root: 9, scale: 'aeolian'}, {root: 2, scale: 'dorian'}, {root: 7, scale: 'mixolydian'}];
  const tg = []; for (const c of [[60, 64, 67], [62, 65, 69], [64, 67, 71], [65, 69, 72], [67, 71, 74], [69, 72, 76], [71, 74, 77], [60, 64, 67, 71], [62, 65, 69, 72], [67, 71, 74, 77], [69, 72, 76, 79], [71, 74, 77, 81]]) tg.push(H.detectChord(c));
  let n = 0, d = 0; const ex = [];
  for (const m of [{mode: 'chord', single: 'key'}, {mode: 'scale'}]) { Q.setHarmony(m);
    for (const t of tg) { recallCarrier(t);
      for (const k of keys) { const kk = {...k}; for (const x of dia) { const on = Q.outPitch(0, x, nowT(), kk); Q.oneScale(false); const off = Q.outPitch(0, x, nowT(), kk); Q.oneScale(true); n++; if (on !== off) { d++; if (ex.length < 5) ex.push([m.mode, t.name, k.root + k.scale, x, on, off]); } } } } }
  Q.setHarmony({mode: 'chord', single: 'key', minor: 'aeolian', keyAware: true}); Q.resetCarrier(); return {n, d, ex}; }, DIA);
check('V2c′-03 leitereigene Clips (C-Dur/a-Moll/D-Dorisch/G-Mixolyd., 12 leitereigene Träger, AKKORD und TONART): Tonhöhen identisch', r.n >= 1000 && r.d === 0, r);

// ---------- V2c′-07: 7 verschiedene Töne bleiben 7, Kontur bleibt (Xander 24.10.) ----------
r = await E(() => { const Q = window.SYNQUENZER, H = Q.harmony; ensureAudio(); const SC = H.SCALES, names = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'];
  let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const tg = []; for (let r0 = 0; r0 < 12; r0++) for (const q of [[0, 4, 7], [0, 3, 7], [0, 4, 7, 10], [0, 3, 7, 10], [0, 3, 6], [0, 5, 7], [0, 4, 8], [0, 2, 7], [0, 3, 6, 9]]) tg.push(H.detectChord(q.map(x => 60 + r0 + x)));
  let melodies = 0, bad = 0, badC = 0; const ex = [];
  for (let m = 0; m < 40; m++) {
    const key = {root: (rnd() * 12) | 0, scale: names[(rnd() * 7) | 0]}, deg = SC[key.scale].map(x => 60 + key.root + x - (key.root > 5 ? 12 : 0));
    const order = deg.slice().sort(() => rnd() - .5);
    const notes = order.map((n, i) => ({t: i * .5, d: .4, n, v: .8}));
    Q.setClip(0, 0, {len: 1, key: {...key, src: 'user'}, notes});
    for (const t of tg) { recallCarrier(t); const outs = __outs(0, 0, order); melodies++;
      if (new Set(outs).size !== 7) { bad++; if (ex.length < 4) ex.push(['n', key, t.name, order, outs]); }
      for (let k = 1; k < 7; k++) if (Math.sign(outs[k] - outs[k - 1]) !== Math.sign(order[k] - order[k - 1])) { badC++; if (ex.length < 4) ex.push(['c', key, t.name, order, outs]); break; } } }
  Q.resetCarrier(); return {melodies, bad, badC, ex}; });
check('V2c′-07 40 Melodien aus 7 verschiedenen Tönen × 108 Träger: immer 7 verschiedene Töne', r.melodies >= 4000 && r.bad === 0, r);
check('V2c′-07 … und dieselbe Kontur (aufwärts bleibt aufwärts)', r.badC === 0, {badC: r.badC});
// 6 leitereigene + 1 verspielter Ton
r = await E(() => { const Q = window.SYNQUENZER, H = Q.harmony; ensureAudio();
  const notes = [60, 62, 64, 66, 67, 69, 72].map((n, i) => ({t: i * .5, d: .4, n, v: .8}));   // C D E F♯ G A C (Clip C-Dur)
  Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes}); const src = notes.map(n => n.n);
  let bad = 0, n = 0; const ex = [];
  for (const c of [[60, 64, 67], [65, 69, 72], [67, 71, 74], [69, 72, 76], [62, 65, 69], [64, 68, 71], [62, 66, 69], [70, 74, 77]]) { recallCarrier(H.detectChord(c)); const outs = __outs(0, 0, src); n++;
    const Z = Q.oneScaleOf(H.detectChord(c));
    const ok = new Set(outs).size === 7 && outs.every((x, k) => !k || Math.sign(x - outs[k - 1]) === Math.sign(src[k] - src[k - 1])) && outs.every(x => Z.includes(x % 12));
    if (!ok) { bad++; ex.push([c, outs]); } }
  Q.resetCarrier(); return {n, bad, ex}; });
check('V2c′-07 Melodie mit einem verspielten Ton (C D E F♯ G A C) unter 8 Trägern: 7 verschiedene, Kontur gleich, alle in der Skala', r.bad === 0, r);

// ---------- V2c′-08: Kollisionsschutz ----------
r = await E(() => { const Q = window.SYNQUENZER, H = Q.harmony; ensureAudio();
  const notes = [69, 66, 65].map((n, i) => ({t: i, d: .9, n, v: .8}));          // A F♯ F abwärts: F♯ fiele auf F
  Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes});
  recallCarrier(H.detectChord([60, 64, 67])); const on = __outs(0, 0, [69, 66, 65]);
  Q.oneScale(false); const off = __outs(0, 0, [69, 66, 65]); Q.oneScale(true); Q.resetCarrier();
  const m = H.oneScaleMap([{p: 65, q: 65, dir: 0, dur: 1}, {p: 66, q: 66, dir: -1, dur: 1}, {p: 69, q: 69, dir: 0, dur: 1}], [0, 2, 4, 5, 7, 9, 11]);
  return {on, off, m}; });
check('V2c′-08 A F♯ F abwärts unter C: F♯ fiele auf F → weicht nach oben auf G aus (3 verschiedene Töne)', r.on.join() === '69,67,65' && r.m.join() === '65,67,69', r);

// ---------- V2c′-09: Stärke ----------
const STR = [{t: 0, d: .25, n: 66, v: .8}, {t: 1, d: 2, n: 73, v: .8}];     // F♯ kurz (1/16), C♯ lang (2 Schläge), Clip C-Dur
const strength = {};
for (const a of [1, .5, 0]) {
  await E(a => window.SYNQUENZER.setHarmony({osAmt: a}), a);
  const L = await E(k => __heard([{t: 0, d: .25, n: 66, v: .8}, {t: 1, d: 2, n: 73, v: .8}], k, [60, 64, 67]), KC);
  strength[a] = {fs: outOf(L, 66), cs: outOf(L, 73)};
}
await E(() => window.SYNQUENZER.setHarmony({osAmt: 1}));
check('V2c′-09 Stärke 100 %: kurzes F♯ und langes C♯ rasten ein (F; C♯ von F♯ aufwärts erreicht → D); 50 %: nur das lange (F♯ bleibt); 0 %: keins', strength[1].fs.join() === '65' && strength[1].cs.join() === '74' && strength[.5].fs.join() === '66' && strength[.5].cs.join() === '74' && strength[0].fs.join() === '66' && strength[0].cs.join() === '73', strength);

// ---------- V2c′-10: Durchgangstöne erlauben ----------
const PASS = [{t: 0, d: .5, n: 64, v: .8}, {t: .5, d: .25, n: 66, v: .8}, {t: 1, d: .5, n: 67, v: .8}, {t: 2, d: .5, n: 72, v: .8}];   // E F♯(kurz) G … C
const ps0 = await E(([n, k]) => __heard(n, k, [60, 64, 67]), [PASS, KC]);
await E(() => window.SYNQUENZER.setHarmony({osPass: true}));
const ps1 = await E(([n, k]) => __heard(n, k, [60, 64, 67]), [PASS, KC]);
await E(() => window.SYNQUENZER.setHarmony({osPass: false}));
check('V2c′-10 Durchgangston E–F♯–G: „Einrasten“ → F (G ist belegt), „Erlauben“ → F♯ bleibt', outOf(ps0, 66).join() === '65' && outOf(ps1, 66).join() === '66', {einrasten: outOf(ps0, 66), erlauben: outOf(ps1, 66)});

// ---------- V2c′-11: Schalter je Spur ----------
await E(() => window.SYNQUENZER.setTrackScale(0, false));
const tr0 = await E(([n, k]) => __heard(n, k, [60, 64, 67]), [EM7, KEM]);
await E(() => window.SYNQUENZER.setTrackScale(0, true));
check('V2c′-11 Spur S1 „Eine Skala“ aus: wieder wie ohne (A → F♯), die Einstellung steht in der Spur', tr0.some(e => e.n === 69 && e.out % 12 === 6) && (await E(() => window.SYNQUENZER.project().tracks[0].os)) === true, outOf(tr0, 69));

// ---------- V2c′-13: Skala nach Projekt-Tonart │ Automatisch (sichtbar umschaltbar) ----------
await E(() => window.SYNQUENZER.setHarmony({osRef: 'auto'}));
const au = await E(([n, k]) => __heard(n, k, [60, 64, 67]), [EM7, KEM]);
const auShown = await E(async () => { const Q = window.SYNQUENZER; Q.setClip(0, 0, {len: 1, key: {root: 4, scale: 'aeolian'}, notes: [64, 66, 67, 69, 71, 72, 74].map((n, i) => ({t: i * .5, d: .4, n, v: .8}))}); await __sleep(50); recallCarrier(Q.harmony.detectChord([60, 64, 67])); await __sleep(50); const s = shownShift(T.current()); Q.resetCarrier(); return s.target; });
await E(() => window.SYNQUENZER.setHarmony({osRef: 'proj'}));
const prShown = await E(async () => { const Q = window.SYNQUENZER; recallCarrier(Q.harmony.detectChord([60, 64, 67])); await __sleep(50); const s = shownShift(T.current()); Q.resetCarrier(); return s.target; });
check('V2c′-13 „Automatisch“ (Szene e-Moll): C klingt als C-Lydisch (F♯ bleibt), Anzeige → C-Lydisch; „Projekt-Tonart“ (C-Dur): → C-Dur', au.some(e => e.n === 69 && e.out % 12 === 6) && /Lyd/.test(auShown) && /C-Dur|C Dur/.test(prShown), {auto: outOf(au, 69), auShown, prShown});

// ---------- V2c′-14: Rhythmus und Timing unverändert ----------
const beatsOn = on7.map(e => e.beat % 4).sort((a, b) => a - b), beatsOff = off7.map(e => e.beat % 4).sort((a, b) => a - b);
const setOn = [...new Set(beatsOn.map(x => x.toFixed(3)))].join(), setOff = [...new Set(beatsOff.map(x => x.toFixed(3)))].join();
check('V2c′-14 Einsätze im Takt mit und ohne „Eine Skala“ gleich', setOn === setOff && setOn.split(',').length === 7, {setOn, setOff});

// ---------- V2c′-05: leuchtende Tasten = dieselbe Skala ----------
r = await E(async () => { const Q = window.SYNQUENZER, H = Q.harmony; ensureAudio();
  Q.setClip(0, 0, {len: 1, key: {root: 4, scale: 'aeolian'}, notes: [64, 66, 67, 69, 71, 72, 74, 76, 78, 79, 81, 83, 84, 86, 61, 63, 65, 68, 70, 73].map((n, i) => ({t: i * .2, d: .15, n, v: .8}))});
  Q.selectTrack(0); Q.setKbMode('play'); const res = [];
  for (const c of [[60, 64, 67], [69, 72, 76], [62, 66, 69], [67, 71, 74, 77], [64, 68, 71]]) {
    recallCarrier(H.detectChord(c)); await __sleep(120);
    const ks = Q.kbScaleNow(), Z = Q.oneScaleOf(H.detectChord(c));
    const outs = __outs(0, 0, S.tracks[0].clips[0].notes.map(n => n.n));
    const lit = [...document.querySelectorAll('#kb .inkey, .kb .inkey, [data-note].inkey')].map(e => +e.dataset.note).filter(Number.isFinite);
    res.push({c, ks: ks.pcs.slice().sort((a, b) => a - b), Z: Z.slice().sort((a, b) => a - b), one: ks.one, inZ: outs.every(x => Z.includes(x % 12)), litPcs: [...new Set(lit.map(x => x % 12))].sort((a, b) => a - b)});
  }
  Q.resetCarrier(); return res; });
check('V2c′-05 Tastatur zeigt unter 5 Trägern genau die eine Skala; 20 Clip-Töne klingen alle darin', r.every(x => x.one && x.ks.join() === x.Z.join() && x.inZ && (!x.litPcs.length || x.litPcs.join() === x.Z.join())), r);

// ---------- V2c′-15: hörbar (Spektrum): F♯4 unter C mit an/aus ----------
const pk = async () => E(async () => {
  const Q = window.SYNQUENZER; ensureAudio(); Q.stop(); await __sleep(80);
  Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [{t: 0, d: 4, n: 66, v: .9}]});
  Q.setBpm(120); Q.play(); Q.launchScene(0); Q.setKbMode('transpose'); await Q.chord([60, 64, 67], 60); await __sleep(700);
  const c = AU.ctx, an = c.createAnalyser(); an.fftSize = 32768; AU.analyser.connect(an); await __sleep(900);
  const f = new Float32Array(an.frequencyBinCount); an.getFloatFrequencyData(f); AU.analyser.disconnect(an);
  const hz = i => i * c.sampleRate / an.fftSize; let best = -1e9, bi = 0;
  for (let i = 0; i < f.length; i++) { const h = hz(i); if (h > 330 && h < 390 && f[i] > best) { best = f[i]; bi = i; } }
  const at = h => f[Math.round(h * an.fftSize / c.sampleRate)];
  Q.stop(); Q.resetCarrier(); Q.setKbMode('play'); return {peak: hz(bi), dbF: Math.max(at(349.23), at(349.23 - 1.5), at(349.23 + 1.5)), dbFs: Math.max(at(369.99), at(369.99 - 1.5), at(369.99 + 1.5))}; });
const aOn = await pk();
await E(() => window.SYNQUENZER.oneScale(false)); const aOff = await pk(); await E(() => window.SYNQUENZER.oneScale(true));
check('V2c′-15 hörbar: an → Grundton bei F (349 Hz) ≥ 20 dB über F♯; aus → bei F♯ (370 Hz) ≥ 20 dB über F', Math.abs(aOn.peak - 349.2) < 3 && aOn.dbF - aOn.dbFs >= 20 && Math.abs(aOff.peak - 370) < 3 && aOff.dbFs - aOff.dbF >= 20, {aOn, aOff});

// ---------- V2c′-12: Drums mittransponieren (hörbar) ----------
const dr = async onD => E(async onD => {
  const Q = window.SYNQUENZER; ensureAudio(); Q.stop(); await __sleep(80); Q.setHarmony({drums: onD});
  Q.setClip(0, 0, null);
  Q.setClip(4, 0, {len: 1, notes: [0, 1, 2, 3].map(t => ({t, d: .1, n: 38, v: .9})).concat([.5, 1.5, 2.5, 3.5].map(t => ({t, d: .1, n: 36, v: .9})))});
  Q.setBpm(120); Q.play(); Q.launchScene(0); Q.setKbMode('transpose'); await Q.chord([67, 71, 74], 60); await __sleep(500);   // G = −5 bzw. +7 → hier nächste: −5
  const c = AU.ctx, an = c.createAnalyser(); an.fftSize = 8192; AU.analyser.connect(an);
  const acc = new Float64Array(an.frequencyBinCount), f = new Float32Array(an.frequencyBinCount);
  for (let k = 0; k < 40; k++) { an.getFloatFrequencyData(f); for (let i = 0; i < f.length; i++) acc[i] += Math.pow(10, f[i] / 10); await __sleep(50); }
  AU.analyser.disconnect(an);
  let num = 0, den = 0; for (let i = 2; i < acc.length; i++) { const h = i * c.sampleRate / an.fftSize; if (h > 40 && h < 2000) { num += h * acc[i]; den += acc[i]; } }
  const sh = T.current().shift, tune = drumTune(nowT());
  Q.stop(); Q.resetCarrier(); Q.setKbMode('play'); Q.setHarmony({drums: false}); return {cent: num / den, sh, tune}; }, onD);
const dOff = await dr(false), dOn = await dr(true);
const ratio = dOn.cent / dOff.cent, want = Math.pow(2, dOn.tune / 12);
check('V2c′-12 Drums „Mittransponieren“ unter G: Pads um die Verschiebung gestimmt (Schwerpunkt 40–2000 Hz verschiebt sich wie 2^(Verschiebung/12), ±15 %); „Bleiben“: unverändert', dOn.tune !== 0 && Math.abs(ratio / want - 1) < .15 && dOff.tune === 0, {dOff, dOn, ratio: +ratio.toFixed(3), want: +want.toFixed(3)});

// ---------- V2c′-17: Speichern/Laden (Rundweg) ----------
r = await E(() => { const Q = window.SYNQUENZER; Q.newProject(); Q.setHarmony({osAmt: .4, osPass: true, osRef: 'auto', drums: true}); Q.setTrackScale(2, false);
  const a = Q.project(); Q.importJSON(JSON.stringify(a)); const b2 = Q.project(); const h = b2.settings.harmony;
  return {ok: h.oneScale === true && h.osAmt === .4 && h.osPass === true && h.osRef === 'auto' && h.drums === true && b2.tracks[2].os === false && b2.tracks[0].os === true}; });
check('V2c′-17 Rundweg Speichern/Laden: Eine Skala, Stärke, Durchgangstöne, Skala nach, Drums, Spur-Schalter bleiben', r.ok, r);

// ---------- V2c′-18: MIDI-Export „mit Träger“ klingt wie gehört ----------
r = await E(async () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); ensureAudio();
  Q.setClip(0, 0, {len: 1, key: {root: 4, scale: 'aeolian'}, notes: [64, 66, 67, 69, 71, 72, 74].map((n, i) => ({t: i * .5, d: .4, n, v: .8}))});
  recallCarrier(Q.harmony.detectChord([60, 64, 67])); await __sleep(50);
  const notesOf = m => { const bytes = m && m.bytes ? m.bytes : m; const u = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes); const out = []; let i = 14;
    while (i + 8 <= u.length) { const len = (u[i + 4] << 24) | (u[i + 5] << 16) | (u[i + 6] << 8) | u[i + 7]; let j = i + 8, end = j + len, rs = 0;
      while (j < end) { let d = 0, c; do { c = u[j++]; d = (d << 7) | (c & 127); } while (c & 128);
        let st = u[j]; if (st & 128) { j++; rs = st; } else st = rs;
        if (st === 0xff) { const ty = u[j++]; let l = 0; do { c = u[j++]; l = (l << 7) | (c & 127); } while (c & 128); j += l; }
        else if (st === 0xf0 || st === 0xf7) { let l = 0; do { c = u[j++]; l = (l << 7) | (c & 127); } while (c & 128); j += l; }
        else { const hi = st & 0xf0, a = u[j++], b = (hi === 0xc0 || hi === 0xd0) ? 0 : u[j++]; if (hi === 0x90 && b > 0) out.push({ch: st & 15, n: a}); } }
      i = end; }
    return out; };
  const on = notesOf(buildMidi({mode: 'scene', scene: 0, withCarrier: true})).filter(x => x.ch === 0).map(x => x.n);
  Q.oneScale(false); const off = notesOf(buildMidi({mode: 'scene', scene: 0, withCarrier: true})).filter(x => x.ch === 0).map(x => x.n); Q.oneScale(true);
  Q.resetCarrier(); return {on, off}; });
check('V2c′-18 MIDI-Export mit Träger: an → alle Töne in C-Dur (kein F♯), aus → F♯ wie bisher', r.on.length === 7 && r.on.every(n => [0, 2, 4, 5, 7, 9, 11].includes(n % 12)) && r.off.some(n => n % 12 === 6), r);

// ---------- V2c′-16: Menü → Harmonie ----------
r = await E(async () => { const Q = window.SYNQUENZER; Q.newProject(); openMenu(); await __sleep(150);
  const rows = [...document.querySelectorAll('.msec .mrow')].map(x => x.textContent);
  const has = t => rows.some(x => x.includes(t));
  const sec = [...document.querySelectorAll('.msec')].find(s => s.querySelector('h3').textContent === 'Harmonie');
  const segAus = [...sec.querySelectorAll('.mos button')].find(b => b.textContent.trim() === 'Aus');
  segAus.click(); await __sleep(50); const after = Q.project().settings.harmony.oneScale;
  const segAn = [...sec.querySelectorAll('.mos button')].find(b => b.textContent.trim() === 'An'); segAn.click(); await __sleep(50);
  const trb = [...sec.querySelectorAll('.mos-tr button')]; trb[0].click(); await __sleep(30); const tOff = Q.project().tracks[0].os; trb[0].click();
  const hs = [...sec.querySelectorAll('.mos button, .mos-tr button')].map(b => b.getBoundingClientRect().height);
  closeMenu();
  return {has: ['Eine Skala', 'Stärke', 'Durchgangstöne', 'Skala nach', 'Spuren', 'Drums'].every(has), after, final: Q.project().settings.harmony.oneScale, tOff, tOn: Q.project().tracks[0].os, minH: Math.min(...hs)}; });
check('V2c′-16 Menü → Harmonie: Eine Skala, Stärke, Durchgangstöne, Skala nach, Spuren, Drums; Tipp „Aus“/„An“ und Spur-Knopf schalten', r.has && r.after === false && r.final === true && r.tOff === false && r.tOn === true, r);

// ---------- V2c′-06: Version, Konsole ----------
const ver = await E(() => window.SYNQUENZER.version);
check('V2c′-06 Version 4.5.3, keine Konsolenfehler', ver === '4.5.3' && !errs.length, {ver, errs});
await b.close(); process.exit(done() ? 1 : 0);
