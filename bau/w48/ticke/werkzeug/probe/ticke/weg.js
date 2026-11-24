// Wie ich ticke – „Dein Weg“: der durchgehende Ablauf für „Für mich“ (KONZEPT §2). Ohne DOM, in Node testbar.
// Einstieg → Start-Fragebogen → Profil-Karte → Genauer hinschauen (nur wo nötig) → Text-Spiegel (freiwillig) → Was passt zu mir → Training.
// Liest nur über ein kern-ähnliches Objekt k: k.einst(), k.speicher.{ergebnis, lies}, k.module (liste.js). Schreibt nur in m.weg.
// m.weg = { start: 'laeuft' | undefined,            Start-Fragebogen läuft (Module springen nach einem Teil zurück zu #los)
//           gesehen: { profil, passt, training },     ISO-Zeit, wann die Seite nach dem Start-Fragebogen offen war
//           aus: { '<stufe>' | '<ergebnis>': ISO },   bewusst ausgelassen (Stufen vertiefung/text, Teile außer Big Five)
//           vertiefung: ['bereich', …],               beim Ende des Start-Fragebogens empfohlene Bereiche (fest, damit der Weg endet)
//           fertig: ISO }                             wann der ganze Weg zum ersten Mal geschafft war
export const W = 'weg';
export const STUFEN = [
  { id: 'einstieg', titel: 'Einstieg', kurz: 'Alter und Merken – etwa 30 Sekunden', route: 'einstieg' },
  { id: 'start', titel: 'Start-Fragebogen', kurz: 'Vier kurze Teile, etwa 7 Minuten', route: 'los' },
  { id: 'profil', titel: 'Profil-Karte', kurz: 'Deine Bereiche auf einen Blick', route: 'profil' },
  { id: 'vertiefung', titel: 'Genauer hinschauen', kurz: 'Nur wo es sich lohnt', frei: true },
  { id: 'text', titel: 'Text-Spiegel', kurz: 'Freiwillig: vier kurze Texte', route: 'text', frei: true },
  { id: 'passt', titel: 'Was passt zu mir', kurz: 'Stärken mit Preis, Arbeitsweise, Wachsen', route: 'passt' },
  { id: 'training', titel: 'Training', kurz: 'Dein Vorschlag für heute', route: 'training' }
];
export const STUFE = Object.fromEntries(STUFEN.map((s, i) => [s.id, { ...s, nr: i + 1 }]));
export const BEREICH_NAME = { offenheit: 'Offenheit', gewissenhaftigkeit: 'Gewissenhaftigkeit', extraversion: 'Extraversion', vertraeglichkeit: 'Verträglichkeit', stabilitaet: 'Emotionale Stabilität' };
const GESEHEN = ['profil', 'passt', 'training'];

const lies = (k, key, std) => { const v = k.speicher.lies(W, key, std); return v == null ? std : v; };

// ---------- Start-Fragebogen ----------
// Teile = Einträge aus liste.js mit `start` (Reihenfolge), `bogen` (Route direkt in den Fragebogen), `anzahl`, `minuten`, `stand`.
export function startTeile(k) {
  return k.module.flatMap((m) => (m.fragen || []).filter((f) => f.start).map((f) => ({ ...f, modul: m.id }))).sort((a, b) => a.start - b.start);
}
// stand 'modul:schluessel.unter' → Anzahl Einträge (beantwortet oder bewusst übersprungen) in den Modul-Daten
function zaehle(k, stand) {
  if (!stand) return 0;
  const [modul, pfad] = stand.split(':'); const [erst, ...rest] = pfad.split('.');
  let o = k.speicher.lies(modul, erst, null);
  for (const r of rest) o = o && typeof o === 'object' ? o[r] : null;
  return o && typeof o === 'object' ? Object.keys(o).length : 0;
}
export function startStand(k) {
  const aus = lies(k, 'aus', {});
  const teile = startTeile(k).map((t) => {
    const e = k.speicher.ergebnis(t.ergebnis), fertig = !!e;
    const ausgelassen = !fertig && !!aus[t.ergebnis] && !t.pflicht;
    const n = fertig ? t.anzahl : Math.min(t.anzahl, zaehle(k, t.stand));
    const anteil = fertig || ausgelassen ? 1 : t.anzahl ? n / t.anzahl : 0;
    return { ...t, fertig, ausgelassen, n, anteil, ergebnisZeit: e ? e.zeit : null, vertieft: !!(e && e.form === 'vertieft'), fraglich: !!(e && e.qualitaet && e.qualitaet.fraglich) };
  });
  const minuten = teile.reduce((s, t) => s + (t.minuten || 1), 0);
  const anteil = minuten ? teile.reduce((s, t) => s + (t.minuten || 1) * t.anteil, 0) / minuten : 0;
  const rest = Math.ceil(teile.reduce((s, t) => s + (t.minuten || 1) * (1 - t.anteil), 0) - 0.05);
  const naechster = teile.find((t) => !t.fertig && !t.ausgelassen) || null;
  const begonnen = teile.some((t) => t.n > 0 || t.fertig);
  return { teile, minuten, anteil, rest, naechster, begonnen, fertig: !naechster && teile.length > 0, erledigt: teile.filter((t) => t.fertig || t.ausgelassen).length };
}

