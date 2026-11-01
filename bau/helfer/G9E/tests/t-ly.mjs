// G9E: Mitlese-Zeile + Silben an Noten. node t-ly.mjs <index.html>
import {open, closeAll, sleep, waitBeat, T} from './h-lib.mjs';
import {takeWithText} from './lib-ly.mjs';
import path from 'path'; import {fileURLToPath} from 'url';
const FILE = process.argv[2] || '../index.html', ok = T(), SHOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../bilder') + '/';
const FR = 1000 / 60;

// ---------- 1. Abspielen: richtige Silbe zur richtigen Zeit (±1 Bild) ----------
{
  const H = await open(FILE, {viewport: {width: 428, height: 926}}), p = H.p;
  const x = await takeWithText(p);
  await p.evaluate(() => SYNQUENZER.stimmeStop('aus')); await sleep(600);
  let L = await p.evaluate(() => SYNQUENZER.lyBar());
  ok('Leiste sichtbar, sobald ein Take Text hat (Standard an)', L.shown && L.on && !L.off, JSON.stringify(L));
  ok('Stand: erste Zeile als Vorschau', L.a === 'Liebe ist ein Feuer' && L.b === 'brennt in mir die ganze Nacht', L.a + ' / ' + L.b);
  // Mitschrift je Bild: hörbarer Schlag + hervorgehobene Silbe
  await p.evaluate(s => { window.__ly = []; const f = () => { if (!window.__lyRun) return; const c = SYNQUENZER.vsClock(), b = c.playing ? (c.now - c.outLat - c.start) / c.spb : null, l = SYNQUENZER.lyBar(); window.__ly.push({b, n: l.nowIdx, a: l.a}); requestAnimationFrame(f); }; window.__lyRun = true; requestAnimationFrame(f); SYNQUENZER.selectSlot(s, 0); SYNQUENZER.play(); }, x.st);
  await waitBeat(p, 16.6);
  const rec = await p.evaluate(() => { window.__lyRun = false; SYNQUENZER.stop(); return window.__ly; });
  const P = await p.evaluate(() => SYNQUENZER.lyPrep()), A = await p.evaluate(() => { const a = S.tracks[stimmeT()].clips[0].audio; return {in: a.in, at: a.at, sp: spb()}; });
  const exp = b => { if (b == null || b < 0) return -1; const cb = b % 16, h = A.in + (cb - A.at) * A.sp; let si = -1; for (let i = 0; i < P.hs.length; i++) if (P.hs[i] <= h + 1e-4) si = i; if (si < 0) return -1; const nx = si + 1 < P.hs.length ? P.hs[si + 1] : 1e9; if (!(h < Math.min(nx, P.hs[si] + 1.6))) return -1; let g = si; while (g > 0 && P.hs[g - 1] === P.hs[si]) g--; return g; };
  let bad = 0, n = 0, worst = '';
  for (let i = 1; i < rec.length - 1; i++) { const r = rec[i]; if (r.b == null || r.b < 0) continue; n++; const e = exp(r.b); if (e === r.n) continue; if (exp(rec[i - 1].b) === r.n || exp(rec[i + 1].b) === r.n) continue; bad++; worst = `b=${r.b.toFixed(3)} ist ${r.n} soll ${e}`; }
  ok('Silbe zur richtigen Zeit (±1 Bild) über 4 Takte', n > 100 && bad === 0, `${n} Bilder, ${bad} falsch ${worst}`);
  const seen = new Set(rec.filter(r => r.n >= 0).map(r => r.n));
  ok('jede Silbe(ngruppe) einmal hervorgehoben', seen.size >= 16, [...seen].join(','));
  ok('Zeilenwechsel: alle 3 Zeilen gezeigt', new Set(rec.map(r => r.a)).size >= 3, [...new Set(rec.map(r => r.a))].join(' | '));
  // An/Aus, gemerkt
  await p.evaluate(() => SYNQUENZER.lyToggle(false)); await sleep(600);
  L = await p.evaluate(() => SYNQUENZER.lyBar());
  ok('Knopf: aus → schmale Leiste, Text weg', L.off && !L.on);
  const kbOff = await p.evaluate(() => document.getElementById('kb').getBoundingClientRect().height);
  await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000}); await sleep(400);
  ok('Wahl gemerkt (uiPrefs)', await p.evaluate(() => JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => /ui/i.test(k) && /lyBar/.test(localStorage.getItem(k))) || 'x') || '{}').lyBar === false && SYNQUENZER.lyBar().on === false));
  await p.evaluate(() => SYNQUENZER.lyToggle(true)); await sleep(100);
  ok('Konsole (1)', !H.errs.length, H.errs.join('|').slice(0, 300));
  await H.close();
}

