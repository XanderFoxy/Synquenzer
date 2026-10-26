// QA G-MK7 flow part 2 (P 390x844, CDP touch): „Quelle nur als Eingang“, engine switch of the vocoder track, synth Welle „Eingang“ (bass ← drums),
// added track as source/remove/undo, level staging synth ↔ vocoder
import {open, sleep, OUT, check, done, eq, diff} from './vg567-gmk7-tl.mjs';
import {setupProject} from './vg567-gmk7-setup.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
T.knobList = async (k, re) => { await T.tapMk(k, 300); const r = await T.tapPop(re); await sleep(600); return r ? 'ok' : 'no list item ' + re + ' ' + JSON.stringify(await T.popTexts()); };
const U = () => T.undoN();
const PAD = 2, LEAD = 3, BASS = 0, DR = 4;
log('setup', JSON.stringify(await setupProject(E)));
// level of a node over ms (peak, rms dBFS)
const nodeLvl = (expr, ms = 1500) => E(([expr, ms]) => new Promise(r => { const n = eval(expr); if (!n) return r(null); const c = AU.ctx, a = c.createAnalyser(); a.fftSize = 2048; n.connect(a); const b = new Float32Array(2048); let pk = 0, ss = 0, N = 0; const iv = setInterval(() => { a.getFloatTimeDomainData(b); for (const v of b) { pk = Math.max(pk, Math.abs(v)); ss += v * v; N++; } }, 40); setTimeout(() => { clearInterval(iv); try { n.disconnect(a); } catch (e) {} r([+(20 * Math.log10(pk + 1e-15)).toFixed(1), +(10 * Math.log10(ss / Math.max(1, N) + 1e-30)).toFixed(1)]); }, ms); }), [expr, ms]);
await E(() => { SYNQUENZER.launchScene(0); SYNQUENZER.play(); }); await sleep(1500);
// L1: pad as VA vs as MS 2000 synth vs MS 2000 vocoder (E2 = lead) – raw engine and post-fader levels, master peak
const lvA = {va: [await nodeLvl('AU.synth[2].node'), await nodeLvl('AU.tracks[2].cut'), await nodeLvl('AU.M.ceil')]};
await T.openEd(PAD); await T.toMk(); await sleep(1500);
lvA.mkSynth = [await nodeLvl('AU.synth[2].node'), await nodeLvl('AU.tracks[2].cut'), await nodeLvl('AU.M.ceil')];
await E(([t, s]) => { SYNQUENZER.mkSet(t, 'mode', 3); SYNQUENZER.mkIn(t, 'e2', s); }, [PAD, LEAD]); await sleep(1500);
lvA.mkVoc = [await nodeLvl('AU.synth[2].node'), await nodeLvl('AU.tracks[2].cut'), await nodeLvl('AU.M.ceil')];
lvA.lead = [await nodeLvl('AU.synth[3].node'), await nodeLvl('AU.tracks[3].duck')];
log('levels [peak,rms] raw / post / master', JSON.stringify(lvA));
// a gain-reduction read-out of the master limiter if any
log('master chain', await E(() => Object.keys(AU.M).join(',')));
// L2: „Quelle nur als Eingang“ via the QUELLE 2 list (EING. 1, SHIFT)
await T.w1(/EING\. ?1/); await sleep(300); await T.tapMk('shift', 300);
let u0 = await U();
await T.tapMk('k0', 400); const rows = await T.popTexts(); await T.tapPop(/^Quelle nur als Eingang/); await sleep(600);
let inn = await E(t => SYNQUENZER.mkIn(t), PAD), info = await E(() => SYNQUENZER.mkInInfo());
const leadCut = await nodeLvl('AU.tracks[3].cut'), padNow = await nodeLvl('AU.synth[2].node');
check('Q1 „Quelle nur als Eingang“ (touch): e2Dry 0, lead cut from master (≤ −90 dBFS after cut), vocoder still modulated, one undo', inn.e2Dry === 0 && info.tracks[LEAD].dryCut && leadCut[0] <= -90 && padNow[0] > -40 && (await U()) === u0 + 1, {inn, leadCut, padNow, du: (await U()) - u0, lcd: await T.lcd2()});
// is the lead's track meter / strip telling that it is only an input? (strip text of track 4)
const strip = await E(() => { const h = [...document.querySelectorAll('.thead, .trk, .th')].map(e => e.textContent.trim().replace(/\s+/g, ' ')).slice(0, 8); return h; });
log('strip heads', JSON.stringify(strip));
// L3: the vocoder track → engine VA (header list): the lead must come back into the master
await T.tapMk('shift', 300);
const c = await T.rectText('#synthSheet button', /^MS ?2000 ▾$/); await T.tap(c.cx, c.cy, 400); await T.tapPop(/^VA/); await sleep(1800);
info = await E(() => SYNQUENZER.mkInInfo());
const leadBack = await nodeLvl('AU.tracks[3].cut');
check('Q2 vocoder track → VA: lead back in the master (dryCut off)', !info.tracks[LEAD].dryCut && leadBack[0] > -40, {eng: await E(t => SYNQUENZER.getSound(t).engine, PAD), info: info.tracks[LEAD], leadBack, mkIn: await E(t => SYNQUENZER.mkIn(t), PAD)});
// back to MS 2000 via ↶ : vocoder + cut again
await T.tapTxt('#synthSheet .hb.ur', /^↶$/, 1800);
info = await E(() => SYNQUENZER.mkInInfo());
const padBack = await nodeLvl('AU.synth[2].node'), leadCut2 = await nodeLvl('AU.tracks[3].cut');
check('Q3 ↶ engine change: MS 2000 vocoder again, E2 routed, lead cut again', (await E(t => SYNQUENZER.getSound(t).engine, PAD)) === 'mk' && info.tracks[PAD].e2 && info.tracks[LEAD].dryCut && padBack[0] > -40 && leadCut2[0] <= -90, {info, padBack, leadCut2});
// L4: mute the vocoder track (M in the strip via API) – lead still cut (silent), unmute → back
await E(t => SYNQUENZER.mute ? SYNQUENZER.mute(t, true) : setMute(t, true), PAD); await sleep(600);
const mutedLead = await nodeLvl('AU.tracks[3].cut'), mutedPad = await nodeLvl('AU.synth[2].node');
log('pad muted: lead after cut', mutedLead, 'pad raw', mutedPad, 'mute api', await E(() => typeof SYNQUENZER.mute));
await E(t => SYNQUENZER.mute ? SYNQUENZER.mute(t, false) : setMute(t, false), PAD); await sleep(600);
// L5: synth Welle „Eingang“ on the bass: MS 2000, OSZ 1 WELLE → Eingang (list), QUELLE 1 (Regler 4) → Drums
await T.closePop(); await E(() => SYNQUENZER.closeEditor && SYNQUENZER.closeEditor()); await sleep(300);
await T.openEd(BASS); await T.toMk(); await sleep(500);
log('w1 OSZ1', await T.w1(/OSZ 1/)); await sleep(300);
let pn = await T.panel(); log('OSZ1 knobs', JSON.stringify(pn.knobs.map(k => k && k.l)));
await T.tapMk('k0', 400); const wl = await T.popTexts(); log('wave list', JSON.stringify(wl));
await E(() => { const b = [...document.querySelectorAll('#popLayer .pop button')].find(b => /^Eingang/.test(b.textContent.trim())); b && b.scrollIntoView({block: 'center'}); }); await sleep(200);
await T.tapPop(/^Eingang/); await sleep(600);
pn = await T.panel(); log('OSZ1 knobs after Eingang', JSON.stringify(pn.knobs.map(k => k && k.l)), 'lcd', await T.lcd2());
check('Q4 OSZ 1 WELLE → Eingang: QUELLE 1/2 at knobs 4/5', (await T.pm(BASS)).t[0].o1.w === 7 && pn.knobs[3] && /QUELLE 1/.test(pn.knobs[3].l) && pn.knobs[4] && /QUELLE 2/.test(pn.knobs[4].l), pn.knobs.map(k => k && k.l));
await T.tapMk('k3', 400); const ql = await T.popTexts(); log('QUELLE 1 list', JSON.stringify(ql));
await T.tapPop(/^Spur 5/); await sleep(800);
inn = await E(t => SYNQUENZER.mkIn(t), BASS);
const bassLv = await nodeLvl('AU.synth[0].node', 2500);
check('Q5 QUELLE 1 → Drums: bass filters the drum loop while its notes play (audible)', inn && inn.e1 && bassLv[0] > -40, {inn, bassLv});
// the cycle guard: drums → … no; try pad as source of the bass and bass as … (pad E1 = bass?) then bass E2 = pad must be refused
await E(([a, b]) => SYNQUENZER.mkIn(a, 'e1', b), [PAD, BASS]);
await T.tapMk('k4', 400); const ql2 = await T.popTexts(); log('QUELLE 2 list (bass)', JSON.stringify(ql2));
const padRow = await E(() => { const b = [...document.querySelectorAll('#popLayer .pop button')].find(b => /^Spur 3/.test(b.textContent.trim())); return b ? {dis: b.disabled, t: b.textContent} : null; });
check('Q6 cycle: pad (E1 = bass) is not selectable as bass source', padRow && padRow.dis && /Kreis/.test(padRow.t), padRow);
await T.closePop();
// L6: an added track 7 as the voice: lead-like, the pad's E2 = track 7, remove track 7 → pad silent; ↶ → back
const t7 = await E(() => SYNQUENZER.addTrack()); log('added', t7);
await E(([t7]) => { const Q = SYNQUENZER; Q.setClip(t7, 0, Q.getClip(3, 0)); Q.setClip(t7, 1, Q.getClip(3, 1)); }, [t7]);
await E(([a, b]) => { SYNQUENZER.mkIn(a, 'e2', b); SYNQUENZER.mkIn(a, 'e2', undefined, 0); SYNQUENZER.mkIn(a, 'e1', null); SYNQUENZER.launchScene(0); }, [PAD, t7]);
await sleep(2500);
info = await E(() => SYNQUENZER.mkInInfo());
log('t7 source', JSON.stringify(info.tracks.slice(0, 8)), 'lead back?', JSON.stringify(await nodeLvl('AU.tracks[3].cut', 800)));
const t7cut = await nodeLvl('AU.tracks[' + t7 + '].cut');
log('t7 cut', t7cut);
await E(t => SYNQUENZER.removeTrack(t), t7); await sleep(1500);
info = await E(() => SYNQUENZER.mkInInfo()); const padAfterRm = await nodeLvl('AU.synth[2].node');
log('after remove', JSON.stringify(info.tracks), 'pad', padAfterRm, 'mkIn', JSON.stringify(await E(t => SYNQUENZER.mkIn(t), PAD)));
await E(() => SYNQUENZER.undo()); await sleep(2500);
info = await E(() => SYNQUENZER.mkInInfo()); const padAfterUndo = await nodeLvl('AU.synth[2].node'), t7cut2 = await nodeLvl('AU.tracks[' + t7 + '].cut');
check('Q7 remove source track 7 → pad not routed; ↶ → track 7 back, routed again, cut again', info.tracks[PAD] && info.tracks[PAD].e2 && info.tracks[t7] && info.tracks[t7].dryCut && padAfterUndo[0] > -40 && t7cut2[0] <= -90, {info: info.tracks, padAfterUndo, t7cut2});
log('errs', JSON.stringify(errs));
check('Q99 no console errors', errs.length === 0, errs.slice(0, 5));
await T.br.close(); done();
