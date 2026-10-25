import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const files = {new: S + 'mk-wt/index.html', base: S + 'synq-snapshots/MK0-fix.html'};
const OUT = S + 'dirigent-test/v3-rp-mk1-ecobadge-dk-';
const vps = [[390, 844, 'P1'], [844, 1180, 'W']];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [w, h, tag] of vps) for (const [n, f] of Object.entries(files)) {
  for (const eng of ['analog', 'mk']) {
    if (n === 'base' && eng === 'mk') continue;
    const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: false, isMobile: false, deviceScaleFactor: 2});
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push('PE ' + e));
    await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000});
    await p.waitForTimeout(800);
    const r = await p.evaluate(async eng => {
      const Q = window.SYNQUENZER; Q.forceNative(true); await new Promise(r => setTimeout(r, 400));
      Q.selectTrack(0);
      if (eng === 'mk' && typeof setEngine === 'function') setEngine(0, 'mk');
      Q.openEditor(); await new Promise(r => setTimeout(r, 900));
      const btns = [...document.querySelectorAll('#synthSheet .sh-head .seg.eng button')];
      const ecob = document.querySelector('#synthSheet .sh-head .ecob');
      const out = {engine: S.tracks[0].sound.engine, trackEco: typeof trackEco === 'function' ? trackEco(0) : null,
        segClass: btns[0] && btns[0].parentElement.className,
        btns: btns.map(x => { const cs = getComputedStyle(x, '::before'); return {t: x.innerText.replace(/\s+/g, ' '), eco: x.classList.contains('eco'), before: cs.content, disp: cs.display, color: cs.color, fs: cs.fontSize}; }),
        ecob: ecob ? {hidden: ecob.hidden, disp: getComputedStyle(ecob).display, rect: ecob.getBoundingClientRect().width} : null,
        anyEcoText: [...document.querySelectorAll('#synthSheet .sh-head *')].filter(e => e.offsetParent !== null && /ECO/.test(e.textContent) && e.children.length === 0).map(e => e.className + ':' + e.textContent)};
      const eb = btns.find(x => x.classList.contains('eco')) || btns[0];
      const rr = eb.getBoundingClientRect(); out.rect = {x: rr.x, y: rr.y, w: rr.width, h: rr.height};
      return out;
    }, eng);
    await p.screenshot({path: OUT + `${tag}-${n}-${eng}.png`, clip: {x: Math.max(0, r.rect.x - 40), y: Math.max(0, r.rect.y - 10), width: Math.min(w - Math.max(0, r.rect.x - 40), 260), height: r.rect.h + 20}});
    console.log(tag, n, eng, JSON.stringify(r), errs.length ? errs : '');
    await ctx.close();
  }
}
await b.close();
