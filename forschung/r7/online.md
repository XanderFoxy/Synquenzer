# SYNQUENZER — Paket VO „Online-Zusammenarbeit“ (Entwurf r7, Runde 8)

Stand 17.10.2026, nach Review r7 und Nachtrag „offene Registrierung“ (Xander, 17.10.; Protokoll am Ende) · Status: **Entwurf zur Freigabe** (Orchestrator, dann Xander) · Grundlage: `v3-ideen/fragen-xander-8.md` Abschnitt O (O1–O4) und Fakten, Spec v3 + Nachtrag 1 (Teil B VC1–VC4, N0.3), App-Stand `synq-snapshots/V0a.html` (App 3.1.0).

**Kennzeichen** (wie Spec): **[Doku]** = Supabase-Dokumentation, am 17.10.2026 über das Supabase-MCP `search_docs` im Volltext gelesen (URLs unter „Quellen“) · **(SE)** = nur Suchauszug · **eK** = eigene Kenntnis, ungeprüft · **gemessen** = Chromium 141/Node auf der Xeon-VM, nie am iPhone · **lokal geprüft** = in PGlite 0.5.8 (Postgres 18.3, WASM) mit Supabase-Nachbau, **kein** echtes Supabase-Projekt.
**Nichts** wurde in einem echten Supabase-Projekt angelegt, geändert oder abgefragt.

**Dateien zu diesem Entwurf** (alle in `v3-ideen/r7/`):
- `online-schema.sql` — die vollständige Migration (identisch mit §3.3).
- `online-test/supabase-shim.sql` — Nachbau der Supabase-Teile (Rollen, `auth.uid()`, `realtime.messages`, `storage.objects`, alte Standard-Rechte) nur für Tests.
- `online-test/rls-matrix.mjs` → `.out` — RLS-/RPC-Matrix, **123/123 bestanden** (107 aus Review r7, davon 9 Einladungs-Fälle entfallen, dazu 25 neue Fälle für die offene Registrierung). Stand davor: `rls-matrix.pre-offen.mjs`/`.out`.
- `online-test/review-sec/attack.mjs` → `attack.out` (vorher) / `attack.after.out` (nach den Änderungen) — Angriffe A1–A9 des Reviews r7. **Historisch:** A5 ruft das entfallene `invite_email` auf; das Skript wurde nach dem Nachtrag nicht neu ausgeführt. Die neuen Missbrauchs-Fälle stehen in `rls-matrix.out`.
- `online-test/fake-supa.mjs` → `.out` — Prototyp eines Supabase-Ersatzes für App-Tests (PGlite + Realtime-Nachbau), **11/11**.
- Vor dem Nachtrag: `online.pre-offen.md`, `online-schema.pre-offen.sql`.
- `online-test/measure-size.mjs` → `.out` — Projektgrößen und JSON-Zeiten am V0a-Stand.
- `online-dl/` — heruntergeladene Pakete (npm: `@supabase/supabase-js@2.117.2`, `@electric-sql/pglite@0.5.8`).

---

## 0. Kurzfassung

- **Ja, Supabase passt.** Xander hat dort schon ein Konto; Auth, Datenbank mit Zeilen-Rechten (RLS), Realtime und Speicher sind im Free-Plan dabei. SYNQUENZER bekommt ein **eigenes** kostenloses Projekt, am besten in einer **eigenen Organisation** (Kontingente und Fair-Use gelten je Organisation, §2.1). Das Klassenzimmer-Projekt wird nie berührt.
- **Online läuft in der Safari-Version, und zwar nur unter einer eigenen Adresse** (GitHub Pages, nicht `raw.githack.com`, weil sich dort alle Seiten eine Herkunft und damit den Anmelde-Token teilen; §2.7). Im Claude-Viewer blockiert die Plattform jede Verbindung zu fremden Hosts. Dort zeigt die App dauerhaft „Nur auf diesem Gerät“ und bietet [In Safari öffnen und mitnehmen] an (§4.7).
- **Anmeldung: offen, wie im Klassenzimmer** (Xander, 17.10.: „Sie sollen sich dort selber einloggen oder registrieren können“): Jeder legt mit **Name, E-Mail und Passwort** selbst ein Konto an, ohne Einladung und ohne Bestätigungs-Mail. Xander braucht die E-Mail-Adressen von René und David nicht. Er schickt seinen **Mitmach-Link** (`…#mitmachen=<Freundes-Code>`) per WhatsApp; René legt damit ein Konto an, tippt [Anfrage an Xander schicken], Xander nimmt an. Ein neues Konto sieht nichts außer sich selbst. Gefunden wird man nur über Code/Link oder den genauen Namen (nur wenn selbst eingeschaltet), **nie über die E-Mail**. Gegen Missbrauch: CAPTCHA (Cloudflare Turnstile, kostenlos) ab VO1, Anmelde-Bremse als Pflicht (höchstens 12 nicht gesperrte Konten, 5 neue je Tag), Probe-Quote 5 MB für fremde Konten, Gesamt-Grenze für die Datenbank, Sperrliste (nimmt auch Leserechte) und Aufräumen durch Xander, Namensschutz für „Xander“ (§2.4b). Magic Link, Code-Mail und „Passwort vergessen“ per Mail gehen ohne eigenen Mail-Dienst nicht, weil Supabase dann nur an Team-Mitglieder schickt (§2.4).
- **Nie verloren:** lokal zuerst (wie heute IndexedDB + Rettungskopie), dazu Warteschlange und Server-Autosave 2 s nach der letzten Änderung, Versionsnummern mit optimistischer Sperre und ein Server-Verlauf, der jede Fassung aufhebt, auch bei Konflikten und auch je Gerät (§4). Während ein Konflikt offen ist, lädt die App weiter hoch. Eine Mengengrenze je Person (60 MB, für Konten ohne Raum mit Xander 5 MB) und eine Gesamt-Grenze (380 MB für alle, dazu die echte Datenbank-Größe) verhindern, dass ein Fehler oder ein fremdes Konto die Datenbank für alle vollschreibt. Ein Service Worker sorgt dafür, dass die Seite auch ohne Netz neu lädt.
- **O3 streng paarweise:** Jede angenommene Anfrage ergibt **einen** Raum für genau zwei Personen. Lesen regeln RLS-Policies, Schreiben nur geprüfte Funktionen. Lokal geprüft: David sieht Renés Sachen nie, auch nicht, nachdem David und René selbst einen Raum haben; dann sieht er nur den neuen Raum D–R (§3.4).
- **Realtime:** „René hat ‚Song X‘ gespeichert“ als Hinweis, Liste und Zähler laufen mit; „René ist da“ optional (§5).
- **Pakete:** **VO1** Anmelden + Server-Autosave + Verlauf + eigene Adresse + Offline-Neuladen (≈ 6–7 h), **VO2** Anfragen + Mitmach-Link + Paar-Räume + Realtime + Konflikt-Wahl + Presence-light + Konten-Blatt (≈ 7,5–8,5 h), **VO3** optional Anwesenheit, Sounds im Raum, Brücke zum Jam (VC3). **Empfehlung:** V0 fertig → **VO1** → V4 (Kodamo) → **VO2** → V2 …; VO2 kann ohne Folgen vor V4 rücken, wenn Xander den Freund sofort dabeihaben will (§9).

**Für Xander in drei Sätzen:** Deine Songs liegen künftig zusätzlich online in einem eigenen, kostenlosen Supabase-Projekt und sind nach dem Neuladen nie weg; das läuft in der Safari-Version, die Claude-App bleibt wie sie ist. Du schickst René deinen Mitmach-Link, er legt damit selbst ein Konto mit Name und Passwort an und schickt dir eine Anfrage; erst wenn du annimmst, habt ihr einen gemeinsamen Raum „Mit René“; David sieht davon nichts, solange er nicht selbst mit René verbunden ist, und auch dann nur das, was die beiden teilen. Speichert René, siehst du es sofort; ändert ihr gleichzeitig, wählst du „übernehmen“ oder „beide behalten“, verloren geht keine Version.

---

## 1. Xanders Wunsch → Lösung

| Xander (Runde 8, O) | Lösung | § | Paket |
|---|---|---|---|
| O1 Alles liegt online; jeder sieht, was der andere beiträgt; speichert der Kumpel, sieht Xander es | Jedes Projekt und die eigenen Sounds liegen zusätzlich auf dem Server. Geteilte Projekte liegen im Raum des Paares; Speichern des Partners → Hinweis, Liste mit Autor und Zeit, Zähler „1 neu“ | 4, 5 | VO1, VO2 |
| O2 Kleines Login, gegenseitig geschützt (17.10.: selbst registrieren wie im Klassenzimmer) | Offene Registrierung mit Name + E-Mail + Passwort; RLS: ohne Anmeldung keine Daten, ein neues Konto sieht nur sich; jede Zeile nur für Berechtigte; Missbrauchsschutz §2.4b | 2.4, 2.4b, 3 | VO1 |
| O3 Nur auf Anfrage, paarweise getrennt; David sieht René nicht, solange er René nicht selbst angefragt hat und René zugestimmt hat | Anfrage → Annehmen/Ablehnen; ein Raum je Paar; Projekte nur im eigenen Raum sichtbar; Teilen nur „Nur ich → Raum“, nie von Raum zu Raum | 3.2–3.4 | VO2 |
| O4 Nicht nur im Browser; nach dem Neuladen ist NIE etwas weg | Lokal zuerst + Warteschlange + Server-Autosave + Verlauf; beim Start gewinnt der neueste Stand nach Versionsnummer, Konflikte behalten beide Fassungen | 4 | VO1 |

---

## 2. Plattform-Fakten mit Quellen

### 2.1 Supabase Free-Plan

| Punkt | Wert | Quelle |
|---|---|---|
| Kostenlose Projekte | 2 je Person, gezählt über alle Organisationen, in denen Xander Owner/Admin ist; pausierte zählen nicht | [Doku] S1 |
| Kontingent gilt für | die **ganze Organisation**, nicht je Projekt (Datenbankgröße ausgenommen: je Projekt) | [Doku] S1 |
| Datenbank | 500 MB je Projekt; darüber **nur lesen** (`cannot execute INSERT in a read-only transaction`); ein neues Projekt belegt schon ≈ 40–60 MB | [Doku] S1, S6 |
| Datei-Speicher | 1 GB; eine Datei höchstens 50 MB | [Doku] S1, S7 |
| Egress (Datenverkehr zum Gerät) | 5 GB ungecacht + 5 GB gecacht je Monat | [Doku] S2 |
| Monatlich aktive Nutzer | 50 000 | [Doku] S1 |
| Realtime | 200 gleichzeitige Verbindungen, 2 Mio. Nachrichten je Monat; 100 Nachrichten/s, 100 Kanal-Beitritte/s, 100 Kanäle je Verbindung, Presence 20 Nachrichten/s, 10 Presence-Schlüssel je Objekt, Broadcast ≤ 256 KB, Postgres-Changes ≤ 1024 KB je Ereignis | [Doku] S1, S14 |
| Sicherungen | Free-Plan: Datenbank-Sicherungen **nicht herunterladbar** | [Doku] S5 |
| Überschreitung | Free-Plan: Hinweis an die Rechnungs-Adresse, Schonfrist; danach Einschränkung (HTTP 402 `exceed_*_quota`) für die Projekte **der Organisation** | [Doku] S2, S4 |

**Folgerung:** SYNQUENZER in eine **eigene Free-Organisation** „SYNQUENZER“ legen. Dann teilt es weder Egress noch Speicher noch eine mögliche Einschränkung mit dem Klassenzimmer. Das ist der zweite (und letzte) freie Platz.

**Bedarf (gemessen, `online-test/measure-size.out`, `rls-matrix.out`):** Demo-Projekt 11,9 KB als Datei (3,5 KB gzip, in Postgres gespeichert 4,5 KB); künstlich großes Projekt mit 20 vollen 16-Takt-Clips 258 KB (57 KB gzip, gespeichert 76 KB). Drei Personen mit je 1,5 h Arbeit am Tag ergeben mit der Verlaufsregel (§4.1, Schicht 4) ≈ 800 automatische Fassungen in 30 Tagen, also grob 4–60 MB für das jeweils letzte Monatsfenster, plus ≈ 0,5–14 MB je weiterem Monat (ein Stand je Projekt und Tag); Schätzung aus den gemessenen Größen. Frei sind ≈ 440 MB: bei normalen Projekten mehrere Jahre, im schlechtesten Fall (nur sehr große Projekte) ≈ 2 Jahre. Die App zeigt Xander (Verwalter) die Belegung (`storage_report`) und warnt ab 80 %.

**Mengengrenze je Person (Review r7, lokal geprüft):** Ohne Grenze reichen ≈ 140 Aufrufe mit 1,9-MB-Projekten, um die freien ≈ 440 MB zu füllen. Dann schaltet Supabase die ganze Datenbank auf nur lesen (S6), und für alle scheitert jedes Speichern. Deshalb prüft der Server je Person eine Quote (`private.settings.quota_bytes`, Vorgabe 60 MB Rohtext aus eigenen Projekten, eigenen Versionen, Bibliothek und Raum-Sounds), dazu Tempo-Grenzen: höchstens 50 neue Projekte je Tag, `mark_version` höchstens 20 je Projekt und Stunde, höchstens 200 Raum-Sounds je Person. Bei voller Quote speichert `save_project` den aktuellen Stand weiter (nichts geht verloren) und setzt nur die automatischen Versionen aus (`quota: true` → Hinweis). Anlegen, Merken und Bibliothek melden `54000 quota`. **Offene Registrierung (17.10.):** „Konten × 60 MB“ ist nicht mehr begrenzt. Deshalb gilt zusätzlich eine **Gesamt-Grenze** `total_bytes` = 380 MB für alle zusammen (380 MB + ≈ 60 MB Grundbelegung + Puffer < 500 MB). `quota_left` liefert das Kleinere aus eigenem Rest und Server-Rest; ist der Server voll, meldet der Server `54000 server_full`, normales Speichern geht wie bei der eigenen Quote weiter (lokal geprüft).

### 2.2 Pausieren nach Untätigkeit

- Free-Projekte mit zu wenig Datenbank-Aktivität in **7 Tagen** werden pausiert. „Ein paar Anfragen pro Tag“ in der Vorwoche reichen meist. Vorher kommt eine Warn-Mail an den Besitzer, danach eine Bestätigung. Wiederherstellen per Dashboard bis **90 Tage** nach der Pause, mit allen Daten. [Doku] S3
- Ein pausiertes Projekt antwortet mit **HTTP 540**. [Doku] S4
- **In der App, je Person verschieden** (alles bleibt lokal gesichert, neuer Versuch höchstens alle 5 min):
  - Freunde: „Online macht gerade Pause. Deine Änderungen sind auf diesem Gerät sicher und gehen automatisch hoch, sobald der Server wieder läuft. [Xander Bescheid sagen]“ (Teilen-Blatt mit fertigem Text).
  - Xander (`cloud:me.admin`): „Der kostenlose Server schläft nach 7 Tagen ohne Nutzung. [Supabase öffnen] → Projekt „synquenzer“ → „Restore project“, dauert ein paar Minuten.“ Der Knopf öffnet `https://supabase.com/dashboard/project/<ref>`.
- **Vermeiden (Vorgabe jetzt JA, F4):** Pausieren ist bei drei Hobby-Musikern, die mal eine Woche nichts machen, der Normalfall. Dazu kommt: Safari kann den Skript-Speicher nach 7 Tagen ohne Besuch löschen (W4), ein pausiertes Projekt ist nur 90 Tage wiederherstellbar (S3). Deshalb (1) ein täglicher Wach-Ping auf `rpc/ping` (für `anon` freigegeben, liest keine Daten) als GitHub-Action (R10), (2) ein Ping bei jedem App-Start mit Sitzung, der nichts kostet. In öffentlichen Repos werden zeitgesteuerte Workflows nach **60 Tagen ohne Repo-Aktivität** abgeschaltet (SE, W2). Deshalb macht die Action einmal im Monat einen leeren Keepalive-Commit. Die Warn-Mail bleibt die zweite Sicherung.
- **Ist der Server pausiert oder liegt ein Eintrag länger als 3 Tage in der Warteschlange,** zeigt die App einmal am Tag „[Alles sichern] – lade jetzt eine Sicherungsdatei“ (`deliverNow`).

### 2.3 supabase-js laden

- **Version:** `@supabase/supabase-js` **2.117.2** (npm, veröffentlicht 25.09.2026). Neuer ist 2.118.0 vom 15.10.2026, also jünger als zwei Wochen; nach der Plattform-Regel „feste Version, mindestens zwei Wochen alt“ nehmen wir 2.117.2. [npm] N1
- **UMD-Datei** `dist/umd/supabase.js`: **217 945 B** roh, **55 275 B** gzip (gemessen am npm-Paket). Sie legt die globale Variable `supabase` an; `const { createClient } = supabase` (README des Pakets, N2).
- **SRI** (sha384 der Datei aus dem npm-Paket): `sha384-Rj26LVGvoeRVR6+mwQmFfcR3QOBEwT+ZmuCWpuiqeTzJpCs0ER4ITAWGb4Hiy3Ok`
- **Laden, nur wenn gebraucht** (Sitzung vorhanden oder Tipp auf „Online“), nie im Claude-Viewer:
  1. zuerst `vendor/supabase-js-2.117.2.umd.js` neben `index.html` im Zweig `dirigent-synth` (gleiche Herkunft, kein Fremd-CDN; die Datei kommt bytegleich aus dem npm-Paket);
  2. sonst `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js` mit `integrity` und `crossorigin="anonymous"`. jsDelivr liefert npm-Dateien unverändert aus (eK; jsDelivr und cdnjs waren von hier aus gesperrt, nicht geprüft).
- Größe in `index.html`: **0 B** für die Bibliothek; nur die eigene SYNC-Schicht zählt (§7.5).
- Das Klassenzimmer lädt supabase-js schon genauso (UMD, jsDelivr) und meldet sich mit `signInWithPassword` an (Repo gelesen über `gh api`, `index.html` und `backend.js` im Zweig `main`). Dort funktioniert der Browser-Zugriff auf Supabase von einer GitHub-Seite aus.

### 2.4 Anmeldung am iPhone: drei Wege im Vergleich

Fakt vorab: Ohne eigenen Mail-Dienst schickt Supabase Auth-Mails **nur an Mitglieder des Organisations-Teams** („Email address not authorized“), mit niedriger, jederzeit änderbarer Stundengrenze, ohne Zusage zur Zustellung. René und David als Team-Mitglieder einzutragen hieße, ihnen das Dashboard zu öffnen; das scheidet aus. [Doku] S8

| Weg | Am iPhone | Ohne eigenen Mail-Dienst | Bewertung |
|---|---|---|---|
| **Magic Link** | Link öffnet Safari, nicht die Home-Bildschirm-App und nicht die Claude-App; mit PKCE muss er im selben Browser geöffnet werden; Mail-Scanner können den Einmal-Link vorher „verbrauchen“ | **geht nicht** für René/David | ungeeignet [Doku] S5, S10, eK |
| **Code per Mail (OTP, 6 Ziffern)** | Code wird in der Seite getippt, klappt auch in der Home-Bildschirm-App | **geht nicht** für René/David | gut, aber erst mit eigenem SMTP [Doku] S10, eK |
| **E-Mail + Passwort** | Schlüsselbund füllt aus (`autocomplete`), kein Mail-Postfach nötig | **geht**, wenn „Confirm email“ aus ist (bei gehosteten Projekten standardmäßig an) | **Empfehlung** [Doku] S9 |

**Empfehlung (Nachtrag 17.10., Xanders Entscheidung): offene Registrierung mit E-Mail + Passwort + Name, „Confirm email“ aus, Mindestlänge 8 — so wie im Klassenzimmer.** Das Klassenzimmer ruft `client.auth.signUp({email, password, options: {data: {name}}})` auf und meldet sich direkt an, wenn eine Sitzung zurückkommt (Repo `backend.js` Z. 202–205, `app.js` Z. 92443 im Zweig `main`, nur gelesen; L5). SYNC macht dasselbe mit `options.data.display_name` (der Trigger `handle_new_user` legt daraus das Profil an). Es gibt **keine Einlass-Liste** mehr; Xander muss keine Adressen kennen.
- **Warum „Confirm email“ aus bleiben muss** (S8, am 17.10. erneut im Volltext gelesen): Ohne eigenen SMTP-Dienst stellt Supabase Auth-Mails nur an Adressen des Organisations-Teams zu, alle anderen scheitern mit „Email address not authorized“; dazu eine niedrige, änderbare Stundengrenze ohne Zusage. Mit „an“ bekäme René nie die Bestätigungs-Mail, sein Konto bliebe unbestätigt, und `signUp` lieferte keine Sitzung. Das Klassenzimmer zeigt für genau diesen Fall den Hinweis „… oder ‚Confirm email‘ steht noch auf an“ (L5). Folge von „aus“: Die E-Mail wird nie geprüft. Sie ist nur der **Anmeldename**, wird niemandem angezeigt und ist nicht suchbar (§3.2 VO-E15). Supabase rät selbst, Bestätigungen nicht „unter Druck“ abzuschalten (S8); das Risiko dahinter (Fremde legen Konten auf fremde Adressen an, um sie später zu übernehmen) trifft hier nicht, weil Konten außerhalb von SYNQUENZER nichts bedeuten.
- **Die „Before User Created“-Einlass-Liste entfällt.** Der Hook bleibt als **Anmelde-Bremse (Pflicht, Review 2)** (§2.4b): keine Prüfung der Adresse gegen eine Liste, nur Obergrenzen und Sperr-Domains. [Doku] S12, S13
- **Passwort vergessen** (ohne Mail-Dienst kein Selbst-Reset; drei Wege):
  1. **Jetzt (Vorgabe): Reset durch den Verwalter.** In der App steht „Passwort vergessen? Sag Xander Bescheid – er lässt es neu setzen.“ Xander nennt dem Orchestrator den **Namen und Freundes-Code** (aus dem Konten-Blatt §6.3b, ohne E-Mail). Der Orchestrator setzt ein Übergangs-Passwort über die Auth-Admin-API `updateUserById(id, {password})` mit dem geheimen Schlüssel aus einer lokalen Sitzung oder im Dashboard (Authentication → Users), nie aus der App, nie im Browser (R12). Der Freund ändert es danach in der App (`auth.updateUser({password})`, angemeldet; braucht keine Mail, eK).
  2. **Später: eigener SMTP-Dienst** (z. B. Resend, Brevo; Liste in S8). Dann gehen `resetPasswordForEmail` mit Link zurück zur Pages-Adresse und optional Code-Login; „Confirm email“ kann dann an. Voraussetzung: echte Adressen (die App bittet deshalb schon jetzt um „deine echte E-Mail, falls du sie später zum Zurücksetzen brauchst“).
  3. *(nicht geplant)* Notfall-Code bei der Registrierung, eingelöst über eine Edge Function mit geheimem Schlüssel. Zu viel Aufwand für drei Personen.
- **Schlüsselbund muss das Passwort sicher speichern**, weil ein Reset Aufwand ist (Weg 1): Kontofeld `type="email"` mit `autocomplete="username"` und `inputmode="email"`, Passwort `autocomplete="new-password"` bzw. `"current-password"`, beides in einem echten `<form>` mit Submit-Knopf (`preventDefault`); nach Erfolg wird das Formular aus dem DOM entfernt, damit Safari „Passwort sichern“ anbietet (Apple, W7). Später optional ein eigener SMTP-Dienst (z. B. Brevo, Resend; Liste in S8), dann gehen Reset-Mail und Code-Login.
- **Redirect-URLs** (für spätere Mails, schadet jetzt nicht): Site URL und Redirect URL = `https://xanderfoxy.github.io/synquenzer/` (eigene Pages-Adresse, §2.7; genaue Adresse statt `**`, wie die Doku empfiehlt). Zieht die Seite um (§2.7), kommt die neue Adresse dazu. [Doku] S11
- **Sitzung:** supabase-js hält Zugangs-Token (≤ 1 h) und Refresh-Token im `localStorage` und erneuert selbst. [Doku] S21, eK. Eigener Schlüssel je App über `auth.storageKey: 'synq-auth'` (Option von `createClient`, S22, eK); nach dem Abmelden löscht SYNC den Token-Schlüssel ausdrücklich.

### 2.4b Offene Registrierung: Schutz vor Missbrauch im Free-Plan

Die Pages-Adresse ist öffentlich, der Publishable Key steht in der Seite (S17). Jeder kann also `signUp` aufrufen, auch ein Skript. Was das kosten kann und was dagegen hilft:

| Gefahr | Schutz | Wo | Quelle |
|---|---|---|---|
| Viele Konten per Skript | **Supabase Auth Rate Limits** helfen hier nicht: Für Passwort-Registrierung **ohne Mail gibt es keine IP-Grenze**. Die IP-Grenze gilt nur für anonyme Anmeldungen, die Grenze „Endpoints that trigger email sends“ (`/auth/v1/signup`) nur, wenn eine Mail rausgeht (Doku „Rate limits“ am 17.10. per `search_docs` geprüft). Das Repo ist öffentlich, Pages-Adresse und Publishable Key sind leicht zu finden. | Dashboard: Authentication → Rate Limits | [Doku] S24, S5 |
| … | **CAPTCHA ab VO1** (Pflicht, Review 2): Supabase Auth unterstützt **Cloudflare Turnstile** (kostenlos) und hCaptcha für Registrierung, Anmeldung und Passwort-Reset. Einschalten unter Authentication → Bot and Abuse Protection → „Enable CAPTCHA protection“ mit dem Secret Key; die App lädt das Widget-Skript und gibt `options: {captchaToken}` an `signUp`/`signInWithPassword` mit. Dashboard-Schalter und erste Online-Version kommen gleichzeitig (R3). René und David registrieren sich weiter selbst, nur mit dem Turnstile-Feld dazu (meist ohne Rätsel). Das Klassenzimmer nutzt kein CAPTCHA (L5). | `CLOUD.captcha` (§7.2), R3 | [Doku] S25, S5 |
| … | **Anmelde-Bremse** (Hook „Before User Created“, Postgres-Funktion, **Pflicht**, R3): höchstens `max_accounts` = 12 **nicht gesperrte** Konten und `max_signups_day` = 5 neue, nicht gesperrte je 24 h. Gesperrte zählen nicht mit; sonst legt ein Skript die Registrierung dauerhaft lahm, bevor René und David ein Konto haben (lokal nachgestellt: 3 Konten, 1 gesperrt, Grenze 3 → vorher 403, jetzt erlaubt). `signup_open = false` schließt die Registrierung. Optional `signup_need_ref = true` (Vorgabe **aus**): Registrierung nur mit gültigem Freundes-Code eines nicht gesperrten Kontos in `user_metadata.ref` (die Payload enthält `user_metadata`, Doku S13); der Mitmach-Link liefert den Code ohnehin, es bleibt Selbst-Registrierung wie `?ref=` im Klassenzimmer. `private.signup_denylist` ist ohne Mail-Bestätigung **nahezu wirkungslos** (Adressen sind unbestätigt und frei erfunden) und bleibt nur für offensichtliche Fälle. Der Hook bekommt `metadata.ip_address`; wir speichern keine IPs. | §3.3 Teil 4, R3 | [Doku] S13, lokal geprüft |
| Konten füllen die Datenbank | **Probe-Quote** (Review 2, VO-E17): volle Quote 60 MB nur für Verwalter, vom Verwalter markierte Konten ([Vertrauen], `admin_trust`) und Konten in einem aktiven Raum mit einem davon; alle anderen 5 MB (`probation_bytes`). 12 Konten × 5 MB bleiben weit unter der **Gesamt-Grenze** `total_bytes` 380 MB (VO-E14); vorher reichten 7 fremde Konten × 60 MB, um René und David das Anlegen zu sperren. Dazu prüft `check_quota` die echte `pg_database_size` gegen `db_soft_limit` 440 MB (auth, Indizes, tote Zeilen zählen mit) und `save_project` erlaubt höchstens 30 Schreibvorgänge je Projekt und Minute (`slow_down`). Supabase schaltet bei 500 MB auf nur lesen (S6). | `private.settings` | [Doku] S6, lokal geprüft |
| Anfragen-Spam an Xander | Anfrage-Tempo (3 je Paar und 24 h, 20 offene je Absender); nach **zwei** Ablehnungen durch denselben Empfänger gilt `declined_recently`, bis der Empfänger selbst anfragt (Review 2); **Sperrliste**: [Sperren] im Konten-Blatt (`admin_block`) zieht alle offenen Anfragen zurück und **beendet die Räume** des Kontos; ein gesperrtes Konto kann nichts mehr schreiben, suchen, anfragen **oder lesen** (sieht nur noch sein eigenes Profil; vorher las ein angenommener Fremder nach dem Sperren weiter Inhalte und Realtime, lokal nachgestellt) und ist nicht mehr auffindbar. [Sperren + Daten löschen] (`p_purge`) gibt seinen Platz frei | §6.3b, VO-E16 | lokal geprüft |
| Verwaiste Konten | **Aufräumen** (`admin_cleanup`): löscht Konten älter als 30 Tage (mind. 7) ohne Projekt, ohne Bibliothek, ohne Raum, ohne Raum-Sound; Verwalter und gesperrte Konten nie (sonst wäre die gesperrte Adresse wieder frei). Erst Probelauf mit Namen, dann Zwei-Schritt. Gesperrte Konten mit Daten leert `admin_block(…, p_purge => true)`; danach lässt sich das Konto im Dashboard löschen, sofern es keine Projekte in einem Raum besitzt (`projects.owner_id … on delete restrict`). Supabase hat für ungenutzte Konten keine Automatik (S26). Ob `postgres` als Eigentümer der Funktion in einem echten Projekt `auth.users` löschen darf, ist ungeprüft (eK) → R13 | §6.3b, R13 | [Doku] S26, eK |
| Namen übernehmen | **Namensschutz** (Review 2, VO-E18): Trigger auf `profiles` (gilt auch für direktes PATCH) entfernt Steuer- und Formatzeichen, verlangt ein sichtbares Zeichen und reserviert den Namen des Verwalters (Groß/klein egal); beim Registrieren wird daraus „Musiker“. Gegen Homoglyphen („Xаnder“ mit kyrillischem а) zeigen Such-Treffer und Anfrage-Karte **„✓ Verwalter“** aus dem Server-Feld `is_admin` und den Freundes-Code groß mit „Code vergleichen“ | §6.5b | lokal geprüft |
| Leute finden, die man nicht kennt | **Niemand ist öffentlich gelistet.** Suche nur nach genauem Freundes-Code (6 Zeichen aus 32, ≈ 1 Mrd. Möglichkeiten) oder genauem Namen, Namenssuche nur wenn selbst eingeschaltet (`findable`, Vorgabe **aus**); **höchstens 30 Suchen je Konto und Stunde** (`slow_down`, Review 2: vorher liefen 300 Aufrufe ohne Bremse); keine E-Mail-Suche. **Aber:** `signUp` verrät, ob eine Adresse schon ein Konto hat („User already registered“ bei „Confirm email“ aus; die App wertet das als `exists`); nur das CAPTCHA bremst das. Eine Anfrage zeigt nur Name und Code; sehen kann man erst nach „Annehmen“ (O3 unverändert) | VO-E15 | lokal geprüft |

**Vorgabe für den Start:** Turnstile an (ab VO1), Anmelde-Bremse an (12/5, Pflicht), `signup_need_ref` aus, Probe-Quote 5 MB, Gesamt-Grenze 380 MB, `db_soft_limit` 440 MB. Kommen fremde Konten dazu: [Sperren] (bei Daten [Sperren + Daten löschen]), notfalls `signup_open = false` oder `signup_need_ref = true`.

### 2.5 Realtime: Postgres Changes oder Broadcast

| | Postgres Changes | Broadcast / Presence |
|---|---|---|
| Wofür bei uns | „René hat gespeichert“, neue Anfrage, Raum beendet (VO2) | „René ist da“, später Jam-Takt (VO3) |
| Rechte | RLS-SELECT-Policy der Tabelle, je Ereignis und je Empfänger geprüft | RLS auf `realtime.messages`, privater Kanal, Rechte gelten für die Dauer der Verbindung (bis neues JWT) |
| Einrichtung | Tabelle in Publikation `supabase_realtime` | `private: true` am Kanal; im Dashboard „Allow public access“ **aus** |
| Grenzen | DELETE-Ereignisse sind nicht filterbar und nicht RLS-geprüft (nur Primärschlüssel); große Zeilen über 1024 KB verlieren Felder > 64 B | Payload ≤ 256 KB (Free) |
| Quelle | [Doku] S15, S14 | [Doku] S16, S14 |

**Wahl:** Postgres Changes nur auf die **kleinen Kopf-Tabellen** `projects`, `collab_requests`, `spaces`. Der große Inhalt (`project_data`) ist absichtlich **nicht** in der Publikation; die App holt ihn nur beim Öffnen. Bei drei Personen ist die Prüfung je Empfänger kein Engpass. Gelöscht wird nur weich (`deleted_at` = UPDATE, RLS-geprüft); echtes Löschen gibt es nur für eigene private Projekte im Papierkorb. **Die Publikation sendet keine DELETE-Ereignisse** (`publish = 'insert, update'`, lokal geprüft): DELETE-Ereignisse sind nicht RLS-geprüft und nicht filterbar (S15). Sonst könnte jeder Angemeldete die IDs fremder, endgültig gelöschter Projekte mitlesen.

### 2.6 Speicher für Audio (später, mit VS-Mikrofon)

- Privater Eimer `space-audio`, Pfad `<raum-uuid>/<projekt-uuid>/<datei>`; RLS auf `storage.objects` über den ersten Ordner (Policies in §3.3, Teil 8; lokal geprüft). Nutzer dürfen Aufnahmen **nicht löschen**, weil gemeinsame Songs und Versionen darauf verweisen. Aufräumen nur durch den Verwalter, wenn kein Projekt-Inhalt die Datei mehr nennt. Free: 1 GB gesamt, ≤ 50 MB je Datei. [Doku] S1, S7
- 128 kbit/s AAC ≈ 0,94 MB je Minute (gerechnet) → 1 GB ≈ 18 h Audio. Formate wie EN-12: `.mp4` (AAC) bzw. `.webm`.

### 2.7 Wo die App läuft

- **Claude-Viewer (Artifact):** Die Seite darf nur Skripte von fünf CDNs und Schriften von Google Fonts laden; „fetch/XHR/WebSocket“ zu allen anderen Hosts werden ohne sichtbaren Fehler geblockt (Seitenvertrag des Artifact-Werkzeugs, in dieser Sitzung gelesen; keine öffentliche URL, L1). → Online ist dort **aus**.
- **Claude-`db`/`user` als Ersatz?** Nein für O3: Die Pfadregeln kennen nur Stufen (`view`/`interact`/`admin`/`owner`) und den eigenen Teilbaum `{self}`; eine Ablage, die nur zwei bestimmte Personen sehen, lässt sich damit nicht ausdrücken, und Schreiben braucht eine „Can edit“-Einladung (Nachtrag N0.3, VC1). VO ersetzt deshalb VC1 für die Freunde.
- **githack-Seite:** `raw.githack.com` liefert Dateien aus GitHub mit richtigem Content-Type; Entwicklungs-Adressen sind nur kurz gecacht, Änderungen sind nach wenigen Minuten sichtbar; `rawcdn.githack.com` cacht dauerhaft (SE, W1). CORS der githack-Antworten spielt keine Rolle (alle Abrufe gehen zu `*.supabase.co`; nicht geprüft). Die githack-Seite bleibt für den Synth **ohne** Online-Funktion.
- **Sicherheit der Herkunft (Bedingung für VO1-R7, Review r7):** Alle Seiten auf `raw.githack.com` teilen sich **eine** Herkunft und damit `localStorage`/IndexedDB (Same-Origin-Regel, eK, W6). Jedes beliebige öffentliche Repo, über githack geöffnet, könnte Zugangs- **und Refresh-Token** lesen, dazu alle lokalen Songs. Ein Link per WhatsApp („hör mal, mein Synth“) reicht für eine dauerhafte Übernahme des Kontos, ohne dass eine RLS-Regel bricht. **Deshalb geht Online nur unter einer eigenen Herkunft live:** GitHub Pages (W9). Vorschlag: eigenes Repo `xanderfoxy/synquenzer` mit Pages → `https://xanderfoxy.github.io/synquenzer/`. Die Herkunft `xanderfoxy.github.io` teilen dann nur Xanders eigene Pages-Seiten (Klassenzimmer). Vorher prüfen, dass dessen `sw.js` nur den Pfad `/deutsch-mit-xander/` abdeckt. Alternative: eine kostenlose eigene Domain für Pages. Auf githack lädt SYNC supabase-js nie (Prüfung von `location.origin` gegen `CLOUD.origin`).
- **Ohne Netz neu laden:** Ohne Service Worker zeigt Safari beim Neuladen ohne Netz „Seite kann nicht geöffnet werden“, auch als Home-Bildschirm-App. Die Daten in IndexedDB wären zwar da, aber für den Nutzer wäre „alles weg“. Deshalb kommt ein kleiner `sw.js` dazu (Gültigkeitsbereich nur der App-Pfad): network-first für `index.html` mit Rückfall auf den Cache, cache-first für `vendor/supabase-js-2.117.2.umd.js` (Name mit Version) (MDN, W8).
- **Safari-Speicher am iPhone:** Skript-Speicher (localStorage, IndexedDB) einer Seite kann nach 7 Tagen Safari-Nutzung ohne Besuch gelöscht werden; Home-Bildschirm-Apps zählen eigene Tage (SE, W4). Genau dafür ist die Server-Kopie da: Nach dem Löschen meldet man sich neu an und alles kommt vom Server (§4.4). Home-Bildschirm-App und Safari-Tab haben getrennte Speicher, also je eine Anmeldung und je eine eigene Geräte-Kennung `cloud:device` (eK; §4.8).
- **Browser-Funktionen** (MDN-Kompatibilitätsdaten 8.1.5, lokal, W5): `crypto.randomUUID` ab iOS 15.4, Web Locks und `BroadcastChannel` ab 15.4, `CompressionStream` ab 16.4, `fetch(keepalive)` ab 13, `navigator.storage.persist` ab 15.2. Für `keepalive` gilt eine Grenze von **64 KiB** für alle laufenden Keepalive-Anfragen zusammen (Fetch-Standard, SE, W3).

---

## 3. Datenmodell und SQL

### 3.1 Überblick

```
auth.users ──1:1── profiles (Name, Freundes-Code, findbar)
     │
     ├── collab_requests (von → an, pending | accepted | declined | cancelled)
     │        └─ Annehmen ──► spaces (ein Raum je Paar, pair_key eindeutig, active | ended)
     │                           └── space_members (genau 2 Zeilen)
     ├── projects (Kopf: owner, space_id|null=„Nur ich“, origin_space_id, title, version, format, app_code, deleted_at)
     │        ├── project_data (1:1, json-Inhalt = Projektdatei-Hülle, md5)
     │        └── project_versions (auto | handover | conflict | manual | import; client_id = Gerät)
     ├── user_libraries (eigene Sounds, eine Datei je Person, Schreiben nur über save_library)
     └── space_sounds (VO3: Sounds im Raum)
private.admins (Verwalter = Xander) · private.blocked_users (Sperrliste) · private.trusted_users (volle Quote ohne Raum) · private.signup_denylist (Sperr-Domains)
private.search_log / private.save_log (Tempo für find_user und save_project)
private.settings (max_app, max_format, quota_bytes, probation_bytes, total_bytes, db_soft_limit, signup_open, signup_need_ref, max_accounts, max_signups_day)
```

### 3.2 Entscheidungen

| # | Entscheidung | Grund |
|---|---|---|
| VO-E1 | **Inhalt als `json`, nicht `jsonb`** (Abweichung vom Auftrag) | `jsonb` sortiert Schlüssel um. Lokal geprüft: Der Text ist danach anders und die Prüfsumme `sum` der Projektdatei ungültig; `parseFile` würde „Prüfsumme passt nicht“ melden. `json` hält den Text bytegenau. Abfragen im Inhalt braucht der Server nicht. |
| VO-E2 | **Lesen per RLS, Schreiben nur über Funktionen** (Ausnahmen: eigenes Profil, Sounds im Raum mit Trigger-Grenze; die eigene Bibliothek seit Review r7 nur über `save_library` mit Sperre) | Regeln wie „Versionsnummer passt“, „Konflikt aufheben“, „Raum für beide anlegen“ brauchen mehrere Tabellen in einem Schritt. Direkte INSERT/UPDATE/DELETE-Rechte hat `authenticated` deshalb nicht. |
| VO-E3 | RLS-Hilfen in **`private`** (nicht über die API erreichbar), `SECURITY DEFINER`, `search_path = ''`, als Mengen-Funktion (`id in (select private.my_space_ids())`) | Kein Rekursionsfehler (sie lesen `space_members` als Eigentümer ohne RLS), Auswertung einmal je Abfrage. So empfiehlt es die Doku (S18). |
| VO-E4 | Öffentliche RPCs sind `SECURITY DEFINER` mit eigener Prüfung; Advisor-Lint 0029 meldet sie als WARN, das ist **gewollt** (Option 3 der Doku) | S20. `anon` hat in `public` auf keine Tabelle und keine Funktion Rechte, außer `ping()` (lokal geprüft). |
| VO-E5 | Alle Rechte werden **ausdrücklich** entzogen und gezielt vergeben | Ältere Projekte geben neuen Tabellen in `public` automatisch Rechte für `anon`/`authenticated`; Supabase stellt das gerade um. Die Migration wirkt in beiden Fällen (S19; der Test-Nachbau simuliert den alten Fall). |
| VO-E6 | **Ein Raum je Paar** (`pair_key` = beide IDs sortiert), Ende = `ended` (beide lesen weiter, keiner schreibt), neue Anfrage + Annahme = derselbe Raum wieder aktiv | O3 und „nie verloren“: Nach dem Ende hat jeder noch Zugriff auf die gemeinsamen Songs und kann „Kopie in Nur ich“ anlegen. |
| VO-E7 | **Teilen nur „Nur ich → Raum“**, nie von Raum zu Raum, kein Zurückholen. Eine „Kopie in Nur ich“ (und „Beide behalten“) merkt sich den Herkunfts-Raum (`origin_space_id`) und darf nur dorthin geteilt werden (`share_project` → `mixed_origin`) | Sonst könnte ein Song mit Renés Beiträgen bei David landen, auch über den Umweg Kopie → Teilen (Review r7, lokal geprüft). |
| VO-E8 | **Versions-Wächter VO-R1:** Ein Speichern mit kleinerer App-Version (`app_code`) oder kleinerem Format als dem gespeicherten überschreibt nie, sondern wird als Konflikt-Fassung aufgehoben (`outdated`). Nach oben begrenzt `private.settings` (`max_app`, `max_format`): erfundene Nummern → `bad_version` | Zwei Freunde haben oft verschieden alte Seiten im Cache. Eine alte App würde neue Felder beim Normalisieren verwerfen (E3-02). Ohne Obergrenze könnte ein Partner (oder ein Test-Build) mit `p_app = 2147483647` ein gemeinsames Projekt für immer sperren (Review r7, A3). |
| VO-E9 | Papierkorb weich (`deleted_at`); endgültig nur eigene private Projekte; Konto-Löschung blockiert, solange Projekte existieren (`on delete restrict`) | „nie verloren“; ein gelöschtes Konto darf keine geteilten Songs mitnehmen. |
| VO-E10 | Server-ID = `uuid` aus `crypto.randomUUID()` auf dem Gerät; die lokale `S.id` bleibt | Wiederholungen nach verlorener Antwort treffen dieselbe Zeile; gleicher Inhalt → `same` statt Konflikt (md5-Vergleich). |
| VO-E11 | **Konflikt-Fassung je (Person, Gerät, Stand, Grund)**: Geräte-Kennung `p_client` (KV `cloud:device`, einmal `crypto.randomUUID()` je Speicher), eindeutiger Schlüssel `(project_id, created_by, client_id, version, label)` | Sonst überschreibt die Home-Bildschirm-App die Konflikt-Fassung des Safari-Tabs, und „Gleichzeitig“ ersetzt „Ältere App“ (Review r7, A1/A2). Nur neue Zeilen zählen gegen die Quote. |
| VO-E12 | **Quote und Tempo je Person** (`private.check_quota`, §2.1) | Ohne Grenze schreibt ein Fehler oder ein Nutzer die 500 MB voll, und die Datenbank wird für alle nur lesbar (S6). |
| VO-E13 | **Offene Registrierung statt Einladung** (Nachtrag 17.10., ersetzt „Einladen nur durch Verwalter“): Einlass-Liste, `invite_email` und die Einladungs-Anfrage im Trigger entfallen. Ein neues Konto bekommt nur ein Profil (Name aus der Registrierung, sonst „Musiker“, **nie** ein Teil der E-Mail) | Xander: „selber einloggen oder registrieren … so wie bei Deutsch mit Xander“; er kennt die Adressen nicht. Anfrage → Annehmen bleibt die einzige Tür (O3). |
| VO-E14 | **Gesamt-Grenze** `total_bytes` (380 MB): `quota_left` = Minimum aus eigenem Rest und Server-Rest; `check_quota` meldet `server_full` | Mit offener Registrierung begrenzt „Konten × Quote“ nichts mehr; die 500 MB (nur lesen bei Überschreitung, S6) bleiben sicher. |
| VO-E15 | **Suche nie per E-Mail**; Code immer, Name nur bei `findable` (Vorgabe jetzt **aus**), gesperrte Konten nie; höchstens 30 Suchen je Stunde | Die Suche ist kein Konto-Orakel (`signUp` selbst verrät vorhandene Adressen, nur das CAPTCHA bremst das, §2.4b); „niemand ist öffentlich gelistet“. Der Mitmach-Link trägt den Code, also braucht niemand die Namenssuche. |
| VO-E16 | **Verwalter-Werkzeuge:** `admin_accounts` (ohne E-Mails, mit „vertraut“ und Quote), `admin_block` (Sperrliste: zieht offene Anfragen zurück, beendet die Räume, nimmt Lese- und Realtime-Rechte; `p_purge` löscht private Projekte, Bibliothek, Raum-Sounds und eigene Konflikt-Fassungen), `admin_trust` (volle Quote ohne Raum), `admin_cleanup` (Probelauf zuerst), Anmelde-Bremse über `private.settings` | Missbrauchsschutz im Free-Plan ohne Dashboard-Klicks für Xander (§2.4b). |
| VO-E17 | **Probe-Quote** 5 MB für Konten ohne Raum mit Verwalter/vertrautem Konto; `db_soft_limit` auf `pg_database_size`; Speicher-Tempo 30 je Projekt und Minute | Fremde Konten füllen die 380 MB nicht mehr; René kann schon in VO1 voll sichern, sobald Xander [Vertrauen] tippt oder ein Raum besteht. Zwei fremde Konten im selben Raum bleiben in der Probe. |
| VO-E18 | **Namensschutz** per Trigger auf `profiles` (auch PATCH): Format-/Steuerzeichen weg, sichtbares Zeichen Pflicht, Verwalter-Name reserviert; `profiles.is_admin` nur aus `private.admins` (Trigger) | Niemand schickt René eine Anfrage „als Xander“; Homoglyphen fängt das ✓ auf der Karte. |

### 3.3 Vollständiges SQL (Migration `vo_init`, Teile A und B; Teil 8 erst mit Audio)

