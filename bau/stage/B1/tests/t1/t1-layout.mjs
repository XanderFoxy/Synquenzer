// T1 Layout (typische-fehler A.1, A.4, A.5): Taktart-Knöpfe im Tempo-Fenster, im Teil-Blatt und im Clip-Blatt in allen Prüfmaßen –
// nichts abgeschnitten, Trefferflächen ≥ 44 px, keine Höhenänderung der Seite. Aufruf: node t1-layout.mjs <index.html> [shot-dir]
import { chromium } from 'playwright';
const FILE = process.argv[2], DIR = process.argv[3] || null;
const VPS = [[390, 844], [375, 667], [320, 568], [844, 390], [667, 375], [926, 428]];
const b = await chromium.launch();
let fail = 0; const ok = (id, c, i) => { if (!c) fail++; console.log((c ? 'PASS ' : 'FAIL ') + id + (i ? ' — ' + i : '')); };
for (const [w, h] of VPS) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + FILE); await p.waitForTimeout(1200);
  const r = await p.evaluate(async () => {
    const Q = window.SYNQUENZER, H0 = document.documentElement.scrollHeight, W0 = document.documentElement.scrollWidth;
    Q.loadDemo(); await new Promise(r => setTimeout(r, 200));
    Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); S.song.marks = [{id: 'M1', a: 0, len: 2, part: null}, {id: 'M2', a: 2, len: 2, part: null}]; tkBump();
    const meas = sel => [...document.querySelectorAll(sel)].map(e => { const r = e.getBoundingClientRect(); return {t: e.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), cut: e.scrollWidth > e.clientWidth + 1, out: r.right > innerWidth + .5 || r.left < -.5 || r.bottom > innerHeight + .5}; });
    const out = {};
    popBpm(); await new Promise(r => setTimeout(r, 150)); out.bpm = meas('.t1ts button'); out.H1 = document.documentElement.scrollHeight; closePop();
    setSongView(true); await new Promise(r => setTimeout(r, 100));
    openMarkSheet('M2'); await new Promise(r => setTimeout(r, 150));
    const pp = UI.pop && UI.pop.el; out.msBtn = meas('.msheet .ms-b[data-a="ts"]'); if (pp) { pp._ts = true; pp._paint(); popDock(pp); } await new Promise(r => setTimeout(r, 150));
    out.ms = meas('.msheet .t1ts button'); out.H2 = document.documentElement.scrollHeight; closePop();
    openClipSheet(DRUM_T, 0); await new Promise(r => setTimeout(r, 150));
    const cg = meas('#clipSheet .cgrid button'); out.cl = cg.filter(x => /^Taktart/.test(x.t)); out.cgH = Math.min(...cg.map(x => x.h)); out.H3 = document.documentElement.scrollHeight;
    closeClipSheet(); setSongView(false);
    out.H0 = H0; out.W = document.documentElement.scrollWidth; out.W0 = W0;
    return out;
  });
  const tag = w + '×' + h, all = r.bpm.concat(r.ms);
  ok(tag + ' Tempo-Fenster: 7 Knöpfe, ≥ 44 px, nicht abgeschnitten, im Bild', r.bpm.length === 7 && r.bpm.every(x => x.w >= 44 && x.h >= 44 && !x.cut && !x.out), JSON.stringify(r.bpm.map(x => x.t + ' ' + x.w + '×' + x.h + (x.cut ? ' CUT' : '') + (x.out ? ' OUT' : ''))));
  ok(tag + ' Teil-Blatt: [Taktart ▾] + 8 Knöpfe (wie Song + 7)', r.msBtn.length === 1 && !r.msBtn[0].cut && r.ms.length === 8 && r.ms.every(x => x.w >= 44 && x.h >= 44 && !x.cut), JSON.stringify(r.msBtn.concat(r.ms).map(x => x.t + ' ' + x.w + '×' + x.h + (x.cut ? ' CUT' : '') + (x.out ? ' OUT' : ''))));
  // quer haben alle Knöpfe des Clip-Blatts (seit 4.30.0) 34–36 px Höhe: der neue Knopf hat dieselbe Höhe wie seine Nachbarn (Hinweis in STATUS.md)
  ok(tag + ' Clip-Blatt: [Taktart 4/4 ▾] ' + (w > h ? 'so hoch wie die Nachbarn' : '≥ 44 px') + ', nicht abgeschnitten', r.cl.length === 1 && (w > h ? r.cl[0].h >= r.cgH : r.cl[0].h >= 44) && !r.cl[0].cut, JSON.stringify(r.cl) + ' Nachbarn ' + r.cgH);
  ok(tag + ' kein Layout-Sprung, kein Quer-Überlauf', r.H1 === r.H0 && r.H2 === r.H0 && r.H3 === r.H0 && r.W <= w, [r.H0, r.H1, r.H2, r.H3, r.W].join('/'));
  ok(tag + ' keine Fehler', !errs.length, errs.join(' ').slice(0, 200));
  if (DIR) await p.screenshot({ path: DIR + '/t1-' + tag + '.png' });
  await p.close();
}
await b.close(); process.exit(fail ? 1 : 0);
