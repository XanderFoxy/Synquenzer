// Atem 0.1.5 – Eigene Musik (Recherche 015, eigene_musik). Lädt erst auf der Seite „Eigene Musik“ bzw. beim Start einer Übung mit Musik.
// Die Datei bleibt auf dem Gerät: dekodiert, auf Mono 22,05 kHz gemischt, Tempo gemessen, ggf. verlangsamt (Tonhöhe bleibt, WSOLA)
// und als 16-bit-PCM in IndexedDB „atem.v1.musik“ gelegt. Keine Netzanfrage.
// Regel: bis 80 Schläge/min passt · 81–94 → auf ≤ 80 verlangsamen, höchstens −15 % · ab 95 oder > 1,6 starke Anschläge/s → ablehnen.
export const GRENZE = { passt: 80, ablehnen: 95, faktorMin: 0.85, dichte: 1.6, klar: 0.12, rate: 22050, maxS: 300, maxMB: 12 };
const ruhe = () => new Promise((r) => setTimeout(r, 0));

// ---------- Tempo (reine Funktion, auch in Node prüfbar) ----------
// Onset-Hüllkurve (Anstieg der log. Energie, voll + Höhen), Autokorrelation 40–200 Schläge/min, Oktav-Prüfung (Halbtempo-Falle).
export function tempoSchaetzen(x, rate = GRENZE.rate) {
  const n = Math.min(x.length, Math.round(60 * rate)), a = Math.max(0, Math.floor((x.length - n) / 2));
  const hop = Math.max(64, Math.round(rate / 86)), fps = rate / hop, F = Math.floor(n / hop);
  if (F < 200) return { bpm: 0, klar: 0, dichte: 0, treibend: false, sekunden: n / rate };
  const eV = new Float32Array(F), eH = new Float32Array(F);
  for (let f = 0; f < F; f++) {
    let sv = 0, sh = 0; const s0 = a + f * hop;
    for (let i = s0; i < s0 + hop; i++) { const v = x[i], h = v - 2 * (x[i - 1] || 0) + (x[i - 2] || 0); sv += v * v; sh += h * h; }
    eV[f] = sv; eH[f] = sh;
  }
  const onset = (e) => {
    let m = 0; for (let f = 0; f < F; f++) m += e[f]; m = m / F || 1e-12;
    const L = new Float32Array(F); for (let f = 0; f < F; f++) { let s4 = 0; for (let j = Math.max(0, f - 3); j <= f; j++) s4 += e[j]; L[f] = Math.log(1 + 25 * s4 / m); }   // 46-ms-Fenster: Schwebungen in Klangflächen mitteln sich weg
    const o = new Float32Array(F); for (let f = 1; f < F; f++) o[f] = Math.max(0, L[f] - L[f - 1]);
    const w = Math.round(fps * 0.4), g = new Float32Array(F); let s = 0;   // gleitender Mittelwert abziehen, halbe Welle
    for (let f = 0; f < F; f++) { s += o[f]; if (f >= w) s -= o[f - w]; g[f] = Math.max(0, o[f] - s / Math.min(f + 1, w)); }
    return g;
  };
  const o = onset(eV), oH = onset(eH);
  const ak = (v) => {
    let r0 = 0; for (let f = 0; f < F; f++) r0 += v[f] * v[f]; r0 = r0 / F || 1e-12;
    const lmax = Math.min(Math.round(60 * fps / 40) + 2, F - 1), r = new Float32Array(lmax + 1);
    for (let l = 1; l <= lmax; l++) { let s = 0; for (let f = 0; f + l < F; f++) s += v[f] * v[f + l]; r[l] = s / (F - l) / r0; }
    return r;
  };
  const r = ak(o), rH = ak(oH), lmin = Math.round(60 * fps / 200), lmax = Math.min(Math.round(60 * fps / 40), r.length - 2);
  const gipfel = (rr, l) => { let b = 0; for (let k = Math.max(1, Math.round(l) - 2); k <= Math.min(rr.length - 1, Math.round(l) + 2); k++) b = Math.max(b, rr[k]); return b; };
  let best = 0, L = 0, mittel = 0;
  for (let l = lmin; l <= lmax; l++) { mittel += r[l]; if (r[l] > r[l - 1] && r[l] >= r[l + 1] && r[l] > best) { best = r[l]; L = l; } }
  mittel /= (lmax - lmin + 1);
  const p99 = Float32Array.from(o).sort()[Math.floor(F * 0.99)];   // Stärke der Anschläge (ln-Energie-Anstieg je 11,6 ms); Klangfläche ohne Anschlag bleibt klein
  const klar = L && p99 >= 0.25 ? best - mittel : 0;
  if (!L || klar < GRENZE.klar) return { bpm: 0, klar, dichte: dichte(o, fps), treibend: false, sekunden: n / rate };
  // feiner Gipfel (Parabel)
  const fein = (l) => { const y0 = r[l - 1], y1 = r[l], y2 = r[l + 1], d = y0 - 2 * y1 + y2; return d ? l + 0.5 * (y0 - y2) / d : l; };
  let lag = fein(L), wert = best;
  // Oktav-Prüfung: Gipfel beim doppelten Tempo (halbe Verzögerung) ≥ 0,7 × Hauptgipfel → doppeltes Tempo
  for (let weiter = true; weiter;) { weiter = false; for (const d of [2, 3]) { if (lag / d < lmin - 1) continue; const h = gipfel(r, lag / d); if (h >= 0.7 * wert) { lag /= d; wert = h; weiter = true; break; } } }
  // 0.1.5 Halbtempo unten: Unter 50/min ist ein Grundschlag selten (Hip-Hop 88–92 mit Kick 1+3 wird sonst als 44–46 gemessen).
  // Zeigt sich beim doppelten Tempo ein deutlicher Puls (voll oder Höhen), gilt das doppelte Tempo – im Zweifel also schneller (sicherer).
  let halb = 0;
  if (60 * fps / lag < 50 && lag / 2 >= lmin - 1) { halb = Math.max(gipfel(r, lag / 2) / wert, gipfel(rH, lag / 2)); if (halb >= 0.3) lag /= 2; }
  const bpm = 60 * fps / lag;
  // Regelmäßige Höhen (Hi-Hat) beim doppelten Tempo + deutlicher Voll-Gipfel dort → treibend
  const treibend = bpm * 2 >= GRENZE.ablehnen && lag / 2 >= 2 && gipfel(rH, lag / 2) >= 0.5 && gipfel(r, lag / 2) >= 0.4 * wert;
  return { bpm: Math.round(bpm * 10) / 10, klar: Math.round(klar * 1000) / 1000, dichte: dichte(o, fps), treibend, sekunden: n / rate };
}
function dichte(o, fps) {   // starke Anschläge je Sekunde: Spitzen über max(Mittel + 2σ, 30 % des 99. Perzentils), mind. 120 ms Abstand
  const F = o.length; let m = 0, q = 0; for (let f = 0; f < F; f++) { m += o[f]; q += o[f] * o[f]; } m /= F; const sd = Math.sqrt(Math.max(0, q / F - m * m));
  const sort = Float32Array.from(o).sort(), p99 = sort[Math.floor(F * 0.99)], thr = Math.max(m + 2 * sd, 0.3 * p99, 1e-6);
  let n = 0, letzte = -1e9; const abst = Math.round(0.12 * fps);
  for (let f = 1; f < F - 1; f++) if (o[f] > thr && o[f] >= o[f - 1] && o[f] >= o[f + 1] && f - letzte >= abst) { n++; letzte = f; }
  return Math.round((n / (F / fps)) * 100) / 100;
}
export function urteil(m) {
  if (!m.bpm) return { urteil: 'passt', faktor: 1, ziel: 0, grund: 'ohne_beat' };
  if (m.treibend || m.bpm >= GRENZE.ablehnen || m.dichte > GRENZE.dichte) return { urteil: 'zu_schnell', faktor: 1, ziel: 0, grund: m.treibend ? 'treibend' : m.bpm >= GRENZE.ablehnen ? 'tempo' : 'dichte' };
  if (Math.round(m.bpm) <= GRENZE.passt) return { urteil: 'passt', faktor: 1, ziel: m.bpm, grund: 'tempo' };
  const f = Math.max(GRENZE.faktorMin, GRENZE.passt / m.bpm);
  return { urteil: 'langsamer', faktor: Math.round(f * 1000) / 1000, ziel: Math.round(m.bpm * f), grund: 'tempo' };
}

