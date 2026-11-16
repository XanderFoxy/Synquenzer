// 020-ziele: Ziele, Programm, Heute-Karte, Ende-Blatt (Atem 0.2.0).
// Alles bleibt auf dem Gerät (atem.v1.ziel, atem.v1.selbst, atem.v1.zielwahl). Kein Netz – außer der Erinnerung (erinnerung.js, nur wenn eingeschaltet).
// Texte/Quellen liegen in ziele-daten.js und laden erst auf den Seiten Ziel/Fortschritt. Heute braucht nur den Plan unten.
import { speicher } from './speicher.js';
import { TECHNIKEN } from './daten.js';

// PLAN-ANFANG (erzeugt)
export const ZK = [["stress","Stress senken","Ruhiger durch den Tag – 5 Minuten täglich.","mittel","p_stress_4w",null],["leichter_atmen","Leichter atmen","Ruhiger und leichter atmen, wenn die Luft knapp wirkt.","mittel","p_leichter_4w",null],["schlaf","Besser einschlafen","Abends zur Ruhe kommen – 10 bis 15 Minuten im Liegen.","schwach","p_schlaf_4w",null],["fokus","Fokus und Selbstkontrolle","Ruhig starten, bevor du lernst oder arbeitest – und kurz innehalten, bevor du reagierst.","schwach","p_fokus_4w",null],["sport","Ausdauer und Sport","Mit Einatem-Trainer: Atemmuskeln kräftigen. Ohne Gerät: nach dem Sport schneller runterkommen.","mittel","p_sport_geraet_4w","p_sport_erholung_4w"],["resonanz","Herz und Atem im Takt","Resonanz-Atmung: etwa 5,5 Atemzüge pro Minute, täglich von 5 auf 15 Minuten.","gut","p_resonanz_4w",null]];
export const PLAN = {"p_stress_4w":{"z":"stress","n":"Ruhiger durch den Tag","w":[{"t":"Kennenlernen","u":[["seufzer",5]],"a":[["lang_aus",5]]},{"t":"Dranbleiben","u":[["seufzer",5]],"a":[["lang_aus",5],["atem_beobachten","kurz",null,"m"]]},{"t":"Vertiefen","u":[["seufzer",5]],"o":[["resonanz",5]]},{"t":"Festigen","u":[["seufzer",5]],"o":[["resonanz",5]]}]},"p_leichter_4w":{"z":"leichter_atmen","n":"Leichter atmen","w":[{"t":"Wahrnehmen","u":[["bauch",5]]},{"t":"Langsamer ausatmen","u":[["bauch",5],["lang_aus",3]]},{"t":"Leise atmen","u":[["bauch",5]],"a":[["lang_aus",3]],"o":[["summen",3],["weniger",3]]},{"t":"Im Alltag","u":[["bauch",5],["lang_aus",3]]}]},"p_schlaf_4w":{"z":"schlaf","n":"Abends zur Ruhe","w":[{"t":"Ankommen","u":[["lang_aus",10]],"a":[["einschlafen","kurz",null,"m"]]},{"t":"Langsamer","u":[["resonanz",10,"6_min_langes_aus"]]},{"t":"Länger","u":[["resonanz",15,"6_min_langes_aus"]],"a":[["koerperreise","normal",null,"m"]]},{"t":"Dein Abend-Ritual","u":[["resonanz",15,"6_min_langes_aus"]],"a":[["muskeln_loesen","normal",null,"m"]]}]},"p_fokus_4w":{"z":"fokus","n":"Fokus","w":[{"t":"Ruhig starten","u":[["bauch",5]]},{"t":"Langsam","u":[["resonanz",5]]},{"t":"Innehalten","u":[["resonanz",5]],"o":[["seufzer",1]]},{"t":"Eigene Routine","u":[["resonanz",5]],"o":[["seufzer",1],["box",2]]}]},"p_sport_geraet_4w":{"z":"sport","n":"Atemmuskeln mit Einatem-Trainer","w":[{"t":"Technik lernen","u":[["imt",null]]},{"t":"Ziel-Last","u":[["imt",null]]},{"t":"Steigern","u":[["imt",null]]},{"t":"Festigen","u":[["imt",null]]}]},"p_sport_erholung_4w":{"z":"sport","n":"Nach dem Sport runterkommen","w":[{"t":"Ausatmen","u":[["lang_aus",3]]},{"t":"Länger aus","u":[["lang_aus",5]]},{"t":"Langsam","u":[["resonanz",5]]},{"t":"Eigene Wahl","u":[["resonanz",5]],"a":[["lang_aus",5]]}]},"p_resonanz_4w":{"z":"resonanz","n":"Resonanz-Atmung","w":[{"t":"Takt finden","u":[["resonanz",5]]},{"t":"Länger","u":[["resonanz",10]]},{"t":"Ruhiger Fluss","u":[["resonanz",12]]},{"t":"Dein Takt","u":[["resonanz",15]]}]}};
// PLAN-ENDE

