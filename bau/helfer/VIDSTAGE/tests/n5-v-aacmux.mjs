// the AAC branch of the muxer (esds) – Chromium here has no AAC encoder: ffmpeg makes AAC-LC (ADTS) + H.264 (Annex B → AVCC),
// the app's VVMP4.build muxes them, ffprobe/ffmpeg read the result back
import { open } from './n5-v-lib.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
execSync('ffmpeg -v error -y -f lavfi -i "sine=f=440:d=3:r=48000" -ac 2 -c:a aac -b:a 128k -f adts n5-v-out/t.aac');
const a = fs.readFileSync('n5-v-out/t.aac'), frames = []; let asc = null;
for (let k = 0; k < a.length;) { const len = ((a[k + 3] & 3) << 11) | (a[k + 4] << 3) | (a[k + 5] >> 5), hl = (a[k + 1] & 1) ? 7 : 9;
  if (!asc) { const prof = (a[k + 2] >> 6) + 1, sfi = (a[k + 2] >> 2) & 15, ch = ((a[k + 2] & 1) << 2) | (a[k + 3] >> 6); asc = [(prof << 3) | (sfi >> 1), ((sfi & 1) << 7) | (ch << 3)]; }
  frames.push([...a.subarray(k + hl, k + len)]); k += len; }
const res = await (async () => {
  const {b, p} = await open();
  const b64 = await p.evaluate(([frames, asc]) => SYNQUENZER.vvMux([{kind: 'audio', codec: 'aac', ts: 48000, sr: 48000, ch: 2, cfg: Uint8Array.from(asc), durs: frames.map(() => 1024), sizes: frames.map(f => f.length), data: frames.map(f => Uint8Array.from(f))}]), [frames, asc]);
  fs.writeFileSync('n5-v-out/aacmux.mp4', Buffer.from(b64, 'base64')); await b.close();
  const pr = JSON.parse(execSync('ffprobe -v error -show_entries stream=codec_name,profile,sample_rate,channels,duration -of json n5-v-out/aacmux.mp4').toString());
  const dec = execSync('ffmpeg -v error -i n5-v-out/aacmux.mp4 -f null - -stats 2>&1 || true', {shell: '/bin/bash'}).toString();
  return {frames: frames.length, asc, stream: pr.streams[0], decodeErrors: /error/i.test(dec) ? dec.slice(0, 300) : '', ok: pr.streams[0].codec_name === 'aac' && Math.abs(+pr.streams[0].duration - frames.length * 1024 / 48000) < .01 && !/error/i.test(dec)};
})();
console.log(JSON.stringify(res)); fs.writeFileSync('n5-v-out/aacmux.json', JSON.stringify(res));