```sql
-- =====================================================================================
-- SYNQUENZER · Paket VO „Online-Zusammenarbeit“ · Migration vo_init (Teil A + B)
-- Ziel: eigenes, kostenloses Supabase-Projekt „synquenzer“ (NIE das Klassenzimmer-Projekt).
-- Stand 17.10.2026 (nach Review r7: Geräte-Kennung, Quote, Verwalter, Bibliothek mit Sperre,
-- Versions-Grenzen, Herkunfts-Raum, Publikation ohne DELETE; Nachtrag „offene Registrierung“ 17.10.:
-- keine Einlass-Liste mehr, jeder legt selbst ein Konto an; dafür Anmelde-Bremse (Pflicht-Hook, R3),
-- Gesamt-Grenze für Bytes, Sperrliste, Aufräumen ungenutzter Konten, Suche nie per E-Mail;
-- Review 2 (17.10.): Sperre nimmt auch Leserechte, Probe-Quote für fremde Konten, Löschen mit p_purge,
-- Namensschutz für den Verwalter, Such- und Speicher-Tempo, Datenbank-Größe, zweimal Nein = Ruhe). Lokal geprüft mit PGlite 0.5.8
-- (= Postgres 18.3) + Supabase-Shim (v3-ideen/r7/online-test/rls-matrix.mjs).
-- Nichts davon lief gegen ein echtes Supabase-Projekt.
-- Nur Funktionen aus Postgres 15+ (Supabase-Projekte laufen mit 15 oder 17).
--
-- Grundsätze
--  * Lesen: über RLS-Policies (Rolle authenticated). anon bekommt NICHTS außer public.ping().
--  * Schreiben: nur über geprüfte RPC-Funktionen (SECURITY DEFINER, search_path = ''),
--    Ausnahmen per RLS: eigenes Profil (Name, findbar), eigene Sound-Bibliothek, Sounds im Raum (VO3).
--  * RLS-Hilfsfunktionen liegen im NICHT freigegebenen Schema private (keine Rekursion,
--    weil sie als Eigentümer laufen und space_members/projects ohne RLS lesen).
--  * Projektinhalt als json (nicht jsonb): Text bleibt bytegenau -> Prüfsumme „sum“ der
--    Projektdatei und deep-equal-Tests bleiben gültig (jsonb sortiert Schlüssel um).
-- =====================================================================================

-- ---------- 0. Vorgaben: keine automatischen Rechte für neue Objekte in public ----------
alter default privileges for role postgres in schema public revoke select, insert, update, delete on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke usage, select on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke execute on functions from public;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, supabase_auth_admin;   -- Policies rufen private.* als Aufrufer auf

-- ---------- 1. Hilfsfunktionen ohne Tabellenbezug ----------
create or replace function private.new_friend_code()
returns text language plpgsql volatile set search_path = '' as $$
declare a constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; c text := ''; i int;
begin
  for i in 1..6 loop c := c || substr(a, 1 + floor(random() * 32)::int, 1); end loop;
  return c;
end $$;

create or replace function private.pair_key(a uuid, b uuid)
returns text language sql immutable set search_path = '' as $$
  select least(a, b)::text || ':' || greatest(a, b)::text
$$;

-- ---------- 2. Tabellen ----------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 24),
  friend_code  text not null unique default private.new_friend_code(),
  findable     boolean not null default false,       -- Datenschutz: per Name findbar nur, wenn selbst eingeschaltet
  is_admin     boolean not null default false,       -- „✓ Verwalter“ auf Such-Treffer und Anfrage-Karte; nur per Trigger aus private.admins (kein Schreibrecht)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.spaces (                       -- ein Raum je angenommenem Paar
  id         uuid primary key default gen_random_uuid(),
  kind       text not null default 'pair' check (kind = 'pair'),
  pair_key   text not null unique,                 -- '<kleinere uuid>:<größere uuid>'
  status     text not null default 'active' check (status in ('active', 'ended')),
  created_at timestamptz not null default now(),
  ended_at   timestamptz,
  ended_by   uuid references auth.users(id) on delete set null
);

create table public.space_members (
  space_id  uuid not null references public.spaces(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (space_id, user_id)
);
create index space_members_user_idx on public.space_members (user_id);

create table public.collab_requests (
  id           uuid primary key default gen_random_uuid(),
  from_user    uuid not null references auth.users(id) on delete cascade,
  to_user      uuid not null references auth.users(id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  note         text check (char_length(note) <= 140),
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  check (from_user <> to_user)
);
create unique index collab_requests_one_pending on public.collab_requests (least(from_user, to_user), greatest(from_user, to_user)) where status = 'pending';
create index collab_requests_to_idx   on public.collab_requests (to_user, status);
create index collab_requests_from_idx on public.collab_requests (from_user, status);

create table public.projects (                     -- Kopf (klein, in der Realtime-Publikation)
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete restrict,   -- Konto löschen erst nach Übergabe
  space_id   uuid references public.spaces(id) on delete restrict,         -- null = „Nur ich“
  origin_space_id uuid references public.spaces(id) on delete restrict,    -- Kopie aus einem Raum: darf nur dorthin geteilt werden (VO-E7)
  local_id   text check (char_length(local_id) <= 64),                     -- S.id des Erstellers (nur Info)
  title      text not null default 'Projekt' check (char_length(title) between 1 and 60),
  version    integer not null default 1 check (version >= 1),
  format     integer not null default 3 check (format between 1 and 99),
  app_code   integer not null default 0 check (app_code between 0 and 99999999),  -- höchste App-Version: Major*1e6+Minor*1e3+Patch
  size_bytes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,                          -- Papierkorb (weich)
  deleted_by uuid references auth.users(id) on delete set null
);
create index projects_owner_idx on public.projects (owner_id, updated_at desc);
create index projects_space_idx on public.projects (space_id, updated_at desc);

create table public.project_data (                 -- Inhalt (groß, NICHT in der Realtime-Publikation)
  project_id uuid primary key references public.projects(id) on delete cascade,
  version    integer not null,
  body       json not null check (octet_length(body::text) <= 2000000),
  body_md5   text not null
);

create table public.project_versions (             -- Verlauf: nichts geht verloren
  id         bigint generated always as identity primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  version    integer not null,                     -- Server-Stand, auf dem diese Fassung beruht
  kind       text not null check (kind in ('auto', 'handover', 'conflict', 'manual', 'import')),
  label      text check (char_length(label) <= 80),
  body       json not null check (octet_length(body::text) <= 2000000),
  size_bytes integer not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  client_id  text not null default '' check (char_length(client_id) <= 64)   -- Gerät/Speicher (KV cloud:device), nur für Konflikt-Fassungen
);
create index project_versions_proj_idx on public.project_versions (project_id, created_at desc);
create index project_versions_by_idx   on public.project_versions (created_by);
-- je Person, Gerät, Stand und Grund (label) genau eine Konflikt-Fassung mit dem neuesten Inhalt:
-- zwei eigene Geräte oder „Ältere App“ und „Gleichzeitig“ überschreiben sich nicht gegenseitig
create unique index project_versions_one_conflict on public.project_versions (project_id, created_by, client_id, version, label) where kind = 'conflict';

create table public.user_libraries (               -- eigene Sounds (eine Datei je Person)
  owner_id   uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  version    integer not null default 1,
  body       json not null check (octet_length(body::text) <= 2000000),
  size_bytes integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.space_sounds (                 -- VO3 (optional): Sounds in einem Raum teilen
  id         uuid primary key default gen_random_uuid(),
  space_id   uuid not null references public.spaces(id) on delete cascade,
  owner_id   uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name       text not null check (char_length(name) between 1 and 40),
  engine     text not null check (engine in ('analog', 'fm6', 'wt', 'drum', 'mask', 'add', 'body')),
  role       text check (char_length(role) <= 16),
  body       json not null check (octet_length(body::text) <= 65536),
  created_at timestamptz not null default now()
);
create index space_sounds_space_idx on public.space_sounds (space_id, created_at desc);

create table private.admins (                      -- Verwalter (Xander); Eintrag per execute_sql im Rollout R4
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table private.blocked_users (               -- Sperrliste (Verwalter, admin_block): gesperrte Konten schreiben nichts mehr
  user_id    uuid primary key references auth.users(id) on delete cascade,
  reason     text check (char_length(reason) <= 140),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table private.trusted_users (               -- vom Verwalter als vertraut markiert (volle Quote schon ohne Raum, z. B. René in VO1)
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table private.search_log (                  -- Tempo für find_user (Codes nicht erraten)
  user_id uuid not null,
  at      timestamptz not null default now()
);
create index search_log_idx on private.search_log (user_id, at);

create table private.save_log (                    -- Tempo für save_project (Updates je Projekt und Minute)
  project_id uuid not null,
  at         timestamptz not null default now()
);
create index save_log_idx on private.save_log (project_id, at);

create table private.signup_denylist (             -- für die Anmelde-Bremse: ganze E-Mail oder Domain, klein geschrieben (ohne Mail-Bestätigung fast wirkungslos)
  pattern    text primary key check (pattern = lower(pattern) and char_length(pattern) between 3 and 254),
  created_at timestamptz not null default now()
);

create table private.settings (                    -- genau eine Zeile; Werte per Migration ändern
  id              boolean primary key default true check (id),
  max_app         integer not null,                -- höchste ausgelieferte App-Version (vor JEDEM Ausliefern erhöhen, Rollout R7)
  max_format      integer not null,                -- höchstes Projektformat
  quota_bytes     bigint  not null,                -- Mengengrenze je vertrauter Person (Rohtext-Bytes)
  probation_bytes bigint  not null default 5 * 1024 * 1024,   -- Probe-Quote: Konten ohne Raum mit Verwalter/vertrautem Konto und ohne Markierung
  db_soft_limit   bigint  not null default 440 * 1024 * 1024, -- pg_database_size darüber -> server_full (500 MB = nur lesen, S6)
  signup_need_ref boolean not null default false,  -- Anmelde-Bremse: Registrierung nur mit gültigem Freundes-Code (user_metadata.ref)
  total_bytes     bigint  not null,                -- Grenze für ALLE zusammen (offene Registrierung: Personen × Quote ist nicht mehr begrenzt)
  signup_open     boolean not null default true,   -- Anmelde-Bremse (Hook): false = keine neuen Konten
  max_accounts    integer not null default 12,     -- Anmelde-Bremse: höchstens so viele nicht gesperrte Konten insgesamt
  max_signups_day integer not null default 5       -- Anmelde-Bremse: höchstens so viele neue, nicht gesperrte Konten je 24 h
);
insert into private.settings (max_app, max_format, quota_bytes, total_bytes)
  values (3001000, 3, 60 * 1024 * 1024, 380 * 1024 * 1024);

-- ---------- 3. RLS-Hilfen (private, SECURITY DEFINER, search_path leer) ----------
create or replace function private.my_space_ids()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select m.space_id from public.space_members m where m.user_id = (select auth.uid())
    and not exists (select 1 from private.blocked_users b where b.user_id = (select auth.uid()))   -- gesperrt: sieht nichts mehr
$$;

create or replace function private.my_active_space_ids()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select m.space_id from public.space_members m join public.spaces s on s.id = m.space_id
  where m.user_id = (select auth.uid()) and s.status = 'active'
    and not exists (select 1 from private.blocked_users b where b.user_id = (select auth.uid()))
$$;

create or replace function private.my_project_ids()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select p.id from public.projects p
  where (p.owner_id = (select auth.uid())
     or p.space_id in (select m.space_id from public.space_members m where m.user_id = (select auth.uid())))
    and not exists (select 1 from private.blocked_users b where b.user_id = (select auth.uid()))
$$;

create or replace function private.visible_user_ids()       -- ich, meine Raum-Partner, offene Anfragen mit mir
returns setof uuid language sql stable security definer set search_path = '' as $$
  select (select auth.uid())
  union select b.user_id from public.space_members a join public.space_members b on b.space_id = a.space_id
        where a.user_id = (select auth.uid())
          and not exists (select 1 from private.blocked_users x where x.user_id = (select auth.uid()))
  union select case when r.from_user = (select auth.uid()) then r.to_user else r.from_user end
        from public.collab_requests r
        where r.status = 'pending' and (select auth.uid()) in (r.from_user, r.to_user)
          and not exists (select 1 from private.blocked_users x where x.user_id = (select auth.uid()))
$$;

create or replace function private.topic_space_ok(p_topic text)  -- Realtime-Thema 'space:<uuid>' eines aktiven eigenen Raums
returns boolean language plpgsql stable security definer set search_path = '' as $$
begin
  if p_topic is null or p_topic !~ '^space:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return false; end if;
  return substr(p_topic, 7)::uuid in (select private.my_active_space_ids());
end $$;

create or replace function private.path_space_ok(p_name text, p_active boolean)  -- Storage-Pfad '<space uuid>/...'
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare f text := split_part(coalesce(p_name, ''), '/', 1);
begin
  if f !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return false; end if;
  if p_active then return f::uuid in (select private.my_active_space_ids()); end if;
  return f::uuid in (select private.my_space_ids());
end $$;

create or replace function private.can_write(p_owner uuid, p_space uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((p_space is null and p_owner = (select auth.uid()))
      or (p_space is not null and p_space in (select private.my_active_space_ids())), false)
$$;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from private.admins a where a.user_id = (select auth.uid()))
$$;

create or replace function private.server_left()            -- freie Bytes für alle zusammen (Gesamt-Grenze total_bytes)
returns bigint language sql stable security definer set search_path = '' as $$
  select (select s.total_bytes from private.settings s)
       - (select coalesce(sum(p.size_bytes), 0) from public.projects p)
       - (select coalesce(sum(v.size_bytes), 0) from public.project_versions v)
       - (select coalesce(sum(l.size_bytes), 0) from public.user_libraries l)
       - (select coalesce(sum(octet_length(x.body::text)), 0) from public.space_sounds x)
$$;

create or replace function private.used_bytes(p_uid uuid)    -- belegte Bytes der Person
returns bigint language sql stable security definer set search_path = '' as $$
  select (select coalesce(sum(p.size_bytes), 0) from public.projects p where p.owner_id = p_uid)
       + (select coalesce(sum(v.size_bytes), 0) from public.project_versions v where v.created_by = p_uid)
       + (select coalesce(sum(l.size_bytes), 0) from public.user_libraries l where l.owner_id = p_uid)
       + (select coalesce(sum(octet_length(x.body::text)), 0) from public.space_sounds x where x.owner_id = p_uid)
$$;

create or replace function private.is_trusted(p_uid uuid)   -- volle Quote: Verwalter, markiert oder in einem aktiven Raum mit einem der beiden
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from private.admins a where a.user_id = p_uid)
      or exists (select 1 from private.trusted_users t where t.user_id = p_uid)
      or exists (select 1 from public.space_members m join public.spaces s on s.id = m.space_id and s.status = 'active'
                   join public.space_members o on o.space_id = m.space_id and o.user_id <> m.user_id
                 where m.user_id = p_uid
                   and (exists (select 1 from private.admins a where a.user_id = o.user_id)
                        or exists (select 1 from private.trusted_users t where t.user_id = o.user_id)))
$$;

create or replace function private.quota_of(p_uid uuid)     -- Quote der Person: voll oder Probe (zwei fremde Konten im selben Raum bleiben Probe)
returns bigint language sql stable security definer set search_path = '' as $$
  select case when private.is_trusted(p_uid) then s.quota_bytes else least(s.probation_bytes, s.quota_bytes) end
  from private.settings s
$$;

create or replace function private.quota_left(p_uid uuid)   -- freie Bytes der Person (kann negativ sein), höchstens server_left()
returns bigint language sql stable security definer set search_path = '' as $$
  select least(private.quota_of(p_uid) - private.used_bytes(p_uid), private.server_left())
$$;

create or replace function private.check_quota(p_uid uuid, p_add bigint)
returns void language plpgsql stable security definer set search_path = '' as $$
begin
  if p_add > 0 and pg_database_size(current_database()) > (select s.db_soft_limit from private.settings s) then
    raise exception 'server_full' using errcode = '54000';           -- echte Größe inkl. auth, Indizes, toter Zeilen (Review 2)
  end if;
  if p_add > 0 and private.quota_left(p_uid) < p_add then
    if private.server_left() < p_add then
      raise exception 'server_full' using errcode = '54000';         -- Gesamt-Grenze: schützt die 500 MB für alle
    end if;
    raise exception 'quota' using errcode = '54000';
  end if;
end $$;

-- Konflikt-Fassung aufheben: je (Person, Gerät, Stand, Grund) eine Zeile, immer der neueste Inhalt.
-- Nur eine NEUE Zeile zählt gegen die Quote (Schutz gegen erfundene Geräte-Kennungen).
create or replace function private.keep_conflict(p_project uuid, p_version integer, p_label text, p_client text,
  p_body json, p_size integer, p_uid uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.project_versions v where v.project_id = p_project and v.created_by = p_uid
                   and v.client_id = p_client and v.version = p_version and v.label = p_label and v.kind = 'conflict') then
    perform private.check_quota(p_uid, p_size);
  end if;
  insert into public.project_versions (project_id, version, kind, label, body, size_bytes, created_by, client_id)
    values (p_project, p_version, 'conflict', p_label, p_body, p_size, p_uid, p_client)
    on conflict (project_id, created_by, client_id, version, label) where kind = 'conflict'
    do update set body = excluded.body, size_bytes = excluded.size_bytes, created_at = now();
end $$;

create or replace function private.is_blocked()             -- für Policies: bin ich gesperrt?
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from private.blocked_users b where b.user_id = (select auth.uid()))
$$;

create or replace function private.need_uid()               -- angemeldet und nicht gesperrt (jede schreibende RPC)
returns uuid language plpgsql stable security definer set search_path = '' as $$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if exists (select 1 from private.blocked_users b where b.user_id = u) then
    raise exception 'blocked' using errcode = '42501';
  end if;
  return u;
end $$;

create or replace function private.thin_versions(p_project uuid)   -- 'auto' älter als 30 Tage: nur der letzte Stand je Tag bleibt
returns void language sql security definer set search_path = '' as $$
  delete from public.project_versions v
  where v.project_id = p_project and v.kind = 'auto' and v.created_at < now() - interval '30 days'
    and v.id not in (
      select distinct on (date_trunc('day', x.created_at)) x.id from public.project_versions x
      where x.project_id = p_project and x.kind = 'auto' and x.created_at < now() - interval '30 days'
      order by date_trunc('day', x.created_at), x.created_at desc)
$$;

revoke all on all functions in schema private from public, anon;
revoke all on private.admins, private.settings, private.blocked_users, private.signup_denylist, private.trusted_users,
  private.search_log, private.save_log from public, anon, authenticated;
grant execute on function private.my_space_ids(), private.my_active_space_ids(), private.my_project_ids(),
  private.visible_user_ids(), private.topic_space_ok(text), private.path_space_ok(text, boolean),
  private.is_blocked() to authenticated;

-- ---------- 4. Neue Konten: Profil anlegen (Trigger) und Anmelde-Bremse (Pflicht-Hook, R3) ----------
-- Offene Registrierung (Xander, 17.10.): jeder legt selbst ein Konto an (E-Mail + Passwort + Name), wie im
-- Klassenzimmer. Ein neues Konto sieht nichts außer dem eigenen Profil; Zusammenarbeit nur über Anfrage → Annehmen (O3).
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare n text := btrim(coalesce(new.raw_user_meta_data ->> 'display_name', ''));
begin
  if n = '' then n := 'Musiker'; end if;                 -- nie aus der E-Mail ableiten (Partner sähen sonst einen Teil davon)
  insert into public.profiles (id, display_name) values (new.id, left(n, 24)) on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();
revoke all on function private.handle_new_user() from public, anon, authenticated;

-- Namensschutz (Review 2): gilt für jeden Weg, auch direktes PATCH auf profiles. Entfernt Steuer- und
-- Formatzeichen (unsichtbare Namen), verlangt ein sichtbares Zeichen und reserviert die Namen der Verwalter.
-- Beim Anlegen (Trigger aus auth.users) nie ein Fehler: dann heißt das Konto „Musiker“.
create or replace function private.profiles_name_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
declare n text := coalesce(new.display_name, '');
begin
  n := regexp_replace(n, '[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]', ' ', 'g');                 -- Sonder-Leerzeichen
  n := regexp_replace(n, '[\u0001-\u001F\u007F-\u009F\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u206A-\u206F\u2800\u3164\uFE00-\uFE0F\uFEFF\uFFA0]', '', 'g');
  n := left(btrim(regexp_replace(n, ' {2,}', ' ', 'g')), 24);
  if n !~ '[^[:space:][:punct:]]'
     or exists (select 1 from private.admins a join public.profiles p on p.id = a.user_id
                where a.user_id <> new.id and lower(p.display_name) = lower(n)) then
    if tg_op = 'INSERT' then n := 'Musiker';
    else raise exception 'bad_name' using errcode = '22023';
    end if;
  end if;
  new.display_name := n;
  if tg_op = 'INSERT' then new.is_admin := false; end if;              -- nur der Trigger auf private.admins setzt es
  return new;
end $$;
create trigger profiles_name_guard before insert or update of display_name on public.profiles
  for each row execute function private.profiles_name_guard();

create or replace function private.admins_sync()                       -- profiles.is_admin folgt private.admins
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set is_admin = (tg_op = 'INSERT') where id = coalesce(new.user_id, old.user_id);
  return null;
end $$;
create trigger admins_sync after insert or delete on private.admins for each row execute function private.admins_sync();
revoke all on function private.profiles_name_guard(), private.admins_sync() from public, anon, authenticated;

-- Anmelde-Bremse = Before-User-Created-Hook (PFLICHT, Rollout R3; Dashboard: Authentication → Hooks →
-- „Before User Created“ → Postgres → public.hook_before_user_created). Supabase hat für Passwort-Registrierung
-- ohne Mail keine IP-Grenze (Doku „Rate limits“): der Hook ist die einzige Konten-Obergrenze. Gesperrte Konten
-- zählen nicht mit, sonst legt ein Skript die Registrierung dauerhaft lahm. Kein Einlass per E-Mail-Liste.
create or replace function private.ref_ok(p_ref text)              -- Freundes-Code eines nicht gesperrten Kontos?
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.friend_code = upper(ltrim(btrim(coalesce(p_ref, '')), '#'))
                 and not exists (select 1 from private.blocked_users b where b.user_id = p.id))
$$;

create or replace function public.hook_before_user_created(event jsonb)
returns jsonb language plpgsql stable set search_path = '' as $$
declare
  s private.settings%rowtype;
  e text := lower(btrim(coalesce(event -> 'user' ->> 'email', '')));
begin
  select * into s from private.settings;
  if not s.signup_open then
    return jsonb_build_object('error', jsonb_build_object('http_code', 403,
      'message', 'Neue Konten sind gerade geschlossen. Sag Xander Bescheid.'));
  end if;
  if exists (select 1 from private.signup_denylist d where d.pattern = e or d.pattern = split_part(e, '@', 2)) then
    return jsonb_build_object('error', jsonb_build_object('http_code', 403,
      'message', 'Mit dieser E-Mail geht es leider nicht.'));
  end if;
  if s.signup_need_ref and not private.ref_ok(event -> 'user' -> 'user_metadata' ->> 'ref') then
    return jsonb_build_object('error', jsonb_build_object('http_code', 403,
      'message', 'Bitte über den Mitmach-Link registrieren.'));
  end if;
  if (select count(*) from auth.users u
      where not exists (select 1 from private.blocked_users b where b.user_id = u.id)) >= s.max_accounts then
    return jsonb_build_object('error', jsonb_build_object('http_code', 403,
      'message', 'Gerade sind keine neuen Konten möglich. Sag Xander Bescheid.'));
  end if;
  if (select count(*) from auth.users u where u.created_at > now() - interval '24 hours'
      and not exists (select 1 from private.blocked_users b where b.user_id = u.id)) >= s.max_signups_day then
    return jsonb_build_object('error', jsonb_build_object('http_code', 429,
      'message', 'Heute wurden schon viele Konten angelegt. Bitte morgen noch mal.'));
  end if;
  return '{}'::jsonb;
end $$;
revoke execute on function public.hook_before_user_created(jsonb) from public, anon, authenticated;
grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;
grant select on private.settings, private.signup_denylist, private.blocked_users to supabase_auth_admin;
revoke all on function private.ref_ok(text) from public, anon, authenticated;
grant execute on function private.ref_ok(text) to supabase_auth_admin;

-- ---------- 5. RLS ----------
alter table public.profiles         enable row level security;
alter table public.spaces           enable row level security;
alter table public.space_members    enable row level security;
alter table public.collab_requests  enable row level security;
alter table public.projects         enable row level security;
alter table public.project_data     enable row level security;
alter table public.project_versions enable row level security;
alter table public.user_libraries   enable row level security;
alter table public.space_sounds     enable row level security;

create policy profiles_read       on public.profiles for select to authenticated using (id in (select private.visible_user_ids()));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()) and not (select private.is_blocked()));
create policy spaces_read   on public.spaces          for select to authenticated using (id in (select private.my_space_ids()));
create policy members_read  on public.space_members   for select to authenticated using (space_id in (select private.my_space_ids()));
create policy requests_read on public.collab_requests for select to authenticated
  using ((select auth.uid()) in (from_user, to_user) and not (select private.is_blocked()));
create policy projects_read on public.projects for select to authenticated
  using ((owner_id = (select auth.uid()) or space_id in (select private.my_space_ids())) and not (select private.is_blocked()));
create policy pdata_read    on public.project_data     for select to authenticated using (project_id in (select private.my_project_ids()));
create policy pvers_read    on public.project_versions for select to authenticated using (project_id in (select private.my_project_ids()));
create policy lib_own on public.user_libraries for select to authenticated   -- schreiben nur über save_library
  using (owner_id = (select auth.uid()) and not (select private.is_blocked()));
create policy ssounds_read   on public.space_sounds for select to authenticated using (space_id in (select private.my_space_ids()));
create policy ssounds_insert on public.space_sounds for insert to authenticated
  with check (owner_id = (select auth.uid()) and space_id in (select private.my_active_space_ids()));
create policy ssounds_delete on public.space_sounds for delete to authenticated using (owner_id = (select auth.uid()));

-- Rechte: alles weg, dann gezielt (wirkt auch, falls das Projekt noch automatische Rechte vergibt)
revoke all on public.profiles, public.spaces, public.space_members, public.collab_requests, public.projects,
  public.project_data, public.project_versions, public.user_libraries, public.space_sounds from anon, authenticated, public;
grant select on public.profiles, public.spaces, public.space_members, public.collab_requests, public.projects,
  public.project_data, public.project_versions to authenticated;
grant update (display_name, findable, updated_at) on public.profiles to authenticated;
grant select on public.user_libraries to authenticated;
grant select, insert, delete on public.space_sounds to authenticated;

-- Listen-Ansichten (security_invoker: es gilt die RLS der Tabellen)
create view public.space_list with (security_invoker = true) as
  select s.id as space_id, s.status, s.created_at, s.ended_at, m.user_id as partner_id, p.display_name as partner_name
  from public.spaces s
  join public.space_members m on m.space_id = s.id and m.user_id <> (select auth.uid())
  left join public.profiles p on p.id = m.user_id;
create view public.project_list with (security_invoker = true) as
  select pr.id, pr.title, pr.space_id, pr.owner_id, po.display_name as owner_name, pr.version, pr.format,
         pr.size_bytes, pr.updated_at, pr.updated_by, pu.display_name as updated_by_name, pr.deleted_at
  from public.projects pr
  left join public.profiles po on po.id = pr.owner_id
  left join public.profiles pu on pu.id = pr.updated_by;
revoke all on public.space_list, public.project_list from anon, public;
grant select on public.space_list, public.project_list to authenticated;

-- ---------- 6. RPC (öffentlich, SECURITY DEFINER mit eigener Prüfung; Advisor-Lint 0029 = gewollt) ----------
create or replace function public.ping() returns text language sql stable set search_path = '' as $$ select 'ok'::text $$;

create or replace function public.set_profile(p_name text, p_findable boolean default null)
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); n text := left(btrim(coalesce(p_name, '')), 24);
begin
  if n = '' then raise exception 'name_required' using errcode = '22023'; end if;
  update public.profiles set display_name = n, findable = coalesce(p_findable, findable), updated_at = now()
    where id = uid;                                                   -- erst UPDATE: der Namensschutz meldet bad_name
  if not found then
    insert into public.profiles (id, display_name, findable) values (uid, n, coalesce(p_findable, false));
  end if;
  return (select json_build_object('display_name', p.display_name, 'friend_code', p.friend_code, 'findable', p.findable)
          from public.profiles p where p.id = uid);
end $$;

-- Suche: nur Freundes-Code (immer) oder genauer Name (nur wer „findbar“ eingeschaltet hat), höchstens 1 Treffer.
-- NIE per E-Mail (offene Registrierung: sonst könnte jeder prüfen, ob eine Adresse ein Konto hat). Gesperrte nie.
-- Tempo (Review 2): höchstens 30 Suchen je Konto und Stunde (sonst 54000 slow_down), damit niemand Codes durchprobiert.
create or replace function public.find_user(p_query text)
returns table (user_id uuid, display_name text, friend_code text, is_admin boolean)
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); q text := btrim(coalesce(p_query, ''));
begin
  delete from private.search_log l where l.at < now() - interval '1 hour';
  if (select count(*) from private.search_log l where l.user_id = uid) >= 30 then
    raise exception 'slow_down' using errcode = '54000';
  end if;
  insert into private.search_log (user_id) values (uid);
  if char_length(q) < 2 or char_length(q) > 120 or position('@' in q) > 0 then return; end if;
  if upper(ltrim(q, '#')) ~ '^[A-Z0-9]{6}$' and exists (select 1 from public.profiles x where x.friend_code = upper(ltrim(q, '#'))) then
    return query select p.id, p.display_name, p.friend_code, p.is_admin from public.profiles p
      where p.friend_code = upper(ltrim(q, '#')) and p.id <> uid
        and not exists (select 1 from private.blocked_users b where b.user_id = p.id) limit 1;
  else                                                         -- Name: nur bei genau einem Treffer
    if (select count(*) from public.profiles p where p.findable and lower(p.display_name) = lower(q) and p.id <> uid
          and not exists (select 1 from private.blocked_users b where b.user_id = p.id)) > 1 then
      return query select null::uuid, left(q, 24), null::text, false;   -- „mehrere – bitte Code oder Link“
      return;
    end if;
    return query select p.id, p.display_name, p.friend_code, p.is_admin from public.profiles p
      where p.findable and lower(p.display_name) = lower(q) and p.id <> uid
        and not exists (select 1 from private.blocked_users b where b.user_id = p.id) limit 1;
  end if;
end $$;

create or replace function public.respond_request(p_request uuid, p_accept boolean)
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); r public.collab_requests%rowtype; sid uuid;
begin
  select * into r from public.collab_requests where id = p_request for update;
  if not found or r.to_user <> uid then raise exception 'not_found' using errcode = 'P0002'; end if;
  if r.status <> 'pending' then return json_build_object('status', r.status); end if;
  if not coalesce(p_accept, false) then
    update public.collab_requests set status = 'declined', responded_at = now() where id = r.id;
    return json_build_object('status', 'declined');
  end if;
  insert into public.spaces (pair_key) values (private.pair_key(r.from_user, r.to_user))
    on conflict (pair_key) do update set status = 'active', ended_at = null, ended_by = null
    returning id into sid;
  insert into public.space_members (space_id, user_id) values (sid, r.from_user), (sid, r.to_user) on conflict do nothing;
  update public.collab_requests set status = 'accepted', responded_at = now() where id = r.id;
  return json_build_object('status', 'accepted', 'space_id', sid);
end $$;

create or replace function public.request_collab(p_target uuid, p_note text default null)
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); s public.spaces%rowtype; rid uuid;
begin
  if p_target is null or p_target = uid or not exists (select 1 from public.profiles where id = p_target)
     or exists (select 1 from private.blocked_users b where b.user_id = p_target) then
    raise exception 'unknown_user' using errcode = '22023';
  end if;
  select * into s from public.spaces where pair_key = private.pair_key(uid, p_target);
  if found and s.status = 'active' then return json_build_object('status', 'already', 'space_id', s.id); end if;
  select id into rid from public.collab_requests where from_user = p_target and to_user = uid and status = 'pending';
  if found then return public.respond_request(rid, true); end if;          -- beide wollen: sofort verbunden
  if exists (select 1 from public.collab_requests where from_user = uid and to_user = p_target and status = 'pending') then
    return json_build_object('status', 'pending');
  end if;
  if exists (select 1 from public.collab_requests where from_user = uid and to_user = p_target and status = 'declined'
             and responded_at > now() - interval '24 hours') then
    return json_build_object('status', 'declined_recently');
  end if;
  if (select count(*) from public.collab_requests where from_user = uid and to_user = p_target and status = 'declined') >= 2
     and not exists (select 1 from public.collab_requests x where x.from_user = p_target and x.to_user = uid
                     and x.created_at > (select max(d.responded_at) from public.collab_requests d
                                         where d.from_user = uid and d.to_user = p_target and d.status = 'declined')) then
    return json_build_object('status', 'declined_recently');         -- zweimal Nein: Ruhe, bis der Empfänger selbst anfragt (Review 2)
  end if;
  if (select count(*) from public.collab_requests where from_user = uid and to_user = p_target
      and created_at > now() - interval '24 hours') >= 3 then
    return json_build_object('status', 'slow_down');                 -- höchstens 3 Anfragen je Paar und 24 h
  end if;
  if (select count(*) from public.collab_requests where from_user = uid and status = 'pending') >= 20 then
    raise exception 'too_many_requests' using errcode = '54000';
  end if;
  insert into public.collab_requests (from_user, to_user, note)
    values (uid, p_target, nullif(left(btrim(coalesce(p_note, '')), 140), ''));
  return json_build_object('status', 'sent');
end $$;

create or replace function public.cancel_request(p_request uuid)
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid();
begin
  update public.collab_requests set status = 'cancelled', responded_at = now()
    where id = p_request and from_user = uid and status = 'pending';
  if not found then raise exception 'not_found' using errcode = 'P0002'; end if;
  return json_build_object('status', 'cancelled');
end $$;

create or replace function public.end_collab(p_space uuid)       -- Raum wird „beendet“: beide behalten Lesezugriff
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid();
begin
  if not exists (select 1 from public.space_members where space_id = p_space and user_id = uid) then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  update public.spaces set status = 'ended', ended_at = now(), ended_by = uid where id = p_space and status = 'active';
  return json_build_object('status', 'ended');
end $$;

-- ---------- Verwalter (Xander): Konten ansehen, sperren, ungenutzte aufräumen (offene Registrierung) ----------
create or replace function public.admin_accounts()           -- Liste ohne E-Mail-Adressen
returns json language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.need_uid();
  if not private.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return (select coalesce(json_agg(json_build_object(
      'id', p.id, 'name', p.display_name, 'code', p.friend_code, 'created_at', p.created_at,
      'projects', (select count(*) from public.projects x where x.owner_id = p.id),
      'spaces', (select count(*) from public.space_members m where m.user_id = p.id),
      'bytes', private.used_bytes(p.id),
      'blocked', exists (select 1 from private.blocked_users b where b.user_id = p.id),
      'trusted', private.is_trusted(p.id), 'quota', private.quota_of(p.id),
      'admin', exists (select 1 from private.admins a where a.user_id = p.id)) order by p.created_at), '[]'::json)
    from public.profiles p);
end $$;

-- p_purge (nur mit Sperren): löscht eigene private Projekte, Bibliothek, Raum-Sounds und eigene Konflikt-Fassungen
-- in fremden Projekten. Danach lässt sich das Konto im Dashboard löschen, sofern es keine Projekte in einem Raum besitzt.
create or replace function public.admin_block(p_user uuid, p_block boolean default true, p_reason text default null,
  p_purge boolean default false)
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); np integer := 0; nl integer := 0; ns integer := 0; nv integer := 0; nsp integer := 0; keep integer;
begin
  if not private.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_user is null or p_user = uid or exists (select 1 from private.admins a where a.user_id = p_user)
     or not exists (select 1 from public.profiles p where p.id = p_user) then
    raise exception 'bad_target' using errcode = '22023';
  end if;
  if not coalesce(p_block, true) then
    delete from private.blocked_users where user_id = p_user;
    return json_build_object('status', 'unblocked');                  -- Räume bleiben beendet; neu verbinden über Anfrage
  end if;
  insert into private.blocked_users (user_id, reason, created_by) values (p_user, left(p_reason, 140), uid)
    on conflict (user_id) do update set reason = excluded.reason;
  delete from private.trusted_users where user_id = p_user;
  update public.collab_requests set status = 'cancelled', responded_at = now()   -- offene Anfragen von und an das Konto weg
    where status = 'pending' and p_user in (from_user, to_user);
  update public.spaces set status = 'ended', ended_at = now(), ended_by = uid     -- Räume des Kontos enden (Partner liest weiter)
    where status = 'active' and id in (select m.space_id from public.space_members m where m.user_id = p_user);
  get diagnostics nsp = row_count;
  if coalesce(p_purge, false) then
    delete from public.projects where owner_id = p_user and space_id is null;      -- Inhalt und Versionen per cascade
    get diagnostics np = row_count;
    delete from public.user_libraries where owner_id = p_user; get diagnostics nl = row_count;
    delete from public.space_sounds where owner_id = p_user; get diagnostics ns = row_count;
    delete from public.project_versions where created_by = p_user and kind = 'conflict'; get diagnostics nv = row_count;
  end if;
  select count(*) into keep from public.projects where owner_id = p_user;
  return json_build_object('status', 'blocked', 'spaces_ended', nsp, 'purged',
    json_build_object('projects', np, 'library', nl, 'sounds', ns, 'conflicts', nv), 'projects_in_spaces', keep);
end $$;

create or replace function public.admin_trust(p_user uuid, p_trust boolean default true)   -- volle Quote ohne Raum (z. B. René in VO1)
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid();
begin
  if not private.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_user is null or not exists (select 1 from public.profiles p where p.id = p_user)
     or exists (select 1 from private.blocked_users b where b.user_id = p_user) then
    raise exception 'bad_target' using errcode = '22023';
  end if;
  if coalesce(p_trust, true) then
    insert into private.trusted_users (user_id, created_by) values (p_user, uid) on conflict (user_id) do nothing;
  else
    delete from private.trusted_users where user_id = p_user;
  end if;
  return json_build_object('status', case when coalesce(p_trust, true) then 'trusted' else 'probation' end,
    'quota', private.quota_of(p_user));
end $$;

-- Ungenutzte Konten löschen: älter als p_days (mind. 7), kein Verwalter, nicht gesperrt (sonst wäre die E-Mail
-- wieder frei), keine Projekte, keine Bibliothek, kein Raum, keine Raum-Sounds. p_dry = true zählt nur.
create or replace function public.admin_cleanup(p_days integer default 30, p_dry boolean default true)
returns json language plpgsql security definer set search_path = '' as $$
declare ids uuid[]; names json; d integer := greatest(coalesce(p_days, 30), 7);
begin
  perform private.need_uid();
  if not private.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  select coalesce(array_agg(u.id), '{}') into ids from auth.users u
  where u.created_at < now() - make_interval(days => d)
    and not exists (select 1 from private.admins a where a.user_id = u.id)
    and not exists (select 1 from private.blocked_users b where b.user_id = u.id)
    and not exists (select 1 from public.projects x where x.owner_id = u.id)
    and not exists (select 1 from public.user_libraries l where l.owner_id = u.id)
    and not exists (select 1 from public.space_members m where m.user_id = u.id)
    and not exists (select 1 from public.space_sounds s where s.owner_id = u.id);
  select coalesce(json_agg(p.display_name order by p.display_name), '[]'::json) into names
    from public.profiles p where p.id = any(ids);
  if not coalesce(p_dry, true) and cardinality(ids) > 0 then
    delete from auth.users u where u.id = any(ids);                 -- Profil und Anfragen gehen per on delete cascade mit
  end if;
  return json_build_object('status', case when coalesce(p_dry, true) then 'dry' else 'deleted' end,
    'count', cardinality(ids), 'names', names);
end $$;

-- Speichern mit optimistischer Sperre. Gibt json {status, id, version, ...} zurück; status:
--  created | ok | same (Wiederholung) | conflict | outdated (ältere App) | readonly (Raum beendet)
-- Fehler: 22023 bad_version (App/Format über private.settings) · 54000 too_large | quota | slow_down
-- p_client = Geräte-Kennung (KV cloud:device), p_origin = Herkunfts-Raum einer „Kopie in Nur ich“ (VO-E7)
create or replace function public.save_project(p_id uuid, p_base integer, p_title text, p_body json,
  p_format integer, p_app integer, p_space uuid default null, p_local_id text default null,
  p_client text default null, p_origin uuid default null)
returns json language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := private.need_uid();
  r public.projects%rowtype;
  t text := left(coalesce(nullif(btrim(p_title), ''), 'Projekt'), 60);
  cl text := left(coalesce(p_client, ''), 64);
  lim private.settings%rowtype;
  sz integer; h text; cur public.project_data%rowtype; nv integer;
  need_hand boolean; hand_sz integer := 0; left_b bigint; want_auto boolean; quota_hit boolean := false;
begin
  if p_id is null or p_body is null then raise exception 'bad_args' using errcode = '22023'; end if;
  select * into lim from private.settings;
  if coalesce(p_app, 0) > lim.max_app or coalesce(p_format, 0) > lim.max_format or coalesce(p_app, 0) < 0 or coalesce(p_format, 0) < 0 then
    raise exception 'bad_version' using errcode = '22023';            -- erfundene App-/Format-Nummer sperrt nie ein Projekt
  end if;
  sz := octet_length(p_body::text);
  if sz > 2000000 then raise exception 'too_large' using errcode = '54000'; end if;
  h := md5(p_body::text);
  select * into r from public.projects where id = p_id for update;
  if not found then                                                     -- neu anlegen
    if p_space is not null and p_space not in (select private.my_active_space_ids()) then
      raise exception 'forbidden' using errcode = '42501';
    end if;
    if p_origin is not null and (p_space is not null or p_origin not in (select private.my_space_ids())) then
      raise exception 'forbidden' using errcode = '42501';
    end if;
    if (select count(*) from public.projects p where p.owner_id = uid and p.created_at > now() - interval '1 day') >= 50 then
      raise exception 'slow_down' using errcode = '54000';             -- höchstens 50 neue Projekte je Tag
    end if;
    perform private.check_quota(uid, 2 * sz::bigint);                   -- Inhalt + erste Version
    insert into public.projects (id, owner_id, space_id, origin_space_id, local_id, title, version, format, app_code, size_bytes, updated_by)
      values (p_id, uid, p_space, p_origin, left(p_local_id, 64), t, 1, coalesce(p_format, 3), coalesce(p_app, 0), sz, uid);
    insert into public.project_data (project_id, version, body, body_md5) values (p_id, 1, p_body, h);
    insert into public.project_versions (project_id, version, kind, label, body, size_bytes, created_by, client_id)
      values (p_id, 1, 'import', 'Erster Stand online', p_body, sz, uid, cl);
    return json_build_object('status', 'created', 'id', p_id, 'version', 1);
  end if;
  if not coalesce(r.owner_id = uid or r.space_id in (select private.my_space_ids()), false) then
    raise exception 'forbidden' using errcode = '42501';                -- fremdes Projekt
  end if;
  select * into cur from public.project_data where project_id = p_id;
  if cur.body_md5 = h then                                              -- gleicher Inhalt (z. B. verlorene Antwort)
    return json_build_object('status', 'same', 'id', p_id, 'version', r.version);
  end if;
  delete from private.save_log l where l.project_id = p_id and l.at < now() - interval '1 minute';
  if (select count(*) from private.save_log l where l.project_id = p_id) >= 30 then
    raise exception 'slow_down' using errcode = '54000';               -- höchstens 30 Schreibvorgänge je Projekt und Minute (Review 2)
  end if;
  insert into private.save_log (project_id) values (p_id);
  if not private.can_write(r.owner_id, r.space_id) then                 -- Raum beendet: Fassung trotzdem aufheben
    perform private.keep_conflict(p_id, coalesce(p_base, r.version), 'Nach Ende der Zusammenarbeit', cl, p_body, sz, uid);
    return json_build_object('status', 'readonly', 'id', p_id, 'version', r.version);
  end if;
  if coalesce(p_app, 0) < r.app_code or coalesce(p_format, 0) < r.format then   -- Versions-Wächter VO-R1
    perform private.keep_conflict(p_id, coalesce(p_base, r.version), 'Ältere App-Version', cl, p_body, sz, uid);
    return json_build_object('status', 'outdated', 'id', p_id, 'version', r.version, 'app_code', r.app_code, 'format', r.format);
  end if;
  if p_base is distinct from r.version then                             -- jemand war schneller: beide behalten
    perform private.keep_conflict(p_id, coalesce(p_base, 0), 'Gleichzeitig geändert', cl, p_body, sz, uid);
    return json_build_object('status', 'conflict', 'id', p_id, 'version', r.version,
      'updated_by', r.updated_by, 'updated_at', r.updated_at);
  end if;
  need_hand := r.updated_by is distinct from uid and not exists (select 1 from public.project_versions v
       where v.project_id = p_id and v.version = r.version and v.kind in ('handover', 'auto', 'import', 'manual'));
  if need_hand then hand_sz := octet_length(cur.body::text); end if;
  left_b := private.quota_left(uid) - hand_sz - greatest(sz - r.size_bytes, 0);
  if need_hand and left_b < 0 then raise exception 'quota' using errcode = '54000'; end if;   -- nichts überschrieben
  if need_hand then
    insert into public.project_versions (project_id, version, kind, label, body, size_bytes, created_by)
      values (p_id, r.version, 'handover', 'Stand vor der Übernahme', cur.body, hand_sz, r.updated_by);
  end if;
  nv := r.version + 1;
  update public.project_data set version = nv, body = p_body, body_md5 = h where project_id = p_id;
  update public.projects set version = nv, title = t, format = greatest(r.format, coalesce(p_format, 0)),
    app_code = greatest(r.app_code, coalesce(p_app, 0)), size_bytes = sz, updated_at = now(), updated_by = uid
    where id = p_id;
  want_auto := not exists (select 1 from public.project_versions v where v.project_id = p_id and v.kind in ('auto', 'import')
                 and v.created_at > now() - interval '10 minutes');
  if want_auto and left_b < sz then quota_hit := true; want_auto := false; end if;   -- Quote voll: Stand speichern, Verlauf aussetzen
  if want_auto then
    insert into public.project_versions (project_id, version, kind, body, size_bytes, created_by, client_id)
      values (p_id, nv, 'auto', p_body, sz, uid, cl);
    perform private.thin_versions(p_id);
  end if;
  return json_build_object('status', 'ok', 'id', p_id, 'version', nv, 'trashed', r.deleted_at is not null, 'quota', quota_hit);
end $$;

create or replace function public.mark_version(p_project uuid, p_label text)   -- „Version merken“, auch vor Wiederherstellen
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); cur public.project_data%rowtype; vid bigint;
begin
  if p_project not in (select private.my_project_ids()) then raise exception 'not_found' using errcode = 'P0002'; end if;
  if (select count(*) from public.project_versions v where v.project_id = p_project and v.created_by = uid
        and v.kind = 'manual' and v.created_at > now() - interval '1 hour') >= 20 then
    raise exception 'slow_down' using errcode = '54000';               -- höchstens 20 je Projekt und Stunde
  end if;
  select * into cur from public.project_data where project_id = p_project;
  perform private.check_quota(uid, octet_length(cur.body::text));
  insert into public.project_versions (project_id, version, kind, label, body, size_bytes, created_by)
    values (p_project, cur.version, 'manual', left(coalesce(nullif(btrim(p_label), ''), 'Gemerkt'), 80), cur.body,
            octet_length(cur.body::text), uid)
    returning id into vid;
  return json_build_object('status', 'ok', 'version_id', vid);
end $$;

-- Eigene Sounds mit optimistischer Sperre (statt direktem Upsert): p_base = zuletzt gesehene Version (0 = noch keine)
create or replace function public.save_library(p_base integer, p_body json)
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); l public.user_libraries%rowtype; sz integer;
begin
  if p_body is null then raise exception 'bad_args' using errcode = '22023'; end if;
  sz := octet_length(p_body::text);
  if sz > 2000000 then raise exception 'too_large' using errcode = '54000'; end if;
  select * into l from public.user_libraries where owner_id = uid for update;
  if not found then
    if coalesce(p_base, 0) <> 0 then return json_build_object('status', 'conflict', 'version', 0, 'body', null); end if;
    perform private.check_quota(uid, sz);
    insert into public.user_libraries (owner_id, version, body, size_bytes) values (uid, 1, p_body, sz);
    return json_build_object('status', 'ok', 'version', 1);
  end if;
  if p_base is distinct from l.version then                            -- anderes Gerät war schneller: zusammenführen, neu senden
    return json_build_object('status', 'conflict', 'version', l.version, 'body', l.body);
  end if;
  perform private.check_quota(uid, sz - l.size_bytes);
  update public.user_libraries set version = l.version + 1, body = p_body, size_bytes = sz, updated_at = now() where owner_id = uid;
  return json_build_object('status', 'ok', 'version', l.version + 1);
end $$;

create or replace function public.share_project(p_id uuid, p_space uuid)       -- „Nur ich“ -> Raum (nur Eigentümer)
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); r public.projects%rowtype;
begin
  select * into r from public.projects where id = p_id for update;
  if not found or r.owner_id <> uid then raise exception 'not_found' using errcode = 'P0002'; end if;
  if r.space_id is not distinct from p_space then return json_build_object('status', 'same'); end if;
  if r.space_id is not null then raise exception 'already_shared' using errcode = '42501'; end if;   -- nie von Raum zu Raum
  if p_space is null or p_space not in (select private.my_active_space_ids()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if r.origin_space_id is not null and r.origin_space_id <> p_space then   -- Kopie mit Beiträgen aus einem anderen Raum
    return json_build_object('status', 'mixed_origin', 'origin_space_id', r.origin_space_id);
  end if;
  update public.projects set space_id = p_space, updated_at = now(), updated_by = uid where id = p_id;
  return json_build_object('status', 'shared', 'space_id', p_space);
end $$;

create or replace function public.trash_project(p_id uuid, p_trash boolean default true)
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); r public.projects%rowtype;
begin
  select * into r from public.projects where id = p_id for update;
  if not found or not coalesce(r.owner_id = uid or r.space_id in (select private.my_space_ids()), false) then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if not private.can_write(r.owner_id, r.space_id) then raise exception 'readonly' using errcode = '42501'; end if;
  update public.projects set deleted_at = case when p_trash then now() end, deleted_by = case when p_trash then uid end,
    updated_at = now(), updated_by = uid where id = p_id;
  return json_build_object('status', case when p_trash then 'trashed' else 'restored' end);
end $$;

create or replace function public.purge_project(p_id uuid)     -- endgültig: nur eigene, private, im Papierkorb
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid();
begin
  delete from public.projects where id = p_id and owner_id = uid and space_id is null and deleted_at is not null;
  if not found then raise exception 'not_allowed' using errcode = '42501'; end if;
  return json_build_object('status', 'purged');
end $$;

create or replace function public.storage_report()           -- Quote für alle; Datenbank-Größe nur für Verwalter
returns json language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'db_bytes', case when private.is_admin() then pg_database_size(current_database()) end,
    'limit_bytes', case when private.is_admin() then 500 * 1024 * 1024 end,
    'my_projects', (select count(*) from public.projects p where p.owner_id = (select auth.uid())),
    'quota_bytes', private.quota_of((select auth.uid())),
    'trusted', private.is_trusted((select auth.uid())),
    'quota_left', private.quota_left((select auth.uid())),
    'server_left', case when private.is_admin() then private.server_left() end,
    'accounts', case when private.is_admin() then (select count(*) from public.profiles) end,
    'admin', private.is_admin())
$$;

create or replace function public.admin_thin(p_days integer default 90)   -- [Aufräumen]: auto-Versionen älter als p_days -> 1 je Woche
returns json language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  perform private.need_uid();
  if not private.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  delete from public.project_versions v
  where v.kind = 'auto' and v.created_at < now() - make_interval(days => greatest(coalesce(p_days, 90), 30))
    and v.id not in (
      select distinct on (x.project_id, date_trunc('week', x.created_at)) x.id from public.project_versions x
      where x.kind = 'auto' order by x.project_id, date_trunc('week', x.created_at), x.created_at desc);
  get diagnostics n = row_count;
  return json_build_object('status', 'ok', 'deleted', n);
end $$;

-- Sounds im Raum (VO3): Anzahl und Quote prüfen (direktes INSERT bleibt per RLS, der Trigger begrenzt)
create or replace function private.space_sounds_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from private.blocked_users b where b.user_id = new.owner_id) then
    raise exception 'blocked' using errcode = '42501';
  end if;
  if (select count(*) from public.space_sounds x where x.owner_id = new.owner_id) >= 200 then
    raise exception 'slow_down' using errcode = '54000';
  end if;
  perform private.check_quota(new.owner_id, octet_length(new.body::text));
  return new;
end $$;
create trigger space_sounds_guard before insert on public.space_sounds for each row execute function private.space_sounds_guard();
revoke all on function private.space_sounds_guard(), private.keep_conflict(uuid, integer, text, text, json, integer, uuid),
  private.check_quota(uuid, bigint), private.quota_left(uuid), private.quota_of(uuid), private.is_trusted(uuid),
  private.used_bytes(uuid), private.server_left(),
  private.is_admin(), private.need_uid() from public, anon, authenticated;

revoke execute on function public.ping(), public.set_profile(text, boolean), public.find_user(text),
  public.respond_request(uuid, boolean), public.request_collab(uuid, text), public.cancel_request(uuid),
  public.end_collab(uuid), public.admin_accounts(), public.admin_block(uuid, boolean, text, boolean), public.admin_trust(uuid, boolean),
  public.admin_cleanup(integer, boolean),
  public.save_project(uuid, integer, text, json, integer, integer, uuid, text, text, uuid),
  public.mark_version(uuid, text), public.save_library(integer, json), public.share_project(uuid, uuid),
  public.trash_project(uuid, boolean), public.purge_project(uuid), public.storage_report(), public.admin_thin(integer) from public, anon;
grant execute on function public.set_profile(text, boolean), public.find_user(text),
  public.respond_request(uuid, boolean), public.request_collab(uuid, text), public.cancel_request(uuid),
  public.end_collab(uuid), public.admin_accounts(), public.admin_block(uuid, boolean, text, boolean), public.admin_trust(uuid, boolean),
  public.admin_cleanup(integer, boolean),
  public.save_project(uuid, integer, text, json, integer, integer, uuid, text, text, uuid),
  public.mark_version(uuid, text), public.save_library(integer, json), public.share_project(uuid, uuid),
  public.trash_project(uuid, boolean), public.purge_project(uuid), public.storage_report(), public.admin_thin(integer) to authenticated;
grant execute on function public.ping() to anon, authenticated;     -- für den optionalen Wach-Ping

-- ---------- 7. Realtime ----------
-- Postgres Changes nur für die kleinen Kopf-Tabellen (RLS gilt je Empfänger)
alter publication supabase_realtime add table public.projects, public.collab_requests, public.spaces;
-- Ohne DELETE: DELETE-Ereignisse sind nicht RLS-geprüft (S15) und würden IDs fremder, endgültig gelöschter
-- Projekte/Anfragen an jeden Angemeldeten senden. Die App braucht sie nicht (Löschen ist weich = UPDATE).
alter publication supabase_realtime set (publish = 'insert, update');
-- Presence/Broadcast (VO2-P1/VO3) nur auf privaten Kanälen 'space:<id>' eines aktiven eigenen Raums.
-- Dazu im Dashboard: Realtime → Settings → „Allow public access“ AUS.
create policy space_channel_read on realtime.messages for select to authenticated
  using (realtime.messages.extension in ('presence', 'broadcast') and private.topic_space_ok((select realtime.topic())));
create policy space_channel_write on realtime.messages for insert to authenticated
  with check (realtime.messages.extension in ('presence', 'broadcast') and private.topic_space_ok((select realtime.topic()))
              and not (select private.is_blocked()));

-- ---------- 8. (Teil C, erst mit Audio/VS) Storage: privater Eimer je Raum-Ordner ----------
-- insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
--   values ('space-audio', 'space-audio', false, 52428800, array['audio/mp4', 'audio/webm', 'audio/mpeg']);
create policy space_audio_read on storage.objects for select to authenticated
  using (bucket_id = 'space-audio' and private.path_space_ok(name, false));
create policy space_audio_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'space-audio' and private.path_space_ok(name, true) and not (select private.is_blocked()));
-- Kein DELETE für Nutzer (Review r7): gemeinsame Songs verweisen auf die Aufnahmen; Löschen nur beim
-- Verwalter-Aufräumen (service role), wenn kein Projekt-Inhalt und keine Version die Datei mehr nennt.
```

