import { openVp, SETUP } from './v3-v2e-lib.mjs';
for (const vp of ['P1','P2','P3','L1','L2']) {
  const {b, p} = await openVp(vp);
  await p.evaluate(SETUP(false)); await p.waitForTimeout(200);
  const r = await p.evaluate(() => { const c = document.querySelector('.corner.sw'); const r = c.getBoundingClientRect(); return [r.width, r.height, c.clientWidth, c.clientHeight, c.className, c.parentElement.className, c.textContent]; });
  console.log(vp, JSON.stringify(r)); await b.close();
}
