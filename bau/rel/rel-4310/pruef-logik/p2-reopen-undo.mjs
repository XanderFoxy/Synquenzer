// P2: pshReopen gleiche/andere Stelle (G10C-Zustand), Neuzeichnen beim Zurückholen mit offener Bearbeiten-Zeile,
//     Undo/Redo nach Löschen/Name/Farbe/★ während das Blatt abgelegt ist
import {boot, ok, info, inject, sheet, segs, center} from './lib.mjs';
const {b, p, errs} = await boot();
await inject(p, 4, {scene: 0}); await inject(p, 2, {scene: 1});
const st = () => p.evaluate(() => ({dock: !!PSH.dock, pop: UI.pop ? UI.pop.name : null, sheetS: TK.sheet ? TK.sheet.s : null, ed: G10C.ed, gcAsk: G10C.gcAsk, pv: !!G10C.pv, dup: !!TK.dupAsk,
  heads: UI.pop ? UI.pop.el.querySelectorAll('.psh-h').length : -1, first: UI.pop ? UI.pop.el.firstElementChild.className : '', bds: UI.pop ? UI.pop.el.querySelectorAll('.g10c-bd').length : -1,
  cl: UI.pop ? UI.pop.el.querySelectorAll('.clbox').length : -1, rows: UI.pop ? [...UI.pop.el.querySelectorAll('.g10c-row b')].map(x => x.textContent) : null,
  edRow: UI.pop && UI.pop.el.querySelector('.g10c-ed') ? +UI.pop.el.querySelector('.g10c-ed').dataset.k : null,
  edTake: (() => { const e = UI.pop && UI.pop.el.querySelector('.g10c-ed'); if (!e) return null; const x = tkRef(TK.sheet); return 'Take ' + g10cNos(tkSegs(x.a))[+e.dataset.k]; })(),
  title: (PSH.dock ? PSH.dock.el : UI.pop ? UI.pop.el : document.body).querySelector('.psh-t') ? (PSH.dock ? PSH.dock.el : UI.pop.el).querySelector('.psh-t').textContent : ''}));

// --- 1) gleiche Stelle: Bearbeiten offen + Aufräumen-Frage offen → Ablegen → wieder antippen → Zustand bleibt, Kopf genau 1×
await sheet(p, 0); await p.waitForTimeout(150);
await p.tap('.tksheet .g10c-row[data-k="2"] button[data-a="g10c-ed"]'); await p.waitForTimeout(80);
await p.tap('.tksheet button[data-a="gc"]'); await p.waitForTimeout(150);
let s0 = await st(); info('offen: ' + JSON.stringify(s0));
await p.tap('.tksheet .psh-dk'); await p.waitForTimeout(120);
await sheet(p, 0); await p.waitForTimeout(150);
let s1 = await st(); info('gleiche Stelle zurück: ' + JSON.stringify(s1));
ok(s1.pop === 'takes' && !s1.dock && s1.ed === 2 && s1.gcAsk && s1.heads === 1 && s1.first.includes('psh-h') && s1.bds === 1 && s1.cl === 1, 'gleiche Stelle: Blatt kommt mit Zustand (ed 2, Aufräumen-Frage) zurück, Kopf/Körper/SÄUBERN je 1×');

// --- 2) andere Stelle: ablegen, Szene 2 antippen → Zustand zurückgesetzt
await p.tap('.tksheet .psh-dk'); await p.waitForTimeout(120);
await sheet(p, 1); await p.waitForTimeout(150);
let s2 = await st(); info('andere Stelle: ' + JSON.stringify(s2));
ok(s2.pop === 'takes' && !s2.dock && s2.sheetS === 1 && s2.ed === -1 && !s2.gcAsk && !s2.pv && s2.rows.length === 2 && s2.heads === 1, 'andere Stelle: abgelegtes Blatt geht zu, neues Blatt Szene 2 mit frischem Zustand');
await p.evaluate(() => closePop());

