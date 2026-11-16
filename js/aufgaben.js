/* Satzwerft: Aufgaben aller Stationen (Auswahl aus dem Satzpool und von Hand geschriebene Aufgaben).
   Von Ingo geprüft am 16.11.2026 (Ausgaben/Satzprüfung.md). Neue Aufgaben vor dem Einbau wieder prüfen lassen.
   Klassisches Skript, legt window.SA.aufgaben an. Braucht SA.satz, SA.saetze, SA.config.

   vorrat(station, stufe)  alle möglichen Aufgaben
   runde(station, stufe, rnd)  eine Runde (config.runde.aufgaben Stück, keine doppelt), rnd() liefert [0, 1)
   pruefe(station, aufgabe)  Liste mit Fehlern (leer = gültig), genutzt von tools/test/satz-test.js */
(() => {
  'use strict';
  const SA = window.SA = window.SA || {};
  const Z = () => SA.satz;
  const P = () => SA.saetze;
  const hat = (s, r) => Z().hat(s, r);
  const ohneTeil2 = s => Z().teil2(s) < 0;

  /* ---------- Ersetzen und erweitern (von Hand) ----------
     ersetzen:  satz, stelle (Index), optionen [Text|Rolle], die erste Option ist richtig (wird gemischt)
     erweitern: satz, frage (Rolle + Fragewort), optionen, ergebnis (der neue Satz), bei knifflig danach umstellen */
  const E = (id, satz, stelle, optionen) => ({ id, art: 'ersetzen', satz: Z().aus(id, satz), stelle, optionen: optionen.map(o => Z().aus('o', [o, 'x|P', 'y|X']).glieder[0]) });
  const W = (id, satz, optionen, ergebnis, mehr = {}) => {
    const opt = optionen.map(o => Z().aus('o', [o, 'x|P', 'y|X']).glieder[0]);
    return Object.assign({ id, art: 'erweitern', satz: Z().aus(id, satz), optionen: opt, ziel: opt[0], ergebnis: Z().aus(id + '-neu', ergebnis) }, mehr);
  };
  let ERWEITERN = null;
  function erweitern() {
    if (ERWEITERN) return ERWEITERN;
    ERWEITERN = {
      leicht: [
        E('e01', ['der Hund|S', 'bellt|P', 'laut|X'], 0, ['der Welpe|S', 'im Garten|O', 'morgen|Z']),
        E('e02', ['Mia|S', 'liest|P', 'ein Buch|A'], 2, ['einen Brief|A', 'am Abend|Z', 'im Bett|O']),
        E('e03', ['der Delfin|S', 'schwimmt|P', 'im Hafen|O'], 2, ['im Meer|O', 'heute|Z', 'der Wal|S']),
        E('e04', ['die Sonne|S', 'scheint|P', 'heute|Z'], 2, ['am Morgen|Z', 'im Garten|O', 'die Lampe|S']),
        E('e05', ['Tom|S', 'malt|P', 'ein Schiff|A'], 0, ['Lina|S', 'ein Boot|A', 'am Tisch|O']),
        E('e06', ['der Bus|S', 'hält|P', 'vor der Schule|O'], 2, ['am Bahnhof|O', 'jeden Tag|Z:oft', 'der Zug|S']),
        E('e07', ['Ben|S', 'baut|P', 'eine Burg|A'], 2, ['einen Turm|A', 'am Strand|O', 'am Nachmittag|Z']),
        E('e08', ['der Kapitän|S', 'lacht|P', 'laut|X'], 0, ['der Fischer|S', 'heute|Z', 'im Boot|O'])
      ],
      mittel: [
        W('w01', ['der Delfin|S', 'springt|P', 'hoch|X'], ['am Morgen|Z', 'im Hafen|O', 'den Ball|A'], ['der Delfin|S', 'springt|P', 'am Morgen|Z', 'hoch|X']),
        W('w02', ['Tom|S', 'liest|P', 'ein Buch|A'], ['am Abend|Z', 'im Bett|O', 'die Oma|S'], ['Tom|S', 'liest|P', 'am Abend|Z', 'ein Buch|A']),
        W('w03', ['Mia|S', 'spielt|P', 'Fußball|A'], ['im Park|O', 'heute|Z', 'den Ball|A'], ['Mia|S', 'spielt|P', 'im Park|O', 'Fußball|A']),
        W('w04', ['der Fischer|S', 'fängt|P', 'einen Fisch|A'], ['im Hafen|O', 'gestern|Z', 'das Boot|A'], ['der Fischer|S', 'fängt|P', 'im Hafen|O', 'einen Fisch|A']),
        W('w05', ['der Zug|S', 'fährt|P', 'langsam|X'], ['nach Taipei|O:hin', 'am Bahnhof|O', 'um acht Uhr|Z'], ['der Zug|S', 'fährt|P', 'langsam|X', 'nach Taipei|O:hin']),
        W('w06', ['Opa|S', 'repariert|P', 'das Boot|A'], ['am Sonntag|Z', 'im Hafen|O', 'den Motor|A'], ['Opa|S', 'repariert|P', 'am Sonntag|Z', 'das Boot|A']),
        W('w07', ['die Katze|S', 'schläft|P', 'ruhig|X'], ['auf dem Sofa|O', 'am Mittag|Z', 'die Maus|S'], ['die Katze|S', 'schläft|P', 'ruhig|X', 'auf dem Sofa|O']),
        W('w08', ['Ben|S', 'schenkt|P', 'einen Ball|A'], ['seinem Bruder|D', 'am Freitag|Z', 'im Garten|O'], ['Ben|S', 'schenkt|P', 'seinem Bruder|D', 'einen Ball|A'])
      ],
      knifflig: [
        W('x01', ['der Hund|S', 'schläft|P', 'im Korb|O'], ['den ganzen Tag|Z:lange', 'im Garten|O', 'der Kater|S'], ['der Hund|S', 'schläft|P', 'den ganzen Tag|Z:lange', 'im Korb|O'], { umstellen: true }),
        W('x02', ['das Schiff|S', 'fährt|P', 'nach Tainan|O:hin'], ['am Abend|Z', 'im Hafen|O', 'den Kapitän|A'], ['das Schiff|S', 'fährt|P', 'am Abend|Z', 'nach Tainan|O:hin'], { umstellen: true }),
        W('x03', ['Lea|S', 'ruft|P', 'ihren Opa|A', 'an|P2'], ['am Sonntag|Z', 'im Flur|O', 'laut|X'], ['Lea|S', 'ruft|P', 'am Sonntag|Z', 'ihren Opa|A', 'an|P2'], { umstellen: true }),
        W('x04', ['der Vogel|S', 'singt|P', 'laut|X'], ['auf dem Dach|O', 'jeden Morgen|Z:oft', 'ein Lied|A'], ['der Vogel|S', 'singt|P', 'laut|X', 'auf dem Dach|O'], { umstellen: true }),
        W('x05', ['Tim|S', 'kauft|P', 'ein Eis|A'], ['seiner Schwester|D', 'am Strand|O', 'morgen|Z'], ['Tim|S', 'kauft|P', 'seiner Schwester|D', 'ein Eis|A'], { umstellen: true }),
        W('x06', ['der Bus|S', 'fährt|P', 'ab|P2'], ['um neun Uhr|Z', 'an der Schule|O', 'schnell|X'], ['der Bus|S', 'fährt|P', 'um neun Uhr|Z', 'ab|P2'], { umstellen: true }),
        W('x07', ['die Ente|S', 'schwimmt|P', 'langsam|X'], ['zum Ufer|O:hin', 'im Teich|O', 'am Morgen|Z'], ['die Ente|S', 'schwimmt|P', 'langsam|X', 'zum Ufer|O:hin'], { umstellen: true }),
        W('x08', ['der Koch|S', 'kocht|P', 'eine Suppe|A'], ['in der Küche|O', 'am Mittag|Z', 'den Topf|A'], ['der Koch|S', 'kocht|P', 'in der Küche|O', 'eine Suppe|A'], { umstellen: true })
      ]
    };
    return ERWEITERN;
  }
  /* Was gesucht ist: die Rolle der richtigen Option und ihr Fragewort */
  const frageZu = g => Z().fragewort(g);

  /* ---------- „Kann das stimmen?“: Rio behauptet etwas ---------- */
  const R = (id, behauptung, stimmt, warum, beispiel) => ({ id, behauptung, stimmt, warum, beispiel });
  const STIMMT = {
    leicht: [
      R('s01', 'Ein Satzglied kann aus mehreren Wörtern bestehen.', true, '„Im Hafen“ sind zwei Wörter. Sie bleiben beim Umstellen zusammen. Also sind sie ein Satzglied.', 'Im Hafen schwimmt der Delfin.'),
      R('s02', 'Beim Umstellen darf ich ein Satzglied auseinandernehmen.', false, 'Die Wörter eines Satzglieds bleiben zusammen. „Im“ und „Hafen“ wandern immer gemeinsam.', 'Der Delfin schwimmt im Hafen.'),
      R('s03', 'Beim Umstellen bleiben alle Wörter im Satz.', true, 'Es kommt kein Wort dazu und keins fällt weg. Nur die Reihenfolge ändert sich.', 'Heute scheint die Sonne.'),
      R('s04', 'Das Prädikat ist immer ein Nomen.', false, 'Das Prädikat sagt, was jemand tut oder was passiert. Es ist immer ein Verb.', 'Die Möwe kreischt laut.'),
      R('s05', 'Das Subjekt findest du mit der Frage: Wer oder was?', true, 'Wer oder was kreischt laut? Die Möwe. „Die Möwe“ ist das Subjekt.', 'Die Möwe kreischt laut.'),
      R('s06', 'Nach dem Umstellen schreibe ich das erste Wort groß.', true, 'Am Satzanfang schreibt man immer groß. „heute“ wird vorne zu „Heute“.', 'Heute scheint die Sonne.'),
      R('s07', 'Jedes Wort ist ein eigenes Satzglied.', false, '„Der“ und „Hund“ bleiben beim Umstellen zusammen. Zusammen sind sie ein Satzglied.', 'Am Strand bellt der Hund.'),
      R('s08', 'Ein Satz aus drei Satzgliedern kann ich auf zwei Arten sagen.', true, 'Das Verb bleibt das zweite Satzglied. Vorne kann das eine oder das andere Satzglied stehen.', 'Der Wind weht stark. Stark weht der Wind.')
    ],
    mittel: [
      R('s11', 'Im Aussagesatz steht das Prädikat als zweites Satzglied.', true, 'Egal, wie du umstellst: Das Verb ist immer das zweite Satzglied. Zähl die Satzglieder, nicht die Wörter.', 'Heute spielt Lea im Garten.'),
      R('s12', 'Das Subjekt steht immer ganz vorn.', false, 'Das Subjekt kann wandern. Hier steht „Lea“ an dritter Stelle.', 'Heute spielt Lea im Garten.'),
      R('s13', 'In der Frage „Spielt Lea heute im Garten?“ steht das Prädikat vorn.', true, 'Bei einer Frage ohne Fragewort kommt das Verb nach vorn.', 'Spielt Lea heute im Garten?'),
      R('s14', '„Im Garten“ ist ein Satzglied, weil es beim Umstellen zusammenbleibt.', true, 'Genau so findest du Satzglieder: mit der Umstellprobe.', 'Im Garten spielt Lea heute.'),
      R('s15', 'Wenn ich umstelle, hat der Satz danach zwei Prädikate.', false, 'Beim Umstellen kommt nichts dazu. Der Satz hat weiter ein Prädikat.', 'Am Sonntag repariert Opa das Boot.'),
      R('s16', 'Bei „Laut bellt der Hund.“ bellt jemand anderes als bei „Der Hund bellt laut.“', false, 'Beide Male bellt der Hund. Die Bedeutung bleibt gleich, nur die Reihenfolge ist anders.', 'Laut bellt der Hund.'),
      R('s17', 'Mit der Frage „Was tut jemand?“ finde ich das Subjekt.', false, 'Mit „Was tut jemand?“ findest du das Prädikat. Das Subjekt findest du mit „Wer oder was?“.', 'Tim isst mittags eine Suppe.'),
      R('s18', 'Ein Satzglied hat immer mindestens zwei Wörter.', false, '„Lea“ und „heute“ sind nur ein Wort. Trotzdem sind sie Satzglieder.', 'Lea spielt heute im Garten.')
    ],
    knifflig: [
      R('s21', 'Bei „Der Bus fährt gleich ab.“ gehört „ab“ zum Prädikat.', true, 'Das Verb heißt „abfahren“. Es steht hier in zwei Teilen: „fährt“ und „ab“.', 'Der Bus fährt gleich ab.'),
      R('s22', 'Der zweite Teil des Prädikats steht im Aussagesatz am Ende.', true, 'Der erste Teil ist das zweite Satzglied, der zweite Teil steht ganz hinten.', 'Gleich fährt der Bus ab.'),
      R('s23', '„Ab fährt der Bus gleich.“ ist eine gute Umstellung.', false, 'Der zweite Teil des Prädikats bleibt am Ende. Richtig ist: „Gleich fährt der Bus ab.“', 'Gleich fährt der Bus ab.'),
      R('s24', 'Bei „Seinen Opa ruft Tom am Abend an.“ ist „seinen Opa“ das Subjekt.', false, 'Wer oder was ruft an? Tom. „Tom“ ist das Subjekt, auch wenn er nicht vorn steht.', 'Seinen Opa ruft Tom am Abend an.'),
      R('s25', 'Bei „Mia räumt heute ihr Zimmer auf.“ besteht das Prädikat aus „räumt“ und „auf“.', true, 'Das Verb heißt „aufräumen“. Beide Teile zusammen sind das Prädikat.', 'Heute räumt Mia ihr Zimmer auf.'),
      R('s26', 'Auch wenn das Subjekt nicht vorn steht, finde ich es mit „Wer oder was?“.', true, 'Die Frage hilft immer: Wer oder was legt an? Das Schiff.', 'Am Morgen legt das Schiff im Hafen an.'),
      R('s27', 'In „Laut kreischt die Möwe.“ ist „laut“ das Subjekt, weil es vorn steht.', false, 'Vorn steht nicht immer das Subjekt. Wer oder was kreischt? Die Möwe.', 'Laut kreischt die Möwe.'),
      R('s28', 'Bei „Die Sonne geht am Abend unter.“ ist das Prädikat „geht … unter“.', true, 'Das Verb heißt „untergehen“. „geht“ ist das zweite Satzglied, „unter“ steht am Ende.', 'Am Abend geht die Sonne unter.')
    ]
  };

  /* ---------- Vorrat je Station und Stufe ---------- */
  const markier = (s, gesucht, reihe = null) => ({ id: s.id, satz: s, gesucht, reihe });
  function vorrat(st, stufe) {
    const p = P();
    const pool4 = [...p.leicht, ...p.mittel, ...p.knifflig, ...p.knifflig4, ...p.klasse4];
    switch (st) {
      case 'umstellen':
        if (stufe === 'leicht') return p.leicht.map(s => ({ id: s.id, satz: s, art: 'aussage' }));
        if (stufe === 'mittel') return p.mittel.map(s => ({ id: s.id, satz: s, art: 'aussage' }));
        return [...p.knifflig.map(s => ({ id: s.id, satz: s, art: 'aussage' })), ...p.mittel.map(s => ({ id: 'f-' + s.id, satz: s, art: 'frage' }))];
      case 'trennen':
        if (stufe === 'leicht') return p.leicht.map(s => ({ id: s.id, satz: s }));
        if (stufe === 'mittel') return p.mittel.map(s => ({ id: s.id, satz: s }));
        return [...p.knifflig, ...p.klasse4.filter(s => s.glieder.length >= 4)].map(s => ({ id: s.id, satz: s }));
      case 'finden':
        if (stufe === 'leicht') return p.leicht.map(s => markier(s, ['praedikat', 'subjekt']));
        if (stufe === 'mittel') return p.mittel.map(s => markier(s, ['praedikat', 'subjekt'], 'um'));
        return p.knifflig.map(s => markier(s, ['praedikat', 'subjekt'], 'um'));
      case 'bestimmungen': {
        const einer = pool4.filter(s => hat(s, 'zeit') !== hat(s, 'ort'));
        const beide = pool4.filter(s => hat(s, 'zeit') && hat(s, 'ort'));
        if (stufe === 'leicht') return einer.filter(s => s.glieder.every(g => !g.f || g.f === 'wann' || g.f === 'wo')).map(s => markier(s, [hat(s, 'zeit') ? 'zeit' : 'ort']));
        if (stufe === 'mittel') return beide.map(s => markier(s, ['zeit', 'ort']));
        return [...beide, ...einer.filter(s => s.glieder.some(g => g.f && g.f !== 'wann' && g.f !== 'wo'))]
          .map(s => markier(s, ['zeit', 'ort'].filter(r => hat(s, r)), 'um'));
      }
      case 'ergaenzungen': {
        if (stufe === 'leicht') return pool4.filter(s => hat(s, 'wen') && !hat(s, 'wem') && ohneTeil2(s)).map(s => markier(s, ['wen']));
        if (stufe === 'mittel') return pool4.filter(s => hat(s, 'wem')).map(s => markier(s, ['wem']));
        return pool4.filter(s => hat(s, 'wem') && hat(s, 'wen')).map(s => markier(s, ['wem', 'wen'], 'um'));
      }
      case 'erweitern': return erweitern()[stufe].slice();
      case 'stimmt': return STIMMT[stufe].slice();
    }
    return [];
  }

  /* Eine umgestellte Reihenfolge (nicht die Grundreihenfolge), damit das Subjekt nicht immer vorn steht */
  function umgestellt(s, rnd) {
    const r = Z().erlaubteReihenfolgen(s).slice(1);
    return r.length ? r[Math.floor(rnd() * r.length)] : Z().grund(s);
  }
  function mischen(liste, rnd) {
    const a = liste.slice();
    for (let i = a.length - 1; i > 0; i--) { const k = Math.floor(rnd() * (i + 1)); [a[i], a[k]] = [a[k], a[i]]; }
    return a;
  }
  function runde(st, stufe, rnd = Math.random) {
    const n = SA.config.runde.aufgaben;
    return mischen(vorrat(st, stufe), rnd).slice(0, n).map(x => {
      const y = Object.assign({}, x);
      if (y.reihe === 'um') y.reihe = umgestellt(y.satz, rnd);
      else if (y.satz && y.reihe === null) y.reihe = Z().grund(y.satz);
      if (y.optionen) y.reihenfolge = mischen(y.optionen.map((o, i) => i), rnd);
      return y;
    });
  }

  /* ---------- Prüfung jeder Aufgabe (für die Tests) ---------- */
  function pruefe(st, x) {
    const f = [];
    const S = Z();
    if (x.satz && S.pruefeDatensatz(x.satz).length) f.push(...S.pruefeDatensatz(x.satz));
    if (x.reihe) {
      const b = S.bewerte(x.satz, x.reihe);
      if (!(b.ok || b.grund === 'gleich')) f.push(`${x.id}: angezeigte Reihenfolge nicht erlaubt`);
    }
    if (x.gesucht) for (const r of x.gesucht) if (!S.hat(x.satz, r)) f.push(`${x.id}: gesuchte Rolle ${r} fehlt`);
    if (st === 'erweitern') {
      const richtig = x.art === 'ersetzen' ? x.satz.glieder[x.stelle] : x.ziel;
      if (x.optionen.filter(o => o.r === richtig.r && (o.f || '') === (richtig.f || '')).length !== 1) f.push(`${x.id}: nicht genau eine passende Option`);
      if (x.art === 'ersetzen' && x.optionen[0].r !== x.satz.glieder[x.stelle].r) f.push(`${x.id}: erste Option passt nicht zur Rolle`);
      if (x.art === 'erweitern') {
        f.push(...S.pruefeDatensatz(x.ergebnis));
        const neu = x.ergebnis.glieder.map(g => g.t), alt = x.satz.glieder.map(g => g.t);
        if (neu.length !== alt.length + 1 || !alt.every(t => neu.includes(t)) || !neu.includes(x.ziel.t)) f.push(`${x.id}: Ergebnis ist nicht der Satz plus das neue Satzglied`);
        const k = neu.indexOf(x.ziel.t);
        if (k >= 0 && x.ergebnis.glieder[k].r !== x.ziel.r) f.push(`${x.id}: Rolle im Ergebnis anders`);
        if (x.umstellen && !S.erlaubteReihenfolgen(x.ergebnis).some(r => r[0] === k)) f.push(`${x.id}: neues Satzglied kann nicht nach vorn`);
      }
    }
    if (st === 'stimmt' && (typeof x.stimmt !== 'boolean' || !x.behauptung || !x.warum)) f.push(`${x.id}: Aussage unvollständig`);
    return f;
  }

  SA.aufgaben = { vorrat, runde, pruefe, frageZu, STIMMT, erweitern, umgestellt, mischen };
})();
