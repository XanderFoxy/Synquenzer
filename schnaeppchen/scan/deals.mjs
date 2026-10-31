// Deal decision for watch items and electronics price errors.
import { norm, round, euroKurz, zeitpunktText, BASIS_LABEL } from './text.mjs';
import { vorherAusText, vorherJetzt } from './preisfehler.mjs';

// Reference price: history median once there is enough data, else the estimate from watchlist.json.
// quelle: 'fest' (von Xander festgelegt) | 'verlauf' (eigener Preisverlauf) | 'schaetzung' (Schätzung aus watchlist.json)
//         | 'verlauf-kurz' (wenige Tage Verlauf, keine Schätzung) | 'unbekannt'
export function referenz(item, stats, cfg) {
  if (item.normalpreisFest && item.normalpreis) return { p: item.normalpreis, quelle: 'fest' };
  if (stats.normal != null && stats.tage >= cfg.deal.historieMinTage) return { p: round(stats.normal, 3), quelle: 'verlauf' };
  if (item.normalpreis) return { p: item.normalpreis, quelle: 'schaetzung' };
  if (stats.normal != null) return { p: round(stats.normal, 3), quelle: 'verlauf-kurz' };
  return { p: null, quelle: 'unbekannt' };
}
export const istGeschaetzt = ref => ref.quelle === 'schaetzung' || ref.quelle === 'verlauf-kurz';

/**
 * Normalpreis für ein bestimmtes Angebot. Eine Schätzung kann je Packungsgröße verschieden sein
 * (watchlist.json normalpreisStaffel: [{ bisStueck, preis }] – einzeln teurer als die 15er-Familienpackung).
 * Nur mit sicherer Stückzahl; sonst die allgemeine Referenz.
 */
export function refFuer(item, ref, a) {
  const staffel = item?.normalpreisStaffel;
  if (ref.quelle !== 'schaetzung' || !Array.isArray(staffel) || !a?.mengeSicher || !(a.menge?.stueck > 0)) return ref;
  const stufe = [...staffel].sort((x, y) => x.bisStueck - y.bisStueck).find(x => a.menge.stueck <= x.bisStueck);
  return stufe?.preis > 0 ? { p: stufe.preis, quelle: 'schaetzung', staffel: true } : ref;
}

// Ist die Schätzung glaubwürdig? Liegen drei oder mehr Angebote alle weit (≥ 30 %) darunter, ist eher die Schätzung
// zu hoch als dass überall Aktion ist. refVon(a) = Normalpreis für das Angebot a (Staffel je Packungsgröße).
export function schaetzungPlausibel(ref, sichere, refVon = () => ref) {
  if (!(ref.p > 0)) return false;
  if (sichere.length < 3) return true;
  return Math.max(...sichere.map(a => a.einheitspreis / (refVon(a).p || ref.p))) >= 0.7;
}

/**
 * Deal oder nicht? Ehrlich:
 * - Menge unsicher oder Preis unplausibel -> nie Deal, keine Prozentangabe.
 * - Gegen einen GESCHÄTZTEN Normalpreis nur, wenn das Angebot das günstigste aller aktuellen ist, die Schätzung
 *   plausibel ist und der Abstand nicht absurd groß (> schaetzungMaxRabatt = eher Lesefehler als Schnäppchen).
 */
export function bewerte(angebot, ref, stats, cfg, { guenstigstes = true, plausibel = true } = {}) {
  const up = angebot.einheitspreis;
  const res = { deal: false, ersparnis: null, grund: '' };
  if (!(up > 0) || angebot.mengeSicher === false || angebot.unsicher) return res;
  if (ref.p > 0) res.ersparnis = round(1 - up / ref.p, 3);
  const geschaetzt = istGeschaetzt(ref);
  if (res.ersparnis != null && res.ersparnis >= cfg.deal.rabattMin) {
    const ok = !geschaetzt || (guenstigstes && plausibel && res.ersparnis <= (cfg.deal.schaetzungMaxRabatt ?? 0.6));
    if (ok) {
      res.deal = true;
      res.grund = `${Math.round(res.ersparnis * 100)} % unter ${geschaetzt ? 'geschätztem ' : ''}Normalpreis`;
    }
  }
  const t = stats.tiefst;
  if (t && stats.punkte >= cfg.deal.tiefstpreisMinPunkte && up <= t.p + 1e-9 &&
      (res.ersparnis ?? 0) >= cfg.deal.tiefstpreisMinRabatt && (!geschaetzt || guenstigstes)) {
    res.deal = true;
    res.grund = res.grund ? `${res.grund}, Tiefstpreis` : 'auf Tiefstpreis';
  }
  return res;
}

