// XLB – Spuren/Szenen bis 24/32: alte Projekte bitgleich (A/B gegen die Basis), 24×32 anlegen/spielen/speichern/laden/↶, Matrix- und Song-Gesten
// an Spur 9+/Szene 9+ (echte Touch-Ereignisse über CDP, iPhone 12 Pro Max hochkant 428×926 und quer 926×428), Mixer, MIDI, Video-Matrix,
// Ketten bei Bedarf, ältere Fassung (4.78) sperrt ein großes Projekt.
// Aufruf: node xlb-test.mjs <index.html> <basis.html> <fotoordner>   (absolute Pfade)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const [file, base, dir] = process.argv.slice(2);
if (!file || !base || !dir) { console.log('Aufruf: node xlb-test.mjs <index.html> <basis.html> <fotoordner>'); process.exit(2); }
fs.mkdirSync(dir, {recursive: true});
const S0 = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/';
const FIX = ['v3-qa-old/v0a-project.json', 'v3-qa-v2ereg/save-base-L1.json', 'mu2/menu-844x390.json', 'v3-qa-mk6reg/save-base-L1.json', 'v3-qa-grp/export-synquenzer-demo-2026-10-31-1618.json'].map(f => S0 + f);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const res = []; const ok = (name, cond, info) => { res.push({name, ok: !!cond}); console.log((cond ? 'OK     ' : 'FEHLER ') + name + (info !== undefined ? ' · ' + JSON.stringify(info).slice(0, 600) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(f, w, h) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + f); await p.waitForTimeout(1800);
  const cdp = await ctx.newCDPSession(p);
  const T = {
    async down(x, y) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}); },
    async move(x, y) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y, id: 1}]}); },
    async up() { await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); },
    async tap(x, y) { await this.down(x, y); await sleep(60); await this.up(); await sleep(300); },
    async hold(x, y, ms = 700) { await this.down(x, y); await sleep(ms); await this.up(); await sleep(350); },
  };
  return {ctx, p, errs, T};
}
const R_ = (p, fn, arg) => p.evaluate(([src, a]) => { const e = (0, eval)(src)(a); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2}; }, [fn.toString(), arg]);

// ======================= T1: alte Projekte bitgleich (A = Basis 4.78, B = XLB) =======================
const LOADSAVE = async (p, txt) => p.evaluate(t => {
  const fo = JSON.parse(t), r = parseProjectFile(fo); if (!r) return null;
  switchProject(r.project, {ui: true}); const ser = serializeProject(), pf = JSON.stringify(projectFileObj(S, true, false));
  const r2 = parseProjectFile(JSON.parse(pf)); switchProject(r2.project, {ui: true}); const ser2 = serializeProject();
  return {ser, pf, fmt: SQStore.fmtOf(JSON.parse(ser)), need: JSON.parse(ser).need || null, ns: S.scenes.length, nt: S.tracks.length, again: ser2 === ser};
}, txt);
{
  const G = await open(base, 428, 926);
  // erzeugte Altprojekte (in der Basis gebaut, eigene Seite): Demo, Leer (Init), Taktart 3/4 (Format 7), 8 Spuren
  const gen = await G.p.evaluate(() => {
    const out = {};
    out.demo = JSON.stringify(projectFileObj(demoProject(), true, false));
    out.init = JSON.stringify(projectFileObj(newProject({init: true}), true, false));
    const d = demoProject(); d.ts = '3/4'; out.ts = JSON.stringify(projectFileObj(normalizeProject(JSON.parse(JSON.stringify(d))), true, false));
    switchProject(demoProject(), {first: true}); addTrack(); addTrack(); for (let i = 6; i < 8; i++) { S.tracks[i].clips[7] = {len: 1, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: .5, n: 64 + i, v: .8}]}; }
    out.t8 = JSON.stringify(projectFileObj(S, true, false));
    return out;
  });
  await G.ctx.close();
  const A = await open(base, 428, 926), B = await open(file, 428, 926);
  const cases = FIX.map(f => [f.split('/').slice(-2).join('/'), fs.readFileSync(f, 'utf8')]).concat(Object.entries(gen));
  let same = 0, fmts = [];
  for (const [nm, txt] of cases) {
    const a = await LOADSAVE(A.p, txt), bb = await LOADSAVE(B.p, txt);
    const eq = a && bb && a.ser === bb.ser && a.pf === bb.pf;
    if (eq) same++; fmts.push(nm + ':' + (bb ? bb.fmt + '/' + bb.ns + 'x' + bb.nt : 'null'));
    ok('T1 bitgleich laden/speichern wie 4.78: ' + nm, eq && bb.ns === 8 && !(bb.need || []).includes('xl') && bb.fmt <= 7 && bb.again === a.again,
      bb ? {fmt: [a && a.fmt, bb.fmt], ns: bb.ns, nt: bb.nt, need: bb.need, again: [a && a.again, bb.again], len: [a && a.pf.length, bb.pf.length]} : null);
  }
  ok('T1 alle ' + cases.length + ' Altprojekte bitgleich (Projekt-JSON und Projekt-Datei)', same === cases.length, fmts);
  // die Ansicht: ein normales Projekt baut 8 Szenen-Zellen, dieselben Bänke wie 4.78
  const v = await Promise.all([A.p, B.p].map(p => p.evaluate(() => ({cells: UI.cells.map(r => r ? r.length : 0), scenes: MX.scenes.slice(), sb: sceneBankOf(), szb: UI.szb.hidden, lab: UI.szb.children[1].textContent}))));
  ok('T1 Matrix eines normalen Projekts wie 4.78 (Zellen, Bank, [SZ])', JSON.stringify(v[0]) === JSON.stringify(v[1]), v);
  ok('Konsole ohne Fehler (A/B)', !A.errs.length && !B.errs.length, A.errs.concat(B.errs));
  await A.ctx.close(); await B.ctx.close();
}

