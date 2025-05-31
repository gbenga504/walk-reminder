import classNames from "classnames";
import { useState } from "react";

interface ITimeInputProps {
  time: string;
  onTimeChange: (time: string) => void;
}

export const TimeInput: React.FC<ITimeInputProps> = ({
  time,
  onTimeChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hours, minutes] = time.split(":");

  const convertTimeToTwoDigitFormat = (time: number | string): string => {
    return String(time).padStart(2, "0");
  };

  const parseTime = (time: string, maxPossibleValue: number): string => {
    // Also allow empty string or single digit for temporary input
    if (time === "" || /^\d{1,2}$/.test(time)) {
      if (time.length === 2) {
        if (parseInt(time) > maxPossibleValue) {
          return convertTimeToTwoDigitFormat("0");
        }

        return convertTimeToTwoDigitFormat(time);
      }

      return time;
    }

    return convertTimeToTwoDigitFormat("0");
  };

  const revalidateTime = (time: string, maxPossibleValue: number): string => {
    if (time === "") {
      return "00";
    }

    const num = parseInt(time);

    if (isNaN(num) || num < 0 || num > maxPossibleValue) {
      return "00";
    }

    return convertTimeToTwoDigitFormat(time);
  };

  const handleHoursChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;
    const parsedTime = parseTime(value, 23);

    onTimeChange(`${parsedTime}:${minutes}`);
  };

  const handleMinutesChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;
    const parsedTime = parseTime(value, 59);

    onTimeChange(`${hours}:${parsedTime}`);
  };

  const handleBlur = (ev: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const { name, value } = ev.target;

    if (name === "hours") {
      const revalidatedHours = revalidateTime(value, 23);

      onTimeChange(`${revalidatedHours}:${minutes}`);
    } else if (name === "minutes") {
      const revalidatedMinutes = revalidateTime(value, 59);

      onTimeChange(`${hours}:${revalidatedMinutes}`);
    }
  };

  return (
    <div
      className={classNames(
        "flex p-1 items-center border-2 rounded-lg transition-colors duration-200 shadow-sm",
        {
          "border-slate-700": !isFocused,
          "ring-green-900 border-green-900 ring-2": isFocused,
        }
      )}
    >
      <input
        type="text"
        name="hours"
        value={hours}
        onChange={handleHoursChange}
        onBlur={handleBlur}
        onFocus={() => setIsFocused(true)}
        className="w-5 text-center text-sm font-mono border-0 focus:outline-none"
        maxLength={2}
        placeholder="HH"
        aria-label="Hours"
        inputMode="numeric"
        pattern="\d*"
      />

      <span className="text-sm font-extrabold text-gray-white">:</span>

      <input
        type="text"
        name="minutes"
        value={minutes}
        onChange={handleMinutesChange}
        onBlur={handleBlur}
        onFocus={() => setIsFocused(true)}
        className="w-5 text-center text-sm font-mono border-0 focus:outline-none"
        maxLength={2}
        placeholder="MM"
        aria-label="Minutes"
        inputMode="numeric"
        pattern="\d*"
      />
    </div>
  );
};
