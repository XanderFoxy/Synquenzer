// control: a plain page records a 1080×1920 canvas (30 requestFrame/s) with MediaRecorder vp8 5 Mbit/s – does this machine keep 30 fps at all?
import { chromium } from 'playwright';
import fs from 'fs'; import os from 'os'; import { execSync } from 'child_process';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-v-abn-out/';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage();
await p.setContent('<canvas id=c width=1080 height=1920></canvas>');
const r = await p.evaluate(async () => {
  const cv = document.getElementById('c'), g = cv.getContext('2d', {alpha: false}), s = cv.captureStream(0), vt = s.getVideoTracks()[0];
  const ac = new AudioContext(), d = ac.createMediaStreamDestination(), o = ac.createOscillator(); o.connect(d); o.start();
  const ms = new MediaStream([vt, ...d.stream.getAudioTracks()]), mr = new MediaRecorder(ms, {mimeType: 'video/webm;codecs=vp8,opus', videoBitsPerSecond: 5e6, audioBitsPerSecond: 192000}), parts = [];
  mr.ondataavailable = e => parts.push(e.data); const done = new Promise(r => mr.onstop = r); mr.start(1000);
  const t0 = performance.now(); let fl = -1, n = 0;
  await new Promise(res => { const st = () => { const t = (performance.now() - t0) / 1000, fi = Math.floor(t * 30); if (fi !== fl) { fl = fi; g.fillStyle = '#0d0e11'; g.fillRect(0, 0, 1080, 1920); for (let k = 0; k < 40; k++) { g.fillStyle = 'hsl(' + (k * 9 + fi * 5) + ',70%,50%)'; g.fillRect((k * 97 + fi * 13) % 1000, k * 47, 120, 40); } g.fillStyle = '#35d07f'; g.fillRect(fi * 3 % 1080, 0, 6, 1920); vt.requestFrame(); n++; } if (t >= 15) res(); else requestAnimationFrame(st); }; requestAnimationFrame(st); });
  mr.stop(); await done; const bl = new Blob(parts); const u8 = new Uint8Array(await bl.arrayBuffer()); let s2 = ''; for (let k = 0; k < u8.length; k += 32768) s2 += String.fromCharCode.apply(null, u8.subarray(k, k + 32768)); return {n, b64: btoa(s2)};
});
const f = OUT + 'mrctl.webm'; fs.writeFileSync(f, Buffer.from(r.b64, 'base64'));
const fr = execSync(`ffprobe -v error -select_streams v:0 -show_entries frame=pts_time -of csv=p=0 "${f}"`).toString().trim().split('\n').map(Number);
console.log(JSON.stringify({requested: r.n, fileFrames: fr.length, last: fr[fr.length - 1], fps: +(fr.length / 15).toFixed(1), load: os.loadavg()[0]}));
await b.close();