// ---------- 2. Vorzähler + Einsingen über einen Take mit Text → Vorlage ----------
{
  const H = await open(FILE, {viewport: {width: 428, height: 926}}), p = H.p;
  const x = await takeWithText(p);
  await sleep(300);
  await p.evaluate(s => { SYNQUENZER.selectSlot(s, 0); SYNQUENZER.rec(); }, x.st);
  await p.waitForFunction(() => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb > -3.5; }, null, {timeout: 10000});
  const L = await p.evaluate(() => Object.assign(SYNQUENZER.lyBar(), {st: SYNQUENZER.runtime().rec.state}));
  ok('Vorzähler zeigt die erste Zeile (Vorlage)', L.a === 'Liebe ist ein Feuer' && L.now == null && L.vorl, JSON.stringify(L));
  await p.screenshot({path: SHOT + 'P-vorzaehler.png'});
  await waitBeat(p, 1.15);
  const L2 = await p.evaluate(() => Object.assign(SYNQUENZER.lyBar(), {st: SYNQUENZER.runtime().rec.state}));
  ok('beim Einsingen läuft die Vorlage synchron', L2.now === 'Lie' && L2.vorl, JSON.stringify(L2));
  await p.screenshot({path: SHOT + 'P-einsingen.png'});
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(800);
  ok('Konsole (2)', !H.errs.length, H.errs.join('|').slice(0, 300));
  await H.close();
}

