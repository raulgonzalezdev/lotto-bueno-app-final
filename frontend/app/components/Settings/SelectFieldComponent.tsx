import React from "react";
import { SettingsConfiguration, SelectSetting } from "./types";

interface SelectComponentProps {
  title: string;
  SelectSetting: SelectSetting;
  setting: "Customization" | "Chat";
  settingsConfig: SettingsConfiguration;
  setSettingsConfig: (settings: any) => void;
  setSettingTemplate?: (s: string) => void;
}

const SelectComponent: React.FC<SelectComponentProps> = ({
  title,
  SelectSetting,
  setting,
  settingsConfig,
  setSettingsConfig,
  setSettingTemplate,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newText = e.target.value;
    setSettingsConfig((prevConfig: any) => {
      const newConfig = { ...prevConfig };
      newConfig[setting].settings[title].value = newText;
      return newConfig;
    });
  };

  return (
    <div key={title} className="flex flex-col gap-1">
      <div className="flex items-center justify-center">
        <p>{SelectSetting.description}</p>
      </div>
      <div className="flex items-center justify-center">
        <select
          value={(settingsConfig[setting].settings as any)[title].value}
          onChange={handleChange}
          className="select bg-bg-verba"
        >
          {SelectSetting.options.map((template) => (
            <option key={"Select_" + template} value={template}>
              {template}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SelectComponent;
