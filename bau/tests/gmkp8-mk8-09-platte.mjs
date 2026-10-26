// G-MKP8: ABNAHME MK8-09 with the MS 2000 panel (Nachtrag 3 MK8 Umfang 5/6, Teil G Nr. 18 „Kommt MK-P zuerst“):
// BANK ▼ ▲ (ends), SELECT 1-16 (SPIEL), −/NO +/YES (ends), LED of the loaded program, display „A01:Name“, one undo per load,
// WRITE from the panel (place choice, other places deep-equal, one undo, undo deep-equal), WERKSKLANG ZURÜCK on page 26 / 20
// UTILITY (one undo, deep-equal). Taps are CDP touches on the plate (whole view, L1). Usage: node gmkp8-mk8-09-platte.mjs <index.html>
import {launch, open, tap, el, ctr} from './v3-mkp-lib.mjs';
const FILE = process.argv[2]; let fails = 0, n = 0;
const ok = (id, c, info) => { n++; if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const b = await launch(); const page = await open(b, FILE, 'L1');
await page.evaluate(async () => { await SYNQUENZER.libraryReady(); MKUI.view({ansicht: 'ganz'}); });
await page.waitForTimeout(300);
const st = () => page.evaluate(() => { const p = SYNQUENZER.mkPanel(), c = mkProg.current(), lit = p.elements.filter(e => /^s\d+$/.test(e.id) && e.led === 'on').map(e => e.id);
  return {lcd: MKUI.lcdLines(), cur: c && c.label, name: c && c.name, lit, undo: UNDO.length, top: UNDO.length ? UNDO[UNDO.length - 1].label : '', bank: mkProg.bank(0), sheet: ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : '', origin: S.tracks[0].sound.origin}; });
async function press(id) { const e = await el(page, id); if (!e) throw new Error('kein Element ' + id); const [x, y] = ctr(e); await tap(page, x, y); await page.waitForTimeout(140); }
const snap = () => page.evaluate(() => ({lib: JSON.stringify(SYNQUENZER.library()), snd: JSON.stringify(S.tracks[0].sound)}));

// 1. A01 loaded: display and LED
await page.evaluate(() => { mkProg.select(1, 1); MKUI.P.mode = 'spiel'; MKUI.render(); }); await page.waitForTimeout(200);
let s = await st();
ok('MK8-09P Anzeige A01:Name', /^A01:/.test(s.lcd[0]) && s.lcd[0].startsWith('A01:' + s.name.slice(0, 12)), JSON.stringify(s.lcd));
ok('MK8-09P LED SELECT 1', s.lit.length === 1 && s.lit[0] === 's1', JSON.stringify(s.lit));
// 2. BANK ▲ → B, LED off (other bank), SELECT 5 loads B05 with one undo
await press('bank.u'); s = await st();
ok('MK8-09P BANK ▲ = B', s.bank === 2 && /BANK +B/.test(s.lcd[1]) && s.lit.length === 0 && s.cur === 'A01', JSON.stringify({bank: s.bank, lcd: s.lcd, lit: s.lit}));
const b05 = await snap(), u0 = s.undo;
await press('s5'); s = await st();
ok('MK8-09P SELECT 5 lädt B05', s.cur === 'B05' && s.origin === 'f-mk-b05' && /^B05:/.test(s.lcd[0]) && s.lit.join() === 's5', JSON.stringify({cur: s.cur, lcd: s.lcd, lit: s.lit}));
ok('MK8-09P SELECT = ein Undo', s.undo === u0 + 1 && /Programm B05/.test(s.top), s.undo - u0 + ' · ' + s.top);
const toast = await page.evaluate(() => { const t = document.querySelector('#toast'); return t ? t.innerText : ''; });
ok('MK8-09P Toast [Rückgängig]', /B05:/.test(toast) && /Rückgängig/.test(toast), toast.replace(/\s+/g, ' '));
await page.evaluate(() => undo()); await page.waitForTimeout(100);
const ua = await snap(); ok('MK8-09P Undo des Ladens deep-equal', ua.snd === b05.snd, '');
await page.evaluate(() => redo()); await page.waitForTimeout(100);
// 3. BANK ends
for (let k = 0; k < 9; k++) await press('bank.u');
s = await st(); ok('MK8-09P BANK ▲ bleibt bei H', s.bank === 8, 'Bank ' + s.bank);
for (let k = 0; k < 9; k++) await press('bank.d');
s = await st(); ok('MK8-09P BANK ▼ bleibt bei A', s.bank === 1, 'Bank ' + s.bank);
await press('s1'); s = await st(); ok('MK8-09P SELECT 1 in A = A01', s.cur === 'A01' && s.lit.join() === 's1', s.cur);
// 4. −/NO +/YES with the ends
const uN = (await st()).undo; await press('no'); s = await st();
ok('MK8-09P −/NO bei A01 bleibt stehen', s.cur === 'A01' && s.undo === uN && /Anfang · A01/.test(s.sheet), s.cur + ' · ' + s.sheet);
await press('yes'); s = await st(); ok('MK8-09P +/YES = A02 (ein Undo)', s.cur === 'A02' && s.undo === uN + 1 && s.lit.join() === 's2', s.cur + ' ' + (s.undo - uN));
await press('yes'); await press('no'); s = await st(); ok('MK8-09P +/YES −/NO zurück auf A02', s.cur === 'A02', s.cur);
await page.evaluate(() => mkProg.select(8, 15)); await press('yes'); s = await st();
ok('MK8-09P +/YES H15 → H16', s.cur === 'H16' && s.lit.join() === 's16' && /^H16:/.test(s.lcd[0]), s.cur + ' ' + s.lcd[0]);
const uE = s.undo; await press('yes'); s = await st();
ok('MK8-09P +/YES bei H16 bleibt stehen', s.cur === 'H16' && s.undo === uE && /Ende · H16/.test(s.sheet), s.cur + ' · ' + s.sheet);
// 5. WRITE from the panel: C02 changed → D07
await page.evaluate(() => { mkProg.select(3, 2); SYNQUENZER.mkSet(0, 't.0.f.cut', 33); MKUI.P.mode = 'spiel'; }); await page.waitForTimeout(100);
const wb = await snap(), places0 = await page.evaluate(() => Array.from({length: 128}, (_, k) => JSON.stringify(MKF.progRec(Math.floor(k / 16) + 1, k % 16 + 1).id)));
const uW = (await st()).undo;
await press('write');
const pop = await page.evaluate(() => { const p = document.querySelector('.pop.mk8w'); return p ? {go: p.querySelector('[data-a="go"]').textContent, b: p.querySelector('.mk8bk .on') && p.querySelector('.mk8bk .on').textContent, s: p.querySelector('.mk8sl .on') && p.querySelector('.mk8sl .on').textContent} : null; });
ok('MK8-09P WRITE öffnet die Platzwahl (Vorgabe C02)', pop && pop.go === 'Auf C02 schreiben' && pop.b === 'C' && pop.s === '2', JSON.stringify(pop));
await page.tap('.pop.mk8w .mk8bk button[data-b="4"]'); await page.waitForTimeout(80);
await page.tap('.pop.mk8w .mk8sl button[data-s="7"]'); await page.waitForTimeout(80);
await page.tap('.pop.mk8w [data-a="go"]'); await page.waitForTimeout(500);
s = await st();
const w = await page.evaluate(() => { const o = MKF.ownAt(4, 7); return {own: o && {id: o.id, cut: o.p.mk.t[0].f.cut}, places: Array.from({length: 128}, (_, k) => JSON.stringify(MKF.progRec(Math.floor(k / 16) + 1, k % 16 + 1).id))}; });
let others = 0; for (let k = 0; k < 128; k++) if (k !== 3 * 16 + 6 && w.places[k] !== places0[k]) others++;
ok('MK8-09P WRITE legt auf D07', w.own && w.own.cut === 33 && s.cur === 'D07' && s.origin === w.own.id && /^D07:/.test(s.lcd[0]) && s.lit.join() === 's7', JSON.stringify({own: w.own, cur: s.cur, lcd: s.lcd[0], lit: s.lit}));
ok('MK8-09P WRITE: alle anderen Plätze gleich', others === 0, others + ' geändert');
ok('MK8-09P WRITE = ein Undo', s.undo === uW + 1, (s.undo - uW) + ' · ' + s.top);
const lw = await page.evaluate(() => { mkProg.select(1, 1); mkProg.select(4, 7); return {o: S.tracks[0].sound.origin, own: MKF.ownAt(4, 7).id, cut: S.tracks[0].sound.p.mk.t[0].f.cut}; });
ok('MK8-09P D07 lädt danach den eigenen Klang', lw.o === lw.own && lw.cut === 33, JSON.stringify(lw));
await page.evaluate(() => { undo(); undo(); undo(); }); await page.waitForTimeout(150);
const wu = await snap(); ok('MK8-09P Undo des WRITE deep-equal', wu.lib === wb.lib && wu.snd === wb.snd, JSON.stringify({lib: wu.lib === wb.lib, snd: wu.snd === wb.snd}));
await page.evaluate(() => { redo(); }); await page.waitForTimeout(150);
// 6. WERKSKLANG ZURÜCK on page 26 UTILITY (the track plays the own D07)
const fb = await snap(), uF = (await st()).undo;
const pg = await page.evaluate(() => { MKUI.view({modus: 'edit', seite: '26'}); const L = MKUI.pages(); return MKUI.curItem() && MKUI.curItem(); });
// CURSOR ▶ to WERKSKLANG ZURÜCK (the 8th item), then +/YES
for (let k = 0; k < 7; k++) await press('cur.r');
const it = await page.evaluate(() => [MKUI.lcdLines()[0], MKUI.lcdLines()[1]]);
await press('yes'); s = await st();
const fr = await page.evaluate(() => ({fac: MKF.progRec(4, 7).id, own: !!MKF.ownAt(4, 7), track: S.tracks[0].sound.origin}));
ok('MK8-09P WERKSKLANG ZURÜCK (Seite 26 UTILITY)', /WERKSKLANG/.test(it[1]) && fr.fac === 'f-mk-d07' && !fr.own && fr.track === 'f-mk-d07', JSON.stringify({it, fr}));
ok('MK8-09P WERKSKLANG ZURÜCK = ein Undo', s.undo === uF + 1, (s.undo - uF) + ' · ' + s.top);
await page.evaluate(() => undo()); await page.waitForTimeout(150);
const fu = await snap(); ok('MK8-09P Undo von WERKSKLANG ZURÜCK deep-equal', fu.lib === fb.lib && fu.snd === fb.snd, '');
// 6b. page 20 UTILITY in the Vocoder (H09)
await page.evaluate(async () => { mkProg.select(8, 9); const s = await mkProg.write(8, 9, 'Mein Vokal'); MKUI.view({modus: 'edit', seite: '20'}); });
await page.waitForTimeout(150);
for (let k = 0; k < 3; k++) await press('cur.r');
const it2 = await page.evaluate(() => MKUI.lcdLines());
await press('yes');
const fr2 = await page.evaluate(() => ({own: !!MKF.ownAt(8, 9), track: S.tracks[0].sound.origin, mode: S.tracks[0].sound.p.mk.mode}));
ok('MK8-09P WERKSKLANG ZURÜCK (Seite 20 UTILITY, Vocoder)', /WERKSKLANG/.test(it2[1]) && !fr2.own && fr2.track === 'f-mk-h09' && fr2.mode === 3, JSON.stringify({it2, fr2}));
// 7. EXIT back to play, the display shows the program again
await press('exit'); s = await st(); ok('MK8-09P EXIT → Anzeige H09:Name', /^H09:/.test(s.lcd[0]) && s.lit.join() === 's9', s.lcd[0] + ' ' + s.lit);
ok('MK8-09P Konsole', page.errs.length === 0, page.errs.join(' | ').slice(0, 400));
console.log('ERGEBNIS', n - fails, '/', n, 'PASS'); await b.close();
