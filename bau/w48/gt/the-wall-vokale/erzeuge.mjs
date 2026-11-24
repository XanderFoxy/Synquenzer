// Offline: Vokal-Spur für The Wall aus Haupt-3-trocken-v7.wav (gleicher Code wie in der App: app/js/vokalfilter.js).
// node erzeuge.mjs [quelle.wav] → the-wall-vokale.mp3 (mono, 128 kbit/s, 44,1 kHz, ganzes Lied, Start 0) + messung.json
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { nurVokaleMitInfo, analysiere, KLASSEN } from '../app/js/vokalfilter.js';
const HIER = new URL('.', import.meta.url).pathname;
const QUELLE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/repo/the-wall/projekt7/Haupt-3-trocken-v7.wav';
const SR = 48000;
const roh = execFileSync('ffmpeg', ['-v', 'error', '-i', QUELLE, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
const x = new Float32Array(roh.buffer, roh.byteOffset, roh.length / 4).slice();
let t0 = Date.now();
const { y, info } = nurVokaleMitInfo(x, SR, { mitKlassen: true });
const ms = Date.now() - t0;
writeFileSync(HIER + 'vokale.f32', Buffer.from(y.buffer));
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', HIER + 'vokale.f32',
  '-ar', '44100', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '128k', '-t', '266', HIER + 'the-wall-vokale.mp3']);
// Messung: Energie je Klasse (Klassen aus der Quelle) vorher/nachher
const kl = info.klasse, hop = info.hop * SR;
const eV = new Float64Array(KLASSEN.length), eN = new Float64Array(KLASSEN.length);
for (let k = 0; k < kl.length; k++) {
  const a = Math.round(k * hop - hop / 2), b = Math.min(x.length, a + hop);
  for (let i = Math.max(0, a); i < b; i++) { eV[kl[k]] += x[i] * x[i]; eN[kl[k]] += y[i] * y[i]; }
}
const sV = eV.reduce((a, b) => a + b), sN = eN.reduce((a, b) => a + b);
const tabelle = {};
KLASSEN.forEach((n, i) => { tabelle[n] = { rahmen: info.anteile[n].rahmen, anteilRahmen: +(info.anteile[n].anteil * 100).toFixed(1), energieVorher: +(eV[i] / sV * 100).toFixed(2), energieNachher: +(eN[i] / sN * 100).toFixed(3), absenkungDb: +(10 * Math.log10((eN[i] + 1e-12) / (eV[i] + 1e-12))).toFixed(1) }; });
// zweite Messung: die fertige Spur neu klassifizieren (sieht der Filter danach noch Konsonanten/Nasale?)
const nach = analysiere(y, SR);
const nicht = (A) => ['stimmlos', 'zisch', 'plosiv', 'nasal'].reduce((s, n) => s + A[n].energie, 0);
const out = { quelle: QUELLE.split('/').pop(), sekunden: +(x.length / SR).toFixed(2), rechenzeitMs: ms, tabelle,
  konsonantNasalEnergieVorher: +(nicht(info.anteile) * 100).toFixed(2), konsonantNasalEnergieNachherNeuGemessen: +(nicht(nach.anteile) * 100).toFixed(3),
  vokalRahmenVorher: info.anteile.vokal.rahmen, vokalRahmenNachherNeuGemessen: nach.anteile.vokal.rahmen };
writeFileSync(HIER + 'messung.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
// Zuordnung zu Silben (Plausibilität): Anteil Vokal-Rahmen in Silben mit/ohne Nasal am Ende
try {
  const lied = JSON.parse(readFileSync(HIER + '../app/daten/the-wall.json', 'utf8'));
  const st = { nasalEnde: [0, 0], sonst: [0, 0] };
  for (const z of lied.zeilen) for (const s of z.silben) {
    if (s.gesprochen) continue;
    const k0 = Math.round(s.t / info.hop), k1 = Math.round((s.t + s.dauer) / info.hop), kE = Math.round(k0 + (k1 - k0) * 0.75);
    const art = /(n|m|ng)$/i.test(s.text.replace(/[^a-z]/gi, '')) ? 'nasalEnde' : 'sonst';
    for (let k = kE; k < k1; k++) { st[art][1]++; if (kl[k] === 5) st[art][0]++; }
  }
  console.log('Nasal-Rahmen im letzten Viertel der Silbe: mit n/m-Ende', (st.nasalEnde[0] / st.nasalEnde[1] * 100).toFixed(1) + '%', '| sonst', (st.sonst[0] / st.sonst[1] * 100).toFixed(1) + '%');
} catch (e) { console.log('Silbenprüfung übersprungen', e.message); }
