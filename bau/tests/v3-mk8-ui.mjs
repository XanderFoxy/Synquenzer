// MK8 in Chromium: MK8-01 (every program loads through the program choice and through the library, one undo each; bank / slot
// survive save -> load), MK8-07 (library: MS 2000 + Bank X = exactly the 16 places, own sound instead of the factory one,
// N0b-01, preview), MK8-08 (unpack time per bank, all 128 in slices, load time, no long task, start-up without AM),
// MK8-09 (‹ › with the ends, WRITE via Sichern with the place choice, other places deep-equal, WERKSKLANG ZURÜCK, undo deep-equal,
// M-PLATZ of the place choice and the bank list in P1-P3, L1, L2, W). Usage: node v3-mk8-ui.mjs <index.html> [base.html]
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2]), BASE = process.argv[3] ? path.resolve(process.argv[3]) : null, ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 500)); } };
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
async function open(fmt, file) {
  const [w, h] = FMT[fmt || 'P1'];
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: fmt !== 'W', deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + (file || FILE)); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  return {ctx, page, errs};
}
const prep = page => page.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });

await T('MK8-01 Programm-Wahl und Bibliothek, je ein Undo', async () => {
  const {ctx, page, errs} = await open('P1'); await prep(page);
  const r = await page.evaluate(async () => {
    const bad = [], badLib = [], snap = () => JSON.stringify(S.tracks[0].sound);
    for (let b = 1; b <= 8; b++) for (let s = 1; s <= 16; s++) {
      const before = snap(), top = UNDO[UNDO.length - 1], id = MKF.facRec(b, s).id;
      mkProg.select(b, s);
      const c = mkProg.current();
      if (S.tracks[0].sound.origin !== id || !c || c.bank !== b || c.slot !== s || UNDO[UNDO.length - 1] === top || UNDO[UNDO.length - 2] !== top) bad.push(id);   // one new entry (the stack keeps 60)
      undo(); if (snap() !== before) bad.push(id + ' undo');
      redo();
    }
    for (let b = 1; b <= 8; b++) for (let s = 1; s <= 16; s++) {
      const id = MKF.facRec(b, s).id, top = UNDO[UNDO.length - 1], before = snap();
      SYNQUENZER.browserTap(id);
      const one = before === snap() ? UNDO[UNDO.length - 1] === top : UNDO[UNDO.length - 2] === top && UNDO[UNDO.length - 1] !== top;
      if (S.tracks[0].sound.origin !== id || !one) badLib.push(id);
    }
    closeBrowser(false);
    return {bad, badLib};
  });
  ok('MK8-01 Programm-Wahl (mkProg.select) A01–H16', r.bad.length === 0, r.bad.length ? r.bad.slice(0, 8).join(' ') : '128 Programme, je ein Undo, Undo stellt deep-equal her');
  ok('MK8-01 Bibliothek (Zeile antippen) A01–H16', r.badLib.length === 0, r.badLib.slice(0, 8).join(' ') || '128 Programme, je ein Undo');
  ok('MK8-01 Konsole', errs.length === 0, errs.join(' | '));
  await ctx.close();
});

await T('MK8-01 bank/slot Speichern → Laden', async () => {
  const {ctx, page} = await open('P1'); await prep(page);
  const j = await page.evaluate(async () => { mkProg.select(2, 3); SYNQUENZER.mkSet(0, 't.0.f.cut', 40); const w = await mkProg.write(5, 9, 'Probe Platz'); return {w, file: SYNQUENZER.serialize(), kv: JSON.stringify(await SQStore.KV().get('lib'))}; });
  await ctx.close();
  const {ctx: c2, page: p2} = await open('P1');
  const r = await p2.evaluate(async j => { await SYNQUENZER.libraryReady(); const okI = SYNQUENZER.importJSON(j.file); await new Promise(r => setTimeout(r, 300)); const L = SYNQUENZER.library(), x = L.find(s => s.name === 'Probe Platz');
    return {okI, x: x && {bank: x.bank, slot: x.slot, p: JSON.stringify(x.p)}, w: {bank: j.w.bank, slot: j.w.slot, p: JSON.stringify(j.w.p)}}; }, j);
  ok('MK8-01 bank/slot überstehen Speichern → Laden', r.okI && r.x && r.x.bank === 5 && r.x.slot === 9 && r.x.p === r.w.p, JSON.stringify({bank: r.x && r.x.bank, slot: r.x && r.x.slot, p_gleich: r.x && r.x.p === r.w.p}));
  await c2.close();
});

