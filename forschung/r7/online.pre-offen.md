# SYNQUENZER — Paket VO „Online-Zusammenarbeit“ (Entwurf r7, Runde 8)

Stand 17.10.2026, nach Review r7 (Protokoll am Ende) · Status: **Entwurf zur Freigabe** (Orchestrator, dann Xander) · Grundlage: `v3-ideen/fragen-xander-8.md` Abschnitt O (O1–O4) und Fakten, Spec v3 + Nachtrag 1 (Teil B VC1–VC4, N0.3), App-Stand `synq-snapshots/V0a.html` (App 3.1.0).

**Kennzeichen** (wie Spec): **[Doku]** = Supabase-Dokumentation, am 17.10.2026 über das Supabase-MCP `search_docs` im Volltext gelesen (URLs unter „Quellen“) · **(SE)** = nur Suchauszug · **eK** = eigene Kenntnis, ungeprüft · **gemessen** = Chromium 141/Node auf der Xeon-VM, nie am iPhone · **lokal geprüft** = in PGlite 0.5.8 (Postgres 18.3, WASM) mit Supabase-Nachbau, **kein** echtes Supabase-Projekt.
**Nichts** wurde in einem echten Supabase-Projekt angelegt, geändert oder abgefragt.

**Dateien zu diesem Entwurf** (alle in `v3-ideen/r7/`):
- `online-schema.sql` — die vollständige Migration (identisch mit §3.3).
- `online-test/supabase-shim.sql` — Nachbau der Supabase-Teile (Rollen, `auth.uid()`, `realtime.messages`, `storage.objects`, alte Standard-Rechte) nur für Tests.
- `online-test/rls-matrix.mjs` → `.out` — RLS-/RPC-Matrix, **107/107 bestanden** (87 alte + 20 Nachprüfungen aus dem Review r7).
- `online-test/review-sec/attack.mjs` → `attack.out` (vorher) / `attack.after.out` (nach den Änderungen) — Angriffe A1–A9 des Reviews.
- `online-test/fake-supa.mjs` → `.out` — Prototyp eines Supabase-Ersatzes für App-Tests (PGlite + Realtime-Nachbau), **10/10**.
- `online-test/measure-size.mjs` → `.out` — Projektgrößen und JSON-Zeiten am V0a-Stand.
- `online-dl/` — heruntergeladene Pakete (npm: `@supabase/supabase-js@2.117.2`, `@electric-sql/pglite@0.5.8`).

---

## 0. Kurzfassung

- **Ja, Supabase passt.** Xander hat dort schon ein Konto; Auth, Datenbank mit Zeilen-Rechten (RLS), Realtime und Speicher sind im Free-Plan dabei. SYNQUENZER bekommt ein **eigenes** kostenloses Projekt, am besten in einer **eigenen Organisation** (Kontingente und Fair-Use gelten je Organisation, §2.1). Das Klassenzimmer-Projekt wird nie berührt.
- **Online läuft in der Safari-Version, und zwar nur unter einer eigenen Adresse** (GitHub Pages, nicht `raw.githack.com`, weil sich dort alle Seiten eine Herkunft und damit den Anmelde-Token teilen; §2.7). Im Claude-Viewer blockiert die Plattform jede Verbindung zu fremden Hosts. Dort zeigt die App dauerhaft „Nur auf diesem Gerät“ und bietet [In Safari öffnen und mitnehmen] an (§4.7).
- **Anmeldung: E-Mail + Passwort**, ohne Bestätigungs-Mail, dafür mit **Einlass-Liste**: Nur Xander (Verwalter) lädt ein, und die Einladung ist zugleich seine Anfrage. René tippt auf den Einladungs-Link, legt ein Passwort fest und sieht sofort „Xander möchte mit dir Musik machen · [Annehmen]“. Magic Link und Code-Mail scheitern ohne eigenen Mail-Dienst, weil Supabase dann nur an Team-Mitglieder schickt (§2.4).
- **Nie verloren:** lokal zuerst (wie heute IndexedDB + Rettungskopie), dazu Warteschlange und Server-Autosave 2 s nach der letzten Änderung, Versionsnummern mit optimistischer Sperre und ein Server-Verlauf, der jede Fassung aufhebt, auch bei Konflikten und auch je Gerät (§4). Während ein Konflikt offen ist, lädt die App weiter hoch. Eine Mengengrenze je Person (60 MB) verhindert, dass ein Fehler oder ein Nutzer die Datenbank für alle vollschreibt. Ein Service Worker sorgt dafür, dass die Seite auch ohne Netz neu lädt.
- **O3 streng paarweise:** Jede angenommene Anfrage ergibt **einen** Raum für genau zwei Personen. Lesen regeln RLS-Policies, Schreiben nur geprüfte Funktionen. Lokal geprüft: David sieht Renés Sachen nie, auch nicht, nachdem David und René selbst einen Raum haben; dann sieht er nur den neuen Raum D–R (§3.4).
- **Realtime:** „René hat ‚Song X‘ gespeichert“ als Hinweis, Liste und Zähler laufen mit; „René ist da“ optional (§5).
- **Pakete:** **VO1** Anmelden + Server-Autosave + Verlauf + eigene Adresse + Offline-Neuladen (≈ 6–7 h), **VO2** Anfragen + Paar-Räume + Realtime + Konflikt-Wahl + Presence-light (≈ 7–8 h), **VO3** optional Anwesenheit, Sounds im Raum, Brücke zum Jam (VC3). **Empfehlung:** V0 fertig → **VO1** → V4 (Kodamo) → **VO2** → V2 …; VO2 kann ohne Folgen vor V4 rücken, wenn Xander den Freund sofort dabeihaben will (§9).

**Für Xander in drei Sätzen:** Deine Songs liegen künftig zusätzlich online in einem eigenen, kostenlosen Supabase-Projekt und sind nach dem Neuladen nie weg; das läuft in der Safari-Version, die Claude-App bleibt wie sie ist. Du lädst René per E-Mail ein und schickst ihm einen Link. Er legt damit ein Konto mit Passwort an, und erst wenn er deine Anfrage annimmt, habt ihr einen gemeinsamen Raum „Mit René“; David sieht davon nichts, solange er nicht selbst mit René verbunden ist, und auch dann nur das, was die beiden teilen. Speichert René, siehst du es sofort; ändert ihr gleichzeitig, wählst du „übernehmen“ oder „beide behalten“, verloren geht keine Version.

---

## 1. Xanders Wunsch → Lösung

| Xander (Runde 8, O) | Lösung | § | Paket |
|---|---|---|---|
| O1 Alles liegt online; jeder sieht, was der andere beiträgt; speichert der Kumpel, sieht Xander es | Jedes Projekt und die eigenen Sounds liegen zusätzlich auf dem Server. Geteilte Projekte liegen im Raum des Paares; Speichern des Partners → Hinweis, Liste mit Autor und Zeit, Zähler „1 neu“ | 4, 5 | VO1, VO2 |
| O2 Kleines Login, gegenseitig geschützt | E-Mail + Passwort; RLS: ohne Anmeldung keine Daten; jede Zeile nur für Berechtigte | 2.4, 3 | VO1 |
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

