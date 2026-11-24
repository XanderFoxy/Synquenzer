// Zeit Quelle → Ziel und zurück (lineare Abschnitte zwischen den Ankern)
function zur(anker, t) {
  if (!anker || anker.length < 2) return t;
  let lo = 0, hi = anker.length - 1;
  if (t <= anker[0].dst) return anker[0].src + (t - anker[0].dst);
  if (t >= anker[hi].dst) return anker[hi].src + (t - anker[hi].dst);
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (anker[m].dst <= t) lo = m; else hi = m; }
  const a = anker[lo], b = anker[hi]; return a.src + (t - a.dst) / (b.dst - a.dst) * (b.src - a.src);
}

// Noten in die gewarpte Zeit bringen: t0/t1 abbilden, Tonhöhenkurve neu abtasten (kurve[j] gilt bei t0 + j·hop)
function notenAbbilden(nn, anker) {
  if (!anker || anker.length < 2) return nn;
  return nn.map((n) => {
    const hop = n.hop || 0.005, k = kurveMidi(n), K = k.length;
    const t0 = abb(anker, n.t0), t1 = Math.max(t0 + hop, abb(anker, n.t1));
    const L = Math.max(1, Math.round((t1 - t0) / hop)), kurve = new Array(L);
    for (let j = 0; j < L; j++) {
      const f = (zur(anker, t0 + j * hop) - n.t0) / hop, i = Math.max(0, Math.min(K - 1, Math.floor(f))), fr = Math.max(0, Math.min(1, f - i));
      const a = k[i], b = k[Math.min(K - 1, i + 1)];
      kurve[j] = !(a === a) ? b : !(b === b) ? a : a + (b - a) * fr;
    }
    const o = Object.assign({}, n, { t0, t1, kurve, hop });
    delete o.i0; delete o.i1;
    return o;
  });
}

// Spitze/Vorlauf je Note (aus den Transienten derselben Zeitachse)
function mitSpitzen(nn, tr) {
  return nn.map((n) => {
    const sp = tr.find((t) => t.peak >= n.t0 - 0.06 && t.peak <= Math.min(n.t1, n.t0 + 0.25));
    return Object.assign({}, n, { peak: sp ? sp.peak : null, onset: sp ? Math.min(sp.onset, sp.peak) : null });
  });
}

