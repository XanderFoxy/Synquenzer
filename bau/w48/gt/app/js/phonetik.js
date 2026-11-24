// Gesangstrainer – Phonetik: Liedtext → gesungene Vokale in deutscher Schreibung („Romanisierung" fürs Singen).
// Englisch: CMU-Wörterbuch (lexikon-en.js, nur Vokalfolgen) + Ausweich-Regeln; Deutsch: Regeln aus der Schreibung.
// Alles läuft lokal und synchron, nichts wird gesendet.
import { LEXIKON_EN, LEXIKON_VOKALE } from './lexikon-en.js';

/* ---------- Tabelle ARPAbet → deutscher Gesangsvokal ----------
   Singpraxis: lange auf dem HAUPTVOKAL bleiben, der Nachlaut (gleit) kommt erst ganz am Ende des Tons.
   AY → A + i  („Ai", light = „La-it")          EY → E + i  („Ei" wie „Eh-i", wait – NICHT deutsches A)
   OW → O + u  („Ou", don't, follow)            AW → A + u  („Au", now)          OY → O + i („Oi", boy)
   IY → i lang (see)    IH → i kurz, offen (it)  EH → e offen wie „Bett" (well)   AE → ä offen, fast a (can't)
   AA → a (father) – aber o, wenn so geschrieben (follow, God: britisches offenes o)
   AH1 → a kurz (up)    AH0 → ö leicht = Schwa (the, a)    AO → o offen (all, your)
   UW → u lang (who)    UH → u kurz (good)       ER → ö, r nur andeuten (world)                       */
const EN_VOKAL = {
  AA: { vokal: 'a', gleit: '', lang: true,  hinweis: 'Offenes a, Kiefer locker' },
  AE: { vokal: 'ä', gleit: '', lang: false, hinweis: 'Offenes ä, fast schon a – Mund weit' },
  AH: { vokal: 'a', gleit: '', lang: false, hinweis: 'Kurzes, dunkles a' },
  AO: { vokal: 'o', gleit: '', lang: true,  hinweis: 'Offenes o wie in „Sonne", nicht zu u werden lassen' },
  AW: { vokal: 'a', gleit: 'u', lang: true, hinweis: 'Lange auf A bleiben, das u erst ganz am Ende' },
  AY: { vokal: 'a', gleit: 'i', lang: true, hinweis: 'Lange auf A bleiben, das i erst ganz am Ende („La-it")' },
  EH: { vokal: 'e', gleit: '', lang: false, hinweis: 'Offenes e wie in „Bett"' },
  ER: { vokal: 'ö', gleit: '', lang: true,  hinweis: 'Ö singen, das r nur andeuten' },
  EY: { vokal: 'e', gleit: 'i', lang: true, hinweis: 'Auf E halten (kein deutsches A), das i erst am Ende' },
  IH: { vokal: 'i', gleit: '', lang: false, hinweis: 'Kurzes, offenes i – leicht Richtung e' },
  IY: { vokal: 'i', gleit: '', lang: true,  hinweis: 'Langes i, Kiefer nicht zusammenbeißen' },
  OW: { vokal: 'o', gleit: 'u', lang: true, hinweis: 'Auf O halten, das u erst ganz am Ende' },
  OY: { vokal: 'o', gleit: 'i', lang: true, hinweis: 'Auf O halten, das i erst am Ende' },
  UH: { vokal: 'u', gleit: '', lang: false, hinweis: 'Kurzes u' },
  UW: { vokal: 'u', gleit: '', lang: true,  hinweis: 'Langes u, Lippen rund' },
};
const SCHWA = { vokal: 'ö', gleit: '', lang: false, schwa: true, hinweis: 'Leichtes ö (Schwa) – nicht betonen' };

/* ---------- Lexikon (wird beim ersten Gebrauch aufgebaut) ---------- */
let LEX = null;
function lexikon() {
  if (LEX) return LEX;
  LEX = new Map();
  for (const teil of LEXIKON_EN.split('|')) {
    const i = teil.indexOf(':');
    const c = teil.slice(0, i);
    for (const w of teil.slice(i + 1).split(' ')) LEX.set(w, c);
  }
  return LEX;
}
const dekodiere = (c) => [...c].map((z) => {
  const k = z.toLowerCase();
  return { ph: LEXIKON_VOKALE[k.charCodeAt(0) - 97], betont: z !== k };
});

