// Gesangstrainer – uebungsplan.js: macht aus jeder Übung einen konkreten Ablauf im Takt (Noten in Schlägen, Akkorde,
// Durchgänge mit Startton aus dem Stimmprofil) – auch aus einer Liedzeile. Reines ES-Modul, kein DOM.
//
// export function spielplan(uebungId, {stimme, lied, zeile, modus, start}) → Plan | null
// export function einheitPlan(lied, stimme) → [Plan] (geführte Einheit „Heute einsingen“, 7 Übungen)
// export function zeilenSchritte(lied, zid, stimme) → [{nr, titel, warum, plan}] (Liedmodus: 3–4 Schritte je Zeile)
// export function zeilenInfo(lied, stimme) → [{zid, teil, text, kette:[{anzeige,vokal,gleit}], tief, hoch, gruende:[…], hart}]
// export function schwersteZeile(lied, stimme) → Zeile | null
// export const ERTRAG, KURZ – „Bringt dir: …“ und die 1–2-Zeilen-Anleitung je Übung
//
// Plan = {key, uebung, titel, ertrag, kurz, art:'singen'|'atem'|'bewegung'|'sprechen', bpm, bpmMin, bpmMax, bpmOriginal?,
//   begleitung:'akkord'|'bordun'|'aus', vorsingen:'klavier'|'stimme'|'aufnahme'|'aus', vokale, lied:{id,titel}|null,
//   zeile, aufnahme:{liedId, ab}|null, hinweis, durchgaenge:[{name, grund, laenge, noten:[{b,d,midi,bis,vokal,gleit,silbe,
//   einsatz,hinweis}], akkorde:[{b,d,bass,toene}], bordun:[midi], phasen:[{b,d,art,text}], liedAb}]}
// Alle Zeiten in Schlägen (Viertel); die Oberfläche rechnet mit dem gewählten Tempo in Sekunden um.

import { UEBUNGEN, vokalStatistik, plan as lernplan } from './uebungen.js';
import { BARITON } from './eignung.js';
import { silbenZuVokalen } from './phonetik.js';
import { midiName } from './ton.js';
import { liedAkkord, voicing, akkordAus } from './takt.js';

const NACH_ID = Object.fromEntries(UEBUNGEN.map((u) => [u.id, u]));
const nn = (m, ton = 'es-Moll') => midiName(Math.round(m), ton) || String(m);
const G = (v) => (v === 'ö' ? 'ö' : v ? v.charAt(0).toUpperCase() + v.slice(1) : '');

export const ERTRAG = {
  'koerper-lockern': 'freie Schultern und Nacken – die Stimme schwingt leichter',
  'kiefer-zunge': 'einen lockeren Kiefer – klarere Vokale ohne Druck',
  'gaehn-seufzer': 'einen weiten Rachen und eine sanft geweckte Kopfstimme',
  'atem-448': 'ruhigen, langen Atem für lange Bögen',
  'zisch-atem': 'Atemstütze – die Luft gleichmäßig dosieren',
  'phrasen-atem': 'genug Luft bis zum Ende jeder Zeile',
  'lippenflattern': 'eine Stimme, die ohne Druck anspringt',
  'lippenflattern-melodie': 'die Melodie sicher – ganz ohne Textlast',
  'strohhalm': 'entlastete Stimmlippen – leichtere Höhe',
  'summen': 'Klang nach vorne (Resonanz)',
  'ng-sirene': 'verbundene Register – ohne Bruch von tief nach hoch',
  'oktav-glissando': 'eine große Tonspanne mühelos durchgleiten',
  'vokal-leiter': 'gleich tragende Vokale auf einer Tonhöhe',
  'vokale-melodie': 'saubere Vokale genau dort, wo das Lied sie braucht',
  'vokal-uebergang': 'weiche Wechsel zwischen schwierigen Vokalen',
  'diphthong': 'stabile englische Doppellaute (Ai, Ei, Ou)',
  'staccato': 'saubere, punktgenaue Einsätze',
  'messa-di-voce': 'Lautstärke steuern, ohne dass der Ton wackelt',
  'register-ausgleich': 'den sicheren Weg über deinen Übergang in die Höhe',
  'spruenge': 'große Sprünge sauber treffen',
  'arpeggio': 'klare Dreiklang-Töne und Beweglichkeit',
  'melodie-nu': 'die Melodie mit offenem Hals',
  'silben-da': 'den Rhythmus der Zeile im Körper',
  'text-rhythmus': 'Text, der im Takt sitzt',
  'konsonanten': 'deutliche, flinke Konsonanten',
  'schnelle-silben': 'eine flinke Zunge bei schnellen Stellen',
  'halbtempo': 'jede Silbe in Ruhe richtig',
  'rueckwaerts': 'ein sicheres Zeilenende – dann die ganze Zeile',
  'tiefe-locker': 'eine lockere, klingende Tiefe ohne Drücken',
  'naeh': 'eine helle, tragende Höhe ohne Druck',
  'legato': 'eine verbundene Linie ohne Löcher',
  'originaltempo': 'die Zeile im echten Tempo',
  'mit-musik': 'die Zeile mit Begleitung – wie auf der Bühne',
  'abkuehlen': 'eine ruhige, entspannte Stimme nach dem Üben',
};
export const KURZ = {
  'koerper-lockern': 'Mach jede Bewegung im Takt mit, ganz ohne Kraft. Der Klick zählt für dich.',
  'kiefer-zunge': 'Sing „ja-ja-ja“ nach: nur die Zunge bewegt sich, der Kiefer hängt locker.',
  'gaehn-seufzer': 'Aus einem kleinen Gähnen heraus auf „ha“ von oben nach unten seufzen – leise und leicht.',
  'atem-448': '4 Schläge einatmen, 4 halten, dann auf „sss“ gleichmäßig ausatmen. Ich messe dein Zischen.',
  'zisch-atem': 'Einatmen, dann auf „sss“ so lange und gleichmäßig wie ein Reifen, der langsam Luft verliert.',
  'phrasen-atem': 'Einatmen wie vor einem Satz, dann auf „sss“ genau so lange wie die längste Liedzeile.',
  'lippenflattern': 'Lippen locker flattern lassen („brrr“) und die Töne nachgleiten. Gleichmäßig Luft, nicht lauter werden.',
  'lippenflattern-melodie': 'Die Melodie der Zeile auf „brrr“ nachsingen – Ton für Ton verbunden.',
  'strohhalm': 'Auf „u“ (oder in einen Strohhalm) sanft hinauf und hinunter gleiten.',
  'summen': 'Mit geschlossenen Lippen „mm“ summen – es kribbelt vorne an den Lippen.',
  'ng-sirene': 'Auf „ng“ (wie in „Gong“) von unten nach oben und zurück gleiten – wie eine leise Sirene.',
  'oktav-glissando': 'Auf „u“ eine Oktave hinauf und wieder hinab gleiten, ohne Bruch.',
  'vokal-leiter': 'Ein Ton, nur der Mund ändert sich: die Vokale verbunden auf einem Atem.',
  'vokale-melodie': 'Nur die Vokale der Zeile auf der Melodie – ohne Konsonanten, ganz verbunden.',
  'vokal-uebergang': 'Die zwei Vokale der Stelle langsam hin und her verbinden – der Kiefer bleibt ruhig.',
  'diphthong': 'Lange auf dem ersten Vokal bleiben, den Nachlaut erst ganz am Ende antippen.',
  'staccato': 'Kurze, federnde „ha“ genau auf dem Klick – der Bauch federt bei jedem Ton leicht.',
  'messa-di-voce': 'Einen Ton halten: 4 Schläge langsam lauter, 4 Schläge wieder leiser. Die Tonhöhe bleibt.',
  'register-ausgleich': 'Hinauf über deinen Übergang: je höher, desto runder der Vokal und desto leichter – nicht lauter.',
  'spruenge': 'Den oberen Ton von oben „anpeilen“, unten nicht fallen lassen. Die Stütze bleibt.',
  'arpeggio': 'Dreiklang auf „nu – no“ hinauf und hinunter, jeder Ton klar und leicht.',
  'melodie-nu': 'Die Melodie der Zeile auf „nu“ nachsingen – der Hals bleibt weit.',
  'silben-da': 'Jede Silbe der Zeile auf „da“ – genau im Rhythmus des Lieds.',
  'text-rhythmus': 'Den Text im Rhythmus sprechen, genau auf den Klicks.',
  'konsonanten': '„pa – ta – ka“ locker und deutlich auf einem Ton, dann in ein offenes „a“.',
  'schnelle-silben': 'Schnelle Silben auf der Leiter – die Zunge arbeitet, der Kiefer bleibt locker.',
  'halbtempo': 'Die Zeile mit Text im halben Tempo – jede Silbe sitzt.',
  'rueckwaerts': 'Erst das Ende der Zeile, dann immer ein Stück mehr – bis zur ganzen Zeile.',
  'tiefe-locker': 'Von oben nach unten auf „o“ – in der Tiefe eher sprechen als drücken.',
  'naeh': 'Auf „nä“ hell und leicht hinauf – wie ein freches Kind, nicht laut.',
  'legato': 'Langsam und ohne Lücke von Ton zu Ton – wie eine gezogene Linie.',
  'originaltempo': 'Die Zeile mit Text im echten Tempo des Lieds.',
  'mit-musik': 'Die Zeile mit Text zur Begleitung – wie auf der Bühne.',
  'abkuehlen': 'Sanft auf „u“ von der Mitte nach unten gleiten – leise, ohne Anstrengung.',
};

