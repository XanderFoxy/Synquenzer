import fs from 'fs';
const { eignung } = await import('../app/js/eignung.js');
const lied = JSON.parse(fs.readFileSync(new URL('../app/daten/the-wall.json', import.meta.url)));
const st = JSON.parse(fs.readFileSync(new URL('../notiz/profil-xander.json', import.meta.url))).stimme;
const e = eignung(lied, st); console.log(e.stufe, e.transponieren, e.text); console.log(e.gruende.join('\n')); console.log(e.schwierig.slice(0,5)); console.log(e.weg.map(w=>w.woche+' '+w.ziel+': '+w.text).join('\n'));
const e2 = eignung(lied, null); console.log('--ohne', e2.stufe, e2.transponieren, e2.text);
const hoch = { ...lied, zeilen: lied.zeilen.map(z => ({ ...z, silben: z.silben.map(s => ({ ...s, midi: s.midi ? s.midi + 6 : s.midi })) })) };
const e3 = eignung(hoch, st); console.log('--hoch', e3.stufe, e3.transponieren, e3.text); console.log(e3.weg.map(w=>w.woche+' '+w.ziel).join(' | '));