// ---------- Datum (lokal, sommerzeitfest) ----------
const mitte = (d) => { const x = new Date(d); x.setHours(12, 0, 0, 0); return x; };
export const tagKey = (d) => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
const ausKey = (k) => { const [y, m, t] = k.split('-').map(Number); return new Date(y, m - 1, t, 12); };
export const tageZwischen = (a, b) => Math.round((mitte(b) - mitte(a)) / 864e5);
const plusTage = (d, n) => { const x = mitte(d); x.setDate(x.getDate() + n); return x; };
const WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

// ---------- Zustand ----------
export const zustand = () => speicher.wert('ziel', null);
export const zielInfo = (id) => { const z = ZK.find((x) => x[0] === id); return z && { id: z[0], name: z[1], kurz: z[2], beleg: z[3], p: z[4], p2: z[5] }; };
export function waehle(id, p, d = new Date()) {
  const zi = zielInfo(id); if (!zi) return null;
  const alt = zustand();
  const z = { id, p: p || zi.p, start: tagKey(d), alt: false, vorab: !!(alt && alt.vorab), gesehen: [], seit: new Date(d).toISOString() };
  speicher.setzeWert('zielwahl', 'gewaehlt');
  return speicher.setzeWert('ziel', z);
}
export const setze = (teil) => speicher.setzeWert('ziel', { ...zustand(), ...teil });
export const selbst = () => speicher.wert('selbst', []);
export function selbstWert(w) { const s = selbst(); s.push(w); while (s.length > 2000) s.shift(); speicher.setzeWert('selbst', s); return w; }

// ---------- Tage und Minuten aus dem Protokoll (Übungen + Meditationen) ----------
export function tagMinuten(prot = speicher.protokoll()) {
  const m = {}; for (const e of prot) { if (!e || !e.t || !(e.ist_s > 0)) continue; const k = tagKey(e.t); m[k] = (m[k] || 0) + e.ist_s; }
  return m;   // Sekunden je Tag
}
export const geuebt = (sek) => (sek || 0) >= 60;   // ein Übungstag ab 1 Minute
function serie(m, d) { let n = 0; for (let i = geuebt(m[tagKey(d)]) ? 0 : 1; i < 400; i++) { if (geuebt(m[tagKey(plusTage(d, -i))])) n++; else break; } return n; }
const passt = (e, u) => u[3] === 'm' ? e.technik === 'med:' + u[0] && e.ist_s >= 60 : e.technik === u[0] && (e.ende === 'fertig' || e.ist_s >= 0.8 * (u[1] || 1) * 60);

export function heute(d = new Date(), z = zustand(), prot = speicher.protokoll()) {
  const m = tagMinuten(prot), gesamtTage = Object.values(m).filter(geuebt).length, gesamtMin = Math.round(Object.values(m).reduce((a, b) => a + b, 0) / 60);
  const basis = { m, gesamtTage, gesamtMin, serie: serie(m, d) };
  if (!z || !PLAN[z.p]) { const mo = plusTage(d, -((new Date(d).getDay() + 6) % 7)); return { ...basis, ohne: true, fenster: [0, 1, 2, 3, 4, 5, 6].map((i) => plusTage(mo, i)) }; }
  const plan = PLAN[z.p], tag = Math.max(0, tageZwischen(ausKey(z.start), d));
  const wi = Math.min(plan.w.length - 1, Math.floor(tag / 7)), W = plan.w[wi];
  const einheiten = z.alt && W.a ? [W.a[0], ...W.u.slice(1)] : W.u;
  const tk = tagKey(d), heuteE = prot.filter((e) => e && e.t && tagKey(e.t) === tk);
  const erledigt = einheiten.map((u) => heuteE.some((e) => passt(e, u)));
  const w0 = plusTage(ausKey(z.start), Math.min(wi, 3) * 7), fenster = [0, 1, 2, 3, 4, 5, 6].map((i) => plusTage(w0, i));
  const wocheTage = fenster.filter((f) => geuebt(m[tagKey(f)])).length, wocheMin = Math.round(fenster.reduce((a, f) => a + (m[tagKey(f)] || 0), 0) / 60);
  const zielTage = z.p === 'p_sport_erholung_4w' ? 3 : z.p === 'p_fokus_4w' ? 4 : 5;   // 020-nb N3: Fokus ab 4 Tagen
  // Rückblick: die letzte abgeschlossene Programmwoche, die noch nicht angesehen wurde
  const fertigeWochen = Math.min(4, Math.floor(tag / 7)), rb = fertigeWochen > 0 && !(z.gesehen || []).includes(fertigeWochen) ? fertigeWochen : 0;
  const rbFenster = rb ? [0, 1, 2, 3, 4, 5, 6].map((i) => plusTage(ausKey(z.start), (rb - 1) * 7 + i)) : null;
  const rbTage = rbFenster ? rbFenster.filter((f) => geuebt(m[tagKey(f)])).length : 0, rbMin = rbFenster ? Math.round(rbFenster.reduce((a, f) => a + (m[tagKey(f)] || 0), 0) / 60) : 0;
  return { ...basis, z, plan, tag: tag + 1, woche: wi + 1, fertig: tag >= 28, W, einheiten, erledigt, naechste: einheiten.find((u, i) => !erledigt[i]) || null, fenster, wocheTage, wocheMin, zielTage, rb, rbFenster, rbTage, rbMin };
}