/** Stimmprofil mit Annahme, wenn keines gespeichert ist. */
export function stimmeVon(stimme) {
  const gut = stimme && Array.isArray(stimme.kern) && isFinite(stimme.kern[0]) && isFinite(stimme.kern[1]);
  const s = gut ? stimme : BARITON;
  const kern = [Math.round(s.kern[0]), Math.round(s.kern[1])];
  const tief = isFinite(s.tief) ? Math.round(s.tief) : kern[0] - 3;
  const hoch = isFinite(s.hoch) ? Math.round(s.hoch) : kern[1] + 2;
  const ue = (s.uebergaenge || []).filter((m) => isFinite(m) && m > kern[0]).map(Math.round);
  return { tief, hoch, kern, ue: ue.length ? ue[0] : kern[1] - 4, mitte: Math.round((kern[0] + kern[1]) / 2), annahme: !gut };
}

// ---------------------------------------------------------------- Bausteine
const SILBE_VOKAL = { brr: 'u', brrr: 'u', mm: 'u', ng: 'u', nu: 'u', no: 'o', ja: 'a', ha: 'a', ho: 'o', da: 'a', 'nä': 'ä', pa: 'a', ta: 'a', ka: 'a', ma: 'a', me: 'e', mi: 'i', mo: 'o', mu: 'u', sss: '' };
const vokalVon = (silbe) => SILBE_VOKAL[silbe] ?? (String(silbe || 'a').toLowerCase().match(/[aeiouäöü]/) || ['a'])[0];
/** Muster [[b, d, stufe, silbe?, extra?]] → Noten ab grund. */
function noten(muster, grund, silbe, extra = {}) {
  return muster.map(([b, d, st, s, x], i) => {
    const sb = s || (Array.isArray(silbe) ? silbe[i % silbe.length] : silbe) || 'a';
    const n = { b, d, midi: grund + st, silbe: sb, vokal: vokalVon(sb), gleit: '', ...extra, ...(x || {}) };
    if (x && x.bis != null) n.bis = grund + x.bis;
    return n;
  });
}
const achtel = (stufen, letzte = 4) => { const out = stufen.slice(0, -1).map((s, i) => [i * 0.5, 0.45, s]); out.push([(stufen.length - 1) * 0.5, letzte, stufen[stufen.length - 1]]); return out; };
const viertel = (stufen, letzte = 4) => { const out = stufen.slice(0, -1).map((s, i) => [i, 0.92, s]); out.push([stufen.length - 1, letzte, stufen[stufen.length - 1]]); return out; };
const LEITER = [0, 2, 4, 5, 7, 5, 4, 2, 0];
const laengeVon = (ns, min = 4) => Math.max(min, Math.ceil(Math.max(...ns.map((n) => n.b + n.d)) / 4 - 1e-6) * 4);
function begleitungFuer(grund, laenge, { dur = true } = {}) {
  const v = voicing(grund, { dur });
  const akkorde = []; for (let b = 0; b < laenge; b += 4) akkorde.push({ b, d: 4, bass: v.bass, toene: v.toene });
  return { akkorde, bordun: [v.bass + 12 <= 47 ? v.bass + 12 : v.bass, (v.bass + 12 <= 47 ? v.bass + 12 : v.bass) + 7] };
}
function durchgang(ns, grund, { laenge, dur = true, name, ton } = {}) {
  const L = laenge || laengeVon(ns);
  return { name: name || nn(grund, ton), grund, laenge: L, noten: ns, ...begleitungFuer(grund, L, { dur }) };
}
/** Durchgänge halbtonweise; Ober- und Untergrenze aus der Stimme. */
function reihe(n, start, schritt, oben, unten, bauen) {
  const out = []; let g = start;
  for (let k = 0; k < n; k++) {
    const d = bauen(g);
    const ms = d.noten.flatMap((x) => [x.midi, x.bis]).filter(isFinite);
    if (k && (Math.max(...ms) > oben || Math.min(...ms) < unten)) break;
    out.push(d); g += schritt;
  }
  return out;
}

