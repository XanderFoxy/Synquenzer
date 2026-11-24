const base = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/gt/app/';
const ue = await import(base + 'js/uebungen.js');
const fs = await import('fs');
const lied = JSON.parse(fs.readFileSync(base + 'daten/the-wall.json', 'utf8'));
const w = ue.warmup(lied, {tief:45,hoch:64,kern:[48,60],typ:'Bariton'});
for (const s of w) console.log(s.uebung, Object.keys(s).join(','), s.vokale||'', s.vokal||'', s.zeile||'');
