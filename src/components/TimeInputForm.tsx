import { ArrowRight } from "react-bootstrap-icons";
import { TimeInput } from "./TimeInput";
import classNames from "classnames";
import { useState } from "react";

export const TimeInputForm: React.FC = () => {
  const [isSubmitButtonDisabled] = useState(false);

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
  };

  return (
    <form className="flex justify-between" onSubmit={handleSubmit}>
      <div className="flex items-center space-x-2">
        <TimeInput onTimeChange={(time) => console.log(time)} />
        <ArrowRight className="text-white" size={14} />
        <TimeInput onTimeChange={(time) => console.log(time)} />
      </div>

      <button
        type="submit"
        className={classNames(
          "px-3 rounded-lg text-xs text-white font-medium shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 focus:ring-offset-slate-900 hover:bg-green-900 active:bg-green-900",
          {
            "bg-green-800 cursor-pointer": !isSubmitButtonDisabled,
          }
        )}
      >
        Save
      </button>
    </form>
  );
};
