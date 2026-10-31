// G9a – Silben & Ausrichtung (DOM-frei). Ein Kern für Haupt-Faden und Worker (über toString(), wie vsMarksMake).
// Spec: spec/n8/G9.md §5 (Datenmodell), §6.1–§6.5 (Merkmale, Silben, Ausrichtung, Text-Operationen). Schnittstelle: SCHNITTSTELLE.md.
function g9Make() {
'use strict';
const VERSION = 'g9a-1';
const R6 = v => +(+v).toFixed(6);
const R2 = v => Math.round(v * 100) / 100;
const fin = v => typeof v === 'number' && v === v && v < 1e30 && v > -1e30;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// ───────────────────────── Silbentrennung (§6.2) ─────────────────────────
const ENG = {};   // lang → {hy(word) → string|null}
const LANGS = {de: 'de-x-syllable', en: 'en-us'};
// Muster-Modul direkt (Exporte hyphenate, subst, lmi, rmi, lct, mem); Wort als UTF-16 mit Null-Ende ab Byte 0, ≤ 61 Zeichen.
function sylLoad(lang, bytes) {
  try {
    const inst = new WebAssembly.Instance(new WebAssembly.Module(bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes));
    const e = inst.exports, buf = e.mem.buffer, al = String.fromCharCode(...new Uint16Array(buf, 1664, e.lct.value));
    const ws = new Uint16Array(buf, 0, 64);
    ENG[lang] = {al, hy(w) {
      if (w.length > 61) return null;
      for (const c of w.toLowerCase()) if (al.indexOf(c) < 0) return null;
      const a = []; for (let i = 0; i < w.length; i++) a.push(w.charCodeAt(i)); a.push(0); ws.set(a);
      const n = e.hyphenate(1, 1, 45);
      return n > 0 ? String.fromCharCode(...new Uint16Array(buf, 0, n)) : w;
    }};
    return true;
  } catch (err) { delete ENG[lang]; return false; }
}
function sylMode(lang) { return ENG[lang === 'en' ? 'en' : 'de'] ? 'muster' : 'einfach'; }

const VOW = {de: 'aeiouäöüyáàéèíóúâêîôû', en: 'aeiouyáàéèíóúâêîôû'};
const DIPH = {de: ['ei', 'ai', 'au', 'eu', 'äu', 'ie', 'aa', 'ee', 'oo', 'ou', 'ey', 'ay'],
  en: ['eau', 'ea', 'ee', 'oo', 'ou', 'ai', 'oa', 'ay', 'ey', 'oy', 'ie', 'ei', 'au', 'ue', 'ui', 'oe', 'uy', 'eo', 'oi']};
const EN_EXC = {every: 'ev-ery', everything: 'ev-ery-thing', everyone: 'ev-ery-one', everybody: 'ev-ery-bod-y', everywhere: 'ev-ery-where',
  everyday: 'ev-ery-day', evening: 'eve-ning', business: 'busi-ness', area: 'ar-e-a', idea: 'i-de-a', create: 'cre-ate', created: 'cre-a-ted',
  piano: 'pi-a-no', science: 'sci-ence', lion: 'li-on', violin: 'vi-o-lin', diamond: 'di-a-mond', ocean: 'o-cean', video: 'vi-de-o',
  someone: 'some-one', somewhere: 'some-where', someday: 'some-day', sometimes: 'some-times', something: 'some-thing', maybe: 'may-be'};
const CLU = {de: ['sch', 'ck', 'ch', 'ph', 'th', 'qu'], en: ['sch', 'ck', 'ch', 'ph', 'th', 'sh', 'wh', 'gh', 'qu']};
const DIG_KEEP = ['ng', 'ck', 'sh', 'th', 'ch', 'ph', 'gh', 'wh', 'x'];
const NUM = {
  de: ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn',
    'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn', 'zwanzig'],
  en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
    'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']};
const TENS = {de: {30: 'dreißig', 40: 'vierzig', 50: 'fünfzig', 60: 'sechzig', 70: 'siebzig', 80: 'achtzig', 90: 'neunzig'},
  en: {30: 'thirty', 40: 'forty', 50: 'fifty', 60: 'sixty', 70: 'seventy', 80: 'eighty', 90: 'ninety'}};
const isL = c => /[\p{L}]/u.test(c);
const isLD = c => /[\p{L}\p{N}]/u.test(c);

