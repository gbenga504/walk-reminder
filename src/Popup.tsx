import { useEffect, useState } from "react";
import { Switch } from "./components/Switch";
import { WorkTimeForm } from "./components/WorkTimeForm";
import {
  ACTION_TYPES,
  APP_SETTING_KEYS,
  DEFAULT_IS_REMINDER_ACTIVE,
  getActualDates,
  REMIND_USER_AFTER,
  REMINDER_STATE,
  retrieveAppSettings,
  type ActionType,
} from "./utils";

const Popup: React.FC = () => {
  const [isReminderActive, setIsReminderActive] = useState(
    DEFAULT_IS_REMINDER_ACTIVE
  );
  const [nextReminderTime, setNextReminderTime] = useState("Not set");
  const [isReminderPlaying, setIsReminderPlaying] = useState(false);

  useEffect(function getNextReminder() {
    (async function () {
      if (typeof chrome !== "undefined" && chrome.storage) {
        const settings = await retrieveAppSettings();

        setIsReminderActive(settings.isReminderActive);

        if (settings.isReminderActive) {
          getNextReminderForDisplay(settings.startTime, settings.endTime);
        }
      }
    })();
  }, []);

  useEffect(function listenToReminderActions() {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      const messageListener = (request: { action: ActionType }) => {
        if (request.action === ACTION_TYPES.startReminder) {
          setIsReminderPlaying(true);
        }
      };

      chrome.runtime.onMessage.addListener(messageListener);

      return () => {
        chrome.runtime.onMessage.removeListener(messageListener);
      };
    }
  }, []);

  useEffect(function retrieveReminderState() {
    (async function () {
      const reminderState = await chrome.runtime.sendMessage({
        action: ACTION_TYPES.retrieveReminderState,
      });

      setIsReminderPlaying(reminderState === REMINDER_STATE.active);
    })();
  }, []);

  const computeNextReminder = (
    startTime: string,
    endTime: string
  ): string | null => {
    const now = new Date();
    const { startDate, endDate } = getActualDates(startTime, endTime);

    // If current time is before start time, next reminder is at start time
    if (now.getTime() < startDate.getTime()) {
      return startDate.toLocaleTimeString("en", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Find the next hourly interval within the work hours
    while (startDate.getTime() <= now.getTime()) {
      startDate.setHours(startDate.getHours() + REMIND_USER_AFTER);
    }

    // If the next reminder is after the end time, return null. No more reminders today
    if (startDate.getTime() > endDate.getTime()) {
      return null;
    }

    return startDate.toLocaleTimeString("en", {
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

  const handleStopReminder = () => {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({ action: ACTION_TYPES.stopReminder });

      setIsReminderPlaying(false);
    }
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
        {isReminderPlaying ? (
          <button
            className="bg-red-800 hover:bg-red-900 w-full py-2 rounded-md text-sm font-medium cursor-pointer"
            onClick={handleStopReminder}
          >
            Stop Reminder
          </button>
        ) : (
          <p>{nextReminderTime}</p>
        )}
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
