// MLG2-Testdatei: nimmt die synthetische XLA-Testdatei (tests/xla-synth-song.cbp, eigene Werte) und setzt eigene Synth-Werte und
// Effekte: „Bass“ = Synth mit Delay 1/4. + EQ (Low-Cut + Glocke) + Filter aus; „Melodie“ = Synth mit Amp-Simulation an (kein EQ) + EQ.
// Namen neutral. Aufbau wie das Format: 8 Byte Kennung + XOR 0x7C + CBOR. Aufruf: node gen_mlg2.mjs <mlg1-block.js> <ein.cbp> <aus.cbp>
import fs from 'node:fs';
const [blk, inp, out] = process.argv.slice(2);
const src = fs.readFileSync(blk, 'utf8'), a = src.indexOf('function mlgCore()'), b = src.indexOf('function mlToVa(');
const C = new Function(src.slice(a, b).replace('return (mlgCore.k = {K, parse, cbp, isCbp, toVa, DIV, HALF});', 'return (mlgCore.k = {K, parse, cbp, isCbp, toVa, DIV, HALF, cbor});') + '\nreturn mlgCore;')()();
const u8 = new Uint8Array(fs.readFileSync(inp)), d = new Uint8Array(u8.length - 8); for (let k = 0; k < d.length; k++) d[k] = u8[k + 8] ^ 0x7C;
const root = C.cbor(d);
// Parameter-Baum des Synths (u32 Länge, Schlüssel, u16 Typ; 8 = Text, 2/6 = Ordner)
const u32 = v => { const x = Buffer.alloc(4); x.writeUInt32LE(v); return x; }, u16 = v => { const x = Buffer.alloc(2); x.writeUInt16LE(v); return x; };
const entry = (k, ty, pl) => { const kb = Buffer.concat([Buffer.from(k), Buffer.from([0])]); return Buffer.concat([u32(kb.length), kb, u16(ty), pl]); };
const text = (k, v) => { const vb = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(String(v)), Buffer.from([0])]); return entry(k, 8, Buffer.concat([u32(vb.length), vb])); };
const folder = (k, kids) => entry(k, 2, Buffer.concat([u16(6), u32(kids.length), ...kids]));
const doc = P => Buffer.concat([Buffer.alloc(20), folder('Doc', [folder('params', Object.entries(P).map(([k, v]) => text(k, v)))])]).toString('base64');
const BASE = {'10': '8', '20': '8', '13': 'Single', '23': 'Single', '19': 'On', '29': 'On', '15': '50', '25': '50', '35': 'Off', '34': '0', '41': 'LP24', '47': 'C  3', '2': 'Off', '3': 'Off', '4': '80', 'C': '8', 'E': '100', '70': 'Tri', '72': '1', '105': 'Off', '200': 'Off'};
const PB = Object.assign({}, BASE, {'14': 'Saw', '24': 'Square', '21': '-12', '22': '6', '18': '100', '28': '90', '42': '450', '43': '40', '45': '55', '46': '30', '61': '240', '62': '10', '63': '300', '65': '150', '66': '60', '67': '40', '2': 'On', '200': 'On', '207': '1/4D', '204': '12', '206': '20'});
const PM = Object.assign({}, BASE, {'14': 'Saw', '24': 'Saw', '22': '7', '18': '100', '28': '100', '42': '1800', '43': '20', '45': '30', '46': '50', '61': '400', '62': '50', '63': '300', '65': '300', '66': '80', '67': '200'});
const f64 = arr => { const x = Buffer.alloc(arr.length * 8); arr.forEach((v, i) => x.writeDoubleLE(v, i * 8)); return x.toString('base64'); };
// 4-Band-EQ: Band 1 Cut (n 0,371), Band 3 Glocke +5,3 dB (n 0,647, Q 1); Filter aus; Amp-Simulation
const EQ = f64([1, 3, .5, .371, .052632, 0, .5, .5, .052632, 1, .61, .64658, .052632, 0, 0, .5, .852495, .052632]);
const fx = (pid, on, data, slot) => ({AutomationMode: 0, Automations: [], EffectId: 9000 + slot, EffectType: 1, Enabled: on, FactoryPreset: !data, InstanceId: 0, MidiInputBusId: 0, Name: 'Effekt ' + pid, PluginId: pid, PluginType: 0, PresetModified: false, PresetName: 'Default', Slot: slot, ...(data ? {Data: data} : {})});
for (const bus of root.Buses) {
  const ins = bus.Track && bus.Track.Instrument; if (ins && ins.Name) ins.Name = ins.PluginId === 1 ? 'Synth A' : ins.PluginId === 2 ? 'Sampler' : 'Drums';
  if (bus.Name === 'Bass') { ins.Data = doc(PB); ins.PresetName = 'Init Preset'; bus.Effects = [fx(11, true, EQ, 0), fx(5, false, f64([0, .8, .4]), 1)]; }
  if (bus.Name === 'Melodie') { ins.Data = doc(PM); ins.PresetName = 'Init Preset'; bus.Effects = [fx(11, true, EQ, 0), fx(8, true, f64([1, .325, 0, .5, 1]), 1)]; }
}
root.ProjectName = 'MLG2 Test';
// CBOR schreiben (Ganzzahl → Typ 0/1, sonst Float64)
function enc(o) {
  const parts = []; const head = (mt, v) => { if (v < 24) parts.push(Buffer.from([mt << 5 | v])); else if (v < 256) parts.push(Buffer.from([mt << 5 | 24, v])); else if (v < 65536) { const x = Buffer.alloc(3); x[0] = mt << 5 | 25; x.writeUInt16BE(v, 1); parts.push(x); } else { const x = Buffer.alloc(5); x[0] = mt << 5 | 26; x.writeUInt32BE(v, 1); parts.push(x); } };
  (function w(v) {
    if (v === true) parts.push(Buffer.from([0xf5])); else if (v === false) parts.push(Buffer.from([0xf4])); else if (v == null) parts.push(Buffer.from([0xf6]));
    else if (typeof v === 'number') { if (Number.isInteger(v) && Math.abs(v) < 4294967296) head(v >= 0 ? 0 : 1, v >= 0 ? v : -1 - v); else { const x = Buffer.alloc(9); x[0] = 0xfb; x.writeDoubleBE(v, 1); parts.push(x); } }
    else if (typeof v === 'string') { const x = Buffer.from(v); head(3, x.length); parts.push(x); }
    else if (v instanceof Uint8Array) { head(2, v.length); parts.push(Buffer.from(v)); }
    else if (Array.isArray(v)) { head(4, v.length); v.forEach(w); }
    else { const k = Object.keys(v); head(5, k.length); for (const kk of k) { w(kk); w(v[kk]); } }
  })(o);
  return Buffer.concat(parts);
}
const raw = enc(root), o = Buffer.alloc(raw.length + 8); Buffer.from([0x99, 0x63, 0x33, 0x70, 0x0d, 0x0a, 0x1a, 0x0a]).copy(o); for (let i = 0; i < raw.length; i++) o[i + 8] = raw[i] ^ 0x7C;
fs.writeFileSync(out, o); console.log('ok', o.length);
// kaputt: abgeschnitten
fs.writeFileSync(out.replace(/\.cbp$/, '-kaputt.cbp'), o.subarray(0, Math.floor(o.length * 0.6))); console.log('kaputt', Math.floor(o.length * 0.6));