// ---------- Kleinteile ----------
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export { esc };
export const name = (u) => u[3] === 'm' ? ({ atem_beobachten: 'Meditation: Atem beobachten', drei_minuten_pause: 'Meditation: Drei-Minuten-Pause', einschlafen: 'Meditation: Einschlafen', koerperreise: 'Meditation: Körperreise', muskeln_loesen: 'Meditation: Muskeln lösen' }[u[0]] || 'Meditation') : (TECHNIKEN[u[0]] ? TECHNIKEN[u[0]].name : u[0]);
export const dauer = (u) => u[3] === 'm' ? (u[1] === 'kurz' ? 'kurz' : 'normal') : u[0] === 'imt' ? '30 Züge' : u[1] + ' min';
const BELEG = { gut: [3, 'gut belegt'], mittel: [2, 'mittel belegt'], schwach: [1, 'wenig belegt'] };
export const leds = (b) => { const [n, w] = BELEG[b] || [0, 'Praxis']; return `<span class="zl-leds" title="${w}">${[0, 1, 2].map((i) => `<i class="${i < n ? 'an' : ''}"></i>`).join('')}<small>${w}</small></span>`; };
// Wochen-Blume: 7 Blätter, ein Blatt je Tag; leuchtet, wenn geübt (statisch, keine Animation)
export function blume(an, px = 56, heuteI = -1) {
  const b = an.map((x, i) => { const w = i * 360 / 7; return `<ellipse cx="0" cy="-15" rx="7" ry="12.5" transform="rotate(${w.toFixed(1)})" class="${x ? 'an' : ''}${i === heuteI ? ' heute' : ''}"/>`; }).join('');
  return `<svg class="zl-blume" width="${px}" height="${px}" viewBox="-30 -30 60 60" aria-hidden="true">${b}<circle r="7" class="kern"/></svg>`;
}
const pfeil = '<svg class="zl-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
export const zeile = (href, titel, rechts = '', attr = '') => `<a class="zl-zeile" href="${href}" ${attr}><span>${titel}</span><span class="zl-r">${rechts}${pfeil}</span></a>`;
const ZIEL_SYM = {   // gezeichnete Ziel-Symbole (keine Emojis)
  stress: '<path d="M4 15c3-4 5-4 8 0s5 4 8 0"/><path d="M4 9c3-3 5-3 8 0s5 3 8 0"/>',
  leichter_atmen: '<path d="M12 4v7"/><path d="M12 10c-2 0-6 2-6 7 0 2 1 3 3 3s3-2 3-4"/><path d="M12 10c2 0 6 2 6 7 0 2-1 3-3 3s-3-2-3-4"/>',
  schlaf: '<path d="M19 15A8 8 0 0 1 9 5a7 7 0 1 0 10 10z"/>',
  fokus: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>',
  sport: '<path d="M4 13h3l2-5 4 9 2-4h5"/>',
  resonanz: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/><path d="M8 11h2l1-2 2 4 1-2h2"/>'
};
export const zielSym = (id) => `<svg class="zl-sym" viewBox="0 0 24 24" aria-hidden="true">${ZIEL_SYM[id] || '<circle cx="12" cy="12" r="8"/>'}</svg>`;

