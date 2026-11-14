import sys
P = sys.argv[1]; B = sys.argv[2]
s = open(P, encoding='utf-8').read()
blk = open(B, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    assert n == cnt, (old[:80], n)
    s = s.replace(old, new)
assert 'KI1-BEGIN' not in s
rep('/* MTX-END */\n', '/* MTX-END */\n' + blk)
rep("  /* ---- Nachrichten ---- */\n  async function op(m, emit) {",
    "  const KI1K = typeof ki1KernMake === 'function' ? ki1KernMake({V, BT, win, magPair, Fn, NSn, TRn, uBegin, uTouch, uEnd, uAbort, stripe, tileArr, tidy, newLayer, verUp, tick, soon, get, put, del, keys, saveMeta}) : null;   // KI1: Profi-Trennung (Kern-Teil)\n  /* ---- Nachrichten ---- */\n  async function op(m, emit) {")
rep("      case 'zstop': if (d) d.zStop = true; return true;\n",
    "      case 'zstop': if (d) d.zStop = true; return true;\n      case 'kiport': case 'pstand': case 'profi': { if (!KI1K) throw new Error('Profi-Trennung fehlt'); const r = await KI1K.op(d, m, emit); return m.op === 'profi' ? Object.assign(r, info(d)) : r; }   // KI1\n")
rep("const src = vsDspMake.toString() + ';' + spk1DspMake.toString() + ';const K = spk1DspMake(vsDspMake());",
    "const src = vsDspMake.toString() + ';' + spk1DspMake.toString() + ';' + (typeof ki1KernMake === 'function' ? ki1KernMake.toString() + ';' : '') /* KI1 */ + 'const K = spk1DspMake(vsDspMake());")
rep("  U.b_zerl.textContent = U.busy === 'zerlegen' ? '■ Abbrechen' : 'Zerlegen';",
    "  U.b_zerl.textContent = U.busy === 'zerlegen' || U.busy === 'profi' /* KI1 */ ? '■ Abbrechen' : 'Zerlegen';")
rep("  if (U.busy === 'zerlegen') { spk1Call('zstop', {doc: SPK1.doc}).catch(() => {}); spk1Stat(U, 'Breche ab …'); return; }\n",
    "  if (U.busy === 'zerlegen') { spk1Call('zstop', {doc: SPK1.doc}).catch(() => {}); spk1Stat(U, 'Breche ab …'); return; }\n  if (U.busy === 'profi') { ki1Stop(); spk1Stat(U, 'Halte an …'); return; }   // KI1: ■ Abbrechen während der Profi-Trennung\n")
rep("A('zerl', 'Zerlegen', 'Ganzes Stück in Ebenen zerlegen'); A('verf', 'Verfeinern …', 'Auswahl genauer trennen');\n",
    "A('zerl', 'Zerlegen', 'Ganzes Stück in Ebenen zerlegen'); A('verf', 'Verfeinern …', 'Auswahl genauer trennen');\n  if (typeof ki1UiAdd === 'function') ki1UiAdd(U);   // KI1: „▾“ am Knopf Zerlegen (Profi-Trennung)\n")
rep("  const U = SPK1.ui; if (!SPK1.open || !U) return;\n  spk1Dd(U, null); spk1Leave(U); SPK1.open = false;",
    "  const U = SPK1.ui; if (!SPK1.open || !U) return;\n  if (typeof ki1Close === 'function') ki1Close();   // KI1: laufende Profi-Trennung anhalten (Stücke bleiben)\n  spk1Dd(U, null); spk1Leave(U); SPK1.open = false;")
open(P, 'w', encoding='utf-8').write(s)
print('ok')
