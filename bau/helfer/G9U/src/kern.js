/* ===== G9 (Nachtrag 8, Paket G9): Block sq-g9-src – Text-Modus im Marken-Editor (G9c) und die Haupt-Faden-Teile von G9a ===== */

/* ---------- PLATZHALTER-KERN – wird ersetzt durch Zweig g9-br-S (G9a: g9Syl, g9Feat, g9Align, g9View) ----------
   Schnittstelle laut spec/n8/G9.md §6.1–§6.3, §5.1 und §7.12. Diese einfache Fassung:
   - g9Syl: nur die Vokalkern-Regel aus §6.2 (ohne Silben-Muster), automatisch getrennte Wörter bekommen p 0,5 („vereinfacht“);
   - g9Feat: keine Signal-Merkmale, nur aus den Marken (Pause vor der Marke aus dem Wort-Merker `word`, Länge des Abschnitts);
   - g9Align: die DP aus §6.3 mit den Kosten, die ohne Signal-Merkmale gehen (Überspringen, Verschmelzen, Wort-/Zeilenanfang,
     Wort-Zeiten als Anker, feste Silben, Rand, Überzahl);
   - Sicht (§5.1): Marke ≤ 30 ms → dort; sonst nicht feste Silben zwischen den Nachbarn neu ausrichten; feste ohne Marke gestrichelt.
   Beim Zusammenführen ersetzt der Kern aus g9-br-S genau dieses Objekt G9K (gleiche Namen, gleiche Rückgaben). */