// ======================= T2/T3: 24 × 32 anlegen, spielen, speichern/laden, ↶ =======================
const MKXL = async (p, nt, ns, empty) => p.evaluate(([nt, ns, empty]) => {
  switchProject(newProject(), {first: true});
  while (NS() < ns) SYNQUENZER.xl.addScene(true);
  while (NT() < nt) addTrack();
  const K = () => ({root: 0, scale: 'ionian'});
  for (let t = 0; t < NT() - empty; t++) for (let s = 0; s < NS() - 1; s++) {   // die letzten `empty` Spuren und die letzte Szene bleiben leer
    if ((t + s) % 3) continue;
    S.tracks[t].clips[s] = normClip(isDrum(t) ? {len: 1, key: K(), notes: [0, 1, 2, 3].map(k => ({t: k, d: .25, n: k % 2 ? 38 : 36, v: .8}))}
      : {len: 1, key: K(), notes: [{t: 0, d: .4, n: 48 + (t % 12), v: .8}, {t: 2, d: .4, n: 55 + (s % 5), v: .7}]}, isDrum(t) ? 'drum' : 'synth', S.key);
    clipChanged(t, s);
  }
  S.song = normSong({bars: 8, lanes: []}, S.key, NT()); songChanged();
  return {nt: NT(), ns: NS()};
}, [nt, ns, empty]);
{
  const {ctx, p, errs, T} = await open(file, 428, 926);
  // ↶ von ＋ Szene / ＋ Spur auf dem normalen Projekt
  const u = await p.evaluate(() => {
    switchProject(newProject(), {first: true}); const s0 = serializeProject();
    const k = SYNQUENZER.xl.addScene(true); const s1 = serializeProject(), j1 = JSON.parse(s1);
    undo(); const s2 = serializeProject(); redo(); const s3 = serializeProject();
    undo();
    for (let i = 0; i < 3; i++) addTrack(); const nt = NT(), j4 = JSON.parse(serializeProject());
    undo(); undo(); undo(); const s5 = serializeProject();
    return {k, n1: j1.scenes.length, need1: j1.need, undoSame: s2 === s0, redoSame: s3 === s1, nt, need4: j4.need, back: s5 === s0, ns: NS()};
  });
  ok('＋ Szene: Szene 9, need [xl]; ↶ = genau wie vorher, ↷ = genau Szene 9', u.k === 8 && u.n1 === 9 && JSON.stringify(u.need1) === '["xl"]' && u.undoSame && u.redoSame, u);
  ok('＋ Spur über 8 (9 Spuren = großes Projekt), 3× ↶ = genau wie vorher', u.nt === 9 && JSON.stringify(u.need4) === '["xl"]' && u.back && u.ns === 8, u);
  // 24 × 32 mit Inhalt
  const mk = await MKXL(p, 24, 32, 2);
  const d = await p.evaluate(() => {
    // Song: Lanes mit Szenen 0…31, Marken „Szene 12“ und ein eigener Clip auf Spur 20
    const lanes = Array.from({length: NT()}, (_, t) => [{bar: 0, slot: t % NS()}, {bar: 4, slot: NS() - 1 - (t % NS())}, {bar: 8, slot: -1}]);
    S.song = normSong({bars: 12, lanes, marks: [{a: 0, len: 4, part: 'S12'}, {a: 4, len: 4, part: 'S31'}]}, S.key, NT()); songChanged();
    const ser = serializeProject(), fo = projectFileObj(S, true, false), pf = JSON.stringify(fo), j = JSON.parse(ser);
    const r = parseProjectFile(JSON.parse(pf)); switchProject(r.project, {ui: true}); const ser2 = serializeProject();
    let di = 0; while (di < ser.length && ser[di] === ser2[di]) di++;
    return {diff: di < ser.length ? [ser.slice(di - 80, di + 60), ser2.slice(di - 80, di + 60)] : null, nt: NT(), ns: NS(), fmt: fo.format, need: j.need, clipsLen: [...new Set(j.tracks.map(t => t.clips.length))], same: ser === ser2,
      lanesMax: Math.max(...S.song.lanes.flat().map(e => e.slot)), marks: (S.song.marks || []).map(m => m.part), order: S.ui.order, names: S.tracks.slice(8, 11).map(t => t.name), kb: Math.round(pf.length / 1024)};
  });
  ok('T2 24 Spuren × 32 Szenen: Format 8, need [xl], jede Spur 32 Clips', d.nt === 24 && d.ns === 32 && d.fmt === 8 && JSON.stringify(d.need) === '["xl"]' && d.clipsLen.join() === '32', d);
  ok('T2 Speichern → Laden genau gleich (Song-Szenen bis 32, Marken S12/S31, Reihenfolge DRUMS zuletzt)', d.same && d.lanesMax === 31 && d.marks.join() === 'S12,S31' && d.order[23] === 4 && d.order.length === 24, d);
  // Wiedergabe: Szene 10 und 31 starten, Noten auf Spuren ≥ 8 kommen an, R.slot nie undefined, Übergang 8 → 9 im Takt
  const pl = await p.evaluate(async () => {
    ensureAudio(); await new Promise(r => setTimeout(r, 1500));
    LOG.n = 0; launchScene(9); play(); await new Promise(r => setTimeout(r, 2600));
    const a = LOG.buf.filter(e => e && e.track >= 8).length, tr = new Set(LOG.buf.filter(e => e && e.track >= 8).map(e => e.track));
    const slotOk = R.slot.slice(0, NT()).every(x => typeof x === 'number'), s10 = R.slot.slice(0, NT()).filter(x => x === 9).length;
    launchScene(7); await new Promise(r => setTimeout(r, 2300)); const s8 = R.slot.slice(0, NT()).filter(x => x === 7).length;
    launchScene(30); await new Promise(r => setTimeout(r, 2300)); const s31 = R.slot.slice(0, NT()).filter(x => x === 30).length;
    const lazy = SYNQUENZER.xl.lazy(); stop();
    return {a, tracks: [...tr].sort((x, y) => x - y), slotOk, s10, s8, s31, lazy, cpu: typeof cpuLoad === 'function' ? +cpuLoad().toFixed(3) : null};
  });
  ok('T3 Szene 10 spielt: Noten von Spuren ≥ 9 im noteLog, R.slot immer eine Zahl', pl.a > 0 && pl.tracks.length >= 4 && pl.slotOk && pl.s10 >= 6, pl);
  ok('T3 Szenen-Wechsel 10 → 8 → 31 im Lauf', pl.s8 >= 6 && pl.s31 >= 4, {s8: pl.s8, s31: pl.s31});
  ok('Alle 24 Spuren mit Inhalt haben ihre Kette (nach dem Laden in Scheiben gebaut)', pl.lazy.chains.every(Boolean) && pl.lazy.q.length === 0, pl.lazy);
  // MIDI je Szene und Song: alle 24 Spuren, Kanäle gültig
  const mi = await p.evaluate(() => {
    const hdr = by => (by[10] << 8) | by[11];
    const sc = buildMidi({mode: 'scene', scene: 9}), so = buildMidi({mode: 'song'}), all = buildMidi({mode: 'all'});
    const chans = by => { const c = new Set(); for (let i = 14; i < by.length - 2; i++) if (by[i] === 0x4D && by[i + 1] === 0x54 && by[i + 2] === 0x72) {} return c; };
    return {scene: hdr(sc.bytes), song: hdr(so.bytes), all: all ? hdr(all.bytes) : 0, n: sc.counts.slice(8).filter(Boolean).length};
  });
  ok('MIDI: Szene 10 / alle Szenen mit allen 24 Spuren (25 MTrk), Song mit allen Spuren, die Noten haben (auch ≥ 9)', mi.scene === 25 && mi.song >= 9 && mi.all === 25 && mi.n >= 4, mi);
  // ↶ der Szenenzahl im großen Projekt
  const u2 = await p.evaluate(() => { const s0 = serializeProject(); const w = SYNQUENZER.xl.remScene(true); return {w, ns: NS(), why: null}; });
  ok('Szene 32 entfernen nur, wenn sie leer und unbenutzt ist', u2.w === false && u2.ns === 32, u2);
  ok('Konsole ohne Fehler (24 × 32)', !errs.length, errs);
  await ctx.close();
}

