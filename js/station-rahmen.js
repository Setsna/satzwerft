/* Satzwerft: Rahmen für alle Stationen (Stufenwahl, Runde, Aufgabe, Prüfen, Lösung, Rundenende, Hilfe, Wörter).
   Klassisches Skript, legt window.SA.stationBauen an. Braucht SA.config, SA.teile, SA.stand, SA.aufgaben.

   Eine Station beschreibt nur, was sie anders macht:
     def = { id, praefix, titel, kurz, intro, soGehts: [..], amTisch: { titel, schritte, notiz }, motiv (SVG im Raster 100),
             woerter: ['subjekt', …]   welche Fachwörter der Wörter-Knopf zeigt,
             start(a)                   Zustand einer Aufgabe (Objekt) anlegen,
             zeichne(a, z, ort, api)    Bühne und Aufgabe in ort zeichnen,
             pruefe(a, z, api)          -> { ok, text, weiter? } (weiter = nächster Teilschritt, Aufgabe noch nicht fertig),
             loesung(a, z, api)         -> Text; zeigt die Lösung (Aufgabe zählt dann nicht),
             tipps(a, z)                -> [Tipp 1, Tipp 2, …] gestuft, ohne die Lösung zu verraten,
             fachwort(a, z)             -> Satz, der nach dem Lösen das Fachwort nennt (erst probieren, dann Fachwort) }
   Geschafft ist eine Aufgabe, wenn sie gelöst wurde, ohne die Lösung anzusehen.
   Gespeichert werden nur runden (je geschaffte Aufgabe) und stempel (ab config.runde.stempelAb). */