// ---------- Stil (einmal, nur Klassen zl-*; Farben aus den Token mit Rückfall auf 0.1.5) ----------
export function stil() {
  if (document.getElementById('zl-stil')) return;
  const s = document.createElement('style'); s.id = 'zl-stil';
  s.textContent = `.zl{--zl-ein:var(--ein,var(--akzent,#5ad2ea));--zl-aus:var(--aus,#f4a261);--zl-t1:var(--t1,var(--text,#eef2f6));--zl-t2:var(--t2,var(--leise,#b0bccb));--zl-fl:var(--fl2,var(--fl,#1d2734));--zl-fl3:var(--fl3,#283445);--zl-li:var(--linie,#2e3b4c)}
.zl-karte{background:var(--zl-fl);border-radius:16px;padding:14px 16px;margin:0 0 12px;color:var(--zl-t1);display:block;text-decoration:none}
.zl-ueber{display:block;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--zl-t2);margin-bottom:4px}
.zl-titel{font-size:20px;font-weight:700;margin:0 0 8px;line-height:1.2}
.zl-chips{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px}.zl-chip{background:var(--zl-fl3);color:var(--zl-t1);border-radius:999px;padding:4px 10px;font-size:13px}
.zl-los{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:56px;border:0;border-radius:16px;background:var(--zl-ein);color:var(--ein-ink,#06151c);font:inherit;font-size:18px;font-weight:700;cursor:pointer}
.zl-los.zweit{background:var(--zl-fl3);color:var(--zl-t1);min-height:48px;font-size:16px}
.zl-zeile{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px;padding:6px 2px;color:var(--zl-t1);text-decoration:none;border-top:1px solid var(--zl-li)}
.zl-zeile:first-child{border-top:0}.zl-r{display:flex;align-items:center;gap:6px;color:var(--zl-t2);font-size:14px}
.zl-chev{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}[dir=rtl] .zl-chev{transform:scaleX(-1)}
.zl-sym{width:26px;height:26px;fill:none;stroke:var(--zl-ein);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}
.zl-ziele{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}
.zl-kachel{display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-height:96px;padding:12px;border-radius:14px;background:var(--zl-fl3);color:var(--zl-t1);border:0;font:inherit;text-align:start;cursor:pointer}
.zl-kachel b{font-size:15px;line-height:1.2}.zl-kachel.an{outline:2px solid var(--zl-ein)}
.zl-leds{display:inline-flex;align-items:center;gap:3px}.zl-leds i{width:7px;height:7px;border-radius:50%;background:var(--led-aus,var(--zl-li))}.zl-leds i.an{background:var(--led-an,var(--zl-ein))}.zl-leds small{margin-inline-start:4px;color:var(--zl-t2);font-size:12px}
.zl-blume ellipse{fill:var(--zl-fl3);stroke:var(--zl-li);stroke-width:.8}.zl-blume ellipse.an{fill:var(--zl-aus);stroke:none}.zl-blume ellipse.heute{stroke:var(--zl-ein);stroke-width:2}.zl-blume .kern{fill:var(--zl-t2)}
.zl-ziel{display:flex;align-items:center;gap:12px}.zl-ziel b{display:block}.zl-ziel span{color:var(--zl-t2);font-size:14px}
.zl-leise{color:var(--zl-t2);font-size:13px;margin:6px 0}.zl-mini{color:var(--t3,var(--zl-t2));font-size:12px;margin:8px 0}
.zl-link{background:none;border:0;color:var(--zl-ein);font:inherit;font-size:14px;padding:10px 8px;margin-inline-start:-8px;min-height:44px;min-width:44px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
.zl-zwei{display:flex;gap:8px;margin-top:10px}.zl-zwei>*{flex:1}
.zl-tage{display:flex;justify-content:space-between;gap:4px;margin:10px 0}.zl-tag{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:12px;color:var(--zl-t2)}
.zl-tag i{width:30px;height:30px;border-radius:50%;background:var(--zl-fl3);display:flex;align-items:center;justify-content:center}.zl-tag i.an{background:var(--zl-aus)}.zl-tag i.heute{box-shadow:inset 0 0 0 2px var(--zl-ein)}
.zl-tag i.an:after{content:"";width:9px;height:5px;border:2px solid #1a1206;border-top:0;border-right:0;transform:rotate(-45deg) translate(1px,-1px)}
.zl-seg{display:flex;gap:4px;margin:6px 0 10px}.zl-seg i{flex:1;height:6px;border-radius:3px;background:var(--zl-fl3)}.zl-seg i.an{background:var(--zl-ein)}.zl-seg i.jetzt{background:linear-gradient(90deg,var(--zl-ein) 50%,var(--zl-fl3) 50%)}
.zl-schieber{display:block;margin:10px 0}.zl-schieber input{width:100%;min-height:44px;accent-color:var(--zl-ein)}.zl-schieber b{float:inline-end}
.zl-i{display:flex;gap:8px;align-items:flex-start;color:var(--zl-t2);font-size:13px;background:var(--hinweis-bg,transparent);border-radius:12px;padding:8px 10px;margin:8px 0}
.zl-i:before{content:"i";flex:none;width:18px;height:18px;border-radius:50%;border:1.5px solid var(--hinweis-i,var(--zl-t2));display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;font-style:normal}
.zl details>summary{color:var(--zl-ein);cursor:pointer;min-height:44px;display:flex;align-items:center;list-style:none}.zl details>summary::-webkit-details-marker{display:none}
.zl-kurve{width:100%;height:56px}.zl-kurve polyline{fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}.zl-kurve .vor{stroke:var(--zl-t2)}.zl-kurve .nach{stroke:var(--zl-ein)}.zl-kurve circle{fill:var(--zl-ein)}
.zl-zahl{font-size:26px;font-weight:700}.zl-stat{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center}.zl-stat small{display:block;color:var(--zl-t2);font-size:12px}
.zl-schritte{counter-reset:s;list-style:none;padding:0;margin:8px 0}.zl-schritte li{counter-increment:s;display:flex;gap:10px;align-items:flex-start;margin:10px 0}.zl-schritte li:before{content:counter(s);flex:none;width:26px;height:26px;border-radius:50%;background:var(--zl-fl3);display:flex;align-items:center;justify-content:center;font-weight:700}
.zl-bild{width:72px;height:72px;flex:none}.zl-code{font-family:ui-monospace,monospace;font-size:14px;word-break:break-all;background:var(--zl-fl3);border-radius:10px;padding:8px 10px;user-select:all}
.zl-schalter{display:flex;align-items:center;justify-content:space-between;min-height:52px;gap:12px}.zl-schalter input{width:52px;height:30px;accent-color:var(--zl-ein)}`;
  document.head.appendChild(s);
}

