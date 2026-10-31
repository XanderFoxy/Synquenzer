// Push via ntfy (JSON publishing, so umlauts and € are safe). One message per new deal, deduplicated via sent.json.
import { BASIS_LABEL, euroKurz, zeitpunktText } from './text.mjs';

export function dedupeKey(d) {
  return [d.id, (d.shop || '').toLowerCase(), d.preis?.toFixed(2), d.gueltigBis || d.link || ''].join('|');
}

const prozentText = p => `−${p} %`;
function alterText(iso, jetztMs) {
  const h = (jetztMs - Date.parse(iso)) / 36e5;
  if (!Number.isFinite(h)) return '';
  if (h < 1) return `gemeldet vor ${Math.max(1, Math.round(h * 60))} Min.`;
  return `gemeldet vor ${Math.round(h)} Std.`;
}

/** Text für Preisfehler: „vorher 199,99 € → jetzt 15,95 € (−92 %)“ bzw. ohne bekannten Vorher-Preis „jetzt 165,00 €“. */
export function vorherJetztText(d) {
  if (d.preisVorher > d.preis) return `vorher ${euroKurz(d.preisVorher)} → jetzt ${euroKurz(d.preis)} (${prozentText(d.ersparnisProzent)})`;
  return `jetzt ${euroKurz(d.preis)} · Vorher-Preis unbekannt`;
}

export function nachricht(d, cfg, jetztMs = Date.now()) {
  const zeilen = [];
  if (d.typ === 'technik') {
    zeilen.push(vorherJetztText(d));
    const versand = d.versandInklusive ? 'inkl. Versand' : d.versand > 0 ? `+ ${euroKurz(d.versand)} Versand` : '';
    zeilen.push([`bei ${d.shop}`, versand, d.vorherQuelle ? `vorher = ${d.vorherQuelle}` : '', d.datum ? alterText(d.datum, jetztMs) : ''].filter(Boolean).join(' · '));
    zeilen.push(d.titel);
  } else {
    const label = BASIS_LABEL[d.basis];
    zeilen.push(`${euroKurz(d.preis)} bei ${d.shop}${d.packung ? ` · ${d.packung}` : ''}${d.online ? ` (inkl. ${euroKurz(d.versand || 0)} Versand)` : ''}`);
    // „465 ml oder 4 × 100 ml“: sagen, für welche Packung der Preis gilt (der Prospekt rechnet oft mit der anderen)
    const v = d.einheitspreisVarianten;
    const bei = v?.length > 1 ? ` (bei ${v[0].packung}; ${v[1].packung}: ${euroKurz(v[1].einheitspreis)})` : '';
    // Kontext statt Schätzung: „Tiefst 12 Mon. 2,49 € (Kaufland, Okt. 2026) · üblich 2,79 € · statt regulär 3,49 € (−20 %)“
    if (d.kontextText) zeilen.push(d.kontextText);
    zeilen.push(`${euroKurz(d.einheitspreis)} ${label}${bei}${d.grund ? ` – ${d.grund}` : ''}`);
    if (d.startetSpaeter && d.gueltigAb) zeilen.push(`gilt ab ${zeitpunktText(d.gueltigAb)}${d.gueltigBis ? ` bis ${zeitpunktText(d.gueltigBis)}` : ''}`);
    else if (d.gueltigBis) zeilen.push(`gültig bis ${zeitpunktText(d.gueltigBis)}`);
    zeilen.push(d.titel);
  }
  return {
    topic: cfg.ntfy.topic,
    // gemeldeter Preisfehler vs. großer Technik-Rabatt – wie auf der Seite beschriftet
    title: d.typ === 'technik' ? `${d.preisfehler === false ? 'Technik-Deal: ' : 'Preisfehler? '}${d.titel}`.slice(0, 120) : `Schnäppchen: ${d.name}`,
    message: zeilen.filter(Boolean).join('\n'),
    click: d.link,
    // höchste Stufe: Preisfehler oder so günstig wie das 12-Monats-Tief
    priority: d.typ === 'technik' || d.neuesTief ? 5 : 4,
    tags: d.typ === 'technik' ? ['rotating_light'] : ['shopping_cart'],
    actions: [
      { action: 'view', label: 'Zum Angebot', url: d.link, clear: true },
      { action: 'view', label: 'Alle Schnäppchen', url: cfg.seite },
    ],
  };
}

export async function senden(msgs, cfg, { dryRun, log = console.log } = {}) {
  const ergebnisse = [];
  for (const m of msgs) {
    if (dryRun) { log(`[dry-run] ntfy: ${m.title} – ${m.message.split('\n')[0]}`); ergebnisse.push(true); continue; }
    try {
      const r = await fetch(cfg.ntfy.server, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(m) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      ergebnisse.push(true);
    } catch (e) { log(`ntfy fehlgeschlagen: ${e.message}`); ergebnisse.push(false); }
  }
  return ergebnisse;
}
