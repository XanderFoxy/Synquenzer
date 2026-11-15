// Atem – Kreis/Blüte und Phasen-Ring auf Canvas2D (KONZEPT §4.5). Nur Deckkraft/Transform pro Bild, keine Filter.
const FARBE = { ein: '#6cc4d9', ein2: '#6cc4d9', halten_voll: '#9a8fd6', aus: '#e0a87a', stoss_aus: '#e0a87a', halten_leer: '#5c6b8a', ruhe: '#7d8796' };
export const phasenFarbe = (art) => FARBE[art] || FARBE.ruhe;
const hexRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

export function erzeugeFuehrung(canvas, opt = {}) {
  let ruhig = !!opt.ruhig, blumen = opt.blumen !== false, px = 320, dpr = Math.min(2, window.devicePixelRatio || 1);
  const g = canvas.getContext('2d');
  let leuchten = null, farbeJetzt = hexRgb(FARBE.ein), letzterR = 0;
  function groesse(n) {
    px = n; canvas.style.width = canvas.style.height = n + 'px'; canvas.width = canvas.height = Math.round(n * dpr);
    leuchten = document.createElement('canvas'); leuchten.width = leuchten.height = Math.round(n * dpr);
    const l = leuchten.getContext('2d'), m = leuchten.width / 2, rg = l.createRadialGradient(m, m, m * 0.2, m, m, m);
    rg.addColorStop(0, 'rgba(255,255,255,0.35)'); rg.addColorStop(0.6, 'rgba(255,255,255,0.08)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    l.fillStyle = rg; l.fillRect(0, 0, leuchten.width, leuchten.height);
  }
  groesse(opt.px || 320);
  function ringBoegen(z, plan, R, m) {
    const s = plan.schritte, i = z.i;
    g.lineWidth = Math.max(3, R * 0.035); g.lineCap = 'butt';
    let a0, a1, anteil;
    if (plan.ring === 'stoppuhr') {
      const sek = z.offen_ms != null ? z.offen_ms / 1000 : ((z.schritt.ms || 0) - (z.rest_ms || 0)) / 1000;
      g.strokeStyle = 'rgba(255,255,255,0.10)'; g.beginPath(); g.arc(m, m, R, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = phasenFarbe(z.schritt.art); g.beginPath(); g.arc(m, m, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ((sek % 60) / 60)); g.stroke();
      anteil = (sek % 60) / 60;
    } else if (plan.ring === 'runde' && z.schritt.zuege > 0) {
      const n = z.schritt.zuege;
      for (let k = 0; k < n; k++) { const a = -Math.PI / 2 + (k / n) * Math.PI * 2; g.strokeStyle = k < z.zug ? '#6cc4d9' : 'rgba(255,255,255,0.14)'; g.beginPath(); g.arc(m, m, R, a + 0.02, a + Math.PI * 2 / n - 0.02); g.stroke(); }
      anteil = ((z.zug - 1) + z.p) / n;
    } else {
      // ein Umlauf = ein Zyklus: Schritte mit gleichem zug
      let lo = i, hi = i; const zg = s[i].zug;
      while (lo > 0 && s[lo - 1].zug === zg && s[lo - 1].abschnitt === s[i].abschnitt && s[lo - 1].runde === s[i].runde) lo--;
      while (hi < s.length - 1 && s[hi + 1].zug === zg && s[hi + 1].abschnitt === s[i].abschnitt && s[hi + 1].runde === s[i].runde) hi++;
      if (s[i].abschnitt !== 'uebung' || zg === 0) { lo = hi = i; }
      const gesamt = plan.start[hi + 1] - plan.start[lo] || 1;
      let a = -Math.PI / 2;
      for (let k = lo; k <= hi; k++) {
        const w = ((s[k].ms || 0) / gesamt) * Math.PI * 2;
        g.strokeStyle = phasenFarbe(s[k].art); g.globalAlpha = k === i ? 1 : 0.35; g.beginPath(); g.arc(m, m, R, a + 0.015, a + w - 0.015); g.stroke(); a += w;
      }
      g.globalAlpha = 1;
      anteil = (plan.start[i] - plan.start[lo] + (s[i].ms || 0) * z.p) / gesamt;
    }
    // Punkt im Uhrzeigersinn
    const pa = -Math.PI / 2 + Math.PI * 2 * (anteil || 0);
    g.fillStyle = '#e8eef5'; g.beginPath(); g.arc(m + R * Math.cos(pa), m + R * Math.sin(pa), Math.max(4, R * 0.04), 0, Math.PI * 2); g.fill();
  }
  function zeichne(z, plan) {
    const W = canvas.width, m = W / 2, R = m * 0.92;
    g.clearRect(0, 0, W, W);
    const v = ruhig ? 0.5 : z.v, r1 = R * 0.78, r0 = 0.38 * r1;
    const r = Math.sqrt(r0 * r0 + (r1 * r1 - r0 * r0) * Math.max(v, 0)) * (1 + 0.12 * Math.min(v, 0));
    letzterR = r / dpr;
    // Farbe weich
    const ziel = hexRgb(phasenFarbe(z.schritt.art));
    for (let k = 0; k < 3; k++) farbeJetzt[k] += (ziel[k] - farbeJetzt[k]) * 0.12;
    const [cr, cg, cb] = farbeJetzt.map((x) => Math.round(x));
    g.globalAlpha = 0.25 + 0.5 * Math.max(0, v); g.drawImage(leuchten, 0, 0); g.globalAlpha = 1;
    if (blumen && !ruhig) {
      const vp = Math.max(0, v), br = 0.5 * r, ab = 0.5 * r * vp, rot = (15 * vp) * Math.PI / 180;
      g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(${cr},${cg},${cb},${(0.3 / (1 + 5 * (1 - vp))).toFixed(3)})`;   // überlappende Blätter nie weiß
      for (let k = 0; k < 6; k++) { const a = rot + k * Math.PI / 3; g.beginPath(); g.arc(m + ab * Math.cos(a), m + ab * Math.sin(a), br, 0, Math.PI * 2); g.fill(); }
      g.globalCompositeOperation = 'source-over';
    } else {
      const hell = ruhig ? 0.55 + 0.15 * (z.v - 0.5) : 0.5;
      g.fillStyle = `rgba(${cr},${cg},${cb},${hell})`; g.beginPath(); g.arc(m, m, r, 0, Math.PI * 2); g.fill();
    }
    g.strokeStyle = `rgba(${cr},${cg},${cb},0.9)`; g.lineWidth = 2 * dpr; g.beginPath(); g.arc(m, m, r, 0, Math.PI * 2); g.stroke();
    ringBoegen(z, plan, R, m);
  }
  return { zeichne, groesse, einstellen(o) { if ('ruhig' in o) ruhig = !!o.ruhig; if ('blumen' in o) blumen = !!o.blumen; }, get radius() { return letzterR; }, get px() { return px; } };
}
