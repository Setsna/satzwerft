/* Satzwerft: Satz- und Prüflogik (ohne DOM, getestet in tools/satz-test.html).
   Klassisches Skript, legt window.SA.satz an.

   Ein Satz ist ein von Hand geschriebener Datensatz (js/saetze.js), von Ingo geprüft. Die Seite leitet nichts aus freiem Text ab.
     { id, glieder: [{ t: 'der Delfin', r: 'subjekt' }, { t: 'springt', r: 'praedikat' }, { t: 'ab', r: 'praedikat', teil: 2 }], extra: [[…]] }
   - t steht so, wie das Satzglied mitten im Satz geschrieben wird. Am Satzanfang wird der erste Buchstabe groß.
   - Die Glieder stehen in der Grundreihenfolge: Subjekt zuerst, gebeugtes Verb an zweiter Stelle, zweiter Prädikatteil am Ende.

   Regel für die erlaubten Reihenfolgen (Mini-Spec Etappe 1, Knackpunkt Verb-zweit):
   - Aussagesatz: Vorne steht genau ein Satzglied (nicht das Prädikat). Das gebeugte Verb steht an zweiter Stelle.
     Die übrigen Glieder bleiben in der Grundreihenfolge, der zweite Prädikatteil steht am Ende.
     Dazu kommen Reihenfolgen, die im Datensatz unter extra stehen (von Hand, Ingo prüft).
   - Fragesatz ohne Fragewort: Das gebeugte Verb steht vorn, der Rest in der Grundreihenfolge.
   - Eine Reihenfolge mit dem Verb an der richtigen Stelle, die nicht erlaubt ist, gilt als „ungewohnt“, nicht als falsch. */