// ---------- Genauer hinschauen ----------
export function vertiefungStand(k, startFertig) {
  const bf = k.speicher.ergebnis('bigfive');
  const fest = lies(k, 'vertiefung', null);
  const liste = Array.isArray(fest) ? fest : (bf && bf.vertiefung && Array.isArray(bf.vertiefung.empfohlen) ? bf.vertiefung.empfohlen : []);
  const vertieft = (b) => !!(bf && bf.bereiche && bf.bereiche[b] && bf.bereiche[b].form === 'vertieft');
  const offen = liste.filter((b) => !vertieft(b));
  let status;
  if (!startFertig || !bf) status = 'offen';
  else if (!liste.length) status = 'nicht-noetig';
  else if (!offen.length) status = 'fertig';
  else if (lies(k, 'aus', {}).vertiefung) status = 'aus';
  else status = 'offen';
  return { status, liste, offen, erledigt: liste.length - offen.length, gruende: (bf && bf.vertiefung && bf.vertiefung.gruende) || {} };
}

// ---------- Status aller Stufen ----------
// Status: 'fertig' | 'offen' | 'nicht-noetig' | 'aus' (bewusst ausgelassen). Erledigt = alles außer 'offen'.
export function status(k) {
  const e = k.einst(), g = lies(k, 'gesehen', {}), aus = lies(k, 'aus', {});
  const st = startStand(k), vt = vertiefungStand(k, st.fertig);
  const s = {
    einstieg: e.einstieg ? 'fertig' : 'offen',
    start: st.fertig ? 'fertig' : 'offen',
    profil: st.fertig && g.profil ? 'fertig' : 'offen',
    vertiefung: vt.status,
    text: k.speicher.ergebnis('textspiegel') ? 'fertig' : aus.text ? 'aus' : 'offen',
    passt: st.fertig && g.passt ? 'fertig' : 'offen',
    training: st.fertig && g.training ? 'fertig' : 'offen'
  };
  const erledigt = STUFEN.filter((x) => s[x.id] !== 'offen').length;
  const naechste = STUFEN.find((x) => s[x.id] === 'offen') || null;
  return { s, st, vt, erledigt, gesamt: STUFEN.length, naechste: naechste ? ziel(naechste.id, st, vt) : null, fertig: !naechste,
    begonnen: !!e.einstieg || st.begonnen, aktiv: !!e.einstieg && !!naechste, fertigZeit: lies(k, 'fertig', null) };
}
// Wohin führt eine Stufe (Route + Text für den Knopf)
export function ziel(id, st, vt) {
  const S = STUFE[id];
  if (id === 'start') return { id, nr: S.nr, titel: S.titel, route: 'los', knopf: S.titel };
  if (id === 'vertiefung') {
    const b = vt && vt.offen[0];
    return { id, nr: S.nr, titel: S.titel, route: b ? `fragen/bigfive?zu=${b}` : 'fragen/bigfive', knopf: b ? `Genauer: ${BEREICH_NAME[b] || b}` : S.titel };
  }
  return { id, nr: S.nr, titel: S.titel, route: S.route, knopf: S.titel };
}

// ---------- Welche Stufe gehört zu einer Route? ----------
// null = Leiste ausblenden (Fragebogen, Schreiben, Übung, Kern-Seiten mit eigenen Knöpfen).
export function stufeVonRoute(pfad, startFertig) {
  const [a, b, c, d] = pfad;
  if (a === 'fragen') {
    if (!b) return 'start';
    if (b === 'bigfive') { if (c === 'start' || c === 'vertiefung') return null; return startFertig ? 'vertiefung' : 'start'; }
    if (b === 'interessen') { if (d === 'bogen' || d === 'eingabe') return null; return 'start'; }
    return 'start';
  }
  if (a === 'profil') return 'profil';
  if (a === 'passt') return 'passt';
  if (a === 'text') return b === 'schreiben' ? null : 'text';
  if (a === 'training') return b === 'uebung' || b === 'herausforderung' ? null : 'training';
  return null;
}

