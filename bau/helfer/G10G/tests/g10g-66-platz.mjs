// G10-66: M-PLATZ des Tonart-Chips, der Leiste und des Reglers Einrast-Zeit (≥ 44 × 44 Trefferfläche, im Bild, nichts verdeckt),
// hoch und quer; dazu die Bildschirmfotos nach tests/bilder/ (428×926, 926×428, 428×650).
import {launch, open, takeIn, edOpen, sleep, ok, done, fonts, HERE} from './lib.mjs';
import path from 'path';
const VP = {'428x926': [428, 926], '926x428': [926, 428], '428x650': [428, 650]};
const HIT = () => { window.__hit = (b, lim = 60) => { const q = b.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2;
  const hit = (x, y) => { const e = document.elementFromPoint(x, y); return !!e && (e === b || b.contains(e)); };
  if (!hit(cx, cy)) return [0, 0];
  const ext = (dx, dy) => { let a = 0, c = 0; for (let k = 1; k <= lim; k++) { if (!hit(cx + dx * k, cy + dy * k)) { c = k; break; } a = k; } if (!c) return a; for (let i = 0; i < 5; i++) { const m = (a + c) / 2; if (hit(cx + dx * m, cy + dy * m)) a = m; else c = m; } return a; };
  return [ext(-1, 0) + ext(1, 0), ext(0, -1) + ext(0, 1)].map(v => Math.round(v * 10) / 10); }; };
const br = await launch();
// Meldungen (Toast) liegen nur kurz oben; gemessen wird das Blatt ohne sie
const NOTOAST = () => { const t = EL.toast; if (t) t.style.visibility = 'hidden'; };
const mel = [64.3, 65.2, 67.4, 62.1, 60.3, 64.2, 69.1, 67.2].map(m => ({m, d: 0.3}));
for (const [nm, [w, h]] of Object.entries(VP)) {
  const p = await open(br, w, h); await fonts(p); await p.evaluate(HIT);
  const T = await takeIn(p, mel);
  const page0 = await p.evaluate(() => [document.scrollingElement.scrollHeight, document.scrollingElement.scrollWidth]);
  await edOpen(p, T.ref);
  await p.evaluate(r => SYNQUENZER.g2Quantize(r, {q: true, mode: 'hard', str: 1}), T.ref); await sleep(600); await p.evaluate(NOTOAST);
  await p.screenshot({path: path.join(HERE, 'bilder', `blatt-${nm}.png`)});
  const vw = await p.evaluate(() => [innerWidth, innerHeight]);
  // Chip + Regler
  const A = await p.evaluate(() => { const sh = document.getElementById('wpSheet'), out = [];
    for (const b of [sh.querySelector('.g10g-kc'), sh.querySelector('.g10g-rt input[type=range]')]) { const q = b.getBoundingClientRect(); out.push({t: b.getAttribute('aria-label'), r: [q.left, q.top, q.right, q.bottom].map(Math.round), hit: __hit(b)}); }
    const cv = sh.querySelector('.wpcv').getBoundingClientRect(); return {out, cvH: Math.round(cv.height)}; });
  const bad = A.out.filter(x => x.hit[0] < 44 || x.hit[1] < 44 || x.r[0] < 0 || x.r[1] < 0 || x.r[2] > vw[0] || x.r[3] > vw[1]);
  ok(!bad.length, `${nm} Chip + Einrast-Zeit ≥ 44 und im Bild: ` + A.out.map(x => x.t + ' ' + x.hit.join('×')).join(' | '));
  ok(A.cvH >= 64, `${nm} Notenfläche bleibt ≥ 64 px hoch (${A.cvH} px)`);
  // Leiste öffnen (Tipp auf den Chip), jeden Knopf ins Bild holen und messen
  await p.tap('#wpSheet .g10g-kc'); await sleep(300);
  await p.screenshot({path: path.join(HERE, 'bilder', `leiste-${nm}.png`)});
  const L = await p.evaluate(async () => { const kp = document.querySelector('#wpSheet .g10g-kp'), out = []; if (!kp || kp.hidden) return null;
    for (const b of kp.querySelectorAll('button')) { if (b.closest('[hidden]')) continue; b.scrollIntoView({block: 'nearest'}); await new Promise(r => setTimeout(r, 20));
      const q = b.getBoundingClientRect(), k = kp.getBoundingClientRect(); out.push({t: b.textContent.trim(), hit: __hit(b), clip: b.scrollWidth > b.clientWidth + 1 || b.scrollHeight > b.clientHeight + 1, inK: q.top >= k.top - .5 && q.bottom <= k.bottom + .5 && q.left >= k.left - .5 && q.right <= k.right + .5}); }
    kp.scrollTop = 0; const k = kp.getBoundingClientRect(); return {out, k: [k.left, k.top, k.right, k.bottom].map(Math.round), sh: kp.scrollHeight, ch: kp.clientHeight}; });
  ok(!!L && L.out.length === 4 + 12 + 9, `${nm} Leiste offen: ${L ? L.out.length : 0} Knöpfe (3 Quellen + Fertig, 12 Grundtöne, 9 Leitern)`);
  const lb = L ? L.out.filter(x => x.hit[0] < 44 || x.hit[1] < 44 || !x.inK || x.clip) : [1];
  ok(!lb.length, `${nm} jeder Leisten-Knopf ≥ 44 × 44, ganz sichtbar, Text nicht abgeschnitten ` + (lb.length ? JSON.stringify(lb) : L.out.map(x => x.t + ' ' + x.hit.join('×')).slice(0, 6).join(' | ') + ' …'));
  ok(L && L.k[0] >= 0 && L.k[1] >= 0 && L.k[2] <= vw[0] && L.k[3] <= vw[1], `${nm} Leiste im Bild ${L && L.k.join(',')} (Inhalt ${L && L.sh}/${L && L.ch} px${L && L.sh > L.ch ? ', blättert' : ''})`);
  // die Leiste deckt nur das Blatt (Kopf mit Chip bleibt bedienbar), kein Seiten-Sprung
  const hd = await p.evaluate(() => __hit(document.querySelector('#wpSheet .g10g-kc')));
  ok(hd[0] >= 44 && hd[1] >= 44, `${nm} Chip bleibt bei offener Leiste bedienbar ${hd.join('×')}`);
  const page1 = await p.evaluate(() => [document.scrollingElement.scrollHeight, document.scrollingElement.scrollWidth]);
  ok(page1[0] === page0[0] && page1[1] === page0[1], `${nm} Seitengröße unverändert`);
  // A-Moll per Tipp wählen → Bild
  await p.tap('#wpSheet .g10g-kp [data-root="9"]'); await sleep(250); await p.tap('#wpSheet .g10g-kp [data-scale="aeolian"]'); await sleep(400);
  await p.screenshot({path: path.join(HERE, 'bilder', `leiste-amoll-${nm}.png`)});
  await p.tap('#wpSheet .g10g-kp [data-a="close"]'); await sleep(500);
  await p.screenshot({path: path.join(HERE, 'bilder', `blatt-amoll-${nm}.png`)});
  const I = await p.evaluate(r => SYNQUENZER.g10gInfo(r), T.ref);
  ok(I.key && I.key.root === 9 && I.key.scale === 'aeolian' && I.key.src === 'user' && !I.panel, `${nm} Tipp-Wahl A-Moll gespeichert, Leiste zu: ${JSON.stringify(I.key)} Chip „${I.chip}“`);
  ok(!p.errs.length, `${nm} Konsole sauber ${JSON.stringify(p.errs.slice(0, 2))}`);
  await p.ctx.close();
}
await br.close();
done();
