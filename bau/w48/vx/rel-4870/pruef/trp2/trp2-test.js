// TRP2-Kern-Test: Stufen-Teil (trs) – Song-Aufnahme, gehaltene Noten an der Teil-Grenze, Konsolidieren + Teil-Änderung.
// Aufruf: node trp2-test.js <port> <unterordner: srv-a|srv-b>   (Server: python3 -m http.server <port> im trp2-Ordner)
const {chromium} = require('playwright');
const port = process.argv[2], sub = process.argv[3] || 'srv-b';
const URL = 'http://127.0.0.1:' + port + '/' + sub + '/index.html';
(async () => {
  const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const pg = await ctx.newPage(), errs = [];
  pg.on('pageerror', e => errs.push('pageerror ' + e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/abspann-logo|Failed to load resource/.test(m.text())) errs.push('console.error ' + m.text()); });
  await pg.goto(URL, {waitUntil: 'load'}); await pg.waitForTimeout(1800);
  const out = await pg.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const O = {};
    const mk = (same) => {
      const ft = S.tracks.findIndex(t => t && t.mel), c0 = S.tracks[1].clips[0];
      for (const s of [0, 1]) { const c = JSON.parse(JSON.stringify(c0)); c.notes = [{t: 0, d: 1, n: 72, v: .8}, {t: 2, d: 3.5, n: 76, v: .8}]; delete c.st; S.tracks[ft].clips[s] = c; }
      const sc = same ? [0, 0, 0, 0, 0] : [0, 1, 0, 1, 0];
      songFromChain(sc.map(scene => ({scene, bars: 2})));
      songChanged(); return ft;
    };
    const midi = () => {
      const m = buildMidi({mode: 'song'}); if (!m) return []; const by = m.bytes; let o = 14; const div = (by[12] << 8) | by[13], notes = [];
      while (o < by.length) {
        const len = (by[o + 4] << 24) | (by[o + 5] << 16) | (by[o + 6] << 8) | by[o + 7]; let p = o + 8, end = p + len, tk = 0, rs = 0, c;
        while (p < end) {
          let d = 0; do { c = by[p++]; d = (d << 7) | (c & 127); } while (c & 128); tk += d;
          let st = by[p]; if (st & 128) p++; else st = rs;
          if (st === 0xFF) { p++; let l = 0; do { c = by[p++]; l = (l << 7) | (c & 127); } while (c & 128); p += l; continue; }
          if (st === 0xF0 || st === 0xF7) { let l = 0; do { c = by[p++]; l = (l << 7) | (c & 127); } while (c & 128); p += l; continue; }
          rs = st; const hi = st & 0xF0, ch = st & 15, a = by[p++], b2 = hi === 0xC0 || hi === 0xD0 ? 0 : by[p++];
          if (hi === 0x90 && b2 > 0) notes.push(ch + '@' + (tk / div).toFixed(3) + ':' + a);
        }
        o = end;
      }
      return notes.sort();
    };
    SYNQUENZER.setBpm(240);
    // ---------- 1 Song-Aufnahme über einem Stufen-Teil (Teil 3 = Takt 5–6, +1 Stufe) ----------
    {
      const ft = mk(); SYNQUENZER.trp1.set({a: 4, b: 6, r: 1, deg: true});
      const tr2 = S.tracks.findIndex((t, i) => i !== ft && t && t.kind === 'synth' && t.follow !== false && !t.stimme && trp1TrOk(i));
      const res = {};
      for (const kind of ['mitAkkorden', 'ohneAkkorde']) {
        if (kind === 'ohneAkkorde') { S.song.carrier = [{beat: 0, target: null}]; songChanged(); }
        songPlayFrom(0); await wait(300);
        const off = R.songPlay.off, T3 = b2t(off + 18), T2 = b2t(off + 10), key = S.tracks[ft].clips[0].key || S.key;
        const white = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79];
        const r = {};
        for (const [nm, i] of [['fest', ft], ['folgt', tr2]]) {
          if (i < 0) continue;
          let bad3 = 0, bad2 = 0, det = [];
          for (const p of white) {
            const s3 = clipNoteFor(i, key, p, T3), o3 = outPitch(i, key, s3, T3); if (o3 !== p) { bad3++; if (det.length < 3) det.push(p + '→' + s3 + '→' + o3); }
            const s2 = clipNoteFor(i, key, p, T2), o2 = outPitch(i, key, s2, T2); if (o2 !== p) bad2++;
          }
          r[nm] = {teil3: bad3 + '/' + white.length, teil2: bad2 + '/' + white.length, det};
        }
        // MIDI: gespielte Note in Teil 3 aufnehmen (wie commitRecNote) und im Export nachsehen
        const p = 69, st = clipNoteFor(ft, key, p, b2t(off + 16.5));
        SYNQUENZER.stop(); await wait(150);
        const c = S.tracks[ft].clips[0]; c.notes.push({t: .5, d: .25, n: st, v: .8}); c.notes.sort((a, b) => a.t - b.t); clipChanged(ft, 0); songChanged();
        const N = midi(), ch = midiCh(ft), hit = N.filter(x => x.startsWith(ch + '@16.500:'));
        r.midi = {gespielt: p, gespeichert: st, imExport: hit.map(x => +x.split(':')[1])};
        c.notes = c.notes.filter(x => x.t !== .5); clipChanged(ft, 0);
        res[kind] = r;
      }
      O.aufnahme = res;
    }
    // ---------- 2 Gehaltene Noten an der Teil-Grenze (Takt 4→5 in den Stufen-Teil, 6→7 hinaus) ----------
    {
      const ft = mk(true); SYNQUENZER.trp1.set({a: 4, b: 6, r: 1, deg: true});
      O.gehaltenMarken = S.song.marks.map(m => m.a + '+' + m.len + (m.trs ? '*' : '')).join(' '); O.gehaltenLane = JSON.stringify(S.song.lanes[ft]);
      songPlayFrom(0); await wait(100);
      const off = R.songPlay.off, B = [16, 24].map(b => ({b, T: b2t(off + b)})), seen = new Set(), rows = [];
      const t0 = performance.now();
      while (performance.now() - t0 < 8000) {
        const now = AU.ctx.currentTime;
        for (const x of B) if (now > x.T + .03 && now < x.T + .25) {
          for (const v of VOICES) {
            if (v.dead || v.src !== 'clip' || v.track !== ft) continue;
            if (!(v.start < x.T - .01 && v.end > x.T + .05)) continue;
            const k = x.b + ':' + v.start.toFixed(3); if (seen.has(k)) continue; seen.add(k);
            const want = outPitch(v.track, v.clipKey, v.clipNote, x.T + .01), have = v.outAt(x.T + .01);
            rows.push({grenze: x.b / 4, clipNote: v.clipNote, vorher: v.outAt(x.T - .02), nachher: have, soll: want, ok: want === have});
          }
        }
        if (now > B[1].T + .4) break;
        await wait(10);
      }
      SYNQUENZER.stop(); await wait(150);
      O.gehalten = {n: rows.length, falsch: rows.filter(r => !r.ok).length, rows};
    }
    // ---------- 3 Konsolidieren, dann Teil ändern (auf alle Stellen) ----------
    {
      mk(); SYNQUENZER.trp1.set({a: 4, b: 6, r: 1, deg: true});
      const N0 = midi(); const r = konDo(4, 6, 'K'); const N1 = midi();
      const m = S.song.marks.find(x => x.a === 4), diff = (A, B) => A.filter(x => !B.includes(x)).length + B.filter(x => !A.includes(x)).length;
      const o = {kon: !!r, trsNachKon: JSON.stringify(m && m.trs), diffKon: diff(N0, N1) + '/' + N0.length};
      // derselbe Teil noch einmal ans Ende, dann Teil ändern → markReplaceAll baut alle Stellen neu
      const k = +m.part.slice(1) - 1, p = S.parts[k];
      p.lanes = p.lanes.map(l => l.map(e => Object.assign({}, e)));
      const n = markReplaceAll(S.song, p, null); songTidy(S.song); songChanged();
      const m2 = S.song.marks.find(x => x.a === 4), N2 = midi();
      o.trsNachTeilAenderung = JSON.stringify(m2 && m2.trs); o.diffTeilAenderung = diff(N0, N2) + '/' + N0.length; o.stellen = n;
      // Zurückholen
      const ok = konRestore(m2.id), N3 = midi(), m3 = S.song.marks.find(x => x.a === 4);
      o.zurueck = ok; o.trsNachZurueck = JSON.stringify(m3 && m3.trs); o.diffZurueck = diff(N0, N3) + '/' + N0.length;
      O.kons = o;
    }
    return O;
  });
  console.log(JSON.stringify({sub, ...out, errs}, null, 1));
  await br.close();
})();
