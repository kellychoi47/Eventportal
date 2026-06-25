const accessScreen = document.getElementById('accessScreen');
const accessPanel = document.querySelector('.access-panel');
const accessForm = document.getElementById('accessForm');
const appShell = document.getElementById('appShell');
const passcodeInput = document.getElementById('passcodeInput');
const accessError = document.getElementById('accessError');
const passcodeDots = document.querySelectorAll('.passcode-dots span');
const keypad = document.querySelector('.keypad');
let enteredCode = '';
let isCheckingPasscode = false;
const PASSCODE_LENGTH = 4;

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
      // Some preview browsers block storage. The app should still be clickable.
    }
  },
  remove(key) {
    try {
      window.localStorage?.removeItem(key);
    } catch (error) {
      // Some preview browsers block storage. The app should still be clickable.
    }
  }
};

const lockApp = () => {
  document.body.classList.remove('is-unlocked');
  document.body.classList.add('is-locked');
  accessScreen.removeAttribute('aria-hidden');
  appShell.setAttribute('aria-hidden', 'true');
  resetPasscode();
};

const unlockApp = () => {
  document.body.classList.remove('is-locked');
  document.body.classList.add('is-unlocked');
  accessScreen.setAttribute('aria-hidden', 'true');
  appShell.removeAttribute('aria-hidden');
  storage.set('isLoggedIn', 'true');
};

const updatePasscodeDisplay = () => {
  passcodeInput.value = enteredCode;
  passcodeDots.forEach((dot, index) => {
    dot.classList.toggle('filled', index < enteredCode.length);
  });
};

const resetPasscode = () => {
  enteredCode = '';
  updatePasscodeDisplay();
};

const showAccessError = (message = 'Incorrect code') => {
  accessError.textContent = message;
  accessPanel.classList.remove('shake');
  void accessPanel.offsetWidth;
  accessPanel.classList.add('shake');
  resetPasscode();
};

const submitPasscode = async () => {
  if (isCheckingPasscode || enteredCode.length !== PASSCODE_LENGTH) return;

  isCheckingPasscode = true;
  accessError.textContent = 'Checking demo code...';

  if (enteredCode === '1234') {
    accessError.textContent = '';
    storage.set('isLoggedIn', 'true');
    window.location.hash = '';
    unlockApp();
  } else {
    showAccessError('Use demo code 1234');
  }

  isCheckingPasscode = false;
};

const logoutApp = () => {
  storage.remove('isLoggedIn');
  lockApp();
  window.location.hash = 'login';
  window.location.reload();
};

window.logoutApp = logoutApp;
document.getElementById('logoutButton')?.addEventListener('click', logoutApp);

if (storage.get('isLoggedIn') === 'true') {
  unlockApp();
}

keypad.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  accessError.textContent = '';

  if (button.dataset.clear !== undefined) {
    resetPasscode();
    return;
  }

  if (button.dataset.delete !== undefined) {
    enteredCode = enteredCode.slice(0, -1);
    updatePasscodeDisplay();
    return;
  }

  if (button.dataset.key && enteredCode.length < PASSCODE_LENGTH) {
    enteredCode += button.dataset.key;
    updatePasscodeDisplay();
    if (enteredCode.length === PASSCODE_LENGTH) {
      window.setTimeout(submitPasscode, 120);
    }
  }
});

accessForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submitPasscode();
});

document.addEventListener('keydown', (event) => {
  if (!document.body.classList.contains('is-locked')) return;

  if (/^\d$/.test(event.key) && enteredCode.length < PASSCODE_LENGTH) {
    enteredCode += event.key;
    updatePasscodeDisplay();
    if (enteredCode.length === PASSCODE_LENGTH) {
      window.setTimeout(submitPasscode, 120);
    }
  }

  if (event.key === 'Backspace') {
    enteredCode = enteredCode.slice(0, -1);
    updatePasscodeDisplay();
  }
});

