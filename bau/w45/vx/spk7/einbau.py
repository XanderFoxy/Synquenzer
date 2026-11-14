#!/usr/bin/env python3
# SPK7: baut index.html neu aus basis.html + Block (spk7-kern.js + spk7-main.js, direkt nach „/* INT53D-END */“) + Haken „SPK7“. Jede Ersetzung genau einmal.
import sys, pathlib
here = pathlib.Path(__file__).resolve().parent
src = (here / 'basis.html').read_text(encoding='utf-8')
kern = (here / 'spk7-kern.js').read_text(encoding='utf-8')
main = (here / 'spk7-main.js').read_text(encoding='utf-8')
blatt = (here / 'spk7-blatt.js').read_text(encoding='utf-8')
out = sys.argv[1] if len(sys.argv) > 1 else str(here / 'index.html')
blk = ('/* SPK7-BEGIN ===== Klangkorn (Spektral-Pinsel-Synth), Teil 1 Kern + Teil 2 Bedienung: eine Auswahl (Pinsel/Rechteck/Harmonische) oder Ebene als Klangquelle,\n'
       '   gespielt als Körnchen-Synthese oder eingefrorene Spektral-Schleife; Tastatur links „Probeton | Klangkorn“; „Als Instrument“ = neue Spur (Audio als Take);\n'
       '   Teil 2: Knopf „Als Klangkorn“, Klangkorn-Blatt (Quellbild + Marker, Mini-Tastatur, Regler, Spurwahl), Ecke TON|KORN, leuchtende Tasten. */\n'
       + kern + main + blatt + '/* SPK7-END */\n')
H = [
 ("/* INT53D-END */\n", "/* INT53D-END */\n" + blk),
 # Spur-Stimmen: Klangkorn-Klang (p.wt.h) spielt die eigene Engine
 ("  const snd0 = o.sound || (R.v6aCur && R.v6aCur[i] && !AU.synth[i] ? v6aSnd(i) || tr.sound : tr.sound);   // V6A: native path – the state from the next note\n",
  "  const snd0 = o.sound || (R.v6aCur && R.v6aCur[i] && !AU.synth[i] ? v6aSnd(i) || tr.sound : tr.sound);   // V6A: native path – the state from the next note\n"
  "  if (typeof spk7Voice === 'function' && snd0 && snd0.p && snd0.p.wt && snd0.p.wt.h) { const v7 = spk7Voice(i, out, vel, t0, o, snd0); if (v7) return v7; }   /* SPK7: Klangkorn-Spur */\n"),
 # Klang: p.wt.h behalten
 ("    w = w && typeof w === 'object' ? w : {};\n",
  "    w = w && typeof w === 'object' ? w : {};\n"
  "    if (typeof spk7NormWt === 'function' && w.h) return spk7NormWt(w, normWt(Object.assign({}, w, {h: null})));   /* SPK7: Klangkorn (p.wt.h) */\n"),
 # Container/Aufräumen: Klangkorn-Takes gehören zum Projekt
 ("  return [...ids].filter(id => S.takes && S.takes[id]);\n",
  "  if (typeof spk7TakeIds === 'function') spk7TakeIds(ids);   /* SPK7: Klangkorn-Takes */\n  return [...ids].filter(id => S.takes && S.takes[id]);\n"),
 # Werkzeugleiste: Klangkorn ▾ (+ Tastatur-Haken)
 ("tl.appendChild(el('span', 'sep')); const bV = el('button', 'n1b', 'Ansicht ▾'); bV.dataset.a = 'view'; tl.appendChild(bV);\n",
  "tl.appendChild(el('span', 'sep')); const bV = el('button', 'n1b', 'Ansicht ▾'); bV.dataset.a = 'view'; tl.appendChild(bV);\n"
  "  if (typeof spk7Ui === 'function') spk7Ui(U, tl);   /* SPK7: Klangkorn ▾, Tastatur Probeton | Klangkorn */\n"),
 # Tastatur: im Klangkorn-Modus kein Probeton (Halten/Loslassen macht spk7Ky)
 # Knopf „Als Klangkorn“: frei/gesperrt wie die anderen Auswahl-Aktionen
 ("  if (typeof spk3LpBtn === 'function') spk3LpBtn(U);   // SPK3: ▶/■ in der Loop-Zeile\n}\nfunction spk1UndoBtns(U, r) {\n",
  "  if (typeof spk3LpBtn === 'function') spk3LpBtn(U);   // SPK3: ▶/■ in der Loop-Zeile\n  if (typeof spk7Btn === 'function') spk7Btn(U);   /* SPK7: Als Klangkorn */\n}\nfunction spk1UndoBtns(U, r) {\n"),
 ("function spk1Tone(m) {\n",
  "function spk1Tone(m) {\n  if (typeof spk7Tone === 'function' && spk7Tone(m)) return;   /* SPK7: Tastatur spielt das Klangkorn */\n"),
]
for a, b in H:
    n = src.count(a)
    if n != 1: sys.exit('Anker %dx: %r' % (n, a[:80]))
    src = src.replace(a, b)
pathlib.Path(out).write_text(src, encoding='utf-8')
print('ok', out, len(H), 'Ersetzungen')
