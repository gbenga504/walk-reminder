import classNames from "classnames";

// This is the Popup UI that appears when the user clicks the extension icon in the browser toolbar.
const Popup: React.FC = () => {
  const renderHeader = () => {
    return (
      <header className="p-3 justify-between items-center border-b border-gray-700">
        <h1 className="text-lg font-bold">Form Helper</h1>
      </header>
    );
  };

  const renderSwitch = () => {
    return (
      <label
        htmlFor="toggle-switch"
        className="flex items-center cursor-pointer"
      >
        <div className="relative">
          <input type="checkbox" id="toggle-switch" className="sr-only" />
          <div
            className={classNames("block w-10 h-6 rounded-full", {
              "bg-green-50": true,
              "bg-gray-300": false,
            })}
          />
          <div
            className={classNames(
              "absolute left-1 top-1 w-4 h-4 rounded-full transition",
              {
                "translate-x-full bg-green-900": true,
                "bg-white": false,
              }
            )}
          />
        </div>
      </label>
    );
  };

  const renderQuickSettings = () => {
    return (
      <section className="p-3 flex items-center justify-between gap-x-4">
        <div>
          <h6 className="text-base font-bold">Quick Settings</h6>
          <p className="text-sm mt-4">
            Enable form helper suggestions on this page
          </p>
        </div>

        {renderSwitch()}
      </section>
    );
  };

  return (
    <main>
      {renderHeader()}
      {renderQuickSettings()}
    </main>
  );
};

export default Popup;
