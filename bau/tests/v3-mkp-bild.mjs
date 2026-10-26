// MK-P-02: the whole plate rendered at 1400 x 718 against the line drawing (private, scratchpad only): the same line method finds
// the section frames in both pictures; every frame edge <= 0.8 % of the width / 1.2 % of the height from its counterpart; long lines
// of the photo without a counterpart in the drawing (and the other way round) are listed. The 50 % overlay stays in the scratchpad.
import {launch, open} from './v3-mkp-lib.mjs';
import fs from 'fs';
const FILE = process.argv[2], S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad';
const DRAW = S + '/ms2000-panel/ms2000-front.png', BOX = [95, 90, 1495, 808], OUT = S + '/ms2000-panel/mkp-overlay.png', SHOT = S + '/ms2000-panel/mkp-plate-1400.png';
const W = 1400, H = 718;
const b = await launch(); const page = await open(b, FILE, [1500, 900]);
await page.evaluate(([W]) => { MKUI.view({ansicht: 'ganz'}); const U = MKUI.P.el; U.hull.style.transition = ''; U.hull.style.transform = 'translate(0px,0px) scale(' + (W / MKUI.PL.zb) + ')';
  for (const e of document.querySelectorAll('.lcd.mkql')) e.classList.remove('on'); }, [W]);
