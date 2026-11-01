# HIF – Hotfix USB-Interface (4.25.4)

Basis `bau/snapshots/R-4252.html` (4.25.2 online). `VERSION '4.25.4'`, APP_CODE 4025004, `live: true` unverändert.
Patch: `patch-hif.diff` (17 Stellen, ≈ 130 geänderte Zeilen, nur Mikro-Code) – für 4.26.0.

## Was geändert ist
1. **Eingang wählen:** nach der Erlaubnis `enumerateDevices()`; externer Eingang (nicht iPhone/eingebaut, nicht Bluetooth)
   wird automatisch bevorzugt und mit `deviceId: {exact}` geöffnet, Rückfall auf Standard bei OverconstrainedError/NotFoundError.
   Beim allerersten Öffnen (Namen gibt es erst nach der Erlaubnis) wird einmal auf das Interface umgeöffnet.
   Mikro-Blatt: Zeile „Eingang: [Name ▾]“ (Auswahl 44 px hoch, 16 px Schrift), Wahl in `uiPrefs.micIn` (Name; 'auto').
   Der Mikro-Check nimmt denselben Eingang.
2. **Route halten:** `micSess()` setzt die Sitzungsart nur bei Änderung und nie auf 'playback', solange 🎤 an ist.
   Mikro bleibt zwischen Takes offen (wie bisher). Mit Interface: Weg = Kopfhörer → kein Kurz-Einmessen, kein
   „Erst einmessen“ bei ● auf STIMME (H5).
3. **Hinweis im Einzähl-Bild:** „🎧 Interface: <Name>“ statt Hörmuschel-Hinweis.
4. **Route ändert sich trotzdem:** `devicechange` (Spur-Name ≠ gewählter Eingang, Interface weg, Interface neu da) oder
   Spur-Ende → automatisch neu öffnen mit derselben deviceId (höchstens 3× je 10 s), Toast „🎧 Eingang neu geöffnet: …“.

## Tests (`bau/tests/hif-iface.mjs`, Playwright, Attrappen für Eingänge + audioSession) – ALLE GRÜN
| Punkt | Ergebnis |
|---|---|
| Auswahl bevorzugt USB, letzte Anfrage `exact: 'dev-usb'`, Weg Kopfhörer, 0 Einmessungen trotz Lautsprecher-Profil | grün |
| Blatt: „Eingang:“ 44 px, 3 Einträge; Wahl iPhone → neu geöffnet + per Name gemerkt; zurück auf Automatisch → USB | grün |
| Rückfall: exact → OverconstrainedError → Standard, 🎤 läuft, kein Fehler | grün |
| Sitzung: 2 Gesangs-Takes auf STIMME mit 🎤 an → 0 Sitzungswechsel, 0 neue getUserMedia; nach 🎤 aus 'playback' | grün |
| Einzähl-Bild zeigt „🎧 Interface: USB Audio Interface“ | grün |
| devicechange (Spur liegt plötzlich auf dem iPhone) → neu geöffnet mit `dev-usb`, Toast; Spur-Ende → neu geöffnet, Ring läuft weiter | grün |
| Smoke: Version 4.25.4 / 4025004 / live, keine Konsolenfehler | grün |
| Regel 28: Golden-Klangtest `n5-k-golden.mjs` 4.25.4 gegen 4.25.2 | 320/320 gleich |

## Offen / bitte prüfen (Xander, am iPhone mit Interface)
- Bitte prüfen: 🎤 an → Musik bleibt im Interface-Kopfhörer, Mikro-Blatt zeigt „Eingang: <Interface>“.
- Bitte prüfen: ● auf STIMME → Vorzähler und Aufnahme bleiben im Kopfhörer, du hörst dich selbst, keine Pieptöne.
- Bitte prüfen: zweiter Take direkt danach – kein Umschalten.
- Ob iOS die Route beim Öffnen mit exact-deviceId wirklich hält, kann nur das Gerät zeigen (Chromium-Attrappe ≠ iOS).
