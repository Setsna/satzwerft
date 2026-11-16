/* Satzwerft: drei Stationen zum Markieren von Satzgliedern mit der Frageprobe.
   - „Subjekt und Prädikat“ (Klasse 3): erst das Prädikat (Was tut jemand? Was passiert?), dann das Subjekt (Wer oder was …?)
   - „Zeit und Ort“ (Klasse 4): Zeitbestimmung (Wann? Wie oft? Wie lange?), Ortsbestimmung (Wo? Woher? Wohin?)
   - „Wem und Wen“ (Klasse 4): Wem-Ergänzung (Wem?), Wen-Ergänzung (Wen oder was?)
   Jede Aufgabe hat Schritte (a.gesucht). Gefundene Satzglieder bekommen Farbe UND Marke (nie nur Farbe).
   Andere Satzglieder („laut“, „langsam“) werden nie als Fehler gewertet, sie sind nur nicht gesucht. */
(() => {
  'use strict';
  const SA = window.SA;
  const Z = () => SA.satz;
  const zit = t => `„${t}“`;
  const N = r => SA.satz.ROLLENNAME[r];

  /* Was das Kind fragen soll */
  function frage(a, rolle) {
    const s = a.satz;
    if (rolle === 'praedikat') return 'Was tut jemand? Was passiert?';
    if (rolle === 'subjekt') return Z().frageSubjekt(s);
    if (rolle === 'zeit') return 'Wann? Wie oft? Wie lange?';
    if (rolle === 'ort') return 'Wo? Woher? Wohin?';
    if (rolle === 'wem') return 'Wem?';
    if (rolle === 'wen') return 'Wen oder was?';
    return '';
  }
  const auftrag = {
    praedikat: 'Tippe auf das Wort, das sagt, was jemand tut oder was passiert.',
    subjekt: 'Tippe auf das Satzglied, das antwortet.',
    zeit: 'Tippe auf das Satzglied, das antwortet: Es sagt etwas über die Zeit.',
    ort: 'Tippe auf das Satzglied, das antwortet: Es sagt etwas über den Ort.',
    wem: 'Tippe auf das Satzglied, das auf „Wem?“ antwortet.',
    wen: 'Tippe auf das Satzglied, das auf „Wen oder was?“ antwortet.'
  };
  /* Warum ein gewähltes Glied nicht passt */
  function warumNicht(a, gi, rolle) {
    const s = a.satz, g = s.glieder[gi], t = zit(Z().gliedText(s, gi, a.reihe.indexOf(gi)));
    if (rolle === 'praedikat') return `${t} sagt nicht, was jemand tut. Such das Verb.`;
    if (g.r === 'praedikat') return `${t} ist das Prädikat. Gesucht ist etwas anderes.`;
    if (g.r === 'subjekt' && rolle !== 'subjekt') return `${t} ist das Subjekt. Es antwortet auf „Wer oder was?“.`;
    if (['zeit', 'ort', 'wem', 'wen'].includes(g.r)) return `${t} antwortet auf „${Z().fragewort(g)}“. Gesucht ist: ${frage(a, rolle)}`;
    return `${t} antwortet nicht auf diese Frage.`;
  }
  const loesText = (a, rolle) => Z().mitRolle(a.satz, rolle).map(i => Z().gliedText(a.satz, i, a.reihe.indexOf(i))).join(' … ');

  function markierStation(def) {
    return SA.stationBauen(Object.assign({
      start: a => ({ schritt: 0, gewaehlt: [], fest: {} }),
      zeichne(a, s, ort, api) {
        const esc = api.esc;
        const rolle = a.gesucht[s.schritt];
        const fertigeStufen = a.gesucht.length > 1 ? `<p class="schritte" aria-label="Schritt ${Math.min(s.schritt + 1, a.gesucht.length)} von ${a.gesucht.length}">${a.gesucht.map((r, i) => `<span class="schritt${i < s.schritt || s.fertig ? ' schritt--fertig' : ''}${i === s.schritt && !s.fertig ? ' schritt--jetzt' : ''}" aria-hidden="true">${i + 1}</span>`).join('')}</p>` : '';
        ort.insertAdjacentHTML('beforeend', `
          ${fertigeStufen}
          <h2 id="${api.P}-frage" class="frage">${s.fertig ? 'Geschafft: ' + esc(a.gesucht.map(N).join(' und ')) + '.' : 'Frag: ' + esc(frage(a, rolle))}</h2>
          ${s.fertig ? '' : `<p class="auftrag">${esc(def.auftrag ? def.auftrag(a, rolle) : auftrag[rolle])}</p>`}
          <div class="satzbuehne" id="${api.P}-feld"></div>`);
        SA.kacheln.markieren(ort.querySelector(`#${api.P}-feld`), {
          satz: a.satz, reihe: a.reihe, gewaehlt: s.gewaehlt, fest: s.fest, gesperrt: s.fertig,
          aenderung: neu => { s.gewaehlt = neu; }
        });
      },
      pruefe(a, s) {
        const rolle = a.gesucht[s.schritt];
        if (!s.gewaehlt.length) return { ok: false, sanft: true, text: 'Tippe zuerst ein Kärtchen an.' };
        const r = Z().pruefeRolle(a.satz, s.gewaehlt, rolle);
        if (r.ok) {
          r.soll.forEach(i => { s.fest[i] = rolle; });
          s.gewaehlt = [];
          const t = zit(loesText(a, rolle));
          const text = def.richtig ? def.richtig(a, rolle, t) : `Genau. ${t} ist die ${N(rolle)}.`;
          s.schritt++;
          return { ok: true, weiter: s.schritt < a.gesucht.length, text };
        }
        if (r.zuviel.length) return { ok: false, text: warumNicht(a, r.zuviel[0], rolle) };
        /* nur ein Teil des zweiteiligen Prädikats */
        if (rolle === 'praedikat' && r.fehlend.length) return { ok: false, text: 'Fast. Das Verb hat hier noch einen zweiten Teil. Er steht am Ende.' };
        return { ok: false, text: 'Da fehlt noch etwas.' };
      },
      loesung(a, s) {
        a.gesucht.forEach(r => Z().mitRolle(a.satz, r).forEach(i => { s.fest[i] = r; }));
        s.gewaehlt = [];
        s.schritt = a.gesucht.length;
        return 'So ist es: ' + a.gesucht.map(r => `${N(r)}: ${zit(loesText(a, r))}`).join('. ') + '.';
      }
    }, def));
  }

  markierStation({
    id: 'finden', praefix: 'fi',
    titel: 'Subjekt und Prädikat', kurz: 'Wer? Was tut er?',
    intro: 'Hier stellst du Fragen an den Satz. Die Antwort tippst du an.',
    soGehts: ['Lies den Satz.', 'Frag: Was tut jemand? Was passiert? Tippe auf die Antwort.', 'Dann frag: Wer oder was …? Tippe wieder auf die Antwort.'],
    amTisch: { titel: 'Am Tisch: Frage-Kärtchen', schritte: [
      'Schreibt Sätze auf Streifen und schneidet sie in Satzglieder.',
      'Ein Kind fragt: „Was tut jemand?“ Das andere zeigt auf das Prädikat und legt einen roten Stein darauf.',
      'Dann fragt es: „Wer oder was …?“ Auf das Subjekt kommt ein blauer Stein.',
      'Stellt den Satz um. Liegen die Steine noch auf denselben Kärtchen?'], notiz: 'Material: Papierstreifen, Schere, Steine oder Knöpfe in zwei Farben.' },
    motiv: '<path class="stempel__unter" d="M20 58h26"/><path class="stempel__unter2" d="M54 56h26M54 61h26"/><text class="stempel__frage" x="50" y="46" text-anchor="middle">?</text>',
    woerter: ['satzglied', 'subjekt', 'praedikat'],
    richtig: (a, rolle, t) => rolle === 'praedikat' ? `Genau. ${t} sagt, was passiert. Das ist das Prädikat.` : `Genau. ${t} antwortet auf die Frage. Das ist das Subjekt.`,
    fachwort: () => 'Das Prädikat sagt, was jemand tut oder was passiert. Das Subjekt sagt, wer oder was es tut.',
    tipps(a, s) {
      const rolle = a.gesucht[s.schritt] || 'subjekt';
      const z2 = Z().teil2(a.satz);
      if (rolle === 'praedikat') return [
        'Das Prädikat ist ein Verb. Ein Verb kannst du in eine andere Zeit setzen: heute, gestern.',
        z2 >= 0 ? 'In diesem Satz hat das Verb zwei Teile. Einer ist das zweite Satzglied, einer steht ganz hinten.' : 'Im Aussagesatz ist das Prädikat das zweite Satzglied.',
        'Tippe alle Teile des Prädikats an und dann auf Prüfen.'];
      return [`Frag genau so: ${Z().frageSubjekt(a.satz)}`, 'Das Subjekt muss nicht vorn stehen.', 'Das Subjekt ist meistens eine Person, ein Tier oder ein Ding.'];
    }
  });

  markierStation({
    id: 'bestimmungen', praefix: 'be',
    titel: 'Zeit und Ort', kurz: 'Wann? Wo?',
    intro: 'Hier findest du heraus, wann und wo etwas passiert.',
    soGehts: ['Lies den Satz.', 'Frag: Wann? Wie oft? Wie lange? Oder: Wo? Woher? Wohin?', 'Tippe auf das Satzglied, das antwortet.'],
    amTisch: { titel: 'Am Tisch: Wann-und-Wo-Würfel', schritte: [
      'Schreibt auf einen Würfel: Wann? Wie oft? Wie lange? Wo? Woher? Wohin?',
      'Ein Kind sagt einen kurzen Satz, zum Beispiel: „Der Hund schläft.“',
      'Würfelt. Das nächste Kind macht den Satz mit einer passenden Antwort länger.',
      'Schreibt die Sätze auf und unterstreicht Zeit und Ort in zwei Farben.'], notiz: 'Material: leerer Würfel oder Klebezettel auf einem Würfel, Stifte.' },
    motiv: '<circle class="stempel__uhr" cx="36" cy="50" r="13"/><path class="stempel__uhr" d="M36 42v8l5 4"/><path class="stempel__pin" d="M66 64c-8-10-12-15-12-21a12 12 0 0 1 24 0c0 6-4 11-12 21z"/><circle class="stempel__uhr" cx="66" cy="43" r="4"/>',
    woerter: ['satzglied', 'zeit', 'ort'],
    auftrag: (a, rolle) => rolle === 'zeit' ? 'Tippe auf die Zeitbestimmung.' : 'Tippe auf die Ortsbestimmung.',
    fachwort: a => a.gesucht.length > 1 ? 'Zeitbestimmung und Ortsbestimmung sind Satzglieder. Sie wandern beim Umstellen mit.' : 'Auch eine Bestimmung ist ein Satzglied. Sie wandert beim Umstellen mit.',
    tipps(a, s) {
      const rolle = a.gesucht[s.schritt] || a.gesucht[0];
      const g = a.satz.glieder[Z().mitRolle(a.satz, rolle)[0]];
      return [
        rolle === 'zeit' ? 'Die Zeitbestimmung sagt, wann etwas passiert, wie oft oder wie lange.' : 'Die Ortsbestimmung sagt, wo etwas passiert, woher es kommt oder wohin es geht.',
        `Probier diese Frage: ${Z().fragewort(g)}`,
        'Eine Bestimmung kann aus mehreren Wörtern bestehen. Sie bleiben zusammen.'];
    }
  });

  markierStation({
    id: 'ergaenzungen', praefix: 'er',
    titel: 'Wem und Wen', kurz: 'Ergänzungen finden',
    intro: 'Hier fragst du: Wem? und Wen oder was?',
    soGehts: ['Lies den Satz.', 'Frag: Wem? Oder: Wen oder was?', 'Tippe auf das Satzglied, das antwortet.'],
    amTisch: { titel: 'Am Tisch: Geschenke verteilen', schritte: [
      'Ein Kind gibt einem anderen einen Gegenstand und sagt dazu einen Satz: „Ich gebe dir den Stift.“',
      'Die Klasse fragt: Wem? Wen oder was?',
      'Schreibt drei solche Sätze mit Namen auf.',
      'Stellt sie um. Welche Satzglieder wandern mit?'], notiz: 'Material: ein paar Gegenstände aus der Klasse, Heft.' },
    motiv: '<rect class="stempel__kachel" x="30" y="44" width="40" height="24" rx="3"/><path class="stempel__pfeil" d="M30 52h40M50 44v24M50 44c-6-10-14-6-10 0M50 44c6-10 14-6 10 0"/>',
    woerter: ['satzglied', 'wem', 'wen'],
    fachwort: () => 'Wem-Ergänzung und Wen-Ergänzung sind Satzglieder. Ohne sie wäre der Satz oft nicht vollständig.',
    tipps(a, s) {
      const rolle = a.gesucht[s.schritt] || a.gesucht[0];
      return rolle === 'wem'
        ? ['Frag: Wem? Zum Beispiel: Wem hilft jemand? Wem gibt jemand etwas?','Die Wem-Ergänzung beginnt oft mit dem, einem, der, ihrem oder seinem.', 'Das Subjekt ist es nicht. Frag erst: Wer oder was? Das scheidet aus.']
        : ['Frag: Wen oder was? Die Antwort ist kein Ort und keine Zeit.', 'Die Wen-Ergänzung beginnt oft mit den, einen, die, das oder ein.', 'Das Subjekt ist es nicht. Frag erst: Wer oder was? Das scheidet aus.'];
    }
  });
})();
