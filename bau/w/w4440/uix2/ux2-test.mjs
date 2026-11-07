// UX2 – gezielter Test: Spur vom Rand ziehen, Clip ziehen (verschieben/tauschen/kopieren), Szene von oben ziehen,
// Einfügen mit Lupe im Noten-Editor; bestehende Gesten (Wisch-Lautstärke, Halten = Solo, Mehrfach-Solo, Tipp, Clip halten = Blatt).
// Echte Touch-Ereignisse über CDP (iPhone 12 Pro Max: 428×926 hochkant, 926×428 quer). Fotos: ux2-*.png
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2], dir = process.argv[3];
const b = await chromium.launch();
const res = []; const ok = (name, cond, info) => { res.push({name, ok: !!cond, info}); console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name + (info !== undefined ? ' · ' + JSON.stringify(info) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function open(w, h) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1600);
  const cdp = await ctx.newCDPSession(p);
  const T = {
    async start(x, y, id = 1) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id}]}); },
    async move(x, y, id = 1, steps = 6, from) {
      const [x0, y0] = from || [x, y];
      for (let k = 1; k <= steps; k++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x0 + (x - x0) * k / steps, y: y0 + (y - y0) * k / steps, id}]}); await sleep(16); }
    },
    async end() { await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); },
    async raw(type, pts) { await cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts}); },
  };
  return {ctx, p, errs, T};
}
const rect = (p, sel) => p.evaluate(s => { const e = typeof s === 'string' ? document.querySelector(s) : null; if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; }, sel);
const headR = (p, i) => p.evaluate(i => { const r = UI.heads[i].el.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; }, i);
const cellR = (p, t, s) => p.evaluate(([t, s]) => { const r = UI.cells[t][s].el.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; }, [t, s]);
const scnR = (p, s) => p.evaluate(s => { const r = UI.scenes[s].getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; }, s);
const clipSig = (p, t, s) => p.evaluate(([t, s]) => { const c = S.tracks[t].clips[s]; return c ? c.notes.length + ':' + c.len + ':' + (c.notes[0] ? c.notes[0].n : '') : null; }, [t, s]);

