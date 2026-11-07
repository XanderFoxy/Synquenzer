// TKT: Block + Einhänge-Zeilen in die Kopie (exakte, eindeutige Ersetzungen; bricht ab, wenn eine nicht genau einmal passt)
import fs from 'fs';
const [file, blockFile] = process.argv.slice(2);
let s = fs.readFileSync(file, 'utf8');
const block = fs.readFileSync(blockFile, 'utf8');
if (s.includes('TKT BEGIN')) { console.log('FEHLER schon gepatcht'); process.exit(1); }
const rep = (a, b, name) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('FEHLER ' + name + ': ' + n + ' Treffer'); process.exit(1); } s = s.replace(a, () => b); console.log('OK ' + name); };
rep("      if (!tkPlain()) t1Clicks(b0, b1);                            // T1: ein Klick je Zählzeit mit dem Betonungsmuster der Taktart",
    "      if (!tkPlain() || tktClickOn(b0)) t1Clicks(b0, b1);          // T1: ein Klick je Zählzeit mit dem Betonungsmuster der Taktart; TKT: auch die Taktart der Clips (Matrix)", 'tick');
rep("function t1Clicks(b0, b1) {\n", "function t1Clicks(b0, b1) {\n  if (tktClicks(b0, b1)) return;                                   // TKT: Matrix in der Taktart der klingenden Clips, Einzähler\n", 't1Clicks');
rep("function tCountBeats(n) { if (tkPlain()) return 4 * n;", "function tCountBeats(n) { const tc = tktCountTs(); if (tc) return n * tsBeats(tc); if (tkPlain()) return 4 * n;", 'tCountBeats');
rep("const ciMax = () => tkPlain() ? 4 *", "const ciMax = () => tkPlain() && !TKT.ci ? 4 *", 'ciMax');
rep("function t1BarPos(b) {\n", "function t1BarPos(b) {\n  { const mx = tktMx(b); if (mx) return tktBarPos(b, mx); }       // TKT: Taktart der Clips (Matrix)\n", 't1BarPos');
rep("function renderTakt(bAud) {\n  let txt, cls = '';\n", "function renderTakt(bAud) {\n  let txt, cls = ''; tktLeds(bAud);                                 // TKT: so viele Takt-LEDs wie die Taktart Zählzeiten hat\n", 'renderTakt-leds');
rep("  else if (!tkPlain()) txt = t1TaktTxt(bAud);", "  else if (!tkPlain() || tktMx(bAud)) txt = t1TaktTxt(bAud);", 'renderTakt-txt');
rep("const led = !R.playing ? -1 : tkPlain() ? ((Math.floor(bAud) % 4) + 4) % 4 : t1Led(bAud);", "const led = !R.playing ? -1 : tkPlain() && !tktMx(bAud) ? ((Math.floor(bAud) % 4) + 4) % 4 : t1Led(bAud);", 'renderTakt-led');
rep("        toast(nm + ': Taktart ' + (m.ts || S.ts || '4/4'), same ? [{label: 'Für alle „' + nm + '“', fn: () => { setMarkTs(id, m.ts || null, true); }}, songUndoAct()] : songUndoAct());",
    "        tktMarkTsToast(id, nm, same);                                 // TKT: [Clips umwandeln] [Für alle „Teil“] [↶]", 'markSheet-toast');
rep("    toast('Taktart ' + (ts || '4/4'), cand ? [{label: 'Clips umrechnen', fn: () => setSongTs(ts, {clips: true, from: old})}, {label: '↶', fn: () => undo()}] : {label: '↶ Rückgängig', fn: () => undo()});",
    "    if (cand || S.song) tktSongTsToast(ts); else toast('Taktart ' + (ts || '4/4'), {label: '↶ Rückgängig', fn: () => undo()});   // TKT: [Clips umwandeln] faltet (Song: Versionen)", 'setSongTs-toast');
