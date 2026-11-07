// VD3: Video wie die App (Voreinstellung [Ganze App], Titel, Untertitel-Rand, Ansicht „Text“), Schnitt-Modus im Song (Video-Spur, Chip-Menü,
// teilen, Kante ziehen, aus = unverändert), Making-of (Protokoll über die echten Haken, Speicher, Projekt, Plan, Vorlauf-Standbilder,
// echter Render mit Ton, deterministisch, Renderzeit). Aufruf: node vd3-test.mjs <index.html> <basis.html> <out-dir>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const APP = process.argv[2], BASE = process.argv[3], OUT = process.argv[4], ST = OUT + '/stills';
fs.mkdirSync(ST, {recursive: true});
const C = []; const ok = (id, c, info) => { C.push([id, !!c]); console.log((c ? 'PASS ' : 'FAIL ') + id + (info != null ? ' — ' + JSON.stringify(info).slice(0, 600) : '')); };
const save = (name, b64) => fs.writeFileSync(ST + '/' + name, Buffer.from(b64, 'base64'));
const sh = c => execSync(c, {stdio: ['ignore', 'pipe', 'pipe']}).toString();
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [];
async function open(file, w, h, touch) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: touch ? 2 : 1, hasTouch: !!touch, isMobile: !!touch});
  p.on('pageerror', e => errs.push('PAGEERR ' + e)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  if (!touch) await p.mouse.click(5, 300);
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading', null, {timeout: 15000}).catch(() => {});
  return p;
}
// der Song: Intro (Bass, Drums, ab Takt 3 Akkorde) · Strophe (Gegenmelodie, STIMME mit Text) · Refrain
const SONG = async () => {
  const A = SYNQUENZER; A.setMetronome && A.setMetronome(false);
  const syn = (n0, pat) => ({len: 1, notes: pat.map(([t, d, n, v]) => ({t, d, n: n0 + n, v}))});
  A.setClip(0, 0, syn(36, [[0, .5, 0, .9], [1, .5, 0, .6], [2, .5, 7, .8], [3, .5, 5, .5]]));
  A.setClip(1, 0, syn(72, [[0, 1.5, 0, .5], [1.5, .5, 2, .7], [2, 1, 4, .95], [3, 1, 7, .4]]));
  A.setClip(2, 0, syn(60, [[0, 4, 0, .6], [0, 4, 4, .55], [0, 4, 7, .5]]));
  A.setClip(DRUM_T, 0, {len: 1, notes: [[0, 36, .95], [1, 38, .8], [2, 36, .9], [3, 38, .85], [0, 42, .5], [.5, 42, .4], [1, 42, .5], [1.5, 42, .4]].map(([t, n, v]) => ({t, d: .25, n, v}))});
  const nt = NT(), lanes = Array.from({length: nt}, () => []);
  lanes[0] = [{bar: 0, slot: 0}]; lanes[1] = [{bar: 4, slot: 0}]; lanes[2] = [{bar: 2, slot: 0}]; lanes[DRUM_T] = [{bar: 0, slot: 0}];
  A.setSong({bars: 12, lanes, carrier: [], marks: [{id: 'm1', a: 0, len: 4, name: 'Intro'}, {id: 'm2', a: 4, len: 4, name: 'Strophe'}, {id: 'm3', a: 8, len: 4, name: 'Refrain'}]});
  return {bars: S.song.bars, bpm: S.bpm, drumT: DRUM_T, nt};
};

