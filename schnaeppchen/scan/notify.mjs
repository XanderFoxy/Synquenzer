// Push via ntfy (JSON publishing, so umlauts and € are safe). One message per new deal, deduplicated via sent.json.
import { BASIS_LABEL } from './text.mjs';

export const euro = v => (v == null ? '–' : v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: v < 1 ? 3 : 2 }).replace(/(\d),(\d\d)0(\s)/, '$1,$2$3'));

export function dedupeKey(d) {
  return [d.id, (d.shop || '').toLowerCase(), d.preis?.toFixed(2), d.gueltigBis || d.link || ''].join('|');
}

export function nachricht(d, cfg) {
  const zeilen = [];
  if (d.typ === 'technik') {
    zeilen.push(`${euro(d.preis)} bei ${d.shop}${d.preisAlt ? ` statt ${euro(d.preisAlt)}` : ''}`);
    zeilen.push(d.grund);
    zeilen.push(d.titel);
  } else {
    zeilen.push(`${euro(d.preis)} bei ${d.shop}${d.online ? ` (inkl. ${euro(d.versand || 0)} Versand)` : ''}`);
    zeilen.push(`${euro(d.einheitspreis)} ${BASIS_LABEL[d.basis]} – normal ${euro(d.normalpreis)} (${d.grund})`);
    if (d.tiefstpreis != null) zeilen.push(`Tiefstpreis bisher: ${euro(d.tiefstpreis)} ${BASIS_LABEL[d.basis]}`);
    if (d.gueltigBis) zeilen.push(`gültig bis ${new Date(d.gueltigBis).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' })}`);
    zeilen.push(d.titel);
  }
  return {
    topic: cfg.ntfy.topic,
    title: d.typ === 'technik' ? `Preisfehler? ${d.titel}`.slice(0, 120) : `Schnäppchen: ${d.name}`,
    message: zeilen.filter(Boolean).join('\n'),
    click: d.link,
    priority: d.typ === 'technik' || (d.ersparnis ?? 0) >= 0.4 ? 5 : 4,
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
