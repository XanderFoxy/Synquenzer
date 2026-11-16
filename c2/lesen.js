// Feinschliff – Lesen: Text und Aufgaben (schmal: umschaltbar, breit: nebeneinander), weiche Zeitangabe wie in der Prüfung.
import { esc } from './speicher.js';
import { SYM } from './symbole.js';
import { lade, liste } from './daten.js';
import { einst } from './konto.js';
import { kopf } from './app.js';
import { aufgabenBlock, modusLeiste } from './block.js';

// Absätze: „## …“ = Zwischentitel, „[Lücke N]“ = Platzhalter, „A) …“ = Baustein; sonst nummeriert (Belege in den Lösungen nennen „Absatz N“)
function absaetze(t) {
  const l = String(t || '').split(/\n\s*\n|\n/).map((x) => x.trim()).filter(Boolean);
  const normal = (p) => !/^## /.test(p) && !/^\[Lücke \d+\]$/.test(p) && !/^[A-H]\) /.test(p);
  const nummern = !l.some((p) => /^## /.test(p)) && l.filter(normal).length > 1; let n = 0;
  return l.map((p) => {
    if (/^## /.test(p)) return `<h3 class="abschnitt-titel">${esc(p.slice(3))}</h3>`;
    const g = p.match(/^\[(Lücke \d+)\]$/); if (g) return `<p class="luecke-platz">${esc(g[1])}</p>`;
    const b = p.match(/^([A-H])\) (.*)$/); if (b) return `<p class="baustein"><b>${b[1]}</b> ${esc(b[2])}</p>`;
    return nummern ? `<p data-n="${++n}">${esc(p)}</p>` : `<p>${esc(p)}</p>`;
  }).join('');
}
function quelleHtml(q) {
  if (!q) return '';
  if (typeof q === 'string') return `<p class="quelle">${esc(q)}</p>`;
  const link = q.link || q.url; const teile = [q.autor, q.werk, q.jahr, q.stelle].filter(Boolean).map(esc).join(', ');
  return `<p class="quelle">${teile}${q.hinweis ? ` · ${esc(q.hinweis)}` : ''}${link ? ` · <a href="${esc(link)}" target="_blank" rel="noopener noreferrer">gemeinfreie Quelle</a>` : ''}</p>`;
}
export async function seite(view, id, opt = {}) {
  const e = (await liste('lesen')).find((x) => x.id === id);
  if (!e) { view.innerHTML = `${kopf('Lesen', '#/bereich/lesen', 'lesen')}<p class="karte">Text nicht gefunden.</p>`; return; }
  const d = await lade(e.datei); let modus = opt.modus || einst().modus; let uhr = null; const zeitMin = opt.zeit_min || d.zeit_min || 10;
  const zurueck = opt.zurueck || '#/bereich/lesen';
  function zeichne() {
    clearInterval(uhr);
    view.innerHTML = `${kopf(d.titel, zurueck, 'lesen')}<div class="bereich-seite lesen-seite" data-bereich="lesen">
      <div class="lesen-leiste">${opt.modus ? '' : modusLeiste(modus)}<span class="uhr-chip" data-uhr>${SYM.uhr} ${zeitMin}:00</span></div>
      <div class="segment nur-schmal" data-tabs><button data-tab="text" aria-pressed="true">Text</button><button data-tab="aufgaben" aria-pressed="false">Aufgaben (${(d.aufgaben || []).length})</button></div>
      <div class="lesen-raster" data-zeige="text">
        <article class="karte lesetext ${d.art === 'Literatur' ? 'literatur' : ''}"><span class="ueber">${esc(d.teil || d.untertitel || d.art || '')}</span><h2>${esc(d.titel)}</h2>${absaetze(d.text)}${quelleHtml(d.quelle)}</article>
        <div class="lesen-aufgaben" data-aufgaben></div></div></div>`;
    view.querySelector('.lesen-leiste .segment')?.addEventListener('click', (ev) => { const b = ev.target.closest('[data-modus]'); if (!b) return; modus = b.dataset.modus; zeichne(); });
    view.querySelector('[data-tabs]').addEventListener('click', (ev) => { const b = ev.target.closest('[data-tab]'); if (!b) return; view.querySelector('.lesen-raster').dataset.zeige = b.dataset.tab; view.querySelectorAll('[data-tab]').forEach((x) => x.setAttribute('aria-pressed', x === b)); window.scrollTo({ top: 0 }); });
    aufgabenBlock(view.querySelector('[data-aufgaben]'), d.aufgaben || [], { modus, bereich: 'lesen', id: d.id, onAbgabe: (r) => { clearInterval(uhr); opt.onAbgabe?.(r); } });
    let rest = zeitMin * 60; const chip = view.querySelector('[data-uhr]');
    uhr = setInterval(() => { if (!chip.isConnected) return clearInterval(uhr); rest--; chip.innerHTML = rest > 0 ? `${SYM.uhr} ${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, '0')}` : `${SYM.uhr} Zeit um – in Ruhe zu Ende lesen`; if (rest <= 0) { chip.classList.add('vorbei'); clearInterval(uhr); } }, 1000);
  }
  zeichne();
}
