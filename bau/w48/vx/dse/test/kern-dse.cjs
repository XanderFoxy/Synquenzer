// DSE Kern-Test: Drum-Einzelspur (HH ZU) im Schritt-Editor per Touch bedienen: Schritte setzen, x2, FOLGEN, Laenge 12 gegen
// DRUMS 16 (Wiedergabe-Positionen), Lock (lange druecken -> Tune) wirkt im Render. Dazu: ohne Bedienung gleich wie Basis.
// Aufruf: node kern-dse.cjs <port> <neu-ordner> [basis-ordner]   (Ordner unter der Server-Wurzel, z. B. neu basis)
const {chromium} = require('playwright');
const port = process.argv[2], neu = process.argv[3] || 'neu', basis = process.argv[4] || null, foto = process.argv[5] || null;
let fail = 0, n = 0; const ok = (name, c, x) => { n++; console.log((c ? 'OK     ' : 'FEHLER ') + name + (x !== undefined ? '  ' + JSON.stringify(x) : '')); if (!c) fail++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(b, wer, w, h) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push('pageerror ' + e));
  p.on('console', m => { if (m.type() === 'error' && !/abspann-logo|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto('http://127.0.0.1:' + port + '/' + wer + '/index.html'); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 90000}); await p.waitForTimeout(1500);
  await p.evaluate(() => {
    window.__W = ms => new Promise(r => setTimeout(r, ms));
    window.__hits = []; const dh = drumHit; let dep = 0;
    drumHit = function (gm, vel, t, src, ex, o) { dep++; let h; try { h = dh.apply(this, arguments); } finally { dep--; } if (!dep && h && src === 'clip') __hits.push({tr: h.track, gm: h.gm, t: h.start, tune: ex && ex.lk && ex.lk.tune || 0}); return h; };
    window.__setup = () => { // HH ZU als Einzelspur, DRUMS Szene 1 = Kick auf 1, Einzelspur-Clip leer
      for (let i = 0; i < NT(); i++) if (i !== DRUM_T) S.tracks[i].clips = S.tracks[i].clips.map(() => null);
      const sp = SYNQUENZER.mtx3.split(), j = sp.find(x => S.tracks[x].dvx.v === 'hatC');
      for (const x of sp) if (x !== j) S.tracks[x].clips = S.tracks[x].clips.map(() => null);
      const d = S.tracks[DRUM_T].clips[0]; d.len = 1; d.notes = [{t: 0, d: .1, n: 36, v: .9}]; delete d.lanes;
      for (let s = 1; s < S.tracks[DRUM_T].clips.length; s++) S.tracks[DRUM_T].clips[s] = null;
      const c = S.tracks[j].clips[0]; c.len = 1; c.notes = []; delete c.lanes;
      for (let s = 1; s < S.tracks[j].clips.length; s++) S.tracks[j].clips[s] = null;
      afterClipEdit(DRUM_T, 0); afterClipEdit(j, 0, true);
      MTX3B.view = 'steps'; openRoll(j, 0); return j;
    };
    window.__rect = sel => { const e = typeof sel === 'string' ? document.querySelector(sel) : sel; if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height}; };
    window.__cell = i => __rect(ED.mtx3b.E.cells[i]);
    window.__play = async bars => { __hits.length = 0; ensureAudio(); await __W(300); launchScene(0); const t0 = performance.now(); const pages = [], phs = []; while (performance.now() - t0 < 30000) { if (R.playing && AU.ctx && audBeat() >= bars * 4 + .5) break; await __W(20); if (ED.mtx3b) { pages.push(ED.mtx3b.page); phs.push([+audBeat().toFixed(3), ED.mtx3b.page, ED.mtx3b.ph]); } } if (typeof stopAll === 'function') stopAll(); else togglePlay(); await __W(300); return {pages, phs, cs: R.cstart.slice()}; };
  });
  const cdp = await ctx.newCDPSession(p);
  const T = {
    down: (x, y) => cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}),
    move: (x, y) => cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y, id: 1}]}),
    up: () => cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}),
    async tap(q) { await this.down(q.x, q.y); await sleep(60); await this.up(); await sleep(300); },
    async hold(q, ms) { await this.down(q.x, q.y); await sleep(ms); await this.up(); await sleep(300); },
  };
  return {ctx, p, errs, T};
}
async function knobTo(p, T, sel, want, dir) { // Regler per Touch ziehen, bis aria-valuetext = want
  const q = await p.evaluate(s => __rect(s), sel); if (!q) return null;
  await T.down(q.x, q.y); let y = q.y, txt = null;
  for (let k = 0; k < 120; k++) {
    y += dir * 3; await T.move(q.x, y); await sleep(30);
    txt = await p.evaluate(s => { const e = document.querySelector(s); return e && e.getAttribute('aria-valuetext'); }, sel);
    if (txt === want) break;
  }
  await T.up(); await sleep(250); return txt;
}

