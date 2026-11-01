# CHANGES G6+f (gegen R-4252.html)

- **Neu:** Takes-Blatt → [Als Chor-Stimme duplizieren] → [Diese Stelle] / [Ganze Spur]: Kopie des Gesangs als freie Gegenstimme in der Chor-Spur „Gegenstimme n“ (gelb, `role 'free'`), neue Take-Kennung mit den PCM-Stücken des Leads (sofort, kein Kopieren), eine Kopie ohne Versatz, Pan Mitte, 0 dB; Noten-Editor der Kopie öffnet sich. [Ganze Spur]: jede STIMME-Stelle (alle Szenen-Clips und Song-Stimmen) eigene Kennung, eine Spur, ein Undo; Stellen mit 6 Stimmen übersprungen; 512-Takes-Grenze vorher geprüft.
- **Neu:** Chor-Blatt → [Entkoppeln] je errechneter Stimme: eigener Take (`src 'chor'`, `of`), `take.pitch` = Lead-Plan + Intervall je Note, Kopien wie vorher; folgt dem Lead nicht mehr, Transponieren geht mit.
- **Neu:** Chor-Blatt → [Background] je Gegenstimme (Kopien 12/−6/−1 · 24/+8/+1, Breite 0,15, Pan abwechselnd −0,6/+0,6, Hall 0,5/Echo 0,1 bei neuer Gruppe), an allen Stellen der Spur, ein Undo.
- Takes-Blatt: Herkunftszeilen „Chor Terz oben (aus Take 3)“ / „Gegenstimme 1 (aus Take 3)“ → ♪ öffnet die Noten dieser Stimme. Zeile ♪ Tonhöhe · Chor · Als Chor-Stimme duplizieren (quer: ✎ Marken etwas schmaler, Schrift 0,86 em).
- Daten (additiv): `S.takes[id].src 'dup'|'chor'`, `.of`; `voices[].lane/rule/dbl/w/dblOff`; `S.tracks[st].chor = {lanes}`; Undo-Art `chorlanes`.
- Laden/Aufräumen/ZIP: Stimmen-Takes gelten als aktiv und werden mitexportiert; Aufräumen behält Stücke nach Namen (geteilte Stücke); ZIP schreibt Kopien als eigenes WAV mit eigenen Stück-Namen; geteilte Takes benutzen beim Laden den schon geladenen Puffer des Leads.
- G7: `g7SegOf` findet Stimmen-Takes (Stelle = Lead-Stück).
- Test-API: `g6pEntkoppeln`, `g6pDuplizieren`, `g6pBackground`, `g6pfInfo`, `g6pfStelleOf`, `g6pfBuf`, `g6pfHeard`, `g6pfWaitHeard`, `g6pfSharedBuf`.
