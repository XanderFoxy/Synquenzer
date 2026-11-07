# GP-AK1 – Gegenprüfung „Klanganker ◆ automatisch“ (4.42.0)

**Für Xander:** Das automatische ◆ funktioniert, ich habe aber fünf Lücken gefunden und geschlossen. Wenn du während eines laufenden Clips ein Preset lädst, A/B drückst oder würfelst und danach Undo tippst, landen keine Clip-Werte mehr im Grundklang. ARP an der MS 2000-Platte bleibt jetzt an, wenn du ihn einschaltest, während ein Clip läuft. Beim „Vormachen“ für den Super-Regler gehen deine Drehungen wieder in den Super-Regler und nicht in den Clip. Und ein Undo nimmt eine gemischte Änderung (z. B. Stimmenzahl und Cutoff zusammen) wieder ganz zurück.

## Gefundene Fehler (alle in 4.42.0 nachgestellt, Test `ak1-gp.mjs` gegen basis.html: 5 FEHLT)
1. **Datenverlust Grundklang (D, L):** `soundSnapshot` nahm während einer offenen ◆-Geste die Arbeitskopie (Grundklang ⊕ Clip-Zustand ⊕ Hand). Dadurch holte das Undo von Preset laden, Klangerzeugung, 🎲 Zufall und Init die Clip-Werte in den Grundklang, also in alle Clips. `toggleAB` merkte sich ebenfalls die Arbeitskopie als „A“.
2. **Undo unvollständig (E):** Bei einer Geste mit Grundklang-Wert und Clip-Wert (z. B. `soundEdit` mit poly und cutoff, „Formant halten aus“ mit E.F.SENSE, der Spur-Schalter `onChange` während eines offenen ◆) verwarf `commitSound` das `before`. Den Grundklang-Teil konnte man dann nicht mehr rückgängig machen.
3. **Super-Regler-Vormachen kaputt (G):** Während `R.sr.cap` gingen die Regler in den Clip-Zustand: Das Vormachen fand 0 Werte, und der Clip wurde verändert. Ein beim Start offenes ◆ wäre außerdem als Basis in die Vormach-Kopie gerutscht.
4. **ARP an der MS 2000-Platte (K):** `mk.arp.*` ging in den Clip-Zustand. Der Arp läuft aber im Hauptthread und liest den Grundklang (`arpOn`), also ging der Arp nach dem Loslassen wieder aus, obwohl die Platte „an“ zeigte.

## Änderungen (nur `index.html`, Kürzel GP-AK1, je 1 Zeile)
- `ak1Key`: `mk.arp.*` bleibt im Grundklang.
- `ak1Ref`: gibt `null` zurück, solange der Super-Regler bei Vormachen ist (Bereich „alle“ oder diese Spur).
- `ak1Lb` (neu, 1 Zeile) und `lb` in `V6A.ed`: Ein ◆-Schritt ohne commitSound (Zeitgeber, zwei Finger an der Platte) heißt nach dem Regler bzw. „MS 2000“ und nicht mehr „◆ Klang“.
- `ak1End(label, before)`: `before` aus `commitSound` = der Grundklang zu Beginn der ganzen Geste; ein Grundklang-Teil kommt mit in denselben Schritt (Gruppe sound + clip).
- `commitSound` reicht `before` weiter. `soundSnapshot` schließt zuerst ein offenes ◆ dieser Spur (neuer Schnappschuss = neue Geste).
- `toggleAB` und `srCapture` schließen zuerst ein offenes ◆.
- Unverändert: Aussehen, Bedienung, VERSION/CHANGES, Video-Render (UI.vvOff, `v6aEdEnd` vor dem Render), KV1-Anzeige.

## Tests
- `t/ak1-gp.mjs <index.html> <out>` (neu, Playwright): A drei echte Regler-Gesten schnell hintereinander (3 ◆-Schritte, 3× Undo/Redo) · B Clip-Wechsel mitten in der Geste (Wert im Clip der Geste, danach spielt und zeigt Clip 2) · C Preset im laufenden Clip · D Preset in offener Geste · E gemischte Geste · F Speichern und Undo/Redo in offener Geste · G Super-Regler-Vormachen · H FM-Operatoren (op/env/patch) und AM `mkSetP`, ● Bewegung aufnehmen = Grundklang · I Song mit eigenem Song-Clip (Wert, hörbar, Undo/Redo, Speichern/Laden) · J vvOff · K ARP · L A/B und 🎲 in offener Geste · M echte Zieh-Gesten an der MS 2000-Platte (+ MA1 `v6aSnd`). **Kopie: ALLES OK, errors []. Basis: 5 FEHLT (D, E, G, K, L).**
- `t/ak1-gp-touch.mjs <index.html>` (neu): zwei Finger gleichzeitig an CUTOFF und RESONANCE (CDP-Touch). Grundklang bleibt gleich, beide Werte im Clip, alle Undos und Redos sauber. Kopie und Basis: OK.
- `t/ak1-test.mjs` (AK1-Abnahme): ALLES OK. KV1-Test (`w4400/a/kv1-test.mjs`): Basis und Kopie liefern dasselbe Bild (nur Zeit-Rauschen).
- Pflicht: topdefs 0 Syntaxfehler, 0 doppelt (Namen 4951 → 4952, neu `ak1Lb`) · Smoke errors [] (`smoke.png`) · Markenwörter 0, `MS 2000` 1, `  live: true,` 1.

## Risiken / offen (nicht geändert)
- Ein Clip-Wechsel mitten in einer langen Geste wird erst nach dem Loslassen hörbar (bis zu 1,5 s nach dem letzten Wert, wenn keine Ende-Meldung kommt). Der Wert landet richtig im Clip der Geste.
- Während einer Gleitfahrt zeigen die übrigen Regler im und nach dem Drehen gleich den Endwert (KV1-Kurve endet). Das ist nur eine Anzeige-Sache, genau wie beim ◆ bearbeiten.
- Zwei Finger an der Platte ergeben 2 ◆-Schritte („◆ MS 2000“) statt einem.
- Allgemein V6A, nicht AK1: Ein Zustand mit einer anderen Speicherwelle (OSZ1) bekommt beim Clip-Wechsel keine Tabelle nachgeschickt, und LFO-Fx-Routen (nativ) folgen Zuständen nicht.
