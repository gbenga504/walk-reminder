import { useState } from "react";
import { Switch } from "./components/Switch";
import { TimeInputForm } from "./components/TimeInputForm";

// This is the Popup UI that appears when the user clicks the extension icon in the browser toolbar.
const Popup: React.FC = () => {
  // const [startTime, setStartTime] = useState("09:00");
  // const [endTime, setEndTime] = useState("17:00");
  // const [isReminderActive, setIsReminderActive] = useState(false);
  const [nextReminderTime] = useState("Not set");
  // const [message, setMessage] = useState("");

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

          <Switch />
        </section>

        <div className="mt-4">
          <h6 className="font-bold text-sm">Work Time</h6>
          <div className="mt-2">
            <TimeInputForm />
          </div>
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