const tagKurz = tag => { const [, m, d] = String(tag).split('-'); return `${d}.${m}.`; };
function wo(angebote) {
  const laden = angebote.some(a => !a.online), online = angebote.some(a => a.online);
  return laden && online ? 'in deiner Nähe und online' : online ? 'online' : 'in deiner Nähe';
}

/** „PENNY hat 3,49 € (mit App, ab Mo 2.11.)“ – ein anderes Angebot mit seinen Bedingungen, kurz */
export function angebotKurz(a, jetztMs = Date.now()) {
  const extra = [a.nurMitApp ? 'mit App' : '', a.gueltigAb && Date.parse(a.gueltigAb) > jetztMs ? `ab ${zeitpunktText(a.gueltigAb)}` : ''].filter(Boolean);
  return `${a.shop} hat ${euroKurz(a.preis)}${extra.length ? ` (${extra.join(', ')})` : ''}`;
}

/**
 * Antwort auf „Ist das der Tiefstpreis?“ – aus ALLEN aktuellen Angeboten (auch denen mit unklarer Packungsgröße)
 * und dem eigenen Verlauf. marktguru liefert keinen Preisverlauf, also ist die Antwort am Anfang ehrlich „unbekannt“.
 * Ist ein anderes Angebot im Ganzen billiger, aber seine Packungsgröße unklar, ist die Antwort nie „ja“ und nie
 * „Einziges Angebot“, sondern nennt dieses Angebot.
 * -> { status: 'ja'|'nein'|'unbekannt', text, heuteGuenstigstes, tage, tiefst30, anzahl, anzahlSicher }
 */
export function tiefstInfo({ bestes, sichere, angebote = sichere, stats, tiefst30, basis, cfg, jetztMs = Date.now() }) {
  const tage = stats.tage || 0;
  const label = BASIS_LABEL[basis] || '';
  // unplausible Treffer (eher ein anderes Produkt) zählen nicht mit
  const glaubhaft = angebote.filter(a => !a.unsicher);
  const res = { status: 'unbekannt', text: '', heuteGuenstigstes: false, tage, tiefst30: tiefst30?.p ?? null, anzahl: glaubhaft.length, anzahlSicher: sichere.length };
  if (!bestes) {
    res.text = tiefst30 ? `Gerade kein Angebot · zuletzt ${euroKurz(tiefst30.p)} ${label} am ${tagKurz(tiefst30.tag)}` : 'Gerade kein Angebot';
    return res;
  }
  if (bestes.unsicher || bestes.mengeSicher === false) {
    res.text = 'Packungsgröße unklar – Preis pro Stück/100 g nicht sicher';
    return res;
  }
  const unklar = glaubhaft.filter(a => a !== bestes && a.mengeSicher !== true);
  const billigerUnklar = unklar.filter(a => a.preis < bestes.preis - 0.005).sort((x, y) => x.preis - y.preis);
  res.heuteGuenstigstes = sichere[0] === bestes && !billigerUnklar.length;
  // „gefunden“: geprüft sind nur die Prospekte bei marktguru und mydealz, nicht jedes Angebot überall
  const vergleich = glaubhaft.length <= 1 ? `Einziges gefundenes Angebot ${wo(glaubhaft)}`
    : !unklar.length ? `Günstigstes von ${glaubhaft.length} gefundenen Angeboten ${wo(glaubhaft)}`
    : sichere.length <= 1 ? `Einziges gefundenes Angebot mit bekannter Packungsgröße ${wo(sichere)}`
    : `Günstigstes von ${sichere.length} gefundenen Angeboten mit bekannter Packungsgröße`;
  const verlauf = tage <= 0 ? 'noch kein Preisverlauf' : tage === 1 ? 'Verlauf erst seit 1 Tag' : `Verlauf erst seit ${tage} Tagen`;
  if (tiefst30 && tiefst30.p < bestes.einheitspreis - 0.005) {
    res.status = 'nein';
    res.text = `Schon günstiger gesehen: ${euroKurz(tiefst30.p)} ${label} am ${tagKurz(tiefst30.tag)}${tiefst30.shop ? ` bei ${tiefst30.shop}` : ''}`;
    return res;
  }
  if (billigerUnklar.length) {
    res.text = `${angebotKurz(billigerUnklar[0], jetztMs)} – Packungsgröße dort nicht sicher`;
    return res;
  }
  if (tage >= cfg.deal.historieMinTage) {
    res.status = 'ja';
    res.text = `${vergleich} · so günstig wie nie in ${Math.min(tage, 30)} Tagen`;
    return res;
  }
  res.text = `${vergleich} · ${verlauf}`;
  return res;
}