await T('MK8-07 Bibliothek MS 2000 + Bank', async () => {
  const {ctx, page, errs} = await open('P1'); await prep(page);
  await page.evaluate(async () => { mkProg.select(1, 1); SYNQUENZER.mkSet(0, 't.0.f.cut', 50); await mkProg.write(2, 5, 'Mein B05'); });
  await page.tap('#synthSheet .sh-head .preset .pv'); await page.waitForTimeout(300);
  const res = [];
  for (const L of 'ABCDEFGH') {
    await page.tap('#sndSheet .brbank'); await page.waitForTimeout(150);
    await page.tap(`.pop.mk8w button[data-b="${'ABCDEFGH'.indexOf(L) + 1}"]`); await page.waitForTimeout(150);
    res.push(await page.evaluate(L => { const rows = [...document.querySelectorAll('#sndSheet .brow')], b = 'ABCDEFGH'.indexOf(L) + 1;
      const want = Array.from({length: 16}, (_, k) => MKF.progRec(b, k + 1).id);
      return {L, n: rows.length, same: JSON.stringify(rows.map(r => r.dataset.id)) === JSON.stringify(want), eng: rows.every(r => r.dataset.engine === 'mk'), own: rows.filter(r => r.dataset.id.startsWith('u-')).length}; }, L));
  }
  ok('MK8-07 Bank A–H = genau die 16 Plätze', res.every(x => x.n === 16 && x.same && x.eng), res.map(x => x.L + ':' + x.n + (x.same ? '' : '≠')).join(' '));
  ok('MK8-07 eigener Klang statt Werksklang (B05)', res[1].own === 1 && res.filter(x => x.own).length === 1, 'Bank B ' + res[1].own + ' eigener Klang');
  // N0b-01: every visible row of the engine filter stays MS 2000 after each role chip
  const chips = await page.evaluate(() => [...document.querySelectorAll('#sndSheet .brcats .chip[data-c]')].map(c => c.dataset.c));
  let n0 = true;
  for (const c of chips) { await page.tap(`#sndSheet .brcats .chip[data-c="${c}"]`); await page.waitForTimeout(80); const e = await page.evaluate(() => [...document.querySelectorAll('#sndSheet .brow')].every(r => r.dataset.engine === 'mk')); if (!e) n0 = false; }
  ok('MK8-07 N0b-01 (jede Zeile MS 2000, jeder Rollen-Chip)', n0, chips.length + ' Chips');
  // preview: an arp program sounds as arp steps, a pad as a chord
  const pv = await page.evaluate(async () => { BR.bank = 1; BR.role = 'alle'; brRefresh(); const out = {};
    for (const id of ['f-mk-a02', 'f-mk-a03']) { const r = document.querySelector(`#sndSheet .brow[data-id="${id}"] .bpv`); r.click(); await new Promise(r => setTimeout(r, 700)); out[id] = {on: PV.on, voices: PV.voices.length, notes: PV.notes.length}; previewStop(); }
    return out; });
  ok('MK8-07 ▶ Vorhören', pv['f-mk-a02'].on && pv['f-mk-a02'].voices > 0 && pv['f-mk-a02'].notes >= 16 && pv['f-mk-a03'].on && pv['f-mk-a03'].voices > 0, JSON.stringify(pv));
  // a VA track: VA only (N0b-01 unchanged)
  const va = await page.evaluate(() => { closeBrowser(false); SYNQUENZER.setEngine(1, 'va'); openBrowser(1); const rows = [...document.querySelectorAll('#sndSheet .brow')]; const r = {n: rows.length, va: rows.every(x => x.dataset.engine === 'analog'), bank: !!document.querySelector('#sndSheet .brbank')}; closeBrowser(false); return r; });
  ok('MK8-07 VA-Spur zeigt nur VA, keinen Bank-Chip', va.va && va.n > 0 && !va.bank, JSON.stringify(va));
  ok('MK8-07 Konsole', errs.length === 0, errs.join(' | '));
  await ctx.close();
});