await page.waitForTimeout(400);
const fr = await page.evaluate(() => { const r = MKUI.P.el.fr.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; });
if (fr.w < W || fr.h < H) throw new Error('frame too small ' + JSON.stringify(fr));
const png = await page.screenshot({clip: {x: fr.x, y: fr.y, width: W, height: H}}); fs.writeFileSync(SHOT, png);
const sec = await page.evaluate(() => MKUI.SEC.map(s => [s[0], s[4], s[5], s[6], s[7]]));
// analysis in a blank page (pixels of data: URLs are readable)
const an = await b.newPage();
const res = await an.evaluate(async ([photo, draw, BOX, W, H, sec]) => {
  const img = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
  const P = await img(photo), D = await img(draw);
  const cv = (im, sx, sy, sw, sh) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.drawImage(im, sx, sy, sw, sh, 0, 0, W, H); return c; };
  const cP = cv(P, 0, 0, W, H), cD = cv(D, BOX[0], BOX[1], BOX[2] - BOX[0], BOX[3] - BOX[1]);
  const mask = (c, thr) => { const d = c.getContext('2d').getImageData(0, 0, W, H).data, m = new Uint8Array(W * H); for (let k = 0; k < W * H; k++) { const l = .299 * d[4 * k] + .587 * d[4 * k + 1] + .114 * d[4 * k + 2]; m[k] = l < thr ? 1 : 0; } return m; };
  const mP = mask(cP, 105), mD = mask(cD, 128);
  // long lines: dark runs (gaps <= 2 px) >= minLen, merged over neighbouring rows / columns
  function lines(m, horiz, minLen) {
    const A = horiz ? H : W, B = horiz ? W : H, at = (a, q) => (horiz ? m[a * W + q] : m[q * W + a]), runs = [];
    for (let a = 0; a < A; a++) { let s = -1, gap = 0; for (let q = 0; q <= B; q++) { const v = q < B && at(a, q); if (v) { if (s < 0) s = q; gap = 0; } else if (s >= 0) { gap++; if (gap > 2 || q === B) { const e = q - gap; if (e - s + 1 >= minLen) runs.push({a, s, e}); s = -1; gap = 0; } } } }
    const segs = []; for (const r of runs) { const g = segs.find(x => r.a - x.a1 <= 2 && r.a >= x.a1 && Math.min(r.e, x.e) - Math.max(r.s, x.s) > .5 * Math.min(r.e - r.s, x.e - x.s)); if (g) { g.a1 = r.a; g.sum += r.a; g.n++; g.s = Math.min(g.s, r.s); g.e = Math.max(g.e, r.e); } else segs.push({a0: r.a, a1: r.a, sum: r.a, n: 1, s: r.s, e: r.e}); }
    return segs.map(g => ({pos: +(g.sum / g.n).toFixed(1), s: g.s, e: g.e, thick: g.a1 - g.a0 + 1}));
  }
  const L = {P: {h: lines(mP, true, .08 * W), v: lines(mP, false, .08 * H)}, D: {h: lines(mD, true, .08 * W), v: lines(mD, false, .08 * H)}};
  const tolH = .012 * H, tolV = .008 * W;
  const unmatched = (A, B, tol) => A.filter(a => !B.some(x => Math.abs(x.pos - a.pos) <= tol && Math.min(a.e, x.e) - Math.max(a.s, x.s) >= .4 * Math.min(a.e - a.s, x.e - x.s))).map(a => [a.pos, a.s, a.e]);
  const extra = {h: unmatched(L.P.h, L.D.h, tolH), v: unmatched(L.P.v, L.D.v, tolV)}, missing = {h: unmatched(L.D.h, L.P.h, tolH), v: unmatched(L.D.v, L.P.v, tolV)};
  // each section frame: per edge the line position of best coverage in a window of +-3 % around the table value
  // the candidates: local maxima of the coverage >= 0.35; the one nearest to `near` (photo: the table value; drawing: the photo's line)
  function edge(m, horiz, pos, s, e, near) {
    let best = null, bc = 0; const cs = []; const win = horiz ? .03 * H : .03 * W, lo = Math.max(0, Math.round(pos - win)), hi = Math.min((horiz ? H : W) - 1, Math.round(pos + win));
    const s0 = Math.round(s + .1 * (e - s)), e0 = Math.round(e - .1 * (e - s));
    for (let a = lo; a <= hi; a++) { let c = 0; for (let q = s0; q <= e0; q++) { let v = 0; for (let d = -1; d <= 1 && !v; d++) { const aa = a + d; if (aa < 0 || aa >= (horiz ? H : W)) continue; v = horiz ? m[aa * W + q] : m[q * W + aa]; } c += v; } c /= Math.max(1, e0 - s0 + 1); cs.push([a, c]); if (c > bc + 1e-9) { bc = c; best = a; } }
    const pk = cs.filter(([a, c], k) => c >= .35 && (k === 0 || c >= cs[k - 1][1]) && (k === cs.length - 1 || c >= cs[k + 1][1]));
    if (!pk.length) return {pos: best, cov: +bc.toFixed(2)};
    pk.sort((x, y) => Math.abs(x[0] - near) - Math.abs(y[0] - near)); return {pos: pk[0][0], cov: +pk[0][1].toFixed(2)};
  }
  const frames = [];
  for (const [id, x0, x1, y0, y1] of sec) {
    const X0 = x0 / 100 * W, X1 = x1 / 100 * W, Y0 = y0 / 100 * H, Y1 = y1 / 100 * H, r = {id};
    for (const [k, horiz, pos, s, e] of [['oben', true, Y0, X0, X1], ['unten', true, Y1, X0, X1], ['links', false, X0, Y0, Y1], ['rechts', false, X1, Y0, Y1]]) {
      const p = edge(mP, horiz, pos, s, e, pos), d = edge(mD, horiz, pos, s, e, p.pos == null ? pos : p.pos);
      r[k] = {soll: +pos.toFixed(1), foto: p.pos, zeich: d.pos, cf: p.cov, cd: d.cov, dev: p.pos != null && d.pos != null ? +(Math.abs(p.pos - d.pos) / (horiz ? H : W) * 100).toFixed(2) : null};
    }
    frames.push(r);
  }
  // the overlay: the drawing at 50 % over the photo
  const o = document.createElement('canvas'); o.width = W; o.height = H; const g = o.getContext('2d'); g.drawImage(cP, 0, 0); g.globalAlpha = .5; g.drawImage(cD, 0, 0);
  return {frames, extra, missing, n: {P: [L.P.h.length, L.P.v.length], D: [L.D.h.length, L.D.v.length]}, overlay: o.toDataURL('image/png')};
}, ['data:image/png;base64,' + png.toString('base64'), 'data:image/png;base64,' + fs.readFileSync(DRAW).toString('base64'), BOX, W, H, sec]);
fs.writeFileSync(OUT, Buffer.from(res.overlay.split(',')[1], 'base64')); delete res.overlay;
const fail = [];
for (const f of res.frames) for (const k of ['oben', 'unten', 'links', 'rechts']) { const e = f[k], lim = k === 'oben' || k === 'unten' ? 1.2 : .8;
  if (e.cf < .35 || e.cd < .35) fail.push(f.id + ' ' + k + ' fehlt (Deckung Foto ' + e.cf + ', Zeichnung ' + e.cd + ')'); else if (e.dev > lim) fail.push(f.id + ' ' + k + ' ' + e.dev + ' % daneben'); }
const worst = {h: 0, v: 0}; for (const f of res.frames) for (const k of ['oben', 'unten', 'links', 'rechts']) { const e = f[k]; if (e.cf >= .35 && e.cd >= .35) { const q = k === 'oben' || k === 'unten' ? 'h' : 'v'; worst[q] = Math.max(worst[q], e.dev); } }
console.log(JSON.stringify({n: res.n, worst, extra: res.extra, missing: res.missing, frames: res.frames.map(f => f.id + ' ' + ['oben', 'unten', 'links', 'rechts'].map(k => k[0] + ':' + f[k].dev + '(' + f[k].cf + '/' + f[k].cd + ')').join(' '))}, null, 1));
console.log('FEHLER', fail.length, JSON.stringify(fail, null, 1));
await b.close();
