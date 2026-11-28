// Rauchtest ohne Mikrofon: alle Seiten hochkant/quer/faltbar, keine Konsolenfehler, kein Querscrollen.
const { chromium } = require('playwright');
const G = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/gt/';
const U = 'http://localhost:8961/app/';
const PROFIL = { tief: 46, hoch: 58, kern: [49, 58], typ: 'Bariton (Schätzung)', uebergaenge: [54, 58], quelle: 'profil' };
(async () => {
  const b = await chromium.launch();
  const fehler = [];
  for (const [w, hh, name] of [[428, 926, 'hoch'], [926, 428, 'quer'], [760, 1000, 'falt']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: hh }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, colorScheme: 'dark' });
    await ctx.addInitScript((p) => { localStorage.setItem('gt.stimme', JSON.stringify(p)); }, PROFIL);
    const p = await ctx.newPage();
    p.on('pageerror', (e) => fehler.push(`${name} pageerror: ${e.message}`));
    p.on('console', (m) => { if (m.type() === 'error') fehler.push(`${name} console: ${m.text()}`); });
    for (const r of ['#start', '#einsingen/the-wall', '#uebung/vokal-leiter', '#uebung/atem-448', '#uebung/koerper-lockern', '#lied/the-wall/ueben', '#lied/the-wall/ueben/r1-2/3', '#verlauf', '#uebungen', '#lied/the-wall', '#lied/the-wall/zeile/r1-3', '#neu', '#warmup/the-wall', '#stimme']) {
      await p.goto(U + r); await p.waitForTimeout(r === '#start' ? 700 : 900);
      const breit = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (breit > 1) fehler.push(`${name} ${r}: quer scrollbar (${breit}px)`);
      const txt = await p.evaluate(() => document.querySelector('#ansicht').innerText.slice(0, 90).replace(/\s+/g, ' '));
      if (/Hoppla|ließ sich gerade nicht/.test(txt)) fehler.push(`${name} ${r}: ${txt}`);
      if (name === 'hoch' || ['#einsingen/the-wall', '#lied/the-wall/ueben', '#start'].includes(r)) await p.screenshot({ path: `${G}fotos/f-${name}-${r.replace(/[#/]+/g, '_').replace(/^_/, '')}.png`, fullPage: name === 'hoch' && !r.includes('ueben/r1') });
      if (name === 'hoch') console.log(r.padEnd(28), '|', txt);
    }
    await ctx.close();
  }
  console.log(fehler.length ? fehler.join('\n') : 'keine Fehler');
  await b.close();
})();
