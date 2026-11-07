// MX1-Test: Mix & Master (ein Skript). Aufruf: node mx1-test.mjs <index.html> <basis.html> <ausgabe-ordner>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const [file, basis, out] = process.argv.slice(2);
const res = []; const ok = (name, pass, info) => { res.push({name, pass: !!pass, info}); console.log((pass ? 'OK   ' : 'FEHL ') + name + (info !== undefined ? '  ' + JSON.stringify(info) : '')); };

/* ---------- 1) DSP in Node: alte Projekte bitgleich (Kern aus 4.42.0 gegen neuen Kern), Multiband neutral = flach ---------- */
const grab = (html, a, b) => { const i = html.indexOf(a), j = html.indexOf(b, i); if (i < 0 || j < 0) throw new Error('nicht gefunden: ' + a); return html.slice(i, j); };
const H1 = fs.readFileSync(file, 'utf8'), H0 = fs.readFileSync(basis, 'utf8');
const mk0 = new Function(grab(H0, 'function mixaDspMake() {', '/* ---------- MIX-A: Worklet-Modul') + '\nreturn mixaDspMake;')();
const mk1 = new Function(grab(H1, 'function mixaDspMake() {', '/* ---------- MIX-A: Worklet-Modul') + '\n' + grab(H1, 'function mx1DspMake(D) {', 'let MX1_W = null;') + '\nreturn [mixaDspMake, mx1DspMake];')();
const D0 = mk0(), D1 = mk1[0](), M1 = mk1[1](D1), sr = 48000, N = sr * 3;
let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
const L = new Float32Array(N), R = new Float32Array(N); for (let i = 0; i < N; i++) { const env = 0.5 + 0.45 * Math.sin(i / sr * 2 * Math.PI * 2); L[i] = rnd() * 0.4 * env + 0.3 * Math.sin(i * 0.013); R[i] = rnd() * 0.4 * env + 0.3 * Math.sin(i * 0.011); }
const runBlocks = (node, P) => { const oL = new Float32Array(N), oR = new Float32Array(N); for (let i = 0; i < N; i += 128) node.process(L.subarray(i, i + 128), R.subarray(i, i + 128), oL.subarray(i, i + 128), oR.subarray(i, i + 128), 128, 0); return [oL, oR]; };
const same = (a, b) => { let d = 0; for (let k = 0; k < 2; k++) for (let i = 0; i < N; i++) d = Math.max(d, Math.abs(a[k][i] - b[k][i])); return d; };
{ // Spur-Einschub alter Art (ohne ls): 4.42.0-Kern gegen neuen Kern
  const P = {hp: 120, pf: 900, pg: -3, pq: 1.2, hs: -2, thr: -20, ra: 3, at: 5, rl: 100, mk: 2};
  const a = new D0.Track(sr), b = new D1.Track(sr); a.set(P, true); b.set(P, true); a.wT = b.wT = 1; a.w = b.w = 1;
  ok('DSP: Spur-Einschub ohne Bass-Shelf bitgleich zu 4.42.0', same(runBlocks(a), runBlocks(b)) === 0);
}
{ // Master alter Art (ohne mb/sat): 4.42.0-Master gegen MX1-Master
  const P = {lo: -1, hi: 1.5, thr: -18, ra: 1.5, at: 30, rl: 200, gain: 4, ceil: -1};
  const a = new D0.Master(sr, 288), b = new M1.Master(sr, 288); a.set(P, true); b.set(P, true);
  ok('DSP: Auto-Master ohne Multiband bitgleich zu 4.42.0', same(runBlocks(a), runBlocks(b)) === 0);
}
{ // Multiband neutral (Ratio 1, 0 dB) = Allpass: Energie gleich, je Oktave flach
  const mb = {f1: 150, f2: 3000, b: [[0, 1, 10, 100, 0], [0, 1, 10, 100, 0], [0, 1, 10, 100, 0]]}, y = M1.pre(L, R, sr, {mb});
  let ei = 0, eo = 0; for (let i = 0; i < N; i++) { ei += L[i] * L[i] + R[i] * R[i]; eo += y.L[i] * y.L[i] + y.R[i] * y.R[i]; }
  let dev = 0; for (const f of [40, 100, 150, 400, 1000, 3000, 6000, 15000]) { const s = new Float32Array(N); for (let i = 0; i < N; i++) s[i] = Math.sin(2 * Math.PI * f * i / sr) * 0.5; const z = M1.pre(s, s, sr, {mb}); let a = 0, b = 0; for (let i = sr; i < N; i++) { a += s[i] * s[i]; b += z.L[i] * z.L[i]; } dev = Math.max(dev, Math.abs(10 * Math.log10(b / a))); }
  ok('DSP: Multiband neutral flach (Rauschen und Sinus 40 Hz … 15 kHz)', Math.abs(10 * Math.log10(eo / ei)) < 0.05 && dev < 0.05, {rausch: +(10 * Math.log10(eo / ei)).toFixed(3), sinusMax: +dev.toFixed(3)});
}
{ // Bass-Shelf: −3 dB bei 40 Hz ≈ −3 dB, bei 2 kHz ≈ 0 dB
  const lo = M1.eqDb({ls: -3}, 40, sr), hi = M1.eqDb({ls: -3}, 2000, sr);
  ok('DSP: Bass-Shelf 150 Hz wirkt unten, nicht oben', lo < -2.5 && Math.abs(hi) < 0.2, {lo: +lo.toFixed(2), hi: +hi.toFixed(2)});
}

