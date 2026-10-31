// CDP screencast at device pixels; frames -> CFR video
import fs from 'fs'; import { execSync } from 'child_process';
export async function startCast(cdp, dir) {
  fs.rmSync(dir, {recursive: true, force: true}); fs.mkdirSync(dir);
  const fr = []; let n = 0;
  cdp.on('Page.screencastFrame', async e => { const f = dir + '/' + String(n++).padStart(6, '0') + '.jpg'; fs.writeFileSync(f, Buffer.from(e.data, 'base64')); fr.push([f, e.metadata.timestamp]); cdp.send('Page.screencastFrameAck', {sessionId: e.sessionId}).catch(() => {}); });
  await cdp.send('Page.startScreencast', {format: 'jpeg', quality: 92, maxWidth: 1170, maxHeight: 2532, everyNthFrame: 1});
  return {fr, t0: Date.now() / 1000};
}
export async function stopCast(cdp, c, out) {
  await cdp.send('Page.stopScreencast'); await new Promise(r => setTimeout(r, 300));
  const fr = c.fr; const T0 = c.t0; let s = '';
  // first frame from T0 (wall) — screencast timestamps are wall-clock seconds
  for (let i = 0; i < fr.length; i++) { const d = (i + 1 < fr.length ? fr[i + 1][1] : fr[i][1] + .1) - (i === 0 ? T0 : fr[i][1]); s += `file '${fr[i][0].split('/').pop()}'\nduration ${Math.max(0.001, d).toFixed(4)}\n`; }
  s += `file '${fr[fr.length - 1][0].split('/').pop()}'\n`;
  const dir = fr[0][0].split('/').slice(0, -1).join('/'); fs.writeFileSync(dir + '/list.txt', s);
  execSync(`ffmpeg -v error -y -f concat -safe 0 -i ${dir}/list.txt -vf "fps=30,scale=1170:2532:force_original_aspect_ratio=decrease,pad=1170:2532:(ow-iw)/2:(oh-ih)/2,format=yuv420p" -c:v libx264 -crf 15 -preset veryfast ${out}`);
  return fr.length;
}
