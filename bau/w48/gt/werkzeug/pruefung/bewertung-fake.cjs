// Adversariale Prüfung der Bewertung mit einem Fake-Sänger, der direkt an der Audio-Uhr der Übung singt.
// Der Fake ersetzt das Mikrofon (createMediaStreamSource) und singt die Zieltöne der laufenden Übung –
// richtig, leicht daneben, falsch, zu spät, still oder als „Leck“ (die App-Begleitung landet im Mikrofon).
// trainer.js wird nur für den Test über eine Route um zwei window-Zeiger ergänzt (die App-Datei bleibt unverändert).
const { chromium } = require('playwright');
const fs = require('fs');
const G = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/gt/';
const U = 'http://localhost:8961/app/';
const PROFIL = { tief: 46, hoch: 58, kern: [49, 58], typ: 'Bariton (Schätzung)', uebergaenge: [54, 58], quelle: 'profil' };
const TR = fs.readFileSync(G + 'app/js/trainer.js', 'utf8').replace('aktiv = { D, k, sb, T0, tZ, tS, tE, vorB, frames, pl, e: null, fertig };',
  'aktiv = { D, k, sb, T0, tZ, tS, tE, vorB, frames, pl, e: null, fertig }; window.__gtAktiv = aktiv;')
  .replace('export function sitzung() {', 'window.__gtSZ = SZ;\nexport function sitzung() {');
if (!TR.includes('window.__gtAktiv') || !TR.includes('window.__gtSZ = SZ')) throw new Error('Haken in trainer.js nicht gefunden');

function fake(cfg) {
  window.__fake = cfg;
  const md = navigator.mediaDevices;
  md.getUserMedia = async () => { if (cfg.verweigert) { const e = new Error('nein'); e.name = 'NotAllowedError'; throw e; } return { getTracks: () => [{ stop() {} }] }; };
  const orig = AudioNode.prototype.connect;
  let mic = null;
  AudioNode.prototype.connect = function (z, ...r) {
    const out = orig.call(this, z, ...r);
    try {
      if (cfg.leck && mic && z === this.context.destination && mic.ctx === this.context && !(window.__gtSZ && this === window.__gtSZ.still)) orig.call(this, mic.leck);
    } catch (e) { /* egal */ }
    return out;
  };
  AudioContext.prototype.createMediaStreamSource = function () {
    const ctx = this, sum = ctx.createGain();
    const leck = ctx.createGain(); leck.gain.value = cfg.leckGain || 0.3; orig.call(leck, sum);
    const env = ctx.createGain(); env.gain.value = 0; orig.call(env, sum);
    const osc = ctx.createOscillator(); osc.type = 'sawtooth';
    const lp = ctx.createBiquadFilter(); lp.frequency.value = 2600; orig.call(osc, lp); orig.call(lp, env); osc.start();
    mic = { ctx, sum, leck, env, osc };
    let letzt = null;
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    setInterval(() => {
      const A = window.__gtAktiv; if (!A || A === letzt || !cfg.singen) return; letzt = A;
      const sb = A.sb, off = (cfg.cent || 0) / 100, sp = cfg.spaet || 0, L = 0.22;
      A.D.noten.forEach((n, i) => {
        const t = A.tS + n.b * sb + sp, d = n.d * sb;
        const fehl = cfg.zufall ? [3, -4, 5, -2, 4][i % 5] : 0;
        osc.frequency.setValueAtTime(hz(n.midi + off + fehl), t);
        if (n.bis != null && isFinite(n.bis)) osc.frequency.exponentialRampToValueAtTime(hz(n.bis + off + fehl), t + d);
        env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(L, t + 0.025);
        env.gain.setValueAtTime(L, t + Math.max(0.03, d - 0.03)); env.gain.linearRampToValueAtTime(0, t + d);
      });
    }, 10);
    return sum;
  };
}

