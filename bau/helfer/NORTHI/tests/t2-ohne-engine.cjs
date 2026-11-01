// T2: North-Engine fehlt / wirft → North-Kits bleiben grau mit Grund in Liste, Blättern, Reiter North; Versions-Zeile nennt den Grund
const H = require('./h.cjs');
const N = ['Fell & Holz', 'Modell-Analog', 'Gestimmt', 'Schräg'];
const VAR = [
  ['A-laufzeit', 'ND1 wirft zur Laufzeit (MDX in der TDZ)', s => s.replace("const MDX = (() => {\n  const L = {", "const MDX = (() => { throw new Error('Testfehler ND1');\n  const L = {"), 'Testfehler ND1'],
  ['B-syntax', 'ND1-Block hat einen Syntaxfehler (läuft gar nicht)', s => s.replace("window.MDX = MDX;\nif (window.NDI_BOOT)", "window.MDX = MDX;\nclass {}\nif (window.NDI_BOOT)"), null],
  ['C-kitdaten', 'ND3 (Kit-Daten) wirft', s => s.replace("(function () { try {   // NDI", "(function () { try { throw new Error('Testfehler ND3');   // NDI"), 'Testfehler ND3'],
];
async function toastTxt(p) { return p.evaluate(() => { const t = document.querySelector('#toast'); return t ? t.textContent : ''; }); }
async function menuNorth(p) {
  await p.evaluate(() => window.SYNQUENZER.openMenu('info')); await p.waitForTimeout(400);
  const r = await p.evaluate(() => { const rows = [...document.querySelectorAll('.irow')]; const f = k => { const x = rows.find(r => r.querySelector('.lbl') && r.querySelector('.lbl').textContent === k); return x ? x.lastElementChild.textContent : null; }; return {north: f('North'), ver: f('Version'), idx: rows.findIndex(r => r.querySelector('.lbl').textContent === 'North') - rows.findIndex(r => r.querySelector('.lbl').textContent === 'Version')}; });
  return r;
}
(async () => {
  const b = await H.browser(), base = H.src();
  // Normalfall: Versions-Zeile „bereit“ direkt unter „Version“
  { const p = await H.page(b); const m = await menuNorth(p);
    H.ok(m.north && m.north.startsWith('bereit') && m.idx === 1, 'Menü: Zeile North = bereit … (direkt unter Version)', m);
    await H.shot(p, 'p428-menu-version'); await H.closePage(p); }
  for (const [tag, what, fn, msg] of VAR) {
    console.log('-- Variante ' + tag + ': ' + what);
    const html = fn(base); H.ok(html !== base, tag + ': Variante gebaut');
    const p = await H.page(b, {html});
    const boot = await p.evaluate(() => window.SYNQUENZER.ndiBoot());
    H.ok(!!boot.why, tag + ': Grund erkannt', boot);
    if (msg) H.ok(String(boot.why).includes(msg), tag + ': Grund nennt den Fehler', boot.why);
    const kits = await p.evaluate(() => window.SYNQUENZER.kits());
    H.ok(N.every(n => kits.some(k => k.name === n && k.off)), tag + ': kits(): 4 North-Kits als off in der Liste', kits);
    await p.evaluate(() => window.SYNQUENZER.openBrowser(4)); await p.waitForTimeout(300);
    const rows = await p.evaluate(() => [...document.querySelectorAll('.brlist .brow.ndioff')].map(r => ({n: r.querySelector('.bmain b').textContent, why: r.querySelector('.bmain span').textContent})));
    H.ok(rows.length === 4 && rows.every(r => r.why.startsWith('North lädt nicht: ')), tag + ': Reiter Kits: 4 graue Zeilen mit Grund', rows);
    if (tag === 'A-laufzeit') await H.shot(p, 'p428-kits-ohne-engine');
    // graue Zeile antippen: Hinweis mit Grund, kein Kit-Wechsel
    const before = await p.evaluate(() => window.SYNQUENZER.project().tracks[4].sound.name);
    await H.tap(p, '.brlist .brow.ndioff .bmain');
    const t1 = await toastTxt(p), after = await p.evaluate(() => window.SYNQUENZER.project().tracks[4].sound.name);
    H.ok(t1.includes('North lädt nicht') && before === after, tag + ': graue Zeile antippen = Hinweis, kein Wechsel', {t1, before, after});
    await H.tap(p, '.brcats .chip[data-c="north"]');
    const rn = await p.evaluate(() => [...document.querySelectorAll('.brlist .brow')].map(r => r.querySelector('.bmain b').textContent + (r.classList.contains('ndioff') ? ' (grau)' : '')));
    H.ok(rn.length === 5 && rn.every(x => x.endsWith('(grau)')), tag + ': Reiter North: 4 Kits + North leer, alle grau', rn);
    if (tag === 'A-laufzeit') await H.shot(p, 'p428-north-ohne-engine');
    // Blättern: von Resonanz-Perc vorwärts → die grauen werden genannt und übersprungen
    await p.evaluate(() => { const D = window.SYNQUENZER; D.loadKit('Resonanz-Perc'); D.selectTrack(4); D.openEditor(); }); await p.waitForTimeout(300);
    await H.tap(p, '#drumSheet .preset .pa:last-child');
    const nm = await p.evaluate(() => document.querySelector('#drumSheet .preset .pv .pn').textContent), t2 = await toastTxt(p);
    H.ok(nm === '808' && t2.includes('übersprungen') && N.every(n => t2.includes(n)) && t2.includes('North lädt nicht'), tag + ': Blättern nennt die 4 grauen North-Kits und springt weiter', {nm, t2});
    // Instrument-Schalter North: Hinweis, nichts ändert sich
    await H.tap(p, '#drumSheet .ndiinst button[data-ndi="md"]');
    const st = await p.evaluate(() => window.SYNQUENZER.ndiInstrument()), t3 = await toastTxt(p);
    H.ok(st === 'drum' && t3.includes('North lädt nicht'), tag + ': Schalter North → Hinweis, bleibt Drums', {st, t3});
    const m = await menuNorth(p);
    H.ok(m.north && m.north.startsWith('nicht verfügbar (') && (!msg || m.north.includes(msg)), tag + ': Menü: North = nicht verfügbar (Grund)', m);
    if (tag === 'A-laufzeit') await H.shot(p, 'p428-menu-ohne-engine');
    const errs = p.errs.filter(e => !/Testfehler|Unexpected token|SyntaxError|class name/.test(e));
    H.ok(errs.length === 0, tag + ': keine weiteren Seitenfehler', p.errs);
    await H.closePage(p);
  }
  // D: kein AudioWorklet (Kits ladbar, spielen Drum-Stimmen; Grund steht dabei)
  { const ctx0 = null; const html = base.replace('<head>', '<head><script>try { delete window.AudioWorkletNode; window.AudioWorkletNode = undefined; } catch (e) {}</script>');
    const p = await H.page(b, {html});
    const m = await menuNorth(p);
    H.ok(m.north && m.north.startsWith('nicht verfügbar (AudioWorklet fehlt'), 'D-ohne-worklet: Menü: North = nicht verfügbar (AudioWorklet fehlt …)', m);
    await p.evaluate(() => { const D = window.SYNQUENZER; D.closeMenu(); D.openBrowser(4); }); await p.waitForTimeout(300);
    const rows = await p.evaluate(() => [...document.querySelectorAll('.brlist .brow.ndiwarn')].map(r => r.querySelector('.bmain span').textContent));
    H.ok(rows.length === 4 && rows.every(r => r.includes('North lädt nicht: AudioWorklet fehlt')), 'D-ohne-worklet: 4 North-Zeilen mit Grund (ladbar)', rows);
    const ld = await p.evaluate(() => { window.SYNQUENZER.loadKit('Gestimmt'); return window.SYNQUENZER.project().tracks[4].sound.name; });
    H.ok(ld === 'Gestimmt', 'D-ohne-worklet: North-Kit trotzdem ladbar (Rückfall Drum-Stimme)', ld);
    await H.closePage(p); }
  await b.close(); H.done('T2 ohne Engine');
})().catch(e => { console.error(e); process.exit(2); });
