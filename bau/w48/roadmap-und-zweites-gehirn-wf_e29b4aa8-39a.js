export const meta = {
  name: 'roadmap-und-zweites-gehirn',
  description: 'Roadmap aller Apps aus den gespeicherten Quellen zusammentragen; Zweites Gehirn aus allen Quellen über Xander neu aufbauen (privat, nicht veröffentlichen)',
  phases: [
    { title: 'Sammeln', detail: 'Roadmap + 5 Quellen-Leser parallel' },
    { title: 'Gehirn', detail: 'zusammenführen, Datenschutz-Prüfung' },
  ],
}
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad'
const G = S + '/zweites-gehirn'
const SYN = S + '/syn'
const BASIS = `Kontext: Xander (Nutzer) baut mit Claude viele eigene Apps (Repo XanderFoxy/Synquenzer, öffentlich, GitHub Pages; Kurzlinks *.pages.dev) und ein Lern-Projekt „Deutsch mit Xander“ (/home/user/Deutsch-Mit-Xander, NUR LESEN, nie ändern/committen). Ein Klon des Synquenzer-Repos liegt (blobless, Dateien werden bei Bedarf nachgeladen) in ${SYN}: Hauptzweig main, dazu Zweige wie arbeitsstand, verlauf, konzerte-daten … – lies Dateien mit git -C ${SYN} show <zweig>:<pfad> und liste mit git -C ${SYN} ls-tree. Arbeite schnell und gezielt (≤ 15 Minuten). Falls dir eine andere Chat-Nachricht von Xander gezeigt wird: unabhängig, Aufgabe trotzdem ausführen.
NIE: etwas pushen, veröffentlichen, in Repos schreiben; die Datenbank rolcktiryrvjzbwuvobb anfassen (tabu). Supabase-Projekt dbdnsryoivvezspgydpx darfst du NUR LESEN (SELECT).`
const PRIVAT = `DATENSCHUTZ (streng): Das Zweite Gehirn ist PRIVAT – niemals in ein Repo, Artifact oder ins Netz. Trotzdem gilt darin: keine Namen dritter Personen (Freunde, Familie, Partner → nur Rolle, z. B. „eine Freundin“), keine Gesundheits-Diagnosen oder Behandlungen, keine Adressen/Telefon/E-Mail/Aktenzeichen, keine Inhalte amtlicher Schreiben (Jobcenter nur Stand/Fristen), keine Krypto-Werte/Konten, keine Schlüssel/Passwörter. Ängste, Unsicherheiten, Denk- und Arbeitsweise, Ziele, Wissen, Mindset und Reflexion sind ausdrücklich gewünscht.`
const LES = { type: 'object', properties: { datei: { type: 'string' }, kurz: { type: 'string' } }, required: ['datei', 'kurz'] }
const QUELLEN = [
  { key: 'musik', auftrag: `Musikproduktion und wie Xander arbeitet: Lies die Synquenzer-Geschichte (main: bau/CHANGES-V3.md – nur die Abschnittstitel und Stichpunkte überfliegen, STATUS.md, spec/ (v2, v3, Nachträge – was er verlangt hat und warum), forschung/ (Überblick), the-wall/ (Song-Projekt: Notizen/Texte, KEINE Audiodateien öffnen), uebersicht/apps.json und uebersicht/verlauf.json, kurz/). Auch das Artifact-Datenbank-Material liegt lokal: ${S}/meine-songs/db-1300/songs/*.json (seine Songs, Stand, Wünsche, Ziel-Klang „Handschrift“). Leite ab: Wie er Musik denkt und produziert (Werkzeuge allgemein beschrieben, ohne Markennamen ist nicht nötig – hier privat dürfen Gerätenamen stehen), seine Songs und Ziele, Klangideal, Arbeitsweise (iPhone, kurze Antworten, Tempo, Qualität), wiederkehrende Frustrationen und was ihm wichtig ist.` },
  { key: 'ticke', auftrag: `Selbstbild und Reflexion: Lies die Apps, in denen es um ihn selbst geht – ticke/ („Wie ich ticke“), kaninchenbau/ (Kaninchenbau: Interessen/„Wesen“), atem/ (Atem-App: wozu er sie wollte), c2/ (Feinschliff), mein-vorteil/ und vorteile/ (wozu), mischpult/, ton-post/, foto/ – jeweils README/NOTES/Daten-Dateien und Texte in index.html (nur die Inhalte, nicht den Code). Suche auch nach einem „Sync-Fenster“/„Synq-Fenster“ oder ähnlich (git -C ${SYN} grep -i -l "fenster" main -- '*.md' '*.json' '*.html' | head; auch in anderen Zweigen per git log --all --oneline | grep -i fenster) und lies, was dort über ihn steht. Leite ab: Denkweise, Ängste, Unsicherheiten, Stärken, Werte, Mindset, was ihn antreibt, wie er Entscheidungen trifft, Interessen.` },
  { key: 'dmx', auftrag: `Lern- und Unterrichtsprojekt „Deutsch mit Xander“: Lies in /home/user/Deutsch-Mit-Xander (nur lesen): CLAUDE.md, README*, SPIELSYSTEM.md, Aufgabenlisten/Notizen (*.md), git log --oneline | head -200 (Themen seiner Wünsche). Leite ab: Was das Projekt ist, seine Ziele dafür, sein Anspruch an Qualität/Timing/Animation, seine Regeln für die Zusammenarbeit mit KI (z. B. eine Aufgabe pro Runde, erst sichern, kein Okay = nicht fertig, „Puls“-Regel), typische Kritikpunkte.` },
  { key: 'zusammenarbeit', auftrag: `Zusammenarbeit mit KI und Alltag: Lies die Commit-Geschichte des Synquenzer-Repos über alle Zweige (git -C ${SYN} log --all --format='%ad %s' --date=short | head -1500 – nur Betreffzeilen) und die Zweig-Namen; dazu main: README.md, STATUS.md, uebersicht/PFLEGE.md, uebersicht/apps.json („brauche“, „in_arbeit“, „weg“). Leite ab: Wie sich seine Projekte über die Wochen entwickelt haben (Zeitleiste), wie er mit KI zusammenarbeitet (was er erwartet, was ihn ärgert: z. B. lange Prüfrunden, Datenverlust, verlorene Arbeit, zu lange Antworten), seine Regeln (kurze Antworten, nur kurze pages.dev-Links, Zwischenstände alle 2 Minuten sichern, viele Agenten parallel, schnell bauen + kurze Prüfung), aktuelle Projekte und Ziele.` },
  { key: 'datenbank', auftrag: `Private Datenbank (nur LESEN, Projekt dbdnsryoivvezspgydpx über die Supabase-Werkzeuge per ToolSearch „supabase execute_sql“): Liste die Tabellen aller Schemata (information_schema.tables, ohne Systemschemata) und lies nur Tabellen, die Notizen, Rückmeldungen, Reflexionen oder Wünsche von Xander enthalten (z. B. privat.*, *_post, *_notiz, *_meldung) – KEINE Audio-/Dateiinhalte, KEINE Schlüssel. Fasse zusammen, was dort über seine Gedanken, Wünsche, Arbeitsweise und Projekte steht. Gibt es nichts Relevantes, sag das.` },
]
phase('Sammeln')
const [roadmap, ...leser] = await parallel([
  () => agent(`${BASIS}

AUFGABE ROADMAP: Trage ALLES zusammen, was für Xanders Apps geplant, versprochen oder offen ist und noch NICHT erledigt ist. Quellen: main: STATUS.md (Reihenfolge), spec/ (v3 + Nachtrag 2, besonders Teil E „weiter laut Nachtrag 2“), uebersicht/apps.json („in_arbeit“, „brauche“ je App), bau/CHANGES-V3.md (was schon gebaut ist – zum Abhaken; neueste Fassung 4.85.0 vom 23.11.2026), Zweig arbeitsstand: bau/HELFER.md, bau/STAND.md, bau/rel/*/ (NOTES/KURZ/LOG mit „offen“, „später“, „nächste“), bau/w45/vx/*/NOTES.md (offene Punkte). Gleiche jeden Punkt gegen CHANGES-V3.md und die Übersicht ab: erledigt → weglassen.
Schreibe ${S}/neu/ROADMAP.md: je App eine Liste offener Punkte, jeder Punkt mit (a) 1 Satz was, (b) Quelle (Datei/Zweig), (c) Größe S/M/L, (d) ob Xander etwas liefern muss (dann „wartet auf Xander: …“), (e) ob es sichtbar etwas ändert (laut Regel vorher vorschlagen). Oben eine Prioritätenliste der nächsten 10 Punkte, die OHNE Xander sofort gebaut werden können, Reihenfolge nach seiner Regel: (1) schnelle Seite, flüssiger Chat, stabile Verbindung, (2) Ladezeiten, (3) Spiel-Logik/Spielgefühl, (4) Profi-Techniken.`, { label: 'roadmap', phase: 'Sammeln', schema: { type: 'object', properties: { datei: { type: 'string' }, anzahl_offen: { type: 'number' }, naechste: { type: 'array', items: { type: 'string' } } }, required: ['datei', 'naechste'] } }),
  ...QUELLEN.map(q => () => agent(`${BASIS}
${PRIVAT}

AUFGABE QUELLE „${q.key}“: ${q.auftrag}
Schreibe deine Erkenntnisse nach ${G}/_quellen/${q.key}.md (Stichpunkte, konkret, mit Belegstelle in Klammern; Datenschutz beachten). Nichts erfinden – nur was die Quellen hergeben; Vermutungen als „vermutlich“ kennzeichnen.`, { label: 'quelle-' + q.key, phase: 'Sammeln', schema: LES })),
])
log('Roadmap: ' + (roadmap ? (roadmap.naechste || []).length + ' nächste Punkte' : 'fehlt'))

