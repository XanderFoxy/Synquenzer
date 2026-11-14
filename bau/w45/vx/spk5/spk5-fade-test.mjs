// SPK5 Auftrag 2/3 – Test (OK/FEHL): Überblenden Spektrum ↔ Noten. Regler in der Werkzeugleiste (Touch ziehen, Doppeltipp = halb),
// Notenrolle (Raster, Takt-Linien, Noten in Ebenen-Farbe), Noten im Hintergrund (alle Ebenen bzw. Original, kein ↶-Schritt),
// Solo/Stumm wirkt, Tipp auf Note = Gehört zu / Überall finden / Klang nachbauen, flüssig (keine DOM-Änderung beim Ziehen, kein Neuzeichnen),
// Fotos 0/50/100 % in 428×926, 926×428, 926×370. Aufruf: node spk5-fade-test.mjs <abs index.html>
import path from 'node:path';
import fs from 'node:fs';
import {start, page, box, btn, info, mixWav, openSpk} from './lib.mjs';
const file = path.resolve(process.argv[2]), fotos = path.join(path.dirname(file), 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const E = await start(file), errs = [], res = {}, T0 = Date.now();
const ok = (k, v, c) => { res[k] = {v, ok: !!c}; console.log((c ? 'OK  ' : 'FEHL') + ' ' + k + ' ' + JSON.stringify(v)); };
const wav = mixWav(E.dir);
const waitIdle = p => p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.busy; }, null, {timeout: 240000});
const waitNotes = p => p.waitForFunction(() => { const r = SYNQUENZER.spk5.roll(); return r && !r.search && r.auto.length > 0; }, null, {timeout: 240000});
const roll = p => p.evaluate(() => SYNQUENZER.spk5.roll());
const fdLay = p => p.evaluate(() => {
  const q = s => { const e = document.querySelector('#spk1Sheet ' + s); if (!e) return null; const r = e.getBoundingClientRect(); return {l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height}; };
  const fd = q('.spk5-fd'), hd = q('.spk1-hd'), tl = q('.spk1-tl'), W = innerWidth, H = innerHeight;
  const t = document.querySelector('#spk1Sheet .spk1-tl'); t.scrollLeft = t.scrollWidth; const bs = [...t.querySelectorAll('button')], last = bs[bs.length - 1].getBoundingClientRect(); const lastOk = last.right <= fd.l + 0.5; t.scrollLeft = 0;
  const over = fd && hd && Math.min(fd.r, hd.r) - Math.max(fd.l, hd.l) > 0.5 && Math.min(fd.b, hd.b) - Math.max(fd.t, hd.t) > 0.5;
  return {fd: fd && {w: Math.round(fd.w), h: Math.round(fd.h)}, imBild: fd && fd.l >= 0 && fd.r <= W + 0.5 && fd.t >= 0 && fd.b <= H + 0.5, inLeiste: fd && fd.t >= tl.t - 0.5 && fd.b <= tl.b + 0.5, ueberKopf: !!over, letzteTasteErreichbar: lastOk, x: (() => { const r = document.querySelector('#spk1Sheet .sh-x').getBoundingClientRect(); return r.width >= 44 && r.height >= 44 && r.right <= W && r.top >= 0; })()};
});
const shot = (p, n) => p.screenshot({path: path.join(fotos, n)});
async function thumbDrag(P, from, to) {   // Finger auf dem Daumen von Wert „from“ nach „to“ ziehen
  const fd = await box(P.p, '#spk1Sheet .spk5-fd'), x0 = fd.x + 1 + 12 + 22 + 13, w = fd.w - 87, y = fd.y + fd.h / 2;
  await P.drag([x0 + from * w, y], [x0 + to * w, y], 12);
}

