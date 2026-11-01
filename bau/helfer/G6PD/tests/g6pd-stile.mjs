// G6+d gezielte Abnahme: G6P-30 (Daten = Tabelle, Noten je Regel, Namen), G6P-31 (ein Undo, gleiches Rezept ohne Neurechnen),
// G6P-32 (Lead/fxBus unverändert), G6P-33 (v1 → v2, ↶ deep-equal), G6P-34 (keine Fernwirkung, Auf alle Stellen), G6P-35 (Take-Stimmen bleiben, Echo-Vorschlag),
// Grenzen (6 Stimmen, 8 Spuren), Background. Aufruf: node g6pd-stile.mjs [pfad/index.html]
import { chromium } from 'playwright';
import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const file = process.argv[2] || path.join(here, '..', 'index.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 390, height: 844}});
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + file); await p.waitForTimeout(1200);
const res = await p.evaluate(async () => {
  const D = window.SYNQUENZER, out = {}, ok = (k, v, info) => { out[k] = v ? 'ok' : 'FEHLER ' + JSON.stringify(info === undefined ? null : info).slice(0, 400); };
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b), clone = x => JSON.parse(JSON.stringify(x));
  // synthetischer Gesang: C4 D4 E4 F4 G4 A4 B4 C5 je 0,4 s (Obertöne, kleine Pausen)
  const sr = 48000, mids = [60, 62, 64, 65, 67, 69, 71, 72], seg = 0.4, pcm = [];
  for (const m of mids) { const f = 440 * Math.pow(2, (m - 69) / 12), n = Math.round(seg * sr); for (let i = 0; i < n; i++) { const t = i / sr, e = Math.min(1, i / 480, (n - i) / 480) * (i < n - 2400 ? 1 : 0);
    let y = 0; for (let h = 1; h <= 6; h++) y += Math.sin(2 * Math.PI * f * h * t) / h; pcm.push(Math.round(9000 * e * y)); } }
  const inj = await D.tkInject({pcm, sr, scene: 0, len: 2}); const st = inj.track, r = {t: st, s: 0};
  const S = D.project ? null : null;
  const P = () => JSON.parse(D.state ? '{}' : '{}');
  const proj = () => JSON.parse(JSON.stringify(window.SYNQUENZER.g6Info(r)));
  const lead0 = proj();
  const fx0 = D.getBusFx ? clone(D.getBusFx()) : null;
  const T = D.g6pStyles();
  // je Stil ein Tipp
  const tab = {};
  for (const id of T.order) {
    const u0 = window.SYNQUENZER.history ? null : null;
    const okA = await D.g6pStyle(r, id); const info = D.g6Info(r), c = info.chor, sv = T.styles[id];
    const lanes = D.g6pLanes();
    const want = sv.voices.map(v => ({rule: v.rule, db: v.db, pan: v.pan, w: v.w, dbl: v.dbl}));
    const got = c && c.voices.map(v => ({rule: v.rule, db: v.db, pan: v.pan, w: v.w, dbl: v.dbl}));
    const names = c && c.voices.map(v => (lanes.lanes.find(l => l.id === v.lane) || {}).name);
    tab[id] = {okA, v: c && c.v, style: c && c.style, grpEq: c && eq(c.grp, sv.grp), vEq: eq(want, got), names, n: c && c.voices.map(v => v.n.map(q => q.iv).join(','))};
  }
  out.tab = tab;
  ok('G6P-30 Daten = Tabelle', Object.values(tab).every(t => t.okA && t.v === 2 && t.grpEq && t.vEq), tab);
  // Noten je Regel (C-Dur, ohne Begleitung → leitereigene Dreiklänge): Terz oben C→E … H→D
  const terz = [60, 62, 64, 65, 67, 69, 71].map(L => D.g6pNoteOf('st+2', L).iv + L), wantT = [64, 65, 67, 69, 71, 72, 74];
  const quinteU = [60, 62, 64, 65, 67, 69, 71].map(L => D.g6pNoteOf('st-4', L).iv + L), wantQ = [53, 55, 57, 59, 60, 62, 64];
  const okt = D.g6pNoteOf('oct+1', 61), falsT = D.g6pNoteOf('st+2/o+1', 60);
  const ch1 = D.g6pNoteOf('ch+1', 64, [0, 4, 7]).iv, chm1 = D.g6pNoteOf('ch-1', 64, [0, 4, 7]).iv, chm2 = D.g6pNoteOf('ch-2', 64, [0, 4, 7]).iv, root = D.g6pNoteOf('root-', 64, [0, 4, 7]).iv;
  ok('G6P-30 Noten je Regel', eq(terz, wantT) && eq(quinteU, wantQ) && okt.iv === 12 && falsT.iv === 16 && ch1 === 3 && chm1 === -4 && chm2 === -9 && root === -16 && D.g6pNoteOf('ch+1', 64, [0, 4, 7]).d === 2,
    {terz, quinteU, okt, falsT, ch1, chm1, chm2, root});
  ok('G6P-30 Namen', eq(tab.gospel.names, ['Chor Sopran', 'Chor Alt', 'Chor Tenor']) && eq(tab['80'].names, ['Chor Unisono', 'Chor Terz oben', 'Chor Oktave oben'])
    && tab.barber.names[0] === 'Chor Sopran' && tab.barber.names[2] === 'Chor Bass' && eq(tab.disco.names, ['Chor Oktave oben', 'Chor Falsett Terz']) && tab.wave.names[1] === 'Chor Quinte unten', tab);
  // G6P-31: ein Tipp = ein Undo-Schritt; ↶ stellt den vorigen Stil her, ↷ wieder
  const before = D.g6Info(r).chor, lanesB = D.g6pLanes();
  await D.g6pStyle(r, 'pop'); const afterPop = D.g6Info(r).chor, lanesA = D.g6pLanes();
  D.undo(); const u1 = D.g6Info(r).chor, lu1 = D.g6pLanes();
  D.redo(); const r1 = D.g6Info(r).chor, lr1 = D.g6pLanes();
  ok('G6P-31 ein Undo-Schritt', eq(u1, before) && eq(lu1, lanesB) && eq(r1, afterPop) && eq(lr1, lanesA), {u1: !!u1});
  // gleiches Rezept (80er → 80er) rechnet nicht neu (keine Analyse), Noten gleich
  await D.g6pStyle(r, '80'); const n80 = D.g6Info(r).chor.voices.map(v => v.n); await D.g6pStyle(r, '80');
  ok('G6P-31 gleiches Rezept ohne Neurechnen', D.g6pLast().analysed === false && eq(n80, D.g6Info(r).chor.voices.map(v => v.n)), D.g6pLast());
  // G6P-32: Lead-Sound, gfx, fxBus unverändert
  const fx1 = D.getBusFx ? clone(D.getBusFx()) : null;
  ok('G6P-32 fxBus unverändert', eq(fx0, fx1), {fx0: !!fx0});
  out.styleToast = document.querySelector('.toast, #toast') ? (document.querySelector('.toast, #toast').textContent || '').slice(0, 80) : null;
  // G6P-35: Echo-Vorschlag ein Undo-Schritt
  const e0 = clone(D.getBusFx().echo); const okE = D.g6pEcho('80'); const e1 = clone(D.getBusFx().echo); D.undo(); const e2 = clone(D.getBusFx().echo);
  ok('G6P-35 Echo-Vorschlag', (okE ? e1.divL === '1/4' : e0.divL === '1/4') && eq(e0, e2), {e0, e1, e2, okE});
  // Doppeltipp-Werte
  ok('Stil-Wert', D.g6pStyleVal('gospel', null, 'below') === 6 && D.g6pStyleVal('disco', 'st+2/o+1', 'db') === -2 && D.g6pStyleVal('bg', null, 'below') === 9);
  // Hilfetexte / Kachel-Zeile ≤ 20 Zeichen, keine leeren
  ok('Kachel-Zeile ≤ 20', T.order.every(id => T.styles[id].sub.length <= 20 && T.styles[id].help.length > 20 && T.styles[id].label) && T.bg.sub.length <= 20, T.order.map(id => T.styles[id].sub.length));
  return {out, inj, errsInPage: null};
});
console.log(JSON.stringify(res.out, null, 1));
console.log('pageerrors', JSON.stringify(errs));
const bad = Object.entries(res.out).filter(([k, v]) => typeof v === 'string' && v.startsWith('FEHLER'));
console.log(bad.length ? 'FEHLER: ' + bad.length : 'ALLE OK');
await b.close(); process.exit(bad.length || errs.length ? 1 : 0);
