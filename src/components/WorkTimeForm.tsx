import { ArrowRight } from "react-bootstrap-icons";
import { TimeInput } from "./TimeInput";
import classNames from "classnames";
import { useState } from "react";
import {
  ACTION_TYPES,
  APP_SETTING_KEYS,
  DEFAULT_END_TIME,
  DEFAULT_START_TIME,
} from "../utils";

interface IWorkTimeFormProps {
  onSuccess?: (startTime: string, endTime: string) => void;
}

export const WorkTimeForm: React.FC<IWorkTimeFormProps> = ({ onSuccess }) => {
  const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
  const [endTime, setEndTime] = useState(DEFAULT_END_TIME);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    chrome.storage.sync.set(
      {
        [APP_SETTING_KEYS.startTime]: startTime,
        [APP_SETTING_KEYS.endTime]: endTime,
      },
      () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);

        chrome.runtime.sendMessage({
          action: ACTION_TYPES.settingsSaved,
        });

        onSuccess?.(startTime, endTime);
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <h6 className="font-bold text-sm">Work Time</h6>

      <div className="flex justify-between mt-2">
        <div className="flex items-center space-x-2">
          <TimeInput
            defaultTime={startTime}
            onTimeChange={(time) => setStartTime(time)}
          />
          <ArrowRight size={14} />
          <TimeInput
            defaultTime={endTime}
            onTimeChange={(time) => setEndTime(time)}
          />
        </div>

        <button
          type="submit"
          disabled={isSaved}
          className={classNames(
            "px-3 rounded-lg text-xs  font-medium shadow-md transition-colors duration-200 focus:outline-none",
            {
              "bg-green-800 text-white cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-green-400 focus:ring-offset-slate-900 hover:bg-green-900 active:bg-green-900":
                !isSaved,
              "bg-green-50/70 text-green-900 cursor-not-allowed": isSaved,
            }
          )}
        >
          {isSaved ? "Saved 🚀 !" : "Save"}
        </button>
      </div>
    </form>
  );
};
