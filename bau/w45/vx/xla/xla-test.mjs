// XLA – DAW-Projekt (.cbp) öffnen, Fassung A, Schritt 1: Gesamt-Test (Playwright, Touch, echter Datei-Wähler).
// Nur synthetische .cbp (Kopien aus vx/cbpimp/tests). iPhone 12 Pro Max hochkant 428×926 und quer 926×428, dazu 320 px.
// Geprüft: Einstieg (Menü-Untertitel, Hinweis, Guide), Datei wählen per Touch → eigenes Blatt, Worker, keine Long Task, Teile farbig
// (gleiche Farbe = gleiche Szene), Name ändern, „Gleiche Szene wie“ / „Eigene Szene“, Wahl Als Song / In Szenen / Beides,
// Abbrechen ändert nichts, Passt → neues Projekt (Song exakt gegen den Kern in Node, MELODIE auf Index 5, DRUMS auf 4), Wiedergabe
// (noteLog), voriges Projekt unverändert unter Projekte, ein ↶ zurück / ↷ wieder, Speichern/Laden bitgleich, Fassung A mit 12 Spuren
// (ehrliche Liste, Auswahl ändern, Grenze), Fehlerfälle, Rückfall ohne Worker, MIDI-Weg unverändert, Worker endet nach 20 s, Fotos.
// Aufruf: node xla-test.mjs <index.html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const file = path.resolve(process.argv[2]), here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(here, 'fotos');
const C = require(path.join(here, 'xla-core.js'));
fs.mkdirSync(fotos, {recursive: true});
const TF = f => path.join(here, 'tests', f), U8 = f => new Uint8Array(fs.readFileSync(TF(f)));
let bad = 0, good = 0; const out = [];
const ok = (c, m, d) => { const s = (c ? 'OK ' : 'FEHLER ') + m + (d != null && d !== '' ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : ''); if (!c) bad++; else good++; out.push(s); console.log(s); };
const info = m => { out.push('INFO ' + m); console.log('INFO ' + m); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [];
async function page(w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  p.cdp = await p.context().newCDPSession(p);
  return p;
}
const tch = (p, type, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
async function tap(p, x, y) { await tch(p, 'touchStart', x, y); await p.waitForTimeout(50); await tch(p, 'touchEnd'); await p.waitForTimeout(220); }
const ctr = (p, sel, k) => p.evaluate(([s, k]) => { const L = [...document.querySelectorAll(s)].filter(e => e.offsetParent); const e = L[k || 0]; if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, [sel, k]);
async function tapSel(p, sel, k) { const c = await ctr(p, sel, k); if (!c) return false; await tap(p, c.x, c.y); return true; }
const tapText = async (p, sel, txt) => { const k = await p.evaluate(([s, t]) => [...document.querySelectorAll(s)].filter(e => e.offsetParent).findIndex(e => e.textContent.trim().startsWith(t)), [sel, txt]); return k >= 0 ? tapSel(p, sel, k) : false; };
const cur = p => p.evaluate(() => { const c = window.__xla.cur(); if (!c) return null; return {st: c.st, err: c.err, mode: c.mode, on: [...c.on], building: !!c.building, res: !!c.res, sel: c.sel, scenes: c.res ? c.res.scenes.map(s => s.name) : null, songNull: c.res ? c.res.song === null : null, gone: c.res ? c.res.report.gone : null, own: c.res ? c.res.need.own : null}; });
async function ready(p, ms) { for (let k = 0; k < (ms || 8000) / 100; k++) { await p.waitForTimeout(100); const c = await cur(p); if (c && (c.st === 'fehler' || (c.st === 'fertig' && c.res && !c.building))) return c; } return cur(p); }
const toastText = p => p.evaluate(() => EL.toast && !EL.toast.hidden ? EL.toast.textContent.trim() : '');
// Maße im offenen Blatt: ✕ sichtbar, Tasten ≥ 44, nichts außerhalb, keine Überlappung
const measure = p => p.evaluate(() => {
  const P = UI.pop.el, r = P.getBoundingClientRect(), vis = e => e.offsetParent && e.getClientRects().length;
  const bt = [...P.querySelectorAll('button, summary')].filter(vis), small = bt.filter(b => { const q = b.getBoundingClientRect(); return q.height < 43.5 || q.width < 43.5; }).map(b => b.textContent.trim().slice(0, 16));
  const x = [...P.querySelectorAll('button')].find(b => /✕/.test(b.textContent) || b.getAttribute('aria-label') === 'Schließen'), xr = x && x.getBoundingClientRect();
  const items = [...P.querySelectorAll('button, input, summary, .imp1st, .xlainfo, .xlabar, .lbl')].filter(vis);
  const outside = items.filter(e => { const q = e.getBoundingClientRect(); return q.right > innerWidth + .5 || q.left < -.5; }).length;
  const ov = []; for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) { const a = items[i], c = items[j]; if (a.contains(c) || c.contains(a)) continue;
    const A = a.getBoundingClientRect(), B = c.getBoundingClientRect(), w = Math.min(A.right, B.right) - Math.max(A.left, B.left), h = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
    if (w > 1 && h > 1) ov.push((a.textContent || a.tagName).trim().slice(0, 12) + '×' + (c.textContent || c.tagName).trim().slice(0, 12)); }
  return {pop: [r.left, r.top, r.width, r.height].map(Math.round), xVis: !!xr && xr.top >= 0 && xr.bottom <= innerHeight && xr.right <= innerWidth + .5 && xr.left >= -.5, small: small.slice(0, 5), out: outside, ov: ov.slice(0, 5), hscroll: document.documentElement.scrollWidth > innerWidth + 1, n: items.length};
});
const layoutOk = (m, w) => m.xVis && !m.small.length && !m.out && !m.ov.length && m.pop[0] >= 0 && m.pop[0] + m.pop[2] <= w + .5 && !m.hscroll;
// Song so abspielen, wie der Synquenzer ihn liest (wie im Kern-Test), aus den App-Daten S
const renderApp = p => p.evaluate(() => {
  const bb = S.ts ? tsBeats(S.ts) : 4, outN = [];
  S.song.lanes.forEach((lane, ti) => { const tr = S.tracks[ti]; if (!tr) return;
    for (let k = 0; k < lane.length; k++) { const e = lane[k]; if (e.slot < 0) continue;
      const end = (k + 1 < lane.length ? lane[k + 1].bar : S.song.bars) * bb, st = e.bar * bb, c = e.own ? S.song.own[e.own] : tr.clips[e.slot]; if (!c) continue;
      const L = c.len * bb; for (let s = st; s < end - 1e-9; s += L) for (const n of c.notes) if (s + n.t < end - 1e-9) outN.push(ti + ':' + (+(s + n.t).toFixed(3)) + ':' + n.n + ':' + n.d + ':' + n.v); } });
  return outN.sort();
});
function renderCore(P) {
  const bb = (C.read ? 4 : 4), o = [];
  P.song.lanes.forEach((lane, ti) => { const tr = P.tracks[ti]; if (!tr) return;
    for (let k = 0; k < lane.length; k++) { const e = lane[k]; if (e.slot < 0) continue;
      const end = (k + 1 < lane.length ? lane[k + 1].bar : P.song.bars) * bb, st = e.bar * bb, c = e.own ? P.song.own[e.own] : tr.clips[e.slot]; if (!c) continue;
      const L = c.len * bb; for (let s = st; s < end - 1e-9; s += L) for (const n of c.notes) if (s + n.t < end - 1e-9) o.push(ti + ':' + (+(s + n.t).toFixed(3)) + ':' + n.n + ':' + n.d + ':' + n.v); } });
  return o.sort();
}
const coreFor = (f, opts) => { const m = C.read(U8(f)), P = C.parts(m, {}); return C.toProject(m, P, opts); };
const sameArr = (a, b) => a.length === b.length && a.every((x, k) => x === b[k]);
async function openImport(p, shot) {
  await p.evaluate(() => { closePop(); va1Sheet(); }); await p.waitForTimeout(300);
  if (shot) { await p.evaluate(() => { const x = document.querySelector('button[data-va="midiin"]'); if (x) x.scrollIntoView({block: 'center'}); }); await p.screenshot({path: path.join(fotos, shot)}); }
  const sub = await p.evaluate(() => { const x = document.querySelector('button[data-va="midiin"]'); return x ? x.textContent : ''; });
  await tapSel(p, 'button[data-va="midiin"]'); await p.waitForTimeout(300);
  return {open: await p.evaluate(() => !!(UI.pop && UI.pop.name === 'imp1')), sub, st: await p.evaluate(() => { const e = document.querySelector('.imp1 .imp1st'); return e ? e.textContent : ''; })};
}
async function pick(p, f) {
  const fc = p.waitForEvent('filechooser', {timeout: 5000});
  const sel = await p.evaluate(() => UI.pop && UI.pop.name === 'xla' ? '.xla button[data-x="pick"]' : '.imp1 button[data-i="pick"]');
  await tapSel(p, sel);
  const ch = await fc.catch(() => null); if (!ch) return null;
  await ch.setFiles({name: f, mimeType: 'application/octet-stream', buffer: fs.readFileSync(TF(f))});
  return ready(p);
}
const T0 = Date.now();

/* ===== 1. Einstieg ===== */
const p = await page(428, 926);
// voriges Projekt: Demo, umbenannt und Tempo geändert (nicht „unberührt“, wird also gesichert)
await p.evaluate(() => { applyProject(normalizeProject(demoProjectRaw()), {}); S.name = 'Vorher-Projekt'; setBpm(97); markDirty(); });
await p.waitForTimeout(1500);
const prev = await p.evaluate(() => ({id: S.id, ser: serialize(), name: S.name, undo: UNDO.length}));
const e1 = await openImport(p, 'xla-p-menue.png');
ok(e1.open && /\.cbp/.test(e1.sub) && /DAW-Projekt \(\.cbp\)/.test(e1.st), 'Einstieg: Menü › Export › Audio/MIDI importieren (Untertitel „· .cbp“), Hinweis im Blatt nennt DAW-Projekt (.cbp)', {sub: e1.sub.trim(), st: e1.st.slice(0, 70)});
const gd = await p.evaluate(() => { const e = ui1Entries().find(x => x.id === 'xla'); if (!e) return null; closePop(); const r = e.go(); return {n: e.n, w: e.w, open: !!(UI.pop && UI.pop.name === 'imp1'), find: !!ui1Find(e.q), r}; });
ok(gd && gd.open && gd.find && /DAW-Projekt \(\.cbp\) öffnen/.test(gd.n), 'Guide-Eintrag „DAW-Projekt (.cbp) öffnen“: öffnet das Import-Blatt und zeigt auf „Datei wählen“', gd);

/* ===== 2. Datei wählen per Touch → eigenes Blatt (Worker, keine Long Task; die Klang-Maschine der App startet beim ersten Tippen – sie ist vorher fertig) ===== */
await p.evaluate(async () => { ensureAudio(); await new Promise(r => setTimeout(r, 2500)); if (autosave) await autosave.flush(); window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({type: 'longtask', buffered: false}); } catch (e) {} });
let c = await pick(p, 'synth-song.cbp');
const last = await p.evaluate(() => ({last: window.__xla.last(), worker: window.__xla.worker(), name: UI.pop && UI.pop.name, lt: window.__lt.slice()}));
ok(c && c.st === 'fertig' && last.name === 'xla' && last.worker && last.last.worker, 'Datei per Touch gewählt → Blatt „DAW-Projekt öffnen“, gerechnet im Worker', {st: c && c.st, last: last.last});
ok(!last.lt.some(d => d > 50), 'keine Long Task > 50 ms im Hauptfaden beim Lesen + Rechnen', last.lt);
const ui1 = await p.evaluate(() => {
  const ch = [...document.querySelectorAll('.xla button[data-x="part"]')].map(b => ({t: b.textContent.trim(), c: getComputedStyle(b).borderLeftColor}));
  const bar = document.querySelectorAll('.xla .xlabar i').length, on = [...document.querySelectorAll('.xla .imp1g .mbtn.on:is([data-x="song"],[data-x="szenen"],[data-x="beides"])')   /* Schritt 2: zweite Wahl-Gruppe „Transponieren“ */].map(b => b.dataset.x);
  return {ch, bar, on, info: [...document.querySelectorAll('.xla .xlainfo')].map(e => e.textContent)};
});
const col = n => ui1.ch.filter(x => x.t.startsWith(n)).map(x => x.c);
ok(ui1.ch.length === 8 && ui1.bar === 8 && new Set(col('Strophe')).size === 1 && new Set(col('Refrain')).size === 1 && new Set(col('Intro')).size === 1 && col('Refrain')[0] !== col('Strophe')[0],
  'Teile farbig von links nach rechts: 8 Teile, gleiche Teile gleiche Farbe (Strophe ×2, Refrain ×3, Intro = Outro)', ui1.ch.map(x => x.t));
ok(ui1.on.length === 1 && ui1.on[0] === 'beides' && /8 Teile → 4 Szenen/.test(ui1.info.join(' ')), 'Standard „Beides (empfohlen)“ vorgewählt · „8 Teile → 4 Szenen“', ui1.info[0]);
let m = await measure(p);
ok(layoutOk(m, 428), 'Blatt hochkant 428×926: ✕ sichtbar, Tasten ≥ 44, nichts außerhalb, keine Überlappung', m);
await p.evaluate(() => { UI.pop.el.scrollTop = 0; }); await p.screenshot({path: path.join(fotos, 'xla-p-blatt.png')});

/* ===== 3. Teile bearbeiten: Name, gleiche Szene wie, eigene Szene ===== */
await tapText(p, '.xla button[data-x="part"]', 'Refrain');
const inp = await p.evaluate(() => !!document.querySelector('.xla input.xlanm'));
await p.evaluate(() => { const i = document.querySelector('.xla input.xlanm'); i.value = 'Hook'; i.dispatchEvent(new Event('change', {bubbles: true})); });
c = await ready(p);
ok(inp && c.scenes.includes('Hook') && !c.scenes.includes('Refrain') && (await p.evaluate(() => [...document.querySelectorAll('.xla button[data-x="part"]')].filter(b => b.textContent.startsWith('Hook')).length)) === 3,
  'Name ändern: „Refrain“ → „Hook“ gilt für alle drei Refrains (Szene + Knöpfe)', c.scenes);
await tapText(p, '.xla button[data-x="part"]', 'Bridge');
await tapText(p, '.xla button[data-x="same"]', 'Hook');
c = await ready(p);
const sameCol = await p.evaluate(() => { const L = [...document.querySelectorAll('.xla button[data-x="part"]')]; const g = n => getComputedStyle(L.find(b => b.textContent.startsWith(n))).borderLeftColor; return g('Bridge') === g('Hook'); });
ok(c.scenes.filter(Boolean).length === 3 && sameCol, '„Gleiche Szene wie Hook“ für Bridge: 3 Szenen, Bridge hat die Farbe von Hook', c.scenes);
await tapSel(p, '.xla button[data-x="own"]'); c = await ready(p);
ok(c.scenes.filter(Boolean).length === 4, '„Eigene Szene“: Bridge wieder eigene Szene (4)', c.scenes);

/* ===== 4. Wahl Als Song / In Szenen / Beides ===== */
await tapSel(p, '.xla button[data-x="song"]'); c = await ready(p);
const songInfo = await p.evaluate(() => document.querySelector('.xla .xlainfo').textContent);
ok(c.mode === 'song' && c.scenes.every(x => !x) && /Marken im Song/.test(songInfo), 'Wahl „Als Song“: keine Szenen, Teile als Marken', songInfo);
await tapSel(p, '.xla button[data-x="szenen"]'); c = await ready(p);
ok(c.mode === 'szenen' && c.songNull === true && c.scenes.filter(Boolean).length === 4, 'Wahl „In Szenen“: Song leer, 4 Szenen', c.scenes);
await tapSel(p, '.xla button[data-x="beides"]'); c = await ready(p);
ok(c.mode === 'beides' && c.songNull === false, 'Wahl „Beides“ wieder vorgewählt');

/* ===== 5. Abbrechen ändert nichts ===== */
if (!(await tapSel(p, '.pop.xla button.psh-x'))) await p.evaluate(() => closePop());
await p.waitForTimeout(300);
const ab = await p.evaluate(() => ({ser: serialize(), undo: UNDO.length, pop: UI.pop && UI.pop.name, id: S.id}));
ok(ab.ser === prev.ser && ab.undo === prev.undo && ab.id === prev.id && ab.pop !== 'xla', 'Abbrechen (✕): das offene Projekt ist unverändert, kein ↶-Eintrag');

/* ===== 6. „Datei öffnen“ mit .cbp → dasselbe Blatt; Passt → neues Projekt ===== */
await p.evaluate(b => onFilePicked(new File([Uint8Array.from(b)], 'Mein Song.cbp')), [...U8('synth-song.cbp')]);
c = await ready(p);
ok(c && c.st === 'fertig' && (await p.evaluate(() => UI.pop && UI.pop.name)) === 'xla', '„Datei öffnen“ mit einer .cbp führt in dasselbe Blatt');
await tapText(p, '.xla button[data-x="part"]', 'Refrain');
await p.evaluate(() => { const i = document.querySelector('.xla input.xlanm'); i.value = 'Hook'; i.dispatchEvent(new Event('change', {bubbles: true})); });
c = await ready(p);
const optsB = await p.evaluate(() => JSON.parse(JSON.stringify(xlaOpts(window.__xla.cur()))));
await p.evaluate(async () => { if (autosave) await autosave.flush(); window.__lt.length = 0; });
await tapSel(p, '.xla button[data-x="ok"]'); await p.waitForTimeout(1500);
const ltOk = await p.evaluate(() => window.__lt.slice());
ok(!ltOk.some(d => d > 100), 'Passt: keine Long Task > 100 ms (Ziel 50 ms; Einzelmessung lt-mess.mjs, hier geteilte CPU)', ltOk);
if (ltOk.some(d => d > 50)) info('Passt: Long Task ' + ltOk.join('/') + ' ms unter Last (geteilte CPU) – Einzelmessung siehe lt-mess.mjs');
const A = await p.evaluate(async () => ({id: S.id, name: S.name, nt: S.tracks.length, tr: S.tracks.map(t => ({n: t.name, k: t.kind, f: t.follow, os: t.os, mel: !!t.mel, clips: t.clips.filter(Boolean).length, eng: t.sound && t.sound.engine})),
  scenes: S.scenes.map(s => s.name), bars: S.song && S.song.bars, marks: S.song && S.song.marks.map(m => m.name + ':' + m.part), own: S.song ? Object.keys(S.song.own).length : 0, undo: UNDO.map(u => u.kind + ':' + u.label),
  sv: !!UI.songView, pop: UI.pop && UI.pop.name, bpm: S.bpm, ts: S.ts || '4/4', key: S.key, parked: (await projIndexLoad()).map(x => x.id)}));
const tst = await toastText(p);
ok(A.id !== prev.id && A.name === 'Mein Song' && A.pop !== 'xla' && /DAW-Projekt geöffnet · 4 Szenen · Song 52 Takte/.test(tst), 'Passt → neues Projekt „Mein Song“, Meldung mit Szenen und Song-Länge', tst);
ok(A.tr[0].n === 'Bass' && A.tr[4].k === 'drum' && A.tr[4].n === 'Beat' && A.tr[5].n === 'Melodie' && A.tr[5].mel && A.tr[1].n === 'Akkorde-Synth' && A.nt === 6,
  'Plätze: Bass auf 1, DRUMS auf Index 4, die Melodie auf Index 5 (MELODIE-Spur, mel)', A.tr.map(t => t.n + (t.mel ? '*' : '')));
ok(A.tr.filter(t => t.k === 'synth' && t.clips).every(t => t.f === false && t.os === false), 'importierte Spuren: ⇅ fest, Eine Skala aus (Noten exakt)');
ok(sameArr(A.scenes.slice(0, 4), ['Intro', 'Strophe', 'Hook', 'Bridge']) && A.bars === 52 && A.marks.length === 8 && A.marks.every(x => /:S[1-4]$/.test(x)) && A.sv,
  'Szenen Intro/Strophe/Hook/Bridge, Song 52 Takte mit 8 Teil-Marken, Song-Editor offen (links → rechts)', {scenes: A.scenes.slice(0, 4), marks: A.marks.slice(0, 3)});
const appN = await renderApp(p), coreN = renderCore(coreFor('synth-song.cbp', optsB));
ok(appN.length === 894 && sameArr(appN, coreN), 'Song in der App Note für Note = Kern (und Kern = Original, Node-Test): 894 Noten', {app: appN.length, core: coreN.length});
ok(sameArr(A.undo, ['xla:DAW-Projekt öffnen']), 'genau ein ↶-Eintrag „DAW-Projekt öffnen“', A.undo);
const pk = await p.evaluate(async id => { const fo = await kv.get('proj:' + id); return fo && fo.project ? JSON.stringify(Object.assign({}, fo, {saved: 0}).project) : null; }, prev.id);
const prevProj = JSON.stringify(JSON.parse(prev.ser).project);
ok(A.parked.includes(prev.id) && pk === prevProj, 'voriges Projekt liegt unverändert unter Projekte (Inhalt gleich)', {parked: A.parked.length});
await p.screenshot({path: path.join(fotos, 'xla-p-song.png')});

/* ===== 7. Wiedergabe: der Song klingt (noteLog) ===== */
const off = await p.evaluate(() => { ensureAudio(); clearLog(); SYNQUENZER.songPlay(4); return R.songPlay ? R.songPlay.off : null; });   // ab Takt 5 (Strophe: alle Spuren)
await p.waitForTimeout(4800);
const lg = await p.evaluate(() => { const L = noteLog(4096); SYNQUENZER.stop(); return L.map(e => ({t: e.track, b: e.beat, n: e.clipNote, src: e.src})); });
const exp8 = coreN.map(s => s.split(':')).filter(x => +x[1] >= 16 && +x[1] < 23.5);
const got8 = lg.filter(e => e.b != null && e.b - off >= 16 - 1e-6 && e.b - off < 23.5);
const cnt = L => { const o = {}; for (const x of L) o[x] = (o[x] || 0) + 1; return o; };
const ce = cnt(exp8.map(x => x[0])), cg = cnt(got8.map(e => String(e.t)));
ok(off != null && got8.length > 0 && Object.keys(ce).length >= 3 && Object.keys(ce).every(k => ce[k] === cg[k]) && Object.keys(cg).every(k => ce[k] === cg[k]), 'Wiedergabe ab Takt 5: in zwei Takten spielt jede Spur genau die erwarteten Noten (noteLog)', {erwartet: ce, gespielt: cg});

/* ===== 8. ↶ zurück, ↷ wieder ===== */
const impSer = await p.evaluate(() => serialize());
await p.evaluate(() => undo()); await p.waitForTimeout(1200);
const U1 = await p.evaluate(async () => ({id: S.id, ser: serialize(), redo: REDO.map(r => r.kind), parked: (await projIndexLoad()).map(x => x.id), toast: EL.toast.textContent}));
ok(U1.id === prev.id && U1.ser === prev.ser && sameArr(U1.redo, ['xla']), '↶ (ein Schritt): das vorige Projekt ist wieder offen, bitgleich', {toast: U1.toast.slice(0, 60)});
ok(!U1.parked.includes(prev.id) && !U1.parked.includes(A.id), '↶: Projektliste ohne Doppel (voriges ist offen, der Import liegt nur im ↷)', U1.parked);
await p.evaluate(() => redo()); await p.waitForTimeout(1200);
const R1 = await p.evaluate(async () => ({id: S.id, ser: serialize(), undo: UNDO.map(r => r.kind), parked: (await projIndexLoad()).map(x => x.id)}));
ok(R1.id === A.id && R1.ser === impSer && sameArr(R1.undo, ['xla']) && R1.parked.includes(prev.id), '↷: der Import ist wieder offen (bitgleich), das vorige liegt wieder unter Projekte');
// Speichern/Laden bitgleich
const rt = await p.evaluate(() => { const s1 = serialize(); applyProject(projFromFile(JSON.parse(s1)), {ui: true}); return s1 === serialize(); });
ok(rt, 'importiertes Projekt: Speichern → Laden bitgleich');

/* ===== 9. Fassung A: 12 Spuren, ehrliche Liste, Auswahl ändern (quer 926×428) ===== */
await p.setViewportSize({width: 926, height: 428}); await p.waitForTimeout(400);
await openImport(p);
c = await pick(p, 'synth-12spuren.cbp');
const L12 = await p.evaluate(() => ({lanes: [...document.querySelectorAll('.xla button[data-x="lane"]')].map(b => ({t: b.querySelector('b').textContent, s: b.querySelector('small').textContent, on: b.classList.contains('on')})),
  info: [...document.querySelectorAll('.xla .xlainfo')].map(e => e.textContent).join(' | ')}));
const onL = L12.lanes.filter(x => x.on), offL = L12.lanes.filter(x => !x.on);
ok(L12.lanes.length === 9 && onL.length === 7 && offL.length === 2 && offL.every(x => /kommt mit dem Ausbau/.test(x.s)) && /kommen erst mit dem Ausbau/.test(L12.info) && /DRUMS: Beat/.test(L12.info),
  'Fassung A, 12 Spuren: ehrliche Liste – 7 Synth-Spuren übernommen (+ DRUMS), 2 „kommt mit dem Ausbau“', {an: onL.map(x => x.t), aus: offL.map(x => x.t)});
ok(onL.some(x => x.t === 'Bass') && onL.some(x => /^Melodie/.test(x.t)), 'wichtigste zuerst: Bass und Melodie sind dabei');
m = await measure(p);
ok(layoutOk(m, 926), 'Blatt quer 926×428: ✕ sichtbar, Tasten ≥ 44, nichts außerhalb, keine Überlappung', m);
await p.evaluate(() => { UI.pop.el.scrollTop = 99999; }); await p.waitForTimeout(150);
await p.screenshot({path: path.join(fotos, 'xla-l-spuren.png')});
await tapText(p, '.xla button[data-x="lane"]', offL[0].t); await p.waitForTimeout(200);
const full = await toastText(p);
await tapText(p, '.xla button[data-x="lane"]', 'Extra 1');
await tapText(p, '.xla button[data-x="lane"]', offL[0].t);
c = await ready(p);
const sel = await p.evaluate(() => [...document.querySelectorAll('.xla button[data-x="lane"].on')].map(b => b.querySelector('b').textContent));
ok(/Höchstens 7 Synth-Spuren/.test(full) && sel.includes(offL[0].t) && !sel.includes('Extra 1') && sel.length === 7, 'Auswahl ändern: Grenze meldet sich, „Extra 1“ ab, „' + offL[0].t + '“ an', {toast: full, sel});
const opts12 = await p.evaluate(() => JSON.parse(JSON.stringify(xlaOpts(window.__xla.cur()))));
await tapSel(p, '.xla button[data-x="ok"]'); await p.waitForTimeout(1500);
const A12 = await p.evaluate(() => ({nt: S.tracks.length, names: S.tracks.map(t => t.name), mel: S.tracks[5].name, d: S.tracks[4].kind, toast: EL.toast.textContent}));
const app12 = await renderApp(p), core12 = renderCore(coreFor('synth-12spuren.cbp', opts12));
ok(A12.nt === 8 && A12.names.includes(offL[0].t) && !A12.names.includes('Extra 1') && /^Melodie/.test(A12.mel) && A12.d === 'drum' && /Spuren noch ohne Platz/.test(A12.toast),
  '12 Spuren → 8 Spuren im Projekt wie gewählt, Melodie auf Index 5, Meldung nennt fehlende Spuren', A12);
ok(app12.length > 0 && sameArr(app12, core12), 'Song der gewählten Spuren exakt (App = Kern)', {app: app12.length});
await p.screenshot({path: path.join(fotos, 'xla-l-song.png')});

/* ===== 10. Als Song / In Szenen / Loop in der App ===== */
await p.setViewportSize({width: 428, height: 926}); await p.waitForTimeout(300);
for (const [f, mode] of [['synth-song.cbp', 'song'], ['synth-song.cbp', 'szenen'], ['synth-loop4.cbp', 'beides']]) {
  await p.evaluate(b => window.__xla.file(b, 'T'), [...U8(f)]); c = await ready(p);
  if (mode !== 'beides') { await tapSel(p, '.xla button[data-x="' + mode + '"]'); c = await ready(p); }
  const o = await p.evaluate(() => JSON.parse(JSON.stringify(xlaOpts(window.__xla.cur()))));
  await p.evaluate(() => window.__xla.apply()); await p.waitForTimeout(1200);
  const X = await p.evaluate(() => ({clips: S.tracks.reduce((a, t) => a + t.clips.filter(Boolean).length, 0), sc: S.scenes.map(s => s.name), song: !!(S.song && S.song.bars), own: S.song ? Object.keys(S.song.own).length : 0, marks: S.song ? S.song.marks.map(m => m.name + ':' + m.part) : [], sv: !!UI.songView}));
  if (mode === 'song') await p.screenshot({path: path.join(fotos, 'xla-p-alssong.png')});
  if (mode === 'song') { const a = await renderApp(p), k = renderCore(coreFor(f, o)); ok(X.clips === 0 && X.song && X.own > 0 && X.marks.length === 8 && X.marks.every(x => /:null$/.test(x)) && X.sv && sameArr(a, k) && a.length === 894, 'App „Als Song“: Szenen frei, Song aus eigenen Clips mit 8 Teil-Marken, exakt (894)', {own: X.own, marks: X.marks.slice(0, 2)}); }
  if (mode === 'szenen') ok(!X.song && X.clips > 0 && sameArr(X.sc.slice(0, 4), ['Intro', 'Strophe', 'Refrain', 'Bridge']) && !X.sv, 'App „In Szenen“: Song leer, 4 Szenen mit Clips, Matrix offen', X.sc.slice(0, 4));
  if (f === 'synth-loop4.cbp') ok(X.sc[0] === 'Loop' && X.sc.slice(1).every(n => /^Szene/.test(n)) && (await p.evaluate(() => S.tracks.every(t => t.clips.slice(1).every(x => !x)))), 'kleiner Loop → genau eine Szene „Loop“', X.sc.slice(0, 2));
}

/* ===== 11. Fehlerfälle, Rückfall ohne Worker, MIDI-Weg unverändert ===== */
const u = U8('synth-song.cbp');
await p.evaluate(b => window.__xla.file(b, 'kaputt'), [...u.subarray(0, 3000)]); c = await ready(p);
ok(c.st === 'fehler' && /unvollständig oder beschädigt/.test(c.err), 'abgeschnittene Datei → klare Meldung im Blatt', c.err);
await p.evaluate(() => { const x = new Uint8Array(400); x.set([0x99, 0x63, 0x33, 0x70, 0x0d, 0x0a, 0x1a, 0x0a]); for (let i = 8; i < 400; i++) x[i] = (i * 37) & 255; return window.__xla.file(x.buffer, 'muell'); }); c = await ready(p);
ok(c.st === 'fehler' && c.err.length < 160, 'Kennung richtig, Inhalt Unsinn → Meldung statt Absturz', c.err);
await p.evaluate(() => { const x = new Uint8Array(21 * 1048576); x.set([0x99, 0x63, 0x33, 0x70, 0x0d, 0x0a, 0x1a, 0x0a]); return window.__xla.file(x.buffer, 'gross'); }); c = await ready(p);
ok(c.st === 'fehler' && /zu groß/.test(c.err), 'über 20 MB → „Datei zu groß“', c.err);
await p.evaluate(() => closePop());
const nw = await p.evaluate(async b => { const W = window.Worker; try { if (XLA.w) XLA.w.terminate(); } catch (e) {} XLA.w = null; window.Worker = undefined; try { await window.__xla.file(b, 'ohne'); await window.__xla.build(); return {st: window.__xla.cur().st, last: window.__xla.last()}; } finally { window.Worker = W; } }, [...u]);
ok(nw.st === 'fertig' && nw.last.worker === false, 'ohne Worker: Kern im Hauptfaden, gleiches Blatt', nw);
await p.evaluate(() => closePop());
const mid = await p.evaluate(async () => {
  const trk = [0x00, 0x90, 60, 100, 0x60, 0x80, 60, 0, 0x00, 0xFF, 0x2F, 0x00];
  const b = [0x4D, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0, 96, 0x4D, 0x54, 0x72, 0x6B, 0, 0, 0, trk.length].concat(trk);
  const r = await imp1File(Uint8Array.from(b).buffer, 'mini.mid', null); return {r: !!r, pop: UI.pop && UI.pop.name, undo: UNDO.length ? UNDO[UNDO.length - 1].label : ''};
});
ok(mid.r && mid.pop !== 'xla' && /MIDI/.test(mid.undo), 'MIDI-Datei geht weiter den bisherigen Weg (nicht ins DAW-Blatt)', mid);

/* ===== 12. 320 px ===== */
await p.setViewportSize({width: 320, height: 640}); await p.waitForTimeout(300);
await p.evaluate(b => window.__xla.file(b, 'Schmal'), [...U8('synth-12spuren.cbp')]); await ready(p);
m = await measure(p);
ok(layoutOk(m, 320), 'Blatt bei 320 px: nichts außerhalb, Tasten ≥ 44, keine Überlappung, kein waagrechtes Rollen', m);
await p.evaluate(() => closePop());

/* ===== 13. Worker bleibt, solange das Blatt offen ist; endet 20 s nach dem Schließen ===== */
await p.setViewportSize({width: 428, height: 926}); await p.waitForTimeout(300);
await p.evaluate(b => window.__xla.file(b, 'Warten'), [...U8('synth-song.cbp')]); await ready(p);
await p.waitForTimeout(21500);
await tapSel(p, '.xla button[data-x="szenen"]'); c = await ready(p);
ok(c.st === 'fertig' && c.mode === 'szenen' && c.songNull === true, 'Blatt 21 s offen gelassen: Änderung rechnet weiter (Datei noch im Worker)', {st: c.st, err: c.err});
await p.evaluate(() => closePop());
await p.waitForTimeout(21500);
ok(!(await p.evaluate(() => window.__xla.worker())), 'Worker nach 20 s Ruhe beendet (Speicher am iPhone)');
ok(!errs.length, 'keine Fehler in der Konsole', errs.slice(0, 3));
await b.close();
console.log('\n' + good + ' OK, ' + bad + ' FEHLER · ' + ((Date.now() - T0) / 1000).toFixed(0) + ' s');
fs.writeFileSync(path.join(here, 'xla-test.out'), out.join('\n') + '\n' + good + ' OK, ' + bad + ' FEHLER\n');
process.exit(bad ? 1 : 0);
