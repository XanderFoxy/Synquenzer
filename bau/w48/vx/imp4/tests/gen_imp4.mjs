// IMP4-Testdatei (synthetisch, neutrale Namen, eigene Werte): 2 Drum-Spuren (GM-Tasten), die beide auf 2 und 4 klatschen
// (8 gleichzeitige Clap-Paare in 4 Takten), + 2 Synth-Spuren des analogen DAW-Synths mit verschiedenem Delay (1/4. und 1/8).
// Aufbau wie das Format: 8 Byte Kennung + XOR 0x7C + CBOR. Aufruf: node gen_imp4.mjs <aus.cbp>
import fs from 'node:fs';
const out = process.argv[2];
const u32 = v => { const x = Buffer.alloc(4); x.writeUInt32LE(v); return x; }, u16 = v => { const x = Buffer.alloc(2); x.writeUInt16LE(v); return x; };
const entry = (k, ty, pl) => { const kb = Buffer.concat([Buffer.from(k), Buffer.from([0])]); return Buffer.concat([u32(kb.length), kb, u16(ty), pl]); };
const text = (k, v) => { const vb = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(String(v)), Buffer.from([0])]); return entry(k, 8, Buffer.concat([u32(vb.length), vb])); };
const folder = (k, kids) => entry(k, 2, Buffer.concat([u16(6), u32(kids.length), ...kids]));
const doc = P => Buffer.concat([Buffer.alloc(20), folder('Doc', [folder('params', Object.entries(P).map(([k, v]) => text(k, v)))])]).toString('base64');
const BASE = {'10': '8', '20': '8', '13': 'Single', '23': 'Single', '19': 'On', '29': 'On', '15': '50', '25': '50', '35': 'Off', '34': '0', '41': 'LP24', '47': 'C  3', '2': 'Off', '3': 'Off', '4': '80', 'C': '8', 'E': '100', '70': 'Tri', '72': '1', '105': 'Off', '200': 'Off'};
const PB = Object.assign({}, BASE, {'14': 'Saw', '24': 'Square', '21': '-12', '18': '100', '28': '90', '42': '450', '43': '40', '45': '55', '46': '30', '61': '240', '62': '10', '63': '300', '65': '150', '66': '60', '67': '40', '2': 'On', '200': 'On', '207': '1/4D', '204': '30', '206': '20'});
const PL = Object.assign({}, BASE, {'14': 'Saw', '24': 'Saw', '22': '7', '18': '100', '28': '100', '42': '1800', '43': '20', '45': '30', '46': '50', '61': '400', '62': '50', '63': '300', '65': '300', '66': '80', '67': '200', '200': 'On', '207': '1/8', '204': '40', '206': '30'});
const TPQ = 960, BAR = TPQ * 4, BARS = 4;
const notes = f => { const o = []; for (let b = 0; b < BARS; b++) f(b * BAR, o); return o; };
const region = (N) => [{Pos: 0, Length: BARS * BAR, Name: 'Teil', Mute: false, Type: 0, Notes: N}];
const bus = (id, name, ins, N) => ({Type: 0, Id: id, Name: name, Outputs: [{Id: 100}], Volume: 1, Pan: 0, Mute: false, Solo: false, Effects: [],
  Track: {TrackType: 0, Instrument: ins, Regions: region(N)}});
const drA = notes((a, o) => { for (let q = 0; q < 4; q++) o.push([a + q * TPQ, 120, 36, 100, 10]); o.push([a + TPQ, 120, 39, 90, 10], [a + 3 * TPQ, 120, 39, 90, 10]); });
const drB = notes((a, o) => { o.push([a + TPQ, 120, 39, 70, 10], [a + 3 * TPQ, 120, 39, 70, 10]); for (let e = 0; e < 8; e++) o.push([a + e * TPQ / 2, 60, 42, 80, 10]); });
const bass = notes((a, o) => { for (let q = 0; q < 4; q++) o.push([a + q * TPQ, 400, 36 + (q % 2) * 7, 100, 1]); });
const lead = notes((a, o) => { [0, 2, 3].forEach((q, k) => o.push([a + q * TPQ, 700, 69 + k * 2, 100, 1])); });
const root = {
  ProjectName: 'IMP4 Test.cbp',
  Arranger: {TicksPerQuarter: TPQ, Tempo: 120, SignatureNum: 4, SignatureDen: 4},
  Buses: [
    bus(1, 'Drums A', {PluginId: 4, Name: 'Drums', PresetName: 'Kit A'}, drA),
    bus(2, 'Drums B', {PluginId: 4, Name: 'Drums', PresetName: 'Kit A'}, drB),
    bus(3, 'Bass', {PluginId: 1, Name: 'Synth A', PresetName: 'Init Preset', Data: doc(PB)}, bass),
    bus(4, 'Lead', {PluginId: 1, Name: 'Synth A', PresetName: 'Init Preset', Data: doc(PL)}, lead)
  ]
};
function enc(o) {
  const parts = []; const head = (mt, v) => { if (v < 24) parts.push(Buffer.from([mt << 5 | v])); else if (v < 256) parts.push(Buffer.from([mt << 5 | 24, v])); else if (v < 65536) { const x = Buffer.alloc(3); x[0] = mt << 5 | 25; x.writeUInt16BE(v, 1); parts.push(x); } else { const x = Buffer.alloc(5); x[0] = mt << 5 | 26; x.writeUInt32BE(v, 1); parts.push(x); } };
  (function w(v) {
    if (v === true) parts.push(Buffer.from([0xf5])); else if (v === false) parts.push(Buffer.from([0xf4])); else if (v == null) parts.push(Buffer.from([0xf6]));
    else if (typeof v === 'number') { if (Number.isInteger(v) && Math.abs(v) < 4294967296) head(v >= 0 ? 0 : 1, v >= 0 ? v : -1 - v); else { const x = Buffer.alloc(9); x[0] = 0xfb; x.writeDoubleBE(v, 1); parts.push(x); } }
    else if (typeof v === 'string') { const x = Buffer.from(v); head(3, x.length); parts.push(x); }
    else if (Array.isArray(v)) { head(4, v.length); v.forEach(w); }
    else { const k = Object.keys(v); head(5, k.length); for (const kk of k) { w(kk); w(v[kk]); } }
  })(o);
  return Buffer.concat(parts);
}
const raw = enc(root), o = Buffer.alloc(raw.length + 8); Buffer.from([0x99, 0x63, 0x33, 0x70, 0x0d, 0x0a, 0x1a, 0x0a]).copy(o); for (let i = 0; i < raw.length; i++) o[i + 8] = raw[i] ^ 0x7C;
fs.writeFileSync(out, o); console.log('ok', o.length);
