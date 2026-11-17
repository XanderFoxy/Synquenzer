#!/usr/bin/env python3
# XLB: baut index.html aus basis.html (4.78.0) + src/block.js + src/block.css + einzeiligen Haken (Kennung XLB im Kommentar).
# Jede Änderung ist an Zeilennummer + Text der Basis gebunden (Abbruch, wenn der Text dort nicht steht).
import sys, os
D = os.path.dirname(os.path.abspath(__file__))
L = open(os.path.join(D, 'basis.html'), encoding='utf-8').read().split('\n')
N = len(L)
rep = {}      # Zeile -> neue Zeile
pre = {}      # Zeile -> Liste Zeilen davor
post = {}     # Zeile -> Liste Zeilen danach
C = '   /* XLB */'

def line(n, must):
    s = L[n - 1]
    if must not in s: sys.exit(f'Anker fehlt Z. {n}: {must!r}\n  ist: {s[:160]!r}')
    return s

def R(n, old, new, cm=C, count=1):
    s = rep.get(n, line(n, old))
    if s.count(old) != count: sys.exit(f'Z. {n}: {old!r} {s.count(old)}× statt {count}×')
    s = s.replace(old, new)
    if cm and 'XLB' not in s: s = s + cm
    rep[n] = s

def B(n, must, txt): line(n, must); pre.setdefault(n, []).append(txt)
def A(n, must, txt): line(n, must); post.setdefault(n, []).append(txt)

# ---------- Format / Lesen (SQStore) ----------
R(24115, 'const PROJECT_FORMAT_READ = 7;', 'const PROJECT_FORMAT_READ = 8;', '   /* XLB: 8 = Projekt mit mehr als 8 Spuren oder Szenen */')
A(24125, "if (!p || typeof p !== 'object') return PROJECT_FORMAT;", "      if ((Array.isArray(p.tracks) && p.tracks.length > 8) || (Array.isArray(p.scenes) && p.scenes.length > 8)) return 8;   /* XLB: großes Projekt (ältere Fassung sperrt) */")

# ---------- Datenkern ----------
R(28488, 'const MAX_T = 8,', 'const MAX_T = 24,', '   /* XLB: 24 = Datenobergrenze (war 8); N_SCN = 8 bleibt die Szenenzahl neuer Projekte, die echte Zahl ist NS() */')
R(28493, 'const NS = () => N_SCN;', 'const NS = () => S.scenes.length;', '   /* XLB: Szenen je Projekt 8…32 (war fest 8) */')
R(28498, 'const emptyClips = () => new Array(N_SCN).fill(null);', 'const emptyClips = () => new Array(xlNsN()).fill(null);', '   /* XLB: Szenenzahl des Projekts (beim Laden die der Datei) */')
R(28499, 'const orderFor = n => DEF_ORDER.filter(i => i < n);', 'const orderFor = n => (n > XL_STD ? xlOrderFor(n) : DEF_ORDER.filter(i => i < n));', '   /* XLB: Spuren 9–24 vor DRUMS */')
A(28500, 'function trackOrder()', '@@BLOCK@@')
A(28826, '    const p = newProjectRaw();', '    xlNormBegin(obj, p);                                          /* XLB: Szenenzahl 8…32 aus der Datei (Kontext für emptyClips und Klemmen) */')
R(28877, 'obj.scenes.slice(0, N_SCN)', 'obj.scenes.slice(0, xlNsN())')
R(28907, 'clamp(Math.round(ui.selS), 0, N_SCN - 1)', 'clamp(Math.round(ui.selS), 0, xlNsN() - 1)')
A(28908, 'order: ord, sceneBank: ui.sceneBank === 1', '    xlNormUi(ui, p);                                              /* XLB: Bänke > 1 nur im großen Projekt */')
R(28913, 'obj.scenes.slice(0, N_SCN)', 'obj.scenes.slice(0, xlNsN())')
B(28923, '    return p;', '    xlNormEnd(p);                                                 /* XLB: Kontext zu (alle Spuren so lang wie die Szenen) */')
R(28822, "if (!obj || typeof obj !== 'object') return newProjectRaw();", "if (!obj || typeof obj !== 'object') return xlNormFail();", '   /* XLB: 8 Szenen, auch wenn das offene Projekt mehr hat */')
R(28924, 'return newProjectRaw(); }', 'return xlNormFail(); }', '   /* XLB: ohne Szenen-Kontext */')
R(29002, 'clamp(Math.round(e.slot), -1, N_SCN - 1)', 'clamp(Math.round(e.slot), -1, xlNsN() - 1)')
R(29047, 'clamp(Math.round(c.from.s), 0, N_SCN - 1)', 'clamp(Math.round(c.from.s), 0, xlNsN() - 1)')
R(29053, 'clamp(Math.round(c.from.e.slot), -1, N_SCN - 1)', 'clamp(Math.round(c.from.e.slot), -1, xlNsN() - 1)')
R(29057, 'clamp(Math.round(pv.slot), -1, N_SCN - 1)', 'clamp(Math.round(pv.slot), -1, xlNsN() - 1)')
R(29087, '/^[PS][1-8]$/.test(m.part)', '/^(P[1-8]|S([1-9]|[12]\\d|3[0-2]))$/.test(m.part)', '   /* XLB: Marke „Szene 1…32“ */')

