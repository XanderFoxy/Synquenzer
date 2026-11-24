// Gesangstrainer – ton.js
// Tonhöhe messen (YIN mit Kandidaten-Viterbi), Stimmlage schätzen, Melodie aus Audio, Mikrofon in Echtzeit,
// singende Vokal-Stimme (Formant-Synthese), Klavier-Ton und deutsche Notennamen.
// Alles lokal im Gerät, nichts wird gesendet. Reines ES-Modul, läuft im Hauptfaden, im Worker und in Node
// (Web-Audio-Teile nur im Browser).
//
// export function tonhoehe(x, sr, opt={})       → {t:[], hz:[], sicher:[], pegel:[], hop, sr}
//        x Float32Array (mono), sr Abtastrate. hz 0 = stimmlos, sicher 0–1, pegel dBFS. Standard-Raster 10 ms.
//        opt: hop (0.01), fmin (65), fmax (1100), fortschritt(prozent)
// export function stimmlage(spur, opt={})       → {tief, hoch, kern:[lo,hi], typ, sicherheit, text, …}
//        spur: Ergebnis von tonhoehe() ODER eine Liste von mikrofon-Meldungen [{hz, sicher, pegel}, …] (≈30 Hz).
//        tief/hoch/kern als MIDI-Zahlen (60 = C4). typ: 'Bass'|'Bariton'|'Tenor'|'Alt'|'Mezzosopran'|'Sopran'
//        (immer nur eine Schätzung). opt: geschlecht 'm'|'w' (schränkt typ ein), tonart (für Notennamen).
//        Zusätzlich: tiefName, hochName, kernName:[..], sekunden (sicher gesungene Zeit), anzahl (Töne), typen (Nachbarn).
// export function melodieAusAudio(x, sr, silbenZeiten?) → [{t, dauer, midi, cent}]
//        ohne silbenZeiten: erkannte Töne; mit silbenZeiten ([{t, dauer}] oder [{start, ende}] oder [t…]):
//        je Silbe der Mittelwert der sicheren Tonhöhe (midi null, wenn dort nichts Sicheres klingt).
// export function mikrofon({onTon, onFehler, ctx, fmin, fmax, minPegel}) → Promise<stop()>
//        getUserMedia (ohne Echo-/Rauschunterdrückung), Echtzeit-YIN ≈ 30 Mal pro Sekunde.
//        onTon({hz, midi, midiGenau, cent, sicher, pegel, name, zeit}) – stimmlos: hz 0, midi null.
//        stop() beendet Mikrofon und Messung; stop.ctx / stop.stream für die App.
// export function vokalStimme(ctx, opt={})      → {singe(vokal, midi, start, dauer, gleit), stopp(), ausgang}
//        vokal 'a e i o u ä ö ü' (ö auch für Schwa) oder Diphthong 'ai'/'ei'/'au'/'ou'/'eu'; gleit = Nachlaut-Vokal.
//        opt: stimme 'm' (Standard) | 'w', vibrato (Cent, 25), lautstaerke (0.8), ziel (AudioNode)
// export function klavier(ctx, opt={})          → {spiele(midi, start, dauer, staerke), stopp(), ausgang}
// export function midiName(n, tonart?)          → 'Es4', 'Fis3', 'H2' … (b-Tonarten: Des/Es/Ges/As/B, Kreuz: Cis/Dis/Fis/Gis/Ais)
// export function hzZuMidi(f), midiZuHz(m), noten(spur, opt) (Tonfolge wie Werkstatt 3), einzelTon(puffer, sr, opt)
// export async function ladeAudio(file)         → {x, sr, name, kanaele, bits, format, dauer} (WAV/AIFF selbst, sonst decodeAudioData)
// export function wavLesen(buffer)              → {kanaele, sr, bits, format} | null
// export function imHintergrund(auftrag, x, sr, opt) → Promise (auftrag 'tonhoehe'|'stimmlage'|'melodie') – im Worker
//        (ton-worker.js), bei Problemen im Hauptfaden.

const G = globalThis;
const LOG2 = Math.log2;
export const hzZuMidi = (f) => 69 + 12 * LOG2(f / 440);
export const midiZuHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// ---------------------------------------------------------------- Notennamen (deutsch)

const N_MISCH = ['C', 'Cis', 'D', 'Es', 'E', 'F', 'Fis', 'G', 'As', 'A', 'B', 'H'];
const N_B = ['C', 'Des', 'D', 'Es', 'E', 'F', 'Ges', 'G', 'As', 'A', 'B', 'H'];
const N_KREUZ = ['C', 'Cis', 'D', 'Dis', 'E', 'F', 'Fis', 'G', 'Gis', 'A', 'Ais', 'H'];
const B_DUR = ['f', 'b', 'es', 'as', 'des', 'ges', 'ces'], B_MOLL = ['d', 'g', 'c', 'f', 'b', 'es', 'as'];
const K_DUR = ['g', 'd', 'a', 'e', 'h', 'fis', 'cis'], K_MOLL = ['e', 'h', 'fis', 'cis', 'gis', 'dis', 'ais'];

function vorzeichen(tonart) {
  if (!tonart) return 0;
  const t = String(tonart).trim().replace('♭', 'es').replace('♯', 'is');
  const m = t.match(/^([A-Ha-h](?:is|es|s)?)[\s\-_]*(dur|moll|major|minor|m)?$/i);
  if (!m) return 0;
  const g = m[1].toLowerCase();
  const moll = m[2] ? /^(moll|minor|m)$/i.test(m[2]) : m[1][0] === m[1][0].toLowerCase();
  if ((moll ? B_MOLL : B_DUR).includes(g)) return -1;
  if ((moll ? K_MOLL : K_DUR).includes(g)) return 1;
  return 0;
}

export function midiName(n, tonart) {
  if (n == null || !isFinite(n)) return '';
  const r = Math.round(n), v = vorzeichen(tonart);
  const namen = v < 0 ? N_B : v > 0 ? N_KREUZ : N_MISCH;
  return namen[((r % 12) + 12) % 12] + (Math.floor(r / 12) - 1);
}
export const notenName = midiName;

