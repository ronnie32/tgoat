/* Search for the TGoat guide.
   Reads window.TGOAT_SEARCH_INDEX (assets/search-index.js), works from file://
   and offline. The matching engine runs without a page too, for the tests:
   window.TGoatSearch.Engine. */
(function (root) {
  'use strict';

  /* ---------- Words ---------- */

  var WORD = /[\p{L}\p{N}]+/gu;

  function fold(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/œ/g, 'oe').replace(/Œ/g, 'OE').replace(/æ/g, 'ae').replace(/Æ/g, 'AE').replace(/ß/g, 'ss')
      .toLowerCase();
  }

  // words returns the words of s, with their place in s.
  function words(s) {
    var out = [], m;
    WORD.lastIndex = 0;
    while ((m = WORD.exec(s)) !== null) out.push({ w: m[0], at: m.index });
    return out;
  }

  function isUpper(c) { return c >= 'A' && c <= 'Z'; }
  function isLowerOrDigit(c) { return (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9'); }

  // camelParts splits MinLootFuelRatio into Min, Loot, Fuel, Ratio and
  // WebUI into Web, UI. A word with a single part gives [].
  function camelParts(w) {
    var parts = [], start = 0;
    for (var i = 1; i < w.length; i++) {
      var a = w[i - 1], b = w[i], c = w[i + 1];
      if ((isLowerOrDigit(a) && isUpper(b)) || (isUpper(a) && isUpper(b) && c && c >= 'a' && c <= 'z')) {
        parts.push(w.slice(start, i));
        start = i;
      }
    }
    if (start === 0) return [];
    parts.push(w.slice(start));
    return parts;
  }

  // stem is a light English stemmer: plurals, -ing, -ed and a final e, so
  // probe, probes and probing meet, and save, saved and saving.
  function stem(w) {
    if (w.length <= 3 || /[^a-z]/.test(w)) return w;
    if (/ie[sd]$/.test(w) && w.length > 4) w = w.slice(0, -3) + 'y';
    else if (/sses$/.test(w)) w = w.slice(0, -2);
    else if (/(?:[sxz]|ch|sh)es$/.test(w) && w.length > 4) w = w.slice(0, -2);
    else if (/s$/.test(w) && !/(?:ss|us|is)$/.test(w)) w = w.slice(0, -1);
    var m = null;
    if (/ing$/.test(w) && w.length >= 6) m = w.slice(0, -3);
    else if (/ed$/.test(w) && !/eed$/.test(w) && w.length >= 5) m = w.slice(0, -2);
    if (m) {
      if (/([b-df-hj-np-tv-z])\1$/.test(m) && !/(?:ll|ss|zz)$/.test(m) && m.length >= 5) m = m.slice(0, -1);
      w = m;
    }
    if (w.length > 3 && /[^e]e$/.test(w)) w = w.slice(0, -1);
    return w;
  }

  // editDistance is the Damerau-Levenshtein distance (a swap counts as one
  // edit), or max + 1 when it is more than max.
  function editDistance(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev2 = null, prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      var best = i;
      for (j = 1; j <= b.length; j++) {
        var cost = a[i - 1] === b[j - 1] ? 0 : 1;
        var v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
        cur[j] = v;
        if (v < best) best = v;
      }
      if (best > max) return max + 1;
      prev2 = prev;
      prev = cur;
    }
    return prev[b.length];
  }

  var STOP = new Set(('a an the of to in on at for and or is are be it its by with as how what do does i my can ' +
    'le la les l un une des de du d et ou en au aux pour par sur dans est comment quoi je mon ma mes').split(' '));

  /* ---------- Synonyms ---------- */

  // French words the owner uses, to the English words of the guide (one way).
  var FRENCH = [
    ['sonde|sondes|sondage|sonder', 'probe|espionage'],
    ['flotte|flottes', 'fleet'],
    ['vol|vols', 'flight|fleet'],
    ['expe|expes|expedition|expeditions', 'expedition'],
    ['antimatiere|matiere noire|mn|dm', 'dark matter'],
    ['fdv|forme de vie|formes de vie', 'lifeform'],
    ['lune|lunes', 'moon'],
    ['recyclage|recycler|recycleur|recycleurs|cdr|champ de debris|champs de debris', 'debris|recycler|harvest'],
    ['pillage|piller|pille', 'loot|raid|farm'],
    ['reglage|reglages|parametre|parametres', 'setting'],
    ['veille|dodo|sommeil|dormir|nuit', 'sleep|night'],
    ['attaque|attaques|attaquer', 'attack'],
    ['defense|defenses|defendre', 'defence|defender'],
    ['chantier|chantier spatial', 'shipyard|build'],
    ['recherche|recherches|techno|technologie|technologies', 'research|technology'],
    ['espion|espionnage|espionner', 'spy|espionage'],
    ['planete|planetes', 'planet'],
    ['colonie|colonies|coloniser|colonisation|colo', 'colony|colonize'],
    ['batiment|batiments|construction|construire', 'building|build'],
    ['vaisseau|vaisseaux', 'ship'],
    ['ressource|ressources|ress', 'resource'],
    ['cristal', 'crystal'],
    ['deut', 'deuterium'],
    ['marchand', 'trader|merchant'],
    ['enchere|encheres', 'auction'],
    ['galaxie|galaxies', 'galaxy'],
    ['systeme solaire', 'system'],
    ['connexion|se connecter|identifiant', 'login|sign in'],
    ['mot de passe|mdp', 'password'],
    ['jeton|jeton de session', 'token|session token'],
    ['compte|comptes', 'account'],
    ['journal|journaux', 'log'],
    ['bannissement|banni|bannir', 'ban'],
    ['aide', 'help'],
    ['demarrer|lancer|demarrage|lancement', 'start'],
    ['installer|installation', 'install'],
    ['mise a jour|mettre a jour|maj', 'update'],
    ['sauvegarde|sauvegarder', 'backup'],
    ['porte de saut|portail', 'jump gate'],
    ['phalange', 'phalanx'],
    ['rapport|rapports', 'report'],
    ['pause|pauses', 'break'],
    ['commande|commandes', 'command'],
    ['carburant|conso|consommation', 'fuel'],
    ['butin', 'loot'],
    ['cible|cibles', 'target'],
    ['inactif|inactifs|ina', 'inactive'],
    ['joueur|joueurs', 'player'],
    ['officier|officiers', 'officer'],
    ['alerte|avertissement', 'alert|warning'],
    ['vitesse', 'speed'],
    ['univers', 'universe'],
    ['satellite solaire|sat|sats', 'solar satellite'],
    ['grand transporteur|gt', 'large cargo'],
    ['petit transporteur|pt', 'small cargo'],
    ['interface web', 'web interface'],
    ['retour|rappel|rappeler', 'recall|return'],
    ['envoi|envoyer', 'send'],
    ['notif|notifs', 'notification'],
    ['heure|heures', 'hour'],
    ['bouclier|boucliers', 'shield'],
    ['ghost|ghoster|fuite', 'fleet save'],
    ['erreur|erreurs', 'error'],
    ['limite|limites', 'limit']
  ];
  // English words that mean the same in the guide (both ways).
  var ENGLISH = [
    'fleet save|fleetsave|fs',
    'autofarm|farm|raid',
    'ban|banned|suspended',
    'captcha|pow',
    'proxy|socks',
    'token|session token',
    'colonize|colonise|colonization|colonisation',
    'harvest|recycler|debris field',
    'expedition|expo',
    'lifeform|lf|life form',
    'telegram|tg',
    'web interface|webui|web ui',
    'login|log in|sign in',
    'defence|defense'
  ];

  function stems(phrase) {
    return words(fold(phrase)).map(function (x) { return stem(x.w); });
  }

  // SYN maps a stemmed phrase ("form de vie") to {alts: [[stems]], foreign}.
  var SYN = new Map();
  var SYN_WORDS = []; // single-word keys, folded, for prefixes and typos
  function addSyn(key, alts, foreign) {
    var k = stems(key).join(' ');
    var e = SYN.get(k);
    if (!e) { e = { alts: [], foreign: foreign }; SYN.set(k, e); }
    alts.forEach(function (a) {
      var s = stems(a);
      if (s.join(' ') !== k && !e.alts.some(function (x) { return x.join(' ') === s.join(' '); })) e.alts.push(s);
    });
    var f = fold(key);
    if (f.indexOf(' ') < 0 && SYN_WORDS.indexOf(f) < 0) SYN_WORDS.push(f);
  }
  FRENCH.forEach(function (row) {
    var alts = row[1].split('|');
    row[0].split('|').forEach(function (k) { addSyn(k, alts, true); });
  });
  ENGLISH.forEach(function (row) {
    var all = row.split('|');
    all.forEach(function (k) { addSyn(k, all, false); });
  });

  /* ---------- Index ---------- */

  var TITLE = 1, KEYS = 2, CRUMB = 4, TEXT = 8;
  var FIELD_WEIGHT = { 1: 10, 2: 7, 4: 2.5, 8: 1 };

  function Engine(data) {
    var self = this;
    this.pages = data.pages.map(function (p) { return { file: p[0], name: p[1] }; });
    this.tables = data.tables;
    this.post = new Map();   // stem -> [doc ids]
    this.surf = new Map();   // folded word -> {stem, n}
    this.docs = data.docs.map(function (a, id) {
      var d = {
        id: id, page: a[0], anchor: a[1], loc: a[2], kind: a[3], title: a[4], crumb: a[5],
        text: a[6], keys: a[7], table: a[8], stems: new Map(), seq: []
      };
      self.addField(d, d.title, TITLE);
      self.addField(d, d.keys.join(' \n '), KEYS);
      self.addField(d, d.crumb, CRUMB);
      self.addField(d, d.text, TEXT);
      return d;
    });
    this.docs.forEach(function (d) {
      d.stems.forEach(function (info, s) {
        var list = self.post.get(s);
        if (!list) self.post.set(s, (list = []));
        list.push(d.id);
      });
    });
    this.surfaces = Array.from(this.surf.keys()).sort();
  }

  // addField indexes one field of a doc and keeps its word sequences for
  // phrases: whole words (AutoFarm, MinLootFuelRatio) and split words (auto,
  // farm, min, loot…).
  Engine.prototype.addField = function (d, s, field) {
    var self = this, whole = [], split = [];
    words(s).forEach(function (x) {
      var f = fold(x.w);
      var parts = camelParts(x.w);
      var st = self.note(d, f, field);
      if (st) whole.push(st);
      if (parts.length) {
        parts.forEach(function (p) {
          var ps = self.note(d, fold(p), field);
          if (ps) split.push(ps);
        });
      } else if (st) split.push(st);
    });
    if (whole.length) d.seq.push(whole);
    if (splitDiffers(split, whole)) d.seq.push(split);
  };
  function splitDiffers(split, whole) { return split.length && split.join(' ') !== whole.join(' '); }

  Engine.prototype.note = function (d, f, field) {
    if (f.length < 2 && !/\d/.test(f)) return '';
    var s = stem(f);
    var info = d.stems.get(s);
    if (!info) d.stems.set(s, (info = { m: 0, tf: 0 }));
    info.m |= field;
    if (field === TEXT) info.tf++;
    var e = this.surf.get(f);
    if (!e) this.surf.set(f, (e = { stem: s, n: 0 }));
    e.n++;
    return s;
  };

  function fieldWeight(info) {
    var w = info.m & TITLE ? 10 : info.m & KEYS ? 7 : info.m & CRUMB ? 2.5 : 1 + Math.min(0.6, 0.2 * (info.tf - 1));
    if (info.m & TEXT && w > 1) w += 0.3;
    return w;
  }

  /* ---------- Query ---------- */

  // parse turns the query into groups: one per word (or per known French
  // phrase), each with the ways a doc can match it.
  Engine.prototype.parse = function (q) {
    var self = this;
    var toks = words(q).map(function (x) {
      var f = fold(x.w);
      return {
        orig: x.w, at: x.at, raw: f, stem: stem(f),
        parts: camelParts(x.w).map(function (p) { var pf = fold(p); return { raw: pf, stem: stem(pf) }; })
      };
    });
    var open = !/\s$/.test(q); // the last word may still be typed
    var groups = [];
    for (var i = 0; i < toks.length;) {
      var taken = 0;
      for (var n = Math.min(4, toks.length - i); n >= 2; n--) {
        var key = toks.slice(i, i + n).map(function (t) { return t.stem; }).join(' ');
        if (SYN.has(key)) {
          var span = toks.slice(i, i + n);
          groups.push({
            toks: span, raw: span.map(function (t) { return t.raw; }).join(' '),
            orig: q.slice(span[0].at, span[n - 1].at + span[n - 1].orig.length),
            syn: SYN.get(key), phrase: true, last: false
          });
          taken = n;
          break;
        }
      }
      if (!taken) {
        var t = toks[i];
        groups.push({ toks: [t], raw: t.raw, orig: t.orig, syn: SYN.get(t.stem) || SYN.get(t.raw) || null, phrase: false, last: false });
        taken = 1;
      }
      i += taken;
    }
    if (groups.length && open && !groups[groups.length - 1].phrase) groups[groups.length - 1].last = true;
    var kept = groups.filter(function (g) { return g.phrase || !STOP.has(g.raw); });
    if (kept.length) groups = kept;
    groups.forEach(function (g) { g.clauses = self.clauses(g); });
    return { toks: toks, groups: groups, open: open };
  };

  // resolve finds the indexed stems a typed word stands for, with a quality:
  // the word itself (1), a longer word it starts (while typing), a word one
  // or two letters away (typos).
  Engine.prototype.resolve = function (t, last, foreign) {
    var map = new Map();
    if (this.post.has(t.stem)) map.set(t.stem, 1);
    var raw = t.raw;
    if (raw.length >= (last ? 2 : 3)) {
      var q = foreign ? 0.5 : last ? 0.85 : 0.6;
      var list = this.surfaces, lo = 0, hi = list.length;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (list[mid] < raw) lo = mid + 1; else hi = mid; }
      for (var i = lo, seen = 0; i < list.length && list[i].lastIndexOf(raw, 0) === 0 && seen < 300; i++, seen++) {
        var s = this.surf.get(list[i]).stem;
        if (!map.has(s)) map.set(s, q);
      }
    }
    if (!map.size && !foreign && raw.length >= 5 && /^[a-z]+$/.test(raw)) {
      var max = raw.length >= 9 ? 2 : 1, self = this;
      this.surfaces.forEach(function (w) {
        if (Math.abs(w.length - raw.length) > max) return;
        var d = editDistance(raw, w, max);
        if (d <= max) {
          var s2 = self.surf.get(w).stem, qq = d === 1 ? 0.6 : 0.45;
          if ((map.get(s2) || 0) < qq) map.set(s2, qq);
        }
      });
    }
    return map;
  };

  Engine.prototype.exact = function (st) {
    var map = new Map();
    if (this.post.has(st)) map.set(st, 1);
    return map;
  };

  Engine.prototype.altClauses = function (alts, w) {
    var self = this;
    // The first alternative is the closest word: the others rank a bit lower.
    return alts.map(function (alt, i) {
      return { maps: alt.map(function (s) { return self.exact(s); }), w: i ? w * 0.92 : w, syn: true };
    });
  };

  // clauses lists the ways a doc matches a group; a clause holds when every
  // one of its maps finds a stem in the doc.
  Engine.prototype.clauses = function (g) {
    var self = this, out = [];
    var foreign = !!(g.syn && g.syn.foreign);
    if (g.phrase) {
      out.push({ maps: g.toks.map(function (t) { return self.exact(t.stem); }), w: 1 });
    } else {
      var t = g.toks[0];
      out.push({ maps: [this.resolve(t, g.last, foreign)], w: 1 });
      if (t.parts.length > 1) {
        out.push({
          maps: t.parts.map(function (p, i) { return self.resolve(p, g.last && i === t.parts.length - 1, false); }),
          w: 0.9
        });
      }
    }
    if (g.syn) out = out.concat(this.altClauses(g.syn.alts, g.syn.foreign ? 0.9 : 0.85));
    if (!g.phrase && !g.syn) {
      var raw = g.raw;
      SYN_WORDS.forEach(function (k) {
        var e = SYN.get(stem(k));
        // A key that is a word of the guide is already found by its own typos.
        if (!e || self.post.has(stem(k))) return;
        if (g.last && raw.length >= 3 && k.length > raw.length && k.lastIndexOf(raw, 0) === 0) {
          out = out.concat(self.altClauses(e.alts, 0.75));
        } else if (raw.length >= 5 && Math.abs(k.length - raw.length) <= 1 && editDistance(raw, k, 1) === 1) {
          out = out.concat(self.altClauses(e.alts, 0.7));
        }
      });
    }
    return out.filter(function (c) { return c.maps.every(function (m) { return m.size > 0; }); });
  };

  /* ---------- Search ---------- */

  Engine.prototype.search = function (query, limit) {
    var self = this;
    var p = this.parse(query);
    var groups = p.groups;
    var res = { query: query, groups: groups, results: [], partial: false, unmatched: [], suggestion: null, total: 0 };
    if (!groups.length) return res;
    var score = new Map(), count = new Map();
    groups.forEach(function (g) {
      var best = new Map();
      g.clauses.forEach(function (c) {
        var per = null;
        c.maps.forEach(function (m) {
          var here = new Map();
          m.forEach(function (q, s) {
            (self.post.get(s) || []).forEach(function (id) {
              var v = q * fieldWeight(self.docs[id].stems.get(s));
              if ((here.get(id) || 0) < v) here.set(id, v);
            });
          });
          if (per === null) per = here;
          else {
            var next = new Map();
            per.forEach(function (v, id) { if (here.has(id)) next.set(id, Math.min(v, here.get(id))); });
            per = next;
          }
        });
        (per || new Map()).forEach(function (v, id) {
          v *= c.w;
          if ((best.get(id) || 0) < v) best.set(id, v);
        });
      });
      if (!best.size) res.unmatched.push(g);
      best.forEach(function (v, id) {
        score.set(id, (score.get(id) || 0) + v);
        count.set(id, (count.get(id) || 0) + 1);
      });
    });
    var phrase = p.toks.map(function (t) { return t.stem; });
    var qfold = p.toks.map(function (t) { return t.raw; }).join(' ');
    var list = [];
    score.forEach(function (s, id) {
      var d = self.docs[id];
      var all = count.get(id) === groups.length;
      var tier = all ? 2 : 1;
      if (all && phrase.length >= 2 && hasPhrase(d, phrase, p.open)) tier = 3;
      // A title that is exactly the query ("Session token") comes first of all.
      if (all && words(fold(d.title)).map(function (x) { return x.w; }).join(' ') === qfold) tier = 4;
      var spec = 1 / (1 + 0.2 * Math.log2(1 + d.text.length / 250));
      list.push({ doc: d, score: s * spec, tier: tier });
    });
    list.sort(function (a, b) { return b.tier - a.tier || b.score - a.score || a.doc.id - b.doc.id; });
    if (list.length && list[0].tier >= 2) list = list.filter(function (r) { return r.tier >= 2; });
    else if (list.length) res.partial = true;
    res.total = list.length;
    res.results = list.slice(0, limit || 80);
    if (!list.length || res.unmatched.length) res.suggestion = this.suggest(query, res.unmatched.length ? res.unmatched : groups);
    return res;
  };

  // hasPhrase says whether the stems follow each other in a field of the
  // doc; the last one may be the start of a word still being typed.
  function hasPhrase(d, ph, open) {
    var n = ph.length;
    return d.seq.some(function (seq) {
      for (var i = 0; i + n <= seq.length; i++) {
        var ok = true;
        for (var j = 0; j < n && ok; j++) {
          ok = j === n - 1 && open ? seq[i + j].lastIndexOf(ph[j], 0) === 0 : seq[i + j] === ph[j];
        }
        if (ok) return true;
      }
      return false;
    });
  }

  // suggest offers the closest known word for a word that finds nothing.
  Engine.prototype.suggest = function (query, groups) {
    var self = this;
    for (var i = 0; i < groups.length; i++) {
      var g = groups[i];
      if (g.phrase || g.raw.length < 3) continue;
      var raw = g.raw, max = Math.max(2, Math.floor(raw.length / 3)), best = null;
      var consider = function (w, n) {
        if (w === raw || Math.abs(w.length - raw.length) > max) return;
        var d = editDistance(raw, w, max);
        if (d <= max && (!best || d < best.d || (d === best.d && n > best.n))) best = { w: w, d: d, n: n };
      };
      this.surfaces.forEach(function (w) { if (/^[a-z]{3,}$/.test(w)) consider(w, self.surf.get(w).n); });
      SYN_WORDS.forEach(function (w) { consider(w, 1); });
      if (best) {
        var at = query.toLowerCase().lastIndexOf(g.orig.toLowerCase());
        var q = at >= 0 ? query.slice(0, at) + best.w + query.slice(at + g.orig.length) : best.w;
        return { word: best.w, query: q.trim(), for: g.orig };
      }
    }
    return null;
  };

  // matched lists the stems of a doc that the query found, to highlight
  // them.
  Engine.prototype.matched = function (d, groups) {
    var set = new Set();
    groups.forEach(function (g) {
      g.clauses.forEach(function (c) {
        c.maps.forEach(function (m) { m.forEach(function (q, s) { if (d.stems.has(s)) set.add(s); }); });
      });
    });
    return set;
  };

  // mark cuts s into pieces, marking the words whose stem (or the stem of a
  // part) is in the set.
  function mark(s, set) {
    var out = [], pos = 0, hits = 0;
    words(s).forEach(function (x) {
      var f = fold(x.w);
      var hit = set.has(stem(f)) || camelParts(x.w).some(function (p) { return set.has(stem(fold(p))); });
      if (!hit) return;
      if (x.at > pos) out.push({ t: s.slice(pos, x.at), m: false });
      out.push({ t: x.w, m: true });
      pos = x.at + x.w.length;
      hits++;
    });
    if (pos < s.length) out.push({ t: s.slice(pos), m: false });
    out.hits = hits;
    return out;
  }

  // snippet picks a short piece of the text around the matched words. For a
  // table row, the piece stays in one cell and is labelled with its column.
  Engine.prototype.snippet = function (d, set, size) {
    size = size || 150;
    var parts = d.kind === 'r' ? d.text.split('\n') : [d.text];
    var bestI = 0, bestHits = -1;
    parts.forEach(function (c, i) {
      var h = mark(c, set).hits;
      if (h > bestHits) { bestHits = h; bestI = i; }
    });
    var s = parts[bestI] || '';
    var label = '';
    if (d.kind === 'r' && d.table >= 0 && this.tables[d.table] && parts.length > 1) label = this.tables[d.table][bestI + 1] || '';
    var hits = [];
    words(s).forEach(function (x) {
      if (set.has(stem(fold(x.w))) || camelParts(x.w).some(function (p) { return set.has(stem(fold(p))); })) hits.push(x.at);
    });
    var start = 0;
    if (hits.length && s.length > size) {
      var bestStart = hits[0], bestN = 0;
      hits.forEach(function (h) {
        var n = hits.filter(function (o) { return o >= h && o < h + size - 40; }).length;
        if (n > bestN) { bestN = n; bestStart = h; }
      });
      start = Math.max(0, bestStart - 40);
      if (start > 0) { var sp = s.indexOf(' ', start); start = sp >= 0 && sp < bestStart ? sp + 1 : start; }
    }
    var end = Math.min(s.length, start + size);
    if (end < s.length) { var sp2 = s.lastIndexOf(' ', end); if (sp2 > start + size / 2) end = sp2; }
    var piece = s.slice(start, end);
    var out = mark(piece, set);
    if (start > 0) out.unshift({ t: '…', m: false });
    if (end < s.length) out.push({ t: '…', m: false });
    return { label: label, parts: out };
  };

  Engine.prototype.href = function (d) {
    return this.pages[d.page].file + (d.anchor ? '#' + d.anchor : '');
  };

  /* ---------- Arrival on a target ---------- */

  var HINT_KEY = 'tgoat-search-target';

  // openAncestors opens every closed <details> around el (and el itself).
  function openAncestors(el) {
    var opened = false;
    for (var n = el; n; n = n.parentElement) {
      if (n.tagName === 'DETAILS' && !n.open) { n.open = true; opened = true; }
    }
    return opened;
  }

  // unreleased says whether el sits in a part of the guide about a paid
  // feature this release does not ship (data-paid): the published guide has
  // no such part, so the index does not count it.
  function unreleased(el) {
    var idx = root.TGOAT_SEARCH_INDEX;
    var released = (idx && idx.released) || [];
    for (var n = el; n; n = n.parentElement) {
      var f = n.getAttribute ? n.getAttribute('data-paid') : null;
      if (f && released.indexOf(f) < 0) return true;
    }
    return false;
  }

  // findTarget finds the element a search result points to: the exact
  // element when the result left a hint (a table row has no id of its own),
  // otherwise the element of the anchor.
  function findTarget(doc, hash, hint) {
    if (hint && hint.anchor === hash && hint.loc) {
      var p = hint.loc.split(':');
      var all = doc.querySelectorAll('main ' + p[0]);
      var el = null;
      for (var i = 0, k = Number(p[1]); i < all.length; i++) {
        if (unreleased(all[i])) continue;
        if (k-- === 0) { el = all[i]; break; }
      }
      if (el) return el;
    }
    return hash ? doc.getElementById(hash) : null;
  }

  function pageFile(loc) {
    var f = decodeURIComponent(loc.pathname.split('/').pop() || '');
    return f || 'index.html';
  }

  function readHint(page) {
    try {
      var h = JSON.parse(root.sessionStorage.getItem(HINT_KEY) || 'null');
      root.sessionStorage.removeItem(HINT_KEY);
      if (h && h.page === page && Date.now() - h.at < 60000) return h;
    } catch (e) { /* storage off: the anchor alone */ }
    return null;
  }

  function saveHint(h) {
    try { root.sessionStorage.setItem(HINT_KEY, JSON.stringify(h)); } catch (e) { /* storage off */ }
  }

  function reducedMotion() {
    return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // reveal opens the folds around el, brings it into view and marks it for a
  // moment. On arrival from another page the jump is instant.
  function reveal(el, flash, instant) {
    var opened = openAncestors(el);
    if (!flash && !opened) return;
    var go = function () {
      el.scrollIntoView({ block: el.tagName === 'TR' ? 'center' : 'start', behavior: instant || reducedMotion() ? 'instant' : 'smooth' });
      if (!el.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SUMMARY)$/.test(el.tagName)) el.setAttribute('tabindex', '-1');
      try { el.focus({ preventScroll: true }); } catch (e) { /* old browser */ }
      el.classList.remove('search-target');
      void el.offsetWidth;
      el.classList.add('search-target');
      setTimeout(function () { el.classList.remove('search-target'); }, 2600);
    };
    if (root.requestAnimationFrame) root.requestAnimationFrame(go); else go();
  }

  function arrive(fromSearch, onLoad) {
    var doc = root.document;
    var hash = '';
    try { hash = decodeURIComponent(root.location.hash.slice(1)); } catch (e) { hash = root.location.hash.slice(1); }
    var hint = readHint(pageFile(root.location));
    var el = findTarget(doc, hash, hint);
    if (el) reveal(el, !!hint || fromSearch, onLoad);
  }

  /* ---------- The search box ---------- */

  var PER_PAGE = 3;

  function ui() {
    var doc = root.document;
    var nav = doc.querySelector('.site-nav');
    if (!nav || doc.getElementById('gs-input')) return;
    var data = root.TGOAT_SEARCH_INDEX;
    var engine = null;
    var current = null, expanded = {}, active = -1, options = [], timer = 0, sayTimer = 0;

    function el(tag, cls, text) {
      var e = doc.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }

    var box = el('div', 'gs');
    box.setAttribute('role', 'search');
    var label = el('label', 'sr-only', 'Search the guide');
    label.htmlFor = 'gs-input';
    var input = el('input', 'gs-input');
    input.id = 'gs-input';
    input.type = 'search';
    input.placeholder = 'Search the guide';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', 'gs-list');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-describedby', 'gs-help');
    input.setAttribute('enterkeyhint', 'go');
    var key = el('kbd', 'gs-key', '/');
    key.setAttribute('aria-hidden', 'true');
    var panel = el('div', 'gs-panel');
    panel.hidden = true;
    var msg = el('div', 'gs-msg');
    msg.id = 'gs-msg';
    var list = el('div', 'gs-list');
    list.id = 'gs-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Results');
    var foot = el('div', 'gs-foot');
    foot.setAttribute('aria-hidden', 'true');
    [['↑', '↓', ' to move'], ['Enter', ' to open'], ['Esc', ' to close']].forEach(function (k, i) {
      if (i) foot.appendChild(doc.createTextNode(' · '));
      k.forEach(function (part, j) {
        foot.appendChild(j < k.length - 1 ? el('kbd', null, part) : doc.createTextNode(part));
      });
    });
    var help = el('span', 'sr-only', 'Results appear as you type. Use the up and down arrows to move, Enter to open. Shortcut: slash or Control K.');
    help.id = 'gs-help';
    var status = el('div', 'sr-only');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    panel.appendChild(msg);
    panel.appendChild(list);
    panel.appendChild(foot);
    [label, input, key, panel, help, status].forEach(function (c) { box.appendChild(c); });
    nav.appendChild(box);
    nav.classList.add('has-search');

    function ensureEngine() {
      if (!engine && data) engine = new Engine(data);
      return engine;
    }

    function setOpen(open) {
      panel.hidden = !open;
      input.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) setActive(-1);
    }

    function setActive(i) {
      if (active >= 0 && options[active]) {
        options[active].classList.remove('is-active');
        options[active].setAttribute('aria-selected', 'false');
      }
      active = i;
      if (i >= 0 && options[i]) {
        options[i].classList.add('is-active');
        options[i].setAttribute('aria-selected', 'true');
        input.setAttribute('aria-activedescendant', options[i].id);
        options[i].scrollIntoView({ block: 'nearest' });
      } else {
        input.removeAttribute('aria-activedescendant');
      }
    }

    function say(text) {
      clearTimeout(sayTimer);
      sayTimer = setTimeout(function () { status.textContent = text; }, 500);
    }

    function pieces(parent, parts) {
      parts.forEach(function (p) {
        parent.appendChild(p.m ? el('mark', null, p.t) : doc.createTextNode(p.t));
      });
    }

    function message(nodes) {
      msg.textContent = '';
      nodes.forEach(function (n) { msg.appendChild(typeof n === 'string' ? doc.createTextNode(n) : n); });
      msg.hidden = !nodes.length;
    }

    function tryButton(q, text) {
      var b = el('button', 'gs-try', text || q);
      b.type = 'button';
      b.addEventListener('click', function () { input.value = q; input.focus(); run(); });
      return b;
    }

    function hintState() {
      list.textContent = '';
      options = [];
      setActive(-1);
      message(['Type a word, a setting or a command. French works too: ',
        tryButton('sonde'), ', ', tryButton('flotte'), ', ', tryButton('lune'), '.']);
      foot.hidden = true;
    }

    function run() {
      var q = input.value;
      box.classList.toggle('has-value', q.length > 0);
      if (!ensureEngine()) {
        message(['The search index did not load.']);
        setOpen(true);
        return;
      }
      if (fold(q).replace(/[^\p{L}\p{N}]/gu, '').length < 2) {
        current = null;
        hintState();
        setOpen(doc.activeElement === input);
        if (q.trim()) say('');
        return;
      }
      current = engine.search(q, 60);
      expanded = {};
      render();
      setOpen(true);
    }

    function render() {
      var r = current;
      list.textContent = '';
      options = [];
      active = -1;
      input.removeAttribute('aria-activedescendant');
      var shown = r.query.trim();
      if (!r.results.length) {
        var nodes = ['No result for “' + shown + '”.'];
        if (r.suggestion) nodes.push(' Try ', tryButton(r.suggestion.query), '.');
        else if (r.groups.length > 1) nodes.push(' Try fewer words.');
        else nodes.push(' Try a shorter word, or the name of a setting.');
        message(nodes);
        foot.hidden = true;
        say('No result');
        return;
      }
      if (r.partial) {
        var parts = ['No section has every word. Closest matches below.'];
        if (r.suggestion) parts = ['Nothing for “' + r.suggestion.for + '”. Try ', tryButton(r.suggestion.query), '. Closest matches below.'];
        message(parts);
      } else {
        message([]);
      }
      foot.hidden = false;
      var byPage = [], pos = {};
      r.results.forEach(function (res) {
        var p = res.doc.page;
        if (!(p in pos)) { pos[p] = byPage.length; byPage.push({ page: p, items: [] }); }
        byPage[pos[p]].items.push(res);
      });
      var per = byPage.length === 1 ? 8 : PER_PAGE;
      byPage.forEach(function (grp, gi) {
        var g = el('div', 'gs-group');
        g.setAttribute('role', 'group');
        g.setAttribute('aria-label', engine.pages[grp.page].name);
        var head = el('div', 'gs-page', engine.pages[grp.page].name);
        head.setAttribute('aria-hidden', 'true');
        g.appendChild(head);
        var n = expanded[grp.page] ? grp.items.length : Math.min(per, grp.items.length);
        grp.items.slice(0, n).forEach(function (res) { g.appendChild(option(res)); });
        if (grp.items.length > n) {
          var more = el('div', 'gs-opt gs-more', (grp.items.length - n) + ' more on this page');
          more.setAttribute('role', 'option');
          more.setAttribute('aria-selected', 'false');
          more.id = 'gs-o' + options.length;
          more.dataset.page = grp.page;
          more.addEventListener('mousedown', function (e) { e.preventDefault(); });
          more.addEventListener('click', function () { expand(grp.page); });
          options.push(more);
          g.appendChild(more);
        }
        list.appendChild(g);
        if (gi === 0) g.classList.add('gs-first');
      });
      var pages = byPage.length;
      say(r.total + (r.total === 1 ? ' result' : ' results') + ' on ' + pages + (pages === 1 ? ' page' : ' pages') +
        (r.partial ? ', none with every word' : ''));
    }

    function option(res) {
      var d = res.doc;
      var set = engine.matched(d, current.groups);
      var a = el('a', 'gs-opt');
      a.href = engine.href(d);
      a.id = 'gs-o' + options.length;
      a.setAttribute('role', 'option');
      a.setAttribute('aria-selected', 'false');
      a.tabIndex = -1;
      a.dataset.page = d.page;
      var line = el('span', 'gs-line');
      var t = el('span', 'gs-title');
      pieces(t, mark(d.title, set));
      line.appendChild(t);
      if (d.crumb && d.crumb !== d.title) line.appendChild(el('span', 'gs-crumb', d.crumb));
      a.appendChild(line);
      var sn = engine.snippet(d, set, 140);
      if (sn.parts.length) {
        var s = el('span', 'gs-snip');
        if (sn.label) s.appendChild(el('span', 'gs-label', sn.label + ': '));
        pieces(s, sn.parts);
        a.appendChild(s);
      }
      a.addEventListener('mousedown', function (e) { e.preventDefault(); });
      a.addEventListener('click', function (e) {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
        e.preventDefault();
        go(d);
      });
      options.push(a);
      return a;
    }

    // expand shows every result of a page and keeps the place: the first
    // result that was hidden.
    function expand(page) {
      var shown = options.filter(function (o) { return o.dataset.page == page && !o.classList.contains('gs-more'); }).length;
      expanded[page] = true;
      render();
      var ofPage = [];
      options.forEach(function (o, i) { if (o.dataset.page == page) ofPage.push(i); });
      setActive(ofPage.length ? ofPage[Math.min(shown, ofPage.length - 1)] : -1);
      input.focus();
    }

    function go(d) {
      var here = pageFile(root.location);
      var file = engine.pages[d.page].file;
      saveHint({ page: file, anchor: d.anchor, loc: d.loc, at: Date.now() });
      setOpen(false);
      if (file === here) {
        var hash = d.anchor ? '#' + d.anchor : '';
        if (root.location.hash === hash || (!hash && !root.location.hash)) arrive(true);
        else root.location.hash = hash;
      } else {
        root.location.href = engine.href(d);
      }
    }

    function activate(i) {
      var o = options[i];
      if (!o) return;
      if (o.classList.contains('gs-more')) expand(Number(o.dataset.page));
      else o.click();
    }

    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(run, 60);
    });
    input.addEventListener('focus', function () { run(); });
    input.addEventListener('keydown', function (e) {
      // Keys pressed before the results of the last letters caught up.
      if (/^(ArrowDown|ArrowUp|Enter)$/.test(e.key) && input.value && (current === null || current.query !== input.value)) {
        clearTimeout(timer);
        run();
      }
      var open = !panel.hidden;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!open) { run(); return; }
          if (options.length) setActive(active + 1 >= options.length ? 0 : active + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (open && options.length) setActive(active <= 0 ? options.length - 1 : active - 1);
          break;
        case 'Enter':
          if (!open) return;
          e.preventDefault();
          activate(active >= 0 ? active : 0);
          break;
        case 'Escape':
          e.preventDefault();
          if (open) setOpen(false);
          else if (input.value) { input.value = ''; run(); setOpen(false); }
          else input.blur();
          break;
        case 'Tab':
          setOpen(false);
          break;
      }
    });
    doc.addEventListener('pointerdown', function (e) {
      if (!box.contains(e.target)) setOpen(false);
    });
    doc.addEventListener('keydown', function (e) {
      var t = e.target;
      var editable = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey) && !e.altKey) {
        e.preventDefault();
        input.focus();
        input.select();
      } else if (e.key === '/' && !editable && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  root.TGoatSearch = {
    Engine: Engine, fold: fold, stem: stem, camelParts: camelParts, editDistance: editDistance,
    mark: mark, openAncestors: openAncestors, findTarget: findTarget, SYN: SYN
  };

  if (root.document && root.document.addEventListener) {
    var start = function () {
      ui();
      arrive(false, true);
      root.addEventListener('hashchange', function () { arrive(false); });
    };
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start);
    else start();
  }
})(typeof window !== 'undefined' ? window : globalThis);
