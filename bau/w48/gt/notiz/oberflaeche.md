# oberflaeche – Stand 24.11.2026
Dateien: app/index.html, app/stil.css, app/js/app.js, app/js/speicher.js, app/manifest.webmanifest, app/icon.svg.
Routen: #start, #lied/<id>, #lied/<id>/teil/<teil>, #lied/<id>/zeile/<zid>, #warmup/<id> (ohne id: zuletzt geöffnetes Lied), #stimme, #neu, #uebungen, #profil=<base64url-JSON>.
Profil-Link: JSON {name, stimme:{tief,hoch,kern:[lo,hi],typ,uebergaenge:[midi],text}} → localStorage gt.profil / gt.stimme, Hash wird entfernt, Meldung „Dein Stimmprofil ist gespeichert“. Erzeugen: btoa-url von JSON (Node: Buffer.from(JSON.stringify(x)).toString('base64url')).
Speicher: IndexedDB „gesangstrainer“ (lieder, audio), localStorage gt.* (stimme, profil, fortschritt, einst, warmEin, letztesLied, uebFilter); alles mit try/catch und Ersatz im Arbeitsspeicher.
Module werden dynamisch geladen (Ersatz-Phonetik/-Plan/-Warm-up/-Klang, falls eines fehlt).
Rauchtest (werkzeug/oberflaeche/rauch.js, ohne Mikrofon): alle Seiten, Abspielen mit Kugel-Puls, Lied anlegen, quer 926×428 ohne Querscroll, hell – 0 Konsolenfehler. Fotos: fotos/o-*.png.
Offen: Mikrofon nicht automatisch getestet (nur echtes Gerät), Service Worker/offline, PNG-Icon für iOS-Homescreen (apple-touch-icon zeigt derzeit SVG), Zuordnung Silben↔Töne bei eigenen Liedern mit Audio ist grob (der Reihe nach).
