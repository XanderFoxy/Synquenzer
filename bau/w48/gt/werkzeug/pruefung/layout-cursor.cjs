// Prüft: Cursor ↔ Audio-Uhr (Pixel des Cursors gegen die erwartete Stelle), jeder Knopf mit sichtbarer Wirkung,
// hochkant/quer/faltbar ohne Überlappung, Tippflächen ≥ 44 px, nichts unter der unteren Leiste.
const { chromium } = require('playwright');
const fs = require('fs');
const G = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/gt/';
const U = 'http://localhost:8961/app/';
const PROFIL = { tief: 46, hoch: 58, kern: [49, 58], typ: 'Bariton (Schätzung)', uebergaenge: [54, 58], quelle: 'profil' };
const TR = fs.readFileSync(G + 'app/js/trainer.js', 'utf8').replace('aktiv = { D, k, sb, T0, tZ, tS, tE, vorB, frames, pl, e: null, fertig };',
  'aktiv = { D, k, sb, T0, tZ, tS, tE, vorB, frames, pl, e: null, fertig }; window.__gtAktiv = aktiv;').replace('export function sitzung() {', 'window.__gtSZ = SZ;\nexport function sitzung() {');

async function seite(b, w, hh) {
  const ctx = await b.newContext({ viewport: { width: w, height: hh }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, colorScheme: 'dark', permissions: ['microphone'] });
  await ctx.route('**/app/js/trainer.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: TR }));
  await ctx.addInitScript((p) => { localStorage.setItem('gt.stimme', JSON.stringify(p)); }, PROFIL);
  const p = await ctx.newPage();
  p.fehler = [];
  p.on('pageerror', (e) => p.fehler.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') p.fehler.push('console: ' + m.text()); });
  return { ctx, p };
}
const pruefeLayout = (p, name) => p.evaluate((name) => {
  const out = [];
  const sicht = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !el.closest('[hidden]'); };
  if (document.documentElement.scrollWidth - innerWidth > 1) out.push(`quer scrollbar ${document.documentElement.scrollWidth - innerWidth}px`);
  const knoepfe = [...document.querySelectorAll('#ansicht button, #ansicht a, #ansicht summary, .kopf a, .leiste a')].filter(sicht);
  for (const k of knoepfe) { const r = k.getBoundingClientRect(); if (r.height < 43.5 || r.width < 43.5) out.push(`klein ${Math.round(r.width)}×${Math.round(r.height)}: ${(k.getAttribute('aria-label') || k.textContent).trim().slice(0, 30)}`); }
  const ab = (a, c) => { const r = a.getBoundingClientRect(), q = c.getBoundingClientRect(); return Math.min(r.right, q.right) - Math.max(r.left, q.left) > 2 && Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top) > 2; };
  const inAnsicht = knoepfe.filter((k) => k.closest('#ansicht'));
  for (let i = 0; i < inAnsicht.length; i++) for (let j = i + 1; j < inAnsicht.length; j++) {
    const a = inAnsicht[i], c = inAnsicht[j]; if (a.contains(c) || c.contains(a)) continue;
    if (ab(a, c)) out.push(`Überlappung: „${a.textContent.trim().slice(0, 20)}“ / „${c.textContent.trim().slice(0, 20)}“`);
  }
  // Text-Elemente der Übungskarte dürfen sich nicht überdecken
  const teile = ['.tr-kopf', '.tr-jetzt', '.tr-rolle', '.tr-steuer', '.tr-optionen', '.tr-hinweis', '.tr-chips'].map((s) => document.querySelector(s)).filter((x) => x && sicht(x));
  for (let i = 0; i < teile.length; i++) for (let j = i + 1; j < teile.length; j++) if (ab(teile[i], teile[j])) out.push(`Überlappung ${teile[i].className} / ${teile[j].className}`);
  for (const s of ['.tr-steuer', '.tr-start-box', '.tr-tempo', '.tr-kopf']) { const e = document.querySelector(s); if (e && e.scrollWidth > e.clientWidth + 1) out.push(`${s} läuft über`); }
  // unten: letzter Inhalt darf beim ganz-nach-unten-Scrollen nicht unter der Leiste liegen
  scrollTo(0, document.documentElement.scrollHeight);
  const lst = document.querySelector('.leiste'), letzt = [...document.querySelectorAll('#ansicht > *')].filter(sicht).pop();
  if (lst && letzt && sicht(lst) && letzt.getBoundingClientRect().bottom > lst.getBoundingClientRect().top + 1) out.push(`unter der Leiste: ${Math.round(letzt.getBoundingClientRect().bottom - lst.getBoundingClientRect().top)}px`);
  scrollTo(0, 0);
  return out.map((x) => `${name}: ${x}`);
}, name);

