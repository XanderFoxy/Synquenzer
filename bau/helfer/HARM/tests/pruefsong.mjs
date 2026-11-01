// HARM: der Prüf-Song (Läufe, Durchgangsnoten, Arpeggien, Drums) und seine Akkord-Zeilen – als Text für page.evaluate
// Tonart je Fall; Clips in der Projekt-Tonart; je Takt ein Akkord (Träger) in song.carrier. Wichtig: nach __harmSong ≥ 700 ms
// warten (__harmSettle), damit die automatische Tonart-Analyse (400 ms) gelaufen ist – so hört man den Song auch in der App
export const FAELLE = {
  'A-Moll i–VI–III–VII / i–VI–iv–V': {key: {root: 9, scale: 'aeolian'}, chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E']},
  'C-Dur I–vi–IV–V': {key: {root: 0, scale: 'ionian'}, chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G']},
  'A-Moll Am–F–C–G (Dur-Bezug C)': {key: {root: 0, scale: 'ionian'}, chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G']},
};
// Stufen (0..6, Oktaven über 7 hinaus) + chromatische Durchgänge (#) in der Tonart key -> MIDI
export const SONG_JS = `(() => {
  const SC = {ionian: [0, 2, 4, 5, 7, 9, 11], aeolian: [0, 2, 3, 5, 7, 8, 10]};
  window.__harmSong = (key, chords, o = {}) => {
    const Q = window.SYNQUENZER, S0 = SC[key.scale], base = 48 + key.root;
    const deg = (d, sharp) => base + 12 * Math.floor(d / 7) + S0[((d % 7) + 7) % 7] + (sharp ? 1 : 0);
    const N = (t, n, d, v) => ({t, d: d || .2, n, v: v || .8});
    // Lauf 1 (Sechzehntel, 2 Takte): Tonleiter hoch über 1,5 Oktaven und zurück, am Taktende ein chromatischer Leitton
    const L1 = []; const up = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], dn = up.slice().reverse();
    up.forEach((d, k) => L1.push(N(k * .25, deg(d), .22)));
    dn.forEach((d, k) => L1.push(N(4 + k * .25, deg(d), .22)));
    L1[15] = N(15 * .25, deg(21, true), .22);                   // chromatischer Durchgang vor dem Taktstrich
    L1[31] = N(31 * .25, deg(6, true), .22);                    // Leitton (A-Moll: G♯) vor dem Taktstrich
    // Lauf 2 (Achtel mit diatonischen Durchgangsnoten zwischen Akkordtönen)
    const L2 = []; [14, 15, 16, 17, 18, 17, 16, 15, 14, 16, 18, 17, 16, 15, 14, 13].forEach((d, k) => L2.push(N(k * .5, deg(d), .45)));
    // Arpeggio (Sechzehntel): 1 3 5 8 5 3 je Takt-Hälfte
    const AR = []; for (let k = 0; k < 32; k++) AR.push(N(k * .25, deg([0, 2, 4, 7, 4, 2, 0, 2][k % 8] + 14), .2));
    // Lauf 3 (Achtel/Viertel, 1 Takt): Stufen 1 2 3 4 – langer chromatischer Durchgang 4♯ (0,9 Schläge) – 5 6 (wie G-P2a OS2);
    // dieser Durchgang ließ die verzögerte Tonart-Analyse den Clip-Bezug umstufen (C-Dur → C-Lydisch)
    const L3 = [[0, 0, .4], [.5, 1, .4], [1, 2, .4], [1.5, 3, .4], [2, 3, .9, 1], [3, 4, .4], [3.5, 5, .4]].map(([t, d, du, sh]) => N(t, deg(d + 7, sh), du));
    const DR = []; for (let k = 0; k < 8; k++) { DR.push({t: k, d: .1, n: k % 2 ? 38 : 36, v: .9}); DR.push({t: k + .5, d: .1, n: 42, v: .6}); }
    Q.newProject({init: true});
    setProjectKey({root: key.root, scale: key.scale});
    Q.setHarmony(Object.assign({mode: 'chord', single: 'key', minor: 'aeolian', keyAware: true, octaveMode: 'nearest', latch: true}, o.harmony || {}));
    Q.setClip(0, 0, {len: 2, key: {root: key.root, scale: key.scale}, notes: L1});
    Q.setClip(1, 0, {len: 2, key: {root: key.root, scale: key.scale}, notes: L2});
    Q.setClip(2, 0, {len: 2, key: {root: key.root, scale: key.scale}, notes: AR});
    Q.setClip(3, 0, {len: 1, key: {root: key.root, scale: key.scale}, notes: L3});
    Q.setClip(4, 0, {len: 2, key: {root: key.root, scale: key.scale}, notes: DR});
    const lanes = [0, 1, 2, 3, 4, 5].map(t => (t <= 4 ? [{bar: 0, slot: 0}] : []));
    Q.setSong({bars: chords.length, lanes, carrier: chords.map((c, b) => ({beat: b * 4, target: Q.parseChord(c)}))});
    Q.setBpm(o.bpm || 240);
    return {L1: L1.map(n => n.n), L2: L2.map(n => n.n), AR: AR.map(n => n.n), L3: L3.map(n => n.n)};
  };
  window.__harmSettle = () => new Promise(r => setTimeout(() => { try { applySceneKeys(0); } catch (e) {} r(S.tracks.slice(0, 4).map(t => t.clips[0] && t.clips[0].key ? t.clips[0].key.scale : null)); }, 700));
  return 1;
})()`;
