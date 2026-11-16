// 020-ziele: Achtsamkeitsminuten in Health über einen Kurzbefehl (recherche/technik.md Teil 3).
// 021 K2: Aktionsname laut Kurzbefehle-Hilfe DE „Health-Messung protokollieren“ (QUELLEN.md R01). Eine Web-App kann nicht selbst in Health schreiben. Der Kurzbefehl „Atem-Minuten“ trägt nur die Minuten ein; nichts wird verschickt.
import { speicher } from './speicher.js';
import { stil, healthLink } from './ziele.js';

// gezeichnete Mini-Bilder (keine Bildschirmfotos fremder Apps): Telefon-Rahmen mit einem Merkmal je Schritt
const tel = (innen) => `<svg class="zl-bild" viewBox="0 0 72 72" aria-hidden="true"><rect x="18" y="4" width="36" height="64" rx="7" fill="var(--zl-fl3)" stroke="var(--zl-li)"/>${innen}</svg>`;
const BILD = [
  tel('<circle cx="46" cy="14" r="5" fill="var(--zl-ein)"/><path d="M46 11v6M43 14h6" stroke="#06151c" stroke-width="1.6"/>'),
  tel('<rect x="23" y="16" width="26" height="8" rx="3" fill="var(--zl-t2)"/><path d="M26 20h14" stroke="var(--zl-fl)" stroke-width="2"/>'),
  tel('<rect x="23" y="16" width="26" height="9" rx="3" fill="var(--zl-fl)"/><path d="M36 30c-3-4-8-1-5 3l5 4 5-4c3-4-2-7-5-3z" fill="var(--zl-aus)"/>'),
  tel('<rect x="23" y="16" width="26" height="6" rx="2" fill="var(--zl-fl)"/><rect x="23" y="25" width="26" height="6" rx="2" fill="var(--zl-ein)"/><rect x="23" y="34" width="26" height="6" rx="2" fill="var(--zl-fl)"/>'),
  tel('<rect x="23" y="16" width="26" height="6" rx="2" fill="var(--zl-fl)"/><rect x="23" y="25" width="26" height="6" rx="2" fill="var(--zl-fl)"/><path d="M28 50h16" stroke="var(--zl-t2)" stroke-width="2"/>'),
  tel('<circle cx="36" cy="36" r="10" fill="var(--zl-ein)"/><path d="M31 36l4 4 7-8" fill="none" stroke="#06151c" stroke-width="2.4" stroke-linecap="round"/>')
];
const SCHRITTE = [
  'Öffne „Kurzbefehle“ und tippe oben rechts auf „+“.',
  'Nenne den Kurzbefehl genau „Atem-Minuten“.',
  'Tippe auf „Aktion hinzufügen“, suche „Health“ und wähle „Health-Messung protokollieren“.',
  'Wähle als Typ „Achtsamkeitsminuten“ und als Wert „Kurzbefehleingabe“.',
  'Fragt die Aktion nach Start und Ende: Ende = „Aktuelles Datum“; für den Start davor „Datum anpassen“ (minus Kurzbefehleingabe Minuten).',
  'Tippe auf „Fertig“. Tippe dann hier unten auf „Probe: 1 Minute eintragen“ und erlaube das Eintragen.'
];
export function fuelle(box, ctx = {}) {
  stil(); box.classList.add('zl');
  const h = speicher.wert('health', { an: false }), android = /Android/i.test(navigator.userAgent || '');
  box.innerHTML = `<div class="zl-karte"><label class="zl-schalter"><b>Nach jeder Übung anbieten</b><input type="checkbox" id="zl-h-an" ${h.an ? 'checked' : ''} ${android ? 'disabled' : ''}></label>
      <p class="zl-leise">Dann erscheint am Ende „In Health eintragen“ mit deinen Minuten.</p>
      <p class="zl-i">Nur die Minuten gehen an Health. Nichts wird verschickt.</p></div>
    <div class="zl-karte"><span class="zl-ueber">Einmal einrichten</span><p class="zl-leise">Ohne diesen Kurzbefehl kann eine Web-App nichts in Health eintragen.</p>
      <ol class="zl-schritte">${SCHRITTE.map((s, i) => `<li>${BILD[i]}<span>${s}</span></li>`).join('')}</ol>
      <a class="zl-los zweit" href="${healthLink(1)}" id="zl-h-probe">Probe: 1 Minute eintragen</a>
      <p class="zl-mini">Ob Health den Eintrag gespeichert hat, kann die App nicht sehen – schau einmal in Health unter Achtsamkeitsminuten. Den Probe-Eintrag kannst du dort wieder löschen.</p></div>`;
  box.onchange = (e) => { if (e.target.id === 'zl-h-an') speicher.setzeWert('health', { ...h, an: e.target.checked }); };
}