// ======================= Ketten der Zusatzspuren bei Bedarf (frische Seite, großes Projekt aus der Datei) =======================
{
  const G = await open(file, 428, 926);
  await MKXL(G.p, 24, 12, 4);
  const xlf = await G.p.evaluate(() => JSON.stringify(projectFileObj(S, true, false)));
  await G.ctx.close();
  const {ctx, p, errs} = await open(file, 428, 926);
  const lz = await p.evaluate(async t => {
    const r = parseProjectFile(JSON.parse(t)); switchProject(r.project, {first: true});
    const t0 = performance.now(); ensureAudio(); const tEns = performance.now() - t0;
    const at0 = SYNQUENZER.xl.lazy();
    await new Promise(r => setTimeout(r, 2500));
    const at1 = SYNQUENZER.xl.lazy();
    const i = at1.sleep[0], before = !!AU.tracks[i]; selectTrack(i); const after = !!AU.tracks[i];
    // eine schlafende Spur bekommt einen Clip und startet: ihre Kette entsteht vor dem ersten Ton
    const j = at1.sleep.find(x => x !== i); S.tracks[j].clips[0] = normClip({len: 1, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: .5, n: 60, v: .8}, {t: 1, d: .5, n: 62, v: .8}]}, 'synth', S.key); clipChanged(j, 0);
    LOG.n = 0; launchScene(0); play(); await new Promise(r => setTimeout(r, 2000));
    const heard = LOG.buf.filter(e => e && e.track === j).length; stop();
    return {tEns: +tEns.toFixed(1), q0: at0.q.length, sleep0: at0.sleep, built1: at1.built, ms: at1.ms, chains: at1.chains, i, before, after, j, chainJ: !!AU.tracks[j], heard, woke: SYNQUENZER.xl.lazy().woke};
  }, xlf);
  ok('Ketten bei Bedarf: 4 leere Zusatzspuren ohne Kette, Spuren 9–20 mit Inhalt in Scheiben nachgebaut', lz.sleep0.length === 4 && lz.q0 >= 10 && lz.chains.slice(0, 20).every(Boolean) && lz.chains.slice(20).every(x => !x), lz);
  ok('Schlafende Spur wählen = Kette sofort da', lz.before === false && lz.after === true, {i: lz.i, before: lz.before, after: lz.after});
  ok('Schlafende Spur mit neuem Clip spielt ab dem ersten Ton (Kette vor dem Planen)', lz.chainJ && lz.heard >= 2, {j: lz.j, heard: lz.heard, woke: lz.woke});
  ok('Konsole ohne Fehler (Ketten bei Bedarf)', !errs.length, errs);
  await ctx.close();
}

