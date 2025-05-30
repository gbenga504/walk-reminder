import { useState } from "react";
import { Switch } from "./components/Switch";
import { WorkTimeForm } from "./components/WorkTimeForm";

const Popup: React.FC = () => {
  const [isReminderActive, setIsReminderActive] = useState(false);
  const [nextReminderTime] = useState("Not set");

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

          <Switch
            enabled={isReminderActive}
            onChange={() => setIsReminderActive(!isReminderActive)}
          />
        </section>

        <div className="mt-4">
          <WorkTimeForm />
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
