// A/V sync of a 9:16 song-view video: playhead x (green line in the ruler band) vs. the audio onset; first 5 s (before the scroll)
import { execSync } from 'child_process'; import fs from 'fs';
const f = process.argv[2], bpm = +(process.argv[3] || 112), W = 1080, H = 1920;
const raw = f + '.a.raw'; execSync(`ffmpeg -v error -i ${f} -map 0:a -ac 1 -ar 48000 -f f32le -y ${raw}`);
const ab = fs.readFileSync(raw), a = new Float32Array(ab.buffer, ab.byteOffset, ab.length / 4);
let on = null; for (let k = 0; k < a.length; k++) if (Math.abs(a[k]) > 0.01) { on = k / 48000; break; }
const info = JSON.parse(execSync(`ffprobe -v error -show_entries stream=codec_type,start_time,duration:format=duration -of json ${f}`).toString());
const out = [];
for (const t of [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]) {
  const fr = execSync(`ffmpeg -v error -ss ${t} -i ${f} -frames:v 1 -f rawvideo -pix_fmt rgb24 -`, {maxBuffer: 1 << 26});
  const cols = new Map();
  for (let y = 150; y < 200; y += 2) for (let x = 150; x < W; x++) { const i = (y * W + x) * 3, r = fr[i], g = fr[i + 1], b = fr[i + 2]; if (Math.abs(r - 53) < 30 && Math.abs(g - 208) < 30 && Math.abs(b - 127) < 30) cols.set(x, (cols.get(x) || 0) + 1); }
  const xs = [...cols.entries()].filter(([x, n]) => n > 15).map(([x]) => x); const xc = xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null;
  // the frame shown at file time t: the picture's song time; audio says song time = t - onset
  const sbPic = xc == null ? null : (xc / 3 - 66) / 10, tPic = sbPic == null ? null : sbPic * 60 / bpm;
  out.push({t, xc: xc && +xc.toFixed(1), tPic: tPic && +tPic.toFixed(3), tAud: +(t - on).toFixed(3), dMs: tPic == null ? null : Math.round((tPic - (t - on)) * 1000)});
}
console.log(JSON.stringify({f: f.split('/').pop(), onsetMs: Math.round(on * 1000), streams: info.streams.map(s => [s.codec_type, s.start_time, s.duration]), fmtDur: info.format.duration}));
for (const o of out) console.log(JSON.stringify(o));
