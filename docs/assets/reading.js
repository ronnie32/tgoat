/* TGoat guide: reading aids. Works from file://, no network, no build.
   Adds the reading time under the page title, a thin progress bar, the
   current section in the table of contents, a back-to-top control, break
   points in long setting names, and table niceties (pinned header row on
   tables that fit, rows stacked as blocks on a phone).
   Every page reads fine without it. */
(function () {
  'use strict';
  var doc = document;
  var root = doc.documentElement;
  var main = doc.getElementById('main') || doc.querySelector('main');
  if (!main || !('addEventListener' in window)) return;
  root.classList.add('js');

  var WPM = 200; // a calm pace for technical text
  var reduce = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var wide = window.matchMedia ? matchMedia('(min-width: 1100px)') : { matches: true };
  var phone = window.matchMedia ? matchMedia('(max-width: 640px)') : { matches: false };

  // ---- Reading time -------------------------------------------------------
  var SKIP = { SCRIPT: 1, STYLE: 1, NAV: 1, FOOTER: 1, TEMPLATE: 1, NOSCRIPT: 1 };
  var wordRe;
  try { wordRe = new RegExp('[\\p{L}\\p{N}][\\p{L}\\p{N}\'’._/-]*', 'gu'); } catch (e) { wordRe = /[A-Za-z0-9À-ɏ][A-Za-z0-9À-ɏ'’._\/-]*/g; }

  function countWords(node, all) {
    var n = 0;
    for (var c = node.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) {
        var m = c.nodeValue.match(wordRe);
        if (m) n += m.length;
      } else if (c.nodeType === 1) {
        if (SKIP[c.tagName] || c.hidden || c.classList.contains('sr-only') || c.classList.contains('reading-time')) continue;
        if (c.tagName === 'DETAILS' && !all && !c.open) {
          var s = c.querySelector(':scope > summary');
          if (s) n += countWords(s, all);
          continue;
        }
        n += countWords(c, all);
      }
    }
    return n;
  }

  function minutes(words) { return Math.max(1, Math.round(words / WPM)); }

  (function readingTime() {
    var shown = minutes(countWords(main, false));
    var full = minutes(countWords(main, true));
    var p = doc.createElement('p');
    p.className = 'reading-time';
    p.textContent = full - shown >= 2
      ? 'About ' + shown + ' min to read, ' + full + ' min with every collapsed part opened.'
      : 'About ' + shown + ' min to read.';
    var title = null;
    var hs = main.querySelectorAll('h1, h2');
    for (var i = 0; i < hs.length; i++) {
      if (!hs[i].classList.contains('sr-only')) { title = hs[i]; break; }
    }
    if (title) title.insertAdjacentElement('afterend', p);
    else main.insertBefore(p, main.firstChild);
  })();

  // ---- Break points in long names (AutoFarm.CombatPlanner.MaxFailure...) ---
  function breakable(code) {
    if (code.closest('pre') || code.childNodes.length !== 1 || code.firstChild.nodeType !== 3) return;
    var t = code.firstChild.nodeValue;
    if (t.length < 16 || /\s/.test(t)) return;
    var parts = [], cur = '';
    for (var i = 0; i < t.length; i++) {
      var ch = t.charAt(i);
      // before a capital that follows a lower-case letter, in a long word
      if (cur.length >= 8 && /[A-Z]/.test(ch) && /[a-z]/.test(cur.charAt(cur.length - 1))) { parts.push(cur); cur = ''; }
      cur += ch;
      if (ch === '.' || ch === '/' || ch === '_') { parts.push(cur); cur = ''; }
    }
    if (cur) parts.push(cur);
    if (parts.length < 2) return;
    var frag = doc.createDocumentFragment();
    parts.forEach(function (s, k) {
      if (k) frag.appendChild(doc.createElement('wbr'));
      frag.appendChild(doc.createTextNode(s));
    });
    code.replaceChild(frag, code.firstChild);
  }
  Array.prototype.forEach.call(main.querySelectorAll('code'), breakable);

  // ---- Tables ---------------------------------------------------------------
  var wraps = Array.prototype.slice.call(main.querySelectorAll('.table-wrap'));
  wraps.forEach(function (wrap) {
    var table = wrap.querySelector('table');
    if (!table || !table.tHead || !table.tHead.rows.length) return;
    var labels = [];
    Array.prototype.forEach.call(table.tHead.rows[0].cells, function (c) {
      for (var k = 0; k < (c.colSpan || 1); k++) labels.push(c.textContent.replace(/\s+/g, ' ').trim());
    });
    if (labels.length < 2) return;
    wrap.classList.add('stacks');
    if (labels.length < 3) return; // two columns read fine without labels
    Array.prototype.forEach.call(table.tBodies, function (tb) {
      Array.prototype.forEach.call(tb.rows, function (tr) {
        var col = 0;
        Array.prototype.forEach.call(tr.cells, function (cell) {
          if (col > 0 && cell.tagName === 'TD' && labels[col] && !cell.hasAttribute('data-label')) cell.setAttribute('data-label', labels[col]);
          col += cell.colSpan || 1;
        });
      });
    });
  });

  // A pinned header row needs a frame that does not scroll sideways: only
  // tables that fit get one; the others keep scrolling inside their frame.
  function fitTables(list) {
    (list || wraps).forEach(function (w) {
      if (!w.getClientRects().length) return; // inside a closed collapsible
      w.classList.remove('is-fit');
      if (phone.matches && w.classList.contains('stacks')) return;
      if (w.scrollWidth <= w.clientWidth + 1) w.classList.add('is-fit');
    });
  }

  // ---- Progress, current section, back to top --------------------------------
  var bar = doc.createElement('div');
  bar.className = 'read-progress';
  bar.setAttribute('aria-hidden', 'true');
  doc.body.appendChild(bar);

  var toc = doc.querySelector('.toc');
  var links = [], targets = [];
  if (toc) {
    Array.prototype.forEach.call(toc.querySelectorAll('a[href^="#"]'), function (a) {
      var id;
      try { id = decodeURIComponent(a.getAttribute('href').slice(1)); } catch (e) { return; }
      var t = id && doc.getElementById(id);
      if (t) { links.push(a); targets.push(t); }
    });
  }
  var current = -1;

  function setCurrent(i) {
    if (i === current) return;
    if (current >= 0) {
      links[current].removeAttribute('aria-current');
      var old = toc.querySelector('a.is-parent');
      if (old) old.classList.remove('is-parent');
    }
    current = i;
    if (i < 0) return;
    var a = links[i];
    a.setAttribute('aria-current', 'location');
    var outer = a.parentNode && a.parentNode.parentNode && a.parentNode.parentNode.closest('li');
    if (outer && toc.contains(outer)) {
      var pa = outer.querySelector(':scope > a');
      if (pa && pa !== a) pa.classList.add('is-parent');
    }
    // keep the mark visible in a sidebar that scrolls on its own
    if (wide.matches && toc.scrollHeight > toc.clientHeight + 4) {
      var tr = toc.getBoundingClientRect(), ar = a.getBoundingClientRect();
      if (ar.top < tr.top + 40) toc.scrollTop -= (tr.top + 40 - ar.top);
      else if (ar.bottom > tr.bottom - 40) toc.scrollTop += (ar.bottom - tr.bottom + 40);
    }
  }

  function findCurrent() {
    var line = window.innerHeight * 0.3, best = -1, bestTop = -Infinity;
    for (var i = 0; i < targets.length; i++) {
      var r = targets[i].getBoundingClientRect();
      if (!r.width && !r.height) continue; // not rendered (closed collapsible)
      if (r.top <= line && r.top >= bestTop) { best = i; bestTop = r.top; }
    }
    var max = root.scrollHeight - window.innerHeight;
    if (max > 0 && window.scrollY >= max - 2) {
      // at the very end, the last section that shows on screen
      for (var j = targets.length - 1; j >= 0; j--) {
        var q = targets[j].getBoundingClientRect();
        if ((q.width || q.height) && q.top < window.innerHeight) { best = j; break; }
      }
    }
    return best;
  }

  var toTop = doc.querySelector('.to-top');
  if (!toTop) {
    toTop = doc.createElement('a');
    toTop.className = 'to-top';
    toTop.href = '#main';
    doc.body.appendChild(toTop);
  }
  var tocHref = toTop.getAttribute('href');
  function setTopMode() {
    // On a phone the table of contents sits at the top: go there. With the
    // sidebar, or with no table of contents, go back to the top.
    var toToc = toc && !wide.matches && tocHref === '#toc';
    toTop.textContent = toToc ? '↑ On this page' : '↑ Back to top';
    toTop.setAttribute('data-mode', toToc ? 'toc' : 'top');
  }
  toTop.addEventListener('click', function (e) {
    if (toTop.getAttribute('data-mode') !== 'top') return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduce.matches ? 'auto' : 'smooth' });
    // move focus to the top too, so the next Tab starts from there
    var focus = main.querySelector('h1:not(.sr-only), h2') || main;
    if (!focus.hasAttribute('tabindex')) focus.setAttribute('tabindex', '-1');
    try { focus.focus({ preventScroll: true }); } catch (err) { focus.focus(); }
  });

  var ticking = false;
  function update() {
    ticking = false;
    var max = root.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
    bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (targets.length) setCurrent(findCurrent());
    toTop.classList.toggle('is-away', window.scrollY < window.innerHeight * 0.8);
  }
  function schedule() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', schedule, { passive: true });
  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { setTopMode(); fitTables(); schedule(); }, 120);
  });
  // A collapsible opening changes the page length and may reveal tables.
  doc.addEventListener('toggle', function (e) {
    var d = e.target;
    if (d && d.tagName === 'DETAILS') {
      fitTables(wraps.filter(function (w) { return d.contains(w); }));
      schedule();
    }
  }, true);
  window.addEventListener('hashchange', schedule);

  setTopMode();
  fitTables();
  update();
})();