**Mengengrenze je Person (Review r7, lokal geprüft):** Ohne Grenze reichen ≈ 140 Aufrufe mit 1,9-MB-Projekten, um die freien ≈ 440 MB zu füllen. Dann schaltet Supabase die ganze Datenbank auf nur lesen (S6), und für alle scheitert jedes Speichern. Deshalb prüft der Server je Person eine Quote (`private.settings.quota_bytes`, Vorgabe 60 MB Rohtext aus eigenen Projekten, eigenen Versionen, Bibliothek und Raum-Sounds), dazu Tempo-Grenzen: höchstens 50 neue Projekte je Tag, `mark_version` höchstens 20 je Projekt und Stunde, höchstens 200 Raum-Sounds je Person. Bei voller Quote speichert `save_project` den aktuellen Stand weiter (nichts geht verloren) und setzt nur die automatischen Versionen aus (`quota: true` → Hinweis). Anlegen, Merken und Bibliothek melden `54000 quota`. Vier Konten × 60 MB plus Grundbelegung bleiben unter 500 MB.

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

**Empfehlung:** E-Mail + Passwort, „Confirm email“ **aus**, Mindestlänge 8. Damit nicht jeder, der die öffentliche Seite findet, ein Konto anlegt: **Einlass-Liste** über den Auth-Hook „Before User Created“ (im Free-Plan verfügbar, als Postgres-Funktion). Er lehnt jede Registrierung ab, deren E-Mail niemand eingeladen hat. [Doku] S12, S13
- **Passwort vergessen:** ohne Mail-Dienst kein Selbst-Reset. Text in der App für Freunde: „Frag Xander, er setzt dir ein neues Passwort.“, für Xander: „Passwort vergessen? Sag Claude Bescheid.“ Der Orchestrator setzt es auf Xanders Bitte im Dashboard (Authentication → Users) oder über die Auth-Admin-API mit dem geheimen Schlüssel, nie aus der App (Rollout R12).
- **Schlüsselbund muss das Passwort sicher speichern**, weil ein Reset Aufwand ist: Kontofeld `type="email"` mit `autocomplete="username"` und `inputmode="email"`, Passwort `autocomplete="new-password"` bzw. `"current-password"`, beides in einem echten `<form>` mit Submit-Knopf (`preventDefault`); nach Erfolg wird das Formular aus dem DOM entfernt, damit Safari „Passwort sichern“ anbietet (Apple, W7). Später optional ein eigener SMTP-Dienst (z. B. Brevo, Resend; Liste in S8), dann gehen Reset-Mail und Code-Login.
- **Redirect-URLs** (für spätere Mails, schadet jetzt nicht): Site URL und Redirect URL = `https://xanderfoxy.github.io/synquenzer/` (eigene Pages-Adresse, §2.7; genaue Adresse statt `**`, wie die Doku empfiehlt). Zieht die Seite um (§2.7), kommt die neue Adresse dazu. [Doku] S11
- **Sitzung:** supabase-js hält Zugangs-Token (≤ 1 h) und Refresh-Token im `localStorage` und erneuert selbst. [Doku] S21, eK. Eigener Schlüssel je App über `auth.storageKey: 'synq-auth'` (Option von `createClient`, S22, eK); nach dem Abmelden löscht SYNC den Token-Schlüssel ausdrücklich.

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
private.signup_allowlist (Einlass-Liste, nur für den Auth-Hook; invited_by → Anfrage)
private.admins (Verwalter = Xander) · private.settings (max_app, max_format, quota_bytes)
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
| VO-E13 | **Einladen nur durch Verwalter** (`private.admins`), Einladen = Anfrage (`handle_new_user` legt die Anfrage an), kein `has_account` | Sonst wächst die Einlass-Liste in einer Kette, und jeder kann prüfen, ob eine Adresse ein Konto hat (Review r7, A5). |

### 3.3 Vollständiges SQL (Migration `vo_init`, Teile A und B; Teil 8 erst mit Audio)

