import { open, SONG8 } from './lib.mjs';
const {b, p} = await open({w: 428, h: 926});
await p.evaluate(s => SYNQUENZER.setSong(s), SONG8);
await p.evaluate(() => { const el = document.getElementById('sq-worklet-src'); window._wsrc = el.textContent;
  el.textContent = '(function(){var s=12345;Math.random=function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};})();\n' + window._wsrc;
  window._seed = () => { let s = 777; Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }; });
const run = (mode, k) => p.evaluate(async ([mode, k]) => {
  window._seed(); const sr = AU.ctx.sampleRate, oc = new OfflineAudioContext(2, Math.round(sr * 3), sr);
  await vvAddModule(oc); const off = {oc, sv: null}; VV.noMtr = true; VV.off = off; UI.vvOff = true;
  try {
    await vvSwapIn(oc, mode !== 'nowk', off);
    for (let i = 0; i < NT(); i++) {
      if (mode === 'nosend') { AU.tracks[i].revSend.gain.value = 0; AU.tracks[i].dlySend.gain.value = 0; AU.tracks[i].revSend.disconnect(); AU.tracks[i].dlySend.disconnect(); }
      const o = oc.createOscillator(), g = oc.createGain(); o.frequency.value = 55 * (i + 2); g.gain.value = .5; o.connect(g); g.connect(AU.tracks[i].trackIn); o.start(0);
    }
    if (mode === 'nosynth') for (const E of AU.synth) if (E) E.node.disconnect();
    const out = await oc.startRendering(); window['_p' + k] = out; return true;
  } finally { if (off.sv) vvSwapOut(off.sv); UI.vvOff = false; VV.off = null; VV.noMtr = false; }
}, [mode, k]);
for (const mode of ['all', 'nosend', 'nosynth', 'nowk']) {
  await run(mode, 0); await run(mode, 1); await run(mode, 2);
  const d = await p.evaluate(() => { const r = []; for (const [a, b] of [[0, 1], [1, 2]]) { const A = window['_p' + a].getChannelData(0), B = window['_p' + b].getChannelData(0); let f = -1, mx = 0; for (let k = 0; k < A.length; k++) { const x = Math.abs(A[k] - B[k]); if (x > 0 && f < 0) f = k; if (x > mx) mx = x; } r.push({first: f < 0 ? null : +(f / 48000).toFixed(4), db: mx ? Math.round(20 * Math.log10(mx)) : null}); } return r; });
  console.log(mode, JSON.stringify(d));
}
await b.close();
