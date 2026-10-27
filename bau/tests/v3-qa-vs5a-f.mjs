// QA VS5a F: overlay closing paths of the marks editor compared with the quantize sheet (song view, ≡ menu, Stop, mode bar)
import {launch, open5, sleep, clicks, toI16, QOUT} from './v3-qa-vs5a-h2.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null);
const H = await open5(br, {touch: true, mobile: true}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(clicks([0.5, 0.77, 1.02, 1.24], 3)));
await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
await p.evaluate(id => SYNQUENZER.setClip(5, 0, {len: 2, notes: [{t: 0.05, d: 0.4, n: 60, v: 0.8}], take: id}), r.id);
await sleep(2500);
const state = () => p.evaluate(() => ({wp: document.getElementById('wpSheet').classList.contains('open'), q: document.getElementById('qSheet').classList.contains('open'), song: SYNQUENZER.runtime().song.view}));
const paths = [
  ['song view (.corner)', async () => { await (await p.$('.corner')).tap(); }, async () => { await p.evaluate(() => SYNQUENZER.songView(false)); }],
  ['≡ menu', async () => { await (await p.$('#bMenu, button[aria-label*="Menü"], .menu-btn')).tap(); }, async () => { await p.keyboard.press('Escape'); await p.evaluate(() => { const m = document.getElementById('menu'); if (m) m.classList.remove('open'); }); }],
  ['mode › (SINGEN/TRANSP.)', async () => { const b = await p.$('#modebar button:last-child, #mNext'); if (b) await b.tap(); }, async () => {}],
];
for (const [nm, act, back] of paths) {
  for (const which of ['wp', 'q']) {
    if (which === 'wp') await p.evaluate(() => SYNQUENZER.wpOpen({t: SYNQUENZER.tkInfo().stimme, s: 0})); else await p.evaluate(() => SYNQUENZER.openQuant(5, 0));
    await sleep(300);
    const s0 = await state();
    try { await act(); } catch (e) { console.log('  (path not found: ' + e.message.slice(0, 60) + ')'); }
    await sleep(400);
    const s1 = await state();
    console.log(nm, which === 'wp' ? 'marks editor' : 'quantize sheet', 'open before', s0[which], '→ after', s1[which], JSON.stringify(s1));
    await p.evaluate(() => { SYNQUENZER.wpClose(); SYNQUENZER.closeQuant(false); });
    await back(); await sleep(300);
  }
}
await p.screenshot({path: QOUT + '/f-last.png'});
await br.close();
