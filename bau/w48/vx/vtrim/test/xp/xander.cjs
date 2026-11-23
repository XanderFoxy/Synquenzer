// Unabhängige Xander-Prüfung VTRIM (Touch, hochkant + quer): node xander.cjs <port>
// Take mit Auftakt (Vorlauf-Fähnchen) + Nachlauf 1,2 s über das Loop-Ende. Weg über die echte Oberfläche:
// Clip-Blatt → ✎ Bearbeiten → nach rechts wischen → Ende-Fähnchen ziehen → „Ende auf Loop-Ende“ → ↶ → ▶ Loop → Song → Export → Speichern/Neu laden.
const {chromium, sleep, open, setupX, openEdUI, geo, ov, clipA} = require('./xlib.cjs');
const port = process.argv[2], OUT = __dirname;
let fail = 0, n = 0;
const ok = (name, c, x) => { n++; console.log((c ? 'OK     ' : 'FEHLER ') + name + (x !== undefined ? '  ' + JSON.stringify(x) : '')); if (!c) fail++; };
const capOn = p => p.evaluate(() => { if (!window.__o0) { window.__o0 = tkStartSrc; tkStartSrc = function (o) { if (window.__cap && !o.ctx && o.take) __cap.push({when: +o.when.toFixed(4), off: +o.off.toFixed(4), end: +o.end.toFixed(4), fo: o.fo, fi: o.fi, key: String(o.key || '')}); return __o0.apply(this, arguments); }; } window.__cap = []; });
const capGet = p => p.evaluate(() => { const c = window.__cap || []; window.__cap = null; return c.map(x => Object.assign(x, {stopAt: +(x.off + (x.end - x.when)).toFixed(4)})); });
const btnAt = (p, sel) => p.evaluate(sel => { const b = document.querySelector(sel); if (!b || b.hidden) return null; const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height}; }, sel);
const btnTxt = (p, re) => p.evaluate(re => { const b = [...document.querySelectorAll('button')].filter(b => new RegExp(re).test(b.textContent.trim()) && b.offsetParent && b.getBoundingClientRect().width > 0); if (!b.length) return null; const r = b[0].getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, t: b[0].textContent.trim()}; }, re);
// Überlappungen zwischen allen sichtbaren Teilen der Fähnchen (Griff-Grafik, Texte, Knopf)
function overl(g) {
  const P = {eF: g.eF, eT: g.eT, aF: g.aF, aT: g.aT, vF: g.vF, vT: g.vT, chip: g.chip}, k = Object.keys(P).filter(k => P[k]), bad = [];
  for (let i = 0; i < k.length; i++) for (let j = i + 1; j < k.length; j++) if (ov(P[k[i]], P[k[j]])) bad.push(k[i] + '×' + k[j]);
  return bad;
}
// Export (Mixdown des Songs) – Energie nach dem Loop-Ende (trocken über Quellen-Plan ist im Kern-Test; hier: was man hört)
const exportRms = (p, t0, t1) => p.evaluate(async ({t0, t1}) => {
  ensureAudio(); VV.cancel = false;
  const MR = Math.random; Math.random = () => .3125; let r; try { r = await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}}); } finally { Math.random = MR; }
  const y = r.ch[0], sr = r.sr, lead = r.lead || 0, db = (a, b) => { let s = 0, c = 0; for (let i = Math.round((a + lead) * sr); i < Math.min(y.length, Math.round((b + lead) * sr)); i++) { s += y[i] * y[i]; c++; } return c ? +(10 * Math.log10(s / c + 1e-20)).toFixed(1) : null; };
  return {len: +(y.length / sr).toFixed(2), vor: db(t0 - .8, t0 - .05), nach: db(t0 + .05, t1)};
}, {t0, t1});

