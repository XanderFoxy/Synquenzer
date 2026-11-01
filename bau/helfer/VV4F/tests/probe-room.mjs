import { open, SONG8 } from './lib.mjs';
for (const [w, h] of [[428, 926], [926, 428], [390, 844], [844, 390], [375, 667], [667, 375], [320, 568]]) {
  const {b, p} = await open({w, h});
  const m = await p.evaluate(() => { const c = UI.cnw.getBoundingClientRect(), cn = UI.corner.getBoundingClientRect(); const T = e => { const R = document.createRange(); R.selectNodeContents(e); return R.getBoundingClientRect(); };
    const sw = T(UI.corner.querySelector('.swl')), lg = UI.corner.querySelector('.clogo'); const lr = lg && lg.offsetParent ? lg.getBoundingClientRect() : null;
    const th = UI.heads[0].el.getBoundingClientRect(), nm = T(UI.heads[0].nm);
    return {cnH: Math.round(cn.height), cnW: Math.round(cn.width), swlL: +(sw.left - c.left).toFixed(1), swlB: +(cn.bottom - sw.bottom).toFixed(1), swlT: +(sw.top - cn.top).toFixed(1), logo: lr ? [+(lr.left - c.left).toFixed(1), +(lr.top - cn.top).toFixed(1), +(cn.bottom - lr.bottom).toFixed(1)] : null, thNmL: +(nm.left - th.left).toFixed(1)}; });
  await p.evaluate(s => SYNQUENZER.setSong(s), SONG8); await p.evaluate(() => setSongView(true)); await p.waitForTimeout(300);
  const s = await p.evaluate(() => { const T = e => { const R = document.createRange(); R.selectNodeContents(e); return R.getBoundingClientRect(); }; const o = [];
    for (const d of SV.labs.querySelectorAll('.sv-l.trk:not(.blank)')) { const r = d.getBoundingClientRect(), t = T(d.children[1]); o.push([Math.round(r.height), +(r.right - t.right).toFixed(1), +(r.bottom - t.bottom).toFixed(1), +(t.left - r.left).toFixed(1)]); }
    const lr = SV.labs.querySelector('.sv-lr'), R0 = lr.getBoundingClientRect(), tl = T(lr.querySelector('.lbl'));
    return {rows: o, lr: [Math.round(R0.width), Math.round(R0.height), +(tl.right - R0.left).toFixed(1)]}; });
  console.log(w + 'x' + h, JSON.stringify(m), JSON.stringify(s));
  await b.close();
}
