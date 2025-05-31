import { useEffect, useState } from "react";
import { Switch } from "./components/Switch";
import { WorkTimeForm } from "./components/WorkTimeForm";
import {
  ACTION_TYPES,
  APP_SETTING_KEYS,
  DEFAULT_IS_REMINDER_ACTIVE,
  REMIND_USER_AFTER,
} from "./utils";

const Popup: React.FC = () => {
  const [isReminderActive, setIsReminderActive] = useState(
    DEFAULT_IS_REMINDER_ACTIVE
  );
  const [nextReminderTime, setNextReminderTime] = useState("Not set");

  useEffect(function getNextReminderOnLoad() {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const { startTime, endTime, isReminderActive } = APP_SETTING_KEYS;

      chrome.storage.sync.get(
        [startTime, endTime, isReminderActive],
        (result) => {
          if (typeof result[startTime] !== "undefined") {
            setIsReminderActive(!!result[isReminderActive]);
          }

          if (result[isReminderActive]) {
            getNextReminderForDisplay(result[startTime], result[endTime]);
          }
        }
      );
    }
  }, []);

  const computeNextReminder = (
    startTime: string,
    endTime: string
  ): string | null => {
    const now = new Date();
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const nextReminder = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      startHour,
      startMinute,
      0
    );

    // If current time is before start time, next reminder is at start time
    if (now.getTime() < nextReminder.getTime()) {
      return nextReminder.toLocaleTimeString("en", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Find the next hourly interval within the work hours
    while (nextReminder.getTime() <= now.getTime()) {
      nextReminder.setHours(nextReminder.getHours() + REMIND_USER_AFTER);
    }

    // Check if the calculated next reminder is within the end time
    const workEndTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      endHour,
      endMinute,
      0
    );

    if (nextReminder.getTime() > workEndTime.getTime()) {
      return null;
    }

    return nextReminder.toLocaleTimeString("en", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNextReminderForDisplay = (startTime: string, endTime: string) => {
    const nextReminder = computeNextReminder(startTime, endTime);

    if (nextReminder) {
      setNextReminderTime(`Next reminder: ${nextReminder}`);
    } else {
      setNextReminderTime("No more reminders today.");
    }
  };

  const handleWorkTimeFormSuccess = (startTime: string, endTime: string) => {
    if (isReminderActive) {
      getNextReminderForDisplay(startTime, endTime);
    } else {
      setNextReminderTime("Not set");
    }
  };

  const handleToggleReminder = () => {
    const reminderActive = !isReminderActive;
    setIsReminderActive(reminderActive);

    chrome.storage.sync.set(
      { [APP_SETTING_KEYS.isReminderActive]: reminderActive },
      () => {
        chrome.runtime.sendMessage({
          action: ACTION_TYPES.settingsSaved,
        });
      }
    );
  };

  const renderHeader = () => {
    return (
      <header className="p-3 justify-between items-center border-b border-gray-700">
        <h1 className="text-lg font-bold">Walk Reminder</h1>
      </header>
    );
  };

  const renderBody = () => {
    return (
      <section className="flex-1 p-3 border-b border-gray-700">
        <section className="flex items-center justify-between gap-x-4">
          <div>
            <p className="text-sm">Enable walk reminders</p>
          </div>

          <Switch enabled={isReminderActive} onChange={handleToggleReminder} />
        </section>

        <div className="mt-4">
          <WorkTimeForm onSuccess={handleWorkTimeFormSuccess} />
        </div>
      </section>
    );
  };

  const renderFooter = () => {
    return (
      <footer className="p-3 text-center text-sm font-bold">
        <p>{nextReminderTime}</p>
      </footer>
    );
  };

  return (
    <main className="flex flex-col w-full h-full">
      {renderHeader()}
      {renderBody()}
      {renderFooter()}
    </main>
  );
};

export default Popup;
