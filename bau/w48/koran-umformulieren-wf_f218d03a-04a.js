export const meta = {
  name: 'koran-umformulieren',
  description: 'Zu ähnliche Verse frisch aus dem Arabischen übersetzen (Urheberrecht)',
  phases: [{ title: 'Übersetzen', detail: 'je Block frisch formulieren' }],
}
const R = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/religion'
const bloecke = args.bloecke
const erg = await parallel(bloecke.map((b, i) => () => agent(`AUFTRAG (Urheberrecht, öffentliche App): Diese Verse unserer eigenen deutschen Koran-Übersetzung ähneln im Wortlaut zu stark einer geschützten modernen Übersetzung. Übersetze sie NEU und eigenständig aus dem Arabischen.
Verse: ${b.join(', ')}
Quellen (nur diese benutzen): Arabisch ${R}/v2/basis/koran-ar.json, Pickthall 1930 ${R}/v2/basis/koran-en-pickthall.json, Rodwell 1861 im Feld "rod" der Teil-Dateien ${R}/v2/basis/tNN.json. KEINE moderne deutsche Übersetzung ansehen oder nachbilden (nicht suchen, nicht aus dem Gedächtnis).
Unsere aktuelle Fassung steht in ${R}/v2/ueb/tNN.json (welcher Teil: ${R}/v2/basis/teile.json mit von/bis). Ändere NUR die genannten Verse in der jeweiligen ueb-Datei:
- Sinn exakt erhalten (nichts abschwächen, nichts verschärfen), wortnah zum Arabischen, aber mit eigener, natürlicher deutscher Satzstellung und Wortwahl; wo es mehrere treue Möglichkeiten gibt, eine weniger formelhafte wählen (z. B. andere Satzanfänge, „Gott“ bleibt „Allah“, göttliches „Wir“ bleibt).
- Ergänzungen weiter in [eckigen Klammern], Erläuterungen in (runden Klammern) dürfen bleiben.
- Datei schrittweise lesen → ändern → schreiben; am Ende python3: gültiges JSON, alle Verse vorhanden.
Antworte mit einer Liste „Vers: alt → neu“ (nur die ersten 10) und der Zahl geänderter Verse.`, { label: `umformulieren:${i + 1}`, phase: 'Übersetzen' })))
return erg