```sql
-- =====================================================================================
-- SYNQUENZER · Paket VO „Online-Zusammenarbeit“ · Migration vo_init (Teil A + B)
-- Ziel: eigenes, kostenloses Supabase-Projekt „synquenzer“ (NIE das Klassenzimmer-Projekt).
-- Stand 17.10.2026 (nach Review r7: Geräte-Kennung, Quote, Verwalter, Bibliothek mit Sperre,
-- Versions-Grenzen, Herkunfts-Raum, Publikation ohne DELETE). Lokal geprüft mit PGlite 0.5.8
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
  findable     boolean not null default true,
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

create table private.signup_allowlist (            -- Einlass-Liste für den Before-User-Created-Hook
  email      text primary key check (email = lower(email) and position('@' in email) > 1),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table private.admins (                      -- Verwalter (Xander); Eintrag per execute_sql im Rollout R4
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table private.settings (                    -- genau eine Zeile; Werte per Migration ändern
  id          boolean primary key default true check (id),
  max_app     integer not null,                    -- höchste ausgelieferte App-Version (vor JEDEM Ausliefern erhöhen, Rollout R7)
  max_format  integer not null,                    -- höchstes Projektformat
  quota_bytes bigint  not null                     -- Mengengrenze je Person (Rohtext-Bytes)
);
insert into private.settings (max_app, max_format, quota_bytes) values (3001000, 3, 60 * 1024 * 1024);

-- ---------- 3. RLS-Hilfen (private, SECURITY DEFINER, search_path leer) ----------
create or replace function private.my_space_ids()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select m.space_id from public.space_members m where m.user_id = (select auth.uid())
$$;

create or replace function private.my_active_space_ids()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select m.space_id from public.space_members m join public.spaces s on s.id = m.space_id
  where m.user_id = (select auth.uid()) and s.status = 'active'
$$;

create or replace function private.my_project_ids()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select p.id from public.projects p
  where p.owner_id = (select auth.uid())
     or p.space_id in (select m.space_id from public.space_members m where m.user_id = (select auth.uid()))
$$;

create or replace function private.visible_user_ids()       -- ich, meine Raum-Partner, offene Anfragen mit mir
returns setof uuid language sql stable security definer set search_path = '' as $$
  select (select auth.uid())
  union select b.user_id from public.space_members a join public.space_members b on b.space_id = a.space_id
        where a.user_id = (select auth.uid())
  union select case when r.from_user = (select auth.uid()) then r.to_user else r.from_user end
        from public.collab_requests r
        where r.status = 'pending' and (select auth.uid()) in (r.from_user, r.to_user)
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

create or replace function private.quota_left(p_uid uuid)   -- freie Bytes der Person (kann negativ sein)
returns bigint language sql stable security definer set search_path = '' as $$
  select (select s.quota_bytes from private.settings s)
       - (select coalesce(sum(p.size_bytes), 0) from public.projects p where p.owner_id = p_uid)
       - (select coalesce(sum(v.size_bytes), 0) from public.project_versions v where v.created_by = p_uid)
       - (select coalesce(sum(l.size_bytes), 0) from public.user_libraries l where l.owner_id = p_uid)
       - (select coalesce(sum(octet_length(x.body::text)), 0) from public.space_sounds x where x.owner_id = p_uid)
$$;

create or replace function private.check_quota(p_uid uuid, p_add bigint)
returns void language plpgsql stable security definer set search_path = '' as $$
begin
  if p_add > 0 and private.quota_left(p_uid) < p_add then
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

create or replace function private.need_uid()
returns uuid language plpgsql stable set search_path = '' as $$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
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
revoke all on private.admins, private.settings from public, anon, authenticated;
grant execute on function private.my_space_ids(), private.my_active_space_ids(), private.my_project_ids(),
  private.visible_user_ids(), private.topic_space_ok(text), private.path_space_ok(text, boolean) to authenticated;

-- ---------- 4. Neue Konten: Profil anlegen (Trigger) und Einlass-Liste (Hook) ----------
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare n text := btrim(coalesce(new.raw_user_meta_data ->> 'display_name', ''));
begin
  if n = '' then n := split_part(coalesce(new.email, 'Musiker'), '@', 1); end if;
  insert into public.profiles (id, display_name) values (new.id, left(n, 24)) on conflict (id) do nothing;
  -- Einladen = Anfrage (Review r7): wer eingeladen hat, steht als offene Anfrage da; der Neue muss zustimmen (O3)
  insert into public.collab_requests (from_user, to_user)
    select a.invited_by, new.id from private.signup_allowlist a
    where a.email = lower(coalesce(new.email, '')) and a.invited_by is not null and a.invited_by <> new.id
      and exists (select 1 from public.profiles p where p.id = a.invited_by)
    on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();
revoke all on function private.handle_new_user() from public, anon, authenticated;

-- Before-User-Created-Hook (Dashboard: Authentication → Hooks → Postgres → public.hook_before_user_created)
create or replace function public.hook_before_user_created(event jsonb)
returns jsonb language plpgsql stable set search_path = '' as $$
begin
  if exists (select 1 from private.signup_allowlist a where a.email = lower(coalesce(event -> 'user' ->> 'email', ''))) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error', jsonb_build_object('http_code', 403,
    'message', 'Diese E-Mail ist nicht eingeladen. Bitte frag Xander nach einer Einladung.'));
end $$;
revoke execute on function public.hook_before_user_created(jsonb) from public, anon, authenticated;
grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;
grant select on private.signup_allowlist to supabase_auth_admin;

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
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy spaces_read   on public.spaces          for select to authenticated using (id in (select private.my_space_ids()));
create policy members_read  on public.space_members   for select to authenticated using (space_id in (select private.my_space_ids()));
create policy requests_read on public.collab_requests for select to authenticated
  using ((select auth.uid()) in (from_user, to_user));
create policy projects_read on public.projects for select to authenticated
  using (owner_id = (select auth.uid()) or space_id in (select private.my_space_ids()));
create policy pdata_read    on public.project_data     for select to authenticated using (project_id in (select private.my_project_ids()));
create policy pvers_read    on public.project_versions for select to authenticated using (project_id in (select private.my_project_ids()));
create policy lib_own on public.user_libraries for select to authenticated   -- schreiben nur über save_library
  using (owner_id = (select auth.uid()));
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
  insert into public.profiles (id, display_name) values (uid, n)
    on conflict (id) do update set display_name = excluded.display_name,
      findable = coalesce(p_findable, public.profiles.findable), updated_at = now();
  return (select json_build_object('display_name', p.display_name, 'friend_code', p.friend_code, 'findable', p.findable)
          from public.profiles p where p.id = uid);
end $$;

create or replace function public.find_user(p_query text)       -- höchstens 1 Treffer, nie die E-Mail
returns table (user_id uuid, display_name text, friend_code text)
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); q text := btrim(coalesce(p_query, ''));
begin
  if char_length(q) < 2 or char_length(q) > 120 then return; end if;
  if position('@' in q) > 0 then
    return query select p.id, p.display_name, p.friend_code from public.profiles p join auth.users u on u.id = p.id
      where lower(u.email) = lower(q) and p.id <> uid limit 1;
  elsif upper(ltrim(q, '#')) ~ '^[A-Z0-9]{6}$' and exists (select 1 from public.profiles x where x.friend_code = upper(ltrim(q, '#'))) then
    return query select p.id, p.display_name, p.friend_code from public.profiles p
      where p.friend_code = upper(ltrim(q, '#')) and p.id <> uid limit 1;
  else                                                         -- Name: nur bei genau einem Treffer
    if (select count(*) from public.profiles p where p.findable and lower(p.display_name) = lower(q) and p.id <> uid) > 1 then
      return query select null::uuid, left(q, 24), null::text;   -- „mehrere – bitte Code oder E-Mail“
      return;
    end if;
    return query select p.id, p.display_name, p.friend_code from public.profiles p
      where p.findable and lower(p.display_name) = lower(q) and p.id <> uid limit 1;
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
  if p_target is null or p_target = uid or not exists (select 1 from public.profiles where id = p_target) then
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

create or replace function public.invite_email(p_email text)   -- nur Verwalter; Einladen = Anfrage
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); e text := lower(btrim(coalesce(p_email, ''))); t uuid;
begin
  if not private.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(e) > 254 then raise exception 'bad_email' using errcode = '22023'; end if;
  select u.id into t from auth.users u where lower(u.email) = e;
  if found then return public.request_collab(t); end if;            -- hat schon ein Konto: gleich anfragen
  if (select count(*) from private.signup_allowlist where invited_by = uid) >= 20 then
    raise exception 'too_many_invites' using errcode = '54000';
  end if;
  insert into private.signup_allowlist (email, invited_by) values (e, uid)
    on conflict (email) do update set invited_by = excluded.invited_by;
  return json_build_object('status', 'invited');
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
    'quota_bytes', (select s.quota_bytes from private.settings s),
    'quota_left', private.quota_left((select auth.uid())),
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
  if (select count(*) from public.space_sounds x where x.owner_id = new.owner_id) >= 200 then
    raise exception 'slow_down' using errcode = '54000';
  end if;
  perform private.check_quota(new.owner_id, octet_length(new.body::text));
  return new;
end $$;
create trigger space_sounds_guard before insert on public.space_sounds for each row execute function private.space_sounds_guard();
revoke all on function private.space_sounds_guard(), private.keep_conflict(uuid, integer, text, text, json, integer, uuid),
  private.check_quota(uuid, bigint), private.quota_left(uuid), private.is_admin() from public, anon, authenticated;

revoke execute on function public.ping(), public.set_profile(text, boolean), public.find_user(text),
  public.respond_request(uuid, boolean), public.request_collab(uuid, text), public.cancel_request(uuid),
  public.end_collab(uuid), public.invite_email(text),
  public.save_project(uuid, integer, text, json, integer, integer, uuid, text, text, uuid),
  public.mark_version(uuid, text), public.save_library(integer, json), public.share_project(uuid, uuid),
  public.trash_project(uuid, boolean), public.purge_project(uuid), public.storage_report(), public.admin_thin(integer) from public, anon;
grant execute on function public.set_profile(text, boolean), public.find_user(text),
  public.respond_request(uuid, boolean), public.request_collab(uuid, text), public.cancel_request(uuid),
  public.end_collab(uuid), public.invite_email(text),
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
  with check (realtime.messages.extension in ('presence', 'broadcast') and private.topic_space_ok((select realtime.topic())));

-- ---------- 8. (Teil C, erst mit Audio/VS) Storage: privater Eimer je Raum-Ordner ----------
-- insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
--   values ('space-audio', 'space-audio', false, 52428800, array['audio/mp4', 'audio/webm', 'audio/mpeg']);
create policy space_audio_read on storage.objects for select to authenticated
  using (bucket_id = 'space-audio' and private.path_space_ok(name, false));
create policy space_audio_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'space-audio' and private.path_space_ok(name, true));
-- Kein DELETE für Nutzer (Review r7): gemeinsame Songs verweisen auf die Aufnahmen; Löschen nur beim
-- Verwalter-Aufräumen (service role), wenn kein Projekt-Inhalt und keine Version die Datei mehr nennt.
```

