// MK-P-11 Aussehen, gemessen am Bildschirmfoto (Pixel) und an den berechneten Farben: Platte (Farbton, Sättigung, Helligkeit,
// Bürstung), Druck, inverse Felder (Zahl = Tabelle), Kappen, Mittelmarken, Tasten, LEDs, Anzeige; keine Holzwangen. L1 und ein Halt.
import {launch, open} from './v3-mkp-lib.mjs';
const FILE = process.argv[2]; const fail = [], R = {}; const ok = (id, c, info) => { if (!c) fail.push(id + ': ' + info); };
const b = await launch(); const page = await open(b, FILE, 'L1', {dpr: 2});
await page.evaluate(() => { MKUI.view({ansicht: 'ganz'}); MKUI.press('oct.u'); MKUI.render(); for (const e of document.querySelectorAll('.lcd.mkql')) e.classList.remove('on'); }); await page.waitForTimeout(500);
const shot = await page.screenshot(); (await import('fs')).writeFileSync('v3-mkp-shots/aussehen-L1.png', shot);
const an = await b.newPage();
const px = await an.evaluate(async src => { const i = new Image(); await new Promise(r => { i.onload = r; i.src = src; }); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); window.__D = g.getImageData(0, 0, c.width, c.height); return [c.width, c.height]; }, 'data:image/png;base64,' + shot.toString('base64'));
// regions in CSS px (from the app), measured on the screenshot (DPR 2)
const geo = await page.evaluate(() => { const P = SYNQUENZER.mkPanel(), fr = MKUI.P.el.fr.getBoundingClientRect(), T = MKUI.P.el.T, s = T.z / 1000, X = u => fr.left + T.tx + u * s, Y = u => fr.top + T.ty + u * s, PH = 1000 / 1.95;
  const el = id => P.elements.find(e => e.id === id);
  // free plate areas (hit = free, no print): the inside of OSCILLATOR 2 between the LEDs and WAVE, and of MIXER between the knobs
  const free = [[X(23.0 * 10 + 30), Y(19.5 / 100 * PH), 40 * s, 22 * s], [X(34.2 * 10), Y(32.5 / 100 * PH), 36 * s, 12 * s]];
  const caps = [...document.querySelectorAll('.mkpk .cap')].slice(0, 60).map(c => { const r = c.getBoundingClientRect(); return [[.72, .72], [.72, .3], [.3, .72]].map(([a, b]) => [r.left + r.width * a, r.top + r.height * b]); });   // three points of the cap body (the highlight at 38/32 and the pointer, which turns, can hit one of them: the median counts)
  const keys = [...document.querySelectorAll('.mkpb:not(.st):not(.grau):not(.dn)')].slice(0, 40).map(k => { const r = k.getBoundingClientRect(); return [r.left + r.width * .5, r.top + r.height * .62]; });   // the key face inside its inner line
  const lcd = document.querySelector('.mkplate .mkplcd'), lr = lcd.getBoundingClientRect();
  const cs = e => getComputedStyle(e), root = getComputedStyle(MKUI.P.el.fr);
  const inv = [...document.querySelectorAll('.mkplate .mkpt.inv')], invTab = MKUI.ELS.filter(e => e.i).length;
  const ink = cs(document.querySelector('.mkplate .mkpt:not(.inv)')).color, invC = inv.length ? [cs(inv[0]).color, cs(inv[0]).backgroundColor] : null;
  const leds = [...document.querySelectorAll('.mkplate .mkpl')], ledR = leds.every(l => /50%/.test(cs(l).borderRadius) || parseFloat(cs(l).borderRadius) >= Math.min(l.offsetWidth, l.offsetHeight) / 2 - .1);
  const on = [...document.querySelectorAll('.mkplate .mkpl.on, .mkplate .led.on')].map(l => cs(l).backgroundColor), gn = [...document.querySelectorAll('.mkplate .gn')].map(l => (l.closest('[data-k]') || l).dataset.k || l.className);
  const cm = MKUI.ELS.filter(e => e.o && e.o.cm).map(e => e.id).sort(), ns = MKUI.ELS.filter(e => e.o && e.o.ns).map(e => e.id);
  const ptr = [...document.querySelectorAll('.mkpk .cap i')].map(i => cs(i).backgroundColor), scales = document.querySelectorAll('.mkpk .sc').length, knobs = document.querySelectorAll('.mkpk').length;
  const scaleIds = [...document.querySelectorAll('.mkpk')].filter(k => !k.querySelector('.sc use, .sc line, .sc .fl, .sc path, .sc text')).map(k => k.dataset.k || k.dataset.id || '?');
  const wood = document.querySelectorAll('[class*="wood"], .mwood').length, lcdWrap = [...lcd.querySelectorAll('.ln')].map(l => [cs(l).whiteSpace, l.scrollWidth <= l.clientWidth + 1, l.textContent.length]);
  return {free, caps, keys, lcdBox: [lr.left + lr.width * .1, lr.top + lr.height * .08, lr.width * .8, lr.height * .06], ink, invC, invN: inv.length, invTab, ledR, on, gn, cm, ns, ptr: [...new Set(ptr)], scales, knobs, scaleIds,
    lcdFg: cs(lcd).color, lcdBg: cs(lcd).backgroundColor, varFg: root.getPropertyValue('--mkp-lcd-fg').trim(), varBg: root.getPropertyValue('--mkp-lcd-bg').trim(), wood, lcdWrap};
});
const stats = await an.evaluate(([g, dpr]) => {
  const D = window.__D, W = D.width, at = (x, y) => { const k = (Math.round(y * dpr) * W + Math.round(x * dpr)) * 4; return [D.data[k], D.data[k + 1], D.data[k + 2]]; };
  const hsl = ([r, g_, b]) => { r /= 255; g_ /= 255; b /= 255; const mx = Math.max(r, g_, b), mn = Math.min(r, g_, b), l = (mx + mn) / 2, d = mx - mn; let h = 0, s = 0; if (d) { s = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? 60 * (((g_ - b) / d) % 6) : mx === g_ ? 60 * ((b - r) / d + 2) : 60 * ((r - g_) / d + 4); } return [(h + 360) % 360, s * 100, l * 100]; };
  const lin = c => { c /= 255; return c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); }, Y = ([r, g_, b]) => .2126 * lin(r) + .7152 * lin(g_) + .0722 * lin(b);
  const Lstar = c => { const y = Y(c); return y > .008856 ? 116 * Math.cbrt(y) - 16 : 903.3 * y; };
  const area = ([x, y, w, h]) => { const A = []; for (let yy = y; yy < y + h; yy += .5) { const row = []; for (let xx = x; xx < x + w; xx += .5) row.push(at(xx, yy)); A.push(row); } return A; };
  const out = {plate: [], rows: []};
  for (const r of g.free) { const A = area(r); const all = A.flat(); const H = all.map(hsl); out.plate.push([H.reduce((s, x) => s + x[0], 0) / H.length, H.reduce((s, x) => s + x[1], 0) / H.length, H.reduce((s, x) => s + x[2], 0) / H.length]);
    const rl = A.map(row => row.map(hsl).reduce((s, x) => s + x[2], 0) / row.length), m = rl.reduce((s, x) => s + x, 0) / rl.length; out.rows.push(Math.sqrt(rl.reduce((s, x) => s + (x - m) ** 2, 0) / rl.length) / m * 100); }
  out.caps = g.caps.map(ps => { const v = ps.map(p => Lstar(at(...p))).sort((a, b) => a - b); return +v[1].toFixed(1); }); out.keys = g.keys.map(p => +hsl(at(...p))[2].toFixed(1));
  const L = area(g.lcdBox).flat().map(hsl); out.lcdPx = [L.reduce((s, x) => s + x[0], 0) / L.length, L.reduce((s, x) => s + x[2], 0) / L.length];
  return out;
}, [geo, 2]);
const parse = s => s.match(/[\d.]+/g).slice(0, 3).map(Number), lin = c => { c /= 255; return c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); }, lum = c => .2126 * lin(c[0]) + .7152 * lin(c[1]) + .0722 * lin(c[2]);
const cr = (a, c) => { const x = lum(a), y = lum(c); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const hsl = ([r, g_, bb]) => { r /= 255; g_ /= 255; bb /= 255; const mx = Math.max(r, g_, bb), mn = Math.min(r, g_, bb), l = (mx + mn) / 2, d = mx - mn; let h = 0, s = 0; if (d) { s = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? 60 * (((g_ - bb) / d) % 6) : mx === g_ ? 60 * ((bb - r) / d + 2) : 60 * ((r - g_) / d + 4); } return [(h + 360) % 360, s * 100, l * 100]; };
const plateC = [Math.round(stats.plate[0][0]), stats.plate[0][1], stats.plate[0][2]];
R.platte = stats.plate.map(x => x.map(v => +v.toFixed(1))); R.buerstung = stats.rows.map(v => +v.toFixed(2));
for (const [h, s, l] of stats.plate) ok('MK-P-11', h >= 195 && h <= 225 && s >= 10 && s <= 35 && l >= 65 && l <= 85, 'Platte ' + [h, s, l].map(v => v.toFixed(1)));
ok('MK-P-11', stats.rows.every(v => v >= .5 && v <= 3), 'Bürstung ' + R.buerstung);
// print against the plate colour (pixel mean of the free area, as RGB from HSL)
const plRGB = (() => { const [h, s, l] = stats.plate[0].map((v, k) => k ? v / 100 : v), C = (1 - Math.abs(2 * l - 1)) * s, X = C * (1 - Math.abs((h / 60) % 2 - 1)), m = l - C / 2; const [r, g_, bb] = h < 60 ? [C, X, 0] : h < 120 ? [X, C, 0] : h < 180 ? [0, C, X] : h < 240 ? [0, X, C] : h < 300 ? [X, 0, C] : [C, 0, X]; return [(r + m) * 255, (g_ + m) * 255, (bb + m) * 255]; })();
const ink = parse(geo.ink); R.druck = {farbe: geo.ink, hell: +hsl(ink)[2].toFixed(1), kontrast: +cr(ink, plRGB).toFixed(2)}; ok('MK-P-11', hsl(ink)[2] <= 30 && cr(ink, plRGB) >= 4.5, 'Druck ' + JSON.stringify(R.druck));
const ic = geo.invC && cr(parse(geo.invC[0]), parse(geo.invC[1])); R.invers = {n: geo.invN, tabelle: geo.invTab, farben: geo.invC, kontrast: ic && +ic.toFixed(2)};
ok('MK-P-11', geo.invC && /255, 255, 255/.test(geo.invC[0]) && ic >= 7 && geo.invN >= geo.invTab, 'Invers ' + JSON.stringify(R.invers));
R.kappen = {Lmax: Math.max(...stats.caps), n: stats.caps.length, zeiger: geo.ptr, skalen: geo.scales + '/' + geo.knobs, ohneSkala: geo.scaleIds, mittelmarke: geo.cm, ohneSkalaTabelle: geo.ns};
ok('MK-P-11', Math.max(...stats.caps) <= 15 && geo.ptr.every(c => hsl(parse(c))[2] >= 90), 'Kappen ' + JSON.stringify(R.kappen));
ok('MK-P-11', JSON.stringify(geo.cm) === JSON.stringify(['a.pan', 'f.eg', 'f.kbd', 'o2.semi', 'o2.tune']), 'Mittelmarken ' + geo.cm);
ok('MK-P-11', JSON.stringify(geo.ns) === JSON.stringify(['ain.1']), 'ohne Skala nur AUDIO IN 1 ' + geo.ns);
R.tasten = {Lmin: Math.min(...stats.keys), Lmax: Math.max(...stats.keys)}; ok('MK-P-11', Math.min(...stats.keys) >= 70, 'Tasten hellgrau ' + JSON.stringify(R.tasten));
const onH = geo.on.map(c => hsl(parse(c))[0]); R.leds = {rund: geo.ledR, an: [...new Set(geo.on)], farbton: [...new Set(onH.map(Math.round))], gruen: geo.gn};
ok('MK-P-11', geo.ledR && geo.on.length && geo.on.every(c => { const [h, s] = hsl(parse(c)); return (h <= 35 || h >= 355 || (h >= 100 && h <= 140)); }) && onH.some(h => h <= 35), 'LEDs ' + JSON.stringify(R.leds));
ok('MK-P-11', geo.gn.some(k => /oct/.test(k)), 'OCTAVE +1 grün ' + geo.gn);
const fg = parse(geo.lcdFg), bg = parse(geo.lcdBg), [bh, , bl] = hsl(bg); R.anzeige = {fg: geo.lcdFg, bg: geo.lcdBg, varFg: geo.varFg, varBg: geo.varBg, grund: [Math.round(bh), +bl.toFixed(1)], zeichen: +hsl(fg)[2].toFixed(1), kontrast: +cr(fg, bg).toFixed(2), pixel: stats.lcdPx.map(v => +v.toFixed(1)), zeilen: geo.lcdWrap};
ok('MK-P-11', bh >= 60 && bh <= 100 && bl >= 45 && bl <= 70 && hsl(fg)[2] <= 25 && cr(fg, bg) >= 4.5 && stats.lcdPx[0] >= 60 && stats.lcdPx[0] <= 100, 'Anzeige ' + JSON.stringify(R.anzeige));
ok('MK-P-11', geo.lcdWrap.length === 2 && geo.lcdWrap.every(x => x[0] === 'pre' && x[1] && x[2] <= 16), 'Anzeige 2 x 16 ohne Umbruch ' + JSON.stringify(geo.lcdWrap));
const cssOnly = await page.evaluate(() => { const t = [...document.querySelectorAll('style')].map(s => s.textContent).join('\n'), m = t.slice(t.indexOf('.mkfr{'), t.indexOf('.mkfr{') + 60000); return (m.match(/mkplcd[^{]*\{[^}]*\}/g) || []).map(r => (r.match(/(?:^|;)\s*(?:color|background)[^;]*/g) || []).join('')).join(' | '); });
R.anzeigeCss = cssOnly; ok('MK-P-11', !/#[0-9a-f]{3,6}|hsl\(|rgb\(/i.test(cssOnly.replace(/var\(--mkp-lcd-(fg|bg)\)/g, '').replace(/color-mix\(in srgb,\s*\d+%,#000\)/g, '')), 'Anzeige-Farben nur aus den Variablen ' + cssOnly);
ok('MK-P-11', geo.wood === 0, 'Holzwangen ' + geo.wood);
ok('konsole', !page.errs.length, page.errs.join(' | '));
R.geo = {free: geo.free, caps: geo.caps.slice(0, 6), keys: geo.keys.slice(0, 6)}; R.capsL = stats.caps; R.keysL = stats.keys; console.log(JSON.stringify(R, null, 1)); console.log('FEHLER', fail.length, JSON.stringify(fail, null, 1));
await b.close();
