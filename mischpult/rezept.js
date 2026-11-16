// Mischpult 0.1 – rezept.js: Mischrezept als JSON (Format mischpult-rezept/1) und als lesbarer Text (KONZEPT C.11).
// Reglernamen aus recherche/cubasis.json (Channel Strip › Cut Filter/Compressor, StudioEQ Band 1–4, Master Strip …).
// Hier – und nur hier sowie in der Export-Anleitung – darf der Name der DAW-App stehen.
import { ROLLEN_ANZEIGE, GESANG } from './analyse.js';
import { zahl } from './messen.js';

const r1 = x => Math.round(x * 10) / 10, r2 = x => Math.round(x * 100) / 100;
const TYP = { peak: 'Peak', lowshelf: 'Low Shelf', highshelf: 'High Shelf' };
const hz = f => f >= 1000 ? zahl(f / 1000, f % 1000 ? 1 : 0) + ' kHz' : Math.round(f) + ' Hz';
const dbS = (x, d = 1) => (x > 0 ? '+' : '') + zahl(x, d) + ' dB';
const spurName = n => String(n || '').replace(/\.[a-z0-9]{2,5}$/i, '');   // Sidechain nennt die Spur, nicht die Datei
/** StudioEQ: Band 1 und 4 können Shelf/Cut, Band 2 und 3 sind immer parametrisch → Low Shelf auf 1, High Shelf auf 4, Glocken auf 2/3. */
export function eqBaender(filter) {
  const frei = [1, 2, 3, 4], aus = [], nimm = b => { frei.splice(frei.indexOf(b), 1); return b; };
  const ls = filter.filter(f => f.typ === 'lowshelf'), hs = filter.filter(f => f.typ === 'highshelf'), pk = filter.filter(f => f.typ !== 'lowshelf' && f.typ !== 'highshelf').sort((a, b) => a.hz - b.hz);
  if (ls[0]) aus.push({ ...ls[0], band: nimm(1) }); if (hs[0]) aus.push({ ...hs[0], band: nimm(4) });
  for (const f of pk) { if (!frei.length) break; const b = frei.includes(2) ? 2 : frei.includes(3) ? 3 : frei[0]; aus.push({ ...f, band: nimm(b) }); }
  return aus.sort((a, b) => a.band - b.band);
}

