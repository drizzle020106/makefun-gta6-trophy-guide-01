// Leonida Trophy Guide & Tracker: checklist saved in localStorage, with search,
// kind/grade/earned filters, a spoiler switch, and export/import of progress.
// It loads only its own data file (data/trophies.json) and makes no other request.
const KEY = 'gta6-trophy-guide-progress-v1';
const SPOILER_KEY = 'gta6-trophy-guide-spoilers-v1';
const listEl = document.getElementById('list');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const earnedFilterEl = document.getElementById('earned-filter');
const spoilerEl = document.getElementById('spoiler');
const progressTextEl = document.getElementById('progress-text');
const progressFillEl = document.getElementById('progress-fill');
const platinumLeftEl = document.getElementById('platinum-left');
const gradeBarsEl = document.getElementById('grade-bars');
const resultCountEl = document.getElementById('result-count');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

let earned = new Set(loadStoredEarned());
let hideSpoilers = localStorage.getItem(SPOILER_KEY) === '1';
spoilerEl.checked = hideSpoilers;

function loadStoredEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((n) => typeof n === 'string') : [];
  } catch {
    return [];
  }
}

function saveEarned() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

function isStorySpoiler(trophy) {
  return trophy.hidden && trophy.kind === 'story';
}

function trophyMatches(trophy) {
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(trophy.name.toLowerCase().includes(q) || trophy.description.toLowerCase().includes(q) || trophy.guide.toLowerCase().includes(q))) return false;
  if (kindEl.value === 'missable') {
    if (!trophy.missable) return false;
  } else if (kindEl.value === 'online') {
    return false;
  } else if (kindEl.value !== 'all' && trophy.kind !== kindEl.value) {
    return false;
  }
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  const has = earned.has(trophy.name);
  if (earnedFilterEl.value === 'earned' && !has) return false;
  if (earnedFilterEl.value === 'unearned' && has) return false;
  return true;
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  progressTextEl.textContent = `${done} / ${total} earned`;
  progressFillEl.style.width = `${total ? (done / total) * 100 : 0}%`;
  const remaining = trophies.filter((t) => t.grade !== 'platinum' && !earned.has(t.name)).length;
  platinumLeftEl.textContent = remaining === 0
    ? 'Platinum earned — Vice Got a Price! is yours.'
    : `Platinum needs ${remaining} more ${remaining === 1 ? 'trophy' : 'trophies'}.`;
  gradeBarsEl.replaceChildren();
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const group = trophies.filter((t) => t.grade === grade);
    const got = group.filter((t) => earned.has(t.name)).length;
    const row = document.createElement('div');
    row.className = 'grade-row';
    const label = document.createElement('span');
    label.textContent = grade[0].toUpperCase() + grade.slice(1);
    const bar = document.createElement('div');
    bar.className = 'bar';
    const fill = document.createElement('div');
    fill.style.width = `${group.length ? (got / group.length) * 100 : 0}%`;
    bar.append(fill);
    const count = document.createElement('span');
    count.textContent = `${got}/${group.length}`;
    row.append(label, bar, count);
    gradeBarsEl.append(row);
  }
}

function renderList() {
  listEl.replaceChildren();
  const shown = trophies.filter(trophyMatches);
  for (const trophy of shown) {
    const has = earned.has(trophy.name);
    const card = document.createElement('article');
    card.className = 'card' + (has ? ' earned' : '');
    card.dataset.name = trophy.name;

    const head = document.createElement('div');
    head.className = 'card-head';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = has;
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(trophy.name);
      else earned.delete(trophy.name);
      saveEarned();
      renderProgress();
      renderList();
    });
    const title = document.createElement('h3');
    const spoilerHidden = hideSpoilers && isStorySpoiler(trophy) && !has;
    title.textContent = spoilerHidden ? 'Hidden story trophy' : trophy.name;
    if (spoilerHidden) title.classList.add('spoiler-hidden');
    head.append(box, title);
    card.append(head);

    const badges = document.createElement('div');
    badges.className = 'badges';
    const gradeBadge = document.createElement('span');
    gradeBadge.className = `badge ${trophy.grade}`;
    gradeBadge.textContent = trophy.grade;
    badges.append(gradeBadge);
    if (trophy.hidden) {
      const b = document.createElement('span');
      b.className = 'badge hidden';
      b.textContent = 'Hidden';
      badges.append(b);
    }
    if (trophy.missable) {
      const b = document.createElement('span');
      b.className = 'badge missable';
      b.textContent = '⚠ Missable';
      badges.append(b);
    }
    if (trophy.count) {
      const b = document.createElement('span');
      b.className = 'badge count';
      b.textContent = `Count: ${trophy.count}`;
      badges.append(b);
    }
    const kindBadge = document.createElement('span');
    kindBadge.className = 'badge';
    kindBadge.textContent = trophy.kind;
    badges.append(kindBadge);
    card.append(badges);

    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = spoilerHidden ? 'Story trophy — its name and description stay hidden until you earn it.' : trophy.description;
    card.append(desc);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'guide-toggle';
    toggle.textContent = 'Show guide';
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.hidden = true;
    guide.textContent = trophy.guide;
    toggle.addEventListener('click', () => {
      guide.hidden = !guide.hidden;
      toggle.textContent = guide.hidden ? 'Show guide' : 'Hide guide';
    });
    card.append(toggle, guide);

    const sources = document.createElement('p');
    sources.className = 'sources';
    sources.textContent = 'Sources: ';
    trophy.sources.forEach((source, i) => {
      if (i > 0) sources.append(document.createTextNode(' · '));
      const a = document.createElement('a');
      a.href = source.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = source.name;
      sources.append(a);
    });
    card.append(sources);
    listEl.append(card);
  }
  resultCountEl.textContent = shown.length === trophies.length
    ? `Showing all ${trophies.length} trophies.`
    : `Showing ${shown.length} of ${trophies.length} trophies.`;
}

function render() {
  renderProgress();
  renderList();
}

document.getElementById('export').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned] };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('bad file');
    const known = new Set(trophies.map((t) => t.name));
    earned = new Set(names.filter((n) => typeof n === 'string' && known.has(n)));
    saveEarned();
    render();
  } catch {
    alert('That file is not a valid trophy-progress export.');
  }
  event.target.value = '';
});

document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    saveEarned();
    render();
  }
});

spoilerEl.addEventListener('change', () => {
  hideSpoilers = spoilerEl.checked;
  localStorage.setItem(SPOILER_KEY, hideSpoilers ? '1' : '0');
  renderList();
});
for (const el of [searchEl, kindEl, gradeEl, earnedFilterEl]) {
  el.addEventListener('input', renderList);
  el.addEventListener('change', renderList);
}

render();