# ---------- Engine / Wiedergabe ----------
R(30004, 'synth: new Array(8).fill(null)', 'synth: new Array(MAX_T).fill(null)')
R(30032, 'for (let i = 0; i < NT(); i++) buildTrack(i);', 'for (let i = 0; i < NT(); i++) if (!xlDefer(i)) buildTrack(i);', '   /* XLB: Zusatzspuren 9–24 erst bei Bedarf / in Scheiben */')
A(30239, 'for (let i = 0; i < MAX_T; i++) {', '    if (i >= XL_STD && i < NT() && !AU.tracks[i] && xlDefer(i)) continue;   /* XLB: Zusatzspur ohne Kette: bei Bedarf / in Scheiben */')
R(30986, 'const WKSET = new Array(8).fill(null);', 'const WKSET = new Array(MAX_T).fill(null);')
R(30996, 'const WKFM = new Array(8).fill(0), WKFM_AT = new Array(8).fill(0);', 'const WKFM = new Array(MAX_T).fill(0), WKFM_AT = new Array(MAX_T).fill(0);')
A(32010, 'function spawnVoice(i, out, vel, t0, o) {', '  if ((!AU.tracks[i] || XLB.pend.has(i)) && AU.ctx && i < NT()) xlWake(i);   /* XLB: Zusatzspur bekommt Kette + Engine vor dem ersten Ton */')
R(32949, 'slot: new Array(8).fill(-1), cstart: new Array(8).fill(0), pend: new Array(8).fill(null), prev: new Array(8).fill(null),',
  'slot: new Array(MAX_T).fill(-1), cstart: new Array(MAX_T).fill(0), pend: new Array(MAX_T).fill(null), prev: new Array(MAX_T).fill(null),')
R(32950, 'own: new Array(8).fill(null),', 'own: new Array(MAX_T).fill(null),')
R(32952, 'lastNote: new Array(8).fill(60)', 'lastNote: new Array(MAX_T).fill(60)')
R(32954, 'songOverride: new Array(8).fill(false)', 'songOverride: new Array(MAX_T).fill(false)')
A(33295, 'const s = R.slot[i]; if (s < 0) {', '  if ((!AU.tracks[i] || XLB.pend.has(i)) && AU.ctx) xlWake(i);   /* XLB: Kette + Engine der Zusatzspur vor dem ersten geplanten Ton */')
A(32945, 'let S = demoProject();', 'XLB.sOk = true;                              /* XLB: ab hier gibt es S (Szenenzahl ohne TDZ-Ausnahme) */')
R(33720, 'cs: new Array(8).fill(0)', 'cs: new Array(MAX_T).fill(0)')
B(34852, "if (e.kind === 'mtx') return mtxUndoState(e);", "  if (e.kind === 'xls') return xlScnSnap();                   /* XLB: Szenenzahl (＋ Szene / Szene entfernen) */")
B(34889, "if (e.kind === 'ux2') ux2UndoApply(e, val); else", "  if (e.kind === 'xls') xlScnPut(val); else                   /* XLB */")
A(35163, "HIST.kind('sx14',", "HIST.kind('xls', () => [['scenes'], ['tracks']]);                   /* XLB: ＋ Szene / Szene entfernen */")
R(35674, 'const canAddTrack = () => NT() < MAX_T;', 'const canAddTrack = () => NT() < xlTLim();', '   /* XLB: bisherige Wege 8 (großes Projekt 24); ＋ Spur von Hand: xlCanAddT */')
R(35708, "if (!canAddTrack()) { toast('Höchstens 8 Spuren – leere Spuren lassen sich neu belegen');", "if (!xlCanAddT()) { toast('Höchstens ' + MAX_T + ' Spuren – leere Spuren lassen sich neu belegen');")
R(35754, "data-a=\"add\"${canAddTrack() ? '' : ' disabled'}", "data-a=\"add\"${xlCanAddT() ? '' : ' disabled'}")
B(35788, 'if (n < 3) return false;', '  if (n < 3 && xlHeavy()) n = 3;                                   /* XLB: auch ab 16 gleichzeitig spielenden Spuren */')
R(36422, 'cache: new Array(8).fill(null)', 'cache: new Array(XL_S).fill(null)')
R(36518, 'last: new Array(8).fill(-1e9)', 'last: new Array(MAX_T).fill(-1e9)')

