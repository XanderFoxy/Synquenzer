// T1: North-Kits in Kit-Liste, Blättern, Reiter North (Engine da)
const H = require('./h.cjs');
(async () => {
  const b = await H.browser(), p = await H.page(b);
  const kits = await p.evaluate(() => window.SYNQUENZER.kits());
  const N = ['Fell & Holz', 'Modell-Analog', 'Gestimmt', 'Schräg'];
  H.ok(N.every(n => kits.some(k => k.name === n && !k.off)), 'kits(): 4 North-Kits ladbar', kits.map(k => k.name));
  H.ok(kits.length === 11, 'kits(): 7 Werks-Kits + 4 North = 11 (wie R-4300)', kits.length);
  // Blättern: von Resonanz-Perc aus vorwärts durch alle 4 North-Kits
  await p.evaluate(() => window.SYNQUENZER.loadKit('Resonanz-Perc'));
  await p.evaluate(() => { const D = window.SYNQUENZER; D.selectTrack(4); D.openEditor(); });
  await p.waitForTimeout(300);
  const seen = [];
  for (let i = 0; i < 5; i++) { await H.tap(p, '#drumSheet .preset .pa:last-child'); seen.push(await p.evaluate(() => document.querySelector('#drumSheet .preset .pv .pn').textContent)); }
  H.ok(JSON.stringify(seen.slice(0, 4)) === JSON.stringify(N), 'Blättern › zeigt die 4 North-Kits nach Resonanz-Perc', seen);
  H.ok(await p.evaluate(() => window.SYNQUENZER.ndiInstrument()) === 'md' || seen[4] !== 'Schräg', 'North-Kit geladen: Instrument-Schalter steht auf North (oder weitergeblättert)');
  // Kit-Browser Reiter Kits: North-Kits als Zeilen mit Kennung NORTH
  await p.evaluate(() => window.SYNQUENZER.loadKit('Rom Pop'));
  await p.evaluate(() => window.SYNQUENZER.openBrowser(4)); await p.waitForTimeout(300);
  const rowsK = await p.evaluate(() => [...document.querySelectorAll('.brlist .brow')].map(r => ({n: r.querySelector('.bmain b').textContent, e: r.querySelector('.beng').textContent, off: r.classList.contains('ndioff')})));
  H.ok(N.every(n => rowsK.some(r => r.n === n && r.e === 'NORTH' && !r.off)), 'Reiter Kits: 4 North-Zeilen (NORTH), nicht grau', rowsK);
  const chips = await p.evaluate(() => [...document.querySelectorAll('.brcats .chip')].map(c => c.dataset.c));
  H.ok(JSON.stringify(chips) === JSON.stringify(['kits', 'ekits', 'dinit', 'north']), 'Reiter: Kits | Eigene | Init | North (nichts verschoben)', chips);
  await H.shot(p, 'p428-kits-reiter');
  await H.tap(p, '.brcats .chip[data-c="north"]');
  const rowsN = await p.evaluate(() => [...document.querySelectorAll('.brlist .brow')].map(r => r.querySelector('.bmain b').textContent));
  H.ok(JSON.stringify(rowsN) === JSON.stringify(N.concat('North leer')), 'Reiter North: 4 Kits + North leer', rowsN);
  await H.shot(p, 'p428-north-reiter');
  // North leer laden: alle 12 Pads North mit INIT
  await H.tap(p, '.brlist .brow[data-id="f-kit-north-leer"] .bmain');
  const lee = await p.evaluate(() => { const pr = window.SYNQUENZER.project(), d = pr.tracks[4].sound; return {name: d.name, md: Object.values(d.p.slots).filter(s => s.md && s.md.src === 'md').length, wav: [...new Set(Object.values(d.p.slots).map(s => s.md && s.md.mWav))], inst: window.SYNQUENZER.ndiInstrument()}; });
  H.ok(lee.name === 'North leer' && lee.md === 12 && lee.inst === 'md' && lee.wav.length === 1 && lee.wav[0] === 'A1', 'North leer: 12 Pads North, INIT (mWav A1)', lee);
  // eigenes gesichertes North-Kit erscheint im Reiter North
  const own = await p.evaluate(async () => { const D = window.SYNQUENZER; try { await D.saveSound(4, 'Mein North'); } catch (e) { return String(e); } D.openBrowser(4, 'north'); await new Promise(r => setTimeout(r, 300)); return [...document.querySelectorAll('.brlist .brow .bmain b')].map(x => x.textContent); });
  H.ok(Array.isArray(own) && own.includes('Mein North'), 'eigenes North-Kit im Reiter North', own);
  const ownE = await p.evaluate(async () => { const D = window.SYNQUENZER; D.loadKit('Rom Pop'); await D.saveSound(4, 'Mein Pop'); D.openBrowser(4, 'north'); await new Promise(r => setTimeout(r, 300)); return [...document.querySelectorAll('.brlist .brow .bmain b')].map(x => x.textContent); });
  H.ok(Array.isArray(ownE) && !ownE.includes('Mein Pop'), 'eigenes Kit ohne North-Pads nicht im Reiter North', ownE);
  // aktuelles North-Kit öffnet den Browser im Reiter North
  await p.evaluate(() => { const D = window.SYNQUENZER; D.loadKit('Gestimmt'); D.openBrowser(4); });
  H.ok(await p.evaluate(() => document.querySelector('.brcats .chip.on').dataset.c) === 'north', 'North-Kit geladen → Browser öffnet Reiter North');
  H.ok(p.errs.length === 0, 'keine Seitenfehler', p.errs);
  await H.closePage(p); await b.close(); H.done('T1 Kits');
})().catch(e => { console.error(e); process.exit(2); });
