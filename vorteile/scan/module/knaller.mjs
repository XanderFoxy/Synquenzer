// Modul "knaller": die krassesten Angebote der Woche je Markt (Xander 16.11.2026: „je Markt die krassesten Angebote der Woche –
// Aldi, Netto, Marktkauf, Kaufland, Penny, Lidl, Rewe – gestaffelt ab 30 / 40 / 50 % Rabatt, als Kacheln mit Produktbild“).
// Quelle: kaufDA (Bonial), Datenblock __NEXT_DATA__ (lib/kaufda.mjs). Ortsbezug (Roh-Lauf 43793492110, 16.11.2026): die
// Orts-Händlerseite https://www.kaufda.de/<Stadt>/<Händler>/p-r<id> (z. B. /Doebeln/Kaufland/p-r2801) liefert die Prospekte
// dieser Stadt und die nächste Filiale; /Geschaefte/<Händler> ist immer Berlin 10178. Reihenfolge je Markt: orte aus der
// config (Döbeln, dann Chemnitz, Leipzig), erst danach bundesweit – dann mit Hinweis „in Döbeln prüfen“ (regional = true).
// Ist die nächste Filiale weiter als maxFilialeKm (oder gibt es keine), heißt es „kein Markt in der Nähe“ (Hinweis, keine
// Störung, keine bundesweiten Angebote dieses Markts).
// Ehrlich (Bestandsaufnahme 16.11.2026): Prozent NUR mit Vergleichspreis aus der Quelle (secondaryPrice > Preis); dazu immer
// die Art: 'streich' (Streichpreis im Prospekt) oder 'uvp' (Herstellerpreis – im Mitschnitt die meisten großen Prozente).
// ab-Preis (priceRange): „bis zu −n %“ (abPreis = true), abschaltbar mit module.knaller.abPreise = false.
// App-/Karten-Preise (Penny App, Lidl Plus, Kaufland Card, PAYBACK …) -> app = true (die Seite kennzeichnet sie).
// Kein Eintrag in aktuell.json (keine Pushes); eigene Datei <data>/knaller.json (Rückgabefeld „datei“) und eine Übersicht in
// status.knaller.kurz für die Start-Kachel. Bilder nur als Link (https, Prospekt-Ausschnitt von content-media.bonial.biz).
// Fällt eine Händlerseite aus (oder kommt sie ohne ein einziges Angebot), bleiben deren noch gültige Angebote aus der
// letzten Datei stehen (mit „alt“ im Status); mehrere leere Seiten = Störung (Aufbau geändert?); status.kaufda.roh =
// gelesene Angebote des Markts je Seite.
// Prüfer 16.11.2026: Rabatt abgerundet (29,5 % ist nicht „ab 30 %“); ohne UVP-Kennzeichen vorherArt 'unbekannt' (kein
// Goldrahmen); Doppel aus parallelen Prospekten desselben Markts über Bilddatei und Marke/Preis/Vergleichspreis/Ende erkannt.
import { leseKaufdaSeite, kaufdaZeit, kaufdaSlug } from '../lib/kaufda.mjs';
import { norm, schluessel, round } from '../lib/text.mjs';

export const STANDARD = {
  basis: 'https://www.kaufda.de',
  geschaefte: '/Geschaefte/{slug}',
  ortsSeite: '/{ort}/{slug}/p-r{id}',
  orte: ['Döbeln', 'Chemnitz', 'Leipzig'],
  ort: 'Döbeln',
  maxFilialeKm: 30,
  minProzent: 30,
  stufen: [30, 40, 50],
  maxJeMarkt: 40,
  maxProzent: 85, // mehr Rabatt ist im Prospekt nicht plausibel (Tippfehler in den Daten) -> keine Prozentangabe
  abPreise: true,
};

