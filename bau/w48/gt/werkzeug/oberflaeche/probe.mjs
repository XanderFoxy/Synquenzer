const base = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/gt/app/';
const ph = await import(base + 'js/phonetik.js');
const ue = await import(base + 'js/uebungen.js');
const fs = await import('fs');
const lied = JSON.parse(fs.readFileSync(base + 'daten/the-wall.json', 'utf8'));
const z = ph.zeileZuVokalen("Don't wait, follow the light", 'en');
console.log(JSON.stringify(z).slice(0, 600));
console.log(ph.vokalKette("Don't wait, follow the light", 'en'));
const flach = z.flatMap(w => w.silben);
console.log('ue(silben):', JSON.stringify(ph.uebergaenge(flach)).slice(0, 500));
try { console.log('ue(strings):', JSON.stringify(ph.uebergaenge(flach.map(s=>s.anzeige))).slice(0, 300)); } catch(e) { console.log('ue strings err', e.message); }
const p = ue.plan(lied, null);
console.log('plan', p.length, JSON.stringify(p[1]).slice(0, 1500));
const w = ue.warmup(lied, null);
console.log('warmup', JSON.stringify(w).slice(0, 1500));
console.log('UEB', ue.UEBUNGEN.length, JSON.stringify(ue.UEBUNGEN[0]));
console.log('stichworte', [...new Set(ue.UEBUNGEN.flatMap(u => u.stichworte))].join(','));