// ---------------------------------------------------------------- Liedzeilen
const sungen = (s) => s && isFinite(s.t) && !s.gesprochen && (isFinite(s.midi) || (Array.isArray(s.noten) && s.noten.length));
export function zeilenNotenRoh(lied, z) {
  let v = null; try { v = silbenZuVokalen(z); } catch (e) { v = null; }
  const out = [];
  (z.silben || []).forEach((s, i) => {
    if (!sungen(s)) return;
    const p = (v && v[i]) || {};
    const teile = Array.isArray(s.noten) && s.noten.length ? s.noten : [{ t: s.t, dauer: s.dauer, midi: s.midi }];
    teile.forEach((x, k) => out.push({ t: x.t, dauer: Math.max(0.12, x.dauer || 0.3), midi: Math.round(x.midi), text: k ? '' : s.text || '', vokal: p.vokal || vokalVon(s.text), gleit: p.gleit || '', anzeige: p.anzeige || G(p.vokal || 'a'), wort: s.wort || p.wort || '', wi: i }));
  });
  return out.filter((n) => isFinite(n.midi) && n.midi > 0);
}
function zeilenDurchgang(lied, z, { modus = 'vokale', ab = 0, stimme } = {}) {
  const roh = zeilenNotenRoh(lied, z);
  if (roh.length < 2) return null;
  const bpm = lied.bpm || 100, sb = 60 / bpm, takt = 4 * sb;
  const bar0 = Math.max(0, Math.floor((roh[0].t + 0.02) / takt) * takt);
  const ende = Math.max(...roh.map((n) => n.t + n.dauer));
  const laenge = Math.max(4, Math.ceil((ende - bar0) / takt - 1e-6) * 4);
  const S = stimmeVon(stimme);
  const silbeVon = (n) => (modus === 'vokale' ? n.anzeige : modus === 'text' || modus === 'sprechen' ? n.text || '–' : modus);
  const ns = roh.slice(ab).map((n, i, alle) => ({
    b: (n.t - bar0) / sb, d: Math.max(0.3, n.dauer / sb), midi: n.midi, silbe: silbeVon(n) || '·',
    vokal: modus === 'vokale' || modus === 'text' ? n.vokal : vokalVon(modus), gleit: modus === 'vokale' || modus === 'text' ? n.gleit : '',
    einsatz: i === 0 || !alle[i - 1] || n.t - (alle[i - 1].t + alle[i - 1].dauer) > 0.12 || alle[i - 1].midi !== n.midi ? undefined : false,
    hinweis: n.midi >= S.ue && (modus === 'vokale' || modus === 'text') ? hoehenHinweis(n.vokal) : '',
  }));
  // Akkorde: Teil-Akkorde (alle 2 Takte, vereinfacht); sonst Grundton der Tonart als Bordun
  const akkorde = [];
  for (let b = 0; b < laenge; b += 4) {
    const a = liedAkkord(lied, bar0 + (b / 4) * takt + 0.01);
    const v = a ? voicing(a) : null;
    if (v) akkorde.push({ b, d: 4, bass: v.bass, toene: v.toene, name: a.name });
  }
  const grund = tonikaVon(lied, roh);
  const bord = voicing(grund, { dur: !/moll/i.test(lied.tonart || '') });
  const bordBass = bord.bass + 12 <= 47 ? bord.bass + 12 : bord.bass;
  return { name: z.text, grund, laenge, noten: ns, akkorde: akkorde.length ? akkorde : begleitungFuer(grund, laenge, { dur: !/moll/i.test(lied.tonart || '') }).akkorde, bordun: [bordBass, bordBass + 7], liedAb: bar0, liedEnde: bar0 + laenge * sb };
}
const TONART_PC = { c: 0, cis: 1, des: 1, d: 2, dis: 3, es: 3, e: 4, f: 5, fis: 6, ges: 6, g: 7, gis: 8, as: 8, a: 9, ais: 10, b: 10, h: 11 };
function tonikaVon(lied, roh) {
  const m = String(lied.tonart || '').toLowerCase().match(/^([a-h](?:is|es|s)?)/);
  if (m && TONART_PC[m[1]] != null) return 48 + TONART_PC[m[1]];
  const z = {}; for (const n of roh || []) z[n.midi % 12] = (z[n.midi % 12] || 0) + n.dauer;
  const pc = Object.entries(z).sort((a, b) => b[1] - a[1])[0];
  return 48 + (pc ? Number(pc[0]) : 0);
}
function hoehenHinweis(v) {
  const H = { a: 'A etwas runder (Richtung offenes O)', e: 'E etwas öffnen (Richtung Ä)', i: 'I etwas öffnen (Richtung Ü)', o: 'O rund und hinten weit', u: 'U leicht öffnen (Richtung O)', 'ä': 'Ä etwas runder (Richtung Ö)', 'ö': 'locker, nicht drücken' };
  const k = String(v || '').toLowerCase()[0];
  return H[k] || 'leicht bleiben, nicht lauter werden';
}