// Vokalkerne als [a, b) im kleingeschriebenen Wort s; cut = Muster-Grenzen (Indizes), die einen Vokal-Lauf teilen dürfen.
function nuclei(s, lang, cut) {
  const V = VOW[lang], D = DIPH[lang], n = s.length, isV = new Uint8Array(n);
  for (let i = 0; i < n; i++) isV[i] = V.indexOf(s[i]) >= 0 ? 1 : 0;
  for (let i = 1; i < n; i++) if (s[i] === 'u' && s[i - 1] === 'q') isV[i] = 0;
  if (lang === 'en') {
    for (let i = 0; i < n; i++) if (s[i] === 'y' && i + 1 < n && isV[i + 1] && (i === 0 || isV[i - 1])) isV[i] = 0;
    for (let i = 1; i + 1 < n; i++) if (s[i] === 'i' && 'tsc'.indexOf(s[i - 1]) >= 0 && 'oa'.indexOf(s[i + 1]) >= 0 && i + 2 < n && !isV[i + 2] && i > 1) isV[i] = 0;
    for (let i = 1; i + 1 < n; i++) if (s[i] === 'u' && s[i - 1] === 'g' && isV[i + 1] && 'ia'.indexOf(s[i + 1]) < 0) isV[i] = 0;
  }
  const out = [];
  for (let i = 0; i < n;) {
    if (!isV[i]) { i++; continue; }
    let j = i; while (j < n && isV[j]) j++;
    let p = i;
    while (p < j) {
      let q = p + 1;
      for (const d of D) if (s.startsWith(d, p) && p + d.length <= j) { let ok = true; for (let c = p + 1; c < p + d.length; c++) if (cut && cut.has(c)) ok = false; if (ok) { q = p + d.length; break; } }
      out.push([p, q]); p = q;
    }
    i = j;
  }
  if (lang === 'en' && out.length > 1) {
    const last = out[out.length - 1], pc = s[last[0] - 1] || '', vowelBefore = c => VOW.en.indexOf(c) >= 0 && !(c === 'y' && last[0] >= 2 && VOW.en.indexOf(s[last[0] - 2]) >= 0);
    const one = (a, b) => b - a === 1;
    const single = one(last[0], last[1]) && s[last[0]] === 'e';
    if (single && last[1] === n && pc === 'y' && out.length > 1 && out[out.length - 2][1] === last[0]) out.pop();   // bye, eye, goodbye
    else if (single && last[1] === n && !vowelBefore(pc)) {   // stummes End-e, außer -le nach Konsonant
      if (!(pc === 'l' && s[last[0] - 2] && !vowelBefore(s[last[0] - 2]))) out.pop();
    } else if (single && last[1] === n - 1 && !vowelBefore(pc)) {
      const z = s[n - 1];
      if (z === 's') { const p2 = s.slice(last[0] - 2, last[0]); if (!('sxzcg'.indexOf(pc) >= 0 || p2 === 'ch' || p2 === 'sh')) { if (!(pc === 'l' && s[last[0] - 2] && s[last[0] - 2] !== 'l' && !vowelBefore(s[last[0] - 2]))) out.pop(); } }
      else if (z === 'd') { if ('td'.indexOf(pc) < 0) { if (!(pc === 'l' && s[last[0] - 2] && s[last[0] - 2] !== 'l' && !vowelBefore(s[last[0] - 2]))) out.pop(); } }
    }
    for (let k = out.length - 2; k >= 1; k--) {   // stummes e vor -ly/-ful/-ment/-ness/-less
      const [a, b] = out[k]; if (b - a !== 1 || s[a] !== 'e' || vowelBefore(s[a - 1])) continue;
      const rest = s.slice(a + 1), pre = s.slice(0, a + 1);
      if ((!vowelBefore(s[a + 1] || 'a') && ['ly', 'ful', 'fully', 'ment', 'ments', 'ness', 'less', 'liness', 'lier', 'liest'].indexOf(rest) >= 0) ||
        (/^(some|love|care|home|lone|life|fire|hope|time|safe|space|face|grace|wise|whole|like|nice|base|name|game|bone|stone|rose|wine|moon|sun)$/.test(pre) && !vowelBefore(s[a + 1] || 'a'))) out.splice(k, 1);
    }
  }
  return out;
}
// Grenze zwischen zwei Kernen nach der Vokalkern-Regel (V-KV, Bündel bleiben zusammen)
function vkv(s, lang, e, a) {
  const C = s.slice(e, a);
  if (C.length <= 1) return e;
  for (const c of CLU[lang]) if (C.endsWith(c)) return a - c.length;
  return a - 1;
}
function splitCore(w, lang) {   // w: nur Buchstaben; → {parts, how: 'muster'|'einfach'}
  const s = w.toLowerCase();
  if (lang === 'en' && EN_EXC[s]) { const p = EN_EXC[s].split('-'); let i = 0; return {parts: p.map(x => { const r = w.slice(i, i + x.length); i += x.length; return r; }), how: 'muster'}; }
  const eng = ENG[lang]; let cut = null, how = 'einfach';
  if (eng) { const h = eng.hy(w); if (h != null) { how = 'muster'; cut = new Set(); let i = 0; for (const c of h) { if (c === '-') cut.add(i); else i++; } } }
  const N = nuclei(s, lang, cut);
  if (N.length <= 1) return {parts: [w], how};
  const bd = [];
  for (let k = 0; k + 1 < N.length; k++) {
    const e = N[k][1], a = N[k + 1][0];
    let b = -1;
    if (cut) { for (const c of cut) if (c >= e && c <= a && (b < 0 || Math.abs(c - vkv(s, lang, e, a)) < Math.abs(b - vkv(s, lang, e, a)))) b = c; }
    if (b < 0) b = vkv(s, lang, e, a);
    if (lang === 'en' && k === N.length - 2 && a === s.length - 1 && s[a] === 'e' && s[a - 1] === 'l' && a - 2 >= e && VOW.en.indexOf(s[a - 2]) < 0) b = a - 2;
    else if (lang === 'en' && b === a && a > e) {   // gesungen: Konsonant vor Vokal-Silbe hinüber (want-ed → wan-ted)
      const tail = s.slice(Math.max(e, a - 2), a);
      if (['th', 'sh', 'ch', 'ph'].indexOf(tail) >= 0 && a - 2 >= e) b = a - 2;
      else if (!DIG_KEEP.some(d => tail.endsWith(d)) && a - 1 >= e) b = a - 1;
    }
    bd.push(b);
  }
  const parts = []; let p = 0;
  for (const b of bd) { if (b > p) { parts.push(w.slice(p, b)); p = b; } }
  parts.push(w.slice(p));
  return {parts: parts.filter(Boolean), how};
}
function numWord(d, lang) {
  const n = +d; if (!(n >= 0 && n <= 99) || d.length > 2) return null;
  if (n <= 20) return NUM[lang][n];
  if (n % 10 === 0) return TENS[lang][n] || null;
  return null;
}
// → {s: [Silben], p?: Sicherheit} ; Satzzeichen bleiben am Wort
function sylX(word, lang) {
  lang = lang === 'en' ? 'en' : 'de';
  const w = String(word == null ? '' : word).replace(/[\u0000-\u001f\u007f\s]/g, '');
  if (!w) return {s: []};
  let a = 0, b = w.length; while (a < b && !isLD(w[a]) && w[a] !== '-') a++; while (b > a && !isLD(w[b - 1])) b--;
  const lead = w.slice(0, a), trail = w.slice(b); let core = w.slice(a, b);
  const wrap = (parts, p) => { if (!parts.length) return {s: [w]}; parts[0] = lead + parts[0]; parts[parts.length - 1] += trail; return p == null ? {s: parts} : {s: parts, p}; };
  if (!core) return {s: [w]};
  if (core.indexOf('-') >= 0) { const parts = core.split('-').filter(Boolean); if (parts.length > 1 || core.endsWith('-')) return wrap(parts.length ? parts : [core]); core = parts[0] || core; }
  if (/^\p{N}+$/u.test(core)) {
    const nw = numWord(core, lang);
    if (!nw) return wrap([core], 0.3);
    return wrap(splitCore(nw, lang).parts);
  }
  const apo = []; let letters = '';
  for (let i = 0; i < core.length; i++) { const c = core[i]; if (c === "'" || c === '’' || !isL(c)) apo.push([letters.length, c]); else letters += c; }
  if (!letters) return wrap([core]);
  const r = splitCore(letters, lang);
  let parts = r.parts;
  if (apo.length) {   // Apostroph/Sonderzeichen wieder einsetzen
    const out = parts.slice(); let pos = 0, pi = 0, off = 0, q = 0;
    const ends = []; for (const x of parts) { pos += x.length; ends.push(pos); }
    const res = parts.map(() => '');
    let li = 0;
    for (let k = 0; k < parts.length; k++) {
      let t = '';
      while (li < ends[k]) { while (q < apo.length && apo[q][0] === li) t += apo[q++][1]; t += letters[li]; li++; }
      if (k === parts.length - 1) while (q < apo.length) t += apo[q++][1];
      res[k] = t;
    }
    parts = res; void out; void pi; void off;
  }
  return wrap(parts, r.how === 'einfach' ? 0.5 : undefined);
}
function syl(word, lang) { return sylX(word, lang).s; }

