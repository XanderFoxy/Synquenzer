// MK1 panel layout and look (Nachtrag 3 MK1-21 Bedienfeld, MK1-32 Aussehen wie die Referenz-Skizze) in Chromium.
// Usage: node v3-mk1-look.mjs <index.html> [shotdir]   (ONLY=regex limits the formats, e.g. ONLY=L1)
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname), SHOTS = process.argv[3] || 'v3-mk1-shots';
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0, n = 0; const ok = (id, c, info) => { n++; if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const SA = '#app{padding-left:47px!important;padding-right:47px!important}', HB = '#app{padding-bottom:21px!important}';
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180],
  'L1-SA': [844, 390, SA], 'L0-SA': [926, 428, SA], 'L1-HB': [844, 390, SA + HB]};
const INT = ['vol', 'arp', 'octd', 'octu', 'bank', 'side', 'write', 'shift', 'n0', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'timbre', 'w1', 'w2', 'k0', 'k1', 'k2', 'k3', 'k4', 'm1', 'm2'];
async function open(fmt) {
  const [w, h, css] = FMT[fmt];
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: fmt !== 'W', deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  // MK1-fix: the app's real font (Pages loads it from fonts/, cloudPagesExtras); NOFONT=1 measures with the fallback (Claude viewer)
  if (!process.env.NOFONT) await page.evaluate(async F => { const f = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
    const st = document.createElement('style'); st.textContent = f.map(([fam, file, ws]) => ws.map(w => `@font-face{font-family:"${fam}";font-weight:${w};src:url(${F}${file}-latin-${w}-normal.woff2) format("woff2")}`).join('')).join(''); document.head.appendChild(st);
    await Promise.all(['500 10px "Barlow Semi Condensed"', '700 10px "Barlow Semi Condensed"', '600 10px "Barlow Semi Condensed"', '700 10px "JetBrains Mono"'].map(s => document.fonts.load(s))); await document.fonts.ready; },
    'file:///tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/fonts/');
  if (css) await page.addStyleTag({content: css});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(600);
  return {ctx, page, errs};
}
const half = (page, h) => page.evaluate(h => { ED.tab = h === 'A' ? 'links' : 'rechts'; safeRebuild(buildSynthEd); }, h).then(() => page.waitForTimeout(250));
// one measurement of the panel in the current state (client px)
const measure = page => page.evaluate(INT => {
  const out = {bad: [], rects: {}};
  const body = document.querySelector('#synthSheet .mkbody'), pg = document.querySelector('#synthSheet .pg');
  if (!body) return {bad: ['kein Bedienfeld'], rects: {}};
  const pr = pg.getBoundingClientRect(), iw = innerWidth, ih = innerHeight;
  for (const e of body.querySelectorAll('.mkx')) {
    const r = e.getBoundingClientRect(), k = e.dataset.k; out.rects[k] = [r.left, r.top, r.width, r.height];
    if (r.left < -.5 || r.top < -.5 || r.right > iw + .5 || r.bottom > ih + .5) out.bad.push(k + ' außerhalb des Bildschirms');
    if (r.left < pr.left - .5 || r.top < pr.top - .5 || r.right > pr.right + .5 || r.bottom > pr.bottom + .5) out.bad.push(k + ' abgeschnitten (.pg)');
    // every label: no overflow, its text inside its element
    for (const t of e.querySelectorAll('*')) {
      if (t.children.length || !t.textContent.trim() || t.closest('svg')) continue;
      const cs = getComputedStyle(t); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (t.clientWidth > 0 && t.scrollWidth > t.clientWidth + 1) out.bad.push(k + ' Beschriftung läuft über: ' + t.textContent);
      const rg = document.createRange(); rg.selectNodeContents(t); const q = rg.getBoundingClientRect();
      if (q.width && (q.left < r.left - 1 || q.right > r.right + 1 || q.top < r.top - 1 || q.bottom > r.bottom + 1)) out.bad.push(k + ' Text ragt heraus: ' + t.textContent);
    }
  }
  const present = INT.filter(k => out.rects[k]);
  for (const k of present) { const [x, y, w, h] = out.rects[k]; if (w < 43.5 || h < 43.5) out.bad.push(k + ' Trefferfläche ' + w.toFixed(1) + '×' + h.toFixed(1)); }
  for (let a = 0; a < present.length; a++) for (let b = a + 1; b < present.length; b++) {
    const A = out.rects[present[a]], B = out.rects[present[b]], ox = Math.min(A[0] + A[2], B[0] + B[2]) - Math.max(A[0], B[0]), oy = Math.min(A[1] + A[3], B[1] + B[3]) - Math.max(A[1], B[1]);
    if (ox > .5 && oy > .5) out.bad.push('Überlappung ' + present[a] + '/' + present[b]);
  }
  const de = document.documentElement, sb = document.querySelector('#synthSheet .sh-body');
  if (de.scrollWidth > iw + .5 || de.scrollHeight > ih + .5) out.bad.push('Seite scrollt ' + de.scrollWidth + '×' + de.scrollHeight);
  if (sb && (sb.scrollHeight > sb.clientHeight + 1 || sb.scrollWidth > sb.clientWidth + 1)) out.bad.push('Blatt-Körper scrollt');
  const wh = document.getElementById('mkWh'); if (wh && !wh.hidden) for (const e of wh.querySelectorAll('.mkwheel')) { const r = e.getBoundingClientRect(); if (r.width < 43.5 || r.height < 43.5) out.bad.push('Rad ' + r.width + '×' + r.height); if (r.bottom > ih + .5) out.bad.push('Rad unten abgeschnitten'); }
  out.panel = SYNQUENZER.mkPanel();
  return out;
}, INT);
const maxMove = (a, b) => { let m = 0, k0 = ''; for (const k in a) if (b[k]) for (let i = 0; i < 4; i++) { const d = Math.abs(a[k][i] - b[k][i]); if (d > m) { m = d; k0 = k; } } return [m, k0]; };
// the states of MK1-21: SPIEL, each position of both EDIT-WAHL, level 1 and 2
const STATES = [['SPIEL', 0, 0, 0]]; for (const w of [1, 2]) for (let p = 0; p < 11; p++) for (const s of [0, 1]) STATES.push([`W${w}.${p + 1}${s ? ' EB2' : ''}`, w, p, s]);
async function states(page, tag) {
  const bad = []; let base = null, mv = [0, ''];
  for (const [nm, w, p, s] of STATES) {
    await page.evaluate(([w, p, s]) => { if (w === 0) MKUI.toSpiel(); else { MKUI.setWahl(w, p); if (s) { MKUI.P.shift = 1; MKUI.render(); } } }, [w, p, s]);
    const m = await measure(page);
    for (const b of m.bad) bad.push(nm + ': ' + b);
    if (!base) base = m.rects; else { const d = maxMove(base, m.rects); if (d[0] > mv[0]) mv = [d[0], nm + ' ' + d[1]]; }
  }
  await page.evaluate(() => MKUI.toSpiel());
  ok(`MK1-21 ${tag} M-PLATZ für SPIEL und ${STATES.length - 1} Stellungen/Ebenen (Trefferflächen ≥ 44, keine Überlappung, nichts abgeschnitten, kein Scrollen)`, !bad.length, bad.length ? bad.length + ' Befunde: ' + [...new Set(bad)].slice(0, 6).join(' | ') : '');
  ok(`MK1-21 ${tag} M-ANSICHT: Sektions-/Ebenenwechsel bewegt kein Element > 2 px`, mv[0] <= 2, 'max ' + mv[0].toFixed(2) + ' px ' + mv[1]);
  // the open list of EDIT-WAHL 1 (tap)
  const lst = await page.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="w1"]'); if (!e) return null;
    MKUI.setWahl(1, 5); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2 + 6]; });
  if (lst) {
    await page.mouse.click(lst[0], lst[1]); await page.waitForTimeout(150);
    const L = await page.evaluate(() => { const p = document.querySelector('.pop'); if (!p) return null; const b = [...p.querySelectorAll('.plist button')].map(x => x.getBoundingClientRect()), pr = p.getBoundingClientRect(), de = document.documentElement;
      return {n: b.length, minH: Math.min(...b.map(r => r.height)), inside: pr.left >= -.5 && pr.right <= innerWidth + .5 && pr.top >= -.5 && pr.bottom <= innerHeight + .5, scroll: de.scrollWidth > innerWidth + .5 || de.scrollHeight > innerHeight + .5,
        over: [...p.querySelectorAll('.plist button *')].filter(t => !t.children.length && t.clientWidth && t.scrollWidth > t.clientWidth + 1).length}; });
    ok(`MK1-21 ${tag} offene Auswahl-Liste: 11 Zeilen ≥ 44 px, im Bild, nichts läuft über, kein Scrollen`, L && L.n === 11 && L.minH >= 43.5 && L.inside && !L.scroll && !L.over, JSON.stringify(L));
    await page.evaluate(() => { closePop(); MKUI.toSpiel(); });
  }
}
// ---- the zone table (B.3, reference L1 720 x 136) ----
const ZT = {HL: [0, 0, 10, 136], HR: [710, 0, 10, 136], Z1: [14, 0, 44, 44], Z2: [62, 0, 44, 44], Z3: [14, 46, 92, 44], Z4: [112, 0, 52, 44], Z5: [176, 0, 44, 44], Z6: [270, 0, 16, 44],
  Z7: [294, 0, 92, 44], Z8: [294, 46, 92, 44], Z9: [112, 46, 176, 44], Z10: [14, 92, 352, 44], Z11: [392, 0, 64, 136], Z12: [462, 0, 240, 44], Z13: [462, 46, 244, 90]};
