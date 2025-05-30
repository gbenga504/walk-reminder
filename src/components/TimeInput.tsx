import classNames from "classnames";
import { useEffect, useState } from "react";

interface ITimeInputProps {
  initialTime?: string;
  onTimeChange: (time: string) => void;
}

export const TimeInput: React.FC<ITimeInputProps> = ({
  initialTime = "00:00",
  onTimeChange,
}) => {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(
    function parseInitialTime() {
      const parts = initialTime.split(":");

      setHours(parts[0] || "00");
      setMinutes(parts[1] || "00");
    },
    [initialTime]
  );

  const convertTimeToTwoDigitFormat = (time: number): string => {
    return String(time).padStart(2, "0");
  };

  const notifyTimeChange = (hour: string, minute: string) => {
    const formattedHours = convertTimeToTwoDigitFormat(parseInt(hour) || 0);
    const formattedMinutes = convertTimeToTwoDigitFormat(parseInt(minute) || 0);

    onTimeChange(`${formattedHours}:${formattedMinutes}`);
  };

  const handleHoursChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;

    // Allow empty string or single digit for temporary input
    if (value === "" || /^\d{1,2}$/.test(value)) {
      setHours(value);

      // If a valid two-digit number is entered, update the full time
      if (value.length === 2 && !isNaN(parseInt(value, 10))) {
        let num = parseInt(value, 10);
        if (num > 23) {
          // Default to 00 if greater than 23
          num = 0;
        }

        setHours(convertTimeToTwoDigitFormat(num));
        notifyTimeChange(convertTimeToTwoDigitFormat(num), minutes);
      }
      return;
    }

    let num = parseInt(value, 10);
    if (isNaN(num) || num < 0 || num > 23) {
      // If invalid, default to 00
      num = 0;
    }

    setHours(convertTimeToTwoDigitFormat(num));
    notifyTimeChange(convertTimeToTwoDigitFormat(num), minutes);
  };

  const handleMinutesChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;

    // Allow empty string or single digit for temporary input
    if (value === "" || /^\d{1,2}$/.test(value)) {
      setMinutes(value);

      // If a valid two-digit number is entered, update the full time
      if (value.length === 2 && !isNaN(parseInt(value, 10))) {
        let num = parseInt(value, 10);
        if (num > 59) {
          // Default to 00 if greater than 59
          num = 0;
        }

        setMinutes(convertTimeToTwoDigitFormat(num)); // Update state with formatted value
        notifyTimeChange(hours, convertTimeToTwoDigitFormat(num));
      }
      return;
    }

    let num = parseInt(value, 10);
    if (isNaN(num) || num < 0 || num > 59) {
      // If invalid, default to 00
      num = 0;
    }

    setMinutes(convertTimeToTwoDigitFormat(num));
    notifyTimeChange(hours, convertTimeToTwoDigitFormat(num));
  };

  const handleBlur = (ev: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const { name, value } = ev.target;

    if (value === "") {
      if (name === "hours") {
        setHours("00");
        notifyTimeChange("00", minutes);
      } else if (name === "minutes") {
        setMinutes("00");
        notifyTimeChange(hours, "00");
      }

      return;
    }

    // Re-validate on blur to ensure correct formatting even if user types one digit and blurs
    if (name === "hours") {
      let num = parseInt(value, 10);

      if (isNaN(num) || num < 0 || num > 23) {
        num = 0; // Default to 00
      }

      setHours(convertTimeToTwoDigitFormat(num));
      notifyTimeChange(convertTimeToTwoDigitFormat(num), minutes);
    } else if (name === "minutes") {
      let num = parseInt(value, 10);

      if (isNaN(num) || num < 0 || num > 59) {
        num = 0; // Default to 00
      }

      setMinutes(convertTimeToTwoDigitFormat(num));
      notifyTimeChange(hours, convertTimeToTwoDigitFormat(num));
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