// Text → Silben {x, w?, p?} (Zeilen → w: 2). Reine Satzzeichen hängen am vorigen Wort.
function words(text, lang) {
  const out = [], lines = String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n');
  for (const line of lines) {
    let first = true;
    for (const tok of line.split(/[ \t ]+/).filter(Boolean)) {
      if (!/[\p{L}\p{N}]/u.test(tok) && out.length) { const l = out[out.length - 1]; l.x = (l.x + tok).slice(0, 24); continue; }
      const r = sylX(tok, lang);
      r.s.forEach((x, i) => { const o = {x: x.slice(0, 24)}; if (i === 0) o.w = first ? 2 : 1; if (r.p != null) o.p = r.p; out.push(o); });
      if (r.s.length) first = false;
      if (out.length >= 4000) return out.slice(0, 4000);
    }
  }
  return out;
}

// ───────────────────────── Merkmale je Marke (§6.1) ─────────────────────────
function feat(x, sr, marks) {
  const n = x.length, hop = Math.max(1, Math.round(sr * 0.005)), nF = Math.ceil(n / hop) + 1, hw = Math.round(sr * 0.005);
  const cum = new Float64Array(n + 1); for (let i = 0; i < n; i++) { const v = fin(x[i]) ? x[i] : 0; cum[i + 1] = cum[i] + v * v; }
  const L = new Float32Array(nF);
  for (let f = 0; f < nF; f++) { const a = Math.max(0, f * hop - hw), b = Math.min(n, f * hop + hw); L[f] = b > a ? 10 * Math.log10((cum[b] - cum[a]) / (b - a) + 1e-14) : -140; }
  const val = Array.from(L).filter(v => v > -130).sort((a, b) => a - b);
  const floor = val.length ? val[Math.floor(0.03 * (val.length - 1))] : -140;
  const sil = f => L[f] < floor + 10;
  const fr = t => clamp(Math.round(t * sr / hop), 0, nF - 1);
  // Aperiodizität (YIN) und Tonhöhe je 5-ms-Rahmen, nur wo gebraucht (Cache)
  const dec = Math.max(1, Math.round(sr / 12000)), fs = sr / dec, W = Math.round(0.03 * fs), tMin = Math.max(2, Math.floor(fs / 1000)), tMax = Math.ceil(fs / 70);
  const ap = new Float32Array(nF).fill(-1), f0 = new Float32Array(nF), d = new Float64Array(tMax + 2);
  let xd = null;
  const mkXd = () => { const m = Math.floor(n / dec); xd = new Float32Array(m); const st = [0, 0];
    const w = 2 * Math.PI * (0.42 * fs / 2) / sr, cw = Math.cos(w), sw = Math.sin(w), al = sw / (2 * 0.7071), a0 = 1 + al;
    const c = [(1 - cw) / 2 / a0, (1 - cw) / a0, (1 - cw) / 2 / a0, -2 * cw / a0, (1 - al) / a0];
    let j = 0; for (let i = 0; i < n; i++) { const v = fin(x[i]) ? x[i] : 0, y = c[0] * v + st[0]; st[0] = c[1] * v - c[3] * y + st[1]; st[1] = c[2] * v - c[4] * y; if (i % dec === 0 && j < m) xd[j++] = y; } };
  const yin = f => {
    if (ap[f] >= 0) return; ap[f] = 1; f0[f] = 0;
    if (sil(f)) return;
    if (!xd) mkXd();
    const a = Math.round(f * hop / dec);   // Fenster ab dem Rahmen (vorwärts): ein Konsonant direkt nach einem Vokal gilt nicht als stimmhaft
    if (a < 0 || a + W + tMax + 1 >= xd.length) return;
    for (let tau = 1; tau <= tMax + 1; tau++) { let s = 0; for (let k = 0; k < W; k++) { const e = xd[a + k] - xd[a + k + tau]; s += e * e; } d[tau] = s; }
    let run = 0; for (let tau = 1; tau <= tMax + 1; tau++) { run += d[tau]; d[tau] = run > 0 ? d[tau] * tau / run : 1; }
    let best = -1, bv = 1e9;
    for (let tau = tMin; tau <= tMax; tau++) { if (d[tau] < 0.15) { while (tau + 1 <= tMax && d[tau + 1] < d[tau]) tau++; best = tau; bv = d[tau]; break; } if (d[tau] < bv) { bv = d[tau]; best = tau; } }
    if (best < 0) return; ap[f] = bv; f0[f] = fs / best;
  };
  const voiced = f => { yin(f); return ap[f] < 0.25; };
  const zcr = f => { const a = Math.max(1, f * hop - hw), b = Math.min(n, f * hop + hw); let z = 0; for (let i = a; i < b; i++) if ((x[i] >= 0) !== (x[i - 1] >= 0)) z++; return z * sr / Math.max(1, b - a); };
  const cents = (fa, fb) => { const v = []; for (let f = Math.max(0, fa); f <= Math.min(nF - 1, fb); f++) if (voiced(f) && f0[f] > 0) v.push(1200 * Math.log2(f0[f] / 55)); if (v.length < 3) return NaN; v.sort((p, q) => p - q); return v[v.length >> 1]; };
  let lastAct = nF - 1; while (lastAct > 0 && sil(lastAct)) lastAct--;
  const out = [];
  for (let k = 0; k < marks.length; k++) {
    const t = +marks[k].t, f = fr(t);
    let mx = -140; for (let g = f; g <= fr(t + 0.04); g++) mx = Math.max(mx, L[g]);
    let mn = 1e9; for (let g = fr(t - 0.03); g <= f; g++) mn = Math.min(mn, L[g]);
    const rise = R2(mx - mn);
    let g = f - 1; while (g >= 0 && !sil(g) && (f - g) * hop / sr < 0.015) g--;
    let run = 0; while (g >= 0 && sil(g)) { run++; g--; }
    const gap = Math.round(run * hop / sr * 1000);
    const pb = cents(fr(t - 0.03), f - 1), pa = cents(f + 1, fr(t + 0.03));
    const pj = pb === pb && pa === pa ? Math.round(Math.abs(pa - pb)) : 0;
    let vc = 0, vn = 0; for (let h = fr(t + 0.02); h <= fr(t + 0.06); h++) { vn++; if (voiced(h)) vc++; }
    let von = R6(t + 0.04); for (let h = f; h <= fr(t + 0.15); h++) if (voiced(h)) { von = R6(h * hop / sr); break; }
    let uc = 0, un = 0; for (let h = fr(t - 0.06); h <= fr(t + 0.02); h++) { un++; if (L[h] > floor + 6 && zcr(h) > 3000) uc++; }
    const dur = k + 1 < marks.length ? R6(marks[k + 1].t - t) : R6(Math.max(0.05, lastAct * hop / sr - t));
    out.push({rise, gap, pj, vo: vn && vc / vn >= 0.5 ? 1 : 0, von, uv: un ? R2(uc / un) : 0, dur, conf: fin(+marks[k].conf) ? +marks[k].conf : 0.5});
  }
  // vf: Marke ist der Vokal-Einsatz der vorigen (stimmlosen) Konsonant-Marke (Doppel-Marke „s|a“, Abgleich G9a)
  for (let k = 1; k < out.length; k++) { const p = out[k - 1], dt = +marks[k].t - +marks[k - 1].t; out[k].vf = dt <= 0.16 && !p.vo && Math.abs(+marks[k].t - p.von) <= 0.03 ? 1 : 0; }
  if (out.length) out[0].vf = 0;
  return out;
}