/** Schwierigkeit je Zeile für die Stimme (Höhe über dem Übergang, Doppellaute oben, Sprünge, lange Bögen). */
export function zeilenInfo(lied, stimme) {
  if (!lied || !Array.isArray(lied.zeilen)) return [];
  const S = stimmeVon(stimme), ton = lied.tonart;
  let lp = []; try { lp = lernplan(lied, stimme) || []; } catch (e) { lp = []; }
  const schwer = lp.flatMap((t) => t.schwierig || []);
  return lied.zeilen.filter((z) => z.text).map((z) => {
    const roh = zeilenNotenRoh(lied, z);
    let kette = []; try { kette = silbenZuVokalen(z).filter((s) => s && (s.vokal || s.anzeige)).map((s) => ({ anzeige: s.anzeige || G(s.vokal), vokal: s.vokal, gleit: s.gleit || '' })); } catch (e) { kette = []; }
    const info = { zid: z.id, teil: z.teil, text: z.text, kette, gruende: [], hart: 0, mitMelodie: roh.length >= 2 };
    if (!roh.length) { info.gruende.push({ art: 'sprechen', text: 'Diese Zeile wird gesprochen – hier zählt der Rhythmus.', uebung: 'text-rhythmus' }); return info; }
    const ms = roh.map((n) => n.midi);
    info.tief = Math.min(...ms); info.hoch = Math.max(...ms);
    const top = roh.find((n) => n.midi === info.hoch);
    const ueber = info.hoch - S.ue;
    if (ueber >= 0) {
      info.hart += 2 + Math.min(4, ueber);
      info.gruende.push({ art: 'hoehe', uebung: 'register-ausgleich', midi: info.hoch,
        text: `Höchster Ton ${nn(info.hoch, ton)} auf „${top.text || top.wort}“ liegt ${ueber === 0 ? 'genau auf' : `${ueber} ${ueber === 1 ? 'Halbton' : 'Halbtöne'} über`} deinem Übergang (${nn(S.ue, ton)}) – Register-Ausgleich: Schritt für Schritt hinauf, ${hoehenHinweis(top.vokal)}.` });
    }
    if (info.hoch > S.hoch) info.gruende.push({ art: 'rand', uebung: 'naeh', text: `${nn(info.hoch, ton)} liegt über deinem höchsten sicheren Ton (${nn(S.hoch, ton)}) – leicht und eher leise singen, notfalls transponieren.` });
    const dipOben = roh.filter((n) => (n.gleit || String(n.vokal || '').length > 1) && n.midi >= S.ue);
    if (dipOben.length) {
      info.hart += 1;
      const d = dipOben[0];
      info.gruende.push({ art: 'diphthong', uebung: 'diphthong', midi: d.midi, vokal: d.vokal, gleit: d.gleit,
        text: `Doppellaut ${d.anzeige} in „${d.wort || d.text}“ auf ${nn(d.midi, ton)}: lange auf ${G(String(d.vokal)[0])} bleiben, das ${d.gleit || String(d.vokal).slice(1)} erst ganz am Ende – sonst wird der hohe Ton eng.` });
    }
    let sprung = null;
    for (let i = 1; i < roh.length; i++) { const s = roh[i].midi - roh[i - 1].midi; if (Math.abs(s) >= 5 && (!sprung || Math.abs(s) > Math.abs(sprung.s))) sprung = { s, a: roh[i - 1], b: roh[i] }; }
    if (sprung) {
      info.hart += 1;
      info.gruende.push({ art: 'sprung', uebung: 'spruenge', a: sprung.a, b: sprung.b, text: `Sprung ${sprung.s > 0 ? 'hinauf' : 'hinab'} um ${Math.abs(sprung.s)} Halbtöne von „${sprung.a.text || sprung.a.wort}“ zu „${sprung.b.text || sprung.b.wort}“ – den Zielton vorher innerlich hören, die Stütze halten.` });
    }
    // längster Bogen ohne Pause
    let bogen = 0, b0 = roh[0].t;
    for (let i = 1; i <= roh.length; i++) { const e = roh[i - 1].t + roh[i - 1].dauer; if (i === roh.length || roh[i].t - e > 0.3) { bogen = Math.max(bogen, e - b0); if (i < roh.length) b0 = roh[i].t; } }
    info.bogen = bogen;
    if (bogen >= 4) { info.hart += 0.5; info.gruende.push({ art: 'atem', uebung: 'phrasen-atem', text: `Langer Bogen ohne Pause (${String(Math.round(bogen * 10) / 10).replace('.', ',')} s) – vorher ruhig und tief einatmen, sparsam beginnen.` }); }
    for (const s of schwer.filter((x) => x.zeile === z.id && (x.art === 'uebergang' || x.art === 'tiefe')).slice(0, 2)) {
      info.gruende.push({ art: s.art, uebung: s.uebung, text: `${s.text} – ${String(s.tipp || '').split('. ')[0].replace(/\.$/, '')}.` });
      info.hart += s.art === 'uebergang' ? 0.5 : 0.3;
    }
    return info;
  });
}
export function schwersteZeile(lied, stimme) {
  const info = zeilenInfo(lied, stimme).filter((x) => x.mitMelodie);
  if (!info.length) return null;
  // oft gesungene Zeilen (Refrain) zählen mehr – für das Einsingen lohnt die Zeile, die am häufigsten kommt
  const norm = (t) => String(t || '').toLowerCase().replace(/[^a-z\u00e0-\u024f]+/g, ' ').trim();
  const zahl = {}; for (const z of lied.zeilen) zahl[norm(z.text)] = (zahl[norm(z.text)] || 0) + 1;
  const wert = (x) => x.hart + Math.min(2, (zahl[norm(x.text)] || 1) - 1);
  const best = info.slice().sort((a, b) => wert(b) - wert(a))[0];
  return lied.zeilen.find((z) => z.id === best.zid) || null;
}

// ---------------------------------------------------------------- Pläne je Übung
const GRUND = { begleitung: 'akkord', vorsingen: 'klavier', vokale: false, art: 'singen' };
function basis(id, extra) {
  const u = NACH_ID[id] || {};
  return { key: id, uebung: id, titel: u.titel || id, ertrag: ERTRAG[id] || u.ziel || '', kurz: KURZ[id] || (u.anleitung || [])[0] || '', ...GRUND, ...extra };
}

