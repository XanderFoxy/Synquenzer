// LF1 – gezielter Test: Schritt aus, Schritt-Menü (Wirbel/Transponieren/Chance), Richtung, Spielweise (Strum), Speichern/Laden,
// MIDI, alte Clips unverändert; Fotos hochkant 428×926 und quer 926×428. Aufruf: node lf1-test.mjs <index.html> <ausgabe-ordner>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2], out = process.argv[3];
const sl = ms => new Promise(r => setTimeout(r, ms));
const res = []; const ok = (name, cond, info) => { res.push({name, ok: !!cond, info: info === undefined ? '' : info}); };
const b = await chromium.launch();
const errs = [];
async function page(w, h) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  p.cdp = await ctx.newCDPSession(p);
  return p;
}
const center = async (p, js, arg) => p.evaluate(js, arg);
async function tap(p, xy) { await p.touchscreen.tap(xy.x, xy.y); await sl(120); }
async function hold(p, xy, ms) {
  await p.cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: xy.x, y: xy.y}]});
  await sl(ms || 650);
  await p.cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sl(150);
}
const cellXY = (p, i) => center(p, i => { const c = SYNQUENZER.laufApi().se.cells[i].getBoundingClientRect(); return {x: c.left + c.width / 2, y: c.top + c.height * .6}; }, i);
const popBtn = (p, txt) => center(p, txt => { const b = [...document.querySelectorAll('.pop button')].find(x => x.textContent.trim() === txt); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height}; }, txt);
// MIDI: note-ons (velocity > 0) per channel
function midiOns(bytes) {
  const a = Uint8Array.from(bytes), ons = []; let i = 14;
  while (i < a.length) {
    const len = (a[i + 4] << 24) | (a[i + 5] << 16) | (a[i + 6] << 8) | a[i + 7]; let j = i + 8; const end = j + len; let tk = 0;
    while (j < end) {
      let d = 0, x; do { x = a[j++]; d = (d << 7) | (x & 127); } while (x & 128); tk += d;
      const st = a[j];
      if (st === 0xFF) { const ty = a[j + 1]; let L = 0, k = j + 2; do { x = a[k++]; L = (L << 7) | (x & 127); } while (x & 128); j = k + L; continue; }
      const hi = st & 0xF0, n = hi === 0xC0 || hi === 0xD0 ? 1 : 2;
      if (hi === 0x90 && a[j + 2] > 0) ons.push({ch: st & 15, tk, n: a[j + 1]});
      j += 1 + n;
    }
    i = end;
  }
  return ons;
}

