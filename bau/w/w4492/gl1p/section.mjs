
/* ---------- 6) GL1-P: Prüfer-Befunde 1–5 ---------- */
const PSET = `stop(); SYNQUENZER.loadDemo(); ensureAudio(); GL1.hint = true;
  for (let t = 0; t < NT(); t++) if (S.tracks[t]) for (let s = 0; s < NS(); s++) S.tracks[t].clips[s] = null;
  S.tracks[0].clips[0] = {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [0, 2, 4, 5, 7, 9, 11, 12].map((d, k) => ({t: k * .5, d: .4, n: 60 + d, v: .8}))};
  for (let t = 0; t < NT(); t++) clipChanged(t, 0); R.selS = 0; UNDO.length = 0; REDO.length = 0;`;
{
  const p = await openPage(file, 926, 428, 2);
  await p.evaluate(s => (new Function(s))(), PSET); await W(p, 300);
  // P1: Song-Kachel (◧) je Durchlauf – hin und her, 4 Takte, 1-Takt-Clip
  const T = await p.evaluate(() => { SYNQUENZER.lf1Dir(0, 0, {dir: 'pend', g: '1/8'}); SYNQUENZER.songFromChain([{scene: 0, bars: 4}]);
    setSongView(true); UI.svGlass = true; svLayout(); SV.cellW = 90; SV.x = 0; UI.dirty.song = true; svDraw(true);
    const c = S.tracks[0].clips[0]; let lo = 127, hi = 0; for (const n of c.notes) { lo = Math.min(lo, n.n); hi = Math.max(hi, n.n); } const span = Math.max(hi - lo, 6), o = [];
    for (let bar = 0; bar < 4; bar++) { const run = ownRun(S.song, 0, bar), tn = svTileNotes(S.song, 0, run), tile = []; for (let k = 0; k < tn.p.length; k += 3) tile.push(Math.round(lo + (1 - tn.p[k + 2]) * span) - 60);
      const snd = a2Sound(S.song, 0, run.d0, run.d1, barBeat(run.d0)); o.push({tile: tile.join(' '), sound: snd.ns.map(n => n.n - 60).join(' ')}); }
    return o; });
  await W(p, 300); await hideToast(p);
  { const box = await p.evaluate(() => { const r = SV.cv.getBoundingClientRect(); return [r.left, r.top + SV.rulerH, 4 * SV.cellW + 10, SV.rowH * 2]; }); await p.screenshot({path: path.join(out, 'gl1p-kachel-hin-und-her.png'), clip: {x: box[0], y: box[1], width: box[2], height: box[3]}}); }
  ok('GL1-P 1: Song-Kachel (◧) bei „hin und her“ zeigt in jedem Takt den Durchlauf, der dort klingt (= a2Sound; vorher 4× der erste)', T.every(x => x.tile === x.sound) && new Set(T.map(x => x.tile)).size === 4, T);
  await p.evaluate(() => { UI.svGlass = false; setSongView(false); });
  // P2: Matrix-Vorschau und ROLLE „wie gespielt“ folgen dem Durchlauf, der gerade klingt (= lf1Pass = noteLog)
  const LV = {};
  for (const dir of ['pend', 'rnd']) {
    await p.evaluate(s => (new Function(s))(), PSET); await p.evaluate(d => SYNQUENZER.lf1Dir(0, 0, {dir: d, g: '1/8'}), dir); await W(p, 200);
    LV[dir] = await p.evaluate(async withRoll => {
      const wait = ms => new Promise(r => setTimeout(r, ms)), c = S.tracks[0].clips[0];
      let lo = 127, hi = 0; for (const n of c.notes) { lo = Math.min(lo, n.n); hi = Math.max(hi, n.n); } const span = Math.max(hi - lo, 6);
      const mini = () => { const svg = UI.cells[0][0].mini.innerHTML, re = /<rect( class="g1g")? x="([-\d.]+)" y="([-\d.]+)"/g; let m; const o = []; while ((m = re.exec(svg))) if (!m[1]) o.push([+m[2], Math.round(lo + (1 - +m[3] / 86) * span) - 60]); return o.sort((a, b) => a[0] - b[0]).map(q => q[1]).join(' '); };
      if (withRoll) { SYNQUENZER.gl1RollMode('played'); ROLLP.view = 'roll'; openRoll(0, 0); await wait(600); }
      SYNQUENZER.clearLog(); play(); launchScene(0);
      const seen = {}, t0 = performance.now();
      while (performance.now() - t0 < 11000) {
        await wait(60); const bA = audBeat(), cs = audCstart(0, bA); if (!(bA >= cs)) continue;
        const k = Math.floor((bA - cs) / 4), ph = bA - cs - 4 * k; if (ph < .8 || ph > 3.2 || seen[k]) continue;
        const I = SYNQUENZER.gl1Info(); seen[k] = {mini: mini(), roll: withRoll && I.roll ? I.roll.notes.map(q => q.n - 60).join(' ') : null, rp: withRoll && I.roll ? I.roll.p : null, rectsOk: !withRoll || !!I.roll && I.roll.rects.length > 0 && I.roll.rects.every(q => I.roll.notes.some(x => Math.abs(x.t - q.t) < 1e-4 && x.n === q.n)), want: lf1Pass(c, k).map(n => n.n - 60).join(' ')};
      }
      stop(); await wait(300);
      const log = SYNQUENZER.noteLog(400).filter(e => e.track === 0).sort((a, b) => a.beat - b.beat), b0 = log.length ? log[0].beat : 0;
      for (const k of Object.keys(seen)) seen[k].heard = log.filter(e => e.beat >= b0 + 4 * k - 1e-6 && e.beat < b0 + 4 * k + 4 - 1e-6).map(e => e.out - 60).join(' ');
      const after = mini(), first = lf1Pass(c, 0).map(n => n.n - 60).join(' ');
      let next = null; if (withRoll) { ED.roll.fitView('clip'); await wait(200); next = SYNQUENZER.gl1Info().roll; next = next ? {p: next.p, next: next.next} : null; }
      return {seen, after, first, next};
    }, dir === 'pend');
    if (dir === 'pend') { await shot(p, 'gl1p-rolle-hin-und-her-weiter.png'); await p.evaluate(() => closeRoll()); }
  }
  const P = Object.values(LV.pend.seen), Q = Object.values(LV.rnd.seen);
  ok('GL1-P 2: Matrix-Vorschau folgt beim Spielen dem Durchlauf, der klingt (hin und her, Zufall: Vorschau = lf1Pass(k) = noteLog, ≥ 4 Durchläufe); steht der Clip, wieder der erste', P.length >= 4 && Q.length >= 4 && P.concat(Q).every(x => x.mini === x.want && x.want === x.heard) && new Set(P.map(x => x.mini)).size >= 4 && LV.pend.after === LV.pend.first && LV.rnd.after === LV.rnd.first,
    {pend: LV.pend.seen, rnd: LV.rnd.seen, nachStopp: [LV.pend.after, LV.rnd.after]});
  ok('GL1-P 2: ROLLE „wie gespielt“ folgt beim Spielen dem Durchlauf, der klingt (hin und her); herausgezoomt zeigt sie hinter dem Clip-Ende blass, wie es weitergeht', P.every(x => x.roll === x.want && x.rectsOk) && LV.pend.next && LV.pend.next.p === 0 && LV.pend.next.next.join() === '1', {seen: P.map(x => ({p: x.rp, roll: x.roll, gezeichnetPasst: x.rectsOk})), weiter: LV.pend.next});
  await p._ctx.close();
}
// P3: Glas-Ansicht weit herausgezoomt: Gesang und Background nicht über den Teil-Blöcken
{
  const G = {};
  for (const [w, h] of [[428, 926], [926, 428]]) {
    const p = await openPage(file, w, h, 2);
    await p.evaluate(() => __gl1Setup()); await p.evaluate(() => { SYNQUENZER.chsOpen(true); closePop(); }); await W(p, 300);
    G[w + 'x' + h] = await p.evaluate(() => {
      setSongView(true); UI.svGlass = true; svLayout(); const st = stimmeT(); const pg = SV.pages ? SV.pages.findIndex(q => q.includes(st)) : 0; setTrackBank(Math.max(0, pg)); svLayout(); SV.cellW = 8; SV.x = 0; UI.dirty.song = true; svDraw(true);
      const g = SV.g, d = SV.dpr, rows = []; for (let r = 0; r < SV.rows.length; r++) if (SV.rows[r] === st || chsSvCode(SV.rows[r]) != null) rows.push(r);
      const v = S.song.vox && S.song.vox[0]; let n = 0, fremd = 0; const X = b => b * SV.cellW - SV.x;
      for (const r of rows) for (let q = 1; q < 4; q++) { const x = X(v.bar) + (X(v.bar + v.len) - X(v.bar)) * q / 4, y = SV.rulerH + r * SV.rowH + SV.rowH / 2; const px = g.getImageData(Math.round(x * d), Math.round(y * d), 1, 1).data; n++; if (!(px[0] > 150 && px[1] > 100 && px[2] < 110)) fremd++; }
      // jeder Teil-Block: in den Zeilen von STIMME und Background dieselbe Farbe wie in seiner obersten Spur-Zeile (nichts darüber gemalt)
      let other = 0, pts = 0; for (const m of S.song.marks) { const x0 = X(m.a) + 2, x1 = X(m.a + m.len) - 2; if (x1 - x0 < 2) continue; const ref = g.getImageData(Math.round((x0 + x1) / 2 * d), Math.round((SV.rulerH + SV.rowH * .5) * d), 1, 1).data;
        for (const r of rows) for (let q = 1; q < 4; q++) { const x = x0 + (x1 - x0) * q / 4, y = SV.rulerH + r * SV.rowH + SV.rowH / 2; const px = g.getImageData(Math.round(x * d), Math.round(y * d), 1, 1).data; pts++; if (Math.abs(px[0] - ref[0]) + Math.abs(px[1] - ref[1]) + Math.abs(px[2] - ref[2]) > 24) other++; } }
      return {glass: UI.svGlass, blocks: sx8Blocks(), n, fremd, blockPts: pts, blockOther: other};
    });
    await shot(p, `gl1p-glas-weit-${w}x${h}.png`);
    await p.evaluate(() => { UI.svGlass = false; setSongView(false); });
    await p._ctx.close();
  }
  ok('GL1-P 3: Glas-Ansicht (◧) weit herausgezoomt – Gesang und Background liegen nicht über den Teil-Blöcken (0 von 18 fremd; jeder Block in den Background-Zeilen sauber, auch der erste „S“-Teil)', Object.values(G).every(x => x.glass && x.blocks && x.n === 18 && x.fremd === 0 && x.blockPts > 0 && x.blockOther === 0), G);
}
// P4: ROLLE „wie gespielt“: die gewählte Note behält ihren hellen Auswahlrand; gespielte Noten haben keinen weißen Rand
{
  const p = await openPage(file, 428, 926, 2);
  await p.evaluate(s => (new Function(s))(), PSET);
  await p.evaluate(() => { SYNQUENZER.lf1Dir(0, 0, {dir: 'rev', g: '1/8'}); SYNQUENZER.gl1RollMode('played'); ROLLP.view = 'roll'; openRoll(0, 0); }); await W(p, 900);
  const at = await p.evaluate(() => ED.roll._xy(0.2, 60)); await p.touchscreen.tap(at.x, at.y); await W(p, 500);
  const meas = () => p.evaluate(() => {
    const cv = ED.roll.el.main, g = cv.getContext('2d'), R = cv.getBoundingClientRect(), d = cv.width / R.width, rowH = ED.roll.state.view.rowH;
    const edge = (t, n, dur) => { const a = ED.roll._xy(t, n), b = ED.roll._xy(t + dur, n), x0 = a.x - R.left, x1 = b.x - R.left, y0 = a.y - R.top - rowH / 2; let mx = 0; for (let yy = y0 + 1; yy <= y0 + 4; yy += .5) for (let x = x0 + 6; x < x1 - 6; x += 1) { const px = g.getImageData(Math.round(x * d), Math.round(yy * d), 1, 1).data; mx = Math.max(mx, .2126 * px[0] + .7152 * px[1] + .0722 * px[2]); } return Math.round(mx); };
    return {sel: ED.roll.selection.map(n => n.t + ':' + n.n).join(' '), selC4: edge(0, 60, .4), unselD4: edge(.5, 62, .4), playedC5: edge(0, 72, .4)};
  });
  const A = await meas(); await shot(p, 'gl1p-rolle-auswahl-wie-gespielt.png');
  await p.evaluate(() => SYNQUENZER.gl1RollMode('notated')); await W(p, 400); const B = await meas();
  await p.evaluate(() => { SYNQUENZER.gl1RollMode('played'); closeRoll(); });
  ok('GL1-P 4: ROLLE „wie gespielt“ – die gewählte Note ist so hell umrandet wie „wie notiert“; gespielte Noten tragen keinen weißen Rand mehr (deutlich dunkler als die Auswahl)', A.sel === '0:60' && A.selC4 >= B.selC4 - 12 && A.selC4 >= 225 && A.playedC5 < A.selC4 - 30 && A.unselD4 < A.selC4 - 30, {wieGespielt: A, wieNotiert: B});
  await p._ctx.close();
}
// P5: Matrix-Zelle: Länge + Richtung berührt das Tonart-Schild nie (quer 926×370/926×428, gewählt und nicht gewählt)
{
  const C = {};
  for (const [w, h] of [[926, 370], [926, 428], [428, 926]]) {
    const p = await openPage(file, w, h, 2);
    await p.evaluate(() => { stop(); SYNQUENZER.loadDemo(); S.tracks[0].clips[0] = {len: 2, key: {root: 2, scale: 'aeolian', src: 'user'}, notes: [0, 2, 4, 5, 7, 9, 11, 12].map((d, k) => ({t: k, d: .4, n: 60 + d, v: .8}))}; clipChanged(0, 0); });
    for (const pat of [{dir: 'rev'}, {st: 27}, {st: 3}, {dir: 'pend'}, {dir: 'down'}]) for (const sel of [false, true]) {
      await p.evaluate(([pt, sl]) => { SYNQUENZER.lf1Dir(0, 0, Object.assign({dir: null, st: null}, pt)); R.selT = sl ? 0 : 1; R.selS = 0; UI.dirty.grid = true; }, [pat, sel]); await W(p, 150);
      C[w + 'x' + h + ' ' + JSON.stringify(pat) + (sel ? ' gewählt' : '')] = await p.evaluate(() => { const Cc = UI.cells[0][0], tr = e => { const rg = document.createRange(); rg.selectNodeContents(e); return rg.getBoundingClientRect(); }, a = tr(Cc.ln), k = Cc.kbg.getBoundingClientRect(), x = Math.min(a.right, k.right) - Math.max(a.left, k.left), y = Math.min(a.bottom, k.bottom) - Math.max(a.top, k.top);
        return {txt: Cc.ln.textContent, kb: Cc.kbg.hidden ? '' : Cc.kbg.textContent, ueber: x > 0 && y > 0 ? +(x * y).toFixed(1) : 0, imBild: a.right <= Cc.el.getBoundingClientRect().right}; });
    }
    if (w === 926 && h === 370) { const r = await p.evaluate(() => { SYNQUENZER.lf1Dir(0, 0, {dir: null, st: 27}); R.selT = 1; UI.dirty.grid = true; const q = UI.cells[0][0].el.getBoundingClientRect(); return [q.left, q.top, q.width, q.height]; }); await W(p, 200); await p.screenshot({path: path.join(out, 'gl1p-zelle-926x370.png'), clip: {x: r[0] - 2, y: r[1] - 2, width: r[2] + 4, height: r[3] + 4}}); }
    await p._ctx.close();
  }
  ok('GL1-P 5: Matrix-Zelle – „2T →28“ & Co. berühren das Tonart-Schild nie (Schild-Kasten, auch gewählt); quer flach ohne Startzahl („2T →“), hochkant voll', Object.values(C).every(x => x.ueber === 0 && x.imBild && x.kb === 'Dm') && C['428x926 {"st":27}'].txt === '2T →28' && C['926x370 {"st":27}'].txt.startsWith('2T →'), C);
}
