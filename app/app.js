// Leonida Trophy Guide: loads app/data/trophies.json, renders the 55-card checklist,
// saves progress in localStorage, and filters by search, kind, grade and earned state.
// No network requests besides the local data file; source links only open when clicked.
(function () {
  'use strict';

  var DATA_URL = 'data/trophies.json';
  var STORE_KEY = 'gta6-trophy-guide-01-progress-v1';
  var SPOILER_KEY = 'gta6-trophy-guide-01-spoiler-v1';

  var trophies = [];
  var sources = {};
  var earned = new Set();
  var spoilerOn = false;

  var listEl = document.getElementById('trophy-list');
  var searchEl = document.getElementById('search');
  var kindEl = document.getElementById('kind-filter');
  var gradeEl = document.getElementById('grade-filter');
  var earnedEl = document.getElementById('earned-filter');
  var spoilerEl = document.getElementById('spoiler-toggle');
  var summaryEl = document.getElementById('progress-summary');
  var platinumEl = document.getElementById('platinum-line');
  var totalBarEl = document.getElementById('total-bar');
  var gradeBarsEl = document.getElementById('grade-bars');
  var countLineEl = document.getElementById('count-line');
  var shownCountEl = document.getElementById('shown-count');
  var noResultsEl = document.getElementById('no-results');
  var onlineNoteEl = document.getElementById('online-note');
  var toolNoteEl = document.getElementById('tool-note');
  var importFileEl = document.getElementById('import-file');

  function loadStored() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) parsed.forEach(function (id) { earned.add(Number(id)); });
      }
    } catch (e) { /* corrupted progress is ignored and starts empty */ }
    try { spoilerOn = localStorage.getItem(SPOILER_KEY) === '1'; } catch (e) { spoilerOn = false; }
  }

  function saveStored() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(Array.from(earned).sort(function (a, b) { return a - b; }))); } catch (e) { /* storage may be unavailable */ }
    try { localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0'); } catch (e) { /* ignore */ }
  }

  function applyQueryParams() {
    var q = new URLSearchParams(window.location.search);
    if (q.get('search')) searchEl.value = q.get('search');
    if (q.get('kind')) kindEl.value = q.get('kind');
    if (q.get('grade')) gradeEl.value = q.get('grade');
    if (q.get('earned')) earnedEl.value = q.get('earned');
    if (q.get('spoiler') === '1') spoilerOn = true;
  }

  function isSpoilerHidden(t) {
    return spoilerOn && t.hidden && t.kind === 'story' && !earned.has(t.id);
  }

  function trophyMatches(t) {
    var q = searchEl.value.trim().toLowerCase();
    if (q) {
      var hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    var kind = kindEl.value;
    if (kind === 'missable') { if (!t.missable) return false; }
    else if (kind === 'online') { return false; }
    else if (kind !== 'all' && t.kind !== kind) { return false; }
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (earnedEl.value === 'earned' && !earned.has(t.id)) return false;
    if (earnedEl.value === 'unearned' && earned.has(t.id)) return false;
    return true;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function renderProgress() {
    var total = trophies.length;
    var done = earned.size;
    summaryEl.textContent = done + ' / ' + total + ' earned';
    platinumEl.textContent = done >= total
      ? 'Platinum earned — Vice Got a Price! is yours.'
      : 'Platinum needs ' + (total - done) + ' more troph' + (total - done === 1 ? 'y.' : 'ies.');
    totalBarEl.style.width = total ? Math.round((done / total) * 100) + '%' : '0%';
    gradeBarsEl.textContent = '';
    ['platinum', 'gold', 'silver', 'bronze'].forEach(function (grade) {
      var inGrade = trophies.filter(function (t) { return t.grade === grade; });
      var got = inGrade.filter(function (t) { return earned.has(t.id); }).length;
      var row = el('div', 'grade-row');
      row.appendChild(el('span', 'gname', grade));
      var mini = el('div', 'mini');
      var fill = el('div');
      fill.style.width = inGrade.length ? Math.round((got / inGrade.length) * 100) + '%' : '0%';
      mini.appendChild(fill);
      row.appendChild(mini);
      row.appendChild(el('span', 'gcount', got + '/' + inGrade.length));
      gradeBarsEl.appendChild(row);
    });
  }

  function renderList() {
    listEl.textContent = '';
    var shown = 0;
    trophies.forEach(function (t) {
      if (!trophyMatches(t)) return;
      shown += 1;
      var hidden = isSpoilerHidden(t);
      var card = el('article', 'trophy-card' + (earned.has(t.id) ? ' earned' : ''));
      card.dataset.id = String(t.id);
      card.dataset.grade = t.grade;
      card.dataset.kind = t.kind;

      var head = el('div', 'trophy-head');
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = earned.has(t.id);
      box.setAttribute('aria-label', 'Earned: ' + t.name);
      box.addEventListener('change', function () {
        // Ticking used to re-render the whole list, which collapsed any open
        // guide and jumped the scroll position. Now only the progress bar and
        // this card update, unless the card must appear, disappear or unmask:
        // an earned/unearned filter is active, or a spoiler-hidden card was
        // just earned and its real name has to show.
        var wasHidden = isSpoilerHidden(t);
        if (box.checked) earned.add(t.id); else earned.delete(t.id);
        saveStored();
        renderProgress();
        if (earnedEl.value !== 'all' || (wasHidden && box.checked)) renderList();
        else card.classList.toggle('earned', box.checked);
      });
      head.appendChild(box);
      var textWrap = el('div');
      var nameEl = el('h3', 'trophy-name' + (hidden ? ' spoiler-hidden' : ''), hidden ? 'Hidden story trophy' : t.name);
      textWrap.appendChild(nameEl);
      textWrap.appendChild(el('p', 'trophy-desc' + (hidden ? ' spoiler-hidden' : ''),
        hidden ? 'Hidden until earned — finish the story to reveal it.' : t.description));
      head.appendChild(textWrap);
      card.appendChild(head);

      var badges = el('div', 'badges');
      badges.appendChild(el('span', 'badge ' + t.grade, t.grade));
      if (t.hidden) badges.appendChild(el('span', 'badge hidden-badge', 'Hidden'));
      if (t.countLabel) badges.appendChild(el('span', 'badge count-badge', t.countLabel));
      if (t.missable) badges.appendChild(el('span', 'badge missable-badge', '⚠ Possibly missable'));
      if (t.status === 'unconfirmed') badges.appendChild(el('span', 'badge unconfirmed-badge', 'Unconfirmed'));
      if (t.status === 'reported') badges.appendChild(el('span', 'badge reported-badge', 'Reported, not fully confirmed'));
      card.appendChild(badges);

      if (hidden) {
        card.appendChild(el('p', 'guide-text spoiler-hidden', 'Guide hidden until you earn this trophy.'));
      } else {
        var details = document.createElement('details');
        var summary = document.createElement('summary');
        var toggle = el('button', 'guide-toggle', 'Read the guide');
        toggle.type = 'button';
        toggle.addEventListener('click', function (ev) {
          ev.preventDefault();
          details.open = !details.open;
          toggle.textContent = details.open ? 'Hide the guide' : 'Read the guide';
        });
        summary.appendChild(toggle);
        details.appendChild(summary);
        details.appendChild(el('p', 'guide-text', t.guide));
        var src = el('p', 'sources', 'Sources: ');
        t.sources.forEach(function (name, i) {
          if (i > 0) src.appendChild(document.createTextNode(' · '));
          var a = document.createElement('a');
          a.href = sources[name] || '#';
          a.textContent = name;
          a.target = '_blank';
          a.rel = 'noopener';
          src.appendChild(a);
        });
        details.appendChild(src);
        card.appendChild(details);
      }
      listEl.appendChild(card);
    });
    shownCountEl.textContent = String(shown);
    noResultsEl.hidden = shown !== 0;
    onlineNoteEl.hidden = kindEl.value !== 'online';
    var total = trophies.length;
    countLineEl.textContent = shown === total
      ? 'Showing all ' + total + ' trophies.'
      : 'Showing ' + shown + ' of ' + total + ' trophies.';
  }

  function renderAll() {
    renderProgress();
    renderList();
  }

  function exportProgress() {
    var payload = {
      game: 'Grand Theft Auto VI',
      guide: 'gta6-trophy-guide-01',
      earned: Array.from(earned).sort(function (a, b) { return a - b; }),
      exportedAt: new Date().toISOString()
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'gta6-trophy-progress.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toolNoteEl.textContent = 'Exported ' + earned.size + ' earned trophies.';
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result));
        var ids = Array.isArray(parsed) ? parsed : parsed.earned;
        if (!Array.isArray(ids)) throw new Error('bad file');
        var valid = new Set(trophies.map(function (t) { return t.id; }));
        var next = new Set();
        ids.forEach(function (id) { var n = Number(id); if (valid.has(n)) next.add(n); });
        earned = next;
        saveStored();
        renderAll();
        toolNoteEl.textContent = 'Imported ' + earned.size + ' earned trophies.';
      } catch (e) {
        toolNoteEl.textContent = 'That file could not be imported — it is not a progress file from this guide.';
      }
    };
    reader.readAsText(file);
  }

  document.getElementById('export-btn').addEventListener('click', exportProgress);
  document.getElementById('import-btn').addEventListener('click', function () { importFileEl.click(); });
  importFileEl.addEventListener('change', function () {
    if (importFileEl.files && importFileEl.files[0]) importProgress(importFileEl.files[0]);
    importFileEl.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', function () {
    if (window.confirm('Reset all progress? This clears every ticked trophy.')) {
      earned = new Set();
      saveStored();
      renderAll();
      toolNoteEl.textContent = 'Progress reset.';
    }
  });
  [searchEl, kindEl, gradeEl, earnedEl].forEach(function (input) {
    input.addEventListener('input', renderList);
    input.addEventListener('change', renderList);
  });
  spoilerEl.addEventListener('change', function () {
    spoilerOn = spoilerEl.checked;
    saveStored();
    renderList();
  });

  loadStored();
  applyQueryParams();
  spoilerEl.checked = spoilerOn;
  fetch(DATA_URL)
    .then(function (r) { if (!r.ok) throw new Error('could not load trophy data'); return r.json(); })
    .then(function (data) {
      trophies = data.trophies || [];
      sources = data.sources || {};
      renderAll();
    })
    .catch(function () {
      listEl.textContent = '';
      listEl.appendChild(el('p', 'hint', 'Could not load the trophy list. Check that app/data/trophies.json is present and reload.'));
    });
})();
