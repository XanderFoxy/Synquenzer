// M4 passt – Profil-Karte als Bild (PNG, 1080 × 1350), nur lokal per Canvas. Kein Name, nichts wird hochgeladen.
// Nur Worte: je Richtung zwei gleichwertige Pole, dazwischen eine ruhige Linie, die Seite, zu der du neigst, hervorgehoben –
// keine Zahlen, keine Skala, keine Bänder (Wunsch Xander 24.11.2026).
// Farben kommen aus den Tokens von stil.css (hell oder dunkel, je nach System) – keine festen Farben im Modul.
// Wird erst geladen, wenn jemand „Als Bild sichern“ antippt.
const B = 1080, H = 1350, RAND = 64;
const SCHRIFT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

function tokens() {
  const cs = getComputedStyle(document.documentElement), t = (n) => cs.getPropertyValue(n).trim();
  return { hg: t('--hg'), fl: t('--fl'), fl2: t('--fl2'), rand: t('--rand'), text: t('--text'), leise: t('--leise'), akzent: t('--akzent'), weich: t('--akzent-weich') };
}
function rund(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function zeilen(c, text, breite) {
  // Listen („A · B · C“) nur zwischen den Einträgen umbrechen, sonst zwischen Wörtern
  const s = String(text), fuge = s.includes(' · ') ? ' · ' : ' ', w = s.split(fuge === ' ' ? /\s+/ : fuge), z = []; let akt = '';
  for (const x of w) { const t = akt ? akt + fuge + x : x; if (c.measureText(t).width > breite && akt) { z.push(akt); akt = x; } else akt = t; }
  if (akt) z.push(akt); return z;
}
// Ein Pol als Wort-Feld; an = Seite, zu der du neigst (bei „beides“ beide)
function pol(c, f, text, x, y, w, an, klar, rechts) {
  const h = 50;
  rund(c, x, y, w, h, h / 2);
  c.fillStyle = an ? f.weich : f.fl2; c.fill();
  c.lineWidth = an ? (klar ? 4 : 2.5) : 1.5; c.strokeStyle = an ? f.akzent : f.rand; c.stroke();
  c.fillStyle = an ? f.text : f.leise; c.font = `${an ? 650 : 500} 25px ${SCHRIFT}`;
  let t = String(text); while (c.measureText(t).width > w - 36 && t.length > 4) t = t.slice(0, -2).trimEnd() + '…';
  const tw = c.measureText(t).width; c.fillText(t, rechts ? x + w - 18 - tw : x + 18, y + 33);
}

// d: { name, datum, richtungen:[{titel, pole:[a,b], deutlich, seite, text, offen}], interessen:[...], wachstum }
// Zwei Durchgänge: erst messen, dann mit gleichmäßig verteiltem Abstand zeichnen (kein Loch über der Fußzeile).
function male(c, f, d, luft) {
  const innen = B - 2 * RAND - 32, x0 = RAND + 16;
  c.clearRect(0, 0, B, H);
  c.fillStyle = f.hg; c.fillRect(0, 0, B, H);
  rund(c, 32, 32, B - 64, H - 64, 48); c.fillStyle = f.fl; c.fill(); c.lineWidth = 2; c.strokeStyle = f.rand; c.stroke();
  let y = RAND + 64;
  c.textBaseline = 'alphabetic';
  c.fillStyle = f.text; c.font = `700 68px ${SCHRIFT}`; c.fillText('Wie ich ticke', x0, y);
  y += 48; c.fillStyle = f.leise; c.font = `500 30px ${SCHRIFT}`; c.fillText(`Profil-Karte · ${d.datum || ''}`, x0, y);
  if (d.name) { y += 70 + luft; c.fillStyle = f.akzent; c.font = `700 50px ${SCHRIFT}`; c.fillText(d.name, x0, y); }
  y += 24 + luft;
  const linie = 40, pw = (innen - linie) / 2;
  for (const r of d.richtungen || []) {
    y += 44 + luft; c.fillStyle = f.text; c.font = `650 31px ${SCHRIFT}`; c.fillText(r.titel, x0, y);
    const wort = r.offen ? 'noch offen' : r.deutlich === 'beides' ? 'beides gehört zu dir' : r.deutlich;
    c.fillStyle = f.leise; c.font = `500 27px ${SCHRIFT}`; const w = c.measureText(wort).width; c.fillText(wort, B - RAND - 16 - w, y);
    y += 14;
    const beides = r.deutlich === 'beides' && !r.offen;
    pol(c, f, r.pole[0], x0, y, pw, beides || r.seite < 0, r.deutlich === 'klar', false);
    pol(c, f, r.pole[1], x0 + pw + linie, y, pw, beides || r.seite > 0, r.deutlich === 'klar', true);
    c.strokeStyle = f.rand; c.lineWidth = 2; c.beginPath(); c.moveTo(x0 + pw + 8, y + 25); c.lineTo(x0 + pw + linie - 8, y + 25); c.stroke();
    y += 50;
  }
  c.font = `500 31px ${SCHRIFT}`;
  const text = (titel, wert) => { if (!wert) return; y += 64 + luft; c.fillStyle = f.leise; c.fillText(titel, x0, y); const tw = c.measureText(titel + ' ').width;
    c.fillStyle = f.text; zeilen(c, wert, innen - tw).forEach((z, i) => { if (i) y += 42; c.fillText(z, x0 + tw, y); }); };
  text('Was dich anzieht:', (d.interessen || []).join(' · '));
  text('Du übst gerade:', d.wachstum);
  c.fillStyle = f.leise; c.font = `500 25px ${SCHRIFT}`;
  const fuss = ['Selbstreflexion, keine Diagnose.', 'Richtungen in Worten – zwei Seiten, beide mit Stärken, ohne richtig oder falsch.'];
  fuss.forEach((z, i) => c.fillText(z, x0, H - RAND - 24 - (fuss.length - 1 - i) * 36));
  return y;
}
export function zeichne(canvas, d) {
  canvas.width = B; canvas.height = H;
  const c = canvas.getContext('2d'), f = tokens();
  const ende = male(c, f, d, 0), frei = H - RAND - 24 - 36 - 70 - ende;
  const stellen = (d.richtungen || []).length + (d.name ? 1 : 0) + 1 + (d.interessen && d.interessen.length ? 1 : 0) + (d.wachstum ? 1 : 0);
  const luft = Math.max(0, Math.min(36, Math.floor(frei / Math.max(1, stellen))));
  if (luft > 0) male(c, f, d, luft);
  return canvas;
}
export function bildErzeugen(d) {
  const cv = zeichne(document.createElement('canvas'), d);
  return new Promise((ok, nein) => cv.toBlob((b) => (b ? ok(b) : nein(new Error('Bild ging nicht'))), 'image/png'));
}
