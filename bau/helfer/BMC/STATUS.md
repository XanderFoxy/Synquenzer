# BMC – Stand

- **Paket:** BM8 (Bend, Rad, Druck im Clip). Gebaut und getestet gegen den Platzhalter `BmHost.ctl`. Wartet auf den unabhängigen Prüfer.
- **Datei:** `bau/helfer/BMC/index.html` (Basis vs-base-B = 4.23.0; VERSION und CLOUD-Zeile unverändert).
- **Tests:** `node bau/helfer/BMC/tests/<name>.mjs`. Ergebnisse:
  - bm8-curves: 17/17
  - bm8-copy: 39/39
  - bm8-rec2: 7/7
  - bm8-regel28: 7/7
  - bm8-layout: 22/22
- **Zusammenführen:** Reihenfolge laut Spec §6: … BM5 → **BM8** → BM3 …
  - `BmHost.ctl(i, list)` an `E.ctl({list})` des Bit-Mask-Knotens.
  - `bmcIs()` über `engine === 'bm'`.
  - Druck-Geste (BM5) ruft `bmcInput` und `bmcTouch` auf.
  - Danach BM8-02 hörbar prüfen.
- **BM7** (40 Start-Programme) ist nicht begonnen: laut Auftrag erst nach BM3 + BM5.
- **Offen:** Fragen an Xander in CHANGES.md.