// ---------- Heute ----------
let CTX = null;
const tw = (d) => WT[new Date(d).getDay()];
export function zeigeHeute(box, ctx = {}) {
  CTX = ctx; stil(); box.classList.add('zl');
  const z = zustand(), wahl = speicher.wert('zielwahl', null), h = heute();
  const er = speicher.wert('erinnerung', null);
  const erZeile = zeile('#erinnerung', 'Erinnerung', er && er.an ? esc(er.zeit) : 'einrichten');
  if (!z) {
    if (wahl === 'spaeter') { box.innerHTML = `<div class="zl-karte">${zeile('#ziel', 'Ziel wählen', 'z. B. Stress senken')}${erZeile}</div>`; return; }
    box.innerHTML = `<div class="zl-karte" id="zl-wahl"><h2 class="zl-titel">Was ist dein Ziel?</h2><div class="zl-ziele">${ZK.map(([id, n]) => `<button class="zl-kachel" data-zl-ziel="${id}">${zielSym(id)}<b>${esc(n)}</b></button>`).join('')}</div>
      <button class="zl-link" data-zl-spaeter>Später</button></div>`;
    box.addEventListener('pointerdown', () => import('./ziele-daten.js').catch(() => {}), { once: true });   // Texte schon beim Antippen holen
    box.onclick = (e) => { const k = e.target.closest('[data-zl-ziel]'); if (k) return zielBlatt(k.dataset.zlZiel, ctx).then((ok) => { if (ok && box.isConnected) { if (ctx.route && document.querySelector('.karte.naechste')) ctx.route(); else zeigeHeute(box, ctx); } }); /* 020-nb: ganze Heute-Seite neu – sonst bleibt die alte „Für den Anfang“-Karte (zweimal „Jetzt starten“) */ if (e.target.closest('[data-zl-spaeter]')) { speicher.setzeWert('zielwahl', 'spaeter'); zeigeHeute(box, ctx); } };
    return;
  }
  const zi = zielInfo(z.id), heuteI = h.fenster.findIndex((f) => tagKey(f) === tagKey(new Date()));
  let haupt;
  if (h.fertig) {
    const dn = DANACH[z.p] || 'Bleib dabei, wenn es dir guttut.';   // 020-nb M3: nur belegte Sätze (recherche/ziele.json danach_ui), kein Wirkungsversprechen
    haupt = `<div class="zl-karte"><span class="zl-ueber">${h.gesamtTage ? '4 Wochen geschafft' : '4 Wochen vorbei'}</span><h2 class="zl-titel">${esc(zi.name)}</h2><p class="zl-leise">${h.gesamtTage ? `Du hast an ${h.gesamtTage} ${h.gesamtTage === 1 ? 'Tag' : 'Tagen'} geübt. ${esc(dn)}` : 'Du kannst jederzeit neu beginnen.'}</p>
      <button class="zl-los" data-zl-los>Weiterüben · ${esc(dauer(h.einheiten[0]))}</button><div class="zl-zwei"><a class="zl-los zweit" href="#ziel">Anderes Ziel</a><button class="zl-los zweit" data-zl-neu>Wiederholen</button></div></div>`;
  } else if (h.naechste) {
    const u = h.naechste, mehrere = h.einheiten.length > 1 ? ` · ${h.erledigt.filter(Boolean).length + 1} von ${h.einheiten.length}` : '';
    const alt = h.W.a && !z.alt ? h.W.a[0] : z.alt ? h.W.u[0] : null;
    haupt = `<div class="zl-karte"><span class="zl-ueber">Woche ${h.woche} von 4${mehrere}</span><h2 class="zl-titel">${esc(name(u))}</h2><div class="zl-chips"><span class="zl-chip">${esc(dauer(u))}</span>${u[2] ? `<span class="zl-chip">${esc(variName(u))}</span>` : ''}</div>
      <button class="zl-los" data-zl-los>Jetzt starten</button>${alt ? zeile('#', 'Lieber anders?', esc(name(alt)), 'data-zl-alt') : ''}${vorherHtml(z)}</div>`;
  } else {
    haupt = `<div class="zl-karte"><span class="zl-ueber">Woche ${h.woche} von 4</span><h2 class="zl-titel">Heute geschafft</h2><p class="zl-leise">${h.W.o ? 'Wenn du magst: ' + esc(name(h.W.o[0])) + ' · ' + esc(dauer(h.W.o[0])) : 'Morgen geht es weiter.'}</p>${h.W.o ? '<button class="zl-los zweit" data-zl-opt>Noch eine Runde</button>' : ''}</div>`;
  }
  const rb = h.rb ? rueckblickHtml(h, z) : '';
  const zielK = `<a class="zl-karte zl-ziel" href="#fortschritt">${blume(h.fenster.map((f) => geuebt(h.m[tagKey(f)])), 56, heuteI)}<span style="flex:1"><b>${esc(zi.name)}</b><span>${h.wocheTage} von ${h.zielTage} Tagen · ${h.wocheMin} min</span></span>${pfeil}</a>`;
  box.innerHTML = haupt + morgenHtml(z) + (rb || zielK) + `<div class="zl-karte">${erZeile}</div>`;
  box.onclick = (e) => {
    const t = e.target;
    if (t.closest('[data-zl-los]')) { const u = h.fertig ? h.einheiten[0] : h.naechste; return starteEinheit(u, ctx); }
    if (t.closest('[data-zl-opt]')) return starteEinheit(h.W.o[0], ctx);
    if (t.closest('[data-zl-alt]')) { e.preventDefault(); setze({ alt: !z.alt }); return zeigeHeute(box, ctx); }
    if (t.closest('[data-zl-neu]')) { waehle(z.id, z.p); return zeigeHeute(box, ctx); }
    const r = t.closest('[data-zl-rb]');
    if (r) { const w = r.dataset.zlRb, g = [...(z.gesehen || []), h.rb];
      if (w === 'wiederholen') setze({ gesehen: g.filter((x) => x !== h.rb), start: tagKey(plusTage(ausKey(z.start), 7)) });
      else if (w === 'andere') setze({ gesehen: g, alt: !z.alt }); else setze({ gesehen: g });
      return zeigeHeute(box, ctx); }
    const m = t.closest('[data-zl-morgen]'); if (m) { const f = box.querySelector('#zl-ein'), e2 = box.querySelector('#zl-erh'); selbstWert({ t: new Date().toISOString(), a: 'einschlafen', w: +f.value }); selbstWert({ t: new Date().toISOString(), a: 'erholt', w: +e2.value }); return zeigeHeute(box, ctx); }
  };
  box.oninput = (e) => { const i = e.target; if (i.id === 'zl-vor') { i.dataset.an = '1'; box.querySelector('#zl-vorw').textContent = i.value; speicher.setzeWert('zvor', { t: Date.now(), w: +i.value }); } if (i.id === 'zl-ein' || i.id === 'zl-erh') box.querySelector('#' + i.id + 'w').textContent = i.value + (i.id === 'zl-ein' ? ' min' : ''); };
}
const variName = (u) => { const T = TECHNIKEN[u[0]], v = T && T.varianten.find((x) => x.id === u[2]); return v ? v.name : u[2]; };
const mitStress = (z) => ['stress', 'fokus', 'resonanz', 'sport'].includes(z.id);
const vorherHtml = (z) => mitStress(z) ? `<details class="zl-vor"><summary>Anspannung vorher (freiwillig)</summary><label class="zl-schieber">0 = ganz ruhig · 10 = sehr angespannt <b id="zl-vorw">–</b><input type="range" min="0" max="10" value="5" id="zl-vor"></label></details>` : '';
function morgenHtml(z) {   // Schlaf: morgens kurz schätzen (Schlaftagebuch-Prinzip), freiwillig, einmal am Tag
  if (z.id !== 'schlaf' || new Date().getHours() >= 12 || selbst().some((s) => s.a === 'erholt' && tagKey(s.t) === tagKey(new Date()))) return '';
  return `<div class="zl-karte"><details><summary>Wie war die Nacht? (freiwillig)</summary><label class="zl-schieber">Eingeschlafen nach etwa <b id="zl-einw">20 min</b><input type="range" min="0" max="120" step="5" value="20" id="zl-ein"></label>
    <label class="zl-schieber">Erholt aufgewacht (0–10) <b id="zl-erhw">5</b><input type="range" min="0" max="10" value="5" id="zl-erh"></label><button class="zl-los zweit" data-zl-morgen>Eintragen</button><p class="zl-mini">Nur grob schätzen – nicht auf die Uhr schauen.</p></details></div>`;
}
function rueckblickHtml(h, z) {
  const tage = h.rbFenster.map((f) => `<span class="zl-tag"><i class="${geuebt(h.m[tagKey(f)]) ? 'an' : ''}"></i>${tw(f)}</span>`).join('');
  const naechste = h.rb < 4 ? PLAN[z.p].w[h.rb] : null, wenig = h.rbTage < 3;
  return `<div class="zl-karte"><span class="zl-ueber">Deine Woche ${h.rb}</span><div class="zl-tage">${tage}</div><p>Du hast an ${h.rbTage} ${h.rbTage === 1 ? 'Tag' : 'Tagen'} geübt · ${h.rbMin} min.</p>
    ${naechste ? `<p class="zl-leise">Nächste Woche: ${esc(name(naechste.u[0]))} · ${esc(dauer(naechste.u[0]))}</p>` : ''}
    ${wenig && h.rb < 4 ? '<p class="zl-leise">Woche wiederholen? Das ist ganz normal.</p><div class="zl-zwei"><button class="zl-los zweit" data-zl-rb="wiederholen">Wiederholen</button><button class="zl-los zweit" data-zl-rb="weiter">Weiter</button></div>'
      : `<p class="zl-leise">Passt die Übung?</p><div class="zl-zwei"><button class="zl-los zweit" data-zl-rb="weiter">Weiter so</button><button class="zl-los zweit" data-zl-rb="andere">Andere Übung</button></div>`}</div>`;
}
// Ein Tipp startet: der Ton entsteht im Tipp (ctx.starteUebung ruft app.js starte() ohne await davor)
export function starteEinheit(u, ctx = CTX || {}) {
  if (!u) return;
  if (u[3] === 'm') { location.hash = '#meditation/' + u[0]; return; }
  if (ctx.starteUebung) ctx.starteUebung(u[0], { min: u[1], v: u[2] || null }, 'ziel:' + (zustand() || {}).id);
  else location.hash = '#uebung/' + u[0] + (u[1] ? '?d=' + u[1] + (u[2] ? '&v=' + u[2] : '') : '');
}

