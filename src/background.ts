import {
  ACTION_INITIATORS,
  ACTION_TYPES,
  calculateDelayUntilFirstReminderInMinutes,
  getActualDates,
  NOTIFICATION_TYPES,
  REMIND_USER_AFTER,
  REMINDER_STATE,
  retrieveAppSettings,
  type AppSettings,
  type ReminderState,
} from "./utils";

const createOffscreenDocument = async () => {
  const OFFSCREEN_DOCUMENT_PATH = "offscreen.html";
  if (await chrome.offscreen.hasDocument()) return;

  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: ["AUDIO_PLAYBACK"],
    justification: "Plays reminder sounds for walk notifications.",
  });
};

let CURRENT_REMINDER_STATE: ReminderState = REMINDER_STATE.notActive;

const startReminder = async () => {
  console.log("Walk Reminder: Alarm fired, sending notification to user...");
  await createOffscreenDocument();

  await chrome.notifications.create(NOTIFICATION_TYPES.nudgeUserToTakeBreak, {
    type: "basic",
    iconUrl: "icon128.png",
    title: "Time for a Walk!",
    message: `It's been ${REMIND_USER_AFTER} hour. Go for a 20-minute walk to stretch your legs and clear your mind!`,
    priority: 2,
  });

  changeExtensionBadge("active");
  chrome.runtime.sendMessage({
    action: ACTION_TYPES.startReminder,
    initiator: ACTION_INITIATORS.offscreen,
  });

  CURRENT_REMINDER_STATE = REMINDER_STATE.active;
};

const stopReminder = async () => {
  await createOffscreenDocument();

  changeExtensionBadge("default");
  chrome.runtime.sendMessage({
    action: ACTION_TYPES.stopReminder,
    initiator: ACTION_INITIATORS.offscreen,
  });

  CURRENT_REMINDER_STATE = REMINDER_STATE.notActive;
};

const changeExtensionBadge = (state: "active" | "default") => {
  if (state === "default") {
    return chrome.action.setBadgeText({ text: "" });
  }

  chrome.action.setBadgeText({ text: "!" });

  let i = 0;
  setInterval(() => {
    chrome.action.setBadgeBackgroundColor({
      color: i % 2 === 0 ? "#FF0000" : "#FFA500",
    });
    i++;
  }, 1000);
};

// Update or clear alarms based on user settings
async function updateAlarms({
  startTime,
  endTime,
  isReminderActive,
}: AppSettings) {
  // Clear any existing alarms first to avoid duplicates
  chrome.alarms.clear(ACTION_TYPES.scheduleReminder);
  await stopReminder();

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
      await startReminder();
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
chrome.runtime.onMessage.addListener(async (request, _, sendResponse) => {
  if (request.action === ACTION_TYPES.settingsSaved) {
    const settings = await retrieveAppSettings();
    console.log("Walk Reminder: Settings saved, updating alarms...", settings);

    updateAlarms(settings);
    console.log("Walk Reminder: Alarms updated successfully.");
  }

  if (request.action === ACTION_TYPES.stopReminder) {
    console.log("Walk Reminder: Stop reminder request received.");
    await stopReminder();
  }

  if (request.action === ACTION_TYPES.retrieveReminderState) {
    console.log("Walk Reminder: Retrieve reminder state request received.");

    sendResponse(CURRENT_REMINDER_STATE);
  }
});

// Listen for when a notification is closed by the user
chrome.notifications.onClosed.addListener(async (notificationId, byUser) => {
  if (notificationId === NOTIFICATION_TYPES.nudgeUserToTakeBreak && byUser) {
    await stopReminder();
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