# ---------- Matrix ----------
R(36808, 'const sceneBankOf = () => (UI.sceneBank === 1 ? 1 : 0);', 'const sceneBankOf = () => xlSG();', '   /* XLB: Gruppe zu 4 Szenen (0/1 wie bisher, im großen Projekt bis 7) */')
R(36809, 'const trackBankOf = () => (UI.trackBank === 1 ? 1 : 0);', 'const trackBankOf = () => (UI.trackBank > 0 ? UI.trackBank | 0 : 0);', '   /* XLB: beliebig viele Spur-Seiten */')
A(36812, 'const g = EL.grid; if (!g) return;', '  if (UI.scenes && UI.scenes.length !== NS()) { buildGrid(); return; }   /* XLB: Szenenzahl geändert → Zellen neu */')
R(36823, 'MX.scenes = MX.bankS ? [0, 1, 2, 3].map(s => s + sceneBankOf() * 4) : [0, 1, 2, 3, 4, 5, 6, 7];', 'MX.scenes = xlMxScenes();', '   /* XLB: die sichtbare Bank aus beliebig vielen (4 oder 8 Spalten) */')
R(36838, 'for (let s = 0; s < N_SCN; s++)', 'for (let s = 0; s < NS(); s++)')
R(36840, 'for (let s = 0; s < N_SCN; s++)', 'for (let s = 0; s < NS(); s++)')
A(36857, '  chqMxApply();', '  xlMxGhost();                                                     /* XLB: leere Spalten am Ende der letzten Bank (＋ Szene) */')
A(36881, 'MX.cols = colsOf(8) >= 56 ? 8 : 4; MX.bankS = MX.cols === 4;', '  if (NS() > MX.cols) MX.bankS = true;                             /* XLB: mehr Szenen als Spalten → [SZ] auch quer */')
A(36883, 'const headW = W - 40 - 5 * gapX - 4 * colsOf(4);', '  xlMxCorner(W, gapX, colsOf);                                     /* XLB: [SZ]-Platz bei 8 Spalten */')
R(36898, 'for (let s = 0; s < N_SCN; s++)', 'for (let s = 0; s < NS(); s++)')
R(36915, 'for (let s = 0; s < N_SCN; s++)', 'for (let s = 0; s < NS(); s++)')
R(36926, 'k < 3 * (N_SCN + 2)', 'k < 3 * (XL_STD + 2)')
R(36931, 'UI.sceneBank = n ? 1 : 0;', 'UI.sceneBank = xlSbClamp(n);')
R(36932, 'UI.trackBank = n && MX.pages && MX.pages.length > 1 ? 1 : 0;', 'UI.trackBank = MX.pages && MX.pages.length > 1 ? clamp(n | 0, 0, MX.pages.length - 1) : 0;')
A(36951, 'if (UI.heads.length !== NT() || UI.heads.some', '  else if (UI.scenes && UI.scenes.length !== NS()) buildGrid();     /* XLB: anderes Projekt, andere Szenenzahl */')
R(37066, 'const other = sceneBankOf() ? [0, 1, 2, 3] : [4, 5, 6, 7],', 'const other = xlSzOther(),')
R(37067, "const lab = sceneBankOf() ? '5–8' : '1–4';", 'const lab = xlSzLab();')
R(37068, "(sceneBankOf() ? '1–4' : '5–8')", 'xlSzAria()')
R(37250, '(avail + ubH) / (8 + 2) < 26 - .5', '(avail + ubH) / (Math.max(8, NT()) + 2) < 26 - .5')
R(37428, '{s: clamp(Math.round(s.s), 0, N_SCN - 1)}', '{s: clamp(Math.round(s.s), 0, xlNsN() - 1)}')
R(37454, 'slot = clamp(Math.round(e.slot), -1, N_SCN - 1)', 'slot = clamp(Math.round(e.slot), -1, xlNsN() - 1)')
R(37507, "const m = /^([SP])([1-8])$/.exec(String(src || '')); return m ? {kind: m[1], k: +m[2] - 1} : null;",
  "const m = /^([SP])([1-9]|[12]\\d|3[0-2])$/.exec(String(src || '')); return m && (m[1] === 'S' || +m[2] <= 8) ? {kind: m[1], k: +m[2] - 1} : null;", '   /* XLB: S1…S32 (P1…P8 wie bisher) */')
