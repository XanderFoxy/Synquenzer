import { openVp, SETUP } from './v3-v2e-lib.mjs';
for (const vp of ['P1','P2','P3','L1','L2']) {
  const {b, p} = await openVp(vp);
  await p.evaluate(SETUP(false)); await p.waitForTimeout(200);
  const r = await p.evaluate(() => { drgSpring(true); const c = document.querySelector('.corner.sw'); const l = c.querySelector('.swl'); const o = [c.textContent, c.scrollHeight, c.clientHeight, l.scrollWidth, c.clientWidth]; drgSpring(false); o.push(c.textContent); return o; });
  console.log(vp, JSON.stringify(r)); await p.screenshot({path: 'v3-v2e2b-spring-' + vp + '.png', clip: {x: 0, y: 0, width: 200, height: 120}}).catch(()=>{}); await b.close();
}