// ---------- Ziel-Wahl (Blatt von unten) ----------
export async function zielBlatt(id, ctx = CTX || {}) {
  const zi = zielInfo(id); if (!zi || !ctx.blatt) return false;
  const D = await import('./ziele-daten.js'), T = D.ZT[id], P = D.PT[zi.p];
  const w = await ctx.blatt(`<div class="zl">${zielSym(id)}<h2>${esc(zi.name)}</h2><p>${esc(zi.kurz)}</p>${leds(zi.beleg)}
    <details><summary>Was Studien zeigen</summary><p class="zl-leise">${esc(T.belegt)}</p><p class="zl-leise">${esc(T.nicht)}</p>${id === 'schlaf' ? `<p class="zl-leise">${esc((D.H.h_schlaf_dauer || { x: [''] }).x[0])}</p>` : ''}${id === 'stress' ? `<p class="zl-leise">${esc((D.H.h_ruhe_unruhig || { x: [''] }).x[0])}</p>` : ''}</details>
    <p class="zl-leise">4 Wochen · ${esc(String(P.min))} min am Tag · ${esc(P.tage)}</p>
    ${zi.p2 ? `<p class="zl-i">${esc((D.H.h_imt_gegen || { x: [''] }).x[0])}</p><div class="zl-zwei"><button class="zl-los zweit" data-w="p2">Ohne Gerät</button><button class="zl-los" data-w="p1">Mit Einatem-Trainer</button></div>`
      : `<div class="zl-zwei"><button class="zl-los zweit" data-w="nein">Zurück</button><button class="zl-los" data-w="p1">Ziel wählen</button></div>`}
    <p class="zl-mini">${esc(D.H.h_ziel_allgemein.x[0])}</p></div>`);
  if (w !== 'p1' && w !== 'p2') return false;
  const z = waehle(id, w === 'p2' ? zi.p2 : zi.p);
  if (id === 'leichter_atmen' && !z.vorab) { await vorabBlatt(ctx, D); setze({ vorab: true }); }
  return true;
}
const DANACH = { p_stress_4w: 'Weiterüben lohnt sich: Neue Gewohnheiten brauchen oft rund zwei Monate, bis sie von selbst laufen.', p_leichter_4w: 'In den Studien wurde über Monate weitergeübt. Bleib dabei, wenn es dir guttut.' };
export function vorabBlatt(ctx, D) {   // „Kurz vorab“: genau einmal bei „Leichter atmen“, danach nur über das kleine i
  const h = D.H.h_atemnot_einmal;
  return ctx.blatt(`<div class="zl"><h2>${esc(h.t || 'Kurz vorab')}</h2><ul>${h.x.map((t) => `<li>${esc(t)}</li>`).join('')}</ul><button class="zl-los" data-w="ok">Verstanden</button></div>`);
}

