// GL1-Glitch-Umfrage: node survey.mjs <index.html> <ordner>  → survey.json + Fotos
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path';
const [file, out] = process.argv.slice(2); fs.mkdirSync(out, {recursive: true});
const here = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']});
const VPS = [[428, 926], [926, 428], [926, 370]], res = [];
for (const [w, h] of VPS) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1500);
  for (const f of ['setup.js', 'scan.js', 'views.js']) await p.addScriptTag({path: path.join(here, f)});
  await p.evaluate(() => __gl1Setup());
  await p.evaluate(() => { SYNQUENZER.chsOpen(true); S.tracks[0].clips[7] = {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [0, 2, 4, 5, 7, 9, 11, 12].map((d, k) => ({t: k * .5, d: .4, n: 48 + d, v: .8})), lf: {dir: 'rev'}}; clipChanged(0, 7); SYNQUENZER.blockMake(0, 7); SYNQUENZER.vd3.cut(true); S.song.loop = {on: true, a: 8, b: 16}; songChanged(); });
  const n = await p.evaluate(() => __gl1Views.length);
  for (let i = 0; i < n; i++) {
    const nm = await p.evaluate(i => __gl1Views[i].name, i);
    const a0 = await p.evaluate(() => { closePop(); closeSheets(); closeMenu(); try { vvClose(); } catch (e) {} setSongView(false); return __gl1Anchors(); });
    await p.waitForTimeout(250);
    const a1 = await p.evaluate(() => __gl1Anchors());
    let ok = true; try { await p.evaluate(i => __gl1Views[i].open(), i); } catch (e) { ok = false; res.push({vp: w + 'x' + h, view: nm, err: String(e).slice(0, 200)}); }
    if (!ok) continue;
    await p.waitForTimeout(700);
    const s = await p.evaluate(i => { const r = __gl1Views[i].root(); const el = typeof r === 'string' ? document.querySelector(r) : r; if (!el) return null; return __gl1Scan(el, {}); }, i);
    await p.screenshot({path: path.join(out, `${nm}-${w}x${h}.png`)});
    await p.evaluate(i => { const v = __gl1Views[i]; if (v.close) v.close(); }, i);
    await p.waitForTimeout(500);
    const a2 = await p.evaluate(() => { closePop(); closeSheets(); closeMenu(); try { vvClose(); } catch (e) {} setSongView(false); return __gl1Anchors(); });
    await p.waitForTimeout(250);
    const a3 = await p.evaluate(() => __gl1Anchors());
    const jump = Object.keys(a1).filter(k => a3[k] !== a1[k]).map(k => k + ': ' + a1[k] + ' → ' + a3[k]);
    res.push({vp: w + 'x' + h, view: nm, scan: s, jump, errs: errs.splice(0)});
  }
  await ctx.close();
}
fs.writeFileSync(path.join(out, 'survey.json'), JSON.stringify(res, null, 1));
const sum = r => r.scan ? ['textOverlap', 'cutV', 'cutH', 'btnOverlap', 'covered', 'outside'].map(k => k + ' ' + r.scan[k].length).join(' · ') + ' · ✕ ' + (r.scan.x.length ? r.scan.x.map(x => x.full ? 'ok' : 'TEIL').join('/') : 'keins') : (r.err || 'keine Wurzel');
for (const r of res) console.log(r.vp, r.view.padEnd(18), sum(r), r.jump && r.jump.length ? ' SPRUNG ' + r.jump.join(' ; ') : '', r.errs && r.errs.length ? ' ERR ' + r.errs.join(' | ').slice(0, 200) : '');
await b.close();
