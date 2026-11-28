// Atem 0.2.3 – Summ-Atmung mit Mikrofon-Rückmeldung (#klang/summen). Das Mikrofon wird nur hier auf dem Gerät ausgewertet:
// Lautstärke und Anteil tiefer Töne je Bild (kein Aufnehmen, kein Speichern von Ton, nichts wird gesendet).
// Ablauf: kurz still (Grundrauschen messen) → 4 s durch die Nase ein → summen, solange es angenehm ist → die App misst die Summ-Dauer.
// Ehrlich: Die Erkennung ist eine Schätzung (Geräusche, Abstand, automatische Pegelanpassung des Geräts können sie stören).

// Erkenner (rein, testbar): db = Pegel in dBFS, tief = Anteil der Energie unter 600 Hz (0 … 1), t = Zeit in ms
export function erzeugeErkenner(o = {}) {
  let boden = o.boden ?? -70, an = false, kStart = null, letzt = null, beginn = null;
  const AN_MS = o.anMs ?? 150, AUS_MS = o.ausMs ?? 500;
  return {
    setzeBoden(db) { boden = db; },
    boden: () => boden,
    schritt(db, tief, t) {
      const schwelle = an ? Math.max(boden + 7, -62) : Math.max(boden + 12, -56);
      const klingt = db > schwelle && tief >= (an ? 0.45 : 0.55);
      if (klingt) { if (kStart == null) kStart = t; letzt = t; } else kStart = null;
      if (!an && kStart != null && t - kStart >= AN_MS) { an = true; beginn = kStart; return { an, neu: true, beginn }; }
      if (an && letzt != null && t - letzt >= AUS_MS) { an = false; const d = letzt - beginn; beginn = null; return { an, fertig: d }; }
      return { an, laeuft_ms: an ? t - beginn : 0 };
    }
  };
}
export function median(a) { if (!a.length) return -70; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; }

const CSS = `
.su-held{display:grid;grid-template-columns:72px 1fr;gap:12px;align-items:center;background:linear-gradient(160deg,color-mix(in srgb,var(--lila,#c79bff) 16%,var(--fl1)) 0%,var(--fl1) 60%);border-radius:var(--r3,28px);padding:16px}
.su-held h2{margin:0 0 4px}.su-held p{margin:0;font:var(--f-klein);color:var(--t2)}
.su-sym{width:72px;height:72px;border-radius:20px;background:var(--fl2);display:flex;align-items:center;justify-content:center;color:var(--lila,#c79bff)}.su-sym svg{width:44px;height:44px}
.su-schritte{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}.su-schritte div{background:var(--fl1);border-radius:16px;padding:10px;font:var(--f-mini);color:var(--t2);display:flex;flex-direction:column;gap:4px}.su-schritte b{font:var(--f-klein);font-weight:650;color:var(--t1)}
.su-schritte i{font-style:normal;width:24px;height:24px;border-radius:50%;background:var(--fl3);color:var(--t1);display:flex;align-items:center;justify-content:center;font:600 13px var(--font)}
.su-live{--su-farbe:#5ad2ea}.su-live.summt{--su-farbe:#c79bff}
.su-ring{position:relative;width:min(70vw,40vh,300px);aspect-ratio:1;display:flex;align-items:center;justify-content:center}
.su-ring i{position:absolute;inset:0;border-radius:50%;will-change:transform,opacity}
.su-ring .su-hof{background:radial-gradient(closest-side,color-mix(in srgb,var(--su-farbe) 55%,transparent),transparent)}
.su-ring .su-kern{background:radial-gradient(circle at 40% 35%,color-mix(in srgb,var(--su-farbe) 55%,#fff) 0%,var(--su-farbe) 50%,color-mix(in srgb,var(--su-farbe) 35%,#0b1020) 100%)}
.su-text{position:relative;text-align:center;color:#081018}.su-text b{display:block;font:650 30px/1.1 var(--font)}.su-text span{font:200 56px/1 var(--font);font-variant-numeric:tabular-nums}
.su-pegel{height:8px;border-radius:4px;background:rgba(255,255,255,.1);overflow:hidden;margin:16px auto 0;width:min(70vw,300px)}.su-pegel i{display:block;height:100%;background:var(--su-farbe);transform-origin:left;transform:scaleX(0)}
.su-balken{display:flex;align-items:flex-end;gap:5px;height:76px;justify-content:center;margin:6px 0}.su-balken div{display:flex;flex-direction:column;align-items:center;gap:2px;font:var(--f-mini);font-size:11px;color:var(--t2)}.su-balken b{display:block;width:16px;border-radius:5px 5px 2px 2px;background:#c79bff}
.su-stand{display:flex;justify-content:center;gap:14px;flex-wrap:wrap;font:var(--f-klein);color:var(--t2)}.su-stand b{color:#eef2f6;font-weight:600}
.su-meldung{min-height:22px;text-align:center;font:var(--f-klein);color:#ffcf5c;margin:2px 0}
@media (orientation:landscape){.su-live .kl-sp-mitte{flex-direction:column}.su-ring{width:min(38vw,52vh,260px)}}
`;
let stilDa = false;
const stil = () => { if (stilDa) return; stilDa = true; const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); };
const SV = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const MUND = '<path d="M7 9.5c0-2.8 2.2-5 5-5s5 2.2 5 5v3c0 2.8-2.2 5-5 5s-5-2.2-5-5z"/><path d="M9.5 13.5h5"/><path d="M19.5 9c1 1.8 1 4.2 0 6M4.5 9c-1 1.8-1 4.2 0 6"/>';
const ZU = '<path d="M6 6l12 12M18 6L6 18"/>', STOPP = '<rect x="7" y="7" width="10" height="10" rx="2"/>';
const mmss = (s) => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

