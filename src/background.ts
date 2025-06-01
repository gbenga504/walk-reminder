import {
  ACTION_TYPES,
  getActualDates,
  NOTIFICATION_TYPES,
  REMIND_USER_AFTER,
  retrieveAppSettings,
  type AppSettings,
} from "./utils";

const calculateDelayUntilFirstReminderInMinutes = (
  startTime: AppSettings["startTime"],
  endTime: AppSettings["endTime"]
): number => {
  const { startDate, endDate } = getActualDates(startTime, endTime);
  const now = new Date();

  // If current time is before work start time, return minutes until start
  // e.g It is currently 9AM and the user begins work at 10 AM. We should return 60 minutes
  // i.e the next reminder is at 10:00 AM (Work start time)
  if (now.getTime() < startDate.getTime()) {
    return Math.max(
      1,
      Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60))
    );
  }

  // If current time is within work hours, return minutes until next reminder
  // e.g It is currently 10:30 AM and the user begins/began work at 9 AM. If we have a REMIND_USER_AFTER of 1 hour
  // we should return 30 minutes i.e the next reminder is at 11:00 AM
  if (
    now.getTime() >= startDate.getTime() &&
    now.getTime() < endDate.getTime()
  ) {
    while (startDate.getTime() <= now.getTime()) {
      startDate.setHours(startDate.getHours() + REMIND_USER_AFTER);
    }

    return Math.max(
      1,
      Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60))
    );
  }

  // If current time is past work end time, schedule for next day's start
  // e.g It is currently 6 PM and the user ends work at 5 PM. We should return the number of minutes until the next work day starts
  const tomorrowStartDate = new Date(startDate);
  tomorrowStartDate.setDate(tomorrowStartDate.getDate() + 1);

  return Math.max(
    1,
    Math.ceil((tomorrowStartDate.getTime() - now.getTime()) / (1000 * 60))
  );
};

// Update or clear alarms based on user settings
async function updateAlarms({
  startTime,
  endTime,
  isReminderActive,
}: AppSettings) {
  // Clear any existing alarms first to avoid duplicates
  chrome.alarms.clear(ACTION_TYPES.scheduleReminder);

  if (!isReminderActive) {
    return;
  }

  chrome.alarms.create(ACTION_TYPES.scheduleReminder, {
    delayInMinutes: calculateDelayUntilFirstReminderInMinutes(
      startTime,
      endTime
    ),
    periodInMinutes: REMIND_USER_AFTER * 60,
  });
}

// Listener for when an alarm fires so we can send a notification
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ACTION_TYPES.scheduleReminder) {
    const now = new Date();
    const { startTime, endTime, isReminderActive } =
      await retrieveAppSettings();

    if (!isReminderActive) {
      return;
    }

    const { startDate, endDate } = getActualDates(startTime, endTime);

    if (
      now.getTime() >= startDate.getTime() &&
      now.getTime() <= endDate.getTime()
    ) {
      console.log(
        "Walk Reminder: Alarm fired, sending notification to user..."
      );

      chrome.notifications.create(NOTIFICATION_TYPES.nudgeUserToTakeBreak, {
        type: "basic",
        iconUrl: "icon128.png",
        title: "Time for a Walk!",
        message: `It's been ${REMIND_USER_AFTER} hour. Go for a 20-minute walk to stretch your legs and clear your mind!`,
        priority: 2,
      });
    } else {
      console.log(
        "Walk Reminder: Alarm fired outside work hours, rescheduling..."
      );
      // If outside work hours, clear the current alarm and reschedule for next day's start
      // This ensures the alarm doesn't keep firing overnight if the user forgets to disable
      updateAlarms({ startTime, endTime, isReminderActive });
    }
  }
});

// Listen for messages when settings are saved
chrome.runtime.onMessage.addListener(async (request) => {
  if (request.action === ACTION_TYPES.settingsSaved) {
    const settings = await retrieveAppSettings();
    console.log("Walk Reminder: Settings saved, updating alarms...", settings);

    updateAlarms(settings);
    console.log("Walk Reminder: Alarms updated successfully.");
  }
});

// Re-evaluate alarms when the extension is installed or the browser starts
chrome.runtime.onInstalled.addListener(async () => {
  const settings = await retrieveAppSettings();
  console.log("Walk Reminder: Extension installed, updating alarms...");

  updateAlarms(settings);
  console.log("Walk Reminder: Alarms updated successfully.");
});

// When chrome is started, re-evaluate the alarms
chrome.runtime.onStartup.addListener(async () => {
  const settings = await retrieveAppSettings();
  console.log("Walk Reminder: Startup event triggered, updating alarms...");

  updateAlarms(settings);
  console.log("Walk Reminder: Alarms updated successfully.");
});
