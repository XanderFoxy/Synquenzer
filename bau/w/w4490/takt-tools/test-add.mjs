
/* ---------- 9) Prüfung (unabhängiger Prüfer, Befunde 1–7) ---------- */
// P1: Song-Taktart 3/4 → [Clips umwandeln]: die Szenen-Clips werden 3/4 (Matrix spielt 3-Schlag-Schleifen), keine doppelten Versionen, ein ↶
const P1 = await p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms)), o = {};
  stop(); SYNQUENZER.loadDemo(); ensureAudio(); await wait(200);
  SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]);
  const own0 = Object.keys(S.song.own || {}).length, u0 = UNDO.length;
  setSongTs('3/4'); const tb = [...EL.toast.querySelectorAll('button')].find(x => /Clips umwandeln/.test(x.textContent)); o.btn = !!tb; if (tb) tb.click(); await wait(150);
  o.undoSteps = UNDO.length - u0;
  o.scene = S.tracks.map(tr => (tr.stimme || !tr.clips[0] ? null : (tr.clips[0].ts || '4/4') + '/' + clipB(tr.clips[0]))).filter(Boolean);
  o.newOwn = Object.keys(S.song.own || {}).length - own0;
  let all = 0, n34 = 0; for (let t = 0; t < NT(); t++) { if (S.tracks[t].stimme) continue; for (let x = 0; x < S.song.bars; x++) { const h = sx9At(S.song, t, x); if (!h) continue; all++; const c = h.id ? S.song.own[h.id] : S.tracks[t].clips[h.s]; if (c && c.ts === '3/4') n34++; } }
  o.song = {all, n34};
  R.selS = 0; launchScene(0); if (!R.playing) play(); await wait(900);
  o.loop = S.tracks.map((tr, t) => (R.slot[t] >= 0 && tr.clips[R.slot[t]] && !tr.stimme ? clipB(tr.clips[R.slot[t]]) : null)).filter(x => x != null);
  stop(); undo(); await wait(80);
  o.back = S.tracks.filter(tr => !tr.stimme && tr.clips[0]).every(tr => !tr.clips[0].ts) && S.ts === '3/4';
  undo(); return o;
});
ok('P1 Song-Taktart 3/4 + [Clips umwandeln]: Szenen-Clips 3/4 (Schleifen 3/6 Schläge), Song überall 3/4, keine doppelten Versionen, ein ↶', P1.btn && P1.scene.every(x => x.startsWith('3/4/')) && P1.loop.every(x => x % 3 === 0) && P1.song.n34 === P1.song.all && P1.newOwn === 0 && P1.undoSteps === 1 && P1.back, P1);
// P1b: Teil mit eigener Taktart (6/8, schon umgewandelt) bleibt beim Song-Wechsel richtig (vom Original gefaltet, nie doppelt)
const P1b = await p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms)), o = {};
  stop(); SYNQUENZER.loadDemo(); await wait(100);
  SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]);
  const m = S.song.marks[1]; setMarkTs(m.id, '7/8'); SYNQUENZER.tkt.foldMarks([m.id]); await wait(50);
  const t = [...Array(NT()).keys()].find(k => { const h = sx9At(S.song, k, m.a); return h && h.id; }), h0 = sx9At(S.song, t, m.a), direct = JSON.stringify(S.song.own[h0.id].notes);
  setSongTs('3/4'); SYNQUENZER.tkt.foldSong(null); await wait(50);
  const h1 = sx9At(S.song, t, m.a), c1 = h1.id ? S.song.own[h1.id] : S.tracks[t].clips[h1.s];
  o.ts = c1.ts; o.same = JSON.stringify(c1.notes) === direct; o.v1ts = S.tracks[t].clips[h1.s].ts;
  undo(); undo(); return o;
});
ok('P1b Teil in 7/8 bleibt nach Song → 3/4 dieselbe 7/8-Fassung (aus dem Original, nicht doppelt gefaltet)', P1b.ts === '7/8' && P1b.same && P1b.v1ts === '3/4', P1b);