// ───────────────────────── Kosten (§6.3) ─────────────────────────
const C = {skip0: 0.2, skipRise: 1.5, skipGap: 2.0, skipTone: 0.8, skipVow: 0.8, merge: 1.2, mergeWord: 0.6, mergeLong: 0.5, longF: 1.7, over: 3.0, onWeak: 2.0,
  wordGap: -0.5, inWordGap: 1.0, lineGap: -1.0, lineMiss: 0.5, cons: -0.2, tauS: 0.15, edge: 0.3, tip: -0.8, tipSkip: 1.5, band: 1.5};
const F0 = {rise: 0, gap: 0, pj: 0, vo: 0, von: 0, uv: 0, dur: 0, conf: 0.5, vf: 0};
const CONS = /^(sch|st|s|t|k|p|f|z|ch|th|c)/i;
function costs(marks, feat, o) {
  const m = marks.length, K = Object.assign({}, C, o && o.cost), sk = new Float64Array(m), tip = new Uint8Array(m);
  const fe = k => (feat && feat[k]) || F0;
  const weak = k => { const f = fe(k); return f.vf || (f.pj >= 80 && f.rise < 3); };
  const dS = new Float64Array(m);   // Länge des Abschnitts bis zur nächsten Einsatz-Marke (Vokal-Folge- und reine Ton-Marken zählen mit)
  for (let k = m - 1; k >= 0; k--) { let q = k + 1; while (q < m && weak(q)) q++; dS[k] = q < m ? +marks[q].t - +marks[k].t : (fe(k).dur || 0) + (q - 1 > k ? +marks[q - 1].t - +marks[k].t : 0); }
  const durs = []; for (let k = 0; k < m; k++) if (!weak(k)) durs.push(dS[k]); durs.sort((a, b) => a - b);
  const medD = durs.length ? durs[durs.length >> 1] : 0;
  const tips = o && o.tipOn && Array.isArray(o.tips) ? o.tips : null;
  for (let k = 0; k < m; k++) {
    const f = fe(k), c = fin(f.conf) ? f.conf : 0.5;
    let s = K.skip0 + K.skipRise * c * (f.rise >= 6 && !f.vf ? 1 : 0) + K.skipGap * (f.gap >= 120 ? 1 : 0) - K.skipTone * (f.pj >= 80 && f.rise < 3 ? 1 : 0) - K.skipVow * (f.vf ? 1 : 0);
    if (tips) { const t = +marks[k].t, v = f.von || t + 0.04; if (tips.some(p => p[0] >= t - 0.04 && p[0] <= v + 0.06)) { tip[k] = 1; s += K.tipSkip; } }
    sk[k] = Math.max(0, s);
  }
  const P = new Float64Array(m + 1); for (let k = 0; k < m; k++) P[k + 1] = P[k] + sk[k];
  const place = (y, k) => {   // erste Silbe auf Marke k
    const f = fe(k); let c = 0;
    if (y.w) { if (f.gap >= 120) c += K.wordGap; } else if (f.gap >= 250) c += K.inWordGap;
    if (y.w === 2) c += f.gap >= 300 ? K.lineGap : K.lineMiss;
    if (f.uv >= 0.3 && CONS.test(y.x || '')) c += K.cons;
    if (f.vf || (f.pj >= 80 && f.rise < 3)) c += K.onWeak;   // Silbe auf Vokal-Folge- bzw. reiner Ton-Marke (Abgleich G9a)
    if (tip[k]) c += K.tip;
    return c;
  };
  const tau = (y, k) => (fin(y.tau) ? Math.min(4, Math.pow((marks[k].t - y.tau) / K.tauS, 2)) / 2 : 0);
  const merge = (y, k) => (K.merge + K.mergeWord * (y.w ? 1 : 0)) * (medD > 0 && dS[k] >= K.longF * medD ? K.mergeLong : 1);
  const skipSum = (a, b) => (b > a ? P[b] - P[a] : 0);   // Marken a … b−1
  return {K, sk, P, place, tau, merge, skipSum, slot: k => sk[k] >= 0.5};
}