const iou = (a, b) => { const ox = Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0])), oy = Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1])), I = ox * oy; return I / (a[2] * a[3] + b[2] * b[3] - I); };
// B.3 Regler-Belegung, level 1 of EDIT-WAHL 1 (only in spec and test; the app shows its own short labels)
const BEL = [['SYNTH/VOC.', 'EINZELN', 'ZUWEISUNG', 'AUSLÖSUNG', 'UNI-VERST.'], ['TRANSP.', 'FEIN', 'PORTAM.', 'BEND', 'VIBRATO'], ['WELLE', 'STEUER 1', 'STEUER 2', null, null],
  ['WELLE', 'MOD', 'HALBTON', 'FEIN', null], ['OSZ 1', 'OSZ 2', 'RAUSCHEN', null, null], ['TYP', 'CUTOFF', 'RESONANZ', 'HK-INT', 'KEYTRACK'], ['ATTACK', 'DECAY', 'SUSTAIN', 'RELEASE', 'NEUSTART'],
  ['PEGEL', 'PAN', 'VERZERR.', 'KEYTRACK', null], ['ATTACK', 'DECAY', 'SUSTAIN', 'RELEASE', 'NEUSTART'], ['WELLE', 'KEY SYNC', 'TEMPO SYNC', 'FREQ', null], ['WELLE', 'KEY SYNC', 'TEMPO SYNC', 'FREQ', null]];