// ======================= T4/T5: Gesten hochkant 428 × 926 (12 Spuren × 10 Szenen) =======================
for (const [w, h, tag] of [[428, 926, 'hochkant'], [926, 428, 'quer']]) {
  const {ctx, p, errs, T} = await open(file, w, h);
  await MKXL(p, 12, 10, 0);
  await p.evaluate(() => { selectTrack(0); setSceneBank(0); }); await sleep(400);
  const B0 = await p.evaluate(() => SYNQUENZER.xl.bank());
  ok(tag + ': [SZ] sichtbar mit „' + B0.lab + '“, Bank 1', B0.bankS && (B0.lab === '1–4' || B0.lab === '1–8'), B0);
  // [SZ] antippen: 1–4 → 5–8 → 9–10 → 1–4 (quer: 1–8 → 9–10 → 1–8)
  const labs = [];
  for (let k = 0; k < (w > h ? 2 : 3); k++) { const r = await R_(p, () => UI.szb); await T.tap(r.cx, r.cy); await sleep(150); labs.push(await p.evaluate(() => SYNQUENZER.xl.bank().lab)); }
  ok(tag + ': [SZ] Tipp blättert durch alle Bänke', w > h ? labs.join() === '9–10,1–8' : labs.join() === '5–8,9–10,1–4', labs);
  // zur letzten Bank: leere Spalten + ＋ Szene im Kopf
  await p.evaluate(() => setSceneBank(8 / 4)); await sleep(300);
  const g = await p.evaluate(() => { const gh = [...document.querySelectorAll('#clipGrid .xlgh:not(.mxoff)')], add = document.querySelector('#clipGrid .xladd:not(.mxoff)'), r = add && add.getBoundingClientRect();
    const sc = UI.scenes[9].getBoundingClientRect(), saw = UI.saw.getBoundingClientRect(), cell = UI.cells[0][9].el.getBoundingClientRect();
    return {n: gh.length, add: r ? [r.left, r.top, r.width, r.height].map(Math.round) : null, sameRow: r && Math.abs(r.top - sc.top) < 1, order: r && sc.right <= r.left + .5 && r.right <= saw.left + .5,
      cellW: Math.round(cell.width), lab: SYNQUENZER.xl.bank().lab, scenes: SYNQUENZER.xl.bank().scenes, hscroll: document.documentElement.scrollWidth > innerWidth};
  });
  ok(tag + ': letzte Bank 9–10 mit leeren Spalten, ＋ Szene im Kopf rechts neben Szene 10, ≥ 44 px, kein waagrechtes Rollen', g.lab === '9–10' && g.add && g.sameRow && g.order && g.add[2] >= 43.5 && g.add[3] >= 31.5 && !g.hscroll, g);
  await p.screenshot({path: `${dir}/xlb-bank-${tag}.png`});
  // Clip in Szene 10, Spur 11 (Index 10) antippen → startet / wählt
  await p.evaluate(() => { const pg = MX.pages ? MX.pages.findIndex(q => q.includes(10)) : -1; if (pg >= 0) setTrackBank(pg); }); await sleep(250);
  let c = await R_(p, () => UI.cells[10][8].el); await T.tap(c.cx, c.cy); await sleep(300);
  const sel = await p.evaluate(() => ({selT: R.selT, selS: R.selS, slot: R.slot[10], pend: R.pend[10] ? R.pend[10].slot : null, chain: !!AU.tracks[10], clip: !!S.tracks[10].clips[8]}));
  ok(tag + ': Tipp auf Clip (Spur 11, Szene 9) wählt ihn und startet ihn (oder plant ihn)', sel.selS === 8 && sel.selT === 10 && (sel.slot === 8 || sel.pend === 8), sel);
  await p.evaluate(() => stop());
  // ＋ Szene (leere Spalte) antippen → 11 Szenen, ↶
  const ad = await R_(p, () => document.querySelector('#clipGrid .xladd:not(.mxoff)')); await T.tap(ad.cx, ad.cy); await sleep(400);
  const a1 = await p.evaluate(() => ({ns: NS(), lab: SYNQUENZER.xl.bank().lab, top: UNDO[UNDO.length - 1].kind}));
  await p.evaluate(() => undo()); await sleep(300);
  const a2 = await p.evaluate(() => ({ns: NS(), lab: SYNQUENZER.xl.bank().lab}));
  ok(tag + ': ＋ Szene in der Matrix → Szene 11 (ein ↶-Schritt), ↶ → wieder 10', a1.ns === 11 && a1.top === 'xls' && a2.ns === 10, [a1, a2]);
  // [SZ] halten → Szenen-Blatt (Bänke, ＋ Szene, ＋ Spur), im Bild, Knöpfe ≥ 44 px; Bank 5–8 antippen
  const zr = await R_(p, () => UI.szb);
  if (await p.evaluate(() => MX.szAt === 'left')) {
    await T.hold(zr.cx, zr.cy, 700);
    const sh = await p.evaluate(() => { const P = UI.pop && UI.pop.el; if (!P) return null; const q = P.getBoundingClientRect();
      const bs = [...P.querySelectorAll('button')].filter(x => x.getClientRects().length).map(x => x.getBoundingClientRect());
      return {name: UI.pop.name, in: q.left >= 7.5 && q.top >= 7.5 && q.right <= innerWidth - 7.5 && q.bottom <= innerHeight - 7.5, small: bs.filter(r => r.height < 43.5 || r.width < 43.5).length, n: bs.length,
        txt: [...P.querySelectorAll('[data-xb] b')].map(x => x.textContent), lab: SYNQUENZER.xl.bank().lab}; });
    ok(tag + ': [SZ] halten = Szenen-Blatt (alle Bänke, ＋ Szene, ＋ Spur), ganz im Bild, Knöpfe ≥ 44 px, Tipp blättert nicht', sh && sh.name === 'xlbank' && sh.in && sh.small === 0 && sh.txt.length >= 2 && sh.lab === '9–10', sh);
    await p.screenshot({path: `${dir}/xlb-blatt-${tag}.png`});
    const bb = await R_(p, () => UI.pop.el.querySelector('[data-xb="' + (MX.cols === 8 ? 0 : 4) + '"]')); await T.tap(bb.cx, bb.cy); await sleep(300);
    ok(tag + ': im Blatt eine Bank antippen = dorthin blättern', (await p.evaluate(() => SYNQUENZER.xl.bank().lab)) === (w > h ? '1–8' : '5–8'));
  } else ok(tag + ': [SZ] unter ■ (schmale Kopfspalte) – Szenen-Blatt über den Szenen-Kopf', true);
  // Szenen-Kopf 9 halten → MTX-Szenen-Blatt mit ＋ Szene; duplizieren in die leere Szene 10
  await p.evaluate(() => setSceneBank(2)); await sleep(250);
  const hd = await R_(p, () => UI.scenes[8]); await T.hold(hd.cx, hd.cy, 700);
  const ss = await p.evaluate(() => { const P = UI.pop && UI.pop.el; return P ? {name: UI.pop.name, add: !!P.querySelector('.xlsr [data-xa="s"]'), dup: (P.querySelector('[data-mtx="dup"]') || {}).textContent, in: (() => { const q = P.getBoundingClientRect(); return q.top >= 7 && q.bottom <= innerHeight - 7 && q.left >= 7 && q.right <= innerWidth - 7; })()} : null; });
  ok(tag + ': Szenen-Kopf 9 halten = Szenen-Blatt mit ＋ Szene (im Bild)', ss && ss.name === 'mtxscn' && ss.add && ss.in, ss);
  const dp = await R_(p, () => UI.pop.el.querySelector('[data-mtx="dup"]')); if (dp) await T.tap(dp.cx, dp.cy); await sleep(400);
  const du = await p.evaluate(() => ({last: MTX.last, ns: NS(), lab: SYNQUENZER.xl.bank().lab}));
  ok(tag + ': Szene 9 duplizieren → Szene 10 (ein ↶)', du.last && du.last.op === 'scn' && du.last.from === 8 && du.last.to === 9, du);
  if (du.last) { await p.evaluate(() => undo()); await sleep(200); }
  await p.evaluate(() => closePop()); await sleep(150);
  // Spur-Seiten: [▲▼] blättert durch alle Seiten (DRUMS bleibt)
  const pg = await p.evaluate(() => ({pages: MX.pages ? MX.pages.length : 1, bankT: MX.bankT}));
  if (pg.bankT) {
    const seen = [];
    for (let k = 0; k < pg.pages; k++) { const r = await R_(p, () => UI.tbb); await T.tap(r.cx, r.cy); await sleep(200); seen.push(await p.evaluate(() => ({tb: trackBankOf(), lab: UI.tbb.children[1].textContent, drums: !UI.heads[DRUM_T].el.classList.contains('mxoff')}))); }
    ok(tag + ': [▲▼] blättert durch alle ' + pg.pages + ' Spur-Seiten, DRUMS immer sichtbar', new Set(seen.map(s => s.tb)).size === pg.pages && seen.every(s => s.drums), seen);
  } else ok(tag + ': alle 12 Spuren ohne Spur-Seiten sichtbar', true, pg);
  // Spur 11 (Index 10) per ■ halten → Spur-Blatt mit ＋ Spur (12 von 24)
  await p.evaluate(() => { const pg = MX.pages ? MX.pages.findIndex(q => q.includes(10)) : -1; if (pg >= 0) setTrackBank(pg); }); await sleep(250);
  const st = await R_(p, () => UI.stops[10]); await T.hold(st.cx, st.cy, 700);
  const ts = await p.evaluate(() => { const P = UI.pop && UI.pop.el; return P ? {name: UI.pop.name, add: P.querySelector('[data-a="add"]') && !P.querySelector('[data-a="add"]').disabled, txt: P.querySelector('.small').textContent} : null; });
  ok(tag + ': ■ halten an Spur 11 = Spur-Blatt mit ＋ Spur (12 von 24 Spuren)', ts && ts.name === 'track' && ts.add && /12 von 24/.test(ts.txt), ts);
  await p.evaluate(() => closePop()); await sleep(200);
  // Ziehen an den Rand (MTX-2): Clip aus Bank 9–10 nach rechts über die ■-Spalte → Bank wechselt (quer: nach links)
  const z1 = await p.evaluate(() => { setSceneBank(0); const z = typeof xlEdgeS === 'function' ? xlEdgeS(1) : null; return z ? {dir: z.dir, lab: z.lab} : null; });
  ok(tag + ': Rand-Blättern kennt die Nachbar-Bank (rechts → ' + (z1 && z1.lab) + ')', z1 && z1.dir === 'right' && (z1.lab === 'Szenen 5–8' || z1.lab === 'Szenen 9–10'), z1);
  // Song-Editor: alle Spuren über Seiten, Zelle an Spur 11 antippen → Szene ≥ 9 im Song
  await p.evaluate(() => { setSongView(true); }); await sleep(600);
  const sv = await p.evaluate(() => { const L = svLayoutInfo(); return {rows: L.rows, banks: L.banks, bank: L.bank, rowH: L.rowH, cellW: L.cellW, rulerH: L.rulerH, x0: L.x0}; });
  const allRows = new Set();
  for (let k = 0; k < sv.banks; k++) { const L = await p.evaluate(() => svLayoutInfo().rows); L.forEach(x => allRows.add(x)); if (sv.banks > 1) { const r = await R_(p, () => SV.tbb); await T.tap(r.cx, r.cy); await sleep(250); } }
  ok(tag + ': Song-Editor zeigt über ' + sv.banks + ' Seite(n) alle 12 Spuren', [...allRows].filter(x => /^(S\d+|MEL|DR|ST)$/.test(x)).length === 12, [...allRows]);
  const cellXY = await p.evaluate(() => { const pg = SV.pages ? SV.pages.findIndex(q => q.includes(10)) : -1; if (pg >= 0 && pg !== trackBankOf()) { setTrackBank(pg); svLayout(); } const L = svLayoutInfo(), k = SV.rows.indexOf(10), r = SV.cv.getBoundingClientRect();
    return k < 0 ? null : {x: r.left + 1 * L.cellW - L.x0 + L.cellW / 2, y: r.top + L.rulerH + k * L.rowH + L.rowH / 2, before: JSON.stringify(S.song ? S.song.lanes[10] : null)}; });
  if (cellXY) { await T.tap(cellXY.x, cellXY.y); await sleep(400); }
  const sv2 = await p.evaluate(() => ({lane: S.song ? S.song.lanes[10] : null}));
  ok(tag + ': Tipp auf Song-Zelle von Spur 11 setzt eine Szene (Takt 2)', cellXY && sv2.lane && sv2.lane.some(e => e.bar === 1 && e.slot >= 0), {cellXY, lane: sv2.lane});
  await p.screenshot({path: `${dir}/xlb-song-${tag}.png`});
  await p.evaluate(() => setSongView(false)); await sleep(300);
  // Mixer: alle Spuren
  const mx = await p.evaluate(async () => { try { mx3Open(null); } catch (e) { return {err: String(e)}; } await new Promise(r => setTimeout(r, 500)); const P = UI.pop && UI.pop.el; const txt = P ? P.textContent : ''; const names = S.tracks.map(t => t.name).filter(n => txt.includes(n)); try { closePop(); } catch (e) {} return {open: !!P, names: names.length}; });
  ok(tag + ': Mix-&-Master-Blatt öffnet mit 12 Spuren ohne Fehler', mx.open && !mx.err, mx);
  // Video-Matrix (App-Bild): Bank der laufenden Szene 10
  const vv = await p.evaluate(() => { const st = {slots: S.tracks.map(() => 9)}; const M = vvAppMatrixLayout(st); return {c0: M.c0, hiddenS: M.hiddenS}; });
  ok(tag + ': Video-Matrix zeigt die Bank der laufenden Szene 10 (9–12)', vv.c0 === 8, vv);
  ok(tag + ': Konsole ohne Fehler', !errs.length, errs);
  await ctx.close();
}

