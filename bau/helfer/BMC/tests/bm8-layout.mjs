// Menüpunkt „Kurven löschen“: in allen Formaten sichtbar, nicht abgeschnitten, Treffer ≥ 44 px, kein Überlauf/Layout-Sprung; Bilder
import { createRequire } from 'module';
import { FILE, ok, summary } from './lib.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const VPS = [[428, 926], [926, 428], [390, 844], [375, 667], [320, 568], [844, 390], [667, 375]];
const b = await chromium.launch(); const errs = [];
for (const [w, h] of VPS) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true}); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 60000});
  await p.evaluate(() => document.fonts && document.fonts.ready);
  const r = await p.evaluate(() => {
    const s = S.tracks[0].clips.findIndex(c => !c), s2 = S.tracks[0].clips.findIndex((c, i) => !c && i !== s);
    SYNQUENZER.setClip(0, s, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: 1, n: 60, v: .8}], cv: {bd: [[0, 0], [1, .5]]}});
    SYNQUENZER.setClip(0, s2, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: 1, n: 60, v: .8}]});
    const H0 = document.scrollingElement.scrollHeight;
    openClipSheet(0, s2); const sh = EL.clipSheet, hNo = sh.getBoundingClientRect().height;
    closeClipSheet(); openClipSheet(0, s);
    const btn = [...sh.querySelectorAll('button')].find(x => /^Kurven löschen/.test(x.textContent.trim()));
    const br = btn.getBoundingClientRect(), small = btn.querySelector('small');
    const others = [...sh.querySelectorAll('.cgrid .hb')].filter(x => x !== btn).map(x => Math.round(x.getBoundingClientRect().height));
    const hit = document.elementFromPoint(br.left + br.width / 2, br.top + br.height / 2);
    const cut = [btn, small].filter(x => x.scrollWidth > x.clientWidth + 1).length;
    const sr = sh.getBoundingClientRect();
    return {w: Math.round(br.width), h: Math.round(br.height), minOther: Math.min(...others), hit: hit === btn || btn.contains(hit), cut, inView: br.bottom <= innerHeight + .5 && br.top >= 0 && br.right <= innerWidth + .5,
      sheetIn: sr.bottom <= innerHeight + .5, bodyScroll: sh.querySelector('.sh-body') ? sh.querySelector('.sh-body').scrollHeight - sh.querySelector('.sh-body').clientHeight : 0,
      page: [H0, document.scrollingElement.scrollHeight, innerHeight], hNo: Math.round(hNo), hCv: Math.round(sr.height), xScroll: document.scrollingElement.scrollWidth - innerWidth, s};
  });
  await p.screenshot({path: new URL(`../bm8-shots/clip-menue-${w}x${h}.png`, import.meta.url).pathname});
  const tag = `${w}×${h}`;
  ok(`${tag} Menüpunkt sichtbar, trifft, nicht abgeschnitten`, r.inView && r.hit && r.cut === 0, r);
  ok(`${tag} Treffer ≥ 44 px (wie die anderen Clip-Tasten)`, r.h >= 44 || r.h >= r.minOther, {h: r.h, andere: r.minOther});
  ok(`${tag} kein Überlauf, keine Seitenhöhen-Änderung`, r.xScroll <= 0 && r.page[1] === r.page[0] && r.sheetIn, {page: r.page, sheet: [r.hNo, r.hCv], bodyScroll: r.bodyScroll});
  await ctx.close();
}
ok('Konsole ohne Fehler', !errs.length, errs);
await b.close(); process.exit(summary());
