import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
def rep(a, b, cnt=1):
    global s
    c = s.count(a); assert c == cnt, (c, a[:90]); s = s.replace(a, b)
# Kern: vorab 2 = unsichtbarer Teil → teure Stücke nicht nähern, nur melden (skip); genau im zweiten Durchgang
rep("    let eO = 0, eR = 0, n = 0, neu = 0, stop = '', vb = false, est = null;",
    "    let eO = 0, eR = 0, n = 0, neu = 0, stop = '', vb = false, est = null; const sk = [];   /* FOK3-P: sk = übersprungene Stücke (vorab 2) */")
rep("      else {\n        const W = Math.min(1024, I.cols - ci * 1024), have = await X.get('audio', 'spk:' + d.meta.id + ':v' + N + ':' + ci);   // Original nur lesen",
    "      else if (vb && m.vorab === 2 && est.pp[ci - from] > 40) { sk.push(ci); emit({qid: m.qid, prog: (ii + 1) / Math.max(1, nI), stufe: 'Fokus'}); continue; }   /* FOK3-P: unsichtbar und teuer → nicht nähern, die Anzeige holt es im zweiten Durchgang genau */\n      else {\n        const W = Math.min(1024, I.cols - ci * 1024), have = await X.get('audio', 'spk:' + d.meta.id + ':v' + N + ':' + ci);   // Original nur lesen")
rep("vorab: vb ? 1 : 0, est: est ? {", "vorab: vb ? 1 : 0, skip: sk, est: est ? {")
# Anzeige
rep("  const seq = ++F.seq; F.sig = sig;\n",
    "  const seq = ++F.seq; F.sig = sig; const SK = F.sk = new Set();   /* FOK3-P: Stücke, die noch genau kommen (unsichtbar, nicht genähert) */\n")
rep("          if (seq !== F.seq || F.set !== S) return;\n          const old = S.chunks[c.k];",
    "          if (seq !== F.seq || F.set !== S) return;\n          if (!c.ap) SK.delete(c.k);   /* FOK3-P */\n          const old = S.chunks[c.k];")
rep("  F.ex = () => S.chunks.filter(c => c && !c.ap).length;   /* FOK3: Zahl genauer Stücke (Status) */",
    "  const pend = k => !!(S.chunks[k] && S.chunks[k].ap) || SK.has(k);   /* FOK3-P: noch nicht genau (genähert oder übersprungen) */\n  F.ex = () => { let x = 0; for (let k = 0; k < nC; k++) if (S.chunks[k] && !pend(k)) x++; return x; };   /* FOK3: Zahl genauer Stücke (Status) */")
rep("    for (const [from, to] of parts) {\n      const r = await spk1Call('fokus', Object.assign({from, to}, o), null, {chunk: onChunk});\n      if (seq !== F.seq) return;\n      eO += r.eO || 0;",
    "    for (let pi = 0; pi < parts.length; pi++) { const [from, to] = parts[pi];\n      const r = await spk1Call('fokus', Object.assign({from, to}, o, pi && o.vorab ? {vorab: 2} : null), null, {chunk: onChunk});   /* FOK3-P: nur der sichtbare Teil wird genähert */\n      if (seq !== F.seq) return; if (r.skip) for (const k of r.skip) SK.add(k);\n      eO += r.eO || 0;")
rep("  if (!stop && seq === F.seq && S.chunks.some(c => c && c.ap)) {",
    "  if (!stop && seq === F.seq && (S.chunks.some(c => c && c.ap) || SK.size)) {")
rep("for (let k = 0; k < nC; k++) { const c = S.chunks[k]; if (c && c.ap) L.push(",
    "for (let k = 0; k < nC; k++) { if (pend(k)) L.push(")
rep("  if (!stop && S.chunks.some(c => c && c.ap) && (F.rl = (F.rl || 0) + 1) <= 2) {",
    "  if (!stop && (S.chunks.some(c => c && c.ap) || SK.size) && (F.rl = (F.rl || 0) + 1) <= 2) {")
# fokus1Pre: übersprungene wie genäherte behandeln
rep("      let cur = -1; for (const k of F.gL) if (S.chunks[k] && S.chunks[k].ap) { cur = k; break; }",
    "      const pd = k => !!(S.chunks[k] && S.chunks[k].ap) || !!(F.sk && F.sk.has(k));   /* FOK3-P: genähert oder übersprungen */\n      let cur = -1; for (const k of F.gL) if (pd(k)) { cur = k; break; }")
rep("for (let k = a; k <= b; k++) if (S.chunks[k] && S.chunks[k].ap) { F.rp = true;",
    "for (let k = a; k <= b; k++) if (pd(k)) { F.rp = true;")
rep("rpn: F.rpX ? F.rpX.size : 0, ok: !!S && S.ok === F.sig}; },",
    "rpn: F.rpX ? F.rpX.size : 0, ok: !!S && S.ok === F.sig, sk: F.sk ? F.sk.size : 0}; },")
open(p, 'w', encoding='utf-8').write(s); print('ok')