R(38566, 'm = /^S([1-8])$/.exec(s);', 'm = /^S([1-9]|[12]\\d|3[0-2])$/.exec(s);')
R(38589, "const q = /^([PS])([1-8])$/.exec(m.part || '');", "const q = /^([PS])([1-9]|[12]\\d|3[0-2])$/.exec(m.part || '');")
A(43102, 'i = clamp(i | 0, 0, NT() - 1);', '  if ((!AU.tracks[i] || XLB.pend.has(i)) && AU.ctx) xlWake(i);   /* XLB: gewählte Zusatzspur spielt sofort */')
R(30470, 'function syncEngines() { for (const i of synthTracks()) syncEngine(i, true); }', 'function syncEngines() { for (const i of synthTracks()) if (!xlDeferE(i)) syncEngine(i, true); }', '   /* XLB: Engines der Zusatzspuren einzeln nachbauen */')
R(43108, 'if (MX.bankS && (R.selS >= 4) !== (sceneBankOf() === 1)) setSceneBank(R.selS >= 4 ? 1 : 0);', 'xlShowScene(R.selS);')
R(43577, 'const MODS_DIRTY = new Array(8).fill(0);', 'const MODS_DIRTY = new Array(MAX_T).fill(0);')
R(51962, '/^S[1-8]$/.test(o.part)', '/^S([1-9]|[12]\\d|3[0-2])$/.test(o.part)')
R(52045, '/^S[1-8]$/.test(q.src)', '/^S([1-9]|[12]\\d|3[0-2])$/.test(q.src)')
R(52062, 'if (MX.bankS && (to >= 4) !== (sceneBankOf() === 1)) setSceneBank(to >= 4 ? 1 : 0);', 'xlShowScene(to);')
R(52228, "if (k === 'sz') setSceneBank(1 - sceneBankOf());", "if (k === 'sz') xlSceneNext();")
R(52411, 'bAddT.disabled = !canAddTrack();', 'bAddT.disabled = !xlCanAddT();', '   /* XLB: ＋ Spur von Hand bis 24 */')
A(52507, "'Szene starten: ▶ 1–4.", "    'MEHR SZENEN UND SPUREN: [SZ] halten oder einen Szenen-Kopf halten → ＋ Szene (bis 32). ■ einer Spur halten → ＋ Spur (bis 24). [SZ] blättert durch alle Szenen. Normale Projekte bleiben bei 8 Szenen.',   /* XLB */")
R(52857, "UI.sceneBank = S.ui && S.ui.sceneBank === 1 ? 1 : R.selS >= 4 ? 1 : 0; UI.trackBank = S.ui && S.ui.trackBank === 1 ? 1 : 0;",
  "UI.sceneBank = xlIs() ? xlSbLoad() : S.ui && S.ui.sceneBank === 1 ? 1 : R.selS >= 4 ? 1 : 0; UI.trackBank = xlIs() ? xlTbLoad() : S.ui && S.ui.trackBank === 1 ? 1 : 0;")