// Shipping for online offers: Amazon threshold, otherwise free only if the deal says so.
export function versandkosten(angebot, cfg) {
  if (!angebot.online) return 0;
  if (angebot.versand != null) return angebot.versand;
  const shop = norm(angebot.shop);
  const text = norm(`${angebot.titel} ${angebot.beschreibung || ''}`);
  if (/versandkostenfrei|kostenlose[rn]? versand|gratis versand|versand kostenlos|vsk frei|vsk kostenlos|free shipping|abholung|inkl versand/.test(text)) return 0;
  if (shop.includes('amazon')) {
    if (cfg.versand.amazonPrime) return 0;
    return angebot.preis >= cfg.versand.amazonKostenlosAb ? 0 : cfg.versand.amazonKosten;
  }
  return cfg.versand.standardKosten;
}

// "statt 299 €", "UVP 299,99", "Vergleichspreis 249€" (ohne Versand-, Prozent- und Spannen-Fehltreffer)
export function altpreisAus(text, preis) {
  return vorherAusText(text, '', preis)?.wert ?? null;
}
export function prozentAus(text) {
  const m = String(text || '').match(/-\s?(\d{2})\s?%/);
  return m ? Number(m[1]) / 100 : null;
}

export function istTechnik(text, woerter) {
  const t = ' ' + norm(text) + ' ';
  return woerter.some(w => {
    const n = norm(w);
    return n.length <= 3 ? new RegExp(`(^|[^a-z])${n}([^a-z]|$)`).test(t) : t.includes(n);
  });
}

/**
 * Electronics: price errors from the mydealz "Preisfehler" group, the word "Preisfehler", or >= 60 % below the
 * old price. seite = geprüfte Deal-Seite (Vergleichspreis von mydealz hat Vorrang vor dem Text).
 * -> null oder { deal, preis, preisVorher, vorherQuelle, ersparnisEuro, ersparnisProzent, ersparnis, grund, preisfehler }
 */
export function technikBewertung(eintrag, technik, cfg, seite = null) {
  if (!istTechnik(eintrag.titel, technik.woerter)) return null;
  const preis = seite?.preis ?? eintrag.preis;
  if (!(preis > 0)) return null;
  let vorher = null, quelle = null;
  if (seite?.vergleichspreis > preis) { vorher = seite.vergleichspreis; quelle = 'Vergleichspreis laut mydealz'; }
  else if (eintrag.preisAlt > preis) { vorher = eintrag.preisAlt; quelle = eintrag.vorherQuelle || 'früherer Preis'; }
  else {
    const t = vorherAusText(eintrag.titel, eintrag.beschreibung, preis);
    if (t) { vorher = t.wert; quelle = t.quelle; }
  }
  const vj = vorherJetzt(preis, vorher, quelle);
  const rabatt = vj.preisVorher ? round(1 - preis / vj.preisVorher, 3) : prozentAus(eintrag.titel);
  const preisfehler = !!eintrag.preisfehlerFeed || /preisfehler/i.test(eintrag.titel);
  if (!preisfehler && !(rabatt != null && rabatt >= cfg.deal.technikRabattMin)) return null;
  const pz = rabatt != null ? Math.round(rabatt * 100) : null;
  return {
    deal: true, preis, ...vj, ersparnis: rabatt, preisfehler,
    grund: preisfehler ? (pz != null ? `Preisfehler, ${pz} % unter ${vj.preisVorher ? 'Vergleichspreis' : 'Normalpreis'}` : 'Preisfehler gemeldet')
      : `${pz} % unter Vergleichspreis`,
  };
}