// ---------- Verlangsamen mit gleicher Tonhöhe (WSOLA), in Stücken (keine Long Tasks) ----------
export async function dehne(x, faktor, takt = ruhe) {
  if (faktor >= 0.999) return x;
  const N = 1024, Hs = 512, Ha = Hs * faktor, D = 128, laenge = Math.round(x.length / faktor), out = new Float32Array(laenge + N);
  const win = new Float32Array(N); for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
  let prev = 0, t0 = Date.now();
  for (let k = 0; ; k++) {
    const op = k * Hs, ideal = Math.round(k * Ha); if (ideal + N + D >= x.length || op + N > out.length) break;
    let pos = ideal;
    if (k) {
      const nat = prev + Hs; let bestS = -Infinity;
      for (let c = Math.max(0, ideal - D); c <= ideal + D; c += 2) { let s = 0; for (let i = 0; i < Hs; i += 4) s += x[nat + i] * x[c + i]; if (s > bestS) { bestS = s; pos = c; } }
      const p0 = pos; for (const c of [p0 - 1, p0 + 1]) { if (c < 0) continue; let s = 0; for (let i = 0; i < Hs; i += 2) s += x[nat + i] * x[c + i]; let s0 = 0; for (let i = 0; i < Hs; i += 2) s0 += x[nat + i] * x[p0 + i]; if (s > s0) pos = c; }
    }
    for (let i = 0; i < N; i++) out[op + i] += x[pos + i] * win[i];
    prev = pos;
    if (Date.now() - t0 > 12) { await takt(); t0 = Date.now(); }
  }
  return out.subarray(0, laenge);
}