/* ---------- 2) App: Analyse, Vorschläge, Übernehmen, Vorher/Nachher, Rolle, EQ, Master, Speichern/Laden, Oberfläche ---------- */
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 428, height: 926}});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForTimeout(1500);
const A = await p.evaluate(async () => {
  const o = {};
  SYNQUENZER.loadDemo();
  o.nodes0 = SYNQUENZER.mixaInfo().nodes;                                            // nichts übernommen: kein Knoten
  const c1 = S.tracks[1].clips[0], lead = deep(c1); lead.notes = [72, 74, 76, 79, 77, 76, 74, 72].map((n, k) => ({n, t: k * 0.5, d: 0.45, v: 0.85})); lead.len = 1;
  S.tracks[5].clips[0] = lead; S.tracks[5].clips[1] = deep(lead);
  SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]);
  ensureAudio();
  let T0 = performance.now(); await SYNQUENZER.mixaAnalyze(); o.msAn = Math.round(performance.now() - T0);
  o.I1 = SYNQUENZER.mx1Info();
  // alles übernehmen = ein Undo-Schritt; Undo/Redo; Vorher/Nachher
  const u0 = UNDO.length, s0 = mixaSnap(); o.all = SYNQUENZER.mixaAll(); o.undoSteps = UNDO.length - u0; const s1 = mixaSnap();
  undo(); o.undoBack = mixaSnap() === s0; redo(); o.redoFwd = mixaSnap() === s1;
  o.abOn = SYNQUENZER.mx1MixAB(true); o.abIsBefore = mixaSnap() === s0; o.abOff = SYNQUENZER.mx1MixAB(false); o.abIsAfter = mixaSnap() === s1;
  o.mixAfter = S.tracks.map(t => t.mix || null); o.fxAfter = S.tracks.map(t => ({vol: t.sound.fx.vol, rev: t.sound.fx.rev, dly: t.sound.fx.dly, pan: t.sound.fx.pan}));
  // nach dem Übernehmen neu analysieren: Lead vorne
  await SYNQUENZER.mixaAnalyze(); o.I2 = SYNQUENZER.mx1Info();
  // Rolle überschreiben (Synth 2 → Fläche), ein Undo-Schritt, Vorschläge ohne neuen Durchlauf
  const u1 = UNDO.length; o.role = SYNQUENZER.mx1Role(1, 'pad'); o.roleSteps = UNDO.length - u1; o.I3 = SYNQUENZER.mx1Info();
  undo(); o.roleUndo = S.tracks[1].mxRole || null; redo(); o.roleRedo = S.tracks[1].mxRole || null;
  // EQ · KOMP: Bass-Shelf an der Lead-Spur, Knoten da; alles neutral = Einschub weg
  const t5 = 5, had = !!S.tracks[t5].mix; o.eqA = SYNQUENZER.mx1EqSet(t5, 'ls', -3); o.eqMix = deep(S.tracks[t5].mix);
  await new Promise(r => setTimeout(r, 300)); o.eqNode = SYNQUENZER.mixaInfo().nodes.tracks[t5];
  const keep = deep(S.tracks[t5].mix), u2 = UNDO.length; for (const k of ['hp', 'ls', 'pg', 'hs', 'mk']) SYNQUENZER.mx1EqSet(t5, k, 0); SYNQUENZER.mx1EqSet(t5, 'ra', 1); o.eqNeutral = S.tracks[t5].mix || null;
  for (let k = UNDO.length - u2; k > 0; k--) undo(); o.eqUndo = deep(S.tracks[t5].mix || null); o.eqKeep = keep; o.had = had;
  // Master: Synth-Pop −14 und House −9 (Club); am Render gemessen
  const D = mixaDspMake(), meas = async () => { const rr = await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}}); const L = rr.ch[0], R = rr.ch[1]; return {tp: +D.truePeak([L, R], 8, 32).toFixed(2), I: +D.integ(D.kblocks([L, R], rr.sr)).toFixed(2)}; };
  o.before = await meas();
  for (const [st, z] of [['synthpop', -14], ['house', -9]]) {
    SYNQUENZER.mx1Style(st); MIXA.ziel = z; T0 = performance.now();
    const r = await SYNQUENZER.mx1Master(); o[st] = {ok: r, ms: Math.round(performance.now() - T0), am: SYNQUENZER.mx1Info().am, info: MIXA.am && MIXA.am.P.info, render: await meas(), node: SYNQUENZER.mx1Node()};
  }
  o.amAB = SYNQUENZER.amAB(true); o.amABinfo = SYNQUENZER.mixaInfo().ab; SYNQUENZER.amAB(false);
  // Speichern/Laden (Normalisierer): Rolle, Spur-EQ, Master-Felder bleiben
  SYNQUENZER.mx1Role(2, 'pad');
  const P2 = normalizeProject(JSON.parse(serializeProject()));
  o.saveRole = P2.tracks.map(t => t.mxRole || null), o.liveRole = S.tracks.map(t => t.mxRole || null);
  o.saveMix = JSON.stringify(P2.tracks.map(t => t.mix || null)) === JSON.stringify(S.tracks.map(t => t.mix || null));
  o.saveAm = JSON.stringify(P2.fxBus.am) === JSON.stringify(S.fxBus.am);
  return o;
});
const I1 = A.I1, T = I1.T, sug = I1.sug, byName = n => T.find(t => t.name === n), sOf = n => sug[T.findIndex(t => t.name === n)] || [];
ok('Bypass: ohne Übernahme kein Mix-Knoten', !A.nodes0.master && A.nodes0.tracks.every(x => !x), A.nodes0);
ok('Analyse läuft (Demo-Song 8 Takte)', !!I1.res && I1.res.spec.length === 6, {ms: A.msAn});
ok('Rollen erkannt: Bass, Sequenz, Fläche, Drums, Lead', byName('Synth 1').cls === 'bass' && byName('Synth 2').cls === 'arp' && byName('Synth 3').cls === 'pad' && byName('Drums').cls === 'drums' && byName('Melodie').cls === 'lead', T.map(t => t.name + ':' + t.cls));
ok('Werte je Spur: Oktavspektrum, Breite, Hall/Echo, Pegel', I1.res.spec[0].length === 9 && I1.res.width[2] > 0.1 && I1.res.wet[2].hall != null && I1.res.lvl[5] != null, {width: I1.res.width, wet: I1.res.wet.map(w => w.hall)});
const bassHp = sOf('Synth 1').filter(s => s.patch && s.patch.mix && s.patch.mix.hp != null);
ok('Bass bekommt keinen Low-Cut (höchstens Subsonic ≤ 30 Hz unter dem tiefsten Ton)', bassHp.every(s => s.id === 'sub' && s.patch.mix.hp <= 30), bassHp.map(s => s.id + ' ' + s.patch.mix.hp));
const padHp = sOf('Synth 3').find(s => s.id === 'hp');
ok('Fläche bekommt Low-Cut', !!padHp && padHp.patch.mix.hp >= 100, padHp && padHp.text);
ok('Überdeckung im Kontext: Absenkung nur bei Spuren ohne Vorrang', sug.flat().filter(s => s.id === 'mask').length >= 1 && !sOf('Synth 1').some(s => s.id === 'mask') && !sOf('Drums').some(s => s.id === 'mask'), sug.flat().filter(s => s.id === 'mask').map(s => s.text));
ok('Alle übernehmen = ein Undo-Schritt, Undo/Redo stellt her', A.all && A.undoSteps === 1 && A.undoBack && A.redoFwd);
ok('Vorher/Nachher: VORHER = Stand vor dem Übernehmen, zurück = NACHHER', A.abOn === true && A.abIsBefore && A.abOff === false && A.abIsAfter);
const I2 = A.I2, iL = 5, iP = 2;
ok('Lead vorne (Pegel über der Fläche, weniger Hall)', I2.res.lvl[iL] > I2.res.lvl[iP] && (I2.res.wet[iL].hall == null || I2.res.wet[iL].hall < I2.res.wet[iP].hall - 3), {lvl: [I2.res.lvl[iL], I2.res.lvl[iP]], hall: [I2.res.wet[iL].hall, I2.res.wet[iP].hall]});
ok('Rolle überschreiben: ein Undo-Schritt, Vorschläge neu ohne Durchlauf', A.role && A.roleSteps === 1 && A.I3.T[1].cls === 'pad' && A.I3.T[1].auto === 'arp' && A.roleUndo === null && A.roleRedo === 'pad', {cls: A.I3.T[1]});
ok('EQ · KOMP: Bass-Shelf gesetzt, Knoten läuft, neutral = kein Einschub, Undo', A.eqA && A.eqMix && A.eqMix.ls === -3 && A.eqNode && !A.eqNode.off && (A.eqNeutral === null || Object.keys(A.eqNeutral).join() === 'sec') && JSON.stringify(A.eqUndo) === JSON.stringify(A.eqKeep), {mix: A.eqMix, neutral: A.eqNeutral, node: A.eqNode});
for (const [st, z] of [['synthpop', -14], ['house', -9]]) {
  const m = A[st];
  ok('Mastern ' + st + ' ' + z + ' LUFS: am Render Lautheit auf Ziel, True-Peak ≤ −1 dBTP, Multiband + Sättigung aktiv', m.ok && Math.abs(m.render.I - z) <= 0.5 && m.render.tp <= -1.0 && m.am.mb && m.am.sat && m.am.st === st && m.node && m.node.on,
    {render: m.render, info: m.info && {lin: m.info.lin, lout: m.info.lout, tp: m.info.tp, limAvg: m.info.limAvg, mbGr: m.info.mbGr, satDb: m.info.satDb}, ms: m.ms});
}
ok('Master Standard ohne Pumpen/Verzerren (Synth-Pop: Band-Arbeit Ø ≤ 2 dB, Limiter Ø ≤ 0,5 dB, Sättigung ≤ 0,5 dB)', A.synthpop.info.mbGr.every(g => g.avg <= 2) && A.synthpop.info.limAvg <= 0.5 && A.synthpop.info.satDb >= -0.5);
ok('Master Vorher/Nachher', A.amAB === true && A.amABinfo === true);
ok('Speichern/Laden: Rolle, Spur-EQ, Master (st, mb, sat) bleiben', JSON.stringify(A.saveRole) === JSON.stringify(A.liveRole) && A.saveRole[2] === 'pad' && A.saveMix && A.saveAm);

