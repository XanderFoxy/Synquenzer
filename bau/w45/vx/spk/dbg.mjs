import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(2500);
console.log(await p.evaluate(async () => {
  const src = vsDspMake.toString() + ';' + spk1DspMake.toString() + ';const K = spk1DspMake(vsDspMake());onmessage = e => K.on(e.data, (m, tr) => postMessage(m, tr || []));';
  try { new Function(src); } catch (e) { return 'syntax ' + e.message; }
  const u = URL.createObjectURL(new Blob([src], {type: 'application/javascript'}));
  return await new Promise(r => { const w = new Worker(u); w.onerror = e => r('err ' + e.message + ' ' + e.lineno); w.onmessage = e => r(JSON.stringify(e.data).slice(0, 200)); w.postMessage({op: 'list', qid: 1}); });
}));
await b.close();