// ---------- hochkant 428 × 926 ----------
{
  const p = await page(428, 926);
  const N8 = [48, 50, 52, 53, 55, 57, 59, 60];
  await p.evaluate(N8 => {
    const Q = SYNQUENZER; Q.setBpm(120);
    Q.setClip(1, 0, {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: N8.map((n, k) => ({t: k * .25, d: .245, n, v: .8}))});
    Q.setClip(1, 2, {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: N8.map((n, k) => ({t: k * .5, d: .45, n, v: .8}))});   // ein alter Clip ohne LF1-Felder
    Q.openLauf(1, 0);
  }, N8);
  await sl(300);
  // 1 Schritt 3 aus per Tipp: Note bleibt in den Daten
  await tap(p, await cellXY(p, 2));
  let c = await p.evaluate(() => SYNQUENZER.getClip(1, 0));
  ok('Tipp: Schritt 3 aus, Note bleibt', c.notes.length === 8 && c.notes[2].off === true && c.notes[2].n === 52, JSON.stringify(c.notes[2]));
  ok('Schritt 3 gedimmt (lf1off)', await p.evaluate(() => SYNQUENZER.laufApi().se.cells[2].classList.contains('lf1off')));
  // 2 langer Druck auf Schritt 5 -> Menü; Wirbel 3, Transponieren +12 auf Schritt 2, Chance 50 % auf Schritt 8
  await hold(p, await cellXY(p, 4));
  ok('langer Druck öffnet Schritt-Menü', await p.evaluate(() => !!document.querySelector('.pop.lf1pop')), await p.evaluate(() => (document.querySelector('.pop h4') || {}).textContent));
  c = await p.evaluate(() => SYNQUENZER.getClip(1, 0));
  ok('langer Druck ändert nichts', c.notes.length === 8 && !c.notes[4].off, JSON.stringify(c.notes[4]));
  const b3 = await popBtn(p, '3×'); await tap(p, b3);
  ok('Menü-Knöpfe ≥ 44 px', await p.evaluate(() => [...document.querySelectorAll('.pop.lf1pop button')].every(x => x.getBoundingClientRect().height >= 43.5 && x.getBoundingClientRect().width >= 43.5)));
  c = await p.evaluate(() => SYNQUENZER.getClip(1, 0));
  ok('Wirbel 3 gesetzt', c.notes[4].rt === 3, JSON.stringify(c.notes[4]));
  await p.screenshot({path: out + '/lf1-p-menue.png'});
  await p.evaluate(() => { closePop(); SYNQUENZER.lf1Step(1, 0, 1, 'tp', 12); SYNQUENZER.lf1Step(1, 0, 7, 'pb', .5); });
  c = await p.evaluate(() => SYNQUENZER.getClip(1, 0));
  ok('Transponieren +12 / Chance 50 %', c.notes[1].tp === 12 && c.notes[7].pb === .5, JSON.stringify([c.notes[1], c.notes[7]]));
  // Ereignisse wie gespielt (Durchgang 0): Schritt 3 fehlt, Schritt 5 dreimal, Schritt 2 eine Oktave höher
  const ev0 = await p.evaluate(() => SYNQUENZER.lf1Events(1, 0, 0));
  ok('Ereignisse: stumm fehlt', !ev0.some(e => e.n === 52), JSON.stringify(ev0.map(e => e.n)));
  const r3 = ev0.filter(e => e.n === 55);
  ok('Wirbel 3 = 3 Schläge', r3.length === 3 && r3[1].t > r3[0].t && r3[2].t > r3[1].t && r3[2].t < 1.25, JSON.stringify(r3));
  ok('Transponieren +12', ev0.some(e => e.n === 62) && !ev0.some(e => e.n === 50), '');
  const pb = []; for (let k = 0; k < 16; k++) pb.push((await p.evaluate(k => SYNQUENZER.lf1Events(1, 0, k), k)).some(e => e.n === 60) ? 1 : 0);
  const pb2 = []; for (let k = 0; k < 16; k++) pb2.push((await p.evaluate(k => SYNQUENZER.lf1Events(1, 0, k), k)).some(e => e.n === 60) ? 1 : 0);
  ok('Chance 50 %: mal ja, mal nein, jedes Mal gleich', pb.includes(1) && pb.includes(0) && pb.join('') === pb2.join(''), pb.join(''));
  // 3 Wiedergabe: Noten-Log ohne den stummen Schritt, Wirbel 3 Schläge je Durchgang
  await p.keyboard.press('F10');   // Nutzergeste (Audio frei)
  await p.evaluate(() => { const Q = SYNQUENZER; Q.clearLog(); Q.launchScene(0); });
  await sl(2600);
  const log = await p.evaluate(() => SYNQUENZER.noteLog(400).filter(e => e.track === 1 && e.src === 'clip'));
  await p.evaluate(() => SYNQUENZER.stop());
  const bar0 = log.filter(e => e.beat != null && e.beat >= 0 && e.beat < 4 - 1e-6);
  ok('Noten-Log: Schritt 3 (E3) nicht gespielt', log.length > 0 && !log.some(e => e.clipNote === 52), JSON.stringify(log.map(e => e.clipNote)));
  ok('Noten-Log: Wirbel 3 Schläge in Takt 1', bar0.filter(e => e.clipNote === 55).length === 3, JSON.stringify(bar0.map(e => [e.clipNote, e.beat])));
  ok('Noten-Log: +12 klingt als D4', log.some(e => e.clipNote === 62));
  // 4 Richtung per Knopf: rückwärts; Reihenfolge (Durchgang 0: Schritte 16…1 -> Noten ab Schlag 2 rückwärts)
  await p.evaluate(() => { for (let k = 0; k < 3; k++) SYNQUENZER.undo(); });     // Wirbel/Transp./Chance zurück (Schritt 3 bleibt aus)
  c = await p.evaluate(() => SYNQUENZER.getClip(1, 0));
  ok('Undo je Aktion ein Schritt', c.notes[2].off === true && !c.notes[4].rt && !c.notes[1].tp && c.notes[7].pb == null, JSON.stringify(c.notes.map(n => [n.off, n.rt, n.tp, n.pb])));
  const db = await center(p, () => { const b = document.querySelector('.lbar .lf1dir'); const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, right: r.right}; });
  ok('[Richtung] in der Werkzeugleiste, sichtbar', db.h >= 30 && db.w >= 44 && db.right <= 428, JSON.stringify(db));
  await tap(p, db);
  await tap(p, await popBtn(p, 'rückwärts'));
  c = await p.evaluate(() => SYNQUENZER.getClip(1, 0));
  ok('Richtung rückwärts gespeichert', c.lf && c.lf.dir === 'rev', JSON.stringify(c.lf));
  let ev = await p.evaluate(() => SYNQUENZER.lf1Events(1, 0, 0));
  ok('rückwärts: Reihenfolge', JSON.stringify(ev.map(e => e.n)) === JSON.stringify([60, 59, 57, 55, 53, 50, 48]) && Math.abs(ev[0].t - 2) < 1e-6, JSON.stringify(ev.map(e => [e.n, e.t])));
  await tap(p, await popBtn(p, 'hin und her'));
  const pp0 = (await p.evaluate(() => SYNQUENZER.lf1Events(1, 0, 0))).map(e => e.n), pp1 = (await p.evaluate(() => SYNQUENZER.lf1Events(1, 0, 1))).map(e => e.n);
  ok('hin und her: Durchgang 1 vorwärts, 2 zurück (Enden einmal)', JSON.stringify(pp0) === JSON.stringify([48, 50, 53, 55, 57, 59, 60]) && JSON.stringify(pp1) === JSON.stringify([60, 59, 57, 55, 53, 50, 48, 50]), JSON.stringify([pp0, pp1]));
  await tap(p, await popBtn(p, 'Zufall'));
  const z1 = JSON.stringify(await p.evaluate(() => SYNQUENZER.lf1Events(1, 0, 3))), z2 = JSON.stringify(await p.evaluate(() => SYNQUENZER.lf1Events(1, 0, 3)));
  ok('Zufall: deterministisch (Muster 1)', z1 === z2 && (await p.evaluate(() => SYNQUENZER.getClip(1, 0).lf.seed)) === 1, z1.slice(0, 80));
  await tap(p, await popBtn(p, 'vorwärts'));
  ok('vorwärts ab 1 = kein clip.lf', !(await p.evaluate(() => SYNQUENZER.getClip(1, 0).lf)));
  await p.evaluate(() => closePop()); await sl(150);
  // Startschritt per Menü: langer Druck auf Schritt 5 -> „Hier starten“
  await hold(p, await cellXY(p, 4));
  await tap(p, await popBtn(p, 'Hier starten'));
  c = await p.evaluate(() => SYNQUENZER.getClip(1, 0));
  ev = await p.evaluate(() => SYNQUENZER.lf1Events(1, 0, 0));
  ok('Start bei Schritt 5', c.lf && c.lf.st === 4 && ev[0].n === 55 && Math.abs(ev[0].t) < 1e-6, JSON.stringify([c.lf, ev.slice(0, 3)]));
  ok('Start-Dreieck an Schritt 5', await p.evaluate(() => { const m = SYNQUENZER.laufApi().se.cells[4].querySelector('.lf1s'); return !!m && !m.hidden; }));
  await p.evaluate(() => closePop()); await sl(150);
  // Effekte für das Foto: Wirbel 3 auf Schritt 2, +7 auf Schritt 6, 50 % auf Schritt 8
  await p.evaluate(() => { const Q = SYNQUENZER; Q.lf1Step(1, 0, 1, 'rt', 3); Q.lf1Step(1, 0, 5, 'tp', 7); Q.lf1Step(1, 0, 7, 'pb', .5); });
  await sl(200);
  ok('Effekt-Marken in den Schritten', await p.evaluate(() => { const C = SYNQUENZER.laufApi().se.cells; return C[1].querySelector('.lf1b').textContent === '3×' && C[5].querySelector('.lf1b').textContent === '+7' && C[7].querySelector('.lf1b').textContent === '50%'; }));
  const lay = await p.evaluate(() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, sh: document.documentElement.scrollHeight, ch: document.documentElement.clientHeight, x: (() => { const r = document.querySelector('#rollSheet .sh-x').getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; })()}));
  ok('ROLLE zeigt den ausgeschalteten Schritt (Daten)', await p.evaluate(() => SYNQUENZER.getClip(1, 0).notes.filter(n => n.off).length === 1));
  ok('kein Überlauf, ✕ sichtbar (hochkant)', lay.sw <= lay.cw && lay.sh <= lay.ch && lay.x[2] <= 428 && lay.x[1] >= 0, JSON.stringify(lay));
  await p.screenshot({path: out + '/lf1-p-lauf.png'});
  // 4b live: Start 5 + Wirbel/Transp./Chance -> der Noten-Log in Takt 1 = die Ereignisse von Durchgang 0 (Tonhöhe und Schlag)
  await p.evaluate(() => { const Q = SYNQUENZER; Q.stop(); Q.clearLog(); Q.launchScene(0); });
  await sl(2600);
  const lg = await p.evaluate(() => SYNQUENZER.noteLog(400).filter(e => e.track === 1 && e.src === 'clip' && e.beat != null && e.beat >= -1e-3 && e.beat < 4 - 1e-3).map(e => [e.clipNote, +e.beat.toFixed(3)]));
  await p.evaluate(() => SYNQUENZER.stop());
  const ex = (await p.evaluate(() => SYNQUENZER.lf1Events(1, 0, 0))).map(e => [e.n, +e.t.toFixed(3)]);
  ok('live = Ereignisse (Start 5, Wirbel, +7, Chance)', JSON.stringify(lg) === JSON.stringify(ex), JSON.stringify([lg, ex]));
  // 5 MIDI: Szene 1, Spur 2 = Kanal 2: 7 Noten (Schritt 3 stumm), Schritt 2 dreimal -> 9; Startschritt 5 verschiebt nur die Zeiten
  const mb = await p.evaluate(() => Array.from(SYNQUENZER.buildMidi({mode: 'scene', scene: 0}).bytes));
  const evm = await p.evaluate(() => { const L = Math.max(...S.tracks.slice(0, 5).map(tr => (tr.clips[0] ? clipB(tr.clips[0]) : 0))), o = []; for (let k = 0; k * 4 < L - 1e-9; k++) o.push(...SYNQUENZER.lf1Events(1, 0, k)); return o; });
  const on1 = midiOns(mb).filter(e => e.ch === 1);
  ok('MIDI = gespielte Ereignisse', on1.length === evm.length && !on1.some(e => e.n === 52) && on1.filter(e => e.n === 50).length === 3 * (evm.filter(e => e.n === 50).length / 3), JSON.stringify([on1.length, evm.length]));
  // 6 Speichern / Laden (Projektdatei) + alter Clip unverändert
  const before = await p.evaluate(() => JSON.stringify(SYNQUENZER.getClip(1, 0)));
  const old0 = await p.evaluate(() => JSON.stringify(SYNQUENZER.getClip(1, 2)));
  const okImp = await p.evaluate(() => SYNQUENZER.importJSON(SYNQUENZER.serialize()));
  await sl(500);
  const after = await p.evaluate(() => JSON.stringify(SYNQUENZER.getClip(1, 0))), old1 = await p.evaluate(() => JSON.stringify(SYNQUENZER.getClip(1, 2)));
  ok('Speichern/Laden: gleich (off, rt, tp, pb, lf)', okImp && before === after && after.includes('"off":true') && after.includes('"lf":'), after.slice(0, 160));
  ok('alter Clip: keine neuen Felder, spielt wie bisher (lf1Events = null)', old0 === old1 && !old1.includes('"lf"') && (await p.evaluate(() => SYNQUENZER.lf1Events(1, 2, 0))) === null, old1.slice(0, 80));
  await p.context().close();
}
// ---------- quer 926 × 428 ----------
{
  const p = await page(926, 428);
  await p.evaluate(() => {
    const Q = SYNQUENZER; Q.setBpm(120);
    Q.setClip(1, 0, {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [0, 2, 4, 5, 7, 9, 11, 12].map((d, k) => ({t: k * .25, d: .245, n: 48 + d, v: .8}))});
    Q.setClip(1, 1, {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [60, 64, 67].map(n => ({t: 0, d: 4, n, v: .8}))});   // C-Dur-Akkord
    Q.openLauf(1, 0);
    Q.lf1Step(1, 0, 2, 'off'); Q.lf1Step(1, 0, 4, 'rt', 3); Q.lf1Step(1, 0, 1, 'tp', 12); Q.lf1Dir(1, 0, {dir: 'pend'});
  });
  await sl(300);
  const db = await center(p, () => { const b = document.querySelector('.lbar .lf1dir'); const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  await tap(p, db);
  ok('quer: Richtungs-Blatt offen, im Bild', await p.evaluate(() => { const q = document.querySelector('.pop.lf1pop'); if (!q) return false; const r = q.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.right <= innerWidth; }));
  const lay = await p.evaluate(() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, x: (() => { const r = document.querySelector('#rollSheet .sh-x').getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; })()}));
  ok('kein Überlauf, ✕ sichtbar (quer)', lay.sw <= lay.cw && lay.x[2] <= 926 && lay.x[1] >= 0, JSON.stringify(lay));
  await p.screenshot({path: out + '/lf1-l-richtung.png'});
  await p.evaluate(() => closePop()); await sl(150);
  // 7 Spielweise in der ROLLE: C-Dur-Akkord -> Gitarre ab (Strum 15 ms): gestaffelte Noten
  await p.evaluate(() => { SYNQUENZER.closeRoll(); SYNQUENZER.openRoll(1, 1); SYNQUENZER.setRollView('roll'); });
  await sl(400);
  const sw = await center(p, () => { const b = [...SYNQUENZER.rollApi().el.acts.children].find(x => x.textContent === 'Spielweise'); if (!b) return null; b.scrollIntoView({inline: 'center'}); const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height}; });
  ok('[Spielweise] in der Aktionszeile der ROLLE', !!sw, JSON.stringify(sw));
  await tap(p, sw);
  ok('Spielweise-Blatt offen', await p.evaluate(() => !!document.querySelector('.pop.lf1pop') && document.querySelectorAll('.pop .lf1sw button').length === 11));
  await tap(p, await popBtn(p, 'Gitarre: ab'));
  let c = await p.evaluate(() => SYNQUENZER.getClip(1, 1));
  const st = 15 / 1000 / (60 / 120), first = c.notes.filter(n => n.t < .2);
  ok('Strum auf C-Dur: gestaffelte Noten (15 ms)', first.length >= 5 && first.every((n, k) => k === 0 || (Math.abs(n.t - first[k - 1].t - st) < 1e-3 && n.n > first[k - 1].n)) && c.notes.length === first.length * 4,
    JSON.stringify(first.map(n => [n.n, n.t])) + ' gesamt ' + c.notes.length);
  ok('Strum nutzt nur Akkordtöne C E G', c.notes.every(n => [0, 4, 7].includes(n.n % 12)));
  await p.screenshot({path: out + '/lf1-l-spielweise.png'});
  await tap(p, await popBtn(p, 'Glockengeläut'));
  c = await p.evaluate(() => SYNQUENZER.getClip(1, 1));
  ok('Wechsel rechnet vom Original (Glocken)', c.notes.length > 4 && c.notes.every(n => [0, 4, 7].includes(n.n % 12)) && c.notes.some(n => n.n >= 72), c.notes.length);
  await p.evaluate(() => { closePop(); SYNQUENZER.undo(); SYNQUENZER.undo(); });
  c = await p.evaluate(() => SYNQUENZER.getClip(1, 1));
  ok('Undo: Glocken -> Strum -> Akkord (je ein Schritt)', c.notes.length === 3, c.notes.length);
  const all = {};
  for (const id of ['strDU', 'strF', 'riff', 'gli', 'hArp', 'hGli', 'mand', 'albe', 'pizz']) { all[id] = await p.evaluate(id => { const n = SYNQUENZER.lf1Style(1, 1, id); const c = SYNQUENZER.getClip(1, 1); return [n, c.notes.length, c.notes.every(x => x.t >= 0 && x.t < 4 && x.d > 0 && x.n >= 0 && x.n <= 127)]; }, id); await p.evaluate(() => SYNQUENZER.undo()); }
  ok('alle Spielweisen erzeugen gültige Noten', Object.values(all).every(x => x[0] > 0 && x[2]), JSON.stringify(all));
  c = await p.evaluate(() => SYNQUENZER.getClip(1, 1));
  ok('nach allen Spielweisen + Undo: Akkord unverändert', c.notes.length === 3, c.notes.length);
  await p.context().close();
}
// ---------- weitere Größen: kein Überlauf, ✕ sichtbar, [Richtung] im Bild (428/926 Pflicht, andere nur Info) ----------
for (const [w, h] of [[390, 844], [375, 667], [844, 390], [926, 370]]) {
  const p = await page(w, h);
  const r = await p.evaluate(() => {
    const Q = SYNQUENZER; Q.setClip(1, 0, {len: 2, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [0, 1, 2, 3, 4, 5, 6, 7].map(k => ({t: k * .25, d: .245, n: 48 + k, v: .8, off: k === 2}))}); Q.openLauf(1, 0);
    const d = document.documentElement, x = document.querySelector('#rollSheet .sh-x').getBoundingClientRect(), b = document.querySelector('.lbar .lf1dir').getBoundingClientRect(), bar = document.querySelector('.lbar').getBoundingClientRect();
    return {over: d.scrollWidth > d.clientWidth || d.scrollHeight > d.clientHeight, x: x.right <= innerWidth && x.top >= 0 && x.bottom <= innerHeight, dir: b.right <= Math.min(innerWidth, bar.right) + .5 && b.left >= bar.left - .5, off: document.querySelector('.lauf .se-cell.lf1off') != null};
  });
  ok(`${w}×${h}: kein Überlauf, ✕ sichtbar, Schritt aus gedimmt`, !r.over && r.x && r.off, JSON.stringify(r));
  res.push({name: `${w}×${h}: [Richtung] ohne Wischen sichtbar (Info)`, ok: true, info: '', infoOnly: r.dir});
  await p.context().close();
}
await b.close();
ok('keine Fehler in der Konsole', errs.length === 0, JSON.stringify(errs));
for (const r of res) console.log((r.ok ? 'OK  ' : 'FAIL') + ' ' + r.name + (r.ok ? '' : ' :: ' + r.info) + (r.infoOnly !== undefined ? ' -> ' + r.infoOnly : ''));
console.log(res.filter(r => r.ok).length + '/' + res.length);