// Ein Stück freier Silben S auf Marken a … b (inkl.), L = linker Anker (Marke, schon cL Silben), R = rechter Anker (Marke, exklusiv)
// → Feld der Marken-Indizes je Silbe und Zähler (1 … 3, 4 = o)
function dpSeg(S, marks, CO, L, cL, R, o) {
  const m = marks.length, n = S.length, INF = 1e18, K = CO.K;
  const a = L >= 0 ? L : 0, b = R >= 0 ? R - 1 : fin(o && o.bEnd) ? Math.min(m - 1, o.bEnd) : m - 1, open = R < 0 && fin(o && o.bEnd);
  if (!n) return {k: [], c: [], cost: 0};
  if (b < a || m === 0) { const k0 = L >= 0 ? L : R >= 0 ? R : (m ? 0 : -1); return {k: S.map(() => k0), c: S.map(() => 4), cost: n * K.over}; }
  const W = b - a + 1;
  const band = o && o.band !== false;
  const lo = new Int32Array(n), hi = new Int32Array(n);
  const prop = o && o.diag;
  for (let i = 0; i < n; i++) {
    let l = a, h = b;
    const y = S[i];
    if (band && fin(y.tau)) { while (l < b && marks[l].t < y.tau - K.band) l++; while (h > l && marks[h].t > y.tau + K.band) h--; }
    if (prop) { const c = a + Math.round(i * (W - 1) / Math.max(1, n - 1)); l = Math.max(l, c - prop); h = Math.min(h, c + prop); if (h < l) { l = Math.max(a, Math.min(b, c)); h = l; } }
    if (i === 0 && fin(o && o.k0)) { l = h = clamp(o.k0, a, b); }
    lo[i] = l; hi[i] = h;
  }
  for (let i = 1; i < n; i++) if (lo[i] < lo[i - 1]) lo[i] = lo[i - 1];
  for (let i = n - 2; i >= 0; i--) if (hi[i] > hi[i + 1]) hi[i] = hi[i + 1];
  for (let i = 0; i < n; i++) if (hi[i] < lo[i]) return band || prop ? dpSeg(S, marks, CO, L, cL, R, Object.assign({}, o, {band: false, diag: 0})) : {k: S.map(() => a), c: S.map(() => 4), cost: INF};
  const off = new Int32Array(n + 1); for (let i = 0; i < n; i++) off[i + 1] = off[i] + (hi[i] - lo[i] + 1) * 4;
  const D = new Float64Array(off[n]).fill(INF), B = new Int32Array(off[n]).fill(-1);
  const at = (i, j, c) => off[i] + (j - lo[i]) * 4 + (c - 1);
  const lead = j => (L >= 0 ? CO.skipSum(L + 1, j) : K.edge * (j - a));
  for (let j = lo[0]; j <= hi[0]; j++) {
    const y = S[0];
    if (j === L) { const c = Math.min(4, cL + 1); D[at(0, j, c)] = (c >= 4 ? K.over : CO.merge(y, j) + CO.tau(y, j)); }
    else D[at(0, j, 1)] = lead(j) + CO.place(y, j) + CO.tau(y, j);
  }
  for (let i = 1; i < n; i++) {
    const y = S[i];
    let best = INF, bj = -1, bc = 0, jp = lo[i - 1];
    for (let j = lo[i]; j <= hi[i]; j++) {
      // neue Marke: bester Vorgänger j' < j  (D − P[j'+1]), laufendes Minimum
      while (jp < j && jp <= hi[i - 1]) { for (let c = 1; c <= 4; c++) { const v = D[at(i - 1, jp, c)]; if (v < INF) { const w = v - CO.P[jp + 1]; if (w < best) { best = w; bj = jp; bc = c; } } } jp++; }
      if (j !== L && bj >= 0) { const v = best + CO.P[j] + CO.place(y, j) + CO.tau(y, j); const q = at(i, j, 1); if (v < D[q]) { D[q] = v; B[q] = bj * 4 + (bc - 1); } }
      if (j >= lo[i - 1] && j <= hi[i - 1]) for (let c = 1; c <= 4; c++) {
        const v = D[at(i - 1, j, c)]; if (!(v < INF)) continue;
        const c2 = Math.min(4, c + 1), w = v + (c2 >= 4 ? K.over : CO.merge(y, j) + CO.tau(y, j)), q = at(i, j, c2);
        if (w < D[q]) { D[q] = w; B[q] = j * 4 + (c - 1); }
      }
    }
  }
  let bv = INF, bj = -1, bc = 1;
  for (let j = lo[n - 1]; j <= hi[n - 1]; j++) for (let c = 1; c <= 4; c++) {
    const v = D[at(n - 1, j, c)]; if (!(v < INF)) continue;
    const tail = R >= 0 ? CO.skipSum(j + 1, R) : open ? 0 : K.edge * (b - j), w = v + tail;
    if (w < bv) { bv = w; bj = j; bc = c; }
  }
  const kk = new Array(n), cc = new Array(n);
  for (let i = n - 1, j = bj, c = bc; i >= 0; i--) { kk[i] = j; cc[i] = c; const p = B[at(i, j, c)]; if (i > 0) { j = p >> 2; c = (p & 3) + 1; } }
  return {k: kk, c: cc, cost: bv};
}

// Silben → Marken. syl: [{x, w?, p?, u?, t?, tau?}], marks: [{t, conf}], feat: g9Feat-Ergebnis (oder null).
// o: {k0 (erste Silbe fest auf Marke), kEnd (exklusive Grenze), tips, tipOn, cost, idx: true → {s, k}}
// Feste Silben (u: 1) sind harte Bedingung: Marke ≤ 30 ms von ihrem t; fehlt sie, bleiben sie an t („ohne Marke“).
function align(sylIn, marks, feat, o) {
  o = o || {};
  const m = marks.length, CO = costs(marks, feat, o), n = sylIn.length;
  const near = t => { let bk = -1, bd = 0.03 + 1e-9; for (let k = 0; k < m; k++) { const d = Math.abs(marks[k].t - t); if (d <= bd) { bd = d; bk = k; } } return bk; };
  const k = new Array(n).fill(-2), c = new Array(n).fill(1);
  const fixed = [];
  for (let i = 0; i < n; i++) if (sylIn[i].u && fin(sylIn[i].t)) { const q = near(sylIn[i].t); k[i] = q; fixed.push(i); }
  // feste Silben monoton halten (eine rückwärts liegende feste Marke → ohne Marke)
  let lastK = -1; for (const i of fixed) { if (k[i] >= 0 && k[i] < lastK) k[i] = -1; if (k[i] >= 0) lastK = k[i]; }
  const kEnd = fin(o.kEnd) ? Math.min(m, o.kEnd) : -1;
  const anchors = fixed.filter(i => k[i] >= 0);
  let prev = -1;
  const run = (i0, i1) => {   // freie Silben i0 … i1−1 zwischen Ankern
    if (i1 <= i0) return;
    const L = prev >= 0 ? k[prev] : -1;
    let cL = 0; if (L >= 0) for (let q = prev; q >= 0 && k[q] === L; q--) cL++;
    const nx = anchors.find(i => i >= i1);
    let R = nx != null ? k[nx] : -1;
    if (kEnd >= 0 && (R < 0 || kEnd < R)) R = kEnd;
    const opt = Object.assign({}, o);
    if (i0 !== 0 || !fin(o.k0)) delete opt.k0;
    const r = dpSeg(sylIn.slice(i0, i1), marks, CO, L, cL, R, opt);
    for (let q = 0; q < r.k.length; q++) { k[i0 + q] = r.k[q]; c[i0 + q] = r.c[q]; }
  };
  let i0 = 0;
  for (const i of anchors) { run(i0, i); prev = i; i0 = i + 1; }
  run(i0, n);
  for (let i = 0; i < n; i++) if (k[i] === -2) k[i] = -1;
  const s = pack(sylIn.map((y, i) => Object.assign({}, y, {k: k[i], o: c[i] >= 4 ? 1 : y.o && k[i] < 0 ? 1 : 0})), marks);
  return o.idx ? {s, k} : s;
}