export function spielplan(id, opt = {}) {
  const { stimme = null, lied = null } = opt;
  const S = stimmeVon(stimme);
  const ton = lied && lied.tonart;
  const oben = S.hoch + 1, unten = S.tief;
  const hinweis = S.annahme ? 'Noch kein Stimmprofil: Starttöne für einen typischen Bariton (Annahme). Stimmlage ermitteln macht sie passend.' : null;
  const mitLied = lied && Array.isArray(lied.zeilen) && lied.zeilen.some((z) => (z.silben || []).some(sungen));
  const mk = (extra) => ({ ...basis(id, extra), hinweis: extra.hinweis !== undefined ? extra.hinweis : hinweis, lied: lied ? { id: lied.id, titel: lied.titel } : null });
  const reiheVon = (n, start, schritt, bauen, o = oben, u = unten) => reihe(n, Number.isFinite(opt.start) ? opt.start : start, schritt, o, u, bauen);
  const vokaleLied = () => { const st = mitLied ? vokalStatistik(lied) : null; const r = st ? st.vokale.filter((v) => 'aeiou'.includes(v)).slice(0, 4) : []; return r.length >= 3 ? r : ['i', 'e', 'a', 'o', 'u']; };

  switch (id) {
    case 'koerper-lockern': return mk({ art: 'bewegung', bpm: 60, bpmMin: 44, bpmMax: 84, begleitung: 'aus', vorsingen: 'aus',
      durchgaenge: [{ name: 'Lockern', laenge: 24, noten: [], akkorde: [], bordun: [], phasen: [
        { b: 0, d: 8, art: 'bewegen', text: 'Schultern langsam nach hinten kreisen – ein Kreis pro 2 Schläge' },
        { b: 8, d: 4, art: 'bewegen', text: 'Kopf sanft nach links neigen, ruhig atmen' },
        { b: 12, d: 4, art: 'bewegen', text: '… und nach rechts' },
        { b: 16, d: 4, art: 'bewegen', text: 'Arme locker ausschütteln' },
        { b: 20, d: 4, art: 'bewegen', text: 'Einmal herzhaft gähnen und strecken' }] }] });
    case 'atem-448': case 'zisch-atem': case 'phrasen-atem': {
      let aus = id === 'zisch-atem' ? [12, 16] : [8, 12];
      if (id === 'phrasen-atem') {
        const info = mitLied ? zeilenInfo(lied, stimme).filter((x) => x.bogen) : [];
        const lang = info.length ? Math.max(...info.map((x) => x.bogen)) : 5;
        aus = [Math.max(4, Math.ceil(lang)), Math.max(6, Math.ceil(lang * 1.5))];
      }
      const halten = id === 'atem-448' ? 4 : 0;
      return mk({ art: 'atem', bpm: 60, bpmMin: 44, bpmMax: 84, begleitung: 'aus', vorsingen: 'aus',
        durchgaenge: aus.map((a, k) => ({ name: `Runde ${k + 1}: ${a} Schläge`, laenge: 4 + halten + a, noten: [], akkorde: [], bordun: [], phasen: [
          { b: 0, d: 4, art: 'ein', text: 'Einatmen durch die Nase – Bauch und Flanken weiten sich' },
          ...(halten ? [{ b: 4, d: halten, art: 'halten', text: 'Locker halten – der Hals bleibt offen' }] : []),
          { b: 4 + halten, d: a, art: 'aus', text: `Auf „sss“ gleichmäßig ausatmen (${a} Schläge)` }] })) });
    }
    case 'kiefer-zunge': return mk({ bpm: 96, bpmMin: 60, bpmMax: 132,
      durchgaenge: reiheVon(3, S.mitte - 2, 1, (g) => durchgang(noten([...[0, 2, 4, 2, 0, 2, 4, 2].map((s, i) => [i * 0.5, 0.42, s]), [4, 4, 0]], g, 'ja', { einsatz: undefined }), g, { ton })) });
    case 'gaehn-seufzer': return mk({ bpm: 66, bpmMin: 48, bpmMax: 96, begleitung: 'bordun',
      durchgaenge: reiheVon(3, Math.min(S.kern[1], oben - 1), 1, (g) => durchgang(noten([[0, 3, 0, 'ha', { bis: -7 }]], g, 'ha'), g - 7, { laenge: 4, name: `${nn(g, ton)} ↘`, ton }), oben + 2) });
    case 'lippenflattern': case 'summen': case 'naeh': case 'schnelle-silben': {
      const silbe = { lippenflattern: 'brr', summen: 'mm', naeh: 'nä', 'schnelle-silben': ['ma', 'me', 'mi', 'mo', 'mu', 'mo', 'mi', 'me', 'ma'] }[id];
      const start = id === 'naeh' ? Math.min(S.ue - 2, oben - 9) : id === 'lippenflattern' ? S.kern[0] + 1 : S.mitte - 3;
      const bpm = { lippenflattern: 90, summen: 80, naeh: 88, 'schnelle-silben': 104 }[id];
      return mk({ bpm, bpmMin: 56, bpmMax: 140,
        durchgaenge: reiheVon(3, start, 1, (g) => durchgang(noten(id === 'summen' ? viertel(LEITER) : achtel(LEITER), g, silbe), g, { ton })) });
    }
    case 'strohhalm': return mk({ bpm: 66, bpmMin: 48, bpmMax: 96, begleitung: 'bordun',
      durchgaenge: reiheVon(3, Math.min(S.mitte - 3, oben - 9), 1, (g) => durchgang(noten([[0, 1, 0], [1, 3, 0, 'u', { bis: 7 }], [4, 3, 7, 'u', { bis: 0 }]], g, 'u'), g, { laenge: 8, ton })) });
    case 'ng-sirene': {
      let lo = S.kern[0], hi = Math.min(S.hoch + 3, S.kern[1] + 3);
      if (mitLied && lied.umfang && isFinite(lied.umfang.tief)) { lo = Math.max(S.tief, Math.min(lo, lied.umfang.tief)); hi = Math.min(S.hoch + 3, lied.umfang.hoch + 1); }
      const tops = [hi - 3, hi].filter((x, i, a) => a.indexOf(x) === i && x > lo + 4);
      return mk({ bpm: 60, bpmMin: 44, bpmMax: 90, begleitung: 'bordun',
        durchgaenge: tops.map((t) => durchgang(noten([[0, 1, 0], [1, 3, 0, 'ng', { bis: t - lo }], [4, 1, t - lo], [5, 3, t - lo, 'ng', { bis: 0 }]], lo, 'ng'), lo, { laenge: 8, name: `${nn(lo, ton)} → ${nn(t, ton)}`, ton })) });
    }
    case 'oktav-glissando': return mk({ bpm: 60, bpmMin: 44, bpmMax: 90, begleitung: 'bordun',
      durchgaenge: reiheVon(2, Math.max(S.tief, S.kern[0] - 2), 1, (g) => durchgang(noten([[0, 1, 0], [1, 3, 0, 'u', { bis: 12 }], [4, 1, 12], [5, 3, 12, 'u', { bis: 0 }]], g, 'u'), g, { laenge: 8, ton }), oben + 2) });
    case 'vokal-leiter': {
      const v = vokaleLied();
      const m = v.map((x, i) => [i * 2, i === v.length - 1 ? 4 : 1.96, 0, x, i ? { einsatz: false } : null]);
      return mk({ bpm: 80, bpmMin: 56, bpmMax: 120, vorsingen: 'stimme', vokale: true,
        kurz: `Ein Ton, nur der Mund ändert sich: ${v.map(G).join(' – ')}${mitLied ? ` (die häufigsten Vokale von „${lied.titel}“)` : ''}, verbunden auf einem Atem.`,
        durchgaenge: reiheVon(3, S.mitte, 1, (g) => durchgang(noten(m, g), g, { ton })) });
    }
    case 'diphthong': {
      let dl = mitLied ? vokalStatistik(lied).doppellaute.filter((d) => /^(Ai|Ei|Ou|Au|Oi)$/.test(d.anzeige)).slice(0, 3) : [];
      if (dl.length < 2) dl = [{ anzeige: 'Ai', vokal: 'a', gleit: 'i', beispiel: 'light' }, { anzeige: 'Ei', vokal: 'e', gleit: 'i', beispiel: 'wait' }, { anzeige: 'Ou', vokal: 'o', gleit: 'u', beispiel: 'know' }];
      const m = dl.map((d, i) => [i * 4, 3.5, 0, d.anzeige, { vokal: d.vokal, gleit: d.gleit, einsatz: true }]);
      const lage = mitLied ? Math.min(S.ue + 1, Math.max(S.mitte, (lied.umfangTeile && Object.values(lied.umfangTeile).reduce((a, u) => Math.max(a, u.hoch || 0), 0) - 2) || S.mitte)) : S.mitte;
      return mk({ bpm: 72, bpmMin: 50, bpmMax: 108, vorsingen: 'stimme', vokale: true,
        kurz: `Lange auf dem ersten Vokal bleiben, den Nachlaut erst am Ende antippen: ${dl.map((d) => `${d.anzeige}${d.beispiel ? ` wie in „${d.beispiel}“` : ''}`).join(', ')}.`,
        durchgaenge: reiheVon(2, lage - 1, 1, (g) => durchgang(noten(m, g), g, { ton })) });
    }
    case 'vokal-uebergang': {
      // schwierigster Vokalwechsel des Lieds (aus dem Lernplan), sonst A ↔ I
      let a = { v: 'a', m: S.mitte }, b = { v: 'i', m: S.mitte + 2 };
      if (mitLied) {
        const info = (lernplan(lied, stimme) || []).flatMap((t) => t.schwierig || []).filter((x) => x.art === 'uebergang');
        const z = info[0] && lied.zeilen.find((x) => x.id === info[0].zeile);
        if (z) {
          const roh = zeilenNotenRoh(lied, z);
          const k = Math.min(roh.length - 2, Math.max(0, info[0].i || 0));
          if (roh[k] && roh[k + 1]) { a = { v: roh[k].vokal, m: roh[k].midi, w: roh[k].text }; b = { v: roh[k + 1].vokal, m: roh[k + 1].midi, w: roh[k + 1].text }; }
        }
      }
      const va = String(a.v)[0], vb = String(b.v)[0];
      const m = [[0, 1.9, 0, G(va)], [2, 1.9, b.m - a.m, G(vb)], [4, 1.9, 0, G(va)], [6, 2, b.m - a.m, G(vb)]].map((x) => [...x.slice(0, 3), x[3], { vokal: x[3].toLowerCase() }]);
      return mk({ bpm: 66, bpmMin: 48, bpmMax: 100, vorsingen: 'stimme', vokale: true,
        kurz: `${G(va)} → ${G(vb)}${a.w ? ` wie in „${a.w} … ${b.w}“` : ''}: langsam verbinden, nur Zunge und Lippen bewegen sich.`,
        durchgaenge: [durchgang(noten(m, a.m), a.m, { ton, name: `${nn(a.m, ton)} / ${nn(b.m, ton)}` }), durchgang(noten(m, a.m), a.m, { ton, name: `${nn(a.m, ton)} / ${nn(b.m, ton)} (2)` })] });
    }
    case 'staccato': return mk({ bpm: 96, bpmMin: 60, bpmMax: 132,
      durchgaenge: reiheVon(3, S.mitte - 4, 1, (g) => durchgang(noten([[0, 0.4, 0], [1, 0.4, 4], [2, 0.4, 7], [3, 0.4, 4], [4, 0.4, 0]], g, 'ha', { einsatz: true }), g, { laenge: 8, ton })) });
    case 'messa-di-voce': return mk({ bpm: 66, bpmMin: 48, bpmMax: 96, begleitung: 'bordun', vorsingen: 'stimme', vokale: true,
      durchgaenge: reiheVon(2, S.mitte - 1, 1, (g) => durchgang(noten([[0, 7.8, 0, 'a', { hinweis: 'Schlag 1–4 lauter, 5–8 leiser' }]], g, 'a'), g, { laenge: 8, ton })) });
    case 'register-ausgleich': {
      const start = Math.max(S.tief, S.ue - 4);
      return mk({ bpm: 84, bpmMin: 56, bpmMax: 120, vokale: true,
        kurz: `Hinauf über deinen Übergang (${nn(S.ue, ton)}): je höher, desto runder das A und desto leichter – nicht lauter.`,
        durchgaenge: reiheVon(3, start, 1, (g) => durchgang(noten(viertel(LEITER), g, 'a').map((n) => (n.midi >= S.ue ? { ...n, hinweis: hoehenHinweis('a') } : n)), g, { ton })) });
    }
    case 'spruenge': return mk({ bpm: 80, bpmMin: 56, bpmMax: 120,
      durchgaenge: reiheVon(3, Math.max(S.tief, Math.min(S.mitte - 4, oben - 11)), 1, (g) => durchgang(noten([[0, 0.92, 0], [1, 0.92, 7], [2, 0.92, 0], [3, 0.92, 9], [4, 3, 0]], g, 'a'), g, { laenge: 8, ton }), oben) });
    case 'arpeggio': return mk({ bpm: 84, bpmMin: 56, bpmMax: 132,
      durchgaenge: reiheVon(3, Math.max(S.tief, Math.min(S.kern[0] + 1, oben - 14)), 1, (g) => durchgang(noten([[0, 0.92, 0], [1, 0.92, 4], [2, 0.92, 7], [3, 0.92, 12], [4, 0.92, 7], [5, 0.92, 4], [6, 2, 0]], g, ['nu', 'no']), g, { laenge: 8, ton })) });
    case 'konsonanten': return mk({ bpm: 92, bpmMin: 60, bpmMax: 132,
      durchgaenge: reiheVon(2, S.mitte - 2, 1, (g) => durchgang(noten([...['pa', 'ta', 'ka', 'pa', 'ta', 'ka', 'pa', 'ta', 'ka'].map((s, i) => [i * 0.5, 0.4, 0, s, { einsatz: i === 0 ? undefined : false }]), [4.5, 3.5, 0, 'a', { einsatz: false }]], g), g, { laenge: 8, ton })) });
    case 'tiefe-locker': return mk({ bpm: 76, bpmMin: 52, bpmMax: 108, begleitung: 'bordun',
      durchgaenge: reiheVon(3, Math.max(S.tief, S.kern[0] - 1), -1, (g) => durchgang(noten([[0, 0.92, 7], [1, 0.92, 5], [2, 0.92, 4], [3, 0.92, 2], [4, 4, 0]], g, 'o'), g, { laenge: 8, ton }), oben, S.tief - 1) });
    case 'legato': return mk({ bpm: 66, bpmMin: 48, bpmMax: 96, vorsingen: 'stimme',
      durchgaenge: reiheVon(2, S.mitte - 3, 1, (g) => durchgang(noten(viertel(LEITER).map(([b, d, s]) => [b, Math.min(1, d + 0.08), s]), g, 'u').map((n, i) => ({ ...n, einsatz: i ? undefined : true })), g, { ton })) });
    case 'abkuehlen': return mk({ bpm: 60, bpmMin: 44, bpmMax: 84, begleitung: 'bordun', vorsingen: 'stimme',
      durchgaenge: reiheVon(2, S.mitte, -2, (g) => durchgang(noten([[0, 4, 0, 'u', { bis: -5 }], [4, 3, -5]], g, 'u'), g - 5, { laenge: 8, name: `${nn(g, ton)} ↘ ${nn(g - 5, ton)}`, ton }), oben, S.tief - 1) });
    default: break;
  }

  // ---- Übungen auf einer Liedzeile
  const ZEILE = { 'vokale-melodie': 'vokale', 'lippenflattern-melodie': 'brr', 'melodie-nu': 'nu', 'silben-da': 'da', 'text-rhythmus': 'sprechen',
    halbtempo: 'text', originaltempo: 'text', 'mit-musik': 'text', rueckwaerts: 'text' };
  if (ZEILE[id]) {
    const z = mitLied ? (opt.zeile ? lied.zeilen.find((x) => x.id === opt.zeile) : schwersteZeile(lied, stimme)) : null;
    const modus = opt.modus || ZEILE[id];
    const d0 = z ? zeilenDurchgang(lied, z, { modus, stimme }) : null;
    if (!d0) { // ohne Lied mit Melodie: dieselbe Idee auf einer 5-Ton-Leiter
      const silbe = modus === 'vokale' ? ['a', 'e', 'i', 'o', 'u', 'o', 'i', 'e', 'a'] : modus === 'text' || modus === 'sprechen' ? 'da' : modus;
      return mk({ bpm: id === 'halbtempo' ? 60 : 84, bpmMin: 48, bpmMax: 132, vokale: modus === 'vokale', vorsingen: modus === 'vokale' ? 'stimme' : 'klavier',
        hinweis: 'Ohne Lied mit Melodie üben wir auf einer 5-Ton-Leiter. Mit The Wall oder einem eigenen Lied mit Audio wird es die echte Zeile.',
        durchgaenge: reiheVon(2, S.mitte - 3, 1, (g) => durchgang(noten(viertel(LEITER), g, silbe), g, { ton })) });
    }
    const bpm0 = lied.bpm || 100;
    const faktor = id === 'halbtempo' ? 0.5 : id === 'originaltempo' || id === 'mit-musik' ? 1 : modus === 'vokale' ? 1 : 0.8;
    // eigene Aufnahme nur in Originaltonart (transponiert würde sie falsch klingen)
    const aufnahme = (lied.id === 'the-wall' || lied.mitAudio) && !lied.transponiert ? { liedId: lied.id, ab: d0.liedAb } : null;
    let durch = [d0, { ...d0, name: d0.name + ' (2)' }];
    if (id === 'rueckwaerts') {
      const roh = zeilenNotenRoh(lied, z);
      const starts = [...new Set(roh.map((n, i) => (i && roh[i - 1].wi !== n.wi ? i : null)).filter((x) => x != null))].reverse();
      const wahl = [starts[0], starts[Math.floor(starts.length / 2)], 0].filter((x, i, a) => x != null && a.indexOf(x) === i);
      durch = wahl.map((ab) => ({ ...zeilenDurchgang(lied, z, { modus, ab, stimme }), name: ab ? `ab „${roh[ab].text}“` : 'ganze Zeile' }));
    }
    const sprechen = modus === 'sprechen';
    return mk({ art: sprechen ? 'sprechen' : 'singen', zeile: z.id, key: `${id}:${lied.id}:${z.id}`,
      bpm: Math.round(bpm0 * faktor), bpmOriginal: bpm0, bpmMin: Math.round(bpm0 * 0.4), bpmMax: Math.round(bpm0 * 1.1),
      begleitung: id === 'vokale-melodie' || sprechen ? 'aus' : 'akkord',
      vorsingen: aufnahme && faktor === 1 && !sprechen ? 'aufnahme' : modus === 'vokale' || modus === 'text' ? 'stimme' : 'klavier',
      vokale: modus === 'vokale', aufnahme, zeilenText: z.text,
      kurz: (KURZ[id] || '') + (lied ? ` Zeile: „${z.text}“.` : ''), durchgaenge: durch, hinweis: hinweis });
  }
  return null;
}