// ---------- 3. Song: song.vox, Quantisieren verschiebt mit, Rolle + G2 zeigen Silben ----------
{
  const H = await open(FILE, {viewport: {width: 428, height: 926}}), p = H.p;
  const x = await takeWithText(p, {song: true});
  await p.evaluate(() => SYNQUENZER.stimmeStop('aus'));
  await p.evaluate(() => { const a = S.tracks[stimmeT()].clips[0].audio, s = SYNQUENZER.song(); s.vox = [Object.assign({}, deep(a), {id: 'V1', bar: 2, len: 4})]; SYNQUENZER.setSong(s); });
  await p.evaluate(() => { SYNQUENZER.songView(true); SYNQUENZER.songPlay(0); });
  await waitBeat(p, 8 + 2.3);
  const L = await p.evaluate(() => SYNQUENZER.lyBar());
  ok('Song: Take im Song (Takt 3) – Silbe an der Song-Stelle', L.now === 'ist', JSON.stringify(L));
  await p.screenshot({path: SHOT + 'P-song.png'});
  await p.evaluate(() => SYNQUENZER.songPlay(false)); await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
  const sn = await p.evaluate(() => SYNQUENZER.lyNotes(null));
  ok('Song-Melodie: Silben-Lage stimmt (Zuordnung über Zeit, keine Noten → leer)', Array.isArray(sn), JSON.stringify(sn).slice(0, 120));
  await p.evaluate(() => SYNQUENZER.songView(false));
  // Quantisieren: Silben folgen der Zeitkarte (wie gehört)
  const h0 = (await p.evaluate(() => { SYNQUENZER.selectSlot(stimmeT(), 0); SYNQUENZER.play(); return 0; }), await waitBeat(p, .5), await p.evaluate(() => SYNQUENZER.lyPrep().hs));
  await p.evaluate(() => SYNQUENZER.stop());
  await p.evaluate(id => { const m = S.takes[id]; m.marks = m.marks.map((k, i) => Object.assign({}, k, {t: +(k.t + (i % 2 ? .11 : -.07)).toFixed(6)})); }, x.id);   // gesungen ungenau
  await p.evaluate(id => SYNQUENZER.g9SetAsync(id, {op: 'text', text: 'Lie-be ist ein Feu-er\nbrennt in mir die gan-ze Nacht\nund ich sing da-von', lang: 'de'}), x.id);
  await p.evaluate(() => { SYNQUENZER.selectSlot(stimmeT(), 0); SYNQUENZER.play(); }); await waitBeat(p, .5);
  const hj = await p.evaluate(() => SYNQUENZER.lyPrep().hs); await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
  await p.evaluate(() => SYNQUENZER.wpQuantize({t: stimmeT(), s: 0}, {grid: '1/4'}));
  await p.waitForFunction(id => { const i = SYNQUENZER.wpInfo(id); return i.warp && i.ready; }, x.id, {timeout: 30000}).catch(() => {});
  await sleep(700);
  await p.evaluate(() => { SYNQUENZER.selectSlot(stimmeT(), 0); SYNQUENZER.play(); }); await waitBeat(p, .5);
  const q = await p.evaluate(id => { const P = SYNQUENZER.lyPrep(), m = S.takes[id], a = S.tracks[stimmeT()].clips[0].audio; let mp = null; try { mp = tkHeardMap(id, a); } catch (e) {} return {mk: mp ? m.marks.map(k => VSM.warpTime(mp, k.t)) : [], t0: m.warp ? m.warp.t0 : wpT0(id, a), hs: P.hs, map: P.map, exp: mp ? m.ly.s.map(y => VSM.warpTime(mp, y.t)) : null, sp: spb(), a: a.in, at: a.at}; }, x.id);
  await p.evaluate(() => SYNQUENZER.stop());
  const mv = q.hs.filter((h, i) => Math.abs(h - hj[i]) > .02).length, mkOn = q.hs.filter(h => q.mk.some(k => Math.abs(k - h) < 1e-6)).length;
  ok('Quantisieren: Silben-Zeiten = Zeitkarte, die klingt', q.map && q.exp && q.hs.every((h, i) => Math.abs(h - q.exp.filter(e => e >= q.a - .05)[i]) < 1e-6), JSON.stringify({map: q.map, h: q.hs.slice(0, 4), e: q.exp && q.exp.slice(0, 4)}));
  ok('Quantisieren verschiebt mit (Silben wandern mit ihren Marken)', mv >= 8 && mkOn === q.hs.length, mv + '/' + q.hs.length + ' verschoben, ' + mkOn + ' auf der gehörten Marke · Schläge ' + q.hs.map(h => ((h - q.t0) / q.sp).toFixed(2)).join(' '));
  // Rolle: Noten an Silben-Zeiten; G5-Feld sy geht vor
  await p.evaluate(() => { const P = SYNQUENZER.lyPrep(), a = S.tracks[stimmeT()].clips[0].audio, sp = spb(); const bs = [...new Set(P.hs)].map(h => a.at + (h - a.in) / sp); SYNQUENZER.setClip(5, 0, {len: 4, notes: bs.map((b, k) => ({t: Math.round(b * 4) / 4, d: .5, n: 64 + (k % 5), v: .8}))}); });
  const rn = await p.evaluate(() => SYNQUENZER.lyNotes(0));
  ok('Rolle MELODIE: Silben an den Noten (Zuordnung über Zeit)', rn.length >= 15 && rn[0].x === 'Liebe' && rn[1].x === 'ist', rn.map(r => r.x).join(' '));
  await p.evaluate(() => SYNQUENZER.openRoll(5, 0)); await sleep(700);
  await p.screenshot({path: SHOT + 'P-rolle.png'});
  await p.evaluate(() => SYNQUENZER.closeRoll()); await sleep(300);
  await p.evaluate(() => { const c = SYNQUENZER.getClip(5, 0); c.notes[0].sy = 'Hal'; SYNQUENZER.setClip(5, 0, c); });
  const rs = await p.evaluate(() => SYNQUENZER.lyNotes(0));
  ok('gespeicherte Silbe (sy, aus G5) bleibt beim Laden und geht vor', rs.length >= 1 && rs[0].x === 'Hal' && rs[0].sy === 'Hal', JSON.stringify(rs).slice(0, 100));
  // G2: Tonhöhen-Editor zeigt Silben unter den Blöcken
  await p.evaluate(id => { const P = SYNQUENZER.lyPrep(); S.takes[id].pitch = {v: 1, q: false, str: 1, mode: 'soft', key: {root: 0, scale: 'ionian'}, notes: [...new Set(P.hs)].map((h, k) => ({t0: h, t1: h + .4, m: 60 + (k % 5)}))}; }, x.id);
  await p.evaluate(() => SYNQUENZER.g2Open()); await sleep(1200);
  const g2 = await p.evaluate(() => SYNQUENZER.lyG2());
  ok('G2: Silben an den Blöcken', g2 && g2.length >= 15 && g2[0].x === 'Liebe', JSON.stringify(g2 && g2.slice(0, 3)));
  await p.screenshot({path: SHOT + 'P-g2.png'});
  await p.evaluate(() => SYNQUENZER.g2Close());
  ok('Konsole (3)', !H.errs.length, H.errs.join('|').slice(0, 300));
  await H.close();
}

