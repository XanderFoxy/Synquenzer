# PINSEL2 – der Melodie-Pinsel arbeitet jetzt gezielt (App bleibt 4.32.0)

Basis: `bau/snapshots/R-4320.html`. Alle Stellen im Code sind mit `PINSEL2` markiert.

- **Fein (neuer Standard „schmal“):** Der Pinsel wirkt nur auf die eine Raster-Spalte unter dem Finger. Kein Nachbar wird mitgezogen.
- **Verweilen statt Wischen:** Eine Note ändert sich erst, wenn der Finger ~90 ms auf derselben Stelle bleibt, oder wenn er dort abbremst und die Richtung wechselt (wie bei einer Swipe-Tastatur). Schnelles Drüberwischen zeigt nur Geisterpunkte und ändert nichts.
- **Verweilzeit einstellbar:** neuer Knopf neben der Pinsel-Breite: 60 / 90 / 120 / 150 ms (Tippen wechselt). Er erscheint nur beim feinen Pinsel.
- **Läufe:** Setzt du zwei Ziele in einer Richtung, höchstens 8 Raster-Schritte auseinander, werden die Noten dazwischen Stufe für Stufe in der Tonart/Leiter aufgefüllt. Bei größerem Abstand oder Hin-und-her bleibt alles dazwischen unberührt.
- **Akkorde bleiben Akkorde:** In einer Spalte ändert sich nur die Note, die dem Finger am nächsten ist.
- **Rückmeldung:** Gestrichelter Rahmen, der sich beim Verweilen füllt. Beim Einrasten kommen ein leiser Tick, ein kurzes Aufleuchten und der Ton.
- **Sicher:** Loslassen ohne Einrasten ändert nichts, und ein kurzer Tipp auch nicht. Eine ganze Geste ist 1 Undo. Kommt ein zweiter Finger dazu (Zoomen/Scrollen), wird alles zurückgenommen.
- **„mittel“ und „breit“** arbeiten wie bisher (weicher Pinsel), für grobes Formen.
- Die Knopfleiste mit Spiegeln/Umdrehen ist nicht angefasst. Alte Projekte bleiben gleich, weil sich am Datenformat nichts ändert.
