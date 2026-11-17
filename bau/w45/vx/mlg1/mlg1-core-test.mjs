// MLG1 Kern-Test (Node, DOM-frei): Block aus index.html, Übersetzer, Parser, .cbp-Leser, Werksklänge. Aufruf: node mlg1-core-test.mjs <index.html>
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const file = path.resolve(process.argv[2] || 'index.html'), here = path.dirname(new URL(import.meta.url).pathname);
const html = fs.readFileSync(file, 'utf8');
const a = html.indexOf('/* MLG1-BEGIN'), z = html.indexOf('/* MLG1-END */');
let bad = 0, good = 0;
const ok = (c, m, d) => { console.log((c ? 'OK ' : 'FEHLER ') + m + (d != null ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : '')); if (c) good++; else bad++; };
ok(a > 0 && z > a, 'Block MLG1-BEGIN … MLG1-END genau einmal', [html.split('/* MLG1-BEGIN').length - 1, html.split('/* MLG1-END */').length - 1]);
const ctx = {window: {}, atob: globalThis.atob, TextDecoder, console};
vm.createContext(ctx); vm.runInContext(html.slice(a, z), ctx);
const C = vm.runInContext('mlgCore()', ctx), toVa = (P, n) => vm.runInContext('mlToVa', ctx)(P, n);
const near = (x, y, e) => Math.abs(x - y) <= (e || 1e-3);
// 1. .cbp lesen (synthetische Testdatei mit eigenen Werten)
const L = C.cbp(new Uint8Array(fs.readFileSync(path.join(here, 'tests', 'test-3synth.cbp'))));
ok(L.length === 3 && L.map(x => x.nr).join() === '2,3,5', '3 Synth-Spuren erkannt (Sample-Spur und Spur ohne Instrument übersprungen)', L.map(x => x.nr + ' ' + x.name));
ok(Object.keys(L[0].patch).length >= 40 && L[0].patch['42'] === '450', 'Parameter-Baum: Klartext je Hex-ID (BOM entfernt)', L[0].patch['42']);
// 2. Übersetzer: Spur 1 (Säge + Rechteck −12, Filter 450 Hz, Key Follow −30 %, Delay 1/4D)
const r1 = toVa(L[0].patch, L[0].name), p1 = r1.sound.p, K = C.K;
ok(p1.o1w === 0 && p1.o2w === 1 && p1.o2semi === -12 && p1.o2oct === 0 && p1.o1fine === -3 && p1.o2fine === 6, 'Osz.: Welle, Coarse, Fine', [p1.o1w, p1.o2w, p1.o2semi, p1.o1fine, p1.o2fine]);
ok(p1.o1lvl === 1 && near(p1.o2lvl, .9), 'Osz.-Pegel aus %', [p1.o1lvl, p1.o2lvl]);
ok(p1.ftype === 0 && p1.cutoff === 450 && near(p1.res, .4 * K.resS) && p1.bass === K.bass, 'Filter LP24, Cutoff Hz, Resonanz kalibriert, kein Bass-Verlust', [p1.cutoff, p1.res, p1.bass]);
const fe = .55 * K.fenvSt, fr = r1.sound.mods.find(m => m.src === 'fenv' && m.dst === 'cutoff');
ok(near(72 * p1.fenv + 120 * (fr ? fr.amt : 0), fe, .2), 'Filter-Hüllkurve: Halbtöne = Menge × Bereich (fenv + Weg)', [p1.fenv, fr && fr.amt, +fe.toFixed(1)]);
const kr = r1.sound.mods.find(m => m.src === 'key' && m.dst === 'cutoff');
ok(p1.kt === 0 && kr && near(kr.amt, -.06), 'Key Follow −30 % → Weg Tonhöhe → Cutoff −0,06 (= −0,3 HT/HT)', kr);
ok(near(p1.fD, .24) && near(p1.fS, .1) && near(p1.aD, .15) && near(p1.aS, .05) && near(p1.aR, .04) && p1.aA === .001, 'Hüllkurven ms → s, % → 0…1', [p1.fD, p1.fS, p1.aD, p1.aS, p1.aR]);
ok(p1.ampVel === 0 && p1.fvel === 0 && p1.mode === 0 && p1.poly === 8 && p1.glide === 0, 'Anschlag 0, Poly 8, Glide aus');
ok(r1.sound.fx.chorus.mode === 'I' && near(r1.sound.fx.chorus.rate, .7 / K.chHz), 'Chorus an (Rate umgerechnet)', r1.sound.fx.chorus);
ok(r1.echo && r1.echo.mode === 'st' && r1.echo.divL === '1/4.' && r1.echo.divR === '1/8.' && near(r1.echo.fb, .12) && r1.sound.bus.echo === r1.echo && r1.sound.fx.dly > 0,
  'Delay → Projekt-Echo Modus st: links 1/4., rechts 1/8. (W1), Rückkopplung 12 %', r1.echo);
