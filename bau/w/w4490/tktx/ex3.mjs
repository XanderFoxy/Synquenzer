import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const [file] = process.argv.slice(2);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForTimeout(1500);
const run = async (label, setup) => {
  const r = await p.evaluate(async (setup) => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    SYNQUENZER.loadDemo(); ensureAudio(); await wait(300);
    eval(setup);
    const log = []; const orig = window.click; window.click = function (t, acc, soft) { log.push([+(t2b(t)).toFixed(2), acc ? 'A' : soft ? 's' : 'n']); return orig.apply(this, arguments); };
    S.settings.metro = true; S.settings.countIn = 1;
    const taktT = []; const leds = [];
    if (window.__ci) { window.__ci = 0; startTransport(1); } else play(); 
    const T0 = performance.now();
    while (performance.now() - T0 < 4500) { await wait(60); const t = EL.taktVal.textContent; if (taktT[taktT.length - 1] !== t) taktT.push(t); const l = SYNQUENZER.tkt.leds(); if (leds[leds.length - 1] !== l) leds.push(l); }
    stop(); window.click = orig;
    return {ts: S.ts || null, plain: tkPlain(), clips: S.tracks.map(t => t.clips.map(c => c && c.ts || '-').join(',')).join(' | '), log: log.slice(0, 14), takt: taktT.slice(0, 14), leds: leds.slice(0, 10), nLeds: UI.leds.length};
  }, setup);
  console.log(label, JSON.stringify(r));
};
await run('songts34', "setSongTs('3/4', {quiet: true})");
await run('cliponly-ci', "for (let t = 0; t < S.tracks.length; t++) if (S.tracks[t].clips[0] && !S.tracks[t].stimme) setClipTs(t, 0, '3/4'); R.selS = 0; window.__ci = 1;");
await run('cliponly', "for (let t = 0; t < S.tracks.length; t++) if (S.tracks[t].clips[0] && !S.tracks[t].stimme) setClipTs(t, 0, '3/4'); R.selS = 0;");
console.log(JSON.stringify(errs));
await b.close();
