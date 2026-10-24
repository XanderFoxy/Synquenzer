// QA group: are there whole render quanta of exact silence at the master output (AU.M.ceil) while music plays?
// 2-input recorder: in0 = app master, in1 = a test sine (control). Missing frames (no message) are counted separately.
import {open, OUT, check, done} from './v3-qa-grp-lib.mjs';
import {micOn} from './v3-vs2-h.mjs';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SECS = +(process.argv[2] || 60), what = process.argv[3] || 'demo', micMode = process.argv[4] || 'nomic';
const {br, p, errs, E} = await open({mic: micMode !== 'nomic'});
if (what === 'song') { const proj = JSON.parse(fs.readFileSync(OUT + 'flow4-project.json', 'utf8')); await E(pj => SYNQUENZER.importJSON(JSON.stringify({app: 'SYNQUENZER', kind: 'project', format: 4, project: pj})), proj); await sleep(400); }
await E(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
if (micMode !== 'nomic') { await micOn(p, 'wired'); await E(() => SYNQUENZER.stop()); await sleep(1300); }
else { await E(() => { SYNQUENZER.play(); }); await sleep(300); await E(() => SYNQUENZER.stop()); await sleep(1300); }
await E(async () => {
  const c = AU.ctx;
  const src = `class R extends AudioWorkletProcessor{process(i){const a=i[0]&&i[0][0],b=i[1]&&i[1][0];let za=1,zb=1;if(a)for(let k=0;k<a.length;k++)if(a[k]!==0){za=0;break;}if(b)for(let k=0;k<b.length;k++)if(b[k]!==0){zb=0;break;}let ea=0;if(a)for(let k=0;k<a.length;k++)ea+=a[k]*a[k];this.port.postMessage({f:currentFrame,za:a?za:2,zb:b?zb:2,ea});return true;}}registerProcessor('qa-z',R);`;
  await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
  const n = new AudioWorkletNode(c, 'qa-z', {numberOfInputs: 2, numberOfOutputs: 1});
  const osc = c.createOscillator(); osc.frequency.value = 440; const og = c.createGain(); og.gain.value = 0.001; osc.connect(og); og.connect(n, 0, 1); osc.start();
  AU.M.ceil.connect(n, 0, 0); const g = c.createGain(); g.gain.value = 0; n.connect(g); g.connect(c.destination);
  const Z = window.__z = {last: null, miss: 0, n: 0, zA: [], zB: 0, noA: 0, hist: []};
  n.port.onmessage = e => { const d = e.data; Z.n++; if (Z.last != null && d.f !== Z.last + 128) Z.miss += (d.f - Z.last) / 128 - 1; Z.last = d.f;
    Z.hist.push(d.ea); if (Z.hist.length > 8) Z.hist.shift();
    if (d.za === 2) Z.noA++;
    if (d.za === 1) { const pre = Z.hist.slice(0, -1).reduce((s, v) => s + v, 0) / Math.max(1, Z.hist.length - 1) / 128; if (pre > 1e-5 && R.playing) Z.zA.push({t: +(d.f / c.sampleRate).toFixed(4), b: +t2b(d.f / c.sampleRate).toFixed(2), pre: +(10 * Math.log10(pre)).toFixed(1)}); }
    if (d.zb === 1) Z.zB++; };
  return 1;
});
if (what === 'song') await E(() => { SYNQUENZER.songLoop(true); SYNQUENZER.songPlay(0); });
else await E(() => SYNQUENZER.launchScene(0));
await sleep(SECS * 1000);
const Z = await E(() => { const Z = window.__z; return {n: Z.n, miss: Z.miss, zA: Z.zA, zB: Z.zB, noA: Z.noA, load: SYNQUENZER.engineInfo().load, how: SYNQUENZER.engineInfo().synth}; });
console.log(what, micMode, 'quanta', Z.n, 'missing msgs', Z.miss, 'control sine zero quanta', Z.zB, 'no-input quanta', Z.noA, 'engine', Z.how, 'load', Z.load);
console.log('master exact-zero quanta while playing (sound before):', Z.zA.length, JSON.stringify(Z.zA.slice(0, 15)));
check(`${what}/${micMode}: no whole render quantum of digital silence in the master output while playing`, Z.zA.length === 0, Z.zA.length);
await E(() => SYNQUENZER.stop()); await br.close(); done();
