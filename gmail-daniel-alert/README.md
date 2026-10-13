# Daniel de Sousa email alert

Checks Gmail every 5 min, 08:00–19:00, and pushes a phone notification when
`daniel.desousa@proton.ch` writes. Runs in Google Apps Script (free, on Google's
servers, nothing to keep running yourself).

## Setup (≈5 min)

1. On your phone, install the **ntfy** app (iOS/Android) and subscribe to a
   topic with a long random name, e.g. `lynn-dds-7f3k9q2x`.
2. Go to https://script.google.com → **New project**. Paste `Code.gs`.
   Replace `NTFY_TOPIC` with your topic name.
3. **Project Settings** (gear) → set the time zone to yours (the 8–19 window uses it).
4. Select `testNotification` → **Run** → grant permissions. You should get a push.
5. Select `install` → **Run**. Done: the trigger is now live.

To stop: run `install` after deleting the `ScriptApp.newTrigger` line, or remove
the trigger under **Triggers** (clock icon).

## Behaviour
- Every new email from Daniel triggers exactly one alert, including replies in an
  existing thread. Tapping the notification opens the thread in Gmail.
- Mail arriving 19:00–08:00 is reported at the first check after 08:00.
- Runs 7 days a week. For weekdays only, add `if ([0,6].includes(new Date().getDay())) return;`
  at the top of `checkDaniel`.
