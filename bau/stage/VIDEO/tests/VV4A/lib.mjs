// VV4-A Testhilfe: App öffnen (Schriften aus /fonts), Fehler sammeln
import { chromium } from 'playwright';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '../../../../..');
export const APP = process.env.APP || path.resolve(HERE, '../../index.html');
export const OUT = process.env.OUT || path.resolve(HERE, 'out');
const FD = 'file://' + ROOT + '/fonts/';
export async function open(o = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: {width: o.w || 428, height: o.h || 761}, deviceScaleFactor: o.dpr || 1});
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + String(e))); p.on('console', m => { if (m.type() === 'error' && !/fonts\/|ERR_FILE_NOT_FOUND/.test(m.text())) errs.push(m.text()); });
  await p.goto('file://' + (o.app || APP)); await p.waitForTimeout(1200);
  const ff = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
  await p.addStyleTag({content: ff.map(([fam, file, ws]) => ws.map(wt => `@font-face{font-family:"${fam}";font-style:normal;font-weight:${wt};src:url(${FD}${file}-latin-${wt}-normal.woff2) format("woff2")}`).join('')).join('')});
  await p.evaluate(async () => { await Promise.all(['500 12px "Barlow Semi Condensed"', '600 12px "Barlow Semi Condensed"', '700 12px "Barlow Semi Condensed"', '500 12px "JetBrains Mono"', '700 12px "JetBrains Mono"'].map(s => document.fonts.load(s))); await document.fonts.ready; });
  await p.mouse.click(5, 300);
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
  await p.waitForTimeout(300);
  return {b, p, errs};
}
// Testsong: 8 Takte, 2 Teile, Träger-Akkorde (mit Tasten) und eine Teil-Transposition
export const SONG = {bars: 8, lanes: [[{bar: 0, slot: 0}, {bar: 4, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 6, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 4, slot: 1}], []],
  carrier: [], mel: {}, xp: [], marks: [{id: 'm1', a: 0, len: 4, name: 'Strophe'}, {id: 'm2', a: 4, len: 4, name: 'Refrain'}]};
import { execSync } from 'child_process';
import fs from 'fs';
fs.mkdirSync(OUT, {recursive: true});
export const probe = f => JSON.parse(execSync(`ffprobe -v error -show_entries stream=index,codec_type,codec_name,width,height,duration,nb_frames,sample_rate:format=duration -of json "${f}"`).toString());
export const saveBlob = async (p, name) => { const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = path.join(OUT, name + '.' + bl.ext); fs.writeFileSync(f, Buffer.from(bl.b64, 'base64')); return f; };
// one frame of a video as raw RGB (W × H) and as PNG
export const frameRaw = (f, k, W, H) => { const o = path.join(OUT, '_f.raw'); execSync(`ffmpeg -v error -y -i "${f}" -vf "select=eq(n\\,${k})" -vsync 0 -frames:v 1 -f rawvideo -pix_fmt rgb24 "${o}"`); const b = fs.readFileSync(o); if (b.length !== W * H * 3) throw new Error('frame size ' + b.length); return b; };
export const framePng = (f, k, name) => { const o = path.join(OUT, name); execSync(`ffmpeg -v error -y -i "${f}" -vf "select=eq(n\\,${k})" -vsync 0 -frames:v 1 "${o}"`); return o; };
// audio of a file: peak / rms (dBFS)
export const audioDb = f => { const o = path.join(OUT, '_a.f32'); execSync(`ffmpeg -v error -y -i "${f}" -map 0:a:0 -ac 1 -ar 48000 -f f32le "${o}"`); const raw = fs.readFileSync(o), A = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4); let pk = 0, ss = 0; for (const v of A) { const a = Math.abs(v); if (a > pk) pk = a; ss += v * v; } return {sec: A.length / 48000, peak: 20 * Math.log10(pk || 1e-9), rms: 20 * Math.log10(Math.sqrt(ss / (A.length || 1)) || 1e-9)}; };
// a test song with Träger (with keys) and a Teil-Transposition
export async function songWithChords(p, xp = true) {
  await p.evaluate(s => SYNQUENZER.setSong(s), SONG);
  await p.evaluate(xp => { SYNQUENZER.songSetChord(1, 'F'); SYNQUENZER.songSetChord(2, 'G'); SYNQUENZER.songSetChord(5, 'Am'); if (xp) S.song.xp = [{beat: 12, semi: 2}, {beat: 20, semi: 0}]; }, xp);
}
export function report(name, res) { fs.writeFileSync(path.join(OUT, name + '.json'), JSON.stringify(res, null, 1)); const bad = Object.entries(res.checks || {}).filter(([k, v]) => !v); console.log(name, bad.length ? 'FEHLER: ' + bad.map(x => x[0]).join(', ') : 'OK (' + Object.keys(res.checks || {}).length + ' Prüfungen)'); return bad.length; }
