// InfoComponent.tsx
import React, { useState } from "react";
import { FaInfo, FaUserCog } from "react-icons/fa";

import LoginModal from '../login/Login'; // Asegúrate de que el import es correcto
import { SettingsConfiguration } from "../Settings/types";

interface InfoComponentProps {
  settingConfig: SettingsConfiguration;
  tooltip_text: string;
  display_text: string;
  isAdmin: boolean;
  toggleAdmin: (isAdmin: boolean) => void;
  title: string;
  subtitle: string;
  imageSrc: string;
}

const InfoComponent: React.FC<InfoComponentProps> = ({
  settingConfig,
  tooltip_text,
  display_text,
  isAdmin,
  toggleAdmin,
  title,
  subtitle,
  imageSrc
}) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const handleIconClick = () => {
    if (!isAdmin) {
      setModalVisible(true);
    } else {
      toggleAdmin(false);
    }
  };

  return (
    <div className={`relative ${settingConfig.Chat.settings.info_button.checked ? "flex" : "hidden"} items-center gap-2`}>
      <button onClick={handleIconClick} className="btn btn-circle btn-sm border-none bg-bg-verba hover:bg-secondary-verba text-text-verba">
        {isAdmin ? <FaUserCog /> : <FaInfo />}
      </button>
      {/* <LoginModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onAdminLogin={(isAdminStatus) => {
          toggleAdmin(isAdminStatus);
          setModalVisible(false);
        }}
        title={title}
        subtitle={subtitle}
        imageSrc={imageSrc}
      /> */}
      <div className="tooltip tooltip-right text-xs" data-tip={tooltip_text}>
        <p className="text-sm text-text-alt-verba">{display_text}</p>
      </div>
    </div>
  );
};

export default InfoComponent;
