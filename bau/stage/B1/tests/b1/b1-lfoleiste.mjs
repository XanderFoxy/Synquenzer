// B1: LFO-Form-Leiste (N8I134 Befund 7, Entscheidung der Bau-Leitung): jede Taste trifft auf >= 44 x 44 px, sichtbar unverändert,
// Panel/Zeile gleich hoch wie 4.30.0. 428x926, 926x428, 428x650. node b1-lfoleiste.mjs <index.html> [Bildordner]
import {chromium} from 'playwright';
import path from 'path'; import {fileURLToPath} from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const NEW = path.resolve(process.argv[2] || path.join(HERE, '../../index.html')), OLD = path.resolve(HERE, '../../../../snapshots/R-4300.html');
const DIR = process.argv[3] || '';
let fails = 0, n = 0; const ok = (id, c, info) => { n++; if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const b = await chromium.launch();
async function measure(file, W, H, sub, shot) {
  const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true}); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await p.addStyleTag({content: '*{animation:none!important;transition:none!important}'});
  await p.evaluate(async sub => { R.selT = 0; ED.tab = 'lfo'; if (ED.sub) ED.sub.lfo = sub; openEditor(); await new Promise(r => setTimeout(r, 400)); }, sub);
  const r = await p.evaluate(key => {
    const s = document.querySelector(`[data-key="${key}"]`); if (!s || !s.offsetParent) return null;
    const row = s.parentElement, pg = s.closest('.pg'), body = s.closest('.sh-body') || pg;
    const bts = [...s.querySelectorAll('button')].map(bt => {
      const q = bt.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2;
      // Trefferprobe: Ränder eines 44 x 44-Felds um die Mitte (0,5 px nach innen)
      const pts = [[cx - 21.5, cy], [cx + 21.5, cy], [cx, cy - 21.5], [cx, cy + 21.5], [cx - 21.5, cy - 21.5], [cx + 21.5, cy + 21.5], [cx - 21.5, cy + 21.5], [cx + 21.5, cy - 21.5]];
      const hit = pts.every(([x, y]) => { const e = document.elementFromPoint(x, y); return e && e.closest('button') === bt; });
      return {w: q.width, h: q.height, l: q.left, t: q.top, cx, cy, hit};
    });
    const rr = row.getBoundingClientRect(), kids = [...row.children].map(k => k.getBoundingClientRect());
    const fit = kids.every(k => k.right <= rr.right + .5 && k.left >= rr.left - .5 && Math.abs(k.top - kids[0].top) < 1) && document.documentElement.scrollWidth <= innerWidth;
    return {fit, fitInfo: kids.map(k => Math.round(k.left) + '–' + Math.round(k.right)).join(' ') + ' in ' + Math.round(rr.left) + '–' + Math.round(rr.right), bts, row: row.getBoundingClientRect().height, pg: pg ? pg.getBoundingClientRect().height : 0, sheet: (document.getElementById('synthSheet') || body).getBoundingClientRect().height};
  }, sub === 'l2' ? 'l2shape' : 'l1shape');
  let tap = null;
  if (r && r.bts.length > 2) {   // echter Finger-Tipp 20 px über der Mitte von Dreieck (Index 1) wählt Dreieck
    const k = sub === 'l2' ? 'l2shape' : 'l1shape', bt = r.bts[1];
    await p.evaluate(k => { const t = S.tracks[R.selT]; t.sound.p[k] = 0; renderEditor && renderEditor(); }, k).catch(() => {});
    await p.waitForTimeout(150);
    const b2 = await p.evaluate(k => { const s = document.querySelector(`[data-key="${k}"]`).querySelectorAll('button')[1].getBoundingClientRect(); return {x: s.left + s.width / 2, y: s.top + s.height / 2}; }, k);
    await p.touchscreen.tap(b2.x, b2.y - 20); await p.waitForTimeout(250);
    tap = await p.evaluate(k => S.tracks[R.selT].sound.p[k], k);
  }
  if (shot) await p.screenshot({path: shot});
  await ctx.close(); return {r, tap, errs};
}
for (const [W, H] of [[428, 926], [926, 428], [428, 650]]) for (const sub of ['l1', 'l2']) {
  const tag = W + 'x' + H + ' ' + sub.toUpperCase();
  const A = await measure(OLD, W, H, sub), B = await measure(NEW, W, H, sub, DIR && sub === 'l1' ? path.join(DIR, `b1-lfo-${W}x${H}.png`) : '');
  if (!B.r) { ok(tag + ' Leiste sichtbar', false, 'fehlt'); continue; }
  ok(tag + ' alle Tasten treffen auf 44 x 44 (Ränder + Ecken)', B.r.bts.every(x => x.hit), B.r.bts.map(x => Math.round(x.w) + '×' + Math.round(x.h) + (x.hit ? '' : '!')).join(' '));
  // sichtbar: gleiche Höhe und Oberkante wie 4.30.0, Breite jetzt 44 (Entscheidung B1), Leiste passt in die Zeile
  const same = A.r && A.r.bts.slice(0, 5).every((a, k) => { const x = B.r.bts[k]; return x && Math.abs(a.h - x.h) < .5 && Math.abs(a.t - x.t) < .5; });
  ok(tag + ' Tasten gleich hoch und auf gleicher Höhe wie 4.30.0, jede ≥ 44 breit', same && B.r.bts.every(x => x.w >= 43.9), B.r.bts.map(x => Math.round(x.w)).join(' '));
  ok(tag + ' Leiste und Nachbar-Feld in der Zeile (nichts umgebrochen/abgeschnitten)', B.r.fit, B.r.fitInfo);
  ok(tag + ' Zeile, Seite und Blatt gleich hoch wie 4.30.0', A.r && Math.abs(A.r.row - B.r.row) < .5 && Math.abs(A.r.pg - B.r.pg) < .5 && Math.abs(A.r.sheet - B.r.sheet) < .5, A.r ? `${A.r.row}/${B.r.row} · ${Math.round(A.r.pg)}/${Math.round(B.r.pg)} · ${Math.round(A.r.sheet)}/${Math.round(B.r.sheet)}` : '');
  ok(tag + ' Finger-Tipp 20 px über der Taste trifft (Dreieck)', B.tap === 1, 'Form ' + B.tap);
  ok(tag + ' keine Seitenfehler', !B.errs.length, B.errs.slice(0, 1).join(''));
}
await b.close();
console.log((fails ? 'FAIL' : 'OK') + ' b1-lfoleiste ' + (n - fails) + '/' + n);
process.exit(fails ? 1 : 0);