const G9K = (() => {
  const VOW = 'aeiouäöüàáâèéêëìíîïòóôùúû';
  const DI = {de: ['ei', 'ai', 'au', 'eu', 'äu', 'ie', 'ey', 'ay', 'aa', 'ee', 'oo'], en: ['ea', 'ee', 'oo', 'ou', 'ai', 'oa', 'ay', 'ey', 'oy', 'oi', 'au', 'aw', 'ie', 'ei', 'ue']};
  const UNITS = ['sch', 'ch', 'ck', 'ph', 'th', 'sh'];
  const isV = (s, i) => { const c = s[i]; if (!c) return false; if (VOW.includes(c)) return !(c === 'u' && s[i - 1] === 'q'); return c === 'y' && i > 0 && !VOW.includes(s[i + 1] || ''); };
  // Sprache raten (Auto): Umlaute/ß oder häufige deutsche Wörter → de, häufige englische → en
  function guess(text) {
    const t = ' ' + String(text || '').toLowerCase().replace(/[^a-zäöüß']+/g, ' ') + ' ';
    if (/[äöüß]/.test(t)) return 'de';
    const de = (t.match(/ (der|die|das|und|ich|nicht|ist|ein|eine|du|wir|mein|dein|mit|auf|sich|zu|im|es|sch\w*) /g) || []).length;
    const en = (t.match(/ (the|and|you|i|is|it|my|your|me|love|we|to|of|in|on|be|with|that|this|don't|i'm) /g) || []).length;
    return en > de ? 'en' : 'de';
  }
  // Silben eines Worts (Bindestriche des Nutzers haben Vorrang); Satzzeichen bleiben am Wort
  function syl(word, lang) {
    word = String(word == null ? '' : word).replace(/\s+/g, '');
    if (!word) return [];
    if (word.includes('-')) { const p = word.split('-').filter(Boolean); return p.length ? p : [word]; }
    const m = /^([^\p{L}\p{N}]*)([\s\S]*?)([^\p{L}\p{N}]*)$/u.exec(word), pre = m[1], core = m[2], post = m[3];
    if (!core || /\d/.test(core)) return [word];
    const s = core.toLowerCase(), L = lang === 'en' ? 'en' : 'de', di = DI[L], nu = [];
    for (let i = 0; i < s.length;) {
      if (!isV(s, i)) { i++; continue; }
      let j = i; while (j < s.length && isV(s, j)) j++;
      for (let k = i; k < j;) {
        const two = s.slice(k, k + 2);
        const pre2 = L === 'de' && k === 2 && /^(ge|be)$/.test(s.slice(0, 2)) && s[k] === 'e' && s[k - 1] === 'e';   // ge-ehrt, be-ehrt
        if (k + 1 < j && di.includes(two) && !pre2 && !(L === 'de' && two === 'ee' && k === 1 && /^[gb]/.test(s))) { nu.push([k, k + 2]); k += 2; } else { nu.push([k, k + 1]); k++; }
      }
      i = j;
    }
    if (L === 'en' && nu.length > 1) {                                    // stummes End-e, -ed, -es
      const n = s.length, last = nu[nu.length - 1], c1 = s[last[0] - 1] || '';
      if (last[0] === n - 1 && s[n - 1] === 'e' && !VOW.includes(c1) && !(c1 === 'l' && !VOW.includes(s[n - 3] || 'a'))) nu.pop();
      else if (last[0] === n - 2 && last[1] === n - 1 && s[n - 2] === 'e' && s[n - 1] === 'd' && !'td'.includes(c1)) nu.pop();
      else if (last[0] === n - 2 && last[1] === n - 1 && s[n - 2] === 'e' && s[n - 1] === 's' && !'sxz'.includes(c1) && !/(ch|sh|ge|ce)$/.test(s.slice(0, n - 1))) nu.pop();
    }
    if (nu.length < 2) return [word];
    const cuts = [];
    for (let k = 1; k < nu.length; k++) {
      const b1 = nu[k - 1][1], a2 = nu[k][0], C = s.slice(b1, a2);
      if (!C) { cuts.push(a2); continue; }
      const u = []; for (let i = 0; i < C.length;) { const d = UNITS.find(x => C.startsWith(x, i)); if (d) { u.push(d); i += d.length; } else { u.push(C[i]); i++; } }
      let cut = a2 - u[u.length - 1].length;
      if (L === 'en' && u.length >= 2 && u[u.length - 1] === 'l' && k === nu.length - 1 && a2 === s.length - 1 && s[a2] === 'e') cut -= u[u.length - 2].length;   // lit-tle
      cuts.push(Math.max(b1, cut));
    }
    const parts = []; let a = 0; for (const c of cuts) { parts.push(core.slice(a, c)); a = c; } parts.push(core.slice(a));
    parts[0] = pre + parts[0]; parts[parts.length - 1] += post;
    return parts.filter(Boolean);
  }
  const auto = (word) => !String(word).includes('-');                 // automatisch getrennt (für p 0,5)
  // Merkmale je Marke ohne Signal (Platzhalter für §6.1): rise angenommen, gap aus `word` (≥ 120 ms Stille; als Zeilen-Pause 300 ms)
  function feat(marks, len) {
    return marks.map((k, i) => ({rise: 6, gap: k.word ? 300 : 0, pj: 0, vo: 1, von: k.t + .04, uv: 0, dur: Math.max(.001, (i + 1 < marks.length ? marks[i + 1].t : len) - k.t), conf: isNum(k.conf) ? k.conf : 1}));
  }
  const skipC = (f) => Math.max(0, .2 + 1.5 * f.conf * (f.rise >= 6 ? 1 : 0) + 2 * (f.gap >= 120 ? 1 : 0) - .8 * (f.pj >= 80 && f.rise < 3 ? 1 : 0));
  const CONS = /^(sch|st|s|t|k|p|f|z|ch|th)/i;
  // §6.3: syl = [{x, w?, u?, t?}], marks = [{t, conf}], feat (oder null), o = {tau: [τ je Silbe], len}
  // → [{k (Marke), o (überzählig)}] je Silbe
  function align(sy, marks, ft, o = {}) {
    const n = sy.length, m = marks.length, out = sy.map(() => ({k: -1, o: true}));
    if (!n || !m) return out;
    const F = ft || feat(marks, o.len != null ? o.len : marks[m - 1].t + .5);
    const sk = F.map(skipC), Sp = new Float64Array(m + 1); for (let j = 0; j < m; j++) Sp[j + 1] = Sp[j] + sk[j];
    const durs = F.map(f => f.dur).sort((a, b) => a - b), med = durs[durs.length >> 1] || 1;
    const fixK = sy.map(q => { if (q.u !== 1 || !isNum(q.t)) return -1; let b = -1, bd = .03 + 1e-9; marks.forEach((k, j) => { const d = Math.abs(k.t - q.t); if (d <= bd) { bd = d; b = j; } }); return b; });
    const start = (i, j) => {
      const q = sy[i], f = F[j]; let c = 0;
      if (fixK[i] >= 0 && fixK[i] !== j) return Infinity;
      if (q.w === 2) c += f.gap >= 300 ? -1 : .5; else if (q.w === 1 || i === 0) { if (f.gap >= 120) c -= .5; } else if (f.gap >= 250) c += 1;
      if (CONS.test(q.x) && f.uv > 0) c -= .2;
      if (o.tau && isNum(o.tau[i])) c += Math.min(4, ((marks[j].t - o.tau[i]) / .15) ** 2) / 2;
      return c;
    };
    const mergeC = (i, j) => (fixK[i] >= 0 && fixK[i] !== j ? Infinity : (1.2 + .6 * (sy[i].w ? 1 : 0)) * (F[j].dur >= 1.7 * med ? .5 : 1));
    const R = 3, INF = Infinity, D = new Float64Array(n * m * R).fill(INF), B = new Int32Array(n * m * R).fill(-1);
    const ix = (i, j, r) => (i * m + j) * R + r;
    for (let j = 0; j < m; j++) D[ix(0, j, 0)] = .301 * j + start(0, j);   // Gleichstand: lieber früh beginnen
    for (let i = 1; i < n; i++) {
      let best = INF, bj = -1, br = 0;
      for (let j = 0; j < m; j++) {
        // weiter: von (i-1, j' < j) über die übersprungenen Marken j'+1 … j-1
        if (best < INF) { const c = best + Sp[j] + start(i, j); if (c < D[ix(i, j, 0)]) { D[ix(i, j, 0)] = c; B[ix(i, j, 0)] = bj * R + br; } }
        for (let r = 1; r < R; r++) { const p = D[ix(i - 1, j, r - 1)]; if (p < INF) { const c = p + mergeC(i, j); if (c < D[ix(i, j, r)]) { D[ix(i, j, r)] = c; B[ix(i, j, r)] = j * R + r - 1; } } }
        for (let r = 0; r < R; r++) { const v = D[ix(i - 1, j, r)] - Sp[j + 1]; if (v < best) { best = v; bj = j; br = r; } }
      }
    }
    // Ende: letzte Silbe auf j (Rest-Marken frei, 0,3 je Marke) oder Silbe i auf der letzten Marke und der Rest überzählig (3,0 je Silbe)
    let bc = INF, bi = -1, bjr = -1;
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) for (let r = 0; r < R; r++) {
      const v = D[ix(i, j, r)]; if (v === INF) continue;
      const c = i === n - 1 ? v + .3 * (m - 1 - j) : j === m - 1 ? v + 3 * (n - 1 - i) : INF;
      if (c < bc) { bc = c; bi = i; bjr = j * R + r; }
    }
    if (bi < 0) return out;
    for (let i = bi + 1; i < n; i++) out[i] = {k: m - 1, o: true};
    for (let i = bi, cur = bjr; i >= 0 && cur >= 0; i--) { const j = Math.floor(cur / R); out[i] = {k: j, o: false}; cur = B[ix(i, j, cur % R)]; }
    return out;
  }
  // §5.1 Sicht: je Silbe die Marke (k) oder -1 (feste Silbe ohne Marke: gestrichelt an t)
  function view(s, marks) {
    const m = marks.length, r = s.map(q => ({k: -1, o: !!q.o, nm: false}));
    if (!m) { r.forEach((v, i) => { v.nm = s[i].u === 1; v.o = s[i].u !== 1; }); return r; }
    const near = t => { let lo = 0, hi = m - 1; while (lo < hi) { const md = (lo + hi) >> 1; if (marks[md].t < t) lo = md + 1; else hi = md; } let b = lo; if (lo > 0 && Math.abs(marks[lo - 1].t - t) <= Math.abs(marks[lo].t - t)) b = lo - 1; return Math.abs(marks[b].t - t) <= .03 + 1e-9 ? b : -1; };
    s.forEach((q, i) => { r[i].k = near(q.t); });
    let lastK = -1;
    for (let i = 0; i < s.length;) {
      if (r[i].k >= 0 && r[i].k >= lastK) { lastK = r[i].k; i++; continue; }
      if (s[i].u === 1) { r[i].k = -1; r[i].nm = true; i++; continue; }
      let e = i; while (e < s.length && !(r[e].k >= 0 && r[e].k >= lastK) && s[e].u !== 1) e++;
      const nextK = e < s.length && r[e].k >= 0 ? r[e].k : m;
      const lo = Math.max(0, lastK + 1), sub = marks.slice(lo, Math.max(lo, nextK));
      const part = s.slice(i, e).map(q => ({x: q.x, w: q.w}));
      const a = sub.length ? align(part, sub, null, {}) : part.map(() => ({k: -1, o: true}));
      for (let q = i; q < e; q++) {
        const v = a[q - i];
        if (v.k >= 0) { r[q].k = lo + v.k; r[q].o = v.o || !!s[q].o; } else { r[q].k = Math.max(0, lastK >= 0 ? lastK : 0); r[q].o = true; }
        lastK = Math.max(lastK, r[q].k);
      }
      i = e;
    }
    return r;
  }
  return {syl, auto, feat, skipC, align, view, guess, PH: true};
})();
