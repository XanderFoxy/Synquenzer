// QA MK7: what the worklet input looks like in Chromium when nothing / a silent source / a merger with one channel is connected
import { chromium } from 'playwright';
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const p = await (await br.newContext()).newPage(); await p.goto('file://' + new URL('./v3-qa-mk7-blank.html', import.meta.url).pathname);
const r = await p.evaluate(async () => {
  const src = `class P extends AudioWorkletProcessor { constructor() { super(); this.n = 0; this.seen = {}; } process(inp) { const k = inp[0].length; this.seen[k] = (this.seen[k] || 0) + 1; if (++this.n % 50 === 0) this.port.postMessage(this.seen); return true; } } registerProcessor('p', P);`;
  const oc = new OfflineAudioContext(2, 48000, 48000); await oc.audioWorklet.addModule('data:application/javascript,' + encodeURIComponent(src));
  const mk = () => new AudioWorkletNode(oc, 'p', {numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2], channelCount: 2, channelCountMode: 'explicit', channelInterpretation: 'discrete'});
  const a = mk(), b = mk(), c = mk(); const res = {};
  a.port.onmessage = e => res.unconnected = e.data; b.port.onmessage = e => res.mergerOneSilentSource = e.data; c.port.onmessage = e => res.mergerNoSource = e.data;
  a.connect(oc.destination); b.connect(oc.destination); c.connect(oc.destination);
  const m = oc.createChannelMerger(2), g = oc.createGain(); g.connect(m, 0, 1); m.connect(b); const cs = oc.createConstantSource(); cs.offset.value = 0; cs.connect(g); cs.start();
  const m2 = oc.createChannelMerger(2); m2.connect(c);
  await oc.startRendering(); await new Promise(r => setTimeout(r, 200)); return res;
});
console.log(JSON.stringify(r)); await br.close();
