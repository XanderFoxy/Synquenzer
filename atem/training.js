// Atem – Training-Logik (rein, getestet; KONZEPT §13, §6.3). Kein DOM, kein Speicher: alles kommt als Argument.
import { tabelle as planTabelle } from './plan.js';

export const ANHALTEN = new Set(['B-CO2', 'B-O2', 'M-PB']);
const pad = (n) => String(n).padStart(2, '0');
export const tag = (d) => { d = new Date(d); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
export const tagNr = (s) => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 864e5); };
const ausNr = (n) => { const d = new Date(n * 864e5); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); };
const plusTage = (s, k) => ausNr(tagNr(s) + k);
const tagVon = (iso) => tag(new Date(iso));
export const naechsteMitternacht = (datum) => { const d = new Date(datum); d.setHours(24, 0, 0, 0); return d.toISOString(); };

export function neuesTraining(datum, { ausschluss = false, geraet = false } = {}) {
  const t = tag(datum), nr = tagNr(t), wd = (new Date(datum).getDay() + 6) % 7;
  return { start: t, anker: t, ausschluss, geraet, stufen: { 'B-AUS': 1, 'B-CO2': 1, 'B-O2': 1 }, wiederholt: [], fertig: null, mued_am: null, montag: ausNr(nr - wd) };
}
export function woche(training, datum) {
  const d = tagNr(tag(datum)) - tagNr(training.anker);
  return Math.min(8, Math.max(1, 1 + Math.floor(d / 7)));
}
const wochenStart = (training, w) => plusTage(training.anker, 7 * (w - 1));
const zahlen = (txt) => (String(txt).match(/\d+(?:,\d+)?/g) || []).map((x) => +x.replace(',', '.'));
function minuten(txt, fallback) { const m = String(txt).match(/(\d+)(?:\s*[–-]\s*(\d+))?\s*min/); return m ? [+m[1], +(m[2] || m[1])] : [fallback, fallback]; }

// Einträge des Trainings (aus dem Protokoll)
const tEintraege = (protokoll) => (protokoll || []).filter((e) => e.quelle === 'training' || e.baustein);
const istAbbruch = (e) => e.zeichen === true || e.ende === 'abbruch';

// 7+ Tage ohne Einheit → zwei Wochen früher (§13.2); liefert ggf. ein neues Training
export function pruefeLuecke(training, protokoll, datum) {
  const heute = tag(datum), es = tEintraege(protokoll);
  if (!es.length) return training;
  const letzter = es.reduce((a, e) => (e.t > a ? e.t : a), '');
  const luecke = tagNr(heute) - tagNr(tagVon(letzter));
  if (luecke < 8 || training.luecke_geprueft === heute) return training;
  const w = woche(training, plusTage(tagVon(letzter), 0));
  const wNeu = Math.max(1, w - 2);
  return { ...training, anker: plusTage(heute, -7 * (wNeu - 1)), luecke_geprueft: heute };
}