rep("  gr1ClipNorm(c, out);                                                                                // GR1: clip.sf (Small/Full), clip.gr (Remix-Version)\n",
    "  gr1ClipNorm(c, out);                                                                                // GR1: clip.sf (Small/Full), clip.gr (Remix-Version)\n  tktClipNorm(c, out);                                                                                // TKT: clip.tkt (Faltung / Dur-Moll-Version)\n", 'normClip');
rep("  if (c.vid) o.vid = c.vid;                                       // VR1: Im Video\n  return o;\n}",
    "  if (c.vid) o.vid = c.vid;                                       // VR1: Im Video\n  tktClipClean(c, o);                                             // TKT: clip.tkt\n  return o;\n}", 'cleanClip');
rep("  d.hall.freeze = h.freeze === true;\n", "  d.hall.freeze = h.freeze === true;\n  tktFxNorm(h, d.hall);                                          // TKT: Hall-Raum (tktRaum, tktLen; fehlt = eingebauter Hall)\n", 'normFxBus');
rep("  AU.hallRet.gain.setTargetAtTime(h.ret, t, .02);\n}\n// the worklet hall replaces", "  AU.hallRet.gain.setTargetAtTime(h.ret, t, .02);\n  tktHallApply(h, commit, t);                                     // TKT: Hall-Raum (Faltung / Öltank) im selben Bus\n}\n// the worklet hall replaces", 'applyHall');
rep("function hallClear() {\n  const c = AU.ctx; if (!c || !AU.hall) return;\n", "function hallClear() {\n  const c = AU.ctx; if (!c || !AU.hall) return;\n  tktHallClear();                                                 // TKT: Raum leeren\n", 'hallClear');
rep("  else pageFxSpur(pg, i);\n  fxLongLabels(pg);\n}", "  else pageFxSpur(pg, i);\n  fxLongLabels(pg);\n  tktFxPage(pg, sub, i);                                          // TKT: [RACK]; HALL: [RAUM ▾]\n}", 'pageFx');
rep("  if (ED.dTab === 'fx') fxLongLabels(pg);\n", "  if (ED.dTab === 'fx') fxLongLabels(pg);\n  if (ED.dTab === 'fx') tktFxPage(pg, ED.dFx, DRUM_T);             // TKT: [RACK]; HALL: [RAUM ▾]\n", 'drumFx');
rep("  if (e.kind === 'sx14') return sx14State();                                                    // SX714: ganzer Stand (Schnappschuss)\n",
    "  if (e.kind === 'sx14') return sx14State();                                                    // SX714: ganzer Stand (Schnappschuss)\n  if (e.kind === 'tkt') return tktUndoState(e);                                                 // TKT: Tonart + Song + Teile (Dur ↔ Moll)\n", 'undoState');
rep("  else if (e.kind === 'sx14') sx14Put(val);                      // SX714: Schnappschuss zurückgeholt (ganzer Stand)\n",
    "  else if (e.kind === 'sx14') sx14Put(val);                      // SX714: Schnappschuss zurückgeholt (ganzer Stand)\n  else if (e.kind === 'tkt') tktUndoApply(e, val);               // TKT: Dur ↔ Moll\n", 'undoApply');
rep("  mx2MenuRow(s1, row, btn);                                       // MX2: Mix › [Mix & Master …]\n",
    "  mx2MenuRow(s1, row, btn);                                       // MX2: Mix › [Mix & Master …]\n  tktMenuRow(s1, row, btn);                                       // TKT: Song › [Dur ↔ Moll …]\n", 'menu');
rep("Object.assign(SYNQUENZER, {vd3: VD3_API});                  /* VD3: Test-API (Objekt, wird nicht umhüllt) */\n",
    "Object.assign(SYNQUENZER, {vd3: VD3_API});                  /* VD3: Test-API (Objekt, wird nicht umhüllt) */\n" + block, 'block');
fs.writeFileSync(file, s);
console.log('OK geschrieben', s.length);
