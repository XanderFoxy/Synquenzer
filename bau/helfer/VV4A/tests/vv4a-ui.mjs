// VV4-13 + Fehlerliste A1/A4/A5: Video-Blatt mit [Kamera] [Ganz mit Balken] [Ganze App] – alle Knöpfe ≥ 44 pt, nichts abgeschnitten,
// die Bedienung rollt nicht; Tipp auf [Ganze App] wählt sie (Profil), das Standbild zeigt die App hochkant
import { open, songWithChords, report, OUT } from './lib.mjs';
import path from 'path';
const VPS = [[428, 926], [926, 428], [428, 761], [390, 844], [375, 667], [320, 568], [844, 390], [667, 375]];
const res = {checks: {}, vp: {}};
for (const [w, h] of VPS) {
  const {b, p, errs} = await open({w, h});
  await songWithChords(p);
  await p.evaluate(() => { SYNQUENZER.vvPrefs({fmt: '9:16', cam: 'kamera'}); SYNQUENZER.vvOpen(); }); await p.waitForTimeout(500);
  const btn = await p.evaluate(() => [...document.querySelectorAll('#vvSheet .vvseg button')].map(x => x.textContent).indexOf('Ganze App'));
  const segs = await p.evaluate(() => [...document.querySelectorAll('#vvSheet .vvseg')].map(s => [...s.children].map(x => x.textContent)));
  const b3 = await p.$$('#vvSheet .vvseg button'); if (btn >= 0) { await b3[btn].click(); await p.waitForTimeout(600); }
  const m = await p.evaluate(() => {
    const sh = document.getElementById('vvSheet'), bs = [...sh.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width && getComputedStyle(x).visibility !== 'hidden');
    const small = bs.filter(x => { const r = x.getBoundingClientRect(); return r.height < 44 - .5 || r.width < 44 - .5; }).map(x => x.textContent + ' ' + Math.round(x.getBoundingClientRect().width) + '×' + Math.round(x.getBoundingClientRect().height));
    const cut = [...sh.querySelectorAll('button, .lbl, .vvtxt, span')].filter(x => x.getBoundingClientRect().width && x.scrollWidth > x.clientWidth + 1 && x.clientWidth > 0).map(x => x.textContent.slice(0, 20));
    const out = bs.filter(x => { const r = x.getBoundingClientRect(); return r.right > innerWidth + .5 || r.bottom > innerHeight + .5 || r.left < -.5; }).map(x => x.textContent);
    const scr = [...sh.querySelectorAll('*')].filter(x => x.scrollHeight > x.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(x).overflowY)).map(x => x.className);
    return {small, cut, out, scr, cam: SYNQUENZER.vvPrefs().cam, pageH: document.documentElement.scrollHeight <= innerHeight + 1};
  });
  await p.screenshot({path: path.join(OUT, `vv4a-blatt-${w}x${h}.png`)});
  const key = w + 'x' + h; res.vp[key] = Object.assign(m, {segs, errs});
  res.checks[key + ' 44pt'] = !m.small.length; res.checks[key + ' ganz'] = !m.cut.length && !m.out.length; res.checks[key + ' rollt nicht'] = !m.scr.length && m.pageH;
  res.checks[key + ' wahl'] = btn >= 0 && m.cam === 'app'; res.checks[key + ' konsole'] = !errs.length;
  await b.close();
}
const bad = report('vv4a-ui', res);
for (const [k, v] of Object.entries(res.vp)) if (v.small.length || v.cut.length || v.out.length || v.scr.length) console.log(k, JSON.stringify(v));
process.exit(bad ? 1 : 0);