// ---------- Ziel-Seite (#ziel) ----------
export async function zeigeZielSeite(box, ctx) {
  CTX = ctx; stil(); box.classList.add('zl');
  const D = await import('./ziele-daten.js'), z = zustand();
  box.innerHTML = `<p class="zl-leise">Wähle, was dir gerade am wichtigsten ist. Du kannst es jederzeit ändern.</p><div class="zl-ziele">${ZK.map(([id, n, k, b]) => `<button class="zl-kachel${z && z.id === id ? ' an' : ''}" data-zl-ziel="${id}">${zielSym(id)}<b>${esc(n)}</b>${leds(b)}${z && z.id === id ? '<small>dein Ziel</small>' : ''}</button>`).join('')}</div>
    ${z && z.id === 'leichter_atmen' ? '<button class="zl-link" data-zl-vorab>i · Kurz vorab nochmal lesen</button>' : ''}
    <p class="zl-mini">${esc(D.H.h_ziel_allgemein.x[0])}</p>`;
  box.onclick = async (e) => { const k = e.target.closest('[data-zl-ziel]'); if (k) { if (await zielBlatt(k.dataset.zlZiel, ctx)) location.hash = '#start'; return; } if (e.target.closest('[data-zl-vorab]')) vorabBlatt(ctx, D); };
}