/* ======================= 1. Wie die App: Voreinstellung, Titel, Rand, Text ======================= */
let p = await open(APP, 428, 926, false);
const pf = await p.evaluate(() => { const keep = Object.assign({}, uiPrefs().vv || {}); const v = uiPrefs().vv || {}; delete v.cam; const a = vvPrefs().cam; v.cam = 'kamera'; const k = vvPrefs().cam; v.cam = 'balken'; const bl = vvPrefs().cam; uiPrefs().vv = keep; return {neu: a, kamera: k, balken: bl, fmt: vvPrefs().fmt}; });
ok('Voreinstellung: 9:16 + [Ganze App] (wie die App); eine gespeicherte Wahl bleibt (Kamera/Balken)', pf.neu === 'app' && pf.kamera === 'kamera' && pf.balken === 'balken' && pf.fmt === '9:16', pf);
const setup = await p.evaluate(SONG);
await p.evaluate(() => new Promise(r => setTimeout(r, 30)));
// STIMME mit Songtext (Takt 5–6)
const ly = await p.evaluate(async () => {
  const pcm = []; for (let k = 0; k < 48000 * 1.8; k++) pcm.push(Math.round(7000 * Math.sin(k * 2 * Math.PI * 220 / 48000) * Math.min(1, k / 2000, (86400 - k) / 2000)));
  const inj = await SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2});
  const m = S.takes[inj.id]; m.ly = {s: [{x: 'Hal', t: .05, w: 1}, {x: 'lo', t: .3}, {x: 'du', t: .6, w: 1}, {x: 'schö', t: .9, w: 1}, {x: 'ne', t: 1.1}, {x: 'Welt', t: 1.3, w: 1}]};
  const st = stimmeT(); const L = S.song.lanes.map(x => x.slice()); L[st] = [{bar: 4, slot: 0}, {bar: 6, slot: -1}];
  SYNQUENZER.setSong(Object.assign(JSON.parse(JSON.stringify(S.song)), {lanes: L}));
  return {id: inj.id, st};
});
await p.evaluate(() => SYNQUENZER.vvRender({range: {a: 0, b: 12}}));
const tOf = bar => p.evaluate(bar => { const r = VV.last; return (r.lead || 0) + bar * 4 * 60 / r.bpm; }, bar);
const sTi = await p.evaluate(() => SYNQUENZER.vd3.shot(.2, '9:16', {ti: true})), sTi2 = await p.evaluate(() => SYNQUENZER.vd3.shot(.2, '9:16', {ti: true}));
const s0 = await p.evaluate(() => SYNQUENZER.vd3.shot(2, '9:16', {})), sGone = await p.evaluate(() => SYNQUENZER.vd3.shot(2, '9:16', {ti: true}));
save('titel-9x16.png', sTi.png);
ok('Titel: erste Sekunde mit Songname/Tempo/Tonart, nach 1,35 s wieder das App-Bild (gleich wie ohne Titel), deterministisch', sTi.hash === sTi2.hash && sTi.hash !== s0.hash && sGone.hash === s0.hash, {ti: sTi.hash, ohne: s0.hash, spaeter: sGone.hash});
const sRd = await p.evaluate(() => SYNQUENZER.vd3.shot(3, '9:16', {rd: true}));
save('untertitel-rand-9x16.png', sRd.png);
const px = await p.evaluate(async b64 => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
  const lum = (x, y, w, h) => { const d = g.getImageData(x, y, w, h).data; let s = 0, mx = 0; for (let k = 0; k < d.length; k += 4) { const v = (d[k] + d[k + 1] + d[k + 2]) / 3; s += v; if (v > mx) mx = v; } return {mean: +(s / (d.length / 4)).toFixed(1), max: mx}; };
  return {unten: lum(0, Math.round(im.height * .82), im.width, Math.round(im.height * .17)), mitte: lum(Math.round(im.width * .2), Math.round(im.height * .3), Math.round(im.width * .6), Math.round(im.height * .3)), w: im.width, h: im.height}; }, sRd.png);
ok('Untertitel-Rand: das App-Bild liegt in der sicheren Zone, unten ≈ 18 % frei (dunkel, kein App-Inhalt)', px.unten.max < 60 && px.mitte.max > 150, px);
const tTxt = await tOf(4.6), tx = await p.evaluate(t => SYNQUENZER.vd3.textPic(t, '9:16'), tTxt), tx2 = await p.evaluate(t => SYNQUENZER.vd3.textPic(t, '16:9'), await tOf(9.5));
save('text-9x16-songtext.png', tx.png); save('text-16x9-teil.png', tx2.png);
ok('Ansicht „Text“: Songtext der STIMME (Silben, die klingende hervorgehoben); ohne Text der Teil-Name groß', tx.probe && tx.probe.text && tx.probe.text.ly && /Hal/.test(tx.probe.text.ly.line) && tx2.probe.text && !tx2.probe.text.ly && tx2.probe.text.part === 'Refrain', {a: tx.probe, b: tx2.probe});

