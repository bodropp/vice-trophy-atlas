// Vice Trophy Atlas — offline checklist + guide for GTA VI's 55 PS5 trophies.
// Progress and the spoiler setting live in localStorage; nothing is fetched
// from the network (the only fetch is the local data/trophies.json).
const EARNED_KEY = 'vice-trophy-atlas-earned';
const SPOILER_KEY = 'vice-trophy-atlas-spoiler';

window.__pageErrors = [];
window.addEventListener('error', (e) => window.__pageErrors.push(String(e.message)));

const KIND_LABEL = {
  story: 'Story', side: 'Stranger strands', activity: 'Activities',
  collectible: 'Collectibles', combat: 'Combat & robberies', money: 'Money',
  misc: 'Misc', completion: '100% completion', platinum: 'Platinum',
};
const STAGE_LABEL = {
  1: 'Stage 1 — Story', 2: 'Stage 2 — Stranger strands', 3: 'Stage 3 — Activities',
  4: 'Stage 4 — Collectibles', 5: 'Stage 5 — Combat & robberies',
  6: 'Stage 6 — Money & misc', 7: 'Stage 7 — Cleanup',
};

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

let earned = new Set(JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]'));
let spoiler = localStorage.getItem(SPOILER_KEY) === '1';
let selectedId = trophies[0].id;

const rowsEl = document.getElementById('rows');
const detailEl = document.getElementById('detail');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const kindEl = document.getElementById('kind');
const missableEl = document.getElementById('missable-only');
const earnedOnlyEl = document.getElementById('earned-only');
const unearnedOnlyEl = document.getElementById('unearned-only');
const spoilerEl = document.getElementById('spoiler');

spoilerEl.checked = spoiler;

function save() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
}

function hiddenBySpoiler(t) {
  return spoiler && t.kind === 'story' && !earned.has(t.id);
}

function visible() {
  const q = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
    if (missableEl.checked && t.missable !== 'watch') return false;
    if (earnedOnlyEl.checked && !earned.has(t.id)) return false;
    if (unearnedOnlyEl.checked && earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function render() {
  const list = visible();
  document.getElementById('list-heading').textContent = `Checklist — ${list.length} of 55 trophies`;
  document.getElementById('progress').textContent = `${earned.size} of 55 earned`;
  document.getElementById('progress-fill').style.width = `${(earned.size / 55) * 100}%`;

  rowsEl.replaceChildren();
  if (!list.length) {
    rowsEl.append(el('p', 'empty', 'No trophies match these filters.'));
  }
  for (const t of list) {
    const hidden = hiddenBySpoiler(t);
    const card = el('article', 'trophy' + (earned.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : ''));
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('click', (e) => e.stopPropagation());
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id); else earned.delete(t.id);
      save(); render();
    });
    card.append(box);
    const body = el('div');
    body.append(el('div', 't-name', hidden ? '??? — story trophy' : t.name));
    body.append(el('div', 't-desc', hidden ? 'Hidden by the spoiler setting — earn it to reveal the name and description.' : t.description));
    const meta = el('div', 't-meta');
    meta.append(el('span', `badge ${t.grade}`, t.grade));
    if (t.kind !== 'platinum') meta.append(el('span', 'tag', KIND_LABEL[t.kind]));
    if (t.missable === 'watch') meta.append(el('span', 'tag watch', 'Watch: story beat'));
    if (earned.has(t.id)) meta.append(el('span', 'tag earned-tag', 'Earned'));
    body.append(meta);
    if (!hidden) body.append(el('div', 't-guide', t.guide));
    card.append(body);
    const num = el('div', 't-num', `#${t.id}`);
    num.style.cssText = 'font-weight:700;color:var(--muted);font-size:13px;text-align:right';
    card.append(num);
    card.addEventListener('click', () => { selectedId = t.id; render(); });
    rowsEl.append(card);
  }

  const t = trophies.find((x) => x.id === selectedId) ?? trophies[0];
  const hidden = hiddenBySpoiler(t);
  detailEl.replaceChildren();
  detailEl.append(el('h2', null, hidden ? '??? — story trophy' : t.name));
  detailEl.append(el('p', 'd-desc', hidden ? 'Hidden by the spoiler setting.' : t.description));
  const meta = el('div', 'd-meta');
  meta.append(el('span', `badge ${t.grade}`, t.grade));
  if (t.kind !== 'platinum') meta.append(el('span', 'tag', KIND_LABEL[t.kind]));
  meta.append(el('span', 'tag', STAGE_LABEL[t.stage]));
  if (t.missable === 'watch') meta.append(el('span', 'tag watch', 'Watch-list: story beat — replayable'));
  if (earned.has(t.id)) meta.append(el('span', 'tag earned-tag', 'Earned'));
  detailEl.append(meta);
  detailEl.append(el('h3', null, 'Guide'));
  detailEl.append(el('p', null, hidden ? 'Earn this trophy to reveal its guide.' : t.guide));
  detailEl.append(el('h3', null, 'Sources'));
  detailEl.append(el('p', 'd-source', hidden ? '—' : t.source + '.'));
  const actions = el('div', 'd-actions');
  const toggle = el('button', null, earned.has(t.id) ? 'Mark as not earned' : 'Mark as earned');
  toggle.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id); else earned.add(t.id);
    save(); render();
  });
  actions.append(toggle);
  detailEl.append(actions);
}

// Export / import / reset.
document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ app: 'vice-trophy-atlas', exportedAt: new Date().toISOString(), earned: [...earned].sort((x, y) => x - y) }, null, 2)], { type: 'application/json' }));
  a.download = 'vice-trophy-atlas-progress.json';
  a.click();
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = new Set(trophies.map((t) => t.id));
    earned = new Set(ids.filter((id) => valid.has(id)));
    save(); render();
  } catch { /* bad file: leave progress unchanged */ }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned ticks?')) { earned = new Set(); save(); render(); }
});

for (const input of [searchEl, gradeEl, kindEl, missableEl, earnedOnlyEl, unearnedOnlyEl]) {
  input.addEventListener('input', render);
  input.addEventListener('change', render);
}
spoilerEl.addEventListener('change', () => { spoiler = spoilerEl.checked; save(); render(); });

render();

// Deterministic screenshot scenes (?shot=cover|roadmap|detail|spoiler).
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot === 'cover') {
  earned = new Set([2, 3, 8, 16, 21]);
  spoiler = false;
  spoilerEl.checked = false;
  selectedId = 17;
  save(); render();
} else if (shot === 'detail') {
  earned = new Set([2, 3, 8, 16, 21]);
  spoiler = false;
  spoilerEl.checked = false;
  selectedId = 21;
  save(); render();
} else if (shot === 'spoiler') {
  earned = new Set([16, 21]);
  spoiler = true;
  spoilerEl.checked = true;
  selectedId = 30;
  save(); render();
}
if (shot === 'roadmap') {
  earned = new Set([2, 3, 8, 16, 21]);
  spoiler = false;
  spoilerEl.checked = false;
  save(); render();
  document.getElementById('roadmap').open = true;
  document.getElementById('roadmap').scrollIntoView();
}
window.__shotReady = true;
