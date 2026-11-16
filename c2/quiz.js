// Feinschliff – Quiz: 10 Fragen je Runde, Zeit je Frage, Punkte mit Tempo-Bonus, farbige Antwortkacheln mit Formen.
// Fragen: alle Auswahl-, Richtig/Falsch- und R/F/N-Übungen aus Grammatik + Wortschatz-Fragen; Wiederholungsregel gilt auch hier.
import { esc, speicher, mische } from './speicher.js';
import { SYM } from './symbole.js';
import { lade, liste } from './daten.js';
import { waehle, vermerke } from './wiederholung.js';
import { kandidatenAus } from './ueben.js';
import { buche, bonus, einheit } from './konto.js';
import { kopf } from './app.js';

export const RUNDE = 10, ZEIT_S = 20, ZEIT_LANG_S = 30, BASIS = 500;
export const quizPunkte = (richtig, restAnteil) => (richtig ? BASIS + Math.round(BASIS * Math.max(0, Math.min(1, restAnteil))) : 0);
const QUIZ_TYPEN = new Set(['auswahl', 'rf', 'rfn']);
function optionenVon(u) {
  if (u.typ === 'auswahl') return { opts: u.optionen, soll: u.richtig };
  if (u.typ === 'rf') { const o = u.beschriftung || ['richtig', 'falsch']; return { opts: o, soll: u.wert ? 0 : 1 }; }
  const o = ['richtig', 'falsch', 'nicht im Text']; return { opts: o, soll: o.indexOf(u.wert) };
}
// Je Runde nur einen Teil der Dateien laden (schnell, wenig Daten): bis zu 5 Grammatik-Themen und 2 Wortlisten, zuerst die wenig gesehenen
export const QUIZ_DATEIEN = { grammatik: 5, wortschatz: 2 };
const wenigGesehen = (l, n) => { const th = speicher.lies('themen', {}); return mische(l).sort((a, b) => (th[`${a.b}/${a.id}`]?.n || 0) - (th[`${b.b}/${b.id}`]?.n || 0)).slice(0, n); };
// „Alles“: halb Grammatik, halb Wortschatz (sonst überwiegt der Wortschatz mit seinen vielen erzeugten Fragen)
function mischeHaelften(k) {
  const g = waehle(k.filter((x) => x.bereich === 'grammatik'), RUNDE / 2, { durchlauf: false }); const da = new Set(g.map((x) => x.uid));
  const w = waehle(k.filter((x) => !da.has(x.uid) && x.bereich !== 'grammatik'), RUNDE - g.length, { durchlauf: false });
  const r = [...g, ...w]; if (r.length < RUNDE) { const d2 = new Set(r.map((x) => x.uid)); r.push(...waehle(k.filter((x) => !d2.has(x.uid)), RUNDE - r.length)); }
  return mische(r);
}
async function sammle(quelle) {
  const kand = [];
  if (quelle !== 'wortschatz') for (const e of wenigGesehen((await liste('grammatik')).map((x) => ({ ...x, b: 'grammatik' })), QUIZ_DATEIEN.grammatik)) { try { kand.push(...kandidatenAus(await lade(e.datei)).filter((k) => QUIZ_TYPEN.has(k.u.typ))); } catch { /* offline: ohne dieses Thema */ } }
  if (quelle !== 'grammatik') { const { kandidatenFuer } = await import('./wortschatz.js'); for (const e of wenigGesehen((await liste('wortschatz')).map((x) => ({ ...x, b: 'wortschatz' })), quelle === 'wortschatz' ? 5 : QUIZ_DATEIEN.wortschatz)) { try { kand.push(...(await kandidatenFuer(e)).filter((k) => QUIZ_TYPEN.has(k.u.typ))); } catch { /* offline */ } } }
  return kand;
}
export async function seite(view) {
  const q = speicher.lies('quiz', { best: 0, runden: 0 });
  view.innerHTML = `${kopf('Quiz', '#/heute', 'quiz')}<div class="bereich-seite quiz-start" data-bereich="quiz">
    <section class="karte held"><div class="held-text"><span class="ueber">${RUNDE} Fragen · ${ZEIT_S} Sekunden je Frage</span><h2>Schnell und spielerisch</h2><p>Je schneller du richtig antwortest, desto mehr Punkte. Falsche Antworten kosten nichts.</p></div>
      <div class="segment" data-quelle>${[['alles', 'Alles'], ['grammatik', 'Grammatik'], ['wortschatz', 'Wortschatz']].map(([k, n], i) => `<button data-q="${k}" aria-pressed="${i === 0}">${n}</button>`).join('')}</div>
      <button class="knopf haupt gross" data-start>${SYM.play} Runde starten</button></section>
    <div class="karte klein">${SYM.stern}<div><b>Bestwert: ${q.best} Punkte</b><p class="leise">${q.runden} Runden gespielt</p></div></div></div>`;
  let quelle = 'alles';
  view.querySelector('[data-quelle]').addEventListener('click', (e) => { const b = e.target.closest('[data-q]'); if (!b) return; quelle = b.dataset.q; view.querySelectorAll('[data-q]').forEach((x) => x.setAttribute('aria-pressed', x === b)); });
  view.querySelector('[data-start]').addEventListener('click', async () => {
    view.innerHTML = '<p class="laden">Mischt die Fragen …</p>';
    let fragen = [];
    try { const k = await sammle(quelle); fragen = quelle === 'alles' ? mischeHaelften(k) : waehle(k, RUNDE); } catch { fragen = []; }
    if (!fragen.length) { view.innerHTML = `${kopf('Quiz', '#/quiz', 'quiz')}<p class="karte">Die Fragen konnten nicht geladen werden.${navigator.onLine ? '' : ' Du bist offline – öffne die App einmal mit Internet.'}</p>`; return; }
    spiel(view, fragen);
  });
}
function spiel(view, fragen) {
  let i = 0, punkte = 0, richtig = 0, timer = null, start = 0, dauer = 0, beantwortet = false;
  if (!fragen.length) { view.innerHTML = `${kopf('Quiz', '#/quiz', 'quiz')}<p class="karte">Noch keine Quizfragen vorhanden.</p>`; return; }
  function frage() {
    const f = fragen[i], { opts } = optionenVon(f.u); const text = f.u.frage || f.u.aussage || '';
    dauer = (text.length > 110 ? ZEIT_LANG_S : ZEIT_S) * 1000; beantwortet = false;
    view.innerHTML = `<section class="quiz" data-bereich="quiz"><header class="s-kopf"><a class="rund" href="#/quiz" aria-label="Beenden">${SYM.kreuz}</a><div class="s-fort"><span class="s-zahl">Frage ${i + 1} von ${fragen.length}</span></div><span class="quiz-punkte" data-punkte>${punkte}</span></header>
      <div class="karte quiz-frage" data-uid="${esc(f.uid)}"><span class="u-typ">${f.u.typ === 'auswahl' ? 'Welche Antwort stimmt?' : 'Stimmt das?'}</span><p class="frage">${esc(text)}</p><div class="zeitbalken"><i></i></div></div>
      <div class="quiz-kacheln n${opts.length}">${opts.map((o, k) => `<button class="qk q${k % 4}" data-k="${k}">${SYM['form' + (k % 4)]}<span>${esc(o)}</span></button>`).join('')}</div><div class="quiz-rueck"></div></section>`;
    view.querySelector('.quiz-kacheln').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) antwort(+b.dataset.k); });
    const balken = view.querySelector('.zeitbalken i'); start = performance.now();
    balken.style.transition = 'none'; balken.style.transform = 'scaleX(1)';
    requestAnimationFrame(() => requestAnimationFrame(() => { balken.style.transition = `transform ${dauer}ms linear`; balken.style.transform = 'scaleX(0)'; }));
    clearTimeout(timer); timer = setTimeout(() => antwort(null), dauer);
  }
  function antwort(k) {
    if (beantwortet) return; beantwortet = true; clearTimeout(timer);
    const f = fragen[i], { opts, soll } = optionenVon(f.u); const ok = k === soll;
    const rest = 1 - (performance.now() - start) / dauer; const p = quizPunkte(ok, rest);
    punkte += p; if (ok) richtig++;
    vermerke(f.uid, f.pool, ok); buche({ bereich: f.bereich, thema: f.thema, richtig: ok, punkte: 0 });
    const balken = view.querySelector('.zeitbalken i'); const jetzt = getComputedStyle(balken).transform; balken.style.transition = 'none'; balken.style.transform = jetzt;
    view.querySelectorAll('.qk').forEach((b) => { b.disabled = true; const kk = +b.dataset.k; if (kk === soll) b.classList.add('loesung'); else if (kk === k) b.classList.add('daneben'); else b.classList.add('blass'); });
    view.querySelector('[data-punkte]').textContent = punkte;
    view.querySelector('.quiz-rueck').innerHTML = `<div class="rueck ${ok ? 'gut' : 'schlecht'}">${ok ? SYM.haken : SYM.kreuz}<div><b>${k == null ? 'Zeit vorbei.' : ok ? `Richtig! +${p}` : 'Leider nicht.'}</b>${ok ? '' : `<p>Richtig: „${esc(opts[soll])}“</p>`}${f.u.erklaerung ? `<p class="erkl">${esc(f.u.erklaerung)}</p>` : ''}</div></div>
      <button class="knopf haupt breit" data-weiter>${i < fragen.length - 1 ? 'Nächste Frage' : 'Ergebnis'}</button>`;
    view.querySelector('[data-weiter]').addEventListener('click', () => { i++; if (i < fragen.length) frage(); else ende(); });
  }
  function ende() {
    const q = speicher.lies('quiz', { best: 0, runden: 0 }); const neu = punkte > q.best;
    speicher.schreib('quiz', { best: Math.max(q.best, punkte), runden: q.runden + 1 });
    bonus('quiz', Math.round(punkte / 50)); einheit();
    view.innerHTML = `${kopf('Quiz-Ergebnis', '#/quiz', 'quiz')}<section class="karte quiz-ende"><svg class="pokal" viewBox="0 0 64 64" aria-hidden="true"><path d="M20 10h24v12a12 12 0 0 1-24 0z" fill="var(--c-schreiben)"/><path d="M20 14h-7a7 7 0 0 0 7 9M44 14h7a7 7 0 0 1-7 9" fill="none" stroke="var(--c-schreiben)" stroke-width="3"/><path d="M29 34h6v10h-6z" fill="var(--c-schreiben)"/><rect x="21" y="44" width="22" height="7" rx="2" fill="var(--c-lesen)"/></svg>
      <h2 data-endpunkte>${punkte} Punkte</h2><p>${richtig} von ${fragen.length} richtig${neu ? ' · neuer Bestwert' : ''}</p><p class="leise">+${Math.round(punkte / 50)} Punkte für deinen Fortschritt</p></section>
      <button class="knopf haupt breit" data-nochmal>Neue Runde</button><a class="knopf zweit breit" href="#/heute">Fertig</a>`;
    view.querySelector('[data-nochmal]').addEventListener('click', () => seite(view));
  }
  addEventListener('fs-weg', () => clearTimeout(timer), { once: true });
  frage();
}
