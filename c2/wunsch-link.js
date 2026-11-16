// Kleiner Link am Ende einer Übung, eines Hör-/Lesetextes oder einer Quiz-Runde: Wunsch zu genau diesem Bereich (öffnet „Wünsche“ mit Vorauswahl).
// Eigenes Modul, nicht in ueben.js: Kommt ein Update mitten in der Sitzung, ist noch das alte ueben.js geladen –
// ein neuer Export dort würde Quiz, Hören und Lesen bis zum Neustart blockieren. Daher auch der Rückfall, falls das alte symbole.js das Symbol nicht kennt.
import { SYM } from './symbole.js';
export const wunschLink = (bereich) => `<a class="wunsch-link" href="#/wuensche/${encodeURIComponent(bereich || 'allgemein')}">${SYM.wunsch || ''}Wunsch dazu?</a>`;
