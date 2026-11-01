// VV-LOGO: an export with the Abspann-Logo. argv: WAY (wc|mr) FMT (16:9|9:16|1:1) [MODE mp4|mov]
// Stage 4.28.0 (Xanders Präzisierung): das Logo setzt bei 50 % Abdunklung ein (at + 0,5 s), Luma-Key.
// Checks: length = song + 0.5 s + logo + 0.5 s, sound track to the end, darkening of the last picture, logo centred at 60 % of the
// shorter side (black keyed: nothing around it), the logo runs completely (its moving bar), black at the end, sound silent in the Abspann.
import * as L from './vvl-lib.mjs';
const WAY = process.argv[2] || 'wc', FMT = process.argv[3] || '16:9', MODE = process.argv[4] || 'mp4';
const TAG = 'export-' + WAY + '-' + FMT.replace(':', 'x') + (MODE !== 'mp4' ? '-' + MODE : '');
const s = await L.serve(MODE);
const {b, p, errs, net404} = await L.open(s.url);
const C = [], X = {};
X.song = await L.song(p);
X.logo = await p.evaluate(() => SYNQUENZER.vvLogo());
C.push(['Logo geladen', X.logo.st === 'ok' && X.logo.on, X.logo]);
const test = WAY === 'wc' ? {opus: true} : {noVE: true};
if (FMT === '1:1') test.size = [1080, 1080];
await p.evaluate(t => SYNQUENZER.vvTest(t), test);
const t0 = Date.now();
X.res = await p.evaluate(f => SYNQUENZER.vvMake({fmt: f === '1:1' ? '16:9' : f}), FMT);
X.ms = Date.now() - t0;
const R = X.res, at = R.logo ? R.logo.at : NaN, LG = 3, LI = .5, W = R.W, H = R.H;
C.push(['Weg ' + WAY, R.how === (WAY === 'wc' ? 'webcodecs' : 'recorder'), R.how]);
C.push(['res.logo gesetzt', !!R.logo && R.logo.len === LG && R.logo.fade === 1 && R.logo.end === .5 && Math.abs(R.logo.in - (at + LI)) < 1e-9, R.logo]);
C.push(['Format ' + FMT, FMT === '1:1' ? W === 1080 && H === 1080 : FMT === '16:9' ? W === 1920 && H === 1080 : W === 1080 && H === 1920, [W, H]]);
C.push(['Länge (res) = Song + 0,5 + Logo + 0,5', Math.abs(R.dur - (at + LI + LG + .5)) < 1e-6, {dur: R.dur, at}]);
const f = await L.saveBlob(p, TAG);
const vE = L.decEnd(f, 'v'), aE = L.decEnd(f, 'a'), tolE = WAY === 'wc' ? .06 : .2;
X.file = {f, vEnd: vE, aEnd: aE};
C.push(['Videolänge der Datei', Math.abs(vE.end - R.dur) < tolE, {video: vE.end, soll: +R.dur.toFixed(3)}]);
C.push(['Tonspur bis zum Ende', Math.abs(aE.end - R.dur) < tolE + .05, {audio: aE.end, soll: +R.dur.toFixed(3)}]);
// pictures (gray, 1/4 size)
const w = Math.round(W / 4), h = Math.round(H / 4), png = n => L.OUT + TAG + '-' + n + '.png';
const F = (t, n) => L.frame(f, t, w, h, n ? png(n) : null);
// the logo square (video pixels → frame pixels)
const S0 = Math.min(W, H) * .6, ox = (W - S0) / 2, oy = (H - S0) / 2, k = w / W;
const sq = {x0: Math.round(ox * k), y0: Math.round(oy * k), x1: Math.round((ox + S0) * k), y1: Math.round((oy + S0) * k)};
const outsideOf = fr => { let s2 = 0, n2 = 0; for (let y = 0; y < fr.h; y++) for (let x = 0; x < fr.w; x++) { if (x >= sq.x0 - 1 && x <= sq.x1 + 1 && y >= sq.y0 - 1 && y <= sq.y1 + 1) continue; s2 += fr.d[y * fr.w + x]; n2++; } return s2 / n2; };
const f0 = F(at - .15, '1-song-ende'), f1 = F(at + .5, '2-abblende-halb'), f2 = F(at + .97, '3-schwarz'), fM = F(at + .8, '2b-logo-ueber-abblende');
const m0 = outsideOf(f0), m1 = outsideOf(f1), m2 = outsideOf(f2), mM = outsideOf(fM), pM = L.mean(fM, sq.x0, sq.y0, sq.x1, sq.y1), p1 = L.mean(f1, sq.x0, sq.y0, sq.x1, sq.y1);
X.dark = {m0: +m0.toFixed(2), m1: +m1.toFixed(2), m2: +m2.toFixed(2), mM: +mM.toFixed(2), logoBeiHalb: +p1.toFixed(2), logoBei08: +pM.toFixed(2)};
C.push(['Abblende: halb dunkel nach 0,5 s', m1 > m0 * .3 && m1 < m0 * .75, X.dark]);
C.push(['Abblende: schwarz nach 1 s (außerhalb des Logos)', m2 < Math.max(1, m0 * .08), X.dark]);
C.push(['Logo blendet schon während des Abdunkelns ein (0,8 s: Bild noch nicht schwarz, Logo da)', mM > m2 + .3 && fM.d.reduce((a, v) => Math.max(a, v), 0) > 60, X.dark]);
X.logoFrames = [];
for (const [tau, n] of [[.25, '4-logo-einblenden'], [1, '5-logo-1s'], [2, '6-logo-2s'], [2.85, '7-logo-ende']]) {
  const fr = F(at + LI + tau, n), bb = L.bbox(fr, 40);
  // the moving bar: row 380…410 of 600 in the logo; its bright columns → logo time
  const y0 = Math.round(sq.y0 + 385 / 600 * (sq.y1 - sq.y0)), y1 = Math.round(sq.y0 + 405 / 600 * (sq.y1 - sq.y0));
  let sx = 0, sn = 0; for (let y = y0; y < y1; y++) for (let x = sq.x0; x < sq.x1; x++) if (fr.d[y * fr.w + x] > 80) { sx += x; sn++; }
  const cx = sn ? sx / sn : NaN, tauEst = ((cx - sq.x0) / (sq.x1 - sq.x0) * 600 - 100) / 130;
  const outside = outsideOf(fr);
  const corner = L.mean(fr, sq.x0 + 2, sq.y0 + 2, sq.x0 + Math.round((sq.x1 - sq.x0) * .12), sq.y0 + Math.round((sq.y1 - sq.y0) * .12));
  X.logoFrames.push({tau, bb, tauEst: +tauEst.toFixed(2), outside: +outside.toFixed(2), corner: +corner.toFixed(2), peak: fr.d.reduce((a, v) => Math.max(a, v), 0)});
}
const LF = X.logoFrames, tolT = WAY === 'wc' ? .12 : .3;
C.push(['Logo mittig (waagrecht/senkrecht)', LF.slice(1).every(x => x.bb && Math.abs(x.bb.cx - w / 2) < w * .04 && Math.abs(x.bb.cy - h / 2) < h * .06), LF.map(x => x.bb && [x.bb.cx, x.bb.cy])]);
C.push(['Logo-Größe ≤ 60 % der kürzeren Seite', LF.slice(1).every(x => x.bb && x.bb.w <= (sq.x1 - sq.x0) + 2 && x.bb.h <= (sq.y1 - sq.y0) + 2 && x.bb.w >= (sq.x1 - sq.x0) * .6), {sq: sq.x1 - sq.x0, w: LF.map(x => x.bb && x.bb.w)}]);
C.push(['kein Kasten: Ecken des Logo-Felds schwarz', LF.every(x => x.corner < 3), LF.map(x => x.corner)]);
C.push(['außerhalb des Logos schwarz (ab 1 s nach Song-Ende)', LF.slice(1).every(x => x.outside < 1.5), LF.map(x => x.outside)]);
C.push(['Logo blendet ein (0,25 s halb hell)', LF[0].peak < LF[1].peak * .8 && LF[0].peak > LF[1].peak * .25, LF.map(x => x.peak)]);
C.push(['Logo läuft (Balken an der richtigen Stelle)', LF.every(x => Math.abs(x.tauEst - Math.min(x.tau, 3 - 1 / 30)) < tolT), LF.map(x => [x.tau, x.tauEst])]);
const mEnd = L.mean(F(R.dur - .2, '8-schluss'));
C.push(['0,5 s Schwarz am Schluss', mEnd < 1, mEnd]);
// sound: music in the song, silent in the Abspann
const au = L.audio(f);
X.sound = {song: L.peakDb(au, 0, at - 1), lastSongSec: L.rmsDb(au, at - 1, at), abspann: L.peakDb(au, at + .05, R.dur), fadeWin: L.peakDb(au, at, at + 1), logoWin: L.peakDb(au, at + LI, at + LI + LG)};
C.push(['Musik im Song', X.sound.song > -30, X.sound]);
C.push(['Ton ausgeblendet am Song-Ende (< −50 dBFS)', L.peakDb(au, at - .1, at) < -50, X.sound]);
C.push(['Abspann still (< −60 dBFS)', X.sound.abspann < -60, X.sound]);
C.push(['keine Konsolenfehler', errs.length === 0, errs]);
X.net404 = net404; X.medien = s.hits.filter(x => /medien/.test(x));
// contact sheet of the end
const { execSync } = await import('child_process');
execSync(`ffmpeg -v error -y -ss ${(at - .5).toFixed(2)} -i ${f} -vf "fps=4,scale=${FMT === '9:16' ? '135:240' : FMT === '1:1' ? '180:180' : '240:135'},tile=6x4" -frames:v 1 ${L.OUT + TAG}-blatt.png`);
L.report(TAG, C, X);
await b.close(); await s.close();