// ---------- Weg-Leiste: wohin führt „Weiter“ auf dieser Seite? ----------
// Ist die Stufe der Seite freiwillig und noch offen, heißt „Weiter“: diese Stufe auslassen (aus = id), außer der Weg führt zurück.
export function leiste(k, { pfad, param = {}, hash = pfad.join('/') }) {
  const S = status(k);
  if (!S.aktiv) return null;
  const hier = stufeVonRoute(pfad, S.st.fertig);
  if (!hier) return null;
  const idx = STUFEN.findIndex((x) => x.id === hier);
  let z = null, aus = null;
  // nächste offene Stufe: danach, oder davor, wenn sie Pflicht ist (freiwillige frühere Stufen bleiben auf der Startseite stehen)
  const nI = STUFEN.findIndex((x, i) => S.s[x.id] === 'offen' && x.id !== hier && (i > idx || !STUFE[x.id].frei));
  if (S.s[hier] === 'offen' && !STUFE[hier].frei && (nI < 0 || nI > idx)) z = ziel(hier, S.st, S.vt);
  else if (hier === 'vertiefung' && S.s.vertiefung === 'offen' && param.zu && !S.vt.offen.includes(param.zu) && S.vt.offen.length) z = ziel('vertiefung', S.st, S.vt);
  else {
    if (nI < 0) return null;
    z = ziel(STUFEN[nI].id, S.st, S.vt);
    if (STUFE[hier].frei && S.s[hier] === 'offen' && nI > idx) aus = hier;
  }
  if (z.route === hash && !aus) return null;                               // schon auf dem Ziel
  return { hier: STUFE[hier], hierStatus: S.s[hier], ziel: z, aus, erledigt: S.erledigt, gesamt: S.gesamt };
}

// ---------- Schreiben (nur über k.speicher.schreib) ----------
// Nach jeder Ansicht und jedem Ergebnis: Start-Status aufräumen, empfohlene Vertiefung festhalten, Seiten als gesehen merken.
// Gibt 'geschafft' zurück, wenn der Weg gerade zum ersten Mal komplett ist.
export function nachfuehren(k, pfad = null) {
  const sp = k.speicher, jetzt = new Date().toISOString();
  const st = startStand(k);
  if (st.fertig) {
    if (lies(k, 'start', null)) sp.schreib(W, 'start', undefined);
    if (lies(k, 'vertiefung', null) == null) {
      const bf = sp.ergebnis('bigfive');
      if (bf) sp.schreib(W, 'vertiefung', (bf.vertiefung && Array.isArray(bf.vertiefung.empfohlen) ? bf.vertiefung.empfohlen : []).slice(0, 2));
    }
    if (pfad && GESEHEN.includes(pfad[0]) && k.einst().einstieg) {
      const g = lies(k, 'gesehen', {});
      if (!g[pfad[0]] && (pfad[0] !== 'training' || pfad.length === 1)) sp.schreib(W, 'gesehen', { ...g, [pfad[0]]: jetzt });
    }
  }
  const S = status(k);
  if (S.fertig && k.einst().einstieg && !lies(k, 'fertig', null)) { sp.schreib(W, 'fertig', jetzt); return 'geschafft'; }
  return null;
}
export function beginneStart(k) { if (!startStand(k).fertig) k.speicher.schreib(W, 'start', 'laeuft'); }
export function imStart(k) { return lies(k, 'start', null) === 'laeuft' && !startStand(k).fertig; }
// Roh-Zustand (auch direkt nach dem letzten Teil, bevor nachfuehren() aufräumt): Module springen dann zurück zu #los.
export function startLaeuft(k) { return lies(k, 'start', null) === 'laeuft'; }
export function auslassen(k, id) { const aus = lies(k, 'aus', {}); if (!aus[id]) k.speicher.schreib(W, 'aus', { ...aus, [id]: new Date().toISOString() }); }
export function zuruecknehmen(k, id) { const aus = { ...lies(k, 'aus', {}) }; if (aus[id]) { delete aus[id]; k.speicher.schreib(W, 'aus', aus); } }