/* ======================= 2. Schnitt-Modus im Song (hochkant, per Finger) ======================= */
await p.close();
p = await open(APP, 428, 926, true);
await p.evaluate(SONG); await p.evaluate(() => { SYNQUENZER.vd3.cut(false); setSongView(true); }); await p.waitForTimeout(400);
const L0 = await p.evaluate(() => ({ru: SV.rulerH, rowH: SV.rowH, vvS: SV.vvS, cuts: SYNQUENZER.vvCuts({range: {a: 0, b: 12}}).hash}));
const shotOff0 = await p.locator('#songView .sv-cw').screenshot();
// an über SCHLEIFE ▾ → „Video-Schnitt im Song“
let r_ = await p.evaluate(() => { const r = SV.btn.bLoop.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
await p.touchscreen.tap(r_[0], r_[1]); await p.waitForTimeout(300);
const lb = await p.evaluate(() => { const b = document.querySelector('.vd3-lb'); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, h: r.height, txt: b.textContent}; });
ok('SCHLEIFE ▾ hat die Zeile „Video-Schnitt im Song · aus“ (44 px)', lb && lb.h >= 44 && /Video-Schnitt im Song/.test(lb.txt) && /aus/.test(lb.txt), lb);
await p.touchscreen.tap(lb.x, lb.y); await p.waitForTimeout(200); await p.evaluate(() => closePop()); await p.waitForTimeout(300);
const L1 = await p.evaluate(() => ({ru: SV.rulerH, rowH: SV.rowH, vvS: SV.vvS, lane: SYNQUENZER.vd3.lane(), lbl: SYNQUENZER.vd3.info().lbl}));
ok('Schnitt-Modus an: eigene Video-Spur (24 px) unter den Takt-Nummern, die Takt-Leiste bleibt gleich hoch, Spalte „VIDEO“', L1.vvS === 24 && L1.ru === L0.ru + 24 && L1.lbl && L1.lane.chips.length >= 3, {L0, L1: {ru: L1.ru, vvS: L1.vvS, rowH: L1.rowH, chips: L1.lane.chips.map(c => [c.a, c.b, c.v, c.t, c.man])}});
const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className : null; }, [L1.lane.chips[0].x0 + 20, L1.lane.y + L1.lane.h / 2]);
const rulerHit = await p.evaluate(() => { const r = SV.wrap.getBoundingClientRect(); const y = r.top + 4 + (SV.blS | 0) + 6; const e = document.elementFromPoint(r.left + 30, y); return {tag: e ? e.tagName : null, y0: SV.rulerH - SV.vvS}; });
ok('Nichts verdeckt die Takte: Spur und Takt-Nummern liegen auf der Song-Fläche (keine Ebene darüber)', /^CANVAS/.test(hit || '') && rulerHit.tag === 'CANVAS', {hit, rulerHit});
await p.screenshot({path: ST + '/schnitt-hochkant-spur.png'});
// Chip antippen → Menü; „Ab Takt n“ (teilen) + Klavier
const ch1 = L1.lane.chips.find(c => c.b - c.a >= 2 && c.x0 >= L1.lane.x) || L1.lane.chips[0];
const bar = ch1.a + 1, tapX = L1.lane.x + (bar + .5) * L1.lane.cellW - L1.lane.sx;
await p.touchscreen.tap(tapX, L1.lane.y + L1.lane.h / 2); await p.waitForTimeout(300);
const menu = await p.evaluate(() => { const P = document.querySelector('.vd3pop'); if (!P) return null; return {name: UI.pop && UI.pop.name, opts: [...P.querySelectorAll('.vd3g .rb')].map(b => b.textContent.trim()), split: [...P.querySelectorAll('.vd3sp .rb')].map(b => b.textContent.trim()), minH: Math.min(...[...P.querySelectorAll('button')].map(b => b.getBoundingClientRect().height)), x: (() => { const x = P.querySelector('.vd3x'); const r = x.getBoundingClientRect(); return r.width >= 44 && r.height >= 44 && r.top >= 0; })()}; });
ok('Tipp auf Chip = Menü: Auto, App, Klavier, Mäusekino, Gerät, Matrix, Noten, Text; „Ab Takt n“ teilt; ✕ sichtbar; Tasten ≥ 44 px', menu && ['Auto', 'App', 'Klavier', 'Mäusekino', 'Gerät …', 'Matrix', 'Noten …', 'Text'].every(o => menu.opts.includes(o)) && menu.split.length === 2 && menu.minH >= 44 && menu.x, menu);
await p.screenshot({path: ST + '/schnitt-hochkant-menue.png'});
const tapSel = async sel => { const r = await p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, sel); if (r) await p.touchscreen.tap(r[0], r[1]); await p.waitForTimeout(250); return !!r; };
await tapSel(`.vd3sp .rb[data-from="${bar}"]`);
await tapSel('.vd3g .rb[data-v="klav"]');
const v1 = await p.evaluate(() => ({video: JSON.parse(JSON.stringify(S.song.video || null)), cuts: SYNQUENZER.vvCuts({range: {a: 0, b: 12}}).shots.map(s => [s.a, s.b, s.v, s.t])}));
ok('„Ab Takt n“ + Klavier: nur ab dem getippten Takt Klavier (geteilt), die Regie zeigt dort Klavier', v1.video && v1.video.length === 1 && v1.video[0].a === bar && v1.video[0].b === ch1.b && v1.video[0].v === 'klav' && v1.cuts.some(s => s[0] === bar && s[2] === 'klav'), {bar, ch1, v1});
const un = await p.evaluate(() => { SYNQUENZER.undo(); const a = S.song.video ? S.song.video.length : 0; SYNQUENZER.redo(); return {a, b: S.song.video ? S.song.video.length : 0}; });
ok('Ein Rückgängig-Schritt je Wahl (↶ / ↷)', un.a === 0 && un.b === 1, un);
// Gerät … → Spur wählen
const L2 = await p.evaluate(() => SYNQUENZER.vd3.lane()), c0 = L2.chips[0];
await p.touchscreen.tap(Math.max(L2.x + 8, c0.x0 + 10), L2.y + L2.h / 2); await p.waitForTimeout(300);
await tapSel('.vd3g .rb[data-v="geraet"]');
const trs = await p.evaluate(() => [...document.querySelectorAll('.vd3t .rb')].map(b => +b.dataset.t));
await tapSel(`.vd3t .rb[data-t="${trs[0]}"]`);
const v2 = await p.evaluate(() => JSON.parse(JSON.stringify(S.song.video)));
ok('Gerät … → Spur → Eintrag „Gerät · Spur“ für den ganzen Chip', trs.length >= 1 && v2.some(e => e.v === 'geraet' && e.t === trs[0] && e.a === c0.a), {trs, v2});
// Kante ziehen (Schnitt verschieben): zwischen Chip 0 und 1
const L3 = await p.evaluate(() => SYNQUENZER.vd3.lane()), kE = L3.chips.findIndex((c, k) => k + 1 < L3.chips.length && L3.chips[k + 1].b - c.b >= 2 && c.b - c.a >= 1), e0 = L3.chips[kE], e1 = L3.chips[kE + 1];
const ex = L3.x + e0.b * L3.cellW - L3.sx, ey = L3.y + L3.h / 2, to = e0.b + 1;
await p.evaluate(([x, y, x2]) => { const w = SV.wrap, ev = (t, xx) => w.dispatchEvent(new PointerEvent(t, {pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: xx, clientY: y, bubbles: true, cancelable: true, buttons: t === 'pointerup' ? 0 : 1}));
  ev('pointerdown', x); for (let k = 1; k <= 6; k++) ev('pointermove', x + (x2 - x) * k / 6); ev('pointerup', x2); }, [ex, ey, ex + (to - e0.b) * L3.cellW]);
