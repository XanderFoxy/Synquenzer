// Atem – Plan (rein, ohne DOM): Plan aus Technik bauen, CO2/O2-Tabellen, zustandBei (KONZEPT §3.4, §4.1, §4.2).
export const WORT = { ein: 'Einatmen', ein2: 'Nachfüllen', halten_voll: 'Halten', aus: 'Ausatmen', halten_leer: 'Leer halten', stoss_aus: 'Stoß', ruhe: 'Normal atmen' };
const WEG_WORT = { summen: 'Summen', sss: 'Auf sss', fff: 'Auf fff', brr: 'Lippen flattern', strohhalm: 'In den Halm', vokal: 'Auf a', ha: 'Ha' };
const GESANG_AUS = new Set(['sss', 'fff', 'summen', 'vokal', 'brr', 'strohhalm']);
const ART_ANAT = { bauch: 'bauch', flanken: 'flanke', brust: 'brust', 'bauch+brust': 'gemischt', singen_gestuetzt: 'stuetze', staccato: 'staccato' };
export const anatArt = (b) => ART_ANAT[b] || 'bauch';
export const round5 = (x) => Math.round(x / 5) * 5;

export function wortFuer(art, weg) {
  if (art === 'aus' || art === 'stoss_aus') { if (WEG_WORT[weg]) return WEG_WORT[weg]; if (weg === 'rechts') return 'Rechts aus'; if (weg === 'links') return 'Links aus'; }
  if (art === 'ein') { if (weg === 'links') return 'Links ein'; if (weg === 'rechts') return 'Rechts ein'; }
  return WORT[art] || art;
}

// ---- Tabellen (§3.4) ----
export function tabelle(typ, stufe, pb, letzte_halten_s) {
  const r = [];
  if (typ === 'co2') {
    // Stufe 2: nur mehr Runden (eine Größe je Schritt)
    let halten = Math.min(round5(0.4 * pb), 120);
    if (letzte_halten_s > 0) halten = Math.min(halten, Math.max(5, Math.floor(letzte_halten_s * 1.1 / 5) * 5));
    const n = stufe >= 2 ? 8 : 6, minus = 10, unten = 60;
    for (let i = 0; i < n; i++) r.push({ halten_s: halten, pause_s: Math.max(unten, 120 - i * minus) });
  } else {
    const a = 0.4 * pb, b = (stufe >= 2 ? 0.8 : 0.65) * pb;
    for (let i = 0; i < 8; i++) {
      let h = Math.min(round5(a + (b - a) * i / 7), 180);
      if (letzte_halten_s > 0 && i === 7) h = Math.min(h, Math.max(5, Math.floor(letzte_halten_s * 1.1 / 5) * 5));
      r.push({ halten_s: h, pause_s: 120 });
    }
  }
  return r;
}

// ---- Bausteine ----
function sMs(p, laengen, id) {
  if (p.s == null) return null;
  if (typeof p.s === 'object') { const w = laengen && laengen[id] != null ? laengen[id] : p.s.min; return Math.round(Math.min(p.s.max, Math.max(p.s.min, w)) * 1000); }
  return Math.round(p.s * 1000);
}
function schritt(p, ms, T, extra) {
  const bewegung = p.bewegung || (extra && extra.bewegung) || T.bewegung;
  return {
    art: p.art, ms, weg: p.weg || 'nase', ton: p.ton || 'keiner', hinweis: p.hinweis || '', bewegung, art_anat: anatArt(bewegung), tiefe: T.tiefe ?? 0.6,
    zug: 0, zuege: 0, runde: 0, runden: 0, abschnitt: 'uebung', wort: wortFuer(p.art, p.weg), kuerzbar: !!p.kuerzbar, ziel: p.ziel, max_ms: p.max_s ? p.max_s * 1000 : undefined, ...extra
  };
}
function zyklusSchritte(phasen, T, laengen, extra) {
  const out = [];
  for (const p of phasen) {
    const ms = sMs(p, laengen, T.id);
    if (p.wdh > 1) {
      for (let k = 0; k < p.wdh; k++) {
        out.push(schritt(p, ms, T, extra));
        if (p.pause_s && k < p.wdh - 1) out.push(schritt({ art: 'halten_leer', weg: p.weg }, Math.round(p.pause_s * 1000), T, extra));
      }
    } else out.push(schritt(p, ms, T, extra));
  }
  return out;
}
const zyklusMs = (phasen, T, laengen) => zyklusSchritte(phasen, T, laengen).reduce((a, s) => a + (s.ms || 0), 0);
const ruhe = (ms, T, extra) => schritt({ art: 'ruhe', weg: 'nase' }, ms, T, { abschnitt: 'ruhe', wort: 'Normal atmen', ...extra });

