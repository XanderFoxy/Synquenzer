// Feinschliff – Aufgabenblock für Hören und Lesen: alle Aufgaben auf einer Seite, Abgabe am Ende.
// Üben: jede Aufgabe meldet sofort richtig/falsch. Prüfung: Korrektur erst nach „Abgeben“, mit Übersicht.
import { esc, speicher, tag } from './speicher.js';
import { SYM } from './symbole.js';
import { zeichneUebung, auswerten } from './ueben.js';
import { wunschLink } from './wunsch-link.js';
import { vermerke } from './wiederholung.js';
import { buche, einheit } from './konto.js';

export function aufgabenBlock(el, aufgaben, { modus, bereich, id, onAbgabe }) {
  const pool = `${bereich}/${id}`; const gebucht = new Set(); let abgegeben = false;
  el.innerHTML = `<div class="ergebnis-box" hidden></div><ol class="aufgaben">${aufgaben.map((u, i) => `<li class="karte${u.nur_training ? ' training' : ''}" data-i="${i}" data-uid="${esc(pool + '/' + u.id)}">${u.nur_training ? '<span class="ueber">Training</span>' : ''}</li>`).join('')}</ol>
    <button class="knopf haupt breit" data-abgeben>${modus === 'pruefung' ? 'Abgeben' : 'Fertig – Lösungen und Text zeigen'}</button>`;
  const buchen = (i, erg) => { if (gebucht.has(i)) return; gebucht.add(i); const u = aufgaben[i]; vermerke(`${pool}/${u.id}`, pool, erg.richtig); buche({ bereich, thema: pool, richtig: erg.richtig }); };
  const ctrls = aufgaben.map((u, i) => {
    const li = el.querySelector(`li[data-i="${i}"]`); const box = document.createElement('div'); li.append(box);
    return zeichneUebung(u, box, { modus, onFertig: (erg) => buchen(i, erg) });
  });
  el.querySelector('[data-abgeben]').addEventListener('click', (ev) => {
    if (abgegeben) return; abgegeben = true; ev.target.remove();
    let richtig = 0;
    ctrls.forEach((c, i) => {
      const erg = auswerten(c.u, c.antwort()); if (erg.richtig) richtig++;
      if (!c.fertig) c.zeige(erg); buchen(i, erg);
    });
    const quote = Math.round((richtig / aufgaben.length) * 100);
    const box = el.querySelector('.ergebnis-box'); box.hidden = false;
    box.innerHTML = `<div class="ergebnis-kopf"><div class="ring" style="--w:${quote}">${quote} %</div><div><h3>${richtig} von ${aufgaben.length} richtig</h3><p class="leise">+${richtig * 10} Punkte${modus === 'pruefung' ? ` · ${quote >= 60 ? 'Prüfungsziel (60 %) erreicht' : 'Ziel in der Prüfung: 60 %'}` : ''}</p></div></div>${wunschLink(pool.split('/')[0])}`;
    speicher.aendere('erledigt', {}, (x) => { x[pool] = tag(); });
    einheit();
    box.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    onAbgabe?.({ richtig, gesamt: aufgaben.length, quote });
  });
  return { get abgegeben() { return abgegeben; } };
}
export const modusLeiste = (m) => `<div class="segment" role="group" aria-label="Modus"><button data-modus="ueben" aria-pressed="${m === 'ueben'}">Üben <small>sofort Rückmeldung</small></button><button data-modus="pruefung" aria-pressed="${m === 'pruefung'}">Prüfung <small>Korrektur am Ende</small></button></div>`;
export const SYM_SCHLOSS = SYM.schloss;
