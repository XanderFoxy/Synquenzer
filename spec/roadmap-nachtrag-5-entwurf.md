# Roadmap Nachtrag 5 (ENTWURF, 31.10.) — Video-Ausgabe, Gesang 2, Teil überarbeiten, Auto-Mix/Master

Status: **Entwurf, Xanders Ja zur Reihenfolge/Gestaltung fehlt** (Regel 27: sichtbare Neuerungen erst nach Vorschlag).
Quelle: Xander 31.10. (wörtlich in fragen-xander-9.md). Abgleich mit der bestehenden Roadmap unten je Punkt.

## Abgleich mit der Roadmap

| Wunsch (31.10.) | Bisher in der Roadmap | Stand |
|---|---|---|
| Video wie Procreate (Aufbau Strich für Strich) | Nachtrag 1, I7: VC2a Verlauf (Ereignisse), VC2b Wiedergabe, VC2c Zeitraffer als Video (MediaRecorder, Echtzeit) – Gruppe 12/19, ganz hinten | nicht gebaut |
| Song-Video mit Umschalten (Song, Matrix, Synth-Innenleben, LFO/FM sichtbar), Video-Regie je Songteil/Clip, 9:16 mit Kamerafahrt, Ausklang | – (neu) | neu, **Priorität** |
| Gesang auf Tonhöhe quantisieren | ausdrücklich „Nicht im Umfang“ (Nachtrag 2 C, M-4 „keine Tonhöhenkorrektur“) | neu (Xander ändert seine Antwort) |
| Quantisieren des Gesangs sichtbar/hörbar (Transienten auf den Warp-Strichen) | VS5a Marken, Zeitkarte, Quantisieren (C.5) – gebaut | Xander sieht/hört keine Wirkung → erst prüfen (Fehler?), dann sichtbares Feedback |
| Vorlauf beim Einsingen (Anlauf vor Takt 1 bleibt erhalten, im Song als kleines „Schwänzchen“ vor dem Teil, Überlappen mit dem Ausklang des vorigen Teils) | VS3: Take hat nur 0,25 s Vorlauf (`in`), Song-Stimme wird an Teilgrenzen geschnitten | neu |
| Gesangs-Effekte, Vocal-Kompressor als Voreinstellung, automatisch passend (auch zu den anderen Spuren) | – (VS-P in 4.24.0 bringt nur Auto-Pegel + Begrenzer) | neu |
| Automatisches Mixing/Mastering aus Reglerstellungen + Frequenzen, Synthpop als Bezug | spec v3 §8.4–8.11: Kontext-Mastering V7b–V7d ([MASTERN]/[REMASTER], Rollenfragen, Pump-Wächter) | geplant, nicht gebaut; Auto-Mix (Pegel/EQ je Spur) neu dazu |
| Teil überarbeiten: Song-Teil noch mal laufen lassen, Clips live an/aus, als neuen Teil speichern; im Song dazuspielen; Tipp auf die gelbe Kopfzeile → als neuen Teil zusammenfassen | V2d′/V2e: Song-Aufnahme, „Als Teil“, FANG TEIL – gebaut; Zusammenfassen über die Kopfzeile fehlt | teils neu |

## Vorschlag Video (VV) — „mitdenkender Video-Arrangeur“

Grundsatz: **Bild und Ton getrennt.** Der Ton ist der fertige Song (offline gerendert, inkl. Ausklang bis −60 dB bzw. max. 10 s).
Das Bild wird aus dem Song-Zeitstrahl berechnet (welcher Teil, welche Clips, Reglerwerte, LFO-Phase, Hüllkurven zum Zeitpunkt t) –
**nichts wird dabei wirklich verstellt, der Klang ändert sich nicht.** Kein Bildschirm-Mitschnitt nötig.

- **VV1 Song-Video:** Menü → „Video“ → Format **9:16** (TikTok/Reels, 1080×1920) oder **16:9** (1920×1080); Variante
  **„Song“** (Song-Ansicht mit Laufband) oder **„Matrix“** (Clip-Matrix, spielende Clips leuchten) oder **„Auto“** (wechselt
  mit den Songteilen). Kodierung mit WebCodecs (schneller als Echtzeit, MP4/H.264 + AAC, sonst Echtzeit-MediaRecorder als
  Rückfall). Am Ende Teilen/Sichern.
