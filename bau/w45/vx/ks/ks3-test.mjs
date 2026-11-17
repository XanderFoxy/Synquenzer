// KS3 (Klangschule, Paket KS3) – Abnahme in Chromium, hochkant (390×844) und quer (844×390)
// Aufruf: node ks3-test.mjs <index.html> [fotos-ordner] [machart.json]
// Prüft: stiller Block beim Start nicht ausgewertet; Blatt mit Kapitel 6 „Werkstatt“ (W1, W2) und 19 Rezept-Karten, Antippen öffnet;
// Suche; W1/W2 Schicht für Schicht (Fingertipp „Schicht n ▶“, Kopf ◀ ▶, Rahmen auf sichtbaren Reglern, Karte verdeckt keinen Rahmen,
// Zahlen aus dem Klang, ↶ beginnt je Schicht neu, letzte Schicht = erledigt); jede Rezept-Karte lädt (Rahmen, Werte-Zeile, Prinzip,
// „Klingt billig, wenn …“, Knöpfe), ✕ bitgleich; Rechnen gegen machart.json (Werte der Hörbeispiele); Pegel: jeder Startklang auf
// −24 LUFS (±1 dB), zweite Schichten wie geplant; A/B am Master pegelgleich (±1 dB); Übernehmen jeder Karte = ein ↶, ↶ = bitgleich;
// „Lade: …“ (zweite Schicht) = ein ↶; ◎ Was ist anders? per Fingertipp und nach ✕ wie vorher; Fortschritt nicht im Projekt;
// Sonde gegen die gemessenen Zahlen des Python-Nachbaus (R16 Waah/Tock, R08 Plus/Minus, R13 Pfeifton, R06 Riser, R07 Shepard);
// keine Fehler in der Konsole.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
const file = path.resolve(process.argv[2]), fotos = process.argv[3] ? path.resolve(process.argv[3]) : null;
const MJ = process.argv[4] ? JSON.parse(fs.readFileSync(path.resolve(process.argv[4]), 'utf8')) : null;
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
let pass = 0, fail = 0; const out = [];
const ok = (c, name, info) => { if (c) pass++; else fail++; out.push((c ? 'OK   ' : 'FEHL ') + name + (info != null ? '  ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); console.log(out[out.length - 1]); };
const inter = (a, c) => a && c && a.x < c.x + c.w && a.x + a.w > c.x && a.y < c.y + c.h && a.y + a.h > c.y;
const r1 = v => (v == null ? v : Math.round(v * 10) / 10);

async function page(w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  p._errs = []; p.on('pageerror', e => p._errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && BOOT.done, null, {timeout: 180000}); await p.waitForTimeout(600);
  return p;
}
const X = (p, f, a) => p.evaluate(f, a);
async function tapVis(p, sel) {
  const hs = await p.$$(sel);
  for (const hd of hs) { const bb = await hd.boundingBox(); if (bb && bb.width > 2 && bb.height > 2) { await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); return bb; } }
  return null;
}
const SER = p => p.evaluate(() => { const o = JSON.parse(serialize()); delete o.project.ui; return JSON.stringify(o); });
const FULL = p => p.evaluate(() => serialize());
// Knopf in der Karte: erst in den sichtbaren Teil rollen (quer rollt der Inhalt der Karte), dann antippen
async function tapIn(p, sel) { await p.evaluate(sel => { const e = document.querySelector(sel); if (e) e.scrollIntoView({block: 'nearest'}); }, sel); await p.waitForTimeout(150); return tapVis(p, sel); }
async function settle(p, nr) {
  try { await p.waitForFunction(nr => { const s = SYNQUENZER.ks.x().state(); return s && s.rings.length >= nr && s.rings.every(r => r.tgt); }, nr, {timeout: 5000, polling: 100}); } catch (e) {}
  await p.waitForTimeout(250);
  return X(p, () => SYNQUENZER.ks.x().state());
}
async function open(p, id, k, nr) { await X(p, ([id, k]) => SYNQUENZER.ks.x().start(id, k), [id, k]); return settle(p, nr); }
function cardOk(s, w, h) {
  const vis = s.rings.every(r => r.tgt && r.tgt.w > 4 && r.tgt.x >= 0 && r.tgt.y >= 0 && r.tgt.x + r.tgt.w <= w + 1 && r.tgt.y + r.tgt.h <= h + 1 && Math.abs(r.rect.x - (r.tgt.x - 3)) <= 2 && Math.abs(r.rect.w - (r.tgt.w + 6)) <= 2);
  const cov = s.rings.filter(r => inter(r.rect, s.card));
  const inb = s.card && s.card.y >= 0 && s.card.y + s.card.h <= h + 1 && s.card.x >= 0 && s.card.x + s.card.w <= w + 1;
  return {vis, cov: cov.map(r => r.lb), inb};
}
const RZ = ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15', 'R16', 'R17', 'R18', 'R19'];
const ALT = {R03: 'Sirene Yelp', R05: 'Gischt', R09: 'Impact-Körper', R10: 'Rauschfahne', R11: 'Wasserblasen', R19: 'Brüllen VOKAL'};

for (const [w, h, tag] of [[390, 844, 'hochkant'], [844, 390, 'quer']]) {
  console.log('==== ' + tag + ' ' + w + '×' + h);
  const p = await page(w, h);
  const st0 = await X(p, () => ({ksx: typeof KSX !== 'undefined', css: !!document.getElementById('ks-css'), block: !!document.getElementById('sq-ks-src'), ld: SYNQUENZER.ks.loaded()}));
  ok(!st0.ksx && !st0.css && st0.block && !st0.ld.ok, tag + ' stiller Block beim Start nicht ausgewertet', st0);
  const t = await X(p, () => { const t = ui1SynthT(false); selectTrack(t); return t; });
  // Blatt über ≡ › Wo finde ich …? › Klangschule: Kapitel 6 mit W1, W2 und 19 Rezepten
  await X(p, () => openMenu('guide')); await p.waitForTimeout(500);
  await X(p, () => { const r = document.querySelector('#menu .ksrow'); if (r) r.scrollIntoView({block: 'center'}); }); await p.waitForTimeout(250);
  await tapVis(p, '#menu .ksrow button'); await p.waitForTimeout(700);
  const sh = await X(p, () => { const i = SYNQUENZER.ks.x().sheetInfo(); return i && Object.assign(i, {ch: [...UI.pop.el.querySelectorAll('h4[data-ch]')].map(x => x.textContent), h5: [...UI.pop.el.querySelectorAll('h5')].map(x => x.textContent)}); });
  const ids = sh ? sh.rows.map(r => r.k) : [];
  ok(sh && ['W1', 'W2', ...RZ].every(k => ids.includes(k)) && sh.ch.length === 6 && /Werkstatt/.test(sh.ch[5]) && /Rezepte – 19/.test(sh.h5.join()) && sh.rect.x >= 0 && sh.rect.x + sh.rect.w <= w,
    tag + ' Blatt: Kapitel 6 Werkstatt mit W1, W2 und 19 Rezept-Karten', {ch: sh && sh.ch[5], h5: sh && sh.h5, n: ids.length});
  await X(p, () => { const x = UI.pop.el.querySelector('button[data-k="R03"]'); if (x) x.scrollIntoView({block: 'center'}); }); await p.waitForTimeout(300);
  if (fotos) await p.screenshot({path: fotos + '/ks3-blatt-' + tag + '.png'});
  await tapVis(p, '.pop button[data-k="R03"]'); await p.waitForTimeout(900);
  const sR = await settle(p, 2);
  ok(sR && sR.id === 'R03' && sR.kind === 'r' && /^Rezept 3\/19$/.test(sR.hd) && sR.sound === 'Schule: Sirene', tag + ' Antippen „Sirene“ im Blatt öffnet die Rezept-Karte', sR && {id: sR.id, hd: sR.hd, s: sR.sound});
  await X(p, () => SYNQUENZER.ks.x().close()); await p.waitForTimeout(300);
  // Suche
  const se = await X(p, () => Object.fromEntries([['Hubschrauber', 'ks-r01'], ['Aufreißen', 'ks-w1'], ['Monster-Swell', 'ks-w2'], ['Downlifter', 'ks-r08'], ['Sirene', 'ks-r03'], ['Wind', 'ks-r04'], ['Riser', 'ks-r06']]
    .map(([q, id]) => [q, ui1Search(q).slice(0, 4).map(e => e.id).includes(id)])));
  ok(Object.values(se).every(Boolean), tag + ' Suche findet Werkstatt und Rezepte', se);
  await X(p, () => ui1Jump('ks-w2')); await p.waitForTimeout(900);
  ok(await X(p, () => !!(KS_L && KS_L.les.id === 'W2' && KS_L.k === 0)), tag + ' Sprung aus der Suche öffnet die Werkstatt „Monster-Swell“');
  await X(p, () => SYNQUENZER.ks.x().close()); await p.waitForTimeout(300);

  const pre = await SER(p), preF = await FULL(p);
  // Werkstatt: Schicht für Schicht
  for (const id of ['W1', 'W2']) {
    let s = await open(p, id, 0, 2);
    for (let k = 0; k < 4; k++) {
      const c = cardOk(s, w, h);
      ok(s.id === id && s.k === k && s.hd === 'Werkstatt · Schicht ' + (k + 1) + '/4' && /^Schule: /.test(s.sound) && s.rings.length >= 2 && c.vis, tag + ' ' + id + ' Schicht ' + (k + 1) + ' lädt, ' + s.rings.length + ' Rahmen auf sichtbaren Zielen', s.rings.map(r => r.lb + (r.tgt ? '' : ' (fehlt)')));
      ok(!c.cov.length && c.inb, tag + ' ' + id + ' Schicht ' + (k + 1) + ' Karte im Bild, verdeckt keinen Rahmen', {card: s.card, cov: c.cov});
      ok(s.info && /\d/.test(s.msg) && /^Warum:/.test(s.tip) && s.undo === s.u0 && s.acts.some(a => a.startsWith('wia:')) && (k === 3 || s.acts.includes('lay:Schicht ' + (k + 2) + ' ▶')), tag + ' ' + id + ' Schicht ' + (k + 1) + ': Zahlen, Warum, Knöpfe, ↶ beginnt neu', {msg: s.msg, acts: s.acts});
      if (fotos && (k === 0 || k === 2)) await p.screenshot({path: fotos + '/ks3-' + id + '-s' + (k + 1) + '-' + tag + '.png'});
      if (k === 3) break;
      if (k === 0) await tapIn(p, '.kscard .ksfb button[data-a="lay"]');         // Fingertipp „Schicht 2 ▶“
      else if (k === 1) await tapVis(p, '.kscard .ksh button[data-a="next"]');   // Fingertipp Kopf ▶
      else await X(p, () => SYNQUENZER.ks.x().act('lay'));
      await p.waitForTimeout(500); s = await settle(p, 2);
    }
    await tapVis(p, '.kscard .ksh button[data-a="prev"]'); await p.waitForTimeout(500);
    const sb = await X(p, () => SYNQUENZER.ks.x().state());
    ok(sb.id === id && sb.k === 2, tag + ' ' + id + ' Kopf ◀ geht eine Schicht zurück', {k: sb.k});
    ok(await X(p, id => !!(uiPrefs().ks && uiPrefs().ks.d && uiPrefs().ks.d[id]), id), tag + ' ' + id + ' letzte Schicht erreicht = erledigt (Geräte-Einstellung)');
  }
  // Rezept-Karten
  for (let i = 0; i < RZ.length; i++) {
    const id = RZ[i], s = await open(p, id, 0, 2), c = cardOk(s, w, h);
    ok(s.id === id && s.kind === 'r' && s.hd === 'Rezept ' + (i + 1) + '/19' && /^Schule: /.test(s.sound) && s.rings.length >= 2 && c.vis, tag + ' ' + id + ' lädt, ' + s.rings.length + ' Rahmen auf sichtbaren Zielen', s.rings.map(r => r.lb + (r.tgt ? '' : ' (fehlt)')));
    ok(!c.cov.length && c.inb, tag + ' ' + id + ' Karte im Bild, verdeckt keinen Rahmen', {card: s.card, cov: c.cov});
    const acts = s.acts.map(a => a.split(':')[0]).join(',');
    ok(/^Werte: /.test(s.msg) && /Prinzip:.*Klingt billig, wenn/.test(s.tip) && acts === (ALT[id] ? 'wia,ld,me,take' : 'wia,me,take'), tag + ' ' + id + ' Werte, Prinzip, „Klingt billig, wenn …“, Knöpfe', {msg: s.msg.slice(0, 90), acts});
    if (fotos && ['R01', 'R05', 'R12', 'R19'].includes(id)) await p.screenshot({path: fotos + '/ks3-' + id + '-' + tag + '.png'});
  }
  // ◎ Was ist anders? per Fingertipp (Punkte an den Reglern), danach ✕: wie vorher
  await open(p, 'R16', 0, 2);
  const wb = await tapIn(p, '.kscard .ksact button[data-a="wia"]'); await p.waitForTimeout(400);
  const wi = await X(p, () => ({on: !!UI.wia, dots: EL.synthSheet.querySelectorAll('.sh-body .diff').length, cls: document.querySelector('.kscard .ksact button[data-a="wia"]').classList.contains('on')}));
  ok(wb && wi.on && wi.dots > 0 && wi.cls, tag + ' ◎ Was ist anders? per Fingertipp: Punkte an ' + wi.dots + ' Reglern', wi);
  await tapVis(p, '.kscard .ksh button[data-a="x"]'); await p.waitForTimeout(400);
  ok(await X(p, () => !UI.wia && !KS_L), tag + ' ✕ per Fingertipp: Lektion zu, „Was ist anders?“ wieder aus');
  const post = await SER(p), postF = await FULL(p);
  ok(pre === post, tag + ' nach W1, W2, 19 Rezepten und ✕: Projekt bitgleich', pre === post ? null : 'Länge ' + pre.length + ' / ' + post.length);
  ok(preF === postF, tag + ' … auch mit Ansicht (ui)', preF === postF ? null : 'ui anders');

  if (tag === 'hochkant') {
    // Rechnen gegen machart.json (Kurven der Hörbeispiele, alle 20 ms)
    if (MJ) {
      const at = (K, key, t) => { const i = K.t.findIndex(x => x >= t - 1e-6); return K[key][Math.max(0, i)]; };
      const ca = await X(p, () => SYNQUENZER.ks.x().calcOf('W1', 0, [0, 1, 1.5, 1.75, 1.98]));
      const da = [0, 1, 1.5, 1.75, 1.98].map(t => at(MJ.kurve_aufreissen, 'cut', t));
      const dOct = ca.map((c, i) => Math.abs(Math.log2(c.hz / da[i])));
      ok(dOct.every(d => d <= .35), 'W1 Rechnen: Cutoff 100 Hz → 4,85 kHz spät öffnend wie das Hörbeispiel (±0,35 Okt.)', {app: ca.map(c => Math.round(c.hz)), demo: da.map(Math.round), okt: dOct.map(d => +d.toFixed(2))});
      const cv = await X(p, () => SYNQUENZER.ks.x().calcOf('W1', 2, [.002, 1.98]));
      const amp0 = at(MJ.kurve_aufreissen, 'amp', 0), amp1 = at(MJ.kurve_aufreissen, 'amp', 1.98), dd = 20 * Math.log10(amp1 / amp0);
      ok(Math.abs((cv[1].db - cv[0].db) - dd) <= 1.5, 'W1 Rechnen: Lautstärke wächst über den Takt wie im Hörbeispiel (±1,5 dB)', {app: r1(cv[1].db - cv[0].db), demo: r1(dd)});
      const cs = await X(p, () => SYNQUENZER.ks.x().calcOf('W2', 2, [0, 1.1, 2.08]));
      const ds = [0, 1.1, 2.08].map(t => at(MJ.kurve_swell, 'semis', t)), as = cs.map(c => c.st - 3);
      ok(as.every((v, i) => Math.abs(v - ds[i]) <= 1), 'W2 Rechnen: Tonhöhenbogen −3 → +1 → −1,8 HT wie das Hörbeispiel (±1 HT)', {app: as.map(r1), demo: ds.map(r1)});
      const cw = await X(p, () => SYNQUENZER.ks.x().calcOf('W2', 1, [0, 1.7]));
      const vw = await X(p, hz => hz.map(f => 'aeiou'[Math.max(0, Math.min(4, Math.round((69 + 12 * Math.log2(f / 440) - (69 + 12 * Math.log2(632.4555 / 440) - 36)) / 18)))]), cw.map(c => c.hz));
      ok(vw.join('') === 'ua', 'W2 Rechnen: VOKAL von u (0 s) nach a (1,7 s), wie die Formanten u → a im Hörbeispiel', {vok: vw, hz: cw.map(c => Math.round(c.hz))});
    }
    // Pegel: jeder Startklang −24 LUFS (±1 dB), zweite Schichten wie geplant (offline, dasselbe Worklet, Phrase der Karte)
    const lv = await X(p, async RZ => { const A = SYNQUENZER.ks.x(), r = {};
      for (const [id, n] of [['W1', 4], ['W2', 4]]) for (let k = 0; k < n; k++) r[id + '/' + (k + 1)] = await A.lvl(id, k);
      const m3 = async (id, w) => { let s = 0; for (let i = 0; i < 3; i++) s += await A.lvl(id, 0, w); return s / 3; };   // S&H ist Zufall: Mittel aus 3 Läufen
      for (const id of RZ) r[id] = ['R11', 'R12'].includes(id) ? await m3(id) : await A.lvl(id, 0);
      for (const id of ['R03', 'R05', 'R09', 'R10', 'R11', 'R19']) r[id + ' alt'] = id === 'R11' ? await m3(id, 'alt') : await A.lvl(id, 0, 'alt');
      return r; }, RZ);
    const bad = Object.entries(lv).filter(([k, v]) => !/alt/.test(k) && Math.abs(v + 24) > 1);
    ok(!bad.length, 'Pegel: alle 8 Schichten und 19 Startklänge bei −24 LUFS (±1 dB)', bad.length ? bad : {min: r1(Math.min(...Object.values(lv))), max: r1(Math.max(...Object.entries(lv).filter(([k]) => !/alt/.test(k)).map(e => e[1])))});
    const want = {'R03 alt': -24, 'R05 alt': -31, 'R09 alt': -25.8, 'R10 alt': -24, 'R11 alt': -24, 'R19 alt': -24};   // KS4: R09 Impact-Körper trägt den Knall (FILTER 2): Körper −3 + Knall −8 dB = −1,8 dB unter dem Sub
    const ba = Object.entries(want).filter(([k, v]) => Math.abs(lv[k] - v) > 1);
    ok(!ba.length, 'Pegel: zweite Schichten (Gischt 7 dB unter dem Körper, Impact-Körper mit Knall 1,8 dB unter dem Sub, sonst gleich laut)', Object.fromEntries(Object.keys(want).map(k => [k, r1(lv[k])])));

    await p.waitForFunction(() => { ensureAudio(); return typeof SynthHost !== 'undefined' && SynthHost.state === 'ready' && AU.ctx && AU.ctx.state === 'running'; }, null, {timeout: 60000});
    // A/B am Master pegelgleich (±1 dB) – Karten ohne Unterschied in Hall/Echo; die mit (R15, W1/4) nur berichtet
    const ab = {};
    for (const [id, k, sec, strict] of [['W1', 0, 4.4, 1], ['W2', 0, 5, 1], ['R01', 0, 4.4, 1], ['R02', 0, 2.6, 1], ['R08', 0, 4.4, 1], ['R12', 0, 4.2, 1], ['R16', 0, 2.8, 1], ['R18', 0, 2.6, 1], ['R15', 0, 2.6, 0], ['W1', 3, 4.4, 0], ['W2', 3, 5, 0]]) {
      await open(p, id, k, 1);
      const m = {};
      for (const wch of ['a', 'b']) { const r = await X(p, async ([wch, sec]) => { const A = SYNQUENZER.ks.x(); await A.gains(); const cap = A.capture(sec); await A.hear(wch); return await cap; }, [wch, sec]); m[wch] = r && r.lu; await p.waitForTimeout(400); }
      ab[id + '/' + (k + 1)] = {a: r1(m.a), b: r1(m.b), d: r1(Math.abs(m.a - m.b)), strict};
    }
    const abBad = Object.entries(ab).filter(([, v]) => v.strict && !(v.d <= 1));
    ok(!abBad.length, 'A/B am Master pegelgleich (±1 dB) für 8 Karten ohne Hall/Echo-Unterschied', ab);
    const abFx = Object.entries(ab).filter(([, v]) => !v.strict && !(v.d <= 1.5));
    ok(!abFx.length, 'A/B am Master mit Hall/Drive-Unterschied (R15, W1/W2 Schicht 4): höchstens 1,5 dB (Drive wird nachgerechnet, die Hall-Fahne nicht)', Object.fromEntries(Object.entries(ab).filter(([, v]) => !v.strict)));
    // Fortschritt: „Richtig“ gehört = Rezept erledigt
    await open(p, 'R17', 0, 1); await X(p, async () => { await SYNQUENZER.ks.x().hear('b'); }); await p.waitForTimeout(300);
    const pr = await X(p, () => ({d: Object.keys((uiPrefs().ks || {}).d || {}), chip: SYNQUENZER.ks.x().state().msg && document.querySelector('.kscard .kss').textContent, inProj: /"ks"|Klangschule|Schule: /.test(serialize())}));
    ok(pr.d.includes('R17') && pr.chip === '✓' && !pr.inProj, '„Richtig“ gehört = Rezept erledigt (✓), Fortschritt nicht im Projekt', pr);
    await X(p, () => SYNQUENZER.ks.x().stop()); await X(p, () => SYNQUENZER.ks.x().close()); await p.waitForTimeout(300);

    // Übernehmen: jede Karte = genau ein ↶ mit ihrem Namen; ↶ danach = Projekt bitgleich
    const tk = [];
    for (const id of RZ.concat(['W1'])) {
      const s0 = await SER(p), u0 = await X(p, () => UNDO.length);
      await open(p, id, id === 'W1' ? 3 : 0, 1);
      const r = await X(p, t => { const A = SYNQUENZER.ks.x(), nm = A.state().sound; A.take(t); return {nm, u: UNDO.length, top: UNDO[UNDO.length - 1].label, name: S.tracks[t].sound.name, open: !!KS_L}; }, t);
      await X(p, () => undo()); await p.waitForTimeout(150);
      const s1 = await SER(p);
      tk.push({id, ok: r.u === u0 + 1 && !r.open && r.name === r.nm && r.top === 'Klangschule: ' + r.nm.slice(8) && s1 === s0, name: r.name, top: r.top});
    }
    const tkBad = tk.filter(x => !x.ok);
    ok(!tkBad.length, 'Übernehmen: 19 Rezepte + Werkstatt = je genau ein ↶ mit dem Namen der Karte, ↶ = bitgleich', tkBad.length ? tkBad : tk.slice(0, 3).map(x => x.name + ' / ' + x.top));
    // zweite Schicht laden (Fingertipp „Lade: Gischt“) = ein ↶; übernehmen trägt ihren Namen; noch einmal = wieder der Körper
    {
      const s0 = await SER(p), u0 = await X(p, () => UNDO.length);
      await open(p, 'R05', 0, 1);
      const lb = await tapIn(p, '.kscard .ksact button[data-a="ld"]'); await p.waitForTimeout(500);
      const a1 = await X(p, () => { const s = SYNQUENZER.ks.x().state(); return {snd: s.sound, top: s.top, u: s.undo, u0: s.u0, alt: s.alt, acts: s.acts, ft: S.tracks[KS_L.t].sound.p.ftype}; });
      ok(lb && a1.snd === 'Schule: Gischt' && a1.alt && a1.u === a1.u0 + 1 && a1.top === 'Klangschule: Gischt' && a1.ft === 5 && a1.acts.includes('ld:Lade: Meer'), 'Fingertipp „Lade: Gischt“: zweite Schicht (HP12) als ein ↶, Knopf zeigt „Lade: Meer“', a1);
      await X(p, () => SYNQUENZER.ks.x().act('ld')); await p.waitForTimeout(300);
      const a2 = await X(p, () => SYNQUENZER.ks.x().state());
      ok(a2.sound === 'Schule: Meer' && !a2.alt, 'noch einmal „Lade: Meer“ = wieder der Körper', {snd: a2.sound});
      await X(p, () => SYNQUENZER.ks.x().act('ld')); await p.waitForTimeout(200);
      const a3 = await X(p, t => { SYNQUENZER.ks.x().take(t); return {name: S.tracks[t].sound.name, top: UNDO[UNDO.length - 1].label, u: UNDO.length}; }, t);
      ok(a3.name === 'Schule: Gischt' && a3.top === 'Klangschule: Gischt' && a3.u === u0 + 1, 'Übernehmen mit geladener Gischt: Name „Schule: Gischt“, ein ↶', a3);
      await X(p, () => undo()); await p.waitForTimeout(150);
      ok(await SER(p) === s0, '↶ danach: Projekt bitgleich');
    }
    // Sonde gegen den Python-Nachbau (REZEPTBUCH „Gemessen“, werkzeug/messen_rezepte.py): gleiche Messung – Schwerpunkt des Betragsspektrums,
    // Fenster ab t (Hann, L s), Spitze des Betragsspektrums; der Klang offline aus der App (dasselbe Worklet, trocken, ohne Hall/Echo)
    const so = await X(p, async () => {
      const A = SYNQUENZER.ks.x();
      const fft = (re, im) => { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bt = n >> 1; for (; j & bt; bt >>= 1) j ^= bt; j ^= bt; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
        for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a), hl = len >> 1; for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < hl; k++) { const u = i + k, v = u + hl, tr = re[v] * cr - im[v] * ci, ti = re[v] * ci + im[v] * cr; re[v] = re[u] - tr; im[v] = im[u] - ti; re[u] += tr; im[u] += ti; const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr; } } } };
      const mag = (R, t, L, N) => { const n = Math.round(L * R.sr), s = R.off + Math.round(t * R.sr); while (N < n) N *= 2; const re = new Float64Array(N), im = new Float64Array(N);
        for (let i = 0; i < n && s + i < R.x.length; i++) re[i] = R.x[s + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / (n - 1))); fft(re, im); const M = new Float64Array(N / 2 + 1); for (let k = 0; k <= N / 2; k++) M[k] = Math.hypot(re[k], im[k]); return {M, df: R.sr / N}; };
      const cent = (R, t, L) => { const {M, df} = mag(R, t, L, 8192); let a = 0, b = 0; for (let k = 0; k < M.length; k++) { a += k * df * M[k]; b += M[k]; } return b > 0 ? Math.round(a / b) : null; };
      const peak = (R, t, L, f0, f1) => { const {M, df} = mag(R, t, L, 65536); let kb = Math.ceil(f0 / df); for (let k = kb; k * df < f1; k++) if (M[k] > M[kb]) kb = k; return Math.round(kb * df); };
      const o = {};
      const wa = await A.rsnd('R16', 0, 0), to = await A.rsnd('R16', 0, null);   // 5. Ton (E4) bei 1,0 s, wie im Python-Beispiel
      o.r16 = {waah: [.01, .08, .2].map(d => cent(wa, 1 + d, .03)), tock: [.01, .08, .2].map(d => cent(to, 1 + d, .03))};
      const pl = await A.rsnd('R08', 0, null, 4), mi = await A.rsnd('R08', 0, 0, 4);
      o.r08 = {plus: [.05, .8, 2].map(t => cent(pl, t, .1)), minus: [.1, 2.4, 3].map(t => cent(mi, t, .1))};
      const pf = await A.rsnd('R13', 0, 0, 5.4);
      o.r13 = [.6, 2, 3.5, 4.9].map(t => peak(pf, t, .08, 100, 6000));
      const ri = await A.rsnd('R06', 0, null), L = ri.ph[0][1];
      o.r06 = {L: +L.toFixed(2), c: [.5, 2, 4, 5.5].map(t => cent(ri, t / 5.75 * L, .1))};
      const sp = await A.rsnd('R07', 0, null, 6.2);
      o.r07 = [.6, 1.6, 2.6, 3.6, 4.6, 5.6].map(t => cent(sp, t, .2));
      return o;
    });
    const q = (a, b) => Math.abs(Math.log2(a / b));
    const r16 = so.r16, p16 = {waah: [2065, 1445, 624], tock: [747, 385, 405]};
    ok(r16.tock[1] < r16.waah[1] / 2 && q(r16.waah[1], p16.waah[1]) <= .6 && q(r16.tock[1], p16.tock[1]) <= .6, 'Sonde R16: 80 ms nach dem Ton ist „Tock“ dunkel, „Waah“ noch hell – wie im Python-Nachbau (±0,6 Okt.)', {app: r16, py: p16});
    const p08 = {plus: [2046, 1060, 877], minus: [3245, 413, 1423]};
    ok(so.r08.plus[2] < so.r08.plus[0] / 1.5 && so.r08.minus[2] > so.r08.minus[1] * 1.5, 'Sonde R08: Plus fällt beim Halten, Minus geht im Release wieder auf – wie im Python-Nachbau', {app: so.r08, py: p08});
    const py13 = [384, 795, 1700, 2200], d13 = so.r13.map((f, i) => 12 * Math.log2(f / py13[i]));
    ok(d13.every(d => Math.abs(d) <= 2.5), 'Sonde R13: Pfeifton steigt 3 Oktaven wie im Python-Nachbau (±2,5 HT)', {app: so.r13, py: py13, ht: d13.map(r1)});
    ok(Math.log2(so.r06.c[3] / so.r06.c[0]) >= 1.5, 'Sonde R06: Schwerpunkt des Risers steigt ≥ 1,5 Oktaven (Python 1,3 → 2,5 → 5,0 → 7,7 kHz)', so.r06);
    ok(Math.max(...so.r07) / Math.min(...so.r07) <= 1.5, 'Sonde R07: Schwerpunkt bleibt stehen, während die Töne steigen (Python 770–820 Hz)', so.r07);
  }
  ok(!p._errs.length, tag + ' keine Fehler in der Konsole', p._errs.slice(0, 5));
  await p.close();
}
await b.close();
console.log('\n' + pass + '/' + (pass + fail) + ' bestanden');
fs.writeFileSync(path.join(path.dirname(file), 'ks3-test.out'), out.join('\n') + '\n\n' + pass + '/' + (pass + fail) + ' bestanden\n');
process.exit(fail ? 1 : 0);