### 3.4 Testmatrix (lokal geprüft, `online-test/rls-matrix.mjs` → `.out`, 135/135)

Aufbau: Xander (X), René (R), David (D), Fremder (S, angemeldet, ohne Beziehung; mit offener Registrierung der Normalfall für jedes neue Konto), anon. In `collab_requests` heißt `:a` angenommen, `:p` offen. Räume XR und XD angenommen; David hat René angefragt (offen). Projekte: `pX` (X privat), `pXR` (X in XR), `pR` (R privat), `pRX` (R in XR), `pXD` (X in XD), `pDX` (D in XD), `pD` (D privat, später nach XD geteilt), `pDR` (in Matrix B). „∅“ = keine Zeile sichtbar, „— (kein Recht)“ = Postgres-Fehler 42501. Der Nachbau setzt dabei die **alten** automatischen Rechte; die Migration nimmt sie zurück.

**Matrix A (Start: Räume XR und XD, David→René offen)**

| Tabelle / Aktion | Xander | René | David | Fremder | anon |
|---|---|---|---|---|---|
| projects lesen | pDX pRX pX pXD pXR | pR pRX pXR | pD pDX pXD | ∅ | — (kein Recht) |
| project_data lesen | pDX pRX pX pXD pXR | pR pRX pXR | pD pDX pXD | ∅ | — (kein Recht) |
| project_versions lesen (Projekte) | pDX pRX pX pXD pXR | pR pRX pXR | pD pDX pXD | ∅ | — (kein Recht) |
| spaces lesen | XD XR | XR | XD | ∅ | — (kein Recht) |
| space_members lesen | XD:D XD:X XR:R XR:X | XR:R XR:X | XD:D XD:X | ∅ | — (kein Recht) |
| profiles lesen | D R X | D R X | D R X | S | — (kein Recht) |
| collab_requests lesen | X→D:a X→R:a | D→R:p X→R:a | D→R:p X→D:a | ∅ | — (kein Recht) |
| space_list (Partner) | D R | X | X | ∅ | — (kein Recht) |
| project_list mit Autor | pDX/David pRX/René pX/Xander pXD/Xander pXR/Xander | pR/René pRX/René pXR/Xander | pD/David pDX/David pXD/Xander | ∅ | — (kein Recht) |
| Realtime presence lesen (Thema space:XR) | ja | ja | nein | nein | nein |
| Storage space-audio lesen | XD XR | XR | XD | ∅ | ∅ |

**Matrix B (René hat Davids Anfrage angenommen: Raum DR)**

| Tabelle / Aktion | Xander | René | David | Fremder | anon |
|---|---|---|---|---|---|
| projects lesen | pD pDX pRX pX pXD pXR | pDR pR pRX pXR | pD pDR pDX pXD | ∅ | — (kein Recht) |
| project_data lesen | pD pDX pRX pX pXD pXR | pDR pR pRX pXR | pD pDR pDX pXD | ∅ | — (kein Recht) |
| project_versions lesen (Projekte) | pD pDX pRX pX pXD pXR | pDR pR pRX pXR | pD pDR pDX pXD | ∅ | — (kein Recht) |
| spaces lesen | XD XR | DR XR | DR XD | ∅ | — (kein Recht) |
| space_members lesen | XD:D XD:X XR:R XR:X | DR:D DR:R XR:R XR:X | DR:D DR:R XD:D XD:X | ∅ | — (kein Recht) |
| profiles lesen | D R X | D R X | D R X | S | — (kein Recht) |
| collab_requests lesen | X→D:a X→R:a | D→R:a X→R:a | D→R:a X→D:a | ∅ | — (kein Recht) |
| space_list (Partner) | D R | D X | R X | ∅ | — (kein Recht) |
| project_list mit Autor | pD/David pDX/David pRX/René pX/Xander pXD/Xander pXR/Xander | pDR/David pR/René pRX/René pXR/Xander | pD/David pDR/David pDX/David pXD/Xander | ∅ | — (kein Recht) |
| Realtime presence lesen (Thema space:XR) | ja | ja | nein | nein | nein |
| Storage space-audio lesen | XD XR | XR | XD | ∅ | ∅ |

**Matrix C (René hat XR beendet)**

| Tabelle / Aktion | Xander | René | David | Fremder | anon |
|---|---|---|---|---|---|
| projects lesen | pD pDX pRX pX pXD pXR | pDR pR pRX pXR | pD pDR pDX pXD | ∅ | — (kein Recht) |
| project_data lesen | pD pDX pRX pX pXD pXR | pDR pR pRX pXR | pD pDR pDX pXD | ∅ | — (kein Recht) |
| project_versions lesen (Projekte) | pD pDX pRX pX pXD pXR | pDR pR pRX pXR | pD pDR pDX pXD | ∅ | — (kein Recht) |
| spaces lesen | XD XR | DR XR | DR XD | ∅ | — (kein Recht) |
| space_members lesen | XD:D XD:X XR:R XR:X | DR:D DR:R XR:R XR:X | DR:D DR:R XD:D XD:X | ∅ | — (kein Recht) |
| profiles lesen | D R X | D R X | D R X | S | — (kein Recht) |
| collab_requests lesen | X→D:a X→R:a | D→R:a X→R:a | D→R:a X→D:a | ∅ | — (kein Recht) |
| space_list (Partner) | D R | D X | R X | ∅ | — (kein Recht) |
| project_list mit Autor | pD/David pDX/David pRX/René pX/Xander pXD/Xander pXR/Xander | pDR/David pR/René pRX/René pXR/Xander | pD/David pDR/David pDX/David pXD/Xander | ∅ | — (kein Recht) |
| Realtime presence lesen (Thema space:XR) | nein | nein | nein | nein | nein |
| Storage space-audio lesen | XD XR | XR | XD | ∅ | ∅ |

**Direkte Schreibversuche**