### 3.4 Testmatrix (lokal geprüft, `online-test/rls-matrix.mjs` → `.out`, 107/107)

Aufbau: Xander (X), René (R), David (D), Fremder (S, angemeldet, ohne Beziehung), anon. In `collab_requests` heißt `:a` angenommen, `:p` offen. Räume XR und XD angenommen; David hat René angefragt (offen). Projekte: `pX` (X privat), `pXR` (X in XR), `pR` (R privat), `pRX` (R in XR), `pXD` (X in XD), `pDX` (D in XD), `pD` (D privat, später nach XD geteilt), `pDR` (in Matrix B). „∅“ = keine Zeile sichtbar, „— (kein Recht)“ = Postgres-Fehler 42501. Der Nachbau setzt dabei die **alten** automatischen Rechte; die Migration nimmt sie zurück.

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

**Lesart:** O3 ist erfüllt. David sieht in A nur XD, in B zusätzlich DR, aber nie `pR`, `pRX`, `pXR`. Eine offene Anfrage zeigt nur Name und Code der Gegenseite, keine Projekte. Nach dem Ende von XR (C) bleiben die Songs lesbar, Speichern wird als Fassung aufgehoben (`readonly`), Presence ist aus. `anon` bekommt überall „kein Recht“ (Storage zeigt „∅“, weil Supabase dort `anon` Rechte gibt und erst RLS filtert).

### 3.5 Weitere geprüfte Regeln (Auszug aus `rls-matrix.out`)

- Gleichzeitiges Speichern: erster gewinnt (`ok`), zweiter bekommt `conflict`; je Person, Gerät, Stand und Grund gibt es genau **eine** Konflikt-Fassung mit dem neuesten Inhalt.
- Übernimmt René nach Xander, wird Xanders letzter Stand als `handover` aufgehoben.
- Wiederholung mit altem Stand und gleichem Inhalt → `same` (kein Scheinkonflikt).
- Ältere App (`app_code` kleiner) oder Format 3 gegen gespeichertes Format 4 → `outdated`, nichts überschrieben, Fassung aufgehoben.
- `auto`-Version höchstens alle 10 min; älter als 30 Tage bleibt je Tag nur der letzte Stand (10 Tage × 2 → 10).
- Einlass-Liste: Registrierung ohne Einladung → Hook-Fehler 403; nach `invite_email` → erlaubt; Hook und Liste sind für Nutzer nicht erreichbar.
- Ablehnen sperrt neue Anfragen derselben Person 24 h; gegenseitige Anfrage verbindet sofort; Zurückziehen geht.
- Selbstprüfung wie der Advisor: alle Funktionen mit festem `search_path`, RLS auf allen Tabellen in `public`, `anon` ohne Tabellenrechte, `anon` darf nur `ping` ausführen, Publikation nur Kopf-Tabellen und **ohne DELETE**.
- **Nachprüfungen Review r7 (20 Fälle, alle bestanden):** zwei eigene Geräte → zwei Konflikt-Fassungen, je die neueste; „Ältere App“ und „Gleichzeitig“ getrennt · `p_app = 2147483647` → `bad_version`, das Projekt bleibt für den Partner offen · Kopie aus XR → Teilen nach XD = `mixed_origin`, nach XR = `shared`; fremder Herkunfts-Raum beim Anlegen verweigert · `invite_email` durch Nicht-Verwalter verweigert; Einladung → nach Konto-Anlage offene Anfrage von Xander; Adresse mit Konto → direkt Anfrage; kein `has_account` · Senden/Zurückziehen höchstens 3-mal je Paar und 24 h (`slow_down`) · doppelter Name → ein Treffer ohne ID („mehrere“) · `save_library`: altes Gerät bekommt `conflict` mit dem Server-Inhalt · Quote: Anlegen über der Grenze → `54000 quota`; normales Speichern geht weiter (`quota: true`, ohne auto-Version); Merken nicht · `mark_version` höchstens 20 je Stunde · `storage_report`: DB-Größe nur für Verwalter · `admin_thin` nur für Verwalter · eigene Aufnahme im Raum nicht löschbar · `private.settings`/`admins` nicht erreichbar.
- `attack.after.out`: A3 (`bad_version`), A5 (beide `forbidden`), A6 (3 statt 15), A7 (ein Treffer ohne Code) sind behoben. A1/A2 zeigen weiter den alten Verlust, weil das Angriffs-Skript **ohne** `p_client` und mit `p_app` über `max_app` speichert. Der Fall mit Geräte-Kennung steht in `rls-matrix.out` (R7). A4: Die Quote begrenzt David jetzt auf 60 MiB (vorher unbegrenzt).

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
- **Anfragen:** „David möchte mit dir Musik machen · [Ansehen]“; Annahme beim Partner → „René hat angenommen – Raum ‚Mit René‘ ist da“. Die Anfrage aus einer Einladung (VO-E13) liegt schon beim ersten Laden nach „Konto anlegen“ vor; dafür braucht es kein Realtime.
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

