// pixel check: translation between two consecutive frames of the MP4 (quarter scale, brute force), vs. the camera log
import fs from 'fs'; import { execSync } from 'child_process';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-v-qa2-out/';
const f = OUT + (process.argv[2] || 'cam-diag.mp4'), log = JSON.parse(fs.readFileSync(OUT + (process.argv[3] || 'cam-diag.json')));
const W = 270, H = 480;
const frame = n => { execSync(`ffmpeg -v error -y -i ${f} -vf "select=eq(n\\,${n}),scale=${W}:${H}:flags=area,format=gray" -frames:v 1 -f rawvideo ${OUT}reg.raw`); return fs.readFileSync(OUT + 'reg.raw'); };
for (const n of (process.argv[4] || '273,538').split(',').map(Number)) {
  const A = frame(n - 1), B = frame(n);
  let best = {e: Infinity};
  for (let dy = -24; dy <= 24; dy++) for (let dx = -24; dx <= 24; dx++) {
    let s = 0, c = 0;
    for (let y = 40; y < H - 40; y += 2) { const yb = y + dy; for (let x = 30; x < W - 30; x += 2) { s += Math.abs(A[y * W + x] - B[yb * W + x + dx]); c++; } }
    const e = s / c; if (e < best.e) best = {e, dx, dy};
  }
  let e0 = 0, c0 = 0; for (let y = 40; y < H - 40; y += 2) for (let x = 30; x < W - 30; x += 2) { e0 += Math.abs(A[y * W + x] - B[y * W + x]); c0++; }
  const a = log[n - 1], b = log[n];
  const pred = {dx: -(b.cx - a.cx) * 1080 / a.ww / 4, dy: -(b.cy - a.cy) * 1920 / a.wh / 4};
  console.log(JSON.stringify({frame: n, ts: b.ts, measured_px_quarter: [best.dx, best.dy], err: +best.e.toFixed(2), errNoShift: +(e0 / c0).toFixed(2), logPred_quarter: [+pred.dx.toFixed(1), +pred.dy.toFixed(1)], shiftPctOfWidth: +(Math.hypot(best.dx, best.dy) / W * 100).toFixed(2)}));
}
