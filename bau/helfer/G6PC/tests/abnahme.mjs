// G6+c Abnahmen G6P-20…28 + G6P-K1 (gezielt, keine Vollregression). Aufruf: NODE_PATH=… node abnahme.mjs [nur=20,21,…]
import { open, demo, putStyle, playTap, STY } from './lib.mjs';
import fs from 'fs';
const only = (process.argv[2] || '').replace('nur=', '').split(',').filter(Boolean);
const want = k => !only.length || only.includes(k);
const {b, p, errs} = await open();
await demo(p);
const R = {}, ok = (k, pass, d) => { R[k] = Object.assign({pass: !!pass}, d); console.log(k, pass ? 'OK' : 'FEHLT', JSON.stringify(d)); };
const ev = (f, a) => p.evaluate(f, a);
const volDb = d => ev(d => { const st = stimmeT(), f = S.tracks[st].sound.fx; f.vol = f.vol * Math.pow(10, d / 40); applyTrackParams(st); return SYNQUENZER.g6pLeadDb(); }, d);
const r2 = x => Math.round(x * 100) / 100;
// ---------- G6P-20 Abstand je Stil, Hall-Rückweg ×2 ----------
if (want('20')) {
  const rows = [];
  for (const s of Object.keys(STY)) { await putStyle(p, s); const t = await playTap(p); rows.push({s, below: STY[s].grp.below, d: r2(t.Ll - t.Lc)}); }
  const fx0 = await ev(() => JSON.stringify(S.fxBus));
  await ev(() => { S.fxBus.hall.ret = (S.fxBus.hall.ret == null ? .8 : S.fxBus.hall.ret) * 2; applyHall(S.fxBus.hall, true); });
  const t2 = await playTap(p); await ev(f => { S.fxBus = JSON.parse(f); applyHall(S.fxBus.hall, true); }, fx0);
  const last = rows[rows.length - 1];
  ok('G6P-20', rows.every(x => Math.abs(x.d - x.below) <= .5) && Math.abs((t2.Ll - t2.Lc) - last.d) <= .1, {rows, hallX2: r2(t2.Ll - t2.Lc)});
}
// ---------- G6P-21 Regler ----------
if (want('21')) {
  await putStyle(p, '80'); const a = await playTap(p);
  await ev(() => SYNQUENZER.g6pGrp(null, {below: 12})); await ev(() => SYNQUENZER.g6pWait()); const b12 = await playTap(p);
  await ev(() => SYNQUENZER.g6pGrp(null, {below: 8}));
  await ev(() => SYNQUENZER.g6pVoice(null, 1, {db: 2})); await ev(() => SYNQUENZER.g6pWait()); const t3 = await playTap(p);   // Terz −1 → +2 = +3 dB
  const vg = await ev(async () => { SYNQUENZER.launchScene(0); SYNQUENZER.play(); await new Promise(q => setTimeout(q, 400)); const r = TK.src.find(x => !x.dead && x.chG), v = r.ch.filter(x => x.v2).map(x => [x.vi, x.vg.gain.value]); SYNQUENZER.stop(); return v; });
  const g = vi => vg.find(x => x[0] === vi)[1], relTerz = 20 * Math.log10(g(1) / g(0)) - (-1 - 0);   // Terz gegen Unisono: vorher −1 dB, jetzt +2 dB → +3 dB relativ zu vorher
  await ev(() => SYNQUENZER.g6pVoice(null, 1, {db: -1})); await ev(() => SYNQUENZER.g6pWait());
  const t0 = await playTap(p); await volDb(-6); const t6 = await playTap(p); await volDb(6);
  const mute = await ev(async () => { const sleep = q => new Promise(r => setTimeout(r, q)), A = SYNQUENZER, st = stimmeT(); A.launchScene(0); A.play(); await sleep(800); A.g6pTap(true); setMute(st, true); await sleep(1500); const T = A.g6pTap(false); A.stop(); setMute(st, false); await sleep(200);
    const tail = x => x.subarray(Math.floor(x.length * .3)), pk = x => x.reduce((m, y) => Math.max(m, Math.abs(y)), 0); return {chor: 20 * Math.log10(pk(tail(T.C[0])) + 1e-12), hall: 20 * Math.log10(pk(tail(T.H)) + 1e-12)}; });
  const d = {below12: r2(b12.Ll - b12.Lc), terzChorTotal: r2(t3.Lc - a.Lc), terzRel: r2(relTerz), terzRelSoll: 3, lead6: r2(t6.Ll - t0.Ll), chor6: r2(t6.Lc - t0.Lc), mute: {chor: r2(mute.chor), hall: r2(mute.hall)}};
  ok('G6P-21', Math.abs(d.below12 - 12) <= .3 && Math.abs(d.terzChorTotal) <= .3 && Math.abs(relTerz - 3) <= .2 && Math.abs(d.lead6 + 6) <= .1 && Math.abs(d.chor6 + 6) <= .1 && mute.chor <= -90 && mute.hall <= -120, d);
}
// ---------- G6P-22 Pan / G6P-23 Versatz (Knotenwerte und Startzeiten je Kopie, alle Stile) ----------
if (want('22') || want('23')) {
  const pan = [], ofs = [];
  for (const s of Object.keys(STY)) {
    await putStyle(p, s);
    const x = await ev(async () => { const A = SYNQUENZER; A.launchScene(0); A.play(); await new Promise(q => setTimeout(q, 500)); const r = TK.src.find(q => !q.dead && q.chG), c = tkRef({t: stimmeT(), s: 0}).a.chor;
      const out = r.ch.filter(q => q.v2).map(q => { const v = c.voices[q.vi], C = g6pcCopies(v)[q.k]; return {soll: clamp(v.pan + C.p * v.w, -1, 1), ist: q.pan.pan.value, ms: C.ms, dt: (q.when - r.start) * 1000}; }); A.stop(); return out; });
    for (const q of x) { pan.push(Math.abs(q.soll - q.ist)); ofs.push(Math.abs(q.dt - q.ms)); }
  }
  const sh = await ev(async () => { await SYNQUENZER.g6pVoice(null, 0, {pan: .5}); const A = SYNQUENZER; A.launchScene(0); A.play(); await new Promise(q => setTimeout(q, 500)); const r = TK.src.find(q => !q.dead && q.chG), out = r.ch.filter(q => q.v2 && q.vi === 0).map(q => q.pan.pan.value); A.stop(); return out; });
  ok('G6P-22', Math.max(...pan) <= .03 && sh.every(v => v >= .5 - .03 - .15 && v <= 1), {maxErr: Math.max(...pan), n: pan.length, bgShift05: sh});
  ok('G6P-23', Math.max(...ofs) <= .5, {maxErrMs: +Math.max(...ofs).toFixed(4), n: ofs.length});
}
// ---------- G6P-24 Solo / Stumm / Chor aus / Blatt zu / Vorlage-Faktor ----------
if (want('24')) {
  await putStyle(p, '80');
  const vgs = async () => ev(async () => { const A = SYNQUENZER; A.launchScene(0); A.play(); await new Promise(q => setTimeout(q, 400)); const r = TK.src.find(q => !q.dead && q.chG), v = r.ch.filter(q => q.v2).map(q => [q.vi, q.vg.gain.value]); A.stop(); await new Promise(q => setTimeout(q, 150)); return v; });
  await ev(() => g6Solo('c2')); const so = await playTap(p); const soV = await vgs(); await ev(() => g6Solo('c2'));
  await ev(() => SYNQUENZER.g6pLaneMute('c1', true)); const muV = await vgs(); await ev(() => { undo(); });
  const und = await ev(() => JSON.stringify(S.tracks[stimmeT()].chor || null));
  await ev(() => SYNQUENZER.g6pLaneMute(null, true)); const off = await playTap(p); await ev(() => SYNQUENZER.g6pLaneMute(null, false));
  const sheet = await ev(() => { g6Sheet({t: stimmeT(), s: 0}); g6Solo('c1'); const a = G6.solo; closePop(); return [a, G6.solo]; });
  const base = await vgs(); await ev(() => SYNQUENZER.g6pGuide('c3', 2)); const gu = await vgs(); await ev(() => SYNQUENZER.g6pGuide('c3', 1)); const back = await vgs();
  const db = (x, y) => 20 * Math.log10(x / y), g3 = (L, vi) => L.filter(x => x[0] === vi).map(x => x[1]);
  const d = {soloLead: r2(so.Ll), soloVg: soV.map(x => x[0] + ':' + r2(x[1])).join(' '), muteC1: muV.filter(x => x[0] === 0).every(x => x[1] === 0) && muV.filter(x => x[0] !== 0).every(x => x[1] > 0), chorAusPeak: off.peakC,
    sheetSolo: sheet, guideDb: r2(db(g3(gu, 2)[0], g3(base, 2)[0])), guideOthers: g3(gu, 0)[0] === g3(base, 0)[0], back: JSON.stringify(back) === JSON.stringify(base), undoLanes: und};
  ok('G6P-24', (so.Ll == null || so.Ll <= -90) && soV.every(x => (x[0] === 1) === (x[1] > 0)) && d.muteC1 && off.peakC === 0 && sheet[0] === 'c1' && sheet[1] === null && Math.abs(d.guideDb - 6.02) <= .1 && d.guideOthers && d.back, d);
}
// ---------- G6P-25 Sends ----------
if (want('25')) {
  const fx0 = await ev(() => JSON.stringify(S.fxBus)); await putStyle(p, '80'); const fx1 = await ev(() => JSON.stringify(S.fxBus));
  const on = await playTap(p);
  await ev(() => SYNQUENZER.g6pGrp(null, {rev: 0})); const r0 = await playTap(p); await ev(() => SYNQUENZER.g6pGrp(null, {rev: .75}));
  const pre = await ev(async () => { const A = SYNQUENZER; A.launchScene(0); A.play(); await new Promise(q => setTimeout(q, 400)); const r = TK.src.find(q => !q.dead && q.chG), v = r.chG.pre.delayTime.value; A.stop(); return v; });
  // Impuls durch die Gruppe (OfflineAudioContext, dieselbe Bau-Funktion): Abstand guide → Hall-Send
  const imp = await ev(async () => { const a = tkRef({t: stimmeT(), s: 0}).a, sr = 48000, oc = new OfflineAudioContext(2, sr, sr), sumL = oc.createGain(), hall = oc.createGain(), m = oc.createChannelMerger(2);
    const G = g6pcGroup(oc, a, sumL, hall, null); G.lvl.gain.value = 1; G.hp.frequency.value = 10; G.mid.gain.value = 0; G.air.gain.value = 0; G.rev.gain.value = 1;
    sumL.connect(m, 0, 0); hall.connect(m, 0, 1); m.connect(oc.destination); const b = oc.createBuffer(1, 64, sr); b.getChannelData(0)[0] = 1; const s = oc.createBufferSource(); s.buffer = b; s.connect(G.hp); s.start(0.1);
    const y = await oc.startRendering(), pk = x => { let k = 0, m2 = 0; for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) > m2) { m2 = Math.abs(x[i]); k = i; } return k; };
    return (pk(y.getChannelData(1)) - pk(y.getChannelData(0))) / sr * 1000; });
  await ev(() => SYNQUENZER.g6pLaneMute(null, true)); const off = await playTap(p); await ev(() => SYNQUENZER.g6pLaneMute(null, false));
  const d = {hallOn: r2(on.Hc), rev0: r2(r0.Hc), preSec: pre, impMs: r2(imp), chorAusHall: r2(off.Hc), fxBusGleich: fx0 === fx1};
  ok('G6P-25', r0.Hc <= -120 && Math.abs(pre - .0625) < 1e-6 && Math.abs(imp - 62.5) <= 1 && off.Hc <= -120 && d.fxBusGleich && on.Hc > -80, d);
}
// ---------- G6P-26 Klang (Übertragungsfunktion der Gruppen-Filter gegen die Formel) ----------
if (want('26')) {
  await putStyle(p, '80');
  const x = await ev(async () => {
    const a = tkRef({t: stimmeT(), s: 0}).a, g = a.chor.grp, sr = 48000, oc = new OfflineAudioContext(2, sr, sr), G = g6pcGroup(oc, a, oc.destination, null, null, true);
    const f = new Float32Array([g.hp, 1000, g.midF, 10000, 16000]), m = [new Float32Array(5), new Float32Array(5), new Float32Array(5)], ph = new Float32Array(5);
    G.hp.getFrequencyResponse(f, m[0], ph); G.mid.getFrequencyResponse(f, m[1], ph); G.air.getFrequencyResponse(f, m[2], ph);
    const dB = v => 20 * Math.log10(v), tot = [...f].map((_, i) => dB(m[0][i] * m[1][i] * m[2][i]));
    // Formel (Audio-EQ-Kochbuch, wie BiquadFilterNode): Tiefschnitt Butterworth −3,01 dB bei hp; Glocke = mid dB bei midF; Kuhschwanz S=1: +air/2 dB bei 10 kHz, ≈ +air dB weit darüber
    return {hpAtF: dB(m[0][0]), midAtF: dB(m[1][2]), airAt10k: dB(m[2][3]), airAt16k: dB(m[2][4]), soll: {hp: -3.0103, mid: g.mid, air10k: g.air / 2, air: g.air}, tot};
  });
  ok('G6P-26', Math.abs(x.hpAtF + 3.0103) <= .3 && Math.abs(x.midAtF - x.soll.mid) <= .3 && Math.abs(x.airAt10k - x.soll.air10k) <= .3, x);
}
// ---------- G6P-27 Live = Offline, kein Platzhalter, Einsatz mit Blende ----------
if (want('27')) {
  await putStyle(p, 'gospel');
  const t = await playTap(p), m = await ev(() => SYNQUENZER.g6pMeas()), k = await ev(() => { const a = tkRef({t: stimmeT(), s: 0}).a, V = vpGet(g6Lead(a)); return {ga: SYNQUENZER.g6pGA(), lead: SYNQUENZER.g6pLeadDb(), vp: 20 * Math.log10(V ? V.g : 1)}; });
  const offLc = m.Lc + 20 * Math.log10(k.ga) + k.lead + k.vp, offLl = m.Ll + k.lead + k.vp;   // Offline-Lautheit × gA × Lead-Pegel × VS-P
  const early = await ev(async () => { const A = SYNQUENZER, r = {t: stimmeT(), s: 0}; G6.cache.clear(); G6PC.meas.clear(); A.g6pGrp(r, {hp: 121}); A.launchScene(0); A.play(); const seen = []; for (let n = 0; n < 200; n++) { const i = A.g6pInfoC(); seen.push(i.copies); if (i.copies) break; await new Promise(q => setTimeout(q, 25)); }
    const rr = TK.src.find(q => !q.dead && q.chG), q0 = rr && rr.ch.find(q => q.v2), ramp = q0 ? {g0: q0.g.gain.value, when: q0.when, now: AU.ctx.currentTime} : null; A.stop(); return {zeros: seen.filter(x => !x).length, first: seen[seen.length - 1], ramp}; });
  const d = {liveLc: r2(t.Lc), offLc: r2(offLc), liveLl: r2(t.Ll), offLl: r2(offLl), vpDb: r2(k.vp), early};
  ok('G6P-27', Math.abs(t.Lc - offLc) <= .2 && Math.abs(t.Ll - offLl) <= .2 && early.zeros > 0 && early.first > 0, d);
}
// ---------- G6P-28 Leistung: Wiedergabe mit Szenenwechseln, Knoten zurück auf 0, lange Tasks ----------
if (want('28')) {
  await putStyle(p, 'gospel');
  const x = await ev(async () => { const A = SYNQUENZER, sleep = q => new Promise(r => setTimeout(r, q)), st = stimmeT();
    A.setClip(st, 1, deep(S.tracks[st].clips[0])); A.setClip(st, 2, deep(S.tracks[st].clips[0]));
    const lt = []; const po = new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(Math.round(e.duration)); }); try { po.observe({entryTypes: ['longtask']}); } catch (e) {}
    const n0 = A.g6pInfoC().nodes; A.launchScene(0); A.play(); let mx = 0;
    for (let k = 0; k < 12; k++) { await sleep(2500); A.launchScene(k % 3); mx = Math.max(mx, A.g6pInfoC().nodes); }
    A.stop(); await sleep(600); po.disconnect(); return {n0, max: mx, after: A.g6pInfoC().nodes, longTasks: lt.filter(d => d > 50), live: A.g6pInfoC().live}; });
  ok('G6P-28', x.after === x.n0 && x.longTasks.length === 0, Object.assign(x, {dauerS: 30, hinweis: 'gekürzt auf 30 s (Spec: 3 min)'}));
}
// ---------- G6P-K1 Kopplung Lead ↔ Chor ----------
if (want('K1')) {
  await putStyle(p, '80');
  const a0 = await playTap(p); await volDb(-6); const a1 = await playTap(p);
  await ev(() => SYNQUENZER.g6pCouple(null, false)); await ev(() => SYNQUENZER.g6pWait()); const b0 = await playTap(p); await volDb(-6); const b1 = await playTap(p);
  const und = await ev(() => { const n = UNDO.length; return n; });
  await ev(() => SYNQUENZER.g6pCouple(null, true)); await ev(() => SYNQUENZER.g6pWait()); const c0 = await playTap(p); await volDb(6); const c1 = await playTap(p);
  const grp = await ev(() => tkRef({t: stimmeT(), s: 0}).a.chor.grp); await volDb(6);
  const d = {an: {lead: r2(a1.Ll - a0.Ll), chor: r2(a1.Lc - a0.Lc)}, aus: {lead: r2(b1.Ll - b0.Ll), chor: r2(b1.Lc - b0.Lc)}, wiederAn: {abstandVorher: r2(b1.Ll - b1.Lc), abstandNachher: r2(c0.Ll - c0.Lc), chorSprung: r2(c0.Lc - b1.Lc), leadPlus6: r2(c1.Ll - c0.Ll), chorPlus6: r2(c1.Lc - c0.Lc)}, grp};
  ok('G6P-K1', Math.abs(d.an.chor + 6) <= .1 && Math.abs(d.an.lead + 6) <= .1 && Math.abs(d.aus.chor) <= .1 && Math.abs(d.aus.lead + 6) <= .1 && Math.abs(d.wiederAn.chorSprung) <= .1 && Math.abs(d.wiederAn.abstandNachher - d.wiederAn.abstandVorher) <= .1 && Math.abs(d.wiederAn.chorPlus6 - 6) <= .1, d);
}
// ---------- Regel 28 Smoke: v1-Chor (4.25) spielt wie bisher über den alten Weg ----------
if (want('v1')) {
  const x = await ev(async () => { const A = SYNQUENZER, r = {t: stimmeT(), s: 0}; await A.g6Del(r); const ok1 = await A.g6Make(r, 'terz', 'up', '80'); const w = await A.g6Wait(r); A.launchScene(0); A.play(); await new Promise(q => setTimeout(q, 800));
    const rr = TK.src.find(q => !q.dead && q.aud && q.aud.chor), v1 = rr ? {ch: rr.ch.length, grp: !!rr.chG, v2: rr.ch.some(q => q.v2)} : null; A.stop(); await new Promise(q => setTimeout(q, 200)); return {ok1, w, v: tkRef(r).a.chor.v || null, v1, nodes: A.g6pInfoC().nodes}; });
  ok('v1-Smoke', x.ok1 && x.w && x.v === null && x.v1 && x.v1.ch === 2 && !x.v1.grp && !x.v1.v2 && x.nodes === 0, x);
}
ok('Fehler', errs.length === 0, {errs});
fs.writeFileSync(new URL('./ergebnis.json', import.meta.url), JSON.stringify(R, null, 1));
await b.close();
