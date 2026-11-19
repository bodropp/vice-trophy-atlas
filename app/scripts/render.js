// Vice Trophy Atlas — painting the checklist, the detail pane, the roadmap
// and the missables page from the trophy data and the saved state.
// The spoiler rule lives here: with spoilers hidden, a story trophy the
// reader has not earned yet shows only its grade, never its name or words.
import { atlasHasEarned } from './state.js';

export const ATLAS_STAGES = [
  { n: 1, title: 'Play the story', body: 'Chapters 1 to 4, the named story missions and the finale. Story trophies come in order as you play — nothing here needs a guide, only the missions themselves.', kinds: ['story'] },
  { n: 2, title: 'Strangers & side beats', body: 'The eight stranger strands (Andy, Kenton, Billy, Randy, Tyrone and three more across Leonida) and the quiet story moments — the cocktail on Ocean Beach, the bowling alley, the choices. Do the six flagged missables the moment the story offers them.', kinds: ['side'] },
  { n: 3, title: 'Activities & challenges', body: 'Stunts, races, drone races, fishing, the arcade, meditation and the 50-challenge list. Fold these into free-roam between story beats.', kinds: ['activity'] },
  { n: 4, title: 'Combat & the wanted level', body: 'Shooting Range golds, Combat Focus, the partner wanted escapes, the robberies and the gang operations. Bring a fast getaway car and a plan.', kinds: ['combat'] },
  { n: 5, title: 'Explore & collect', body: 'All of Leonida, the card sets, the WAiNK spots and the 100 vehicles. The map is your checklist here — fill in the blank patches.', kinds: ['collectible', 'exploration'] },
  { n: 6, title: 'Money & property', body: 'Launder the Marked Bills, spend across the shops, buy the garages and register vehicles. Money comes from the jobs above, so this stage mostly spends what the earlier stages earned.', kinds: ['money'] },
  { n: 7, title: '100% completion', body: 'Open the in-game stats screen and clear whatever it still counts — missions, strands, activities, collectibles. When this gold pops, only the platinum is left.', kinds: ['completion'] },
  { n: 8, title: 'The platinum', body: 'Vice Got a Price! pops the moment the other 54 are earned. Nothing extra to do — enjoy the credits.', kinds: ['platinum'] },
];

