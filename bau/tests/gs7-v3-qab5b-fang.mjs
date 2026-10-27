// QA VS5a regression 2: FANG of freely played chords (touch #bFang) → part, MS 2000 sound level, portrait + landscape screens, console
import {launch, open5, sleep, QOUT} from './gs7-v3-qa-vs5a-h2.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null);
const H = await open5(br, Object.assign({touch: true, mobile: true}, process.argv[2] ? {url: 'file://' + process.argv[2]} : {})), p = H.p;
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
const tapText = async (sel, re) => { const els = await p.$$(sel); for (const e of els) { const t = await e.textContent(); if (re.test(t)) { await e.tap(); return true; } } return false; };
await tapText('button.scn', /^▶\s*1/); await p.waitForFunction(() => SYNQUENZER.runtime().playing);
const ab = () => p.evaluate(() => audBeat());
const chords = [57, 53, 48, 55, 57, 53, 48, 55]; let b0 = Math.ceil((await ab()) / 4) * 4 + 4;
for (let k = 0; k < chords.length; k++) { await p.waitForFunction(b => audBeat() >= b, b0 + 4 * k + 0.05, {timeout: 60000, polling: 5}); await p.evaluate(n => { SYNQUENZER.keyOn(n, .8, 'c'); setTimeout(() => SYNQUENZER.keyOff(0, 'c'), 120); }, chords[k]); }
await p.waitForFunction(b => audBeat() >= b, b0 + 32.3, {timeout: 60000, polling: 5});
await (await p.$('#bFang')).tap(); await sleep(200);
const fp = await p.evaluate(() => SYNQUENZER.fangPart());
console.log('beat', await ab()); ok(fp && fp.len >= 2, 'FANG after 8 bars of chords → part sheet: ' + JSON.stringify(fp && {len: fp.len, name: fp.suggest && fp.suggest.name, clips: fp.clips}));
await p.screenshot({path: QOUT + '/reg2-fang-P1.png'});
await p.evaluate(() => SYNQUENZER.fangAccept('part')); await sleep(300);
ok((await p.evaluate(() => SYNQUENZER.parts().filter(Boolean).length)) >= 1, 'FANG accepted → part on the Teil-Leiste');
await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
for (const [nm, w, h] of [['P1', 390, 844], ['L1', 844, 390], ['P3', 320, 568], ['L2', 667, 375]]) {
  await p.setViewportSize({width: w, height: h}); await sleep(500);
  const L = await p.evaluate(() => { const cut = []; for (const b of document.querySelectorAll('#top button, #modebar button, .scn')) { const q = b.getBoundingClientRect(); if (q.width && b.scrollWidth > b.clientWidth + 1) cut.push((b.textContent || '').trim().slice(0, 12) + ' ' + b.scrollWidth + '>' + b.clientWidth); }
    return {sw: document.scrollingElement.scrollWidth, sh: document.scrollingElement.scrollHeight, cw: innerWidth, ch: innerHeight, cut}; });
  await p.screenshot({path: QOUT + `/reg2-${nm}.png`});
  ok(L.sw <= L.cw && L.sh <= L.ch && !L.cut.length, nm + ' layout intact ' + JSON.stringify(L));
}
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
