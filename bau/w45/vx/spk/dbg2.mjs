import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch(); const p = await b.newPage();
p.on('requestfailed', r => console.log('fail', r.url())); p.on('response', r => { if (r.status() >= 400) console.log('resp', r.status(), r.url()); });
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(2500);
console.log(await p.evaluate(async () => {
  const x = new Float32Array(48000); for (let i = 0; i < x.length; i++) x[i] = Math.sin(i / 10);
  const r = await __spk.load({name: 'a', sr: 48000, ch: [x]});
  await __spk.mask({von: 'orig', nach: 'neu', sel: {art: 'freq', f0: 0, f1: 500}});
  __spk.link();
  let a; try { a = await __spk.zipAdd(); } catch (e) { a = 'ERR ' + e.message; }
  let ex; try { ex = await SYNQUENZER.spk1.remove(r.meta.id); } catch (e) { ex = 'ERR ' + e.message; }
  let o; try { o = await __spk.open(r.meta.id); o = 'opened'; } catch (e) { o = 'ERR ' + e.message; }
  return JSON.stringify({a, ex, o, spk: S.spk});
}));
await b.close();
