// Deal decision for watch items and electronics price errors.
import { norm, round, euroKurz, zeitpunktText, BASIS_LABEL } from './text.mjs';
import { vorherAusText, vorherJetzt } from './preisfehler.mjs';

const tagKurz = tag => { const [, m, d] = String(tag).split('-'); return `${d}.${m}.`; };
function wo(angebote) {
  const laden = angebote.some(a => !a.online && !a.regional), online = angebote.some(a => a.online);
  const region = angebote.some(a => a.regional);
  const teile = [laden ? 'in deiner Nähe' : '', online ? 'online' : '', region && !laden ? 'in der Region' : ''].filter(Boolean);
  return teile.length > 1 ? `${teile.slice(0, -1).join(', ')} und ${teile.at(-1)}` : teile[0] || 'in deiner Nähe';
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
export function tiefstInfo({ bestes, sichere, angebote = sichere, stats, tiefst30, zuletzt = null, basis, cfg, jetztMs = Date.now() }) {
  const tage = stats.tage || 0;
  const label = BASIS_LABEL[basis] || '';
  // unplausible Treffer (eher ein anderes Produkt) zählen nicht mit
  const glaubhaft = angebote.filter(a => !a.unsicher);
  const res = { status: 'unbekannt', text: '', heuteGuenstigstes: false, tage, tiefst30: tiefst30?.p ?? null, anzahl: glaubhaft.length, anzahlSicher: sichere.length };
  if (!bestes) {
    // „Gerade kein Angebot · zuletzt 2,79 € (15 Stück) bei Kaufland am 31.10.“ (eigener Verlauf) bzw.
    // „… · zuletzt gesehen 1,49 € (500 g) bei Kaufland, Feb. 2026“ (Recherche) – nie nur „gibt es nicht“
    const pk = z => (z.packung ? ` (${z.packung})` : '');
    res.text = zuletzt?.eigen ? `Gerade kein Angebot · zuletzt ${euroKurz(zuletzt.pack)}${pk(zuletzt)} bei ${zuletzt.shop} am ${tagKurz(zuletzt.tag)}`
      : zuletzt ? `Gerade kein Angebot · zuletzt gesehen ${euroKurz(zuletzt.pack)}${pk(zuletzt)} bei ${zuletzt.shop}, ${zuletzt.monat}`
      : tiefst30 ? `Gerade kein Angebot · zuletzt ${euroKurz(tiefst30.p)} ${label} am ${tagKurz(tiefst30.tag)}` : 'Gerade kein Angebot';
    return res;
  }
  if (bestes.unsicher || bestes.mengeSicher === false) {
    res.text = 'Packungsgröße unklar – Preis pro Stück/100 g nicht sicher';
    return res;
  }
  const unklar = glaubhaft.filter(a => a !== bestes && a.mengeSicher !== true);
  const billigerUnklar = unklar.filter(a => a.preis < bestes.preis - 0.005).sort((x, y) => x.preis - y.preis);
  res.heuteGuenstigstes = sichere[0] === bestes && !billigerUnklar.length;
  // „gefunden“: geprüft sind die Prospekte bei marktguru (Döbeln) und kaufDA (Region) sowie mydealz, nicht jedes Angebot überall
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