**Erster Besuch über den Einladungs-Link** (Review r7): [Freund einladen] erzeugt `https://xanderfoxy.github.io/synquenzer/#mitmachen=<email-urlencoded>&von=Xander`. Startet die App mit diesem Hash, öffnet sich das Online-Blatt sofort im Modus „Konto anlegen“. Die E-Mail ist vorausgefüllt (änderbar), die Kopfzeile lautet „Xander lädt dich zum Musikmachen ein. Leg ein Passwort fest, fertig.“ Danach entfernt `history.replaceState` den Hash. Hat das Gerät schon `cloud:me`, startet das Segment auf „Anmelden“. So entfällt der wahrscheinlichste Abbruchpunkt (Menü suchen, E-Mail genau so tippen wie Xander).

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
│ [ René                                 ] │ 48  ≤ 24 Zeichen
│ [            Konto anlegen             ] │ 52  Hauptknopf
│ Nur mit Einladung von Xander.            │
│ Passwort vergessen? Frag Xander.         │
│                                          │
└──────────────────────────────────────────┘
Mit Einladungs-Link: Kopfzeile „Xander lädt dich zum Musikmachen ein. Leg ein Passwort fest, fertig.“, Segment auf „Konto anlegen“, E-Mail vorausgefüllt.
Bei offener Tastatur: Erklärtext ausblenden, aktives Feld und Hauptknopf per visualViewport-resize + scrollIntoView({block:'nearest'}) sichtbar halten (§6.10).
Fehlertexte (unter dem Knopf, rot): „Diese E-Mail ist nicht eingeladen. Bitte frag Xander nach einer Einladung.“ ·
„E-Mail oder Passwort stimmt nicht.“ · „Passwort: mindestens 8 Zeichen.“ · „Keine Verbindung – versuch es gleich noch mal.“
```
**Querformat L1 (844×390):**
```
┌─────────────────────────────────┬─────────────────────────────────────────────────┐
│ Online                       [✕]│ E-Mail                                          │ 40
│ Deine Songs liegen dann auch    │ [ rene@beispiel.de                    ]         │ 44
│ online und sind nach dem        │ Passwort                                        │
│ Neuladen nie weg.               │ [ ••••••••••              ] [zeigen]            │ 44
│ [ Anmelden ][ Konto anlegen ]   │ Dein Name: [ René                   ]           │ 44
│ Nur mit Einladung: Xander       │ [           Konto anlegen            ]          │ 44
│ trägt deine E-Mail ein.         │ Passwort vergessen? Frag Xander.                │
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
│ [ Freund einladen ]  [ Papierkorb ]      │ 48  „Er bekommt eine Anfrage und muss zustimmen.“
│ Speicher online: 12 % · [Aufräumen]      │ 24  nur Xander (Verwalter); Freunde sehen „Dein Platz: 8 %“
│ [ Abmelden ]                             │ 44  Zwei-Schritt
└──────────────────────────────────────────┘
```

[Freund einladen] ist nur für Xander sichtbar (VO-E13). Darunter steht: „Er bekommt eine Anfrage und muss zustimmen.“ Danach erscheint das Teilen-Blatt mit dem Einladungs-Link als einzigem Inhalt der Nachricht. [Aufräumen] ruft `admin_thin(90)` auf (automatische Versionen älter als 90 Tage → eine je Woche), Zwei-Schritt.

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
│ E-Mail, Name oder Code                   │
│ [ rene@beispiel.de                   ]   │ 48
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
„René hat abgelehnt – neue Anfrage morgen möglich“ · „Niemand gefunden. Tipp: genaue E-Mail oder Code.“
```
**Querformat L1:**
```
┌─────────────────────────────────┬─────────────────────────────────────────────────┐
│ ‹ Zurück                        │ E-Mail, Name oder Code                          │ 40
│ Zusammenarbeit anfragen         │ [ rene@beispiel.de        ] [ Suchen ]          │ 44
│ René sieht erst nach seinem     │ René · Code QZ4H7T                              │
│ „Annehmen“ eure gemeinsamen     │ Nachricht: [ Lass uns Song X fertig… ]          │ 44
│ Songs. Andere sehen sie nie.    │ [             Anfragen               ]          │ 44
└─────────────────────────────────┴─────────────────────────────────────────────────┘
 Querformat L1: Suche und Ergebnis rechts, Erklärung links
```
Suche nur exakt: E-Mail, Freundes-Code oder genauer Name (nur wer „über meinen Namen findbar“ an hat; nie E-Mail-Adressen). Ein Name liefert nur bei **genau einem** Treffer eine Person; sonst „Mehrere heißen so – bitte Code oder E-Mail“ (Review r7, Doppelgänger). Ergebnis zusätzlich: „Bitte morgen noch mal“ (`slow_down`, höchstens 3 Anfragen je Person und Tag). Die Ergebniskarte zeigt immer den Freundes-Code.

### 6.5b Eingehende Anfrage (P, Sicht René)

```
┌──────────────────────────────────────────┐
│ Online                               [✕] │ 44
│ ● Online                                 │ 28
│ ┌ Anfrage ─────────────────────────────┐ │
│ │ Xander möchte mit dir Musik machen.  │ │
│ │ Code K7Q2MX · hat dich eingeladen    │ │
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
Toast bei René, wenn die Anfrage kommt: „Xander möchte mit dir Musik machen · [Ansehen]“.

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
  lib: {local: 'vendor/supabase-js-2.117.2.umd.js',
        cdn: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js',
        sri: 'sha384-Rj26LVGvoeRVR6+mwQmFfcR3QOBEwT+ZmuCWpuiqeTzJpCs0ER4ITAWGb4Hiy3Ok'}};
const SYNC = {
  state,              // 'viewer'|'signedOut'|'online'|'syncing'|'offline'|'paused'|'error'
  init(), useClient(factory),                 // useClient nur für Tests (FakeSupa statt supabase-js)
  signUp(email, pw, name), signIn(email, pw), signOut(),
  onLocalWrite(snap), onSwitch(oldId, newId), push(lid), flush(),
  pullHeads(since), open(sid), reconcile(lid),
  share(lid, spaceId), copyToPrivate(sid), resolve(lid, 'take'|'both'), versions(sid), restore(versionId),
  saveLibrary(), importFromHash(), viewerHandoff(),                              // save_library mit Sperre; #import / #mitmachen; Viewer → Safari
  findUser(q), request(userId, note), respond(reqId, accept), cancel(reqId), endCollab(spaceId), invite(email),
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
cloudSignUp(email, pw, name): Promise<'ok'|'not_invited'|'weak'|'error'>
cloudSignIn(email, pw): Promise<'ok'|'bad'|'error'>   ·   cloudSignOut(force?: boolean): Promise<'ok'|'pending'>
cloudSync(): Promise<{pushed: number, pulled: number}>      // flush + pullHeads
cloudProjects(spaceId?: string|null): Promise<{sid, title, owner, updatedBy, updatedAt, version, mine: boolean}[]>
cloudOpen(sid): Promise<void>   ·   cloudShare(spaceId): Promise<string>   ·   cloudResolve('take'|'both'): Promise<void>
cloudFind(q): Promise<{id, name, code}[]>   ·   cloudRequest(id, note?) / cloudRespond(reqId, accept) / cloudEnd(spaceId)
cloudVersions(sid): Promise<{id, kind, by, at}[]>   ·   cloudRestore(versionId): Promise<void>
cloudUseFake(handle): void                               // nur Tests: FakeSupa-Brücke statt supabase-js
```
`runtime()` bekommt `cloud: {state, outbox}`; `noteLog` bleibt.

