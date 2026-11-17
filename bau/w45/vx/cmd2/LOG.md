# CMD2 – Logbuch (17.11.)
- 05:38–05:47 (früherer Lauf, angehalten): private Werkzeuge werk2/ (Lautheit, geglättetes Abklingen, Renderer für 4.79), Tom-Tonhöhe
  gemessen (pfit.py), Toms nachoptimiert (opt2_tom*.json). Paket-Ordner gab es noch nicht.
- 05:57 Neustart, darauf aufgebaut: Code R-4790 gelesen (Import-Kern sq-xla-src im Worker: read → soundFor/KIT_MAP → allocate → toProject;
  drumNote nur GM). Drum-Spuren der Datei: Tasten 37/38 bzw. 39/41/43/45/46.
- Block aus CMD1 + neue Toms (mk2.py), Lautheit 24 Schläge (lage-a): Pads +2…+10 dB zu laut. Pegel gerechnet (pegel2.json), Prüfmessung
  mit anderen Seeds (lage-b): −0,2…+0,1 dB.
- Import: Erkennung am Aufbau + Umlegung beim Lesen, erst je Spur, dann „alle passenden Spuren, wenn eine sicher ist“ (sonst blieb die
  Spur mit nur Taste 39 ohne Kennzeichen). Node-Lauf auf die echte Datei: Song-Noten je Pad = Datei.
- cmd2-test.mjs (CMD1-Tests + T7 Lautheit, T8 Import echte Datei, T9 GM-Datei): ALLE OK 30 beim ersten Lauf.
- Pflicht grün, Startzeit gleich, Hörvergleich privat (hoer-cmd2/), MESSUNG.md ergänzt.
