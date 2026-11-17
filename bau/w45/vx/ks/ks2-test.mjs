// KS2 (Klangschule, Paket KS2) – Abnahme in Chromium, hochkant (390×844) und quer (844×390)
// Aufruf: node ks2-test.mjs <index.html> [fotos-ordner] [hoeren-ordner] [sonde-ordner]
// Prüft: stiller Block beim Start nicht ausgewertet; Blatt mit 10 Lektionen in 5 Kapiteln; ⋯ „zu dieser Seite“ (FILTER → 2–4, LFO → 5);
// Suche; L5–L10 (+ Bonus): lädt, Rahmen auf sichtbaren Reglern/Reitern, Karte verdeckt keinen Rahmen, Startklang ✗, Lösung ✓ (L6–L8 erst
// nach dem Messen); Messen per Fingertipp (2 s am Spur-Ausgang, danach abgeklemmt, gilt nur für den gemessenen Klang, bei laufendem Song
// ohne Ton), live = offline, misslungene Messung zählt als Versuch, „Zeig es mir“ misst gleich mit; E1 (Scope meldet den echten Cutoff,
// Punkt auf der Kurve, Modulation inklusive, ohne Scope keine Meldung); Treppe L10; Riser im Tempo; A/B am Master pegelgleich (±1 dB);
// Übernehmen mit Mod-Routen = ein ↶; ✕ bitgleich; Fortschritt; Sonde gegen den Python-Nachbau (L6, L7, L8); keine Fehler in der Konsole.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
const file = path.resolve(process.argv[2]), fotos = process.argv[3] ? path.resolve(process.argv[3]) : null;
const HOER = process.argv[4] ? path.resolve(process.argv[4]) : null, SONDE = process.argv[5] ? path.resolve(process.argv[5]) : null;
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
  for (const h of hs) { const bb = await h.boundingBox(); if (bb && bb.width > 2 && bb.height > 2) { await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); return bb; } }
  return null;
}
const SER = p => p.evaluate(() => { const o = JSON.parse(serialize()); delete o.project.ui; return JSON.stringify(o); });
const FULL = p => p.evaluate(() => serialize());
// eine Aufgabe öffnen und warten, bis die Rahmen stehen (Takt 200 ms, beim ersten Öffnen baut der Klang-Editor)
async function open(p, id, k, nr) {
  await X(p, ([id, k]) => SYNQUENZER.ks.x().start(id, k), [id, k]);
  try { await p.waitForFunction(nr => { const s = SYNQUENZER.ks.x().state(); return s && s.rings.length >= nr && s.rings.every(r => r.tgt); }, nr, {timeout: 5000, polling: 100}); } catch (e) {}
  await p.waitForTimeout(250);
  return X(p, () => SYNQUENZER.ks.x().state());
}
const LESS = [['L5', 0, 2], ['L5', 1, 2], ['L6', 0, 2], ['L7', 0, 1], ['L8', 0, 2], ['L8', 1, 2], ['L9', 0, 2], ['L9', 1, 2], ['L10', 0, 2], ['L10', 1, 2]];

