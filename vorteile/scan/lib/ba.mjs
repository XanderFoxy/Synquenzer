// Jobbörse der Bundesagentur für Arbeit (offene Schnittstelle, fester öffentlicher Schlüssel „jobboerse-jobsuche“).
// Echter Lauf 07.11.2026: die Suche /pc/v4/jobs antwortet von GitHub aus mit HTTP 403 (alle 9 Suchen). Laut bundesAPI
// (github.com/bundesAPI/jobsuche-api) läuft die Suche jetzt über /pc/v6/jobs; Details weiter über /pc/v4/jobdetails.
// Deshalb: v6 zuerst, danach die Ausweich-Adressen aus der config (z. B. /pc/v4/app/jobs). Wer in einem Lauf mit
// 403/404/400 antwortet, wird in diesem Lauf nicht mehr gefragt. Antwort tolerant lesen (Feldnamen v4/v6).
// v6 kennt laut dev.to (10/2026) keinen Homeoffice-Filter -> „arbeitszeit“ nur an v4-Adressen; Homeoffice prüfen wir
// selbst (Feld homeofficemoeglich oder Wörter im Titel).

export const BA_V6 = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs';
export const BA_AUSWEICH = ['https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/app/jobs', 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs'];

/** Such-Adresse für eine Suche s = { was, wo, umkreis, arbeitszeit } */
export function baUrl(ba, s, api = ba.api || BA_V6) {
  const u = new URL(api);
  u.searchParams.set('was', s.was);
  if (s.wo) u.searchParams.set('wo', s.wo);
  if (s.umkreis) u.searchParams.set('umkreis', String(s.umkreis));
  if (s.arbeitszeit && !/\/v6\//.test(api)) u.searchParams.set('arbeitszeit', s.arbeitszeit);
  u.searchParams.set('angebotsart', '1');
  u.searchParams.set('veroeffentlichtseit', String(ba.tageZurueck ?? 14));
  u.searchParams.set('size', '25');
  return u.toString();
}

/** Website-Suche (für Menschen) – als Link, wenn die Schnittstelle gerade nicht will. */
export function baWebUrl(s) {
  const u = new URL('https://www.arbeitsagentur.de/jobsuche/suche');
  u.searchParams.set('angebotsart', '1');
  u.searchParams.set('was', s.was);
  if (s.wo) u.searchParams.set('wo', s.wo);
  if (s.umkreis) u.searchParams.set('umkreis', String(s.umkreis));
  return u.toString();
}

const erstes = (...xs) => xs.find(x => x != null && x !== '');
const tagVon = x => (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}/.test(x) ? x.slice(0, 10) : null);
const spaetester = (...xs) => xs.map(tagVon).filter(Boolean).sort().at(-1) ?? null;

/**
 * Antwort (v4 oder v6) -> [{ refnr, titel, beruf, arbeitgeber, ort, plz, lat, lon, km, datum, seit, homeoffice,
 * homeofficeProzent, externeUrl }]
 * v6 (echter Lauf 08.11.2026, Roh-Lauf 42435892574): { ergebnisliste: [{ referenznummer, stellenangebotsTitel,
 * hauptberuf, firma, stellenlokationen: [{ adresse: { ort: "Chemnitz, Sachsen", plz }, breite, laenge }], entfernung
 * (km ab „wo“), datumErsteVeroeffentlichung, veroeffentlichungszeitraum: { von }, aenderungsdatum, homeofficemoeglich,
 * homeofficetyp, homeofficeprozent, externeURL }], maxErgebnisse, woOutput }. Vorher las leseBa nur v4-Namen
 * (stellenangebote/refnr/titel/arbeitsort) -> 0 Stellen, obwohl die Jobbörse 200 mit Treffern lieferte.
 * datum = jüngstes von aktueller Veröffentlichung und letzter Änderung (v6 beachtet „veroeffentlichtseit“ nicht:
 * Facette veroeffentlichtseit.alle = alle Treffer, auch von 2023), seit = erste Veröffentlichung.
 */
export function leseBa(text) {
  const j = typeof text === 'string' ? JSON.parse(text) : text;
  const liste = j?.stellenangebote || j?.ergebnisliste || j?.jobs || j?.ergebnisse || j?.content || j?._embedded?.jobs || [];
  return (Array.isArray(liste) ? liste : []).map(st => {
    const lok = st.stellenlokationen?.[0] || null;
    const o = st.arbeitsort || st.arbeitsorte?.[0] || lok?.adresse || st.ort || {};
    const k = o.koordinaten || o.koordinate || {};
    const ortRoh = erstes(typeof o === 'string' ? o : o.ort, o.stadt, '');
    const km = Number(st.entfernung);
    return {
      refnr: erstes(st.refnr, st.referenznummer, st.hashId),
      titel: erstes(st.titel, st.stellenangebotsTitel, st.stellenbezeichnung, st.beruf, st.hauptberuf, ''),
      beruf: erstes(st.beruf, st.hauptberuf, ''),
      arbeitgeber: String(erstes(st.arbeitgeber, st.arbeitgeberName, st.firma, '')).replace(/\s+/g, ' ').trim(),
      // „Chemnitz, Sachsen“ / „Neubrandenburg, Mecklenburg“ -> „Chemnitz“ (Land/Region nach dem Komma weg)
      ort: String(ortRoh).split(',')[0].trim(),
      plz: erstes(o.plz, ''),
      lat: k.lat ?? k.latitude ?? lok?.breite ?? null,
      lon: k.lon ?? k.longitude ?? lok?.laenge ?? null,
      km: Number.isFinite(km) && st.entfernung !== '' && st.entfernung != null ? Math.round(km) : null,
      datum: erstes(st.aktuelleVeroeffentlichungsdatum, spaetester(st.veroeffentlichungszeitraum?.von, st.aenderungsdatum, st.datumErsteVeroeffentlichung), st.veroeffentlichungsdatum, st.modifikationsTimestamp, null),
      seit: tagVon(st.datumErsteVeroeffentlichung) || tagVon(st.veroeffentlichungsdatum) || null,
      homeoffice: st.homeofficemoeglich === true || st.homeoffice === true || /homeoffice|home-office/i.test(String(st.arbeitszeitmodelle || '')),
      homeofficeProzent: Number.isFinite(Number(st.homeofficeprozent)) && st.homeofficeprozent != null ? Number(st.homeofficeprozent) : null,
      externeUrl: erstes(st.externeUrl, st.externeURL, null),
      // v6: nur Vollzeit angekreuzt (kein Teilzeit-/Abend-/Flexibel-Feld) – für Nebenverdienst ungeeignet
      nurVollzeit: st.arbeitszeitVollzeit === true && !['arbeitszeitTeilzeitVormittag', 'arbeitszeitTeilzeitNachmittag', 'arbeitszeitTeilzeitAbend', 'arbeitszeitTeilzeitFlexibel', 'arbeitszeitSchichtNachtWochenende'].some(k => st[k] === true),
    };
  }).filter(x => x.refnr);
}

export const baJobLink = refnr => `https://www.arbeitsagentur.de/jobsuche/jobdetail/${encodeURIComponent(refnr)}`;

/**
 * Sucher für einen Lauf: probiert v6, dann die Ausweich-Adressen; merkt sich, welche Adresse geht.
 * suche(s) -> { stellen, api } ; wirft nur, wenn alle Adressen scheitern (Fehlertext nennt die letzte Antwort).
 */
export function macheBaSuche(holeText, ba) {
  const adressen = [ba.api || BA_V6, ...(ba.ausweich ?? BA_AUSWEICH)].filter((x, i, a) => x && a.indexOf(x) === i);
  const tot = new Set();
  let gut = null;
  return async function suche(s) {
    const reihe = gut ? [gut, ...adressen.filter(a => a !== gut)] : adressen;
    let letzter = null;
    for (const api of reihe) {
      if (tot.has(api)) continue;
      try {
        const stellen = leseBa(await holeText(baUrl(ba, s, api), { headers: { 'X-API-Key': ba.key || 'jobboerse-jobsuche', accept: 'application/json' } }));
        gut = api;
        return { stellen, api };
      } catch (e) {
        letzter = e;
        if (/HTTP (400|401|403|404|410)/.test(String(e.message))) tot.add(api);
        else throw e; // Zeitüberschreitung o. ä.: nicht gleich alle Adressen verbrennen
      }
    }
    throw letzter || new Error('keine Adresse der Jobbörse erreichbar');
  };
}