/* ---------- 3) Oberfläche: Mix-Assistent, Auto-Master, EQ · KOMP, FX › SPUR (hochkant 428×926, quer 926×428) ---------- */
const tapSize = sel => p.evaluate(s => { const L = [...document.querySelectorAll(s)].filter(e => e.offsetParent); return {n: L.length, minH: Math.min(...L.map(e => e.getBoundingClientRect().height)), over: L.filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim().slice(0, 20))}; }, sel);
await p.evaluate(() => { SYNQUENZER.mixaSheet(); MX1.roleOpen = 1; mixaPaint(); });
await p.waitForTimeout(300);
let t1 = await tapSize('.pop.mxsheet button');
ok('Mix-Assistent (hochkant): Rolle, Spektrum, Vorher/Nachher, Tasten ≥ 44 px, nichts abgeschnitten', t1.minH >= 44 && !t1.over.length && await p.evaluate(() => !!document.querySelector('.mx1sp') && !!document.querySelector('[data-a="mx1ab"]') && !!document.querySelector('.mx1rs')), t1);
await p.screenshot({path: out + '/mx-p-mix.png'});
await p.evaluate(() => { closePop(); SYNQUENZER.mx1EqSheet(5); });
await p.waitForTimeout(300);
t1 = await tapSize('.pop.mx1eqs button');
const eqk = await p.evaluate(() => { const k = [...document.querySelectorAll('.mx1eqs .knob')], r = document.querySelector('.pop.mx1eqs').getBoundingClientRect(); return {n: k.length, inView: r.bottom <= innerHeight && r.top >= 0, right: k.every(x => x.getBoundingClientRect().right <= r.right)}; });
ok('EQ · KOMP-Blatt (hochkant): 11 Regler, Tasten ≥ 44 px, im Bild', eqk.n === 11 && eqk.inView && eqk.right && t1.minH >= 44, eqk);
await p.screenshot({path: out + '/mx-p-eq.png'});
await p.evaluate(() => closePop());
await p.setViewportSize({width: 926, height: 428}); await p.waitForTimeout(400);
await p.evaluate(() => { SYNQUENZER.amSheet(); });
await p.waitForTimeout(300);
t1 = await tapSize('.pop.mxsheet button');
ok('Auto-Master (quer): Stil, MASTERN, Multiband-Zeilen, Tasten ≥ 44 px', t1.minH >= 44 && !t1.over.length && await p.evaluate(() => document.querySelectorAll('[data-a="mx1st"]').length === 4 && !!document.querySelector('[data-a="mx1go"]') && !!document.querySelector('.mx1g')), t1);
await p.screenshot({path: out + '/mx-l-am.png'});
await p.evaluate(() => { closePop(); SYNQUENZER.mx1EqSheet(5); });
await p.waitForTimeout(300);
const eql = await p.evaluate(() => { const r = document.querySelector('.pop.mx1eqs').getBoundingClientRect(), p = document.querySelector('.pop.mx1eqs'); return {h: Math.round(r.height), inView: r.bottom <= innerHeight + 0.5, scroll: p.scrollHeight - p.clientHeight}; });
ok('EQ · KOMP-Blatt (quer) im Bild', eql.inView, eql);
await p.evaluate(() => closePop());
for (const [w, h, tag] of [[926, 428, 'l'], [428, 926, 'p']]) {
  await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(300);
  for (const t of [1, 4]) {
    await p.evaluate(t => { if (R.editor) closeEditor(); selectTrack(t); if (S.tracks[t].kind === 'drum') { ED.dTab = 'fx'; ED.dFx = 'spur'; } else { ED.tab = 'fx'; ED.sub.fx = 'spur'; } openEditor(); }, t);
    await p.waitForTimeout(400);
    const g = await p.evaluate(() => {
      const sh = document.querySelector('.sheet.open, #synthSheet.open, #drumSheet.open'), bt = sh && sh.querySelector('.mx1b'), x = sh && sh.querySelector('.sh-x'), pg = sh && sh.querySelector('.pg-fx-spur');
      const rb = bt && bt.getBoundingClientRect(), rx = x && x.getBoundingClientRect(), rp = pg && pg.getBoundingClientRect(), ks = pg ? [...pg.querySelectorAll('.knob')].map(k => k.getBoundingClientRect()) : [];
      const hit = ks.some(k => rb && !(k.right <= rb.left || k.left >= rb.right || k.bottom <= rb.top || k.top >= rb.bottom));
      return {btn: !!bt, h: rb && Math.round(rb.height), w: rb && Math.round(rb.width), inPg: rb && rp && rb.bottom <= rp.bottom + 1 && rb.right <= rp.right + 1, hit, x: !!rx && rx.right <= innerWidth && rx.top >= 0 && rx.bottom <= innerHeight, pgOver: pg ? pg.scrollHeight - pg.clientHeight : null};
    });
    ok('FX › SPUR ' + (t === 4 ? 'Drums' : 'Synth') + ' (' + (tag === 'l' ? 'quer' : 'hochkant') + '): EQ · KOMP ≥ 44 px, überdeckt keinen Regler, ✕ sichtbar', g.btn && g.h >= 44 && g.inPg && !g.hit && g.x, g);
    if (t === 1 && tag === 'l') await p.screenshot({path: out + '/mx-l-spur.png'});
  }
}
ok('Keine Fehler in der Konsole', !errs.length, errs.slice(0, 5));
await b.close();
const nOk = res.filter(r => r.pass).length; console.log('\nErgebnis: ' + nOk + '/' + res.length + ' OK');
fs.writeFileSync(out + '/mx1-test-ergebnis.json', JSON.stringify({ok: nOk, n: res.length, res}, null, 1));
