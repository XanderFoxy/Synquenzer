// Feinschliff – Hören wie in der Prüfung: Aufgaben vorher sichtbar, Audio nur so oft wie dort erlaubt (abspielen: 1|2),
// kein Spulen, im Prüfungsmodus kein Pausieren. Das Transkript steht erst nach der Abgabe im Dokument.
import { esc } from './speicher.js';
import { SYM } from './symbole.js';
import { lade, liste, audioPfade } from './daten.js';
import { einst } from './konto.js';
import { kopf } from './app.js';
import { aufgabenBlock, modusLeiste } from './block.js';

const zeit = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
async function audioUrl(pfad) {   // als Blob laden: Wiedergabe aus dem Speicher ohne Range-Anfragen (iOS) und offline
  for (const p of audioPfade(pfad)) { try { const r = await fetch(p); if (r.ok) return URL.createObjectURL(await r.blob()); } catch { /* nächster Pfad */ } }
  return null;
}
let altesBeenden = null;   // Simulation: H1 → H2 bleibt auf demselben Hash, deshalb das alte Audio hier anhalten
export async function seite(view, id, opt = {}) {
  altesBeenden?.(); altesBeenden = null;
  const e = (await liste('hoeren')).find((x) => x.id === id);
  if (!e) { view.innerHTML = `${kopf('Hören', '#/bereich/hoeren', 'hoeren')}<p class="karte">Hörtext nicht gefunden.</p>`; return; }
  const d = await lade(e.datei); let modus = opt.modus || einst().modus;
  const max = d.abspielen === 2 ? 2 : 1; let gespielt = 0, laeuft = false, abgegeben = false, audio = null, url = null, unterbrochen = false, weg = false;
  const urlVorab = audioUrl(d.audio).then((u) => { if (weg && u) { URL.revokeObjectURL(u); return null; } return u; });   // gleich vorladen: der erste Tipp spielt sofort (iPhone)
  const zurueck = opt.zurueck || '#/bereich/hoeren';
  function zeichne() {
    view.innerHTML = `${kopf(d.titel, zurueck, 'hoeren')}<div class="bereich-seite hoeren-seite" data-bereich="hoeren">
      <div class="karte klein info"><div><span class="ueber">${esc(d.teil || '')} · ${esc(d.art || '')}</span><p>${(d.stimmen || []).map(esc).join(', ')}</p>${d.anleitung ? `<p>${esc(d.anleitung)}</p>` : ''}<p class="leise">In der Prüfung hörst du diesen Text <b>${max === 2 ? 'zweimal' : 'einmal'}</b>. Lies zuerst die Aufgaben.${(d.aufgaben || []).some((u) => u.nur_training) ? ' Die Trainingsaufgaben am Ende gibt es nur im Übungsmodus.' : ''}</p></div></div>
      ${opt.modus ? '' : modusLeiste(modus)}
      <section class="karte spieler" aria-label="Hörtext">
        <button class="play-knopf" data-play aria-label="Abspielen">${SYM.play}</button>
        <div class="sp-mitte"><div class="balken"><i></i></div><div class="sp-zeile"><span data-zeit>0:00 / ${zeit(d.dauer_s || 0)}</span><span class="durchgaenge" aria-label="Durchgänge">${Array.from({ length: max }, (_, i) => `<i data-d="${i}"></i>`).join('')}</span></div><p class="leise" data-status>Noch ${max === 2 ? 'zwei Durchgänge' : 'ein Durchgang'}.</p></div>
      </section>
      <h3 class="zwischen">Aufgaben</h3><div data-aufgaben></div>
      <section class="karte transkript-box"><button class="knopf zweit breit" data-transkript disabled>${SYM.schloss} Transkript nach der Abgabe</button><div data-transkript-text></div></section></div>`;
    view.querySelector('.segment')?.addEventListener('click', (ev) => { const b = ev.target.closest('[data-modus]'); if (!b || gespielt || abgegeben) return; modus = b.dataset.modus; zeichne(); });
    aufgabenBlock(view.querySelector('[data-aufgaben]'), (d.aufgaben || []).filter((u) => modus !== 'pruefung' || !u.nur_training), { modus, bereich: 'hoeren', id: d.id, onAbgabe: (r) => { abgegeben = true; frei(); opt.onAbgabe?.(r); } });
    view.querySelector('[data-play]').addEventListener('click', spiel);
    view.querySelector('[data-transkript]').addEventListener('click', zeigeText);
    status();
  }
  function status() {
    const k = view.querySelector('[data-play]'); if (!k) return;
    view.querySelectorAll('.durchgaenge i').forEach((x) => x.classList.toggle('weg', +x.dataset.d < gespielt));
    const rest = max - gespielt; const s = view.querySelector('[data-status]');
    if (abgegeben) { s.textContent = 'Nach der Abgabe kannst du frei hören.'; k.disabled = false; }
    else if (unterbrochen && !laeuft) { s.textContent = 'Unterbrochen. Tippe auf Abspielen, um an derselben Stelle weiterzuhören.'; k.disabled = false; }
    else if (laeuft) { s.textContent = modus === 'pruefung' ? 'Läuft – wie in der Prüfung ohne Pause.' : 'Läuft.'; k.disabled = modus === 'pruefung'; }
    else if (rest <= 0) { s.textContent = 'Alle Durchgänge gehört. Gib deine Antworten ab.'; k.disabled = true; }
    else { s.textContent = rest === max ? `Noch ${max === 2 ? 'zwei Durchgänge' : 'ein Durchgang'}.` : 'Noch ein Durchgang.'; k.disabled = false; }
    k.innerHTML = laeuft ? SYM.pause : SYM.play; k.setAttribute('aria-label', laeuft ? 'Pause' : 'Abspielen');
  }
  async function spiel() {
    if (!audio) {
      const s = view.querySelector('[data-status]'); s.textContent = 'Lädt …'; url = await urlVorab;
      if (!url) { s.textContent = navigator.onLine ? 'Die Audiodatei fehlt noch.' : 'Die Audiodatei ist offline noch nicht gespeichert.'; return; }
      audio = new Audio(url); audio.preload = 'auto';
      // Unterbrechung durch das System (Anruf, Siri, Kopfhörer ab): Durchgang nicht verlieren, an derselben Stelle weiter
      audio.addEventListener('pause', () => { if (!laeuft || audio.ended) return; laeuft = false; unterbrochen = true; status(); });
      audio.addEventListener('timeupdate', () => { const t = view.querySelector('[data-zeit]'); if (!t) return; const dauer = audio.duration || d.dauer_s || 1; t.textContent = `${zeit(audio.currentTime)} / ${zeit(dauer)}`; view.querySelector('.spieler .balken i').style.width = `${(audio.currentTime / dauer) * 100}%`; });
      audio.addEventListener('ended', () => { laeuft = false; unterbrochen = false; audio.currentTime = 0; status(); });
    }
    if (laeuft) { if (modus === 'ueben' || abgegeben) { audio.pause(); laeuft = false; status(); } return; }
    let neuerDurchgang = false;
    if (!abgegeben && audio.currentTime === 0) { if (gespielt >= max) return; gespielt++; neuerDurchgang = true; }
    laeuft = true; unterbrochen = false; status();   // sofort sperren/umschalten, damit ein zweites Tippen keinen Durchgang verbraucht
    try { await audio.play(); } catch { laeuft = false; if (neuerDurchgang) gespielt--; status(); }
  }
  function frei() { status(); const t = view.querySelector('[data-transkript]'); if (t) { t.disabled = false; t.innerHTML = `${SYM.auge} Transkript aufdecken`; } }
  function zeigeText() {
    if (!abgegeben) return;   // Sperre: vor der Abgabe kommt der Text nicht ins Dokument
    const box = view.querySelector('[data-transkript-text]');
    box.innerHTML = `<div class="transkript">${(d.transkript || []).map((z) => `<p><b>${esc(z.sprecher)}:</b> ${esc(z.text)}</p>`).join('')}</div>`;
    view.querySelector('[data-transkript]').remove();
  }
  const beenden = () => { weg = true; laeuft = false; try { audio?.pause(); if (audio) audio.src = ''; if (url) URL.revokeObjectURL(url); } catch { /* egal */ } removeEventListener('fs-weg', beenden); };
  addEventListener('fs-weg', beenden); altesBeenden = beenden;
  zeichne();
}
