const attendeeList = document.getElementById('attendeeList');
const attendeeSearch = document.getElementById('attendeeSearch');
const attendeeSuggestions = document.getElementById('attendeeSuggestions');
const clearAttendeeSearch = document.getElementById('clearAttendeeSearch');

const attendees = [
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
];

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
}[char]));

const normalizeName = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const nameMatchesQuery = (name, query) => {
  const normalizedName = normalizeName(name);
  const normalizedQuery = normalizeName(query);
  if (!normalizedName || !normalizedQuery) return false;
  return normalizedName.includes(normalizedQuery)
    || normalizedQuery.split(' ').every((part) => normalizedName.includes(part));
};

const findAttendees = (query) => {
  const searchText = normalizeName(query);
  if (!searchText) return [];
  return attendees.filter((attendee) => nameMatchesQuery(attendee.name, searchText));
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
  const matches = findAttendees(query).slice(0, 6);

  if (!normalizeName(query) || !matches.length) {
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

attendeeSearch?.addEventListener('input', (event) => {
  renderAttendeeResults(event.target.value);
  renderAttendeeSuggestions(event.target.value);
});

attendeeSearch?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    renderAttendeeResults(attendeeSearch.value);
    attendeeSuggestions.hidden = true;
  }
});

attendeeSuggestions?.addEventListener('click', (event) => {
  const option = event.target.closest('.autocomplete-option');
  if (!option) return;
  event.preventDefault();
  selectAttendeeName(option.dataset.name || '');
});

document.querySelectorAll('[data-sample-attendee]').forEach((button) => {
  button.addEventListener('click', () => selectAttendeeName(button.dataset.sampleAttendee || ''));
});

clearAttendeeSearch?.addEventListener('click', () => {
  attendeeSearch.value = '';
  attendeeSuggestions.hidden = true;
  attendeeSuggestions.innerHTML = '';
  renderAttendeeResults('');
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.search-box') && attendeeSuggestions) {
    attendeeSuggestions.hidden = true;
  }
});

renderAttendeeResults('');
