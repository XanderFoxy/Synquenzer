// VV1-01 (container, size, fps, duration), VV1-02 (tail), VV1-08 (gate)
import { open, SONG8 } from './n5-v-lib.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const probe = f => JSON.parse(execSync(`ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,duration,nb_frames:format=duration,format_name -of json ${f}`).toString());
const decDur = f => { const o = execSync(`ffmpeg -v error -i ${f} -f null - -stats 2>&1 || true`, {shell: '/bin/bash'}).toString(); const m = [...o.matchAll(/time=(\d+):(\d+):([\d.]+)/g)].pop(); return m ? (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) : null; };
const res = {};
const {b, p, errs} = await open();
await p.evaluate(s => SYNQUENZER.setSong(s), SONG8);
const save = async (tag) => { const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = 'n5-v-out/a1-' + tag + '.' + bl.ext; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64')); return f; };
// --- VV1-01 WebCodecs path (Chromium here has no AAC encoder: Opus by test switch), both formats
for (const fmt of ['16:9', '9:16']) {
  const m = await p.evaluate(async fmt => { SYNQUENZER.vvTest({opus: true}); return SYNQUENZER.vvMake({fmt, view: 'song'}); }, fmt);
  const f = await save('wc-' + fmt.replace(':', 'x')), pr = probe(f);
  const v = pr.streams.find(s => s.codec_type === 'video'), a = pr.streams.find(s => s.codec_type === 'audio');
  const want = m.songSec + m.tail;
  res['01-wc-' + fmt] = {how: m.how, mime: m.mime, size: m.size, fmt: pr.format.format_name, w: v.width, h: v.height, fps: v.r_frame_rate, avg: v.avg_frame_rate, vcodec: v.codec_name, acodec: a && a.codec_name,
    durFile: +pr.format.duration, durV: +v.duration, durA: +a.duration, want: +want.toFixed(3), song: +m.songSec.toFixed(3), tail: +m.tail.toFixed(3),
    ok: v.width === (fmt === '16:9' ? 1920 : 1080) && v.height === (fmt === '16:9' ? 1080 : 1920) && v.r_frame_rate === '30/1' && !!a && Math.abs(+pr.format.duration - want) <= .1 && Math.abs(+v.duration - want) <= .1};
}
// --- fallback (VV1-08): no VideoEncoder → MediaRecorder with type
{
  const pth = await p.evaluate(async () => { SYNQUENZER.vvTest({noVE: true}); return SYNQUENZER.vvPath('9:16'); });
  const m = await p.evaluate(async () => SYNQUENZER.vvMake({fmt: '9:16', view: 'matrix', range: {a: 0, b: 4}}));
  const f = await save('mr-9x16'), pr = probe(f), dd = decDur(f);
  const v = pr.streams.find(s => s.codec_type === 'video'), a = pr.streams.find(s => s.codec_type === 'audio');
  res['08-mr'] = {path: pth, how: m.how, mime: m.mime, size: m.size, w: v && v.width, h: v && v.height, vcodec: v && v.codec_name, acodec: a && a.codec_name, durDecoded: dd, want: +(m.songSec + m.tail).toFixed(3), wall: m.ms,
    ok: m.how === 'recorder' && !!v && !!a && v.width === 1080 && v.height === 1920 && dd != null && Math.abs(dd - (m.songSec + m.tail)) <= .15};
  // without both: grey button with reason (sheet)
  const g = await p.evaluate(async () => { SYNQUENZER.vvTest({noVE: true, noMR: true}); SYNQUENZER.vvOpen(); await new Promise(r => setTimeout(r, 300)); const bt = document.querySelector('.vvacts .go'); const w = document.querySelector('.vvway'); return {disabled: bt.disabled, why: w.textContent, warn: w.classList.contains('warn')}; });
  res['08-none'] = Object.assign(g, {ok: g.disabled && /nicht möglich/.test(g.why)});
  await p.evaluate(() => { SYNQUENZER.vvClose(); SYNQUENZER.vvTest({}); });
}
// --- VV1-02 tail: the song ends with a long hall + echo → video runs on until < −60 dBFS (≤ 10 s), no hard cut
{
  const r = await p.evaluate(async () => {
    const A = SYNQUENZER; A.vvTest({});
    const fx0 = JSON.stringify(S.fxBus);
    S.fxBus.hall.decay = 6; S.fxBus.hall.ret = 1; S.fxBus.echo.fb = .55; for (const tr of S.tracks) if (tr.sound && tr.sound.fx) { tr.sound.fx.rev = .6; tr.sound.fx.dly = .4; }
    applyFxBus(); for (let i = 0; i < NT(); i++) applyTrackParams(i, true);
    const x = await A.vvRender();
    const pcm = A.vvPcm(Math.max(0, x.dur - .06), x.dur);
    const L = Uint8Array.from(atob(pcm.b64), c => c.charCodeAt(0)), d = new Int16Array(L.buffer); let pk = 0; for (const v of d) pk = Math.max(pk, Math.abs(v) / 32767);
    const at = A.vvPcm(x.songSec, x.songSec + .05), L2 = Uint8Array.from(atob(at.b64), c => c.charCodeAt(0)), d2 = new Int16Array(L2.buffer); let pk2 = 0; for (const v of d2) pk2 = Math.max(pk2, Math.abs(v) / 32767);
    return {dur: x.dur, songSec: x.songSec, tail: x.tail, capped: x.capped, endPeakDb: 20 * Math.log10(pk + 1e-9), songEndPeakDb: 20 * Math.log10(pk2 + 1e-9), fx0};
  });
  res['02-tail'] = Object.assign(r, {fx0: undefined, ok: r.tail > .5 && r.tail <= 10.001 && r.endPeakDb < -55 && r.songEndPeakDb > -40});
}
console.log(JSON.stringify(res, null, 1)); console.log('errors', errs);
fs.writeFileSync('n5-v-out/a1.json', JSON.stringify(res, null, 1));
await b.close();