async function lauf(b, name, route, cfg, { tempoMax = true, durch = 1, wahl = [] } = {}) {
  const ctx = await b.newContext({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, colorScheme: 'dark' });
  await ctx.route('**/app/js/trainer.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: TR }));
  await ctx.addInitScript((p) => { localStorage.setItem('gt.stimme', JSON.stringify(p)); localStorage.setItem('gt.kopfhoererGesagt', 'true'); }, PROFIL);
  await ctx.addInitScript(fake, cfg);
  const p = await ctx.newPage();
  const fehler = [];
  p.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') fehler.push('console: ' + m.text()); });
  await p.goto(U + route); await p.waitForSelector('.tr-start'); await p.waitForTimeout(400);
  for (const [gruppe, text] of wahl) await p.locator('.tr-optionen > div', { hasText: gruppe }).locator('button', { hasText: text }).first().tap();
  if (tempoMax) for (let i = 0; i < 30; i++) { const k = p.locator('.tr-tempo button[aria-label="Schneller"]'); if (await k.isDisabled()) break; await k.tap(); }
  await p.locator('.tr-start').tap();
  const werte = [];
  for (let i = 0; i < 600 && werte.length < durch; i++) {
    await p.waitForTimeout(100);
    const n = await p.locator('.tr-chip').count();
    if (n > werte.length) werte.push(await p.evaluate(() => { const e = window.__gtLetzte && window.__gtLetzte.e; return e ? { g: e.gesamt, ok: e.gueltig, gh: e.gehoert, teile: (e.teile || []).map((t) => t.id + ':' + (t.wert == null ? '-' : Math.round(t.wert * 100))).join(' '), tipp: e.tipp } : null; }));
  }
  if (await p.locator('.tr-start.puls').count()) await p.locator('.tr-start').tap({ force: true });
  await ctx.close();
  return { name, werte, fehler };
}

(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const faelle = [
    ['richtig', '#uebung/arpeggio', { singen: true }],
    ['+25 Cent', '#uebung/arpeggio', { singen: true, cent: 25 }],
    ['+1 Halbton', '#uebung/arpeggio', { singen: true, cent: 100 }],
    ['−1 Halbton', '#uebung/arpeggio', { singen: true, cent: -100 }],
    ['+3 Halbtöne', '#uebung/arpeggio', { singen: true, cent: 300 }],
    ['falsche Töne', '#uebung/arpeggio', { singen: true, zufall: true }],
    ['250 ms spät', '#uebung/arpeggio', { singen: true, spaet: 0.25 }],
    ['still', '#uebung/arpeggio', { singen: false }],
    ['still + Leck', '#uebung/arpeggio', { singen: false, leck: true }],
    ['richtig + Leck', '#uebung/arpeggio', { singen: true, leck: true }],
    ['still + Leck 0.7', '#uebung/arpeggio', { singen: false, leck: true, leckGain: 0.7 }],
    ['still+Leck Stimme', '#uebung/vokal-leiter', { singen: false, leck: true, leckGain: 0.5 }],
    ['still+Leck Bord.', '#uebung/ng-sirene', { singen: false, leck: true, leckGain: 0.5 }],
    ['Sirene richtig', '#uebung/ng-sirene', { singen: true }],
    ['Sirene +1 HT', '#uebung/ng-sirene', { singen: true, cent: 100 }],
    ['Staccato richtig', '#uebung/staccato', { singen: true }],
    ['Staccato +1 HT', '#uebung/staccato', { singen: true, cent: 100 }],
  ];
  const nur = process.argv[2] ? new RegExp(process.argv[2]) : null;
  const liste = faelle.filter(([n]) => !nur || nur.test(n));
  const erg = [];
  for (let i = 0; i < liste.length; i += 3) erg.push(...await Promise.all(liste.slice(i, i + 3).map(([n, r, c]) => lauf(b, n, r, c))));
  for (const e of erg) console.log(e.name.padEnd(16), e.werte.map((w) => (w ? `${w.ok ? '' : '(ungültig) '}${w.g} % gehört ${w.gh} | ${w.teile} | ${w.tipp}` : 'kein Ergebnis')).join(' || '), e.fehler.length ? ' FEHLER ' + e.fehler.join('; ') : '');
  await b.close();
})().catch((e) => { console.error('ABBRUCH', e); process.exit(1); });
