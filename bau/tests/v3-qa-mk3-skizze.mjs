import {launch, open, J} from './v3-qa-mk3-lib.mjs';
const Z = {HL: [0, 0, 10, 136], HR: [710, 0, 10, 136], Z1: [14, 0, 44, 44], Z2: [62, 0, 44, 44], Z3: [14, 46, 92, 44], Z4: [112, 0, 52, 44], Z5: [176, 0, 44, 44], Z6: [270, 0, 16, 44], Z7: [294, 0, 92, 44], Z8: [294, 46, 92, 44], Z9: [112, 46, 176, 44], Z10: [14, 92, 352, 44], Z11: [392, 0, 64, 136], Z12: [462, 0, 240, 44], Z13: [462, 46, 244, 90]};
const iou = (a, b) => { const x0 = Math.max(a[0], b[0]), y0 = Math.max(a[1], b[1]), x1 = Math.min(a[0] + a[2], b[0] + b[2]), y1 = Math.min(a[1] + a[3], b[1] + b[3]); const I = Math.max(0, x1 - x0) * Math.max(0, y1 - y0); return I / (a[2] * a[3] + b[2] * b[3] - I); };
const b = await launch();
for (const f of ['L1', 'L0']) for (const st of ['init', 'split-t2', 'solo', 'stimmung']) {
  const {ctx, page} = await open(f);
  if (st === 'split-t2') await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 2); MKUI.P.tim = 2; MKUI.setWahl(1, 0); });
  if (st === 'solo') await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 1); MKUI.P.tim = 3; MKUI.soloSet(1); MKUI.setWahl(1, 5); });
  if (st === 'stimmung') await page.evaluate(() => { SYNQUENZER.mkSet(0, 'scale', 9); MKUI.setWahl(2, 9); });
  await page.waitForTimeout(150);
  const pi = await page.evaluate(() => SYNQUENZER.mkPanel());
  const W = pi.body.w, H = pi.body.h; const worst = [];
  for (const z of pi.zones) { if (!Z[z.id]) continue; const r = [z.x / W * 720, z.y / H * 136, z.w / W * 720, z.h / H * 136]; worst.push([z.id, +iou(r, Z[z.id]).toFixed(3)]); }
  worst.sort((a, c) => a[1] - c[1]);
  console.log(f, st.padEnd(9), 'body', Math.round(W) + '×' + Math.round(H), 'kleinste IoU', J(worst.slice(0, 3)), worst.every(x => x[1] >= .7) ? 'ok' : 'UNTER 0,7');
  await ctx.close();
}
await b.close();
