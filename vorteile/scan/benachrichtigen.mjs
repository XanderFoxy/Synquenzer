// Zwei Stufen: "Sofort" (wenige, wirklich seltene Chancen) und eine tägliche Zusammenfassung für den Rest.
// Strenges Dedupe: jeder Eintrag (id und ähnlicher Titel) wird höchstens einmal gemeldet. Tageslimit für Sofort-Pushes.
import { schluessel } from './lib/text.mjs';

export const KATEGORIEN = {
  deals: 'Deals', erleben: 'Erleben', reisen: 'Reisen', musik: 'Musik', nebenverdienst: 'Nebenverdienst', tests: 'Tests & Gewinnspiele',
  praemien: 'Prämien & Freunde werben',
};

export function berlin(jetzt) {
  const f = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' });
  const p = Object.fromEntries(f.formatToParts(new Date(jetzt)).map(x => [x.type, x.value]));
  return { tag: `${p.year}-${p.month}-${p.day}`, stunde: Number(p.hour) };
}

const titelKey = e => 't' + schluessel(e.titel.slice(0, 50));
const schonGemeldet = (e, gemeldet) => gemeldet[e.id] || gemeldet[titelKey(e)];

export function sofortNachricht(e, cfg) {
  return {
    topic: cfg.ntfy.topic,
    title: `${KATEGORIEN[e.kategorie] || 'Vorteil'}: ${e.titel}`.slice(0, 140),
    message: [e.zeile, `So geht's: ${e.soGehts}`].filter(Boolean).join('\n'),
    click: e.link, priority: 4, tags: ['sparkles'],
    actions: [{ action: 'view', label: 'Öffnen', url: e.link, clear: true }, { action: 'view', label: 'Alle Vorteile', url: cfg.seite }],
  };
}

export function digestNachricht(liste, cfg) {
  const max = cfg.ntfy.digestMaxZeilen ?? 12;
  const zeilen = liste.slice(0, max).map(e => `• ${KATEGORIEN[e.kategorie] || ''}: ${e.titel}${e.zeile ? ` – ${e.zeile}` : ''}`);
  if (liste.length > max) zeilen.push(`… und ${liste.length - max} weitere auf der Seite`);
  return {
    topic: cfg.ntfy.topic, title: `Deine Vorteile heute: ${liste.length} neu`, message: zeilen.join('\n'),
    click: cfg.seite, priority: 3, tags: ['sunny'], actions: [{ action: 'view', label: 'Alle ansehen', url: cfg.seite }],
  };
}

/**
 * Plant die Pushes dieses Laufs. zustand = { gemeldet: {key: iso}, sofortTage: {tag: anzahl}, digestTag }
 * modus: 'auto' (stündlich; Digest einmal ab digestStunde), 'digest' (Digest jetzt erzwingen), 'still' (nichts senden)
 */
export function plane({ eintraege, zustand, cfg, jetzt, modus = 'auto' }) {
  const { tag, stunde } = berlin(jetzt);
  const gemeldet = zustand.gemeldet || {};
  const neu = eintraege.filter(e => !schonGemeldet(e, gemeldet));
  // dieselbe Sache aus zwei Quellen -> einmal
  const einmal = [];
  const tk = new Set();
  for (const e of [...neu].sort((a, b) => b.wert - a.wert)) { const k = titelKey(e); if (!tk.has(k)) { tk.add(k); einmal.push(e); } }

  const schonHeute = zustand.sofortTage?.[tag] || 0;
  const frei = Math.max(0, (cfg.ntfy.maxSofortProTag ?? 3) - schonHeute);
  const sofort = modus === 'still' ? [] : einmal.filter(e => e.sofort).slice(0, frei);
  const rest = einmal.filter(e => !sofort.includes(e));

  const digestFaellig = modus === 'digest' || (modus === 'auto' && stunde >= (cfg.ntfy.digestStunde ?? 18) && zustand.digestTag !== tag);
  const digest = digestFaellig && rest.length ? rest : [];
  return {
    tag,
    sofort: sofort.map(e => ({ e, msg: sofortNachricht(e, cfg) })),
    digest: digest.length ? { liste: digest, msg: digestNachricht(digest, cfg) } : null,
    digestFaellig,
  };
}

/** Einträge als schon gemeldet markieren (ohne Push), z. B. beim ersten Lauf eines neuen Moduls. */
export function alsGemeldet(zustand, eintraege, jetzt) {
  const iso = new Date(jetzt).toISOString();
  zustand.gemeldet ||= {};
  for (const e of eintraege) { zustand.gemeldet[e.id] = iso; zustand.gemeldet[titelKey(e)] = iso; }
  return zustand;
}

/** Nach dem Senden: Zustand fortschreiben (nur wirklich gesendete Einträge gelten als gemeldet). */
export function verbuche(zustand, plan, ok, jetzt) {
  const iso = new Date(jetzt).toISOString();
  zustand.gemeldet ||= {};
  zustand.sofortTage ||= {};
  plan.sofort.forEach((s, i) => {
    if (!ok.sofort[i]) return;
    zustand.gemeldet[s.e.id] = iso; zustand.gemeldet[titelKey(s.e)] = iso;
    zustand.sofortTage[plan.tag] = (zustand.sofortTage[plan.tag] || 0) + 1;
  });
  if (plan.digest && ok.digest) for (const e of plan.digest.liste) { zustand.gemeldet[e.id] = iso; zustand.gemeldet[titelKey(e)] = iso; }
  if (plan.digestFaellig && (ok.digest || !plan.digest)) zustand.digestTag = plan.tag;
  // aufräumen: 60 Tage merken
  const grenze = new Date(new Date(jetzt).getTime() - 60 * 864e5).toISOString();
  for (const [k, v] of Object.entries(zustand.gemeldet)) if (v < grenze) delete zustand.gemeldet[k];
  for (const t of Object.keys(zustand.sofortTage)) if (t < grenze.slice(0, 10)) delete zustand.sofortTage[t];
  return zustand;
}

export async function sende(msg, cfg, { dryRun, token, log = console.log, fetchImpl = globalThis.fetch } = {}) {
  if (dryRun) { log(`[dry-run] ntfy: ${msg.title} – ${msg.message.split('\n')[0]}`); return true; }
  try {
    const headers = { 'content-type': 'application/json' };
    if (token) headers.authorization = `Bearer ${token}`;
    const r = await fetchImpl(cfg.ntfy.server, { method: 'POST', headers, body: JSON.stringify(msg) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return true;
  } catch (e) { log(`ntfy fehlgeschlagen: ${e.message}`); return false; }
}