// Arbeitsform → ly.s: t = Marken-Zeit, j/o neu gezählt (je Marke bis 3 über j, ab der 4. o), feste ohne Marke behalten t.
function pack(V, marks) {
  const out = []; let pk = -3, cnt = 0, pt = -1;
  for (const y of V) {
    const t = y.k >= 0 && marks[y.k] ? R6(marks[y.k].t) : R6(fin(y.t) ? y.t : 0);
    const s = {x: y.x, t};
    if (y.w) s.w = y.w === 2 ? 2 : 1;
    const same = y.k >= 0 ? y.k === pk : t === pt && y.k === pk;
    if (y.o) { s.o = 1; }
    else if (same) { cnt++; if (cnt <= 3) s.j = 1; else s.o = 1; }
    else { cnt = 1; }
    if (!y.o) { pk = y.k; pt = t; }
    if (fin(y.p)) s.p = R2(clamp(y.p, 0, 1));
    if (y.u) s.u = 1;
    out.push(s);
  }
  return out;
}

// ───────────────────────── Datenmodell (§5.1, §5.2) ─────────────────────────
const SRC = ['erkannt', 'getippt', 'eingefuegt', 'vs5b'];
function normLy(ly, len) {
  if (!ly || typeof ly !== 'object' || !Array.isArray(ly.s)) return null;
  const L = fin(+len) && +len > 0 ? +len : Infinity, out = [];
  let pt = -1, run = 0;
  for (const y of ly.s) {
    if (!y || typeof y !== 'object') continue;
    const x = [...String(y.x == null ? '' : y.x).replace(/[\u0000-\u001f\u007f-\u009f\s]/g, '')].slice(0, 24).join('');
    if (!x) continue;
    let t = fin(+y.t) && y.t !== null && y.t !== '' ? R6(clamp(+y.t, 0, L)) : (pt >= 0 ? pt : 0), oo = y.o === 1 || y.o === true ? 1 : 0;
    if (pt >= 0 && t < pt) { t = pt; oo = 1; }
    const s = {x, t};
    if (y.w === 1 || y.w === 2) s.w = y.w;
    if (oo) s.o = 1;
    else if ((y.j === 1 || y.j === true) && t === pt) { run++; if (run <= 3) s.j = 1; else { s.o = 1; } }
    else run = 1;
    if (fin(+y.p) && y.p !== null && y.p !== '') s.p = R2(clamp(+y.p, 0, 1));
    if (y.u === 1 || y.u === true) s.u = 1;
    if (!s.o && !s.j) run = 1;
    out.push(s); pt = t;
    if (out.length >= 4000) break;
  }
  if (!out.length) return null;
  return {v: 1, lang: ly.lang === 'en' ? 'en' : 'de', src: SRC.indexOf(ly.src) >= 0 ? ly.src : 'getippt', s: out};
}
// Klartext für das VS5b-Feld lyrics (Silben mit „-“, Wörter mit Leerzeichen, ≤ 400 Zeichen am Wortende gekürzt)
function lyText(ly) {
  if (!ly || !ly.s || !ly.s.length) return '';
  const W = []; for (const y of ly.s) { if (y.w || !W.length) W.push([y.x]); else W[W.length - 1].push(y.x); }
  let out = '';
  for (const w of W) { const t = w.join('-'); const nx = out ? out + ' ' + t : t; if (nx.length > 400) break; out = nx; }
  return out;
}
// VS5b → ly: Silbe k → Marke k (von links), überzählige o: 1 an der letzten Marke
function fromVs5b(lyrics, marks, lang) {
  const W = String(lyrics || '').trim().split(/\s+/).filter(Boolean);
  const V = [];
  for (const w of W) w.split('-').filter(Boolean).forEach((x, i) => V.push({x: x.slice(0, 24), w: i === 0 ? 1 : 0}));
  const m = marks.length;
  if (!V.length) return null;
  V.forEach((y, i) => { if (i < m) y.k = i; else { y.k = m - 1; y.o = 1; if (m === 0) { y.k = -1; y.t = 0; } } });
  return {v: 1, lang: lang === 'en' ? 'en' : 'de', src: 'vs5b', s: pack(V, marks)};
}

// ───────────────────────── Sicht / Neu-Einrasten (§5.1) ─────────────────────────
// → {V: [{x, w, p, u, k, o, nm, t}], n: {snap, re, nm}}  (k = Marke, −1 = feste Silbe ohne Marke)
function view(ly, marks, feat, o) {
  if (!ly || !ly.s) return {V: [], n: {snap: 0, re: 0, nm: 0}};
  const m = marks.length, S = ly.s, n = S.length, k = new Array(n).fill(-2), oo = new Uint8Array(n), CO = costs(marks, feat, o);
  let j = 0;
  for (let i = 0; i < n; i++) {   // Marke ≤ 30 ms vom Anker, monoton
    const t = S[i].t; while (j < m && marks[j].t < t - 0.03 - 1e-9) j++;
    let bk = -1, bd = 0.03 + 1e-9; for (let q = j; q < m && marks[q].t <= t + 0.03 + 1e-9; q++) { const d = Math.abs(marks[q].t - t); if (d < bd) { bd = d; bk = q; } }
    if (bk >= 0 && (i === 0 || k[i - 1] < 0 || bk >= k[i - 1])) k[i] = bk;
    else if (S[i].u) k[i] = -1;
  }
  let snap = 0, re = 0, nm = 0;
  for (let i = 0; i < n; i++) { if (k[i] >= 0) snap++; else if (k[i] === -1) nm++; }
  for (let i = 0; i < n;) {   // nicht feste, nicht eingerastete Stücke lokal neu ausrichten
    if (k[i] !== -2) { i++; continue; }
    let e = i; while (e < n && k[e] === -2) e++;
    let p = i - 1; while (p >= 0 && k[p] < 0) p--;
    let q = e; while (q < n && k[q] < 0) q++;
    const L = p >= 0 ? k[p] : -1; let cL = 0; if (L >= 0) for (let z = p; z >= 0 && k[z] === L; z--) cL++;
    const R = q < n ? k[q] : -1;
    const r = dpSeg(S.slice(i, e).map(y => ({x: y.x, w: y.w})), marks, CO, L, cL, R, {});
    for (let z = 0; z < r.k.length; z++) { k[i + z] = r.k[z]; if (r.c[z] >= 4) oo[i + z] = 1; }
    re += e - i; i = e;
  }
  const V = S.map((y, i) => { const v = {x: y.x, w: y.w || 0, k: k[i], t: y.t, o: y.o || oo[i] ? 1 : 0}; if (fin(y.p)) v.p = y.p; if (y.u) v.u = 1; if (k[i] < 0) v.nm = 1; return v; });
  return {V, n: {snap, re, nm}};
}

