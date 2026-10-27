// QA VS5b: editor title width VS5a-fix vs VS5b (P1, P3, L1)
import {launch, open5, sleep, toI16, clickTone} from './v3-vs5b-h.mjs';
const br = await launch(null);
const x = clickTone([0.55, 0.8, 1.05], 2.0, {toneFrom: 0.2});
for (const f of ['/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/VS5a-fix.html', '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-br-VS5/index.html'])
  for (const [n, w, h] of [['P1', 390, 844], ['P3', 320, 568], ['L1', 844, 390]]) {
    const H = await open5(br, {touch: true, viewport: {width: w, height: h}, url: 'file://' + f}), p = H.p;
    await p.evaluate(() => { SYNQUENZER.newProject(); }); await sleep(200);
    const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x));
    await p.evaluate(r => SYNQUENZER.wpOpen({t: r.track, s: 1}), r); await sleep(400);
    const t = await p.evaluate(() => { const b = document.querySelector('#wpSheet .qh b'); return b.textContent + ' sw ' + b.scrollWidth + ' cw ' + b.clientWidth + ' head ' + [...document.querySelectorAll('#wpSheet .qh button')].map(x => x.textContent + ':' + Math.round(x.getBoundingClientRect().width) + 'x' + Math.round(x.getBoundingClientRect().height)).join(' '); });
    console.log(f.split('/').pop(), n, t);
    await H.ctx.close();
  }
await br.close();