| Aktion | wer | Ergebnis |
|---|---|---|
| projects insert direkt | X | verweigert |
| projects update direkt (eigenes) | X | verweigert |
| projects delete direkt (eigenes) | X | verweigert |
| project_data update direkt | R | verweigert |
| space_members: sich selbst in XR eintragen | D | verweigert |
| collab_requests: Status selbst setzen | R | verweigert |
| profiles: eigenen Namen ändern | R | erlaubt |
| profiles: fremden Namen ändern | D | 0 Zeilen |
| profiles: friend_code ändern | X | verweigert |
| user_libraries: eigene direkt anlegen (nur über `save_library`) | D | verweigert |
| user_libraries: für andere anlegen | D | verweigert |
| space_sounds: in XR teilen (Mitglied) | R | erlaubt |
| space_sounds: in XR teilen (kein Mitglied) | D | verweigert |
| Realtime presence senden in XR (Mitglied) | R | erlaubt |
| Realtime presence senden in XR (kein Mitglied) | D | verweigert |
| Realtime broadcast in fremdem Thema (Rateversuch) | S | verweigert |
| Storage: Datei in XR-Ordner (Mitglied) | R | erlaubt |
| Storage: Datei in XR-Ordner (kein Mitglied) | D | verweigert |
| Storage: fremde Datei löschen | R | 0 Zeilen |

**RPC**

| Aufruf | wer | Ergebnis |
|---|---|---|
| save_project pRX (Mitglied XR) | X | ok |
| save_project pRX (David, fremder Raum) | D | verweigert |
| save_project pX (Fremder) | S | verweigert |
| save_project (anon) | anon | verweigert |
| save_project neu in XR (kein Mitglied) | D | verweigert |
| share_project pD → XD (Eigentümer) | D | shared |
| share_project pX → XD (nicht Eigentümer) | D | nicht gefunden |
| share_project pXR → XD (Raum zu Raum) | X | verweigert |
| respond_request fremde Anfrage | S | nicht gefunden |
| cancel_request fremde Anfrage | X | nicht gefunden |
| end_collab XR (kein Mitglied) | D | nicht gefunden |
| mark_version pXR (kein Mitglied) | D | nicht gefunden |
| trash_project pXR (kein Mitglied) | D | nicht gefunden |
| request_collab an sich selbst | X | Fehler 22023 |
| purge_project ohne Papierkorb | X | verweigert |
| trash_project pXR (Mitglied, aktiv) | R | trashed |
| purge_project pXR (geteilt) | X | verweigert |
| trash_project pXR zurück | X | restored |

Die Matrizen A–C sind nach dem Nachtrag „offene Registrierung“ zeichengleich mit dem Stand davor (`rls-matrix.pre-offen.out`): Die Lese-Rechte hängen nur an Räumen und Anfragen, nicht daran, wie ein Konto entstanden ist.

**Lesart:** O3 ist erfüllt. David sieht in A nur XD, in B zusätzlich DR, aber nie `pR`, `pRX`, `pXR`. Eine offene Anfrage zeigt nur Name und Code der Gegenseite, keine Projekte. Nach dem Ende von XR (C) bleiben die Songs lesbar, Speichern wird als Fassung aufgehoben (`readonly`), Presence ist aus. `anon` bekommt überall „kein Recht“ (Storage zeigt „∅“, weil Supabase dort `anon` Rechte gibt und erst RLS filtert).

### 3.5 Weitere geprüfte Regeln (Auszug aus `rls-matrix.out`)

- Gleichzeitiges Speichern: erster gewinnt (`ok`), zweiter bekommt `conflict`; je Person, Gerät, Stand und Grund gibt es genau **eine** Konflikt-Fassung mit dem neuesten Inhalt.
- Übernimmt René nach Xander, wird Xanders letzter Stand als `handover` aufgehoben.
- Wiederholung mit altem Stand und gleichem Inhalt → `same` (kein Scheinkonflikt).
- Ältere App (`app_code` kleiner) oder Format 3 gegen gespeichertes Format 4 → `outdated`, nichts überschrieben, Fassung aufgehoben.
- `auto`-Version höchstens alle 10 min; älter als 30 Tage bleibt je Tag nur der letzte Stand (10 Tage × 2 → 10).
- Anmelde-Bremse (Hook): offen → `{}`; `signup_open = false` → 403; Sperr-Domain/-Adresse → 403 (andere Adresse derselben Domain frei); `max_accounts` erreicht → 403; `max_signups_day` erreicht → 429; Hook, Sperr-Domains und Sperrliste für Nutzer nicht erreichbar.
- **Offene Registrierung (Nachtrag 17.10., 25 neue Fälle, alle bestanden):** neues Konto ohne Einladung sieht nur sich (0 Anfragen, 0 Projekte, 0 Räume) · ohne Namen heißt es „Musiker“, nicht findbar · Mitmach-Link: Lina findet Xander über `#<Code>`, fragt an, Xander nimmt an → genau ein Raum, keine fremden Projekte · `find_user` per E-Mail liefert nie einen Treffer; per Name erst nach „findbar an“ · Sperren nur Verwalter, nicht sich selbst; Sperren zieht offene Anfragen zurück; gesperrt: Speichern (`blocked`), Suchen, Profil ändern scheitern mit 42501, ebenso Presence, Storage und Raum-Sounds im eigenen aktiven Raum (vorher und nach dem Entsperren erlaubt); gesperrte Konten sind nicht auffindbar und nicht anfragbar; Entsperren → schreibt wieder · Aufräumen nur Verwalter; Probelauf mit `p_days = 1` wirkt wie 7 und nennt nur „Alt“ (40 Tage, leer), nicht das gesperrte und nicht das 3 Tage junge Konto; echter Lauf löscht Konto samt Profil, die anderen 10 bleiben · Gesamt-Grenze: Anlegen → `54000 server_full`, normales Speichern geht weiter (`quota: true`) · `admin_accounts` nur Verwalter, ohne ein „@“ in der Antwort · `storage_report`: Kontenzahl und Server-Rest nur für Verwalter.
- Ablehnen sperrt neue Anfragen derselben Person 24 h; gegenseitige Anfrage verbindet sofort; Zurückziehen geht.
- **Review 2 (17.10., 12 neue Fälle, 2 angepasst, alle bestanden; Befunde vorher am alten Stand nachgestellt in `online-test/repro-review2.mjs` → `repro-review2.alt.out` / `.neu.out`):** Bremse zählt gesperrte Konten weder insgesamt noch je Tag · `signup_need_ref`: ohne Code 403, Xanders Code erlaubt, Code eines Gesperrten 403 · gesperrter angenommener Partner liest nichts mehr (Inhalt, Projekte, Räume, Mitglieder, Anfragen, Realtime; Profil nur das eigene), sein Raum ist beendet, der Partner liest weiter · Probe-Quote 5 MiB, `admin_trust` nur Verwalter → 60 MiB, Raum mit dem Verwalter → 60 MiB · Sperren allein gibt keinen Platz frei und Löschen scheitert an RESTRICT; nach `p_purge` sind die Bytes 0 und das Konto lässt sich löschen · „xander “ per `set_profile` und unsichtbarer Name per PATCH → `22023 bad_name`, Format-Zeichen werden entfernt, `is_admin` per PATCH → 42501, Registrieren als „Xander“ → „Musiker“, Homoglyph ohne ✓ · `find_user` 31. Suche je Stunde → `slow_down` · `save_project` 31. Schreibvorgang je Minute → `slow_down`, danach wieder frei · `db_soft_limit` überschritten → `server_full` · zweimal Nein → `declined_recently`, bis der Empfänger selbst anfragt · angepasst: Doppelgänger-Test mit „René“ statt „Xander“ (reserviert); Sperr-Test erwartet jetzt den beendeten Raum und verbindet nach dem Entsperren neu. `fake-supa.mjs` 11/11 unverändert.
- Selbstprüfung wie der Advisor: alle Funktionen mit festem `search_path`, RLS auf allen Tabellen in `public`, `anon` ohne Tabellenrechte, `anon` darf nur `ping` ausführen, Publikation nur Kopf-Tabellen und **ohne DELETE**.
- **Nachprüfungen Review r7 (20 Fälle, davon 16 weiter aktiv, alle bestanden):** zwei eigene Geräte → zwei Konflikt-Fassungen, je die neueste; „Ältere App“ und „Gleichzeitig“ getrennt · `p_app = 2147483647` → `bad_version`, das Projekt bleibt für den Partner offen · Kopie aus XR → Teilen nach XD = `mixed_origin`, nach XR = `shared`; fremder Herkunfts-Raum beim Anlegen verweigert · *(die 4 Einladungs-Fälle entfallen mit dem Nachtrag)* · Senden/Zurückziehen höchstens 3-mal je Paar und 24 h (`slow_down`) · doppelter Name → ein Treffer ohne ID („mehrere“) · `save_library`: altes Gerät bekommt `conflict` mit dem Server-Inhalt · Quote: Anlegen über der Grenze → `54000 quota`; normales Speichern geht weiter (`quota: true`, ohne auto-Version); Merken nicht · `mark_version` höchstens 20 je Stunde · `storage_report`: DB-Größe nur für Verwalter · `admin_thin` nur für Verwalter · eigene Aufnahme im Raum nicht löschbar · `private.settings`/`admins` nicht erreichbar.
- `attack.after.out` (Stand Review r7, nicht neu ausgeführt): A3 (`bad_version`), A5 (beide `forbidden`; `invite_email` gibt es nicht mehr, das Konto-Orakel ist jetzt durch „keine E-Mail-Suche“ zu), A6 (3 statt 15), A7 (ein Treffer ohne Code) sind behoben. A1/A2 zeigen weiter den alten Verlust, weil das Angriffs-Skript **ohne** `p_client` und mit `p_app` über `max_app` speichert. Der Fall mit Geräte-Kennung steht in `rls-matrix.out` (R7). A4: Die Quote begrenzt David jetzt auf 60 MiB (vorher unbegrenzt).

---

## 4. Autosave und „nie verloren“

### 4.1 Schichten

| Schicht | Was | Wann | Überlebt |
|---|---|---|---|
| 1 Lokal (heute schon) | `SQStore.Autosave`: IndexedDB `project`, Rettungskopie in `localStorage` bei `pagehide`/`hidden`, „Ältere Versionen“ alle 10 min (12 Stück) | 800 ms nach der Änderung, spätestens 4 s; beim Spielen 2 s / 20 s | Neuladen, Absturz, Funkloch |
| 2 Warteschlange | KV `cloud:outbox:<uid>` = Liste lokaler Projekt-IDs mit ungesendeten Änderungen **je Konto**; KV `cloud:meta:<lid>` = `{uid, sid, base, space, owner, title, dirty, conflict?}` (`uid` = Konto, das das Projekt angelegt oder geladen hat) | nach jedem lokalen Schreiben (`onWritten`) | wie Schicht 1 |
| 3 Server | `save_project` (eine RPC, atomar) | 2 s nach dem letzten lokalen Schreiben, spätestens 15 s; beim Spielen höchstens alle 30 s (spätestens 60 s); sofort bei `visibilitychange: hidden` und `pagehide` | Gerätewechsel, gelöschter Safari-Speicher |
| 4 Server-Verlauf | `project_versions`: `import` (erster Stand), `auto` (≤ 1 je 10 min, ausgesetzt bei voller Quote), `handover` (Stand des Partners vor der Übernahme), `conflict` (jede abgelehnte Fassung, je Gerät und Grund), `manual` („Version merken“, vor Wiederherstellen) | automatisch in `save_project` | alles; nur `auto` älter als 30 Tage wird auf 1 je Tag ausgedünnt |

Die eigenen Sounds (`LIB`) gehen als eine Datei über `save_library(p_base, p_body)` nach `user_libraries` (5 s nach Änderung), mit optimistischer Sperre wie bei Projekten. Ist ein anderes Gerät schneller gewesen, kommt `conflict` mit dem Server-Inhalt zurück. SYNC führt per Hash zusammen (`importMany`) und sendet erneut mit der neuen `base`. So geht ein Sound, den nur Gerät A kennt, nicht verloren, wenn Gerät B mit altem Stand hochlädt (Review r7). Direktes Schreiben in die Tabelle ist entzogen.

### 4.2 Was hochgeladen wird

Genau die Projektdatei-Hülle, die heute auch in `[Projekte]` geparkt wird, nur **ohne** Bibliothek: `{app, kind:'project', format, saved, appVersion, sum, project}` (`projectFileObj(S, false, false)`). Laden geht immer über `SQStore.parseFile` → Migrationen (v1, v2→3, ab V2a 3→4) und `normalizeProject` laufen wie beim Öffnen einer Datei. Der Server kennt das Innenformat nicht; er merkt sich nur `format` und `app_code` für den Versions-Wächter.

**Ein Stringify je Push:** Der Autosave-Schnappschuss `snap.project` ist schon gepackt. SYNC baut daraus den Text **einmal** (`pj = JSON.stringify(snap.project)`, `sum = fnv(pj)`, Hülle per Textverkettung in derselben Schlüsselreihenfolge wie `buildProjectFile`) und schickt ihn per `fetch` an `/rest/v1/rpc/save_project` (Header `apikey`, `Authorization: Bearer <access_token>` aus `auth.getSession()`). So entsteht kein zweites `JSON.stringify` des großen Objekts durch supabase-js. Gemessen (Xeon): Demo 0,6–0,9 ms, großes Projekt 10–13 ms je Stringify; am iPhone geschätzt das 2–2,5-Fache (Faktor unbelegt, §15.1). Beim Spielen ruft SYNC vorher `tickAhead(.3)` wie der lokale Autosave.

### 4.3 Ablauf Speichern (Pseudocode)

```js
// Hook: SQStore.Autosave({... onWritten: snap => SYNC.onLocalWrite(snap)})
onLocalWrite(snap):  meta(S.id).dirty = true; outbox(uid).add(S.id); schedulePush(R.playing ? {d: 30000, max: 60000} : {d: 2000, max: 15000})
push(lid):                                   // unter navigator.locks.request('synq-cloud') (ein Tab zur Zeit)
  if (!online || meta.outdated || meta.badVersion) return   // meta.conflict hält NICHT an (Review r7): gleiche p_base, Server hält die Konflikt-Fassung aktuell
  m = meta(lid) || {uid, sid: crypto.randomUUID(), base: 0, space: null}
  if (m.uid !== uid) return                  // Projekt eines anderen Kontos auf diesem Gerät: nie automatisch hochladen (§4.4)
  if (m.base === 0 && isPristine(projectOf(lid))) return   // unberührtes Demo/Neu nie hochladen
  text = fileText(lid)                       // offenes Projekt: aus snap; geparkt: aus KV 'proj:<lid>'
  mtAtStart = localMt(lid)
  r = rpcText('save_project', {p_id: m.sid, p_base: m.base, p_title, p_format, p_app: APP_CODE, p_space: m.space, p_local_id: lid,
              p_client: DEVICE, p_origin: m.origin || null}, 'p_body', text)
                                             // fetch POST /rest/v1/rpc/save_project; Body = kleiner JSON-Kopf + ',"p_body":' + text + '}'
  switch (r.status) {
    case 'created': case 'ok': case 'same': m.base = r.version; if (localMt(lid) === mtAtStart) { m.dirty = false; outbox(uid).delete(lid) }
                    if (r.quota) note('quota'); break
    case 'conflict': m.conflict = {server: r.version, by: r.updated_by, at: r.updated_at, sentMt: mtAtStart}; notifyConflict(lid); break
                                             // bleibt in der Outbox; nächster Push wieder mit derselben p_base -> Konflikt-Fassung = letzter lokaler Stand
    case 'outdated': m.outdated = true; banner('René benutzt eine neuere SYNQUENZER-Version. [Jetzt neu laden] – klappt es nicht, in 2 Minuten noch mal. Deine Änderungen sind gesichert.'); break
    case 'readonly': m.readonly = true; toast('Nur lesen – die Zusammenarbeit ist beendet. Deine Version ist aufgehoben.'); break
  }
  errors: Netz → 'offline' + Backoff 2, 5, 15, 60 s, dann alle 5 min und bei 'online'/'visible' · 540 → 'paused' (alle 5 min)
          · 401/JWT abgelaufen → auth.refreshSession(), einmal wiederholen · 42501/P0002 → m.lost = true (Zugriff weg; lokal bleibt alles)
          · 22023 bad_version → m.badVersion = true, Hinweis „Diese App-Version ist online noch nicht freigeschaltet – Xander/Claude Bescheid sagen“ (lokal weiter)
          · 54000 too_large → „Projekt größer als 2 MB“ · 54000 quota/slow_down → 'full' (nur diese Person), Versuch stündlich
          · 25006 (Datenbank nur lesen, voll) → 'full', Versuch stündlich
hidden/pagehide: lokale Rettungskopie (heute) + push() sofort; Text ≤ 60 KB → fetch mit keepalive:true, sonst normal
[Jetzt neu laden]: location.replace(pfad + '?v=' + Date.now() + location.hash)   // umgeht den HTTP-Cache der Seite
```

### 4.4 Start und Neuladen: der neueste Stand gewinnt

Die App zeigt zuerst wie heute den lokalen Stand (kein Warten aufs Netz). Danach im Hintergrund, nach Versionsnummer (nicht nach Uhrzeit, Geräte-Uhren können abweichen):

| lokal | Server | Handlung |
|---|---|---|
| nie hochgeladen | – | anlegen (`created`) |
| `base` = Server-Version, nicht geändert | gleich | nichts |
| `base` = Server-Version, geändert | gleich | hochladen |
| nicht geändert | **neuer** | Server-Stand laden. Ohne Eingabe seit dem Start (wie `BOOT.gen`) still mit Toast „Neuere Fassung geladen (René, 17:42)“, sonst Toast „René hat ‚Song X‘ geändert · [Laden]“ |
| geändert | **neuer** | Konflikt (§4.5); meine Fassung liegt danach schon als `conflict` auf dem Server |
| kein lokales Projekt (neues Gerät, Safari-Speicher gelöscht). **Gilt auch, wenn das offene Projekt `isPristine` ist** (V0a Z. 16879): `boot()` startet dort immer mit `demoProject()` (Z. 9424) | vorhanden | nach dem Anmelden das zuletzt geänderte eigene Projekt ohne Rückfrage öffnen, Toast „Deine Songs sind da – ‚Song X‘ geladen“; `[Projekte]` füllt sich aus der Serverliste. Das unberührte Demo wird nie hochgeladen |
| Server-Projekt fehlt (endgültig gelöscht) oder kein Zugriff mehr | – | lokal behalten, als „nur hier“ markieren, nie still löschen |

**Erst-Abgleich nach dem ersten Anmelden auf einem Gerät:** hochgeladen werden nur lokale Projekte (offenes + `[Projekte]`), die **nicht** `isPristine` sind und die entweder keinen Meta-Eintrag haben (entstanden vor jeder Anmeldung auf diesem Gerät) oder deren `meta.uid` dem angemeldeten Konto entspricht. Gibt es auf dem Server schon ein eigenes Projekt mit derselben `local_id`, wird verknüpft statt verdoppelt; weicht der Inhalt ab, gilt die Konfliktregel.

**Anderes Konto auf demselben Gerät** (René meldet sich auf Xanders iPhone an, gemeinsames iPad): Unterscheidet sich die neue `uid` von `cloud:me.uid` und liegen fremde Projekte auf dem Gerät, lädt SYNC **nichts** automatisch hoch. Stattdessen erscheint eine Karte: „Auf diesem Gerät liegen 5 Songs von Xander. Sie bleiben hier und werden nicht in dein Konto geladen.“ Darunter steht optional [Diese Songs in mein Konto übernehmen] als Zwei-Schritt-Knopf, vorher nicht gewählt. Lokale Kopien aus einem Raum (`meta.space` gesetzt) werden auch dann nie übernommen. Warteschlange und Meta sind je Konto getrennt (`cloud:outbox:<uid>`). Xanders wartende Änderungen laufen also nicht unter Renés Token und werden nicht fälschlich als „Zugriff weg“ markiert. Sie gehen hoch, wenn Xander sich wieder anmeldet.

### 4.5 Konflikt: niemals still überschreiben

- Konflikt heißt: Server-Version > meine `base` **und** ich habe ungesendete Änderungen. Das merkt die App beim Speichern (`conflict`) oder schon vorher über Realtime.
- Der Server hebt meine Fassung **sofort** als `conflict` auf (je Person, Gerät und Stand eine, immer der neueste Inhalt). **Das Hochladen läuft im normalen Takt weiter**, mit derselben alten `p_base`. Der Server überschreibt dabei nichts, sondern hält nur die Konflikt-Fassung auf dem letzten lokalen Stand (Review r7). Wird der Konflikt nur über Realtime erkannt, löst SYNC sofort einen solchen Push aus, damit auf dem Server überhaupt eine Konflikt-Fassung liegt.
- Solange der Konflikt offen ist, wiederholt die App alle 10 min den Hinweis „Konflikt bei ‚Song X‘ wartet – deine Änderungen sind gesichert“.
- Hinweis (Toast, höchstens 2 Aktionen wie I-06): **„René hat ‚Song X‘ geändert · [Übernehmen] [Beide behalten]“**. Weil Toasts in der Rolle keine Knöpfe zeigen und nach 5 s verschwinden, bleibt die Wahl als Karte oben im Online-Blatt stehen, und der Punkt am ≡ wird orange.
  - Vor **beiden** Wahlen ruft SYNC einmal synchron `save_project` mit der alten `base` auf und wechselt erst nach der Antwort `conflict` oder `same`. Damit entspricht die Server-Fassung sicher dem letzten lokalen Stand. Ohne Netz bleibt die Wahl gesperrt („Erst online, damit deine Version sicher ist“), lokal arbeitet man weiter.
  - **Übernehmen:** Renés Stand laden (`switchProjectUI`); meine Version bleibt als Konflikt-Fassung (Server) und als lokaler Schnappschuss (`autosave.snapshotNow()` vorher).
  - **Beide behalten:** meine Version wird ein **neues** Projekt im selben Raum, „Song X (Xanders Version)“, mit neuer `sid` und neuer lokaler ID; ich arbeite darin weiter, Renés Stand bleibt das Original.
- In jedem Fall sind danach drei Stände abrufbar: Renés, meiner, der gemeinsame Vorgänger (Verlauf).
- **Gleichzeitig am selben Song** ist damit abwechselnd: Wer zuerst speichert, gewinnt; der andere wählt. Echte Live-Zusammenarbeit an einem Song ist VO3/VC3, nicht VO2. **Vorwarnung schon in VO2** (Review r7): Presence-light auf dem privaten Kanal `space:<id>` mit `{name, projekt}` (Policies in §3.3, lokal geprüft). Öffnet man einen Song, den der Partner gerade offen hat, erscheint eine Zwei-Schritt-Karte: „René arbeitet gerade an ‚Song X‘. [Trotzdem öffnen] [Als Kopie öffnen]“.

### 4.6 Offline, Server schläft, Fehler

| Lage | Anzeige (Punkt am ≡ + Zeile im Online-Blatt) | Verhalten |
|---|---|---|
| online, alles oben | grün · „Online · gespeichert vor 1 min“ | – |
| lädt hoch | blau pulsierend · „Speichert …“ | – |
| offline | grau · „Offline – auf diesem Gerät gesichert (2 Songs warten)“ | Warteschlange; Versuche nach Backoff, bei `online` und `visible`. Neuladen ohne Netz geht dank `sw.js` (§2.7) |
| Server schläft (540) | orange · Freunde: „Online macht gerade Pause. Deine Änderungen sind auf diesem Gerät sicher … [Xander Bescheid sagen]“ · Xander: „Der kostenlose Server schläft … [Supabase öffnen]“ (§2.2) | alle 5 min ein Versuch; einmal am Tag [Alles sichern] anbieten |
| Konflikt / neue App nötig / neue Anfrage | orange · Karte im Online-Blatt | wartet auf Wahl |
| Datenbank voll (read-only) | orange · Freunde: „Online-Speicher voll – Xander räumt auf. Deine Änderungen sind hier sicher.“ · Xander: „Online-Speicher voll · [Aufräumen]“ (`admin_thin`, §6.3) | lokal weiter; Versuch stündlich |
| eigene Quote voll (`quota`) | orange · „Dein Online-Platz ist voll: der Song wird weiter gespeichert, alte automatische Versionen nicht mehr. Leere den Papierkorb oder frag Xander.“ | Stand wird weiter gespeichert; Anlegen/Merken erst nach Aufräumen |
| abgemeldet | kein Punkt | lokal wie heute |
| Claude-Viewer | grau, dauerhaft · „Nur auf diesem Gerät – nicht online“ | §4.7 |

### 4.7 Im Claude-Viewer

`window.claude` vorhanden und Seite im Rahmen → Zustand `viewer`: kein Laden von supabase-js, keine Anfrage an `*.supabase.co`. Der Artifact-Speicher kann laut Plattform-Vertrag leer zurückkommen (L1). Arbeit aus der Claude-App käme so nie online, ohne dass Xander es merkt (Review r7). Deshalb:
- grauer Punkt am ≡ **dauerhaft**, im Menü die Zeile „Nur auf diesem Gerät – nicht online“ und der Knopf **[In Safari öffnen und mitnehmen]**. Er öffnet `<eigene Adresse>#import=<deflate + base64url der Projektdatei>` in einem neuen Tab (`CompressionStream` ab iOS 16.4, W5; Demo ≈ 5 KB, großes Projekt ≈ 76 KB als Hash). Die Safari-Version importiert das Projekt, legt es nach dem Anmelden sofort online an, meldet „Aus der Claude-App übernommen“ und entfernt den Hash (`history.replaceState`).
- **Ungeprüft:** ob ein `target="_blank"`-Link aus dem Artifact-Rahmen am iPhone wirklich Safari öffnet. Erste Prüfung in T5. Klappt es nicht, gilt der Rückweg: Projekttext in die Zwischenablage, in der Safari-Version [Aus Zwischenablage einfügen].
- einmal je Sitzung der Toast „Online-Speichern gibt es in der Safari-Version · [Öffnen]“.
- Lokales Speichern, Datei-Export (EN-12) und Import bleiben wie heute.
Seite ohne Rahmen auf der Artifact-Adresse (N0.3: `use()` liefert `null`): wie Viewer behandeln, solange ein Probe-Aufruf `rpc/ping` nicht gelingt.

### 4.8 Mehrere Tabs, mehrere Geräte

- Hochladen unter einer Web-Lock (`synq-cloud`), damit zwei Tabs nicht gegeneinander schreiben; Hinweis an andere Tabs per `BroadcastChannel('synq-cloud')`.
- Zwei eigene Geräte verhalten sich wie zwei Personen: gleiche Versions- und Konfliktregel. Jedes Gerät bzw. jeder getrennte Speicher (Safari-Tab und Home-Bildschirm-App) hat eine eigene Kennung `cloud:device` (einmal `crypto.randomUUID()`), die als `p_client` mitgeht. Die Konflikt-Fassungen zweier eigener Geräte auf demselben alten Stand liegen deshalb **getrennt** auf dem Server (VO-E11, lokal geprüft).

---

## 5. Realtime-Erlebnis (VO2)