### 7.7 Testplan (berührt nie das echte Projekt)

| Stufe | Werkzeug | Inhalt |
|---|---|---|
| T1 SQL | `online-test/rls-matrix.mjs` (Node, PGlite + Shim) | jede Policy und RPC; jede neue RPC bekommt eigene Fälle; muss 100 % bestehen |
| T2 Sync-Logik | `fake-supa.mjs` (Prototyp, 10/10) in Node | Push/Pull/Konflikt/Outbox gegen echte SQL-Logik; Fehler-Einspeisung `offline`, `paused` (540), `failNext` (503), `latencyMs` |
| T3 Browser | Playwright/Chromium wie v2/v3; `addInitScript` setzt eine Fake-Global `supabase` mit `createClient`, deren Aufrufe per `page.exposeFunction('__fakeSupa', …)` an **einen** FakeSupa-Backend in Node gehen; mehrere Kontexte = Xander, René, David | Abläufe, Realtime-Toasts, O3 im DOM, Neuladen, Konflikt-UI, M-PLATZ |
| T3b Offline | Playwright `context.setOffline(true)` nach dem ersten Laden, dann `page.reload()` | `sw.js`: App startet mit dem letzten Projekt, Punkt grau |
| T4 Netz-Sperre | `page.route('**/*.supabase.co/**', r => r.abort())`, Zähler muss 0 bleiben; `page.route('**/cdn.jsdelivr.net/**')` liefert die lokale `vendor`-Datei | Garantie: kein echter Netzverkehr in Tests |
| T5 iPhone (Xander) | Prüfpunkte in CHANGES | 3–5 Punkte je Paket, z. B. Konto anlegen, Neuladen, zweites Gerät, Partner speichert; dazu einmal: öffnet [In Safari öffnen und mitnehmen] aus der Claude-App wirklich Safari? Bietet Safari „Passwort sichern“ an? |

### 7.8 Abnahme-Checkliste

