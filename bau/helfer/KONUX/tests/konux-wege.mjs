// KONUX: jeder Weg per Finger (Bereich, Marke, Block) → Song + Teile tief gleich wie die alten Funktionen in 4.30.0 (R-4300),
// je Aktion genau 1 Undo (Undo stellt den Stand davor wieder her), Name im selben Blatt (kein zweites Blatt), Hinweis mit [Rückgängig]
import { createRequire } from 'module';
import { open, buildSong, ALT, NEU, tapSel, markTap, selRange, blockTap, songJ, deq } from './lib.mjs';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const browser = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const out = [];
const typeName = async (p, txt) => { await tapSel(p, '.pop .kx-in', 250); await p.evaluate(() => document.activeElement.select()); await p.keyboard.type(txt); await p.waitForTimeout(150); };
const viaMore = async (p, a, b) => { await selRange(p, a, b); await tapSel(p, '#rangeBar button[data-a="more"]', 450); await tapSel(p, '.pop button[data-a="konux"]', 450); };
// jeder Fall: pre = API-Schritte für beide (gleicher Ausgangsstand), neu = Finger im neuen Blatt, alt = alte Funktion in 4.30.0
const FAELLE = [
  {n: 'Bereich → Zu einem Teil (Chip „Pre“)', neu: async p => { await viaMore(p, 2, 5); await tapSel(p, '.pop .cp-c[data-n="Pre"]'); await tapSel(p, '.pop .kx-go', 500); }, alt: 'SYNQUENZER.konsolidieren(2, 5, "Pre")'},
  {n: 'Bereich → Zu einem Teil (eigener Name)', neu: async p => { await viaMore(p, 6, 9); await typeName(p, 'Hook'); await tapSel(p, '.pop .kx-go', 500); }, alt: 'SYNQUENZER.konsolidieren(6, 9, "Hook")'},
  {n: 'Bereich → Zu einem Teil (Vorschlag)', neu: async p => { await viaMore(p, 1, 3); await tapSel(p, '.pop .kx-go', 500); }, alt: 'SYNQUENZER.konsolidieren(1, 3, partSuggest())'},
  {n: 'Bereich → Als Block', neu: async p => { await viaMore(p, 2, 5); await tapSel(p, '.pop .kx-c[data-k="blk"]'); await tapSel(p, '.pop .kx-go', 500); }, alt: 'SYNQUENZER.blockMake(2, 5)'},
  {n: 'Bereich → Als Block (Name „Kern“)', neu: async p => { await viaMore(p, 6, 9); await tapSel(p, '.pop .kx-c[data-k="blk"]'); await typeName(p, 'Kern'); await tapSel(p, '.pop .kx-go', 500); }, alt: 'SYNQUENZER.blockMake(6, 9, "Kern")'},
  {n: 'Marke → Zu einem Teil', neu: async p => { await markTap(p, '^REF'); await tapSel(p, '.pop button[data-kon="ux"]', 450); await tapSel(p, '.pop .kx-go', 500); }, alt: '(() => { const m = S.song.marks.find(x => x.a === 6); return SYNQUENZER.konsolidierenMark(m.id, partUniq(markLabel(m), -1)); })()'},
  {n: 'Marke → Als Block', neu: async p => { await markTap(p, '^STR'); await tapSel(p, '.pop button[data-kon="ux"]', 450); await tapSel(p, '.pop .kx-c[data-k="blk"]'); await tapSel(p, '.pop .kx-go', 500); }, alt: 'SYNQUENZER.blockMake(2, 5)'},
  {n: 'Marke → Zurückholen', pre: 'SYNQUENZER.konsolidieren(6, 9, "Hook")', neu: async p => { await markTap(p, '^HOOK'); await tapSel(p, '.pop button[data-kon="back"]', 450); await tapSel(p, '.pop .kx-go', 500); }, alt: 'SYNQUENZER.zurueckholen(S.song.marks.find(m => m.a === 6).id)'},
  {n: 'Block → Zu einem Teil', pre: 'SYNQUENZER.blockMake(2, 5)', neu: async p => { await blockTap(p, 'B1'); await tapSel(p, '.pop .kx-go', 500); }, alt: 'SYNQUENZER.konsolidieren(2, 5, partUniq("Block A", -1))'},
  {n: 'Block → Umbenennen', pre: 'SYNQUENZER.blockMake(2, 5)', neu: async p => { await blockTap(p, 'B1'); await tapSel(p, '.pop .kx-w[data-kx="name"]'); await typeName(p, 'Kern'); await tapSel(p, '.pop .kx-go', 500); }, alt: 'SYNQUENZER.blockAction("B1", "rename", "Kern")'},
  {n: 'Block → Auflösen', pre: 'SYNQUENZER.blockMake(2, 5)', neu: async p => { await blockTap(p, 'B1'); await tapSel(p, '.pop .kx-w[data-kx="dis"]', 500); }, alt: 'SYNQUENZER.blockAction("B1", "dissolve")'},
  {n: 'Block → Zurückholen', pre: 'SYNQUENZER.blockMake(2, 5); SYNQUENZER.konsolidieren(2, 5, "Kern")', neu: async p => { await blockTap(p, 'B1'); await tapSel(p, '.pop .kx-c[data-k="back"]'); await tapSel(p, '.pop .kx-go', 500); }, alt: 'SYNQUENZER.zurueckholen(S.song.marks.find(m => m.a === 2).id)'},
  {n: 'Block → Hineingehen', pre: 'SYNQUENZER.blockMake(2, 5)', undo: 0, neu: async p => { await blockTap(p, 'B1'); await tapSel(p, '.pop .kx-w[data-kx="in"]', 500); }, alt: 'SYNQUENZER.blockEnter("B1")'},
];
const prep = async (app, pre) => {
  const o = await open({app, browser}); await buildSong(o.p);
  if (pre) { await o.p.evaluate(pre); await o.p.evaluate(() => { SV.x = 0; closePop(); UI.dirty.song = true; }); await o.p.waitForTimeout(350); }
  return o;
};
for (const f of FAELLE) {
  const r = {test: 'wege', fall: f.n, ok: true, fehler: []};
  try {
    // 4.30.0: Ergebnis und Ergebnis nach Undo (Undo-Vergleich gegen das alte Undo: song.mel[t].len ist ein abgeleitetes Feld, das schon
    // in 4.30.0 nach Undo anders steht als davor – das ist keine KONUX-Änderung)
    const A = await prep(ALT, f.pre); await A.p.evaluate(f.alt); await A.p.waitForTimeout(200); const ja = await songJ(A.p);
    await A.p.evaluate(() => { if (!SYNQUENZER.blockIn()) SYNQUENZER.undo(); }); await A.p.waitForTimeout(150); const jau = await songJ(A.p); await A.close();
    const N = await prep(NEU, f.pre);
    await N.p.evaluate(() => { window.__pops = []; new MutationObserver(ms => { for (const m of ms) for (const x of m.addedNodes) if (x.classList && x.classList.contains('pop')) window.__pops.push(x.className); }).observe(EL.popLayer, {childList: true}); });
    const j0 = await songJ(N.p), u0 = await N.p.evaluate(() => SYNQUENZER.undoInfo().n);
    await f.neu(N.p);
    const jn = await songJ(N.p), u1 = await N.p.evaluate(() => SYNQUENZER.undoInfo().n);
    const d = deq(jn, ja); if (d) { r.ok = false; r.fehler.push('Ergebnis ≠ 4.30.0 ' + d); }
    const want = f.undo == null ? 1 : f.undo; if (u1 - u0 !== want) { r.ok = false; r.fehler.push(`Undo-Schritte ${u1 - u0} statt ${want}`); }
    const pops = await N.p.evaluate(() => window.__pops); r.blaetter = pops;
    if (pops.some(c => /s2sum|mname/.test(c))) { r.ok = false; r.fehler.push('zweites Namens-Blatt geöffnet'); }
    if (want) {
      const t = await N.p.evaluate(() => (EL.toast && EL.toast.innerText || '').replace(/\n/g, ' | ')); r.hinweis = t;
      if (!/Rückgängig/.test(t)) { r.ok = false; r.fehler.push('Hinweis ohne [Rückgängig]'); }
      await N.p.evaluate(() => SYNQUENZER.undo()); await N.p.waitForTimeout(150);
      const ju = await songJ(N.p), d2 = deq(ju, jau); if (d2) { r.ok = false; r.fehler.push('Undo ≠ Undo in 4.30.0 ' + d2); }
      const d3 = deq(ju, j0); r.undoWieVorher = d3 ? 'bis auf ' + d3 : 'ja';
    } else {
      const inn = await N.p.evaluate(() => SYNQUENZER.blockIn()); if (inn !== 'B1') { r.ok = false; r.fehler.push('nicht im Block'); }
    }
    if (N.errs.length) { r.ok = false; r.fehler.push('Fehler: ' + N.errs.join(' / ')); }
    await N.close();
  } catch (e) { r.ok = false; r.fehler.push(String(e).slice(0, 200)); }
  out.push(r); console.log(JSON.stringify(r));
}
await browser.close();
process.exitCode = out.every(r => r.ok) ? 0 : 1;
