import fs from 'fs';
const T = await import('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/gt/app/js/ton.js');
const buf = fs.readFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/repo/the-wall/projekt7/Haupt-3-trocken-v7.wav');
const r = T.wavLesen(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const x = r.kanaele[0], sr = r.sr;
console.log('sr', sr, 'dauer', (x.length/sr).toFixed(1));
// lautestes 5-s-Fenster mit viel Energie suchen (Schritt 1 s)
let best = 0, be = 0;
for (let s = 0; s + 5*sr < x.length; s += sr) { let e = 0; for (let i = s; i < s + 5*sr; i += 4) e += x[i]*x[i]; if (e > be) { be = e; best = s; } }
const seg = x.subarray(best, best + 5*sr);
let t = Date.now();
const spur = T.tonhoehe(seg, sr);
console.log('Fenster ab', best/sr, 's; tonhoehe', Date.now()-t, 'ms, Rahmen', spur.hz.length);
const st = spur.hz.filter((h, i) => h > 0 && spur.sicher[i] > 0.5);
console.log('stimmhaft sicher', st.length, 'Median Hz', st.slice().sort((a,b)=>a-b)[st.length>>1]?.toFixed(1));
const mel = T.melodieAusAudio(seg, sr);
console.log('Töne', mel.length, mel.slice(0, 12).map(n => T.midiName(n.midi, 'es-Moll') + '(' + n.dauer.toFixed(2) + ')').join(' '));
// ganze Spur: Stimmlage (dauert länger)
t = Date.now();
const ganz = T.tonhoehe(x, sr);
console.log('ganze Datei tonhoehe', Date.now()-t, 'ms');
const sl = T.stimmlage(ganz, { tonart: 'es-Moll' });
console.log(JSON.stringify({ ...sl, text: undefined }));
console.log(sl.text);
console.log('m:', T.stimmlage(ganz, { geschlecht: 'm' }).typ);
// mit Silbenzeiten
console.log(JSON.stringify(T.melodieAusAudio(seg, sr, [{t:0.5,dauer:0.4},{start:1.2,ende:1.6}, 3.0, 3.5])));
// einzelTon: Sinus 220 Hz + Oberton bei 24 kHz, 1024 Werte
const b = new Float32Array(1024); for (let i = 0; i < b.length; i++) b[i] = 0.3*Math.sin(2*Math.PI*220*i/24000) + 0.2*Math.sin(2*Math.PI*440*i/24000);
console.log('einzelTon 220:', JSON.stringify(T.einzelTon(b, 24000)));
const b2 = new Float32Array(1024); for (let i = 0; i < b2.length; i++) b2[i] = 0.3*Math.sin(2*Math.PI*82.41*i/24000);
console.log('einzelTon 82.41:', T.einzelTon(b2, 24000).hz.toFixed(2));
console.log('Namen', [60,61,63,66,68,70,71].map(m=>T.midiName(m)).join(' '), '|', [61,63,66,70].map(m=>T.midiName(m,'es-Moll')).join(' '), '|', [61,63,66,68,70].map(m=>T.midiName(m,'E-Dur')).join(' '), '|', T.midiName(63));
// Mikrofon-Spur-Format für stimmlage
const live = []; for (let k = 0; k < 300; k++) live.push({ hz: T.midiZuHz(48 + Math.floor(k/30)), sicher: 0.9, pegel: -20, zeit: k/30 });
console.log('live:', T.stimmlage(live).text);