// ======================= T2b: ältere Fassung (4.78) öffnet ein großes Projekt nur gesperrt =======================
{
  const B = await open(file, 428, 926), A = await open(base, 428, 926);
  await MKXL(B.p, 14, 12, 0);
  const xlf = await B.p.evaluate(() => JSON.stringify(projectFileObj(S, true, false)));
  const old = await A.p.evaluate(t => { const fo = JSON.parse(t), r = parseProjectFile(fo); const p = r && r.project; const L = p ? nvLockOf(p) : null; const back = nvFileOf(fo, fo.project.id, fo.project.name);
    return {lock: !!L, f: L && L.f, nt: p && p.tracks.length, ns: p && p.scenes.length, orig: JSON.stringify(back) === JSON.stringify(fo)}; }, xlf);
  ok('T2b 4.78 öffnet das große Projekt gesperrt (Format 8) und gibt die Original-Datei unverändert weiter', old.lock && old.f === 8 && old.orig, old);
  // gleiche Szenen-Grenzen beim Laden: eine Datei mit 40 Szenen → 32, mit 5 → 8 (nie weniger)
  const cl = await B.p.evaluate(() => { const p = JSON.parse(serializeProject()); const a = JSON.parse(JSON.stringify(p)); while (a.scenes.length < 40) a.scenes.push({name: 'X'}); a.tracks.forEach(t => { while (t.clips.length < 40) t.clips.push(null); });
    const b = JSON.parse(JSON.stringify(p)); b.scenes = b.scenes.slice(0, 5); b.tracks.forEach(t => t.clips = t.clips.slice(0, 5)); b.tracks = b.tracks.slice(0, 6);
    const A1 = normalizeProject(a), B1 = normalizeProject(b);
    return {a: [A1.scenes.length, [...new Set(A1.tracks.map(t => t.clips.length))]], b: [B1.scenes.length, [...new Set(B1.tracks.map(t => t.clips.length))]], ctx: XLB.nn, cur: NS()}; });
  ok('Laden klemmt Szenen auf 8…32, alle Spuren gleich lang, Kontext danach zu', cl.a[0] === 32 && cl.a[1].join() === '32' && cl.b[0] === 8 && cl.b[1].join() === '8' && cl.ctx === 0 && cl.cur === 12, cl);
  // bisherige Wege bleiben im normalen Projekt bei 8 (Einzelspuren-Plan), ＋ Spur von Hand bis 24
  const lim = await B.p.evaluate(() => { switchProject(demoProject(), {first: true}); const a = {tLim: SYNQUENZER.xl.tLim(), can: canAddTrack(), hand: SYNQUENZER.xl.canAdd(), free: mtx3Plan().free};
    addTrack(); addTrack(); return Object.assign(a, {at8: {can: canAddTrack(), hand: SYNQUENZER.xl.canAdd(), free: mtx3Plan().free}}); });
  ok('Bisherige Wege (Einzelspuren, Spur duplizieren, Spektral) im normalen Projekt weiter bis 8; ＋ Spur von Hand bis 24', lim.tLim === 8 && lim.free === 2 && lim.at8.can === false && lim.at8.free === 0 && lim.at8.hand === true, lim);
  ok('Konsole ohne Fehler (T2b)', !A.errs.length && !B.errs.length, A.errs.concat(B.errs));
  await A.ctx.close(); await B.ctx.close();
}
await b.close();
const bad = res.filter(r => !r.ok);
console.log('ERGEBNIS ' + (res.length - bad.length) + ' OK / ' + bad.length + ' FEHLER');
fs.writeFileSync(dir + '/xlb-test.json', JSON.stringify(res, null, 1));
process.exit(bad.length ? 1 : 0);
