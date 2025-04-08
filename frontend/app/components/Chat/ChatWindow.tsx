/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect } from "react";
import ChatInterfaceComponent from "./ChatInterfaceWindow";
import { IoMdClose } from "react-icons/io";
import { SettingsConfiguration } from "../Settings/types";
import { DocumentChunk } from "../Document/types";
import { RAGConfig } from "../RAG/types";
import { FaBars } from "react-icons/fa";
import LoginModal from '../login/Login';

interface ChatWindowProps {
  settingConfig: SettingsConfiguration;
  APIHost: string | null;
  isVisible: boolean;
  toggleVisibility: () => void;
  RAGConfig: RAGConfig | null;
  production: boolean;
  isAdmin: boolean;
  toggleAdmin: (isAdmin: boolean) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  APIHost,
  settingConfig,
  isVisible,
  toggleVisibility,
  RAGConfig,
  production,
  isAdmin,
  toggleAdmin
}) => {
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [context, setContext] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const emailFromCookies = getEmailFromCookies();
    if (emailFromCookies) {
      setEmail(emailFromCookies);
    }

    const sessionId = localStorage.getItem('SESSION_ID');
    if (sessionId) {
      const savedContext = localStorage.getItem('CHAT_CONTEXT');
      const savedChunks = localStorage.getItem('CHAT_CHUNKS');
      if (savedContext) setContext(savedContext);
      if (savedChunks) setChunks(JSON.parse(savedChunks));
      setStep(2);
    }
  }, []);

  const getEmailFromCookies = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; email=`);
    if (parts.length === 2) {
      const emailPart = parts.pop();
      if (emailPart) {
        return emailPart.split(';').shift();
      }
    }
  };

  const handleStartChat = () => {
    if (name && email) {
      document.cookie = `email=${email}; path=/; max-age=31536000`;
      setStep(2);
    }
  };

  useEffect(() => {
    if (step === 2) {
      localStorage.setItem('SESSION_ID', 'some-unique-session-id');
      localStorage.setItem('CHAT_CONTEXT', context);
      localStorage.setItem('CHAT_CHUNKS', JSON.stringify(chunks));
    }
  }, [step, context, chunks]);

  if (!isVisible) return null;

  return (
    <div className="chatWindowContainer">
      <div className="chatWindow">
        {step === 1 ? (
          <div className="chatIntro">
            <div className="chatHeader">
              <img src={settingConfig.Customization.settings.image.src} alt="Logo" className="logo" />
              <button onClick={toggleVisibility} className="chatCloseButton">
                <IoMdClose size={24} />
              </button>
            </div>
            <h2 className="chatTitle">{settingConfig.Customization.settings.title.text}</h2>
            <p className="chatSubtitle">{settingConfig.Customization.settings.subtitle.text}</p>
            <div className="inputGroup">
              <label className="inputLabel">Nombre</label>
              <input
                type="text"
                className="inputField"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="inputGroup">
              <label className="inputLabel">Email</label>
              <input
                type="email"
                className="inputField"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button onClick={handleStartChat} className="startChatButton">
              Iniciar conversación
            </button>
            <footer className="footer footer-center p-4 mt-8 bg-bg-verba text-text-alt-verba">
              <aside>
                <p>Build with ♥ and Lotto Bueno © 2024</p>
              </aside>
            </footer>
          </div>
        ) : (
          <div className="chatContent">
            <div className="chatHeader">
              <button onClick={toggleVisibility} className="chatCloseButton">
                <IoMdClose size={24} />
              </button>
              <div className="flex items-center gap-2">
                <img src={settingConfig.Customization.settings.image.src} alt="Avatar" className="avatar" />
                <div>
                  <h2 className="chatTitle">{settingConfig.Customization.settings.title.text}</h2>
                  <p className="chatSubtitle">{settingConfig.Customization.settings.subtitle.text}</p>
                </div>
              </div>
              <button onClick={() => setModalVisible(true)} className="menuButton">
                <FaBars size={24} />
              </button>
            </div>
            <div className="chatBody">
              <ChatInterfaceComponent
                setContext={setContext}
                production={production}
                RAGConfig={RAGConfig}
                settingConfig={settingConfig}
                APIHost={APIHost}
                setChunks={setChunks}
                setChunkTime={() => {}}
                setCurrentPage={() => {}}
                isAdmin={false}
                toggleAdmin={() => {}}
              />
            </div>
            <footer className="footer footer-center p-4 mt-8 bg-bg-verba text-text-alt-verba">
              <aside>
                <p>Build with ♥ and Lotto Bueno © 2024</p>
              </aside>
            </footer>
            {/* <LoginModal
              isVisible={isModalVisible}
              onClose={() => setModalVisible(false)}
              onAdminLogin={(isAdminStatus) => {
                toggleAdmin(isAdminStatus);
                setModalVisible(false);
              }}
              title={settingConfig.Customization.settings.title.text}
              subtitle={settingConfig.Customization.settings.subtitle.text}
              imageSrc={settingConfig.Customization.settings.image.src}
            /> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