// Reihenfolge: Reinigen → Tonhöhe → Timing. Das Timing kommt zuletzt, damit die Spitzen des FERTIGEN Klangs
// genau auf dem Raster liegen (die Tonhöhenkorrektur verschiebt Anschläge sonst um einige Millisekunden).
// Die Zeitdehnung (WSOLA) ändert die Tonhöhe nicht.
async function auto(x, sr, opt = {}, melde = () => {}) {
  const m = await module();
  const bericht = { fehlt: m.fehlt };
  // 1) Reinigen
  let gereinigt = x;
  if (m.rein && opt.reinigen !== false) {
    const r = m.rein.reinigen(x, sr, Object.assign({}, opt.reinigen || {}, { fortschritt: (s, p) => melde('reinigen', p, s) }));
    gereinigt = r.y; bericht.reinigen = r.bericht;
  }
  melde('reinigen', 100);
  // 2) Tonhöhe: verfolgen → Noten → je Note zur Stufe
  let noten = [], gestimmt = gereinigt;
  const ziel = Object.assign({ skala: 'chromatisch', staerke: 1, uebergang_ms: 40, vibratoErhalten: true }, opt.ziel || {});
  if (m.ton) {
    const spur = m.ton.verfolgen(gereinigt, sr, 0.005, { fortschritt: (p) => melde('tonhoehe', 0.5 * p) });
    noten = m.ton.noten(spur, opt.notenOpt || {}) || [];
    melde('tonhoehe', 50);
    if (opt.tonhoehe !== false && ziel.staerke > 0 && noten.length) {
      gestimmt = m.ton.korrigieren(gereinigt, sr, noten, Object.assign({}, ziel, { fortschritt: (p) => melde('tonhoehe', 50 + 0.5 * p) })) || gereinigt;
      bericht.ton = { noten: noten.length, gestimmt: true };
    } else bericht.ton = { noten: noten.length, gestimmt: false };
  } else {
    noten = ersatzNoten(ersatzSpur(gereinigt, sr));
    bericht.ton = { noten: noten.length, gestimmt: false, ersatz: true };
  }
  melde('tonhoehe', 100);
  // 3) Timing: Spitzen des gestimmten Klangs auf die Rasterlinien, Vorlauf bleibt links davor
  let y = gestimmt, anker = null, tr = [];
  const raster = opt.raster || {};
  if (m.tim) {
    tr = m.tim.transienten(gestimmt, sr);
    melde('timing', 10);
    if (opt.timing !== false && raster.teilung !== 'frei' && (raster.staerke ?? 1) > 0 && tr.length) {
      anker = m.tim.zeitkarte(tr, raster);
      melde('timing', 20);
      y = m.tim.warp(gestimmt, sr, anker, { stand: (p) => melde('timing', 20 + 0.7 * p) });
      bericht.timing = { pins: anker.pins ? anker.pins.length : 0, frei: anker.frei || 0, transienten: tr.length };
      // 4) Nachreinigen: Knackser, die beim Dehnen an Konsonanten entstehen können (nur der Klick-Schritt)
      const kl = opt.reinigen === false ? false : (opt.reinigen || {}).klicks;
      if (m.rein && kl !== false) {
        try {
          const r = m.rein.reinigen(y, sr, { klicks: kl === undefined ? true : kl, brumm: false, rauschen: false, schmatzer: false, atmer: false, ausgleich: false });
          y = r.y; bericht.timing.nachKlicks = (r.bericht.klicks && r.bericht.klicks.anzahl) || 0;
        } catch (e) { /* ohne Nachreinigung */ }
      }
      melde('timing', 95);
    } else bericht.timing = { pins: 0, transienten: tr.length, aus: true };
  }
  melde('timing', 100);
  // Noten: roh = vor der Korrektur (Zeit wie „Gereinigt“), Anzeige = wie sie nach Korrektur + Timing klingen
  const gestimmtJa = bericht.ton.gestimmt;
  let anzeige = noten;
  if (gestimmtJa) {
    if (m.ton && m.ton.korrigierteNoten) { try { anzeige = m.ton.korrigierteNoten(noten, ziel); } catch (e) { anzeige = null; } }
    if (!anzeige || anzeige.length !== noten.length) anzeige = noten.map((n) => {
      const ist = n.midi + (n.cent || 0) / 100, z = stufe(ist, ziel), d = (z - ist) * Math.min(1, Math.max(0, ziel.staerke));
      const kurve = Array.from(kurveMidi(n), (v) => v + d), neu = ist + d, mi = Math.round(neu);
      return Object.assign({}, n, { kurve, midi: mi, cent: Math.round((neu - mi) * 100) });
    });
  }
  const norm = (n, i) => Object.assign({}, n, { id: n.id ?? i + 1, kurve: Array.from(kurveMidi(n)), hop: n.hop ?? 0.005 });
  const roh = mitSpitzen(noten.map(norm), tr);
  const trZiel = anker ? tr.map((t) => ({ peak: abb(anker, t.peak), onset: abb(anker, t.onset), staerke: t.staerke })) : tr;
  if (anker) { try { bericht.timing.abweichung = m.tim.rasterAbweichung(trZiel, raster); delete bericht.timing.abweichung.werte; } catch (e) { /* egal */ } }
  const fertig = mitSpitzen(notenAbbilden(anzeige.map(norm), anker), trZiel).map((n, i) => {
    const alt = noten[i] || n;
    return Object.assign(n, { vorher: alt.midi + (alt.cent || 0) / 100 });
  });
  if (gestimmtJa) bericht.ton.gestimmtAnzahl = fertig.filter((n) => Math.abs(n.midi + n.cent / 100 - n.vorher) > 0.05).length;
  melde('tonhoehe', 100);
  return { y, gereinigt, noten: fertig, roh, anker, bericht, tr: trZiel };
}

