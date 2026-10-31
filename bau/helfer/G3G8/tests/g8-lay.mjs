// G8: „Länge“ mit 16 / 32 / 64 – Aufnahme-Blatt (● halten bzw. LÄNGE-Chip) und Menü in allen Formaten: Tasten ≥ 44 × 44, nichts abgeschnitten
import {open, sleep} from './g3-lib.mjs';
import {chromium} from 'playwright';
import fs from 'fs';
const OUT = new URL('./out/', import.meta.url).pathname; fs.mkdirSync(OUT, {recursive: true});
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const F = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['XL', 926, 428]];
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
for (const [nm, w, h] of F) {
  const H = await open({br, viewport: {width: w, height: h}, touch: true}), p = H.p;
  // Aufnahme-Blatt öffnen: LÄNGE-Chip, sonst ● lange halten
  const chip = await p.evaluate(() => { const e = document.querySelector('#chipLen') || [...document.querySelectorAll('button')].find(b => /LÄNGE/.test(b.textContent)); if (!e || !e.offsetParent) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  if (chip) await p.mouse.click(chip.x, chip.y);
  else { const r = await p.evaluate(() => { const e = document.querySelector('#bRec') || document.querySelector('.brec'); const q = e.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; }); await p.mouse.move(r.x, r.y); await p.mouse.down(); await sleep(700); await p.mouse.up(); }
  await sleep(400);
  const m = await p.evaluate(() => {
    const s = document.querySelector('#roLen'); if (!s) return null;
    const bs = [...s.querySelectorAll('button')].map(b => { const r = b.getBoundingClientRect(); return {t: b.textContent, w: r.width, h: r.height, x0: r.left, x1: r.right, y0: r.top, y1: r.bottom, clip: b.scrollWidth > b.clientWidth + 1}; });
    const pop = s.closest('.pop') || s.parentElement, pr = pop.getBoundingClientRect();
    return {bs, pop: {x0: pr.left, x1: pr.right, y0: pr.top, y1: pr.bottom}, iw: innerWidth, ih: innerHeight, sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight};
  });
  ok(m && m.bs.map(b => b.t).join(',') === 'AUTO,1,2,4,8,16,32,64', `${nm}: Länge AUTO … 64 im Aufnahme-Blatt (${m ? m.bs.map(b => b.t).join(' ') : 'nicht offen'})`);
  if (m) {
    const small = m.bs.filter(b => b.w < 44 - .5 || b.h < 44 - .5), out = m.bs.filter(b => b.x0 < -.5 || b.x1 > m.iw + .5 || b.y0 < -.5 || b.y1 > m.ih + .5), clip = m.bs.filter(b => b.clip);
    ok(!small.length, `${nm}: Tasten ≥ 44 × 44 (kleinste ${Math.min(...m.bs.map(b => b.w)).toFixed(1)} × ${Math.min(...m.bs.map(b => b.h)).toFixed(1)})`);
    ok(!out.length && !clip.length && m.sw <= m.iw, `${nm}: nichts abgeschnitten, kein waagrechtes Rollen`);
  }
  await p.screenshot({path: OUT + 'g8-' + nm + '-laenge.png'});
  // Auswahl 64 wirkt
  await p.evaluate(() => { const b = document.querySelector('#roLen button[data-v="64"]'); if (b) b.click(); });
  const rl = await p.evaluate(() => SYNQUENZER.runtime().rec.length);
  ok(rl === 64 || rl === '64', `${nm}: Tipp auf 64 → Aufnahmelänge ${rl}`);
  ok(!H.errs.length, `${nm}: keine Konsolenfehler ` + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
await br.close();
console.log(fail ? `FEHLER: ${fail}` : 'ALLE OK'); process.exit(fail ? 1 : 0);