(() => {
  'use strict';
  const SA = window.SA = window.SA || {};
  const C = () => SA.config;
  const T = () => SA.teile;
  const ST = () => SA.stand;
  const STUFENNAME = { leicht: 'leicht', mittel: 'mittel', knifflig: 'knifflig' };

  /* Wörter-Dialog: Fachwörter mit ihrer Frage (wie Zebra) */
  const WORT = {
    satzglied: ['Satzglied', 'Ein Wort oder mehrere Wörter, die beim Umstellen zusammenbleiben.'],
    umstellprobe: ['Umstellprobe', 'Du stellst die Satzglieder um. Was zusammenbleibt, ist ein Satzglied.'],
    subjekt: ['Subjekt', 'Frage: Wer oder was?'],
    praedikat: ['Prädikat', 'Frage: Was tut jemand? Was passiert? Das Prädikat ist immer ein Verb. Es kann zwei Teile haben.'],
    zeit: ['Zeitbestimmung', 'Frage: Wann? Wie oft? Wie lange?'],
    ort: ['Ortsbestimmung', 'Frage: Wo? Woher? Wohin?'],
    wem: ['Wem-Ergänzung', 'Frage: Wem?'],
    wen: ['Wen-Ergänzung', 'Frage: Wen oder was?'],
    frage: ['Fragesatz', 'Bei einer Frage ohne Fragewort steht das Prädikat vorn.']
  };

  SA.stationBauen = def => {
    SA.stationen = SA.stationen || {};
    const ID = def.id, P = def.praefix;
    let ctx = null, z = null, tippBis = -1;
    const esc = s => ctx.esc(s);
    const kopf = u => T().kopf(ctx, { titel: def.titel, unterzeile: u, praefix: P });
    const stempelSvg = () => T().stempel(def.motiv || '');

    function ansichtStufen() {
      z = null;
      const erstesMal = T().erstesMal(ID);
      ctx.zeigen(`
        ${kopf(def.kurz)}
        ${erstesMal && def.intro ? `<div class="rio-aussage rio-satz">${ctx.rioKlein}<p>${esc(def.intro)}</p></div>` : ''}
        ${T().aufklapper(ctx, { klasse: 'so-gehts', titel: "So geht's", offen: erstesMal, schritte: def.soGehts })}
        ${T().stufenListe(ctx, ID, P)}
        ${T().aufklapper(ctx, { klasse: 'am-tisch', titel: def.amTisch.titel, offen: false, schritte: def.amTisch.schritte, notiz: def.amTisch.notiz })}`, def.titel);
    }

    function rundeStarten(stufe) {
      z = { stufe, aufgaben: SA.aufgaben.runde(ID, stufe, Math.random), i: 0, geschafft: 0, fehler: false };
      aufgabeZeigen();
    }
    const aufgabe = () => z && z.aufgaben[z.i];

    function aufgabeZeigen() {
      const a = aufgabe();
      tippBis = -1;
      a.z = Object.assign({ versuche: 0, fertig: false, geschafft: false, loesung: false, rueck: '' }, def.start ? def.start(a) : {});
      ctx.zeigen(`
        ${kopf(`Stufe ${STUFENNAME[z.stufe]} · Aufgabe ${z.i + 1} von ${z.aufgaben.length}`)}
        <section class="papier aufgabe werkbank" id="${P}-aufgabe" aria-labelledby="${P}-frage"></section>`, `Aufgabe ${z.i + 1} – ${def.titel}`);
      zeichne();
      const erstes = ctx.app.querySelector(`#${P}-aufgabe .kachel:not([disabled]), #${P}-aufgabe .luecke:not([disabled]), #${P}-aufgabe .antwort-knopf:not([disabled])`);
      const h = ctx.app.querySelector(`#${P}-frage`);
      if (h) { h.tabIndex = -1; }
      void erstes;
    }

    const api = {
      get ctx() { return ctx; },
      esc: s => ctx.esc(s),
      neuZeichnen: () => zeichne(),
      ansagen: t => ctx.ansagen(t),
      pruefen: () => pruefen(),
      get stufe() { return z && z.stufe; },
      P
    };

    function zeichne() {
      const a = aufgabe(), s = a.z;
      const ort = ctx.app.querySelector(`#${P}-aufgabe`);
      if (!ort) return;
      ort.textContent = '';
      const innen = document.createElement('div');
      innen.className = 'werkbank__inhalt';
      ort.appendChild(innen);
      def.zeichne(a, s, innen, api);
      /* Rückmeldung, Knöpfe */
      const unten = document.createElement('div');
      unten.className = 'werkbank__unten';
      const rueck = document.createElement('p');
      rueck.className = 'rueckmeldung' + (s.fertig && s.geschafft ? ' rueckmeldung--richtig' : '') + (s.rueckArt ? ' rueckmeldung--' + s.rueckArt : '');
      rueck.id = `${P}-rueck`;
      rueck.textContent = s.rueck || '';
      /* Bei „Kann das stimmen?“ steht das Urteil über der Erklärung */
      const anker = def.rueckOben && innen.querySelector('.erklaerung');
      if (anker) anker.before(rueck); else unten.appendChild(rueck);
      if (s.fertig && s.fachwort) { const f = document.createElement('p'); f.className = 'fachwort'; f.textContent = s.fachwort; unten.appendChild(f); }
      const reihe = document.createElement('p');
      reihe.className = 'knopfreihe';
      const knopf = (text, aktion, haupt) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'knopf' + (haupt ? ' haupt' : ''); b.dataset[P] = aktion; b.textContent = text; reihe.appendChild(b); return b; };
      if (s.fertig) knopf(z.i + 1 < z.aufgaben.length ? 'Weiter' : 'Zum Rundenende', 'weiter', true);
      else {
        if (!s.ohnePruefen) knopf(s.pruefText || 'Prüfen', 'pruefen', true);
        if (s.versuche >= C().runde.versucheBisLoesung) knopf('Lösung zeigen', 'loesung', false);
      }
      unten.appendChild(reihe);
      ort.appendChild(unten);
      ort.classList.toggle('loesung-gezeigt', !!s.loesung);
      ort.classList.toggle('ist-geschafft', !!(s.fertig && s.geschafft));
      if (s.fertig && s.geschafft && !SA.kacheln.ruhig() && typeof ort.animate === 'function' && !s._geleuchtet) {
        s._geleuchtet = true;
        ort.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.012)' }, { transform: 'scale(1)' }], { duration: 520, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' });
      }
    }

    function pruefen() {
      const a = aufgabe(), s = a.z;
      if (s.fertig) return;
      const r = def.pruefe(a, s, api);
      if (!r) return;
      s.rueck = r.text;
      s.rueckArt = r.ok ? 'richtig' : (r.sanft ? 'sanft' : 'falsch');
      if (r.ok && r.weiter) { s.versuche = 0; tippBis = -1; }
      else if (!r.ok && r.endgueltig) { s.fertig = true; s.geschafft = false; s.loesung = true; s.rueckArt = 'loesung'; s.fachwort = def.fachwort ? def.fachwort(a, s) : ''; }
      else if (r.ok) {
        s.fertig = true;
        s.geschafft = !s.loesung;
        s.fachwort = def.fachwort ? def.fachwort(a, s) : '';
        if (s.geschafft) {
          z.geschafft++;
          if (!ST().istVorschau && ST().rundeGeschafft(ID, z.stufe) === false) z.fehler = true;
        }
      } else if (!r.sanft) s.versuche++;
      zeichne();
      ctx.ansagen(s.rueck + (s.fertig && s.fachwort ? ' ' + s.fachwort : ''));
      const ziel = ctx.app.querySelector(s.fertig ? `[data-${P}="weiter"]` : `#${P}-aufgabe .kachel:not([disabled]), #${P}-aufgabe .luecke:not([disabled]), #${P}-aufgabe .antwort-knopf:not([disabled])`);
      if (ziel && s.fertig) ziel.focus();
    }
    function loesungZeigen() {
      const a = aufgabe(), s = a.z;
      s.loesung = true;
      s.rueck = def.loesung(a, s, api);
      s.rueckArt = 'loesung';
      s.fertig = true;
      s.geschafft = false;
      s.fachwort = def.fachwort ? def.fachwort(a, s) : '';
      zeichne();
      ctx.ansagen(s.rueck);
      const w = ctx.app.querySelector(`[data-${P}="weiter"]`);
      if (w) w.focus();
    }
    function weiter() {
      if (z.i + 1 < z.aufgaben.length) { z.i++; aufgabeZeigen(); return; }
      const ende = T().rundenende(ctx, { id: ID, praefix: P, stufe: z.stufe, geschafft: z.geschafft, anzahl: z.aufgaben.length, stempelSvg: stempelSvg(), gespeichertFehler: z.fehler });
      z.rundeEnde = true;
      ctx.zeigen(`${T().kopf(ctx, { titel: def.titel, unterzeile: 'Rundenende', praefix: P, werkzeug: false })}${ende.html}`, `Rundenende – ${def.titel}`);
      ctx.ansagen(ende.text);
      if (ende.fehler) ctx.melden(ctx.speicherFehlt);
    }

    function hilfe() {
      const a = aufgabe();
      if (!a) {
        T().dialog(ctx, { titel: 'Tipp von Rio', inhalt: `<div class="tipp">${ctx.rioKlein}<p>${esc(def.hilfeStart || 'Wähle eine Stufe. Ich helfe dir dann bei jeder Aufgabe.')}</p></div>`, knoepfe: '<button type="button" class="knopf haupt" data-dialog="zu">Ich probiere es</button>' });
        return;
      }
      const liste = def.tipps(a, a.z);
      if (tippBis < 0) tippBis = 0;
      /* Tipps gestuft: Nach jedem Prüfen ist ein Tipp mehr erlaubt, mindestens zwei */
      const erlaubt = Math.min(liste.length, Math.max(2, a.z.versuche + 2));
      T().tippDialog(ctx, { liste, bis: tippBis, erlaubt, fertig: a.z.fertig, weiter: () => { tippBis = Math.min(tippBis + 1, erlaubt - 1); hilfe(); } });
    }
    function woerter() {
      const liste = (def.woerter || ['satzglied']).map(w => WORT[w]);
      T().dialog(ctx, {
        titel: 'Wörter',
        inhalt: `<table class="wortspeicher__tabelle"><tbody>${liste.map(([w, b]) => `<tr><th scope="row">${esc(w)}</th><td>${esc(b)}</td></tr>`).join('')}</tbody></table>`,
        knoepfe: '<button type="button" class="knopf haupt" data-dialog="zu">Schließen</button>'
      });
    }

    /* Zurück mitten in der Runde: erst fragen (Design-Review P2). Ab Aufgabe 2 oder wenn schon geprüft wurde. */
    function laeuft() {
      if (!z || z.rundeEnde) return false;
      const a = aufgabe();
      return z.i > 0 || !!(a && a.z && (a.z.versuche || a.z.fertig));
    }
    function abbrechenFragen() {
      const d = T().dialog(ctx, {
        titel: 'Runde abbrechen?',
        inhalt: `<p>Du bist bei Aufgabe ${z.i + 1} von ${z.aufgaben.length}. Wenn du jetzt gehst, fängt die Runde beim nächsten Mal von vorn an.</p>`,
        knoepfe: '<button type="button" class="knopf haupt" data-dialog="zu">Weiter üben</button><button type="button" class="knopf" data-dialog="tipp">Runde abbrechen</button>',
        tipp: () => { d.close(); z = null; ctx.zurueck(); }
      });
    }
    function bedienen(e) {
      const zurueck = e.target.closest('[data-aktion="start"]');
      if (zurueck && laeuft()) { abbrechenFragen(); return true; }
      const b = e.target.closest(`[data-${P}]`);
      if (!b || b.disabled) return false;
      const was = b.dataset[P];
      if (was === 'stufe') rundeStarten(b.dataset.stufe);
      else if (was === 'stufen') ansichtStufen();
      else if (was === 'pruefen') pruefen();
      else if (was === 'loesung') loesungZeigen();
      else if (was === 'weiter') weiter();
      else if (was === 'hilfe') hilfe();
      else if (was === 'woerter') woerter();
      else if (def.bedienen) return def.bedienen(was, b, aufgabe(), aufgabe() && aufgabe().z, api) !== false;
      else return false;
      return true;
    }

    const station = {
      id: ID, stempelSvg,
      oeffnen(c) { ctx = c; ansichtStufen(); },
      bedienen,
      /* Für den Rauchtest */
      get _z() { return z; }, _pruefen: pruefen, _loesung: loesungZeigen
    };
    SA.stationen[ID] = station;
    return station;
  };
  SA.WORT = WORT;
})();