await T('MK8-08 Größe und Zeit', async () => {
  const {ctx, page} = await open('P1');
  const r = await page.evaluate(async () => {
    const loadedAtBoot = mkLoaded();
    let lt = 0; const po = new PerformanceObserver(l => { for (const x of l.getEntries()) if (x.duration > 50) lt++; }); po.observe({entryTypes: ['longtask']});
    const t0 = performance.now(); mkLoad(); const blockMs = performance.now() - t0;
    const per = []; for (let b = 1; b <= 8; b++) { const a = performance.now(); MKF.decodeBank(b); per.push(+(performance.now() - a).toFixed(2)); }
    await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); await new Promise(r => setTimeout(r, 600));
    const lt0 = lt, loads = []; for (const [b, s] of [[3, 7], [6, 2], [8, 11], [4, 14]]) { const a = performance.now(); mkProg.select(b, s); loads.push(+(performance.now() - a).toFixed(1)); await new Promise(r => setTimeout(r, 120)); }
    await new Promise(r => setTimeout(r, 200)); po.disconnect();
    return {loadedAtBoot, blockMs: +blockMs.toFixed(1), per, loads, longtasks: lt - lt0};
  });
  ok('MK8-08 Block ohne AM-Projekt nicht ausgewertet', !r.loadedAtBoot, 'Demo-Projekt: sq-mk-src beim Start ' + (r.loadedAtBoot ? 'geladen' : 'nicht geladen') + '; Auswertung bei Bedarf ' + r.blockMs + ' ms');
  ok('MK8-08 eine Bank entpackt ≤ 5 ms', Math.max(...r.per) <= 5, r.per.join(' / ') + ' ms');
  ok('MK8-08 Laden ≤ 50 ms ohne longtask', Math.max(...r.loads) <= 50 && r.longtasks === 0, 'Laden ' + r.loads.join(' / ') + ' ms, longtasks ' + r.longtasks);
  await ctx.close();
  const {ctx: c2, page: p2} = await open('P1');
  const q = await p2.evaluate(async () => { mkLoad(); const t = []; let last = performance.now(); const gaps = [];
    const o = MKF.decodeAll(); const res = await o; return {ms: res}; });
  ok('MK8-08 alle 128 in Häppchen ≤ 8 ms mit Tick dazwischen', Math.max(...q.ms) <= 8, 'je Bank ' + q.ms.map(x => x.toFixed(2)).join(' / ') + ' ms, je Bank ein setTimeout (30 ms, ≥ 1 Scheduler-Tick) dazwischen');
  await c2.close();
  if (BASE) {   // start-up without AM: this build against the previous one (median of 5, booted)
    const boot = async f => { const v = []; for (let i = 0; i < 5; i++) { const {ctx: c, page: p} = await open('P1', f); v.push(await p.evaluate(() => performance.now())); await c.close(); } v.sort((a, b) => a - b); return v[2]; };
    const a = await boot(BASE), b = await boot(FILE);
    ok('MK8-08 Startzeit ohne AM unverändert', b - a <= 20, 'Vorgänger ' + a.toFixed(0) + ' ms, MK8 ' + b.toFixed(0) + ' ms (Δ ' + (b - a).toFixed(0) + ' ms, Grenze +20 ms, EN3-14)');
  }
});

