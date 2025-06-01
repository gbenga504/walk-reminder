export const ACTION_TYPES = {
  settingsSaved: "settingsSaved",
  scheduleReminder: "scheduleReminder",
} as const;

export const NOTIFICATION_TYPES = {
  nudgeUserToTakeBreak: "nudgeUserToTakeBreak",
} as const;

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