// 3. Spur 2: Coarse −24 (über die Fußlage), Mono + Glide, Grenzen der Hüllkurven, Key Follow −150 %, Delay 1/8
const r2 = toVa(L[1].patch), p2 = r2.sound.p;
ok(p2.o2oct === -1 && p2.o2semi === -12, 'Coarse −24 → Fußlage −1 + −12 HT', [p2.o2oct, p2.o2semi]);
ok(p2.mode === 1 && p2.poly === 1 && near(p2.glide, .04), 'Mono + Glide 40 ms', [p2.mode, p2.poly, p2.glide]);
ok(p2.aA === 10 && p2.aD === 10 && p2.aR === 15 && p2.fD === 10 && r2.rep.appr.some(s => /Amp-Attack 12 → Grenze 10/.test(s)), 'Hüllkurven über der Grenze → 10/15 s und als angenähert gemeldet', r2.rep.appr.filter(s => /Grenze/.test(s)));
const kr2 = r2.sound.mods.find(m => m.src === 'key' && m.dst === 'cutoff');
ok(kr2 && near(kr2.amt, -.3) && p2.cutoff === 20000, 'Key Follow −150 % → −0,3; Cutoff 22 kHz → 20 kHz', [kr2 && kr2.amt, p2.cutoff]);
const fr2 = r2.sound.mods.find(m => m.src === 'fenv');
ok(p2.fenv < 0 && near(72 * p2.fenv + 120 * (fr2 ? fr2.amt : 0), -.4 * K.fenvSt, .2), 'negative Filter-Hüllkurve', [p2.fenv, fr2 && fr2.amt]);
ok(r2.echo.divL === '1/8' && r2.echo.divR === '1/16' && near(p2.noise, Math.min(1, K.noise * .25)), 'Delay 1/8 → rechts 1/16; Rauschen 25 % × Mischgesetz', [r2.echo.divR, p2.noise]);
// 4. Spur 3: nur Rauschen + Resonanz (der Ton kommt aus dem Filter)
const r3 = toVa(L[2].patch), p3 = r3.sound.p;
ok(p3.o1lvl === 0 && p3.o2lvl === 0 && p3.noise === Math.round(Math.min(1, K.noise) * 1000) / 1000 && near(p3.res, .8 * K.resS) && !r3.rep.miss.length, 'Osz. 0 %, Rauschen 100 %, Resonanz 80 %', [p3.noise, p3.res]);
ok(r3.echo === null && r3.sound.bus === null && r3.sound.fx.dly === 0, 'Delay aus → kein Echo-Vorschlag');
// 5. alle Notenwerte des Echos: links und rechts liegen im Raster der App (14 Werte)
const ED = ['1/32', '1/16T', '1/16', '1/16.', '1/8T', '1/8', '1/8.', '1/4T', '1/4', '1/4.', '1/2T', '1/2', '1/2.', '1/1'];
ok(Object.values(C.DIV).every(v => ED.includes(v)) && Object.values(C.HALF).every(v => ED.includes(v)), 'Delay-Notenwerte → Echo-Raster (links und rechts)', Object.keys(C.DIV).length);
const exact = ['1/1', '1/2D', '1/2', '1/2T', '1/4D', '1/4', '1/4T', '1/8D', '1/8', '1/8T', '1/16'].every(k => { const q = {'1/32': .125, '1/16T': 1 / 6, '1/16': .25, '1/16.': .375, '1/8T': 1 / 3, '1/8': .5, '1/8.': .75, '1/4T': 2 / 3, '1/4': 1, '1/4.': 1.5, '1/2T': 4 / 3, '1/2': 2, '1/2.': 3, '1/1': 4};
  return near(q[C.HALF[C.DIV[k]]], q[C.DIV[k]] / 2, 1e-9); });
