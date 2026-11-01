## 4.25.4 — Hotfix „USB-Interface: Ton springt beim Singen aufs iPhone“ (HIF)

Auf 4.25.2 (`bau/snapshots/R-4252.html`). `VERSION '4.25.4'`, APP_CODE 4 025 004, `live: true` unverändert. Patch
`bau/helfer/HIF/patch-hif.diff` (17 Stellen, ≈ 130 Zeilen, nur Mikro-Code). Kein neues Projekt-Feld; neu im Geräteprofil `uiPrefs.micIn`.

- **Eingang wählen.** `micInList/micInPick/micInOpen`: Eingänge mit Namen nach der Erlaubnis; externer Eingang (nicht eingebaut, nicht
  Bluetooth) bevorzugt, `deviceId: {exact}`, Rückfall auf Standard bei OverconstrainedError/NotFoundError; erstes Öffnen ohne Namen →
  einmal umöffnen. Mikro-Blatt „Eingang: [Name ▾]“ (44 px), `micInSet` merkt per Name, schaltet bei laufendem 🎤 sofort um.
  Mikro-Check (`micStart`) und `micTapGet` nutzen denselben Weg. Warum: iOS öffnete beim Aufnahmebeginn das iPhone-Mikrofon und legte
  den Ton aufs iPhone (Xander, USB-Interface).
- **Route halten.** `micSess(ty)`: Sitzungsart nur bei Änderung, nie 'playback', solange 🎤 an ist (`micTapGet`, `micTapPut`, `stStart`).
  Interface ⇒ Weg Kopfhörer (`stGot`), kein Kurz-Einmessen; H5 (`recMicStart`) verlangt mit Interface kein Profil.
- **Einzähl-Bild** `recCiHint`: „🎧 Interface: <Name>“.
- **Neu öffnen** `stReopen/stTrackBind`: devicechange (Spur auf anderem Eingang, Interface weg/neu) und Spur-Ende → derselbe Eingang
  wird neu geöffnet (Spur-Ende höchstens 3× je 10 s), Toast; Ringpuffer/Worklet bleiben, nur die Quelle wird getauscht.
- Gemessen: `bau/tests/hif-iface.mjs` 9/9 (Auswahl, Blatt, Wahl, Rückfall, 0 Sitzungswechsel in 2 Takes, Hinweis, devicechange,
  Spur-Ende, Smoke). Regel 28: `n5-k-golden.mjs` 4.25.4 gegen 4.25.2 320/320 gleich.
