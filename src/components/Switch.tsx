import classNames from "classnames";

interface ISwitchProps {
  enabled: boolean;
  onChange: () => void;
}

export const Switch: React.FC<ISwitchProps> = ({ enabled, onChange }) => {
  return (
    <label htmlFor="toggle-switch" className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          id="toggle-switch"
          className="sr-only"
          checked={enabled}
          onChange={onChange}
        />
        <div
          className={classNames("block w-10 h-6 rounded-full", {
            "bg-green-50": enabled,
            "bg-gray-300": !enabled,
          })}
        />
        <div
          className={classNames(
            "absolute left-1 top-1 w-4 h-4 rounded-full transition",
            {
              "translate-x-full bg-green-900": enabled,
              "bg-white": !enabled,
            }
          )}
        />
      </div>
    </label>
  );
};
