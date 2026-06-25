const preachingList = document.getElementById('preachingList');
const preachingSearch = document.getElementById('preachingSearch');
const preachingSuggestions = document.getElementById('preachingSuggestions');

const GOOGLE_SHEET_WEB_APP_URL = '';
const SHEET_CACHE_KEY = 'prophetSchoolPreachingPageData';
const dataVersion = '20260610-preaching-page';

let preachingTeamsCache = [];
const demoPreachingRows = [
  {
    TeamName: 'Demo Team A',
    Driver: 'Alex Morgan',
    Member1: 'Grace Lee',
    Member2: 'Daniel Kim',
    Member3: 'Sarah Chen',
    Car: 'White minivan',
    Location1: 'Downtown Plaza',
    Location2: 'Main Street Market',
    Active: 'TRUE'
  },
  {
    TeamName: 'Demo Team B',
    Driver: 'Taylor Brooks',
    Member1: 'Daniel Rivera',
    Member2: 'Maya Patel',
    Member3: 'Jordan Smith',
    Car: 'Blue sedan',
    Location1: 'Central Park Entrance',
    Location2: 'Community Library',
    Active: 'TRUE'
  }
];

const storage = {
  get(key) {
    try {
      return window.localStorage?.getItem(key);
    } catch (error) {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage?.setItem(key, value);
    } catch (error) {
      // The page should still work if storage is blocked.
    }
  }
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
}[char]));

const isActiveRow = (value) => String(value || '').trim().toLowerCase() === 'true';

const normalizeName = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const nameMatchesQuery = (name, query) => {
  const normalizedName = normalizeName(name);
  const normalizedQuery = normalizeName(query);
  if (!normalizedName || !normalizedQuery) return false;
  return normalizedName.startsWith(normalizedQuery)
    || normalizedQuery.split(' ').every((part) => normalizedName.includes(part));
};

const getPreachingMembers = (team) => [team.Member1, team.Member2, team.Member3].filter(Boolean);

const getPreachingLocations = (team) => [team.Location1, team.Location2].filter(Boolean);

const getPreachingSearchRows = (teams) => teams.flatMap((team) => [
  { name: team.Driver, team },
  { name: team.Member1, team },
  { name: team.Member2, team },
  { name: team.Member3, team }
].filter((entry) => entry.name));

const renderPreachingCard = (team) => {
  const members = getPreachingMembers(team);
  const locations = getPreachingLocations(team);
  return `
    <div class="preaching-card">
      <strong>${escapeHtml(team.TeamName || 'Event Team')}</strong>
      <div class="preaching-detail"><span>Driver</span><div>${escapeHtml(team.Driver || 'TBD')}</div></div>
      <div class="preaching-detail"><span>Members</span><div>${members.length ? members.map(escapeHtml).join(', ') : 'TBD'}</div></div>
      <div class="preaching-detail"><span>Car</span><div>${escapeHtml(team.Car || 'TBD')}</div></div>
      <div class="preaching-detail"><span>Locations</span><div>${locations.length ? locations.map(escapeHtml).join('<br>') : 'TBD'}</div></div>
    </div>
  `;
};

const renderPreachingResults = (teams = []) => {
  if (!preachingList) return;
  preachingList.innerHTML = teams.length ? teams.map(renderPreachingCard).join('') : '';
};

const findPreachingTeams = (name, teamName = '') => {
  const searchText = normalizeName(name);
  if (!searchText) return [];
  return preachingTeamsCache.filter((team) => (!teamName || team.TeamName === teamName)
    && [team.Driver, team.Member1, team.Member2, team.Member3]
    .some((person) => nameMatchesQuery(person, searchText)));
};

const renderPreachingSuggestions = (query) => {
  if (!preachingSuggestions) return;

  const searchText = normalizeName(query);
  const matches = getPreachingSearchRows(preachingTeamsCache)
    .filter((entry) => nameMatchesQuery(entry.name, searchText))
    .filter((entry, index, rows) => rows.findIndex((item) => item.name === entry.name
      && item.team.TeamName === entry.team.TeamName) === index)
    .slice(0, 20);

  if (!searchText || !matches.length) {
    preachingSuggestions.hidden = true;
    preachingSuggestions.innerHTML = '';
    return;
  }

  preachingSuggestions.innerHTML = matches.map((entry) => `
    <button class="autocomplete-option" type="button" data-name="${escapeHtml(entry.name)}" data-team="${escapeHtml(entry.team.TeamName || '')}">
      <span>${escapeHtml(entry.name)}</span>
      <small>${escapeHtml(entry.team.TeamName || 'Team')}</small>
    </button>
  `).join('');
  preachingSuggestions.hidden = false;
};

const selectPreachingName = (name, teamName = '') => {
  if (preachingSearch) preachingSearch.value = name;
  if (preachingSuggestions) preachingSuggestions.hidden = true;
  const teams = findPreachingTeams(name, teamName);
  if (!teams.length && preachingList) {
    preachingList.innerHTML = '<div class="info-box">No active event team found for that name.</div>';
    return;
  }
  renderPreachingResults(teams);
};

const renderPreachingSearch = (rows = []) => {
  preachingTeamsCache = rows.filter((item) => isActiveRow(item.Active));
  if (!preachingTeamsCache.length) {
    if (preachingList) preachingList.innerHTML = '<div class="info-box">No active event teams at this time.</div>';
    return;
  }
  renderPreachingResults(findPreachingTeams(preachingSearch?.value || ''));
};

const readPreachingCache = () => {
  try {
    const cached = JSON.parse(storage.get(SHEET_CACHE_KEY) || 'null');
    if (!cached || !Array.isArray(cached.preaching)) return null;
    return cached;
  } catch (error) {
    return null;
  }
};

const writePreachingCache = (preaching) => {
  storage.set(SHEET_CACHE_KEY, JSON.stringify({
    preaching: Array.isArray(preaching) ? preaching : [],
    fetchedAt: new Date().toISOString()
  }));
};

const loadPreachingData = async () => {
  const cached = readPreachingCache();
  if (cached) renderPreachingSearch(cached.preaching);

  if (!GOOGLE_SHEET_WEB_APP_URL) {
    if (!cached) renderPreachingSearch(demoPreachingRows);
    return;
  }

  try {
    const separator = GOOGLE_SHEET_WEB_APP_URL.includes('?') ? '&' : '?';
    const response = await fetch(`${GOOGLE_SHEET_WEB_APP_URL}${separator}sheet=Preaching&v=${dataVersion}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Event team data could not load');
    const data = await response.json();
    const rows = Array.isArray(data) ? data : data.preaching;
    writePreachingCache(rows);
    renderPreachingSearch(rows);
  } catch (error) {
    console.error(error);
    if (!cached && preachingList) {
      preachingList.innerHTML = '<div class="info-box">Event team information could not load. Please try again soon.</div>';
    }
  }
};

preachingSearch?.addEventListener('input', (event) => {
  if (!event.target.value.trim()) {
    renderPreachingResults([]);
  }
  renderPreachingSuggestions(event.target.value);
});

preachingSearch?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    selectPreachingName(preachingSearch.value);
  }
});

preachingSuggestions?.addEventListener('click', (event) => {
  const option = event.target.closest('.autocomplete-option');
  if (!option) return;
  event.preventDefault();
  selectPreachingName(option.dataset.name || '', option.dataset.team || '');
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.search-box') && preachingSuggestions) {
    preachingSuggestions.hidden = true;
  }
});

loadPreachingData();