await p.waitForTimeout(250);
const L4 = await p.evaluate(() => SYNQUENZER.vd3.lane());
const c4 = L4.chips.find(c => c.a === e0.a), d4 = L4.chips.find(c => c.a === to);
ok('Kante ziehen verschiebt den Schnitt (beide Seiten behalten ihr Bild, ein Undo-Schritt)', c4 && c4.b === to && c4.v === e0.v && d4 && d4.v === e1.v && d4.man, {kante: kE, von: e0.b, nach: to, chips: L4.chips.slice(0, 5).map(c => [c.a, c.b, c.v, c.man])});
const shotCut = await p.evaluate(() => { const r = VV.last; return r ? 1 : 0; });
void shotCut;
// aus = alles wie vorher (ohne Einträge: dieselbe Höhe und dasselbe Bild wie der Grundstand)
await p.evaluate(() => { for (let k = 0; k < 8 && S.song.video; k++) SYNQUENZER.undo(); SYNQUENZER.vd3.cut(false); if (typeof hideToast === 'function') hideToast(); }); await p.waitForTimeout(400);
const L5 = await p.evaluate(() => ({ru: SV.rulerH, rowH: SV.rowH, vvS: SV.vvS, cuts: SYNQUENZER.vvCuts({range: {a: 0, b: 12}}).hash, lbl: SYNQUENZER.vd3.info().lbl}));
const shotOff1 = await p.locator('#songView .sv-cw').screenshot(); fs.writeFileSync(OUT + '/dbg-off0.png', shotOff0); fs.writeFileSync(OUT + '/dbg-off1.png', shotOff1);
ok('Aus = unverändert: Takt-Leiste, Zeilen, Regie und Bild der Song-Fläche wie vor dem Einschalten', L5.ru === L0.ru && L5.rowH === L0.rowH && L5.vvS === 0 && !L5.lbl && L5.cuts === L0.cuts && shotOff0.equals(shotOff1), {L0, L5, gleichesBild: shotOff0.equals(shotOff1)});
// Grundstand (basis.html): dieselbe Song-Fläche
const pb = await open(BASE, 428, 926, true); await pb.evaluate(SONG); await pb.evaluate(() => setSongView(true)); await pb.waitForTimeout(400);
const shotBase = await pb.locator('#songView .sv-cw').screenshot(); fs.writeFileSync(OUT + '/dbg-base.png', shotBase); const cutsBase = await pb.evaluate(() => SYNQUENZER.vvCuts({range: {a: 0, b: 12}}).hash);
ok('Gegen den Grundstand: Song-Fläche pixelgleich, Auto-Regie (Schnittliste) gleich', shotBase.equals(shotOff1) && cutsBase === L0.cuts, {cutsBase, cuts: L0.cuts});
await pb.close();
await p.close();
// quer: Spur + Menü
p = await open(APP, 926, 428, true);
await p.evaluate(SONG); await p.evaluate(() => { SYNQUENZER.vd3.cut(true); setSongView(true); }); await p.waitForTimeout(400);
const Lq = await p.evaluate(() => SYNQUENZER.vd3.lane());
await p.touchscreen.tap(Lq.chips[1].x0 + 12, Lq.y + Lq.h / 2); await p.waitForTimeout(300);
const mq = await p.evaluate(() => { const P = document.querySelector('.vd3pop'); if (!P) return null; const r = P.getBoundingClientRect(); return {top: r.top, bottom: r.bottom, h: innerHeight, minH: Math.min(...[...P.querySelectorAll('button')].map(b => b.getBoundingClientRect().height))}; });
ok('Quer (926 × 428): Video-Spur (20 px) + Menü ganz im Bild, Tasten ≥ 44 px', Lq.vvS === 20 && mq && mq.top >= 0 && mq.bottom <= mq.h && mq.minH >= 44, {vvS: Lq.vvS, mq});
await p.screenshot({path: ST + '/schnitt-quer-menue.png'});
await p.evaluate(() => SYNQUENZER.vd3.cut(false));
await p.close();

