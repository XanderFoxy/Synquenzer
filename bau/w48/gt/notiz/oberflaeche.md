# oberflaeche – Stand 24.11.2026
Dateien: app/index.html, app/stil.css, app/js/app.js, app/js/speicher.js, app/manifest.webmanifest, app/icon.svg.
Routen: #start, #lied/<id>, #lied/<id>/weg, #lied/<id>/teil/<teil>, #lied/<id>/zeile/<zid>[/bau], #mitsingen/<id>, #warmup/<id> (ohne id: zuletzt geöffnetes Lied), #stimme, #neu, #uebungen, #profil=<base64url-JSON>.
Profil-Link: JSON {name, stimme:{tief,hoch,kern:[lo,hi],typ,uebergaenge:[midi],text}} → localStorage gt.profil / gt.stimme, Hash wird entfernt, Meldung „Dein Stimmprofil ist gespeichert“. Erzeugen: btoa-url von JSON (Node: Buffer.from(JSON.stringify(x)).toString('base64url')).
Speicher: IndexedDB „gesangstrainer“ (lieder, audio), localStorage gt.* (stimme, profil, fortschritt, einst, warmEin, letztesLied, uebFilter); alles mit try/catch und Ersatz im Arbeitsspeicher.
Module werden dynamisch geladen (Ersatz-Phonetik/-Plan/-Warm-up/-Klang, falls eines fehlt).
Rauchtest (werkzeug/oberflaeche/rauch.js, ohne Mikrofon): alle Seiten, Abspielen mit Kugel-Puls, Lied anlegen, quer 926×428 ohne Querscroll, hell – 0 Konsolenfehler. Fotos: fotos/o-*.png.
Offen: Mikrofon nicht automatisch getestet (nur echtes Gerät), Service Worker/offline, PNG-Icon für iOS-Homescreen (apple-touch-icon zeigt derzeit SVG), Zuordnung Silben↔Töne bei eigenen Liedern mit Audio ist grob (der Reihe nach).
## Stimmanalyse (24.11.2026)
js/stimmanalyse.js (eigener Modul-Worker): analysiere(x,sr) → Stellen/Töne mit CPP, HNR, Jitter PPQ5, Shimmer APQ5, Streuung, Cent, H1–H2, Alpha-Ratio, Register Brust/Misch/Kopf; stimmlageAusLiedern(pool) → Profil {tief,hoch,kern,typ,uebergaenge,text,+register,sauberkeit,toene,schwankung,fachText}; liedHoehe(lied, analyse) → Befunde je Zeile + Tipps.
localStorage: gt.stimmAnalysen (max 12 kompakte Analysen), gt.liedHoehe (max 6 Lieder). #stimme: Karte „Aus meinen Liedern ermitteln“ + Klaviatur-Karte; Lied-Seite: Karte „Deine Höhe in diesem Lied“. Test: werkzeug/stimme/rauch.mjs (+ rauch-wall.mjs, xander.mjs). Fotos s-stimme*.png, s-hoehe.png.
