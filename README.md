# Satzwerft

Lernplattform zu den Satzgliedern für die Klassen 3 und 4 (8 bis 10 Jahre), Teil der Lernlagune.
Die Kinder stellen Sätze um, trennen Satzglieder mit Strichen und finden Subjekt, Prädikat, Zeit- und Ortsbestimmungen sowie Wem- und Wen-Ergänzungen mit Fragen.
Begleiter ist Rio, ein Delfin. Es gibt keine Punkte, keinen Zeitdruck und keine Ranglisten.

## Stationen

Jede Station hat drei Stufen (leicht, mittel, knifflig). Eine Runde hat sechs Aufgaben, ab fünf geschafften gibt es einen Stempel.

| Station | Klasse | Was geübt wird |
|---|---|---|
| Umstellprobe | 3 | Satzglied-Kärtchen umstellen, Fragesätze ohne Fragewort, zweiteilige Prädikate |
| Satzglieder trennen | 3 | Striche zwischen die Satzglieder setzen |
| Subjekt und Prädikat | 3 | Was tut jemand? Wer oder was? |
| Zeit und Ort | 4 | Wann? Wie oft? Wie lange? Wo? Woher? Wohin? |
| Wem und Wen | 4 | Wem-Ergänzung, Wen-Ergänzung |
| Ersetzen und erweitern | 4 | Satzglied austauschen, Satz länger machen und umstellen |
| Kann das stimmen? | 3 | Rio behauptet etwas über Sätze, das Kind prüft es |

Dazu ein Werftbuch mit allen Stempeln und „Das kann ich schon“ und eine Urkunde als PDF, die auf dem Gerät entsteht.

Grundlage ist der Lehrplan Thüringen Deutsch Grundschule (Lernbereich „Sprache und Sprachgebrauch untersuchen“). Vorlage für Art und Stufe der Aufgaben ist das Lehrwerk Zebra. Alle Sätze, Texte und Aufgaben sind selbst geschrieben.

## Fachliche Grundsätze

- Ein Satzglied ist, was beim Umstellen zusammenbleibt (Umstellprobe), nicht eine Wortart.
- Jeder Satz ist von Hand als Datensatz geschrieben (Satzglieder in Grundreihenfolge mit Rolle). Die Seite leitet nichts aus freiem Text ab.
- Die erlaubten Reihenfolgen werden aus der Verb-zweit-Regel berechnet (`js/satz.js`). Eine mögliche, aber ungewohnte Reihenfolge zählt nicht als Fehler.
- Erst probieren, dann das Fachwort.

## Was liegt wo?

| Datei | Inhalt |
|---|---|
| `index.html` | eine Seite für Anmeldung, Startseite, Stationen und Werftbuch |
| `js/config.js` | alle Einstellungen: Stationen, Stufen, Runde |
| `js/satz.js` | Satz- und Prüflogik (Verb-zweit-Regel, Trennung, Rollen) |
| `js/saetze.js`, `js/aufgaben.js` | Satzpool und Aufgaben je Station |
| `js/kacheln.js` | Kärtchen umstellen, trennen, markieren (Tippen, Tasten, Ziehen) |
| `js/station-rahmen.js`, `js/station-teile.js` | gemeinsamer Ablauf und Teile der Stationen |
| `js/stationen/` | die Stationen |
| `js/logbuch.js`, `js/urkunde.js` | Werftbuch und Urkunde (PDF ohne Bibliothek) |
| `js/sa-stand.js`, `js/konto-*.js` | Stand des Kindes und gemeinsames Konto der Lernlagune |
| `js/app.js`, `js/erwachsene.js` | Ansichten, Bedienung, Erwachsenenbereich |
| `css/` | Farben und Maße (`tokens.css`), Seite, Kärtchen und Rollen (`satz.css`), Stationen |
| `bilder/`, `schriften/` | Rio, Hintergrund, App-Symbole; Andika und Libre Caslon Text (OFL, Lizenztexte liegen bei) |

## Anmeldung und Daten

Die Kinder melden sich mit demselben Zugangscode an wie im Perlentaucher. Gespeichert werden in Firebase (`sa_stand/<code>`) nur Stempel und die Zahl der geschafften Aufgaben je Station und Stufe, kein Vorname, keine gelegten Sätze. Die Datenbankregeln erlauben genau die 21 festen Schlüssel (7 Stationen × 3 Stufen). Zurücksetzen und Löschen gehen über den Lehrerbereich des Perlentauchers. Einzelheiten stehen in `datenschutz.html`.

## Veröffentlichen

- Hinter jeder lokalen `js`- und `css`-Datei steht `?v=N`. Bei jeder Änderung wird die Zahl in allen HTML-Dateien hochgezählt, sonst laden Geräte alte Fassungen.
- Die `.gitignore` sperrt alles und gibt nur die fertige Seite frei. Neue Dateien oder Ordner auf oberster Ebene dort eintragen.
- Werkzeuge und Tests liegen außerhalb dieses Repositorys und gehen nicht ins Netz.

## Stand

- 16.11.2026: erste Veröffentlichung, `?v=1`, alle sieben Stationen, Werftbuch und Urkunde. GitHub Pages aus `main`.
- 16.11.2026: `?v=2`, Design-Review Runde 2 (Lücken fest im Satzfeld, Rückmeldung in Navy mit Zeichen, Ziehen mit sichtbarer Marke, Trennen deutlicher und gelöst als Planken, Laufschienen, Rio auf der Startseite).