const SEC_NAMES = ['STIMME', 'TONH.', 'OSZ 1', 'OSZ 2', 'MIXER', 'FILTER', 'F-HK', 'AMP', 'A-HK', 'LFO 1', 'LFO 2'];
// colour helpers
const lin = c => { c /= 255; return c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); };
const Lstar = ([r, g, b]) => { const Y = .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b); return Y > .008856 ? 116 * Math.cbrt(Y) - 16 : 903.3 * Y; };
const lum = ([r, g, b]) => .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b);
const hsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; if (!d) return [0, 0, l * 100];
  const s = d / (1 - Math.abs(2 * l - 1)); let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; return [h, s * 100, l * 100]; };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const rgbOf = s => s.match(/[\d.]+/g).slice(0, 3).map(Number);
async function pixels(page, pts) {
  const png = (await page.screenshot()).toString('base64');
  return page.evaluate(async ([png, pts]) => { const im = new Image(); im.src = 'data:image/png;base64,' + png; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
    const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    return pts.map(([x, y, r]) => { r = r || 1; const d = g.getImageData(Math.round(x) - r, Math.round(y) - r, 2 * r + 1, 2 * r + 1).data; const s = [0, 0, 0]; for (let i = 0; i < d.length; i += 4) { s[0] += d[i]; s[1] += d[i + 1]; s[2] += d[i + 2]; } const k = d.length / 4; return s.map(v => v / k); }); }, [png, pts]);
}
// ---- MK1-32 order checks for one panel info (zones relative to the body) ----
function order(tag, pi) {
  const Z = {}; for (const z of pi.zones) Z[z.id] = z; const B = [], has = k => !!Z[k], cx = k => Z[k].x, bot = k => Z[k].y + Z[k].h;
  const band1 = ['Z1', 'Z2', 'Z4', 'Z5', 'Z6', 'Z7'].filter(has); for (let i = 1; i < band1.length; i++) if (!(cx(band1[i - 1]) < cx(band1[i]))) B.push(band1[i - 1] + '<' + band1[i]);
  if (has('Z11') && has('Z12') && !(cx('Z11') < cx('Z12'))) B.push('Z11<Z12');
  if (has('Z3') && has('Z1') && Z.Z3.y < bot('Z1') - 1) B.push('Z3 unter Z1');
  if (has('Z8') && has('Z7') && pi.fmt !== 'halb-quer' && Z.Z8.y < bot('Z7') - 1) B.push('Z8 unter Z7');   // half view landscape: Z8 beside Z7 in band 1 (B.3)
  if (pi.fmt === 'halb-quer' && has('Z8') && has('Z7') && !(Z.Z8.x > Z.Z7.x)) B.push('Z8 rechts neben Z7');
  if (has('Z9') && has('Z4') && Z.Z9.y < bot('Z4') - 1) B.push('Z9 unter Z4–Z6');
  if (has('Z10')) { const A = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6', 'Z7', 'Z8', 'Z9'].filter(has); if (A.some(k => Z[k].y > Z.Z10.y + 1)) B.push('Z10 im untersten Band'); if (has('Z9') && Z.Z9.y >= Z.Z10.y - 1 && !(Z.Z10.x < Z.Z9.x)) B.push('Z10 links'); }
  if (has('Z13') && has('Z12') && (Z.Z13.y - bot('Z12') > 4 || Z.Z13.y < bot('Z12') - 1)) B.push('Z13 direkt unter Z12');
  if (has('HL') && has('HR') && (Z.HL.x > 1 || Z.HR.x + Z.HR.w < pi.body.w - 1)) B.push('Holzwangen an den Rändern');
  return B;
}
const FORMATS = Object.keys(FMT).filter(f => !ONLY || ONLY.test(f));
for (const fmt of FORMATS) {
  const {ctx, page, errs} = await open(fmt);
  let pi = await page.evaluate(() => SYNQUENZER.mkPanel());
  const isHalf = /halb/.test(pi.fmt);
  console.log('# ' + fmt + ' ' + FMT[fmt].slice(0, 2).join('×') + (FMT[fmt][2] ? ' (Safe-Area' + (/21px/.test(FMT[fmt][2]) ? ' + Home-Balken' : '') + ')' : '') + ': ' + pi.fmt + ', Maßstab ' + pi.scale.toFixed(3) + ', Körper ' + pi.body.w.toFixed(0) + '×' + pi.body.h.toFixed(0));
  if (fmt === 'L1-HB') ok('MK1-21 L1 mit Home-Balken (21 px): Halb-Ansicht quer', pi.fmt === 'halb-quer', pi.fmt);
  if (/^L1$|L1-SA|L0-SA/.test(fmt)) ok('MK1-21 ' + fmt + ' ganzes Bedienfeld in einem Stück (Körper 720 × 136, Maßstab ≥ 1)', pi.fmt === 'voll-quer' && pi.scale >= 1 && Math.abs(pi.body.w / pi.body.h - 720 / 136) < .01, pi.fmt + ' ' + pi.body.w.toFixed(1) + '×' + pi.body.h.toFixed(1));
  for (const h of isHalf ? ['A', 'B'] : [null]) {
    if (h) await half(page, h);
    const tag = fmt + (h ? (h === 'A' ? ' LINKS' : ' RECHTS') : '');
    await states(page, tag);
    pi = await page.evaluate(() => SYNQUENZER.mkPanel());
    const ids = pi.zones.map(z => z.id).filter(z => /^Z/.test(z)).sort((a, b) => +a.slice(1) - +b.slice(1));
    // MK1-32 order and halves
    const B = order(tag, pi), el = await page.evaluate(() => { const g = k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; };
      return {timbre: g('timbre'), w1: g('w1'), w2: g('w2'), m1: g('m1'), m2: g('m2'), shift: g('shift'), sep: g('sep')}; });
    if (el.timbre && el.w1 && el.w2) {
      if (/quer/.test(pi.fmt) && isHalf) { if (!(el.w2[1] > el.w1[1] + 1)) B.push('EDIT-WAHL 2 unter EDIT-WAHL 1'); }
      else if (!(el.timbre[1] < el.w1[1] && el.w1[1] < el.w2[1])) B.push('Spalte TIMBRE / EDIT-WAHL 1 / EDIT-WAHL 2');
    }
    if (/^(L1|W|P1|L1-SA|L0-SA)$/.test(fmt) && el.m1 && el.m2 && (Math.abs(el.m1[1] - el.w1[1]) > 4 || Math.abs(el.m2[1] - el.w2[1]) > 4)) B.push('Matrix-Zeile auf Höhe ihres Drehschalters');
    if (h === 'A' && ids.join() !== 'Z1,Z2,Z3,Z4,Z5,Z6,Z7,Z8,Z9,Z10') B.push('LINKS = Z1–Z10: ' + ids.join());
    if (h === 'B' && (ids.join() !== 'Z11,Z12,Z13' || !el.shift)) B.push('RECHTS = Z11–Z13 + SHIFT: ' + ids.join() + (el.shift ? '' : ' (kein SHIFT)'));
    if (pi.fmt === 'voll-hoch') { const Z = {}; for (const z of pi.zones) Z[z.id] = z; const sepY = el.sep ? el.sep[1] - (await page.evaluate(() => document.querySelector('#synthSheet .mkbody').getBoundingClientRect().top)) : 140;
      for (const k of ['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6', 'Z7', 'Z8', 'Z9', 'Z10']) if (Z[k] && Z[k].y + Z[k].h > sepY + .5) B.push(k + ' in Hälfte A');
      for (const k of ['Z11', 'Z12', 'Z13']) if (Z[k] && Z[k].y < sepY) B.push(k + ' in Hälfte B'); }
    ok(`MK1-32 ${tag} Anordnung wie die Skizze (Bänder, Spalte, Matrix, Holzwangen${isHalf ? ', Hälfte' : ''})`, !B.length, B.join(' | ') || ids.join(' '));
  }
  if (isHalf) await half(page, 'A');
  // MK1-32 IoU in L1 (with safe area): every zone against the table, wheels left of the first key
  if (/L1-SA|L0-SA/.test(fmt)) {
    pi = await page.evaluate(() => SYNQUENZER.mkPanel());
    const bw = pi.body.w, bh = pi.body.h, worst = [1, ''];
    for (const z of pi.zones) { if (!ZT[z.id]) continue; const t = ZT[z.id], e = [t[0] / 720 * bw, t[1] / 136 * bh, t[2] / 720 * bw, t[3] / 136 * bh], v = iou([z.x, z.y, z.w, z.h], e); if (v < worst[0]) { worst[0] = v; worst[1] = z.id; } }
    const missing = Object.keys(ZT).filter(k => !pi.zones.some(z => z.id === k));
    ok(`MK1-32 ${fmt} M-SKIZZE: jede Zone Z1–Z13 und jede Holzwange IoU ≥ 0,7`, worst[0] >= .7 && !missing.length, 'schlechteste ' + worst[1] + ' ' + worst[0].toFixed(3) + (missing.length ? ', fehlt ' + missing : ''));
    const wk = await page.evaluate(() => { const wh = document.getElementById('mkWh'), kb = document.getElementById('kbArea'); if (!wh || wh.hidden) return null; const kbe = document.getElementById('kb'), k = [...kbe.querySelectorAll('.key, [data-n]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.getBoundingClientRect().left); if (!k.length) k.push(kbe.getBoundingClientRect().left);
      return {whR: wh.getBoundingClientRect().right, key: Math.min(...k), inKb: kb.contains(wh)}; });
    ok(`MK1-32 ${fmt} Räder links der ersten Taste in #kbArea`, wk && wk.inKb && wk.whR <= wk.key + .5, JSON.stringify(wk));
  }
  // MK1-21 header checks
  const hd = await page.evaluate(() => {
    const h = document.querySelector('#synthSheet .sh-head'), hr = h.getBoundingClientRect(), seg = h.querySelector('.seg.eng'), out = {chip: seg.classList.contains('engchip'), bad: []};
    for (const e of h.querySelectorAll('button, .sh-title, .preset')) { const r = e.getBoundingClientRect(); if (!r.width) continue; if (e.scrollWidth > e.clientWidth + 1) out.bad.push('läuft über: ' + e.textContent.trim().slice(0, 12)); if (r.right > hr.right + .5 || r.left < hr.left - .5) out.bad.push('ragt heraus: ' + e.textContent.trim().slice(0, 12)); }
    const stt = h.querySelector('.stt'); out.title = stt ? [stt.textContent, stt.scrollWidth <= stt.clientWidth + 1 || getComputedStyle(stt).textOverflow !== 'clip', stt.getBoundingClientRect().width] : null;
    const pv = h.querySelector('.preset'); out.pv = pv ? pv.getBoundingClientRect().width : null;   // the name field ‹ name ›
    const bs = [...seg.querySelectorAll('button')]; out.keys = bs.map(b => { const r = b.getBoundingClientRect(); let t0 = 0, t1 = 0; for (let y = r.top - 12; y < r.bottom + 12; y += .5) { const e = document.elementFromPoint(r.left + r.width / 2, y); if (e === b || b.contains(e)) { if (!t0) t0 = y; t1 = y; } }   // the real hit height (elementFromPoint)
      return {t: b.textContent, w: r.width, hit: t1 - t0 + .5, x: r.left, r: r.right}; });
    out.gap = bs.length > 1 ? Math.min(...bs.slice(1).map((b, i) => b.getBoundingClientRect().left - bs[i].getBoundingClientRect().right)) : null;
    const r2 = h.querySelector('.sh-row.r2'), r2t = r2 && r2.getBoundingClientRect().height ? Math.min(...[...r2.children].map(e => e.getBoundingClientRect()).filter(q => q.width).map(q => q.top)) : hr.bottom;
    out.row1 = r2t - Math.max(hr.top, seg.getBoundingClientRect().top - 6);   // the room of row 1 (the top bar above, row 2 below)
    out.mk = out.keys.find(k => /MS/.test(k.t)); return out; });
  const land = FMT[fmt][0] > FMT[fmt][1];
  if (land) ok(`MK1-21 ${fmt} Kopfzeile (40 px) mit „MS 2000“: nichts läuft über, Namensfeld ≥ 72 px, Engine-Knöpfe ≥ 36 px mit 4 px, Treffer ≥ 44`, !hd.bad.length && hd.pv >= 72 && !hd.chip && hd.keys.every(k => k.w >= 36 && k.hit >= 43.5) && hd.gap >= 3.5 && hd.mk && hd.mk.t.replace(/\s+/g, ' ').trim() === 'MS 2000',
    JSON.stringify({bad: hd.bad, pv: hd.pv, keys: hd.keys.map(k => [k.t, Math.round(k.w), Math.round(k.hit)]), gap: hd.gap}));
  else {
    let cp = null;
    if (hd.chip) { await page.evaluate(() => document.querySelector('#synthSheet .engchip button').click()); await page.waitForTimeout(150);
      cp = await page.evaluate(() => { const b = [...document.querySelectorAll('.pop button[data-e]')].map(x => [x.textContent, x.getBoundingClientRect().height]); return b; }); await page.evaluate(() => closePop()); }
    ok(`MK1-21 ${fmt} Kopfzeile 1 mit Spur-Chip: ${hd.chip ? 'Engine-Chip (H-13, Treffer = ganze Zeilenhöhe, max. 44 px), Liste 4 Zeilen ≥ 44 px' : 'Engine-Knöpfe ≥ 36 × 44 mit 4 px'}, Spurname sichtbar, nichts läuft über`,
      !hd.bad.length && hd.title && hd.title[2] > 20 && (hd.chip ? cp && cp.length === 4 && cp.every(x => x[1] >= 43.5) && cp[3][0] === 'MS 2000' && hd.keys[0].hit >= Math.min(43.5, hd.row1 - 1) : hd.keys.every(k => k.w >= 36 && k.hit >= 43.5) && hd.gap >= 3.5),
      JSON.stringify({chip: hd.chip, row1: Math.round(hd.row1), title: hd.title, bad: hd.bad, list: cp, keys: hd.keys.map(k => [k.t, Math.round(k.w), Math.round(k.hit)])}));
  }
  // MK1-21 zoom / pinch / text selection off
  const zs = await page.evaluate(() => { const m = document.querySelector('meta[name=viewport]').content, b = getComputedStyle(document.querySelector('#synthSheet .mkbody')); return {m, ta: b.touchAction, us: b.userSelect || b.webkitUserSelect}; });
  ok(`MK1-21 ${fmt} Zoom/Pinch/Textauswahl aus`, /maximum-scale=1/.test(zs.m) && zs.ta === 'none' && zs.us === 'none', JSON.stringify(zs));
  // MK1-32 material (from the screenshot) in the full formats
  if (/^(L1|P1|W|L0-SA)$/.test(fmt)) {
    const g = await page.evaluate(() => { const b = document.querySelector('#synthSheet .mkbody'), br = b.getBoundingClientRect(); const R = k => { const e = b.querySelector('.mkx[data-k="' + k + '"]'); return e ? e.getBoundingClientRect() : null; };
      MKUI.setWahl(1, 5);
      // empty field points: a grid point where only the body is hit
      const free = []; for (let y = br.top + 6; y < br.bottom - 6 && free.length < 6; y += 7) for (let x = br.left + 14; x < br.right - 14 && free.length < 6; x += 11) { const e = document.elementFromPoint(x, y); if (e === b) free.push([x, y, 1]); }
      const hl = R('HL'), k0 = b.querySelector('.mkx[data-k="k0"] .mcap').getBoundingClientRect(), led = b.querySelector('.mkx[data-k="w1"] .mled').getBoundingClientRect();
      const lab = getComputedStyle(b.querySelector('.mkx[data-k="k0"] .lg')).color;
      const cap = []; for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 + .3; cap.push([k0.left + k0.width / 2 + 8 * Math.cos(an), k0.top + k0.height / 2 + 8 * Math.sin(an), 0]); }
      return {free, hl: [hl.left + hl.width / 2, hl.top + hl.height / 2, 1], cap, led: [led.left + led.width / 2, led.top + led.height / 2, 1], lab}; });
    const px = await pixels(page, [...g.free, g.hl, ...g.cap, g.led]);
    const fld = px.slice(0, g.free.length), hl = px[g.free.length], caps = px.slice(g.free.length + 1, g.free.length + 9), led = px[g.free.length + 9];
    const cap = caps.map(Lstar).sort((a, b) => a - b)[4];   // median of 8 points on the cap (one may hit the pointer line)
    const fL = Math.max(...fld.map(Lstar)), wH = hsl(hl), lC = contrast(rgbOf(g.lab), fld[0]), ledH = hsl(led), cL = cap;
    const voc = await page.evaluate(async () => { const e = document.querySelector('#synthSheet .mkx[data-k="w1"]'); const r = e.getBoundingClientRect(); e.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, clientX: r.left + 20, clientY: r.top + 28, pointerId: 9, isPrimary: true}));
      e.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, clientX: r.left + 20, clientY: r.top + 28, pointerId: 9, isPrimary: true})); await new Promise(f => setTimeout(f, 150));
      const v = document.querySelector('.pop em.mvoc'); const c = v ? getComputedStyle(v).color : null; closePop(); return c; });
    const vH = voc ? hsl(rgbOf(voc))[0] : -1;
    ok(`MK1-32 ${fmt} Material: Feld L* ≤ 20, Holz 15–40° / 35–75 % / 20–45 %, Kappe L* ≤ 15, Beschriftung ≥ 4,5 : 1, Vocoder 100–150°, LED an 0–35°`,
      fL <= 20 && wH[0] >= 15 && wH[0] <= 40 && wH[1] >= 35 && wH[1] <= 75 && wH[2] >= 20 && wH[2] <= 45 && cL <= 15 && lC >= 4.5 && vH >= 100 && vH <= 150 && ledH[0] <= 35 && ledH[1] > 50,
      `Feld L* ${fL.toFixed(1)}, Holz ${wH.map(v => v.toFixed(0)).join('/')}, Kappe L* ${cL.toFixed(1)}, Kontrast ${lC.toFixed(1)}, Vocoder ${vH.toFixed(0)}°, LED ${ledH.map(v => v.toFixed(0)).join('/')}`);
    await page.evaluate(() => MKUI.toSpiel());
  }
  // MK1-32 matrix level 1 against the table (once)
  if (fmt === 'L1') {
    const mt = await page.evaluate(() => { const r = []; for (let p = 0; p < 11; p++) { MKUI.setWahl(1, p); const pi = SYNQUENZER.mkPanel(); r.push({k: pi.knobs.map(k => (k ? k.l : null)), m: pi.matrix[0]}); } MKUI.toSpiel(); return r; });
    const bad = []; mt.forEach((x, p) => { BEL[p].forEach((l, i) => { if ((x.k[i] || null) !== l) bad.push(SEC_NAMES[p] + ' ' + (i + 1) + ': ' + x.k[i] + ' ≠ ' + l); }); if (!x.m || x.m.indexOf(SEC_NAMES[p]) < 0) bad.push(SEC_NAMES[p] + ' fehlt in der Matrix-Zeile'); });
    ok('MK1-32 Matrix Ebene 1 jeder Stellung = Belegungs-Tabelle B.3', !bad.length, bad.slice(0, 6).join(' | '));
  }
  // screenshots (SPIEL, FILTER; halves) for CHANGES
  for (const h of isHalf ? ['A', 'B'] : [null]) {
    if (h) await half(page, h);
    await page.screenshot({path: `${SHOTS}/mk1-look-${fmt}${h ? '-' + h : ''}-spiel.png`});
    await page.evaluate(() => MKUI.setWahl(1, 5)); await page.screenshot({path: `${SHOTS}/mk1-look-${fmt}${h ? '-' + h : ''}-filter.png`}); await page.evaluate(() => MKUI.toSpiel());
  }
  ok(`MK1-21 ${fmt} keine Konsolenfehler`, !errs.length, errs.slice(0, 3).join(' | '));
  await ctx.close();
}
await browser.close();
console.log('\n' + (fails ? fails + ' FEHLER' : 'alles bestanden') + ' (' + n + ' Prüfungen)');
process.exit(fails ? 1 : 0);