// P2/P3: Dur → Moll – Leitton nach der Harmonie der Stelle über alle Spuren (mit und ohne Akkord-Zeile)
const moll = rowOn => p.evaluate(async rowOn => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  stop(); SYNQUENZER.loadDemo(); await wait(100); setProjectKey({root: 0, scale: 'ionian'});
  const syn = [0, 1, 2, 3].filter(k => S.tracks[k] && S.tracks[k].kind === 'synth' && !percIs(S.tracks[k]));
  const tb = syn[0], tc = syn[2] != null ? syn[2] : syn[1], tl = syn[3] != null ? syn[3] : syn[1], N = (t, n, d) => ({t, n, d, v: .8}), K = {root: 0, scale: 'ionian', src: 'user'};
  const ch = [[0, 60], [0, 64], [0, 67], [2, 64], [2, 67], [2, 71], [4, 65], [4, 69], [4, 72], [6, 67], [6, 71], [6, 74]].map(([t, n]) => N(t, n, 1.9));
  const lead = [[0, 72, 1.9], [2, 71, 1.9], [4, 72, 1.9], [6, 74, .6], [6.66, 71, .6], [7.33, 67, .6]].map(([t, n, d]) => N(t, n, d));
  S.tracks[tl].clips[0] = {len: 2, key: Object.assign({}, K), notes: lead}; S.tracks[tc].clips[0] = {len: 2, key: Object.assign({}, K), notes: ch}; S.tracks[tb].clips[0] = {len: 2, key: Object.assign({}, K), notes: [[0, 36], [2, 40], [4, 41], [6, 43]].map(([t, n]) => N(t, n, 1.8))};
  for (const t of [tl, tc, tb]) clipChanged(t, 0);
  S.scenes[0].chords = rowOn ? normChordRow({len: 2, ch: [{b: 0, tg: {root: 0, kind: 'chord', quality: 'maj'}}, {b: 2, tg: {root: 4, kind: 'chord', quality: 'min'}}, {b: 4, tg: {root: 5, kind: 'chord', quality: 'maj'}}, {b: 6, tg: {root: 7, kind: 'chord', quality: 'maj'}}]}) : null;
  SYNQUENZER.songFromChain([{scene: 0, bars: 2}]);
  SYNQUENZER.tkt.mode('g');
  const at = t => { const h = sx9At(S.song, t, 0); return h && h.id ? S.song.own[h.id] : S.tracks[t].clips[0]; }, nm = n => ['C', 'Cis', 'D', 'Es', 'E', 'F', 'Fis', 'G', 'As', 'A', 'B', 'H'][PCx(n)];
  const grp = c => { const g = {}; for (const n of c.notes) (g[n.t] || (g[n.t] = [])).push(nm(n.n)); return g; };
  const sound = (a, b) => { const s = new Set(); for (const c of [at(tc), at(tl)]) for (const n of c.notes) if (n.t < b && n.t + n.d > a) s.add(nm(n.n)); return [...s].sort().join(' '); };
  const o = {ch2: grp(at(tc))[2].join(' '), ch6: grp(at(tc))[6].join(' '), lead: at(tl).notes.map(n => n.t + ':' + nm(n.n)).join(' '), overG: sound(6.7, 7.3), overIII: sound(2, 3.9)};
  undo(); return o;
}, rowOn);
const P2a = await moll(true), P2b = await moll(false);
ok('P2 Dur→Moll: iii-Akkord im Akkord-Clip wird Es-Dur (Es G B), nicht übermäßig – mit und ohne Akkord-Zeile', P2a.ch2 === 'Es G B' && P2b.ch2 === 'Es G B', {mitZeile: P2a.ch2, ohneZeile: P2b.ch2});
ok('P3 Dur→Moll: Melodie-H über der Dominante bleibt H wie im Akkord (G H D), nie H und B zugleich; über Es-Dur wird es B', P2a.ch6 === 'G H D' && /6\.66:H/.test(P2a.lead) && P2a.overG === 'D G H' && /6\.66:H/.test(P2b.lead) && P2b.overG === 'D G H' && /^0:C 2:B /.test(P2a.lead) && P2a.overIII === 'B Es G', {mitZeile: P2a, ohneZeile: P2b});