async function swipeToEnd(p, T) {
  // Wischen auf der Takt-Leiste nach links, bis das Ende-Fähnchen im Bild ist
  for (let k = 0; k < 6; k++) {
    const g = await geo(p); if (g.eF && g.eF.r <= g.cM.r - 4 && g.eF.l >= g.cM.l) return {g, k};
    const y = g.cM.t - 12, x0 = g.cM.r - 30, x1 = g.cM.l + 60; // Takt-Leiste: dort wischt man in der Rolle seitwärts
    await T.down(x0, y); for (let s = 1; s <= 10; s++) { await T.move(x0 + (x1 - x0) * s / 10, y); await sleep(16); } await T.up(); await sleep(500);
  }
  return {g: await geo(p), k: -1};
}

async function lauf(b, w, h, tag) {
  const {ctx, p, errs, T} = await open(b, port, 'neu', w, h);
  const s = await setupX(p, {pre: .5, post: 1.2});
  await openEdUI(p, T, s.st);
  let g = await geo(p);
  ok(`[${tag}] Editor über „✎ Bearbeiten“ offen, Vorlauf-Fähnchen sichtbar + greifbar`, g.vF && g.vHit && g.vH.w >= 32 && g.vH.h >= 32, {vH: g.vH, vTx: g.vTx});
  const sw = await swipeToEnd(p, T); g = sw.g;
  await p.screenshot({path: `${OUT}/x-${tag}-1-ende.png`});
  ok(`[${tag}] nach Wischen: Ende-Fähnchen im Bild, Griff ≥ 32 px, Finger trifft den Griff`, g.eF && g.eHit && g.eH.w >= 32 && g.eH.h >= 32 && g.eF.r <= g.vw && g.eF.t >= g.cM.t - 1, {wisch: sw.k, eH: g.eH, eF: g.eF, f: g.f, cM: g.cM});
  ok(`[${tag}] Nachlauf über das Loop-Ende getönt + Knopf „Ende auf Loop-Ende“ (≥ 32 px, trifft)`, g.nz && g.nz.w > 20 && g.chip && g.chip.h >= 32 && g.chipHit, {nz: g.nz, chip: g.chip});
  ok(`[${tag}] nichts überlappt (Fähnchen, Texte, Knopf), alles im Bild`, overl(g).length === 0 && (!g.chip || (g.chip.l >= 0 && g.chip.r <= g.vw)), {ueber: overl(g), eT: g.eT, chip: g.chip});
  // 1) Ende-Fähnchen mit dem Finger 1 Schlag nach links ziehen (in den Nachlauf hinein)
  const ppb = g.f.ppb, hx = (g.eF.l + g.eF.r) / 2, hy = (g.eF.t + g.eF.b) / 2;
  await T.drag(hx, hy, hx - ppb * 1.0, 14);
  const c1 = await clipA(p, s.st); g = await geo(p);
  await p.screenshot({path: `${OUT}/x-${tag}-2-gezogen.png`});
  const lab1 = await p.evaluate(() => { const u = S.undo || []; const x = u[u.length - 1]; return x && (x.label || x.l || ''); }).catch(() => '');
  ok(`[${tag}] Ende gezogen: Nachlauf ~1 Schlag kürzer (Raster 1/16, Take bleibt ganz), Text zeigt das Minus`, c1.vt && c1.vt.e > s.out + s.post - 1.3 * s.sp && c1.vt.e < s.out + s.post - .7 * s.sp && c1.out === s.out && g.eTx === 'Ende −' + (s.out + s.post - c1.vt.e).toFixed(2).replace('.', ',') + ' s', {vt: c1.vt, txt: g.eTx, lab1});
  ok(`[${tag}] nach dem Ziehen nichts überlappt`, overl(g).length === 0, {ueber: overl(g)});
  // 2) Knopf „Ende auf Loop-Ende“
  await T.tap({x: g.chip.x0 || (g.chip.l + g.chip.r) / 2, y: (g.chip.t + g.chip.b) / 2});
  const c2 = await clipA(p, s.st); g = await geo(p);
  await p.screenshot({path: `${OUT}/x-${tag}-3-loopende.png`});
  ok(`[${tag}] Tipp „Ende auf Loop-Ende“: Gesang endet genau am Loop-Ende, Knopf + Tönung weg`, c2.vt && Math.abs(c2.vt.e - s.out) < 1e-6 && !g.chip && !g.nz, {vt: c2.vt, chip: g.chip, nz: g.nz, eTx: g.eTx});
  // 3) ↶ im Editor (Touch) → zurück auf den gezogenen Stand, nochmal ↶ → ganze Länge
  const ub = await p.evaluate(() => { const b = [...ED.roll.el.bar.querySelectorAll('button')].find(x => x.title === 'Rückgängig'); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, aus: !!b.disabled || getComputedStyle(b).opacity < .6}; });
  await T.tap(ub); const u1 = await clipA(p, s.st);
  await T.tap(ub); const u2 = await clipA(p, s.st); g = await geo(p);
  ok(`[${tag}] ↶ (Touch): erst der gezogene Stand, dann die ganze Länge (kein vt mehr, Fähnchen hohl)`, u1.vt && Math.abs(u1.vt.e - c1.vt.e) < 1e-6 && !u2.vt && g.full, {u1: u1.vt, u2: u2.vt, ub, full: g.full});
  // 4) Tippen aufs Fähnchen → Menü „Ende auf Loop-Ende“
  await T.tap({x: (g.eF.l + g.eF.r) / 2, y: (g.eF.t + g.eF.b) / 2});
  const mn = await p.evaluate(() => { const m = document.querySelector('.vtrm'); return m ? [...m.querySelectorAll('button')].map(b => { const r = b.getBoundingClientRect(); return {t: b.textContent, x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height, l: r.left, r: r.right}; }) : null; });
  const gm = await geo(p);
  await p.screenshot({path: `${OUT}/x-${tag}-4-menue.png`});
  const lo = mn && mn.find(m => /Loop-Ende/.test(m.t));
  ok(`[${tag}] Tippen aufs Ende-Fähnchen: Menü mit „ganze Länge“ und „Ende auf Loop-Ende“ (≥ 44 px, im Bild)`, lo && mn.every(m => m.h >= 44 && m.l >= 0 && m.r <= gm.vw), mn);
  if (lo) await T.tap(lo);
  const c3 = await clipA(p, s.st);
  ok(`[${tag}] Menü „Ende auf Loop-Ende“ wirkt`, c3.vt && Math.abs(c3.vt.e - s.out) < 1e-6, c3.vt);
  // 5) Editor zu (✕), ▶ Loop (Touch auf Start): jede Runde endet am Loop-Ende, kein Nachlauf über die Klammer
  const close = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].filter(b => b.textContent.trim() === '✕' && b.offsetParent); const r = b.length ? b[0].getBoundingClientRect() : null; return r ? {x: r.left + r.width / 2, y: r.top + r.height / 2} : null; });
  if (close) await T.tap(close); await sleep(400);
  await capOn(p);
  const pb = await btnAt(p, '#bPlay'); await T.tap(pb); await p.evaluate(() => launchScene(0)); await sleep(9500); await T.tap(pb); await sleep(600);
  const cl = await capGet(p);
  ok(`[${tag}] ▶ Loop: Gesang klingt nie hinter dem Loop-Ende (alle Stücke enden ≤ ${s.out} s im Take)`, cl.length >= 2 && cl.every(c => c.stopAt <= s.out + 1e-3), cl.slice(0, 4));
  // 6) Song: Szene 1 (2 Takte) → Song-Ende; ohne Beschnitt klingt der Nachlauf 1,2 s hinter dem Song-Ende
  await p.evaluate(() => { SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); });
  await capOn(p); await p.evaluate(() => { songPlayStart(0); }); await sleep(6500); await p.evaluate(() => { if (R.playing) stop(); }); await sleep(500);
  const cs = await capGet(p);
  ok(`[${tag}] Song: kein Nachlauf hinter dem Ende (Loop-Klammer gilt auch im Song)`, cs.length >= 1 && cs.every(c => c.stopAt <= s.out + 1e-3) && !cs.some(c => /^g3p/.test(c.key)), cs);
  // 7) Export (Mixdown) mit Schnitt vs. ↶ ohne Schnitt
  const sg = await p.evaluate(() => ({song: S.song && S.song.bars, playing: R.playing, songPlay: !!R.songPlay}));
  if (!sg.song) { console.log('Song fehlt vor dem Export', sg); await p.evaluate(() => SYNQUENZER.songFromChain([{scene: 0, bars: 2}])); }
  const eMit = await exportRms(p, 4, 5.2);
  await p.evaluate(st => { const a = S.tracks[st].clips[0].audio; window.__vt = a.vt; delete a.vt; clipChanged(st, 0); }, s.st); const cU = await clipA(p, s.st);
  const eOhne = await exportRms(p, 4, 5.2);
  await p.evaluate(st => { const a = S.tracks[st].clips[0].audio; a.vt = window.__vt; clipChanged(st, 0); }, s.st); const cR = await clipA(p, s.st);
  ok(`[${tag}] Export: nach dem Loop-Ende mind. 12 dB leiser als ohne Schnitt (nur Hall-Rest)`, eOhne.nach - eMit.nach >= 12 && Math.abs(eOhne.vor - eMit.vor) < 1, {mit: eMit, ohne: eOhne, undo: cU.vt, redo: cR.vt});
  // 8) Speichern → Seite neu laden → Schnitt ist noch da, Fähnchen am Loop-Ende
  const sv = await p.evaluate(async () => { markDirty(); return await saveNow(); });
  await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && typeof S !== 'undefined' && S.tracks && typeof vl3Mount === 'function', null, {timeout: 90000}); await sleep(2500);
  const ld = await p.evaluate(st => { const c = S.tracks[st] && S.tracks[st].clips[0], a = c && c.audio; return a ? {vt: a.vt || null, take: !!(S.takes && S.takes[a.take]), post: S.takes && S.takes[a.take] && S.takes[a.take].post} : null; }, s.st);
  ok(`[${tag}] Speichern + neu laden: Schnitt bleibt (vt.e = Loop-Ende)`, sv !== false && ld && ld.vt && Math.abs(ld.vt.e - s.out) < 1e-6 && ld.take, {sv, ld});
  if (ld && ld.vt) {
    await openEdUI(p, T, s.st); const sw2 = await swipeToEnd(p, T); g = sw2.g;
    await p.screenshot({path: `${OUT}/x-${tag}-5-geladen.png`});
    ok(`[${tag}] nach dem Laden: Ende-Fähnchen am Loop-Ende, Text „Ende −0,60 s“… (1,2 s weg), kein Knopf`, g.eF && /Ende −1,20 s/.test(g.eTx) && !g.chip, {eTx: g.eTx, chip: g.chip});
  }
  // 9) Grenzfall: Ende ganz an den Anfang ziehen → kollidiert nicht mit dem Vorlauf-Fähnchen
  await p.evaluate(() => ED.roll.fitView('clip')); await sleep(500);
  g = await geo(p);
  if (g.eF) {
    await T.drag((g.eF.l + g.eF.r) / 2, (g.eF.t + g.eF.b) / 2, g.cM.l + 2, 20); g = await geo(p);
    await p.screenshot({path: `${OUT}/x-${tag}-6-ganzkurz.png`});
    ok(`[${tag}] Ende ganz nach vorn: Vorlauf-Fähnchen + Ende-Fähnchen getrennt greifbar, Texte überlappen nicht`, g.eHit && g.vHit && overl(g).length === 0, {ueber: overl(g), eF: g.eF, eT: g.eT, vF: g.vF, vT: g.vT, eTx: g.eTx});
    await p.evaluate(() => undo());
  }
  ok(`[${tag}] keine Seitenfehler`, errs.length === 0, errs.slice(0, 4));
  await ctx.close();
}

(async () => {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const which = process.argv[3] || 'beide';
  if (which !== 'quer') await lauf(b, 428, 926, 'hoch');
  if (which !== 'hoch') await lauf(b, 926, 428, 'quer');
  console.log(JSON.stringify({gesamt: n, fehler: fail}));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
