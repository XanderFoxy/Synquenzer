// I2-47 Füllhöhe: Pixeltest (DPR 3), Notenname-Farbe nach Kasten-Mitte, Kontrast ≥ 4,5:1, Saum, Klaviatur-Taste der gewählten Note
const L = require('./lib.cjs');
const rows = [], ok = (id, c, txt) => rows.push({id, ok: !!c, txt});
(async () => {
  const b = await L.launch(); const p = await L.open(b, 'P1', {dpr: 3});
  const vs = [.5, .05, .3, .55, .8, 1];
  await L.rollWith(p, vs.map((v, i) => ({t: 0, n: 60 + 2 * i, v, d: 1})));
  await p.waitForTimeout(300);
  await p.evaluate(() => { ED.roll.centerOn(65); });
  // Spion auf fillText/strokeText der Noten-Leinwand
  await p.evaluate(() => { const x = ED.roll.el.main.getContext('2d'); window.__TX = []; const f = x.fillText.bind(x), s = x.strokeText.bind(x);
    x.fillText = (t, a, b2) => { __TX.push({k: 'f', t, a, b: b2, c: x.fillStyle}); return f(t, a, b2); }; x.strokeText = (t, a, b2) => { __TX.push({k: 's', t, a, b: b2, c: x.strokeStyle, w: x.lineWidth}); return s(t, a, b2); }; });
  await p.evaluate(() => ED.roll.render()); await p.waitForTimeout(300);
  const res = await p.evaluate(vs => {
    const cv = ED.roll.el.main, d = cv.width / cv.getBoundingClientRect().width, g = cv.getContext('2d');
    const col = getComputedStyle(document.documentElement).getPropertyValue('--t2').trim();
    const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const C = hex(col);
    const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
    const cr = (a, b) => { const A = lum(a), B = lum(b); return (Math.max(A, B) + .05) / (Math.min(A, B) + .05); };
    const out = [];
    vs.forEach((v, i) => {
      const I = ED.roll._vel2(i); if (!I) { out.push(null); return; }
      const fw = 1.5, top = I.by + fw, bot = I.by + I.bh - fw, ih = bot - top;
      // Spalte in der Notenmitte rechts vom Namen (kein Glyph): Anteil der Füllfarbe je Geräte-Pixel
      const xc = Math.round((I.bx + I.bw * .75) * d), y0 = Math.floor(top * d), y1 = Math.ceil(bot * d);
      const px = g.getImageData(xc, y0, 1, y1 - y0).data;
      const bgRow = [px[0], px[1], px[2]];               // oberste Innenreihe = 18 %-Fläche (v < 1)
      let filled = 0;
      for (let k = 0; k < y1 - y0; k++) {
        const yy = (y0 + k) / d, cover = Math.max(0, Math.min(1, (y0 + k + 1) / d - top) * d, Math.min(1, bot * d - (y0 + k)));
        const c = [px[4 * k], px[4 * k + 1], px[4 * k + 2]], ref = v >= 1 ? [27, 31, 37] : bgRow;
        let fr = 0, n = 0; for (let j = 0; j < 3; j++) if (Math.abs(C[j] - ref[j]) > 20) { fr += (c[j] - ref[j]) / (C[j] - ref[j]); n++; }
        fr = n ? Math.max(0, Math.min(1, fr / n)) : 1;
        if (yy + 1 / d > top && yy < bot) filled += fr * Math.min(1, cover) / d;
      }
      // Name: Spion-Einträge für diese Note
      const nm = I.name, txt = nm ? __TX.filter(e => Math.abs(e.a - (I.bx + 4.5)) < .01 && Math.abs(e.b - (I.by - 1.5 + (I.bh + 3) / 2 + 3.5)) < .01) : [];
      const fE = txt.find(e => e.k === 'f'), sE = txt.find(e => e.k === 's');
      let bgUnder = null, contrast = null;
      if (nm) { const yy = Math.round(nm.mid * d), xx = Math.round((nm.x1 + 4) * d); const q = g.getImageData(xx, yy, 1, 1).data; bgUnder = [q[0], q[1], q[2]]; contrast = cr(hex(fE ? fE.c : '#ffffff'), bgUnder); }
      out.push({v, ih, want: Math.max(2, ih * v), filled: +filled.toFixed(2), fy: I.fy, mid: nm && nm.mid, inFill: nm && nm.inFill, fill: fE && fE.c, halo: sE && sE.c, haloW: sE && sE.w, contrast: contrast && +contrast.toFixed(2), bgUnder});
    });
    return out;
  }, vs);
  for (const r of res) console.log(JSON.stringify(r));
  const r5 = res[0]; ok('I2-47', Math.abs(r5.filled - r5.ih * .5) <= 1, `v 0,5 → gefüllt ${r5.filled} px von Innenhöhe ${r5.ih} (Soll ${r5.ih / 2} ± 1)`);
  const r05 = res[1]; ok('I2-47', r05.filled >= 2 - .25, `v 0,05 → gefüllt ${r05.filled} px (Soll ≥ 2)`);
  for (const r of [res[2], res[0], res[3], res[4]]) {
    const rule = r.mid >= r.fy, wantFg = rule ? '#0a0b0d' : '#ffffff', wantHalo = rule ? '#ffffff' : '#0a0b0d';
    ok('I2-47', r.inFill === rule && r.fill === wantFg && r.halo === wantHalo && r.haloW === 2 && r.contrast >= 4.5,
      `Füllung ${Math.round(r.v * 100)} %: Kasten-Mitte ${r.mid.toFixed(2)} ${rule ? '≥' : '<'} Füllkante ${r.fy.toFixed(2)} → Schrift ${r.fill}, Saum ${r.halo} (1 px), Kontrast ${r.contrast}:1 gegen ${JSON.stringify(r.bgUnder)}; gefüllt ${r.filled}/${r.ih} px`);
  }
  // Klaviatur: gewählte Note (v 0,8, D#? = Index 4) → ihre Taste zeigt dieselbe Füllhöhe; ungewählt: keine
  await p.evaluate(() => { ED.roll.selectIdx([4]); }); await p.waitForTimeout(250);
  const k = await p.evaluate(() => {
    const cv = ED.roll.el.keys, d = cv.width / cv.getBoundingClientRect().width, g = cv.getContext('2d'), nt = ED.roll.selection[0], R = ED.roll._keyRow(nt.n);
    const col = getComputedStyle(document.documentElement).getPropertyValue('--t2').trim(), C = [1, 3, 5].map(i => parseInt(col.slice(i, i + 2), 16));
    const meas = (n) => { const R2 = ED.roll._keyRow(n), top = R2.y + 1.5, bot = R2.y + R2.h - 1.5, xc = Math.round((R2.w - 4) * d);
      const y0 = Math.floor(top * d), y1 = Math.ceil(bot * d), px = g.getImageData(xc, y0, 1, y1 - y0).data; let f = 0;
      for (let q = 0; q < y1 - y0; q++) { const c = [px[4 * q], px[4 * q + 1], px[4 * q + 2]]; if (Math.abs(c[0] - C[0]) < 12 && Math.abs(c[1] - C[1]) < 12 && Math.abs(c[2] - C[2]) < 12) f++; }
      return {filled: f / d, ih: bot - top}; };
    return {v: nt.v, n: nt.n, sel: meas(nt.n), other: meas(nt.n - 2)};
  });
  ok('I2-47', Math.abs(k.sel.filled - k.sel.ih * k.v) <= 1 && k.other.filled < .5, `Taste der gewählten Note (v ${k.v}): gefüllt ${k.sel.filled.toFixed(2)} von ${k.sel.ih} px (Soll ${(k.sel.ih * k.v).toFixed(2)} ± 1); Nachbartaste ungewählt ${k.other.filled} px`);
  await p.screenshot({path: require('path').join(__dirname, 'out-i2-47.png'), clip: {x: 0, y: 140, width: 390, height: 330}});
  ok('I2-47', !p.errs.length, 'Konsolenfehler: ' + p.errs.length);
  await b.close(); process.exitCode = L.report('I2-47', rows) ? 1 : 0;
})();