// P4: Matrix mit 3/4-Clips (Song 4/4): Szenenwechsel am 3/4-Taktstrich; zurück zu 4/4-Clips: Takt ab deren Anfang (Klicks gemessen)
const P4 = await p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms)), o = {};
  stop(); SYNQUENZER.loadDemo(); ensureAudio(); await wait(250);
  for (let t = 0; t < NT(); t++) if (S.tracks[t].clips[0] && !S.tracks[t].stimme) setClipTs(t, 0, '3/4');
  const log = [], orig = window.click; window.click = function (t, acc, soft) { log.push([+t2b(t).toFixed(2), acc ? 'A' : soft ? 's' : 'n']); return orig.apply(this, arguments); };
  S.settings.metro = true; R.selS = 0; launchScene(0); if (!R.playing) play();
  while (t2b(AU.ctx.currentTime) < 1.4) await wait(10);
  launchScene(1); o.at = +t2b(AU.ctx.currentTime).toFixed(2);
  await wait(1200); o.cs1 = [...new Set(S.tracks.map((tr, t) => (R.slot[t] === 1 ? +R.cstart[t].toFixed(2) : null)).filter(x => x != null))];
  while (t2b(AU.ctx.currentTime) < 4.3) await wait(10);
  launchScene(0); await wait(1500);
  o.cs0 = [...new Set(S.tracks.map((tr, t) => (R.slot[t] === 0 ? +R.cstart[t].toFixed(2) : null)).filter(x => x != null))];
  const takt = []; const T0 = performance.now(); while (performance.now() - T0 < 900) { await wait(40); const x = EL.taktVal.textContent; if (takt[takt.length - 1] !== x) takt.push(x); }
  stop(); window.click = orig; S.settings.metro = false;
  o.clicks = log.filter(x => x[0] >= 0).slice(0, 14).map(x => x.join('')).join(' '); o.takt = takt; return o;
});
ok('P4 Matrix 3/4-Clips → Szene 2 (4/4) startet am 3/4-Taktstrich (Schlag 3), Betonung am neuen Clip-Anfang; zurück zu 3/4 am 4/4-Takt ab Schlag 3 (Schlag 7)', P4.cs1.join() === '3' && P4.cs0.join() === '7' && /^0A 1n 2n 3A 4n 5n 6n 7A 8n 9n 10A/.test(P4.clicks), P4);

// P5: Meldung im Marken-Blatt (Teil kommt mehrmals vor): [Clips umwandeln] [Für alle …] [↶] – alle sichtbar, ↶ wirkt
const P5 = await p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms)), o = {};
  stop(); SYNQUENZER.loadDemo(); await wait(150); closePop();
  SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}]);
  const m = S.song.marks[0]; openMarkSheet(m.id); await wait(250);
  const tb = [...UI.pop.el.querySelectorAll('button')].find(x => /Taktart/.test(x.textContent)); if (tb) tb.click(); await wait(150);
  const b34 = UI.pop && UI.pop.el.querySelector('.t1ts button[data-ts="3/4"]'); if (b34) b34.click(); await wait(200);
  const bs = [...EL.toast.querySelectorAll('button')];
  o.btns = bs.map(x => { const r = x.getBoundingClientRect(); return {l: x.textContent, h: Math.round(r.height), in: r.left >= 0 && r.right <= innerWidth + .5, clip: x.scrollWidth > x.clientWidth + 1}; });
  const u = bs.find(x => /Rückgängig/.test(x.textContent)); if (u) u.click(); await wait(100);
  o.after = S.song.marks[0].ts || null; closePop(); return o;
});
ok('P5 Marken-Blatt-Meldung (Teil mehrmals): [Clips umwandeln] [Für alle „Szene 1“] [Rückgängig] – alle sichtbar, nicht abgeschnitten, ↶ wirkt', P5.btns.length === 3 && /Clips umwandeln/.test(P5.btns[0].l) && /Für alle/.test(P5.btns[1].l) && /Rückgängig/.test(P5.btns[2].l) && P5.btns.every(b => b.in && !b.clip && b.h >= 40) && P5.after === null, P5);