// --- 3) Undo/Redo während abgelegt (Name, Farbe, ★, Löschen)
await sheet(p, 0); await p.waitForTimeout(150);
await p.tap('.tksheet .g10c-row[data-k="1"] button[data-a="g10c-ed"]'); await p.waitForTimeout(80);
await p.fill('.tksheet .g10c-name', 'Refrain'); await p.tap('.tksheet button[data-a="g10c-edok"]'); await p.waitForTimeout(80);
await p.tap('.tksheet .g10c-row[data-k="1"] button[data-a="g10c-ed"]'); await p.waitForTimeout(80);
await p.tap('.tksheet .g10c-sw[data-v="2"]'); await p.waitForTimeout(80);
await p.tap('.tksheet .g10c-row[data-k="1"] button[data-a="g10c-fav"]'); await p.waitForTimeout(80);
let a = (await segs(p))[0]; info('nach Name/Farbe/★: ' + JSON.stringify(a[1]));
const base = JSON.stringify(a);
await p.tap('.tksheet .psh-dk'); await p.waitForTimeout(100);
await p.evaluate(() => { undo(); undo(); undo(); });
let a2 = (await segs(p))[0]; ok(!a2[1].name && !a2[1].tag && !a2[1].fav, '3× ↶ (abgelegt) nimmt ★, Farbe, Name zurück: ' + JSON.stringify(a2[1]));
await p.tap('#pshDock .psh-t'); await p.waitForTimeout(150);
let s3 = await st(); let html3 = await p.$eval('.tksheet .g10c-row[data-k="1"]', e => ({nm: !!e.querySelector('.g10c-nm'), dot: !!e.querySelector('.g10c-dot'), fv: !!e.querySelector('.g10c-fv')}));
ok(s3.pop === 'takes' && !html3.nm && !html3.dot && !html3.fv, 'Zurückholen zeichnet den Undo-Stand (kein Name/Farbe/★): ' + JSON.stringify(html3));
info('Bearbeiten-Zeile nach Zurückholen: ' + JSON.stringify({ed: s3.ed, edRow: s3.edRow, edTake: s3.edTake}));
await p.tap('.tksheet .psh-dk'); await p.waitForTimeout(100);
await p.evaluate(() => { redo(); redo(); redo(); });
await p.tap('#pshDock .psh-t'); await p.waitForTimeout(150);
a = (await segs(p))[0]; ok(JSON.stringify(a) === base, '3× ↷ (abgelegt) stellt Name/Farbe/★ wieder her');
html3 = await p.$eval('.tksheet .g10c-row[data-k="1"]', e => ({nm: e.querySelector('.g10c-nm') && e.querySelector('.g10c-nm').textContent, dot: !!e.querySelector('.g10c-dot'), fv: !!e.querySelector('.g10c-fv')}));
ok(html3.nm === 'Refrain' && html3.dot && html3.fv, 'Zurückholen zeichnet den Redo-Stand: ' + JSON.stringify(html3));

// --- 4) Löschen, ablegen, ↶ → Zeile wieder da; offene Bearbeiten-Zeile: an welchem Take?
await p.evaluate(() => closePop());
await sheet(p, 0); await p.waitForTimeout(120);
let L0 = (await st()).rows; info('Zeilen: ' + L0.join(','));
await p.tap('.tksheet .g10c-row[data-k="1"] .tk-del'); await p.waitForTimeout(150);
await p.tap('.tksheet .g10c-row[data-k="2"] button[data-a="g10c-ed"]'); await p.waitForTimeout(80);
let s4 = await st(); info('nach Löschen Take an k=1, Bearbeiten an k=2: ' + JSON.stringify({rows: s4.rows, edRow: s4.edRow, edTake: s4.edTake}));
await p.tap('.tksheet .psh-dk'); await p.waitForTimeout(100);
await p.evaluate(() => undo());
await p.tap('#pshDock .psh-t'); await p.waitForTimeout(150);
let s5 = await st(); info('↶ (abgelegt), zurückgeholt: ' + JSON.stringify({rows: s5.rows, edRow: s5.edRow, edTake: s5.edTake}));
ok(JSON.stringify(s5.rows) === JSON.stringify(L0), '↶ (abgelegt) holt den gelöschten Take zurück: ' + s5.rows.join(','));
ok(s5.edTake === s4.edTake, 'offene Bearbeiten-Zeile bleibt am selben Take (' + s4.edTake + ') → jetzt an ' + s5.edTake);
await p.screenshot({path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/rel-4310/pruef-logik/p2-ed-nach-undo.png'});
info('Fehler im Browser: ' + errs.length + (errs.length ? ' ' + errs.slice(0, 3).join(' / ') : ''));
await b.close();
