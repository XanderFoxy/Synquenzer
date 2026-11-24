// M4 passt – Profil-Karte als Bild (PNG, 1080 × 1350), nur lokal per Canvas. Kein Name, nichts wird hochgeladen.
// Farben kommen aus den Tokens von stil.css (hell oder dunkel, je nach System) – keine festen Farben im Modul.
// Wird erst geladen, wenn jemand „Als Bild sichern“ antippt.
const B = 1080, H = 1350, RAND = 64;
const SCHRIFT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

function tokens() {
  const cs = getComputedStyle(document.documentElement), t = (n) => cs.getPropertyValue(n).trim();
  return { hg: t('--hg'), fl: t('--fl'), fl2: t('--fl2'), rand: t('--rand'), text: t('--text'), leise: t('--leise'), akzent: t('--akzent'), band: t('--band'), bandRand: t('--band-rand') };
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
function band(c, f, x, y, w, b, min, max, mitte) {
  const pos = (v) => x + Math.max(0, Math.min(1, (v - min) / (max - min))) * w, h = 46;
  rund(c, x, y, w, h, h / 2); c.fillStyle = f.fl2; c.fill(); c.lineWidth = 2; c.strokeStyle = f.rand; c.stroke();
  c.save(); rund(c, x, y, w, h, h / 2); c.clip(); c.globalAlpha = 0.55; c.fillStyle = f.rand; c.fillRect(pos(mitte[0]), y, pos(mitte[1]) - pos(mitte[0]), h); c.restore();
  const a = pos(Math.min(b.unten, b.oben)), e = Math.max(a + 22, pos(Math.max(b.unten, b.oben)));
  rund(c, a, y + 6, e - a, h - 12, (h - 12) / 2); c.fillStyle = f.band; c.fill();
  c.lineWidth = 4; c.strokeStyle = f.bandRand; c.setLineDash(b.grob ? [12, 8] : []); c.stroke(); c.setLineDash([]);
}

// d: { name, datum, bereiche:[{name, unten, oben, wort, grob}], ehrlichkeit:{unten, oben, wort}|null, interessen:[...], rhythmus, vergleich }
// Zwei Durchgänge: erst messen, dann mit gleichmäßig verteiltem Abstand zeichnen (kein Loch über der Fußzeile).
function male(c, f, d, luft) {
  const innen = B - 2 * RAND;
  c.clearRect(0, 0, B, H);
  c.fillStyle = f.hg; c.fillRect(0, 0, B, H);
  rund(c, 32, 32, B - 64, H - 64, 48); c.fillStyle = f.fl; c.fill(); c.lineWidth = 2; c.strokeStyle = f.rand; c.stroke();
  let y = RAND + 64;
  c.textBaseline = 'alphabetic';
  c.fillStyle = f.text; c.font = `700 68px ${SCHRIFT}`; c.fillText('Wie ich ticke', RAND + 16, y);
  y += 48; c.fillStyle = f.leise; c.font = `500 30px ${SCHRIFT}`; c.fillText(`Profil-Karte · ${d.datum || ''}`, RAND + 16, y);
  if (d.name) { y += 70 + luft; c.fillStyle = f.akzent; c.font = `700 50px ${SCHRIFT}`; c.fillText(d.name, RAND + 16, y); }
  y += 40 + luft;
  const zeile = (b, min, max, mitte) => {
    y += 52 + luft; c.fillStyle = f.text; c.font = `650 34px ${SCHRIFT}`; c.fillText(b.name, RAND + 16, y);
    c.fillStyle = f.leise; c.font = `500 28px ${SCHRIFT}`; const w = c.measureText(b.wort).width; c.fillText(b.wort, B - RAND - 16 - w, y);
    y += 18; band(c, f, RAND + 16, y, innen - 32, b, min, max, mitte); y += 46;
  };
  for (const b of d.bereiche || []) zeile(b, 20, 80, [45, 55]);
  if (d.ehrlichkeit) zeile({ name: 'Ehrlichkeit-Bescheidenheit', ...d.ehrlichkeit }, 0, 100, [40, 60]);
  c.font = `500 32px ${SCHRIFT}`;
  const text = (titel, wert) => { if (!wert) return; y += 66 + luft; c.fillStyle = f.leise; c.fillText(titel, RAND + 16, y); const tw = c.measureText(titel + ' ').width;
    c.fillStyle = f.text; zeilen(c, wert, innen - 32 - tw).forEach((z, i) => { if (i) y += 42; c.fillText(z, RAND + 16 + tw, y); }); };
  text('Interessen:', (d.interessen || []).join(' · '));
  text('Rhythmus:', d.rhythmus);
  c.fillStyle = f.leise; c.font = `500 25px ${SCHRIFT}`;
  const fuss = ['Selbstreflexion, keine Diagnose. Bereiche statt Punkte.', `${d.vergleich ? d.vergleich + ' · ' : ''}gestrichelt = noch breit (Kurzform)`];
  fuss.forEach((z, i) => c.fillText(z, RAND + 16, H - RAND - 24 - (fuss.length - 1 - i) * 36));
  return y;
}
export function zeichne(canvas, d) {
  canvas.width = B; canvas.height = H;
  const c = canvas.getContext('2d'), f = tokens();
  const ende = male(c, f, d, 0), frei = H - RAND - 24 - 36 - 70 - ende;
  const stellen = (d.bereiche || []).length + (d.ehrlichkeit ? 1 : 0) + (d.name ? 1 : 0) + 1 + (d.interessen && d.interessen.length ? 1 : 0) + (d.rhythmus ? 1 : 0);
  const luft = Math.max(0, Math.min(36, Math.floor(frei / Math.max(1, stellen))));
  if (luft > 0) male(c, f, d, luft);
  return canvas;
}
export function bildErzeugen(d) {
  const cv = zeichne(document.createElement('canvas'), d);
  return new Promise((ok, nein) => cv.toBlob((b) => (b ? ok(b) : nein(new Error('Bild ging nicht'))), 'image/png'));
}
