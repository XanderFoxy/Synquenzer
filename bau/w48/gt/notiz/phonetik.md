# phonetik – Notiz (24.11.2026)

Dateien: `app/js/phonetik.js` (≈ 28 KB), `app/js/lexikon-en.js` (220 KB, gzip ≈ 94 KB; wird statisch von phonetik.js importiert).
Werkzeug: `werkzeug/phonetik/baue_lexikon.mjs` (neu bauen: `node baue_lexikon.mjs ../../app/js/lexikon-en.js 25000 wall_text.txt`),
`pruefe.mjs` (Prüfung gegen lied.json), `rauch.cjs` (Import-Test in Chromium: 22 ms inkl. Lexikon).

## Schnittstelle (wie im Vertrag, plus Extras)
- `zeileZuVokalen(text, sprache?)` → `[{wort, sprache, quelle, silben:[{text, vokal, gleit, anzeige, lang, hinweis, betont, schwa, laut}]}]`
  sprache 'en'|'de'|weglassen; gemischte Zeilen werden **je Wort** erkannt („Don’t wait, Folge dem Licht“ → e e d d d).
- `vokalKette(text, sprache?)` → 'Ou · Ei · O · Ou · ö · Ai'
- `erkenneSprache(text)` → 'en'|'de' (Mehrheit der Wörter)
- `uebergaenge(vokale, {alle}?)` – nimmt Ergebnis von zeileZuVokalen, Silbenliste, Anzeigen-Liste ['Ou','Ei'], eine vokalKette oder Liedtext.
  Liefert je Paar `{von, nach, paar:'I → A', art:['Kiefer','Zunge','Lippen'|'Diphthong'], schwere:1–3, hinweis, anzahl, beispiele, diphthong}`, schwierigste zuerst; `{alle:true}` = jede Stelle mit `index`.
- EXTRA `wortZuVokalen(wort, sprache?)`.
- EXTRA `silbenZuVokalen(zeile)` – zeile = `{text, sprache, silben:[{text}]}` (the-wall.json): gibt je Melodie-Silbe den Vokal zurück, auch wenn die Silbentrennung abweicht (Abgleich über Buchstaben-Überlappung; Silbe ohne Buchstaben = gehaltener Vokal, `gehalten:true`). **Für app.js/uebungen.js empfohlen.**

## Regeln
- Englisch: CMU-Wörterbuch (ISC), 25 000 häufigste Wörter (wordfreq) + alle The-Wall-Wörter; nur Vokalfolge, 1 Zeichen je Vokal. Britische Schreibung (-ise, -our, -tre), Endungen (-s, -ed, -ing, -ly …) werden auf die Grundform zurückgeführt; sonst Buchstaben-Regeln.
- ARPAbet → Gesang (Tabelle im Code): AY Ai, EY Ei, OW Ou, AW Au, OY Oi, IY/IH I, EH E (offen), AE Ä, AA A (aber O, wenn als o geschrieben: follow, Gods – britisch), AH1 A, AH0/ER0 ö, AO O, UW/UH U, ER1 Ö (r nur andeuten).
- Deutsch: ei/ai → Ai, eu/äu → Oi, au → Au, ie → I lang, Dehnungs-h, Doppelvokal, Endungs-e/-en/-er/-el → ö, be-/ge- → ö; kurz vor 2+ Mitlauten/ch/ck/tz.
- Silben: eine je Vokal; stummes e (come, eyes, hoped) und e in every (Eve-ry) werden erkannt; Hiatus + Schwa wird zusammengezogen (rea-lise → Iö · Ai). **Alle 26 Zeilen von The Wall stimmen in der Silbentrennung exakt mit lied.json überein.**

## The Wall – Zeile → Vokalkette
| # | Teil | Zeile | Sprache | Vokalkette |
|---|---|---|---|---|
| 0 | S1 | Welcome to the fake zombies living | en | E · ö · U · ö · Ei · O · I · I · I |
| 1 | S1 | for Gods sake | en | O · O · Ei |
| 2 | S1 | In a world of Sheep | en | I · ö · Ö · A · I |
| 3 | S1 | Everything we Do believe | en | E · I · I · I · U · I · I |
| 4 | R1 | We claim we know It all | en | I · Ei · I · Ou · I · O |
| 5 | R1 | Can’t see Who is behind this wall. | en | Ä · I · U · I · I · Ai · I · O |
| 6 | R1 | Don’t wait, follow the light | en | Ou · Ei · O · Ou · ö · Ai |
| 7 | R1 | wake up open your eyes. | en | Ei · A · Ou · ö · O · Ai |
| 8 | S2 | Why can’t we just feel | en | Ai · Ä · I · A · I |
| 9 | S2 | there is so much more to see | en | E · I · Ou · A · O · U · I |
| 10 | S2 | Are we hypnotised? | en | A · I · I · ö · Ai |
| 11 | S2 | What does it need to realise | en | A · A · I · I · U · Iö · Ai |
| 12 | R2 | We claim we know It all | en | I · Ei · I · Ou · I · O |
| 13 | R2 | Can’t see Who is behind this wall. | en | Ä · I · U · I · I · Ai · I · O |
| 14 | R2 | Don’t wait, follow the light | en | Ou · Ei · O · Ou · ö · Ai |
| 15 | R2 | wake up open your eyes. | en | Ei · A · Ou · ö · O · Ai |
| 16 | Tag | open your eyes | en | Ou · ö · O · Ai |
| 17 | ZT | We claim we know it all | en | I · Ei · I · Ou · I · O |
| 18 | ZT | Can’t see Who is behind this wall | en | Ä · I · U · I · I · Ai · I · O |
| 19 | ZT | Don’t wait, Folge dem Licht | de | Ou · Ei · O · ö · E · I |
| 20 | ZT | Wach auf, siehst du mich nicht | de | A · Au · I · U · I · I |
| 21 | R3 | We claim we know It all | en | I · Ei · I · Ou · I · O |
| 22 | R3 | Can’t see Who is behind this wall. | en | Ä · I · U · I · I · Ai · I · O |
| 23 | R3 | Don’t wait, follow the light | en | Ou · Ei · O · Ou · ö · Ai |
| 24 | R3 | wake up open your eyes. | en | Ei · A · Ou · ö · O · Ai |
| 25 | Out | open your eyes | en | Ou · ö · O · Ai |

**Schwierigste Übergänge im ganzen Lied (uebergaenge):**

- I → O (Schwere 3, 21×, z. B. fake → zom, ving → for)
- Ai (Schwere 3, 15×, z. B. hind, light)
- O → I (Schwere 3, 1×, z. B. zom → bies)
- U → A (Schwere 3, 1×, z. B. so → much)
- Au (Schwere 3, 1×, z. B. auf)
- Ou (Schwere 2, 17×, z. B. know, Don’t)
- U → I (Schwere 2, 13×, z. B. Do → be, know → It)
- I → A (Schwere 2, 13×, z. B. be → hind, wake → up)

## Offen / Grenzen
- CMU ist amerikanisch: can’t → Ä, want → A. Wer britisch singt, nimmt dort A bzw. O (Hinweis steht in `hinweis`).
- Unbekannte Wörter laufen über Regeln (Quelle 'regel') – gut für einfache Wörter, bei Eigennamen nur Näherung.
- „fire“, „hour“ werden als 2 Silben (Ai · ö) ausgegeben; singt man sie auf einer Note, ordnet silbenZuVokalen beide Teile derselben Note zu.
