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
if (fs.existsSync(K + '/apply-beg.mjs')) H = (await import(K + '/apply-beg.mjs')).default(H, rep, blk) || H;
fs.writeFileSync(K + '/index.html', H);
console.log('index.html', H.length);
