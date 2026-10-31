// G4-DSP direkt in Node (g4DspMake aus der App-Datei), für schnelle Messungen
import fs from 'fs';
export function loadG4(file = '/home/user/Synquenzer/bau/helfer/G4G5/index.html') {
  const s = fs.readFileSync(file, 'utf8'), a = s.indexOf('function g4DspMake() {'), b = s.indexOf('\nconst G4D = g4DspMake();');
  return new Function(s.slice(a, b) + ';return g4DspMake();')();
}
