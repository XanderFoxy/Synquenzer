// VS3 Layout (M-PLATZ): STIMME-Zeile in der Matrix, Takes-Blatt, Herkunfts-Hinweis, Spur-Blatt – P1–P3, L1, L2, 926×428
import {open, sleep} from './v3-vs3-h.mjs';
import {chromium} from 'playwright';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const VP = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], XL: [926, 428]};
const sine = (f, n) => { const x = []; for (let i = 0; i < n; i++) x.push(Math.round(Math.sin(2 * Math.PI * f * i / 48000) * 9000 * (0.3 + 0.7 * Math.abs(Math.sin(i / 9000))))); return x; };
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [k, [w, h]] of Object.entries(VP)) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const H = await open({br, ctx}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  const h0 = await p.evaluate(() => document.documentElement.scrollHeight);
  const r1 = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 2}), sine(220, 96000));
  await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 2}), sine(330, 96000));
  await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 1, len: 1}), sine(440, 48000));
  await p.evaluate(t => { SYNQUENZER.selectTrack(t); SYNQUENZER.selectSlot(t, 0); }, r1.track); await sleep(500);
  const g = await p.evaluate(t => { const h = document.querySelector('.th[data-t="' + t + '"]'), c = document.querySelector('.slot[data-t="' + t + '"][data-s="0"]'), hr = h.getBoundingClientRect(), cr = c.getBoundingClientRect();
    return {hcls: h.className, sb: h.querySelector('.sb').textContent, hv: hr.width > 0 && hr.right <= innerWidth + .5 && hr.bottom <= innerHeight + .5, cv: cr.width > 0, wave: !!c.querySelector('.mini svg path'), H: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth}; }, r1.track);
  ok(/vox/.test(g.hcls) && !/voxoff/.test(g.hcls) && g.hv && g.cv && g.wave, `${k} Matrix: STIMME-Kopf „${g.sb}“ sichtbar, Clip mit Wellenform`);
  ok(g.H === h0 && g.sw <= w, `${k} kein Layout-Sprung (Höhe ${h0} → ${g.H}), kein waagrechtes Rollen (${g.sw})`);
  await p.screenshot({path: `v3-vs3-${k}-matrix.png`});
  await p.evaluate(() => SYNQUENZER.tkSheet()); await sleep(400);
  const s = await p.evaluate(() => { const e = document.querySelector('.pop.tksheet'); if (!e) return null; const r = e.getBoundingClientRect(), bs = [...e.querySelectorAll('button')].filter(b => b.offsetParent);
    return {in: r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + .5 && r.bottom <= innerHeight + .5, r: [r.left, r.top, r.width, r.height].map(Math.round),
      small: bs.filter(b => { const q = b.getBoundingClientRect(); return q.height < 44 - .5 || q.width < 44 - .5; }).map(b => b.textContent.trim() + ' ' + Math.round(b.getBoundingClientRect().width) + '×' + Math.round(b.getBoundingClientRect().height)),
      cut: bs.filter(b => b.scrollWidth > b.clientWidth + 1).map(b => b.textContent.trim()), txt: [...e.querySelectorAll('.tk-pick small,.tk-pick b')].filter(x => x.scrollWidth > x.clientWidth + 1).map(x => x.textContent), rows: e.querySelectorAll('.tkrow').length,
      list: getComputedStyle(e.querySelector('.tklist')).overflowY}; });
  ok(s && s.in && s.rows === 2, `${k} Takes-Blatt im Bild ${s && JSON.stringify(s.r)}, 2 Takes`);
  ok(s && !s.small.length, `${k} Takes-Blatt: Knöpfe ≥ 44 × 44 ${s && JSON.stringify(s.small)}`);
  ok(s && !s.cut.length && !s.txt.length, `${k} Takes-Blatt: nichts abgeschnitten ${s && JSON.stringify(s.cut.concat(s.txt))}`);
  await p.screenshot({path: `v3-vs3-${k}-takes.png`});
  await p.evaluate(() => { const b = document.querySelector('.pop.tksheet'); if (b) SYNQUENZER.closePop ? SYNQUENZER.closePop() : document.body.click(); });
  await p.keyboard.press('Escape'); await sleep(200);
  const o = await p.evaluate(() => { SYNQUENZER.tkOrigin('https://raw.githack.com'); SYNQUENZER.tkOriginHint(); const e = document.querySelector('.pop.tkorigin'); if (!e) return null; const r = e.getBoundingClientRect(), bs = [...e.querySelectorAll('button')];
    return {in: r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + .5 && r.bottom <= innerHeight + .5, small: bs.filter(b => b.getBoundingClientRect().height < 43.5).map(b => b.textContent), cut: bs.filter(b => b.scrollWidth > b.clientWidth + 1).map(b => b.textContent)}; });
  ok(o && o.in && !o.small.length && !o.cut.length, `${k} Herkunfts-Hinweis im Bild, Knöpfe ≥ 44 px ${JSON.stringify(o)}`);
  await p.screenshot({path: `v3-vs3-${k}-hinweis.png`});
  ok(!H.errs.length, `${k} keine Konsolenfehler ${JSON.stringify(H.errs.slice(0, 2))}`);
  await ctx.close();
}
await br.close();
console.log(fail ? `\n${fail} FEHLER` : '\nalles grün');
process.exit(fail ? 1 : 0);