// ───────────────────────── Text-Operationen (§6.4, §6.5) ─────────────────────────
function slotsOf(V, CO, m) { const sl = []; const has = new Uint8Array(m); for (const y of V) if (y.k >= 0 && !y.o) has[y.k] = 1; for (let k = 0; k < m; k++) if (has[k] || CO.slot(k)) sl.push(k); return sl; }
function posOf(SL, k) { let lo = 0, hi = SL.length - 1; while (lo <= hi) { const h = (lo + hi) >> 1; if (SL[h] === k) return h; if (SL[h] < k) lo = h + 1; else hi = h - 1; } return lo; }
function wordAt(V, i) { let a = i; while (a > 0 && !V[a].w) a--; let b = i + 1; while (b < V.length && !V[b].w) b++; return [a, b]; }
function firstAt(V, k) { for (let i = 0; i < V.length; i++) if (V[i].k === k && !V[i].o) return i; return -1; }
// Verschieben ab Silbe i um d Plätze (Silben-Plätze, §6.1); darüber hinaus → o an der letzten Marke
function shiftFrom(V, i, d, SL, m) {
  if (i < 0 || i >= V.length || !d) return false;
  const pos = V.map(y => (y.o || y.k < 0 ? SL.length : posOf(SL, y.k)));
  if (d < 0) { for (let q = i; q < V.length; q++) if (V[q].k >= 0 && !V[q].o) { if (pos[q] + d < 0) return false; break; } }
  let floor = -1; for (let q = i - 1; q >= 0; q--) if (V[q].k >= 0) { floor = V[q].o ? SL.length : posOf(SL, V[q].k); break; }
  for (let q = i; q < V.length; q++) {
    if (V[q].k < 0 && V[q].u && !V[q].o) continue;   // feste Silbe ohne Marke bleibt
    const p = Math.max(pos[q] + d, floor); floor = p;   // nie vor die vorige Silbe: dort verschmolzen
    if (p > SL.length) { V[q].k = m - 1; V[q].o = 1; delete V[q].nm; continue; }
    if (p >= SL.length) { V[q].k = m - 1; V[q].o = 1; }
    else { V[q].k = SL[Math.max(0, p)]; V[q].o = 0; }
    delete V[q].nm;
  }
  return true;
}
function ok(V, marks, info) { return Object.assign({ok: true, s: pack(V, marks)}, info); }
function no(toast) { return {ok: false, toast}; }