(() => {
  'use strict';
  const SA = window.SA = window.SA || {};

  const ROLLEN = ['subjekt', 'praedikat', 'zeit', 'ort', 'wem', 'wen', 'sonstiges'];
  /* Fachwörter wie in Zebra (Ingo, 16.11.2026). Auf einer Seite nie zwei Wörter für dasselbe. */
  const ROLLENNAME = { subjekt: 'Subjekt', praedikat: 'Prädikat', zeit: 'Zeitbestimmung', ort: 'Ortsbestimmung', wem: 'Wem-Ergänzung', wen: 'Wen-Ergänzung', sonstiges: 'Satzglied' };
  const KUERZEL = { S: 'subjekt', P: 'praedikat', Z: 'zeit', O: 'ort', D: 'wem', A: 'wen', X: 'sonstiges' };

  /* Kurzschreibweise für js/saetze.js: 'der Delfin|S', 'springt|P', 'ab|P2', 'heute|Z', 'im Hafen|O', 'dem Kind|D', 'einen Ball|A', 'hoch|X' */
  function aus(id, teile, mehr = {}) {
    const glieder = teile.map(x => {
      const i = x.lastIndexOf('|');
      const t = x.slice(0, i), k = x.slice(i + 1);
      const g = { t, r: KUERZEL[k[0]] };
      if (k === 'P2') g.teil = 2;
      /* Fragewort der Bestimmung: Z = Wann? (Z:oft Wie oft?, Z:lange Wie lange?), O = Wo? (O:her Woher?, O:hin Wohin?) */
      if (k[0] === 'Z') g.f = k.slice(2) || 'wann';
      if (k[0] === 'O') g.f = k.slice(2) || 'wo';
      return g;
    });
    return Object.assign({ id, glieder }, mehr);
  }

  const gross = t => t ? t[0].toLocaleUpperCase('de-DE') + t.slice(1) : t;
  const finit = s => s.glieder.findIndex(g => g.r === 'praedikat' && g.teil !== 2);
  const teil2 = s => s.glieder.findIndex(g => g.r === 'praedikat' && g.teil === 2);
  const gleich = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
  const grund = s => s.glieder.map((g, i) => i);

  /* Prüft einen Datensatz. Gibt eine Liste mit Fehlern zurück (leer = in Ordnung). */
  function pruefeDatensatz(s) {
    const f = [];
    if (!s || !s.id) return ['ohne id'];
    const G = s.glieder || [];
    if (G.length < 3) f.push(`${s.id}: weniger als drei Satzglieder`);
    G.forEach((g, i) => {
      if (!ROLLEN.includes(g.r)) f.push(`${s.id}: Glied ${i} ohne gültige Rolle`);
      if (typeof g.t !== 'string' || !g.t.trim() || g.t !== g.t.trim() || /\s\s/.test(g.t)) f.push(`${s.id}: Glied ${i} Text leer oder mit falschen Leerzeichen`);
      if (/[.,!?;:"„“]/.test(g.t)) f.push(`${s.id}: Glied ${i} enthält ein Satzzeichen`);
      if (g.f !== undefined && !(g.f in FRAGEWORT)) f.push(`${s.id}: Glied ${i} mit unbekanntem Fragewort ${g.f}`);
      if ((g.r === 'zeit' || g.r === 'ort') && !g.f) f.push(`${s.id}: Bestimmung ohne Fragewort`);
    });
    const p1 = G.filter(g => g.r === 'praedikat' && g.teil !== 2).length;
    const p2 = G.filter(g => g.r === 'praedikat' && g.teil === 2).length;
    if (p1 !== 1) f.push(`${s.id}: ${p1} gebeugte Prädikatteile statt einem`);
    if (p2 > 1) f.push(`${s.id}: mehr als ein zweiter Prädikatteil`);
    if (G.filter(g => g.r === 'subjekt').length !== 1) f.push(`${s.id}: nicht genau ein Subjekt`);
    if (G[0] && G[0].r !== 'subjekt') f.push(`${s.id}: Grundreihenfolge beginnt nicht mit dem Subjekt`);
    if (finit(s) !== 1) f.push(`${s.id}: gebeugtes Verb nicht an zweiter Stelle`);
    if (p2 === 1 && teil2(s) !== G.length - 1) f.push(`${s.id}: zweiter Prädikatteil nicht am Ende`);
    /* Eindeutige Zerlegung: kein Satzglied doppelt, kein Wort doppelt (sonst sind die Striche nicht eindeutig zu lesen) */
    const texte = G.map(g => g.t.toLowerCase());
    if (new Set(texte).size !== texte.length) f.push(`${s.id}: ein Satzglied kommt doppelt vor`);
    for (const r of ['zeit', 'ort', 'wem', 'wen']) if (G.filter(g => g.r === r).length > 1) f.push(`${s.id}: zwei Glieder mit der Rolle ${r}`);
    /* Keine Verwechslung von Subjekt und Wen-Ergänzung beim Umstellen (CLAUDE.md: „Die Katze jagt die Maus“):
       Ist das Subjekt kein Name und nicht eindeutig männlich (der …), muss die Wen-Ergänzung eindeutig im Wen-Fall stehen (den, einen, seinen …). */
    const sub = G.find(g => g.r === 'subjekt'), wen = G.find(g => g.r === 'wen');
    if (sub && wen) {
      const name = /^[A-ZÄÖÜ]/.test(sub.t);
      const maennlich = /^der\s/.test(sub.t);
      const wenEindeutig = /^(den|einen|seinen|ihren|meinen|deinen|unseren)\s/.test(wen.t);
      if (!name && !maennlich && !wenEindeutig) f.push(`${s.id}: Subjekt „${sub.t}“ und Wen-Ergänzung „${wen.t}“ können beim Umstellen verwechselt werden`);
    }
    for (const e of s.extra || []) {
      if (!Array.isArray(e) || !gleich([...e].sort((a, b) => a - b), grund(s))) f.push(`${s.id}: extra-Reihenfolge ist keine Umstellung`);
      else if (e[1] !== finit(s)) f.push(`${s.id}: extra-Reihenfolge ohne Verb an zweiter Stelle`);
    }
    return f;
  }

  /* Alle erlaubten Reihenfolgen als Listen von Indizes in die Grundreihenfolge */
  function erlaubteReihenfolgen(s, art = 'aussage') {
    const v = finit(s), z = teil2(s);
    const rest = grund(s).filter(i => i !== v && i !== z);
    const ende = z >= 0 ? [z] : [];
    if (art === 'frage') return [[v, ...rest, ...ende]];
    const aus = rest.map(vorn => [vorn, v, ...rest.filter(i => i !== vorn), ...ende]);
    for (const e of s.extra || []) if (!aus.some(r => gleich(r, e))) aus.push(e.slice());
    return aus;
  }

  /* Bewertet eine gelegte Reihenfolge.
     art:   'aussage' | 'frage'
     Ergebnis.grund: 'ja' (erlaubt, umgestellt), 'gleich' (wie am Anfang), 'verb' (gebeugtes Verb an falscher Stelle),
                     'teil2' (zweiter Prädikatteil nicht am Ende), 'ungewohnt' (Verb richtig, klingt aber ungewohnt), 'kaputt' */
  function bewerte(s, reihe, art = 'aussage') {
    const v = finit(s), z = teil2(s);
    if (!Array.isArray(reihe) || !gleich([...reihe].sort((a, b) => a - b), grund(s))) return { ok: false, grund: 'kaputt' };
    const sollV = art === 'frage' ? 0 : 1;
    if (reihe[sollV] !== v) return { ok: false, grund: 'verb', verb: s.glieder[v].t, stelle: art === 'frage' ? 'vorne' : 'an zweiter Stelle' };
    if (z >= 0 && reihe[reihe.length - 1] !== z) return { ok: false, grund: 'teil2', teil: s.glieder[z].t };
    const erlaubt = erlaubteReihenfolgen(s, art).some(r => gleich(r, reihe));
    if (!erlaubt) return { ok: false, grund: 'ungewohnt' };
    if (art === 'aussage' && gleich(reihe, grund(s))) return { ok: false, grund: 'gleich' };
    return { ok: true, grund: 'ja' };
  }

  /* Text eines Satzes in einer Reihenfolge, mit großem Anfang und Satzzeichen */
  function text(s, reihe = grund(s), art = 'aussage') {
    const w = reihe.map(i => s.glieder[i].t);
    if (w.length) w[0] = gross(w[0]);
    return w.join(' ') + (art === 'frage' ? '?' : '.');
  }
  /* Wie ein Glied an einer Stelle aussieht (vorn groß) */
  const gliedText = (s, i, pos) => pos === 0 ? gross(s.glieder[i].t) : s.glieder[i].t;

  /* Wörter des Satzes in der Grundreihenfolge: [{ wort, glied }]. Lücke k liegt zwischen Wort k und Wort k+1. */
  function woerter(s) {
    const aus = [];
    s.glieder.forEach((g, gi) => g.t.split(' ').forEach(w => aus.push({ wort: aus.length ? w : gross(w), glied: gi })));
    return aus;
  }
  /* Die Lücken, an die ein Strich gehört (zwischen zwei Satzgliedern) */
  function grenzen(s) {
    const w = woerter(s), aus = [];
    for (let k = 0; k < w.length - 1; k++) if (w[k].glied !== w[k + 1].glied) aus.push(k);
    return aus;
  }
  /* Striche prüfen: striche = Liste von Lücken. fehlend: Strich fehlt, zuviel: Strich trennt ein Satzglied */
  function pruefeTrennung(s, striche) {
    const soll = new Set(grenzen(s)), ist = new Set(striche);
    const fehlend = [...soll].filter(k => !ist.has(k)).sort((a, b) => a - b);
    const zuviel = [...ist].filter(k => !soll.has(k)).sort((a, b) => a - b);
    return { ok: !fehlend.length && !zuviel.length, fehlend, zuviel };
  }

  /* Die Frage nach dem Subjekt, gebildet aus dem Satz: „Wer oder was springt hoch?“
     Das Subjekt fällt weg, der Rest bleibt in der Grundreihenfolge. */
  function frageSubjekt(s) {
    const v = finit(s);
    const rest = s.glieder.filter((g, i) => g.r !== 'subjekt' && i !== v).map(g => g.t);
    return ['Wer oder was', s.glieder[v].t, ...rest].join(' ') + '?';
  }
  /* Indizes der Glieder mit einer Rolle (Prädikat: beide Teile) */
  const mitRolle = (s, r) => s.glieder.map((g, i) => g.r === r ? i : -1).filter(i => i >= 0);
  const hat = (s, r) => mitRolle(s, r).length > 0;

  /* Markierung prüfen: gewaehlt = Liste von Indizes, rolle = gesuchte Rolle */
  function pruefeRolle(s, gewaehlt, rolle) {
    const soll = mitRolle(s, rolle), ist = [...new Set(gewaehlt)].sort((a, b) => a - b);
    const fehlend = soll.filter(i => !ist.includes(i)), zuviel = ist.filter(i => !soll.includes(i));
    return { ok: !fehlend.length && !zuviel.length, fehlend, zuviel, soll };
  }

  /* Fragewörter wie in Zebra */
  const FRAGEWORT = { wann: 'Wann?', oft: 'Wie oft?', lange: 'Wie lange?', wo: 'Wo?', her: 'Woher?', hin: 'Wohin?' };
  const ROLLENFRAGE = { subjekt: 'Wer oder was?', praedikat: 'Was tut jemand? Was passiert?', zeit: 'Wann? Wie oft? Wie lange?', ort: 'Wo? Woher? Wohin?', wem: 'Wem?', wen: 'Wen oder was?' };
  const fragewort = g => g.f ? FRAGEWORT[g.f] : (ROLLENFRAGE[g.r] || '');

  SA.satz = { FRAGEWORT, ROLLENFRAGE, fragewort, ROLLEN, ROLLENNAME, KUERZEL, aus, gross, finit, teil2, grund, pruefeDatensatz, erlaubteReihenfolgen, bewerte, text, gliedText, woerter, grenzen, pruefeTrennung, frageSubjekt, mitRolle, hat, pruefeRolle };
})();