(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${G}werkzeug/fuehrung/ges3.wav`, '--autoplay-policy=no-user-gesture-required'] });
  const befunde = [];
  // ---------- 1. Cursor gegen Audio-Uhr + Knöpfe (hochkant)
  {
    const { ctx, p } = await seite(b, 428, 926);
    await p.goto(U + '#uebung/arpeggio'); await p.waitForSelector('.tr-start'); await p.waitForTimeout(400);
    // Knöpfe: sichtbare Wirkung
    const bpm0 = await p.locator('.tr-bpm').innerText();
    await p.locator('.tr-tempo button[aria-label="Schneller"]').tap(); const bpm1 = await p.locator('.tr-bpm').innerText();
    await p.locator('.tr-tempo button[aria-label="Langsamer"]').tap(); const bpm2 = await p.locator('.tr-bpm').innerText();
    befunde.push(`Tempo: ${bpm0} → + ${bpm1} → − ${bpm2}`);
    for (const [gruppe, text] of [['Vorsingen', 'Stimme'], ['Vorsingen', 'Aus'], ['Vorsingen', 'Klavier'], ['Begleitung', 'Bordun'], ['Begleitung', 'Aus'], ['Begleitung', 'Akkord']]) {
      const k = p.locator('.tr-optionen > div', { hasText: gruppe }).locator('button', { hasText: text }).first();
      await k.tap(); await p.waitForTimeout(120);
      befunde.push(`${gruppe} ${text}: aria-pressed=${await k.getAttribute('aria-pressed')}`);
    }
    const kl = p.locator('.tr-klick'); const t0 = await kl.innerText(); await kl.tap(); const t1 = await kl.innerText(); await kl.tap();
    befunde.push(`Klick-Schalter: „${t0}“ → „${t1}“ → „${await kl.innerText()}“`);
    for (let i = 0; i < 20; i++) { const k = p.locator('.tr-tempo button[aria-label="Schneller"]'); if (await k.isDisabled()) break; await k.tap(); }
    await p.locator('.tr-start').tap();
    befunde.push(`Start: Knopf jetzt „${await p.locator('.tr-start-text').innerText()}“, Phase „${await p.locator('.tr-phase').innerText()}“`);
    const abw = [], phasen = new Set();
    for (let i = 0; i < 160; i++) {
      await p.waitForTimeout(60);
      const r = await p.evaluate(() => {
        const A = window.__gtAktiv, SZ = window.__gtSZ; if (!A || !SZ.ctx) return null;
        const lat = SZ.ctx.outputLatency || SZ.ctx.baseLatency || 0, t = SZ.ctx.currentTime - lat;
        const cv = document.querySelector('.tr-cv'), w = cv.clientWidth, g = cv.getContext('2d');
        const dpr = cv.width / w, L = A.D.laenge, links = 40, rechts = 10;
        let pos = null, farbe = '';
        if (t >= A.tS && t < A.tE) { pos = (t - A.tS) / A.sb; farbe = 'pink'; } else if (t >= A.T0 && t < A.tZ) { pos = (t - A.T0) / A.sb; farbe = 'grau'; }
        if (pos == null) return { phase: document.querySelector('.tr-phase').textContent };
        const y = Math.round(12 * dpr), d = g.getImageData(0, y, cv.width, 1).data;
        const xs = [];
        for (let x = Math.round(38 * dpr); x < cv.width; x++) { const R = d[x * 4], Gn = d[x * 4 + 1], B = d[x * 4 + 2]; if (d[x * 4 + 3] > 120 && (farbe === 'pink' ? R > 230 && Gn < 120 && B > 110 && B < 170 : R > 150 && Gn > 150 && B > 150)) xs.push(x / dpr); }
        if (!xs.length) return { phase: document.querySelector('.tr-phase').textContent, pos, fehlt: true };
        const xc = xs.reduce((a, b) => a + b, 0) / xs.length, erw = links + (pos / L) * (w - links - rechts);
        return { phase: document.querySelector('.tr-phase').textContent, pos, dx: xc - erw, beatPx: (w - links - rechts) / L, farbe };
      });
      if (!r) continue;
      phasen.add(r.phase);
      if (r.dx != null) abw.push({ dx: r.dx, beat: r.dx / r.beatPx, farbe: r.farbe });
      if (r.fehlt) abw.push({ fehlt: true, farbe: r.farbe });
      if (await p.locator('.tr-chip').count()) break;
    }
    const ok = abw.filter((a) => a.dx != null), fehlt = abw.filter((a) => a.fehlt).length;
    const maxB = ok.length ? Math.max(...ok.map((a) => Math.abs(a.beat))) : null;
    befunde.push(`Cursor: ${ok.length} Proben (${ok.filter((a) => a.farbe === 'grau').length} beim Vorsingen, ${ok.filter((a) => a.farbe === 'pink').length} beim Nachsingen), größte Abweichung ${maxB == null ? '–' : (maxB * 1000 / 1000).toFixed(3)} Schläge (${ok.length ? Math.max(...ok.map((a) => Math.abs(a.dx))).toFixed(1) : '–'} px), ohne Cursor gefunden: ${fehlt}`);
    befunde.push('Phasen: ' + [...phasen].join(' → '));
    befunde.push('Proben dx (Schläge): ' + ok.map((a) => a.farbe[0] + a.beat.toFixed(2)).join(' '));
    await p.screenshot({ path: G + 'fotos/p-hoch-lauf.png' });
    befunde.push(...await pruefeLayout(p, 'hoch, Lauf'));
    await p.locator('.tr-start').tap({ force: true }); await p.waitForTimeout(200);
    befunde.push(`Stopp: Knopf „${await p.locator('.tr-start-text').innerText()}“, Phase „${await p.locator('.tr-phase').innerText()}“`);
    p.fehler.forEach((f) => befunde.push('FEHLER ' + f));
    await ctx.close();
  }
  if (process.argv[2] === 'cursor') { console.log(befunde.join('\n')); await b.close(); return; }
  // ---------- 2. Atem: Klick-Schalter wirkt (Klicks im Ablauf gezählt)
  {
    const { ctx, p } = await seite(b, 428, 926);
    await p.addInitScript(() => { window.__klicks = 0; const o = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function (...a) { if (this.buffer && this.buffer.duration < 0.06) window.__klicks++; return o.apply(this, a); }; });
    await p.goto(U + '#uebung/atem-448'); await p.waitForSelector('.tr-start'); await p.waitForTimeout(300);
    await p.locator('.tr-start').tap(); await p.waitForTimeout(800); const mit = await p.evaluate(() => window.__klicks);
    await p.locator('.tr-start').tap({ force: true }); await p.waitForTimeout(200);
    await p.locator('.tr-klick').tap(); await p.evaluate(() => { window.__klicks = 0; });
    await p.locator('.tr-start').tap(); await p.waitForTimeout(800); const ohne = await p.evaluate(() => window.__klicks);
    await p.locator('.tr-start').tap({ force: true });
    befunde.push(`Atem-Übung Klicks geplant: Klick an ${mit}, „nur beim Einzählen“ ${ohne}`);
    p.fehler.forEach((f) => befunde.push('FEHLER ' + f));
    await ctx.close();
  }
  // ---------- 3. Layout hochkant / quer / faltbar: Seiten mit Übungskarte, Ergebnis-Karte, Einheit
  for (const [w, hh, name] of [[428, 926, 'hoch'], [926, 428, 'quer'], [760, 1000, 'falt']]) {
    const { ctx, p } = await seite(b, w, hh);
    for (const r of ['#uebung/arpeggio', '#einsingen/the-wall', '#lied/the-wall/ueben/r1-2/1', '#uebung/atem-448', '#uebung/koerper-lockern', '#start', '#verlauf']) {
      await p.goto(U + r); await p.waitForTimeout(900);
      befunde.push(...await pruefeLayout(p, `${name} ${r}`));
      if (name !== 'hoch' && /arpeggio|einsingen/.test(r)) await p.screenshot({ path: `${G}fotos/p-${name}-${r.replace(/[#/]+/g, '_').replace(/^_/, '')}.png` });
    }
    // Ergebnis-Karte (ohne Mikro-Messung): Bewegungsübung schnell durchlaufen lassen
    await p.goto(U + '#uebung/koerper-lockern'); await p.waitForSelector('.tr-start');
    for (let i = 0; i < 20; i++) { const k = p.locator('.tr-tempo button[aria-label="Schneller"]'); if (await k.isDisabled()) break; await k.tap(); }
    await p.locator('.tr-start').tap();
    await p.waitForSelector('.tr-erg', { timeout: 60000 }); await p.waitForTimeout(800);
    befunde.push(...await pruefeLayout(p, `${name} Ergebnis`));
    await p.screenshot({ path: `${G}fotos/p-${name}-ergebnis.png`, fullPage: true });
    p.fehler.forEach((f) => befunde.push(`FEHLER ${name} ${f}`));
    await ctx.close();
  }
  console.log(befunde.join('\n'));
  await b.close();
})().catch((e) => { console.error('ABBRUCH', e); process.exit(1); });
