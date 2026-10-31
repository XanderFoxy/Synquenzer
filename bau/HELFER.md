# Helfer-Sitzungen (31.10.)
| Sitzung | Pakete | Zweig | Basis |
|---|---|---|---|
| session_01LWJYUUq8AC2rLPHv1V62Ei | G3 + G8 | helfer-g3g8 | vs-base-B |
| session_01LWJYUWAosBPBFPf6AegtN4 | G4 + G5 | helfer-g4g5 | vs-base-B |
| session_01LWJYUUFxrdH7jBPdsEmL9J | G1-Prüfung + G2 + G6 + G7 | helfer-g267 | n5-br-G (G1 gebaut; Merge-Basis vs-base-B) |
| session_01LWJYUVanySkaLcbjCNGtfz | VV3 | helfer-vv3 | VV1.html (Merge-Basis VV1.html gegen n5-br-V) |
| session_01LWJYUUYmACsVm6T1aswJVW | S0 + S1 + S2 | helfer-s012 | vs-base-B |
| session_01LWJYUUL9NogWFahQZPakDH | K2 + N1 + N2 + D1 | helfer-n12d1k2 | vs-base-B |
Lokal: B wf_be7512d9-bc4 (VS-L, VS-P; S/vsx-args.json), C' wf_1452d4ac-434 (V: VV1,VV2; H: VC2a; S/n5vh-args.json), K wf_cde24106-a3e (K1; S/n5k-args.json).
Ergebnisse holen: cd S/wip-repo && git fetch origin <zweig> && git show origin/<zweig>:bau/helfer/<NAME>/index.html > S/helfer-<NAME>.html
Nachtrag 14:00 UTC: Regel 28 (alter Klang bleibt, Umrechnung) erst NACH dem Start der Helfer gepusht → beim Zusammenführen prüfen (testNote enthält sie). K2 zusätzlich prüfen: FM-FELD-Hüllkurven schnell genug für Slap-Bass (Attack ≤ 1 ms, kurzes Decay) – beim Merge D bzw. Nacharbeit.
Nord-Drum-Spec: lokaler Agent schreibt S/v3-ideen/dirigent-spec-v3-nachtrag-6-drum.md (eigene Worte, Handbuch privat) → danach Helfer-Sitzung ND1–ND3.
Drum-Engine-Name (Xander 31.10.): North
| session_01LWJYUTeTvcDZQtPfr8NLdG | North ND1 (Engine) + ND3 (Programme/Kits) | helfer-nd13 | vs-base-B |
| session_01LWJYUXGaeSK8pmdiYKkFkA | North ND4 (Einbindung) + ND2 (Editor) | helfer-nd42 | vs-base-B |
North-Spec: spec/dirigent-spec-v3-nachtrag-6-drum.md (≈ 40 h Arbeit; zwei Helfer parallel → ca. 1,5–2 Tage). Zuerst ND13+ND42 untereinander zusammenführen (gleiche Basis), dann in die Hauptlinie.
SQL max_app: Xander erlaubt (31.10.), zweimal gestartet → Supabase-Bestätigung beim Nutzer kam nicht an (Zeitüberschreitung). Erneut, wenn Xander antwortet.
SQL erledigt 31.10. 14:50 UTC: max_app 4030000 (geprüft).
15:30 UTC: FERTIG: helfer-g3g8, helfer-g4g5, helfer-vv3, helfer-s012 (laut STATUS), helfer-n12d1k2 (prüfen); läuft: helfer-g267 (Nachtest), nd13, nd42.
Dateien geholt: S/helfer-<NAME>.html + S/CHANGES-helfer-<NAME>.md.
Staging-Merge Gesang läuft: wf_c92749ea-f4e (S/v3-merge-mk.js, Args S/merge-stage-ges-args.json) → S/stage-ges/index.html = 4.23.0 + G3G8 + G4G5.
Finaler Gesang-Merge danach: Hauptlinie ← VS-L, VS-P, stage-ges (Basis vs-base-B), G267, n5-br-K → 4.25.0 (bzw. 4.24.0 falls N4 nicht vorher eigens).
| session_01LWJYUU15fSJA4dbhKHvCc2 | Schnäppchen-Alarm (Ordner schnaeppchen/, Daten-Zweig schnaeppchen-daten, ntfy) | schnaeppchen | main | → nach Prüfung Ordner + Workflow nach main (nur schnaeppchen/ und .github/workflows/schnaeppchen.yml) |
| session_01LWJYUXAqP3mobyDJ9RLgVW | Konzert-/Neuerscheinungs-Alarm (Ordner konzerte/, Daten-Zweig konzerte-daten, ntfy) | konzerte | main | → nach Prüfung nach main |
konzerte: Plastic Autumn bestätigt (Xander) → Vermerk entfernen beim Review.
K1: n5-br-K fertig (K1-fix?). Minor-Befunde (Liste nach Undo veraltet, Menge ±0 % bei Tonhöhe) im Gesang-Merge mit beheben.
| session_01LWJYUTTg2qjG38pCtbUbAw | Vorteils-Radar (vorteile/: Deal-Mathe 2-für-1/Coupons, Erleben, Reisen, Musik/Auftritte, Nebenverdienst, Tests/Gewinnspiele, Spar-Tipps; Dach-Seite für schnaeppchen+konzerte) | vorteile | main | → nach Prüfung alles drei nach main |
WICHTIG: Der Gesang-Merge (B) übernimmt Extra/TestNote aus S/merge-n5-args.json – dort stehen die K1-Entscheidungen von Xander (Phasen-Reset, kein ECO-Umschalten, S&H bleibt, Anschlag nicht listen) + K1-Minor-Fixes.
Innovations-Workshop läuft: wf_5ccf27af-f8c → S/v3-ideen/innovation-vorschlag.md (dann Xander kurz vorlegen).
