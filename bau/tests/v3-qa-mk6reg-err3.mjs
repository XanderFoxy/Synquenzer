// after the stepsPaint TypeError: does SCHRITTE still animate when reopened? exact UI repro (P1): Menü -> Datei öffnen
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await br.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await p.goto('file://' + S + 'mk-br-MK6/index.html'); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(1300);
// SEQ position + tap on the matrix row -> SCHRITTE (real tap)
await p.evaluate(() => window.MKUI.setWahl(2, 10)); await p.waitForTimeout(200);
const row = await p.evaluate(() => { const e = [...document.querySelectorAll('.mkx.mrow2, .mkx')].find(x => /SCHRITTE/.test(x.textContent) && x.offsetParent); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
if (row) await p.mouse.click(row[0], row[1]); await p.waitForTimeout(500);
const v1 = await p.evaluate(() => window.MKUI.panelInfo().view);
await p.click('#bMenu'); await p.waitForTimeout(400);
await p.setInputFiles('#fileIn', S + 'dirigent-test/v3-qa-v2ereg/dirigent-v2.json'); await p.waitForTimeout(3000);
const e1 = errs.slice();
// back to an MS 2000 track, SCHRITTE, play: does the running step move?
await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.setEngine(0, 'mk'); Q.mkSet(0, 't.0.seq.on', 1); Q.mkSet(0, 't.0.seq.q.0.k', 11); Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(1300);
await p.evaluate(() => { const M = window.MKUI; M.setWahl(2, 10); M.viewOpen('schritte'); const Q = window.SYNQUENZER; Q.setBpm(120); Q.launchScene(0); }); await p.waitForTimeout(600);
const cur = []; for (let k = 0; k < 6; k++) { cur.push(await p.evaluate(() => { const s = window.MKUI.stepsInfo(); return s && s.cur; })); await p.waitForTimeout(150); }
console.log('view before', v1, '| errors after Datei öffnen:', JSON.stringify(e1), '| running step after reopen', JSON.stringify(cur), '| errs total', errs.length);
await br.close();
