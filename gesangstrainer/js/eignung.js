// eignung.js – Schätzung, ob ein Lied zur Stimme passt, und ein Weg in Wochen dorthin.
// Reines ES-Modul, nichts wird gesendet. Bewertet das Lied gegen die Stimme, nie den Sänger; immer „Schätzung“.
//
// eignung(lied, stimme) → {stufe:'passt'|'mit Übung'|'noch weit', text, gruende:[…], transponieren, schwierig:[{zeile, silbe, midi, warum}],
//                          weg:[{woche, ziel, uebungen:[id], text}], kern:[lo,hi] (Kernlage des Lieds), ohneStimme, ohneMelodie, stufeTransponiert}
let P = {};
try { P = await import('./phonetik.js'); } catch (e) { P = {}; }

const NB = ['C', 'Des', 'D', 'Es', 'E', 'F', 'Ges', 'G', 'As', 'A', 'B', 'H'];
const nn = (m) => (Number.isFinite(m) ? NB[((Math.round(m) % 12) + 12) % 12] + (Math.floor(Math.round(m) / 12) - 1) : '–');
const ht = (n) => (Math.abs(n) === 1 ? '1 Halbton' : `${Math.abs(n)} Halbtöne`);
const zit = (s) => `„${s}“`;
const sauber = (s) => String(s || '').replace(/[^\p{L}'’-]/gu, '');
const r1 = (x) => String(Math.round(x * 10) / 10).replace('.', ',');

/** Annahme ohne Stimmprofil: typischer (ungeübter) Bariton. */
export const BARITON = { tief: 43, hoch: 64, kern: [47, 59], uebergaenge: [59, 64], typ: 'typischer Bariton (Annahme)', annahme: true };

// Vokal-Ausgleich auf hohen Tönen (klassische Vokal-Modifikation, vereinfacht)
const AUSGLEICH = {
  a: 'A etwas runder, Richtung O – Kiefer nicht weiter aufreißen',
  'ä': 'Ä Richtung E schließen', e: 'E Richtung Ä/Ö öffnen, nicht breit ziehen',
  i: 'I Richtung Ü – Lippen leicht runden, nicht breit', o: 'O Richtung U, hinten Raum lassen',
  u: 'U etwas offener (Richtung O), damit es nicht eng wird', 'ö': 'Ö locker lassen', 'ü': 'Ü Richtung Ö öffnen',
};

function vokaleDerZeile(z) {
  if (typeof P.silbenZuVokalen === 'function') {
    try {
      const r = P.silbenZuVokalen(z);
      if (Array.isArray(r) && r.length === z.silben.length) return r.map((x) => (x && x.vokal) || '');
    } catch (e) { /* Ersatz unten */ }
  }
  return z.silben.map((s) => ((String(s.text || '').toLowerCase().match(/[aeiouyäöü]/) || [''])[0]).replace('y', 'i'));
}

function sammle(lied) {
  const zeilen = (Array.isArray(lied && lied.zeilen) ? lied.zeilen : []).filter((z) => z && z.text && Array.isArray(z.silben));
  const noten = [], proZeile = new Map();
  for (const z of zeilen) {
    const vk = vokaleDerZeile(z), liste = [];
    z.silben.forEach((s, i) => {
      if (!s) return;
      const ms = Array.isArray(s.noten) && s.noten.length ? s.noten : [s];
      for (const n of ms) {
        if (!Number.isFinite(n.midi) || n.midi <= 0) continue;
        const e = { zeile: z.id, zeilenText: z.text, silbe: sauber(s.text) || s.text || '', i, midi: n.midi,
          t: Number.isFinite(n.t) ? n.t : s.t, dauer: Number.isFinite(n.dauer) ? n.dauer : (Number.isFinite(s.dauer) ? s.dauer : 0.4), vokal: vk[i] || '' };
        noten.push(e); liste.push(e);
      }
    });
    proZeile.set(z.id, { z, noten: liste, silben: z.silben.filter((s) => s && !s.gesprochen).length });
  }
  return { zeilen, noten, proZeile };
}

const gew = (n) => Math.min(2, Math.max(0.1, n.dauer || 0.4));
function quantil(noten, p) {
  const s = noten.slice().sort((a, b) => a.midi - b.midi), W = s.reduce((a, n) => a + gew(n), 0);
  let acc = 0;
  for (const n of s) { acc += gew(n); if (acc >= p * W) return n.midi; }
  return s.length ? s[s.length - 1].midi : null;
}

function kosten(noten, st, t) {
  let s = 0;
  for (const n of noten) {
    const m = n.midi + t, w = gew(n);
    if (m > st.kern[1]) s += w * (m - st.kern[1]);
    if (m < st.kern[0]) s += w * 0.6 * (st.kern[0] - m);
    if (Number.isFinite(st.hoch) && m > st.hoch) s += w * 3 * (m - st.hoch);
    if (Number.isFinite(st.tief) && m < st.tief) s += w * 2 * (st.tief - m);
  }
  return s;
}
function besteTransposition(noten, st) {
  const W = noten.reduce((a, n) => a + gew(n), 0) || 1;
  let best = 0, bestS = Infinity;
  for (const t of [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6, -7, 7, -8, 8, -9, 9, -10, 10, -11, 11, -12, 12]) {
    const s = kosten(noten, st, t) + Math.abs(t) * 0.06 * W;
    if (s < bestS - 1e-9) { bestS = s; best = t; }
  }
  return best;
}

function bewerte(m, st, t) {
  const ueberHoch = Number.isFinite(st.hoch) ? Math.max(0, m.hoch + t - st.hoch) : 0;
  const unterTief = Number.isFinite(st.tief) ? Math.max(0, st.tief - (m.tief + t)) : 0;
  const tessAus = Math.max(0, m.kern[1] + t - st.kern[1]) + Math.max(0, st.kern[0] - (m.kern[0] + t));
  const zuBreit = Number.isFinite(st.hoch) && Number.isFinite(st.tief) ? Math.max(0, (m.hoch - m.tief) - (st.hoch - st.tief)) : 0;
  const punkte = ueberHoch * 1.5 + unterTief + tessAus * 1.2 + zuBreit * 1.5 + Math.min(2, m.spruenge7 * 0.5) + (m.langePhrasen ? 0.6 : 0) + (m.schnell ? 0.6 : 0) + Math.min(1.5, m.imUebergang * 0.25);
  let stufe = 'mit Übung';
  if (ueberHoch === 0 && unterTief <= 1 && tessAus <= 1 && punkte < 2.5) stufe = 'passt';
  else if (ueberHoch >= 4 || tessAus >= 5 || unterTief >= 4 || zuBreit >= 3 || punkte >= 9) stufe = 'noch weit';
  return { stufe, ueberHoch, unterTief, tessAus, zuBreit, punkte };
}

export function eignung(lied, stimme) {
  const ohneStimme = !(stimme && Array.isArray(stimme.kern) && Number.isFinite(stimme.kern[0]) && Number.isFinite(stimme.kern[1]));
  const st = ohneStimme ? BARITON : {
    ...stimme,
    tief: Number.isFinite(stimme.tief) ? stimme.tief : stimme.kern[0] - 3,
    hoch: Number.isFinite(stimme.hoch) ? stimme.hoch : stimme.kern[1] + 2,
    uebergaenge: Array.isArray(stimme.uebergaenge) ? stimme.uebergaenge.filter(Number.isFinite) : [],
  };
  const titel = (lied && lied.titel) || 'dieses Lied';
  const { noten, proZeile } = sammle(lied);
  const vorbehalt = ohneStimme
    ? `Ohne Stimmprofil: verglichen mit einem typischen Bariton-Bereich (${nn(BARITON.kern[0])}–${nn(BARITON.kern[1])}, bis ${nn(BARITON.hoch)}) – nur eine grobe Annahme. Stimmlage ermitteln für deine echte Einschätzung.`
    : '';

  if (!noten.length) {
    const gr = ['Zu diesem Lied gibt es keine Melodie (kein Audio) – die Tonlage lässt sich nicht einschätzen. Lade eine Gesangsaufnahme dazu, dann sage ich dir, ob es passt.'];
    if (vorbehalt) gr.push(vorbehalt);
    return { stufe: 'mit Übung', ohneMelodie: true, ohneStimme, text: 'Ohne Melodie keine Tonlagen-Schätzung – Vokale und Text kannst du trotzdem schon üben.',
      gruende: gr, transponieren: 0, schwierig: [], kern: null,
      weg: [{ woche: 1, ziel: 'Vokale und Text', uebungen: ['vokale-melodie', 'vokal-uebergang', 'text-rhythmus'], text: 'Vokal-Ketten jeder Zeile auf einem bequemen Ton, dann Text im Rhythmus sprechen.' }] };
  }

  // --- Kennzahlen des Lieds
  const ms = noten.map((n) => n.midi);
  const m = { tief: Math.min(...ms), hoch: Math.max(...ms), kern: [quantil(noten, 0.1), quantil(noten, 0.9)], mitte: quantil(noten, 0.5), spruenge7: 0, langePhrasen: 0, schnell: 0, imUebergang: 0 };
  const schwierig = [];
  const stelle = (n, warum, gewicht, art) => schwierig.push({ zeile: n.zeile, zeilenText: n.zeilenText, silbe: n.silbe, midi: n.midi, vokal: n.vokal, warum, gewicht, art });
  let laengste = null, schnellste = null;
  for (const { z, noten: L, silben } of proZeile.values()) {
    for (let k = 1; k < L.length; k++) {
      const d = L[k].midi - L[k - 1].midi;
      if (Math.abs(d) >= 5) {
        if (Math.abs(d) >= 7) m.spruenge7++;
        stelle(L[k], `Sprung ${d > 0 ? 'hinauf' : 'hinab'} um ${ht(d)} von ${zit(L[k - 1].silbe)}`, Math.abs(d) >= 7 ? 2.2 : 1.2, 'sprung');
      }
    }
    const mitZeit = L.filter((n) => Number.isFinite(n.t));
    if (mitZeit.length >= 2) {
      const a = mitZeit[0], b = mitZeit[mitZeit.length - 1], dauer = b.t + (b.dauer || 0.3) - a.t;
      if (dauer > 4.5) { m.langePhrasen++; stelle(b, `langer Bogen ohne Pause (${r1(dauer)} s) – Atem einteilen`, 1.4, 'atem'); }
      if (!laengste || dauer > laengste.dauer) laengste = { dauer, z };
      const proSek = silben / Math.max(0.3, b.t - a.t + 0.3);
      if (silben >= 5 && proSek > 5.5) { m.schnell++; stelle(a, `schnelle Silben (${r1(proSek)} pro Sekunde)`, 1.1, 'schnell'); }
      if (silben >= 5 && (!schnellste || proSek > schnellste.proSek)) schnellste = { proSek, z };
    }
  }
  const gesehen = new Set();
  for (const n of noten) {
    const k = n.zeile + '|' + n.i;
    if (gesehen.has(k)) continue;
    if (n.midi > st.hoch) { gesehen.add(k); stelle(n, `${nn(n.midi)} liegt ${ht(n.midi - st.hoch)} über deinem höchsten sicheren Ton (${nn(st.hoch)})`, 3 + (n.midi - st.hoch), 'hoehe'); continue; }
    const ue = st.uebergaenge.find((p) => Math.round(n.midi) === p);
    if (ue != null && (n.dauer || 0) >= 0.5) { m.imUebergang++; gesehen.add(k); stelle(n, `${nn(n.midi)} gehalten, genau in deinem Stimm-Übergang (um ${nn(ue)}) – der Klang kippt hier leicht`, 1.6, 'uebergang'); continue; }
    if (n.midi > st.kern[1] && n.vokal && AUSGLEICH[n.vokal]) { gesehen.add(k); stelle(n, `hoch (${nn(n.midi)}) auf ${n.vokal.toUpperCase()}: ${AUSGLEICH[n.vokal]}`, 2, 'vokal'); continue; }
    if (n.midi < st.tief) { gesehen.add(k); stelle(n, `${nn(n.midi)} liegt unter deinem tiefsten sicheren Ton (${nn(st.tief)})`, 1.5, 'tiefe'); }
  }
  schwierig.sort((a, b) => b.gewicht - a.gewicht);

  const orig = bewerte(m, st, 0);
  const trans = besteTransposition(noten, st);
  const mitT = trans ? bewerte(m, st, trans) : orig;

  // --- Gründe
  const gruende = [];
  if (vorbehalt) gruende.push(vorbehalt);
  gruende.push(`80 % der Töne liegen zwischen ${nn(m.kern[0])} und ${nn(m.kern[1])} (Kernlage des Lieds); ${ohneStimme ? 'angenommener' : 'dein'} Kernbereich: ${nn(st.kern[0])}–${nn(st.kern[1])}.`);
  if (orig.tessAus === 0) gruende.push('Die Kernlage des Lieds fällt in deinen Kernbereich – dort, wo deine Stimme am meisten singt.');
  else if (m.kern[1] > st.kern[1]) gruende.push(`Die Kernlage reicht ${ht(m.kern[1] - st.kern[1])} über deinen Kernbereich – das Lied „wohnt“ höher als deine Stimme.`);
  else if (m.kern[0] < st.kern[0]) gruende.push(`Die Kernlage reicht ${ht(st.kern[0] - m.kern[0])} unter deinen Kernbereich – das Lied „wohnt“ tiefer als deine Stimme.`);
  gruende.push(`Umfang ${nn(m.tief)}–${nn(m.hoch)} (${ht(m.hoch - m.tief)})${orig.zuBreit ? `, ${ht(orig.zuBreit)} mehr als dein sicherer Umfang` : ''}.`);
  if (orig.ueberHoch) gruende.push(`Höchster Ton ${nn(m.hoch)}: ${ht(orig.ueberHoch)} über deinem höchsten sicheren Ton (${nn(st.hoch)}).`);
  if (orig.unterTief) gruende.push(`Tiefster Ton ${nn(m.tief)}: ${ht(orig.unterTief)} unter deinem tiefsten sicheren Ton (${nn(st.tief)}).`);
  if (m.imUebergang) gruende.push(`${m.imUebergang} gehaltene ${m.imUebergang === 1 ? 'Silbe liegt' : 'Silben liegen'} in deinem Stimm-Übergang.`);
  if (m.spruenge7) gruende.push(`${m.spruenge7} ${m.spruenge7 === 1 ? 'großer Sprung' : 'große Sprünge'} (Quinte oder mehr).`);
  if (laengste && laengste.dauer > 4.5) gruende.push(`Längster Bogen ohne Pause: ${r1(laengste.dauer)} s (${zit(laengste.z.text)}).`);
  if (schnellste && schnellste.proSek > 5.5) gruende.push(`Schnellste Zeile: etwa ${r1(schnellste.proSek)} Silben pro Sekunde (${zit(schnellste.z.text)}).`);

  // --- Satz
  const ST = { passt: 'Passt zu deiner Stimme', 'mit Übung': 'Mit Übung erreichbar', 'noch weit': 'Noch ein weiter Weg' };
  const ST2 = { passt: 'passt es gut', 'mit Übung': 'mit Übung erreichbar', 'noch weit': 'immer noch weit' };
  let text = `${ST[orig.stufe]} (Schätzung). `;
  if (orig.stufe === 'passt') text += `${titel} liegt dort, wo deine Stimme zu Hause ist – jetzt geht es um Vokale, Übergänge und Text.`;
  else if (orig.stufe === 'mit Übung') text += `Die meisten Töne liegen gut, einzelne Stellen brauchen gezielte Übung.`;
  else text += `In der Originaltonart liegt ${titel} deutlich außerhalb deiner sicheren Lage.`;
  if (trans && mitT.punkte < orig.punkte) text += ` Um ${trans > 0 ? '+' : '−'}${Math.abs(trans)} transponiert: ${ST2[mitT.stufe]}.`;

  // --- Weg in Wochen
  const weg = [];
  let w = 0;
  const add = (ziel, uebungen, txt, extra) => weg.push({ woche: ++w, ziel, uebungen, text: txt, ...(extra || {}) });
  const nutzeTrans = trans !== 0 && mitT.punkte < orig.punkte;
  const hohe = schwierig.filter((s) => s.art === 'hoehe' || s.art === 'vokal');
  if (nutzeTrans) add(`Transponiert singen (${trans > 0 ? '+' : '−'}${Math.abs(trans)})`, ['lippenflattern-melodie', 'vokale-melodie', 'silben-da'],
    `Sing das Lied ${ht(trans)} ${trans < 0 ? 'tiefer' : 'höher'} – höchster Ton dann ${nn(m.hoch + trans)}, Kernlage ${nn(m.kern[0] + trans)}–${nn(m.kern[1] + trans)}. Erst Melodie auf „brrr“, dann nur Vokale, dann Silben auf „da“. Der Knopf „Übungen transponieren“ stellt alles um.`, { trans });
  else add('Melodie und Vokale sicher', ['lippenflattern-melodie', 'vokale-melodie', 'silben-da'], 'Jede Zeile erst auf „brrr“, dann nur auf den Vokalen, dann auf „da“ – bis die Melodie ohne Text sitzt.');
  const zielHoch = m.hoch <= st.hoch + 3 ? m.hoch : st.hoch + 2;
  if (m.hoch > st.kern[1]) add(`Höhe vorbereiten bis ${nn(zielHoch + 1)}`, ['ng-sirene', 'oktav-glissando', 'strohhalm'],
    `„Ng“-Sirenen und Oktav-Glissandi bis ${nn(zielHoch + 1)} – einen Halbton über dem Zielton ${nn(zielHoch)}, damit er im Lied Reserve hat. Leise und leicht, täglich 5 Minuten.`, { ton: { von: st.kern[0], bis: zielHoch + 1 } });
  if (hohe.length) {
    const beispiele = [...new Map(hohe.map((s) => [s.silbe.toLowerCase(), s])).values()].slice(0, 4);
    add('Vokal-Ausgleich auf hohen Tönen', ['register-ausgleich', 'naeh', 'vokal-uebergang'],
      `Die hohen Silben mit angeglichenem Vokal: ${beispiele.map((s) => `${zit(s.silbe)} (${nn(s.midi)})`).join(', ')}. ` +
      ([...new Set(hohe.map((s) => AUSGLEICH[s.vokal]).filter(Boolean))].slice(0, 3).join('; ') || 'Oben den Vokal etwas abdunkeln, Kiefer nicht weiter öffnen') + '.');
  }
  if (m.imUebergang || (st.uebergaenge.some((p) => p >= m.tief && p <= m.hoch))) add('Register-Übergang glätten', ['register-ausgleich', 'messa-di-voce', 'arpeggio'],
    `Langsame Dreiklänge und an- und abschwellende Töne genau durch deinen Übergang (${st.uebergaenge.map(nn).join(', ') || 'Mitte'}) – der Klang soll ohne Bruch weitergehen.`);
  if (m.langePhrasen) add('Atem für lange Phrasen', ['atem-448', 'zisch-atem', 'phrasen-atem', 'legato'],
    `Längster Bogen ${r1(laengste.dauer)} s: Zischen auf Zeit bis ${Math.ceil(laengste.dauer + 3)} s, Atemstellen vorher festlegen, dann die Zeile auf einem Atem.`);
  if (m.spruenge7 || m.schnell) add(m.spruenge7 ? 'Sprünge und Tempo' : 'Tempo und Konsonanten', m.spruenge7 ? ['spruenge', 'arpeggio', 'halbtempo'] : ['schnelle-silben', 'konsonanten', 'text-rhythmus'],
    m.spruenge7 ? 'Große Sprünge erst gleitend, dann als Sprung treffen; Zielton vorher innerlich hören.' : 'Text im Rhythmus sprechen, dann flüstern, dann singen – Konsonanten kurz und vorne.');
  if (nutzeTrans) {
    const richtung = trans < 0 ? 1 : -1, n = Math.abs(trans), schritt = n <= 3 ? 1 : Math.ceil(n / 3);
    for (let k = schritt; k <= n; k += schritt) {
      const rest = n - k, hoechster = m.hoch + trans + richtung * k;
      if (richtung > 0 && hoechster > st.hoch + 2) {
        add('Deine Fassung festigen', ['legato', 'mit-musik'], `Höher als ${nn(hoechster - 1)} liegt deutlich über deiner sicheren Lage (Schätzung). Bleib bei ${ht(rest + schritt)} tiefer – Transponieren ist kein Mogeln, viele Profis singen in ihrer Tonart.`);
        break;
      }
      add(rest ? `${ht(rest)} ${trans < 0 ? 'unter' : 'über'} dem Original` : 'Originaltonart', ['ng-sirene', 'halbtempo', 'vokale-melodie'],
        `${schritt === 1 ? 'Einen Halbton' : ht(schritt)} ${richtung > 0 ? 'höher' : 'tiefer'} als letzte Woche (höchster Ton ${nn(hoechster)}). Nur weiter, wenn die letzte Stufe an 3 Tagen locker ging.`, { trans: trans + richtung * k });
    }
  }
  add('Zusammenbauen', ['rueckwaerts', 'originaltempo', 'mit-musik'], 'Jede Zeile rückwärts aufbauen (letzte Silbe → ganze Zeile), dann Vokale → „da“ → Text, dann im Originaltempo und mit Musik.');

  return {
    stufe: orig.stufe, text, gruende, transponieren: nutzeTrans ? trans : 0, stufeTransponiert: nutzeTrans ? mitT.stufe : orig.stufe,
    schwierig: schwierig.slice(0, 12).map(({ gewicht, ...s }) => s), weg, kern: m.kern, umfang: { tief: m.tief, hoch: m.hoch },
    ohneStimme, ohneMelodie: false, vergleich: { kern: st.kern, tief: st.tief, hoch: st.hoch, uebergaenge: st.uebergaenge },
  };
}