// P6: Rack – Kompressor per LED im offenen Rack an: GR erscheint ohne Schließen/Öffnen
const P6 = await p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  stop(); SYNQUENZER.loadDemo(); ensureAudio(); await wait(300);
  const t = [0, 1, 2, 3].find(k => S.tracks[k].kind === 'synth' && S.tracks[k].clips[0] && !S.tracks[k].mix) ?? 2;
  if (S.tracks[t].mix) { const s = S.tracks[t].mix.sec; if (s) S.tracks[t].mix = {sec: s}; else delete S.tracks[t].mix; }
  SYNQUENZER.tkt.rackOpen(t); await wait(300);
  const had = !!(AU.tracks[t] && AU.tracks[t].mixa && AU.tracks[t].mixa.node);
  UI.pop.el.querySelector('button[data-rk="led:eq"]').click(); await wait(200);
  mx1EqSet(t, 'thr', -60); mx1EqSet(t, 'ra', 8);
  R.selS = 0; launchScene(0); if (!R.playing) play();
  const seen = []; for (let k = 0; k < 12; k++) { await wait(200); const d = document.querySelector('.tkr-dev[data-dev="eq"] .tkr-mtr em'); seen.push(d && d.textContent); }
  stop(); undo(); closePop(); return {had, seen: [...new Set(seen)]};
});
ok('P6 Rack: EQ · KOMP per LED im offenen Rack an → GR-Anzeige zeigt die Reduktion (ohne neu öffnen)', !P6.had && P6.seen.some(x => /^−\d/.test(x || '')), P6);

// P7: Rack – keine abgeschnittene Beschriftung (alle Spuren, hochkant + quer); MASTER zeigt „Ausgang“
const P7r = {};
for (const [W, H, tag] of [[428, 926, 'hochkant'], [926, 428, 'quer']]) {
  await p.setViewportSize({width: W, height: H}); await p.waitForTimeout(300);
  P7r[tag] = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms)), cut = new Set(); let lab = false;
    stop(); SYNQUENZER.loadDemo(); await wait(150); SYNQUENZER.tkt.rackOpen(0); await wait(300);
    for (let k = 0; k < NT(); k++) {
      for (const e of document.querySelectorAll('.tktrack .knob .kl, .tktrack .knob .kv')) if (e.scrollWidth > e.clientWidth + 1) cut.add(e.textContent);
      lab = lab || [...document.querySelectorAll('.tktrack .tkr-dev[data-dev="master"] .knob .kl')].some(e => e.textContent.trim().toLowerCase() === 'ausgang');
      const nx = UI.pop && UI.pop.el.querySelector('button[data-rk="next"]'); if (!nx) break; nx.click(); await wait(120);
    }
    closePop(); return {cut: [...cut], ausgang: lab};
  });
}
await p.setViewportSize({width: 428, height: 926}); await p.waitForTimeout(250);
ok('P7 Rack: keine abgeschnittene Regler-Beschriftung auf allen Spuren (hochkant + quer), MASTER-Regler heißt „Ausgang“', P7r.hochkant.cut.length === 0 && P7r.quer.cut.length === 0 && P7r.hochkant.ausgang && P7r.quer.ausgang, P7r);
