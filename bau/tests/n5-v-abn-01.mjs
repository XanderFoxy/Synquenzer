// VV1-01 + VV1-08: container, size, fps, duration (main path with opus switch, real fallback with VideoEncoder deleted), gate without both
import { open, SONG8, probe, saveBlob, OUT } from './n5-v-abn-lib.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const tag = process.argv[2] || 'r1';
const dec = f => { // decode every stream; per stream the last pts+dur and errors
  const out = {};
  for (const sel of ['v:0', 'a:0']) {
    const o = execSync(`ffprobe -v error -select_streams ${sel} -show_entries frame=pts_time,duration_time,pkt_duration_time -of csv=p=0 "${f}"`, {maxBuffer: 1 << 28}).toString().trim().split('\n').map(l => l.split(',').map(Number));
    let mx = 0, mn = 1e9; for (const r of o) { const t = r[0], d = isFinite(r[1]) ? r[1] : (isFinite(r[2]) ? r[2] : 0); if (isFinite(t)) { mx = Math.max(mx, t + d); mn = Math.min(mn, t); } }
    out[sel] = {first: +mn.toFixed(4), end: +mx.toFixed(4), frames: o.length};
  }
  const e = execSync(`ffmpeg -v error -i "${f}" -f null - 2>&1 || true`, {shell: '/bin/bash'}).toString().trim();
  out.decErr = e.split('\n').filter(Boolean).slice(0, 4);
  return out;
};
const res = {};
// --- main path (WebCodecs, opus by test switch since this Chromium has no AAC encoder)
{
  const {b, p, errs} = await open();
  await p.evaluate(s => SYNQUENZER.setSong(s), SONG8);
  for (const [fmt, view] of [['16:9', 'song'], ['9:16', 'matrix']]) {
    const m = await p.evaluate(async ([fmt, view]) => { SYNQUENZER.vvTest({opus: true}); return SYNQUENZER.vvMake({fmt, view}); }, [fmt, view]);
    const f = await saveBlob(p, fs, tag + '-wc-' + fmt.replace(':', 'x')), pr = probe(f), d = dec(f);
    const v = pr.streams.find(s => s.codec_type === 'video'), a = pr.streams.find(s => s.codec_type === 'audio'), want = m.songSec + m.tail;
    res['wc-' + fmt] = {how: m.how, fmtName: pr.format.format_name, w: v.width, h: v.height, r: v.r_frame_rate, avg: v.avg_frame_rate, vcodec: v.codec_name, acodec: a && a.codec_name, nb: v.nb_frames,
      fileDur: +pr.format.duration, vDur: +v.duration, aDur: a && +a.duration, want: +want.toFixed(3), song: +m.songSec.toFixed(3), tail: +m.tail.toFixed(3), dec: d};
  }
  res.errsWC = errs; await b.close();
}
// --- fallback: VideoEncoder deleted for real
{
  const {b, p, errs} = await open({init: () => { delete window.VideoEncoder; }});
  await p.evaluate(s => SYNQUENZER.setSong(s), SONG8);
  const pth = await p.evaluate(() => SYNQUENZER.vvPath('9:16'));
  const T0 = Date.now();
  const m = await p.evaluate(async () => SYNQUENZER.vvMake({fmt: '9:16', view: 'song'}));
  const wall = Date.now() - T0;
  const f = await saveBlob(p, fs, tag + '-mr-9x16'), pr = probe(f), d = dec(f);
  const v = pr.streams.find(s => s.codec_type === 'video'), a = pr.streams.find(s => s.codec_type === 'audio');
  const ffd = execSync(`ffmpeg -v error -i "${f}" -f null - -stats 2>&1 || true`, {shell: '/bin/bash'}).toString(); const mm = [...ffd.matchAll(/time=(\d+):(\d+):([\d.]+)/g)].pop();
  res.mr = {path: pth, how: m.how, mime: m.mime, w: v && v.width, h: v && v.height, r: v && v.r_frame_rate, avg: v && v.avg_frame_rate, vcodec: v && v.codec_name, acodec: a && a.codec_name, fileDur: pr.format.duration,
    want: +(m.songSec + m.tail).toFixed(3), song: +m.songSec.toFixed(3), tail: +m.tail.toFixed(3), ffTime: mm ? (+mm[2]) * 60 + (+mm[3]) : null, dec: d, wall};
  res.errsMR = errs; await b.close();
}
// --- without both: grey button with reason
{
  const {b, p, errs} = await open({init: () => { delete window.VideoEncoder; delete window.MediaRecorder; }});
  await p.evaluate(s => SYNQUENZER.setSong(s), SONG8);
  const g = await p.evaluate(async () => { SYNQUENZER.vvOpen(); await new Promise(r => setTimeout(r, 400)); const bt = [...document.querySelectorAll('#vvSheet button')].find(x => /Video erstellen/.test(x.textContent)); const w = document.querySelector('#vvSheet .vvway'); return {disabled: bt.disabled, why: w.textContent, warn: w.classList.contains('warn'), col: getComputedStyle(bt).backgroundColor}; });
  res.none = g; res.errsNone = errs; await b.close();
}
console.log(JSON.stringify(res, null, 1));
fs.writeFileSync(OUT + tag + '-01.json', JSON.stringify(res, null, 1));
