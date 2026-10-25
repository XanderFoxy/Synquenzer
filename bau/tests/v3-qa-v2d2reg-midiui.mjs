// QA regression VS2b: MIDI export via the real menu (Umfang Szene / Alle Szenen / Song → Exportieren), viewer-like (claude.use
// downloads mock) and standalone (browser download); zip store-only with a .mid inside; base vs new, P1 and L1
import { open, APP } from './v3-v2d-pw.mjs';
import fs from 'fs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2c′-fix.html';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2d2reg/';
const unzip = z => { const out = []; let i = 0; const dv = new DataView(z.buffer, z.byteOffset, z.byteLength); while (i + 30 <= z.length && dv.getUint32(i, true) === 0x04034b50) { const m = dv.getUint16(i + 8, true), cs = dv.getUint32(i + 18, true), nl = dv.getUint16(i + 26, true), xl = dv.getUint16(i + 28, true); const name = Buffer.from(z.slice(i + 30, i + 30 + nl)).toString(); const d = z.slice(i + 30 + nl + xl, i + 30 + nl + xl + cs); out.push({name, m, mthd: Buffer.from(d.slice(0, 4)).toString(), n: d.length, sum: d.reduce((a, b) => (a * 31 + b) >>> 0, 7)}); i += 30 + nl + xl + cs; } return out; };
const res = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) for (const mode of ['viewer', 'standalone']) {
  const {b, p, errs} = await open({width: w, height: h}, file);
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); });
  if (mode === 'viewer') await p.evaluate(() => { window.__got = []; window.claude = {use: async k => (k === 'downloads' ? {save: async ({filename, data}) => { window.__got.push({filename, type: data.type, bytes: Array.from(new Uint8Array(await data.arrayBuffer()))}); }} : null)}; });
  const r = {};
  for (const seg of ['Szene 1', 'Alle Szenen', 'Song']) {
    await p.click('#bMenu'); await p.waitForTimeout(400);
    const sb = p.locator('#menu button', {hasText: new RegExp('^' + seg + '$')}).filter({visible: true}).first();
    if (!(await sb.count())) { r[seg] = 'no seg button'; await p.keyboard.press('Escape'); continue; }
    await sb.scrollIntoViewIfNeeded(); await sb.click(); await p.waitForTimeout(150);
    const ex = p.locator('#menu button', {hasText: /^Exportieren$/}).filter({visible: true}).first();
    await ex.scrollIntoViewIfNeeded();
    const box = await ex.boundingBox();
    let dl = null; const dlP = mode === 'standalone' ? p.waitForEvent('download', {timeout: 6000}).catch(() => null) : null;
    await ex.click(); await p.waitForTimeout(900);
    if (dlP) dl = await dlP;
    let bytes = null, fname = null, type = null;
    if (mode === 'viewer') { const g = await p.evaluate(() => window.__got.pop()); if (g) { bytes = Uint8Array.from(g.bytes); fname = g.filename; type = g.type; } }
    else if (dl) { fname = dl.suggestedFilename(); const pth = D + 'mid-' + name + vp + seg.replace(/ /g, '') + '.zip'; await dl.saveAs(pth); bytes = new Uint8Array(fs.readFileSync(pth)); }
    r[seg] = {fname, type, box: box && [Math.round(box.width), Math.round(box.height), box.x >= 0 && box.x + box.width <= w], zip: bytes ? unzip(bytes) : null};
    await p.evaluate(() => window.SYNQUENZER.closeMenu && window.SYNQUENZER.closeMenu()); await p.waitForTimeout(200);
  }
  r.errs = errs.filter(e => !/Failed to load resource/.test(e));
  res[name + '-' + vp + '-' + mode] = r; await b.close();
}
for (const k of Object.keys(res).filter(k => k.startsWith('new'))) { const A = res[k.replace('new', 'base')], B = res[k];
  for (const f of Object.keys(B)) { const s = JSON.stringify(B[f]), same = s === JSON.stringify(A[f]); console.log(k, f, same ? 'same' : 'DIFF', s.slice(0, 400), same ? '' : '\n   base ' + JSON.stringify(A[f]).slice(0, 400)); } }
