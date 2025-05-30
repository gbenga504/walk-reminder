import classNames from "classnames";

export const Switch: React.FC = () => {
  return (
    <label htmlFor="toggle-switch" className="flex items-center cursor-pointer">
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
