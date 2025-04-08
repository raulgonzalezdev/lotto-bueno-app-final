"use client";
import React from "react";
import { SettingsConfiguration } from "../Settings/types";

import { SchemaStatus } from "./types";
import { MdDelete } from "react-icons/md";

import StatusLabel from "../Chat/StatusLabel";
import StatusCard from "./StatusCard";
import PulseLoader from "react-spinners/PulseLoader";

import UserModalComponent from "../Navigation/UserModal";

interface AdminConsoleComponentProps {
  type: string | null;
  connected: string;
  schemas: SchemaStatus | null;
  isFetching: boolean;
  settingConfig: SettingsConfiguration;
  reset_verba: (m: string) => void;
}

const AdminConsoleComponent: React.FC<AdminConsoleComponentProps> = ({
  type,
  connected,
  isFetching,
  schemas,
  settingConfig,
  reset_verba,
}) => {
  const openResetVerba = () => {
    const modal = document.getElementById("reset_verba_modal");
    if (modal instanceof HTMLDialogElement) {
      modal.showModal();
    }
  };

  const openResetDocuments = () => {
    const modal = document.getElementById("reset_documents_modal");
    if (modal instanceof HTMLDialogElement) {
      modal.showModal();
    }
  };

  const openResetCache = () => {
    const modal = document.getElementById("reset_cache_modal");
    if (modal instanceof HTMLDialogElement) {
      modal.showModal();
    }
  };

  const openResetSuggestions = () => {
    const modal = document.getElementById("reset_suggestions_modal");
    if (modal instanceof HTMLDialogElement) {
      modal.showModal();
    }
  };

  const openConfigSuggestions = () => {
    const modal = document.getElementById("reset_config_modal");
    if (modal instanceof HTMLDialogElement) {
      modal.showModal();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col bg-bg-alt-verba rounded-lg shadow-lg p-5 text-text-verba gap-6 h-[65vh] overflow-auto">
        <div className="flex lg:flex-row flex-col gap-2">
          <p className="text-text-verba font-bold text-lg">Consola de administración</p>
          <div className="flex gap-2">
            <StatusLabel
              status={type !== null}
              true_text={type ? type : ""}
              false_text={type ? type : ""}
            />
            <StatusLabel
              status={connected === "Online"}
              true_text={connected}
              false_text="Conectando.."
            />
          </div>
        </div>

        {isFetching && (
          <div className="flex items-center justify-center pl-4 mb-4 gap-3">
            <PulseLoader
              color={settingConfig.Customization.settings.text_color.color}
              loading={true}
              size={10}
              speedMultiplier={0.75}
            />
            <p>Cargando estadísticas</p>
          </div>
        )}

        {connected === "Online" && (
          <div className="gap-2 grid grid-cols-2">
            <button
              onClick={openResetVerba}
              className="btn bg-button-verba text-text-verba border-none hover:bg-warning-verba flex gap-2"
            >
              <div className="hidden lg:flex">
                <MdDelete />
              </div>
              <p className="flex text-xs">Reset Verba</p>
            </button>
            <button
              onClick={openResetDocuments}
              className="btn bg-button-verba text-text-verba border-none hover:bg-warning-verba flex gap-2"
            >
              <div className="hidden lg:flex">
                <MdDelete />
              </div>
              <p className="flex text-xs">Restablecer documentos</p>
            </button>
            <button
              onClick={openResetCache}
              className="btn bg-button-verba text-text-verba border-none hover:bg-warning-verba flex gap-2"
            >
              <div className="hidden lg:flex">
                <MdDelete />
              </div>
              <p className="flex text-xs">Restablecer caché</p>
            </button>
            <button
              onClick={openResetSuggestions}
              className="btn bg-button-verba text-text-verba border-none hover:bg-warning-verba flex gap-2"
            >
              <div className="hidden lg:flex">
                <MdDelete />
              </div>
              <p className="flex text-xs">Restablecer sugerencia</p>
            </button>
            <button
              onClick={openConfigSuggestions}
              className="btn bg-button-verba text-text-verba border-none hover:bg-warning-verba flex gap-2"
            >
              <div className="hidden lg:flex">
                <MdDelete />
              </div>
              <p className="flex text-xs">Restablecer configuración</p>
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {schemas &&
            Object.entries(schemas).map(([key, value]) => (
              <StatusCard
                key={key + "SCHEMA"}
                title={key}
                value={value}
                checked={false}
              />
            ))}
        </div>
      </div>

      <UserModalComponent
        modal_id="reset_verba_modal"
        title="Reset App"
        text={"¿Quieres eliminar todos los datos de App?"}
        triggerString="Reiniciar"
        triggerValue="VERBA"
        triggerAccept={reset_verba}
      />
      <UserModalComponent
        modal_id="reset_documents_modal"
        title="Reset Documents"
        text={"¿Quieres eliminar todos los documentos?"}
        triggerString="Reiniciar"
        triggerValue="TICKETS"
        triggerAccept={reset_verba}
      />
      <UserModalComponent
        modal_id="reset_cache_modal"
        title="Restablecer caché"
        text={"¿Quieres eliminar todos los datos almacenados en caché?"}
        triggerString="Reiniciar"
        triggerValue="CACHE"
        triggerAccept={reset_verba}
      />
      <UserModalComponent
        modal_id="reset_suggestions_modal"
        title="Restablecer sugerencias"
        text={"¿Quieres eliminar todas las sugerencias de autocompletar?"}
        triggerString="Reiniciar"
        triggerValue="SUGGESTIONS"
        triggerAccept={reset_verba}
      />
      <UserModalComponent
        modal_id="reset_config_modal"
        title="Reset Configuration"
        text={"Restablecer configuración"}
        triggerString="Reiniciar"
        triggerValue="CONFIG"
        triggerAccept={reset_verba}
      />
    </div>
  );
};

export default AdminConsoleComponent;
