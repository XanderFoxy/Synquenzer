# G9a-Kern – Schnittstelle (Zweig g9-br-S, für g9-br-U / g9-br-E / G9d)

Datei: `bau/helfer/G9S/g9-kern.js` – eine Fabrik `g9Make()` ohne äußere Bezüge (wie `vsMarksMake`), darum per
`g9Make.toString()` auch in den VS5a-Worker (`wpCall({op: 'g9f' | 'g9a'})`) einbaubar. Kein DOM, kein Netz, kein Supabase.
Spec: `spec/n8/G9.md` §5, §6.1–§6.5, §7.12. Namen in der App (Test-API §7.12) = dünne Hüllen um diesen Kern:

| App (§7.12) | Kern | Rückgabe |
|---|---|---|
| `g9Syl(word, lang)` | `K.syl(word, lang)` | `['Lie', 'be']` – Silben als Zeichenketten, Satzzeichen bleiben am Wort |
| – | `K.sylX(word, lang)` | `{s: [...], p?}` – `p: 0.5` = vereinfachte Trennung (ohne Muster), `p: 0.3` = Zahl ohne Wort |
| – | `K.sylLoad(lang, wasmBytes)` / `K.sylMode(lang)` | Muster-Modul `vendor/g9/syl/de-x-syllable.wasm` bzw. `en-us.wasm` direkt; `'muster'` / `'einfach'` (Info-Zeile „Silbentrennung vereinfacht“) |
| – | `K.words(text, lang)` | `[{x, w?, p?}]` – Text → Silben, `w: 1` Wortanfang, `w: 2` Zeilenanfang (erste Silbe jeder Zeile) |
| `g9Feat(id)` | `K.feat(x, sr, marks)` | je Marke `{rise, gap, pj, vo, von, uv, dur, conf}` (§6.1; `x` = `wpBase(id)`-Kanal, Take-Sekunden) |
| `g9Align(syl, marks, feat, o)` | `K.align(syl, marks, feat, o)` | `ly.s` (`{x, t, w?, j?, o?, p?, u?}`); `o.idx: true` → `{s, k}` mit Marken-Index je Silbe |
| `g9View(id)` | `K.view(ly, marks, feat)` | `{V: [{x, w, k, t, o, p?, u?, nm?}], n: {snap, re, nm}}` – `k` = Marke (−1 = feste Silbe ohne Marke → gestrichelt, `nm: 1`) |
| `g9Set(id, ops)` | `K.apply(ly, marks, feat, op)` | `{ok, s, sel?, hint?, merged?, missing?, toast?, word?, old?}` – `s` = neue `ly.s` (`null` = Text weg) |
| Normalisierer `tkExt().take` | `K.normLy(m.ly, len)` | `ly` oder `null` (§5.2, verwirft keine Silbe) |
| VS5b | `K.fromVs5b(lyrics, marks, lang)` / `K.lyText(ly)` | Umwandeln bei der ersten G9-Änderung / Klartext für `take.lyrics` (≤ 400 Zeichen) |
| Vorschau beim Tippen | `K.preview(ly, marks, feat, k, text, lang)` | wie `apply` `'wort'`, ohne Schreiben (≤ 2 ms) |

`marks` = `[{t, conf}]` (wie `wpMarks(id)`), `feat` = `K.feat(...)` oder `null` (dann gelten neutrale Merkmale).

## `apply`-Schritte (`op`)
| op | Bedeutung (Spec) |
|---|---|
| `{op: 'wort', k, text, lang}` | Wort an Abschnitt k tippen bzw. das Wort dort ersetzen (§6.4); Silben `u: 1`; Rückgabe `sel` = nächster Abschnitt, `hint` „2 Silben auf einer Marke“, `missing` = fehlende Plätze für [Nachrücken] |
| `{op: 'wort', k, text, lang, ins: true}` | [+] Wort vor k einfügen, Rest rückt n Silben-Plätze rechts |
| `{op: 'loesch', k}` | Wort am Abschnitt k löschen, Rest bleibt auf seinen Marken |
| `{op: 'nach', i, n}` | [Nachrücken]: ab Silbe i n Plätze nach rechts |
| `{op: 'links' \| 'rechts', i}` | Text ab hier ‹ Silbe / Silbe › (Silben-Plätze §6.1) |
| `{op: 'versch', i}` / `{op: 'trenn', i}` | Verschmelzen / Trennen (`ok: false, toast` „Keine freie Marke – beide Silben bleiben zusammen.“) |
| `{op: 'ganz', text, lang}` | [Ganzer Text] (leer → `s: null` = `ly` und `lyrics` löschen) |
| `{op: 'neu'}` | [Neu ausrichten] (auch feste Silben) |
| `{op: 'mkMove', tOld, tNew}` / `{op: 'mkDel', t}` / `{op: 'mkAdd', t}` | Marken-Haken in `wpEdit` (§6.5, `marks` = Marken **vor** der Änderung) |

Eine `apply`-Rückgabe = ein Undo-Schritt (Art `'ly'`; Marken-Haken im `'takes'`-Schritt von `wpEdit`). Die App schreibt danach
`take.ly = K.normLy({v: 1, lang, src, s}, len)` und `take.lyrics = K.lyText(take.ly)`.
Der Kern schreibt nie Marken.

## Erkennung ohne Modell (G9b-V)
`bau/helfer/G9S/g9-erk.js`, Fabrik `g9ErkMake()` – siehe dort und `CHANGES.md`.
