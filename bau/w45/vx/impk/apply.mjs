// IMPK-Bau: basis.html + Blöcke → index.html (jede Ersetzung muss genau einmal passen)
import fs from 'node:fs';
const K = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/impk';
let H = fs.readFileSync(K + '/basis.html', 'utf8');
const rep = (a, b) => { if (H.split(a).length !== 2) throw new Error('Anker nicht eindeutig: ' + a.slice(0, 80)); H = H.replace(a, () => b); };
const blk = f => fs.readFileSync(K + '/' + f, 'utf8');
// (1) Gesang-Tempo: Block in imp1Core (läuft auch im Worker, imp1Core.toString())
rep('  // Raster-Treue der Einsätze für Periode P (s)', blk('block-tempo.js') + '  // Raster-Treue der Einsätze für Periode P (s)');
rep('    const ons = peaks(on, fps);\n', '    const ons = impkPeaks(on, fps, fe);   /* IMPK: Gesang-Einsätze ohne Ausklang-Spitzen, zwischen Rahmen verfeinert (vorher peaks(on, fps)) */\n');
// (2) Import-Blatt: Frage nach ½×
rep('function imp1Html() {\n', blk('block-ui.js') + 'function imp1Html() {\n');
rep('    const al = (r.alt || []).filter(v => v >= 40 && v <= 240);\n', "    const al = typeof impkAsk === 'function' ? impkAsk(c) : (r.alt || []).filter(v => v >= 40 && v <= 240);   /* IMPK: Paar zum gewählten Tempo (nach ½× nicht „60 oder 60?“) */\n");
// (3) Begleiter-Rest: Block hinter BEG1-END, ein Haken in click()
rep('/* BEG1-END */\n', '/* BEG1-END */\n' + blk('block-beg.js'));
rep("  if (UI.vvOff) return;                                     // VV1: the practice metronome is not part of the song video\n",
  "  if (UI.vvOff) return;                                     // VV1: the practice metronome is not part of the song video\n  if (typeof impkClickOff === 'function' && impkClickOff(t)) return;   /* IMPK: kein Metronom-Klick hinter dem SCHLUSS-Taktstrich des Begleiters */\n");
fs.writeFileSync(K + '/index.html', H);
console.log('index.html', H.length);
