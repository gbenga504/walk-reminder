export const ACTION_TYPES = {
  settingsSaved: "settingsSaved",
  scheduleReminder: "scheduleReminder",
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
