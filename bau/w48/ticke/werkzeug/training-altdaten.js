// Erzeugt echte Speicher-Daten mit der unveränderten Vorlage 0.2.1 (Training benutzen wie ein Mensch), schreibt sie als JSON.
// Aufruf: node training-altdaten.js <port-der-vorlage> <ziel.json>
const { chromium, devices } = require('playwright');
const fs = require('fs');
(async () => {
  const [port, ziel] = process.argv.slice(2);
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 12 Pro Max'], viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
  const p = await ctx.newPage(); const fehler = [];
  p.on('pageerror', (e) => fehler.push('pageerror ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') fehler.push('console ' + m.text()); });
  const u = `http://127.0.0.1:${port}/ticke/?test=1`;
  await p.goto(u + '#training'); await p.waitForSelector('h2');
  await p.click('[data-aktion=merken]'); await p.click('[data-w=ja]');
  // Übung gemacht + gutgetan
  await p.goto(u + '#training/uebung/f-ein-ding'); await p.waitForSelector('[data-tr=geschafft]');
  await p.click('[data-tr=geschafft]'); await p.click('[data-gut="2"]');
  // Wenn-dann-Plan speichern, Gefühl „eher nicht“
  await p.goto(u + '#training/uebung/z-wenndann'); await p.waitForSelector('#tr-f-wenn');
  await p.fill('#tr-f-wenn', 'ich nach Hause komme'); await p.fill('#tr-f-dann', 'spiele ich zehn Minuten Gitarre');
  await p.click('[data-tr=plan]'); await p.click('[data-gut="0"]');
  await p.goto(u + '#training/plaene'); await p.waitForSelector('[data-tr=haken]'); await p.click('[data-tr=haken]');
  // Schwerpunkt Fokus, Zeit bis 5 Min.
  await p.goto(u + '#training'); await p.waitForSelector('[data-sp=fokus]'); await p.click('[data-sp=fokus]'); await p.click('[data-zeit="5"]');
  // Wochen-Notiz
  await p.goto(u + '#training/woche'); await p.waitForSelector('#tr-rb'); await p.fill('#tr-rb', 'Morgens Gitarre tut mir gut.'); await p.click('[data-tr=rb]');
  await p.waitForTimeout(300);
  const ls = await p.evaluate(() => { const r = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); r[k] = localStorage.getItem(k); } return r; });
  // zusätzlich: frühere Tage im Format der Vorlage (wie die Vorlage sie schreibt: {id, t, gut, notiz?, text?})
  const m = JSON.parse(ls['ticke.v1.m.training']); const tag = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  m.tage[tag(2)] = [{ id: 'k-benennen', t: '08:10', gut: 0 }, { id: 'f-parkplatz', t: '09:00', gut: 2, notiz: { notiz: 'Rückruf um 18 Uhr' } }];
  m.tage[tag(9)] = [{ id: 'h-gehen', t: '17:30', gut: 1 }];
  ls['ticke.v1.m.training'] = JSON.stringify(m);
  fs.writeFileSync(ziel, JSON.stringify(ls, null, 1));
  console.log('Vorlage-Daten:', Object.keys(ls).join(', '), '| Tage:', Object.keys(m.tage).length, '| Pläne:', m.plaene.length, '| Fehler:', fehler.length, fehler.join(' | '));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
