/* ND3 ===== own start programs (45 in 9 categories) and 4 kits for the drum model engine (Nachtrag 6, ND3) =====
   No factory data of any instrument: every value below comes from the ND3 table of the spec (start values) plus the CH LEVEL
   (mLvl) found by measurement for the ND3-03 level targets. A program is INIT SOUND (MDX.INIT) plus the listed fields.
   MDX.progs                 [{mName, mCat, ...m*}] read-only ("Werk"), 5 per category bd Sn to HH Cy Pc Be Tu Ef
   MDX.prog(name)            the full program (a new object, normalised) or null
   MDX.roleProg(slotId)      the program a pad gets on its first switch to source md (ND3 item 2)
   MDX.kits                  [{name, info, slots: {slotId: program}, md: kit effects}] all 12 pads source md */
(function () {
  const C = (cat, name, o) => Object.assign({mName: name, mCat: cat}, o);
  const kZu = {mWav: 'C2', mPit: 58, mSpc: 50, mFrq: 38, mDyf: 3, mDec: 14, mDm: 'E3', mNtyp: 'H2', mNfrq: 44, mNdec: 12, mNdm: 'E3', mNlv: 22, mMono: 1};
  const tom = {mWav: 'd2', mSpc: 36, mFrq: 18, mDyf: 4, mDec: 31, mDm: 'E1', mBnd: 14, mBt: 22, mNtyp: 'L1', mNfrq: 22, mNdec: 14, mNlv: 10, mCty: 'n3', mClv: 14};
  const P = [
    // bd - Bassdrums
    C('bd', 'Rund', {mWav: 'A1', mTlv: 46, mPit: 31, mDec: 28, mDm: 'E1', mBnd: 28, mBt: 18, mCty: 'P2', mClv: 22, mDty: 'dr', mDst: 6}),
    C('bd', 'Brücke', {mWav: 't1', mTlv: 44, mPit: 29, mFrq: 18, mDec: 34, mDm: 'E1', mBnd: 18, mBt: 20, mCty: 'H1', mClv: 18}),
    C('bd', 'Fellkick', {mWav: 'd1', mPit: 33, mSpc: 36, mFrq: 20, mDyf: 4, mDec: 28, mDm: 'E1', mBnd: 12, mBt: 16, mNtyp: 'L2', mNfrq: 20, mNdec: 12, mNlv: 12, mCty: 'n3', mClv: 20}),
    C('bd', 'FM-Druck', {mWav: 'F1', mSpc: 1, mFrq: 8, mDyf: 6, mPit: 34, mDec: 34, mDm: 'P', mBnd: 30, mBt: 15, mCty: 'P1', mClv: 25}),
    C('bd', 'Verzerrt', {mWav: 'A2', mTlv: 50, mFrq: 14, mPit: 32, mDec: 30, mDm: 'E1', mBnd: 25, mBt: 17, mCty: 'H2', mClv: 24, mDty: 'dr', mDst: 20, mEqf: 18, mEqg: -3}),
    // Sn - Snares
    C('Sn', 'Klassisch', {mWav: 't2', mSpc: 35, mFrq: 25, mPit: 54, mDec: 20, mDm: 'E1', mBnd: 8, mBt: 12, mNtyp: 'H1', mNfrq: 36, mNres: 2, mNdyf: 3, mNdec: 24, mNdm: 'E2', mNlv: 31, mCty: 'P2', mClv: 20, mTlv: 46}),
    C('Sn', 'Fell', {mWav: 'd5', mPit: 55, mSpc: 33, mFrq: 30, mDyf: 5, mDec: 22, mDm: 'E2', mBnd: 5, mBt: 10, mNtyp: 'b2', mNfrq: 40, mNres: 4, mNdec: 22, mNdm: 'E1', mNlv: 34, mCty: 'n1', mClv: 18}),
    C('Sn', 'Gated', {mWav: 'd2', mPit: 57, mSpc: 40, mFrq: 34, mDec: 22, mDm: 'E1', mNtyp: 'H2', mNfrq: 42, mNdec: 26, mNdm: 'G', mNlv: 13, mTlv: 50, mCty: 'P1', mClv: 18, mRvb: 14}),
    C('Sn', 'FM-Snare', {mWav: 'F2', mSpc: 22, mFrq: 24, mDyf: 5, mPit: 57, mDec: 18, mDm: 'E1', mBnd: 10, mBt: 10, mNtyp: 'L2', mNfrq: 44, mNdec: 22, mNdm: 'E1', mNlv: 28, mTlv: 50, mCty: 'n2', mClv: 16}),
    C('Sn', 'Rausch-Klatsch', {mTlv: 0, mNtyp: 'b2', mNfrq: 34, mNres: 3, mNdyf: 2, mNdec: 24, mNdm: 'E3', mNlv: 50, mCty: 'n2', mClv: 38, mRvb: 10}),
    // to - Toms
    C('to', 'Fell tief', Object.assign({mPit: 43}, tom)),
    C('to', 'Fell mitte', Object.assign({mPit: 48}, tom)),
    C('to', 'Fell hoch', Object.assign({mPit: 53}, tom)),
    C('to', 'Elektro-Tom', {mWav: 'A2', mSpc: 3, mFrq: 12, mPit: 50, mDec: 28, mDm: 'E1', mBnd: 30, mBt: 24, mCty: 'P2', mClv: 12}),
    C('to', 'Kessel', {mWav: 'd3', mPit: 45, mSpc: 33, mFrq: 16, mDec: 38, mDm: 'E1', mBnd: 4, mBt: 26, mCty: 'n3', mClv: 10, mRvb: 10}),
    // HH - Hi-Hats (mono group)
    C('HH', 'Zu', Object.assign({}, kZu)),
    C('HH', 'Offen', Object.assign({}, kZu, {mDec: 30, mDm: 'E1', mNdec: 28, mNdm: 'E1'})),
    C('HH', 'Pedal', Object.assign({}, kZu, {mDec: 10, mDm: 'E3', mNlv: 10, mCty: 'n1', mClv: 10})),
    C('HH', 'Ring-Metall', {mWav: 'C3', mPit: 62, mSpc: 55, mFrq: 40, mDec: 13, mDm: 'E2', mNtyp: 'H2', mNfrq: 45, mNdec: 11, mNlv: 16, mMono: 1}),
    C('HH', 'Rausch-Hat', {mTlv: 0, mNtyp: 'H2', mNfrq: 45, mNres: 6, mNdyf: 2, mNdec: 13, mNdm: 'E3', mNlv: 50, mCty: 'H3', mClv: 12}),
    // Cy - Becken
    C('Cy', 'Crash', {mWav: 'C1', mPit: 64, mSpc: 50, mFrq: 40, mDyf: 4, mDec: 40, mDm: 'E1', mNtyp: 'H1', mNfrq: 40, mNdec: 34, mNlv: 20}),
    C('Cy', 'Ride', {mWav: 'C1', mPit: 72, mSpc: 76, mFrq: 30, mDec: 42, mDm: 'E1', mCty: 'C1', mClv: 16}),
    C('Cy', 'China', {mWav: 'C3', mPit: 61, mSpc: 40, mFrq: 44, mDec: 38, mDm: 'E2', mDty: 'dr', mDst: 10}),
    C('Cy', 'Splash', {mWav: 'C1', mPit: 72, mSpc: 70, mFrq: 44, mDec: 35, mDm: 'E2', mNtyp: 'H1', mNfrq: 42, mNdec: 26, mNlv: 14}),
    C('Cy', 'Gong-Becken', {mWav: 'F3', mSpc: 41, mFrq: 50, mPit: 62, mDec: 42, mDm: 'E1', mBnd: -3, mBt: 30, mRvb: 16}),
    // Pc - Percussion
    C('Pc', 'Holzblock', {mWav: 'P3', mPit: 79, mSpc: 40, mFrq: 40, mDec: 14, mDm: 'E2', mCty: 'P1', mClv: 16}),
    C('Pc', 'Kuhglocke', {mWav: 'A4', mSpc: 31, mFrq: 30, mPit: 73, mDec: 22, mDm: 'E3', mEqf: 37, mEqg: 3}),
    C('Pc', 'Conga', {mWav: 'd7', mPit: 57, mSpc: 36, mFrq: 26, mDyf: 5, mDec: 26, mDm: 'E1', mBnd: 4, mBt: 12, mCty: 'n3', mClv: 12}),
    C('Pc', 'Shaker', {mTlv: 0, mNtyp: 'H1', mNfrq: 44, mNdec: 14, mNdm: 'L', mNlv: 40}),
    C('Pc', 'Klangholz', {mWav: 't1', mPit: 99, mFrq: 10, mDec: 12, mDm: 'E1', mCty: 'P1', mClv: 20}),
    // Be - Glocken
    C('Be', 'Glocke', {mWav: 'F3', mSpc: 29, mFrq: 26, mDyf: 3, mPit: 72, mDec: 40, mDm: 'E1', mRvb: 12}),
    C('Be', 'Röhre', {mWav: 'P4', mPit: 67, mSpc: 50, mFrq: 32, mDec: 42, mDm: 'E1'}),
    C('Be', 'Ring-Glocke', {mWav: 'r1', mSpc: 15, mFrq: 40, mPit: 76, mDec: 36, mDm: 'E1'}),
    C('Be', 'Kristall', {mWav: 'H6', mPit: 84, mSpc: 72, mFrq: 34, mDec: 38, mDm: 'E1', mRvb: 14}),
    C('Be', 'Doppelglocke', {mWav: 'F4', mSpc: 37, mFrq: 22, mPit: 81, mDec: 24, mDm: 'E2'}),
    // Tu - gestimmte Percussion
    C('Tu', 'Marimba', {mWav: 'P1', mPit: 60, mSpc: 24, mFrq: 22, mDyf: 4, mDec: 32, mDm: 'E1'}),
    C('Tu', 'Vibra', {mWav: 'P2', mPit: 65, mSpc: 24, mFrq: 26, mDec: 40, mDm: 'E1', mRvb: 14}),
    C('Tu', 'Xylo', {mWav: 'P3', mPit: 72, mSpc: 24, mFrq: 34, mDec: 22, mDm: 'E2'}),
    C('Tu', 'Stahltrommel', {mWav: 'H1', mPit: 62, mSpc: 64, mFrq: 30, mDec: 30, mDm: 'E1'}),
    C('Tu', 'Handtrommel', {mWav: 'd4', mPit: 62, mSpc: 33, mFrq: 28, mDyf: 5, mDec: 28, mDm: 'E1', mBnd: -8, mBt: 20, mCty: 'n3', mClv: 10}),
    // Ef - Effekte
    C('Ef', 'Laser', {mWav: 'A3', mSpc: 36, mFrq: 40, mPit: 84, mDec: 24, mDm: 'L', mBnd: 45, mBt: 26}),
    C('Ef', 'Tropfen', {mWav: 'A1', mPit: 79, mDec: 18, mDm: 'E1', mBnd: -36, mBt: 14, mRvb: 18}),
    C('Ef', 'Lo-Fi-Zap', {mWav: 'F2', mSpc: 70, mFrq: 36, mPit: 70, mDec: 22, mDm: 'E1', mBnd: 40, mBt: 22, mDty: 'SA', mDst: 30}),
    C('Ef', 'Ringmod-Blech', {mWav: 'r2', mSpc: 57, mFrq: 44, mPit: 55, mDec: 30, mDm: 'E2', mDty: 'rn', mDst: 26}),
    C('Ef', 'Rausch-Sweep', {mTlv: 0, mNtyp: 'b2', mNfrq: 20, mNres: 16, mNdyf: 9, mNdec: 36, mNdm: 'L', mNlv: 44, mDly: 20})];
  // CH LEVEL per program (measured: ND3-03 level targets bd/Sn/HH, toms equal; the other categories peak at -9 dBFS [A]; tests/md3-kits.mjs --calib)
  const LV = {};
  /*LV*/
  const progs = P.map(p => Object.freeze(MDX.norm(Object.assign({}, MDX.INIT, p, LV[p.mName] != null ? {mLvl: LV[p.mName]} : {}))));
  const byName = {}; for (const p of progs) byName[p.mName] = p;
  const prog = n => (byName[n] ? Object.assign({}, byName[n]) : null);
  const ROLE = {kick: 'Rund', snare: 'Klassisch', rim: 'Klangholz', clap: 'Rausch-Klatsch', hatC: 'Zu', hatO: 'Offen', tomL: 'Fell tief', tomM: 'Fell mitte', tomH: 'Fell hoch',
    cym: 'Crash', perc: 'Kuhglocke', shaker: 'Shaker'};
  // kit level trim [A] (dB on every pad's CH LEVEL, for the ND3-03 groove loudness -18 LUFS)
  const TRIM = {'Fell & Holz': 2.5, 'Gestimmt': -4.5};
  const kit = (name, info, names, md, ov) => { const slots = {}, tr = Math.pow(10, (TRIM[name] || 0) / 40);
    MDX.ORDER.forEach((id, i) => { const p = Object.assign(prog(names[i]), (ov && ov[id]) || {}); if (tr !== 1) p.mLvl = Math.max(0, Math.min(50, Math.round(p.mLvl * tr))); slots[id] = p; });
    return {name, info, slots, md: MDX.normKit(Object.assign({}, MDX.KIT0, md))}; };
  const kits = [
    kit('Fell & Holz', 'Felle, Holz und Rauschen · Hall Raum 2', ['Fellkick', 'Fell', 'Holzblock', 'Rausch-Klatsch', 'Zu', 'Offen', 'Fell tief', 'Fell mitte', 'Fell hoch', 'Crash', 'Conga', 'Shaker'],
      {rvT: 'r2'}, {kick: {mRvb: 6}, snare: {mRvb: 10}, rim: {mRvb: 8}, clap: {mRvb: 12}, hatC: {mRvb: 6}, hatO: {mRvb: 6}, tomL: {mRvb: 10}, tomM: {mRvb: 10}, tomH: {mRvb: 10}, cym: {mRvb: 12}, perc: {mRvb: 8}, shaker: {mRvb: 6}}),
    kit('Modell-Analog', 'Sinus-, Brücken- und Wellen-Klänge · Hall Platte 2', ['Rund', 'Klassisch', 'Klangholz', 'Rausch-Klatsch', 'Zu', 'Offen', 'Elektro-Tom', 'Elektro-Tom', 'Elektro-Tom', 'Ride', 'Kuhglocke', 'Rausch-Hat'],
      {rvT: 'p2'}, {tomL: {mPit: 45}, tomM: {mPit: 50}, tomH: {mPit: 55}}),
    kit('Gestimmt', 'Gestimmte Stäbe, Glocken und FM · Toms in Kurd-Stufen · Hall groß', ['Brücke', 'FM-Snare', 'Klangholz', 'Doppelglocke', 'Ring-Metall', 'Offen', 'Marimba', 'Marimba', 'Marimba', 'Gong-Becken', 'Vibra', 'Kristall'],
      {rvT: 'hA'}, {tomL: {mPit: 57}, tomM: {mPit: 64}, tomH: {mPit: 65}}),
    kit('Schräg', 'FM-Zonen, Ringmodulation, Laser · Echo Achtel', ['FM-Druck', 'FM-Snare', 'Lo-Fi-Zap', 'Ringmod-Blech', 'Rausch-Hat', 'Offen', 'Laser', 'Tropfen', 'Elektro-Tom', 'China', 'Ring-Glocke', 'Rausch-Sweep'],
      {dlM: 'b', dlB: 150}, {hatO: {mWav: 'C3'}})];
  MDX.progs = progs; MDX.prog = prog; MDX.ROLE = ROLE; MDX.roleProg = id => (ROLE[id] ? prog(ROLE[id]) : null); MDX.kits = kits;
  MDX.CATS = ['bd', 'Sn', 'to', 'HH', 'Cy', 'Pc', 'Be', 'Tu', 'Ef'];
})();