export function zeige(c) {
  stil();
  const sp = c.speicher, e = { min: 3, ...(sp.wert('summen', {}) || {}) };
  const bisher = sp.protokoll().filter((p) => p.variante === 'mikro' && p.laengste_s > 0).reduce((a, p) => Math.max(a, p.laengste_s), 0);
  const kannMikro = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && !!(window.AudioContext || window.webkitAudioContext);
  c.seite('Summ-Atmung', `<div class="kl"><div class="kl-raster"><div>
    <section class="su-held"><span class="su-sym">${SV(MUND)}</span><div><span class="ueber">Mit Mikrofon</span><h2>Summ-Atmung</h2><p>Durch die Nase ein, Mund zu, lange „mmm“. Die App hört mit und zeigt, wie lange du summst.</p></div></section>
    <div class="su-schritte"><div><i>1</i><b>Still sein</b>2 Sekunden, die App hört den Raum</div><div><i>2</i><b>Einatmen</b>4 Sekunden durch die Nase</div><div><i>3</i><b>Summen</b>so lange es angenehm ist</div></div>
    <div class="kl-tipp"><svg class="kl-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg><span>Das Mikrofon wird nur hier auf deinem Gerät ausgewertet – nur Lautstärke und Tonlage. Nichts wird aufgenommen, gespeichert oder gesendet. Beim Beenden geht es aus.</span></div>
    </div><div>
    <span class="kl-lbl">Dauer</span><div class="seg" role="group" aria-label="Dauer">${[1, 3, 5].map((m) => `<button class="chip ${e.min === m ? 'an' : ''}" data-m="${m}" aria-pressed="${e.min === m}">${m} min</button>`).join('')}</div>
    ${bisher ? `<p class="leise">Dein bisher längstes Summen: <b>${bisher} s</b></p>` : ''}
    ${kannMikro ? '<button class="knopf haupt voll kl-start" id="su-los">Mikrofon an und starten</button>' : '<p class="hinweis">Dieser Browser gibt hier kein Mikrofon frei.</p>'}
    <a class="knopf zweit voll kl-start" href="#uebung/summen">Ohne Mikrofon üben</a>
    <div class="kl-ampel" style="margin-top:16px"><details class="kl-a"><summary><i class="kl-pkt gelb"></i><b>Was Summen bringt</b><small>unsicher</small></summary><p>Summen macht das Ausatmen von selbst lang – das beruhigt eher. In der Nase steigt beim Summen ein Botenstoff (Stickstoffmonoxid) etwa 15-fach an (Messstudie, 10 Personen). Ob das der Gesundheit nützt, ist offen.</p></details>
      <details class="kl-a"><summary><i class="kl-pkt gelb"></i><b>Wie genau misst die App?</b><small>Schätzung</small></summary><p>Sie zählt, solange es deutlich lauter als der Raum ist und tiefe Töne überwiegen. Sprechen, Musik oder Lüfter können sie täuschen; manche Geräte regeln die Mikrofon-Lautstärke selbst nach. Nimm die Sekunden als Anhalt, nicht als Messwert.</p></details>
      <details class="kl-a"><summary><i class="kl-pkt leer"></i><b>Gut zu wissen</b><small>Sicherheit</small></summary><p>Bei verstopfter Nase lieber „Länger ausatmen“. Nicht pressen: Summe leise und bequem. Wird dir schwindlig, atme normal weiter.</p></details></div>
    </div></div></div>`, 'mehr', 3);
  const i = document.getElementById('inhalt');
  i.onclick = (ev) => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.m) { e.min = +b.dataset.m; sp.setzeWert('summen', { min: e.min }); b.parentNode.querySelectorAll('.chip').forEach((x) => { x.classList.toggle('an', x === b); x.setAttribute('aria-pressed', x === b); }); }
    else if (b.id === 'su-los') starte(c, e.min);
  };
}