/** rezeptJson({projekt, plan, P, messung, pruefung, eingriff, ziel, song, version}) → Objekt (mischpult-rezept/1) */
export function rezeptJson({ projekt, plan, P, messung, pruefung, eingriff, ziel, song, version }) {
  const spuren = plan.spuren.map((ps, k) => {
    const daw = [];
    if (ps.pegelDb) daw.push({ wo: 'Kanal', regler: 'Volume fader', wert: `${dbS(ps.pegelDb)} gegenüber jetzt` });
    if (ps.lowCutHz > 20) daw.push({ wo: 'Channel Strip › Cut Filter', regler: 'Low Cut', wert: hz(ps.lowCutHz) });
    for (const e of ps.eq) daw.push({ wo: e.band ? `StudioEQ Band ${e.band}` : 'zweiter StudioEQ (Insert)', regler: 'Type / Frequency / Gain / Q', wert: `${TYP[e.typ]}, ${hz(e.hz)}, ${dbS(e.db)}, Q ${zahl(e.q, 1)}` });
    if (ps.komp && ps.ducking) daw.push({ wo: 'Insert › Compressor (eigener Effekt, nicht im Channel Strip)', regler: 'Ratio / Attack / Release / Output', wert: `${zahl(ps.komp.ratio, 1)}:1, ${zahl(ps.komp.attackMs, 0)} ms, ${zahl(ps.komp.releaseMs, 0)} ms, Output so, dass die Spur gleich laut bleibt` });
    else if (ps.komp) daw.push({ wo: 'Channel Strip › Compressor', regler: 'Ratio / Attack / Release / Make Up', wert: `${zahl(ps.komp.ratio, 1)}:1, ${zahl(ps.komp.attackMs, 0)} ms, ${zahl(ps.komp.releaseMs, 0)} ms, Auto` });
    if (ps.ducking) daw.push({ wo: 'Channel Strip › Compressor mit Sidechain', regler: 'Sidechain / Threshold', wert: `Sidechain = Spur „${spurName(ps.ducking.von)}“; Threshold senken, bis etwa ${zahl(ps.ducking.naeherungDawDb, 0)} dB Reduktion bei jedem Kick (näherungsweise)` });
    if (ps.dynEq) daw.push({ wo: `StudioEQ Band 3`, regler: 'Ersatz für den dynamischen EQ', wert: `Peak, ${hz(ps.dynEq.hz)}, −1,5 dB (näherungsweise)` });
    if (ps.sendDb != null) daw.push({ wo: 'Send', regler: 'Send an Bus mit Reverb', wert: `Predelay ${zahl(plan.raum.predelayMs, 0)} ms, Time ${zahl(plan.raum.rt60S, 1)} s` });
    return {
      datei: ps.name, rolle: ps.rolle, hauptsache: ps.hauptsache, so_lassen: ps.solassen,
      l_rel_vorher: ps.lrelVorher, fenster: ps.fenster, pegel_db: ps.pegelDb, pegel_grund: ps.pegelGrund,
      low_cut_hz: ps.lowCutHz, eq: ps.eq.map(e => ({ band: e.band, typ: e.typ, hz: e.hz, db: e.db, q: e.q, grund: e.grund })),
      kompressor: ps.komp ? { ratio: ps.komp.ratio, attack_ms: ps.komp.attackMs, release_ms: ps.komp.releaseMs, knie_db: ps.komp.knieDb, ziel_gr_db: ps.komp.zielGrDb, make_up: 'auto', schwelle_db_intern: ps.komp.threshDb } : null,
      ducking: ps.ducking ? { von: ps.ducking.von, von_spur: spurName(ps.ducking.von), tiefe_db: ps.ducking.tiefeDb, unter_hz: ps.ducking.unterHz, release_ms: ps.ducking.releaseMs, naeherung_daw_db: ps.ducking.naeherungDawDb } : null,
      dyn_eq: ps.dynEq ? { hz: ps.dynEq.hz, db: ps.dynEq.db, q: ps.dynEq.q, grund: ps.dynEq.grund } : null,
      hoehen_db: ps.hoehenDb,
      raum: { send: ps.sendDb != null, send_db: ps.sendDb ?? null, hall_rel_lu_gemessen: ps.hallRelLu, hinweis: null },
      was: ps.texte, daw,
    };
  });
  const mdaw = [];
  if (P.monoBassHz) mdaw.push({ wo: 'Master Strip › Stereo Imager', regler: `Band 1 bis ${P.monoBassHz} Hz: Width`, wert: '0 %' });
  const kl = [...P.klang].sort((a, b) => Math.abs(b.db) - Math.abs(a.db)).slice(0, 4).sort((a, b) => a.hz - b.hz);
  eqBaender(kl).forEach(f => mdaw.push({ wo: `Master › StudioEQ Band ${f.band}`, regler: 'Type / Frequency / Gain / Q', wert: `${TYP[f.typ]}, ${hz(f.hz)}, ${dbS(f.db)}, Q ${zahl(f.q, 1)}` }));
  mdaw.push({ wo: 'Master › Compressor', regler: 'Ratio / Attack / Release', wert: `${zahl(P.glue.ratio, 0)}:1, ${zahl(P.glue.attackMs, 0)} ms, ${zahl(P.glue.releaseMs, 0)} ms` });
  mdaw.push({ wo: 'Master Strip › Loudness Maximizer', regler: 'Output', wert: dbS(P.ceilingDbtp) });
  mdaw.push({ wo: 'Brickwall Limiter', regler: 'Threshold', wert: dbS(P.ceilingDbtp) });
  return {
    format: 'mischpult-rezept', v: 1, mischpult: version, erstellt: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    song, sr: projekt.sr, laenge_s: r2(projekt.frames / projekt.sr), bpm: projekt.bpm, ts: projekt.ts,
    ziel: { name: ziel, lufs: P.zielLufs, tp_dbtp: P.ceilingDbtp }, eingriff,
    messung: { vorher: pick(messung.vorher, ['lufs', 'tp', 'lra', 'plr', 'clip']), nachher: pick(messung.nachher, ['lufs', 'tp', 'lra', 'plr', 'clip', 'korrTief', 'monoVerlust']), instrumental: messung.instrumental, klang_abstand: messung.klangAbstand },
    premaster_gain_db: r2(plan === undefined ? 0 : projekt.cache.vm.get(plan.eingriff + JSON.stringify(projekt.rollen))?.preDb ?? 0),
    spuren,
    master: {
      subsonic_hz: P.subsonicHz, klang: P.klang.map(f => ({ typ: f.typ, hz: f.hz, db: f.db, q: f.q })), multiband: null, saettigung: 0,
      glue: { ratio: P.glue.ratio, attack_ms: P.glue.attackMs, release_ms: P.glue.releaseMs, gr_db: P.glue.zielGrDb, gr_gemessen_db: messung.nachher.glueMittelDb },
      mono_bass_hz: P.monoBassHz, softclip: P.softclip, limiter: { ceiling_dbtp: P.ceilingDbtp, release_ms: P.releaseMs, gr_mittel_db: messung.nachher.limMittelDb, gr_max_db: messung.nachher.limMaxDb },
      gain_db: r2(P.gainDb), zielkurve: P.zielkurve, daw: mdaw,
    },
    pruefung, hinweise: (projekt.hinweise || []).map(h => h.satz),
  };
}
function pick(o, keys) { const r = {}; for (const k of keys) if (o && o[k] != null) r[k] = o[k]; return r; }