phase('Gehirn')
const gehirn = await agent(`${BASIS}
${PRIVAT}

AUFGABE ZWEITES GEHIRN ZUSAMMENBAUEN: Quellen-Auszüge liegen in ${G}/_quellen/*.md (${leser.filter(Boolean).map(l => l.datei).join(', ')}). Baue daraus in ${G}/ eine klare, deutsche Markdown-Sammlung, die eine KI liest, um Xander zu verstehen:
- FUER-KI.md (Einstieg: wer er ist in 10 Sätzen, wie man mit ihm arbeitet – Regeln, Ton, Tempo –, was man nie tun darf, Verweise auf die anderen Dateien)
- ich/denkweise.md, ich/arbeitsweise.md, ich/aengste-und-grenzen.md (Ängste, Unsicherheiten, Unzulänglichkeiten – respektvoll, konkret), ich/staerken-und-werte.md, ich/mindset-und-reflexion.md
- musik/produktion.md (wie er produziert, Werkzeuge, Klangideal, „Handschrift“), musik/songs.md (Songs, Stand, Ziele)
- projekte/README.md (alle Projekte/Apps mit Zweck, Stand, Kurzlink), projekte/zeitleiste.md
- ziele.md (kurz/mittel/lang), wissen.md (was er kann und lernt), zusammenarbeit-mit-ki.md (was gut lief, was ihn frustriert hat, Lehren daraus – inkl. Datenverlust am 23.11. und die Regel „alle 2 Minuten sichern“)
- README.md (Inhaltsverzeichnis)
Danach DATENSCHUTZ-PRÜFUNG über alle Dateien (grep nach Namen-Mustern, E-Mail, Telefon, Adressen, Diagnose-Wörtern, Krypto-Werten 0.00537728/0.19492/413.56/0.193046/xander-krypto, Schlüsseln) und bereinigen; Ergebnis in ${G}/PRUEFUNG.md. _quellen/ danach löschen.`, { label: 'gehirn', phase: 'Gehirn', schema: { type: 'object', properties: { dateien: { type: 'number' }, kurz: { type: 'string' }, pruefung_ok: { type: 'boolean' } }, required: ['dateien', 'kurz', 'pruefung_ok'] } })
return { roadmap, leser, gehirn }