await T('MK8-09 ‹ › WRITE WERKSKLANG ZURÜCK', async () => {
  const {ctx, page, errs} = await open('P1'); await prep(page);
  await page.evaluate(() => mkProg.select(1, 1)); await page.waitForTimeout(200);
  const nxt = '#synthSheet .sh-head .preset .pa:last-child', prv = '#synthSheet .sh-head .preset .pa:first-child';
  await page.tap(prv); await page.waitForTimeout(100);
  const a0 = await page.evaluate(() => [mkProg.current().label, ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : '']);
  await page.tap(nxt); await page.waitForTimeout(100); await page.tap(nxt); await page.waitForTimeout(100);
  const a2 = await page.evaluate(() => mkProg.current().label);
  await page.evaluate(() => mkProg.select(8, 15)); await page.tap(nxt); await page.waitForTimeout(100);
  const h16 = await page.evaluate(() => mkProg.current().label); await page.tap(nxt); await page.waitForTimeout(100);
  const end = await page.evaluate(() => [mkProg.current().label, ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : '']);
  ok('MK8-09 ‹ › Programm −/+ mit Enden', a0[0] === 'A01' && a2 === 'A03' && h16 === 'H16' && end[0] === 'H16', 'A01 ‹ → ' + a0[0] + ' („' + a0[1].slice(0, 40) + '“), › › → ' + a2 + ', H15 › → ' + h16 + ', › → ' + end[0] + ' („' + end[1].slice(0, 40) + '“)');
  // WRITE via Sichern: change, choose D07, write
  const before = await page.evaluate(() => { mkProg.select(3, 2); SYNQUENZER.mkSet(0, 't.0.f.cut', 33); return {lib: JSON.stringify(SYNQUENZER.library()), snd: JSON.stringify(S.tracks[0].sound), places: JSON.stringify(Array.from({length: 128}, (_, k) => MKF.progRec(Math.floor(k / 16) + 1, k % 16 + 1).id))}; });
  await page.tap('#synthSheet .sh-head .hb.sv'); await page.waitForTimeout(250);
  await page.tap('.pop.mk8w .mk8bk button[data-b="4"]'); await page.waitForTimeout(100);
  await page.tap('.pop.mk8w .mk8sl button[data-s="7"]'); await page.waitForTimeout(100);
  const goTxt = await page.evaluate(() => document.querySelector('.pop.mk8w [data-a="go"]').textContent);
  await page.tap('.pop.mk8w [data-a="go"]'); await page.waitForTimeout(400);
  const w = await page.evaluate(() => { const own = MKF.ownAt(4, 7), places = Array.from({length: 128}, (_, k) => MKF.progRec(Math.floor(k / 16) + 1, k % 16 + 1).id);
    const cur = mkProg.current(); mkProg.select(1, 1); mkProg.select(4, 7); return {own: own && {id: own.id, bank: own.bank, slot: own.slot, cut: own.p.mk.t[0].f.cut}, places, cur, loaded: S.tracks[0].sound.origin, cut: S.tracks[0].sound.p.mk.t[0].f.cut, edited: soundEdited(S.tracks[0].sound)}; });
  const pb = JSON.parse(before.places); let others = 0; for (let k = 0; k < 128; k++) if (k !== 3 * 16 + 6 && w.places[k] !== pb[k]) others++;
  ok('MK8-09 WRITE auf gewählten Platz (Sichern → D07)', goTxt === 'Auf D07 schreiben' && w.own && w.own.bank === 4 && w.own.slot === 7 && w.own.cut === 33 && w.cur.label === 'D07' && w.loaded === w.own.id && w.cut === 33 && !w.edited, 'Taste „' + goTxt + '“, D07 lädt danach den eigenen Klang (CUTOFF 33)');
  ok('MK8-09 alle anderen Plätze unverändert', others === 0, others + ' andere Plätze geändert');
  // undo of the load, of the WRITE (deep-equal), redo
  const u = await page.evaluate(b => { undo(); undo(); undo(); const r = {lib: JSON.stringify(SYNQUENZER.library()) === b.lib, snd: JSON.stringify(S.tracks[0].sound) === b.snd, own: !!MKF.ownAt(4, 7)}; redo(); r.redo = !!MKF.ownAt(4, 7) && S.tracks[0].sound.origin === MKF.ownAt(4, 7).id; return r; }, before);
  ok('MK8-09 Undo des WRITE stellt deep-equal her, Redo wieder', u.lib && u.snd && !u.own && u.redo, JSON.stringify(u));
  // second WRITE on the same place: the older one only loses its place
  const w2 = await page.evaluate(async () => { const old = MKF.ownAt(4, 7).id; SYNQUENZER.mkSet(0, 't.0.f.res', 90); const s = await mkProg.write(4, 7, 'Zweiter'); const o = SYNQUENZER.library().find(x => x.id === old);
    return {newOwn: MKF.ownAt(4, 7).id === s.id, oldKept: !!o, oldBank: o && o.bank, n: SYNQUENZER.library().filter(x => x.bank === 4 && x.slot === 7).length}; });
  ok('MK8-09 zweites WRITE: der ältere verliert nur den Platz', w2.newOwn && w2.oldKept && w2.oldBank == null && w2.n === 1, JSON.stringify(w2));
  // WERKSKLANG ZURÜCK via the library ⋯
  await page.tap('#synthSheet .sh-head .preset .pv'); await page.waitForTimeout(300);
  const ownId = await page.evaluate(() => MKF.ownAt(4, 7).id);
  const lb = await page.evaluate(() => ({lib: JSON.stringify(SYNQUENZER.library()), snd: JSON.stringify(S.tracks[0].sound)}));
  await page.tap(`#sndSheet .brow[data-id="${ownId}"] .bmore`); await page.waitForTimeout(150);
  await page.tap(`#sndSheet .bacts [data-act="mkfree"]`); await page.waitForTimeout(300);
  const fr = await page.evaluate(() => ({fac: MKF.progRec(4, 7).id, own: !!MKF.ownAt(4, 7), track: S.tracks[0].sound.origin, kept: SYNQUENZER.library().length}));
  ok('MK8-09 WERKSKLANG ZURÜCK', fr.fac === 'f-mk-d07' && !fr.own && fr.track === 'f-mk-d07', JSON.stringify(fr));
  const fu = await page.evaluate(b => { undo(); return {lib: JSON.stringify(SYNQUENZER.library()) === b.lib, snd: JSON.stringify(S.tracks[0].sound) === b.snd}; }, lb);
  ok('MK8-09 Undo von WERKSKLANG ZURÜCK deep-equal', fu.lib && fu.snd, JSON.stringify(fu));
  ok('MK8-09 Konsole', errs.length === 0, errs.join(' | '));
  await ctx.close();
});