function starte(c, min) {
  const AC = window.AudioContext || window.webkitAudioContext, ctx = new AC();   // im Tipp anlegen (iOS), Mikrofon danach
  try { const r = ctx.resume(); if (r && r.catch) r.catch(() => {}); } catch {}
  const v = document.createElement('div'); v.className = 'kl-spieler su-live'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-label', 'Summ-Atmung');
  v.innerHTML = `<div class="kl-sp-kopf"><button class="knopf-ico" data-k="zu" aria-label="Beenden">${SV(ZU)}</button><div class="kl-sp-titel">Summ-Atmung</div><span class="kl-sp-rest" id="su-rest">${mmss(min * 60)}</span></div>
    <div class="kl-sp-mitte"><div><div class="su-ring"><i class="su-hof"></i><i class="su-kern"></i><div class="su-text"><b id="su-wort">Mikrofon …</b><span id="su-zahl"></span></div></div><div class="su-pegel"><i id="su-pegel"></i></div><p class="su-meldung" id="su-meldung" aria-live="polite"></p></div></div>
    <div><div class="su-balken" id="su-balken" aria-label="Deine Summ-Dauern"></div><div class="su-stand"><span>Gesummt <b id="su-ges">0:00</b></span><span>Längstes <b id="su-max">0 s</b></span><span>Züge <b id="su-n">0</b></span></div></div>
    <div class="kl-sp-unten"><span></span><button class="kl-sp-pause" data-k="ende" aria-label="Beenden und auswerten">${SV(STOPP)}</button><span></span></div>
    <div class="kl-sp-blatt" hidden></div>`;
  document.body.appendChild(v); document.body.classList.add('in-sitzung'); if (c.tippSperre) c.tippSperre();
  const $ = (s) => v.querySelector(s), wort = $('#su-wort'), zahl = $('#su-zahl'), pegelEl = $('#su-pegel'), meldung = $('#su-meldung'), kern = $('.su-kern'), hof = $('.su-hof'), blatt = $('.kl-sp-blatt');
  let strom = null, an = null, raf = 0, zustand = 'start', phaseAb = 0, startT = 0, wake = null, kalib = [], summen = [], ende = false, lZahl = '';
  const erk = erzeugeErkenner(), dauer = min * 60 * 1000, frei = new Float32Array(2048), spek = new Float32Array(1024);
  const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const zeigeBlatt = (h) => { blatt.innerHTML = '<div>' + h + '</div>'; blatt.hidden = false; };
  function stopMikro() { try { if (strom) strom.getTracks().forEach((t) => t.stop()); } catch {} strom = null; try { if (ctx.state !== 'closed') { const r = ctx.close(); if (r && r.catch) r.catch(() => {}); } } catch {} try { if (wake) wake.release(); } catch {} wake = null; }
  function zu() { cancelAnimationFrame(raf); raf = 0; stopMikro(); aufraeumen(); v.remove(); if (!document.querySelector('.kl-spieler, .md-spieler') && document.getElementById('sitzung').hidden) document.body.classList.remove('in-sitzung'); }
  function balken() {
    const max = Math.max(10, ...summen.map((s) => s.d)), letzte = summen.slice(-12);
    $('#su-balken').innerHTML = letzte.map((s) => `<div><b style="height:${Math.max(4, Math.round(56 * s.d / max))}px"></b>${Math.round(s.d)}</div>`).join('');
    const ges = summen.reduce((a, s) => a + s.d, 0); $('#su-ges').textContent = mmss(ges); $('#su-max').textContent = Math.round(Math.max(0, ...summen.map((s) => s.d))) + ' s'; $('#su-n').textContent = summen.length;
  }
  function schluss(grund) {
    if (ende) return; ende = true; cancelAnimationFrame(raf); raf = 0; const ist = Math.round((performance.now() - startT) / 1000), ges = summen.reduce((a, s) => a + s.d, 0), lang = Math.round(Math.max(0, ...summen.map((s) => s.d)));
    stopMikro();
    if (startT && ist >= 30) try { c.speicher.eintrag({ t: new Date().toISOString(), technik: 'summen', variante: 'mikro', plan_s: min * 60, ist_s: ist, ende: grund, quelle: 'klang', summ_s: Math.round(ges), laengste_s: lang, zuege: summen.length }); } catch {}
    zeigeBlatt(`<h2>${grund === 'fertig' ? 'Fertig' : 'Beendet'} · ${summen.length} Züge</h2><p>Gesummt: ${mmss(ges)} · Längstes: ${lang} s${summen.length > 1 ? ' · Mittel: ' + Math.round(ges / summen.length) + ' s' : ''}</p>
      <p>${ist >= 30 ? 'In deinem Fortschritt gezählt.' : 'Unter 30 Sekunden – nicht gezählt.'} Die Sekunden sind eine Schätzung des Mikrofons.</p><button class="knopf haupt voll" data-k="fertig">Fertig</button>`);
  }
  function messe() {   // Pegel (dBFS) und Anteil tiefer Töne (80–600 Hz an 80–4000 Hz)
    an.getFloatTimeDomainData(frei); let q = 0; for (let k = 0; k < frei.length; k++) q += frei[k] * frei[k];
    const db = 10 * Math.log10(q / frei.length + 1e-12);
    an.getFloatFrequencyData(spek); const bin = ctx.sampleRate / 2 / spek.length; let lo = 0, alle = 0;
    for (let k = Math.floor(80 / bin); k < Math.min(spek.length, Math.ceil(4000 / bin)); k++) { const p = Math.pow(10, spek[k] / 10); alle += p; if (k * bin < 600) lo += p; }
    return { db, tief: alle > 0 ? lo / alle : 0 };
  }
  function bild() {
    raf = 0; if (ende) return;
    const t = performance.now(), m = messe(), r = erk.schritt(m.db, m.tief, t), lvl = Math.max(0, Math.min(1, (m.db - erk.boden() - 6) / 30));
    pegelEl.style.transform = `scaleX(${lvl.toFixed(3)})`;
    const setz = (w, z) => { if (wort.textContent !== w) wort.textContent = w; if (z !== lZahl) { zahl.textContent = z; lZahl = z; } };
    if (zustand === 'kalib') {
      if (ctx.state !== 'running') { setz('Antippen', ''); meldung.textContent = 'Tippe einmal auf den Bildschirm, damit die App zuhören kann.'; phaseAb = t; raf = requestAnimationFrame(bild); return; }
      kalib.push(m.db); setz('Kurz still sein', String(Math.max(1, Math.ceil((2000 - (t - phaseAb)) / 1000))));
      if (t - phaseAb >= 2000) { const b = median(kalib); erk.setzeBoden(b); meldung.textContent = b > -38 ? 'Ziemlich laut hier – die Erkennung kann sich irren.' : ''; zustand = 'ein'; phaseAb = t; startT = t; }
    } else {
      const rest = dauer - (t - startT); $('#su-rest').textContent = mmss(Math.max(0, rest / 1000));
      if (zustand === 'ein') {
        const p = Math.min(1, (t - phaseAb) / 4000), s = 0.6 + (ruhig ? 0.15 : 0.4) * p;
        kern.style.transform = `scale(${s.toFixed(3)})`; hof.style.opacity = (0.3 + 0.6 * p).toFixed(2); setz('Einatmen', String(Math.max(1, Math.ceil((4000 - (t - phaseAb)) / 1000))));
        if (r.neu && t - phaseAb > 1500) { zustand = 'summt'; v.classList.add('summt'); meldung.textContent = ''; }   // schon begonnen: zählt mit
        else if (t - phaseAb >= 4000) { if (rest <= 0) return schluss('fertig'); zustand = 'warten'; phaseAb = t; v.classList.add('summt'); }
      } else if (zustand === 'warten') {
        setz('Jetzt summen', 'mmm'); kern.style.transform = `scale(${(1 + (ruhig ? 0 : 0.06) * lvl).toFixed(3)})`;
        if (r.an) { zustand = 'summt'; meldung.textContent = ''; } else if (t - phaseAb > 6000) meldung.textContent = 'Ich höre noch nichts – etwas lauter summen oder näher ans Gerät.';
      } else if (zustand === 'summt') {
        const sek = r.an ? r.laeuft_ms / 1000 : 0; setz('Summen', r.an ? String(Math.floor(sek)) : lZahl);
        kern.style.transform = `scale(${(1 - (ruhig ? 0.05 : 0.25) * Math.min(1, sek / 20) + (ruhig ? 0 : 0.05) * lvl).toFixed(3)})`; hof.style.opacity = (0.4 + 0.5 * lvl).toFixed(2);
        if (r.fertig != null) {
          if (r.fertig < 1000) zustand = 'warten';   // kurzer Laut (Räuspern, Klopfen): weiter auf das Summen warten
          else {
            summen.push({ d: r.fertig / 1000 }); balken();
            zustand = 'ein'; phaseAb = t; v.classList.remove('summt');
            if (rest <= 0) return schluss('fertig');
          }
        }
      }
    }
    raf = requestAnimationFrame(bild);
  }
  v.addEventListener('click', (ev) => { if (ctx.state !== 'running' && ctx.state !== 'closed') try { ctx.resume(); } catch {}   // jeder Tipp weckt den Kontext (iOS)
    const b = ev.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k; if (k === 'fertig') zu(); else if (k === 'zu' || k === 'ende') { if (ende || zustand === 'start' || zustand === 'fehler') zu(); else schluss('gestoppt'); } });
  const weg = () => { if (!location.hash.startsWith('#klang/summen')) { if (!ende && startT) schluss('gestoppt'); zu(); } };
  const sicht = () => { if (document.visibilityState === 'hidden' && !ende && zustand !== 'start' && zustand !== 'fehler') schluss('unterbrochen'); };   // Prüfung: Mikrofon-Hinweis nicht durch „Beendet · 0 Züge“ ersetzen
  addEventListener('hashchange', weg); document.addEventListener('visibilitychange', sicht);
  function aufraeumen() { removeEventListener('hashchange', weg); document.removeEventListener('visibilitychange', sicht); }
  navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then((s) => {
    if (!document.body.contains(v)) { s.getTracks().forEach((x) => x.stop()); return; }
    strom = s; const q = ctx.createMediaStreamSource(s); an = ctx.createAnalyser(); an.fftSize = 2048; an.smoothingTimeConstant = 0.2; q.connect(an);
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then((w) => { wake = w; }, () => {}); } catch {}
    if (ctx.state !== 'running') try { ctx.resume(); } catch {}
    zustand = 'kalib'; phaseAb = performance.now(); raf = requestAnimationFrame(bild);
  }, (f) => {
    zustand = 'fehler';
    const n = f && f.name, text = n === 'NotAllowedError' ? 'Du hast das Mikrofon nicht erlaubt. Du kannst es in den Einstellungen des Geräts für diese App oder Website freigeben.' : n === 'NotFoundError' ? 'Kein Mikrofon gefunden.' : 'Das Mikrofon ließ sich nicht starten.';
    zeigeBlatt(`<h2>Ohne Mikrofon</h2><p>${text}</p><a class="knopf haupt voll" href="#uebung/summen">Summen ohne Mikrofon üben</a><button class="knopf voll" data-k="fertig">Zurück</button>`);
    stopMikro();
  });
}
