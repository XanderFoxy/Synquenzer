import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read(); n0 = len(s)
def rep(a, b, cnt=1):
    global s
    c = s.count(a)
    assert c == cnt, (c, a[:80])
    s = s.replace(a, b)
# 1) noch aktuell nur nach abgeschlossenem Satz (S.ok)
rep("&& F.sig === sig && S.chunks.filter(Boolean).length >= nC && !S.chunks.some(c => c && c.ap)) {   /* FOK3: Näherung → nicht fertig */",
    "&& F.sig === sig && S.ok === sig && S.chunks.filter(Boolean).length >= nC && !S.chunks.some(c => c && c.ap)) {   /* FOK3: Näherung → nicht fertig; FOK3-P: nur ein abgeschlossener Satz (S.ok) gilt als aktuell */")
# 2) zweiter Durchgang: jedes Stück höchstens einmal ablösen, Sicherung ohne Ablösen, keine feste Grenze 40
rep("    F.gn = seq; fokus1Stat(U, 'Fokus · genauer · ' + Math.round(100 * F.ex() / nC) + ' %');",
    "    F.gn = seq; F.rpX = new Set(); F.noRp = false; fokus1Stat(U, 'Fokus · genauer · ' + Math.round(100 * F.ex() / nC) + ' %');   /* FOK3-P: rpX = schon einmal abgelöste Stücke */")
rep("      for (let guard = 0; guard < 40; guard++) {\n        const L = order(); if (!L.length) break; F.gL = L; F.gk = L[0]; F.rp = false; F.tRp = performance.now();",
    "      for (let guard = 0; guard <= 2 * nC + 8; guard++) {   /* FOK3-P: jedes Stück wird höchstens einmal abgelöst → spätestens nach nC + 1 Durchgängen fertig; ab nC + 2 ohne Ablösen */\n        const L = order(); if (!L.length) break; F.gL = L; F.gk = L[0]; F.rp = false; F.tRp = performance.now(); F.noRp = guard >= nC + 2;")
rep("    } finally { if (F.gn === seq) { F.gn = 0; F.gk = -1; F.gL = null; F.rp = false; } }",
    "    } finally { if (F.gn === seq) { F.gn = 0; F.gk = -1; F.gL = null; F.rp = false; F.noRp = false; } }")
# 3) nie „fertig“, solange eine Näherung steht
rep("  F.run = false; if (seq !== F.seq) return;\n  if (stop === 'geaendert')",
    "  F.run = false; if (seq !== F.seq) return;\n  if (!stop && S.chunks.some(c => c && c.ap) && (F.rl = (F.rl || 0) + 1) <= 2) { F.sig = ''; clearTimeout(F.tm); F.tm = setTimeout(() => { F.tm = 0; fokus1Load(U); }, 150); return; }   /* FOK3-P: Näherung steht noch → nicht fertig melden, neu laden (höchstens 2× hintereinander) */\n  if (stop === 'geaendert')")
rep("  F.st = S.st = {eO, eR, nAus, key, ms: 0}; fokus1Done(U); spk1Dirty(U, 'g');\n}",
    "  F.st = S.st = {eO, eR, nAus, key, ms: 0}; S.ok = sig; F.rl = 0; fokus1Done(U); spk1Dirty(U, 'g');   /* FOK3-P: S.ok = abgeschlossener Stand */\n}")
# 4) fokus1Pre: nicht ablösen, wenn Sicherung aktiv oder das Stück schon einmal abgelöst wurde
rep("    if (F.gn && F.gn === F.seq && F.gL && !F.rp && performance.now() - F.tRp > 250) {",
    "    if (F.gn && F.gn === F.seq && F.gL && !F.rp && !F.noRp && performance.now() - F.tRp > 250) {")
rep("      if (cur >= 0 && (cur < a || cur > b)) for (let k = a; k <= b; k++) if (S.chunks[k] && S.chunks[k].ap) { F.rp = true; spk1Call('fokusStop', {doc: SPK1.doc}).catch(() => {}); break; }",
    "      if (cur >= 0 && (cur < a || cur > b) && !(F.rpX && F.rpX.has(cur))) for (let k = a; k <= b; k++) if (S.chunks[k] && S.chunks[k].ap) { F.rp = true; F.rpX && F.rpX.add(cur); spk1Call('fokusStop', {doc: SPK1.doc}).catch(() => {}); break; }   /* FOK3-P: jedes Stück höchstens einmal ablösen (sonst bei schnellem Hin-und-Her kein Fortschritt) */")
# 5) Test-Zugang: Zahl der Ablösungen
rep("gn: !!F.gn && F.gn === F.seq, gk: F.gk == null ? -1 : F.gk}; },   /* FOK3: ap, gn, gk */",
    "gn: !!F.gn && F.gn === F.seq, gk: F.gk == null ? -1 : F.gk, rpn: F.rpX ? F.rpX.size : 0, ok: !!S && S.ok === F.sig}; },   /* FOK3: ap, gn, gk; FOK3-P: rpn, ok */")
open(p, 'w', encoding='utf-8').write(s); print('ok', n0, len(s))