/* ======================= 3. Making-of: Protokoll über die echten Haken ======================= */
p = await open(APP, 428, 926, false);
await p.evaluate(SONG); await p.evaluate(() => new Promise(r => setTimeout(r, 30)));
const proto = await p.evaluate(async () => {
  const A = SYNQUENZER, V = A.vd3, wait = ms => new Promise(r => setTimeout(r, ms)); V.clear(); window.VD3.touchT = -1e9;
  A.setParam(0, 'cutoff', 900); const noHand = V.log().length;          // ohne Finger (Automation/API): nichts
  const down = () => document.body.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, pointerType: 'touch'}));
  down(); for (const v of [1000, 1400, 1900, 2600, 3300]) { A.setParam(0, 'cutoff', v); await wait(120); }   // eine Regler-Geste
  down(); A.loadPreset(1, 'Mini-Lead'); await wait(20);
  const syn = (n0, pat) => ({len: 1, notes: pat.map(([t, d, n, v]) => ({t, d, n: n0 + n, v}))});
  A.setClip(3, 1, syn(67, [[0, .5, 0, .8]])); await wait(10);                                                        // Clip angelegt
  A.setClip(3, 1, syn(67, [[0, .5, 0, .8], [1, .5, 4, .7], [2, .5, 7, .9], [3, .5, 12, .6]])); await wait(10);      // Noten eingespielt
  const s2 = JSON.parse(JSON.stringify(S.song)); s2.bars = 16; s2.marks.push({id: 'm9', a: 12, len: 4, name: 'Bridge'}); A.setSong(s2); await wait(10);   // Teil gebaut
  return {noHand, log: V.log()};
});
const kinds = proto.log.map(e => e.k + (e.p ? ':' + e.p : '') + (e.x ? ':' + e.x : '') + (e.n != null ? ':' + e.n : ''));
const rg = proto.log.find(e => e.k === 'regler');
ok('Protokoll über die Haken: Regler-Geste (eine, mit Weg), Klangwahl, Clip angelegt, Noten eingespielt, Teil gebaut; ohne Finger nichts', proto.noHand === 0 && rg && rg.a === 900 && rg.b === 3300 && rg.v.length >= 4 && kinds.some(k => /^klang:1:/.test(k)) && kinds.some(k => k === 'clip:1') && kinds.some(k => k === 'noten:4') && kinds.some(k => /^teil:Bridge/.test(k)), kinds);
const sto = await p.evaluate(() => { const V = SYNQUENZER.vd3; V.flush(); const st = V.stored(); for (let k = 0; k < 900; k++) V.push({k: 'regler', t: 0, p: 'res', a: 0, b: k / 900, v: []}); V.flush(); const st2 = V.stored(); const ser = SYNQUENZER.serialize(); return {n: st && st.ev.length, n2: st2 && st2.ev.length, inFile: /vd3mo/.test(ser), bytes: JSON.stringify(st2).length}; });
ok('Nur lokal (localStorage je Projekt), begrenzt auf 800 Einträge; ohne „im Projekt“ nicht in der Projektdatei', sto.n >= 5 && sto.n2 === 800 && !sto.inFile && sto.bytes < 160000, sto);
const pj = await p.evaluate(() => { const V = SYNQUENZER.vd3; V.clear(); V.touch(); V.push({k: 'klang', t: 0, x: 'Rom-Bass'}); V.inProject(true); const ser = SYNQUENZER.serialize(); SYNQUENZER.importJSON(ser); const back = !!S.vd3mo && S.vd3mo.ev.length; V.inProject(false); const ser2 = SYNQUENZER.serialize(); return {inFile: /vd3mo/.test(ser), back, out: !/vd3mo/.test(ser2)}; });
ok('„Im Projekt“: Protokoll reist in der Projektdatei mit (Speichern → Laden), aus = wieder nicht drin', pj.inFile && pj.back === 1 && pj.out, pj);
const old = await p.evaluate(() => { const o = JSON.parse(SYNQUENZER.serialize()); delete o.project.vd3mo; SYNQUENZER.importJSON(JSON.stringify(o)); return {has: 'vd3mo' in S, bars: S.song && S.song.bars}; });
ok('Alte Projekte (ohne Protokoll) laden gleich', !old.has && old.bars > 0, old);
// Hinweis ohne Protokoll im Video-Blatt
const hint = await p.evaluate(async () => { SYNQUENZER.vd3.clear(); SYNQUENZER.vd3.prefs({mo: true}); vvOpen(); await new Promise(r => setTimeout(r, 300)); const h = document.querySelector('.vd3-h'), bs = [...document.querySelectorAll('.vd3-box .rb')].map(b => ({t: b.textContent, h: b.getBoundingClientRect().height, on: b.classList.contains('on')})); return {txt: h && h.textContent, bs}; });
ok('Video-Blatt: Zeile „Extras“ [Titel] [Untertitel-Rand] [Making-of] [Schnitt im Song] (≥ 44 px); ohne Protokoll ein Hinweis', /Noch kein Protokoll/.test(hint.txt || '') && hint.bs.length === 4 && hint.bs.every(b => b.h >= 44) && hint.bs[2].on, hint);
await p.screenshot({path: ST + '/videoblatt-hochkant.png'});
await p.evaluate(() => { vvClose(); SYNQUENZER.vd3.prefs({mo: false}); });

