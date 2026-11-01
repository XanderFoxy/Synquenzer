import { chromium } from 'playwright';
const b = await chromium.launch({args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.addInitScript(() => { const log = []; window.__sessLog = log; let t = 'playback'; navigator.audioSession = {get type() { return t; }, set type(v) { t = v; log.push(v); }}; });
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(2500);
const r = await p.evaluate(async () => { const ok = await (window.micTapGet ? micTapGet('voc') : Promise.resolve('no micTapGet')); return {ok, err: MICTAP.err ? String(MICTAP.err.name || MICTAP.err) : null, log: window.__sessLog.slice(), ver: VERSION, mode: UI.stsess}; });
console.log(JSON.stringify(r), 'errs', errs.length); await b.close();
