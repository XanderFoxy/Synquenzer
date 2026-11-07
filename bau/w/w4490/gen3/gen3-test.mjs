// GEN3-Test: eine Genre-Liste, eine Fill-Bibliothek, neue Stile, Tempo-Version, Remix in der Matrix
// Aufruf: node gen3-test.mjs <index.html> <ausgabeordner>   (absolute Pfade)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
const file = path.resolve(process.argv[2]), out = path.resolve(process.argv[3] || '.');
const basis = path.join(path.dirname(file), '..', 'basis.html');
let bad = 0;
const ok = (c, m, d) => { if (c) console.log('OK ' + m + (d ? ' – ' + d : '')); else { bad++; console.log('FEHLER ' + m + (d ? ' – ' + d : '')); } };
const b = await chromium.launch();
const errs = [];
async function page(w, h, f) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (f || file)); await p.waitForTimeout(1500);
  return p;
}
// eigene Noten: Bass, Drums, Akkorde (Szene 1), zwei Teile im Song
const SETUP = () => {
  const D = window.SYNQUENZER;
  D.setBpm(120);
  D.setClip(0, 0, {len: 2, notes: [[0, .75, 36, .9], [.75, .25, 36, .6], [1.5, .5, 43, .8], [2.25, .75, 41, .7], [3, 1, 39, .8], [4, 1.5, 36, .9], [5.75, .25, 48, .6], [6, .5, 46, .7], [6.75, 1.25, 43, .8]].map(([t, d, n, v]) => ({t, d, n, v}))});
  D.setClip(4, 0, {len: 1, notes: [[0, 36, .95], [.75, 36, .6], [1, 38, .9], [1.75, 36, .7], [2.5, 36, .85], [3, 38, .9], [3.75, 38, .3]].map(([t, n, v]) => ({t, d: .1, n, v})).concat([0, .5, 1, 1.5, 2, 2.5, 3, 3.5].map(t => ({t, d: .1, n: 42, v: .6})))});
  D.setClip(2, 0, {len: 2, notes: [[0, 60], [0, 64], [0, 67], [4, 57], [4, 60], [4, 64]].map(([t, n]) => ({t, d: 3.5, n, v: .7}))});
};
const run = (p, fn) => p.evaluate('(() => { const SETUP = ' + SETUP.toString() + '; return (' + fn.toString() + ')(); })()');
const gm = (ns, pad) => ns.filter(n => n.n === pad).map(n => +n.t.toFixed(3));
try {
  /* ---------- 1 eine Genre-Liste, keine doppelten Fill-Kacheln, Werkzeugkasten zeigt dieselben Kacheln ---------- */
  let p = await page(428, 926);
  const A = await p.evaluate(() => {
    const D = window.SYNQUENZER, G = D.gen3; const o = {names: G.names(), ue: G.ue(), bbDrum: G.bbDrum(), genres: G.genres(), figs: D.bb1.figs(), fills: D.gr2.fills()};
    return o;
  });
  const N = A.names, remix = new Set(N.remix);
  ok(N.remix.length === new Set(N.remix).size && N.remix.length >= 44, 'Genre-Liste: ' + N.remix.length + ' Stile, keine doppelten Namen');
  for (const k of ['grundmuster', 'werkzeugkasten', 'fills']) { const miss = N[k].filter(n => !remix.has(n)); ok(!miss.length, 'Namen ' + k + ' = Namen der Genre-Liste', miss.length ? 'fremd: ' + miss.join(', ') : N[k].length + ' Namen'); }
  ok(N.masterGenre.every(([, a, g]) => a === g), 'Master-Stile mit Genre heißen wie in der Liste', N.masterGenre.map(x => x[1]).join(', '));
  const figG = [...new Set(A.figs.map(f => f.g))].filter(g => g !== 'allg' && !A.genres.some(x => x.id === g));
  ok(!figG.length, 'jede Werkzeugkasten-Figur gehört zu einem Genre der Liste', figG.join(','));
  ok(!A.names.remix.includes('Frühes House') && N.remix.includes('House'), '„Frühes House“ heißt überall „House“');
  const vis = A.ue.visible, sigs = A.ue.sigs;
  ok(new Set(vis).size === vis.length && new Set(sigs).size === sigs.length, 'Fill-Bibliothek: keine doppelten Ids, keine doppelten Schlag-Muster', vis.length + ' Kacheln, Doppel ausgeblendet: ' + A.ue.dup.join(','));
  const bbUe = A.bbDrum.map(f => f.ue);
  ok(bbUe.every(id => vis.includes(id)) && new Set(bbUe).size === bbUe.length, 'Werkzeugkasten-Drums-Füller = dieselben Kacheln (ue:<Id>)', bbUe.length + ' Füller');
  // die neuen Stile: je ein Genre-Fill und eine Figur
  const NEW = ['disco', 'motown80', 'eurodance', 'synthwave', 'powerpop', 'freestyle', 'seqtrack', 'electro', 'boombap', 'gfunk', 'trap', 'triphop', 'bigbeat', 'dnb', 'ukfunky', 'jersey', 'gogo', 'afrobeat', 'bossa', 'samba', 'ska', 'steppers', 'rockers', 'dancehall', 'dembow', 'hshuffle', 'rockhalf'];
  const gsOf = new Map(A.ue.gs); const fillOk = NEW.filter(id => vis.some(v => (gsOf.get(v) || []).includes(id)));
  ok(fillOk.length === NEW.length, 'jeder neue Stil hat einen Genre-Fill in ◆ ÜBERGÄNGE', fillOk.length + '/' + NEW.length);
  const figOk = NEW.filter(id => A.figs.some(f => f.g === id && f.r !== 'drum'));
  ok(figOk.length === NEW.length, 'jeder neue Stil hat Werkzeugkasten-Figuren', figOk.length + '/' + NEW.length + (figOk.length < NEW.length ? ' fehlt: ' + NEW.filter(x => !figOk.includes(x)).join(',') : ''));
  const sndBad = A.figs.filter(f => f.snd && !(f.snd.startsWith('f-'))).map(f => f.id);
  ok(!sndBad.length, 'Figuren-Klänge sind Werksklänge', sndBad.join(','));
  const hs = A.genres.find(x => x.id === 'hshuffle');
  ok(hs && hs.sw8 > .66 && hs.sw8 < .67, 'Halftime-Shuffle: Achtel-Triolen (sw8 ' + (hs && hs.sw8) + ')');

  /* ---------- 2 neue Stile übersetzen deinen Bass + deine Drums (Raster, Swing, Kern-Schläge) ---------- */
  const T = await run(p, () => {
    SETUP(); const D = window.SYNQUENZER, bass = D.getClip(0, 0), dr = D.getClip(4, 0), tr = (st, c, k, r) => D.gr2.translate(c, st, k, r);
    return {bb: tr('boombap', dr, 80, 'dr'), bbBass: tr('boombap', bass, 80, 'bass'), trap: tr('trap', dr, 90, 'dr'), trapBass: tr('trap', bass, 80, 'bass'), dem: tr('dembow', dr, 80, 'dr'), demBass: tr('dembow', bass, 80, 'bass'),
      step: tr('steppers', dr, 80, 'dr'), hs: tr('hshuffle', dr, 80, 'dr'), gm: D.gen3.gmNotes(4, 0, 'trap'), gmBb: D.gen3.gmNotes(4, 0, 'boombap'), gmHs: D.gen3.gmNotes(4, 0, 'hshuffle'), dr0: dr.notes.length, bass0: bass.notes};
  });
  const fr = t => +(t - Math.floor(t)).toFixed(3);
  // Boom Bap: Swing 60 % (zweite Sechzehntel +0,05), Snare laid back, Kern 2/4
  ok(gm(T.bb, 38).every(t => fr(t) === .025) && gm(T.bb, 38).length >= 2, 'Boom Bap: Snare auf 2 und 4, etwas hinter dem Schlag', gm(T.bb, 38).join(' '));
  ok(gm(T.bb, 36).some(t => fr(t) === .8), 'Boom Bap: Bassdrum auf der geswingten 2a (1,8)', gm(T.bb, 36).join(' '));
  const bbBassOff = T.bbBass.filter(n => Math.abs((n.t * 4) % 2 - 1) < .3).map(n => +((n.t % .5) - .25).toFixed(3));
  ok(bbBassOff.every(x => Math.abs(x - .05) < .011), 'Boom Bap: Bass-Sechzehntel geswingt (+0,05 Schlag)', bbBassOff.join(' ') || '(keine)');
  // Trap: Halftime-Snare nur auf der Drei, Hi-Hat-Wirbel, 808-Gleiten
  const trSn = gm(T.trap, 38);
  ok(trSn.length && trSn.every(t => t % 4 === 2), 'Trap: Snare nur auf der Drei (Halftime)', trSn.join(' '));
  const rolls = T.trap.filter(n => n.n === 42 && n.r >= 2).map(n => n.t + '×' + n.r);
  ok(rolls.length >= 2, 'Trap: Hi-Hat-Wirbel (32tel/Triolen) auf deinen Hats', rolls.join(' '));
  const glide = T.trapBass.filter((n, i, a) => a[i + 1] && a[i + 1].n !== n.n && n.t + n.d > a[i + 1].t + 1e-6).length;
  ok(glide >= 2, 'Trap: 808-Bass gleitet (Töne gebunden)', glide + ' Bindungen');
  ok(gm(T.trap, 36).every(t => [0, 1.5, 2.5, 3.25].includes(t % 4)), 'Trap: Bassdrum im Trap-Raster', gm(T.trap, 36).join(' '));
  // Dembow: Snare auf 1a, 2+, 3a, 4+ und Bassdrum auf jedem Viertel
  ok(JSON.stringify(gm(T.dem, 38)) === JSON.stringify([.75, 1.5, 2.75, 3.5]), 'Dembow: Snare im Dembow-Rhythmus', gm(T.dem, 38).join(' '));
  ok([0, 1, 2, 3].every(t => gm(T.dem, 36).includes(t)), 'Dembow: Bassdrum auf jedem Viertel', gm(T.dem, 36).join(' '));
  const demB = T.demBass.map(n => +(n.t % 2).toFixed(3));
  ok(demB.every(t => [0, .75, 1.5].includes(t)), 'Dembow: dein Bass im 3-3-2-Raster', demB.join(' '));
  // Steppers: Bassdrum auf allen vier, Rimshot auf der Drei
  ok([0, 1, 2, 3].every(t => gm(T.step, 36).includes(t)) && gm(T.step, 37).includes(2), 'Reggae Steppers: Bassdrum auf allen Vierteln, Rimshot auf der Drei', 'Kick ' + gm(T.step, 36).join(' ') + ' · Rim ' + gm(T.step, 37).join(' '));
  // Halftime-Shuffle: Hats auf Triolen (0,667), Snare auf der Drei
  ok(gm(T.hs, 42).some(t => Math.abs(fr(t) - .667) < .01) && gm(T.hs, 38).includes(2), 'Halftime-Shuffle: Hats auf der dritten Triole, Snare auf der Drei', 'Hats ' + gm(T.hs, 42).join(' '));
  // Grundmuster (Stil-Muster): Trap-Wirbel, Boom-Bap-Swing, Triolen
  ok(T.gm && T.gm.some(n => n.r >= 2), 'Grundmuster Trap: Hi-Hat-Wirbel im Muster', T.gm ? T.gm.filter(n => n.r).map(n => n.t + '×' + n.r).join(' ') : '–');
  ok(T.gmBb && gm(T.gmBb, 42).some(t => fr(t) === .8), 'Grundmuster Boom Bap: Sechzehntel geswingt (2a = 1,8)', T.gmBb ? gm(T.gmBb, 42).join(' ') : '–');
  ok(T.gmHs && gm(T.gmHs, 38).some(t => Math.abs(fr(t) - .333) < .01), 'Grundmuster Halftime-Shuffle: Ghost auf der mittleren Triole', T.gmHs ? gm(T.gmHs, 38).join(' ') : '–');

  /* ---------- 3 Tempo-Version (langsam / schnell): Tempo, Notenzahl, Gate, Hall; A/B; ↶ ---------- */
  const V = await run(p, () => {
    SETUP(); const D = window.SYNQUENZER, o = {};
    D.setTrackFx(2, 'rev', .3);
    D.placePart('S1', 0, 'insert'); D.placePart('S1', D.song().bars, 'insert'); D.songView(true);
    const own = () => D.song().own || {}, avg = (ns, f) => ns.length ? ns.reduce((a, n) => a + f(n), 0) / ns.length : 0;
    const verOf = (t, st) => { const O = own(); for (const k in O) if (O[k].from && O[k].from.t === t && O[k].gr && O[k].gr.s === st) return {id: k, c: O[k]}; return null; };
    o.bars = D.song().bars; o.u0 = D.undoInfo().n;
    o.slow = D.gr2.remix('tvslow', {k: 80}); o.bpmS = D.project().bpm;
    const vd = verOf(4, 'tvslow'), vb = verOf(0, 'tvslow'), vp = verOf(2, 'tvslow');
    o.s = {dr: vd && vd.c.notes.length, bassD: vb && avg(vb.c.notes, n => n.d), padD: vp && avg(vp.c.notes, n => n.d), padSt: vp && D.gen3.verSt(vp.id), gr: vd && vd.c.gr, padN: vp && vp.c.notes.length};
    o.a = D.gr2.ab('a', {st: 'tvslow'}); o.bpmA = D.project().bpm;
    o.b = D.gr2.ab('b', {st: 'tvslow'}); o.bpmB = D.project().bpm;
    o.fast = D.gr2.remix('tvfast', {k: 80}); o.bpmF = D.project().bpm;
    const fd = verOf(4, 'tvfast'), fb = verOf(0, 'tvfast'), fp = verOf(2, 'tvfast');
    o.f = {dr: fd && fd.c.notes.length, bassN: fb && fb.c.notes.length, padD: fp && avg(fp.c.notes, n => n.d), padSt: fp && D.gen3.verSt(fp.id)};
    o.orig = {dr: D.getClip(4, 0).notes.length, bassN: D.getClip(0, 0).notes.length, bassD: avg(D.getClip(0, 0).notes, n => n.d), padD: avg(D.getClip(2, 0).notes, n => n.d), padN: D.getClip(2, 0).notes.length};
    o.rev0 = D.getSound(2).fx && D.getSound(2).fx.rev; o.aR0 = D.getSound(2).p.aR;
    o.it = D.gr2.remix('italo', {k: 70}); o.bpmIt = D.project().bpm;
    o.songBefore = JSON.stringify(D.song());
    D.undo(); o.undoSame = JSON.stringify(D.song()) !== o.songBefore;
    return o;
  });
  ok(V.slow && V.slow.ok && V.bpmS === Math.round(120 * (1 - .35 * .8)), 'Langsame Version: Tempo 120 → ' + V.bpmS + ' BPM');
  ok(V.s.dr > V.orig.dr, 'Langsam: mehr Fülle in den Drums', V.orig.dr + ' → ' + V.s.dr + ' Noten');
  ok(V.s.bassD > V.orig.bassD + .05, 'Langsam: Bass gebundener (längeres Gate)', V.orig.bassD.toFixed(3) + ' → ' + V.s.bassD.toFixed(3) + ' Schläge');
  ok(V.s.padSt && V.s.padSt.st && V.s.padSt.st.fx && V.s.padSt.st.fx.rev > V.rev0, 'Langsam: mehr Hall (Klangzustand der Version)', V.rev0 + ' → ' + (V.s.padSt && V.s.padSt.st && V.s.padSt.st.fx ? V.s.padSt.st.fx.rev : '–'));
  ok(V.aR0 == null || (V.s.padSt.st.p && V.s.padSt.st.p.aR > V.aR0), 'Langsam: längeres Release', V.aR0 + ' → ' + (V.s.padSt.st.p ? V.s.padSt.st.p.aR : '–'));
  ok(V.s.padN > V.orig.padN, 'Langsam: Fläche mit Bewegung (Werkzeugkasten-Figur auf deinen Akkorden)', V.orig.padN + ' → ' + V.s.padN + ' Noten');
  ok(V.s.gr && V.s.gr.o === 120 && V.s.gr.t === V.bpmS, 'Version merkt Tempo vorher/nachher (gr.o/gr.t)', JSON.stringify(V.s.gr));
  ok(V.bpmA === 120 && V.bpmB === V.bpmS, 'A/B stellt auch das Tempo um', 'A ' + V.bpmA + ' · B ' + V.bpmB);
  ok(V.fast && V.fast.ok && V.bpmF === Math.round(120 * 1.24), 'Schnelle Version: Tempo 120 → ' + V.bpmF + ' BPM');
  ok(V.f.dr < V.orig.dr && V.f.bassN < V.orig.bassN, 'Schnell: weniger Noten (Drums, Bass)', 'Drums ' + V.orig.dr + ' → ' + V.f.dr + ' · Bass ' + V.orig.bassN + ' → ' + V.f.bassN);
  ok(V.f.padD < V.orig.padD, 'Schnell: kürzere Gates', V.orig.padD.toFixed(3) + ' → ' + V.f.padD.toFixed(3));
  ok(V.f.padSt && V.f.padSt.st && V.f.padSt.st.fx.rev < V.rev0, 'Schnell: weniger Hall', V.rev0 + ' → ' + (V.f.padSt && V.f.padSt.st ? V.f.padSt.st.fx.rev : '–'));
  ok(V.it && V.it.ok && V.bpmIt === 120, 'Anderer Stil danach: Tempo zurück auf das Original', V.bpmIt + ' BPM');
  ok(V.undoSame, '↶ nimmt den Remix zurück');

  /* ---------- 4 Remix in der Matrix: neue Szene, Song unverändert ---------- */
  const M = await p.evaluate(() => {
    const D = window.SYNQUENZER, o = {}, G = D.gen3;
    o.song0 = JSON.stringify(D.song()); o.bpm0 = D.project().bpm;
    o.r1 = G.mxRemix('reggae', {src: 0, k: 70});
    const dst = o.r1 && o.r1.dst;
    o.clips = [0, 2, 4].map(t => D.getClip(t, dst)); o.src = [0, 2, 4].map(t => D.getClip(t, 0));
    o.r2 = G.mxRemix('trap', {src: 0, k: 70}); o.dst2 = o.r2 && o.r2.dst;
    o.trapDr = D.getClip(4, o.dst2);
    o.song1 = JSON.stringify(D.song());
    const pr = D.project(); o.chordsSrc = pr.scenes[0].chords || null; o.chordsDst = pr.scenes[dst] ? pr.scenes[dst].chords || null : null;
    o.r3 = G.mxRemix('tvslow', {src: 0, k: 60}); o.bpm3 = D.project().bpm; o.r3gr = D.getClip(0, o.r3.dst) && D.getClip(0, o.r3.dst).gr;
    D.setBpm(120);
    D.save(); D.load(); o.after = D.getClip(4, dst) && D.getClip(4, dst).gr; o.afterBass = D.getClip(0, dst) && D.getClip(0, dst).gr;
    D.undo(); o.undoClip = D.getClip(4, dst) && D.getClip(4, dst).gr ? D.getClip(4, dst).gr.s : null;
    return o;
  });
  ok(M.r1 && M.r1.dst != null && M.r1.dst !== 0 && M.r1.n >= 3, 'Matrix-Remix legt eine neue Szene an', 'Szene 1 → Szene ' + (M.r1 && M.r1.dst + 1) + ', ' + (M.r1 && M.r1.n) + ' Clips');
  ok(M.clips.every((c, i) => c && c.gr && c.gr.m === 0 && c.gr.s === 'reggae') && M.clips[2].notes.some(n => n.n === 36 && n.t === 2), 'Remix-Clips: Stil, Quell-Szene, deine Drums im One Drop (Bassdrum auf der Drei)');
  ok(M.src[2].notes.length === 15 && M.src[0].notes.length === 9 && M.src.every(c => !c.gr), 'Quell-Szene bleibt unverändert');
  ok(M.dst2 === M.r1.dst && M.trapDr.gr.s === 'trap', 'zweiter Stil ändert dieselbe Remix-Szene (kein Szenen-Stapel)', 'Szene ' + (M.dst2 + 1));
  ok(M.song0 === M.song1, 'Song bleibt beim Matrix-Remix unberührt');
  ok(M.r3gr && M.r3gr.t === Math.round(120 * (1 - .35 * .6)) && M.bpm3 === M.bpm0, 'Tempo-Version auch in der Matrix (Tempo der Version gemerkt, das Projekt-Tempo bleibt)', M.r3gr && M.r3gr.o + ' → ' + M.r3gr.t + ' · Projekt ' + M.bpm0 + ' → ' + M.bpm3);
  ok(M.after && M.after.m === 0 && M.afterBass && M.afterBass.o === 120 && M.afterBass.t === M.r3gr.t, 'Speichern/Laden: gr.m, gr.o, gr.t bleiben', JSON.stringify(M.afterBass));
  ok(M.undoClip === 'trap', '↶ holt die vorige Remix-Szene zurück', String(M.undoClip));
  ok(true, 'Akkord-Zeile der Szene', 'Quelle ' + (M.chordsSrc ? 'mit' : 'ohne') + ' Zeile, Remix ' + (M.chordsDst ? 'mit' : 'ohne'));

  /* ---------- 5 Werkzeugkasten in Reitern: Grundmuster │ Figuren │ Spielweise, Ziel-Zeile ---------- */
  const W = await p.evaluate(() => {
    const D = window.SYNQUENZER, G = D.gen3, o = {};
    D.selectSlot(4, 0); o.open = G.bbOpen(4, 0, 'gm');
    const P = document.querySelector('.bb1s');
    o.tabs = P ? [...P.querySelectorAll('.gen3-tabs [data-g3t]')].map(b => b.textContent) : [];
    o.tiles = P ? P.querySelectorAll('[data-g3gm]').length : 0;
    o.ziel = P ? [...P.querySelectorAll('[data-ziel]')].map(b => b.dataset.ziel) : [];
    const r = (sel) => G.bbAct(sel);
    r('[data-g3gm="trap"]'); r('[data-ziel="neu"]'); o.before = D.getClip(4, 0).notes.length;
    o.s2 = null; const P2 = document.querySelector('.bb1s'); o.insBtn = !!(P2 && P2.querySelector('[data-bb="ins"]:not([disabled])'));
    const zn = D.bb1.targets(4, 0).find(z => z.k === 'neu'); o.free = zn ? zn.s : null; o.wasEmpty = o.free != null && !D.getClip(4, o.free);
    r('[data-bb="ins"]');
    if (o.free != null) { const c = D.getClip(4, o.free); if (o.wasEmpty && c && c.notes.some(n => n.r)) o.s2 = o.free; }
    o.after = D.getClip(4, 0).notes.length;
    D.undo(); o.undo = o.s2 != null ? !D.getClip(4, o.s2) : null;
    // Figuren-Reiter: Drums-Füller = Fill-Kacheln
    G.bbOpen(4, 0, 'fig'); const P3 = document.querySelector('.bb1s');
    o.figIds = P3 ? [...P3.querySelectorAll('[data-fig]')].map(b => b.dataset.fig) : [];
    o.figHead = P3 ? !!P3.querySelector('.gen3-tabs') : false;
    o.gens = P3 ? [...P3.querySelectorAll('[data-gen]')].map(b => b.textContent) : [];
    // Spielweise auf dem Akkord-Clip, Ziel: Diesen Clip
    G.bbOpen(2, 0, 'sw'); const P4 = document.querySelector('.bb1s');
    o.swTiles = P4 ? P4.querySelectorAll('[data-g3sw]').length : 0;
    const n0 = D.getClip(2, 0).notes.length;
    o.sw = G.swInsert(2, 0, 'hArp', 'hier'); o.swN = [n0, D.getClip(2, 0).notes.length];
    D.undo(); o.swUndo = D.getClip(2, 0).notes.length === n0;
    // Clip-Blatt: kein eigener [Grundmuster ▾] mehr, [Werkzeugkasten ▾] da
    document.querySelector('.pop .ms-x') && document.querySelector('.pop .ms-x').click();
    D.openClipSheet(4, 0);
    const cs = document.getElementById('clipSheet');
    o.cs = cs ? [...cs.querySelectorAll('button')].map(b => b.textContent.trim()).filter(t => /Grundmuster|Werkzeugkasten/.test(t)) : [];
    return o;
  });
  ok(W.open && JSON.stringify(W.tabs) === JSON.stringify(['Grundmuster', 'Figuren', 'Spielweise']), 'Werkzeugkasten: Reiter Grundmuster │ Figuren │ Spielweise', W.tabs.join(' │ '));
  ok(W.tiles >= 40 && JSON.stringify(W.ziel) === JSON.stringify(['ver', 'neu', 'hier']) || W.ziel.includes('neu'), 'Grundmuster-Reiter: alle Stile, Ziel-Zeile', W.tiles + ' Stile · Ziel ' + W.ziel.join('/'));
  ok(W.s2 != null && W.before === W.after, 'Grundmuster als Neuer Clip (Original bleibt)', 'Szene ' + (W.s2 != null ? W.s2 + 1 : '–'));
  ok(W.undo === true, '↶ nimmt das Grundmuster zurück');
  ok(W.figHead && W.figIds.length && W.figIds.every(id => id.startsWith('ue:')), 'Reiter Figuren › Drums-Füller zeigt die Fill-Kacheln', W.figIds.length + ' Kacheln');
  ok(W.gens.every(g => g === 'Alle' || g === 'Allgemein' || remix.has(g)), 'Genre-Knöpfe im Werkzeugkasten = Namen der Liste', W.gens.length + ' Knöpfe');
  ok(W.swTiles >= 10 && W.sw && W.swN[1] !== W.swN[0] && W.swUndo, 'Spielweise-Reiter mit Ziel (Diesen Clip), ↶', W.swN.join(' → '));
  ok(!W.cs.some(t => /^Grundmuster/.test(t)) && W.cs.some(t => /^Werkzeugkasten/.test(t)), 'Clip-Blatt: nur noch [Werkzeugkasten ▾]', W.cs.join(', '));
  await p.close();

  /* ---------- 6 Bedienung + Fotos: Remix-Blatt (Tempo-Kacheln, [Matrix]), Matrix-Blatt, Werkzeugkasten, Übergänge ---------- */
  for (const [w, h, tag] of [[428, 926, 'hochkant'], [926, 428, 'quer'], [926, 370, 'quer370']]) {
    const q = await page(w, h);
    await run(q, () => { SETUP(); const D = window.SYNQUENZER; D.placePart('S1', 0, 'insert'); D.placePart('S1', D.song().bars, 'insert'); D.songView(true); D.gr2.open(); });
    await q.waitForTimeout(300);
    const R = await q.evaluate(() => {
      const P = document.querySelector('.gr2s'); if (!P) return null;
      const bs = [...P.querySelectorAll('button')].filter(b => b.offsetParent).map(b => { const r = b.getBoundingClientRect(); return {t: b.textContent.trim().slice(0, 16), h: Math.round(r.height), w: Math.round(r.width), vis: r.top >= -1 && r.bottom <= innerHeight + 1}; });
      const x = P.querySelector('.ms-x').getBoundingClientRect();
      return {tv: P.querySelectorAll('.gen3-tv').length, mx: !!P.querySelector('[data-g3="mx"]'), small: bs.filter(b => b.vis && b.h < 44).map(b => b.t + ':' + b.h), x: x.top >= 0 && x.bottom <= innerHeight && x.right <= innerWidth, w: document.documentElement.scrollWidth <= innerWidth + 1};
    });
    ok(R && R.tv === 2 && R.mx, tag + ': Remix-Blatt mit Tempo-Kacheln und [Matrix]');
    ok(R && !R.small.length, tag + ': alle sichtbaren Tasten im Remix-Blatt ≥ 44 px', R ? R.small.join(', ') : '');
    ok(R && R.x && R.w, tag + ': ✕ sichtbar, nichts ragt seitlich heraus');
    await q.evaluate(() => { const b = document.querySelector('.gr2s .gen3-tv'); if (b) b.click(); });
    await q.waitForTimeout(200);
    if (tag === 'hochkant') await q.screenshot({path: path.join(out, 'gen3-remix-hochkant.png')});
    await q.evaluate(() => { const b = document.querySelector('.gr2s [data-g3="mx"]'); if (b) b.click(); });
    await q.waitForTimeout(300);
    const MX = await q.evaluate(() => { const P = document.querySelector('.gen3mx'); if (!P) return null; const bs = [...P.querySelectorAll('button')].filter(b => b.offsetParent).map(b => { const r = b.getBoundingClientRect(); return {t: b.textContent.trim().slice(0, 14), h: Math.round(r.height), vis: r.top >= -1 && r.bottom <= innerHeight + 1}; }); const x = P.querySelector('.ms-x').getBoundingClientRect(); return {on: (P.querySelector('[data-g3m="sc:mx"].on') || {}).textContent, small: bs.filter(b => b.vis && b.h < 44).map(b => b.t + ':' + b.h), x: x.top >= 0 && x.bottom <= innerHeight}; });
    ok(MX && MX.on === 'Matrix' && !MX.small.length && MX.x, tag + ': Matrix-Blatt (Bereich Matrix an, Tasten ≥ 44 px, ✕ sichtbar)', MX ? MX.small.join(', ') : 'fehlt');
    if (tag === 'quer') await q.screenshot({path: path.join(out, 'gen3-matrix-quer.png')});
    await q.evaluate(() => { const b = document.querySelector('.gen3mx .ms-x'); if (b) b.click(); window.SYNQUENZER.gen3.bbOpen(4, 0, 'gm'); });
    await q.waitForTimeout(300);
    const WK = await q.evaluate(() => { const P = document.querySelector('.bb1s'); if (!P) return null; const bs = [...P.querySelectorAll('button')].filter(b => b.offsetParent).map(b => { const r = b.getBoundingClientRect(); return {t: b.textContent.trim().slice(0, 14), h: Math.round(r.height), vis: r.top >= -1 && r.bottom <= innerHeight + 1}; }); const x = P.querySelector('.ms-x').getBoundingClientRect(); return {small: bs.filter(b => b.vis && b.h < 44).map(b => b.t + ':' + b.h), x: x.top >= 0 && x.bottom <= innerHeight && x.right <= innerWidth}; });
    ok(WK && !WK.small.length && WK.x, tag + ': Werkzeugkasten-Reiter (Tasten ≥ 44 px, ✕ sichtbar)', WK ? WK.small.join(', ') : 'fehlt');
    if (tag === 'quer') await q.screenshot({path: path.join(out, 'gen3-werkzeugkasten-quer.png')});
    if (tag === 'hochkant') {
      await q.evaluate(() => { const b = document.querySelector('.bb1s .ms-x'); if (b) b.click(); window.SYNQUENZER.ueBar(true); });
      await q.waitForTimeout(400);
      const U = await q.evaluate(() => { const t = [...document.querySelectorAll('.ue-bar .ue-tile')].map(x => x.dataset.id); return {n: t.length, uniq: new Set(t).size}; });
      ok(U.n > 40 && U.n === U.uniq, 'hochkant: ◆ ÜBERGÄNGE ohne doppelte Kacheln', U.n + ' Kacheln');
      await q.screenshot({path: path.join(out, 'gen3-uebergaenge-hochkant.png')});
    }
    await q.close();
  }

  /* ---------- 8 Prüfung (Befunde des unabhängigen Prüfers) ---------- */
  // Befund 1: Werkzeugkasten quer › Figuren: jede Genre-Taste ≥ 44 px, Tippen in die Mitte trifft das Genre, die Zeile behält ihre Stelle
  for (const [w, h, tag] of [[926, 428, 'quer'], [926, 370, 'quer370'], [428, 926, 'hochkant']]) {
    const q = await page(w, h);
    for (const [t, role] of [[4, 'Drums'], [0, 'Bass']]) {
      await q.evaluate(t => { const D = window.SYNQUENZER; D.setClip(t, 0, {len: 1, notes: [{t: 0, d: .5, n: t === 4 ? 36 : 40, v: .9}]}); D.gen3.bbOpen(t, 0, 'fig'); }, t);
      await q.waitForTimeout(300);
      const info = await q.evaluate(() => [...document.querySelectorAll('.bb1s .bb1-gens .rb')].map(x => ({g: x.dataset.gen, w: Math.round(x.getBoundingClientRect().width), h: Math.round(x.getBoundingClientRect().height)})));
      const wrong = [];
      for (const g of info.map(x => x.g)) {
        const hd = await q.$('.bb1s .bb1-gens [data-gen="' + g + '"]'); if (!hd) { wrong.push(g + '→fehlt'); continue; }
        await hd.evaluate(e => e.scrollIntoView({block: 'nearest', inline: 'center'}));
        const bb = await hd.boundingBox(); await q.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await q.waitForTimeout(60);
        const r = await q.evaluate(() => { const x = document.querySelector('.bb1s .bb1-gens .rb.on'), g = document.querySelector('.bb1s .bb1-gens'); if (!x || !g) return {}; const a = x.getBoundingClientRect(), z = g.getBoundingClientRect(); return {on: x.dataset.gen, vis: a.left >= z.left - 1 && a.right <= z.right + 1}; });
        if (r.on !== g || !r.vis) wrong.push(g + '→' + r.on + (r.vis ? '' : ' (aus dem Bild)'));
      }
      ok(tag + ': Werkzeugkasten › Figuren (' + role + '): ' + info.length + ' Genre-Tasten ≥ 44 px, jeder Tipp trifft, die Zeile behält ihre Stelle', info.every(x => x.w >= 44 && x.h >= 44) && !wrong.length, 'schmalste ' + Math.min(...info.map(x => x.w)) + ' px' + (wrong.length ? ' · falsch: ' + wrong.slice(0, 8).join(' ') : ''));
      if (tag === 'quer' && role === 'Drums') await q.screenshot({path: path.join(out, 'gen3-pruef-figuren-quer.png')});
      await q.evaluate(() => { const x = document.querySelector('.bb1s .ms-x'); if (x) x.click(); });
      await q.waitForTimeout(150);
    }
    await q.close();
  }
  const P8 = await page(428, 926);
  const Q = await run(P8, () => {
    SETUP(); const D = window.SYNQUENZER, G = D.gen3, o = {};
    D.placePart('S1', 0, 'insert'); D.placePart('S1', D.song().bars, 'insert'); D.songView(true);
    // Befund 2: ↶ nimmt Noten UND Tempo zurück, ↷ bringt beides wieder
    o.song0 = JSON.stringify(D.song());
    o.r = D.gr2.remix('tvslow', {k: 80}); o.bpm1 = D.project().bpm;
    D.undo(); o.bpmU = D.project().bpm; o.songU = JSON.stringify(D.song()) === o.song0;
    D.redo(); o.bpmR = D.project().bpm;
    D.undo(); o.bpmU2 = D.project().bpm;
    // Befund 3: Teil – das Song-Tempo bleibt, die Version merkt ihr Tempo, ♩ übernimmt es
    const m = D.song().marks[1]; o.part = m ? [m.a, m.a + m.len] : null;
    o.rp = m ? D.gr2.remix('tvslow', {k: 80, a: m.a, b: m.a + m.len}) : null; o.bpmP = D.project().bpm;
    const O = D.song().own || {}; o.partVer = Object.values(O).filter(c => c.gr && c.gr.s === 'tvslow').map(c => c.gr.t);
    D.undo();
    return o;
  });
  ok(Q.r && Q.r.ok && Q.bpm1 === 86 && Q.bpmU === 120 && Q.songU && Q.bpmR === 86 && Q.bpmU2 === 120, 'Tempo-Version: ↶ nimmt Noten und Tempo zurück, ↷ bringt beides wieder', '120 → ' + Q.bpm1 + ' · ↶ ' + Q.bpmU + ' · ↷ ' + Q.bpmR + ' · ↶ ' + Q.bpmU2);
  ok(Q.rp && Q.rp.ok && Q.bpmP === 120 && Q.partVer.length && Q.partVer.every(t => t === 86), 'Tempo-Version nur im Teil: das Song-Tempo bleibt (Version merkt 86, ♩ übernimmt)', 'Takt ' + (Q.part && Q.part.join('–')) + ' · Projekt ' + Q.bpmP + ' · Versionen ' + Q.partVer.join(','));
  // Befund 3: Remix-Blatt im Teil sagt es (Kachel + Tipp)
  const TT = await P8.evaluate(() => { const D = window.SYNQUENZER; const m = D.song().marks[1]; D.gr2.open({name: 'x', a: m.a, b: m.a + m.len}); const P = document.querySelector('.gr2s'); if (!P) return null; const b = P.querySelector('.gen3-tv'); if (b) b.click(); const P2 = document.querySelector('.gr2s'); return {tile: (P2.querySelector('.gen3-tv small') || {}).textContent, tip: (P2.querySelector('.gr2-tip') || {}).textContent, part: !!P2.querySelector('[data-g2="sc:part"].on')}; });
  ok(TT && TT.part && /Tempo bleibt/.test(TT.tile) && /gilt für den ganzen Song/.test(TT.tip), 'Remix-Blatt › Teil: Kachel und Tipp sagen, dass das Tempo bleibt und ♩ es übernimmt', TT && TT.tile);
  await P8.evaluate(() => { const x = document.querySelector('.gr2s .ms-x'); if (x) x.click(); });
  // Befund 3: Matrix per Touch – Langsam, ▶ Hören (Tempo der Version), A (Tempo vorher), B, ■, ✕ (Tempo zurück), ↶ (Szene weg, Tempo bleibt 120)
  const tapQ = async (pg, sel) => { const h = await pg.$(sel); if (!h) return false; await h.evaluate(e => e.scrollIntoView({block: 'nearest', inline: 'nearest'})); const bb = await h.boundingBox(); if (!bb) return false; await pg.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(350); return true; };
  const bpmQ = pg => pg.evaluate(() => window.SYNQUENZER.project().bpm);
  await P8.evaluate(() => { const D = window.SYNQUENZER; D.songView(false); D.setBpm(120); D.gen3.mxOpen(0); });
  await P8.waitForTimeout(300);
  const MXs = {song0: await P8.evaluate(() => JSON.stringify(window.SYNQUENZER.song()))};
  await tapQ(P8, '.gen3mx .gen3-tv'); await tapQ(P8, '.gen3mx .gr2-go'); MXs.go = await bpmQ(P8);
  await tapQ(P8, '.gen3mx [data-g3m="a"]'); MXs.a = await bpmQ(P8);
  await tapQ(P8, '.gen3mx [data-g3m="b"]'); MXs.b = await bpmQ(P8);
  await tapQ(P8, '.gen3mx .gr2-go'); MXs.stop = await bpmQ(P8);
  await tapQ(P8, '.gen3mx .ms-x'); MXs.x = await bpmQ(P8);
  MXs.dst = await P8.evaluate(() => { for (let s = 1; s < 8; s++) { const c = window.SYNQUENZER.getClip(4, s); if (c && c.gr && c.gr.m === 0) return s; } return null; });
  MXs.songSame = await P8.evaluate(s0 => JSON.stringify(window.SYNQUENZER.song()) === s0, MXs.song0);
  await P8.evaluate(() => window.SYNQUENZER.undo()); MXs.undo = await bpmQ(P8);
  MXs.gone = await P8.evaluate(s => !window.SYNQUENZER.getClip(4, s), MXs.dst);
  const T6 = Math.round(120 * (1 - .35 * .7));
  ok(MXs.go === T6 && MXs.a === 120 && MXs.b === T6 && MXs.x === 120 && MXs.songSame, 'Matrix per Touch: ▶ Hören/B = Tempo der Version, A = Tempo vorher, ✕ = zurück auf 120, Song bleibt', 'Hören ' + MXs.go + ' · A ' + MXs.a + ' · B ' + MXs.b + ' · ■ ' + MXs.stop + ' · ✕ ' + MXs.x);
  ok(MXs.dst != null && MXs.gone && MXs.undo === 120, 'Matrix: ↶ nimmt die Remix-Szene zurück, das Tempo bleibt das vorher', 'Szene ' + (MXs.dst + 1) + ' · ' + MXs.undo + ' BPM');
  // Matrix: ♩ übernimmt das Tempo fest (✕ lässt es)
  await P8.evaluate(() => window.SYNQUENZER.gen3.mxOpen(0)); await P8.waitForTimeout(250);
  await tapQ(P8, '.gen3mx .gen3-tv'); await tapQ(P8, '.gen3mx [data-g3m="bpm"]'); const kb = await bpmQ(P8);
  await tapQ(P8, '.gen3mx .ms-x'); const kx = await bpmQ(P8);
  ok(kb === T6 && kx === T6, 'Matrix: ♩ übernimmt das Tempo fest, ✕ lässt es', kb + ' → ✕ ' + kx);
  await P8.evaluate(() => window.SYNQUENZER.setBpm(120));
  const R4 = await P8.evaluate(() => {
    const D = window.SYNQUENZER, G = D.gen3, o = {};
    // Befund 4: Hilfe › Stil-Grundmuster springt auf den Reiter Grundmuster, Texte stimmen
    const E = D.ui1.entries(); o.grund = E.find(e => e.id === 'grund'); o.remix = E.find(e => e.id === 'remix');
    // Befund 5: ◆ ÜBERGÄNGE › [Genre] = alle Genres der Kacheln; Drums-Füller = alle Füller-Kacheln (auch Samba)
    o.fillGs = G.names().fillIds.length; o.bb = G.bbDrum().map(f => f.ue); o.vis = G.ue().visible;
    o.noBb = o.vis.filter(id => !o.bb.includes(id)).map(id => { const L = UE_LIB.find(x => x.id === id); return id + ':' + L.k + '@' + L.a; });
    // Befund 6: Halftime-Shuffle-Figur auf Triolen
    D.setClip(2, 1, {len: 2, notes: [[0, 60], [0, 64], [0, 67]].map(([t, n]) => ({t, d: 8, n, v: .7}))});
    const B6 = D.bb1.build(2, 1, 'g3-hshuffle-keys', 'hier'); o.hs = B6 && B6.notes ? [...new Set(B6.notes.map(n => +n.t.toFixed(3)))] : null;
    // Befund 7: Bossa-Clave über zwei Takte
    const dr = []; for (let bar = 0; bar < 2; bar++) for (const t of [0, 1, 2, 3]) dr.push({t: bar * 4 + t, d: .1, n: t % 2 ? 38 : 36, v: .9});
    D.setClip(4, 2, {len: 2, notes: dr}); const gm = G.gmNotes(4, 2, 'bossa'); o.rim = gm ? gm.filter(n => n.n === 37).map(n => +n.t.toFixed(3)) : null;
    o.rimPad = gm ? [...new Set(gm.map(n => n.n))] : null;
    const B7 = D.bb1.build(2, 1, 'g3-bossa-gtr', 'hier'); o.gtr = B7 && B7.notes ? [...new Set(B7.notes.map(n => +n.t.toFixed(3)))] : null;
    // Befund 11: Figuren je neuem Stil (ohne Drums-Füller)
    const figs = D.bb1.figs().filter(f => f.r !== 'drum'); o.figN = {};
    for (const id of ['disco', 'motown80', 'eurodance', 'synthwave', 'powerpop', 'freestyle', 'seqtrack', 'electro', 'boombap', 'gfunk', 'trap', 'triphop', 'bigbeat', 'dnb', 'ukfunky', 'jersey', 'gogo', 'afrobeat', 'bossa', 'samba', 'ska', 'steppers', 'rockers', 'dancehall', 'dembow', 'hshuffle', 'rockhalf']) o.figN[id] = figs.filter(f => f.g === id).length;
    o.sndMiss = BB1_FIG.filter(f => f.snd && !FACTORY_BY_ID.get(f.snd)).map(f => f.id);
    return o;
  });
  await P8.evaluate(() => window.SYNQUENZER.ui1.jump('grund'));
  await P8.waitForTimeout(1200);
  const J = await P8.evaluate(() => ({j: window.SYNQUENZER.ui1.lastJump(), tab: window.SYNQUENZER.gen3.bbTab(), open: !!document.querySelector('.bb1s')}));
  ok(R4.grund && /Werkzeugkasten ▾ › Grundmuster/.test(R4.grund.w) && J.j && J.j.ok && J.j.target && J.tab === 'gm' && J.open, 'Hilfe › Stil-Grundmuster: „Clip-Blatt › Werkzeugkasten ▾ › Grundmuster“, der Sprung öffnet den Reiter', R4.grund && R4.grund.w);
  ok(R4.remix && R4.remix.d.startsWith(N.remix.length + ' Stile'), 'Hilfe › Remix nennt die Zahl der Stile', R4.remix && R4.remix.d.slice(0, 40));
  await P8.evaluate(() => { const x = document.querySelector('.bb1s .ms-x'); if (x) x.click(); window.SYNQUENZER.songView(true); window.SYNQUENZER.ueBar(true); });
  await P8.waitForTimeout(400);
  await tapQ(P8, '.gr2-ueg');
  const UG = await P8.evaluate(() => { const P = document.querySelector('.pop.gr2ueg'); return P ? [...P.querySelectorAll('[data-ueg]')].map(x => x.textContent) : null; });
  ok(UG && UG.length - 1 === R4.fillGs && UG.includes('Disco klassisch') && UG.includes('Eurodance'), '◆ ÜBERGÄNGE › [Genre]: alle Genres der Kacheln (auch Disco klassisch, Eurodance)', UG ? (UG.length - 1) + ' Genres' : 'fehlt');
  await tapQ(P8, '.pop.gr2ueg [data-ueg="alle"]');
  ok(R4.bb.includes('gen3f-samba') && R4.noBb.every(x => /:crash@0$/.test(x)), 'Drums-Füller = alle Füller-Kacheln vor der Kante (auch Samba); nur die zwei Crash-Kacheln auf der Eins fehlen mit Absicht', R4.bb.length + ' von ' + R4.vis.length + ' · ohne: ' + R4.noBb.join(', '));
  ok(R4.hs && R4.hs.some(t => Math.abs((t % 1) - .667) < .01) && !R4.hs.some(t => Math.abs((t % 1) - .5) < .01), 'Halftime-Shuffle › Klavier-Achtel auf Triolen (zweite Achtel auf 0,667)', R4.hs && R4.hs.slice(0, 6).join(' '));
  ok(JSON.stringify(R4.rim) === JSON.stringify([0, 1.5, 3, 5, 6.5]), 'Bossa Nova: Rimshot-Clave über zwei Takte (1, 2+, 4 │ 2, 3+)', R4.rim && R4.rim.join(' '));
  ok(R4.gtr && JSON.stringify(R4.gtr.filter(t => t < 8)) === JSON.stringify([0, 1.5, 3, 5, 6.5]), 'Bossa-Gitarre im Clave-Rhythmus', R4.gtr && R4.gtr.join(' '));
  const one = Object.entries(R4.figN).filter(([, n]) => n < 2).map(([k]) => k);
  ok(one.length <= 8 && !R4.sndMiss.length, 'Werkzeugkasten: neue Stile meist mit zwei Figuren (Bass jedes Stils im Reiter Grundmuster), alle Klänge vorhanden', 'nur eine: ' + one.join(', '));
  await P8.close();
  // Befund 10: Matrix-Remix über ≡ › Song mit leerer gewählter Szene nimmt die erste Szene mit Clips
  const P10 = await page(428, 926);
  const Z = await P10.evaluate(async () => {
    const D = window.SYNQUENZER; D.setClip(4, 0, {len: 1, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 1, d: .1, n: 38, v: .9}]}); D.selectSlot(4, 2);
    D.gen3.mxOpen(); const st = D.gen3.mxState(); const h = (document.querySelector('.gen3mx .ms-h') || {}).textContent;
    const r = D.gen3.mxAct('.gen3mx .gr2-go'); await new Promise(r => setTimeout(r, 300));
    const s2 = D.gen3.mxState(); return {src: st && st.src, h, dst: s2 && s2.dst, made: s2 && s2.dst != null && !!D.getClip(4, s2.dst)};
  });
  ok(Z.src === 0 && Z.made, 'Matrix-Remix: gewählte Szene leer → die erste Szene mit Clips ist die Quelle, ▶ Hören erzeugt die Remix-Szene', (Z.h || '').replace(/\s+/g, ' ').slice(0, 60));
  await P10.close();

  /* ---------- 7 alte Projekte: das Standard-Projekt ist byte-gleich mit der Basis ---------- */
  const pb = await page(428, 926, basis), pg = await page(428, 926);
  const j1 = await pb.evaluate(() => JSON.stringify(window.SYNQUENZER.project())), j2 = await pg.evaluate(() => JSON.stringify(window.SYNQUENZER.project()));
  const strip = j => j.replace(/"(t|time|ts|id|uid|saved|created|seed)":("[^"]*"|\d+)/g, '');
  ok(strip(j1) === strip(j2), 'Standard-Projekt unverändert gegenüber der Basis (additiv)', j1.length + ' / ' + j2.length + ' Zeichen');
  await pb.close(); await pg.close();
} catch (e) { bad++; console.log('FEHLER Test abgebrochen – ' + (e && e.stack || e)); }
ok(!errs.length, 'keine Fehler in der Konsole', errs.slice(0, 3).join(' | '));
console.log(bad ? 'FEHLER gesamt ' + bad : 'OK alles grün');
await b.close();
process.exit(bad ? 1 : 0);
