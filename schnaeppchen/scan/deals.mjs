// Deal decision for watch items and electronics price errors.
import { norm, parsePrice, round } from './text.mjs';

// Reference price: history median once there is enough data, else the estimate from watchlist.json.
export function referenz(item, stats, cfg) {
  if (item.normalpreisFest && item.normalpreis) return { p: item.normalpreis, quelle: 'fest' };
  if (stats.normal != null && stats.tage >= cfg.deal.historieMinTage) return { p: round(stats.normal, 3), quelle: 'historie' };
  if (item.normalpreis) return { p: item.normalpreis, quelle: 'schaetzung' };
  if (stats.normal != null) return { p: round(stats.normal, 3), quelle: 'historie-kurz' };
  return { p: null, quelle: 'unbekannt' };
}

export function bewerte(angebot, ref, stats, cfg) {
  const up = angebot.einheitspreis;
  const res = { deal: false, ersparnis: null, grund: '' };
  if (!(up > 0)) return res;
  if (ref.p > 0) res.ersparnis = round(1 - up / ref.p, 3);
  if (res.ersparnis != null && res.ersparnis >= cfg.deal.rabattMin) {
    res.deal = true;
    res.grund = `${Math.round(res.ersparnis * 100)} % unter Normalpreis`;
  }
  const t = stats.tiefst;
  if (t && stats.punkte >= cfg.deal.tiefstpreisMinPunkte && up <= t.p + 1e-9 &&
      (res.ersparnis ?? 0) >= cfg.deal.tiefstpreisMinRabatt) {
    res.deal = true;
    res.grund = res.grund ? `${res.grund}, Tiefstpreis` : 'auf Tiefstpreis';
  }
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

// "statt 299 €", "UVP 299,99", "(-87%)", "Vergleichspreis 249€"
export function altpreisAus(text) {
  const t = String(text || '');
  const m = t.match(/(?:statt|uvp|vergleichspreis|vgp|sonst|regul[aä]r|normalpreis)[:\s]*(?:ca\.?\s*)?(\d[\d.]*(?:,\d{1,2})?)\s*(?:€|eur|euro)?/i);
  if (m) return parsePrice(m[1]);
  return null;
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

// Electronics: price errors from the mydealz "Preisfehler" group, the word "Preisfehler", or >= 60 % below the stated old price.
export function technikBewertung(eintrag, technik, cfg) {
  const text = `${eintrag.titel} ${eintrag.beschreibung || ''}`;
  if (!istTechnik(eintrag.titel, technik.woerter)) return null;
  const preis = eintrag.preis;
  const alt = eintrag.preisAlt ?? altpreisAus(text);
  let rabatt = alt && preis ? 1 - preis / alt : prozentAus(eintrag.titel);
  rabatt = rabatt != null ? round(rabatt, 3) : null;
  const preisfehler = eintrag.preisfehlerFeed || /preisfehler/i.test(eintrag.titel);
  if (preisfehler || (rabatt != null && rabatt >= cfg.deal.technikRabattMin)) {
    return {
      deal: true,
      ersparnis: rabatt,
      grund: preisfehler ? (rabatt ? `Preisfehler, ${Math.round(rabatt * 100)} % unter Normalpreis` : 'Preisfehler gemeldet')
        : `${Math.round(rabatt * 100)} % unter Normalpreis`,
      preisAlt: alt ?? null,
    };
  }
  return null;
}