ok(exact, 'rechts = genau die halbe Zeit für 1/1 … 1/16 (W1: nur im Modus st)');
// 6. Robustheit
ok(C.parse('kurz') === null && C.parse(new Uint8Array(200)) === null, 'Unlesbare Daten → null');
let thr = ''; try { C.cbp(new Uint8Array(100)); } catch (e) { thr = e.message; } ok(/Kein DAW-Projekt/.test(thr), 'Keine .cbp → klare Meldung', thr);
const r0 = toVa({}), p0 = r0.sound.p; ok(r0.sound.engine === 'analog' && p0.o1lvl === 1 && p0.cutoff === 20000 && Number.isFinite(p0.level), 'Leerer Klang → gültiger Analog-Klang', [p0.cutoff, p0.level]);
const rZ = toVa({'18': '0', '28': '0', '35': 'Off'}); ok(rZ.rep.miss.some(s => /stumm/.test(s)), 'Beide Osz. 0 % ohne Rauschen → „stumm“ gemeldet');
// 6b. MLG1-P: Wurzel am Aufbau erkannt (nicht am Namen), kaputtes Base64 = nur diese Spur fällt weg, kurze Delay-Werte als angenähert gemeldet
const ent = (k, ty, pl) => { const kb = Buffer.from(k + '\0'), h = Buffer.alloc(4); h.writeUInt32LE(kb.length); const t = Buffer.alloc(2); t.writeUInt16LE(ty); return Buffer.concat([h, kb, t, pl]); };
const txt = (k, v) => { const vb = Buffer.from('﻿' + v + '\0'), n = Buffer.alloc(4); n.writeUInt32LE(vb.length); return ent(k, 8, Buffer.concat([n, vb])); };
const fol = (k, kids) => { const h = Buffer.alloc(6); h.writeUInt16LE(6); h.writeUInt32LE(kids.length, 2); return ent(k, 2, Buffer.concat([h, ...kids])); };
const kids = []; for (let q = 0; q < 24; q++) kids.push(txt((q + 16).toString(16).toUpperCase(), String(q)));
const tree = Buffer.concat([Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]), fol('IrgendeinDoc', [fol('params', [txt('42', '777'), ...kids])])]);
const PT = C.parse(tree.toString('base64'));   // wie in der .cbp: Base64-Text
ok(PT && PT['42'] === '777' && Object.keys(PT).length === 25, 'Parameter-Baum mit beliebigem Wurzel-Namen lesbar (keine Namens-Kennung im Code)', PT && PT['42']);
ok(C.parse('!!!kein Base64!!!'.repeat(8)) === null, 'Kaputtes Base64 → null statt Ausnahme (andere Spuren bleiben lesbar)');
const rd = toVa({'200': 'On', '207': '1/16T'}); ok(rd.echo.divR === '1/32' && rd.rep.appr.some(s => /rechts 1\/32 statt/.test(s)), 'Delay 1/16T → rechts 1/32 als angenähert gemeldet', rd.rep.appr.filter(s => /Delay/.test(s)));
// 7. Werksklänge
const W = vm.runInContext('mlgWerk()', ctx), BR = ['bass', 'lead', 'poly', 'flaeche', 'pluck', 'sequenz', 'effekt'], DEMO = ['bass', 'lead', 'pad', 'arp', 'stab', 'seq16'];
ok(W.length >= 8 && W.length <= 12 && new Set(W.map(w => w.id)).size === W.length && W.every(w => /^f-retro-/.test(w.id)), W.length + ' Werksklänge, eindeutige IDs', W.map(w => w.name));
ok(W.every(w => BR.includes(w.cat) && DEMO.includes(w.demo) && w.engine === 'analog' && Number.isFinite(w.p.cutoff) && w.p.level > 0), 'Kategorie, Vorhör-Phrase, Analog, Pegel');
const BRAND = /korg|roland|moog|yamaha|steinberg|cubasis|logue|arturia|sequential|oberheim|juno|minimoog/i;
ok(W.every(w => !BRAND.test(w.name + w.tip + w.ref)), 'keine Marken- oder Gerätenamen in Namen/Tipps');
ok(!BRAND.test(html.slice(a, z).replace(/\/\*[\s\S]*?\*\//g, '')), 'keine Markennamen im Code des Blocks (ohne Kommentare)');
console.log(`\n${good} OK, ${bad} FEHLER`);
process.exit(bad ? 1 : 0);
