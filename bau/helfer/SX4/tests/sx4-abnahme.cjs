// SX4 Abnahme: je Punkt ein kurzer Test, Touch (CDP), 428×926 und 926×428. Aufruf: node tests/sx4-abnahme.cjs [index.html] [shot-präfix]
const { chromium } = require('playwright');
const file = require('path').resolve(process.argv[2] || __dirname + '/../index.html'), shot = process.argv[3] || '';
let bad = 0; const say = (ok, m) => { console.log((ok ? 'OK  ' : 'FEHL') + ' ' + m); if (!ok) bad++; };
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[428, 926], [926, 428]]) {
    const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
    const errs = []; p.on('pageerror', e => errs.push(String(e)));
    await p.goto('file://' + file); await p.waitForTimeout(1200);
    await p.evaluate(() => { ensureAudio(); }); await p.waitForTimeout(300);
    const cdp = await p.context().newCDPSession(p);
    const T = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
    const box = async sel => { const r = await p.locator(sel).first().boundingBox(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height}; };
    const tap = async (q) => { await T('touchStart', q.x, q.y); await p.waitForTimeout(40); await T('touchEnd'); await p.waitForTimeout(60); };
    const hold = async (q, ms = 600) => { await T('touchStart', q.x, q.y); await p.waitForTimeout(ms); await T('touchEnd'); await p.waitForTimeout(60); };
    const drag = async (q, dx) => { await T('touchStart', q.x, q.y); for (let k = 1; k <= 8; k++) { await T('touchMove', q.x + dx * k / 8, q.y + 1); await p.waitForTimeout(16); } await T('touchEnd'); await p.waitForTimeout(60); };
    const info = () => p.evaluate(() => SYNQUENZER.sx4Info());
    const U = () => p.evaluate(() => UNDO.length);
    const tag = w + '×' + h + ' ';
    // 1 Matrix: Tipp = stumm (+ gewählt), 1 Undo, ↶ holt es zurück
    const th1 = '#clipGrid .th[data-t="1"]', hb = await box(th1);
    // Querformat: die Kopf-Höhe ist Bestand (R-4310: 96×36, Song-Name 56×27) – SX4 ändert das Raster nicht
    say(w > h || (hb.h >= 44 && hb.w >= 44), tag + 'Matrix-Spurkopf ' + Math.round(hb.w) + '×' + Math.round(hb.h) + (w > h ? ' (Bestand, unverändert)' : ' ≥ 44 px'));
    let u0 = await U(); await tap(hb); let I = await info();
    say(I.mute[1] && (await p.evaluate(() => R.selT)) === 1 && (await U()) === u0 + 1, tag + 'Matrix Tipp = stumm + gewählt, 1 Undo');
    await p.evaluate(() => undo()); I = await info(); say(!I.mute[1], tag + 'Matrix ↶ = wieder laut');
    // 2 Halten = Solo (mehrere), andere Ketten still, sichtbar; Offline/„Song als Audio“ ohne Solo
    await hold(hb); await hold(await box('#clipGrid .th[data-t="3"]')); I = await info();
    say(I.solo.join() === '1,3' && I.gains[1] === 1 && I.gains[3] === 1 && I.gains[0] === 0 && I.gains[5] === 0 && !I.mute[1], tag + 'Halten = Solo, 2 Solos, Gains ' + I.gains.join(','));
    say(await p.evaluate(() => document.querySelectorAll('#clipGrid .th.sx4so').length === 2 && document.querySelectorAll('#clipGrid .th.sx4dim').length >= 3), tag + 'Solo sichtbar (S + gedimmt)');
    if (shot && w === 428) await p.screenshot({path: shot + '-solo-' + w + '.png'});
    say(await p.evaluate(() => { const o = AU.ctx; AU.ctx = new OfflineAudioContext(2, 128, 48000); const a = sx4SoloLive(), b = sx4Pass(0); AU.ctx = o; SREC.on = true; const c = sx4SoloLive(); SREC.on = false; return !a && b && !c && sx4SoloLive(); }), tag + 'Export/Render und „Song als Audio“ = ohne Solo');
    await hold(hb); await hold(await box('#clipGrid .th[data-t="3"]')); I = await info();
    say(!I.solo.length && I.gains.every(g => g === 1), tag + 'Solo wieder aus, alle Gains 1');
    // 3 waagrecht schieben = Lautstärke mit dB, 1 Undo; Doppeltipp = 0 dB, noch einmal = Ausgangswert
    const v0 = (await info()).vol[1]; u0 = await U(); await drag(hb, -60); I = await info();
    const lbl = await p.evaluate(() => { const v = document.querySelector('#clipGrid .th[data-t="1"] .sx4v'); return v && getComputedStyle(v).display !== 'none' ? v.textContent : ''; });
    say(I.vol[1] < v0 - .1 && (await U()) === u0 + 1 && /dB/.test(lbl) && !I.mute[1], tag + 'Schieben = Lautstärke ' + v0.toFixed(2) + '→' + I.vol[1].toFixed(2) + ' „' + lbl + '“, 1 Undo, nicht stumm');
    if (shot && w === 428) await p.screenshot({path: shot + '-vol-' + w + '.png'});
    await tap(hb); await tap(hb); I = await info(); say(Math.abs(I.vol[1] - 1) < 1e-6 && !I.mute[1], tag + 'Doppeltipp Schieber = 0 dB (vol ' + I.vol[1] + ')');
    await tap(hb); await tap(hb); I = await info(); say(Math.abs(I.vol[1] - v0) < 1e-6, tag + 'Doppeltipp noch einmal = Ausgangswert');
    await p.evaluate(() => { undo(); undo(); undo(); }); I = await info(); say(Math.abs(I.vol[1] - v0) < 1e-6, tag + '3× ↶ = Ausgangswert');
    await p.waitForTimeout(1700); I = await info(); say(I.slider === -1, tag + 'Schieber verschwindet nach 1,6 s');
    // 4 ■ halten = Spur-Blatt (vorher Spurkopf halten), kein Stopp
    await hold(await box('#clipGrid .stp[data-t="1"]')); await p.waitForTimeout(150);
    say(await p.evaluate(() => !!document.querySelector('.trksheet')), tag + '■ halten = Spur-Blatt');
    await p.evaluate(() => closePop()); await p.waitForTimeout(150);
    // 5 Song: Tipp = stumm, Halten = Solo, Schieben = Lautstärke (STIMME/Chor wie andere Spuren: gleiche Wege)
    await p.evaluate(() => SYNQUENZER.songView(true)); await p.waitForTimeout(500);
    const sl = await box('.sv-l.trk[data-t="2"]');
    u0 = await U(); await tap(sl); I = await info(); say(I.mute[2] && (await U()) === u0 + 1, tag + 'Song Tipp = stumm (' + Math.round(sl.w) + '×' + Math.round(sl.h) + ')');
    await tap(sl); await hold(sl); I = await info(); say(!I.mute[2] && I.solo.join() === '2' && I.gains[0] === 0, tag + 'Song Halten = Solo');
    await drag(sl, 40); I = await info(); say(I.vol[2] > .8 && I.solo.join() === '2', tag + 'Song Schieben = Lautstärke ' + I.vol[2].toFixed(2));
    if (shot) await p.screenshot({path: shot + '-song-' + w + '.png'});
    await p.evaluate(() => SYNQUENZER.sx4SoloClear());
    say(!errs.length, tag + 'keine Seitenfehler ' + errs.join(' | '));
    await p.close();
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
