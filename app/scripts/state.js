// Vice Trophy Atlas — saved progress.
// The reader's earned ticks, spoiler choice and filters live only in this
// browser's local storage. Export writes a JSON file the reader owns;
// Import reads one back. Nothing is ever sent anywhere.
const ATLAS_STORE_KEY = 'vice-trophy-atlas-v2';

export function atlasBlankState() {
  return { earned: [], spoiler: false, query: '', grade: 'all', kind: 'all', earnedFilter: 'all' };
}

export function atlasLoadState() {
  const fresh = atlasBlankState();
  try {
    const raw = localStorage.getItem(ATLAS_STORE_KEY);
    if (!raw) return fresh;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fresh;
    if (Array.isArray(parsed.earned)) fresh.earned = parsed.earned.filter((n) => Number.isInteger(n));
    if (typeof parsed.spoiler === 'boolean') fresh.spoiler = parsed.spoiler;
    if (typeof parsed.query === 'string') fresh.query = parsed.query;
    if (typeof parsed.grade === 'string') fresh.grade = parsed.grade;
    if (typeof parsed.kind === 'string') fresh.kind = parsed.kind;
    if (typeof parsed.earnedFilter === 'string') fresh.earnedFilter = parsed.earnedFilter;
  } catch {
    // A damaged save is ignored, never fatal.
  }
  return fresh;
}

export function atlasSaveState(state) {
  try {
    localStorage.setItem(ATLAS_STORE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or a full store: the page still works for this visit.
  }
}

export function atlasHasEarned(state, id) {
  return state.earned.includes(id);
}

export function atlasFlipEarned(state, id) {
  const at = state.earned.indexOf(id);
  if (at >= 0) state.earned.splice(at, 1);
  else state.earned.push(id);
  state.earned.sort((a, b) => a - b);
  atlasSaveState(state);
  return state;
}

export function atlasExportFile(state) {
  const payload = JSON.stringify({ app: 'vice-trophy-atlas', version: 2, exportedAt: new Date().toISOString(), earned: state.earned, spoiler: state.spoiler }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vice-trophy-atlas-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function atlasImportFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const earned = parsed && Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n)) : null;
  if (earned === null) throw new Error('That file has no earned list in it.');
  const next = atlasBlankState();
  next.earned = earned;
  if (typeof parsed.spoiler === 'boolean') next.spoiler = parsed.spoiler;
  atlasSaveState(next);
  return next;
}
