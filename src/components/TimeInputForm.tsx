import { ArrowRight } from "react-bootstrap-icons";
import { TimeInput } from "./TimeInput";

export const TimeInputForm: React.FC = () => {
  return (
    <div className="flex justify-between">
      <div className="flex items-center space-x-1">
        <TimeInput onTimeChange={(time) => console.log(time)} />
        <ArrowRight className="text-white" size={18} />
        <TimeInput onTimeChange={(time) => console.log(time)} />
      </div>
    </div>
  );
};
