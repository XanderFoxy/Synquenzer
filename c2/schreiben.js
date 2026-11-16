// Feinschliff – Schreiben und Sprechen zu einem Thema: Gedankenstarter, Perspektiven, Pro/Contra, Beispiele, Redemittel,
// Aufgabe mit Timer, Checkliste (eigene, nicht offiziell), Musterbeitrag zum Aufdecken, Text kopieren für KI-Korrektur.
// Sprechen: Aufnahme mit dem Mikrofon nur zum Selbst-Anhören (MediaRecorder, bleibt im Arbeitsspeicher, wird nie hochgeladen).
import { esc, speicher, tag } from './speicher.js';
import { SYM } from './symbole.js';
import { lade, liste } from './daten.js';
import { bonus, einheit } from './konto.js';
import { kopf, kopiereVorlage, vorlagenVorladen } from './app.js';

const PERSP = [['gesellschaft', 'Gesellschaft'], ['wirtschaft', 'Wirtschaft'], ['umwelt', 'Umwelt'], ['individuum', 'Individuum'], ['ethik', 'Ethik'], ['politik', 'Politik']];
const RM = [['einleiten', 'Einleiten'], ['abwaegen', 'Abwägen'], ['widersprechen', 'Widersprechen'], ['zusammenfassen', 'Zusammenfassen']];
const CHECK = {
  schreiben: ['Alle Punkte der Aufgabe bearbeitet', 'Meinung begründet und mit Beispielen gestützt', 'Klar gegliedert: Einleitung, Hauptteil, Schluss', 'Wortwahl und Stil passen zur Textsorte', 'Satzbau abwechslungsreich, Verbklammer geschlossen', 'Genus, Kasus und Präpositionen geprüft'],
  sprechen: ['Aufgabe erfüllt, Thema klar umrissen', 'Gegliedert: Einstieg, Hauptteil, Schluss', 'Mehrere Perspektiven abgewogen', 'Redemittel genutzt (einleiten, abwägen, zusammenfassen)', 'Flüssig, ohne lange Pausen', 'Auf Gegenargumente eingegangen'],
};
const zaehle = (t) => (String(t).trim().match(/\S+/g) || []).length;
export async function seite(view, id, art = 'schreiben', opt = {}) {
  const e = (await liste('themen')).find((x) => x.id === id);
  if (!e) { view.innerHTML = `${kopf('Thema', '#/bereich/' + art, art)}<p class="karte">Thema nicht gefunden.</p>`; return; }
  const d = await lade(e.datei); const schreiben = art !== 'sprechen'; const key = `${art}/${d.id}`;
  const entwurf = speicher.lies('entwuerfe', {})[key] || '';
  const zeiten = schreiben ? (opt.pruefung ? [60] : [10, 20, 60]) : (opt.pruefung ? [15, 5] : [3, 5, 15]);
  const p = d.perspektiven || {}; const rm = d.redemittel || {};
  view.innerHTML = `${kopf(d.thema, opt.zurueck || '#/bereich/' + art, art)}<div class="bereich-seite thema-seite" data-bereich="${art}">
    ${opt.pruefung ? '<p class="karte klein">Prüfungsmodus: Ideen und Musterbeitrag erst nach Ablauf der Zeit oder mit „Fertig“.</p>' : ''}
    <section class="karte ideen" ${opt.pruefung ? 'hidden' : ''}><h3>${SYM.idee} Gedankenstarter</h3><ul>${(d.einstieg || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <h4>Perspektiven</h4><div class="chips" data-persp>${PERSP.filter(([k]) => p[k]?.length).map(([k, n], i) => `<button class="chip-knopf" data-p="${k}" aria-pressed="${i === 0}">${n}</button>`).join('')}</div>
      <ul class="persp-text" data-persp-text></ul>
      <div class="procontra"><div><h4>Pro</h4><ul>${(d.pro || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div><h4>Contra</h4><ul>${(d.contra || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
      ${d.beispiele?.length ? `<h4>Beispiele</h4><ul>${d.beispiele.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</section>
    <section class="karte redemittel"><h3>Redemittel</h3><div class="segment klein" data-rm>${RM.filter(([k]) => rm[k]?.length).map(([k, n], i) => `<button data-r="${k}" aria-pressed="${i === 0}">${n}</button>`).join('')}</div>
      <div class="rm-liste" data-rm-liste></div>${schreiben ? '<p class="leise">Tippen fügt das Redemittel in deinen Text ein.</p>' : ''}</section>
    <section class="karte aufgabe"><span class="ueber">${schreiben ? 'Schreibaufgabe' : 'Sprechaufgabe'}</span><p class="aufgabe-text">${esc(schreiben ? d.schreibaufgabe : d.sprechaufgabe)}</p>
      <div class="timer"><div class="chips">${zeiten.map((z, i) => `<button class="chip-knopf" data-min="${z}" aria-pressed="${i === 0}">${z} Min.${!schreiben && opt.pruefung && i === 0 ? ' Vorbereitung' : ''}</button>`).join('')}</div><span class="uhr-chip gross" data-uhr>${SYM.uhr} ${zeiten[0]}:00</span><button class="knopf zweit" data-timer>Start</button></div>
      ${schreiben ? `<textarea class="feld text" rows="12" placeholder="Dein Text …" aria-label="Dein Text" spellcheck="false" autocorrect="off">${esc(entwurf)}</textarea><p class="leise" data-woerter>${zaehle(entwurf)} Wörter · Ziel ca. ${opt.pruefung ? 350 : '180–350'}</p>`
        : `<div class="aufnahme"><button class="knopf haupt" data-rec>${SYM.aufnahme} Aufnahme starten</button><span class="leise" data-rec-status>Nur zum Selbst-Anhören. Nichts wird hochgeladen.</span><div data-rec-liste></div></div>
           <textarea class="feld" rows="4" placeholder="Notizen (in der Prüfung erlaubt) …" aria-label="Notizen">${esc(entwurf)}</textarea>`}
      <div class="zeile-knoepfe"><button class="knopf zweit" data-ki>${SYM.kopie} ${schreiben ? 'Text kopieren für KI-Korrektur' : 'Vorlage für Sprech-Feedback kopieren'}</button></div></section>
    <section class="karte"><h3>Checkliste</h3><p class="leise">Eigene Selbstkontrolle, nicht das offizielle Bewertungsraster.</p><ul class="check">${CHECK[schreiben ? 'schreiben' : 'sprechen'].map((c, i) => `<li><label><input type="checkbox" data-c="${i}"> ${esc(c)}</label></li>`).join('')}</ul></section>
    <section class="karte muster"><button class="knopf zweit breit" data-muster>${SYM.auge} Musterbeitrag aufdecken</button><div data-muster-text></div></section>
    <button class="knopf haupt breit" data-fertig>${SYM.haken} Fertig – als erledigt eintragen</button></div>`;
  // Perspektiven und Redemittel
  const persp = (k) => { view.querySelector('[data-persp-text]').innerHTML = (p[k] || []).map((x) => `<li>${esc(x)}</li>`).join(''); };
  const ersteP = PERSP.find(([k]) => p[k]?.length); if (ersteP) persp(ersteP[0]);
  view.querySelector('[data-persp]').addEventListener('click', (ev) => { const b = ev.target.closest('[data-p]'); if (!b) return; view.querySelectorAll('[data-p]').forEach((x) => x.setAttribute('aria-pressed', x === b)); persp(b.dataset.p); });
  const rmZeig = (k) => { view.querySelector('[data-rm-liste]').innerHTML = (rm[k] || []).map((x) => `<button class="rm" data-text="${esc(x)}">${esc(x)}</button>`).join(''); };
  const ersteR = RM.find(([k]) => rm[k]?.length); if (ersteR) rmZeig(ersteR[0]);
  view.querySelector('[data-rm]').addEventListener('click', (ev) => { const b = ev.target.closest('[data-r]'); if (!b) return; view.querySelectorAll('[data-r]').forEach((x) => x.setAttribute('aria-pressed', x === b)); rmZeig(b.dataset.r); });
  const feld = view.querySelector('textarea');
  const sichern = () => { speicher.aendere('entwuerfe', {}, (x) => { x[key] = feld.value; }); const w = view.querySelector('[data-woerter]'); if (w) w.textContent = `${zaehle(feld.value)} Wörter · Ziel ca. ${opt.pruefung ? 350 : '180–350'}`; };
  feld.addEventListener('input', sichern);
  view.querySelector('[data-rm-liste]').addEventListener('click', (ev) => {
    const b = ev.target.closest('.rm'); if (!b || !schreiben) return;
    const t = b.dataset.text.replace(/\s*…\s*$/, ' '); const s = feld.selectionStart ?? feld.value.length;
    feld.value = feld.value.slice(0, s) + t + feld.value.slice(feld.selectionEnd ?? s); feld.focus(); feld.selectionStart = feld.selectionEnd = s + t.length; sichern();
  });
  // Timer
  let min = zeiten[0], rest = min * 60, uhr = null; const chip = view.querySelector('[data-uhr]'), tk = view.querySelector('[data-timer]');
  const zeig = () => { chip.innerHTML = `${SYM.uhr} ${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, '0')}`; };
  view.querySelector('.timer .chips').addEventListener('click', (ev) => { const b = ev.target.closest('[data-min]'); if (!b) return; clearInterval(uhr); uhr = null; tk.textContent = 'Start'; min = +b.dataset.min; rest = min * 60; zeig(); view.querySelectorAll('[data-min]').forEach((x) => x.setAttribute('aria-pressed', x === b)); });
  tk.addEventListener('click', () => {
    if (uhr) { clearInterval(uhr); uhr = null; tk.textContent = 'Weiter'; return; }
    tk.textContent = 'Pause';
    uhr = setInterval(() => { if (!chip.isConnected) return clearInterval(uhr); rest = Math.max(0, rest - 1); zeig(); if (!rest) { clearInterval(uhr); uhr = null; tk.textContent = 'Start'; chip.classList.add('vorbei'); chip.innerHTML = `${SYM.uhr} Zeit um`; if (opt.pruefung) freigeben(); } }, 1000);
  });
  // Musterbeitrag, KI-Vorlage, erledigt
  const freigeben = () => { view.querySelector('.ideen')?.removeAttribute('hidden'); };
  view.querySelector('[data-muster]').addEventListener('click', (ev) => { view.querySelector('[data-muster-text]').innerHTML = `<div class="musterbeitrag">${String(d.musterbeitrag || '').split(/\n+/).map((x) => `<p>${esc(x)}</p>`).join('')}</div>`; ev.target.closest('button').remove(); freigeben(); });
  view.querySelector('[data-ki]').addEventListener('click', (ev) => kopiereVorlage(ev.target.closest('button'), schreiben ? 'schreiben_korrektur' : 'sprechen_feedback', { AUFGABE: schreiben ? d.schreibaufgabe : d.sprechaufgabe, THEMA: d.thema, TEXT: feld.value, WOERTER: String(zaehle(feld.value)) }));
  view.querySelector('[data-fertig]').addEventListener('click', (ev) => {
    const erl = speicher.lies('erledigt', {}); if (!erl[key] || erl[key] !== tag()) { bonus(art, 30); einheit(); }
    speicher.aendere('erledigt', {}, (x) => { x[key] = tag(); }); freigeben();
    ev.target.closest('button').outerHTML = `<p class="lob">${SYM.haken} Eingetragen. +30 Punkte</p>`;
    clearInterval(uhr);
    const cb = [...view.querySelectorAll('.check input')]; opt.onFertig?.({ haken: cb.filter((x) => x.checked).length, von: cb.length, woerter: schreiben ? zaehle(feld.value) : null });
  });
  if (!schreiben) aufnahme(view);
  vorlagenVorladen();   // iPhone: Kopieren muss im selben Tipp passieren
  addEventListener('fs-weg', () => clearInterval(uhr), { once: true });
}
function aufnahme(view) {
  const k = view.querySelector('[data-rec]'), st = view.querySelector('[data-rec-status]'), lst = view.querySelector('[data-rec-liste]');
  let rec = null, stuecke = [], strom = null, t0 = 0;
  if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) { k.disabled = true; st.textContent = 'Aufnahme wird von diesem Browser nicht unterstützt.'; return; }
  addEventListener('fs-weg', () => { try { if (rec?.state === 'recording') rec.stop(); strom?.getTracks().forEach((t) => t.stop()); } catch { /* egal */ } }, { once: true });   // Mikrofon aus beim Verlassen
  k.addEventListener('click', async () => {
    if (rec && rec.state === 'recording') { rec.stop(); return; }
    try { strom = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { st.textContent = 'Kein Zugriff auf das Mikrofon. Erlaube es in den Einstellungen.'; return; }
    stuecke = []; rec = new MediaRecorder(strom); t0 = Date.now();
    rec.ondataavailable = (e) => { if (e.data.size) stuecke.push(e.data); };
    rec.onstop = () => {
      strom.getTracks().forEach((t) => t.stop());
      const url = URL.createObjectURL(new Blob(stuecke, { type: rec.mimeType || 'audio/mp4' })); const s = Math.round((Date.now() - t0) / 1000);
      lst.insertAdjacentHTML('afterbegin', `<div class="aufn"><audio controls src="${url}"></audio><span class="leise">${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} Min.</span></div>`);
      k.innerHTML = `${SYM.aufnahme} Neue Aufnahme`; k.classList.remove('nimmt'); st.textContent = 'Hör dich an: Was klingt schon sicher, wo stockst du?';
    };
    rec.start(); k.innerHTML = `${SYM.stopp} Aufnahme beenden`; k.classList.add('nimmt'); st.textContent = 'Aufnahme läuft …';
  });
}

// Sammlungen: Redemittel C1/C2 (Gruppen → Teile → Einträge) und „Warum C2“ (Sätze mit markierter Wendung)
export async function sammlung(view, id, zurueck = '#/bereich/schreiben') {
  const i = await (await import('./daten.js')).ladeIndex(); const s = i.sammlungen?.[id];
  if (!s) { view.innerHTML = `${kopf('Sammlung', zurueck)}<p class="karte">Sammlung nicht gefunden.</p>`; return; }
  const d = await lade(s.datei);
  if (id === 'warum-c2') {
    const mark = (t, w) => { const k = w ? t.indexOf(w) : -1; return k < 0 ? esc(t) : `${esc(t.slice(0, k))}<mark>${esc(w)}</mark>${esc(t.slice(k + w.length))}`; };
    view.innerHTML = `${kopf(d.titel, zurueck, 'sprechen')}<div class="bereich-seite sammlung" data-bereich="sprechen"><p class="einleitung">${esc(d.hinweis || '')}</p>
      <ol class="saetze">${(d.saetze || []).map((x) => `<li class="karte klein"><div><p>${mark(x.text, x.wendung)}</p>${x.erklaerung ? `<small class="leise">${esc(x.erklaerung)}</small>` : ''}</div></li>`).join('')}</ol></div>`;
    return;
  }
  const gr = d.gruppen || [];
  view.innerHTML = `${kopf(d.titel, zurueck, 'schreiben')}<div class="bereich-seite sammlung" data-bereich="schreiben"><p class="einleitung">${esc(d.hinweis || '')}</p>
    <div class="chips" data-gruppen>${gr.map((g, k) => `<button class="chip-knopf" data-g="${k}" aria-pressed="${k === 0}">${esc(g.titel.split(/ und | – /)[0])}</button>`).join('')}</div><div data-gruppe></div></div>`;
  const zeig = (k) => { const g = gr[k]; view.querySelector('[data-gruppe]').innerHTML = `<section class="karte"><h3>${esc(g.titel)}</h3>${g.tipp ? `<p class="leise">${esc(g.tipp)}</p>` : ''}${(g.teile || []).map((t) => `<h4>${esc(t.titel)}</h4><ul class="rm-sammlung">${(t.eintraege || []).map((x) => `<li><span>${esc(x.text)}</span><small class="leise">${esc([x.niveau, x.register === 'beides' ? 'schriftlich und mündlich' : x.register, x.hinweis].filter(Boolean).join(' · '))}</small></li>`).join('')}</ul>`).join('')}</section>`; };
  if (gr.length) zeig(0);
  view.querySelector('[data-gruppen]').addEventListener('click', (ev) => { const b = ev.target.closest('[data-g]'); if (!b) return; view.querySelectorAll('[data-g]').forEach((x) => x.setAttribute('aria-pressed', x === b)); zeig(+b.dataset.g); });
}
