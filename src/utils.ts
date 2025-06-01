export const ACTION_TYPES = {
  settingsSaved: "settingsSaved",

  scheduleReminder: "scheduleReminder",
  stopReminder: "stopReminder",
  startReminder: "startReminder",
  retrieveReminderState: "retrieveReminderState",
} as const;

export type ActionType = keyof typeof ACTION_TYPES;

export const ACTION_INITIATORS = {
  popup: "popup",
  offscreen: "offscreen",
  background: "background",
} as const;

export type ActionInitiator = keyof typeof ACTION_INITIATORS;

export const REMINDER_STATE = {
  active: "active",
  notActive: "notActive",
} as const;

export type ReminderState = keyof typeof REMINDER_STATE;

export interface AppSettings {
  startTime: string;
  endTime: string;
  isReminderActive: boolean;
}

export type AppSettingKey = keyof AppSettings;

export const APP_SETTING_KEYS: Record<AppSettingKey, AppSettingKey> = {
  startTime: "startTime",
  endTime: "endTime",
  isReminderActive: "isReminderActive",
} as const;

export const NOTIFICATION_TYPES = {
  nudgeUserToTakeBreak: "nudgeUserToTakeBreak",
} as const;

export const DEFAULT_START_TIME = "09:00";
export const DEFAULT_END_TIME = "17:00";
export const DEFAULT_IS_REMINDER_ACTIVE = false;
export const REMIND_USER_AFTER = 1; // in hours

export const getActualDates = (
  startTime: string,
  endTime: string
): { startDate: Date; endDate: Date } => {
  const now = new Date();
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  // Get today's start and end time
  const todayStartDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    startHour,
    startMinute,
    0
  );

  const todayEndDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    endHour,
    endMinute,
    0
  );

  // If the start time is lesser than the end time, then it a regular scenario
  // e.g The user works from 9 AM to 5 PM
  if (todayStartDate.getTime() < todayEndDate.getTime()) {
    return { startDate: todayStartDate, endDate: todayEndDate };
  }

  // If the start time is greater than the end time, then it is an overnight scenario
  // e.g The user works from 10 PM to 6 AM
  // In this case, we need to handle the logic differently
  const correctedStartDate = new Date(todayStartDate);
  const correctedEndDate = new Date(todayEndDate);

  // If the current time is before the end time and after midnight, we assume the user is still working
  // e.g It is currently 1 AM and the user works from 10 PM to 6 AM
  // In this case, we adjust the start time to the previous day
  if (now.getTime() < todayEndDate.getTime()) {
    correctedStartDate.setDate(correctedStartDate.getDate() - 1);
  }

  // If current time is after work start time and before midnight, we assume the user is still working
  // e.g It is currently 11 PM and the user works from 10 PM to 6 AM
  // In this case, we adjust the end time to the next day
  if (now.getTime() >= todayStartDate.getTime()) {
    correctedEndDate.setDate(correctedEndDate.getDate() + 1);
  }

  // If the current time is after the work end time, we leave the start date as it is
  // but we adjust the end date to the next day
  if (now.getTime() >= todayEndDate.getTime()) {
    correctedEndDate.setDate(correctedEndDate.getDate() + 1);
  }

  return {
    startDate: correctedStartDate,
    endDate: correctedEndDate,
  };
};

export const retrieveAppSettings = async (): Promise<AppSettings> => {
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

export const calculateDelayUntilFirstReminderInMinutes = (
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
