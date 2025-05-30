import { ArrowRight } from "react-bootstrap-icons";
import { TimeInput } from "./TimeInput";
import classNames from "classnames";
import { useState } from "react";

export const WorkTimeForm: React.FC = () => {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [isSubmitButtonDisabled] = useState(true);

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
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
          disabled={isSubmitButtonDisabled}
          className={classNames(
            "px-3 rounded-lg text-xs  font-medium shadow-md transition-colors duration-200 focus:outline-none",
            {
              "bg-green-800 text-white cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-green-400 focus:ring-offset-slate-900 hover:bg-green-900 active:bg-green-900":
                !isSubmitButtonDisabled,
              "bg-green-50/70 text-green-900 cursor-not-allowed":
                isSubmitButtonDisabled,
            }
          )}
        >
          Save
        </button>
      </div>
    </form>
  );
};
