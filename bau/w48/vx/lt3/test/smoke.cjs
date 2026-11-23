// Laden ohne Seitenfehler/console.error. node smoke.cjs <index.html>
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const f = path.resolve(process.argv[2]); const dir = fs.mkdtempSync(path.join(__dirname, 'srv-')); fs.copyFileSync(f, path.join(dir, 'index.html'));
fs.writeFileSync(path.join(dir, 'version.json'), '{"version":"4.90.0"}'); const port = 9300 + Math.floor(Math.random() * 100);
const srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: dir, stdio: 'ignore' }); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => { for (let i = 0; i < 50; i++) { try { if ((await fetch('http://127.0.0.1:' + port + '/version.json')).ok) break; } catch (e) {} await sleep(200); }
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('pageerror ' + e)); p.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
  await p.goto('http://127.0.0.1:' + port + '/index.html'); await p.waitForTimeout(6000);
  const info = await p.evaluate(() => ({ title: document.title, lt3: typeof LT3 === 'object' ? LT3.on : null, lt2s: typeof LT2S === 'object' }));
  await p.evaluate(async () => { if (window.__spk) await __spk.page.open({}); }); await p.waitForTimeout(2000);
  console.log(JSON.stringify(info), 'errors', JSON.stringify(errs)); await b.close(); srv.kill(); fs.rmSync(dir, { recursive: true, force: true });
})().catch(e => { console.error(e); srv.kill(); process.exit(1); });
