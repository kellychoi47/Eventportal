# Event Information Portal Demo Data

This public demo uses generic sample data only.

## Schedule

Edit `schedule.json` to update the Schedule tab.

Each date object should keep this shape:

```json
{
  "date": "2026-06-08",
  "label": "June 8",
  "items": [
    { "time": "9:00 AM", "title": "Keynote Workshop" }
  ]
}
```

If a date has no items, use `"items": []`. The website will show:

```text
Information will be updated soon.
```

## Menu

Edit `menu.json` to update the Menu tab.

Each date object should keep this shape:

```json
{
  "date": "2026-06-08",
  "label": "June 8",
  "items": [
    { "meal": "Lunch", "description": "Sandwiches, fruit, lemonade" }
  ]
}
```

## Announcements And Team Search

For the public demo, announcements and team search use sample data directly in `script.js` and `preaching.js`.

No real Google Sheet, form URL, password, phone number, private event location, or identifiable attendee data is included in this repository.
