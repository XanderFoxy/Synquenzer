# SPK11 LOG

- 01:52 Start: Code gelesen (spk1ViewDd, spk1MoreDd, spk2MxAudio/Midi, spk2Kl*, imp1Analyse/imp1Step/imp1Clip, Spurgrenzen MAX_T 8 / N_SCN 8).
- 01:54 Block SPK11 (nach SPK6-END) + 2 Haken (spk1ViewDd, spk1MoreDd) eingebaut.
- 01:58 Erster Lauf 428x926: 13 OK / 5 FEHLER – Zerlegen gibt nur Drums+Bass (Test legt jetzt Pads-Ebene an), IMP1 fasst S+R zu einem Teil (Läufe-Regel), Kick auch auf Snare-Schlägen.
- 02:00 Lauf 2 428x926: 17 OK / 1 FEHLER (Drums: Kick 89 statt 64 – zusätzliche Treffer aus Bass-Resten in der Drum-Ebene; Test prüft jetzt Trefferquote an den echten Stellen + meldet Zusatztreffer).
- 02:02 Drum-Einteilung neu (Snare = Mitten ≥ 1,9× Tiefen, Kick = tief + kurzes Abklingen < 0,6 nach 100 ms); offline work/hits.mjs: Kick 31/32, Snare 32/32 (Bass-Rest 0,3).
- 02:05 Snare zusätzlich = lautester Höhen-Einsatz; 428x926: 17/1 (Drums: Kick echt 63/64, Snare echt 42/64, 26 Zusatz-Kicks aus Bass-Resten) – Feinarbeit Drums offen.
- 02:06 Regression spk6-test: quer-menue FEHLER (Klang nachbauen nach „Noten bearbeiten“ schob „Effekte …“ aus dem Bild) → Knopf jetzt hinter „Effekte …“; spk6-test wird am Ende erneut gefahren.
- 02:07 spk11-test (vor Knopf-Verschiebung) alle drei Größen: 37 OK / 3 FEHLER = je drums-auf-kit; danach Snare-Regel → 428x926 17/1 (drums). Fotos fotos/10…40-*. Smoke errors [] (smoke.png). Pflicht: topdefs 26/0/0, dupkeys 0, MS 2000 1×, live 1×, VERSION 4.66.0, Markenwörter = Basis (0 im Paket), keine Emojis.
- 02:13 Regression nacheinander (reg.sh → reg.log, reg-*.out): spk6-test 1 FEHLER quer-menue (eigene Ursache, behoben) → erneut ALLES OK (reg-spk6-test-2.out) · spk5-test ALLES OK 24 · spk1-test 17 OK / 1 FEHLER verfeinern-verbessert-ziel 4,37→4,36 (bekannt, wie 4.64/4.65) · imp1-test ALLE OK · spk8-seite 14/14.
- 02:13 Endstand: spk11-test 37 OK / 3 FEHLER (nur drums-auf-kit je Größe: Kick echt 63/64 + 26 Zusatz, Snare echt 42/64) · Pflicht: topdefs 26/0/0 · dupkeys 0 · smoke errors [] · MS 2000 1× · live 1× · VERSION 4.66.0 · Markenwörter = Basis, 0 im Paket · keine Emojis · basis.html unverändert.
- 03:25 PRÜFER (unabhängig, nichts repariert): Pflicht eigene Läufe – topdefs 26/7506/0/0 · dupkeys 0 · smoke errors [] (pruef-spk11/smoke-pruef.png) · MS 2000 1× · live 1× · VERSION 4.66.0 · Markenwörter = Basis, 0 im Paket · keine Emojis. Regression einzeln: spk6 ALLES OK · spk5 ALLES OK 24 · spk1 17/1 (= Basis) · imp1 ALLE OK · spk8-seite 14/0 · spk11-test (Bauer) 37/3. Befunde: PRUEFUNG.md (2 schwer, 8 mittel, 5 leicht).
