import { chromium } from 'playwright';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const p = await (await b.newContext({viewport: {width: 844, height: 390}})).newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + process.argv[2]); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await p.evaluate(async () => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); ensureAudio(); await sl(1000); Q.setEngine(0, 'mk'); Q.mkSet(0, 'arp.on', 1); await sl(50); const d = typeof ARPC; Q.launchScene(0); await sl(2000); Q.stop(); return [d, Q.arpLog(0).length, Q.noteLog(400).filter(e => e.track === 0 && e.src === 'clip').length]; });
console.log(JSON.stringify(r), errs); await b.close();
