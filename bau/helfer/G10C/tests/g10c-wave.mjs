// G10c Mini-Welle: Ausschnitt [in, out], Einsatz-Lage, gehörte Fassung (Zeitkarte), Vorhören, Cache
import {boot, ok, inject, sheet, pcmBursts} from './lib.mjs';
const {b, p, errs} = await boot({width: 428, height: 926});
// Take 4 s, Einsatz 1,0–1,5 s und 3,0–3,2 s
const [id] = await inject(p, 1, {sec: 4, bursts: () => [[1.0, 1.5], [3.0, 3.2]], len: 2});
await sheet(p); await p.evaluate(() => SYNQUENZER.g10cWaitPeaks()); await p.waitForTimeout(100);
let pk = await p.evaluate(() => SYNQUENZER.g10cPeaks(0));
const on = pk.map((v, k) => v > 60 ? k : -1).filter(k => k >= 0);
const exp = [...Array(64).keys()].filter(k => { const t0 = k * 4 / 64, t1 = (k + 1) * 4 / 64; return (t1 > 1.0 && t0 < 1.5) || (t1 > 3.0 && t0 < 3.2); });
ok(JSON.stringify(on) === JSON.stringify(exp), 'Mini-Welle zeigt die Einsätze an der richtigen Stelle (±0 Punkte): ' + on.join(','));
ok(pk.length === 64 && pk.every(v => v >= 0 && v <= 255), '64 Werte, 64 Byte (Uint8)');
// Ausschnitt: in/out ändern (Segment 0,8–3,1 s) → Welle zeigt nur diesen Teil
await p.evaluate(() => { const a = tkRef(TK.sheet).a; a.in = 0.8; a.out = 3.1; tkSheetPaint(UI.pop.el); });
await p.evaluate(() => SYNQUENZER.g10cWaitPeaks());
pk = await p.evaluate(() => SYNQUENZER.g10cPeaks(0));
const on2 = pk.map((v, k) => v > 60 ? k : -1).filter(k => k >= 0), d = 2.3 / 64;
const exp2 = [...Array(64).keys()].filter(k => { const t0 = .8 + k * d, t1 = .8 + (k + 1) * d; return (t1 > 1.0 && t0 < 1.5) || (t1 > 3.0 && t0 < 3.2); });
ok(Math.abs(on2[0] - exp2[0]) <= 1 && Math.abs(on2[on2.length - 1] - exp2[exp2.length - 1]) <= 1, 'Mini-Welle = Ausschnitt [in, out] (Einsatz ±1 Punkt): ' + on2[0] + '…' + on2[on2.length - 1] + ' erwartet ' + exp2[0] + '…' + exp2[exp2.length - 1]);
await p.evaluate(() => { const a = tkRef(TK.sheet).a; a.in = 0; a.out = 4; });
// Vergleich mit der gehörten Fassung (tkPeaks) – gesangsähnlich: viele Einsätze, verschieden laut
const [id2] = await inject(p, 1, {sec: 4, bursts: () => [[.2, .45, .5], [.6, 1.1, 1], [1.3, 1.5, .3], [1.7, 2.4, .8], [2.6, 2.7, .6], [2.9, 3.6, .9]], len: 2});
await sheet(p); await p.evaluate(() => SYNQUENZER.g10cWaitPeaks());
await p.evaluate(() => SYNQUENZER.tkLoadAll());
const corr = (a, b) => { const n = a.length, ma = a.reduce((x, y) => x + y) / n, mb = b.reduce((x, y) => x + y) / n; let s = 0, sa = 0, sb = 0; for (let i = 0; i < n; i++) { s += (a[i] - ma) * (b[i] - mb); sa += (a[i] - ma) ** 2; sb += (b[i] - mb) ** 2; } return s / Math.sqrt(sa * sb); };
let hp = await p.evaluate(id => Array.from(tkPeaks(id, tkRef(TK.sheet).a, 64)), id2);
pk = await p.evaluate(() => SYNQUENZER.g10cPeaks(0));
await p.evaluate(() => { undo(); }); await sheet(p); await p.evaluate(() => SYNQUENZER.tkLoadAll());
ok(corr(pk, hp) >= .95, 'Hüllkurve wie tkPeaks (roh): r = ' + corr(pk, hp).toFixed(3) + (corr(pk, hp) < .95 ? JSON.stringify([pk, hp.map(v => Math.round(v * 255))]) : ''));
// quantisiert: Zeitkarte schiebt den Einsatz 1,0 s → 1,25 s (gehört)
await p.evaluate(id => { S.takes[id].warp = wpNormWarp({mode: 'slice', res: '1/16', map: {src: [0, 1.0, 4], dst: [0, 1.25, 4]}}); UI.dirty.all = true; }, id);
for (let i = 0; i < 200; i++) { const ready = await p.evaluate(id => { const b = tkPlayBuf(id, tkRef(TK.sheet).a), c = WP.cache.get(id); return !!b && !!c && c.buf === b; }, id); if (ready) break; await p.waitForTimeout(25); }
hp = await p.evaluate(id => Array.from(tkPeaks(id, tkRef(TK.sheet).a, 64)), id);
await p.evaluate(() => { tkSheetPaint(UI.pop.el); }); await p.evaluate(() => SYNQUENZER.g10cWaitPeaks());
pk = await p.evaluate(() => SYNQUENZER.g10cPeaks(0));
const first = a => a.findIndex(v => v > .3 * Math.max(...a));
ok(corr(pk, hp) >= .95 && Math.abs(first(pk) - first(hp)) <= 1, 'quantisierter Take: Einsatz an der gehörten Stelle (Punkt ' + first(pk) + ' / gehört ' + first(hp) + '), r = ' + corr(pk, hp).toFixed(3));
ok(await p.$eval('.tksheet .g10c-chip', e => e.textContent) === 'Q 1/16', 'Chip „Q 1/16“ beim quantisierten Take');
// Chips je Zeile: zweiter Take ohne alles → „roh“, Säubern 60 am alten
await inject(p, 1); await sheet(p); await p.waitForTimeout(100);
await p.evaluate(id => { S.takes[id].cl = 60; S.takes[id].ly = undefined; tkSheetPaint(UI.pop.el); }, id);
const ch = await p.$$eval('.tksheet .g10c-row', rs => rs.map(r => [...r.querySelectorAll('.g10c-chip:not(.more)')].map(c => c.textContent)));
ok(ch[1].includes('Q 1/16') && ch[1].includes('Säubern 60'), 'Chips stimmen je Zeile (auch nicht oberste): ' + JSON.stringify(ch));
// Cache: zweites Öffnen rechnet nicht neu
const n0 = (await p.evaluate(() => SYNQUENZER.g10cInfo())).pkN;
await p.evaluate(() => closePop()); await sheet(p); await p.evaluate(() => SYNQUENZER.g10cWaitPeaks());
ok((await p.evaluate(() => SYNQUENZER.g10cInfo())).pkN === n0, 'Mini-Wellen gecacht (kein Neurechnen beim Öffnen)');
// Canvas gezeichnet (nicht leer)
const painted = await p.$eval('.tksheet canvas.g10c-wv', c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; });
ok(painted > 50, 'Welle ist gezeichnet (' + painted + ' Pixel)');
// Vorhören: Take 1 (stumm, nicht im Speicher) allein abspielen; der aktive bleibt oben
await p.evaluate(() => { const c = ensureAudio(); return c && c.resume(); });
const top0 = await p.evaluate(() => tkRef(TK.sheet).a.take);
await p.tap('.tksheet .g10c-row[data-k="1"] button[data-a="g10c-pv"]');
for (let i = 0; i < 40; i++) { const v = await p.evaluate(() => SYNQUENZER.g10cInfo().pv); if (v && !v.wait) break; await p.waitForTimeout(25); }
let pv = await p.evaluate(() => SYNQUENZER.g10cInfo().pv);
ok(pv && pv.k === 1 && pv.take === id, 'Vorhören spielt Take 1');
ok(await p.$('.tksheet .g10c-row[data-k="1"] .g10c-ph') != null && await p.$eval('.tksheet .g10c-row[data-k="1"] .g10c-pv', e => e.classList.contains('on')), 'Lauflinie und Stopp-Knopf sichtbar');
const rms = await p.evaluate(async () => { const an = AU.analyser, d = new Float32Array(an.fftSize); let mx = 0; for (let i = 0; i < 30; i++) { an.getFloatTimeDomainData(d); for (const v of d) mx = Math.max(mx, Math.abs(v)); await new Promise(r => setTimeout(r, 50)); } return mx; });
ok(rms > .01, 'Vorhören klingt am Ausgang (Spitze ' + rms.toFixed(3) + ')');
ok(await p.evaluate(() => tkRef(TK.sheet).a.take) === top0, 'Vorhören ändert den hörbaren Take nicht');
await p.tap('.tksheet .g10c-row[data-k="1"] button[data-a="g10c-pv"]'); await p.waitForTimeout(80);
ok((await p.evaluate(() => SYNQUENZER.g10cInfo().pv)) == null, 'zweiter Tipp stoppt das Vorhören');
ok(errs.length === 0, 'keine Fehler ' + JSON.stringify(errs));
await b.close();