/** rezeptText(json) → lesbarer Text (jede Zahl stammt aus dem JSON). */
export function rezeptText(j) {
  const L = [], d = new Date(j.erstellt), datum = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const ok = j.pruefung.reduce((m, p) => (m[p.mass] = p, m), {});
  L.push(`MISCHREZEPT · Song „${j.song}“ · Mischpult ${j.mischpult} · ${datum}`);
  L.push('Dein Master ist schon fertig. Dieses Rezept brauchst du nur, wenn du selbst in deiner DAW nachstellen willst.');
  L.push('Die Regler-Namen sind die aus Cubasis (englisch), mit deutscher Erklärung.');
  L.push(`Ziel: ${j.ziel.name === 'laut' ? 'Laut' : 'Streaming (−14)'} · Eingriff: ${j.eingriff === 'kraeftig' ? 'kräftig' : j.eingriff} · Tempo ${zahl(j.bpm, 0)} BPM, ${j.ts}`);
  L.push('');
  const v = j.messung.vorher, n = j.messung.nachher;
  L.push(`VORHER (deine Spuren zusammen):  Lautheit ${zahl(v.lufs)} · Spitze ${dbS(v.tp)}${v.tp > 0 ? '  ← über 0 dB: ohne Begrenzer würde das übersteuern' : ''}`);
  L.push(`NACHHER (Master):                Lautheit ${zahl(n.lufs)} · Spitze ${dbS(n.tp)} · ${n.clip === 0 ? 'keine Übersteuerung' : 'Übersteuerung an ' + n.clip + ' Stellen'}`);
  L.push('');
  for (const s of j.spuren) {
    L.push(`${s.datei.replace(/\.[a-z0-9]+$/i, '').toUpperCase()}  (Rolle ${ROLLEN_ANZEIGE[s.rolle] || s.rolle}${s.hauptsache ? ', Hauptsache' : ''})`);
    if (s.so_lassen) { L.push('  unverändert (So lassen)'); L.push(''); continue; }
    if (s.pegel_db) L.push(`  Volume fader: ${dbS(s.pegel_db)} gegenüber jetzt – ${s.pegel_grund}`);
    if (s.low_cut_hz > 20) L.push(`  Channel Strip › Cut Filter › Low Cut: ${hz(s.low_cut_hz)}`);
    for (const e of s.eq) L.push(`  ${e.band ? 'StudioEQ Band ' + e.band : 'zweiter StudioEQ (Insert)'}: ${TYP[e.typ]}, ${hz(e.hz)}, ${dbS(e.db)}, Q ${zahl(e.q, 1)} – ${e.grund}`);
    if (s.kompressor) {
      const k = s.kompressor;
      // Mit Sidechain hört der Compressor im Channel Strip NUR auf die andere Spur – die eigene Kompression dann als eigener Insert.
      if (s.ducking) L.push(`  Insert › Compressor (eigener Effekt, nicht der im Channel Strip): Ratio ${zahl(k.ratio, 1)}:1, Attack ${zahl(k.attack_ms, 0)} ms, Release ${zahl(k.release_ms, 0)} ms, Output so, dass die Spur gleich laut bleibt`);
      else L.push(`  Channel Strip › Compressor: Ratio ${zahl(k.ratio, 1)}:1, Attack ${zahl(k.attack_ms, 0)} ms, Release ${zahl(k.release_ms, 0)} ms, Make Up Auto`);
      L.push(`      Threshold senken, bis in lauten Stellen etwa ${zahl(k.ziel_gr_db, 0)} dB Reduktion angezeigt werden (Start etwa −20 dB)`);
    }
    if (s.ducking) L.push(`  Channel Strip › Compressor mit Sidechain = Spur „${s.ducking.von_spur || s.ducking.von}“: Threshold senken, bis bei jedem Kick etwa ${zahl(s.ducking.naeherung_daw_db, 0)} dB Reduktion angezeigt werden (näherungsweise; im Mischpult nur unter ${s.ducking.unter_hz} Hz, ${zahl(s.ducking.tiefe_db, 0)} dB)`);
    if (s.dyn_eq) L.push(`  Dynamischer EQ ${hz(s.dyn_eq.hz)} ${dbS(s.dyn_eq.db)} nur beim Gesang: in Cubasis nicht direkt nachbaubar. Ersatz: StudioEQ Band 3 fest −1,5 dB bei ${hz(s.dyn_eq.hz)}`);
    if (s.raum.send) L.push(`  Neuer Send an einen Bus mit Reverb (${s.daw.find(d => d.wo === 'Send')?.wert || 'Predelay und Time nach Gehör'}), Send so, dass der Hall gerade hörbar ist (etwa −14 LU unter der Spur)`);
    if (!s.pegel_db && s.low_cut_hz <= 20 && !s.eq.length && !s.kompressor && !s.ducking && !s.dyn_eq && !s.raum.send) L.push('  passt – nichts ändern');
    L.push('');
  }
  L.push('MASTER (Stereo Out)');
  for (const x of j.master.daw) L.push(`  ${x.wo}, ${x.regler}: ${x.wert}`);
  L.push('  Mixdown: Normalize AUS. Danach im Mischpult „Fertige Datei prüfen“.');
  L.push('');
  const zeile = ['lautheit', 'true_peak', 'uebersteuerung', 'plr', 'korrelation_tief', 'mono_verlust'].map(m => ok[m] ? `${({ lautheit: 'Lautheit', true_peak: 'Spitze', uebersteuerung: 'Übersteuerung ' + n.clip, plr: 'Dynamik (PLR ' + zahl(n.plr) + ')', korrelation_tief: 'Bass mittig', mono_verlust: 'Mono' })[m]} ${ok[m].farbe === 'gruen' ? 'ok' : 'Hinweis'}` : null).filter(Boolean);
  L.push('PRÜFUNG  ' + zeile.join(' · '));
  for (const p of j.pruefung) if (p.farbe !== 'gruen') L.push('  Hinweis: ' + p.satz);
  for (const h of j.hinweise) L.push('  ' + h);
  L.push('');
  L.push('Im Videoschnitt: Lautstärke des Songs nicht anheben. Zeigt die App trotzdem Rot, den Clip ein kleines Stück leiser stellen. Gelb an den lautesten Stellen ist normal.');
  return L.join('\n');
}
