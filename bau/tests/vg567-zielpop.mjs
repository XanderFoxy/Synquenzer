// vgmk567: open the value lists of ARP B ZIEL, PATCH 1 ZIEL and SEQ ZIEL by touch and print their rows. Usage: SYNQ_APP=<file> node vg567-zielpop.mjs P|L
import {open, sleep, check, done} from './vg567-gmk5-tl.mjs';
const L = process.argv[2] === 'L';
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
console.log('APP', await E(() => SYNQUENZER.version));
await T.openEd(2); console.log('toMk', await T.toMk()); await sleep(600);
const rows = async () => E(() => { const pp = document.querySelector('#popLayer .pop'); return pp ? {h: (pp.querySelector('h4') || {}).textContent, rows: [...pp.querySelectorAll('button')].filter(b => b.offsetWidth).map(b => b.innerText.replace(/\s+/g, ' ').trim())} : null; });
for (const [pos, k, nm] of [[/^\d+ ARP B/, 'k4', 'ARP B ZIEL'], [/^1 PATCH 1/, 'k1', 'PATCH 1 ZIEL'], [/^\d+ SEQ/, 'k2', 'SEQ ZIEL']]) {
  console.log('w2', nm, await T.w2(pos)); await sleep(400);
  await T.tapMk(k, 400); const r = await rows(); console.log(nm, JSON.stringify(r)); await p.screenshot({path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vgmk567/qa5/ziel-' + nm.replace(/ /g, '_') + (L ? '-L' : '-P') + '.png'});
  await T.closePop(); await sleep(400);
}
console.log('errs', JSON.stringify(errs));
await T.br.close();
