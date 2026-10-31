// audio of a video file: onset, peaks per 0.5 s, biggest sample jumps
import { execSync } from 'child_process'; import fs from 'fs';
const f = process.argv[2], raw = f + '.raw';
execSync(`ffmpeg -v error -i ${f} -map 0:a -ac 2 -ar 48000 -f f32le -y ${raw}`);
const b = fs.readFileSync(raw), a = new Float32Array(b.buffer, b.byteOffset, b.length / 4), sr = 48000, n = a.length / 2;
const L = new Float32Array(n), R = new Float32Array(n); for (let k = 0; k < n; k++) { L[k] = a[2 * k]; R[k] = a[2 * k + 1]; }
const first = th => { const t = Math.pow(10, th / 20); for (let k = 0; k < n; k++) if (Math.abs(L[k]) > t || Math.abs(R[k]) > t) return +(k / sr * 1000).toFixed(1); return null; };
const pk = []; for (let s = 0; s < n; s += sr / 2) { let m = 0; for (let k = s; k < Math.min(n, s + sr / 2); k++) m = Math.max(m, Math.abs(L[k]), Math.abs(R[k])); pk.push(+(20 * Math.log10(m + 1e-12)).toFixed(1)); }
console.log(JSON.stringify({dur: n / sr, onset40: first(-40), onset20: first(-20), peaks05: pk}));
