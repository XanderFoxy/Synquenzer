# SYNQUENZER – Stand und Weiterarbeit

- **App:** `index.html` (= aktueller veröffentlichter Stand), Seite https://xanderfoxy.github.io/Synquenzer/
- **Spezifikation:** `spec/` – v2, v3, Nachtrag 1 (inkl. A.4b FM-Hüllkurven), Nachtrag 2 (Rev. 3, verbindlich, hat Vorrang).
- **Forschung:** `forschung/r7`, `forschung/r8` – Grundlagen, auf die Nachtrag 2 verweist (Kodamo-Delta, Online-Entwurf + SQL, Song-Delta, Lage, Stimme, Resynthese, Vorbilder, Studio-Setups, Zusammenarbeit).
- **Bau:** `bau/` – Workflow-Skripte und `CHANGES-V3.md` (Protokoll je Paket).
- **Verlauf:** Zweig `verlauf` – alle früheren App-Versionen (v1 … V0a-fix).

## Reihenfolge (Xanders Priorität zuerst)
1. V0b (Schnell-Bedienung) – fertig gebaut, wird getestet
2. V0d (FM-Hüllkurven, Bässe – Grundlage fürs FM-Feld)
3. FM-Feld nach Kodamo EssenceFM: V4a, V4b, V4f, V4c
4. V0c (Song-Fehler, Akkorde ändern/quantisieren)
5. Online: VO1, VO2, VS0 (Supabase-Projekt `synquenzer`)
6. Song 1 und Song 2 (FANG TEIL)
7. Lage-Grenzen, Einsingen, Mix, Verlauf
8. weiter laut Nachtrag 2 Teil E

## Weitermachen nach einer Pause
Jedes fertige Paket liegt hier als `index.html` (und im Zweig `verlauf`). Ein angefangenes Paket wird beim Neustart geprüft und fertig gebaut (Restart-Sicherheit im Bauer).
