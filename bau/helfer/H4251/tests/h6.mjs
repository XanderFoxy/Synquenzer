// H6 Abnahme H-50 … H-52: Hinweis zum Ausgang bei jeder Gesangs-Aufnahme, ?stsess für den Gerätetest. node h6.mjs <index.html>
import {open, micOn, g10demo, closeAll, sleep, ovlStart, ovlStop, waitBeat, T, platz} from './h-lib.mjs';
const FILE = process.argv[2], ok = T();
const SPK = '🔈 Ohne Kopfhörer kommt die Musik leise aus der Hörmuschel – Kabel-Kopfhörer einstecken', BT = 'Bluetooth: Telefonklang und Verzögerung – besser Kabel-Kopfhörer';
async function takes(route, n, vp) {
  const H = await open(FILE, {viewport: vp}), p = H.p; await g10demo(p); await micOn(p, route); const hints = [];
  for (let k = 0; k < n; k++) {
    await ovlStart(p);
    await p.evaluate(() => { SYNQUENZER.selectSlot(SYNQUENZER.tkInfo().stimme, 0); SYNQUENZER.rec(); }); await waitBeat(p, -2);
    const lay = vp ? await platz(p, '#__none', '#ciTgt, #ciHint') : [];
    const geo = vp ? await p.evaluate(() => ['ciTgt', 'ciHint'].map(id => { const r = document.getElementById(id).getBoundingClientRect(); return {id, l: Math.round(r.left), r: Math.round(r.right), h: Math.round(r.height)}; })) : null;
    await waitBeat(p, 1); await p.evaluate(() => SYNQUENZER.rec()); await sleep(200); await p.evaluate(() => SYNQUENZER.stop()); await sleep(1200);
    const ov = await ovlStop(p); hints.push({hint: (ov.find(x => x.show) || {}).hint, tgt: (ov.find(x => x.show) || {}).tgt, lay, geo});
  }
  const errs = H.errs.slice(); await H.close(); return {hints, errs};
}
{
  const s = await takes('speaker', 3), w = await takes('wired', 1), b = await takes('bt', 1);
  ok('H-50 Weg Lautsprecher: Hinweis in 3 Takes nacheinander', s.hints.length === 3 && s.hints.every(x => x.hint === SPK), JSON.stringify(s.hints.map(x => x.hint)));
  ok('H-50 Kabel: kein Hinweis', w.hints[0].hint === '', JSON.stringify(w.hints[0].hint));
  ok('H-50 Bluetooth: BT-Text', b.hints[0].hint === BT, JSON.stringify(b.hints[0].hint));
  ok('H-50 Konsole', !s.errs.length && !w.errs.length && !b.errs.length, s.errs.concat(w.errs, b.errs).join('|').slice(0, 200));
}
async function sess(query) {
  const H = await open(FILE, {query}), p = H.p; await g10demo(p);
  await micOn(p); const a = await p.evaluate(() => window.__as.log.slice());
  await p.evaluate(() => SYNQUENZER.stimmeStop()); await sleep(600); const b = await p.evaluate(() => ({log: window.__as.log.slice(), type: window.__as.type, pref: uiPrefs().stsess || null}));
  await H.close(); return {a, b};
}
{
  const auto = await sess('?stsess=auto'), def = await sess(''), none = await sess('?stsess=none');
  ok('H-51 ?stsess=auto: beim Start „auto“', auto.a.includes('auto') && !auto.a.includes('play-and-record') && auto.b.pref === 'auto', JSON.stringify(auto));
  ok('H-51 ohne Parameter: „play-and-record“ (wie 4.25.0)', def.a.includes('play-and-record') && !def.a.includes('auto') && def.b.pref === null, JSON.stringify(def));
  ok('H-51 ?stsess=none: nichts gesetzt außer „playback“', !none.a.includes('play-and-record') && !none.a.includes('auto'), JSON.stringify(none));
  ok('H-51 beim Ausschalten „playback“', auto.b.type === 'playback' && def.b.type === 'playback' && none.b.type === 'playback', [auto.b.type, def.b.type, none.b.type].join(','));
}
{
  const bad = [];
  for (const vp of [{width: 320, height: 568}, {width: 926, height: 428}]) {
    const r = await takes('speaker', 1, vp), h = r.hints[0];
    for (const x of h.lay) bad.push(vp.width + ': ' + x);
    for (const g of h.geo) { if (g.l < 0 || g.r > vp.width) bad.push(vp.width + ' ' + g.id + ' außerhalb'); if (g.id === 'ciHint' && g.h > 2 * 12 * 1.3 + 2) bad.push(vp.width + ' Hinweis > 2 Zeilen (' + g.h + ' px)'); }
    if (h.hint !== SPK || !/Begleitung/.test(h.tgt)) bad.push(vp.width + ' Text fehlt');
  }
  ok('H-52 M-PLATZ: Overlay mit Ziel + Hinweis bei 320 × 568 und 926 × 428, nichts abgeschnitten', !bad.length, bad.join(' | '));
}
await closeAll(); process.exit(ok.sum() ? 1 : 0);
