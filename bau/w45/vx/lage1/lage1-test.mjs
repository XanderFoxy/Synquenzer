// LAGE1 – Lage teilen · Oktave falten ohne Doppelnoten · Filter je Note (Noten-Editor). Touch über CDP, iPhone 12 Pro Max hochkant + quer.
// Aufruf: node lage1-test.mjs <abs. index.html> [<abs. basis.html>] [428x926,926x428]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), base = path.resolve(process.argv[3] || path.join(path.dirname(file), 'basis.html'));
const here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(here, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const VIEWS = (process.argv[4] || '428x926,926x428').split(',').map(s => s.split('x').map(Number));
const res = []; const ok = (name, cond, info) => { res.push({name, ok: !!cond}); console.log((cond ? 'OK   ' : 'FEHL ') + name + (info !== undefined ? '  ' + JSON.stringify(info).slice(0, 360) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--disable-renderer-backgrounding']});

// eine Bass-/Sequenzlinie über drei Oktaven (16 Achtel, 2 Takte) – wie Xanders Arbeitsweise: unten gut, oben zu hell
const SEQ = [36, 43, 48, 52, 55, 60, 64, 67, 72, 76, 79, 84, 72, 67, 60, 55];
const setupSrc = `(() => { setSongView(false); for (let i = 1; i < NT(); i++) if (S.tracks[i].kind === 'synth') S.tracks[i].clips[0] = null;
  const c = S.tracks[0].clips[0] || (S.tracks[0].clips[0] = {len: 2, key: {root: 0, scale: 'ionian', src: 'auto'}, notes: []}); c.len = 2; c.notes = [];
  const seq = ${JSON.stringify(SEQ)}; for (let k = 0; k < 16; k++) c.notes.push({t: k * .5, d: .45, n: seq[k], v: .5 + (k % 4) * .12}); clipChanged(0, 0); selectTrack(0); openRoll(0, 0); return c.notes.length; })()`;

async function page(f, W, H) {
  const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(), cdp = await ctx.newCDPSession(p), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto('file://' + f);
  await p.waitForFunction(() => typeof BOOT !== 'undefined' && BOOT.done && window.SYNQUENZER, null, {timeout: 90000}); await sleep(700);
  return {ctx, p, cdp, errs};
}

for (const [W, H] of VIEWS) {
  const tag = W + 'x' + H, T = s => tag + ' ' + s, land = W > H;
  // ---------- L0 Aus: pixelgleich zur Basis (Rolle offen, Blatt zu, Zeile VEL) ----------
  {
    const A = await page(base, W, H), B = await page(file, W, H);
    for (const X of [A, B]) { await X.p.evaluate(setupSrc); await sleep(500); }
    const clipBox = await B.p.evaluate(() => { const r = EL.rollSheet.getBoundingClientRect(); return {x: Math.round(r.left), y: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height)}; });
    const [ia, ib] = [await A.p.screenshot({clip: clipBox}), await B.p.screenshot({clip: clipBox})];
    ok(T('L0 Rolle ohne Blatt pixelgleich zur Basis (Knopf liegt hinter dem Rand der Leiste)'), Buffer.compare(ia, ib) === 0, {bytes: [ia.length, ib.length]});
    // MIDI ohne Filter-Werte: bitgleich zur Basis (Szene + Song-Weg über Export-Spur)
    const mid = X => X.p.evaluate(() => { const m = buildMidi({mode: 'scene', scene: 0}); const v = va1MidiClip(0, 0, true); return [m ? Array.from(m.bytes).join(',') : '', v ? Array.from(v.bytes).join(',') : '']; });
    const [ma, mb] = [await mid(A), await mid(B)];
    ok(T('L0 MIDI-Export ohne Filter je Note bitgleich zur Basis (Szene, Spur)'), ma[0] === mb[0] && ma[1] === mb[1] && ma[0].length > 50, {len: ma[0].length});
    await A.ctx.close(); await B.ctx.close();
  }
  const {ctx, p, cdp, errs} = await page(file, W, H);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, i) => ({x: q[0], y: q[1], id: i, radiusX: 2, radiusY: 2, force: 1}))});
  const tap = async q => { if (!q) throw new Error('Knopf fehlt'); await touch('touchStart', [q]); await sleep(60); await touch('touchEnd', []); await sleep(260); };
  const drag = async (a, z, steps = 6) => { await touch('touchStart', [a]); await sleep(40); for (let k = 1; k <= steps; k++) { await touch('touchMove', [[a[0] + (z[0] - a[0]) * k / steps, a[1] + (z[1] - a[1]) * k / steps]]); await sleep(30); } await touch('touchEnd', []); await sleep(260); };
  const at = (fn, arg) => p.evaluate(([src, a]) => { const e = (0, eval)(src)(a); if (!e || !e.getClientRects().length) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, Math.round(r.width), Math.round(r.height)]; }, [fn.toString(), arg]);
  const btn = sel => at(s => UI.pop && UI.pop.el.querySelector(s), sel);
  const shot = n => p.screenshot({path: path.join(fotos, n + '-' + tag + '.png')});
  const L1 = () => p.evaluate(() => SYNQUENZER.lage1.info());
  await p.evaluate(setupSrc); await sleep(400);

  // ---------- L1 Knopf [Lage ▾] in der Aktionsleiste, Blatt per Touch ----------
  const kb = await at(() => ED.roll.el.acts.querySelector('.lage1rb'));
  const kPos = await p.evaluate(() => { const b = ED.roll.el.acts.querySelector('.lage1rb'), m3 = ED.roll.el.acts.querySelector('.mtx3rb'), prev = b.previousElementSibling, bar = ED.roll.el.acts.getBoundingClientRect();
    const hitH = e => { const r = e.getBoundingClientRect(), x = r.left + r.width / 2; let n = 0; for (let y = Math.floor(r.top) - 12; y <= r.bottom + 12; y++) { const h = document.elementFromPoint(x, y); if (h === e) n++; } return n; };
    m3.scrollIntoView({inline: 'nearest'}); const h3 = hitH(m3); b.scrollIntoView({inline: 'nearest'}); const r = b.getBoundingClientRect();
    return {prev: prev && prev.textContent, txt: b.textContent, w: Math.round(r.width), hit: hitH(b), hitAuslagern: h3, bar: Math.round(bar.height)}; });
  ok(T('L1 [Lage ▾] gleich hinter [Auslagern ▾], Trefferfläche so hoch wie die Leiste (wie Auslagern), ≥ 44 px breit'), kPos.prev === 'Auslagern ▾' && kPos.txt === 'Lage ▾' && kPos.w >= 44 && kPos.hit >= kPos.bar - 1 && kPos.hit >= kPos.hitAuslagern, kPos);
  await tap(await at(() => ED.roll.el.acts.querySelector('.lage1rb'))); await sleep(300);   // Prüfung: Lage nach dem Scrollen der Leiste neu messen
  const P1 = await p.evaluate(() => { const P = UI.pop && UI.pop.el; if (!P) return null; const r = P.getBoundingClientRect(), bs = [...P.querySelectorAll('button')].filter(x => x.getClientRects().length);
    const small = bs.filter(x => { const q = x.getBoundingClientRect(); return q.width < 44 - .5 || q.height < 44 - .5; }).map(x => x.textContent.trim());
    const cut = bs.filter(x => x.scrollWidth > x.clientWidth + 1).map(x => x.textContent.trim());
    return {name: UI.pop.name, r: [r.left, r.top, r.right, r.bottom].map(Math.round), vw: innerWidth, vh: innerHeight, dock: P.classList.contains('dock'), inView: r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1, bottom: Math.round(innerHeight - r.bottom), h: Math.round(r.height), small, cut, pass: EL.popLayer.classList.contains('pass'), hscroll: document.documentElement.scrollWidth > innerWidth + 1}; });
  ok(T('L1 Blatt LAGE unten angedockt, im Bild, Rolle dahinter bedienbar'), P1 && P1.name === 'lage1' && P1.dock && P1.inView && P1.pass && !P1.hscroll, P1);
  ok(T('L1 alle Knöpfe ≥ 44×44 px, kein Text abgeschnitten'), P1 && !P1.small.length && !P1.cut.length, {small: P1 && P1.small, cut: P1 && P1.cut});
  // ---------- L2 Trennton: Vorschlag oberes Drittel, [−] [+], Ziehen in der Vorschau, Taste in der Rolle ----------
  let I = await L1();
  const sug = 36 + Math.ceil((84 - 36 + 1) * 2 / 3);
  ok(T('L2 Vorschlag = oberes Drittel des Tonumfangs (A4 = 69), 5 Noten betroffen'), I.B === sug && I.tab === 'teilen', {B: I.B, soll: sug});
  await tap(await btn('[data-a="bup"]')); I = await L1(); const up = I.B;
  await tap(await btn('[data-a="bdn"]')); await tap(await btn('[data-a="bdn"]')); I = await L1();
  ok(T('L2 [+] / [−] verschieben den Trennton um einen Halbton'), up === sug + 1 && I.B === sug - 1, {up, down: I.B});
  const b0 = I.B, cvA = await p.evaluate(() => SYNQUENZER.lage1.cvPt(SYNQUENZER.lage1.info().B));
  await drag([cvA.x, cvA.y], [cvA.x, cvA.y - 60], 10); I = await L1();
  ok(T('L2 Vorschau = Regler: Ziehen nach oben 60 px = 10 Halbtöne höher'), I.B === b0 + 10, {von: b0, B: I.B});
  const b1 = I.B, cvB = await p.evaluate(() => SYNQUENZER.lage1.cvPt(SYNQUENZER.lage1.info().B));
  await drag([cvB.x, cvB.y], [cvB.x, cvB.y + 24], 6); I = await L1();
  ok(T('L2 Linie greifen und 24 px nach unten ziehen = 4 Halbtöne tiefer'), I.B === b1 - 4, {von: b1, B: I.B});
  // Taste links: eine Taste, die über dem Blatt sichtbar ist (quer liegt das Blatt über dem Großteil der Rolle)
  await p.evaluate(() => ED.roll.centerOn(66)); await sleep(200);
  const kp = await p.evaluate(() => { for (let n = 84; n >= 36; n--) { const k = ED.roll._key(n); if (document.elementFromPoint(k.x, k.y) === ED.roll.el.keys && SYNQUENZER.lage1.keyAt(k.y) === n && n !== SYNQUENZER.lage1.info().B) return {n, x: k.x, y: k.y}; } return null; });
  if (kp) { await tap([kp.x, kp.y]); I = await L1(); }
  ok(T('L2 Tipp auf eine sichtbare Taste links in der Rolle setzt den Trennton'), kp && I.B === kp.n, {kp, B: I.B});
  await p.evaluate(() => { SYNQUENZER.lage1.setB(60); ED.roll.centerOn(60); }); await sleep(200);
  const pix = () => p.evaluate(() => { const c = S.tracks[0].clips[0], n = c.notes.find(x => x.n === 64); const xy = ED.roll._xy(n.t + n.d / 2, n.n), r = ED.roll.el.main.getBoundingClientRect(); const g = ED.roll.el.main.getContext('2d'), d = ED.roll.el.main.width / r.width; return Array.from(g.getImageData(Math.round((xy.x - r.left) * d), Math.round((xy.y - r.top + 6) * d), 1, 1).data); });
  const tint = await pix(); await p.evaluate(() => SYNQUENZER.lage1.setB(80)); await sleep(150); const plain = await pix(); await p.evaluate(() => SYNQUENZER.lage1.setB(60)); await sleep(150);
  ok(T('L2 betroffene Noten in der Rolle gelb getönt (Vorschau farbig), andere nicht'), tint[0] - plain[0] > 40 && plain[2] - tint[2] > 40, {tint, plain});
  await shot('l2-blatt-teilen');
  // ---------- L3 Lage teilen (Touch): obere Noten → neue Spur, Klang heller; ein ↶, ↷ ----------
  await p.evaluate(() => SYNQUENZER.lage1.setB(69));
  await tap(await btn('[data-snd="hell"]'));
  const pre = await p.evaluate(() => ({n: NT(), src: JSON.stringify(cleanClip(S.tracks[0].clips[0])), cut: S.tracks[0].sound.p.cutoff, u: UNDO.length, order: trackOrder().slice()}));
  await tap(await btn('[data-a="split"]')); await sleep(300);
  const S3 = await p.evaluate(pre => { const j = NT() - 1, tr = S.tracks[j], c = tr && tr.clips[0], q = S.tracks[0].clips[0], o = trackOrder();
    return {n: NT(), j, name: tr && tr.name, cut: tr && tr.sound.p.cutoff, eng: tr && tr.sound.engine, notes: c ? c.notes.map(x => [x.t, x.d, x.n, x.v].join('/')) : null, len: c && c.len, key: c && JSON.stringify(c.key) === JSON.stringify(q.key), src: q.notes.length, srcMax: Math.max(...q.notes.map(x => x.n)), under: o.indexOf(j) === o.indexOf(0) + 1, u: UNDO.length - pre.u, label: UNDO[UNDO.length - 1].label, last: SYNQUENZER.lage1.info().last}; }, pre);
  const want = SEQ.map((n, k) => ({t: k * .5, n, v: .5 + (k % 4) * .12})).filter(x => x.n >= 69).map(x => [x.t, .45, x.n, x.v].join('/'));
  ok(T('L3 Teilen: 5 obere Noten auf neue Spur „Synth 1 · oben“ direkt darunter, gleiches Timing, Länge, Tonart'), S3.n === pre.n + 1 && S3.name === 'Synth 1 · oben' && S3.under && JSON.stringify(S3.notes) === JSON.stringify(want) && S3.len === 2 && S3.key, S3);
  ok(T('L3 Quelle behält nur die unteren 11 Noten (höchste < A4)'), S3.src === 11 && S3.srcMax < 69, {src: S3.src, max: S3.srcMax});
  ok(T('L3 Klang „Heller“: gleiche Engine, Cutoff × 2 (eine Oktave)'), S3.eng === 'analog' && Math.abs(S3.cut - pre.cut * 2) < 1e-6, {cut: S3.cut, quelle: pre.cut});
  ok(T('L3 ein einziger Undo-Eintrag „Lage teilen → Synth 1 · oben“'), S3.u === 1 && S3.label === 'Lage teilen → Synth 1 · oben', {u: S3.u, label: S3.label});
  await shot('l3-nach-teilen');
  const U3 = await p.evaluate(pre => { const after = JSON.stringify([NT(), cleanClip(S.tracks[0].clips[0]), S.tracks[NT() - 1].sound.p.cutoff, S.tracks[NT() - 1].name]);
    undo(); const back = NT() === pre.n && JSON.stringify(cleanClip(S.tracks[0].clips[0])) === pre.src && JSON.stringify(trackOrder()) === JSON.stringify(pre.order);
    redo(); const again = JSON.stringify([NT(), cleanClip(S.tracks[0].clips[0]), S.tracks[NT() - 1].sound.p.cutoff, S.tracks[NT() - 1].name]) === after; return {back, again}; }, pre);
  ok(T('L3 ↶ nimmt Spur + Noten zurück (JSON gleich), ↷ holt alles mit Klang und Namen wieder'), U3.back && U3.again, U3);
  // Gegenrichtung: untere Noten in eine vorhandene Spur (Klang bleibt), Ziel per Tipp
  await p.evaluate(() => { undo(); SYNQUENZER.lage1.setB(48); });
  await tap(await btn('[data-part="unten"]'));
  let tg = await p.evaluate(() => UI.pop.el.querySelector('[data-a="tgt"]').textContent);
  for (let k = 0; k < 6 && !/Synth 3/.test(tg); k++) { await tap(await btn('[data-a="tgt"]')); tg = await p.evaluate(() => UI.pop.el.querySelector('[data-a="tgt"]').textContent); }
  const snd3 = await p.evaluate(() => JSON.stringify(S.tracks[2].sound));
  await tap(await btn('[data-a="split"]'));
  const S3b = await p.evaluate(snd3 => { const c = S.tracks[2].clips[0], q = S.tracks[0].clips[0]; return {tg: c ? c.notes.map(x => x.n) : null, src: q.notes.map(x => x.n), snd: JSON.stringify(S.tracks[2].sound) === snd3, nt: NT()}; }, snd3);
  ok(T('L3 umgekehrt: untere Noten (unter C3) → vorhandene Spur Synth 3, deren Klang bleibt'), /Synth 3/.test(tg) && JSON.stringify(S3b.tg) === JSON.stringify([36, 43]) && !S3b.src.some(n => n < 48) && S3b.snd, {tg, S3b});
  await p.evaluate(() => { undo(); SYNQUENZER.lage1.set('part', 'oben'); });
  // Prüfung: Ziel Synth 3 hat in Szene 1 nur 1 Takt – die oberen Noten in Takt 2 bleiben in der Quelle, Blatt und Meldung sagen es
  await p.evaluate(() => { const c = S.tracks[0].clips[0]; c.notes = [0, 1, 2, 3, 4, 5, 6, 7].map(k => ({t: k, d: .5, n: k % 2 ? 72 : 48, v: .8})); clipChanged(0, 0);
    S.tracks[2].clips[0] = normClip({len: 1, key: {root: 0, scale: 'ionian', src: 'auto'}, notes: [{t: 0, d: 1, n: 40, v: .8}]}, 'synth', S.key); clipChanged(2, 0); ED.roll.select([]); ED.roll.refresh(); SYNQUENZER.lage1.setB(60);
    window.__lt = []; if (!window.__ltW) { window.__ltW = true; const o = window.toast; window.toast = (m, a) => { window.__lt.push(String(m)); return o(m, a); }; } });
  await sleep(200);
  tg = await p.evaluate(() => UI.pop.el.querySelector('[data-a="tgt"]').textContent);
  for (let k = 0; k < 6 && !/Synth 3/.test(tg); k++) { await tap(await btn('[data-a="tgt"]')); tg = await p.evaluate(() => UI.pop.el.querySelector('[data-a="tgt"]').textContent); }
  const pre3c = await p.evaluate(() => ({src: JSON.stringify(cleanClip(S.tracks[0].clips[0])), tgt: JSON.stringify(cleanClip(S.tracks[2].clips[0])), cnt: UI.pop.el.querySelector('.lage1-cnt').textContent, plan: SYNQUENZER.lage1.plan(), go: (g => ({tx: g.textContent, cut: g.scrollWidth > g.clientWidth + 1, w: Math.round(g.getBoundingClientRect().width), h: Math.round(g.getBoundingClientRect().height)}))(UI.pop.el.querySelector('[data-a="split"]'))}));
  await tap(await btn('[data-a="split"]')); await sleep(250);
  const S3c = await p.evaluate(() => ({src: S.tracks[0].clips[0].notes.map(n => n.n + '@' + n.t), tgt: S.tracks[2].clips[0].notes.map(n => n.n + '@' + n.t), toast: window.__lt.slice(-1)[0] || '', last: SYNQUENZER.lage1.info().last}));
  ok(T('L3 Prüfung: Ziel-Clip kürzer (1 Takt) – Blatt sagt vorher „2 Noten wandern · 2 liegen hinter dem Ende von Synth 3 … bleiben hier“, Knopf „Teilen → Synth 3“ ganz lesbar'), /Synth 3/.test(tg) && /^2 Noten wandern/.test(pre3c.cnt) && /2 liegen hinter dem Ende von Synth 3 \(1 Takt\) und bleiben hier/.test(pre3c.cnt) && pre3c.plan && pre3c.plan.go === 2 && pre3c.plan.stay === 2 && pre3c.go.tx === 'Teilen → Synth 3' && !pre3c.go.cut && pre3c.go.w >= 44 && pre3c.go.h >= 44, {tg, cnt: pre3c.cnt, go: pre3c.go});
  ok(T('L3 Prüfung: nur 72@1 und 72@3 wandern, 72@5 und 72@7 bleiben in der Quelle (keine Note geht verloren), Meldung zählt richtig'), JSON.stringify(S3c.tgt) === JSON.stringify(['40@0', '72@1', '72@3']) && JSON.stringify(S3c.src) === JSON.stringify(['48@0', '48@2', '48@4', '72@5', '48@6', '72@7']) && /^2 Noten → SYNTH 3/.test(S3c.toast) && /2 Noten bleiben hier/.test(S3c.toast) && S3c.last.n === 2 && S3c.last.stay === 2, S3c);
  const U3c = await p.evaluate(pre => { undo(); return JSON.stringify(cleanClip(S.tracks[0].clips[0])) === pre.src && JSON.stringify(cleanClip(S.tracks[2].clips[0])) === pre.tgt; }, pre3c);
  ok(T('L3 Prüfung: ein ↶ stellt Quelle und Ziel wieder her'), U3c);
  await p.evaluate(() => { S.tracks[2].clips[0] = null; clipChanged(2, 0); SYNQUENZER.lage1.tgt(0); });
  // ---------- L4 Oktave falten: Doppelnoten lösen (Kontur, Zusammenziehen, Weglassen), Vorschau vorher/nachher, ein ↶ ----------
  // C3 → C4 (gefaltet: C3 = Wiederholung) · Akkord C3+C4 (gefaltet: übereinander) · C4 C4 (Wiederholung war schon da) · G3 → D4 → …
  const FS = [[0, 48], [1, 60], [2, 48], [2, 60], [3, 55], [4, 62], [5, 50], [6, 64], [7, 64]];
  await p.evaluate(fs => { const c = S.tracks[0].clips[0]; c.notes = fs.map(([t, n]) => ({t, d: .9, n, v: .8})); clipChanged(0, 0); ED.roll.select([]); ED.roll.refresh(); SYNQUENZER.lage1.setB(60); }, FS);
  await tap(await btn('[data-tab="falten"]')); await sleep(200);
  const calc = await p.evaluate(() => ({k: SYNQUENZER.lage1.calc(0, 0, 60, 'oben', 'kontur'), z: SYNQUENZER.lage1.calc(0, 0, 60, 'oben', 'ziehen'), w: SYNQUENZER.lage1.calc(0, 0, 60, 'oben', 'weg')}));
  // erwartet (Kontur): C4@1 → C3 wäre Wiederholung nach C3@0 (aufwärts) → D3 (50); Akkord @2 → ein C3; D4@4 → D3 wäre Wiederholung vor D3@5 (abwärts) → E3 (52); E4 E4 @6/7 → E3 E3 (war schon Wiederholung, bleibt)
  const kN = calc.k.notes.map(x => x.t + ':' + x.n).join(' ');
  ok(T('L4 Kontur halten: Wiederholung → nächster Ton der Tonart in alter Richtung, Akkord-Doppel → ein Ton, alte Wiederholung bleibt'), kN === '0:48 1:50 2:48 3:55 4:52 5:50 6:52 7:52' && calc.k.moved === 5 && calc.k.fixed === 3, {kN, k: [calc.k.moved, calc.k.fixed, calc.k.rep, calc.k.mer]});
  const zN = calc.z.notes.map(x => x.t + ':' + x.n + ':' + x.d).join(' ');
  // Prüfung: C3 · C4→C3 · C3 werden ein Ton (vorher blieb C3 C3 als neue Wiederholung stehen)
  ok(T('L4 Zusammenziehen: gleiche Folgetöne werden ein längerer Ton (auch der Ton danach: C3 C4 C3 → ein C3)'), zN === '0:48:2.9 3:55:0.9 4:50:1.9 6:52:0.9 7:52:0.9' && calc.z.mer === 3, {zN, mer: calc.z.mer});
  const wN = calc.w.notes.map(x => x.t + ':' + x.n).join(' ');
  ok(T('L4 Weglassen: die gefalteten Doppelnoten fallen weg'), wN === '0:48 2:48 3:55 5:50 6:52 7:52' && calc.w.drp === 3, {wN, drp: calc.w.drp});
  const cnt = await p.evaluate(() => UI.pop.el.querySelector('.lage1-cnt').textContent);
  ok(T('L4 Blatt zeigt „5 Noten eine Oktave runter · 3 Doppelnoten gelöst“'), /5 Noten eine Oktave runter · 3 Doppelnoten gelöst/.test(cnt), cnt);
  await shot('l4-blatt-falten');
  // Vorschau vorher / nachher (hörbar = Stimmen auf der Spur), Stopp
  await tap(await btn('[data-a="pv0"]')); await sleep(350);
  const V0 = await p.evaluate(() => ({pv: SYNQUENZER.lage1.info().pv, n: VOICES.filter(v => !v.dead && v.track === 0 && v.src === 'audition').length, outs: VOICES.filter(v => !v.dead && v.track === 0).map(v => v.out)}));
  await tap(await btn('[data-a="pv1"]')); await sleep(2600);
  const V1 = await p.evaluate(() => ({pv: SYNQUENZER.lage1.info().pv, outs: [...new Set(PERF.list.filter(e => e.track === 0).slice(-9).map(e => e.out))].sort((a, b) => a - b)}));
  ok(T('L4 ▶ Vorher / ▶ Nachher spielen auf der Spur (Nachher ohne C4/D4/E4)'), V0.pv === 'pv0' && V0.n > 0 && !V1.outs.some(n => n >= 60), {V0, V1});
  if (await p.evaluate(() => SYNQUENZER.lage1.info().pv)) await tap(await btn('[data-a="pv1"]')); await sleep(1500);
  const V2 = await p.evaluate(() => ({pv: SYNQUENZER.lage1.info().pv, live: VOICES.filter(v => !v.dead && v.src === 'audition').length}));
  ok(T('L4 ■ Stopp beendet das Vorhören, keine Stimme bleibt hängen'), V2.pv === null && V2.live === 0, V2);
  const pre4 = await p.evaluate(() => ({src: JSON.stringify(cleanClip(S.tracks[0].clips[0])), u: UNDO.length}));
  await tap(await btn('[data-a="fold"]'));
  const F4 = await p.evaluate(pre => ({n: S.tracks[0].clips[0].notes.map(x => x.t + ':' + x.n).join(' '), u: UNDO.length - pre.u, label: UNDO[UNDO.length - 1].label}), pre4);
  ok(T('L4 [Falten] per Touch = Kontur-Ergebnis, ein Undo-Eintrag „Oktave falten“'), F4.n === kN && F4.u === 1 && F4.label === 'Oktave falten', F4);
  const U4 = await p.evaluate(pre => { const a = JSON.stringify(cleanClip(S.tracks[0].clips[0])); undo(); const back = JSON.stringify(cleanClip(S.tracks[0].clips[0])) === pre.src; redo(); return {back, again: JSON.stringify(cleanClip(S.tracks[0].clips[0])) === a}; }, pre4);
  ok(T('L4 ↶ / ↷ Falten'), U4.back && U4.again, U4);
  await p.evaluate(() => undo());
  // Untere hoch (+12) mit Weglassen per Touch
  await tap(await btn('[data-part="unten"]')); await tap(await btn('[data-mode="weg"]'));
  const cU = await p.evaluate(() => SYNQUENZER.lage1.calc(0, 0, 60, 'unten', 'weg'));
  ok(T('L4 Untere ↑ +12: tiefe Noten eine Oktave hoch, Doppelnoten weg'), cU.moved === 4 && cU.notes.every(x => x.n >= 60), {moved: cU.moved, n: cU.notes.map(x => x.n)});
  await tap(await btn('[data-part="oben"]')); await tap(await btn('[data-mode="kontur"]'));
  // Prüfung: Kontur baut keine neue Tonwiederholung und bleibt auf der gefalteten Seite des Trenntons (Fälle + 300 Zufallsläufe)
  const K4 = await p.evaluate(() => {
    const c = S.tracks[0].clips[0], keep = c.notes, L1 = SYNQUENZER.lage1, put = ns => { c.notes = ns.map(([t, n, d]) => ({t, d: d || .45, n, v: .8})); };
    const r = {};
    put([[0, 55], [.5, 65], [1, 53]]); r.gff = L1.calc(0, 0, 60, 'oben', 'kontur').notes.map(x => x.n);          // G3 F4 F3
    put([[0, 47], [.5, 59]]); r.bb = L1.calc(0, 0, 48, 'oben', 'kontur').notes.map(x => x.n);                    // B2 B3, Trennton C3
    put([[0, 60], [.5, 48], [1, 62]]); r.up = L1.calc(0, 0, 60, 'unten', 'kontur').notes.map(x => x.n);          // C4 C3 D4, Untere ↑
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, sc = [0, 2, 4, 5, 7, 9, 11];
    const st = {kontur: {neu: 0, seite: 0}, weg: {neu: 0}, ziehen: {mehr: 0}}, reps = L => { let k = 0; for (let i = 1; i < L.length; i++) if (L[i].n === L[i - 1].n && L[i].t - (L[i - 1].t + L[i - 1].d) <= 1 + 1e-6) k++; return k; };
    for (let run = 0; run < 300; run++) {
      const ns = []; for (let k = 0; k < 16; k++) ns.push([k * .5, 12 * (3 + Math.floor(rnd() * 3)) + sc[Math.floor(rnd() * 7)]]); put(ns);
      const orig = ns.map(([t, n]) => ({t, n, d: .45}));
      for (const m of ['kontur', 'weg', 'ziehen']) {
        const R = L1.calc(0, 0, 60, 'oben', m), L = R.notes.slice().sort((a, b) => a.t - b.t);
        if (m === 'ziehen') { if (reps(L) > reps(orig)) st.ziehen.mehr++; continue; }
        for (let i = 1; i < L.length; i++) { const a = L[i - 1], z = L[i]; if (a.n === z.n && z.t - (a.t + a.d) <= 1 + 1e-6 && a.n0 !== z.n0) st[m].neu++; }
        if (m === 'kontur') for (const x of L) if (x.fix === 'kontur' && x.n >= 60) st.kontur.seite++;
      }
    }
    r.st = st; c.notes = keep; return r;
  });
  ok(T('L4 Prüfung: Kontur G3 F4 F3 → G3 A3 F3 (keine neue Wiederholung G3 G3), B2 B3 (Trennton C3) → B2 A2 (bleibt unter C3), Untere ↑ C4 C3 D4 → C4 E4 D4'), JSON.stringify(K4.gff) === '[55,57,53]' && JSON.stringify(K4.bb) === '[47,45]' && JSON.stringify(K4.up) === '[60,64,62]', K4);
  ok(T('L4 Prüfung: 300 Zufallsläufe – Kontur und Weglassen 0 neue Wiederholungen, Kontur 0× zurück über den Trennton, Zusammenziehen nie mehr Wiederholungen als vorher'), K4.st.kontur.neu === 0 && K4.st.kontur.seite === 0 && K4.st.weg.neu === 0 && K4.st.ziehen.mehr === 0, K4.st);
  // ---------- L5 Filter je Note: Zeile FILT, Ziehen/Wischen per Touch, ↶ ↷, Schild wechselt, ⇕ zeigt VEL ----------
  await p.evaluate(() => { const c = S.tracks[0].clips[0]; c.notes = []; const seq = [36, 43, 48, 52, 55, 60, 64, 67, 72, 76, 79, 84, 72, 67, 60, 55]; for (let k = 0; k < 16; k++) c.notes.push({t: k * .5, d: .45, n: seq[k], v: .8}); clipChanged(0, 0); ED.roll.select([]); ED.roll.refresh(); SYNQUENZER.lage1.setB(69); });
  await tap(await btn('[data-tab="filter"]')); await sleep(150);
  await shot('l5-blatt-filter');
  await tap(await btn('[data-a="lane"]')); await sleep(300);
  const L5a = await p.evaluate(() => { const lab = ED.roll.el.vel.parentNode.previousElementSibling, cv = ED.roll.el.vel.parentNode.querySelector('canvas.lage1-fl'), r = cv && cv.getBoundingClientRect();
    const hit = r ? [.25, .5, .75].map(f => document.elementFromPoint(r.left + r.width * f, r.top + r.height / 2) === cv) : []; return {lab: lab.textContent, on: !!(cv && !cv.hidden), flt: SYNQUENZER.lage1.info().flt, open: !!UI.pop, hit, lane: r && [Math.round(r.top), Math.round(r.bottom)]}; });
  ok(T('L5 Schalter „Filter-Zeile“: Zeile heißt FILT, das Blatt geht zu, die Zeile ist per Touch frei (Prüfung)'), L5a.lab === 'FILT' && L5a.on && L5a.flt && !L5a.open && L5a.hit.length === 3 && L5a.hit.every(Boolean), L5a);
  await tap(await at(() => ED.roll.el.acts.querySelector('.lage1rb'))); await sleep(250);
  const L5o = await p.evaluate(() => ({tab: SYNQUENZER.lage1.info().tab, lane: UI.pop && UI.pop.el.querySelector('[data-a="lane"]').textContent, tx: !!UI.pop && UI.pop.el.textContent.includes('unter diesem Blatt')}));
  ok(T('L5 [Lage ▾] holt das Blatt zurück (Reiter Filter, „✓ Filter-Zeile“, Hinweis „liegt unter diesem Blatt“)'), L5o.tab === 'filter' && /^✓/.test(L5o.lane || '') && L5o.tx, L5o);
  await tap(await btn('[data-a="x"]')); await sleep(250);
  ok(T('L5 ✕ schließt das Blatt'), !(await p.evaluate(() => !!UI.pop)));
  const u5 = await p.evaluate(() => UNDO.length);
  const a5 = await p.evaluate(() => SYNQUENZER.lage1.lanePt(0, 40)), z5 = await p.evaluate(() => SYNQUENZER.lage1.lanePt(1.5, 40));
  const lv = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && e.className; }, [a5.x, a5.y]);
  await drag([a5.x, a5.y], [z5.x, z5.y], 8);
  const L5b = await p.evaluate(u => { const c = S.tracks[0].clips[0]; return {fc: c.notes.slice(0, 5).map(n => n.fc || 0), u: UNDO.length - u, label: UNDO[UNDO.length - 1].label}; }, u5);
  ok(T('L5 Wischen in der FILT-Zeile malt den Wert auf die Noten (Schlag 0 … 1,5 ≈ +40), ein ↶ „Filter je Note“'), lv === 'lage1-fl' && L5b.fc.slice(0, 4).every(v => Math.abs(v - 40) <= 3) && !L5b.fc[4] && L5b.u === 1 && L5b.label === 'Filter je Note', {lv, L5b});
  const d5 = await p.evaluate(() => SYNQUENZER.lage1.lanePt(2, -48));
  await tap([d5.x, d5.y]);
  const L5c = await p.evaluate(() => S.tracks[0].clips[0].notes[4].fc || 0);
  ok(T('L5 Tipp unten = dunkler (Note 5 ≈ −48)'), Math.abs(L5c + 48) <= 3, L5c);
  await shot('l5-filt-zeile');
  const U5 = await p.evaluate(() => { const C = () => S.tracks[0].clips[0], a = JSON.stringify(cleanClip(C())); undo(); const one = !C().notes[4].fc && !!C().notes[0].fc; undo(); const none = C().notes.every(n => !n.fc); redo(); redo(); return {one, none, again: JSON.stringify(cleanClip(C())) === a}; });
  ok(T('L5 ↶ ↶ nimmt beide Gesten zurück, ↷ ↷ holt sie wieder'), U5.one && U5.none && U5.again, U5);
  const labP = await p.evaluate(() => { const lab = ED.roll.el.vel.parentNode.previousElementSibling, r = lab.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, Math.round(r.width), Math.round(r.height)]; });
  await tap(labP); const lab1 = await p.evaluate(() => ED.roll.el.vel.parentNode.previousElementSibling.textContent + ':' + SYNQUENZER.lage1.info().lane);
  await tap(labP); const lab2 = await p.evaluate(() => ED.roll.el.vel.parentNode.previousElementSibling.textContent + ':' + SYNQUENZER.lage1.info().lane);
  ok(T('L5 Tipp auf das Schild: FILT → VEL → FILT'), lab1 === 'VEL:false' && lab2 === 'FILT:true', {lab1, lab2, size: labP.slice(2)});
  await tap(await at(() => [...ED.roll.el.bar.children].find(x => x.title === 'Anschlag'))); await sleep(300);
  const velT = await p.evaluate(() => ED.roll.el.vel.parentNode.previousElementSibling.textContent + ':' + SYNQUENZER.lage1.info().lane);
  await tap(await at(() => [...ED.roll.el.bar.children].find(x => x.title === 'Zeichnen'))); await sleep(300);
  const drwT = await p.evaluate(() => ED.roll.el.vel.parentNode.previousElementSibling.textContent + ':' + SYNQUENZER.lage1.info().lane);
  ok(T('L5 Werkzeug ⇕ (Anschlag) zeigt VEL, zurück auf ✎ wieder FILT'), velT === 'VEL:false' && drwT === 'FILT:true', {velT, drwT});
  // [Oben heller] (Key-Tracking nur oben) und [Alle auf 0]
  await p.evaluate(() => { const c = S.tracks[0].clips[0]; c.notes.forEach(n => delete n.fc); clipChanged(0, 0); });
  await tap(await at(() => ED.roll.el.acts.querySelector('.lage1rb'))); await sleep(250);
  await tap(await btn('[data-a="ktup"]'));
  const KT = await p.evaluate(() => S.tracks[0].clips[0].notes.map(n => [n.n, n.fc || 0]));
  ok(T('L5 [Oben heller]: über A4 +4/3 je Halbton (C5 +4, C6 +20), darunter 0'), KT.every(([n, f]) => (n >= 69 ? f === Math.round((n - 69) * 4 / 3) : f === 0)) && KT.some(([n, f]) => n === 84 && f === 20), KT.filter(x => x[1]));
  await tap(await btn('[data-a="fc0"]'));
  ok(T('L5 [Alle auf 0] löscht die Werte (ein ↶ holt sie)'), await p.evaluate(() => { const z = S.tracks[0].clips[0].notes.every(n => !n.fc); undo(); const back = S.tracks[0].clips[0].notes.some(n => n.fc); return z && back; }));
  await tap(await btn('[data-a="x"]'));
  // ---------- L6 Wiedergabe: Cutoff je Stimme (VA, FM, Platte), KF1 Anschlag→Cutoff bleibt, keine hängenden Noten ----------
  const L6 = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms)); ensureAudio(); closeRoll();
    applySound(2, factorySound('f-init-am'));
    for (const i of [0, 1, 2]) for (let k = 0; k < 60 && !(AU.synth[i] && !AU.synth[i].dead); k++) await wait(100);
    await wait(300);
    const kf1 = (S.tracks[0].sound.mods || []).some(m => m.src === 'vel' && m.dst === 'cutoff'), mods0 = JSON.stringify(S.tracks[0].sound.mods), wk0 = JSON.stringify((await SYNQUENZER.lkWkInfo(0) || {}).mods);
    for (const i of [0, 1, 2]) { const c = S.tracks[i].clips[0] || (S.tracks[i].clips[0] = {len: 1, key: {root: 0, scale: 'ionian', src: 'auto'}, notes: []}); c.len = 1; c.notes = [0, 32, -32, -64].map((fc, k) => { const n = {t: k, d: .9, n: 48, v: .8}; if (fc) n.fc = fc; return n; }); clipChanged(i, 0); SYNQUENZER.lkProbe(i, 64); AU.synth[i].lkReps = []; }
    launchScene(0); await wait(2400);
    const live = VOICES.filter(v => !v.dead).length;
    stop(); await wait(1600);
    const wk1 = JSON.stringify((await SYNQUENZER.lkWkInfo(0) || {}).mods);
    const out = {live, after: VOICES.filter(v => !v.dead).length, mods: kf1 && JSON.stringify(S.tracks[0].sound.mods) === mods0 && wk0 === wk1 && wk0.length > 4, base: [S.tracks[0].sound.p.cutoff, S.tracks[1].sound.p.cutoff]};
    for (const i of [0, 1, 2]) { const E = AU.synth[i], m = new Map(); for (const r of E.lkReps || []) { for (const v of r.lkRep || []) m.set(v.id, Math.round(v.cut)); if (r.mk) for (const v of r.mk) m.set('m' + v.id, Math.round(v.cut)); }   /* je Stimme der eingeschwungene (letzte) Wert */ out['c' + i] = [...m.values()].slice(0, 4); out['n' + i] = (E.lkRep && E.lkRep.lkRep ? E.lkRep.lkRep.length : -1); }
    return out;
  });
  ok(T('L6 VA: Cutoff je Stimme 380 → +32 = ×4, −32 = ÷4, −64 = ÷16 (Worklet-Messung je Stimme)'), JSON.stringify(L6.c0) === JSON.stringify([380, 1520, 95, 24]), L6.c0);
  ok(T('L6 FM: Filter offen (20 kHz) – +32 bleibt offen, −32/−64 dunkler'), JSON.stringify(L6.c1) === JSON.stringify([20000, 20000, 5000, 1250]), L6.c1);
  ok(T('L6 ' + 'Platte' + ': Timbre-Cutoff 127 → 102 (−32) → 76 (−64)'), JSON.stringify(L6.c2) === JSON.stringify([127, 127, 102, 76]), L6.c2);
  ok(T('L6 KF1 Anschlag → Cutoff (Mod-Route des Klangs) bleibt: Klang und Mod-Matrix im Worklet vor/nach der Wiedergabe gleich'), L6.mods, L6.mods);
  ok(T('L6 Wiedergabe mit Filter je Note: nach ■ keine hängenden Stimmen (Haupt-Thread + Worklet)'), L6.live > 0 && L6.after === 0 && L6.n0 <= 0 && L6.n1 <= 0, {live: L6.live, after: L6.after, wk: [L6.n0, L6.n1, L6.n2]});
  // ---------- L7 MIDI-Export: CC74 vor jedem Note-an der Spur mit Filter je Note ----------
  const L7 = await p.evaluate(() => {
    const parse = u8 => { const T = []; let i = 14; while (i < u8.length) { const len = (u8[i + 4] << 24) | (u8[i + 5] << 16) | (u8[i + 6] << 8) | u8[i + 7]; let k = i + 8, end = k + len, tk = 0, run = 0; const ev = [];
      const vlq = () => { let v = 0, b; do { b = u8[k++]; v = (v << 7) | (b & 127); } while (b & 128); return v; };
      while (k < end) { tk += vlq(); let st = u8[k]; if (st & 128) { k++; run = st; } else st = run; if (st === 0xFF) { const ty = u8[k++], l = vlq(); k += l; ev.push({tk, meta: ty}); continue; } const hi = st & 0xF0, d1 = u8[k++], d2 = hi === 0xC0 || hi === 0xD0 ? null : u8[k++]; ev.push({tk, st, hi, d1, d2}); }
      T.push(ev); i = end; } return T; };
    const res = {};
    const m = buildMidi({mode: 'scene', scene: 0}), T = parse(m.bytes);
    const t1 = T[1], cc = t1.filter(e => e.hi === 0xB0 && e.d1 === 74), on = t1.filter(e => e.hi === 0x90 && e.d2 > 0);
    res.cc = cc.map(e => e.tk + ':' + e.d2); res.on = on.map(e => e.tk);
    res.before = on.every(o => { const k = t1.indexOf(o), c = t1.findIndex(e => e.hi === 0xB0 && e.d1 === 74 && e.tk === o.tk); return c >= 0 && c < k; });
    res.t2cc = T[2].filter(e => e.hi === 0xB0 && e.d1 === 74).map(e => e.d2);
    res.t4cc = T[4] ? T[4].filter(e => e.hi === 0xB0).length : -1;   // Spur 4 ohne Filter-Werte: keine CC
    const v = va1MidiClip(0, 0, true), V = parse(v.bytes); res.va1 = V[1].filter(e => e.hi === 0xB0 && e.d1 === 74).map(e => e.d2);
    return res;
  });
  ok(T('L7 MIDI (Szene): CC74 = 64 + fc an jedem Notenbeginn (64, 96, 32, 0), jeweils vor dem Note-an'), JSON.stringify(L7.cc) === JSON.stringify(['0:64', '480:96', '960:32', '1440:0']) && L7.before, L7);
  ok(T('L7 MIDI: zweite Spur (FM) ebenso, Spur ohne Filter-Werte ohne CC; Export-Blatt „Spur“ ebenso'), JSON.stringify(L7.t2cc) === JSON.stringify([64, 96, 32, 0]) && L7.t4cc === 0 && JSON.stringify(L7.va1) === JSON.stringify([64, 96, 32, 0]), {t2: L7.t2cc, t4: L7.t4cc, va1: L7.va1});
  // Prüfung: Filter je Note richtet sich nach dem Klangzustand ◆ des Clips (Cutoff 380 → Zustand 95 Hz: 95 / +32 = 380 / −32 = 24 / 95)
  const L6s = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms)), c0 = S.tracks[0].clips[0], keep = JSON.stringify(cleanClip(c0)), base = S.tracks[0].sound.p.cutoff, st = Math.round(base / 4);
    const c = S.tracks[0].clips[0] = normClip({len: 1, key: {root: 0, scale: 'ionian', src: 'auto'}, notes: [0, 32, -32, 0].map((fc, k) => { const n = {t: k, d: .9, n: 48, v: .8}; if (fc) n.fc = fc; return n; })}, 'synth', S.key);
    c.st = {eng: S.tracks[0].sound.engine, p: {cutoff: st}}; clipChanged(0, 0); SYNQUENZER.lkProbe(0, 64); AU.synth[0].lkReps = [];
    launchScene(0); await wait(2400); stop(); await wait(1400);
    const E = AU.synth[0], m = new Map(); for (const r of E.lkReps || []) for (const v of r.lkRep || []) m.set(v.id, Math.round(v.cut));
    S.tracks[0].clips[0] = normClip(JSON.parse(keep), 'synth', S.key); clipChanged(0, 0);
    return {base, st, c: [...m.values()].slice(0, 4), live: VOICES.filter(v => !v.dead).length};
  });
  ok(T('L6 Prüfung: Filter je Note mit Klangzustand ◆ des Clips – Basis ist der Zustand (95 → 95 / 380 / 24 / 95 Hz)'), L6s.c.length === 4 && [L6s.st, L6s.st * 4, L6s.st / 4, L6s.st].every((v, k) => Math.abs(L6s.c[k] - v) <= 1) && L6s.live === 0, L6s);
  // Prüfung: FM mit ganz offenem Filter (20 kHz): „Heller“ sagt vorher und nachher ehrlich, dass sich nichts ändert
  const E2 = await p.evaluate(async () => { const w = ms => new Promise(r => setTimeout(r, ms));
    const i = S.tracks.findIndex((t, k) => t.kind === 'synth' && t.sound && t.sound.engine === 'fm6'); if (i < 0) return {fm: 'keine FM-Spur'};
    S.tracks[i].clips[0] = normClip({len: 1, key: {root: 0, scale: 'ionian', src: 'auto'}, notes: [{t: 0, d: .5, n: 48, v: .8}, {t: 1, d: .5, n: 76, v: .8}]}, 'synth', S.key); clipChanged(i, 0);
    closeRoll(); await w(100); selectTrack(i); openRoll(i, 0); await w(300); window.__lt = [];
    SYNQUENZER.lage1.open('teilen'); SYNQUENZER.lage1.setB(60); SYNQUENZER.lage1.set('snd', 'hell'); SYNQUENZER.lage1.tgt(0); await w(100);
    const hint = UI.pop.el.textContent.includes('Der Filter ist schon ganz offen'), cut0 = S.tracks[i].sound.p.cutoff, nt = NT(), j = SYNQUENZER.lage1.split({to: 'new'});
    const out = {i, cut0, cutNeu: S.tracks[j].sound.p.cutoff, toast: window.__lt.slice(-1)[0] || '', hint, neu: NT() === nt + 1}; undo(); SYNQUENZER.lage1.close(); closeRoll(); return out; });
  ok(T('L3 Prüfung: FM-Filter ganz offen – Blatt sagt „„Heller“ ändert hier nichts“, Meldung „gleicher Klang – Filter schon ganz offen“ statt „heller“'), E2.cut0 === 20000 && E2.cutNeu === 20000 && E2.hint && E2.neu && /gleicher Klang – Filter schon ganz offen/.test(E2.toast) && !/Klang heller/.test(E2.toast), E2);
  // Prüfung (vorher ungeprüft): WT spielt nativ – die Stimme bekommt den Filter je Note (2000 Hz, −16 → 1000 Hz); Platte mit ◆ (Timbre-Cutoff 60, +16 → 73)
  const L6w = await p.evaluate(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); ensureAudio(); const keep = deep(S.tracks[2].sound), out = {};
    { const sd = deep(factorySound('f-init-tabelle')); sd.p.cutoff = 2000; sd.p.kt = 0; sd.p.fenv = 0; applySound(2, sd); } await w(300); out.eng = S.tracks[2].sound.engine; out.nativ = !AU.synth[2];
    const c = S.tracks[2].clips[0] = normClip({len: 1, key: {root: 0, scale: 'ionian', src: 'auto'}, notes: [{t: 0, d: 1, n: 60, v: .8}, {t: 1, d: 1, n: 60, v: .8, fc: -16}]}, 'synth', S.key); clipChanged(2, 0);
    const v0 = lage1Hear(2, 0, c.notes[0]), v1 = lage1Hear(2, 0, c.notes[1]); await w(120);
    out.f = [v0, v1].map(v => v && v.fA ? Math.round(v.fA.frequency.value) : null); for (const v of [v0, v1]) if (v) v.release(AU.ctx.currentTime + .05);
    applySound(2, factorySound('f-init-am')); await w(300); const wi = LKT['mk.t.0.f.cut'].wi, pick = x => { if (!x || !x.lk) return null; for (let j = 0; j < x.lk.length; j += 2) if (x.lk[j] === wi) return x.lk[j + 1]; return null; };
    c.notes[1].fc = 16; c.st = {eng: 'mk', p: {'mk.t.0.f.cut': 60}}; out.mk = pick(SYNQUENZER.lage1.lk(2, 0, 1)); delete c.st;
    S.tracks[2].clips[0] = null; clipChanged(2, 0); applySound(2, keep); await w(1200); out.live = VOICES.filter(v => !v.dead).length; return out; });
  ok(T('L6 Prüfung: WT (nativ) Filter je Note an der Stimme 2000 → 1000 Hz (−16); Platte mit Klangzustand ◆ Timbre-Cutoff 60 → 73 (+16)'), L6w.eng === 'wt' && L6w.nativ && JSON.stringify(L6w.f) === '[2000,1000]' && L6w.mk === 73 && L6w.live === 0, L6w);
  // ---------- L8 Speichern / Laden: fc, geteilte Spur, Zeilen-Einstellung bleiben ----------
  const sv = await p.evaluate(() => { SYNQUENZER.lage1.lane(true); return {ok: saveNow(), c0: JSON.stringify(cleanClip(S.tracks[0].clips[0])), nt: NT()}; });
  await p.reload(); await p.waitForFunction(() => typeof BOOT !== 'undefined' && BOOT.done && window.SYNQUENZER, null, {timeout: 90000}); await sleep(700);
  const ld = await p.evaluate(() => ({c0: S.tracks[0].clips[0] ? JSON.stringify(cleanClip(S.tracks[0].clips[0])) : null, nt: NT(), flt: SYNQUENZER.lage1.info().flt}));
  ok(T('L8 Speichern, Neuladen: Filter je Note (fc) und Zeilen-Einstellung bleiben'), sv.ok !== false && ld.c0 === sv.c0 && /"fc":32/.test(ld.c0) && ld.flt, {gleich: ld.c0 === sv.c0, flt: ld.flt});
  // Normalisierung: ungültige Werte (Text, außerhalb, 0) beim Laden
  const nm = await p.evaluate(() => { const c = normClip({len: 1, notes: [{t: 0, d: 1, n: 60, v: .8, fc: 99.4}, {t: 1, d: 1, n: 60, v: .8, fc: 'x'}, {t: 2, d: 1, n: 60, v: .8, fc: 0}, {t: 3, d: 1, n: 60, v: .8, fc: -12.6}]}, 'synth', S.key); return c.notes.map(n => n.fc === undefined ? 'weg' : n.fc); });
  ok(T('L8 Laden normt fc (63, weg, weg, −13)'), JSON.stringify(nm) === JSON.stringify([63, 'weg', 'weg', -13]), nm);
  // geteilte Spur übersteht Speichern/Laden
  const sp8 = await p.evaluate(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); const c = S.tracks[0].clips[0]; c.notes = [{t: 0, d: .5, n: 40, v: .8}, {t: 1, d: .5, n: 76, v: .8, fc: 20}]; clipChanged(0, 0); selectTrack(0); openRoll(0, 0); await wait(200);
    SYNQUENZER.lage1.open('teilen'); SYNQUENZER.lage1.setB(60); SYNQUENZER.lage1.set('snd', 'weich'); const j = SYNQUENZER.lage1.split({to: 'new'}); SYNQUENZER.lage1.close(); saveNow(); return {j, nm: S.tracks[j].name, cut: S.tracks[j].sound.p.cutoff, notes: JSON.stringify(cleanClip(S.tracks[j].clips[0]))}; });
  await p.reload(); await p.waitForFunction(() => typeof BOOT !== 'undefined' && BOOT.done && window.SYNQUENZER, null, {timeout: 90000}); await sleep(700);
  const ld8 = await p.evaluate(j => ({nm: S.tracks[j] && S.tracks[j].name, cut: S.tracks[j] && S.tracks[j].sound.p.cutoff, notes: S.tracks[j] && S.tracks[j].clips[0] ? JSON.stringify(cleanClip(S.tracks[j].clips[0])) : null}), sp8.j);
  ok(T('L8 geteilte Spur („· oben“, Klang weicher, Note mit fc) nach Neuladen gleich'), ld8.nm === sp8.nm && ld8.cut === sp8.cut && ld8.notes === sp8.notes && /"fc":20/.test(ld8.notes), {sp8, ld8});
  // ---------- L9 „Wo finde ich …?“: drei Einträge, „Zeig es mir“ öffnet Rolle + Blatt mit Reiter ----------
  const L9 = await p.evaluate(() => { const L = ui1Entries(), e = ['lage1split', 'lage1fold', 'lage1flt'].map(id => L.find(x => x.id === id)); const r = e.map(x => !!x);
    closeRoll(); const go = e[2] && e[2].go(); const q = e[2] && e[2].q(); return {r, go, open: SYNQUENZER.lage1.info().open, tab: SYNQUENZER.lage1.info().tab, btn: !!q, kt: /Key-Tracking/.test(e[2].d)}; });
  ok(T('L9 Guide: drei Einträge, „Zeig es mir“ (Filter je Note) öffnet Rolle + Blatt, Key-Tracking-Hinweis'), L9.r.every(Boolean) && L9.go && L9.open && L9.tab === 'filter' && L9.btn && L9.kt, L9);
  await shot('l9-guide-filter');
  await p.evaluate(() => SYNQUENZER.lage1.close());
  // ---------- L10 Konsole ----------
  ok(T('L10 keine Konsolenfehler'), errs.length === 0, errs.slice(0, 4));
  await ctx.close();
}
await b.close();
const bad = res.filter(r => !r.ok);
console.log((bad.length ? 'FEHL LAGE1: ' : 'OK LAGE1: ') + (res.length - bad.length) + '/' + res.length + ' bestanden');
fs.writeFileSync(path.join(here, 'lage1-test-ergebnis.json'), JSON.stringify(res, null, 1));
process.exit(bad.length ? 1 : 0);
