// NDI-Tests: gemeinsame Helfer (Playwright + vorinstalliertes Chromium)
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const HERE = __dirname, ROOT = path.resolve(HERE, '..');
const FILE = process.env.NDI_FILE || path.join(ROOT, 'index.html');
const BILD = path.join(HERE, 'bilder'); fs.mkdirSync(BILD, {recursive: true});
let fails = 0, passes = 0;
function ok(cond, name, info) { if (cond) { passes++; console.log('  PASS ' + name); } else { fails++; console.log('  FAIL ' + name + (info !== undefined ? ' :: ' + JSON.stringify(info) : '')); } }
function done(tag) { console.log(`${tag}: ${passes} PASS, ${fails} FAIL`); process.exit(fails ? 1 : 0); }
async function browser() { return chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']}); }
// eine Seite; html = eigener Text (Varianten), url = http-Adresse über route (für Cache Storage)
async function page(b, o = {}) {
  const ctx = await b.newContext({viewport: {width: o.w || 428, height: o.h || 926}, hasTouch: true, isMobile: o.mobile !== false, deviceScaleFactor: 1});
  const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', e => p.errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()); });
  const html = o.html != null ? o.html : null;
  if (o.url) {
    await ctx.route(u => u.href.startsWith(new URL(o.url).origin), async r => {
      const u = new URL(r.request().url());
      if (u.pathname.endsWith('/') || u.pathname.endsWith('.html')) return r.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: html != null ? html : fs.readFileSync(FILE, 'utf8')});
      const f = path.join(path.resolve(ROOT, '../../..'), u.pathname.replace(/^\/Synquenzer\//, ''));
      if (fs.existsSync(f) && fs.statSync(f).isFile()) return r.fulfill({status: 200, body: fs.readFileSync(f)});
      return r.fulfill({status: 404, body: ''});
    });
    await p.goto(o.url);
  } else if (html != null) {
    const tmp = path.join(HERE, '.tmp-' + process.pid + '-' + Math.random().toString(36).slice(2) + '.html');
    fs.writeFileSync(tmp, html); p.tmp = tmp; await p.goto('file://' + tmp);
  } else await p.goto('file://' + FILE);
  await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 20000});
  await p.waitForTimeout(o.wait || 900);
  return p;
}
async function closePage(p) { const c = p.context(); await c.close(); if (p.tmp) try { fs.unlinkSync(p.tmp); } catch (e) {} }
const src = () => fs.readFileSync(FILE, 'utf8');
async function shot(p, name) { await p.waitForTimeout(250); await p.screenshot({path: path.join(BILD, name + '.png')}); }
async function tap(p, sel) { const l = p.locator(sel).first(); await l.waitFor({state: 'visible', timeout: 5000}); await l.tap(); await p.waitForTimeout(250); }
module.exports = {ok, done, browser, page, closePage, src, shot, tap, FILE, BILD, ROOT};