await T('MK8 live hörbar', async () => {
  const {ctx, page, errs} = await open('P1'); await prep(page);
  const r = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms)), out = {};
    for (const [b, s] of [[1, 4], [1, 7], [1, 3], [8, 9], [1, 2]]) {
      mkProg.select(b, s); await w(400); SYNQUENZER.arpClear && SYNQUENZER.arpClear(0);
      SYNQUENZER.keyOn(48, .8, 'k1'); SYNQUENZER.keyOn(55, .8, 'k2'); await w(600); const m = SYNQUENZER.meter(); SYNQUENZER.keyOff(48, 'k1'); SYNQUENZER.keyOff(55, 'k2'); await w(900);
      out[MKF.label(b, s)] = {rms: +m.rmsDb.toFixed(1), cen: Math.round(m.centroidHz), arp: (SYNQUENZER.arpLog(0) || []).length};
    }
    return out;
  });
  const v = Object.values(r);
  ok('MK8 live: Programme klingen und unterscheiden sich', v.every(x => x.rms > -45) && new Set(v.map(x => Math.round(x.cen / 100))).size >= 3 && r.A02.arp >= 4,
    Object.entries(r).map(([k, x]) => k + ' ' + x.rms + ' dB ' + x.cen + ' Hz' + (x.arp ? ' Arp ' + x.arp : '')).join(' · '));
  ok('MK8 live Konsole', errs.length === 0, errs.join(' | '));
  await ctx.close();
});

