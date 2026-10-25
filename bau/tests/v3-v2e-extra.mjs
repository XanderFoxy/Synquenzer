// V2e extra: N7S-34 exact (W, SV.x = 0), 1-bar short form, MIDI marker names, Rundweg, view state without undo, 8 tracks (6.5)
import { openVp, mk, SETUP } from './v3-v2e-lib.mjs';
import { eq, mkCheck } from './v3-v2d-lib.mjs';
const {check, done} = mkCheck();
{
  const {b, p, errs, cdp} = await openVp('W');
  const T = mk(p, cdp), {E} = T;
  await E(SETUP(false));
  await E(() => { const Q = window.SYNQUENZER; const s = Q.song(); Q.setSong(Object.assign({}, s, {bars: 16, marks: [{id: 'M9', a: 8, len: 4, part: 'P1'}, {id: 'M8', a: 14, len: 1, part: 'P1'}]})); Q.songView(true); });
  await p.waitForTimeout(300);
  const i = await T.info();
  const m = i.marks.find(x => x.id === 'M9'), m1 = i.marks.find(x => x.id === 'M8');
  check('N7S-34 Marke a=8 len 4: x0 290, x1 430 (±1), Label STROPHE', i.x0 === 0 && m && Math.abs(m.x0 - 290) <= 1 && Math.abs(m.x1 - 430) <= 1 && m.label.replace('′', '') === 'STROPHE', m);   // ′: the test song does not hold the part's content there
  const c = await T.px(360, 9);
  check('N7S-34 Pixel in der Mitte amber', Math.abs(c[0] - 255) <= 12 && Math.abs(c[1] - 178) <= 12 && Math.abs(c[2] - 46) <= 12, c);
  const g = async bar => T.grey(bar * 36 + 9, 3, 18, 14);
  const gs = [7, 8, 9, 10, 11, 12].map(x => x);   // 0-based: bar 7 = „8“, 8..11 = „9“–„12“, 12 = „13“
  const v = []; for (const k of gs) v.push(await g(k));
  check('N7S-34 Nummern 9–12 nicht gezeichnet, 8 und 13 schon', v[0] > 3 && v[5] > 3 && v.slice(1, 5).every(x => x === 0), v);
  check('N7S-34 1-Takt-Marke zeigt die Kurzform „STR“', m1 && m1.label.replace('′', '') === 'STR', m1);
  // MIDI marker names: own name „nur hier“ is the marker
  await E(() => window.SYNQUENZER.markAction('M9', 'rename', {name: 'Outro', all: false}));
  const mkN = await E(() => { const m = window.SYNQUENZER.buildMidi({mode: 'song'}); const by = Array.from(m.bytes); const out = []; for (let i = 0; i < by.length - 3; i++) if (by[i] === 0xFF && by[i + 1] === 6) { const n = by[i + 2]; out.push(String.fromCharCode(...by.slice(i + 3, i + 3 + n))); } return out; });
  check('N7S-26 MIDI-Marker = Name der Marke (eigener Name „Outro“)', eq(mkN, ['Song', 'Outro', 'Strophe']), mkN);
  // Rundweg: save/load keeps marks with their own names
  const before = await E(() => JSON.stringify(window.SYNQUENZER.song().marks));
  await E(() => { const Q = window.SYNQUENZER; Q.importJSON(JSON.stringify(Q.project())); });
  await p.waitForTimeout(200);
  const after = await E(() => JSON.stringify(window.SYNQUENZER.song().marks));
  check('Rundweg Speichern/Laden: Marken samt eigenem Namen deep-equal', before === after, [before, after]);
  // view state: selection, chosen mark, Marken-Blatt → no undo entries
  const n0 = await T.undoN();
  await E(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(200);
  await T.tapCv(8 * 36 + 10, 9); await T.tapCv(8 * 36 + 10, 9); await T.tapCv(10 * 36 + 10, 9);
  const sel = (await T.info()).sel;
  check('Auswahl in der Marke T9–11 (Bereich), kein Undo-Eintrag', eq(sel, {a: 8, b: 10}) && (await T.undoN()) === n0, [sel, n0, await T.undoN()]);
  check('0 Konsolenfehler (W)', !errs.length, errs);
  await b.close();
}
for (const vp of ['P1', 'P2']) {
  const {b, p, errs, cdp} = await openVp(vp);
  const T = mk(p, cdp), {E} = T;
  await E(SETUP(true)); await E(() => { const Q = window.SYNQUENZER; Q.songView(true); }); await p.waitForTimeout(350);
  if (vp === 'P1') {
    // ▶ Ab hier while the song plays: the jump waits for the next bar line (6.2), nothing restarts before
    await E(() => { const Q = window.SYNQUENZER; Q.setBpm(120); Q.clearLog(); Q.songPlay(0); });
    await p.waitForFunction(() => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= 1.2; }, null, {timeout: 20000, polling: 10});
    await E(() => window.SYNQUENZER.songSelect(6, 6)); await p.waitForTimeout(150);
    const r0 = await T.rect('#rangeBar [data-a="play"]'); await T.tap(r0.x + r0.w / 2, r0.y + r0.h / 2, 50);
    const b0 = await E(() => window.SYNQUENZER.runtime().song.beat);
    await p.waitForFunction(() => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= 24.5; }, null, {timeout: 20000, polling: 10});
    const lg = await E(() => window.SYNQUENZER.noteLog(400).filter(n => n.beat != null).map(n => +n.beat.toFixed(2)));
    const tAt = await E(() => window.SYNQUENZER.runtime().song.beat);
    await E(() => window.SYNQUENZER.songPlay(false)); await p.waitForTimeout(150);
    check('▶ Ab hier bei laufendem Song: Sprung nach T7 am nächsten Taktstrich (vorher kein Sprung)', b0 < 4 && tAt >= 24.5 && tAt < 27, [b0, tAt]);
    // recording: the arrangement is not edited from the song view
    await E(() => { window.SYNQUENZER.songSelect(null); window.SYNQUENZER.songRecFrom({from: 0, mode: 'over', targets: {clips: true, chords: false, notes: false}, preroll: 0}); });
    await p.waitForTimeout(300);
    await T.tapCv(3 * 36 + 10, 8);
    check('Während ● SONG: Tipp auf eine Marke öffnet kein Marken-Blatt (Hinweis)', !(await T.pop()) && (await E(() => document.querySelector('.sv-hint').textContent)).includes('Aufnahme'), await T.pop());
    await E(() => window.SYNQUENZER.songRecEnd ? window.SYNQUENZER.songRecEnd() : window.SYNQUENZER.songRec(false)); await p.waitForTimeout(300);
    await E(() => window.SYNQUENZER.stop()); await p.waitForTimeout(200);
  }
  await E(() => { const Q = window.SYNQUENZER; Q.addTrack(); Q.addTrack(); }); await p.waitForTimeout(350);
  const i = await T.info();
  if (vp === 'P1') check('P1, 8 Spuren: 10 Zeilen à 31,1 px, kein Blättern', i.rows.length - 1 === 10 && Math.abs(i.rowH - 31.1) <= .5 && i.banks === 1, [i.rows, i.rowH]);
  else check('P2, 8 Spuren: Spurbank, Zeilen ≥ 26 px, DRUMS/AKK/MEL sichtbar, [▲▼] aktiv', i.banks > 1 && i.rowH >= 26 && i.rows.includes('DR') && !(await E(() => document.querySelector('#songView .sv-bank').disabled)), [i.rows, i.rowH, i.banks]);
  check(vp + ' 0 Konsolenfehler', !errs.length, errs);
  await b.close();
}
process.exit(done() ? 1 : 0);