const accordions = document.querySelectorAll('[data-accordion]');
const helpBox = document.querySelector('.help-box');
const fallbackScheduleData = {
  dates: [
    { date: '2026-06-07', label: 'June 7', items: [] },
    {
      date: '2026-06-08',
      label: 'June 8',
      items: [
        { time: '7:00 AM', title: 'Breakfast' },
        { time: '8:00 AM', title: 'Morning Education' },
        { time: '9:00 AM', title: 'Opening Session' },
        { time: '12:30 PM', title: 'Lunch' },
        { time: '2:00 PM', title: 'Group Discussion' },
        { time: '6:00 PM', title: 'Dinner / End of Day' }
      ]
    },
    { date: '2026-06-09', label: 'June 9', items: [] },
    { date: '2026-06-10', label: 'June 10', items: [] },
    { date: '2026-06-11', label: 'June 11', items: [] }
  ]
};
const fallbackMenuData = {
  dates: [
    { date: '2026-06-07', label: 'June 7', items: [] },
    {
      date: '2026-06-08',
      label: 'June 8',
      items: [
        { meal: 'Breakfast', description: 'Bagels, fruit, yogurt, coffee' },
        { meal: 'Lunch', description: 'Chicken wraps, salad, chips, juice' },
        { meal: 'Dinner', description: 'Rice, bulgogi, vegetables, soup' },
        { meal: 'Snack', description: 'Cookies, tea, bottled water' }
      ]
    },
    { date: '2026-06-09', label: 'June 9', items: [] },
    { date: '2026-06-10', label: 'June 10', items: [] },
    { date: '2026-06-11', label: 'June 11', items: [] }
  ]
};
let scheduleDataCache = fallbackScheduleData;
let menuDataCache = fallbackMenuData;
let scheduleDataLoaded = true;
let menuDataLoaded = true;
let preachingTeamsCache = [];
const demoSheetData = {
  announcements: [
    {
      PostedDateTime: '2026-06-07T08:00:00-04:00',
      Announcement: 'Welcome desk opens at 8:30 AM near the main lobby.',
      NewExpiresAt: '2026-06-07T12:00:00-04:00',
      Active: 'TRUE'
    },
    {
      PostedDateTime: '2026-06-08T18:30:00-04:00',
      Announcement: 'Please check the schedule tab for updated workshop room assignments.',
      NewExpiresAt: '',
      Active: 'TRUE'
    }
  ],
  preaching: [
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
  ]
};

const closeSubTabs = (container) => {
  container.querySelectorAll('.sub-row').forEach((row) => row.classList.remove('active'));
  container.querySelectorAll('.sub-panel').forEach((panel) => panel.classList.remove('show'));
};

const openDefaultSubTab = (container) => {
  const targetId = container.dataset.defaultSubtarget;
  if (!targetId) return;

  const row = container.querySelector(`.sub-row[data-subtarget="${targetId}"]`);
  const panel = document.getElementById(targetId);
  if (!row || !panel) return;

  row.classList.add('active');
  panel.classList.add('show');
};

const toggleAccordion = (acc) => {
  if (!acc) return;

  const wasOpen = acc.classList.contains('open');

  accordions.forEach((other) => {
    if (other !== acc) {
      other.classList.remove('open');
      closeSubTabs(other);
    }
  });
  helpBox?.classList.remove('open');

  if (wasOpen) {
    acc.classList.remove('open');
    closeSubTabs(acc);
  } else {
    closeSubTabs(acc);
    acc.classList.add('open');
    openDefaultSubTab(acc);
  }
};

const toggleSubRow = (row) => {
  const panel = document.getElementById(row.dataset.subtarget);
  const group = row.closest('.sub-list');
  const parent = row.closest('[data-accordion]');
  if (!panel || !group || !parent) return;

  const wasOpen = row.classList.contains('active') && panel.classList.contains('show');

  group.querySelectorAll('.sub-row').forEach((item) => item.classList.remove('active'));
  group.querySelectorAll('.sub-panel').forEach((item) => item.classList.remove('show'));
  accordions.forEach((other) => {
    if (other !== parent) other.classList.remove('open');
  });
  helpBox?.classList.remove('open');
  parent.classList.add('open');

  if (!wasOpen) {
    row.classList.add('active');
    panel.classList.add('show');
  }
};

