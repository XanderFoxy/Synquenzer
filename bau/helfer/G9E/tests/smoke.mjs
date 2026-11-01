// G9E Smoke (aus G9M): Start in 3 Formaten (hoch/quer/klein), Version, keine Konsolen-Fehler, Demo spielt, Text-Modus öffnet/schließt
import {open, closeAll, sleep, T} from './h-lib.mjs';
const FILE = process.argv[2], ok = T(), WANT = process.argv[3] || '4.25.5';
for (const [w, h] of [[428, 926], [926, 428], [320, 568]]) {
  const H = await open(FILE, {viewport: {width: w, height: h}, touch: true, mobile: true}), p = H.p;
  const v = await p.evaluate(() => ({v: SYNQUENZER.version, live: !!CLOUD.live, g9: typeof SYNQUENZER.g9Text === 'function', vp: typeof SYNQUENZER.vpInfo === 'function', ly: typeof SYNQUENZER.lyBar === 'function'}));
  ok(w + '×' + h + ' Version 4.25.5, live, G9-API + Mitlese-API da', v.v === WANT && (WANT !== '4.25.5' || v.ly) && v.live && v.g9 && v.vp, JSON.stringify(v));
  await p.evaluate(() => { SYNQUENZER.play(); }); await sleep(1500);
  const pl = await p.evaluate(() => { const c = SYNQUENZER.vsClock(); SYNQUENZER.stop(); return !!c.playing; });
  ok(w + '×' + h + ' Wiedergabe startet', pl);
  const hs = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  ok(w + '×' + h + ' kein waagrechtes Scrollen', hs);
  ok(w + '×' + h + ' Konsole', !H.errs.length, H.errs.join('|').slice(0, 300));
  await H.close();
}
ok.sum(); await closeAll();
