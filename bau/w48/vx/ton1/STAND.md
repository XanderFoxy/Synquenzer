# TON1 – Stand (fertig)
- Ausgang: index.html = python3 apply.py ../rel-4850/index.html index.html (md5 125767aed0f89918371d0729d07a6f82).
- 9 Haken (/*TON1*/) + Block TON1-BEGIN/-END vor spk7TrE. Worklet-Kern: wartende Stimmen laufen weiter (Hüllkurve, Wartezeit),
  bei Ankunft Einstieg an der richtigen Stelle + 5-ms-Blende; Vorab-Quelle (ohne Spektren) wird bei der vollen Quelle übernommen.
  Hauptfaden: ton1Got (PCM gelesen → sofort an wartende Engines), ton1Pre (Engine wartet, PCM schon da → sofort füttern).
- Tests: sonde.js (Browser, Reload + sofort ▶), kern.js (Node, späte Quelle), gleich.js (bitgleich ohne Warten), rauch.js, doppelt.js.
- Offen: Original-Audio-Clips (Ladezeit, siehe CHANGES.md).
