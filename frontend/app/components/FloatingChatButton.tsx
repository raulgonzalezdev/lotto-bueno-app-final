// FloatingChatButton.tsx
import React from 'react';
import { IoChatbubbleSharp /* , IoCloseSharp */ } from 'react-icons/io5';

interface FloatingChatButtonProps {
    isVisible: boolean;
    toggleVisibility: () => void;
    isAdmin: boolean;  // Nuevo prop para controlar la visibilidad basada en el modo admin
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ isVisible, toggleVisibility, isAdmin }) => {
    if (isAdmin) return null; // No mostrar el botón en modo admin

    // const Icon = isVisible ? IoCloseSharp : IoChatbubbleSharp;
    return (
        <div className="openChatButton floatingChatContainer" onClick={toggleVisibility}>
            <button className="floatingChatButton">
                <IoChatbubbleSharp size={24} />
            </button>
        </div>
    );
};

export default FloatingChatButton;
