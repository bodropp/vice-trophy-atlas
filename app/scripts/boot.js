// Vice Trophy Atlas — boot: load the data, wire the controls, paint the page.
// Deterministic scenes for screenshots live behind ?shot=:
//   cover    — checklist with 13 earned and the Shootist detail open
//   roadmap  — the roadmap tab, 13 earned
//   detail   — the Hot Together detail open, guide and sources visible
//   spoiler  — spoiler setting on, story trophies hidden
// A scene sets its state in memory only; the reader's saved progress is
// never overwritten by a screenshot scene.
import { atlasLoadState, atlasSaveState, atlasFlipEarned, atlasExportFile, atlasImportFile } from './state.js';
import { atlasPaintProgress, atlasPaintList, atlasPaintDetail, atlasPaintRoadmap, atlasPaintMissables } from './render.js';

const $ = (id) => document.getElementById(id);
const nodes = {
  count: $('atlas-count'),
  counts: $('atlas-counts'),
  barfill: $('atlas-barfill'),
  list: $('atlas-list'),
  showing: $('atlas-showing'),
  detail: $('atlas-detail'),
  stages: $('atlas-stages'),
  missablesList: $('atlas-missables-list'),
};

let trophies = [];
let state = atlasLoadState();
let selectedId = null;

function atlasShowTab(tab) {
  for (const btn of document.querySelectorAll('[data-atlas-tab]')) {
    btn.classList.toggle('atlas-tab-on', btn.dataset.atlasTab === tab);
  }
  $('atlas-panel-checklist').hidden = tab !== 'checklist';
  $('atlas-panel-roadmap').hidden = tab !== 'roadmap';
  $('atlas-panel-missables').hidden = tab !== 'missables';
  $('atlas-panel-about').hidden = tab !== 'about';
  document.querySelector('.atlas-toolbar').style.display = tab === 'checklist' ? '' : 'none';
  document.querySelector('.atlas-layout').style.gridTemplateColumns = tab === 'checklist' ? '' : '1fr';
  nodes.detail.style.display = tab === 'checklist' ? '' : 'none';
}

function atlasRepaint() {
  atlasPaintProgress(trophies, state, nodes);
  atlasPaintList(trophies, state, nodes.list, nodes.showing, atlasPick, selectedId);
  atlasPaintDetail(trophies.find((t) => t.id === selectedId) || null, state, nodes.detail);
  atlasPaintRoadmap(trophies, state, nodes.stages);
  atlasPaintMissables(trophies, state, nodes.missablesList);
}

function atlasPick(id, opts = {}) {
  if (opts.toggleOnly) {
    atlasFlipEarned(state, id);
    atlasRepaint();
    return;
  }
  selectedId = id;
  atlasRepaint();
}

function atlasSeedEarned(ids) {
  state.earned = [...ids];
}

async function atlasBoot() {
  const res = await fetch('data/trophies.json');
  const data = await res.json();
  trophies = data.trophies || data;
  trophies.sort((a, b) => a.id - b.id);

  $('atlas-query').value = state.query;
  $('atlas-grade').value = state.grade;
  $('atlas-kind').value = state.kind;
  $('atlas-earned').value = state.earnedFilter;
  $('atlas-spoiler').checked = state.spoiler;

  document.querySelectorAll('[data-atlas-tab]').forEach((btn) => {
    btn.addEventListener('click', () => atlasShowTab(btn.dataset.atlasTab));
  });
  $('atlas-query').addEventListener('input', (ev) => { state.query = ev.target.value; atlasSaveState(state); atlasRepaint(); });
  $('atlas-grade').addEventListener('change', (ev) => { state.grade = ev.target.value; atlasSaveState(state); atlasRepaint(); });
  $('atlas-kind').addEventListener('change', (ev) => { state.kind = ev.target.value; atlasSaveState(state); atlasRepaint(); });
  $('atlas-earned').addEventListener('change', (ev) => { state.earnedFilter = ev.target.value; atlasSaveState(state); atlasRepaint(); });
  $('atlas-spoiler').addEventListener('change', (ev) => { state.spoiler = ev.target.checked; atlasSaveState(state); atlasRepaint(); });
  $('atlas-export').addEventListener('click', () => atlasExportFile(state));
  $('atlas-import').addEventListener('change', async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    try {
      state = await atlasImportFile(file);
      selectedId = null;
      $('atlas-spoiler').checked = state.spoiler;
      atlasRepaint();
    } catch (err) {
      alert(`Could not import that file: ${err.message}`);
    }
    ev.target.value = '';
  });
  $('atlas-reset').addEventListener('click', () => {
    if (!confirm('Clear all earned ticks in this browser?')) return;
    state.earned = [];
    atlasSaveState(state);
    atlasRepaint();
  });
  // Keyboard: Escape clears the open detail pane without touching ticks.
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && selectedId !== null) {
      selectedId = null;
      atlasRepaint();
    }
  });

  // Screenshot scenes: deterministic, in memory only. Every scene resets
  // the filters and the spoiler switch first, so a leftover saved state
  // from an earlier visit can never leak into a screenshot.
  const shot = new URLSearchParams(location.search).get('shot');
  const atlasSceneBase = () => {
    state.query = '';
    state.grade = 'all';
    state.kind = 'all';
    state.earnedFilter = 'all';
    state.spoiler = false;
    $('atlas-query').value = '';
    $('atlas-grade').value = 'all';
    $('atlas-kind').value = 'all';
    $('atlas-earned').value = 'all';
    $('atlas-spoiler').checked = false;
    atlasSeedEarned([2, 3, 4, 5, 6, 8, 9, 10, 15, 16, 21, 35, 42]);
  };
  if (shot === 'cover') {
    atlasSceneBase();
    selectedId = 17;
    atlasShowTab('checklist');
  } else if (shot === 'roadmap') {
    atlasSceneBase();
    atlasShowTab('roadmap');
  } else if (shot === 'detail') {
    atlasSceneBase();
    selectedId = 33;
    atlasShowTab('checklist');
  } else if (shot === 'spoiler') {
    atlasSceneBase();
    // Seed only non-story trophies, so the hidden story rows are visible
    // at the top of the list and the spoiler setting shows its effect.
    atlasSeedEarned([15, 21, 35, 42]);
    state.spoiler = true;
    $('atlas-spoiler').checked = true;
    atlasShowTab('checklist');
  }
  atlasRepaint();
  window.__shotReady = true;
}

atlasBoot().catch((err) => {
  nodes.detail.innerHTML = `<p>Could not load the trophy list: ${err.message}</p>`;
  window.__shotReady = true;
});