const toggleHelpBox = () => {
  if (!helpBox) return;
  const wasOpen = helpBox.classList.contains('open');

  accordions.forEach((acc) => {
    acc.classList.remove('open');
    closeSubTabs(acc);
  });
  helpBox.classList.toggle('open', !wasOpen);
};

const attachSubRowHandlers = (scope = document) => {
  scope.querySelectorAll('.sub-row').forEach((row) => {
    if (row.dataset.bound === 'true') return;
    row.dataset.bound = 'true';

    row.addEventListener('click', () => {
      toggleSubRow(row);
    });
  });
};

const selectMapButton = (button) => {
  const image = document.getElementById(button.dataset.mapTarget);
  const group = button.closest('.pill-tabs');
  if (!image || !group) return;

  group.querySelectorAll('[data-map-button]').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  image.src = button.dataset.mapImage;
  image.alt = button.dataset.mapAlt || button.textContent.trim();
};

const attachMapButtons = (scope = document) => {
  scope.querySelectorAll('[data-map-button]').forEach((button) => {
    if (button.dataset.mapBound === 'true') return;
    button.dataset.mapBound = 'true';

    button.addEventListener('click', () => {
      selectMapButton(button);
    });
  });
};

const imageModal = document.getElementById('imageModal');
const imageModalImg = document.getElementById('imageModalImg');
const imageModalClose = document.getElementById('imageModalClose');

const closeImageModal = () => {
  if (!imageModal || !imageModalImg) return;
  imageModal.classList.remove('show');
  imageModal.setAttribute('aria-hidden', 'true');
  imageModalImg.src = '';
  imageModalImg.alt = '';
};

document.querySelectorAll('[data-zoomable]').forEach((image) => {
  image.addEventListener('click', () => {
    if (!imageModal || !imageModalImg) return;
    imageModalImg.src = image.src;
    imageModalImg.alt = image.alt;
    imageModal.classList.add('show');
    imageModal.setAttribute('aria-hidden', 'false');
  });
});

imageModalClose?.addEventListener('click', closeImageModal);
imageModal?.addEventListener('click', (event) => {
  if (event.target === imageModal) closeImageModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeImageModal();
});

const emptyMessage = 'Information will be updated soon.';
const loadingMessage = 'Loading information...';
const scheduleTabs = document.getElementById('scheduleTabs');
const scheduleContent = document.getElementById('scheduleContent');
const menuTabs = document.getElementById('menuTabs');
const menuContent = document.getElementById('menuContent');
const announcementsList = document.getElementById('announcementsList');
const announcementsUpdated = document.getElementById('announcementsUpdated');
const announcementBadge = document.getElementById('announcementBadge');
const preachingList = document.getElementById('preachingList');
const preachingSearch = document.getElementById('preachingSearch');
const preachingSuggestions = document.getElementById('preachingSuggestions');
const uploadPhotosButton = document.getElementById('uploadPhotosButton');

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const getDatedItems = (data) => Array.isArray(data?.dates) ? data.dates : [];

const renderEmptyMessage = () => `<div class="info-box">${emptyMessage}</div>`;
const renderLoadingMessage = () => `<div class="info-box">${loadingMessage}</div>`;

const renderDatedContent = (items, renderer) => {
  if (!Array.isArray(items) || !items.length) return renderEmptyMessage();
  return items.map(renderer).join('');
};

const setActiveDatedContent = ({ tabsEl, contentEl, data, renderer, activeDate }) => {
  const dates = getDatedItems(data);
  if (!tabsEl || !contentEl) return;

  if (!dates.length) {
    contentEl.innerHTML = renderEmptyMessage();
    return;
  }

  const activeEntry = dates.find((entry) => entry.date === activeDate) || dates[0];

  tabsEl.querySelectorAll('.pill[data-date]').forEach((button) => {
    button.classList.toggle('active', button.dataset.date === activeEntry.date);
  });

  contentEl.innerHTML = renderDatedContent(activeEntry.items, renderer);
};

