// V2e′ M-PLATZ in P1–P3, L1, L2, W: transport with ▦│◧, Zell-Blatt, Ghost/Federtaste, Glas, ROLLE auf eigenem Clip; screenshots
import { openVp, mk2, SETUP, sleep } from './v3-v2e2-lib.mjs';
import { mkCheck } from './v3-v2d-lib.mjs';
const {check, done} = mkCheck();
const VPS = process.argv[2] ? process.argv[2].split(',') : ['P1', 'P2', 'P3', 'L1', 'L2', 'W'];
const GEO = (P) => {
  const out = {bad: [], small: []}, vw = innerWidth, vh = innerHeight;
  const chk = (x, tag) => { const r = x.getBoundingClientRect(); if (!r.width || getComputedStyle(x).display === 'none') return;
    if (r.left < -.5 || r.right > vw + .5 || r.top < -.5 || r.bottom > vh + .5) out.bad.push(tag + ' ' + (x.textContent || '').trim().slice(0, 16) + ' out');
    if (x.scrollWidth > x.clientWidth + 1) out.bad.push(tag + ' ' + (x.textContent || '').trim().slice(0, 16) + ' clipped');
    const mh = P ? 44 : 36, mw = P ? 44 : 40, ext = x.classList.contains('ms-x') ? 12 : 0; if (!x.disabled && (r.height + ext < mh - .5 || r.width < mw - .5)) out.small.push(tag + ' ' + (x.textContent || '').trim().slice(0, 14) + ' ' + r.width.toFixed(0) + 'x' + r.height.toFixed(0)); };
  return {out, chk};
};
for (const vp of VPS) {
  const {b, p, errs, cdp} = await openVp(vp);
  const T = mk2(p, cdp), {E} = T;
  const P = vp[0] === 'P';
  await E(SETUP(true)); await E(() => window.SYNQUENZER.makeOwn(0, 4)); await E(() => window.SYNQUENZER.songView(true)); await sleep(300);
  // transport: every button fits its label; ▦│◧ 44 wide (P) / ≥ 36 (L)
  const tr = await E(() => [...document.querySelectorAll('.sv-top > *')].filter(e => !e.hidden).map(e => { const r = e.getBoundingClientRect(); return {c: (e.className.match(/sv-\w+/g) || []).pop(), w: +r.width.toFixed(1), h: +r.height.toFixed(1), x: r.x, cut: e.scrollWidth > e.clientWidth + 1 || [...e.children].some(c => c.scrollWidth > c.clientWidth + 1 && getComputedStyle(c).overflow !== 'visible')}; }));
  const gl = tr.find(x => x.c === 'sv-gl');
  const sideV = await E(() => document.getElementById('songView').classList.contains('side'));
  check(`${vp} ▦│◧ da (${gl && gl.w}×${gl && gl.h})`, gl && ((P || vp === 'W') && !sideV ? gl.w === 44 && gl.h >= (vp === 'W' ? 34 : 40) : gl.w >= 29 && gl.h >= 36), tr);      // W: the row is 34 px high as since V0c
  check(`${vp} Transport: nichts abgeschnitten, alles im Bild`, tr.every(x => !x.cut && x.x >= 0 && x.x + x.w <= (vp === 'W' ? 1280 : vp[0] === 'P' ? (vp === 'P1' ? 390 : vp === 'P2' ? 375 : 320) : vp === 'L1' ? 844 : 667) + .5), tr.filter(x => x.cut));
  check(`${vp} keine waagrechte Seiten-Rolle`, await E(() => document.documentElement.scrollWidth <= innerWidth + 1));
  // glass
  await T.tapSel('.sv-gl'); await sleep(200);
  await p.screenshot({path: `v3-v2e2-lay-${vp}-glas.png`});
  await T.tapSel('.sv-gl'); await sleep(150);
  // Zell-Blatt (hold on Synth 1 T4)
  let inf = await T.info();
  const r = inf.rows.indexOf('S1') - 1, cx = inf.canvas.x + 3 * 36 + 18 - inf.x0, cy = inf.canvas.y + inf.rulerH + r * inf.rowH + inf.rowH / 2;
  await T.down(cx, cy); await sleep(520); await T.up(); await sleep(300);
  const cs = await p.evaluate(`(() => { const s = document.querySelector('.pop.csheet'); if (!s) return null; const {out, chk} = (${GEO.toString()})(${P}); for (const x of s.querySelectorAll('button')) chk(x, 'cs'); const r = s.getBoundingClientRect(); out.r = [r.x, r.y, r.width, r.height].map(Math.round); return out; })()`);
  await p.screenshot({path: `v3-v2e2-lay-${vp}-zelle.png`});
  check(`${vp} Zell-Blatt: im Bild, nichts abgeschnitten, Treffer ≥ ${P ? '44×44' : '40×36'}`, cs && cs.bad && !cs.bad.length && !cs.small.length, cs);
  if (await T.pop()) await T.tapPop('Abbrechen');
  // own clip ROLLE head
  const r0 = inf.rows.indexOf('S1') - 1;
  await T.tap(inf.canvas.x + 4 * 36 + 18 - inf.x0, inf.canvas.y + inf.rulerH + r0 * inf.rowH + inf.rowH / 2); await sleep(500);
  const hd = await E(() => { const t = document.querySelector('#rollSheet .sh-title'), i = document.querySelector('#rollSheet .rinfo'); return t ? {t: t.textContent, cut: t.scrollWidth > t.clientWidth + 1, i: i && i.textContent} : null; });
  await p.screenshot({path: `v3-v2e2-lay-${vp}-rolle.png`});
  check(`${vp} ROLLE auf eigenem Clip: Kopf „Synth 1 · Song Takt 5“, Zeile „eigener Clip …“`, hd && /Synth 1 · Song Takt 5/.test(hd.t) && /eigener Clip/.test(hd.i), hd);
  await T.tapSel('#rollSheet .sh-x'); await sleep(200);
  // drag: lifted in the clip view (spring field), then over the song (ghost + insertion line)
  await E(() => window.SYNQUENZER.songView(false)); await sleep(200);
  const k = await T.key(0);
  await T.down(k.x, k.y); await sleep(500);
  const cn = await E(() => { const c = document.querySelector('.corner.sw'); const r = c.getBoundingClientRect(); return {cut: c.scrollWidth > c.clientWidth + 1 || c.scrollHeight > c.clientHeight + 1, txt: c.textContent, w: r.width, h: r.height}; });
  const gh = await E(() => { const g = document.querySelector('.drg-ghost'); const r = g.getBoundingClientRect(); return {x: r.x, r: r.right, y: r.y, b: r.bottom, vw: innerWidth}; });
  await p.screenshot({path: `v3-v2e2-lay-${vp}-angehoben.png`});
  check(`${vp} Federtaste SONG ⇄ zeigt „↖ IN DEN SONG“ (schmal „↖ SONG“) ohne Abschneiden`, /↖ (IN DEN )?SONG/.test(cn.txt) && !cn.cut, cn);
  check(`${vp} Geist ganz im Bild`, gh.x >= 0 && gh.r <= gh.vw + .5 && gh.y >= 0, gh);
  await sleep(700);
  inf = await T.info();
  await T.glide(k.x, k.y, inf.canvas.x + 2 * 36 + 6, inf.canvas.y + inf.canvas.h * .5, 8, 16);
  await sleep(100);
  await p.screenshot({path: `v3-v2e2-lay-${vp}-ziehen.png`});
  await T.up(); await sleep(300);
  await p.screenshot({path: `v3-v2e2-lay-${vp}-frage.png`});
  if (await T.pop()) await T.tapPop('Abbrechen');
  check(`${vp} 0 Konsolenfehler`, !errs.length, errs);
  await b.close();
}
process.exit(done() ? 1 : 0);
