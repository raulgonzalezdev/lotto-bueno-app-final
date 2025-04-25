/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
// Navbar.tsx

import React, { useState, useEffect } from "react";
import {  IoSettingsSharp, IoPeopleSharp, IoListSharp, IoQrCodeSharp, IoCallSharp } from "react-icons/io5";

import { FcAssistant , FcCollaboration, FcSmartphoneTablet , FcSalesPerformance  } from "react-icons/fc";
import { LuMenu } from "react-icons/lu";

import NavbarButton from "./NavButton";
import { PageType } from "../../types/common";

interface NavbarProps {
  imageSrc: string;
  title: string;
  subtitle: string;
  version: string;
  currentPage: PageType;
  APIHost: string | null;
  production: boolean;
  setCurrentPage: (page: PageType) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  imageSrc,
  title,
  subtitle,
  APIHost,
  version,
  currentPage,
  setCurrentPage,
  production,
}) => {
  const icon_size = 18;

  return (
    <div className="flex justify-between items-center mb-10">
      <div className="flex flex-row items-center gap-5">
        <img src={imageSrc} width={80} className="flex"></img>
        <div className="flex flex-col lg:flex-row lg:items-end justify-center lg:gap-3">
          <p className="sm:text-2xl md:text-3xl text-text-verba">{title}</p>
          <p className="sm:text-sm text-base text-text-alt-verba font-light">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-row justify-center items-center">
        <div className="hidden sm:h-[3vh] lg:h-[5vh] bg-text-alt-verba w-px sm:mx-2 md:mx-4"></div>

        <div className="lg:flex hidden lg:flex-row items-center lg:gap-3 justify-between">
          <div
            className={` ${production ? "h-[0vh]" : "sm:h-[3vh] lg:h-[5vh] mx-1"} hidden sm:block bg-text-alt-verba w-px`}
          ></div>
          <NavbarButton
            hide={false}
            APIHost={APIHost}
            Icon={FcCollaboration}
            iconSize={icon_size}
            title="Electores"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setPage="ELECTORES"
          />
          <NavbarButton
            hide={false}
            APIHost={APIHost}
            Icon={IoQrCodeSharp}
            iconSize={icon_size}
            title="Tickets"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setPage="TICKETS"
          />
          <NavbarButton
            hide={false}
            APIHost={APIHost}
            Icon={IoPeopleSharp}
            iconSize={icon_size}
            title="Usuarios"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setPage="USERS"
          />
          <NavbarButton
            hide={false}
            APIHost={APIHost}
            Icon={FcAssistant}
            iconSize={icon_size}
            title="Recolectores"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setPage="RECOLECTORES"
          />
           <NavbarButton
            hide={false}
            APIHost={APIHost}
            Icon={FcSalesPerformance }
            iconSize={icon_size}
            title="Sortear Ganadors"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setPage="STATUS"
          /> 
          <div
            className={` ${production ? "h-[0vh]" : "sm:h-[3vh] lg:h-[5vh] mx-1"} hidden sm:block bg-text-alt-verba w-px`}
          ></div>
           <NavbarButton
            hide={production}
            APIHost={APIHost}
            Icon={FcSmartphoneTablet}
            iconSize={icon_size}
            title="Lineas Telefonicas"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setPage="ADD"
          />
          <NavbarButton
            hide={production}
            APIHost={APIHost}
            Icon={IoListSharp}
            iconSize={icon_size}
            title="Organizaciones Políticas"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setPage="ORGANIZACIONES"
          />
          <NavbarButton
            hide={production}
            APIHost={APIHost}
            Icon={IoSettingsSharp}
            iconSize={icon_size}
            title="Configuracion"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setPage="SETTINGS"
          />
          <div
            className={`sm:h-[3vh] lg:h-[5vh] mx-1 hidden sm:block bg-text-alt-verba w-px`}
          ></div>
        </div>

        <div className="flex flex-row items-center sm:gap-1 lg:gap-5 justify-between">
          <div className="lg:hidden sm:flex md:ml-4 sm:mr-8">
            <ul className="menu md:menu-md sm:menu-sm sm:menu-horizontal bg-base-200 rounded-box bg-bg-alt-verba z-50">
              <li>
                <details>
                  <summary>
                    <LuMenu size={20} />
                  </summary>
                  <ul className="bg-bg-alt-verba">
                    <li onClick={() => setCurrentPage("ELECTORES")}>
                      <a>Electores</a>
                    </li>
                    <li onClick={() => setCurrentPage("TICKETS")}>
                      <a>Tickets</a>
                    </li>
                    <li onClick={() => setCurrentPage("USERS")}>
                      <a>Usuarios</a>
                    </li>
                    <li onClick={() => setCurrentPage("RECOLECTORES")}>
                      <a>Recolectores</a>
                    </li>
                    <li onClick={() => setCurrentPage("STATUS")}>
                      <a>Sorteos</a>
                    </li>
                    {!production && (
                      <li onClick={() => setCurrentPage("ADD")}>
                        <a>Líneas Telefónicas</a>
                      </li>
                    )}
                    {!production && (
                      <li onClick={() => setCurrentPage("ORGANIZACIONES")}>
                        <a>Organizaciones Políticas</a>
                      </li>
                    )}
                    {!production && (
                      <li onClick={() => setCurrentPage("SETTINGS")}>
                        <a>Settings</a>
                      </li>
                    )}
                  </ul>
                </details>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
