import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { analysiere, KLASSEN } from '../app/js/vokalfilter.js';
import { tonhoehe } from '../app/js/ton.js';
const SR = 48000, Q = process.argv[2];
const roh = execFileSync('ffmpeg', ['-v', 'error', '-i', Q, '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
const x = new Float32Array(roh.buffer, roh.byteOffset, roh.length / 4).slice();
const opt = JSON.parse(process.argv[3] || '{}');
const a = analysiere(x, SR, opt);
const lied = JSON.parse(readFileSync('../app/daten/the-wall.json', 'utf8'));
const kern = new Array(6).fill(0), schw = new Array(6).fill(0);
let nasEnde = [0,0], vokEnde=[0,0];
for (const z of lied.zeilen) for (const s of z.silben) {
  if (s.gesprochen) continue;
  const k0 = Math.round(s.t / 0.01), k1 = Math.round((s.t + s.dauer) / 0.01), L = k1 - k0;
  for (let k = k0 + Math.round(L*0.3); k < k0 + Math.round(L*0.7); k++) kern[a.klasse[k]]++;
  const nas = /(n|m|ng)$/i.test(s.text.replace(/[^a-z]/gi, '')) || /(n|m|ng)$/i.test(s.wort) && s.wortende;
  for (let k = k0 + Math.round(L*0.85); k < k1+3; k++) { const v=(nas?nasEnde:vokEnde); v[1]++; if (a.klasse[k]===5) v[0]++; }
}
const tot = kern.reduce((p,c)=>p+c);
console.log('Silbenkern:', KLASSEN.map((n,i)=>n+' '+(kern[i]/tot*100).toFixed(1)+'%').join(' | '));
console.log('Nasal am Ende: n/m-Silben', (nasEnde[0]/nasEnde[1]*100).toFixed(1)+'%', ' andere', (vokEnde[0]/vokEnde[1]*100).toFixed(1)+'%');