// Britische Schreibung → amerikanisch (CMU), Endungen abtrennen.
const VARIANTEN = [
  [/is(e|es|ed|ing|er|ers|ation|ations)$/, 'iz$1'], [/ys(e|es|ed|ing)$/, 'yz$1'],
  [/our(s|ed|ing|ite|ites|able|ful)?$/, 'or$1'], [/tre(s)?$/, 'ter$1'], [/ogue$/, 'og'], [/ll(ed|ing|er|ers)$/, 'l$1'],
  [/in'$/, 'ing'], [/'s$/, ''], [/s'$/, 's'],
];
function sucheEN(w) {
  const L = lexikon();
  if (L.has(w)) return L.get(w);
  for (const [re, ers] of VARIANTEN) { const v = w.replace(re, ers); if (v !== w && L.has(v)) return L.get(v); }
  const endungen = [
    [/ies$/, ['y'], ''], [/es$/, [''], /(s|x|z|ch|sh)$/], [/s$/, [''], ''],
    [/ied$/, ['y'], ''], [/ed$/, ['', 'e'], /(t|d)$/], [/ing$/, ['', 'e'], ''], [/ly$/, ['', 'le'], ''],
    [/ness$/, [''], ''], [/less$/, [''], ''], [/ful$/, [''], ''], [/er$/, ['', 'e'], ''], [/est$/, ['', 'e'], ''],
  ];
  const zusatz = { ies: '', es: 'j', s: '', ied: '', ed: 'j', ing: 'j', ly: 'k', ness: 'c', less: 'c', ful: 'c', er: 'h', est: 'c' };
  for (const [re, ersatz, extraSilbe] of endungen) {
    if (!re.test(w)) continue;
    const end = w.match(re)[0];
    let stamm = w.slice(0, -end.length);
    const kandidaten = [];
    for (const e of ersatz) kandidaten.push(stamm + e);
    if (/([bcdfgklmnprstvz])\1$/.test(stamm)) kandidaten.push(stamm.slice(0, -1)); // stopped → stop
    for (const k of kandidaten) {
      if (k.length < 2 || !L.has(k)) continue;
      let c = L.get(k);
      if (end === 'es' || end === 'ed') { if (extraSilbe && extraSilbe.test(k)) c += zusatz[end]; }
      else c += zusatz[end] || '';
      return c;
    }
  }
  return null;
}

/* ---------- Schreibung: Vokalkerne finden ---------- */
const istV = (c) => c !== undefined && 'aeiouyäöü'.includes(c);
function kerneEN(w) {
  const v = [];
  for (let i = 0; i < w.length; i++) {
    const c = w[i];
    let ja = false;
    if ('aeiou'.includes(c)) ja = !(c === 'u' && w[i - 1] === 'q');
    else if (c === 'y') {
      const vorher = 'aeiou'.includes(w[i - 1] || '-'), nachher = 'aeiou'.includes(w[i + 1] || '-');
      ja = !((i === 0 && nachher) || (vorher && nachher));
    } else if (c === 'w') ja = i > 0 && 'aeo'.includes(w[i - 1]) && !istV(w[i + 1]);
    v.push(ja);
  }
  return gruppen(w, v);
}
function gruppen(w, v) {
  const g = [];
  for (let i = 0; i < w.length; i++) {
    if (!v[i]) continue;
    if (g.length && g[g.length - 1].b === i) { g[g.length - 1].b = i + 1; g[g.length - 1].t += w[i]; }
    else g.push({ a: i, b: i + 1, t: w[i] });
  }
  return g;
}
const DE_DOPPEL = ['ai', 'ay', 'ei', 'ey', 'au', 'eu', 'äu', 'ie', 'aa', 'ee', 'oo'];
function kerneDE(w) {
  const g = [];
  for (let i = 0; i < w.length; i++) {
    if (!istV(w[i]) || (w[i] === 'u' && w[i - 1] === 'q')) continue;
    let b = i + 1;
    if (DE_DOPPEL.includes(w.slice(i, i + 2))) b = i + 2;
    // Dehnungs-h: Vokal + h + Mitlaut/Wortende → h gehört zum (langen) Vokal
    if (w[b] === 'h' && !istV(w[b + 1])) b++;
    g.push({ a: i, b, t: w.slice(i, b) });
    i = b - 1;
  }
  return g;
}

/* ---------- Silbengrenzen ---------- */
const EINHEITEN_EN = ['ch', 'sh', 'th', 'ph', 'wh', 'ck', 'gh', 'qu'];
const EINHEITEN_DE = ['sch', 'ch', 'ck', 'ph', 'th', 'qu'];
const ANLAUT = new Set(['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr', 'kl', 'kr', 'schl', 'schr', 'schw', 'thr', 'shr']);
function einheiten(s, sprache) {
  const E = sprache === 'de' ? EINHEITEN_DE : EINHEITEN_EN;
  const out = [];
  for (let i = 0; i < s.length;) {
    const e = E.find((x) => s.startsWith(x, i)) || s[i];
    out.push(e); i += e.length;
  }
  return out;
}
// Liefert die Startpositionen der Silben (eine Silbe je Kern).
function grenzen(w, kerne, sprache, stumm) {
  const starts = [0];
  for (let k = 1; k < kerne.length; k++) {
    const von = kerne[k - 1].b, bis = kerne[k].a;
    const cl = w.slice(von, bis);
    const buchst = cl.replace(/[^a-zäöüß]/g, '');
    if (!buchst.length) { starts.push(bis); continue; }
    const u = einheiten(cl, sprache).filter((x) => /[a-zäöüß]/.test(x));
    let nimm = 1; // Einheiten, die zur nächsten Silbe gehen
    if (u.length >= 2 && ANLAUT.has(u.slice(-2).join(''))) nimm = 2;
    if (u.length === 1) nimm = 1;
    // stummes e im Zwischenraum (eve-ry): Grenze direkt vor dem letzten Mitlaut
    if (stumm && stumm.some((s) => s.a >= von && s.b <= bis)) nimm = 1;
    if (nimm > u.length) nimm = u.length;
    const laenge = u.slice(-nimm).join('').length;
    let pos = bis - laenge;
    while (pos > von && !/[a-zäöüß]/.test(w[pos - 1]) && w[pos - 1] !== "'") pos--;
    starts.push(pos);
  }
  return starts;
}

/* ---------- Englisch ---------- */
function regelnEN(w, kerne) {
  // Ausweich-Regeln für Wörter, die nicht im Lexikon stehen (Buchstabenmuster → Vokal).
  const n = kerne.length;
  const vorsilbe = /^(be|re|de|pre|con|com|a|un|dis|mis|ex|in)[^aeiouy]/.test(w) && n >= 2;
  return kerne.map((g, k) => {
    const t = g.t, nx = w.slice(g.b), betont = vorsilbe ? k === 1 : k === 0;
    const letzte = k === n - 1;
    let ph;
    if (t === 'e' && letzte && /[^aeiouy]le$/.test(w) && g.b === w.length) ph = 'AH';
    else if (t === 'i' && nx.startsWith('gh')) ph = 'AY';
    else if (t.length >= 2) {
      const d = t.slice(0, 2);
      if (['ai', 'ay', 'ei'].includes(d)) ph = 'EY';
      else if (d === 'ey') ph = letzte && n > 1 ? 'IY' : 'EY';
      else if (['ee', 'ea'].includes(d)) ph = 'IY';
      else if (d === 'ie') ph = letzte && n === 1 && !nx.replace(/s$/, '') ? 'AY' : 'IY';
      else if (d === 'oo') ph = 'UW';
      else if (d === 'ou') ph = nx.startsWith('gh') ? 'AO' : nx.startsWith('ld') ? 'UH' : 'AW';
      else if (d === 'ow') ph = 'OW';
      else if (['aw', 'au'].includes(d)) ph = 'AO';
      else if (['oa', 'oe'].includes(d)) ph = 'OW';
      else if (['oi', 'oy'].includes(d)) ph = 'OY';
      else if (['ew', 'ue', 'ui', 'eu'].includes(d)) ph = 'UW';
      else if (d === 'io' && nx.startsWith('n')) ph = 'AH';
      else if (d === 'ey' || d === 'ye') ph = 'AY';
      else ph = { a: 'AE', e: 'EH', i: 'IH', o: 'AA', u: 'AH', y: 'IH' }[t[0]];
    } else {
      const r = nx[0] === 'r' && !istV(nx[1]);
      const are = nx[0] === 'r' && nx.slice(1) === 'e';
      if (r || are) ph = { a: 'AA', o: 'AO', e: 'ER', i: 'ER', u: 'ER', y: 'ER' }[t];
      else if (!nx) ph = { a: 'AH', e: 'IY', i: 'IY', o: 'OW', u: 'UW', y: n === 1 ? 'AY' : 'IY' }[t];
      else if (betont && /^[^aeiouy](e|es|ed|[aeiouy])/.test(nx) && !/^[^aeiouy]e[^sd]/.test(nx))
        ph = { a: 'EY', e: 'IY', i: 'AY', o: 'OW', u: 'UW', y: 'AY' }[t];
      else ph = { a: 'AE', e: 'EH', i: 'IH', o: 'AA', u: 'AH', y: 'IH' }[t];
    }
    if (!betont && ['AE', 'EH', 'AA', 'AH'].includes(ph) && t.length === 1) ph = 'AH';
    return { ph, betont };
  });
}

// Bringt Schreib-Kerne und Laut-Vokale auf dieselbe Anzahl (eine Silbe je Vokal).
function abgleichen(w, kerne, vok) {
  kerne = kerne.map((g) => ({ ...g }));
  vok = vok.map((v) => ({ ...v }));
  const stumm = [];
  const weg = (i) => { stumm.push(kerne[i]); kerne.splice(i, 1); };
  while (kerne.length > vok.length) {
    const L = kerne.length - 1, g = kerne[L];
    if (g.t === 'e' && L > 0 && /^(|s|d|s'|'s)$/.test(w.slice(g.b))) { weg(L); continue; }
    const mitte = kerne.findIndex((x, i) => i > 0 && i < L && x.t === 'e' && x.a - kerne[i - 1].b >= 1 && kerne[i + 1].a - x.b >= 1);
    if (mitte > 0) { weg(mitte); continue; }
    // sonst die letzten zwei Kerne zusammenziehen
    kerne[L - 1] = { a: kerne[L - 1].a, b: g.b, t: w.slice(kerne[L - 1].a, g.b) }; kerne.splice(L, 1);
  }
  while (kerne.length < vok.length) {
    // Hiatus in einer Buchstabengruppe: „being" → be-ing trennen; „realise" (i + Schwa) → zusammen singen
    let geteilt = false;
    for (let k = 0; k < kerne.length && !geteilt; k++) {
      const g = kerne[k];
      if (g.t.length < 2) continue;
      const zweit = vok[k + 1];
      const schwa = zweit && !zweit.betont && (zweit.ph === 'AH' || zweit.ph === 'ER');
      if (schwa && k < kerne.length - 1) { vok[k].mitGleit = zweit; vok.splice(k + 1, 1); geteilt = true; }
      else { kerne.splice(k, 1, { a: g.a, b: g.a + 1, t: g.t[0] }, { a: g.a + 1, b: g.b, t: g.t.slice(1) }); geteilt = true; }
    }
    if (geteilt) continue;
    const L = vok.length - 1; vok[L - 1].mitGleit = vok[L]; vok.splice(L, 1);
  }
  return { kerne, vok, stumm };
}

function vokalEN(v, g, vorR) {
  let o;
  if (v.ph === 'AH' && !v.betont) o = { ...SCHWA };
  else if (v.ph === 'ER' && !v.betont) o = { ...SCHWA, hinweis: 'Leichtes ö, das r nur andeuten' };
  else if (v.ph === 'AA' && /o/.test(g.t) && !/a/.test(g.t)) o = { vokal: 'o', gleit: '', lang: false, hinweis: 'Offenes o (britisch) – nicht zu a werden lassen' };
  else o = { ...EN_VOKAL[v.ph] };
  if (v.mitGleit && !o.gleit) { o.gleit = 'ö'; o.hinweis += '; das ö kurz anhängen, im selben Ton'; }
  if (vorR && v.ph !== 'ER') o.hinweis += '; r nur andeuten';
  o.laut = v.ph + (v.betont ? '1' : '0');
  o.betont = v.betont;
  return o;
}

function wortEN(w) {
  const kerne = kerneEN(w);
  if (!kerne.length) return null;
  const code = sucheEN(w);
  const vok = code ? dekodiere(code) : regelnEN(w, kerne);
  if (!code) { // stumme e für die Regeln entfernen (come, eyes, hoped)
    const r = abgleichenRegel(w, kerne);
    return baue(w, r, regelnEN(w, r), 'en', 'regel', []);
  }
  const ab = abgleichen(w, kerne, vok);
  return baue(w, ab.kerne, ab.vok, 'en', 'lexikon', ab.stumm);
}
function abgleichenRegel(w, kerne) {
  const k = kerne.slice();
  const L = k.length - 1;
  if (L > 0 && k[L].t === 'e') {
    const rest = w.slice(k[L].b), vor = w.slice(k[L - 1].b, k[L].a);
    const le = !rest && /[^aeiouy]l$/.test(w.slice(0, k[L].a)) && vor.length >= 2;
    const ed = rest === 'd' && /[td]$/.test(vor);
    const es = rest === 's' && /(s|x|z|ch|sh|ge|ce)$/.test(w.slice(0, k[L].b));
    if (!le && !ed && !es && /^(|s|d)$/.test(rest)) k.splice(L, 1);
  }
  return k;
}

/* ---------- Deutsch ---------- */
const DE_KURZ = new Set(['in', 'im', 'mit', 'an', 'am', 'um', 'ab', 'ob', 'es', 'das', 'des', 'dass', 'hat', 'man', 'ich',
  'mich', 'dich', 'sich', 'nicht', 'wenn', 'denn', 'von', 'bis', 'und', 'doch', 'noch', 'ins', 'ist', 'bin', 'bist', 'was', 'weg', 'dann', 'wann']);
const DE_LANG = new Set(['was', 'weg']); // in der Praxis meist lang gesungen
function wortDE(w) {
  const kerne = kerneDE(w);
  if (!kerne.length) return null;
  const n = kerne.length;
  const vorsilbe = n >= 2 && /^(be|ge)[^aeiouäöü]/.test(w);
  const vok = kerne.map((g, k) => {
    const t = g.t, nx = w.slice(g.b);
    let o;
    const d = t.slice(0, 2);
    if (['ai', 'ay', 'ei', 'ey'].includes(d)) o = { vokal: 'a', gleit: 'i', lang: true, hinweis: 'Lange auf A, das i erst am Ende' };
    else if (d === 'eu' || d === 'äu') o = { vokal: 'o', gleit: 'i', lang: true, hinweis: 'Auf O halten, das i erst am Ende' };
    else if (d === 'au') o = { vokal: 'a', gleit: 'u', lang: true, hinweis: 'Lange auf A, das u erst am Ende' };
    else if (d === 'ie') o = { vokal: 'i', gleit: '', lang: true, hinweis: 'Langes i' };
    else {
      const v = t[0] === 'y' ? 'ü' : t[0];
      const schwa = v === 'e' && n >= 2 && (
        (k === n - 1 && /^([nrlmst]|rn|ns|rt|nd)?$/.test(nx)) || (k === 0 && vorsilbe));
      if (schwa) {
        o = { ...SCHWA };
        if (nx.startsWith('r')) o.hinweis = 'Leichtes ö, das r nur andeuten (fast a)';
      } else {
        const mitl = (nx.match(/^[^aeiouyäöü]*/)[0]);
        let lang;
        if (t.length >= 2) lang = true; // aa, ee, oo, Dehnungs-h
        else if (!mitl.length) lang = true; // offene Silbe: du, so, Le-ben
        else if (/^(ch|sch|ck|tz|ng|pf)/.test(mitl) || mitl.length >= 2 && mitl !== 'ß') lang = false;
        else lang = n === 1 ? (!DE_KURZ.has(w) || DE_LANG.has(w)) : true;
        o = { vokal: v, gleit: '', lang, hinweis: lang ? 'Langes ' + v : 'Kurzes ' + v };
      }
    }
    o.betont = vorsilbe ? k === 1 : k === 0;
    return o;
  });
  return baue(w, kerne, vok, 'de', 'regel', []);
}

/* ---------- Bausteine ---------- */
function anzeigeVon(o) {
  if (o.schwa) return 'ö' + (o.gleit || '');
  return o.vokal.toUpperCase() + (o.gleit || '');
}
function baue(w, kerne, vok, sprache, quelle, stumm) {
  const starts = grenzen(w, kerne, sprache, stumm);
  return {
    sprache, quelle,
    silben: kerne.map((g, k) => {
      const o = sprache === 'en' ? vokalEN(vok[k], g, w[g.b] === 'r' && !istV(w[g.b + 1])) : vok[k];
      return {
        a: starts[k], b: k + 1 < starts.length ? starts[k + 1] : w.length,
        vokal: o.vokal, gleit: o.gleit || '', anzeige: anzeigeVon(o), lang: !!o.lang, hinweis: o.hinweis,
        betont: !!o.betont, schwa: !!o.schwa, laut: o.laut || '',
      };
    }),
  };
}

/* ---------- Sprache erkennen (je Wort, mit Nachbarn) ---------- */
const DE_W = new Set(('der die das den dem des ein eine einen einem einer und oder aber nicht ich du er sie es wir ihr mich dich sich ' +
  'mir dir uns euch mein meine dein deine sein seine ihre unser ist bin bist sind hat habe hast haben wird werden kann kannst ' +
  'will auf aus bei mit nach von vor zu zum zur über unter für ohne durch gegen um am im ins als wie wenn dann doch noch schon nur ' +
  'auch ja nein nie immer hier wo was wer warum weil dass ob jetzt mehr sehr ganz alles nichts wach siehst licht herz liebe leben ' +
  'nacht tag zeit welt folge folgen dem mach komm geh steh sieh hör allein wieder heute morgen gestern dich deinen meinen keine kein ' +
  'nicht nichts niemand jemand etwas mal einmal warte wahrheit lügen augen himmel sterne stern feuer wasser luft erde gott ' +
  'mauer wand schatten traum träume träumen ewig frei kraft stark schwach weit nah fern tief hoch oben unten').split(' '));
const EN_W = new Set(('the you your we i me my is are was be been don\'t can\'t won\'t it that this what why who how all see know ' +
  'claim just feel there so much more to of a an and but or not no yes they them their our us he she his her its with from ' +
  'for on at by up down out about into over after before again never always now then when where here love heart light night ' +
  'eyes eye wake open wait follow believe living world sheep sake fake zombies welcome do does did need realise realize ' +
  'hypnotised hypnotized behind wall can will would could should one time way life go come take make like get got let ' +
  'oh yeah baby girl boy tonight forever'.split(' ')));
const MEHRDEUTIG = new Set(['in', 'so', 'was', 'will', 'man', 'hat', 'bin', 'an', 'also', 'die', 'war', 'see', 'oh', 'um', 'am',
  'is', 'hell', 'rock', 'kind', 'gift', 'arm', 'mist', 'bald', 'fast', 'rot', 'art', 'wo', 'her', 'den', 'du', 'wand', 'fern']);
function wortPunkte(w) {
  if (!w) return 0;
  if (/['’]/.test(w) && !/^\w+'s$/.test(w)) return 3;
  if (/[äöüß]/.test(w)) return -3;
  if (MEHRDEUTIG.has(w)) return 0;
  if (DE_W.has(w)) return -2;
  if (EN_W.has(w)) return 2;
  if (/(sch|cht|tz|pf|ung$|keit$|heit$|lich$|chen$|ig$)/.test(w) || /^(ge|be|ver|zer)[^aeiou]\w*(en|t)$/.test(w)) return -2;
  if (/(ght|tion$|th|wh|ee|oo|ing$|y$|w[aeiy])/.test(w)) return /ie|ei/.test(w) ? 1 : 2;
  return lexikon().has(w) ? 1 : -1;
}
function sprachenJeWort(woerter, vorgabe) {
  const p = woerter.map(wortPunkte);
  return p.map((s, i) => {
    if (Math.abs(s) >= 2) return s > 0 ? 'en' : 'de';
    const nachbarn = [p[i - 1], p[i + 1]].filter((x) => x !== undefined && Math.abs(x) >= 2);
    const def = vorgabe === 'de' || vorgabe === 'en' ? vorgabe : null;
    if (def) {
      if (def === 'en' && s < 0 && nachbarn.some((x) => x < 0)) return 'de';
      if (def === 'de' && s > 0 && nachbarn.some((x) => x > 0)) return 'en';
      return def;
    }
    if (s !== 0) return s > 0 ? 'en' : 'de';
    if (nachbarn.length) return nachbarn[0] > 0 ? 'en' : 'de';
    const sum = p.reduce((a, b) => a + b, 0);
    return sum < 0 ? 'de' : 'en';
  });
}

/* ---------- Öffentliche Schnittstelle ---------- */
function zerlege(text) {
  const out = [];
  const re = /[A-Za-zÀ-ÖØ-öø-ÿ'’]+/g;
  let m;
  while ((m = re.exec(String(text || '')))) {
    const roh = m[0].replace(/^['’]+|['’]+$/g, (x) => (x.length ? '' : x));
    const original = m[0].replace(/^['’]+/, '').replace(/['’]+$/, (x) => (/in$/i.test(m[0].replace(/['’]+$/, '')) ? x : ''));
    if (!/[A-Za-zÀ-ÿ]/.test(roh)) continue;
    out.push(original);
  }
  return out;
}
const norm = (w) => w.toLowerCase().replace(/’/g, "'");

/** Erkennt die Sprache einer Zeile: 'en' oder 'de'. */
export function erkenneSprache(text) {
  const w = zerlege(text).map(norm);
  if (!w.length) return 'de';
  const s = sprachenJeWort(w, null);
  const de = s.filter((x) => x === 'de').length;
  return de > s.length - de ? 'de' : 'en';
}

/** Zerlegt ein einzelnes Wort in Silben mit gesungenen Vokalen. */
export function wortZuVokalen(wort, sprache) {
  const w = norm(wort);
  const sp = sprache === 'de' || sprache === 'en' ? sprache : sprachenJeWort([w], null)[0];
  const r = sp === 'de' ? wortDE(w) : wortEN(w);
  if (!r) return { wort, sprache: sp, silben: [] };
  return {
    wort, sprache: sp, quelle: r.quelle,
    silben: r.silben.map((s) => ({
      text: wort.slice(s.a, s.b), vokal: s.vokal, gleit: s.gleit, anzeige: s.anzeige, lang: s.lang, hinweis: s.hinweis,
      betont: s.betont, schwa: s.schwa, laut: s.laut,
    })),
  };
}

/**
 * Zeile → [{wort, sprache, silben:[{text, vokal, gleit, anzeige, lang, hinweis, betont, schwa, laut}]}]
 * sprache: 'en' | 'de' | weglassen (= automatisch). Gemischte Zeilen („Don't wait, Folge dem Licht") werden je Wort erkannt.
 */
export function zeileZuVokalen(text, sprache) {
  const woerter = zerlege(text);
  const sp = sprachenJeWort(woerter.map(norm), sprache);
  return woerter.map((w, i) => wortZuVokalen(w, sp[i])).filter((x) => x.silben.length);
}

/** Kurzform zum Nachsingen: 'Ou · Ei · O · Ou · ö · Ai' */
export function vokalKette(text, sprache) {
  return zeileZuVokalen(text, sprache).flatMap((w) => w.silben.map((s) => s.anzeige)).join(' · ');
}

/**
 * Ordnet Melodie-Silben (z. B. the-wall.json zeilen[].silben) ihren Vokalen zu – auch wenn die Silbentrennung abweicht.
 * zeile = {text, sprache, silben:[{text,…}]} → [{text, vokal, gleit, anzeige, lang, hinweis, wort, gehalten}] (gleich lang wie zeile.silben)
 */
export function silbenZuVokalen(zeile) {
  const meine = [];
  let pos = 0;
  for (const w of zeileZuVokalen(zeile.text, zeile.sprache)) {
    for (const s of w.silben) {
      const n = s.text.replace(/[^\p{L}]/gu, '').length;
      meine.push({ ...s, wort: w.wort, a: pos, b: pos + n });
      pos += n;
    }
  }
  const mel = zeile.silben || [];
  if (mel.length === meine.length) return meine.map(({ a, b, ...s }) => ({ ...s, gehalten: false }));
  let p = 0, letzte = null;
  return mel.map((ms) => {
    const n = String(ms.text || '').replace(/[^\p{L}]/gu, '').length;
    const a = p, b = p + n; p = b;
    let best = null, bestU = 0;
    for (const s of meine) {
      const u = Math.min(b, s.b) - Math.max(a, s.a);
      if (u > bestU) { bestU = u; best = s; }
    }
    if (!best) {
      if (letzte) return { ...letzte, text: ms.text, gehalten: true };
      return { text: ms.text, vokal: '', gleit: '', anzeige: '', lang: false, hinweis: '', wort: '', gehalten: true };
    }
    const { a: _a, b: _b, ...rest } = best;
    letzte = { ...rest, text: ms.text, gehalten: false };
    return letzte;
  });
}

/* ---------- Übergänge ---------- */
// offen: 0 = geschlossen … 3 = ganz offen; lage: vorn/mitte/hinten; rund: Lippen gerundet
const MERKMAL = {
  i: { offen: 0, lage: 'vorn', rund: false }, ü: { offen: 0, lage: 'vorn', rund: true },
  e: { offen: 1, lage: 'vorn', rund: false }, ö: { offen: 1, lage: 'vorn', rund: true },
  ä: { offen: 2, lage: 'vorn', rund: false }, a: { offen: 3, lage: 'mitte', rund: false },
  o: { offen: 2, lage: 'hinten', rund: true }, u: { offen: 0, lage: 'hinten', rund: true },
};
const GROSS = (v) => (v === 'ö' ? 'Ö' : v.toUpperCase());
function alsSilben(vokale) {
  if (typeof vokale === 'string') {
    if (vokale.includes('·')) vokale = vokale.split('·').map((x) => x.trim()).filter(Boolean);
    else return zeileZuVokalen(vokale).flatMap((w) => w.silben.map((s) => ({ ...s, wort: w.wort })));
  }
  const out = [];
  for (const x of vokale || []) {
    if (!x) continue;
    if (typeof x === 'string') {
      const v = x[0].toLowerCase();
      out.push({ vokal: v, gleit: x.slice(1).toLowerCase(), anzeige: x, schwa: x[0] === 'ö', text: x });
    } else if (Array.isArray(x.silben)) for (const s of x.silben) out.push({ ...s, wort: s.wort || x.wort });
    else out.push(x);
  }
  return out;
}
function bewerte(von, nach) {
  const A = MERKMAL[von], B = MERKMAL[nach];
  if (!A || !B || von === nach) return null;
  const d = B.offen - A.offen;
  let schwere = 0; const art = [];
  if (Math.abs(d) >= 2) { schwere += Math.abs(d) >= 3 ? 2 : 1.5; art.push('Kiefer'); }
  if (A.lage !== B.lage && A.lage !== 'mitte' && B.lage !== 'mitte') { schwere += 1; art.push('Zunge'); }
  if (A.rund !== B.rund) { schwere += 0.5; art.push('Lippen'); }
  return { d, schwere, art };
}
function textFuer(von, nach, b, diphthong) {
  const V = GROSS(von), N = GROSS(nach);
  if (diphthong) return `${V}${nach}: lange auf ${V} bleiben, das ${nach} erst ganz am Ende kurz anhängen – nicht früh hineinrutschen.`;
  const teile = [];
  if (b.d >= 2) teile.push(`Kiefer weich nach unten fallen lassen, Zunge bleibt vorne unten liegen, Kehlkopf nicht mit nach oben ziehen`);
  else if (b.d <= -2) teile.push(`Den Raum im Mund behalten – nur ${nach === 'i' || nach === 'e' || nach === 'ü' ? 'die Zunge hebt sich' : 'die Lippen runden sich'}, der Kiefer klappt nicht zu`);
  if (b.art.includes('Zunge')) teile.push(MERKMAL[nach].lage === 'hinten' ? 'Zunge gleitet nach hinten, Lippen werden rund' : 'Lippen lösen, Zunge nach vorn – Klang vorne halten');
  else if (b.art.includes('Lippen') && !teile.length) teile.push(MERKMAL[nach].rund ? 'nur die Lippen runden, Kiefer bleibt' : 'nur die Lippen lösen, Kiefer bleibt');
  return `${V} → ${N}: ${teile.join('; ')}. Erst langsam auf einem Ton hin und her gleiten, dann im Tempo.`;
}

/**
 * Schwierige Vokal-Übergänge. vokale: Ergebnis von zeileZuVokalen, Liste von Silben, Liste von Anzeigen ('Ou','Ei',…),
 * eine vokalKette oder ein Liedtext. Liefert je Paar einen Eintrag, schwierigste zuerst:
 * [{von, nach, paar:'I → A', art:['Kiefer',…], schwere:1–3, hinweis, anzahl, beispiele:['wait → follow',…], diphthong}]
 * Mit {alle:true} als zweitem Argument stattdessen jede Stelle einzeln (mit index).
 */
export function uebergaenge(vokale, optionen = {}) {
  const s = alsSilben(vokale);
  const stellen = [];
  const add = (von, nach, i, diphthong, bsp, schwa) => {
    const b = bewerte(von, nach);
    if (!b) return;
    let schwere = b.schwere + (diphthong ? 0.5 : 0) - (schwa ? 1 : 0);
    if (diphthong && schwere < 1) schwere = 1;
    if (schwere < 1) return;
    stellen.push({
      von: GROSS(von), nach: diphthong ? nach : GROSS(nach), paar: diphthong ? `${GROSS(von)}${nach}` : `${GROSS(von)} → ${GROSS(nach)}`,
      art: diphthong ? ['Diphthong', ...b.art] : b.art, schwere: Math.max(1, Math.min(3, Math.round(schwere))),
      hinweis: textFuer(von, nach, b, diphthong), index: i, beispiel: bsp, diphthong: !!diphthong,
    });
  };
  for (let i = 0; i < s.length; i++) {
    const x = s[i];
    if (!x || !x.vokal) continue;
    if (x.gleit && x.gleit !== 'ö') add(x.vokal, x.gleit[0], i, true, x.text || x.anzeige, false);
    const y = s[i + 1];
    if (!y || !y.vokal) continue;
    const von = (x.gleit && x.gleit !== 'ö') ? x.gleit[0] : x.vokal;
    const bsp = `${x.text || x.anzeige} → ${y.text || y.anzeige}`;
    add(von, y.vokal, i, false, bsp, x.schwa || y.schwa);
  }
  if (optionen.alle) return stellen;
  const paare = new Map();
  for (const st of stellen) {
    const k = st.paar;
    if (!paare.has(k)) paare.set(k, { ...st, anzahl: 0, beispiele: [] });
    const p = paare.get(k);
    p.anzahl++;
    if (st.beispiel && p.beispiele.length < 4 && !p.beispiele.includes(st.beispiel)) p.beispiele.push(st.beispiel);
  }
  return [...paare.values()].map(({ index, beispiel, ...p }) => p)
    .sort((a, b) => b.schwere - a.schwere || b.anzahl - a.anzahl);
}