- **Abos nach dem Anmelden** (ein Kanal `synq-db`): `projects` (INSERT/UPDATE), `collab_requests` (INSERT/UPDATE), `spaces` (UPDATE). RLS filtert je Empfänger (§2.5).
- **Partner speichert:** Toast „René hat ‚Song X‘ gespeichert“ (eigene Speicherungen nie). Höchstens ein Toast je Projekt und Minute; mehrere zusammengefasst: „René hat 3 Songs gespeichert“. Liste und Zähler „1 neu“ am Raum aktualisieren sich sofort, der Zähler verschwindet beim Öffnen des Raums (`cloud:seen`).
- **Mein offenes Projekt:** sauber und gestoppt → Toast mit [Laden]; ich spiele gerade → kein automatisches Laden (L8), nur Toast, Laden stoppt erst nach Tipp; ungesendete Änderungen → Konflikt (§4.5).
- **Was neu ist** *(P1)*: Nach dem Laden einer Partner-Fassung bekommen geänderte Clips 10 s einen gelben Rand (Vergleich je Slot, gepackter Clip-Text), keine neue Leiste.
- **Anfragen:** „David möchte mit dir Musik machen · [Ansehen]“; Annahme beim Partner → „René hat angenommen – Raum ‚Mit René‘ ist da“. Kommt René über Xanders Mitmach-Link, schickt er die Anfrage gleich nach „Konto anlegen“ mit einem Tipp (§6.1); bei Xander erscheint sie per Realtime ≤ 2 s, sonst beim nächsten Öffnen.
- **Ende:** „René hat die Zusammenarbeit beendet – eure Songs bleiben lesbar.“
- **Verpasste Ereignisse:** Realtime spielt nichts nach. Nach `visible`, Wiederverbindung oder Anmeldung holt SYNC deshalb die Kopfzeilen neu (`project_list` mit `updated_at > zuletzt gesehen`) und gleicht ab.
- **Anwesenheit** *(vorgezogen nach VO2 als Presence-light, Review r7; Feinheiten VO3)*: privater Kanal `space:<uuid>` mit Presence `{name, projekt}`; „René ist da“ am Raum, „René ist in ‚Song X‘“ an der Projektzeile; Aktualisierung höchstens 1/s, Weggang nach Ablauf der Presence. Policies auf `realtime.messages` in §3.3 (lokal geprüft: David kommt nicht in XR).
- **Kosten:** 3 Personen × 300 Speicherungen am Tag × 2 Empfänger ≈ 54 000 Nachrichten im Monat (Schätzung) bei 2 Mio. frei.

---

## 6. Oberfläche (deutsch, große Ziele, einfach zuerst)

Regeln: Trefferflächen ≥ 44×44 px im Hochformat, ≥ 40×36 px quer (L4); Eingabefelder mit Schrift ≥ 16 px, damit iOS beim Antippen nicht zoomt (eK); Kontofeld `type="email"` mit `autocomplete="username"`, `inputmode="email"`, `autocapitalize="off"`; Passwort `"current-password"` bzw. `"new-password"`; beides in einem echten `<form>` (§2.4, W7); keine neue Leiste in der Hauptansicht (Xander, S4); kein `alert/confirm` (I-06), Rückfragen als Zwei-Schritt-Knopf (`twoStep`).

### 6.1 Status am Menü-Knopf (P 390×844 und L 844×390)

```
P1  ┌──────────────────────────────────────────┐  Kopf 52 px, unverändert
    │ [Logo] [▶] [●] Takt 1.1 BPM 120 [♩] [≡•] │  • = 8-px-Punkt oben rechts am ≡ (Overlay,
    └──────────────────────────────────────────┘    verschiebt nichts): grün/blau/grau/orange
L1  ┌──────────────────────────────────────────────────────────────────────────────────┐ 44 px
    │ [Logo] [▶] [●] Takt 1.1  BPM 120 [♩]  Q 1/16  LÄNGE AUTO  FANG ⤓        [≡•]     │
    └──────────────────────────────────────────────────────────────────────────────────┘
```
Menü → neuer Abschnitt **„Online“** direkt unter „Projekt“: Statuszeile (Text aus §4.6) und [Online öffnen] (48 px) bzw. [Anmelden] im abgemeldeten Zustand.

**Erster Besuch über den Mitmach-Link** (Nachtrag 17.10., ersetzt den Einladungs-Link mit E-Mail): Jeder Angemeldete hat [Mein Link teilen] (§6.3). Der Link lautet `https://xanderfoxy.github.io/synquenzer/#mitmachen=<Freundes-Code>&von=<Name>` und enthält **keine E-Mail**. Startet die App mit diesem Hash, öffnet sich das Online-Blatt sofort im Modus „Konto anlegen“ mit der Kopfzeile „Xander möchte mit dir Musik machen. Leg ein Konto an, dann schickst du ihm eine Anfrage.“ (`von` nur als Text, höchstens 24 Zeichen, über `textContent`). Hat das Gerät schon `cloud:me`, startet das Segment auf „Anmelden“. Nach erfolgreichem Anlegen oder Anmelden sucht SYNC den Code (`find_user`) und zeigt die Karte „Xander · Code K7Q2MX · [Anfrage an Xander schicken]“; erst dieser Tipp schickt die Anfrage (O3: nichts passiert ohne Zustimmung, und Xander muss annehmen). Danach entfernt `history.replaceState` den Hash. Ungültiger oder gesperrter Code → „Dieser Link passt zu keinem Konto. Frag nach einem neuen Link.“

### 6.2 Anmelden / Konto anlegen (P)

```
┌──────────────────────────────────────────┐ y 52 – Blatt bis unten (Kopf bleibt, ▶ bedienbar)
│ Online                               [✕] │ 44
│ Deine Songs liegen dann auch online und  │
│ sind nach dem Neuladen nie weg.          │
│ ┌──────────────┬───────────────────────┐ │
│ │  Anmelden    │   Konto anlegen       │ │ 44  Segment
│ └──────────────┴───────────────────────┘ │
│ E-Mail                                   │
│ [ rene@beispiel.de                     ] │ 48
│ Passwort                                 │
│ [ ••••••••••               ] [zeigen]    │ 48
│ Dein Name (nur bei „Konto anlegen“)      │
│ [ René                                 ] │ 48  ≤ 24 Zeichen, Pflicht; so sehen dich Partner
│ [ ] Andere dürfen mich per Name finden   │ 44  Vorgabe aus (Code/Link geht immer)
│ [            Konto anlegen             ] │ 52  Hauptknopf
│ Jeder kann ein Konto anlegen. Deine      │
│ E-Mail sieht niemand.                    │
│ Passwort vergessen? Sag Xander Bescheid. │
└──────────────────────────────────────────┘
Mit Mitmach-Link: Kopfzeile „Xander möchte mit dir Musik machen. Leg ein Konto an, dann schickst du ihm eine Anfrage.“, Segment auf „Konto anlegen“.
Unter dem E-Mail-Feld bei „Konto anlegen“ (grau, 13 px): „Nimm deine echte E-Mail – sie ist dein Anmeldename.“
Turnstile-Feld (ab VO1, `CLOUD.captcha`, R3) zwischen Name und Hauptknopf (≈ 65 px), auch beim Anmelden; meist ohne Rätsel.
Bei offener Tastatur: Erklärtext ausblenden, aktives Feld und Hauptknopf per visualViewport-resize + scrollIntoView({block:'nearest'}) sichtbar halten (§6.10).
Fehlertexte (unter dem Knopf, rot): „Diese E-Mail hat schon ein Konto – tipp auf ‚Anmelden‘.“ ·
„Neue Konten sind gerade geschlossen. Sag Xander Bescheid.“ · „Gerade sind keine neuen Konten möglich. Sag Xander Bescheid.“ ·
„Heute wurden schon viele Konten angelegt. Bitte morgen noch mal.“ (429 der Bremse oder der Rate Limits) · „Bitte über den Mitmach-Link registrieren.“ (nur mit `signup_need_ref`) · „Bitte gib deinen Namen ein.“ · „Diesen Namen gibt es schon – nimm einen anderen.“ (`bad_name` beim Ändern) ·
„E-Mail oder Passwort stimmt nicht.“ · „Passwort: mindestens 8 Zeichen.“ · „Keine Verbindung – versuch es gleich noch mal.“
Die Texte der Bremse kommen wörtlich vom Server (Hook-Meldung); SYNC zeigt sie unverändert.
```
**Querformat L1 (844×390):**
```
┌─────────────────────────────────┬─────────────────────────────────────────────────┐
│ Online                       [✕]│ E-Mail                                          │ 40
│ Deine Songs liegen dann auch    │ [ rene@beispiel.de                    ]         │ 44
│ online und sind nach dem        │ Passwort                                        │
│ Neuladen nie weg.               │ [ ••••••••••              ] [zeigen]            │ 44
│ [ Anmelden ][ Konto anlegen ]   │ Dein Name: [ René                   ]           │ 44
│ Jeder kann ein Konto anlegen.   │ [ ] per Name findbar  [    Konto anlegen    ]   │ 44
│ Deine E-Mail sieht niemand.     │ Passwort vergessen? Sag Xander Bescheid.        │
└─────────────────────────────────┴─────────────────────────────────────────────────┘
 links clamp(220px, 35 %, 300px) · rechts Rest · Blatt 346 px hoch (L1); zweispaltig erst ab 700 px Breite (§6.10); die Tastatur schiebt nur die rechte Spalte
```

### 6.3 Online-Blatt: Profil, Räume (P, Sicht Xander)

```
┌──────────────────────────────────────────┐
│ Online                               [✕] │ 44
│ ● Online · gespeichert vor 1 min         │ 28  Statuszeile (§4.6)
│ Xander · K7Q2MX  [Name ✎] [Code kopieren]│ 44  unter 360 px zweizeilig (§6.10)
├──────────────────────────────────────────┤
│ ┌ Konflikt ────────────────────────────┐ │ nur wenn nötig, orange Rand
│ │ René hat „Song X“ geändert (17:42).  │ │
│ │ Deine Version bleibt in jedem Fall.  │ │
│ │ [ Übernehmen ]  [ Beide behalten ]   │ │ 48
│ └──────────────────────────────────────┘ │
│ Räume                                    │
│ [ Nur ich                    7 Songs › ] │ 56
│ [ Mit René · René ist online  3 · 1 neu›]│ 56
│ [ Mit David                  1 Song  › ] │ 56
│ [ + Zusammenarbeit anfragen            ] │ 48
│ Anfragen: keine offenen                  │ 24  (Karten wie 6.5b, wenn welche da sind)
│──────────────────────────────────────────│
│ [ Mein Link teilen ]  [ Papierkorb ]     │ 48  alle; „Wer ihn öffnet, kann dir eine Anfrage schicken.“
│ Speicher online: 12 % · [Aufräumen]      │ 24  nur Xander (Verwalter); Freunde sehen „Dein Platz: 8 %“
│ [ Konten (5) ]                           │ 44  nur Xander → §6.3b
│ [ Abmelden ]                             │ 44  Zwei-Schritt
└──────────────────────────────────────────┘
```

[Mein Link teilen] haben alle (offene Registrierung, VO-E13). Darunter steht: „Wer ihn öffnet, kann dir eine Anfrage schicken. Du entscheidest, ob du annimmst.“ Der Knopf öffnet das Teilen-Blatt (`navigator.share`, sonst Kopieren) mit dem Text „Mach mit mir Musik im SYNQUENZER: <Link>“. [Name ✎] öffnet auch den Schalter „Andere dürfen mich per Name finden“ (`set_profile(p_findable)`). [Aufräumen] ruft `admin_thin(90)` auf (automatische Versionen älter als 90 Tage → eine je Woche), Zwei-Schritt.

### 6.3b Konten (P, nur Xander/Verwalter; Nachtrag 17.10.)

```
┌──────────────────────────────────────────┐
│ ‹ Online   Konten                    [✕] │ 44
│ Neue Konten: offen · 5 von 12 · heute 1  │ 24  aus storage_report/admin_accounts
│ [ Xander · K7Q2MX · du         Verwalter]│ 48
│ [ René   · QZ4H7T · 9 Songs · 2 MB   ⋯ ] │ 48  ⋯: Vertrauen · Sperren · Sperren + Daten löschen · Code kopieren
│ [ David  · P3WQ8M · 3 Songs · 1 MB   ⋯ ] │ 48
│ [ Musiker· 7HJK2M · Probe 5 MB · 41 T⋯ ] │ 48  grau: Kandidat fürs Aufräumen; „Probe“ = ohne Raum mit dir
│ [ Spam   · W2ZX9Q · gesperrt         ⋯ ] │ 48  ⋯: Entsperren
│ [ Ungenutzte Konten aufräumen          ] │ 48  Probelauf → „1 Konto: Musiker. Löschen?“ (Zwei-Schritt)
│ Sperren zieht Anfragen zurück, beendet   │
│ Räume; das Konto liest nichts mehr.      │
└──────────────────────────────────────────┘
```
Keine E-Mail-Adressen in der Liste (`admin_accounts`). [Sperren]/[Entsperren] → `admin_block`, Zwei-Schritt „Spam sperren? Er kann dann nichts mehr speichern, anfragen oder lesen; eure gemeinsamen Räume enden.“. [Sperren + Daten löschen] → `admin_block(…, p_purge => true)`, Zwei-Schritt „Seine eigenen Songs und Sounds werden gelöscht. Gemeinsame Songs bleiben.“. [Vertrauen] → `admin_trust` (volle 60 MB ohne Raum, z. B. für René in VO1). [Ungenutzte Konten aufräumen] → `admin_cleanup(30, true)`, dann `admin_cleanup(30, false)`. Registrierung schließen/öffnen und Grenzen ändern bleiben bewusst beim Orchestrator (`private.settings`, R3), damit Xander nichts aus Versehen zumacht. Querformat: Liste rechts, Kopfzeile links wie §6.4 L1.

### 6.4 Projekte eines Raums (P)

```
┌──────────────────────────────────────────┐
│ ‹ Räume     Mit René                 [✕] │ 44
│ René ist da · in „Song X“                │ 24  (VO3)
│ [ Song X         René · heute 17:42  ⋯ ] │ 56  Tipp = öffnen, ⋯ = Blatt
│ [ Nachtfahrt     du · gestern 21:05  ⋯ ] │ 56
│ [ Strophe 2      René · 14.10. 18:30 ⋯ ] │ 56
│ [ + Neues Projekt in „Mit René“        ] │ 48
│ [ Offenes Projekt hierher teilen       ] │ 48  nur wenn es ein „Nur ich“-Projekt ist
│ [ Zusammenarbeit beenden               ] │ 44  Zwei-Schritt: „Wirklich beenden? Songs bleiben lesbar“
└──────────────────────────────────────────┘
⋯-Blatt einer Zeile: Öffnen · Versionen · Kopie in „Nur ich“ · In den Papierkorb. Die Kopie merkt sich den Raum (`p_origin`) und lässt sich nur dorthin zurück teilen (VO-E7).
```
Autor = wer zuletzt gespeichert hat („du“ für mich), Zeit wie `dayTime()` („heute 17:42“, „gestern 21:05“, „14.10. 18:30“).

**Querformat L1 (844×390), Online-Blatt zweispaltig:**
```
┌───────────────────────────────┬───────────────────────────────────────────────────┐
│ Online                     [✕]│ Mit René  · René ist da                           │ 40
│ ● Online · gespeichert        │ [ Song X           René · heute 17:42     ⋯ ]     │ 44
│ Xander · K7Q2MX  [Name ✎]     │ [ Nachtfahrt       du · gestern 21:05     ⋯ ]     │ 44
│ [ Nur ich             7 › ]   │ [ Strophe 2        René · 14.10. 18:30    ⋯ ]     │ 44
│ [ Mit René   1 neu    3 › ] ◄ │ [ + Neues Projekt ] [ Offenes Projekt teilen ]    │ 44
│ [ Mit David           1 › ]   │                                                   │
│ [ + Zusammenarbeit anfragen ] │ Anfragen: keine offenen                           │
│ [ Abmelden ]                  │                                                   │
└───────────────────────────────┴───────────────────────────────────────────────────┘
 links 300 px · rechts 544 px · Zeilen 44 px · Blatt 346 px hoch, nur die Listen scrollen
```

### 6.5 Zusammenarbeit anfragen (P)

```
┌──────────────────────────────────────────┐
│ ‹ Zurück   Zusammenarbeit anfragen       │ 44
│ Code oder genauer Name                   │
│ [ QZ4H7T                             ]   │ 48
│ [              Suchen               ]    │ 48
│ ┌──────────────────────────────────────┐ │
│ │ René · Code QZ4H7T                   │ │
│ │ Nachricht (freiwillig)               │ │
│ │ [ Lass uns Song X fertig machen! ]   │ │ 48  ≤ 140 Zeichen
│ │ [            Anfragen            ]   │ │ 48
│ └──────────────────────────────────────┘ │
│ René sieht erst nach seinem „Annehmen“   │
│ eure gemeinsamen Songs. Andere sehen     │
│ sie nie.                                 │
└──────────────────────────────────────────┘
Ergebnisse: „Anfrage geschickt“ · „Ihr arbeitet schon zusammen“ · „Du hast schon angefragt“ ·
„René hat abgelehnt – neue Anfrage morgen möglich“ · „Niemand gefunden. Tipp: Lass dir den Code oder Link schicken.“
```
**Querformat L1:**
```
┌─────────────────────────────────┬─────────────────────────────────────────────────┐
│ ‹ Zurück                        │ Code oder genauer Name                          │ 40
│ Zusammenarbeit anfragen         │ [ QZ4H7T                  ] [ Suchen ]          │ 44
│ René sieht erst nach seinem     │ René · Code QZ4H7T                              │
│ „Annehmen“ eure gemeinsamen     │ Nachricht: [ Lass uns Song X fertig… ]          │ 44
│ Songs. Andere sehen sie nie.    │ [             Anfragen               ]          │ 44
└─────────────────────────────────┴─────────────────────────────────────────────────┘
 Querformat L1: Suche und Ergebnis rechts, Erklärung links
```
Suche nur exakt: Freundes-Code oder genauer Name (nur wer „per Name findbar“ eingeschaltet hat, Vorgabe aus). **Keine Suche per E-Mail** (VO-E15; ein „@“ liefert „Niemand gefunden“). Ein Name liefert nur bei **genau einem** Treffer eine Person; sonst „Mehrere heißen so – bitte Code oder Link“ (Review r7, Doppelgänger). Der einfachste Weg bleibt der Mitmach-Link (§6.1). Ergebnis zusätzlich: „Bitte morgen noch mal“ (`slow_down`, höchstens 3 Anfragen je Person und Tag). Die Ergebniskarte zeigt immer den Freundes-Code.

### 6.5b Eingehende Anfrage (P, Sicht René)

```
┌──────────────────────────────────────────┐
│ Online                               [✕] │ 44
│ ● Online                                 │ 28
│ ┌ Anfrage ─────────────────────────────┐ │
│ │ Xander ✓ Verwalter möchte mit dir    │ │
│ │ Musik machen.                        │ │
│ │ Code  K7Q2MX   (Code vergleichen)    │ │ 28  Code 20 px fett
│ │ [ Annehmen ]       [ Ablehnen ]      │ │ 48
│ └──────────────────────────────────────┘ │
│ ┌ Anfrage ─────────────────────────────┐ │
│ │ David möchte mit dir Musik machen.   │ │
│ │ Code P3WQ8M                          │ │
│ │ [ Annehmen ]       [ Ablehnen ]      │ │ 48
│ └──────────────────────────────────────┘ │
│ Räume                                    │
│ [ Nur ich                    4 Songs › ] │ 56
└──────────────────────────────────────────┘
Nach „Annehmen“ erscheint sofort [ Mit Xander › ] bei René und [ Mit René › ] bei Xander (Realtime, ≤ 2 s).
Eigene gesendete Anfragen stehen darunter als „Gesendet: <Name> antwortet noch · [Zurückziehen]“ (in diesem Szenario hat René keine).
```
„✓ Verwalter“ kommt aus dem Server-Feld `profiles.is_admin` (nur per Trigger aus `private.admins`), nie aus dem Namen; ein „Xаnder“ mit kyrillischem а hat kein ✓. Den Code kennt René aus Xanders WhatsApp-Link. Toast bei René, wenn die Anfrage kommt: „Xander möchte mit dir Musik machen · [Ansehen]“. Beim Mitmach-Link ist es umgekehrt: René schickt, Xander bekommt Toast und Karte „René möchte mit dir Musik machen · über deinen Link“ (der Zusatz ist die Anfrage-Notiz, die SYNC beim Link-Ablauf als `p_note = 'über deinen Link'` mitschickt).

### 6.6 Teilen / verschieben (P)

```
┌──────────────────────────────────────────┐
│ „Nachtfahrt“ teilen                  [✕] │
│ [ Mit René                             ] │ 56
│ [ Mit David                            ] │ 56
│ Nach dem Teilen arbeitet René mit. Das   │
│ Projekt bleibt in diesem Raum; für dich  │
│ allein geht jederzeit „Kopie in Nur ich“.│
└──────────────────────────────────────────┘
```
Nur für eigene „Nur ich“-Projekte; zwischen Räumen gibt es kein Verschieben (VO-E7). Eine Kopie aus einem Raum zeigt nur diesen Raum; die anderen Zeilen sind grau mit „Enthält Beiträge aus ‚Mit René‘ – kann nur dort geteilt werden.“

### 6.7 Versionen (P)

```
┌──────────────────────────────────────────┐
│ ‹ Song X   Versionen                     │
│ [ heute 17:42  René                   ⋯ ]│ 56  ⋯: Als Kopie öffnen · Zurückholen
│ [ heute 17:41  du · gleichzeitig      ⋯ ]│ 56  (conflict)
│ [ heute 17:30  du · Übergabe          ⋯ ]│ 56  (handover)
│ [ heute 17:10  du · automatisch       ⋯ ]│ 56
│ [ Diese Version merken                 ] │ 48  → mark_version
└──────────────────────────────────────────┘
„Zurückholen“ = erst „Vor Wiederherstellen“ merken, dann den alten Stand als neue Version speichern (nichts verschwindet).
```

### 6.8 Abmelden und Viewer-Hinweis

- [Abmelden] → Zwei-Schritt „Wirklich abmelden?“; mit wartenden Änderungen: „Noch 2 Änderungen nicht online – trotzdem abmelden?“. Lokale Projekte bleiben auf dem Gerät, gehören aber weiter zum abgemeldeten Konto (`meta.uid`). Meldet sich danach ein anderes Konto an, gilt die Karte aus §4.4 („Auf diesem Gerät liegen 5 Songs von Xander …“). Token-Schlüssel (`synq-auth`) wird gelöscht; `cloud:outbox:<uid>` bleibt für die nächste Anmeldung desselben Kontos.
- Viewer (P und L): grauer Punkt, „Nur auf diesem Gerät – nicht online“, [In Safari öffnen und mitnehmen] (§4.7).

### 6.9 Neue Wörter und Hilfe-Zeilen (L5, L10)

| Begriff | Bedeutung |
|---|---|
| **ONLINE** | Speichern auf dem Server und Zusammenarbeit (Safari-Version) |
| **RAUM** | Gemeinsamer Ort für genau zwei Personen („Mit René“); „Nur ich“ = privat |
| **ANFRAGE** | Bitte um Zusammenarbeit, erst nach „Annehmen“ gibt es den Raum |
| **VERSION** | ein gespeicherter Stand eines Songs im Online-Verlauf (in der Oberfläche durchgehend „Version“, nie „Fassung“) |
| **FREUNDES-CODE** | 6 Zeichen, mit denen man jemanden findet, ohne die E-Mail zu kennen |
| **MITMACH-LINK** | Adresse der Safari-Version mit dem eigenen Freundes-Code; wer sie öffnet, legt ein Konto an und kann eine Anfrage schicken |
| **KONTEN** | Liste aller Konten, nur für Xander: sperren, aufräumen |

Hilfe (Menü → Hilfe, je eine Zeile): „Online: Deine Songs liegen zusätzlich auf dem Server, nach dem Neuladen ist nichts weg.“ · „Mit René: Nur ihr beide seht diese Songs.“ · „Haben zwei gleichzeitig geändert, entscheidest du: übernehmen oder beide behalten.“ · „In der Claude-App ist Online aus; öffne die Safari-Version.“

### 6.10 Kleine Bildschirme und Tastatur (Review r7)

| Regel | Wert |
|---|---|
| Blatt | scrollt senkrecht; die Kopfzeile mit [✕] bleibt stehen (`position: sticky`), Ziel ≥ 44 px |
| Profilzeile | unter 360 px Breite zweizeilig: „Xander · K7Q2MX“, darunter [Name ✎] [Code kopieren] (bei 320 px stehen nur 288 px zur Verfügung, gebraucht ≈ 300 px) |
| Raumzeilen | unter 360 px ohne das Wort „Songs“ („3 · 1 neu“); „René ist online“ kürzt zu „online“ |
| Projektzeilen | Titel einzeilig mit `text-overflow: ellipsis`; Autor und Zeit rechts mit fester Breite, unter 360 px nur die Zeit |
| Tastatur | bei `visualViewport`-resize das aktive Feld und den Hauptknopf per `scrollIntoView({block: 'nearest'})` holen; im Anmelde-Blatt den Erklärtext ausblenden |
| Querformat | zweispaltig erst ab 700 px Breite, links `clamp(220px, 35%, 300px)`; darunter einspaltig wie Hochformat |
| Online-Blatt mit Konfliktkarte | ≈ 640 px hoch; bei 568 − 52 = 516 px scrollt das Blatt, die Konfliktkarte steht oben |

---

## 7. Einbau in die App

### 7.1 Berührungspunkte (Zeilen in `synq-snapshots/V0a.html`, Suche über den Namen)

| Stelle | Z. | Änderung |
|---|---|---|
| `SQStore.Autosave` → Option `onWritten(snap)` | 5547 | schon vorhanden; `boot()` übergibt `onWritten: snap => SYNC.onLocalWrite(snap)` |
| `boot()` | 17115 | nach `BOOT.done`: `SYNC.init()` (lädt nichts ohne Sitzung) |
| `applyProject()` | 16828 | meldet Projektwechsel an SYNC (`SYNC.onSwitch(oldId, S.id)`); keine Änderung am Undo |
| `parkFile`, `switchProjectUI`, `openProject`, `projectsList`, `deleteProject`, `renameProject`, `duplicateProject` | 16887–16991 | SYNC-Metadaten mitführen; Löschen → `trash_project` (Papierkorb) statt still; die Liste markiert Projekte, die online liegen („online“) |
| `projectFileObj()`, neues `SQStore.fileTextFromPacked(proj, appVersion)` | 16788 | Hülle aus gepacktem Projekt mit **einem** Stringify (§4.2) |
| `projFromFile()` / `SQStore.parseFile` | 17017 | Laden vom Server, inkl. Migration |
| `storageStatus()`, `openMenu()` Abschnitt „Projekt“ | 16539, 16550 | Statuszeile, neuer Abschnitt „Online“ |
| `toast()` | 12077 | unverändert genutzt (≤ 2 Aktionen) |
| `#bMenu` im Kopf | 2435 | Status-Punkt als Overlay (CSS `::after`), keine Layout-Änderung |
| `deliverNow()` | 17369 | unverändert; [Alles sichern] nutzt es |
| `VERSION` | 7605 | `APP_CODE = Major·1e6 + Minor·1e3 + Patch` |
| Test-API `window.SYNQUENZER` | 17819 | Ergänzungen §7.6 |

### 7.2 Modul `SYNC` (neu, ein Block wie `SQStore`)