const renderDatedSection = ({ tabsEl, contentEl, data, renderer }) => {
  const dates = getDatedItems(data);
  if (!tabsEl || !contentEl) return;

  if (!tabsEl.querySelector('.pill[data-date]')) {
    tabsEl.innerHTML = dates.map((entry, index) => `
      <button class="pill${index === 0 ? ' active' : ''}" type="button" data-date="${escapeHtml(entry.date)}">${escapeHtml(entry.label || entry.date)}</button>
    `).join('');
  }

  const buttons = [...tabsEl.querySelectorAll('.pill[data-date]')];
  buttons.forEach((button) => {
    button.dataset.dateBound = 'true';
  });

  const activeButton = buttons.find((button) => button.classList.contains('active')) || buttons[0];
  setActiveDatedContent({
    tabsEl,
    contentEl,
    data,
    renderer,
    activeDate: activeButton?.dataset.date || dates[0]?.date
  });
};

const renderScheduleItem = (item) => `
  <div class="time-row"><span>${escapeHtml(item.time)}</span><span>${escapeHtml(item.title)}</span></div>
`;

const renderMenuItem = (item) => `
  <div class="time-row"><span>${escapeHtml(item.meal)}</span><span>${escapeHtml(item.description)}</span></div>
`;

const isActiveRow = (value) => String(value).trim().toLowerCase() === 'true';

const parseSheetDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatSheetDateTime = (value) => {
  const date = parseSheetDate(value);
  if (!date) return value || '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

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

const renderAnnouncementsUpdated = (timestamp, isCached = false) => {
  if (!announcementsUpdated) return;
  if (!timestamp) {
    announcementsUpdated.textContent = '';
    return;
  }
  const label = isCached ? 'Showing saved info from' : 'Latest info checked';
  announcementsUpdated.textContent = `${label} ${formatSheetDateTime(timestamp)}`;
};

const renderAnnouncements = (rows = [], meta = {}) => {
  if (!announcementsList) return;
  renderAnnouncementsUpdated(meta.updatedAt, meta.isCached);

  const now = new Date();
  const announcements = rows.filter((item) => isActiveRow(item.Active));
  const hasNewAnnouncement = announcements.some((item) => {
    const expiresAt = parseSheetDate(item.NewExpiresAt);
    return expiresAt && now < expiresAt;
  });
  if (announcementBadge) announcementBadge.hidden = !hasNewAnnouncement;

  if (!announcements.length) {
    announcementsList.innerHTML = '<div class="info-box">No announcements at this time.</div>';
    return;
  }

  announcementsList.innerHTML = announcements.map((item) => {
    const expiresAt = parseSheetDate(item.NewExpiresAt);
    const isNew = expiresAt && now < expiresAt;
    return `
    <div class="announcement-card">
      <div class="announcement-meta">Posted/updated ${escapeHtml(formatSheetDateTime(item.PostedDateTime))}</div>
      <div class="announcement-message">
        ${isNew ? '<span class="new-badge announcement-inline-badge">NEW</span>' : ''}
        <span>${escapeHtml(item.Announcement || '')}</span>
      </div>
    </div>
  `;
  }).join('');
};

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

const renderPreachingSuggestions = (query) => {
  if (!preachingSuggestions) return;

  const searchText = query.trim().toLowerCase();
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

const findPreachingTeams = (name, teamName = '') => {
  const searchText = normalizeName(name);
  if (!searchText) return [];
  return preachingTeamsCache.filter((team) => (!teamName || team.TeamName === teamName)
    && [team.Driver, team.Member1, team.Member2, team.Member3]
    .some((person) => nameMatchesQuery(person, searchText)));
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

const selectDateButton = (button) => {
  const tabsEl = button.closest('.pill-tabs');
  if (!tabsEl) return;

  if (tabsEl.id === 'scheduleTabs') {
    scheduleTabs.querySelectorAll('.pill[data-date]').forEach((item) => {
      item.classList.toggle('active', item === button);
    });

    if (!scheduleDataLoaded) {
      scheduleContent.innerHTML = renderLoadingMessage();
      return;
    }

    setActiveDatedContent({
      tabsEl: scheduleTabs,
      contentEl: scheduleContent,
      data: scheduleDataCache,
      renderer: renderScheduleItem,
      activeDate: button.dataset.date
    });
  }

  if (tabsEl.id === 'menuTabs') {
    menuTabs.querySelectorAll('.pill[data-date]').forEach((item) => {
      item.classList.toggle('active', item === button);
    });

    if (!menuDataLoaded) {
      menuContent.innerHTML = renderLoadingMessage();
      return;
    }

    setActiveDatedContent({
      tabsEl: menuTabs,
      contentEl: menuContent,
      data: menuDataCache,
      renderer: renderMenuItem,
      activeDate: button.dataset.date
    });
  }
};

document.addEventListener('click', (event) => {
  const helpButton = event.target.closest('#helpToggle');
  if (helpButton) {
    event.preventDefault();
    event.stopImmediatePropagation();
    toggleHelpBox();
    return;
  }

  const accordionToggle = event.target.closest('[data-toggle]');
  if (accordionToggle) {
    const accordion = accordionToggle.closest('[data-accordion]');
    if (accordion) {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleAccordion(accordion);
      return;
    }
  }

  const subRow = event.target.closest('.sub-row[data-subtarget]');
  if (subRow) {
    event.preventDefault();
    event.stopImmediatePropagation();
    toggleSubRow(subRow);
    return;
  }

  const mapButton = event.target.closest('[data-map-button]');
  if (mapButton) {
    event.preventDefault();
    event.stopImmediatePropagation();
    selectMapButton(mapButton);
    return;
  }

  const dateButton = event.target.closest('.pill[data-date]');
  if (dateButton) {
    event.preventDefault();
    event.stopImmediatePropagation();
    selectDateButton(dateButton);
  }
}, true);

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

const dataVersion = '20260606-sheet-cache';
const GOOGLE_SHEET_WEB_APP_URL = '';
const SHEET_CACHE_KEY = 'prophetSchoolSheetData';

const loadJson = async (url) => {
  const response = await fetch(`${url}?v=${dataVersion}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Could not load ${url}`);
  return response.json();
};

const readSheetCache = () => {
  try {
    const cached = JSON.parse(storage.get(SHEET_CACHE_KEY) || 'null');
    if (!cached || !Array.isArray(cached.announcements) || !Array.isArray(cached.preaching)) return null;
    return cached;
  } catch (error) {
    return null;
  }
};

const writeSheetCache = (data) => {
  storage.set(SHEET_CACHE_KEY, JSON.stringify({
    announcements: Array.isArray(data.announcements) ? data.announcements : [],
    preaching: Array.isArray(data.preaching) ? data.preaching : [],
    fetchedAt: new Date().toISOString()
  }));
};

const renderSheetData = (data, meta = {}) => {
  renderAnnouncements(Array.isArray(data.announcements) ? data.announcements : [], meta);
  renderPreachingSearch(Array.isArray(data.preaching) ? data.preaching : []);
};

const loadSheetData = async () => {
  const cached = readSheetCache();
  if (cached) {
    renderSheetData(cached, { updatedAt: cached.fetchedAt, isCached: true });
  }

  if (!GOOGLE_SHEET_WEB_APP_URL) {
    if (!cached) renderSheetData(demoSheetData, { updatedAt: new Date().toISOString(), isCached: false });
    return;
  }

  try {
    const separator = GOOGLE_SHEET_WEB_APP_URL.includes('?') ? '&' : '?';
    const response = await fetch(`${GOOGLE_SHEET_WEB_APP_URL}${separator}v=${dataVersion}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Google Sheet data could not load');
    const data = await response.json();
    writeSheetCache(data);
    const fresh = readSheetCache();
    renderSheetData(fresh || data, { updatedAt: fresh?.fetchedAt || new Date().toISOString(), isCached: false });
  } catch (error) {
    console.error(error);
    if (!cached) {
      renderAnnouncements([]);
      if (preachingList) {
        preachingList.innerHTML = '<div class="info-box">Google Sheet data could not load. Please check the Apps Script URL and deployment settings.</div>';
      }
    }
  }
};

const loadEventData = async () => {
  loadSheetData();

  renderDatedSection({
    tabsEl: scheduleTabs,
    contentEl: scheduleContent,
    data: scheduleDataCache,
    renderer: renderScheduleItem
  });

  renderDatedSection({
    tabsEl: menuTabs,
    contentEl: menuContent,
    data: menuDataCache,
    renderer: renderMenuItem
  });

  try {
    const scheduleData = await loadJson('data/schedule.json');
    scheduleDataCache = scheduleData;
    scheduleDataLoaded = true;
    renderDatedSection({
      tabsEl: scheduleTabs,
      contentEl: scheduleContent,
      data: scheduleData,
      renderer: renderScheduleItem
    });
  } catch (error) {
    console.error(error);
    scheduleDataLoaded = true;
    scheduleDataCache = fallbackScheduleData;
    renderDatedSection({
      tabsEl: scheduleTabs,
      contentEl: scheduleContent,
      data: scheduleDataCache,
      renderer: renderScheduleItem
    });
  }

  try {
    const menuData = await loadJson('data/menu.json');
    menuDataCache = menuData;
    menuDataLoaded = true;
    renderDatedSection({
      tabsEl: menuTabs,
      contentEl: menuContent,
      data: menuData,
      renderer: renderMenuItem
    });
  } catch (error) {
    console.error(error);
    menuDataLoaded = true;
    menuDataCache = fallbackMenuData;
    renderDatedSection({
      tabsEl: menuTabs,
      contentEl: menuContent,
      data: menuDataCache,
      renderer: renderMenuItem
    });
  }
};

const weatherList = document.getElementById('weatherList');
const weatherRange = document.getElementById('weatherRange');
const weatherUpdated = document.getElementById('weatherUpdated');

const formatForecastDate = (dateText) => {
  const date = new Date(`${dateText}T12:00:00`);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const weatherDescription = (code) => {
  if ([0, 1].includes(code)) return 'Clear';
  if ([2, 3].includes(code)) return 'Cloudy';
  if ([45, 48].includes(code)) return 'Fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Forecast';
};

const renderWeather = (days) => {
  if (!weatherList || !weatherRange) return;

  if (!days.length) {
    weatherList.innerHTML = '<div class="info-box">June 7 - June 11 is not available in the forecast yet. This section will update automatically when those dates are within range.</div>';
    return;
  }

  weatherRange.textContent = `${formatForecastDate(days[0].date)} - ${formatForecastDate(days[days.length - 1].date)}, Demo City, Demo State`;
  weatherList.innerHTML = days.map((day) => `
    <div class="weather-row">
      <strong>${formatForecastDate(day.date)}</strong>
      <span class="weather-temp">${Math.round(day.high)}°F / ${Math.round(day.low)}°F</span>
      <span class="weather-meta">${weatherDescription(day.code)} · ${Math.round(day.precip)}% rain</span>
    </div>
  `).join('');

  if (weatherUpdated) {
    weatherUpdated.textContent = `Updated ${new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })}`;
  }
};

const loadWeather = async () => {
  if (!weatherList) return;

  const targetStart = '2026-06-07';
  const targetEnd = '2026-06-11';
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=39.5000&longitude=-98.3500&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=America%2FNew_York&forecast_days=16';

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather request failed');

    const data = await response.json();
    const daily = data.daily || {};
    const days = (daily.time || []).map((date, index) => ({
      date,
      high: daily.temperature_2m_max[index],
      low: daily.temperature_2m_min[index],
      precip: daily.precipitation_probability_max[index] ?? 0,
      code: daily.weather_code[index]
    })).filter((day) => day.date >= targetStart && day.date <= targetEnd);

    renderWeather(days);
  } catch (error) {
    weatherList.innerHTML = '<div class="info-box">Weather could not load right now. Please check again later.</div>';
  }
};

loadEventData();
loadWeather();
