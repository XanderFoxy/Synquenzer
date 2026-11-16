// Feinschliff – Videos & Links aus daten/ressourcen.json und KI-Vorlagen aus daten/vorlagen.json.
// Format ressourcen.json: [ { name, link, bereich, warum, quelle_empfehlung, kostenlos, art? } ] (älter: { kategorien: [ { titel, eintraege: [ { titel, url, art, warum } ] } ] })
import { esc } from './speicher.js';
import { SYM } from './symbole.js';
import { lade } from './daten.js';
import { kopf, kopiereVorlage } from './app.js';

function kategorien(r) {
  if (Array.isArray(r?.kategorien)) return r.kategorien;
  const l = Array.isArray(r) ? r : r?.eintraege || []; const m = new Map();
  for (const e of l) { const k = e.kategorie || e.bereich || 'Empfehlungen'; if (!m.has(k)) m.set(k, []); m.get(k).push({ ...e, titel: e.titel || e.name, url: e.url || e.link }); }
  return [...m].map(([titel, eintraege]) => ({ titel, eintraege }));
}
const sicher = (u) => (/^https:\/\//.test(String(u)) ? String(u) : '#');
export async function seite(view) {
  view.innerHTML = `${kopf('Videos & Links', '#/mehr')}<p class="laden">Lädt …</p>`;
  let r = null, v = null; try { r = await lade('ressourcen.json'); } catch { /* fehlt noch */ } try { v = await lade('vorlagen.json'); } catch { /* fehlt noch */ }
  const kat = kategorien(r);
  view.innerHTML = `${kopf('Videos & Links', '#/mehr')}<div class="bereich-seite">
    <p class="einleitung">Ausgewählt nach Erfahrungsberichten anderer Lernender. Links öffnen sich außerhalb der App.</p>
    ${kat.map((k) => `<section><h3 class="zwischen">${esc(k.titel)}</h3>${k.text ? `<p class="leise">${esc(k.text)}</p>` : ''}<ul class="links">${(k.eintraege || []).map((e) => `<li class="karte"><div class="l-kopf"><span class="chip">${esc(e.art || 'Link')}</span>${e.niveau ? `<span class="chip leise">${esc(e.niveau)}</span>` : ''}${e.sprache ? `<span class="chip leise">${esc(e.sprache)}</span>` : ''}</div><b>${esc(e.titel)}</b>${e.warum ? `<p class="leise">${esc(e.warum)}</p>` : ''}${e.quelle_empfehlung ? `<p class="leise klein">Empfohlen in: ${esc(e.quelle_empfehlung)}</p>` : ''}${e.kostenlos ? `<p class="leise klein">Kostenlos: ${esc(e.kostenlos)}</p>` : ''}<a class="knopf zweit" href="${esc(sicher(e.url))}" target="_blank" rel="noopener noreferrer">${SYM.link} Öffnen</a></li>`).join('')}</ul></section>`).join('') || '<p class="karte">Die Empfehlungen folgen.</p>'}
    ${v ? `<h3 class="zwischen">Vorlagen für die Claude-App</h3><ul class="links">${Object.entries(v).filter(([, x]) => x?.text).map(([k, x]) => `<li class="karte"><b>${esc(x.titel || k)}</b>${x.wozu ? `<p class="leise">${esc(x.wozu)}</p>` : ''}<button class="knopf zweit" data-vorlage="${esc(k)}">${SYM.kopie} Vorlage kopieren</button></li>`).join('')}</ul>` : ''}</div>`;
  view.addEventListener('click', (ev) => { const b = ev.target.closest('[data-vorlage]'); if (b) kopiereVorlage(b, b.dataset.vorlage, {}); });
}