/* ======================= 4. Making-of: Plan + Vorlauf-Standbilder ======================= */
// ein kleines Protokoll wie beim Basteln: Klang, Regler drehen, Clips + Noten, Teile
await p.evaluate(SONG); await p.evaluate(() => new Promise(r => setTimeout(r, 30)));
const plan = await p.evaluate(() => {
  const V = SYNQUENZER.vd3, ids = S.song.marks.map(m => m.id); V.clear();
  V.push({k: 'klang', t: 0, x: 'Rom-Bass'}); V.push({k: 'regler', t: 0, p: 'cutoff', a: 380, b: 3200, v: [520, 900, 1600, 2400, 3200], d: 1700});
  V.push({k: 'regler', t: 0, p: 'res', a: .1, b: .55, v: [.2, .4, .55], d: 800});
  V.push({k: 'clip', t: 0, s: 0, n: 0}); V.push({k: 'noten', t: 0, s: 0, n: 4, n0: 0}); V.push({k: 'clip', t: DRUM_T, s: 0, n: 8});
  V.push({k: 'klang', t: 2, x: 'Rom-Fläche'}); V.push({k: 'clip', t: 2, s: 0, n: 3}); V.push({k: 'clip', t: 1, s: 0, n: 4});
  V.push({k: 'teil', id: ids[0], x: 'Intro'}); V.push({k: 'teil', id: ids[1], x: 'Strophe'}); V.push({k: 'teil', id: ids[2], x: 'Refrain'});
  return V.plan();
});
ok('Plan: geraffter Vorlauf (Intro, Klang, Regler, Clips, Teile, „und jetzt“), 8–36 s, ganze Bilder', plan && plan.sec >= 8 && plan.sec <= 36 && ['intro', 'klang', 'regler', 'clip', 'teil', 'outro'].every(k => plan.scenes.some(s => s.k === k)) && plan.frames === Math.round(plan.sec * 30), {sec: plan.sec, steps: plan.steps, scenes: plan.scenes.map(s => s.k + '@' + s.f0)});
const pics = []; const want = ['intro', 'regler', 'clip', 'teil'];
for (const k of want) { const sc = plan.scenes.find(s => s.k === k && (k !== 'clip' || s.n1 > 0)) || plan.scenes.find(s => s.k === k); const tv = (sc.f0 + (sc.f1 - sc.f0) * .62) / 30; const x = await p.evaluate(tv => SYNQUENZER.vd3.prePic(tv, '9:16'), tv); const y = await p.evaluate(tv => SYNQUENZER.vd3.prePic(tv, '9:16'), tv); save(`makingof-${k}-9x16.png`, x.png); pics.push({k, ms: x.ms, same: x.hash === y.hash, probe: x.probe, err: x.err}); }
const q16 = await p.evaluate(tv => SYNQUENZER.vd3.prePic(tv, '16:9'), (plan.scenes.find(s => s.k === 'regler').f0 + 30) / 30); save('makingof-regler-16x9.png', q16.png);
ok('Vorlauf-Standbilder: Gerät mit dem Regler im Fokus (echte Editor-Seite), Matrix, Song; deterministisch (gleiches Bild zweimal)', pics.every(x => x.same && !x.err) && pics.find(x => x.k === 'regler').probe && pics.find(x => x.k === 'regler').probe.cell && pics.find(x => x.k === 'regler').probe.page === 'filter/ctl' && !q16.err, pics);
ok('Zeichenzeit je Vorlauf-Bild < 33 ms (Bild ändert sich nicht → nicht neu gezeichnet)', pics.every(x => x.ms < 33), pics.map(x => [x.k, x.ms]));