// ===== A) hochkant 428 × 926 =====
{
  const P = await page(E, 428, 926, errs), {p, tap} = P;
  const st0 = await p.evaluate(() => ({css2: !!document.getElementById('spk5Css2'), sheet: !!document.getElementById('spk1Sheet'), wk: __wk.length}));
  ok('start-laedt-nichts', st0, !st0.css2 && !st0.sheet && st0.wk === 0);
  await openSpk(P, wav);
  ok('regler-in-der-werkzeugleiste-hochkant', await fdLay(p), (r => r.fd.h >= 44 && r.imBild && r.inLeiste && !r.ueberKopf && r.letzteTasteErreichbar && r.x)(await fdLay(p)));
  await p.evaluate(() => SYNQUENZER.spk5.run('zerlegen')); await waitIdle(p); await p.waitForTimeout(400);
  const u0 = await p.evaluate(() => ({undo: SPK1.last.undo, nu: SPK1.last.nu, layers: __spk.page.info().layers}));
  await p.evaluate(() => SYNQUENZER.spk5.msg() && document.querySelector('#spk1Sheet .spk5-msg.on .spk5-mx').click());
  await shot(p, 'spk5-20-hoch-0.png');
  // erstes Ziehen Richtung Noten → Leinwände + Suche im Hintergrund
  await thumbDrag(P, 0, 0.5);
  const r1 = await roll(p);
  await waitNotes(p); await p.waitForTimeout(300);
  const r2 = await roll(p), u1 = await p.evaluate(() => ({undo: SPK1.last.undo, nu: SPK1.last.nu, notes: Object.fromEntries(Object.entries(__spk.page.ui().meta.teil2.notes || {}).map(([k, v]) => [k, v.length]))}));
  ok('ziehen-setzt-wert', {f: r1.f}, r1.f > 0.35 && r1.f < 0.65);
  ok('noten-im-hintergrund-alle-ebenen', {auto: r2.auto, sichtbar: r2.vis, lids: r2.lids, noten: u1.notes}, r2.auto.length >= 1 && r2.vis > 0 && !r2.auto.some(a => /orig$/.test(a)));
  ok('kein-eigener-undo-schritt', {vor: u0, nach: {undo: u1.undo, nu: u1.nu}}, u0.undo === u1.undo && u0.nu === u1.nu);
  // flüssig: Ziehen 50 → 100 → 20 % ohne DOM-Änderung und ohne Neuzeichnen der Notenrolle (nur Deckkraft)
  const fl = await p.evaluate(() => { window.__mut = 0; window.__st = 0; window.__mo = new MutationObserver(l => { for (const m of l) if (m.type === 'childList') { if (m.target.closest && m.target.closest('.spk1-st') || m.target.parentElement && m.target.parentElement.closest('.spk1-st')) window.__st++; else window.__mut++; } }); window.__mo.observe(document.getElementById('spk1Sheet'), {childList: true, subtree: true}); return SYNQUENZER.spk5.roll().n; });
  await thumbDrag(P, 0.5, 1); await thumbDrag(P, 1, 0.2);
  const fl2 = await p.evaluate(() => { window.__mo.disconnect(); return {mut: window.__mut, st: window.__st, n: SYNQUENZER.spk5.roll().n, f: SYNQUENZER.spk5.roll().f, op: SYNQUENZER.spk5.roll().op}; });
  ok('fluessig-nur-deckkraft', {domAenderungen: fl2.mut, statuszeileBeimLoslassen: fl2.st, neuGezeichnet: fl2.n - fl, f: fl2.f, deckkraft: fl2.op}, fl2.mut === 0 && fl2.n === fl && fl2.f > 0.1 && fl2.f < 0.3);
  // Doppeltipp = halb
  const fd = await box(p, '#spk1Sheet .spk5-fd'), mid = [fd.x + fd.w / 2, fd.y + fd.h / 2];
  await P.p.touchscreen.tap(mid[0], mid[1]); await p.waitForTimeout(90); await P.p.touchscreen.tap(mid[0], mid[1]); await p.waitForTimeout(450);
  const dt = await roll(p);
  ok('doppeltipp-halb', {f: dt.f, deckkraft: dt.op}, dt.f === 0.5 && dt.op[0] === '0.5' && dt.op[1] === '0.9');
  await shot(p, 'spk5-21-hoch-50.png');
  // Tipp rechts = 100 %
  await tap([fd.x + fd.w - 14, fd.y + fd.h / 2]); await p.waitForTimeout(450);
  const r3 = await roll(p);
  ok('tipp-rechts-100', {f: r3.f, deckkraft: r3.op}, r3.f === 1 && r3.op[0] === '1' && r3.op[1] === '1');
  await shot(p, 'spk5-22-hoch-100.png');
  // Note antippen → Klappfenster wie Werkzeug „Noten“
  const tool = await p.evaluate(() => __spk.page.ui().tool);
  let hb = null; for (let i = 0; i < 400 && !hb; i++)   /* alle gezeichneten Noten durchsuchen (SPK8: Bass-Ebene hat echte, tiefere Noten) */ { const h = await p.evaluate(i => SYNQUENZER.spk5.hit(i), i); if (h && h.w >= 10 && h.y > 0) { const mn = await box(p, '#spk1Sheet .spk1-mn'); if (h.x > mn.x + 4 && h.x < mn.x + mn.w - 4 && h.y > mn.y + 4 && h.y < mn.y + mn.h - 4) hb = h; } }
  if (hb) await tap([hb.x, hb.y]); await p.waitForTimeout(400);
  const dd = await p.evaluate(() => { const d = document.querySelector('#spk1Sheet .spk1-dd'); if (!d) return null; return {txt: [...d.querySelectorAll('button')].map(b => b.textContent.trim() + (b.disabled ? ' (aus)' : '')), h5: [...d.querySelectorAll('h5')].map(h => h.textContent), sel: __spk.page.ui().n2sel, klein: [...d.querySelectorAll('button')].filter(b => b.getBoundingClientRect().height < 43.5).length}; });
  await shot(p, 'spk5-23-hoch-note-antippen.png');
  ok('note-antippen-klappfenster', {werkzeug: tool, note: hb && {lid: hb.lid, m: hb.m}, dd}, hb && dd && dd.h5.includes('Gehört zu') && dd.txt.some(t => /^Überall finden/.test(t)) && dd.txt.some(t => /Bass|Gesang|Lead|Pads/.test(t)) && dd.sel.length === 1 && dd.klein === 0 && tool === 'rect');
  await p.evaluate(() => spk1Dd(__spk.page.ui(), null));
  // Solo wirkt auf die Noten-Ansicht
  const so = await p.evaluate(async () => { const U = __spk.page.ui(), L = U.meta.layers, ln = SYNQUENZER.spk5.roll().lids; const lid = ln[0]; await spk1Layer(U, 'solo', lid, true); await new Promise(r => setTimeout(r, 300)); const a = SYNQUENZER.spk5.roll(); await spk1Layer(U, 'solo', lid, false); await spk1Layer(U, 'mute', lid, true); await new Promise(r => setTimeout(r, 300)); const b = SYNQUENZER.spk5.roll(); await spk1Layer(U, 'mute', lid, false); await new Promise(r => setTimeout(r, 300)); const c = SYNQUENZER.spk5.roll(); return {lid, vorher: ln, solo: a.lids, stumm: b.lids, wieder: c.lids}; });
  ok('solo-stumm-wirkt', so, so.solo.length === 1 && so.solo[0] === so.lid && !so.stumm.includes(so.lid) && so.wieder.includes(so.lid));
  // 0 % = Spektrum wie vorher (Leinwände unsichtbar)
  await tap([fd.x + 16, fd.y + fd.h / 2]); await p.waitForTimeout(450);
  const r4 = await roll(p); ok('tipp-links-0', {f: r4.f, deckkraft: r4.op}, r4.f === 0 && r4.op[0] === '0' && r4.op[1] === '0');
  await P.ctx.close();
}
// ===== B) quer 926 × 428 (ohne Ebenen: Original) und 926 × 370 (zerlegt) =====
for (const [w, h, zer] of [[926, 428, false], [926, 370, true]]) {
  const P = await page(E, w, h, errs), {p} = P;
  await openSpk(P, wav);
  ok('regler-quer-' + h, await fdLay(p), (r => r.fd.h >= 44 && r.imBild && r.inLeiste && !r.ueberKopf && r.letzteTasteErreichbar && r.x)(await fdLay(p)));
  if (zer) { await p.evaluate(() => SYNQUENZER.spk5.run('zerlegen')); await waitIdle(p); await p.waitForTimeout(300); await p.evaluate(() => SYNQUENZER.spk5.msg() && document.querySelector('#spk1Sheet .spk5-msg.on .spk5-mx').click()); }
  await shot(p, `spk5-2${zer ? 6 : 4}-quer-${h}-0.png`);
  await p.evaluate(() => SYNQUENZER.spk5.fade(0.5)); await waitNotes(p); await p.waitForTimeout(300);
  const r = await roll(p);
  if (!zer) ok('ohne-ebenen-original', {auto: r.auto, sichtbar: r.vis, lids: r.lids}, r.auto.length === 1 && /\|orig$/.test(r.auto[0]) && r.vis > 0 && r.lids.every(l => l === 'orig'));
  else ok('quer-370-ebenen', {auto: r.auto, sichtbar: r.vis, lids: r.lids}, r.vis > 0 && r.lids.length >= 1 && !r.lids.includes('orig'));
  await shot(p, `spk5-2${zer ? 6 : 4}-quer-${h}-50.png`);
  await p.evaluate(() => SYNQUENZER.spk5.fade(1)); await p.waitForTimeout(250);
  await shot(p, `spk5-2${zer ? 6 : 4}-quer-${h}-100.png`);
  await P.ctx.close();
}
ok('keine-fehler', errs.slice(0, 5), errs.length === 0);
const bad = Object.entries(res).filter(([, v]) => !v.ok).map(([k]) => k);
fs.writeFileSync(path.join(path.dirname(file), 'spk5-fade-test.json'), JSON.stringify({res, bad, sek: Math.round((Date.now() - T0) / 1000)}, null, 1));
console.log(bad.length ? 'FEHLER: ' + bad.join(', ') : 'ALLES OK', Math.round((Date.now() - T0) / 1000) + ' s');
await E.b.close(); E.srv.close();