// ---------- Router-Haken ----------
const TITEL = { ziel: 'Dein Ziel', fortschritt: 'Fortschritt', erinnerung: 'Erinnerung', health: 'Achtsamkeitsminuten' };
export async function zeigeSeite(a, box, ctx) {
  CTX = ctx;
  if (ctx.seite && (!box || !box.id || box.id === 'inhalt')) { ctx.seite(TITEL[a] || 'Atem', `<section id="zl-seite"></section>`, a === 'fortschritt' ? 'fortschritt' : 'mehr', a === 'fortschritt' ? 1 : 2); box = document.getElementById('zl-seite'); }
  if (a === 'ziel') return zeigeZielSeite(box, ctx);
  if (a === 'fortschritt') return (await import('./fortschritt.js')).fuelle(box, ctx);
  if (a === 'erinnerung') return (await import('./erinnerung.js')).fuelle(box, ctx);
  if (a === 'health') return (await import('./health.js')).fuelle(box, ctx);
}
export const zeigeFortschritt = (box, ctx) => import('./fortschritt.js').then((m) => m.fuelle(box, ctx));

// ---------- Ende-Blatt (synchron, Modul ist dann schon geladen) ----------
const android = () => /Android/i.test(navigator.userAgent || '');
export const healthLink = (min) => 'shortcuts://run-shortcut?name=' + encodeURIComponent('Atem-Minuten') + '&input=text&text=' + Math.max(1, Math.round(min));
export function endeHtml(eintrag) {
  const z = zustand(), hs = speicher.wert('health', { an: false }); let x = '';
  const min = Math.round((eintrag.ist_s || 0) / 60);
  if (z && eintrag.ist_s >= 30 && eintrag.ende !== 'abbruch') {
    if (mitStress(z)) x += `<label class="zl-schieber zl">Anspannung jetzt? (freiwillig) <b id="zl-nachw">–</b><input type="range" min="0" max="10" value="5" id="zl-nach"></label>`;
    else if (z.id === 'leichter_atmen' && !selbst().some((s) => s.a === 'leicht' && tagKey(s.t) === tagKey(new Date()))) x += `<label class="zl-schieber zl">Wie leicht fiel dir das Atmen heute? <b id="zl-nachw">–</b><input type="range" min="0" max="10" value="5" id="zl-nach"></label>`;
  }
  if (hs.an && min >= 1 && !android()) x += `<a class="zl-los zweit zl-health" href="${healthLink(min)}">In Health eintragen · ${min} min</a>`;
  if (x) setTimeout(() => { const i = document.getElementById('zl-nach'); if (i) i.addEventListener('input', () => { i.dataset.an = '1'; const b = document.getElementById('zl-nachw'); if (b) b.textContent = i.value; }); }, 0);
  return x ? `<div class="zl">${x}</div>` : '';
}
export function nachEnde(eintrag) {
  const z = zustand(), i = document.getElementById('zl-nach');
  if (z && i && i.dataset.an) selbstWert({ t: eintrag.t, a: z.id === 'leichter_atmen' ? 'leicht' : 'stress_nach', w: +i.value });
  const v = speicher.wert('zvor', null);
  if (z && v && Date.now() - v.t < 3600e3 && mitStress(z)) { selbstWert({ t: eintrag.t, a: 'stress_vor', w: v.w }); speicher.setzeWert('zvor', null); }
}

// ---------- Leerlauf beim Öffnen: Erinnerung nachplanen (nur wenn an und fällig; lädt erinnerung.js erst dann) ----------
export function leerlauf() {
  const e = speicher.wert('erinnerung', null);
  if (!e || !e.an || !e.thema) return Promise.resolve('aus');
  if (Date.now() - (e.zuletzt || 0) < 12 * 3600e3 && e.sig === JSON.stringify([e.zeit, e.tage, e.thema])) return Promise.resolve('aktuell');
  return import('./erinnerung.js').then((m) => m.planen()).catch(() => 'fehler');
}
