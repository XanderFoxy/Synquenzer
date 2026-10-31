// VV1-04: the picture follows the song – Laufband at bar n exactly at the time of bar n (±1 frame); playing clips in the
// matrix picture = R.slot at that time (from a live run of the same song)
import { open, SONG8 } from './n5-v-lib.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const {b, p, errs} = await open();
await p.evaluate(s => SYNQUENZER.setSong(s), SONG8);
const res = {};
const frameAt = (f, t, out) => { execSync(`ffmpeg -v error -y -ss ${t.toFixed(4)} -i ${f} -frames:v 1 -f rawvideo -pix_fmt rgb24 ${out}`); return fs.readFileSync(out); };
// --- Laufband (16:9 song picture)
{
  const m = await p.evaluate(async () => { SYNQUENZER.vvTest({opus: true}); return SYNQUENZER.vvMake({fmt: '16:9', view: 'song'}); });
  const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = 'n5-v-out/a4-song.mp4'; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
  const bpm = await p.evaluate(() => S.bpm), spb = 60 / bpm, W = 1920, H = 1080, fpsPx = 48 * 3 / (4 * spb) / 30;   // px per frame
  const rows = [];
  // the drums row: find its y (the label colour bar is at x 12…21); scan the row for the playhead (green) and the cell edges
  for (let n = 0; n < 8; n++) for (const fr of [0, .5]) {
    const beat = n * 4 + fr * 4, t = beat * spb + .5 / 30;      // the middle of the frame that shows this time
    const tt = beat * spb, buf = frameAt(f, Math.max(0, tt), 'n5-v-out/fr.raw');
    const px = (x, y) => { const k = (y * W + x) * 3; return [buf[k], buf[k + 1], buf[k + 2]]; };
    // playhead: columns where many pixels are bright green (#35d07f)
    const isG = c => c[1] > 150 && c[0] < 110 && c[2] > 80 && c[2] < 170;
    let xs = []; for (let x = 0; x < W; x++) { let n2 = 0; for (let y = 200; y < 900; y += 10) if (isG(px(x, y))) n2++; if (n2 > 50) xs.push(x); }
    const xp = xs.length ? (xs[0] + xs[xs.length - 1]) / 2 : null;
    // the drums row cells: magenta-ish runs on the row centre line; the cell left edge right of / at the playhead's bar
    const yD = await p.evaluate(() => { const rows = trackOrder().filter(i => i < NT()), r = rows.indexOf(DRUM_T), LH = 360, ru = 26, nr = rows.length + 2, rh = Math.max(20, Math.min(34, (LH - ru - 16) / nr)), y0 = Math.max(8, (LH - ru - nr * rh) / 2); return Math.round((y0 + ru + r * rh + rh / 2) * 3) - 25; });   // above the slot number
    const runs = []; let a = -1; for (let x = 234; x < W; x++) { const c = px(x, yD), on = c[0] > 90 && c[2] > 90 && !isG(c); if (on && a < 0) a = x; if (!on && a >= 0) { if (x - a > 30) runs.push([a, x]); a = -1; } }
    // the bar line of the bar that holds the playhead: 6 px left of a cell's left edge (cells start at X(b)+2 points)
    // the bar grid phase from every cell edge away from the playhead (cells start 6 px right of their bar line, 144 px apart)
    const ph = runs.filter(([ra]) => xp == null || Math.abs(ra - xp) > 12).map(([ra]) => ((ra - 6) % 144 + 144) % 144).sort((x, y) => x - y);
    const phi = ph.length ? ph[Math.floor(ph.length / 2)] : null, bar = phi != null ? xp - (((xp - phi) % 144) + 144) % 144 : null;
    let frac = bar != null ? (xp - bar) / 144 : null; if (frac != null && frac - fr > .5) frac -= 1;
    const err = frac != null ? (frac - fr) * 144 : null;
    rows.push({n: n + 1, at: fr, t: +tt.toFixed(3), xp, bar, errPx: err != null ? +err.toFixed(1) : null, errFrames: err != null ? +(err / fpsPx).toFixed(2) : null});
  }
  const worst = Math.max(...rows.map(r => Math.abs(r.errFrames ?? 99)));
  res.laufband = {pxPerFrame: +fpsPx.toFixed(2), worstFrames: worst, rows, ok: worst <= 1};
}
// --- matrix (9:16): green framed cells vs R.slot of a live run at the same bars
{
  const live = await p.evaluate(async () => {
    const o = []; songPlayStart(0); let last = -1;
    await new Promise(res => { const iv = setInterval(() => { if (!R.playing) { clearInterval(iv); res(); return; } const sb = songBeatOf(audBeat()); if (sb == null) return; const bar = Math.floor(sb / 4); if (sb - bar * 4 > 1.8 && sb - bar * 4 < 2.2 && bar !== last) { last = bar; o.push({bar, slot: R.slot.slice(0, NT()).map((s, i) => visualSlots(i, audBeat()).playing)}); } }, 5); });
    return o;
  });
  const m = await p.evaluate(async () => SYNQUENZER.vvMake({fmt: '9:16', view: 'matrix'}));
  const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = 'n5-v-out/a4-matrix.mp4'; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
  const spb = await p.evaluate(() => 60 / S.bpm), W = 1080, rows = [];
  for (const L of live) {
    const t = (L.bar * 4 + 2) * spb, cells = await p.evaluate(t => SYNQUENZER.vvMatrixCells('9:16', t), t), buf = frameAt(f, t, 'n5-v-out/fm.raw');
    const px = (x, y) => { const k = (Math.round(y) * W + Math.round(x)) * 3; return [buf[k], buf[k + 1], buf[k + 2]]; };
    const isG = c => c[1] > 150 && c[0] < 110 && c[2] > 80 && c[2] < 170;
    const seen = []; for (const c of cells) { const g = isG(px(c.x + c.w / 2, c.y + 1.5)) && isG(px(c.x + 1.5, c.y + c.h / 2)); if (g) seen[c.t] = c.s; }
    const want = L.slot.map(s => (s >= 0 ? s : undefined)), got = L.slot.map((_, i) => seen[i]);
    rows.push({bar: L.bar + 1, want: L.slot, got: got.map(x => (x == null ? -1 : x)), same: JSON.stringify(want.map(x => x ?? -1)) === JSON.stringify(got.map(x => x ?? -1))});
  }
  res.matrix = {bars: rows.length, rows, ok: rows.length >= 7 && rows.every(r => r.same)};
}
console.log(JSON.stringify(res, null, 1)); console.log('errors', errs);
fs.writeFileSync('n5-v-out/a4.json', JSON.stringify(res, null, 1));
await b.close();