for (const [w, h, tag] of [[390, 844, 'hochkant'], [844, 390, 'quer']]) {
  console.log('==== ' + tag + ' ' + w + '×' + h);
  const p = await page(w, h);
  const st0 = await X(p, () => ({ksx: typeof KSX !== 'undefined', css: !!document.getElementById('ks-css'), block: !!document.getElementById('sq-ks-src'), ld: SYNQUENZER.ks.loaded()}));
  ok(!st0.ksx && !st0.css && st0.block && !st0.ld.ok, tag + ' stiller Block beim Start nicht ausgewertet', st0);
  const t = await X(p, () => { const t = ui1SynthT(false); selectTrack(t); return t; });
  // Blatt: 10 Lektionen in 5 Kapiteln (Zugang ≡ › Wo finde ich …? › Klangschule)
  await X(p, () => openMenu('guide')); await p.waitForTimeout(500);
  await X(p, () => { const r = document.querySelector('#menu .ksrow'); if (r) r.scrollIntoView({block: 'center'}); }); await p.waitForTimeout(250);
  await tapVis(p, '#menu .ksrow button'); await p.waitForTimeout(700);
  const sh = await X(p, () => { const i = SYNQUENZER.ks.x().sheetInfo(); return i && Object.assign(i, {ch: [...UI.pop.el.querySelectorAll('h4[data-ch]')].map(h => h.textContent)}); });
  const ids = sh ? sh.rows.map(r => r.k) : [];
  ok(sh && ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'].every(k => ids.includes(k)) && sh.ch.length === 5 && sh.rect.x >= 0 && sh.rect.x + sh.rect.w <= w, tag + ' Blatt: 10 Lektionen in 5 Kapiteln', sh && sh.ch);
  if (fotos) await p.screenshot({path: fotos + '/ks2-blatt-' + tag + '.png'});
  await X(p, () => closePop()); await p.waitForTimeout(200);
  // ⋯ „Klangschule zu dieser Seite“: FILTER → Kapitel 2–4, LFO → Kapitel 5
  for (const [tab, sub, want, not] of [['filter', 'ctl', ['L3', 'L4', 'L5', 'L6', 'L7', 'L8'], ['L1', 'L9']], ['lfo', 'l1', ['L9', 'L10'], ['L1', 'L5']]]) {
    await X(p, ([t, tab, sub]) => { selectTrack(t); ED.tab = tab; ED.sub[tab] = sub; openEditor(); }, [t, tab, sub]); await p.waitForTimeout(500);
    await tapVis(p, '#synthSheet button.edm'); await p.waitForTimeout(400);
    await tapVis(p, '.pop button[data-a="ks"]'); await p.waitForTimeout(700);
    const s2 = await X(p, () => SYNQUENZER.ks.x().sheetInfo());
    const foc = s2 ? s2.rows.filter(r => r.foc).map(r => r.k) : [];
    ok(want.every(k => foc.includes(k)) && !not.some(k => foc.includes(k)), tag + ' ⋯ auf ' + tab.toUpperCase() + ' zeigt die passenden Kapitel', foc.join(' '));
    await X(p, () => closePop()); await p.waitForTimeout(200);
  }
  // Suche
  const se = await X(p, () => Object.fromEntries([['Eigenschwingung', 'ks-l7'], ['S&H Treppe', 'ks-l10'], ['sample hold', 'ks-l10'], ['Laser', 'ks-l9'], ['nass', 'ks-l6'], ['Flöte', 'ks-l8'], ['Pluck', 'ks-l5']].map(([q, id]) => [q, ui1Search(q).slice(0, 3).map(e => e.id).includes(id)])));
  ok(Object.values(se).every(Boolean), tag + ' Suche findet L5–L10', se);
  await X(p, () => ui1Jump('ks-l7')); await p.waitForTimeout(900);
  ok(await X(p, () => !!(KS_L && KS_L.les.id === 'L7')), tag + ' Sprung aus der Suche öffnet Lektion 7');
  await X(p, () => SYNQUENZER.ks.x().close()); await p.waitForTimeout(300);
  const meas = await X(p, () => ['L5', 'L6', 'L7', 'L8', 'L9', 'L10'].map(id => id + ':' + SYNQUENZER.ks.x().check(id).map(r => (r.meas ? 'M' : '-')).join('')).join(' '));
  ok(meas === 'L5:-- L6:M L7:M L8:MM L9:-- L10:--', tag + ' Messen nur in L6–L8 (+ L8 Bonus)', meas);

  // jede Aufgabe: lädt, Rahmen, Karte, Start ✗, Lösung ✓ (mit Messung, wo nötig)
  const pre = await SER(p), preF = await FULL(p);
  for (const [id, k, nr] of LESS) {
    const nm = id + (k ? ' Bonus' : '');
    const s = await open(p, id, k, nr);
    const vis = s.rings.every(r => r.tgt && r.tgt.w > 4 && r.tgt.x >= 0 && r.tgt.y >= 0 && r.tgt.x + r.tgt.w <= w + 1 && r.tgt.y + r.tgt.h <= h + 1 && Math.abs(r.rect.x - (r.tgt.x - 3)) <= 2 && Math.abs(r.rect.w - (r.tgt.w + 6)) <= 2);
    ok(s.id === id && s.k === k && /^Schule: /.test(s.sound) && s.rings.length >= nr && vis, tag + ' ' + nm + ' lädt, ' + s.rings.length + ' Rahmen auf sichtbaren Zielen', s.rings.map(r => r.lb + (r.tgt ? '' : ' (fehlt)')));
    const cov = s.rings.filter(r => inter(r.rect, s.card));
    ok(!cov.length && s.card.y >= 0 && s.card.y + s.card.h <= h + 1 && s.card.x >= 0 && s.card.x + s.card.w <= w + 1, tag + ' ' + nm + ' Karte im Bild, verdeckt keinen Rahmen', {card: s.card, cov: cov.map(r => r.lb)});
    let s0 = s;
    if (s.pend) s0 = await X(p, async () => { await SYNQUENZER.ks.x().meas('off'); return SYNQUENZER.ks.x().state(); });
    ok(!s0.ok, tag + ' ' + nm + ' Startklang ✗' + (s.pend ? ' (gemessen)' : ''), s0.msg);
    if (!s.pend && s.meas == null) { const mb = await X(p, () => !!document.querySelector('.kscard .ksfb button[data-a="meas"]')); if (nm.startsWith('L6') || nm.startsWith('L7') || nm.startsWith('L8')) ok(!mb, tag + ' ' + nm + ' Rechnung passt nicht → noch kein ▶ Prüfen'); }
    if (fotos) await p.screenshot({path: fotos + '/ks2-' + id + (k ? 'b' : '') + '-' + tag + '.png'});
    let s1 = await X(p, () => SYNQUENZER.ks.x().sol());
    if (s1.pend) {
      ok(/▶ Prüfen/.test(s1.msg) && await X(p, () => !!document.querySelector('.kscard .ksfb button[data-a="meas"]')), tag + ' ' + nm + ' Rechnung passt → Knopf ▶ Prüfen', s1.msg);
      s1 = await X(p, async () => { await SYNQUENZER.ks.x().meas('off'); return SYNQUENZER.ks.x().state(); });
    }
    ok(s1.ok && /^✓/.test(s1.msg), tag + ' ' + nm + ' Lösung ✓', s1.msg);
    if (fotos && s1.meas) await p.screenshot({path: fotos + '/ks2-' + id + (k ? 'b' : '') + '-gemessen-' + tag + '.png'});
  }
  await X(p, () => SYNQUENZER.ks.x().close()); await p.waitForTimeout(300);
  const post = await SER(p), postF = await FULL(p);
  ok(pre === post, tag + ' nach L5–L10 (+ Bonus) und ✕: Projekt bitgleich', pre === post ? null : 'Länge ' + pre.length + ' / ' + post.length);
  ok(preF === postF, tag + ' … auch mit Ansicht (ui)', preF === postF ? null : 'ui anders');
  const pr = await X(p, () => ({d: Object.keys((uiPrefs().ks || {}).d || {}), inProj: /"ks"|Klangschule/.test(serialize())}));
  ok(['L5', 'L6', 'L7', 'L8', 'L9', 'L10'].every(k => pr.d.includes(k)) && !pr.inProj, tag + ' Fortschritt L5–L10 in den Geräte-Einstellungen, nicht im Projekt', pr.d);

  if (tag === 'hochkant') {
    await p.waitForFunction(() => { ensureAudio(); return typeof SynthHost !== 'undefined' && SynthHost.state === 'ready' && AU.ctx && AU.ctx.state === 'running'; }, null, {timeout: 60000});
    // Messen per Fingertipp: 2 s am Spur-Ausgang (Mitschnitt-Prozessor), danach abgeklemmt
    await X(p, () => { const O = window.AudioWorkletNode; window.__O = O; window.__caps = [];
      const W = function (c, n, o) { const x = new O(c, n, o); if (n === 'synq-mx3-cap') window.__caps.push({x, con: 0}); return x; }; W.prototype = O.prototype; window.AudioWorkletNode = W;
      const oc = AudioNode.prototype.connect, od = AudioNode.prototype.disconnect; window.__oc = oc; window.__od = od;
      AudioNode.prototype.connect = function (d, ...a) { const q = window.__caps.find(q => q.x === d); if (q) q.con++; return oc.call(this, d, ...a); };
      AudioNode.prototype.disconnect = function (d, ...a) { const q = d && window.__caps.find(q => q.x === d); if (q) q.con--; return od.call(this, d, ...a); }; });
    await open(p, 'L6', 0, 2); await X(p, () => SYNQUENZER.ks.x().sol()); await p.waitForTimeout(300);
    const t0 = Date.now(), bb = await tapVis(p, '.kscard .ksfb button[data-a="meas"]');
    await p.waitForTimeout(300);
    const busy = await X(p, () => SYNQUENZER.ks.x().state().hearTxt);
    await p.waitForFunction(() => { const s = SYNQUENZER.ks.x().state(); return !s.mBusy && s.meas; }, null, {timeout: 20000});
    const ms = Date.now() - t0, m1 = await X(p, () => ({s: SYNQUENZER.ks.x().state(), caps: window.__caps.map(q => q.con)}));
    ok(bb && bb.y + bb.height <= h && m1.s.ok && m1.s.meas.how === 'live' && m1.s.mode === 'spec', '▶ Prüfen per Fingertipp: L6 gemessen am Spur-Ausgang ✓, Graph zeigt die Bänder', {msg: m1.s.msg, how: m1.s.meas.how, ms});
    ok(/misst 2 s am Spur-Ausgang/.test(busy) && ms < 6000, 'Messung dauert etwa 2,5 s, die Vorhör-Zeile sagt es', {busy, ms});
    ok(m1.caps.length === 1 && m1.caps[0] === 0, 'Mitschnitt-Prozessor danach abgeklemmt (1 angelegt, 0 Verbindungen)', m1.caps);
    if (fotos) await p.screenshot({path: fotos + '/ks2-L6-messen-hochkant.png'});
    await X(p, () => { window.AudioWorkletNode = window.__O; AudioNode.prototype.connect = window.__oc; AudioNode.prototype.disconnect = window.__od; });
    const ch = await X(p, () => SYNQUENZER.ks.x().set('cutoff', 1500));
    ok(!ch.ok && ch.pend && ch.meas && !ch.meas.valid, 'Messung gilt nur für den gemessenen Klang (Dreh → wieder ▶ Prüfen)', ch.msg);
    // live = offline (dieselbe Phrase, derselbe Klang)
    const lo = [];
    for (const id of ['L6', 'L7', 'L8']) {
      await open(p, id, 0, 1); await X(p, () => SYNQUENZER.ks.x().sol()); await p.waitForTimeout(200);
      const r = await X(p, async () => { const a = await SYNQUENZER.ks.x().meas(); const b = await SYNQUENZER.ks.x().meas('off'); return {a: {how: a.how, low: a.low, hf: a.hf, c: a.cents.map(c => c.c), o: a.onset}, b: {how: b.how, low: b.low, hf: b.hf, c: b.cents.map(c => c.c), o: b.onset}}; });
      lo.push([id, r]);
    }
    const [[, a6], [, a7], [, a8]] = lo;
    ok(a6.a.how === 'live' && a6.b.how === 'off' && Math.abs(a6.a.low - a6.b.low) <= 1.5, 'L6 live = offline: Pegel unter 150 Hz', {live: r1(a6.a.low), off: r1(a6.b.low)});
    ok(a7.a.c.length === 3 && a7.a.c.every((c, i) => c != null && Math.abs(c - a7.b.c[i]) <= 4), 'L7 live = offline: Cent je Note (±4 ct)', {live: a7.a.c, off: a7.b.c});
    ok(a8.a.hf <= -50 && a8.b.hf <= -50 && Math.abs(a8.a.o[0] - a8.b.o[0]) <= 15, 'L8 live = offline: über 3 kHz, Einschwingzeit', {live: [r1(a8.a.hf), a8.a.o], off: [r1(a8.b.hf), a8.b.o]});
    // Song läuft → Messung ohne Ton (offline), Vorhör-Zeile sagt es
    await open(p, 'L7', 0, 1); await X(p, () => SYNQUENZER.ks.x().sol());
    await X(p, () => togglePlay()); await p.waitForTimeout(500);
    const sg = await X(p, async () => { const pr = SYNQUENZER.ks.x().meas(); await new Promise(r => setTimeout(r, 60)); const txt = SYNQUENZER.ks.x().state().hearTxt; const M = await pr; return {playing: R.playing, how: M && M.how, txt, ok: SYNQUENZER.ks.x().state().ok}; });
    await X(p, () => { if (R.playing) togglePlay(); }); await p.waitForTimeout(300);
    ok(sg.playing && sg.how === 'off' && /ohne Ton/.test(sg.txt) && sg.ok, 'Song läuft: Messung ohne Ton (offline), Ergebnis ✓', sg);
    // eine misslungene Messung zählt als Versuch (Tipps nach 2/4)
    await open(p, 'L7', 0, 1);
    const ft = await X(p, async () => { const A = SYNQUENZER.ks.x(); A.set('res', 1.02); A.set('kt', 1); A.set('cutoff', 500); const f0 = A.state().fails;
      await A.meas('off'); const s1 = A.state(); await A.meas('off'); const s2 = A.state(); return {f0, f1: s1.fails, t1: s1.tipN, f2: s2.fails, t2: s2.tipN, msg: s2.msg}; });
    ok(ft.f1 === ft.f0 + 1 && ft.f2 === ft.f0 + 2 && ft.t2 >= 1 && /Gemessen/.test(ft.msg), 'Misslungene Messung zählt als Versuch, Tipp kommt', ft);
    // Zeig es mir: dreht auf die Lösung und misst gleich mit (ein ↶)
    await open(p, 'L7', 0, 1);
    const z0 = await X(p, () => UNDO.length);
    await X(p, () => SYNQUENZER.ks.x().show());
    try { await p.waitForFunction(() => { const s = SYNQUENZER.ks.x().state(); return s.ok && !s.mBusy; }, null, {timeout: 15000}); } catch (e) {}
    const zs = await X(p, () => SYNQUENZER.ks.x().state());
    ok(zs.ok && zs.meas && zs.meas.valid && zs.undo === z0 + 1 && /Zeig es mir/.test(zs.top), '„Zeig es mir“ (L7) → misst selbst → ✓, genau ein ↶', {msg: zs.msg, undo: [z0, zs.undo]});
    if (fotos) await p.screenshot({path: fotos + '/ks2-L7-gemessen-hochkant.png'});
    // E1: das Scope meldet den echten Cutoff – statisch exakt (L7 Start: 525,4 Hz)
    await open(p, 'L7', 0, 1);
    const e1a = await X(p, async () => { const v = auditionStart(KS_L.t, 60, .8); await new Promise(r => setTimeout(r, 500)); const s = SYNQUENZER.ks.x().state(); const ks = MLIVE.ks && MLIVE.ks.slice(); try { v.release(nowT()); } catch (e) {} return {dot: s.dot, ks}; });
    ok(e1a.dot && e1a.dot.e1 && e1a.ks && Math.abs(e1a.ks[0] - 525.4) < 1 && Math.abs(e1a.dot.hz - 525) <= 1, 'E1: Scope meldet den echten Cutoff (L7: 525,4 Hz), der Punkt nimmt ihn', {ks: e1a.ks && e1a.ks.map(x => +x.toFixed(2)), dot: e1a.dot});
    // E1: der Punkt läuft auf der Kurve mit (L3: Cutoff fährt, Punkt ≈ Rechnung zur selben Zeit)
    await open(p, 'L3', 0, 1);
    const e1b = await X(p, async () => { await new Promise(r => setTimeout(r, 700)); const v = auditionStart(KS_L.t, 48, 100 / 127), t0 = performance.now(); const o = []; for (let i = 0; i < 8; i++) { await new Promise(r => setTimeout(r, 110)); const d = SYNQUENZER.ks.x().state().dot, el = (performance.now() - t0) / 1000; if (d && Math.abs(d.x - el) < .2) o.push([d.x, d.hz, Math.round(KS_L.C.hz(d.x))]); } try { v.release(nowT()); } catch (e) {} return o; });
    const dev = e1b.length ? Math.max(...e1b.map(([, a, c]) => Math.abs(Math.log2(a / c)))) : 9;
    ok(e1b.length >= 5 && dev < .1, 'E1: Punkt läuft auf der Cutoff-Kurve (L3, Abweichung < 0,1 Oktaven)', {n: e1b.length, dev: +dev.toFixed(2), probe: e1b.slice(0, 4)});
    // E1: mit Modulation (L10 Bonus: S&H auf den Cutoff) – die Rechnung allein wäre nach 0,4 s fest, das Scope zeigt die Stufen
    await open(p, 'L10', 1, 1); await X(p, () => SYNQUENZER.ks.x().sol());
    const e1c = await X(p, async () => { const v = auditionStart(KS_L.t, 48, .8); await new Promise(r => setTimeout(r, 450)); const hs = new Set(); for (let i = 0; i < 36; i++) { await new Promise(r => setTimeout(r, 33)); if (MLIVE.ks) hs.add(Math.round(MLIVE.ks[0])); } try { v.release(nowT()); } catch (e) {}
      const C = KS_L.C; return {n: hs.size, v: [...hs].slice(0, 6), calc: [C.hz(.5), C.hz(1.2)].map(Math.round)}; });
    ok(e1c.n >= 3 && e1c.calc[0] === e1c.calc[1], 'E1: Cutoff mit Modulation (S&H) – Scope zeigt die Stufen, die Rechnung allein ist fest', e1c);
    // E1 kostet ohne Scope nichts: Klang-Editor zu → keine Meldung
    const e1d = await X(p, async () => { SYNQUENZER.ks.x().close(); closeEditor(); await new Promise(r => setTimeout(r, 300)); const a0 = MLIVE.at; const v = auditionStart(R.selT, 60, .8); await new Promise(r => setTimeout(r, 400)); try { v.release(nowT()); } catch (e) {} return {editor: R.editor, same: MLIVE.at === a0}; });
    ok(e1d.same, 'E1 ohne Scope: keine Meldung (Klang-Editor zu)', e1d);
    // L9 Laser: Tonhöhe fällt (E1 Tonhöhe der Stimme)
    await open(p, 'L9', 0, 2); await X(p, () => SYNQUENZER.ks.x().sol());
    const e1e = await X(p, async () => { const v = auditionStart(KS_L.t, 72, .9); const o = []; for (let i = 0; i < 10; i++) { await new Promise(r => setTimeout(r, 40)); if (MLIVE.ks) o.push(+(MLIVE.ks[2] - MLIVE.ks[3]).toFixed(1)); } try { v.release(nowT()); } catch (e) {} return {o, st: SYNQUENZER.ks.x().state().mode}; });
    ok(e1e.o.length >= 5 && e1e.o[0] > 8 && e1e.o[e1e.o.length - 1] < 1.5 && e1e.st === 'pitch', 'L9: gespielte Tonhöhe fällt 2 Oktaven in etwa 180 ms (E1)', e1e);
    // L10 Treppe: im Takt, in der Tonart, ±12 HT
    await open(p, 'L10', 0, 2); await X(p, () => SYNQUENZER.ks.x().sol());
    const st = await X(p, async () => { const v = auditionStart(KS_L.t, 60, .9); const ps = []; for (let i = 0; i < 60; i++) { await new Promise(r => setTimeout(r, 33)); if (MLIVE.ks) ps.push(Math.round(MLIVE.ks[2] * 10) / 10); } try { v.release(nowT()); } catch (e) {}
      const K = S.key, SC = Harmony.SCALES[K.scale] || Harmony.SCALES.ionian; return {ps: [...new Set(ps)], inKey: ps.every(q => Math.abs(q - Math.round(q)) < .05 && SC.includes(Harmony.PC(Math.round(q) - K.root))), range: ps.every(q => Math.abs(q - 60) <= 12.05), hist: SYNQUENZER.ks.x().state().hist, mode: SYNQUENZER.ks.x().state().mode}; });
    ok(st.inKey && st.range && st.ps.length >= 3 && st.hist >= 10 && st.mode === 'stair', 'L10 Treppe: jede Stufe ein Ton der Tonart, ±12 HT, Graph zeigt die Treppe', st);
    if (fotos) await p.screenshot({path: fotos + '/ks2-L10-treppe-hochkant.png'});
    // A/B am Master pegelgleich (±1 dB): L5 (beide Reihen), L5 Bonus (Hall 45/15 %), L8 Bonus, L9
    for (const [id, k, pair] of [['L5', 0, 'ab'], ['L5', 0, 'cd'], ['L5', 1, 'ab'], ['L8', 1, 'ab'], ['L9', 0, 'ab']]) {
      await X(p, ([id, k]) => SYNQUENZER.ks.x().start(id, k), [id, k]); await p.waitForTimeout(300);
      const m = {};
      for (const wch of pair.split('')) { const r = await X(p, async wch => { const A = SYNQUENZER.ks.x(); await A.gains(); const cap = A.capture(4.5); await A.hear(wch); return await cap; }, wch); m[wch] = r && r.lu; await p.waitForTimeout(400); }
      const v = Object.values(m), d = Math.max(...v) - Math.min(...v);
      ok(isFinite(d) && d <= 1, id + (k ? ' Bonus' : '') + ' A/B (' + pair + ') am Master pegelgleich (±1 dB)', {lu: Object.fromEntries(Object.entries(m).map(([a, x]) => [a, r1(x)])), diff: +d.toFixed(2)});
    }
    const ht = await X(p, async () => { const A = SYNQUENZER.ks.x(); A.start('L5', 0); await A.hear('c'); return A.state().hearTxt; });
    ok(/du hörst: LP24 \(pegelgleich\)/.test(ht), 'Vorhör-Zeile nennt die zweite Reihe (LP24/LP12)', ht);
    await X(p, () => SYNQUENZER.ks.x().stop());
    // Übernehmen mit Mod-Routen: genau ein ↶, Route und Werte im Klang; ↶ = bitgleich
    const preT = await SER(p);
    const u0 = await X(p, () => UNDO.length);
    const tk = await X(p, t => { const A = SYNQUENZER.ks.x(); A.start('L9', 0); A.sol(); A.take(t); const s = S.tracks[t].sound; return {u: UNDO.length, top: UNDO[UNDO.length - 1].label, name: s.name, mD: s.p.mD, rt: (s.mods || []).filter(m => m.src === 'menv' && m.dst === 'pitch').map(m => m.amt), open: !!KS_L}; }, t);
    ok(tk.u === u0 + 1 && /^Klangschule/.test(tk.top) && tk.name === 'Schule: Laser' && tk.mD === .18 && tk.rt.length === 1 && tk.rt[0] === 1 && !tk.open, 'Übernehmen L9 (mit Route Hüllk. 2 → Tonhöhe) = genau ein ↶', tk);
    const ud = await X(p, () => { undo(); const o = JSON.parse(serialize()); delete o.project.ui; return JSON.stringify(o); });
    ok(ud === preT, '↶ nach Übernehmen = Projekt wie vorher (bitgleich)');
    const other = await X(p, t => trackOrder().find(i => i !== t && S.tracks[i].kind === 'synth' && !S.tracks[i].stimme && !percIs(S.tracks[i])), t);
    if (other != null) {
      const o0 = await X(p, t => ({u: UNDO.length, t: JSON.stringify(S.tracks[t].sound)}), t);
      const o1 = await X(p, ([t, o]) => { const A = SYNQUENZER.ks.x(); A.start('L10', 0); A.sol(); A.take(o); const s = S.tracks[o].sound; return {u: UNDO.length, t: JSON.stringify(S.tracks[t].sound), name: s.name, sync: s.p.l1sync, kf: s.p.kfSh1, rt: (s.mods || []).filter(m => m.src === 'lfo1' && m.dst === 'pitch').map(m => m.amt)}; }, [t, other]);
      ok(o1.u === o0.u + 1 && o1.t === o0.t && o1.name === 'Schule: Treppen' && o1.sync === .25 && o1.kf === 1 && o1.rt[0] === .5, 'Übernehmen L10 auf andere Spur: ein ↶, Lektionsspur unverändert, LFO/Route/Tonart dabei', o1);
      await X(p, () => undo());
    }
    // ✕ nach Drehs an Mod-Routen und Spur-Effekten: bitgleich
    await X(p, () => { const A = SYNQUENZER.ks.x(); A.start('L9', 0); A.set('menv:pitch', .6); A.set('fx.dly', .4); A.start('L6', 0); A.set('fx.dly', .1); A.close(); });
    ok(await SER(p) === preT, '✕ nach Drehs an Route (MOD) und Echo (FX): Projekt bitgleich');
    // Riser im Tempo: 120 BPM = 4 Takte (8 s), 90 BPM = 2 Takte (5,3 s), Lösung ✓ in beiden
    const bpm0 = await X(p, () => S.bpm);
    const rs = [];
    for (const bpm of [120, 90]) {
      const r = await X(p, async bpm => { setBpm(bpm); const A = SYNQUENZER.ks.x(); A.start('L9', 1); await new Promise(r => setTimeout(r, 200)); const txt = document.querySelector('.kscard .kstask').textContent; const s0 = A.state(); const s1 = A.sol(); return {txt, s0: s0.ok, s1: s1.ok, mA: A.get('mA'), msg: s1.msg}; }, bpm);
      rs.push(r);
    }
    await X(p, b0 => { SYNQUENZER.ks.x().close(); setBpm(b0); }, bpm0);
    ok(/4 Takte.*8 s/.test(rs[0].txt) && /2 Takte.*5,3 s/.test(rs[1].txt) && !rs[0].s0 && rs[0].s1 && rs[1].s1 && Math.abs(rs[0].mA - 8) < .01 && Math.abs(rs[1].mA - 16 / 3) < .01, 'L9 Bonus Riser: Takte und Sekunden folgen dem Tempo, Lösung ✓', rs.map(r => [r.txt.replace(/^Aufgabe\s*/, ''), r.mA, r.s1]));
    // Sonde gegen den Python-Nachbau
    const sd = await X(p, async () => { const A = SYNQUENZER.ks.x(), o = {};
      for (const [k, r] of [[100, 1], [102, 1.02], [105, 1.05], [110, 1.1]]) { const M = await A.measSnd('L7', 0, {res: r, kt: 1, cutoff: 523.25}); o['L7 ' + k] = +(M.cents.reduce((s, c) => s + c.c, 0) / M.cents.length).toFixed(1); }
      for (const [k, v] of [['start', 'start'], ['sol', 'sol'], ['hp12', {ftype: 5, cutoff: 700, res: .55}], ['bp12-300', {ftype: 3, cutoff: 300}]]) { const M = await A.measSnd('L6', 0, v); o['L6 ' + k] = +M.low.toFixed(1); }
      for (const [k, v] of [['ohne Zünder', {noise: .04, ftype: 0, aA: .06}], ['mit Zünder', 'sol']]) { const M = await A.measSnd('L8', 0, v); o['L8 Einschwingen ' + k] = M.onset[0]; }
      return o; });
    const PULL = {100: -1, 102: -7.3, 105: -16.3, 110: -29.8};
    ok([100, 102, 105, 110].every(k => Math.abs(sd['L7 ' + k] - PULL[k]) <= 3), 'Sonde L7: Ladder-Zug wie im Python-Nachbau (±3 ct)', Object.fromEntries([100, 102, 105, 110].map(k => [k + ' %', [sd['L7 ' + k], PULL[k]]])));
    ok(sd['L8 Einschwingen ohne Zünder'] > 150 && sd['L8 Einschwingen mit Zünder'] <= 60, 'Sonde L8: ohne Zünder etwa 200 ms, mit Zünder ≤ 60 ms (Konzept)', [sd['L8 Einschwingen ohne Zünder'], sd['L8 Einschwingen mit Zünder']]);
    if (SONDE && fs.existsSync(SONDE + '/sonde-l6.json')) {
      const py = JSON.parse(fs.readFileSync(SONDE + '/sonde-l6.json', 'utf8'));
      const ARP = [48, 55, 60, 63, 60, 55, 51, 55, 48, 55, 60, 63, 60, 55, 51, 55].map((n, k) => [.05 + k * .125, .1, n, .8]);
      const res = {};
      for (const k of ['start', 'sol', 'hp12', 'bp12-300']) {
        const b64 = fs.readFileSync(SONDE + '/l6-' + k + '.wav').toString('base64');
        const am = await X(p, async ([b64, ph]) => { const u = Uint8Array.from(atob(b64), c => c.charCodeAt(0)), buf = await new OfflineAudioContext(1, 1, 48000).decodeAudioData(u.buffer); return +SYNQUENZER.ks.x().ana(buf.getChannelData(0), buf.sampleRate, ph, 'low', {}).low.toFixed(1); }, [b64, ARP]);
        res[k] = {py: py[k].low, appMisstPy: am, app: sd['L6 ' + k]};
      }
      ok(Object.values(res).every(r => Math.abs(r.py - r.appMisstPy) <= 1 && Math.abs(r.py - r.app) <= 2) && res.start.app > -18 && res.sol.app <= -18, 'Sonde L6: Pegel unter 150 Hz – App-Engine und App-Messung wie der Python-Nachbau (±2 dB / ±1 dB)', res);
    }
    if (HOER) {
      const fileOf = k => fs.readdirSync(HOER).find(n => n.startsWith(k + '-') && n.endsWith('.flac'));
      const FL = [[67, 0, 1], [72, 1, 1], [74, 2, .5], [75, 2.5, .5], [74, 3, 1], [72, 4, .5], [70, 4.5, .5], [72, 5, 2.4]].map(([m, s, l]) => [s * 60 / 90, l * 60 / 90, m, .8]);
      const D2 = [[72, 0, .5], [75, .5, .5], [79, 1, 1], [77, 2, .5], [75, 2.5, .5], [74, 3, .5], [72, 3.5, .5], [70, 4, .5], [72, 4.5, 1.5], [67, 6, .5], [72, 6.5, 1.5]].map(([m, s, l]) => [(s + .5) * .6, l * .6, m, .8]);
      const an = (k, ph, kind, P) => X(p, async ([b64, ph, kind, P]) => { const u = Uint8Array.from(atob(b64), c => c.charCodeAt(0)), buf = await new OfflineAudioContext(1, 1, 48000).decodeAudioData(u.buffer); const M = SYNQUENZER.ks.x().ana(buf.getChannelData(0), buf.sampleRate, ph, kind, P); return {hf: M.hf, c: M.cents.map(c => c.c)}; }, [fs.readFileSync(HOER + '/' + fileOf(k)).toString('base64'), ph, kind, P]);
      const d3 = await an('D3', FL, 'hf', {cutoff: 263.5, kt: 1}), d4 = await an('D4', FL, 'hf', {cutoff: 263.5, kt: 1}), d2 = await an('D2', D2, 'cent', {cutoff: 263.2, kt: 1});
      ok(d3.hf > -42 && d3.hf < -31 && d4.hf <= -55, 'Sonde L8: App-Messung auf den Hörbeispielen – D3 −34…−39 dB (Python), D4 ≤ −55 dB: D3 ✗, D4 ✓', {D3: r1(d3.hf), D4: r1(d4.hf)});
      ok(d2.c.length === 11 && d2.c.every(c => c != null && Math.abs(c) <= 6), 'Sonde L7: App-Messung auf D2 (Python: alle Töne ±4 ct)', d2.c);
    }
    const tmLoad = await X(p, () => SYNQUENZER.ks.loaded());
    ok(tmLoad.ok && tmLoad.ms < 400, 'Block beim ersten Öffnen ausgewertet', tmLoad);
  }
  ok(!p._errs.length, tag + ' keine Fehler in der Konsole', p._errs.slice(0, 5));
  await p.close();
}
await b.close();
console.log('ERGEBNIS ' + pass + '/' + (pass + fail) + (fail ? ' – ' + fail + ' FEHLER' : ''));
process.exit(fail ? 1 : 0);