```js
const CLOUD = {url: 'https://<ref>.supabase.co', key: 'sb_publishable_…',            // Rollout §8, Schritt R6
  origin: 'https://xanderfoxy.github.io', storageKey: 'synq-auth',                     // Online nur unter dieser Herkunft (§2.7)
  captcha: {provider: 'turnstile', siteKey: '…'},   // ab VO1 (R3): captchaToken an signUp/signIn (§2.4b)
  lib: {local: 'vendor/supabase-js-2.117.2.umd.js',
        cdn: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js',
        sri: 'sha384-Rj26LVGvoeRVR6+mwQmFfcR3QOBEwT+ZmuCWpuiqeTzJpCs0ER4ITAWGb4Hiy3Ok'}};
const SYNC = {
  state,              // 'viewer'|'signedOut'|'online'|'syncing'|'offline'|'paused'|'error'
  init(), useClient(factory),                 // useClient nur für Tests (FakeSupa statt supabase-js)
  signUp(email, pw, name, findable), signIn(email, pw), signOut(), setPassword(pw),   // signUp wie im Klassenzimmer: options.data.display_name
  onLocalWrite(snap), onSwitch(oldId, newId), push(lid), flush(),
  pullHeads(since), open(sid), reconcile(lid),
  share(lid, spaceId), copyToPrivate(sid), resolve(lid, 'take'|'both'), versions(sid), restore(versionId),
  saveLibrary(), importFromHash(), viewerHandoff(),                              // save_library mit Sperre; #import / #mitmachen=<Code>; Viewer → Safari
  findUser(q), request(userId, note), respond(reqId, accept), cancel(reqId), endCollab(spaceId), shareLink(),
  admin: {accounts(), block(userId, on, purge), trust(userId, on), cleanup(dry)}, // nur Verwalter (§6.3b)
  subscribe(), unsubscribe(), presence(spaceId, on)                                  // presence: VO3
};
```
KV-Schlüssel (gleiche IndexedDB wie heute): `cloud:device` (Geräte-Kennung, einmal `crypto.randomUUID()`), `cloud:meta:<lid>` (mit `uid`), `cloud:outbox:<uid>`, `cloud:lib:<uid>` (`{base}` der Bibliothek), `cloud:me` (`{uid, name, code, admin}` für die Anzeige offline), `cloud:seen:<uid>` (je Raum zuletzt gesehen). Die Sitzung selbst liegt bei supabase-js (`localStorage`, Schlüssel `synq-auth` über `auth.storageKey`); SYNC lädt supabase-js beim Start nur, wenn dieser Schlüssel existiert **und** `location.origin === CLOUD.origin`. Dazu `sw.js` neben `index.html` (§2.7).

### 7.3 Projektformat, Migration, Versionen

- Das Projekt (`S`) bekommt **kein** neues Feld. Cloud-Daten liegen in eigenen KV-Schlüsseln. Damit bleiben `serializeProject`, Prüfsumme, M-REKON und `HIST.volatile` (VC2a) unberührt.
- Hochgeladen wird die Hülle mit `format` und `appVersion`; geladen wird über `parseFile` → Migrationen wie beim Datei-Öffnen. Ab V2a (Format 4) setzt der Server `format = 4`; ältere Seiten bekommen `outdated` statt zu überschreiben (VO-R1).
- **Regel VO-R1 (gilt für jedes spätere Paket):** Wer `PROJECT_FORMAT` erhöht oder neue Projektfelder einführt, erhöht die App-Version; nichts weiter zu tun, der Wächter greift über `p_format`/`p_app`.

### 7.4 Undo und Verlauf bleiben unberührt

- SYNC ruft nie `undoPush`, `undo`, `redo` auf. Hochladen ändert nichts am Projekt.
- Laden einer Partner-Fassung = Projekt öffnen über `switchProjectUI` (wie heute `[Projekte]`): Wiedergabe stoppt, Undo-Stapel beginnt neu, das bisherige Projekt wird vorher geparkt und als lokaler Schnappschuss (`autosave.snapshotNow()`) aufgehoben.
- VC2a (Verlauf-Rekorder, später): Ein geladener Partner-Stand gilt wie ein Import → neuer Keyframe. Server-Fassungen und VC2a-Ereignisse ergänzen sich.

### 7.5 Größe und CPU

- **Datei:** VO1 ≤ +35 KB, VO2 ≤ +30 KB, VO3 ≤ +20 KB in `index.html` (Schätzung; Budget-Regel §15.3/C.4). supabase-js liegt **außerhalb** (`vendor/`, 218 KB roh, 55 KB gzip) und wird nur online geladen.
- **Start:** ohne gespeicherte Sitzung lädt nichts Neues; Abnahme wie §15.3 (≤ +150 ms gegen den Vorgänger, Ziel ≤ +20 ms).
- **CPU:** kein Worklet-Code; je Push ein Stringify (gemessen 0,6–13 ms Xeon je nach Größe) plus `fetch`; Realtime-Nachrichten < 1 KB; Laden einer Fassung = Parsen (gemessen 0,05–1,2 ms) + `applyProject`. PE1 darf sich nicht ändern (N8O-18).

### 7.6 Test-API (Ergänzung zu §16 / Teil D)

```ts
cloud(): {state, user: {id, name, code}|null, outbox: number, conflict: string[], spaces: {id, partner, status, unseen}[]}
cloudSignUp(email, pw, name, findable?): Promise<'ok'|'exists'|'closed'|'full'|'slow'|'no_name'|'weak'|'error'>   // closed/full/slow = Anmelde-Bremse 403/403/429
cloudLink(): string   ·   cloudJoin(code): Promise<'sent'|'unknown'|'already'|'pending'>   // Mitmach-Link
cloudAdmin(): {accounts(): Promise<object[]>, block(id, on, purge?): Promise<string>, trust(id, on): Promise<string>, cleanup(dry): Promise<{count, names}>}
cloudSignIn(email, pw): Promise<'ok'|'bad'|'error'>   ·   cloudSignOut(force?: boolean): Promise<'ok'|'pending'>
cloudSync(): Promise<{pushed: number, pulled: number}>      // flush + pullHeads
cloudProjects(spaceId?: string|null): Promise<{sid, title, owner, updatedBy, updatedAt, version, mine: boolean}[]>
cloudOpen(sid): Promise<void>   ·   cloudShare(spaceId): Promise<string>   ·   cloudResolve('take'|'both'): Promise<void>
cloudFind(q): Promise<{id, name, code, isAdmin}[]>   ·   cloudRequest(id, note?) / cloudRespond(reqId, accept) / cloudEnd(spaceId)
cloudVersions(sid): Promise<{id, kind, by, at}[]>   ·   cloudRestore(versionId): Promise<void>
cloudUseFake(handle): void                               // nur Tests: FakeSupa-Brücke statt supabase-js
```
`runtime()` bekommt `cloud: {state, outbox}`; `noteLog` bleibt.

### 7.7 Testplan (berührt nie das echte Projekt)

| Stufe | Werkzeug | Inhalt |
|---|---|---|
| T1 SQL | `online-test/rls-matrix.mjs` (Node, PGlite + Shim) | jede Policy und RPC; jede neue RPC bekommt eigene Fälle; muss 100 % bestehen |
| T2 Sync-Logik | `fake-supa.mjs` (Prototyp, 11/11) in Node | Push/Pull/Konflikt/Outbox gegen echte SQL-Logik; Fehler-Einspeisung `offline`, `paused` (540), `failNext` (503), `latencyMs` |
| T3 Browser | Playwright/Chromium wie v2/v3; `addInitScript` setzt eine Fake-Global `supabase` mit `createClient`, deren Aufrufe per `page.exposeFunction('__fakeSupa', …)` an **einen** FakeSupa-Backend in Node gehen; mehrere Kontexte = Xander, René, David | Abläufe, Realtime-Toasts, O3 im DOM, Neuladen, Konflikt-UI, M-PLATZ |
| T3b Offline | Playwright `context.setOffline(true)` nach dem ersten Laden, dann `page.reload()` | `sw.js`: App startet mit dem letzten Projekt, Punkt grau |
| T4 Netz-Sperre | `page.route('**/*.supabase.co/**', r => r.abort())`, Zähler muss 0 bleiben; `page.route('**/cdn.jsdelivr.net/**')` liefert die lokale `vendor`-Datei | Garantie: kein echter Netzverkehr in Tests |
| T5 iPhone (Xander) | Prüfpunkte in CHANGES | 3–5 Punkte je Paket, z. B. Konto anlegen, Neuladen, zweites Gerät, Partner speichert; dazu einmal: öffnet [In Safari öffnen und mitnehmen] aus der Claude-App wirklich Safari? Bietet Safari „Passwort sichern“ an? |

### 7.8 Abnahme-Checkliste

**VO1**
- [ ] N8O-01 Viewer: Mit `window.claude.use`-Attrappe im Rahmen ist `cloud().state === 'viewer'`; 0 Anfragen an `*.supabase.co` und an supabase-js (Anfrage-Protokoll); grauer Punkt dauerhaft, Zeile „Nur auf diesem Gerät – nicht online“, [In Safari öffnen und mitnehmen] öffnet `<Adresse>#import=…`; die Safari-Version importiert daraus ein deep-equal Projekt und entfernt den Hash.
- [ ] N8O-02 Ohne gespeicherte Sitzung lädt der Start weder `vendor/…` noch jsDelivr (0 Anfragen); Startzeit nach §15.3 (≤ +150 ms, Median aus 5).
- [ ] N8O-03 supabase-js nur mit passendem SRI: eine um 1 Byte veränderte `vendor`-Datei wird verworfen; Zustand `error` mit Text „Online gerade nicht verfügbar“, lokal läuft alles weiter.
- [ ] N8O-04 Konto anlegen (Fake, offene Registrierung): beliebige neue E-Mail + Passwort + Name → Sitzung sofort da, Profil mit Name (≤ 24 Zeichen), `findable` aus, außer der Schalter war an; `signUp` bekommt `options.data.display_name`; ohne Name → „Bitte gib deinen Namen ein.“, kein Aufruf; Passwort < 8 → Text, kein Aufruf; vorhandene E-Mail → „Diese E-Mail hat schon ein Konto …“, Segment springt auf „Anmelden“; Konto sieht 0 Räume, 0 Anfragen.
- [ ] N8O-04b Anmelde-Bremse (Fake mit Hook): `signup_open = false` → Text „Neue Konten sind gerade geschlossen …“ wörtlich vom Server, keine Sitzung; `max_accounts` erreicht → „Gerade sind keine neuen Konten möglich …“; 429 → „Heute wurden schon viele Konten angelegt …“; `captchaToken` geht an `signUp` **und** `signInWithPassword` (Attrappe), ohne Token kein Aufruf und Text „Bitte kurz bestätigen, dass du kein Roboter bist.“; ohne gespeicherte Sitzung und ohne geöffnetes Anmelde-Blatt lädt die Seite kein Turnstile-Skript (Anfrage-Protokoll); `bad_name` beim Namen ändern → Text aus §6.2, Name unverändert; `slow_down` bei Suche → „Bitte kurz warten.“.
- [ ] N8O-04c Passwort ändern (angemeldet): [Name ✎] → [Passwort ändern] ruft `auth.updateUser({password})`; Text „Passwort vergessen? Sag Xander Bescheid.“ steht im Anmelde-Blatt; kein `resetPasswordForEmail`-Aufruf irgendwo (Spion), solange kein SMTP eingerichtet ist.
- [ ] N8O-05 Sitzung überlebt Neuladen; [Abmelden] mit wartenden Änderungen zeigt die Zwei-Schritt-Frage; nach dem Abmelden sind alle lokalen Projekte deep-equal vorhanden und `synq-auth` ist gelöscht. Auf einer anderen Herkunft (githack-Attrappe) lädt SYNC supabase-js nie.
- [ ] N8O-06 Erst-Abgleich: 1 offenes + 2 geparkte Projekte → genau 3 `save_project`-Anlagen; zweites Anmelden → 0; gleiche `local_id` schon auf dem Server → verknüpft, kein Doppel; ein unberührtes Demo-Projekt (`isPristine`) → 0 Anlagen.
- [ ] N8O-06b Kontowechsel: X meldet sich ab (mit 1 wartendem und 2 nie hochgeladenen Projekten), R meldet sich an → **0** `save_project`-Aufrufe für X-Projekte, Karte „Auf diesem Gerät liegen 3 Songs von Xander …“; kein X-Projekt bekommt `lost`; X meldet sich wieder an → die wartende Änderung geht hoch.
- [ ] N8O-07 Server-Autosave: 1 Änderung → genau 1 `save_project` nach 2,0–3,0 s; 20 Änderungen in 10 s → ≤ 2 Aufrufe; 40 s Dauer-Änderung → Abstand ≤ 15 s; beim Spielen ≤ 1 Aufruf je 30 s und `tickAhead` vor dem Bau des Textes (Spion).
- [ ] N8O-08 Je Push höchstens **ein** `JSON.stringify` mit mehr als 50 KB Ergebnis (Spion); Hauptthread-Zeit je Push des großen Projekts ≤ 15 ms (Xeon, Median).
- [ ] N8O-09 Neuladen 300 ms nach einer Änderung (vor dem Push): lokaler Stand deep-equal; nach dem Start lädt die Warteschlange hoch; Server-md5 = lokaler Text.
- [ ] N8O-10 Gelöschter Speicher (IndexedDB und localStorage leer, Start daher mit Demo-Projekt): nach dem Anmelden ist ohne Rückfrage das zuletzt geänderte Server-Projekt offen, deep-equal (ohne `HIST.volatile`), Toast „Deine Songs sind da …“; das Demo wurde nicht hochgeladen (0 `created` mit Demo-Inhalt).
- [ ] N8O-11 Start-Abgleich: alle 6 Zeilen der Tabelle §4.4 je ein Lauf, jeweils mit der dort genannten Handlung.
- [ ] N8O-12 Offline 60 s mit 30 Änderungen: kein Fehler in der Konsole, Punkt grau, Warteschlange 1 Eintrag je Projekt; wieder online → je Projekt genau 1 Push innerhalb 5 s; Server = lokal.
- [ ] N8O-13 Server schläft (540): Text laut §4.6 je Person (Freund: [Xander Bescheid sagen]; Xander: [Supabase öffnen] mit Dashboard-Link), höchstens 1 Versuch je 5 min, lokal unverändert; einmal am Tag [Alles sichern].
- [ ] N8O-14 Versionen: Liste mit Art, Autor, Zeit; [Zurückholen] erzeugt `manual` „Vor Wiederherstellen“ und eine neue Version; [Als Kopie öffnen] erzeugt ein neues Projekt.
- [ ] N8O-15 Versions-Wächter: `outdated` → Banner „René benutzt eine neuere SYNQUENZER-Version. [Jetzt neu laden] …“; [Jetzt neu laden] ruft `location.replace` mit `?v=<Zeit>` und erhaltenem Hash; Auto-Push für das Projekt aus (≤ 1 Aufruf je 60 s), Fassung auf dem Server aufgehoben. `bad_version` → Hinweis „… noch nicht freigeschaltet“, lokal weiter.
- [ ] N8O-16 Eigene Sounds: Upload 5 s nach Änderung über `save_library`; Gerät A lädt {s1,s2}, Gerät B (Stand vor s2) lädt {s1,s3} → B bekommt `conflict`, führt zusammen, Server = {s1,s2,s3}; keine Doppel, kein Verlust.
- [ ] N8O-17 Undo: Push/Pull ändern `gestures().undo/redo` nicht; alle bisherigen Undo-Tests bestehen unverändert.
- [ ] N8O-18 PE1 mit Sync: großes Projekt, Fake-Latenz 300 ms, Push alle 2 s während 10 s Wiedergabe: rAF ≥ 55 fps (Median), keine `longtask` > 50 ms, `tick`-p95 ≤ 4 ms.
- [ ] N8O-19 Größe: `index.html` +≤ 35 KB; `vendor/supabase-js-2.117.2.umd.js` = 217 945 B mit dem SRI-Wert aus §2.3.
- [ ] N8O-20 M-PLATZ für Anmelde- und Online-Blatt in P1, P2, P3, L1, L2, W **und** 375×667, 320×568, 667×375, jeweils auch mit offener Tastatur (Attrappe über `visualViewport`); kein waagerechter Überlauf, Hauptknopf sichtbar; Regeln §6.10; Trefferflächen nach L4; Eingabefelder ≥ 16 px Schrift; `autocomplete="username"` am Kontofeld, echtes `<form>`.
- [ ] N8O-20b Offline neu laden: Seite laden, Netz aus, neu laden → App startet mit dem letzten Projekt, Punkt grau (T3b).

**VO2**
- [ ] N8O-21 `rls-matrix.mjs` gegen die eingebaute Migration: alle Fälle bestanden (heute 123); neue RPCs mit eigenen Fällen.
- [ ] N8O-22 Anfragen im UI: Suche per Code und genauem Namen (nur bei „findbar“); Eingabe mit „@“ → „Niemand gefunden …“ ohne Server-Treffer; doppelter Name → „Mehrere heißen so …“; 4. Anfrage am Tag an dieselbe Person → „Bitte morgen noch mal“; Anfrage → Gegenseite hat Toast und Karte ≤ 2 s; [Annehmen] → beide sehen den Raum ≤ 2 s; [Ablehnen] → Anfragender sieht „abgelehnt“, neue Anfrage erst nach 24 h.
- [ ] N8O-23 O3 im UI mit drei Kontexten nach XR und XD: Davids DOM und alle Antworten an David enthalten keinen Titel und keine ID aus XR (Text- und Antwort-Suche); nach DR sieht David DR, weiter nicht XR.
- [ ] N8O-24 Teilen „Nur ich → Mit René“ (nur Eigentümer): René sieht es ≤ 2 s; ein Verschieben zwischen Räumen wird nicht angeboten; eine „Kopie in Nur ich“ aus „Mit René“ lässt sich nicht mit David teilen (Zeile grau, Server `mixed_origin`).
- [ ] N8O-25 Partner speichert: Toast „René hat ‚Song X‘ gespeichert“ ≤ 2 s; 5 Speicherungen in 60 s → 1 Toast, Liste 5-mal aktuell; eigene Speicherungen ohne Toast.
- [ ] N8O-26 Offenes Projekt, Partner speichert: gestoppt und sauber → Toast mit [Laden]; beim Spielen kein automatisches Laden (`noteLog` unverändert bis zum Tipp).
- [ ] N8O-27 Konflikt: beide ändern; Toast „René hat ‚Song X‘ geändert · [Übernehmen] [Beide behalten]“ und Karte im Online-Blatt. **Danach 5 min weiterarbeiten** (Push läuft weiter, Erinnerung nach 10 min), dann Übernehmen → lokal = Server, meine Konflikt-Fassung auf dem Server hat den md5 des **letzten** lokalen Stands; Beide behalten → neues Projekt „Song X (Xanders Version)“ im Raum mit dem letzten lokalen Stand; danach drei Stände abrufbar. Konflikt nur über Realtime erkannt → sofortiger Push, Konflikt-Fassung liegt auf dem Server.
- [ ] N8O-27b Zwei eigene Geräte (zwei Kontexte, verschiedene `cloud:device`) ändern auf demselben alten Stand → zwei getrennte Konflikt-Fassungen auf dem Server.
- [ ] N8O-27c Presence-light: René hat „Song X“ offen; Xander tippt „Song X“ → Karte „René arbeitet gerade an ‚Song X‘. [Trotzdem öffnen] [Als Kopie öffnen]“.
- [ ] N8O-28 Zusammenarbeit beenden (Zwei-Schritt): beide sehen „nur lesen“; Speichern → Fassung aufgehoben (`readonly`); [Kopie in „Nur ich“] erzeugt ein eigenes Projekt.
- [ ] N8O-29 Verpasste Ereignisse: während `hidden` liefert der Fake nichts; nach `visible` stimmt die Liste ≤ 3 s.
- [ ] N8O-30 Mitmach-Link: [Mein Link teilen] (bei allen) erzeugt `…#mitmachen=<Code>&von=<Name>` ohne „@“; der Link öffnet bei René das Blatt „Konto anlegen“ mit der Kopfzeile „Xander möchte mit dir Musik machen …“; nach dem Anlegen zeigt die Karte „Xander · Code … · [Anfrage an Xander schicken]“, **ohne Tipp geht keine Anfrage raus** (0 `request_collab`); nach dem Tipp hat Xander Toast und Karte ≤ 2 s, nach [Annehmen] beide den Raum; der Hash ist danach weg; ein ungültiger Code → „Dieser Link passt zu keinem Konto …“; derselbe Link auf einem Gerät mit Sitzung → Segment „Anmelden“ übersprungen, gleich die Karte.
- [ ] N8O-30b Konten-Blatt (nur Xander): René und David sehen [Konten] nicht und bekommen bei `admin_*` 42501; Liste ohne E-Mail-Adressen; [Sperren] (Zwei-Schritt) → offene Anfragen des Kontos verschwinden bei Xander ≤ 2 s, das gesperrte Konto bekommt beim Speichern „Dein Konto ist gesperrt. Deine Songs bleiben auf diesem Gerät.“, lokal geht nichts verloren, neue Versuche höchstens einmal je Stunde; [Ungenutzte Konten aufräumen] zeigt erst den Probelauf mit Namen, löscht erst nach dem zweiten Tipp.

**VO3 (optional)**
- [ ] N8O-31 Presence (Feinheiten zu N8O-27c): Partner online → „René ist da“ ≤ 3 s; weg → ≤ 35 s entfernt; ≤ 1 Presence-Nachricht/s je Gerät.
- [ ] N8O-32 Presence-Rechte: David kommt nicht in den Kanal `space:<XR>` (Fake mit Policy-Prüfung wie §3.4).
- [ ] N8O-33 Sounds im Raum: teilen (≤ 64 KB), laden über `normalizeSound`, für Nicht-Mitglieder unsichtbar.
- [ ] N8O-34 Jam-Brücke: Abnahme VC3-01…VC3-12 mit Supabase-Broadcast statt `room` (Fake mit einstellbarer Laufzeit).

---

## 8. Rollout (Orchestrator)

Jeder Schritt mit Zustandsänderung erst nach **Xanders ausdrücklichem Okay**. Nie im Projekt „XanderFoxy's Project“ (Klassenzimmer, eu-west-2).

| # | Schritt | Wie | Prüfen |
|---|---|---|---|
| R0 | Xanders Entscheidungen | eigene Organisation (empfohlen) · Region Frankfurt `eu-central-1` (nahe an Deutschland, eK) · Login E-Mail + Passwort mit **offener Registrierung** (entschieden 17.10.; E-Mails von René/David werden **nicht** gebraucht) · **eigene Adresse** (GitHub Pages, F6) · Wach-Ping (Vorgabe ja) | Antworten in `fragen-xander-*.md` |
| R0b | Eigene Herkunft | Repo `xanderfoxy/synquenzer` (öffentlich) mit GitHub Pages aus `main`; vorher den Gültigkeitsbereich von `sw.js` des Klassenzimmers prüfen (darf `/synquenzer/` nicht abdecken) | `https://xanderfoxy.github.io/synquenzer/` lädt die App; ohne das wird Online nicht ausgeliefert |
| R1 | Organisation „SYNQUENZER“ (Free) und Projekt „synquenzer“ anlegen | Dashboard oder Supabase-MCP `create_project`; Datenbank-Passwort in Xanders Passwort-Manager. *Laut `fragen-xander-9.md` am 17.10. angelegt (eu-central-1); dieser Entwurf hat es weder geöffnet noch geprüft.* | MCP `list_projects`: zwei Projekte, das neue mit eigener `ref` |
| R2 | Migration `vo_init` = `online-schema.sql` | MCP `apply_migration` **mit der `ref` des neuen Projekts** (vorher zweimal vergleichen) | `list_tables` zeigt 9 Tabellen; `get_advisors(security)`: kein ERROR, WARN 0029 für die RPCs ist gewollt |
| R3 | Auth einstellen (offene Registrierung) | Dashboard: Authentication → Sign In / Providers → Email an, **„Allow new users to sign up“ an** (Name des Schalters eK), **Confirm email aus** (§2.4), Mindestlänge 8 · URL Configuration: Site URL und Redirect URL = Pages-Adresse (R0b) · Rate Limits: Vorgaben lassen (S24; für Passwort-Registrierung ohne Mail ohne IP-Grenze) · **Anmelde-Bremse (Pflicht):** Hooks → „Before User Created“ → Postgres → `public.hook_before_user_created`; Grenzen bei Bedarf per Migration: `update private.settings set max_accounts = …, max_signups_day = …, signup_open = …, signup_need_ref = …` · **CAPTCHA (Pflicht ab VO1, vorher R3b):** Cloudflare-Konto (kostenlos) → Turnstile-Widget für `xanderfoxy.github.io` → Site Key + Secret Key · Authentication → Bot and Abuse Protection → „Enable CAPTCHA protection“ → Turnstile + Secret Key · **gleichzeitig** die erste Online-Version mit `CLOUD.captcha = {provider: 'turnstile', siteKey}` ausliefern (R7), weil danach jede Anmeldung ein Token braucht (S25) | Xander legt am iPhone ein Testkonto ohne Einladung an (mit Turnstile) → klappt sofort; **Pflicht-Probe:** mit `signup_open = false` scheitert die Registrierung am iPhone mit „Neue Konten sind gerade geschlossen …“ (danach zurück) – **sonst gilt der Rollout als nicht bestanden** (Hook fehlt); ohne Token → Fehler; Testkonto danach im Dashboard löschen |
| R3b | *(entfällt, Review 2: CAPTCHA ist jetzt Teil von R3)* | – | – |
| R4 | Verwalter | Xander legt sein Konto in der App an (offen, keine Liste nötig). Danach per MCP `execute_sql`: `insert into private.admins(user_id) select id from auth.users where email = lower('…')` (Xanders Adresse nennt er selbst) | In der App erscheinen [Konten] und „Speicher online“ |
| R5 | Realtime (vor VO3) | Dashboard: Realtime → Settings → „Allow public access“ **aus** (nur private Kanäle) | – |
| R6 | Schlüssel in die App | MCP `get_project_url` und `get_publishable_keys` (nur lesen) → `CLOUD.url`, `CLOUD.key` (`sb_publishable_…`). **Nie** den geheimen Schlüssel | Suche im Build: kein `sb_secret_` |
| R7 | Ausliefern | **Vor jeder** App-Version mit Online: `update private.settings set max_app = <APP_CODE>, max_format = <PROJECT_FORMAT>` (Migration). Dann `index.html` + `sw.js` + `vendor/supabase-js-2.117.2.umd.js` nach `xanderfoxy/synquenzer` (Pages); der Zweig `dirigent-synth` (githack) und das Artifact bekommen dieselbe Datei, dort bleibt Online aus | Pages zeigt die neue Version; Speichern liefert kein `bad_version` |
| R8 | Probe durch Xander | Konto anlegen, Song ändern, Seite neu laden, auf zweitem Gerät öffnen | 3 iPhone-Prüfpunkte in CHANGES |
| R9 | Freunde dazuholen (ab VO2) | Xander: Menü → Online → [Mein Link teilen] → WhatsApp an René (und David) mit dem Mitmach-Link (`…#mitmachen=<Code>&von=Xander`, ohne E-Mail) · René tippt den Link, legt Konto mit Name, E-Mail, Passwort an, tippt [Anfrage an Xander schicken] · Xander: [Annehmen] → „Mit René“ / „Mit Xander“. David ↔ René: einer teilt seinen Link oder Code mit dem anderen | beide sehen den Raum; Xanders [Konten] zeigt genau die erwarteten Namen |
| R10 | Wach-Ping (Vorgabe ja) | GitHub-Action im Repo `synquenzer` täglich: `curl -s -X POST "$URL/rest/v1/rpc/ping" -H "apikey: $KEY" -H "Content-Type: application/json" -d '{}'`; einmal im Monat ein leerer Keepalive-Commit, damit der Zeitplan nicht nach 60 Tagen abgeschaltet wird (W2) | Supabase schickt keine Pause-Warnung mehr |
| R11 | Sicherung | App: [Alles sichern] (alle eigenen Projekte + Sounds als eine JSON-Datei), Erinnerung monatlich; Free-Plan hat keine herunterladbaren Sicherungen | Datei lässt sich öffnen |
| R12 | Passwort zurücksetzen (auf Bitte, §2.4 Weg 1) | Xander nennt Name + Code aus [Konten]; Orchestrator findet die `id` (`execute_sql`: `select id from public.profiles where friend_code = '…'`) und setzt ein Übergangs-Passwort über die Auth-Admin-API `updateUserById` mit dem geheimen Schlüssel aus einer lokalen Sitzung oder im Dashboard (Authentication → Users). Nie aus der App, nie mit dem geheimen Schlüssel im Browser. Später mit SMTP (F5) entfällt der Schritt | Person meldet sich an und ändert das Passwort in der App |
| R13 | Aufräumen (monatlich, mit R11) | Xander: [Konten] → [Ungenutzte Konten aufräumen] (Probelauf, dann Zwei-Schritt). Beim **ersten** Mal prüft der Orchestrator vorher per `execute_sql` mit `select public.admin_cleanup(30, true)` als Xander (oder Probelauf in der App), ob das Löschen in `auth.users` im echten Projekt erlaubt ist (§2.4b, eK); falls nicht: Konten im Dashboard löschen | Liste in [Konten] nur noch mit genutzten Konten |

