// MTX3 – Noten auslagern (Noten-Editor › Auslagern ▾) und DRUMS in Einzelspuren aufteilen / zusammenführen.
// Aufruf: node mtx3-test.mjs <index.html> <ausgabeordner>   (absolute Pfade)
// Echte Touch-Ereignisse über CDP (428×926 hochkant, 926×428 und 926×370 quer). Fotos: mtx3-*.png
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2], dir = process.argv[3];
if (!file || !dir) { console.log('Aufruf: node mtx3-test.mjs <index.html> <ausgabeordner>'); process.exit(2); }
const b = await chromium.launch();
const res = []; const ok = (name, cond, info) => { res.push({name, ok: !!cond}); console.log((cond ? 'OK     ' : 'FEHLER ') + name + (info !== undefined ? ' · ' + JSON.stringify(info) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(w, h) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1600);
  const cdp = await ctx.newCDPSession(p);
  const T = {
    async down(x, y) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}); },
    async up() { await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); },
    async tap(x, y) { await this.down(x, y); await sleep(60); await this.up(); await sleep(220); },
    async hold(x, y, ms = 700) { await this.down(x, y); await sleep(ms); await this.up(); await sleep(250); },
  };
  return {ctx, p, errs, T};
}
const R_ = (p, fn, arg) => p.evaluate(([src, a]) => { const e = (0, eval)(src)(a); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2}; }, [fn.toString(), arg]);
const popBtn = (p, sel) => R_(p, a => (UI.pop && UI.pop.el ? UI.pop.el.querySelector(a) : null), sel);
const popName = p => p.evaluate(() => (UI.pop ? UI.pop.name : null));
async function popCheck(p, label) {
  const r = await p.evaluate(() => {
    const P = UI.pop && UI.pop.el; if (!P) return null;
    const q = P.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    const x = [...P.querySelectorAll('button')].find(b => (b.textContent || '').trim() === '✕' && b.getClientRects().length);
    const xr = x ? x.getBoundingClientRect() : null;
    const small = [...P.querySelectorAll('button')].filter(b => b.getClientRects().length && !b.classList.contains('ux1-px')).map(b => b.getBoundingClientRect()).filter(r => r.height < 43.5 || r.width < 43.5).length;
    return {in: q.left >= 7.5 && q.top >= 7.5 && q.right <= vw - 7.5 && q.bottom <= vh - 7.5, box: [Math.round(q.left), Math.round(q.top), Math.round(q.right), Math.round(q.bottom)], x: !!xr && xr.top >= 0 && xr.right <= vw && xr.width >= 40, small, sh: P.scrollHeight > P.clientHeight + 1};
  });
  ok(label + ': Blatt ganz im Bild (8 px Rand), ✕ sichtbar, Tasten ≥ 44 px', r && r.in && r.x && r.small === 0, r);
}
async function tapPop(T, p, sel, label) { const r = await popBtn(p, sel); if (!r) { ok(label + ' (Knopf da)', false); return false; } await T.tap(r.cx, r.cy); return true; }
// Song nur aus DRUMS (Szene 0, 2 Takte) für den Summen-Vergleich; Math.random fest (die Drum-Stimmen würfeln den Rausch-Einsatz)
const RENDER = async () => {
  ensureAudio(); drumBufs(); const MR = Math.random; Math.random = () => .3125;
  try { VV.cancel = false; const r = await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}}); return [Array.from(r.ch[0]), Array.from(r.ch[1])]; } finally { Math.random = MR; }
};
const dbDiff = (X, Y) => { let e = 0, d = 0; const n = Math.min(X[0].length, Y[0].length); for (let c = 0; c < 2; c++) for (let k = 0; k < n; k++) { e += X[c][k] * X[c][k]; const q = X[c][k] - Y[c][k]; d += q * q; } return Math.round(10 * Math.log10(d / Math.max(e, 1e-20) + 1e-30) * 10) / 10; };

