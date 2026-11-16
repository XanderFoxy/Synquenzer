#!/usr/bin/env python3
# LAGE1: baut index.html aus basis.html + lage1-block.js + einzeiligen Haken (jede Stelle genau einmal)
import sys, os, hashlib
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'basis.html'), encoding='utf-8').read()
blk = open(os.path.join(here, 'lage1-block.js'), encoding='utf-8').read().rstrip('\n') + '\n'
assert hashlib.md5(src.encode('utf-8')).hexdigest().startswith('68e92c03'), 'basis.html ist nicht 4.78.0'

def once(s, old, new, tag):
    n = s.count(old)
    if n != 1: sys.exit('Haken %s: %d Treffer' % (tag, n))
    return s.replace(old, new)

def after(s, anchor, line, tag): return once(s, anchor, anchor + '\n' + line, tag)
def before(s, anchor, line, tag): return once(s, anchor, line + '\n' + anchor, tag)

s = src
# Block hinter MTX3 (nutzt mtx3Out, mtx3Targets)
s = once(s, '/* MTX3-END */\n', '/* MTX3-END */\n' + blk, 'block')
# H1 Daten: fc wird mit der Note gespeichert, kopiert, eingefügt
s = once(s, "const NOTE_X = ['o', 'a', 'p', 'r', 'm', 'sy', 'off', 'rt', 'tp', 'pb', 'cd'];   // LF1: off, rt, tp, pb; JAM1: cd (Bedingung)",
            "const NOTE_X = ['o', 'a', 'p', 'r', 'm', 'sy', 'off', 'rt', 'tp', 'pb', 'cd', 'fc'];   // LF1: off, rt, tp, pb; JAM1: cd (Bedingung); LAGE1: fc (Filter je Note)", 'H1')
# H13 Speicherformat (SQStore, gepackte Noten): fc reist als Zusatzfeld mit
s = once(s, "  const NOTE_EXTRA = ['o', 'a', 'p', 'r', 'm', 'lk', 'off', 'rt', 'tp', 'pb', 'cd'];       // WP1: extra note fields survive packing (§12.1); LF1: off, rt, tp, pb; JAM1: cd (Bedingung)",
            "  const NOTE_EXTRA = ['o', 'a', 'p', 'r', 'm', 'lk', 'off', 'rt', 'tp', 'pb', 'cd', 'fc'];       // WP1: extra note fields survive packing (§12.1); LF1: off, rt, tp, pb; JAM1: cd (Bedingung); LAGE1: fc (Filter je Note)", 'H13')
# H2 Laden
s = before(s, "  if (kind !== 'drum') { const lk = lkNoteNorm(src.lk, null); if (lk) out.lk = lk; return out; }   // I2a: lk.v / lk.k auch an Synth-Noten",
           "  if (kind !== 'drum' && src.fc != null) lage1NoteNorm(src, out);   /* LAGE1: Filter je Note */", 'H2')
# H3 Wiedergabe: Cutoff je Stimme
s = before(s, "  if (!out.length && !nN && !nV) return null;\n  return {lk: out.length ? out : null, lkP: nN ? nat : null, lkv: nV ? lkv : null};",
           "  if (nt && nt.fc && lage1LkAdd(i, snd, wk, nt, out, nat)) nN++;   /* LAGE1: Filter je Note = Cutoff je Stimme */", 'H3')
# H4 Planer: Noten mit fc holen ihre Paare
s = once(s, "      const lx = (e.nt && e.nt.lk) || clip.ln ? lkNoteX(i, clip, e.nt, e.rb) : null;   // I2b: Locks / Reihen-Startwert der Note",
            "      const lx = (e.nt && (e.nt.lk || e.nt.fc)) || clip.ln ? lkNoteX(i, clip, e.nt, e.rb) : null;   // I2b: Locks / Reihen-Startwert der Note · LAGE1: + Filter je Note", 'H4')
# H5 Rolle: onRender
s = after(s, "    syl: t === MEL_T ? ns => lyNoteSyl(ns, lySylScene(s)) : null,          // G9E: Silben an den Noten",
          "    onRender: st => { if (typeof lage1RollRender === 'function') lage1RollRender(st); },   /* LAGE1: FILT-Zeile, gelbe Vorschau */", 'H5')
# H6 Rolle: Knopf + Tasten + Zeile
s = after(s, "  if (typeof mtx3bRollHook === 'function') mtx3bRollHook(t, s);   /* MTX3B: Einzelspur [SCHRITTE] statt [LAUF] */",
          "  if (typeof lage1RollHook === 'function') lage1RollHook(t, s);   /* LAGE1: [Lage ▾], Trennton per Taste, FILT-Zeile */", 'H6')
# H7–H11 MIDI: Notenbeginne sammeln
s = after(s, "        const v = clamp(Math.round(nt.v * 127), 1, 127), t0 = Math.round((off + st) * PPQ), t1 = Math.max(t0 + 1, Math.round((off + en) * PPQ));",
          "        lage1MidiNote(i, t0, nt);   /* LAGE1: CC74 je Notenbeginn */", 'H7')
s = before(s, "        dedAdd(i, ch, ded, st, en, percIs(tr) ? percGm(nt.n) : clamp(Math.round(p), 0, 127), nt.v);   // PERC",
           "        lage1MidiNote(i, Math.round(st * PPQ), nt);   /* LAGE1: CC74 je Notenbeginn */", 'H8')
s = before(s, "      add(st, Math.min(b1, st + Math.max(nt.d, 1 / 32)), clamp(Math.round(p), 0, 127), nt.v);   // INT54",
           "      lage1MidiNote(i, Math.round(st * 480), nt);   /* LAGE1: CC74 je Notenbeginn */", 'H9')
s = before(s, "        add(st, en, percIs(tr) ? percGm(nt.n) : clamp(Math.round(p), 0, 127), nt.v);\n      }\n    }\n    fllMidiAdd(song, i, ded, (i2, c2, d2, st, en, p, v) => add(st, en, p, v));",
           "        lage1MidiNote(i, Math.round(st * PPQ), nt);   /* LAGE1: CC74 je Notenbeginn */", 'H10')
s = after(s, "    const v = clamp(Math.round(nt.v * 127), 1, 127), t0 = Math.round(nt.t * PPQ), t1 = Math.max(t0 + 1, Math.round(Math.min(cL, nt.t + Math.max(nt.d, 1 / 32)) * PPQ)), k = t0 + ':' + p, x = ded.get(k);",
          "    lage1MidiNote(i, t0, nt);   /* LAGE1: CC74 je Notenbeginn */", 'H11')
# H12 MIDI: CC74 in die Spur
s = after(s, "    const tr = S.tracks[i], ev = evs[i].slice();",
          "    lage1MidiCc(i, ev);   /* LAGE1: CC74 vor jedes Note-an (nur Spuren mit Filter je Note) */", 'H12')

open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(s)
print('index.html', len(s.encode('utf-8')), hashlib.md5(s.encode('utf-8')).hexdigest())