// ---- Plan bauen ----
// 0.1.4: Werte aus dem Link (#uebung/x?d=&z=&r=) nur innerhalb der Grenzen der Übung – wie −/+ und die Stufen-Knöpfe
export function grenzen(T, o = {}) {
  const zahl = (v) => { const n = Math.round(+v); return Number.isFinite(n) && n > 0 ? n : null; }, klemme = (n, g) => n == null ? null : Math.min(g.max, Math.max(g.min, n));
  return { dauer_min: klemme(zahl(o.d), T.dauer || { min: 1, max: 20 }), zyklen: klemme(zahl(o.z), T.zyklen || { min: 1, max: 8 }), runden: T.ablauf && T.ablauf.runden ? klemme(zahl(o.r), { min: 1, max: T.ablauf.runden }) : null };
}
export function baue(T, opt = {}) {
  if (!T) throw new Error('Technik fehlt');
  const v = opt.variante && T.varianten ? T.varianten.find((x) => x.id === opt.variante) : null;
  const phasen = (v && v.phasen) || T.phasen;
  const laengen = opt.laengen || {};
  let s = [];
  let ring = 'zyklus', zuege = 0, runden = 0;
  if (T.modus === 'tabelle') {
    const typ = T.ablauf.typ, st = opt.stufe || T.ablauf.stufe || 1;
    const tab = tabelle(typ, st, opt.bestwert_s || 60, opt.letzte_halten_s);
    runden = tab.length;
    tab.forEach((r, i) => {
      const ex = { runde: i + 1, runden };
      s.push(...pauseSchritte(r.pause_s * 1000, T, ex));
      s.push(schritt({ art: 'halten_voll', weg: 'nase', kuerzbar: true, hinweis: 'Halten · locker bleiben' }, r.halten_s * 1000, T, { ...ex, abschnitt: 'halten' }));
    });
    s.push(schritt({ art: 'aus', weg: 'mund' }, 4000, T, { abschnitt: 'erholung', runde: runden, runden }));
    for (let k = 0; k < 2; k++) s.push(...erholZug(T, { runde: runden, runden }));
    ring = 'stoppuhr';
    var tab_ = tab;
  } else if (T.modus === 'runden') {
    const a = T.ablauf;
    runden = Math.min(a.runden, Math.max(1, Math.round(opt.runden) || a.runden));   // nie mehr Runden als vorgesehen (0.1.4)
    const nz = opt.variante === 'einstieg' && a.einstieg_zuege ? a.einstieg_zuege : a.zuege;
    zuege = nz;
    for (let r = 1; r <= runden; r++) {
      for (let z = 1; z <= nz; z++) s.push(...zyklusSchritte(phasen, T, laengen, { zug: z, zuege: nz, runde: r, runden }));
      for (const d of a.danach || []) {
        const st = schritt(d, Math.round(d.s * 1000), T, { runde: r, runden, abschnitt: d.art.startsWith('halten') ? 'halten' : 'uebung' });
        if (d.art === 'halten_leer' && opt.halten_s) st.ms = Math.min(d.max_s || 30, opt.halten_s) * 1000;
        s.push(st);
      }
      if (r < runden && a.ruhe_s) s.push(ruhe(a.ruhe_s * 1000, T, { runde: r, runden }));
    }
    ring = zyklusMs(phasen, T, laengen) < 4000 ? 'runde' : 'zyklus';
  } else if (T.modus === 'messen') {
    s = zyklusSchritte(phasen, T, laengen, { abschnitt: 'messen' });
    ring = 'stoppuhr';
  } else {
    const zms = zyklusMs(phasen, T, laengen);
    let n;
    if (opt.zyklen) n = opt.zyklen;
    else if (opt.dauer_min) n = Math.max(1, Math.round(opt.dauer_min * 60000 / zms));
    else if (v && v.dauer) n = Math.max(1, Math.round(v.dauer * 60000 / zms));
    else if (T.zyklen) n = T.zyklen.standard;
    else n = Math.max(1, Math.round((T.dauer ? T.dauer.standard : 5) * 60000 / zms));
    zuege = n * (T.zyklus_wdh || 1);
    for (let z = 1; z <= n; z++) s.push(...zyklusSchritte(phasen, T, laengen, { zug: z, zuege: n, bewegung: v && v.bewegung }));
  }
  return fertig({ id: T.id + (v ? ':' + v.id : ''), name: T.name, technik: T.id, variante: v ? v.id : null, risiko: T.risiko, modus: T.modus, schritte: s, zuege, runden, ring, tabelle: tab_ || null });
}
function erholZug(T, ex) {
  return [schritt({ art: 'ein', weg: 'nase' }, 3000, T, { ...ex, abschnitt: 'erholung', wort: 'Erholung' }), schritt({ art: 'halten_voll', weg: 'nase' }, 1000, T, { ...ex, abschnitt: 'erholung', wort: 'Erholung' }), schritt({ art: 'aus', weg: 'nase' }, 4000, T, { ...ex, abschnitt: 'erholung', wort: 'Erholung' })];
}
function pauseSchritte(ms, T, ex) {
  const out = [];
  for (let k = 0; k < 3; k++) out.push(...erholZug(T, ex));
  let rest = ms - 24000 - 3000;
  if (rest < 0) { const f = (ms - 3000) / 24000; for (const st of out) st.ms = Math.round(st.ms * f); rest = 0; const d = ms - 3000 - out.reduce((a, b) => a + b.ms, 0); out[out.length - 1].ms += d; }
  const n = Math.floor(rest / 11000);
  if (n > 0 && Math.abs(rest / n / 11000 - 1) <= 0.1) {
    const c = rest / n; let summe = 0;
    for (let k = 0; k < n; k++) {
      const e = Math.round(c * 4.5 / 11), a = k === n - 1 ? rest - summe - e : Math.round(c) - e;
      out.push(schritt({ art: 'ein', weg: 'nase' }, e, T, { ...ex, abschnitt: 'pause' }), schritt({ art: 'aus', weg: 'nase' }, a, T, { ...ex, abschnitt: 'pause' }));
      summe += e + a;
    }
  } else {
    for (let k = 0; k < n; k++) out.push(schritt({ art: 'ein', weg: 'nase' }, 4500, T, { ...ex, abschnitt: 'pause' }), schritt({ art: 'aus', weg: 'nase' }, 6500, T, { ...ex, abschnitt: 'pause' }));
    const r = rest - n * 11000;
    if (r > 0) out.push(ruhe(r, T, { ...ex, abschnitt: 'pause' }));
  }
  out.push(schritt({ art: 'ein', weg: 'nase', hinweis: 'Einmal normal tief einatmen' }, 3000, T, { ...ex, abschnitt: 'pause' }));
  return out;
}