// ---------------- hochkant 428 × 926 ----------------
{
  const {ctx, p, errs, T} = await open(428, 926);
  // eigener kleiner Song, damit Song-Bezüge geprüft werden können: Takt 0 Szene 1, Takt 4 Szene 2 (alle Spuren)
  await p.evaluate(() => { SYNQUENZER.songFromChain && SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]); });
  const song0 = await p.evaluate(() => S.song ? S.song.lanes.map(l => l.map(e => e.bar + ':' + e.slot).join(',')) : null);
  ok('Song aus Kette angelegt (für Bezüge)', !!song0, song0 && song0[1]);

  // 1. bestehende Gesten: Wisch-Lautstärke (Mitte des Spurkopfs), Halten = Solo, zweite Spur halten = Mehrfach-Solo, Tipp = wählen
  let h = await headR(p, 0);
  const v0 = await p.evaluate(() => S.tracks[0].sound.fx.vol);
  await T.start(h.x + h.w * .5, h.y + h.h / 2); await T.move(h.x + h.w * .5 + 60, h.y + h.h / 2, 1, 8, [h.x + h.w * .5, h.y + h.h / 2]); await T.end(); await sleep(150);
  const v1 = await p.evaluate(() => S.tracks[0].sound.fx.vol);
  ok('Wisch-Lautstärke im Spurkopf wirkt weiter', v1 > v0 + .1, {v0, v1});
  await p.evaluate(() => undo()); await sleep(1700);
  h = await headR(p, 1);
  await T.start(h.x + h.w * .5, h.y + h.h / 2); await sleep(650); await T.end(); await sleep(100);
  const h2 = await headR(p, 2);
  await T.start(h2.x + h2.w * .5, h2.y + h2.h / 2); await sleep(650); await T.end(); await sleep(100);
  const solo = await p.evaluate(() => SX4.solo.size);
  ok('Halten = Solo, zweite Spur halten = Mehrfach-Solo', solo === 2, {solo});
  // Halten im RAND bleibt Solo (die Randzone nimmt nur „nach rechts ziehen“)
  h = await headR(p, 3);
  await T.start(h.x + 5, h.y + h.h / 2); await sleep(650); await T.end(); await sleep(100);
  ok('Halten im linken Rand = Solo (wie überall)', await p.evaluate(() => SX4.solo.size) === 3);
  await p.evaluate(() => sx4SoloClear());
  h = await headR(p, 2);
  await T.start(h.x + h.w * .5, h.y + h.h / 2); await sleep(60); await T.end(); await sleep(120);
  ok('Tipp auf Spurkopf wählt die Spur', await p.evaluate(() => R.selT) === 2);

  // 2. Spur vom linken Rand ziehen: Synth 1 (oben) unter Synth 3
  const ord0 = await p.evaluate(() => trackOrder().slice());
  h = await headR(p, 0); const h3 = await headR(p, 2);
  const x0 = h.x + 4, y0 = h.y + h.h / 2;
  await T.start(x0, y0); await T.move(x0 + 30, y0 + 2, 1, 4, [x0, y0]);
  const lifted = await p.evaluate(() => SYNQUENZER.ux2Info().drag);
  await T.move(x0 + 30, h3.y + h3.h * .8, 1, 10, [x0 + 30, y0 + 2]); await sleep(80);
  await p.screenshot({path: dir + '/ux2-spur-ziehen-hochkant.png'});
  await T.end(); await sleep(150);
  const ord1 = await p.evaluate(() => trackOrder().slice());
  ok('Rand nach rechts ziehen hebt die Spur ab (kein Lautstärke-Schritt)', lifted && lifted.sub === 'track', lifted);
  ok('Spur verschoben: Synth 1 steht unter Synth 3, DRUMS bleibt unten', JSON.stringify(ord1) === JSON.stringify([1, 2, 0, 3, 5, 4]), {ord0, ord1});
  ok('Lautstärke unverändert beim Rand-Ziehen', await p.evaluate(() => S.tracks[0].sound.fx.vol) === v0);
  const firstHead = await p.evaluate(() => document.querySelector('#clipGrid .th .nm').textContent);
  ok('Matrix zeigt die neue Reihenfolge', firstHead === 'Synth 2', firstHead);
  // Speichern → Laden behält die Reihenfolge
  const rt = await p.evaluate(() => { const fo = projectFileObj(S, true, false); const q = normalizeProject(JSON.parse(JSON.stringify(fo.project))); return q.ui.order; });
  ok('Speichern/Laden behält die Reihenfolge', JSON.stringify(rt) === JSON.stringify(ord1), rt);
  // Spur hinzufügen behält die eigene Reihenfolge
  await p.evaluate(() => addTrack()); const ord2 = await p.evaluate(() => trackOrder().slice());
  ok('＋ Spur behält die eigene Reihenfolge (neue Spur vor DRUMS)', JSON.stringify(ord2) === JSON.stringify([1, 2, 0, 3, 5, 6, 4]), ord2);
  await p.evaluate(() => undo()); await p.evaluate(() => undo());
  ok('↶ stellt die Reihenfolge wieder her', JSON.stringify(await p.evaluate(() => trackOrder().slice())) === JSON.stringify(ord0));
  // DRUMS lässt sich nicht verschieben
  h = await headR(p, 4);
  await T.start(h.x + 4, h.y + h.h / 2); await T.move(h.x + 40, h.y + h.h / 2, 1, 4, [h.x + 4, h.y + h.h / 2]); await T.end(); await sleep(100);
  ok('DRUMS bleibt unten', JSON.stringify(await p.evaluate(() => trackOrder().slice())) === JSON.stringify(ord0));
  await p.evaluate(() => { if (typeof hideToast === 'function') hideToast(); });

  // 3. Clip halten ohne Bewegung = Clip-Blatt wie bisher
  let c = await cellR(p, 0, 0);
  await T.start(c.x + c.w / 2, c.y + c.h / 2); await sleep(650);
  const liftCls = await p.evaluate(() => UI.cells[0][0].el.classList.contains('ux2lift') && !!UI.cells[0][0].el.querySelector('.ux2mvw'));
  await T.end(); await sleep(200);
  ok('Clip halten zeigt das Zieh-Symbol', liftCls);
  ok('Clip halten + loslassen öffnet das Clip-Blatt wie bisher', await p.evaluate(() => R.editor === 'clip' && EL.clipSheet.classList.contains('open')));
  await p.evaluate(() => closeClipSheet()); await sleep(900);

  // 4. Clip in derselben Spur verschieben: Synth 1 · Szene 1 → Szene 3 (leer); Song-Bezüge folgen
  const sig00 = await clipSig(p, 0, 0);
  c = await cellR(p, 0, 0); let d3 = await cellR(p, 0, 2);
  await T.start(c.x + c.w / 2, c.y + c.h / 2); await sleep(600);
  await T.move(d3.x + d3.w / 2, d3.y + d3.h / 2, 1, 10, [c.x + c.w / 2, c.y + c.h / 2]); await sleep(60);
  const tg1 = await p.evaluate(() => SYNQUENZER.ux2Info().drag);
  await T.end(); await sleep(150);
  const moved = await p.evaluate(() => [!!S.tracks[0].clips[0], !!S.tracks[0].clips[2]]);
  ok('Clip auf leere Zelle = verschoben', !moved[0] && moved[1] && await clipSig(p, 0, 2) === sig00, {moved, tg1});
  const lane0 = await p.evaluate(() => S.song.lanes[0].map(e => e.bar + ':' + e.slot).join(','));
  ok('Song-Bezüge der Spur folgen dem Clip (Takt 0 spielt jetzt Platz 3)', lane0.startsWith('0:2'), lane0);

  // 5. Tauschen: Synth 2 · Szene 2 auf Szene 1 (belegt)
  const sA = await clipSig(p, 1, 0), sB = await clipSig(p, 1, 1);
  c = await cellR(p, 1, 1); d3 = await cellR(p, 1, 0);
  await T.start(c.x + c.w / 2, c.y + c.h / 2); await sleep(600);
  await T.move(d3.x + d3.w / 2, d3.y + d3.h / 2, 1, 10, [c.x + c.w / 2, c.y + c.h / 2]); await sleep(60);
  await p.screenshot({path: dir + '/ux2-clip-tauschen-hochkant.png'});
  await T.end(); await sleep(150);
  ok('Clip auf belegte Zelle = getauscht', await clipSig(p, 1, 0) === sB && await clipSig(p, 1, 1) === sA, {sA, sB});

  // 6. Kopieren mit zweitem Finger: Synth 3 · Szene 1 → Synth 4 · Szene 4 (andere Spur, leer)
  const s30 = await clipSig(p, 2, 0);
  c = await cellR(p, 2, 0); d3 = await cellR(p, 3, 3);
  await T.raw('touchStart', [{x: c.x + c.w / 2, y: c.y + c.h / 2, id: 1}]); await sleep(600);
  for (let k = 1; k <= 8; k++) { await T.raw('touchMove', [{x: c.x + c.w / 2 + (d3.x - c.x) * k / 8, y: c.y + c.h / 2 + (d3.y - c.y) * k / 8, id: 1}]); await sleep(16); }
  const mb = await p.evaluate(() => { const r = EL.bMenu.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  await T.raw('touchStart', [{x: d3.x + d3.w / 2, y: d3.y + d3.h / 2 - 2, id: 1}, {x: mb.x, y: mb.y, id: 2}]); await sleep(40);   // zweiter Finger (auf ☰)
  await T.raw('touchEnd', [{x: d3.x + d3.w / 2, y: d3.y + d3.h / 2 - 2, id: 1}]); await sleep(40);
  const cp = await p.evaluate(() => SYNQUENZER.ux2Info().drag);
  await T.raw('touchEnd', []); await sleep(150);
  ok('Zweiter Finger = Kopie (Original bleibt)', await clipSig(p, 2, 0) === s30 && await clipSig(p, 3, 3) === s30, {cp});
  ok('Der zweite Finger löst sonst nichts aus (☰ bleibt zu)', await p.evaluate(() => R.editor !== 'menu'));
  await p.evaluate(() => { if (R.editor === 'menu') closeMenu(); });
  // Halten, zweiter Finger noch vor dem Ziehen = Kopie
  const s31 = await clipSig(p, 2, 1); c = await cellR(p, 2, 1); d3 = await cellR(p, 2, 3);
  await T.raw('touchStart', [{x: c.x + c.w / 2, y: c.y + c.h / 2, id: 1}]); await sleep(600);
  await T.raw('touchStart', [{x: c.x + c.w / 2, y: c.y + c.h / 2, id: 1}, {x: 200, y: 600, id: 3}]); await sleep(40);
  await T.raw('touchEnd', [{x: 200, y: 600, id: 3}]); await sleep(30);   // CDP: touchEnd nennt den Finger, der losgelassen wird
  for (let k = 1; k <= 8; k++) { await T.raw('touchMove', [{x: c.x + c.w / 2 + (d3.x - c.x) * k / 8, y: c.y + c.h / 2, id: 1}]); await sleep(16); }
  await T.raw('touchEnd', []); await sleep(150);
  ok('Halten + zweiter Finger, dann ziehen = Kopie', await clipSig(p, 2, 1) === s31 && await clipSig(p, 2, 3) === s31);

  // 7. Szene von oben ziehen: Szene 2 hinter Szene 4
  const before = await p.evaluate(() => ({c: S.tracks.map(t => t.clips.map(x => !!x)), n: S.scenes.map(s => s.name || ''), lanes: S.song.lanes.map(l => l.map(e => e.bar + ':' + e.slot).join(','))}));
  const s1 = await scnR(p, 1), s3 = await scnR(p, 3);
  await T.start(s1.x + s1.w / 2, s1.y + 4); await T.move(s1.x + s1.w / 2, s1.y + 34, 1, 5, [s1.x + s1.w / 2, s1.y + 4]);
  await T.move(s3.x + s3.w * .8, s1.y + 34, 1, 10, [s1.x + s1.w / 2, s1.y + 34]); await sleep(60);
  await p.screenshot({path: dir + '/ux2-szene-ziehen-hochkant.png'});
  await T.end(); await sleep(150);
  const after = await p.evaluate(() => ({c: S.tracks.map(t => t.clips.map(x => !!x)), n: S.scenes.map(s => s.name || ''), lanes: S.song.lanes.map(l => l.map(e => e.bar + ':' + e.slot).join(',')), playing: R.playing}));
  const perm = [0, 2, 3, 1, 4, 5, 6, 7];
  ok('Szene 2 → Platz 4 (Clips und Namen wandern mit)', after.c.every((row, t) => row.every((v, k) => v === before.c[t][perm[k]])) && after.n.every((v, k) => v === before.n[perm[k]]), {n0: before.n, n1: after.n});
  ok('Song-Bezüge zeigen auf die neuen Nummern', after.lanes.every((l, t) => l === before.lanes[t].replace(/:(\d)/g, (m, s) => ':' + ({0: 0, 1: 3, 2: 1, 3: 2}[s] ?? s))), {b: before.lanes[1], a: after.lanes[1]});
  ok('Szene ziehen startet nichts', !after.playing);
  // ↶ ↷ der ganzen Reihe ist verlustfrei
  ok('undoRedoCheck (alle ↶, alle ↷ = gleicher Stand)', await p.evaluate(() => undoRedoCheck()));
  // Tipp in den oberen Rand startet die Szene beim Loslassen
  const s0 = await scnR(p, 0);
  await T.start(s0.x + s0.w / 2, s0.y + 4); await sleep(60); await T.end(); await sleep(250);
  ok('Tipp oben auf den Szenen-Kopf startet die Szene', await p.evaluate(() => R.playing && R.selS === 0));
  await p.evaluate(() => { stop && stop(); }); await sleep(150);
  // Tipp in der Mitte startet beim Aufsetzen wie bisher
  await p.evaluate(() => { if (R.playing) stop(); });
  await T.start(s0.x + s0.w / 2, s0.y + s0.h / 2); await sleep(30);
  const atDown = await p.evaluate(() => R.playing);
  await T.end(); await sleep(100);
  ok('Mitte des Szenen-Kopfs startet weiter beim Aufsetzen', atDown);
  await p.evaluate(() => { if (R.playing) stop(); });

  // 8. Einfügen mit Lupe im Noten-Editor (Synth 2 · Szene 1, 1 Takt → 2 Takte, Noten in Takt 2 einfügen)
  await p.evaluate(() => { const c = S.tracks[1].clips[0]; clipLength(1, 0, 1); openRoll(1, 0); });
  await sleep(500);
  const n0 = await p.evaluate(() => S.tracks[1].clips[0].notes.length);
  await p.evaluate(() => { const b = [...ED.roll.el.acts.children].find(x => x.textContent === 'Kopieren'); b.click(); });
  await p.evaluate(() => { const b = [...ED.roll.el.acts.children].find(x => x.textContent === 'Einfügen'); b.click(); });
  await sleep(150);
  const ri = await p.evaluate(() => SYNQUENZER.ux2Roll());
  ok('Kopieren + Einfügen: Einfüge-Modus mit Geist', ri && ri.on && ri.clip === n0, ri);
  await p.evaluate(() => { ED.roll.fitView('clip'); }); await sleep(150);
  const m = await p.evaluate(() => { const r = ED.roll.el.main.getBoundingClientRect(); const a = ED.roll._xy(5, 67), z = ED.roll._xy(.5, 67); return {x: r.left, y: r.top, w: r.width, h: r.height, x4: a.x, x0: z.x, fy: a.y}; });
  const fy = m.fy;
  await T.start(m.x0, fy); await T.move(m.x4, fy, 1, 12, [m.x0, fy]); await sleep(80);
  const ri2 = await p.evaluate(() => SYNQUENZER.ux2Roll());
  await p.screenshot({path: dir + '/ux2-einfuegen-lupe-hochkant.png'});
  await T.end(); await sleep(120);
  ok('Lupe beim Ziehen sichtbar, Punkt rastet am Raster', ri2 && ri2.loupe && Math.abs(ri2.b * 4 - Math.round(ri2.b * 4)) < 1e-6, ri2);
  ok('Lupe verschwindet beim Loslassen', await p.evaluate(() => !document.querySelector('.ux2p-lupe')));
  await p.evaluate(() => SYNQUENZER.ux2Roll() && ED.roll.el.acts._ux2p.at(4));
  await p.evaluate(() => { const b = [...ED.roll.el.acts.children].find(x => x.textContent === '✓ Einfügen'); b.click(); });
  await sleep(120);
  const n1 = await p.evaluate(() => S.tracks[1].clips[0].notes.length);
  ok('✓ Einfügen setzt die Noten in Takt 2 (ein Undo)', n1 === 2 * n0, {n0, n1});
  await p.evaluate(() => ED.roll.el.bar.querySelector('button[title="Rückgängig"]') && ED.roll.el.bar.querySelector('button[title="Rückgängig"]').click());
  await sleep(100);
  ok('↶ nimmt das Einfügen zurück', await p.evaluate(() => S.tracks[1].clips[0].notes.length) === n0);
  // Tasten ≥ 44 px und ✕ sichtbar im Einfüge-Modus
  await p.evaluate(() => { const b = [...ED.roll.el.acts.children].find(x => x.textContent === 'Einfügen'); b.click(); }); await sleep(150);
  const bt = await p.evaluate(() => [...ED.roll.el.acts.children].filter(x => !x.hidden && x.tagName === 'BUTTON').map(x => { const r = x.getBoundingClientRect(); return {t: x.textContent, w: Math.round(r.width), h: Math.round(r.height), in: r.right <= innerWidth && r.left >= 0}; }));
  ok('Einfüge-Leiste: ✓ und ✕ sichtbar, ≥ 44 px breit', bt.length === 2 && bt.every(x => x.w >= 44 && x.in), bt);
  const xs = await p.evaluate(() => { const x = document.querySelector('#rollSheet .sh-x'); if (!x) return null; const r = x.getBoundingClientRect(); return {w: r.width, h: r.height, in: r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight}; });
  ok('Schließen-✕ des Editors sichtbar', !xs || xs.in, xs);
  await p.evaluate(() => { const b = [...ED.roll.el.acts.children].find(x => x.textContent === '✕'); b.click(); closeRoll(); });
  ok('keine Fehler (hochkant)', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}

// ---------------- quer 926 × 428 ----------------
{
  const {ctx, p, errs, T} = await open(926, 428);
  // Spur ziehen quer und Szene 7 an Platz 2 (alle 8 Szenen sichtbar)
  await p.evaluate(() => { const c = S.tracks[0].clips[0]; S.tracks[0].clips[6] = deep(cleanClip(c)); S.scenes[6].name = 'Hinten'; UI.dirty.all = true; });
  await sleep(100);
  const h = await headR(p, 2), t1 = await headR(p, 0);
  await T.start(h.x + 3, h.y + h.h / 2); await T.move(h.x + 30, h.y + h.h / 2, 1, 4, [h.x + 3, h.y + h.h / 2]);
  await T.move(h.x + 30, t1.y + 4, 1, 8, [h.x + 30, h.y + h.h / 2]); await T.end(); await sleep(150);
  ok('quer: Synth 3 nach oben gezogen', JSON.stringify(await p.evaluate(() => trackOrder().slice())) === JSON.stringify([2, 0, 1, 3, 5, 4]));
  const s6 = await scnR(p, 6), s1 = await scnR(p, 1);
  await T.start(s6.x + s6.w / 2, s6.y + 3); await T.move(s6.x + s6.w / 2, s6.y + 30, 1, 5, [s6.x + s6.w / 2, s6.y + 3]);
  await T.move(s1.x + 6, s6.y + 30, 1, 12, [s6.x + s6.w / 2, s6.y + 30]); await sleep(60);
  await p.screenshot({path: dir + '/ux2-szene-ziehen-quer.png'});
  await T.end(); await sleep(150);
  const nm = await p.evaluate(() => S.scenes.map(s => s.name || ''));
  ok('quer: Szene 7 an Platz 2 gezogen (Name wandert mit)', nm[1] === 'Hinten' && !!(await p.evaluate(() => S.tracks[0].clips[1])), nm);
  const xb = await p.evaluate(() => { const r = UI.corner.getBoundingClientRect(); return r.left >= 0; });
  ok('quer: Layout unverändert (Matrix-Ecke an ihrem Platz)', xb);
  ok('quer: undoRedoCheck', await p.evaluate(() => undoRedoCheck()));
  ok('keine Fehler (quer)', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
await b.close();
const bad = res.filter(r => !r.ok);
console.log('\nUX2: ' + (res.length - bad.length) + '/' + res.length + ' OK' + (bad.length ? ' · FAIL: ' + bad.map(r => r.name).join(' | ') : ''));