R(52885, 'KEYC.cache = new Array(8).fill(null);', 'KEYC.cache = new Array(XL_S).fill(null);')
R(52911, 'for (let s = 0; s < N_SCN; s++)', 'for (let s = 0, nS = p && Array.isArray(p.scenes) ? p.scenes.length : XL_STD; s < nS; s++)')

# ---------- MIDI ----------
R(54885, 'for (const tr of S.tracks.slice(0, MIDI_T))', 'for (const tr of S.tracks.slice(0, xlMidiT()))')
R(54890, 'if (!c || !c.notes.length || i >= MIDI_T) return;', 'if (!c || !c.notes.length || i >= xlMidiT()) return;')
R(54891, "ch = tr.kind === 'drum' || percIs(tr) ? 9 : i,", "ch = tr.kind === 'drum' || percIs(tr) ? 9 : i < MIDI_T ? i : midiCh(i),")
R(54914, 'counts, off, null, null, tsl.length ? tsl : null);', 'counts, off, null, xlMidiIdx(), tsl.length ? tsl : null);', '   /* XLB: großes Projekt = alle Spuren */')
R(54926, 'if (!tr || e.track >= MIDI_T) continue;', 'if (!tr || e.track >= xlMidiT()) continue;')
R(54927, "const ch = tr.kind === 'drum' || percIs(tr) ? 9 : e.track,", "const ch = tr.kind === 'drum' || percIs(tr) ? 9 : e.track < MIDI_T ? e.track : midiCh(e.track),")
R(54933, 'PERF.tempo, null, S.ts', 'PERF.tempo, xlMidiIdx(), S.ts')

# ---------- Matrix-Gesten, Guide, CHS ----------
B(55316, '// V2a (320 px): hold [SZ] in the ■ place', '    if (xlSzDown(e)) return;                                       /* XLB: [SZ] in der Ecke halten = Szenen-Blatt */')
R(55362, 'if (e.target.closest(\'.szb\')) { setSceneBank(1 - sceneBankOf());', "if (e.target.closest('.szb')) { xlSceneNext();")
A(55918, "if (typeof ki1Guide === 'function') ki1Guide(UI1.ents);", "  if (typeof xlGuide === 'function') xlGuide(UI1.ents);   /* XLB: mehr Szenen und Spuren */")
R(60488, 'clamp(o.scene | 0, 0, N_SCN - 1)', 'clamp(o.scene | 0, 0, NS() - 1)')
R(73127, 'for (let s = 0; s < N_SCN; s++)', 'for (let s = 0; s < NS(); s++)')
R(73145, 'UI.fill.length < 12 * (N_SCN + 2)', 'UI.fill.length < 12 * (XL_STD + 2)')
R(73179, 'for (let s = 0; s < N_SCN; s++)', 'for (let s = 0; s < NS(); s++)')
R(73189, 'for (let s = 0; s < N_SCN; s++)', 'for (let s = 0; s < NS(); s++)')

# ---------- Video ----------
R(75110, 'synth: new Array(8).fill(null)', 'synth: new Array(MAX_T).fill(null)')
R(75334, "t: [1, 2, 3, 4, 5, 6, 7, 8].map(k => v('--t' + k, '#888'))};", "t: Array.from({length: MAX_T}, (_, k) => v('--t' + (k + 1), '#888'))};")
R(78640, 'pg = Math.min(UI.trackBank === 1 ? 1 : 0, pages.length - 1);', 'pg = Math.min(trackBankOf(), pages.length - 1);')
R(78645, 'const c0 = hi >= 4 ? 4 : 0,', 'const c0 = hi >= 4 ? Math.floor(hi / 4) * 4 : 0,')
R(78652, "(M.c0 + 1) + '–' + (M.c0 + 4)", "(M.c0 + 1) + '–' + Math.min(NS(), M.c0 + 4)")
R(78655, 'const s = M.c0 + k, x = 117.5 + k * 65.625;', 'const s = M.c0 + k, x = 117.5 + k * 65.625; if (s >= NS()) continue;', '   /* XLB: keine Köpfe hinter der letzten Szene */')
R(83373, 'clamp(Math.round(x.slot), -1, N_SCN - 1)', 'clamp(Math.round(x.slot), -1, xlNsN() - 1)')
R(83822, 'slot = clamp(Math.round(e.slot), -1, N_SCN - 1)', 'slot = clamp(Math.round(e.slot), -1, xlNsN() - 1)')

