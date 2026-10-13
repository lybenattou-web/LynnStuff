/**
 * Gmail watcher: push notification when Daniel de Sousa emails you.
 * Runs every 5 minutes, but only acts between 08:00 and 19:00 (script time zone).
 *
 * Setup: see README.md in this folder.
 */

const SENDER = 'daniel.desousa@proton.ch';
const START_HOUR = 8;   // inclusive
const END_HOUR = 19;    // exclusive -> last check at 18:55

// Notification channel: ntfy.sh push to your phone (free, no account).
// Pick a long, unguessable topic name: anyone who knows it can read the alerts.
const NTFY_TOPIC = 'CHANGE-ME-to-a-random-string';

function checkDaniel() {
  const tz = Session.getScriptTimeZone();
  const hour = Number(Utilities.formatDate(new Date(), tz, 'H'));
  if (hour < START_HOUR || hour >= END_HOUR) return;

  // Remember the newest message already alerted on, so each email alerts exactly once
  // (including later replies in an existing thread). First run starts from "now".
  const props = PropertiesService.getScriptProperties();
  const last = Number(props.getProperty('lastNotified') || Date.now());
  let newest = last;

  // Mail that arrived overnight is reported at the first check after 08:00.
  const threads = GmailApp.search(`from:${SENDER} newer_than:2d`, 0, 20);
  for (const thread of threads) {
    for (const msg of thread.getMessages()) {
      const t = msg.getDate().getTime();
      if (t <= last || !msg.getFrom().includes(SENDER)) continue;
      notify(msg.getSubject() || '(no subject)', msg.getPlainBody().slice(0, 200), thread.getPermalink());
      newest = Math.max(newest, t);
    }
  }
  props.setProperty('lastNotified', String(newest));
}

function notify(subject, preview, link) {
  // JSON publish (not headers) so accented subjects survive.
  UrlFetchApp.fetch('https://ntfy.sh/', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      topic: NTFY_TOPIC,
      title: `Email from Daniel de Sousa: ${subject}`,
      message: preview,
      priority: 4,
      click: link,
      tags: ['email'],
    }),
  });
}

/** Run once manually to install the 5-minute trigger. */
function install() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('checkDaniel').timeBased().everyMinutes(5).create();
}

/** Run manually to check the notification reaches your phone. */
function testNotification() {
  notify('Test', 'If you see this, the alert works.', 'https://mail.google.com');
}
