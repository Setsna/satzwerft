/* Satzwerft: Texte für den Erwachsenenbereich (zwei Aufklapper unter der Startseite), Aufbau wie Chancenbucht.
   Von Ingo freigegeben am 16.11.2026 (Änderung: Lehrplan ohne „Erprobungsfassung 2026“). Entwurf: Dateien/Beispiele-Entwuerfe/werftbuch-erwachsene-urkunde.md
   Keine Seitenangaben zu Zebra (Ingo, 16.11.2026).
   Abschnitte: titel, absaetze [Text], liste [[fett, Text]], tabelle { kopf: [..], zeilen: [[..]] }, datenschutzLink.
   Alles läuft in js/app.js durch esc(), es gibt kein HTML in den Texten. */
(() => {
  'use strict';
  const SA = window.SA = window.SA || {};
  const DATEN = 'Die Kinder melden sich mit ihrem Zugangscode an. Es ist derselbe wie beim Perlentaucher. Gespeichert werden unter diesem Code nur die Stempel und die Zahl der geschafften Aufgaben je Station und Stufe. Welche Sätze ein Kind gelegt oder markiert hat, wird nicht gespeichert. So ist der Stand auf jedem Gerät da, in der Schule und zu Hause. Der Stand liegt zusätzlich im Browser des Geräts, damit auch ohne Internet gearbeitet werden kann. Andere Kinder sehen ihn nicht, eine Auswertung für die Lehrkraft gibt es nicht. Löschen lassen können Sie den Stand über die Lehrkraft.';
  const DATEN_URKUNDE = 'Die Urkunde entsteht auf dem Gerät und wird weder gespeichert noch verschickt.';

  SA.erwachsene = {
    eltern: {
      titel: 'Für Eltern',
      abschnitte: [
        { titel: 'Worum es geht', absaetze: [
          'In der Satzwerft untersuchen Kinder der Klassen 3 und 4 Sätze. Sie stellen Satzglieder um, trennen sie mit Strichen und finden sie mit Fragen.',
          'Die Kinder probieren zuerst aus. Erst danach nennt die Seite das Fachwort, zum Beispiel Satzglied, Subjekt oder Prädikat.'
        ] },
        { titel: 'Die Stationen', liste: [
          ['Umstellprobe', 'Sätze umstellen und sehen, welche Wörter zusammenbleiben. Fragen ohne Fragewort bilden.'],
          ['Satzglieder trennen', 'Striche zwischen die Satzglieder setzen.'],
          ['Subjekt und Prädikat', 'Mit den Fragen „Was tut jemand?“ und „Wer oder was?“ die beiden wichtigsten Satzglieder finden.'],
          ['Zeit und Ort', 'Zeitbestimmung und Ortsbestimmung mit Wann?, Wo? und ähnlichen Fragen finden (Klasse 4).'],
          ['Wem und Wen', 'Wem-Ergänzung und Wen-Ergänzung finden (Klasse 4).'],
          ['Ersetzen und erweitern', 'Ein Satzglied austauschen oder einen Satz länger machen (Klasse 4).'],
          ['Kann das stimmen?', 'Rio behauptet etwas über Sätze, Ihr Kind prüft es.']
        ] },
        { titel: 'Gut zu wissen', absaetze: [
          'Es gibt keinen Zeitdruck und keine Rangliste.',
          'Ihr Kind wählt die Stufe selbst. Die Seite empfiehlt eine.',
          'Wenn eine Umstellung zwar möglich ist, aber ungewohnt klingt, zählt das nicht als Fehler. Die Seite bittet dann um eine andere Reihenfolge.'
        ] },
        { titel: 'Tipp für zu Hause', absaetze: [
          'Schreiben Sie einen Satz auf einen Papierstreifen und schneiden Sie ihn mit Ihrem Kind in Satzglieder. Legen Sie die Stücke in eine neue Reihenfolge und lesen Sie den Satz laut.',
          'Fragen Sie beim Vorlesen: „Wer oder was?“ und „Was tut jemand?“'
        ] },
        { titel: 'Daten', absaetze: [DATEN, DATEN_URKUNDE], datenschutzLink: true },
        { titel: 'Der Code', absaetze: [
          'Der Code gehört Ihrem Kind. Wer ihn kennt, kann sich damit anmelden. Auf einem fremden Gerät am Ende bitte auf „Abmelden“ tippen.'
        ] }
      ]
    },
    lehrkraefte: {
      titel: 'Für Lehrkräfte',
      abschnitte: [
        { titel: 'Konzept', absaetze: [
          'Satzglieder werden über die Umstellprobe und die Frageprobe ermittelt, nicht über Wortarten. Ein Satzglied ist, was beim Umstellen zusammenbleibt.',
          'Die erlaubten Reihenfolgen werden aus der Verb-zweit-Regel berechnet: Im Aussagesatz steht das gebeugte Verb an zweiter Stelle, ein zweiter Prädikatteil am Ende, im Fragesatz ohne Fragewort steht das Verb vorn. Die übrigen Satzglieder bleiben in der Grundreihenfolge. Jeder Satz ist von Hand geschrieben und hat genau eine Zerlegung.'
        ] },
        { titel: 'Prinzip und Umsetzung', tabelle: { kopf: ['Prinzip', 'Umsetzung'], zeilen: [
          ['Erst probieren, dann das Fachwort', 'Die Kinder stellen um und markieren. Das Fachwort steht erst nach dem Lösen da.'],
          ['Konkrete Rückmeldung', 'Die Seite sagt, welcher Strich fehlt, welche Wörter zusammenbleiben oder auf welche Frage ein Satzglied antwortet.'],
          ['Kein Fehler für Mögliches', 'Eine mögliche, aber ungewohnte Reihenfolge zählt nicht als Fehler.'],
          ['Nicht nur Farbe', 'Gefundene Satzglieder haben eine Farbe und zusätzlich eine Beschriftung und eine eigene Linie.'],
          ['Bedienung ohne Ziehen', 'Kärtchen lassen sich antippen und versetzen, mit Pfeiltasten verschieben oder ziehen.'],
          ['Differenzierung', 'Drei Stufen je Station. Gestufte Tipps von Rio, ohne die Lösung zu verraten.'],
          ['Am Tisch', 'Zu jeder Station eine Idee mit Papierstreifen, Kärtchen oder einer Satz-Reihe aus Kindern.']
        ] } },
        { titel: 'Die Stationen und das Heft', liste: [
          ['Umstellprobe', 'Klasse 3. Leicht drei, mittel vier Satzglieder, knifflig Fragesätze und zweiteilige Prädikate mit trennbaren Verben.'],
          ['Satzglieder trennen', 'Klasse 3. Striche setzen wie im Arbeitsheft, mit der Umstellprobe als Tipp.'],
          ['Subjekt und Prädikat', 'Klasse 3. Prädikat zuerst, dann die Frage nach dem Subjekt. Ab mittel steht das Subjekt nicht vorn.'],
          ['Zeit und Ort', 'Klasse 4. Wann?, Wie oft?, Wie lange?, Wo?, Woher?, Wohin?'],
          ['Wem und Wen', 'Klasse 4. Leicht Wen-, mittel Wem-, knifflig beide Ergänzungen.'],
          ['Ersetzen und erweitern', 'Klasse 4. Ersetzen und erweitern mit drei vorgegebenen Satzgliedern, knifflig danach umstellen.'],
          ['Kann das stimmen?', 'Typische Fehlvorstellungen: Das Subjekt steht immer vorn, jedes Wort ist ein Satzglied.']
        ] },
        { titel: 'Lehrplanbezug', absaetze: [
          'LP Thüringen Deutsch Grundschule, Lernbereich „Sprache und Sprachgebrauch untersuchen“: mit Sprache experimentieren, Sätze umstellen, Satzglieder ermitteln (Umstellprobe, Frageprobe), Fachwortschatz Satzglied, Subjekt, Prädikat. Der Lehrplan trennt hier nicht nach Klasse 3 und 4, die Einteilung folgt dem Schulcurriculum.',
          'Fachwörter wie im Lehrwerk Zebra: Zeitbestimmung, Ortsbestimmung, Wem-Ergänzung, Wen-Ergänzung.'
        ] },
        { titel: 'Einsatz', absaetze: [
          'Gut als Station im Wochenplan, nach einer Einführung mit Satzstreifen am Tisch.',
          'An der Tafel lässt sich die Umstellprobe gemeinsam zeigen: Ein Kind schiebt die Kärtchen, die Klasse liest mit.'
        ] },
        { titel: 'Daten', absaetze: [DATEN, DATEN_URKUNDE], datenschutzLink: true }
      ]
    }
  };
})();