// ======================= hochkant 428 × 926: Noten auslagern =======================
{
  const {ctx, p, errs, T} = await open(428, 926);
  const sig = (t, s) => p.evaluate(([t, s]) => { const c = S.tracks[t] && S.tracks[t].clips[s]; return c ? c.notes.map(n => n.t + '/' + n.n).join(',') : null; }, [t, s]);
  const src0 = await sig(0, 0);
  await p.evaluate(() => { SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); launchScene(0); play(); });
  await sleep(500);
  await p.evaluate(() => { selectTrack(0); openRoll(0, 0); });
  await sleep(700);
  const bt = await p.evaluate(() => { const x = ED.roll && ED.roll.el.acts.querySelector('.mtx3rb'); if (!x) return null; const r = x.getBoundingClientRect(), a = getComputedStyle(x, '::after'), ref = ED.roll.el.acts.querySelector('.bb1rb'); return {w: r.width, h: r.height, hit: r.height - parseFloat(a.top) - parseFloat(a.bottom), same: !ref || Math.abs(ref.getBoundingClientRect().height - r.height) < .5}; });
  ok('Noten-Editor: [Auslagern ▾] in der Aktionsleiste (Höhe wie die Leiste, Trefferfläche ≥ 44 px)', bt && bt.hit >= 43.5 && bt.same, bt);
  // ohne Auswahl: Hinweis, kein Blatt
  if (bt) { await p.evaluate(b => { const a = ED.roll.el.acts; const x = a.querySelector('.mtx3rb'); x.scrollIntoView({inline: 'center', block: 'nearest'}); }); await sleep(150); }
  let r = await R_(p, () => ED.roll.el.acts.querySelector('.mtx3rb'));
  await T.tap(r.cx, r.cy);
  ok('ohne Auswahl: kein Blatt (Hinweis)', (await popName(p)) !== 'mtx3out');
  const picked = await p.evaluate(() => { const ns = S.tracks[0].clips[0].notes; const ix = ns.map((n, k) => k).filter(k => ns[k].n >= 43); ED.roll.selectIdx(ix); return ix.length; });
  r = await R_(p, () => ED.roll.el.acts.querySelector('.mtx3rb'));
  await T.tap(r.cx, r.cy); await sleep(200);
  ok('mit Auswahl (' + picked + ' Noten): Blatt „Auslagern“ auf', (await popName(p)) === 'mtx3out');
  await popCheck(p, 'Auslagern hochkant');
  await p.screenshot({path: dir + '/mtx3-auslagern-hochkant.png'});
  await tapPop(T, p, '[data-m3="new"]', 'In neue Spur darunter'); await sleep(300);
  const a = await p.evaluate(() => {
    const j = NT() - 1, tr = S.tracks[j], ord = trackOrder();
    return {nt: NT(), j, name: tr.name, eng: tr.sound.engine, same: JSON.stringify(tr.sound) === JSON.stringify(S.tracks[0].sound), below: ord[ord.indexOf(0) + 1] === j,
      nn: tr.clips[0] ? tr.clips[0].notes.length : 0, len: tr.clips[0] ? tr.clips[0].len === S.tracks[0].clips[0].len : false, left: S.tracks[0].clips[0].notes.length,
      others: tr.clips.filter((c, s) => c && s !== 0).length, slot: [R.slot[0], R.slot[j]], cs: R.cstart[0] === R.cstart[j], playing: R.playing,
      lane: S.song.lanes[j].map(e => e.bar + ':' + e.slot).join(','), lane0: (() => { const o = []; let on = false; for (const e of S.song.lanes[0]) { if (e.slot === 0 && !e.own) { o.push(e.bar + ':0'); on = true; } else if (on) { o.push(e.bar + ':-1'); on = false; } } return o.join(','); })()};   // MTX3-P S1: Wechsel der Quelle = Stopp der neuen Spur
  });
  ok('neue Spur „Synth 1 · Teil“ direkt unter der Quelle, gleicher Klang', a.name === 'Synth 1 · Teil' && a.below && a.same, a);
  ok('Noten gewandert (nur Szene 1, Clip-Länge wie Quelle)', a.nn === picked && a.left === 8 - picked && a.others === 0 && a.len, {nn: a.nn, left: a.left});
  ok('spielt synchron: gleicher Slot und Start wie die Quelle', a.playing && a.slot[0] === 0 && a.slot[1] === 0 && a.cs, a.slot);
  ok('Song: neue Spur spielt, wo die Quelle Szene 1 spielt (und stoppt beim Wechsel)', a.lane === a.lane0 && a.lane.length > 0 && /:-1/.test(a.lane), [a.lane, a.lane0]);
  // die neue Spur klingt wirklich (Note-Log der Spur)
  await sleep(1200);
  const heard = await p.evaluate(j => LOG.buf.filter(e => e && e.track === j && e.src === 'clip').length, a.j).catch(() => -1);
  ok('neue Spur spielt ihre Noten (Note-Log)', heard > 0, heard);
  await p.evaluate(() => undo()); await sleep(250);
  const u = await p.evaluate(() => ({nt: NT(), n: S.tracks[0].clips[0].notes.length, lanes: S.song.lanes.length}));
  ok('↶: Spur weg, Noten zurück (ein Schritt)', u.nt === 6 && u.n === 8 && u.lanes === 6, u);
  ok('↶: Quell-Clip gleich wie vorher', (await sig(0, 0)) === src0);
  await p.evaluate(() => redo()); await sleep(250);
  const rd = await p.evaluate(() => ({nt: NT(), n: S.tracks[0].clips[0].notes.length, nj: S.tracks[6] && S.tracks[6].clips[0] ? S.tracks[6].clips[0].notes.length : 0}));
  ok('↷: wieder ausgelagert', rd.nt === 7 && rd.nj === picked && rd.n === 8 - picked, rd);
  await p.evaluate(() => undo()); await sleep(200);
  // Kopieren in eine vorhandene Spur (Synth 2, Szene 1 hat einen Clip)
  await p.evaluate(() => { stop(); closeEditor(); selectTrack(0); openRoll(0, 0); }); await sleep(600);
  await p.evaluate(() => { const ns = S.tracks[0].clips[0].notes; ED.roll.selectIdx([0, 1]); });
  r = await R_(p, () => { const x = ED.roll.el.acts.querySelector('.mtx3rb'); x.scrollIntoView({inline: 'center', block: 'nearest'}); return x; });
  r = await R_(p, () => ED.roll.el.acts.querySelector('.mtx3rb'));
  await T.tap(r.cx, r.cy); await sleep(200);
  const n1 = await p.evaluate(() => S.tracks[1].clips[0] ? S.tracks[1].clips[0].notes.length : 0);
  const seg = await R_(p, () => [...UI.pop.el.querySelectorAll('.seg button')].find(b => b.textContent === 'Kopieren'));
  if (seg) await T.tap(seg.cx, seg.cy);
  await tapPop(T, p, '[data-m3="to"][data-j="1"]', 'In vorhandene Spur Synth 2'); await sleep(250);
  const cp = await p.evaluate(() => ({n0: S.tracks[0].clips[0].notes.length, n1: S.tracks[1].clips[0].notes.length, nt: NT(), copy: SYNQUENZER.mtx3.info().copy}));
  ok('Kopieren in vorhandene Spur: Ziel +2, Quelle bleibt, keine neue Spur', cp.n0 === 8 && cp.n1 === n1 + 2 && cp.nt === 6 && cp.copy, cp);
  await p.evaluate(() => undo()); await sleep(200);
  ok('↶ Kopieren: Ziel wie vorher', (await p.evaluate(() => S.tracks[1].clips[0].notes.length)) === n1);
  await p.evaluate(() => SYNQUENZER.mtx3.copySet(false));
  ok('hochkant: keine Konsolenfehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}

// ======================= hochkant 428 × 926: DRUMS aufteilen =======================
{
  const {ctx, p, errs, T} = await open(428, 926);
  const drumSig = () => p.evaluate(() => S.tracks[DRUM_T].clips.map(c => c ? c.notes.map(n => n.t + '/' + n.n + '/' + n.v).sort().join(',') : '').join('|'));
  const d0 = await drumSig();
  await p.evaluate(() => { for (let i = 0; i < NT(); i++) if (i !== DRUM_T) S.tracks[i].clips = S.tracks[i].clips.map(() => null); SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 1}]); setSongView(false); });
  await sleep(300);
  const A = await p.evaluate(`(${RENDER.toString()})()`);
  const st = await R_(p, i => UI.stops[i], 4);
  await T.hold(st.cx, st.cy, 750);
  ok('■ DRUMS halten: Spur-Blatt mit [In Einzelspuren aufteilen]', (await popName(p)) === 'track' && !!(await popBtn(p, '[data-mtx3="split"]')));
  await popCheck(p, 'Spur-Blatt DRUMS hochkant');
  await tapPop(T, p, '[data-mtx3="split"]', 'In Einzelspuren aufteilen'); await sleep(250);
  ok('Blatt „DRUMS aufteilen“ auf', (await popName(p)) === 'mtx3split');
  await popCheck(p, 'Aufteilen hochkant');
  const pre = await p.evaluate(() => [...UI.pop.el.querySelectorAll('.mtx3-v .mbtn.on')].map(b => b.dataset.v));
  ok('Vorschlag: HH ZU und SNARE (2 Plätze frei), KICK bleibt', pre.join() === 'snare,hatC' || pre.join() === 'hatC,snare', pre);
  await p.screenshot({path: dir + '/mtx3-aufteilen-hochkant.png'});
  await tapPop(T, p, '[data-m3="go"]', 'Aufteilen'); await sleep(400);
  const s1 = await p.evaluate(() => ({nt: NT(), names: S.tracks.map(t => t.name), is: SYNQUENZER.mtx3.info().is, ord: trackOrder().slice(-3),
    hh: S.tracks[6].clips.map(c => c ? [...new Set(c.notes.map(n => n.n))].join('/') : '').join('|'), sn: S.tracks[7].clips.map(c => c ? [...new Set(c.notes.map(n => n.n))].join('/') : '').join('|'),
    dr: S.tracks[4].clips.map(c => c ? [...new Set(c.notes.map(n => n.n))].sort().join('/') : '').join('|'),
    lanes: [S.song.lanes[4], S.song.lanes[6], S.song.lanes[7]].map(l => JSON.stringify(l)), seed: S.tracks[6].clips[0].seed === S.tracks[4].clips[0].seed,
    fx: JSON.stringify(S.tracks[6].sound.fx) === JSON.stringify(S.tracks[4].sound.fx)}));
  ok('aufgeteilt: HH ZU + SNARE als eigene Spuren, gruppiert vor DRUMS', s1.nt === 8 && s1.names[6] === 'HH ZU' && s1.names[7] === 'SNARE' && s1.is[6] && s1.is[7] && s1.ord.join() === '6,7,4', s1);
  ok('je Spur nur ihr Ton (alle Szenen), DRUMS behält den Rest', /^42\|42/.test(s1.hh) && /^38\|/.test(s1.sn) && !/38|42/.test(s1.dr), [s1.hh, s1.sn, s1.dr]);
  ok('Song-Zeilen und Saat wie DRUMS, Kanal-Werte von DRUMS', s1.lanes[0] === s1.lanes[1] && s1.lanes[1] === s1.lanes[2] && s1.seed && s1.fx, s1.lanes);
  await p.screenshot({path: dir + '/mtx3-einzelspuren-hochkant.png'});
  const B = await p.evaluate(`(${RENDER.toString()})()`);
  const dAB = dbDiff(A, B);
  ok('Summen-Audio gleich (Song-Render, Pegel 0 dB): Differenz ≤ −60 dB', dAB <= -60, dAB + ' dB');
  // eigener Kanal: Einzelspur stumm → nur sie fehlt
  const mix = await p.evaluate(async () => {
    S.tracks[6].sound.fx.vol = 0; applyTrackParams(6, true);
    return true;
  });
  const C = await p.evaluate(`(${RENDER.toString()})()`);
  ok('eigener Mischer-Kanal: HH-Pegel 0 ändert die Summe deutlich (≫ −60 dB)', dbDiff(A, C) > -45, dbDiff(A, C) + ' dB');
  await p.evaluate(() => { S.tracks[6].sound.fx.vol = S.tracks[4].sound.fx.vol; applyTrackParams(6, true); });
  // Speichern / Laden (Projektdatei = auch Inhalt des Projekt-ZIP)
  const sl = await p.evaluate(() => {
    const fo = SQStore.buildProjectFile(S, null, VERSION), txt = JSON.stringify(fo);
    const before = JSON.stringify([S.tracks[6].dvx, S.tracks[6].clips, S.tracks[7].dvx, S.tracks[7].clips]);
    const ok1 = sx14Put(txt);
    const after = JSON.stringify([S.tracks[6].dvx, S.tracks[6].clips, S.tracks[7].dvx, S.tracks[7].clips]);
    return {ok1, same: before === after, is: SYNQUENZER.mtx3.info().is, has: txt.includes('"dvx"')};
  });
  ok('Speichern/Laden: tr.dvx und Drum-Clips bleiben, Einzelspuren aktiv', sl.ok1 && sl.same && sl.has && sl.is[6] && sl.is[7], sl);
  const B2 = await p.evaluate(`(${RENDER.toString()})()`);
  ok('nach dem Laden: Summen-Audio weiter gleich', dbDiff(A, B2) <= -60, dbDiff(A, B2) + ' dB');
  // Synth draufpacken: anderer Klang-Name = der Synth spielt
  const sy = await p.evaluate(() => { const k = JSON.parse(JSON.stringify(S.tracks[6].sound)); S.tracks[6].sound.name = 'Mein Synth'; const a = SYNQUENZER.mtx3.info().is[6]; S.tracks[6].sound = k; return {a, b: SYNQUENZER.mtx3.info().is[6]}; });
  ok('anderer Klang → Einzelspur spielt Synth; zurück → Drum-Ton', sy.a === false && sy.b === true, sy);
  // ↶ / ↷
  await p.evaluate(() => undo()); await sleep(400);
  ok('↶ Aufteilen: 6 Spuren, DRUMS wie vorher', (await p.evaluate(() => NT())) === 6 && (await drumSig()) === d0);
  await p.evaluate(() => redo()); await sleep(400);
  ok('↷ Aufteilen: wieder 8 Spuren', (await p.evaluate(() => NT() === 8 && SYNQUENZER.mtx3.info().is[7])));
  // Wiedergabe in der Matrix: Einzelspuren laufen mit DRUMS
  await p.evaluate(() => { launchScene(0); play(); }); await sleep(1500);
  const pl = await p.evaluate(() => ({slot: [R.slot[4], R.slot[6], R.slot[7]], log: [6, 7].map(j => LOG.buf.filter(e => e && e.track === j).length)}));
  ok('Matrix-Wiedergabe: Einzelspuren spielen im Slot von DRUMS', pl.slot.join() === '0,0,0' && pl.log[0] > 0 && pl.log[1] > 0, pl);
  await p.evaluate(() => stop()); await sleep(200);
  // zusammenführen per Touch
  const st2 = await R_(p, i => UI.stops[i], 4);
  await T.hold(st2.cx, st2.cy, 750);
  ok('Spur-Blatt DRUMS: [Einzelspuren zusammenführen]', !!(await popBtn(p, '[data-mtx3="merge"]')));
  await tapPop(T, p, '[data-mtx3="merge"]', 'zusammenführen'); await sleep(400);
  ok('zusammengeführt: 6 Spuren, DRUMS-Noten wie vorher', (await p.evaluate(() => NT())) === 6 && (await drumSig()) === d0, await p.evaluate(() => NT()));
  const D2 = await p.evaluate(`(${RENDER.toString()})()`);
  ok('nach Zusammenführen: Summen-Audio gleich', dbDiff(A, D2) <= -60, dbDiff(A, D2) + ' dB');
  await p.evaluate(() => undo()); await sleep(400);
  ok('↶ Zusammenführen: Einzelspuren wieder da', (await p.evaluate(() => NT() === 8 && SYNQUENZER.mtx3.info().parts.length === 2)));
  // MIDI-Export: Einzelspuren mit ihren Noten
  const md = await p.evaluate(() => { try { const r = buildMidiSong(false); return r ? (r.byteLength || r.length || (r.bytes && r.bytes.length) || 1) : 0; } catch (e) { return String(e); } });
  ok('MIDI-Export des Songs läuft mit den Einzelspuren', typeof md === 'number' && md > 0, md);
  ok('DRUMS-Test hochkant: keine Konsolenfehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}

// ======================= quer 926 × 428 und 926 × 370: Blätter =======================
for (const [w, h] of [[926, 428], [926, 370]]) {
  const {ctx, p, errs, T} = await open(w, h);
  const st = await R_(p, i => UI.stops[i], 4);
  if (st) await T.hold(st.cx, st.cy, 750);
  ok(w + '×' + h + ': Spur-Blatt DRUMS mit [In Einzelspuren aufteilen]', !!(await popBtn(p, '[data-mtx3="split"]')));
  await popCheck(p, 'Spur-Blatt DRUMS ' + w + '×' + h);
  await tapPop(T, p, '[data-mtx3="split"]', 'aufteilen'); await sleep(250);
  await popCheck(p, 'Aufteilen ' + w + '×' + h);
  // Ton wechseln per Touch: CLAP dazu geht nicht (voll), SNARE ab, CLAP dazu
  const sn = await popBtn(p, '[data-v="snare"]'); if (sn) await T.tap(sn.cx, sn.cy);
  const cl = await popBtn(p, '[data-v="clap"]'); if (cl) await T.tap(cl.cx, cl.cy);
  const on = await p.evaluate(() => [...UI.pop.el.querySelectorAll('.mtx3-v .mbtn.on')].map(b => b.dataset.v).sort().join());
  ok(w + '×' + h + ': Töne per Tipp wählbar', on === 'clap,hatC', on);
  await p.screenshot({path: dir + '/mtx3-aufteilen-' + w + 'x' + h + '.png'});
  const x = await popBtn(p, '[data-m3="no"]'); if (x) await T.tap(x.cx, x.cy);
  ok(w + '×' + h + ': ✕ schließt', (await popName(p)) == null);
  await p.evaluate(() => { selectTrack(0); openRoll(0, 0); }); await sleep(600);
  await p.evaluate(() => ED.roll.selectIdx([0, 2, 4]));
  let r = await R_(p, () => { const x = ED.roll.el.acts.querySelector('.mtx3rb'); x.scrollIntoView({inline: 'center', block: 'nearest'}); return x; });
  r = await R_(p, () => ED.roll.el.acts.querySelector('.mtx3rb'));
  if (r) await T.tap(r.cx, r.cy); await sleep(200);
  await popCheck(p, 'Auslagern ' + w + '×' + h);
  await p.screenshot({path: dir + '/mtx3-auslagern-' + w + 'x' + h + '.png'});
  ok(w + '×' + h + ': keine Konsolenfehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
await b.close();
const bad = res.filter(x => !x.ok);
console.log('\nERGEBNIS ' + (res.length - bad.length) + '/' + res.length + (bad.length ? ' – offen: ' + bad.map(x => x.name).join(' | ') : ' – alles OK'));
process.exit(bad.length ? 1 : 0);