---

## 9. Pakete, Abhängigkeiten, Reihenfolge

| Paket | Inhalt | Dauer | Budget |
|---|---|---|---|
| **VO1** | Migration + Rollout R0b–R8 (eigene Pages-Adresse ist Bedingung) · SYNC-Kern (lokal zuerst, Warteschlange je Konto, Geräte-Kennung, Server-Autosave auch im Konflikt, Start-Abgleich mit `isPristine`, Versions-Wächter) · `sw.js` · Anmelde-Blatt (echtes Formular, offene Registrierung mit Name und „findbar“-Schalter, Texte der Anmelde-Bremse, Turnstile über `CLOUD.captcha` ab VO1, Passwort ändern) , Status-Punkt, Online-Abschnitt, kleine Bildschirme §6.10 · „Nur ich“-Liste vom Server · Versionen ansehen/zurückholen · eigene Sounds über `save_library` · Viewer: [In Safari öffnen und mitnehmen] · Tests T1–T4 | ≈ 6–7 h | +38 KB |
| **VO2** | Anfragen (Suchen, Anfragen, Annehmen/Ablehnen, Zurückziehen), Paar-Räume, Teilen (mit Herkunfts-Raum), Raum-Listen mit Autor/Zeit, Realtime-Abos und Toasts, Konflikt-Wahl, Presence-light („René arbeitet gerade an …“), Zusammenarbeit beenden, Mitmach-Link (`#mitmachen=<Code>` → Konto → Anfrage), Konten-Blatt für Xander (Vertrauen, Sperren, Sperren + Daten löschen, Aufräumen), ✓ Verwalter auf Karte und Treffer | ≈ 7,5–8,5 h | +35 KB |
| **VO3** *(optional)* | Anwesenheit „René ist da“ · Sounds im Raum (`space_sounds`, ersetzt VC1 für Freunde) · Brücke zum Jam (VC3 über Supabase-Broadcast statt `room`, nur Safari-Version) · Audio-Speicher erst mit VS | ≈ 4–5 h (+ VC3) | +20 KB |

**Abhängigkeiten**
- VO1 braucht nur den heutigen Stand (V0a: `SQStore.Autosave` mit `onWritten`, Projekte, `parseFile`). **Format 4 (V2a) ist nicht nötig**; kommt V2a später, greift der Versions-Wächter (VO-R1).
- VO2 braucht VO1. VO3 braucht VO2; die Jam-Brücke zusätzlich VC3-Logik (Uhrabgleich, Taktgeber).
- VC1 (Gemeinschafts-Bibliothek in der Claude-App) entfällt für Freunde; nur behalten, wenn Xander eine Gemeinschaft **in** der Claude-App will. VC3 wandert in die Safari-Version (VO3). VS (Mikrofon) läuft ohnehin in der Safari-Version und profitiert vom Audio-Speicher (§2.6).
- Kein Paket des Klang- oder Song-Baus hängt von VO ab.

**Empfohlene Reihenfolge** (Xander: Kodamo-FM zuerst nach V0; Online mit dem Freund bald):
1. **V0 fertig bauen** (V0b, V0c, V0d) wie geplant.
2. **VO1** (≈ 6–7 h): klein, sofort Schutz für O4, Voraussetzung für alles Weitere.
3. **V4** Kodamo-FM-Feld (Xanders Priorität 1).
4. **VO2** (≈ 7,5–8,5 h): Zusammenarbeit mit René.
5. dann V2 (FANG TEIL, Song-Ablauf) und der Rest.

Will Xander René sofort dabeihaben, rückt VO2 vor V4; technisch kostet das nichts (keine Abhängigkeit), Kodamo kommt dann ≈ 7,5–8,5 h später. Schon ab VO1 kann sich jeder registrieren (Bremse und Gesamt-Grenze sind in der Migration); René kann also in VO1 schon ein Konto anlegen und eigene Songs sichern, nur noch nicht teilen.
Hinweis zur Gruppe V4: VC2a (Verlauf-Rekorder) braucht Format 4 und Undo-Gruppen aus V2a (EN-14) und darf deshalb nicht mit V4 vor V2 rücken.

---

## 10. Risiken und offene Fragen

**Risiken**
- Pausieren nach 7 Tagen ohne Nutzung: Wach-Ping (Vorgabe ja) und Ping beim App-Start; sonst sagt die App es je Person klar und bietet [Alles sichern] an (§2.2). Restrisiko: Pause länger als 90 Tage **und** Safari löscht den Skript-Speicher → dann zählt allein die Sicherungsdatei.
- Gemeinsame githack-Herkunft (§2.7): behoben durch die Bedingung „Online nur unter eigener Pages-Adresse“. Restrisiko: `xanderfoxy.github.io` teilt die Herkunft mit Xanders anderen Pages-Seiten (eigener Code).
- `private.settings.max_app` muss vor jedem Ausliefern erhöht werden (R7). Vergisst man es, bekommt die neue App `bad_version`; es geht nichts verloren (lokal + Outbox), aber online steht bis zur Migration.
- Ein böswilliger **Partner** kann im gemeinsamen Raum weiter Inhalte überschreiben oder in den Papierkorb legen (gewollt, F7); alles bleibt über Versionen zurückholbar. Die Quote begrenzt den Schaden für alle anderen.
- Ohne Mail-Dienst kein Selbst-Reset des Passworts (Weg 1 über Xander und Orchestrator, §2.4). Registrierung ohne Bestätigung heißt: Jemand kann ein Konto mit Renés Adresse anlegen, bevor René es tut. Folge: René bekommt „Diese E-Mail hat schon ein Konto“; Xander tippt beim fremden Konto [Sperren + Daten löschen], danach löscht der Orchestrator es im Dashboard (ohne `p_purge` scheitert das Löschen, sobald das Konto ein Projekt hat: `projects.owner_id … on delete restrict`; Projekte in einem Raum müssen vorher übergeben werden). Schaden: keiner, das fremde Konto sieht nichts.
- **Offene Registrierung (17.10.):** Fremde können Konten anlegen, wenn sie die Pages-Adresse finden. Sie sehen nichts, schreiben höchstens 5 MB (Probe-Quote), alle zusammen höchstens 380 MB, und erreichen andere nur mit Code oder Link. Turnstile bremst Skripte schon beim Anlegen, der Pflicht-Hook begrenzt die nicht gesperrten Konten auf 12. Restrisiko: ein Mensch, der das CAPTCHA löst, legt täglich bis zu 5 Konten an; Xander sperrt sie, gesperrte zählen nicht gegen die Grenze, `auth.users` wächst langsam (Gegenmittel `signup_need_ref = true`, [Sperren + Daten löschen], Löschen im Dashboard).
- `admin_cleanup` löscht als Funktionseigentümer `postgres` aus `auth.users`; im echten Projekt ungeprüft (eK, R13).
- Echte Latenz, Hintergrund-Verhalten (WebSocket zu, wenn Safari die Seite schlafen legt) und Speicher-Löschung am iPhone sind ungemessen (eK/SE).
- Die SQL-Prüfung lief in PGlite (Postgres 18.3) mit Nachbau; Supabase nutzt Postgres 15/17 und echte Auth/Realtime. Verwendet wurden nur Funktionen ab Postgres 15; trotzdem nach R2 die Advisors laufen lassen.
- `rls-matrix.mjs` muss mit jeder Änderung an der Migration mitwachsen.

**Fragen an Xander** (der Bau nimmt die Vorgabe in Klammern)
- F1 Eigene Organisation „SYNQUENZER“? (ja)
- F2 Anmeldung mit E-Mail + Passwort wie im Klassenzimmer? (ja)
- F3 ~~Welche E-Mails dürfen rein?~~ **Entschieden 17.10.:** jeder registriert sich selbst; Xander braucht keine Adressen.
- F4 Täglicher Wach-Ping über GitHub? (**ja**, mit monatlichem Keepalive-Commit; Review r7)
- F5 Später eigener Mail-Dienst für „Passwort vergessen“ und Code-Login? (nein, vorerst Weg 1; mit SMTP ginge auch „Confirm email“ an)
- F6 Safari-Version auf eigene Adresse (GitHub Pages, Repo `synquenzer`)? (**ja, Bedingung für Online**; githack bleibt ohne Online)
- F8 ~~Darf nur Xander einladen?~~ Entfällt: Jeder hat seinen Mitmach-Link; nur Xander sieht [Konten] (Sperren, Aufräumen).
- F9 Anmelde-Bremse mit höchstens 12 Konten und 5 neuen je Tag? (ja; Zahlen ändert der Orchestrator auf Zuruf)
- F10 CAPTCHA (Cloudflare Turnstile) gleich von Anfang an? (**ja**, Review 2: ohne IP-Grenze ist es der einzige Schutz gegen Skripte; René und David registrieren sich trotzdem selbst)
- F12 Registrierung nur über den Mitmach-Link (`signup_need_ref`)? (nein, vorerst offen wie im Klassenzimmer; einschalten, falls trotz CAPTCHA Fremde kommen)
- F11 Per Name findbar als Vorgabe aus? (ja; der Link reicht, wer will, schaltet es ein)
- F7 Dürfen in einem Raum beide alles ändern? (ja; Löschen nur in den Papierkorb)

---

## Quellen

**Supabase-Dokumentation** (am 17.10.2026 über Supabase-MCP `search_docs` im Volltext gelesen)
- S1 About billing on Supabase (Free-Projekte, Kontingente je Organisation, Tabelle der Mengen): https://supabase.com/docs/guides/platform/billing-on-supabase
- S2 Manage Egress usage (5 GB/5 GB, Fair-Use bei Überschreitung): https://supabase.com/docs/guides/platform/manage-your-usage/egress
- S3 Project Pausing (7 Tage, Warn-Mail, 90 Tage Wiederherstellung): https://supabase.com/docs/guides/platform/free-project-pausing
- S4 HTTP status codes (540 pausiert, 402 Einschränkung): https://supabase.com/docs/guides/troubleshooting/http-status-codes
- S5 Production Checklist (Free: keine herunterladbaren Sicherungen, Auth-Grenzen, Mail-Scanner, CAPTCHA): https://supabase.com/docs/guides/deployment/going-into-prod
- S6 Understanding Database and Disk Size (500 MB → read-only, 40–60 MB Grundbelegung): https://supabase.com/docs/guides/platform/database-size
- S7 Storage Limits (50 MB je Datei im Free-Plan): https://supabase.com/docs/guides/storage/uploads/file-limits
- S8 Send emails with custom SMTP (Standard-SMTP nur an Team-Adressen, Stundengrenze, keine Zusage): https://supabase.com/docs/guides/auth/auth-smtp
- S9 Password-based Auth (E-Mail-Bestätigung bei gehosteten Projekten standardmäßig an, abschaltbar): https://supabase.com/docs/guides/auth/passwords
- S10 Passwordless email logins (Magic Link, OTP mit `{{ .Token }}`, PKCE-Variante): https://supabase.com/docs/guides/auth/auth-email-passwordless
- S11 Redirect URLs (Site URL, Wildcards, exakte Adresse empfohlen): https://supabase.com/docs/guides/auth/redirect-urls
- S12 Auth Hooks (Before User Created im Free-Plan): https://supabase.com/docs/guides/auth/auth-hooks
- S13 Before User Created Hook (Ablehnen per Postgres-Funktion, Rechte für `supabase_auth_admin`): https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook
- S14 Realtime Limits (Tabelle je Plan, Postgres-Changes-Payload): https://supabase.com/docs/guides/realtime/limits
- S15 Postgres Changes (Publikation, RLS je Empfänger, DELETE-Einschränkungen): https://supabase.com/docs/guides/realtime/postgres-changes
- S16 Realtime Authorization (RLS auf `realtime.messages`, `realtime.topic()`, private Kanäle, „Allow public access“): https://supabase.com/docs/guides/realtime/authorization
- S17 Understanding API keys (publishable key ist öffentlich unbedenklich, geheimer nie im Browser): https://supabase.com/docs/guides/getting-started/api-keys
- S18 Row Level Security (inkl. Performance: `(select auth.uid())`, Indizes, SECURITY DEFINER nicht in freigegebenen Schemas, UPDATE braucht SELECT-Policy): https://supabase.com/docs/guides/database/postgres/row-level-security
- S19 Securing your API (Rechte ausdrücklich vergeben, Umstellung der Standard-Rechte): https://supabase.com/docs/guides/api/securing-your-api
- S20 Database Advisor Lint 0029 (SECURITY DEFINER für `authenticated`): https://supabase.com/docs/guides/observability/advisors?queryGroups=lint&lint=0029_authenticated_security_definer_function_executable
- S21 Glossary (Zugangs-Token ≤ 1 h, Sitzung in Local Storage oder Cookies): https://supabase.com/docs/guides/resources/glossary
- S22 JavaScript-Referenz `createClient` (Option `auth.storageKey`; eK, nicht neu abgerufen): https://supabase.com/docs/reference/javascript/initializing
- S23 Dashboard-Adresse eines Projekts (Restore nach Pause, vgl. S3): https://supabase.com/dashboard/project/<ref>
- S24 Auth Rate Limits (Token-Bucket je IP, Spitzen bis 30, 429; Tabelle je Endpunkt; Mail-Endpunkte inkl. `/auth/v1/signup` nur mit eigenem SMTP änderbar; Einstellung unter Authentication → Rate Limits), am 17.10. gelesen: https://supabase.com/docs/guides/auth/rate-limits
- S25 Enable CAPTCHA Protection (hCaptcha und Cloudflare Turnstile für Registrierung, Anmeldung, Passwort-Reset; Schalter unter Bot and Abuse Protection; `options: {captchaToken}`), am 17.10. gelesen: https://supabase.com/docs/guides/auth/auth-captcha
- S26 Anonymous Sign-Ins, Abschnitte „Abuse prevention“ (CAPTCHA/Turnstile empfohlen, 30 je Stunde je IP) und „Automatic cleanup“ (keine Automatik; Löschen per SQL `delete from auth.users …`), am 17.10. gelesen: https://supabase.com/docs/guides/auth/auth-anonymous
- S13 (Ergänzung 17.10.): Der Hook bekommt `metadata.ip_address` und `user.email`; Antwort `{}` erlaubt, `{error: {http_code, message}}` lehnt ab und gibt die Meldung an den Client weiter.

**npm / Pakete** (über `npm view` / `npm pack` am 17.10.2026)
- N1 `@supabase/supabase-js` Versionen und Daten: https://registry.npmjs.org/@supabase/supabase-js
- N2 README im Paket 2.117.2 (CDN/UMD-Nutzung): https://www.npmjs.com/package/@supabase/supabase-js
- N3 jsDelivr-Adresse (nicht abrufbar von hier): https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js
- N4 `@electric-sql/pglite` 0.5.8 (Testdatenbank): https://www.npmjs.com/package/@electric-sql/pglite

**Web** (nur Suchauszüge, SE)
- W1 githack FAQ und Startseite (Content-Type, kurzer Cache für Entwicklungs-Adressen, CDN dauerhaft): https://raw.githack.com/faq · https://raw.githack.com/
- W2 GitHub Docs, Workflows deaktivieren (60 Tage ohne Aktivität in öffentlichen Repos): https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows
- W3 Fetch-Standard, Keepalive-Grenze 64 KiB: https://fetch.spec.whatwg.org/ · Sentry-Bericht https://github.com/getsentry/sentry-javascript/issues/2547
- W4 Safari 7-Tage-Grenze für Skript-Speicher, eigener Zähler für Home-Bildschirm-Apps: https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/ (eK, nicht abgerufen) · https://mjtsai.com/blog/?p=28475 · https://bugs.webkit.org/show_bug.cgi?id=237350
- W5 MDN-Kompatibilitätsdaten 8.1.5 (lokal: `v3-ideen/r4/g789/bcd-dl/`): https://developer.mozilla.org/docs/Web/API/CompressionStream · …/Crypto/randomUUID · …/LockManager · …/BroadcastChannel · …/Request/keepalive · …/StorageManager/persist
- W6 Same-Origin-Regel (eK): https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
- W7 Apple, Password AutoFill für HTML-Felder (`autocomplete="username"`/`"new-password"`; eK, nicht abgerufen): https://developer.apple.com/documentation/security/enabling-password-autofill-on-an-html-input-element
- W8 MDN, Using Service Workers (Gültigkeitsbereich, Cache-Strategien; eK, nicht abgerufen): https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
- W9 GitHub Docs, About GitHub Pages (Projekt-Seiten unter `<user>.github.io/<repo>`; eK, nicht abgerufen): https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
- W10 MDN `History.replaceState` und `VisualViewport` (eK): https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState · https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport

**Lokal**
- L1 Seitenvertrag des Artifact-Werkzeugs (CSP: nur Skripte von fünf CDNs und Google Fonts; fetch/XHR/WebSocket zu anderen Hosts geblockt), in dieser Sitzung gelesen; keine öffentliche URL.
- L2 Nachtrag 1, N0.3 (`db`/`user`-Regeln), VC1–VC4.
- L3 Repo `XanderFoxy/Deutsch-Mit-Xander` über `gh api` (nur lesen): öffentlich, `has_pages: true`; Zweig `dirigent-synth` = `index.html`, `README.md`, Logo; Klassenzimmer lädt supabase-js-UMD von jsDelivr und nutzt `signInWithPassword`.
- L4 Messungen und Prüfungen: `v3-ideen/r7/online-test/measure-size.out`, `rls-matrix.out` (123/123), `fake-supa.out` (11/11), `review-sec/attack.out` und `attack.after.out` (Stand Review r7).
- L5 Klassenzimmer-Registrierung (nur gelesen, `git grep` auf `origin/main`): `backend.js` Z. 202–205 `signUp(email, password, name, referrerId)` → `client.auth.signUp({email, password, options: {data: {name}, emailRedirectTo}})`, ohne Sitzung Rückfall auf `signInWithPassword` und Hinweis auf „Confirm email“; `app.js` Z. 92443 Formular mit Name; Empfehlungs-Link `?ref=` als Vorbild für den Mitmach-Link; kein CAPTCHA.
- L6 `v3-ideen/fragen-xander-9.md` und Xanders Antwort vom 17.10. („Sie sollen sich dort selber einloggen oder registrieren können, so wie wir das auch bei Deutsch mit Xander haben“; E-Mail-Adressen von René und David unbekannt).

---

## Review-Protokoll (r7, 24 Befunde; Nachtrag 17.10.)

**Nachtrag 17.10. „offene Registrierung“ (Xanders Entscheidung, L6):** Einlass-Liste, `invite_email`, Einladungs-Anfrage im Trigger und E-Mail-Suche entfernt; offene Registrierung mit Name + E-Mail + Passwort wie im Klassenzimmer (L5), „Confirm email“ bleibt aus (S8 erneut gelesen); Before-User-Created-Hook wird **optionale Anmelde-Bremse** (Konten-Obergrenze, Tagesgrenze, Schließen, Sperr-Domains); neu Gesamt-Grenze `total_bytes`, Sperrliste mit `admin_block`, `admin_accounts` ohne E-Mails, `admin_cleanup` mit Probelauf; `findable` Vorgabe aus; Name-Rückfall „Musiker“ statt E-Mail-Teil; Mitmach-Link mit Freundes-Code statt E-Mail; Passwort-Reset über Verwalter (Weg 1), SMTP später; CAPTCHA (Turnstile/hCaptcha, S25) vorbereitet, Vorgabe aus. Geändert: §0, §1, §2.1, §2.4, neu §2.4b, §3.1–3.5, §5, §6.1–6.5b, neu §6.3b, §6.9, §7.2, §7.6, §7.8 (N8O-04/04b/04c/21/22/30/30b), §8 (R0, R1, R3, neu R3b, R4, R9, R12, neu R13), §9, §10, Quellen (S24–S26, L5, L6). Geprüft: `rls-matrix.mjs` **123/123** (9 Einladungs-Fälle entfallen, 25 neu), Matrizen A–C zeichengleich mit `rls-matrix.pre-offen.out`; `fake-supa.mjs` **11/11**. `attack.mjs` nicht neu ausgeführt (ruft das entfernte `invite_email` auf). Nichts in einem echten Supabase-Projekt angelegt, geändert oder abgefragt; der Supabase-MCP wurde nur für `search_docs` benutzt. Nicht übernommen: persönliches Blockieren zwischen zwei Nutzern (Ablehnen + 24-h-Sperre + Anfrage-Tempo + Verwalter-Sperre reichen für drei Leute); Speichern von IP-Adressen im Hook (Datenschutz, Supabase begrenzt je IP selbst).

Jeder Befund wurde vor der Änderung geprüft: SQL-Befunde über `review-sec/attack.out` und Code-Lesen, `isPristine`/`demoProject` in V0a (Z. 16879, 9424), die übrigen am Text. Danach liefen `rls-matrix.mjs` (**107/107**, davon 20 neue Fälle) und `fake-supa.mjs` (**10/10**) neu. `attack.after.out` hält den Stand nach den Änderungen fest.

**Übernommen:** Konflikt-Schlüssel je Gerät (VO-E11) · Push läuft im Konflikt weiter (§4.3/4.5) · Quote und Tempo (VO-E12) · eigene Herkunft als Bedingung (§2.7, R0b) · Einladen nur Verwalter, ohne `has_account` (VO-E13; durch den Nachtrag 17.10. ersetzt) · `save_library` mit Sperre · Obergrenzen `max_app`/`max_format` · Publikation ohne DELETE · Anfrage-Tempo 3 je Paar und 24 h · Namenssuche nur eindeutig · Konto-Trennung auf einem Gerät (§4.4) · kein Löschen von Raum-Aufnahmen · Herkunfts-Raum `mixed_origin` · Einladungs-Link · Einladen = Anfrage (beides durch den Nachtrag 17.10. ersetzt: Mitmach-Link mit Code) · Wach-Ping ja und Texte je Person · `isPristine` im Abgleich · Viewer-Brücke · `sw.js` · Regeln für kleine Bildschirme (§6.10) · [Jetzt neu laden] · Passwort-Autofill und R12 · Presence-light in VO2 · Begriffe und Mockup 6.5b.

**Zusammengelegt (doppelt):** „Erst-Abgleich lädt fremde Projekte hoch“ (minor) und „Lokale Daten nicht nach Konto getrennt“ (blocking) → eine Lösung in §4.4. „push() stoppt bei Konflikt“ kam zweimal (major/major) → eine Lösung in §4.3/4.5.

**Abgelehnt oder anders gelöst:**
- Konflikt-Fassung: „Bei jedem anderen md5 eine neue Zeile einfügen“ abgelehnt. Weil die App im Konflikt weiter hochlädt, entstünde alle 2 s eine Zeile. Stattdessen Upsert je (Person, Gerät, Stand, Grund).
- Quote: „`54000` bei jedem Speichern über der Grenze“ abgelehnt, das widerspräche O4. Der aktuelle Stand wird weiter gespeichert, nur automatische Versionen setzen aus. Anlegen, Merken, Bibliothek und Übergabe-Versionen werden abgelehnt.
- Namen: partieller Unique-Index auf `lower(display_name)` abgelehnt, weil er das Anlegen eines Kontos im Trigger scheitern ließe. Stattdessen liefert die Suche bei mehreren Treffern „mehrere“, und die Karte zeigt den Code.
- Blockieren (`private.blocks`) vorerst nicht übernommen: Konten gibt es nur noch über Xanders Einladung, und das Anfrage-Tempo begrenzt den Spam. *(Nachtrag 17.10.: mit offener Registrierung als Verwalter-Sperrliste `private.blocked_users` übernommen, VO-E16.)*
- Bibliothek: Tages-Verlauf nicht übernommen, die Sperre verhindert den Verlust schon. Eine Zeile je Sound wäre ein größerer Umbau.
- Herkunfts-Raum: Zwei-Schritt-Ausnahme „Trotzdem mit David teilen“ nicht übernommen. Es gilt die strenge Regel, passend zu O3.
- Presence-light über Spalten `open_by/open_at` abgelehnt: Schreiben alle 60 s würde Realtime-UPDATEs auslösen, die wie Speicherungen aussehen. Stattdessen kommt der fertige private Presence-Kanal in VO2.
- Raum-Aufnahmen: „DELETE nur ohne Verweis“ nicht übernommen. Für Nutzer gibt es gar kein DELETE, Aufräumen macht nur der Verwalter.
- Offen und als ungeprüft markiert: ob `target="_blank"` aus dem Artifact-Rahmen am iPhone Safari öffnet (T5, Rückweg über die Zwischenablage).

---

## Review-Protokoll (Runde 2, 17.10.2026, 13 Befunde zu Online)

Alle Befunde wurden vorher geprüft: die Rate-Limit-Aussage und die Hook-Payload (`user_metadata`) per Supabase-`search_docs` („Rate limits“, „Before User Created Hook“, 17.10.); O1/O2/O3/O5/O6 am alten Stand in `online-test/repro-review2.mjs` nachgestellt (`repro-review2.alt.out`: Hook 403 mit 1 gesperrtem Konto, gesperrter Partner liest 1 Zeile und Realtime = true, Löschen scheitert an RESTRICT, „Xander“ und U+200B gehen durch, 300 Suchen ohne Bremse); die übrigen am SQL-Text. Danach `rls-matrix.mjs` **135/135** und `fake-supa.mjs` **11/11**.

**Übernommen:** CAPTCHA ab VO1, R3b in R3 · Hook zählt Gesperrte nicht (insgesamt und je Tag), `grant select on private.blocked_users to supabase_auth_admin` · `signup_need_ref` als Schalter (Vorgabe aus, damit René und David sich wie gewünscht ohne Hürde selbst registrieren) · Sperre nimmt Leserechte (`my_space_ids`, `my_active_space_ids`, `my_project_ids`, `visible_user_ids`, `requests_read`, `projects_read`, `lib_own`), `admin_block` beendet Räume · Probe-Quote mit `admin_trust` und Raum-Regel · `admin_block(…, p_purge)` · Hook als Pflicht mit Pflicht-Probe in R3, „OPTIONAL“ gestrichen · Namensschutz-Trigger, `profiles.is_admin`, ✓ auf Karte und Treffer · `find_user`-Tempo 30/h · Konto-Orakel-Text korrigiert · `db_soft_limit` und Speicher-Tempo · zweimal Nein = Ruhe.

**Anders gelöst:**
- Probe-Quote: „in einem Raum“ allein reicht nicht, denn zwei fremde Konten könnten sich gegenseitig annehmen. Volle Quote gibt es nur im **aktiven Raum mit dem Verwalter oder einem markierten Konto**. Die Probe-Quote ist höchstens `quota_bytes`.
- Speicher-Tempo zählt in `private.save_log` statt über `updated_at`/`version`, weil diese Werte keine Minute abbilden.
- `set_profile` macht jetzt erst ein UPDATE. Bisher lief `insert … on conflict do update`; dabei feuert der INSERT-Trigger zuerst und hätte einen reservierten Namen still in „Musiker“ verwandelt.
- Freundes-Codes bleiben 6 Zeichen (die Alternative 8 Zeichen ist nicht übernommen): Das Such-Tempo reicht, und den Code liest man vor.

**Abgelehnt:** keiner.