// ---------------------------------------------------------------- geführte Einheit
export function einheitPlan(lied, stimme) {
  const mitLied = lied && Array.isArray(lied.zeilen) && lied.zeilen.some((z) => (z.silben || []).some(sungen));
  const ids = ['atem-448', 'lippenflattern', 'ng-sirene', 'vokal-leiter', 'register-ausgleich'];
  const dl = mitLied ? vokalStatistik(lied).doppellaute.filter((d) => /^(Ai|Ei|Ou|Au|Oi)$/.test(d.anzeige)) : [];
  ids.push(dl.length >= 2 ? 'diphthong' : 'staccato');
  ids.push(mitLied ? 'vokale-melodie' : 'arpeggio');
  return ids.map((id) => spielplan(id, { stimme, lied })).filter((p) => p && p.durchgaenge && p.durchgaenge.length)
    .map((p, i) => (i === 0 ? { ...p, durchgaenge: p.durchgaenge.slice(0, 2) } : p));
}

// ---------------------------------------------------------------- Liedmodus: Schritte je Zeile
export function zeilenSchritte(lied, zid, stimme) {
  const z = lied && lied.zeilen.find((x) => x.id === zid);
  if (!z) return [];
  const S = stimmeVon(stimme), ton = lied.tonart;
  const info = zeilenInfo(lied, stimme).find((x) => x.zid === zid) || { gruende: [] };
  const out = [];
  if (!info.mitMelodie) {
    const p = spielplan('text-rhythmus', { stimme, lied, zeile: zid });
    if (p) out.push({ nr: 1, titel: 'Im Rhythmus sprechen', warum: 'Diese Zeile wird gesprochen – der Klick hilft, dass jede Silbe genau sitzt.', plan: p });
    return out;
  }
  const p1 = spielplan('vokale-melodie', { stimme, lied, zeile: zid });
  out.push({ nr: 1, titel: 'Nur Vokale auf der Melodie', warum: `Erst die reinen Vokale ${info.kette.map((k) => k.anzeige).join(' · ')} – so lernt die Stimme die Melodie, ohne dass Konsonanten den Ton stören.${lied.id === 'the-wall' ? ' Vorgesungen von deiner eigenen Vokal-Spur.' : ''}`, plan: p1 });
  const p2 = spielplan('mit-musik', { stimme, lied, zeile: zid });
  if (p2) out.push({ nr: 2, titel: 'Mit Text, Begleitung und Klick', warum: 'Jetzt kommen Text und Begleitung dazu – die Vokale von Schritt 1 bleiben, die Konsonanten werden kurz und leicht.', plan: { ...p2, key: `zeile2:${lied.id}:${zid}` } });
  // Schritt 3: Übergang tief → hoch bis zum höchsten Ton der Zeile
  const roh = zeilenNotenRoh(lied, z);
  const top = roh.reduce((a, n) => (n.midi > a.midi ? n : a), roh[0]);
  const v = String(top.vokal || 'a')[0];
  const ziel = Math.min(top.midi, S.hoch + 2);
  const bau = (g, vok) => durchgang(noten([[0, 0.92, -7], [1, 0.92, -5], [2, 0.92, -3], [3, 0.92, -2], [4, 3.5, 0]], g, G(vok), { vokal: vok }).map((n) => (n.midi >= S.ue ? { ...n, hinweis: hoehenHinweis(vok) } : n)), g - 7, { laenge: 8, name: `bis ${nn(g, ton)}`, ton });
  const ueber = top.midi - S.ue;
  out.push({ nr: 3, titel: `Übergang tief → hoch bis ${nn(top.midi, ton)}`, warum: ueber >= 0
    ? `Der höchste Ton ${nn(top.midi, ton)} auf „${top.text || top.wort}“ liegt ${ueber === 0 ? 'genau auf' : `${ueber} ${ueber === 1 ? 'Halbton' : 'Halbtöne'} über`} deinem Übergang (${nn(S.ue, ton)}). Wir steigen in drei Durchgängen hinauf – erst auf „u“, dann auf dem Lied-Vokal ${G(v)}: ${hoehenHinweis(v)}.`
    : `Die Zeile bleibt unter deinem Übergang (${nn(S.ue, ton)}) – hier geht es um einen lockeren Weg hinauf zu ${nn(top.midi, ton)}, ohne zu drücken.`,
    plan: { ...basis('register-ausgleich'), key: `zeile3:${lied.id}:${zid}`, titel: `Tief → hoch bis ${nn(top.midi, ton)}`, ertrag: `sicher hinauf zum höchsten Ton dieser Zeile (${nn(top.midi, ton)})`,
      kurz: `Leiter hinauf bis ${nn(top.midi, ton)}: je höher, desto leichter – ${hoehenHinweis(v)}.`, bpm: 80, bpmMin: 56, bpmMax: 120, vokale: true, vorsingen: 'stimme',
      lied: { id: lied.id, titel: lied.titel }, zeile: zid, hinweis: S.annahme ? 'Noch kein Stimmprofil: Übergang angenommen (typischer Bariton).' : null,
      durchgaenge: [bau(ziel - 2, 'u'), bau(ziel - 1, v), bau(ziel, v)] } });
  // Schritt 4 (falls nötig): die besondere Stelle dieser Zeile
  const sp = info.gruende.find((g) => g.art === 'sprung');
  const dp = info.gruende.find((g) => g.art === 'diphthong');
  const at = info.gruende.find((g) => g.art === 'atem');
  if (sp) {
    const a = sp.a, b = sp.b, va = String(a.vokal)[0], vb = String(b.vokal)[0];
    const m = [[0, 1.9, 0, G(va)], [2, 1.9, b.midi - a.midi, G(vb)], [4, 1.9, 0, G(va)], [6, 2, b.midi - a.midi, G(vb)]].map((x) => [...x.slice(0, 3), x[3], { vokal: x[3].toLowerCase(), einsatz: true }]);
    out.push({ nr: 4, titel: `Sprung „${a.text}“ → „${b.text}“`, warum: sp.text,
      plan: { ...basis('spruenge'), key: `zeile4:${lied.id}:${zid}`, kurz: `Nur der Sprung ${nn(a.midi, ton)} → ${nn(b.midi, ton)} auf ${G(va)} – ${G(vb)}: Zielton vorher innerlich hören.`, bpm: 72, bpmMin: 48, bpmMax: 108, vokale: true, vorsingen: 'stimme', lied: { id: lied.id, titel: lied.titel }, zeile: zid, hinweis: null,
        durchgaenge: [durchgang(noten(m, a.midi), a.midi, { ton }), durchgang(noten(m, a.midi), a.midi, { ton, name: 'nochmal' })] } });
  } else if (dp) {
    const anz = G(String(dp.vokal)[0]) + (dp.gleit || String(dp.vokal).slice(1));
    const m = [[0, 3.5, 0, anz, { vokal: dp.vokal, gleit: dp.gleit, einsatz: true }], [4, 3.5, 0, anz, { vokal: dp.vokal, gleit: dp.gleit, einsatz: true }]];
    out.push({ nr: 4, titel: `Doppellaut ${anz} oben`, warum: dp.text,
      plan: { ...basis('diphthong'), key: `zeile4:${lied.id}:${zid}`, kurz: `${anz} auf ${nn(dp.midi, ton)}: lange auf dem ersten Vokal, Nachlaut erst am Ende.`, bpm: 66, bpmMin: 48, bpmMax: 100, vokale: true, vorsingen: 'stimme', lied: { id: lied.id, titel: lied.titel }, zeile: zid, hinweis: null,
        durchgaenge: [durchgang(noten(m, dp.midi - 1), dp.midi - 1, { ton }), durchgang(noten(m, dp.midi), dp.midi, { ton })] } });
  } else if (at) {
    const p = spielplan('phrasen-atem', { stimme, lied });
    if (p) out.push({ nr: 4, titel: 'Atem für den langen Bogen', warum: at.text, plan: { ...p, key: `zeile4:${lied.id}:${zid}` } });
  }
  return out;
}

export { akkordAus };
