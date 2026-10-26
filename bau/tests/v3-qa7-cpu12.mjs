import * as Q from './v3-qa7-lib.mjs';
const PRE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/G-MK34-merge.html';
const br = await Q.launch();
const A = await Q.openApp(br), B = await Q.openApp(br, {file: PRE});
const setup = async page => page.evaluate(() => {
  window.__time = async (snd, nv, sec, nodes) => {
    const SR = 48000, oc = new OfflineAudioContext(2, sec * SR, SR), el = document.getElementById('sq-worklet-src');
    await oc.audioWorklet.addModule('data:application/javascript;base64,' + btoa(el.textContent));
    const s = SQStore.normalizeSound(snd);
    for (let k = 0; k < nodes; k++) { const E = SynthHost.track(oc, oc.destination, wkFlat(s), wkMods(s), null, s.engine === 'mk' ? s.p.mk : null); E.tempo(120, null); for (let i = 0; i < nv; i++) E.on(i + 1, 48 + 7 * i, .8, 0); E.flush(); }
    await new Promise(r => setTimeout(r, 30));
    const t0 = performance.now(); await oc.startRendering(); return performance.now() - t0;
  };
});
await setup(A.page); await setup(B.page);
const snd = await A.page.evaluate(() => SYNQUENZER.getSound(0));
const res = {A0: [], B0: [], A1: [], B1: [], A2: [], B2: []};
for (let r = 0; r < 7; r++) for (const [k, P] of [['A', A.page], ['B', B.page]]) {
  res[k + '0'].push(await P.evaluate(s => __time(s, 0, 30, 8), snd));
  res[k + '1'].push(await P.evaluate(s => __time(s, 1, 30, 8), snd));
  res[k + '2'].push(await P.evaluate(s => __time(s, 2, 30, 8), snd));
}
const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
const m = Object.fromEntries(Object.entries(res).map(([k, v]) => [k, med(v)]));
console.log(JSON.stringify(Object.fromEntries(Object.entries(res).map(([k, v]) => [k, v.map(x => +x.toFixed(0))]))));
const voice = ((m.A2 - m.A1) + (m.B2 - m.B1)) / 2;   // 8 nodes x 1 voice
console.log('median ms (8 nodes, 30 s):', JSON.stringify(m), 'VA voice x8 =', voice.toFixed(1));
console.log('idle nodes (0 voices): MK7 - pre =', (m.A0 - m.B0).toFixed(1), 'ms =', ((m.A0 - m.B0) / voice).toFixed(3), '× VA voice per node');
console.log('1 voice nodes: MK7 - pre =', (m.A1 - m.B1).toFixed(1), 'ms =', ((m.A1 - m.B1) / voice).toFixed(3), '× VA voice per node');
await br.close();