export function heute({ training, protokoll = [], messwerte = {}, sicherheit = {}, einst = {}, datum = new Date(), TRAINING }) {
  if (!training || !training.start) return null;
  training = pruefeLuecke(training, protokoll, datum);
  const heuteS = tag(datum), nr = tagNr(heuteS);
  const tageSeitAnker = nr - tagNr(training.anker);
  const w = woche(training, datum);
  const prog = TRAINING.programm[w - 1];
  const wStart = wochenStart(training, w), wNr = tagNr(wStart);
  const tagInWoche = Math.min(6, Math.max(0, nr - wNr));
  const es = tEintraege(protokoll);
  const dieseWoche = es.filter((e) => { const n = tagNr(tagVon(e.t)); return n >= wNr && n < wNr + 7; });
  const heuteE = es.filter((e) => tagVon(e.t) === heuteS);
  const zaehl = (b, liste = dieseWoche) => liste.filter((e) => e.baustein === b && e.ende !== 'unterbrochen').length;
  const anhaltTag = (s) => es.some((e) => ANHALTEN.has(e.baustein) && tagVon(e.t) === s) || (messwerte['M-PB'] || []).some((m) => tagVon(m.t) === s);
  const tageAktiv = new Set(dieseWoche.map((e) => tagVon(e.t)));
  const anhaltTageWoche = [...new Set([...dieseWoche.filter((e) => ANHALTEN.has(e.baustein)).map((e) => tagVon(e.t)), ...(messwerte['M-PB'] || []).filter((m) => { const n = tagNr(tagVon(m.t)); return n >= wNr && n < wNr + 7; }).map((m) => tagVon(m.t))])];
  const r = { woche: w, stufe_name: prog.stufe, ruhetag: false, einheiten: [], messen: [], hinweise: [], gesperrt: [], training, fertig: tageSeitAnker >= 56, tag_in_woche: tagInWoche, wochen_start: wStart };
  const mued = training.mued_am === heuteS;
  const jetzt = new Date(datum).getTime();
  const sperre = sicherheit.sperre_bis && new Date(sicherheit.sperre_bis).getTime() > jetzt;
  const nachKraft = sicherheit.kraft_zuletzt && jetzt - new Date(sicherheit.kraft_zuletzt).getTime() < 2 * 3600e3;
  const erledigt = (b) => heuteE.some((e) => e.baustein === b && e.ende === 'fertig');
  const add = (o) => r.einheiten.push({ pflicht: true, ...o, erledigt: erledigt(o.baustein) });

  // täglich
  for (const txt of prog.taeglich) {
    if (/^Resonanz/.test(txt)) { const [a, b] = minuten(txt, 10); add({ baustein: 'B-RES', technik: 'resonanz', variante: 'training_45_65', dauer_min: tagInWoche <= 3 ? a : b }); }
    else if (/^Ausatem-Verlängerung/.test(txt)) {
      const [lo, hi] = w === 1 ? [1, 1] : w === 2 ? [2, 2] : w === 3 ? [2, 3] : [3, 3];
      const n = Math.min(hi, Math.max(lo, training.stufen['B-AUS'] || 1));
      add({ baustein: 'B-AUS', technik: 'lang_aus', variante: 'stufe' + n, dauer_min: minuten(txt.replace(/\(\d\/\d\)/, ''), 3)[0], stufe: n });
    } else if (/^Zwerchfell/.test(txt)) add({ baustein: 'B-ZWF', technik: 'bauch', dauer_min: minuten(txt, 3)[0] });
    else if (/^Summen/.test(txt)) add({ baustein: 'B-SUMM', technik: 'summen', dauer_min: minuten(txt, 2)[0] });
  }
  // Zusatz
  const zus = (w === 7 ? TRAINING.programm[5].zusatz : prog.zusatz).join(' · ');
  const bestwert = (messwerte['M-PB'] || []).slice().sort((a, b) => (a.t < b.t ? 1 : -1))[0];
  const pbAlter = bestwert ? nr - tagNr(tagVon(bestwert.t)) : Infinity;
  let anhaltOk = !training.ausschluss && !sperre && !nachKraft && !mued;
  const gestern = plusTage(heuteS, -1);
  if (w <= 4 && anhaltTag(gestern)) { anhaltOk = false; r.hinweise.push('Heute keine Anhalte-Übung (gestern war eine).'); }
  if (w >= 5 && anhaltTageWoche.length >= 3 && !anhaltTageWoche.includes(heuteS)) { anhaltOk = false; r.hinweise.push('Diese Woche schon 3 Anhalte-Tage.'); }
  if (tageAktiv.size >= 6 && !tageAktiv.has(heuteS)) { r.ruhetag = true; anhaltOk = false; }
  const co2Ziel = /CO2-Tabelle/.test(zus) ? (w === 8 ? 1 : Math.max(...zahlen((zus.match(/(\d)(?:[–-](\d))?× pro Woche/) || ['2'])[0]))) : 0;
  const co2Zahl = zaehl('B-CO2');
  const co2Heute = zaehl('B-CO2', heuteE) > 0, o2Heute = zaehl('B-O2', heuteE) > 0, pbHeute = (messwerte['M-PB'] || []).some((m) => tagVon(m.t) === heuteS);
  if (co2Ziel && co2Zahl >= co2Ziel && !co2Heute) { r.ruhetag = true; }
  const brauchtPB = (co2Ziel || /O2-Tabelle/.test(zus)) && !training.ausschluss;
  if (brauchtPB && pbAlter > 14) {
    r.gesperrt.push({ technik: 'co2_tabelle', grund: bestwert ? 'Bestwert älter als 14 Tage' : 'Noch kein Bestwert' });
    r.hinweise.push('Erst Bestwert messen' + (bestwert ? ' (älter als 14 Tage).' : '.'));
  }
  let co2Angebot = false;
  if (co2Ziel && anhaltOk && pbAlter <= 14 && (co2Zahl < co2Ziel || co2Heute) && !o2Heute && !pbHeute) {
    const st = Math.min(training.stufen['B-CO2'] || 1, w >= 4 ? 2 : 1);
    const letzte = es.filter((e) => e.baustein === 'B-CO2' && e.tabelle).slice(-1)[0];
    const lh = letzte ? Math.max(...letzte.tabelle.map((x) => x.halten_s)) : 0;
    add({ baustein: 'B-CO2', technik: 'co2_tabelle', stufe: st, bestwert_s: bestwert.s, letzte_halten_s: lh, dauer_min: Math.round(planTabelle('co2', st, bestwert.s, lh).reduce((a, x) => a + x.halten_s + x.pause_s, 0) / 60) });
    co2Angebot = true;
  }
  const o2Erlaubt = /O2-Tabelle/.test(zus) && w !== 8;
  if (o2Erlaubt && anhaltOk && pbAlter <= 14 && !co2Angebot && !co2Heute && zaehl('B-O2') === 0 || o2Heute) {
    const pbZuNah = bestwert && (jetzt - new Date(bestwert.t).getTime()) < 48 * 3600e3;
    if (!pbZuNah || o2Heute) { const st = Math.min(training.stufen['B-O2'] || 1, w >= 6 ? 2 : 1); add({ baustein: 'B-O2', technik: 'o2_tabelle', stufe: st, bestwert_s: bestwert && bestwert.s, pflicht: false, dauer_min: 16 }); }
  }
  if (/weniger atmen (\d)×/.test(zus) && zaehl('B-WENIGER') < 3 && !mued) add({ baustein: 'B-WENIGER', technik: 'weniger', dauer_min: 3, pflicht: false });
  if (training.geraet && w >= 1 && !mued) add({ baustein: 'B-IMT', technik: 'imt', pflicht: false, dauer_min: 6 });

  // Messen
  const mw = (id) => (messwerte[id] || []);
  const inWoche = (id) => mw(id).some((m) => { const n = tagNr(tagVon(m.t)); return n >= wNr && n < wNr + 7; });
  if (!inWoche('M-KP')) r.messen.push({ id: 'M-KP', faellig: true, grund: 'Einmal pro Woche' });
  if ([1, 4, 8].includes(w)) { if (!inWoche('M-AF')) r.messen.push({ id: 'M-AF', faellig: true, grund: 'Woche ' + w }); if (!inWoche('M-AUS')) r.messen.push({ id: 'M-AUS', faellig: true, grund: 'Woche ' + w }); }
  const pbFaellig = !training.ausschluss && (([1, 3, 5, 8].includes(w) && !inWoche('M-PB')) || (brauchtPB && pbAlter > 14)) && pbAlter >= 7 && !co2Heute && !o2Heute;
  if (pbFaellig) r.messen.push({ id: 'M-PB', faellig: true, grund: pbAlter > 14 && brauchtPB ? 'Basis für die Tabellen' : 'Woche ' + w });

  // Sperren und Sonderfälle
  if (training.ausschluss) { r.gesperrt.push({ technik: 'co2_tabelle', grund: 'Laut deiner Angabe nicht für dich' }, { technik: 'o2_tabelle', grund: 'Laut deiner Angabe nicht für dich' }, { technik: 'bestwert', grund: 'Laut deiner Angabe nicht für dich' }); }
  if (sperre) { r.hinweise.push('Für heute keine Anhalte- oder Schnellatem-Übungen mehr.'); r.messen = r.messen.filter((m) => m.id !== 'M-PB'); r.gesperrt.push({ technik: 'bestwert', grund: 'Sperre bis Mitternacht' }); }
  if (nachKraft) { r.messen = r.messen.filter((m) => m.id !== 'M-KP' && m.id !== 'M-PB'); r.gesperrt.push({ technik: 'kontrollpause', grund: 'Nicht direkt nach Kraftatmung messen.' }, { technik: 'bestwert', grund: 'Nicht direkt nach Kraftatmung messen.' }, { technik: 'co2_tabelle', grund: 'Nicht direkt nach Kraftatmung.' }); }
  if (mued) { r.einheiten = r.einheiten.filter((e) => e.baustein === 'B-RES'); r.messen = r.messen.filter((m) => m.id === 'M-KP'); r.hinweise.push('Heute nur Resonanz-Atmung.'); }
  if (r.ruhetag) { r.einheiten = r.einheiten.filter((e) => !ANHALTEN.has(e.baustein)); r.hinweise.push('Heute Ruhetag für Anhalte-Übungen.'); }
  if (tageAktiv.size >= 6 && !tageAktiv.has(heuteS)) r.einheiten = r.einheiten.filter((e) => e.baustein === 'B-RES');
  if (new Date(datum).getHours() >= 21 && r.einheiten.some((e) => ANHALTEN.has(e.baustein))) r.hinweise.push('Anhalte-Übungen machen wach – lieber nicht kurz vor dem Schlafen.');
  return r;
}