function atlasGradeWord(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function atlasKindWord(kind) {
  const words = { story: 'Story', side: 'Strangers & side', activity: 'Activity', collectible: 'Collectible', combat: 'Combat & wanted', money: 'Money', exploration: 'Exploration', completion: '100% completion', platinum: 'Platinum' };
  return words[kind] || kind;
}

function atlasSpoilerHidden(trophy, state) {
  return state.spoiler && trophy.kind === 'story' && !atlasHasEarned(state, trophy.id);
}

function atlasMatches(trophy, state) {
  if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
  if (state.kind !== 'all' && trophy.kind !== state.kind) return false;
  if (state.earnedFilter === 'todo' && atlasHasEarned(state, trophy.id)) return false;
  if (state.earnedFilter === 'done' && !atlasHasEarned(state, trophy.id)) return false;
  if (state.earnedFilter === 'missable' && !trophy.missable) return false;
  const q = state.query.trim().toLowerCase();
  if (q) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function atlasVisibleTrophies(trophies, state) {
  return trophies.filter((t) => atlasMatches(t, state));
}

export function atlasPaintProgress(trophies, state, nodes) {
  const earned = trophies.filter((t) => atlasHasEarned(state, t.id));
  const byGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of earned) byGrade[t.grade] += 1;
  nodes.count.textContent = `${earned.length} / ${trophies.length}`;
  nodes.counts.textContent = `${byGrade.platinum} platinum · ${byGrade.gold} gold · ${byGrade.silver} silver · ${byGrade.bronze} bronze`;
  nodes.barfill.style.width = `${Math.round((earned.length / trophies.length) * 100)}%`;
}

export function atlasPaintList(trophies, state, listEl, showingEl, onPick, selectedId) {
  const visible = atlasVisibleTrophies(trophies, state);
  showingEl.textContent = `Showing ${visible.length} of ${trophies.length} trophies — ${state.earned.length} earned.`;
  listEl.innerHTML = '';
  for (const trophy of visible) {
    const hidden = atlasSpoilerHidden(trophy, state);
    const li = document.createElement('li');
    li.className = 'atlas-row' + (atlasHasEarned(state, trophy.id) ? ' atlas-row-earned' : '') + (trophy.id === selectedId ? ' atlas-row-on' : '');
    const tick = document.createElement('input');
    tick.type = 'checkbox';
    tick.checked = atlasHasEarned(state, trophy.id);
    tick.setAttribute('aria-label', `Earned: ${hidden ? 'hidden story trophy' : trophy.name}`);
    tick.addEventListener('click', (ev) => ev.stopPropagation());
    const body = document.createElement('div');
    const name = document.createElement('h3');
    name.textContent = hidden ? 'Hidden story trophy — earn it to reveal' : trophy.name;
    if (hidden) name.classList.add('atlas-hidden');
    const desc = document.createElement('p');
    desc.textContent = hidden ? 'Spoilers are hidden until this trophy is earned.' : trophy.description;
    body.append(name, desc);
    const meta = document.createElement('div');
    const badge = document.createElement('span');
    badge.className = `atlas-badge atlas-badge-${trophy.grade}`;
    badge.textContent = atlasGradeWord(trophy.grade);
    meta.append(badge);
    const kind = document.createElement('span');
    kind.className = 'atlas-kind';
    kind.textContent = atlasKindWord(trophy.kind);
    meta.append(document.createElement('br'), kind);
    if (trophy.missable) {
      const flag = document.createElement('span');
      flag.className = 'atlas-flag';
      flag.textContent = '⚠ Missable';
      meta.append(document.createElement('br'), flag);
    }
    li.append(tick, body, meta);
    li.addEventListener('click', () => onPick(trophy.id));
    tick.addEventListener('change', () => onPick(trophy.id, { toggleOnly: true }));
    listEl.append(li);
  }
}

export function atlasPaintDetail(trophy, state, detailEl) {
  if (!trophy) {
    detailEl.innerHTML = '<p class="atlas-detail-empty">Pick a trophy on the left to read its full guide, its sources and whether it can be missed.</p>';
    return;
  }
  const hidden = atlasSpoilerHidden(trophy, state);
  detailEl.innerHTML = '';
  const title = document.createElement('h2');
  title.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  const badge = document.createElement('span');
  badge.className = `atlas-badge atlas-badge-${trophy.grade}`;
  badge.textContent = atlasGradeWord(trophy.grade);
  const official = document.createElement('p');
  official.className = 'atlas-official';
  official.textContent = hidden ? 'Spoilers are hidden until this trophy is earned.' : `“${trophy.description}” — the official description.`;
  const guideHead = document.createElement('h4');
  guideHead.textContent = 'How to get it';
  const guide = document.createElement('p');
  guide.textContent = hidden ? 'Earn this trophy to reveal its guide.' : trophy.guide;
  const missHead = document.createElement('h4');
  missHead.textContent = 'Can it be missed?';
  const miss = document.createElement('p');
  miss.textContent = hidden
    ? 'Hidden for now.'
    : trophy.missable
      ? 'Possibly missable — it reads like a one-time story beat. Do it the moment the story offers it; if it does not pop, replay the mission from the pause menu.'
      : 'No — story missions are replayable in past GTA games, and repeatable activities can always be tried again. Our read, unconfirmed in this game.';
  const sourceHead = document.createElement('h4');
  sourceHead.textContent = 'Sources';
  const source = document.createElement('p');
  source.className = 'atlas-source';
  source.textContent = trophy.source;
  detailEl.append(title, badge, official, guideHead, guide, missHead, miss, sourceHead, source);
}

export function atlasPaintRoadmap(trophies, state, stagesEl) {
  stagesEl.innerHTML = '';
  for (const stage of ATLAS_STAGES) {
    const li = document.createElement('li');
    const head = document.createElement('h3');
    head.textContent = `Stage ${stage.n} — ${stage.title}`;
    const body = document.createElement('p');
    body.textContent = stage.body;
    const names = document.createElement('ul');
    for (const trophy of trophies.filter((t) => t.stage === stage.n)) {
      const item = document.createElement('li');
      const hidden = atlasSpoilerHidden(trophy, state);
      item.textContent = hidden ? `Hidden story trophy (${atlasGradeWord(trophy.grade)})` : `${trophy.name} — ${atlasGradeWord(trophy.grade)}${trophy.missable ? ' · ⚠ missable' : ''}${atlasHasEarned(state, trophy.id) ? ' · ✓ earned' : ''}`;
      names.append(item);
    }
    li.append(head, body, names);
    stagesEl.append(li);
  }
}

export function atlasPaintMissables(trophies, state, listEl) {
  listEl.innerHTML = '';
  for (const trophy of trophies.filter((t) => t.missable)) {
    const li = document.createElement('li');
    li.className = 'atlas-row';
    const name = document.createElement('h3');
    name.textContent = trophy.name;
    const desc = document.createElement('p');
    desc.textContent = trophy.guide;
    const body = document.createElement('div');
    body.append(name, desc);
    const badge = document.createElement('span');
    badge.className = `atlas-badge atlas-badge-${trophy.grade}`;
    badge.textContent = atlasGradeWord(trophy.grade);
    li.append(document.createElement('span'), body, badge);
    listEl.append(li);
  }
}