// Programme: Pläne aneinanderhängen, je 3 s Wechsel (§3.4)
export function baueProgramm(P, TECH) {
  const s = [];
  P.schritte.forEach((x, i) => {
    const T = TECH[x.uebung];
    if (i > 0) s.push({ ...ruhe(3000, T, { abschnitt: 'wechsel' }), wort: T.name });
    const zms = zyklusMs(T.phasen, T, {});
    // 0.1.5: nie mehr Zyklen am Stück als die Übung erlaubt (ihre Grenzen und Sicherheitstexte gelten auch im Programm).
    // Feste Zahl (min = max) genau einmal; sonst bis 25 % drüber kürzen, darüber in Blöcke ≤ max mit 15 s „Normal atmen“ dazwischen.
    const z = T.zyklen, max = z ? z.max : Infinity;
    let n = Math.max(1, Math.round(x.min * 60000 / zms));
    const bl = z && z.min === z.max ? 1 : n <= max * 1.25 ? 1 : Math.ceil(n / max);
    if (bl === 1) n = Math.min(n, max); else n = Math.max(bl, Math.round((x.min * 60000 - (bl - 1) * 15000) / zms));   // Pausen zählen zur Zeit
    for (let b = 0; b < bl; b++) {
      if (b) s.push({ ...ruhe(15000, T), hinweis: 'Kurz normal atmen', uebung: T.id, uebung_name: T.name, teil: i });
      const p = baue(T, { zyklen: Math.round(n * (b + 1) / bl) - Math.round(n * b / bl) });
      s.push(...p.schritte.map((st) => ({ ...st, uebung: T.id, uebung_name: T.name, teil: i })));
    }
  });
  return fertig({ id: 'programm:' + P.id, name: P.name, technik: 'programm', risiko: 'niedrig', modus: 'programm', schritte: s, zuege: 0, runden: 0, ring: 'zyklus' });
}

