// Feinschliff – Wortschatz: Karten-Seite und Drill-Generator aus Listen [{wort, bedeutung, beispiel, info?}].
// Art aus dem Dateinamen (daten.js wortArt): genus → der/die/das; rektion → Präposition + Kasus (+ Lücke im Beispiel zum Antippen);
// sonst Bedeutung ↔ Ausdruck (Richtung wechselt bei jeder Wiederholung) und je 5 Einträge eine Verbinden-Übung.
import { esc, mische } from './speicher.js';
import { SYM } from './symbole.js';
import { lade, liste, wortArt } from './daten.js';
import { karte, waehle } from './wiederholung.js';
import * as ueben from './ueben.js';   // Namensraum: fehlt mischTyp (älteres ueben.js nach einem Update), gilt u.typ
const { sitzung } = ueben;
import { einst } from './konto.js';
import { kopf } from './app.js';

const PRAEP = ['an', 'auf', 'aus', 'bei', 'durch', 'für', 'gegen', 'in', 'mit', 'nach', 'über', 'um', 'unter', 'von', 'vor', 'zu'];
const WECHSEL = new Set(['an', 'auf', 'in', 'über', 'unter', 'vor']);
const REKTION = new RegExp(`^(.*?)\\s+(${PRAEP.join('|')})\\s*\\(?\\s*\\+\\s*(Akk|Dat|Gen)[a-z]*\\.?\\)?\\s*$`, 'i');
const KASUS = { akk: 'Akk.', dat: 'Dat.', gen: 'Gen.' };
// typische Verwechslungen je Präposition (Ablenker für die Lücke im Beispielsatz; nichts davon ist dort richtig)
const VERWECHSLUNG = { an: ['auf', 'über', 'für'], auf: ['an', 'für', 'über'], über: ['von', 'auf', 'um'], für: ['auf', 'an', 'über'], von: ['über', 'aus', 'an'], mit: ['an', 'über', 'zu'], zu: ['für', 'an', 'auf'], um: ['nach', 'für', 'über'], vor: ['von', 'für', 'gegen'], aus: ['von', 'durch', 'mit'], unter: ['an', 'von', 'mit'], gegen: ['für', 'vor', 'an'], durch: ['mit', 'von', 'aus'], nach: ['um', 'auf', 'zu'], in: ['an', 'auf', 'zu'], bei: ['an', 'mit', 'zu'] };
function andere(daten, i, feld, n = 3) {
  const soll = daten[i][feld]; const pool = [...new Set(daten.filter((_, k) => k !== i).map((e) => e[feld]).filter((x) => x && x !== soll))];
  return mische(pool).slice(0, n);
}
const erkl = (e) => [e.beispiel ? `Beispiel: ${e.beispiel}` : '', e.info || ''].filter(Boolean).join(' – ');
export function aufgabenAus(listeId, daten) {
  if (!Array.isArray(daten)) return [];
  const art = wortArt(listeId), pool = `wortschatz/${listeId}`, out = [];
  const neu = (uid, u) => out.push({ u: { id: uid.split('/').pop(), ...u }, uid, pool, bereich: 'wortschatz', thema: pool, typ: (ueben.mischTyp || ((x) => x.typ))(u) });
  daten.forEach((e, i) => {
    if (!e?.wort) return;
    const uid = `${pool}/${e.wort}`, n = karte(uid)?.n || 0;
    const g = /^(der|die|das)\s+(.+)$/.exec(e.wort);
    if (art === 'genus' && g && !/\//.test(e.wort)) {
      return neu(uid, { typ: 'auswahl', frage: `Welcher Artikel? … ${g[2]}${e.bedeutung ? ` (${e.bedeutung})` : ''}`, optionen: ['der', 'die', 'das'], richtig: ['der', 'die', 'das'].indexOf(g[1]), erklaerung: `${e.wort}. ${erkl(e)}` });
    }
    const r = REKTION.exec(e.wort);
    if (art === 'rektion' && r) {
      const [, stamm, p, k] = r; const kas = KASUS[k.toLowerCase()]; const soll = `${p} + ${kas}`;
      const bsp = String(e.beispiel || ''); const treffer = bsp.match(new RegExp(`(^|[\\s„(])${p}(?=[\\s,.;:!?])`, 'gi'));
      if (n % 2 === 1 && treffer && treffer.length === 1) {   // Lücke im Beispielsatz – zum Antippen, nicht zum Tippen
        const auch = new Set(String(e.info || '').toLowerCase().match(/[a-zäöü]+/g) || []);   // „auch: bei + Dativ“ → nie als Ablenker
        const pl = p.toLowerCase(); const ab = (VERWECHSLUNG[pl] || mische(PRAEP)).filter((x) => x !== pl && !auch.has(x));
        for (const x of mische(PRAEP)) { if (ab.length >= 3) break; if (x !== pl && !auch.has(x) && !ab.includes(x)) ab.push(x); }
        const gross = (x) => (/^[A-ZÄÖÜ]/.test(treffer[0].trim().replace(/^[„(]/, '')) ? x.charAt(0).toUpperCase() + x.slice(1) : x);
        const richtigesWort = gross(pl); const opts = mische([richtigesWort, ...ab.slice(0, 3).map(gross)]);
        return neu(uid, { typ: 'auswahl', aus: 'luecke', frage: bsp.replace(new RegExp(`(^|[\\s„(])${p}(?=[\\s,.;:!?])`, 'i'), '$1___'), optionen: opts, richtig: opts.indexOf(richtigesWort), hinweis: stamm, erklaerung: `${e.wort}. ${e.info || ''}`.trim() });
      }
      const ablenker = new Set();
      if (WECHSEL.has(p.toLowerCase())) ablenker.add(`${p} + ${kas === 'Akk.' ? 'Dat.' : 'Akk.'}`);
      for (const x of mische(PRAEP)) { if (ablenker.size >= 3) break; if (x !== p) ablenker.add(`${x} + ${kas}`); }
      const opts = mische([soll, ...[...ablenker].slice(0, 3)]);
      return neu(uid, { typ: 'auswahl', frage: `Welche Präposition und welcher Kasus? ${stamm} …${e.bedeutung ? ` (${e.bedeutung})` : ''}`, optionen: opts, richtig: opts.indexOf(soll), erklaerung: `${e.wort}. ${erkl(e)}` });
    }
    const ab = andere(daten, i, n % 2 ? 'wort' : 'bedeutung'); if (ab.length < 2) return;
    if (n % 2 === 0) { const opts = mische([e.bedeutung, ...ab]); neu(uid, { typ: 'auswahl', frage: `Was bedeutet „${e.wort}“?`, optionen: opts, richtig: opts.indexOf(e.bedeutung), erklaerung: erkl(e) }); }
    else { const opts = mische([e.wort, ...ab]); neu(uid, { typ: 'auswahl', frage: `Welcher Ausdruck passt? ${e.bedeutung}`, optionen: opts, richtig: opts.indexOf(e.wort), erklaerung: erkl(e) }); }
  });
  if (art !== 'genus' && art !== 'rektion') for (let k = 0; k + 4 <= daten.length; k += 5) {
    const teil = daten.slice(k, k + 5).filter((e) => e?.wort && e.bedeutung); if (teil.length < 4) continue;
    neu(`${pool}/paare-${k / 5 + 1}`, { typ: 'zuordnen', paare: teil.map((e) => [e.wort, e.bedeutung]), erklaerung: 'Ausdruck und Bedeutung gehören zusammen.' });
  }
  return out;
}
// Alle Übungen einer Liste: aus den Einträgen erzeugte Fragen + die handgemachten Übungen (uebungen-<liste>.json)
export async function kandidatenFuer(e) {
  const d = await lade(e.datei); const out = aufgabenAus(e.id, d);
  if (e.uebungen_datei) { try { const x = await lade(e.uebungen_datei); const pool = `wortschatz/${e.id}`; for (const u of x.uebungen || []) out.push({ u, uid: `${pool}/u/${u.id}`, pool, bereich: 'wortschatz', thema: pool, typ: (ueben.mischTyp || ((x) => x.typ))(u) }); } catch { /* nur die erzeugten */ } }
  return out;
}
export async function seite(view, id) {
  const e = (await liste('wortschatz')).find((x) => x.id === id);
  if (!e) { view.innerHTML = `${kopf('Wortschatz', '#/bereich/wortschatz', 'wortschatz')}<p class="karte">Liste nicht gefunden.</p>`; return; }
  const d = await lade(e.datei);
  view.innerHTML = `${kopf(e.titel, '#/bereich/wortschatz', 'wortschatz')}<div class="bereich-seite" data-bereich="wortschatz">
    <div class="karte klein"><div><b>${d.length} Einträge${e.uebungen ? ` · ${e.uebungen} Extra-Übungen` : ''}</b><p class="leise">Drill: 10 Fragen, gemischt (Auswahl, Lücke zum Antippen, Verbinden). Was du sicher kannst, kommt erst wieder, wenn alles andere dran war.</p></div><button class="knopf haupt" data-drill>${SYM.play} Drill</button></div>
    <input class="feld suche" type="search" placeholder="Suchen …" aria-label="In der Liste suchen">
    <ul class="wortliste">${d.map((w) => `<li data-such="${esc((w.wort + ' ' + w.bedeutung).toLowerCase())}"><b>${esc(w.wort)}</b><span>${esc(w.bedeutung)}</span>${w.beispiel ? `<i>${esc(w.beispiel)}</i>` : ''}${w.info ? `<small>${esc(w.info)}</small>` : ''}</li>`).join('')}</ul></div>`;
  view.querySelector('.suche').addEventListener('input', (ev) => { const s = ev.target.value.trim().toLowerCase(); view.querySelectorAll('.wortliste li').forEach((li) => { li.hidden = s && !li.dataset.such.includes(s); }); });
  const kand = await kandidatenFuer(e);
  const start = () => sitzung(view, { titel: e.titel, bereich: 'wortschatz', eintraege: waehle(kand, 10), modus: einst().modus, zurueck: `#/wortschatz/${id}`, nochmal: start });
  view.querySelector('[data-drill]').addEventListener('click', start);
}