# ---------- MTX / MTX3 / SPK11 (Grenze der bisherigen Wege: xlTLim) ----------
R(96331, 'np = MX.bankT && MX.pages ? Math.min(MX.pages.length, 2) : 1;', 'np = MX.bankT && MX.pages ? MX.pages.length : 1;')
R(96335, "if (hor && x < B.l - 2 && MX.bankS && sb > 0) c.push({dir: 'left', to: 0, lab: 'Szenen 1–4', go: () => setSceneBank(0)});", "if (hor && x < B.l - 2 && MX.bankS) { const zz = xlEdgeS(-1); if (zz) c.push(zz); }")
R(96336, "if (hor && x > B.r + 2 && MX.bankS && sb < 1) c.push({dir: 'right', to: 1, lab: 'Szenen 5–8', go: () => setSceneBank(1)});", "if (hor && x > B.r + 2 && MX.bankS) { const zz = xlEdgeS(1); if (zz) c.push(zz); }")
R(96500, 'const hid = MX.bankS && (k >= 4) !== (sceneBankOf() === 1);', 'const hid = MX.bankS && !MX.scenes.includes(k);')
R(96501, "(hid ? ' (SZ ' + (k >= 4 ? '5–8' : '1–4') + ')' : '')", "(hid ? ' (SZ ' + xlBankLab(k) + ')' : '')")
A(96517, "onTap(p, btn => { closePop(); if (btn.dataset.mtx === 'dup') mtxSceneDup(s); }, 'button[data-mtx]');", '    xlScnRow(p);                                                   /* XLB: ＋ Szene am Ende */')
R(96560, "'Höchstens ' + MAX_T + ' Spuren", "'Höchstens ' + xlTLim() + ' Spuren")
R(96832, 'free = MAX_T - NT()', 'free = xlTLim() - NT()')
R(96841, "'Alle ' + MAX_T + ' Spur-Plätze", "'Alle ' + xlTLim() + ' Spur-Plätze")
R(96989, "Höchstens ' + MAX_T + ' Spuren:", "Höchstens ' + xlTLim() + ' Spuren:")
R(97006, "(höchstens ' + MAX_T + ')'", "(höchstens ' + xlTLim() + ')'")
R(97049, "'Höchstens ' + MAX_T + ' Spuren", "'Höchstens ' + xlTLim() + ' Spuren")
R(97280, "'Höchstens ' + MAX_T + ' Spuren'", "'Höchstens ' + xlTLim() + ' Spuren'")
R(97566, 'free = MAX_T - NT()', 'free = xlTLim() - NT()')
R(97567, 'MAX_T', 'xlTLim()', C, count=2)
R(108163, 'let add = MAX_T - NT();', 'let add = xlTLim() - NT();')
R(108266, "(höchstens ' + MAX_T + ' Spuren)'", "(höchstens ' + xlTLim() + ' Spuren)'")

# ---------- need / Test-Zugang ----------
B(113334, 'window.SYNQUENZER = SYNQUENZER;', 'SYNQUENZER.xl = xlApi();                                          /* XLB: Test-Zugang */')
R(113416, "let KNOWN_NEED = ['lf', 'lk', 'lw', 'sr', 'st'];", "let KNOWN_NEED = ['lf', 'lk', 'lw', 'sr', 'st', 'xl'];", '   /* XLB: + xl */')
A(113419, 'if (!p || !Array.isArray(p.tracks)) return [];', "  if (p.tracks.length > 8 || (Array.isArray(p.scenes) && p.scenes.length > 8)) s.add('xl');   /* XLB: mehr als 8 Spuren oder Szenen */")

# ---------- Prüfung (XLB-P): Song-Farben bis 24, Pegel-Messer je Projekt, Szene entfernen mit Song-Marke ----------
R(37263, "SV.cols = [1, 2, 3, 4, 5, 6, 7, 8].map(k => cs.getPropertyValue('--t' + k).trim() || '#888');",
  "SV.cols = Array.from({length: MAX_T}, (_, k) => cs.getPropertyValue('--t' + (k + 1)).trim() || '#888');", '   /* XLB: Farben aller 24 Spuren (vorher 8: Blöcke der Spuren 9–24 ohne Farbe) */')
