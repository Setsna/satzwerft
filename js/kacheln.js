/* Satzwerft: Bedienbausteine für Satzglied-Kacheln (DOM, keine Fachlogik).
   Klassisches Skript, legt window.SA.kacheln an. Braucht SA.satz.

   reihe(ort, opt)     Kacheln umstellen: antippen + Ziel antippen, Pfeiltasten, Ziehen mit Pointer-Events.
                       Ziehen ist nie die einzige Bedienung.
   trennen(ort, opt)   Wörter mit Strich-Knöpfen dazwischen.
   markieren(ort, opt) Kacheln an- und abwählen, gefundene Rollen mit Marke.

   Regeln: echte <button>, Text nur über textContent, keine style-Attribute im HTML (Ziehen setzt transform über
   element.style, das erlaubt die CSP, weil es kein Inline-Stil im Quelltext ist). */
(() => {
  'use strict';
  const SA = window.SA = window.SA || {};
  const Z = () => SA.satz;
  const ROLLE_MARKE = { subjekt: 'Subjekt', praedikat: 'Prädikat', zeit: 'Zeit', ort: 'Ort', wem: 'Wem', wen: 'Wen', sonstiges: '' };
  const ruhig = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let hinweisGesehen = false;   /* Bedienhinweis der Umstellprobe nur bis zum ersten Versetzen (je Seitenaufruf) */

  const el = (tag, klasse, text) => { const e = document.createElement(tag); if (klasse) e.className = klasse; if (text !== undefined) e.textContent = text; return e; };
  function kachelKnopf(text, rolle) {
    const b = el('button', 'kachel' + (rolle ? ' kachel--rolle rolle-' + rolle : ''));
    b.type = 'button';
    b.appendChild(el('span', 'kachel__text', text));
    if (rolle && ROLLE_MARKE[rolle]) b.appendChild(el('span', 'kachel__marke', ROLLE_MARKE[rolle]));
    return b;
  }

  /* ---------- Umstellen ----------
     opt: { satz, reihe (Indizes), art: 'aussage'|'frage', gesperrt, aenderung(reihe, text), rollen: { index: rolle } }
     Bedienung (Design-Review 16.11.2026, P0):
     - Tippen: Kärtchen antippen, dann werden Lücken (echte Knöpfe) vor, zwischen und hinter den Kärtchen sichtbar. Lücke antippen = dorthin.
       Ein anderes Kärtchen antippen wählt dieses. Die Lücken stehen immer im Satzfeld (unsichtbar, ohne Funktion),
       damit beim Wählen nichts springt (Design-Review Runde 2, P1).
     - Der Bedienhinweis steht nur, bis zum ersten Mal ein Kärtchen versetzt wurde (je Seitenaufruf).
     - Tasten: Pfeil links/rechts, Pos1, Ende verschieben das gewählte Kärtchen, Escape hebt die Wahl auf.
     - Ziehen: Pointer-Events, eine Einfügemarke zeigt, wo das Kärtchen landet.
     - Jedes Versetzen springt in einem ruhigen Bogen (300 ms, nur transform), bei reduzierter Bewegung ohne (Ingo, 16.11.2026). */
  function reihe(ort, opt) {
    const s = opt.satz;
    let r = opt.reihe.slice(), gewaehlt = -1;   /* gewaehlt = Stelle in r */
    const feld = el('ol', 'satzfeld satzfeld--reihe');
    feld.setAttribute('aria-label', 'Satz zum Umstellen');
    ort.textContent = '';
    ort.appendChild(feld);
    const hilfe = el('p', 'leise satzfeld__hilfe', 'Tippe ein Kärtchen an. Dann erscheinen Lücken. Tippe auf die Lücke, wo es hin soll. Du kannst es auch ziehen.');
    hilfe.id = 'satzfeld-hilfe-' + s.id;
    if (!opt.gesperrt && !hinweisGesehen) ort.appendChild(hilfe);

    function text() { return Z().text(s, r, opt.art); }
    const kartenText = (gi, pos) => Z().gliedText(s, gi, pos);
    /* Lücke ziel (0 … r.length): offen = sichtbar und bedienbar. Sonst unsichtbar, aber mit gleicher Breite. */
    function luecke(ziel, offen) {
      const li = el('li', 'satzfeld__luecke' + (offen ? ' satzfeld__luecke--offen' : ''));
      li.dataset.ziel = ziel;
      const b = el('button', 'einfuege-stelle');
      b.type = 'button';
      b.dataset.ziel = ziel;
      const wohin = ziel === 0 ? 'ganz nach vorn' : ziel >= r.length ? 'ans Ende' : `vor „${kartenText(r[ziel], ziel)}“`;
      b.setAttribute('aria-label', `Hierhin: ${wohin}`);
      if (!offen) { b.disabled = true; b.tabIndex = -1; li.setAttribute('aria-hidden', 'true'); }
      b.appendChild(el('span', 'einfuege-stelle__strich'));
      li.appendChild(b);
      return li;
    }
    /* Offen sind alle Lücken außer direkt vor und hinter dem gewählten Kärtchen (dort ändert sich nichts) */
    const offen = ziel => gewaehlt >= 0 && ziel !== gewaehlt && ziel !== gewaehlt + 1;
    function zeichnen(fokusStelle) {
      feld.textContent = '';
      feld.classList.toggle('satzfeld--waehlt', gewaehlt >= 0);
      r.forEach((gi, pos) => {
        feld.appendChild(luecke(pos, offen(pos)));
        const li = el('li', 'satzfeld__platz');
        const b = kachelKnopf(kartenText(gi, pos), opt.rollen && opt.rollen[gi]);
        b.dataset.pos = pos;
        b.dataset.glied = gi;
        b.setAttribute('aria-label', `${kartenText(gi, pos)}, Stelle ${pos + 1} von ${r.length}`);
        if (!opt.gesperrt) {
          b.setAttribute('aria-pressed', String(pos === gewaehlt));
          b.setAttribute('aria-describedby', hilfe.id);
          if (pos === gewaehlt) b.classList.add('kachel--gewaehlt');
        } else b.disabled = true;
        li.appendChild(b);
        if (pos === r.length - 1) { const z = el('span', 'satzfeld__zeichen', opt.art === 'frage' ? '?' : '.'); z.setAttribute('aria-hidden', 'true'); li.appendChild(z); }
        feld.appendChild(li);
      });
      feld.appendChild(luecke(r.length, offen(r.length)));
      if (fokusStelle !== undefined) { const b = feld.querySelector(`.kachel[data-pos="${fokusStelle}"]`); if (b) b.focus({ preventScroll: true }); }
    }
    /* Lagen aller Kärtchen merken (für den Bogen) */
    const lagen = () => { const m = {}; feld.querySelectorAll('.kachel').forEach(k => { m[k.dataset.glied] = k.getBoundingClientRect(); }); return m; };
    function bogen(vorher, springer) {
      if (SA.kacheln.ruhig()) return;
      feld.querySelectorAll('.kachel').forEach(k => {
        const a = vorher[k.dataset.glied];
        if (!a || typeof k.animate !== 'function') return;
        const b = k.getBoundingClientRect();
        const dx = a.left - b.left, dy = a.top - b.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        const hoch = String(springer) === k.dataset.glied ? Math.min(60, 24 + Math.abs(dx) / 6) : 0;
        k.animate(hoch
          ? [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: `translate(${dx / 2}px, ${dy / 2 - hoch}px)`, offset: 0.5 }, { transform: 'translate(0, 0)' }]
          : [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
        { duration: 300, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
      });
    }
    /* Verschieben: von = Stelle in r, nach = Stelle in r ohne das Kärtchen */
    function verschieben(von, nach, vorher, behalten) {
      if (von === nach || nach < 0 || nach >= r.length) return false;
      const lage = vorher || lagen();
      const [x] = r.splice(von, 1);
      r.splice(nach, 0, x);
      gewaehlt = behalten ? nach : -1;
      if (!hinweisGesehen) { hinweisGesehen = true; }
      zeichnen(nach);
      bogen(lage, x);
      if (opt.aenderung) opt.aenderung(r.slice(), text());
      return true;
    }
    feld.addEventListener('click', e => {
      if (opt.gesperrt || ziehen.aktiv) return;
      const l = e.target.closest('.einfuege-stelle');
      if (l && gewaehlt >= 0) {
        const ziel = Number(l.dataset.ziel);
        verschieben(gewaehlt, ziel > gewaehlt ? ziel - 1 : ziel);
        return;
      }
      const b = e.target.closest('.kachel');
      if (!b) return;
      const pos = Number(b.dataset.pos);
      if (gewaehlt === pos) { gewaehlt = -1; zeichnen(pos); return; }
      gewaehlt = pos;
      zeichnen(pos);
      SA.ansagen(`${b.querySelector('.kachel__text').textContent} ausgewählt. Tippe auf eine Lücke oder nimm die Pfeiltasten.`);
    });
    feld.addEventListener('keydown', e => {
      if (opt.gesperrt) return;
      const b = e.target.closest('.kachel');
      if (!b) return;
      const pos = Number(b.dataset.pos);
      const ziel = { ArrowLeft: pos - 1, ArrowUp: pos - 1, ArrowRight: pos + 1, ArrowDown: pos + 1, Home: 0, End: r.length - 1 }[e.key];
      if (ziel !== undefined) {
        e.preventDefault();
        const z = Math.max(0, Math.min(r.length - 1, ziel));
        if (gewaehlt === pos) verschieben(pos, z, null, true);
        else { const n = feld.querySelector(`.kachel[data-pos="${z}"]`); if (n) n.focus(); }
      } else if (e.key === 'Escape' && gewaehlt >= 0) { e.preventDefault(); gewaehlt = -1; zeichnen(pos); }
    });

    /* Ziehen mit Pointer-Events. Kurzes Tippen bleibt ein Klick. Einfügemarke am Kärtchen davor oder danach. */
    const ziehen = { aktiv: false };
    feld.addEventListener('pointerdown', e => {
      if (opt.gesperrt || e.button > 0) return;
      const b = e.target.closest('.kachel');
      if (!b) return;
      if (ziehen.b) { ziehen.b.style.transform = ''; ziehen.b.classList.remove('kachel--zieht'); }
      ziehen.b = b; ziehen.von = Number(b.dataset.pos); ziehen.x = e.clientX; ziehen.y = e.clientY; ziehen.aktiv = false; ziehen.id = e.pointerId;
    });
    /* Wohin das Kärtchen fällt: Stelle in r ohne das gezogene Kärtchen */
    function zielStelle(x, y) {
      const andere = [...feld.querySelectorAll('.kachel')].filter(k => k !== ziehen.b);
      for (let i = 0; i < andere.length; i++) {
        const q = andere[i].getBoundingClientRect();
        if (y < q.top) return i;
        if (y <= q.bottom && x < q.left + q.width / 2) return i;
      }
      return andere.length;
    }
    /* Einfügemarke: die Lücke an der Zielstelle wird sichtbar (sie steht ohnehin im Feld, nichts verschiebt sich).
       stelle zählt ohne das gezogene Kärtchen, die Lücken zählen mit ihm. */
    function markeSetzen(stelle) {
      feld.querySelectorAll('.satzfeld__luecke--nah').forEach(l => l.classList.remove('satzfeld__luecke--nah'));
      if (stelle === null || stelle === ziehen.von) return;
      const ziel = stelle < ziehen.von ? stelle : stelle + 1;
      const l = feld.querySelector(`.satzfeld__luecke[data-ziel="${ziel}"]`);
      if (l) l.classList.add('satzfeld__luecke--nah');
    }
    feld.addEventListener('pointermove', e => {
      if (!ziehen.b || e.pointerId !== ziehen.id) return;
      const dx = e.clientX - ziehen.x, dy = e.clientY - ziehen.y;
      if (!ziehen.aktiv && Math.hypot(dx, dy) < 10) return;
      if (!ziehen.aktiv) { ziehen.aktiv = true; try { ziehen.b.setPointerCapture(e.pointerId); } catch (x) { /* egal */ } ziehen.b.classList.add('kachel--zieht'); feld.classList.add('satzfeld--zieht'); }
      e.preventDefault();
      /* Für die Zielstelle zählt der Mittelpunkt des getragenen Kärtchens, nicht der Finger */
      /* Kärtchen über dem Finger tragen, damit Finger und Kärtchen die Marke nicht verdecken */
      ziehen.b.style.transform = `translate(${dx}px, ${dy - Math.round(ziehen.b.offsetHeight * 0.8)}px)`;
      markeSetzen(zielStelle(e.clientX, e.clientY - Math.round(ziehen.b.offsetHeight * 0.8)));
    });
    function loslassen(e, abbrechen) {
      if (!ziehen.b || e.pointerId !== ziehen.id) return;
      const war = ziehen.aktiv, von = ziehen.von;
      const nach = abbrechen || !war ? von : zielStelle(e.clientX, e.clientY - Math.round(ziehen.b.offsetHeight * 0.8));
      const vorher = war ? lagen() : null;   /* mit der Lage unter dem Finger, damit der Bogen dort beginnt */
      markeSetzen(null);
      ziehen.b.style.transform = '';
      ziehen.b.classList.remove('kachel--zieht');
      feld.classList.remove('satzfeld--zieht');
      ziehen.b = null;
      if (!war) return;
      e.preventDefault();
      gewaehlt = -1;
      if (!verschieben(von, nach, vorher)) zeichnen(von);
      /* Der Klick nach dem Ziehen soll nichts auswählen */
      setTimeout(() => { ziehen.aktiv = false; }, 0);
    }
    /* Loslassen auch außerhalb des Satzfelds (am Dokument), damit kein Kärtchen hängen bleibt */
    const auf = e => { if (!feld.isConnected) { document.removeEventListener('pointerup', auf, true); document.removeEventListener('pointercancel', ab, true); return; } loslassen(e, false); };
    const ab = e => { if (feld.isConnected) loslassen(e, true); };
    document.addEventListener('pointerup', auf, true);
    document.addEventListener('pointercancel', ab, true);

    zeichnen();
    return {
      reihe: () => r.slice(), text,
      setzen(neu, gesperrt) { r = neu.slice(); gewaehlt = -1; if (gesperrt !== undefined) opt.gesperrt = gesperrt; if (opt.gesperrt) hilfe.remove(); zeichnen(); },
      rollen(m) { opt.rollen = m; zeichnen(); }
    };
  }

  /* ---------- Trennen ----------
     opt: { satz, striche (Liste von Lücken), gesperrt, aenderung(striche), markiert: { fehlend: [], zuviel: [] } } */
  function trennen(ort, opt) {
    const s = opt.satz, w = Z().woerter(s);
    const striche = new Set(opt.striche || []);
    const feld = el('p', 'satzfeld satzfeld--trennen');
    ort.textContent = '';
    ort.appendChild(feld);
    function zeichnen(fokus) {
      feld.textContent = '';
      w.forEach((x, k) => {
        feld.appendChild(el('span', 'wort', x.wort));
        if (k < w.length - 1) {
          const b = el('button', 'luecke' + (striche.has(k) ? ' luecke--strich' : ''));
          b.type = 'button';
          b.dataset.luecke = k;
          b.setAttribute('aria-pressed', String(striche.has(k)));
          b.setAttribute('aria-label', `Strich zwischen ${x.wort} und ${w[k + 1].wort}`);
          if (opt.markiert && opt.markiert.fehlend.includes(k)) b.classList.add('luecke--fehlt');
          if (opt.markiert && opt.markiert.zuviel.includes(k)) b.classList.add('luecke--zuviel');
          b.appendChild(el('span', 'luecke__strich'));
          if (opt.gesperrt) b.disabled = true;
          feld.appendChild(b);
        }
      });
      feld.appendChild(el('span', 'wort wort--zeichen', '.'));
      if (fokus !== undefined) { const b = feld.querySelector(`[data-luecke="${fokus}"]`); if (b) b.focus({ preventScroll: true }); }
    }
    feld.addEventListener('click', e => {
      const b = e.target.closest('.luecke');
      if (!b || opt.gesperrt) return;
      const k = Number(b.dataset.luecke);
      if (striche.has(k)) striche.delete(k); else striche.add(k);
      opt.markiert = null;
      zeichnen(k);
      if (opt.aenderung) opt.aenderung([...striche]);
      SA.ansagen(striche.has(k) ? 'Strich gesetzt.' : 'Strich weg.');
    });
    zeichnen();
    return {
      striche: () => [...striche].sort((a, b) => a - b),
      setzen(neu, gesperrt, markiert) { striche.clear(); neu.forEach(k => striche.add(k)); if (gesperrt !== undefined) opt.gesperrt = gesperrt; opt.markiert = markiert || null; zeichnen(); }
    };
  }

  /* ---------- Markieren ----------
     opt: { satz, reihe, gewaehlt (Liste von Indizes), fest: { index: rolle }, gesperrt, aenderung(gewaehlt) } */
  function markieren(ort, opt) {
    const s = opt.satz;
    const gew = new Set(opt.gewaehlt || []);
    const feld = el('ol', 'satzfeld satzfeld--markieren');
    feld.setAttribute('aria-label', 'Satz');
    ort.textContent = '';
    ort.appendChild(feld);
    function zeichnen(fokus) {
      feld.textContent = '';
      opt.reihe.forEach((gi, pos) => {
        const li = el('li', 'satzfeld__platz');
        const fest = opt.fest && opt.fest[gi];
        const b = kachelKnopf(Z().gliedText(s, gi, pos), fest);
        b.dataset.glied = gi;
        if (fest) { b.disabled = true; b.setAttribute('aria-label', `${Z().gliedText(s, gi, pos)}: ${SA.satz.ROLLENNAME[fest]}`); }
        else {
          b.setAttribute('aria-pressed', String(gew.has(gi)));
          if (gew.has(gi)) b.classList.add('kachel--gewaehlt');
          if (opt.gesperrt) b.disabled = true;
        }
        li.appendChild(b);
        if (pos === opt.reihe.length - 1) { const z = el('span', 'satzfeld__zeichen', '.'); z.setAttribute('aria-hidden', 'true'); li.appendChild(z); }
        feld.appendChild(li);
      });
      if (fokus !== undefined) { const b = feld.querySelector(`[data-glied="${fokus}"]`); if (b && !b.disabled) b.focus({ preventScroll: true }); }
    }
    feld.addEventListener('click', e => {
      const b = e.target.closest('.kachel');
      if (!b || b.disabled || opt.gesperrt) return;
      const gi = Number(b.dataset.glied);
      if (gew.has(gi)) gew.delete(gi); else gew.add(gi);
      zeichnen(gi);
      if (opt.aenderung) opt.aenderung([...gew]);
    });
    zeichnen();
    return {
      gewaehlt: () => [...gew].sort((a, b) => a - b),
      setzen({ gewaehlt, fest, gesperrt }) { if (gewaehlt) { gew.clear(); gewaehlt.forEach(i => gew.add(i)); } if (fest) opt.fest = fest; if (gesperrt !== undefined) opt.gesperrt = gesperrt; zeichnen(); }
    };
  }

  /* Satz als Text mit Rollen (z. B. für Lösungen): [{ text, rolle }] */
  function leseZeile(s, reihe) {
    return reihe.map((gi, pos) => Z().gliedText(s, gi, pos)).join(', ');
  }

  SA.kacheln = { reihe, trennen, markieren, kachelKnopf, leseZeile, ROLLE_MARKE, ruhig };
})();