/* ======================= 5. Echter Render mit Ton (Weg des iPhones: H.264 + PCM in MOV) ======================= */
await p.evaluate(() => SYNQUENZER.vvTest({noAE: true}));
const mk = async (o, name) => { const T0 = Date.now(); let r; try { r = await p.evaluate(o => SYNQUENZER.vvMake(o).then(x => ({dur: x.dur, songSec: x.songSec, tail: x.tail, how: x.how, ext: x.ext, vd3: x.vd3, ms: x.ms, msAudio: x.msAudio, msVideo: x.msVideo, cam: x.cam})), o); } catch (e) { return {err: String(e).slice(0, 300)}; }
  const bl = await p.evaluate(() => SYNQUENZER.vvBlob()), f = `${ST}/${name}.${bl.ext}`; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64')); return Object.assign(r, {f, wall: Date.now() - T0}); };
const R1 = await mk({fmt: '9:16', range: {a: 0, b: 8}, vd3: {mo: true, ti: true}}, 'video-makingof-9x16');
const pr = s => sh(`ffprobe -v error -show_entries stream=codec_type,duration -show_entries format=duration -of json ${s}`);
let info1 = null; try { info1 = JSON.parse(pr(R1.f)); } catch (e) { info1 = {err: String(e).slice(0, 200)}; }
const vdur = info1 && info1.streams ? +info1.streams.find(s => s.codec_type === 'video').duration : 0, adur = info1 && info1.streams ? +info1.streams.find(s => s.codec_type === 'audio').duration : 0;
ok('Video 9:16 mit Making-of-Vorlauf: Bild und Ton gleich lang = Vorlauf + Song (+ Ausklang), Weg H.264 + PCM', R1.vd3 && R1.vd3.pre > 8 && Math.abs(vdur - adur) < .06 && Math.abs(vdur - R1.dur) < .06 && Math.abs(R1.dur - (R1.vd3.pre + R1.songSec + R1.tail)) < .06, {R1: Object.assign({}, R1, {f: undefined}), vdur, adur});
const volA = sh(`ffmpeg -v info -i ${R1.f} -af "atrim=${(R1.vd3.pre * .4).toFixed(2)}:${(R1.vd3.pre * .9).toFixed(2)},volumedetect" -f null - 2>&1 | grep mean_volume || true`), volB = sh(`ffmpeg -v info -i ${R1.f} -af "atrim=${(R1.vd3.pre + 2).toFixed(2)}:${(R1.vd3.pre + 6).toFixed(2)},volumedetect" -f null - 2>&1 | grep mean_volume || true`);
const dbA = +(/mean_volume: (-?[\d.]+)/.exec(volA) || [0, -99])[1], dbB = +(/mean_volume: (-?[\d.]+)/.exec(volB) || [0, -99])[1];
ok('Ton: unter dem Vorlauf der Song gedämpft (hörbar, leiser), dann der ganze Song in voller Lautstärke', dbA > -45 && dbA < dbB - 3 && dbB > -30, {vorlauf: dbA, song: dbB});
const fr = [[1, 'titel'], [R1.vd3.pre * .35, 'vorlauf-a'], [R1.vd3.pre * .7, 'vorlauf-b'], [R1.vd3.pre + 1.2, 'song']];
for (const [t, n] of fr) { try { sh(`ffmpeg -v error -y -ss ${t.toFixed(3)} -i ${R1.f} -frames:v 1 ${ST}/video-frame-${n}.png`); } catch (e) {} }
ok('Standbilder aus dem fertigen Video (Titel, Vorlauf, Song) geschrieben', fr.every(([, n]) => fs.existsSync(`${ST}/video-frame-${n}.png`)), fr.map(x => x[1]));
const R2 = await mk({fmt: '9:16', range: {a: 0, b: 8}, vd3: {mo: true, ti: true}}, 'video-makingof-9x16-b');
const md5 = (f, m) => { try { return sh(`ffmpeg -v error -i ${f} -map 0:${m} -f md5 -`).trim(); } catch (e) { return 'x'; } };
const a1 = md5(R1.f, 'a'), a2 = md5(R2.f, 'a'), w1 = md5(R1.f, 'v'), w2 = md5(R2.f, 'v');
ok('Deterministisch: zweimal derselbe Auftrag → gleicher Ton und gleiche Bilder (dekodiert, md5)', a1 === a2 && w1 === w2 && a1 !== 'x', {a1, a2, w1, w2});
const R0 = await mk({fmt: '9:16', range: {a: 0, b: 8}, vd3: {mo: false, ti: false, rd: false}}, 'video-ohne-9x16');
ok('Ohne Making-of: kein Vorlauf, Länge = Song + Ausklang (wie bisher)', R0.vd3 && R0.vd3.pre === 0 && Math.abs(R0.dur - (R0.songSec + R0.tail)) < .01, Object.assign({}, R0, {f: undefined}));
ok('Renderzeit gemessen (Vorlauf / Ton / Bild)', R1.ms > 0, {mitMakingOf: {ms: R1.ms, wall: R1.wall, msPre: R1.vd3.msPre, msSnd: R1.vd3.msSnd, msPlan: R1.vd3.msPlan, vorlaufS: R1.vd3.pre, msAudio: R1.msAudio, msVideo: R1.msVideo}, ohne: {ms: R0.ms, msAudio: R0.msAudio, msVideo: R0.msVideo}});
// Grundstand: derselbe Ton ohne Making-of (der Render-Weg ist unverändert)
const pb2 = await open(BASE, 428, 926, false); await pb2.evaluate(SONG); await pb2.evaluate(() => SYNQUENZER.vvTest({noAE: true}));
let fb = null; try { await pb2.evaluate(() => SYNQUENZER.vvMake({fmt: '9:16', range: {a: 0, b: 8}})); const bl = await pb2.evaluate(() => SYNQUENZER.vvBlob()); fb = `${ST}/video-grundstand-9x16.${bl.ext}`; fs.writeFileSync(fb, Buffer.from(bl.b64, 'base64')); } catch (e) { fb = null; }
const a0 = md5(R0.f, 'a'), aB = fb ? md5(fb, 'a') : 'y';
ok('Ohne Making-of ist der Ton bit-gleich zum Grundstand (4.47)', a0 === aB, {a0, aB});
await pb2.close();
await p.close();

console.log('errors', JSON.stringify(errs));
ok('Keine Fehler in der Konsole', errs.length === 0, errs.slice(0, 5));
const pass = C.filter(c => c[1]).length;
console.log(`\nVD3: ${pass}/${C.length} bestanden`);
fs.writeFileSync(OUT + '/vd3-test.json', JSON.stringify({pass, total: C.length, checks: C}, null, 1));
await b.close();