// ---------- Datei → Mono 22,05 kHz ----------
async function dekodiere(datei) {
  const roh = await datei.arrayBuffer();
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  let b, rate = GRENZE.rate;
  const dek = (r, puffer) => new Promise((ok, f) => { const c = new OAC(1, 1, r); const p = c.decodeAudioData(puffer, ok, f); if (p && p.then) p.then(ok, f); });
  // decodeAudioData gibt den Puffer ab (detached) – für den Rückfall (Gerät kann kein 22,05 kHz) eine Kopie nehmen
  try { b = await dek(rate, roh.slice(0)); } catch { rate = 44100; b = await dek(rate, roh); }
  const teiler = Math.max(1, Math.round(b.sampleRate / GRENZE.rate)), n = Math.min(Math.floor(b.length / teiler), GRENZE.maxS * GRENZE.rate);
  const x = new Float32Array(n), k = b.numberOfChannels, ch = []; for (let c = 0; c < k; c++) ch.push(b.getChannelData(c));
  let t0 = Date.now();
  for (let i = 0; i < n; i++) {
    let s = 0; for (let c = 0; c < k; c++) for (let j = 0; j < teiler; j++) s += ch[c][i * teiler + j];
    x[i] = s / (k * teiler);
    if ((i & 16383) === 0 && Date.now() - t0 > 12) { await ruhe(); t0 = Date.now(); }
  }
  return { x, dauer: b.length / b.sampleRate, gekuerzt: b.length / teiler > n };
}
// Prüfen + vorbereiten. fortschritt(text) zeigt den Schritt an. Ergebnis: { meta, pcm (Int16Array) } oder { meta } bei Ablehnung.
export async function bereite(datei, fortschritt = () => {}) {
  const name = String(datei.name || 'Musik').replace(/\.[a-z0-9]{2,5}$/i, '').slice(0, 60);
  if (datei.size > GRENZE.maxMB * 1024 * 1024) return { meta: { name, urteil: 'zu_gross' } };
  fortschritt('Datei wird gelesen …');
  let d; try { d = await dekodiere(datei); } catch { return { meta: { name, urteil: 'unlesbar' } }; }
  fortschritt('Tempo wird gemessen …'); await ruhe();
  const m = tempoSchaetzen(d.x, GRENZE.rate), u = urteil(m);
  const meta = { name, bpm: m.bpm, klar: m.klar, dichte: m.dichte, treibend: m.treibend, ...u, dauer: Math.round(d.dauer), gekuerzt: d.gekuerzt, rate: GRENZE.rate };
  if (u.urteil === 'zu_schnell') return { meta };
  let y = d.x;
  if (u.faktor < 1) { fortschritt('Wird langsamer gemacht (Tonhöhe bleibt) …'); y = await dehne(d.x, u.faktor); }
  // Schleife ohne Knacks: letzte Sekunde in den Anfang überblenden; Pegel auf etwa −20 dBFS (höchstens +6 dB)
  const M = Math.min(GRENZE.rate, Math.floor(y.length / 4)), L = y.length - M, pcm = new Int16Array(L);
  let q = 0, spitze = 0;
  for (let i = 0; i < L; i++) { let v = y[i]; if (i < M) { const w = i / M; v = v * w + y[L + i] * (1 - w); } v = Math.max(-1, Math.min(1, v)); pcm[i] = Math.round(v * 32767); q += v * v; spitze = Math.max(spitze, Math.abs(v)); }
  const rms = Math.sqrt(q / Math.max(1, L));
  meta.pegel = Math.round(Math.min(2, 0.1 / Math.max(rms, 1e-4)) * 1000) / 1000; meta.laenge_s = Math.round(L / GRENZE.rate);
  return { meta, pcm };
}

