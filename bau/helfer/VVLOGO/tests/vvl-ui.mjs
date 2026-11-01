// VV-LOGO: the row „Abspann“ in the sheet „Video“. Logo there / missing / not playable / only .mov / file:// (no access),
// the choice remembered (reload), [Andere Datei wählen …] (own file in IndexedDB has priority), touch sizes, layout in 6 viewports
// against R-4261, the screen key over a bright picture, an export without logo (length as before).
import * as L from './vvl-lib.mjs';
import { chromium } from 'playwright';
import path from 'path';
const C = [], X = {};
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const row = p => p.evaluate(() => { const u = VV.ui; if (!u || !u.bLogo) return null; const s = u.bLogo.querySelector('small');
  return {dis: u.bLogo.disabled, small: s.textContent, pressed: u.bLogo.getAttribute('aria-pressed'), on: u.bLogo.classList.contains('on'), fileDis: u.bFile.disabled, info: null}; });
const openSheet = async p => { await p.evaluate(() => SYNQUENZER.vvOpen()); await p.waitForFunction(() => VVL.st === 'ok' || VVL.st === 'fehlt', null, {timeout: 15000}); await p.waitForTimeout(150); };
const tapEl = async (p, k) => { const bx = await p.evaluate(k => { const e = VV.ui[k]; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, k); await p.mouse.click(bx.x, bx.y); await p.waitForTimeout(150); };
const bLogo = 'bLogo', bFile = 'bFile';

// 1) logo there (mp4): on by default, tap → aus, remembered over a reload, tap → an
{
  const s = await L.serve('mp4'); const ctx = await b.newContext({viewport: {width: 390, height: 844}});
  let {p, errs} = await L.open(s.url, {browser: b, ctx});
  await openSheet(p); let r = await row(p);
  C.push(['mp4: Schalter aktiv, an', !r.dis && r.on && r.pressed === 'true' && r.small === 'an', r]);
  await tapEl(p, bLogo); r = await row(p);
  C.push(['mp4: Tipp → aus', !r.on && r.small === 'aus' && r.pressed === 'false', r]);
  await p.reload(); await p.waitForTimeout(1200); await p.mouse.click(5, 300); await openSheet(p); r = await row(p);
  C.push(['Wahl gemerkt (nach Neuladen aus)', !r.on && r.small === 'aus', r]);
  X.offMake = await (async () => { await L.song(p); await p.evaluate(() => SYNQUENZER.vvTest({opus: true})); const m = await p.evaluate(() => SYNQUENZER.vvMake({fmt: '16:9'})); return {logo: m.logo, dur: m.dur}; })();
  const ref = await p.evaluate(() => VV.last.dur);
  C.push(['aus: Video ohne Abspann, Länge wie bisher', X.offMake.logo === null && Math.abs(X.offMake.dur - ref) < 1e-9, X.offMake]);
  await p.evaluate(() => SYNQUENZER.vvOpen()); await p.waitForTimeout(100);
  await tapEl(p, bLogo); r = await row(p);
  C.push(['mp4: Tipp → wieder an', r.on && r.small === 'an', r]);
  await p.reload(); await p.waitForTimeout(1200); await p.mouse.click(5, 300); await openSheet(p); r = await row(p);
  C.push(['Wahl gemerkt (nach Neuladen an)', r.on, r]);
  // screen key over a bright picture: the logo's black does not cover (a plain draw would)
  X.key = await p.evaluate(async () => {
    const v = VVL.v; await vvlSeek(v, 1); const c = document.createElement('canvas'); c.width = 400; c.height = 300; const g = c.getContext('2d');
    const at = (x, y) => g.getImageData(x, y, 1, 1).data[0];
    g.fillStyle = 'rgb(200,200,200)'; g.fillRect(0, 0, 400, 300); vvlLogo(g, 400, 300, v, 1);
    const sz = 300 * .6, ox = (400 - sz) / 2, oy = (300 - sz) / 2, corner = at(ox + 5, oy + 5), mid = at(200, oy + sz * .05);
    g.fillRect(0, 0, 400, 300); g.drawImage(v, ox, oy, sz, sz); const plain = at(ox + 5, oy + 5);
    return {corner, mid, plain, sz};
  });
  C.push(['Screen-Key: kein schwarzer Kasten über hellem Bild', X.key.corner >= 195 && X.key.mid >= 195 && X.key.plain < 30, X.key]);
  C.push(['mp4: keine Konsolenfehler', errs.length === 0, errs]);
  await ctx.close(); await s.close();
}
// 2) logo missing / not playable: greyed, „Logo fehlt“, export without Abspann and without error
for (const mode of ['none', 'bad']) {
  const s = await L.serve(mode); const ctx = await b.newContext({viewport: {width: 390, height: 844}});
  const {p, errs, net404} = await L.open(s.url, {browser: b, ctx});
  await openSheet(p); const r = await row(p);
  C.push([mode + ': ausgegraut, „Logo fehlt“', r.dis && !r.on && r.small === 'Logo fehlt' && r.pressed === 'false' && !r.fileDis, r]);
  await L.song(p); await p.evaluate(() => SYNQUENZER.vvTest({opus: true}));
  const m = await p.evaluate(() => SYNQUENZER.vvMake({fmt: '9:16'}).then(x => ({logo: x.logo, dur: x.dur, last: VV.last.dur})).catch(e => ({err: String(e)})));
  C.push([mode + ': Video ohne Abspann, kein Fehler', !m.err && m.logo === null && Math.abs(m.dur - m.last) < 1e-9, m]);
  const med = s.hits.filter(x => /medien/.test(x));
  C.push([mode + ': erst .mp4, dann .mov gefragt', med[0] === '/medien/abspann-logo.mp4' && med[1] === '/medien/abspann-logo.mov', med]);
  C.push([mode + ': keine Konsolenfehler (außer 404 der fehlenden Datei)', errs.length === 0, {errs, net404}]);
  X[mode + '404'] = net404;
  await ctx.close(); await s.close();
}
// 3) file:// (a preview without access): no request, „Logo fehlt“, no console error at all
{
  const ctx = await b.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(L.DIR, 'index.html')); await p.waitForTimeout(1200); await p.mouse.click(5, 300);
  await openSheet(p); const r = await row(p);
  C.push(['file://: „Logo fehlt“, keine Fehler', r.dis && r.small === 'Logo fehlt' && errs.length === 0, {r, errs}]);
  await ctx.close();
}
// 4) own file via [Andere Datei wählen …]: stored, priority over the site's file, after a reload too
{
  const s = await L.serve('mp4'); const ctx = await b.newContext({viewport: {width: 390, height: 844}});
  const {p, errs} = await L.open(s.url, {browser: b, ctx});
  await openSheet(p);
  const [fc] = await Promise.all([p.waitForEvent('filechooser', {timeout: 5000}), tapEl(p, bFile)]);
  X.accept = await p.evaluate(() => VVL.inp && VVL.inp.accept);
  await fc.setFiles(path.join(L.DIR, 'tests', 'test-logo.mov'));
  await p.waitForFunction(() => VVL.own, null, {timeout: 15000}).catch(() => {});
  let r = await row(p), inf = await p.evaluate(() => SYNQUENZER.vvLogo());
  C.push(['eigene Datei: gewählt (accept=video/*), an · eigene Datei', X.accept === 'video/*' && inf.own && inf.name === 'test-logo.mov' && r.small === 'an · eigene Datei', {r, inf}]);
  const before = s.hits.filter(x => /medien/.test(x)).length;
  await p.reload(); await p.waitForTimeout(1200); await p.mouse.click(5, 300); await openSheet(p);
  inf = await p.evaluate(() => SYNQUENZER.vvLogo());
  const after = s.hits.filter(x => /medien/.test(x)).length;
  C.push(['eigene Datei hat Vorrang (nach Neuladen, Seite nicht gefragt)', inf.own && inf.name === 'test-logo.mov' && after === before, {inf, before, after}]);
  await L.song(p); await p.evaluate(() => SYNQUENZER.vvTest({opus: true}));
  const m = await p.evaluate(() => SYNQUENZER.vvMake({fmt: '16:9'}).then(x => x.logo));
  C.push(['eigene Datei im Video', m && m.own && m.name === 'test-logo.mov', m]);
  // a file that does not play: refused, the logo stays
  const [fc2] = await Promise.all([p.waitForEvent('filechooser', {timeout: 5000}), (async () => { await p.evaluate(() => SYNQUENZER.vvOpen()); await p.waitForTimeout(100); await tapEl(p, bFile); })()]);
  await fc2.setFiles({name: 'kaputt.mp4', mimeType: 'video/mp4', buffer: Buffer.from('kein video')});
  await p.waitForTimeout(1500);
  inf = await p.evaluate(() => SYNQUENZER.vvLogo());
  C.push(['unbrauchbare Datei abgelehnt, Logo bleibt', inf.own && inf.name === 'test-logo.mov', inf]);
  C.push(['eigene Datei: keine Konsolenfehler', errs.length === 0, errs]);
  await ctx.close(); await s.close();
}
// 5) touch sizes + layout (no cut labels, the sheet's overflow compared with R-4261)
{
  const s = await L.serve('mp4');
  const VPS = [[390, 844], [375, 667], [320, 568], [844, 390], [667, 375], [926, 428]];
  X.lay = [];
  for (const [w, h] of VPS) {
    const res = {};
    for (const app of ['index.html', 'base.html']) {
      const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
      const {p} = await L.open(s.url, {browser: b, ctx, app: app === 'base.html' ? 'R-4261.html' : app, touch: true});
      await p.evaluate(() => SYNQUENZER.vvOpen()); await p.waitForTimeout(app === 'index.html' ? 800 : 300);
      res[app] = await p.evaluate(() => {
        const u = VV.ui, ctl = u.sh.querySelector('.vvctl'), q = e => { const r = e.getBoundingClientRect(); return {w: Math.round(r.width), h: Math.round(r.height), sw: e.scrollWidth, cw: e.clientWidth}; };
        const o = {ctlOver: ctl.scrollHeight - ctl.clientHeight, docOver: document.documentElement.scrollHeight - innerHeight, stage: Math.round(u.stage.getBoundingClientRect().height)};
        if (u.bLogo) { o.logo = q(u.bLogo); o.file = q(u.bFile); const b1 = u.bLogo.querySelector('b'), s1 = u.bLogo.querySelector('small'); o.cut = [b1, s1, u.bFile, u.bLogo].filter(e => e.scrollWidth > e.clientWidth + .5 || e.getBoundingClientRect().right > u.sh.getBoundingClientRect().right).length;
          const lb = u.bLogo.closest('.vvrow').querySelector('.lbl'); o.lbl = lb.scrollWidth <= lb.clientWidth + .5; }
        return o;
      });
      if (app === 'index.html') await p.screenshot({path: L.OUT + `ui-${w}x${h}.png`});
      await ctx.close();
    }
    X.lay.push({vp: w + '×' + h, neu: res['index.html'], alt: res['base.html']});
  }
  for (const x of X.lay) {
    const n = x.neu;
    C.push([x.vp + ': Ziele ≥ 44 px, nichts abgeschnitten', n.logo.h >= 44 && n.logo.w >= 44 && n.file.h >= 44 && n.file.w >= 44 && n.cut === 0 && n.lbl, n]);
    C.push([x.vp + ': kein Seitenüberlauf', n.docOver <= 0, {neu: n.docOver, alt: x.alt.docOver}]);
    C.push([x.vp + ': Bedienspalte rollt nicht mehr als vorher', n.ctlOver <= Math.max(0, x.alt.ctlOver), {neu: n.ctlOver, alt: x.alt.ctlOver}]);
  }
  await s.close();
}
L.report('ui', C, X);
await b.close();
