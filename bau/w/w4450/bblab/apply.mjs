// BB1: baut bb/index.html = basis.html + der BB1-Block (Klänge nach SP1-END, Werkzeugkasten nach GR1-END) + zwei Einhänge-Zeilen.
// node apply.mjs
import fs from 'fs';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4450/';
let s = fs.readFileSync(D + 'basis.html', 'utf8');
const snd = fs.readFileSync(D + 'bblab/bb1-snd.js', 'utf8').replace(/\n$/, '');
const blk = fs.readFileSync(D + 'bblab/bb1-block.js', 'utf8').replace(/\n$/, '');
const once = (a, b) => { const k = s.indexOf(a); if (k < 0 || s.indexOf(a, k + 1) >= 0) throw new Error('Anker nicht eindeutig: ' + a.slice(0, 80)); s = s.slice(0, k) + b + s.slice(k + a.length); };
once('/* SP1-END */\n', '/* SP1-END */\n' + snd + '\n');
once('/* GR1-END */\n', '/* GR1-END */\n' + blk + '\nObject.assign(SYNQUENZER, {bb1: BB1_API});                  /* BB1: Test-API (Objekt, wird nicht umhüllt) */\n');
once('    gr1ClipSheet(g, t, s, clip, reopen);                                                     // GR1: [Grundmuster ▾] · Small │ Full\n',
  '    gr1ClipSheet(g, t, s, clip, reopen);                                                     // GR1: [Grundmuster ▾] · Small │ Full\n' +
  '    bb1ClipSheet(g, t, s, clip, reopen);                                                     // BB1: [Werkzeugkasten ▾]\n');
once("  if (ED.laufBtn) { const bar = ED.roll.el.bar; bar.insertBefore(ED.laufBtn, bar.firstChild); bar.insertBefore(el('span', 'sep'), ED.laufBtn.nextSibling); ED.laufBtn.classList.add('lgo'); }\n",
  "  if (ED.laufBtn) { const bar = ED.roll.el.bar; bar.insertBefore(ED.laufBtn, bar.firstChild); bar.insertBefore(el('span', 'sep'), ED.laufBtn.nextSibling); ED.laufBtn.classList.add('lgo'); }\n" +
  "  bb1RollHook(t, s);                                                 // BB1: [Werkzeugkasten] neben [Spielweise]\n");
fs.writeFileSync(D + 'bb/index.html', s);
console.log('ok', s.length);