// 0.1.5 Ablehnung je Grund – ohne Widerspruch (75/min wird nicht mit „unter 80“ abgelehnt)
const grundText = (m) => (m.grund === 'treibend' && m.bpm < GRENZE.ablehnen ? `Grundschlag etwa ${Math.round(m.bpm)} pro Minute, aber durchgehende Hi-Hats oder Schlagzeug wirken wie etwa ${Math.round(m.bpm * 2)} – das treibt eher an. Nimm ein Stück ohne durchgehendes Schlagzeug.`
  : m.grund === 'dichte' ? 'Sehr viele kräftige Anschläge pro Sekunde – das wirkt eher anregend, auch wenn der Grundschlag ruhig ist. Nimm ein Stück mit wenig Schlagzeug, zum Beispiel ruhige Instrumentalmusik.'
  : `Gemessen: etwa ${Math.round(m.bpm)} Schläge pro Minute. Nimm ein ruhigeres Stück – unter etwa 80 Schlägen pro Minute.`);

// ---------- IndexedDB ----------
const DB = 'atem.v1.musik';
function oeffne() {
  return new Promise((ok, f) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore('stueck'); r.onsuccess = () => ok(r.result); r.onerror = () => f(r.error); });
}
async function tx(modus, fn) {
  const db = await oeffne();
  try { return await new Promise((ok, f) => { const t = db.transaction('stueck', modus), s = t.objectStore('stueck'), r = fn(s); t.oncomplete = () => ok(r && r.result); t.onerror = () => f(t.error); t.onabort = () => f(t.error); }); }
  finally { db.close(); }
}
export const speichern = (meta, pcm) => tx('readwrite', (s) => s.put({ meta, pcm: pcm.buffer }, 'aktuell'));
export async function laden() { try { const v = await tx('readonly', (s) => s.get('aktuell')); return v && v.pcm ? { meta: v.meta, pcm: new Int16Array(v.pcm) } : null; } catch { return null; } }
export async function info() { const v = await laden(); return v ? v.meta : null; }
export const entfernen = () => tx('readwrite', (s) => s.delete('aktuell')).catch(() => {});

