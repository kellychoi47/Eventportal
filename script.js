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
const demoData = {
  announcements: [
    {
      PostedDateTime: '2026-06-07T08:00:00-04:00',
      Announcement: 'Welcome desk opens at 8:30 AM near the main lobby.',
      NewExpiresAt: '2026-06-07T12:00:00-04:00',
      Active: 'TRUE'
    },
    {
      PostedDateTime: '2026-06-08T18:30:00-04:00',
      Announcement: 'Workshop rooms have been updated. Please review the Schedule section before your afternoon session.',
      NewExpiresAt: '',
      Active: 'TRUE'
    },
    {
      PostedDateTime: '2026-06-09T07:45:00-04:00',
      Announcement: 'Breakfast service begins at 8:00 AM in the dining hall.',
      NewExpiresAt: '',
      Active: 'TRUE'
    }
  ],
  schedule: {
    dates: [
      {
        date: '2026-06-07',
        label: 'June 7',
        items: [
          { time: '2:00 PM', title: 'Arrival and welcome desk check-in' },
          { time: '4:00 PM', title: 'Orientation walkthrough' },
          { time: '6:00 PM', title: 'Community dinner' }
        ]
      },
      {
        date: '2026-06-08',
        label: 'June 8',
        items: [
          { time: '7:30 AM', title: 'Breakfast' },
          { time: '9:00 AM', title: 'Opening session' },
          { time: '11:00 AM', title: 'Breakout workshops' },
          { time: '12:30 PM', title: 'Lunch' },
          { time: '2:00 PM', title: 'Group discussion' },
          { time: '6:00 PM', title: 'Dinner' }
        ]
      },
      {
        date: '2026-06-09',
        label: 'June 9',
        items: [
          { time: '8:00 AM', title: 'Breakfast' },
          { time: '9:30 AM', title: 'Project lab' },
          { time: '1:00 PM', title: 'Lunch' },
          { time: '3:00 PM', title: 'Team activity' }
        ]
      },
      {
        date: '2026-06-10',
        label: 'June 10',
        items: [
          { time: '8:00 AM', title: 'Breakfast' },
          { time: '10:00 AM', title: 'Practice presentations' },
          { time: '12:30 PM', title: 'Lunch' },
          { time: '5:30 PM', title: 'Closing dinner' }
        ]
      },
      {
        date: '2026-06-11',
        label: 'June 11',
        items: [
          { time: '8:00 AM', title: 'Grab-and-go breakfast' },
          { time: '9:00 AM', title: 'Checkout and departure support' },
          { time: '11:00 AM', title: 'Final shuttle group departs' }
        ]
      }
    ]
  },
  meals: {
    dates: [
      {
        date: '2026-06-07',
        label: 'June 7',
        items: [
          { meal: 'Dinner', description: 'Pasta bar, roasted vegetables, salad, sparkling water' }
        ]
      },
      {
        date: '2026-06-08',
        label: 'June 8',
        items: [
          { meal: 'Breakfast', description: 'Bagels, fruit, yogurt, coffee' },
          { meal: 'Lunch', description: 'Chicken wraps, salad, chips, juice' },
          { meal: 'Dinner', description: 'Rice bowls, vegetables, soup' },
          { meal: 'Snack', description: 'Cookies, tea, bottled water' }
        ]
      },
      {
        date: '2026-06-09',
        label: 'June 9',
        items: [
          { meal: 'Breakfast', description: 'Oatmeal, eggs, fruit, coffee' },
          { meal: 'Lunch', description: 'Turkey sandwiches, salad, lemonade' },
          { meal: 'Dinner', description: 'Taco station, beans, rice, fruit' }
        ]
      },
      {
        date: '2026-06-10',
        label: 'June 10',
        items: [
          { meal: 'Breakfast', description: 'Muffins, yogurt, bananas, coffee' },
          { meal: 'Lunch', description: 'Vegetable pasta, salad, iced tea' },
          { meal: 'Dinner', description: 'Family-style dinner with dessert' }
        ]
      },
      {
        date: '2026-06-11',
        label: 'June 11',
        items: [
          { meal: 'Breakfast', description: 'Grab-and-go breakfast boxes' }
        ]
      }
    ]
  },
  attendees: [
    { name: 'Maya Thompson', role: 'Participant', group: 'Blue Group', room: 'Room A-204', track: 'Leadership Track' },
    { name: 'Daniel Kim', role: 'Participant', group: 'Green Group', room: 'Room B-118', track: 'Operations Track' },
    { name: 'Olivia Martinez', role: 'Participant', group: 'Gold Group', room: 'Room A-212', track: 'Workshop Track' },
    { name: 'Ethan Williams', role: 'Volunteer', group: 'Blue Group', room: 'Room C-101', track: 'Support Track' },
    { name: 'Sophia Patel', role: 'Participant', group: 'Green Group', room: 'Room B-122', track: 'Leadership Track' },
    { name: 'Marcus Johnson', role: 'Participant', group: 'Gold Group', room: 'Room A-208', track: 'Operations Track' },
    { name: 'Chloe Anderson', role: 'Volunteer', group: 'Blue Group', room: 'Room C-104', track: 'Support Track' },
    { name: 'Noah Lee', role: 'Participant', group: 'Green Group', room: 'Room B-120', track: 'Workshop Track' },
    { name: 'Isabella Garcia', role: 'Participant', group: 'Gold Group', room: 'Room A-210', track: 'Leadership Track' },
    { name: 'Liam Robinson', role: 'Participant', group: 'Blue Group', room: 'Room C-108', track: 'Operations Track' },
    { name: 'Ava Nguyen', role: 'Volunteer', group: 'Green Group', room: 'Room B-124', track: 'Support Track' },
    { name: 'Jordan Davis', role: 'Participant', group: 'Gold Group', room: 'Room A-206', track: 'Workshop Track' }
  ],
  transportation: [
    { time: '8:30 AM', title: 'Group A departure staging at the east entrance' },
    { time: '9:15 AM', title: 'Group B departure staging at the east entrance' },
    { time: '10:00 AM', title: 'Final luggage check and rideshare pickup window' }
  ],
  weather: [
    { date: '2026-06-07', high: 76, low: 62, condition: 'Partly cloudy', precip: 12 },
    { date: '2026-06-08', high: 78, low: 63, condition: 'Sunny', precip: 8 },
    { date: '2026-06-09', high: 75, low: 61, condition: 'Cloudy', precip: 18 },
    { date: '2026-06-10', high: 77, low: 64, condition: 'Sunny', precip: 10 },
    { date: '2026-06-11', high: 74, low: 60, condition: 'Partly cloudy', precip: 14 }
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

const selectMapButton = (button) => {
  const image = document.getElementById(button.dataset.mapTarget);
  const group = button.closest('.pill-tabs');
  if (!image || !group) return;

  group.querySelectorAll('[data-map-button]').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  image.src = button.dataset.mapImage;
  image.alt = button.dataset.mapAlt || button.textContent.trim();
};

const imageModal = document.getElementById('imageModal');
const imageModalImg = document.getElementById('imageModalImg');
const imageModalClose = document.getElementById('imageModalClose');
const demoContactModal = document.getElementById('demoContactModal');
const demoContactClose = document.getElementById('demoContactClose');

const closeImageModal = () => {
  if (!imageModal || !imageModalImg) return;
  imageModal.classList.remove('show');
  imageModal.setAttribute('aria-hidden', 'true');
  imageModalImg.src = '';
  imageModalImg.alt = '';
};

const openDemoContactModal = () => {
  demoContactModal?.classList.add('show');
  demoContactModal?.setAttribute('aria-hidden', 'false');
};

const closeDemoContactModal = () => {
  demoContactModal?.classList.remove('show');
  demoContactModal?.setAttribute('aria-hidden', 'true');
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
demoContactClose?.addEventListener('click', closeDemoContactModal);
demoContactModal?.addEventListener('click', (event) => {
  if (event.target === demoContactModal) closeDemoContactModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeImageModal();
    closeDemoContactModal();
  }
});

const emptyMessage = 'Information will be updated soon.';
const scheduleTabs = document.getElementById('scheduleTabs');
const scheduleContent = document.getElementById('scheduleContent');
const menuTabs = document.getElementById('menuTabs');
const menuContent = document.getElementById('menuContent');
const announcementsList = document.getElementById('announcementsList');
const announcementsUpdated = document.getElementById('announcementsUpdated');
const announcementBadge = document.getElementById('announcementBadge');
const attendeeList = document.getElementById('attendeeList');
const attendeeSearch = document.getElementById('attendeeSearch');
const attendeeSuggestions = document.getElementById('attendeeSuggestions');
const clearAttendeeSearch = document.getElementById('clearAttendeeSearch');
const transportationContent = document.getElementById('transportationContent');

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const getDatedItems = (data) => Array.isArray(data?.dates) ? data.dates : [];
const renderEmptyMessage = () => `<div class="info-box">${emptyMessage}</div>`;

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

const renderMealItem = (item) => `
  <div class="time-row"><span>${escapeHtml(item.meal)}</span><span>${escapeHtml(item.description)}</span></div>
`;

const parseDemoDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDemoDateTime = (value) => {
  const date = parseDemoDate(value);
  if (!date) return value || '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const isActiveRow = (value) => String(value).trim().toLowerCase() === 'true';

const renderAnnouncements = (rows = []) => {
  if (!announcementsList) return;
  if (announcementsUpdated) announcementsUpdated.textContent = 'Showing fictional public demo data';

  const now = new Date();
  const announcements = rows.filter((item) => isActiveRow(item.Active));
  const hasNewAnnouncement = announcements.some((item) => {
    const expiresAt = parseDemoDate(item.NewExpiresAt);
    return expiresAt && now < expiresAt;
  });
  if (announcementBadge) announcementBadge.hidden = !hasNewAnnouncement;

  if (!announcements.length) {
    announcementsList.innerHTML = '<div class="info-box">No announcements at this time.</div>';
    return;
  }

  announcementsList.innerHTML = announcements.map((item) => {
    const expiresAt = parseDemoDate(item.NewExpiresAt);
    const isNew = expiresAt && now < expiresAt;
    return `
    <div class="announcement-card">
      <div class="announcement-meta">Posted/updated ${escapeHtml(formatDemoDateTime(item.PostedDateTime))}</div>
      <div class="announcement-message">
        ${isNew ? '<span class="new-badge announcement-inline-badge">NEW</span>' : ''}
        <span>${escapeHtml(item.Announcement || '')}</span>
      </div>
    </div>
  `;
  }).join('');
};

const normalizeName = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const nameMatchesQuery = (name, query) => {
  const normalizedName = normalizeName(name);
  const normalizedQuery = normalizeName(query);
  if (!normalizedName || !normalizedQuery) return false;
  return normalizedName.includes(normalizedQuery)
    || normalizedQuery.split(' ').every((part) => normalizedName.includes(part));
};

const renderAttendeeCard = (attendee) => `
  <div class="attendee-card">
    <strong>${escapeHtml(attendee.name)}</strong>
    <div class="attendee-detail"><span>Role</span><div>${escapeHtml(attendee.role)}</div></div>
    <div class="attendee-detail"><span>Group</span><div>${escapeHtml(attendee.group)}</div></div>
    <div class="attendee-detail"><span>Assigned room</span><div>${escapeHtml(attendee.room)}</div></div>
    <div class="attendee-detail"><span>Schedule track</span><div>${escapeHtml(attendee.track)}</div></div>
  </div>
`;

const findAttendees = (query) => {
  const searchText = normalizeName(query);
  if (!searchText) return [];
  return demoData.attendees.filter((attendee) => nameMatchesQuery(attendee.name, searchText));
};

const renderAttendeeResults = (query) => {
  if (!attendeeList) return;
  const searchText = normalizeName(query);

  if (!searchText) {
    attendeeList.innerHTML = '<div class="info-box">Enter an attendee name to view sample assignment details.</div>';
    return;
  }

  const matches = findAttendees(searchText);
  attendeeList.innerHTML = matches.length
    ? matches.map(renderAttendeeCard).join('')
    : '<div class="info-box">No attendee found. Try Maya Thompson, Daniel Kim, or Olivia Martinez.</div>';
};

const renderAttendeeSuggestions = (query) => {
  if (!attendeeSuggestions) return;
  const searchText = normalizeName(query);
  const matches = findAttendees(searchText).slice(0, 6);

  if (!searchText || !matches.length) {
    attendeeSuggestions.hidden = true;
    attendeeSuggestions.innerHTML = '';
    return;
  }

  attendeeSuggestions.innerHTML = matches.map((attendee) => `
    <button class="autocomplete-option" type="button" data-name="${escapeHtml(attendee.name)}">
      <span>${escapeHtml(attendee.name)}</span>
      <small>${escapeHtml(attendee.group)}</small>
    </button>
  `).join('');
  attendeeSuggestions.hidden = false;
};

const selectAttendeeName = (name) => {
  if (attendeeSearch) attendeeSearch.value = name;
  if (attendeeSuggestions) attendeeSuggestions.hidden = true;
  renderAttendeeResults(name);
};

const selectDateButton = (button) => {
  const tabsEl = button.closest('.pill-tabs');
  if (!tabsEl) return;

  if (tabsEl.id === 'scheduleTabs') {
    scheduleTabs.querySelectorAll('.pill[data-date]').forEach((item) => {
      item.classList.toggle('active', item === button);
    });

    setActiveDatedContent({
      tabsEl: scheduleTabs,
      contentEl: scheduleContent,
      data: demoData.schedule,
      renderer: renderScheduleItem,
      activeDate: button.dataset.date
    });
  }

  if (tabsEl.id === 'menuTabs') {
    menuTabs.querySelectorAll('.pill[data-date]').forEach((item) => {
      item.classList.toggle('active', item === button);
    });

    setActiveDatedContent({
      tabsEl: menuTabs,
      contentEl: menuContent,
      data: demoData.meals,
      renderer: renderMealItem,
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

  const demoContactButton = event.target.closest('[data-demo-contact]');
  if (demoContactButton) {
    event.preventDefault();
    event.stopImmediatePropagation();
    openDemoContactModal();
    return;
  }

  const sampleButton = event.target.closest('[data-sample-attendee]');
  if (sampleButton) {
    event.preventDefault();
    selectAttendeeName(sampleButton.dataset.sampleAttendee || '');
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

attendeeSearch?.addEventListener('input', (event) => {
  renderAttendeeResults(event.target.value);
  renderAttendeeSuggestions(event.target.value);
});

attendeeSearch?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    renderAttendeeResults(attendeeSearch.value);
    if (attendeeSuggestions) attendeeSuggestions.hidden = true;
  }
});

attendeeSuggestions?.addEventListener('click', (event) => {
  const option = event.target.closest('.autocomplete-option');
  if (!option) return;
  event.preventDefault();
  selectAttendeeName(option.dataset.name || '');
});

clearAttendeeSearch?.addEventListener('click', () => {
  if (attendeeSearch) attendeeSearch.value = '';
  if (attendeeSuggestions) {
    attendeeSuggestions.hidden = true;
    attendeeSuggestions.innerHTML = '';
  }
  renderAttendeeResults('');
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.search-box') && attendeeSuggestions) {
    attendeeSuggestions.hidden = true;
  }
});

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

const renderWeather = (days) => {
  if (!weatherList || !weatherRange) return;

  weatherRange.textContent = `${formatForecastDate(days[0].date)} - ${formatForecastDate(days[days.length - 1].date)}, Demo City, Demo State`;
  weatherList.innerHTML = days.map((day) => `
    <div class="weather-row">
      <strong>${formatForecastDate(day.date)}</strong>
      <span class="weather-temp">${Math.round(day.high)}°F / ${Math.round(day.low)}°F</span>
      <span class="weather-meta">${escapeHtml(day.condition)} · ${Math.round(day.precip)}% rain</span>
    </div>
  `).join('');

  if (weatherUpdated) weatherUpdated.textContent = 'Sample forecast for public demo';
};

const renderTransportation = () => {
  if (!transportationContent) return;
  transportationContent.innerHTML = demoData.transportation.map(renderScheduleItem).join('');
};

const feedbackForm = document.getElementById('feedbackForm');
const feedbackMessage = document.getElementById('feedbackMessage');
const resetFeedbackForm = document.getElementById('resetFeedbackForm');
const FEEDBACK_STORAGE_KEY = 'eventPortalDemoFeedback';

const saveFeedback = (entry) => {
  const existing = JSON.parse(storage.get(FEEDBACK_STORAGE_KEY) || '[]');
  existing.push(entry);
  storage.set(FEEDBACK_STORAGE_KEY, JSON.stringify(existing));
};

feedbackForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!feedbackForm.reportValidity()) return;

  saveFeedback({
    name: document.getElementById('feedbackName')?.value.trim() || '',
    experience: document.getElementById('feedbackExperience')?.value || '',
    section: document.getElementById('feedbackSection')?.value || '',
    comments: document.getElementById('feedbackComments')?.value.trim() || '',
    submittedAt: new Date().toISOString()
  });

  if (feedbackMessage) {
    feedbackMessage.textContent = 'Thank you. Your demo feedback was submitted successfully.';
  }
});

resetFeedbackForm?.addEventListener('click', () => {
  feedbackForm?.reset();
  if (feedbackMessage) feedbackMessage.textContent = '';
});

renderAnnouncements(demoData.announcements);
renderDatedSection({
  tabsEl: scheduleTabs,
  contentEl: scheduleContent,
  data: demoData.schedule,
  renderer: renderScheduleItem
});
renderDatedSection({
  tabsEl: menuTabs,
  contentEl: menuContent,
  data: demoData.meals,
  renderer: renderMealItem
});
renderAttendeeResults('');
renderTransportation();
renderWeather(demoData.weather);
