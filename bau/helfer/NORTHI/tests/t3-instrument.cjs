// T3: Instrument-Schalter Drums | North im Drum-Editor-Kopf (+ ein Undo) und „North · Drum-Synthese“ in den Instrument-Listen
const H = require('./h.cjs');
const slots = p => p.evaluate(() => { const d = window.SYNQUENZER.project().tracks[4].sound; return Object.keys(d.p.slots).map(k => [k, d.p.slots[k].md ? d.p.slots[k].md.src || '-' : '-', d.p.slots[k].md ? d.p.slots[k].md.mName : '']); });
(async () => {
  const b = await H.browser(), p = await H.page(b);
  await p.evaluate(() => { const D = window.SYNQUENZER; D.loadKit('Rom Pop'); D.selectTrack(4); D.openEditor(); }); await p.waitForTimeout(300);
  const seg = await p.evaluate(() => { const s = document.querySelector('#drumSheet .sh-head .seg.ndiinst'); if (!s) return null; const bs = [...s.querySelectorAll('button')];
    return {txt: bs.map(b => b.textContent), on: bs.map(b => b.classList.contains('on')), h: bs.map(b => { const r = b.getBoundingClientRect(), cs = getComputedStyle(b, '::before'); return Math.round(r.height - parseFloat(cs.top) - parseFloat(cs.bottom)); }), w: bs.map(b => Math.round(b.getBoundingClientRect().width)), afterTitle: s.previousElementSibling && s.previousElementSibling.classList.contains('sh-title')}; });
  H.ok(seg && seg.txt.join('|') === 'Drums|North' && seg.on.join() === 'true,false' && seg.afterTitle, 'Kopf: [Drums | North] direkt nach dem Spurnamen, Drums an', seg);
  H.ok(seg && seg.h.every(h => h >= 44) && seg.w.every(w => w >= 44), 'Kopf-Schalter: Trefferfläche >= 44 px', seg);
  const p0 = await p.evaluate(() => JSON.stringify(window.SYNQUENZER.project().tracks[4])), u0 = await p.evaluate(() => window.SYNQUENZER.undoInfo().n);
  await H.tap(p, '#drumSheet .ndiinst button[data-ndi="md"]');
  const s1 = await slots(p), u1 = await p.evaluate(() => window.SYNQUENZER.undoInfo());
  H.ok(s1.every(x => x[1] === 'md'), 'North: alle 12 Pads Quelle North', s1);
  const roles = await p.evaluate(() => Object.fromEntries(['kick', 'snare', 'rim', 'clap', 'hatC', 'hatO', 'tomL', 'tomM', 'tomH', 'cym', 'perc', 'shaker'].map(id => [id, MDX.roleProg(id).mName])));
  H.ok(s1.every(([id, , n]) => n === roles[id]), 'North: jedes Pad sein Rollen-Programm (MDX.roleProg)', {s1, roles});
  H.ok(u1.n === u0 + 1, 'North: genau ein Undo-Schritt', {u0, u1});
  H.ok(await p.evaluate(() => [...document.querySelectorAll('#drumSheet .ndiinst button')].map(b => b.classList.contains('on')).join()) === 'false,true', 'Kopf zeigt North an');
  await H.shot(p, 'p428-drum-north');
  await p.evaluate(() => window.SYNQUENZER.undo()); await p.waitForTimeout(300);
  const pu = await p.evaluate(() => JSON.stringify(window.SYNQUENZER.project().tracks[4]));
  H.ok(pu === p0, 'Undo: Drum-Spur Zeichen für Zeichen wie vorher', {len0: p0.length, len1: pu.length});
  H.ok(await p.evaluate(() => window.SYNQUENZER.ndiInstrument()) === 'drum', 'nach Undo: Drums');
  // gemerkte Programme bleiben: Pad-Umschalter im SOUND-Reiter bleibt, eigenes Programm übersteht Drums → North
  await p.evaluate(() => { const D = window.SYNQUENZER; D.setPadSource('snare', 'md'); });
  H.ok(await p.evaluate(() => window.SYNQUENZER.ndiInstrument()) === 'mix', 'ein Pad North (SOUND → Quelle) = gemischt');
  H.ok(await p.evaluate(() => document.querySelector('#drumSheet .ndiinst').classList.contains('ndimix')), 'Kopf zeigt „gemischt“ (keine Taste an, Punkt an North)');
  await H.shot(p, 'p428-drum-gemischt');
  await H.tap(p, '#drumSheet .ndiinst button[data-ndi="md"]');
  await H.tap(p, '#drumSheet .ndiinst button[data-ndi="drum"]');
  const s3 = await slots(p);
  H.ok(s3.every(x => x[1] === '-'), 'Drums: alle 12 Pads zurück auf Drum-Stimme (Programme bleiben gemerkt)', s3);
  H.ok(await p.evaluate(() => { const d = window.SYNQUENZER.project().tracks[4].sound; return Object.values(d.p.slots).every(s => s.md && s.md.mName); }), 'Programme in slot.md gemerkt');
  // Pad-Umschalter (SOUND, Zeile B) existiert weiter
  await p.evaluate(() => { const D = window.SYNQUENZER; D.selectTrack(4); D.openEditor(); }); await p.waitForTimeout(300);
  H.ok(await p.evaluate(() => !!document.querySelector('#drumSheet .dsel.dsrc')), 'SOUND: [Quelle ▾] je Pad bleibt');
  // Instrument-Listen: Browser einer Synth-Spur, Engine-Liste
  await p.evaluate(() => window.SYNQUENZER.openBrowser(0)); await p.waitForTimeout(300);
  await H.tap(p, '.brcats .brse');
  const pl = await p.evaluate(() => [...document.querySelectorAll('.pop button')].map(b => b.textContent));
  H.ok(pl.includes('North · Drum-Synthese'), 'Synth-Browser „Andere Engine ansehen“: Eintrag North · Drum-Synthese', pl);
  await H.shot(p, 'p428-engine-liste');
  await H.tap(p, '.pop button[data-nd]');
  const st = await p.evaluate(() => ({t: document.querySelector('#sndSheet .sh-title b') ? document.querySelector('#sndSheet .sh-title b').textContent : null, cat: (document.querySelector('.brcats .chip.on') || {}).dataset}));
  H.ok(st.t && st.t.includes('Drums') && st.cat && st.cat.c === 'north', 'Eintrag wählt die Drum-Spur, Kits im Reiter North', st);
  // Synth-Editor ⋯ Mehr
  await p.evaluate(() => { const D = window.SYNQUENZER; D.selectTrack(0); D.openEditor(); }); await p.waitForTimeout(300);
  await H.tap(p, '#synthSheet .edm >> visible=true');
  const em = await p.evaluate(() => [...document.querySelectorAll('.pop .edmore button')].map(b => b.dataset.a + ':' + b.querySelector('b').textContent));
  H.ok(em.some(x => x.startsWith('ndi:North · Drum-Synthese')), 'Synth-Editor ⋯: Eintrag North · Drum-Synthese', em);
  H.ok(em.some(x => x.startsWith('k1m:')) && em.some(x => x.startsWith('init:')), 'Synth-Editor ⋯: Init und Modulationen weiter da', em);
  await H.tap(p, '.pop .edmore button[data-a="k1m"]');
  H.ok(await p.evaluate(() => !!document.querySelector('.pop') && /Modulation/i.test(document.querySelector('.pop').textContent)), 'Synth-Editor ⋯ → Modulationen öffnet weiterhin seine Liste');
  H.ok(await p.evaluate(() => typeof window.SYNQUENZER.closeBrowser === 'function' && typeof window.SYNQUENZER.applyBusHint === 'function'), 'API: closeBrowser / applyBusHint unverändert da');
  await H.closePage(p);
  // schmal (375 px): Klangerzeugung als Liste (engChip) mit North
  const q = await H.page(b, {w: 375, h: 812});
  await q.evaluate(() => { const D = window.SYNQUENZER; D.selectTrack(0); D.openEditor(); }); await q.waitForTimeout(300);
  const has = await q.evaluate(() => !!document.querySelector('#synthSheet .engchip button'));
  if (has) { await H.tap(q, '#synthSheet .engchip button'); const l = await q.evaluate(() => [...document.querySelectorAll('.pop button')].map(b => b.textContent));
    H.ok(l.includes('North · Drum-Synthese'), '375 px: Klangerzeugung-Liste mit North · Drum-Synthese', l); }
  else H.ok(true, '375 px: kein engChip in dieser Breite (Schalter VA|FM|WT passt) – übersprungen');
  await q.evaluate(() => { const D = window.SYNQUENZER; D.selectTrack(4); D.openEditor(); }); await q.waitForTimeout(300);
  const ov = await q.evaluate(() => { const hd = document.querySelector('#drumSheet .sh-head .r1'), r = hd.getBoundingClientRect(); return {sw: hd.scrollWidth, cw: hd.clientWidth, out: [...hd.querySelectorAll('button')].filter(b => b.offsetParent && b.getBoundingClientRect().right > r.right + .5).length}; });
  H.ok(ov.out === 0, '375 px: Drum-Kopf läuft nicht über', ov);
  H.ok(p.errs.length === 0 && q.errs.length === 0, 'keine Seitenfehler', p.errs.concat(q.errs));
  await H.closePage(q); await b.close(); H.done('T3 Instrument');
})().catch(e => { console.error(e); process.exit(2); });
