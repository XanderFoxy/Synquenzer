import { chromium } from 'playwright';
import { EXE } from './v3-vs2-h.mjs';
const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
const p = await (await br.newContext()).newPage();
p.on('console', m => console.log('CON', m.type(), m.text().slice(0, 300)));
await p.goto('file:///tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/index.html');
await p.waitForTimeout(1000);
console.log(await p.evaluate(async () => { const c = new AudioContext(); const u = URL.createObjectURL(new Blob([ST_WK], {type: 'application/javascript'})); try { await c.audioWorklet.addModule(u); const n = new AudioWorkletNode(c, 'synq-stimme', {numberOfInputs: 2, processorOptions: {block: 4096, mpm: {src: 'voice', lock: false, bl: 0.1, bb: 0.02, lat: 30}}}); return 'ok'; } catch (e) { return 'ERR ' + e; } }));
await br.close();