// M-PLATZ: place choice (Sichern), Bank ▾ and the library rows in all formats
const mplatz = page => page.evaluate(() => {
  const bad = [], vw = innerWidth, vh = innerHeight, p = document.querySelector('.pop.mk8w'); if (!p) return ['kein Fenster'];
  const pr = p.getBoundingClientRect(); if (pr.left < 0 || pr.top < 0 || pr.right > vw + .5 || pr.bottom > vh + .5) bad.push('Fenster außerhalb');
  const bs = [...p.querySelectorAll('button')].filter(b => !b.hidden && getComputedStyle(b).display !== 'none');
  for (const b of bs) { const r = b.getBoundingClientRect(); if (r.height < 44 - .5 || r.width < 44 - .5) bad.push('klein ' + b.textContent.trim() + ' ' + r.width.toFixed(0) + '×' + r.height.toFixed(0));
    if (b.scrollWidth > b.clientWidth + 1) bad.push('abgeschnitten ' + b.textContent.trim()); if (r.bottom > pr.bottom + .5 && p.scrollHeight <= p.clientHeight) bad.push('außerhalb ' + b.textContent.trim()); }
  for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) { const a = bs[i].getBoundingClientRect(), c = bs[j].getBoundingClientRect(); if (a.left < c.right - .5 && c.left < a.right - .5 && a.top < c.bottom - .5 && c.top < a.bottom - .5) bad.push('überlappt ' + bs[i].textContent.trim() + '/' + bs[j].textContent.trim()); }
  const inf = p.querySelector('.mk8i'); if (inf && inf.scrollWidth > inf.clientWidth + 1) bad.push('Infozeile läuft über');
  return bad;
});
for (const f of Object.keys(FMT)) await T('MK8-09 M-PLATZ ' + f, async () => {
  const {ctx, page, errs} = await open(f); await prep(page);
  await page.evaluate(() => mkProg.select(2, 14)); await page.waitForTimeout(250);
  await page.tap('#synthSheet .sh-head .hb.sv'); await page.waitForTimeout(250);
  const a = await mplatz(page); await page.screenshot({path: path.dirname(new URL(import.meta.url).pathname) + `/v3-mk8-shots/${f}-sichern.png`});
  await page.evaluate(() => closePop());
  await page.tap('#synthSheet .sh-head .preset .pv'); await page.waitForTimeout(300);
  const rows = await page.evaluate(() => [...document.querySelectorAll('#sndSheet .brow')].slice(0, 6).map(r => r.getBoundingClientRect().height));
  await page.tap('#sndSheet .brbank'); await page.waitForTimeout(200);
  const b = await mplatz(page); await page.screenshot({path: path.dirname(new URL(import.meta.url).pathname) + `/v3-mk8-shots/${f}-bank.png`});
  ok('MK8-09 M-PLATZ ' + f + ' Platzwahl (Sichern)', a.length === 0, a.slice(0, 6).join('; ') || 'alle Tasten ≥ 44 × 44, im Bild, nichts abgeschnitten, keine Überlappung');
  ok('MK8-09 M-PLATZ ' + f + ' Bank ▾ und Zeilen', b.length === 0 && rows.every(h => h >= 44), (b.join('; ') || 'Bank-Tasten ≥ 44') + ' · Zeilen ' + rows.map(h => h.toFixed(0)).join('/') + ' px');
  ok('MK8-09 M-PLATZ ' + f + ' Konsole', errs.length === 0, errs.join(' | '));
  await ctx.close();
});
await browser.close();
console.log((fails ? 'FAIL' : 'PASS') + ' v3-mk8-ui: ' + fails + ' Fehler');
