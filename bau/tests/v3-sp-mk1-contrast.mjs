// QA MK1 (FP-TOUCH): WCAG contrast of every text in the AM panel against the panel field (computed colour incl. opacity)
import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
for (const [w, h, sel] of [[844, 390, 0], [844, 390, 1]]) {
const page = await browser.newPage({viewport: {width: w, height: h}}); await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(600);
if (sel) await page.evaluate(() => { MKUI.setWahl(1, 5); MKUI.render(); }).catch(e => console.log('setWahl', String(e).slice(0, 100)));
await page.waitForTimeout(300);
const res = await page.evaluate(() => {
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const lum = ([r, g, b]) => { const f = x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const field = [0x1f, 0x20, 0x23];  // panel gradient mid (#25272b .. #17181a)
  const out = [];
  for (const e of document.querySelectorAll('#synthSheet .mkbody *')) {
    if (e.children.length || !(e.textContent || '').trim() || !e.offsetParent) continue;
    const cs = getComputedStyle(e); let c = parse(cs.color); if (!c) continue;
    let op = 1; for (let p = e; p && p !== document.body; p = p.parentElement) op *= +getComputedStyle(p).opacity;
    const a = c[3] * op, mix = [0, 1, 2].map(i => c[i] * a + field[i] * (1 - a));
    const L1 = lum(mix), L2 = lum(field), cr = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
    const dark = !!e.closest('.dark, .mdk');
    out.push({t: e.textContent.trim().slice(0, 14), cr: +cr.toFixed(2), dark, cls: (e.className && e.className.baseVal == null ? e.className : '') + '|' + (e.parentElement.className || '')});
  }
  return out;
});
const low = res.filter(x => x.cr < 4.5);
console.log(`L1 ${sel ? 'FILTER selected' : 'SPIEL'}: ${res.length} texts, below 4.5:1: ${low.length}`);
const byCls = {}; for (const x of low) { const k = x.cls.slice(0, 40) + (x.dark ? ' [dark]' : ''); (byCls[k] = byCls[k] || []).push(x.t + ' ' + x.cr); }
for (const k in byCls) console.log('  ' + k + ': ' + byCls[k].slice(0, 8).join(', ') + (byCls[k].length > 8 ? ' …(' + byCls[k].length + ')' : ''));
await page.close();
}
await browser.close();
