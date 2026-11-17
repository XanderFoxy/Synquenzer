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

// ======================= T6: Prüfung XLB-P (Befunde des Prüfers) =======================
// T6a Song-Editor: Blöcke der Spuren 9/10 in ihrer Spurfarbe (Kästchen und Glas), T6b/T6c Pegel-Messer je Projekt (live + Video),
// T6d „Szene n entfernen“ nicht, wenn eine Song-Marke oder die Akkord-Zeile auf die Szene zeigt.
const hex3 = h => { const v = parseInt(String(h).replace('#', ''), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; };
const near = (a, b, d = 40) => Array.isArray(a) && Array.isArray(b) && a.every((x, k) => Math.abs(x - b[k]) <= d);
{
  const {ctx, p, errs} = await open(file, 428, 926);
  const c = await p.evaluate(async () => {
    const W = ms => new Promise(r => setTimeout(r, ms));
    switchProject(newProject(), {first: true}); addTrack(); addTrack(); addTrack(); addTrack();   // 10 Spuren
    const K = {root: 0, scale: 'ionian'}, TT = [0, 1, 2, 8, 9];
    for (const t of TT) { S.tracks[t].clips[0] = normClip({len: 1, key: K, notes: [{t: 0, d: .5, n: 60, v: .8}, {t: 2, d: .5, n: 64, v: .7}]}, 'synth', S.key); clipChanged(t, 0); }
    const lanes = Array.from({length: NT()}, () => []); for (const t of TT) lanes[t] = [{bar: 0, slot: 0}, {bar: 1, slot: 0}, {bar: 2, slot: 0}];
    S.song = normSong({bars: 4, lanes}, S.key, NT()); songChanged();
    const out = {cols: 0, sq: {}, gl: {}};
    const probe = async (glass, dst) => {
      songViewMode(glass ? 'glass' : 'squares'); if (!UI.songView) setSongView(true); UI.dirty.song = true; await W(700);
      const g = SV.cv.getContext('2d'), dpr = SV.dpr || devicePixelRatio, cw = SV.cellW, rh = SV.rowH, ru = SV.rulerH;
      for (const t of TT) {
        const r = SV.rows.indexOf(t); if (r < 0) { dst[t] = null; continue; }
        const x = (1 * cw - (SV.x || 0) + (glass ? cw * .5 : 4)) * dpr, y = (ru + r * rh + (glass ? rh * .5 : 5)) * dpr;
        const d = g.getImageData(Math.round(x), Math.round(y), 1, 1).data; dst[t] = [d[0], d[1], d[2]];
      }
    };
    await probe(false, out.sq); await probe(true, out.gl); songViewMode('squares');
    out.cols = SV.cols.length; const cs = getComputedStyle(document.documentElement); out.want = [1, 2, 9, 10].map(k => cs.getPropertyValue('--t' + k).trim());
    setSongView(false); return out;
  });
  await p.screenshot({path: `${dir}/xlbp-song-farben.png`});
  const [w1, w2, w9, w10] = c.want.map(hex3), bg = [11, 12, 15];
  ok('T6a Song-Editor: SV.cols kennt alle 24 Spuren', c.cols === 24, c.cols);
  ok('T6a Kästchen: Blöcke von Spur 9/10 in ihrer Farbe (--t9/--t10), wie Spur 1/2', near(c.sq[8], w9) && near(c.sq[9], w10) && near(c.sq[0], w1) && near(c.sq[1], w2) && !near(c.sq[8], bg, 8), c);
  ok('T6a Glas: Kacheln von Spur 9/10 gleich gefärbt wie Spur 1/2 (gleiche Farbe, gleicher Clip)', near(c.gl[8], c.gl[0], 6) && near(c.gl[9], c.gl[1], 6) && !near(c.gl[8], bg, 4) && !near(c.gl[9], bg, 4), c.gl);
  ok('T6a Konsole ohne Fehler', !errs.length, errs.slice(0, 5));
  await ctx.close();
}
{
  // T6b Pegel-Messer live: normales Projekt 9 Eingänge (wie 4.78), > 8 Spuren 25, zurück zum normalen Projekt wieder 9
  const A = await open(base, 428, 926), B = await open(file, 428, 926);
  const liveA = await A.p.evaluate(async () => {
    const W = ms => new Promise(r => setTimeout(r, ms));
    switchProject(demoProject(), {first: true}); ensureAudio(); for (let k = 0; k < 40 && !AU.meter; k++) await W(100);
    return {inputs: AU.meter && AU.meter.node ? AU.meter.node.numberOfInputs : null};
  });
  const live = await B.p.evaluate(async () => {
    const W = ms => new Promise(r => setTimeout(r, ms));
    switchProject(demoProject(), {first: true}); ensureAudio(); for (let k = 0; k < 40 && !AU.meter; k++) await W(100);
    const o = {n0: SYNQUENZER.xl.mtr()};
    while (NT() < 9) addTrack(); await W(400); o.n1 = SYNQUENZER.xl.mtr();
    S.tracks[8].clips[0] = normClip({len: 1, key: {root: 0, scale: 'ionian'}, notes: [0, 1, 2, 3].map(t => ({t, d: .8, n: 60, v: .9}))}, 'synth', S.key); clipChanged(8, 0);
    launchScene(0); play(); await W(2500);
    let pk8 = 0, pkM = 0; for (let k = 0; k < 20; k++) { pk8 = Math.max(pk8, MTR.disp[8 * 4]); pkM = Math.max(pkM, MTR.disp[MAX_T * 4]); await W(50); }
    o.on = MTR.on; o.pk8 = +pk8.toFixed(4); o.pkM = +pkM.toFixed(4); stop(); await W(300);
    switchProject(demoProject(), {first: true}); await W(400); o.n2 = SYNQUENZER.xl.mtr();
    launchScene(0); play(); await W(2000); let pkM2 = 0; for (let k = 0; k < 20; k++) { pkM2 = Math.max(pkM2, MTR.disp[MAX_T * 4]); await W(50); } stop();
    o.pkM2 = +pkM2.toFixed(4); return o;
  });
  ok('T6b Pegel-Messer normales Projekt: 9 Eingänge, wie 4.78', live.n0.inputs === 9 && live.n0.n === 9 && live.n0.w === 19 && liveA.inputs === 9, {xlb: live.n0, basis: liveA});
  ok('T6b ＋ Spur über 8: Messer einmal neu mit 25 Eingängen, Spur 9 und Master zeigen Pegel', live.n1.inputs === 25 && live.n1.w === 51 && live.n1.re >= 1 && live.pk8 > 0.01 && live.pkM > 0.01, live);
  ok('T6b zurück zum normalen Projekt: wieder 9 Eingänge, Master zeigt Pegel', live.n2.inputs === 9 && live.n2.re >= 2 && live.pkM2 > 0.01, {n2: live.n2, pkM2: live.pkM2});
  // T6c Video (offline): normales Projekt speichert 19 Werte je Fenster (wie 4.78), großes 51; Werte da
  const rnd = async (P, big) => P.evaluate(async big => {
    switchProject(demoProject(), {first: true});
    if (big) { while (NT() < 9) addTrack(); S.tracks[8].clips[0] = normClip({len: 1, key: {root: 0, scale: 'ionian'}, notes: [0, 1, 2, 3].map(t => ({t, d: .8, n: 60, v: .9}))}, 'synth', S.key); clipChanged(8, 0); }
    const lanes = Array.from({length: NT()}, (_, t) => (S.tracks[t].clips[0] ? [{bar: 0, slot: 0}, {bar: 1, slot: 0}] : []));
    S.song = normSong({bars: 2, lanes}, S.key, NT()); songChanged();
    const r = await vvRenderAudio({range: {a: 0, b: 2, sel: false}}); const M = r.mtr; if (!M) return {mtr: false};
    const o = new Float32Array(4), t = M.off + 1.0, pk = k => { mtrAt(M.Q, t - (k === MAX_T ? 0 : M.gl), k, o, 0, .5); return +o[0].toFixed(4); };
    const W = M.Q.w || (M.Q.v.length / M.Q.cap);
    return {mtr: true, n: M.Q.n, w: W, mbMin: +(W * 4 * r.sr / 128 * 60 / 1048576).toFixed(2), pk0: pk(0), pk8: big ? pk(8) : null, pkM: pk(MAX_T)};
  }, big);
  const vA = await rnd(A.p, false), vN = await rnd(B.p, false), vX = await rnd(B.p, true);
  ok('T6c Video normales Projekt: 19 Messwerte je Fenster wie 4.78 (Speicher je Minute gleich), Spur 1 und Master gemessen', vN.mtr && vN.w === 19 && vA.w === 19 && vN.mbMin === vA.mbMin && vN.pk0 > 0.01 && vN.pkM > 0.01, {xlb: vN, basis: vA});
  ok('T6c Video großes Projekt (9 Spuren): 51 Werte je Fenster, Spur 9 und Master gemessen', vX.mtr && vX.n === 25 && vX.w === 51 && vX.pk8 > 0.01 && vX.pkM > 0.01, vX);
  ok('T6b/c Konsole ohne Fehler', !A.errs.length && !B.errs.length, A.errs.concat(B.errs).slice(0, 5));
  await A.ctx.close(); await B.ctx.close();
}
{
  // T6d Szene entfernen: nicht, solange eine Song-Marke „S9“ oder die (wartende) Akkord-Zeile auf Szene 9 zeigt
  const {ctx, p, errs} = await open(file, 428, 926);
  const d = await p.evaluate(async () => {
    const W = ms => new Promise(r => setTimeout(r, ms));
    switchProject(demoProject(), {first: true}); SYNQUENZER.xl.addScene(true);
    S.song = normSong({bars: 8, lanes: [], marks: [{a: 0, len: 4, part: 'S9'}]}, S.key, NT()); songChanged();
    const o = {why1: SYNQUENZER.xl.remWhy(), rem1: SYNQUENZER.xl.remScene(true), ns1: NS(), marks1: S.song.marks.map(m => m.part)};
    SYNQUENZER.xl.sheet(); await W(300); o.btn1 = !!document.querySelector('.xlbank button[data-xa="r"]'); closePop(); await W(150);
    S.song.marks = []; songChanged();
    R.rowPend = {src: 'S9', beat: 0}; o.why2 = SYNQUENZER.xl.remWhy(); R.rowPend = null;
    o.why3 = SYNQUENZER.xl.remWhy(); SYNQUENZER.xl.sheet(); await W(300); o.btn3 = !!document.querySelector('.xlbank button[data-xa="r"]'); closePop(); await W(150);
    o.rem3 = SYNQUENZER.xl.remScene(true); o.ns3 = NS(); undo(); o.nsU = NS();
    return o;
  });
  ok('T6d Song-Marke „S9“: Szene 9 entfernen wird verweigert, Knopf im Szenen-Blatt fehlt, Marke bleibt gültig', d.why1 && !d.rem1 && d.ns1 === 9 && d.marks1.join() === 'S9' && !d.btn1, d);
  ok('T6d Akkord-Zeile wartet auf Szene 9: verweigert', !!d.why2, d.why2);
  ok('T6d ohne Marke und Zeile: Knopf da, Szene 9 entfernt, ↶ holt sie zurück', !d.why3 && d.btn3 && d.rem3 && d.ns3 === 8 && d.nsU === 9, d);
  ok('T6d Konsole ohne Fehler', !errs.length, errs.slice(0, 5));
  await ctx.close();
}
await b.close();
const bad = res.filter(r => !r.ok);
console.log('ERGEBNIS ' + (res.length - bad.length) + ' OK / ' + bad.length + ' FEHLER');
fs.writeFileSync(dir + '/xlb-test.json', JSON.stringify(res, null, 1));
process.exit(bad.length ? 1 : 0);