// v-Ziele, Kurven, Präfixsummen
function fertig(plan) {
  const s = plan.schritte;
  let v = 0;
  for (let i = 0; i < s.length; i++) {
    const st = s[i], nx = s[i + 1];
    st.va = v;
    let vz;
    if (st.ziel != null) vz = st.ziel;
    else if (st.art === 'ein') vz = nx && nx.art === 'ein2' ? 0.75 : 1;
    else if (st.art === 'ein2') vz = 1;
    else if (st.art === 'aus') vz = /ganz ausatmen/.test(st.hinweis) ? -0.6 : st.weg === 'sss' && plan.modus !== 'messen' && st.bewegung === 'singen_gestuetzt' ? -0.4 : 0;
    else if (st.art === 'stoss_aus') vz = v;   // Stoß: Ausschlag um −0,25, danach zurück
    else if (st.art === 'ruhe') vz = 0.3;
    else vz = v;
    if (plan.technik === 'kraft' && st.abschnitt === 'uebung' && st.zug > 0) vz = st.art === 'ein' ? 0.9 : 0.25;
    if (plan.technik === 'wach' && st.zug > 0) vz = st.art === 'ein' ? 0.3 : 0;
    st.vz = vz;
    st.kurve = st.art === 'stoss_aus' ? 'stoss' : st.art.startsWith('halten') ? 'halten' : st.art === 'ruhe' ? 'sanft'
      : st.art === 'aus' && GESANG_AUS.has(st.weg) ? 'linear' : st.art === 'aus' && st.ms != null && st.ms < 2000 ? 'passiv' : 'sanft';
    v = vz;
  }
  plan.start = new Float64Array(s.length + 1);
  let t = 0, offenAb = -1;
  for (let i = 0; i < s.length; i++) { plan.start[i] = t; if (s[i].ms == null) { if (offenAb < 0) offenAb = i; } else t += s[i].ms; }
  plan.start[s.length] = t;
  plan.gesamt_ms = t;
  plan.offen = offenAb >= 0;
  plan.offenAb = offenAb;
  return plan;
}
export function neuSummen(plan) {   // nach kuerze()/offenem Schritt
  let t = 0, offenAb = -1;
  for (let i = 0; i < plan.schritte.length; i++) { plan.start[i] = t; const m = plan.schritte[i].ms; if (m == null) { if (offenAb < 0) offenAb = i; } else t += m; }
  plan.start[plan.schritte.length] = t; plan.gesamt_ms = t; plan.offenAb = offenAb; plan.offen = offenAb >= 0;
}

export function kurveK(st, p) {
  switch (st.kurve) {
    case 'linear': return p;
    case 'passiv': { const T = (st.ms || 1000) / 1000; return (1 - Math.exp(-p * T / 0.8)) / (1 - Math.exp(-T / 0.8)); }
    case 'halten': return 0;
    default: return 0.5 - 0.5 * Math.cos(Math.PI * p);
  }
}
export function vBei(st, p) {
  if (st.kurve === 'stoss') {
    const t = p * (st.ms || 150) / 1000;   // hin 0,12 s, zurück 0,25 s
    const d = t < 0.12 ? 1 - Math.pow(1 - t / 0.12, 2) : t < 0.37 ? 1 - (0.5 - 0.5 * Math.cos(Math.PI * (t - 0.12) / 0.25)) : 0;
    return st.va - 0.25 * d;
  }
  return st.va + (st.vz - st.va) * kurveK(st, p);
}

// Binäre Suche: letzter Schritt i mit start[i] <= ms
export function zustandBei(plan, ms) {
  const s = plan.schritte, n = s.length, st0 = plan.start;
  if (ms < 0) ms = 0;
  if (plan.offenAb >= 0 && ms >= st0[plan.offenAb]) {
    const i = plan.offenAb, sch = s[i];
    return { i, schritt: sch, p: 0, rest_ms: null, sekunde: null, v: sch.va, zug: sch.zug, runde: sch.runde, gesamt_rest_ms: null, fertig: false, offen_ms: ms - st0[i] };
  }
  if (ms >= plan.gesamt_ms) { const sch = s[n - 1]; return { i: n - 1, schritt: sch, p: 1, rest_ms: 0, sekunde: 0, v: sch.vz, zug: sch.zug, runde: sch.runde, gesamt_rest_ms: 0, fertig: true }; }
  let lo = 0, hi = n - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (st0[m] <= ms) lo = m; else hi = m - 1; }
  while (lo < n - 1 && s[lo].ms === 0) lo++;
  const sch = s[lo], dauer = sch.ms, dt = ms - st0[lo];
  const p = dauer > 0 ? Math.min(1, dt / dauer) : 1, rest = dauer - dt;
  return { i: lo, schritt: sch, p, rest_ms: rest, sekunde: Math.ceil(rest / 1000), v: vBei(sch, p), zug: sch.zug, runde: sch.runde, gesamt_rest_ms: plan.gesamt_ms - ms, fertig: false };
}