**VO1**
- [ ] N8O-01 Viewer: Mit `window.claude.use`-Attrappe im Rahmen ist `cloud().state === 'viewer'`; 0 Anfragen an `*.supabase.co` und an supabase-js (Anfrage-Protokoll); grauer Punkt dauerhaft, Zeile „Nur auf diesem Gerät – nicht online“, [In Safari öffnen und mitnehmen] öffnet `<Adresse>#import=…`; die Safari-Version importiert daraus ein deep-equal Projekt und entfernt den Hash.
- [ ] N8O-02 Ohne gespeicherte Sitzung lädt der Start weder `vendor/…` noch jsDelivr (0 Anfragen); Startzeit nach §15.3 (≤ +150 ms, Median aus 5).
- [ ] N8O-03 supabase-js nur mit passendem SRI: eine um 1 Byte veränderte `vendor`-Datei wird verworfen; Zustand `error` mit Text „Online gerade nicht verfügbar“, lokal läuft alles weiter.
- [ ] N8O-04 Konto anlegen (Fake): eingeladene E-Mail → Profil mit Name (≤ 24 Zeichen); nicht eingeladen → Text „Diese E-Mail ist nicht eingeladen …“, keine Sitzung; Passwort < 8 → Text, kein Aufruf.
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
- [ ] N8O-21 `rls-matrix.mjs` gegen die eingebaute Migration: alle Fälle bestanden (heute 107); neue RPCs mit eigenen Fällen.
- [ ] N8O-22 Anfragen im UI: Suche per E-Mail, Name, Code; doppelter Name → „Mehrere heißen so …“; 4. Anfrage am Tag an dieselbe Person → „Bitte morgen noch mal“; Anfrage → Gegenseite hat Toast und Karte ≤ 2 s; [Annehmen] → beide sehen den Raum ≤ 2 s; [Ablehnen] → Anfragender sieht „abgelehnt“, neue Anfrage erst nach 24 h.
- [ ] N8O-23 O3 im UI mit drei Kontexten nach XR und XD: Davids DOM und alle Antworten an David enthalten keinen Titel und keine ID aus XR (Text- und Antwort-Suche); nach DR sieht David DR, weiter nicht XR.
- [ ] N8O-24 Teilen „Nur ich → Mit René“ (nur Eigentümer): René sieht es ≤ 2 s; ein Verschieben zwischen Räumen wird nicht angeboten; eine „Kopie in Nur ich“ aus „Mit René“ lässt sich nicht mit David teilen (Zeile grau, Server `mixed_origin`).
- [ ] N8O-25 Partner speichert: Toast „René hat ‚Song X‘ gespeichert“ ≤ 2 s; 5 Speicherungen in 60 s → 1 Toast, Liste 5-mal aktuell; eigene Speicherungen ohne Toast.
- [ ] N8O-26 Offenes Projekt, Partner speichert: gestoppt und sauber → Toast mit [Laden]; beim Spielen kein automatisches Laden (`noteLog` unverändert bis zum Tipp).
- [ ] N8O-27 Konflikt: beide ändern; Toast „René hat ‚Song X‘ geändert · [Übernehmen] [Beide behalten]“ und Karte im Online-Blatt. **Danach 5 min weiterarbeiten** (Push läuft weiter, Erinnerung nach 10 min), dann Übernehmen → lokal = Server, meine Konflikt-Fassung auf dem Server hat den md5 des **letzten** lokalen Stands; Beide behalten → neues Projekt „Song X (Xanders Version)“ im Raum mit dem letzten lokalen Stand; danach drei Stände abrufbar. Konflikt nur über Realtime erkannt → sofortiger Push, Konflikt-Fassung liegt auf dem Server.
- [ ] N8O-27b Zwei eigene Geräte (zwei Kontexte, verschiedene `cloud:device`) ändern auf demselben alten Stand → zwei getrennte Konflikt-Fassungen auf dem Server.
- [ ] N8O-27c Presence-light: René hat „Song X“ offen; Xander tippt „Song X“ → Karte „René arbeitet gerade an ‚Song X‘. [Trotzdem öffnen] [Als Kopie öffnen]“.
- [ ] N8O-28 Zusammenarbeit beenden (Zwei-Schritt): beide sehen „nur lesen“; Speichern → Fassung aufgehoben (`readonly`); [Kopie in „Nur ich“] erzeugt ein eigenes Projekt.
- [ ] N8O-29 Verpasste Ereignisse: während `hidden` liefert der Fake nichts; nach `visible` stimmt die Liste ≤ 3 s.
- [ ] N8O-30 [Freund einladen] (nur Xander sichtbar) legt die E-Mail in die Einlass-Liste und zeigt den Einladungs-Link `…#mitmachen=<email>&von=Xander`; der Link öffnet bei René das Blatt „Konto anlegen“ mit vorausgefüllter E-Mail; direkt nach dem Anlegen sieht René die Karte „Xander möchte mit dir Musik machen · [Annehmen] [Ablehnen]“; der Hash ist danach weg.

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
| R0 | Xanders Entscheidungen | eigene Organisation (empfohlen) · Region Frankfurt `eu-central-1` (nahe an Deutschland, eK) · Login E-Mail + Passwort · E-Mails von René/David · **eigene Adresse** (GitHub Pages, F6) · Wach-Ping (Vorgabe ja) | Antworten in `fragen-xander-*.md` |
| R0b | Eigene Herkunft | Repo `xanderfoxy/synquenzer` (öffentlich) mit GitHub Pages aus `main`; vorher den Gültigkeitsbereich von `sw.js` des Klassenzimmers prüfen (darf `/synquenzer/` nicht abdecken) | `https://xanderfoxy.github.io/synquenzer/` lädt die App; ohne das wird Online nicht ausgeliefert |
| R1 | Organisation „SYNQUENZER“ (Free) und Projekt „synquenzer“ anlegen | Dashboard oder Supabase-MCP `create_project`; Datenbank-Passwort in Xanders Passwort-Manager | MCP `list_projects`: zwei Projekte, das neue mit eigener `ref` |
| R2 | Migration `vo_init` = `online-schema.sql` | MCP `apply_migration` **mit der `ref` des neuen Projekts** (vorher zweimal vergleichen) | `list_tables` zeigt 9 Tabellen; `get_advisors(security)`: kein ERROR, WARN 0029 für die RPCs ist gewollt |
| R3 | Auth einstellen | Dashboard: Authentication → Sign In / Providers → Email an, **Confirm email aus**, Mindestlänge 8 · URL Configuration: Site URL und Redirect URL = Pages-Adresse (R0b) · Hooks: „Before User Created“ → Postgres → `public.hook_before_user_created` | Testkonto mit nicht eingeladener E-Mail wird abgelehnt (Xander am iPhone) |
| R4 | Einlass-Liste und Verwalter | Xanders E-Mail per MCP `execute_sql`: `insert into private.signup_allowlist(email) values (lower('…'))` — oder Xander legt sein Konto **vor** dem Einschalten des Hooks an. Danach `insert into private.admins(user_id) select id from auth.users where email = lower('…')` | Xander kann ein Konto anlegen; in der App erscheint [Freund einladen] |
| R5 | Realtime (vor VO3) | Dashboard: Realtime → Settings → „Allow public access“ **aus** (nur private Kanäle) | – |
| R6 | Schlüssel in die App | MCP `get_project_url` und `get_publishable_keys` (nur lesen) → `CLOUD.url`, `CLOUD.key` (`sb_publishable_…`). **Nie** den geheimen Schlüssel | Suche im Build: kein `sb_secret_` |
| R7 | Ausliefern | **Vor jeder** App-Version mit Online: `update private.settings set max_app = <APP_CODE>, max_format = <PROJECT_FORMAT>` (Migration). Dann `index.html` + `sw.js` + `vendor/supabase-js-2.117.2.umd.js` nach `xanderfoxy/synquenzer` (Pages); der Zweig `dirigent-synth` (githack) und das Artifact bekommen dieselbe Datei, dort bleibt Online aus | Pages zeigt die neue Version; Speichern liefert kein `bad_version` |
| R8 | Probe durch Xander | Konto anlegen, Song ändern, Seite neu laden, auf zweitem Gerät öffnen | 3 iPhone-Prüfpunkte in CHANGES |
| R9 | Freunde einladen (ab VO2) | Xander: Menü → Online → [Freund einladen] → René-E-Mail → WhatsApp mit **nur dem Einladungs-Link** (`…#mitmachen=<email>&von=Xander`) · René tippt den Link, legt ein Passwort fest und sieht sofort die Anfrage · René: [Annehmen] → „Mit René“ / „Mit Xander“. David ↔ René: [Zusammenarbeit anfragen] mit Suche | beide sehen den Raum |
| R10 | Wach-Ping (Vorgabe ja) | GitHub-Action im Repo `synquenzer` täglich: `curl -s -X POST "$URL/rest/v1/rpc/ping" -H "apikey: $KEY" -H "Content-Type: application/json" -d '{}'`; einmal im Monat ein leerer Keepalive-Commit, damit der Zeitplan nicht nach 60 Tagen abgeschaltet wird (W2) | Supabase schickt keine Pause-Warnung mehr |
| R11 | Sicherung | App: [Alles sichern] (alle eigenen Projekte + Sounds als eine JSON-Datei), Erinnerung monatlich; Free-Plan hat keine herunterladbaren Sicherungen | Datei lässt sich öffnen |
| R12 | Passwort zurücksetzen (auf Bitte) | Dashboard: Authentication → Users → Person → neues Passwort; für Xander genauso. Nie aus der App, nie mit dem geheimen Schlüssel im Browser | Person meldet sich an |

---

## 9. Pakete, Abhängigkeiten, Reihenfolge

| Paket | Inhalt | Dauer | Budget |
|---|---|---|---|
| **VO1** | Migration + Rollout R0b–R8 (eigene Pages-Adresse ist Bedingung) · SYNC-Kern (lokal zuerst, Warteschlange je Konto, Geräte-Kennung, Server-Autosave auch im Konflikt, Start-Abgleich mit `isPristine`, Versions-Wächter) · `sw.js` · Anmelde-Blatt (echtes Formular), Status-Punkt, Online-Abschnitt, kleine Bildschirme §6.10 · „Nur ich“-Liste vom Server · Versionen ansehen/zurückholen · eigene Sounds über `save_library` · Viewer: [In Safari öffnen und mitnehmen] · Tests T1–T4 | ≈ 6–7 h | +38 KB |
| **VO2** | Anfragen (Suchen, Anfragen, Annehmen/Ablehnen, Zurückziehen), Paar-Räume, Teilen (mit Herkunfts-Raum), Raum-Listen mit Autor/Zeit, Realtime-Abos und Toasts, Konflikt-Wahl, Presence-light („René arbeitet gerade an …“), Zusammenarbeit beenden, Freund einladen mit Link (= Anfrage) | ≈ 7–8 h | +33 KB |
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
4. **VO2** (≈ 7–8 h): Zusammenarbeit mit René.
5. dann V2 (FANG TEIL, Song-Ablauf) und der Rest.

Will Xander René sofort dabeihaben, rückt VO2 vor V4; technisch kostet das nichts (keine Abhängigkeit), Kodamo kommt dann ≈ 7–8 h später.
Hinweis zur Gruppe V4: VC2a (Verlauf-Rekorder) braucht Format 4 und Undo-Gruppen aus V2a (EN-14) und darf deshalb nicht mit V4 vor V2 rücken.

