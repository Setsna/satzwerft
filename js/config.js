/* Satzwerft: alle Einstellungen an einer Stelle.
   Klassisches Skript, legt window.SA.config an. */
(() => {
  'use strict';
  const SA = window.SA = window.SA || {};

  SA.config = {
    name: 'Satzwerft',
    unterzeile: 'Sätze bauen und umbauen.',
    maskottchen: 'Rio',
    buchName: 'Werftbuch',

    /* Speicher im Browser (Baukasten js/konto-speicher.js):
       localStorage   satzwerft-v1.k<kennung>            Stand samt Vorname (für die Anzeige ohne Netz)
                      satzwerft-v1.k<kennung>.abgleich   zuletzt abgeglichener Stand
       sessionStorage satzwerft-v1-wer                   welches Kind in diesem Tab angemeldet ist
       Die Kennung wird aus dem Code errechnet, der Code selbst steht nicht im Namen. */
    speicher: { schluessel: 'satzwerft', schema: 1 },
    codeLaenge: 8,
    nameMaxLaenge: 20,

    /* Gemeinsames Konto: das Firebase-Projekt des Perlentauchers.
       Diese Angaben sind keine Geheimnisse, sie stehen bei jeder Firebase-Seite im Quelltext.
       Geschützt werden die Daten durch die Regeln in der Firebase-Konsole (Block sa_stand). */
    firebase: {
      apiKey: 'AIzaSyBX3MUJq69uFyejbEiJimGeAtHMER3OCdE',
      authDomain: 'lernplattform-44aa1.firebaseapp.com',
      projectId: 'lernplattform-44aa1',
      storageBucket: 'lernplattform-44aa1.firebasestorage.app',
      messagingSenderId: '213839225177',
      appId: '1:213839225177:web:4cf676269e50c708466c48'
    },
    cloud: {
      kinder: 'kinder',        /* kinder/<code>: Vorname, von der Lehrkraft angelegt (nur lesen) */
      stand: 'sa_stand',       /* sa_stand/<code>: der Stand dieses Kindes in der Satzwerft */
      schreibPauseMs: 2500     /* so lange nach der letzten Änderung warten, dann gebündelt schreiben */
    },

    /* Stationen und Stufen. Die Ids sind Teil der Firebase-Regeln (feste Schlüssel 'station:stufe').
       Eine neue Station oder Stufe braucht eine Regeländerung (Regel-Block sa_stand und tools/test/sa-gueltig.js).
       klasse: für die Startseite (Kl. 3 oder Kl. 4), nicht gespeichert. */
    stationen: [
      { id: 'umstellen', name: 'Umstellprobe', kurz: 'Sätze umstellen', klasse: 3, live: true },
      { id: 'trennen', name: 'Satzglieder trennen', kurz: 'Striche setzen', klasse: 3, live: true },
      { id: 'finden', name: 'Subjekt und Prädikat', kurz: 'Wer oder was? Was passiert?', klasse: 3, live: true },
      { id: 'bestimmungen', name: 'Zeit und Ort', kurz: 'Wann? Wo?', klasse: 4, live: true },
      { id: 'ergaenzungen', name: 'Wem und Wen', kurz: 'Ergänzungen finden', klasse: 4, live: true },
      { id: 'erweitern', name: 'Ersetzen und erweitern', kurz: 'Sätze verändern', klasse: 4, live: true },
      { id: 'stimmt', name: 'Kann das stimmen?', kurz: 'Stimmt, was Rio sagt?', klasse: 3, live: true }
    ],
    stufen: ['leicht', 'mittel', 'knifflig'],

    /* Eine Runde: so viele Aufgaben, Stempel ab so vielen geschafften (wie Chancenbucht) */
    runde: { aufgaben: 6, stempelAb: 5, versucheBisLoesung: 2 },

    /* Obergrenze für runden je Schlüssel (wie im Regel-Block) */
    rundenMax: 100000,

    /* Versionsnummer der Bilder, getrennt von ?v=N für js und css */
    bildStand: 1
  };
})();