// ---------- Seite „Eigene Musik“ (Bedienung; Hilfen aus app.js) ----------
export function musikSeite({ W, $, esc, sym, abzeichen, quellenListe, KEIN_ERSATZ, speicher, ton }) {
  const zeichne = async (meldung) => {
    if (location.hash !== '#musik') return;
    const e = speicher.einst(), m = await info(), I = W.MUSIK;
    const stand = m ? `<div class="karte" id="mstand"><b>${esc(m.name)}</b><p>${m.urteil === 'langsamer' ? `Tempo etwa ${Math.round(m.bpm)} Schläge pro Minute – wird ${Math.round((1 - m.faktor) * 100)} % langsamer abgespielt (etwa ${m.ziel}), die Tonhöhe bleibt.` : m.bpm ? `Tempo etwa ${Math.round(m.bpm)} Schläge pro Minute – passt zum ruhigen Atmen.` : 'Kein fester Beat erkannt – passt meist gut zum ruhigen Atmen.'}${m.gekuerzt ? ' Genutzt werden die ersten 5 Minuten, danach von vorn.' : ''}</p>
      <label class="schalter"><span>In Übungen abspielen</span><input type="checkbox" id="man" ${e.eigeneMusik ? 'checked' : ''}></label>
      <label class="schieber">Musik-Lautstärke <input type="range" min="0" max="1" step="0.05" value="${e.musikLaut}" id="mlaut"></label>
      <div class="zwei"><button class="knopf zweit" id="mprobe">${sym('play')} Probe hören</button><button class="knopf zweit" id="mweg">Entfernen</button></div></div>` : '';
    $('#inhalt').innerHTML = `${meldung || ''}${stand}<div class="karte"><label class="knopf ${m ? 'zweit' : 'haupt'} voll" id="mwahl">${m ? 'Anderes Stück wählen' : 'Stück wählen'}<input type="file" accept="audio/*,.mp3,.m4a,.aac,.wav,.aif,.aiff" id="mdatei" hidden></label><p class="leise">Die Datei bleibt auf deinem Gerät.</p></div>
      <div class="karte"><b>So nutzt du eigene Musik</b><ul>${I.so_nutzt_du.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
      <div class="karte"><b>Was ist belegt?</b><ul class="belegliste">${I.belege.map((b) => `<li>${abzeichen(b.beleg)} ${esc(b.aussage)}</li>`).join('')}</ul>
      <details><summary>Quellen</summary>${quellenListe([...new Set(I.belege.flatMap((b) => b.quellen))], W.QUELLEN)}</details></div>${KEIN_ERSATZ}`;
    const i = $('#inhalt');
    $('#mdatei').onchange = async (ev) => {
      const f = ev.target.files[0]; if (!f) return; ton.musikStopp();
      i.insertAdjacentHTML('afterbegin', '<div class="karte" id="mlaeuft" role="status"><b>Wird geprüft …</b><p id="mschritt">Datei wird gelesen …</p></div>'); scrollTo(0, 0);
      let erg; try { erg = await bereite(f, (t) => { const x = $('#mschritt'); if (x) x.textContent = t; }); } catch { erg = { meta: { urteil: 'unlesbar' } }; }
      const u = erg.meta.urteil;
      if (!erg.pcm) return zeichne(`<div class="karte hinweis" role="status"><b>${u === 'zu_schnell' ? 'Zu schnell für ruhiges Atmen' : u === 'zu_gross' ? 'Datei zu groß' : 'Datei nicht lesbar'}</b><p>${u === 'zu_schnell' ? grundText(erg.meta) : u === 'zu_gross' ? 'Höchstens 12 MB – nimm ein kürzeres Stück oder eine kleinere Datei.' : 'Bitte eine MP3-, M4A- oder WAV-Datei aus der Dateien-App wählen.'}</p><p class="leise">Nichts wurde gespeichert.</p></div>`);
      try { await speichern(erg.meta, erg.pcm); } catch { return zeichne('<div class="karte hinweis" role="status"><b>Kein Platz auf dem Gerät</b><p>Die Musik konnte nicht gespeichert werden.</p></div>'); }
      speicher.setzeEinst({ eigeneMusik: true, musikName: erg.meta.name });
      ton.musikSetzen(erg.pcm, erg.meta.rate, erg.meta.pegel);
      zeichne(`<div class="karte" role="status"><b>Gespeichert</b><p>${u === 'langsamer' ? 'Etwas zu schnell – die App spielt es langsamer ab.' : 'Passt.'} Tippe „Probe hören“.</p></div>`);
    };
    if (!m) return;
    $('#man').onchange = (ev) => { speicher.setzeEinst({ eigeneMusik: ev.target.checked }); if (!ev.target.checked) ton.musikStopp(); };
    $('#mlaut').onchange = (ev) => { speicher.setzeEinst({ musikLaut: +ev.target.value }); ton.einstellen({ musikLaut: +ev.target.value }); probe(); };
    const probe = async () => {   // Ton im Tipp entsperren, Musik bei Bedarf laden, 4 s aus der Mitte
      const e2 = speicher.einst(); ton.entsperren(e2.musik); ton.einstellen({ musikLaut: e2.musikLaut });
      if (!ton.musikDa()) { const v = await laden(); if (!v) return; ton.musikSetzen(v.pcm, v.meta.rate, v.meta.pegel); }
      ton.musikProbe();
    };
    $('#mprobe').onclick = probe;
    $('#mweg').onclick = async () => { ton.musikStopp(); ton.musikSetzen(null); await entfernen(); speicher.setzeEinst({ eigeneMusik: false, musikName: null }); zeichne('<div class="karte" role="status"><p>Entfernt.</p></div>'); };
  };
  zeichne();
}