---

## 10. Risiken und offene Fragen

**Risiken**
- Pausieren nach 7 Tagen ohne Nutzung: Wach-Ping (Vorgabe ja) und Ping beim App-Start; sonst sagt die App es je Person klar und bietet [Alles sichern] an (§2.2). Restrisiko: Pause länger als 90 Tage **und** Safari löscht den Skript-Speicher → dann zählt allein die Sicherungsdatei.
- Gemeinsame githack-Herkunft (§2.7): behoben durch die Bedingung „Online nur unter eigener Pages-Adresse“. Restrisiko: `xanderfoxy.github.io` teilt die Herkunft mit Xanders anderen Pages-Seiten (eigener Code).
- `private.settings.max_app` muss vor jedem Ausliefern erhöht werden (R7). Vergisst man es, bekommt die neue App `bad_version`; es geht nichts verloren (lokal + Outbox), aber online steht bis zur Migration.
- Ein böswilliger **Partner** kann im gemeinsamen Raum weiter Inhalte überschreiben oder in den Papierkorb legen (gewollt, F7); alles bleibt über Versionen zurückholbar. Die Quote begrenzt den Schaden für alle anderen.
- Ohne Mail-Dienst kein Selbst-Reset des Passworts; Registrierung ohne Bestätigung heißt: Wer eine eingeladene E-Mail zuerst benutzt, bekommt das Konto (Einladung erst kurz vorher anlegen).
- Echte Latenz, Hintergrund-Verhalten (WebSocket zu, wenn Safari die Seite schlafen legt) und Speicher-Löschung am iPhone sind ungemessen (eK/SE).
- Die SQL-Prüfung lief in PGlite (Postgres 18.3) mit Nachbau; Supabase nutzt Postgres 15/17 und echte Auth/Realtime. Verwendet wurden nur Funktionen ab Postgres 15; trotzdem nach R2 die Advisors laufen lassen.
- `rls-matrix.mjs` muss mit jeder Änderung an der Migration mitwachsen.

**Fragen an Xander** (der Bau nimmt die Vorgabe in Klammern)
- F1 Eigene Organisation „SYNQUENZER“? (ja)
- F2 Anmeldung mit E-Mail + Passwort wie im Klassenzimmer? (ja)
- F3 Welche E-Mails dürfen rein (René, David)? (Xander lädt in der App ein)
- F4 Täglicher Wach-Ping über GitHub? (**ja**, mit monatlichem Keepalive-Commit; Review r7)
- F5 Später eigener Mail-Dienst für „Passwort vergessen“ und Code-Login? (nein)
- F6 Safari-Version auf eigene Adresse (GitHub Pages, Repo `synquenzer`)? (**ja, Bedingung für Online**; githack bleibt ohne Online)
- F8 Darf nur Xander einladen? (ja; Freunde fragen untereinander über die Suche an)
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
- L4 Messungen und Prüfungen: `v3-ideen/r7/online-test/measure-size.out`, `rls-matrix.out` (107/107), `fake-supa.out` (10/10), `review-sec/attack.out` und `attack.after.out`.

---

## Review-Protokoll (r7, 24 Befunde)

Jeder Befund wurde vor der Änderung geprüft: SQL-Befunde über `review-sec/attack.out` und Code-Lesen, `isPristine`/`demoProject` in V0a (Z. 16879, 9424), die übrigen am Text. Danach liefen `rls-matrix.mjs` (**107/107**, davon 20 neue Fälle) und `fake-supa.mjs` (**10/10**) neu. `attack.after.out` hält den Stand nach den Änderungen fest.

**Übernommen:** Konflikt-Schlüssel je Gerät (VO-E11) · Push läuft im Konflikt weiter (§4.3/4.5) · Quote und Tempo (VO-E12) · eigene Herkunft als Bedingung (§2.7, R0b) · Einladen nur Verwalter, ohne `has_account` (VO-E13) · `save_library` mit Sperre · Obergrenzen `max_app`/`max_format` · Publikation ohne DELETE · Anfrage-Tempo 3 je Paar und 24 h · Namenssuche nur eindeutig · Konto-Trennung auf einem Gerät (§4.4) · kein Löschen von Raum-Aufnahmen · Herkunfts-Raum `mixed_origin` · Einladungs-Link · Einladen = Anfrage · Wach-Ping ja und Texte je Person · `isPristine` im Abgleich · Viewer-Brücke · `sw.js` · Regeln für kleine Bildschirme (§6.10) · [Jetzt neu laden] · Passwort-Autofill und R12 · Presence-light in VO2 · Begriffe und Mockup 6.5b.

**Zusammengelegt (doppelt):** „Erst-Abgleich lädt fremde Projekte hoch“ (minor) und „Lokale Daten nicht nach Konto getrennt“ (blocking) → eine Lösung in §4.4. „push() stoppt bei Konflikt“ kam zweimal (major/major) → eine Lösung in §4.3/4.5.

**Abgelehnt oder anders gelöst:**
- Konflikt-Fassung: „Bei jedem anderen md5 eine neue Zeile einfügen“ abgelehnt. Weil die App im Konflikt weiter hochlädt, entstünde alle 2 s eine Zeile. Stattdessen Upsert je (Person, Gerät, Stand, Grund).
- Quote: „`54000` bei jedem Speichern über der Grenze“ abgelehnt, das widerspräche O4. Der aktuelle Stand wird weiter gespeichert, nur automatische Versionen setzen aus. Anlegen, Merken, Bibliothek und Übergabe-Versionen werden abgelehnt.
- Namen: partieller Unique-Index auf `lower(display_name)` abgelehnt, weil er das Anlegen eines Kontos im Trigger scheitern ließe. Stattdessen liefert die Suche bei mehreren Treffern „mehrere“, und die Karte zeigt den Code.
- Blockieren (`private.blocks`) vorerst nicht übernommen: Konten gibt es nur noch über Xanders Einladung, und das Anfrage-Tempo begrenzt den Spam.
- Bibliothek: Tages-Verlauf nicht übernommen, die Sperre verhindert den Verlust schon. Eine Zeile je Sound wäre ein größerer Umbau.
- Herkunfts-Raum: Zwei-Schritt-Ausnahme „Trotzdem mit David teilen“ nicht übernommen. Es gilt die strenge Regel, passend zu O3.
- Presence-light über Spalten `open_by/open_at` abgelehnt: Schreiben alle 60 s würde Realtime-UPDATEs auslösen, die wie Speicherungen aussehen. Stattdessen kommt der fertige private Presence-Kanal in VO2.
- Raum-Aufnahmen: „DELETE nur ohne Verweis“ nicht übernommen. Für Nutzer gibt es gar kein DELETE, Aufräumen macht nur der Verwalter.
- Offen und als ungeprüft markiert: ob `target="_blank"` aus dem Artifact-Rahmen am iPhone Safari öffnet (T5, Rückweg über die Zwischenablage).