const APP = /\bapp\b|\bcard\b|lidl\s*plus|payback|kundenkarte|mit karte|nur mit (?:der )?(?:app|karte)|coupon|deutschland\s*card|rewe[\s-]*bonus|bonus[\s-]*guthaben|mitglied/i;
// dieselben Kennzeichen im Beschreibungstext (dort ohne das allgemeine „app“/„card“, die in Produktnamen vorkommen)
const APP_TEXT = /nur mit (?:der )?(?:app|karte|card)|lidl\s*plus|mit (?:der )?\S+[ -]app\b|deutschland\s*card|payback|rewe[\s-]*bonus|bonus[\s-]*guthaben|kaufland\s*card|k-card|mitglied(?:er)?preis/i;
/** Rabatt in ganzen Prozent, abgerundet: nie mehr versprechen, als die Quelle hergibt (29,5 % ist nicht „ab 30 %“) */
export const rabattProzent = (preis, vorher) => Math.floor((1 - preis / vorher) * 100 + 1e-9);
/** Bilddatei eines Angebots (letzter Pfadteil ohne Query; „main.jpg“ ist ein Platzhalter und zählt nicht) – gleich = gleiches Foto */
export function bildDatei(u) {
  const m = /\/([^/?#]+)(?:[?#]|$)/.exec(String(u || ''));
  return m && !/^main\.\w+$/i.test(m[1]) ? m[1].toLowerCase() : null;
}
const LEER = /^\s*(?:je|pro stück|pro beutel|pro packung|stück)?\s*$/i;
const kurzText = (s, n) => { const t = String(s || '').replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t; };
const httpsOder = u => (typeof u === 'string' && /^https:\/\//i.test(u.trim()) ? u.trim() : null);
const haendlerKey = s => norm(s).replace(/[^a-z0-9]/g, '');

/** Händlername aus kaufDA -> Markt-id der config (oder null: „Netto mit dem Scottie“, „ALDI SÜD“, EDEKA …) */
export function marktVon(publisherName, maerkte) {
  const k = haendlerKey(publisherName);
  if (!k) return null;
  for (const m of maerkte) if ((m.haendler || [m.name]).some(h => haendlerKey(h) === k)) return m.id;
  return null;
}

/** Lebensmittel oder Non-Food aus categoryPaths (fehlt -> null) */
export function bereichVon(o) {
  const pfade = Array.isArray(o?.categoryPaths) ? o.categoryPaths : [];
  if (!pfade.length) return null;
  return pfade.some(p => Array.isArray(p) && p.some(x => /lebensmittel|getr(?:ä|ae)nke|drogerie|s(?:ü|ue)(?:ß|ss)igkeiten/i.test(String(x?.name || '')))) ? 'lebensmittel' : 'nonfood';
}

/**
 * Ein kaufDA-Angebot -> Knaller-Angebot oder { grund } (warum nicht).
 * pct nur mit Vergleichspreis aus der Quelle (secondaryPrice > mainPrice), vorherArt 'streich' | 'uvp'.
 */
export function knallerAngebot(o, { markt, seite, region, jetztMs, opt }) {
  const p = o?.prices || {};
  const preis = typeof p.mainPrice === 'number' && p.mainPrice > 0 ? p.mainPrice : null;
  if (preis == null) return { grund: 'ohne Preis' };
  const bis = kaufdaZeit(o.validUntil), ab = kaufdaZeit(o.validFrom);
  if (bis && Date.parse(bis) < jetztMs) return { grund: 'abgelaufen' };
  const vorher = typeof p.secondaryPrice === 'number' && p.secondaryPrice > preis ? p.secondaryPrice : null;
  if (vorher == null) return { grund: 'ohne Vergleichspreis' };
  const pct = rabattProzent(preis, vorher);
  if (pct > opt.maxProzent) return { grund: 'Rabatt unplausibel' };
  const abPreis = p.priceRange === true;
  if (abPreis && !opt.abPreise) return { grund: 'ab-Preis' };
  const marke = String(o.brand || '').trim();
  const name = String(o.title || '').trim();
  const titel = kurzText(marke && !norm(name).includes(norm(marke)) ? `${marke} ${name}` : name || marke, 90);
  if (!titel) return { grund: 'ohne Titel' };
  const bedingungen = (Array.isArray(p.conditions) ? p.conditions : []).map(c => String(c?.other || '').trim()).filter(c => c && !LEER.test(c));
  const app = bedingungen.some(c => APP.test(c)) || APP_TEXT.test(`${o.description || ''} ${p.description || ''}`);
  const bedingung = kurzText(bedingungen.filter(c => !APP.test(c)).join(', '), 60);
  const info = kurzText([String(o.description || '').split('\n').map(s => s.trim()).filter(Boolean).join(' '), p.priceByBaseUnit].filter(Boolean).join(' · '), 90);
  const bilder = o.offerImages?.url || {};
  return {
    angebot: {
      id: o.id ? `kd:${o.id}` : `kd:${schluessel(markt, titel, preis, bis)}`,
      // Art nur, wenn die Quelle sie sagt: true = UVP, false = Streichpreis; fehlt das Feld -> 'unbekannt' (kein Goldrahmen)
      markt, titel, info, preis: round(preis), vorher: round(vorher), vorherArt: p.secondaryPriceIsUVP === true ? 'uvp' : p.secondaryPriceIsUVP === false ? 'streich' : 'unbekannt', pct,
      ...(abPreis ? { abPreis: true } : {}),
      app, bedingung,
      bild: httpsOder(bilder.normal) || httpsOder(bilder.thumbnail) || httpsOder(bilder.large) || null,
      ...(typeof o.parentContent?.id === 'string' && o.parentContent.id ? { prospekt: o.parentContent.id.slice(0, 40) } : {}),
      _marke: norm(marke), _bildDatei: bildDatei(bilder.large || bilder.normal || bilder.thumbnail),
      link: httpsOder(seite),
      gueltigAb: ab, gueltigBis: bis,
      regional: true, region,
      bereich: bereichVon(o),
    },
  };
}

/** Prospekt-Orte -> Text für die Seite: nur Orte der config in ihrer Reihenfolge, „bundesweit“ zuletzt */
export function standortVon(liste, orte) {
  const da = new Set(liste);
  const out = orte.filter(o => da.has(o));
  if (da.has('bundesweit') || !out.length) out.push('bundesweit');
  return out.join('/');
}

const ist404 = e => /HTTP 404|HTTP 410/.test(String(e?.message || e));

export default async function knaller({ holeText, cfg, jetzt = new Date(), zustand = {}, vorherDatei = null }) {
  const m = { ...STANDARD, ...(cfg.module?.knaller || {}) };
  const maerkte = (Array.isArray(m.maerkte) ? m.maerkte : []).filter(x => x && x.id && x.kaufda);
  const jetztMs = new Date(jetzt).getTime();
  const basis = String(m.basis).replace(/\/$/, '');
  const zk = (zustand.knaller ||= {});
  delete zk.ohneStadt; // alte Regel (bis 16.11.2026): Stadt 7 Tage überspringen – gibt es nicht mehr
  const orte = (Array.isArray(m.orte) && m.orte.length ? m.orte : [m.ort]).map(o => String(o || '').trim()).filter(Boolean);
  const gleichOrt = (a, b) => !!a && !!b && kaufdaSlug(a).toLowerCase().split('-')[0] === kaufdaSlug(b).toLowerCase().split('-')[0];
  const opts = { headers: { accept: 'text/html,application/xhtml+xml' } };
  const fehler = [], hinweise = [];
  const st = { ok: true, anzahl: 0, fehler: [], abrufe: 0, seiten: {}, roh: {}, orte: {}, alt: [] };
  const jeMarkt = {};
  const info = {};
  const leer = [];
  let okSeiten = 0;
  for (const mk of maerkte) {
    const slug = kaufdaSlug(mk.kaufda);
    const pfad = String(m.geschaefte).replace('{slug}', slug);
    // erst die Orts-Händlerseiten (Döbeln, Chemnitz, Leipzig), zuletzt bundesweit
    const versuche = [];
    if (mk.kaufdaId) {
      for (const o of orte) versuche.push({ ort: o, url: `${basis}${String(m.ortsSeite).replace('{ort}', kaufdaSlug(o)).replace('{slug}', kaufdaSlug(mk.kaufdaOrt || mk.kaufda)).replace('{id}', String(mk.kaufdaId))}` });
    }
    versuche.push({ ort: null, url: `${basis}${pfad}` });
    let seite = null, letzterFehler = null, filiale = null, leerSeite = false, keinMarkt = false;
    const ohneOrt = [];
    for (const v of versuche) {
      let s;
      try {
        st.abrufe++;
        s = leseKaufdaSeite(await holeText(v.url, opts));
      } catch (e) {
        if (ist404(e)) { if (v.ort) { ohneOrt.push(v.ort); continue; } letzterFehler = e; break; }
        letzterFehler = e; // 503, Zeitlimit, kaputter Datenblock: nicht noch 3 weitere Seiten probieren
        break;
      }
      if (v.ort) {
        // nächste Filiale vom ersten Ort (Döbeln) aus: zu weit/keine -> kein Markt in der Nähe
        if (v.ort === orte[0]) filiale = s.filiale ? { ...s.filiale, von: v.ort } : null;
        if (v.ort === orte[0] && filiale?.km != null && filiale.km > m.maxFilialeKm) { keinMarkt = true; break; }
        const eigene = s.items.some(o => marktVon(o.publisherName, maerkte) === mk.id);
        if (eigene && (!s.ort || gleichOrt(s.ort, v.ort))) { seite = { ...s, v }; break; }
        ohneOrt.push(v.ort);
        continue;
      }
      seite = { ...s, v };
      if (!s.items.length) leerSeite = true;
      break;
    }
    if (keinMarkt) {
      hinweise.push(`${mk.name}: kein Markt in der Nähe von ${orte[0]}${filiale?.km != null ? ` (nächste Filiale ${String(filiale.km).replace('.', ',')} km)` : ''}`);
      jeMarkt[mk.id] = [];
      st.seiten[mk.id] = 0;
      st.orte[mk.id] = 'kein Markt in der Nähe';
      info[mk.id] = { link: null, ort: null, keinMarkt: true, filiale };
      continue;
    }
    // Seite gelesen, aber kein einziges Angebot darauf: einzeln = Hinweis, alte Angebote bleiben; sind es mehrere/alle
    // Seiten -> Fehler unten (Aufbau geändert?), nicht still „0“
    const roh = seite ? seite.items.filter(o => marktVon(o.publisherName, maerkte) === mk.id).length : 0;
    if (seite && leerSeite) { leer.push(mk.name); seite = null; }
    if (!seite) {
      // Ausfall: noch gültige Angebote dieses Markts aus der letzten Datei behalten
      const alt = (Array.isArray(vorherDatei?.angebote) ? vorherDatei.angebote : []).filter(a => a && a.markt === mk.id && !(a.gueltigBis && Date.parse(a.gueltigBis) < jetztMs));
      jeMarkt[mk.id] = alt;
      if (alt.length) st.alt.push(mk.id);
      const msg = `${mk.name}: ${letzterFehler ? letzterFehler.message : 'keine Seite'}`;
      if (leerSeite) hinweise.push(`${mk.name}: Seite ohne Angebote (kein Prospekt am Standort?)`);
      else if (letzterFehler && ist404(letzterFehler)) hinweise.push(`${mk.name}: keine kaufDA-Händlerseite (${pfad})`);
      else fehler.push(msg);
      st.seiten[mk.id] = 0;
      info[mk.id] = { link: null, ort: null, filiale };
      continue;
    }
    okSeiten++;
    st.roh[mk.id] = roh;
    if (!roh) hinweise.push(`${mk.name}: keine Angebote dieses Markts auf der Seite`);
    const lokal = !!seite.v.ort;
    // bundesweit (Berlin-Prospekt): sichtbar als Hinweis, jedes Angebot „regional“ (= in Döbeln prüfen)
    if (!lokal && mk.kaufdaId) hinweise.push(`${mk.name}: kein Prospekt für ${orte.join('/')} gefunden – bundesweite Angebote, in ${m.ort} prüfen`);
    const region = lokal ? seite.v.ort : seite.ort ? `bundesweit (${seite.ort})` : 'bundesweit';
    st.orte[mk.id] = lokal ? seite.v.ort : 'bundesweit';
    const link = (seite.url && /^https:\/\//.test(seite.url) ? seite.url : null) || seite.v.url;
    info[mk.id] = { link, ort: region, lokal: lokal ? seite.v.ort : null, filiale };
    // Doppel: dieselbe Aktion steht oft in mehreren parallelen (regionalen) Prospekten desselben Markts – mit anderer id und
    // leicht anderem Titel („Knoppers Nussriegel oder Knoppers“ / „Knoppers Nussriegel“). Gleich ist dann: dasselbe Foto, oder
    // Marke + erstes Titelwort + Preis + Vergleichspreis + Ende.
    const liste = [], gesehen = new Set();
    for (const o of seite.items) {
      if (marktVon(o.publisherName, maerkte) !== mk.id) continue;
      const r = knallerAngebot(o, { markt: mk.id, seite: link, region, jetztMs, opt: m });
      if (!r.angebot) continue;
      const { _marke, _bildDatei, ...a } = r.angebot;
      // Ort-Prospekt gilt für Döbeln (orte[0]) -> nicht „regional“; Nachbarstadt/bundesweit -> „in Döbeln prüfen“
      a.regional = !(lokal && gleichOrt(seite.v.ort, m.ort));
      const wort = norm(a.titel).split(/\s+/).find(w => w.length > 2 && w !== _marke) || '';
      const keys = [a.id, `t|${norm(a.titel)}|${a.preis}`, `m|${_marke}|${wort}|${a.preis}|${a.vorher}|${a.gueltigBis || ''}`];
      if (_bildDatei) keys.push(`b|${_bildDatei}`);
      if (keys.some(k => gesehen.has(k))) continue;
      for (const k of keys) gesehen.add(k);
      liste.push(a);
    }
    st.seiten[mk.id] = liste.length;
    jeMarkt[mk.id] = liste;
  }
  if (leer.length >= 2 && leer.length > okSeiten) fehler.push(`Seiten ohne Angebote (${leer.join(', ')}) – Aufbau bei kaufDA geändert?`);
  if (maerkte.length && !okSeiten && fehler.length) throw new Error(`kaufDA: keine Händlerseite gelesen – ${fehler[0]}`);

  // nur ab minProzent, je Markt höchstens maxJeMarkt (die größten zuerst)
  const angebote = [];
  const maerkteOut = {};
  for (const mk of maerkte) {
    const l = (jeMarkt[mk.id] || []).filter(a => a.pct >= m.minProzent)
      .sort((a, b) => b.pct - a.pct || (a.vorherArt === 'streich' ? -1 : 1) - (b.vorherArt === 'streich' ? -1 : 1) || a.preis - b.preis)
      .slice(0, m.maxJeMarkt);
    angebote.push(...l);
    const bis = l.map(a => a.gueltigBis).filter(Boolean).sort().pop() || null;
    const i = info[mk.id] || {};
    maerkteOut[mk.id] = {
      name: mk.name, link: i.link || null, anzahl: l.length, ...(bis ? { prospektBis: bis } : {}), ...(st.alt.includes(mk.id) ? { alt: true } : {}),
      // Prospekt-Ort dieses Markts (Döbeln/Chemnitz/Leipzig oder „bundesweit (Berlin)“), nächste Filiale von Döbeln aus
      ...(i.ort ? { ort: i.ort } : {}), ...(i.keinMarkt ? { keinMarkt: true } : {}), ...(i.filiale ? { filiale: i.filiale } : {}),
    };
  }
  angebote.sort((a, b) => b.pct - a.pct || a.preis - b.preis);
  st.anzahl = angebote.length;
  st.fehler = fehler.slice(0, 10);
  st.ok = !fehler.length;
  if (hinweise.length) st.hinweise = hinweise.slice(0, 10);
  if (!st.alt.length) delete st.alt;
  if (!Object.keys(st.roh).length) delete st.roh;
  const standort = standortVon(Object.values(st.orte).filter(o => o !== 'kein Markt in der Nähe'), orte);
  if (!Object.keys(st.orte).length) delete st.orte;
  const stufen = (Array.isArray(m.stufen) && m.stufen.length ? m.stufen : STANDARD.stufen).filter(n => Number.isFinite(n));
  const ab = Object.fromEntries(stufen.map(n => [n, angebote.filter(a => a.pct >= n).length]));
  const nameVon = id => maerkte.find(x => x.id === id)?.name || id;
  const spaeter = a => !!(a.gueltigAb && Date.parse(a.gueltigAb) > jetztMs);
  const kurz = {
    anzahl: angebote.length, ab,
    // erst was jetzt gilt, dann was ab Montag/Donnerstag kommt (mit „ab“, damit die Start-Kachel „ab Mo“ sagen kann)
    top: [...angebote.filter(a => !spaeter(a)), ...angebote.filter(spaeter)].slice(0, 3).map(a => ({ titel: a.titel, markt: nameVon(a.markt), pct: a.pct, preis: a.preis, vorherArt: a.vorherArt, ...(a.abPreis ? { abPreis: true } : {}), ...(a.app ? { app: true } : {}), ...(spaeter(a) ? { ab: a.gueltigAb } : {}) })),
  };
  const datei = {
    version: 1,
    aktualisiert: new Date(jetztMs).toISOString(),
    ort: m.ort,
    // Prospekt-Orte der gelesenen Märkte, in der Reihenfolge der config („Döbeln“, „Döbeln/Chemnitz“, „Döbeln/bundesweit“ …)
    standort,
    minProzent: m.minProzent,
    stufen,
    maerkte: maerkteOut,
    angebote,
    status: { kaufda: st },
    hinweis: 'Prospekt-Ort je Markt in maerkte.<id>.ort (regional = nicht der Prospekt für Döbeln, dort prüfen). Rabatt nur mit Vergleichspreis aus dem Prospekt, abgerundet: vorherArt streich = Streichpreis, uvp = unverbindliche Preisempfehlung des Herstellers, unbekannt = Art nicht angegeben. abPreis = „ab“-Preis (bis zu). app = nur mit App/Karte. prospekt = Prospekt-id bei kaufDA.',
  };
  return { eintraege: [], fehler, hinweise, datei, kurz };
}
