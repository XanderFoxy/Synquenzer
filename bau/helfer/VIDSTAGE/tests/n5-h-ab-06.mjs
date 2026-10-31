// VC2a-06 Abnahme: App in einem sandboxed iframe (wie Artifact-Ansicht) über http – opak (ohne allow-same-origin) und mit
import http from 'http'; import fs from 'fs';
import { chromium } from 'playwright';
const APP = '/home/user/Synquenzer/bau/helfer/VIDSTAGE/index.html';
const html = fs.readFileSync(APP);
const srv = http.createServer((q, r) => {
  if (q.url.startsWith('/app')) { r.writeHead(200, {'content-type': 'text/html; charset=utf-8'}); r.end(html); return; }
  const sb = q.url.includes('same') ? 'allow-scripts allow-same-origin allow-downloads' : 'allow-scripts allow-downloads';
  r.writeHead(200, {'content-type': 'text/html'}); r.end(`<!doctype html><body style="margin:0"><iframe id="f" src="/app" sandbox="${sb}" style="border:0;width:390px;height:844px"></iframe>`);
});
await new Promise(r => srv.listen(8765, r));
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
for (const mode of ['opak', 'same']) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  await p.goto('http://localhost:8765/' + mode); await p.waitForTimeout(4000);
  const f = p.frames().find(x => x.url().includes('/app'));
  const r = await f.evaluate(async () => {
    const A = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
    const out = {booted: A.storage && A.storage().booted};
    const c = A.getClip(0, 0); c.notes[0].v = .42; A.setClip(0, 0, c); undo(); redo();
    out.undoOk = A.getClip(0, 0).notes[0].v === .42;
    await sl(2500);
    out.hist = A.history();
    openMenu(); await sl(300);
    const tab = [...document.querySelectorAll('#menu button')].find(x => /^Projekt$/.test(x.textContent.trim())); if (tab) { tab.click(); await sl(300); }
    out.menu = [...document.querySelectorAll('#menu .small, #menu .mrow')].map(e => e.textContent.trim().replace(/\s+/g, ' ')).filter(t => /Verlauf/.test(t));
    return out;
  });
  console.log(mode, JSON.stringify(r), 'errs', JSON.stringify(errs.slice(0, 4)));
  await ctx.close();
}
await b.close(); srv.close();