// ---------- 4. Layout P/L: nichts verdeckt, Tasten unter der Leiste; Leistung ----------
for (const [w, h, nm] of [[428, 926, 'P'], [926, 428, 'L'], [390, 844, 'P390'], [320, 568, 'P320'], [844, 390, 'L844']]) {
  const H = await open(FILE, {viewport: {width: w, height: h}}), p = H.p;
  const x = await takeWithText(p);
  await p.evaluate(() => SYNQUENZER.stimmeStop('aus')); await sleep(600);
  await p.evaluate(s => { SYNQUENZER.selectSlot(s, 0); SYNQUENZER.play(); }, x.st); await waitBeat(p, 2.3);
  const r = await p.evaluate(() => {
    const B = document.getElementById('lyBar').getBoundingClientRect(), K = document.getElementById('kb').getBoundingClientRect(), hit = [];
    for (const e of document.querySelectorAll('button,[role=button],.slot,.th,input,#kb,#pads')) { if (e.closest('#lyBar')) continue; const q = e.getBoundingClientRect(); if (!q.width || !q.height || getComputedStyle(e).visibility === 'hidden') continue; const cs = getComputedStyle(e); if (cs.display === 'none') continue;
      if (q.left < B.right - 1 && q.right > B.left + 1 && q.top < B.bottom - 1 && q.bottom > B.top + 1) hit.push((e.id || e.className) + '@' + [q.left, q.top, q.width, q.height].map(Math.round)); }
    const A = document.getElementById('lyA'), fs = parseFloat(getComputedStyle(A).fontSize);
    return {B: [B.left, B.top, B.width, B.height].map(Math.round), kbTop: Math.round(K.top), kbH: Math.round(K.height), hit, fs, over: A.scrollWidth > A.clientWidth + 1, el: document.elementFromPoint(B.left + B.width / 2, B.top + B.height / 2).closest('#lyBar') != null};
  });
  ok(nm + ': Leiste deckt nichts (keine Taste/kein Knopf darunter) und liegt oben', !r.hit.length && r.el && r.kbTop >= r.B[1] + r.B[3], JSON.stringify(r));
  ok(nm + ': lesbar groß (≥ 17 px), Tasten bleiben bedienbar (≥ 80 px)', r.fs >= 17 && r.kbH >= 80, 'Schrift ' + r.fs + ' px, Tasten ' + r.kbH + ' px');
  await p.screenshot({path: SHOT + nm + '-abspielen.png'});
  if (nm === 'P') {
    // Leistung: CPU 4× gedrosselt, lyFrame-Zeit je Bild + DOM-Änderungen nur bei Silbenwechsel
    const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
    await p.evaluate(() => { const f = window.lyFrame; window.__lt = []; window.lyFrame = b => { const t = performance.now(); try { return f(b); } finally { window.__lt.push(performance.now() - t); } }; window.__mut = 0; new MutationObserver(ms => { window.__mut++; }).observe(document.getElementById('lyBar'), {subtree: true, childList: true, attributes: true, characterData: true}); });
    await sleep(3000);
    const m = await p.evaluate(() => { const a = window.__lt.slice().sort((x, y) => x - y); return {n: a.length, med: a[a.length >> 1], p95: a[Math.floor(a.length * .95)], max: a[a.length - 1], mut: window.__mut}; });
    ok('Leistung (CPU 4×): lyFrame ≤ 1 ms je Bild (95 %)', m.n > 30 && m.p95 <= 1, JSON.stringify(m));
    await p.evaluate(() => SYNQUENZER.stop()); await sleep(800);
    await p.evaluate(() => { window.__mut = 0; }); await sleep(2000);
    const m2 = await p.evaluate(() => ({mut: window.__mut, n: window.__lt.length}));
    ok('kein Neuzeichnen ohne Änderung (gestoppt, 2 s: 0 DOM-Änderungen)', m2.mut === 0, JSON.stringify(m2));
    await cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
    console.log('MESS', JSON.stringify(m));
  }
  await p.evaluate(() => SYNQUENZER.stop());
  ok(nm + ': Konsole', !H.errs.length, H.errs.join('|').slice(0, 300));
  await H.close();
}
// ---------- 5. Ohne Text: keine Leiste, Tasten wie vorher ----------
{
  const H = await open(FILE, {viewport: {width: 428, height: 926}}), p = H.p;
  await p.evaluate(() => { switchProject(demoProject(), {first: true}); SYNQUENZER.tkAddTrack(); }); await sleep(800);
  ok('ohne Songtext: keine Leiste, Tastatur unverändert', await p.evaluate(() => !SYNQUENZER.lyBar().shown && !document.getElementById('kbArea').classList.contains('ly')));
  await H.close();
}
ok.sum(); await closeAll();