// Steigen und Zurückstufen (§13.3)
export function nachEinheit(training, eintrag, protokoll = [], datum = new Date()) {
  const b = eintrag.baustein; if (!b || !(b in (training.stufen || {}))) return abbruchWoche(training, eintrag, protokoll, datum);
  const t = { ...training, stufen: { ...training.stufen } };
  const w = woche(t, datum);
  if (istAbbruch(eintrag)) t.stufen[b] = Math.max(1, (t.stufen[b] || 1) - 1);
  else if (eintrag.ende === 'fertig') {
    const st = t.stufen[b] || 1;
    const liste = [...tEintraege(protokoll), eintrag].filter((e) => e.baustein === b && (e.stufe || 1) === st).slice(-2);
    const tab = b !== 'B-AUS', ruhig = liste.length === 2 && liste.every((e) => e.ende === 'fertig' && !e.zeichen && (tab ? e.zeichen === false && e.anstrengung != null && e.anstrengung <= 6 && !(e.anteil < 0.8) : !(e.anstrengung > 6)));
    const max = b === 'B-CO2' ? (w >= 4 ? 2 : 1) : b === 'B-O2' ? (w >= 6 ? 2 : 1) : (w >= 3 ? 3 : w >= 2 ? 2 : 1);
    if (ruhig && st < max) t.stufen[b] = st + 1;
  }
  return abbruchWoche(t, eintrag, protokoll, datum);
}
function abbruchWoche(t, eintrag, protokoll, datum) {
  if (!istAbbruch(eintrag)) return t;
  const w = woche(t, datum), wNr = tagNr(wochenStart(t, w));
  const n = [...tEintraege(protokoll), eintrag].filter((e) => istAbbruch(e) && (() => { const k = tagNr(tagVon(e.t)); return k >= wNr && k < wNr + 7; })()).length;
  if (n >= 2) return { ...t, anker: plusTage(tag(datum), -7 * (w - 1)), wiederholt: [...(t.wiederholt || []), w] };
  return t;
}
export function abbruchSperre(sicherheit, datum = new Date()) { return { ...sicherheit, sperre_bis: naechsteMitternacht(datum) }; }
export function krank(training, datum = new Date()) { return { ...training, anker: plusTage(training.anker, 7) }; }
export function mued(training, datum = new Date()) { return { ...training, mued_am: tag(datum) }; }
export function wiederhole58(training, datum = new Date()) { return { ...training, anker: plusTage(tag(datum), -28), fertig: null }; }
export function tabelle(typ, stufe, bestwert_s, letzte_halten_s) { return planTabelle(typ, stufe, bestwert_s, letzte_halten_s); }

// Sperr-Prüfer für die Bibliothek (§6.3) – rein
export function gesperrt(T, { training, sicherheit = {}, datum = new Date() }) {
  const jetzt = new Date(datum).getTime();
  if (training && training.ausschluss && (T.risiko === 'hoch' || T.risiko === 'mittel')) return 'Laut deiner Angabe nicht für dich – vorher ärztlich klären.';
  if (sicherheit.sperre_bis && new Date(sicherheit.sperre_bis).getTime() > jetzt && (T.risiko === 'hoch' || T.risiko === 'mittel')) return 'Für heute keine Anhalte- oder Schnellatem-Übungen mehr.';
  if (T.sperre_nach_kraft_h && sicherheit.kraft_zuletzt && jetzt - new Date(sicherheit.kraft_zuletzt).getTime() < T.sperre_nach_kraft_h * 3600e3) return 'Nicht direkt nach Kraftatmung (2 h Abstand).';
  return null;
}