R(48069, 'function mtrStore(cap) { return {cap, t: new Float64Array(cap), v: new Float32Array(cap * MTR_W),',
  'function mtrStore(cap, n) { const w = 1 + 2 * (n || MTR_IN); return {cap, n: n || MTR_IN, w, t: new Float64Array(cap), v: new Float32Array(cap * w),', '   /* XLB: Breite je Messer (normal 8 Spuren + Master wie 4.78) */')
R(48071, 'MTR_W', 'Q.w', C, count=4)
B(48087, 'const j = mtrFind(Q, tau);', '  const xk = xlMtrK(Q, k); if (xk < 0) return o;                  /* XLB: Spur ohne Eingang in diesem Messer → leer; k = MAX_T = Master (letzter Eingang) */')
R(48088, 'c = 1 + 2 * k,', 'c = 1 + 2 * xk,')
R(48091, 'Q.v[q * MTR_W + c]', 'Q.v[q * Q.w + c]')
R(48092, 'Q.v[q * MTR_W + c + 1]', 'Q.v[q * Q.w + c + 1]')
A(48101, "if (!off && SynthHost.state !== 'ready') return null;", '  const xn = xlMtrN();                                               /* XLB: Eingänge: 8 Spuren + Master wie 4.78, mit mehr als 8 Spuren 24 + Master */')
R(48104, 'numberOfInputs: MTR_IN,', 'numberOfInputs: xn,')
R(48107, '{node, ctx: c, tap: [],', '{node, ctx: c, n: xn, tap: [],')
R(48107, 'mtrStore(Math.ceil(c.length / 128) + 8)', 'mtrStore(Math.ceil(c.length / 128) + 8, xn)')
R(48107, 'mtrStore(160)', 'mtrStore(160, xn)')
R(48111, 'AU.M.ceil.connect(node, 0, MAX_T)', 'AU.M.ceil.connect(node, 0, xn - 1)')
R(48115, 'if (!M || !A || !A.cut || A.cut.context !== M.ctx) return;', 'if (!M || !A || !A.cut || A.cut.context !== M.ctx || i >= M.n - 1) return;', '   /* XLB: nur Spuren mit Eingang */')
A(48162, 'if (!M || M.off) { if (MTR.vis) mtrBlank(); return; }', '  if (M.n !== xlMtrN()) { xlMtrRe(); return; }                      /* XLB: Spurzahl über/unter 8 → Messer mit passender Eingangszahl neu */')
R(66972, 'to.connect(AU.meter.node, 0, MAX_T)', 'to.connect(AU.meter.node, 0, (AU.meter.n || MTR_IN) - 1)', '   /* XLB: Master = letzter Eingang */')

# ---------- CSS ----------
B(5218, '</style>', '@@CSS@@')

blk = open(os.path.join(D, 'src/block.js'), encoding='utf-8').read().rstrip('\n')
css = open(os.path.join(D, 'src/block.css'), encoding='utf-8').read().rstrip('\n')
rng = os.environ.get('XLB_ONLY'); OUT = os.environ.get('XLB_OUT', 'index.html')
if rng:
    lo, hi = map(int, rng.split('-'))
    keep = lambda n: lo <= n <= hi or n in (28500, 5218)
    rep = {k: v for k, v in rep.items() if keep(k)}; pre = {k: v for k, v in pre.items() if keep(k)}; post = {k: v for k, v in post.items() if keep(k)}
out = []
for i, s in enumerate(L, 1):
    for t in pre.get(i, []): out.append(css if t == '@@CSS@@' else t)
    out.append(rep.get(i, s))
    for t in post.get(i, []): out.append(blk if t == '@@BLOCK@@' else t)
open(os.path.join(D, OUT), 'w', encoding='utf-8').write('\n'.join(out))
print('ok: ersetzt', len(rep), 'Zeilen, davor', sum(len(v) for v in pre.values()), ', danach', sum(len(v) for v in post.values()))
