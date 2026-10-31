import { open, SONG8 } from './n5-v-lib.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const {b, p, errs} = await open();
await p.evaluate(async (s) => { SYNQUENZER.setSong(s); }, SONG8);
const r0 = await p.evaluate(() => SYNQUENZER.vvRender({range: {a: 0, b: 2}}));
for (const [W, H, mime] of [[540, 960, 'video/webm;codecs=vp8,opus'], [1080, 1920, 'video/webm;codecs=vp8,opus'], [1080, 1920, 'video/mp4']]) {
  const b64 = await p.evaluate(async ([W, H, mime]) => {
    const cv = document.createElement('canvas'); document.body.appendChild(cv); cv.style.cssText = 'position:fixed;left:0;top:0;width:100px;height:100px;z-index:999';
    const blob = await vvEncodeMR({W, H, r: VV.last, path: {mime}, view: 'matrix', canvas: cv}); cv.remove();
    const u8 = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let k = 0; k < u8.length; k += 32768) s += String.fromCharCode.apply(null, u8.subarray(k, k + 32768)); return btoa(s);
  }, [W, H, mime]);
  const f = 'n5-v-out/mr3.' + (mime.includes('mp4') ? 'mp4' : 'webm'); fs.writeFileSync(f, Buffer.from(b64, 'base64'));
  console.log(W, H, mime, execSync(`ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets,codec_name -of csv=p=0 ${f}; ffprobe -v error -select_streams v:0 -show_entries packet=pts_time -of csv=p=0 ${f} | tail -1; ffprobe -v error -select_streams a:0 -show_entries packet=pts_time -of csv=p=0 ${f} | tail -1`, {shell: '/bin/bash'}).toString().replace(/\n/g, ' '));
}
console.log(errs, await p.evaluate(() => VV.last.dur)); await b.close();
