// QA G-MK6: SEQ pops (tools SHIFT + 5, ZIEL list, AUFLÖSUNG list) in small formats: inside the screen, targets >= 44, list scrolls
import {open, sleep, OUT, check, done} from './v3-qa-gmk6-tl.mjs';
const FM = {P3: [320, 568], L2: [667, 375], P1: [390, 844], L1: [844, 390]};
for (const f in FM) {
  const T = await open({viewport: {width: FM[f][0], height: FM[f][1]}}); const {p, E, errs} = T;
  await T.openEd(2); await T.toMk();
  // 6 own MS 2000 sounds in the library, so the copy list is long
  await E(async () => { for (let k = 0; k < 6; k++) await SYNQUENZER.saveSound(2, 'Seq Sound ' + (k + 1), 'new'); });
  await E(() => { MKUI.setWahl(2, 10); }); await sleep(400);
  const meas = () => E(() => { const p = document.querySelector('#popLayer .pop'); if (!p) return null; const r = p.getBoundingClientRect(); const L = p.querySelector('.plist'); const bs = [...p.querySelectorAll('button')].filter(b => b.offsetWidth); const vis = bs.filter(b => { const q = b.getBoundingClientRect(); const lr = L ? L.getBoundingClientRect() : r; return q.bottom > lr.top && q.top < lr.bottom; });
    return {pop: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], inside: r.left >= -.5 && r.top >= -.5 && r.right <= innerWidth + .5 && r.bottom <= innerHeight + .5, n: bs.length, minW: Math.min(...bs.map(b => b.getBoundingClientRect().width)), minH: Math.min(...bs.map(b => b.getBoundingClientRect().height)), scrolls: L ? L.scrollHeight > L.clientHeight + 1 : false, over: L ? [...L.querySelectorAll('*')].filter(e => !e.children.length && e.scrollWidth > e.clientWidth + 1).map(e => e.textContent).slice(0, 3) : []}; });
  const show = async k => { if (await T.mk(k)) return true; const tabs = await E(() => [...document.querySelectorAll('#synthSheet button, #synthSheet .tab')].filter(b => b.offsetWidth && /^(LINKS|RECHTS)$/.test(b.textContent.trim())).map(b => b.textContent.trim())); for (const t of tabs) { await T.tapTxt('#synthSheet button, #synthSheet .tab', new RegExp('^' + t + '$')); await sleep(400); if (await T.mk(k)) return true; } return false; };
  console.log(f, 'half', JSON.stringify((await T.panel()).half));
  await show('n4'); await T.tapMk('shift', 250); await show('n4'); await T.tapMk('n4', 500); const a = await meas(); await p.screenshot({path: OUT + f + '-tools.png'}); await T.closePop(); await sleep(700);
  await show('k2'); await T.tapMk('k2', 500); const b = await meas(); await p.screenshot({path: OUT + f + '-ziel.png'}); await T.closePop(); await sleep(700);
  await show('shift'); await T.tapMk('shift', 250); await show('k3'); await T.tapMk('k3', 500); const c = await meas(); await T.closePop(); await sleep(300);
  console.log(f, 'tools', JSON.stringify(a), '\n   ziel', JSON.stringify(b), '\n   aufl', JSON.stringify(c));
  const okp = x => x && x.inside && x.minH >= 43.5 && x.minW >= 43.5 && !x.over.length;
  check(f + ' SEQ pops inside the screen, buttons ≥ 44 px, no text overflow', okp(a) && okp(b) && okp(c), {tools: a, ziel: b, aufl: c});
  check(f + ' no console errors', !errs.length, errs);
  await T.br.close();
}
done();
