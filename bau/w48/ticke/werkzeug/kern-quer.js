// Überlauf-Prüfung aller Kern-Seiten, hochkant 428×926 und quer 926×428, hell; dazu Tippflächen < 44 px. node kern-quer.js <basis-url>
const { chromium } = require('playwright');
const SEITEN = ['start', 'einstieg', 'los', 'fragen', 'antworten', 'antworten/muster', 'einstellungen', 'einstellungen/quellen', 'einstellungen/hinweise', 'bausteine', 'profil', 'passt'];
(async () => {
  const b = await chromium.launch(); let schlecht = 0, n = 0; const f = [];
  for (const vp of [{ width: 428, height: 926 }, { width: 926, height: 428 }]) {
    const c = await b.newContext({ viewport: vp, isMobile: true, hasTouch: true, serviceWorkers: 'block' }); const p = await c.newPage();
    p.on('pageerror', (e) => f.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') f.push(m.text()); });
    await p.goto(process.argv[2] + '?test=1'); await p.waitForSelector('#inhalt h2');
    await p.evaluate(() => window.__ticke.setzeEinst({ einstieg: true }));
    for (const s of SEITEN) {
      await p.evaluate((h) => { location.hash = h; }, s); await p.waitForTimeout(s.startsWith('antworten') ? 900 : 400);
      if (s.startsWith('antworten')) await p.evaluate(() => document.querySelectorAll('.antw-teil').forEach((d) => { d.open = true; }));
      const r = await p.evaluate(() => {
        const i = document.getElementById('inhalt'), W = document.documentElement.clientWidth;
        const raus = [...i.querySelectorAll('*')].filter((e) => { const b = e.getBoundingClientRect(); return b.width && (b.right > W + 1 || b.left < -1); }).slice(0, 3).map((e) => e.tagName + '.' + e.className);
        const klein = [...document.querySelectorAll('#inhalt a, #inhalt button, #inhalt summary, #inhalt input, #leiste a, #unterreiter a')].filter((e) => {
          if (e.closest('.fuss') || e.closest('p:not(.antw-blatt-links)') && e.tagName === 'A' && !e.classList.contains('knopf') && !e.classList.contains('link')) return false;   // Text-Links im Fließtext
          const b = e.getBoundingClientRect(); if (!b.width) return false;
          const st = getComputedStyle(e, '::before'); const vergr = st.content !== 'none' && st.position === 'absolute';
          return !vergr && (b.height < 43.5 || b.width < 43.5);
        }).slice(0, 4).map((e) => e.tagName + '.' + e.className + ' ' + Math.round(e.getBoundingClientRect().width) + '×' + Math.round(e.getBoundingClientRect().height));
        return { quer: i.scrollWidth - i.clientWidth, doc: document.documentElement.scrollWidth - W, raus, klein };
      });
      n++; const gut = r.quer <= 0 && r.doc <= 0 && !r.raus.length;
      if (!gut || r.klein.length) { schlecht += gut ? 0 : 1; console.log(`${vp.width}×${vp.height} #${s}: ${gut ? 'ok' : 'ÜBERLAUF'} ${JSON.stringify(r)}`); }
    }
    await c.close();
  }
  console.log(`== ${n} Seitenansichten, ${schlecht} mit Überlauf; Fehler: ${f.length ? f.join(' | ') : 0}`);
  await b.close();
})();
