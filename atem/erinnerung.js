// 020-ziele: tägliche Erinnerung über den Dienst ntfy (recherche/technik.md Teil 4).
// Der Dienst sieht: zufälliges Thema, Uhrzeit, einen neutralen Satz, Titel „Atem“, App-Adresse (click), dazu wie bei jedem Abruf IP-Adresse und Browser-Kennung. Kein Ziel, keine Werte, keine Übungen, keine Tags.
// Geplant werden beim Öffnen der App die nächsten 3 Termine (ntfy plant höchstens 3 Tage voraus); gleiche Kennung je Tag ersetzt statt doppelt.
import { speicher } from './speicher.js';
import { stil, esc, zeile } from './ziele.js';

export const NTFY = 'https://ntfy.sh';
export const SATZ = 'Zeit für deine Atemübung.';
export const SATZ_LETZT = 'Zeit für deine Atemübung. Öffne die App, damit die Erinnerung weiterläuft.';
const STD = { an: false, thema: null, zeit: '07:30', tage: [1, 2, 3, 4, 5, 6, 0], geplant: [], zuletzt: 0, sig: '', fehler: null };
export const zustand = () => ({ ...STD, ...speicher.wert('erinnerung', {}) });
const sichere = (e) => speicher.setzeWert('erinnerung', e);
const sig = (e) => JSON.stringify([e.zeit, e.tage, e.thema]);
export function neuesThema() {   // 24 zufällige Zeichen [A-Za-z0-9], ohne Vorsatz, der etwas verrät
  const Z = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; let t = '';
  while (t.length < 24) { const b = new Uint8Array(32); crypto.getRandomValues(b); for (const x of b) if (x < 248 && t.length < 24) t += Z[x % 62]; }
  return t;
}
const kennung = (d) => 't' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
export function termine(e, jetzt = Date.now(), n = 3) {   // lokal → Unix-Sekunden (sommerzeitfest über new Date(j, m, t, h, min))
  const [h, mi] = e.zeit.split(':').map(Number), r = [], d0 = new Date(jetzt);
  for (let i = 0; i <= 4 && r.length < n; i++) {
    const d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + i, h, mi, 0, 0);
    if (!e.tage.includes(d.getDay())) continue;
    if (d.getTime() > jetzt + 60e3 && d.getTime() < jetzt + 72 * 3600e3 - 5 * 60e3) r.push({ sid: kennung(d), at: Math.floor(d.getTime() / 1000) });
  }
  return r;
}
const appAdresse = () => location.origin + location.pathname;
export function anfrage(thema, t, letzt) {   // einfache Anfrage ohne Vorabfrage (POST, Text), keine Cookies, kein Referrer
  const u = `${NTFY}/${encodeURIComponent(thema)}/${t.sid}?at=${t.at}&title=Atem&click=${encodeURIComponent(appAdresse())}`;
  return fetch(u, { method: 'POST', body: letzt ? SATZ_LETZT : SATZ, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' });
}
const streiche = (thema, sid) => fetch(`${NTFY}/${encodeURIComponent(thema)}/${sid}`, { method: 'DELETE', credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' });
export async function planen(jetzt = Date.now()) {
  const e = zustand(); if (!e.an || !e.thema) return 'aus';
  const t = termine(e, jetzt), alt = (e.geplant || []).filter((g) => g.at * 1000 > jetzt && !t.some((x) => x.sid === g.sid));
  try {
    for (let i = 0; i < t.length; i++) { const r = await anfrage(e.thema, t[i], i === t.length - 1); if (!r.ok) throw new Error('ntfy ' + r.status); }
    for (const g of alt) await streiche(e.thema, g.sid).catch(() => {});
    sichere({ ...zustand(), geplant: t, zuletzt: jetzt, sig: sig(e), fehler: null }); return 'geplant';
  } catch { sichere({ ...zustand(), fehler: jetzt }); return 'fehler'; }   // nächstes Öffnen versucht es wieder
}
export async function ausschalten() {
  const e = zustand(), jetzt = Date.now();
  for (const g of e.geplant || []) if (g.at * 1000 > jetzt) await streiche(e.thema, g.sid).catch(() => {});
  sichere({ ...e, an: false, geplant: [], sig: '' });
}
export const test = () => { const e = zustand(); return fetch(`${NTFY}/${encodeURIComponent(e.thema)}?title=Atem`, { method: 'POST', body: SATZ, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' }); };

// ---------- Seite ----------
const WTN = [[1, 'Mo'], [2, 'Di'], [3, 'Mi'], [4, 'Do'], [5, 'Fr'], [6, 'Sa'], [0, 'So']];
const geplantText = (e) => (e.geplant || []).filter((g) => g.at * 1000 > Date.now()).map((g) => { const d = new Date(g.at * 1000); return ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()] + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }).join(' · ');
export function fuelle(box, ctx = {}) {
  stil(); box.classList.add('zl');
  const e = zustand();
  const chip = (z) => `<button class="zl-chip" style="min-height:44px;border:0;font:inherit;${e.zeit === z ? 'outline:2px solid var(--zl-ein)' : ''}" data-zl-zeit="${z}">${z}</button>`;
  const status = !e.an ? '' : e.fehler ? '<p class="zl-leise">Gerade nicht erreichbar. Beim nächsten Öffnen der App wird es erneut versucht.</p>' : geplantText(e) ? `<p class="zl-leise">Geplant: ${esc(geplantText(e))}</p>` : '';
  box.innerHTML = `<div class="zl-karte"><label class="zl-schalter"><b>Tägliche Erinnerung</b><input type="checkbox" id="zl-an" ${e.an ? 'checked' : ''}></label>
      <div class="zl-chips">${['07:30', '12:30', '20:30'].map(chip).join('')}<input type="time" id="zl-zeit" value="${esc(e.zeit)}" aria-label="Eigene Uhrzeit" style="min-height:44px;background:var(--zl-fl3);color:var(--zl-t1);border:0;border-radius:999px;padding:0 10px;font:inherit"></div>
      <div class="zl-chips">${WTN.map(([n, w]) => `<button class="zl-chip" style="min-width:44px;min-height:44px;border:0;font:inherit;${e.tage.includes(n) ? 'background:var(--zl-ein);color:var(--ein-ink,#06151c)' : ''}" data-zl-tag="${n}" aria-pressed="${e.tage.includes(n)}">${w}</button>`).join('')}</div>
      <span class="zl-ueber">Vorschau</span><p><b>Atem</b> · ${esc(SATZ)}</p>${status}
      <p class="zl-i">Die Nachricht enthält nur diesen Satz – kein Ziel, keine Werte.</p></div>
    ${e.thema ? `<div class="zl-karte"><span class="zl-ueber">Einmal einrichten</span><ol class="zl-schritte"><li>Die App „ntfy“ aufs Handy laden.</li><li>In ntfy auf „+“ tippen und dieses Thema einfügen:</li><li>„Abonnieren“ tippen – fertig.</li></ol>
      <p class="zl-code" id="zl-thema">${esc(e.thema)}</p><div class="zl-zwei"><button class="zl-los zweit" data-zl-kopie>Thema kopieren</button><a class="zl-los zweit" href="ntfy://ntfy.sh/${esc(e.thema)}?display=Atem">In ntfy öffnen</a></div>
      <p class="zl-mini">Abo-Adresse: ${esc(NTFY.replace('https://', ''))}/${esc(e.thema)}</p><button class="zl-link" data-zl-test>Test-Nachricht senden</button><span id="zl-testw" class="zl-leise"></span>
      <details><summary>So funktioniert es</summary><p class="zl-leise">Beim Öffnen der App werden die nächsten 3 Termine beim Dienst ntfy geplant – weiter voraus geht es dort nicht. Öffnest du die App länger nicht, sagt die letzte Erinnerung das dazu.</p>
      <p class="zl-leise">Der Dienst sieht das zufällige Thema, die Uhrzeit, den Satz, den Titel „Atem“ und die App-Adresse – wie bei jedem Abruf auch deine IP-Adresse. Keine Übungen, keine Ziele, keine Gesundheitsdaten. Wer das Thema kennt, kann mitlesen; teile es nicht.</p></details></div>` : ''}`;
  const neu = async (teil) => { const x = { ...zustand(), ...teil }; sichere(x); if (x.an) await planen(); fuelle(box, ctx); };
  box.onchange = async (ev) => {
    if (ev.target.id === 'zl-an') { if (ev.target.checked) await neu({ an: true, thema: e.thema || neuesThema() }); else { await ausschalten(); fuelle(box, ctx); } }
    if (ev.target.id === 'zl-zeit' && ev.target.value) await neu({ zeit: ev.target.value });
  };
  box.onclick = async (ev) => {
    const z = ev.target.closest('[data-zl-zeit]'); if (z) return neu({ zeit: z.dataset.zlZeit });
    const t = ev.target.closest('[data-zl-tag]'); if (t) { const n = +t.dataset.zlTag, tg = e.tage.includes(n) ? e.tage.filter((x) => x !== n) : [...e.tage, n]; return neu({ tage: tg.length ? tg : e.tage }); }
    if (ev.target.closest('[data-zl-kopie]')) { try { await navigator.clipboard.writeText(e.thema); ev.target.textContent = 'Kopiert'; } catch { const p = box.querySelector('#zl-thema'); const r = document.createRange(); r.selectNodeContents(p); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } }
    if (ev.target.closest('[data-zl-test]')) { const w = box.querySelector('#zl-testw'); try { const r = await test(); w.textContent = r.ok ? ' Gesendet.' : ' Nicht angekommen.'; } catch { w.textContent = ' Gerade nicht erreichbar.'; } }
  };
}
