import {
  ACTION_TYPES,
  APP_SETTING_KEYS,
  DEFAULT_END_TIME,
  DEFAULT_IS_REMINDER_ACTIVE,
  DEFAULT_START_TIME,
  REMIND_USER_AFTER,
  type AppSettings,
} from "./utils";

const retrieveAppSettings = async (): Promise<AppSettings> => {
  const { startTime, endTime, isReminderActive } = APP_SETTING_KEYS;

  return new Promise((resolve) => {
    chrome.storage.sync.get<AppSettings>(
      [startTime, endTime, isReminderActive],
      (result) => {
        const {
          startTime = DEFAULT_START_TIME,
          endTime = DEFAULT_END_TIME,
          isReminderActive = DEFAULT_IS_REMINDER_ACTIVE,
        } = result;

        resolve({ startTime, endTime, isReminderActive });
      }
    );
  });
};

const calculateDelayUntilFirstReminderInMinutes = (
  todayStartTime: Date,
  todayEndTime: Date
): number => {
  // If the end time is earlier than the start time, assume it's for the next day e.g The user works from 10 PM to 6 AM
  if (todayEndTime.getTime() < todayStartTime.getTime()) {
    todayEndTime.setDate(todayEndTime.getDate() + 1);
  }

  const now = new Date();

  // If current time is before work start time, return minutes until start
  if (now.getTime() < todayStartTime.getTime()) {
    return Math.max(
      1,
      Math.ceil((todayStartTime.getTime() - now.getTime()) / (1000 * 60))
    );
  }

  // If current time is within work hours, return minutes until next reminder
  if (
    now.getTime() >= todayStartTime.getTime() &&
    now.getTime() < todayEndTime.getTime()
  ) {
    while (todayStartTime.getTime() <= now.getTime()) {
      todayStartTime.setHours(todayStartTime.getHours() + REMIND_USER_AFTER);
    }

    return Math.max(
      1,
      Math.ceil((todayStartTime.getTime() - now.getTime()) / (1000 * 60))
    );
  }

  // If current time is past work end time, schedule for next day's start
  const tomorrowStartTime = new Date(todayStartTime);
  tomorrowStartTime.setDate(tomorrowStartTime.getDate() + 1);

  return Math.max(
    1,
    Math.ceil((tomorrowStartTime.getTime() - now.getTime()) / (1000 * 60))
  );
};

const getDelayInMinutes = (
  startTime: AppSettings["startTime"],
  endTime: AppSettings["endTime"]
): number => {
  const now = new Date();
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  // Get today's start and end time
  const todayStartTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    startHour,
    startMinute,
    0
  );

  const todayEndTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    endHour,
    endMinute,
    0
  );

  return calculateDelayUntilFirstReminderInMinutes(
    todayStartTime,
    todayEndTime
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
    delayInMinutes: getDelayInMinutes(startTime, endTime),
    periodInMinutes: REMIND_USER_AFTER * 60,
  });
}

// Listener for when an alarm fires so we can send a notification
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ACTION_TYPES.scheduleReminder) {
    const { startTime, endTime, isReminderActive } =
      await retrieveAppSettings();

    if (!isReminderActive) {
      return;
    }

    const now = new Date();
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const todayStartTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      startHour,
      startMinute,
      0
    );

    const todayEndTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      endHour,
      endMinute,
      0
    );

    // Handle overnight shifts if end time is earlier than start time e.g the user works from 10 PM to 6 AM
    // TODO: Relook this logic
    if (todayEndTime.getTime() < todayStartTime.getTime()) {
      if (now.getTime() >= todayStartTime.getTime()) {
        // If current time is after start time, but before midnight, use today's end time
        // If current time is after midnight, but before end time, use tomorrow's end time
        // This logic might need refinement for complex overnight scenarios, but covers most cases
        if (
          now.getHours() < startHour ||
          (now.getHours() === startHour && now.getMinutes() < startMinute)
        ) {
          // It's the next day, but still within the "previous day's" work hours
          todayStartTime.setDate(todayStartTime.getDate() - 1);
        }
      } else {
        // It's before start time, so consider today's start and tomorrow's end
        todayEndTime.setDate(todayEndTime.getDate() + 1);
      }
    }

    // Check if current time is within the defined work hours
    if (
      now.getTime() >= todayStartTime.getTime() &&
      now.getTime() <= todayEndTime.getTime()
    ) {
      chrome.notifications.create(ACTION_TYPES.nudgeUserToTakeBreak, {
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: "Time for a Walk!",
        message:
          "It's been an hour. Go for a 20-minute walk to stretch your legs and clear your mind!",
        priority: 2,
      });
    } else {
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

    updateAlarms(settings);
  }
});

// Re-evaluate alarms when the extension is installed or the browser starts
chrome.runtime.onInstalled.addListener(async () => {
  const result = await retrieveAppSettings();

  updateAlarms(result);
});

// When chrome is started, re-evaluate the alarms
chrome.runtime.onStartup.addListener(async () => {
  const result = await retrieveAppSettings();

  updateAlarms(result);
});
