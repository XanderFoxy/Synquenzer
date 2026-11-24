const base = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/gt/app/';
const ue = await import(base + 'js/uebungen.js');
const fs = await import('fs');
const lied = JSON.parse(fs.readFileSync(base + 'daten/the-wall.json', 'utf8'));
const p = ue.plan(lied, null);
console.log(p.map(x=>x.teil).join(','), Object.keys(p[1]));
console.log(JSON.stringify(p[1].schritte.slice(0,3)).slice(0,1200));
const w = ue.warmup(lied, {tief:45,hoch:64,kern:[48,60],typ:'Bariton'});
for (const s of w) console.log(s.uebung, s.minuten, JSON.stringify(s.ton));
