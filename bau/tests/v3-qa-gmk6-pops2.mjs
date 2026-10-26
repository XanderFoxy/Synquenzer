// QA G-MK6: copy-source rows of the Sequenz-Werkzeuge with the app's default save names (WRITE prefill "FLÄCHE 26.10. 09:02")
import {open, sleep, OUT, check, done} from './v3-qa-gmk6-tl.mjs';
const FM = {P3: [320, 568], P2: [375, 667], P1: [390, 844]};
for (const f in FM) {
  const T = await open({viewport: {width: FM[f][0], height: FM[f][1]}}); const {p, E, errs} = T;
  await T.openEd(2); await T.toMk();
  // two sounds saved via WRITE with the prefilled default name (as Xander would just tap "Sichern")
  const names = ['FLÄCHE 26.10. 09:35', 'FLÄCHE 26.10. 09:41', 'BASS 26.10. 09:50'];
  await E(async nm => { for (const n of nm) await SYNQUENZER.saveSound(2, n, 'new'); }, names);
  await E(() => MKUI.setWahl(2, 10)); await sleep(300);
  const show = async kk => { if (await T.mk(kk)) return; for (const t of ['LINKS', 'RECHTS']) { await T.tapTxt('#synthSheet button, #synthSheet .tab', new RegExp('^' + t + '$')); await sleep(400); if (await T.mk(kk)) return; } };
  await show('n4'); await T.tapMk('shift', 250); await show('n4'); await T.tapMk('n4', 500);
  const rows = await E(() => [...document.querySelectorAll('#popLayer .pop .mkcr b')].map(b => { const r = b.getBoundingClientRect(); return {text: b.textContent, w: Math.round(r.width), sw: b.scrollWidth, cw: b.clientWidth, cut: b.scrollWidth > b.clientWidth + 1}; }));
  await p.screenshot({path: OUT + f + '-tools-names.png'});
  console.log(f, 'saved names', JSON.stringify(names), '\n', JSON.stringify(rows));
  const src = rows.filter(r => !/^(Neu|Tauschen)$/.test(r.text));
  check(f + ' copy-source labels fit (name + T1/T2 readable)', src.every(r => !r.cut), src.filter(r => r.cut).map(r => r.text + ' (' + r.cw + '/' + r.sw + ' px)'));
  await T.br.close();
}
done();