(async () => {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  // ---------- 1 · neu, hochkant: bedienen ----------
  {
    const {ctx, p, errs, T} = await open(b, neu, 428, 926);
    const j = await p.evaluate(() => __setup()); await sleep(600);
    // Schritte 1 und 5 per Tipp
    await T.tap(await p.evaluate(() => __cell(0))); await T.tap(await p.evaluate(() => __cell(4)));
    let st = await p.evaluate(j => S.tracks[j].clips[0].notes.map(n => [n.t, n.n]), j);
    ok('Schritte 1 und 5 per Tipp gesetzt (GM 42)', JSON.stringify(st) === '[[0,42],[1,42]]', st);
    const chip = await p.evaluate(() => { const e = document.querySelector('#rollSheet .rhead .folc') || document.querySelector('.rhead .folc'); return e ? e.textContent : null; });
    ok('FOLGEN-Chip im Kopf', /FOLGT/.test(chip || ''), chip);
    const lenB = await p.evaluate(() => __rect('.lacts .d1b')), lenTx = await p.evaluate(() => document.querySelector('.lacts .d1b').textContent);
    ok('Länge-Knopf zeigt 16, Trefferfläche >= 32 px', lenB && lenB.h >= 32 && lenB.w >= 32 && lenTx === '16', {lenB, lenTx});
    // x2 per Tipp im Laengen-Blatt
    await T.tap(lenB); let pop = await p.evaluate(() => !!document.querySelector('.pop.d1p'));
    ok('Länge-Blatt öffnet per Tipp', pop);
    await T.tap(await p.evaluate(() => __rect('.pop.d1p .d1x'))); await sleep(400);
    st = await p.evaluate(j => ({len: S.tracks[j].clips[0].len, n: S.tracks[j].clips[0].notes.map(n => n.t), pages: ED.mtx3b && ED.mtx3b.pages}), j);
    ok('×2: Clip 2 Takte, Schritte verdoppelt, 2 Seiten', st.len === 2 && JSON.stringify(st.n) === '[0,1,4,5]' && st.pages === 2, st);
    // FOLGEN: Wiedergabe 2 Takte, Seite folgt
    let pl = await p.evaluate(() => __play(3));
    const seq = pl.phs.filter(x => x[0] >= 0); const bad = seq.filter(([bt, pg]) => { const ph = ((bt % 8) + 8) % 8, want = Math.floor(ph / 4); return Math.abs((ph % 4)) > .3 && Math.abs((ph % 4) - 4) > .3 && pg !== want; });
    ok('FOLGEN: Ansicht blättert mit (Seite 1 und 2, passend zur Abspielmarke)', new Set(seq.map(x => x[1])).size === 2 && bad.length <= 2, {seiten: [...new Set(seq.map(x => x[1]))], falsch: bad.length, von: seq.length});
    // Laenge 12 per Touch am Regler
    await T.tap(await p.evaluate(() => __rect('.lacts .d1b'))); await sleep(200);
    const kt = await knobTo(p, T, '.pop.d1p .eukr > *:first-child', '12 Schr.', 1);
    await p.evaluate(() => closePop()); await sleep(300);
    st = await p.evaluate(j => ({lanes: S.tracks[j].clips[0].lanes, btn: document.querySelector('.lacts .d1b').textContent, dim: ED.mtx3b.E.cells.map(c => c.classList.contains('d1o') ? 1 : 0).join(''), undo: (typeof UNDO !== 'undefined' && UNDO.stack) ? UNDO.stack.length : null}), j);
    ok('Länge 12 per Regler: lanes {42:{len:12}}, Knopf 12, Zellen 13–16 gedimmt', kt === '12 Schr.' && st.lanes && st.lanes[42] && st.lanes[42].len === 12 && st.btn === '12' && st.dim === '0000000000001111', Object.assign({kt}, st));
    pl = await p.evaluate(() => __play(6));
    const res = await p.evaluate(j => { // Zeiten -> Schritte seit Clip-Start (16tel)
      const spb = 60 / S.bpm, out = {hh: [], kick: []}; const t0 = Math.min(...__hits.map(h => h.t));
      for (const h of __hits) { const g = Math.round((h.t - t0) / spb / .25); if (h.tr === j) out.hh.push(g); else if (h.tr === DRUM_T) out.kick.push(g); }
      return out; }, j);
    const hhWant = [], kickWant = []; for (let g = 0; g < 96; g++) { if (g % 12 === 0 || g % 12 === 4) hhWant.push(g); if (g % 32 === 0 || g % 16 === 0) kickWant.push(g); }
    const hh = res.hh.filter(g => g < 96), kick = res.kick.filter(g => g < 96);
    ok('Polymetrie: HH ZU (12) auf Schritt 0/4 mod 12, Kick (DRUMS 16) auf 0 mod 16', JSON.stringify(hh) === JSON.stringify(hhWant.filter(g => g <= Math.max(...hh))) && hh.length >= 12 && kick.every(g => g % 16 === 0) && kick.length >= 5, {hh, kick});
    const phs = pl.phs.map(x => x[2]).filter(x => x >= 0);
    ok('Lauflicht bleibt in Schritt 1–12, Seite 1', phs.length > 20 && Math.max(...phs) <= 11 && pl.phs.every(x => x[1] === 0), {max: Math.max(...phs), n: phs.length});
    // Lock: Schritt 1 lange druecken -> Lock-Blatt, Tune hoch
    await T.hold(await p.evaluate(() => __cell(0)), 750);
    const lp = await p.evaluate(() => { const P = document.querySelector('.pop.pl1pop'); return P ? {h: P.querySelector('h4').textContent, knobs: [...P.querySelectorAll('.pl1kn')].map(k => k.getAttribute('aria-label')), all: !!(P.querySelector('.pl1all') && !P.querySelector('.pl1all').hidden)} : null; });
    ok('Lange drücken: Lock-Blatt mit Drum-Reglern (Tune/Decay/Pegel/Drive)', lp && /Schritt 1/.test(lp.h) && lp.knobs.join() === 'Tune,Decay,Pegel,Drive' && !lp.all, lp);
    const tt = await knobTo(p, T, '.pop.pl1pop .pl1kn[data-pl1="tune"]', '+7 HT', -1);
    const tt2 = tt === '+7 HT' ? tt : await p.evaluate(() => document.querySelector('.pop.pl1pop .pl1kn[data-pl1="tune"]').getAttribute('aria-valuetext'));
    await p.evaluate(() => closePop()); await sleep(300);
    st = await p.evaluate(j => ({lk: S.tracks[j].clips[0].notes.map(n => n.lk ? n.lk.tune || 0 : 0), dot: ED.mtx3b.E.cells.map(c => c._pl1d && !c._pl1d.hidden ? 1 : 0).join('')}), j);
    ok('Lock gesetzt: Schritt 1 (beide Takte) Tune, Punkt an der Zelle', st.lk[0] !== 0 && st.lk[2] === st.lk[0] && st.lk[1] === 0 && st.dot.startsWith('1000'), Object.assign({tt: tt2}, st));
    pl = await p.evaluate(() => __play(3));
    const lt = await p.evaluate(j => { const t0 = Math.min(...__hits.map(h => h.t)), spb = 60 / S.bpm; return __hits.filter(h => h.tr === j).map(h => [Math.round((h.t - t0) / spb / .25) % 12, h.tune]); }, j);
    ok('Lock in der Wiedergabe: Schritt 1 mit Tune, Schritt 5 ohne', lt.length > 4 && lt.every(([g, tu]) => g === 0 ? tu === st.lk[0] : tu === 0), lt.slice(0, 6));
    // Offline-Render: mit Lock vs. ohne (↶)
    const rd = await p.evaluate(async j => {
      SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); ensureAudio(); drumBufs(); const MR = Math.random; Math.random = () => .3125;
      const R_ = async () => { VV.cancel = false; const r = await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}}); return Float32Array.from(r.ch[0]); };
      try { const A = await R_(); const keep = S.tracks[j].clips[0].notes.map(n => n.lk); S.tracks[j].clips[0].notes.forEach(n => delete n.lk); afterClipEdit(j, 0, true); const B = await R_(); S.tracks[j].clips[0].notes.forEach((n, k) => { if (keep[k]) n.lk = keep[k]; }); afterClipEdit(j, 0, true); const C = await R_();
        const db = (X, Y) => { let e = 0, d = 0; for (let k = 0; k < Math.min(X.length, Y.length); k++) { e += X[k] * X[k]; d += (X[k] - Y[k]) ** 2; } return +(10 * Math.log10((d + 1e-30) / (e + 1e-30))).toFixed(1); };
        return {mitOhne: db(A, B), mitMit: db(A, C), peak: Math.max(...A.slice(0, 48000).map(Math.abs)).toFixed(3)}; } finally { Math.random = MR; } }, j);
    ok('Render: Lock hörbar (mit ↔ ohne deutlich anders, mit ↔ mit gleich)', rd.mitOhne > -30 && rd.mitMit < -60, rd);
    ok('keine Seitenfehler (neu, hochkant)', errs.length === 0, errs.slice(0, 3));
    await ctx.close();
  }
  // ---------- 2 · quer: Lage der Elemente ----------
  {
    const {ctx, p, errs, T} = await open(b, neu, 926, 428);
    await p.evaluate(() => __setup()); await sleep(600);
    const L = await p.evaluate(() => { const r = s => __rect(s); return {fol: r('.rhead .folc'), x: r('.rhead .sh-x'), bar: r('.rhead .lbar'), len: r('.lacts .d1b'), pad: r('.lacts .mtx3rb'), lab: r('.lacts .m3bpad'), labOv: (() => { const e = document.querySelector('.lacts .m3bpad'); return e.scrollWidth > e.clientWidth + 1; })(), vw: innerWidth, vh: innerHeight}; });
    const sep = (a, c) => a && c && (a.r <= c.l + .5 || c.r <= a.l + .5 || a.b <= c.t + .5 || c.b <= a.t + .5);
    ok('quer: FOLGEN, Leiste, ✕, Länge, Pad-Klang ohne Überlappung, im Bild, Text nicht abgeschnitten', sep(L.fol, L.x) && sep(L.bar, L.fol) && sep(L.len, L.pad) && sep(L.lab, L.len) && !L.labOv && L.len.r <= L.vw && L.len.b <= L.vh && L.fol.h >= 32 && L.len.h >= 32, L);
    await T.tap(await p.evaluate(() => __cell(2))); const s3 = await p.evaluate(() => S.tracks[ED.mtx3b.t].clips[0].notes.length);
    ok('quer: Schritt per Tipp', s3 === 1);
    ok('keine Seitenfehler (quer)', errs.length === 0, errs.slice(0, 3));
    await ctx.close();
  }
  // ---------- 3 · hochkant: Lage ----------
  {
    const {ctx, p, errs} = await open(b, neu, 428, 926);
    await p.evaluate(() => __setup()); await sleep(600);
    const L = await p.evaluate(() => { const r = s => __rect(s); return {fol: r('.rhead .folc'), x: r('.rhead .sh-x'), ht: r('.rhead .rht'), len: r('.lacts .d1b'), pad: r('.lacts .mtx3rb'), lab: r('.lacts .m3bpad'), labOv: (() => { const e = document.querySelector('.lacts .m3bpad'); return e.scrollWidth > e.clientWidth + 1; })(), titOv: (() => { const e = document.querySelector('.rhead .sh-title'); return e.scrollWidth > e.clientWidth + 1; })()}; });
    const sep = (a, c) => a && c && (a.r <= c.l + .5 || c.r <= a.l + .5 || a.b <= c.t + .5 || c.b <= a.t + .5);
    ok('hochkant: FOLGEN, Titel, ✕, Länge, Pad-Klang ohne Überlappung, Text nicht abgeschnitten', sep(L.fol, L.x) && sep(L.ht, L.fol) && sep(L.len, L.pad) && sep(L.lab, L.len) && !L.labOv && !L.titOv && L.fol.h >= 32 && L.len.h >= 32, L);
    ok('keine Seitenfehler (hochkant Lage)', errs.length === 0, errs.slice(0, 3));
    await ctx.close();
  }
  // ---------- 4 · ohne Bedienung: neu = basis (Projekt-Daten und Schlaege) ----------
  if (basis) {
    const run = async wer => { const {ctx, p, errs} = await open(b, wer, 428, 926);
      const r = await p.evaluate(async () => { const sp = SYNQUENZER.mtx3.split(), j = sp.find(x => S.tracks[x].dvx.v === 'hatC'); MTX3B.view = 'steps'; openRoll(j, S.tracks[j].clips.findIndex(c => c)); await __W(500);
        const pl = await __play(2); const t0 = Math.min(...__hits.map(h => h.t)), spb = 60 / S.bpm;
        return {clips: JSON.stringify(S.tracks.map(t => t.clips.map(c => c ? cleanClip(c) : null))), ui: JSON.stringify(S.ui && S.ui.follow || null), hits: __hits.map(h => h.tr + ':' + h.gm + ':' + Math.round((h.t - t0) / spb / .25)).sort().join(','), pages: [...new Set(pl.pages)]}; });
      await ctx.close(); return Object.assign(r, {errs}); };
    const A = await run(basis), B = await run(neu);
    ok('ohne Bedienung: Clips gleich wie Basis', A.clips === B.clips);
    ok('ohne Bedienung: Schläge (Spur, Pad, Schritt) gleich wie Basis', A.hits === B.hits && A.hits.length > 20, {n: A.hits.split(',').length});
    ok('ohne Bedienung: Einstellungen gleich (FOLGEN-Standard an)', A.ui === B.ui, [A.ui, B.ui]);
    ok('keine Seitenfehler (Basis/neu)', !A.errs.length && !B.errs.length, [A.errs, B.errs]);
  }
  await b.close();
  console.log(fail ? 'FEHLER ' + fail + '/' + n : 'ALLE OK (' + n + '/' + n + ')');
  process.exit(fail ? 1 : 0);
})();