- **VV2 Video-Regie:** optional je Songteil (Tipp auf die gelbe Kopfzeile → „Video“), je Taktbereich oder je Clip im Teil:
  Was ist zu sehen – Song, Matrix, Spur n (Synth-Bedienfeld), Effekt, „Auto“. Gespeichert als Zusatz im Song (`song.video`), ohne
  Einfluss auf den Klang. Ohne Angaben entscheidet der Auto-Regisseur (Schnitt an Teilgrenzen bzw. alle 4/8 Takte, zeigt was gerade
  passiert: neue Spur, Solo, LFO, Filterfahrt).
- **VV3 Innenleben:** Synth-Bedienfelder im Bild mit sich bewegenden Reglern (Modulation, LFO als laufende Welle, Hüllkurven,
  FM-Operatoren mit Pegel), MS 2000-Platte, Lauflicht des Mod-Sequenzers.
- **9:16 Kamera:** virtuelle Kamera fährt und zoomt weich über die Ansicht zum gerade wichtigen Bereich (statt Balken);
  wählbar: „Kamera“ oder „Ganz mit Balken“.
- **VV4 Aufbau-Video (wie Procreate):** braucht den Verlauf aller Bearbeitungsschritte (VC2a). Wichtig: Der Verlauf muss **ab jetzt
  aufgezeichnet** werden – ältere Songs haben keinen. Abspielen im Zeitraffer, während der fertige Song läuft (Bild = Aufbau,
  Ton = Endfassung), Länge wählbar (Songlänge / 30 s / 60 s).
- iPhone-Prüfpunkte: WebCodecs H.264 in Safari, Speicher bei 1080×1920, Teilen-Blatt.

## Vorschlag Gesang 2 (G)

- **G1 Quantisieren prüfen + sichtbar:** erst messen, ob VS5a-Quantisieren auf Audio wirkt (Xander hört nichts). Dann Feedback:
  Rasterlinien, Marken springen sichtbar auf die Linien, Wellenform vorher (blass) / nachher, Zähler „12 Einsätze gerückt“.
- **G2 Tonhöhe quantisieren:** jede erkannte Note (VS2) auf den nächsten Ton der Tonart ziehen, Stärke 0–100 %, Geschwindigkeit
  (weich → hart), Vibrato bleibt bei weich; Verschiebung per Formant-erhaltendem Pitch-Shift (PSOLA/WSOLA wie VS5b); nicht
  zerstörend, A/B.
- **G3 Vorlauf:** der Take behält den Anlauf vor dem Clip-Anfang (bis 2 Takte); in der Schleife klingt er nur beim Einstieg; im
  Song als kleines Schwänzchen vor dem Teil; Gesang darf an Teilgrenzen überlappen (Ausklang des vorigen Teils + Anlauf des
  nächsten klingen beide).
- **G4 Gesangs-Effekte:** Kette Hochpass · Entzischer · Kompressor · EQ · Hall/Delay-Sends mit Voreinstellung „Gesang Synthpop“;
  „Auto“ misst Take und Mix (Dynamik, Maskierung durch andere Spuren) und stellt Kompressor/EQ ein.

## Vorschlag Song (S)

- **S1 Teil überarbeiten:** Teil läuft in Schleife, Clips/Spuren live an/aus, neue Noten dazuspielen → „Als neuen Teil speichern“
  oder „Teil ersetzen“; ein Undo.
- **S2 Zusammenfassen:** Tipp auf die gelbe Kopfzeile (z. B. „Refrain“) → „Zusammenfassen“: alles, was im Song-Bereich dazu
  aufgenommen wurde, wird ein neuer Teil.

## Vorschlag Mix/Master (M)

- **M1 Auto-Mix:** aus den bekannten Einstellungen (Rolle, Tonumfang, Programm) + Messung des Offline-Renders je Spur: Pegel,
  Frequenz-Platz (EQ-Kerben gegen Maskierung), Stereo; Gesang vorne.
- **M2 Kontext-Mastering** (V7b–V7d wie geplant): Ziel −14 LUFS (Streaming) bzw. −9…−10 für Club, Synthpop-Bezugskurve,
  Pump-Wächter, [MASTERN]/[REMASTER].

## Vorgeschlagene Reihenfolge (nach 4.24.0)

1. VV1 + VV2 (+ Verlauf-Aufzeichnung VC2a still mitlaufen lassen) → 2. VV3 + 9:16-Kamera → 3. G1 + G3 → 4. G2 + G4 →
5. S1 + S2 → 6. M1 + M2 → 7. VV4 Aufbau-Video.