// Ein Schritt am Text. ly darf null sein. op:
//  {op:'wort', k, text, lang, ins?}  tippen/ersetzen (ins: true = [+] Einfügen vor k) · {op:'loesch', k} Wort am Abschnitt k löschen
//  {op:'links'|'rechts', i} Text ab Silbe i · {op:'versch', i} nächste Silbe auf Marke von i · {op:'trenn', i} · {op:'nach', i, n} Rest ab i n Plätze rechts
//  {op:'ganz', text, lang} · {op:'neu'} [Neu ausrichten] (auch feste Silben) · {op:'mkMove', tOld, tNew} · {op:'mkDel', t} · {op:'mkAdd', t}
// → {ok, s (neue ly.s), sel? (nächster Abschnitt), hint?, merged?, missing?, toast?, lost: 0}
function apply(ly, marks, feat, op, o) {
  o = o || {};
  const m = marks.length, CO = costs(marks, feat, o), lang = (op && op.lang) || (ly && ly.lang) || 'de';
  if (op.op === 'ganz') {
    const S = words(op.text, lang); if (!S.length) return {ok: true, s: null};
    return {ok: true, s: align(S, marks, feat, o)};
  }
  if (op.op === 'mkMove') {
    if (!ly) return {ok: true, s: null};
    const s = ly.s.map(y => (Math.abs(y.t - op.tOld) < 1e-4 ? Object.assign({}, y, {t: R6(op.tNew)}) : Object.assign({}, y)));
    return {ok: true, s: reflag(s)};
  }
  if (op.op === 'mkDel') {   // marks = Marken VOR dem Löschen
    if (!ly) return {ok: true, s: null};
    let q = -1; for (let k = 0; k < m; k++) if (Math.abs(marks[k].t - op.t) < 1e-4) q = k;
    const tn = q > 0 ? marks[q - 1].t : q === 0 && m > 1 ? marks[1].t : null;
    let moved = 0;
    const s = ly.s.map(y => { if (Math.abs(y.t - op.t) < 1e-4 && tn != null) { moved++; return Object.assign({}, y, {t: R6(tn), j: 1}); } return Object.assign({}, y); });
    const r = reflag(s, true); const nO = r.filter((y, i) => y.o && !ly.s[i].o).length;
    return {ok: true, s: r, merged: moved - nO, over: nO, lost: 0};
  }
  if (op.op === 'mkAdd') return {ok: true, s: ly ? ly.s.map(y => Object.assign({}, y)) : null};
  const vw = op.op === 'neu' ? view({s: ly ? ly.s.map(y => Object.assign({}, y, {u: 0})) : []}, marks, feat, o) : view(ly ? {s: ly.s.map(y => Object.assign({}, y))} : null, marks, feat, o);
  const V = vw.V;
  if (op.op === 'neu') { const S = V.map((y, i) => Object.assign({x: y.x, w: y.w}, fin(y.p) ? {p: y.p} : {}, ly.s[i].u ? {u: 1} : {})); const r = align(S.map(y => Object.assign({}, y, {u: 0})), marks, feat, o); r.forEach((y, i) => { if (S[i].u) y.u = 1; }); return {ok: true, s: r}; }
  const SL = slotsOf(V, CO, m);
  if (op.op === 'links' || op.op === 'rechts') {
    if (!(op.i >= 0 && op.i < V.length)) return no();
    if (!shiftFrom(V, op.i, op.op === 'links' ? -1 : 1, SL, m)) return no('Weiter nach links geht es nicht.');
    return ok(V, marks, {sel: V[op.i].k});
  }
  if (op.op === 'nach') { if (!(op.i >= 0 && op.i < V.length)) return no(); for (let r = 0; r < (op.n || 1); r++) { const SL2 = slotsOf(V, CO, m); shiftFrom(V, op.i, 1, SL2, m); } return ok(V, marks, {}); }
  if (op.op === 'versch') {
    const i = op.i; if (!(i >= 0 && i + 1 < V.length) || V[i].k < 0) return no();
    if (V[i + 1].k === V[i].k && !V[i + 1].o) return no();
    const p1 = V[i + 1].o ? SL.length : posOf(SL, V[i + 1].k), p0 = posOf(SL, V[i].k), d = p1 - p0;
    V[i + 1].k = V[i].k; V[i + 1].o = 0;
    if (i + 2 < V.length) shiftFrom(V, i + 2, -Math.max(1, Math.min(1, d)), SL, m);
    return ok(V, marks, {sel: V[i].k});
  }
  if (op.op === 'trenn') {
    const i = op.i; if (!(i >= 0 && i < V.length) || V[i].k < 0) return no();
    const k = V[i].k; let a = i; while (a > 0 && V[a - 1].k === k && !V[a - 1].o) a--; let b = i; while (b + 1 < V.length && V[b + 1].k === k && !V[b + 1].o) b++;
    if (b === a) return no();
    const p = posOf(SL, k);
    if (p + 1 >= SL.length) return no('Keine freie Marke – beide Silben bleiben zusammen.');
    const nk = SL[p + 1], occ = V.some((y, q) => q > b && y.k === nk && !y.o);
    if (occ) shiftFrom(V, b + 1, 1, SL, m);
    V[b].k = nk; V[b].o = 0;
    return ok(V, marks, {sel: nk});
  }
  if (op.op === 'loesch') {
    const i = firstAt(V, op.k); if (i < 0) return no();
    const [a, b] = wordAt(V, i), word = V.slice(a, b).map(y => y.x).join('');
    if (b < V.length && !V[b].w) V[b].w = V[a].w || 1;
    V.splice(a, b - a);
    if (!V.length) return {ok: true, s: null, word};
    return ok(V, marks, {word, sel: op.k});
  }
  if (op.op === 'wort') {
    const k = clamp(op.k | 0, 0, Math.max(0, m - 1));
    const S = words(op.text, lang).map(y => Object.assign(y, {u: 1}));
    if (!S.length) return no();
    if (S[0].w === 2) S[0].w = 1;
    if (op.ins) {   // [+]: vor Abschnitt k einsetzen, gewählter und folgende rücken um n Plätze
      let SLx = SL.slice(); if (SLx.indexOf(k) < 0) { SLx.push(k); SLx.sort((x, y) => x - y); }
      let i0 = V.findIndex(y => y.k >= k && !y.o); if (i0 < 0) i0 = V.findIndex(y => y.o); if (i0 < 0) i0 = V.length;
      if (i0 < V.length) shiftFrom(V, i0, S.length, SLx, m);
      const p = posOf(SLx, k);
      S.forEach((y, q) => { if (p + q < SLx.length) { y.k = SLx[p + q]; y.o = 0; } else { y.k = m - 1; y.o = 1; } });
      V.splice(i0, 0, ...S);
      return ok(V, marks, {sel: nextSel(V, i0 + S.length - 1), word: S.map(y => y.x).join(''), n: S.length});
    }
    let i = firstAt(V, k), a = -1, b = -1, k0 = k;
    if (i >= 0) { [a, b] = wordAt(V, i); k0 = V[a].k >= 0 ? V[a].k : k; if (V[a].w === 2) S[0].w = 2; }
    // Bereich k0 … k0+8. Ersetzen: bis vor das nächste Wort; Überschreiben: bis vor die nächste feste Silbe.
    // Gibt es dort eine Grenze, sind die übrigen Abschnitte Melisma (Überspring-Kosten); sonst ist das Ende offen.
    let kE = Math.min(m, k0 + 9), closed = false;
    if (a >= 0) { if (b < V.length && V[b].k >= 0 && V[b].k <= kE) { kE = Math.max(k0 + 1, V[b].k); closed = true; } }
    else for (const y of V) if (y.u && y.k > k0 && !y.o) { if (y.k <= kE) { kE = y.k; closed = true; } break; }
    const r = dpSeg(S, marks, CO, -1, 0, closed ? kE : -1, closed ? {k0} : {k0, bEnd: kE - 1});
    S.forEach((y, q) => { y.k = r.k[q]; y.o = r.c[q] >= 4 ? 1 : 0; });
    const lastK = S[S.length - 1].k;
    let merged = 0; for (let q = 1; q < S.length; q++) if (S[q].k === S[q - 1].k && !S[q].o) merged++;
    let NV;
    if (a >= 0) NV = V.slice(0, a).concat(S, V.slice(b));
    else {
      const keep = V.filter(y => y.u || y.k < k0 || y.k > lastK);
      let ins = keep.findIndex(y => y.k >= k0 || y.o); if (ins < 0) ins = keep.length;
      NV = keep.slice(0, ins).concat(S, keep.slice(ins));
      const nx = NV[ins + S.length]; if (nx && !nx.w) nx.w = 1;
    }
    const iS = NV.indexOf(S[S.length - 1]);
    let missing = 0;
    if (a >= 0 && merged) { const kN = b < V.length ? V[b].k : m; const free = SL.filter(z => z >= k0 && z < kN).length; missing = Math.max(0, S.length - free); }
    const old = a >= 0 ? V.slice(a, b).map(y => y.x).join('') : '';
    return ok(NV, marks, {sel: nextSel(NV, iS), merged, hint: merged ? merged + 1 + ' Silben auf einer Marke' : '', missing, iNext: iS + 1, old, word: S.map(y => y.x).join('')});
  }
  return no();
}
// Abschnitt nach der letzten Silbe bzw. nächste schon beschriftete Silbe
function nextSel(V, i) { const k = V[i] ? V[i].k : -1; for (let q = i + 1; q < V.length; q++) if (V[q].k > k && !V[q].o) return Math.min(V[q].k, k + 1); return k + 1; }
// j/o nach Zeiten neu setzen (Marken-Haken)
function reflag(s, mergeMoved) {
  const out = []; let pt = -1, cnt = 0;
  for (const y0 of s) {
    const y = {x: y0.x, t: y0.t}; if (y0.w) y.w = y0.w;
    if (y0.o && !(mergeMoved && y0.j)) y.o = 1;
    else if (y.t === pt) { cnt++; if (cnt <= 3) y.j = 1; else y.o = 1; }
    else cnt = 1;
    if (fin(y0.p)) y.p = y0.p; if (y0.u) y.u = 1;
    if (!y.o) pt = y.t;
    out.push(y);
  }
  return out;
}
// Lokale Vorschau beim Tippen (§6.4): wie apply 'wort', aber nur die neue Verteilung
function preview(ly, marks, feat, k, text, lang, o) { const r = apply(ly, marks, feat, {op: 'wort', k, text, lang}, o); return r.ok ? r : null; }

return {VERSION, sylLoad, sylMode, syl, sylX, words, nuclei, feat, align, costs, dpSeg, pack, normLy, lyText, fromVs5b, view, apply, preview,
  slotsOf, reflag, C};
}
if (typeof module !== 'undefined' && module.exports) module.exports = {g9Make};
