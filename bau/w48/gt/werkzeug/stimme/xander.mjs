// Analysiert Xanders The-Wall-Spuren mit app/js/stimmanalyse.js und schreibt notiz/stimmanalyse-xander.md + profil-xander-2.json
import fs from 'fs';
import { wavLesen, midiName } from '../../app/js/ton.js';
import { analysiere, stimmlageAusLiedern, kompakt, liedHoehe, SAUBER_WORT } from '../../app/js/stimmanalyse.js';
const W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/repo/the-wall/';
const G = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/gt/';
const dateien = ['projekt7/Haupt-3-trocken-v7.wav', 'projekt7/Doppel-4-trocken-v7.wav', 'projekt7/Gegengesang-eigen-7.wav', ...fs.readdirSync(W + 'original').filter((f) => f.endsWith('.wav')).map((f) => 'original/' + f)];
const lied = JSON.parse(fs.readFileSync(G + 'app/daten/the-wall.json', 'utf8'));
const N = (m) => midiName(m, 'es-Moll');
const ana = [], zeilen = [];
for (const d of dateien) {
  const b = fs.readFileSync(W + d); const r = wavLesen(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
  const k = r.kanaele, x = k.length === 1 ? k[0] : Float32Array.from(k[0], (v, i) => (v + k[1][i]) / 2);
  const t0 = Date.now(); const a = analysiere(x, r.sr, { name: d });
  console.log(d, Date.now() - t0, 'ms', a.stellen.length, 'Stellen');
  ana.push(a);
}
const prof = stimmlageAusLiedern(ana.map(kompakt), { tonart: 'es-Moll' });
const lh = liedHoehe(lied, ana[0]);
const alt = JSON.parse(fs.readFileSync(G + 'notiz/profil-xander.json', 'utf8'));
const p2 = { name: 'Xander', stimme: { tief: prof.tief, hoch: prof.hoch, kern: prof.kern, typ: prof.typ, uebergaenge: prof.uebergaenge, text: prof.text,
  register: prof.register, sauberkeit: prof.sauberkeit, toene: prof.toene, schwankung: prof.schwankung, typen: prof.typen, fachText: prof.fachText,
  anstrengung: prof.anstrengung, sicherheit: prof.sicherheit, quelle: 'lieder', aufnahmen: prof.aufnahmen } };
fs.writeFileSync(G + 'notiz/profil-xander-2.json', JSON.stringify(p2));
const tab = (t) => `| ${t.name} | ${t.dauer} s | ${t.anzahl} | ${t.zone}${t.randGrund ? ` (${t.randGrund})` : ''} | ${SAUBER_WORT[t.sauber]} | ${t.register} (B ${t.reg[0]} / M ${t.reg[1]} / K ${t.reg[2]}) | ${t.tendenz} (${t.cent} ct) |`;
let md = `# Stimmanalyse Xander – The Wall (Stand ${new Date().toISOString().slice(0, 10)})\n\nCode: app/js/stimmanalyse.js (analysiere → stimmlageAusLiedern, liedHoehe), Skript werkzeug/stimme/xander.mjs. Alles Schätzungen.\n\n`;
md += `## Ergebnis in Worten\n\n${prof.text}\n\n`;
md += `- Bequeme Lage (Kern): ${N(prof.kern[0])}–${N(prof.kern[1])}; sicher: ${N(prof.tief)}–${N(prof.hoch)}\n- Stimmfach: ${prof.fachText} (${prof.typen.map((t) => `${t.typ}: ${t.wort}`).join(', ')})\n- Übergang(e): ${prof.uebergaenge.map(N).join(', ') || '–'}; Registerwechsel-Zone: ${prof.register.wechsel ? prof.register.wechsel.map(N).join('–') : 'keine klare'}${prof.register.angedeutet != null ? `, angedeutet um ${N(prof.register.angedeutet)}` : ''}; sauber in Brust bis ${prof.register.brustBis != null ? N(prof.register.brustBis) : '–'}\n`;
md += `- Schwankung zwischen den Spuren: ${prof.schwankung ? `obere Grenze Spanne ${prof.schwankung.spanneHoch} HT, untere ${prof.schwankung.spanneTief} HT (SD hoch ${prof.schwankung.hoch}, Kern oben ${prof.schwankung.kernOben})` : '–'} – Achtung: alle Spuren sind dasselbe Lied an ähnlichen Tagen, also eher Spur- als Tagesschwankung.\n`;
md += `- Anstrengung: ${prof.anstrengung.lauterNachOben ? 'wird nach oben deutlich lauter' : 'Lautstärke steigt nach oben nicht auffällig'}; ${prof.anstrengung.sauberFaellt ? 'Sauberkeit fällt nach oben' : 'Sauberkeit fällt nach oben nicht deutlich'}\n\n`;
md += `## Je Spur\n\n| Spur | klar gehalten | Stellen | Kern | sicher | Anstrengung (dB/HT oben) |\n|---|---|---|---|---|---|\n`;
for (const a of ana) { const p = stimmlageAusLiedern([kompakt(a)]); md += `| ${a.name} | ${a.sekunden} s | ${a.stellen.length} | ${p.kern[0] != null ? N(p.kern[0]) + '–' + N(p.kern[1]) : '–'} | ${p.tief != null ? N(p.tief) + '–' + N(p.hoch) : '–'} | ${a.anstrengung ? a.anstrengung.steigung : '–'} |\n`; }
md += `\n## Je Ton (alle Spuren zusammen)\n\n| Ton | Dauer | Stellen | Zone | Sauberkeit | Register | Tendenz |\n|---|---|---|---|---|---|---|\n${Object.values(prof.toene).map(tab).join('\n')}\n\n`;
md += `## Deine Höhe in The Wall (Hauptstimme, Versatz ${lh.versatz} s)\n\n${lh.text}\n\n`;
for (const b of lh.befunde) md += `- „${b.text}“ – ${b.woerter.join(', ')} (${b.name}): ${[b.unsauber && 'unsauberer', b.angestrengt && 'angestrengt/lauter', b.kippt && 'kippt Richtung Misch/Kopf', !b.kippt && b.kopf && 'Misch/Kopf'].filter(Boolean).join(', ')}\n`;
md += `\n### Tipps\n\n${lh.tipps.map((t) => `- **${t.titel}** (Übung ${t.uebung}): ${t.text}`).join('\n')}\n\n`;
md += `## Methode und Grenzen\n\n- Gehaltene Stellen ≥ 0,15 s aus tonhoehe()/noten() (ton.js); je Stelle bis 8 Fenster à ${'~46'} ms: CPP (eigener Maßstab), HNR (Autokorrelation, Boersma), Jitter PPQ5 / Shimmer APQ5 (Nulldurchgänge nach Bandpass um f0), Streuung der Tonmitte (Vibrato über 200 ms gemittelt), H1–H2, Alpha-Ratio, Obertonanteil bis 5 kHz.\n- Register gegen die eigene tiefe Lage (unterstes Drittel = vermutlich Brust) + schwache feste Anker – ohne Formant-Korrektur, daher vokalabhängig. Nur Tendenz, kein Urteil.\n- Die Spuren sind teils bearbeitet (gestimmt/trocken); Tonhöhen-Tendenz und Jitter sind dort geglättet. Für Tagesschwankung: dieselbe Übung an verschiedenen Tagen aufnehmen.\n- Vergleich altes Profil (profil-xander.json): Kern ${alt.stimme.kern.map(N).join('–')}, sicher ${N(alt.stimme.tief)}–${N(alt.stimme.hoch)}, Übergänge ${alt.stimme.uebergaenge.map(N).join(', ')}.\n`;
fs.writeFileSync(G + 'notiz/stimmanalyse-xander.md', md);
console.log(prof.typ, prof.kern, prof.tief, prof.hoch, prof.uebergaenge, JSON.stringify(prof.schwankung));
console.log(lh.text); console.log(lh.tipps.map((t) => t.titel));
