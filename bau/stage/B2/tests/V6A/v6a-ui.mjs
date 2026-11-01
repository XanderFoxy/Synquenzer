// V6A Bedienung: [◆] im Editor-Kopf → Regler drehen → [Grundklang] = clip.st; Clip-Blatt (◆-Zeile, Gleiten), Teil-Blatt, Marken-Blatt;
// Trefferflächen ≥ 44 px, nichts abgeschnitten, Bildschirmfotos (hoch 390×844 und quer 844×390)
import { open, setup, ok, done } from './v6a-lib.mjs';
import fs from 'fs';
const OUT = process.env.V6A_SHOTS || new URL('./shots/', import.meta.url).pathname; fs.mkdirSync(OUT, { recursive: true });
for (const [name, vp] of [['hoch', { width: 390, height: 844 }], ['quer', { width: 844, height: 390 }]]) {
  const { b, p, errs } = await open(null, { vp });
  const t = await setup(p);
  // editor: ◆
  await p.evaluate(t => { const Q = window.SYNQUENZER; Q.selectTrack(t); Q.selectSlot(t, 1); Q.openEditor(); }, t);
  await p.waitForTimeout(400);
  const btn = await p.$('#synthSheet .v6ab');
  ok(`UI-${name}-1 [◆] im Editor-Kopf`, !!btn);
  const bb = btn ? await btn.boundingBox() : null;
  ok(`UI-${name}-2 [◆] ≥ 44 × 44 und sichtbar`, bb && bb.width >= 44 && bb.height >= 44 && bb.x >= 0 && bb.x + bb.width <= vp.width + .5, JSON.stringify(bb));
  const head = await p.evaluate(() => { const kids = [...document.querySelectorAll('#synthSheet .sh-head button')].filter(x => x.offsetParent); const ov = []; for (let a = 0; a < kids.length; a++) { const q = kids[a].getBoundingClientRect(); if (q.right > innerWidth + .5 || q.left < -.5) ov.push(kids[a].className); for (let c = a + 1; c < kids.length; c++) { const r = kids[c].getBoundingClientRect(); if (q.left < r.right - 1 && r.left < q.right - 1 && q.top < r.bottom - 1 && r.top < q.bottom - 1 && !kids[a].contains(kids[c]) && !kids[c].contains(kids[a])) ov.push(kids[a].className + '×' + kids[c].className); } } return ov; });
  ok(`UI-${name}-3 Kopfzeile: keine Taste außerhalb oder über einer anderen`, !head.length, JSON.stringify(head));
  await btn.tap(); await p.waitForTimeout(250);
  const st1 = await p.evaluate(() => ({ed: SYNQUENZER.v6aEditing(), lcd: (document.querySelector('#synthSheet .lcd') || {}).textContent, cls: document.querySelector('#synthSheet').className}));
  ok(`UI-${name}-4 ◆-Modus an, LCD „Bearbeite ◆“`, st1.ed && st1.ed.s === 1 && /Bearbeite ◆/.test(st1.lcd || '') && /v6a-ed/.test(st1.cls), JSON.stringify(st1).slice(0, 200));
  await p.evaluate(t => { SYNQUENZER.setParam(t, 'cutoff', 600); SYNQUENZER.setParam(t, 'res', .45); }, t);
  await p.waitForTimeout(150);
  await p.screenshot({ path: OUT + `v6a-editor-${name}.png` });
  const btn2 = await p.$('#synthSheet .v6ab.on'); ok(`UI-${name}-5 Taste heißt jetzt Grundklang`, !!btn2 && /Grund/.test(await btn2.textContent()));
  await btn2.tap(); await p.waitForTimeout(250);
  const r = await p.evaluate(t => ({st: SYNQUENZER.v6aState(t, 1), base: S.tracks[t].sound.p.cutoff, ed: SYNQUENZER.v6aEditing(), undo: UNDO.slice(-2).map(u => u.kind + ':' + u.label)}), t);
  ok(`UI-${name}-6 [Grundklang] → clip.st hat Cutoff/Res, Grundklang unverändert`, r.st && r.st.p.cutoff === 600 && r.st.p.res === .45 && r.base !== 600 && !r.ed, JSON.stringify(r));
  ok(`UI-${name}-7 ein Undo-Schritt 'clip' (keine Klang-Schritte mit Arbeitskopie)`, r.undo[r.undo.length - 1].startsWith('clip:◆') && !r.undo.some(u => u.startsWith('sound:')), r.undo.join(' | '));
  // clip sheet
  await p.evaluate(t => { closeEditor(); SYNQUENZER.openClipSheet(t, 1); }, t); await p.waitForTimeout(300);
  const cb = await p.$('#clipSheet .v6cb'); const cbb = cb && await cb.boundingBox();
  ok(`UI-${name}-8a Clip-Blatt: Taste „◆ Klang · 2“ sichtbar, ≥ 44 px`, cbb && cbb.height >= 44 && cbb.y + cbb.height <= vp.height + .5 && /◆ Klang · 2/.test(await cb.textContent()), JSON.stringify(cbb));
  await p.screenshot({ path: OUT + `v6a-clipblatt-${name}.png` });
  if (cb) { await cb.tap(); await p.waitForTimeout(300); }
  await p.screenshot({ path: OUT + `v6a-klangblatt-${name}.png` });
  const cs = await p.evaluate(() => { const r = document.querySelector('.v6pop'); if (!r) return null; const bs = [...r.querySelectorAll('button')].filter(x => x.offsetParent).map(x => { const q = x.getBoundingClientRect(); return {t: x.textContent, w: Math.round(q.width), h: Math.round(q.height), cut: x.scrollWidth > x.clientWidth + 1, vis: q.bottom <= innerHeight + .5 && q.right <= innerWidth + .5}; }); return {txt: r.textContent, bs}; });
  ok(`UI-${name}-8 ◆-Blatt: Klartext und Gleiten`, cs && /◆ Klang/.test(cs.txt) && /Gleiten/.test(cs.txt) && /Cutoff/.test(cs.txt) && /→/.test(cs.txt), cs && cs.txt.slice(0, 160));
  ok(`UI-${name}-8b ◆-Blatt: alle Tasten im Bild`, cs && cs.bs.every(x => x.vis), JSON.stringify(cs && cs.bs.filter(x => !x.vis)).slice(0, 200));
  const small = cs ? cs.bs.filter(x => x.h < 44 && !/→/.test(x.t)) : [];
  ok(`UI-${name}-9 ◆-Blatt: Tasten ≥ 44 px hoch`, cs && !small.length, JSON.stringify(small).slice(0, 200));
  ok(`UI-${name}-10 ◆-Blatt: Gleiten-Tasten nicht abgeschnitten`, cs && !cs.bs.some(x => x.cut && !/→/.test(x.t)), JSON.stringify(cs && cs.bs.filter(x => x.cut)).slice(0, 200));
  // tap '1 T'
  const b1 = await p.$('.v6pop .v6gl button[data-v6x="bar1"]'); if (b1) { await b1.tap(); await p.waitForTimeout(200); }
  ok(`UI-${name}-11 Gleiten 1 T gewählt`, (await p.evaluate(t => SYNQUENZER.v6aState(t, 1).x, t)) === 'bar1');
  const bf = await p.$('.v6pop .v6gl button[data-v6x="free"]'); if (bf) { await bf.tap(); await p.waitForTimeout(200); }
  const bn = await p.$('.v6pop .v6gl .v6n'); if (bn) { await bn.tap(); await p.waitForTimeout(200); }
  const sf = await p.evaluate(t => SYNQUENZER.v6aState(t, 1), t);
  ok(`UI-${name}-12 frei: Länge weiterschalten (4 → 6 Schläge)`, sf.x === 'free' && sf.n === 6, JSON.stringify(sf));
  await p.screenshot({ path: OUT + `v6a-klangblatt-frei-${name}.png` });
  await p.evaluate(() => { closePop(); closeClipSheet(); });
  // part sheet
  await p.evaluate(() => { SYNQUENZER.partFromNow && SYNQUENZER.partFromNow(0); SYNQUENZER.openPartSheet(0); }); await p.waitForTimeout(300);
  const ps = await p.$('.psheet .v6gl button[data-v6x="bar2"]');
  ok(`UI-${name}-13 Teil-Blatt: Gleiten-Zeile`, !!ps);
  if (ps) { const q = await ps.boundingBox(); ok(`UI-${name}-14 Teil-Blatt: Taste ≥ 44 px, im Bild`, q && q.height >= 44 && q.y + q.height <= vp.height + .5, JSON.stringify(q)); await p.screenshot({ path: OUT + `v6a-teilblatt-${name}.png` }); await ps.tap(); await p.waitForTimeout(200); }
  ok(`UI-${name}-15 Teil-Gleiten 2 T gespeichert`, (await p.evaluate(() => S.parts[0] && S.parts[0].gl && S.parts[0].gl.x)) === 'bar2');
  await p.evaluate(() => closePop());
  // mark sheet
  const mid = await p.evaluate(() => { const Q = SYNQUENZER; Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); Q.songView && Q.songView(true); return S.song.marks[1].id; });
  await p.waitForTimeout(300);
  await p.evaluate(id => SYNQUENZER.openMarkSheet(id), mid); await p.waitForTimeout(350);
  const mb = await p.$('.msheet .v6gl button[data-v6x="jump"]');
  ok(`UI-${name}-16 Marken-Blatt: Gleiten-Zeile`, !!mb);
  if (mb) { const q = await mb.boundingBox(); ok(`UI-${name}-17 Marken-Blatt: Taste ≥ 44 px, im Bild`, q && q.height >= 44 && q.y + q.height <= vp.height + .5 && q.y >= 0, JSON.stringify(q)); await p.screenshot({ path: OUT + `v6a-markenblatt-${name}.png` }); await mb.tap(); await p.waitForTimeout(250); }
  ok(`UI-${name}-18 Marken-Gleiten „aus“ gespeichert (Undo 'song')`, (await p.evaluate(id => { const m = S.song.marks.find(x => x.id === id); return m && m.gl && m.gl.x + ':' + UNDO[UNDO.length - 1].kind; }, mid)) === 'jump:song');
  ok(`UI-${name}-19 ◆ in der Clip-Zelle`, await p.evaluate(t => !!document.querySelector(`.slot.v6st[data-t="${t}"][data-s="1"]`), t));
  ok(`UI-${name}-20 keine Fehler`, !errs.length, errs.join(' | ').slice(0, 300));
  await b.close();
}
process.exit(done() ? 1 : 0);
