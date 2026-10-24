// T14: N7V-05 / C.2 Punkt 1 – im Rahmen (wie Claude-App): kein 🎤, kein Mikro-Blatt-Eintrag, FANG nie „stimme“, 0 getUserMedia, keine Fehler
import {chromium} from 'playwright';
import {EXE} from './v3-qa-vs2acc-h.mjs';
const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true}); const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await ctx.addInitScript(() => { if (navigator.mediaDevices) { const g = navigator.mediaDevices.getUserMedia; window.__gum = 0; navigator.mediaDevices.getUserMedia = function (...a) { window.__gum++; return g.apply(this, a); }; } });
await p.goto('file:///tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-vs2acc-frame.html');
const f = p.frames().find(x => x.url().includes('index.html'));
await f.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
await p.waitForTimeout(600);
const r = await f.evaluate(async () => {
  const vis = id => { const e = document.getElementById(id); return !!(e && e.offsetParent && getComputedStyle(e).display !== 'none'); };
  SYNQUENZER.play(); await new Promise(r => setTimeout(r, 1500));
  const o = {micok: document.getElementById('app').classList.contains('micok'), segMic: vis('segMic'), bMicT: vis('bMicT'), fang: SYNQUENZER.vsInfo().fangMode, vsFang: SYNQUENZER.vsFang({}), gum: window.__gum, start: SYNQUENZER.stimmeStart ? SYNQUENZER.stimmeStart({}) : null};
  o.gum2 = window.__gum; SYNQUENZER.stop(); return o;
});
console.log(JSON.stringify(r), 'errs', JSON.stringify(errs));
await br.close();
