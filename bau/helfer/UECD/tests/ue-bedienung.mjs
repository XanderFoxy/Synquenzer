// UE-07 (≥ 44 × 44, 428×926 und 926×428, nichts abgeschnitten, Tastatur sichtbar), UE-08 (Vorhören ≤ 50 ms), UE-09 (Einrasten im
// selben Bild: amber Kante + Schraffur, Fang ±½ Takt, daneben = zurück, 0 Änderungen), UE-11 (Chip herausziehen = löschen + Toast
// „Rückgängig“, bit-gleich zurück), Blatt (Break-Spuren, Kick bleibt), Bildschirmfotos.
import {open, song, ok, DIR} from './lib.mjs';
import fs from 'fs';
const R = [], OUT = DIR + '/out'; fs.mkdirSync(OUT, {recursive: true});
for (const vp of [{width: 428, height: 926}, {width: 926, height: 428}]) {
  const tag = vp.width + 'x' + vp.height, {b, p, errs} = await open({vp, dpr: 2});
  const marks = await song(p, {kit: 'Gated 84', parts: 3, lenBars: 4});
  await p.evaluate(() => { window.SYNQUENZER.songView(true); }); await p.waitForTimeout(300);
  // [Übergänge] in der Song-Leiste
  const btn = await p.evaluate(() => { const e = document.querySelector('.sv-ue'); if (!e) return null; const r = e.getBoundingClientRect(), w = SV.wrap.getBoundingClientRect(); return {w: r.width, h: r.height, x: r.left + r.width / 2, y: r.top + r.height / 2, cut: e.scrollWidth > e.clientWidth + 1, vis: r.right <= w.right && r.bottom <= w.bottom && r.left >= w.left}; });
  await p.mouse.click(btn.x, btn.y); await p.waitForTimeout(250);
  const lay = await p.evaluate(() => {
    const q = s => [...document.querySelectorAll(s)].map(e => { const r = e.getBoundingClientRect(); return {w: r.width, h: r.height, l: r.left, r: r.right, t: r.top, b: r.bottom, cut: e.scrollWidth > e.clientWidth + 1}; });
    const kb = document.getElementById('kb').getBoundingClientRect(), bar = document.querySelector('.ue-bar').getBoundingClientRect(), top = document.querySelector('.sv-top');
    return {tiles: q('.ue-tile'), tabs: q('.ue-tabs button'), kbH: kb.height, kbVis: kb.height > 40 && kb.bottom <= innerHeight + 1 && kb.top >= bar.bottom - 1, barIn: bar.bottom <= innerHeight + 1 && bar.top >= 0,
      scroll: document.documentElement.scrollHeight > innerHeight + 1 || document.documentElement.scrollWidth > innerWidth + 1, topCut: top.scrollWidth > top.clientWidth + 1 || [...top.children].filter(e => !e.hidden).some(e => [...e.querySelectorAll('span')].some(x => x.scrollWidth > e.clientWidth + 1))};
  });
  const small = lay.tiles.concat(lay.tabs).filter(x => x.w < 44 || x.h < 44 || x.cut);
  R.push(ok(btn && btn.w >= 44 && btn.h >= 40 && !btn.cut && btn.vis && small.length === 0 && lay.kbVis && lay.barIn && !lay.scroll && !lay.topCut,
    'UE-07 ' + tag + ': Knopf, Reiter und Kacheln ≥ 44, nichts abgeschnitten, nichts rollt, Tastatur sichtbar', {knopf: btn && [Math.round(btn.w), Math.round(btn.h)], kacheln: lay.tiles.length, zuKlein: small.map(x => [Math.round(x.w), Math.round(x.h), x.cut ? 'abgeschn.' : '', Math.round(x.l)]), kbH: Math.round(lay.kbH), kbVis: lay.kbVis, scroll: lay.scroll, leisteAbgeschnitten: lay.topCut}));
  await p.screenshot({path: `${OUT}/leiste-${tag}.png`});
  // UE-08 Vorhören: Start ≤ 50 ms nach dem Tipp (geplanter Start − Tippzeit + Ausgabelatenz)
  const tile = lay.tiles[0];
  const lat = await p.evaluate(async ([x, y]) => { const el = document.elementFromPoint(x, y), c0 = (ensureAudio(), AU.ctx.currentTime), o = {bubbles: true, clientX: x, clientY: y, pointerId: 7, pointerType: 'touch', isPrimary: true};
    el.dispatchEvent(new PointerEvent('pointerdown', o)); el.dispatchEvent(new PointerEvent('pointerup', o)); return {ms: (UE.prevT - c0 + AU.graphLat) * 1000, geraet: AU.devLat * 1000, hits: HITS.filter(h => h.src === 'preview').length}; }, [tile.l + tile.w / 2, tile.t + tile.h / 2]);
  R.push(ok(lat.ms <= 50 && lat.hits > 0, 'UE-08 ' + tag + ': Vorhören startet ≤ 50 ms nach dem Tipp (App: Planung + Effekt-Latenz; Gerät getrennt)', {ms: +lat.ms.toFixed(1), geraetMs: +lat.geraet.toFixed(1), treffer: lat.hits}));
  // UE-09 Ziehen: halten (300 ms), zur Kante 4|5 ziehen (0,4 Takt daneben = im Fang) → im selben Bild amber; loslassen = abgelegt
  const geo = await p.evaluate(m => { const r = SV.wrap.getBoundingClientRect(); return {l: r.left, t: r.top, b: r.bottom, cw: SV.cellW, sx: SV.x, ru: SV.rulerH, dpr: SV.dpr, barTop: document.querySelector('.ue-bar').getBoundingClientRect().top, m}; }, marks);
  const ex = geo.l + 4 * geo.cw - geo.sx, ey = geo.t + geo.ru + 20;
  const n0 = (await p.evaluate(() => window.SYNQUENZER.undoInfo())).n;
  await p.mouse.move(tile.l + tile.w / 2, tile.t + tile.h / 2); await p.mouse.down(); await p.waitForTimeout(360);
  await p.mouse.move(ex + .4 * geo.cw, ey - 30, {steps: 4}); await p.mouse.move(ex + .4 * geo.cw, ey, {steps: 2});
  const snap = await p.evaluate(([x, y]) => { const d = UE.drag, g = SV.g, px = g.getImageData(Math.round(x * SV.dpr), Math.round(y * SV.dpr), 1, 1).data; return {tgt: d && d.tgt, px: [...px]}; }, [ex - geo.l, ey - geo.t + 30]);
  await p.screenshot({path: `${OUT}/ziehen-${tag}.png`});
  const amber = snap.px[0] > 200 && snap.px[1] > 140 && snap.px[2] < 120;
  await p.mouse.up(); await p.waitForTimeout(100);
  const l1 = await p.evaluate(() => window.SYNQUENZER.ueList()), n1 = (await p.evaluate(() => window.SYNQUENZER.undoInfo())).n;
  R.push(ok(snap.tgt && snap.tgt.m === marks[1].id && amber && l1.length === 1 && l1[0].m === marks[1].id && n1 === n0 + 1, 'UE-09 ' + tag + ': Einrasten ±½ Takt im selben Bild (amber), Ablegen = 1 Undo', {ziel: snap.tgt, pixel: snap.px, undo: n1 - n0}));
  // außerhalb des Fangs (0,7 Takt neben der Kante) loslassen: zurück, 0 Änderungen
  const s0 = JSON.stringify(await p.evaluate(() => window.SYNQUENZER.song()));
  await p.mouse.move(tile.l + tile.w / 2, tile.t + tile.h / 2); await p.mouse.down(); await p.waitForTimeout(360);
  await p.mouse.move(geo.l + 8 * geo.cw - geo.sx + .7 * geo.cw, ey, {steps: 5});
  const t2 = await p.evaluate(() => UE.drag && UE.drag.tgt); await p.mouse.up(); await p.waitForTimeout(300);
  const s1 = JSON.stringify(await p.evaluate(() => window.SYNQUENZER.song())), ghosts = await p.evaluate(() => document.querySelectorAll('.ue-ghost').length);
  R.push(ok(!t2 && s0 === s1 && ghosts === 0, 'UE-09 ' + tag + ': daneben loslassen = Kachel fliegt zurück, 0 Änderungen', {ziel: t2, gleich: s0 === s1}));
  // Einwurf frei auf 1/16: Reiter Einwürfe, Kachel in Takt 2 ziehen
  await p.evaluate(() => window.SYNQUENZER.ueTab('adl')); await p.waitForTimeout(100);
  const at = await p.evaluate(() => { const e = document.querySelector('.ue-tile'), r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  await p.mouse.move(at.x, at.y); await p.mouse.down(); await p.waitForTimeout(360);
  const xa = geo.l + (1 + 2.3 / 4) * geo.cw - geo.sx; await p.mouse.move(xa, ey, {steps: 5}); await p.mouse.up(); await p.waitForTimeout(150);
  const adl = (await p.evaluate(() => window.SYNQUENZER.ueList())).find(u => u.k === 'adlib');
  R.push(ok(adl && Math.abs(adl.at * 4 - Math.round(adl.at * 4)) < 1e-9 && adl.at >= 4 && adl.at < 8, 'Einwurf frei abgelegt, rastet auf 1/16', {at: adl && adl.at}));
  await p.screenshot({path: `${OUT}/chips-${tag}.png`});
  // Blatt: Tipp auf den Kanten-Chip
  const chips = await p.evaluate(() => window.SYNQUENZER.ueInfo().chips);
  const ch0 = chips.find(c => c.id === l1[0].id), cx = geo.l + (ch0.x0 + ch0.x1) / 2, cy = geo.t + (ch0.y0 + ch0.y1) / 2;
  R.push(ok(chips.every(c => c.x1 - c.x0 >= 44 && c.y1 - c.y0 >= 44), 'UE-07 ' + tag + ': Chips ≥ 44 × 44 Trefferfläche', chips.map(c => [Math.round(c.x1 - c.x0), Math.round(c.y1 - c.y0)])));
  await p.mouse.click(cx, cy); await p.waitForTimeout(250);
  const sheet = await p.evaluate(() => ({name: UI.pop && UI.pop.name, segs: [...document.querySelectorAll('.pop.ue-pop .seg button, .pop.ue-pop .ue-act button')].map(e => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }), txt: document.querySelector('.pop.ue-pop') ? document.querySelector('.pop.ue-pop').innerText.replace(/\s+/g, ' ').slice(0, 160) : ''}));
  await p.screenshot({path: `${OUT}/blatt-${tag}.png`});
  R.push(ok(sheet.name === 'ue' && sheet.segs.every(([w, h]) => w >= 44 && h >= 44) && /Kit der Spur: Gated 84/.test(sheet.txt), 'Blatt: öffnet per Tipp, Ziele ≥ 44, „Kit der Spur: <Name>“', sheet));
  await p.evaluate(() => closePop());
  // UE-11: Chip halten und aus dem Song ziehen (auf die Leiste) = löschen + Toast „Rückgängig“; Rückgängig = bit-gleich
  const sA = JSON.stringify(await p.evaluate(() => window.SYNQUENZER.song()));
  await p.mouse.move(cx, cy); await p.mouse.down(); await p.waitForTimeout(520); await p.mouse.move(cx, geo.barTop + 40, {steps: 6}); await p.mouse.up(); await p.waitForTimeout(150);
  const del = await p.evaluate(() => ({n: (window.SYNQUENZER.ueList() || []).length, toast: document.getElementById('toast') ? document.getElementById('toast').innerText : ''}));
  await p.evaluate(() => window.SYNQUENZER.undo()); const sB = JSON.stringify(await p.evaluate(() => window.SYNQUENZER.song()));
  R.push(ok(del.n === 1 && /Rückgängig/.test(del.toast) && sA === sB, 'UE-11 ' + tag + ': Chip herausziehen = löschen + Toast „Rückgängig“, zurück bit-gleich', del));
  // Break-Blatt: Spuren wählen, Kick bleibt
  if (vp.width < vp.height) {
    await p.evaluate(m => window.SYNQUENZER.ueAdd('w-stopp-takt', {m: m[2].id}, {}), marks); await p.waitForTimeout(100);
    const bid = (await p.evaluate(() => window.SYNQUENZER.ueList())).find(u => u.k === 'break').id;
    await p.evaluate(id => window.SYNQUENZER.ueSheet(id), bid); await p.waitForTimeout(150);
    await p.screenshot({path: `${OUT}/break-blatt-${tag}.png`});
    const trk = await p.evaluate(() => [...document.querySelectorAll('.pop.ue-pop .ue-trk button')].map(e => ({t: e.textContent, on: e.classList.contains('on'), w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height})));
    const kickBtn = await p.evaluate(() => { const e = document.querySelector('.pop.ue-pop button[data-kick]'); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
    await p.mouse.click(kickBtn.x, kickBtn.y); await p.waitForTimeout(200);
    const synBtn = await p.evaluate(() => { const e = document.querySelector('.pop.ue-pop button[data-tr="1"]'); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
    await p.mouse.click(synBtn.x, synBtn.y); await p.waitForTimeout(200);
    const bu = (await p.evaluate(() => window.SYNQUENZER.ueList())).find(u => u.k === 'break');
    R.push(ok(trk.every(x => x.w >= 44 && x.h >= 44) && bu.mode === 'dazu' && !bu.stop.includes(1) && bu.stop.includes(4), 'Break-Blatt: Spuren an/aus und [Kick bleibt] (je 1 Undo)', {stop: bu.stop, kick: bu.mode === 'dazu'}));
    await p.evaluate(() => closePop());
  }
  R.push(ok(errs.length === 0, 'keine Seitenfehler ' + tag, errs.slice(0, 4)));
  await b.close();
}
fs.writeFileSync(OUT + '/ue-bedienung.json', JSON.stringify(R, null, 1));
console.log(R.filter(x => x.ok).length + '/' + R.length + ' OK');
process.exit(R.every(x => x.ok) ? 0 : 1);
